// Dialogs: framework picker, the four "New agent" flows (Describe · Template · Import · Framework)
// and the publish check. Dialogs never write to the project themselves — they hand a spec
// back through onCreate / onPick so the caller decides where it goes.
import { html, useState, useEffect, useMemo, useRef } from '../../lib/html.js';
import { cx, sleep } from '../../lib/util.js';
import { connections } from '../../lib/store.js';
import { Modal, openModal, Button, Textarea, Input, Badge, Icon, Callout, Menu, Checkbox, Spinner, toast } from '../../ui/index.js';
import { FRAMEWORKS, frameworkById } from '../../engine/catalog.js';
import { IntegrationTile } from '../../shells/ConnectSheet.js';
import { AGENT_TEMPLATES, agentFromTemplate, describeToSpec, DESCRIBE_EXAMPLES, normalizeAgent, humanizeAction, estCostPerRun, fmtUsd, riskyActions, toolConnection, TIER_MODEL } from './model.js';
import { detectImport, agentFromImport, IMPORT_SAMPLES, trustScan, applyTrustFixes, addImportedEnv } from './importer.js';
import { stageEdit } from './state.js';
import { navigate } from '../../lib/router.js';
import { AgentAvatar, FrameworkBadge, TierLabel } from './ui.js';
import { triggerType } from './model.js';

// ---------------------------------------------------------------------------
// Framework picker
// ---------------------------------------------------------------------------
function FrameworkGrid({ value, onChange }) {
  return html`<div class="ag-fwgrid" role="radiogroup" aria-label="Framework">
    ${FRAMEWORKS.map((f) => html`<button type="button" role="radio" aria-checked=${value === f.id} class=${cx('ag-fwcard', value === f.id && 'is-active')} onClick=${() => onChange(f.id)}>
      <div class="row gap-8"><span class="ag-fwcard__name">${f.name}</span>${f.badge ? html`<${Badge} size="sm" tone="blueprint">${f.badge}<//>` : null}<span class="grow"></span><span class="ag-fwcard__radio"></span></div>
      <div class="ag-fwcard__lang">${f.lang}</div>
      <p class="ag-fwcard__desc">${f.desc}</p>
      <div class="row gap-6 wrap mt-4">
        <${Badge} size="sm" tone=${f.roundTrip === 'full' ? 'green' : 'neutral'} icon=${f.roundTrip === 'full' ? 'refresh' : 'arrow-up-down'}>${f.roundTrip === 'full' ? 'Full round-trip' : 'Round-trips instructions, tools & model'}<//>
      </div>
      <div class="ag-fwcard__files">${f.files.join(' · ')}</div>
    </button>`)}
  </div>`;
}

function FrameworkPicker({ close, current, onPick, title, confirmLabel }) {
  const [sel, setSel] = useState(current || 'architect');
  const f = frameworkById(sel);
  return html`<${Modal} size="xl" title=${title || 'Where should this agent run?'} subtitle="Your agent is one open spec. Pick a framework and Architect generates its code — the card stays exactly the same, and you can switch back any time." icon="code" onClose=${() => close()}
    footer=${html`<span class="t-xs t-faint grow">${f.roundTrip === 'full' ? 'Edits in code sync back to the card.' : 'Custom code you add stays yours and is shown as locked on the card.'}</span><${Button} variant="ghost" onClick=${() => close()}>Cancel<//><${Button} variant="primary" onClick=${() => { onPick && onPick(sel); close(sel); }}>${confirmLabel || (sel === current ? 'Keep' : 'Use')} ${f.name.replace(' (open spec)', '')}<//>`}>
    <${FrameworkGrid} value=${sel} onChange=${setSel} />
  <//>`;
}
export function openFrameworkPicker(opts) { return openModal(FrameworkPicker, opts); }

// ---------------------------------------------------------------------------
// New agent
// ---------------------------------------------------------------------------
const MODES = [
  { id: 'describe', label: 'Describe', icon: 'wand' },
  { id: 'template', label: 'From template', icon: 'layout-grid' },
  { id: 'import', label: 'Import code', icon: 'upload' },
  { id: 'framework', label: 'Start in a framework', icon: 'code' },
];

