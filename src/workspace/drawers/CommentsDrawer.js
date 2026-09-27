// Comments: notes teammates leave on parts of the app. Reply, resolve, or hand one to Architect.
import { html, useState } from '../../lib/html.js';
import { navigate } from '../../lib/router.js';
import { projects, updateProject, session, logActivity } from '../../lib/store.js';
import { Drawer, Button, Icon, Badge, Segmented, Avatar, Empty, toast } from '../../ui/index.js';
import { cx, timeAgo, uid } from '../../lib/util.js';
import { findBlock, screenById } from '../../engine/schema.js';
import { askArchitect, previewState } from '../bus.js';

function where(p, c) {
  const hit = c.blockId ? findBlock(p, c.blockId) : null;
  const s = hit?.screen || (c.screen ? screenById(p, c.screen) : null);
  if (!hit && !s) return null;
  return { label: hit ? `${hit.block.title || hit.block.type} · ${s?.title || ''}` : s.title, route: s?.route, blockId: hit?.block.id, screenId: s?.id };
}

function Comment({ p, c, close }) {
  const [reply, setReply] = useState('');
  const [open, setOpen] = useState(false);
  const w = where(p, c);
  const me = session.value?.name || 'You';
  const mutate = (fn) => updateProject(p.id, (d) => { const x = d.comments.find((y) => y.id === c.id); if (x) fn(x); }, { touch: false });
  const send = () => {
    const t = reply.trim(); if (!t) return;
    mutate((x) => { x.replies = [...(x.replies || []), { id: uid('r'), author: me, text: t, at: Date.now() }]; });
    setReply(''); setOpen(false);
  };
  const resolve = (v) => {
    mutate((x) => { x.resolved = v; x.resolvedAt = v ? Date.now() : null; });
    logActivity(p.id, { actor: 'You', kind: 'comment', plain: `${v ? 'Resolved' : 'Reopened'} ${c.author}’s comment: “${c.text.slice(0, 60)}”`, technical: `comment ${c.id} resolved=${v}` });
  };
  const toAgent = () => {
    askArchitect(`Address this comment from ${c.author}: “${c.text}”`, { kind: 'comment', id: c.id, label: w ? w.label : `${c.author}’s comment`, blockId: w?.blockId, screenId: w?.screenId });
    mutate((x) => { x.sentToAgent = Date.now(); });
    close();
    toast('Added to the chat — review and send', { tone: 'info' });
  };
  const show = () => {
    if (!w) return;
    previewState.value = { ...previewState.value, route: w.route, selectedId: w.blockId };
    navigate(`/p/${p.id}/app${w.route ? `?route=${encodeURIComponent(w.route)}` : ''}`);
  };
  return html`<li class=${cx('ws-comment', c.resolved && 'is-resolved')}>
    <div class="row-top gap-8">
      <${Avatar} name=${c.author} size="sm" />
      <div class="grow" style="min-width:0">
        <div class="row gap-6"><b class="t-sm">${c.author}</b><span class="t-xs t-faint">${timeAgo(c.at)}</span>${c.resolved ? html`<${Badge} size="sm" tone="green" icon="check">Resolved<//>` : null}</div>
        ${w ? html`<button type="button" class="ws-where" onClick=${show}><${Icon} name="map-pin" size=${11} />${w.label}</button>` : null}
        <p class="t-sm ws-comment__text">${c.text}</p>
        ${(c.replies || []).map((r) => html`<div class="ws-reply"><b class="t-xs">${r.author}</b> <span class="t-xs t-faint">${timeAgo(r.at)}</span><p class="t-sm">${r.text}</p></div>`)}
        ${open ? html`<div class="ws-reply-box">
          <textarea class="textarea" rows="2" placeholder="Reply…" value=${reply} onInput=${(e) => setReply(e.currentTarget.value)} onKeyDown=${(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(); }} autofocus></textarea>
          <div class="row gap-6"><span class="grow"></span><${Button} size="sm" variant="ghost" onClick=${() => setOpen(false)}>Cancel<//><${Button} size="sm" variant="primary" onClick=${send} disabled=${!reply.trim()}>Reply<//></div>
        </div>` : null}
        <div class="ws-comment__actions">
          ${!open ? html`<button type="button" class="ws-linkbtn" onClick=${() => setOpen(true)}><${Icon} name="message-circle" size=${12} />Reply</button>` : null}
          <button type="button" class="ws-linkbtn" onClick=${() => resolve(!c.resolved)}><${Icon} name=${c.resolved ? 'rotate-ccw' : 'check'} size=${12} />${c.resolved ? 'Reopen' : 'Resolve'}</button>
          ${!c.resolved ? html`<button type="button" class="ws-linkbtn is-ai" onClick=${toAgent}><${Icon} name="sparkles" size=${12} />Send to agent</button>` : null}
          ${c.sentToAgent ? html`<span class="t-xs t-faint">Sent ${timeAgo(c.sentToAgent)}</span>` : null}
        </div>
      </div>
    </div>
  </li>`;
}

export function CommentsDrawer({ close, projectId }) {
  const p = projects.value[projectId];
  const [filter, setFilter] = useState('open');
  const [text, setText] = useState('');
  if (!p) return null;
  const all = p.comments || [];
  const list = all.filter((c) => (filter === 'open' ? !c.resolved : c.resolved)).sort((a, b) => b.at - a.at);
  const openN = all.filter((c) => !c.resolved).length;
  const add = () => {
    const t = text.trim(); if (!t) return;
    updateProject(p.id, (d) => { d.comments = [{ id: uid('c'), author: session.value?.name || 'You', text: t, at: Date.now(), resolved: false, replies: [] }, ...(d.comments || [])]; }, { touch: false });
    setText('');
  };
  return html`<${Drawer} title="Comments" icon="message-circle" onClose=${close}>
    <div class="ws-comments">
      <div class="ws-newnote">
        <textarea class="textarea" rows="2" placeholder="Leave a note for your team…" value=${text} onInput=${(e) => setText(e.currentTarget.value)} onKeyDown=${(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) add(); }}></textarea>
        <div class="row"><span class="t-xs t-faint grow">Tip: pin a note to a part of the app with the Comment tool in the App tab.</span><${Button} size="sm" variant="primary" disabled=${!text.trim()} onClick=${add}>Comment<//></div>
      </div>
      <${Segmented} size="sm" full value=${filter} onChange=${setFilter} options=${[{ value: 'open', label: `Open${openN ? ` · ${openN}` : ''}` }, { value: 'resolved', label: 'Resolved' }]} />
      ${list.length ? html`<ul class="ws-comment-list">${list.map((c) => html`<${Comment} key=${c.id} p=${p} c=${c} close=${close} />`)}</ul>`
        : html`<${Empty} icon="message-circle" title=${filter === 'open' ? 'No open comments' : 'Nothing resolved yet'} body=${filter === 'open' ? 'Comments from teammates and reviewers show up here. Send any of them to Architect to act on.' : 'Resolved comments are kept here for reference.'} />`}
    </div>
  <//>`;
}
