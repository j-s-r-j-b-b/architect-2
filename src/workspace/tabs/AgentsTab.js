// Agents tab — /p/:id/agents (Map | List) and /p/:id/agents/:agentId/:tab (the agent itself).
import { html, useState, useRef, useEffect } from '../../lib/html.js';
import { route, navigate, setQuery } from '../../lib/router.js';
import { cx } from '../../lib/util.js';
import { askArchitect } from '../bus.js';
import { Button, Segmented, Tabs, Icon, Empty, IconButton, Menu, openDrawer, toast, confirmDialog } from '../../ui/index.js';
import { openConnectSheet } from '../../shells/ConnectSheet.js';
import { AgentsIndex } from '../agents/AgentsIndex.js';
import { AgentBuild } from '../agents/AgentBuild.js';
import { Playground, TryDrawer, AgentCode } from '../agents/AgentTry.js';
import { AgentTest, AgentEvaluate, AgentMonitor } from '../agents/AgentQuality.js';
import { AgentDeploy } from '../agents/AgentDeploy.js';
import { AgentAvatar, FrameworkBadge, VersionPill, EvalChip } from '../agents/ui.js';
import { openFrameworkPicker, openPublishAgent } from '../agents/dialogs.js';
import { effectiveAgent, stageEdit, stagedChanges, discardStaged, restoreStaged, getPatch, saveDraft, publishAgent, duplicateAgent, deleteAgent } from '../agents/state.js';

const SUBS = [
  { id: 'build', label: 'Build', icon: 'pencil' },
  { id: 'test', label: 'Test', icon: 'flask' },
  { id: 'evaluate', label: 'Evaluate', icon: 'bar-chart' },
  { id: 'monitor', label: 'Monitor', icon: 'activity' },
  { id: 'deploy', label: 'Deploy', icon: 'rocket' },
];

function SaveBar({ project, agent }) {
  const changes = stagedChanges(project, agent.id);
  if (!changes.length) return null;
  const discard = () => {
    const patch = getPatch(project.id, agent.id);
    discardStaged(project.id, agent.id);
    toast('Discarded your changes', { action: { label: 'Undo', onClick: () => restoreStaged(project.id, agent.id, patch) } });
  };
  return html`<div class="ag-savebar anim-rise" role="region" aria-label="Unsaved changes">
    <span class="ag-savebar__dot"></span>
    <div class="grow" style="min-width:0">
      <div class="t-strong t-sm">${changes.length} unsaved change${changes.length > 1 ? 's' : ''}</div>
      <div class="ag-savebar__list">${changes.slice(0, 4).map((c) => html`<span class="ag-savebar__chg"><b>${c.op}</b>${c.label}</span>`)}${changes.length > 4 ? html`<span class="t-faint">+${changes.length - 4} more</span>` : null}</div>
    </div>
    <${Button} size="sm" variant="ghost" onClick=${discard}>Discard<//>
    <${Button} size="sm" variant="ink" icon="check" onClick=${() => saveDraft(project.id, agent.id)}>Save as draft v${(agent.version || 1) + 1}<//>
  </div>`;
}

