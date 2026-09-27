// Admin console (enterprise preview): KPIs, apps inventory, policies, audit log.
import { html, useState } from '../../lib/html.js';
import { AppPage } from '../../shells/AppShell.js';
import { projectList, session } from '../../lib/store.js';
import { PageHeader, Tabs, Callout, Switch, Badge, StatusPill, Input, Button, toast, Icon } from '../../ui/index.js';
import { fmtNumber, fmtMoney, timeAgo, loadJSON, saveJSON } from '../../lib/util.js';
import { Stat } from './parts/common.js';

const ORG_APPS = [
  { name: 'Claims Desk', owner: 'Priya S.', team: 'Operations', status: 'live', agents: 3, runs: 4120, cost: 182.4, data: 'PII', model: 'Balanced' },
  { name: 'Contract Reviewer', owner: 'Tom W.', team: 'Legal', status: 'live', agents: 2, runs: 860, cost: 64.1, data: 'Confidential', model: 'Best' },
  { name: 'Sales Pipeline Coach', owner: 'Ana L.', team: 'Sales', status: 'built', agents: 2, runs: 312, cost: 11.8, data: 'Internal', model: 'Fast' },
  { name: 'HR Policy Q&A', owner: 'Kofi A.', team: 'People', status: 'live', agents: 1, runs: 2290, cost: 38.5, data: 'Internal', model: 'Balanced' },
];
const POLICIES = [
  { id: 'approval', label: 'Require reviewer approval to publish to production', hint: 'Editors can publish to staging only.' },
  { id: 'pii', label: 'Block agents from sending PII outside the company', hint: 'Enforced by guardrails on every agent.' },
  { id: 'models', label: 'Allow only approved model providers', hint: 'Anthropic and Azure OpenAI.' },
  { id: 'byok', label: 'Allow members to bring their own model keys' },
  { id: 'marketplace', label: 'Allow publishing to the public marketplace' },
  { id: 'sso', label: 'Require SSO sign-in (SAML)', hint: 'Okta · last sync 2h ago' },
  { id: 'retention', label: 'Delete agent traces after 30 days' },
];
const AUDIT = [
  { at: 12, who: 'Priya S.', what: 'Published Claims Desk v14 to production', kind: 'deploy' },
  { at: 47, who: 'System', what: 'Blocked an email containing a card number (Claims Desk › Fraud Watcher)', kind: 'guardrail' },
  { at: 130, who: 'Tom W.', what: 'Approved pull request #42 on contract-reviewer', kind: 'review' },
  { at: 260, who: 'Ana L.', what: 'Connected HubSpot (read contacts, update deals)', kind: 'connection' },
  { at: 610, who: 'Kofi A.', what: 'Changed HR Policy Q&A model tier Balanced → Fast', kind: 'change' },
  { at: 1440, who: 'Admin', what: 'Enabled “Require reviewer approval to publish”', kind: 'policy' },
];
const AUDIT_ICON = { deploy: 'rocket', guardrail: 'shield-alert', review: 'git-pull-request', connection: 'plug', change: 'pencil', policy: 'shield-check' };

