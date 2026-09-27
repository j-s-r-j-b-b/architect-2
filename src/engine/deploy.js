// Launch readiness + publishing. Publishing is REAL: the app is written to the
// published store and served by this site at /a/:slug.
import { APP } from '../config.js';
import { getProject, updateProject, addCheckpoint, logActivity, pushInbox, spend, session } from '../lib/store.js';
import { publishApp } from '../lib/db.js';
import { uid, deepClone } from '../lib/util.js';
import { promiseStats } from './schema.js';
import { integrationById } from './catalog.js';

export const DEPLOY_CREDITS = 0.5;
export const ENV_LABEL = { draft: 'Draft', staging: 'Staging', production: 'Production' };
const intName = (id) => { try { return integrationById(id)?.name || id; } catch { return id; } };

/**
 * Launch readiness: checks that FIX problems, not just flag them.
 * @returns {{score:number, total:number, checks:{id:string, group:string, label:string, status:'pass'|'fail'|'warn', detail:string, fix?:{label:string, kind:string}}[]}}
 */
export function computeReadiness(project) {
  const checks = [];
  if (!project) return { score: 0, total: 0, checks, blocking: [] };
  const add = (c) => checks.push(c);
  const tables = project.data?.tables || [];
  const accepted = new Set(project.acceptedRisks || []);

  // Data
  const connected = tables.filter((t) => t.connection);
  for (const t of connected) {
    const live = t.source === 'live';
    add({ id: `data:${t.id}`, group: 'Data', label: `${t.name} uses live data`, status: live ? 'pass' : 'fail',
      detail: live ? `Reads real records from ${intName(t.connection)}.` : `Still showing sample rows. Connect ${intName(t.connection)} so production shows real records.`,
      fix: live ? undefined : { label: `Connect ${intName(t.connection)}`, kind: 'connect', id: t.connection } });
  }
  if (!connected.length) add({ id: 'data:store', group: 'Data', label: 'Database ready', status: 'pass', detail: `${tables.length} table${tables.length === 1 ? '' : 's'} will be created in the production database.` });

  // Secrets
  const secrets = (project.env || []).filter((e) => e.secret);
  for (const e of secrets) {
    const ok = !!e.values?.production;
    add({ id: `secret:${e.key}`, group: 'Secrets', label: `${e.key} set for production`, status: ok ? 'pass' : 'fail',
      detail: ok ? 'Stored encrypted in the vault.' : 'Missing in Production — anything that needs it will fail.',
      fix: ok ? undefined : { label: 'Add secret', kind: 'secret', key: e.key } });
  }
  if (!secrets.length) add({ id: 'secret:none', group: 'Secrets', label: 'No secrets needed', status: 'pass', detail: 'Nothing to configure.' });

  // Security
  const pii = tables.some((t) => (t.columns || []).some((c) => c.type === 'email' || c.type === 'person'));
  const authed = !!project.settings?.authRequired;
  add({ id: 'sec:auth', group: 'Security', label: 'Sign-in required', status: authed ? 'pass' : pii ? 'fail' : 'warn',
    detail: authed ? 'Only signed-in people can open the app.' : pii ? 'Your tables hold emails or names, but anyone with the link could see them.' : 'Anyone with the link can open the app.',
    fix: authed ? undefined : { label: 'Require sign-in', kind: 'protect' } });

  // Agents
  for (const a of project.agents || []) {
    if ((a.tools || []).length) {
      const g = a.guardrails || {};
      const ok = g.pii && g.injection;
      add({ id: `agent:guard:${a.id}`, group: 'Agents', label: `${a.name} has guardrails`, status: ok ? 'pass' : 'fail',
        detail: ok ? `PII and prompt-injection protection on for ${a.tools.length} external tool${a.tools.length === 1 ? '' : 's'}.` : 'Uses external tools without PII / prompt-injection protection.',
        fix: ok ? undefined : { label: 'Turn on guardrails', kind: 'guardrails', agentId: a.id } });
    }
    const s = a.evalScore;
    add({ id: `agent:eval:${a.id}`, group: 'Agents', label: `${a.name} passes evals`, status: s != null && s >= 0.8 ? 'pass' : 'warn',
      detail: s == null ? 'Not evaluated yet.' : `Eval score ${Math.round(s * 100)}% (target 80%).`,
      fix: s != null && s >= 0.8 ? undefined : { label: 'Open evals', kind: 'eval', agentId: a.id } });
  }

  // Quality
  const st = promiseStats(project);
  const allOk = st.total > 0 && st.verified === st.total;
  add({ id: 'q:promises', group: 'Quality', label: 'Every promise verified', status: allOk ? 'pass' : 'fail',
    detail: st.total ? `${st.verified} of ${st.total} promises verified${st.failed ? ` · ${st.failed} failing` : ''}${st.deferred ? ` · ${st.deferred} deferred` : ''}.` : 'No promises in the plan yet.',
    fix: allOk ? undefined : { label: 'Open plan', kind: 'plan' } });
  const hasInfo = !!(project.description || project.listing?.short);
  add({ id: 'q:site', group: 'Quality', label: 'Site title & description', status: hasInfo ? 'pass' : 'warn',
    detail: hasInfo ? 'Shown in browser tabs, link previews and search.' : 'Link previews will show a blank description.',
    fix: hasInfo ? undefined : { label: 'Write it for me', kind: 'siteinfo' } });

  // Budget
  const agents = project.agents || [];
  const budget = project.settings?.runtimeBudget || (agents.length && agents.every((a) => a.limits?.monthlyBudget) ? agents.reduce((s, a) => s + a.limits.monthlyBudget, 0) : 0);
  add({ id: 'budget:runtime', group: 'Budget', label: 'Monthly running budget set', status: budget || !agents.length ? 'pass' : 'warn',
    detail: budget ? `Agents stop and ask when they reach ${budget} credits a month.` : agents.length ? 'Agents could spend without a ceiling.' : 'No agents — nothing to cap.',
    fix: budget || !agents.length ? undefined : { label: 'Set 50 cr / month', kind: 'budget' } });

  for (const c of checks) c.accepted = c.status !== 'pass' && accepted.has(c.id);
  const score = checks.filter((c) => c.status === 'pass').length;
  const blocking = checks.filter((c) => c.status === 'fail' && !c.accepted);
  return { score, total: checks.length, checks, blocking };
}

