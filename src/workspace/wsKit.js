// Small workspace-only helpers: lazy modules (so a broken sibling module never takes the
// whole workspace down), a ticking clock, rich text and a few formatters.
import { html, useState, useEffect, useErrorBoundary, signal } from '../lib/html.js';
import { Button, Icon, Skeleton } from '../ui/index.js';

const modCache = new Map();   // loader -> module
const modErrors = new Map();  // loader -> error
export const modTick = signal(0);

/** Load a module once; re-renders subscribers via modTick when it arrives. */
export function useModule(loader) {
  modTick.value; // subscribe
  if (!modCache.has(loader) && !modErrors.has(loader) && !loader._pending) {
    loader._pending = true;
    loader().then((m) => { modCache.set(loader, m); }).catch((e) => { console.error('[workspace] module failed', e); modErrors.set(loader, e); })
      .finally(() => { loader._pending = false; modTick.value++; });
  }
  return { mod: modCache.get(loader) || null, error: modErrors.get(loader) || null };
}
export function retryModule(loader) { modErrors.delete(loader); modCache.delete(loader); modTick.value++; }
/** Imperative variant (for click handlers). */
export async function loadModule(loader) {
  if (modCache.has(loader)) return modCache.get(loader);
  const m = await loader();
  modCache.set(loader, m);
  return m;
}

/** Render a named export of a lazily-loaded module; isolates its errors. */
export function Lazy({ loader, pick = 'default', props = {}, fallback = null, errorFallback }) {
  const { mod, error } = useModule(loader);
  const [renderError, reset] = useErrorBoundary((e) => console.error('[workspace] render failed', e));
  const err = error || renderError;
  if (err) {
    if (errorFallback !== undefined) return errorFallback;
    return html`<div class="ws-lazy-error"><${Icon} name="alert-triangle" size=${14} /><span>Couldn’t load this part.</span><button class="link t-sm" onClick=${() => { reset(); retryModule(loader); }}>Retry</button></div>`;
  }
  if (!mod) return fallback;
  const C = mod[pick];
  if (!C) return fallback;
  return html`<${C} ...${props} />`;
}

/** Re-render every `ms` while `active`. */
export function useTick(active, ms = 1000) {
  const [, force] = useState(0);
  useEffect(() => {
    if (!active) return undefined;
    const t = setInterval(() => force((x) => x + 1), ms);
    return () => clearInterval(t);
  }, [active, ms]);
}

/** m:ss clock. */
export function clock(ms) {
  const s = Math.max(0, Math.round((ms || 0) / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Tiny inline markdown: **bold**, `code`, line breaks. */
export function rich(text = '') {
  const lines = String(text).split('\n');
  return lines.map((line, li) => {
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter((x) => x !== '');
    const nodes = parts.map((part) => {
      if (part.startsWith('**') && part.endsWith('**')) return html`<strong>${part.slice(2, -2)}</strong>`;
      if (part.startsWith('`') && part.endsWith('`')) return html`<code class="ws-code-inline">${part.slice(1, -1)}</code>`;
      return part;
    });
    return li < lines.length - 1 ? html`${nodes}<br />` : nodes;
  });
}

export function TabSkeleton() {
  return html`<div class="ws-tab-skeleton">
    <${Skeleton} w="38%" h=${22} />
    <${Skeleton} w="62%" h=${14} />
    <div class="ws-tab-skeleton__grid">${[0, 1, 2].map(() => html`<${Skeleton} h=${120} r=${12} />`)}</div>
    <${Skeleton} h=${220} r=${12} />
  </div>`;
}

export function ModuleError({ title = 'This part hit a problem', body = 'Your work is saved.', onRetry }) {
  return html`<div class="ws-module-error">
    <div class="ws-module-error__icon"><${Icon} name="alert-triangle" size=${18} /></div>
    <div class="t-strong">${title}</div>
    <div class="t-sm t-muted">${body}</div>
    ${onRetry ? html`<${Button} size="sm" icon="refresh" onClick=${onRetry}>Try again<//>` : null}
  </div>`;
}
