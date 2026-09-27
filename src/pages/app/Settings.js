// Settings: profile, experience, appearance, API & CLI tokens, data export, workspace members.
import { html, useState } from '../../lib/html.js';
import { AppPage } from '../../shells/AppShell.js';
import { session, prefs, setPrefs, projects, wallet, inbox, connections } from '../../lib/store.js';
import { updateProfileName, authMode } from '../../lib/auth.js';
import { ROLES } from '../../engine/catalog.js';
import { PageHeader, Input, Button, Segmented, Switch, Avatar, Badge, Select, Modal, openModal, CodeBlock, CopyButton, Callout, toast, confirmDialog, Icon, Empty } from '../../ui/index.js';
import { downloadFile, uid, timeAgo, fmtDate } from '../../lib/util.js';
import { ExperiencePicker, SideNav } from './parts/common.js';

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: 'user' }, { id: 'experience', label: 'Experience', icon: 'sliders' },
  { id: 'appearance', label: 'Appearance', icon: 'palette' }, { id: 'tokens', label: 'API & CLI', icon: 'terminal' },
  { id: 'data', label: 'Your data', icon: 'download' }, { id: 'workspace', label: 'Workspace', icon: 'users' },
];

function Section({ title, sub, children }) {
  return html`<section class="ap-set"><h2 class="t-lg t-strong">${title}</h2>${sub ? html`<p class="t-sm t-muted mt-4">${sub}</p>` : null}<div class="mt-16 col gap-16">${children}</div></section>`;
}

function Profile() {
  const me = session.value || {};
  const [name, setName] = useState(me.name || '');
  const [busy, setBusy] = useState(false);
  return html`<${Section} title="Profile" sub="How you appear to teammates and in activity history.">
    <div class="row gap-12"><${Avatar} name=${name || 'You'} src=${me.photo} size="lg" /><div class="col gap-2"><span class="t-strong">${me.name}</span><span class="t-xs t-faint">${authMode === 'firebase' ? `Signed in with ${me.provider || 'email'}` : 'Demo mode — saved in this browser'}</span></div></div>
    <${Input} label="Display name" value=${name} onValue=${setName} />
    <${Input} label="Email" value=${me.email || ''} disabled hint="Your sign-in email can’t be changed here." />
    <div class="row gap-8"><${Button} variant="primary" loading=${busy} disabled=${!name.trim() || name.trim() === me.name} onClick=${async () => { setBusy(true); try { await updateProfileName(name.trim()); toast('Profile updated', { tone: 'success' }); } catch (e) { toast(e.message, { tone: 'error' }); } setBusy(false); }}>Save changes<//></div>
    <div class="col gap-8"><span class="field__label">Notifications</span>
      ${[['inApp', 'In-app inbox', 'Builds finished, approvals needed, problems'], ['email', 'Email', 'Only when something needs you'], ['weekly', 'Weekly summary', 'Usage, spend and agent activity']].map(([k, l, h]) => html`<${Switch} checked=${!!prefs.value.notifications?.[k]} onChange=${(v) => setPrefs({ notifications: { ...prefs.value.notifications, [k]: v } })} label=${l} hint=${h} />`)}
    </div>
  <//>`;
}

function TokenModal({ close, token, name }) {
  return html`<${Modal} title="Your new token" subtitle=${name} icon="key" onClose=${close} footer=${html`<${Button} variant="primary" onClick=${close}>I’ve copied it<//>`}>
    <${Callout} tone="amber" icon="alert-triangle">This is the only time the full token is shown. Store it somewhere safe.<//>
    <div class="ap-token mt-12"><code class="t-mono grow">${token}</code><${CopyButton} text=${token} /></div>
  <//>`;
}

