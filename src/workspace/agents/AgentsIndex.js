// Agents index (/p/:id/agents): header, Map (Screens → Agents → Tools & knowledge) and List views.
import { html, useState, useEffect, useRef, useMemo } from '../../lib/html.js';
import { route, navigate, setQuery } from '../../lib/router.js';
import { cx, fmtNumber, plural } from '../../lib/util.js';
import { connections } from '../../lib/store.js';
import { Button, Badge, Segmented, Icon, Empty, Menu, IconButton, toast, confirmDialog } from '../../ui/index.js';
import { integrationById } from '../../engine/catalog.js';
import { usagesOf } from '../../engine/schema.js';
import { IntegrationTile, openConnectSheet } from '../../shells/ConnectSheet.js';
import { AgentAvatar, FrameworkBadge, VersionPill, TierLabel, EvalChip } from './ui.js';
import { NewAgentMenu } from './dialogs.js';
import { addAgent, duplicateAgent, deleteAgent, effectiveAgent, hasStaged } from './state.js';
import { normalizeAgent, triggerType, toolConnection, fmtUsd } from './model.js';

const KNOW_ICON = { file: 'file-text', url: 'globe', table: 'table', text: 'sticky-note' };
const kKey = (k) => `k:${k.type}:${k.name}`;

export function createAgentIn(project, spec, { delegateFrom, view } = {}) {
  const a = addAgent(project.id, spec, { delegateFrom });
  toast(`${a.name} added as a draft`, { tone: 'success' });
  navigate(`/p/${project.id}/agents/${a.id}/build${view === 'code' ? '?view=code' : ''}`);
  return a;
}

/** Managers first, each followed by its workers; then everyone else. */
function orderAgents(agents) {
  const out = []; const seen = new Set();
  const push = (a, depth) => { if (!a || seen.has(a.id)) return; seen.add(a.id); out.push({ a, depth }); };
  for (const m of agents.filter((a) => a.kind === 'manager')) {
    push(m, 0);
    for (const id of m.delegatesTo || []) push(agents.find((x) => x.id === id), 1);
  }
  for (const a of agents) push(a, 0);
  return out;
}

