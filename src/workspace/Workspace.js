// Project workspace frame: top bar · chat dock · stage tabs · drawer rail · run bar.
// The most-used screen of the product — tabs and drawers are isolated so one broken
// part never takes the whole workspace down.
import { html, useEffect, useRef } from '../lib/html.js';
import { getProject, projectsReady, prefs, setPrefs } from '../lib/store.js';
import { route, setQuery } from '../lib/router.js';
import { cx } from '../lib/util.js';
import { IconButton, Button, Empty, Segmented, Menu, Skeleton, Tabs, openDrawer, closeDrawer, drawerStack, useHotkey } from '../ui/index.js';
import { isConnected } from '../shells/ConnectSheet.js';
import { panelRequest, composerFocus } from './bus.js';
import { Lazy, TabSkeleton } from './wsKit.js';
import { TopBar } from './TopBar.js';
import { ChatDock, dockPane } from './ChatDock.js';
import { RunBar } from './RunBar.js';
import { HistoryDrawer } from './drawers/HistoryDrawer.js';
import { ConnectionsDrawer } from './drawers/ConnectionsDrawer.js';
import { CommentsDrawer } from './drawers/CommentsDrawer.js';
import { LogsDrawer } from './drawers/LogsDrawer.js';

const TABS = [
  { id: 'plan', label: 'Plan', icon: 'clipboard-list', load: () => import('./tabs/PlanTab.js') },
  { id: 'app', label: 'App', icon: 'monitor', load: () => import('./tabs/AppTab.js') },
  { id: 'agents', label: 'Agents', icon: 'bot', load: () => import('./tabs/AgentsTab.js') },
  { id: 'data', label: 'Data', icon: 'database', load: () => import('./tabs/DataTab.js') },
  { id: 'code', label: 'Code', icon: 'code', load: () => import('./tabs/CodeTab.js') },
  { id: 'launch', label: 'Launch', icon: 'rocket', load: () => import('./tabs/LaunchTab.js') },
  { id: 'insights', label: 'Insights', icon: 'bar-chart', load: () => import('./tabs/InsightsTab.js') },
];
const TAB_IDS = new Set(TABS.map((t) => t.id));

export const PANELS = {
  history: { label: 'History', icon: 'history', C: HistoryDrawer },
  connections: { label: 'Connections & secrets', icon: 'plug', C: ConnectionsDrawer },
  comments: { label: 'Comments', icon: 'message-circle', C: CommentsDrawer },
  logs: { label: 'Logs', icon: 'terminal', C: LogsDrawer },
};
const keyOf = (name) => `ws-${name}`;

function parseReq(req) {
  if (!req) return {};
  if (typeof req === 'object') return { name: req.name || req.panel, section: req.section };
  const [name, section] = String(req).split(':');
  return { name, section };
}

/** Open a right-edge drawer (one at a time). req: 'history' | 'connections:secrets' | {name, section} */
export function openWsPanel(projectId, req) {
  const { name, section } = parseReq(req);
  const P = PANELS[name];
  if (!P) return;
  for (const k of Object.keys(PANELS)) if (k !== name) closeDrawer(keyOf(k));
  openDrawer(P.C, { projectId, section }, { key: keyOf(name) });
}
function togglePanel(projectId, name) {
  if (drawerStack.value.some((d) => d.opts?.key === keyOf(name))) closeDrawer(keyOf(name));
  else openWsPanel(projectId, name);
}

export function defaultTab(p) {
  return ['draft', 'planning', 'ready'].includes(p?.status) ? 'plan' : 'app';
}

function Rail({ project }) {
  const open = new Set(drawerStack.value.map((d) => d.opts?.key));
  const badges = {
    comments: (project.comments || []).filter((c) => !c.resolved).length,
    connections: (project.integrations || []).filter((i) => !isConnected(i.id, project)).length,
    logs: (project.build?.logs || []).filter((l) => l.level === 'error').length,
  };
  return html`<nav class="ws-rail" aria-label="Project panels">
    ${Object.entries(PANELS).map(([k, P]) => html`<${IconButton} icon=${P.icon} label=${P.label} tipPos="left" active=${open.has(keyOf(k))}
      badge=${badges[k] || 0} class=${cx('ws-rail__btn', k === 'connections' && badges[k] && 'is-amber', k === 'logs' && badges[k] && 'is-red')}
      onClick=${() => togglePanel(project.id, k)} />`)}
  </nav>`;
}

