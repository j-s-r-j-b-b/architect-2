// Reviewer guide: shared progress state + the "Show me" actions used by the floating
// launcher and the /tour page. Every action lands the reviewer in the exact state the
// item is about, signing in with the (instant) demo account only when it is needed.
import { signal } from '../../lib/html.js';
import { navigate } from '../../lib/router.js';
import { session, authReady, projectsReady, projectList, getProject, createProject, currentUid, wallet } from '../../lib/store.js';
import { signOut } from '../../lib/auth.js';
import { loadJSON, saveJSON, sleep } from '../../lib/util.js';
import { toast, confirmDialog } from '../../ui/index.js';
import { requireAuth } from '../../shells/Auth.js';
import { startProject, approveQuote } from '../../engine/conversation.js';
import { isActive } from '../../engine/simulate.js';
import { previewState, composerFocus } from '../../workspace/bus.js';
import { paletteOpen } from '../../shells/bus.js';

export const REPO_URL = 'https://github.com/j-s-r-j-b-b/architect-2';
export const RESEARCH_URL = 'https://github.com/j-s-r-j-b-b/architect-2/tree/main/docs/research';
export const SYNTHESIS_URL = 'https://github.com/j-s-r-j-b-b/architect-2/blob/main/docs/research/00-RESEARCH-SYNTHESIS.md';

// ---------------------------------------------------------------------------
// State (persisted per browser; ?sandbox= namespaces it like everything else)
// ---------------------------------------------------------------------------
const KEY = 'a2:tour';
const initial = loadJSON(KEY, {}) || {};
/** { visited: {stepId: ts}, hidden: boolean, made: {chat?: projectId, build?: projectId} } */
export const tour = signal({ visited: {}, hidden: false, made: {}, ...initial });
function save(patch) { tour.value = { ...tour.value, ...patch }; saveJSON(KEY, tour.value); }

export const panelOpen = signal(false);
/** Short "what to look for" bubble shown after a Show me: { id, at } */
export const coach = signal(null);
/** Step id whose action is in flight (e.g. waiting for the sign-in sheet). */
export const busyStep = signal(null);

export function markVisited(id) {
  if (!id || tour.value.visited?.[id]) return;
  save({ visited: { ...(tour.value.visited || {}), [id]: Date.now() } });
}
export function setHidden(hidden) { save({ hidden: !!hidden }); if (hidden) { panelOpen.value = false; coach.value = null; } }
export function resetTour() { save({ visited: {} }); coach.value = null; }
const remember = (k, id) => save({ made: { ...(tour.value.made || {}), [k]: id } });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function until(fn, ms = 8000) {
  const t0 = Date.now();
  while (!fn()) { if (Date.now() - t0 > ms) return false; await sleep(40); }
  return true;
}
const whenReady = () => until(() => authReady.value && projectsReady.value);

/** Resolve true once signed in (the in-flow sign-in sheet opens if needed). */
export async function signIn(reason = 'Sign in to continue') {
  await whenReady();
  if (session.value) return true;
  const ok = await requireAuth({ reason });
  if (!ok) return false;
  await whenReady();
  return !!session.value;
}

/** The seeded example project (re-created if it was deleted). */
export async function leadDesk(reason = 'Sign in to open the example project “Lead Desk”') {
  if (!(await signIn(reason))) return null;
  const list = projectList.value;
  let p = list.find((x) => x.sample) || list.find((x) => x.name === 'Lead Desk');
  if (!p) {
    const { leadDeskProject } = await import('../../engine/fixtures.js');
    p = createProject({ ...leadDeskProject(), ownerId: currentUid(), sample: true });
  }
  return p;
}

/** Open a part of Lead Desk, e.g. openLead('plan/mockup') or openLead('app', { query: '?panel=history' }). */
export async function openLead(sub = 'app', { query = '', xray = false, after } = {}) {
  const p = await leadDesk();
  if (!p) return false;
  if (sub.startsWith('app')) previewState.value = { ...previewState.value, route: null, mode: xray ? 'xray' : 'interact' };
  navigate(`/p/${p.id}/${sub}${query}`);
  if (after) { await sleep(380); await after(p); }
  return true;
}

