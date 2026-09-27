// Run cards: live progress, receipt, Doctor (fix), and the inline card for short edit runs.
import { html, useState } from '../../lib/html.js';
import { navigate } from '../../lib/router.js';
import { Button, Icon, Badge, Progress, Spinner, StatusPill } from '../../ui/index.js';
import { cx, fmtRange, fmtNumber } from '../../lib/util.js';
import { sampleTables } from '../../engine/schema.js';
import { pauseBuild, resumeBuild, stopBuild, startBuild, isActive, buildElapsed, buildEta, DEMO_SPEED } from '../../engine/simulate.js';
import { fixAction } from '../../engine/conversation.js';
import { CardFrame, PromiseTag, promiseById } from './common.js';
import { useTick, clock, loadModule } from '../wsKit.js';
import { openPanel } from '../bus.js';

const publishLoader = () => import('../launch/publish.js');
export async function openPublish(projectId) {
  try { const m = await loadModule(publishLoader); m.openPublishFlow(projectId); } catch (e) { console.error(e); navigate(`/p/${projectId}/launch`); }
}

function StepIcon({ status }) {
  if (status === 'done') return html`<span class="ws-step__icon is-done"><${Icon} name="check" size=${11} stroke=${3} /></span>`;
  if (status === 'running') return html`<span class="ws-step__icon is-running"><${Spinner} size="sm" tone="amber" /></span>`;
  if (status === 'error') return html`<span class="ws-step__icon is-error"><${Icon} name="alert-circle" size=${12} /></span>`;
  if (status === 'stopped') return html`<span class="ws-step__icon is-stopped"><${Icon} name="minus" size=${11} stroke=${3} /></span>`;
  return html`<span class="ws-step__icon"></span>`;
}

export function StepList({ build, limit = 4 }) {
  const [all, setAll] = useState(false);
  const steps = build.steps || [];
  const cur = Math.min(build.stepIndex || 0, steps.length - 1);
  const doneCount = steps.filter((s) => s.status === 'done').length;
  let shown = steps.map((s, i) => ({ s, i }));
  let hiddenDone = 0, hiddenNext = 0;
  if (!all && steps.length > limit + 3) {
    const from = Math.max(0, cur - 1);
    const to = Math.min(steps.length, cur + limit);
    hiddenDone = from;
    hiddenNext = steps.length - to;
    shown = shown.slice(from, to);
  }
  return html`<ol class="ws-steps">
    ${hiddenDone ? html`<li><button type="button" class="ws-steps__more" onClick=${() => setAll(true)}><${Icon} name="check" size=${12} class="t-green" />${hiddenDone} earlier step${hiddenDone === 1 ? '' : 's'} done · show all</button></li>` : null}
    ${shown.map(({ s, i }) => html`<li class=${cx('ws-step', `is-${s.status}`, i === cur && build.status !== 'done' && 'is-current')}>
      <${StepIcon} status=${s.status} />
      <div class="ws-step__main">
        <div class="ws-step__label">${s.label}</div>
        ${(i === cur || s.status === 'error') && s.detail ? html`<div class="ws-step__detail">${s.detail}</div>` : null}
      </div>
      ${s.status === 'done' && s.credits ? html`<span class="ws-step__cr t-tabular">${fmtNumber(s.credits)}</span>` : null}
    </li>`)}
    ${hiddenNext ? html`<li><button type="button" class="ws-steps__more" onClick=${() => setAll(true)}>+${hiddenNext} more step${hiddenNext === 1 ? '' : 's'}</button></li>` : null}
    ${all && steps.length > limit + 3 ? html`<li><button type="button" class="ws-steps__more" onClick=${() => setAll(false)}>Show less</button></li>` : null}
    <li class="sr-only">${doneCount} of ${steps.length} steps done</li>
  </ol>`;
}

export function RunControls({ project, size = 'sm' }) {
  const b = project.build;
  if (!b || !isActive(project)) return null;
  return html`${b.status === 'paused'
    ? html`<${Button} size=${size} variant="primary" icon="play" onClick=${() => resumeBuild(project.id)}>Resume<//>`
    : html`<${Button} size=${size} variant="secondary" icon="pause" onClick=${() => pauseBuild(project.id)}>Pause<//>`}
    <${Button} size=${size} variant="ghost" icon="stop" onClick=${() => stopBuild(project.id)}>Stop<//>`;
}

