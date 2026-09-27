// Invite acceptance: /invite/:token → sign in → join workspace → /projects.
import { html, useState } from '../../lib/html.js';
import { navigate } from '../../lib/router.js';
import { session, pushInbox } from '../../lib/store.js';
import { requireAuth } from '../../shells/Auth.js';
import { Logo, Button, Avatar, Badge, Icon, toast } from '../../ui/index.js';
import { ROLES } from '../../engine/catalog.js';

export default function Invite({ params }) {
  const [busy, setBusy] = useState(false);
  const token = params?.token || 'demo';
  const role = ROLES.find((r) => r.id === (token.includes('view') ? 'viewer' : 'editor'));
  const accept = async () => {
    setBusy(true);
    const ok = await requireAuth({ reason: 'Sign in to accept the invite and join the workspace.' });
    setBusy(false);
    if (!ok) return;
    pushInbox({ kind: 'ready', title: 'You joined Acme Ops', body: `You’re an ${role.label} in the Acme Ops workspace.`, href: '/projects' });
    toast('Welcome to Acme Ops', { tone: 'success' });
    navigate('/projects');
  };
  return html`<div class="ap-invite paper-grid">
    <div class="ap-invite__card anim-rise">
      <${Logo} href="/" />
      <div class="row gap-8 mt-24"><${Avatar} name="Maya Chen" /><${Icon} name="arrow-right" size=${14} class="t-faint" /><${Avatar} name=${session.value?.name || 'You'} src=${session.value?.photo} /></div>
      <h1 class="t-2xl t-strong mt-16">Maya invited you to <span class="t-blueprint">Acme Ops</span></h1>
      <p class="t-md t-muted mt-8">Join the workspace to build and review apps together.</p>
      <div class="ap-invite__role mt-16"><${Badge} tone="blueprint">${role.label}<//><span class="t-sm t-muted">${role.desc}</span></div>
      <div class="col gap-8 mt-24">
        <${Button} variant="primary" size="lg" full loading=${busy} onClick=${accept}>${session.value ? 'Accept invite' : 'Sign in to accept'}<//>
        <${Button} variant="ghost" full onClick=${() => navigate(session.value ? '/start' : '/')}>Not now<//>
      </div>
      <p class="t-xs t-faint mt-16 row gap-4"><${Icon} name="flask" size=${12} />Prototype: this invite is a demo workspace.</p>
    </div>
  </div>`;
}
