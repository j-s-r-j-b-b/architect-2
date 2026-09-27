// Bottom console drawer for the App tab: build logs + runtime events, and open problems
// (fix cards from chat, runtime errors) with one-click "Ask Architect to fix".
import { html, useState, useEffect, useRef } from '../../lib/html.js';
import { Icon, IconButton, Button, Badge, Segmented } from '../../ui/index.js';
import { gxEvents, clearGxEvents } from '../../genapp/runtime.js';
import { askArchitect, consoleOpen } from '../bus.js';
import { cx, plural } from '../../lib/util.js';

export const openFixes = (project) => (project.chat || []).filter((m) => m.type === 'fix' && m.data?.status === 'open');
export const errorEvents = (project) => gxEvents.value.filter((e) => e.projectId === project.id && e.level === 'error');
export const problemCount = (project) => openFixes(project).length + errorEvents(project).length;

function bootLines(project) {
  const t = project.updatedAt || Date.now();
  const s = project.screens || [];
  const blocks = s.reduce((a, x) => a + (x.blocks?.length || 0), 0);
  const tables = (project.data?.tables || []).map((tb) => `${tb.name} (${tb.source || 'sample'})`).join(', ');
  return [
    { at: t - 4200, level: 'info', text: `preview · ${project.slug}--draft is ready` },
    { at: t - 3300, level: 'debug', text: `compiled ${plural(s.length, 'screen')} · ${plural(blocks, 'block')}` },
    { at: t - 2200, level: 'info', text: `data · ${tables || 'no tables yet'}` },
    { at: t - 1000, level: 'info', text: `GET ${s[0]?.route || '/'} 200` },
  ];
}

const clock = (at) => new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

function Problem({ title, meta, impact, free, onFix }) {
  return html`<div class="pv-problem">
    <span class="pv-problem__icon"><${Icon} name="alert-triangle" size=${15} /></span>
    <div class="pv-problem__body">
      <div class="pv-problem__title">${title}</div>
      ${meta ? html`<div class="pv-problem__meta">${meta}</div>` : null}
      ${impact ? html`<div class="pv-problem__meta">Impact: ${impact}</div>` : null}
    </div>
    ${free ? html`<${Badge} tone="green" size="sm">Free fix<//>` : null}
    <${Button} size="sm" variant="primary" icon="sparkles" onClick=${onFix}>Ask Architect to fix<//>
  </div>`;
}

export function PreviewConsole({ project }) {
  const fixes = openFixes(project);
  const errs = errorEvents(project);
  const n = fixes.length + errs.length;
  const [tab, setTab] = useState(n ? 'problems' : 'output');
  const [filter, setFilter] = useState('all');
  const bodyRef = useRef(null);

  const events = gxEvents.value.filter((e) => e.projectId === project.id);
  let lines = [...(project.build?.logs || []), ...events].sort((a, b) => a.at - b.at);
  if (!lines.length) lines = bootLines(project);
  if (filter === 'errors') lines = lines.filter((l) => l.level === 'error' || l.level === 'warn');

  useEffect(() => { const el = bodyRef.current; if (el && tab === 'output') el.scrollTop = el.scrollHeight; }, [lines.length, tab]);

  const fix = (what, where, id) => askArchitect(`Please fix this problem: ${what}${where ? ` (in ${where})` : ''}.`, { kind: 'error', id, label: what });

  return html`<section class="pv-console" aria-label="Preview console">
    <header class="pv-console__head">
      <div class="pv-console__tabs" role="tablist">
        <button role="tab" aria-selected=${tab === 'output'} class=${cx('pv-ctab', tab === 'output' && 'is-active')} onClick=${() => setTab('output')}><${Icon} name="terminal" size=${13} />Output</button>
        <button role="tab" aria-selected=${tab === 'problems'} class=${cx('pv-ctab', tab === 'problems' && 'is-active')} onClick=${() => setTab('problems')}><${Icon} name="alert-triangle" size=${13} />Problems${n ? html`<span class="pv-ccount">${n}</span>` : null}</button>
      </div>
      <span class="grow"></span>
      ${tab === 'output' ? html`<${Segmented} size="sm" value=${filter} onChange=${setFilter} options=${[{ value: 'all', label: 'All' }, { value: 'errors', label: 'Issues' }]} />
        <${IconButton} size="sm" icon="trash" label="Clear output" onClick=${() => clearGxEvents(project.id)} />` : null}
      <${IconButton} size="sm" icon="x" label="Close console" onClick=${() => { consoleOpen.value = false; }} />
    </header>
    <div class="pv-console__body" ref=${bodyRef}>
      ${tab === 'output' ? html`<div class="pv-log">
        ${lines.length ? lines.map((l, i) => html`<div key=${l.id || i} class=${cx('pv-log__line', `is-${l.level || 'info'}`)}>
          <span class="pv-log__t">${clock(l.at)}</span><span class="pv-log__lv">${l.level || 'info'}</span><span class="pv-log__txt">${l.text}</span>
        </div>`) : html`<div class="pv-console__empty">No warnings or errors.</div>`}
      </div>` : n ? html`<div class="pv-problems">
        ${fixes.map((m) => html`<${Problem} key=${m.id} title=${m.data.what || m.text || 'Something went wrong'} meta=${[m.data.where, m.data.cause].filter(Boolean).join(' · ')} impact=${m.data.impact} free=${m.data.free} onFix=${() => fix(m.data.what || m.text, m.data.where, m.data.errorId || m.id)} />`)}
        ${errs.map((e) => html`<${Problem} key=${e.id} title=${e.text} meta=${[e.file, clock(e.at)].filter(Boolean).join(' · ')} onFix=${() => fix(e.text, e.file, e.id)} />`)}
      </div>` : html`<div class="pv-console__empty"><${Icon} name="check-circle" size=${16} />No problems. Your app runs clean in the draft preview.</div>`}
    </div>
  </section>`;
}
