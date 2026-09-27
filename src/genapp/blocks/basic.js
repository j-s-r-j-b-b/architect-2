// Presentational blocks: header, hero, kpis, text, steps, list, detail.
import { html } from '../../lib/html.js';
import { Icon } from '../../ui/icons.js';
import { cx } from '../../lib/util.js';
import { tableById, agentById } from '../../engine/schema.js';
import { useGx, Editable, EditableArea, GxButton, Panel, SourceBadge, mdLite, fmtValue, titleKeyOf, columnOf, Chip, GxAvatar, BlockNote, lockedForVisitor } from '../util.js';

/** Header buttons: jump to a form on the same screen when one exists, otherwise say honestly it isn't wired. */
function useActionHandler(block, screen) {
  const ctx = useGx();
  return (a) => {
    const label = (a.label || '').toLowerCase();
    const form = screen?.blocks.find((b) => b.type === 'form');
    if (form && /add|new|create|submit|request|book|apply/.test(label)) { ctx.scrollToBlock(form.id); return; }
    const chat = screen?.blocks.find((b) => b.type === 'agentChat');
    if (chat && /ask|chat|help/.test(label)) { ctx.scrollToBlock(chat.id); return; }
    ctx.notify(ctx.live ? `“${a.label}” is coming soon.` : `“${a.label}” isn’t wired to anything yet — ask Architect to hook it up.`, 'info');
  };
}

export function HeaderBlock({ block, screen }) {
  const ctx = useGx();
  const p = block.props || {};
  const onAction = useActionHandler(block, screen);
  const save = (fn, what) => (v) => ctx.saveEdit(block.id, (b) => { b.props = b.props || {}; fn(b.props, v); }, what);
  const table = block.bind?.table ? tableById(ctx.project, block.bind.table) : null;
  return html`<div class="gx-header">
    <div class="gx-header__text">
      <${Editable} as="h1" class="gx-h1" value=${p.title || block.title || screen?.title || 'Untitled'} onSave=${save((pr, v) => { pr.title = v; }, 'page title')} />
      ${p.subtitle || ctx.canEdit ? html`<${Editable} as="p" class="gx-header__sub" value=${p.subtitle || ''} placeholder="Add a subtitle" onSave=${save((pr, v) => { pr.subtitle = v; }, 'subtitle')} />` : null}
    </div>
    <${SourceBadge} table=${table} />
    ${p.actions?.length ? html`<div class="gx-header__actions">
      ${p.actions.map((a, i) => html`<${GxButton} key=${i} label=${a.label} icon=${a.icon} variant=${a.variant === 'primary' ? 'primary' : 'secondary'} onClick=${() => onAction(a)}
        onSaveLabel=${save((pr, v) => { pr.actions[i].label = v; }, 'button label')} />`)}
    </div>` : null}
  </div>`;
}

export function HeroBlock({ block, screen }) {
  const ctx = useGx();
  const p = block.props || {};
  const onAction = useActionHandler(block, screen);
  const save = (fn, what) => (v) => ctx.saveEdit(block.id, (b) => { b.props = b.props || {}; fn(b.props, v); }, what);
  return html`<div class=${cx('gx-hero', p.image === 'none' && 'gx-hero--plain')}>
    <div class="gx-hero__inner">
      <${Editable} as="h1" class="gx-hero__title" value=${p.title || block.title || ctx.project.name} onSave=${save((pr, v) => { pr.title = v; }, 'hero title')} />
      ${p.subtitle || ctx.canEdit ? html`<${Editable} as="p" class="gx-hero__sub" value=${p.subtitle || ''} placeholder="Add a subtitle" onSave=${save((pr, v) => { pr.subtitle = v; }, 'hero subtitle')} />` : null}
      <div class="gx-hero__ctas">
        ${p.cta ? html`<${GxButton} variant="primary" label=${p.cta} icon="arrow-right" onClick=${() => onAction({ label: p.cta })} onSaveLabel=${save((pr, v) => { pr.cta = v; }, 'button label')} />` : null}
        ${p.secondaryCta ? html`<${GxButton} variant="ghost" label=${p.secondaryCta} onClick=${() => onAction({ label: p.secondaryCta })} onSaveLabel=${save((pr, v) => { pr.secondaryCta = v; }, 'button label')} />` : null}
      </div>
    </div>
    <div class="gx-hero__art" aria-hidden="true"><span></span><span></span><span></span></div>
  </div>`;
}

const TONE_ICON = { up: 'trending-up', down: 'trending-down', flat: 'minus' };
export function KpisBlock({ block }) {
  const ctx = useGx();
  const items = block.props?.items || [];
  const table = block.bind?.table ? tableById(ctx.project, block.bind.table) : null;
  const save = (i, key, what) => (v) => ctx.saveEdit(block.id, (b) => { b.props.items[i][key] = v; }, what);
  if (!items.length) return html`<${BlockNote} icon="gauge" title="No KPIs yet" body="Ask Architect which numbers matter most." />`;
  return html`<div class="gx-kpis">
    <${SourceBadge} table=${table} floating />
    ${items.map((k, i) => html`<div class="gx-kpi" key=${i}>
      <div class="gx-kpi__top">
        <${Editable} class="gx-kpi__label" value=${k.label} onSave=${save(i, 'label', 'KPI label')} />
        ${k.icon ? html`<span class="gx-kpi__icon"><${Icon} name=${k.icon} size=${15} /></span>` : null}
      </div>
      <${Editable} class="gx-kpi__value" value=${String(k.value ?? '—')} onSave=${save(i, 'value', 'KPI value')} />
      ${k.delta ? html`<div class=${cx('gx-kpi__delta', `is-${k.tone || 'flat'}`)}><${Icon} name=${TONE_ICON[k.tone] || 'minus'} size=${13} /><span>${k.delta}</span></div>` : null}
    </div>`)}
  </div>`;
}

