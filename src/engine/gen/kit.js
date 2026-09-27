// Builder kit: turns compact archetype specs into schema-complete tables, agents,
// blocks, screens, promises, integrations and env (see ../schema.js).
import { integrationById, MODELS } from '../catalog.js';
import { BLOCK_DEFAULT_SPAN } from '../schema.js';
import { FIRST, LAST, COMPANIES, TEAM } from './pools.js';
import { pascal, uniq, listJoin, M, H } from './text.js';

/** Built-in tools the platform runs with its own keys: connected from day one. */
export const PLATFORM_MANAGED = new Set(['websearch', 'scraper', 'arxiv', 'apollo', 'webhook']);
const ENV_KEYS = { hubspot: 'HUBSPOT_ACCESS_TOKEN', gmail: 'GMAIL_OAUTH', postgres: 'DATABASE_URL', stripe: 'STRIPE_SECRET_KEY', twilio: 'TWILIO_AUTH_TOKEN', shopify: 'SHOPIFY_ADMIN_TOKEN', slack: 'SLACK_BOT_TOKEN', whatsapp: 'WHATSAPP_CLOUD_TOKEN', openai: 'OPENAI_API_KEY' };
const MODEL_FOR = { fast: 'claude-haiku-4-5', balanced: 'claude-sonnet-5', best: 'claude-opus-5-5' };
export const WORKER_COLORS = ['#2F5BEA', '#139B4F', '#D9830B', '#0E8DA8', '#C2388F', '#5A6B7F'];
export const MANAGER_COLOR = '#7446F0';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
export const col = (key, label, type = 'text', options) => (options ? { key, label, type, options } : { key, label, type });

export function table(id, name, icon, columns, rows, { source = 'sample', connection = null, rules = '', prefix } = {}) {
  const pre = prefix || id.replace(/[^a-z]/g, '').slice(0, 2) || 'r';
  return { id, name, icon, columns, rows: rows.map((r, i) => ({ id: r.id || `${pre}${i + 1}`, ...r })), source, connection: connection || null, rules };
}

/** n unique fictional people. */
export function people(r, n) {
  const f = r.shuffle(FIRST), l = r.shuffle(LAST);
  return Array.from({ length: n }, (_, i) => {
    const first = f[i % f.length], last = l[(i * 7 + 3) % l.length];
    return { first, last, name: `${first} ${last}` };
  });
}
export const emailOf = (p, domain) => `${p.first.toLowerCase()}${domain.includes('.edu') || domain.includes('.co.uk') ? '.' + p.last.toLowerCase() : ''}@${domain}`;
export const personalEmail = (p, r) => `${p.first.toLowerCase()}.${p.last.toLowerCase()}@${r.pick(['gmail.com', 'outlook.com', 'proton.me', 'icloud.com'])}`;
export const companies = (r, n) => r.shuffle(COMPANIES).slice(0, n);
export const teammates = (r, n) => r.shuffle(TEAM).slice(0, n);

// ---------------------------------------------------------------------------
// Agents
// ---------------------------------------------------------------------------
const APPROVAL_PHRASE = {
  send_email: 'sending any email', send_mail: 'sending any email', reply_ticket: 'replying to a customer', send_sms: 'texting anyone', send_message: 'messaging anyone',
  create_event: 'booking a calendar event', share_post: 'publishing a post', post: 'publishing a post', post_message: 'posting to a channel', create_issue: 'filing an issue',
  update_deal: 'changing a CRM record', update_record: 'changing a CRM record', create_invoice: 'creating an invoice', update_inventory: 'changing stock levels',
  create_doc: 'publishing a document', append_row: 'writing to the shared sheet', create_task: 'creating tasks', create_card: 'creating cards', create_page: 'publishing a page',
  approve_expense: 'approving or rejecting an expense', decide_claim: 'sending a claim decision', publish_quiz: 'publishing a quiz to students', start_campaign: 'starting a campaign',
  confirm_booking: 'confirming a booking', place_call: 'placing a call', trigger_zap: 'triggering an automation',
};
export const approvalPhrase = (a) => APPROVAL_PHRASE[a] || a.replace(/_/g, ' ');

