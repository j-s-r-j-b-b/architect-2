// Board-like blocks: kanban (drag cards between columns), cards grid, month calendar.
import { html, useState } from '../../lib/html.js';
import { Icon } from '../../ui/icons.js';
import { cx, timeAgo } from '../../lib/util.js';
import { tableById } from '../../engine/schema.js';
import { updateProject, getProject } from '../../lib/store.js';
import { useGx, Panel, Chip, GxAvatar, BlockNote, fmtValue, titleKeyOf, columnOf, toneFor, lockedForVisitor } from '../util.js';

function Locked({ block, table }) {
  return html`<${Panel} block=${block} table=${table}><${BlockNote} icon="lock" title=${`Only signed-in teammates can see ${table.name.toLowerCase()}`} body=${table.rules} /><//>`;
}

export function KanbanBlock({ block }) {
  const ctx = useGx();
  const p = block.props || {};
  const table = block.bind?.table ? tableById(ctx.project, block.bind.table) : null;
  const [local, setLocal] = useState({}); // live mode: rowId -> group
  const [drag, setDrag] = useState(null);
  const [over, setOver] = useState(null);
  if (!table) return html`<${Panel} block=${block}><${BlockNote} icon="columns" title="Not connected to data" /><//>`;
  if (lockedForVisitor(ctx, table)) return html`<${Locked} block=${block} table=${table} />`;
  const gk = p.groupBy || table.columns.find((c) => c.type === 'status')?.key;
  const gcol = columnOf(table, gk);
  const tk = p.titleKey || titleKeyOf(table);
  const sk = p.subtitleKey;
  const scol = columnOf(table, sk);
  const groupOf = (r) => local[r.id] ?? r[gk];
  const groups = gcol?.options?.length ? gcol.options : [...new Set(table.rows.map((r) => r[gk]))];
  const canDrag = !ctx.isStatic && ctx.mode === 'interact';

  const move = (rowId, g) => {
    const row = table.rows.find((r) => r.id === rowId);
    if (!row || groupOf(row) === g) return;
    if (!ctx.live && ctx.project.id && getProject(ctx.project.id)) {
      updateProject(ctx.project.id, (d) => { const t = d.data.tables.find((x) => x.id === table.id); const r = t?.rows.find((x) => x.id === rowId); if (r) r[gk] = g; });
      ctx.emit('info', `board ${block.id} · moved “${row[tk]}” → ${g}`);
    } else setLocal((s) => ({ ...s, [rowId]: g }));
  };

  return html`<${Panel} block=${block} table=${table} flush>
    <div class="gx-kanban">
      ${groups.map((g) => {
        const items = table.rows.filter((r) => groupOf(r) === g);
        return html`<div key=${g} class=${cx('gx-col', over === g && drag && 'is-over')}
          onDragOver=${(e) => { if (!drag) return; e.preventDefault(); setOver(g); }}
          onDragLeave=${() => setOver((o) => (o === g ? null : o))}
          onDrop=${(e) => { e.preventDefault(); if (drag) move(drag, g); setDrag(null); setOver(null); }}>
          <div class="gx-col__head"><${Chip} value=${g} options=${groups} size="sm" /><span class="gx-col__n">${items.length}</span></div>
          <div class="gx-col__cards">
            ${items.map((r) => html`<div key=${r.id} class=${cx('gx-kcard', drag === r.id && 'is-drag')} draggable=${canDrag ? 'true' : 'false'}
              onDragStart=${(e) => { setDrag(r.id); try { e.dataTransfer.setData('text/plain', r.id); e.dataTransfer.effectAllowed = 'move'; } catch {} }}
              onDragEnd=${() => { setDrag(null); setOver(null); }}>
              <div class="gx-kcard__title">${r[tk]}</div>
              <div class="gx-kcard__meta">
                ${sk ? scol?.type === 'person' || /lead|owner|name|assignee/i.test(sk) ? html`<span class="gx-person gx-person--sm"><${GxAvatar} name=${r[sk]} size=${18} />${r[sk]}</span>` : html`<span>${fmtValue(r[sk], scol?.type)}</span>` : null}
                ${r.created ? html`<span class="gx-kcard__time">${timeAgo(r.created)}</span>` : null}
              </div>
              ${canDrag ? html`<span class="gx-kcard__grip" aria-hidden="true"><${Icon} name="gx-grip" size=${12} /></span>` : null}
            </div>`)}
            ${!items.length ? html`<div class="gx-col__empty">${drag ? 'Drop here' : 'Nothing here'}</div>` : null}
          </div>
        </div>`;
      })}
    </div>
  <//>`;
}