function Tokens() {
  const tokens = prefs.value.tokens || [];
  const [name, setName] = useState('');
  const create = () => {
    const bytes = crypto.getRandomValues(new Uint8Array(24));
    const token = 'arch_' + [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
    const label = name.trim() || `Token ${tokens.length + 1}`;
    setPrefs({ tokens: [{ id: uid('tok'), name: label, last4: token.slice(-4), createdAt: Date.now() }, ...tokens] });
    setName('');
    openModal(TokenModal, { token, name: label });
  };
  const cli = `# Install the CLI\nnpm install -g @architect/cli\n\n# Sign in with a token\narchitect login --token arch_…\n\n# Pull an app's code, run it, push changes back\narchitect pull lead-desk\narchitect dev\narchitect push -m "Tweak scoring"`;
  const mcp = `{\n  "mcpServers": {\n    "architect": {\n      "url": "https://mcp.architect.space/mcp",\n      "headers": { "Authorization": "Bearer arch_…" }\n    }\n  }\n}`;
  return html`<${Section} title="API & CLI" sub="Use Architect from your terminal, CI or any MCP client (Claude Code, Cursor…).">
    <div class="row gap-8 wrap"><div class="grow" style="min-width:200px"><${Input} placeholder="Token name, e.g. Laptop CLI" value=${name} onValue=${setName} /></div><${Button} variant="primary" icon="plus" onClick=${create}>Generate token<//></div>
    ${tokens.length ? html`<div class="ap-list">${tokens.map((t) => html`<div class="ap-list__row">
      <${Icon} name="key" size=${15} class="t-faint" /><div class="grow col gap-2"><span class="t-sm t-strong">${t.name}</span><span class="t-xs t-faint"><span class="t-mono">arch_••••${t.last4}</span> · created ${timeAgo(t.createdAt)}</span></div>
      <${Button} size="sm" variant="ghost" onClick=${async () => { if (await confirmDialog({ title: `Revoke “${t.name}”?`, body: 'Anything using this token stops working immediately.', confirmLabel: 'Revoke', danger: true })) { setPrefs({ tokens: tokens.filter((x) => x.id !== t.id) }); toast('Token revoked'); } }}>Revoke<//>
    </div>`)}</div>` : html`<div class="t-sm t-muted">No tokens yet.</div>`}
    <${CodeBlock} title="Terminal" lang="sh" code=${cli} />
    <${CodeBlock} title="MCP client config" lang="json" code=${mcp} />
    <div class="t-xs t-faint row gap-4"><${Icon} name="flask" size=${12} />Prototype: tokens are generated locally and don’t call a real API.</div>
  <//>`;
}

function DataExport() {
  const exportAll = () => {
    const me = session.value;
    const c = connections.value;
    const payload = {
      exportedAt: new Date().toISOString(), format: 'architect-export/v1',
      profile: me ? { name: me.name, email: me.email, provider: me.provider } : null,
      prefs: { ...prefs.value, tokens: (prefs.value.tokens || []).map(({ name, last4, createdAt }) => ({ name, last4, createdAt })) },
      wallet: wallet.value, inbox: inbox.value,
      connections: { integrations: Object.keys(c.integrations), mcp: c.mcp.map(({ name, url, auth }) => ({ name, url, auth })), modelKeys: Object.keys(c.keys) },
      projects: Object.values(projects.value),
    };
    downloadFile(`architect-export-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(payload, null, 2), 'application/json');
    toast('Export downloaded', { tone: 'success' });
  };
  const n = Object.keys(projects.value).length;
  return html`<${Section} title="Your data" sub="Everything you create is yours. Take it with you anytime.">
    <div class="ap-panel row gap-12 wrap"><${Icon} name="download" size=${20} /><div class="grow col gap-2"><span class="t-strong">Export everything</span><span class="t-xs t-muted">${n} projects (plans, screens, data, agents, history), settings, usage and connections as JSON. Secrets are never included.</span></div><${Button} variant="primary" icon="download" onClick=${exportAll}>Download JSON<//></div>
    <div class="ap-panel row gap-12 wrap"><${Icon} name="github" size=${20} /><div class="grow col gap-2"><span class="t-strong">Export code</span><span class="t-xs t-muted">Each project’s full source can be downloaded as a ZIP or pushed to GitHub from its Code tab.</span></div><${Button} href="/projects">Open projects<//></div>
  <//>`;
}

function Workspace() {
  const me = session.value || {};
  const members = prefs.value.members || [];
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const save = (list) => setPrefs({ members: list });
  return html`<${Section} title="Workspace" sub="Invite teammates and choose what each person can do.">
    <div class="row gap-8 wrap"><div class="grow" style="min-width:200px"><${Input} type="email" placeholder="teammate@company.com" value=${email} onValue=${setEmail} /></div><${Select} options=${ROLES.filter((r) => r.id !== 'owner').map((r) => ({ value: r.id, label: r.label }))} value=${role} onValue=${setRole} /><${Button} variant="primary" icon="user-plus" disabled=${!valid} onClick=${() => { save([...members, { id: uid('mem'), email: email.trim(), role, invitedAt: Date.now(), pending: true }]); toast(`Invite created for ${email.trim()}`, { tone: 'success' }); setEmail(''); }}>Invite<//></div>
    <div class="ap-list">
      <div class="ap-list__row"><${Avatar} name=${me.name} src=${me.photo} size="sm" /><div class="grow col gap-2"><span class="t-sm t-strong">${me.name} <span class="t-faint" style="font-weight:400">(you)</span></span><span class="t-xs t-faint">${me.email}</span></div><${Badge}>Owner<//></div>
      ${members.map((m) => html`<div class="ap-list__row"><${Avatar} name=${m.email} size="sm" /><div class="grow col gap-2" style="min-width:0"><span class="t-sm t-truncate">${m.email}</span><span class="t-xs t-faint">${m.pending ? `Invited ${timeAgo(m.invitedAt)} · pending` : 'Member'}</span></div>
        <${Select} size="sm" options=${ROLES.filter((r) => r.id !== 'owner').map((r) => ({ value: r.id, label: r.label }))} value=${m.role} onValue=${(v) => save(members.map((x) => (x.id === m.id ? { ...x, role: v } : x)))} />
        <${Button} size="sm" variant="ghost" icon="x" onClick=${() => save(members.filter((x) => x.id !== m.id))}>Remove<//></div>`)}
    </div>
    <div class="ap-roles">${ROLES.map((r) => html`<div><span class="t-sm t-strong">${r.label}</span><span class="t-xs t-muted">${r.desc}</span></div>`)}</div>
    <div class="t-xs t-faint row gap-4"><${Icon} name="flask" size=${12} />Prototype: invites aren’t emailed. Share an invite link like <span class="t-mono">/invite/demo</span> instead.</div>
  <//>`;
}

export default function Settings({ params }) {
  const section = SECTIONS.some((s) => s.id === params?.section) ? params.section : 'profile';
  const p = prefs.value;
  return html`<${AppPage}>
    <${PageHeader} title="Settings" />
    <div class="ap-settings">
      <${SideNav} items=${SECTIONS} value=${section} base="/settings" />
      <div class="ap-settings__body anim-fade" key=${section}>
        ${section === 'profile' ? html`<${Profile} />` : null}
        ${section === 'experience' ? html`<${Section} title="Experience" sub="Sets defaults only — every detail stays one click away."><${ExperiencePicker} size="sm" value=${p.experience} onChange=${(v) => { setPrefs({ experience: v }); toast('Experience updated', { tone: 'success' }); }} /><//>` : null}
        ${section === 'appearance' ? html`<${Section} title="Appearance">
          <div class="col gap-6"><span class="field__label">Theme</span><${Segmented} value=${p.theme} onChange=${(v) => setPrefs({ theme: v })} options=${[{ value: 'system', label: 'System', icon: 'monitor' }, { value: 'light', label: 'Light', icon: 'sun' }, { value: 'dark', label: 'Dark', icon: 'moon' }]} /></div>
          <div class="col gap-6"><span class="field__label">Density</span><${Segmented} value=${p.density} onChange=${(v) => setPrefs({ density: v })} options=${[{ value: 'comfortable', label: 'Comfortable' }, { value: 'compact', label: 'Compact' }]} /></div>
        <//>` : null}
        ${section === 'tokens' ? html`<${Tokens} />` : null}
        ${section === 'data' ? html`<${DataExport} />` : null}
        ${section === 'workspace' ? html`<${Workspace} />` : null}
      </div>
    </div>
  <//>`;
}
