// Agent blocks: a real chat UI with an animated reasoning trace (guardrails, knowledge,
// tools, delegation) + inline approvals, and an activity feed of recent agent runs.
import { html, useState, useRef, useEffect } from '../../lib/html.js';
import { Icon } from '../../ui/icons.js';
import { cx, uid, sleep, timeAgo, fmtDuration } from '../../lib/util.js';
import { agentById, tableById } from '../../engine/schema.js';
import { agentReply } from '../../engine/agentsim.js';
import { approvalPhrase } from '../../engine/gen/kit.js';
import { gxEvents } from '../runtime.js';
import { useGx, Panel, SourceBadge, mdLite, BlockNote, Editable } from '../util.js';

const STEP_ICON = { think: 'brain', knowledge: 'book-open', tool: 'plug', delegate: 'bot', approval: 'lock', guardrail: 'shield-check' };

/** Runs agents for a block and animates their steps. runs: { [key]: run } */
export function useAgentRunner() {
  const ctx = useGx();
  const [runs, setRuns] = useState({});
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const patch = (key, p) => { if (alive.current) setRuns((r) => ({ ...r, [key]: { ...(r[key] || {}), ...p } })); };

  const run = async (key, agent, text, { history = [] } = {}) => {
    const startedAt = Date.now();
    patch(key, { status: 'running', text, steps: [], shown: 0, answer: null, startedAt, agentId: agent.id, approval: null, needsApproval: null });
    let res;
    try {
      res = await agentReply(ctx.project, agent.id, text, { history });
    } catch (e) {
      patch(key, { status: 'error', error: String(e?.message || e) });
      ctx.emit('error', `agent ${agent.name} failed: ${e?.message || e}`);
      return;
    }
    const steps = Array.isArray(res?.steps) ? res.steps : [];
    patch(key, { steps });
    for (let i = 0; i < steps.length; i++) {
      await sleep(Math.max(180, Math.min(620, (steps[i].ms || 300) * 0.35)));
      if (!alive.current) return;
      patch(key, { shown: i + 1 });
    }
    await sleep(200);
    const na = res?.needsApproval || null;
    patch(key, { status: 'done', answer: res?.text || '', cost: res?.cost || 0, needsApproval: na, approval: na ? 'pending' : null, ms: Date.now() - startedAt });
    ctx.emit('info', `agent ${agent.name} · ${steps.length} steps · $${(res?.cost || 0).toFixed(3)}${na ? ' · waiting for approval' : ''}`, { kind: 'agent', agent: agent.name, action: text, detail: steps.map((s) => s.label).slice(0, 3).join(' · '), cost: res?.cost || 0 });
  };
  const decide = (key, ok) => {
    patch(key, { approval: ok ? 'approved' : 'denied' });
    ctx.emit(ok ? 'info' : 'warn', `approval ${ok ? 'granted' : 'denied'} · ${runs[key]?.needsApproval?.action || 'action'}`);
  };
  const clear = (key) => setRuns((r) => { const { [key]: _, ...rest } = r; return rest; });
  return { runs, run, decide, clear };
}

function Trace({ steps, shown, running }) {
  return html`<ol class="gx-trace">
    ${steps.slice(0, shown).map((s, i) => html`<li class=${cx('gx-trace__step', `is-${s.kind}`)} key=${i}>
      <span class="gx-trace__ic"><${Icon} name=${STEP_ICON[s.kind] || 'circle-dot'} size=${12} /></span>
      <span class="gx-trace__label">${s.label}</span>
      ${s.detail ? html`<code class="gx-trace__detail">${s.detail}</code>` : null}
      <span class="gx-trace__ok"><${Icon} name="check" size=${11} stroke=${2.6} /></span>
    </li>`)}
    ${running ? html`<li class="gx-trace__step is-pending"><span class="gx-trace__ic"><span class="gx-dots"><i></i><i></i><i></i></span></span><span class="gx-trace__label">${shown ? 'Working…' : 'Thinking…'}</span></li>` : null}
  </ol>`;
}

