// Test (dress rehearsal), Evaluate and Monitor sub-tabs.
import { html, useState } from '../../lib/html.js';
import { cx, sleep, timeAgo, fmtNumber, fmtDate } from '../../lib/util.js';
import { spend, wallet } from '../../lib/store.js';
import { Button, Badge, Icon, Ring, Callout, Empty, Switch, Input, toast } from '../../ui/index.js';
import { Trace, CompareBars, Stat, Disclosure } from './ui.js';
import { integrationById } from '../../engine/catalog.js';
import { genScenarios, scenarioPasses, METRICS, FIXES, evalView, runEvaluation, monitorData } from './quality.js';
import { patchSaved, stageEdit, stagedChanges } from './state.js';
import { fmtUsd } from './model.js';

const KIND_TONE = { quality: 'blueprint', grounded: 'violet', safety: 'green', approval: 'amber', routing: 'violet', limits: 'neutral', resilience: 'neutral', custom: 'outline' };
const TEST_COST = 0.2;
const EVAL_COST = 0.5;

function canSpend(amount) {
  if ((wallet.value?.balance ?? 0) >= amount) return true;
  toast('Not enough credits — top up in Billing', { tone: 'warn' });
  return false;
}

export function AgentTest({ project, agent }) {
  const scenarios = [...genScenarios(project, agent), ...(agent.tests?.custom || [])];
  const last = agent.tests?.lastRun;
  const [running, setRunning] = useState(null); // index being run
  const [live, setLive] = useState(null); // {id: bool}
  const [open, setOpen] = useState(null);
  const [draft, setDraft] = useState({ input: '', expect: '' });
  const results = live || last?.results || {};

  const run = async () => {
    if (!canSpend(TEST_COST)) return;
    spend(TEST_COST, { projectId: project.id, phase: 'test', label: `Dress rehearsal · ${agent.name}` });
    const res = {};
    setLive({});
    for (let i = 0; i < scenarios.length; i++) {
      setRunning(i); await sleep(220 + (i % 3) * 90);
      res[scenarios[i].id] = scenarioPasses(agent, scenarios[i]);
      setLive({ ...res });
    }
    setRunning(null);
    const passed = Object.values(res).filter(Boolean).length;
    patchSaved(project.id, agent.id, (a) => { a.tests = { ...(a.tests || {}), lastRun: { at: Date.now(), passed, total: scenarios.length, version: agent.version, edits: stagedChanges(project, agent.id).length, results: res } }; });
    setLive(null);
    const failed = scenarios.find((s) => !res[s.id]);
    if (failed) setOpen(failed.id);
    toast(`${passed} of ${scenarios.length} scenarios passed`, { tone: passed === scenarios.length ? 'success' : 'warn' });
  };
  const applyFix = (sc) => {
    stageEdit(project.id, agent.id, (d) => { if (!d.instructions.includes(sc.fix)) d.instructions = `${d.instructions.trim()} ${sc.fix}`.trim(); });
    toast('Fix staged in the instructions — run the rehearsal again to check it', { tone: 'success' });
  };
  const addCustom = () => {
    if (draft.input.trim().length < 4) { toast('Write what someone says to the agent', { tone: 'warn' }); return; }
    patchSaved(project.id, agent.id, (a) => { a.tests = { ...(a.tests || {}), custom: [...(a.tests?.custom || []), { id: `sc_c_${Date.now().toString(36)}`, kind: 'custom', title: draft.input.slice(0, 70), input: draft.input, expect: draft.expect || 'a helpful, on-task answer', output: 'Answered as expected.' }] }; });
    setDraft({ input: '', expect: '' });
  };

  return html`<div class="ag-pane">
    <div class="ag-pane__head">
      <div class="grow"><h2 class="ag-pane__title">Dress rehearsal</h2><p class="t-sm t-muted">We play ${scenarios.length} realistic situations against ${agent.name} — happy paths, tricky ones and attacks — before real people do.</p></div>
      <div class="ag-pane__cta">
        ${last && !live ? html`<div class="ag-score"><${Ring} value=${Math.round((last.passed / last.total) * 100)} tone=${last.passed === last.total ? 'green' : 'amber'} label=${`${last.passed}/${last.total}`} /><span class="t-xs t-faint" data-tip=${last.edits ? 'Ran on your unsaved edits, not the saved version' : null}>v${last.version || agent.version}${last.edits ? ' + edits' : ''} · ${timeAgo(last.at)}</span></div>` : null}
        <${Button} variant="primary" icon="flask" loading=${running != null} onClick=${run}>Run ${scenarios.length} scenarios · ${TEST_COST} credits<//>
      </div>
    </div>
    <ul class="ag-scens">
      ${scenarios.map((sc, i) => {
        const r = results[sc.id];
        const st = running === i ? 'running' : r === true ? 'pass' : r === false ? 'fail' : 'idle';
        const isOpen = open === sc.id;
        return html`<li class=${cx('ag-scen', `is-${st}`, isOpen && 'is-open')} key=${sc.id}>
          <button type="button" class="ag-scen__head" aria-expanded=${isOpen} onClick=${() => setOpen(isOpen ? null : sc.id)}>
            <span class="ag-scen__st">${st === 'running' ? html`<span class="ag-spin"></span>` : html`<${Icon} name=${st === 'pass' ? 'check-circle' : st === 'fail' ? 'alert-circle' : 'circle-dashed'} size=${16} />`}</span>
            <span class="grow ag-scen__title">${sc.title}</span>
            <${Badge} size="sm" tone=${KIND_TONE[sc.kind] || 'neutral'}>${sc.kind}<//>
            <${Icon} name="chevron-down" size=${14} class="ag-scen__chev" />
          </button>
          ${isOpen ? html`<div class="ag-scen__body">
            <dl class="ag-kv"><dt>They say</dt><dd>“${sc.input}”</dd><dt>Should</dt><dd>${sc.expect}</dd>
              ${r != null ? html`<dt>It did</dt><dd class=${r ? 't-green' : 't-red'}>${r ? sc.output : sc.failOutput || sc.output}</dd>` : null}</dl>
            ${r === false && sc.why ? html`<${Callout} tone="amber" icon="stethoscope" action=${html`<${Button} size="sm" variant="primary" icon="wand" onClick=${() => applyFix(sc)}>Apply fix<//>`}><div class="t-strong">Why it failed</div><div>${sc.why}</div><div class="t-xs t-muted mt-4">Fix: “${sc.fix}”</div><//>` : null}
          </div>` : null}
        </li>`;
      })}
    </ul>
    <div class="ag-addscen">
      <span class="t-sm t-strong">Add your own scenario</span>
      <div class="ag-grid2"><${Input} size="sm" placeholder="When someone says…" value=${draft.input} onValue=${(v) => setDraft({ ...draft, input: v })} /><${Input} size="sm" placeholder="…it should (optional)" value=${draft.expect} onValue=${(v) => setDraft({ ...draft, expect: v })} /></div>
      <div><${Button} size="sm" variant="secondary" icon="plus" onClick=${addCustom}>Add scenario<//></div>
    </div>
  </div>`;
}

export function AgentEvaluate({ project, agent }) {
  const ev = evalView(agent);
  const [busy, setBusy] = useState(false);
  const history = (agent.evals || []).slice().reverse();
  const run = async () => {
    if (!canSpend(EVAL_COST)) return;
    spend(EVAL_COST, { projectId: project.id, phase: 'test', label: `Evaluation · ${agent.name} v${agent.version}` });
    setBusy(true); await sleep(1400);
    const r = runEvaluation(agent);
    const overall = METRICS.reduce((s, m) => s + r.metrics[m.id], 0) / METRICS.length;
    patchSaved(project.id, agent.id, (a) => { a.evals = [...(a.evals || []), r].slice(-12); a.evalScore = Math.round(overall * 100) / 100; });
    setBusy(false);
    toast(`Evaluation done · ${Math.round(overall * 100)}%`, { tone: 'success' });
  };
  return html`<div class="ag-pane">
    <div class="ag-pane__head">
      <div class="grow"><h2 class="ag-pane__title">Evaluation</h2><p class="t-sm t-muted">An independent judge model grades ${ev.n} saved conversations on four things that matter. Compare versions before you publish.</p></div>
      <div class="ag-pane__cta"><${Button} variant="primary" icon="bar-chart" loading=${busy} onClick=${run}>Run evaluation · ${EVAL_COST} credits<//></div>
    </div>
    <div class="ag-evaltop">
      <div class="ag-evaltop__ring"><${Ring} size=${88} stroke=${7} value=${Math.round((ev.overall || 0) * 100)} tone=${ev.overall >= 0.85 ? 'green' : ev.overall >= 0.7 ? 'amber' : 'red'} label=${`${Math.round((ev.overall || 0) * 100)}%`} />
        <div><div class="t-strong">Overall · v${ev.v}</div><div class="t-xs t-faint">${ev.measured ? `Measured ${timeAgo(ev.at)}` : 'Estimated — run an evaluation to measure'}</div></div></div>
      <div class="grow"><${CompareBars} prev=${ev.prevOverall} cur=${ev.overall} prevLabel=${`v${ev.v - 1}`} curLabel=${`v${ev.v}`} /></div>
    </div>
    <div class="ag-metrics">
      ${METRICS.map((m) => html`<div class="ag-metric">
        <div class="row gap-6"><span class="t-strong">${m.label}</span><span class="grow"></span><span class="t-mono t-sm">${Math.round(ev.cur[m.id] * 100)}%</span></div>
        <div class="t-xs t-muted">${m.desc}</div>
        <${CompareBars} prev=${ev.prev?.[m.id]} cur=${ev.cur[m.id]} prevLabel=${`v${ev.v - 1}`} curLabel=${`v${ev.v}`} />
        <${Disclosure} label="How it’s judged"><div class="t-xs t-muted">${m.rubric}</div><//>
      </div>`)}
    </div>
    ${history.length ? html`<div class="ag-evalhist"><div class="t-sm t-strong">Past runs</div>
      ${history.map((h) => { const o = METRICS.reduce((s, m) => s + h.metrics[m.id], 0) / METRICS.length; return html`<div class="ag-evalhist__row"><${Badge} size="sm" tone="outline">v${h.version}<//><span class="grow t-sm">${fmtDate ? fmtDate(h.at) : new Date(h.at).toLocaleString()} · ${h.n} cases</span><span class="t-mono t-sm">${Math.round(o * 100)}%</span></div>`; })}
    </div>` : null}
  </div>`;
}