/** Compact preview of a spec before it's added. */
export function SpecPreview({ agent, onRename, project }) {
  const risky = riskyActions(agent);
  return html`<div class="ag-preview anim-rise">
    <div class="row gap-12">
      <${AgentAvatar} agent=${agent} size="lg" />
      <div class="grow" style="min-width:0">
        ${onRename ? html`<input class="ag-preview__name" value=${agent.name} aria-label="Agent name" onInput=${(e) => onRename(e.currentTarget.value)} />` : html`<div class="ag-preview__name">${agent.name}</div>`}
        <div class="t-sm t-muted">${agent.role}</div>
      </div>
      <${Badge} tone="outline">Draft v1<//>
    </div>
    <dl class="ag-preview__grid">
      <dt>Brain</dt><dd><${TierLabel} tier=${agent.model.tier} /> <span class="t-faint">≈ ${fmtUsd(estCostPerRun(agent))} / run</span></dd>
      <dt>Can use</dt><dd>${agent.tools.length ? html`<span class="row gap-6 wrap">${agent.tools.map((t) => html`<span class="ag-toolpill"><${IntegrationTile} id=${t.id} size="sm" />${t.name || t.id}${toolConnection(project, t.id, connections.value) === 'needed' ? html`<span class="t-amber t-xs">· connect later</span>` : null}</span>`)}</span>` : html`<span class="t-faint">No tools yet — add them on the card</span>`}</dd>
      <dt>Asks first</dt><dd>${agent.approvals.length ? html`<span class="row gap-4 wrap">${agent.approvals.map((a) => html`<${Badge} size="sm" tone="amber" icon="shield">${humanizeAction(a)}<//>`)}</span>` : risky.length ? html`<span class="t-amber">Nothing — ${risky.length} risky action${risky.length > 1 ? 's' : ''} will run without asking</span>` : html`<span class="t-faint">Nothing risky to approve</span>`}</dd>
      <dt>Runs</dt><dd>${agent.triggers.map((t) => html`<span class="ag-trig"><${Icon} name=${triggerType(t.type).icon} size=${11} />${t.detail || triggerType(t.type).label}</span>`)}</dd>
      <dt>Returns</dt><dd class="t-mono t-xs">${agent.outputs.map((o) => o.key).join(', ') || '—'}</dd>
      ${agent.framework !== 'architect' ? html`<dt>Framework</dt><dd><${FrameworkBadge} id=${agent.framework} size="sm" /></dd>` : null}
    </dl>
  </div>`;
}

function DescribePane({ project, draft, setDraft }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const go = async () => {
    if (text.trim().length < 8) { toast('Describe what the agent should do in a sentence or two', { tone: 'warn' }); return; }
    setBusy(true); await sleep(650);
    setDraft(describeToSpec(text, project)); setBusy(false);
  };
  if (draft) return html`<div class="col gap-12">
    <div class="row gap-8"><${Icon} name="sparkles" size=${15} class="t-violet" /><span class="t-md">Here’s what I understood. Rename it or change anything later on its card.</span></div>
    <${SpecPreview} agent=${draft} project=${project} onRename=${(v) => setDraft({ ...draft, name: v })} />
    <button type="button" class="link t-sm" style="align-self:flex-start" onClick=${() => setDraft(null)}>← Change the description</button>
  </div>`;
  return html`<div class="col gap-12">
    <${Textarea} rows=${4} autofocus placeholder="e.g. Research competitors on the web every Monday and post a short summary to #product in Slack" value=${text} onValue=${setText}
      onKeyDown=${(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) go(); }} />
    <div class="row gap-6 wrap">${DESCRIBE_EXAMPLES.map((x) => html`<button type="button" class="chip chip--sm" onClick=${() => setText(x)}>${x}</button>`)}</div>
    <div class="row gap-8"><${Button} variant="primary" icon="wand" loading=${busy} onClick=${go}>Draft the agent<//><span class="t-xs t-faint">Free · nothing runs or costs anything until you try it</span></div>
  </div>`;
}

