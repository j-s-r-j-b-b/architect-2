// Workspace top bar: back · app tile + inline rename · environment · status chips ·
// people · share · GitHub · credits · publish.
import { html, useState, useRef, useEffect } from '../lib/html.js';
import { updateProject, logActivity, wallet } from '../lib/store.js';
import { cx, fmtNumber, timeAgo } from '../lib/util.js';
import { Icon, IconButton, Button, AvatarStack, Menu, toast } from '../ui/index.js';
import { promiseStats, sampleTables } from '../engine/schema.js';
import { computeReadiness, liveUrl } from '../engine/deploy.js';
import { isActive } from '../engine/simulate.js';
import { isPreBuild } from '../engine/conversation.js';
import { openPublish } from './cards/RunCards.js';
import { openShareDialog } from './ShareDialog.js';
import { Lazy } from './wsKit.js';
import { openPanel } from './bus.js';

const ghLoader = () => import('./github/GitHubPopover.js');

function NameEditor({ project }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(project.name);
  const ref = useRef(null);
  const cancelled = useRef(false);
  useEffect(() => { if (editing && ref.current) { ref.current.focus(); ref.current.select(); } }, [editing]);
  const save = () => {
    if (cancelled.current) { cancelled.current = false; return; }
    const v = val.trim();
    setEditing(false);
    if (!v || v === project.name) return;
    const old = project.name;
    updateProject(project.id, { name: v });
    logActivity(project.id, { actor: 'You', kind: 'edit', plain: `Renamed “${old}” to “${v}”.`, technical: `project.name = ${JSON.stringify(v)}` });
    toast('Renamed', { tone: 'success' });
  };
  if (editing) {
    return html`<input ref=${ref} class="ws-name__input" value=${val} maxlength="60" aria-label="App name"
      onInput=${(e) => setVal(e.currentTarget.value)} onBlur=${save}
      onKeyDown=${(e) => {
        if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); }
        if (e.key === 'Escape') { cancelled.current = true; setVal(project.name); setEditing(false); }
      }} />`;
  }
  return html`<button type="button" class="ws-name" onClick=${() => { setVal(project.name); setEditing(true); }} data-tip="Rename" aria-label=${`Rename ${project.name}`}>
    <span class="t-truncate">${project.name}</span><${Icon} name="pencil" size=${12} class="ws-name__pen" />
  </button>`;
}

function EnvPill({ project }) {
  const envs = project.environments || {};
  const prod = envs.production, stg = envs.staging;
  const when = (e) => { const at = e?.at || e?.publishedAt || e?.createdAt; return at ? ` · ${timeAgo(at)}` : ''; };
  const open = (url) => window.open(url, '_blank', 'noopener');
  const items = [
    { section: 'Environments' },
    { label: 'Draft', icon: 'pencil', desc: `What you’re editing${envs.draft?.version ? ` · v${envs.draft.version}` : ''}`, active: true },
    { label: 'Staging', icon: 'flask', desc: stg ? `v${stg.version || 1}${when(stg)} · open preview` : 'Not published yet — publish to share for review', onClick: () => (stg?.url ? open(stg.url) : openPublish(project.id)) },
    { label: 'Production', icon: 'globe', desc: prod ? `Live · v${prod.version || 1}${when(prod)} · open app` : 'Not live yet', onClick: () => (prod ? open(prod.url || liveUrl(project)) : openPublish(project.id)) },
    { divider: true },
    { label: 'Deploy history', icon: 'history', onClick: () => openPanel('history') },
  ];
  return html`<${Menu} align="bottom-start" width=${280} items=${items}
    trigger=${(o, toggle) => html`<button type="button" class=${cx('ws-env', o && 'is-open')} onClick=${toggle} aria-haspopup="menu" data-tip="Environment">
      <span class=${cx('ws-env__dot', prod && 'is-live')}></span>Draft<${Icon} name="chevron-down" size=${12} />
    </button>`} />`;
}

