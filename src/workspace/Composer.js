// Chat composer: autosizing input, + menu, @-mentions, context chip, mode / model / run-mode
// controls, live cost hint and a queue while a run is going.
import { html, useState, useEffect, useRef, useMemo } from '../lib/html.js';
import { updateProject } from '../lib/store.js';
import { navigate } from '../lib/router.js';
import { cx, fmtRange } from '../lib/util.js';
import { Icon, IconButton, Segmented, Menu, Badge, toast } from '../ui/index.js';
import { MODEL_TIERS, integrationById } from '../engine/catalog.js';
import { interpretEdit } from '../engine/intents.js';
import { sendMessage, queues, isPreBuild } from '../engine/conversation.js';
import { isActive } from '../engine/simulate.js';
import { connectGitHub } from '../lib/github.js';
import { composerText, composerContext, composerFocus } from './bus.js';
import { openIntegrationPicker, openMcpDialog } from './drawers/ConnectionsDrawer.js';

const MODES = [
  { value: 'ask', label: 'Ask', tip: 'Questions and advice — never changes anything' },
  { value: 'plan', label: 'Plan', tip: 'Proposes a change; nothing happens until you apply it' },
  { value: 'build', label: 'Build', tip: 'Makes the change — shows the cost first' },
];
const RUN_MODES = [
  { id: 'ask-every', label: 'Ask every time', desc: 'Confirm each change before it runs', icon: 'shield' },
  { id: 'ask-risky', label: 'Ask if risky', desc: 'Small, safe edits run straight away', icon: 'shield-check' },
  { id: 'autopilot', label: 'Autopilot', desc: 'Runs changes without asking', icon: 'zap' },
];
const CTX_ICON = { block: 'blocks', file: 'file-code', agent: 'bot', comment: 'message-circle', error: 'alert-circle', screen: 'layout-dashboard', table: 'database' };

/** Chat mode: before the first build we default to Plan, afterwards to Build (unless the user picked one). */
export function effectiveMode(p) {
  const s = p?.settings || {};
  if (!s.modeChosen && s.mode === 'plan' && !isPreBuild(p)) return 'build';
  return s.mode || 'build';
}

function mentionables(p) {
  return [
    ...(p.agents || []).map((a) => ({ icon: 'bot', label: a.name, sub: 'Agent' })),
    ...(p.screens || []).map((s) => ({ icon: 'layout-dashboard', label: s.title || s.name, sub: `Screen${s.route ? ` · ${s.route}` : ''}` })),
    ...(p.data?.tables || []).map((t) => ({ icon: 'database', label: t.name, sub: 'Table' })),
    ...(p.integrations || []).map((i) => ({ icon: 'plug', label: integrationById(i.id)?.name || i.id, sub: 'Integration' })),
  ].filter((x) => x.label);
}