export function CardsBlock({ block }) {
  const ctx = useGx();
  const p = block.props || {};
  const table = block.bind?.table ? tableById(ctx.project, block.bind.table) : null;
  if (!table) return html`<${Panel} block=${block}><${BlockNote} icon="layout-grid" title="Not connected to data" /><//>`;
  if (lockedForVisitor(ctx, table)) return html`<${Locked} block=${block} table=${table} />`;
  const tk = p.titleKey || titleKeyOf(table);
  const bk = p.badgeKey || table.columns.find((c) => c.type === 'status')?.key;
  const bcol = columnOf(table, bk);
  const metas = (p.metaKeys || table.columns.filter((c) => c.key !== tk && c.key !== bk && c.type !== 'longtext').slice(0, 2).map((c) => c.key)).map((k) => columnOf(table, k)).filter(Boolean);
  const rows = table.rows.slice(0, p.limit || 9);
  return html`<${Panel} block=${block} table=${table} bodyClass="gx-cards-body">
    ${rows.length ? html`<div class="gx-cards">
      ${rows.map((r) => html`<div class="gx-tile" key=${r.id}>
        <div class="gx-tile__top">
          ${columnOf(table, tk)?.type === 'person' ? html`<${GxAvatar} name=${r[tk]} size=${30} />` : html`<span class=${cx('gx-tile__mark', `gx-t-${toneFor(r[bk], bcol?.options)}`)}>${String(r[tk] || '?').slice(0, 1)}</span>`}
          ${bk ? html`<${Chip} value=${r[bk]} options=${bcol?.options} size="sm" />` : null}
        </div>
        <div class="gx-tile__title">${r[tk]}</div>
        ${p.subtitleKey ? html`<div class="gx-tile__sub">${fmtValue(r[p.subtitleKey], columnOf(table, p.subtitleKey)?.type)}</div>` : null}
        <dl class="gx-tile__meta">${metas.map((c) => html`<div key=${c.key}><dt>${c.label}</dt><dd>${fmtValue(r[c.key], c.type)}</dd></div>`)}</dl>
      </div>`)}
    </div>` : html`<${BlockNote} icon="layout-grid" title=${`No ${table.name.toLowerCase()} yet`} />`}
  <//>`;
}

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export function CalendarBlock({ block }) {
  const ctx = useGx();
  const p = block.props || {};
  const table = block.bind?.table ? tableById(ctx.project, block.bind.table) : null;
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  if (table && lockedForVisitor(ctx, table)) return html`<${Locked} block=${block} table=${table} />`;
  const dk = p.dateKey || table?.columns.find((c) => c.type === 'date' || c.type === 'datetime')?.key;
  const tk = p.titleKey || titleKeyOf(table);
  const first = new Date(cursor.y, cursor.m, 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const byDay = {};
  for (const r of table?.rows || []) {
    const d = r[dk] ? new Date(r[dk]) : null;
    if (d && d.getFullYear() === cursor.y && d.getMonth() === cursor.m) (byDay[d.getDate()] = byDay[d.getDate()] || []).push(r);
  }
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);
  const isToday = (d) => d && cursor.y === now.getFullYear() && cursor.m === now.getMonth() && d === now.getDate();
  const shift = (n) => setCursor((c) => { const dt = new Date(c.y, c.m + n, 1); return { y: dt.getFullYear(), m: dt.getMonth() }; });
  return html`<${Panel} block=${block} table=${table} actions=${html`<div class="gx-calnav">
      <button class="gx-iconbtn" onClick=${() => shift(-1)} aria-label="Previous month"><${Icon} name="chevron-left" size=${14} /></button>
      <span>${first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
      <button class="gx-iconbtn" onClick=${() => shift(1)} aria-label="Next month"><${Icon} name="chevron-right" size=${14} /></button>
    </div>`}>
    <div class="gx-cal">
      ${DOW.map((d) => html`<div class="gx-cal__dow" key=${d}>${d}</div>`)}
      ${cells.map((d, i) => html`<div key=${i} class=${cx('gx-cal__cell', !d && 'is-off', isToday(d) && 'is-today')}>
        ${d ? html`<span class="gx-cal__n">${d}</span>` : null}
        ${(byDay[d] || []).slice(0, 2).map((r) => html`<span class="gx-cal__ev" key=${r.id} title=${r[tk]}>${r[tk]}</span>`)}
        ${(byDay[d] || []).length > 2 ? html`<span class="gx-cal__more">+${byDay[d].length - 2}</span>` : null}
      </div>`)}
    </div>
  <//>`;
}
