// Text bubbles, approvals (incl. the budget question), checkpoints, change summaries, notices.
import { html, useState } from '../../lib/html.js';
import { restoreCheckpoint, addChat, updateChat, logActivity, getProject, session } from '../../lib/store.js';
import { Button, Icon, Badge, Avatar, toast } from '../../ui/index.js';
import { cx, fmtRange, fmtNumber } from '../../lib/util.js';
import { resolveApproval, unqueue } from '../../engine/conversation.js';
import { raiseBudget, finishEssentials, stopBuild, isActive } from '../../engine/simulate.js';
import { CardFrame, ActionChips, When } from './common.js';
import { rich } from '../wsKit.js';
import { openRestoreDialog } from '../drawers/HistoryDrawer.js';

const MARK = html`<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="7" fill="var(--blueprint)"/><path d="M7 17.5 12 6l5 11.5" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.2 13.2h5.6" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>`;
export const ArchitectMark = () => html`<span class="ws-mark" aria-hidden="true">${MARK}</span>`;

const CTX_ICON = { block: 'blocks', file: 'file-code', agent: 'bot', comment: 'message-circle', error: 'alert-circle', screen: 'layout-dashboard', table: 'database' };

export function TextMessage({ msg, project }) {
  const d = msg.data || {};
  if (msg.role === 'user') {
    const me = session.value;
    return html`<div class=${cx('ws-msg ws-msg--user', d.cancelled && 'is-cancelled')}>
      <div class="ws-bubble">
        ${d.context ? html`<span class="ws-bubble__ctx"><${Icon} name=${CTX_ICON[d.context.kind] || 'at-sign'} size=${11} />${d.context.label}</span>` : null}
        <div class="ws-bubble__text">${rich(msg.text)}</div>
        ${d.attachments?.length ? html`<div class="ws-bubble__files">${d.attachments.map((a) => html`<span class="ws-file"><${Icon} name="paperclip" size=${11} />${a.name}</span>`)}</div>` : null}
      </div>
      <div class="ws-msg__meta">
        ${d.queued ? html`<span class="ws-queued"><${Icon} name="clock" size=${11} />Queued — runs after the current one <button type="button" class="ws-linkbtn" onClick=${() => unqueue(project.id, msg.id)}>Cancel</button></span>` : null}
        ${d.cancelled ? html`<span class="t-faint">Cancelled</span>` : null}
        ${d.mode && d.mode !== 'build' ? html`<span class="ws-modetag">${d.mode === 'ask' ? 'Ask' : 'Plan'}</span>` : null}
        <${When} at=${msg.at} />
        ${me ? html`<${Avatar} name=${me.name} src=${me.photo} size="sm" />` : null}
      </div>
    </div>`;
  }
  return html`<div class="ws-msg ws-msg--ai">
    <${ArchitectMark} />
    <div class="ws-msg__body">
      <div class=${cx('ws-ai-text', d.error && 'is-error')}>${rich(msg.text)}</div>
      ${d.free ? html`<span class="ws-free">Free · nothing changed</span>` : null}
      <${ActionChips} projectId=${project.id} actions=${d.actions} msg=${msg} />
    </div>
  </div>`;
}

export function SystemNotice({ msg }) {
  return html`<div class="ws-system"><span>${rich(msg.text)}</span></div>`;
}