/**
 * Build a full AgentSpec from a compact spec.
 * s: { id, name, kind, role, goal, instructions, tier, creativity, knowledge:[[type,name,size]], tools:[[id,[actions]]],
 *      risky:[action], critical:[action], triggers:[[type,detail]], outputs:[[key,type,desc]], topics, blocked, memory,
 *      toxicity, costPerRun, steps, budget, handles, runs:[[action, detail]] }
 */
export function agent(c, s, index = 0) {
  const tier = s.tier || c.tier || 'balanced';
  const m = MODELS.find((x) => x.id === MODEL_FOR[tier]) || MODELS[1];
  const toolMap = new Map();
  for (const t of s.tools || []) {
    if (!t || !t[0]) continue;
    const it = integrationById(t[0]);
    const valid = (t[1] || []).filter((a) => it.actions.includes(a));
    toolMap.set(t[0], uniq([...(toolMap.get(t[0]) || []), ...(valid.length ? valid : it.actions.slice(0, 1))]));
  }
  const tools = [...toolMap].map(([id, actions]) => ({ id, name: integrationById(id).name, actions }));
  const acts = new Set(tools.flatMap((t) => t.actions));
  const ok = (a) => acts.has(a) || (s.platform || []).includes(a);
  const risky = (s.risky || []).filter(ok), critical = (s.critical || []).filter(ok);
  const approvals = c.autonomy === 'auto' ? uniq(critical) : uniq([...critical, ...risky]);
  let instructions = s.instructions.trim();
  if (approvals.length) instructions += ` Ask a human to approve before ${listJoin(uniq(approvals.map(approvalPhrase)))}.`;
  else if (risky.length && c.autonomy === 'auto') instructions += ' You may act without asking, but log every action with a one-line reason.';
  const a = {
    id: s.id, name: s.name, kind: s.kind || 'worker', role: s.role, instructions, goal: s.goal || s.role,
    color: s.color || (s.kind === 'manager' ? MANAGER_COLOR : WORKER_COLORS[index % WORKER_COLORS.length]),
    framework: 'architect',
    model: { tier, provider: m.provider, model: m.id, creativity: s.creativity ?? 0.3 },
    knowledge: (s.knowledge || []).map(([type, name, size], i) => ({ id: `k_${s.id.replace(/^a_/, '')}_${i + 1}`, type, name, ...(size ? { size } : {}), status: 'ready' })),
    tools,
    approvals,
    limits: { costPerRun: s.costPerRun ?? (tier === 'best' ? 0.2 : tier === 'fast' ? 0.03 : 0.08), steps: s.steps ?? 12, monthlyBudget: s.budget ?? 25 },
    guardrails: { pii: true, injection: true, toxicity: s.toxicity ?? true, groundedness: s.groundedness ?? true, topics: s.topics || [], blocked: s.blocked || [] },
    memory: s.memory || 'none',
    triggers: (s.triggers || [['chat', `${s.name} panel`]]).map(([type, detail]) => ({ type, detail })),
    outputs: (s.outputs || [['answer', 'text']]).map(([key, type, desc]) => ({ key, type, ...(desc ? { desc } : {}) })),
    usedBy: [],
    version: 1, status: 'draft', evalScore: null,
  };
  if (s.delegatesTo) a.delegatesTo = s.delegatesTo;
  return a;
}

/**
 * Workers (+ a manager when there are 2 or more). Returns { agents, lead, specs }.
 * mgr: { name, goal, knowledge, topics, blocked }
 */
