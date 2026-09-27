// Agent spec helpers: defaults, cost estimates, templates, "describe it" → spec, and
// plain-language diffs between two versions of an agent (used by staging & Copilot).
import { uid, deepClone, colorFor } from '../../lib/util.js';
import { INTEGRATIONS, integrationById, MODEL_TIERS, MODELS, frameworkById } from '../../engine/catalog.js';
import { humanizeAction } from '../../engine/frameworks.js';

export { humanizeAction };

/** Fields a person edits on the card. Everything else (stats, tests, evals) is measured, not authored. */
export const EDITABLE_KEYS = ['name', 'role', 'goal', 'instructions', 'kind', 'color', 'framework', 'model', 'knowledge', 'tools', 'approvals', 'limits', 'guardrails', 'memory', 'triggers', 'outputs', 'delegatesTo', 'channels', 'codeOverrides'];

export const AGENT_COLORS = ['#2F5BEA', '#7446F0', '#139B4F', '#D9830B', '#0E8DA8', '#C2388F', '#D93A2B', '#5A6B7F'];
export const TIER_MODEL = { fast: 'claude-haiku-4-5', balanced: 'claude-sonnet-5', best: 'claude-opus-5-5' };
const TIER_BASE = { fast: 0.003, balanced: 0.008, best: 0.022 };

export function normalizeAgent(a = {}) {
  return {
    id: a.id || uid('a'),
    name: a.name || 'New agent',
    kind: a.kind || 'worker',
    role: a.role || '',
    instructions: a.instructions || '',
    goal: a.goal || '',
    color: a.color || colorFor(a.name || 'agent'),
    framework: a.framework || 'architect',
    model: { tier: 'balanced', provider: 'Anthropic', model: TIER_MODEL[a.model?.tier || 'balanced'], creativity: 0.3, ...(a.model || {}) },
    knowledge: a.knowledge || [],
    tools: a.tools || [],
    approvals: a.approvals || [],
    limits: { costPerRun: 0.05, steps: 10, monthlyBudget: 20, ...(a.limits || {}) },
    guardrails: { pii: true, injection: true, toxicity: true, groundedness: true, topics: [], blocked: [], ...(a.guardrails || {}) },
    memory: a.memory || 'session',
    triggers: a.triggers || [],
    outputs: a.outputs || [],
    usedBy: a.usedBy || [],
    delegatesTo: a.delegatesTo || [],
    channels: a.channels || {},
    codeOverrides: a.codeOverrides || {},
    version: a.version || 1,
    status: a.status || 'draft',
    evalScore: a.evalScore ?? null,
    stats: a.stats || null,
    // keep any extra fields (tests, evals, stats…) but never let undefined wipe a default
    ...Object.fromEntries(Object.entries(a).filter(([k, v]) => v !== undefined && v !== null && !['model', 'limits', 'guardrails'].includes(k))),
  };
}

/** Estimated model cost of one run in USD, from the tier and how much the agent does. */
export function estCostPerRun(agent, tier) {
  const t = tier || agent?.model?.tier || 'balanced';
  const nTools = (agent?.tools || []).reduce((n, x) => n + Math.max(1, (x.actions || []).length), 0);
  const k = (agent?.knowledge || []).length;
  const v = TIER_BASE[t] * (1 + nTools * 0.18 + k * 0.12 + (agent?.kind === 'manager' ? 0.4 : 0));
  return Math.round(v * 1000) / 1000;
}
export const fmtUsd = (n) => (n == null ? '—' : n < 0.1 ? `$${(+n).toFixed(3).replace(/0$/, '')}` : `$${(+n).toFixed(2)}`);

export const tierById = (id) => MODEL_TIERS.find((t) => t.id === id) || MODEL_TIERS[1];
export const modelById = (id) => MODELS.find((m) => m.id === id) || null;

/** Actions that change data or reach other people — the ones worth an approval gate. */
export const RISKY_RE = /send|post|create_event|update|delete|reply|share|start_campaign|place_call|create_invoice|append|trigger|add_lead|update_inventory|charge/;
export const isRisky = (action) => RISKY_RE.test(action);
export function riskyActions(agent) {
  const out = [];
  for (const t of agent?.tools || []) for (const a of t.actions || []) if (isRisky(a)) out.push({ action: a, tool: t.id, toolName: integrationById(t.id).name });
  return out;
}

