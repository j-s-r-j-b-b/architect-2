// Global application state (signals) + domain actions.
// Every screen reads from these signals; every mutation goes through the actions below
// so persistence, timestamps and activity logging stay consistent.
import { signal, computed, batch } from './html.js';
import * as db from './db.js';
import { uid, slugify, deepClone, loadJSON, saveJSON, debounce, colorFor } from './util.js';

// ---------------------------------------------------------------------------
// Session & preferences
// ---------------------------------------------------------------------------
/** @type {import('@preact/signals').Signal<null | {uid:string,name:string,email:string,photo?:string,provider:string}>} */
export const session = signal(null);
export const authReady = signal(false);
export const currentUid = () => session.value?.uid || 'anon';

const DEFAULT_PREFS = {
  experience: 'balanced', // 'guided' | 'balanced' | 'full' — sets defaults only; nothing is ever locked
  theme: 'system',        // 'system' | 'light' | 'dark'
  density: 'comfortable', // 'comfortable' | 'compact'
  onboarded: false,
  role: null,
  railCollapsed: false,
  dockCollapsed: false,
  notifications: { email: true, inApp: true, weekly: false },
};
export const prefs = signal({ ...DEFAULT_PREFS, ...loadJSON('a2:prefs', {}) });

export function setPrefs(patch) {
  prefs.value = { ...prefs.value, ...patch };
  saveJSON('a2:prefs', prefs.value);
  if ('theme' in patch) applyTheme();
  persistUserDoc();
}
export function applyTheme() {
  const t = prefs.value.theme;
  if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
  else document.documentElement.removeAttribute('data-theme');
}
/** Resolved theme ('light' | 'dark') taking the OS setting into account. */
export function resolvedTheme() {
  const t = prefs.value.theme;
  if (t === 'light' || t === 'dark') return t;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
/** Should developer depth (Code tab, raw ids, framework code) be shown by default? */
export const showDevDepth = computed(() => prefs.value.experience === 'full');

// ---------------------------------------------------------------------------
// Wallet (credits) & inbox
// ---------------------------------------------------------------------------
const DEFAULT_WALLET = {
  plan: 'free',             // 'free' | 'starter' | 'pro' | 'max' | 'custom'
  balance: 300,             // credits available
  monthly: 300,             // monthly allowance
  cycleStart: Date.now(),
  ledger: [],               // [{id, at, projectId, phase, label, amount, free}]
  budgets: { monthlyCap: null, alertAt: 0.8 },
};
export const wallet = signal({ ...DEFAULT_WALLET });
export const inbox = signal([]); // [{id, at, kind:'needs'|'ready'|'problem', title, body, projectId, href, read}]
export const unreadCount = computed(() => inbox.value.filter((i) => !i.read).length);

/**
 * Record credit usage. Free entries (e.g. fixes for regressions the AI caused) are logged at 0 cost.
 * @returns the ledger entry
 */
export function spend(amount, { projectId = null, phase = 'build', label = '', free = false } = {}) {
  const entry = { id: uid('tx'), at: Date.now(), projectId, phase, label, amount: free ? 0 : amount, listed: amount, free };
  const w = wallet.value;
  wallet.value = { ...w, balance: Math.max(0, +(w.balance - entry.amount).toFixed(2)), ledger: [entry, ...w.ledger].slice(0, 400) };
  persistUserDoc();
  return entry;
}
export function topUp(credits, label = 'Top-up') {
  const w = wallet.value;
  wallet.value = { ...w, balance: w.balance + credits, ledger: [{ id: uid('tx'), at: Date.now(), phase: 'topup', label, amount: -credits, listed: -credits }, ...w.ledger] };
  persistUserDoc();
}
export function setPlan(plan, monthly) {
  const w = wallet.value;
  wallet.value = { ...w, plan, monthly, balance: Math.max(w.balance, monthly) };
  persistUserDoc();
}
export function setBudgets(patch) {
  wallet.value = { ...wallet.value, budgets: { ...wallet.value.budgets, ...patch } };
  persistUserDoc();
}

export function pushInbox(item) {
  const it = { id: uid('n'), at: Date.now(), read: false, kind: 'ready', ...item };
  inbox.value = [it, ...inbox.value].slice(0, 100);
  persistUserDoc();
  return it;
}
export function markInbox(id, patch = { read: true }) {
  inbox.value = inbox.value.map((i) => (id === '*' || i.id === id ? { ...i, ...patch } : i));
  persistUserDoc();
}
export function removeInbox(id) {
  inbox.value = inbox.value.filter((i) => i.id !== id);
  persistUserDoc();
}

// ---------------------------------------------------------------------------
// Account-level connections: integrations, MCP servers, model keys (BYOK)
// ---------------------------------------------------------------------------
const DEFAULT_CONNECTIONS = {
  integrations: {},  // id -> { connectedAt, account, scopes:[], demo:boolean }
  mcp: [],           // [{ id, name, url, auth, status:'connected'|'error', addedAt }]
  keys: {},          // provider -> { last4, addedAt }  (the key itself is never stored in project data)
};
export const connections = signal({ ...DEFAULT_CONNECTIONS });

export function setConnection(integrationId, info) {
  const c = connections.value;
  const integrations = { ...c.integrations };
  if (info) integrations[integrationId] = { connectedAt: Date.now(), ...info };
  else delete integrations[integrationId];
  connections.value = { ...c, integrations };
  persistUserDoc();
}
export function addMcpServer(server) {
  const c = connections.value;
  connections.value = { ...c, mcp: [...c.mcp.filter((m) => m.id !== server.id), { status: 'connected', addedAt: Date.now(), ...server }] };
  persistUserDoc();
}
export function removeMcpServer(id) {
  const c = connections.value;
  connections.value = { ...c, mcp: c.mcp.filter((m) => m.id !== id) };
  persistUserDoc();
}
export function setModelKey(provider, info) {
  const c = connections.value;
  const keys = { ...c.keys };
  if (info) keys[provider] = { addedAt: Date.now(), ...info }; else delete keys[provider];
  connections.value = { ...c, keys };
  persistUserDoc();
}

const persistUserDoc = debounce(() => {
  const u = currentUid();
  db.saveUserDoc(u, { prefs: prefs.value, wallet: wallet.value, inbox: inbox.value, connections: connections.value }).catch((e) => console.warn('[store] user doc', e));
}, 600);

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
/** id -> project */
export const projects = signal({});
export const projectsReady = signal(false);
export const projectList = computed(() =>
  Object.values(projects.value).filter((p) => !p.deletedAt).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)));
