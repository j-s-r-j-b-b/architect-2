// Plan › Spec — the living spec with a scope contract (numbered, checkable promises).
import { html, useState } from '../../lib/html.js';
import { updateProject, getProject } from '../../lib/store.js';
import { timeAgo, cx, plural, fmtRange } from '../../lib/util.js';
import { Button, IconButton, Input, Textarea, Badge, StatusPill, Empty, Menu, Icon, toast, confirmDialog, openModal, Modal } from '../../ui/index.js';
import { includePromise } from '../../engine/conversation.js';
import { promiseStats } from '../../engine/schema.js';
import { askArchitect } from '../bus.js';
import { PROMISE_TONE, resolveRef, RefChip, SectionHead, isBuilt } from './shared.js';
import { QuoteCard, DecisionsCard, QuestionsCard } from './SpecSide.js';

const EXAMPLES = [
  'A lead desk that scores inbound leads and drafts follow-ups',
  'A support inbox that answers FAQs and escalates the rest',
  'A weekly report agent that summarises our Stripe revenue',
];

export default function Spec({ project }) {
  const p = project;
  const promises = p.plan?.promises || [];
  const planning = p.status === 'planning';
  const brandNew = !promises.length && !planning;

  return html`<div class=${cx('pl-spec', planning && 'pl-spec--planning')}>
    <div class="pl-spec__main">
      <${SpecHeader} project=${p} />
      ${brandNew ? html`<div class="card pl-empty-card">
          <${Empty} icon="clipboard-list" title="No plan yet — and nothing spent"
            body="Describe what you want in the chat. Architect asks 2–3 questions, then drafts a plan here: numbered promises you can check, and a price before anything is built."
            action=${html`<div class="col gap-8" style="align-items:center">
              <${Button} variant="primary" icon="sparkles" onClick=${() => askArchitect('')}>Describe your app<//>
              <div class="row wrap center gap-6 mt-8">${EXAMPLES.map((e) => html`<button class="chip chip--sm" onClick=${() => askArchitect(e)}>${e}</button>`)}</div>
            </div>`} />
        </div>`
        : planning && !promises.length ? html`<${PlanningPlaceholder} />`
          : html`<${PromiseList} project=${p} />`}
    </div>
    <aside class="pl-spec__side">
      ${planning ? html`<${QuestionsCard} project=${p} />` : null}
      <${QuoteCard} project=${p} />
      ${!brandNew ? html`<${DecisionsCard} project=${p} />` : null}
    </aside>
  </div>`;
}

function PlanningPlaceholder() {
  return html`<div class="card pl-planning">
    <div class="row gap-8"><span class="spinner"></span><span class="t-strong">Drafting your plan</span></div>
    <p class="t-md t-muted mt-8">Answer the open questions and Architect turns them into numbered promises — each with acceptance checks and a cost range. Nothing is built or charged yet.</p>
    <div class="col gap-8 mt-16">${[80, 64, 72].map((w) => html`<div class="pl-ghost-row"><span class="skeleton" style="width:34px;height:20px"></span><span class="skeleton" style=${`width:${w}%;height:14px`}></span></div>`)}</div>
  </div>`;
}

