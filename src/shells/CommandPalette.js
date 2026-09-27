// Command palette (Ctrl/Cmd+K): actions, projects and pages. ↑↓ to move, Enter to run, Esc to close.
import { html, useState, useEffect, useRef, useMemo } from '../lib/html.js';
import { paletteOpen, openHelper } from './bus.js';
import { navigate, route } from '../lib/router.js';
import { projectList, prefs, setPrefs, resolvedTheme } from '../lib/store.js';
import { Icon, Kbd, StatusPill } from '../ui/index.js';
import { cx, timeAgo } from '../lib/util.js';

const PAGES = [
  ['Start', '/start', 'sparkles'], ['Projects', '/projects', 'folder'], ['Agents', '/agents', 'bot'], ['Connections', '/connections', 'plug'],
  ['Marketplace', '/marketplace', 'store'], ['Templates', '/templates', 'layout-grid'], ['Inbox', '/inbox', 'bell'], ['Usage & budgets', '/usage', 'gauge'],
  ['Plans & billing', '/billing', 'credit-card'], ['Settings', '/settings', 'settings'], ['API & CLI tokens', '/settings/tokens', 'terminal'], ['Admin console', '/admin', 'building'],
  ['Help center', '/help', 'help'], ['Trash', '/projects/trash', 'trash'],
];
const TABS = [['App', 'app', 'monitor'], ['Plan', 'plan', 'list-checks'], ['Data', 'data', 'database'], ['Agents', 'agents', 'bot'], ['Code', 'code', 'code'], ['Insights', 'insights', 'bar-chart'], ['Launch', 'launch', 'rocket']];

export default function CommandPalette() {
  const open = paletteOpen.value;
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  useEffect(() => { if (open) { setQ(''); setIdx(0); setTimeout(() => inputRef.current?.focus(), 20); } }, [open]);

  const items = useMemo(() => {
    if (!open) return [];
    const pm = route.value.path.match(/^\/p\/([^/]+)/);
    const cur = pm && projectList.value.find((p) => p.id === pm[1]);
    const dark = resolvedTheme() === 'dark';
    const out = [
      { group: 'Actions', label: 'New project', icon: 'plus', hint: 'Describe an app', run: () => navigate('/start') },
      { group: 'Actions', label: 'Import a project', icon: 'upload', hint: 'GitHub, ZIP, agent code', run: () => navigate('/start/import') },
      { group: 'Actions', label: 'Help me decide what to build', icon: 'compass', run: () => navigate('/start/consultant') },
      { group: 'Actions', label: dark ? 'Switch to light mode' : 'Switch to dark mode', icon: dark ? 'sun' : 'moon', run: () => setPrefs({ theme: dark ? 'light' : 'dark' }) },
      { group: 'Actions', label: `Experience: ${prefs.value.experience === 'full' ? 'use Balanced' : 'Show me everything'}`, icon: 'sliders', run: () => setPrefs({ experience: prefs.value.experience === 'full' ? 'balanced' : 'full' }) },
      { group: 'Actions', label: 'Ask for help', icon: 'help', run: () => openHelper() },
    ];
    if (cur) TABS.forEach(([l, t, i]) => out.push({ group: cur.name, label: `${l}`, icon: i, hint: `Go to ${l} tab`, run: () => navigate(`/p/${cur.id}/${t}`) }));
    projectList.value.slice(0, 20).forEach((p) => out.push({ group: 'Projects', label: p.name, icon: p.icon || 'folder', status: p.status, hint: `Edited ${timeAgo(p.updatedAt)}`, run: () => navigate(`/p/${p.id}/${['draft', 'planning', 'ready'].includes(p.status) ? 'plan' : 'app'}`) }));
    PAGES.forEach(([l, h, i]) => out.push({ group: 'Pages', label: l, icon: i, run: () => navigate(h) }));
    const s = q.trim().toLowerCase();
    if (!s) return out.filter((x) => x.group !== 'Projects' || out.indexOf(x) < 40).slice(0, 40);
    const words = s.split(/\s+/);
    return out.filter((x) => words.every((w) => `${x.label} ${x.group} ${x.hint || ''}`.toLowerCase().includes(w)))
      .sort((a, b) => (b.label.toLowerCase().startsWith(s) ? 1 : 0) - (a.label.toLowerCase().startsWith(s) ? 1 : 0));
  }, [open, q, projectList.value, route.value.path]);

  useEffect(() => { setIdx(0); }, [q]);
  useEffect(() => { listRef.current?.querySelector('.is-active')?.scrollIntoView({ block: 'nearest' }); }, [idx]);
  if (!open) return null;

  const close = () => { paletteOpen.value = false; };
  const run = (it) => { if (!it) return; close(); it.run(); };
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(items.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); run(items[idx]); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
  };
  let lastGroup = null;
  return html`<div class="ap-pal-overlay" onMouseDown=${(e) => { if (e.target === e.currentTarget) close(); }}>
    <div class="ap-pal anim-pop" role="dialog" aria-modal="true" aria-label="Command palette">
      <div class="ap-pal__search"><${Icon} name="search" size=${16} /><input ref=${inputRef} class="grow" placeholder="Search projects, pages and actions…" value=${q} onInput=${(e) => setQ(e.currentTarget.value)} onKeyDown=${onKey} aria-label="Search" role="combobox" aria-expanded="true" aria-controls="ap-pal-list" /><${Kbd}>Esc<//></div>
      <div class="ap-pal__list" id="ap-pal-list" role="listbox" ref=${listRef}>
        ${items.length ? items.map((it, i) => {
          const head = it.group !== lastGroup ? html`<div class="ap-pal__group">${it.group}</div>` : null;
          lastGroup = it.group;
          return html`${head}<button type="button" role="option" aria-selected=${i === idx} class=${cx('ap-pal__item', i === idx && 'is-active')} onMouseMove=${() => i !== idx && setIdx(i)} onClick=${() => run(it)}>
            <${Icon} name=${it.icon} size=${15} /><span class="grow t-truncate">${it.label}</span>
            ${it.status ? html`<${StatusPill} status=${it.status} size="sm" />` : null}
            ${it.hint ? html`<span class="ap-pal__hint">${it.hint}</span>` : null}
            ${i === idx ? html`<${Icon} name="corner-down-left" size=${13} class="t-faint" />` : null}
          </button>`;
        }) : html`<div class="ap-pal__empty">No results for “${q}”</div>`}
      </div>
      <div class="ap-pal__foot"><span><${Kbd}>↑<//><${Kbd}>↓<//> move</span><span><${Kbd}>Enter<//> open</span><span><${Kbd}>Esc<//> close</span></div>
    </div>
  </div>`;
}
