// The generated app's own chrome: sidebar (brand + nav + user), top bar (search, bell,
// avatar) and, on narrow frames, a compact top bar with bottom tabs. Container queries
// on the .gx root decide which layout shows — so the preview frame width drives it.
import { html, useState, useRef, useEffect } from '../lib/html.js';
import { Icon } from '../ui/icons.js';
import { cx, timeAgo } from '../lib/util.js';
import { session } from '../lib/store.js';
import { useGx, GxAvatar, titleKeyOf } from './util.js';

export function personaFor(actAs, project) {
  if (actAs === 'visitor') return null;
  if (actAs === 'teammate') {
    const m = (project.members || []).find((x) => x.role !== 'owner');
    return { name: m?.name || 'Sam Rivera', role: 'Teammate' };
  }
  return { name: session.value?.name || 'You', role: 'Admin' };
}

function useOutside(open, setOpen, ref) {
  useEffect(() => {
    if (!open) return;
    const on = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', on);
    return () => document.removeEventListener('mousedown', on);
  }, [open]);
}

function Search({ project, onNav }) {
  const ctx = useGx();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutside(open, setOpen, ref);
  const tables = (project.data?.tables || []).filter((t) => (project.screens || []).some((s) => s.blocks.some((b) => b.bind?.table === t.id)));
  const needle = q.trim().toLowerCase();
  const results = [];
  if (needle && ctx.actAs !== 'visitor') {
    for (const t of tables) {
      const tk = titleKeyOf(t);
      for (const r of t.rows) {
        if (results.length >= 7) break;
        if (t.columns.some((c) => String(r[c.key] ?? '').toLowerCase().includes(needle))) results.push({ t, r, title: r[tk] });
      }
    }
  }
  const placeholder = tables.length ? `Search ${tables.slice(0, 2).map((t) => t.name.toLowerCase()).join(', ')}…` : 'Search…';
  const pick = (res) => {
    const s = project.screens.find((sc) => sc.blocks.some((b) => b.bind?.table === res.t.id));
    setOpen(false); setQ('');
    if (s) onNav(s.route);
    ctx.notify(`${res.title} — in ${res.t.name}`, 'info');
  };
  return html`<div class="gx-gsearch" ref=${ref}>
    <${Icon} name="search" size=${14} />
    <input value=${q} placeholder=${placeholder} aria-label="Search" disabled=${ctx.isStatic}
      onFocus=${() => setOpen(true)} onInput=${(e) => { setQ(e.currentTarget.value); setOpen(true); }}
      onKeyDown=${(e) => { if (e.key === 'Escape') { setOpen(false); e.currentTarget.blur(); } if (e.key === 'Enter' && results[0]) pick(results[0]); }} />
    ${!q ? html`<kbd class="gx-kbd">/</kbd>` : null}
    ${open && needle ? html`<div class="gx-pop gx-pop--search">
      ${results.length ? results.map((res) => html`<button class="gx-pop__item" key=${res.t.id + res.r.id} onClick=${() => pick(res)}>
        <${Icon} name=${res.t.icon || 'table'} size=${14} /><span class="gx-pop__title">${res.title}</span><span class="gx-pop__meta">${res.t.name}</span>
      </button>`) : html`<div class="gx-pop__empty">${ctx.actAs === 'visitor' ? 'Sign in to search' : `No results for “${q}”`}</div>`}
    </div>` : null}
  </div>`;
}

function Bell({ project }) {
  const ctx = useGx();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutside(open, setOpen, ref);
  const runs = (project.data?.tables || []).find((t) => t.columns.some((c) => c.key === 'agent') && t.columns.some((c) => c.key === 'action'));
  const items = ctx.actAs === 'visitor' ? [] : (runs?.rows || []).slice().sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, 5);
  return html`<div class="gx-bellwrap" ref=${ref}>
    <button class="gx-iconbtn gx-iconbtn--lg" aria-label="Notifications" onClick=${() => !ctx.isStatic && setOpen(!open)}>
      <${Icon} name="bell" size=${16} />${items.length ? html`<span class="gx-bell__dot"></span>` : null}
    </button>
    ${open ? html`<div class="gx-pop gx-pop--bell">
      <div class="gx-pop__head">Notifications</div>
      ${items.length ? items.map((r) => html`<div class="gx-pop__note" key=${r.id}>
        <span class="gx-botav" style=${{ background: project.agents?.find((a) => a.name === r.agent)?.color || 'var(--gx-accent)' }}><${Icon} name="bot" size=${11} /></span>
        <div><div><strong>${r.agent}</strong> ${String(r.action || '').replace(/^./, (c) => c.toLowerCase())}</div><div class="gx-pop__meta">${timeAgo(r.at)}</div></div>
      </div>`) : html`<div class="gx-pop__empty">You’re all caught up.</div>`}
    </div>` : null}
  </div>`;
}

