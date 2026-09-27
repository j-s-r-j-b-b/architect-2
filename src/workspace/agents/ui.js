// Small shared pieces for the agents area: avatar, badges, section cards, sparkline,
// comparison bars, chip input and the run-trace timeline.
import { html, useState } from '../../lib/html.js';
import { cx } from '../../lib/util.js';
import { Icon, Badge, Button } from '../../ui/index.js';
import { frameworkById } from '../../engine/catalog.js';
import { initialsOf, tierById } from './model.js';

export function AgentAvatar({ agent, size = 'md', class: cls }) {
  return html`<span class=${cx('ag-av', `ag-av--${size}`, agent?.kind === 'manager' && 'ag-av--manager', cls)} style=${{ '--ag-c': agent?.color || 'var(--violet)' }} aria-hidden="true">
    ${initialsOf(agent?.name)}
    ${agent?.kind === 'manager' ? html`<span class="ag-av__mark"><${Icon} name="network" size=${size === 'lg' ? 11 : 9} stroke=${2.4} /></span>` : null}
  </span>`;
}

export function FrameworkBadge({ id, onClick, size }) {
  const fw = frameworkById(id);
  const inner = html`<${Icon} name=${fw.id === 'architect' ? 'sparkles' : 'code'} size=${11} /><span>${fw.id === 'architect' ? 'Architect' : fw.name.replace(' (open spec)', '')}</span>${onClick ? html`<${Icon} name="chevron-down" size=${11} />` : null}`;
  if (onClick) return html`<button type="button" class=${cx('ag-fw', size === 'sm' && 'ag-fw--sm', 'is-button')} onClick=${onClick} data-tip="Change framework">${inner}</button>`;
  return html`<span class=${cx('ag-fw', size === 'sm' && 'ag-fw--sm')}>${inner}</span>`;
}

export function VersionPill({ agent, size }) {
  if (agent?.buildState === 'building') return html`<${Badge} tone="amber" dot live size=${size}>Building<//>`;
  const live = agent?.status === 'live';
  return html`<${Badge} tone=${live ? 'green' : 'outline'} dot=${live} size=${size} tip=${live ? `Version ${agent.version} is live` : `Version ${agent?.version || 1} is a draft — not running for real yet`}>${live ? 'Live' : 'Draft'} v${agent?.version || 1}<//>`;
}

export function TierLabel({ tier }) {
  const t = tierById(tier);
  return html`<span class="ag-tier"><${Icon} name=${t.icon} size=${12} />${t.label}</span>`;
}

export function EvalChip({ score }) {
  if (score == null) return html`<span class="ag-eval is-none" data-tip="Not evaluated yet">—</span>`;
  const pct = Math.round(score * 100);
  const tone = pct >= 85 ? 'green' : pct >= 70 ? 'amber' : 'red';
  return html`<span class=${cx('ag-eval', `is-${tone}`)} data-tip="Evaluation score">${pct}%</span>`;
}

/** Card for one plain-language section of the agent. */
export function Section({ id, icon, title, summary, children, actions, tone, class: cls, hint }) {
  return html`<section class=${cx('ag-sec', tone && `ag-sec--${tone}`, cls)} id=${id ? `ag-sec-${id}` : undefined}>
    <header class="ag-sec__head">
      <span class="ag-sec__icon"><${Icon} name=${icon} size=${15} /></span>
      <div class="grow" style="min-width:0">
        <h3 class="ag-sec__title">${title}</h3>
        ${hint ? html`<div class="ag-sec__hint">${hint}</div>` : null}
      </div>
      ${summary ? html`<span class="ag-sec__summary">${summary}</span>` : null}
      ${actions || null}
    </header>
    <div class="ag-sec__body">${children}</div>
  </section>`;
}

export function Disclosure({ label, children, initial = false, class: cls, icon = 'chevron-right' }) {
  const [open, setOpen] = useState(initial);
  return html`<div class=${cx('ag-disc', open && 'is-open', cls)}>
    <button type="button" class="ag-disc__btn" aria-expanded=${open} onClick=${() => setOpen(!open)}><${Icon} name=${icon} size=${13} class="ag-disc__chev" />${label}</button>
    ${open ? html`<div class="ag-disc__body">${children}</div>` : null}
  </div>`;
}