function AgentDetail({ project, agent, sub }) {
  const pid = project.id;
  const base = `/p/${pid}/agents/${agent.id}`;
  const view = sub === 'build' && (route.value.query.view === 'code' || (!route.value.query.view && agent.startView === 'code')) ? 'code' : 'card';
  const tryRef = useRef(null);
  const [name, setName] = useState(agent.name);
  useEffect(() => { setName(agent.name); }, [agent.id, agent.name]);

  const tryIt = () => {
    const el = tryRef.current;
    if (el && el.offsetParent !== null) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); el.focus(); return; }
    openDrawer(TryDrawer, { projectId: pid, agentId: agent.id }, { key: 'agent-try' });
  };
  const publish = () => openPublishAgent({
    project, agent, changes: stagedChanges(project, agent.id),
    onConnect: (id) => openConnectSheet(id, { projectId: pid }),
    onConfirm: () => {
      const v = publishAgent(pid, agent.id);
      if (v) toast(`${agent.name} v${v} is live`, { tone: 'success', action: { label: 'Deploy options', onClick: () => navigate(`${base}/deploy`) } });
    },
  });
  const pickFramework = () => openFrameworkPicker({
    current: agent.framework,
    onPick: (fw) => { if (fw !== agent.framework) { stageEdit(pid, agent.id, (d) => { d.framework = fw; }); toast('Framework changed — save to keep it', { tone: 'success' }); } },
  });
  const rename = (v) => { const n = v.trim(); if (n && n !== agent.name) stageEdit(pid, agent.id, (d) => { d.name = n; }); else setName(agent.name); };
  const remove = async () => {
    if (!(await confirmDialog({ title: `Delete ${agent.name}?`, body: 'A checkpoint is saved first, so you can bring it back from History.', confirmLabel: 'Delete agent', danger: true }))) return;
    deleteAgent(pid, agent.id);
    navigate(`/p/${pid}/agents`);
    toast(`Deleted ${agent.name}`, { tone: 'success' });
  };

  let body;
  if (sub === 'build') {
    body = view === 'code' ? html`<${AgentCode} project=${project} agent=${agent} />`
      : html`<div class="ag-split"><div class="ag-split__main"><${AgentBuild} project=${project} agent=${agent} /></div><aside class="ag-split__side"><${Playground} project=${project} agent=${agent} inputRef=${tryRef} /></aside></div>`;
  } else if (sub === 'test') body = html`<${AgentTest} project=${project} agent=${agent} />`;
  else if (sub === 'evaluate') body = html`<${AgentEvaluate} project=${project} agent=${agent} />`;
  else if (sub === 'monitor') body = html`<${AgentMonitor} project=${project} agent=${agent} onTry=${tryIt} />`;
  else body = html`<${AgentDeploy} project=${project} agent=${agent} onPublish=${publish} />`;

  return html`<div class="ag-root ag-root--detail">
    <header class="ag-dhead" style=${{ '--ag-c': agent.color }}>
      <a class="ag-back" href=${`/p/${pid}/agents`} aria-label="All agents" data-tip="All agents"><${Icon} name="arrow-left" size=${16} /></a>
      <${AgentAvatar} agent=${agent} size="lg" />
      <div class="grow ag-dhead__id">
        <input class="ag-dhead__name" value=${name} aria-label="Agent name" onInput=${(e) => setName(e.currentTarget.value)} onBlur=${(e) => rename(e.currentTarget.value)} onKeyDown=${(e) => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') { setName(agent.name); e.currentTarget.blur(); } }} />
        <div class="ag-dhead__meta">
          <span class="ag-dhead__role">${agent.kind === 'manager' ? 'Manager · ' : ''}${agent.role || 'No description yet'}</span>
          <${FrameworkBadge} id=${agent.framework} size="sm" onClick=${pickFramework} />
          <${VersionPill} agent=${agent} size="sm" />
          <${EvalChip} score=${agent.evalScore} />
        </div>
      </div>
      <div class="ag-dhead__actions">
        ${sub === 'build' ? html`<${Segmented} size="sm" value=${view} onChange=${(v) => setQuery({ view: v === 'code' ? 'code' : agent.startView === 'code' ? 'card' : null })} options=${[{ value: 'card', label: 'Card', icon: 'list-checks', tip: 'Plain-language card' }, { value: 'code', label: 'Code', icon: 'code', tip: 'Generated framework code' }]} />` : null}
        <${Button} size="sm" variant="secondary" icon="play" onClick=${tryIt}>Try it<//>
        <${Button} size="sm" variant="primary" icon="rocket" onClick=${publish}>Publish agent<//>
        <${Menu} width=${210} items=${[
          { label: 'Duplicate', icon: 'copy', onClick: () => { const c = duplicateAgent(pid, agent.id); if (c) { toast(`Duplicated as ${c.name}`, { tone: 'success' }); navigate(`/p/${pid}/agents/${c.id}/build`); } } },
          { label: 'Change framework…', icon: 'code', onClick: pickFramework },
          { label: 'Ask Architect about it', icon: 'sparkles', onClick: () => askArchitect(`Help me improve the ${agent.name} agent`, { agentId: agent.id }) },
          { divider: true },
          { label: 'Delete agent…', icon: 'trash', danger: true, onClick: remove },
        ]} trigger=${(o, t) => html`<${IconButton} icon="more-horizontal" label="More" size="sm" onClick=${t} active=${o} />`} />
      </div>
    </header>
    <nav class="ag-subnav"><${Tabs} value=${sub} tabs=${SUBS.map((s) => ({ id: s.id, label: s.label, icon: s.icon, href: `${base}/${s.id}` }))} /></nav>
    <div class=${cx('ag-body', `ag-body--${sub}`)} key=${sub + view}>${body}</div>
    <${SaveBar} project=${project} agent=${agent} />
  </div>`;
}

export default function AgentsTab({ project, params = {} }) {
  const aid = params.a || params.agentId;
  const sub = SUBS.some((s) => s.id === (params.b || params.sub)) ? (params.b || params.sub) : 'build';
  if (!project) return null;
  if (aid) {
    const agent = effectiveAgent(project, aid);
    if (!agent) return html`<div class="ag-root"><${Empty} icon="bot" title="This agent isn’t here" body="It may have been deleted — restore it from History, or pick another agent." action=${html`<${Button} variant="primary" href=${`/p/${project.id}/agents`} icon="arrow-left">All agents<//>`} /></div>`;
    return html`<${AgentDetail} key=${aid} project=${project} agent=${agent} sub=${sub} />`;
  }
  return html`<${AgentsIndex} project=${project} />`;
}
