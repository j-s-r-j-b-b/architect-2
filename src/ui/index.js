// UI kit. Import from here: import { Button, Badge, ... } from '../ui/index.js'
import { html, useState, useEffect, useRef, useCallback } from '../lib/html.js';
import { Link, onNavigate } from '../lib/router.js';
import { cx, initials, colorFor, copyText } from '../lib/util.js';
import { Icon } from './icons.js';

export { Icon, registerIcons } from './icons.js';
export * from './overlays.js';

// ---------------------------------------------------------------------------
// Buttons
// ---------------------------------------------------------------------------
/**
 * <Button variant="primary|ink|secondary|ghost|subtle|danger|success" size="sm|md|lg|xl"
 *   icon="plus" iconRight="arrow-right" loading full href="/x" tip="Tooltip">Label</Button>
 */
export function Button({ variant = 'secondary', size = 'md', icon, iconRight, loading, disabled, href, onClick, class: cls, children, type = 'button', full, tip, tipPos, ...rest }) {
  const classes = cx('btn', `btn--${variant}`, size !== 'md' && `btn--${size}`, full && 'btn--full', cls);
  const iconSize = size === 'sm' ? 14 : size === 'xl' ? 18 : 16;
  const inner = html`
    ${loading ? html`<span class="btn__spinner"></span>` : icon ? html`<${Icon} name=${icon} size=${iconSize} />` : null}
    ${children != null && children !== false ? html`<span>${children}</span>` : null}
    ${iconRight && !loading ? html`<${Icon} name=${iconRight} size=${iconSize} />` : null}`;
  if (href && !disabled) return html`<${Link} href=${href} class=${classes} data-tip=${tip} data-tip-pos=${tipPos} ...${rest}>${inner}<//>`;
  return html`<button type=${type} class=${classes} disabled=${disabled || loading} onClick=${onClick} data-tip=${tip} data-tip-pos=${tipPos} ...${rest}>${inner}</button>`;
}

/** Square icon-only button with a tooltip label. */
export function IconButton({ icon, label, size = 'md', variant = 'ghost', active, onClick, badge, tipPos, disabled, href, iconSize, class: cls, ...rest }) {
  const classes = cx('icon-btn', size !== 'md' && `icon-btn--${size}`, variant === 'bordered' && 'icon-btn--bordered', active && 'is-active', cls);
  const is = iconSize || (size === 'sm' ? 14 : size === 'lg' ? 19 : 16);
  const inner = html`<${Icon} name=${icon} size=${is} />${badge ? html`<span class="icon-btn__badge">${badge > 99 ? '99+' : badge}</span>` : null}`;
  if (href) return html`<${Link} href=${href} class=${classes} aria-label=${label} data-tip=${label} data-tip-pos=${tipPos} ...${rest}>${inner}<//>`;
  return html`<button type="button" class=${classes} onClick=${onClick} disabled=${disabled} aria-label=${label} aria-pressed=${active ? 'true' : undefined} data-tip=${label} data-tip-pos=${tipPos} ...${rest}>${inner}</button>`;
}

// ---------------------------------------------------------------------------
// Form controls
// ---------------------------------------------------------------------------
export function Field({ label, hint, error, children, class: cls, htmlFor, optional }) {
  return html`<div class=${cx('field', cls)}>
    ${label ? html`<label class="field__label" for=${htmlFor}>${label}${optional ? html`<span class="t-faint t-xs" style="font-weight:400">optional</span>` : null}</label>` : null}
    ${children}
    ${error ? html`<div class="field__error">${error}</div>` : hint ? html`<div class="field__hint">${hint}</div>` : null}
  </div>`;
}