function TemplatePane({ project, draft, setDraft }) {
  const [sel, setSel] = useState(draft?.templateId || null);
  return html`<div class="col gap-12">
    <div class="ag-tplgrid">
      ${AGENT_TEMPLATES.map((t) => html`<button type="button" class=${cx('ag-tpl', sel === t.id && 'is-active')} style=${{ '--ag-c': t.color }} onClick=${() => { setSel(t.id); setDraft({ ...agentFromTemplate(t), templateId: t.id }); }}>
        <span class="ag-tpl__icon"><${Icon} name=${t.icon} size=${16} /></span>
        <span class="ag-tpl__name">${t.name}</span>
        <span class="ag-tpl__role">${t.role}</span>
        <span class="row gap-4 mt-4">${t.tools.map((x) => html`<${IntegrationTile} id=${x.id} size="sm" />`)}${t.approvals?.length ? html`<${Badge} size="sm" tone="amber" icon="shield">asks first<//>` : null}</span>
      </button>`)}
    </div>
    ${draft ? html`<${SpecPreview} agent=${draft} project=${project} onRename=${(v) => setDraft({ ...draft, name: v })} />` : null}
  </div>`;
}

function ImportPane({ project, draft, setDraft }) {
  const [code, setCode] = useState('');
  const [file, setFile] = useState('');
  const [drag, setDrag] = useState(false);
  const det = useMemo(() => detectImport(code, file), [code, file]);
  const scan = useMemo(() => (det ? trustScan(det, code) : null), [det]);
  useEffect(() => { setDraft(det ? { ...applyTrustFixes(agentFromImport(det, code, file), scan, code), detection: det } : null); }, [det]);
  const flagged = scan ? scan.items.filter((i) => i.level !== 'ok').length : 0;
  const read = async (f) => {
    if (!f) return;
    if (f.size > 400e3) { toast('That file is over 400 KB — paste the agent file itself', { tone: 'warn' }); return; }
    setFile(f.name); setCode(await f.text());
  };
  return html`<div class="col gap-12">
    <div class=${cx('ag-drop', drag && 'is-drag')} onDragOver=${(e) => { e.preventDefault(); setDrag(true); }} onDragLeave=${() => setDrag(false)} onDrop=${(e) => { e.preventDefault(); setDrag(false); read(e.dataTransfer.files?.[0]); }}>
      <textarea class="ag-drop__code" spellcheck="false" placeholder="Paste agent code (Python, TypeScript or YAML) — or drop a file here" value=${code} onInput=${(e) => { setCode(e.currentTarget.value); if (!file) setFile(''); }}></textarea>
      <div class="ag-drop__bar">
        <label class="btn btn--secondary btn--sm"><${Icon} name="upload" size=${14} /><span>Upload file</span><input type="file" accept=".py,.ts,.js,.mjs,.yaml,.yml,.md,.json" class="sr-only" onChange=${(e) => read(e.currentTarget.files?.[0])} /></label>
        <span class="t-xs t-faint">or try a sample:</span>
        ${IMPORT_SAMPLES.map((s) => html`<button type="button" class="chip chip--sm" onClick=${() => { setFile(s.file); setCode(s.code); }}>${s.label}</button>`)}
        ${file ? html`<span class="grow"></span><span class="t-xs t-mono t-faint">${file}</span>` : null}
      </div>
    </div>
    ${det ? html`<div class=${cx('ag-detect', det.recognised ? 'is-ok' : 'is-unknown')}>
      <div class="row gap-8"><${Icon} name=${det.recognised ? 'check-circle' : 'help'} size=${16} /><span class="t-strong">${det.summary}</span></div>
      <div class="ag-detect__meta">
        ${det.mapped.length ? html`<span>Mapped to connections: ${det.mapped.map((m) => html`<span class="ag-toolpill"><${IntegrationTile} id=${m.id} size="sm" />${m.name}</span>`)}</span>` : null}
        ${det.custom.length ? html`<span>Custom code tools (kept, locked on the card): <span class="t-mono">${det.custom.join(', ')}</span></span>` : null}
        ${det.approvalsFound ? html`<span>Human-in-the-loop found → added to “Must ask before”.</span>` : null}
        ${det.modelId ? html`<span>Model: <span class="t-mono">${det.modelId}</span></span>` : null}
      </div>
    </div>` : null}
    ${scan ? html`<div class=${cx('ag-trust', flagged && 'is-flagged')}>
      <div class="row gap-8"><${Icon} name="shield-check" size=${16} /><span class="t-strong">Trust check</span><span class="t-xs t-faint grow">Nothing imported runs until it passes</span>
        <${Badge} size="sm" tone=${flagged ? 'amber' : 'green'} icon=${flagged ? 'wand' : 'check'}>${flagged ? `${flagged} fixed on import` : 'Passed'}<//></div>
      <ul class="ag-trust__list">${scan.items.map((i) => html`<li class=${cx('ag-trust__item', `is-${i.level}`)}>
        <${Icon} name=${i.level === 'ok' ? 'check-circle' : i.level === 'high' ? 'alert-circle' : 'alert-triangle'} size=${14} />
        <div class="grow" style="min-width:0"><div>${i.label}</div>${i.fix ? html`<div class="t-xs t-muted">→ ${i.fix}</div>` : null}</div>
      </li>`)}</ul>
    </div>` : null}
    ${draft ? html`<${SpecPreview} agent=${draft} project=${project} onRename=${(v) => setDraft({ ...draft, name: v })} />` : null}
  </div>`;
}

