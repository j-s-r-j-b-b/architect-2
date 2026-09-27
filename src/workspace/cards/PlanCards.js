// Planning cards: questions, plan (and plan-mode proposals), scope contract, quote.
import { html, useState, useMemo } from '../../lib/html.js';
import { navigate } from '../../lib/router.js';
import { wallet, session } from '../../lib/store.js';
import { Button, Icon, Badge, Slider, Segmented, StatusPill, toast } from '../../ui/index.js';
import { cx, fmtRange, fmtNumber } from '../../lib/util.js';
import { MODEL_TIERS } from '../../engine/catalog.js';
import { estimateQuote } from '../../engine/quote.js';
import { answerQuestions, recommendedAnswers, includePromise, approveQuote, applyProposal, discardProposal, isPreBuild } from '../../engine/conversation.js';
import { isActive, DEMO_SPEED } from '../../engine/simulate.js';
import { findBlock } from '../../engine/schema.js';
import { requireAuth } from '../../shells/Auth.js';
import { CardFrame, PromiseTag, promiseById, scrollToMessage } from './common.js';
import { rich } from '../wsKit.js';

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------
const labelOf = (q, v) => q.options?.find((o) => o.value === v)?.label || v;
function answerText(q, a) {
  if (a == null || a === '' || (Array.isArray(a) && !a.length)) return 'Recommended';
  return Array.isArray(a) ? a.map((v) => labelOf(q, v)).join(', ') : labelOf(q, a);
}

export function QuestionsCard({ msg, project }) {
  const qs = project.questions || [];
  const answered = !!msg.data?.answered;
  const [ans, setAns] = useState(() => Object.fromEntries(qs.filter((q) => q.answer != null).map((q) => [q.id, q.answer])));
  const [other, setOther] = useState({});
  const [otherOpen, setOtherOpen] = useState({});

  if (answered) {
    return html`<${CardFrame} tone="neutral" icon="list-checks" title=${msg.data?.skipped ? 'Recommended answers' : 'Your answers'} meta=${html`<${Icon} name="check" size=${13} class="t-green" />`} compact>
      ${msg.text && msg.data?.skipped ? html`<p class="ws-card__lead">${msg.text}</p>` : null}
      ${qs.length ? html`<dl class="ws-answers">
        ${qs.map((q) => html`<div class="ws-answers__row"><dt>${q.text}</dt><dd>${answerText(q, project.answers?.[q.id] ?? q.answer)}</dd></div>`)}
      </dl>` : html`<p class="t-sm t-muted">No questions needed — the plan uses sensible defaults.</p>`}
    <//>`;
  }

  const rec = recommendedAnswers(qs);
  const pick = (q, v) => {
    if (q.multi) {
      const cur = Array.isArray(ans[q.id]) ? ans[q.id] : [];
      setAns({ ...ans, [q.id]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] });
    } else setAns({ ...ans, [q.id]: ans[q.id] === v ? undefined : v });
  };
  const done = qs.filter((q) => { const a = ans[q.id]; return (Array.isArray(a) ? a.length : a != null && a !== '') || (other[q.id] || '').trim(); }).length;
  const submit = (useRec) => {
    const out = {};
    for (const q of qs) {
      const o = (other[q.id] || '').trim();
      let a = useRec ? rec[q.id] : ans[q.id];
      if (!useRec && o) a = q.multi ? [...(Array.isArray(a) ? a : []), o] : o;
      if (a == null || (Array.isArray(a) && !a.length)) a = rec[q.id];
      out[q.id] = a;
    }
    answerQuestions(project.id, out);
  };

  return html`<${CardFrame} tone="blueprint" icon="list-checks" title="Quick questions" meta=${html`<span class="t-tabular">${done}/${qs.length}</span>`}
    footer=${html`<button type="button" class="ws-linkbtn" onClick=${() => submit(true)}>Skip — use recommended</button>
      <span class="grow"></span>
      <${Button} variant="primary" size="sm" iconRight="arrow-right" onClick=${() => submit(false)}>Continue<//>`}>
    ${msg.text ? html`<p class="ws-card__lead">${msg.text}</p>` : null}
    <ol class="ws-qs">
      ${qs.map((q, i) => {
        const a = ans[q.id];
        const isOn = (v) => (q.multi ? Array.isArray(a) && a.includes(v) : a === v);
        return html`<li class="ws-q">
          <div class="ws-q__text"><span class="ws-q__n">${i + 1}</span>${q.text}${q.multi ? html`<span class="ws-q__multi">Pick any</span>` : null}</div>
          <div class="ws-q__opts" role=${q.multi ? 'group' : 'radiogroup'}>
            ${(q.options || []).map((o) => html`<button type="button" class=${cx('ws-opt', isOn(o.value) && 'is-on')} aria-pressed=${isOn(o.value)} onClick=${() => pick(q, o.value)} title=${o.hint || ''}>
              ${isOn(o.value) ? html`<${Icon} name="check" size=${12} stroke=${2.6} />` : null}
              <span>${o.label}</span>${rec[q.id] === o.value || (Array.isArray(rec[q.id]) && rec[q.id].includes(o.value)) ? html`<span class="ws-opt__rec" title="Recommended">★</span>` : null}
            </button>`)}
            <button type="button" class=${cx('ws-opt ws-opt--other', (otherOpen[q.id] || other[q.id]) && 'is-on')} onClick=${() => setOtherOpen({ ...otherOpen, [q.id]: !otherOpen[q.id] })}>
              <${Icon} name="pencil" size=${12} /><span>Other</span>
            </button>
          </div>
          ${otherOpen[q.id] ? html`<input class="input input--sm ws-q__other" placeholder="Type your answer…" value=${other[q.id] || ''} onInput=${(e) => setOther({ ...other, [q.id]: e.currentTarget.value })} onKeyDown=${(e) => { if (e.key === 'Enter') submit(false); }} />` : null}
          ${q.why ? html`<div class="ws-q__why"><${Icon} name="info" size=${12} />${q.why}</div>` : null}
        </li>`;
      })}
    </ol>
    <p class="ws-fine">★ recommended · unanswered questions use the recommended option.</p>
  <//>`;
}

