// Account-level connections: apps, MCP servers, model keys (BYOK) and GitHub.
import { html, useState } from '../../lib/html.js';
import { AppPage } from '../../shells/AppShell.js';
import { connections, setConnection, addMcpServer, removeMcpServer, setModelKey } from '../../lib/store.js';
import { githubAccount, connectGitHub, disconnectGitHub, isRealGitHub } from '../../lib/github.js';
import { INTEGRATIONS, INTEGRATION_CATEGORIES, MCP_SERVERS } from '../../engine/catalog.js';
import { openConnectSheet, IntegrationTile } from '../../shells/ConnectSheet.js';
import { PageHeader, Tabs, Input, Button, Badge, StatusPill, Empty, Callout, Modal, openModal, Segmented, toast, confirmDialog, Icon, Avatar } from '../../ui/index.js';
import { cx, uid, slugify, timeAgo } from '../../lib/util.js';

const PROVIDERS = [
  { id: 'anthropic', name: 'Anthropic', hint: 'sk-ant-…' }, { id: 'openai', name: 'OpenAI', hint: 'sk-…' },
  { id: 'google', name: 'Google AI', hint: 'AIza…' }, { id: 'groq', name: 'Groq', hint: 'gsk_…' },
];

function Apps() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const conn = connections.value.integrations;
  const list = INTEGRATIONS.filter((i) => (cat === 'All' || (cat === 'Connected' ? conn[i.id] : i.category === cat)) && (!q || `${i.name} ${i.desc}`.toLowerCase().includes(q.toLowerCase())));
  return html`<div>
    <div class="ap-toolbar"><div class="grow" style="min-width:200px"><${Input} icon="search" placeholder="Search 40+ apps" value=${q} onValue=${setQ} /></div></div>
    <div class="row gap-6 wrap mb-16">${['All', 'Connected', ...INTEGRATION_CATEGORIES].map((c) => html`<button class=${cx('chip chip--sm', cat === c && 'is-active')} onClick=${() => setCat(c)}>${c}${c === 'Connected' ? ` (${Object.keys(conn).length})` : ''}</button>`)}</div>
    ${list.length ? html`<div class="ap-grid-3">${list.map((i) => {
      const c = conn[i.id];
      return html`<div class="ap-conn">
        <div class="row gap-12"><${IntegrationTile} id=${i.id} size="lg" /><div class="grow col gap-2" style="min-width:0"><span class="t-strong">${i.name}</span><span class="t-xs t-faint">${i.category}</span></div>${c ? html`<${StatusPill} status="connected" size="sm" />` : i.builtIn ? html`<${Badge} size="sm" tone="blueprint">Built-in<//>` : null}</div>
        <p class="t-sm t-muted">${i.desc}</p>
        <div class="row gap-8 mt-auto">
          ${c ? html`<span class="t-xs t-faint grow t-truncate">${c.account || 'Connected'} · ${timeAgo(c.connectedAt)}${c.demo ? ' · demo' : ''}</span>
            <${Button} size="sm" variant="ghost" onClick=${async () => { if (await confirmDialog({ title: `Disconnect ${i.name}?`, body: 'Apps and agents using it will switch to sample data until you reconnect.', confirmLabel: 'Disconnect', danger: true })) { setConnection(i.id, null); toast(`${i.name} disconnected`); } }}>Disconnect<//>`
            : html`<span class="t-xs t-faint grow">${i.auth === 'none' ? 'No sign-in needed' : i.auth === 'oauth' ? 'Sign in with ' + i.name : 'Uses an API key'}</span><${Button} size="sm" variant="secondary" icon="plug" onClick=${async () => { if (await openConnectSheet(i.id)) toast(`${i.name} connected`, { tone: 'success' }); }}>Connect<//>`}
        </div>
      </div>`;
    })}</div>` : html`<${Empty} icon="plug" title="No apps match" body="Can’t find it? Add it as an MCP server or a webhook." />`}
  </div>`;
}

function AddMcp({ close, preset }) {
  const [name, setName] = useState(preset?.name || '');
  const [url, setUrl] = useState(preset?.url || '');
  const [auth, setAuth] = useState(preset?.auth || 'none');
  const [busy, setBusy] = useState(false);
  const valid = name.trim() && /^https:\/\/\S+\.\S+/.test(url.trim());
  const save = async () => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    addMcpServer({ id: preset?.id || `mcp_${slugify(name)}_${uid().slice(-4)}`, name: name.trim(), url: url.trim(), auth });
    toast(`${name} added — ${auth === 'none' ? 'ready to use' : 'you’ll approve access the first time an agent uses it'}`, { tone: 'success' });
    close(true);
  };
  return html`<${Modal} title=${preset ? `Add ${preset.name}` : 'Add a custom MCP server'} subtitle="Give your agents new tools from any Model Context Protocol server." icon="server" onClose=${() => close(false)}
    footer=${html`<${Button} variant="ghost" onClick=${() => close(false)}>Cancel<//><${Button} variant="primary" disabled=${!valid} loading=${busy} onClick=${save}>Add server<//>`}>
    <div class="col gap-12">
      <${Input} label="Name" placeholder="e.g. Internal docs" value=${name} onValue=${setName} />
      <${Input} label="Server URL" placeholder="https://mcp.example.com/mcp" value=${url} onValue=${setUrl} error=${url && !/^https:\/\//.test(url) ? 'Use an https:// URL' : null} />
      <div class="col gap-6"><span class="field__label">Authentication</span><${Segmented} options=${[{ value: 'none', label: 'None' }, { value: 'oauth', label: 'OAuth' }, { value: 'apikey', label: 'API key' }]} value=${auth} onChange=${setAuth} /></div>
      ${auth === 'apikey' ? html`<${Callout} icon="lock">You’ll enter the key in a secure sheet the first time it’s used. It’s stored as a secret, never in your project files.<//>` : null}
      <div class="t-xs t-faint row gap-4"><${Icon} name="flask" size=${12} />Prototype: the connection is simulated.</div>
    </div>
  <//>`;
}

function Mcp() {
  const mine = connections.value.mcp || [];
  const added = new Set(mine.map((m) => m.id));
  return html`<div class="col gap-24">
    <section>
      <div class="row mb-12"><h2 class="t-md t-strong grow">Your MCP servers</h2><${Button} size="sm" variant="primary" icon="plus" onClick=${() => openModal(AddMcp, {})}>Add custom server<//></div>
      ${mine.length ? html`<div class="ap-list">${mine.map((m) => html`<div class="ap-list__row">
        <span class="ap-mcp-icon"><${Icon} name="server" size=${16} /></span>
        <div class="grow col gap-2" style="min-width:0"><span class="t-strong">${m.name}</span><span class="t-xs t-faint t-mono t-truncate">${m.url}</span></div>
        <${Badge} size="sm">${m.auth === 'none' ? 'No auth' : m.auth === 'oauth' ? 'OAuth' : 'API key'}<//>
        <${StatusPill} status=${m.status === 'error' ? 'error' : 'connected'} size="sm" />
        <${Button} size="sm" variant="ghost" icon="trash" onClick=${() => { removeMcpServer(m.id); toast(`${m.name} removed`, { action: { label: 'Undo', onClick: () => addMcpServer(m) } }); }}>Remove<//>
      </div>`)}</div>` : html`<${Empty} icon="server" title="No MCP servers yet" body="Add one from the directory below or paste any server URL." />`}
    </section>
    <section>
      <h2 class="t-md t-strong mb-12">Directory</h2>
      <div class="ap-grid-3">${MCP_SERVERS.map((s) => html`<div class="ap-conn">
        <div class="row gap-8"><span class="ap-mcp-icon"><${Icon} name="server" size=${16} /></span><span class="t-strong grow">${s.name}</span>${added.has(s.id) ? html`<${StatusPill} status="connected" size="sm" />` : null}</div>
        <p class="t-sm t-muted">${s.desc}</p>
        <div class="row gap-8 mt-auto"><span class="t-xs t-faint t-mono grow t-truncate">${s.url.replace('https://', '')}</span>${added.has(s.id) ? null : html`<${Button} size="sm" icon="plus" onClick=${() => openModal(AddMcp, { preset: s })}>Add<//>`}</div>
      </div>`)}</div>
    </section>
  </div>`;
}

function KeyModal({ close, provider }) {
  const [key, setKey] = useState('');
  const ok = key.trim().length >= 12;
  return html`<${Modal} title=${`Use your own ${provider.name} key`} icon="key" size="sm" onClose=${() => close(false)}
    footer=${html`<${Button} variant="ghost" onClick=${() => close(false)}>Cancel<//><${Button} variant="primary" disabled=${!ok} onClick=${() => { setModelKey(provider.id, { last4: key.trim().slice(-4) }); toast(`${provider.name} key saved`, { tone: 'success' }); close(true); }}>Save key<//>`}>
    <div class="col gap-12">
      <${Input} label="API key" type="password" autocomplete="off" placeholder=${provider.hint} value=${key} onValue=${setKey} />
      <${Callout} tone="amber" icon="flask"><b>Prototype:</b> only the last 4 characters are kept to show which key is active. The key itself is discarded, never stored or sent.<//>
    </div>
  <//>`;
}

function Keys() {
  const keys = connections.value.keys || {};
  return html`<div class="col gap-12">
    <${Callout} tone="blueprint" icon="info">By default Architect’s managed models are used and billed in credits. Add your own key to bill model usage to your provider account instead.<//>
    <div class="ap-list">${PROVIDERS.map((p) => {
      const k = keys[p.id];
      return html`<div class="ap-list__row">
        <span class="ap-mcp-icon"><${Icon} name="key" size=${16} /></span>
        <div class="grow col gap-2"><span class="t-strong">${p.name}</span><span class="t-xs t-faint">${k ? html`Key ending <span class="t-mono">••••${k.last4}</span> · added ${timeAgo(k.addedAt)}` : 'Using Architect credits'}</span></div>
        ${k ? html`<${StatusPill} status="connected" size="sm" /><${Button} size="sm" variant="ghost" onClick=${() => { setModelKey(p.id, null); toast(`${p.name} key removed`); }}>Remove<//>`
          : html`<${Button} size="sm" icon="plus" onClick=${() => openModal(KeyModal, { provider: p })}>Add key<//>`}
      </div>`;
    })}</div>
  </div>`;
}

function GitHub() {
  const a = githubAccount.value;
  const [busy, setBusy] = useState(false);
  return html`<div class="ap-conn ap-conn--wide">
    <div class="row gap-12">
      ${a.connected ? html`<${Avatar} name=${a.name || a.login} src=${a.avatar} />` : html`<span class="ap-mcp-icon"><${Icon} name="github" size=${18} /></span>`}
      <div class="grow col gap-2"><span class="t-strong">${a.connected ? `@${a.login}` : 'GitHub'}</span><span class="t-xs t-faint">${a.connected ? (a.real ? 'Connected with OAuth' : 'Demo account · sample repositories') : 'Import repos, push code and open pull requests'}</span></div>
      ${a.connected ? html`<${StatusPill} status="connected" size="sm" />` : null}
    </div>
    <ul class="ap-bullets t-sm t-muted"><li>Import any repository and keep working on it</li><li>Every change lands on a branch with a pull request</li><li>Your code is always yours — export or push anytime</li></ul>
    <div class="row gap-8">
      ${a.connected ? html`<${Button} icon="upload" href="/start/import?source=github">Import a repo<//><span class="grow"></span><${Button} variant="ghost" onClick=${() => { disconnectGitHub(); toast('GitHub disconnected'); }}>Disconnect<//>`
        : html`<${Button} variant="ink" icon="github" loading=${busy} onClick=${async () => { setBusy(true); try { await connectGitHub(); toast('GitHub connected', { tone: 'success' }); } catch (e) { toast(e.message || 'Couldn’t connect', { tone: 'error' }); } setBusy(false); }}>Connect GitHub<//>`}
    </div>
    ${!isRealGitHub() && !a.real ? html`<div class="t-xs t-faint row gap-4"><${Icon} name="flask" size=${12} />Prototype: demo mode uses a simulated GitHub account.</div>` : null}
  </div>`;
}

export default function Connections({ params }) {
  const tab = ['apps', 'mcp', 'keys', 'github'].includes(params?.tab) ? params.tab : 'apps';
  const c = connections.value;
  return html`<${AppPage}>
    <${PageHeader} title="Connections" subtitle="Connect once, use in every app and agent. You approve exactly what each one can do." />
    <${Tabs} class="mb-16" value=${tab} tabs=${[
      { id: 'apps', label: 'Apps', icon: 'plug', href: '/connections/apps', count: Object.keys(c.integrations).length || null },
      { id: 'mcp', label: 'MCP servers', icon: 'server', href: '/connections/mcp', count: c.mcp?.length || null },
      { id: 'keys', label: 'Model keys', icon: 'key', href: '/connections/keys' },
      { id: 'github', label: 'GitHub', icon: 'github', href: '/connections/github' },
    ]} />
    ${tab === 'apps' ? html`<${Apps} />` : tab === 'mcp' ? html`<${Mcp} />` : tab === 'keys' ? html`<${Keys} />` : html`<${GitHub} />`}
  <//>`;
}
