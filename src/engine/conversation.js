// Orchestrates the conversation: prompt → questions → plan + scope + quote → build → iterate.
// UI-free: the chat dock renders the messages this module writes (see CHAT_TYPES in schema.js).
import { signal } from '../lib/html.js';
import { session, createProject, updateProject, addChat, updateChat, getProject, addCheckpoint, restoreCheckpoint, logActivity, pushInbox } from '../lib/store.js';
import { analyzePrompt, generateQuestions, generatePlan, planFromTemplate } from './generate.js';
import { interpretEdit } from './intents.js';
import { estimateQuote } from './quote.js';
import { templateById, INTEGRATIONS, integrationById, FRAMEWORKS } from './catalog.js';
import { startBuild, runEdit, isActive, onRunEnd } from './simulate.js';
import { sleep, fmtRange, uid } from '../lib/util.js';

/** projectId -> label while the assistant is "thinking" (typing indicator in the dock). */
export const thinking = signal({});
/** projectId -> [{ id, text, opts }] messages waiting for the current run to finish. */
export const queues = signal({});

function setThinking(projectId, label) {
  const t = { ...thinking.value };
  if (label) t[projectId] = label; else delete t[projectId];
  thinking.value = t;
}

const PRE_BUILD = ['draft', 'planning', 'ready'];
export const isPreBuild = (p) => PRE_BUILD.includes(p?.status) && !p?.plan?.approvedAt;

/** "Book Club Books" → "Book Club": drop a trailing noun that repeats an earlier word. */
export function tidyName(n = '') {
  const w = String(n || '').trim().split(/\s+/);
  if (w.length < 3) return n;
  return w.slice(0, -1).some((x) => stem(x) === stem(w[w.length - 1])) ? w.slice(0, -1).join(' ') : n;
}
const stem = (x = '') => String(x).toLowerCase().replace(/(es|s)$/, '');

