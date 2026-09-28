// Build & edit simulator — a module-level engine, independent of any component.
// Drives builds/edits over time: block buildState, promise statuses, the in-place progress
// chat card, credits (wallet ledger), logs, checkpoints, inbox and the activity feed.
//
//   startBuild(projectId)        full build from the approved plan (~35–60 s at demo speed)
//   runEdit(projectId, intent)   short visible run for an interpreted edit (see intents.js)
//   pauseBuild / resumeBuild / stopBuild
//   raiseBudget / finishEssentials  answers to the 80%-of-budget question
//
// Timers are keyed by projectId. On page load a build that was 'running' becomes 'paused'.
import { effect } from '../lib/html.js';
import {
  updateProject, getProject, addChat, updateChat, addCheckpoint, spend, pushInbox, logActivity,
  projects, projectsReady,
} from '../lib/store.js';
import { APP } from '../config.js';
import { uid, clamp, fmtRange, seeded } from '../lib/util.js';
import { integrationById } from './catalog.js';
import { agentById, screenById, tableById, findBlock, promiseStats } from './schema.js';

export const DEMO_SPEED = APP.demoSpeed || 10;
const CANCEL = Symbol('cancel');
const runners = new Map();          // projectId -> { token, timers:Set }
const intents = new Map();          // runId -> intent (functions can't be persisted)
const endListeners = new Set();

/** Subscribe to run completions: fn(projectId, build). Returns an unsubscribe fn. */
export function onRunEnd(fn) { endListeners.add(fn); return () => endListeners.delete(fn); }

export const isRunning = (project) => project?.build?.status === 'running';
/** Running or paused — a run that still owns the project. */
export const isActive = (project) => project?.build?.status === 'running' || project?.build?.status === 'paused';

/** Active time of a run in ms (pauses excluded). */
export function buildElapsed(build, now = Date.now()) {
  if (!build) return 0;
  const base = build.activeMs || 0;
  if (build.status === 'running' && build.resumedAt) return base + (now - build.resumedAt);
  return base;
}
/** Remaining time estimate in ms. */
export function buildEta(build, now = Date.now()) {
  if (!build || build.status === 'done' || build.status === 'stopped') return 0;
  const cur = build.steps?.[build.stepIndex];
  let rest = 0;
  (build.steps || []).forEach((s, i) => { if (i > build.stepIndex && s.status === 'pending') rest += s.dur || 0; });
  let curLeft = cur?.dur || 0;
  if (build.status === 'running' && build.stepStartedAt) curLeft = Math.max(400, curLeft - (now - build.stepStartedAt));
  return rest + curLeft;
}

const round1 = (n) => Math.round(n * 10) / 10;
const round5 = (n) => Math.round(n * 2) / 2;

// ---------------------------------------------------------------------------
// Runner plumbing
// ---------------------------------------------------------------------------
function claim(projectId) {
  cancel(projectId);
  const r = { token: uid('tk'), timers: new Set() };
  runners.set(projectId, r);
  return r.token;
}
function cancel(projectId) {
  const r = runners.get(projectId);
  if (r) { r.timers.forEach(clearTimeout); runners.delete(projectId); }
}
function alive(projectId, token) { return runners.get(projectId)?.token === token; }
function wait(projectId, token, ms) {
  return new Promise((resolve, reject) => {
    const r = runners.get(projectId);
    if (!r || r.token !== token) { reject(CANCEL); return; }
    const t = setTimeout(() => { r.timers.delete(t); if (alive(projectId, token)) resolve(); else reject(CANCEL); }, ms);
    r.timers.add(t);
  });
}

function mutBuild(projectId, fn) {
  updateProject(projectId, (d) => { if (d.build) fn(d.build, d); }, { touch: false });
}
function log(projectId, text, level = 'info') {
  mutBuild(projectId, (b) => { b.logs = [...(b.logs || []), { at: Date.now(), level, text }].slice(-240); });
}

// ---------------------------------------------------------------------------
// Build plan (steps derived from the project)
// ---------------------------------------------------------------------------
function planSteps(p) {
  const steps = [];
  const add = (s) => steps.push({ id: uid('st'), status: 'pending', detail: '', target: null, ...s });
  add({ kind: 'setup', phase: 'setup', label: 'Setting up the project, sign-in and database', dur: 3200, detail: 'App scaffold · auth · database' });
  for (const t of p.data?.tables || []) {
    add({ kind: 'data', phase: 'data', label: `Creating the ${t.name} table`, target: t.id, dur: 1700 + (t.columns?.length || 0) * 70, detail: `${t.columns?.length || 0} columns · ${t.rows?.length || 0} ${t.source === 'live' ? 'live' : t.source === 'test' ? 'test' : 'sample'} rows` });
  }
  for (const a of p.agents || []) {
    add({ kind: 'agent', phase: 'agents', label: `Building agent ${a.name}`, target: a.id, dur: 3000 + (a.tools?.length || 0) * 350 + (a.knowledge?.length || 0) * 200, detail: [a.kind === 'manager' ? 'Manager' : 'Specialist', a.tools?.length ? `${a.tools.length} tools` : null, a.knowledge?.length ? `${a.knowledge.length} knowledge sources` : null].filter(Boolean).join(' · ') });
  }
  const ints = (p.integrations || []).map((i) => integrationById(i.id).name);
  if (ints.length) add({ kind: 'tool', phase: 'connections', label: `Preparing ${ints.length > 3 ? `${ints.slice(0, 3).join(', ')} +${ints.length - 3}` : ints.join(', ')}`, dur: 2200 + ints.length * 200, detail: 'Tool schemas, scopes and approval gates' });
  for (const s of p.screens || []) {
    add({ kind: 'screen', phase: 'screens', label: `Building the ${s.title} screen`, target: s.id, dur: 700 + s.blocks.length * 850, detail: `${s.route} · ${s.blocks.length} components` });
  }
  for (const s of p.screens || []) {
    const seen = new Set();
    for (const b of s.blocks) {
      const aid = b.bind?.agent;
      if (!aid || seen.has(aid)) continue;
      seen.add(aid);
      const a = agentById(p, aid);
      if (a) add({ kind: 'wire', phase: 'wiring', label: `Wiring ${a.name} to ${s.route}`, target: b.id, agent: a.id, screen: s.id, dur: 1400, detail: `${b.type} → ${a.name} · typed outputs` });
    }
  }
  if (p.settings?.testAfterBuild !== false) add({ kind: 'test', phase: 'tests', label: 'Running tests', dur: 2800, detail: 'Unit, agent evals and screen checks' });
  add({ kind: 'verify', phase: 'verify', label: 'Verifying promises', dur: 2400, detail: 'Every promise checked against its acceptance checks' });

  // Scale to 35–60 s total at demo speed.
  const total = steps.reduce((a, s) => a + s.dur, 0);
  const scale = clamp(total, 35000, 60000) / total;
  steps.forEach((s) => { s.dur = Math.round(s.dur * scale); });
  return steps;
}

