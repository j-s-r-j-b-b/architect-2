// Follow-up chat message → a concrete, previewable change (or a grounded, free answer).
// Every intent carries plain + technical wording, a credit range, the blocks it touches,
// and an apply(draft) that mutates a project draft in place.
import { findBlock, tableById, agentById } from './schema.js';
import { THEME_PRESETS, integrationById } from './catalog.js';
import { B, K, repack, agent as mkAgent, fieldsFrom, col, routeFile } from './gen/kit.js';
import { detectIntegrations } from './gen/detect.js';
import { estimateQuote, tierMultiplier } from './quote.js';
import { titleCase, pascal, listJoin, uniq } from './gen/text.js';

const COLORS = {
  red: '#DC2626', crimson: '#B91C1C', orange: '#EA580C', amber: '#D97706', yellow: '#CA8A04', gold: '#B8860B', lime: '#65A30D', green: '#16A34A', emerald: '#059669', forest: '#166534',
  teal: '#0F766E', cyan: '#0891B2', sky: '#0284C7', blue: '#2563EB', navy: '#1E3A8A', indigo: '#4F46E5', violet: '#7C3AED', purple: '#9333EA', magenta: '#C026D3', pink: '#DB2777',
  rose: '#E11D48', brown: '#92400E', black: '#111827', charcoal: '#1F2937', gray: '#4B5563', grey: '#4B5563', slate: '#334155',
};
const TYPE_WORDS = [
  ['chart', /\b(chart|graph|pie|donut|bar chart|line chart|trend|breakdown)\b/], ['kpis', /\b(kpis?|metrics?|stats?|numbers|scorecards?|counters?)\b/], ['agentChat', /\b(chat|chatbot|assistant panel|ask box|ask panel)\b/],
  ['agentActivity', /\b(activity|agent runs|audit log|what the agents did)\b/], ['kanban', /\b(kanban|board|pipeline view)\b/], ['calendar', /\b(calendar|schedule view)\b/], ['form', /\b(form|sign-?up|intake)\b/],
  ['cards', /\b(cards|gallery|tiles)\b/], ['table', /\b(table|grid|spreadsheet view)\b/], ['list', /\b(list)\b/], ['text', /\b(text|note|paragraph|summary|faq|callout)\b/], ['steps', /\b(steps|how it works|timeline)\b/], ['hero', /\b(hero|banner|landing)\b/], ['header', /\b(header|heading|title bar)\b/],
];
const DESTROY = /\b(delete|remove|drop|wipe|erase|clear|purge|get rid of|take out|hide|lose)\b/;
const ADD = /\b(add|show|put|include|insert|create|give me|i want|i need|we need|display|build|make)\b/;

