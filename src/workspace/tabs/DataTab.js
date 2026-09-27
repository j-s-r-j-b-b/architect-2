// Data tab: tables (rows / schema), inline editing, CSV import/export, users & rules, SQL console.
import { html, useState, useMemo, useRef, useEffect } from '../../lib/html.js';
import { updateProject, addCheckpoint, logActivity } from '../../lib/store.js';
import { route, setQuery } from '../../lib/router.js';
import { Button, IconButton, Input, Badge, StatusPill, Callout, Icon, Segmented, Empty, toast, Textarea, Select, Avatar, Kbd } from '../../ui/index.js';
import { openConnectSheet } from '../../shells/ConnectSheet.js';
import { integrationById } from '../../engine/catalog.js';
import { usagesOf } from '../../engine/schema.js';
import { cx, uid, fmtMoney, fmtDate, timeAgo, downloadFile, plural, slugify, modKey } from '../../lib/util.js';

const TYPES = ['text', 'number', 'money', 'percent', 'date', 'datetime', 'status', 'email', 'score', 'tags', 'person', 'url', 'bool', 'longtext'];
const NUMERIC = ['number', 'money', 'percent', 'score'];
const SRC = { sample: 'sample', test: 'test', live: 'real' };

// ---------------------------------------------------------------------------
// CSV + SQL helpers (pure)
// ---------------------------------------------------------------------------
function esc(v) { const s = v == null ? '' : Array.isArray(v) ? v.join('; ') : String(v); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }
export function toCSV(cols, rows) {
  const val = (c, r) => ((c.type === 'datetime' || c.type === 'date') && r[c.key] ? new Date(r[c.key]).toISOString() : r[c.key]);
  return [cols.map((c) => esc(c.label)).join(','), ...rows.map((r) => cols.map((c) => esc(val(c, r))).join(','))].join('\n');
}
export function parseCSV(text) {
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',') { row.push(f); f = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
    else f += ch;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}