export function team(c, workerSpecs, mgr = {}) {
  let specs = workerSpecs.filter(Boolean);
  if (c.agentNames?.length) { // template: exactly these agents, in this order
    const pool = specs.slice();
    specs = c.agentNames.map((nm, i) => {
      const hit = pool.find((s) => s.name.toLowerCase() === nm.toLowerCase()) || pool.find((s) => (s.alias || []).some((x) => nm.toLowerCase().includes(x)));
      if (hit) { pool.splice(pool.indexOf(hit), 1); return { ...hit, name: nm }; }
      const base = pool.shift() || specs[i] || specs[0];
      return { ...base, id: base.id + '_' + i, name: nm };
    });
  }
  const workers = specs.map((s, i) => agent(c, s, i));
  const agents = [...workers];
  let lead = workers[0]?.id;
  if (workers.length >= 2) {
    const routes = specs.map((s) => `send ${s.handles || 'related requests'} to ${s.name}`);
    const m = agent(c, {
      id: 'a_manager', name: mgr.name || `${c.name} Manager`, kind: 'manager',
      role: 'Understands your question and hands it to the right specialist',
      goal: mgr.goal || `Answer questions about ${c.entity.many} and route work to the right specialist.`,
      instructions: `You coordinate the ${c.name} team: ${listJoin(routes)}. Always say which ${c.entity.many} you looked at and cite the source. Keep answers under 5 sentences and offer one clear next step. If no specialist can do it, say so plainly instead of guessing.`,
      tier: 'balanced', creativity: 0.3, memory: 'session',
      knowledge: mgr.knowledge || [], tools: [], topics: mgr.topics || [], blocked: mgr.blocked || [],
      triggers: [['chat', `Ask ${c.name} panel`]], outputs: [['answer', 'text'], ['citations', 'list']],
      delegatesTo: workers.map((w) => w.id), costPerRun: 0.1, steps: 15, budget: 20,
    });
    agents.unshift(m);
    lead = m.id;
  }
  return { agents, lead, specs };
}

/** "Agent runs" test table with plausible recent runs for every agent. */
export function runsTable(c, agents, specs = []) {
  const rows = [];
  let t = c.now - (8 + c.r.int(0, 20)) * M;
  const workers = agents.filter((a) => a.kind !== 'manager');
  workers.forEach((a) => {
    const spec = specs.find((s) => s.name === a.name || s.id === a.id) || {};
    const runs = spec.runs || [[`Handled ${c.entity.many}`, a.tools.map((x) => `${x.id}.${x.actions[0]}`).join(' → ') || 'knowledge lookup']];
    for (const [action, detail] of runs.slice(0, 2)) {
      rows.push({ at: t, agent: a.name, action, detail, cost: Math.round((0.02 + c.r() * 0.07) * 100) / 100 });
      t -= (1 + c.r() * 5) * H;
    }
  });
  const mgr = agents.find((a) => a.kind === 'manager');
  if (mgr && workers[0]) rows.push({ at: t - 20 * H, agent: mgr.name, action: `Answered “${c.sampleQuestion || `What needs my attention today?`}”`, detail: `delegated → ${workers[0].name} · ${c.entity.many} table (Sample)`, cost: 0.02 });
  rows.sort((a, b) => b.at - a.at);
  return table('agent_runs', 'Agent runs', 'activity', [
    col('at', 'When', 'datetime'), col('agent', 'Agent', 'text'), col('action', 'What happened', 'text'), col('detail', 'Steps', 'longtext'), col('cost', 'Cost ($)', 'money'),
  ], rows, { source: 'test', rules: 'Written by agents; read-only for teammates.', prefix: 'r' });
}

// ---------------------------------------------------------------------------
// Blocks & screens
// ---------------------------------------------------------------------------
function clean(o) { for (const k of Object.keys(o)) if (o[k] === undefined) delete o[k]; return o; }

export function block(type, id, o = {}) {
  const b = { id, type, span: o.span ?? BLOCK_DEFAULT_SPAN[type] ?? 12 };
  if (o.title) b.title = o.title;
  b.file = o.file || `components/${pascal(id.replace(/^b_/, ''))}.tsx`;
  if (o.promise) b.promise = o.promise;
  if (o.table || o.agent) b.bind = clean({ table: o.table, agent: o.agent });
  b.props = clean({ ...(o.props || {}) });
  return b;
}
export const routeFile = (route) => `app${route === '/' ? '' : route}/page.tsx`;
export const K = (label, value, delta, tone = 'flat', icon = 'activity') => ({ label, value: String(value), delta, tone, icon });

