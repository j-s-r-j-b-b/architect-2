// History: one timeline of checkpoints, deployments and commits. Restore never deletes anything.
import { html, useState } from '../../lib/html.js';
import { projects, getProject, restoreCheckpoint, addChat, logActivity } from '../../lib/store.js';
import { Drawer, Modal, openModal, Button, Icon, Badge, Segmented, Checkbox, Callout, Empty, toast } from '../../ui/index.js';
import { cx, timeAgo, fmtDate, fmtTime, fmtNumber } from '../../lib/util.js';
import { themePreset } from '../../engine/catalog.js';
import { isActive } from '../../engine/simulate.js';
import { Lazy } from '../wsKit.js';

const rendererLoader = () => import('../../genapp/Renderer.js');

const KIND = {
  plan: { icon: 'clipboard-list', tone: 'blueprint', label: 'Plan' },
  build: { icon: 'blocks', tone: 'green', label: 'Build' },
  edit: { icon: 'pencil', tone: 'neutral', label: 'Edit' },
  fix: { icon: 'stethoscope', tone: 'neutral', label: 'Fix' },
  safety: { icon: 'shield', tone: 'grey', label: 'Safety' },
  restore: { icon: 'rotate-ccw', tone: 'neutral', label: 'Restore' },
  deploy: { icon: 'rocket', tone: 'green', label: 'Deploy' },
  commit: { icon: 'git-commit', tone: 'neutral', label: 'Commit' },
};

const PARTS = [
  { id: 'app', label: 'Screens, components & theme', keys: ['screens', 'theme', 'name'] },
  { id: 'agents', label: 'Agents', keys: ['agents'] },
  { id: 'data', label: 'Data tables & rows', keys: ['data'] },
  { id: 'plan', label: 'Plan & promises', keys: ['plan'] },
  { id: 'conn', label: 'Connections list & environment variables', keys: ['integrations', 'env'] },
];

function snapshotProject(p, cp) { return { ...p, ...(cp?.snapshot || {}) }; }

/** Plain-language differences between a checkpoint and the current project. */
export function diffSummary(p, cp) {
  const s = cp?.snapshot || {};
  const out = [];
  if (s.name && s.name !== p.name) out.push(`Name: “${s.name}” → “${p.name}”`);
  if (s.theme && (s.theme.primary !== p.theme.primary || s.theme.preset !== p.theme.preset)) out.push(`Theme: ${themePreset(s.theme.preset).name} → ${themePreset(p.theme.preset).name}`);
  const blocks = (x) => (x || []).reduce((a, sc) => a + (sc.blocks?.length || 0), 0);
  if (s.screens) {
    if (s.screens.length !== p.screens.length) out.push(`Screens: ${s.screens.length} → ${p.screens.length}`);
    if (blocks(s.screens) !== blocks(p.screens)) out.push(`Components: ${blocks(s.screens)} → ${blocks(p.screens)}`);
    const wire = (x) => (x || []).reduce((a, sc) => a + sc.blocks.filter((b) => b.buildState === 'pending').length, 0);
    if (wire(s.screens) && !wire(p.screens)) out.push(`${wire(s.screens)} parts were still wireframes then`);
  }
  if (s.agents) {
    const a = new Set(s.agents.map((x) => x.name)), b = new Set(p.agents.map((x) => x.name));
    const added = [...b].filter((x) => !a.has(x)), removed = [...a].filter((x) => !b.has(x));
    if (added.length) out.push(`Agents added since: ${added.join(', ')}`);
    if (removed.length) out.push(`Agents removed since: ${removed.join(', ')}`);
  }
  if (s.data) {
    const rows = (x) => (x?.tables || []).reduce((a, t) => a + (t.rows?.length || 0), 0);
    if ((s.data.tables || []).length !== p.data.tables.length) out.push(`Tables: ${(s.data.tables || []).length} → ${p.data.tables.length}`);
    else if (rows(s.data) !== rows(p.data)) out.push(`Rows: ${rows(s.data)} → ${rows(p.data)}`);
  }
  if (s.plan) {
    const v = (pl) => (pl?.promises || []).filter((x) => x.status === 'verified' || x.status === 'live').length;
    if (v(s.plan) !== v(p.plan)) out.push(`Verified promises: ${v(s.plan)} → ${v(p.plan)}`);
    if ((s.plan.promises || []).length !== (p.plan.promises || []).length) out.push(`Promises: ${(s.plan.promises || []).length} → ${p.plan.promises.length}`);
  }
  return out;
}

