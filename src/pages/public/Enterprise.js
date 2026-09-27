// "/enterprise" — governance story, admin console preview, forward-deployed engineers, demo request (sends nothing).
import { html, useState } from '../../lib/html.js';
import { PromptBox } from '../../shells/PromptBox.js';
import { Icon, Button, Badge, Input, Select, Textarea, toast, Callout } from '../../ui/index.js';
import { Section, SectionHead, useHashScroll } from './parts/common.js';

const EXAMPLES = [
  'Automate claims intake — a human approves every payout…',
  'An internal policy assistant with citations, SSO and audit logs…',
  'A KYC document checker that runs inside our VPC…',
  'Triage IT tickets and draft fixes our engineers approve…',
];

const FEATURES = [
  { icon: 'users', title: 'RBAC & policies', body: 'Owner, Editor, Reviewer and Viewer roles per workspace and project. Org-wide policies — allowed models, tools and data regions — enforced on every build and run.' },
  { icon: 'shield-check', title: 'Responsible AI guardrails', body: 'PII redaction, prompt-injection shields, groundedness checks and blocked topics, on by default. Risky actions must ask a human first — in every run mode.' },
  { icon: 'activity', title: 'Audit logs & observability', body: 'Every prompt, change, approval, agent run and tool call is logged with who, what and cost. Stream to your SIEM; traces for every agent step.' },
  { icon: 'server', title: 'VPC & on-prem', body: 'Run the builder and your apps in your own cloud account or data centre. Bring your own model endpoints; data never leaves your boundary.' },
  { icon: 'key', title: 'SSO / SAML & SCIM', body: 'Okta, Entra ID and Google Workspace. Provision and deprovision automatically; enforce MFA and session policies.' },
  { icon: 'git-branch', title: 'Environments & approvals', body: 'Draft → staging → production with required reviewers, change windows and one-click rollback to any checkpoint.' },
];

const POLICIES = [
  ['Agents must ask before sending external email', 'All workspaces', 'Enforced'],
  ['Redact personal data in agent inputs', 'All workspaces', 'Enforced'],
  ['Production deploys need a Reviewer', 'Claims, Finance', 'Enforced'],
  ['Allowed models: EU-hosted only', 'All workspaces', 'Enforced'],
  ['Monthly AI budget $5,000 · alert at 80%', 'Organisation', 'Monitoring'],
];
const AUDIT = [
  ['10:42', 'Meera I.', 'approved deploy v14 → production', 'Claims Desk'],
  ['10:31', 'Email Drafter', 'asked before send_email — approved by Arjun', 'Lead Desk'],
  ['10:12', 'Guardrail', 'redacted 2 fields in a Lead Qualifier run', 'Lead Desk'],
  ['09:58', 'SCIM', 'deprovisioned 1 user (left company)', 'Organisation'],
];

function ConsoleMock() {
  const nav = [['users', 'Members'], ['shield-check', 'Policies'], ['activity', 'Audit log'], ['git-branch', 'Environments'], ['cpu', 'Models'], ['key', 'SSO']];
  return html`<div class="pb-console" aria-label="Admin console preview">
    <div class="pb-console__bar"><span class="pb-browser__dots"><span></span><span></span><span></span></span><span class="pb-console__title"><${Icon} name="building" size=${13} />Acme Insurance · Admin console</span><${Badge} size="sm" tone="outline">Preview<//></div>
    <div class="pb-console__body">
      <nav class="pb-console__nav">${nav.map(([i, l]) => html`<span class=${'pb-console__item' + (l === 'Policies' ? ' is-active' : '')}><${Icon} name=${i} size=${14} />${l}</span>`)}</nav>
      <div class="pb-console__main">
        <div class="pb-console__stats">
          ${[['Workspaces', '12'], ['Live apps', '38'], ['Agent runs · 7d', '184k'], ['Blocked by policy', '27']].map(([k, v]) => html`<div class="pb-console__stat"><span>${k}</span><b>${v}</b></div>`)}
        </div>
        <div class="pb-console__table">
          <div class="pb-console__th"><span>Policy</span><span>Applies to</span><span>Status</span></div>
          ${POLICIES.map(([a, b, c]) => html`<div class="pb-console__tr"><span class="t-truncate">${a}</span><span class="t-truncate t-faint">${b}</span><span>${c === 'Enforced' ? html`<${Badge} size="sm" tone="green" icon="check">Enforced<//>` : html`<${Badge} size="sm" tone="blueprint" dot>Monitoring<//>`}</span></div>`)}
        </div>
        <div class="pb-console__audit">
          <div class="pb-console__k">Audit log · live</div>
          ${AUDIT.map(([t, who, what, where]) => html`<div class="pb-console__log"><span class="t-mono t-faint">${t}</span><span class="t-truncate"><b>${who}</b> ${what}</span><span class="pb-console__where">${where}</span></div>`)}
        </div>
      </div>
    </div>
  </div>`;
}