function UserChip({ persona, onSignIn, compact }) {
  const ctx = useGx();
  if (!persona) return html`<button class=${cx('gx-btn gx-btn--primary gx-btn--sm', compact && 'gx-signin--compact')} onClick=${() => !ctx.isStatic && onSignIn()}><span>Sign in</span></button>`;
  return html`<span class="gx-user" title=${`${persona.name} · ${persona.role}`}><${GxAvatar} name=${persona.name} size=${28} /></span>`;
}

function Brand({ project, home, onNav, small }) {
  const initial = String(project.name || 'A').trim().charAt(0).toUpperCase();
  return html`<button class=${cx('gx-brand', small && 'gx-brand--sm')} onClick=${() => home && onNav(home)}>
    <span class="gx-brand__mark">${initial}</span><span class="gx-brand__name">${project.name}</span>
  </button>`;
}

export function GxShell({ project, screen, onNav, onSignIn, mainRef, children }) {
  const ctx = useGx();
  const screens = (project.screens || []).filter((s) => s.nav !== false);
  const persona = personaFor(ctx.actAs, project);
  const tabs = screens.slice(0, 5);
  const home = screens[0]?.route;
  return html`<div class="gx-shell">
    <aside class="gx-side">
      <${Brand} project=${project} home=${home} onNav=${onNav} />
      <nav class="gx-nav" aria-label=${`${project.name} navigation`}>
        ${screens.map((s) => html`<button key=${s.id} class=${cx('gx-nav__item', s.id === screen.id && 'is-active')} onClick=${() => onNav(s.route)} aria-current=${s.id === screen.id ? 'page' : undefined} title=${s.title}>
          <${Icon} name=${s.icon || 'layout-dashboard'} size=${16} /><span>${s.title}</span>
        </button>`)}
      </nav>
      <div class="gx-side__foot">
        ${persona ? html`<div class="gx-me"><${GxAvatar} name=${persona.name} size=${30} /><div class="gx-me__text"><strong>${persona.name}</strong><span>${persona.role}</span></div></div>`
          : html`<button class="gx-btn gx-btn--secondary gx-btn--sm gx-me__signin" onClick=${() => !ctx.isStatic && onSignIn()}><${Icon} name="log-in" size=${13} /><span>Sign in</span></button>`}
      </div>
    </aside>
    <div class="gx-frame">
      <header class="gx-top">
        <div class="gx-top__brand"><${Brand} project=${project} home=${home} onNav=${onNav} small /></div>
        <${Search} project=${project} onNav=${onNav} />
        <div class="gx-top__right">
          <${Bell} project=${project} />
          <${UserChip} persona=${persona} onSignIn=${onSignIn} compact />
        </div>
      </header>
      <main class="gx-main" ref=${mainRef}>${children}</main>
      ${tabs.length > 1 ? html`<nav class="gx-tabs" aria-label="Sections">
        ${tabs.map((s) => html`<button key=${s.id} class=${cx('gx-tab', s.id === screen.id && 'is-active')} onClick=${() => onNav(s.route)} aria-current=${s.id === screen.id ? 'page' : undefined}>
          <${Icon} name=${s.icon || 'layout-dashboard'} size=${18} /><span>${s.title}</span>
        </button>`)}
      </nav>` : null}
    </div>
  </div>`;
}

/** Visitors of an app that requires sign-in see this (sign-in is simulated in prototypes). */
export function SignInGate({ project, onSignIn }) {
  const initial = String(project.name || 'A').trim().charAt(0).toUpperCase();
  return html`<div class="gx-gate">
    <div class="gx-gate__card">
      <span class="gx-brand__mark gx-brand__mark--lg">${initial}</span>
      <h1 class="gx-gate__title">Sign in to ${project.name}</h1>
      <p class="gx-gate__sub">${project.description || 'This app is private to its team.'}</p>
      <button class="gx-btn gx-btn--primary gx-gate__btn" onClick=${onSignIn}><${Icon} name="log-in" size=${15} /><span>Continue</span></button>
      <span class="gx-gate__note">Prototype · sign-in is simulated, no account is created</span>
    </div>
  </div>`;
}