// ---------------------------------------------------------------------------
// Plan
// ---------------------------------------------------------------------------
function StatTiles({ items }) {
  return html`<div class="ws-tiles">${items.map(([n, label, icon]) => html`<div class="ws-tile"><${Icon} name=${icon} size=${13} /><b class="t-tabular">${n}</b><span>${label}</span></div>`)}</div>`;
}

export function PlanCard({ msg, project }) {
  if (msg.data?.proposal) return html`<${ProposalCard} msg=${msg} project=${project} />`;
  const ps = project.plan?.promises || [];
  const active = ps.filter((x) => x.status !== 'deferred');
  const quoteMsg = project.chat.find((m) => m.type === 'quote' && m.data?.status === 'open');
  return html`<${CardFrame} tone="blueprint" icon="clipboard-list" title="The plan" meta=${html`<${Badge} size="sm" tone="blueprint">Free<//>`}
    footer=${html`<${Button} size="sm" variant="secondary" icon="clipboard-list" onClick=${() => navigate(`/p/${project.id}/plan`)}>Open plan<//>
      ${quoteMsg ? html`<${Button} size="sm" variant="ghost" iconRight="arrow-down" onClick=${() => scrollToMessage(quoteMsg.id)}>See the quote<//>` : null}`}>
    ${msg.text ? html`<p class="ws-card__lead">${rich(msg.text)}</p>` : null}
    ${project.plan?.summary ? html`<p class="ws-clamp t-sm t-muted">${project.plan.summary}</p>` : null}
    <${StatTiles} items=${[[active.length, active.length === 1 ? 'promise' : 'promises', 'list-checks'], [project.agents.length, 'agents', 'bot'], [project.screens.length, 'screens', 'layout-dashboard'], [project.data.tables.length, 'tables', 'database']]} />
    <ul class="ws-plist">
      ${active.slice(0, 4).map((pr) => html`<li><${PromiseTag} id=${pr.id} status=${pr.status} /><span class="t-truncate">${pr.title}</span></li>`)}
      ${active.length > 4 ? html`<li class="t-faint t-xs">+${active.length - 4} more in the plan</li>` : null}
    </ul>
  <//>`;
}

function ProposalCard({ msg, project }) {
  const pr = msg.data.proposal;
  const st = msg.data.status;
  const touches = (pr.touches || []).map((id) => findBlock(project, id)?.block).filter(Boolean);
  const running = isActive(project);
  return html`<${CardFrame} tone="blueprint" icon="clipboard-list" title="Proposed change"
    meta=${st === 'applied' ? html`<${Badge} tone="green" size="sm" icon="check">Applied<//>` : st === 'discarded' ? html`<${Badge} size="sm">Discarded<//>` : html`<${Badge} size="sm" tone="blueprint">${pr.preBuild || !pr.credits?.[1] ? 'Free' : `≈${fmtRange(pr.credits)} cr`}<//>`}
    footer=${st === 'open' ? html`<button type="button" class="ws-linkbtn" onClick=${() => discardProposal(project.id, msg.id)}>Discard</button><span class="grow"></span>
      <${Button} size="sm" variant="primary" icon="check" onClick=${() => applyProposal(project.id, msg.id)}>${running ? 'Apply after this run' : pr.preBuild || !pr.credits?.[1] ? 'Apply' : `Apply · ≈${fmtRange(pr.credits)} cr`}<//>` : null}>
    <p class="ws-card__lead">${rich(pr.plain || pr.summary || pr.text)}</p>
    ${touches.length ? html`<div class="ws-touches">${touches.slice(0, 5).map((b) => html`<span class="ws-touch"><${Icon} name="blocks" size=${12} />${b.title || b.type}</span>`)}</div>` : null}
    ${pr.technical ? html`<div class="ws-tech t-mono">${pr.technical}</div>` : null}
    <p class="ws-fine">Plan mode: nothing changes until you apply. A checkpoint is saved first.</p>
  <//>`;
}

// ---------------------------------------------------------------------------
// Scope contract
// ---------------------------------------------------------------------------
export function ScopeCard({ msg, project }) {
  const inc = (msg.data?.included || []).map((id) => promiseById(project, id)).filter(Boolean);
  const def = (msg.data?.deferred || []).map((d) => ({ ...d, p: promiseById(project, d.id) })).filter((d) => d.p && d.p.status === 'deferred');
  const now = new Set(msg.data?.includedNow || []);
  const built = !isPreBuild(project);
  return html`<${CardFrame} tone="neutral" icon="shield-check" title="Scope contract" meta=${html`<span class="t-tabular">${inc.length} in · ${def.length} later</span>`}>
    ${msg.text ? html`<p class="ws-card__lead">${msg.text}</p>` : null}
    <ul class="ws-scope">
      ${inc.map((pr) => html`<li class="ws-scope__row">
        <span class="ws-scope__mark is-in"><${Icon} name="check" size=${12} stroke=${2.6} /></span>
        <${PromiseTag} id=${pr.id} status=${pr.status} />
        <span class="grow t-sm">${pr.title}</span>
        ${now.has(pr.id) ? html`<${Badge} size="sm" tone="blueprint">Added<//>` : null}
      </li>`)}
      ${def.map((d) => html`<li class="ws-scope__row is-deferred">
        <span class="ws-scope__mark"><${Icon} name="minus" size=${12} stroke=${2.6} /></span>
        <${PromiseTag} id=${d.id} status="deferred" />
        <span class="grow"><span class="t-sm">${d.p.title}</span><span class="ws-scope__why">${d.reason}</span></span>
        <${Button} size="sm" variant="secondary" icon="plus" onClick=${() => includePromise(project.id, d.id)}>Include (+≈${d.p.cost?.[1] || 4} cr)<//>
      </li>`)}
    </ul>
    ${def.length ? html`<p class="ws-fine">${built ? 'Including it now runs a short build and is charged separately.' : 'Deferred items are not in the quote. Include them now or any time later.'}</p>` : null}
  <//>`;
}

// ---------------------------------------------------------------------------
// Quote
// ---------------------------------------------------------------------------
const tierMult = (id) => MODEL_TIERS.find((t) => t.id === id)?.multiplier || 1;
function scaleRange([a, b], k) { return [Math.max(1, Math.round(a * k)), Math.max(1, Math.round(b * k))]; }

/** Quote for a tier; scales locally if the estimator ignores the tier. */
function quoteFor(project, tier) {
  const base = project.plan?.quote;
  if (!base) return null;
  const baseTier = base.modelTier || 'balanced';
  if (tier === baseTier) return base;
  let q = null;
  try { q = estimateQuote(project, { modelTier: tier }); } catch {}
  if (!q || q === base || (q.credits?.[0] === base.credits?.[0] && q.credits?.[1] === base.credits?.[1])) {
    const k = tierMult(tier) / tierMult(baseTier);
    q = { ...base, modelTier: tier, credits: scaleRange(base.credits, k), lines: (base.lines || []).map((l) => ({ ...l, credits: scaleRange(l.credits, k) })), minutes: tier === 'fast' ? scaleRange(base.minutes || [5, 10], 0.8) : tier === 'best' ? scaleRange(base.minutes || [5, 10], 1.3) : base.minutes };
  }
  return { ...q, modelTier: tier };
}
const defaultCap = (q) => Math.max(q?.cap || 0, Math.ceil(((q?.credits?.[1] || 40) * 1.25) / 5) * 5);

export function QuoteCard({ msg, project }) {
  const base = project.plan?.quote;
  const status = msg.data?.status || 'open';
  const [tier, setTier] = useState(base?.modelTier || project.settings.modelTier || 'balanced');
  const q = useMemo(() => quoteFor(project, tier), [project.plan?.quote, tier]);
  const [cap, setCap] = useState(() => defaultCap(base));
  const [busy, setBusy] = useState(false);
  if (!q) return html`<${CardFrame} tone="neutral" icon="coins" title="Quote"><p class="t-sm t-muted">The quote appears once the plan is ready.</p><//>`;

  if (status !== 'open') {
    const run = (project.runs || []).find((r) => r.kind === 'build' && r.status === 'done');
    return html`<${CardFrame} tone="green" icon="check-circle" title="Quote approved" compact meta=${html`<span class="t-tabular">${fmtRange(q.credits)} cr</span>`}>
      <div class="ws-kv">
        <span>Model</span><b>${MODEL_TIERS.find((t) => t.id === (msg.data?.modelTier || q.modelTier))?.label || 'Balanced'}</b>
        <span>Budget cap</span><b>${msg.data?.cap ?? q.cap ?? project.settings.budgetCap ?? '—'}${(msg.data?.cap ?? q.cap ?? project.settings.budgetCap) ? ' cr' : ''}</b>
        ${run ? html`<span>Spent</span><b class="t-green">${fmtNumber(run.credits)} cr</b>` : null}
      </div>
    <//>`;
  }

  const mid = Math.round((q.credits[0] + q.credits[1]) / 2);
  const bal = wallet.value.balance;
  const short = bal < q.credits[0];
  const tight = !short && bal < q.credits[1];
  const capMin = Math.max(5, Math.floor(q.credits[0] * 0.6));
  const capMax = Math.max(capMin + 10, Math.ceil((q.credits[1] * 2.5) / 5) * 5);
  const c = Math.min(capMax, Math.max(capMin, cap));
  const running = isActive(project);
  const build = async () => {
    setBusy(true);
    try {
      const ok = await requireAuth({ reason: 'Sign in to build your app', projectId: project.id });
      if (!ok) return;
      approveQuote(project.id, { cap: c, modelTier: tier });
      toast('Build started — watch it come together', { tone: 'success' });
    } finally { setBusy(false); }
  };

  return html`<${CardFrame} tone="blueprint" icon="coins" title="Quote" meta=${html`<${Badge} size="sm">Nothing charged yet<//>`} class="ws-quote">
    <div class="ws-quote__total">
      <div><span class="ws-quote__num t-tabular">${fmtRange(q.credits)}</span><span class="ws-quote__unit">credits</span></div>
      <div class="ws-quote__time"><${Icon} name="clock" size=${13} />≈ ${fmtRange(q.minutes || [5, 10])} min for a real build</div>
    </div>
    ${(q.lines || []).length ? html`<ul class="ws-lines">${q.lines.map((l) => html`<li><span class="t-truncate">${l.label}</span><span class="t-tabular t-faint">${fmtRange(l.credits)}</span></li>`)}</ul>` : null}
    <div class="ws-quote__row">
      <span class="ws-quote__label">Model</span>
      <${Segmented} size="sm" value=${tier} onChange=${setTier} options=${MODEL_TIERS.map((t) => ({ value: t.id, label: t.label, icon: t.icon, tip: t.desc }))} />
    </div>
    <div class="ws-quote__cap">
      <div class="row between"><span class="ws-quote__label">Budget cap</span><b class="t-tabular">${c} cr</b></div>
      <${Slider} min=${capMin} max=${capMax} step=${1} value=${c} onChange=${setCap} aria-label="Budget cap in credits" />
      <p class="ws-fine">I pause and ask at 80% (${Math.round(c * 0.8)} cr). Unused credits are never charged.</p>
    </div>
    ${short ? html`<div class="ws-note ws-note--red"><${Icon} name="alert-circle" size=${13} /><span>You have ${fmtNumber(bal)} credits — not enough to start. <a class="link" href="/billing">Top up</a></span></div>`
      : tight ? html`<div class="ws-note ws-note--amber"><${Icon} name="alert-triangle" size=${13} /><span>You have ${fmtNumber(bal)} credits — the build may pause near the end. <a class="link" href="/billing">Top up</a></span></div>`
        : html`<div class="ws-note"><${Icon} name="wallet" size=${13} /><span>${session.value ? `You have ${fmtNumber(bal)} credits.` : 'You’ll sign in first — your plan is saved.'}</span></div>`}
    <div class="ws-note ws-note--demo"><${Icon} name="zap" size=${13} /><span>Demo builds run ${DEMO_SPEED}× faster than a real build.</span></div>
    <${Button} variant="primary" full size="lg" icon="play" loading=${busy} disabled=${short || running} onClick=${build} class="ws-quote__go">Build it · ≈${mid} cr<//>
  <//>`;
}

export { StatusPill };
