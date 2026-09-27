// Bottom run bar: live progress of the current run (with pause / stop), then a one-line
// "last run" summary against the quote until dismissed.
import { html } from '../lib/html.js';
import { cx, fmtNumber, fmtRange } from '../lib/util.js';
import { Icon, IconButton, Button, Spinner } from '../ui/index.js';
import { isActive, buildElapsed, buildEta, pauseBuild, resumeBuild, stopBuild, dismissRun, DEMO_SPEED } from '../engine/simulate.js';
import { promiseStats } from '../engine/schema.js';
import { useTick, clock } from './wsKit.js';
import { scrollToMessage } from './cards/common.js';
import { openPanel } from './bus.js';
import { revealChat } from './ChatDock.js';

const crs = (n) => fmtNumber(n >= 10 ? Math.round(n) : Math.round(n * 10) / 10);
const KIND = { build: 'Building', edit: 'Applying change', fix: 'Fixing' };

function showMessage(id) {
  if (!id) { openPanel('logs'); return; }
  revealChat();
  setTimeout(() => { if (!scrollToMessage(id)) openPanel('logs'); }, 90);
}

export function RunBar({ project }) {
  const b = project.build;
  const active = isActive(project);
  useTick(b?.status === 'running', 1000);
  if (!b || (!active && b.dismissed)) return null;
  const steps = b.steps || [];
  const done = steps.filter((s) => s.status === 'done').length;
  const pct = steps.length ? Math.round((done / steps.length) * 100) : 0;

  if (active) {
    const running = b.status === 'running';
    const cur = steps[Math.min(b.stepIndex || 0, steps.length - 1)];
    const n = Math.min(done + (running ? 1 : 0), steps.length);
    const cap = b.cap || b.quote?.[1];
    return html`<div class=${cx('ws-runbar', running ? 'is-running' : 'is-paused')} role="status">
      <span class="ws-runbar__fill" style=${{ width: `${pct}%` }}></span>
      <span class="ws-runbar__icon">${running ? html`<${Spinner} size="sm" tone="amber" />` : html`<${Icon} name="pause" size=${13} />`}</span>
      <b class="ws-runbar__what t-tabular">${running ? KIND[b.kind] || 'Running' : 'Paused'} ${n}/${steps.length}</b>
      <span class="ws-runbar__step t-truncate">${cur?.label || b.label}</span>
      <span class="ws-runbar__meta t-tabular">
        <span data-tip="Time so far (demo)"><${Icon} name="clock" size=${12} />${clock(buildElapsed(b))}</span>
        ${running ? html`<span class="ws-runbar__eta">ETA ~${clock(buildEta(b))}</span>` : null}
        <span data-tip=${cap ? `Credits used so far · budget cap ${cap} cr` : 'Credits used so far'}><${Icon} name="coins" size=${12} />${b.free ? 'Free' : `${crs(b.credits || 0)}${cap ? `/${cap}` : ''} cr`}</span>
        <span class="ws-runbar__demo" data-tip=${`Demo builds run ${DEMO_SPEED}× faster than real ones`}>Demo speed ×${DEMO_SPEED}</span>
      </span>
      <span class="grow"></span>
      ${running
        ? html`<${Button} size="sm" variant="ghost" icon="pause" onClick=${() => pauseBuild(project.id)}>Pause<//>`
        : html`<${Button} size="sm" variant="primary" icon="play" onClick=${() => resumeBuild(project.id)}>Resume<//>`}
      <${Button} size="sm" variant="ghost" icon="stop" onClick=${() => stopBuild(project.id)} tip="Stop — finished work is kept">Stop<//>
      <${IconButton} icon="terminal" size="sm" label="Logs" onClick=${() => openPanel('logs')} />
    </div>`;
  }

  // Finished: done / stopped / error
  const run = (project.runs || []).find((r) => r.id === b.runId);
  const quote = run?.quoted || b.quote;
  const credits = run?.credits ?? b.credits ?? 0;
  const pv = run?.promises || promiseStats(project);
  const tone = b.status === 'done' ? 'is-done' : b.status === 'error' ? 'is-error' : 'is-stopped';
  const errMsg = b.status === 'error' ? [...project.chat].reverse().find((m) => m.type === 'fix') : null;
  return html`<div class=${cx('ws-runbar', tone)} role="status">
    <span class="ws-runbar__icon"><${Icon} name=${b.status === 'done' ? 'check-circle' : b.status === 'error' ? 'alert-circle' : 'stop'} size=${14} /></span>
    <b class="ws-runbar__what">${b.status === 'done' ? 'Last run' : b.status === 'error' ? 'Run hit a problem' : `Stopped at ${done}/${steps.length}`}</b>
    <span class="ws-runbar__meta t-tabular">
      <span>${b.free ? 'Free' : `${crs(credits)} cr`}${quote && !b.free ? html` <span class="t-faint">of ${fmtRange(quote)} quoted</span>` : null}</span>
      ${pv?.total ? html`<span class=${cx(pv.verified === pv.total && 't-green')}>${pv.verified}/${pv.total} promises verified</span>` : null}
      ${run?.demoMs || b.activeMs ? html`<span class="ws-runbar__eta">${clock(run?.demoMs || b.activeMs)}</span>` : null}
    </span>
    <span class="grow"></span>
    ${b.status === 'error'
      ? html`<${Button} size="sm" variant="secondary" icon="stethoscope" onClick=${() => showMessage(errMsg?.id)}>See what happened<//>`
      : html`<${Button} size="sm" variant="ghost" icon="receipt" onClick=${() => showMessage(b.receiptId)}>${b.kind === 'build' ? 'View receipt' : 'View change'}<//>`}
    <${IconButton} icon="x" size="sm" label="Dismiss" onClick=${() => dismissRun(project.id)} />
  </div>`;
}
