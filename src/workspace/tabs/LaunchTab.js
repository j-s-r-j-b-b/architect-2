// Launch tab (/p/:id/launch/:sub) — Readiness · Environments · Deploys · Domains · Listing
import { html, useState } from '../../lib/html.js';
import { updateProject, logActivity } from '../../lib/store.js';
import { route, navigate } from '../../lib/router.js';
import { isSlugAvailable, unpublishApp } from '../../lib/db.js';
import { slugify, timeAgo, fmtDate, sleep, cx, uid } from '../../lib/util.js';
import { Tabs, Button, Card, Badge, StatusPill, Ring, Input, Switch, Empty, Callout, Icon, CopyButton, confirmDialog, toast } from '../../ui/index.js';
import { computeReadiness, publish, liveUrl, ENV_LABEL } from '../../engine/deploy.js';
import { AppThumbnail } from '../../genapp/Renderer.js';
import { openPublishFlow, ListingFields, ACCESS_LABEL } from '../launch/publish.js';
import { CheckGroups } from '../launch/fixes.js';

const SUBS = [
  { id: 'readiness', label: 'Readiness', icon: 'shield-check' },
  { id: 'environments', label: 'Environments', icon: 'layers' },
  { id: 'deploys', label: 'Deploys', icon: 'rocket' },
  { id: 'domains', label: 'Domains', icon: 'globe' },
  { id: 'listing', label: 'Listing', icon: 'store' },
];
const bare = (u = '') => u.replace(/^https?:\/\//, '');
const Sim = () => html`<${Badge} size="sm" tone="neutral" icon="flask">Prototype: simulated<//>`;

function Readiness({ project }) {
  const r = computeReadiness(project);
  const pct = r.total ? Math.round((r.score / r.total) * 100) : 0;
  const prod = project.environments?.production;
  return html`<div class="ln-stack">
    <div class="ln-hero">
      <${Ring} value=${pct} size=${72} stroke=${6} tone=${r.blocking.length ? 'amber' : 'green'} label=${`${r.score}/${r.total}`} />
      <div class="grow">
        <div class="t-xl t-strong">${r.blocking.length ? `${r.blocking.length} blocker${r.blocking.length === 1 ? '' : 's'} before Production` : 'Ready to launch'}</div>
        <div class="t-sm t-muted">${prod ? html`Live: v${prod.version} · published ${timeAgo(prod.at)} · <a class="link" href=${prod.url} target="_blank" rel="noopener">${bare(prod.url)}</a>` : 'Not published yet. Staging never blocks, so you can try it first.'}</div>
      </div>
      <div class="row gap-8 wrap">
        <${Button} variant="secondary" icon="flask" onClick=${() => openPublishFlow(project.id, { env: 'staging' })}>Publish to Staging<//>
        <${Button} variant="primary" icon="rocket" onClick=${() => openPublishFlow(project.id)}>${prod ? 'Publish update' : 'Publish'}<//>
      </div>
    </div>
    <${CheckGroups} projectId=${project.id} readiness=${r} />
  </div>`;
}

function Environments({ project }) {
  const envs = project.environments || {};
  const [busy, setBusy] = useState(false);
  const draftV = Math.max(0, ...(project.deployments || []).map((d) => d.version || 0)) + 1;
  async function promote() {
    const st = envs.staging;
    if (!(await confirmDialog({ title: `Promote v${st.version} to Production?`, body: 'Visitors get exactly what you tested on Staging. The current Production version stays one click away.', confirmLabel: 'Promote' }))) return;
    setBusy(true);
    try { const d = await publish(project.id, { env: 'production', fromCheckpoint: st.checkpointId, note: `Promoted v${st.version} from Staging` }); toast(`Production is now v${d.version}`, { tone: 'success' }); }
    catch (e) { toast(e.message, { tone: 'error' }); } finally { setBusy(false); }
  }
  const card = (key, icon, info, body, action) => html`<div class=${cx('ln-env', info ? 'is-on' : 'is-off', `ln-env--${key}`)}>
    <div class="ln-env__head"><${Icon} name=${icon} size=${16} /><span class="t-strong">${ENV_LABEL[key]}</span><span class="grow"></span>
      ${info ? html`<${StatusPill} status=${key === 'draft' ? 'draft' : 'live'} />` : html`<${Badge} size="sm" tone="neutral">Empty<//>`}</div>
    <div class="ln-env__body">${body}</div>
    <div class="ln-env__foot">${action}</div>
  </div>`;
  return html`<div class="ln-envs">
    ${card('draft', 'pencil', true, html`<div class="ln-env__v">v${draftV} <span class="t-faint t-sm">(unpublished)</span></div><div class="t-sm t-muted">Edited ${timeAgo(project.updatedAt)} · only you and your team see it in the workspace.</div>`,
      html`<${Button} size="sm" variant="secondary" icon="flask" onClick=${() => openPublishFlow(project.id, { env: 'staging' })}>Publish to Staging<//>`)}
    <div class="ln-env__arrow"><${Icon} name="arrow-right" size=${16} /></div>
    ${card('staging', 'flask', envs.staging, envs.staging ? html`<div class="ln-env__v">v${envs.staging.version}</div><div class="t-sm t-muted">Published ${timeAgo(envs.staging.at)}</div><a class="link t-sm" href=${envs.staging.url} target="_blank" rel="noopener">${bare(envs.staging.url)}</a>` : html`<div class="t-sm t-muted">A private copy with its own data, for testing before real users see changes.</div>`,
      envs.staging ? html`<${Button} size="sm" variant="primary" icon="arrow-up" loading=${busy} onClick=${promote}>Promote to Production<//>` : null)}
    <div class="ln-env__arrow"><${Icon} name="arrow-right" size=${16} /></div>
    ${card('production', 'rocket', envs.production, envs.production ? html`<div class="ln-env__v">v${envs.production.version}</div><div class="t-sm t-muted">${ACCESS_LABEL[envs.production.access] || 'Public'} · published ${timeAgo(envs.production.at)}</div><a class="link t-sm" href=${envs.production.url} target="_blank" rel="noopener">${bare(envs.production.url)}</a>` : html`<div class="t-sm t-muted">What your users open. Guarded by the launch-readiness checks.</div>`,
      envs.production ? html`<${Button} size="sm" variant="secondary" icon="external-link" href=${envs.production.url} target="_blank" rel="noopener">Open<//>` : html`<${Button} size="sm" variant="primary" icon="rocket" onClick=${() => openPublishFlow(project.id)}>Publish<//>`)}
  </div>`;
}

function Deploys({ project }) {
  const list = project.deployments || [];
  const [busy, setBusy] = useState(null);
  if (!list.length) return html`<${Empty} icon="rocket" title="No deploys yet" body="Each publish shows up here with who shipped it, what changed and a one-click rollback." action=${html`<${Button} variant="primary" icon="rocket" onClick=${() => openPublishFlow(project.id)}>Publish<//>`} />`;
  async function rollback(d) {
    const cp = project.checkpoints.find((c) => c.id === d.checkpointId);
    if (!cp) { toast('That version’s checkpoint is no longer available', { tone: 'error' }); return; }
    if (!(await confirmDialog({ title: `Roll ${ENV_LABEL[d.env]} back to v${d.version}?`, body: 'We republish that exact snapshot as a new version. Your draft and data are not touched.', confirmLabel: 'Roll back' }))) return;
    setBusy(d.id);
    try { const n = await publish(project.id, { env: d.env, fromCheckpoint: cp.id }); toast(`${ENV_LABEL[d.env]} rolled back — now v${n.version}`, { tone: 'success' }); }
    catch (e) { toast(e.message, { tone: 'error' }); } finally { setBusy(null); }
  }
  return html`<div class="ln-deploys">
    ${list.map((d) => html`<div key=${d.id} class=${cx('ln-dep', d.status === 'live' && 'is-live')}>
      <div class="ln-dep__v">v${d.version}</div>
      <div class="ln-dep__main">
        <div class="row gap-8 wrap"><${Badge} size="sm" tone=${d.env === 'production' ? 'green' : 'amber'}>${ENV_LABEL[d.env]}<//>${d.status === 'live' ? html`<${Badge} size="sm" tone="green" live>Live<//>` : html`<span class="t-xs t-faint">Superseded</span>`}${d.rollbackOf ? html`<${Badge} size="sm" tone="neutral" icon="rotate-ccw">Rollback<//>` : null}</div>
        <div class="t-sm">${d.note || 'Published'} <span class="t-faint">· ${d.by} · ${timeAgo(d.at)} · ${(d.durationMs / 1000).toFixed(1)} s · ${d.credits} cr</span></div>
        <div class="t-xs t-faint">${d.stats ? `${d.stats.screens} screens · ${d.stats.agents} agents · ${d.stats.tables} tables · ` : ''}${fmtDate(d.at)}</div>
      </div>
      <div class="row gap-4">
        <${Button} size="sm" variant="ghost" icon="external-link" href=${d.url} target="_blank" rel="noopener">Open<//>
        ${d.status !== 'live' ? html`<${Button} size="sm" variant="secondary" icon="rotate-ccw" loading=${busy === d.id} onClick=${() => rollback(d)}>Roll back<//>` : null}
      </div>
    </div>`)}
  </div>`;
}

function Domains({ project }) {
  const [slug, setSlug] = useState(project.slug);
  const [slugErr, setSlugErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [dom, setDom] = useState('');
  const [checking, setChecking] = useState(false);
  const d = project.domain;
  async function rename() {
    const s = slugify(slug);
    if (!s || s.length < 3) { setSlugErr('Use at least 3 letters or numbers'); return; }
    if (s === project.slug) return;
    setSaving(true); setSlugErr('');
    try {
      if (!(await isSlugAvailable(s, project.ownerId))) { setSlugErr('That address is taken — try another'); return; }
      const old = project.slug;
      updateProject(project.id, { slug: s });
      logActivity(project.id, { plain: `Changed the app address to /a/${s}`, technical: `slug ${old} → ${s}`, kind: 'settings' });
      if (project.environments?.production) { await publish(project.id, { env: 'production', note: `Moved to /a/${s}` }); await unpublishApp(old).catch(() => {}); }
      setSlug(s); toast('Address updated', { tone: 'success' });
    } finally { setSaving(false); }
  }
  const apex = d && d.name.split('.').length === 2;
  const records = d ? [
    apex ? { type: 'A', name: '@', value: '76.76.21.21' } : { type: 'CNAME', name: d.name.split('.')[0], value: 'cname.architect.app' },
    { type: 'TXT', name: '_architect-verify', value: d.token || 'arch-verify=0000' },
  ] : [];
  async function check() {
    setChecking(true);
    await sleep(1400);
    updateProject(project.id, (x) => { x.domain.status = 'verified'; x.domain.ssl = 'issuing'; x.domain.checkedAt = Date.now(); });
    setChecking(false);
    toast('DNS verified — issuing an SSL certificate', { tone: 'success' });
    await sleep(1600);
    updateProject(project.id, (x) => { if (x.domain) x.domain.ssl = 'active'; });
    logActivity(project.id, { plain: `Connected ${d.name} with HTTPS`, technical: `domain ${d.name} verified · TLS active`, kind: 'settings' });
  }
  return html`<div class="ln-stack">
    <${Card} title="Default address" icon="globe">
      <div class="ln-url"><${Icon} name="globe" size=${14} /><span class="ln-url__text">${bare(liveUrl({ ...project, slug: project.slug }))}</span><${CopyButton} text=${liveUrl(project)} label="Copy link" /></div>
      <div class="ln-slug">
        <${Input} label="App address" value=${slug} onValue=${(v) => { setSlug(v); setSlugErr(''); }} error=${slugErr} suffix=${html`<span class="t-xs t-faint">/a/${slugify(slug) || '…'}</span>`}
          hint=${project.environments?.production ? 'The old link stops working; we republish at the new address.' : 'Free and instant.'} />
        <${Button} variant="secondary" loading=${saving} disabled=${slugify(slug) === project.slug} onClick=${rename}>Rename<//>
      </div>
    <//>
    <${Card} title="Custom domain" icon="link" actions=${html`<${Sim} />`}>
      ${!d ? html`<div class="ln-slug">
        <${Input} label="Domain" placeholder="app.yourcompany.com" value=${dom} onValue=${setDom} hint="A subdomain like app.yourcompany.com is easiest." />
        <${Button} variant="primary" disabled=${!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(dom.trim())} onClick=${() => updateProject(project.id, { domain: { name: dom.trim().toLowerCase(), status: 'pending', ssl: 'pending', addedAt: Date.now(), token: `arch-verify=${uid('v').slice(-10)}` } })}>Add domain<//>
      </div>` : html`<div class="ln-dom">
        <div class="ln-dom__head"><span class="t-strong">${d.name}</span>
          <${Badge} tone=${d.status === 'verified' ? 'green' : 'amber'} dot>${d.status === 'verified' ? 'DNS verified' : 'Waiting for DNS'}<//>
          <${Badge} tone=${d.ssl === 'active' ? 'green' : 'neutral'} icon="lock">${d.ssl === 'active' ? 'SSL active' : d.ssl === 'issuing' ? 'Issuing SSL…' : 'SSL pending'}<//>
          <span class="grow"></span><button class="link t-xs" onClick=${async () => { if (await confirmDialog({ title: `Remove ${d.name}?`, body: 'Visitors using it will stop reaching the app. The default address keeps working.', confirmLabel: 'Remove', danger: true })) updateProject(project.id, { domain: null }); }}>Remove</button></div>
        <ol class="ln-dom__steps">
          <li class="is-done">Add the domain</li>
          <li class=${d.status === 'verified' ? 'is-done' : 'is-cur'}>Add these records at your DNS provider</li>
          <li class=${d.ssl === 'active' ? 'is-done' : d.status === 'verified' ? 'is-cur' : ''}>We verify and issue HTTPS automatically</li>
        </ol>
        <div class="ln-dns">
          <div class="ln-dns__row ln-dns__row--head"><span>Type</span><span>Name</span><span>Value</span><span></span></div>
          ${records.map((rec) => html`<div class="ln-dns__row" key=${rec.type}><span class="t-mono">${rec.type}</span><span class="t-mono">${rec.name}</span><span class="t-mono t-truncate">${rec.value}</span><${CopyButton} text=${rec.value} /></div>`)}
        </div>
        ${d.status !== 'verified' ? html`<div class="row gap-8 wrap"><${Button} variant="primary" icon="refresh" loading=${checking} onClick=${check}>Check status<//><span class="t-xs t-faint">DNS changes can take a few minutes to spread.</span></div>` : d.ssl === 'active' ? html`<${Callout} tone="green" icon="check-circle">${d.name} serves your Production app over HTTPS.<//>` : null}
      </div>`}
    <//>
  </div>`;
}

function Listing({ project }) {
  const l = project.listing || {};
  const save = (next) => updateProject(project.id, { listing: { ...l, ...next } });
  return html`<div class="ln-listing">
    <div class="ln-stack">
      <${Card} padded>
        <${Switch} checked=${!!l.marketplace} onChange=${(v) => save({ marketplace: v })} label="List in the Architect Marketplace" hint="People can preview it and make their own copy. Your data, secrets and connections never go with it." />
      <//>
      <${Card} title="Listing details" icon="store" padded>
        <${ListingFields} listing=${l} onChange=${save} />
      <//>
      ${l.marketplace && !project.environments?.production ? html`<${Callout} tone="amber" icon="info">The listing goes live the next time you publish to Production.<//>` : null}
    </div>
    <div class="ln-preview">
      <div class="t-xs t-faint t-upper mb-4">Preview</div>
      <div class="ln-card">
        <div class="ln-card__thumb"><${AppThumbnail} project=${project} width=${320} /></div>
        <div class="ln-card__body">
          <div class="row gap-8"><span class="t-strong grow t-truncate">${project.name}</span>${l.category ? html`<${Badge} size="sm">${l.category}<//>` : null}</div>
          <div class="t-sm t-muted ln-card__short">${l.short || 'Your short description appears here.'}</div>
          <div class="row gap-4 wrap">${(l.tags || []).map((t) => html`<span class="ln-tag" key=${t}>#${t}</span>`)}</div>
          <div class="row gap-8 t-xs t-faint"><${Icon} name="bot" size=${12} />${project.agents?.length || 0} agents · ${project.screens?.length || 0} screens</div>
        </div>
      </div>
    </div>
  </div>`;
}

const VIEWS = { readiness: Readiness, environments: Environments, deploys: Deploys, domains: Domains, listing: Listing };

export default function LaunchTab({ project, params = {} }) {
  const fromPath = (route.value?.path || '').split('/')[4];
  const want = params.sub || params.a || fromPath || 'readiness';
  const sub = SUBS.find((s) => s.id === want) || SUBS[0];
  const r = computeReadiness(project);
  const counts = { readiness: r.blocking.length || null, deploys: project.deployments?.length || null };
  const V = VIEWS[sub.id];
  return html`<div class="ln-root">
    <div class="ln-subnav">
      <${Tabs} variant="pill" value=${sub.id} tabs=${SUBS.map((s) => ({ id: s.id, label: s.label, icon: s.icon, count: counts[s.id], href: `/p/${project.id}/launch/${s.id}` }))} />
      <span class="grow"></span>
      ${project.environments?.production ? html`<a class="ln-live" href=${project.environments.production.url} target="_blank" rel="noopener"><span class="ln-live__dot"></span>Live · v${project.environments.production.version}</a>` : null}
    </div>
    <div class="ln-body" key=${sub.id}><${V} project=${project} /></div>
  </div>`;
}
