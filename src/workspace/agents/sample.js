// Example inputs built from the agent's OWN data, so every app (not just Lead Desk) gets relevant samples.
import { tableById } from '../../engine/schema.js';

/** The table an agent works with: bound on a screen, listed as knowledge, or the project's first real table. */
export function agentTable(project, agent) {
  const ids = [];
  for (const s of project?.screens || []) for (const b of s.blocks || []) if (b.bind?.agent === agent.id && b.bind?.table) ids.push(b.bind.table);
  const tables = project?.data?.tables || [];
  return ids.map((id) => tableById(project, id)).find((t) => t?.rows?.length)
    || tables.find((t) => t.rows?.length && (agent.knowledge || []).some((k) => k.type === 'table' && k.name === t.name))
    || tables.find((t) => t.rows?.length && t.source !== 'test') || null;
}

/** "Priya Raman, Northwind Health, 420" — the most descriptive short fields of a row. */
export function rowSummary(table, row, max = 3) {
  if (!table || !row) return '';
  return table.columns
    .filter((c) => ['person', 'text', 'email', 'status', 'number', 'money'].includes(c.type) && row[c.key] != null && String(row[c.key]).length <= 48)
    .slice(0, max).map((c) => String(row[c.key])).join(', ');
}

const singular = (name = '') => name.toLowerCase().replace(/ies$/, 'y').replace(/s$/, '');

/** A realistic input for the agent, e.g. "New candidate: Ana Silva, Senior Designer, 6". */
export function sampleInputFor(project, agent, i = 0) {
  const t = agentTable(project, agent);
  const row = t?.rows?.[i % Math.max(1, t?.rows?.length || 1)];
  if (!t || !row) return 'What can you do?';
  return `New ${singular(t.name)}: ${rowSummary(t, row)}`;
}

/** A few distinct inputs (for monitoring traces and suggestions). */
export function sampleInputs(project, agent, n = 5) {
  const t = agentTable(project, agent);
  if (!t) return ['What can you do?', 'Summarise this week', 'What changed since Monday?'];
  return t.rows.slice(0, n).map((row) => `New ${singular(t.name)}: ${rowSummary(t, row, 2)}`);
}
