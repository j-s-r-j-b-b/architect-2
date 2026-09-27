// Integration connect flow (review scopes → Allow) and secure secret input.
// Shared by the workspace, agent cards, data tab, launch readiness and the Connections page.
import { html, useState } from '../lib/html.js';
import { session, connections, setConnection, updateProject, getProject, logActivity } from '../lib/store.js';
import { authMode } from '../lib/auth.js';
import { Modal, openModal, Button, Checkbox, Callout, Icon, toast, Input, Segmented, Badge } from '../ui/index.js';
import { integrationById } from '../engine/catalog.js';
import { sleep, cx } from '../lib/util.js';

/** Brand-coloured letter tile for an integration. */
export function IntegrationTile({ id, size, class: cls }) {
  const it = integrationById(id);
  const letters = it.name.replace(/[^A-Za-z0-9 ]/g, '').split(' ').map((w) => w[0]).join('').slice(0, 2);
  return html`<span class=${cx('int-tile', size && `int-tile--${size}`, cls)} style=${{ background: it.color }} title=${it.name}>${letters}</span>`;
}

export function isConnected(id, project) {
  if (project) {
    const pi = project.integrations?.find((i) => i.id === id);
    if (pi) return pi.status === 'connected';
  }
  return !!connections.value.integrations[id];
}

/** Mark an integration connected on a project and flip its tables to live data. */
export function applyProjectConnection(projectId, id, scopes) {
  updateProject(projectId, (d) => {
    const it = d.integrations.find((i) => i.id === id);
    if (it) { it.status = 'connected'; it.scopes = scopes || it.scopes; }
    else d.integrations.push({ id, status: 'connected', scopes: scopes || [], usedBy: [] });
    for (const t of d.data.tables) if (t.connection === id) t.source = 'live';
    for (const e of d.env) if (e.source === id) for (const k of Object.keys(e.values)) e.values[k] = { set: true, last4: 'auto', managed: true };
  });
  logActivity(projectId, { plain: `Connected ${integrationById(id).name} — tables that read from it now show live data.`, technical: `integration:${id} → connected; OAuth token stored in vault (managed secret)` });
}

function ConnectDialog({ close, id, projectId }) {
  const it = integrationById(id);
  const p = projectId ? getProject(projectId) : null;
  const [scopes, setScopes] = useState(it.scopes.map((s) => ({ s, on: true })));
  const [busy, setBusy] = useState(false);
  const [key, setKey] = useState('');
  const needsKey = it.auth === 'apikey';
  const allow = async () => {
    if (needsKey && key.trim().length < 6) { toast('Paste the API key first', { tone: 'warn' }); return; }
    setBusy(true);
    await sleep(900);
    const granted = scopes.filter((x) => x.on).map((x) => x.s);
    setConnection(id, { account: session.value?.email || 'you', scopes: granted, demo: authMode !== 'firebase', last4: needsKey ? key.trim().slice(-4) : null });
    if (projectId) applyProjectConnection(projectId, id, granted);
    toast(`${it.name} connected`, { tone: 'success' });
    close(true);
  };
  return html`<${Modal} size="sm" onClose=${() => close(false)} hideClose=${false}
    footer=${html`<${Button} variant="ghost" onClick=${() => close(false)}>Cancel<//><${Button} variant="primary" loading=${busy} onClick=${allow} icon="check">${needsKey ? 'Save & connect' : 'Allow'}<//>`}>
    <div class="consent">
      <div class="consent__logos">
        <span class="consent__tile" style="background:var(--blueprint)"><svg width="26" height="26" viewBox="0 0 24 24"><path d="M7 17.5 12 6l5 11.5" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.2 13.2h5.6" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg></span>
        <span class="consent__dots"><span></span><span></span><span></span></span>
        <span class="consent__tile" style=${{ background: it.color }}>${it.name[0]}</span>
      </div>
      <div class="t-center">
        <div class="t-lg t-strong">${p ? `${p.name} wants to use ${it.name}` : `Connect ${it.name}`}</div>
        <div class="t-md t-muted mt-4">${needsKey ? `Paste an API key from your ${it.name} account.` : `You’ll connect as ${session.value?.email || 'your account'}. Review what it can do:`}</div>
      </div>
      ${needsKey ? html`<${Input} label=${`${it.name} API key`} type="password" placeholder="Paste key…" value=${key} onValue=${setKey} hint="Stored encrypted in the vault. Agents can use it but never see the value." />` : html`<div class="consent__scopes">
        ${scopes.map((x, i) => html`<label class="consent__scope"><${Checkbox} checked=${x.on} onChange=${(v) => setScopes(scopes.map((y, j) => (j === i ? { ...y, on: v } : y)))} /><span class="grow">${x.s}</span>${/send|write|update|create|post/i.test(x.s) ? html`<${Badge} tone="amber" size="sm">Can change data<//>` : html`<${Badge} size="sm">Read<//>`}</label>`)}
      </div>`}
      <div class="row gap-8 t-xs t-faint"><${Icon} name="shield-check" size=${14} /><span>You can disconnect or narrow access anytime in Connections. Actions marked “Can change data” can be set to ask you first.</span></div>
      ${authMode !== 'firebase' ? html`<${Callout} tone="amber" icon="flask"><b>Prototype:</b> this connection is simulated. No data leaves your browser.<//>` : null}
    </div>
  <//>`;
}