/** Text input. Pass value + onInput(e) or onValue(string). */
export function Input({ label, hint, error, icon, suffix, size, class: cls, onValue, onInput, inputRef, optional, ...rest }) {
  const handle = (e) => { onInput && onInput(e); onValue && onValue(e.currentTarget.value); };
  const input = html`<input ref=${inputRef} class=${cx('input', size === 'sm' && 'input--sm', error && 'is-error', !label && cls)} onInput=${handle} ...${rest} />`;
  const control = icon || suffix
    ? html`<div class="input-group">${icon ? html`<span class="input-group__icon"><${Icon} name=${icon} size=${15} /></span>` : null}${input}${suffix ? html`<span class="input-group__suffix">${suffix}</span>` : null}</div>`
    : input;
  if (!label && !hint && !error) return control;
  return html`<${Field} label=${label} hint=${hint} error=${error} class=${cls} optional=${optional}>${control}<//>`;
}

export function Textarea({ label, hint, error, class: cls, onValue, onInput, rows = 3, inputRef, optional, ...rest }) {
  const handle = (e) => { onInput && onInput(e); onValue && onValue(e.currentTarget.value); };
  const ta = html`<textarea ref=${inputRef} class=${cx('textarea', error && 'is-error', !label && cls)} rows=${rows} onInput=${handle} ...${rest}></textarea>`;
  if (!label && !hint && !error) return ta;
  return html`<${Field} label=${label} hint=${hint} error=${error} class=${cls} optional=${optional}>${ta}<//>`;
}

/** options: [{value, label}] or ['a','b'] */
export function Select({ label, hint, options = [], value, onValue, onChange, size, class: cls, placeholder, ...rest }) {
  const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  const handle = (e) => { onChange && onChange(e); onValue && onValue(e.currentTarget.value); };
  const sel = html`<select class=${cx('select', size === 'sm' && 'select--sm', !label && cls)} value=${value} onChange=${handle} ...${rest}>
    ${placeholder ? html`<option value="" disabled selected=${!value}>${placeholder}</option>` : null}
    ${opts.map((o) => html`<option value=${o.value} selected=${o.value === value}>${o.label}</option>`)}
  </select>`;
  if (!label && !hint) return sel;
  return html`<${Field} label=${label} hint=${hint} class=${cls}>${sel}<//>`;
}

export function Checkbox({ checked, onChange, label, class: cls, disabled }) {
  return html`<label class=${cx('checkbox', cls)}>
    <input type="checkbox" checked=${checked} disabled=${disabled} onChange=${(e) => onChange && onChange(e.currentTarget.checked)} />
    ${label ? html`<span>${label}</span>` : null}
  </label>`;
}

/** Toggle switch. tone="green" for "on means live". */
export function Switch({ checked, onChange, label, hint, disabled, tone, class: cls, size }) {
  const toggle = () => !disabled && onChange && onChange(!checked);
  return html`<label class=${cx('switch', checked && 'is-on', disabled && 'is-disabled', tone === 'green' && 'switch--green', cls)} onClick=${(e) => { e.preventDefault(); toggle(); }}>
    <span class="switch__track" role="switch" aria-checked=${checked ? 'true' : 'false'} tabindex="0" onKeyDown=${(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } }}><span class="switch__thumb"></span></span>
    ${label ? html`<span class="col gap-2"><span>${label}</span>${hint ? html`<span class="t-xs t-faint">${hint}</span>` : null}</span>` : null}
  </label>`;
}

/** options: [{value, label, icon}] */
export function Segmented({ options, value, onChange, size, full, class: cls }) {
  return html`<div class=${cx('segmented', size === 'sm' && 'segmented--sm', full && 'segmented--full', cls)} role="tablist">
    ${options.map((o) => html`<button type="button" role="tab" aria-selected=${o.value === value} class=${cx('segmented__opt', o.value === value && 'is-active')} onClick=${() => onChange && onChange(o.value)} data-tip=${o.tip}>
      ${o.icon ? html`<${Icon} name=${o.icon} size=${size === 'sm' ? 12 : 14} />` : null}${o.label ? html`<span>${o.label}</span>` : null}
    </button>`)}
  </div>`;
}

