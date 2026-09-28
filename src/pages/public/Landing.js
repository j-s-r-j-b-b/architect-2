// "/" — the logged-out front door. The prompt box is the primary action; everything below
// answers "what happens when I press Enter, what will it cost, and can I trust it?".
import { html } from '../../lib/html.js';
import { session } from '../../lib/store.js';
import { route } from '../../lib/router.js';
import { PromptBox } from '../../shells/PromptBox.js';
import { IntegrationTile } from '../../shells/ConnectSheet.js';
import { Icon, Button } from '../../ui/index.js';
import { TEMPLATES, PERSONAS, FRAMEWORKS, integrationById } from '../../engine/catalog.js';
import { Section, SectionHead, Faq, useHashScroll, focusPrompt, PERSONA_ICONS } from './parts/common.js';
import { TemplateCard, PromptCard } from './parts/cards.js';
import { HowSteps, TrustStrip, XRayIllo, AgentMap } from './parts/illustrations.js';

export const START_FROM = [
  { icon: 'github', label: 'GitHub repo', href: '/start/import?source=github' },
  { icon: 'layout-grid', label: 'Template', href: '/templates' },
  { icon: 'figma', label: 'Figma or URL', href: '/start/import?source=design' },
  { icon: 'code', label: 'Existing agent code', href: '/start/import?source=agent' },
  { icon: 'compass', label: 'Help me decide', href: '/start/consultant' },
];

const TRY = ['sales', 'support', 'founders', 'developers'].map((id) => ({ id, label: PERSONAS[id].label, icon: PERSONA_ICONS[id], prompt: PERSONAS[id].suggestions[0] }));

const NOVICE = [
  { icon: 'message-square', text: 'Describe changes in plain words — or click anything on screen to change it' },
  { icon: 'list-checks', text: 'Approve numbered promises and a price, not a wall of code' },
  { icon: 'sliders', text: 'Tune agents with rules you can read, like “Must ask before sending email”' },
  { icon: 'rocket', text: 'Launch with a readiness check that explains every item' },
];
const DEV = [
  { icon: 'git-pull-request', text: 'Import a repo or push to yours — every change is a reviewable diff and PR' },
  { icon: 'workflow', text: 'Build agents in LangGraph, CrewAI, the OpenAI Agents SDK or the open GitAgent spec' },
  { icon: 'terminal', text: 'Drive it from the CLI, the REST API, or as an MCP server in your editor' },
  { icon: 'flask', text: 'Evals, traces and per-environment secrets for every agent' },
];

const AGENT_POINTS = [
  { icon: 'bot', title: 'A job, tools and a budget', body: 'Each agent does one thing well and has a per-run cost limit you can see.' },
  { icon: 'lock', title: 'Boundaries you can read', body: '“Must ask before: Sending email” — risky actions wait for a human, in every run mode.' },
  { icon: 'layout-dashboard', title: 'Wired to your screens', body: 'Change an agent and see exactly which screens and tables it affects.' },
  { icon: 'flask', title: 'Tested before it’s trusted', body: 'Evals run before an agent goes live; every run is traced afterwards.' },
];

const SWITCH = [
  { pain: 'Surprise credit bills', painBody: '“A fix loop ate my monthly credits overnight — for a bug the AI introduced.”', fix: 'Itemised quote + free fixes for our mistakes', fixBody: 'You approve a price range before any build. A budget cap pauses and asks at 80%. If a change we made breaks your app, the fix costs nothing.', icon: 'receipt' },
  { pain: '20-minute black-box builds', painBody: '“I stare at a spinner and hope. When it’s done I can’t tell what it actually built.”', fix: 'Watch it take shape, stop anytime', fixBody: 'Every step appears as it happens — screens fill in, agents come alive, tests run. Pause or stop and keep everything that’s already done.', icon: 'eye' },
  { pain: 'Stuck in fix loops', painBody: '“It said ‘fixed it’ five times. It was still broken, and I had no idea why.”', fix: 'A plain-language Doctor with a loop breaker', fixBody: 'The Doctor explains what broke, where and why in plain words. After two failed attempts it stops, offers a rollback or a different approach — never an endless loop.', icon: 'stethoscope' },
];

const WALL = ['gmail', 'slack', 'hubspot', 'salesforce', 'notion', 'gsheets', 'gcal', 'gdrive', 'outlook', 'teams', 'stripe', 'shopify', 'github', 'linear', 'jira', 'zendesk', 'airtable', 'postgres'];
const SHOWCASE = ['lead-desk', 'support-copilot', 'recruit-screen', 'content-studio', 'research-brief', 'policy-assistant'].map((id) => TEMPLATES.find((t) => t.id === id)).filter(Boolean);

