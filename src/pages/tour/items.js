// Reviewer guide: the graded items, each with a one-click "Show me" that lands in the right state.
import { signal } from '../../lib/html.js';
import { navigate } from '../../lib/router.js';
import { projectList, projectsReady, createProject, getProject } from '../../lib/store.js';
import { loadJSON, saveJSON, sleep } from '../../lib/util.js';
import { requireAuth } from '../../shells/Auth.js';
import { toast } from '../../ui/index.js';

const KEY = 'a2:tour';
export const tourState = signal({ visited: {}, hidden: false, seenIntro: false, ...loadJSON(KEY, {}) });
export function setTour(patch) { tourState.value = { ...tourState.value, ...patch }; saveJSON(KEY, tourState.value); }
export function markVisited(id) { setTour({ visited: { ...tourState.value.visited, [id]: Date.now() } }); }

async function waitFor(fn, ms = 4000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { const v = fn(); if (v) return v; await sleep(80); }
  return fn();
}

/** The seeded example project (signing in first, creating it if it was deleted). */
async function leadDesk() {
  if (!(await requireAuth({ reason: 'Sign in to open the example project — instant in demo mode' }))) return null;
  await waitFor(() => projectsReady.value);
  let p = await waitFor(() => projectList.value.find((x) => x.sample), 1500);
  if (!p) {
    const { leadDeskProject } = await import('../../engine/fixtures.js');
    p = createProject({ ...leadDeskProject(), sample: true });
  }
  return p;
}

async function chatDemo() {
  const { startProject } = await import('../../engine/conversation.js');
  const p = startProject({ prompt: 'Score inbound HubSpot leads against our ideal customer profile, draft personalised follow-ups I approve, and alert the team in Slack when a hot lead arrives' });
  navigate(`/p/${p.id}/plan`);
}

async function buildDemo() {
  if (!(await requireAuth({ reason: 'Sign in to build — instant in demo mode' }))) return;
  const { startProject, approveQuote } = await import('../../engine/conversation.js');
  const p = startProject({ templateId: 'support-copilot', skipPlan: true });
  await waitFor(() => getProject(p.id)?.plan?.quote);
  approveQuote(p.id, {});
  navigate(`/p/${p.id}/app`);
  toast('Watch the blueprint turn into real UI — the run bar shows step, time and credits', { tone: 'info', duration: 6000 });
}

async function inLeadDesk(path, after) {
  const p = await leadDesk();
  if (!p) return;
  navigate(`/p/${p.id}${path}`);
  if (after) setTimeout(() => after(p), 500);
}

export const TOUR_ITEMS = [
  { id: 'auth', title: 'Authentication', icon: 'lock', body: 'Google, GitHub or email. Plan without an account — sign-in is asked only when you press Build it, and your plan is kept.', run: () => navigate('/signup') },
  { id: 'home', title: 'Homepage', icon: 'home', body: 'Prompt-first hero. Start from a GitHub repo, a template, a Figma file, existing agent code — or “Help me decide”.', run: () => navigate('/') },
  { id: 'chat', title: 'Chat window & planning', icon: 'message-square', body: 'Clarifying questions → numbered Promises with acceptance checks → scope contract → itemised quote. Ask · Plan · Build modes.', run: chatDemo },
  { id: 'build', title: 'UI getting built', icon: 'layers', body: 'Approve a quote and watch the approved wireframe turn into real UI, promises tick to Verified and the credit meter run.', run: buildDemo },
  { id: 'preview', title: 'App preview, X-ray & visual edit', icon: 'scan-eye', body: 'Devices, routes, Select / Edit / Annotate. X-ray any element to see its data, agent and code file.', run: async () => { const { previewState } = await import('../../workspace/bus.js'); previewState.value = { ...previewState.value, mode: 'xray' }; await inLeadDesk('/app'); } },
  { id: 'agents', title: 'Agent section', icon: 'bot', body: 'Agent Map, plain-language Agent Cards with boundaries, Try it with traces, tests & evals, and code in 8 frameworks from one spec.', run: () => inLeadDesk('/agents') },
  { id: 'github', title: 'GitHub & import', icon: 'github', body: 'Connect → create repo → push. Review a real line diff and open a pull request. Or import any repo through a trust gate.', run: () => inLeadDesk('/code/review'), alt: { label: 'Import a repo', href: '/start/import?source=github' } },
  { id: 'deploy', title: 'Deploying the app', icon: 'rocket', body: 'Launch Readiness fixes problems in place, then a deploy pipeline and a real live URL. Environments, rollback, domains.', run: () => inLeadDesk('/launch', async (p) => { const { openPublishFlow } = await import('../../workspace/launch/publish.js'); openPublishFlow(p.id); }) },
  { id: 'more', title: 'Parity & extras', icon: 'sparkles', body: 'AI Consultant, templates, marketplace, integrations & MCP, bring-your-own keys, usage & budgets, admin console.', run: () => navigate('/start/consultant'), alt: { label: 'Connections', href: '/connections' } },
];

export async function runItem(item) {
  markVisited(item.id);
  try { await item.run(); } catch (e) { console.error('[tour]', e); toast('Couldn’t open that step — try again', { tone: 'error' }); }
}
