// Imperative overlays: modals, drawers, toasts, confirm dialogs.
//   const { close } = openModal(MyDialog, { projectId }, { size: 'lg' })
//   toast('Saved', { tone: 'success', action: { label: 'Undo', onClick } })
//   if (await confirmDialog({ title: 'Delete?', danger: true })) …
import { html, signal, useEffect, useRef } from '../lib/html.js';
import { onNavigate } from '../lib/router.js';
import { cx, uid } from '../lib/util.js';
import { Icon } from './icons.js';

const modals = signal([]);  // [{id, Component, props, opts}]
const drawers = signal([]);
const toasts = signal([]);

export function openModal(Component, props = {}, opts = {}) {
  const id = uid('mdl');
  const close = (result) => {
    modals.value = modals.value.filter((m) => m.id !== id);
    opts.onClose && opts.onClose(result);
  };
  modals.value = [...modals.value, { id, Component, props: { ...props, close }, opts }];
  return { id, close };
}
export function closeAllModals() { modals.value = []; }

export function openDrawer(Component, props = {}, opts = {}) {
  const id = uid('drw');
  const close = () => { drawers.value = drawers.value.filter((d) => d.id !== id); opts.onClose && opts.onClose(); };
  // one drawer at a time per "key" (e.g. 'history') — reopening replaces it
  const rest = opts.key ? drawers.value.filter((d) => d.opts.key !== opts.key) : drawers.value;
  drawers.value = [...rest, { id, Component, props: { ...props, close }, opts }];
  return { id, close };
}
export function closeDrawer(key) { drawers.value = key ? drawers.value.filter((d) => d.opts.key !== key) : []; }
export const openDrawerKeys = () => drawers.value.map((d) => d.opts.key).filter(Boolean);
export { drawers as drawerStack };

/** tone: 'info' | 'success' | 'error' | 'warn' */
export function toast(message, { tone = 'info', action, duration = 3800 } = {}) {
  const id = uid('t');
  toasts.value = [...toasts.value, { id, message, tone, action }].slice(-4);
  if (duration) setTimeout(() => dismissToast(id), duration);
  return id;
}
export function dismissToast(id) { toasts.value = toasts.value.filter((t) => t.id !== id); }

/** Promise-based confirm dialog. */
export function confirmDialog({ title = 'Are you sure?', body = '', confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false, icon } = {}) {
  return new Promise((resolve) => {
    openModal(({ close }) => html`<${Modal} title=${title} size="sm" onClose=${() => close(false)}
      footer=${html`<button class="btn btn--ghost" onClick=${() => close(false)}>${cancelLabel}</button>
        <button class=${cx('btn', danger ? 'btn--danger' : 'btn--primary')} onClick=${() => close(true)} autofocus>${confirmLabel}</button>`}>
      ${icon ? html`<div class="row mb-8"><${Icon} name=${icon} size=${18} /></div>` : null}
      <div class="t-md t-muted">${body}</div>
    <//>`, {}, { onClose: (r) => resolve(!!r) });
  });
}

// ---------------------------------------------------------------------------
// Frames
// ---------------------------------------------------------------------------
/**
 * Modal frame. Use inside a component opened with openModal:
 *   ({ close }) => html`<${Modal} title="…" onClose=${close} footer=${…}>body<//>`
 */
export function Modal({ title, subtitle, size, onClose, footer, children, class: cls, icon, hideClose, bodyClass }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current && ref.current.querySelector('[autofocus], input, textarea, select, button:not(.modal__close)');
    if (el) setTimeout(() => el.focus(), 30);
  }, []);
  return html`<div class="overlay" onMouseDown=${(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}>
    <div class=${cx('modal', size && `modal--${size}`, cls)} role="dialog" aria-modal="true" aria-label=${typeof title === 'string' ? title : undefined} ref=${ref}>
      ${title || !hideClose ? html`<div class="modal__header">
        <div class="row-top gap-12 grow">
          ${icon ? html`<div class="shrink-0" style="width:36px;height:36px;border-radius:10px;display:grid;place-items:center;background:var(--blueprint-soft);color:var(--blueprint)"><${Icon} name=${icon} size=${18} /></div>` : null}
          <div class="grow">${title ? html`<div class="modal__title">${title}</div>` : null}${subtitle ? html`<div class="modal__subtitle">${subtitle}</div>` : null}</div>
        </div>
        ${!hideClose && onClose ? html`<button class="icon-btn icon-btn--sm modal__close" aria-label="Close" onClick=${() => onClose()}><${Icon} name="x" size=${16} /></button>` : null}
      </div>` : null}
      <div class=${cx('modal__body', bodyClass)}>${children}</div>
      ${footer ? html`<div class="modal__footer">${footer}</div>` : null}
    </div>
  </div>`;
}

/** Drawer frame: ({ close }) => html`<${Drawer} title="History" onClose=${close}>…<//>` */
export function Drawer({ title, icon, onClose, children, footer, wide, actions, class: cls }) {
  return html`<div>
    <div class="drawer-overlay" onMouseDown=${() => onClose && onClose()}></div>
    <aside class=${cx('drawer', wide && 'drawer--wide', cls)} role="dialog" aria-label=${typeof title === 'string' ? title : undefined}>
      <div class="drawer__header">
        <div class="drawer__title">${icon ? html`<${Icon} name=${icon} size=${16} />` : null}${title}</div>
        <div class="row gap-4">${actions}<button class="icon-btn icon-btn--sm" aria-label="Close" onClick=${() => onClose && onClose()}><${Icon} name="x" size=${16} /></button></div>
      </div>
      <div class="drawer__body">${children}</div>
      ${footer ? html`<div class="drawer__footer">${footer}</div>` : null}
    </aside>
  </div>`;
}

// ---------------------------------------------------------------------------
// Host (mounted once in app.js)
// ---------------------------------------------------------------------------
export function OverlayHost() {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (modals.value.length) { const top = modals.value[modals.value.length - 1]; if (top.opts.dismissable !== false) top.props.close(); }
      else if (drawers.value.length) drawers.value[drawers.value.length - 1].props.close();
    };
    window.addEventListener('keydown', onKey);
    const off = onNavigate(() => { if (modals.value.some((m) => !m.opts.persist)) modals.value = modals.value.filter((m) => m.opts.persist); drawers.value = drawers.value.filter((d) => d.opts.persist); });
    return () => { window.removeEventListener('keydown', onKey); off(); };
  }, []);
  const toneIcon = { success: 'check-circle', error: 'alert-circle', warn: 'alert-triangle', info: 'info' };
  return html`
    ${drawers.value.map(({ id, Component, props }) => html`<${Component} key=${id} ...${props} />`)}
    ${modals.value.map(({ id, Component, props }) => html`<${Component} key=${id} ...${props} />`)}
    <div class="toasts" aria-live="polite">
      ${toasts.value.map((t) => html`<div key=${t.id} class=${cx('toast', `toast--${t.tone}`)}>
        <span class="toast__icon"><${Icon} name=${toneIcon[t.tone] || 'info'} size=${16} /></span>
        <span>${t.message}</span>
        ${t.action ? html`<button class="toast__action" onClick=${() => { dismissToast(t.id); t.action.onClick(); }}>${t.action.label}</button>` : null}
      </div>`)}
    </div>`;
}
