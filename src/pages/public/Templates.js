// "/templates" — the prompt library. Filters live in the URL (?q=&cat=&sort=) so Back restores them.
import { html } from '../../lib/html.js';
import { route, setQuery, navigate } from '../../lib/router.js';
import { session } from '../../lib/store.js';
import { Input, Select, Button, Empty, Icon } from '../../ui/index.js';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '../../engine/catalog.js';
import { cx, plural } from '../../lib/util.js';
import { Frame, DiscoveryHeader } from './parts/common.js';
import { TemplateCard } from './parts/cards.js';

const SORTS = [{ value: 'popular', label: 'Popular' }, { value: 'used', label: 'Most used' }];

export function filterTemplates({ q = '', cat = '', sort = 'popular' } = {}) {
  const needle = q.trim().toLowerCase();
  let list = TEMPLATES.filter((t) => (!cat || t.category === cat) && (!needle || [t.title, t.category, t.prompt, ...t.agents, ...t.integrations].join(' ').toLowerCase().includes(needle)));
  list = [...list].sort((a, b) => (sort === 'used' ? b.uses - a.uses : (b.popular ? 1 : 0) - (a.popular ? 1 : 0) || b.uses - a.uses));
  return list;
}

export default function Templates() {
  const { q = '', cat = '', sort = 'popular' } = route.value.query;
  const list = filterTemplates({ q, cat, sort });
  const counts = Object.fromEntries(TEMPLATE_CATEGORIES.map((c) => [c, TEMPLATES.filter((t) => t.category === c).length]));
  const me = session.value;
  const describe = () => navigate(q.trim() ? `/new?prompt=${encodeURIComponent(q.trim())}` : (me ? '/start' : '/'));

  return html`<${Frame}>
    <${DiscoveryHeader}
      eyebrow="Templates"
      title=${me ? 'Templates' : html`Start from a plan <em>that already works.</em>`}
      subtitle="Every template is a prompt with a ready plan — promises, agents, screens and a quote. Nothing is built or charged until you approve."
      actions=${html`<${Button} variant="secondary" icon="sparkles" onClick=${describe}>Describe your own<//>`} />

    <div class="pb-filters">
      <div class="pb-filters__search"><${Input} icon="search" type="search" placeholder="Search templates, agents or tools…" value=${q} onValue=${(v) => setQuery({ q: v })} aria-label="Search templates" /></div>
      <label class="pb-filters__field"><span>Sort</span><${Select} value=${sort} options=${SORTS} onValue=${(v) => setQuery({ sort: v === 'popular' ? null : v })} aria-label="Sort templates" /></label>
    </div>
    <div class="pb-chips" role="tablist" aria-label="Categories">
      <button type="button" role="tab" aria-selected=${!cat} class=${cx('chip', !cat && 'is-active')} onClick=${() => setQuery({ cat: null })}>All <span class="pb-chips__n">${TEMPLATES.length}</span></button>
      ${TEMPLATE_CATEGORIES.filter((c) => counts[c]).map((c) => html`<button type="button" role="tab" aria-selected=${cat === c} class=${cx('chip', cat === c && 'is-active')} onClick=${() => setQuery({ cat: cat === c ? null : c })}>${c} <span class="pb-chips__n">${counts[c]}</span></button>`)}
    </div>

    <div class="pb-resultbar">
      <span>${plural(list.length, 'template')}${cat ? html` in <b>${cat}</b>` : null}${q ? html` matching “${q}”` : null}</span>
      ${q || cat ? html`<button class="link t-sm" onClick=${() => setQuery({ q: null, cat: null })}>Clear filters</button>` : null}
    </div>

    ${list.length
      ? html`<div class="pb-tgrid">${list.map((t) => html`<${TemplateCard} key=${t.id} t=${t} />`)}</div>`
      : html`<div class="pb-empty-card"><${Empty} icon="search" title="No template matches that"
          body=${q ? `Nothing for “${q}” yet — but you can describe it and get a plan in about a minute, free.` : 'Try another category.'}
          action=${html`<div class="row gap-8 wrap center">${q ? html`<${Button} variant="primary" icon="sparkles" onClick=${describe}>Plan “${q.length > 32 ? q.slice(0, 32) + '…' : q}”<//>` : null}<${Button} variant="ghost" onClick=${() => setQuery({ q: null, cat: null })}>Clear filters<//></div>`} /></div>`}

    <div class="pb-note"><${Icon} name="info" size=${14} /><span>Estimates are for a first build on the Balanced model tier. Your actual quote is itemised from your answers before you approve anything.</span></div>
  <//>`;
}
