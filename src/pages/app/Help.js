// Help center: search guides, contact support, system status.
import { html, useState } from '../../lib/html.js';
import { session } from '../../lib/store.js';
import { PageHeader, Input, Textarea, Select, Button, Icon, Empty, toast, Badge } from '../../ui/index.js';
import { cx } from '../../lib/util.js';

const GUIDES = [
  { cat: 'Start', icon: 'sparkles', title: 'Describe your first app', body: 'Write what you need in plain words. Architect asks a few questions, then shows a plan with numbered promises and a price before anything is built.', href: '/start' },
  { cat: 'Start', icon: 'compass', title: 'Not sure what to build?', body: 'The consultant asks about your role, time-sinks and tools, then suggests three apps with the hours they save.', href: '/start/consultant' },
  { cat: 'Start', icon: 'github', title: 'Import an existing project', body: 'Bring a GitHub repo, a ZIP or agent code. We explain what we found and work on a branch — your original is never changed.', href: '/start/import' },
  { cat: 'Build', icon: 'list-checks', title: 'Plans, promises and quotes', body: 'Every plan is a list of checkable promises. You approve a price range and a cap; the build pauses and asks at 80%.' },
  { cat: 'Build', icon: 'history', title: 'Checkpoints and undo', body: 'Every change creates a checkpoint. Restoring never deletes anything — a safety checkpoint is made first.' },
  { cat: 'Build', icon: 'pointer', title: 'Point at the preview to edit', body: 'Use Select mode in the App tab to click any part of your app and describe the change you want.' },
  { cat: 'Data', icon: 'database', title: 'Sample, test and live data', body: 'New apps start on sample data with a badge. Connect a tool or import a CSV in the Data tab to switch to real data.' },
  { cat: 'Agents', icon: 'bot', title: 'Agents, tools and approvals', body: 'Agents can only use the tools you connect, and risky actions like sending email always ask a human first.' },
  { cat: 'Launch', icon: 'rocket', title: 'Publish and custom domains', body: 'Launch readiness checks your app and fixes problems in place. Publish to Staging or Production, rename the /a/ address, roll back any deploy, then connect your own domain from the Launch tab.' },
  { cat: 'Billing', icon: 'coins', title: 'How credits work', body: 'Planning and quotes are free. Building and running agents use credits. Fixes for problems Architect caused are free.', href: '/usage' },
  { cat: 'Developers', icon: 'git-pull-request', title: 'GitHub, branches and pull requests', body: 'Connect GitHub from the top bar of any project to create a repo and push. Switch or create branches, pull and push, then review a line-by-line diff and open a pull request with checks from the Code tab.', href: '/connections/github' },
  { cat: 'Developers', icon: 'code', title: 'Edit the code yourself', body: 'The Code tab has the full source tree, an editor that keeps your edits when Architect regenerates, a sandbox terminal (npm test, git status) and deep links like ?file=app/page.tsx.' },
  { cat: 'Developers', icon: 'bot', title: 'Agents in any framework', body: 'Every agent is one spec. Export it as LangGraph, CrewAI, OpenAI Agents SDK, Claude Agent SDK, Google ADK or Mastra code, or import your own agent code and we wrap it in an app.', href: '/agents' },
  { cat: 'Developers', icon: 'server', title: 'MCP servers, model keys and CLI tokens', body: 'Add any MCP server to give agents new tools, bring your own model keys to bill your provider directly, and create API & CLI tokens in Settings.', href: '/connections/mcp' },
];
const STATUS = [['Builder & preview', 'ok'], ['Agent runtime', 'ok'], ['Deployments', 'ok'], ['GitHub sync', 'degraded']];

export default function Help() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [form, setForm] = useState({ topic: 'question', message: '' });
  const [sent, setSent] = useState(false);
  const list = GUIDES.filter((g) => (cat === 'All' || g.cat === cat) && (!q || `${g.title} ${g.body}`.toLowerCase().includes(q.toLowerCase())));
  return html`<div class="app-page">
    <${PageHeader} title="Help center" subtitle="Guides, answers and a real human when you need one." />
    <div class="ap-help-search"><${Input} icon="search" placeholder="Search guides — e.g. “sample data”, “checkpoint”, “credits”" value=${q} onValue=${setQ} /></div>
    <div class="row gap-6 wrap mt-12 mb-16">${['All', ...new Set(GUIDES.map((g) => g.cat))].map((c) => html`<button class=${cx('chip chip--sm', cat === c && 'is-active')} onClick=${() => setCat(c)}>${c}</button>`)}</div>
    <div class="ap-help">
      <div>
        ${list.length ? html`<div class="ap-grid-2">${list.map((g) => html`<${g.href ? 'a' : 'div'} href=${g.href} class=${cx('ap-guide', g.href && 'is-link')}>
          <div class="row gap-8"><span class="ap-tcard__icon"><${Icon} name=${g.icon} size=${15} /></span><span class="t-strong grow">${g.title}</span><${Badge} size="sm">${g.cat}<//></div>
          <p class="t-sm t-muted">${g.body}</p>
        <//>`)}</div>` : html`<${Empty} icon="search" title="No guides match" body="Ask us directly — we usually reply within a few hours." />`}
      </div>
      <aside class="col gap-16">
        <a class="ap-panel ap-tourcard" href="/tour">
          <span class="ap-tcard__icon"><${Icon} name="list-checks" size=${15} /></span>
          <span class="col gap-2 grow"><span class="t-strong">Reviewer guide</span><span class="t-xs t-muted">A guided checklist of every feature, with one-click demos.</span></span>
          <${Icon} name="chevron-right" size=${15} class="t-faint" />
        </a>
        <section class="ap-panel">
          <h2 class="t-md t-strong mb-12">Contact support</h2>
          ${sent ? html`<div class="col gap-8 t-center p-12"><${Icon} name="check-circle" size=${28} class="t-green" style="margin:0 auto" /><span class="t-strong">Message sent</span><span class="t-sm t-muted">We’ll reply to ${session.value?.email || 'your email'} soon.</span><${Button} size="sm" variant="ghost" onClick=${() => setSent(false)}>Send another<//></div>`
            : html`<div class="col gap-12">
              <${Select} label="Topic" value=${form.topic} onValue=${(v) => setForm({ ...form, topic: v })} options=${[{ value: 'question', label: 'A question' }, { value: 'bug', label: 'Something’s broken' }, { value: 'billing', label: 'Billing' }, { value: 'feature', label: 'Feature idea' }]} />
              <${Textarea} label="Message" rows=${4} placeholder="What’s going on? Include the project name if relevant." value=${form.message} onValue=${(v) => setForm({ ...form, message: v })} />
              <${Button} variant="primary" icon="send" disabled=${form.message.trim().length < 5} onClick=${() => { setSent(true); setForm({ ...form, message: '' }); toast('Message sent — prototype, nothing was emailed', { tone: 'success' }); }}>Send<//>
            </div>`}
        </section>
        <section class="ap-panel">
          <h2 class="t-md t-strong mb-12">System status</h2>
          ${STATUS.map(([n, s]) => html`<div class="row gap-8 t-sm mb-8"><span class=${cx('dot', s === 'ok' ? 'dot--green' : 'dot--amber')}></span><span class="grow">${n}</span><span class=${cx('t-xs', s === 'ok' ? 't-green' : 't-amber')}>${s === 'ok' ? 'Operational' : 'Slower than usual'}</span></div>`)}
          <div class="t-xs t-faint mt-4">Prototype: status is simulated.</div>
        </section>
      </aside>
    </div>
  </div>`;
}