export default function Admin({ params }) {
  const tab = ['overview', 'apps', 'policies', 'audit'].includes(params?.section) ? params.section : 'overview';
  const [pol, setPol] = useState(() => loadJSON('a2:admin:policies', { approval: true, pii: true, models: false, byok: true, marketplace: false, sso: true, retention: true }));
  const [q, setQ] = useState('');
  const mine = projectList.value.map((p) => ({ name: p.name, owner: session.value?.name || 'You', team: 'You', status: p.status, agents: p.agents.length, runs: p.agents.reduce((n, a) => n + (a.stats?.runs || 0), 0), cost: p.agents.reduce((n, a) => n + (a.stats?.cost || 0), 0), data: p.data.tables.some((t) => t.source === 'live') ? 'Live' : 'Sample', model: p.settings?.modelTier || 'balanced' }));
  const apps = [...ORG_APPS, ...mine].filter((a) => !q || `${a.name} ${a.owner} ${a.team}`.toLowerCase().includes(q.toLowerCase()));
  const setP = (id, v) => { const next = { ...pol, [id]: v }; setPol(next); saveJSON('a2:admin:policies', next); toast(`Policy ${v ? 'enabled' : 'disabled'}`, { tone: 'success' }); };
  const all = [...ORG_APPS, ...mine];

  return html`<${AppPage} wide>
    <${PageHeader} title="Admin console" subtitle="Governance for every app and agent in your organisation." actions=${html`<${Badge} tone="violet" icon="building">Enterprise preview<//>`} />
    <${Callout} tone="amber" icon="flask" class="mb-16"><b>Preview:</b> organisation data here is simulated so you can explore the controls. Your own projects are included in the inventory.<//>
    <${Tabs} class="mb-16" value=${tab} tabs=${[{ id: 'overview', label: 'Overview', icon: 'layout-dashboard', href: '/admin/overview' }, { id: 'apps', label: 'Apps', icon: 'layout-grid', href: '/admin/apps', count: all.length }, { id: 'policies', label: 'Policies', icon: 'shield-check', href: '/admin/policies' }, { id: 'audit', label: 'Audit log', icon: 'history', href: '/admin/audit' }]} />
    ${tab === 'overview' ? html`<div class="ap-grid-4">
        <${Stat} icon="layout-grid" label="Apps" value=${all.length} sub=${`${all.filter((a) => a.status === 'live').length} live`} />
        <${Stat} icon="users" label="Active builders" value="38" sub="+6 this month" />
        <${Stat} icon="bot" label="Agent runs (30d)" value=${fmtNumber(all.reduce((n, a) => n + a.runs, 0))} />
        <${Stat} icon="coins" label="Model spend (30d)" value=${fmtMoney(all.reduce((n, a) => n + a.cost, 0))} sub="within the $2,000 budget" tone="green" />
      </div>
      <div class="ap-grid-2 mt-16">
        <section class="ap-panel"><h2 class="t-md t-strong mb-12">Policy coverage</h2>${POLICIES.slice(0, 4).map((p) => html`<div class="row gap-8 t-sm mb-8"><${Icon} name=${pol[p.id] ? 'check-circle' : 'circle'} size=${15} class=${pol[p.id] ? 't-green' : 't-faint'} /><span>${p.label}</span></div>`)}<a class="link t-sm" href="/admin/policies">Manage policies →</a></section>
        <section class="ap-panel"><h2 class="t-md t-strong mb-12">Recent activity</h2>${AUDIT.slice(0, 4).map((a) => html`<div class="row gap-8 t-sm mb-8"><${Icon} name=${AUDIT_ICON[a.kind]} size=${14} class="t-faint" /><span class="grow t-truncate">${a.what}</span><span class="t-xs t-faint t-nowrap">${timeAgo(Date.now() - a.at * 60e3)}</span></div>`)}<a class="link t-sm" href="/admin/audit">Full audit log →</a></section>
      </div>` : null}
    ${tab === 'apps' ? html`<div class="ap-toolbar"><div class="grow" style="min-width:200px"><${Input} icon="search" placeholder="Search apps, owners, teams" value=${q} onValue=${setQ} /></div><${Button} icon="download" onClick=${() => toast('Inventory export is simulated in this preview')}>Export<//></div>
      <div class="ap-table-wrap"><table class="ap-table"><thead><tr><th>App</th><th>Owner</th><th>Status</th><th>Agents</th><th>Runs</th><th>Spend</th><th>Data</th><th>Model</th></tr></thead><tbody>
        ${apps.map((a) => html`<tr><td class="t-strong">${a.name}</td><td class="t-sm">${a.owner}<div class="t-xs t-faint">${a.team}</div></td><td><${StatusPill} status=${a.status} size="sm" /></td><td class="t-tabular">${a.agents}</td><td class="t-tabular">${fmtNumber(a.runs)}</td><td class="t-tabular">${fmtMoney(a.cost)}</td><td><${Badge} size="sm" tone=${a.data === 'PII' ? 'red' : a.data === 'Confidential' ? 'amber' : 'neutral'}>${a.data}<//></td><td class="t-sm">${a.model[0].toUpperCase() + a.model.slice(1)}</td></tr>`)}
      </tbody></table></div>` : null}
    ${tab === 'policies' ? html`<div class="ap-panel col gap-16">${POLICIES.map((p) => html`<${Switch} tone="green" checked=${!!pol[p.id]} onChange=${(v) => setP(p.id, v)} label=${p.label} hint=${p.hint} />`)}</div>` : null}
    ${tab === 'audit' ? html`<div class="ap-list">${AUDIT.map((a) => html`<div class="ap-list__row"><span class="ap-mcp-icon"><${Icon} name=${AUDIT_ICON[a.kind]} size=${15} /></span><div class="grow col gap-2"><span class="t-sm">${a.what}</span><span class="t-xs t-faint">${a.who} · ${timeAgo(Date.now() - a.at * 60e3)}</span></div><${Badge} size="sm">${a.kind}<//></div>`)}</div>` : null}
  <//>`;
}
