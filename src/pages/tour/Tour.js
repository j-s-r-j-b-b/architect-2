// /tour — reviewer guide & design rationale: thesis, root causes → concepts, graded checklist, parity, dev depth, honesty.
import { html, useEffect } from '../../lib/html.js';
import { Icon, Button, Badge } from '../../ui/index.js';
import { cx } from '../../lib/util.js';
import { TOUR_ITEMS, tourState, setTour, runItem } from './items.js';

const REPO = 'https://github.com/j-s-r-j-b-b/architect-2';

const CAUSES = [
  { cause: 'Uncertainty', pain: 'Surprise credit bills, optimistic ETAs, scope silently dropped.', fix: 'Promises + an itemised quote with a budget cap before anything is spent; a live meter and a receipt; fixes for our own mistakes are free.', item: 'chat' },
  { cause: 'Invisibility', pain: '20-minute black-box builds, “done” claims without proof, sample data passed off as real.', fix: 'Watch the wireframe become UI step by step; every promise verified with proof; “Sample data” badges everywhere.', item: 'build' },
  { cause: 'Irreversibility', pain: 'Fear of breaking things; rollbacks that destroy history; agents doing risky things.', fix: 'A checkpoint per change, restore never deletes, drafts before production, agents that must ask before risky actions.', item: 'preview' },
  { cause: 'Lock-in', pain: 'One stack, one framework, no way to bring code in or take agents out.', fix: 'Import any repo through a trust gate; real Git, diffs and PRs; agents exported to 8 frameworks from one open spec.', item: 'github' },
  { cause: 'Jargon mismatch', pain: 'Novices see internals, developers get no depth — one UI serves neither.', fix: 'No Simple/Pro toggle: plain language first, and X-ray any element for its data, agent and code.', item: 'agents' },
];

const PARITY = ['Plan-first questions → PRD with agent table', 'Mockup & workflow diagram', 'AI Consultant (“What should I build?”)', 'Prompt library by department', 'Themes & bring-your-own brand', 'Composer + menu, @mcp:, Plan/Build & Test toggles', 'Artifacts: spec, deck, skill files, PDF', 'Edit Agent: role, goal, instructions, model, creativity', 'Knowledge base: upload & crawl', 'Responsible AI guardrails', 'Built-in integrations: Connect → scopes → Allow', 'MCP servers & env vars', 'GitHub connect, pull/push, branches', 'Import an existing repo', 'Deploy: Marketplace, custom domain, analytics', 'Re-deploy & rename URL', 'Usage by app and by phase', 'Share projects · Marketplace · Help · Admin'];

const DEV = [['github', 'Import any repo', 'Trust gate + Understanding Report (stack, routes, agents, missing secrets, AGENTS.md)'], ['git-pull-request', 'Diffs & pull requests', 'Real line diff of generated code, keep/undo, PR with CI status'], ['code', 'Code tab & terminal', 'File tree, editable files, npm test runs the promises as tests'], ['bot', 'Any-framework agents', 'LangGraph, CrewAI, OpenAI Agents SDK, Claude Agent SDK, Google ADK, Mastra, GitAgent'], ['server', 'API · MCP · A2A', 'Every agent as a REST endpoint, MCP server and A2A card, with snippets'], ['key', 'Env vars & BYO keys', 'Secrets per environment, bring your own model keys, CLI tokens']];

const HONEST = [['Sign-in & database', 'Firebase (Google, email) when configured; otherwise local demo mode in your browser', 'real'], ['Publishing', 'Deploys write a real public app served at /a/<slug>', 'real'], ['Checkpoints, edits, generated code, diffs, CSV, SQL console, downloads', 'Real, in the browser', 'real'], ['GitHub', 'Real API calls when a GitHub token is connected; otherwise labelled “Simulated”', 'partial'], ['The builder “AI” & agent runs', 'A deterministic generator grounded in each project’s own data (no paid model key needed)', 'sim'], ['Third-party OAuth, CI, DNS checks', 'Simulated and labelled in the UI', 'sim']];

const SCRIPT = ['Homepage → type any idea → answer 2–3 questions (or Skip)', 'Read the Promises and the itemised quote → Build it → sign in (instant)', 'Watch the App tab: blueprint → real UI; note the free fix and the receipt', 'Chat: “make it navy” → change card → History → restore', 'Agents tab → open an agent → Try it → Code view → switch frameworks', 'Publish → fix a readiness item → open the live URL'];

