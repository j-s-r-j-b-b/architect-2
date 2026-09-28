// Floating "Reviewer guide" checklist, mounted on every page (hidden on live apps).
import { html, useState, useEffect, useRef } from '../../lib/html.js';
import { route, navigate } from '../../lib/router.js';
import { Icon, Button } from '../../ui/index.js';
import { cx } from '../../lib/util.js';
import { TOUR_ITEMS, tourState, setTour, runItem } from './items.js';

export default function TourLauncher() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const path = route.value.path;
  const st = tourState.value;
  const inWorkspace = path.startsWith('/p/');
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    setTimeout(() => document.addEventListener('mousedown', onDoc), 0);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);
  if (st.hidden || path.startsWith('/a/') || path === '/tour' || path === '/login' || path === '/signup' || path === '/onboarding') return null;
  const seen = TOUR_ITEMS.filter((i) => st.visited[i.id]).length;
  const total = TOUR_ITEMS.length;
  return html`<div class=${cx('tr-launch', inWorkspace && 'tr-launch--ws')} ref=${ref}>
    ${open ? html`<div class="tr-panel" role="dialog" aria-label="Reviewer guide">
      <div class="tr-panel__head">
        <div class="grow">
          <div class="tr-panel__title">Reviewer guide</div>
          <div class="t-xs t-faint">${seen} of ${total} seen · each step opens in the right state</div>
        </div>
        <button class="icon-btn icon-btn--sm" aria-label="Close" onClick=${() => setOpen(false)}><${Icon} name="x" size=${14} /></button>
      </div>
      <div class="tr-progress"><span style=${{ width: `${(seen / total) * 100}%` }}></span></div>
      <ol class="tr-list">
        ${TOUR_ITEMS.map((it, i) => html`<li class=${cx('tr-item', st.visited[it.id] && 'is-done')}>
          <span class="tr-item__n">${st.visited[it.id] ? html`<${Icon} name="check" size=${12} stroke=${2.8} />` : i + 1}</span>
          <div class="grow" style="min-width:0">
            <div class="tr-item__t">${it.title}</div>
            <div class="tr-item__b">${it.body}</div>
          </div>
          <button class="tr-item__go" onClick=${() => { setOpen(false); runItem(it); }}>Show me<${Icon} name="arrow-right" size=${12} /></button>
        </li>`)}
      </ol>
      <div class="tr-panel__foot">
        <${Button} size="sm" variant="ghost" icon="book-open" onClick=${() => { setOpen(false); navigate('/tour'); }}>Full guide & design rationale<//>
        <button class="tr-hide" onClick=${() => { setOpen(false); setTour({ hidden: true }); }}>Hide guide</button>
      </div>
    </div>` : null}
    ${inWorkspace
      ? html`<button class="tr-fab" aria-label="Reviewer guide" data-tip="Reviewer guide" data-tip-pos="left" onClick=${() => setOpen(!open)}><${Icon} name="list-checks" size=${16} /><span class="tr-fab__count">${seen}/${total}</span></button>`
      : html`<button class=${cx('tr-pill', !seen && 'is-new')} onClick=${() => setOpen(!open)} aria-expanded=${open}>
          <${Icon} name="list-checks" size=${15} /><span>Reviewer guide</span><span class="tr-pill__count">${seen}/${total}</span>
        </button>`}
  </div>`;
}