/** Which tools are still missing a connection for this project. */
export function toolConnection(project, toolId, connections) {
  const pi = project?.integrations?.find((i) => i.id === toolId);
  if (pi) return pi.status === 'connected' ? 'connected' : 'needed';
  const it = integrationById(toolId);
  if (it.auth === 'none') return 'connected';
  return connections?.integrations?.[toolId] ? 'connected' : 'needed';
}

// ---------------------------------------------------------------------------
// Triggers
// ---------------------------------------------------------------------------
export const TRIGGER_TYPES = [
  { id: 'chat', label: 'Chat', icon: 'message-square', desc: 'Someone asks in a chat panel' },
  { id: 'schedule', label: 'Schedule', icon: 'clock', desc: 'Runs on a timer' },
  { id: 'webhook', label: 'Webhook', icon: 'webhook', desc: 'Another system calls a URL' },
  { id: 'email', label: 'Email', icon: 'mail', desc: 'An email arrives at its inbox' },
  { id: 'event', label: 'Event', icon: 'zap', desc: 'Something happens in your app' },
];
export const triggerType = (id) => TRIGGER_TYPES.find((t) => t.id === id) || TRIGGER_TYPES[0];
export const SCHEDULE_PRESETS = ['Every 5 minutes', 'Every hour', 'Every weekday at 9:00', 'Every Monday at 8:00', 'Every day at 18:00', 'First day of the month'];
export function eventOptions(project) {
  const out = [];
  for (const t of project?.data?.tables || []) out.push(`New row in ${t.name}`);
  for (const t of project?.data?.tables || []) {
    const st = t.columns?.find((c) => c.type === 'status' && c.options?.length);
    if (st) out.push(`${t.name.replace(/s$/, '')} ${st.label.toLowerCase()} changes`);
  }
  if ((project?.agents || []).some((a) => a.outputs?.some((o) => o.key === 'tier'))) out.unshift('A lead becomes Hot');
  return [...new Set(out)].slice(0, 8);
}
export const webhookUrl = (project, agent) => `https://hooks.architect.space/${(project?.slug || project?.id || 'app').slice(0, 24)}/${agent.id}`;
export const inboxAddress = (agent) => `${String(agent.name || 'agent').toLowerCase().replace(/[^a-z0-9]+/g, '-')}@in.architect.space`;

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------
export const AGENT_TEMPLATES = [
  {
    id: 'researcher', name: 'Researcher', icon: 'compass', color: '#7446F0',
    role: 'Researches a topic on the web and writes a short, cited brief',
    goal: 'Answer a research question with a one-page brief where every claim has a source.',
    instructions: 'Search the web for the question, read the three to five most relevant pages, and write a brief under 300 words. Cite every claim with the page it came from. If sources disagree, say so. Never guess — write "not found" instead.',
    tools: [{ id: 'websearch', actions: ['search_web'] }, { id: 'scraper', actions: ['read_url'] }],
    outputs: [{ key: 'brief', type: 'text' }, { key: 'sources', type: 'list' }], memory: 'session', triggers: [{ type: 'chat', detail: 'Research panel' }],
  },
  {
    id: 'support-triage', name: 'Support triage', icon: 'headphones', color: '#0E8DA8',
    role: 'Sorts incoming tickets by urgency and topic and drafts a first reply',
    goal: 'Every new ticket gets an urgency, a topic and a draft reply within 2 minutes.',
    instructions: 'For each new ticket, decide urgency (Urgent, Normal, Low) and topic. Draft a friendly first reply from the help-center articles, quoting the article you used. Escalate angry customers or anything about billing errors to a human.',
    tools: [{ id: 'freshdesk', actions: ['list_tickets', 'reply_ticket'] }, { id: 'slack', actions: ['post_message'] }],
    approvals: ['reply_ticket'], outputs: [{ key: 'urgency', type: 'Urgent | Normal | Low' }, { key: 'topic', type: 'text' }, { key: 'draft', type: 'text' }],
    memory: 'none', triggers: [{ type: 'webhook', detail: 'Freshdesk: ticket created' }],
  },
  {
    id: 'email-writer', name: 'Email writer', icon: 'mail', color: '#139B4F',
    role: 'Writes personal emails in your tone — you approve before anything is sent',
    goal: 'Draft on-brand emails that get replies, never sending without approval.',
    instructions: 'Write short, personal emails (under 120 words) with one clear next step. Match the tone guide. Never promise discounts or deadlines. Every email must be approved by a person before it is sent.',
    tools: [{ id: 'gmail', actions: ['create_draft', 'send_email'] }],
    approvals: ['send_email'], outputs: [{ key: 'subject', type: 'text' }, { key: 'body', type: 'text' }], memory: 'long-term', triggers: [{ type: 'chat', detail: 'Email panel' }],
  },
  {
    id: 'data-analyst', name: 'Data analyst', icon: 'bar-chart', color: '#2F5BEA',
    role: 'Answers questions about your spreadsheets with numbers and a chart',
    goal: 'Turn a plain question into a correct number, a short explanation and a chart.',
    instructions: 'Read the relevant sheet, compute the answer exactly (show the formula you used), and explain it in two sentences. Suggest one chart that shows it. If the data is missing or ambiguous, ask a clarifying question instead of guessing.',
    tools: [{ id: 'gsheets', actions: ['read_rows'] }],
    outputs: [{ key: 'answer', type: 'text' }, { key: 'value', type: 'number' }, { key: 'chart', type: 'text' }], memory: 'session', triggers: [{ type: 'chat', detail: 'Ask the data' }],
  },
  {
    id: 'scheduler', name: 'Scheduler', icon: 'calendar', color: '#D9830B',
    role: 'Finds times that work and books meetings — asks before sending invites',
    goal: 'Book meetings in as few messages as possible, respecting working hours.',
    instructions: 'Find three slots that fit everyone’s calendar within working hours (9:00–17:30 in their time zone). Propose them in one message. Book only after a person confirms, and add a short agenda to the invite.',
    tools: [{ id: 'gcal', actions: ['list_events', 'create_event'] }, { id: 'gmail', actions: ['send_email'] }],
    approvals: ['create_event', 'send_email'], outputs: [{ key: 'slots', type: 'list' }, { key: 'booked', type: 'bool' }], memory: 'long-term', triggers: [{ type: 'email', detail: 'Forwarded meeting requests' }],
  },
  {
    id: 'summariser', name: 'Summariser', icon: 'file-text', color: '#5A6B7F',
    role: 'Turns long documents and threads into a short summary with key points',
    goal: 'Give a busy reader everything important in under a minute.',
    instructions: 'Summarise the document in five bullet points or fewer, then list decisions, owners and dates. Keep the author’s meaning — don’t add opinions. Link each point to the page or message it came from.',
    tools: [{ id: 'gdrive', actions: ['search_files', 'read_file'] }],
    outputs: [{ key: 'summary', type: 'text' }, { key: 'key_points', type: 'list' }], memory: 'none', triggers: [{ type: 'chat', detail: 'Summarise panel' }],
  },
];