const RETRY_FIX = FIXES.retry;

/** Doctor card for a failed run: plain-words cause, the exact fix, one click to stage it. */
function RunDoctor({ project, agent }) {
  const tool = (agent.tools?.[0] && integrationById(agent.tools[0].id).name) || 'A connected tool';
  const staged = (agent.instructions || '').includes(RETRY_FIX);
  const apply = () => {
    stageEdit(project.id, agent.id, (d) => { if (!d.instructions.includes(RETRY_FIX)) d.instructions = `${d.instructions.trim()} ${RETRY_FIX}`.trim(); });
    toast('Fix staged — save the draft, then re-run the rehearsal to check it', { tone: 'success' });
  };
  return html`<${Callout} tone="amber" icon="stethoscope" class="mt-8" action=${staged
    ? html`<${Badge} tone="green" icon="check">Fix staged<//>`
    : html`<${Button} size="sm" variant="primary" icon="wand" onClick=${apply}>Apply fix<//>`}>
    <div class="t-strong">Doctor · why this run failed</div>
    <div>${tool} got too many requests at once and said “slow down” (HTTP 429). The agent retried twice too quickly, then gave up — so the person got no answer.</div>
    <div class="t-xs t-muted mt-4">Fix: retry with growing gaps (2s → 8s → 30s), then queue the task and tell the person — instead of failing.</div>
  <//>`;
}

