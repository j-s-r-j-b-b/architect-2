// "/pricing" — plans, top-ups, how credits work (with a live estimator), fix guarantee, caps, FAQ.
import { html, useState } from '../../lib/html.js';
import { session, wallet } from '../../lib/store.js';
import { Icon, Button, Badge, Segmented, Slider } from '../../ui/index.js';
import { PLANS, TOP_UPS } from '../../engine/catalog.js';
import { fmtNumber } from '../../lib/util.js';
import { Section, SectionHead, Faq } from './parts/common.js';
import { CtaBand } from './Landing.js';

const EXAMPLES = [
  { what: 'Planning, questions and quotes', detail: 'Re-plan as often as you like', cost: 'Free', tone: 'green' },
  { what: '3-screen app with 2 agents (first build)', detail: 'e.g. Lead Desk — itemised before you approve', cost: '≈ 36–48 cr' },
  { what: 'Small edit', detail: '“Make the header navy”, “add a reply-rate tile”', cost: '≈ 1–3 cr' },
  { what: 'New agent added to an existing app', detail: 'Instructions, tools, evals and wiring', cost: '≈ 6–9 cr' },
  { what: 'Fixing something our change broke', detail: 'Covered by the fix guarantee', cost: 'Free', tone: 'green' },
  { what: 'Agent runtime after launch', detail: 'Model cost passed through, shown per agent', cost: '≈ $0.01–0.05 / run' },
];

const CAPS = [
  { icon: 'folder', title: 'Per build', body: 'Every quote has a cap. At 80% the build pauses and asks before spending more — you can top up, trim scope or stop.' },
  { icon: 'wallet', title: 'Per month', body: 'Set an account-wide monthly limit with an alert threshold. Nothing runs past it without your say-so.' },
  { icon: 'bot', title: 'Per agent', body: 'Each agent has a cost-per-run and monthly budget. If it hits the limit it stops and tells you why.' },
];

const PRICING_FAQ = [
  { q: 'What is a credit?', a: 'A credit is a unit of AI work while building — planning your app is free, and building or changing it uses credits. Every quote shows the range in credits before you approve.' },
  { q: 'What if a build costs more than the quote?', a: 'Builds pause at 80% of your cap and ask. If the final cost lands above the quoted range because of our estimate, the difference is refunded automatically as credits.' },
  { q: 'Do unused credits roll over?', a: 'Monthly plan credits reset each cycle. Top-up credits never expire while you have an active account.' },
  { q: 'How is agent runtime billed?', a: 'Once your app is live, agents run on your plan’s model allowance at cost. Each agent shows its cost per run and its monthly spend — or bring your own model keys on Pro and above.' },
  { q: 'Can I cancel anytime?', a: 'Yes. You keep your code, your data and your deployed apps on the Free plan limits. Export or push to GitHub whenever you like.' },
];

/** Rough estimator — mirrors the generator's quote lines (setup + per screen + per agent + per connection). */
function estimate(screens, agents, ints) {
  // Calibrated so 3 screens · 2 agents · 3 connections = 36–48 cr (Lead Desk, as quoted in the worked examples).
  const lo = Math.round(5 + screens * 5 + agents * 6.5 + ints * 1);
  const hi = Math.round(7 + screens * 6.5 + agents * 8.5 + ints * 1.5);
  return [lo, hi];
}

function Estimator() {
  const [screens, setScreens] = useState(3);
  const [agents, setAgents] = useState(2);
  const [ints, setInts] = useState(3);
  const [lo, hi] = estimate(screens, agents, ints);
  const mins = [Math.round(2 + screens * 1.6 + agents * 1.2), Math.round(3 + screens * 2.4 + agents * 1.8)];
  const fits = PLANS.filter((p) => p.credits).map((p) => ({ ...p, builds: Math.floor(p.credits / hi) }));
  const first = fits.find((p) => p.builds >= 1);
  return html`<div class="pb-est">
    <div class="pb-est__controls">
      <div class="pb-est__title"><${Icon} name="gauge" size=${15} />Estimate a first build</div>
      ${[['Screens', screens, setScreens, 1, 10], ['Agents', agents, setAgents, 0, 6], ['Connections', ints, setInts, 0, 8]].map(([label, v, set, min, max]) => html`<label class="pb-est__row">
        <span class="pb-est__label">${label}</span>
        <${Slider} min=${min} max=${max} value=${v} onChange=${set} aria-label=${label} />
        <span class="pb-est__val">${v}</span>
      </label>`)}
    </div>
    <div class="pb-est__out">
      <div class="pb-est__k">Estimated quote</div>
      <div class="pb-est__big">${lo}–${hi}<span> credits</span></div>
      <div class="pb-est__sub">≈ ${mins[0]}–${mins[1]} min to build · planning free</div>
      <div class="pb-est__fits">
        ${fits.map((p) => html`<div class=${'pb-est__fit' + (p.builds >= 1 ? ' is-ok' : '')}>
          <span>${p.name}</span><span class="t-tabular">${p.builds >= 1 ? `${p.builds}× per month` : 'Needs a top-up'}</span>
        </div>`)}
      </div>
      <p class="pb-est__note">${first ? `Fits in the ${first.name} plan.` : 'Larger than any plan’s monthly credits — add a top-up.'} The real quote is itemised from your plan and may differ.</p>
    </div>
  </div>`;
}

