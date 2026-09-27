// Marketplace listings: ~12 community apps built from TEMPLATES (fictional authors, seeded stats)
// plus the signed-in user's own live projects that are listed (listing.marketplace && status === 'live').
import { newProject } from '../../../lib/store.js';
import { TEMPLATES, THEME_PRESETS, themePreset } from '../../../engine/catalog.js';
import { planFromTemplate } from '../../../engine/generate.js';
import { seeded } from '../../../lib/util.js';

export const USE_CASES = ['Automate a workflow', 'Customer-facing assistant', 'Internal knowledge', 'Document processing', 'Content generation', 'Analytics & reporting'];

const USE = {
  'lead-desk': 'Automate a workflow', 'support-copilot': 'Customer-facing assistant', 'recruit-screen': 'Automate a workflow',
  'expense-auditor': 'Document processing', 'content-studio': 'Content generation', 'policy-assistant': 'Internal knowledge',
  'contract-review': 'Document processing', 'claims-desk': 'Document processing', 'booking-concierge': 'Customer-facing assistant',
  'order-ops': 'Automate a workflow', 'sprint-reporter': 'Analytics & reporting', 'tutor': 'Customer-facing assistant',
  'research-brief': 'Analytics & reporting', 'onboarding-buddy': 'Internal knowledge', 'invoice-chaser': 'Automate a workflow', 'bug-triage': 'Automate a workflow',
};

// Fictional community authors — not real people or companies.
const AUTHORS = [
  { name: 'Meera Iyer', org: 'Northwind Sales Ops' }, { name: 'Tomás Rivera', org: 'Helpline Studio' }, { name: 'Aisha Bello', org: 'People Ops Guild' },
  { name: 'Jonas Lindqvist', org: 'Ledgerly' }, { name: 'Priya Nair', org: 'Brightwave Marketing' }, { name: 'Kenji Watanabe', org: 'Handbook Labs' },
  { name: 'Clara Dupont', org: 'Clause & Co' }, { name: 'Ravi Menon', org: 'Assure Digital' }, { name: 'Sara Haddad', org: 'Clinic Stack' },
  { name: 'Leo Fischer', org: 'Parcel Pilot' }, { name: 'Nora Kim', org: 'Shipnotes' }, { name: 'Diego Alvarez', org: 'Learnloop' },
];
const THEMES = ['navy', 'teal', 'grape', 'forest', 'sunset', 'slate', 'editorial', 'ink', 'rose', 'blueprint', 'midnight', 'blueprint'];
const LISTED = TEMPLATES.slice(0, 12);

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const projCache = new Map();
function projectFor(slug, t, themeId) {
  if (projCache.has(slug)) return projCache.get(slug);
  const plan = planFromTemplate(t.id);
  const pr = themePreset(themeId);
  const p = newProject({
    id: `mk_${slug}`, slug, name: t.title, prompt: t.prompt, icon: t.icon, description: plan.description,
    plan: plan.plan, screens: plan.screens, data: plan.data, agents: plan.agents, integrations: plan.integrations, env: plan.env,
    theme: { ...plan.theme, preset: pr.id, primary: pr.primary, accent: pr.accent, radius: pr.radius, font: pr.font, mode: pr.dark ? 'dark' : 'light' },
    status: 'live', sample: true,
  });
  projCache.set(slug, p);
  return p;
}

function fromTemplate(t, i) {
  const r = seeded(t.id);
  const author = AUTHORS[i % AUTHORS.length];
  const slug = t.id;
  const rating = Math.round((4.2 + r() * 0.75) * 10) / 10;
  const reviewCount = Math.round(18 + r() * 240);
  const listing = {
    slug, kind: 'template', templateId: t.id, title: t.title, category: t.category, useCase: USE[t.id] || USE_CASES[0],
    short: cap(t.prompt.split(/[,.:]/)[0].replace(/^(A|An) /, '')) + '.',
    description: t.prompt, author, rating, reviewCount,
    runs: Math.round(t.uses * (2.5 + r() * 4)), remixes: Math.round(t.uses * (0.08 + r() * 0.1)),
    updatedAt: Date.now() - Math.round(1 + r() * 40) * 86400e3, publishedAt: Date.now() - Math.round(60 + r() * 200) * 86400e3,
    agentCount: t.agents.length, integrations: t.integrations, own: false, live: false,
  };
  Object.defineProperty(listing, 'project', { get: () => projectFor(slug, t, THEMES[i % THEMES.length]), enumerable: true });
  return listing;
}