// ---------------------------------------------------------------------------
// Progress (full build) — a single in-place card that reads project.build
// ---------------------------------------------------------------------------
export function ProgressCard({ msg, project }) {
  const b = project.build;
  const live = b && b.runId === msg.data?.runId && b.kind === 'build';
  useTick(live && b.status === 'running', 1000);
  if (!live) {
    const f = msg.data?.final;
    return html`<${CardFrame} compact tone=${f?.status === 'stopped' ? 'neutral' : 'green'} icon=${f?.status === 'stopped' ? 'stop' : 'check-circle'}
      title=${f?.status === 'stopped' ? 'Build stopped' : 'Build finished'}
      meta=${f ? html`<span class="t-tabular">${f.status === 'stopped' ? `${f.done}/${f.steps}` : f.steps} steps · ${fmtNumber(f.credits)} cr${f.elapsed ? ` · ${clock(f.elapsed)}` : ''}</span>` : null} />`;
  }
  const steps = b.steps || [];
  const done = steps.filter((s) => s.status === 'done').length;
  const pct = steps.length ? (done / steps.length) * 100 : 0;
  const elapsed = buildElapsed(b);
  const eta = buildEta(b);
  const st = b.status;
  const title = st === 'running' ? `Building ${project.name}` : st === 'paused' ? 'Build paused' : st === 'done' ? 'Build complete' : st === 'stopped' ? 'Build stopped' : 'Build hit a problem';
  const tone = st === 'running' ? 'amber' : st === 'done' ? 'green' : st === 'error' ? 'red' : 'neutral';
  return html`<${CardFrame} tone=${tone} icon=${st === 'running' ? 'loader' : st === 'paused' ? 'pause' : st === 'done' ? 'check-circle' : st === 'error' ? 'alert-circle' : 'stop'}
    title=${title} meta=${html`<span class="t-tabular">${Math.min(done + (st === 'running' ? 1 : 0), steps.length)}/${steps.length}</span>`} class="ws-progress"
    footer=${html`<div class="ws-progress__meta t-tabular">
        <span data-tip="Credits used so far, against the quote"><${Icon} name="coins" size=${12} /> ${fmtNumber(b.credits || 0)} / ${fmtRange(b.quote || [0, 0])} cr</span>
        <span data-tip="Demo time (${DEMO_SPEED}× faster than a real build)"><${Icon} name="clock" size=${12} /> ${clock(elapsed)}${st === 'running' ? ` · ~${clock(eta)} left` : ''}</span>
      </div>
      <span class="grow"></span><${RunControls} project=${project} />`}>
    <${Progress} value=${pct} tone=${tone === 'neutral' ? undefined : tone} thin />
    ${st === 'paused' ? html`<div class="ws-note ws-note--amber mt-8"><${Icon} name="pause" size=${13} /><span>${b.pauseReason === 'budget' ? 'Paused at 80% of your budget — choose below.' : b.pauseReason === 'reload' ? 'Paused because the page was reloaded. Nothing was lost.' : 'Paused. Finished work is kept; nothing more is spent until you resume.'}</span></div>` : null}
    <${StepList} build=${b} />
  <//>`;
}

/** Inline card for short edit/fix runs (not persisted as a message). */
export function LiveRunCard({ project }) {
  const b = project.build;
  useTick(b?.status === 'running', 700);
  if (!b || b.kind === 'build' || !isActive(project)) return null;
  const done = b.steps.filter((s) => s.status === 'done').length;
  return html`<${CardFrame} tone=${b.status === 'running' ? 'amber' : 'neutral'} icon=${b.status === 'running' ? 'loader' : 'pause'} title=${b.kind === 'fix' ? 'Fixing' : 'Applying your change'}
    meta=${html`<span class="t-tabular">${done}/${b.steps.length}</span>`} class="ws-progress ws-progress--edit"
    footer=${html`<span class="t-xs t-faint t-tabular">${b.free ? 'Free' : `≈${fmtRange(b.quote || [0, 0])} cr`} · ${clock(buildElapsed(b))}</span><span class="grow"></span><${RunControls} project=${project} />`}>
    <div class="t-sm t-strong ws-progress__label">${b.label}</div>
    <${Progress} value=${(done / Math.max(1, b.steps.length)) * 100} tone="amber" thin />
    <${StepList} build=${b} limit=${6} />
  <//>`;
}

