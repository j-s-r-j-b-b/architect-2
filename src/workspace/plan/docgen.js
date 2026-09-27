// Generate real documents from the project contract: spec, pitch deck, agent skills, starter files,
// print view and templated "ask for a document" docs.
import { fmtRange, fmtDate } from '../../lib/util.js';
import { integrationById, frameworkById } from '../../engine/catalog.js';
import { mdToHtml } from './md.js';
import { slug } from './shared.js';

const STATUS_WORD = { planned: 'Planned', building: 'Building', verified: 'Verified', live: 'Live', deferred: 'Deferred', failed: 'Needs attention' };
const tick = (pr) => (pr.status === 'verified' || pr.status === 'live' ? 'x' : ' ');
const active = (p) => (p.plan?.promises || []).filter((x) => x.status !== 'deferred');
const deferred = (p) => (p.plan?.promises || []).filter((x) => x.status === 'deferred');
const tierWord = { fast: 'Fast', balanced: 'Balanced', best: 'Best' };
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function specMarkdown(p) {
  const q = p.plan?.quote;
  const L = [];
  L.push(`# ${p.name} — product spec`, '', `> ${p.plan?.summary || p.description || 'No summary yet.'}`, '');
  L.push(`**For:** ${p.plan?.audience || '—'}  `, `**Status:** ${p.status} · generated ${fmtDate(Date.now())}`, '');
  L.push('## Promises (scope contract)', '');
  active(p).forEach((pr) => {
    L.push(`### ${pr.id}. ${pr.title}`, '', `${pr.detail || ''}`, '', `Status: **${STATUS_WORD[pr.status] || pr.status}**${pr.cost ? ` · est. ${fmtRange(pr.cost)} credits` : ''}`, '');
    (pr.checks || []).forEach((c) => L.push(`- [${tick(pr)}] ${c}`));
    if (pr.proof) L.push('', `Proof: ${pr.proof}`);
    L.push('');
  });
  if (deferred(p).length) {
    L.push('## Deferred', '');
    deferred(p).forEach((pr) => L.push(`- **${pr.id}. ${pr.title}** — ${pr.deferredReason || 'Deferred'}`));
    L.push('');
  }
  if (p.plan?.decisions?.length) {
    L.push('## Decisions', '', '| Topic | Decision |', '| --- | --- |');
    p.plan.decisions.forEach((d) => L.push(`| ${d.q} | ${d.a} |`));
    L.push('');
  }
  L.push('## Agents', '');
  (p.agents || []).forEach((a) => {
    L.push(`### ${a.name} (${a.kind})`, '', a.role || '', '');
    L.push(`- **Model tier:** ${tierWord[a.model?.tier] || a.model?.tier || 'Balanced'}`);
    L.push(`- **Framework:** ${frameworkById(a.framework).name}`);
    if (a.triggers?.length) L.push(`- **Starts on:** ${a.triggers.map((t) => `${t.type} (${t.detail})`).join('; ')}`);
    if (a.tools?.length) L.push(`- **Tools:** ${a.tools.map((t) => `${t.name} — ${t.actions.join(', ')}`).join('; ')}`);
    if (a.knowledge?.length) L.push(`- **Knowledge:** ${a.knowledge.map((k) => k.name).join(', ')}`);
    if (a.approvals?.length) L.push(`- **Needs approval for:** ${a.approvals.join(', ')}`);
    if (a.limits) L.push(`- **Limits:** $${a.limits.costPerRun}/run · ${a.limits.steps} steps${a.limits.monthlyBudget ? ` · $${a.limits.monthlyBudget}/month` : ''}`);
    L.push('');
  });
  L.push('## Screens', '');
  (p.screens || []).forEach((s) => {
    L.push(`### ${s.title} — \`${s.route}\``, '');
    s.blocks.forEach((b) => L.push(`- ${b.title || b.props?.title || b.type} *(${b.type})*${b.promise ? ` — fulfils ${b.promise}` : ''}`));
    L.push('');
  });
  L.push('## Data', '');
  (p.data?.tables || []).forEach((t) => {
    L.push(`### ${t.name} (\`${t.id}\`) — ${t.source} data${t.connection ? `, from ${integrationById(t.connection).name}` : ''}`, '');
    L.push('| Column | Type |', '| --- | --- |');
    t.columns.forEach((c) => L.push(`| ${c.label} (\`${c.key}\`) | ${c.type}${c.options ? `: ${c.options.join(' / ')}` : ''} |`));
    if (t.rules) L.push('', `Access: ${t.rules}`);
    L.push('');
  });
  if (p.integrations?.length) {
    L.push('## Connections', '');
    p.integrations.forEach((i) => L.push(`- **${integrationById(i.id).name}** — ${i.status}${i.scopes?.length ? ` (${i.scopes.join(', ')})` : ''}`));
    L.push('');
  }
  if (q) {
    L.push('## Quote', '', `**${fmtRange(q.credits)} credits · ${fmtRange(q.minutes)} minutes** (model tier: ${tierWord[q.modelTier] || q.modelTier}${q.cap ? `, cap ${q.cap} credits` : ''})`, '');
    (q.lines || []).forEach((l) => L.push(`- ${l.label}: ${fmtRange(l.credits)}`));
    L.push('');
  }
  return L.join('\n');
}

