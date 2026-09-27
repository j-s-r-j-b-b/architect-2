// Chart block in pure SVG: bar, line, area and donut, with hover tooltips.
// Data comes from props.series or is computed from bind.table + groupBy/metric.
import { html, useState, useRef, useLayoutEffect } from '../../lib/html.js';
import { cx, uid, fmtNumber } from '../../lib/util.js';
import { tableById } from '../../engine/schema.js';
import { useGx, Panel, BlockNote, lockedForVisitor } from '../util.js';

export function chartSeries(project, block) {
  const p = block.props || {};
  if (Array.isArray(p.series) && p.series.length) return p.series.map((s) => ({ label: String(s.label), value: Number(s.value) || 0 }));
  const t = block.bind?.table ? tableById(project, block.bind.table) : null;
  if (!t || !p.groupBy) return [];
  const col = t.columns.find((c) => c.key === p.groupBy);
  const map = new Map((col?.options || []).map((o) => [o, 0]));
  const metric = p.metric && p.metric !== 'count' ? p.metric : null;
  for (const r of t.rows) {
    const k = r[p.groupBy] ?? '—';
    map.set(k, (map.get(k) || 0) + (metric ? Number(r[metric]) || 0 : 1));
  }
  return [...map].map(([label, value]) => ({ label: String(label), value }));
}

function niceMax(v) {
  if (v <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / exp;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * exp;
}

function useWidth(ref, fallback = 360) {
  const [w, setW] = useState(fallback);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => { const cw = Math.round(e.contentRect.width); if (cw > 0) setW(cw); });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return w;
}

const C = (i) => `var(--gx-c${(i % 6) + 1})`;

function Tip({ tip }) {
  if (!tip) return null;
  return html`<div class="gx-tip" style=${{ left: tip.x + 'px', top: tip.y + 'px' }}><span class="gx-tip__label">${tip.label}</span><strong>${fmtNumber(tip.value)}</strong></div>`;
}

function Bars({ data, w, h, onTip, hover }) {
  const padL = 30, padB = 26, padT = 10;
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const iw = Math.max(40, w - padL - 6), ih = h - padB - padT;
  const bw = iw / data.length;
  const barW = Math.max(6, Math.min(44, bw * 0.58));
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  return html`<svg width=${w} height=${h} class="gx-svg" role="img" aria-label="Bar chart">
    ${ticks.map((t) => { const y = padT + ih - t * ih; return html`<g key=${t}><line x1=${padL} x2=${w - 4} y1=${y} y2=${y} class="gx-grid-line" /><text x=${padL - 6} y=${y + 3} class="gx-axis" text-anchor="end">${fmtNumber(max * t)}</text></g>`; })}
    ${data.map((d, i) => {
      const bh = (d.value / max) * ih;
      const x = padL + i * bw + (bw - barW) / 2, y = padT + ih - bh;
      return html`<g key=${d.label} onMouseEnter=${() => onTip({ i, x: x + barW / 2, y: y - 6, label: d.label, value: d.value })} onMouseLeave=${() => onTip(null)}>
        <rect x=${padL + i * bw} y=${padT} width=${bw} height=${ih} fill="transparent" />
        <rect x=${x} y=${y} width=${barW} height=${Math.max(1, bh)} rx=${Math.min(5, barW / 3)} class=${cx('gx-bar', hover != null && hover !== i && 'is-dim')} style=${{ fill: C(0) }} />
        <text x=${x + barW / 2} y=${h - 8} class="gx-axis" text-anchor="middle">${d.label.length > 9 && bw < 64 ? d.label.slice(0, 8) + '…' : d.label}</text>
      </g>`;
    })}
  </svg>`;
}

function Lines({ data, w, h, area, onTip, hover, gid }) {
  const padL = 30, padB = 26, padT = 12, padR = 10;
  const vals = data.map((d) => d.value);
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const min = area ? Math.max(0, Math.floor((lo - (hi - lo) * 0.4) / 5) * 5) : 0;
  const max = niceMax(hi - min) + min;
  const iw = Math.max(40, w - padL - padR), ih = h - padB - padT;
  const pt = (d, i) => [padL + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * iw), padT + ih - ((d.value - min) / (max - min || 1)) * ih];
  const pts = data.map(pt);
  const path = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const fill = `${path} L${pts[pts.length - 1][0].toFixed(1)},${padT + ih} L${pts[0][0].toFixed(1)},${padT + ih} Z`;
  const ticks = [0, 0.5, 1];
  const step = Math.ceil(data.length / Math.max(2, Math.floor(iw / 56)));
  return html`<svg width=${w} height=${h} class="gx-svg" role="img" aria-label=${area ? 'Area chart' : 'Line chart'}>
    <defs><linearGradient id=${gid} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" style=${{ stopColor: 'var(--gx-primary)', stopOpacity: 0.28 }} /><stop offset="100%" style=${{ stopColor: 'var(--gx-primary)', stopOpacity: 0 }} /></linearGradient></defs>
    ${ticks.map((t) => { const y = padT + ih - t * ih; return html`<g key=${t}><line x1=${padL} x2=${w - padR} y1=${y} y2=${y} class="gx-grid-line" /><text x=${padL - 6} y=${y + 3} class="gx-axis" text-anchor="end">${fmtNumber(min + (max - min) * t)}</text></g>`; })}
    ${area ? html`<path d=${fill} style=${{ fill: `url(#${gid})` }} />` : null}
    <path d=${path} class="gx-line" style=${{ stroke: 'var(--gx-primary)' }} />
    ${pts.map(([x, y], i) => html`<g key=${i}>
      ${i % step === 0 || i === pts.length - 1 ? html`<text x=${x} y=${h - 8} class="gx-axis" text-anchor="middle">${data[i].label}</text>` : null}
      <circle cx=${x} cy=${y} r=${hover === i ? 5 : 3} class="gx-pt" style=${{ stroke: 'var(--gx-primary)' }} />
      <rect x=${x - iw / data.length / 2} y=${padT} width=${iw / Math.max(1, data.length - 1)} height=${ih} fill="transparent"
        onMouseEnter=${() => onTip({ i, x, y: y - 8, label: data[i].label, value: data[i].value })} onMouseLeave=${() => onTip(null)} />
    </g>`)}
  </svg>`;
}