function coerce(type, raw) {
  if (raw == null) return raw;
  if (NUMERIC.includes(type)) { const n = Number(String(raw).replace(/[$,%\s]/g, '')); return Number.isFinite(n) ? n : raw; }
  if (type === 'bool') return raw === true || /^(true|yes|1)$/i.test(String(raw));
  if (type === 'datetime' || type === 'date') { const t = Date.parse(raw); return Number.isFinite(t) ? t : raw; }
  if (type === 'tags') return Array.isArray(raw) ? raw : String(raw).split(/[;,]/).map((s) => s.trim()).filter(Boolean);
  return raw;
}
function cond(c) {
  const m = c.trim().match(/^(\w+)\s*(!=|<>|>=|<=|=|>|<|not\s+like|like)\s*(.+)$/i);
  if (!m) throw new Error(`Can’t read the condition “${c.trim()}”`);
  const [, k, rawOp, rawV] = m; const op = rawOp.toLowerCase().replace(/\s+/g, ' ');
  const v = rawV.trim(); const val = /^'.*'$|^".*"$/.test(v) ? v.slice(1, -1) : Number.isFinite(Number(v)) ? Number(v) : v;
  return { k, test: (r) => {
    const x = r[k];
    if (op === 'like' || op === 'not like') { const re = new RegExp('^' + String(val).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.') + '$', 'i'); const hit = re.test(String(x ?? '')); return op === 'like' ? hit : !hit; }
    const a = typeof val === 'number' ? Number(x) : String(x ?? '').toLowerCase(); const b = typeof val === 'number' ? val : String(val).toLowerCase();
    return op === '=' ? a === b : op === '!=' || op === '<>' ? a !== b : op === '>' ? a > b : op === '<' ? a < b : op === '>=' ? a >= b : a <= b;
  } };
}
export function runSQL(sql, tables) {
  const m = sql.trim().replace(/;\s*$/, '').match(/^select\s+([\s\S]+?)\s+from\s+(\w+)(?:\s+where\s+([\s\S]+?))?(?:\s+order\s+by\s+(\w+)(?:\s+(asc|desc))?)?(?:\s+limit\s+(\d+))?$/i);
  if (!m) throw new Error('Try: SELECT col, col | * | COUNT(*) FROM table [WHERE …] [ORDER BY col DESC] [LIMIT n]');
  const [, sel, tname, where, ob, dir, lim] = m;
  const t = tables.find((x) => x.id.toLowerCase() === tname.toLowerCase() || slugify(x.name).replace(/-/g, '_') === tname.toLowerCase());
  if (!t) throw new Error(`No table “${tname}”. Available: ${tables.map((x) => x.id).join(', ')}`);
  const keys = new Set(['id', ...t.columns.map((c) => c.key)]);
  const need = (k) => { if (!keys.has(k)) throw new Error(`“${k}” isn’t a column of ${t.id}. Columns: ${[...keys].join(', ')}`); };
  let rows = t.rows.slice();
  if (where) {
    const ors = where.split(/\s+or\s+/i).map((p) => p.split(/\s+and\s+/i).map(cond));
    ors.flat().forEach((c) => need(c.k));
    rows = rows.filter((r) => ors.some((ands) => ands.every((c) => c.test(r))));
  }
  if (ob) { need(ob); const d = (dir || 'asc').toLowerCase() === 'desc' ? -1 : 1; rows.sort((a, b) => (a[ob] > b[ob] ? d : a[ob] < b[ob] ? -d : 0)); }
  if (/^count\(\*\)$/i.test(sel.trim())) return { table: t, columns: ['count'], rows: [{ id: 'c', count: rows.length }] };
  if (lim) rows = rows.slice(0, Number(lim));
  const cols = sel.trim() === '*' ? t.columns.map((c) => c.key) : sel.split(',').map((s) => s.trim());
  cols.forEach(need);
  return { table: t, columns: cols, rows };
}

// ---------------------------------------------------------------------------
// Cells
// ---------------------------------------------------------------------------
function display(col, v) {
  if (v == null || v === '') return html`<span class="t-faint">—</span>`;
  switch (col?.type) {
    case 'money': return fmtMoney(v);
    case 'percent': return `${v}%`;
    case 'datetime': case 'date': return html`<span data-tip=${fmtDate(v)}>${typeof v === 'number' ? (col.type === 'date' ? fmtDate(v) : timeAgo(v)) : String(v)}</span>`;
    case 'status': return html`<span class="dt-status">${String(v)}</span>`;
    case 'score': return html`<span class="dt-score"><span class="dt-score__track"><span style=${{ width: `${Math.max(0, Math.min(100, v))}%` }}></span></span><b>${v}</b></span>`;
    case 'bool': return html`<${Icon} name=${v ? 'check-circle' : 'circle'} size=${14} class=${v ? 't-green' : 't-faint'} />`;
    case 'tags': return (Array.isArray(v) ? v : [v]).map((x) => html`<span class="dt-tag">${x}</span>`);
    case 'email': case 'url': return html`<span class="t-blueprint">${String(v)}</span>`;
    default: return String(v);
  }
}

function CellEditor({ col, value, onCommit, onCancel }) {
  const toLocal = (t) => { if (typeof t !== 'number') return ''; const d = new Date(t); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };
  const [v, setV] = useState(col.type === 'datetime' || col.type === 'date' ? toLocal(value) : Array.isArray(value) ? value.join(', ') : value ?? '');
  const ref = useRef(null);
  const done = useRef(false);
  useEffect(() => { ref.current && ref.current.focus(); }, []);
  const finish = (val, cancel) => { if (done.current) return; done.current = true; cancel ? onCancel() : onCommit(val); };
  const commit = () => finish(ref.current && 'value' in ref.current ? ref.current.value : v);
  const keys = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit(); } if (e.key === 'Escape') { e.preventDefault(); finish(null, true); } };
  if (col.type === 'status' && col.options?.length) {
    return html`<select ref=${ref} class="dt-edit" value=${v} onChange=${(e) => finish(e.currentTarget.value)} onBlur=${() => finish(null, true)} onKeyDown=${keys}>${col.options.map((o) => html`<option value=${o} selected=${o === v}>${o}</option>`)}</select>`;
  }
  const type = NUMERIC.includes(col.type) ? 'number' : col.type === 'datetime' || col.type === 'date' ? 'datetime-local' : 'text';
  return html`<input ref=${ref} class="dt-edit" type=${type} value=${v} onInput=${(e) => setV(e.currentTarget.value)} onBlur=${commit} onKeyDown=${keys} />`;
}