function FrameworkPane({ project, draft, setDraft }) {
  const [fw, setFw] = useState(draft?.framework || 'langgraph');
  const [name, setName] = useState(draft?.name || 'New agent');
  useEffect(() => {
    setDraft(normalizeAgent({ name: name || 'New agent', framework: fw, role: `A ${frameworkById(fw).name} agent`, instructions: 'Describe what this agent should do, step by step.', outputs: [{ key: 'answer', type: 'text' }], triggers: [{ type: 'chat', detail: 'Chat panel' }], model: { tier: 'balanced', provider: 'Anthropic', model: TIER_MODEL.balanced, creativity: 0.3 }, stats: { runs: 0, cost: 0, latencyMs: 0, errors: 0 }, startView: 'code' }));
  }, [fw, name]);
  return html`<div class="col gap-12">
    <${Input} label="Name" value=${name} onValue=${setName} placeholder="e.g. Ticket Router" />
    <${FrameworkGrid} value=${fw} onChange=${setFw} />
  </div>`;
}

function NewAgentDialog({ close, project, mode: initial = 'describe', onCreate, standalone }) {
  const [mode, setMode] = useState(initial);
  const [drafts, setDrafts] = useState({});
  const managers = (project?.agents || []).filter((a) => a.kind === 'manager');
  const [delegate, setDelegate] = useState(true);
  const draft = drafts[mode] || null;
  const setDraft = (d) => setDrafts((x) => ({ ...x, [mode]: d }));
  const create = () => {
    if (!draft) return;
    const { templateId, detection, startView, ...spec } = draft;
    onCreate(normalizeAgent({ ...spec, name: (spec.name || '').trim() || 'New agent' }), { delegateFrom: delegate && managers[0] && mode !== 'framework' ? managers[0].id : null, view: startView || (mode === 'import' ? 'code' : null) });
    if (project?.id && spec.envRefs?.length) { addImportedEnv(project.id, spec); toast(`${spec.envRefs.length} secret${spec.envRefs.length > 1 ? 's' : ''} moved to environment variables`, { tone: 'success' }); }
    close(true);
  };
  const cta = { describe: 'Add as draft', template: 'Use template', import: 'Import as agent', framework: `Create in ${frameworkById(draft?.framework || 'langgraph').name.replace(' (open spec)', '')}` }[mode];
  // Describe has its own "Draft the agent" step — don't show a second, disabled primary button beside it.
  const showCta = !(mode === 'describe' && !draft);
  return html`<${Modal} size="xl" title="New agent" subtitle=${standalone ? 'Agents can live on their own — we’ll give it a home project you can add screens to later.' : `Adds a draft agent to ${project?.name || 'this project'}. Nothing runs until you try or publish it.`} icon="bot" onClose=${() => close(false)}
    footer=${html`
      ${managers.length && mode !== 'framework' && !standalone ? html`<span class="grow"><${Checkbox} checked=${delegate} onChange=${setDelegate} label=${`${managers[0].name} can hand work to it`} /></span>` : html`<span class="grow"></span>`}
      <${Button} variant="ghost" onClick=${() => close(false)}>Cancel<//>
      ${showCta ? html`<${Button} variant="primary" icon="plus" disabled=${!draft} onClick=${create}>${cta}<//>` : html`<span class="t-xs t-faint">Step 1 of 2 · describe it, then review</span>`}`}>
    <div class="ag-newtabs" role="tablist">
      ${MODES.map((m) => html`<button type="button" role="tab" aria-selected=${mode === m.id} class=${cx('ag-newtab', mode === m.id && 'is-active')} onClick=${() => setMode(m.id)}><${Icon} name=${m.icon} size=${14} />${m.label}</button>`)}
    </div>
    <div class="mt-16">
      ${mode === 'describe' ? html`<${DescribePane} project=${project} draft=${draft} setDraft=${setDraft} />`
        : mode === 'template' ? html`<${TemplatePane} project=${project} draft=${draft} setDraft=${setDraft} />`
          : mode === 'import' ? html`<${ImportPane} project=${project} draft=${draft} setDraft=${setDraft} />`
            : html`<${FrameworkPane} project=${project} draft=${draft} setDraft=${setDraft} />`}
    </div>
  <//>`;
}