function fromProject(p) {
  return {
    slug: p.slug, kind: 'project', projectId: p.id, title: p.name, category: p.listing?.category || 'Operations', useCase: 'Automate a workflow',
    short: p.listing?.short || p.description || 'Built with Architect', description: p.listing?.description || p.description || p.prompt,
    author: { name: p.members?.[0]?.name || 'You', org: 'Your workspace' }, rating: 5, reviewCount: 0, runs: (p.agents || []).reduce((n, a) => n + (a.stats?.runs || 0), 0),
    remixes: 0, updatedAt: p.updatedAt, publishedAt: p.deployments?.[0]?.at || p.updatedAt, agentCount: (p.agents || []).length,
    integrations: (p.integrations || []).map((x) => x.id), own: true, live: true, project: p,
  };
}

let base = null;
export function marketListings(projectList = []) {
  if (!base) base = LISTED.map(fromTemplate);
  const mine = projectList.filter((p) => p.listing?.marketplace && p.status === 'live').map(fromProject);
  return [...mine, ...base];
}

export function listingBySlug(slug, projectList = []) {
  return marketListings(projectList).find((l) => l.slug === slug) || null;
}

export function sortListings(list, sort) {
  const s = [...list];
  if (sort === 'recent') s.sort((a, b) => b.updatedAt - a.updatedAt);
  else if (sort === 'rating') s.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  else s.sort((a, b) => (b.own ? 1 : 0) - (a.own ? 1 : 0) || b.runs - a.runs);
  return s;
}

// ---------------------------------------------------------------------------
// Reviews (seeded, fictional)
// ---------------------------------------------------------------------------
const REVIEWERS = ['Hana M.', 'Owen T.', 'Lucía P.', 'Marcus B.', 'Ifeoma A.', 'Petra S.', 'Dev R.', 'Yuki H.', 'Samir K.', 'Elena V.'];
const TEXTS = [
  [5, 'Set up in an afternoon', 'The quote was spot on — my first build landed inside the estimate, and I could watch every step.'],
  [5, 'The approval step sold my team', 'Nothing goes out without someone approving it. That’s what got our compliance lead to say yes.'],
  [4, 'Easy to adapt', 'Remixed it and swapped the CRM in one prompt. Had to tweak one agent’s instructions for our tone.'],
  [5, 'X-ray is underrated', 'Our developer used X-ray to jump straight to the component that needed changing. Saved a lot of back and forth.'],
  [4, 'Solid starting point', 'The Doctor explained a broken connection in plain words and the fix didn’t cost anything.'],
  [3, 'Good core, wants more charts', 'Workflow is great. I’d like more chart options on the insights screen out of the box.'],
  [5, 'Evals give me confidence', 'Running evals before going live caught two bad answers. Traces made debugging easy afterwards.'],
];
export function listingReviews(l) {
  if (!l.reviewCount) return [];
  const r = seeded(l.slug + ':reviews');
  const picks = [...TEXTS].sort(() => r() - 0.5).slice(0, 5);
  return picks.map(([stars, title, body], i) => ({ id: `${l.slug}_r${i}`, stars, title, body, author: REVIEWERS[Math.floor(r() * REVIEWERS.length)], at: Date.now() - Math.round(2 + r() * 60) * 86400e3, helpful: Math.round(r() * 40) }));
}
/** Star histogram [5★..1★] consistent with the listing's average. */
export function ratingHistogram(l) {
  const n = l.reviewCount || 0;
  if (!n) return [0, 0, 0, 0, 0];
  const avg = l.rating;
  const five = Math.round(n * Math.min(0.92, Math.max(0.35, (avg - 3.6) / 1.4)));
  const four = Math.round((n - five) * 0.65);
  const three = Math.round((n - five - four) * 0.6);
  const two = Math.round((n - five - four - three) * 0.6);
  return [five, four, three, two, Math.max(0, n - five - four - three - two)];
}

export { THEME_PRESETS };
