// Shared launch helpers: one-click fixes for readiness checks, check rows, deploy pipeline.
import { html, useState, useRef, useEffect } from '../../lib/html.js';
import { getProject, updateProject, logActivity } from '../../lib/store.js';
import { navigate } from '../../lib/router.js';
import { Button, Icon, Badge, toast } from '../../ui/index.js';
import { openConnectSheet, openSecretSheet } from '../../shells/ConnectSheet.js';
import { cx, sleep } from '../../lib/util.js';

export const GROUPS = ['Data', 'Secrets', 'Security', 'Agents', 'Quality', 'Budget'];
export const GROUP_ICON = { Data: 'database', Secrets: 'key', Security: 'shield-check', Agents: 'bot', Quality: 'badge-check', Budget: 'coins' };
const ST_ICON = { pass: 'check-circle', fail: 'x-circle', warn: 'alert-triangle' };

/** Apply a check's fix. Resolves true when something changed. `onLeave` is called before navigating away. */
export async function applyFix(projectId, check, { onLeave } = {}) {
  const f = check.fix || {};
  const p = getProject(projectId);
  switch (f.kind) {
    case 'connect': return openConnectSheet(f.id, { projectId });
    case 'secret': return openSecretSheet({ projectId, key: f.key, hint: 'Production value — stored encrypted, never shown again.' });
    case 'protect':
      updateProject(projectId, (d) => { d.settings.authRequired = true; if (!d.settings.access || d.settings.access === 'public') d.settings.access = 'team'; });
      logActivity(projectId, { plain: 'Turned on sign-in: only your team can open the app.', technical: 'settings.authRequired = true', kind: 'settings' });
      toast('Sign-in is now required', { tone: 'success' });
      return true;
    case 'guardrails':
      updateProject(projectId, (d) => { const a = d.agents.find((x) => x.id === f.agentId); if (a) a.guardrails = { ...(a.guardrails || {}), pii: true, injection: true }; });
      toast('Guardrails turned on', { tone: 'success' });
      return true;
    case 'budget':
      updateProject(projectId, (d) => { d.settings.runtimeBudget = 50; });
      toast('Running budget set to 50 credits / month', { tone: 'success' });
      return true;
    case 'siteinfo': {
      const desc = p?.plan?.summary || `${p?.name} — built with Architect.`;
      updateProject(projectId, (d) => { d.description = desc.slice(0, 300); d.listing = { ...(d.listing || {}), short: d.listing?.short || desc.slice(0, 160) }; });
      toast('Description written — edit it any time under Listing', { tone: 'success' });
      return true;
    }
    case 'eval': onLeave && onLeave(); navigate(`/p/${projectId}/agents`); return false;
    case 'plan': onLeave && onLeave(); navigate(`/p/${projectId}/plan/spec`); return false;
    default: return false;
  }
}

export function toggleAcceptRisk(projectId, checkId) {
  updateProject(projectId, (d) => {
    const s = new Set(d.acceptedRisks || []);
    if (s.has(checkId)) s.delete(checkId); else s.add(checkId);
    d.acceptedRisks = [...s];
  });
}

