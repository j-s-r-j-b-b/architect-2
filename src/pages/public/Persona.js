// "/for/:persona" — a focused landing page per audience. Unknown personas go home.
import { html, useEffect } from '../../lib/html.js';
import { navigate } from '../../lib/router.js';
import { PromptBox } from '../../shells/PromptBox.js';
import { Icon, Button } from '../../ui/index.js';
import { PERSONAS, TEMPLATES, FRAMEWORKS } from '../../engine/catalog.js';
import { Section, SectionHead, serifTail, PERSONA_ICONS } from './parts/common.js';
import { TemplateCard, PromptCard } from './parts/cards.js';
import { HowSteps, TrustStrip } from './parts/illustrations.js';
import { StartFrom, CtaBand } from './Landing.js';

const PERSONA_CATS = {
  agencies: ['Support', 'Sales', 'Legal', 'Commerce'],
  founders: ['Commerce', 'Marketing', 'Education', 'Product & Engineering'],
  sales: ['Sales', 'Marketing'],
  support: ['Support', 'Operations', 'Product & Engineering'],
  hr: ['HR & Recruiting', 'Operations'],
  developers: ['Product & Engineering', 'Support', 'Operations'],
};

/** 3–6 templates that fit the persona, most-used first, topped up with popular ones. */
export function templatesFor(persona) {
  const cats = PERSONA_CATS[persona] || [];
  const hits = TEMPLATES.filter((t) => cats.includes(t.category)).sort((a, b) => b.uses - a.uses);
  const extra = TEMPLATES.filter((t) => t.popular && !hits.includes(t)).sort((a, b) => b.uses - a.uses);
  return [...hits, ...extra].slice(0, Math.min(6, Math.max(3, hits.length)));
}

const EXTRA = {
  agencies: { icon: 'briefcase', title: 'Built for client work', points: ['Plan with the client in the room — they see promises and price, not code', 'White-label the app and hand over the repo in their GitHub', 'Roles & approvals so clients review before anything goes live'] },
  founders: { icon: 'rocket', title: 'From idea to real users', points: ['Launch on your own domain with sign-in and a real database', 'Budget caps keep experiments cheap', 'Keep every line of code — no lock-in when you raise or hire'] },
  sales: { icon: 'target', title: 'Inside the tools you already use', points: ['HubSpot, Salesforce, Gmail, Slack and Apollo connect in one click', 'Nothing is sent without a human approving it', 'See every score and draft with its reasoning'] },
  support: { icon: 'headphones', title: 'Grounded, not guessing', points: ['Answers cite your help-center articles', 'Angry or risky tickets escalate to a person', 'Freshdesk, Zendesk and Intercom supported'] },
  hr: { icon: 'users', title: 'Fair and explainable', points: ['Every ranking shows its reasons', 'Personal data is redacted by guardrails', 'Interviews scheduled on your calendar, with approval'] },
  developers: { icon: 'code', title: 'Your stack, your review', points: ['Import any GitHub repo — or push to a new one', 'Every change is a diff you can review as a pull request', 'CLI, REST API and an MCP server for your editor'] },
};

// What a developer's first ten minutes look like — concrete, not a claim.
const P = html`<span class="pb-term__p">$ </span>`;
const DEV_TERMINAL = html`<div class="pb-term" aria-label="Example developer session">
  <div class="pb-term__bar"><span class="pb-term__dot"></span><span class="pb-term__dot"></span><span class="pb-term__dot"></span><span>~/acme-helpdesk</span></div>
  <div class="pb-term__body">
    <div>${P}architect import github.com/acme/helpdesk</div>
    <div><span class="pb-term__ok">✓ Understanding Report</span><span class="pb-term__c">${'  '}Next.js · 142 files · 2 secrets to fill</span></div>
    <div>${P}architect agent add triage --framework langgraph</div>
    <div><span class="pb-term__ok">✓ agents/triage/graph.py</span><span class="pb-term__c">${'  '}evals 12/12 passed · ≈ 7 cr</span></div>
    <div>${P}architect push --pr</div>
    <div><span class="pb-term__to">→ PR #42 opened</span><span class="pb-term__c">${'  '}feat/triage-agent · checkpoint saved</span></div>
    <div class="pb-term__c mt-8"># or drive it from your editor: <span style="color:var(--text)">architect mcp serve</span></div>
  </div>
</div>`;

