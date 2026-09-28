// Shared bits for app-shell pages: project cards, experience picker, small helpers.
import { html } from '../../../lib/html.js';
import { AppThumbnail } from '../../../genapp/Renderer.js';
import { StatusPill, Icon, Menu, IconButton, Badge } from '../../../ui/index.js';
import { promiseStats } from '../../../engine/schema.js';
import { timeAgo, cx } from '../../../lib/util.js';
import { Link } from '../../../lib/router.js';
import { liveUrl as deployUrl } from '../../../engine/deploy.js';

const PRE_BUILD = ['draft', 'planning', 'ready'];
export const projectHref = (p) => `/p/${p.id}/${PRE_BUILD.includes(p.status) ? 'plan' : 'app'}`;
/** Same address the Launch tab and Inbox show (served here at /a/:slug). */
export const liveUrl = (p) => (p.status === 'live' ? (p.domain || deployUrl(p).replace(/^https?:\/\//, '')) : null);

export function greeting() {
  const h = new Date().getHours();
  return h < 5 ? 'Working late' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

/** Project card with live thumbnail, status, promises and an optional ⋯ menu. */
export function ProjectCard({ project: p, menu, compact }) {
  const ps = promiseStats(p);
  const url = liveUrl(p);
  return html`<div class=${cx('ap-pcard', compact && 'ap-pcard--compact')}>
    <${Link} href=${projectHref(p)} class="ap-pcard__thumb" aria-label=${`Open ${p.name}`}>
      <${AppThumbnail} project=${p} />
      ${p.sample ? html`<span class="ap-pcard__flag"><${Badge} tone="amber" size="sm" icon="flask">Example<//></span>` : null}
    <//>
    <div class="ap-pcard__body">
      <div class="row gap-8">
        <${Link} href=${projectHref(p)} class="ap-pcard__name t-truncate grow">${p.name}<//>
        ${menu ? html`<${Menu} items=${menu} width=${200} trigger=${(open, toggle) => html`<${IconButton} size="sm" icon="more-horizontal" label="Project actions" active=${open} onClick=${toggle} />`} />` : null}
      </div>
      <div class="row gap-8 wrap mt-4">
        <${StatusPill} status=${p.status || 'draft'} size="sm" />
        ${ps.total ? html`<span class="t-xs t-muted row gap-4" data-tip="Promises verified"><${Icon} name="list-checks" size=${12} />${ps.verified}/${ps.total}</span>` : null}
        <span class="t-xs t-faint">Edited ${timeAgo(p.updatedAt)}</span>
      </div>
      ${url && !compact ? html`<a class="ap-pcard__url t-xs" href=${`/a/${p.slug}`} target="_blank" rel="noopener"><${Icon} name="globe" size=${12} />${url}</a>` : null}
    </div>
  </div>`;
}

export const EXPERIENCES = [
  { value: 'guided', icon: 'message-circle', title: 'Just describe it', tag: 'Guided', desc: 'Talk to Architect in plain words. We handle the technical choices and explain everything simply.', see: ['Chat, plan and live preview', 'Plain-language summaries', 'Code tucked away'] },
  { value: 'balanced', icon: 'sliders', title: 'A bit of both', tag: 'Balanced', desc: 'Guided by default, with details one click away when you want to look under the hood.', see: ['Everything in Guided', '“Show details” on every step', 'Agent settings & data tables'] },
  { value: 'full', icon: 'code', title: 'Show me everything', tag: 'Full control', desc: 'Code, raw ids, frameworks, logs and GitHub up front. Built for developers.', see: ['Code tab & diffs by default', 'Framework code for agents', 'Traces, logs & env vars'] },
];

/** Big selectable experience cards (Onboarding + Settings). */
export function ExperiencePicker({ value, onChange, size }) {
  return html`<div class=${cx('ap-exp', size === 'sm' && 'ap-exp--sm')} role="radiogroup" aria-label="Experience level">
    ${EXPERIENCES.map((e) => html`<button type="button" role="radio" aria-checked=${value === e.value} class=${cx('ap-exp__card', value === e.value && 'is-active')} onClick=${() => onChange(e.value)}>
      <span class="ap-exp__check"><${Icon} name="check" size=${13} /></span>
      <span class="ap-exp__icon"><${Icon} name=${e.icon} size=${20} /></span>
      <span class="ap-exp__tag">${e.tag}</span>
      <span class="ap-exp__title">${e.title}</span>
      <span class="ap-exp__desc">${e.desc}</span>
      ${size !== 'sm' ? html`<ul class="ap-exp__see">${e.see.map((s) => html`<li><${Icon} name="check" size=${12} />${s}</li>`)}</ul>` : null}
    </button>`)}
  </div>`;
}

/** Small KPI tile. */
export function Stat({ label, value, sub, icon, tone }) {
  return html`<div class=${cx('ap-stat', tone && `ap-stat--${tone}`)}>
    <div class="row gap-6 t-xs t-muted">${icon ? html`<${Icon} name=${icon} size=${13} />` : null}${label}</div>
    <div class="ap-stat__value">${value}</div>
    ${sub ? html`<div class="t-xs t-faint">${sub}</div>` : null}
  </div>`;
}

/** Simple left-nav for sectioned pages (Settings, Admin). */
export function SideNav({ items, value, base }) {
  return html`<nav class="ap-sidenav">${items.map((it) => html`<a href=${`${base}/${it.id}`} class=${cx('ap-sidenav__item', value === it.id && 'is-active')}><${Icon} name=${it.icon} size=${15} /><span>${it.label}</span></a>`)}</nav>`;
}
