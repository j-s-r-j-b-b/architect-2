// Insights tab: KPIs with sparklines, agent runs & traces, errors → "Ask Architect to fix", cost vs forecast.
import { html, useState, useMemo } from '../../lib/html.js';
import { Button, Icon, Badge, Callout, Segmented, Slider, Empty, StatusPill, Switch, toast } from '../../ui/index.js';
import { tableById } from '../../engine/schema.js';
import { integrationById } from '../../engine/catalog.js';
import { updateProject } from '../../lib/store.js';
import { navigate } from '../../lib/router.js';
import { askArchitect } from '../bus.js';
import { FIXES } from '../agents/quality.js';
import { effectiveAgent, stageEdit } from '../agents/state.js';
import { cx, seeded, fmtNumber, fmtMoney, timeAgo, plural } from '../../lib/util.js';

const hash = (s = '') => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

function series(rnd, n, base, spread = 0.35, trend = 0.02) {
  return Array.from({ length: n }, (_, i) => Math.max(0, Math.round(base * (1 + trend * i) * (1 - spread / 2 + rnd() * spread))));
}

function Sparkline({ data, tone = 'blueprint', w = 120, h = 32 }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1), min = Math.min(...data, 0);
  const pts = data.map((v, i) => [(i / Math.max(1, data.length - 1)) * w, h - 3 - ((v - min) / Math.max(1, max - min)) * (h - 6)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  return html`<svg class=${cx('in-spark', `in-spark--${tone}`)} viewBox=${`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
    <path d=${`${line} L${w} ${h} L0 ${h} Z`} class="in-spark__area" /><path d=${line} class="in-spark__line" />
    <circle cx=${pts[pts.length - 1][0]} cy=${pts[pts.length - 1][1]} r="2.5" class="in-spark__dot" />
  </svg>`;
}

function Kpi({ label, value, delta, data, tone, good = 'up', icon }) {
  const up = delta >= 0;
  const positive = good === 'up' ? up : !up;
  return html`<div class="in-kpi">
    <div class="row gap-6 t-xs t-muted"><${Icon} name=${icon} size=${13} />${label}</div>
    <div class="row gap-8 mt-4"><span class="in-kpi__value">${value}</span>${delta != null ? html`<span class=${cx('in-delta', positive ? 'is-good' : 'is-bad')}><${Icon} name=${up ? 'trending-up' : 'trending-down'} size=${12} />${Math.abs(delta)}%</span>` : null}</div>
    <${Sparkline} data=${data} tone=${tone} />
  </div>`;
}

function Trace({ run }) {
  return html`<div class="in-trace">${run.steps.map((s, i) => html`<div class=${cx('in-trace__step', s.error && 'is-error')}>
    <span class="in-trace__dot">${s.error ? html`<${Icon} name="x" size=${10} />` : i + 1}</span>
    <span class="grow t-sm">${s.label}</span>
    <span class="in-trace__bar"><span style=${{ width: `${Math.min(100, (s.ms / run.ms) * 100)}%` }}></span></span>
    <span class="t-xs t-faint t-tabular">${s.ms} ms</span>
  </div>`)}</div>`;
}

export default function InsightsTab({ project: p }) {
  const [range, setRange] = useState('7');
  const [openRun, setOpenRun] = useState(null);
  const days = Number(range);
  const live = p.status === 'live';
  const agents = p.agents || [];

  const m = useMemo(() => {
    const rnd = seeded(hash(p.id) + days);
    const runs7 = agents.reduce((n, a) => n + (a.stats?.runs || 0), 0) || (agents.length ? 24 * agents.length : 0);
    const cost7 = agents.reduce((n, a) => n + (a.stats?.cost || 0), 0) || runs7 * 0.02;
    const errs = agents.reduce((n, a) => n + (a.stats?.errors || 0), 0);
    const lat = agents.length ? Math.round(agents.reduce((n, a) => n + (a.stats?.latencyMs || 2500), 0) / agents.length) : 0;
    const scale = days / 7;
    const visitors = series(rnd, days, live ? 140 : 9, 0.5, 0.015);
    const runs = series(rnd, days, Math.max(1, runs7 / 7), 0.45);
    const latency = series(rnd, days, lat || 1, 0.25, -0.005);
    const spend = runs.map((r) => +(r * (cost7 / Math.max(1, runs7))).toFixed(2));
    const success = runs7 ? Math.max(80, +(100 - (errs / runs7) * 100).toFixed(1)) : 100;
    return { rnd, runs7, cost7, errs: Math.round(errs * scale), lat, visitors, runs, latency, spend, success, perRun: cost7 / Math.max(1, runs7), d: () => Math.round(rnd() * 30 - 8) };
  }, [p.id, days, agents.length, live]);

  const traces = useMemo(() => {
    const rnd = seeded(hash(p.id) + 3);
    const src = tableById(p, 'agent_runs')?.rows || agents.map((a, i) => ({ id: `r${i}`, at: Date.now() - (i + 1) * 47 * 60e3, agent: a.name, action: a.role || 'Handled a request', detail: (a.tools || []).map((t) => `${t.id}.${t.actions?.[0] || 'call'}`).join(' → ') || 'model → answer', cost: a.limits?.costPerRun || 0.02 }));
    return src.slice(0, 12).map((r, i) => {
      const labels = String(r.detail || 'model → answer').split(/\s*(?:→|·)\s*/).filter(Boolean);
      const steps = [{ label: 'Read request & context' }, ...labels.map((l) => ({ label: l })), { label: 'Write result' }].map((s) => ({ ...s, ms: 80 + Math.round(rnd() * 900) }));
      const failed = m.errs > 0 && i === 2;
      if (failed) steps[Math.min(2, steps.length - 1)].error = true;
      return { ...r, steps, failed, ms: steps.reduce((n, s) => n + s.ms, 0) };
    });
  }, [p.id, agents.length, m.errs]);

  const errors = agents.filter((a) => a.stats?.errors > 0).map((a) => {
    const tool = a.tools?.[0];
    const msg = tool ? `${tool.id}.${tool.actions?.[0] || 'call'} timed out after 10s` : 'Model output failed the output contract (missing field)';
    const toolName = tool ? integrationById(tool.id).name : '';
    const cause = tool ? `${toolName} was slow to answer, and the agent gave up after one try — so the person got no reply.` : 'The agent replied without one of the fields your screens need, so the screen showed a blank.';
    const fixPlain = tool ? 'Retry with growing gaps (2s → 8s → 30s), then queue the task and tell the person.' : 'Check every required field before replying; ask for anything missing instead of guessing.';
    return { id: `err_${a.id}`, agent: a, msg, cause, fixPlain, fix: tool ? FIXES.retry : FIXES.contract, count: a.stats.errors, at: Date.now() - (a.stats.errors * 3.1 + 2) * 36e5 };
  });

  const [perDay, setPerDay] = useState(() => Math.max(10, Math.round((m.runs7 || 70) / 7 / 10) * 10));
  const monthly = perDay * 30 * m.perRun;
  const actualMonthly = (m.runs7 / 7) * 30 * m.perRun;
  const weeks = [0, 1, 2, 3].map((i) => +(m.cost7 * (0.7 + i * 0.1)).toFixed(2));
  const forecast = [1, 2, 3, 4].map(() => +(perDay * 7 * m.perRun).toFixed(2));
  const maxBar = Math.max(...weeks, ...forecast, 0.01);

  return html`<div class="in">
    <div class="in-head">
      <div class="grow"><h2 class="t-xl t-strong">Insights</h2><p class="t-sm t-muted">How ${p.name} is used, what the agents did and what it costs.</p></div>
      <${Segmented} size="sm" value=${range} onChange=${setRange} options=${[{ value: '7', label: '7 days' }, { value: '30', label: '30 days' }]} />
    </div>
    ${!live ? html`<${Callout} tone="blueprint" icon="info" class="mb-16" action=${html`<${Button} size="sm" icon="rocket" href=${`/p/${p.id}/launch`}>Publish<//>`}>
      <b>Showing preview traffic</b> — publish to see real usage. <span class="t-muted">Numbers below come from your own test runs and simulated visitors.</span>
    <//>` : null}

    <div class="in-kpis">
      <${Kpi} icon="users" label=${live ? 'Visitors' : 'Preview visits'} value=${fmtNumber(m.visitors.reduce((a, b) => a + b, 0))} delta=${m.d()} data=${m.visitors} />
      <${Kpi} icon="bot" label="Agent runs" value=${fmtNumber(m.runs.reduce((a, b) => a + b, 0))} delta=${m.d()} data=${m.runs} tone="violet" />
      <${Kpi} icon="check-circle" label="Success rate" value=${`${m.success}%`} delta=${m.errs ? -1 : 0} data=${m.runs.map((r, i) => 100 - (i % 5 === 3 && m.errs ? 3 : 0))} tone="green" />
      <${Kpi} icon="timer" label="Avg response" value=${m.lat ? `${(m.lat / 1000).toFixed(1)}s` : '—'} delta=${-4} good="down" data=${m.latency} tone="amber" />
      <${Kpi} icon="coins" label="Model spend" value=${fmtMoney(m.spend.reduce((a, b) => a + b, 0))} delta=${m.d()} good="down" data=${m.spend} />
    </div>

    <div class="in-grid">
      <section class="in-card in-card--runs">
        <div class="in-card__head"><${Icon} name="activity" size=${15} /><span class="t-strong grow">Agent runs</span><span class="t-xs t-faint">${plural(traces.length, 'recent run')} · click to see the trace</span></div>
        ${traces.length ? html`<div class="in-runs">${traces.map((r) => html`<div class=${cx('in-run', openRun === r.id && 'is-open')}>
          <button type="button" class="in-run__row" onClick=${() => setOpenRun(openRun === r.id ? null : r.id)} aria-expanded=${openRun === r.id}>
            <${Icon} name=${openRun === r.id ? 'chevron-down' : 'chevron-right'} size=${14} class="t-faint" />
            <span class=${cx('in-run__status', r.failed && 'is-error')}></span>
            <span class="grow col gap-2" style="min-width:0"><span class="t-sm t-truncate">${r.action}</span><span class="t-xs t-faint t-truncate">${r.agent} · ${timeAgo(r.at)}</span></span>
            <span class="t-xs t-muted t-tabular in-run__meta">${(r.ms / 1000).toFixed(1)}s</span>
            <span class="t-xs t-muted t-tabular in-run__meta">${fmtMoney(r.cost || 0)}</span>
          </button>
          ${openRun === r.id ? html`<${Trace} run=${r} />` : null}
        </div>`)}</div>` : html`<${Empty} icon="bot" title="No agent runs yet" body="Runs appear here as soon as someone uses an agent in the preview." />`}
      </section>

      <section class="in-card">
        <div class="in-card__head"><${Icon} name="alert-triangle" size=${15} /><span class="t-strong grow">Errors</span>${errors.length ? html`<${Badge} tone="red" size="sm">${errors.reduce((n, e) => n + e.count, 0)}<//>` : null}</div>
        ${errors.length ? errors.map((e) => {
          const staged = (effectiveAgent(p, e.agent.id)?.instructions || '').includes(e.fix);
          const apply = () => { stageEdit(p.id, e.agent.id, (d) => { if (!d.instructions.includes(e.fix)) d.instructions = `${d.instructions.trim()} ${e.fix}`.trim(); }); toast(`Fix staged in ${e.agent.name} — save and re-test it`, { tone: 'success', action: { label: 'Open agent', onClick: () => navigate(`/p/${p.id}/agents/${e.agent.id}/test`) } }); };
          return html`<div class="in-err">
          <div class="row gap-8"><span class="t-sm t-strong grow t-mono in-err__msg">${e.msg}</span><span class="t-xs t-faint">${e.count}×</span></div>
          <div class="t-xs t-muted mt-4"><a class="in-link" href=${`/p/${p.id}/agents/${e.agent.id}/monitor`}>${e.agent.name}</a> · last seen ${timeAgo(e.at)}</div>
          <dl class="in-doc"><dt><${Icon} name="stethoscope" size=${12} />Cause</dt><dd>${e.cause}</dd><dt><${Icon} name="wand" size=${12} />Fix</dt><dd>${e.fixPlain}</dd></dl>
          <div class="row gap-8 mt-8 wrap">
            ${staged ? html`<${Badge} tone="green" icon="check">Fix staged<//>` : html`<${Button} size="sm" variant="primary" icon="wand" onClick=${apply}>Apply fix<//>`}
            <${Button} size="sm" variant="ghost" icon="sparkles" onClick=${() => askArchitect(`Fix this error in ${e.agent.name}: “${e.msg}”. It happened ${e.count}× in the last 7 days — find the cause, add a retry or fallback, and test it.`, { kind: 'error', id: e.id, label: e.msg })}>Ask Architect<//>
            <span class="t-xs t-faint">Fixes for problems Architect caused are free.</span>
          </div>
        </div>`; }) : html`<div class="in-ok"><${Icon} name="check-circle" size=${16} />No errors in this period.</div>`}
        <div class="in-card__head mt-16"><${Icon} name="bot" size=${15} /><span class="t-strong grow">By agent</span></div>
        ${agents.length ? html`<table class="in-table"><thead><tr><th>Agent</th><th>Runs</th><th>Errors</th><th>Eval</th></tr></thead><tbody>
          ${agents.map((a) => html`<tr class="in-table__row" onClick=${(e) => { if (!e.target.closest('a')) navigate(`/p/${p.id}/agents/${a.id}/monitor`); }}><td><a class="row gap-6 in-link" href=${`/p/${p.id}/agents/${a.id}/monitor`} data-tip="Open this agent’s runs"><span class="in-agent-dot" style=${{ background: a.color || 'var(--violet)' }}></span><span class="t-truncate">${a.name}</span></a></td><td class="t-tabular">${fmtNumber(Math.round((a.stats?.runs || 0) * days / 7))}</td><td class="t-tabular">${Math.round((a.stats?.errors || 0) * days / 7)}</td><td>${a.evalScore != null ? html`<${Badge} size="sm" tone=${a.evalScore >= 0.85 ? 'green' : 'amber'}>${Math.round(a.evalScore * 100)}%<//>` : html`<span class="t-faint">—</span>`}</td></tr>`)}
        </tbody></table>` : html`<div class="t-sm t-muted">No agents in this app.</div>`}
      </section>
    </div>

    <section class="in-card mt-16">
      <div class="in-card__head"><${Icon} name="bar-chart" size=${15} /><span class="t-strong grow">Cost vs forecast</span><${StatusPill} status=${live ? 'real' : 'sample'} size="sm" label=${live ? 'Live usage' : 'Preview estimate'} /></div>
      <div class="in-cost">
        <div class="in-cost__chart" role="img" aria-label="Weekly model cost: last four weeks and forecast">
          ${[...weeks.map((v, i) => ({ v, l: ['−3 wk', '−2 wk', 'Last wk', 'This wk'][i], f: false })), ...forecast.map((v, i) => ({ v, l: `+${i + 1} wk`, f: true }))].map((b) => html`<div class="in-bar">
            <span class="in-bar__val t-xs t-tabular">${fmtMoney(b.v)}</span>
            <span class="in-bar__track"><span class=${cx('in-bar__col', b.f && 'is-forecast')} style=${{ height: `${Math.max(3, (b.v / maxBar) * 100)}%` }}></span></span>
            <span class="t-xs t-faint t-nowrap">${b.l}</span>
          </div>`)}
        </div>
        <div class="in-cost__side">
          <div class="field__label">If agents run <b class="t-tabular">${fmtNumber(perDay)}</b> times a day</div>
          <${Slider} min=${10} max=${5000} step=${10} value=${perDay} onChange=${setPerDay} />
          <div class="in-cost__num"><span class="t-2xl t-strong t-tabular">${fmtMoney(monthly)}</span><span class="t-sm t-muted"> / month</span></div>
          <div class="t-xs t-muted">${fmtMoney(m.perRun)} per run on average · today’s pace ≈ ${fmtMoney(actualMonthly)} / month</div>
          ${p.settings?.budgetCap ? html`<div class="t-xs t-faint mt-4">Build budget cap: ${fmtNumber(p.settings.budgetCap)} credits</div>` : null}
          <div class="t-xs t-faint mt-8 row gap-4"><${Icon} name="info" size=${12} />Tip: switch simple steps to the Fast model tier to cut cost ~50%.</div>
        </div>
      </div>
    </section>

    <${Alerts} p=${p} m=${m} actualMonthly=${actualMonthly} />
  </div>`;
}

/** Alert rules — plain-words triggers with a live "would it fire now?" status. Saved on the project. */
function Alerts({ p, m, actualMonthly }) {
  const saved = p.settings?.alerts || {};
  const runs = m.runs.reduce((a, b) => a + b, 0);
  const errRate = runs ? m.errs / runs : 0;
  const budget = (p.agents || []).reduce((n, a) => n + (a.limits?.monthlyBudget || 0), 0);
  const p95 = Math.round((m.lat || 0) * 1.9);
  const rules = [
    { id: 'errors', icon: 'alert-triangle', label: 'Errors go above 5% of runs', hint: 'Checked every 5 minutes', def: true, fire: errRate > 0.05, now: m.errs ? `${(errRate * 100).toFixed(1)}% right now` : 'No errors right now' },
    { id: 'spend', icon: 'coins', label: 'Model spend passes 80% of the monthly budget', hint: budget ? `Budget across agents: ${fmtMoney(budget)} / month` : 'Set a monthly budget on each agent', def: true, fire: budget > 0 && actualMonthly > budget * 0.8, now: budget ? `On pace for ${Math.round((actualMonthly / budget) * 100)}% of budget` : 'No budget set yet' },
    { id: 'slow', icon: 'timer', label: 'Replies get slow (slowest 5% over 8s)', hint: 'Usually a slow tool or a big knowledge search', def: false, fire: p95 > 8000, now: p95 ? `Slowest 5%: ${(p95 / 1000).toFixed(1)}s` : 'No runs yet' },
    { id: 'traffic', icon: 'users', label: 'Visits drop by half compared with last week', hint: 'Catches a broken link or a failed deploy early', def: false, fire: false, now: 'Traffic is steady' },
  ];
  const on = (r) => (saved[r.id] ?? r.def);
  const set = (id, v) => updateProject(p.id, (d) => { d.settings = { ...(d.settings || {}), alerts: { ...(d.settings?.alerts || {}), [id]: v } }; });
  const active = rules.filter(on).length;
  return html`<section class="in-card mt-16" aria-labelledby="in-alerts-h">
    <div class="in-card__head"><${Icon} name="bell" size=${15} /><span class="t-strong grow" id="in-alerts-h">Alerts</span><span class="t-xs t-muted">${active} of ${rules.length} on · sent to your Inbox and email</span>
      <${Button} size="sm" variant="ghost" icon="send" onClick=${() => toast('Test alert sent to your Inbox and email', { tone: 'success' })}>Send a test<//></div>
    <div class="in-alerts">
      ${rules.map((r) => html`<div class=${cx('in-alert', on(r) && r.fire && 'is-firing')}>
        <span class="in-alert__icon"><${Icon} name=${r.icon} size=${14} /></span>
        <div class="grow" style="min-width:0">
          <${Switch} checked=${on(r)} label=${r.label} hint=${r.hint} onChange=${(v) => set(r.id, v)} />
          <div class="in-alert__now">${on(r) && r.fire ? html`<${Badge} size="sm" tone="amber" dot>Would fire now<//>` : html`<${Badge} size="sm" tone=${on(r) ? 'green' : 'outline'} dot=${on(r)}>${on(r) ? 'Quiet' : 'Off'}<//>`}<span class="t-xs t-faint">${r.now}</span></div>
        </div>
      </div>`)}
    </div>
  </section>`;
}