function StageTabs({ project, tab, collapsed, onExpand }) {
  const guided = prefs.value.experience === 'guided';
  const live = !!project.environments?.production || project.status === 'live';
  const tabs = TABS.map((t) => ({
    id: t.id, label: t.label, icon: t.icon, href: `/p/${project.id}/${t.id}`,
    hidden: t.id === 'code' && guided && tab !== 'code',
    count: t.id === 'agents' && project.agents.length ? project.agents.length : t.id === 'data' && project.data.tables.length ? project.data.tables.length : undefined,
    dot: t.id === 'launch' && live ? 'green' : undefined,
  }));
  const items = [
    guided && tab !== 'code' ? { label: 'Show code', icon: 'code', desc: 'Hidden in Guided mode', href: `/p/${project.id}/code` } : null,
    guided && tab !== 'code' ? { divider: true } : null,
    { section: 'Panels' },
    ...Object.entries(PANELS).map(([k, P]) => ({ label: P.label, icon: P.icon, onClick: () => openWsPanel(project.id, k) })),
    { divider: true },
    { label: collapsed ? 'Show chat' : 'Hide chat', icon: 'panel-left', hint: '⌃\\', onClick: () => setPrefs({ dockCollapsed: !collapsed }) },
  ];
  return html`<div class="ws-tabrow">
    ${collapsed ? html`<${IconButton} icon="panel-left" label="Show chat (Ctrl+\\)" size="sm" class="ws-tabrow__expand" onClick=${onExpand} />` : null}
    <${Tabs} tabs=${tabs} value=${tab} class="ws-tabs" />
    <${Menu} align="bottom-end" width=${240} items=${items}
      trigger=${(open, toggle) => html`<${IconButton} icon="more-horizontal" label="More" size="sm" active=${open} onClick=${toggle} class="ws-tabrow__more" />`} />
  </div>`;
}

function Frame({ children, cls }) {
  return html`<div class=${cx('ws', cls)}>${children}</div>`;
}

function WsSkeleton() {
  return html`<${Frame} cls="ws--loading">
    <header class="ws-top"><${Skeleton} w=${28} h=${28} r=${8} /><${Skeleton} w=${180} h=${16} /><span class="grow"></span><${Skeleton} w=${90} h=${30} r=${8} /></header>
    <div class="ws-body">
      <aside class="ws-dock"><div class="ws-dock__skel">${[70, 90, 55, 80].map((w) => html`<${Skeleton} w=${`${w}%`} h=${54} r=${12} />`)}</div></aside>
      <main class="ws-stage"><div class="ws-tabrow"><${Skeleton} w=${420} h=${18} /></div><div class="ws-stage__body"><${TabSkeleton} /></div></main>
    </div>
  <//>`;
}

export default function Workspace({ params }) {
  const ready = projectsReady.value;
  const p = getProject(params.id);
  const collapsed = !!prefs.value.dockCollapsed;
  const pane = dockPane.value;
  const setPane = (v) => { dockPane.value = v; };
  const q = route.value.query || {};
  const req = panelRequest.value;
  const focusTick = composerFocus.value;
  const firstTab = useRef(true);
  const tab = p ? (TAB_IDS.has(params.tab) ? params.tab : defaultTab(p)) : null;

  useHotkey('mod+\\', () => setPrefs({ dockCollapsed: !prefs.value.dockCollapsed }));
  useEffect(() => { if (req && p) { openWsPanel(p.id, req); panelRequest.value = null; } }, [req, p?.id]);
  useEffect(() => {
    // Drawers close on navigation, so clear the query first, then open.
    if (!q.panel || !p) return;
    const want = q.panel;
    setQuery({ panel: null });
    setTimeout(() => openWsPanel(p.id, want), 0);
  }, [q.panel, p?.id]);
  useEffect(() => () => { for (const k of Object.keys(PANELS)) closeDrawer(keyOf(k)); }, []);
  useEffect(() => { if (p?.name) document.title = `${p.name} · Architect`; }, [p?.name]);
  useEffect(() => { if (focusTick) { setPane('chat'); if (collapsed) setPrefs({ dockCollapsed: false }); } }, [focusTick]);
  useEffect(() => { if (firstTab.current) { firstTab.current = false; return; } setPane('stage'); }, [params.tab]);

  if (!ready) return html`<${WsSkeleton} />`;
  if (!p) {
    return html`<${Frame} cls="ws--missing"><div class="ws-missing">
      <${Empty} icon="search" title="Project not found" body="It may have been moved to trash, or this link belongs to someone else’s account."
        action=${html`<div class="row gap-8"><${Button} variant="primary" icon="arrow-left" href="/projects">Back to projects<//><${Button} href="/projects/trash" variant="ghost" icon="trash">Open trash<//></div>`} />
    </div><//>`;
  }
  const T = TABS.find((t) => t.id === tab);

  return html`<${Frame} cls=${cx(collapsed && 'is-collapsed', `is-pane-${pane}`)}>
    <${TopBar} project=${p} tab=${tab} />
    <div class="ws-body">
      <${ChatDock} project=${p} collapsed=${collapsed} onCollapse=${() => setPrefs({ dockCollapsed: true })} />
      <main class="ws-stage" aria-label=${`${T.label} tab`}>
        <${StageTabs} project=${p} tab=${tab} collapsed=${collapsed} onExpand=${() => setPrefs({ dockCollapsed: false })} />
        <div class=${cx('ws-stage__body', `ws-stage__body--${tab}`)}>
          <${Lazy} key=${tab} loader=${T.load} props=${{ project: p, params }} fallback=${html`<${TabSkeleton} />`} />
        </div>
      </main>
      <${Rail} project=${p} />
    </div>
    <${RunBar} project=${p} />
    <div class="ws-mobile-switch">
      <${Segmented} full value=${pane} onChange=${setPane} options=${[{ value: 'chat', label: 'Chat', icon: 'message-square' }, { value: 'stage', label: T.label === 'App' ? 'Preview' : T.label, icon: T.id === 'app' ? 'monitor' : T.icon }]} />
    </div>
  <//>`;
}