/** Open the New agent dialog. onCreate(agentSpec, { delegateFrom, view }) */
export function openNewAgent({ project, mode = 'describe', onCreate, standalone = false }) {
  return openModal(NewAgentDialog, { project, mode, onCreate, standalone });
}

/** "New agent ▾" split menu used on the index and the library. */
export function NewAgentMenu({ project, onCreate, standalone, variant = 'primary', label = 'New agent' }) {
  const open = (mode) => openNewAgent({ project, mode, onCreate, standalone });
  return html`<${Menu} width=${260} items=${[
    { label: 'Describe it', icon: 'wand', desc: 'Say what it should do in plain words', onClick: () => open('describe') },
    { label: 'From a template', icon: 'layout-grid', desc: 'Researcher, Support triage, Scheduler…', onClick: () => open('template') },
    { label: 'Import code', icon: 'upload', desc: 'LangGraph, CrewAI, Agents SDK, ADK, Mastra…', onClick: () => open('import') },
    { label: 'Start in a framework', icon: 'code', desc: 'Blank agent, code first', onClick: () => open('framework') },
  ]} trigger=${(o, toggle) => html`<${Button} variant=${variant} icon="plus" iconRight="chevron-down" onClick=${toggle} aria-expanded=${o}>${label}<//>`} />`;
}

