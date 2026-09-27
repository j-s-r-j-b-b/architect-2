// X-ray: every block shows what powers it (data, agent, code, promise).
// The chip is always visible in X-ray mode; clicking a block opens the detail card.
import { html } from '../lib/html.js';
import { navigate } from '../lib/router.js';
import { prefs } from '../lib/store.js';
import { Icon } from '../ui/icons.js';
import { Button, StatusPill, Badge } from '../ui/index.js';
import { openConnectSheet } from '../shells/ConnectSheet.js';
import { integrationById } from '../engine/catalog.js';
import { usagesOf } from '../engine/schema.js';
import { cx, plural } from '../lib/util.js';
import { useGx, metaFor, blockLabel, bindingOf } from './util.js';

const SRC = { sample: 'Sample', test: 'Test', live: 'Live' };

export function XrayChip({ block, screen, state }) {
  const ctx = useGx();
  const { table, agent } = bindingOf(ctx.project, block);
  const m = metaFor(block.type);
  const parts = [blockLabel(block, screen)];
  if (table) parts.push(`data: ${table.name} (${SRC[table.source] || table.source})`);
  if (agent) parts.push(`agent: ${agent.name}`);
  if (block.file && prefs.value.experience !== 'guided') parts.push(block.file);
  if (state && state !== 'done') parts.push(state === 'drafting' ? 'building' : 'planned');
  return html`<span class=${cx('gx-xchip', table && table.source !== 'live' && 'has-sample')} aria-hidden="true">
    <${Icon} name=${m.icon} size=${11} /><span>${parts.join(' · ')}</span>
  </span>`;
}

export function XrayCard({ block, screen, align = 'left', onClose }) {
  const ctx = useGx();
  const p = ctx.project;
  const pid = p.id;
  const { table, agent } = bindingOf(p, block);
  const m = metaFor(block.type);
  const promise = block.promise ? p.plan?.promises?.find((x) => x.id === block.promise) : null;
  const also = table ? usagesOf(p, { table: table.id }).filter((u) => u.block.id !== block.id).length : 0;
  const integ = table?.connection ? integrationById(table.connection) : null;
  const go = (to) => { onClose(); navigate(to); };
  const stop = (e) => e.stopPropagation();
  return html`<div class=${cx('gx-xcard', `is-${align}`)} role="dialog" aria-label=${`What powers ${blockLabel(block, screen)}`} onClick=${stop} onMouseDown=${stop}>
    <div class="gx-xcard__head">
      <span class="gx-xcard__icon"><${Icon} name=${m.icon} size=${15} /></span>
      <div class="grow" style="min-width:0">
        <div class="gx-xcard__title">${blockLabel(block, screen)}</div>
        <div class="gx-xcard__sub">${m.label} · ${screen.route}${block.buildState && block.buildState !== 'done' ? ` · ${block.buildState === 'drafting' ? 'being built' : 'planned'}` : ''}</div>
      </div>
      <button class="icon-btn icon-btn--sm" onClick=${onClose} aria-label="Close"><${Icon} name="x" size=${14} /></button>
    </div>

    <div class="gx-xcard__sec">
      <div class="gx-xcard__label"><${Icon} name="database" size=${12} />Data</div>
      ${table ? html`<div class="gx-xcard__row">
          <span class="t-strong">${table.name}</span>
          <span class="t-faint">${plural(table.rows.length, 'row')}</span>
          <${StatusPill} status=${table.source === 'live' ? 'real' : table.source} size="sm" />
        </div>
        ${also ? html`<div class="gx-xcard__hint">Also used by ${plural(also, 'other block')}</div>` : null}
        <div class="gx-xcard__btns">
          ${table.source !== 'live' && table.connection ? html`<${Button} size="sm" variant="primary" icon="plug" onClick=${() => { onClose(); openConnectSheet(table.connection, { projectId: pid }); }}>Connect real data${integ ? ` · ${integ.name}` : ''}<//>` : null}
          <${Button} size="sm" variant="ghost" icon="table" onClick=${() => go(`/p/${pid}/data?table=${encodeURIComponent(table.id)}`)}>View data<//>
        </div>` : html`<div class="gx-xcard__hint">Static content — not connected to a table.</div>`}
    </div>

    <div class="gx-xcard__sec">
      <div class="gx-xcard__label"><${Icon} name="bot" size=${12} />Agent</div>
      ${agent ? html`<div class="gx-xcard__row">
          <span class="gx-xcard__agentdot" style=${{ background: agent.color }}></span>
          <span class="t-strong">${agent.name}</span>
          <${Badge} tone="violet" size="sm">${agent.kind === 'manager' ? 'Manager' : 'Specialist'}<//>
        </div>
        <div class="gx-xcard__hint">${agent.role}</div>
        <div class="gx-xcard__btns"><${Button} size="sm" icon="bot" onClick=${() => go(`/p/${pid}/agents/${agent.id}`)}>Open agent<//></div>`
        : html`<div class="gx-xcard__hint">No agent — this part doesn’t use AI.</div>`}
    </div>

    <div class="gx-xcard__sec">
      <div class="gx-xcard__label"><${Icon} name="code" size=${12} />Code</div>
      ${block.file ? html`<div class="gx-xcard__row"><code class="gx-xcard__file">${block.file}</code></div>
        <div class="gx-xcard__btns"><${Button} size="sm" icon="code" onClick=${() => go(`/p/${pid}/code?file=${encodeURIComponent(block.file)}`)}>Open in Code<//></div>`
        : html`<div class="gx-xcard__hint">Generated when this block is built.</div>`}
      <div class="gx-xcard__hint t-mono">id ${block.id}</div>
    </div>

    ${promise ? html`<div class="gx-xcard__sec">
      <div class="gx-xcard__label"><${Icon} name="badge-check" size=${12} />Promise</div>
      <div class="gx-xcard__row gx-xcard__row--top"><span class="gx-xcard__pid">${promise.id}</span><span class="grow">${promise.title}</span></div>
      <div class="gx-xcard__btns"><${StatusPill} status=${promise.status} size="sm" /><${Button} size="sm" variant="ghost" onClick=${() => go(`/p/${pid}/plan`)}>See in plan<//></div>
    </div>` : null}
  </div>`;
}
