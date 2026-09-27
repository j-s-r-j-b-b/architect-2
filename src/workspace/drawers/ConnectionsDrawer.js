// Connections & secrets: project integrations, environment variables per environment, MCP servers.
import { html, useState, useEffect, useRef } from '../../lib/html.js';
import { projects, connections, addMcpServer, removeMcpServer, updateProject, logActivity } from '../../lib/store.js';
import { Drawer, Modal, openModal, Button, Icon, Badge, Segmented, StatusPill, Input, Callout, Empty, toast } from '../../ui/index.js';
import { cx } from '../../lib/util.js';
import { INTEGRATIONS, INTEGRATION_CATEGORIES, MCP_SERVERS, integrationById } from '../../engine/catalog.js';
import { openConnectSheet, openSecretSheet, IntegrationTile, isConnected } from '../../shells/ConnectSheet.js';

function IntegrationPicker({ close, projectId }) {
  const p = projects.value[projectId];
  const [q, setQ] = useState('');
  const have = new Set((p?.integrations || []).map((i) => i.id));
  const list = INTEGRATIONS.filter((i) => !q || `${i.name} ${i.desc} ${i.category}`.toLowerCase().includes(q.toLowerCase()));
  const pick = async (id) => {
    close();
    const ok = await openConnectSheet(id, { projectId });
    if (ok) toast(`${integrationById(id).name} is ready for your agents`, { tone: 'success' });
  };
  return html`<${Modal} title="Connect an integration" subtitle="Agents can use it once connected. You approve what it can do." icon="plug" onClose=${close} size="lg">
    <div class="col gap-12">
      <${Input} icon="search" placeholder="Search Gmail, HubSpot, Slack…" value=${q} onValue=${setQ} autofocus />
      <div class="ws-picker">
        ${INTEGRATION_CATEGORIES.map((cat) => {
          const items = list.filter((i) => i.category === cat);
          if (!items.length) return null;
          return html`<div class="ws-picker__group"><div class="ws-dlg__label">${cat}</div>
            <div class="ws-picker__grid">${items.map((i) => html`<button type="button" class="ws-picker__item" onClick=${() => pick(i.id)}>
              <${IntegrationTile} id=${i.id} size="sm" /><span class="grow t-truncate"><b>${i.name}</b><span>${i.desc}</span></span>
              ${have.has(i.id) ? html`<${Badge} size="sm">In project<//>` : null}
            </button>`)}</div></div>`;
        })}
        ${!list.length ? html`<${Empty} icon="search" title="No match" body="Try another name — or add an MCP server for anything else." />` : null}
      </div>
    </div>
  <//>`;
}
export function openIntegrationPicker(projectId) { return openModal(IntegrationPicker, { projectId }); }

