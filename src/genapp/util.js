// Shared pieces for generated-app blocks: renderer context, block metadata,
// value formatting, status tones, honest-data badges and in-place editing.
import { html, createContext, useContext, useRef, useLayoutEffect, useState, useEffect } from '../lib/html.js';
import { Icon, registerIcons } from '../ui/icons.js';
import { cx, fmtNumber, fmtMoney, fmtDate, timeAgo, initials, colorFor } from '../lib/util.js';
import { tableById, agentById } from '../engine/schema.js';

registerIcons({
  'gx-select': '<path d="M12.03 12.68a.5.5 0 0 1 .65-.65l9 3.5a.5.5 0 0 1-.03.95l-3.45 1.06a1 1 0 0 0-.66.66l-1.06 3.45a.5.5 0 0 1-.95.03z"/><path d="M5 3a2 2 0 0 0-2 2"/><path d="M19 3a2 2 0 0 1 2 2"/><path d="M5 21a2 2 0 0 1-2-2"/><path d="M9 3h1"/><path d="M9 21h2"/><path d="M14 3h1"/><path d="M3 9v1"/><path d="M21 9v2"/><path d="M3 14v1"/>',
  'gx-grip': '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
});

/** Renderer context: project, mode, live flag, callbacks. */
export const GxCtx = createContext(null);
export const useGx = () => useContext(GxCtx);

/** Plain-language metadata per block type (icons, nouns for X-ray labels, wireframe heights). */
export const TYPE_META = {
  header: { icon: 'type', noun: 'header', label: 'Page header' },
  hero: { icon: 'sparkles', noun: 'hero', label: 'Hero banner' },
  kpis: { icon: 'gauge', noun: 'KPI tiles', label: 'KPI tiles' },
  table: { icon: 'table', noun: 'table', label: 'Table' },
  chart: { icon: 'bar-chart', noun: 'chart', label: 'Chart' },
  form: { icon: 'clipboard-list', noun: 'form', label: 'Form' },
  agentChat: { icon: 'message-square', noun: 'chat', label: 'Agent chat' },
  agentActivity: { icon: 'activity', noun: 'activity feed', label: 'Agent activity' },
  kanban: { icon: 'columns', noun: 'board', label: 'Board' },
  cards: { icon: 'layout-grid', noun: 'cards', label: 'Cards' },
  list: { icon: 'list', noun: 'list', label: 'List' },
  detail: { icon: 'panel-right', noun: 'details', label: 'Details' },
  text: { icon: 'text-cursor', noun: 'text', label: 'Text' },
  calendar: { icon: 'calendar', noun: 'calendar', label: 'Calendar' },
  steps: { icon: 'list-checks', noun: 'steps', label: 'Steps' },
};
export const metaFor = (type) => TYPE_META[type] || { icon: 'box', noun: 'block', label: type || 'Block' };

/** "Leads table", "Ask Lead Desk chat" — human label for a block. */
export function blockLabel(block, screen) {
  const m = metaFor(block.type);
  const title = block.title || block.props?.title || (block.type === 'kpis' || block.type === 'header' ? screen?.title : '') || '';
  if (!title) return m.label;
  return title.toLowerCase().includes(m.noun.toLowerCase().split(' ')[0]) ? title : `${title} ${m.noun}`;
}