// ---------------------------------------------------------------------------
// Approvals
// ---------------------------------------------------------------------------
export function ApprovalCard({ msg, project }) {
  const d = msg.data || {};
  if (d.kind === 'budget') return html`<${BudgetCard} msg=${msg} project=${project} />`;
  const st = d.status || 'pending';
  return html`<${CardFrame} tone=${st === 'pending' ? 'amber' : st === 'approved' ? 'green' : 'neutral'} icon=${d.destructive ? 'shield-alert' : 'shield'} title="Needs your OK"
    meta=${st === 'approved' ? html`<${Badge} tone="green" size="sm" icon="check">${d.always ? 'Always allowed' : 'Approved'}<//>` : st === 'denied' ? html`<${Badge} size="sm" icon="x">Denied<//>` : d.destructive ? html`<${Badge} tone="red" size="sm">Destructive<//>` : null}>
    <div class="ws-approve__action">${d.action}</div>
    ${d.reason ? html`<p class="t-sm t-muted">${d.reason}</p>` : null}
    ${d.impact ? html`<div class="ws-note"><${Icon} name="info" size=${13} /><span>${d.impact}</span></div>` : null}
    ${st === 'pending' ? html`<div class="ws-card__actions">
      <${Button} size="sm" variant="primary" icon="check" onClick=${() => resolveApproval(project.id, msg.id, 'approved')}>Approve${d.credits ? ` · ≈${fmtRange(d.credits)} cr` : ''}<//>
      <${Button} size="sm" variant="ghost" onClick=${() => resolveApproval(project.id, msg.id, 'denied')}>Deny<//>
      ${!d.destructive ? html`<${Button} size="sm" variant="ghost" onClick=${() => resolveApproval(project.id, msg.id, 'always')} tip="Don’t ask again for this kind of change">Always allow<//>` : null}
    </div>` : null}
  <//>`;
}

function BudgetCard({ msg, project }) {
  const d = msg.data || {};
  const st = d.status || 'pending';
  const b = project.build;
  const live = b && b.runId === d.runId && b.status === 'paused' && st === 'pending';
  const newCap = Math.ceil(((d.cap || 40) * 1.3) / 5) * 5;
  const label = { approved: 'Budget raised', essentials: 'Finishing essentials', stopped: 'Stopped — work kept' }[st];
  return html`<${CardFrame} tone=${st === 'pending' ? 'amber' : 'neutral'} icon="wallet" title="Budget check" meta=${label ? html`<${Badge} size="sm">${label}<//>` : html`<span class="t-tabular">${fmtNumber(d.credits)} / ${d.cap} cr</span>`}>
    <div class="ws-approve__action">${d.action}</div>
    <p class="t-sm t-muted">${d.reason}</p>
    ${d.impact ? html`<div class="ws-note"><${Icon} name="info" size=${13} /><span>${d.impact}</span></div>` : null}
    ${live ? html`<div class="ws-breaker">
      <button type="button" class="ws-breaker__opt" onClick=${() => raiseBudget(project.id, newCap)}><${Icon} name="plus" size=${14} /><span class="grow"><b>Add budget</b><span>Raise the cap to ${newCap} cr and finish everything</span></span></button>
      <button type="button" class="ws-breaker__opt" onClick=${() => finishEssentials(project.id)}><${Icon} name="list-checks" size=${14} /><span class="grow"><b>Finish essentials</b><span>Only the steps your promises need</span></span></button>
      <button type="button" class="ws-breaker__opt" onClick=${() => stopBuild(project.id)}><${Icon} name="stop" size=${14} /><span class="grow"><b>Stop and keep work</b><span>Everything finished so far stays</span></span></button>
    </div>` : null}
  <//>`;
}

// ---------------------------------------------------------------------------
// Checkpoint & change
// ---------------------------------------------------------------------------
export function CheckpointCard({ msg, project }) {
  const d = msg.data || {};
  const cp = project.checkpoints.find((c) => c.id === d.checkpointId);
  const n = cp?.n ?? d.n;
  return html`<div class="ws-cp">
    <span class="ws-cp__icon"><${Icon} name=${d.restored ? 'rotate-ccw' : 'history'} size=${13} /></span>
    <span class="grow t-truncate">${d.restored ? html`Restored <b>#${n}</b> · ${cp?.label || d.label}` : html`Checkpoint <b>#${n}</b> · ${cp?.label || d.label}`}</span>
    <${When} at=${msg.at} />
    ${cp && !d.restored ? html`<button type="button" class="ws-linkbtn" onClick=${() => openRestoreDialog(project.id, cp.id)}>Restore</button>` : null}
  </div>`;
}

export function undoChange(projectId, msgId) {
  const p = getProject(projectId);
  const m = p?.chat.find((x) => x.id === msgId);
  const target = m?.data?.prevCheckpointId && p.checkpoints.find((c) => c.id === m.data.prevCheckpointId);
  if (!target) { toast('Nothing to undo to — open History to pick a checkpoint', { tone: 'warn' }); return; }
  if (isActive(p)) { toast('Wait for the current run to finish', { tone: 'warn' }); return; }
  restoreCheckpoint(projectId, target.id);
  const safety = getProject(projectId).checkpoints.find((c) => c.kind === 'safety');
  updateChat(projectId, msgId, (mm) => ({ data: { ...mm.data, undone: true, undoneAt: Date.now() } }));
  addChat(projectId, { type: 'checkpoint', data: { checkpointId: target.id, label: target.label, restored: true, n: target.n } });
  logActivity(projectId, { actor: 'You', kind: 'restore', plain: `Undid “${m.data.plain || m.text}” (back to checkpoint #${target.n}).`, technical: `restoreCheckpoint(${target.id}) · safety checkpoint #${safety?.n} created first` });
  toast(`Undone — back to #${target.n}`, {
    tone: 'success',
    action: safety ? { label: 'Redo', onClick: () => { restoreCheckpoint(projectId, safety.id); updateChat(projectId, msgId, (mm) => ({ data: { ...mm.data, undone: false } })); } } : undefined,
  });
}

// Intents describe a change before it runs ("I’ll make the header navy"). Once applied, the
// card should say what happened ("Made the header navy").
const PAST = { make: 'Made', add: 'Added', change: 'Changed', remove: 'Removed', delete: 'Deleted', rename: 'Renamed', connect: 'Connected', move: 'Moved', set: 'Set', turn: 'Turned', show: 'Showed', hide: 'Hid', update: 'Updated', create: 'Created', clear: 'Cleared', switch: 'Switched', replace: 'Replaced', put: 'Put', give: 'Gave', use: 'Used', let: 'Let', send: 'Sent', swap: 'Swapped', build: 'Built', write: 'Wrote', sort: 'Sorted', group: 'Grouped', filter: 'Filtered', limit: 'Limited', tighten: 'Tightened', raise: 'Raised', lower: 'Lowered', require: 'Required', schedule: 'Scheduled', wire: 'Wired', apply: 'Applied', fix: 'Fixed', restyle: 'Restyled', enable: 'Enabled', disable: 'Disabled', allow: 'Allowed', block: 'Blocked', keep: 'Kept', include: 'Included', drop: 'Dropped', rewrite: 'Rewrote', shorten: 'Shortened', start: 'Started', stop: 'Stopped', pause: 'Paused', translate: 'Translated', link: 'Linked', attach: 'Attached', insert: 'Inserted', split: 'Split', merge: 'Merged', reorder: 'Reordered', resize: 'Resized', round: 'Rounded' };
export function pastTense(s = '') {
  return String(s)
    .replace(/(^|[.!?]\s+)I(?:’ll|'ll| will) (\w+)/g, (m, pre, v) => (PAST[v.toLowerCase()] ? `${pre}${PAST[v.toLowerCase()]}` : m))
    .replace(/This can’t be undone except by restoring the checkpoint saved first\./, 'Undo restores the checkpoint saved just before.');
}

export function ChangeCard({ msg, project }) {
  const d = msg.data || {};
  const [tech, setTech] = useState(false);
  const planOnly = !!d.planOnly;
  const cost = d.free || !d.credits ? 'Free' : `${fmtNumber(d.credits)} cr`;
  return html`<${CardFrame} tone=${d.undone ? 'neutral' : planOnly ? 'blueprint' : 'green'} icon=${d.undone ? 'undo' : planOnly ? 'clipboard-list' : 'check-circle'} title=${d.undone ? 'Undone' : planOnly ? 'Plan updated' : 'Changed'}
    meta=${html`<${Badge} size="sm" tone=${d.free || !d.credits ? 'neutral' : 'outline'}>${cost}${d.quote && !d.free && d.credits ? html` <span class="t-faint">of ${fmtRange(d.quote)}</span>` : null}<//>`}
    footer=${html`<span class="ws-fine">${d.checkpoint ? `Checkpoint #${d.checkpoint}` : ''}</span><span class="grow"></span>
      ${d.prevCheckpointId && !d.undone ? html`<${Button} size="sm" variant="ghost" icon="undo" onClick=${() => undoChange(project.id, msg.id)}>Undo<//>` : null}`}>
    <p class=${cx('ws-card__lead', d.undone && 'is-struck')}>${rich(pastTense(d.plain || msg.text))}</p>
    ${(d.technical || d.files?.length) ? html`<button type="button" class="ws-linkbtn" onClick=${() => setTech(!tech)} aria-expanded=${tech}>
      <${Icon} name=${tech ? 'chevron-up' : 'code'} size=${12} />Technical
      ${d.diff && (d.diff.added || d.diff.removed) ? html`<span class="ws-diff"><span class="is-add">+${d.diff.added}</span><span class="is-del">−${d.diff.removed}</span></span>` : null}
    </button>` : null}
    ${tech ? html`<div class="ws-techbox">
      ${d.technical ? html`<div class="t-mono t-xs">${d.technical}</div>` : null}
      ${d.files?.length ? html`<div class="ws-files">${d.files.map((f) => html`<span class="ws-file t-mono"><${Icon} name="file-code" size=${11} />${f}</span>`)}</div>` : null}
    </div>` : null}
  <//>`;
}
