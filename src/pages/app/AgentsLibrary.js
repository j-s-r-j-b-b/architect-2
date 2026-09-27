// Agents library (/agents): every agent across your projects, plus a small template gallery.
import { html, useState } from '../../lib/html.js';
import { navigate } from '../../lib/router.js';
import { cx, fmtNumber } from '../../lib/util.js';
import { projectList, projectsReady, createProject, logActivity } from '../../lib/store.js';
import { PageHeader, Input, Select, Segmented, Icon, Empty, Skeleton, Badge, Button, toast } from '../../ui/index.js';
import { FRAMEWORKS } from '../../engine/catalog.js';
import { AppPage } from '../../shells/AppShell.js';
import { IntegrationTile } from '../../shells/ConnectSheet.js';
import { AgentAvatar, FrameworkBadge, VersionPill, EvalChip, TierLabel } from '../../workspace/agents/ui.js';
import { NewAgentMenu } from '../../workspace/agents/dialogs.js';
import { AGENT_TEMPLATES, agentFromTemplate, normalizeAgent, fmtUsd } from '../../workspace/agents/model.js';

/** An agent can live on its own: give it a home project with no screens. */
function createStandalone(spec, { view } = {}) {
  const agent = normalizeAgent({ ...spec, version: 1, status: 'draft' });
  const p = createProject({ name: agent.name, status: 'built', screens: [], agents: [agent], description: agent.role });
  logActivity(p.id, { actor: 'You', kind: 'agent', plain: `Created ${agent.name} as a standalone agent.`, technical: `agents/${agent.id} · framework ${agent.framework}` });
  toast(`${agent.name} created`, { tone: 'success' });
  navigate(`/p/${p.id}/agents/${agent.id}/build${view === 'code' ? '?view=code' : ''}`);
}

export default function AgentsLibrary() {
  const [q, setQ] = useState('');
  const [fw, setFw] = useState('all');
  const [status, setStatus] = useState('all');
  const ready = projectsReady.value;
  const all = [];
  for (const p of projectList.value || []) {
    if (p.trashedAt || p.trashed) continue;
    for (const a of p.agents || []) all.push({ p, a: normalizeAgent(a) });
  }
  const s = q.trim().toLowerCase();
  const rows = all.filter(({ p, a }) => (fw === 'all' || a.framework === fw) && (status === 'all' || a.status === status) && (!s || `${a.name} ${a.role} ${p.name}`.toLowerCase().includes(s)));
  const live = all.filter((x) => x.a.status === 'live').length;
  const runs = all.reduce((n, x) => n + (x.a.stats?.runs || 0), 0);

  return html`<${AppPage}>
    <${PageHeader} title="Agents" subtitle=${all.length ? `${all.length} agents across your projects · ${live} live · ${fmtNumber(runs)} runs this week` : 'Agents that think and act for you — inside an app or on their own.'}
      actions=${html`<${NewAgentMenu} standalone onCreate=${createStandalone} />`} />
    ${!ready ? html`<div class="col gap-8">${[0, 1, 2].map(() => html`<${Skeleton} height=${56} />`)}</div>`
      : !all.length ? html`<${Empty} icon="bot" title="No agents yet" body="Start from a template below, describe one in plain words, or import code you already have." action=${html`<${NewAgentMenu} standalone onCreate=${createStandalone} label="Create an agent" />`} />`
        : html`
      <div class="ag-libbar">
        <${Input} size="sm" icon="search" placeholder="Search agents or projects" value=${q} onValue=${setQ} class="ag-libbar__search" aria-label="Search agents" />
        <${Select} size="sm" value=${fw} onValue=${setFw} aria-label="Framework" options=${[{ value: 'all', label: 'All frameworks' }, ...FRAMEWORKS.map((f) => ({ value: f.id, label: f.name }))]} />
        <${Segmented} size="sm" value=${status} onChange=${setStatus} options=${[{ value: 'all', label: 'All' }, { value: 'live', label: 'Live' }, { value: 'draft', label: 'Drafts' }]} />
      </div>
      <div class="ag-lib" role="table" aria-label="Agents">
        <div class="ag-lib__head" role="row"><span>Agent</span><span>Project</span><span>Framework</span><span>Status</span><span>Runs · 7d</span><span>Eval</span></div>
        ${rows.map(({ p, a }) => html`<a class="ag-lib__row" role="row" href=${`/p/${p.id}/agents/${a.id}/build`} key=${p.id + a.id}>
          <span class="ag-lib__agent"><${AgentAvatar} agent=${a} size="md" /><span class="ag-lib__txt"><span class="t-strong">${a.name}</span><span class="t-xs t-muted ag-clamp1">${a.role || '—'}</span></span></span>
          <span class="ag-lib__proj t-sm"><${Icon} name=${p.screens?.length ? 'monitor' : 'bot'} size=${13} /><span class="ag-clamp1">${p.name}</span></span>
          <span><${FrameworkBadge} id=${a.framework} size="sm" /></span>
          <span><${VersionPill} agent=${a} size="sm" /></span>
          <span class="t-sm t-mono ag-lib__runs">${a.stats?.runs ? `${fmtNumber(a.stats.runs)} · ${fmtUsd(a.stats.cost)}` : '—'}</span>
          <span><${EvalChip} score=${a.evalScore} /></span>
        </a>`)}
        ${!rows.length ? html`<div class="ag-lib__none t-sm t-muted">No agents match. <button type="button" class="link" onClick=${() => { setQ(''); setFw('all'); setStatus('all'); }}>Clear filters</button></div>` : null}
      </div>`}
    <section class="ag-libtpl">
      <div class="row gap-8"><h2 class="ag-pane__title">Start from a template</h2><${Badge} size="sm" tone="outline">Free to create<//></div>
      <p class="t-sm t-muted">Each one becomes a standalone draft agent you can try right away and add to any app later.</p>
      <div class="ag-tplgrid ag-tplgrid--lib">
        ${AGENT_TEMPLATES.map((t) => html`<button type="button" class="ag-tpl" style=${{ '--ag-c': t.color }} onClick=${() => createStandalone(agentFromTemplate(t))}>
          <span class="ag-tpl__icon"><${Icon} name=${t.icon} size=${16} /></span>
          <span class="ag-tpl__name">${t.name}</span>
          <span class="ag-tpl__role">${t.role}</span>
          <span class="row gap-4 mt-4">${(t.tools || []).map((x) => html`<${IntegrationTile} id=${x.id} size="sm" />`)}${t.approvals?.length ? html`<${Badge} size="sm" tone="amber" icon="shield">asks first<//>` : null}</span>
          <span class="ag-tpl__cta">Use template <${Icon} name="arrow-right" size=${12} /></span>
        </button>`)}
      </div>
    </section>
  <//>`;
}
