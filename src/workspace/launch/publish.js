// Publish flow: Launch readiness → deploy pipeline (streamed) → success.
import { html, useState } from '../../lib/html.js';
import { getProject } from '../../lib/store.js';
import { navigate } from '../../lib/router.js';
import { Modal, Button, Segmented, Switch, Input, Textarea, Select, Ring, Callout, Icon, Badge, CopyButton, openModal, toast } from '../../ui/index.js';
import { requireAuth } from '../../shells/Auth.js';
import { computeReadiness, publish, liveUrl, DEPLOY_CREDITS, ENV_LABEL } from '../../engine/deploy.js';
import { CheckGroups, pipelineSteps, runPipeline, PipelineView } from './fixes.js';

export const CATEGORIES = ['Sales', 'Support', 'Operations', 'Finance', 'People & HR', 'Marketing', 'Productivity', 'Education', 'Other'];
const ACCESS = [
  { value: 'public', label: 'Public', icon: 'globe', tip: 'Anyone with the link' },
  { value: 'team', label: 'Team only', icon: 'users', tip: 'Signed-in members of this project' },
  { value: 'password', label: 'Password', icon: 'lock', tip: 'Visitors enter a shared passphrase' },
];
export const ACCESS_LABEL = { public: 'Public', team: 'Team only', password: 'Password' };

/** Marketplace listing fields (shared with the Launch tab's Listing view). */
export function ListingFields({ listing, onChange }) {
  const l = listing || {};
  const set = (k) => (v) => onChange({ ...l, [k]: v });
  const short = l.short || '';
  return html`<div class="ln-fields">
    <div class="ln-fields__row">
      <${Select} label="Category" value=${l.category || ''} placeholder="Choose a category" options=${CATEGORIES.map((c) => ({ value: c, label: c }))} onValue=${set('category')} />
      <${Input} label="Tags" hint="Comma separated" value=${(l.tags || []).join(', ')} placeholder="crm, leads, email"
        onValue=${(v) => onChange({ ...l, tags: v.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 8) })} />
    </div>
    <${Input} label="Short description" value=${short} maxlength=${160} placeholder="One line people see on the listing card"
      onValue=${(v) => set('short')(v.slice(0, 160))} suffix=${html`<span class=${short.length > 150 ? 't-amber t-xs' : 't-faint t-xs'}>${short.length}/160</span>`} />
    <${Textarea} label="Description" rows=${3} value=${l.description || ''} placeholder="What it does, who it's for, what it connects to" onValue=${set('description')} />
  </div>`;
}

