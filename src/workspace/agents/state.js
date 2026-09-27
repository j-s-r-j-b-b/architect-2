// Staged edits: every change on an agent is held here until "Save as draft" or "Publish".
// Kept in a module signal (not component state) so switching sub-tabs, opening the Try-it
// drawer or visiting another tab never loses unsaved work.
import { signal } from '../../lib/html.js';
import { updateProject, getProject, addCheckpoint, logActivity } from '../../lib/store.js';
import { deepClone, uid } from '../../lib/util.js';
import { toast } from '../../ui/index.js';
import { EDITABLE_KEYS, diffAgents, normalizeAgent, AGENT_COLORS } from './model.js';

/** `${projectId}:${agentId}` → partial agent (only edited top-level keys) */
export const staged = signal({});
const k = (pid, aid) => `${pid}:${aid}`;

export function getPatch(pid, aid) { return staged.value[k(pid, aid)] || null; }
export function hasStaged(pid, aid) { const p = getPatch(pid, aid); return !!(p && Object.keys(p).length); }

/** The agent as the person currently sees it: saved + staged. */
export function effectiveAgent(project, aid) {
  const saved = project?.agents?.find((a) => a.id === aid);
  if (!saved) return null;
  const patch = getPatch(project.id, aid);
  return normalizeAgent(patch ? { ...saved, ...patch } : saved);
}

function setPatch(pid, aid, patch) {
  const next = { ...staged.value };
  if (patch && Object.keys(patch).length) next[k(pid, aid)] = patch; else delete next[k(pid, aid)];
  staged.value = next;
}

/**
 * Stage a change. `fn(draft)` mutates a clone of the effective agent; only keys that now
 * differ from the saved agent are kept, so undoing an edit by hand clears it.
 */
export function stageEdit(pid, aid, fn) {
  const project = getProject(pid);
  const saved = project?.agents?.find((a) => a.id === aid);
  if (!saved) return;
  const draft = deepClone(effectiveAgent(project, aid));
  const r = fn(draft);
  const next = r && typeof r === 'object' ? r : draft;
  const base = normalizeAgent(saved);
  const patch = {};
  for (const key of EDITABLE_KEYS) if (JSON.stringify(next[key] ?? null) !== JSON.stringify(base[key] ?? null)) patch[key] = next[key];
  setPatch(pid, aid, patch);
}
export function discardStaged(pid, aid) { setPatch(pid, aid, null); }
export function restoreStaged(pid, aid, patch) { setPatch(pid, aid, patch); }

export function stagedChanges(project, aid) {
  const saved = project?.agents?.find((a) => a.id === aid);
  if (!saved || !hasStaged(project.id, aid)) return [];
  return diffAgents(normalizeAgent(saved), effectiveAgent(project, aid));
}

/** Write measured data (tests, evals, knowledge indexing) straight to the saved agent. */
export function patchSaved(pid, aid, fn, { touch = false } = {}) {
  updateProject(pid, (d) => { const a = d.agents.find((x) => x.id === aid); if (a) fn(a); }, { touch });
}

function summarize(changes) {
  if (!changes.length) return 'no changes';
  const s = changes.slice(0, 3).map((c) => `${c.op === '+' ? 'added' : c.op === '−' ? 'removed' : 'changed'} ${c.label}`).join(', ');
  return changes.length > 3 ? `${s} and ${changes.length - 3} more` : s;
}