function DemoForm() {
  const [f, setF] = useState({ name: '', email: '', company: '', size: '', goal: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const set = (k) => (v) => { setF({ ...f, [k]: v }); if (errors[k]) setErrors({ ...errors, [k]: null }); };
  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (!f.name.trim()) err.name = 'Tell us who to ask for';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) err.email = 'Use a work email like you@company.com';
    if (!f.company.trim()) err.company = 'Which company is this for?';
    setErrors(err);
    if (Object.keys(err).length) return;
    setSent(true);
    toast('Thanks — we’ll be in touch within one business day. (Prototype: nothing was sent.)', { tone: 'success', duration: 5200 });
  };
  if (sent) return html`<div class="pb-demo__done">
    <span class="pb-demo__done-icon"><${Icon} name="check" size=${22} stroke=${2.6} /></span>
    <h3 class="t-xl t-strong">Request received, ${f.name.split(' ')[0]}</h3>
    <p class="t-md t-muted">A solutions engineer will reach out to ${f.email} to book a 30-minute session. Meanwhile you can try the product yourself — planning is free.</p>
    <${Callout} tone="amber" icon="flask"><b>Prototype:</b> this form is simulated. Nothing was sent or stored.<//>
    <div class="row gap-8 wrap"><${Button} variant="primary" href="/signup" iconRight="arrow-right">Try it now<//><${Button} variant="ghost" onClick=${() => { setSent(false); setF({ name: '', email: '', company: '', size: '', goal: '' }); }}>Send another<//></div>
  </div>`;
  return html`<form class="pb-demo__form" onSubmit=${submit} novalidate>
    <div class="pb-demo__row">
      <${Input} label="Your name" value=${f.name} onValue=${set('name')} error=${errors.name} autocomplete="name" />
      <${Input} label="Work email" type="email" value=${f.email} onValue=${set('email')} error=${errors.email} autocomplete="email" />
    </div>
    <div class="pb-demo__row">
      <${Input} label="Company" value=${f.company} onValue=${set('company')} error=${errors.company} autocomplete="organization" />
      <${Select} label="Team size" value=${f.size} onValue=${set('size')} placeholder="Choose…" options=${['1–50', '51–250', '251–1,000', '1,001–5,000', '5,000+']} />
    </div>
    <${Textarea} label="What do you want to build?" optional rows=${3} value=${f.goal} onValue=${set('goal')} placeholder="e.g. An agent that pre-checks insurance claims, with a human approving payouts" />
    <div class="row gap-12 wrap between">
      <span class="t-xs t-faint">We’ll only use this to arrange the demo.</span>
      <${Button} type="submit" variant="primary" size="lg" iconRight="arrow-right">Request a demo<//>
    </div>
  </form>`;
}