function Approval({ run, agent, onDecide }) {
  const na = run.needsApproval;
  if (!na) return null;
  if (run.approval === 'approved') return html`<div class="gx-approval is-done"><${Icon} name="check-circle" size=${15} /><span><strong>Approved.</strong> Go-ahead given for ${approvalPhrase(na.action)}. Simulated: nothing was actually sent.</span></div>`;
  if (run.approval === 'denied') return html`<div class="gx-approval is-denied"><${Icon} name="x-circle" size=${15} /><span><strong>Denied.</strong> Nothing was sent.</span></div>`;
  return html`<div class="gx-approval">
    <div class="gx-approval__head"><${Icon} name="lock" size=${14} /><span><strong>${agent?.name || 'Agent'}</strong> needs your OK before ${approvalPhrase(na.action)} <code class="gx-approval__id">${na.action}</code></span></div>
    ${na.preview ? html`<div class="gx-approval__preview">${na.preview}</div>` : null}
    <div class="gx-approval__btns">
      <button class="gx-btn gx-btn--primary gx-btn--sm" onClick=${(e) => { e.stopPropagation(); onDecide(true); }}><${Icon} name="check" size=${13} /><span>Approve</span></button>
      <button class="gx-btn gx-btn--secondary gx-btn--sm" onClick=${(e) => { e.stopPropagation(); onDecide(false); }}><span>Deny</span></button>
      <span class="gx-approval__why">A person must approve this step</span>
    </div>
  </div>`;
}

/** One agent run: trace (collapses when done) + answer + approval. */
export function AgentRun({ run, agent, onClose, onDecide, compact }) {
  const [expanded, setExpanded] = useState(false);
  const running = run.status === 'running';
  const done = run.status === 'done';
  return html`<div class=${cx('gx-run', compact && 'gx-run--compact')} onClick=${(e) => e.stopPropagation()}>
    ${compact ? html`<div class="gx-run__head">
      <span class="gx-botav" style=${{ background: agent?.color }}><${Icon} name="bot" size=${12} /></span>
      <span class="gx-run__who">${agent?.name || 'Agent'}</span>
      <span class="gx-run__what">${run.text}</span>
      ${onClose && !running ? html`<button class="gx-iconbtn" onClick=${onClose} aria-label="Dismiss"><${Icon} name="x" size=${13} /></button>` : null}
    </div>` : null}
    ${run.status === 'error' ? html`<div class="gx-approval is-denied"><${Icon} name="alert-circle" size=${15} /><span>The agent hit a problem: ${run.error}</span></div>` : null}
    ${running || expanded ? html`<${Trace} steps=${run.steps || []} shown=${running ? run.shown : (run.steps || []).length} running=${running} />` : null}
    ${done ? html`
      ${run.steps?.length ? html`<button class="gx-run__sum" onClick=${() => setExpanded(!expanded)}>
        <${Icon} name="check-circle" size=${12} /><span>${run.steps.length} steps · ${fmtDuration(run.ms || 0)} · $${(run.cost || 0).toFixed(3)}</span>
        <${Icon} name=${expanded ? 'chevron-up' : 'chevron-down'} size=${12} />
      </button>` : null}
      <div class="gx-run__answer">${mdLite(run.answer)}</div>
      <${Approval} run=${run} agent=${agent} onDecide=${onDecide || (() => {})} />` : null}
  </div>`;
}