export function agentFromTemplate(tpl, extra = {}) {
  return normalizeAgent({
    id: uid('a'), name: tpl.name, color: tpl.color, role: tpl.role, goal: tpl.goal, instructions: tpl.instructions,
    tools: tpl.tools.map((t) => ({ id: t.id, name: integrationById(t.id).name, actions: [...t.actions] })),
    approvals: [...(tpl.approvals || [])], outputs: deepClone(tpl.outputs || []), memory: tpl.memory, triggers: deepClone(tpl.triggers || []),
    model: { tier: 'balanced', provider: 'Anthropic', model: TIER_MODEL.balanced, creativity: tpl.id === 'email-writer' ? 0.6 : 0.2 },
    version: 1, status: 'draft', evalScore: null, stats: { runs: 0, cost: 0, latencyMs: 0, errors: 0 },
    ...extra,
  });
}

// ---------------------------------------------------------------------------
// "Describe it" → a complete agent spec with good defaults
// ---------------------------------------------------------------------------
const KEYWORD_TOOLS = [
  [/\b(e-?mails?|inbox|follow[- ]?ups?|gmail)\b/i, 'gmail', ['create_draft', 'send_email']],
  [/\boutlook\b/i, 'outlook', ['search_mail', 'send_mail']],
  [/\bslack\b/i, 'slack', ['post_message']],
  [/\bteams\b/i, 'teams', ['post_message']],
  [/\b(calendar|meetings?|schedul\w*|book(ing)?)\b/i, 'gcal', ['list_events', 'create_event']],
  [/\bhubspot\b|\bcrm\b/i, 'hubspot', ['search_contacts', 'update_deal']],
  [/\bsalesforce\b/i, 'salesforce', ['query', 'update_record']],
  [/\b(enrich|company data|apollo)\b/i, 'apollo', ['enrich_company']],
  [/\b(web|internet|online|research\w*|competitors?|news)\b/i, 'websearch', ['search_web']],
  [/\b(websites?|pages?|urls?|articles?)\b/i, 'scraper', ['read_url']],
  [/\b(sheets?|spreadsheets?|excel)\b/i, 'gsheets', ['read_rows', 'append_row']],
  [/\b(tickets?|support|freshdesk|helpdesk)\b/i, 'freshdesk', ['list_tickets', 'reply_ticket']],
  [/\bzendesk\b/i, 'zendesk', ['list_tickets', 'reply_ticket']],
  [/\blinkedin\b/i, 'linkedin', ['lookup_profile', 'share_post']],
  [/\bnotion\b/i, 'notion', ['search', 'create_page']],
  [/\b(drive|documents?|pdfs?|contracts?|files?)\b/i, 'gdrive', ['search_files', 'read_file']],
  [/\bgithub\b|\bpull requests?\b/i, 'github', ['create_issue', 'list_prs']],
  [/\bjira\b/i, 'jira', ['create_issue', 'search_issues']],
  [/\blinear\b/i, 'linear', ['create_issue']],
  [/\b(stripe|invoices?|payments?)\b/i, 'stripe', ['list_charges', 'create_invoice']],
  [/\bshopify|orders?\b/i, 'shopify', ['list_orders']],
  [/\b(sms|text message|twilio)\b/i, 'twilio', ['send_sms']],
  [/\bwhatsapp\b/i, 'whatsapp', ['send_message']],
  [/\b(papers?|arxiv|academic)\b/i, 'arxiv', ['search_papers']],
];
const ROLE_NAMES = [
  [/\b(score|qualif|lead)/i, 'Lead Scorer'], [/\b(triage|ticket|support)/i, 'Support Triage'], [/\bresearch/i, 'Researcher'],
  [/\b(summar|digest|recap)/i, 'Summariser'], [/\b(schedul|meeting|calendar|book)/i, 'Scheduler'], [/\b(email|follow[- ]?up|outreach)/i, 'Email Writer'],
  [/\b(analy|report|metric|dashboard)/i, 'Analyst'], [/\b(invoice|collect|payment)/i, 'Collections Agent'], [/\b(recruit|resume|candidate)/i, 'Candidate Screener'],
  [/\b(contract|legal|clause)/i, 'Contract Reviewer'], [/\b(content|blog|post|copy)/i, 'Content Writer'], [/\b(onboard)/i, 'Onboarding Guide'],
];