function allocateCredits(steps, quote, seed) {
  const [lo, hi] = quote?.credits || [20, 30];
  const r = seeded(seed)();
  const target = round1(lo + (hi - lo) * (0.3 + r * 0.3));
  const total = steps.reduce((a, s) => a + s.dur, 0) || 1;
  let acc = 0;
  steps.forEach((s, i) => {
    if (i === steps.length - 1) s.credits = round1(Math.max(0, target - acc));
    else { s.credits = round1((target * s.dur) / total); acc = round1(acc + s.credits); }
  });
  return target;
}

const PHASE_LABEL = {
  setup: 'Setup, data model & sign-in', data: 'Data tables', agents: 'Agents', connections: 'Connections',
  screens: 'Screens & components', wiring: 'Wiring agents to screens', tests: 'Tests', verify: 'Promise verification',
};

function pickInjection(p, steps) {
  // One honest, auto-fixed error mid-build: prefer a table block on the busiest screen.
  const screenSteps = steps.filter((s) => s.kind === 'screen');
  if (!screenSteps.length) return null;
  let best = null;
  for (const st of screenSteps) {
    const s = screenById(p, st.target);
    if (!s) continue;
    const blk = s.blocks.find((b) => b.type === 'table') || s.blocks.find((b) => b.type === 'chart') || s.blocks[1] || s.blocks[0];
    if (blk && (!best || s.blocks.length > best.n)) best = { stepId: st.id, blockId: blk.id, n: s.blocks.length };
  }
  return best ? { stepId: best.stepId, blockId: best.blockId, done: false } : null;
}

function errorStory(p, blockId) {
  const hit = findBlock(p, blockId);
  const b = hit?.block, s = hit?.screen;
  const file = b?.file || `components/${(b?.type || 'Block').replace(/^\w/, (c) => c.toUpperCase())}.tsx`;
  const promise = (p.plan?.promises || []).find((x) => x.id === b?.promise) || (p.plan?.promises || []).find((x) => (x.refs || []).includes(s?.id));
  if (b?.type === 'table') return {
    what: b.title ? `The “${b.title}” table showed a blank first row while loading.` : 'The table showed a blank first row while loading.',
    where: `${file} · ${s?.title || 'screen'}`,
    cause: 'Our generated code formatted dates differently on the server and in the browser (a hydration mismatch).',
    technical: `Error: Text content does not match server-rendered HTML.\n  at formatRelative (${file}:42)\n  server: "2 hours ago"  client: "2 hrs ago"\nFix: format dates on the client with a shared formatter.`,
    promise,
  };
  if (b?.type === 'chart') return {
    what: b.title ? `The “${b.title}” chart came out empty.` : 'The chart came out empty.',
    where: `${file} · ${s?.title || 'screen'}`,
    cause: 'The chart expected numbers but received text labels from the table.',
    technical: `TypeError: Cannot read properties of undefined (reading 'value')\n  at buildSeries (${file}:27)\nFix: group rows before mapping to series.`,
    promise,
  };
  return {
    what: `A component on ${s?.title || 'a screen'} failed to render.`,
    where: `${file} · ${s?.title || 'screen'}`,
    cause: 'We imported a helper under the wrong name.',
    technical: `ReferenceError: formatScore is not defined\n  at ${file}:18`,
    promise,
  };
}

function proofFor(p, pr) {
  const refs = pr.refs || [];
  const a = refs.map((r) => agentById(p, r)).find(Boolean);
  const t = refs.map((r) => tableById(p, r)).find(Boolean);
  const s = refs.map((r) => screenById(p, r)).find(Boolean);
  const n = pr.checks?.length || 2;
  if (a && t) return `Test run: ${a.name} handled ${t.rows?.length || n}/${t.rows?.length || n} ${t.source === 'live' ? '' : 'sample '}${t.name.toLowerCase()}`;
  if (a) return `${n}/${n} acceptance checks passed on ${a.name}`;
  if (s) return `Screenshot of ${s.route} (desktop + mobile)`;
  if (t) return `${t.rows?.length || 0} rows load in under 1 s`;
  return `${n}/${n} acceptance checks passed`;
}

