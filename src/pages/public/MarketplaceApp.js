// "/marketplace/:slug" — try it (interactive preview), Analyze how it works (agents, roles, tools), Reviews.
import { html, useState } from '../../lib/html.js';
import { navigate, route, setQuery } from '../../lib/router.js';
import { session, projectList } from '../../lib/store.js';
import { requireAuth } from '../../shells/Auth.js';
import { IntegrationTile } from '../../shells/ConnectSheet.js';
import { Icon, Button, Badge, StatusPill, Tabs, Empty, Avatar, Textarea, toast, Callout } from '../../ui/index.js';
import { ROLES, integrationById } from '../../engine/catalog.js';
import { fmtCompact, fmtDate, timeAgo, plural } from '../../lib/util.js';
import { Frame, Stars } from './parts/common.js';
import { listingBySlug, listingReviews, ratingHistogram } from './parts/market.js';
import { AgentSummary, WirePreview } from './TemplateDetail.js';

const ROLE_CAN = {
  owner: ['Everything, including billing and deleting the app'],
  editor: ['Change screens, data and agents', 'Publish drafts to staging'],
  reviewer: ['Approve changes going to production', 'Approve risky agent actions'],
  viewer: ['Use the app and see insights'],
};

function Overview({ l, p }) {
  const promises = p.plan?.promises || [];
  return html`<div class="pb-ov">
    <${WirePreview} project=${p} mode="interact" url=${`${l.slug}.architect.space`} height=${540}
      badge=${html`<${StatusPill} status="sample" size="sm" /><${Badge} size="sm" tone="outline" icon="flask">Prototype: simulated<//>`} />
    <div class="pb-ov__grid">
      <div class="pb-ov__main">
        <h2 class="pb-block__title">About this app</h2>
        <p class="pb-ov__desc">${l.description}</p>
        ${promises.length ? html`<h3 class="pb-ov__h">What it promises</h3>
          <ul class="pb-checks pb-checks--sm">${promises.filter((x) => x.status !== 'deferred').map((x) => html`<li><span class="pb-checks__icon"><${Icon} name="check" size=${12} stroke=${2.6} /></span>${x.title}</li>`)}</ul>` : null}
      </div>
      <div class="pb-side-card">
        <div class="pb-side-card__title">Details</div>
        <dl class="pb-dl">
          <dt>Category</dt><dd>${l.category}</dd>
          <dt>Use case</dt><dd>${l.useCase}</dd>
          <dt>Agents</dt><dd>${l.agentCount}</dd>
          <dt>Runs</dt><dd>${fmtCompact(l.runs)}</dd>
          ${l.remixes ? html`<dt>Remixes</dt><dd>${fmtCompact(l.remixes)}</dd>` : null}
          <dt>Updated</dt><dd>${timeAgo(l.updatedAt)}</dd>
        </dl>
        <div class="pb-side-card__title mt-12">Connections</div>
        <div class="row gap-6 wrap">${l.integrations.map((id) => html`<span class="pb-tool"><${IntegrationTile} id=${id} size="sm" />${integrationById(id).name}</span>`)}</div>
      </div>
    </div>
  </div>`;
}

function Analyze({ p }) {
  const agents = p.agents || [];
  const tables = p.data?.tables || [];
  return html`<div class="pb-an">
    <${Callout} tone="violet" icon="scan-eye">This is exactly what you get when you remix: every agent’s job, instructions, tools and boundaries. Nothing is hidden.<//>
    <section class="pb-block">
      <div class="pb-block__head"><h2 class="pb-block__title">Agents</h2><span class="t-sm t-faint">${plural(agents.length, 'agent')} · ${agents.filter((a) => a.kind === 'manager').length ? 'a manager routes work to specialists' : 'independent specialists'}</span></div>
      <div class="pb-agents pb-agents--full">${agents.map((a) => html`<${AgentSummary} a=${a} full />`)}</div>
    </section>
    <div class="pb-an__grid">
      <section class="pb-block">
        <div class="pb-block__head"><h2 class="pb-block__title">Roles</h2></div>
        <div class="pb-roles">${ROLES.map((r) => html`<div class="pb-role"><div class="pb-role__n">${r.label}</div><ul>${(ROLE_CAN[r.id] || [r.desc]).map((x) => html`<li>${x}</li>`)}</ul></div>`)}</div>
      </section>
      <section class="pb-block">
        <div class="pb-block__head"><h2 class="pb-block__title">Data</h2></div>
        <div class="pb-sd">${tables.map((tb) => html`<div class="pb-sd__item"><span class="pb-sd__icon pb-sd__icon--data"><${Icon} name="database" size=${15} /></span><div class="grow" style="min-width:0"><div class="pb-sd__t">${tb.name}</div><div class="pb-sd__s">${tb.columns.map((c) => c.label).slice(0, 5).join(' · ')}${tb.columns.length > 5 ? ' …' : ''}</div>${tb.rules ? html`<div class="pb-sd__s mt-4"><${Icon} name="lock" size=${11} /> ${tb.rules}</div>` : null}</div><${StatusPill} status=${tb.source === 'live' ? 'real' : tb.source === 'test' ? 'test' : 'sample'} size="sm" /></div>`)}</div>
      </section>
    </div>
  </div>`;
}

function Reviews({ l }) {
  const [mine, setMine] = useState([]);
  const [draft, setDraft] = useState('');
  const [stars, setStars] = useState(5);
  const [writing, setWriting] = useState(false);
  const all = [...mine, ...listingReviews(l)];
  const hist = ratingHistogram(l);
  const max = Math.max(1, ...hist);
  const start = async () => { if (await requireAuth({ reason: 'Sign in to write a review' })) setWriting(true); };
  const post = () => {
    if (draft.trim().length < 10) { toast('Add a few more words so it’s useful to others', { tone: 'warn' }); return; }
    setMine([{ id: 'mine' + Date.now(), stars, title: 'Your review', body: draft.trim(), author: session.value?.name || 'You', at: Date.now(), helpful: 0, own: true }, ...mine]);
    setDraft(''); setWriting(false);
    toast('Review posted', { tone: 'success' });
  };
  return html`<div class="pb-rv">
    <div class="pb-rv__summary">
      <div class="pb-rv__avg">${l.reviewCount ? l.rating.toFixed(1) : '—'}</div>
      <${Stars} value=${l.rating} size=${16} />
      <div class="t-sm t-faint mt-4">${l.reviewCount ? `${fmtCompact(l.reviewCount)} ratings` : 'No ratings yet'}</div>
      <div class="pb-rv__hist">${hist.map((n, i) => html`<div class="pb-rv__bar"><span>${5 - i}</span><span class="pb-rv__track"><i style=${{ width: (n / max) * 100 + '%' }}></i></span><span class="t-tabular">${n}</span></div>`)}</div>
      ${l.own ? null : html`<${Button} full variant="secondary" icon="pencil" onClick=${start}>Write a review<//>`}
    </div>
    <div class="pb-rv__list">
      ${writing ? html`<div class="pb-rv__form">
        <div class="row gap-8"><span class="t-sm t-strong">Your rating</span><span class="pb-rv__pick">${[1, 2, 3, 4, 5].map((n) => html`<button type="button" aria-label=${`${n} stars`} class=${n <= stars ? 'is-on' : ''} onClick=${() => setStars(n)}><${Icon} name="star-fill" size=${18} /></button>`)}</span></div>
        <${Textarea} rows=${3} value=${draft} onValue=${setDraft} placeholder="What worked, what didn’t, who is it good for?" aria-label="Review" />
        <div class="row gap-8 between wrap"><span class="t-xs t-faint">Prototype: reviews are kept for this visit only.</span><span class="row gap-6"><${Button} variant="ghost" size="sm" onClick=${() => setWriting(false)}>Cancel<//><${Button} variant="primary" size="sm" onClick=${post}>Post review<//></span></div>
      </div>` : null}
      ${all.length ? all.map((r) => html`<article class="pb-review">
        <div class="row gap-8"><${Avatar} name=${r.author} size="sm" /><span class="t-sm t-strong">${r.author}</span>${r.own ? html`<${Badge} size="sm" tone="blueprint">You<//>` : null}<span class="grow"></span><span class="t-xs t-faint">${timeAgo(r.at)}</span></div>
        <div class="row gap-8 mt-8"><${Stars} value=${r.stars} size=${12} /><span class="t-md t-strong">${r.title}</span></div>
        <p class="pb-review__body">${r.body}</p>
        ${r.helpful ? html`<div class="t-xs t-faint mt-4"><${Icon} name="thumbs-up" size=${11} /> ${r.helpful} found this helpful</div>` : null}
      </article>`) : html`<${Empty} icon="star" title="No reviews yet" body="Be the first to share how it worked for you." />`}
    </div>
  </div>`;
}

export default function MarketplaceApp({ params }) {
  const me = session.value;
  const l = listingBySlug(params.slug, me ? projectList.value : []);
  const tab = ['overview', 'analyze', 'reviews'].includes(route.value.query.tab) ? route.value.query.tab : 'overview';
  if (!l) return html`<${Frame}><div class="pb-empty-card"><${Empty} icon="store" title="This app isn’t in the Marketplace" body="It may have been unpublished by its author. Browse other apps, or build your own from a prompt." action=${html`<div class="row gap-8 center wrap"><${Button} variant="primary" href="/marketplace">Browse the Marketplace<//><${Button} variant="ghost" href="/">Describe your own<//></div>`} /></div><//>`;
  const p = l.project;
  const remix = () => {
    if (l.kind === 'template') navigate(`/new?template=${l.templateId}`);
    else navigate(`/new?prompt=${encodeURIComponent(p.prompt || l.description)}`);
  };

  return html`<${Frame}>
    <nav class="pb-crumb" aria-label="Breadcrumb"><a href="/marketplace">Marketplace</a><${Icon} name="chevron-right" size=${13} /><a href=${`/marketplace?cat=${encodeURIComponent(l.category)}`}>${l.category}</a><${Icon} name="chevron-right" size=${13} /><span>${l.title}</span></nav>
    <header class="pb-thead">
      <span class="pb-thead__icon"><${Icon} name=${p.icon || 'sparkles'} size=${24} /></span>
      <div class="grow" style="min-width:0">
        <h1 class="pb-thead__title">${l.title}</h1>
        <div class="pb-thead__meta">
          <span class="row gap-6"><${Avatar} name=${l.author.name} size="sm" /><span class="t-sm"><b>${l.author.name}</b><span class="t-faint"> · ${l.author.org}</span></span></span>
          ${l.reviewCount ? html`<span class="row gap-4"><${Stars} value=${l.rating} size=${12} /><span class="t-sm t-strong">${l.rating.toFixed(1)}</span><span class="t-sm t-faint">(${fmtCompact(l.reviewCount)})</span></span>` : null}
          <span class="pb-meta"><${Icon} name="play" size=${11} />${fmtCompact(l.runs)} runs</span>
          ${l.live ? html`<${StatusPill} status="live" />` : html`<span class="pb-meta">Published ${fmtDate(l.publishedAt, { month: 'short', year: 'numeric' })}</span>`}
        </div>
      </div>
      <div class="pb-thead__actions">
        ${l.own ? html`<${Button} variant="secondary" icon="folder-open" href=${`/p/${p.id}/app`}>Open in workspace<//>` : null}
        ${l.live ? html`<${Button} variant="secondary" icon="external-link" href=${`/a/${p.slug}`}>Open live<//>` : null}
        <${Button} variant="primary" icon="repeat" onClick=${remix} tip="Creates your own copy — you’ll see a plan and a quote first">Remix this app<//>
      </div>
    </header>

    <${Tabs} value=${tab} onChange=${(id) => setQuery({ tab: id === 'overview' ? null : id })} class="pb-tabs" tabs=${[
      { id: 'overview', label: 'Overview', icon: 'eye' },
      { id: 'analyze', label: 'Analyze', icon: 'scan-eye', count: (p.agents || []).length },
      { id: 'reviews', label: 'Reviews', icon: 'star', count: l.reviewCount || null },
    ]} />
    <div class="pb-tabbody">
      ${tab === 'overview' ? html`<${Overview} l=${l} p=${p} />` : tab === 'analyze' ? html`<${Analyze} p=${p} />` : html`<${Reviews} l=${l} />`}
    </div>
  <//>`;
}
