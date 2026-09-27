// Plan › Workflow — orchestration diagram: triggers → manager → workers → gates → tools & knowledge → screens.
import { html, useState, useMemo } from '../../lib/html.js';
import { navigate } from '../../lib/router.js';
import { cx } from '../../lib/util.js';
import { Icon, Empty, Badge } from '../../ui/index.js';
import { integrationById } from '../../engine/catalog.js';
import { isConnected, openConnectSheet } from '../../shells/ConnectSheet.js';
import { SectionHead, slug } from './shared.js';

const TRIGGER = {
  chat: { icon: 'message-square', label: 'Chat' }, schedule: { icon: 'clock', label: 'Schedule' },
  webhook: { icon: 'webhook', label: 'Webhook' }, email: { icon: 'mail', label: 'Email' }, event: { icon: 'zap', label: 'Event' },
};
const COL_W = { trigger: 176, manager: 190, worker: 190, gate: 92, resource: 176, screen: 150 };
const COL_TITLE = { trigger: 'Triggers', manager: 'Manager', worker: 'Specialists', gate: 'Approval', resource: 'Tools & knowledge', screen: 'Screens' };
const NODE_H = 46, ROW = 62, GAP = 54, PAD = 20, TOP = 40;

function trunc(s = '', n = 22) { s = String(s); return s.length > n ? s.slice(0, n - 1) + '…' : s; }

export function buildGraph(p) {
  const agents = p.agents || [];
  const nodes = [], edges = [];
  const byId = new Map();
  const add = (n) => { if (!byId.has(n.id)) { byId.set(n.id, n); nodes.push(n); } return byId.get(n.id); };
  const managers = agents.filter((a) => a.kind === 'manager');
  const order = [...managers];
  for (const m of managers) for (const w of m.delegatesTo || []) { const a = agents.find((x) => x.id === w); if (a && !order.includes(a)) order.push(a); }
  for (const a of agents) if (!order.includes(a)) order.push(a);

  for (const a of order) {
    for (const t of a.triggers || []) {
      const n = add({ id: `tr_${t.type}_${slug(t.detail)}`, col: 'trigger', kind: 'trigger', type: t.type, label: t.detail || TRIGGER[t.type]?.label || t.type, sub: TRIGGER[t.type]?.label || t.type, icon: TRIGGER[t.type]?.icon || 'zap', agentId: a.id });
      edges.push({ from: n.id, to: a.id, kind: 'trigger' });
    }
  }
  for (const a of order) add({ id: a.id, col: a.kind === 'manager' ? 'manager' : 'worker', kind: a.kind === 'manager' ? 'manager' : 'worker', label: a.name, sub: a.role, icon: 'bot', agentId: a.id, status: a.buildState === 'building' ? 'building' : a.status });
  for (const m of managers) for (const w of m.delegatesTo || []) if (byId.has(w)) edges.push({ from: m.id, to: w, kind: 'delegate' });

  for (const a of order) {
    const gated = new Set(a.approvals || []);
    for (const t of a.tools || []) {
      const it = integrationById(t.id);
      const tn = add({ id: `tool_${t.id}`, col: 'resource', kind: 'tool', label: t.name || it.name, sub: (t.actions || []).join(', '), icon: t.mcp ? 'server' : 'plug', toolId: t.id, agentId: a.id, connected: isConnected(t.id, p) });
      const gatedActions = (t.actions || []).filter((x) => gated.has(x));
      for (const act of gatedActions) {
        const g = add({ id: `gate_${a.id}_${act}`, col: 'gate', kind: 'gate', label: act.replace(/_/g, ' '), sub: 'Asks a person first', agentId: a.id });
        edges.push({ from: a.id, to: g.id, kind: 'gate' });
        edges.push({ from: g.id, to: tn.id, kind: 'gate' });
        gated.delete(act);
      }
      if ((t.actions || []).length > gatedActions.length || !(t.actions || []).length) edges.push({ from: a.id, to: tn.id, kind: 'tool' });
    }
    for (const act of gated) { // approval without a matching tool
      const g = add({ id: `gate_${a.id}_${act}`, col: 'gate', kind: 'gate', label: act.replace(/_/g, ' '), sub: 'Asks a person first', agentId: a.id });
      edges.push({ from: a.id, to: g.id, kind: 'gate' });
    }
    for (const k of a.knowledge || []) {
      const kn = add({ id: `kn_${slug(k.name)}`, col: 'resource', kind: 'knowledge', label: k.name, sub: k.type === 'table' ? 'Table' : k.type === 'url' ? 'Web page' : 'Knowledge file', icon: k.type === 'table' ? 'table' : k.type === 'url' ? 'globe' : 'book-open', agentId: a.id });
      edges.push({ from: a.id, to: kn.id, kind: 'knowledge' });
    }
    for (const sid of a.usedBy || []) {
      const s = (p.screens || []).find((x) => x.id === sid);
      if (!s) continue;
      const sn = add({ id: `sc_${s.id}`, col: 'screen', kind: 'screen', label: s.title, sub: s.route, icon: s.icon || 'layout-dashboard', route: s.route });
      edges.push({ from: a.id, to: sn.id, kind: 'ui' });
    }
  }
  // de-duplicate edges
  const seen = new Set();
  return { nodes, edges: edges.filter((e) => { const k = `${e.from}>${e.to}`; if (seen.has(k)) return false; seen.add(k); return true; }) };
}