export default function Enterprise() {
  useHashScroll('/enterprise');
  const toDemo = () => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return html`<div class="pb-page">
    <section class="pb-hero">
      <div class="pb-hero__bg" aria-hidden="true"></div>
      <div class="pb-wrap pb-hero__inner">
        <span class="pb-pill pb-pill--static"><span class="pb-pill__tag"><${Icon} name="building" size=${12} /></span><span>Architect for Enterprise</span></span>
        <h1 class="pb-hero__title pb-hero__title--sm">Agentic apps your security team <em>will sign off on.</em></h1>
        <p class="pb-hero__sub">The same describe-plan-build flow your teams love — with roles, policies, guardrails, audit logs and private hosting underneath.</p>
        <div class="pb-hero__prompt">
          <div class="pb-ent-label">State your problem or the agent you want to build</div>
          <${PromptBox} examples=${EXAMPLES} submitLabel="Plan it" />
        </div>
        <div class="row gap-8 wrap center mt-16">
          <${Button} variant="ink" size="lg" icon="calendar" onClick=${toDemo}>Request a demo<//>
          <${Button} variant="ghost" size="lg" href="/admin" iconRight="arrow-right">Open the admin console<//>
        </div>
        <div class="pb-compliance">
          ${[['shield-check', 'Designed for SOC 2'], ['stethoscope', 'Designed for HIPAA'], ['globe', 'EU & US data residency'], ['lock', 'Encryption at rest & in transit']].map(([i, l]) => html`<span class="pb-compliance__b"><${Icon} name=${i} size=${14} />${l}</span>`)}
        </div>
        <p class="pb-fineprint pb-fineprint--center">Concept prototype — compliance items describe design targets, not current certifications.</p>
      </div>
    </section>

    <${Section} id="governance">
      <${SectionHead} eyebrow="Governance" title=${html`Control without <em>slowing anyone down.</em>`}
        lede="Builders keep the fast, plain-language flow. Admins set the rules once, and every project inherits them." />
      <div class="pb-feat">${FEATURES.map((x) => html`<div class="pb-feat__item"><span class="pb-feat__icon"><${Icon} name=${x.icon} size=${18} /></span><h3 class="pb-feat__t">${x.title}</h3><p class="pb-feat__b">${x.body}</p></div>`)}</div>
    <//>

    <${Section} id="console" tint>
      <div class="pb-split pb-split--console">
        <div class="pb-split__text">
          <div class="pb-eyebrow">Admin console</div>
          <h2 class="pb-h2 mt-12">Every app, agent and approval <em>in one place.</em></h2>
          <p class="pb-lede mt-16">See who built what, which agents are live, what they cost and what your policies blocked — then drill into any run’s trace.</p>
          <ul class="pb-checks mt-24">
            <li><span class="pb-checks__icon"><${Icon} name="check" size=${13} stroke=${2.6} /></span>Org-wide policies with per-workspace overrides</li>
            <li><span class="pb-checks__icon"><${Icon} name="check" size=${13} stroke=${2.6} /></span>Spend by team, project and agent, with hard caps</li>
            <li><span class="pb-checks__icon"><${Icon} name="check" size=${13} stroke=${2.6} /></span>Exportable audit log with 7-year retention</li>
          </ul>
          <div class="mt-24"><${Button} variant="secondary" href="/admin" iconRight="arrow-right">Open the admin console<//></div>
        </div>
        <div class="pb-split__visual"><${ConsoleMock} /></div>
      </div>
    <//>

    <${Section} id="fde">
      <${SectionHead} eyebrow="Forward-deployed engineers" title=${html`We build the first one <em>with you.</em>`}
        lede="A small team of our engineers joins yours to ship your first production agent — then hands over everything, so you can build the next ten yourselves." />
      <div class="pb-fde">
        ${[['Week 1', 'Discover', 'Map the workflow, the risks and the systems it touches. Agree on promises and success metrics.', 'compass'],
           ['Weeks 2–4', 'Build together', 'Pair in your workspace: agents, evals, guardrails and integrations, reviewed through your PR process.', 'workflow'],
           ['Handover', 'Own it', 'Your team owns the code, evals and runbooks. We stay on call for the first production month.', 'badge-check']].map(([when, t, b, i], idx) => html`<div class="pb-fde__step">
          <div class="pb-fde__top"><span class="pb-fde__icon"><${Icon} name=${i} size=${17} /></span><span class="pb-fde__when">${when}</span>${idx < 2 ? html`<span class="pb-fde__line"></span>` : null}</div>
          <h3 class="pb-feat__t">${t}</h3><p class="pb-feat__b">${b}</p>
        </div>`)}
      </div>
    <//>

    <${Section} id="demo" tint>
      <div class="pb-demo">
        <div>
          <div class="pb-eyebrow">Request a demo</div>
          <h2 class="pb-h2 mt-12">See it on <em>your</em> workflow.</h2>
          <p class="pb-lede mt-16">Bring a real process. In 30 minutes we’ll plan it together, show the quote and the governance around it — no slides.</p>
          <ul class="pb-checks mt-24">
            <li><span class="pb-checks__icon"><${Icon} name="check" size=${13} stroke=${2.6} /></span>A live plan and quote for your use case</li>
            <li><span class="pb-checks__icon"><${Icon} name="check" size=${13} stroke=${2.6} /></span>Security & deployment options for your environment</li>
            <li><span class="pb-checks__icon"><${Icon} name="check" size=${13} stroke=${2.6} /></span>A pilot proposal with forward-deployed engineers</li>
          </ul>
        </div>
        <div class="pb-demo__card"><${DemoForm} /></div>
      </div>
    <//>
  </div>`;
}