function PublishFlow({ close, projectId, env: env0 }) {
  const p = getProject(projectId);
  const [phase, setPhase] = useState('check'); // check | deploying | done | error
  const [env, setEnv] = useState(env0 || 'production');
  const [accessSel, setAccess] = useState(null);
  const [marketplace, setMarketplace] = useState(!!p?.listing?.marketplace);
  const [listing, setListing] = useState({ category: '', description: '', short: '', tags: [], ...(p?.listing || {}) });
  const [domain, setDomain] = useState(p?.domain?.name || '');
  const [analytics, setAnalytics] = useState(p?.analyticsEnabled !== false);
  const [steps, setSteps] = useState([]);
  const [states, setStates] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [dep, setDep] = useState(null);
  if (!p) return html`<${Modal} title="Project not found" onClose=${() => close()}><//>`;
  const access = accessSel || p.settings?.access || (p.settings?.authRequired ? 'team' : 'public');
  const r = computeReadiness(p);
  const blocked = env === 'production' && r.blocking.length > 0;
  const pct = r.total ? Math.round((r.score / r.total) * 100) : 0;

  async function go() {
    if (marketplace && !listing.short) { toast('Add a short description for the Marketplace listing', { tone: 'warn' }); return; }
    const st = pipelineSteps(p, env);
    setSteps(st); setStates(st.map(() => 'pending')); setLogs([]); setError(null); setPhase('deploying');
    try {
      const res = await runPipeline(st, {
        onStep: (i, s) => setStates((a) => a.map((x, j) => (j === i ? s : x))),
        onLog: (l) => setLogs((a) => [...a, l]),
        run: () => publish(projectId, { env, access, marketplace, listing, domain: domain.trim() || null, analytics, durationMs: 6200 }),
      });
      setDep(res); setPhase('done');
    } catch (e) {
      console.warn('[publish]', e); setError(e.message || 'Deploy failed'); setPhase('error');
    }
  }

  if (phase === 'deploying' || phase === 'error') {
    return html`<${Modal} title=${phase === 'error' ? 'Deploy stopped' : `Publishing to ${ENV_LABEL[env]}…`} subtitle=${phase === 'error' ? 'Nothing changed for your visitors — the previous version is still live.' : 'This takes a few seconds. You can close this window; it keeps going.'}
      icon="rocket" size="lg" onClose=${() => close()}
      footer=${phase === 'error' ? html`<${Button} variant="ghost" onClick=${() => setPhase('check')}>Back<//><${Button} variant="primary" icon="refresh" onClick=${go}>Try again<//>` : null}>
      <${PipelineView} steps=${steps} states=${states} logs=${logs} error=${error} />
    <//>`;
  }

  if (phase === 'done' && dep) {
    const url = dep.url;
    return html`<${Modal} size="lg" onClose=${() => close(true)} hideClose=${false}
      footer=${html`<${Button} variant="ghost" onClick=${() => { close(true); navigate(`/p/${projectId}/launch/deploys`); }}>View deploys<//>
        <${Button} variant="primary" icon="external-link" href=${url} target="_blank" rel="noopener">Open live app<//>`}>
      <div class="ln-success">
        <div class="ln-success__icon"><${Icon} name="rocket" size=${26} /></div>
        <div class="t-xl t-strong">${p.name} is live${env === 'staging' ? ' on Staging' : ''}</div>
        <div class="t-muted t-sm">Version ${dep.version} · ${ACCESS_LABEL[dep.access] || 'Public'} · ${dep.credits} credits</div>
        <div class="ln-url"><${Icon} name="globe" size=${14} /><a href=${url} target="_blank" rel="noopener" class="ln-url__text">${url.replace(/^https?:\/\//, '')}</a><${CopyButton} text=${url} label="Copy link" /></div>
        <div class="ln-success__next">
          <button class="ln-next" onClick=${() => { close(true); navigate(`/p/${projectId}/launch/domains`); }}><${Icon} name="link" size=${16} /><span><strong>Set up a custom domain</strong><em>${domain ? domain : 'app.yourcompany.com'}</em></span><${Icon} name="chevron-right" size=${14} /></button>
          ${marketplace ? html`<div class="ln-next ln-next--static"><${Icon} name="store" size=${16} /><span><strong>Submitted to the Marketplace</strong><em>Review usually takes a day (prototype: simulated)</em></span></div>` : null}
          <div class="ln-next ln-next--static"><${Icon} name="history" size=${16} /><span><strong>Rollback is one click</strong><em>Every deploy is a checkpoint</em></span></div>
        </div>
      </div>
    <//>`;
  }

  return html`<${Modal} title="Launch readiness" subtitle="Everything we check before real people use your app. Fix problems in place — nothing is published until you say so."
    icon="rocket" size="lg" onClose=${() => close()} bodyClass="ln-modal-body"
    footer=${html`<span class="t-xs t-faint grow ln-foot-note">Costs ${DEPLOY_CREDITS} credits · creates a checkpoint${blocked ? '' : ' · rollback any time'}</span>
      <${Button} variant="ghost" onClick=${() => close()}>Cancel<//>
      <${Button} variant="primary" icon="rocket" disabled=${blocked} tip=${blocked ? 'Fix or accept the red items first' : undefined} onClick=${go}>Publish to ${ENV_LABEL[env]}<//>`}>
    <div class="ln-score">
      <${Ring} value=${pct} size=${64} stroke=${6} tone=${r.blocking.length ? 'amber' : 'green'} label=${`${r.score}/${r.total}`} />
      <div class="grow">
        <div class="t-lg t-strong">${r.blocking.length ? `${r.blocking.length} thing${r.blocking.length === 1 ? '' : 's'} to fix before Production` : 'Ready for Production'}</div>
        <div class="t-sm t-muted">${r.score} of ${r.total} checks pass${r.checks.some((c) => c.accepted) ? ` · ${r.checks.filter((c) => c.accepted).length} risk accepted` : ''}. Staging never blocks — use it to try things safely.</div>
      </div>
    </div>
    <${CheckGroups} projectId=${projectId} readiness=${r} compact onLeave=${() => close()} />

    <div class="ln-opts">
      <div class="ln-opt">
        <div class="ln-opt__label">Environment</div>
        <${Segmented} value=${env} onChange=${setEnv} options=${[{ value: 'staging', label: 'Staging', icon: 'flask' }, { value: 'production', label: 'Production', icon: 'rocket' }]} />
        <div class="t-xs t-faint">${liveUrl(p, env).replace(/^https?:\/\//, '')}</div>
      </div>
      <div class="ln-opt">
        <div class="ln-opt__label">Who can open it</div>
        <${Segmented} value=${access} onChange=${setAccess} options=${ACCESS} />
        <div class="t-xs t-faint">${ACCESS.find((a) => a.value === access)?.tip}${access === 'password' ? ' — we generate one for you (prototype: simulated)' : ''}</div>
      </div>
      <div class="ln-opt">
        <${Input} label="Custom domain" optional placeholder="app.yourcompany.com" value=${domain} onValue=${setDomain} icon="link" hint="We'll show the DNS records after publishing." />
      </div>
      <div class="ln-opt ln-opt--switch">
        <${Switch} checked=${analytics} onChange=${setAnalytics} label="Usage analytics" hint="Privacy-friendly page views and agent runs, shown in Insights." />
      </div>
    </div>

    <div class="ln-market">
      <${Switch} checked=${marketplace} onChange=${setMarketplace} label="List in the Architect Marketplace" hint="Others can find it and make their own copy. Your data never goes with it." />
      ${marketplace ? html`<${ListingFields} listing=${listing} onChange=${setListing} />` : null}
    </div>
    ${blocked ? html`<${Callout} tone="red" icon="shield-alert" class="mt-12">Production is blocked by ${r.blocking.length} red item${r.blocking.length === 1 ? '' : 's'}. Fix them above, or choose “Accept risk” if you understand the trade-off.<//>` : null}
  <//>`;
}

/** Open the Publish flow: Launch Readiness sheet → deploy progress → success. */
export async function openPublishFlow(projectId, opts = {}) {
  const ok = await requireAuth({ reason: 'Sign in to publish your app', projectId });
  if (!ok) return false;
  return new Promise((resolve) => { openModal(PublishFlow, { projectId, env: opts.env }, { size: 'lg', onClose: (r) => resolve(!!r) }); });
}
