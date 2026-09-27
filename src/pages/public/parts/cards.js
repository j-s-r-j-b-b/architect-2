// Cards shared across public pages: template cards, suggestion (prompt) cards, marketplace cards.
import { html } from '../../../lib/html.js';
import { navigate } from '../../../lib/router.js';
import { Icon, Badge, Avatar } from '../../../ui/index.js';
import { IntegrationTile } from '../../../shells/ConnectSheet.js';
import { AppThumbnail } from '../../../genapp/Renderer.js';
import { cx, fmtCompact } from '../../../lib/util.js';
import { Stars, SafeRender } from './common.js';

/** A template from the prompt library. Whole card is a link to /templates/:id. */
export function TemplateCard({ t, compact }) {
  return html`<a href=${`/templates/${t.id}`} class=${cx('pb-tcard', compact && 'pb-tcard--compact')} aria-label=${`${t.title} template`}>
    <div class="pb-tcard__top">
      <span class="pb-tcard__icon"><${Icon} name=${t.icon} size=${18} /></span>
      <div class="grow" style="min-width:0">
        <div class="pb-tcard__title">${t.title}</div>
        <div class="pb-tcard__cat">${t.category}</div>
      </div>
      ${t.popular ? html`<${Badge} size="sm" tone="outline">Popular<//>` : null}
    </div>
    <p class="pb-tcard__prompt">${t.prompt}</p>
    <div class="pb-tcard__agents">
      ${t.agents.map((a) => html`<span class="pb-agent-chip"><${Icon} name="bot" size=${12} />${a}</span>`)}
    </div>
    <div class="pb-tcard__foot">
      <span class="pb-tcard__tiles">${t.integrations.map((id) => html`<${IntegrationTile} id=${id} size="sm" />`)}</span>
      <span class="grow"></span>
      <span class="pb-meta" title="Estimated build cost"><${Icon} name="coins" size=${12} />${t.credits[0]}–${t.credits[1]} cr</span>
      <span class="pb-meta" title="Estimated build time"><${Icon} name="timer" size=${12} />${t.minutes[0]}–${t.minutes[1]} min</span>
    </div>
    ${compact ? null : html`<div class="pb-tcard__uses"><${Icon} name="users" size=${12} />${fmtCompact(t.uses)} projects started<span class="pb-tcard__go">View plan <${Icon} name="arrow-right" size=${13} /></span></div>`}
  </a>`;
}

/** Clickable example prompt that starts a project directly. */
export function PromptCard({ label, icon = 'sparkles', prompt }) {
  return html`<button type="button" class="pb-pcard" onClick=${() => navigate(`/new?prompt=${encodeURIComponent(prompt)}`)}>
    <span class="pb-pcard__label"><${Icon} name=${icon} size=${13} />${label}</span>
    <span class="pb-pcard__text">${prompt}</span>
    <span class="pb-pcard__go"><span>Plan this</span><${Icon} name="arrow-right" size=${14} /></span>
  </button>`;
}

/** Marketplace listing card. */
export function MarketCard({ l }) {
  return html`<a href=${`/marketplace/${l.slug}`} class="pb-mcard" aria-label=${l.title}>
    <div class="pb-mcard__thumb">
      <${SafeRender} label=""><${AppThumbnail} project=${l.project} /><//>
      ${l.own ? html`<span class="pb-mcard__flag"><${Badge} tone="green" dot size="sm">Your app<//></span>` : null}
    </div>
    <div class="pb-mcard__body">
      <div class="row gap-8">
        <div class="pb-mcard__title grow t-truncate">${l.title}</div>
        <span class="pb-mcard__rating"><${Icon} name="star-fill" size=${12} />${l.rating.toFixed(1)}</span>
      </div>
      <p class="pb-mcard__desc">${l.short}</p>
      <div class="pb-mcard__meta">
        <span class="row gap-6" style="min-width:0"><${Avatar} name=${l.author.name} size="sm" /><span class="t-truncate">${l.author.name}</span></span>
        <span class="grow"></span>
        <span class="pb-meta"><${Icon} name="play" size=${11} />${fmtCompact(l.runs)} runs</span>
      </div>
      <div class="row gap-6 wrap">
        <${Badge} size="sm">${l.category}<//>
        <${Badge} size="sm" tone="outline">${l.useCase}<//>
        <span class="pb-agents-count"><${Icon} name="bot" size=${12} />${l.agentCount} agents</span>
      </div>
    </div>
  </a>`;
}

export { Stars };