export const B = {
  header: (id, route, title, subtitle, actions = [], o = {}) => block('header', id, { ...o, file: routeFile(route), props: { title, subtitle, actions: actions.map(([label, variant = 'secondary', icon]) => clean({ label, variant, icon })) } }),
  hero: (id, title, subtitle, cta, secondaryCta, o = {}) => block('hero', id, { ...o, props: { title, subtitle, cta, secondaryCta, image: 'gradient' } }),
  kpis: (id, items, o = {}) => block('kpis', id, { ...o, props: { items } }),
  table: (id, tableId, o = {}) => block('table', id, { ...o, table: tableId, props: { columns: o.columns, searchable: o.searchable ?? true, filters: o.filters || [], rowAction: o.rowAction, pageSize: o.pageSize || 8 } }),
  chart: (id, o = {}) => block('chart', id, { ...o, props: o.series ? { kind: o.kind || 'bar', series: o.series, xLabel: o.xLabel, yLabel: o.yLabel } : { kind: o.kind || 'bar', groupBy: o.groupBy, metric: o.metric || 'count' } }),
  chat: (id, agentId, o = {}) => block('agentChat', id, { ...o, agent: agentId, props: { greeting: o.greeting, placeholder: o.placeholder || 'Ask anything…', suggestions: o.suggestions || [] } }),
  activity: (id, agentId, o = {}) => block('agentActivity', id, { title: 'What the agents did', ...o, agent: agentId, table: o.table ?? 'agent_runs', props: { limit: o.limit || 4 } }),
  kanban: (id, tableId, o = {}) => block('kanban', id, { ...o, table: tableId, props: { groupBy: o.groupBy, titleKey: o.titleKey, subtitleKey: o.subtitleKey } }),
  cards: (id, tableId, o = {}) => block('cards', id, { ...o, table: tableId, props: { titleKey: o.titleKey, subtitleKey: o.subtitleKey, metaKeys: o.metaKeys || [], badgeKey: o.badgeKey } }),
  list: (id, o = {}) => block('list', id, { ...o, props: o.items ? { items: o.items } : { titleKey: o.titleKey, metaKey: o.metaKey } }),
  detail: (id, tableId, fields, o = {}) => block('detail', id, { ...o, table: tableId, props: { fields } }),
  text: (id, body, o = {}) => block('text', id, { ...o, props: { body } }),
  calendar: (id, tableId, o = {}) => block('calendar', id, { ...o, table: tableId, props: { dateKey: o.dateKey, titleKey: o.titleKey } }),
  form: (id, tbl, keys, o = {}) => block('form', id, { ...o, table: tbl.id, props: { fields: fieldsFrom(tbl, keys), submitLabel: o.submitLabel || 'Save', successText: o.successText || 'Saved.' } }),
  steps: (id, items, o = {}) => block('steps', id, { ...o, props: { items: items.map(([title, body]) => ({ title, body })) } }),
};

const FIELD_TYPE = { status: 'select', money: 'number', number: 'number', percent: 'number', score: 'number', date: 'date', datetime: 'datetime', email: 'email', longtext: 'textarea', bool: 'checkbox', url: 'url' };
export function fieldsFrom(tbl, keys) {
  return keys.map((k) => {
    const cdef = tbl.columns.find((x) => x.key === k) || { key: k, label: k, type: 'text' };
    return clean({ key: cdef.key, label: cdef.label, type: FIELD_TYPE[cdef.type] || 'text', options: cdef.options, placeholder: PLACEHOLDER[cdef.type] });
  });
}
const PLACEHOLDER = { email: 'name@company.com', money: '0.00', person: 'Full name', url: 'https://', longtext: 'Add details…' };