function RestoreDialog({ close, projectId, cpId }) {
  const p = projects.value[projectId];
  const cp = p?.checkpoints.find((c) => c.id === cpId);
  const [parts, setParts] = useState(() => Object.fromEntries(PARTS.map((x) => [x.id, true])));
  if (!p || !cp) return null;
  const nextN = (p.checkpoints[0]?.n || 0) + 1;
  const diffs = diffSummary(p, cp);
  const chosen = PARTS.filter((x) => parts[x.id]);
  const busy = isActive(p);
  const go = () => {
    const keys = chosen.flatMap((x) => x.keys);
    if (!keys.length) return;
    restoreCheckpoint(projectId, cp.id, { parts: keys });
    const safety = getProject(projectId).checkpoints.find((c) => c.kind === 'safety');
    addChat(projectId, { type: 'checkpoint', data: { checkpointId: cp.id, label: cp.label, restored: true, n: cp.n } });
    logActivity(projectId, { actor: 'You', kind: 'restore', plain: `Restored checkpoint #${cp.n} (“${cp.label}”)${chosen.length < PARTS.length ? ` — ${chosen.map((x) => x.label.toLowerCase()).join(', ')} only` : ''}.`, technical: `restoreCheckpoint(${cp.id}, parts=[${keys.join(', ')}]) · safety #${safety?.n}` });
    toast(`Restored #${cp.n}`, { tone: 'success', action: safety ? { label: 'Undo', onClick: () => restoreCheckpoint(projectId, safety.id) } : undefined });
    close(true);
  };
  return html`<${Modal} title=${`Restore checkpoint #${cp.n}?`} subtitle=${`“${cp.label}” · ${fmtDate(cp.at)} ${fmtTime(cp.at)}`} icon="rotate-ccw" onClose=${() => close(false)}
    footer=${html`<${Button} variant="ghost" onClick=${() => close(false)}>Cancel<//><${Button} variant="primary" icon="rotate-ccw" disabled=${!chosen.length || busy} onClick=${go}>Restore #${cp.n}<//>`}>
    <div class="col gap-16">
      <${Callout} tone="green" icon="shield-check"><b>Nothing is deleted.</b> A safety checkpoint (#${nextN}) of how things are right now is created first, so you can always come back.<//>
      <div>
        <div class="ws-dlg__label">What goes back to how it was</div>
        <div class="ws-dlg__checks">${PARTS.map((x) => html`<${Checkbox} checked=${parts[x.id]} onChange=${(v) => setParts({ ...parts, [x.id]: v })} label=${x.label} />`)}</div>
      </div>
      ${diffs.length ? html`<div><div class="ws-dlg__label">Differences from now</div><ul class="ws-bullets">${diffs.map((d) => html`<li>${d}</li>`)}</ul></div>` : html`<p class="t-sm t-muted">This checkpoint matches your current project.</p>`}
      <div><div class="ws-dlg__label">What stays as it is</div><p class="t-sm t-muted">Chat and comments, deployments (your live app doesn’t change until you publish again) and credits already spent.</p></div>
      ${busy ? html`<${Callout} tone="amber" icon="pause">A run is in progress — pause or stop it first.<//>` : null}
    </div>
  <//>`;
}
export function openRestoreDialog(projectId, cpId) { return openModal(RestoreDialog, { projectId, cpId }); }

function CompareDialog({ close, projectId, cpId }) {
  const p = projects.value[projectId];
  const cp = p?.checkpoints.find((c) => c.id === cpId);
  if (!p || !cp) return null;
  const diffs = diffSummary(p, cp);
  return html`<${Modal} size="lg" title=${`Compare #${cp.n} with now`} subtitle=${cp.label} icon="columns" onClose=${() => close()}
    footer=${html`<${Button} variant="ghost" onClick=${() => close()}>Close<//><${Button} variant="primary" icon="rotate-ccw" onClick=${() => { close(); openRestoreDialog(projectId, cpId); }}>Restore #${cp.n}…<//>`}>
    <div class="ws-compare">
      <figure><figcaption><${Badge} size="sm">#${cp.n} · ${timeAgo(cp.at)}<//></figcaption><div class="ws-compare__thumb"><${Lazy} loader=${rendererLoader} pick="AppThumbnail" props=${{ project: snapshotProject(p, cp) }} /></div></figure>
      <figure><figcaption><${Badge} size="sm" tone="blueprint">Now · Draft<//></figcaption><div class="ws-compare__thumb"><${Lazy} loader=${rendererLoader} pick="AppThumbnail" props=${{ project: p }} /></div></figure>
    </div>
    <div class="ws-dlg__label mt-16">What’s different</div>
    ${diffs.length ? html`<ul class="ws-bullets">${diffs.map((d) => html`<li>${d}</li>`)}</ul>` : html`<p class="t-sm t-muted">No differences in screens, agents, data or plan.</p>`}
  <//>`;
}

function TryDraftDialog({ close, projectId, cpId }) {
  const p = projects.value[projectId];
  const cp = p?.checkpoints.find((c) => c.id === cpId);
  if (!p || !cp) return null;
  return html`<${Modal} title=${`Try #${cp.n} on a draft`} subtitle="Test an old version without touching your current work" icon="git-branch" onClose=${() => close()}
    footer=${html`<${Button} variant="ghost" onClick=${() => close()}>Close<//><${Button} variant="secondary" icon="rotate-ccw" onClick=${() => { close(); openRestoreDialog(projectId, cpId); }}>Restore instead…<//>`}>
    <div class="col gap-12">
      <${Callout} tone="amber" icon="flask"><b>Prototype: simulated.</b> In the full product this opens #${cp.n} as a separate draft branch with its own preview link.<//>
      <div class="ws-compare__thumb"><${Lazy} loader=${rendererLoader} pick="AppThumbnail" props=${{ project: snapshotProject(p, cp) }} /></div>
      <p class="t-sm t-muted">Your current draft keeps every change. When you’re happy with the old version, restore it — a safety checkpoint is created first.</p>
    </div>
  <//>`;
}

function commitsOf(p) {
  const g = p.github || {};
  const list = [...(g.commits || [])];
  if (!list.length && g.lastPush) list.push({ sha: (g.lastPush.sha || 'a1b2c3d').slice(0, 7), message: g.lastPush.message || 'Update from Architect', at: g.lastPush.at || g.lastPush, branch: g.branch });
  return list.map((c) => ({ ...c, at: typeof c.at === 'number' ? c.at : new Date(c.at || Date.now()).getTime() }));
}

export function HistoryDrawer({ close, projectId }) {
  const p = projects.value[projectId];
  const [filter, setFilter] = useState('all');
  if (!p) return null;
  const busy = isActive(p);
  const events = [
    ...p.checkpoints.map((c) => ({ type: 'cp', at: c.at, c })),
    ...(p.deployments || []).map((d) => ({ type: 'deploy', at: d.at || d.createdAt || d.startedAt || 0, d })),
    ...commitsOf(p).map((c) => ({ type: 'commit', at: c.at, c })),
  ].filter((e) => filter === 'all' || (filter === 'cp' ? e.type === 'cp' : filter === 'deploy' ? e.type === 'deploy' : e.type === 'commit'))
    .sort((a, b) => b.at - a.at);
  const draftV = p.environments?.draft?.version || 0;

  return html`<${Drawer} title="History" icon="history" onClose=${close}>
    <div class="ws-hist">
      <p class="t-sm t-muted">Every change saves a checkpoint. Restore any of them — nothing is ever deleted.</p>
      <${Segmented} size="sm" full value=${filter} onChange=${setFilter} options=${[{ value: 'all', label: 'All' }, { value: 'cp', label: 'Checkpoints' }, { value: 'deploy', label: 'Deploys' }, { value: 'commit', label: 'Commits' }]} />
      <ol class="ws-timeline">
        <li class="ws-tl is-now">
          <span class="ws-tl__node ws-tl__node--blueprint"><${Icon} name="pencil" size=${12} /></span>
          <div class="ws-tl__main"><div class="ws-tl__title">Now · Draft${draftV ? ` v${draftV}` : ''}</div><div class="ws-tl__meta">${busy ? 'A run is in progress' : 'What you’re editing'}</div></div>
        </li>
        ${events.map((e) => {
          if (e.type === 'cp') {
            const k = KIND[e.c.kind] || KIND.edit;
            return html`<li class="ws-tl">
              <span class=${cx('ws-tl__node', `ws-tl__node--${k.tone}`)}><${Icon} name=${k.icon} size=${12} /></span>
              <div class="ws-tl__main">
                <div class="ws-tl__title"><span class="ws-tl__n">#${e.c.n}</span>${e.c.label}</div>
                <div class="ws-tl__meta">${k.label} · ${timeAgo(e.c.at)}${e.c.summary ? ` · ${e.c.summary}` : ''}</div>
                <div class="ws-tl__actions">
                  <button type="button" class="ws-linkbtn" disabled=${busy} onClick=${() => openRestoreDialog(projectId, e.c.id)}><${Icon} name="rotate-ccw" size=${12} />Restore</button>
                  <button type="button" class="ws-linkbtn" onClick=${() => openModal(CompareDialog, { projectId, cpId: e.c.id })}><${Icon} name="columns" size=${12} />Compare</button>
                  <button type="button" class="ws-linkbtn" onClick=${() => openModal(TryDraftDialog, { projectId, cpId: e.c.id })}><${Icon} name="git-branch" size=${12} />Try on a draft</button>
                </div>
              </div>
            </li>`;
          }
          if (e.type === 'deploy') {
            const d = e.d;
            return html`<li class="ws-tl">
              <span class="ws-tl__node ws-tl__node--green"><${Icon} name="rocket" size=${12} /></span>
              <div class="ws-tl__main"><div class="ws-tl__title">Published${d.env ? ` to ${d.env[0].toUpperCase() + d.env.slice(1)}` : ''}${d.version ? ` · v${d.version}` : ''}</div>
                <div class="ws-tl__meta">${timeAgo(e.at)}${d.by ? ` · ${d.by}` : ''}${d.url ? html` · <a class="link" href=${d.url} target="_blank" rel="noopener">${d.url.replace(/^https?:\/\//, '')}</a>` : ''}</div></div>
            </li>`;
          }
          return html`<li class="ws-tl">
            <span class="ws-tl__node"><${Icon} name="git-commit" size=${12} /></span>
            <div class="ws-tl__main"><div class="ws-tl__title">${e.c.message || 'Commit'}</div><div class="ws-tl__meta t-mono">${e.c.sha || ''}${e.c.branch ? ` · ${e.c.branch}` : ''} · ${timeAgo(e.at)}</div></div>
          </li>`;
        })}
      </ol>
      ${!events.length ? html`<${Empty} icon="history" title=${filter === 'deploy' ? 'No deploys yet' : filter === 'commit' ? 'No commits yet' : 'No checkpoints yet'} body=${filter === 'deploy' ? 'Publish from the top bar — each deploy shows up here.' : filter === 'commit' ? 'Connect GitHub to push your code; commits show up here.' : 'Checkpoints are saved automatically when the plan is ready and after every change.'} />` : null}
    </div>
  <//>`;
}

export { fmtNumber as _fmt };