export function Composer({ project }) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [mention, setMention] = useState(null); // { q, start, idx }
  const [dq, setDq] = useState('');
  const ta = useRef(null);
  const fileRef = useRef(null);
  const ctx = composerContext.value;
  const incoming = composerText.value;
  const focusTick = composerFocus.value;
  const mode = effectiveMode(project);
  const tier = MODEL_TIERS.find((t) => t.id === project.settings.modelTier) || MODEL_TIERS[1];
  const runMode = RUN_MODES.find((r) => r.id === project.settings.runMode) || RUN_MODES[1];
  const queued = (queues.value[project.id] || []).length;
  const busy = isActive(project);
  const answering = project.chat.some((m) => m.type === 'questions' && !m.data?.answered);

  const focusEnd = () => setTimeout(() => { const el = ta.current; if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }, 60);
  useEffect(() => { if (incoming) { setText(incoming); composerText.value = ''; focusEnd(); } }, [incoming]);
  useEffect(() => { if (focusTick) focusEnd(); }, [focusTick]);
  useEffect(() => {
    const el = ta.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [text]);
  useEffect(() => { const t = setTimeout(() => setDq(text.trim()), 250); return () => clearTimeout(t); }, [text]);

  const selection = ctx?.blockId ? { blockId: ctx.blockId, screenId: ctx.screenId } : ctx?.kind === 'block' ? { blockId: ctx.id, screenId: ctx.screenId } : null;
  const hint = useMemo(() => {
    if (dq.length < 4) return null;
    if (mode === 'ask') return { label: 'Free', tip: 'Ask mode never changes anything' };
    if (isPreBuild(project)) return { label: 'Free', tip: 'Changes to the plan are free before the first build' };
    let cr = null;
    try { cr = interpretEdit(project, dq, { selection })?.credits; } catch (e) { cr = null; }
    if (!cr) return null;
    if (mode === 'plan') return { label: `Free to plan · ≈${fmtRange(cr)} cr to apply`, tip: 'Plan mode proposes first — you pay only when you apply' };
    return { label: `≈ ${fmtRange(cr)} cr`, tip: 'Estimate — the exact cost is shown before anything is spent' };
  }, [dq, mode, project.updatedAt, selection?.blockId]);

  const setSetting = (patch) => updateProject(project.id, (d) => { Object.assign(d.settings, patch); }, { touch: false });

  // ---------- mentions ----------
  const all = useMemo(() => mentionables(project), [project.agents, project.screens, project.data, project.integrations]);
  const list = mention ? all.filter((x) => x.label.toLowerCase().includes(mention.q.toLowerCase())).slice(0, 8) : [];
  const detectMention = (el) => {
    const pos = el.selectionStart ?? el.value.length;
    const m = el.value.slice(0, pos).match(/(^|\s)@([\w-]*)$/);
    setMention(m ? { q: m[2], start: pos - m[2].length - 1, idx: 0 } : null);
  };
  const insertMention = (item) => {
    const el = ta.current;
    const pos = el ? el.selectionStart : text.length;
    const next = `${text.slice(0, mention.start)}@${item.label} ${text.slice(pos)}`;
    const caret = mention.start + item.label.length + 2;
    setText(next); setMention(null);
    setTimeout(() => { if (ta.current) { ta.current.focus(); ta.current.setSelectionRange(caret, caret); } }, 0);
  };

  // ---------- send ----------
  const send = () => {
    const t = text.trim();
    if (!t) return;
    const r = sendMessage(project.id, t, { mode, selection, context: ctx ? { kind: ctx.kind, id: ctx.id, label: ctx.label } : null, attachments: files });
    if (!r) return;
    setText(''); setFiles([]); setMention(null);
    composerContext.value = null;
    if (r.queued) toast('Queued — it runs as soon as the current run finishes', { tone: 'info' });
  };
  const onKey = (e) => {
    if (mention && list.length) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setMention({ ...mention, idx: (mention.idx + 1) % list.length }); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setMention({ ...mention, idx: (mention.idx - 1 + list.length) % list.length }); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insertMention(list[mention.idx]); return; }
      if (e.key === 'Escape') { e.preventDefault(); setMention(null); return; }
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); }
  };
  const onFiles = (e) => {
    const picked = Array.from(e.currentTarget.files || []).map((f) => ({ name: f.name, size: f.size, type: f.type }));
    if (picked.length) setFiles([...files, ...picked].slice(0, 8));
    e.currentTarget.value = '';
  };
  const ghConnect = async () => {
    try { await connectGitHub(); toast('GitHub connected — push your code from the GitHub menu', { tone: 'success' }); } catch (err) { toast('GitHub connection was cancelled', { tone: 'warn' }); }
  };

  const plusItems = [
    { label: 'Attach files', icon: 'paperclip', desc: 'Docs, screenshots or CSVs for context', onClick: () => fileRef.current && fileRef.current.click() },
    { label: 'Change theme', icon: 'palette', onClick: () => navigate(`/p/${project.id}/plan/design`) },
    { divider: true },
    { label: 'Connect an integration', icon: 'plug', desc: 'Gmail, HubSpot, Slack…', onClick: () => openIntegrationPicker(project.id) },
    { label: 'Add MCP server', icon: 'server', onClick: () => openMcpDialog(project.id) },
    { label: 'Connect GitHub', icon: 'github', onClick: ghConnect },
    { label: 'Import code or a design', icon: 'download', onClick: () => navigate('/start/import') },
  ];
  const placeholder = answering ? 'Answer the questions above…' : busy ? 'Queue a message for after this run…' : mode === 'ask' ? 'Ask anything about your app…' : 'Describe a change, or ask anything…';

  return html`<div class="ws-comp">
    <div class=${cx('ws-comp__box', mode === 'ask' && 'is-ask', mode === 'plan' && 'is-plan')}>
      ${ctx || files.length ? html`<div class="ws-comp__ctx">
        ${ctx ? html`<span class="ws-ctxchip"><${Icon} name=${CTX_ICON[ctx.kind] || 'at-sign'} size=${12} /><span class="t-truncate">${ctx.label}</span>
          <button type="button" aria-label="Remove context" onClick=${() => { composerContext.value = null; }}><${Icon} name="x" size=${11} /></button></span>` : null}
        ${files.map((f, i) => html`<span class="ws-ctxchip is-file" title="Prototype: files stay in your browser"><${Icon} name="paperclip" size=${12} /><span class="t-truncate">${f.name}</span>
          <button type="button" aria-label=${`Remove ${f.name}`} onClick=${() => setFiles(files.filter((_, j) => j !== i))}><${Icon} name="x" size=${11} /></button></span>`)}
      </div>` : null}
      ${mention && list.length ? html`<ul class="ws-mention" role="listbox" aria-label="Mention">
        ${list.map((x, i) => html`<li role="option" aria-selected=${i === mention.idx} class=${cx('ws-mention__item', i === mention.idx && 'is-active')}
          onMouseDown=${(e) => { e.preventDefault(); insertMention(x); }}>
          <${Icon} name=${x.icon} size=${13} /><b class="t-truncate">${x.label}</b><span class="t-xs t-faint t-truncate">${x.sub}</span>
        </li>`)}
      </ul>` : null}
      <textarea ref=${ta} class="ws-comp__input" rows="1" value=${text} placeholder=${placeholder} aria-label="Message Architect"
        onInput=${(e) => { setText(e.currentTarget.value); detectMention(e.currentTarget); }}
        onClick=${(e) => detectMention(e.currentTarget)} onKeyDown=${onKey} onBlur=${() => setTimeout(() => setMention(null), 120)}></textarea>
      <div class="ws-comp__bar">
        <${Menu} align="top-start" width=${250} items=${plusItems}
          trigger=${(o, toggle) => html`<${IconButton} icon="plus" label="Add…" size="sm" active=${o} onClick=${toggle} />`} />
        <${Segmented} size="sm" value=${mode} onChange=${(v) => setSetting({ mode: v, modeChosen: true })} options=${MODES} class="ws-comp__modes" />
        <${Menu} align="top-start" width=${250} items=${[{ section: 'Model' }, ...MODEL_TIERS.map((t) => ({ label: t.label, icon: t.icon, desc: t.desc, active: t.id === tier.id, onClick: () => setSetting({ modelTier: t.id }) }))]}
          trigger=${(o, toggle) => html`<button type="button" class=${cx('ws-comp__pick', o && 'is-open')} onClick=${toggle} data-tip=${`Model: ${tier.label}`} aria-label=${`Model: ${tier.label}`}><${Icon} name=${tier.icon} size=${13} /><span class="ws-comp__pickl">${tier.label}</span></button>`} />
        <${Menu} align="top-start" width=${270} items=${[{ section: 'When I make changes' }, ...RUN_MODES.map((r) => ({ label: r.label, icon: r.icon, desc: r.desc, active: r.id === runMode.id, onClick: () => setSetting({ runMode: r.id }) })), { divider: true }, { section: 'Deleting or overwriting always asks first' }]}
          trigger=${(o, toggle) => html`<button type="button" class=${cx('ws-comp__pick', o && 'is-open')} onClick=${toggle} data-tip=${runMode.label} aria-label=${`Run mode: ${runMode.label}`}><${Icon} name=${runMode.icon} size=${13} /></button>`} />
        <span class="grow"></span>
        <button type="button" class="ws-send" disabled=${!text.trim()} onClick=${send} aria-label=${busy ? 'Queue message' : 'Send'} data-tip=${busy ? 'Queue (runs after this one)' : 'Send (Enter)'}>
          <${Icon} name=${busy ? 'clock' : 'arrow-up'} size=${15} stroke=${2.4} />
        </button>
      </div>
    </div>
    <div class="ws-comp__foot">
      <span class="t-faint">Enter to send · Shift+Enter new line · @ to mention</span>
      <span class="grow"></span>
      ${queued ? html`<${Badge} size="sm" icon="clock" tip="Runs when the current run finishes">Queued ${queued}<//>` : null}
      ${hint ? html`<span class="ws-comp__cost" data-tip=${hint.tip}><${Icon} name="coins" size=${11} />${hint.label}</span>` : null}
    </div>
    <input type="file" multiple hidden ref=${fileRef} onChange=${onFiles} />
  </div>`;
}
