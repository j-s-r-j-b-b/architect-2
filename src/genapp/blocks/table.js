// Table block: search, filters, sorting, status chips, score bars, person avatars,
// pagination, expandable rows and a row action that runs the bound agent inline.
import { html, useState, useMemo } from '../../lib/html.js';
import { Icon } from '../../ui/icons.js';
import { cx, plural } from '../../lib/util.js';
import { tableById, agentById } from '../../engine/schema.js';
import { useGx, Panel, Chip, GxAvatar, GxButton, BlockNote, fmtValue, scoreTone, lockedForVisitor, titleKeyOf } from '../util.js';
import { AgentRun, useAgentRunner } from './agent.js';

function Cell({ col, value }) {
  if (value === null || value === undefined || value === '') return html`<span class="gx-muted">—</span>`;
  switch (col.type) {
    case 'status': return html`<${Chip} value=${value} options=${col.options} />`;
    case 'person': return html`<span class="gx-person"><${GxAvatar} name=${value} size=${24} /><span class="gx-person__name">${value}</span></span>`;
    case 'score': {
      const n = Math.max(0, Math.min(100, Number(value) || 0));
      return html`<span class="gx-score" title=${`${n} / 100`}><span class="gx-score__bar"><i class=${`gx-t-${scoreTone(n)}`} style=${{ width: n + '%' }}></i></span><b>${n}</b></span>`;
    }
    case 'email': return html`<span class="gx-email">${value}</span>`;
    case 'url': return html`<span class="gx-link">${String(value).replace(/^https?:\/\//, '')}</span>`;
    case 'bool': return value ? html`<span class="gx-chip gx-t-green"><i></i>Yes</span>` : html`<span class="gx-muted">No</span>`;
    case 'longtext': return html`<span class="gx-clamp">${value}</span>`;
    case 'money': case 'number': case 'percent': return html`<span class="gx-num">${fmtValue(value, col.type)}</span>`;
    default: return html`<span>${fmtValue(value, col.type)}</span>`;
  }
}

const numeric = (t) => ['number', 'money', 'percent', 'score', 'date', 'datetime'].includes(t);