/** Generic destination: { step } | { lead, query, xray, after } | { href, auth } | function */
export async function goTo(t) {
  if (!t) return false;
  if (typeof t === 'function') return t();
  if (t.step) return runStep(t.step);
  if (t.lead) return openLead(t.lead, t);
  if (t.auth && !(await signIn(t.reason || 'Sign in to open this page — demo sign-in is instant'))) return false;
  if (t.href) navigate(t.href);
  if (t.after) { await sleep(300); await t.after(); }
  return true;
}

export const focusComposer = () => { composerFocus.value++; };
export const openCommandPalette = () => { paletteOpen.value = true; };
export async function openShare(p) { const { openShareDialog } = await import('../../workspace/ShareDialog.js'); openShareDialog(p.id); }

const CHAT_PROMPT = 'A sales desk that scores inbound HubSpot leads, researches each company, drafts a personal follow-up email for the hot ones and asks me before anything is sent. Alert the team in Slack when a lead scores above 85.';

// ---------------------------------------------------------------------------
// The nine graded areas
// ---------------------------------------------------------------------------
/**
 * id · title · brief (the judging item it covers) · hint (one line, launcher) · body (tour card)
 * look (what to notice once you land) · icon · run() · links [{label, go}]
 */
export const STEPS = [
  {
    id: 'auth', icon: 'log-in', title: 'Sign-in & accounts', brief: 'Authentication',
    hint: 'Google, GitHub or email. Plan without an account — sign-in is asked only at Build it.',
    body: 'Google, GitHub and email sign-in on one screen. You can describe an app, answer questions and see the plan and price signed out; the sign-in sheet appears only when you press Build it — and your plan comes with you.',
    look: ['Google · GitHub · email on one screen', 'The side panel shows what you get before you commit', 'Demo mode says so, honestly'],
    async run() {
      await whenReady();
      if (session.value) {
        const ok = await confirmDialog({
          title: 'See the sign-up screen?', icon: 'log-in', confirmLabel: 'Sign out and show it',
          body: `You’re signed in as ${session.value.name}. We’ll sign you out for a moment — your projects stay saved in this browser and come back when you sign in again with the same account.`,
        });
        if (!ok) return false;
        await signOut();
      }
      navigate('/signup?next=%2Ftour');
      return true;
    },
  },
  {
    id: 'home', icon: 'home', title: 'Homepage', brief: 'Homepage',
    hint: 'Prompt-first hero with start-from chips: repo, template, Figma/URL, agent code, “Help me decide”.',
    body: 'The homepage is the product’s first input, not a brochure: one prompt box, then start-from chips for a GitHub repo, a template, a Figma file or URL, existing agent code, or “Help me decide”.',
    look: ['Type an idea and press Enter — no account needed', 'Start-from chips under the prompt', 'How it works: plan → quote → watch → own'],
    async run() { navigate('/'); return true; },
  },
  {
    id: 'chat', icon: 'message-square', title: 'Chat & planning', brief: 'Chat window',
    hint: 'A fresh project: guided question cards → a plan with promises, a scope contract and a free quote.',
    body: 'Opens a fresh project from a sales-desk prompt. The chat asks a few guided questions, then drafts a live plan: numbered promises with acceptance checks, a scope contract for anything deferred, and an itemised quote — nothing is built or charged.',
    look: ['Answer the question cards (or keep the recommended picks)', 'Promises P1…Pn with acceptance checks in the Plan tab', 'Scope check: what is deferred, and why', 'The quote card with a budget cap'],
    async run() {
      await whenReady();
      const prev = getProject(tour.value.made?.chat);
      const fresh = prev && !prev.deletedAt && prev.status === 'planning' && (prev.chat || []).some((m) => m.type === 'questions' && !m.data?.answered);
      const p = fresh ? prev : startProject({ prompt: CHAT_PROMPT });
      if (!fresh) remember('chat', p.id);
      navigate(`/p/${p.id}/plan`);
      return true;
    },
  },
  {
    id: 'build', icon: 'play', title: 'Watch the UI get built', brief: 'UI getting built',
    hint: 'Approves a quote and starts a real (simulated) build — the wireframe fills in block by block.',
    body: 'Starts a Support Copilot build from an approved quote. The blueprint wireframe in the preview turns into real UI block by block, promises tick from Building to Verified, and the run bar shows the step, ETA, live credit meter and a Stop that always works. It ends with a receipt against the quote.',
    look: ['Blueprint wireframe → real UI, block by block', 'Run bar: step · ETA · credits vs quote · Stop', 'Receipt with the free-fix line when it finishes'],
    async run() {
      if (!(await signIn('Sign in to watch a build — demo sign-in is instant'))) return false;
      const prev = getProject(tour.value.made?.build);
      if (prev && !prev.deletedAt && isActive(prev)) { navigate(`/p/${prev.id}/app`); return true; }
      const p = startProject({ templateId: 'support-copilot', skipPlan: true });
      remember('build', p.id);
      const q = getProject(p.id)?.plan?.quote;
      if (q?.credits && wallet.value.balance < q.credits[0]) {
        navigate(`/p/${p.id}/plan`);
        toast('Not enough demo credits to start a build — top up on the Billing page, then press Build it.', { tone: 'warn', duration: 7000 });
        return true;
      }
      previewState.value = { ...previewState.value, route: null, mode: 'interact' };
      approveQuote(p.id, {});
      navigate(`/p/${p.id}/app`);
      return true;
    },
  },
  {
    id: 'xray', icon: 'scan-eye', title: 'App preview & X-ray', brief: 'App preview',
    hint: 'Lead Desk with X-ray on: click any block to see its data, its agent and its code file.',
    body: 'The example app “Lead Desk” opens with X-ray switched on. Click any block to see the table it reads, the agent behind it and the file that renders it. Switch to Select, Edit or Annotate to change things visually, try devices and “act as” another role.',
    look: ['Click a KPI tile or table in X-ray', '“Sample data” badges on anything not yet connected', 'Select · Edit · Annotate · X-ray (keys 1–5)'],
    async run() { return openLead('app', { xray: true }); },
    links: [{ label: 'Visual edit', go: { lead: 'app' } }],
  },
  {
    id: 'agents', icon: 'bot', title: 'Agents', brief: 'Agent section',
    hint: 'Agent Map and plain-language cards with boundaries — Card ⇄ Code in 8 frameworks.',
    body: 'An Agent Map shows screens → agents → tools. Each agent is a plain-language card (role, goal, instructions, model, knowledge, guardrails) with visible boundaries such as “Must ask before: sending email”. Flip Card ⇄ Code to get it in 8 frameworks from one open spec, then Try it, Test, Evaluate, Monitor and Deploy.',
    look: ['Agent Map: which screen uses which agent and tool', '“Must ask before” boundaries on the Email Drafter', 'Card ⇄ Code: LangGraph, CrewAI, OpenAI Agents SDK, Mastra…'],
    async run() { return openLead('agents'); },
    links: [{ label: 'Card ⇄ Code', go: { lead: 'agents/a_qualifier/build', query: '?view=code' } }, { label: 'Deploy as API / MCP / A2A', go: { lead: 'agents/a_qualifier/deploy' } }],
  },
  {
    id: 'github', icon: 'github', title: 'GitHub & import', brief: 'GitHub integration',
    hint: 'Import any repo through a trust gate → Understanding Report. Diffs, branches and PRs in Code.',
    body: 'Import an existing repo: a trust gate asks what the code may do before anything runs, then an Understanding Report explains the project in plain words and turns it into a workspace. In any project, the Code tab has a real line diff, branches, push and pull requests.',
    look: ['Pick a sample repo (or paste any public URL)', 'Trust gate before anything runs', 'Understanding Report: screens, agents, risks'],
    async run() { return goTo({ href: '/start/import?source=github', auth: true, reason: 'Sign in to import a repo — demo sign-in is instant' }); },
    links: [{ label: 'Review changes & PR', go: { lead: 'code/review' } }, { label: 'Code tab', go: { lead: 'code' } }],
  },
  {
    id: 'deploy', icon: 'rocket', title: 'Deploying', brief: 'Deploying the app',
    hint: 'Launch Readiness that fixes problems, then staging/production, domain, analytics, Marketplace.',
    body: 'Publish opens Launch Readiness: every red item has a one-click fix (connect real data, add a secret, protect a route, set a budget) instead of a warning. Choose staging or production, who can open it, a custom domain, analytics and a Marketplace listing — then get a real live URL at /a/….',
    look: ['Readiness score with Fix buttons', 'Staging never blocks; production does', 'Marketplace toggle + listing fields, custom domain, analytics'],
    async run() {
      return openLead('launch', { after: async (p) => { const { openPublishFlow } = await import('../../workspace/launch/publish.js'); openPublishFlow(p.id); } });
    },
    links: [{ label: 'Launch tab', go: { lead: 'launch' } }],
  },
  {
    id: 'parity', icon: 'layers', title: 'Everything else', brief: 'Parity & extras',
    hint: 'AI Consultant, templates, marketplace, connections (26 apps, MCP, keys) and usage.',
    body: 'Everything today’s Architect has, redesigned: the “What should I build?” AI Consultant, a prompt library by department, the Marketplace, Connections (26 integrations, MCP servers, your own model keys) and Usage with per-app, per-phase credits.',
    look: ['Consultant: role → time-sinks → tools → goals → 3 ideas', 'Connect → scopes → Allow', 'Usage: where every credit went'],
    async run() { return goTo({ href: '/start/consultant', auth: true, reason: 'Sign in to open the AI Consultant — demo sign-in is instant' }); },
    links: [
      { label: 'Templates', go: { href: '/templates' } },
      { label: 'Marketplace', go: { href: '/marketplace' } },
      { label: 'Connections', go: { href: '/connections', auth: true } },
      { label: 'Usage', go: { href: '/usage', auth: true } },
    ],
  },
];
export const stepById = (id) => STEPS.find((s) => s.id === id);
export const nextStep = () => STEPS.find((s) => !tour.value.visited?.[s.id]) || null;
export const visitedCount = () => STEPS.filter((s) => tour.value.visited?.[s.id]).length;