export function Slider({ min = 0, max = 100, step = 1, value, onChange, class: cls, ...rest }) {
  return html`<input type="range" class=${cx('slider', cls)} min=${min} max=${max} step=${step} value=${value} onInput=${(e) => onChange && onChange(Number(e.currentTarget.value))} ...${rest} />`;
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------
/** tabs: [{id, label, icon, count, href, hidden}] — uses links when href is given. */
export function Tabs({ tabs, value, onChange, variant = 'line', class: cls, right }) {
  return html`<div class=${cx('tabs', variant === 'pill' && 'tabs--pill', cls)} role="tablist">
    ${tabs.filter((t) => !t.hidden).map((t) => {
      const inner = html`${t.icon ? html`<${Icon} name=${t.icon} size=${15} />` : null}<span>${t.label}</span>${t.count != null ? html`<span class="tab__count">${t.count}</span>` : null}${t.dot ? html`<span class=${cx('dot', `dot--${t.dot}`)} style="width:6px;height:6px"></span>` : null}`;
      const c = cx('tab', t.id === value && 'is-active');
      return t.href
        ? html`<a href=${t.href} class=${c} role="tab" aria-selected=${t.id === value}>${inner}</a>`
        : html`<button type="button" class=${c} role="tab" aria-selected=${t.id === value} onClick=${() => onChange && onChange(t.id)}>${inner}</button>`;
    })}
    ${right ? html`<div style="margin-left:auto" class="row">${right}</div>` : null}
  </div>`;
}

// ---------------------------------------------------------------------------
// Badges & status
// ---------------------------------------------------------------------------
/** tone: neutral | blueprint | amber | green | red | violet | ink | outline */
export function Badge({ tone = 'neutral', dot, live, icon, size, square, children, class: cls, tip }) {
  return html`<span class=${cx('badge', tone !== 'neutral' && `badge--${tone}`, size && `badge--${size}`, square && 'badge--square', cls)} data-tip=${tip}>
    ${dot ? html`<span class=${cx('badge__dot', live && 'is-live')}></span>` : null}
    ${icon ? html`<${Icon} name=${icon} size=${size === 'sm' ? 10 : 12} stroke=${2.4} />` : null}
    ${children}
  </span>`;
}

/**
 * Lifecycle status → consistent colour + label everywhere.
 * planned · building · verified · live · deferred · failed · draft · ready · sample · connected · needed · paused · queued
 */
export const STATUS = {
  planned: { tone: 'blueprint', label: 'Planned', icon: 'circle-dashed' },
  building: { tone: 'amber', label: 'Building', dot: true, live: true },
  queued: { tone: 'neutral', label: 'Queued', icon: 'clock' },
  verified: { tone: 'green', label: 'Verified', icon: 'check' },
  live: { tone: 'green', label: 'Live', dot: true, live: true },
  deferred: { tone: 'neutral', label: 'Deferred', icon: 'minus' },
  failed: { tone: 'red', label: 'Needs attention', icon: 'alert-circle' },
  draft: { tone: 'outline', label: 'Draft' },
  planning: { tone: 'blueprint', label: 'Planning', dot: true },
  ready: { tone: 'blueprint', label: 'Plan ready', icon: 'check' },
  built: { tone: 'green', label: 'Built', icon: 'check' },
  sample: { tone: 'amber', label: 'Sample data', icon: 'flask' },
  test: { tone: 'violet', label: 'Test data', icon: 'flask' },
  real: { tone: 'green', label: 'Live data', dot: true },
  connected: { tone: 'green', label: 'Connected', dot: true },
  needed: { tone: 'amber', label: 'Not connected', icon: 'plug' },
  paused: { tone: 'neutral', label: 'Paused', icon: 'pause' },
  stopped: { tone: 'neutral', label: 'Stopped', icon: 'stop' },
  running: { tone: 'amber', label: 'Running', dot: true, live: true },
  passed: { tone: 'green', label: 'Passed', icon: 'check' },
  error: { tone: 'red', label: 'Error', icon: 'alert-circle' },
};
export function StatusPill({ status, label, size, class: cls }) {
  const s = STATUS[status] || { tone: 'neutral', label: status };
  return html`<${Badge} tone=${s.tone} dot=${s.dot} live=${s.live} icon=${s.icon} size=${size} class=${cls}>${label || s.label}<//>`;
}

export function Dot({ tone, pulse, class: cls }) {
  return html`<span class=${cx('dot', tone && `dot--${tone}`, pulse && 'dot--pulse', cls)}></span>`;
}

// ---------------------------------------------------------------------------
// Surfaces
// ---------------------------------------------------------------------------
export function Card({ children, class: cls, padded, hover, flat, sunken, onClick, title, icon, actions, footer, style }) {
  const header = title ? html`<div class="card__header"><div class="card__title">${icon ? html`<${Icon} name=${icon} size=${16} />` : null}${title}</div>${actions ? html`<div class="row gap-6">${actions}</div>` : null}</div>` : null;
  return html`<div class=${cx('card', padded && !title && 'card--padded', hover && 'card--hover', flat && 'card--flat', sunken && 'card--sunken', cls)} onClick=${onClick} style=${style}>
    ${header}${title ? html`<div class="card__body">${children}</div>` : children}${footer ? html`<div class="card__footer">${footer}</div>` : null}
  </div>`;
}

export function PageHeader({ title, subtitle, actions, crumb, class: cls }) {
  return html`<div class=${cx('page-header', cls)}>
    <div class="grow">
      ${crumb ? html`<div class="page-header__crumb">${crumb}</div>` : null}
      <h1 class="page-header__title">${title}</h1>
      ${subtitle ? html`<p class="page-header__subtitle">${subtitle}</p>` : null}
    </div>
    ${actions ? html`<div class="row gap-8 wrap">${actions}</div>` : null}
  </div>`;
}

export function Avatar({ name = '', src, size, square, class: cls, tip }) {
  return html`<span class=${cx('avatar', size && `avatar--${size}`, square && 'avatar--square', cls)} style=${{ background: src ? 'var(--bg-sunken)' : colorFor(name) }} data-tip=${tip}>
    ${src ? html`<img src=${src} alt="" referrerpolicy="no-referrer" />` : initials(name)}
  </span>`;
}
export function AvatarStack({ people = [], max = 4, size = 'sm' }) {
  const shown = people.slice(0, max);
  return html`<span class="avatar-stack">
    ${shown.map((p) => html`<${Avatar} name=${p.name} src=${p.photo} size=${size} tip=${p.name} />`)}
    ${people.length > max ? html`<span class=${cx('avatar', `avatar--${size}`)} style="background:var(--bg-sunken);color:var(--text-2)">+${people.length - max}</span>` : null}
  </span>`;
}

export function Progress({ value = 0, tone, thin, class: cls }) {
  return html`<div class=${cx('progress', tone && `progress--${tone}`, thin && 'progress--thin', cls)}><div class="progress__bar" style=${{ width: `${Math.max(0, Math.min(100, value))}%` }}></div></div>`;
}

/** Circular progress. value 0..100 */
export function Ring({ value = 0, size = 44, stroke = 4, tone = 'blueprint', label, class: cls }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const color = { blueprint: 'var(--blueprint)', green: 'var(--green)', amber: 'var(--amber)', red: 'var(--red)', violet: 'var(--violet)' }[tone] || tone;
  return html`<span class=${cx('ring', cls)} style=${{ width: size + 'px', height: size + 'px' }}>
    <svg width=${size} height=${size} style="transform:rotate(-90deg)">
      <circle cx=${size / 2} cy=${size / 2} r=${r} fill="none" stroke="var(--bg-sunken)" stroke-width=${stroke} />
      <circle cx=${size / 2} cy=${size / 2} r=${r} fill="none" stroke=${color} stroke-width=${stroke} stroke-linecap="round" stroke-dasharray=${c} stroke-dashoffset=${c * (1 - Math.max(0, Math.min(100, value)) / 100)} style="transition:stroke-dashoffset .5s var(--ease)" />
    </svg>
    ${label != null ? html`<span class="ring__label">${label}</span>` : null}
  </span>`;
}

export function Skeleton({ w = '100%', h = 14, r, class: cls, style }) {
  return html`<div class=${cx('skeleton', cls)} style=${{ width: typeof w === 'number' ? w + 'px' : w, height: typeof h === 'number' ? h + 'px' : h, borderRadius: r, ...(style || {}) }}></div>`;
}
export function Spinner({ size, tone }) { return html`<span class=${cx('spinner', size === 'sm' && 'spinner--sm', tone === 'amber' && 'spinner--amber')}></span>`; }
export function Kbd({ children }) { return html`<kbd class="kbd">${children}</kbd>`; }

export function Empty({ icon = 'sparkles', title, body, action, class: cls }) {
  return html`<div class=${cx('empty', cls)}>
    <div class="empty__icon"><${Icon} name=${icon} size=${20} /></div>
    ${title ? html`<div class="empty__title">${title}</div>` : null}
    ${body ? html`<div class="empty__body">${body}</div>` : null}
    ${action ? html`<div class="mt-8">${action}</div>` : null}
  </div>`;
}

export function Callout({ tone, icon, children, class: cls, action }) {
  return html`<div class=${cx('callout', tone && `callout--${tone}`, cls)}>
    ${icon ? html`<${Icon} name=${icon} size=${16} class="shrink-0" style="margin-top:2px" />` : null}
    <div class="grow">${children}</div>
    ${action || null}
  </div>`;
}

export function Logo({ size = 24, tag = true, href = '/', class: cls }) {
  const mark = html`<svg width=${size} height=${size} viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="7" fill="var(--blueprint)"/><path d="M7 17.5 12 6l5 11.5" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.2 13.2h5.6" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>`;
  const inner = html`${mark}<span>Architect</span>${tag ? html`<span class="logo__tag">2.0</span>` : null}`;
  return href ? html`<a href=${href} class=${cx('logo', cls)} aria-label="Architect home">${inner}</a>` : html`<span class=${cx('logo', cls)}>${inner}</span>`;
}

// ---------------------------------------------------------------------------
// Code
// ---------------------------------------------------------------------------
const KW = /\b(import|from|export|default|const|let|var|function|return|async|await|if|else|for|while|class|new|def|with|as|in|not|and|or|None|True|False|null|true|false|type|interface|extends|yield|lambda|try|except|catch|finally|raise|throw)\b/g;
function escapeHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
/** Very small syntax highlighter (JS/TS/Python/YAML/JSON/shell) — good enough for previews. */
export function highlight(code = '', lang = 'js') {
  const lines = String(code).split('\n');
  return lines.map((line) => {
    let s = escapeHtml(line);
    const commentRe = lang === 'py' || lang === 'yaml' || lang === 'sh' || lang === 'python' || lang === 'toml' ? /(#.*)$/ : /(\/\/.*)$/;
    let comment = '';
    const m = s.match(commentRe);
    if (m && !/["'`]/.test(s.slice(0, m.index).replace(/"[^"]*"|'[^']*'|`[^`]*`/g, ''))) { comment = m[1]; s = s.slice(0, m.index); }
    s = s.replace(/("[^"]*"|'[^']*'|`[^`]*`)/g, '<span class="tok-s">$1</span>');
    s = s.replace(/(?<![\w-])(\d+(\.\d+)?)(?![\w-])/g, '<span class="tok-n">$1</span>');
    if (lang === 'yaml') s = s.replace(/^(\s*-?\s*)([\w.-]+)(:)/, '$1<span class="tok-f">$2</span>$3');
    else s = s.replace(KW, '<span class="tok-k">$1</span>').replace(/(\w+)(?=\()/g, '<span class="tok-f">$1</span>');
    return s + (comment ? `<span class="tok-c">${comment}</span>` : '');
  }).join('\n');
}
export function CodeBlock({ code = '', lang = 'js', title, copy = true, maxHeight, class: cls }) {
  return html`<div class=${cx('codeblock', cls)}>
    ${title || copy ? html`<div class="codeblock__head"><span>${title || lang}</span>${copy ? html`<${CopyButton} text=${code} dark />` : null}</div>` : null}
    <pre style=${maxHeight ? { maxHeight: typeof maxHeight === 'number' ? maxHeight + 'px' : maxHeight } : null}><code dangerouslySetInnerHTML=${{ __html: highlight(code, lang) }}></code></pre>
  </div>`;
}
export function CopyButton({ text, label = 'Copy', size = 'sm', dark }) {
  const [done, setDone] = useState(false);
  return html`<${IconButton} size=${size} icon=${done ? 'check' : 'copy'} label=${done ? 'Copied' : label} onClick=${async (e) => { e.stopPropagation(); if (await copyText(typeof text === 'function' ? text() : text)) { setDone(true); setTimeout(() => setDone(false), 1400); } }} />`;
}

// ---------------------------------------------------------------------------
// Dropdown menu & popover
// ---------------------------------------------------------------------------
function useDismiss(open, setOpen, ref) {
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const off = onNavigate(() => setOpen(false));
    setTimeout(() => document.addEventListener('mousedown', onDoc), 0);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); off(); };
  }, [open]);
}

/**
 * <Popover trigger=${(open, toggle) => html`<button onClick=${toggle}>…</button>`} align="bottom-start">content</Popover>
 * children may be a function (close) => vnode.
 */
export function Popover({ trigger, children, align = 'bottom-start', class: cls, width, open: controlled, onOpenChange }) {
  const [openState, setOpenState] = useState(false);
  const open = controlled !== undefined ? controlled : openState;
  const setOpen = (v) => { setOpenState(v); onOpenChange && onOpenChange(v); };
  const ref = useRef(null);
  useDismiss(open, setOpen, ref);
  const toggle = (e) => { e && e.stopPropagation && e.stopPropagation(); setOpen(!open); };
  const close = () => setOpen(false);
  return html`<span class="popover-anchor" ref=${ref}>
    ${typeof trigger === 'function' ? trigger(open, toggle) : html`<span onClick=${toggle}>${trigger}</span>`}
    ${open ? html`<div class=${cx('popover', `popover--${align}`, cls)} style=${width ? { width: typeof width === 'number' ? width + 'px' : width } : null} onClick=${(e) => e.stopPropagation()}>${typeof children === 'function' ? children(close) : children}</div>` : null}
  </span>`;
}

/**
 * items: [{label, icon, onClick, href, hint, desc, danger, active, disabled} | {divider:true} | {section:'Label'}]
 */
export function Menu({ trigger, items = [], align = 'bottom-end', width = 220, class: cls }) {
  return html`<${Popover} trigger=${trigger} align=${align} width=${width} class=${cls}>
    ${(close) => items.filter(Boolean).map((it) => {
      if (it.divider) return html`<div class="menu__divider"></div>`;
      if (it.section) return html`<div class="menu__label">${it.section}</div>`;
      const c = cx('menu__item', it.danger && 'is-danger', it.active && 'is-active');
      const inner = html`${it.icon ? html`<${Icon} name=${it.icon} size=${15} />` : null}<span class="grow">${it.label}${it.desc ? html`<span class="menu__desc">${it.desc}</span>` : null}</span>${it.active ? html`<${Icon} name="check" size=${14} />` : it.hint ? html`<span class="menu__hint">${it.hint}</span>` : null}`;
      if (it.href) return html`<a href=${it.href} class=${c} onClick=${close} target=${it.external ? '_blank' : undefined} rel=${it.external ? 'noopener' : undefined}>${inner}</a>`;
      return html`<button type="button" class=${c} disabled=${it.disabled} onClick=${() => { close(); it.onClick && it.onClick(); }}>${inner}</button>`;
    })}
  <//>`;
}

/** Keyboard shortcut hook: useHotkey('mod+k', handler) */
export function useHotkey(combo, handler, deps = []) {
  const cb = useCallback(handler, deps);
  useEffect(() => {
    const parts = combo.toLowerCase().split('+');
    const key = parts.pop();
    const needMod = parts.includes('mod'), needShift = parts.includes('shift'), needAlt = parts.includes('alt');
    const onKey = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (needMod !== mod || needShift !== e.shiftKey || needAlt !== e.altKey) return;
      if (e.key.toLowerCase() !== key) return;
      const tag = (e.target.tagName || '').toLowerCase();
      if (!needMod && (tag === 'input' || tag === 'textarea' || e.target.isContentEditable)) return;
      e.preventDefault(); cb(e);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [combo, cb]);
}