// ---------------------------------------------------------------------------
// Views
// ---------------------------------------------------------------------------
function Rows({ project, table }) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState(null);
  const [edit, setEdit] = useState(null);
  const [limit, setLimit] = useState(100);
  const cols = table.columns;
  let rows = table.rows.filter((r) => !q || cols.some((c) => String(r[c.key] ?? '').toLowerCase().includes(q.toLowerCase())));
  if (sort) rows = [...rows].sort((a, b) => (a[sort.k] > b[sort.k] ? sort.d : a[sort.k] < b[sort.k] ? -sort.d : 0));
  const pid = project.id;

  const setCell = (rowId, col, raw) => {
    setEdit(null);
    const row = table.rows.find((r) => r.id === rowId);
    const next = coerce(col.type, raw === '' ? null : raw);
    if (!row || String(row[col.key] ?? '') === String(next ?? '')) return;
    updateProject(pid, (d) => { const r = d.data.tables.find((t) => t.id === table.id)?.rows.find((x) => x.id === rowId); if (r) r[col.key] = next; });
  };
  const addRow = () => {
    const row = { id: uid('r') };
    for (const c of cols) row[c.key] = c.type === 'status' ? c.options?.[0] ?? '' : NUMERIC.includes(c.type) ? 0 : c.type === 'datetime' || c.type === 'date' ? Date.now() : c.type === 'bool' ? false : '';
    updateProject(pid, (d) => { d.data.tables.find((t) => t.id === table.id).rows.unshift(row); });
    setQ(''); setSort(null);
    const first = cols.find((c) => !['datetime', 'date', 'bool'].includes(c.type));
    if (first) setTimeout(() => setEdit({ id: row.id, k: first.key }), 30);
  };
  const delRow = (row) => {
    const idx = table.rows.findIndex((r) => r.id === row.id);
    updateProject(pid, (d) => { const t = d.data.tables.find((x) => x.id === table.id); t.rows = t.rows.filter((r) => r.id !== row.id); });
    toast('Row deleted', { action: { label: 'Undo', onClick: () => updateProject(pid, (d) => { d.data.tables.find((x) => x.id === table.id).rows.splice(idx, 0, row); }) } });
  };
  const fileRef = useRef(null);
  const importCSV = async (e) => {
    const file = e.currentTarget.files?.[0]; e.currentTarget.value = '';
    if (!file) return;
    const grid = parseCSV(await file.text());
    if (grid.length < 2) { toast('That CSV has no data rows', { tone: 'warn' }); return; }
    const [head, ...body] = grid;
    const map = head.map((h) => { const n = h.trim().toLowerCase(); return cols.find((c) => c.key.toLowerCase() === n || c.label.toLowerCase() === n) || { key: slugify(h).replace(/-/g, '_') || `col_${uid().slice(-3)}`, label: h.trim() || 'Column', type: 'text', isNew: true }; });
    const added = map.filter((c) => c.isNew && c.key !== 'id');
    const newRows = body.map((cells) => { const r = { id: uid('r') }; map.forEach((c, i) => { if (c.key === 'id') return; r[c.key] = coerce(c.type, cells[i] ?? ''); }); return r; });
    addCheckpoint(pid, { label: `Before importing ${file.name}`, summary: `Safety checkpoint before adding ${newRows.length} rows to ${table.name}`, kind: 'safety' });
    updateProject(pid, (d) => { const t = d.data.tables.find((x) => x.id === table.id); for (const c of added) if (!t.columns.some((x) => x.key === c.key)) t.columns.push({ key: c.key, label: c.label, type: 'text' }); t.rows = [...newRows, ...t.rows]; });
    logActivity(pid, { actor: 'You', kind: 'data', plain: `Imported ${plural(newRows.length, 'row')} into ${table.name} from ${file.name}.`, technical: `csv:${file.name} rows:${newRows.length} newCols:${added.map((c) => c.key).join(',') || 'none'}` });
    toast(`Imported ${plural(newRows.length, 'row')}${added.length ? ` and ${plural(added.length, 'new column')}` : ''} · checkpoint saved`, { tone: 'success' });
  };

  return html`<div class="dt-rows">
    <div class="dt-toolbar">
      <div class="dt-search"><${Input} size="sm" icon="search" placeholder=${`Search ${table.rows.length} rows`} value=${q} onValue=${setQ} /></div>
      <span class="grow"></span>
      <input type="file" accept=".csv,text/csv" hidden ref=${fileRef} onChange=${importCSV} />
      <${Button} size="sm" variant="ghost" icon="upload" onClick=${() => fileRef.current?.click()}>Import CSV<//>
      <${Button} size="sm" variant="ghost" icon="download" onClick=${() => { downloadFile(`${table.id}.csv`, toCSV(cols, table.rows), 'text/csv'); toast(`Exported ${plural(table.rows.length, 'row')}`); }}>Export CSV<//>
      <${Button} size="sm" variant="primary" icon="plus" onClick=${addRow}>Add row<//>
    </div>
    <div class="dt-grid-wrap">
      <table class="dt-grid">
        <thead><tr>${cols.map((c) => html`<th onClick=${() => setSort(sort?.k === c.key ? (sort.d === 1 ? { k: c.key, d: -1 } : null) : { k: c.key, d: 1 })} class=${cx(sort?.k === c.key && 'is-sorted')}><span class="row gap-4">${c.label}${sort?.k === c.key ? html`<${Icon} name=${sort.d === 1 ? 'arrow-up' : 'arrow-down'} size=${11} />` : null}</span></th>`)}<th class="dt-actions-col"></th></tr></thead>
        <tbody>
          ${rows.slice(0, limit).map((r) => html`<tr key=${r.id}>
            ${cols.map((c) => {
              const editing = edit && edit.id === r.id && edit.k === c.key;
              return html`<td class=${cx(`dt-c--${c.type}`, editing && 'is-editing')} onClick=${() => { if (c.type === 'bool') setCell(r.id, c, !r[c.key]); else if (!editing) setEdit({ id: r.id, k: c.key }); }}>
                ${editing ? html`<${CellEditor} col=${c} value=${r[c.key]} onCommit=${(v) => setCell(r.id, c, v)} onCancel=${() => setEdit(null)} />` : html`<div class="dt-cell">${display(c, r[c.key])}</div>`}
              </td>`;
            })}
            <td class="dt-actions-col"><${IconButton} size="sm" icon="trash" label="Delete row" onClick=${() => delRow(r)} /></td>
          </tr>`)}
        </tbody>
      </table>
      ${!rows.length ? html`<${Empty} icon=${q ? 'search' : 'table'} title=${q ? 'No rows match' : 'No rows yet'} body=${q ? 'Try a different search.' : 'Add a row or import a CSV.'} />` : null}
      ${rows.length > limit ? html`<div class="t-center p-12"><${Button} size="sm" onClick=${() => setLimit(limit + 200)}>Show more (${rows.length - limit} left)<//></div>` : null}
    </div>
    <div class="dt-foot t-xs t-faint">${plural(rows.length, 'row')}${q ? ` of ${table.rows.length}` : ''} · click a cell to edit · <${Kbd}>Enter<//> saves · <${Kbd}>Esc<//> cancels</div>
  </div>`;
}

function Schema({ project, table }) {
  const uses = usagesOf(project, { table: table.id });
  const upd = (fn) => updateProject(project.id, (d) => { fn(d.data.tables.find((t) => t.id === table.id)); });
  return html`<div class="dt-schema">
    <table class="dt-grid dt-grid--schema">
      <thead><tr><th>Column</th><th>Key</th><th>Type</th><th>Options</th></tr></thead>
      <tbody>${table.columns.map((c, i) => html`<tr key=${c.key}>
        <td><input class="dt-edit dt-edit--ghost" value=${c.label} onChange=${(e) => upd((t) => { t.columns[i].label = e.currentTarget.value || c.label; })} /></td>
        <td><code class="t-mono t-xs">${c.key}</code></td>
        <td><${Select} size="sm" options=${TYPES} value=${c.type} onValue=${(v) => upd((t) => { t.columns[i].type = v; if (v === 'status' && !t.columns[i].options) t.columns[i].options = [...new Set(t.rows.map((r) => r[c.key]).filter(Boolean))].slice(0, 8).map(String); })} /></td>
        <td class="t-xs t-muted">${c.options?.join(' · ') || '—'}</td>
      </tr>`)}</tbody>
    </table>
    <div class="row mt-12"><${Button} size="sm" icon="plus" onClick=${() => upd((t) => { const n = t.columns.length + 1; t.columns.push({ key: `field_${n}`, label: `New field ${n}`, type: 'text' }); })}>Add column<//></div>
    <div class="dt-uses mt-24">
      <div class="t-sm t-strong mb-8">Used by</div>
      ${uses.length ? uses.map((u) => html`<div class="row gap-8 t-sm"><${Icon} name="monitor" size=${13} class="t-faint" /><span>${u.screen.title}</span><span class="t-faint">›</span><span class="t-muted">${u.block.title || u.block.type}</span><code class="t-xs t-faint t-mono">${u.screen.route}</code></div>`) : html`<div class="t-sm t-muted">No screen shows this table yet.</div>`}
    </div>
  </div>`;
}

function UsersRules({ project }) {
  const tables = project.data.tables;
  return html`<div class="dt-pane">
    <h2 class="t-lg t-strong">Users & rules</h2>
    <p class="t-sm t-muted mt-4">Who can sign in to this app, and what each table allows. Rules are written in plain words and enforced on the server.</p>
    <div class="dt-card mt-16">
      <div class="t-sm t-strong mb-8">People with access</div>
      ${(project.members || []).map((m) => html`<div class="row gap-8 dt-member"><${Avatar} name=${m.name} src=${m.photo} size="sm" /><span class="grow t-sm">${m.name}<span class="t-faint"> · ${m.email}</span></span><${Badge} size="sm">${m.role}<//></div>`)}
      ${!(project.members || []).length ? html`<div class="t-sm t-muted">Only you.</div>` : null}
      <div class="t-xs t-faint mt-8">App sign-in: ${project.status === 'live' ? 'enabled for invited users' : 'preview only — set it up when you publish'}.</div>
    </div>
    ${tables.map((t) => html`<div class="dt-card mt-12">
      <div class="row gap-8 mb-8"><${Icon} name=${t.icon || 'table'} size=${14} /><span class="t-sm t-strong grow">${t.name}</span><${StatusPill} status=${SRC[t.source] || 'sample'} size="sm" /></div>
      <${Textarea} rows=${2} value=${t.rules || ''} placeholder="e.g. Only signed-in teammates can see rows. Owners edit their own." onChange=${(e) => { const v = e.currentTarget.value; updateProject(project.id, (d) => { d.data.tables.find((x) => x.id === t.id).rules = v; }); toast('Rule saved', { tone: 'success' }); }} />
    </div>`)}
  </div>`;
}

function SqlConsole({ project }) {
  const first = project.data.tables[0];
  const numeric = first?.columns.find((c) => NUMERIC.includes(c.type));
  const [sql, setSql] = useState(first ? `SELECT ${first.columns.slice(0, 3).map((c) => c.key).join(', ')} FROM ${first.id}${numeric ? ` ORDER BY ${numeric.key} DESC` : ''} LIMIT 5` : '');
  const [res, setRes] = useState(null);
  const [err, setErr] = useState(null);
  const run = () => { try { const t0 = performance.now(); const r = runSQL(sql, project.data.tables); r.ms = Math.max(1, Math.round(performance.now() - t0)); setRes(r); setErr(null); } catch (e) { setErr(e.message); setRes(null); } };
  const colOf = (k) => res?.table.columns.find((c) => c.key === k);
  return html`<div class="dt-pane">
    <div class="row gap-8"><h2 class="t-lg t-strong grow">SQL console</h2><${Badge} tone="blueprint" size="sm">Read-only<//></div>
    <p class="t-sm t-muted mt-4">Query your tables. Supports SELECT, WHERE (${'=, !=, >, <, LIKE, AND / OR'}), ORDER BY, LIMIT and COUNT(*).</p>
    <div class="dt-sql mt-12">
      <textarea class="dt-sql__input t-mono" rows="4" spellcheck="false" value=${sql} onInput=${(e) => setSql(e.currentTarget.value)} onKeyDown=${(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); run(); } }}></textarea>
      <div class="row gap-8 dt-sql__bar"><span class="t-xs t-faint grow">Tables: ${project.data.tables.map((t) => html`<button class="dt-chip-btn" onClick=${() => setSql(`SELECT * FROM ${t.id} LIMIT 10`)}>${t.id}</button>`)}</span><span class="t-xs t-faint">${modKey}+Enter</span><${Button} size="sm" variant="primary" icon="play" onClick=${run}>Run<//></div>
    </div>
    ${err ? html`<${Callout} tone="red" icon="alert-circle" class="mt-12">${err}<//>` : null}
    ${res ? html`<div class="mt-12">
      <div class="t-xs t-muted mb-8">${plural(res.rows.length, 'row')} · ${res.ms} ms</div>
      <div class="dt-grid-wrap"><table class="dt-grid"><thead><tr>${res.columns.map((c) => html`<th>${colOf(c)?.label || c}</th>`)}</tr></thead>
        <tbody>${res.rows.map((r) => html`<tr>${res.columns.map((c) => html`<td><div class="dt-cell">${c === 'count' ? r.count : display(colOf(c), r[c])}</div></td>`)}</tr>`)}</tbody></table></div>
    </div>` : null}
  </div>`;
}

function SourceCallout({ project, table }) {
  const it = table.connection ? integrationById(table.connection) : null;
  const connect = async (id) => { if (await openConnectSheet(id, { projectId: project.id })) toast(`${integrationById(id).name} connected — ${table.name} now uses live data`, { tone: 'success' }); };
  if (table.source === 'live') return html`<${Callout} tone="green" icon="check-circle" class="dt-callout">Live data${it ? ` from ${it.name}` : ''}. Edits here write back to the source.<//>`;
  if (table.source === 'test') return html`<${Callout} tone="violet" icon="flask" class="dt-callout">Test data written during preview runs. It’s kept separate from real data and cleared when you publish.<//>`;
  return html`<${Callout} tone="amber" icon="flask" class="dt-callout" action=${html`<${Button} size="sm" variant="secondary" icon="plug" onClick=${() => connect(table.connection || 'postgres')}>${it ? `Connect ${it.name}` : 'Connect a database'}<//>`}>
    <b>Sample data.</b> ${it ? `Connect ${it.name} to use your real ${table.name.toLowerCase()}.` : 'Import a CSV or connect a database to use real data.'} Every screen using this table shows a “Sample” badge until then.
  <//>`;
}