function SpecHeader({ project: p }) {
  const [editing, setEditing] = useState(false);
  const [summary, setSummary] = useState(p.plan?.summary || '');
  const [audience, setAudience] = useState(p.plan?.audience || '');
  const st = promiseStats(p);
  const save = () => {
    updateProject(p.id, (d) => { d.plan.summary = summary.trim(); d.plan.audience = audience.trim(); });
    setEditing(false); toast('Spec updated', { tone: 'success' });
  };
  const start = () => { setSummary(p.plan?.summary || ''); setAudience(p.plan?.audience || ''); setEditing(true); };
  return html`<section class="card pl-spec-head">
    <div class="row between wrap gap-8">
      <div class="row gap-8 wrap"><span class="pl-eyebrow">Living spec</span><${StatusPill} status=${p.status} /></div>
      <div class="row gap-6">
        <span class="t-xs t-faint">Updated ${timeAgo(p.updatedAt)}</span>
        ${!editing && p.plan?.summary ? html`<${IconButton} icon="pencil" size="sm" label="Edit summary" onClick=${start} />` : null}
      </div>
    </div>
    <h2 class="pl-spec-title">What <em>${p.name}</em> will do</h2>
    ${editing ? html`<div class="col gap-8 mt-8">
        <${Textarea} label="Summary" rows=${3} value=${summary} onValue=${setSummary} />
        <${Input} label="Who it's for" value=${audience} onValue=${setAudience} placeholder="e.g. Sales team (5–10 people)" />
        <div class="row gap-8"><${Button} variant="primary" size="sm" onClick=${save}>Save<//><${Button} variant="ghost" size="sm" onClick=${() => setEditing(false)}>Cancel<//></div>
      </div>`
      : html`<p class="pl-spec-summary">${p.plan?.summary || html`<span class="t-faint">The one-paragraph summary appears once the plan is drafted.</span>`}</p>`}
    <div class="row wrap gap-6 mt-12">
      ${p.plan?.audience ? html`<span class="pl-meta"><${Icon} name="users" size=${13} />For ${p.plan.audience}</span>` : null}
      ${st.total ? html`<span class="pl-meta"><${Icon} name="list-checks" size=${13} />${st.verified}/${st.total} promises verified</span>` : null}
      ${st.deferred ? html`<span class="pl-meta"><${Icon} name="minus" size=${13} />${st.deferred} deferred</span>` : null}
      ${p.agents?.length ? html`<a class="pl-meta pl-meta--link" href=${`/p/${p.id}/agents`}><${Icon} name="bot" size=${13} />${plural(p.agents.length, 'agent')}</a>` : null}
      ${p.screens?.length ? html`<a class="pl-meta pl-meta--link" href=${`/p/${p.id}/plan/mockup`}><${Icon} name="layout-dashboard" size=${13} />${plural(p.screens.length, 'screen')}</a>` : null}
      ${p.data?.tables?.length ? html`<a class="pl-meta pl-meta--link" href=${`/p/${p.id}/data`}><${Icon} name="database" size=${13} />${plural(p.data.tables.length, 'table')}</a>` : null}
    </div>
  </section>`;
}

