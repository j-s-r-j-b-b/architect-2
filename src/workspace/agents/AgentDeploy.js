// Deploy sub-tab: REST endpoint + snippets, MCP URL, A2A card, web widget, channels and a run-rate forecast.
import { html, useState } from '../../lib/html.js';
import { cx, seeded, slugify, downloadFile } from '../../lib/util.js';
import { connections } from '../../lib/store.js';
import { Button, Badge, Icon, Segmented, CodeBlock, CopyButton, Callout, Switch, Slider, Progress, toast } from '../../ui/index.js';
import { openConnectSheet } from '../../shells/ConnectSheet.js';
import { stageEdit } from './state.js';
import { sampleInputFor } from './sample.js';
import { estCostPerRun, fmtUsd, toolConnection } from './model.js';

const CHANNELS = [
  { id: 'widget', label: 'Website chat widget', icon: 'message-square', needs: null },
  { id: 'slack', label: 'Slack', icon: 'hash', needs: 'slack' },
  { id: 'teams', label: 'Microsoft Teams', icon: 'users', needs: 'teams' },
  { id: 'whatsapp', label: 'WhatsApp', icon: 'smartphone', needs: 'whatsapp' },
  { id: 'email', label: 'Email inbox', icon: 'mail', needs: null },
];

function fakeKey(agent) {
  const r = seeded(`key:${agent.id}`);
  const abc = 'abcdefghijkmnopqrstuvwxyz23456789';
  return `ak_test_${Array.from({ length: 24 }, () => abc[Math.floor(r() * abc.length)]).join('')}`;
}

function Block({ icon, title, sub, children, actions }) {
  return html`<section class="ag-dep"><header class="ag-dep__head"><span class="ag-sec__icon"><${Icon} name=${icon} size=${15} /></span><div class="grow"><h3 class="ag-sec__title">${title}</h3>${sub ? html`<div class="ag-sec__hint">${sub}</div>` : null}</div>${actions || null}</header><div class="ag-dep__body">${children}</div></section>`;
}