// ---------------------------------------------------------------------------
// Full build
// ---------------------------------------------------------------------------
export function startBuild(projectId, { resumeFromReload = false } = {}) {
  const p = getProject(projectId);
  if (!p) return null;
  if (isActive(p) && !resumeFromReload) return p.build;
  const steps = planSteps(p);
  const quote = p.plan?.quote || { credits: [20, 30], minutes: [5, 10] };
  const runId = uid('run');
  const target = allocateCredits(steps, quote, runId);
  const cap = p.settings?.budgetCap ?? quote.cap ?? null;
  const firstBuild = !(p.runs || []).some((r) => r.kind === 'build' && r.status === 'done');
  const msg = addChat(projectId, { type: 'progress', text: '', data: { runId } });
  const inject = pickInjection(p, steps);

  updateProject(projectId, (d) => {
    d.status = 'building';
    for (const s of d.screens) for (const b of s.blocks) b.buildState = 'pending';
    for (const a of d.agents) a.buildState = 'building';
    for (const pr of d.plan.promises) if (pr.status !== 'deferred') { pr.status = 'planned'; delete pr.proof; }
    d.build = {
      runId, kind: 'build', status: 'running', label: steps[0].label, stepIndex: 0, steps,
      startedAt: Date.now(), resumedAt: Date.now(), stepStartedAt: Date.now(), activeMs: 0,
      credits: 0, target, quote: quote.credits, minutes: quote.minutes, cap, etaMs: steps.reduce((a, s) => a + s.dur, 0),
      logs: [{ at: Date.now(), level: 'info', text: `Build started · ${steps.length} steps · quote ${fmtRange(quote.credits)} cr${cap ? ` · cap ${cap} cr` : ''}` }],
      freeFixes: 0, msgId: msg.id, phaseCredits: {}, spentPhases: {}, inject, firstBuild, budgetAsked: false,
      modelTier: quote.modelTier || d.settings.modelTier || 'balanced',
    };
  });
  const token = claim(projectId);
  loop(projectId, token);
  return getProject(projectId).build;
}

async function loop(projectId, token) {
  try {
    for (;;) {
      if (!alive(projectId, token)) return;
      const p = getProject(projectId);
      const b = p?.build;
      if (!b || b.status !== 'running') return;
      const i = b.steps.findIndex((s) => s.status === 'pending' || s.status === 'running');
      if (i < 0) { if (b.kind === 'build') finishBuild(projectId); else finishEdit(projectId); return; }
      await execStep(projectId, token, i);
    }
  } catch (e) {
    if (e === CANCEL) return;
    console.error('[simulate]', e);
    failRun(projectId, e);
  }
}

async function execStep(projectId, token, i) {
  let p = getProject(projectId);
  const step = p.build.steps[i];
  mutBuild(projectId, (b) => {
    // Full builds show the current step as their label; edits/fixes keep the request summary
    // (it names the checkpoint and the run in History).
    b.stepIndex = i; if (b.kind === 'build') b.label = step.label; b.stepStartedAt = Date.now();
    b.steps[i].status = 'running';
  });
  log(projectId, `▸ ${step.label}`);
  markPromisesBuilding(projectId, step);

  if (step.kind === 'screen' && step.target) await runScreen(projectId, token, i);
  else if (step.kind === 'apply') await runApply(projectId, token, i);
  else if (step.kind === 'verify') await runVerify(projectId, token, i);
  else await wait(projectId, token, step.dur);

  p = getProject(projectId);
  if (!alive(projectId, token) || p.build?.status !== 'running') throw CANCEL;

  updateProject(projectId, (d) => {
    const b = d.build;
    const s = b.steps[i];
    s.status = 'done';
    b.credits = round1((b.credits || 0) + (s.credits || 0));
    b.phaseCredits[s.phase] = round1((b.phaseCredits[s.phase] || 0) + (s.credits || 0));
    if (s.kind === 'agent') { const a = d.agents.find((x) => x.id === s.target); if (a) a.buildState = 'done'; }
  }, { touch: false });
  if (step.kind === 'test') log(projectId, `✓ ${testSummary(getProject(projectId))}`, 'success');
  else log(projectId, `✓ ${step.label}`, 'success');
  settlePhase(projectId, i);
  verifyCompletedPromises(projectId);
  if (getProject(projectId).build.kind === 'build') checkBudget(projectId);
}

function testSummary(p) {
  const n = 6 + (p.screens?.length || 0) * 3 + (p.agents?.length || 0) * 4;
  return `${n} tests passed · agent evals ${(p.agents || []).length ? 'passed' : 'skipped'}`;
}

/** Charge a phase once its last step finishes (one ledger entry per phase). */
function settlePhase(projectId, i) {
  const p = getProject(projectId);
  const b = p.build;
  const step = b.steps[i];
  const next = b.steps.slice(i + 1).find((s) => s.status === 'pending');
  if (next && next.phase === step.phase) return;
  const amount = b.phaseCredits[step.phase] || 0;
  if (!amount || b.spentPhases[step.phase]) return;
  if (b.kind === 'build') spend(amount, { projectId, phase: 'build', label: `${p.name} · ${PHASE_LABEL[step.phase] || step.phase}` });
  mutBuild(projectId, (bb) => { bb.spentPhases[step.phase] = true; });
}

async function runScreen(projectId, token, i) {
  const p0 = getProject(projectId);
  const step = p0.build.steps[i];
  const screen = screenById(p0, step.target);
  if (!screen) { await wait(projectId, token, step.dur); return; }
  const per = Math.max(250, Math.round((step.dur - 500) / Math.max(1, screen.blocks.length)));
  await wait(projectId, token, 350);
  for (const blk of screen.blocks) {
    const cur = findBlock(getProject(projectId), blk.id)?.block;
    if (!cur || cur.buildState === 'done' || cur.buildState === undefined) continue;
    setBlock(projectId, blk.id, 'drafting');
    await wait(projectId, token, Math.round(per * 0.75));
    const inj = getProject(projectId).build.inject;
    if (inj && !inj.done && inj.blockId === blk.id) await injectAndFix(projectId, token, i, blk.id);
    await wait(projectId, token, Math.round(per * 0.25));
    setBlock(projectId, blk.id, 'done');
  }
}

