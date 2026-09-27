// Renders a project's GENERATED app (the thing users are building) like a real product:
// its own sidebar, top bar and a 12-column grid of blocks, themed by project.theme and
// responsive via container queries on the frame width. Also hosts the builder overlays
// that live *inside* the app: build states, X-ray, select outlines, annotation pins.
import { html, useState, useRef, useEffect, useLayoutEffect, useErrorBoundary } from '../lib/html.js';
import { updateProject, addCheckpoint, logActivity, getProject } from '../lib/store.js';
import { toast } from '../ui/index.js';
import { Icon } from '../ui/icons.js';
import { cx, deepClone } from '../lib/util.js';
import { BLOCK_DEFAULT_SPAN, screenByRoute, findBlock } from '../engine/schema.js';
import { themeStyle } from './theme.js';
import { GxCtx, useGx, blockLabel, metaFor } from './util.js';
import { BLOCKS, UnknownBlock, Wireframe } from './blocks/index.js';
import { GxShell, SignInGate } from './Shell.js';
import { XrayChip, XrayCard } from './xray.js';
import { pushGxEvent } from './runtime.js';

const clampSpan = (n) => Math.max(1, Math.min(12, Math.round(Number(n) || 12)));

function SafeBlock({ block, screen }) {
  const ctx = useGx();
  const [err, reset] = useErrorBoundary((e) => ctx.emit('error', `${blockLabel(block, screen)} crashed: ${e?.message || e}`, { blockId: block.id, file: block.file }));
  if (err) {
    return html`<div class="gx-card gx-crash">
      <${Icon} name="alert-triangle" size=${16} />
      <div class="grow"><strong>${blockLabel(block, screen)} couldn’t render</strong><span>${String(err.message || err)}</span></div>
      <button class="gx-btn gx-btn--secondary gx-btn--sm" onClick=${reset}><span>Retry</span></button>
    </div>`;
  }
  const Comp = BLOCKS[block.type] || UnknownBlock;
  return html`<${Comp} block=${block} screen=${screen} />`;
}

function BlockShell({ block, screen }) {
  const ctx = useGx();
  const ref = useRef(null);
  const state = ctx.mode === 'wireframe' ? 'wire' : block.buildState === 'pending' ? 'pending' : block.buildState === 'drafting' ? 'drafting' : 'done';
  const prev = useRef(state);
  const [reveal, setReveal] = useState(false);
  useEffect(() => {
    const was = prev.current;
    prev.current = state;
    if (state === 'done' && (was === 'drafting' || was === 'pending') && !ctx.isStatic) {
      setReveal(true);
      const t = setTimeout(() => setReveal(false), 900);
      return () => clearTimeout(t);
    }
  }, [state]);

  const span = clampSpan(block.span ?? BLOCK_DEFAULT_SPAN[block.type] ?? 12);
  const label = blockLabel(block, screen);
  const mode = ctx.mode;
  const comments = mode === 'select' ? (ctx.project.comments || []).filter((c) => c.blockId === block.id && !c.resolved).length : 0;
  const pins = mode === 'annotate' ? (ctx.annotations || []).filter((a) => a.blockId === block.id) : [];

  const activate = (clientX, clientY) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (mode === 'select') ctx.onSelect && ctx.onSelect({ blockId: block.id, screenId: screen.id, rect: r, label, el });
    else if (mode === 'annotate') {
      const cxp = clientX == null ? r.left + r.width / 2 : clientX, cyp = clientY == null ? r.top + Math.min(40, r.height / 2) : clientY;
      ctx.onAnnotate && ctx.onAnnotate({ blockId: block.id, screenId: screen.id, label, x: (cxp - r.left) / r.width, y: (cyp - r.top) / r.height, clientX: cxp, clientY: cyp, rect: r });
    } else if (mode === 'xray') ctx.toggleXray(block.id, el);
  };
  const onClickCapture = (e) => {
    if (e.target.closest && e.target.closest('.gx-xcard, .gx-pin')) return;
    e.preventDefault(); e.stopPropagation();
    activate(e.clientX, e.clientY);
  };
  const onKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target === ref.current) { e.preventDefault(); activate(null, null); }
  };

  let body;
  if (state === 'wire' || state === 'pending') body = html`<${Wireframe} block=${block} screen=${screen} state="planned" />`;
  else if (state === 'drafting') body = html`<${Wireframe} block=${block} screen=${screen} state="drafting" />`;
  else body = html`<${SafeBlock} block=${block} screen=${screen} />`;

  const interactive = mode === 'select' || mode === 'annotate' || mode === 'xray';
  return html`<section ref=${ref}
    class=${cx('gx-blk', `gx-s${span}`, `gx-blk--${block.type}`, `is-${state}`, reveal && 'gx-reveal', ctx.selectedId === block.id && 'is-selected', ctx.xrayId === block.id && 'is-xray-open', ctx.flashId === block.id && 'is-flash')}
    data-gx-block=${block.id} data-gx-label=${label}
    tabindex=${interactive ? '0' : undefined}
    onKeyDown=${interactive ? onKeyDown : undefined}
    onClickCapture=${interactive ? onClickCapture : undefined}>
    ${body}
    ${mode === 'xray' ? html`<${XrayChip} block=${block} screen=${screen} state=${state === 'wire' ? 'done' : state} />` : null}
    ${ctx.xrayId === block.id ? html`<${XrayCard} block=${block} screen=${screen} align=${ctx.xrayAlign} onClose=${() => ctx.toggleXray(null)} />` : null}
    ${comments ? html`<span class="gx-cmt" title=${`${comments} open comment${comments > 1 ? 's' : ''}`}><${Icon} name="message-circle" size=${11} />${comments}</span>` : null}
    ${pins.map((a) => html`<span key=${a.id} class=${cx('gx-pin', a.id === ctx.activePin && 'is-active')} style=${{ left: `${a.x * 100}%`, top: `${a.y * 100}%` }} title=${a.note}>${a.n}</span>`)}
  </section>`;
}