export function TableBlock({ block }) {
  const ctx = useGx();
  const p = block.props || {};
  const table = tableById(ctx.project, block.bind?.table);
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState(null); // {key, dir}
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(null); // expanded row id
  const runner = useAgentRunner();

  const cols = useMemo(() => {
    if (!table) return [];
    const byKey = (k) => table.columns.find((c) => c.key === k);
    const list = p.columns?.length ? p.columns.map(byKey).filter(Boolean) : table.columns.filter((c) => c.type !== 'longtext').slice(0, 7);
    return list;
  }, [table, p.columns]);

  if (!table) return html`<${Panel} block=${block}><${BlockNote} icon="database" title="Not connected to data" body="This table isn’t bound to any data yet." /><//>`;
  if (lockedForVisitor(ctx, table)) {
    return html`<${Panel} block=${block} table=${table}><${BlockNote} icon="lock" title=${`Only signed-in teammates can see ${table.name.toLowerCase()}`} body=${`Access rule: ${table.rules}`} /><//>`;
  }

  const filterCols = (p.filters || []).map((k) => table.columns.find((c) => c.key === k)).filter(Boolean);
  const needle = q.trim().toLowerCase();
  let rows = table.rows.filter((r) => {
    for (const [k, v] of Object.entries(filters)) if (v && String(r[k]) !== v) return false;
    if (!needle) return true;
    return table.columns.some((c) => String(r[c.key] ?? '').toLowerCase().includes(needle));
  });
  if (sort) {
    const col = table.columns.find((c) => c.key === sort.key);
    rows = [...rows].sort((a, b) => {
      const x = a[sort.key], y = b[sort.key];
      const r = numeric(col?.type) ? (Number(x) || 0) - (Number(y) || 0) : String(x ?? '').localeCompare(String(y ?? ''));
      return sort.dir === 'asc' ? r : -r;
    });
  }
  const pageSize = p.pageSize || 8;
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pg = Math.min(page, pages - 1);
  const shown = rows.slice(pg * pageSize, pg * pageSize + pageSize);
  const action = p.rowAction;
  const actionAgent = action?.agent ? agentById(ctx.project, action.agent) : null;
  const scorer = block.bind?.agent ? agentById(ctx.project, block.bind.agent) : null;
  const tk = titleKeyOf(table);
  const filtered = needle || Object.values(filters).some(Boolean);
  const colCount = cols.length + (action ? 1 : 0);

  const toggleSort = (key) => setSort((s) => (!s || s.key !== key ? { key, dir: 'desc' } : s.dir === 'desc' ? { key, dir: 'asc' } : null));
  const runAction = (row, e) => {
    e.stopPropagation();
    setOpen(row.id);
    if (!actionAgent) { ctx.notify(`“${action.label}” needs an agent — ask Architect to connect one.`, 'info'); return; }
    runner.run(row.id, actionAgent, `${action.label} for ${row[tk]}${row.company ? ` (${row.company})` : ''}`, { row });
  };

  const toolbar = html`<div class="gx-tbar">
    ${p.searchable !== false ? html`<label class="gx-search">
      <${Icon} name="search" size=${14} />
      <input value=${q} placeholder=${`Search ${table.name.toLowerCase()}…`} onInput=${(e) => { setQ(e.currentTarget.value); setPage(0); }} aria-label=${`Search ${table.name}`} />
      ${q ? html`<button class="gx-search__clear" onClick=${() => setQ('')} aria-label="Clear search"><${Icon} name="x" size=${12} /></button>` : null}
    </label>` : null}
    ${filterCols.map((c) => html`<label class=${cx('gx-filter', filters[c.key] && 'is-on')} key=${c.key}>
      <span>${c.label}</span>
      <select value=${filters[c.key] || ''} onChange=${(e) => { setFilters({ ...filters, [c.key]: e.currentTarget.value }); setPage(0); }} aria-label=${`Filter by ${c.label}`}>
        <option value="">All</option>
        ${(c.options || [...new Set(table.rows.map((r) => r[c.key]))]).map((o) => html`<option value=${o}>${o}</option>`)}
      </select>
      <${Icon} name="chevron-down" size=${12} />
    </label>`)}
    ${filtered ? html`<button class="gx-textbtn" onClick=${() => { setQ(''); setFilters({}); }}>Clear</button>` : null}
    <span class="gx-tbar__count">${plural(rows.length, 'row')}</span>
  </div>`;

  return html`<${Panel} block=${block} table=${table} flush
    sub=${scorer ? html`<span class="gx-agentline"><span class="gx-dot" style=${{ background: scorer.color }}></span>Kept up to date by ${scorer.name}</span>` : null}>
    ${toolbar}
    <div class="gx-tablewrap">
      <table class="gx-table">
        <thead><tr>
          ${cols.map((c) => html`<th key=${c.key} class=${cx(numeric(c.type) && c.type !== 'datetime' && c.type !== 'date' && 'is-num')} aria-sort=${sort?.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}>
            <button class="gx-th" onClick=${() => toggleSort(c.key)}>${c.label}${sort?.key === c.key ? html`<${Icon} name=${sort.dir === 'asc' ? 'arrow-up' : 'arrow-down'} size=${11} />` : null}</button>
          </th>`)}
          ${action ? html`<th class="gx-th-act"><span class="sr-only">Actions</span></th>` : null}
        </tr></thead>
        <tbody>
          ${shown.map((r) => {
            const isOpen = open === r.id;
            const run = runner.runs[r.id];
            return html`
              <tr key=${r.id} class=${cx(isOpen && 'is-open')} onClick=${() => setOpen(isOpen ? null : r.id)} tabindex="0" onKeyDown=${(e) => { if (e.key === 'Enter') setOpen(isOpen ? null : r.id); }}>
                ${cols.map((c) => html`<td key=${c.key} class=${cx(numeric(c.type) && c.type !== 'datetime' && c.type !== 'date' && 'is-num')}><${Cell} col=${c} value=${r[c.key]} /></td>`)}
                ${action ? html`<td class="gx-td-act">
                  <button class=${cx('gx-rowact', run?.status === 'running' && 'is-busy')} onClick=${(e) => runAction(r, e)} disabled=${run?.status === 'running'} title=${actionAgent ? `Runs ${actionAgent.name}` : ''}>
                    ${run?.status === 'running' ? html`<span class="gx-spin"></span>` : html`<${Icon} name="sparkles" size=${13} />`}<span>${action.label}</span>
                  </button>
                </td>` : null}
              </tr>
              ${isOpen ? html`<tr class="gx-exp" key=${r.id + '_x'}><td colspan=${colCount}>
                <div class="gx-exp__grid">
                  ${table.columns.filter((c) => !cols.includes(c)).map((c) => html`<div class=${cx('gx-exp__field', c.type === 'longtext' && 'is-wide')} key=${c.key}><span>${c.label}</span><div><${Cell} col=${{ ...c, type: c.type === 'longtext' ? 'text' : c.type }} value=${r[c.key]} /></div></div>`)}
                </div>
                ${run ? html`<${AgentRun} run=${run} agent=${actionAgent} onClose=${() => runner.clear(r.id)} compact />` : null}
              </td></tr>` : null}`;
          })}
          ${!shown.length ? html`<tr><td colspan=${colCount}>
            <div class="gx-empty">${filtered ? html`No ${table.name.toLowerCase()} match${needle ? html` “${q}”` : ''}. <button class="gx-textbtn" onClick=${() => { setQ(''); setFilters({}); }}>Clear filters</button>` : `No ${table.name.toLowerCase()} yet.`}</div>
          </td></tr>` : null}
        </tbody>
      </table>
    </div>
    ${rows.length > pageSize ? html`<div class="gx-pager">
      <span>${pg * pageSize + 1}–${Math.min(rows.length, (pg + 1) * pageSize)} of ${rows.length}</span>
      <div class="gx-pager__btns">
        <${GxButton} size="sm" variant="ghost" icon="chevron-left" onClick=${() => setPage(Math.max(0, pg - 1))} disabled=${pg === 0} title="Previous page" />
        <span class="gx-pager__n">${pg + 1} / ${pages}</span>
        <${GxButton} size="sm" variant="ghost" icon="chevron-right" onClick=${() => setPage(Math.min(pages - 1, pg + 1))} disabled=${pg >= pages - 1} title="Next page" />
      </div>
    </div>` : null}
  <//>`;
}