/** One readiness check row with inline Fix / Accept risk. */
export function CheckRow({ projectId, check, onLeave }) {
  const [busy, setBusy] = useState(false);
  const c = check;
  const tone = c.status === 'pass' ? 'green' : c.accepted ? 'grey' : c.status === 'fail' ? 'red' : 'amber';
  return html`<div class=${cx('ln-check', `ln-check--${tone}`)}>
    <span class="ln-check__icon"><${Icon} name=${c.accepted ? 'flag' : ST_ICON[c.status]} size=${16} /></span>
    <div class="ln-check__main">
      <div class="ln-check__label">${c.label}${c.accepted ? html` <${Badge} size="sm" tone="neutral">Risk accepted<//>` : null}</div>
      <div class="ln-check__detail">${c.detail}</div>
    </div>
    <div class="ln-check__actions">
      ${c.fix && !c.accepted ? html`<${Button} size="sm" variant=${c.status === 'fail' ? 'primary' : 'secondary'} loading=${busy}
        onClick=${async () => { setBusy(true); try { await applyFix(projectId, c, { onLeave }); } finally { setBusy(false); } }}>${c.fix.label}<//>` : null}
      ${c.status !== 'pass' ? html`<button class="link t-xs ln-check__accept" onClick=${() => toggleAcceptRisk(projectId, c.id)}>${c.accepted ? 'Undo' : 'Accept risk'}</button>` : null}
    </div>
  </div>`;
}

export function CheckGroups({ projectId, readiness, onLeave, compact }) {
  return html`<div class=${cx('ln-groups', compact && 'ln-groups--compact')}>
    ${GROUPS.map((g) => {
      const list = readiness.checks.filter((c) => c.group === g);
      if (!list.length) return null;
      const bad = list.filter((c) => c.status !== 'pass' && !c.accepted).length;
      return html`<section class="ln-group" key=${g}>
        <div class="ln-group__head"><${Icon} name=${GROUP_ICON[g]} size=${14} /><span>${g}</span>
          <span class="grow"></span>${bad ? html`<${Badge} size="sm" tone=${list.some((c) => c.status === 'fail' && !c.accepted) ? 'red' : 'amber'}>${bad} to review<//>` : html`<${Badge} size="sm" tone="green" icon="check">OK<//>`}</div>
        ${list.map((c) => html`<${CheckRow} key=${c.id} projectId=${projectId} check=${c} onLeave=${onLeave} />`)}
      </section>`;
    })}
  </div>`;
}

// ---------------------------------------------------------------------------
// Deploy pipeline (streamed, ~6 s). `run` performs the real publish at "Switch traffic".
// ---------------------------------------------------------------------------
export function pipelineSteps(project, env) {
  const tables = project.data?.tables || [];
  const ps = (project.plan?.promises || []).filter((p) => p.status !== 'deferred');
  const secrets = (project.env || []).filter((e) => e.secret);
  return [
    { id: 'build', label: 'Build', logs: ['next build', `Compiled ${project.screens?.length || 0} routes and ${project.agents?.length || 0} agents`, 'Bundle size 212 kB (first load)'] },
    { id: 'tests', label: 'Tests', logs: ['npm test — promises.spec.ts', ...ps.slice(0, 4).map((p) => `✓ ${p.id} ${p.title.slice(0, 60)}`), `${ps.length} promise suites passed`] },
    { id: 'migrate', label: 'Migrate schema', logs: [`Connecting to ${env} database`, ...tables.slice(0, 4).map((t) => `CREATE TABLE IF NOT EXISTS ${t.id} … ok`), 'Migrations applied'] },
    { id: 'secrets', label: 'Secrets', logs: [`Injecting ${secrets.length} secret${secrets.length === 1 ? '' : 's'} from the vault`, 'Values are never written to logs'] },
    { id: 'health', label: 'Health check', logs: ['GET /api/health → 200 (84 ms)', 'Agents warm — first response 1.2 s'] },
    { id: 'switch', label: 'Switch traffic', logs: ['Routing 100% of traffic to the new version', 'Previous version kept for instant rollback'] },
  ];
}

export async function runPipeline(steps, { onStep, onLog, run }) {
  let result = null;
  for (let i = 0; i < steps.length; i++) {
    onStep(i, 'running');
    for (const line of steps[i].logs) { await sleep(180 + Math.random() * 160); onLog({ at: Date.now(), step: steps[i].label, text: line }); }
    if (steps[i].id === 'switch' && run) result = await run();
    await sleep(120);
    onStep(i, 'done');
  }
  return result;
}

export function PipelineView({ steps, states, logs, error }) {
  const done = states.filter((s) => s === 'done').length;
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [logs.length]);
  return html`<div class="ln-pipe">
    <div class="ln-pipe__steps">
      ${steps.map((s, i) => html`<div key=${s.id} class=${cx('ln-pipe__step', `is-${states[i] || 'pending'}`)}>
        <span class="ln-pipe__dot">${states[i] === 'done' ? html`<${Icon} name="check" size=${12} />` : states[i] === 'running' ? html`<span class="spinner spinner--sm"></span>` : i + 1}</span>
        <span>${s.label}</span>
      </div>`)}
    </div>
    <div class="ln-pipe__bar"><span style=${{ width: `${(done / steps.length) * 100}%` }}></span></div>
    <pre class="ln-pipe__log" ref=${ref}>${logs.map((l) => html`<div><span class="ln-pipe__t">${new Date(l.at).toLocaleTimeString([], { hour12: false })}</span> <span class="ln-pipe__s">[${l.step}]</span> ${l.text}</div>`)}${error ? html`<div class="ln-pipe__err">✗ ${error}</div>` : null}</pre>
  </div>`;
}
