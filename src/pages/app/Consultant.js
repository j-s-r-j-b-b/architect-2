// AI Consultant: Role → Time-sinks → Tools → Goals, with live tailored app ideas.
import { html, useState, useMemo } from '../../lib/html.js';
import { AppPage } from '../../shells/AppShell.js';
import { navigate } from '../../lib/router.js';
import { Button, Icon, Badge, PageHeader, Segmented, Card } from '../../ui/index.js';
import { TEMPLATES, integrationById } from '../../engine/catalog.js';
import { IntegrationTile } from '../../shells/ConnectSheet.js';
import { cx } from '../../lib/util.js';

const ROLES = [
  { id: 'sales', label: 'Sales', icon: 'target', cat: 'Sales' }, { id: 'support', label: 'Customer support', icon: 'headphones', cat: 'Support' },
  { id: 'ops', label: 'Operations', icon: 'settings', cat: 'Operations' }, { id: 'hr', label: 'HR & recruiting', icon: 'users', cat: 'HR & Recruiting' },
  { id: 'finance', label: 'Finance', icon: 'coins', cat: 'Finance' }, { id: 'marketing', label: 'Marketing', icon: 'megaphone', cat: 'Marketing' },
  { id: 'eng', label: 'Product & engineering', icon: 'code', cat: 'Product & Engineering' }, { id: 'founder', label: 'Founder / owner', icon: 'rocket', cat: null },
];
const SINKS = [
  { id: 'leads', label: 'Qualifying leads', t: ['lead-desk'] }, { id: 'followups', label: 'Writing follow-ups', t: ['lead-desk', 'invoice-chaser'] },
  { id: 'questions', label: 'Answering the same questions', t: ['policy-assistant', 'support-copilot'] }, { id: 'tickets', label: 'Triaging tickets', t: ['support-copilot', 'bug-triage'] },
  { id: 'entry', label: 'Copying data between tools', t: ['expense-auditor', 'order-ops'] }, { id: 'reports', label: 'Weekly reporting', t: ['sprint-reporter', 'expense-auditor'] },
  { id: 'screening', label: 'Screening candidates', t: ['recruit-screen', 'onboarding-buddy'] }, { id: 'invoices', label: 'Chasing invoices', t: ['invoice-chaser'] },
  { id: 'scheduling', label: 'Scheduling', t: ['booking-concierge', 'recruit-screen'] }, { id: 'research', label: 'Research', t: ['research-brief'] },
  { id: 'content', label: 'Writing content', t: ['content-studio'] }, { id: 'docs', label: 'Reviewing documents', t: ['contract-review', 'claims-desk'] },
];
const TOOLS = ['gmail', 'slack', 'hubspot', 'gsheets', 'notion', 'gcal', 'freshdesk', 'stripe', 'shopify', 'jira', 'linear', 'gdrive'];
const GOALS = [{ id: 'time', label: 'Save hours every week' }, { id: 'speed', label: 'Respond faster' }, { id: 'errors', label: 'Fewer mistakes' }, { id: 'revenue', label: 'Grow revenue' }, { id: 'visibility', label: 'See what’s happening' }];
const TEAM = [{ value: '1', label: 'Just me' }, { value: '5', label: '2–10' }, { value: '25', label: '11–50' }, { value: '80', label: '50+' }];
const STEPS = [{ id: 'role', label: 'Role' }, { id: 'sinks', label: 'Time-sinks' }, { id: 'tools', label: 'Tools' }, { id: 'goals', label: 'Goals' }];
const toggle = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

function ideasFor(a) {
  const role = ROLES.find((r) => r.id === a.role);
  const scores = TEMPLATES.map((t) => {
    let s = 0;
    for (const sid of a.sinks) if (SINKS.find((x) => x.id === sid)?.t.includes(t.id)) s += 3;
    if (role?.cat && t.category === role.cat) s += 2;
    s += t.integrations.filter((i) => a.tools.includes(i)).length;
    return { t, s: s + (t.popular ? 0.3 : 0) };
  }).sort((x, y) => y.s - x.s);
  const team = Number(a.team) || 1;
  return scores.slice(0, 3).map(({ t, s }, i) => {
    const tools = [...new Set([...t.integrations.filter((x) => a.tools.includes(x)), ...t.integrations])].slice(0, 4);
    const hrs = Math.max(2, Math.round((2 + s * 0.9) * Math.min(6, 1 + Math.log2(team)) - i));
    const using = a.tools.filter((x) => t.integrations.includes(x)).map((x) => integrationById(x).name);
    const goals = a.goals.map((g) => GOALS.find((x) => x.id === g)?.label.toLowerCase()).filter(Boolean);
    const prompt = `${t.prompt}${using.length ? ` We already use ${using.join(', ')}.` : ''}${a.role ? ` I work in ${role.label.toLowerCase()}` : ''}${team > 1 ? ` with a team of about ${team}.` : a.role ? '.' : ''}${goals.length ? ` The goal: ${goals.join(', ')}.` : ''}`;
    return { t, tools, hrs, prompt, match: Math.min(98, 62 + Math.round(s * 5)) };
  });
}

