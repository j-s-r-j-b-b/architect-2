// Prompt → analysis → clarifying questions → full plan (promises, quote, screens, data, agents).
// Pure and deterministic for a given prompt + answers. Archetype builders live in ./gen/.
import { templateById, themePreset, integrationById } from './catalog.js';
import { estimateQuote } from './quote.js';
import { SALES } from './gen/arch-sales.js';
import { SUPPORT } from './gen/arch-support.js';
import { RECRUITING, ONBOARDING } from './gen/arch-people.js';
import { EXPENSES, INVOICES } from './gen/arch-finance.js';
import { BOOKING, CONTENT, KNOWLEDGE, LEGAL, CLAIMS } from './gen/arch-extra.js';
import { COMMERCE, ENGINEERING, EDUCATION, RESEARCH } from './gen/arch-extra2.js';
import { GENERIC, genericTopic } from './gen/arch-generic.js';
import { detectIntegrations, qualifier, entityWords, NOUN_KITS } from './gen/detect.js';
import { integrationsFor, envFor, distributeCosts, teammates, repack } from './gen/kit.js';
import { rng, calledName, pascal, uniq, cap } from './gen/text.js';

/** Every archetype, in tie-break order (earlier wins a tie). GENERIC is the fallback. */
export const ARCHETYPES = [SALES, SUPPORT, RECRUITING, ONBOARDING, EXPENSES, INVOICES, BOOKING, COMMERCE, CONTENT, KNOWLEDGE, LEGAL, CLAIMS, ENGINEERING, EDUCATION, RESEARCH];
export const archetypeById = (id) => ARCHETYPES.find((a) => a.id === id) || (id === 'generic' ? GENERIC : null);

const TEMPLATE_ARCH = {
  'lead-desk': 'sales', 'support-copilot': 'support', 'recruit-screen': 'recruiting', 'expense-auditor': 'expenses', 'content-studio': 'content', 'policy-assistant': 'knowledge',
  'contract-review': 'legal', 'claims-desk': 'claims', 'booking-concierge': 'booking', 'order-ops': 'commerce', 'sprint-reporter': 'engineering', tutor: 'education',
  'research-brief': 'research', 'onboarding-buddy': 'onboarding', 'invoice-chaser': 'invoices', 'bug-triage': 'engineering',
};

// Which actions read vs write, per integration used as a data source.
const SRC_IO = {
  hubspot: [['search_contacts'], ['update_deal'], 'create_note'], salesforce: [['query'], ['update_record']], gsheets: [['read_rows'], ['append_row']], airtable: [['list_records'], ['create_record']],
  freshdesk: [['list_tickets'], ['reply_ticket']], zendesk: [['list_tickets'], ['reply_ticket']], intercom: [['list_conversations'], []], gmail: [['search_email'], ['create_draft']], outlook: [['search_mail'], ['send_mail']],
  gdrive: [['search_files', 'read_file'], []], notion: [['search'], ['create_page']], confluence: [['search_pages'], []], dropbox: [['list_files'], []], gdocs: [[], ['create_doc']],
  stripe: [['list_charges'], ['create_invoice']], quickbooks: [['list_invoices'], []], shopify: [['list_orders'], ['update_inventory']], excel: [['read_range'], []], gcal: [['list_events'], ['create_event']],
  jira: [['search_issues'], ['create_issue']], linear: [[], ['create_issue']], github: [['list_prs'], ['create_issue']], postgres: [['query'], ['query']],
};
function srcObj(id) {
  if (!id || id === 'builtin') return null;
  const it = integrationById(id), io = SRC_IO[id] || [];
  let read = io[0]?.length ? io[0] : it.actions.filter((a) => /^(search|list|read|query|get)/.test(a));
  if (!read.length) read = it.actions.slice(0, 1);
  const write = io[1] ?? it.actions.filter((a) => !read.includes(a));
  return { id, name: it.name, read, write, note: io[2] || null };
}
const CHAT_ACTION = { slack: 'post_message', teams: 'post_message', telegram: 'send_message', whatsapp: 'send_message' };

