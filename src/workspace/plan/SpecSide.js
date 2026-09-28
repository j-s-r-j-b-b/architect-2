// Plan › Spec right column: Quote card, Decisions, Open questions.
import { html, useState, useMemo } from '../../lib/html.js';
import { updateProject, wallet } from '../../lib/store.js';
import { navigate } from '../../lib/router.js';
import { cx, fmtRange, fmtNumber, timeAgo } from '../../lib/util.js';
import { Button, IconButton, Input, Segmented, Slider, Badge, Icon, Progress, toast, Callout } from '../../ui/index.js';
import { requireAuth } from '../../shells/Auth.js';
import { approveQuote, answerQuestions } from '../../engine/conversation.js';
import { estimateQuote } from '../../engine/quote.js';
import { MODEL_TIERS } from '../../engine/catalog.js';
import { askArchitect } from '../bus.js';
import { quoteFor, draftCap, setDraftCap, draftTier, setDraftTier } from '../cards/PlanCards.js';

// ---------------------------------------------------------------------------
// Quote
// ---------------------------------------------------------------------------
export function QuoteCard({ project: p }) {
  const building = p.status === 'building' || p.build?.status === 'running' || p.build?.status === 'paused';
  const built = ['built', 'live'].includes(p.status);
  if (!p.plan?.quote && !built && !building) {
    return html`<div class="card pl-quote pl-quote--empty">
      <div class="pl-side-title"><${Icon} name="receipt" size=${15} />Quote</div>
      <p class="t-sm t-muted mt-8">Your itemised price appears here once the plan is ready. Planning and quotes are always free.</p>
    </div>`;
  }
  if (building) return html`<${QuoteBuilding} project=${p} />`;
  if (built) return html`<${QuoteBuilt} project=${p} />`;
  return html`<${QuoteOpen} project=${p} />`;
}