// ---------------------------------------------------------------------------
// Publish check
// ---------------------------------------------------------------------------
function PublishDialog({ close, project, agent, changes, onConfirm, onConnect }) {
  const v = (agent.version || 1) + 1;
  const missing = (agent.tools || []).filter((t) => !t.mcp && toolConnection(project, t.id, connections.value) === 'needed');
  const risky = riskyActions(agent).filter((r) => !(agent.approvals || []).includes(r.action));
  const last = agent.tests?.lastRun;
  const [fixed, setFixed] = useState({});
  const go = (tab) => { close(false); navigate(`/p/${project.id}/agents/${agent.id}/${tab}`); };
  const fixRisky = () => { stageEdit(project.id, agent.id, (d) => { d.approvals = [...new Set([...(d.approvals || []), ...risky.map((r) => r.action)])]; }); setFixed((f) => ({ ...f, risky: true })); };
  const fixBudget = () => { stageEdit(project.id, agent.id, (d) => { d.limits = { ...(d.limits || {}), monthlyBudget: 20 }; }); setFixed((f) => ({ ...f, budget: true })); };
  const checks = [
    { ok: !!last && last.passed === last.total, warn: !!last && last.passed < last.total, label: last ? `Dress rehearsal: ${last.passed} of ${last.total} passed` : 'Dress rehearsal not run yet', hint: last ? (last.passed < last.total ? 'Open Test — each failure has a one-click fix.' : null) : 'Run the Test tab first to catch surprises (≈0.2 credits).', action: !last || last.passed < last.total ? { label: last ? 'See failures' : 'Run rehearsal', icon: 'flask', onClick: () => go('test') } : null },
    { ok: agent.evalScore != null && agent.evalScore >= 0.8, warn: agent.evalScore != null && agent.evalScore < 0.8, label: agent.evalScore != null ? `Evaluation score ${Math.round(agent.evalScore * 100)}%` : 'Not evaluated yet', action: agent.evalScore == null || agent.evalScore < 0.8 ? { label: 'Evaluate', icon: 'bar-chart', onClick: () => go('evaluate') } : null },
    { ok: !missing.length, warn: !!missing.length, label: missing.length ? `${missing.map((t) => t.name || t.id).join(', ')} not connected — those steps will fail for real users` : 'Every tool is connected', action: missing[0] ? { label: `Connect ${missing[0].name || missing[0].id}`, icon: 'plug', onClick: () => onConnect(missing[0].id) } : null },
    fixed.risky
      ? { ok: true, label: `${risky.map((r) => humanizeAction(r.action)).join(', ')} now ask${risky.length > 1 ? '' : 's'} a person first`, hint: 'Staged — included in this publish.' }
      : { ok: !risky.length, warn: !!risky.length, label: risky.length ? `${risky.map((r) => humanizeAction(r.action)).join(', ')} will run without asking anyone` : 'Risky actions ask a person first', action: risky.length ? { label: 'Make them ask first', icon: 'shield', primary: true, onClick: fixRisky } : null },
    fixed.budget
      ? { ok: true, label: 'Budget: $20 per month', hint: 'Staged — the agent pauses itself and emails you at 100%.' }
      : { ok: agent.limits?.monthlyBudget != null, warn: agent.limits?.monthlyBudget == null, label: agent.limits?.monthlyBudget != null ? `Budget: ${fmtUsd(agent.limits.costPerRun)} per run · $${agent.limits.monthlyBudget} per month` : 'No monthly budget set', action: agent.limits?.monthlyBudget == null ? { label: 'Set $20 / month', icon: 'coins', primary: true, onClick: fixBudget } : null },
  ];
  const warnings = checks.filter((c) => c.warn).length;
  const oneClick = checks.filter((c) => c.warn && c.action?.primary);
  const fixAll = () => oneClick.forEach((c) => c.action.onClick());
  return html`<${Modal} title=${`Publish ${agent.name} v${v}`} subtitle="Publishing makes this version the one your app, API and channels use. A checkpoint is saved first, so you can roll back." icon="rocket" onClose=${() => close(false)}
    footer=${html`<span class="t-xs t-faint grow">${(() => { const n = changes.length + Object.keys(fixed).length; return n ? `Includes ${n} unsaved change${n > 1 ? 's' : ''}` : ''; })()}</span><${Button} variant="ghost" onClick=${() => close(false)}>Cancel<//><${Button} variant=${warnings ? 'ink' : 'success'} icon="rocket" onClick=${() => { onConfirm(); close(true); }}>${warnings ? 'Publish anyway' : `Publish v${v}`}<//>`}>
    <ul class="ag-checks">
      ${checks.map((c) => html`<li class=${cx('ag-check', c.ok ? 'is-ok' : c.warn ? 'is-warn' : 'is-todo')}>
        <${Icon} name=${c.ok ? 'check-circle' : c.warn ? 'alert-triangle' : 'circle-dashed'} size=${16} />
        <div class="grow"><div>${c.label}</div>${c.hint ? html`<div class="t-xs t-faint">${c.hint}</div>` : null}</div>
        ${c.action ? html`<${Button} size="sm" variant=${c.action.primary ? 'primary' : 'secondary'} icon=${c.action.icon} onClick=${c.action.onClick}>${c.action.label}<//>` : null}
      </li>`)}
    </ul>
    ${warnings ? html`<${Callout} tone="amber" icon="info" class="mt-12" action=${oneClick.length > 1 ? html`<${Button} size="sm" variant="primary" icon="wand" onClick=${fixAll}>Fix ${oneClick.length} for me<//>` : null}>${warnings} thing${warnings > 1 ? 's' : ''} to look at. You can still publish — every run is traced and you can roll back from History.<//>` : html`<${Callout} tone="green" icon="shield-check" class="mt-12">Looks ready. Runs are billed per use and stop at your limits.<//>`}
  <//>`;
}
export function openPublishAgent(opts) { return openModal(PublishDialog, opts); }