function setBlock(projectId, blockId, state) {
  updateProject(projectId, (d) => {
    for (const s of d.screens) for (const b of s.blocks) if (b.id === blockId) { if (state === 'done') delete b.buildState; else b.buildState = state; }
  }, { touch: false });
}

async function injectAndFix(projectId, token, i, blockId) {
  const p = getProject(projectId);
  const story = errorStory(p, blockId);
  const errorId = uid('err');
  mutBuild(projectId, (b) => { b.steps[i].status = 'error'; b.steps[i].detail = story.cause; });
  log(projectId, `✕ ${story.what} (${story.where})`, 'error');
  const msg = addChat(projectId, {
    type: 'fix', text: '',
    data: {
      errorId, what: story.what, where: story.where, cause: story.cause, technical: story.technical,
      impact: story.promise ? `Would have broken ${story.promise.id} — ${story.promise.title}` : 'Would have left a broken part on this screen',
      promiseId: story.promise?.id || null, blockId, attempts: 1, status: 'fixing', free: true, auto: true, runId: p.build.runId,
    },
  });
  await wait(projectId, token, 2600);
  updateChat(projectId, msg.id, (m) => ({ data: { ...m.data, status: 'fixed', fixedAt: Date.now() } }));
  const detail = getProject(projectId).build.steps[i].detail;
  mutBuild(projectId, (b) => {
    b.steps[i].status = 'running';
    b.steps[i].detail = `Fixed automatically: ${detail}`;
    b.freeFixes = (b.freeFixes || 0) + 1;
    b.inject = { ...b.inject, done: true };
    b.fixNote = story.what;
  });
  spend(0.8, { projectId, phase: 'fix', label: `Free fix · ${story.what}`, free: true });
  log(projectId, '✓ Fixed automatically — free, because our change caused it', 'success');
}

function markPromisesBuilding(projectId, step) {
  if (!step.target && step.kind !== 'verify') return;
  updateProject(projectId, (d) => {
    for (const pr of d.plan.promises) {
      if (pr.status !== 'planned') continue;
      if ((pr.refs || []).includes(step.target) || (step.kind === 'wire' && (pr.refs || []).includes(step.agent))) pr.status = 'building';
    }
  }, { touch: false });
}

/** A promise is verified when every ref it points at has finished building. */
function verifyCompletedPromises(projectId) {
  const p = getProject(projectId);
  if (p.build?.kind !== 'build') return;
  const doneTargets = new Set(p.build.steps.filter((s) => s.status === 'done').map((s) => s.target).filter(Boolean));
  const known = new Set(p.build.steps.map((s) => s.target).filter(Boolean));
  const toVerify = [];
  for (const pr of p.plan.promises) {
    if (pr.status === 'deferred' || pr.status === 'verified' || pr.status === 'live') continue;
    const refs = (pr.refs || []).filter((r) => known.has(r));
    if (!refs.length) continue;
    if (refs.every((r) => doneTargets.has(r))) toVerify.push(pr.id);
  }
  if (!toVerify.length) return;
  updateProject(projectId, (d) => {
    for (const pr of d.plan.promises) if (toVerify.includes(pr.id)) { pr.status = 'verified'; pr.proof = proofFor(d, pr); }
  }, { touch: false });
  for (const id of toVerify) log(projectId, `✓ ${id} verified`, 'success');
}

async function runVerify(projectId, token, i) {
  const p = getProject(projectId);
  const step = p.build.steps[i];
  const open = p.plan.promises.filter((x) => x.status !== 'deferred' && x.status !== 'verified' && x.status !== 'live');
  const per = Math.max(300, Math.round(step.dur / Math.max(1, open.length + 1)));
  await wait(projectId, token, per);
  for (const pr of open) {
    updateProject(projectId, (d) => { const x = d.plan.promises.find((y) => y.id === pr.id); if (x) { x.status = 'verified'; x.proof = proofFor(d, x); } }, { touch: false });
    log(projectId, `✓ ${pr.id} verified — ${pr.title}`, 'success');
    await wait(projectId, token, per);
  }
}

function checkBudget(projectId) {
  const p = getProject(projectId);
  const b = p.build;
  if (!b || b.status !== 'running' || !b.cap || b.budgetAsked) return;
  const remaining = b.steps.some((s) => s.status === 'pending');
  if (!remaining || b.credits < b.cap * 0.8) return;
  mutBuild(projectId, (bb) => { bb.budgetAsked = true; });
  pauseBuild(projectId, { reason: 'budget' });
  const essentialsLeft = essentialSteps(getProject(projectId)).length;
  const msg = addChat(projectId, {
    type: 'approval', text: '',
    data: {
      kind: 'budget', status: 'pending', runId: b.runId,
      action: `${Math.round((b.credits / b.cap) * 100)}% of your budget used`,
      reason: `${b.credits} of your ${b.cap}-credit cap is spent and ${b.steps.filter((s) => s.status === 'pending').length} steps are left. I paused so you decide — nothing more is spent until you choose.`,
      impact: `Finishing everything needs about ${round1(Math.max(0, b.target - b.credits))} more credits. Essentials only: ${essentialsLeft} steps.`,
      credits: b.credits, cap: b.cap,
    },
  });
  mutBuild(projectId, (bb) => { bb.budgetMsgId = msg.id; });
}

function essentialSteps(p) {
  const refs = new Set((p.plan?.promises || []).filter((x) => x.status !== 'deferred').flatMap((x) => x.refs || []));
  return (p.build?.steps || []).filter((s) => s.status === 'pending' && (s.kind === 'verify' || s.kind === 'setup' || refs.has(s.target) || (s.kind === 'wire' && refs.has(s.agent))));
}

