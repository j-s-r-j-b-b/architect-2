// Select-mode floating action bar and Annotate-mode notes panel for the App tab.
import { html, useState, useEffect, useRef } from '../../lib/html.js';
import { Icon, IconButton, Button, toast } from '../../ui/index.js';
import { session, updateProject, logActivity } from '../../lib/store.js';
import { askArchitect, openPanel } from '../bus.js';
import { cx, uid, clamp, plural } from '../../lib/util.js';

export function SelectBar({ sel, project, stageRef, onClose }) {
  const [, setTick] = useState(0);
  const [commenting, setCommenting] = useState(false);
  const [text, setText] = useState('');
  const inputRef = useRef(null);
  useEffect(() => { setCommenting(false); setText(''); }, [sel.blockId]);
  useEffect(() => { if (commenting) inputRef.current?.focus(); }, [commenting]);
  useEffect(() => {
    const on = () => setTick((t) => t + 1);
    window.addEventListener('scroll', on, true);
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on, true); window.removeEventListener('resize', on); };
  }, []);

  const stage = stageRef.current;
  const el = sel.el?.isConnected ? sel.el : stage?.querySelector(`[data-gx-block="${sel.blockId}"]`);
  if (!stage || !el) return null;
  const r = el.getBoundingClientRect(), c = stage.getBoundingClientRect();
  if (r.bottom < c.top + 8 || r.top > c.bottom - 8) return null;
  const W = Math.min(400, c.width - 16);
  const above = r.top - c.top >= 54;
  const top = (above ? r.top - 46 : Math.min(r.bottom + 8, c.bottom - 56)) - c.top + stage.scrollTop;
  const left = clamp(r.left - c.left, 8, Math.max(8, c.width - W - 8)) + stage.scrollLeft;

  const ctx = { kind: 'block', id: sel.blockId, label: sel.label, screenId: sel.screenId };
  const ask = (t) => { askArchitect(t, ctx); toast('Added to the chat. Edit it and press Enter.', { tone: 'info' }); onClose(); };
  const post = (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    const author = session.value?.name || 'You';
    updateProject(project.id, (d) => {
      d.comments = d.comments || [];
      d.comments.push({ id: uid('cm'), blockId: sel.blockId, screen: sel.screenId, author, text: body, at: Date.now(), resolved: false, replies: [] });
    });
    logActivity(project.id, { plain: `${author} commented on the ${sel.label}.`, technical: `comment · ${sel.blockId}` });
    toast('Comment added', { tone: 'success', action: { label: 'View all', onClick: () => openPanel('comments') } });
    onClose();
  };

  return html`<div class="pv-selbar" style=${{ top: `${top}px`, left: `${left}px`, maxWidth: `${W}px` }} onMouseDown=${(e) => e.stopPropagation()}>
    <span class="pv-selbar__label" title=${sel.label}><${Icon} name="pointer" size=${12} />${sel.label}</span>
    ${commenting ? html`<form class="pv-selbar__form" onSubmit=${post}>
      <input ref=${inputRef} class="pv-selbar__input" placeholder="Comment for your team…" value=${text} onInput=${(e) => setText(e.currentTarget.value)} onKeyDown=${(e) => { if (e.key === 'Escape') setCommenting(false); }} />
      <${Button} size="sm" variant="primary" type="submit" disabled=${!text.trim()}>Post<//>
    </form>` : html`
      <button class="pv-selbar__btn" onClick=${() => ask(`What does the “${sel.label}” do, and where does its data come from?`)}><${Icon} name="message-circle" size=${13} />Ask about this</button>
      <button class="pv-selbar__btn is-ai" onClick=${() => ask(`Change the “${sel.label}” so that `)}><${Icon} name="sparkles" size=${13} />Change this…</button>
      <button class="pv-selbar__btn" onClick=${() => setCommenting(true)}><${Icon} name="message-square" size=${13} />Comment</button>`}
    <button class="pv-selbar__x" aria-label="Clear selection" data-tip="Esc" onClick=${onClose}><${Icon} name="x" size=${13} /></button>
  </div>`;
}

function NoteRow({ note, where, active, onFocus, onChange, onRemove }) {
  const ref = useRef(null);
  useEffect(() => { if (active) ref.current?.focus(); }, [active]);
  return html`<div class=${cx('pv-note', active && 'is-active')}>
    <span class="pv-note__n">${note.n}</span>
    <div class="pv-note__main">
      <div class="pv-note__where">${where}</div>
      <textarea ref=${ref} rows="2" class="pv-note__input" placeholder="What should change here?" value=${note.note} onFocus=${onFocus} onInput=${(e) => onChange(e.currentTarget.value)}></textarea>
    </div>
    <button class="pv-note__x" aria-label=${`Remove note ${note.n}`} onClick=${onRemove}><${Icon} name="x" size=${12} /></button>
  </div>`;
}

export function NotesPanel({ project, notes, activePin, setActivePin, setNotes }) {
  const written = notes.filter((n) => n.note.trim());
  const where = (n) => `${n.label} · ${(project.screens || []).find((s) => s.id === n.screenId)?.title || 'Screen'}`;
  const apply = () => {
    const k = written.length;
    const text = `Please apply ${plural(k, 'note')} from the preview:\n${written.map((n, i) => `${i + 1}. ${where(n)}: ${n.note.trim()}`).join('\n')}`;
    askArchitect(text, { kind: 'comment', id: 'preview-notes', label: `${plural(k, 'note')} from the preview` });
    toast(`Sent ${plural(k, 'note')} to Architect. You’ll see a quote before anything is spent.`, { tone: 'success' });
    setNotes([]);
    setActivePin(null);
  };
  return html`<aside class="pv-notes" aria-label="Annotation notes">
    <header class="pv-notes__head">
      <${Icon} name="sticky-note" size=${15} /><strong>Notes</strong><span class="pv-notes__count">${notes.length}</span>
      <span class="grow"></span>
      ${notes.length ? html`<${IconButton} size="sm" icon="trash" label="Clear all notes" onClick=${() => { setNotes([]); setActivePin(null); }} />` : null}
    </header>
    <div class="pv-notes__list">
      ${notes.length ? notes.map((n) => html`<${NoteRow} key=${n.id} note=${n} where=${where(n)} active=${activePin === n.id}
        onFocus=${() => setActivePin(n.id)}
        onChange=${(v) => setNotes(notes.map((x) => (x.id === n.id ? { ...x, note: v } : x)))}
        onRemove=${() => setNotes(notes.filter((x) => x.id !== n.id).map((x, i) => ({ ...x, n: i + 1 })))} />`)
      : html`<div class="pv-notes__empty"><${Icon} name="pointer" size=${18} /><span>Click anywhere on the app to drop a numbered pin, then describe the change. Architect applies all notes in one go.</span></div>`}
    </div>
    <footer class="pv-notes__foot">
      <${Button} full variant="primary" icon="sparkles" disabled=${!written.length} onClick=${apply}>${written.length ? `Apply ${plural(written.length, 'note')} (~${written.length} credit${written.length === 1 ? '' : 's'})` : 'Apply notes'}<//>
      <div class="pv-notes__fine">You’ll see a quote before anything is spent.</div>
    </footer>
  </aside>`;
}
