// Small helpers shared by the Plan tab sub-views.
import { html } from '../../lib/html.js';
import { agentById, tableById, screenById } from '../../engine/schema.js';
import { Icon } from '../../ui/index.js';
import { cx } from '../../lib/util.js';

/** Lifecycle tone for a promise status (never decorative). */
export const PROMISE_TONE = { planned: 'blueprint', building: 'amber', verified: 'green', live: 'green', failed: 'red', deferred: 'grey' };

/** Resolve a promise ref id (agent / screen / table) into a link chip model. */
export function resolveRef(p, ref) {
  const a = agentById(p, ref);
  if (a) return { kind: 'agent', id: a.id, label: a.name, icon: 'bot', href: `/p/${p.id}/agents/${a.id}`, tone: 'violet' };
  const s = screenById(p, ref);
  if (s) return { kind: 'screen', id: s.id, label: s.title, icon: s.icon || 'layout-dashboard', href: `/p/${p.id}/app?route=${encodeURIComponent(s.route)}`, tone: 'blueprint' };
  const t = tableById(p, ref);
  if (t) return { kind: 'table', id: t.id, label: t.name, icon: 'table', href: `/p/${p.id}/data/${t.id}`, tone: 'neutral' };
  return null;
}

export function RefChip({ r }) {
  if (!r) return null;
  return html`<a href=${r.href} class=${cx('pl-ref', `pl-ref--${r.kind}`)} title=${`Open ${r.kind}: ${r.label}`}>
    <${Icon} name=${r.icon} size=${12} /><span>${r.label}</span>
  </a>`;
}

/** Section title used across plan sub-views. */
export function SectionHead({ title, sub, right, icon }) {
  return html`<div class="pl-sec-head">
    <div class="grow">
      <div class="pl-sec-title">${icon ? html`<${Icon} name=${icon} size=${15} />` : null}${title}</div>
      ${sub ? html`<div class="pl-sec-sub">${sub}</div>` : null}
    </div>
    ${right ? html`<div class="row gap-6 wrap">${right}</div>` : null}
  </div>`;
}

export const slug = (s = '') => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';
export const isBuilt = (p) => ['built', 'live'].includes(p?.status);