const lc = (s) => String(s ?? '').toLowerCase();
const r05 = (x) => Math.max(0.5, Math.round(x * 2) / 2);
const credits = (p, a, b) => { const m = tierMultiplier(p); return [r05(a * m), Math.max(r05(a * m), r05(b * m))]; };
const fromRaw = (raw, frag) => { const i = String(raw).toLowerCase().indexOf(frag); return i >= 0 && frag ? String(raw).slice(i, i + frag.length) : frag; };
const clean = (s) => String(s || '').trim().replace(/^["“'‘]|["”'’.!?]+$/g, '').trim();
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const snakeKey = (s) => lc(s).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 28) || 'field';
const allBlocks = (p) => (p?.screens || []).flatMap((s) => s.blocks.map((b) => ({ screen: s, block: b })));
const mainTable = (p) => (p?.data?.tables || []).find((t) => t.id !== 'agent_runs') || p?.data?.tables?.[0] || null;
const leadAgent = (p) => (p?.agents || []).find((a) => a.kind === 'manager') || p?.agents?.[0] || null;
const titleOf = (b) => b.title || b.props?.title || b.type;

function I(p, kind, o) {
  return { kind, summary: o.summary, plain: o.plain || o.summary, technical: o.technical || '', credits: o.credits || credits(p, 1, 2), touches: o.touches || [], risky: !!o.risky, ...(o.destructive ? { destructive: true } : {}), ...o.extra, apply: o.apply || (() => {}) };
}

// ---------------------------------------------------------------------------
// Targets
// ---------------------------------------------------------------------------
function findScreen(p, l) {
  const ss = p?.screens || [];
  return ss.find((s) => l.includes(lc(s.title)) && lc(s.title).length > 2) || ss.find((s) => s.route !== '/' && l.includes(lc(s.route).slice(1).replace(/-/g, ' '))) || null;
}
function findTable(p, l) {
  const ts = (p?.data?.tables || []).filter((t) => t.id !== 'agent_runs');
  return ts.find((t) => l.includes(lc(t.name))) || ts.find((t) => l.includes(lc(t.name).replace(/s$/, ''))) || ts.find((t) => l.includes(t.id.replace(/_/g, ' '))) || null;
}
function findAgent(p, l) {
  const as = p?.agents || [];
  return as.find((a) => l.includes(lc(a.name))) || as.find((a) => lc(a.name).split(/\s+/).some((w) => w.length > 4 && !['agent', 'assistant'].includes(w) && l.includes(w.replace(/er$/, '')))) || null;
}
/** Selected block, else a block named or typed in the text (optionally within a mentioned screen). */
function targetBlock(p, l, sel) {
  if (sel?.blockId) { const f = findBlock(p, sel.blockId); if (f) return f; }
  const scr = findScreen(p, l);
  const pool = scr ? scr.blocks.map((b) => ({ screen: scr, block: b })) : allBlocks(p);
  const byTitle = pool.find(({ block }) => block.title && lc(block.title).length > 3 && l.includes(lc(block.title)));
  if (byTitle) return byTitle;
  for (const [type, re] of TYPE_WORDS) if (re.test(l)) { const hit = pool.find(({ block }) => block.type === type); if (hit) return hit; }
  return null;
}
function screenFor(p, l, sel) {
  return findScreen(p, l) || (sel?.screenId && p.screens.find((s) => s.id === sel.screenId)) || (sel?.blockId && findBlock(p, sel.blockId)?.screen) || p.screens[0];
}
const inDraft = (d, blockId) => { for (const s of d.screens) { const i = s.blocks.findIndex((b) => b.id === blockId); if (i >= 0) return { s, i, b: s.blocks[i] }; } return null; };

/** Repair references + packing (used by "fix" and after structural edits). */
function heal(d) {
  const tIds = new Set(d.data.tables.map((t) => t.id)), aIds = new Set(d.agents.map((a) => a.id));
  const lead = (d.agents.find((a) => a.kind === 'manager') || d.agents[0])?.id;
  for (const s of d.screens) {
    s.blocks = s.blocks.filter((b) => !(b.bind?.table && !tIds.has(b.bind.table) && ['table', 'kanban', 'cards', 'calendar', 'detail', 'form'].includes(b.type)));
    for (const b of s.blocks) {
      if (b.bind?.agent && !aIds.has(b.bind.agent)) { if (lead) b.bind.agent = lead; else delete b.bind.agent; }
      if (b.buildState === 'failed') delete b.buildState;
    }
    repack(s.blocks);
  }
  for (const a of d.agents) a.usedBy = d.screens.filter((s) => s.blocks.some((b) => b.bind?.agent === a.id)).map((s) => s.id);
}

// ---------------------------------------------------------------------------
// Grounded answers (free)
// ---------------------------------------------------------------------------
const range = (r) => (r ? (r[0] === r[1] ? `${r[0]}` : `${r[0]}–${r[1]}`) : '0');
function answer(p, l) {
  const ts = (p.data?.tables || []), as = p.agents || [], ss = p.screens || [], ps = p.plan?.promises || [];
  const ag = findAgent(p, l), tb = findTable(p, l), sc = findScreen(p, l);
  if (/\b(cost|credits?|price|how much|quote|expensive|cheap|budget|spend)\b/.test(l) && !/agent cost/.test(l)) {
    const q = p.plan?.quote || estimateQuote(p, {});
    return `The current quote is **${range(q.credits)} credits** (about ${range(q.minutes)} minutes on the ${q.modelTier || 'balanced'} tier):\n${(q.lines || []).map((x) => `• ${x.label} — ${range(x.credits)}`).join('\n')}\n\nPlans and questions are always free; you only pay when something is built.`;
  }
  if (ag && /\b(what|how|why|explain|does|do|can)\b/.test(l)) {
    const tools = ag.tools?.map((t) => `${t.name} (${t.actions.join(', ')})`) || [];
    return `**${ag.name}** — ${ag.role}.\n\n• Tools: ${tools.length ? tools.join('; ') : 'none — it only uses your data and knowledge'}\n• Asks before: ${ag.approvals?.length ? ag.approvals.map((x) => x.replace(/_/g, ' ')).join(', ') : 'nothing (read-only or logged actions)'}\n• Runs when: ${(ag.triggers || []).map((t) => t.detail).join('; ') || 'you chat with it'}\n• Knowledge: ${(ag.knowledge || []).map((k) => k.name).join(', ') || 'your tables only'}`;
  }
  if (/\b(promises?|scope|deferred|included|what will (?:it|you) (?:do|build))\b/.test(l)) {
    return `The plan has ${ps.length} promises:\n${ps.map((x) => `• **${x.id}** ${x.title} — ${x.status}${x.status === 'deferred' && x.deferredReason ? ` (${x.deferredReason})` : ''}`).join('\n')}`;
  }
  if (/\b(sample|fake|real data|live data|test data|dummy)\b/.test(l)) {
    const sample = ts.filter((t) => t.source !== 'live');
    return sample.length ? `${listJoin(sample.map((t) => `**${t.name}** (${t.source})`))} ${sample.length === 1 ? 'is' : 'are'} not live yet — every widget bound to them shows a “Sample” badge. ${uniq(sample.map((t) => t.connection).filter(Boolean)).map((id) => `Connect ${integrationById(id).name}`).join(' and ') || 'Import a CSV'} to switch to real data.` : 'All tables are on live data.';
  }
  if (/\b(integrations?|connect(?:ed|ions?)?|tools)\b/.test(l)) {
    const ints = p.integrations || [];
    return ints.length ? `Integrations:\n${ints.map((i) => `• **${integrationById(i.id).name}** — ${i.status}${i.builtIn ? ' (built in)' : ''}${i.usedBy?.length ? `, used by ${i.usedBy.map((id) => agentById(p, id)?.name || id).join(', ')}` : ''}`).join('\n')}` : 'This app doesn’t use any integrations yet.';
  }
  if (tb) return `**${tb.name}** has ${tb.rows.length} rows (${tb.source} data) and ${tb.columns.length} columns: ${tb.columns.map((c) => c.label).join(', ')}.${tb.rules ? `\n\nAccess: ${tb.rules}` : ''}`;
  if (sc) return `The **${sc.title}** screen (${sc.route}) has ${sc.blocks.length} sections: ${sc.blocks.map((b) => titleOf(b)).join(', ')}.`;
  if (/\b(agents?|who does)\b/.test(l)) return `${as.length} agent${as.length === 1 ? '' : 's'}:\n${as.map((a) => `• **${a.name}**${a.kind === 'manager' ? ' (manager)' : ''} — ${a.role}`).join('\n')}`;
  if (/\b(screens?|pages?)\b/.test(l)) return `${ss.length} screens: ${ss.map((s) => `**${s.title}** (${s.route})`).join(', ')}.`;
  return `${p.plan?.summary || p.description || p.name}\n\nIt has ${ss.length} screens, ${as.length} agents and ${ts.length} tables. Ask me about any of them — or describe a change and I’ll quote it first.`;
}
function suggestions(p) {
  const t = mainTable(p), st = t?.columns?.find((c) => c.type === 'status');
  const def = (p.plan?.promises || []).find((x) => x.status === 'deferred');
  const w = (p.agents || []).find((a) => a.kind !== 'manager');
  return [t && st ? `Add a chart of ${t.name.toLowerCase()} by ${st.label.toLowerCase()}` : 'Add a chart to the first screen', def ? `Include ${def.id}: ${def.title}` : 'Switch the app to dark mode', w ? `Make ${w.name} friendlier and more concise` : 'Make the header navy'];
}

// ---------------------------------------------------------------------------
// Builders for new things
// ---------------------------------------------------------------------------
function guessType(name) {
  const n = lc(name);
  if (/e-?mail/.test(n)) return 'email'; if (/phone|mobile/.test(n)) return 'text'; if (/date|deadline|due|birthday|start|end|when/.test(n)) return 'date';
  if (/price|cost|amount|budget|revenue|value|fee|salary|\$/.test(n)) return 'money'; if (/percent|rate|%/.test(n)) return 'percent'; if (/score|rating/.test(n)) return 'score';
  if (/count|number|qty|quantity|age|size|hours|days|employees/.test(n)) return 'number'; if (/url|link|website|linkedin/.test(n)) return 'url'; if (/notes?|description|comments?|summary/.test(n)) return 'longtext';
  if (/status|stage|priority|tier|type|category|level/.test(n)) return 'status'; if (/owner|assignee|manager|contact|person/.test(n)) return 'person'; if (/^(is|has)\b|paid|active|done|approved/.test(n)) return 'bool';
  return 'text';
}
function sampleValue(type, key, i, row) {
  switch (type) {
    case 'email': return `${lc(String(row.name || row.customer || 'contact').split(' ')[0]) || 'contact'}${i + 1}@example.com`;
    case 'date': return Date.now() + ((i * 5) % 30 - 10) * 864e5;
    case 'money': return 50 * (3 + ((i * 7) % 40));
    case 'percent': return 20 + ((i * 13) % 75);
    case 'score': return 40 + ((i * 17) % 58);
    case 'number': return 1 + ((i * 7) % 24);
    case 'url': return `https://example.com/${i + 1}`;
    case 'bool': return i % 3 !== 0;
    case 'status': return ['High', 'Medium', 'Low'][i % 3];
    case 'person': return ['Meera', 'Arjun', 'Sam', 'Lena'][i % 4];
    case 'longtext': return '';
    default: return /phone|mobile/.test(key) ? `+1 555 01${String(10 + i * 7).slice(-2)}` : '—';
  }
}
function newBlock(p, type, tbl, scr, text, id) {
  const cols = tbl?.columns || [];
  const status = cols.find((c) => c.type === 'status'), date = cols.find((c) => c.type === 'date' || c.type === 'datetime');
  const titleKey = (cols.find((c) => c.type === 'person' || c.type === 'text') || cols[0])?.key;
  const byCol = cols.find((c) => new RegExp(`\\bby ${lc(c.label)}\\b|\\bper ${lc(c.label)}\\b`).test(text)) || status || cols.find((c) => c.type === 'person');
  const kind = /\bline\b/.test(text) ? 'line' : /\b(pie|donut)\b/.test(text) ? 'donut' : /\barea\b/.test(text) ? 'area' : 'bar';
  const lead = leadAgent(p)?.id;
  const nm = tbl ? tbl.name : 'Items';
  switch (type) {
    case 'chart': return byCol ? B.chart(id, { title: `${nm} by ${lc(byCol.label)}`, table: tbl.id, kind, groupBy: byCol.key }) : B.chart(id, { title: 'Last 8 weeks', kind, series: [12, 15, 14, 18, 21, 20, 24, 26].map((v, i) => ({ label: `W${i + 1}`, value: v })) });
    case 'kpis': {
      const rows = tbl?.rows || [];
      const st = status ? Object.entries(rows.reduce((m, r) => ((m[r[status.key]] = (m[r[status.key]] || 0) + 1), m), {})).sort((a, b) => b[1] - a[1]).slice(0, 2) : [];
      const money = cols.find((c) => c.type === 'money');
      return B.kpis(id, [K(`Total ${lc(nm)}`, rows.length, 'all time', 'flat', 'layers'), ...st.map(([k, n]) => K(k, n, `of ${rows.length}`, 'flat', 'activity')), money ? K(`Total ${lc(money.label)}`, '$' + Math.round(rows.reduce((s, r) => s + (Number(r[money.key]) || 0), 0)).toLocaleString('en-US'), 'sum', 'flat', 'coins') : K('Added this week', Math.max(1, Math.round(rows.length / 3)), '+ new', 'up', 'trending-up')].slice(0, 4), { table: tbl?.id });
    }
    case 'table': return tbl && B.table(id, tbl.id, { title: `All ${lc(nm)}`, span: 8, filters: status ? [status.key] : [], columns: cols.filter((c) => c.type !== 'longtext').slice(0, 6).map((c) => c.key) });
    case 'kanban': return tbl && status && B.kanban(id, tbl.id, { title: `${nm} board`, groupBy: status.key, titleKey, subtitleKey: cols.find((c) => c.key !== titleKey && (c.type === 'text' || c.type === 'person'))?.key });
    case 'calendar': return tbl && date && B.calendar(id, tbl.id, { title: `${nm} calendar`, dateKey: date.key, titleKey });
    case 'cards': return tbl && B.cards(id, tbl.id, { title: nm, titleKey, subtitleKey: cols.find((c) => c.key !== titleKey && c.type === 'text')?.key, metaKeys: cols.filter((c) => ['number', 'money', 'date'].includes(c.type)).slice(0, 2).map((c) => c.key), badgeKey: status?.key });
    case 'form': return tbl && B.form(id, tbl, cols.filter((c) => !['datetime', 'score'].includes(c.type) && c.key !== 'id').slice(0, 5).map((c) => c.key), { title: `Add ${lc(nm).replace(/s$/, '')}`, submitLabel: 'Save', successText: 'Saved — it’s in the table now.' });
    case 'agentChat': return lead && B.chat(id, lead, { title: `Ask ${p.name}`, greeting: 'Ask me anything about your data.', suggestions: suggestions(p).slice(0, 2) });
    case 'agentActivity': return lead && B.activity(id, (p.agents.find((a) => a.kind !== 'manager') || leadAgent(p)).id, {});
    case 'list': return tbl ? B.list(id, { title: nm, titleKey, metaKey: status?.key, table: tbl.id }) : null;
    case 'steps': return B.steps(id, [['Tell us what you need', 'Fill in a short form.'], ['We get to work', 'The agents handle the busywork.'], ['You approve', 'Nothing important happens without you.']], { title: 'How it works' });
    case 'hero': return B.hero(id, p.name, p.description || p.plan?.summary || '', 'Get started', 'Learn more');
    default: return B.text(id, `**${cap(clean(text.replace(ADD, '').replace(/\b(a|an|the)\b/g, '')).slice(0, 60)) || 'Note'}**\nEdit this text anytime.`, { title: 'Note', span: 6 });
  }
}
function agentName(purpose) {
  const l = lc(purpose);
  const map = [[/summar|digest|report/, 'Report Writer'], [/remind|nudge|follow/, 'Reminder Agent'], [/translat/, 'Translator'], [/research|find out|look up/, 'Researcher'], [/classif|triage|sort|tag|categor/, 'Classifier'], [/schedul|book|calendar/, 'Scheduler'], [/email|draft|write|reply/, 'Writer'], [/qualif|score|rank/, 'Scorer'], [/monitor|watch|alert/, 'Watcher'], [/clean|dedup|fix data/, 'Data Cleaner'], [/answer|question|faq|support/, 'Helper']];
  for (const [re, n] of map) if (re.test(l)) return n;
  return 'Assistant';
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
/**
 * Turn a follow-up chat message into a concrete, previewable change.
 * @param {object} project
 * @param {string} text
 * @param {{selection?: {blockId:string, screenId:string}}} [ctx]
 * @returns {{kind:string, summary:string, plain:string, technical:string, credits:[number,number], touches:string[], risky?:boolean, apply:(draft:object)=>void}}
 *   kind: 'theme' | 'copy' | 'addBlock' | 'removeBlock' | 'removeScreen' | 'layout' | 'addScreen' | 'addAgent' | 'editAgent' | 'connect' | 'promise' | 'data' | 'fix' | 'question'
 */
export function interpretEdit(project, text, ctx = {}) {
  const p = project || { screens: [], agents: [], data: { tables: [] }, plan: {} };
  p.screens = p.screens || []; p.agents = p.agents || []; p.data = p.data || { tables: [] };
  const raw = String(text || '').trim();
  let l = lc(raw).replace(/^(please|pls|hey|ok|okay)[, ]+/, '');
  const sel = ctx?.selection || null;
  const command = /^(can|could|would|will) you\b/.test(l);
  if (command) l = l.replace(/^(can|could|would|will) you (please )?/, '').replace(/\?$/, '');
  const unknown = () => { const s = suggestions(p); return I(p, 'question', { summary: 'Not sure what to change', credits: [0, 0], extra: { unknown: true, suggestions: s, answer: `I’m not sure what to change there. Here are a few things I can do right now:\n\n• ${s.join('\n• ')}\n\nOr describe what should look or behave differently — I’ll quote it before anything is built.` } }); };
  if (!l) return unknown();

  // 1. Questions — grounded and free
  if (!command && (/\?$/.test(l) || /^(what|why|how|which|who|when|where|is|are|does|do|did|explain|tell me|show me what)\b/.test(l)) && !/^(how about|what if) (we |you )?(add|make|change)/.test(l)) {
    return I(p, 'question', { summary: 'Question', credits: [0, 0], extra: { answer: answer(p, l) } });
  }

  // 2. Fix requests
  if (/\b(fix|broken|bug|error|doesn'?t work|isn'?t working|not working|crash(?:es|ed)?|blank|fails?|failing|glitch)\b/.test(l)) {
    const tb = targetBlock(p, l, sel);
    return I(p, 'fix', { summary: tb ? `Fix ${titleOf(tb.block)}` : 'Fix the reported problem', plain: `I’ll trace the problem${tb ? ` in **${titleOf(tb.block)}**` : ''}, repair broken bindings and layout, and re-run the tests.`, technical: tb ? `${tb.block.file} · rebind + repack · tests` : 'app/** · integrity check · tests', credits: credits(p, 1, 3), touches: tb ? [tb.block.id] : [], apply: heal });
  }

  // 2b. Agent boundaries: "make the qualifier ask before emailing anyone", "never refund without my approval"
  const bnd = l.match(/\b(?:ask(?:s)?(?: me| a human| someone| us| first)?|check(?:s)? with (?:me|us|a human)|get(?:s)? (?:my |an? )?(?:approval|ok|okay|sign-?off)|need(?:s)? (?:my |an? )?(?:approval|ok)|wait(?:s)? for (?:my )?(?:approval|ok))\s+(?:first\s+)?before\s+(.+)$/)
    || l.match(/\b(?:never|don'?t|do not|must not|shouldn'?t)\s+(?:ever\s+)?(.+?)\s+without\s+(?:first\s+)?(?:asking|approval|my (?:ok|okay|approval|permission)|permission|checking|confirming|a human)/);
  const bAg = bnd && (findAgent(p, l) || (sel?.blockId && agentById(p, findBlock(p, sel.blockId)?.block?.bind?.agent)) || p.agents.find((a) => a.kind !== 'manager') || p.agents[0]);
  if (bnd && bAg) {
    // "never delete leads without asking" → "deleting leads"
    const gerund = (s) => s.replace(/^([a-z]+)\b/i, (w) => (/ing$/i.test(w) ? w : /[^e]e$/i.test(w) ? `${w.slice(0, -1)}ing` : `${w}ing`));
    const phrase = clean(fromRaw(raw, bnd[1])).replace(/[.!?]+$/, '');
    const what = (/^(never|don|do not|must not|shouldn)/.test(bnd[0]) ? gerund(phrase) : phrase) || 'acting';
    const VERBS = [[/messag|post|slack|teams|\bdm\b|text|sms|whatsapp|notif/, /post_message|send_message|send_sms|notify/, 'post_message'], [/e-?mail|mail|repl(?:y|ies)|respond|send/, /send_e?mail|send_mail|create_draft|reply|send/, 'send_email'],
      [/book|schedul|calendar|invite/, /create_event|book/, 'create_event'], [/delet|remov/, /delete|remove/, 'delete_record'], [/pay|refund|charg|invoice/, /refund|charge|invoice|pay/, 'issue_refund'], [/updat|chang|edit|writ|creat|add|mov/, /update|create|append|write/, 'update_record']];
    const hit = VERBS.find(([re]) => re.test(what));
    const acts = (bAg.tools || []).flatMap((t) => t.actions || []);
    let add = hit ? acts.filter((a) => hit[1].test(a)) : [];
    if (!add.length) add = [hit ? hit[2] : snakeKey(what).slice(0, 40)];
    const rule = `Always ask a person to approve before ${what}.`;
    const touches = allBlocks(p).filter(({ block }) => block.bind?.agent === bAg.id).map(({ block }) => block.id);
    return I(p, 'editAgent', { summary: `${bAg.name} asks before ${what}`, plain: `I’ll add a boundary to **${bAg.name}**: it must ask a person before ${what}. It pauses, shows exactly what it wants to do, and waits for **Approve** or **Reject**. It becomes version ${(bAg.version || 1) + 1}; the old one stays in history.`, technical: `agents/${snakeKey(bAg.name)}.yaml · approvals += [${add.join(', ')}] · v${(bAg.version || 1) + 1}`, credits: credits(p, 0.5, 1), touches,
      apply: (d) => {
        const a = d.agents.find((x) => x.id === bAg.id); if (!a) return;
        a.approvals = uniq([...(a.approvals || []), ...add]);
        if (!a.instructions.includes(rule)) a.instructions = `${a.instructions.trim()} ${rule}`;
        a.version = (a.version || 1) + 1; a.evalScore = null;
      } });
  }

  // 3. Include a deferred promise
  const ps = p.plan?.promises || [];
  const pid = (raw.match(/\bP(\d{1,2})\b/i) || [])[0]?.toUpperCase();
  const ints = detectIntegrations(raw);
  const deferred = ps.filter((x) => x.status === 'deferred');
  const byInt = ints.length && /\b(alert|notify|post|send|include|enable|add|turn on|message)\b/.test(l) ? deferred.find((x) => ints.some((i) => lc(x.title + ' ' + (x.deferredReason || '')).includes(lc(integrationById(i).name)))) : null;
  const byWords = /\b(include|enable|add|turn on|do|build)\b/.test(l) ? deferred.find((x) => lc(x.title).split(/\W+/).filter((w) => w.length > 4).filter((w) => l.includes(w)).length >= 2) : null;
  // "add an agent that posts to Slack" asks for a NEW agent, not a deferred promise that happens to mention Slack
  const newAgentAsk = /\b(?:add|create|build|hire|set up|make)\s+(?:a|an|another|new)\s+(?:new )?(?:ai )?(?:[\w-]+ ){0,2}?(?:agent|assistant|bot|copilot|worker)\b/.test(l);
  const pr = (pid && ps.find((x) => x.id === pid)) || (!newAgentAsk && (byInt || byWords));
  if (pr && pr.status === 'deferred') {
    return I(p, 'promise', { summary: `Include ${pr.id}: ${pr.title}`, plain: `I’ll add **${pr.id} — ${pr.title}** to the plan (≈${range(pr.cost)} credits).${pr.deferredReason && /needs/i.test(pr.deferredReason) ? ` ${pr.deferredReason.split('—')[0].trim()} first.` : ''}`, technical: `plan.promises.${pr.id}.status: deferred → planned`, credits: pr.cost || credits(p, 2, 4), extra: { promiseId: pr.id }, apply: (d) => { const x = d.plan.promises.find((y) => y.id === pr.id); if (x) { x.status = 'planned'; delete x.deferredReason; } } });
  }

  // 4. Connect an integration
  if (ints.length && /\b(connect|hook up|link|integrate|sync|plug in|log ?in|sign in|authori[sz]e|use (?:my|our))\b/.test(l)) {
    const id = ints[0], it = integrationById(id);
    return I(p, 'connect', { summary: `Connect ${it.name}`, plain: `Let’s connect **${it.name}**. You’ll see exactly what it can do (${it.scopes.join(', ') || 'no special access'}) before anything is shared.`, technical: `integrations.${id} → OAuth/API key via secure sheet`, credits: [0, 0], risky: true, extra: { integrationId: id, integration: id, riskReason: `Connecting ${it.name} lets the app read or change data there.` } });
  }

  // 5. Destructive: screens, data, columns, blocks
  if (DESTROY.test(l)) {
    const scr = /\b(screen|page|tab)\b/.test(l) && findScreen(p, l);
    if (scr && !/\b(chart|table|kpis?|chat|block|section|form|header|list|board|calendar|cards)\b/.test(l)) {
      if (p.screens.length <= 1) return I(p, 'question', { summary: 'Can’t remove the last screen', credits: [0, 0], extra: { answer: `**${scr.title}** is the only screen, so I can’t remove it. You can rename it or change what’s on it instead.` } });
      return I(p, 'removeScreen', { summary: `Remove the ${scr.title} screen`, plain: `I’ll remove the **${scr.title}** screen (${scr.blocks.length} sections). A checkpoint is saved first so you can undo.`, technical: `${routeFile(scr.route)} deleted · nav updated`, credits: credits(p, 1, 2), risky: true, destructive: true, touches: [], apply: (d) => { d.screens = d.screens.filter((s) => s.id !== scr.id); for (const x of d.plan?.promises || []) x.refs = (x.refs || []).filter((r) => r !== scr.id); heal(d); } });
    }
    const tbl = findTable(p, l) || (/\b(rows?|records?|data|entries)\b/.test(l) && mainTable(p));
    const colHit = tbl && /\b(column|field)\b/.test(l) && tbl.columns.find((c) => l.includes(lc(c.label)) || l.includes(c.key.replace(/_/g, ' ')));
    if (colHit) {
      return I(p, 'data', { summary: `Remove the ${colHit.label} column from ${tbl.name}`, plain: `I’ll remove **${colHit.label}** from ${tbl.name} and every screen that shows it. The values are kept in the checkpoint.`, technical: `db: ALTER TABLE ${tbl.id} DROP COLUMN ${colHit.key}`, credits: credits(p, 1, 2), risky: true, destructive: true, apply: (d) => { const t = d.data.tables.find((x) => x.id === tbl.id); t.columns = t.columns.filter((c) => c.key !== colHit.key); t.rows.forEach((r) => delete r[colHit.key]); for (const s of d.screens) for (const b of s.blocks) if (b.bind?.table === tbl.id && b.props) { if (Array.isArray(b.props.columns)) b.props.columns = b.props.columns.filter((k) => k !== colHit.key); if (Array.isArray(b.props.filters)) b.props.filters = b.props.filters.filter((k) => k !== colHit.key); if (Array.isArray(b.props.fields)) b.props.fields = b.props.fields.filter((f) => f.key !== colHit.key); if (b.props.groupBy === colHit.key) delete b.props.groupBy; } } });
    }
    if (tbl && (/\b(all|every|rows?|records?|data|entries)\b/.test(l) || l.includes(lc(tbl.name)))) {
      const st = tbl.columns.filter((c) => c.type === 'status');
      let match = null;
      for (const c of st) { const v = (c.options || []).find((o) => new RegExp(`\\b${lc(o).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(l)); if (v) { match = { key: c.key, v }; break; } }
      const n = match ? tbl.rows.filter((r) => r[match.key] === match.v).length : tbl.rows.length;
      if (!/\b(hide)\b/.test(l)) {
        return I(p, 'data', { summary: match ? `Delete ${n} ${match.v} rows from ${tbl.name}` : `Clear all ${n} rows in ${tbl.name}`, plain: `I’ll delete **${n} row${n === 1 ? '' : 's'}** from ${tbl.name}${match ? ` where ${lc(match.key)} is ${match.v}` : ''}. This can’t be undone except by restoring the checkpoint saved first.`, technical: `db: DELETE FROM ${tbl.id}${match ? ` WHERE ${match.key} = '${match.v}'` : ''} · ${n} rows`, credits: credits(p, 0.5, 1), risky: true, destructive: true, extra: { riskReason: 'Deleting data is permanent outside of checkpoints.' }, apply: (d) => { const t = d.data.tables.find((x) => x.id === tbl.id); t.rows = match ? t.rows.filter((r) => r[match.key] !== match.v) : []; } });
      }
    }
    const tb = targetBlock(p, l, sel);
    if (tb && tb.block.type !== 'header') {
      const scrn = tb.screen;
      return I(p, 'removeBlock', { summary: `Remove ${titleOf(tb.block)} from ${scrn.title}`, plain: `I’ll remove **${titleOf(tb.block)}** from the ${scrn.title} screen and re-flow the layout.`, technical: `${routeFile(scrn.route)} −1 section · ${tb.block.file} unused`, credits: credits(p, 0.5, 1), destructive: true, touches: [], apply: (d) => { const f = inDraft(d, tb.block.id); if (f) { f.s.blocks.splice(f.i, 1); repack(f.s.blocks); } heal(d); } });
    }
  }

  // 6. New agent
  const am = l.match(/\b(?:add|create|new|build|make|hire|set up)\s+(?!(?:the|this|our|my|that|your|its|it)\b)(?:a |an |another )?(?:new )?(?:ai )?(?:[\w-]+ ){0,2}?(agent|assistant|bot|copilot|worker)\b(?:\s+(?:that|to|who|which|for|called|named)\s+(.+))?/);
  if (am) {
    const purpose = clean(fromRaw(raw, am[2] || '')) || 'help the team';
    const link = /\b(to|for)\s+$/.test(am[0].slice(0, am[0].length - (am[2] || '').length)) ? 'to' : 'that';
    const named = raw.match(/\b(?:called|named)\s+["“']?([A-Z][\w ]{2,24})/);
    const nm = named ? clean(named[1]) : agentName(purpose + ' ' + am[0]);
    const id = `a_${snakeKey(nm)}_${(p.agents.length + 1)}`;
    const scr = screenFor(p, l, sel), bid = `b_${id.replace(/^a_/, '')}_chat`;
    const tbl = mainTable(p);
    // Schedules and output tools named in the ask ("…a weekly summary to Slack") become real triggers/tools; sending asks first
    const sched = /\b(weekly|every week|each week|mondays?|fridays?)\b/.test(l) ? (/friday/.test(l) ? 'Every Friday at 16:00' : 'Every Monday at 9:00') : /\b(daily|every (?:day|morning)|each morning|nightly)\b/.test(l) ? 'Daily at 9:00' : /\b(hourly|every hour)\b/.test(l) ? 'Every hour' : null;
    const outTool = ints.map((i) => { const it = integrationById(i); const act = (it.actions || []).find((a) => /post|send|create|append|draft/.test(a)); return act ? [i, act, it.name] : null; }).find(Boolean);
    const extras = [sched ? `runs ${sched.toLowerCase()}` : null, outTool ? `posts through ${outTool[2]} (asking you first)` : null].filter(Boolean);
    return I(p, 'addAgent', { summary: `Add ${nm}`, plain: `I’ll add **${nm}**, an agent ${link} ${purpose.replace(/^to /, '')}. It starts as a draft with safe limits, reads ${tbl ? tbl.name : 'your data'}${extras.length ? `, ${listJoin(extras)}` : ''}, and gets a chat panel on ${scr.title}.`, technical: `agents/${snakeKey(nm)}.yaml · components/${pascal(nm)}Chat.tsx · manager.delegatesTo += ${id}`, credits: credits(p, 4, 7), touches: [bid],
      apply: (d) => {
        const a = mkAgent({ autonomy: 'ask', tier: d.settings?.modelTier || 'balanced' }, { id, name: nm, role: cap(purpose.replace(/^to /, '')), goal: cap(purpose.replace(/^to /, '')), instructions: `${cap(purpose.replace(/^to /, ''))}. Only use the ${tbl ? tbl.name : 'app'} data and say which records you used. Keep answers short and never take an irreversible action without asking.`, knowledge: tbl ? [['table', tbl.name, `${tbl.rows.length} rows`]] : [], tools: outTool ? [[outTool[0], [outTool[1]]]] : [], risky: outTool ? [outTool[1]] : [], triggers: [['chat', `${nm} panel`], ...(sched ? [['schedule', sched]] : [])] }, d.agents.length);
        a.usedBy = [scr.id]; d.agents.push(a);
        const mgr = d.agents.find((x) => x.kind === 'manager'); if (mgr) mgr.delegatesTo = uniq([...(mgr.delegatesTo || []), id]);
        const s = d.screens.find((x) => x.id === scr.id) || d.screens[0];
        s.blocks.push(B.chat(bid, id, { title: nm, greeting: `Hi — I’m ${nm}. I can ${purpose.replace(/^to /, '')}.`, span: 4, suggestions: [] })); repack(s.blocks);
      } });
  }

  // 7. New screen
  if (/\b(add|create|make|build|new|need)\b/.test(l) && /\b(screen|page|tab|view|section of the app)\b/.test(l) && !/\b(to|on|in|into) (?:the |my |our |this )?[\w -]*?(screen|page|tab)\b/.test(l)) {
    const nmm = raw.match(/(?:called|named|titled)\s+["“']?([^"”']{2,30})/i) || raw.match(/(?:add|create|make|build|new)\s+(?:a |an )?(?:new )?([\w &-]{2,30}?)\s+(?:screen|page|tab|view)/i) || raw.match(/(?:screen|page|tab|view)\s+(?:for|showing|with|about)\s+([\w &-]{2,30})/i);
    const title = titleCase(clean(nmm?.[1] || 'Overview').replace(/^(a|an|the|new)\s+/i, '')) || 'Overview';
    const route = '/' + (snakeKey(title).replace(/_/g, '-') || 'page');
    if (p.screens.some((s) => s.route === route)) return I(p, 'question', { summary: 'Screen exists', credits: [0, 0], extra: { answer: `There’s already a **${title}** screen (${route}). Want me to add something to it instead?` } });
    const tbl = findTable(p, l) || mainTable(p), key = snakeKey(title).slice(0, 12);
    const want = TYPE_WORDS.filter(([, re]) => re.test(l)).map(([t]) => t).filter((t) => t !== 'header');
    return I(p, 'addScreen', { summary: `Add a ${title} screen`, plain: `I’ll add a **${title}** screen at ${route} with ${want.length ? listJoin(want.map((w) => w.replace('agentChat', 'a chat').replace('kpis', 'KPIs'))) : `KPIs, a table and a chart of ${tbl ? tbl.name : 'your data'}`}, and add it to the sidebar.`, technical: `${routeFile(route)} (new) · nav +1`, credits: credits(p, 3, 6),
      apply: (d) => {
        if (d.screens.length >= 6) return;
        const types = want.length ? want : ['kpis', 'table', 'chart'];
        const blocks = [B.header(`b_${key}_header`, route, title, `${title} for ${d.name}`)];
        types.forEach((t, i) => { const b = newBlock(d, t, d.data.tables.find((x) => x.id === tbl?.id), null, l, `b_${key}_${t.toLowerCase()}${i}`); if (b) blocks.push(b); });
        d.screens.push({ id: `s_${key}`, route, title, icon: 'layers', nav: true, blocks: repack(blocks) }); heal(d);
      } });
  }

  // 8. New column
  const cm = l.match(/\b(?:add|track|include|store|capture|record|need)\s+(?:a |an )?(?:new )?(?:column|field|property)\s+(?:for|called|named|with)?\s*["“']?([\w %$'-]{2,30})/) || l.match(/\b(?:add|track|include|store|capture|record)\s+(?:a |an |the )?([\w %$'-]{2,30}?)\s+(?:column|field|property)\b/);
  if (cm) {
    const tbl = (sel?.blockId && tableById(p, findBlock(p, sel.blockId)?.block?.bind?.table)) || findTable(p, l.replace(cm[1], '')) || mainTable(p);
    if (tbl) {
      const labelTxt = titleCase(clean(fromRaw(raw, cm[1])).replace(/\b(to|in|on)\b.*$/, '').trim()) || 'Notes', key = snakeKey(labelTxt), type = guessType(labelTxt);
      if (tbl.columns.some((c) => c.key === key)) return I(p, 'question', { summary: 'Column exists', credits: [0, 0], extra: { answer: `${tbl.name} already has a **${labelTxt}** column.` } });
      const users = allBlocks(p).filter(({ block }) => block.bind?.table === tbl.id && ['table', 'form'].includes(block.type)).map(({ block }) => block.id);
      return I(p, 'data', { summary: `Add a ${labelTxt} column to ${tbl.name}`, plain: `I’ll add **${labelTxt}** (${type}) to ${tbl.name}, fill sample values for the ${tbl.rows.length} existing rows, and show it in the table${users.length > 1 ? 's' : ''} and forms that use it.`, technical: `db: ALTER TABLE ${tbl.id} ADD COLUMN ${key} ${type} · ${users.length} component${users.length === 1 ? '' : 's'}`, credits: credits(p, 1, 3), touches: users,
        apply: (d) => {
          const t = d.data.tables.find((x) => x.id === tbl.id); if (!t || t.columns.some((c) => c.key === key)) return;
          const c = type === 'status' ? col(key, labelTxt, 'status', ['High', 'Medium', 'Low']) : col(key, labelTxt, type);
          t.columns.push(c); t.rows.forEach((r, i) => { r[key] = sampleValue(type, key, i, r); });
          for (const s of d.screens) for (const b of s.blocks) if (b.bind?.table === t.id) { if (b.type === 'table' && Array.isArray(b.props?.columns) && b.props.columns.length) b.props.columns.push(key); if (b.type === 'form' && Array.isArray(b.props?.fields)) b.props.fields.push(...fieldsFrom(t, [key])); }
        } });
    }
  }

  // 8b. Table tweaks: "add a filter by owner", more sample rows, CSV export button
  const tableBlocks = allBlocks(p).filter(({ block }) => block.type === 'table' && block.bind?.table);
  const selTable = sel?.blockId ? tableBlocks.find(({ block }) => block.id === sel.blockId) : null;
  const fm = l.match(/\bfilters?\s+(?:by|for|on)\s+(?:the\s+)?([a-z][\w ]*?)(?:\s+(?:to|on|in|for)\b.*)?$/) || l.match(/\blet (?:me|us|people) filter (?:\w+ )*?by\s+([a-z][\w ]*?)(?:\s+(?:to|on|in)\b.*)?$/);
  if (fm && tableBlocks.length) {
    const want = fm[1].trim().replace(/s$/, '');
    const cands = selTable ? [selTable, ...tableBlocks] : tableBlocks;
    for (const tb2 of cands) {
      const t = tableById(p, tb2.block.bind.table);
      const c = t?.columns.find((x) => lc(x.label).replace(/s$/, '') === want || x.key === snakeKey(want) || lc(x.label).startsWith(want));
      if (!c) continue;
      if ((tb2.block.props?.filters || []).includes(c.key)) return I(p, 'question', { summary: 'Filter exists', credits: [0, 0], extra: { answer: `**${titleOf(tb2.block)}** can already be filtered by ${c.label}.` } });
      return I(p, 'layout', { summary: `Filter ${titleOf(tb2.block)} by ${c.label}`, plain: `I’ll add a **${c.label}** filter to **${titleOf(tb2.block)}** on ${tb2.screen.title}. It lists every ${lc(c.label)} in ${t.name}.`, technical: `${tb2.block.file || 'components/Table.tsx'} · props.filters += ${c.key}`, credits: credits(p, 0.5, 1), touches: [tb2.block.id],
        apply: (d) => { const f = inDraft(d, tb2.block.id); if (f) f.b.props = { ...f.b.props, filters: uniq([...(f.b.props?.filters || []), c.key]) }; } });
    }
  }
  const more = l.match(/\b(?:add|generate|create|make|seed|give me)\s+(\d{1,3}|a few|some|more)\s+(?:more\s+)?(?:sample |fake |test |dummy |example |demo )?([a-z][a-z ]*?)\s*(?:rows?|records?|entries|data)?$/);
  const moreTbl = more && (findTable(p, more[2]) || (/\b(rows?|records?|sample|data|entries)\b/.test(l) && (selTable ? tableById(p, selTable.block.bind.table) : mainTable(p))));
  if (more && moreTbl && moreTbl.rows?.length) {
    const n = Math.max(1, Math.min(40, /^\d+$/.test(more[1]) ? Number(more[1]) : 5));
    return I(p, 'data', { summary: `Add ${n} sample rows to ${moreTbl.name}`, plain: `I’ll add **${n} more sample ${lc(moreTbl.name)}**, mixed from realistic values, so lists, charts and agents have more to work with. They stay marked as sample data.`, technical: `db: INSERT ${n} rows INTO ${moreTbl.id} (seed)`, credits: [0, 0.5],
      apply: (d) => {
        const t = d.data.tables.find((x) => x.id === moreTbl.id); if (!t?.rows.length) return;
        const base = t.rows.slice(), tk = t.columns.find((c) => c.type === 'text')?.key;
        for (let i = 0; i < n; i++) {
          const r = {};
          t.columns.forEach((c, j) => { r[c.key] = base[(i * (j + 3) + j + 1) % base.length][c.key]; });
          if (tk) { const a = String(base[i % base.length][tk] || '').split(' '), b = String(base[(i + 5) % base.length][tk] || '').split(' '); if (a.length > 1 && b.length > 1) r[tk] = `${a[0]} ${b[b.length - 1]}`; }
          r.id = `${t.id.slice(0, 2)}_m${Date.now().toString(36)}${i}`;
          t.rows.push(r);
        }
      } });
  }
  if (/\b(export|download)\b/.test(l) && /\b(csv|excel|spreadsheet|button)\b/.test(l) && tableBlocks.length) {
    const tb2 = selTable || tableBlocks.find(({ screen }) => screen.blocks.some((b) => b.type === 'header')) || tableBlocks[0];
    const hdr = tb2.screen.blocks.find((b) => b.type === 'header');
    if (hdr && !(hdr.props?.actions || []).some((a) => /export/i.test(a.label))) {
      return I(p, 'addBlock', { summary: `Add an Export CSV button to ${tb2.screen.title}`, plain: `I’ll add an **Export CSV** button to the ${tb2.screen.title} header. It downloads what’s in **${titleOf(tb2.block)}**, with the current filters.`, technical: `${routeFile(tb2.screen.route)} · header.actions += Export CSV`, credits: credits(p, 0.5, 1), touches: [hdr.id],
        apply: (d) => { const f = inDraft(d, hdr.id); if (f) f.b.props = { ...f.b.props, actions: [{ label: 'Export CSV', variant: 'secondary', icon: 'download' }, ...(f.b.props?.actions || [])] }; } });
    }
  }

  // 9. New block
  const bt = TYPE_WORDS.find(([, re]) => re.test(l));
  if (bt && ADD.test(l) && !/\b(make|turn) (it|this|the)\b/.test(l)) {
    const type = bt[0] === 'header' ? 'text' : bt[0];
    const scr = screenFor(p, l, sel), tbl = findTable(p, l) || (scr.blocks.find((b) => b.bind?.table) && tableById(p, scr.blocks.find((b) => b.bind?.table).bind.table)) || mainTable(p);
    const id = `b_${scr.id.replace(/^s_/, '')}_${type.toLowerCase()}_${(scr.blocks.length + 1)}`;
    const preview = newBlock(p, type, tbl, scr, l, id);
    if (!preview) return unknown();
    const after = sel?.blockId && scr.blocks.some((b) => b.id === sel.blockId) ? sel.blockId : null;
    const nameOf = { agentChat: 'chat panel', agentActivity: 'agent activity feed', kpis: 'KPI row' }[type] || type;
    return I(p, 'addBlock', { summary: `Add ${preview.title ? `“${preview.title}”` : `a ${nameOf}`} to ${scr.title}`, plain: `I’ll add ${preview.title ? `a ${nameOf} — **${preview.title}** —` : `a **${nameOf}**`} to the ${scr.title} screen${tbl && preview.bind?.table ? `, using ${tbl.name}` : ''}${after ? ', right after the selected section' : ''}.`, technical: `${preview.file} (new) · ${routeFile(scr.route)} +1 section`, credits: credits(p, 2, 4), touches: [id],
      apply: (d) => {
        const s = d.screens.find((x) => x.id === scr.id) || d.screens[0];
        if (s.blocks.some((b) => b.id === id)) return;
        const b = newBlock(d, type, d.data.tables.find((x) => x.id === tbl?.id), s, l, id); if (!b) return;
        const i = after ? s.blocks.findIndex((x) => x.id === after) : -1;
        if (i >= 0) s.blocks.splice(i + 1, 0, b); else s.blocks.push(b);
        repack(s.blocks); heal(d);
      } });
  }

  // 10. Edit an agent
  const ag = findAgent(p, l) || ((/\b(agent|assistant|bot|drafter|writer)\b/.test(l) || (sel?.blockId && findBlock(p, sel.blockId)?.block?.bind?.agent)) && (agentById(p, findBlock(p, sel?.blockId)?.block?.bind?.agent) || p.agents.find((a) => a.kind !== 'manager') || p.agents[0]));
  if (ag && /\b(tone|friendl|formal|casual|shorter|concise|brief|longer|detailed|polite|warmer|firm|professional|playful|instructions?|always|never|should|must|don'?t|stop|creative|strict|model|smarter|faster|cheaper|emoji|sign off|language|spanish|french|german)\b/.test(l)) {
    const rules = [];
    let creativity = null, tier = null;
    if (/friendl|warm|casual|playful/.test(l)) { rules.push('Write in a warm, friendly, conversational tone.'); creativity = 0.6; }
    if (/formal|professional|polite/.test(l)) { rules.push('Keep a polite, professional tone.'); creativity = 0.3; }
    if (/firm/.test(l)) rules.push('Be clear and firm, never rude.');
    if (/shorter|concise|brief/.test(l)) rules.push('Keep every reply under 80 words.');
    if (/longer|detailed/.test(l)) rules.push('Give a detailed answer with the reasoning.');
    if (/creative/.test(l)) creativity = 0.8; if (/strict/.test(l)) creativity = 0.1;
    if (/smarter|best model|better model|opus/.test(l)) tier = 'best'; if (/faster|cheaper|fast model/.test(l)) tier = 'fast';
    const lang = (l.match(/\b(spanish|french|german|hindi|portuguese|italian|japanese)\b/) || [])[1];
    if (lang) rules.push(`Reply in ${cap(lang)}.`);
    if (/\b(always|never|must|don'?t|do not|stop|should)\b/.test(l) && !rules.length) rules.push(cap(clean(raw.replace(new RegExp(ag.name, 'i'), 'it').replace(/^(make|tell|have|get|let)\s+(it|the \w+)\s+/i, ''))) + '.');
    if (!rules.length && !tier && creativity == null) rules.push(cap(clean(raw)) + '.');
    const touches = allBlocks(p).filter(({ block }) => block.bind?.agent === ag.id).map(({ block }) => block.id);
    return I(p, 'editAgent', { summary: `Update ${ag.name}`, plain: `I’ll update **${ag.name}**: ${[...rules, tier ? `use the ${tier} model tier` : null, creativity != null && !rules.length ? `set creativity to ${creativity}` : null].filter(Boolean).join(' ')} It becomes version ${(ag.version || 1) + 1}; the old one stays in history.`, technical: `agents/${snakeKey(ag.name)}.yaml · instructions${tier ? ' · model.tier' : ''}${creativity != null ? ' · creativity' : ''} · v${(ag.version || 1) + 1}`, credits: credits(p, 1, 2), touches,
      apply: (d) => {
        const a = d.agents.find((x) => x.id === ag.id); if (!a) return;
        const add = rules.filter((r) => !a.instructions.includes(r));
        if (add.length) a.instructions = `${a.instructions.trim()} ${add.join(' ')}`;
        if (creativity != null) a.model = { ...a.model, creativity };
        if (tier) a.model = { ...a.model, tier, model: { best: 'claude-opus-5-5', balanced: 'claude-sonnet-5', fast: 'claude-haiku-4-5' }[tier] };
        a.version = (a.version || 1) + 1; a.evalScore = null;
      } });
  }

  // 11. Layout: resize / chart kind
  const tb = targetBlock(p, l, sel);
  if (tb && /\b(wider|bigger|larger|full[- ]?width|narrower|smaller|half[- ]?width|third|span|shrink|expand|widen)\b/.test(l)) {
    const cur = tb.block.span || 12;
    const next = /full/.test(l) ? 12 : /half/.test(l) ? 6 : /third/.test(l) ? 4 : /(narrower|smaller|shrink)/.test(l) ? Math.max(3, cur - 4) : Math.min(12, cur + 4);
    if (next === cur) return I(p, 'question', { summary: 'Already that size', credits: [0, 0], extra: { answer: `**${titleOf(tb.block)}** is already ${cur === 12 ? 'full width' : `${cur}/12 wide`}.` } });
    return I(p, 'layout', { summary: `Make ${titleOf(tb.block)} ${next === 12 ? 'full width' : next > cur ? 'wider' : 'narrower'}`, plain: `I’ll resize **${titleOf(tb.block)}** from ${cur} to ${next} of 12 columns and re-flow the rest of ${tb.screen.title}.`, technical: `${routeFile(tb.screen.route)} · span ${cur} → ${next}`, credits: credits(p, 0.5, 1), touches: [tb.block.id], apply: (d) => { const f = inDraft(d, tb.block.id); if (f) { f.b.span = next; f.s.blocks.forEach((b) => { if (b.id !== f.b.id && b.type !== 'header' && b.span > 3 && b.span !== 12) b.span = (b.type in { chart: 1, agentChat: 1, agentActivity: 1, form: 1, list: 1 }) ? 4 : b.span; }); repack(f.s.blocks); } } });
  }
  const kindM = l.match(/\b(line|bar|donut|pie|area)\b(?: chart| graph)?/);
  if (tb && tb.block.type === 'chart' && kindM && /\b(make|change|switch|turn|show|use|convert)\b/.test(l)) {
    const kind = kindM[1] === 'pie' ? 'donut' : kindM[1];
    return I(p, 'layout', { summary: `Show ${titleOf(tb.block)} as a ${kind} chart`, plain: `I’ll switch **${titleOf(tb.block)}** to a ${kind} chart — same data, new shape.`, technical: `${tb.block.file} · kind ${tb.block.props?.kind || 'bar'} → ${kind}`, credits: credits(p, 0.5, 1), touches: [tb.block.id], apply: (d) => { const f = inDraft(d, tb.block.id); if (f) f.b.props = { ...f.b.props, kind }; } });
  }

  // 12. Copy: rename app / screen / block, quoted replacements
  const appName = raw.match(/\b(?:rename|call|name)\s+(?:the |my |this )?(?:app|project|it)\s+(?:to\s+)?["“']?([^"”']{2,40})["”']?\s*$/i) || raw.match(/^call it\s+["“']?([^"”']{2,40})/i);
  if (appName) {
    const nm = clean(appName[1]);
    return I(p, 'copy', { summary: `Rename the app to ${nm}`, plain: `I’ll rename the app from **${p.name}** to **${nm}** everywhere it appears.`, technical: 'app/layout.tsx · metadata.title · nav', credits: credits(p, 0.5, 1), apply: (d) => { const old = d.name; d.name = nm; for (const s of d.screens) for (const b of s.blocks) if (b.title && b.title.includes(old)) b.title = b.title.replace(old, nm); } });
  }
  const quoted = raw.match(/["“']([^"”']{1,60})["”']\s+(?:to|with|into)\s+["“']([^"”']{1,80})["”']/);
  if (quoted) {
    const [, from, to] = quoted;
    const hits = allBlocks(p).filter(({ block }) => JSON.stringify([block.title, block.props]).includes(from)).map(({ block }) => block.id);
    if (hits.length) return I(p, 'copy', { summary: `Change “${from}” to “${to}”`, plain: `I’ll change the wording “${from}” to “${to}” in ${hits.length} place${hits.length === 1 ? '' : 's'}.`, technical: `copy · ${hits.length} component${hits.length === 1 ? '' : 's'}`, credits: credits(p, 0.5, 1), touches: hits, apply: (d) => { for (const s of d.screens) for (const b of s.blocks) if (hits.includes(b.id)) { if (b.title) b.title = b.title.split(from).join(to); if (b.props) b.props = JSON.parse(JSON.stringify(b.props).split(from).join(to.replace(/"/g, '\\"'))); } } });
  }
  const rn = raw.match(/\b(?:rename|retitle)\s+(?:the\s+)?(.+?)\s+(?:screen|page|tab|section|block|chart|table)?\s*(?:to|as)\s+["“']?([^"”']{2,40})["”']?\s*$/i) || raw.match(/\b(?:change|set|make)\s+(?:the\s+)?(title|heading|headline|subtitle)(?:\s+of\s+(?:the\s+)?(.+?))?\s+(?:to|say|read)\s+["“']?([^"”']{2,80})["”']?\s*$/i);
  if (rn) {
    const isField = /^(title|heading|headline|subtitle)$/i.test(rn[1]);
    const newText = clean(isField ? rn[3] : rn[2]), what = lc(isField ? rn[2] || '' : rn[1]);
    const scr = !isField && p.screens.find((s) => lc(s.title) === what || what.includes(lc(s.title)));
    if (scr) return I(p, 'copy', { summary: `Rename ${scr.title} to ${newText}`, plain: `I’ll rename the **${scr.title}** screen to **${newText}**, including its header and the sidebar.`, technical: `${routeFile(scr.route)} · nav label`, credits: credits(p, 0.5, 1), touches: scr.blocks.filter((b) => b.type === 'header').map((b) => b.id), apply: (d) => { const s = d.screens.find((x) => x.id === scr.id); if (!s) return; const old = s.title; s.title = newText; for (const b of s.blocks) if (b.type === 'header' && b.props?.title === old) b.props.title = newText; } });
    const t2 = (what && targetBlock(p, what, null)) || targetBlock(p, l, sel) || (() => { const s = screenFor(p, l, sel); const h = s.blocks.find((b) => b.type === 'header'); return h ? { screen: s, block: h } : null; })();
    if (t2) {
      const sub = isField && /subtitle/i.test(rn[1]);
      return I(p, 'copy', { summary: `Change the ${sub ? 'subtitle' : 'title'} of ${titleOf(t2.block)}`, plain: `I’ll change the ${sub ? 'subtitle' : 'title'} of **${titleOf(t2.block)}** to “${newText}”.`, technical: `${t2.block.file} · copy`, credits: credits(p, 0.5, 1), touches: [t2.block.id], apply: (d) => { const f = inDraft(d, t2.block.id); if (!f) return; if (f.b.type === 'header' || f.b.type === 'hero') f.b.props = { ...f.b.props, [sub ? 'subtitle' : 'title']: newText }; else f.b.title = newText; } });
    }
  }

  // 13. Theme
  const hex = (raw.match(/#([0-9a-f]{6}|[0-9a-f]{3})\b/i) || [])[0];
  const named = Object.keys(COLORS).find((c) => new RegExp(`\\b${c}\\b`).test(l));
  const preset = THEME_PRESETS.find((t) => new RegExp(`\\b${lc(t.name)}\\b`).test(l) && /\b(theme|preset|style|look)\b/.test(l));
  const themeWords = /\b(colou?rs?|theme|dark mode|dark theme|light mode|light theme|darker|lighter|brand|accent|primary|rounder|rounded|round|corners|radius|sharper|square|font|serif|typeface|compact|denser|spacious|roomier|palette|dark|light)\b/;
  // Colour words aimed at data ("a green badge for 80+", "colour the status column") are not theme changes.
  const aboutData = /\b(columns?|badges?|rows?|cells?|thresholds?|status(?:es)?|scores?|tags?|chips?|values?|labels?)\b/.test(l) && !/\b(theme|brand|primary|accent|header|sidebar|navbar|background|whole app|everything)\b/.test(l);
  if (!aboutData && (hex || named || preset || themeWords.test(l))) {
    const ch = {}; const said = [];
    const target = /\b(accent|buttons?|highlights?|links?|secondary)\b/.test(l) ? 'accent' : 'primary';
    if (preset) { Object.assign(ch, { preset: preset.id, primary: preset.primary, accent: preset.accent, radius: preset.radius, font: preset.font, mode: preset.dark ? 'dark' : 'light' }); said.push(`switch to the ${preset.name} theme`); }
    const color = hex || (named && COLORS[named]);
    if (color && !preset) { ch[target] = color.length === 4 ? '#' + color.slice(1).split('').map((x) => x + x).join('') : color.toUpperCase(); said.push(`make the ${target === 'accent' ? 'accent (buttons & highlights)' : 'main brand'} colour ${named || color}`); }
    if (/\bdark\b/.test(l) && !/\bdark(?:er)? (?:blue|green|red|grey|gray|purple)\b/.test(l)) { ch.mode = 'dark'; said.push('switch to dark mode'); }
    else if (/\blight (?:mode|theme)\b|\blighter\b/.test(l) && !color) { ch.mode = 'light'; said.push('switch to light mode'); }
    const r0 = Number(p.theme?.radius ?? 10);
    if (/\b(rounder|rounded|round|softer|pill)\b/.test(l)) { ch.radius = Math.min(20, r0 + 4); said.push(`round the corners (${r0} → ${ch.radius}px)`); }
    if (/\b(sharper|square|squarer|boxy)\b/.test(l)) { ch.radius = Math.max(2, r0 - 4); said.push(`sharpen the corners (${r0} → ${ch.radius}px)`); }
    if (/\b(compact|denser|tighter)\b/.test(l)) { ch.density = 'compact'; said.push('use compact spacing'); }
    if (/\b(spacious|roomier|airier|comfortable)\b/.test(l)) { ch.density = 'comfortable'; said.push('use roomier spacing'); }
    const FONTS = ['Inter', 'Geist', 'Roboto', 'Poppins', 'Manrope', 'DM Sans', 'IBM Plex Sans', 'Space Grotesk', 'Work Sans', 'Nunito', 'Outfit', 'Lato', 'Open Sans', 'Instrument Serif', 'Playfair Display', 'Lora', 'Merriweather', 'Fraunces', 'JetBrains Mono', 'IBM Plex Mono'];
    const namedFont = FONTS.find((f) => new RegExp(`\\b${lc(f)}\\b`).test(l));
    if (namedFont) { ch.font = namedFont; said.push(`use ${namedFont} for the app’s text`); }
    else if (/\bserif\b/.test(l) && !/sans/.test(l)) { ch.font = 'Instrument Serif'; said.push('use a serif font for headings'); } else if (/\bsans\b|modern font/.test(l)) { ch.font = 'Geist'; said.push('use a clean sans-serif font'); }
    if (said.length) {
      return I(p, 'theme', { summary: cap(said[0]), plain: `I’ll ${listJoin(said)}. Every screen updates at once.`, technical: `styles/theme.css · ${Object.entries(ch).map(([k, v]) => `--${k}: ${v}`).join('; ')}`, credits: credits(p, 0.5, 1.5), touches: p.screens[0]?.blocks.slice(0, 2).map((b) => b.id) || [],
        apply: (d) => {
          d.theme = { ...(d.theme || {}), ...ch };
          if (ch.mode === 'light' && THEME_PRESETS.find((t) => t.id === d.theme.preset)?.dark) d.theme.preset = 'blueprint';
        } });
    }
  }

  // 14. Header/title copy on a selection ("make this say …")
  const say = raw.match(/\b(?:say|read|to)\s+["“']([^"”']{2,80})["”']/);
  if (say && tb) return I(p, 'copy', { summary: `Change the text of ${titleOf(tb.block)}`, plain: `I’ll change **${titleOf(tb.block)}** to “${say[1]}”.`, technical: `${tb.block.file} · copy`, credits: credits(p, 0.5, 1), touches: [tb.block.id], apply: (d) => { const f = inDraft(d, tb.block.id); if (!f) return; if (f.b.type === 'header' || f.b.type === 'hero') f.b.props = { ...f.b.props, title: say[1] }; else if (f.b.type === 'text') f.b.props = { ...f.b.props, body: say[1] }; else f.b.title = say[1]; } });

  return unknown();
}