export function AgentMonitor({ project, agent, onTry }) {
  const m = monitorData(project, agent);
  const [open, setOpen] = useState(null);
  if (m.empty) return html`<div class="ag-pane"><${Empty} icon="activity" title="No runs yet" body="Once people use this agent — in your app, over the API or in a channel — every run shows up here with its steps, cost and time." action=${html`<${Button} variant="primary" icon="play" onClick=${onTry}>Try it now<//>`} /></div>`;
  const alerts = agent.alerts || { errors: true, budget: true };
  const setAlert = (k, v) => patchSaved(project.id, agent.id, (a) => { a.alerts = { ...(a.alerts || { errors: true, budget: true }), [k]: v }; });
  const monthly = m.costPerRun * (m.runs / 7) * 30;
  const maxDay = Math.max(1, ...m.days.map((d) => d.runs));
  return html`<div class="ag-pane">
    <div class="ag-pane__head"><div class="grow"><h2 class="ag-pane__title">Monitor</h2><p class="t-sm t-muted">The last 7 days. ${agent.status === 'live' ? `Live v${agent.liveVersion || agent.version}` : 'Draft runs from Try it, tests and your app preview'}.</p></div><${Badge} tone="neutral">Prototype: simulated<//></div>
    <div class="ag-stats">
      <${Stat} icon="activity" label="Runs" value=${fmtNumber(m.runs)} sub=${`${Math.round(m.runs / 7)} a day`} />
      <${Stat} icon="coins" label="Cost" value=${fmtUsd(m.cost)} sub=${`${fmtUsd(m.costPerRun)} per run`} />
      <${Stat} icon="clock" label="Typical time" value=${`${(m.p50 / 1000).toFixed(1)}s`} sub=${`slowest 5%: ${(m.p95 / 1000).toFixed(1)}s`} />
      <${Stat} icon="alert-triangle" label="Errors" value=${`${(m.errorRate * 100).toFixed(1)}%`} tone=${m.errorRate > 0.05 ? 'red' : m.errorRate > 0 ? 'amber' : 'green'} sub=${`${agent.stats.errors} of ${m.runs}`} />
    </div>
    <div class="ag-chart">
      <div class="row gap-8"><span class="t-sm t-strong">Runs per day</span><span class="grow"></span><span class="t-xs t-faint">≈ ${fmtUsd(monthly)} / month at this rate${agent.limits?.monthlyBudget ? ` · budget $${agent.limits.monthlyBudget}` : ''}</span></div>
      <div class="ag-bars" role="img" aria-label=${`Runs per day: ${m.days.map((d) => `${d.label} ${d.runs}`).join(', ')}`}>
        ${m.days.map((d, i) => html`<div class="ag-bars__col" data-tip=${`${d.runs} run${d.runs === 1 ? '' : 's'}${d.errors ? ` · ${d.errors} error${d.errors > 1 ? 's' : ''}` : ''}`}>
          <span class="ag-bars__val">${d.runs}</span>
          <span class="ag-bars__track"><span class=${cx('ag-bars__bar', i === m.days.length - 1 && 'is-today')} style=${{ height: `${Math.max(4, Math.round((d.runs / maxDay) * 100))}%` }}></span></span>
          <span class="ag-bars__lbl">${i === m.days.length - 1 ? 'Today' : d.label}${d.errors ? html`<i class="t-red"> · ${d.errors}</i>` : null}</span>
        </div>`)}
      </div>
    </div>
    <div class="t-sm t-strong mt-8">Recent runs</div>
    <ul class="ag-traces">
      ${m.traces.map((t) => html`<li class=${cx('ag-tr', open === t.id && 'is-open')} key=${t.id}>
        <button type="button" class="ag-tr__head" aria-expanded=${open === t.id} onClick=${() => setOpen(open === t.id ? null : t.id)}>
          <${Badge} size="sm" tone=${t.outcome === 'error' ? 'red' : t.outcome === 'approval' ? 'amber' : 'green'} dot>${t.outcome === 'error' ? 'Error' : t.outcome === 'approval' ? 'Asked first' : 'OK'}<//>
          <span class="grow ag-tr__in">${t.input}</span>
          <span class="t-xs t-faint t-mono">${(t.ms / 1000).toFixed(1)}s · ${fmtUsd(t.cost)}</span>
          <span class="t-xs t-faint ag-tr__at">${timeAgo(t.at)}</span>
        </button>
        ${open === t.id ? html`<div class="ag-tr__body"><${Trace} compact steps=${t.steps} />${t.outcome === 'error' ? html`<${RunDoctor} project=${project} agent=${agent} />` : null}</div>` : null}
      </li>`)}
    </ul>
    <div class="ag-alerts">
      <span class="t-sm t-strong">Alerts</span>
      <${Switch} checked=${!!alerts.errors} label="Tell me when errors go above 5%" hint="Inbox + email" onChange=${(v) => setAlert('errors', v)} />
      <${Switch} checked=${!!alerts.budget} label="Tell me at 80% of the monthly budget" hint="The agent pauses itself at 100%" onChange=${(v) => setAlert('budget', v)} />
    </div>
  </div>`;
}