function Chips({ project }) {
  const ps = promiseStats(project);
  const tables = project.data?.tables?.length || 0;
  const sample = sampleTables(project).length;
  let rd = null;
  try { rd = computeReadiness(project); } catch (e) { rd = null; }
  const base = `/p/${project.id}`;
  const chips = [];
  if (ps.total) chips.push({ id: 'plan', icon: 'list-checks', label: `Promises ${ps.verified}/${ps.total}`, tone: ps.failed ? 'red' : ps.verified === ps.total ? 'green' : 'blueprint', tip: `${ps.verified} of ${ps.total} promises verified${ps.deferred ? ` · ${ps.deferred} deferred` : ''}` });
  if (project.agents.length) chips.push({ id: 'agents', icon: 'bot', label: `Agents ${project.agents.length}`, tone: 'violet', tip: 'AI agents in this app' });
  if (tables) chips.push({ id: 'data', icon: 'database', label: sample ? 'Data: Sample' : 'Data: Live', tone: sample ? 'amber' : 'green', tip: sample ? `${sample} of ${tables} tables use sample data` : 'All tables read live data' });
  if (rd?.total) chips.push({ id: 'launch', icon: 'rocket', label: `Ready ${rd.score}/${rd.total}`, tone: rd.score >= rd.total ? 'green' : 'neutral', tip: 'Launch readiness checks' });
  if (!chips.length) return null;
  return html`<div class="ws-chips-top">${chips.map((c) => html`<a href=${`${base}/${c.id}`} class=${cx('ws-schip', `ws-schip--${c.tone}`)} data-tip=${c.tip}>
    <${Icon} name=${c.icon} size=${12} /><span>${c.label}</span>
  </a>`)}</div>`;
}

function PublishButton({ project }) {
  const envs = project.environments || {};
  const prod = envs.production;
  const prodAt = prod?.at || prod?.publishedAt || prod?.createdAt || 0;
  const lastCp = project.checkpoints?.[0]?.at || 0;
  const changed = !!prod && ((envs.draft?.version || 0) > (prod.version || 0) || (prodAt && lastCp > prodAt + 1000));
  const pre = isPreBuild(project) && !project.screens?.length;
  const busy = isActive(project);
  if (prod && !changed) {
    return html`<${Button} size="sm" variant="secondary" icon="globe" class="ws-publish ws-publish--live" onClick=${() => openPublish(project.id)} tip="Live and up to date">Live<//>`;
  }
  return html`<${Button} size="sm" variant="primary" icon="rocket" class="ws-publish" disabled=${pre}
    tip=${pre ? 'Build the app first' : busy ? 'You can publish once this run finishes' : prod ? 'Publish your latest changes' : 'Put your app online'}
    onClick=${() => openPublish(project.id)}>${prod ? 'Publish changes' : 'Publish'}<//>`;
}

export function TopBar({ project }) {
  const bal = wallet.value.balance || 0;
  const low = bal < 20;
  return html`<header class="ws-top">
    <div class="ws-top__left">
      <${IconButton} icon="arrow-left" label="All projects" size="sm" href="/projects" tipPos="bottom" />
      <span class="ws-appicon" style=${{ background: project.color || 'var(--blueprint)' }} aria-hidden="true"><${Icon} name=${project.icon || 'sparkles'} size=${15} /></span>
      <${NameEditor} project=${project} key=${project.id} />
      <${EnvPill} project=${project} />
    </div>
    <${Chips} project=${project} />
    <div class="ws-top__right">
      <span class="ws-top__people"><${AvatarStack} people=${project.members || []} max=${3} /></span>
      <${Button} size="sm" variant="ghost" icon="user-plus" class="ws-share" onClick=${() => openShareDialog(project.id)} tip="Invite people">Share<//>
      <span class="ws-top__gh"><${Lazy} loader=${ghLoader} pick="GitHubPopover" props=${{ project }} fallback=${null} errorFallback=${null} /></span>
      <a href="/usage" class=${cx('ws-credits', low && 'is-low')} data-tip=${low ? 'Running low — top up in Billing' : 'Credits left · see usage'}><${Icon} name="coins" size=${13} /><span class="t-tabular">${fmtNumber(Math.floor(bal))}</span><span class="ws-credits__u">cr</span></a>
      <${PublishButton} project=${project} />
    </div>
  </header>`;
}
