// Projects: search, sort, grid with actions; Trash with restore / delete forever.
import { html, useState } from '../../lib/html.js';
import { AppPage } from '../../shells/AppShell.js';
import { projectList, trashedProjects, projectsReady, duplicateProject, trashProject, restoreProject, deleteProjectForever } from '../../lib/store.js';
import { navigate } from '../../lib/router.js';
import { PageHeader, Button, Input, Select, Tabs, Empty, Skeleton, toast, confirmDialog, Icon, StatusPill } from '../../ui/index.js';
import { timeAgo, plural } from '../../lib/util.js';
import { AppThumbnail } from '../../genapp/Renderer.js';
import { ProjectCard, projectHref } from './parts/common.js';

const SORTS = [{ value: 'edited', label: 'Last edited' }, { value: 'created', label: 'Newest' }, { value: 'name', label: 'Name A–Z' }, { value: 'status', label: 'Status' }];
const STATUS_ORDER = ['live', 'building', 'built', 'ready', 'planning', 'draft'];

function Trash() {
  const items = [...trashedProjects.value].sort((a, b) => b.deletedAt - a.deletedAt);
  if (!items.length) return html`<${Empty} icon="trash" title="Trash is empty" body="Projects you move to trash stay here for 30 days before they’re removed." />`;
  return html`<div class="ap-list">
    ${items.map((p) => html`<div class="ap-list__row">
      <div class="ap-list__thumb"><${AppThumbnail} project=${p} width=${96} /></div>
      <div class="grow col gap-2" style="min-width:0"><span class="t-strong t-truncate">${p.name}</span><span class="t-xs t-faint">Moved to trash ${timeAgo(p.deletedAt)} · removed in ${Math.max(0, 30 - Math.floor((Date.now() - p.deletedAt) / 864e5))} days</span></div>
      <${Button} size="sm" icon="undo" onClick=${() => { restoreProject(p.id); toast(`${p.name} restored`, { tone: 'success', action: { label: 'Open', onClick: () => navigate(projectHref(p)) } }); }}>Restore<//>
      <${Button} size="sm" variant="ghost" icon="trash" class="t-red" onClick=${async () => {
        if (await confirmDialog({ title: `Delete “${p.name}” forever?`, body: 'This removes the project, its checkpoints and history. Live deployments stop. This can’t be undone.', confirmLabel: 'Delete forever', danger: true })) { await deleteProjectForever(p.id); toast('Deleted forever'); }
      }}>Delete forever<//>
    </div>`)}
  </div>`;
}

export default function Projects({ params }) {
  const view = params?.view === 'trash' ? 'trash' : 'all';
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('edited');
  const [status, setStatus] = useState('any');
  let list = projectList.value.filter((p) => (!q || `${p.name} ${p.description || ''} ${p.prompt || ''}`.toLowerCase().includes(q.toLowerCase())) && (status === 'any' || p.status === status));
  list = [...list].sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'created' ? b.createdAt - a.createdAt : sort === 'status' ? STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) : b.updatedAt - a.updatedAt);

  const menu = (p) => [
    { label: 'Open', icon: 'arrow-up-right', onClick: () => navigate(projectHref(p)) },
    { label: 'Duplicate', icon: 'copy', onClick: () => { const c = duplicateProject(p.id); if (c) toast(`Duplicated as “${c.name}”`, { tone: 'success', action: { label: 'Open', onClick: () => navigate(projectHref(c)) } }); } },
    p.status === 'live' ? { label: 'Open live app', icon: 'globe', href: `/a/${p.slug}`, external: true } : null,
    { divider: true },
    { label: 'Move to trash', icon: 'trash', danger: true, onClick: () => { trashProject(p.id); toast(`Moved “${p.name}” to trash`, { action: { label: 'Undo', onClick: () => restoreProject(p.id) } }); } },
  ];

  return html`<${AppPage}>
    <${PageHeader} title="Projects" subtitle=${view === 'trash' ? 'Restore a project or delete it for good.' : `${plural(projectList.value.length, 'app')} you’re building or running.`}
      actions=${html`<${Button} icon="upload" href="/start/import">Import<//><${Button} variant="primary" icon="plus" href="/start">New project<//>`} />
    <${Tabs} tabs=${[{ id: 'all', label: 'All projects', href: '/projects', count: projectList.value.length }, { id: 'trash', label: 'Trash', icon: 'trash', href: '/projects/trash', count: trashedProjects.value.length || null }]} value=${view} class="mb-16" />
    ${view === 'trash' ? html`<${Trash} />` : html`
      <div class="ap-toolbar">
        <div class="grow" style="min-width:200px"><${Input} icon="search" placeholder="Search projects" value=${q} onValue=${setQ} /></div>
        <${Select} options=${[{ value: 'any', label: 'Any status' }, ...STATUS_ORDER.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))]} value=${status} onValue=${setStatus} />
        <${Select} options=${SORTS} value=${sort} onValue=${setSort} />
      </div>
      ${!projectsReady.value ? html`<div class="ap-grid-3">${[0, 1, 2].map(() => html`<${Skeleton} h=${220} r=${12} />`)}</div>`
        : list.length ? html`<div class="ap-grid-3">${list.map((p) => html`<${ProjectCard} project=${p} menu=${menu(p)} />`)}</div>`
          : projectList.value.length ? html`<${Empty} icon="search" title="No projects match" body="Try a different search or status." action=${html`<${Button} size="sm" onClick=${() => { setQ(''); setStatus('any'); }}>Clear filters<//>`} />`
            : html`<${Empty} icon="folder" title="Your first app is one sentence away" body="Describe what you need. Planning and quotes are free." action=${html`<${Button} variant="primary" icon="sparkles" href="/start">Start building<//>`} />`}
    `}
  <//>`;
}