export const FAQ = [
  { q: 'Do I own the code?', a: 'Yes. Every project is real code — a React + TypeScript app plus agent specs in the open GitAgent format or your chosen framework. Push it to your own GitHub or download it at any time, on every plan, including Free.' },
  { q: 'What does it cost?', a: html`Planning, questions and quotes are always free. Before any build you see an itemised quote in credits and can set a cap. The Free plan includes 300 credits a month; a typical 3-screen app with two agents costs about 36–48 credits, and a small edit 1–3. <a class="link" href="/pricing">See pricing</a>.` },
  { q: 'Can developers use their own framework?', a: html`Yes. Build agents in ${FRAMEWORKS.filter((f) => f.id !== 'architect').map((f) => f.name).slice(0, 6).join(', ')} — or the managed Architect runtime. Import an existing repo, review every diff, ship through pull requests and drive everything from the CLI, API or MCP.` },
  { q: 'What happens if the AI breaks something?', a: 'Every change creates a checkpoint, so you can undo anything in one click. The Doctor explains the problem in plain language, and if a change we made caused it, the fix is free. After two failed attempts the loop breaker stops and offers a rollback instead of burning credits.' },
  { q: 'Are agents safe to connect to real tools?', a: 'Each agent has explicit boundaries: which tools it may use, actions that must ask a human first (like sending email or issuing a refund), a per-run budget and guardrails for personal data and prompt injection. Every run is logged with its steps and cost.' },
  { q: 'Can I try it before signing up?', a: 'Yes. Describe your app and you’ll get the questions, the plan and the quote without an account. You only sign in when you’re ready to build — and your plan comes with you.' },
];