function Donut({ data, onTip, hover }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const R = 58, r = 38, cx0 = 70, cy0 = 70;
  let a0 = -Math.PI / 2;
  const arcs = data.map((d, i) => {
    const frac = d.value / total;
    const a1 = a0 + frac * Math.PI * 2;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const p = (ang, rad) => [cx0 + Math.cos(ang) * rad, cy0 + Math.sin(ang) * rad];
    const [x1, y1] = p(a0, R), [x2, y2] = p(a1 - 0.0001, R), [x3, y3] = p(a1 - 0.0001, r), [x4, y4] = p(a0, r);
    const dpath = `M${x1},${y1} A${R},${R} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${r},${r} 0 ${large} 0 ${x4},${y4} Z`;
    const mid = (a0 + a1) / 2;
    const out = { d: dpath, i, frac, mid };
    a0 = a1;
    return out;
  });
  return html`<div class="gx-donut">
    <svg width="140" height="140" viewBox="0 0 140 140" class="gx-svg" role="img" aria-label="Donut chart">
      ${arcs.map((a) => (data[a.i].value > 0 ? html`<path key=${a.i} d=${a.d} class=${cx('gx-arc', hover != null && hover !== a.i && 'is-dim')} style=${{ fill: C(a.i) }}
        onMouseEnter=${() => onTip({ i: a.i, x: cx0 + Math.cos(a.mid) * 62, y: cy0 + Math.sin(a.mid) * 62 - 8, label: data[a.i].label, value: data[a.i].value })} onMouseLeave=${() => onTip(null)} />` : null))}
      <text x="70" y="68" text-anchor="middle" class="gx-donut__total">${fmtNumber(total)}</text>
      <text x="70" y="84" text-anchor="middle" class="gx-axis">total</text>
    </svg>
    <ul class="gx-legend">
      ${data.map((d, i) => html`<li key=${d.label} class=${cx(hover === i && 'is-hot')} onMouseEnter=${() => onTip({ i, x: 70, y: 20, label: d.label, value: d.value, noPos: true })} onMouseLeave=${() => onTip(null)}>
        <i style=${{ background: C(i) }}></i><span>${d.label}</span><b>${fmtNumber(d.value)}</b><em>${Math.round((d.value / total) * 100)}%</em>
      </li>`)}
    </ul>
  </div>`;
}

export function ChartBlock({ block }) {
  const ctx = useGx();
  const ref = useRef(null);
  const gid = useRef(uid('gxg')).current;
  const w = useWidth(ref);
  const [tip, setTip] = useState(null);
  const p = block.props || {};
  const table = block.bind?.table ? tableById(ctx.project, block.bind.table) : null;
  const data = chartSeries(ctx.project, block);
  const kind = p.kind || 'bar';
  const onTip = ctx.isStatic ? () => {} : setTip;
  let body;
  if (lockedForVisitor(ctx, table)) body = html`<${BlockNote} icon="lock" title="Sign in to see this chart" body=${table.rules} />`;
  else if (!data.length || data.every((d) => !d.value)) body = html`<${BlockNote} icon="bar-chart" title="No data to chart yet" body=${table ? `${table.name} has no rows to group.` : 'Add values or connect data.'} />`;
  else if (kind === 'donut' || kind === 'pie') body = html`<${Donut} data=${data} onTip=${onTip} hover=${tip?.i} />`;
  else if (kind === 'line' || kind === 'area') body = html`<${Lines} data=${data} w=${w} h=${220} area=${kind === 'area'} onTip=${onTip} hover=${tip?.i} gid=${gid} />`;
  else body = html`<${Bars} data=${data} w=${w} h=${220} onTip=${onTip} hover=${tip?.i} />`;
  return html`<${Panel} block=${block} table=${table} sub=${p.yLabel || p.xLabel ? [p.yLabel, p.xLabel].filter(Boolean).join(' by ') : null}>
    <div class="gx-chart" ref=${ref}>
      ${body}
      ${tip && !tip.noPos ? html`<${Tip} tip=${tip} />` : null}
    </div>
  <//>`;
}