/**
 * Renders a project's generated app.
 * @param {{project:object, route?:string, device?:'desktop'|'tablet'|'mobile',
 *   mode?:'interact'|'select'|'edit'|'annotate'|'xray'|'wireframe', selectedId?:string,
 *   onSelect?:(sel:{blockId,screenId,rect,label,el})=>void, onNavigate?:(route)=>void, live?:boolean,
 *   annotations?:{id,n,blockId,x,y,note}[], onAnnotate?:(pt)=>void, activePin?:string,
 *   actAs?:'admin'|'teammate'|'visitor', onActAs?:(role)=>void, static?:boolean, class?:string, style?:object}} props
 */
export function AppRenderer(props) {
  const { project, route, device = 'desktop', mode = 'interact', selectedId, onSelect, onNavigate, live = false, annotations, onAnnotate, activePin, actAs = 'admin', onActAs, class: cls, style } = props;
  const isStatic = !!props.static;
  const [localRoute, setLocalRoute] = useState(null);
  const [role, setRole] = useState(actAs);
  const [xray, setXray] = useState({ id: null, align: 'left' });
  const [note, setNote] = useState(null);
  const [flashId, setFlashId] = useState(null);
  const mainRef = useRef(null);
  const noteTimer = useRef(null);

  useEffect(() => { setRole(actAs); }, [actAs]);
  useEffect(() => { if (mode !== 'xray') setXray({ id: null, align: 'left' }); }, [mode]);
  useEffect(() => () => clearTimeout(noteTimer.current), []);
  useEffect(() => {
    if (!xray.id) return;
    const onKey = (e) => { if (e.key === 'Escape') setXray({ id: null, align: 'left' }); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [xray.id]);

  const screens = project?.screens || [];
  const current = route ?? localRoute;
  const screen = screens.length ? screenByRoute(project, current) : null;
  useLayoutEffect(() => { if (mainRef.current) mainRef.current.scrollTop = 0; }, [screen?.id]);

  const th = themeStyle(project?.theme || {});
  const rootClass = cx('gx', `gx--${mode}`, isStatic && 'gx--static', live && 'gx--live', th.serif && 'gx--serif', th.dark && 'gx--dark', th.compact && 'gx--compact', cls);

  if (!project || !screen) {
    return html`<div class=${rootClass} style=${{ ...th.style, ...(style || {}) }} data-device=${device}>
      <div class="gx-void"><span class="gx-void__icon"><${Icon} name="layout-dashboard" size=${22} /></span><strong>${project?.name || 'This app'} has no screens yet</strong><span>Screens appear here as soon as they’re planned.</span></div>
    </div>`;
  }

  const pid = project.id;
  const canEdit = mode === 'edit' && !live && !isStatic && !!pid && !!getProject(pid);
  const navTo = (r) => {
    if (mode === 'wireframe' || isStatic) return;
    if (onNavigate) onNavigate(r); else setLocalRoute(r);
  };
  const notify = (text, tone = 'info') => {
    if (isStatic) return;
    clearTimeout(noteTimer.current);
    setNote({ text, tone, k: Date.now() });
    noteTimer.current = setTimeout(() => setNote(null), 3400);
  };
  const emit = (level, text, extra) => { if (!live && !isStatic && pid) pushGxEvent(pid, level, text, extra); };
  const saveEdit = (blockId, apply, what = 'text') => {
    if (!canEdit) return;
    const before = findBlock(getProject(pid), blockId);
    if (!before) return;
    const snapshot = deepClone(before.block);
    updateProject(pid, (d) => { const f = findBlock(d, blockId); if (f) apply(f.block); });
    addCheckpoint(pid, { label: 'Edited text', kind: 'edit', summary: `Changed the ${what} of ${blockLabel(before.block, before.screen)}` });
    logActivity(pid, { plain: `Edited the ${what} on ${before.screen.title} directly (free).`, technical: `${before.block.file || before.block.id} · text edit, no credits`, actor: 'You', kind: 'edit' });
    emit('info', `edit ${before.block.file || blockId} · ${what}`);
    toast('Free edit — saved', {
      tone: 'success',
      action: { label: 'Undo', onClick: () => updateProject(pid, (d) => { const f = findBlock(d, blockId); if (f) { const i = f.screen.blocks.findIndex((b) => b.id === blockId); if (i >= 0) f.screen.blocks[i] = snapshot; } }) },
    });
  };
  const scrollToBlock = (id) => {
    const el = mainRef.current?.querySelector(`[data-gx-block="${id}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setFlashId(id);
    setTimeout(() => setFlashId((f) => (f === id ? null : f)), 1200);
    const input = el.querySelector('input, textarea, select');
    if (input) setTimeout(() => input.focus({ preventScroll: true }), 420);
  };
  const toggleXray = (id, el) => {
    if (!id || id === xray.id) { setXray({ id: null, align: 'left' }); return; }
    let align = 'left';
    const main = mainRef.current;
    if (el && main) {
      const r = el.getBoundingClientRect(), m = main.getBoundingClientRect();
      if (r.left - m.left > m.width * 0.45) align = 'right';
    }
    setXray({ id, align });
  };
  const signIn = () => {
    setRole('teammate');
    onActAs && onActAs('teammate');
    notify('Signed in as a teammate — simulated for this prototype', 'success');
  };

  const ctx = {
    project, screen, mode, live, isStatic, device, actAs: role, canEdit,
    selectedId, onSelect, onAnnotate, annotations, activePin,
    xrayId: xray.id, xrayAlign: xray.align, toggleXray, flashId,
    notify, emit, saveEdit, scrollToBlock, navigate: navTo,
  };

  const gated = role === 'visitor' && !!(project.settings?.authRequired || project.authRequired);
  return html`<div class=${rootClass} style=${{ ...th.style, ...(style || {}) }} data-device=${device}>
    <${GxCtx.Provider} value=${ctx}>
      ${gated ? html`<${SignInGate} project=${project} onSignIn=${signIn} />` : html`<${GxShell} project=${project} screen=${screen} onNav=${navTo} onSignIn=${signIn} mainRef=${mainRef}>
        <div class=${cx('gx-grid', !isStatic && 'gx-screen-in')} key=${screen.id}>
          ${screen.blocks.map((b) => html`<${BlockShell} key=${b.id} block=${b} screen=${screen} />`)}
          ${!screen.blocks.length ? html`<div class="gx-void gx-s12"><span class="gx-void__icon"><${Icon} name=${screen.icon || 'layout-dashboard'} size=${20} /></span><strong>${screen.title} is empty</strong><span>Blocks appear here as Architect builds them.</span></div>` : null}
        </div>
      <//>`}
      ${note ? html`<div class=${cx('gx-toast', `is-${note.tone}`)} key=${note.k} role="status"><${Icon} name=${note.tone === 'success' ? 'check-circle' : 'info'} size=${15} /><span>${note.text}</span></div>` : null}
    <//>
  </div>`;
}

/**
 * Cheap static preview of the app's first screen: renders at 1280×800 and CSS-scales to
 * `width` (or the container width). No agents, no animations, not focusable.
 */
export function AppThumbnail({ project, width, class: cls }) {
  const ref = useRef(null);
  const [w, setW] = useState(width || 0);
  useLayoutEffect(() => {
    if (width) { setW(width); return; }
    const el = ref.current;
    if (!el) return;
    setW(el.getBoundingClientRect().width || 0);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  const has = project?.screens?.length && project.screens[0].blocks?.length;
  const boxStyle = width ? { width: `${width}px`, height: `${Math.round(width * 0.625)}px` } : null;
  if (!has) {
    const th = themeStyle(project?.theme || {});
    return html`<div ref=${ref} class=${cx('gx-thumb gx-thumb--empty', cls)} style=${boxStyle} aria-hidden="true">
      <span class="gx-thumb__mark" style=${{ background: th.style['--gx-primary'] }}><${Icon} name=${project?.icon || 'sparkles'} size=${18} /></span>
      <span class="gx-thumb__label">${project?.status === 'planning' || project?.status === 'ready' ? 'Planned — not built yet' : 'Nothing built yet'}</span>
    </div>`;
  }
  const scale = w ? w / 1280 : 0;
  return html`<div ref=${ref} class=${cx('gx-thumb', cls)} style=${boxStyle} aria-hidden="true">
    ${scale ? html`<div class="gx-thumb__inner" style=${{ transform: `scale(${scale})` }} inert>
      <${AppRenderer} project=${project} route=${project.screens[0].route} static />
    </div>` : null}
  </div>`;
}

export { metaFor };