function PromiseList({ project: p }) {
  const promises = p.plan.promises;
  const active = promises.filter((x) => x.status !== 'deferred');
  const deferred = promises.filter((x) => x.status === 'deferred');
  const [open, setOpen] = useState(() => new Set());
  const toggle = (id) => { const n = new Set(open); n.has(id) ? n.delete(id) : n.add(id); setOpen(n); };
  const allOpen = active.length && active.every((x) => open.has(x.id));
  return html`<section>
    <${SectionHead} icon="list-checks" title=${`Promises (${active.length})`}
      sub="The scope contract: each promise is built, then checked against its acceptance checks before it counts as done."
      right=${active.length ? html`<${Button} size="sm" variant="ghost" icon=${allOpen ? 'chevron-up' : 'chevron-down'} onClick=${() => setOpen(allOpen ? new Set() : new Set(active.map((x) => x.id)))}>${allOpen ? 'Collapse checks' : 'Show all checks'}<//>` : null} />
    <ol class="pl-promises">
      ${active.map((pr, i) => html`<${PromiseRow} key=${pr.id} project=${p} pr=${pr} n=${i + 1} expanded=${open.has(pr.id)} onToggle=${() => toggle(pr.id)} />`)}
    </ol>
    <${AddPromise} project=${p} />
    ${deferred.length ? html`<div class="pl-deferred">
      <${SectionHead} icon="minus" title=${`Deferred (${deferred.length})`} sub="Not in this build. Include any of them — the quote updates before anything is spent." />
      ${deferred.map((pr) => html`<${DeferredRow} key=${pr.id} project=${p} pr=${pr} />`)}
    </div>` : null}
  </section>`;
}

function checkIcon(status) {
  if (status === 'verified' || status === 'live') return { icon: 'check', cls: 'is-ok' };
  if (status === 'building') return { icon: 'loader', cls: 'is-run' };
  if (status === 'failed') return { icon: 'alert-circle', cls: 'is-bad' };
  return { icon: 'circle-dashed', cls: '' };
}

function PromiseRow({ project: p, pr, n, expanded, onToggle }) {
  const [editing, setEditing] = useState(false);
  const tone = PROMISE_TONE[pr.status] || 'blueprint';
  const refs = (pr.refs || []).map((r) => resolveRef(p, r)).filter(Boolean);
  const ci = checkIcon(pr.status);
  const verified = pr.status === 'verified' || pr.status === 'live';
  const menu = [
    { label: 'Edit', icon: 'pencil', onClick: () => setEditing(true) },
    { label: 'Defer', icon: 'minus', desc: 'Leave it out of this build', onClick: () => deferPromise(p, pr) },
    pr.status === 'failed' ? { label: 'Ask Architect to fix', icon: 'wand', onClick: () => askArchitect(`Promise ${pr.id} failed its checks: “${pr.title}”. Find out why and fix it.`, { kind: 'block', id: pr.id, label: `${pr.id} · ${pr.title}` }) } : null,
    { divider: true },
    { label: 'Remove', icon: 'trash', danger: true, onClick: () => removePromise(p, pr) },
  ];
  if (editing) return html`<li class="pl-promise is-editing"><${PromiseEditor} project=${p} pr=${pr} onDone=${() => setEditing(false)} /></li>`;
  return html`<li class=${cx('pl-promise', `pl-promise--${tone}`)}>
    <div class="pl-promise__num">${pr.id || n}</div>
    <div class="pl-promise__body">
      <div class="pl-promise__top">
        <${StatusPill} status=${pr.status} size="sm" />
        <div class="pl-promise__title">${pr.title}</div>
      </div>
      ${pr.detail ? html`<div class="pl-promise__detail">${pr.detail}</div>` : null}
      ${verified && pr.proof ? html`<div class="pl-proof"><${Icon} name="badge-check" size=${14} /><span><b>Proof:</b> ${pr.proof}</span></div>` : null}
      <div class="row wrap gap-6 mt-8">
        ${pr.checks?.length ? html`<button class="pl-checks-toggle" onClick=${onToggle} aria-expanded=${expanded}>
          <${Icon} name=${expanded ? 'chevron-down' : 'chevron-right'} size=${13} />
          ${verified ? `${pr.checks.length}/${pr.checks.length} checks passed` : plural(pr.checks.length, 'acceptance check')}
        </button>` : html`<span class="t-xs t-faint">No acceptance checks yet</span>`}
        ${refs.map((r) => html`<${RefChip} r=${r} />`)}
      </div>
      ${expanded && pr.checks?.length ? html`<ul class="pl-checks">
        ${pr.checks.map((c) => html`<li class=${ci.cls}><${Icon} name=${ci.icon} size=${14} /><span>${c}</span></li>`)}
      </ul>` : null}
    </div>
    <div class="pl-promise__side">
      ${pr.cost ? html`<span class="pl-cost" title="Estimated credits for this promise">${fmtRange(pr.cost)} cr</span>` : null}
      <${Menu} items=${menu} trigger=${(o, t) => html`<${IconButton} icon="more-horizontal" size="sm" label="Promise actions" onClick=${t} active=${o} />`} />
    </div>
  </li>`;
}

function PromiseEditor({ project: p, pr, onDone }) {
  const [title, setTitle] = useState(pr.title);
  const [detail, setDetail] = useState(pr.detail || '');
  const [checks, setChecks] = useState((pr.checks || []).join('\n'));
  const save = () => {
    if (!title.trim()) { toast('A promise needs a title', { tone: 'warn' }); return; }
    const touchedAfterBuild = isBuilt(p) && (title.trim() !== pr.title || checks.trim() !== (pr.checks || []).join('\n'));
    updateProject(p.id, (d) => {
      const x = d.plan.promises.find((y) => y.id === pr.id);
      x.title = title.trim(); x.detail = detail.trim();
      x.checks = checks.split('\n').map((s) => s.trim()).filter(Boolean);
      if (touchedAfterBuild && (x.status === 'verified' || x.status === 'live')) { x.status = 'planned'; x.proof = undefined; }
    });
    toast(touchedAfterBuild ? `${pr.id} changed — it will be rebuilt and re-checked on your next build` : `${pr.id} updated`, { tone: 'success' });
    onDone();
  };
  return html`<div class="pl-editor">
    <div class="row gap-8"><span class="pl-promise__num">${pr.id}</span><span class="t-sm t-faint">Editing promise</span></div>
    <${Input} label="Promise" value=${title} onValue=${setTitle} onKeyDown=${(e) => e.key === 'Enter' && save()} />
    <${Input} label="In plain words" value=${detail} onValue=${setDetail} placeholder="One sentence a teammate would understand" />
    <${Textarea} label="Acceptance checks" hint="One per line. The build is verified against these." rows=${3} value=${checks} onValue=${setChecks} />
    <div class="row gap-8"><${Button} size="sm" variant="primary" onClick=${save}>Save<//><${Button} size="sm" variant="ghost" onClick=${onDone}>Cancel<//></div>
  </div>`;
}

function AddPromise({ project: p }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const add = () => {
    const t = title.trim();
    if (!t) return;
    const nums = (p.plan.promises || []).map((x) => parseInt(String(x.id).replace(/\D/g, ''), 10) || 0);
    const id = `P${Math.max(0, ...nums) + 1}`;
    const words = t.split(/\s+/).length;
    const cost = words > 10 ? [4, 6] : [2, 4];
    updateProject(p.id, (d) => { d.plan.promises.push({ id, title: t, detail: detail.trim(), checks: [], status: 'planned', cost, refs: [] }); });
    toast(isBuilt(p) ? `${id} added — build it from the quote card when you're ready (≈${fmtRange(cost)} cr)` : `${id} added to the plan (≈${fmtRange(cost)} cr)`, { tone: 'success' });
    setTitle(''); setDetail(''); setOpen(false);
  };
  if (!open) return html`<button class="pl-add" onClick=${() => setOpen(true)}><${Icon} name="plus" size=${15} />Add a promise</button>`;
  return html`<div class="pl-add-form card">
    <${Input} value=${title} onValue=${setTitle} placeholder="e.g. Email me a pipeline summary every Friday" autofocus onKeyDown=${(e) => { if (e.key === 'Enter') add(); if (e.key === 'Escape') setOpen(false); }} />
    <${Input} value=${detail} onValue=${setDetail} placeholder="Optional: why it matters, in one sentence" onKeyDown=${(e) => e.key === 'Enter' && add()} />
    <div class="row between wrap gap-8">
      <span class="t-xs t-faint">Architect adds acceptance checks and refines the cost when it builds.</span>
      <div class="row gap-6"><${Button} size="sm" variant="ghost" onClick=${() => setOpen(false)}>Cancel<//><${Button} size="sm" variant="primary" icon="plus" disabled=${!title.trim()} onClick=${add}>Add promise<//></div>
    </div>
  </div>`;
}

