// Project-aware Help slide-over (rail "Help" button): tips for the current screen, answers, contact a human.
import { html, useState } from '../lib/html.js';
import { route, navigate } from '../lib/router.js';
import { Drawer, Icon, Input, Textarea, Button, toast, Callout } from '../ui/index.js';
import { helperOpen } from './bus.js';

const TIPS = [
  [/^\/p\/[^/]+\/plan/, 'Plan', ['Promises are the contract: each has acceptance checks and turns green only when verified.', 'Nothing is charged until you approve the quote. Set a budget cap — builds pause at 80%.', 'Deferred promises show why they were left out — click Include to add them back.']],
  [/^\/p\/[^/]+\/app/, 'App preview', ['Press 1–5 to switch Interact · Select · Edit · Annotate · X-ray.', 'X-ray any element to see its data, the agent behind it and its code file.', 'Edit mode changes text for free — no credits, and a checkpoint is saved.']],
  [/^\/p\/[^/]+\/agents/, 'Agents', ['Agent Cards use plain language; “Show raw config” and Code view are there for developers.', '“Must ask before” rules are enforced by the platform in every run mode.', 'Code view exports the same agent to LangGraph, CrewAI, OpenAI Agents SDK and more.']],
  [/^\/p\/[^/]+\/data/, 'Data', ['Amber “Sample data” means the table is not connected yet — Connect real data swaps it.', 'Import or export CSV, or query with the SQL console.']],
  [/^\/p\/[^/]+\/code/, 'Code', ['Review changes shows a real diff of what the last change did — keep or undo per file.', 'Connect GitHub from the top bar to push the code and open pull requests.']],
  [/^\/p\/[^/]+\/launch/, 'Launch', ['Readiness checks fix problems in place — connect data, add secrets, protect routes.', 'Every deploy is a checkpoint: roll back from Deploys in one click.']],
  [/^\/p\//, 'Workspace', ['Ask answers without changing anything; Plan proposes; Build applies.', 'History (right edge) restores any checkpoint — a safety checkpoint is saved first.', 'Ctrl/⌘ + \\ hides the chat for a full-width stage.']],
  [/^\/start/, 'Start', ['Describe it, let the AI Consultant suggest ideas, start from a template, or import a repo.', 'Planning and quotes are always free.']],
  [/^\/connections/, 'Connections', ['Built-in integrations need no API keys. MCP servers and your own model keys live here too.']],
  [/./, 'Getting started', ['Type what you want to build — Architect asks 2–3 questions, then shows promises and a price.', 'Use the Reviewer guide (bottom right) to jump to any feature.']],
];

const FAQ = [
  ['What is a promise?', 'A numbered, checkable commitment in your plan — e.g. “Score every new lead 0–100”. Each has acceptance checks; the build marks it Verified with proof, and Live after you publish.'],
  ['How do credits and quotes work?', 'Before building you see an itemised quote (a range) and can set a cap. A live meter runs during the build and a receipt compares actual vs quote. Fixes for problems we caused are free.'],
  ['Is my data real?', 'New apps start with realistic sample data, always labelled “Sample data”. Connect the integration (or your database) to switch a table to live data.'],
  ['How do I undo a change?', 'Open History on the right edge and restore any checkpoint. Restoring never deletes anything — a safety checkpoint is created first.'],
  ['Can I use my own framework?', 'Yes. Agents are defined once (an open spec) and exported to LangGraph, CrewAI, OpenAI Agents SDK, Claude Agent SDK, Google ADK, Mastra or GitAgent. Imported agent code keeps its framework.'],
  ['How do I connect GitHub?', 'Use the GitHub button in the project top bar: connect, create a repository and push. Review changes as a diff and open pull requests from the Code tab.'],
  ['How do I publish?', 'Press Publish (top right). The readiness check lists what to fix, then deploys and gives you a live URL. Add a custom domain from Launch → Domains.'],
  ['Do I own the code?', 'Yes — the full source (screens, database schema, agents, tests) can be pushed to your own GitHub repository at any time.'],
];

export default function Helper() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const [contact, setContact] = useState(false);
  const [msg, setMsg] = useState('');
  if (!helperOpen.value) return null;
  const close = () => { helperOpen.value = false; setContact(false); };
  const path = route.value.path;
  const [, where, tips] = TIPS.find(([re]) => re.test(path));
  const needle = q.trim().toLowerCase();
  const faq = FAQ.filter(([a, b]) => !needle || (a + ' ' + b).toLowerCase().includes(needle));
  return html`<${Drawer} title="Help" icon="help" onClose=${close}>
    <div class="col gap-16">
      <${Input} icon="search" placeholder="Search help…" value=${q} onValue=${setQ} autofocus />
      ${!needle ? html`<div class="tr-help__tips">
        <div class="panel-title mb-8">On this screen · ${where}</div>
        ${tips.map((t) => html`<div class="tr-help__tip"><${Icon} name="lightbulb" size=${14} /><span>${t}</span></div>`)}
      </div>` : null}
      <div>
        <div class="panel-title mb-8">${needle ? `${faq.length} answer${faq.length === 1 ? '' : 's'}` : 'Common questions'}</div>
        <div class="tr-help__faq">
          ${faq.map(([a, b], i) => html`<div class=${'tr-help__q' + (open === i ? ' is-open' : '')}>
            <button onClick=${() => setOpen(open === i ? null : i)}><span class="grow">${a}</span><${Icon} name=${open === i ? 'chevron-up' : 'chevron-down'} size=${14} /></button>
            ${open === i || needle ? html`<p>${b}</p>` : null}
          </div>`)}
          ${!faq.length ? html`<p class="t-sm t-muted">No answers match — try other words, or contact a human below.</p>` : null}
        </div>
      </div>
      <div class="tr-help__links">
        <button onClick=${() => { close(); navigate('/tour'); }}><${Icon} name="list-checks" size=${15} />Reviewer guide & feature tour</button>
        <button onClick=${() => { close(); navigate('/help'); }}><${Icon} name="book-open" size=${15} />Docs & guides</button>
        <button onClick=${() => setContact(!contact)}><${Icon} name="message-circle" size=${15} />Contact a human</button>
      </div>
      ${contact ? html`<div class="col gap-8">
        <${Textarea} rows=${3} placeholder="What’s going on? Include the project name if it’s about a project." value=${msg} onValue=${setMsg} />
        <${Button} variant="primary" icon="send" onClick=${() => { if (msg.trim().length < 5) { toast('Add a few words first', { tone: 'warn' }); return; } setMsg(''); setContact(false); toast('Sent — a person usually replies within a few hours. (Prototype: nothing was sent.)', { tone: 'success', duration: 5000 }); }}>Send to support<//>
        <${Callout} tone="amber" icon="flask">Prototype: messages are not sent anywhere.<//>
      </div>` : null}
    </div>
  <//>`;
}