/** Run a step's Show me action. Closes the launcher, marks the step and shows what to look for. */
export async function runStep(id, { quiet = false } = {}) {
  const s = stepById(id);
  if (!s || busyStep.value) return false;
  panelOpen.value = false;
  coach.value = null;
  busyStep.value = id;
  let ok = false;
  try { ok = await s.run(); }
  catch (e) { console.error('[tour]', e); toast('That shortcut hit a problem — try again, or open it from the menu.', { tone: 'error' }); }
  finally { busyStep.value = null; }
  if (ok !== false) {
    markVisited(id);
    if (!quiet) coach.value = { id, at: Date.now() };
  }
  return ok !== false;
}

/** Run a secondary link and credit its step. */
export async function runLink(stepId, link) {
  panelOpen.value = false;
  coach.value = null;
  const ok = await goTo(link.go);
  if (ok !== false && stepId) markVisited(stepId);
  return ok;
}

// ---------------------------------------------------------------------------
// Auto-credit: wandering into an area by yourself counts as seeing it.
// ---------------------------------------------------------------------------
const PARITY_PATHS = ['/start/consultant', '/templates', '/marketplace', '/connections', '/usage'];
export function autoCredit(path, mode) {
  const ws = path.match(/^\/p\/([^/]+)\/([^/]+)/);
  const tab = ws?.[2];
  if (path === '/signup' || path === '/login') markVisited('auth');
  if (tab === 'plan') markVisited('chat');
  if (tab === 'app') {
    const p = getProject(ws[1]);
    if (p && isActive(p)) markVisited('build');
    if (mode === 'xray') markVisited('xray');
  }
  if (tab === 'agents' || path === '/agents') markVisited('agents');
  if (tab === 'code' || path.startsWith('/start/import')) markVisited('github');
  if (tab === 'launch') markVisited('deploy');
  if (PARITY_PATHS.some((x) => path === x || path.startsWith(x + '/'))) markVisited('parity');
}