function resolveBudgetCard(projectId, status) {
  const id = getProject(projectId)?.build?.budgetMsgId;
  if (id) updateChat(projectId, id, (m) => (m.data?.status === 'pending' ? { data: { ...m.data, status } } : {}));
}

/** "Add budget": raise the cap and keep going. */
export function raiseBudget(projectId, newCap) {
  const p = getProject(projectId);
  if (!p?.build) return;
  const cap = newCap || Math.ceil(((p.build.cap || p.build.target) * 1.3) / 5) * 5;
  updateProject(projectId, (d) => { d.settings.budgetCap = cap; d.build.cap = cap; d.build.budgetAsked = false; if (d.plan.quote) d.plan.quote.cap = cap; });
  resolveBudgetCard(projectId, 'approved');
  log(projectId, `Budget raised to ${cap} cr`);
  logActivity(projectId, { actor: 'You', kind: 'budget', plain: `Raised the build budget to ${cap} credits.`, technical: `settings.budgetCap → ${cap}` });
  resumeBuild(projectId);
}

/** "Finish essentials": skip steps that no promise depends on, then continue. */
export function finishEssentials(projectId) {
  const p = getProject(projectId);
  if (!p?.build) return;
  const keep = new Set(essentialSteps(p).map((s) => s.id));
  let skipped = 0;
  updateProject(projectId, (d) => {
    for (const s of d.build.steps) if (s.status === 'pending' && !keep.has(s.id)) { s.status = 'stopped'; s.detail = 'Skipped to stay in budget'; skipped++; }
  });
  resolveBudgetCard(projectId, 'essentials');
  log(projectId, `Finishing essentials only — skipped ${skipped} steps`, 'warn');
  resumeBuild(projectId);
}

function finishBuild(projectId) {
  cancel(projectId);
  let p = getProject(projectId);
  const b = p.build;
  // settle any phase not charged yet (e.g. after skipped steps)
  for (const [phase, amount] of Object.entries(b.phaseCredits || {})) {
    if (amount && !b.spentPhases[phase]) spend(amount, { projectId, phase: 'build', label: `${p.name} · ${PHASE_LABEL[phase] || phase}` });
  }
  const elapsed = buildElapsed(b);
  const q = b.quote || [0, 0];
  const realMinutes = clamp(Math.round((elapsed * DEMO_SPEED) / 60000), b.minutes?.[0] || 1, b.minutes?.[1] || 60);
  let switched = false;
  updateProject(projectId, (d) => {
    const bb = d.build;
    bb.status = 'done'; bb.endedAt = Date.now(); bb.activeMs = elapsed; bb.resumedAt = null; bb.label = 'Build complete';
    bb.spentPhases = Object.fromEntries(Object.keys(bb.phaseCredits || {}).map((k) => [k, true]));
    d.status = d.status === 'live' ? 'live' : 'built';
    for (const s of d.screens) for (const x of s.blocks) delete x.buildState;
    for (const a of d.agents) a.buildState = 'done';
    for (const pr of d.plan.promises) if (pr.status !== 'deferred' && pr.status !== 'live') { if (pr.status !== 'verified') { pr.status = 'verified'; pr.proof = pr.proof || proofFor(d, pr); } }
    d.environments = { ...(d.environments || {}), draft: { ...(d.environments?.draft || {}), version: (d.environments?.draft?.version || 0) + 1 } };
    const st = promiseStats(d);
    d.runs = [...(d.runs || []), { id: bb.runId, kind: 'build', label: bb.firstBuild ? 'First build' : 'Rebuild', startedAt: bb.startedAt, endedAt: bb.endedAt, credits: bb.credits, quoted: q, minutes: realMinutes, demoMs: elapsed, status: 'done', promises: { verified: st.verified, total: st.total }, freeFixes: bb.freeFixes || 0, steps: bb.steps.length }];
    if (d.settings.mode === 'plan') { d.settings.mode = 'build'; switched = true; }
  });
  p = getProject(projectId);
  const st = promiseStats(p);
  const cp = addCheckpoint(projectId, { label: b.firstBuild ? 'First build complete' : 'Build complete', summary: `Build run · ${b.credits} credits · ${st.verified}/${st.total} promises verified`, kind: 'build', credits: b.credits });
  const final = { status: 'done', credits: b.credits, steps: b.steps.length, elapsed, freeFixes: b.freeFixes || 0 };
  if (b.msgId) updateChat(projectId, b.msgId, (m) => ({ data: { ...m.data, final } }));
  const receipt = addChat(projectId, {
    type: 'receipt', text: `${p.name} is built. Every promise was checked.`,
    data: { runId: b.runId, credits: b.credits, quote: q, minutes: realMinutes, demoMs: elapsed, promises: { verified: st.verified, total: st.total }, freeFixes: b.freeFixes || 0, fixNote: b.fixNote || null, checkpoint: cp?.n, checkpointId: cp?.id, steps: b.steps.length, skipped: b.steps.filter((s) => s.status === 'stopped').length },
  });
  mutBuild(projectId, (bb) => { bb.receiptId = receipt.id; });
  if (switched) addChat(projectId, { type: 'system', text: 'Switched to Build mode — changes now apply right away, and you see the cost before anything runs.' });
  pushInbox({ kind: 'ready', title: `${p.name} is built`, body: `${b.credits} credits of ${fmtRange(q)} quoted · ${st.verified}/${st.total} promises verified${b.freeFixes ? ` · ${b.freeFixes} free fix` : ''}.`, projectId, href: `/p/${projectId}/app` });
  const files = 8 + p.screens.reduce((a, s) => a + s.blocks.length, 0) + p.agents.length * 3 + p.data.tables.length;
  logActivity(projectId, {
    kind: 'build',
    plain: `Built ${p.name}: ${p.screens.length} screens, ${p.agents.length} agents, ${p.data.tables.length} tables. ${st.verified} of ${st.total} promises verified.`,
    technical: `${files} files · ${b.steps.length} build steps · ${b.credits} cr (quoted ${fmtRange(q)})${b.freeFixes ? ` · ${b.freeFixes} free fix (${b.fixNote})` : ''}`,
  });
  emitEnd(projectId);
}