export default function DataTab({ project }) {
  const tables = project?.data?.tables || [];
  const q = route.value.query;
  const sel = q.table === '__users' || q.table === '__sql' ? q.table : tables.find((t) => t.id === q.table)?.id || tables[0]?.id || '__users';
  const [view, setView] = useState('rows');
  const table = tables.find((t) => t.id === sel);
  const pick = (id) => setQuery({ table: id });
  const totals = useMemo(() => tables.reduce((n, t) => n + t.rows.length, 0), [tables]);

  return html`<div class="dt">
    <aside class="dt-side">
      <div class="dt-side__head t-xs t-faint t-upper">Tables · ${totals} rows</div>
      ${tables.map((t) => html`<button type="button" class=${cx('dt-side__item', sel === t.id && 'is-active')} onClick=${() => pick(t.id)}>
        <${Icon} name=${t.icon || 'table'} size=${15} /><span class="grow t-truncate">${t.name}</span>
        <span class="dt-side__count">${t.rows.length}</span><span class=${cx('dt-src', `dt-src--${t.source}`)} data-tip=${t.source === 'live' ? 'Live data' : t.source === 'test' ? 'Test data' : 'Sample data'}></span>
      </button>`)}
      ${!tables.length ? html`<div class="t-xs t-muted p-12">No tables yet — they’re created when you build.</div>` : null}
      <div class="dt-side__sep"></div>
      <button type="button" class=${cx('dt-side__item', sel === '__users' && 'is-active')} onClick=${() => pick('__users')}><${Icon} name="users" size=${15} /><span class="grow">Users & rules</span></button>
      <button type="button" class=${cx('dt-side__item', sel === '__sql' && 'is-active')} onClick=${() => pick('__sql')}><${Icon} name="terminal" size=${15} /><span class="grow">SQL console</span></button>
    </aside>
    <main class="dt-main">
      ${sel === '__users' ? html`<${UsersRules} project=${project} />` : sel === '__sql' ? html`<${SqlConsole} project=${project} />` : table ? html`
        <div class="dt-head">
          <div class="grow col gap-2" style="min-width:0">
            <div class="row gap-8"><${Icon} name=${table.icon || 'table'} size=${18} /><h2 class="t-lg t-strong t-truncate">${table.name}</h2><${StatusPill} status=${SRC[table.source] || 'sample'} size="sm" /></div>
            <div class="t-xs t-faint">${plural(table.rows.length, 'row')} · ${plural(table.columns.length, 'column')}${table.rules ? ` · ${table.rules}` : ''}</div>
          </div>
          <${Segmented} size="sm" value=${view} onChange=${setView} options=${[{ value: 'rows', label: 'Rows', icon: 'table' }, { value: 'schema', label: 'Schema', icon: 'columns' }]} />
        </div>
        <${SourceCallout} project=${project} table=${table} />
        ${view === 'rows' ? html`<${Rows} project=${project} table=${table} key=${table.id} />` : html`<${Schema} project=${project} table=${table} />`}
      ` : html`<${Empty} icon="database" title="No data yet" body="Tables appear here once your app is planned and built." />`}
    </main>
  </div>`;
}
