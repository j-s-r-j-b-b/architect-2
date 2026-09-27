// Logged-in shell: slim left rail with at most five primary destinations.
// Start · Projects · Agents · Connections · Marketplace — then Inbox, Usage, Help, Account at the bottom.
import { html, useEffect } from '../lib/html.js';
import { Link, route, navigate } from '../lib/router.js';
import { session, prefs, setPrefs, projectList, unreadCount, wallet, resolvedTheme } from '../lib/store.js';
import { signOut, authMode } from '../lib/auth.js';
import { Logo, Icon, IconButton, Avatar, Menu, Ring, Kbd, StatusPill, toast } from '../ui/index.js';
import { cx, modKey, fmtNumber } from '../lib/util.js';
import { openPalette, mobileRailOpen, openHelper } from './bus.js';

const NAV = [
  { href: '/start', label: 'Start', icon: 'sparkles' },
  { href: '/projects', label: 'Projects', icon: 'folder' },
  { href: '/agents', label: 'Agents', icon: 'bot' },
  { href: '/connections', label: 'Connections', icon: 'plug' },
  { href: '/marketplace', label: 'Marketplace', icon: 'store' },
];

export function AppShell({ children, wide }) {
  const collapsed = prefs.value.railCollapsed;
  const me = session.value;
  const recent = projectList.value.slice(0, 4);
  const w = wallet.value;
  const pct = w.monthly ? Math.round((w.balance / Math.max(w.monthly, w.balance)) * 100) : 100;
  useEffect(() => { mobileRailOpen.value = false; }, [route.value.path]);

  const accountItems = [
    { section: me?.email || 'Account' },
    { label: 'Settings', icon: 'settings', href: '/settings' },
    { label: 'Usage & budgets', icon: 'gauge', href: '/usage' },
    { label: 'Plans & billing', icon: 'credit-card', href: '/billing' },
    { label: resolvedTheme() === 'dark' ? 'Light mode' : 'Dark mode', icon: resolvedTheme() === 'dark' ? 'sun' : 'moon', onClick: () => setPrefs({ theme: resolvedTheme() === 'dark' ? 'light' : 'dark' }) },
    { divider: true },
    { label: 'Admin console', icon: 'building', href: '/admin', desc: 'Enterprise governance' },
    { label: 'Public site', icon: 'globe', href: '/' },
    { divider: true },
    { label: 'Sign out', icon: 'log-out', onClick: async () => { await signOut(); toast('Signed out'); navigate('/'); } },
  ];

  return html`<div class="app">
    <aside class=${cx('rail', collapsed && 'is-collapsed', mobileRailOpen.value && 'is-mobile-open')} aria-label="Primary">
      <div class="rail__top">
        <div class="rail__brand">
          <${Logo} href="/start" tag=${!collapsed} />
          <${IconButton} size="sm" icon=${collapsed ? 'panel-right' : 'panel-left'} label=${collapsed ? 'Expand sidebar' : 'Collapse sidebar'} tipPos="right" onClick=${() => setPrefs({ railCollapsed: !collapsed })} />
        </div>
        <button class="rail__search" onClick=${openPalette} data-tip=${collapsed ? 'Search & commands' : undefined} data-tip-pos="right">
          <${Icon} name="search" size=${14} /><span>Search or jump to…</span><${Kbd}>${modKey} K<//>
        </button>
      </div>
      <nav class="rail__nav">
        ${NAV.map((n) => html`<${Link} href=${n.href} class="rail__item" data-tip=${collapsed ? n.label : undefined} data-tip-pos="right"><${Icon} name=${n.icon} size=${17} /><span class="rail__label">${n.label}</span><//>`)}
      </nav>
      ${recent.length ? html`<div class="rail__section">Recent</div>
        <div class="rail__recent">${recent.map((p) => html`<a href=${`/p/${p.id}/${p.status === 'draft' || p.status === 'planning' || p.status === 'ready' ? 'plan' : 'app'}`} title=${p.name}>
          <span class=${cx('dot', p.status === 'live' ? 'dot--green' : p.status === 'building' ? 'dot--amber dot--pulse' : p.status === 'built' ? 'dot--blueprint' : '')}></span>
          <span class="t-truncate">${p.name}</span></a>`)}</div>` : null}
      <div class="rail__bottom">
        <${Link} href="/inbox" class="rail__item" data-tip=${collapsed ? 'Inbox' : undefined} data-tip-pos="right"><${Icon} name="bell" size=${17} /><span class="rail__label">Inbox</span>${unreadCount.value ? html`<span class="rail__count">${unreadCount.value}</span>` : null}<//>
        <button class="rail__item" onClick=${openHelper} data-tip=${collapsed ? 'Help' : undefined} data-tip-pos="right"><${Icon} name="help" size=${17} /><span class="rail__label">Help</span></button>
        <a href="/usage" class="rail__usage" data-tip=${collapsed ? `${fmtNumber(w.balance)} credits left` : undefined} data-tip-pos="right">
          <${Ring} value=${pct} size=${26} stroke=${3.5} tone=${pct < 15 ? 'red' : pct < 35 ? 'amber' : 'blueprint'} />
          <span class="rail__label col gap-2" style="line-height:1.2"><span class="t-strong" style="color:var(--text)">${fmtNumber(w.balance)} credits</span><span class="t-xs t-faint">${w.plan === 'free' ? 'Free plan' : w.plan[0].toUpperCase() + w.plan.slice(1) + ' plan'} · resets monthly</span></span>
        </a>
        <${Menu} align="top-start" width=${240} items=${accountItems} trigger=${(open, toggle) => html`<button class="rail__user" onClick=${toggle} aria-label="Account menu">
          <${Avatar} name=${me?.name || 'Guest'} src=${me?.photo} size="sm" />
          <span class="rail__label col gap-2 grow" style="min-width:0;line-height:1.2"><span class="t-sm t-strong t-truncate">${me?.name || 'Guest'}</span><span class="t-xs t-faint t-truncate">${authMode === 'firebase' ? me?.email : 'Demo mode · this browser'}</span></span>
          <span class="rail__label"><${Icon} name="chevrons-up-down" size=${14} class="t-faint" /></span>
        </button>`} />
      </div>
    </aside>
    ${mobileRailOpen.value ? html`<div class="drawer-overlay" style="z-index:45" onClick=${() => { mobileRailOpen.value = false; }}></div>` : null}
    <div class="app-main">
      <div class="app-mobilebar">
        <${IconButton} icon="menu" label="Menu" onClick=${() => { mobileRailOpen.value = true; }} />
        <${Logo} href="/start" />
        <span class="grow"></span>
        <${IconButton} icon="search" label="Search" onClick=${openPalette} />
      </div>
      ${children}
    </div>
  </div>`;
}

/** Standard page container for app-shell pages. */
export function AppPage({ children, wide, narrow, class: cls }) {
  return html`<div class=${cx('app-page', wide && 'app-page--wide', narrow && 'app-page--narrow', cls)}>${children}</div>`;
}