/** Pack blocks into rows of 12; a row that comes up short stretches its last block. */
export function repack(blocks) {
  let row = [], used = 0;
  const flush = () => { if (row.length && used < 12) row[row.length - 1].span += 12 - used; row = []; used = 0; };
  for (const b of blocks) {
    b.span = Math.max(3, Math.min(12, Math.round(b.span || BLOCK_DEFAULT_SPAN[b.type] || 12)));
    if (used + b.span > 12) flush();
    row.push(b); used += b.span;
    if (used === 12) flush();
  }
  flush();
  return blocks;
}
export const screen = (id, route, title, icon, blocks, nav = true) => ({ id, route, title, icon, nav, blocks: repack(blocks.filter(Boolean)) });

// ---------------------------------------------------------------------------
// Promises, integrations, env
// ---------------------------------------------------------------------------
/** Promise with a relative weight used to split the quote. */
export const P = (id, title, detail, checks, refs = [], weight = 1) => ({ id, title, detail, checks, status: 'planned', cost: [0, 0], refs, _w: weight });
/** The one optional, deferred "stretch" promise. */
export function stretch(c, id, title, detail, checks, { integration, est = [3, 4] } = {}) {
  const need = integration && !PLATFORM_MANAGED.has(integration) && !(c.connected || []).includes(integration);
  const why = need ? `Needs a ${integrationById(integration).name} connection` : 'Optional — not needed for day one';
  return { id, title, detail, checks, status: 'deferred', cost: est, deferredReason: `${why} — include it anytime (≈${est[1]} credits).`, refs: [], _stretch: integration || null };
}

export function integrationsFor(c, agents, tables) {
  const map = new Map();
  for (const a of agents) for (const t of a.tools) { const e = map.get(t.id) || { id: t.id, usedBy: [] }; e.usedBy.push(a.id); map.set(t.id, e); }
  for (const t of tables) if (t.connection && !map.has(t.connection)) map.set(t.connection, { id: t.connection, usedBy: [] });
  return [...map.values()].map((e) => {
    const it = integrationById(e.id);
    const managed = PLATFORM_MANAGED.has(e.id) || it.auth === 'none';
    const connected = managed || (c.connected || []).includes(e.id);
    return { id: e.id, status: connected ? 'connected' : 'needed', scopes: it.scopes.slice(), usedBy: uniq(e.usedBy), ...(managed ? { builtIn: true } : {}) };
  });
}

export function envFor(c, integrations, extra = []) {
  const out = [];
  for (const i of integrations) {
    if (i.builtIn) continue;
    const it = integrationById(i.id);
    const key = ENV_KEYS[i.id] || `${i.id.toUpperCase()}_${it.auth === 'apikey' ? 'API_KEY' : 'OAUTH'}`;
    const set = i.status === 'connected' ? { set: true, last4: 'auto', managed: true } : null;
    out.push({ key, secret: true, source: i.id, values: { draft: set, staging: set, production: set } });
  }
  for (const [key, val] of extra) out.push({ key, secret: false, source: 'user', values: { draft: String(val), staging: String(val), production: String(val) } });
  return out;
}

/** Split a credit range across active promises by weight; exact sums. */
export function distributeCosts(promises, credits) {
  const active = promises.filter((p) => p.status !== 'deferred');
  const W = active.reduce((s, p) => s + (p._w || 1), 0) || 1;
  for (let end = 0; end < 2; end++) {
    const total = credits[end];
    let acc = 0;
    active.forEach((p) => { const v = Math.max(1, Math.round((total * (p._w || 1)) / W)); p.cost[end] = v; acc += v; });
    const heavy = active.slice().sort((a, b) => (b._w || 1) - (a._w || 1))[0];
    if (heavy) heavy.cost[end] = Math.max(1, heavy.cost[end] + (total - acc));
  }
  for (const p of active) if (p.cost[1] < p.cost[0]) p.cost[1] = p.cost[0];
  for (const p of promises) { delete p._w; delete p._stretch; }
  return promises;
}
