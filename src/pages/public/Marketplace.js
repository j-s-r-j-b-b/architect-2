// "/marketplace" — community apps you can try live, analyse and remix. Filters live in the URL.
import { html } from '../../lib/html.js';
import { route, setQuery } from '../../lib/router.js';
import { session, projectList } from '../../lib/store.js';
import { Input, Select, Button, Empty, Icon } from '../../ui/index.js';
import { TEMPLATE_CATEGORIES } from '../../engine/catalog.js';
import { plural } from '../../lib/util.js';
import { Frame, DiscoveryHeader } from './parts/common.js';
import { MarketCard } from './parts/cards.js';
import { marketListings, sortListings, USE_CASES } from './parts/market.js';

const SORTS = [{ value: 'popular', label: 'Popular' }, { value: 'recent', label: 'Recent' }, { value: 'rating', label: 'Top rated' }];

export default function Marketplace() {
  const { q = '', sort = 'popular', cat = '', use = '' } = route.value.query;
  const me = session.value;
  const all = marketListings(me ? projectList.value : []);
  const needle = q.trim().toLowerCase();
  const list = sortListings(all.filter((l) => (!cat || l.category === cat) && (!use || l.useCase === use)
    && (!needle || [l.title, l.short, l.description, l.category, l.useCase, l.author.name].join(' ').toLowerCase().includes(needle))), sort);
  const cats = TEMPLATE_CATEGORIES.filter((c) => all.some((l) => l.category === c));
  const filtered = !!(q || cat || use);
  const clear = () => setQuery({ q: null, cat: null, use: null });

  return html`<${Frame}>
    <${DiscoveryHeader}
      eyebrow="Marketplace"
      title=${me ? 'Marketplace' : html`Apps built by the community. <em>Try, inspect, remix.</em>`}
      subtitle="Try any app live with sample data, see exactly how its agents work, then remix it into your own project — you’ll get a fresh plan and quote first."
      actions=${html`<${Button} variant="secondary" icon="rocket" href=${me ? '/projects' : '/signup'} tip="Publish from any live project’s Launch tab">Publish your app<//>`} />

    <div class="pb-filters pb-filters--market">
      <div class="pb-filters__search"><${Input} icon="search" type="search" placeholder="Search apps, authors, use cases…" value=${q} onValue=${(v) => setQuery({ q: v })} aria-label="Search the marketplace" /></div>
      <label class="pb-filters__field"><span>Category</span><${Select} value=${cat} onValue=${(v) => setQuery({ cat: v })} options=${[{ value: '', label: 'All categories' }, ...cats]} aria-label="Category" /></label>
      <label class="pb-filters__field"><span>Use case</span><${Select} value=${use} onValue=${(v) => setQuery({ use: v })} options=${[{ value: '', label: 'All use cases' }, ...USE_CASES]} aria-label="Use case" /></label>
      <label class="pb-filters__field"><span>Sort</span><${Select} value=${sort} onValue=${(v) => setQuery({ sort: v === 'popular' ? null : v })} options=${SORTS} aria-label="Sort" /></label>
    </div>

    <div class="pb-resultbar">
      <span>${plural(list.length, 'app')}${filtered ? ' match your filters' : ''}</span>
      ${filtered ? html`<button class="link t-sm" onClick=${clear}>Clear filters</button>` : html`<span class="pb-resultbar__note"><${Icon} name="flask" size=${13} />Previews run on sample data</span>`}
    </div>

    ${list.length
      ? html`<div class="pb-mgrid">${list.map((l) => html`<${MarketCard} key=${l.slug} l=${l} />`)}</div>`
      : html`<div class="pb-empty-card"><${Empty} icon="store" title="No apps match those filters" body="Try a broader category or use case — or build exactly what you need from a prompt."
          action=${html`<div class="row gap-8 center wrap"><${Button} variant="ghost" onClick=${clear}>Clear filters<//><${Button} variant="primary" icon="sparkles" href=${q ? `/new?prompt=${encodeURIComponent(q)}` : (me ? '/start' : '/')}>Build it yourself<//></div>`} /></div>`}
  <//>`;
}