// ---------------------------------------------------------------------------
// Analysis
// ---------------------------------------------------------------------------
function scoreArch(a, low, ints) {
  let s = 0;
  for (const [re, w] of a.match || []) if (re.test(low)) s += w;
  for (const id of ints) s += (a.hints?.[id] || 0) * 0.5;
  return s;
}
function pickArch(low, ints) {
  let best = GENERIC, bs = 0;
  for (const a of ARCHETYPES) { const s = scoreArch(a, low, ints); if (s > bs) { bs = s; best = a; } }
  return { arch: bs >= 1.5 ? best : GENERIC, score: bs };
}

/**
 * @param {string} prompt
 * @returns {{archetype:string, name:string, icon:string, color:string, integrations:string[], entities:string[], audience:string, summary:string}}
 */
export function analyzePrompt(prompt) {
  const text = String(prompt || '');
  const low = text.toLowerCase();
  const ints = detectIntegrations(text);
  const { arch, score } = pickArch(low, ints);
  const topic = arch === GENERIC ? genericTopic(text) : null;
  const preset = themePreset(arch.preset);
  const name = calledName(text) || arch.name(low, qualifier(low)) || 'Untitled app';
  return {
    archetype: arch.id, family: arch.family, label: arch.label, category: arch.category, confidence: Math.min(1, Math.round((score / 6) * 100) / 100),
    name, icon: topic ? (topic.todo ? 'check-circle' : NOUN_KITS[topic.kitKey]?.icon || arch.icon) : arch.icon, color: preset.primary, preset: preset.id,
    integrations: ints, entities: topic ? [topic.todo ? 'to-do' : topic.ew.one] : [arch.entity[0]],
    audience: cap(arch.team), summary: arch.pitch(low),
  };
}

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------
const opt = (value, label, rec) => (rec ? { value, label, hint: 'Recommended' } : { value, label });

/** 2–4 clarifying questions (see schema.js Question). */
export function generateQuestions(prompt, analysis = analyzePrompt(prompt)) {
  const arch = archetypeById(analysis?.archetype) || GENERIC;
  const ints = analysis?.integrations || detectIntegrations(prompt);
  const name = analysis?.name || 'your app';
  const qs = [];
  if (!arch.sources.some((s) => ints.includes(s))) {
    qs.push({ id: 'q_source', text: arch.sourceText, why: arch.sourceWhy, options: arch.sources.map((s, i) => opt(s, arch.sourceLabels?.[s] || (s === 'builtin' ? 'Built into this app' : integrationById(s).name), i === 0)) });
  }
  const dq = arch.domainQ;
  qs.push({ id: dq.id, text: dq.text, why: dq.why, options: dq.options.map(([v, l]) => opt(v, l, v === dq.rec)) });
  qs.push({ id: 'q_auto', text: arch.autonomy.text, why: 'You can change this anytime in the agent’s boundaries.', options: [opt('ask', arch.autonomy.ask, true), opt('auto', arch.autonomy.auto)] });
  qs.push({ id: 'q_users', text: `Who will use ${name}?`, options: [opt('me', arch.usersLabels?.me || 'Just me', arch.usersRec === 'me'), opt('team', arch.usersLabels?.team || `My ${arch.team}`, arch.usersRec === 'team'), opt('company', arch.usersLabels?.company || 'The whole company', arch.usersRec === 'company')] });
  return qs.slice(0, 4);
}