function IdeaCard({ idea, big }) {
  return html`<div class=${cx('ap-idea', big && 'ap-idea--big')}>
    <div class="row gap-8"><span class="ap-tcard__icon"><${Icon} name=${idea.t.icon} size=${16} /></span><span class="t-strong grow">${idea.t.title}</span><${Badge} tone="green" size="sm">${idea.match}% fit<//></div>
    ${big ? html`<p class="t-sm t-muted">${idea.t.prompt}</p>` : null}
    <div class="ap-idea__stats">
      <span><b>~${idea.hrs} h</b><small>saved / week</small></span>
      <span><b>${idea.t.agents.length}</b><small>${idea.t.agents.length === 1 ? 'agent' : 'agents'}</small></span>
      <span class="row gap-4">${idea.tools.map((i) => html`<${IntegrationTile} id=${i} size="sm" />`)}</span>
    </div>
    ${big ? html`<div class="row gap-6 wrap">${idea.t.agents.map((n) => html`<${Badge} tone="violet" icon="bot" size="sm">${n}<//>`)}</div>
      <div class="row gap-8 mt-auto"><${Button} variant="primary" iconRight="arrow-right" onClick=${() => navigate(`/new?prompt=${encodeURIComponent(idea.prompt)}`)}>Build this<//><${Button} variant="ghost" href=${`/templates/${idea.t.id}`}>Details<//></div>` : null}
  </div>`;
}

export default function Consultant() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState({ role: null, sinks: [], tools: [], goals: [], team: '5' });
  const set = (patch) => setA({ ...a, ...patch });
  const ideas = useMemo(() => ideasFor(a), [a]);
  const finished = step >= STEPS.length;
  const canNext = step === 0 ? !!a.role : step === 1 ? a.sinks.length > 0 : true;

  const body = [
    html`<div class="ap-cgrid">${ROLES.map((r) => html`<button type="button" class=${cx('ap-choice', a.role === r.id && 'is-active')} onClick=${() => set({ role: r.id })}><${Icon} name=${r.icon} size=${18} /><span>${r.label}</span></button>`)}</div>
      <div class="mt-16"><div class="field__label mb-8">Team size</div><${Segmented} options=${TEAM} value=${a.team} onChange=${(v) => set({ team: v })} /></div>`,
    html`<div class="row gap-8 wrap">${SINKS.map((s) => html`<button type="button" class=${cx('chip', a.sinks.includes(s.id) && 'is-active')} aria-pressed=${a.sinks.includes(s.id)} onClick=${() => set({ sinks: toggle(a.sinks, s.id) })}>${a.sinks.includes(s.id) ? html`<${Icon} name="check" size=${12} />` : null}${s.label}</button>`)}</div>`,
    html`<div class="ap-cgrid">${TOOLS.map((id) => html`<button type="button" class=${cx('ap-choice ap-choice--tool', a.tools.includes(id) && 'is-active')} onClick=${() => set({ tools: toggle(a.tools, id) })}><${IntegrationTile} id=${id} /><span>${integrationById(id).name}</span></button>`)}</div>`,
    html`<div class="row gap-8 wrap">${GOALS.map((g) => html`<button type="button" class=${cx('chip', a.goals.includes(g.id) && 'is-active')} aria-pressed=${a.goals.includes(g.id)} onClick=${() => set({ goals: toggle(a.goals, g.id) })}>${g.label}</button>`)}</div>`,
  ];
  const prompts = ['What do you do?', 'Where does your time go?', 'Which tools do you use every day?', 'What would “better” look like?'];

  return html`<${AppPage}>
    <${PageHeader} crumb=${html`<a href="/start" class="link t-sm">← Start</a>`} title="Help me decide" subtitle="Four quick questions. We’ll suggest apps that fit how you work — nothing is built until you say so." />
    ${finished ? html`<div class="anim-rise">
      <div class="row mb-12"><h2 class="t-lg t-strong grow">Three apps tailored to you</h2><${Button} variant="ghost" size="sm" icon="pencil" onClick=${() => setStep(0)}>Change answers<//></div>
      <div class="ap-grid-3">${ideas.map((i) => html`<${IdeaCard} idea=${i} big />`)}</div>
      <p class="t-xs t-faint mt-12">Hours saved are estimates based on similar teams. You’ll get an exact plan and price before building.</p>
    </div>` : html`<div class="ap-consult">
      <${Card} padded class="ap-consult__main">
        <ol class="ap-stepper ap-stepper--sm">${STEPS.map((s, i) => html`<li class=${cx(i < step && 'is-done', i === step && 'is-active')}><span>${i < step ? html`<${Icon} name="check" size=${12} />` : i + 1}</span>${s.label}</li>`)}</ol>
        <h2 class="t-xl t-strong mt-16 mb-12">${prompts[step]}</h2>
        <div class="anim-fade" key=${step}>${body[step]}</div>
        <div class="row gap-8 mt-24">
          ${step > 0 ? html`<${Button} variant="ghost" icon="arrow-left" onClick=${() => setStep(step - 1)}>Back<//>` : null}
          <span class="grow"></span>
          ${step >= 2 ? html`<${Button} variant="ghost" onClick=${() => setStep(step + 1)}>Skip<//>` : null}
          <${Button} variant="primary" iconRight="arrow-right" disabled=${!canNext} onClick=${() => setStep(step + 1)}>${step === STEPS.length - 1 ? 'Show my ideas' : 'Next'}<//>
        </div>
      <//>
      <aside class="ap-consult__side">
        <div class="row gap-6 t-sm t-strong mb-8"><${Icon} name="sparkles" size=${14} class="t-violet" />Tailored app ideas<span class="t-xs t-faint" style="font-weight:400">· updates as you answer</span></div>
        ${a.role || a.sinks.length ? html`<div class="col gap-8">${ideas.map((i) => html`<${IdeaCard} idea=${i} key=${i.t.id} />`)}</div>` : html`<div class="ap-consult__empty t-sm t-muted">Pick your role to see the first ideas.</div>`}
      </aside>
    </div>`}
  <//>`;
}