export function AgentChatBlock({ block }) {
  const ctx = useGx();
  const p = block.props || {};
  const agent = agentById(ctx.project, block.bind?.agent);
  const [msgs, setMsgs] = useState([]);
  const [draft, setDraft] = useState('');
  const runner = useAgentRunner();
  const bodyRef = useRef(null);
  const inert = ctx.isStatic || ctx.mode === 'wireframe';
  const busy = Object.values(runner.runs).some((r) => r.status === 'running');

  useEffect(() => { const el = bodyRef.current; if (el) el.scrollTop = el.scrollHeight; });

  if (!agent) return html`<${Panel} block=${block}><${BlockNote} icon="bot" title="No agent connected" body="This chat needs an agent. Ask Architect to connect one." /><//>`;

  const send = (text) => {
    const t = String(text || '').trim();
    if (!t || busy || inert) return;
    const id = uid('msg');
    const history = msgs.map((m) => ({ role: 'user', text: m.text }));
    setMsgs((m) => [...m, { id, text: t }]);
    setDraft('');
    runner.run(id, agent, t, { history });
  };

  const head = html`<div class="gx-chat__agent">
    <span class="gx-botav gx-botav--lg" style=${{ background: agent.color }}><${Icon} name="bot" size=${15} /></span>
    <div class="gx-chat__who">
      <${Editable} class="gx-card__title" value=${block.title || agent.name} onSave=${block.title !== undefined ? (v) => ctx.saveEdit(block.id, (b) => { b.title = v; }, 'chat title') : null} />
      <span class="gx-chat__role"><span class="gx-dot gx-dot--live"></span>${agent.name}${agent.kind === 'manager' && agent.delegatesTo?.length ? ` · leads ${agent.delegatesTo.length} specialists` : ''}</span>
    </div>
    ${msgs.length ? html`<button class="gx-iconbtn" title="New conversation" aria-label="New conversation" onClick=${() => { setMsgs([]); }} disabled=${busy}><${Icon} name="rotate-ccw" size=${14} /></button>` : null}
  </div>`;

  return html`<div class="gx-card gx-chat">
    ${head}
    <div class="gx-chat__body" ref=${bodyRef}>
      <div class="gx-msg gx-msg--bot"><div class="gx-bubble">${p.greeting ? mdLite(p.greeting) : `Hi! I’m ${agent.name}. ${agent.role}.`}</div></div>
      ${msgs.map((m) => { const run = runner.runs[m.id]; return html`<div key=${m.id}>
        <div class="gx-msg gx-msg--me"><div class="gx-bubble">${m.text}</div></div>
        ${run ? html`<div class="gx-msg gx-msg--bot"><div class="gx-bubble gx-bubble--run"><${AgentRun} run=${run} agent=${agent} onDecide=${(ok) => runner.decide(m.id, ok)} /></div></div>` : null}
      </div>`; })}
      ${!msgs.length && p.suggestions?.length ? html`<div class="gx-suggest">
        ${p.suggestions.map((s) => html`<button class="gx-suggest__chip" onClick=${() => send(s)} disabled=${inert}>${s}</button>`)}
      </div>` : null}
    </div>
    <form class="gx-chat__input" onSubmit=${(e) => { e.preventDefault(); send(draft); }}>
      <input value=${draft} onInput=${(e) => setDraft(e.currentTarget.value)} placeholder=${p.placeholder || `Message ${agent.name}…`} disabled=${inert} aria-label=${`Message ${agent.name}`} />
      <button type="submit" class="gx-send" disabled=${!draft.trim() || busy || inert} aria-label="Send"><${Icon} name=${busy ? 'loader' : 'arrow-up'} size=${15} class=${busy ? 'gx-rot' : ''} /></button>
    </form>
    <div class="gx-chat__foot">${ctx.live ? 'Demo agent · responses are simulated' : 'Prototype · simulated run · no real tools are called'}</div>
  </div>`;
}

export function AgentActivityBlock({ block }) {
  const ctx = useGx();
  const table = block.bind?.table ? tableById(ctx.project, block.bind.table) : null;
  const agent = block.bind?.agent ? agentById(ctx.project, block.bind.agent) : null;
  const limit = block.props?.limit || 5;
  const colorOf = (name) => ctx.project.agents?.find((a) => a.name === name)?.color || 'var(--gx-accent)';
  const session = ctx.isStatic ? [] : gxEvents.value.filter((e) => e.projectId === ctx.project.id && e.kind === 'agent').map((e) => ({ id: e.id, at: e.at, agent: e.agent, action: e.action, detail: e.detail, cost: e.cost, fresh: true }));
  let rows = table ? [...table.rows].sort((a, b) => (b.at || 0) - (a.at || 0)) : [];
  rows = [...session.reverse(), ...rows].slice(0, limit);
  if (!rows.length && agent?.stats) {
    rows = [{ id: 'st', at: null, agent: agent.name, action: `${agent.stats.runs} runs in the last 7 days`, detail: `${agent.stats.errors} errors · avg ${fmtDuration(agent.stats.latencyMs)}`, cost: agent.stats.cost }];
  }
  return html`<${Panel} block=${block} table=${table} flush actions=${!ctx.isStatic ? html`<span class="gx-live"><span class="gx-dot gx-dot--live"></span>Live</span>` : null}>
    ${rows.length ? html`<ul class="gx-feed">
      ${rows.map((r) => html`<li class=${cx('gx-feed__row', r.fresh && 'is-fresh')} key=${r.id}>
        <span class="gx-botav" style=${{ background: colorOf(r.agent) }}><${Icon} name="bot" size=${12} /></span>
        <div class="gx-feed__main">
          <div class="gx-feed__line"><strong>${r.agent}</strong> <span>${r.action}</span></div>
          ${r.detail ? html`<div class="gx-feed__steps">${String(r.detail).split(/\s[·→]\s/).slice(0, 4).map((s, i) => html`<code key=${i}>${s}</code>`)}</div>` : null}
          <div class="gx-feed__meta">${r.at ? timeAgo(r.at) : 'this week'}${r.cost != null ? ` · $${Number(r.cost).toFixed(2)}` : ''}${r.fresh ? ' · from this preview' : ''}</div>
        </div>
      </li>`)}
    </ul>` : html`<${BlockNote} icon="activity" title="No agent runs yet" body="Runs appear here as soon as an agent does something." />`}
  <//>`;
}