export function AgentDeploy({ project, agent, onPublish }) {
  const [lang, setLang] = useState('curl');
  const [reveal, setReveal] = useState(false);
  const base = 'https://api.architect.space/v1';
  const slug = (project.slug || slugify(project.name) || project.id).slice(0, 32);
  const endpoint = `${base}/agents/${agent.id}/runs`;
  const key = fakeKey(agent);
  const shown = reveal ? key : `ak_test_${'•'.repeat(12)}${key.slice(-4)}`;
  const mcpUrl = `https://mcp.architect.space/${slug}/${agent.id}`;
  const input = sampleInputFor(project, agent).replace(/"/g, "'");
  const snippets = {
    curl: `curl ${endpoint} \\\n  -H "Authorization: Bearer $ARCHITECT_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"input": "${input}", "stream": false}'`,
    js: `const res = await fetch("${endpoint}", {\n  method: "POST",\n  headers: {\n    Authorization: \`Bearer \${process.env.ARCHITECT_KEY}\`,\n    "Content-Type": "application/json",\n  },\n  body: JSON.stringify({ input: "${input}" }),\n});\nconst { output, trace_url } = await res.json();\n// output → { ${(agent.outputs || []).map((o) => o.key).join(', ') || 'answer'} }`,
    python: `import os, requests\n\nres = requests.post(\n    "${endpoint}",\n    headers={"Authorization": f"Bearer {os.environ['ARCHITECT_KEY']}"},\n    json={"input": "${input}"},\n)\noutput = res.json()["output"]  # ${(agent.outputs || []).map((o) => o.key).join(', ') || 'answer'}`,
  };
  const card = {
    name: agent.name, description: agent.role, url: `${base}/a2a/${agent.id}`, version: String(agent.version),
    provider: { organization: project.name, url: `https://${slug}.architect.app` },
    capabilities: { streaming: true, pushNotifications: true, stateTransitionHistory: true },
    authentication: { schemes: ['bearer'] },
    defaultInputModes: ['text/plain', 'application/json'], defaultOutputModes: ['application/json'],
    skills: [{ id: slugify(agent.name) || agent.id, name: agent.name, description: agent.role, tags: (agent.tools || []).map((t) => t.id), examples: [input] }],
  };
  const widget = `<script src="https://cdn.architect.space/widget.js"\n  data-agent="${agent.id}" data-project="${slug}"\n  data-color="${agent.color}" async></script>`;
  const mcpConfig = JSON.stringify({ mcpServers: { [slugify(agent.name) || 'agent']: { type: 'http', url: mcpUrl, headers: { Authorization: 'Bearer ${ARCHITECT_KEY}' } } } }, null, 2);

  const ch = agent.channels || {};
  const toggle = async (c, v) => {
    if (v && c.needs && toolConnection(project, c.needs, connections.value) === 'needed') {
      const ok = await openConnectSheet(c.needs, { projectId: project.id });
      if (!ok) return;
    }
    stageEdit(project.id, agent.id, (d) => { d.channels = { ...(d.channels || {}), [c.id]: v }; });
  };

  const est = estCostPerRun(agent);
  const defaultRate = Math.max(5, Math.round((agent.stats?.runs || 70) / 7));
  const [perDay, setPerDay] = useState(defaultRate);
  const monthly = perDay * est * 30;
  const budget = agent.limits?.monthlyBudget;
  // Log scale so 5, 50 and 500 runs a day are all easy to reach on the same slider.
  const LOGMAX = Math.log10(2000);
  const toPos = (n) => Math.round((Math.log10(Math.max(1, n)) / LOGMAX) * 100);
  const fromPos = (p) => { const v = Math.pow(10, (p / 100) * LOGMAX); return v < 20 ? Math.round(v) : v < 200 ? Math.round(v / 5) * 5 : Math.round(v / 50) * 50; };
  const pct = budget ? Math.min(100, Math.round((monthly / budget) * 100)) : 0;

  return html`<div class="ag-pane">
    <div class="ag-pane__head"><div class="grow"><h2 class="ag-pane__title">Deploy</h2><p class="t-sm t-muted">Use ${agent.name} outside this app — from your code, other agents, or the channels your team already uses.</p></div></div>
    ${agent.status !== 'live' ? html`<${Callout} tone="blueprint" icon="info" action=${html`<${Button} size="sm" variant="primary" icon="rocket" onClick=${onPublish}>Publish v${(agent.version || 1) + 1}<//>`}>This is a draft. Endpoints below answer in test mode until you publish.<//>` : html`<${Callout} tone="green" icon="check-circle">Live v${agent.liveVersion || agent.version}. Every call is traced in Monitor and stops at your limits.<//>`}
    <div class="ag-deps">
      <${Block} icon="terminal" title="REST API" sub="One POST per run. Returns the output contract as JSON.">
        <div class="ag-urlrow"><${Badge} size="sm" tone="blueprint">POST<//><code class="ag-url">${endpoint}</code><${CopyButton} text=${endpoint} /></div>
        <div class="ag-urlrow"><${Icon} name="key" size=${13} /><code class="ag-url">${shown}</code><button type="button" class="link t-xs" onClick=${() => setReveal(!reveal)}>${reveal ? 'Hide' : 'Reveal'}</button><${CopyButton} text=${key} /></div>
        <div class="t-xs t-faint">Test key · Prototype: simulated. Real keys live in Settings → API keys.</div>
        <${Segmented} size="sm" value=${lang} onChange=${setLang} options=${[{ value: 'curl', label: 'curl' }, { value: 'js', label: 'JavaScript' }, { value: 'python', label: 'Python' }]} />
        <${CodeBlock} code=${snippets[lang]} lang=${lang === 'curl' ? 'bash' : lang} />
      <//>
      <${Block} icon="server" title="MCP server" sub="Claude, Cursor and other MCP clients can call this agent as a tool.">
        <div class="ag-urlrow"><code class="ag-url">${mcpUrl}</code><${CopyButton} text=${mcpUrl} /></div>
        <${CodeBlock} code=${mcpConfig} lang="json" title="mcp.json" />
      <//>
      <${Block} icon="network" title="Agent-to-agent (A2A)" sub="Other agents discover and delegate to it with this card." actions=${html`<${Button} size="sm" variant="ghost" icon="download" onClick=${() => { downloadFile('agent-card.json', JSON.stringify(card, null, 2), 'application/json'); toast('Downloaded agent-card.json'); }}>Download<//>`}>
        <${CodeBlock} code=${JSON.stringify(card, null, 2)} lang="json" title="/.well-known/agent-card.json" maxHeight=${260} />
      <//>
      <${Block} icon="message-square" title="Website widget" sub="Paste before </body> on any site.">
        <${CodeBlock} code=${widget} lang="html" />
        <div class="ag-widget-prev" style=${{ '--ag-c': agent.color }}><span class="ag-widget-prev__bubble">Hi! I’m ${agent.name}. How can I help?</span><span class="ag-widget-prev__fab"><${Icon} name="message-square" size=${16} /></span></div>
      <//>
      <${Block} icon="send" title="Channels" sub="Turn a channel on and it answers there. Saved with your next draft.">
        <div class="col gap-10">${CHANNELS.map((c) => {
          const need = c.needs && toolConnection(project, c.needs, connections.value) === 'needed';
          return html`<div class="ag-chan"><span class="ag-row__ico"><${Icon} name=${c.icon} size=${14} /></span><span class="grow t-sm">${c.label}${need ? html` <span class="t-xs t-amber">· needs connecting</span>` : null}</span><${Switch} checked=${!!ch[c.id]} onChange=${(v) => toggle(c, v)} /></div>`;
        })}</div>
      <//>
      <${Block} icon="coins" title="Run-rate forecast" sub="What it would cost at your expected volume.">
        <div class="row gap-8"><span class="t-sm">Runs per day</span><span class="grow"></span><span class="t-mono t-strong">${perDay}</span></div>
        <${Slider} min=${0} max=${100} value=${toPos(perDay)} onChange=${(p) => setPerDay(fromPos(+p))} aria-label="Runs per day" />
        <div class="row gap-6 wrap">${[10, 100, 1000].map((n) => html`<button type="button" class=${cx('chip chip--sm', perDay === n && 'is-active')} onClick=${() => setPerDay(n)}>${n.toLocaleString()} a day</button>`)}<span class="t-xs t-faint">Scale is logarithmic — 1 to 2,000 a day</span></div>
        <div class="ag-forecast">
          <div><div class="t-xs t-faint">Per run</div><div class="t-strong t-mono">${fmtUsd(est)}</div></div>
          <span class="t-faint">×</span>
          <div><div class="t-xs t-faint">Runs / month</div><div class="t-strong t-mono">${(perDay * 30).toLocaleString()}</div></div>
          <span class="t-faint">=</span>
          <div><div class="t-xs t-faint">Monthly</div><div class=${cx('ag-forecast__total', budget && monthly > budget && 't-red')}>${fmtUsd(monthly)}</div></div>
        </div>
        ${budget ? html`<${Progress} value=${pct} tone=${monthly > budget ? 'red' : pct > 80 ? 'amber' : 'green'} /><div class="t-xs t-faint">${monthly > budget ? `Over the $${budget} monthly budget — it would pause around day ${Math.max(1, Math.floor((budget / monthly) * 30))}.` : `${pct}% of the $${budget} monthly budget.`}</div>` : html`<div class="t-xs t-amber">No monthly budget set — add one under Limits.</div>`}
      <//>
    </div>
  </div>`;
}
