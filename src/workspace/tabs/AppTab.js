// App tab: live preview of the generated app with device frames and tool modes
// (Interact · Select · Edit · Annotate · X-ray), act-as roles, QR, and a bottom console.
import { html, useState, useEffect, useRef } from '../../lib/html.js';
import { IconButton, Segmented, Select, Menu, Button, Badge, Icon, Empty, toast, openModal } from '../../ui/index.js';
import { AppRenderer } from '../../genapp/Renderer.js';
import { pushGxEvent } from '../../genapp/runtime.js';
import { previewState, consoleOpen } from '../bus.js';
import { route as routeSig, navigate, setQuery } from '../../lib/router.js';
import { uid, cx } from '../../lib/util.js';
import { DeviceStage, QrModal } from '../preview/frame.js';
import { PreviewConsole, problemCount } from '../preview/console.js';
import { SelectBar, NotesPanel } from '../preview/overlays.js';

const TOOLS = [
  { value: 'interact', label: 'Interact', icon: 'pointer', tip: 'Interact (1): use the app like a visitor' },
  { value: 'select', label: 'Select', icon: 'target', tip: 'Select (2): pick a block to ask about, change or comment on' },
  { value: 'edit', label: 'Edit', icon: 'pencil', tip: 'Edit (3): change text in place, free' },
  { value: 'annotate', label: 'Annotate', icon: 'sticky-note', tip: 'Annotate (4): drop numbered notes, apply them together' },
  { value: 'xray', label: 'X-ray', icon: 'scan-eye', tip: 'X-ray (5): see the file, data and agent behind each block' },
];
const DEVICES = [
  { value: 'desktop', icon: 'monitor', tip: 'Desktop' },
  { value: 'tablet', icon: 'tablet', tip: 'Tablet (820px)' },
  { value: 'mobile', icon: 'smartphone', tip: 'Phone (390px)' },
];
const ROLES = [
  { value: 'admin', label: 'Admin', desc: 'Sees everything, including settings' },
  { value: 'teammate', label: 'Teammate', desc: 'A signed-in member of the team' },
  { value: 'visitor', label: 'Visitor', desc: 'Not signed in: public screens only' },
];
const HINTS = {
  select: { icon: 'target', text: 'Click any block to ask about it, change it or leave a comment.' },
  edit: { icon: 'pencil', text: 'Click any text to edit it in place. Free edits save instantly with a checkpoint.' },
  annotate: { icon: 'sticky-note', text: 'Click anywhere to drop a numbered note. Apply them all together when you’re done.' },
  xray: { icon: 'scan-eye', text: 'Click a block to see the file, data and agent behind it.' },
};

const noteStore = new Map(); // project id -> notes (survives tab switches)
const setPS = (patch) => { previewState.value = { ...previewState.value, ...patch }; };