function layout(graph) {
  const cols = ['trigger', 'manager', 'worker', 'gate', 'resource', 'screen'].filter((c) => graph.nodes.some((n) => n.col === c));
  const maxRows = Math.max(1, ...cols.map((c) => graph.nodes.filter((n) => n.col === c).length));
  const height = TOP + maxRows * ROW + PAD;
  let x = PAD;
  const colX = {};
  for (const c of cols) { colX[c] = x; x += COL_W[c] + GAP; }
  const width = x - GAP + PAD;
  const pos = {};
  for (const c of cols) {
    const list = graph.nodes.filter((n) => n.col === c);
    const y0 = TOP + ((maxRows - list.length) * ROW) / 2;
    list.forEach((n, i) => { pos[n.id] = { x: colX[c], y: y0 + i * ROW + (ROW - NODE_H) / 2, w: COL_W[c], h: NODE_H }; });
  }
  return { cols, colX, width, height, pos };
}

export default function Workflow({ project: p }) {
  const graph = useMemo(() => buildGraph(p), [p]);
  const L = useMemo(() => layout(graph), [graph]);
  const [hot, setHot] = useState(null);
  if (!(p.agents || []).length) {
    return html`<div class="card"><${Empty} icon="workflow" title="No agents in this plan yet"
      body="When the plan includes agents, this page shows how work flows: what starts it, which agent does what, where a person must approve, and which screens show the results." /></div>`;
  }
  const linked = hot ? new Set(graph.edges.filter((e) => e.from === hot || e.to === hot).flatMap((e) => [e.from, e.to])) : null;
  const open = (n) => {
    if (n.kind === 'screen') navigate(`/p/${p.id}/app?route=${encodeURIComponent(n.route)}`);
    else if (n.kind === 'tool' && !n.connected) openConnectSheet(n.toolId, { projectId: p.id });
    else if (n.kind === 'knowledge') navigate(`/p/${p.id}/data/files`);
    else if (n.agentId) navigate(`/p/${p.id}/agents/${n.agentId}`);
  };
  return html`<div class="pl-wf">
    <${SectionHead} icon="workflow" title="How the work flows"
      sub="Read left to right. Click any agent to tune it, any tool to connect it."
      right=${html`<${Badge} tone="violet" icon="bot">${p.agents.length} agents<//>`} />
    <div class="card pl-wf__canvas paper-grid">
      <svg class="pl-wf__svg" viewBox=${`0 0 ${L.width} ${L.height}`} width="100%" style=${{ minWidth: `${Math.round(L.width * 0.78)}px`, maxWidth: `${L.width}px` }} role="img" aria-label="Agent orchestration diagram">
        <defs>
          <marker id="pl-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="pl-wf-arrow" /></marker>
          <marker id="pl-arrow-hot" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="pl-wf-arrow is-hot" /></marker>
        </defs>
        ${L.cols.map((c) => html`<text x=${L.colX[c]} y="18" class="pl-wf-coltitle">${COL_TITLE[c].toUpperCase()}</text>`)}
        ${graph.edges.map((e) => {
          const a = L.pos[e.from], b = L.pos[e.to];
          if (!a || !b) return null;
          const x1 = a.x + a.w, y1 = a.y + a.h / 2, x2 = b.x - 3, y2 = b.y + b.h / 2;
          const mx = (x1 + x2) / 2;
          const isHot = hot && (e.from === hot || e.to === hot);
          return html`<path d=${`M${x1} ${y1} C${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`} class=${cx('pl-wf-edge', `pl-wf-edge--${e.kind}`, isHot && 'is-hot', hot && !isHot && 'is-dim')} marker-end=${isHot ? 'url(#pl-arrow-hot)' : 'url(#pl-arrow)'} />`;
        })}
        ${graph.nodes.map((n) => html`<${Node} key=${n.id} n=${n} box=${L.pos[n.id]} dim=${linked && !linked.has(n.id)} onHover=${setHot} onOpen=${open} />`)}
      </svg>
    </div>
    <div class="pl-wf__foot">
      <${Legend} />
      <${Narrative} project=${p} graph=${graph} />
    </div>
  </div>`;
}

function Node({ n, box, dim, onHover, onOpen }) {
  if (!box) return null;
  const { x, y, w, h } = box;
  const key = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(n); } };
  const common = { class: cx('pl-wf-node', `pl-wf-node--${n.kind}`, dim && 'is-dim'), tabindex: '0', role: 'button', 'aria-label': `${n.label} — ${n.sub || n.kind}`, onMouseEnter: () => onHover(n.id), onMouseLeave: () => onHover(null), onFocus: () => onHover(n.id), onBlur: () => onHover(null), onClick: () => onOpen(n), onKeyDown: key };
  if (n.kind === 'gate') {
    const cx0 = x + 22, cy = y + h / 2, r = 15;
    return html`<g ...${common}>
      <title>${`Approval gate: ${n.label} — a person must approve first`}</title>
      <rect x=${x} y=${y} width=${w} height=${h} class="pl-wf-hit" />
      <path d=${`M${cx0} ${cy - r}L${cx0 + r} ${cy}L${cx0} ${cy + r}L${cx0 - r} ${cy}Z`} class="pl-wf-diamond" />
      <g transform=${`translate(${cx0 - 6} ${cy - 6})`} class="pl-wf-icon"><${Icon} name="lock" size=${12} /></g>
      <text x=${x + 44} y=${cy - 3} class="pl-wf-label">${trunc(n.label, 11)}</text>
      <text x=${x + 44} y=${cy + 11} class="pl-wf-sub">approve</text>
    </g>`;
  }
  const rx = n.kind === 'trigger' ? h / 2 : n.kind === 'screen' ? 8 : 11;
  const ix = n.kind === 'trigger' ? x + 14 : x + 12;
  return html`<g ...${common}>
    <title>${`${n.label}${n.sub ? ` — ${n.sub}` : ''}`}</title>
    <rect x=${x} y=${y} width=${w} height=${h} rx=${rx} class="pl-wf-box" />
    ${n.kind === 'worker' ? html`<rect x=${x} y=${y + 8} width="3" height=${h - 16} rx="1.5" class="pl-wf-accent" />` : null}
    <g transform=${`translate(${ix} ${y + h / 2 - 8})`} class="pl-wf-icon"><${Icon} name=${n.icon} size=${16} /></g>
    <text x=${ix + 24} y=${y + 19} class="pl-wf-label">${trunc(n.label, n.kind === 'screen' ? 14 : 19)}</text>
    <text x=${ix + 24} y=${y + 34} class="pl-wf-sub">${trunc(n.sub, n.kind === 'screen' ? 16 : 24)}</text>
    ${n.kind === 'tool' ? html`<circle cx=${x + w - 12} cy=${y + 12} r="4" class=${n.connected ? 'pl-wf-dot is-ok' : 'pl-wf-dot is-needed'}><title>${n.connected ? 'Connected' : 'Not connected — click to connect'}</title></circle>` : null}
    ${n.status === 'building' ? html`<circle cx=${x + w - 12} cy=${y + 12} r="4" class="pl-wf-dot is-building" />` : null}
  </g>`;
}

function Legend() {
  const items = [
    ['trigger', 'Trigger — what starts the work'], ['manager', 'Manager agent — routes work'], ['worker', 'Specialist agent'],
    ['gate', 'Approval gate — a person decides'], ['tool', 'Tool / connection'], ['knowledge', 'Knowledge'], ['screen', 'Screen in your app'],
  ];
  return html`<div class="card pl-wf-legend">
    <div class="pl-side-title">Legend</div>
    <ul>${items.map(([k, l]) => html`<li><span class=${`pl-lg pl-lg--${k}`}></span>${l}</li>`)}
      <li><span class="pl-lg-dot is-ok"></span>Connected</li><li><span class="pl-lg-dot is-needed"></span>Needs connecting</li>
    </ul>
  </div>`;
}

function Narrative({ project: p, graph }) {
  const name = (id) => p.agents.find((a) => a.id === id)?.name || id;
  const lines = [];
  for (const n of graph.nodes.filter((x) => x.kind === 'trigger')) {
    const targets = graph.edges.filter((e) => e.from === n.id).map((e) => name(e.to));
    lines.push({ icon: n.icon, text: html`<b>${n.sub}:</b> ${n.label} → ${targets.join(', ')}` });
  }
  for (const a of p.agents.filter((x) => x.kind === 'manager' && x.delegatesTo?.length)) lines.push({ icon: 'network', text: html`<b>${a.name}</b> hands work to ${a.delegatesTo.map(name).join(' and ')}` });
  for (const a of p.agents.filter((x) => x.approvals?.length)) lines.push({ icon: 'lock', text: html`<b>${a.name}</b> must ask a person before it can ${a.approvals.map((x) => x.replace(/_/g, ' ')).join(', ')}` });
  const screens = graph.nodes.filter((x) => x.kind === 'screen');
  if (screens.length) lines.push({ icon: 'layout-dashboard', text: html`Results show on ${screens.map((s) => s.label).join(', ')}` });
  return html`<div class="card pl-wf-story">
    <div class="pl-side-title">In plain words</div>
    <ul>${lines.map((l) => html`<li><${Icon} name=${l.icon} size=${14} /><span>${l.text}</span></li>`)}</ul>
  </div>`;
}