function emitEnd(projectId) {
  const b = getProject(projectId)?.build;
  setTimeout(() => endListeners.forEach((fn) => { try { fn(projectId, b); } catch (e) { console.error(e); } }), 0);
}

function failRun(projectId, e) {
  cancel(projectId);
  const p = getProject(projectId);
  if (!p?.build) return;
  updateProject(projectId, (d) => {
    d.build.status = 'error'; d.build.endedAt = Date.now(); d.build.activeMs = buildElapsed(d.build); d.build.resumedAt = null;
    const s = d.build.steps[d.build.stepIndex]; if (s) { s.status = 'error'; s.detail = String(e?.message || e); }
    if (d.status === 'building') d.status = d.runs?.some((r) => r.kind === 'build') ? 'built' : 'ready';
  });
  log(projectId, `✕ Run failed: ${e?.message || e}`, 'error');
  if (p.build.fixMsgId) {
    // A fix attempt failed: re-open the same Doctor card (attempts were counted by the caller).
    updateChat(projectId, p.build.fixMsgId, (m) => ({ data: { ...m.data, status: 'open', lastError: String(e?.message || e) } }));
    emitEnd(projectId);
    return;
  }
  addChat(projectId, {
    type: 'fix', text: '',
    data: {
      errorId: uid('err'), what: 'The run stopped unexpectedly.', where: p.build.label || 'Current step', cause: 'Something in our generated change did not apply cleanly.',
      technical: String(e?.stack || e), impact: 'Nothing was lost — your last checkpoint is intact.', promiseId: null, attempts: 1, status: 'open', free: true,
      text: intents.get(p.build.runId)?.text || null, checkpointId: p.checkpoints?.[0]?.id || null,
    },
  });
  emitEnd(projectId);
}

// ---------------------------------------------------------------------------
// Pause / resume / stop
// ---------------------------------------------------------------------------
export function pauseBuild(projectId, { reason = 'user' } = {}) {
  const p = getProject(projectId);
  if (!p?.build || p.build.status !== 'running') return;
  cancel(projectId);
  updateProject(projectId, (d) => {
    const b = d.build;
    b.activeMs = buildElapsed(b); b.resumedAt = null; b.status = 'paused'; b.pauseReason = reason;
    const s = b.steps[b.stepIndex]; if (s && (s.status === 'running' || s.status === 'error')) s.status = 'pending';
  }, { touch: false });
  log(projectId, reason === 'budget' ? 'Paused at 80% of your budget' : reason === 'reload' ? 'Paused because the page was reloaded' : 'Paused by you', 'warn');
}

export function resumeBuild(projectId) {
  const p = getProject(projectId);
  if (!p?.build || p.build.status !== 'paused') return;
  if (p.build.kind !== 'build' && !intents.get(p.build.runId)) {
    // The edit's instructions lived in memory and were lost on reload.
    stopBuild(projectId, { note: 'This change was interrupted by a reload — send it again to apply it.' });
    return;
  }
  if (p.build.pauseReason === 'budget') resolveBudgetCard(projectId, 'approved');
  updateProject(projectId, (d) => { d.build.status = 'running'; d.build.resumedAt = Date.now(); d.build.pauseReason = null; if (d.status !== 'live' && d.build.kind === 'build') d.status = 'building'; }, { touch: false });
  log(projectId, 'Resumed');
  const token = claim(projectId);
  loop(projectId, token);
}