export function describeToSpec(text, project) {
  const t = String(text || '').trim();
  const tools = [];
  for (const [re, id, actions] of KEYWORD_TOOLS) {
    if (re.test(t) && !tools.some((x) => x.id === id)) tools.push({ id, name: integrationById(id).name, actions: [...actions] });
    if (tools.length >= 4) break;
  }
  const noSend = /\b(draft only|don'?t send|never send|approve|approval|ask (me|first|before))\b/i.test(t);
  const approvals = [];
  for (const x of tools) for (const a of x.actions) if (isRisky(a) && !approvals.includes(a)) approvals.push(a);
  if (!noSend && /\b(automatically send|auto[- ]send|without asking)\b/i.test(t)) approvals.length = 0;
  let name = (ROLE_NAMES.find(([re]) => re.test(t)) || [null, 'Assistant'])[1];
  const existing = new Set((project?.agents || []).map((a) => a.name));
  if (existing.has(name)) name = `${name} 2`;
  const first = t.replace(/^(an?|the)\s+(ai\s+)?(agent|assistant|bot)\s+(that|to|which|who)\s+/i, '').replace(/^i (want|need) (an?\s+)?(agent|assistant|bot)?\s*(that|to)?\s*/i, '');
  const role = first ? first.charAt(0).toUpperCase() + first.slice(1).split(/(?<=[.!?])\s/)[0].replace(/[.!?]$/, '').slice(0, 110) : 'Helps your team with a repetitive task';
  const triggers = [];
  const sched = t.match(/\bevery\s+(day|morning|hour|week|monday|tuesday|wednesday|thursday|friday|\d+\s+minutes?)\b[^.,]*/i);
  if (sched) triggers.push({ type: 'schedule', detail: titleCaseFirst(sched[0].trim()) });
  if (/\b(when|whenever)\s+(a|an|new)\b/i.test(t)) { const m = t.match(/\b(when|whenever)\s+([^.,]+)/i); triggers.push({ type: 'event', detail: titleCaseFirst(m[2].trim()).slice(0, 60) }); }
  if (/\b(forward|emails? (come|arrive)|incoming email)/i.test(t)) triggers.push({ type: 'email', detail: 'Emails forwarded to its inbox' });
  if (!triggers.length) triggers.push({ type: 'chat', detail: 'Chat panel' });
  const outputs = [];
  if (/\bscore/i.test(t)) outputs.push({ key: 'score', type: 'number', desc: '0–100' }, { key: 'reason', type: 'text' });
  if (/\b(summar|brief|report)/i.test(t)) outputs.push({ key: 'summary', type: 'text' });
  if (/\b(email|follow[- ]?up|reply|draft)/i.test(t)) outputs.push({ key: 'subject', type: 'text' }, { key: 'body', type: 'text' });
  if (/\b(urgen|priorit|triage)/i.test(t)) outputs.push({ key: 'priority', type: 'High | Medium | Low' });
  if (!outputs.length) outputs.push({ key: 'answer', type: 'text' });
  const uniqOut = outputs.filter((o, i) => outputs.findIndex((x) => x.key === o.key) === i);
  const instr = [
    `${role}.`,
    tools.length ? `Use ${tools.map((x) => x.name).join(', ')} to get real information — never invent facts; say "unknown" when you can’t find something.` : 'Never invent facts; say "unknown" when you can’t find something.',
    approvals.length ? `Always ask a person before you ${approvals.map((a) => humanizeAction(a).toLowerCase()).join(' or ')}.` : null,
    'Keep answers short and specific, and explain your reasoning in one sentence.',
  ].filter(Boolean).join(' ');
  return normalizeAgent({
    id: uid('a'), name, role, goal: role, instructions: instr, tools, approvals, triggers, outputs: uniqOut,
    color: AGENT_COLORS[(project?.agents?.length || 0) % AGENT_COLORS.length],
    memory: /\bremember|preferences|history\b/i.test(t) ? 'long-term' : 'session',
    model: { tier: /\b(complex|careful|legal|contract|reason)\b/i.test(t) ? 'best' : 'balanced', provider: 'Anthropic', model: TIER_MODEL[/\b(complex|careful|legal|contract|reason)\b/i.test(t) ? 'best' : 'balanced'], creativity: /\b(write|email|content|post|copy)\b/i.test(t) ? 0.6 : 0.2 },
    version: 1, status: 'draft', evalScore: null, stats: { runs: 0, cost: 0, latencyMs: 0, errors: 0 },
  });
}
function titleCaseFirst(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

export const DESCRIBE_EXAMPLES = [
  'Research competitors on the web every Monday and post a summary to Slack',
  'Triage new support tickets by urgency and draft a reply — ask me before replying',
  'When a new invoice is overdue, draft a polite reminder email for me to approve',
];

// ---------------------------------------------------------------------------
// Plain-language diff between two versions (for the unsaved-changes footer & Copilot)
// ---------------------------------------------------------------------------
const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
export function diffAgents(before, after) {
  if (!before || !after) return [];
  const out = [];
  const push = (op, label, section) => out.push({ op, label, section });
  if (!same(before.name, after.name)) push('~', `name → ${after.name}`, 'name');
  if (!same(before.role, after.role)) push('~', 'role', 'what');
  if (!same(before.goal, after.goal)) push('~', 'goal', 'what');
  if (!same(before.instructions, after.instructions)) push('~', 'instructions', 'what');
  if (!same(before.framework, after.framework)) push('~', `framework → ${frameworkById(after.framework).name}`, 'framework');
  const bm = before.model || {}, am = after.model || {};
  if (bm.tier !== am.tier) push('~', `brain → ${tierById(am.tier).label}`, 'brain');
  else if (bm.model !== am.model) push('~', `model → ${modelById(am.model)?.name || am.model}`, 'brain');
  if (!same(bm.creativity, am.creativity)) push('~', `creativity → ${Math.round((am.creativity ?? 0) * 100)}%`, 'brain');
  const bk = new Map((before.knowledge || []).map((k) => [k.id, k])), ak = new Map((after.knowledge || []).map((k) => [k.id, k]));
  for (const [id, k] of ak) if (!bk.has(id)) push('+', `knowledge ${k.name}`, 'knows');
  for (const [id, k] of bk) if (!ak.has(id)) push('−', `knowledge ${k.name}`, 'knows');
  const bt = new Map((before.tools || []).map((t) => [t.id, t])), at = new Map((after.tools || []).map((t) => [t.id, t]));
  for (const [id, t] of at) {
    if (!bt.has(id)) push('+', `tool ${t.mcp ? t.name : id}`, 'tools');
    else if (!same(bt.get(id).actions, t.actions)) push('~', `${integrationById(id).name || id} actions`, 'tools');
  }
  for (const [id, t] of bt) if (!at.has(id)) push('−', `tool ${t.mcp ? t.name : id}`, 'tools');
  const ba = new Set(before.approvals || []), aa = new Set(after.approvals || []);
  for (const x of aa) if (!ba.has(x)) push('+', `approval ${x}`, 'approvals');
  for (const x of ba) if (!aa.has(x)) push('−', `approval ${x}`, 'approvals');
  const bl = before.limits || {}, al = after.limits || {};
  if (bl.costPerRun !== al.costPerRun) push('~', `cost limit → $${al.costPerRun}/run`, 'limits');
  if (bl.steps !== al.steps) push('~', `max steps → ${al.steps}`, 'limits');
  if (bl.monthlyBudget !== al.monthlyBudget) push('~', `monthly budget → $${al.monthlyBudget ?? '—'}`, 'limits');
  const bg = before.guardrails || {}, ag = after.guardrails || {};
  const GN = { pii: 'PII redaction', injection: 'injection shield', toxicity: 'toxicity filter', groundedness: 'groundedness check' };
  for (const k of Object.keys(GN)) if (!!bg[k] !== !!ag[k]) push(ag[k] ? '+' : '−', `guardrail ${GN[k]}`, 'guardrails');
  if (!same(bg.topics, ag.topics)) push('~', 'allowed topics', 'guardrails');
  if (!same(bg.blocked, ag.blocked)) push('~', 'blocked topics', 'guardrails');
  if (before.memory !== after.memory) push('~', `memory → ${after.memory}`, 'memory');
  const tk = (t) => `${t.type}:${t.detail}`;
  const btr = new Set((before.triggers || []).map(tk)), atr = new Set((after.triggers || []).map(tk));
  for (const t of after.triggers || []) if (!btr.has(tk(t))) push('+', `trigger ${t.type}${t.detail ? ` · ${t.detail}` : ''}`, 'triggers');
  for (const t of before.triggers || []) if (!atr.has(tk(t))) push('−', `trigger ${t.type}${t.detail ? ` · ${t.detail}` : ''}`, 'triggers');
  const bo = new Map((before.outputs || []).map((o) => [o.key, o])), ao = new Map((after.outputs || []).map((o) => [o.key, o]));
  for (const [k, o] of ao) { if (!bo.has(k)) push('+', `output ${k}`, 'outputs'); else if (!same(bo.get(k), o)) push('~', `output ${k}`, 'outputs'); }
  for (const [k] of bo) if (!ao.has(k)) push('−', `output ${k}`, 'outputs');
  if (!same(before.delegatesTo, after.delegatesTo)) push('~', 'team', 'team');
  if (!same(before.channels, after.channels)) push('~', 'channels', 'deploy');
  if (!same(before.codeOverrides || {}, after.codeOverrides || {})) push('~', 'code edits', 'code');
  if (!same(before.kind, after.kind)) push('~', `type → ${after.kind}`, 'what');
  if (!same(before.color, after.color)) push('~', 'colour', 'name');
  return out;
}

/** Output changes that affect screens (for the impact card). */
export function outputImpact(project, before, after) {
  const changed = diffAgents({ outputs: before?.outputs || [] }, { outputs: after?.outputs || [] });
  if (!changed.length) return null;
  const screens = [];
  for (const s of project?.screens || []) {
    const blocks = s.blocks.filter((b) => b.bind?.agent === after.id);
    if (blocks.length || (after.usedBy || []).includes(s.id)) screens.push({ screen: s, blocks });
  }
  return { changed, screens };
}

export const AGENT_ICON = { manager: 'network', worker: 'bot' };
export function initialsOf(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || '?') + (parts[1]?.[0] || '')).toUpperCase();
}
export const integrationsList = INTEGRATIONS;