/** Public URL of a project's deployment (served by this site at /a/:slug). */
export function liveUrl(project, env = 'production') {
  if (!project) return '';
  return `${APP.publicBase}/a/${publishSlug(project, env)}`;
}
export const publishSlug = (project, env = 'production') => (env === 'staging' ? `${project.slug}--staging` : project.slug);

function stripBuild(screens = []) {
  return deepClone(screens).map((s) => ({ ...s, blocks: (s.blocks || []).map((b) => { const { buildState, ...rest } = b; return rest; }) }));
}

/** Build the payload served at /a/:slug from a project (or a checkpoint-merged project). */
export function publishPayload(p, { version, env, access }) {
  return {
    name: p.name, description: p.description || p.listing?.short || '', icon: p.icon, color: p.color,
    theme: deepClone(p.theme), screens: stripBuild(p.screens), data: deepClone(p.data),
    agents: deepClone((p.agents || []).map(({ buildState, ...a }) => a)),
    slug: publishSlug(p, env), ownerId: p.ownerId, projectId: p.id, version, env, access: access || 'public', publishedAt: Date.now(),
  };
}

/**
 * Publish the current draft (or a checkpoint snapshot) to an environment.
 * opts: { env:'staging'|'production', access, marketplace, listing, domain, analytics, fromCheckpoint, note }
 * Resolves with the deployment record.
 */
export async function publish(projectId, opts = {}) {
  const p0 = getProject(projectId);
  if (!p0) throw new Error('Project not found');
  const env = opts.env || 'production';
  const cpSrc = opts.fromCheckpoint ? p0.checkpoints.find((c) => c.id === opts.fromCheckpoint) : null;
  const src = cpSrc ? { ...p0, ...deepClone(cpSrc.snapshot) } : p0;
  const version = Math.max(0, ...(p0.deployments || []).map((d) => d.version || 0)) + 1;
  const access = opts.access || p0.settings?.access || 'public';
  await publishApp(publishSlug(p0, env), publishPayload(src, { version, env, access }));

  const cp = addCheckpoint(projectId, { label: `${cpSrc ? 'Rolled back' : 'Published'} v${version} to ${ENV_LABEL[env]}`, summary: cpSrc ? `Republished “${cpSrc.label}”` : (opts.note || 'Launch'), kind: 'publish' });
  const tx = spend(DEPLOY_CREDITS, { projectId, phase: 'deploy', label: `Deploy v${version} · ${ENV_LABEL[env]}` });
  const me = session.value;
  const dep = {
    id: uid('dep'), version, env, at: Date.now(), by: me?.name || 'You', url: liveUrl(p0, env), status: 'live',
    checkpointId: cp?.id || null, rollbackOf: cpSrc?.id || null, access, credits: tx.amount,
    note: opts.note || (cpSrc ? `Rollback to “${cpSrc.label}”` : ''), durationMs: opts.durationMs || 6200,
    stats: { screens: src.screens?.length || 0, agents: src.agents?.length || 0, tables: src.data?.tables?.length || 0 },
  };
  updateProject(projectId, (d) => {
    d.deployments = d.deployments || [];
    for (const x of d.deployments) if (x.env === env && x.status === 'live') x.status = 'superseded';
    d.deployments.unshift(dep);
    d.deployments = d.deployments.slice(0, 50);
    d.environments = d.environments || { draft: { version: 0 } };
    d.environments[env] = { version, url: dep.url, at: dep.at, deploymentId: dep.id, checkpointId: dep.checkpointId, access };
    d.settings = { ...d.settings, access, authRequired: access !== 'public' };
    if (opts.listing || opts.marketplace != null) d.listing = { ...(d.listing || {}), ...(opts.listing || {}), marketplace: !!opts.marketplace };
    if (opts.analytics != null) d.analyticsEnabled = !!opts.analytics;
    if (opts.domain && !d.domain) d.domain = { name: opts.domain, status: 'pending', addedAt: Date.now() };
    if (env === 'production') {
      d.status = 'live';
      for (const pr of d.plan?.promises || []) if (pr.status === 'verified') pr.status = 'live';
    }
  });
  logActivity(projectId, { plain: `${cpSrc ? 'Rolled back' : 'Published'} v${version} to ${ENV_LABEL[env]} — ${dep.url}`, technical: `deploy ${dep.id} · slug ${publishSlug(p0, env)} · access ${access} · ${tx.amount} cr`, kind: 'deploy' });
  pushInbox({ kind: 'ready', title: `${p0.name} is live on ${ENV_LABEL[env]}`, body: `Version ${version} · ${dep.url.replace(/^https?:\/\//, '')}`, projectId, href: `/p/${projectId}/launch/deploys` });
  return dep;
}
