// Usage & budgets: balance, per-phase totals, ledger with FREE tags, monthly cap.
import { html, useState } from '../../lib/html.js';
import { AppPage } from '../../shells/AppShell.js';
import { wallet, setBudgets, projects } from '../../lib/store.js';
import { PageHeader, Ring, Button, Badge, Empty, Input, Switch, toast, Icon } from '../../ui/index.js';
import { fmtNumber, fmtDate, timeAgo, cx } from '../../lib/util.js';
import { Stat } from './parts/common.js';

const PHASES = { plan: 'Planning', build: 'Building', fix: 'Fixes', edit: 'Edits', run: 'Agent runs', test: 'Tests', deploy: 'Deploys', topup: 'Top-ups' };

export default function Usage() {
  const w = wallet.value;
  const [cap, setCap] = useState(w.budgets.monthlyCap ?? '');
  const [phase, setPhase] = useState('all');
  const spent = w.ledger.filter((e) => e.phase !== 'topup' && e.at >= (w.cycleStart || 0)).reduce((n, e) => n + (e.amount || 0), 0);
  const saved = w.ledger.filter((e) => e.free).reduce((n, e) => n + (e.listed || 0), 0);
  const totals = {};
  for (const e of w.ledger) if (e.phase !== 'topup') totals[e.phase] = (totals[e.phase] || 0) + (e.amount || 0);
  const byApp = {};
  for (const e of w.ledger) if (e.phase !== 'topup' && e.projectId) byApp[e.projectId] = (byApp[e.projectId] || 0) + (e.amount || 0);
  const apps = Object.entries(byApp).sort((a, b) => b[1] - a[1]);
  const maxA = Math.max(1, ...apps.map((a) => a[1]));
  const maxT = Math.max(1, ...Object.values(totals));
  const pct = Math.round((w.balance / Math.max(1, Math.max(w.monthly, w.balance))) * 100);
  const reset = new Date(w.cycleStart || Date.now()); reset.setMonth(reset.getMonth() + 1);
  const rows = w.ledger.filter((e) => phase === 'all' || e.phase === phase);
  const capNum = Number(cap) || null;

  return html`<${AppPage}>
    <${PageHeader} title="Usage & budgets" subtitle="Every credit, where it went, and the limits that keep you in control." actions=${html`<${Button} href="/billing" icon="credit-card">Plans & top-ups<//>`} />
    <div class="ap-usage-top">
      <div class="ap-balance">
        <${Ring} value=${pct} size=${96} stroke=${8} tone=${pct < 15 ? 'red' : pct < 35 ? 'amber' : 'blueprint'} label=${`${pct}%`} />
        <div class="col gap-4"><span class="t-xs t-muted">Credits left</span><span class="t-3xl t-strong t-tabular">${fmtNumber(w.balance)}</span><span class="t-xs t-faint">${w.plan[0].toUpperCase() + w.plan.slice(1)} plan · ${fmtNumber(w.monthly)} / month · resets ${fmtDate(reset.getTime(), { month: 'short', day: 'numeric' })}</span></div>
      </div>
      <${Stat} icon="activity" label="Used this cycle" value=${fmtNumber(spent)} sub="credits" />
      <${Stat} icon="gift" label="Free fixes" value=${fmtNumber(saved)} sub="credits you didn’t pay for" tone="green" />
      <div class="ap-cap">
        <div class="t-sm t-strong row gap-6"><${Icon} name="shield" size=${14} />Monthly budget cap</div>
        <div class="row gap-8 mt-8"><div class="grow"><${Input} size="sm" type="number" min="0" placeholder="No cap" value=${cap} onValue=${setCap} suffix=${html`<span class="t-xs t-faint">credits</span>`} /></div><${Button} size="sm" variant="primary" onClick=${() => { setBudgets({ monthlyCap: capNum }); toast(capNum ? `Cap set to ${fmtNumber(capNum)} credits` : 'Cap removed', { tone: 'success' }); }}>Save<//></div>
        <div class="mt-8"><${Switch} size="sm" checked=${w.budgets.alertAt === 0.8} onChange=${(v) => setBudgets({ alertAt: v ? 0.8 : null })} label="Pause and ask at 80%" /></div>
      </div>
    </div>

    <div class="ap-usage-grid mt-24">
      <section class="ap-panel">
        <h2 class="t-md t-strong mb-12">By phase</h2>
        ${Object.keys(totals).length ? Object.entries(totals).sort((a, b) => b[1] - a[1]).map(([k, v]) => html`<div class="ap-phase"><span class="t-sm grow">${PHASES[k] || k}</span><span class="ap-phase__bar"><span style=${{ width: `${(v / maxT) * 100}%` }}></span></span><span class="t-sm t-tabular t-strong">${fmtNumber(v)}</span></div>`) : html`<div class="t-sm t-muted">Nothing spent yet. Planning and quotes are always free.</div>`}
        <h2 class="t-md t-strong mt-24 mb-12">By app</h2>
        ${apps.length ? apps.map(([id, v]) => html`<div class="ap-phase"><a class="t-sm grow t-truncate link" href=${`/p/${id}/insights`} title="Open this app’s usage in Insights">${projects.value[id]?.name || 'Deleted project'}</a><span class="ap-phase__bar"><span style=${{ width: `${(v / maxA) * 100}%` }}></span></span><span class="t-sm t-tabular t-strong">${fmtNumber(v)}</span></div>`)
          : html`<div class="t-sm t-muted">No app has spent credits yet.</div>`}
        ${(() => { const ex = Object.values(projects.value || {}).filter((p) => p?.sample && !p.deletedAt); return ex.length ? html`<div class="t-xs t-faint mt-12 row gap-4"><${Icon} name="flask" size=${12} />${ex.map((p) => p.name).join(', ')} ${ex.length === 1 ? 'is an example' : 'are examples'} — built for you at no cost. ${ex.length === 1 ? 'Its' : 'Their'} receipt shows what a real build would cost.</div>` : null; })()}
      </section>
      <section class="ap-panel">
        <div class="row gap-8 mb-12 wrap"><h2 class="t-md t-strong grow">Ledger</h2>${['all', ...Object.keys(PHASES)].filter((k) => k === 'all' || w.ledger.some((e) => e.phase === k)).map((k) => html`<button class=${cx('chip chip--sm', phase === k && 'is-active')} onClick=${() => setPhase(k)}>${k === 'all' ? 'All' : PHASES[k]}</button>`)}</div>
        ${rows.length ? html`<div class="ap-table-wrap"><table class="ap-table"><thead><tr><th>When</th><th>What</th><th>Project</th><th class="t-right">Credits</th></tr></thead><tbody>
          ${rows.slice(0, 80).map((e) => html`<tr>
            <td class="t-xs t-muted t-nowrap" data-tip=${fmtDate(e.at)}>${timeAgo(e.at)}</td>
            <td><span class="t-sm">${e.label || PHASES[e.phase] || e.phase}</span> ${e.free ? html`<${Badge} tone="green" size="sm">FREE<//>` : null}</td>
            <td class="t-xs t-muted">${e.projectId ? html`<a class="link" href=${`/p/${e.projectId}/app`}>${projects.value[e.projectId]?.name || 'Deleted project'}</a>` : '—'}</td>
            <td class="t-right t-tabular">${e.amount < 0 ? html`<span class="t-green">+${fmtNumber(-e.amount)}</span>` : e.free ? html`<s class="t-faint">${fmtNumber(e.listed)}</s> 0` : fmtNumber(e.amount)}</td>
          </tr>`)}
        </tbody></table></div>` : html`<${Empty} icon="receipt" title="No activity yet" body="When you approve a build, each step shows up here with its exact cost." />`}
      </section>
    </div>
  <//>`;
}