/** Resolve the table + agent a block is bound to. */
export function bindingOf(project, block) {
  const table = block.bind?.table ? tableById(project, block.bind.table) : null;
  const agentId = block.bind?.agent || block.props?.rowAction?.agent || null;
  const agent = agentId ? agentById(project, block.bind?.agent || agentId) : null;
  return { table, agent };
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------
export function fmtValue(v, type) {
  if (v === null || v === undefined || v === '') return '—';
  switch (type) {
    case 'money': return fmtMoney(Number(v));
    case 'percent': return `${fmtNumber(Number(v))}%`;
    case 'number': case 'score': return fmtNumber(Number(v));
    case 'date': return fmtDate(v, { month: 'short', day: 'numeric' });
    case 'datetime': return timeAgo(v);
    case 'bool': return v ? 'Yes' : 'No';
    case 'tags': return Array.isArray(v) ? v.join(', ') : String(v);
    default: return String(v);
  }
}

/** First text-ish column of a table (row titles in search, cards, lists). */
export function titleKeyOf(table) {
  const c = table?.columns?.find((x) => x.type === 'person' || x.type === 'text') || table?.columns?.[0];
  return c?.key || 'id';
}
export const columnOf = (table, key) => table?.columns?.find((c) => c.key === key) || null;

// ---------------------------------------------------------------------------
// Status chips: semantic tone by value, fallback by option index
// ---------------------------------------------------------------------------
const TONE_WORDS = [
  ['green', /^(won|done|approved|active|paid|resolved|completed?|shipped|live|passed|hired|accepted|success|healthy|on track|in stock|published|confirmed|delivered|closed won|verified|ready)$/i],
  ['red', /^(lost|rejected|failed|overdue|urgent|critical|blocked|cancell?ed|denied|churned|error|at risk|out of stock|closed lost|high risk|fraud|escalated)$/i],
  ['orange', /^(hot|high|priority)$/i],
  ['amber', /^(pending|needs approval|needs review|in review|review|in progress|waiting|medium|warm|draft|on hold|low stock|flagged|processing|awaiting)$/i],
  ['blue', /^(new|open|todo|to do|scheduled|cold|low|submitted|invited|backlog|queued|planned|webinar)$/i],
  ['violet', /^(meeting|interview|qualified|demo|proposal|negotiation|screening|referral)$/i],
  ['teal', /^(contacted|replied|in contact|onboarding|website)$/i],
  ['grey', /^(sent|archived|closed|inactive|other|unknown|n\/a|none|skipped|outbound)$/i],
];
const FALLBACK_TONES = ['blue', 'violet', 'teal', 'amber', 'pink', 'green', 'orange', 'grey'];
export function toneFor(value, options = []) {
  const v = String(value ?? '').trim();
  for (const [tone, re] of TONE_WORDS) if (re.test(v)) return tone;
  const i = options.indexOf(v);
  let h = 0; for (const c of v) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return FALLBACK_TONES[(i >= 0 ? i : h) % FALLBACK_TONES.length];
}
export function Chip({ value, options, size }) {
  if (value === null || value === undefined || value === '') return html`<span class="gx-muted">—</span>`;
  return html`<span class=${cx('gx-chip', `gx-t-${toneFor(value, options)}`, size === 'sm' && 'gx-chip--sm')}><i></i>${value}</span>`;
}
export function scoreTone(n) { return n >= 75 ? 'green' : n >= 50 ? 'amber' : n >= 30 ? 'orange' : 'red'; }

// ---------------------------------------------------------------------------
// Small visual atoms
// ---------------------------------------------------------------------------
export function GxAvatar({ name = '', size = 24, ring }) {
  return html`<span class=${cx('gx-av', ring && 'gx-av--ring')} style=${{ width: size + 'px', height: size + 'px', fontSize: Math.round(size * 0.4) + 'px', background: colorFor(name) }} title=${name}>${initials(name)}</span>`;
}

/** Honest data: sample → amber badge, test → violet badge, live → nothing. */
export function SourceBadge({ table, floating }) {
  if (!table || table.source === 'live') return null;
  const test = table.source === 'test';
  const tip = test ? `${table.name} holds test data written during development` : `${table.name} is sample data — connect a real source before launch`;
  return html`<span class=${cx('gx-src', test ? 'gx-src--test' : 'gx-src--sample', floating && 'gx-src--float')} title=${tip}><${Icon} name="flask" size=${10} stroke=${2.4} />${test ? 'Test data' : 'Sample data'}</span>`;
}

/** **bold** + line breaks → vnodes (no innerHTML). */
export function mdLite(text = '') {
  const lines = String(text).split('\n');
  return lines.map((line, li) => {
    const parts = line.split(/\*\*(.+?)\*\*/g).map((seg, i) => (i % 2 ? html`<strong>${seg}</strong>` : seg));
    return li < lines.length - 1 ? [parts, html`<br />`] : parts;
  });
}

// ---------------------------------------------------------------------------
// In-place editing (Edit mode). Free edits — no credits, saved as a checkpoint.
// ---------------------------------------------------------------------------
/**
 * Single-line editable text. Renders plain text unless the renderer is in Edit mode.
 *   <${Editable} as="h1" class="gx-h1" value=${title} onSave=${(v) => ...} />
 */
export function Editable({ as = 'span', value, onSave, class: cls, placeholder = 'Type…' }) {
  const ctx = useGx();
  const ref = useRef(null);
  const Tag = as;
  const editing = !!(ctx && ctx.canEdit && onSave);
  useLayoutEffect(() => {
    if (editing && ref.current && document.activeElement !== ref.current) ref.current.textContent = value ?? '';
  }, [editing, value]);
  if (!editing) return html`<${Tag} key="v" class=${cls}>${value}<//>`;
  const commit = (e) => {
    const v = e.currentTarget.textContent.replace(/\s+/g, ' ').trim();
    if (!v) { e.currentTarget.textContent = value ?? ''; return; }
    if (v !== (value ?? '')) onSave(v);
  };
  return html`<${Tag} key="e" ref=${ref} class=${cx(cls, 'gx-editable')} contentEditable="true" spellcheck="false" data-gx-edit="" data-placeholder=${placeholder}
    onBlur=${commit}
    onClick=${(e) => e.stopPropagation()}
    onKeyDown=${(e) => {
      if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); }
      if (e.key === 'Escape') { e.currentTarget.textContent = value ?? ''; e.currentTarget.blur(); }
      e.stopPropagation();
    }} />`;
}

/** Multi-line editable (text block bodies): a textarea in Edit mode, formatted text otherwise. */
export function EditableArea({ value, onSave, class: cls, render }) {
  const ctx = useGx();
  const [draft, setDraft] = useState(value || '');
  const ref = useRef(null);
  useEffect(() => { setDraft(value || ''); }, [value]);
  useLayoutEffect(() => { const el = ref.current; if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 2 + 'px'; } });
  if (!(ctx && ctx.canEdit && onSave)) return html`<div class=${cls}>${render ? render(value) : value}</div>`;
  return html`<textarea ref=${ref} class=${cx(cls, 'gx-editarea')} data-gx-edit="" value=${draft} spellcheck="false"
    onInput=${(e) => setDraft(e.currentTarget.value)}
    onClick=${(e) => e.stopPropagation()}
    onKeyDown=${(e) => { if (e.key === 'Escape') { setDraft(value || ''); e.currentTarget.blur(); } e.stopPropagation(); }}
    onBlur=${() => { const v = draft.trim(); if (v && v !== (value || '')) onSave(v); else setDraft(value || ''); }}></textarea>`;
}