// ---------------------------------------------------------------------------
// Plan
// ---------------------------------------------------------------------------
function context(arch, prompt, answers, ints, opts, analysis) {
  const low = String(prompt || '').toLowerCase();
  const pick = (id) => { const v = answers?.[id]; return Array.isArray(v) ? v[0] : v; };
  const srcId = pick('q_source') || arch.sources.find((s) => ints.includes(s)) || arch.sources[0];
  const mentionedAll = uniq([...ints, srcId !== 'builtin' ? srcId : null]);
  const mail = ints.includes('outlook') && !ints.includes('gmail') ? { id: 'outlook', name: 'Outlook', send: 'send_mail', draft: null } : { id: 'gmail', name: 'Gmail', send: 'send_email', draft: 'create_draft' };
  const chatId = ints.find((i) => CHAT_ACTION[i]) || 'slack';
  const chat = { id: chatId, name: integrationById(chatId).name, action: CHAT_ACTION[chatId] };
  const users = pick('q_users') || arch.usersRec || 'team';
  const topic = arch === GENERIC ? genericTopic(prompt) : null;
  const name = opts.name || calledName(prompt) || (analysis?.archetype === arch.id && analysis?.name) || arch.name(low, qualifier(low));
  const r = rng(`${prompt}|${JSON.stringify(answers || {})}|${arch.id}`);
  const dq = arch.domainQ;
  return {
    r, now: Date.now(), low, prompt, arch, name, pascal: pascal(name), q: qualifier(low), topic,
    entity: topic ? entityWords(topic.todo ? 'to-do' : topic.noun) : entityWords(arch.entity[0]),
    src: srcObj(srcId), srcId, mentioned: mentionedAll, has: (id) => mentionedAll.includes(id),
    mail, mailTool: [mail.id, mail.draft ? [mail.draft, mail.send] : [mail.send]], chat, chatTool: [chat.id, [chat.action]],
    users, audienceShort: users === 'me' ? 'you' : users === 'company' ? (arch.id === 'booking' ? 'your staff and customers' : 'everyone in your company') : `your ${topic?.group || arch.team}`,
    autonomy: pick('q_auto') === 'auto' ? 'auto' : 'ask', domain: pick(dq.id) || dq.rec,
    team: teammates(r, 4), tier: opts.modelTier || 'balanced', connected: opts.connected || [],
    agentNames: opts.agentNames || null, sampleQuestion: arch.sampleQuestion, maxScreens: opts.maxScreens || 0,
  };
}

const NEEDS_TABLE = new Set(['table', 'kanban', 'cards', 'calendar', 'detail', 'form']);