export function CtaBand({ title, body, primaryLabel = 'Describe your app' }) {
  const me = session.value;
  return html`<section class="pb-section pb-section--cta">
    <div class="pb-wrap">
      <div class="pb-cta">
        <div class="pb-cta__grid" aria-hidden="true"></div>
        <div class="pb-cta__inner">
          <h2 class="pb-h2">${title || html`Your next app starts with <em>one sentence.</em>`}</h2>
          <p class="pb-lede">${body || 'Planning and quotes are free. No credit card. You approve the price before anything is built.'}</p>
          <div class="row gap-8 wrap center mt-8">
            <${Button} variant="primary" size="lg" icon="sparkles" onClick=${focusPrompt}>${primaryLabel}<//>
            <${Button} variant="secondary" size="lg" href=${me ? '/start' : '/signup'} iconRight="arrow-right">${me ? 'Open the app' : 'Start building free'}<//>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

export function StartFrom({ label = 'Start from' }) {
  const me = session.value;
  return html`<div class="pb-startfrom" role="group" aria-label=${label}>
    <span class="pb-startfrom__label">${label}</span>
    ${START_FROM.map((s) => html`<a href=${s.href} class="chip pb-startfrom__chip" data-tip=${!me && s.href.startsWith('/start') ? 'Needs a free account — takes a few seconds' : null}><${Icon} name=${s.icon} size=${14} />${s.label}</a>`)}
  </div>`;
}

export default function Landing() {
  useHashScroll('/');
  return html`<div class="pb-page">
    <section class="pb-hero">
      <div class="pb-hero__bg" aria-hidden="true"></div>
      <div class="pb-wrap pb-hero__inner">
        <a href="/#how" class="pb-pill"><span class="pb-pill__tag">New</span><span>Agents, data and UI from one prompt</span><${Icon} name="arrow-right" size=${13} /></a>
        <h1 class="pb-hero__title">Describe it. See the plan<br class="pb-br" /> and the price. <em>Watch it build.</em></h1>
        <p class="pb-hero__sub">Architect turns a sentence into a working agentic app — with a quote before you spend, every step in view, and code you own.</p>
        <div class="pb-hero__prompt"><${PromptBox} autoFocus initial=${route.value.query.prompt || ''} /></div>
        <${StartFrom} />
        <div class="pb-try">
          <div class="pb-try__label">Or start with an example</div>
          <div class="pb-try__grid">${TRY.map((t) => html`<${PromptCard} label=${t.label} icon=${t.icon} prompt=${t.prompt} />`)}</div>
        </div>
      </div>
    </section>

    <div class="pb-wrap"><${TrustStrip} /></div>

    <${Section} id="how">
      <${SectionHead} eyebrow="How it works" title=${html`From a sentence to a live app, <em>in four honest steps.</em>`}
        lede="You always know what happens next, what it will cost and what was built. Nothing is spent without a quote; nothing irreversible happens without a checkpoint." />
      <${HowSteps} />
    <//>

    <${Section} id="depth" tint>
      <${SectionHead} eyebrow="For everyone on the team" title=${html`One project. <em>Every depth.</em>`}
        lede="There’s no Simple/Pro switch. Everyone works on the same project — plain language on top, the real data, agents and code one click underneath." />
      <div class="pb-depth">
        <div class="pb-depth__col">
          <div class="pb-depth__head"><span class="pb-depth__icon"><${Icon} name="message-square" size=${16} /></span><div><div class="pb-depth__title">If you don’t code</div><div class="pb-depth__sub">Decide, don’t debug</div></div></div>
          <ul class="pb-list">${NOVICE.map((x) => html`<li><${Icon} name=${x.icon} size=${16} /><span>${x.text}</span></li>`)}</ul>
        </div>
        <div class="pb-depth__mid">
          <${XRayIllo} />
          <p class="pb-depth__caption">Flip <b>X-ray</b> on any screen to see the data, agent and code behind it.</p>
        </div>
        <div class="pb-depth__col">
          <div class="pb-depth__head"><span class="pb-depth__icon pb-depth__icon--ink"><${Icon} name="code" size=${16} /></span><div><div class="pb-depth__title">If you do</div><div class="pb-depth__sub">Your repo, your framework, your review</div></div></div>
          <ul class="pb-list">${DEV.map((x) => html`<li><${Icon} name=${x.icon} size=${16} /><span>${x.text}</span></li>`)}</ul>
          <div class="pb-fw">${FRAMEWORKS.filter((f) => f.id !== 'architect').slice(0, 6).map((f) => html`<span class="pb-fw__chip">${f.name.replace(' (open spec)', '')}</span>`)}</div>
        </div>
      </div>
    <//>

    <${Section} id="agents">
      <div class="pb-split">
        <div class="pb-split__text">
          <div class="pb-eyebrow">Agents, built in</div>
          <h2 class="pb-h2 mt-12">Agents are part of your app, <em>not a chatbot bolted on.</em></h2>
          <p class="pb-lede mt-16">Architect plans the agents with the screens and data they serve — so every agent has a place, a purpose and limits you set.</p>
          <div class="pb-points">${AGENT_POINTS.map((p) => html`<div class="pb-point"><span class="pb-point__icon"><${Icon} name=${p.icon} size=${15} /></span><div><div class="pb-point__title">${p.title}</div><p class="pb-point__body">${p.body}</p></div></div>`)}</div>
          <div class="mt-24"><${Button} variant="secondary" href="/templates/lead-desk" iconRight="arrow-right">See the agents in an example<//></div>
        </div>
        <div class="pb-split__visual"><${AgentMap} /></div>
      </div>
    <//>

    <${Section} id="why" tint>
      <${SectionHead} eyebrow="Why teams switch" title=${html`Built around <em>the complaints we kept hearing.</em>`}
        lede="We read thousands of posts from people building with AI app builders. These three came up again and again." />
      <div class="pb-switch">
        ${SWITCH.map((s) => html`<article class="pb-sw">
          <div class="pb-sw__pain">
            <div class="pb-sw__tag pb-sw__tag--pain"><${Icon} name="alert-circle" size=${13} />${s.pain}</div>
            <p class="pb-sw__quote">${s.painBody}</p>
          </div>
          <div class="pb-sw__arrow" aria-hidden="true"><${Icon} name="arrow-down" size=${14} /></div>
          <div class="pb-sw__fix">
            <div class="pb-sw__tag pb-sw__tag--fix"><${Icon} name=${s.icon} size=${13} />${s.fix}</div>
            <p class="pb-sw__body">${s.fixBody}</p>
          </div>
        </article>`)}
      </div>
    <//>

    <${Section} id="templates">
      <${SectionHead} align="left" eyebrow="Templates" title=${html`Start from <em>something that works.</em>`}
        lede="Each template is a plan you can read and edit before anything is built."
        action=${html`<${Button} variant="ghost" href="/templates" iconRight="arrow-right">All ${TEMPLATES.length} templates<//>`} />
      <div class="pb-tgrid">${SHOWCASE.map((t) => html`<${TemplateCard} t=${t} compact />`)}</div>
    <//>

    <${Section} id="integrations" tint>
      <${SectionHead} eyebrow="Connections" title=${html`Works with the tools <em>you already use.</em>`}
        lede="Built-in tools connect in one click, with no API keys to paste. Anything else plugs in through MCP or any REST API." />
      <div class="pb-wall">
        ${WALL.map((id) => html`<div class="pb-wall__item"><${IntegrationTile} id=${id} /><span>${nameOf(id)}</span></div>`)}
        <div class="pb-wall__item pb-wall__item--special"><span class="pb-wall__glyph"><${Icon} name="server" size=${15} /></span><span>MCP servers</span></div>
        <div class="pb-wall__item pb-wall__item--special"><span class="pb-wall__glyph"><${Icon} name="webhook" size=${15} /></span><span>Any API</span></div>
      </div>
    <//>

    <${Section} id="faq">
      <div class="pb-faqwrap">
        <div>
          <div class="pb-eyebrow">FAQ</div>
          <h2 class="pb-h2 mt-12">Questions, <em>answered.</em></h2>
          <p class="pb-lede mt-16">Still unsure? <a class="link" href="/start/consultant">Talk it through with the consultant</a> — it helps you pick a starting point, free.</p>
        </div>
        <${Faq} items=${FAQ} />
      </div>
    <//>

    <${CtaBand} />
  </div>`;
}

const nameOf = (id) => integrationById(id).name.replace('Microsoft ', '');
