// Plan › Mockup — wireframes of every screen: "This is what you're approving".
import { html, useState } from '../../lib/html.js';
import { cx, plural } from '../../lib/util.js';
import { Segmented, Badge, Icon, Empty, Button } from '../../ui/index.js';
import { AppRenderer } from '../../genapp/Renderer.js';
import { agentById, tableById } from '../../engine/schema.js';
import { isBuilt, SectionHead } from './shared.js';

const BLOCK_ICON = { header: 'type', hero: 'sparkles', kpis: 'gauge', table: 'table', chart: 'bar-chart', form: 'clipboard-list', agentChat: 'message-square', agentActivity: 'activity', kanban: 'columns', cards: 'layout-grid', list: 'list', detail: 'file-text', text: 'text-cursor', calendar: 'calendar', steps: 'list-checks' };
const BLOCK_LABEL = { header: 'Page header', hero: 'Hero', kpis: 'Key numbers', table: 'Table', chart: 'Chart', form: 'Form', agentChat: 'Agent chat', agentActivity: 'Agent activity', kanban: 'Board', cards: 'Cards', list: 'List', detail: 'Detail', text: 'Text', calendar: 'Calendar', steps: 'Steps' };

export default function Mockup({ project: p }) {
  const screens = p.screens || [];
  const [sel, setSel] = useState(screens[0]?.id || null);
  const [device, setDevice] = useState('desktop');
  const built = isBuilt(p);
  const [view, setView] = useState('wireframe');
  const screen = screens.find((s) => s.id === sel) || screens[0];

  if (!screens.length) {
    return html`<div class="card"><${Empty} icon="layout-dashboard" title="No screens yet"
      body="Wireframes of every screen appear here as soon as the plan is drafted — so you can see exactly what you're approving before anything is built." /></div>`;
  }
  const mode = built && view === 'built' ? 'interact' : 'wireframe';
  return html`<div class="pl-mock">
    <${SectionHead} icon="layout-dashboard" title="This is what you're approving"
      sub=${mode === 'wireframe' ? 'Wireframes show layout and what each block does — not final colours. Styling comes from Design.' : 'The built app, running on sample data. Switch back to compare with the approved wireframe.'}
      right=${html`
        ${built ? html`<${Segmented} size="sm" value=${view} onChange=${setView} options=${[{ value: 'wireframe', label: 'Wireframe', icon: 'layout-grid' }, { value: 'built', label: 'Built', icon: 'check' }]} />` : null}
        <${Segmented} size="sm" value=${device} onChange=${setDevice} options=${[{ value: 'desktop', icon: 'monitor', tip: 'Desktop' }, { value: 'mobile', icon: 'smartphone', tip: 'Mobile' }]} />`} />
    <div class="pl-mock__grid">
      <nav class="pl-mock__screens" aria-label="Screens">
        ${screens.map((s) => html`<button key=${s.id} class=${cx('pl-screen-item', s.id === screen.id && 'is-active')} onClick=${() => setSel(s.id)}>
          <span class="pl-screen-item__icon"><${Icon} name=${s.icon || 'layout-dashboard'} size=${15} /></span>
          <span class="grow"><span class="pl-screen-item__title">${s.title}</span><span class="pl-screen-item__meta">${s.route} · ${plural(s.blocks.length, 'block')}</span></span>
        </button>`)}
      </nav>
      <div class="pl-mock__stage">
        <div class=${cx('pl-frame', device === 'mobile' && 'pl-frame--mobile')}>
          <div class="pl-frame__bar"><span></span><span></span><span></span><div class="pl-frame__url">${(p.slug || 'app')}.architect.space${screen.route}</div>
            ${mode === 'wireframe' ? html`<${Badge} size="sm" tone="blueprint">Wireframe<//>` : html`<${Badge} size="sm" tone="amber" icon="flask">Sample data<//>`}
          </div>
          <div class="pl-frame__body">
            <${AppRenderer} project=${p} route=${screen.route} device=${device} mode=${mode} onNavigate=${(r) => { const s = screens.find((x) => x.route === r); if (s) setSel(s.id); }} />
          </div>
        </div>
        <${BlockList} project=${p} screen=${screen} />
      </div>
    </div>
  </div>`;
}

function BlockList({ project: p, screen }) {
  return html`<div class="card pl-blocks">
    <div class="pl-side-title"><${Icon} name="blocks" size=${15} />On “${screen.title}”</div>
    <ul>
      ${screen.blocks.map((b) => {
        const agent = b.bind?.agent ? agentById(p, b.bind.agent) : null;
        const table = b.bind?.table ? tableById(p, b.bind.table) : null;
        return html`<li key=${b.id}>
          <span class="pl-blocks__icon"><${Icon} name=${BLOCK_ICON[b.type] || 'box'} size=${14} /></span>
          <span class="grow t-truncate"><b>${b.title || b.props?.title || BLOCK_LABEL[b.type] || b.type}</b> <span class="t-faint">· ${BLOCK_LABEL[b.type] || b.type}</span></span>
          ${table ? html`<a class="pl-ref" href=${`/p/${p.id}/data/${table.id}`}><${Icon} name="table" size=${12} />${table.name}</a>` : null}
          ${agent ? html`<a class="pl-ref pl-ref--agent" href=${`/p/${p.id}/agents/${agent.id}`}><${Icon} name="bot" size=${12} />${agent.name}</a>` : null}
          ${b.promise ? html`<a class="pl-ref pl-ref--promise" href=${`/p/${p.id}/plan/spec`} title="Fulfils this promise">${b.promise}</a>` : null}
        </li>`;
      })}
    </ul>
    <div class="row gap-8 mt-12 wrap">
      <${Button} size="sm" variant="ghost" icon="pencil" href=${`/p/${p.id}/app?route=${encodeURIComponent(screen.route)}`}>Open in the editor<//>
    </div>
  </div>`;
}