export function deckSlides(p) {
  const agents = p.agents || [];
  const q = p.plan?.quote;
  const guard = agents.flatMap((a) => (a.approvals || []).map((x) => `${a.name} asks before it can ${x.replace(/_/g, ' ')}`));
  return [
    { kicker: 'Introducing', title: p.name, body: p.description || p.plan?.summary || '', big: true },
    { kicker: 'The problem', title: 'What slows the team down today', bullets: [p.prompt || p.plan?.summary || 'Manual, repetitive work that should be automatic.'] },
    { kicker: 'The solution', title: `${p.name} in one paragraph`, body: p.plan?.summary || p.description || '' },
    { kicker: 'What it promises', title: `${active(p).length} checkable promises`, bullets: active(p).map((x) => `${x.id} · ${x.title}`) },
    { kicker: 'How it works', title: `${agents.length} agents working as a team`, bullets: agents.map((a) => `${a.name} — ${a.role}`) },
    { kicker: 'What people see', title: `${(p.screens || []).length} screens`, bullets: (p.screens || []).map((s) => `${s.title} (${s.route}) — ${s.blocks.length} sections`) },
    { kicker: 'Built on your tools', title: 'Data & connections', bullets: [...(p.data?.tables || []).map((t) => `${t.name}: ${t.rows.length} rows (${t.source} data)`), ...(p.integrations || []).map((i) => `${integrationById(i.id).name} — ${i.status === 'connected' ? 'connected' : 'to connect'}`)] },
    { kicker: 'Trust by design', title: 'Humans stay in charge', bullets: [...guard, 'Guardrails check for personal data, prompt injection and grounded answers', 'Every change is a checkpoint you can restore'] },
    { kicker: 'Cost & next steps', title: q ? `${fmtRange(q.credits)} credits to build` : 'Next steps', bullets: [...(q ? [`About ${fmtRange(q.minutes)} minutes of build time`] : []), ...deferred(p).map((x) => `Next: ${x.title}`), 'Launch to a private link, then to the team'] },
  ];
}