function useEdgePaths(ref, edges, key) {
  const [paths, setPaths] = useState([]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => {
      const box = el.getBoundingClientRect();
      const find = (k) => el.querySelector(`[data-node="${CSS.escape(k)}"]`);
      const out = [];
      for (const e of edges) {
        const a = find(e.from), b = find(e.to);
        if (!a || !b) continue;
        const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        if (!ra.width || !rb.width) continue;
        let d;
        if (e.kind === 'delegate') {
          const x = ra.left - box.left + 18, y1 = ra.bottom - box.top, y2 = rb.top - box.top + rb.height / 2, x2 = rb.left - box.left;
          d = `M${x} ${y1} L${x} ${y2 - 8} Q${x} ${y2} ${x + 8} ${y2} L${x2} ${y2}`;
        } else {
          const x1 = ra.right - box.left, y1 = ra.top - box.top + ra.height / 2, x2 = rb.left - box.left, y2 = rb.top - box.top + rb.height / 2;
          const mx = (x1 + x2) / 2;
          d = `M${x1} ${y1} C${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
        }
        out.push({ ...e, d });
      }
      setPaths((p) => (JSON.stringify(p) === JSON.stringify(out) ? p : out));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [key]);
  return paths;
}

function AgentMap({ project, agents }) {
  const ref = useRef(null);
  const [hover, setHover] = useState(null);
  const ordered = orderAgents(agents);
  const { screens, tools, know, edges } = useMemo(() => {
    const edges = []; const tools = new Map(); const know = new Map(); const screenIds = new Set();
    for (const a of agents) {
      const used = new Set([...(a.usedBy || []), ...usagesOf(project, { agent: a.id }).map((u) => u.screen.id)]);
      for (const sid of used) { screenIds.add(sid); edges.push({ from: `s:${sid}`, to: `a:${a.id}`, kind: 'screen' }); }
      for (const d of a.delegatesTo || []) if (agents.some((x) => x.id === d)) edges.push({ from: `a:${a.id}`, to: `a:${d}`, kind: 'delegate' });
      for (const t of a.tools || []) { tools.set(t.id, t); edges.push({ from: `a:${a.id}`, to: `t:${t.id}`, kind: 'tool' }); }
      for (const k of a.knowledge || []) { know.set(kKey(k), k); edges.push({ from: `a:${a.id}`, to: kKey(k), kind: 'know' }); }
    }
    const screens = (project.screens || []).filter((s) => screenIds.has(s.id));
    return { screens, tools: [...tools.values()], know: [...know.entries()], edges };
  }, [project, agents]);
  const paths = useEdgePaths(ref, edges, JSON.stringify(edges) + agents.length);
  const related = useMemo(() => {
    if (!hover) return null;
    const s = new Set([hover]);
    for (const e of edges) { if (e.from === hover) s.add(e.to); if (e.to === hover) s.add(e.from); }
    return s;
  }, [hover, edges]);
  const dim = (k) => related && !related.has(k);
  const hov = (k) => ({ onMouseEnter: () => setHover(k), onMouseLeave: () => setHover(null), onFocus: () => setHover(k), onBlur: () => setHover(null) });

  return html`<div class="ag-map" ref=${ref}>
    <svg class="ag-map__lines" aria-hidden="true">
      ${paths.map((p) => html`<path d=${p.d} class=${cx('ag-map__edge', `is-${p.kind}`, related && (related.has(p.from) && related.has(p.to) && (p.from === hover || p.to === hover) ? 'is-hot' : 'is-dim'))} />`)}
    </svg>
    <div class="ag-map__col">
      <div class="ag-map__colhead"><${Icon} name="monitor" size=${13} />Screens<span class="t-faint">${screens.length}</span></div>
      ${screens.length ? screens.map((s) => html`<a class=${cx('ag-node ag-node--screen', dim(`s:${s.id}`) && 'is-dim')} data-node=${`s:${s.id}`} href=${`/p/${project.id}/app?route=${encodeURIComponent(s.route || '/')}`} ...${hov(`s:${s.id}`)}>
        <span class="ag-node__ico"><${Icon} name="monitor" size=${14} /></span>
        <span class="grow ag-node__txt"><span class="ag-node__name">${s.name}</span><span class="ag-node__sub t-mono">${s.route}</span></span>
      </a>`) : html`<div class="ag-map__none">No screen uses an agent yet — add an agent chat block from the App tab.</div>`}
    </div>
    <div class="ag-map__col ag-map__col--agents">
      <div class="ag-map__colhead"><${Icon} name="bot" size=${13} />Agents<span class="t-faint">${agents.length}</span></div>
      ${ordered.map(({ a, depth }) => html`<button type="button" class=${cx('ag-node ag-node--agent', depth && 'is-worker', a.kind === 'manager' && 'is-manager', dim(`a:${a.id}`) && 'is-dim', hover === `a:${a.id}` && 'is-hover')} style=${{ '--ag-c': a.color }} data-node=${`a:${a.id}`}
        onClick=${() => navigate(`/p/${project.id}/agents/${a.id}/build`)} ...${hov(`a:${a.id}`)}>
        <div class="row gap-8"><${AgentAvatar} agent=${a} size="sm" /><span class="grow ag-node__txt"><span class="ag-node__name">${a.name}</span><span class="ag-node__sub">${a.kind === 'manager' ? 'Manager' : a.role}</span></span><${VersionPill} agent=${a} size="sm" /></div>
        ${a.triggers?.length ? html`<div class="ag-node__trigs">${a.triggers.slice(0, 3).map((t) => html`<span class="ag-trig"><${Icon} name=${triggerType(t.type).icon} size=${11} />${t.detail || triggerType(t.type).label}</span>`)}</div>` : null}
      </button>`)}
    </div>
    <div class="ag-map__col">
      <div class="ag-map__colhead"><${Icon} name="plug" size=${13} />Tools & knowledge<span class="t-faint">${tools.length + know.length}</span></div>
      ${tools.map((t) => {
        const need = !t.mcp && toolConnection(project, t.id, connections.value) === 'needed';
        return html`<button type="button" class=${cx('ag-node ag-node--tool', dim(`t:${t.id}`) && 'is-dim')} data-node=${`t:${t.id}`} ...${hov(`t:${t.id}`)}
          onClick=${() => (need ? openConnectSheet(t.id, { projectId: project.id }) : toast(`${integrationById(t.id).name || t.name} is connected`, { tone: 'success' }))}>
          ${t.mcp ? html`<span class="ag-node__ico"><${Icon} name="server" size=${14} /></span>` : html`<${IntegrationTile} id=${t.id} size="sm" />`}
          <span class="grow ag-node__txt"><span class="ag-node__name">${t.mcp ? t.name : integrationById(t.id).name || t.name}</span><span class="ag-node__sub">${t.mcp ? 'MCP server' : `${(t.actions || []).length} actions`}</span></span>
          ${need ? html`<${Badge} size="sm" tone="amber">Connect<//>` : html`<${Badge} size="sm" tone="green" dot>On<//>`}
        </button>`;
      })}
      ${know.map(([key, k]) => html`<div class=${cx('ag-node ag-node--know', dim(key) && 'is-dim')} data-node=${key} tabindex="0" ...${hov(key)}>
        <span class="ag-node__ico is-know"><${Icon} name=${KNOW_ICON[k.type] || 'book-open'} size=${14} /></span>
        <span class="grow ag-node__txt"><span class="ag-node__name">${k.name}</span><span class="ag-node__sub">${k.type === 'table' ? 'Your data' : k.type === 'url' ? 'Web page' : k.size || 'Document'}</span></span>
      </div>`)}
      ${!tools.length && !know.length ? html`<div class="ag-map__none">No tools or knowledge yet.</div>` : null}
    </div>
  </div>
  <div class="ag-map__legend t-xs t-faint">
    <span><i class="ag-lg is-screen"></i>used on a screen</span><span><i class="ag-lg is-delegate"></i>hands work to</span><span><i class="ag-lg is-tool"></i>uses</span>
    <span class="grow"></span><span>Hover to trace a connection · click an agent to open it</span>
  </div>`;
}

function AgentCard({ project, a }) {
  const open = () => navigate(`/p/${project.id}/agents/${a.id}/build`);
  const tools = a.tools || [];
  const runs = a.stats?.runs || 0;
  return html`<div class="ag-card" role="link" tabindex="0" style=${{ '--ag-c': a.color }} onClick=${(e) => { if (!e.target.closest('.ag-card__menu')) open(); }} onKeyDown=${(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) open(); }}>
    <div class="row gap-10">
      <${AgentAvatar} agent=${a} size="lg" />
      <div class="grow" style="min-width:0">
        <div class="ag-card__name">${a.name}${hasStaged(project.id, a.id) ? html`<span class="ag-dot-edit" data-tip="Unsaved changes"></span>` : null}</div>
        <div class="row gap-6 wrap mt-4"><${FrameworkBadge} id=${a.framework} size="sm" /><${TierLabel} tier=${a.model?.tier} /></div>
      </div>
      <span class="ag-card__menu"><${Menu} width=${200} items=${[
        { label: 'Open', icon: 'arrow-right', onClick: open },
        { label: 'Duplicate', icon: 'copy', onClick: () => { const c = duplicateAgent(project.id, a.id); if (c) toast(`Duplicated as ${c.name}`, { tone: 'success' }); } },
        { divider: true },
        { label: 'Delete…', icon: 'trash', danger: true, onClick: async () => { if (await confirmDialog({ title: `Delete ${a.name}?`, body: 'A checkpoint is saved first, so you can bring it back from History.', confirmLabel: 'Delete agent', danger: true })) { const cp = deleteAgent(project.id, a.id); toast(`Deleted ${a.name}`, { tone: 'success', action: cp ? { label: 'History', onClick: () => navigate(`/p/${project.id}/history`) } : undefined }); } } },
      ]} trigger=${(o, t) => html`<${IconButton} icon="more-horizontal" label="Agent actions" size="sm" onClick=${t} active=${o} />`} /></span>
    </div>
    <p class="ag-card__role">${a.role || 'No description yet'}</p>
    <div class="row gap-4 wrap ag-card__tools">
      ${tools.slice(0, 6).map((t) => (t.mcp ? html`<span class="ag-mcp-tile" data-tip=${t.name}><${Icon} name="server" size=${11} /></span>` : html`<${IntegrationTile} id=${t.id} size="sm" />`))}
      ${tools.length > 6 ? html`<span class="t-xs t-faint">+${tools.length - 6}</span>` : null}
      ${!tools.length ? html`<span class="t-xs t-faint">No tools</span>` : null}
      ${(a.knowledge || []).length ? html`<span class="ag-card__know"><${Icon} name="book-open" size=${12} />${a.knowledge.length}</span>` : null}
    </div>
    <div class="ag-card__foot">
      <${VersionPill} agent=${a} size="sm" />
      <span class="t-xs t-faint">${runs ? `${fmtNumber(runs)} runs · ${fmtUsd(a.stats.cost)} this week` : 'No runs yet'}</span>
      <span class="grow"></span>
      <${EvalChip} score=${a.evalScore} />
    </div>
  </div>`;
}

export function AgentsIndex({ project }) {
  const view = route.value.query.view === 'list' ? 'list' : 'map';
  const agents = (project.agents || []).map((a) => effectiveAgent(project, a.id) || normalizeAgent(a));
  const live = agents.filter((a) => a.status === 'live').length;
  const runs = agents.reduce((n, a) => n + (a.stats?.runs || 0), 0);
  const cost = agents.reduce((n, a) => n + (a.stats?.cost || 0), 0);
  const onCreate = (spec, opts) => createAgentIn(project, spec, opts);

  return html`<div class="ag-root">
    <header class="ag-head">
      <div class="grow" style="min-width:0">
        <h1 class="ag-head__title">Agents <span class="ag-count">${agents.length}</span></h1>
        <p class="ag-head__sub">${agents.length ? `${live} live · ${agents.length - live} draft${agents.length - live === 1 ? '' : 's'} · ${fmtNumber(runs)} runs and ${fmtUsd(cost)} in the last 7 days` : 'Agents are the parts of your app that think and act — score leads, draft emails, answer questions.'}</p>
      </div>
      ${agents.length ? html`<${Segmented} size="sm" value=${view} onChange=${(v) => setQuery({ view: v === 'map' ? null : v })} options=${[{ value: 'map', label: 'Map', icon: 'workflow', tip: 'How agents connect to screens and tools' }, { value: 'list', label: 'List', icon: 'list', tip: 'Every agent as a card' }]} />` : null}
      <${NewAgentMenu} project=${project} onCreate=${onCreate} />
    </header>
    ${!agents.length ? html`<${Empty} icon="bot" title="No agents yet" body="Describe what you want done in plain words, start from a template, or import code you already have. New agents start as drafts — nothing runs until you try or publish it."
        action=${html`<${NewAgentMenu} project=${project} onCreate=${onCreate} label="Create your first agent" />`} />`
      : view === 'map' ? html`<${AgentMap} project=${project} agents=${agents} />`
        : html`<div class="ag-cards">${agents.map((a) => html`<${AgentCard} key=${a.id} project=${project} a=${a} />`)}</div>`}
  </div>`;
}
