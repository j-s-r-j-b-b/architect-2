// Tiny history-API router built on signals.
//   route.value -> { path, query, hash }
//   navigate('/p/abc/app?route=/leads')
//   matchPath('/p/:id/:tab?', '/p/abc') -> { id: 'abc', tab: undefined }
import { html, signal } from './html.js';
import { cx } from './util.js';

function parseLocation() {
  const { pathname, search, hash } = window.location;
  const query = Object.fromEntries(new URLSearchParams(search));
  return { path: pathname.replace(/\/+$/, '') || '/', query, hash: hash.slice(1) };
}

export const route = signal(parseLocation());

const listeners = new Set();
/** Subscribe to navigations (e.g. to close menus). Returns an unsubscribe fn. */
export function onNavigate(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function navigate(to, { replace = false, scroll = true } = {}) {
  if (typeof to !== 'string') return;
  if (/^https?:\/\//.test(to)) { window.location.href = to; return; }
  const prev = route.value.path;
  if (replace) history.replaceState(null, '', to);
  else history.pushState(null, '', to);
  route.value = parseLocation();
  if (scroll && prev !== route.value.path) window.scrollTo(0, 0);
  listeners.forEach((fn) => fn(route.value));
}

/** Merge into the current query string. Pass null to delete a key. */
export function setQuery(patch, { replace = true } = {}) {
  const q = { ...route.value.query, ...patch };
  for (const k of Object.keys(q)) if (q[k] === null || q[k] === undefined || q[k] === '') delete q[k];
  const qs = new URLSearchParams(q).toString();
  navigate(route.value.path + (qs ? `?${qs}` : ''), { replace, scroll: false });
}

export function back(fallback = '/') {
  if (history.length > 1) history.back(); else navigate(fallback);
}

window.addEventListener('popstate', () => {
  route.value = parseLocation();
  listeners.forEach((fn) => fn(route.value));
});

// Intercept same-origin <a href> clicks so every plain link is a SPA link.
document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest && e.target.closest('a[href]');
  if (!a || a.target === '_blank' || a.hasAttribute('download') || a.dataset.external !== undefined) return;
  const href = a.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
  const url = new URL(href, window.location.href);
  if (url.origin !== window.location.origin) return;
  e.preventDefault();
  navigate(url.pathname + url.search + url.hash);
});

/**
 * Match a pattern like "/p/:id/:tab?/:rest*" against a path.
 * Returns params object or null. ":name?" is optional, ":name*" captures the rest.
 */
export function matchPath(pattern, path) {
  const pp = pattern.split('/').filter(Boolean);
  const sp = path.split('/').filter(Boolean);
  const params = {};
  for (let i = 0; i < pp.length; i++) {
    const seg = pp[i];
    if (seg.startsWith(':')) {
      const name = seg.slice(1).replace(/[?*]$/, '');
      if (seg.endsWith('*')) { params[name] = sp.slice(i).map(decodeURIComponent).join('/'); return params; }
      if (i >= sp.length) { if (seg.endsWith('?')) { params[name] = undefined; continue; } return null; }
      params[name] = decodeURIComponent(sp[i]);
    } else if (seg !== sp[i]) return null;
  }
  if (sp.length > pp.length) return null;
  return params;
}

/** <Link href="/projects" activeClass="is-active" exact>Projects</Link> */
export function Link({ href, class: cls, className, activeClass = 'is-active', exact = false, children, onClick, ...rest }) {
  const path = route.value.path;
  const target = (href || '').split('?')[0];
  const active = target && (exact ? path === target : path === target || path.startsWith(target + '/'));
  return html`<a href=${href} class=${cx(cls || className, active && activeClass)} aria-current=${active ? 'page' : undefined} onClick=${onClick} ...${rest}>${children}</a>`;
}

export function useRoute() { return route.value; }