export function deckHtml(p) {
  const t = p.theme || {};
  const primary = t.primary || '#2F5BEA';
  const slides = deckSlides(p).map((s, i) => `<section class="s${s.big ? ' big' : ''}"><div class="k">${esc(s.kicker)}</div><h1>${esc(s.title)}</h1>${s.body ? `<p>${esc(s.body)}</p>` : ''}${s.bullets?.length ? `<ul>${s.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}<div class="n">${i + 1}</div></section>`).join('\n');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(p.name)} — pitch deck</title>
<style>
*{box-sizing:border-box}html,body{margin:0;height:100%;background:#0f1115;font-family:Geist,system-ui,-apple-system,Segoe UI,sans-serif}
.deck{height:100%;overflow-y:auto;scroll-snap-type:y mandatory}
.s{position:relative;height:100vh;scroll-snap-align:start;display:flex;flex-direction:column;justify-content:center;padding:8vh 10vw;background:#fbfaf7;color:#15171c;border-bottom:1px solid #e6e4dd}
.s.big{background:${primary};color:#fff}.s.big .k{color:rgba(255,255,255,.75)}
.k{font-size:14px;letter-spacing:.12em;text-transform:uppercase;color:${primary};font-weight:600;margin-bottom:18px}
h1{font-size:clamp(32px,5vw,64px);line-height:1.05;margin:0 0 20px;letter-spacing:-.02em;font-weight:650}
p{font-size:clamp(17px,1.8vw,24px);line-height:1.5;max-width:60ch;margin:0;opacity:.85}
ul{margin:10px 0 0;padding:0;list-style:none;font-size:clamp(16px,1.6vw,22px);line-height:1.45;max-width:70ch}
li{padding:10px 0 10px 28px;position:relative;border-top:1px solid rgba(0,0,0,.08)}li:before{content:"";position:absolute;left:4px;top:21px;width:10px;height:10px;border-radius:3px;background:${primary}}
.n{position:absolute;right:4vw;bottom:4vh;font-size:13px;opacity:.5}
@media print{.deck{overflow:visible}.s{page-break-after:always;height:100vh}}
</style></head><body><div class="deck" tabindex="0">${slides}</div>
<script>const d=document.querySelector('.deck');document.addEventListener('keydown',e=>{if(['ArrowDown','ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();d.scrollBy({top:innerHeight,behavior:'smooth'})}if(['ArrowUp','ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();d.scrollBy({top:-innerHeight,behavior:'smooth'})}});d.focus();</script>
</body></html>`;
}

export function skillMarkdown(p, a) {
  const L = ['---', `name: ${slug(a.name)}`, `description: ${a.role}`, `kind: ${a.kind}`, `model_tier: ${a.model?.tier || 'balanced'}`, `framework: ${a.framework || 'architect'}`, `version: ${a.version || 1}`, '---', ''];
  L.push(`# ${a.name}`, '', a.goal ? `**Goal:** ${a.goal}` : '', '', '## Instructions', '', a.instructions || '(none yet)', '');
  if (a.triggers?.length) { L.push('## When to run', ''); a.triggers.forEach((t) => L.push(`- ${t.type}: ${t.detail}`)); L.push(''); }
  if (a.tools?.length) { L.push('## Tools', ''); a.tools.forEach((t) => L.push(`- **${t.name}** — ${t.actions.map((x) => `\`${x}\`${(a.approvals || []).includes(x) ? ' (requires human approval)' : ''}`).join(', ')}`)); L.push(''); }
  if (a.knowledge?.length) { L.push('## Knowledge', ''); a.knowledge.forEach((k) => L.push(`- ${k.name} (${k.type}${k.size ? `, ${k.size}` : ''})`)); L.push(''); }
  if (a.delegatesTo?.length) { L.push('## Delegates to', ''); a.delegatesTo.forEach((id) => L.push(`- ${(p.agents.find((x) => x.id === id) || { name: id }).name}`)); L.push(''); }
  const g = a.guardrails || {};
  L.push('## Guardrails', '', `- PII redaction: ${g.pii ? 'on' : 'off'}`, `- Prompt-injection shield: ${g.injection ? 'on' : 'off'}`, `- Toxicity filter: ${g.toxicity ? 'on' : 'off'}`, `- Groundedness check: ${g.groundedness ? 'on' : 'off'}`);
  if (g.topics?.length) L.push(`- Stay on: ${g.topics.join(', ')}`);
  if (g.blocked?.length) L.push(`- Never discuss: ${g.blocked.join(', ')}`);
  L.push('', '## Limits', '', `- Max cost per run: $${a.limits?.costPerRun ?? '—'}`, `- Max steps: ${a.limits?.steps ?? '—'}`, `- Monthly budget: ${a.limits?.monthlyBudget ? `$${a.limits.monthlyBudget}` : 'none'}`, `- Memory: ${a.memory || 'none'}`, '');
  if (a.outputs?.length) { L.push('## Output contract', '', '| Key | Type | Notes |', '| --- | --- | --- |'); a.outputs.forEach((o) => L.push(`| ${o.key} | ${o.type} | ${o.desc || ''} |`)); L.push(''); }
  return L.join('\n');
}
export const skillFiles = (p) => (p.agents || []).map((a) => ({ name: `agents/${slug(a.name)}/SKILL.md`, content: skillMarkdown(p, a), agent: a }));

export function agentsMd(p) {
  const rules = p.settings?.rules || [];
  return [`# AGENTS.md — ${p.name}`, '', 'Guidance for AI coding agents (and humans) working in this repository.', '', '## What this app does', '', p.plan?.summary || p.description || '', '',
    '## Stack', '', '- Next.js (App Router) + TypeScript, Tailwind CSS', '- Agents defined in `agents/*` (portable skill files + `agent.yaml`)', '- Data: Postgres with row-level security (see `db/policies.sql`)', '',
    '## Commands', '', '```sh', 'npm install', 'npm run dev      # local app on http://localhost:3000', 'npm test         # unit + promise checks', 'npm run evals    # agent evaluation suite', '```', '',
    '## Project map', '', ...(p.screens || []).map((s) => `- \`app${s.route}/page.tsx\` — ${s.title}`), ...(p.agents || []).map((a) => `- \`agents/${slug(a.name)}/\` — ${a.name}: ${a.role}`), '',
    '## Promises are the tests', '', 'Every promise in the spec has acceptance checks. Do not mark work done until they pass:', '', ...active(p).map((x) => `- ${x.id}: ${x.title}`), '',
    '## Rules', '', ...(rules.length ? rules.map((r) => `- ${r.text}${r.scope ? ` (${r.scope})` : ''}`) : ['- Ask before changing the database schema.']), '- Never commit secrets. Use environment variables listed in `.env.example`.', '- Actions that send, pay or delete must go through an approval gate.', ''].join('\n');
}

export function readmeMd(p) {
  return [`# ${p.name}`, '', p.description || p.plan?.summary || '', '', '## Features', '', ...active(p).map((x) => `- ${x.title}`), '', '## Getting started', '', '```sh', 'npm install', 'cp .env.example .env.local   # add your keys', 'npm run dev', '```', '',
    '## Environment', '', ...(p.env || []).map((e) => `- \`${e.key}\`${e.secret ? ' (secret)' : ''}${e.source && e.source !== 'user' ? ` — from ${integrationById(e.source).name}` : ''}`), '',
    '## Agents', '', ...(p.agents || []).map((a) => `- **${a.name}** — ${a.role}`), '', '## Screens', '', ...(p.screens || []).map((s) => `- \`${s.route}\` — ${s.title}`), '', '---', '', 'Built with Architect.', ''].join('\n');
}

export function printHtml(p) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(p.name)} — spec</title><style>
body{font-family:Geist,system-ui,-apple-system,Segoe UI,sans-serif;color:#15171c;max-width:760px;margin:40px auto;padding:0 24px;line-height:1.55;font-size:14px}
h1{font-size:30px;letter-spacing:-.02em;margin:0 0 8px}h2{font-size:19px;margin:32px 0 8px;padding-top:12px;border-top:1px solid #e6e4dd}h3{font-size:15px;margin:18px 0 4px}
blockquote{margin:12px 0;padding:10px 14px;background:#f6f6f3;border-left:3px solid #2F5BEA;border-radius:6px}
table{border-collapse:collapse;width:100%;margin:8px 0;font-size:13px}td,th{border:1px solid #e6e4dd;padding:6px 8px;text-align:left}th{background:#f6f6f3}
code{font-family:"Geist Mono",ui-monospace,monospace;font-size:12px;background:#f1f0ec;padding:1px 4px;border-radius:4px}ul{padding-left:20px}
@media print{body{margin:0}h2{page-break-after:avoid}h3{page-break-after:avoid}}
</style></head><body>${mdToHtml(specMarkdown(p))}</body></html>`;
}

/** Open a print-styled window and print it (Save as PDF). Returns false if popups are blocked. */
export function openPrint(p) {
  const w = window.open('', '_blank', 'width=900,height=1000');
  if (!w) return false;
  w.document.open(); w.document.write(printHtml(p)); w.document.close();
  w.focus();
  setTimeout(() => { try { w.print(); } catch {} }, 400);
  return true;
}

// ---------------------------------------------------------------------------
// "Ask for a document" — templated docs grounded in the project
// ---------------------------------------------------------------------------
const KINDS = [
  { id: 'faq', re: /faq|question|objection/i, title: (p, who) => `${p.name} — FAQ${who ? ` for ${who}` : ''}` },
  { id: 'onboarding', re: /onboard|training|guide|how to|manual|handbook/i, title: (p, who) => `${p.name} — getting started${who ? ` for ${who}` : ''}` },
  { id: 'release', re: /release|changelog|what'?s new|update/i, title: (p) => `${p.name} — release notes` },
  { id: 'announce', re: /announce|email|launch|memo/i, title: (p) => `Announcing ${p.name}` },
  { id: 'security', re: /security|privacy|data|compliance|gdpr|soc/i, title: (p) => `${p.name} — security & data overview` },
  { id: 'test', re: /test|qa|acceptance|uat/i, title: (p) => `${p.name} — test plan` },
  { id: 'brief', re: /.*/, title: (p, who) => `${p.name} — one-page brief${who ? ` for ${who}` : ''}` },
];

export function requestedDoc(p, request) {
  const kind = KINDS.find((k) => k.re.test(request));
  const who = (request.match(/\bfor\s+(?:the\s+|our\s+)?([\w\s-]{3,40})$/i) || [])[1]?.trim();
  const title = kind.title(p, who);
  const agents = p.agents || [];
  const approvals = agents.flatMap((a) => (a.approvals || []).map((x) => ({ a, x })));
  const L = [`# ${title}`, '', `*Generated from the ${p.name} plan on ${fmtDate(Date.now())} — request: “${request}”*`, ''];
  if (kind.id === 'faq') {
    L.push('## What is it?', '', p.plan?.summary || p.description || '', '');
    L.push('## What does it do for me?', '', ...active(p).map((x) => `- ${x.title}`), '');
    agents.forEach((a) => L.push(`## What does ${a.name} do?`, '', a.role + '.', a.approvals?.length ? `It always asks a person before it can ${a.approvals.map((x) => x.replace(/_/g, ' ')).join(', ')}.` : '', ''));
    if (approvals.length) L.push('## Will it ever act without me?', '', `No — ${approvals.map(({ a, x }) => `${a.name} needs approval to ${x.replace(/_/g, ' ')}`).join('; ')}.`, '');
    L.push('## Where does the data come from?', '', ...(p.data?.tables || []).map((t) => `- **${t.name}** — ${t.connection ? `from ${integrationById(t.connection).name}` : 'stored in the app'} (${t.source === 'sample' ? 'sample data until connected' : t.source + ' data'})`), '');
    L.push('## Who can see what?', '', ...(p.data?.tables || []).filter((t) => t.rules).map((t) => `- ${t.name}: ${t.rules}`), '');
    L.push('## What is not included yet?', '', ...(deferred(p).length ? deferred(p).map((x) => `- ${x.title} — ${x.deferredReason || 'planned for later'}`) : ['- Nothing — everything in the plan is included.']), '');
  } else if (kind.id === 'onboarding') {
    L.push('## Before you start', '', `- Sign in to ${p.name} with your work account.`, ...(p.integrations || []).filter((i) => i.status !== 'connected').map((i) => `- Ask your admin to connect ${integrationById(i.id).name}.`), '');
    L.push('## Your first 10 minutes', '');
    (p.screens || []).forEach((s, i) => L.push(`${i + 1}. Open **${s.title}** (\`${s.route}\`) — ${s.blocks.filter((b) => b.title).map((b) => b.title).slice(0, 3).join(', ') || 'overview'}.`));
    L.push('', '## Working with the agents', '', ...agents.map((a) => `- **${a.name}**: ${a.role}.${a.triggers?.length ? ` Runs on ${a.triggers.map((t) => t.detail.toLowerCase()).join(' and ')}.` : ''}`), '');
    L.push('## Tips', '', '- Ask the agents in plain words; they cite what they used.', '- Anything that sends or changes data waits for your approval.', '');
  } else if (kind.id === 'release') {
    L.push('## What changed', '', ...(p.activity || []).slice(0, 8).map((a) => `- ${a.plain}`), '', '## Promise status', '', ...active(p).map((x) => `- [${tick(x)}] ${x.id} ${x.title}`), '');
  } else if (kind.id === 'announce') {
    L.push('Hi team,', '', `We're rolling out **${p.name}**. ${p.plan?.summary || p.description || ''}`, '', 'What you can do with it:', '', ...active(p).slice(0, 5).map((x) => `- ${x.title}`), '', 'Nothing is sent or changed on your behalf without your approval. Questions? Reply to this email.', '', 'Thanks!', '');
  } else if (kind.id === 'security') {
    L.push('## Data we store', '', ...(p.data?.tables || []).map((t) => `- **${t.name}** (${t.columns.length} fields) — access: ${t.rules || 'signed-in users'}`), '', '## Connections & scopes', '', ...(p.integrations || []).map((i) => `- ${integrationById(i.id).name}: ${(i.scopes || []).join(', ') || 'no scopes'}`), '');
    L.push('## AI safeguards', '', ...agents.map((a) => `- ${a.name}: PII ${a.guardrails?.pii ? 'redacted' : 'not redacted'}, injection shield ${a.guardrails?.injection ? 'on' : 'off'}, groundedness ${a.guardrails?.groundedness ? 'checked' : 'not checked'}${a.approvals?.length ? `, human approval for ${a.approvals.join(', ')}` : ''}`), '', '## Secrets', '', '- API keys are stored in an encrypted vault; agents use them but never see them.', ...(p.env || []).filter((e) => e.secret).map((e) => `- \`${e.key}\``), '');
  } else if (kind.id === 'test') {
    L.push('## Acceptance checks', '');
    active(p).forEach((x) => { L.push(`### ${x.id}. ${x.title}`, ''); (x.checks || ['(add checks)']).forEach((c) => L.push(`- [${tick(x)}] ${c}`)); L.push(''); });
    L.push('## Agent evals', '', ...agents.map((a) => `- ${a.name}: current score ${a.evalScore != null ? Math.round(a.evalScore * 100) + '%' : 'not run yet'}`), '');
  } else {
    L.push('## Summary', '', p.plan?.summary || p.description || '', '', '## Who it is for', '', p.plan?.audience || '—', '', '## Key promises', '', ...active(p).map((x) => `- ${x.title}`), '', '## How it works', '', ...agents.map((a) => `- ${a.name} — ${a.role}`), '');
    if (p.plan?.quote) L.push('## Cost', '', `About ${fmtRange(p.plan.quote.credits)} credits to build.`, '');
  }
  return { title, kind: kind.id, content: L.filter((x) => x !== undefined).join('\n') };
}