function DeferredRow({ project: p, pr }) {
  const [busy, setBusy] = useState(false);
  const include = async () => {
    setBusy(true);
    try { await includePromise(p.id, pr.id); } catch (e) { console.warn(e); }
    // Fall back to a local include if the conversation engine left it deferred.
    const cur = getProject(p.id)?.plan.promises.find((x) => x.id === pr.id);
    if (cur && cur.status === 'deferred') updateProject(p.id, (d) => { const x = d.plan.promises.find((y) => y.id === pr.id); x.status = 'planned'; delete x.deferredReason; });
    setBusy(false);
    toast(`${pr.id} included${pr.cost ? ` — about ${fmtRange(pr.cost)} credits added to the quote` : ''}`, { tone: 'success' });
  };
  return html`<div class="pl-deferred-row">
    <span class="pl-promise__num is-muted">${pr.id}</span>
    <div class="grow">
      <div class="t-md t-medium">${pr.title}</div>
      ${pr.deferredReason ? html`<div class="t-sm t-faint mt-4"><${Icon} name="info" size=${12} /> ${pr.deferredReason}</div>` : null}
    </div>
    ${pr.cost ? html`<span class="pl-cost">${fmtRange(pr.cost)} cr</span>` : null}
    <${Button} size="sm" icon="plus" loading=${busy} onClick=${include}>Include<//>
    <${Menu} items=${[{ label: 'Remove', icon: 'trash', danger: true, onClick: () => removePromise(p, pr) }]} trigger=${(o, t) => html`<${IconButton} icon="more-horizontal" size="sm" label="More" onClick=${t} />`} />
  </div>`;
}