export const trashedProjects = computed(() => Object.values(projects.value).filter((p) => p.deletedAt));

/** Build a complete project object with every field present (see src/engine/schema.js). */
export function newProject(partial = {}) {
  const now = Date.now();
  const id = partial.id || uid('p');
  const name = partial.name || 'Untitled app';
  const me = session.value;
  const base = {
    id,
    slug: partial.slug || `${slugify(name)}-${id.slice(-4)}`,
    name,
    description: '',
    prompt: '',
    icon: 'sparkles',
    color: colorFor(name),
    ownerId: currentUid(),
    members: me ? [{ uid: me.uid, name: me.name, email: me.email, role: 'owner', photo: me.photo || null }] : [],
    createdAt: now,
    updatedAt: now,
    status: 'draft',
    archetype: null,
    questions: [],
    answers: {},
    plan: { summary: '', audience: '', promises: [], decisions: [], quote: null, approvedAt: null, artifacts: [] },
    theme: { preset: 'blueprint', primary: '#2F5BEA', accent: '#7446F0', radius: 10, font: 'Geist', mode: 'light', density: 'comfortable' },
    screens: [],
    data: { tables: [] },
    agents: [],
    integrations: [],
    env: [],
    checkpoints: [],
    runs: [],
    build: null,
    deployments: [],
    environments: { draft: { version: 0 }, staging: null, production: null },
    domain: null,
    listing: { marketplace: false, category: '', description: '', short: '', tags: [] },
    analyticsEnabled: true,
    github: { connected: false, repo: null, branch: 'main', branches: ['main'], lastPush: null, prs: [] },
    chat: [],
    threads: [{ id: 'main', name: 'Main' }],
    comments: [],
    activity: [],
    settings: { mode: 'plan', modelTier: 'balanced', runMode: 'ask-risky', testAfterBuild: true, budgetCap: null, rules: [] },
    source: { type: 'prompt', ref: null },
    sample: false,
    deletedAt: null,
  };
  return { ...base, ...partial, id, plan: { ...base.plan, ...(partial.plan || {}) }, theme: { ...base.theme, ...(partial.theme || {}) }, settings: { ...base.settings, ...(partial.settings || {}) } };
}

