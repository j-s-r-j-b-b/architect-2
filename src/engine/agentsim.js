// Simulated agent runs, grounded in the project's own tables, knowledge and tools.
// Used by agentChat blocks in generated apps and by the agent "Try it" playground.
import { sleep } from '../lib/util.js';
import { agentById, tableById } from './schema.js';
import { integrationById } from './catalog.js';
import { archetypeById } from './generate.js';

const INJECTION = /ignore (?:all |any |your |the )?(?:previous|prior|above) (?:instructions|rules)|disregard (?:your|the) (?:instructions|rules)|system prompt|you are now|jailbreak|developer mode/;
const SECRET = /\bpasswords?\b|credit card numbers?|card numbers?|\bcvv\b|social security|\bssn\b|passport numbers?|bank account numbers?|api keys?|secret keys?/;
const SEND_RE = /^(send_|reply_ticket$|post_message$|share_post$|post$)/;
const STOP = new Set(['the', 'and', 'for', 'with', 'from', 'this', 'that', 'what', 'which', 'who', 'why', 'how', 'can', 'you', 'our', 'your', 'about', 'draft', 'write', 'email', 'follow', 'up', 'new', 'all', 'any', 'get', 'tell', 'show', 'me', 'is', 'are', 'a', 'an', 'to', 'of', 'in', 'on', 'it', 'do', 'i', 'we']);
const THINK = { top: 'Working out what matters most', count: 'Counting and grouping', explain: 'Finding the record you mean', draft: 'Planning the message', schedule: 'Checking availability', summary: 'Pulling together a summary', answer: 'Understanding the question', lookup: 'Searching the documents' };

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const low = (s) => String(s ?? '').toLowerCase();
const trunc = (s, n = 110) => { const t = String(s ?? '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t; };
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
const tokens = (s) => low(s).match(/[a-z0-9#][a-z0-9#'’-]*/g) || [];

const nextUp = (cfg) => cfg.tbl.rows.filter((r) => Number(r[cfg.dateKey]) > Date.now()).sort((a, b) => a[cfg.dateKey] - b[cfg.dateKey])[0] || null;
function dateWindow(t) {
  const day = (n) => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime() + n * 864e5; };
  if (/\btoday\b|\btonight\b/.test(t)) return { from: day(0), to: day(1), label: 'today' };
  if (/\btomorrow\b/.test(t)) return { from: day(1), to: day(2), label: 'tomorrow' };
  if (/\bthis week\b|\bnext 7 days\b|\bdue soon\b|\bupcoming\b|\bcoming up\b/.test(t)) return { from: day(0), to: day(7), label: 'in the next 7 days' };
  if (/\bnext week\b/.test(t)) return { from: day(7), to: day(14), label: 'next week' };
  return null;
}

function classify(t) {
  if (/\b(draft|write|compose|reply|respond|email|e-mail|follow[- ]?up|remind|reminder|message|nudge|invite|send)\b/.test(t)) return 'draft';
  if (/\b(schedule|book|slot|slots|calendar|meeting|interview|appointment|available|availability|free time|reschedule)\b/.test(t) && !/\bhow many\b/.test(t)) return 'schedule';
  if (/\bhow many\b|\bcount\b|\bnumber of\b|\btotal\b/.test(t)) return 'count';
  if (/\b(summar|overview|report|recap|digest|this week|this month|status update|how are we|how is it going)/.test(t)) return 'summary';
  if (/\b(which|who should|top|priorit|urgent|attention|first|most|best|hot|biggest|highest|worst|overdue|at risk|behind|flagged|low|next)\b/.test(t)) return 'top';
  if (/\b(why|explain|tell me about|details|what about|what's up with|status of|how is|how's)\b/.test(t)) return 'explain';
  return 'answer';
}

// ---------------------------------------------------------------------------
// Data grounding
// ---------------------------------------------------------------------------
function replyCfg(p) {
  const arch = archetypeById(p?.archetype);
  const r = arch?.reply;
  const tbl = r && arch.id !== 'generic' ? tableById(p, r.table) : null;
  if (tbl?.rows?.length) return { ...r, tbl, many: tbl.name.toLowerCase() };
  const t = (p?.data?.tables || []).find((x) => x.id !== 'agent_runs' && x.rows?.length) || null;
  if (!t) return { tbl: null };
  const cols = t.columns || [];
  const by = (types, skip) => cols.find((c) => types.includes(c.type) && c.key !== skip)?.key;
  const title = by(['person', 'text']) || cols[0]?.key;
  return { tbl: t, many: t.name.toLowerCase(), title, sub: by(['text', 'person', 'status'], title), metric: by(['score', 'percent', 'number']), money: by(['money']), status: by(['status']), reason: by(['longtext']), dateKey: by(['datetime', 'date']), priority: cols.find((c) => c.type === 'status')?.options, draft: r?.draft };
}
const colOf = (cfg, key) => cfg.tbl?.columns?.find((c) => c.key === key);
function fmtVal(cfg, key, v) {
  const c = colOf(cfg, key);
  if (v === null || v === undefined || v === '') return '—';
  if (!c) return String(v);
  if (c.type === 'money') return '$' + Math.round(Number(v)).toLocaleString('en-US');
  if (c.type === 'percent') return `${v}%`;
  if (c.type === 'date') return new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (c.type === 'datetime') return new Date(v).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  return String(v);
}
const label = (cfg, key) => (colOf(cfg, key)?.label || key || '').toLowerCase();

function ranked(cfg) {
  const rows = cfg.tbl.rows.slice();
  const pr = cfg.priority || [];
  const pk = cfg.priorityKey || cfg.status;
  const val = (r) => Number(r[cfg.metric] ?? r[cfg.money] ?? 0) || 0;
  return rows.sort((a, b) => {
    const ia = pr.indexOf(a[pk]), ib = pr.indexOf(b[pk]);
    if (pr.length && ia !== ib) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    return val(b) - val(a);
  });
}

/** Rows the message refers to (by name, company, key…), best matches first. */
function mentioned(cfg, text) {
  const t = low(text), words = new Set(tokens(t));
  const scored = [];
  for (const row of cfg.tbl.rows) {
    let s = 0;
    for (const key of [cfg.title, cfg.sub]) {
      const v = low(row[key]);
      if (!v || v.length < 3) continue;
      if (t.includes(v)) s += 3;
      else {
        const ws = tokens(v).filter((w) => w.length >= 3 && !STOP.has(w));
        if (ws[0] && words.has(ws[0])) s += 2;
        else if (ws.some((w) => w.length >= 5 && words.has(w))) s += 1;
      }
    }
    if (s) scored.push([s, row]);
  }
  scored.sort((a, b) => b[0] - a[0]);
  return scored.filter(([s]) => s >= scored[0]?.[0]).map(([, r]) => r);
}
function fromHistory(cfg, history) {
  const last = [...(history || [])].reverse().map((h) => (typeof h === 'string' ? h : h?.answer || h?.text || h?.content || '')).find(Boolean);
  if (!last) return [];
  const t = low(last);
  return cfg.tbl.rows.filter((r) => r[cfg.title] && t.includes(low(r[cfg.title]))).slice(0, 3);
}
function line(cfg, r, i) {
  const bits = [];
  if (cfg.metric && r[cfg.metric] != null) bits.push(`${label(cfg, cfg.metric)} ${fmtVal(cfg, cfg.metric, r[cfg.metric])}`);
  if (cfg.money && r[cfg.money] != null && cfg.money !== cfg.metric) bits.push(fmtVal(cfg, cfg.money, r[cfg.money]));
  if (cfg.status && r[cfg.status]) bits.push(r[cfg.status]);
  if (cfg.dateKey && r[cfg.dateKey] && !cfg.metric) bits.push(fmtVal(cfg, cfg.dateKey, r[cfg.dateKey]));
  const sub = cfg.sub && r[cfg.sub] && r[cfg.sub] !== r[cfg.title] ? ` (${trunc(r[cfg.sub], 40)})` : '';
  const why = cfg.reason && r[cfg.reason] && r[cfg.reason] !== '—' ? ` — ${trunc(String(r[cfg.reason]).split('\n')[0], 90)}` : '';
  return `${i + 1}. **${r[cfg.title]}**${sub} · ${bits.join(', ')}${why}`;
}

// ---------------------------------------------------------------------------
// Agents & tools
// ---------------------------------------------------------------------------
const actsOf = (a) => (a?.tools || []).flatMap((t) => t.actions.map((x) => ({ tool: t.id, a: x })));
function chooseWorker(p, mgr, intent, t) {
  const ws = (mgr.delegatesTo || []).map((id) => agentById(p, id)).filter(Boolean);
  if (!ws.length) return mgr;
  const named = ws.find((w) => tokens(w.name).some((x) => x.length > 3 && t.includes(x)));
  if (named) return named;
  if (intent === 'draft') return ws.find((w) => actsOf(w).some((x) => SEND_RE.test(x.a) || x.a === 'create_draft')) || ws[ws.length - 1];
  if (intent === 'schedule') return ws.find((w) => actsOf(w).some((x) => x.tool === 'gcal') || /schedul|book/i.test(w.name)) || ws[0];
  return ws.find((w) => /qualif|triage|screen|check|analy|expert|planner|reader|extract|tutor|organi|research|watch/i.test(w.name)) || ws[0];
}
function readStep(cfg, worker) {
  const t = cfg.tbl, n = t.rows.length, src = t.source === 'live' ? 'live' : t.source === 'test' ? 'test data' : 'sample data';
  const tool = t.connection && (worker.tools || []).find((x) => x.id === t.connection);
  const act = tool?.actions.find((a) => /^(search|list|read|query|get)/.test(a));
  if (tool && act) return { kind: 'tool', label: `Searched ${integrationById(tool.id).name}`, detail: `${tool.id}.${act} · ${plural(n, 'row')} (${src})`, ms: 520 };
  return { kind: 'tool', label: `Looked up ${t.name}`, detail: `${t.id} table · ${plural(n, 'row')} · ${src}`, ms: 380 };
}
function knowledgeStep(worker, t, row, cfg) {
  if (cfg.cite && row?.[cfg.cite] && row[cfg.cite] !== '—') return { kind: 'knowledge', label: `Read ${row[cfg.cite]}`, detail: `p.${row[cfg.page] || 1} — “${trunc(row[cfg.reason], 80)}”`, ms: 420 };
  const ks = (worker.knowledge || []).filter((k) => k.type !== 'table');
  if (!ks.length) return null;
  const k = ks.find((x) => tokens(x.name).some((w) => w.length > 3 && t.includes(w))) || ks[0];
  const page = 1 + (Array.from(k.name).reduce((s, ch) => s + ch.charCodeAt(0), 0) % 7);
  const rule = trunc((worker.instructions || '').split(/(?<=\.)\s/)[0], 80);
  return { kind: 'knowledge', label: `Read ${k.name}`, detail: `p.${page} — “${rule}”`, ms: 420 };
}

// ---------------------------------------------------------------------------
// Compose a reply
// ---------------------------------------------------------------------------
function compose(p, agentId, message, history) {
  const agent = agentById(p, agentId) || (p?.agents || []).find((a) => a.kind === 'manager') || p?.agents?.[0];
  if (!agent) return { text: 'This agent isn’t set up yet — add one in the Agents tab and try again.', steps: [], cost: 0 };
  const t = low(message).trim();
  const steps = [];
  const g = agent.guardrails || {};
  if (!t) return { text: `Hi! I’m ${agent.name}. ${agent.role || ''}`.trim(), steps: [], cost: 0.002 };
  if (g.injection !== false && INJECTION.test(t)) {
    steps.push({ kind: 'guardrail', label: 'Blocked a prompt-injection attempt', detail: 'The message tried to change my instructions — ignored.', ms: 180 });
    return { text: 'I can’t do that — I only follow the instructions my owner set for me. Ask me about your data instead.', steps, cost: 0.004 };
  }
  if (g.pii !== false && SECRET.test(t)) {
    steps.push({ kind: 'guardrail', label: 'Protected sensitive data', detail: 'Passwords, card and ID numbers are never read or shared.', ms: 160 });
    return { text: 'I never ask for or share passwords, card numbers or ID numbers. If something needs them, a person on your team handles it directly.', steps, cost: 0.004 };
  }
  const blocked = (g.blocked || []).find((b) => {
    const ws = tokens(b).filter((w) => w.length > 4).map((w) => w.replace(/s$/, ''));
    return ws.length && ws.filter((w) => t.includes(w)).length >= Math.min(2, ws.length);
  });
  if (blocked) {
    steps.push({ kind: 'guardrail', label: 'Stayed within my boundaries', detail: `“${blocked}” is a blocked topic for ${agent.name}.`, ms: 170 });
    return { text: `That’s outside what I’m allowed to help with (${blocked.toLowerCase()}). ${agent.role ? `I can help with this, though: ${agent.role.charAt(0).toLowerCase() + agent.role.slice(1)}.` : ''}`, steps, cost: 0.005 };
  }
  steps.push({ kind: 'guardrail', label: 'Checked the request', detail: `PII redaction on · injection scan passed${g.topics?.length ? ` · on-topic (${g.topics.slice(0, 2).join(', ')})` : ''}`, ms: 140 });

  const cfg = replyCfg(p);
  let intent = classify(t);
  if (cfg.cite) intent = intent === 'draft' || intent === 'summary' ? intent : 'lookup';
  steps.push({ kind: 'think', label: THINK[intent] || THINK.answer, ms: 320 });

  let worker = agent;
  if (agent.kind === 'manager' && agent.delegatesTo?.length) {
    worker = chooseWorker(p, agent, intent, t);
    if (worker !== agent) steps.push({ kind: 'delegate', label: `Handed to ${worker.name}`, detail: worker.role, ms: 260 });
  }
  if (!cfg.tbl) {
    const k = knowledgeStep(worker, t, null, cfg);
    if (k) steps.push(k);
    return finish(p, agent, steps, `I don’t have any data to look at yet. Once ${p?.name || 'the app'} has records, I can find, explain and summarise them for you.`);
  }

  const many = cfg.many || 'records';
  const hits = mentioned(cfg, t);
  const win = dateWindow(t);
  const dated = win && cfg.dateKey ? cfg.tbl.rows.filter((r) => Number(r[cfg.dateKey]) >= win.from && Number(r[cfg.dateKey]) < win.to).sort((a, b) => a[cfg.dateKey] - b[cfg.dateKey]) : null;
  let rowsRef = hits.length ? hits : /\b(them|those|these|they|it|that one|him|her)\b/.test(t) ? fromHistory(cfg, history) : [];
  if (!rowsRef.length && dated?.length && intent === 'draft') rowsRef = dated;
  steps.push(readStep(cfg, worker));
  const note = cfg.tbl.source === 'live' ? '' : `\n\n_Based on ${plural(cfg.tbl.rows.length, 'sample row')} — connect your real data anytime._`;
  const R = ranked(cfg);

  if (dated && !hits.length && ['top', 'answer', 'summary', 'explain', 'count'].includes(intent)) {
    if (!dated.length) return finish(p, agent, steps, `Nothing in ${cfg.tbl.name} ${win.label}. ${nextUp(cfg) ? `The next one is **${nextUp(cfg)[cfg.title]}** (${fmtVal(cfg, cfg.dateKey, nextUp(cfg)[cfg.dateKey])}).` : ''}${note}`, worker);
    return finish(p, agent, steps, `${plural(dated.length, many.replace(/s$/, ''), many)} ${win.label}:\n\n${dated.slice(0, 5).map((r, i) => line(cfg, r, i)).join('\n')}${dated.length > 5 ? `\n…and ${dated.length - 5} more.` : ''}${note}`, worker);
  }

  if (intent === 'lookup') {
    const qs = cfg.tbl.rows.map((r) => { const w = tokens(r[cfg.title]).filter((x) => x.length > 3 && !STOP.has(x)); const s = w.filter((x) => t.includes(x.replace(/s$/, ''))).length / (w.length || 1); return [s, r]; }).sort((a, b) => b[0] - a[0]);
    const [score, row] = qs[0] || [0, null];
    if (row && score >= 0.4 && row[cfg.cite] && row[cfg.cite] !== '—') {
      steps.push(knowledgeStep(worker, t, row, cfg));
      return finish(p, agent, steps, `${row[cfg.reason]}\n\n**Source:** ${row[cfg.cite]}, page ${row[cfg.page] || 1}.`, worker);
    }
    const logger = (p.agents || []).find((a) => actsOf(a).some((x) => /post_message|send_message/.test(x.a))) || worker;
    const act = actsOf(logger).find((x) => /post_message|send_message/.test(x.a));
    steps.push({ kind: 'knowledge', label: 'Searched every document', detail: `${(worker.knowledge || []).length || 'All'} documents · no passage matches`, ms: 460 });
    if (act && (logger.approvals || []).includes(act.a)) {
      steps.push({ kind: 'approval', label: `Asking before posting to HR`, detail: `${act.tool}.${act.a} needs approval`, ms: 200 });
      return finish(p, agent, steps, 'I couldn’t find that in any of the documents, so I won’t guess. I’ve drafted a note for HR — approve it and they’ll follow up.', worker, { action: act.a, preview: `New unanswered question:\n“${message.trim()}”` });
    }
    return finish(p, agent, steps, `I couldn’t find that in any of the documents, so I won’t guess. I’ve logged it for HR${act ? ` in ${integrationById(act.tool).name}` : ''} — they’ll add the answer.`, worker);
  }

  if (intent === 'count') {
    const by = {};
    for (const r of cfg.tbl.rows) { const k = r[cfg.status] ?? 'Other'; by[k] = (by[k] || 0) + 1; }
    const parts = Object.entries(by).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${n} ${k}`);
    const avg = cfg.metric ? Math.round(cfg.tbl.rows.reduce((s, r) => s + (Number(r[cfg.metric]) || 0), 0) / cfg.tbl.rows.length) : null;
    const total = cfg.money ? cfg.tbl.rows.reduce((s, r) => s + (Number(r[cfg.money]) || 0), 0) : null;
    return finish(p, agent, steps, `You have **${plural(cfg.tbl.rows.length, many.replace(/s$/, ''), many)}**${parts.length && cfg.status ? `: ${parts.join(', ')}` : ''}.${avg != null ? ` The average ${label(cfg, cfg.metric)} is ${avg}.` : ''}${total != null ? ` Together they’re worth ${fmtVal(cfg, cfg.money, total)}.` : ''}${note}`, worker);
  }

  if (intent === 'schedule') {
    const cal = actsOf(worker).find((x) => x.tool === 'gcal') || actsOf(worker).find((x) => /event/.test(x.a));
    if (cal) steps.push({ kind: 'tool', label: 'Checked the calendar', detail: `${cal.tool}.list_events · next 5 working days`, ms: 540 });
    const d = new Date(); const slots = [];
    for (let i = 1; slots.length < 3 && i < 10; i++) { const x = new Date(d.getTime() + i * 864e5); if (x.getDay() % 6 === 0) continue; x.setHours([10, 14, 11][slots.length], slots.length === 1 ? 30 : 0, 0, 0); slots.push(x); }
    const who = rowsRef.find((r) => r[cfg.title] && t.includes(low(String(r[cfg.title]).split(' ')[0])));
    const fmt =(x) => x.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    const needs = (worker.approvals || []).includes('create_event') && actsOf(worker).some((x) => x.a === 'create_event');
    if (needs) steps.push({ kind: 'approval', label: 'Waiting for your approval to book', detail: 'create_event is on the approval list', ms: 200 });
    return finish(p, agent, steps, `Here are the next three open slots${who ? ` for **${who[cfg.title]}**` : ''}:\n\n1. ${fmt(slots[0])}\n2. ${fmt(slots[1])}\n3. ${fmt(slots[2])}\n\n${needs ? 'Approve below and I’ll book the first one and send the invite.' : 'Tell me which one and I’ll book it.'}`, worker, needs ? { action: 'create_event', preview: `${who ? who[cfg.title] : 'New booking'} · ${fmt(slots[0])} · 30 min` } : null);
  }

  if (intent === 'draft') {
    const row = rowsRef[0] || R[0];
    const k = knowledgeStep(worker, t, row, cfg); if (k) steps.push(k);
    const d = typeof cfg.draft === 'function' ? cfg.draft(row, { sender: (p.agents || []).length ? 'the team' : 'Me' }) : null;
    const acts = actsOf(worker);
    const send = acts.find((x) => SEND_RE.test(x.a)), draft = acts.find((x) => x.a === 'create_draft');
    const pk = (cfg.tbl.columns || []).find((c) => c.type === 'person')?.key;
    const person = pk ? row[pk] : row[cfg.title];
    const first = String(person || 'there').split(' ')[0];
    const about = pk === cfg.title ? (row[cfg.sub] || 'your booking') : row[cfg.title];
    const when = cfg.dateKey && row[cfg.dateKey] ? fmtVal(cfg, cfg.dateKey, row[cfg.dateKey]) : null;
    const isText = !d && send && /sms|send_message/.test(send.a);
    const subject = d?.subject || `Reminder: ${trunc(about, 50)}${when ? ` — ${when}` : ''}`;
    const body = d?.body || (isText
      ? `Hi ${first}, a quick reminder: ${trunc(about, 60)}${when ? ` on ${when}` : ''}. Reply C to cancel or R to reschedule.`
      : `Hi ${first} — a quick reminder about ${trunc(about, 60)}${when ? ` (${when})` : ''}${row[cfg.status] ? `, currently ${String(row[cfg.status]).toLowerCase()}` : ''}. Let me know if anything has changed and I’ll update it.\n\nThanks!`);
    const to = d?.to || row.email || row.phone || person;
    if (draft) steps.push({ kind: 'tool', label: 'Saved a draft', detail: `${draft.tool}.create_draft · to ${to}`, ms: 480 });
    const needs = send && (worker.approvals || []).includes(send.a);
    const wantsSend = /\bsend\b/.test(t);
    if (needs) steps.push({ kind: 'approval', label: 'Waiting for your approval to send', detail: `${send.tool}.${send.a} is on the approval list`, ms: 220 });
    else if (send && wantsSend) steps.push({ kind: 'tool', label: `Sent via ${integrationById(send.tool).name}`, detail: `${send.tool}.${send.a} · logged in Agent runs`, ms: 520 });
    const others = rowsRef.length > 1 ? `\n\nI can draft the other ${rowsRef.length - 1} the same way.` : '';
    const tail = needs ? 'Approve below to send it — nothing goes out until you do.' : send && wantsSend ? 'Sent and logged in Agent runs.' : 'Want me to change the tone or length?';
    return finish(p, agent, steps, `Here’s a draft for **${person}**${pk && pk !== cfg.title ? ` about “${trunc(about, 50)}”` : ''}:\n\n${isText ? '' : `**Subject:** ${subject}\n\n`}${body}\n\n${tail}${others}`, worker, needs ? { action: send.a, preview: `To: ${to}\n${isText ? '' : `Subject: ${subject}\n\n`}${body}` } : null);
  }

  if (intent === 'explain' || (intent === 'answer' && rowsRef.length)) {
    const row = rowsRef[0] || R[0];
    if (actsOf(worker).some((x) => x.a === 'enrich_company') && row.company) steps.push({ kind: 'tool', label: `Enriched ${row.company}`, detail: `apollo.enrich_company · ${row.employees ? `${Number(row.employees).toLocaleString('en-US')} staff` : 'firmographics'}`, ms: 560 });
    const k = knowledgeStep(worker, t, row, cfg); if (k) steps.push(k);
    const facts = (cfg.tbl.columns || []).filter((c) => ![cfg.title, cfg.reason, 'id'].includes(c.key) && c.type !== 'longtext' && row[c.key] != null && row[c.key] !== '').slice(0, 5).map((c) => `${c.label}: ${fmtVal(cfg, c.key, row[c.key])}`);
    const miss = !rowsRef.length ? `I wasn’t sure which one you meant, so here’s the top one.\n\n` : '';
    return finish(p, agent, steps, `${miss}**${row[cfg.title]}** — ${facts.join(' · ')}.${cfg.reason && row[cfg.reason] ? `\n\n**Why:** ${trunc(String(row[cfg.reason]).replace(/\n/g, '; '), 220)}` : ''}`, worker);
  }

  if (intent === 'summary') {
    const by = {};
    for (const r of cfg.tbl.rows) { const k = r[cfg.status] ?? 'Other'; by[k] = (by[k] || 0) + 1; }
    const top = R.slice(0, 2).map((r) => `**${r[cfg.title]}**`);
    const parts = Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, n]) => `${n} ${k.toLowerCase()}`);
    const runs = tableById(p, 'agent_runs')?.rows?.length || 0;
    return finish(p, agent, steps, `**${cfg.tbl.name} at a glance:** ${plural(cfg.tbl.rows.length, 'record')}${parts.length && cfg.status ? ` — ${parts.join(', ')}` : ''}. Top of the list: ${top.join(' and ')}.${runs ? ` The agents ran ${plural(runs, 'time')} recently; every step is in Agent runs.` : ''}${note}`, worker);
  }

  // top / general question → ranked list
  const n = intent === 'top' ? 3 : 3;
  const list = R.slice(0, n).map((r, i) => line(cfg, r, i)).join('\n');
  const next = typeof cfg.draft === 'function' ? 'Want me to draft follow-ups for them?' : 'Want the details on any of these?';
  const lead = intent === 'top' ? `Here are the ${n} ${many} to look at first:` : `Here’s what stands out in ${cfg.tbl.name}:`;
  return finish(p, agent, steps, `${lead}\n\n${list}\n\n${next}${note}`, worker);
}

function finish(p, agent, steps, text, worker = agent, needsApproval = null) {
  if (worker?.guardrails?.groundedness !== false) steps.push({ kind: 'guardrail', label: 'Checked the answer is grounded', detail: 'Every fact comes from your tables or knowledge files', ms: 120 });
  const mult = worker?.model?.tier === 'best' ? 2.2 : worker?.model?.tier === 'fast' ? 0.5 : 1;
  const cost = Math.round(clamp((0.008 + steps.length * 0.004) * mult, 0.01, 0.06) * 1000) / 1000;
  const out = { text, steps, cost };
  if (needsApproval) out.needsApproval = needsApproval;
  return out;
}

/**
 * Simulated agent run, grounded in the project's own tables/knowledge.
 * @returns {Promise<{text:string, steps:{kind:'think'|'knowledge'|'tool'|'delegate'|'approval'|'guardrail', label:string, detail?:string, ms:number}[], cost:number, needsApproval?:{action:string, preview:string}}>}
 */
export async function agentReply(project, agentId, message, { history = [] } = {}) {
  let res;
  try { res = compose(project, agentId, String(message ?? ''), history); } catch (e) {
    console.warn('[agentsim]', e);
    res = { text: 'I hit a snag reading your data — nothing was changed. Try asking again in a moment.', steps: [{ kind: 'think', label: 'Understanding the request', ms: 300 }], cost: 0.01 };
  }
  const len = String(message ?? '').length;
  await sleep(clamp(700 + res.steps.length * 240 + Math.min(500, len * 4), 800, 2500));
  return res;
}