function McpDialog({ close, projectId }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const add = (s) => {
    const server = s || { id: `mcp_${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'custom'}`, name: name.trim() || 'Custom server', url: url.trim(), auth: 'none' };
    if (!s && !/^https?:\/\//.test(server.url)) { toast('Enter the server URL (https://…)', { tone: 'warn' }); return; }
    addMcpServer({ id: server.id, name: server.name, url: server.url, auth: server.auth });
    if (projectId) logActivity(projectId, { actor: 'You', kind: 'connect', plain: `Added the MCP server ${server.name}. Agents can now use its tools.`, technical: `mcp:${server.url} · auth ${server.auth}` });
    toast(`${server.name} added`, { tone: 'success' });
    close();
  };
  const mine = new Set(connections.value.mcp.map((m) => m.id));
  return html`<${Modal} title="Add an MCP server" subtitle="Give your agents the tools of any Model Context Protocol server." icon="server" onClose=${close}
    footer=${html`<${Button} variant="ghost" onClick=${close}>Cancel<//><${Button} variant="primary" icon="plus" onClick=${() => add()}>Add server<//>`}>
    <div class="col gap-12">
      <div class="ws-dlg__label">Popular</div>
      <div class="ws-mcp-list">${MCP_SERVERS.map((s) => html`<button type="button" class="ws-picker__item" disabled=${mine.has(s.id)} onClick=${() => add(s)}>
        <span class="ws-mcp-ic"><${Icon} name="server" size=${13} /></span><span class="grow t-truncate"><b>${s.name}</b><span>${s.desc}</span></span>${mine.has(s.id) ? html`<${Badge} size="sm" tone="green">Added<//>` : html`<${Icon} name="plus" size=${14} />`}
      </button>`)}</div>
      <div class="ws-dlg__label">Or your own</div>
      <${Input} label="Name" placeholder="Internal tools" value=${name} onValue=${setName} />
      <${Input} label="Server URL" placeholder="https://mcp.example.com/mcp" value=${url} onValue=${setUrl} class="t-mono" />
      <${Callout} tone="amber" icon="flask"><b>Prototype:</b> the connection is simulated — no requests leave your browser.<//>
    </div>
  <//>`;
}
export function openMcpDialog(projectId) { return openModal(McpDialog, { projectId }); }

const ENVS = [{ value: 'draft', label: 'Draft' }, { value: 'staging', label: 'Staging' }, { value: 'production', label: 'Production' }];

export function ConnectionsDrawer({ close, projectId, section }) {
  const p = projects.value[projectId];
  const [env, setEnv] = useState('draft');
  const ref = useRef(null);
  useEffect(() => {
    if (!section || !ref.current) return;
    const el = ref.current.querySelector(`[data-section="${section}"]`);
    if (el) setTimeout(() => el.scrollIntoView({ block: 'start', behavior: 'smooth' }), 60);
  }, [section]);
  if (!p) return null;
  const agentName = (id) => p.agents.find((a) => a.id === id)?.name || id;
  const mcp = connections.value.mcp;
  const needed = p.integrations.filter((i) => !isConnected(i.id, p)).length;

  return html`<${Drawer} title="Connections & secrets" icon="plug" onClose=${close}>
    <div class="ws-conn" ref=${ref}>
      <section class="ws-sec" data-section="integrations">
        <div class="ws-sec__head"><h3>Integrations</h3>${needed ? html`<${Badge} tone="amber" size="sm">${needed} to connect<//>` : p.integrations.length ? html`<${Badge} tone="green" size="sm">All connected<//>` : null}
          <span class="grow"></span><${Button} size="sm" variant="ghost" icon="plus" onClick=${() => openIntegrationPicker(projectId)}>Add<//></div>
        ${p.integrations.length ? html`<ul class="ws-rows">${p.integrations.map((i) => {
          const it = integrationById(i.id);
          const ok = isConnected(i.id, p);
          return html`<li class="ws-row">
            <${IntegrationTile} id=${i.id} />
            <div class="grow" style="min-width:0">
              <div class="row gap-6"><b class="t-sm">${it.name}</b>${i.builtIn ? html`<${Badge} size="sm">Built-in<//>` : null}</div>
              <div class="t-xs t-faint t-truncate">${(i.usedBy || []).length ? `Used by ${(i.usedBy || []).map(agentName).join(', ')}` : it.desc}</div>
            </div>
            ${ok ? html`<${StatusPill} status="connected" size="sm" />` : html`<${Button} size="sm" variant="primary" icon="plug" onClick=${() => openConnectSheet(i.id, { projectId })}>Connect<//>`}
          </li>`;
        })}</ul>` : html`<${Empty} icon="plug" title="No integrations yet" body="Connect the tools your agents should use — Gmail, HubSpot, Slack and 40+ more." action=${html`<${Button} size="sm" icon="plus" onClick=${() => openIntegrationPicker(projectId)}>Connect an integration<//>`} />`}
      </section>

      <section class="ws-sec" data-section="secrets">
        <div class="ws-sec__head"><h3>Secrets & environment variables</h3><span class="grow"></span><${Button} size="sm" variant="ghost" icon="key" onClick=${() => openSecretSheet({ projectId, envs: [env] })}>Add secret<//></div>
        <${Segmented} size="sm" full value=${env} onChange=${setEnv} options=${ENVS} />
        ${p.env.length ? html`<ul class="ws-rows ws-rows--dense">${p.env.map((e) => {
          const v = e.values?.[env];
          const set = v && (typeof v === 'object' ? v.set : true);
          const shown = !e.secret && v != null ? (typeof v === 'object' ? v.value ?? '' : v) : null;
          return html`<li class="ws-row">
            <span class="ws-env-ic"><${Icon} name=${e.secret ? 'lock' : 'sliders'} size=${13} /></span>
            <div class="grow" style="min-width:0">
              <div class="t-mono t-sm t-truncate">${e.key}</div>
              <div class="t-xs t-faint">${e.source && e.source !== 'user' ? `Managed by ${integrationById(e.source).name}` : e.secret ? 'Secret' : 'Setting'}</div>
            </div>
            ${set ? html`<span class="ws-masked t-mono">${shown != null ? shown : `••••${typeof v === 'object' && v.last4 && v.last4 !== 'auto' ? v.last4 : '••••'}`}</span>`
              : html`<${Button} size="sm" variant="secondary" onClick=${() => (e.source && e.source !== 'user' ? openConnectSheet(e.source, { projectId }) : openSecretSheet({ projectId, key: e.key, envs: [env] }))}>${e.source && e.source !== 'user' ? 'Connect' : 'Set'}<//>`}
          </li>`;
        })}</ul>` : html`<p class="t-sm t-muted">No environment variables yet.</p>`}
        <p class="ws-fine"><${Icon} name="shield-check" size=${12} /> Values are encrypted. Agents can use secrets but never read them; only the last 4 characters are shown.</p>
      </section>

      <section class="ws-sec" data-section="mcp">
        <div class="ws-sec__head"><h3>MCP servers</h3><span class="grow"></span><${Button} size="sm" variant="ghost" icon="plus" onClick=${() => openMcpDialog(projectId)}>Add server<//></div>
        ${mcp.length ? html`<ul class="ws-rows">${mcp.map((m) => html`<li class="ws-row">
          <span class="ws-mcp-ic"><${Icon} name="server" size=${13} /></span>
          <div class="grow" style="min-width:0"><b class="t-sm">${m.name}</b><div class="t-xs t-faint t-mono t-truncate">${m.url}</div></div>
          <${StatusPill} status=${m.status === 'error' ? 'error' : 'connected'} size="sm" />
          <button type="button" class="icon-btn icon-btn--sm" aria-label=${`Remove ${m.name}`} data-tip="Remove" onClick=${() => removeMcpServer(m.id)}><${Icon} name="x" size=${14} /></button>
        </li>`)}</ul>` : html`<p class="t-sm t-muted">Add any Model Context Protocol server to give agents more tools — DeepWiki, Stripe, Linear, Sentry…</p>`}
      </section>
    </div>
  <//>`;
}

export { cx as _cx, updateProject as _up };