const savers = new Map();
function scheduleSave(id) {
  if (!savers.has(id)) {
    savers.set(id, debounce(() => {
      const p = projects.value[id];
      if (p) db.saveProject(p.ownerId || currentUid(), p).catch((e) => console.warn('[store] save failed', e));
    }, 700));
  }
  savers.get(id)();
}
/** Flush pending saves (e.g. before sign-out). */
export function flushSaves() { for (const s of savers.values()) s.flush(); }

export function getProject(id) { return projects.value[id] || null; }

export function createProject(partial = {}) {
  const p = newProject(partial);
  projects.value = { ...projects.value, [p.id]: p };
  scheduleSave(p.id);
  return p;
}

/**
 * Update a project immutably. `patch` is an object (shallow-merged) or a function
 * (draft) => void | newProject that may mutate a deep clone.
 */
export function updateProject(id, patch, { touch = true, save = true } = {}) {
  const cur = projects.value[id];
  if (!cur) return null;
  let next;
  if (typeof patch === 'function') {
    const draft = deepClone(cur);
    const r = patch(draft);
    next = r && typeof r === 'object' ? r : draft;
  } else next = { ...cur, ...patch };
  if (touch) next.updatedAt = Date.now();
  projects.value = { ...projects.value, [id]: next };
  if (save) scheduleSave(id);
  return next;
}

/** Soft delete → Trash (restorable for 30 days). */
export function trashProject(id) { return updateProject(id, { deletedAt: Date.now() }); }
export function restoreProject(id) { return updateProject(id, { deletedAt: null }); }
export async function deleteProjectForever(id) {
  const p = projects.value[id];
  const { [id]: _, ...rest } = projects.value;
  projects.value = rest;
  await db.deleteProject(p?.ownerId || currentUid(), id);
}
export function duplicateProject(id) {
  const src = projects.value[id];
  if (!src) return null;
  const copy = deepClone(src);
  delete copy.id; delete copy.slug;
  return createProject({ ...copy, name: `${src.name} (copy)`, deployments: [], environments: { draft: { version: 0 }, staging: null, production: null }, domain: null, status: src.status === 'live' ? 'built' : src.status, sample: false, createdAt: Date.now() });
}

// ---------- Chat ----------
/**
 * Append a chat message. Message types (msg.type) are rendered by the chat dock:
 * 'text' | 'questions' | 'promises' | 'quote' | 'progress' | 'receipt' | 'fix' | 'approval' | 'checkpoint' | 'system' | ...
 */
export function addChat(projectId, msg) {
  const m = { id: uid('m'), at: Date.now(), role: 'assistant', type: 'text', thread: 'main', ...msg };
  updateProject(projectId, (d) => { d.chat.push(m); });
  return m;
}
export function updateChat(projectId, msgId, patch) {
  updateProject(projectId, (d) => {
    const m = d.chat.find((x) => x.id === msgId);
    if (m) Object.assign(m, typeof patch === 'function' ? patch(m) : patch);
  }, { touch: false });
}

// ---------- Activity feed (dual summaries: plain + technical) ----------
export function logActivity(projectId, { plain, technical = '', actor = 'Architect', kind = 'change' }) {
  const a = { id: uid('ac'), at: Date.now(), actor, kind, plain, technical };
  updateProject(projectId, (d) => { d.activity.unshift(a); d.activity = d.activity.slice(0, 200); }, { touch: false });
  return a;
}