export default function AppTab({ project }) {
  const ps = previewState.value;
  const screens = project.screens || [];
  const stageRef = useRef(null);
  const [sel, setSel] = useState(null);
  const [notes, setNotesRaw] = useState(() => noteStore.get(project.id) || []);
  const [activePin, setActivePin] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [reloading, setReloading] = useState(false);

  const cur = screens.find((s) => s.route === ps.route) || screens[0] || null;
  const curRoute = cur?.route || '/';
  const mode = TOOLS.some((t) => t.value === ps.mode) ? ps.mode : 'interact';
  const device = ps.device || 'desktop';
  const actAs = ps.actAs || 'admin';
  const setNotes = (list) => { noteStore.set(project.id, list); setNotesRaw(list); };

  useEffect(() => {
    const q = routeSig.value.query?.route;
    if (q && screens.some((s) => s.route === q)) setPS({ route: q });
    setNotesRaw(noteStore.get(project.id) || []);
  }, [project.id]);
  useEffect(() => { setSel(null); }, [mode, curRoute, device]);
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (document.querySelector('.modal, [role="dialog"]')) return;
      const i = ['1', '2', '3', '4', '5'].indexOf(e.key);
      if (i >= 0) { e.preventDefault(); setPS({ mode: TOOLS[i].value }); }
      else if (e.key === 'Escape') setSel(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!screens.length) {
    return html`<div class="pv pv--empty">
      <${Empty} icon="monitor" title="Nothing to preview yet — approve the plan to start building"
        body="Your app’s screens appear here as soon as Architect starts building them. You’ll be able to click through them, pick blocks and leave notes."
        action=${html`<${Button} variant="primary" icon="sparkles" onClick=${() => navigate(`/p/${project.id}/plan`)}>Go to the plan<//>`} />
    </div>`;
  }

  const goRoute = (r) => { setPS({ route: r }); setQuery({ route: r }); };
  const reload = () => {
    setReloadKey((k) => k + 1);
    setReloading(true);
    setTimeout(() => setReloading(false), 480);
    pushGxEvent(project.id, 'info', `reload · GET ${curRoute} 200`);
  };
  const prod = project.environments?.production;
  const appPath = `/a/${project.slug}${curRoute === '/' ? '' : curRoute}`;
  const openPath = prod ? appPath : `${appPath}?preview=1&project=${project.id}`;
  const openNew = () => {
    window.open(openPath, '_blank', 'noopener');
    if (!prod) toast('Draft preview: opened in a new tab. Publish from Launch to get a public link.', { tone: 'info' });
  };
  const addNote = (pt) => {
    const note = { id: uid('pin'), n: notes.length + 1, blockId: pt.blockId, screenId: pt.screenId, label: pt.label, x: pt.x, y: pt.y, note: '' };
    setNotes([...notes, note]);
    setActivePin(note.id);
  };

  const hasSample = (project.data?.tables || []).some((t) => (t.source || 'sample') === 'sample');
  const env = prod
    ? html`<${Badge} tone="green" dot live tip="Published: this is what visitors see at your live address">Live v${prod.version || 1}<//>`
    : html`<${Badge} dot tip=${hasSample ? 'Not published yet. Widgets use sample data until you connect real sources.' : 'Not published yet'}>${hasSample ? 'Draft · sample data' : `Draft v${project.environments?.draft?.version || 0}`}<//>`;

  const b = project.build;
  const building = b && (b.status === 'running' || b.status === 'paused');
  const steps = b?.steps || [];
  const si = Math.max(0, Math.min(b?.stepIndex ?? 0, steps.length - 1));
  const problems = problemCount(project);
  const hint = HINTS[mode];
  const role = ROLES.find((r) => r.value === actAs) || ROLES[0];
  const url = `${project.slug}--draft.preview.architect.space${curRoute}`;

  return html`<div class=${cx('pv', `pv--${mode}`)}>
    <div class="pv-bar">
      <div class="pv-bar__group">
        <${Select} size="sm" class="pv-route" aria-label="Screen" value=${curRoute} onValue=${goRoute}
          options=${screens.map((s) => ({ value: s.route, label: `${s.title}  ${s.route}` }))} />
        <${IconButton} size="sm" icon="refresh" label="Reload preview" onClick=${reload} class=${cx(reloading && 'pv-spin')} />
      </div>
      <${Segmented} size="sm" options=${DEVICES} value=${device} onChange=${(v) => setPS({ device: v })} />
      <span class="pv-env">${env}</span>
      <span class="pv-bar__spacer"></span>
      <${Segmented} size="sm" class="pv-tools" options=${TOOLS} value=${mode} onChange=${(v) => setPS({ mode: v })} />
      <div class="pv-bar__group">
        <${Menu} width=${250} trigger=${(open, toggle) => html`<${Button} size="sm" variant="ghost" icon="user" iconRight="chevron-down" onClick=${toggle} tip="Preview the app as a different kind of user" class="pv-actas">As ${role.label}<//>`}
          items=${[{ section: 'Preview as' }, ...ROLES.map((r) => ({ label: r.label, desc: r.desc, active: r.value === actAs, onClick: () => setPS({ actAs: r.value }) }))]} />
        <${IconButton} size="sm" icon="external-link" label=${prod ? 'Open live app' : 'Open draft in new tab'} onClick=${openNew} />
        <${IconButton} size="sm" icon="qr-code" label="Open on your phone" onClick=${() => openModal(QrModal, { url: location.origin + openPath, name: project.name })} />
        <${IconButton} size="sm" icon="terminal" label="Console" active=${consoleOpen.value} badge=${problems || null} onClick=${() => { consoleOpen.value = !consoleOpen.value; }} />
      </div>
    </div>

    <div class="pv-canvas">
      ${building ? html`<div class=${cx('pv-build', b.status === 'paused' && 'is-paused')} role="status">
        <span class="pv-build__pulse"></span>
        <strong>${b.status === 'paused' ? 'Paused' : 'Building'}</strong>
        <span class="pv-build__step">step ${si + 1}/${steps.length || 1}</span>
        <span class="pv-build__label">${steps[si]?.label || b.label || 'Working…'}</span>
        <span class="pv-build__bar"><i style=${{ width: `${steps.length ? Math.round(((si + (b.status === 'running' ? 0.5 : 0)) / steps.length) * 100) : 10}%` }}></i></span>
      </div>` : null}
      ${hint ? html`<div class=${cx('pv-hint', `pv-hint--${mode}`)}>
        <${Icon} name=${hint.icon} size=${14} /><span>${hint.text}</span>
        <button class="pv-hint__done" onClick=${() => setPS({ mode: 'interact' })}>Done <kbd>1</kbd></button>
      </div>` : null}
      <div class="pv-canvas__row">
        <${DeviceStage} device=${device} url=${url} stageRef=${stageRef}
          overlay=${mode === 'select' && sel ? html`<${SelectBar} sel=${sel} project=${project} stageRef=${stageRef} onClose=${() => setSel(null)} />` : null}>
          <${AppRenderer} key=${reloadKey} project=${project} route=${curRoute} device=${device} mode=${mode}
            selectedId=${mode === 'select' ? sel?.blockId : null} onSelect=${(s) => setSel(sel && s.blockId === sel.blockId ? null : s)}
            onNavigate=${goRoute} annotations=${notes.filter((n) => n.screenId === cur.id)} onAnnotate=${addNote} activePin=${activePin}
            actAs=${actAs} onActAs=${(r) => setPS({ actAs: r })} />
          ${reloading ? html`<div class="pv-reloading"><span class="pv-spinner"></span></div>` : null}
        <//>
        ${mode === 'annotate' ? html`<${NotesPanel} project=${project} notes=${notes} setNotes=${setNotes} activePin=${activePin} setActivePin=${setActivePin} />` : null}
      </div>
    </div>

    ${consoleOpen.value ? html`<${PreviewConsole} project=${project} />` : null}
  </div>`;
}
