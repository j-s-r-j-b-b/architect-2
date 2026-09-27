// Wireframes: the "blueprint" look of a planned block (and the amber skeleton while it
// is being drafted). Informative, not blank: real column names, labels and bindings.
import { html } from '../../lib/html.js';
import { Icon } from '../../ui/icons.js';
import { cx } from '../../lib/util.js';
import { useGx, metaFor, blockLabel, bindingOf } from '../util.js';
import { chartSeries } from './chart.js';

const T = (text, cls) => html`<span class=${cx('gx-wf-t', cls)}>${text}</span>`;
const B = (w, cls) => html`<span class=${cx('gx-wf-b', cls)} style=${{ width: typeof w === 'number' ? w + '%' : w }}></span>`;
const W = [72, 54, 64, 46, 80, 58];

function Body({ block, project }) {
  const p = block.props || {};
  const { table, agent } = bindingOf(project, block);
  switch (block.type) {
    case 'header': return html`<div class="gx-wf-row gx-wf-between">
      <div class="gx-wf-col">${T(p.title || block.title || 'Page title', 'is-h1')}${p.subtitle ? T(p.subtitle, 'is-sub') : B(40)}</div>
      <div class="gx-wf-row">${(p.actions || []).map((a) => html`<span class=${cx('gx-wf-btn', a.variant === 'primary' && 'is-primary')}>${T(a.label)}</span>`)}</div>
    </div>`;
    case 'hero': return html`<div class="gx-wf-col gx-wf-hero">${T(p.title || 'Headline', 'is-hero')}${p.subtitle ? T(p.subtitle, 'is-sub') : B(50)}<div class="gx-wf-row">${p.cta ? html`<span class="gx-wf-btn is-primary">${T(p.cta)}</span>` : null}${p.secondaryCta ? html`<span class="gx-wf-btn">${T(p.secondaryCta)}</span>` : null}</div></div>`;
    case 'kpis': return html`<div class="gx-wf-kpis">${(p.items?.length ? p.items : [{}, {}, {}, {}]).map((k) => html`<div class="gx-wf-box gx-wf-col">${T(k.label || 'Metric', 'is-sm')}${T(k.value ?? '—', 'is-kpi')}</div>`)}</div>`;
    case 'table': {
      const cols = table ? (p.columns?.length ? p.columns.map((k) => table.columns.find((c) => c.key === k)).filter(Boolean) : table.columns.slice(0, 6)) : [{ label: 'Column' }, { label: 'Column' }, { label: 'Column' }];
      return html`<div class="gx-wf-col">
        <div class="gx-wf-row">${p.searchable !== false ? html`<span class="gx-wf-input">${T(`Search ${table ? table.name.toLowerCase() : ''}…`, 'is-sm')}</span>` : null}${(p.filters || []).map((f) => html`<span class="gx-wf-pill">${T(table?.columns.find((c) => c.key === f)?.label || f, 'is-sm')}</span>`)}</div>
        <div class="gx-wf-table" style=${{ gridTemplateColumns: `repeat(${cols.length + (p.rowAction ? 1 : 0)}, minmax(0,1fr))` }}>
          ${cols.map((c) => T(c.label, 'is-th'))}${p.rowAction ? T(p.rowAction.label, 'is-th') : null}
          ${[0, 1, 2, 3, 4].map((r) => [...cols.map((_, i) => B(W[(r + i) % 6])), p.rowAction ? html`<span class="gx-wf-btn is-sm">${B(70)}</span>` : null])}
        </div>
      </div>`;
    }
    case 'chart': {
      const data = chartSeries(project, block);
      const labels = data.length ? data.map((d) => d.label) : ['A', 'B', 'C', 'D', 'E'];
      if (p.kind === 'donut' || p.kind === 'pie') return html`<div class="gx-wf-row gx-wf-donut"><span class="gx-wf-ring"></span><div class="gx-wf-col">${labels.slice(0, 6).map((l) => T(l, 'is-sm'))}</div></div>`;
      const max = Math.max(1, ...data.map((d) => d.value));
      return html`<div class="gx-wf-col"><div class=${cx('gx-wf-bars', (p.kind === 'line' || p.kind === 'area') && 'is-line')}>${labels.map((l, i) => html`<div class="gx-wf-barcol"><span class="gx-wf-bar" style=${{ height: `${data.length ? 18 + (data[i].value / max) * 78 : 30 + ((i * 37) % 60)}%` }}></span>${T(l, 'is-xs')}</div>`)}</div></div>`;
    }
    case 'form': {
      const fields = p.fields?.length ? p.fields : (table?.columns || []).slice(0, 4);
      return html`<div class="gx-wf-col">${fields.map((f) => html`<div class="gx-wf-col is-tight">${T(f.label, 'is-sm')}<span class="gx-wf-input"></span></div>`)}<span class="gx-wf-btn is-primary">${T(p.submitLabel || 'Submit')}</span></div>`;
    }
    case 'agentChat': return html`<div class="gx-wf-col gx-wf-chat">
      <div class="gx-wf-row">${T(agent?.name || 'Agent', 'is-strong')}</div>
      <div class="gx-wf-bubble">${B(88)}${B(62)}</div>
      <div class="gx-wf-row wrap">${(p.suggestions || []).slice(0, 3).map((s) => html`<span class="gx-wf-pill">${T(s, 'is-xs')}</span>`)}</div>
      <span class="gx-wf-input gx-wf-grow-top">${T(p.placeholder || 'Message…', 'is-sm')}</span>
    </div>`;
    case 'agentActivity': return html`<div class="gx-wf-col">${[0, 1, 2, 3].map((i) => html`<div class="gx-wf-row"><span class="gx-wf-dot"></span><div class="gx-wf-col is-tight grow">${B(W[i])}${B(W[i + 1] - 20)}</div></div>`)}</div>`;
    case 'kanban': {
      const gcol = table?.columns.find((c) => c.key === p.groupBy);
      const groups = gcol?.options || ['To do', 'Doing', 'Done'];
      return html`<div class="gx-wf-kanban">${groups.map((g, i) => html`<div class="gx-wf-col gx-wf-lane">${T(g, 'is-sm')}${[0, 1, 2].slice(0, 3 - (i % 2)).map(() => html`<span class="gx-wf-box is-card">${B(80)}${B(50)}</span>`)}</div>`)}</div>`;
    }
    case 'cards': return html`<div class="gx-wf-kpis">${[0, 1, 2].map((i) => html`<div class="gx-wf-box gx-wf-col is-card">${B(60)}${B(85)}${B(40)}</div>`)}</div>`;
    case 'list': return html`<div class="gx-wf-col">${(p.items?.length ? p.items : [{}, {}, {}, {}]).slice(0, 5).map((it, i) => html`<div class="gx-wf-row"><span class="gx-wf-dot"></span>${it.title ? T(it.title, 'is-sm') : B(W[i])}</div>`)}</div>`;
    case 'detail': return html`<div class="gx-wf-col">${(p.fields || (table?.columns || []).slice(0, 5).map((c) => c.key)).slice(0, 6).map((k, i) => html`<div class="gx-wf-row gx-wf-between">${T(table?.columns.find((c) => c.key === k)?.label || k, 'is-sm')}${B(W[i] / 2)}</div>`)}</div>`;
    case 'text': return html`<div class="gx-wf-col">${B(96)}${B(88)}${B(92)}${B(54)}</div>`;
    case 'calendar': return html`<div class="gx-wf-cal">${Array.from({ length: 35 }).map((_, i) => html`<span class=${cx('gx-wf-cell', i % 9 === 3 && 'is-ev')}></span>`)}</div>`;
    case 'steps': return html`<div class="gx-wf-steps">${(p.items?.length ? p.items : [{}, {}, {}]).map((s, i) => html`<div class="gx-wf-row"><span class="gx-wf-num">${i + 1}</span>${s.title ? T(s.title, 'is-sm') : B(60)}</div>`)}</div>`;
    default: return html`<div class="gx-wf-col">${B(70)}${B(50)}</div>`;
  }
}