// ---------------------------------------------------------------------------
// Receipt
// ---------------------------------------------------------------------------
export function ReceiptCard({ msg, project }) {
  const d = msg.data || {};
  const run = (project.runs || []).find((r) => r.id === d.runId);
  const quote = d.quote || run?.quoted || project.plan?.quote?.credits || null;
  const credits = d.credits ?? run?.credits ?? 0;
  const within = quote ? credits <= quote[1] : true;
  const partial = !!d.partial;
  const pv = d.promises || run?.promises || { verified: 0, total: 0 };
  const sample = sampleTables(project).length > 0;
  return html`<${CardFrame} tone=${partial ? 'neutral' : 'green'} icon="receipt" title=${partial ? 'Partial receipt' : 'Receipt'}
    meta=${d.checkpoint ? html`<span class="t-tabular">Checkpoint #${d.checkpoint}</span>` : null} class="ws-receipt">
    ${msg.text ? html`<p class="ws-card__lead">${msg.text}</p>` : null}
    <div class="ws-stats">
      <div class="ws-stat">
        <span class="ws-stat__k">Credits</span>
        <span class="ws-stat__v t-tabular">${fmtNumber(credits)}</span>
        <span class="ws-stat__s">${quote ? html`of ${fmtRange(quote)} quoted ${within ? html`<${Badge} tone="green" size="sm">Within quote<//>` : html`<${Badge} tone="red" size="sm">Over quote<//>`}` : 'charged'}</span>
      </div>
      <div class="ws-stat">
        <span class="ws-stat__k">Time</span>
        <span class="ws-stat__v t-tabular">${d.demoMs ? clock(d.demoMs) : `${d.minutes ?? run?.minutes ?? '—'}m`}</span>
        <span class="ws-stat__s">${d.demoMs ? `demo · ≈ ${d.minutes || Math.round((d.demoMs * DEMO_SPEED) / 60000)} min real` : 'build time'}</span>
      </div>
      <div class="ws-stat">
        <span class="ws-stat__k">Promises</span>
        <span class=${cx('ws-stat__v t-tabular', pv.verified === pv.total && pv.total && 't-green')}>${pv.verified}/${pv.total}</span>
        <span class="ws-stat__s">verified${partial ? ' so far' : ''}</span>
      </div>
      <div class="ws-stat">
        <span class="ws-stat__k">Free fixes</span>
        <span class="ws-stat__v t-tabular">${d.freeFixes ?? run?.freeFixes ?? 0}</span>
        <span class="ws-stat__s" title=${d.fixNote || ''}>${(d.freeFixes ?? run?.freeFixes) ? '0 cr — our mistake, our cost' : 'none needed'}</span>
      </div>
    </div>
    ${partial ? html`<p class="ws-fine">Stopped after ${d.done ?? '—'} of ${d.steps ?? '—'} steps. Finished screens, agents and data are kept; unfinished parts stay as wireframes.</p>` : null}
    <div class="ws-next">
      <span class="ws-next__k">Next</span>
      ${partial ? html`<button type="button" class="ws-chipbtn is-primary" onClick=${() => startBuild(project.id)}><${Icon} name="play" size=${13} />Build the rest</button>` : null}
      ${sample ? html`<button type="button" class="ws-chipbtn" onClick=${() => navigate(`/p/${project.id}/data`)}><${Icon} name="database" size=${13} />Connect real data</button>` : null}
      ${!partial ? html`<button type="button" class="ws-chipbtn" onClick=${() => openPublish(project.id)}><${Icon} name="rocket" size=${13} />Publish</button>` : null}
      ${project.agents.length ? html`<button type="button" class="ws-chipbtn" onClick=${() => navigate(`/p/${project.id}/agents`)}><${Icon} name="bot" size=${13} />Tune an agent</button>` : null}
      <button type="button" class="ws-chipbtn is-quiet" onClick=${() => openPanel('logs')}><${Icon} name="terminal" size=${13} />Logs</button>
    </div>
  <//>`;
}

// ---------------------------------------------------------------------------
// Doctor (fix card)
// ---------------------------------------------------------------------------
export function FixCard({ msg, project }) {
  const d = msg.data || {};
  const [tech, setTech] = useState(false);
  const pr = d.promiseId ? promiseById(project, d.promiseId) : null;
  const status = d.status || 'open';
  const busy = isActive(project);
  const cp = project.checkpoints.find((c) => c.id === d.checkpointId) || project.checkpoints.find((c) => c.kind !== 'safety' && c.kind !== 'restore');
  const stuck = status === 'open' && (d.attempts || 1) >= 2;
  const pill = status === 'fixed' ? html`<${StatusPill} status="verified" label=${d.free ? 'Fixed · free' : 'Fixed'} size="sm" />`
    : status === 'fixing' ? html`<${StatusPill} status="running" label="Fixing" size="sm" />`
      : status === 'escalated' ? html`<${Badge} size="sm" icon="users">With an engineer<//>`
        : html`<${StatusPill} status="failed" size="sm" />`;
  return html`<${CardFrame} tone=${status === 'fixed' ? 'green' : status === 'fixing' ? 'amber' : status === 'escalated' ? 'neutral' : 'red'} icon="stethoscope" title="Doctor" meta=${pill} class="ws-doctor">
    <dl class="ws-dx">
      <div><dt>What happened</dt><dd>${d.what}</dd></div>
      ${d.where ? html`<div><dt>Where</dt><dd class="t-mono ws-dx__where">${d.where}</dd></div>` : null}
      ${d.cause ? html`<div><dt>Why</dt><dd>${d.cause}</dd></div>` : null}
      ${d.impact ? html`<div><dt>Impact</dt><dd>${pr ? html`<${PromiseTag} id=${pr.id} status=${pr.status} /> ` : null}${d.impact}</dd></div>` : null}
    </dl>
    ${d.technical ? html`<button type="button" class="ws-linkbtn" onClick=${() => setTech(!tech)}><${Icon} name=${tech ? 'chevron-up' : 'code'} size=${12} />${tech ? 'Hide technical details' : 'Show technical details'}</button>` : null}
    ${tech ? html`<pre class="ws-pre">${d.technical}</pre>` : null}
    ${status === 'fixed' ? html`<p class="ws-fine">${d.auto ? 'Fixed automatically during the build. ' : ''}${d.free ? 'No charge — our change caused it.' : ''}${d.resolution ? ` ${d.resolution}.` : ''}</p>` : null}
    ${status === 'escalated' ? html`<p class="ws-fine">A human engineer has the details and your last checkpoint. You’ll get an inbox message. (Prototype: simulated.)</p>` : null}
    ${status === 'open' && !stuck ? html`<div class="ws-card__actions">
      <${Button} size="sm" variant="primary" icon="wand" disabled=${busy} onClick=${() => fixAction(project.id, msg.id, 'fix')}>${d.free ? 'Fix it · FREE' : 'Fix it · ≈1 cr'}<//>
      ${cp ? html`<${Button} size="sm" variant="ghost" icon="rotate-ccw" disabled=${busy} onClick=${() => fixAction(project.id, msg.id, 'rollback')}>Roll back to #${cp.n}<//>` : null}
    </div>` : null}
    ${stuck ? html`<div class="ws-breaker">
      <div class="ws-breaker__title"><${Icon} name="repeat" size=${13} />That didn’t work twice — let’s not loop.</div>
      ${cp ? html`<button type="button" class="ws-breaker__opt" disabled=${busy} onClick=${() => fixAction(project.id, msg.id, 'rollback')}><${Icon} name="rotate-ccw" size=${14} /><span class="grow"><b>Roll back to checkpoint #${cp.n}</b><span>${cp.label} · nothing is deleted</span></span></button>` : null}
      <button type="button" class="ws-breaker__opt" disabled=${busy} onClick=${() => fixAction(project.id, msg.id, 'different')}><${Icon} name="crown" size=${14} /><span class="grow"><b>Try a different approach</b><span>Best model · ≈4 cr</span></span></button>
      <button type="button" class="ws-breaker__opt" onClick=${() => fixAction(project.id, msg.id, 'human')}><${Icon} name="headphones" size=${14} /><span class="grow"><b>Ask a human</b><span>An engineer reviews it with full context</span></span></button>
    </div>` : null}
  <//>`;
}