/** Make every reference valid: bound tables/agents exist, spans pack to 12, promise refs resolve. */
function assemble(arch, c, out, opts) {
  const tables = out.tables.filter(Boolean);
  const tIds = new Set(tables.map((t) => t.id));
  const agents = out.agents.filter(Boolean);
  const aIds = new Set(agents.map((a) => a.id));
  const lead = aIds.has(out.lead) ? out.lead : agents[0]?.id;
  let screens = out.screens.filter(Boolean).slice(0, opts.maxScreens ? Math.max(2, opts.maxScreens) : 4);
  const promises = out.promises.filter(Boolean);
  const pIds = new Set(promises.map((p) => p.id));
  const seen = new Set();
  screens = screens.map((s) => {
    const blocks = [];
    for (const b of s.blocks) {
      if (seen.has(b.id)) b.id = `${b.id}_${s.id.replace(/^s_/, '')}`;
      seen.add(b.id);
      if (b.bind?.table && !tIds.has(b.bind.table)) { if (NEEDS_TABLE.has(b.type) || (b.type === 'chart' && !b.props?.series)) continue; delete b.bind.table; }
      if (b.bind?.agent && !aIds.has(b.bind.agent)) { if ((b.type === 'agentChat' || b.type === 'agentActivity') && lead) b.bind.agent = lead; else delete b.bind.agent; }
      if (b.bind && !b.bind.table && !b.bind.agent) delete b.bind;
      if (b.type === 'agentChat' && !b.bind?.agent) continue;
      if (b.props?.rowAction?.agent && !aIds.has(b.props.rowAction.agent)) b.props.rowAction.agent = lead;
      if (b.promise && !pIds.has(b.promise)) delete b.promise;
      delete b.buildState;
      blocks.push(b);
    }
    return { ...s, blocks: repack(blocks) };
  }).filter((s) => s.blocks.length);
  const sIds = new Set(screens.map((s) => s.id));
  for (const a of agents) {
    a.usedBy = screens.filter((s) => s.blocks.some((b) => b.bind?.agent === a.id || b.props?.rowAction?.agent === a.id)).map((s) => s.id);
    if (a.delegatesTo) a.delegatesTo = a.delegatesTo.filter((id) => aIds.has(id));
    delete a.buildState; delete a.stats;
  }
  for (const p of promises) p.refs = (p.refs || []).filter((id) => tIds.has(id) || aIds.has(id) || sIds.has(id));

  const integrations = integrationsFor(c, agents, tables);
  const env = envFor(c, integrations, out.env || []);
  const quote = estimateQuote({ screens, agents, data: { tables }, integrations, plan: { promises } }, { modelTier: c.tier });
  distributeCosts(promises, quote.credits);

  const preset = themePreset(/\bdark (?:mode|theme)\b/.test(c.low) ? 'midnight' : arch.preset);
  const dq = arch.domainQ;
  const users = { me: 'Just you', team: `${cap(c.topic?.group || arch.team)}, sign-in required`, company: arch.usersLabels?.company || 'The whole company, sign-in required' }[c.users] || 'Your team';
  const decisions = [
    { q: `${cap(c.entity.one)} source`, a: c.src ? c.src.name : 'Built into this app' },
    { q: 'Who uses it', a: users },
    { q: arch.autonomy.decision, a: c.autonomy === 'auto' ? arch.autonomy.autoA : arch.autonomy.askA },
    { q: dq.decision, a: (dq.options.find(([v]) => v === c.domain) || dq.options[0])[1] },
    ...(out.decisions || []),
  ];
  return {
    name: c.name, description: out.description || arch.pitch(c.low), icon: c.topic ? (c.topic.todo ? 'check-circle' : NOUN_KITS[c.topic.kitKey]?.icon || arch.icon) : arch.icon, color: preset.primary, archetype: arch.id,
    plan: { summary: out.summary, audience: c.users === 'me' ? 'Just you' : `${cap(c.topic?.group || arch.team)} (${arch.teamSize})`, promises, decisions, quote },
    theme: { preset: preset.id, primary: preset.primary, accent: preset.accent, radius: preset.radius, font: preset.font, mode: preset.dark ? 'dark' : 'light', density: 'comfortable' },
    screens, data: { tables }, agents, integrations, env,
  };
}

/**
 * Build the full plan. Blocks come back WITHOUT buildState (the simulator sets 'pending' when a build starts).
 * @returns {{name, description, icon, color, archetype, plan:{summary,audience,promises,decisions,quote}, theme, screens, data:{tables}, agents, integrations, env}}
 */
export function generatePlan(prompt, answers = {}, analysis = analyzePrompt(prompt), opts = {}) {
  const ints = uniq([...detectIntegrations(prompt), ...(opts.integrations || [])]);
  let arch = archetypeById(analysis?.archetype) || pickArch(String(prompt || '').toLowerCase(), ints).arch;
  let c = context(arch, prompt, answers, ints, opts, analysis);
  let out;
  try { out = arch.build(c); } catch (e) {
    console.warn('[generate] archetype failed, using the generic builder', e);
    arch = GENERIC; c = context(GENERIC, prompt, answers, ints, opts, null); out = GENERIC.build(c);
  }
  return assemble(arch, c, out, opts);
}

/** Same shape as generatePlan, from a prompt-library template id. */
export function planFromTemplate(templateId, answers = {}) {
  const t = templateById(templateId);
  if (!t) return generatePlan('', answers);
  const analysis = { ...analyzePrompt(t.prompt), name: t.title };
  if (TEMPLATE_ARCH[t.id]) analysis.archetype = TEMPLATE_ARCH[t.id];
  return generatePlan(t.prompt, answers, analysis, { name: t.title, agentNames: t.agents, integrations: t.integrations, maxScreens: t.screens });
}