/** state: 'planned' (blueprint) | 'drafting' (amber skeleton) */
export function Wireframe({ block, screen, state = 'planned' }) {
  const ctx = useGx();
  const m = metaFor(block.type);
  const { table, agent } = bindingOf(ctx.project, block);
  const drafting = state === 'drafting';
  return html`<div class=${cx('gx-wf', drafting ? 'gx-wf--drafting' : 'gx-wf--planned', `gx-wf--${block.type}`)} aria-label=${`${blockLabel(block, screen)} — ${drafting ? 'building' : 'planned'}`}>
    <div class="gx-wf__head">
      <span class="gx-wf__icon"><${Icon} name=${m.icon} size=${13} /></span>
      <span class="gx-wf__title">${blockLabel(block, screen)}</span>
      <span class="gx-wf__tag">${drafting ? html`<span class="gx-spin gx-spin--amber"></span>Building…` : html`<${Icon} name="circle-dashed" size=${11} />Planned`}</span>
    </div>
    <div class="gx-wf__body"><${Body} block=${block} project=${ctx.project} /></div>
    ${table || agent ? html`<div class="gx-wf__foot">
      ${table ? html`<span><${Icon} name="database" size=${11} />${table.name}</span>` : null}
      ${agent ? html`<span><${Icon} name="bot" size=${11} />${agent.name}</span>` : null}
    </div>` : null}
  </div>`;
}
