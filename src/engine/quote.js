// Honest, itemised quotes. Every number is derived from the plan's actual size
// (tables, agents, screens, components, integrations, promises) and the model tier.
import { MODEL_TIERS, integrationById } from './catalog.js';

const tierOf = (id) => MODEL_TIERS.find((t) => t.id === id) || MODEL_TIERS.find((t) => t.id === 'balanced') || { id: 'balanced', multiplier: 1 };
const r1 = (x) => Math.max(1, Math.round(x));
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

/** Credit multiplier for a project's (or explicit) model tier. */
export function tierMultiplier(project, tier) {
  return tierOf(tier || project?.settings?.modelTier || 'balanced').multiplier;
}

/**
 * Itemised build quote for a planned project.
 * @returns {import('./schema.js').Quote}
 */
export function estimateQuote(project, { modelTier } = {}) {
  const p = project || {};
  const tier = tierOf(modelTier || p.settings?.modelTier || p.plan?.quote?.modelTier || 'balanced');
  const mult = tier.multiplier;
  const tables = p.data?.tables || [], agents = p.agents || [], screens = p.screens || [];
  const blocks = screens.reduce((s, x) => s + (x.blocks?.length || 0), 0);
  const ints = p.integrations || [];
  const active = (p.plan?.promises || []).filter((x) => x.status !== 'deferred');
  const mgr = agents.filter((a) => a.kind === 'manager').length, workers = agents.length - mgr;

  const lines = [];
  const add = (label, lo, hi) => {
    if (hi <= 0) return;
    const a = r1(lo * mult), b = Math.max(a, r1(hi * mult));
    lines.push({ label, credits: [a, b] });
  };
  add('Plan, data model & auth', 2 + tables.length, 3 + tables.length);
  if (agents.length) add(`${plural(agents.length, 'agent')}${mgr ? ` (manager + ${plural(workers, 'specialist')})` : ''}`, agents.length * 4.5, agents.length * 6.2);
  if (screens.length) add(`${plural(screens.length, 'screen')}, ${plural(blocks, 'component')}`, screens.length * 2 + blocks * 0.35, screens.length * 2.6 + blocks * 0.5);
  if (ints.length) {
    const names = ints.map((i) => integrationById(i.id || i).name);
    add(`Connect ${names.slice(0, 3).join(', ')}${names.length > 3 ? ` +${names.length - 3}` : ''}`, ints.length * 0.6, ints.length);
  }
  add('Tests & promise verification', Math.max(1, active.length) * 0.6, Math.max(1, active.length) * 0.8);

  const credits = [lines.reduce((s, l) => s + l.credits[0], 0), lines.reduce((s, l) => s + l.credits[1], 0)];
  const speed = tier.id === 'best' ? 1.3 : tier.id === 'fast' ? 0.8 : 1;
  const base = [credits[0] / mult, credits[1] / mult];
  const minutes = [Math.max(2, Math.round((base[0] / 4) * speed)), Math.max(3, Math.round((base[1] / 3.4) * speed))];
  if (minutes[1] <= minutes[0]) minutes[1] = minutes[0] + 1;
  return { credits, minutes, cap: Math.ceil(credits[1] * 1.05), modelTier: tier.id, lines };
}

/** Quote for a single edit/iteration. */
export function estimateEdit(project, intent = {}) {
  const tier = project?.settings?.modelTier || 'balanced';
  if (intent?.kind === 'question') return { credits: [0, 0], minutes: [0, 1], modelTier: tier };
  const base = intent?.credits || [1, 3];
  const touches = (intent?.touches || []).length;
  const credits = [Math.max(0.5, Math.round(base[0] * 10) / 10), Math.max(1, Math.round(base[1] * 10) / 10)];
  return { credits, minutes: [1, Math.max(2, 1 + Math.ceil(touches / 2))], modelTier: tier };
}
