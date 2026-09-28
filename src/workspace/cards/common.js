// Shared bits for chat cards.
import { html } from '../../lib/html.js';
import { navigate } from '../../lib/router.js';
import { Icon, Badge, toast } from '../../ui/index.js';
import { cx, timeAgo, fmtTime } from '../../lib/util.js';
import { openConnectSheet } from '../../shells/ConnectSheet.js';
import { sendMessage } from '../../engine/conversation.js';
import { openPanel, previewState } from '../bus.js';
import { getProject } from '../../lib/store.js';

/**
 * Card frame. tone: blueprint | amber | green | red | violet | neutral — lifecycle meaning only.
 */
export function CardFrame({ tone = 'neutral', icon, title, meta, children, footer, class: cls, id, compact }) {
  return html`<section class=${cx('ws-card', `ws-card--${tone}`, compact && 'ws-card--compact', cls)} id=${id}>
    ${title ? html`<header class="ws-card__head">
      ${icon ? html`<span class="ws-card__icon"><${Icon} name=${icon} size=${14} stroke=${2.2} /></span>` : null}
      <span class="ws-card__title">${title}</span>
      ${meta ? html`<span class="ws-card__meta">${meta}</span>` : null}
    </header>` : null}
    ${children ? html`<div class="ws-card__body">${children}</div>` : null}
    ${footer ? html`<footer class="ws-card__foot">${footer}</footer>` : null}
  </section>`;
}

export function When({ at }) {
  return html`<time class="ws-when" title=${at ? new Date(at).toLocaleString() : ''}>${at ? (Date.now() - at < 86400e3 ? fmtTime(at) : timeAgo(at)) : ''}</time>`;
}

/** Run a chip action attached to a message: send | connect | nav | panel. */
export function runAction(projectId, a, msg) {
  if (!a) return;
  if (a.kind === 'send') sendMessage(projectId, a.text, { mode: a.mode, thread: msg?.thread });
  else if (a.kind === 'connect') openConnectSheet(a.id, { projectId }).then((ok) => { if (ok) toast('Connected — tables that read from it now show live data', { tone: 'success' }); });
  else if (a.kind === 'nav') navigate(a.href);
  else if (a.kind === 'panel') openPanel(a.panel);
  else if (a.kind === 'xray') {
    previewState.value = { ...previewState.value, mode: 'xray' };
    if (!/\/app(\/|$)/.test(location.pathname)) navigate(`/p/${projectId}/app`);
    toast('X-ray is on — click any block to see its data, agent and code', { tone: 'info' });
  } else if (typeof a.onClick === 'function') a.onClick();
}

export function ActionChips({ projectId, actions = [], msg }) {
  if (!actions?.length) return null;
  return html`<div class="ws-chips">
    ${actions.map((a) => html`<button type="button" class="ws-chipbtn" onClick=${() => runAction(projectId, a, msg)}>
      ${a.icon ? html`<${Icon} name=${a.icon} size=${13} />` : null}<span>${a.label}</span>
    </button>`)}
  </div>`;
}

export function PromiseTag({ id, status }) {
  const tone = status === 'verified' || status === 'live' ? 'green' : status === 'building' ? 'amber' : status === 'failed' ? 'red' : status === 'deferred' ? 'neutral' : 'blueprint';
  return html`<${Badge} tone=${tone} size="sm" square class="ws-ptag">${id}<//>`;
}

export const promiseById = (p, id) => (p?.plan?.promises || []).find((x) => x.id === id) || null;

/** Scroll the chat to a message (used by run bar / tray). */
export function scrollToMessage(id) {
  const el = document.getElementById(`msg-${id}`);
  if (!el) return false;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.remove('is-flash');
  void el.offsetWidth;
  el.classList.add('is-flash');
  return true;
}

export const projectOf = (id) => getProject(id);
