// Left chat dock: thread header, auto-scrolling message list (cards), composer.
import { html, useRef, useEffect, useState, signal } from '../lib/html.js';
import { prefs, setPrefs } from '../lib/store.js';
import { cx, plural } from '../lib/util.js';
import { Icon, IconButton } from '../ui/index.js';
import { thinking, isPreBuild } from '../engine/conversation.js';
import { isActive } from '../engine/simulate.js';
import { MessageCard, LiveRunCard, ArchitectMark } from './cards/index.js';
import { Composer } from './Composer.js';
import { askArchitect, openPanel } from './bus.js';

/** Mobile pane ('chat' | 'stage'); the workspace frame reads it. */
export const dockPane = signal('chat');
/** Make sure the chat is visible (expand the dock / switch the mobile pane). */
export function revealChat() {
  dockPane.value = 'chat';
  if (prefs.value.dockCollapsed) setPrefs({ dockCollapsed: false });
}

function suggestionsFor(p) {
  if (isPreBuild(p)) return ['Add a weekly summary email', 'Make it work on phones first', 'What will this cost to run?'];
  const out = ['Make the header navy'];
  if (p.agents[0]) out.push(`What does ${p.agents[0].name} do?`);
  out.push('Add a chart of this week’s results');
  return out;
}

function Intro({ project }) {
  return html`<div class="ws-intro">
    <${ArchitectMark} />
    <div class="ws-intro__body">
      <b>Ask anything about ${project.name}</b>
      <p class="t-sm t-muted">Describe a change in plain words. I show the cost before anything is spent and save a checkpoint before anything changes.</p>
      <div class="ws-chips">${suggestionsFor(project).map((s) => html`<button type="button" class="ws-chipbtn" onClick=${() => askArchitect(s)}><${Icon} name="sparkles" size=${12} />${s}</button>`)}</div>
    </div>
  </div>`;
}

function Thinking({ label }) {
  return html`<div class="ws-item"><div class="ws-msg ws-msg--ai ws-thinking" role="status">
    <${ArchitectMark} />
    <div class="ws-msg__body row gap-8"><span class="ws-typing" aria-hidden="true"><i></i><i></i><i></i></span><span class="t-sm t-muted">${label}</span></div>
  </div></div>`;
}

export function ChatDock({ project, collapsed, onCollapse }) {
  const listRef = useRef(null);
  const stick = useRef(true);
  const prevLen = useRef(-1);
  const [unseen, setUnseen] = useState(0);
  const msgs = project.chat.filter((m) => (m.thread || 'main') === 'main');
  const last = msgs[msgs.length - 1];
  const think = thinking.value[project.id];
  const b = project.build;
  const liveEdit = b && b.kind !== 'build' && isActive(project);
  const sig = `${msgs.length}:${last?.id}:${think || ''}:${b?.runId || ''}:${b?.stepIndex ?? ''}:${b?.status || ''}`;

  const toBottom = (smooth) => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  };
  useEffect(() => {
    const first = prevLen.current < 0;
    const grew = msgs.length > prevLen.current;
    prevLen.current = msgs.length;
    if (first) { toBottom(false); requestAnimationFrame(() => toBottom(false)); return; }
    if (stick.current || (grew && last?.role === 'user')) { requestAnimationFrame(() => toBottom(true)); setUnseen(0); }
    else if (grew) setUnseen((n) => n + 1);
  }, [sig]);
  useEffect(() => { if (!collapsed) requestAnimationFrame(() => toBottom(false)); }, [collapsed]);

  const onScroll = (e) => {
    const el = e.currentTarget;
    stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 90;
    if (stick.current && unseen) setUnseen(0);
  };

  return html`<aside class=${cx('ws-dock', collapsed && 'is-collapsed')} aria-label="Chat with Architect">
    <header class="ws-dock__head">
      <span class="ws-dock__thread"><${Icon} name="message-square" size=${14} /><b>Main</b></span>
      <span class="t-xs t-faint">${plural(msgs.length, 'message')}</span>
      <span class="grow"></span>
      <${IconButton} icon="history" label="History & checkpoints" size="sm" onClick=${() => openPanel('history')} />
      <${IconButton} icon="panel-left" label="Hide chat (Ctrl+\\)" size="sm" class="ws-dock__collapse" onClick=${onCollapse} />
    </header>
    <div class="ws-dock__list" ref=${listRef} onScroll=${onScroll} role="log" aria-live="polite">
      ${!msgs.length ? html`<${Intro} project=${project} />` : null}
      ${msgs.map((m) => html`<${MessageCard} key=${m.id} msg=${m} project=${project} />`)}
      ${liveEdit ? html`<div class="ws-item ws-item--live"><div class="ws-msg ws-msg--ai ws-msg--card"><${ArchitectMark} /><div class="ws-msg__body"><${LiveRunCard} project=${project} /></div></div></div>` : null}
      ${think ? html`<${Thinking} label=${think} />` : null}
      <div class="ws-dock__end"></div>
    </div>
    ${unseen ? html`<button type="button" class="ws-jump" onClick=${() => { toBottom(true); setUnseen(0); }}><${Icon} name="arrow-down" size=${13} />${plural(unseen, 'new message')}</button>` : null}
    <${Composer} project=${project} />
  </aside>`;
}
