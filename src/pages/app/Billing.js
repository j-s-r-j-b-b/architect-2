// Plans & billing (prototype — no payment is ever taken).
import { html, useState } from '../../lib/html.js';
import { AppPage } from '../../shells/AppShell.js';
import { wallet, setPlan, topUp } from '../../lib/store.js';
import { PLANS, TOP_UPS } from '../../engine/catalog.js';
import { PageHeader, Segmented, Button, Badge, Callout, Icon, confirmDialog, toast } from '../../ui/index.js';
import { fmtNumber, cx } from '../../lib/util.js';

export default function Billing() {
  const [cycle, setCycle] = useState('monthly');
  const w = wallet.value;
  const choose = async (p) => {
    const price = cycle === 'annual' ? p.annual : p.monthly;
    const ok = await confirmDialog({ title: `Switch to ${p.name}?`, body: html`<div class="col gap-8"><span>${fmtNumber(p.credits)} credits every month${price ? ` · $${price}/month${cycle === 'annual' ? ', billed yearly' : ''}` : ''}.</span><span class="row gap-6 t-sm"><${Icon} name="flask" size=${14} /><b>Prototype — no payment is taken.</b></span></div>`, confirmLabel: `Switch to ${p.name}` });
    if (!ok) return;
    setPlan(p.id, p.credits);
    toast(`You’re on ${p.name}. ${fmtNumber(p.credits)} credits are ready.`, { tone: 'success' });
  };
  const buy = async (t) => {
    const ok = await confirmDialog({ title: `Add ${fmtNumber(t.credits)} credits?`, body: html`<div class="col gap-8"><span>One-time top-up for $${t.usd}. Top-up credits never expire.</span><span class="row gap-6 t-sm"><${Icon} name="flask" size=${14} /><b>Prototype — no payment is taken.</b></span></div>`, confirmLabel: 'Add credits' });
    if (!ok) return;
    topUp(t.credits, `Top-up · $${t.usd}`);
    toast(`${fmtNumber(t.credits)} credits added`, { tone: 'success' });
  };
  return html`<${AppPage}>
    <${PageHeader} title="Plans & billing" subtitle=${html`You’re on <b>${PLANS.find((p) => p.id === w.plan)?.name || w.plan}</b> with ${fmtNumber(w.balance)} credits left.`}
      actions=${html`<${Segmented} value=${cycle} onChange=${setCycle} options=${[{ value: 'monthly', label: 'Monthly' }, { value: 'annual', label: 'Annual · save ~15%' }]} />`} />
    <${Callout} tone="amber" icon="flask" class="mb-16"><b>Prototype:</b> changing plans and buying credits is simulated. No card is asked for and nothing is charged.<//>
    <div class="ap-plans">${PLANS.map((p) => {
      const current = w.plan === p.id;
      const price = cycle === 'annual' ? p.annual : p.monthly;
      return html`<div class=${cx('ap-plan', p.popular && 'is-popular', current && 'is-current')}>
        <div class="row gap-8"><span class="t-lg t-strong grow">${p.name}</span>${p.popular ? html`<${Badge} tone="blueprint" size="sm">Popular<//>` : null}${current ? html`<${Badge} tone="green" size="sm" icon="check">Current<//>` : null}</div>
        <div class="ap-plan__price">${price == null ? html`<span class="t-2xl t-strong">Custom</span>` : html`<span class="t-3xl t-strong">$${price}</span><span class="t-sm t-muted">/mo</span>`}</div>
        <p class="t-sm t-muted">${p.blurb}</p>
        <ul class="ap-plan__features">${p.features.map((f) => html`<li><${Icon} name="check" size=${13} />${f}</li>`)}</ul>
        <div class="mt-auto">${current ? html`<${Button} full disabled>Current plan<//>` : p.id === 'custom' ? html`<${Button} full href="/enterprise">Talk to us<//>` : html`<${Button} full variant=${p.popular ? 'primary' : 'secondary'} onClick=${() => choose(p)}>${p.id === 'free' ? 'Downgrade' : `Choose ${p.name}`}<//>`}</div>
      </div>`;
    })}</div>
    <h2 class="t-md t-strong mt-32 mb-12">Top up credits</h2>
    <div class="ap-grid-3">${TOP_UPS.map((t) => html`<div class="ap-topup">
      <span class="ap-topup__icon"><${Icon} name="coins" size=${18} /></span>
      <div class="grow col gap-2"><span class="t-lg t-strong t-tabular">${fmtNumber(t.credits)} credits</span><span class="t-xs t-muted">$${t.usd} · ${t.credits > t.usd * 100 ? `${Math.round((t.credits / (t.usd * 100) - 1) * 100)}% bonus` : 'never expire'}</span></div>
      <${Button} size="sm" onClick=${() => buy(t)}>Add<//>
    </div>`)}</div>
    <p class="t-xs t-faint mt-16">Credits pay for building, fixing and running agents. Planning, quotes and fixes for problems Architect caused are always free.</p>
  <//>`;
}