/**
 * Generated-app button. In Edit mode the label becomes editable (and the button inert).
 * variant: primary | secondary | ghost | soft
 */
export function GxButton({ label, icon, variant = 'secondary', size, onClick, onSaveLabel, disabled, type = 'button', class: cls, title, busy }) {
  const ctx = useGx();
  const classes = cx('gx-btn', `gx-btn--${variant}`, size === 'sm' && 'gx-btn--sm', cls);
  const ic = busy ? html`<span class="gx-spin"></span>` : icon ? html`<${Icon} name=${icon} size=${size === 'sm' ? 13 : 15} />` : null;
  if (ctx && ctx.canEdit && onSaveLabel) {
    return html`<span class=${cx(classes, 'is-editing')}>${ic}<${Editable} value=${label} onSave=${onSaveLabel} /></span>`;
  }
  return html`<button type=${type} class=${classes} onClick=${onClick} disabled=${disabled || busy} title=${title}>${ic}${label ? html`<span>${label}</span>` : null}</button>`;
}

/** Card frame used by most blocks: title row with honest badge + actions. */
export function Panel({ block, title, icon, table, actions, children, class: cls, bodyClass, flush, sub }) {
  const ctx = useGx();
  const t = title ?? block?.title;
  const onSave = block && block.title !== undefined ? (v) => ctx.saveEdit(block.id, (b) => { b.title = v; }, 'block title') : null;
  return html`<div class=${cx('gx-card', cls)}>
    ${t || table || actions ? html`<div class="gx-card__head">
      ${icon ? html`<span class="gx-card__icon"><${Icon} name=${icon} size=${14} /></span>` : null}
      <div class="gx-card__titles">
        ${t ? html`<${Editable} as="h3" class="gx-card__title" value=${t} onSave=${onSave} />` : null}
        ${sub ? html`<div class="gx-card__sub">${sub}</div>` : null}
      </div>
      <${SourceBadge} table=${table} />
      ${actions ? html`<div class="gx-card__actions">${actions}</div>` : null}
    </div>` : null}
    <div class=${cx('gx-card__body', flush && 'is-flush', bodyClass)}>${children}</div>
  </div>`;
}

/** Friendly placeholder inside a block (empty data, missing binding…). */
export function BlockNote({ icon = 'info', title, body, action }) {
  return html`<div class="gx-note">
    <span class="gx-note__icon"><${Icon} name=${icon} size=${16} /></span>
    <div class="gx-note__title">${title}</div>
    ${body ? html`<div class="gx-note__body">${body}</div>` : null}
    ${action || null}
  </div>`;
}

/** Visitors can't see data whose access rule requires signing in. */
export function lockedForVisitor(ctx, table) {
  if (!table || ctx.actAs !== 'visitor') return false;
  return /sign(ed)?[\s-]?in|teammate|member|owner|private|staff|employee|admin/i.test(table.rules || '');
}