export function Sparkline({ values = [], w = 120, h = 32, tone = 'violet', bars, class: cls }) {
  if (!values.length) return null;
  const max = Math.max(1, ...values);
  const color = `var(--${tone})`;
  if (bars) {
    const bw = w / values.length;
    return html`<svg class=${cx('ag-spark', cls)} width=${w} height=${h} viewBox=${`0 0 ${w} ${h}`} aria-hidden="true">
      ${values.map((v, i) => html`<rect x=${i * bw + 2} y=${h - Math.max(2, (v / max) * (h - 2))} width=${Math.max(2, bw - 4)} height=${Math.max(2, (v / max) * (h - 2))} rx="2" fill=${color} opacity=${i === values.length - 1 ? 1 : 0.55} />`)}
    </svg>`;
  }
  const pts = values.map((v, i) => [values.length === 1 ? w / 2 : (i / (values.length - 1)) * (w - 4) + 2, h - 3 - (v / max) * (h - 8)]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  return html`<svg class=${cx('ag-spark', cls)} width=${w} height=${h} viewBox=${`0 0 ${w} ${h}`} aria-hidden="true">
    <path d=${`${d} L${pts[pts.length - 1][0]} ${h} L${pts[0][0]} ${h} Z`} fill=${color} opacity="0.1" />
    <path d=${d} fill="none" stroke=${color} stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" />
    <circle cx=${pts[pts.length - 1][0]} cy=${pts[pts.length - 1][1]} r="2.6" fill=${color} />
  </svg>`;
}

/** Two horizontal bars: previous version vs current. values 0..1 */
export function CompareBars({ prev, cur, prevLabel, curLabel }) {
  const pct = (v) => `${Math.round((v || 0) * 100)}%`;
  const delta = prev != null ? Math.round((cur - prev) * 100) : null;
  return html`<div class="ag-cmp">
    ${prev != null ? html`<div class="ag-cmp__row"><span class="ag-cmp__lbl">${prevLabel}</span><span class="ag-cmp__track"><span class="ag-cmp__bar is-prev" style=${{ width: pct(prev) }}></span></span><span class="ag-cmp__val">${pct(prev)}</span></div>` : null}
    <div class="ag-cmp__row"><span class="ag-cmp__lbl t-strong">${curLabel}</span><span class="ag-cmp__track"><span class=${cx('ag-cmp__bar', cur >= 0.85 ? 'is-green' : cur >= 0.7 ? 'is-amber' : 'is-red')} style=${{ width: pct(cur) }}></span></span><span class="ag-cmp__val t-strong">${pct(cur)}${delta != null && delta !== 0 ? html` <span class=${delta > 0 ? 't-green' : 't-red'}>${delta > 0 ? '+' : ''}${delta}</span>` : null}</span></div>
  </div>`;
}

/** Editable list of short text chips (topics). */
export function ChipInput({ values = [], onChange, placeholder = 'Add…', tone }) {
  const [text, setText] = useState('');
  const commit = () => { const v = text.trim(); if (v && !values.includes(v)) onChange([...values, v]); setText(''); };
  return html`<div class=${cx('ag-chips', tone && `ag-chips--${tone}`)}>
    ${values.map((v) => html`<span class="ag-chip">${v}<button type="button" aria-label=${`Remove ${v}`} onClick=${() => onChange(values.filter((x) => x !== v))}><${Icon} name="x" size=${11} /></button></span>`)}
    <input class="ag-chips__input" value=${text} placeholder=${placeholder} onInput=${(e) => setText(e.currentTarget.value)}
      onKeyDown=${(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(); } else if (e.key === 'Backspace' && !text && values.length) onChange(values.slice(0, -1)); }} onBlur=${commit} />
  </div>`;
}

export const TRACE_META = {
  guardrail: { icon: 'shield-check', tone: 'green', label: 'Guardrail' },
  knowledge: { icon: 'book-open', tone: 'blueprint', label: 'Knowledge' },
  tool: { icon: 'plug', tone: 'neutral', label: 'Tool' },
  delegate: { icon: 'network', tone: 'violet', label: 'Delegation' },
  approval: { icon: 'shield-alert', tone: 'amber', label: 'Approval' },
  think: { icon: 'brain', tone: 'violet', label: 'Reasoning' },
  output: { icon: 'check-circle', tone: 'green', label: 'Output' },
  error: { icon: 'alert-circle', tone: 'red', label: 'Error' },
};

/** Run trace timeline. approval: {status:'pending'|'approved'|'denied'} renders inline buttons. */
export function Trace({ steps = [], approval, onApprove, onDeny, compact }) {
  return html`<ol class=${cx('ag-trace', compact && 'ag-trace--compact')}>
    ${steps.map((s, i) => {
      const meta = TRACE_META[s.kind] || TRACE_META.think;
      const pending = s.kind === 'approval' && approval?.status === 'pending';
      return html`<li class=${cx('ag-trace__step', `is-${meta.tone}`, pending && 'is-pending')} key=${i}>
        <span class="ag-trace__dot"><${Icon} name=${meta.icon} size=${12} /></span>
        <div class="ag-trace__main">
          <div class="ag-trace__label"><span>${s.label}</span>${s.ms ? html`<span class="ag-trace__ms">${s.ms >= 1000 ? `${(s.ms / 1000).toFixed(1)}s` : `${s.ms}ms`}</span>` : null}</div>
          ${s.detail ? html`<div class="ag-trace__detail">${s.detail}</div>` : null}
          ${s.kind === 'approval' && approval ? html`<div class="ag-trace__approval">
            ${approval.status === 'pending' ? html`
              ${approval.preview ? html`<div class="ag-trace__preview">${approval.preview}</div>` : null}
              <div class="row gap-6 mt-4"><${Button} size="sm" variant="success" icon="check" onClick=${onApprove}>Approve<//><${Button} size="sm" variant="ghost" icon="x" onClick=${onDeny}>Deny<//></div>`
              : html`<${Badge} size="sm" tone=${approval.status === 'approved' ? 'green' : 'neutral'} icon=${approval.status === 'approved' ? 'check' : 'x'}>${approval.status === 'approved' ? 'Approved by you' : 'Denied — nothing happened'}<//>`}
          </div>` : null}
        </div>
      </li>`;
    })}
  </ol>`;
}

export function Stat({ label, value, sub, icon, tone }) {
  return html`<div class="ag-stat">
    <div class="ag-stat__label">${icon ? html`<${Icon} name=${icon} size=${13} />` : null}${label}</div>
    <div class=${cx('ag-stat__value', tone && `t-${tone}`)}>${value}</div>
    ${sub ? html`<div class="ag-stat__sub">${sub}</div>` : null}
  </div>`;
}