/** Stop keeps finished work and writes a partial receipt. */
export function stopBuild(projectId, { note } = {}) {
  const p = getProject(projectId);
  if (!p?.build || !isActive(p)) return;
  cancel(projectId);
  const b0 = p.build;
  if (b0.pauseReason === 'budget') resolveBudgetCard(projectId, 'stopped');
  // Charge what was actually done.
  for (const [phase, amount] of Object.entries(b0.phaseCredits || {})) {
    if (amount && !b0.spentPhases[phase] && b0.kind === 'build') spend(amount, { projectId, phase: 'build', label: `${p.name} · ${PHASE_LABEL[phase] || phase} (partial)` });
  }
  const elapsed = buildElapsed(b0);
  updateProject(projectId, (d) => {
    const b = d.build;
    b.status = 'stopped'; b.endedAt = Date.now(); b.activeMs = elapsed; b.resumedAt = null; b.label = 'Stopped';
    b.spentPhases = Object.fromEntries(Object.keys(b.phaseCredits || {}).map((k) => [k, true]));
    for (const s of b.steps) if (s.status === 'pending' || s.status === 'running' || s.status === 'error') { s.status = 'stopped'; }
    for (const s of d.screens) for (const x of s.blocks) if (x.buildState === 'drafting') x.buildState = 'pending';
    for (const pr of d.plan.promises) if (pr.status === 'building') pr.status = 'planned';
    if (b.kind === 'build') {
      const anyDone = d.screens.some((s) => s.blocks.some((x) => x.buildState === undefined));
      d.status = anyDone ? 'built' : 'ready';
      for (const a of d.agents) if (a.buildState === 'building') delete a.buildState;
    } else {
      for (const s of d.screens) for (const x of s.blocks) if (x.buildState === 'pending' && (b.touches || []).includes(x.id)) delete x.buildState;
    }
  });
  const q = getProject(projectId);
  const st = promiseStats(q);
  const done = b0.steps.filter((s) => s.status === 'done').length;
  log(projectId, `■ Stopped at step ${Math.min(b0.stepIndex + 1, b0.steps.length)}/${b0.steps.length} — finished work kept`, 'warn');
  if (b0.kind === 'build') {
    const cp = addCheckpoint(projectId, { label: 'Build stopped — finished work kept', summary: `${done}/${b0.steps.length} steps · ${b0.credits} credits`, kind: 'build', credits: b0.credits });
    if (b0.msgId) updateChat(projectId, b0.msgId, (m) => ({ data: { ...m.data, final: { status: 'stopped', credits: b0.credits, steps: b0.steps.length, done, elapsed } } }));
    const r = addChat(projectId, {
      type: 'receipt', text: 'Build stopped. Everything that finished is kept.',
      data: { runId: b0.runId, partial: true, credits: b0.credits, quote: b0.quote, minutes: Math.round((elapsed * DEMO_SPEED) / 60000), demoMs: elapsed, promises: { verified: st.verified, total: st.total }, freeFixes: b0.freeFixes || 0, checkpoint: cp?.n, checkpointId: cp?.id, steps: b0.steps.length, done },
    });
    mutBuild(projectId, (bb) => { bb.receiptId = r.id; });
    updateProject(projectId, (d) => { d.runs = [...(d.runs || []), { id: b0.runId, kind: 'build', label: 'Build (stopped)', startedAt: b0.startedAt, endedAt: Date.now(), credits: b0.credits, quoted: b0.quote, minutes: Math.round((elapsed * DEMO_SPEED) / 60000), status: 'stopped', promises: { verified: st.verified, total: st.total }, freeFixes: b0.freeFixes || 0, steps: done }]; });
    logActivity(projectId, { actor: 'You', kind: 'build', plain: `Stopped the build after ${done} of ${b0.steps.length} steps. Finished parts are kept.`, technical: `run ${b0.runId} stopped · ${b0.credits} cr charged` });
  } else {
    if (b0.credits) spend(b0.credits, { projectId, phase: b0.kind, label: `${b0.label} (stopped)` });
    addChat(projectId, { type: 'system', text: note || `Stopped “${b0.label}”. Nothing was applied${b0.credits ? ` · ${b0.credits} cr for finished steps` : ''}.` });
    intents.delete(b0.runId);
  }
  emitEnd(projectId);
}

/** Hide the "last run" bar. */
export function dismissRun(projectId) {
  updateProject(projectId, (d) => { if (d.build && !isActive(d)) d.build.dismissed = true; }, { touch: false });
}

// ---------------------------------------------------------------------------
// Edits (short visible runs)
// ---------------------------------------------------------------------------
function parseDiff(technical = '', touches = 0) {
  const m = String(technical).match(/\+(\d+)\s*[−–-]\s*(\d+)/);
  if (m) return { added: +m[1], removed: +m[2] };
  return { added: 6 + touches * 5, removed: 1 + touches };
}
function filesFrom(p, intent) {
  const out = new Set();
  const tech = String(intent.technical || '');
  for (const m of tech.matchAll(/([\w./-]+\.(?:tsx?|jsx?|py|ya?ml|json|css|md))/g)) out.add(m[1]);
  for (const id of intent.touches || []) { const b = findBlock(p, id)?.block; if (b?.file) out.add(b.file); }
  if (intent.kind === 'theme') out.add('styles/theme.css');
  return [...out].slice(0, 6);
}

/**
 * Apply an interpreted edit (see intents.js) as a short, visible run (3–5 steps, 4–8 s).
 * opts.free — no charge (fixes for problems we caused). opts.fixMsgId — the Doctor card being fixed.
 */
export function runEdit(projectId, intent, { free = false, fixMsgId = null, text = null, prevCheckpointId = null } = {}) {
  const p = getProject(projectId);
  if (!p || !intent) return null;
  if (isActive(p)) return null;
  if (!p.checkpoints?.length) addCheckpoint(projectId, { label: 'Before changes', summary: 'Automatic safety checkpoint', kind: 'safety' });
  const prev = prevCheckpointId || getProject(projectId).checkpoints[0]?.id || null;
  const kind = intent.kind === 'fix' ? 'fix' : 'edit';
  const touches = (intent.touches || []).filter((id) => findBlock(p, id));
  const names = touches.map((id) => findBlock(p, id).block.title || findBlock(p, id).block.type).slice(0, 2);
  const isFree = free || !!intent.free;
  const [lo, hi] = intent.credits || [1, 2];
  const actual = isFree ? 0 : round5(Math.max(0.5, (lo + hi) / 2));
  const runId = uid('run');
  const steps = [
    { kind: 'setup', phase: 'edit', label: 'Reading your request', dur: 800 },
    { kind: 'apply', phase: 'edit', label: touches.length ? `Updating ${names.join(' and ')}${touches.length > 2 ? ` +${touches.length - 2}` : ''}` : kind === 'fix' ? 'Applying the fix' : 'Applying the change', dur: 1700 + Math.min(4, touches.length) * 450 },
  ];
  if (p.settings?.testAfterBuild !== false) steps.push({ kind: 'test', phase: 'edit', label: 'Running tests', dur: 1100 });
  steps.push({ kind: 'verify', phase: 'edit', label: 'Checking promises still hold', dur: 800 });
  steps.push({ kind: 'save', phase: 'edit', label: 'Saving a checkpoint', dur: 500 });
  const total = steps.reduce((a, s) => a + s.dur, 0) || 1;
  let acc = 0;
  steps.forEach((s, i) => {
    s.id = uid('st'); s.status = 'pending'; s.detail = ''; s.target = null;
    if (i === steps.length - 1) s.credits = round1(Math.max(0, actual - acc)); else { s.credits = round1((actual * s.dur) / total); acc = round1(acc + s.credits); }
  });
  intents.set(runId, { ...intent, text: text || intent.text || null });
  updateProject(projectId, (d) => {
    d.build = {
      runId, kind, status: 'running', label: intent.summary || 'Applying your change', stepIndex: 0, steps,
      startedAt: Date.now(), resumedAt: Date.now(), stepStartedAt: Date.now(), activeMs: 0,
      credits: 0, target: actual, quote: intent.credits || [lo, hi], cap: null, etaMs: total,
      logs: [{ at: Date.now(), level: 'info', text: `${kind === 'fix' ? 'Fix' : 'Edit'} started · ${intent.summary || ''} · quote ${fmtRange(intent.credits || [lo, hi])} cr${isFree ? ' (free)' : ''}` }],
      freeFixes: 0, phaseCredits: {}, spentPhases: {}, touches, free: isFree, prevCheckpointId: prev, fixMsgId, intentKind: intent.kind,
    };
  }, { touch: false });
  if (fixMsgId) updateChat(projectId, fixMsgId, (m) => ({ data: { ...m.data, status: 'fixing' } }));
  const token = claim(projectId);
  loop(projectId, token);
  return getProject(projectId).build;
}