export default function Tour() {
  useEffect(() => { document.title = 'Reviewer guide · Architect 2.0'; }, []);
  const st = tourState.value;
  const byId = Object.fromEntries(TOUR_ITEMS.map((i) => [i.id, i]));
  const seen = TOUR_ITEMS.filter((i) => st.visited[i.id]).length;
  return html`<div class="tr-page">
    <header class="tr-hero">
      <${Badge} tone="blueprint" icon="list-checks">Reviewer guide · ${seen}/${TOUR_ITEMS.length} seen<//>
      <h1 class="tr-hero__title">Architect 2.0 — <i>reviewer guide</i></h1>
      <p class="tr-hero__lede">Architect 2.0 is one project where people who don’t code and developers build agentic apps together. It wins on trust, not panel count: you approve promises and a price before anything is spent, watch the app take shape, undo anything, and open any layer — data, agent or code — with one click. Every graded item below opens in the right state.</p>
      <div class="row gap-8 wrap center">
        <${Button} variant="primary" icon="play" onClick=${() => runItem(byId.build)}>Watch an app get built<//>
        <${Button} variant="secondary" icon="github" href=${REPO} target="_blank" rel="noopener">Repository<//>
        <${Button} variant="ghost" icon="book-open" href=${`${REPO}/tree/main/docs/research`} target="_blank" rel="noopener">Research (Part 1)<//>
        ${st.hidden ? html`<${Button} variant="ghost" icon="eye" onClick=${() => setTour({ hidden: false })}>Show floating guide<//>` : null}
      </div>
    </header>

    <section class="tr-sec">
      <h2 class="tr-h2">Every graded item, one click away</h2>
      <div class="tr-grid">
        ${TOUR_ITEMS.map((it, i) => html`<article class=${cx('tr-card', st.visited[it.id] && 'is-done')}>
          <div class="row gap-8"><span class="tr-card__icon"><${Icon} name=${it.icon} size=${16} /></span><span class="tr-card__n">${String(i + 1).padStart(2, '0')}</span>${st.visited[it.id] ? html`<${Badge} size="sm" tone="green" icon="check">Seen<//>` : null}</div>
          <h3 class="tr-card__t">${it.title}</h3>
          <p class="tr-card__b">${it.body}</p>
          <div class="row gap-8 mt-12 wrap">
            <${Button} size="sm" variant="primary" iconRight="arrow-right" onClick=${() => runItem(it)}>Show me<//>
            ${it.alt ? html`<${Button} size="sm" variant="ghost" href=${it.alt.href}>${it.alt.label}<//>` : null}
          </div>
        </article>`)}
      </div>
    </section>

    <section class="tr-sec">
      <h2 class="tr-h2">What’s different — from first principles</h2>
      <p class="tr-sub">Research across 40+ builders and agent platforms showed five root causes behind most user complaints. Each concept exists to remove one of them.</p>
      <div class="tr-causes">
        ${CAUSES.map((c) => html`<div class="tr-cause">
          <div class="tr-cause__name">${c.cause}</div>
          <div class="tr-cause__pain"><${Icon} name="alert-circle" size=${13} />${c.pain}</div>
          <div class="tr-cause__fix"><${Icon} name="check-circle" size=${13} />${c.fix}</div>
          <button class="tr-link" onClick=${() => runItem(byId[c.item])}>See it<${Icon} name="arrow-right" size=${12} /></button>
        </div>`)}
      </div>
    </section>

    <div class="tr-two">
      <section class="tr-sec tr-box">
        <h2 class="tr-h3"><${Icon} name="badge-check" size=${16} />Kept from today’s Architect</h2>
        <ul class="tr-checks">${PARITY.map((x) => html`<li><${Icon} name="check" size=${13} stroke=${2.6} />${x}</li>`)}</ul>
      </section>
      <section class="tr-sec tr-box">
        <h2 class="tr-h3"><${Icon} name="code" size=${16} />Built for developers too</h2>
        <div class="tr-dev">${DEV.map(([ic, t, b]) => html`<div class="tr-dev__i"><span class="tr-card__icon"><${Icon} name=${ic} size=${15} /></span><div><div class="t-strong t-md">${t}</div><div class="t-sm t-muted">${b}</div></div></div>`)}</div>
      </section>
    </div>

    <div class="tr-two">
      <section class="tr-sec tr-box">
        <h2 class="tr-h3"><${Icon} name="shield-check" size=${16} />What’s real vs simulated</h2>
        <table class="tr-table"><tbody>${HONEST.map(([a, b, k]) => html`<tr><td class="t-strong">${a}</td><td class="t-muted">${b}</td><td><${Badge} size="sm" tone=${k === 'real' ? 'green' : k === 'partial' ? 'blueprint' : 'amber'}>${k === 'real' ? 'Real' : k === 'partial' ? 'Real w/ token' : 'Simulated'}<//></td></tr>`)}</tbody></table>
      </section>
      <section class="tr-sec tr-box">
        <h2 class="tr-h3"><${Icon} name="timer" size=${16} />A 5-minute demo</h2>
        <ol class="tr-script">${SCRIPT.map((s) => html`<li>${s}</li>`)}</ol>
      </section>
    </div>
  </div>`;
}