function QuoteOpen({ project: p }) {
  // Tier + cap are shared with the chat Quote card (same numbers in both places).
  const tier = draftTier(p);
  const q = useMemo(() => quoteFor(p, tier) || p.plan.quote, [p.plan.quote, tier]);
  const credits = q.credits || [0, 0];
  const minutes = q.minutes || [0, 0];
  const [busy, setBusy] = useState(false);
  const balance = wallet.value.balance;
  const capMin = Math.max(5, Math.floor(credits[0] * 0.6));
  const capMax = Math.max(capMin + 10, Math.ceil((credits[1] * 2.5) / 5) * 5);
  const cap = Math.min(capMax, Math.max(capMin, draftCap(p, q)));
  const setCap = (v) => setDraftCap(p.id, v);
  const mid = Math.round((credits[0] + credits[1]) / 2);
  const tierInfo = MODEL_TIERS.find((t) => t.id === tier);
  const changeTier = (v) => setDraftTier(p.id, v);
  const build = async () => {
    const ok = await requireAuth({ reason: 'Sign in to build your app', projectId: p.id });
    if (!ok) return;
    setBusy(true);
    try {
      await approveQuote(p.id, { cap, modelTier: tier });
      toast('Plan approved — watch it build', { tone: 'success' });
      navigate(`/p/${p.id}/app`);
    } catch (e) {
      console.error(e); toast('Could not start the build. Nothing was charged.', { tone: 'error' });
    } finally { setBusy(false); }
  };
  return html`<div class="card pl-quote">
    <div class="row between">
      <div class="pl-side-title"><${Icon} name="receipt" size=${15} />Quote</div>
      <${Badge} tone="blueprint" size="sm">Not charged yet<//>
    </div>
    <div class="pl-quote__total">
      <div><span class="pl-quote__big">${fmtRange(credits)}</span><span class="t-sm t-muted"> credits</span></div>
      <div class="t-sm t-muted"><${Icon} name="clock" size=${13} /> ${fmtRange(minutes)} min build</div>
    </div>
    ${q.lines?.length ? html`<ul class="pl-quote__lines">
      ${q.lines.map((l) => html`<li><span class="grow">${l.label}</span><span class="t-tabular">${fmtRange(l.credits)}</span></li>`)}
    </ul>` : null}
    <div class="pl-quote__group">
      <div class="pl-label">Model tier</div>
      <${Segmented} full size="sm" value=${tier} onChange=${changeTier} options=${MODEL_TIERS.map((t) => ({ value: t.id, label: t.label, icon: t.icon }))} />
      <div class="t-xs t-faint mt-4">${tierInfo?.desc}</div>
    </div>
    <div class="pl-quote__group">
      <div class="row between"><span class="pl-label">Budget cap</span><span class="t-sm t-strong t-tabular">${cap} cr</span></div>
      <${Slider} min=${capMin} max=${capMax} value=${cap} onChange=${setCap} aria-label="Budget cap in credits" />
      <div class="t-xs t-faint">${cap < credits[1]
        ? html`<span class="t-amber">Below the top of the range — the build may pause and ask before finishing.</span>`
        : `Architect pauses and asks at 80% (${Math.round(cap * 0.8)} cr). It never spends past ${cap} cr without you.`}</div>
    </div>
    ${balance < credits[1] ? html`<${Callout} tone="amber" icon="wallet" class="mt-12">You have ${fmtNumber(balance)} credits. <a class="link" href="/billing">Top up</a> or pick <b>Fast</b> to fit the budget.<//>` : null}
    <${Button} variant="primary" size="lg" full class="mt-16" icon="play" loading=${busy} onClick=${build}>Build it · ≈${mid} cr<//>
    <p class="t-xs t-faint mt-8 t-center">Charged on actual usage, within the range. Fixes for anything Architect breaks are free.</p>
  </div>`;
}

function QuoteBuilding({ project: p }) {
  const b = p.build || {};
  const steps = b.steps || [];
  const done = steps.filter((s) => s.status === 'done').length;
  const pct = steps.length ? (done / steps.length) * 100 : 8;
  const paused = b.status === 'paused';
  return html`<div class="card pl-quote pl-quote--building">
    <div class="row between">
      <div class="pl-side-title"><${Icon} name="receipt" size=${15} />Quote approved</div>
      <${Badge} tone="amber" dot live=${!paused}>${paused ? 'Paused' : 'Building'}<//>
    </div>
    <div class="t-md mt-12">${b.label || 'Building your app'}</div>
    <${Progress} value=${pct} tone="amber" class="mt-8" />
    <div class="row between t-xs t-faint mt-4"><span>${steps.length ? `${done} of ${steps.length} steps` : 'Starting…'}</span><span>${b.credits != null ? `${fmtNumber(b.credits)} cr used` : ''}${b.cap ? ` · cap ${b.cap}` : ''}</span></div>
    <${Button} full class="mt-16" icon="eye" onClick=${() => navigate(`/p/${p.id}/app`)}>Watch it build<//>
  </div>`;
}

function QuoteBuilt({ project: p }) {
  const run = (p.runs || []).find((r) => r.kind === 'build');
  const q = p.plan?.quote;
  const pending = (p.plan?.promises || []).filter((x) => x.status === 'planned');
  const extra = pending.reduce((a, x) => [a[0] + (x.cost?.[0] || 1), a[1] + (x.cost?.[1] || 3)], [0, 0]);
  return html`<div class="card pl-quote pl-quote--built">
    <div class="row between">
      <div class="pl-side-title"><${Icon} name="receipt" size=${15} />Receipt</div>
      <${Badge} tone="green" icon="check">${p.status === 'live' ? 'Live' : 'Built'}<//>
    </div>
    ${run ? html`<div class="pl-quote__total">
      <div><span class="pl-quote__big">${fmtNumber(run.credits)}</span><span class="t-sm t-muted"> credits</span></div>
      <div class="t-sm t-muted">quoted ${fmtRange(run.quoted || q?.credits || [0, 0])} · ${run.minutes} min</div>
    </div>
    <ul class="pl-quote__lines">
      <li><span class="grow">Promises verified</span><span>${run.promises?.verified}/${run.promises?.total}</span></li>
      <li><span class="grow">Free fixes</span><span>${run.freeFixes || 0}</span></li>
      <li><span class="grow">Finished</span><span>${timeAgo(run.endedAt)}</span></li>
    </ul>` : html`<p class="t-sm t-muted mt-8">This app is built. Every change from here is quoted as a small edit before it runs.</p>`}
    ${pending.length ? html`<div class="pl-quote__pending">
      <div class="t-sm t-strong">${pending.length} new ${pending.length === 1 ? 'promise' : 'promises'} not built yet</div>
      <div class="t-xs t-muted mt-4">${pending.map((x) => x.id).join(', ')} · about ${fmtRange(extra)} credits</div>
      <${Button} size="sm" variant="primary" class="mt-8" icon="play" onClick=${() => askArchitect(`Build the new ${pending.length === 1 ? 'promise' : 'promises'}: ${pending.map((x) => `${x.id} “${x.title}”`).join('; ')}. Quote it first.`)}>Quote & build changes<//>
    </div>` : null}
  </div>`;
}

// ---------------------------------------------------------------------------
// Decisions
// ---------------------------------------------------------------------------
export function DecisionsCard({ project: p }) {
  const list = p.plan?.decisions || [];
  const [edit, setEdit] = useState(null); // index | 'new'
  const [q, setQ] = useState('');
  const [a, setA] = useState('');
  const start = (i) => { setEdit(i); setQ(i === 'new' ? '' : list[i].q); setA(i === 'new' ? '' : list[i].a); };
  const save = () => {
    if (!q.trim() || !a.trim()) { toast('Add both the topic and the decision', { tone: 'warn' }); return; }
    const changed = edit !== 'new' && list[edit] && list[edit].a !== a.trim();
    updateProject(p.id, (d) => {
      d.plan.decisions = d.plan.decisions || [];
      if (edit === 'new') d.plan.decisions.push({ q: q.trim(), a: a.trim() });
      else d.plan.decisions[edit] = { q: q.trim(), a: a.trim() };
    });
    setEdit(null);
    if (changed && p.status !== 'draft') {
      toast('Decision updated', { tone: 'success', action: { label: 'Update the plan', onClick: () => askArchitect(`I changed a decision — ${q.trim()}: ${a.trim()}. Update the plan and quote to match.`) } });
    } else toast('Decision saved', { tone: 'success' });
  };
  const remove = (i) => { updateProject(p.id, (d) => { d.plan.decisions.splice(i, 1); }); setEdit(null); };
  const editor = html`<div class="pl-dec-edit">
    <${Input} size="sm" value=${q} onValue=${setQ} placeholder="Topic, e.g. Who can sign in" autofocus />
    <${Input} size="sm" value=${a} onValue=${setA} placeholder="Decision" onKeyDown=${(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEdit(null); }} />
    <div class="row gap-6">
      <${Button} size="sm" variant="primary" onClick=${save}>Save<//>
      <${Button} size="sm" variant="ghost" onClick=${() => setEdit(null)}>Cancel<//>
      ${edit !== 'new' ? html`<${IconButton} size="sm" icon="trash" label="Remove decision" onClick=${() => remove(edit)} />` : null}
    </div>
  </div>`;
  return html`<div class="card pl-side-card">
    <div class="row between">
      <div class="pl-side-title"><${Icon} name="flag" size=${15} />Decisions</div>
      <${IconButton} size="sm" icon="plus" label="Add a decision" onClick=${() => start('new')} />
    </div>
    ${!list.length && edit !== 'new' ? html`<p class="t-sm t-faint mt-8">Choices you make while planning are recorded here, so nobody has to remember them.</p>` : null}
    <dl class="pl-decisions">
      ${list.map((d, i) => (list.findIndex((x) => x.q === d.q && x.a === d.a) !== i ? null : edit === i ? editor : html`<div class="pl-dec" key=${i}>
        <dt>${d.q}</dt><dd>${d.a}</dd>
        <${IconButton} size="sm" icon="pencil" label="Edit decision" class="pl-dec__edit" onClick=${() => start(i)} />
      </div>`))}
      ${edit === 'new' ? editor : null}
    </dl>
  </div>`;
}

// ---------------------------------------------------------------------------
// Open questions (planning)
// ---------------------------------------------------------------------------
export function QuestionsCard({ project: p }) {
  const qs = p.questions || [];
  const [answers, setAnswers] = useState(() => {
    const init = { ...(p.answers || {}) };
    for (const q of qs) if (q.answer != null && init[q.id] == null) init[q.id] = q.answer;
    return init;
  });
  const [other, setOther] = useState({});
  const [busy, setBusy] = useState(false);
  if (!qs.length) return null;
  const answered = qs.filter((q) => has(answers[q.id])).length;
  const pick = (q, v) => {
    if (q.multi) {
      const cur = Array.isArray(answers[q.id]) ? answers[q.id] : [];
      setAnswers({ ...answers, [q.id]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] });
    } else setAnswers({ ...answers, [q.id]: answers[q.id] === v ? undefined : v });
  };
  const submit = async (skipAll) => {
    setBusy(true);
    const final = {};
    for (const q of qs) {
      const o = (other[q.id] || '').trim();
      final[q.id] = !skipAll && has(answers[q.id]) ? answers[q.id] : !skipAll && o ? o : q.options?.[0]?.value;
      if (!skipAll && o && !has(answers[q.id])) final[q.id] = o;
    }
    try { await answerQuestions(p.id, final); toast('Plan drafted — review the promises and the quote', { tone: 'success' }); }
    catch (e) { console.error(e); toast('Could not draft the plan. Try again.', { tone: 'error' }); }
    finally { setBusy(false); }
  };
  return html`<div class="card pl-side-card pl-questions">
    <div class="row between">
      <div class="pl-side-title"><${Icon} name="help" size=${15} />Open questions</div>
      <span class="t-xs t-faint">${answered} of ${qs.length} answered</span>
    </div>
    ${qs.map((q, i) => html`<div class="pl-q" key=${q.id}>
      <div class="pl-q__text"><span class="pl-q__n">${i + 1}</span>${q.text}</div>
      ${q.why ? html`<div class="t-xs t-faint pl-q__why">${q.why}</div>` : null}
      <div class="row wrap gap-6 mt-8">
        ${(q.options || []).map((o) => {
          const on = q.multi ? (answers[q.id] || []).includes?.(o.value) : answers[q.id] === o.value;
          return html`<button class=${cx('chip chip--sm', on && 'is-active')} onClick=${() => pick(q, o.value)} title=${o.hint || ''}>${on ? html`<${Icon} name="check" size=${12} />` : null}${o.label}${o.hint ? html`<span class="pl-q__hint">${o.hint}</span>` : null}</button>`;
        })}
      </div>
      <${Input} size="sm" class="pl-q__other" placeholder="Other…" value=${other[q.id] || ''} onValue=${(v) => setOther({ ...other, [q.id]: v })} />
    </div>`)}
    <div class="row gap-8 mt-12">
      <${Button} variant="ghost" size="sm" onClick=${() => submit(true)} disabled=${busy}>Skip — use defaults<//>
      <${Button} variant="primary" size="sm" class="grow" iconRight="arrow-right" loading=${busy} onClick=${() => submit(false)}>Continue<//>
    </div>
    <p class="t-xs t-faint mt-8">Unanswered questions use the recommended option. You can change any decision later.</p>
  </div>`;
}
const has = (v) => (Array.isArray(v) ? v.length > 0 : v != null && v !== '');