async function runApply(projectId, token, i) {
  const p = getProject(projectId);
  const b = p.build;
  const step = b.steps[i];
  const touches = b.touches || [];
  for (const id of touches) setBlock(projectId, id, 'drafting');
  await wait(projectId, token, Math.round(step.dur * 0.75));
  const intent = intents.get(b.runId);
  if (!intent) throw new Error('The change instructions were lost — send it again.');
  updateProject(projectId, (d) => {
    if (typeof intent.apply === 'function') intent.apply(d);
    for (const s of d.screens) for (const x of s.blocks) if (touches.includes(x.id) && x.buildState === 'drafting') delete x.buildState;
  });
  await wait(projectId, token, Math.round(step.dur * 0.25));
}

function finishEdit(projectId) {
  cancel(projectId);
  const p = getProject(projectId);
  const b = p.build;
  const intent = intents.get(b.runId) || {};
  intents.delete(b.runId);
  const credits = b.free ? 0 : b.credits;
  spend(b.free ? (b.target || 0.5) : credits, { projectId, phase: b.kind, label: b.label, free: b.free });
  const cp = addCheckpoint(projectId, { label: b.label, summary: `${b.kind === 'fix' ? 'Fix' : 'Edit'} run · ${b.free ? 'free' : `${credits} credits`}`, kind: b.kind, credits });
  const elapsed = buildElapsed(b);
  updateProject(projectId, (d) => {
    const bb = d.build;
    bb.status = 'done'; bb.endedAt = Date.now(); bb.activeMs = elapsed; bb.resumedAt = null;
    d.environments = { ...(d.environments || {}), draft: { ...(d.environments?.draft || {}), version: (d.environments?.draft?.version || 0) + 1 } };
    const st = promiseStats(d);
    d.runs = [...(d.runs || []), { id: bb.runId, kind: bb.kind, label: bb.label, startedAt: bb.startedAt, endedAt: bb.endedAt, credits, quoted: bb.quote, minutes: 1, demoMs: elapsed, status: 'done', promises: { verified: st.verified, total: st.total }, freeFixes: bb.free ? 1 : 0, steps: bb.steps.length }];
    if (bb.kind === 'fix' || bb.fixMsgId) {
      for (const m of d.chat) if (m.type === 'fix' && m.data && (m.id === bb.fixMsgId || (bb.kind === 'fix' && (m.data.status === 'open' || m.data.status === 'fixing')))) m.data = { ...m.data, status: 'fixed', fixedAt: Date.now() };
    }
  }, { touch: false });
  const p2 = getProject(projectId);
  const diff = parseDiff(intent.technical, (b.touches || []).length);
  const msg = addChat(projectId, {
    type: 'change', text: intent.plain || `Done — ${b.label}.`,
    data: {
      plain: intent.plain || b.label, technical: intent.technical || '', diff, files: filesFrom(p2, intent), credits, free: b.free, quote: b.quote,
      checkpoint: cp?.n, checkpointId: cp?.id, prevCheckpointId: b.prevCheckpointId, runId: b.runId, kind: intent.kind, touches: b.touches || [],
    },
  });
  mutBuild(projectId, (bb) => { bb.receiptId = msg.id; });
  logActivity(projectId, { kind: b.kind === 'fix' ? 'fix' : 'change', plain: intent.plain || b.label, technical: intent.technical || `${diff.added} added · ${diff.removed} removed` });
  emitEnd(projectId);
}

// ---------------------------------------------------------------------------
// Page-load recovery: a build that was running is now paused (with Resume).
// ---------------------------------------------------------------------------
effect(() => {
  if (!projectsReady.value) return;
  const all = projects.peek();
  for (const p of Object.values(all)) {
    if (p.build?.status === 'running' && !runners.has(p.id)) {
      updateProject(p.id, (d) => {
        const b = d.build;
        b.activeMs = (b.activeMs || 0) + Math.max(0, (b.stepStartedAt || b.resumedAt || 0) - (b.resumedAt || 0));
        b.status = 'paused'; b.pauseReason = 'reload'; b.resumedAt = null;
        const s = b.steps?.[b.stepIndex]; if (s && (s.status === 'running' || s.status === 'error')) s.status = 'pending';
        b.logs = [...(b.logs || []), { at: Date.now(), level: 'warn', text: 'Paused because the page was reloaded' }];
      }, { touch: false });
    }
  }
});