export function TextBlock({ block }) {
  const ctx = useGx();
  const agent = block.bind?.agent ? agentById(ctx.project, block.bind.agent) : null;
  return html`<${Panel} block=${block} icon=${agent ? 'sparkles' : null}>
    <${EditableArea} class="gx-prose" value=${block.props?.body || ''} render=${(v) => (v ? mdLite(v) : html`<span class="gx-muted">Nothing here yet.</span>`)}
      onSave=${(v) => ctx.saveEdit(block.id, (b) => { b.props = b.props || {}; b.props.body = v; }, 'text')} />
    ${agent ? html`<div class="gx-byline"><span class="gx-dot" style=${{ background: agent.color }}></span>Written by ${agent.name}</div>` : null}
  <//>`;
}

export function StepsBlock({ block }) {
  const ctx = useGx();
  const items = block.props?.items || [];
  const save = (i, key, what) => (v) => ctx.saveEdit(block.id, (b) => { b.props.items[i][key] = v; }, what);
  return html`<${Panel} block=${block}>
    <ol class="gx-steps">
      ${items.map((s, i) => html`<li class="gx-step" key=${i}>
        <span class="gx-step__n">${i + 1}</span>
        <div class="gx-step__text">
          <${Editable} class="gx-step__title" value=${s.title} onSave=${save(i, 'title', 'step title')} />
          ${s.body ? html`<${Editable} as="p" class="gx-step__body" value=${s.body} onSave=${save(i, 'body', 'step text')} />` : null}
        </div>
      </li>`)}
    </ol>
  <//>`;
}

export function ListBlock({ block }) {
  const ctx = useGx();
  const p = block.props || {};
  const table = block.bind?.table ? tableById(ctx.project, block.bind.table) : null;
  if (lockedForVisitor(ctx, table)) return html`<${Panel} block=${block} table=${table}><${BlockNote} icon="lock" title=${`Only signed-in teammates can see ${table.name}`} body=${table.rules} /><//>`;
  let items = p.items || [];
  if (table) {
    const tk = p.titleKey || titleKeyOf(table);
    const mc = columnOf(table, p.metaKey);
    items = table.rows.slice(0, p.limit || 6).map((r) => ({ title: r[tk], meta: mc ? fmtValue(r[mc.key], mc.type) : '', status: mc?.type === 'status' ? { v: r[mc.key], o: mc.options } : null, person: columnOf(table, tk)?.type === 'person' }));
  }
  return html`<${Panel} block=${block} table=${table} flush>
    ${items.length ? html`<ul class="gx-list">
      ${items.map((it, i) => html`<li class="gx-list__row" key=${i}>
        ${it.person ? html`<${GxAvatar} name=${it.title} size=${26} />` : html`<span class="gx-list__icon"><${Icon} name=${it.icon || 'circle-dot'} size=${14} /></span>`}
        <span class="gx-list__title">${it.title}</span>
        ${it.status ? html`<${Chip} value=${it.status.v} options=${it.status.o} size="sm" />` : it.meta ? html`<span class="gx-list__meta">${it.meta}</span>` : null}
      </li>`)}
    </ul>` : html`<${BlockNote} icon="list" title="Nothing to show yet" />`}
  <//>`;
}

export function DetailBlock({ block }) {
  const ctx = useGx();
  const table = block.bind?.table ? tableById(ctx.project, block.bind.table) : null;
  const row = table?.rows?.[0];
  if (lockedForVisitor(ctx, table)) return html`<${Panel} block=${block} table=${table}><${BlockNote} icon="lock" title=${`Only signed-in teammates can see ${table.name}`} body=${table.rules} /><//>`;
  if (!row) return html`<${Panel} block=${block} table=${table}><${BlockNote} icon="panel-right" title="No record to show" body=${table ? `${table.name} has no rows yet.` : 'This block is not connected to any data.'} /><//>`;
  const keys = block.props?.fields?.length ? block.props.fields : table.columns.slice(0, 8).map((c) => c.key);
  return html`<${Panel} block=${block} table=${table}>
    <dl class="gx-detail">
      ${keys.map((k) => { const c = columnOf(table, k); if (!c) return null; return html`<div class="gx-detail__row" key=${k}>
        <dt>${c.label}</dt>
        <dd>${c.type === 'status' ? html`<${Chip} value=${row[k]} options=${c.options} />` : c.type === 'person' ? html`<span class="gx-person"><${GxAvatar} name=${row[k]} size=${20} />${row[k]}</span>` : fmtValue(row[k], c.type)}</dd>
      </div>`; })}
    </dl>
  <//>`;
}
