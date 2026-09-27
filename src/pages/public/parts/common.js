// Shared building blocks for the public / discovery pages (prefix .pb-).
import { html, useState, useEffect, useRef, useErrorBoundary } from '../../../lib/html.js';
import { session } from '../../../lib/store.js';
import { onNavigate, route, navigate } from '../../../lib/router.js';
import { AppPage } from '../../../shells/AppShell.js';
import { Icon, registerIcons, PageHeader } from '../../../ui/index.js';
import { cx } from '../../../lib/util.js';

registerIcons({
  'star-fill': '<path fill="currentColor" d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  'quote-mark': '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>',
});

export const PERSONA_ICONS = { agencies: 'briefcase', founders: 'rocket', sales: 'target', support: 'headphones', hr: 'users', developers: 'code' };

export const reducedMotion = () => {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
};

/** Cycles 0..n-1 every `ms` while `active`. Frozen on the last frame when the user prefers reduced motion. */
export function useLoop(n, ms, active = true) {
  const still = reducedMotion();
  const [i, setI] = useState(still ? n - 1 : 0);
  useEffect(() => {
    if (!active || still) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), ms);
    return () => clearInterval(t);
  }, [n, ms, active]);
  return i;
}

/** True while the element is (nearly) on screen — used to pause illustrations off-screen. */
export function useInView(ref, rootMargin = '160px') {
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setV(true); return; }
    const io = new IntersectionObserver(([e]) => setV(e.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return v;
}

/** Scroll to #hash targets on this page (the router does not do it for us). */
export function useHashScroll(path) {
  useEffect(() => {
    const go = (hash) => {
      if (!hash) return;
      setTimeout(() => { const el = document.getElementById(hash); if (el) el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' }); }, 60);
    };
    go(route.value.hash);
    return onNavigate((r) => { if (r.path === path) go(r.hash); });
  }, []);
}

/** Scroll to the top and put the cursor in the page's prompt box. */
export function focusPrompt() {
  if (!document.querySelector('.promptbox__input')) { navigate('/'); return; } // the landing prompt autofocuses
  window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
  setTimeout(() => { const el = document.querySelector('.promptbox__input'); if (el) el.focus({ preventScroll: true }); }, 450);
}

/** Wrap the last clause of a headline in the display serif. */
export function serifTail(text = '') {
  let idx = -1, len = 0;
  for (const s of ['. ', ' — ', ', ']) { const i = text.lastIndexOf(s); if (i > idx) { idx = i; len = s.length; } }
  if (idx > 0 && text.slice(idx + len).split(' ').length <= 5) return html`${text.slice(0, idx + len)}<em>${text.slice(idx + len)}</em>`;
  const w = text.split(' ');
  return html`${w.slice(0, -2).join(' ')} <em>${w.slice(-2).join(' ')}</em>`;
}

/** Container that adapts to the shell: AppPage when signed in (AppShell), a centred wrap otherwise. */
export function Frame({ children, class: cls }) {
  if (session.value) return html`<${AppPage} wide class=${cls}>${children}<//>`;
  return html`<div class=${cx('pb-wrap pb-frame', cls)}>${children}</div>`;
}

/** Page header for discovery pages: calm PageHeader in the app, a larger editorial header on the public site. */
export function DiscoveryHeader({ eyebrow, title, subtitle, actions }) {
  if (session.value) return html`<${PageHeader} title=${title} subtitle=${subtitle} actions=${actions} />`;
  return html`<div class="pb-dhead">
    <div class="grow">
      ${eyebrow ? html`<div class="pb-eyebrow">${eyebrow}</div>` : null}
      <h1 class="pb-dhead__title">${title}</h1>
      ${subtitle ? html`<p class="pb-dhead__sub">${subtitle}</p>` : null}
    </div>
    ${actions ? html`<div class="row gap-8 wrap">${actions}</div>` : null}
  </div>`;
}

export function Section({ id, tint, class: cls, children, narrow }) {
  return html`<section id=${id} class=${cx('pb-section', tint && 'pb-section--tint', cls)}>
    <div class=${cx('pb-wrap', narrow && 'pb-wrap--narrow')}>${children}</div>
  </section>`;
}

export function SectionHead({ eyebrow, title, lede, align = 'center', action }) {
  return html`<div class=${cx('pb-shead', align === 'center' && 'pb-shead--center', action && 'pb-shead--split')}>
    <div class="col gap-12" style=${align === 'center' ? 'align-items:center' : null}>
      ${eyebrow ? html`<div class="pb-eyebrow">${eyebrow}</div>` : null}
      <h2 class="pb-h2">${title}</h2>
      ${lede ? html`<p class="pb-lede">${lede}</p>` : null}
    </div>
    ${action || null}
  </div>`;
}

/** Accessible accordion built on <details>. items: [{q, a}] */
export function Faq({ items }) {
  return html`<div class="pb-faq">
    ${items.map((it, i) => html`<details key=${i}>
      <summary><span>${it.q}</span><${Icon} name="plus" size=${18} /></summary>
      <div class="pb-faq__a">${it.a}</div>
    </details>`)}
  </div>`;
}

export function Stars({ value = 0, size = 13 }) {
  return html`<span class="pb-stars" aria-label=${`${value.toFixed(1)} out of 5`}>
    ${[1, 2, 3, 4, 5].map((n) => html`<${Icon} name="star-fill" size=${size} class=${n <= Math.round(value) ? 'is-on' : ''} />`)}
  </span>`;
}

/** Isolates a child renderer (e.g. the generated-app preview) so one failure can't take down the page. */
export function SafeRender({ children, label = 'Preview unavailable' }) {
  const [err] = useErrorBoundary((e) => console.warn('[public] preview failed', e));
  if (err) return html`<div class="pb-preview-error"><${Icon} name="alert-circle" size=${18} /><span>${label}</span></div>`;
  return children;
}

/** Fake browser chrome around previews. */
export function BrowserFrame({ url, badge, children, height, class: cls, right }) {
  return html`<div class=${cx('pb-browser', cls)}>
    <div class="pb-browser__bar">
      <span class="pb-browser__dots"><span></span><span></span><span></span></span>
      <span class="pb-browser__url"><${Icon} name="lock" size=${11} />${url}</span>
      <span class="pb-browser__right">${badge || null}${right || null}</span>
    </div>
    <div class="pb-browser__body" style=${height ? { height: typeof height === 'number' ? height + 'px' : height } : null}>${children}</div>
  </div>`;
}

export function useRefInView() {
  const ref = useRef(null);
  const inView = useInView(ref);
  return [ref, inView];
}