/** Opens the connect flow; resolves true when connected. */
export function openConnectSheet(id, { projectId } = {}) {
  return new Promise((resolve) => { openModal(ConnectDialog, { id, projectId }, { onClose: (ok) => resolve(!!ok) }); });
}

// ---------------------------------------------------------------------------
// Secure secret input — the value is never stored in project data (only a masked marker)
// ---------------------------------------------------------------------------
function SecretDialog({ close, projectId, secretKey, hint, envs }) {
  const [name, setName] = useState(secretKey || '');
  const [value, setValue] = useState('');
  const [scope, setScope] = useState(envs?.[0] || 'draft');
  const save = () => {
    const k = name.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    if (!k || !value.trim()) { toast('Add a name and a value', { tone: 'warn' }); return; }
    const targets = scope === 'all' ? ['draft', 'staging', 'production'] : [scope];
    updateProject(projectId, (d) => {
      let e = d.env.find((x) => x.key === k);
      if (!e) { e = { key: k, secret: true, source: 'user', values: { draft: null, staging: null, production: null } }; d.env.push(e); }
      for (const t of targets) e.values[t] = { set: true, last4: value.trim().slice(-4) };
    });
    logActivity(projectId, { plain: `Added the secret ${k} for ${scope === 'all' ? 'every environment' : scope}.`, technical: `env ${k} set (${targets.join(', ')}) · value encrypted, not visible to agents` });
    toast(`${k} saved`, { tone: 'success' });
    close(true);
  };
  return html`<${Modal} size="sm" title="Add a secret" subtitle=${hint || 'API keys and tokens your app needs. Encrypted at rest; agents can use them but never read them.'} icon="key" onClose=${() => close(false)}
    footer=${html`<${Button} variant="ghost" onClick=${() => close(false)}>Cancel<//><${Button} variant="primary" icon="lock" onClick=${save}>Save secret<//>`}>
    <div class="col gap-12">
      <${Input} label="Name" placeholder="OPENAI_API_KEY" value=${name} onValue=${setName} class="t-mono" />
      <${Input} label="Value" type="password" placeholder="Paste value…" value=${value} onValue=${setValue} autocomplete="off" />
      <div class="field"><span class="field__label">Use in</span>
        <${Segmented} full value=${scope} onChange=${setScope} options=${[{ value: 'draft', label: 'Draft' }, { value: 'staging', label: 'Staging' }, { value: 'production', label: 'Production' }, { value: 'all', label: 'All' }]} />
      </div>
    </div>
  <//>`;
}
export function openSecretSheet({ projectId, key, hint, envs } = {}) {
  return new Promise((resolve) => { openModal(SecretDialog, { projectId, secretKey: key, hint, envs }, { onClose: (ok) => resolve(!!ok) }); });
}