function DeferDialog({ close, pr }) {
  const [reason, setReason] = useState('');
  const QUICK = ['Not needed for the first version', 'Needs a connection first', 'Later phase', 'Too expensive right now'];
  return html`<${Modal} title=${`Defer ${pr.id}?`} subtitle=${pr.title} size="sm" onClose=${() => close(null)}
    footer=${html`<${Button} variant="ghost" onClick=${() => close(null)}>Cancel<//><${Button} variant="primary" onClick=${() => close(reason.trim() || 'Deferred by you')}>Defer<//>`}>
    <div class="col gap-12">
      <p class="t-md t-muted">It stays in the plan under “Deferred” and is left out of the build and the quote. Include it again anytime.</p>
      <${Input} label="Why (optional)" value=${reason} onValue=${setReason} placeholder="e.g. Later phase" />
      <div class="row wrap gap-6">${QUICK.map((q) => html`<button class=${cx('chip chip--sm', reason === q && 'is-active')} onClick=${() => setReason(q)}>${q}</button>`)}</div>
    </div>
  <//>`;
}

function deferPromise(p, pr) {
  openModal(DeferDialog, { pr }, {
    onClose: (reason) => {
      if (!reason) return;
      const prev = { status: pr.status, deferredReason: pr.deferredReason };
      updateProject(p.id, (d) => { const x = d.plan.promises.find((y) => y.id === pr.id); x.status = 'deferred'; x.deferredReason = reason; });
      toast(`${pr.id} deferred — left out of the build`, { action: { label: 'Undo', onClick: () => updateProject(p.id, (d) => { const x = d.plan.promises.find((y) => y.id === pr.id); if (x) Object.assign(x, prev); }) } });
    },
  });
}

async function removePromise(p, pr) {
  const ok = await confirmDialog({ title: `Remove ${pr.id}?`, body: `“${pr.title}” will be removed from the plan. Screens and agents already built stay as they are.`, confirmLabel: 'Remove', danger: true });
  if (!ok) return;
  const idx = p.plan.promises.findIndex((x) => x.id === pr.id);
  updateProject(p.id, (d) => { d.plan.promises = d.plan.promises.filter((x) => x.id !== pr.id); });
  toast(`${pr.id} removed`, { action: { label: 'Undo', onClick: () => updateProject(p.id, (d) => { if (!d.plan.promises.some((x) => x.id === pr.id)) d.plan.promises.splice(Math.max(0, idx), 0, pr); }) } });
}
