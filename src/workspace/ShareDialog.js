// Share: invite people by email with a role, toggle link access, manage who has access.
// Prototype: invites are simulated — no email is sent.
import { html, useState } from '../lib/html.js';
import { projects, updateProject, session, logActivity } from '../lib/store.js';
import { Modal, openModal, Button, Input, Select, Switch, Avatar, Badge, Callout, CopyButton, IconButton, toast, confirmDialog } from '../ui/index.js';
import { ROLES } from '../engine/catalog.js';
import { uid, timeAgo } from '../lib/util.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const roleLabel = (id) => ROLES.find((r) => r.id === id)?.label || id;
const INVITE_ROLES = ROLES.filter((r) => r.id !== 'owner').map((r) => ({ value: r.id, label: r.label }));
const nameFromEmail = (e) => e.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function ShareDialog({ close, projectId }) {
  const p = projects.value[projectId];
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [err, setErr] = useState('');
  if (!p) return null;
  const members = p.members || [];
  const sharing = p.sharing || {};
  const me = session.value;
  const mut = (fn) => updateProject(projectId, fn, { touch: false });

  const invite = () => {
    const list = email.split(/[,;\s]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (!list.length) { setErr('Enter an email address'); return; }
    const bad = list.find((e) => !EMAIL.test(e));
    if (bad) { setErr(`“${bad}” doesn’t look like an email address`); return; }
    const have = new Set(members.map((m) => (m.email || '').toLowerCase()));
    const fresh = list.filter((e) => !have.has(e));
    if (!fresh.length) { setErr('They already have access'); return; }
    mut((d) => { d.members = [...(d.members || []), ...fresh.map((e) => ({ uid: uid('inv'), name: nameFromEmail(e), email: e, role, invited: true, invitedAt: Date.now(), photo: null }))]; });
    logActivity(projectId, { actor: 'You', kind: 'share', plain: `Invited ${fresh.join(', ')} as ${roleLabel(role)}.`, technical: `members += [${fresh.join(', ')}] role=${role} · simulated invite` });
    toast(`${fresh.length === 1 ? 'Invite' : `${fresh.length} invites`} added — simulated, no email sent`, { tone: 'success' });
    setEmail(''); setErr('');
  };
  const setLink = (on) => mut((d) => { d.sharing = { linkRole: 'viewer', ...(d.sharing || {}), link: on, token: d.sharing?.token || uid('share').replace(/[^a-z0-9]/gi, '') }; });
  const setLinkRole = (r) => mut((d) => { d.sharing = { ...(d.sharing || {}), linkRole: r }; });
  const setMemberRole = (m, r) => mut((d) => { const x = (d.members || []).find((y) => y.uid === m.uid); if (x) x.role = r; });
  const remove = async (m) => {
    const ok = await confirmDialog({ title: `Remove ${m.name}?`, body: 'They lose access to this project straight away. You can invite them again any time.', confirmLabel: 'Remove', danger: true });
    if (!ok) return;
    mut((d) => { d.members = (d.members || []).filter((y) => y.uid !== m.uid); });
    toast(`${m.name} removed`, { tone: 'info' });
  };
  const link = `${window.location.origin}/invite/${sharing.token || ''}`;

  return html`<${Modal} title=${`Share “${p.name}”`} subtitle="Invite teammates to build, review or just watch." icon="user-plus" onClose=${() => close()}
    footer=${html`<span class="t-xs t-faint grow">Prototype: simulated — no emails are sent.</span><${Button} variant="primary" onClick=${() => close()}>Done<//>`}>
    <div class="col gap-16 ws-share-dlg">
      <div class="ws-share__invite">
        <${Input} placeholder="name@company.com, another@company.com" value=${email} onValue=${(v) => { setEmail(v); setErr(''); }} icon="mail" error=${err || undefined}
          onKeyDown=${(e) => { if (e.key === 'Enter') invite(); }} aria-label="Email addresses" autofocus />
        <${Select} options=${INVITE_ROLES} value=${role} onValue=${setRole} aria-label="Role" />
        <${Button} variant="primary" icon="send" onClick=${invite}>Invite<//>
      </div>
      <p class="t-xs t-faint ws-share__roledesc">${ROLES.find((r) => r.id === role)?.desc}</p>

      <div class="ws-share__link">
        <${Switch} checked=${!!sharing.link} onChange=${setLink} label="Anyone with the link" hint=${sharing.link ? `Can join as ${roleLabel(sharing.linkRole || 'viewer')} after signing in` : 'Only people you invite can open this project'} />
        ${sharing.link ? html`<div class="ws-share__linkrow">
          <code class="ws-share__url t-mono t-truncate">${link}</code>
          <${CopyButton} text=${link} label="Copy link" />
          <${Select} size="sm" options=${INVITE_ROLES.filter((r) => r.value !== 'editor')} value=${sharing.linkRole || 'viewer'} onValue=${setLinkRole} aria-label="Link role" />
        </div>` : null}
      </div>

      <div>
        <div class="ws-dlg__label">People with access · ${members.length}</div>
        <ul class="ws-people">
          ${members.map((m) => {
            const owner = m.role === 'owner';
            const self = me && m.uid === me.uid;
            return html`<li class="ws-person">
              <${Avatar} name=${m.name} src=${m.photo} />
              <div class="grow" style="min-width:0">
                <div class="row gap-6"><b class="t-sm t-truncate">${m.name}${self ? ' (you)' : ''}</b>${m.invited ? html`<${Badge} size="sm" tone="amber" tip=${m.invitedAt ? `Invited ${timeAgo(m.invitedAt)}` : ''}>Invited<//>` : null}</div>
                <div class="t-xs t-faint t-truncate">${m.email || '—'}</div>
              </div>
              ${owner ? html`<${Badge} size="sm">Owner<//>` : html`<${Select} size="sm" options=${INVITE_ROLES} value=${m.role} onValue=${(r) => setMemberRole(m, r)} aria-label=${`Role for ${m.name}`} />
                <${IconButton} icon="x" size="sm" label=${`Remove ${m.name}`} onClick=${() => remove(m)} />`}
            </li>`;
          })}
          ${!members.length ? html`<li class="t-sm t-muted">Only you, for now.</li>` : null}
        </ul>
      </div>
      <${Callout} tone="blueprint" icon="shield-check">Reviewers can approve changes before they reach Production. Nobody but the owner sees billing.<//>
    </div>
  <//>`;
}

export function openShareDialog(projectId) { return openModal(ShareDialog, { projectId }); }