/** Recommended answers: the option hinted "Recommended", else the first. */
export function recommendedAnswers(questions = []) {
  const out = {};
  for (const q of questions) {
    const rec = q.options?.find((o) => /recommend/i.test(o.hint || '')) || q.options?.[0];
    if (!rec) continue;
    out[q.id] = q.multi ? [rec.value] : rec.value;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
/**
 * Create a project from a prompt / template and start planning.
 * @param {{prompt?:string, templateId?:string, skipPlan?:boolean, source?:object, attachments?:object[], name?:string}} opts
 * @returns the new project
 */
export function startProject({ prompt = '', templateId, skipPlan, source, attachments = [], name } = {}) {
  const t = templateId ? templateById(templateId) : null;
  const text = prompt || t?.prompt || '';
  const analysis = analyzePrompt(text);
  analysis.name = tidyName(analysis.name);
  const p = createProject({
    name: name || t?.title || analysis.name, prompt: text, status: 'planning', archetype: analysis.archetype,
    icon: t?.icon || analysis.icon, color: analysis.color, description: analysis.summary && analysis.summary !== text ? analysis.summary : '',
    source: source || { type: t ? 'template' : 'prompt', ref: templateId || null },
  });
  addChat(p.id, { role: 'user', type: 'text', text, data: attachments?.length ? { attachments: attachments.map((a) => ({ name: a.name, size: a.size, type: a.type })) } : undefined });
  let questions = [];
  try { questions = generateQuestions(text, analysis) || []; } catch (e) { console.warn('[conversation] questions', e); }
  updateProject(p.id, { questions });
  logActivity(p.id, { actor: 'You', kind: 'plan', plain: `Started “${p.name}” from ${t ? `the ${t.title} template` : 'a description'}.`, technical: `source:${t ? `template/${templateId}` : 'prompt'} · archetype:${analysis.archetype}` });
  if (skipPlan || !questions.length) {
    addChat(p.id, { type: 'questions', text: 'I picked the recommended answers so we can move fast — change any of them later in the plan.', data: { answered: true, skipped: true } });
    answerQuestions(p.id, recommendedAnswers(questions), { instant: true });
  } else {
    addChat(p.id, { type: 'questions', text: `${questions.length === 1 ? 'One quick question' : `${questions.length} quick questions`} so the plan fits how you work:`, data: { answered: false } });
  }
  return getProject(p.id);
}

// ---------------------------------------------------------------------------
// Questions → plan
// ---------------------------------------------------------------------------
export async function answerQuestions(projectId, answers = {}, { instant = false } = {}) {
  const p0 = getProject(projectId);
  if (!p0) return;
  updateProject(projectId, (d) => {
    d.answers = { ...(d.answers || {}), ...answers };
    d.questions = (d.questions || []).map((q) => ({ ...q, answer: answers[q.id] ?? q.answer }));
    for (const m of d.chat) if (m.type === 'questions' && !m.data?.answered) m.data = { ...(m.data || {}), answered: true, answeredAt: Date.now() };
    d.status = 'planning';
  });
  setThinking(projectId, 'Drafting your plan…');
  if (!instant) await sleep(1400);
  const p = getProject(projectId);
  if (!p) { setThinking(projectId, null); return; }
  let plan;
  try {
    const tpl = p.source?.type === 'template' && p.source.ref && templateById(p.source.ref);
    const an = analyzePrompt(p.prompt);
    an.name = p.name && p.name !== 'Untitled app' ? p.name : tidyName(an.name);
    plan = tpl ? planFromTemplate(p.source.ref, answers) : generatePlan(p.prompt, answers, an);
  } catch (e) {
    console.error('[conversation] plan failed', e);
    setThinking(projectId, null);
    addChat(projectId, { type: 'text', text: 'I couldn’t draft the plan just now. Nothing was charged — try **Continue** again, or describe the app in a bit more detail.', data: { error: true } });
    return;
  }
  const fw = frameworkFromPrompt(p.prompt);
  updateProject(projectId, (d) => {
    const keepName = d.name && d.name !== 'Untitled app' ? d.name : null;
    const { plan: pl, ...rest } = plan;
    Object.assign(d, rest);
    if (keepName) d.name = keepName;
    d.plan = { ...d.plan, ...(pl || {}), approvedAt: null };
    d.plan.promises = (d.plan.promises || []).map((x) => { const y = { ...x, status: x.status === 'deferred' ? 'deferred' : 'planned' }; delete y.proof; return y; });
    for (const s of d.screens || []) for (const b of s.blocks || []) delete b.buildState;
    for (const a of d.agents || []) delete a.buildState;
    // Developers often name a framework in the prompt ("in LangGraph") — honour it on every agent.
    if (fw) {
      for (const a of d.agents || []) a.framework = fw.id;
      d.plan.decisions = [...(d.plan.decisions || []).filter((x) => x.q !== 'Agent framework'), { q: 'Agent framework', a: `${fw.name} — from your prompt. One spec, so you can switch any agent later.` }];
    }
    d.plan.quote = pl?.quote || estimateQuote(d, { modelTier: d.settings.modelTier });
    d.status = 'ready';
    d.build = null;
  });
  setThinking(projectId, null);
  const np = getProject(projectId);
  const ps = np.plan.promises || [];
  const deferred = ps.filter((x) => x.status === 'deferred');
  const included = ps.filter((x) => x.status !== 'deferred');
  addChat(projectId, {
    type: 'plan',
    text: `Here’s the plan — ${included.length} promise${included.length === 1 ? '' : 's'}, ${np.agents.length} agent${np.agents.length === 1 ? '' : 's'}${fw && np.agents.length ? ` (${fw.name})` : ''} and ${np.screens.length} screen${np.screens.length === 1 ? '' : 's'}. Nothing is built or charged yet.`,
    data: { summary: np.plan.summary, promiseIds: ps.map((x) => x.id) },
  });
  if (deferred.length) {
    addChat(projectId, {
      type: 'scope',
      text: deferred.length === 1 ? 'Scope check: one optional extra is deferred for now — include it anytime.' : `Scope check: ${deferred.length} optional extras are deferred for now.`,
      data: { included: included.map((x) => x.id), deferred: deferred.map((x) => ({ id: x.id, reason: x.deferredReason || 'Deferred to keep the first build small.' })) },
    });
  }
  addChat(projectId, { type: 'quote', data: { status: 'open' } });
  addCheckpoint(projectId, { label: 'Plan ready', summary: 'Nothing built yet — wireframes only', kind: 'plan' });
  const q = np.plan.quote;
  logActivity(projectId, {
    kind: 'plan',
    plain: `Drafted the plan: ${included.length} promises, ${np.agents.length} agents, ${np.screens.length} screens${q ? ` · quote ${fmtRange(q.credits)} credits` : ''}.`,
    technical: `plan v1 · ${np.screens.reduce((a, s) => a + s.blocks.length, 0)} blocks · ${np.data.tables.length} tables · ${deferred.length} deferred`,
  });
}

const FW_HINTS = [[/lang ?graph|langchain/i, 'langgraph'], [/crew ?ai/i, 'crewai'], [/openai agents?( sdk)?/i, 'openai-agents'], [/claude agent sdk/i, 'claude-agent-sdk'], [/google adk|\badk\b/i, 'google-adk'], [/\bmastra\b/i, 'mastra'], [/git ?agent/i, 'gitagent']];
function frameworkFromPrompt(text = '') {
  const hit = FW_HINTS.find(([re]) => re.test(text || ''));
  return hit ? FRAMEWORKS.find((f) => f.id === hit[1]) || null : null;
}

function detectIntegration(text = '') {
  const t = text.toLowerCase();
  return INTEGRATIONS.find((i) => t.includes(i.name.toLowerCase()) || t.includes(i.id)) || null;
}

/** Move a deferred promise into scope (re-quotes before approval; a small run after a build). */
export function includePromise(projectId, promiseId) {
  const p = getProject(projectId);
  const pr = p?.plan?.promises?.find((x) => x.id === promiseId);
  if (!pr || pr.status !== 'deferred') return;
  const integ = detectIntegration(`${pr.deferredReason || ''} ${pr.title}`);
  const needsConnect = integ && !(p.integrations || []).some((i) => i.id === integ.id && i.status === 'connected');
  const cost = pr.cost || [3, 4];
  const moveScope = (d) => {
    for (const m of d.chat) if (m.type === 'scope' && m.data) m.data = { ...m.data, included: [...new Set([...(m.data.included || []), promiseId])], deferred: (m.data.deferred || []).filter((z) => z.id !== promiseId), includedNow: [...new Set([...(m.data.includedNow || []), promiseId])] };
    if (integ && !d.integrations.find((i) => i.id === integ.id)) d.integrations.push({ id: integ.id, status: 'needed', scopes: integ.scopes || [], usedBy: [] });
  };

  if (!isPreBuild(p)) {
    if (isActive(p)) { addChat(projectId, { type: 'system', text: `${pr.id} will be added after the current run.` }); queueAction(projectId, () => includePromise(projectId, promiseId)); return; }
    updateProject(projectId, moveScope);
    runEdit(projectId, {
      kind: 'promise', summary: `Include ${pr.id}: ${pr.title}`,
      plain: `Added ${pr.id} — ${pr.title}.${needsConnect ? ` It will start working once ${integ.name} is connected.` : ''}`,
      technical: `plan.promises.${pr.id} deferred → verified · workflows/${pr.id.toLowerCase()}.ts +22 −0`,
      credits: cost, touches: [],
      apply: (d) => { const x = d.plan.promises.find((y) => y.id === promiseId); if (x) { x.status = 'verified'; x.proof = needsConnect ? `Checked with a simulated ${integ.name} event` : 'Checked after the change'; delete x.deferredReason; } },
    });
    return;
  }

  updateProject(projectId, (d) => {
    const x = d.plan.promises.find((y) => y.id === promiseId);
    x.status = 'planned'; x.wasDeferred = x.deferredReason || true; delete x.deferredReason;
    moveScope(d);
    const old = d.plan.quote;
    if (old) {
      let q = null;
      try { q = estimateQuote(d, { modelTier: old.modelTier || d.settings.modelTier }); } catch {}
      if (!q || q === old || (q.credits?.[0] === old.credits?.[0] && q.credits?.[1] === old.credits?.[1])) {
        q = { ...old, credits: [old.credits[0] + cost[0], old.credits[1] + cost[1]], lines: [...(old.lines || []), { label: `${pr.id} · ${pr.title.length > 38 ? pr.title.slice(0, 36) + '…' : pr.title}`, credits: cost }] };
      }
      d.plan.quote = { ...q, cap: old.cap ?? q.cap ?? null };
    }
  });
  const np = getProject(projectId);
  addChat(projectId, {
    type: 'text',
    text: `Included **${pr.id}** — ${pr.title}. The quote is now **${fmtRange(np.plan.quote?.credits || cost)} credits**.${needsConnect ? ` It needs ${integ.name}; connect it now or any time before you publish.` : ''}`,
    data: needsConnect ? { actions: [{ label: `Connect ${integ.name}`, kind: 'connect', id: integ.id, icon: 'plug' }] } : undefined,
  });
  logActivity(projectId, { actor: 'You', kind: 'plan', plain: `Included ${pr.id} (${pr.title}) in the plan.`, technical: `promise ${pr.id} deferred → planned · quote ${fmtRange(np.plan.quote?.credits || cost)}` });
}

// ---------------------------------------------------------------------------
// Quote → build
// ---------------------------------------------------------------------------
export function approveQuote(projectId, { cap, modelTier } = {}) {
  const p = getProject(projectId);
  if (!p || isActive(p)) return;
  if (!session.value) { addChat(projectId, { type: 'system', text: 'Sign in to build — your plan is saved.' }); return; }
  const tier = modelTier || p.plan.quote?.modelTier || p.settings.modelTier || 'balanced';
  let q = p.plan.quote;
  if (!q || q.modelTier !== tier) { try { q = estimateQuote(p, { modelTier: tier }) || q; } catch {} }
  const finalCap = cap ?? q?.cap ?? null;
  updateProject(projectId, (d) => {
    d.plan.quote = { ...(q || {}), cap: finalCap, modelTier: tier };
    d.plan.approvedAt = Date.now();
    d.settings.budgetCap = finalCap;
    d.settings.modelTier = tier;
    d.status = 'building';
    for (const m of d.chat) if (m.type === 'quote' && m.data?.status === 'open') m.data = { ...m.data, status: 'approved', approvedAt: Date.now(), cap: finalCap, modelTier: tier };
  });
  addCheckpoint(projectId, { label: 'Plan approved', summary: 'Before the first build', kind: 'plan' });
  logActivity(projectId, { actor: 'You', kind: 'plan', plain: `Approved the plan and the quote (${fmtRange(q?.credits || [0, 0])} credits${finalCap ? `, cap ${finalCap}` : ''}).`, technical: `plan approved · model tier ${tier} · cap ${finalCap ?? 'none'}` });
  startBuild(projectId);
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------
const pendingActions = new Map(); // projectId -> [fn]
function queueAction(projectId, fn) { pendingActions.set(projectId, [...(pendingActions.get(projectId) || []), fn]); }

function setQueue(projectId, list) { queues.value = { ...queues.value, [projectId]: list }; }

/**
 * Send a chat message.
 * opts: { mode:'ask'|'plan'|'build', selection, context, thread, attachments, runMode }
 */
export function sendMessage(projectId, text, opts = {}) {
  const p = getProject(projectId);
  const body = String(text || '').trim();
  if (!p || !body) return null;
  // Questions never change anything, so they are answered right away — even mid-run.
  const mode = opts.mode || p.settings.mode;
  let readOnly = mode === 'ask' || isWhy(body);
  if (!readOnly && isActive(p)) { try { readOnly = interpretEdit(p, body, { selection: opts.selection || null })?.kind === 'question'; } catch { readOnly = false; } }
  const queue = isActive(p) && !readOnly;
  const msg = addChat(projectId, {
    role: 'user', type: 'text', text: body, thread: opts.thread || 'main',
    data: { mode, context: opts.context || null, attachments: opts.attachments?.length ? opts.attachments : undefined, queued: queue || undefined },
  });
  if (queue) {
    setQueue(projectId, [...(queues.value[projectId] || []), { id: msg.id, text: body, opts }]);
    return { queued: true, msg };
  }
  process(projectId, body, opts, msg);
  return { msg };
}

/** Remove a queued message before it runs. */
export function unqueue(projectId, msgId) {
  setQueue(projectId, (queues.value[projectId] || []).filter((q) => q.id !== msgId));
  updateChat(projectId, msgId, (m) => ({ data: { ...m.data, queued: false, cancelled: true } }));
}

function reply(projectId, text, data, thread) {
  return addChat(projectId, { type: 'text', text, data, thread: thread || 'main' });
}

async function process(projectId, text, opts, userMsg) {
  const p = getProject(projectId);
  if (!p) return;
  const mode = opts.mode || p.settings.mode || 'build';
  const thread = opts.thread || 'main';

  // Still answering clarifying questions → treat the message as extra context.
  if (p.status === 'planning' && p.chat.some((m) => m.type === 'questions' && !m.data?.answered)) {
    updateProject(projectId, (d) => { d.prompt = `${d.prompt}\n${text}`.trim(); });
    reply(projectId, 'Got it — I’ll factor that into the plan. Answer the questions above (or skip them) and I’ll draft it.', undefined, thread);
    return;
  }

  setThinking(projectId, mode === 'ask' || isWhy(text) ? 'Thinking…' : 'Working out the change…');
  await sleep(550);
  setThinking(projectId, null);
  if (isWhy(text) && !isPreBuild(getProject(projectId))) { explainWhy(projectId, text, thread); return; }
  let intent;
  try { intent = interpretEdit(getProject(projectId), text, { selection: opts.selection || null }); } catch (e) {
    console.error('[conversation] interpretEdit', e);
    reply(projectId, 'I couldn’t work out that change. Try describing what should look or behave differently — for example “make the header navy” or “add a Slack alert for hot leads”.', { error: true }, thread);
    return;
  }
  if (!intent) return;
  const cr = intent.credits || [1, 2];

  if (intent.kind === 'question' || mode === 'ask') {
    if (intent.kind === 'question') { reply(projectId, intent.answer || intent.plain || intent.summary, { free: true }, thread); return; }
    reply(projectId, `In **Ask** mode I don’t change anything. Here’s what I would do: ${intent.plain || intent.summary} It would cost about **${fmtRange(cr)} cr**.`, { free: true, actions: [{ label: `Do it · ≈${fmtRange(cr)} cr`, kind: 'send', text, mode: 'build', icon: 'play' }, { label: 'Show me a plan first', kind: 'send', text, mode: 'plan', icon: 'clipboard-list' }] }, thread);
    return;
  }

  if (intent.kind === 'connect') {
    const id = intent.integration || intent.target || intent.id || detectIntegration(text)?.id;
    if (id) {
      reply(projectId, `Let’s connect ${integrationById(id).name}. You’ll review exactly what it can do before anything is shared.`, { actions: [{ label: `Connect ${integrationById(id).name}`, kind: 'connect', id, icon: 'plug' }] }, thread);
      return { connect: id };
    }
  }

  if (intent.kind === 'promise' && (intent.promiseId || /\bP\d+\b/i.test(text))) {
    includePromise(projectId, intent.promiseId || text.match(/\bP\d+\b/i)[0].toUpperCase());
    return;
  }

  // Before the first build: plans are free — apply straight to the plan.
  if (isPreBuild(getProject(projectId))) {
    if (mode === 'plan') { proposal(projectId, text, intent, thread, true); return; }
    applyPlanEdit(projectId, intent, thread);
    return;
  }

  if (mode === 'plan') { proposal(projectId, text, intent, thread, false); return; }

  const cur = getProject(projectId);
  const runMode = opts.runMode || cur.settings.runMode || 'ask-risky';
  const destructive = !!intent.destructive || intent.kind === 'removeBlock' || /\b(delete|remove|drop|wipe|reset)\b/i.test(text) && intent.kind !== 'question';
  const allowed = (cur.settings.alwaysAllow || []).includes(intent.kind);
  const mustAsk = destructive || runMode === 'ask-every' || (runMode === 'ask-risky' && intent.risky && !allowed);
  if (mustAsk && !(runMode === 'autopilot' && !destructive)) {
    addChat(projectId, {
      type: 'approval', thread,
      data: {
        kind: 'edit', status: 'pending', text, intentKind: intent.kind, destructive,
        action: intent.summary || text,
        reason: destructive ? 'This removes or replaces part of your app. Destructive changes always ask first — in every run mode.' : intent.risky ? (intent.riskReason || 'This changes how your app handles data or talks to other services.') : 'You asked me to check before every change (run mode: Ask every time).',
        impact: `${(intent.touches || []).length ? `${intent.touches.length} part${intent.touches.length === 1 ? '' : 's'} change` : 'Small change'} · ≈${fmtRange(cr)} cr · a checkpoint is saved first so you can undo`,
        credits: cr,
      },
    });
    return;
  }
  runEdit(projectId, intent, { text });
}

// ---------------------------------------------------------------------------
// "Why is this ticket urgent?" — explain a value: who decided it, from what, by which rule.
// ---------------------------------------------------------------------------
function isWhy(t = '') { return /^\s*(why|how come)\b/i.test(t); }

function explainWhy(projectId, text, thread) {
  const p = getProject(projectId);
  const words = text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(Boolean);
  const tables = p.data?.tables || [];
  const agents = p.agents || [];
  const workers = agents.filter((a) => a.kind !== 'manager');
  // Prefer the table named in the question; else one whose status options match a word in it.
  let table = tables.find((tb) => words.some((w) => stem(w) === stem(tb.name)));
  let col = null, val = null;
  for (const tb of table ? [table] : tables) {
    for (const c of tb.columns || []) {
      const opt = (c.options || []).find((o) => words.includes(String(o).toLowerCase()));
      if (opt) { table = tb; col = c; val = opt; break; }
    }
    if (col) break;
  }
  table = table || tables[0];
  if (!table || !agents.length) {
    reply(projectId, 'I can explain values once the app has data and at least one agent. Nothing changed.', { free: true }, thread);
    return;
  }
  const cols = table.columns || [];
  const rows = table.rows || [];
  const row = (col && rows.find((r) => String(r[col.key]).toLowerCase() === String(val).toLowerCase())) || rows[0];
  const titleCol = cols.find((c) => /subject|title|name|summary/i.test(`${c.label} ${c.key}`) && c.type === 'text') || cols.find((c) => c.type === 'text') || cols[0];
  const rowName = row && titleCol ? row[titleCol.key] : null;
  if (!col) col = cols.find((c) => c.type === 'status' || c.type === 'score') || null;
  if (!val && col && row) val = row[col.key];
  const mentions = (a) => new RegExp(`\\b${stem(table.name)}`, 'i').test(`${a.role || ''} ${a.instructions || ''}`);
  const agent = workers.find((a) => col && (a.outputs || []).some((o) => stem(o.key) === stem(col.key))) || workers.find(mentions) || workers[0] || agents[0];
  const looked = cols.filter((c) => c !== col && c !== titleCol && c.key !== 'id' && !['url', 'bool', 'email', 'person'].includes(c.type)).slice(0, 3).map((c) => c.label);
  const rule = String(agent.instructions || '').split(/(?<=[.!?])\s+/).find((x) => x.length > 16) || agent.role || '';
  const subject = rowName ? `“${rowName}”` : `this ${String(table.name).toLowerCase().replace(/ies$/, 'y').replace(/s$/, '')}`;
  const lines = [
    `**Why ${subject} ${val ? `is ${val}` : 'looks like this'}**`,
    `- **Decided by:** ${agent.name}${agent.role ? ` — ${agent.role}` : ''}`,
    looked.length ? `- **It looked at:** ${looked.join(', ')}${col ? ` → set ${col.label}` : ''}` : null,
    rule ? `- **The rule it follows:** “${rule.replace(/\s+/g, ' ').slice(0, 180)}”` : null,
    `- **Data:** ${table.source === 'live' ? 'live data.' : 'sample rows — connect your real source to explain live records.'}`,
    '',
    'Want a different outcome? Change the rule in the agent, or tell me in Build mode. Nothing changed — this answer is free.',
  ].filter((x) => x !== null);
  reply(projectId, lines.join('\n'), {
    free: true,
    actions: [
      { label: 'See it in X-ray', kind: 'xray', icon: 'scan-eye' },
      { label: `Tune ${agent.name}`, kind: 'nav', href: `/p/${projectId}/agents/${agent.id}`, icon: 'bot' },
      { label: 'Agent logs', kind: 'panel', panel: 'logs', icon: 'scroll-text' },
    ],
  }, thread);
}

function proposal(projectId, text, intent, thread, preBuild) {
  addChat(projectId, {
    type: 'plan', thread, text: 'Here’s what I’d change. Nothing is applied until you say so.',
    data: { proposal: { text, plain: intent.plain || intent.summary, summary: intent.summary, technical: intent.technical || '', credits: preBuild ? [0, 0] : (intent.credits || [1, 2]), touches: intent.touches || [], kind: intent.kind, preBuild }, status: 'open' },
  });
}

function applyPlanEdit(projectId, intent, thread) {
  try {
    updateProject(projectId, (d) => { if (typeof intent.apply === 'function') intent.apply(d); for (const s of d.screens) for (const b of s.blocks) delete b.buildState; });
  } catch (e) {
    console.error('[conversation] plan edit', e);
    reply(projectId, 'That change didn’t fit the plan cleanly, so I left the plan as it was.', { error: true }, thread);
    return;
  }
  updateProject(projectId, (d) => {
    const old = d.plan.quote;
    try { const q = estimateQuote(d, { modelTier: old?.modelTier || d.settings.modelTier }); if (q) d.plan.quote = { ...q, cap: old?.cap ?? q.cap ?? null }; } catch {}
  });
  const cp = addCheckpoint(projectId, { label: intent.summary || 'Plan updated', summary: 'Plan edit · free', kind: 'plan' });
  const p = getProject(projectId);
  addChat(projectId, {
    type: 'change', thread, text: intent.plain || 'Updated the plan.',
    data: { plain: `${intent.plain || 'Updated the plan.'} Plans are free — the quote is now ${fmtRange(p.plan.quote?.credits || [0, 0])} credits.`, technical: intent.technical || '', diff: { added: 0, removed: 0 }, files: [], credits: 0, free: true, planOnly: true, checkpoint: cp?.n, checkpointId: cp?.id, prevCheckpointId: p.checkpoints[1]?.id || null, kind: intent.kind },
  });
  logActivity(projectId, { actor: 'You', kind: 'plan', plain: intent.plain || 'Updated the plan.', technical: intent.technical || '' });
}

/** Apply a plan-mode proposal card. */
export function applyProposal(projectId, msgId) {
  const p = getProject(projectId);
  const m = p?.chat.find((x) => x.id === msgId);
  if (!m?.data?.proposal) return;
  updateChat(projectId, msgId, (mm) => ({ data: { ...mm.data, status: 'applied' } }));
  let intent;
  try { intent = interpretEdit(p, m.data.proposal.text, {}); } catch { intent = null; }
  if (!intent) return;
  if (isPreBuild(p)) { applyPlanEdit(projectId, intent, m.thread); return; }
  if (isActive(p)) { setQueue(projectId, [...(queues.value[projectId] || []), { id: msgId, text: m.data.proposal.text, opts: { mode: 'build', thread: m.thread } }]); return; }
  runEdit(projectId, intent, { text: m.data.proposal.text });
}
export function discardProposal(projectId, msgId) {
  updateChat(projectId, msgId, (m) => ({ data: { ...m.data, status: 'discarded' } }));
}

/** Answer an approval card: 'approved' | 'denied' | 'always'. */
export function resolveApproval(projectId, msgId, decision) {
  const p = getProject(projectId);
  const m = p?.chat.find((x) => x.id === msgId);
  if (!m?.data || m.data.status !== 'pending') return;
  updateChat(projectId, msgId, (mm) => ({ data: { ...mm.data, status: decision === 'denied' ? 'denied' : 'approved', decidedAt: Date.now(), always: decision === 'always' } }));
  if (decision === 'always' && m.data.intentKind && !m.data.destructive) {
    updateProject(projectId, (d) => { d.settings.alwaysAllow = [...new Set([...(d.settings.alwaysAllow || []), m.data.intentKind])]; });
  }
  logActivity(projectId, { actor: 'You', kind: 'approval', plain: `${decision === 'denied' ? 'Denied' : 'Approved'}: ${m.data.action}`, technical: `approval ${msgId} → ${decision}` });
  if (decision === 'denied') { reply(projectId, 'Okay — nothing changed.', undefined, m.thread); return; }
  if (!m.data.text) return;
  let intent;
  try { intent = interpretEdit(p, m.data.text, {}); } catch { intent = null; }
  if (!intent) return;
  if (isActive(p)) { setQueue(projectId, [...(queues.value[projectId] || []), { id: msgId, text: m.data.text, opts: { mode: 'build', thread: m.thread, runMode: 'autopilot' } }]); return; }
  runEdit(projectId, intent, { text: m.data.text });
}

/**
 * Doctor card actions: 'fix' (free when caused by us) | 'rollback' | 'different' (Best model, ≈4 cr) | 'human'.
 */
export function fixAction(projectId, msgId, action) {
  const p = getProject(projectId);
  const m = p?.chat.find((x) => x.id === msgId);
  if (!m?.data || isActive(p)) return;
  const d0 = m.data;
  if (action === 'rollback') {
    const cp = p.checkpoints.find((c) => c.id === d0.checkpointId) || p.checkpoints.find((c) => c.kind !== 'safety' && c.kind !== 'restore');
    if (!cp) return;
    restoreCheckpoint(projectId, cp.id);
    updateChat(projectId, msgId, (mm) => ({ data: { ...mm.data, status: 'fixed', resolution: `Rolled back to #${cp.n}` } }));
    addChat(projectId, { type: 'checkpoint', text: '', data: { checkpointId: cp.id, label: cp.label, restored: true, n: cp.n } });
    logActivity(projectId, { actor: 'You', kind: 'restore', plain: `Rolled back to checkpoint #${cp.n} (“${cp.label}”).`, technical: `restoreCheckpoint(${cp.id}) · safety checkpoint created first` });
    return;
  }
  if (action === 'human') {
    updateChat(projectId, msgId, (mm) => ({ data: { ...mm.data, status: 'escalated', escalatedAt: Date.now() } }));
    reply(projectId, 'I’ve sent this to a human engineer with the full technical details and your last checkpoint. You’ll get an inbox message when they reply. (Prototype: simulated.)');
    pushInbox({ kind: 'needs', title: 'An engineer is looking at your issue', body: d0.what, projectId, href: `/p/${projectId}/app` });
    return;
  }
  const attempts = (d0.attempts || 1) + 1;
  updateChat(projectId, msgId, (mm) => ({ data: { ...mm.data, attempts } }));
  const best = action === 'different';
  runEdit(projectId, {
    kind: 'fix', summary: `Fix: ${d0.what.replace(/\.$/, '')}`,
    plain: best ? `Rebuilt the part with a different approach (Best model): ${d0.what.replace(/\.$/, '').toLowerCase()} is fixed.` : `Fixed: ${d0.what.replace(/\.$/, '')}. ${d0.free ? 'No charge — our change caused it.' : ''}`.trim(),
    technical: `${d0.where || ''} · ${best ? 'regenerated with tier=best' : 'patched'} +${best ? 18 : 6} −${best ? 11 : 3}`,
    credits: best ? [3, 5] : [1, 1], touches: d0.blockId ? [d0.blockId] : [],
    apply: () => {},
  }, { free: !best && d0.free, fixMsgId: msgId });
}

/** Retry the last message of a thread (e.g. after an error). */
export function retryText(projectId, text, opts) { return sendMessage(projectId, text, opts); }

// Drain queued messages when a run ends.
onRunEnd((projectId) => {
  const acts = pendingActions.get(projectId);
  if (acts?.length) { pendingActions.set(projectId, acts.slice(1)); acts[0](); return; }
  const list = queues.value[projectId] || [];
  if (!list.length) return;
  const [next, ...rest] = list;
  setQueue(projectId, rest);
  updateChat(projectId, next.id, (m) => (m.type === 'text' ? { data: { ...m.data, queued: false } } : {}));
  const p = getProject(projectId);
  if (!p) return;
  process(projectId, next.text, next.opts || {}, null);
});

export { uid as _uid };