export default function Pricing() {
  const [cycle, setCycle] = useState('annual');
  const me = session.value;
  const current = me ? wallet.value.plan : null;
  const ctaFor = (p) => {
    if (p.id === 'custom') return { label: 'Talk to us', href: '/enterprise#demo', variant: 'secondary' };
    if (me) {
      if (current === p.id) return { label: 'Current plan', href: '/billing', variant: 'subtle', current: true };
      return { label: p.id === 'free' ? 'Switch to Free' : `Choose ${p.name}`, href: `/billing?plan=${p.id}&cycle=${cycle}`, variant: p.popular ? 'primary' : 'secondary' };
    }
    return { label: p.id === 'free' ? 'Start free' : `Start with ${p.name}`, href: `/signup?next=${encodeURIComponent(p.id === 'free' ? '/start' : `/billing?plan=${p.id}&cycle=${cycle}`)}`, variant: p.popular ? 'primary' : 'secondary' };
  };

  return html`<div class="pb-page">
    <section class="pb-hero pb-hero--compact">
      <div class="pb-hero__bg" aria-hidden="true"></div>
      <div class="pb-wrap pb-hero__inner">
        <div class="pb-eyebrow">Pricing</div>
        <h1 class="pb-hero__title pb-hero__title--sm">Pay for what gets built. <em>See the price first.</em></h1>
        <p class="pb-hero__sub">Planning and quotes are always free. Every build shows an itemised quote you approve — and if a change we made breaks your app, the fix is on us.</p>
        <div class="pb-cycle">
          <${Segmented} value=${cycle} onChange=${setCycle} options=${[{ value: 'monthly', label: 'Monthly' }, { value: 'annual', label: 'Annual' }]} />
          <${Badge} tone="green" icon="gift">Annual saves ~12%<//>
        </div>
      </div>
    </section>

    <div class="pb-wrap">
      <div class="pb-plans">
        ${PLANS.map((p) => {
          const cta = ctaFor(p);
          const price = p.monthly == null ? null : cycle === 'annual' ? p.annual : p.monthly;
          const saving = p.monthly ? (p.monthly - p.annual) * 12 : 0;
          return html`<div class=${'pb-plan' + (p.popular ? ' is-popular' : '') + (p.id === 'custom' ? ' is-ent' : '') + (cta.current ? ' is-current' : '')}>
            ${p.popular ? html`<span class="pb-plan__flag">Most popular</span>` : null}
            <div class="pb-plan__name">${p.name}</div>
            <p class="pb-plan__blurb">${p.blurb}</p>
            <div class="pb-plan__price">
              ${price == null ? html`<span class="pb-plan__amt pb-plan__amt--custom">Custom</span>` : html`<span class="pb-plan__amt">$${price}</span><span class="pb-plan__per">/ month</span>`}
            </div>
            <div class="pb-plan__billing">${price == null ? 'Annual agreement · volume credits' : price === 0 ? 'Free forever' : cycle === 'annual' ? `Billed $${price * 12}/year · save $${saving}` : 'Billed monthly · cancel anytime'}</div>
            <div class="pb-plan__credits"><${Icon} name="coins" size=${14} />${p.credits ? html`<b>${fmtNumber(p.credits)}</b> credits / month` : html`<b>Custom</b> credit allocation`}</div>
            <${Button} full variant=${cta.variant} href=${cta.href} iconRight=${cta.current ? null : 'arrow-right'}>${cta.label}<//>
            <ul class="pb-plan__features">${p.features.map((f) => html`<li><${Icon} name="check" size=${14} stroke=${2.4} />${f}</li>`)}</ul>
          </div>`;
        })}
      </div>
      <p class="pb-fineprint"><${Icon} name="info" size=${13} />Every plan includes unlimited planning & quotes, checkpoints, the Doctor and GitHub export. Prototype: plan changes are simulated — no payment is taken.</p>
    </div>

    <${Section} id="topups">
      <${SectionHead} align="left" eyebrow="Top-ups" title=${html`Need more this month? <em>Top up anytime.</em>`}
        lede="One-off credit packs on top of any plan. Bigger packs include bonus credits, and top-up credits never expire." />
      <div class="pb-topups">
        ${TOP_UPS.map((t, i) => {
          const bonus = Math.round((t.credits / (t.usd * 100) - 1) * 100);
          return html`<div class="pb-topup">
            <div class="pb-topup__credits">${fmtNumber(t.credits)}<span> credits</span></div>
            <div class="pb-topup__price">$${t.usd} one-off</div>
            ${bonus > 0 ? html`<${Badge} tone="green" size="sm">+${bonus}% bonus<//>` : html`<${Badge} size="sm">Standard rate<//>`}
            <${Button} variant=${i === 1 ? 'primary' : 'secondary'} full href=${me ? `/billing?topup=${t.usd}` : `/signup?next=${encodeURIComponent('/billing')}`}>Add ${fmtNumber(t.credits)} credits<//>
          </div>`;
        })}
      </div>
    <//>

    <${Section} id="credits" tint>
      <${SectionHead} eyebrow="How credits work" title=${html`No surprises. <em>Ever.</em>`}
        lede="You see the price before you spend, you watch the meter while it builds, and you get a receipt afterwards." />
      <div class="pb-flow">
        ${[['list-checks', 'Plan — free', 'Questions, promises and an itemised quote cost nothing, however often you re-plan.'], ['receipt', 'Approve a quote', 'You see a credit range and time estimate per line item, and set a cap.'], ['eye', 'Watch the meter', 'Credits tick up per step while you watch. Pause or stop anytime and keep what’s done.'], ['file-text', 'Get a receipt', 'Promises verified, credits used, free fixes — all in one receipt.']].map(([icon, t, b], i) => html`<div class="pb-flow__item">
          <span class="pb-flow__n">${i + 1}</span>
          <span class="pb-flow__icon"><${Icon} name=${icon} size=${16} /></span>
          <div class="pb-flow__t">${t}</div><p class="pb-flow__b">${b}</p>
        </div>`)}
      </div>
      <div class="pb-credits">
        <div class="pb-examples">
          <div class="pb-examples__head"><span>Worked examples</span><span>Typical cost</span></div>
          ${EXAMPLES.map((e) => html`<div class="pb-examples__row">
            <div class="grow"><div class="pb-examples__what">${e.what}</div><div class="pb-examples__detail">${e.detail}</div></div>
            <div class=${'pb-examples__cost' + (e.tone === 'green' ? ' is-free' : '')}>${e.cost}</div>
          </div>`)}
        </div>
        <${Estimator} />
      </div>
    <//>

    <${Section} id="guarantee">
      <div class="pb-guarantee">
        <span class="pb-guarantee__icon"><${Icon} name="shield-check" size=${26} /></span>
        <div class="grow">
          <div class="pb-eyebrow pb-eyebrow--green">Fix guarantee</div>
          <h2 class="pb-h2 mt-8">If a change we made breaks your app, <em>the fix is free.</em></h2>
          <p class="pb-lede mt-12">The Doctor traces the problem to the change that caused it. When it was ours, the fix is logged at 0 credits and marked “Free fix” on your receipt. After two failed attempts the loop breaker stops and offers a rollback — so you never pay for a loop.</p>
        </div>
      </div>
      <div class="pb-caps">
        <div class="pb-caps__head"><div class="pb-eyebrow">Budget caps</div><h3 class="pb-caps__title">Three limits, all yours to set</h3></div>
        ${CAPS.map((c) => html`<div class="pb-cap"><span class="pb-cap__icon"><${Icon} name=${c.icon} size=${16} /></span><div class="pb-cap__t">${c.title}</div><p class="pb-cap__b">${c.body}</p></div>`)}
      </div>
    <//>

    <${Section} id="faq" tint>
      <div class="pb-faqwrap">
        <div>
          <div class="pb-eyebrow">Pricing FAQ</div>
          <h2 class="pb-h2 mt-12">The fine print, <em>in plain words.</em></h2>
          <p class="pb-lede mt-16">Running a team or need governance? <a class="link" href="/enterprise">See Enterprise</a>.</p>
        </div>
        <${Faq} items=${PRICING_FAQ} />
      </div>
    <//>

    <${CtaBand} title=${html`Plan your app now. <em>Pay only if you build it.</em>`} />
  </div>`;
}