export default function Persona({ params }) {
  const id = params.persona;
  const p = PERSONAS[id];
  useEffect(() => { if (!p) navigate('/', { replace: true }); }, [id]);
  if (!p) return null;
  const templates = templatesFor(id);
  const extra = EXTRA[id];
  return html`<div class="pb-page">
    <section class="pb-hero pb-hero--persona">
      <div class="pb-hero__bg" aria-hidden="true"></div>
      <div class="pb-wrap pb-hero__inner">
        <span class="pb-pill pb-pill--static"><span class="pb-pill__tag"><${Icon} name=${PERSONA_ICONS[id] || 'sparkles'} size=${12} /></span><span>Architect for ${p.label}</span></span>
        <h1 class="pb-hero__title pb-hero__title--sm">${serifTail(p.headline)}</h1>
        <p class="pb-hero__sub">${p.pitch}</p>
        <div class="pb-hero__prompt"><${PromptBox} autoFocus examples=${p.suggestions.map((s) => s + '…')} /></div>
        <${StartFrom} />
        <div class="pb-try">
          <div class="pb-try__label">Popular with ${p.label.toLowerCase()}</div>
          <div class="pb-try__grid pb-try__grid--3">${p.suggestions.map((s) => html`<${PromptCard} label=${p.label} icon=${PERSONA_ICONS[id]} prompt=${s} />`)}</div>
        </div>
      </div>
    </section>

    <div class="pb-wrap"><${TrustStrip} /></div>

    ${extra ? html`<${Section}>
      <div class="pb-persona-extra">
        <div>
          <div class="pb-eyebrow"><${Icon} name=${extra.icon} size=${13} />For ${p.label}</div>
          <h2 class="pb-h2 mt-12">${extra.title}</h2>
          ${id === 'developers' ? DEV_TERMINAL : null}
        </div>
        <ul class="pb-checks">${extra.points.map((x) => html`<li><span class="pb-checks__icon"><${Icon} name="check" size=${13} stroke=${2.6} /></span>${x}</li>`)}</ul>
      </div>
      ${id === 'developers' ? html`<div class="pb-fwgrid">${FRAMEWORKS.map((f) => html`<div class="pb-fwcard">
        <div class="row gap-8"><span class="pb-fwcard__name">${f.name}</span>${f.badge ? html`<span class="pb-fwcard__badge">${f.badge}</span>` : null}</div>
        <div class="pb-fwcard__lang">${f.lang}</div>
        <p class="pb-fwcard__desc">${f.desc}</p>
        <div class="pb-fwcard__files">${f.files.map((x) => html`<span>${x}</span>`)}</div>
      </div>`)}</div>` : null}
    <//>` : null}

    <${Section} tint>
      <${SectionHead} align="left" eyebrow="Templates" title=${html`Start from a plan <em>that already works.</em>`}
        lede=${`Hand-picked for ${p.label.toLowerCase()}. Open one to read the promises, agents and quote before you commit.`}
        action=${html`<${Button} variant="ghost" href="/templates" iconRight="arrow-right">All templates<//>`} />
      <div class="pb-tgrid">${templates.map((t) => html`<${TemplateCard} t=${t} />`)}</div>
    <//>

    <${Section} id="how">
      <${SectionHead} eyebrow="How it works" title=${html`Plan, price, build — <em>then tune.</em>`}
        lede="You approve the plan and the price first. Then you watch it build, adjust the agents in plain language and launch when the readiness check is green." />
      <${HowSteps} />
    <//>

    <${CtaBand} title=${html`Ready when <em>you are.</em>`} />
  </div>`;
}