/** Save staged edits as a new draft version (checkpoint + activity). */
export function saveDraft(pid, aid) {
  const project = getProject(pid);
  const before = project?.agents?.find((a) => a.id === aid);
  if (!before) return null;
  const changes = stagedChanges(project, aid);
  const eff = effectiveAgent(project, aid);
  const v = (before.version || 1) + 1;
  const prevCopy = deepClone(before);
  const patch = getPatch(pid, aid);
  updateProject(pid, (d) => {
    const i = d.agents.findIndex((x) => x.id === aid);
    if (i < 0) return;
    const next = { ...d.agents[i] };
    for (const key of EDITABLE_KEYS) if (key in eff) next[key] = deepClone(eff[key]);
    next.version = v; next.status = 'draft'; next.updatedAt = Date.now();
    next.versions = [...(d.agents[i].versions || []), { v, at: Date.now(), status: 'draft', note: summarize(changes) }].slice(-20);
    d.agents[i] = next;
  });
  discardStaged(pid, aid);
  const cp = addCheckpoint(pid, { label: `${eff.name} v${v} (draft)`, summary: summarize(changes), kind: 'edit' });
  logActivity(pid, { actor: 'You', kind: 'agent', plain: `Saved ${eff.name} as draft v${v}: ${summarize(changes)}.`, technical: `agents/${aid} v${v} · ${changes.map((c) => `${c.op}${c.label}`).join(' · ')}${cp ? ` · checkpoint #${cp.n}` : ''}` });
  toast(`Saved as draft v${v}`, {
    tone: 'success',
    action: {
      label: 'Undo',
      onClick: () => {
        updateProject(pid, (d) => { const i = d.agents.findIndex((x) => x.id === aid); if (i >= 0) d.agents[i] = prevCopy; });
        restoreStaged(pid, aid, patch);
        toast('Back to your unsaved changes');
      },
    },
  });
  return v;
}

/** Publish: include staged edits, bump the version and mark it live. */
export function publishAgent(pid, aid) {
  const project = getProject(pid);
  const before = project?.agents?.find((a) => a.id === aid);
  if (!before) return null;
  const changes = stagedChanges(project, aid);
  const eff = effectiveAgent(project, aid);
  const v = (before.version || 1) + 1;
  addCheckpoint(pid, { label: `Before publishing ${eff.name} v${v}`, summary: 'Automatic safety checkpoint', kind: 'safety' });
  updateProject(pid, (d) => {
    const i = d.agents.findIndex((x) => x.id === aid);
    if (i < 0) return;
    const next = { ...d.agents[i] };
    for (const key of EDITABLE_KEYS) if (key in eff) next[key] = deepClone(eff[key]);
    next.version = v; next.status = 'live'; next.liveVersion = v; next.publishedAt = Date.now(); next.updatedAt = Date.now();
    next.versions = [...(d.agents[i].versions || []), { v, at: Date.now(), status: 'live', note: changes.length ? summarize(changes) : 'Published' }].slice(-20);
    d.agents[i] = next;
  });
  discardStaged(pid, aid);
  logActivity(pid, { actor: 'You', kind: 'launch', plain: `Published ${eff.name} v${v} — it now runs for real.`, technical: `agents/${aid} v${v} → live · ${eff.framework} · ${eff.model?.model || eff.model?.tier}${changes.length ? ` · ${changes.length} change(s) included` : ''}` });
  return v;
}

/** Add a new agent to a project (optionally joining a manager's team). */
export function addAgent(pid, agent, { delegateFrom } = {}) {
  const project = getProject(pid);
  const taken = new Set((project?.agents || []).map((a) => a.id));
  const a = normalizeAgent({ ...agent });
  if (taken.has(a.id)) a.id = uid('a');
  if (!agent.color) a.color = AGENT_COLORS[(project?.agents?.length || 0) % AGENT_COLORS.length];
  updateProject(pid, (d) => {
    d.agents.push(a);
    if (delegateFrom) { const m = d.agents.find((x) => x.id === delegateFrom); if (m) m.delegatesTo = [...new Set([...(m.delegatesTo || []), a.id])]; }
  });
  logActivity(pid, { actor: 'You', kind: 'agent', plain: `Added a new agent, ${a.name} (draft).`, technical: `agents/${a.id} created · framework ${a.framework} · ${a.tools.length} tools` });
  return a;
}

export function duplicateAgent(pid, aid) {
  const project = getProject(pid);
  const src = project?.agents?.find((a) => a.id === aid);
  if (!src) return null;
  const copy = deepClone(effectiveAgent(project, aid));
  copy.id = uid('a'); copy.name = `${src.name} (copy)`; copy.version = 1; copy.status = 'draft'; copy.stats = { runs: 0, cost: 0, latencyMs: 0, errors: 0 };
  copy.usedBy = []; delete copy.tests; delete copy.evals; delete copy.versions; delete copy.liveVersion;
  return addAgent(pid, copy);
}

export function deleteAgent(pid, aid) {
  const project = getProject(pid);
  const a = project?.agents?.find((x) => x.id === aid);
  if (!a) return;
  const cp = addCheckpoint(pid, { label: `Before deleting ${a.name}`, summary: 'Restore this checkpoint to bring the agent back', kind: 'safety' });
  updateProject(pid, (d) => {
    d.agents = d.agents.filter((x) => x.id !== aid);
    for (const m of d.agents) if (m.delegatesTo) m.delegatesTo = m.delegatesTo.filter((x) => x !== aid);
  });
  discardStaged(pid, aid);
  logActivity(pid, { actor: 'You', kind: 'agent', plain: `Deleted ${a.name}. Checkpoint #${cp?.n} can bring it back.`, technical: `agents/${aid} removed` });
  return cp;
}