// ---------- Checkpoints (time machine) ----------
const SNAPSHOT_KEYS = ['name', 'plan', 'theme', 'screens', 'data', 'agents', 'integrations', 'env'];
/** Snapshot the restorable parts of a project. Nothing is ever deleted by a restore. */
export function addCheckpoint(projectId, { label, summary = '', kind = 'edit', credits = 0 } = {}) {
  let cp = null;
  updateProject(projectId, (d) => {
    const n = (d.checkpoints[0]?.n || 0) + 1;
    const snapshot = {};
    for (const k of SNAPSHOT_KEYS) snapshot[k] = deepClone(d[k]);
    cp = { id: uid('cp'), n, at: Date.now(), label: label || `Checkpoint ${n}`, summary, kind, credits, snapshot };
    d.checkpoints.unshift(cp);
    d.checkpoints = d.checkpoints.slice(0, 60);
  }, { touch: false });
  return cp;
}
export function restoreCheckpoint(projectId, cpId, { parts = SNAPSHOT_KEYS } = {}) {
  const p = getProject(projectId);
  const cp = p?.checkpoints.find((c) => c.id === cpId);
  if (!cp) return null;
  addCheckpoint(projectId, { label: `Before restoring #${cp.n}`, summary: 'Automatic safety checkpoint', kind: 'safety' });
  updateProject(projectId, (d) => { for (const k of parts) if (k in cp.snapshot) d[k] = deepClone(cp.snapshot[k]); });
  return addCheckpoint(projectId, { label: `Restored #${cp.n}`, summary: `Restored “${cp.label}”`, kind: 'restore' });
}

// ---------------------------------------------------------------------------
// Loading / switching users
// ---------------------------------------------------------------------------
/** Load everything for the signed-in user (or 'anon'). Called by auth.js on every auth change. */
export async function loadUserData() {
  const u = currentUid();
  projectsReady.value = false;
  try {
    const [list, doc] = await Promise.all([db.listProjects(u), db.loadUserDoc(u)]);
    batch(() => {
      projects.value = list || {};
      if (doc?.wallet) wallet.value = { ...DEFAULT_WALLET, ...doc.wallet };
      else wallet.value = { ...DEFAULT_WALLET, cycleStart: Date.now() };
      inbox.value = doc?.inbox || [];
      connections.value = { ...DEFAULT_CONNECTIONS, ...(doc?.connections || {}) };
      if (doc?.prefs) { prefs.value = { ...DEFAULT_PREFS, ...doc.prefs, theme: prefs.value.theme }; saveJSON('a2:prefs', prefs.value); }
    });
    if (u !== 'anon' && !Object.keys(projects.value).length && !doc) await seedNewUser();
  } catch (e) {
    console.error('[store] load failed', e);
  } finally {
    projectsReady.value = true;
  }
}

/** First sign-in: add an example project and a welcome notification. */
async function seedNewUser() {
  const { leadDeskProject } = await import('../engine/fixtures.js');
  const sample = leadDeskProject();
  createProject({ ...sample, ownerId: currentUid(), sample: true });
  pushInbox({ kind: 'ready', title: 'Welcome to Architect', body: 'We added an example project, Lead Desk, so you can explore every tab before building your own.', href: `/p/${sample.id}/app` });
}

/** Move projects created while signed out into the signed-in account. */
export async function claimAnonProjects() {
  const anon = loadJSON('a2:u:anon:projects', {});
  const ids = Object.keys(anon);
  if (!ids.length || currentUid() === 'anon') return [];
  const me = session.value;
  for (const id of ids) {
    const p = { ...anon[id], ownerId: me.uid, members: [{ uid: me.uid, name: me.name, email: me.email, role: 'owner', photo: me.photo || null }] };
    projects.value = { ...projects.value, [id]: p };
    await db.saveProject(me.uid, p);
  }
  saveJSON('a2:u:anon:projects', {});
  return ids;
}
