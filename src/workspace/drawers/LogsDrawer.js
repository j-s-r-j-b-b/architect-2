// Logs: build/run logs and agent traces (from the agent_runs table), filterable by level.
import { html, useState } from '../../lib/html.js';
import { projects } from '../../lib/store.js';
import { Drawer, Icon, Badge, Segmented, Empty, CopyButton } from '../../ui/index.js';
import { cx, fmtTime, timeAgo, fmtNumber, fmtMoney } from '../../lib/util.js';
import { tableById } from '../../engine/schema.js';
import { askArchitect } from '../bus.js';

const LEVELS = [{ value: 'all', label: 'All' }, { value: 'info', label: 'Info' }, { value: 'warn', label: 'Warnings' }, { value: 'error', label: 'Errors' }];
const lvl = (l) => (l === 'success' ? 'info' : l || 'info');

export function LogsDrawer({ close, projectId }) {
  const p = projects.value[projectId];
  const [src, setSrc] = useState('run');
  const [level, setLevel] = useState('all');
  if (!p) return null;
  const b = p.build;
  const logs = (b?.logs || []).slice().reverse();
  const runsTable = tableById(p, 'agent_runs') || p.data.tables.find((t) => /run|trace|log/i.test(t.id));
  const traces = (runsTable?.rows || []).slice().sort((a, x) => (x.at || 0) - (a.at || 0));
  const shownLogs = logs.filter((l) => level === 'all' || lvl(l.level) === level);
  const errors = logs.filter((l) => l.level === 'error').length;
  const text = () => logs.slice().reverse().map((l) => `${new Date(l.at).toISOString()} [${l.level}] ${l.text}`).join('\n');

  return html`<${Drawer} title="Logs" icon="terminal" onClose=${close} wide actions=${src === 'run' && logs.length ? html`<${CopyButton} text=${text} label="Copy logs" />` : null}>
    <div class="ws-logs">
      <div class="row gap-8 wrap">
        <${Segmented} size="sm" value=${src} onChange=${setSrc} options=${[{ value: 'run', label: 'Build & runs', icon: 'terminal' }, { value: 'agents', label: 'Agent traces', icon: 'bot' }, { value: 'history', label: 'Run history', icon: 'history' }]} />
        ${src === 'run' ? html`<${Segmented} size="sm" value=${level} onChange=${setLevel} options=${LEVELS} />` : null}
      </div>

      ${src === 'run' ? html`
        ${b ? html`<div class="ws-logs__head">
          <b class="t-sm">${b.kind === 'build' ? 'Build' : b.kind === 'fix' ? 'Fix' : 'Edit'} · ${b.label}</b>
          <${Badge} size="sm" tone=${b.status === 'running' ? 'amber' : b.status === 'done' ? 'green' : b.status === 'error' ? 'red' : 'neutral'}>${b.status}<//>
          ${errors ? html`<${Badge} size="sm" tone="red">${errors} error${errors === 1 ? '' : 's'}<//>` : null}
          <span class="grow"></span><span class="t-xs t-faint t-mono">${b.runId}</span>
        </div>` : null}
        ${shownLogs.length ? html`<ol class="ws-log">${shownLogs.map((l) => html`<li class=${cx('ws-log__line', `is-${l.level || 'info'}`)}>
          <span class="ws-log__t">${fmtTime(l.at)}</span><span class="ws-log__l">${(l.level || 'info').slice(0, 4)}</span><span class="ws-log__m">${l.text}</span>
          ${l.level === 'error' ? html`<button type="button" class="ws-linkbtn is-ai" onClick=${() => { askArchitect(`Look into this error: ${l.text}`, { kind: 'error', id: String(l.at), label: 'Build error' }); close(); }}>Ask</button>` : null}
        </li>`)}</ol>` : html`<${Empty} icon="terminal" title=${b ? 'No lines at this level' : 'No runs yet'} body=${b ? 'Try another filter.' : 'Build and edit logs appear here while a run is going, and stay until the next one.'} />`}
      ` : null}

      ${src === 'agents' ? html`
        ${runsTable ? html`<div class="ws-logs__head"><b class="t-sm">${runsTable.name}</b><${Badge} size="sm" tone=${runsTable.source === 'live' ? 'green' : runsTable.source === 'test' ? 'violet' : 'amber'}>${runsTable.source === 'live' ? 'Live' : runsTable.source === 'test' ? 'Test data' : 'Sample data'}<//></div>` : null}
        ${traces.length ? html`<ol class="ws-traces">${traces.map((r) => html`<li class="ws-trace">
          <div class="row gap-6"><span class="ws-trace__agent"><${Icon} name="bot" size=${12} />${r.agent || 'Agent'}</span><b class="t-sm grow t-truncate">${r.action || r.title || 'Run'}</b><span class="t-xs t-faint">${r.at ? timeAgo(r.at) : ''}</span></div>
          ${r.detail ? html`<div class="ws-trace__steps t-mono">${String(r.detail).split(/\s*(?:→|·)\s*/).map((s, i) => html`${i ? html`<${Icon} name="chevron-right" size=${10} />` : null}<span>${s}</span>`)}</div>` : null}
          ${r.cost != null ? html`<div class="t-xs t-faint">Cost ${fmtMoney(r.cost)}</div>` : null}
        </li>`)}</ol>` : html`<${Empty} icon="bot" title="No agent runs yet" body="When agents run — from the app, a schedule or a webhook — each run’s steps and cost show up here." />`}
      ` : null}

      ${src === 'history' ? html`
        ${(p.runs || []).length ? html`<ol class="ws-runs">${p.runs.slice().reverse().map((r) => html`<li class="ws-runrow">
          <span class=${cx('ws-runrow__k', `is-${r.kind}`)}>${r.kind}</span>
          <div class="grow" style="min-width:0"><b class="t-sm t-truncate">${r.label}</b><div class="t-xs t-faint">${timeAgo(r.endedAt || r.startedAt)} · ${r.steps || '—'} steps${r.freeFixes ? ` · ${r.freeFixes} free fix` : ''}</div></div>
          <span class="t-sm t-tabular">${fmtNumber(r.credits)} cr${r.quoted ? html`<span class="t-xs t-faint"> / ${r.quoted[0]}–${r.quoted[1]}</span>` : null}</span>
          <${Badge} size="sm" tone=${r.status === 'done' ? 'green' : r.status === 'error' ? 'red' : 'neutral'}>${r.status}<//>
        </li>`)}</ol>` : html`<${Empty} icon="history" title="No runs yet" body="Every build and edit is listed here with its cost against the quote." />`}
      ` : null}
    </div>
  <//>`;
}
