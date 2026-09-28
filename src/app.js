// Route table + router outlet. Pages are lazy-loaded ES modules.
import { html, useState, useEffect, useErrorBoundary } from './lib/html.js';
import { route, matchPath, navigate } from './lib/router.js';
import { session, authReady } from './lib/store.js';
import { OverlayHost, Button, Logo, useHotkey } from './ui/index.js';
import { PublicShell } from './shells/PublicShell.js';
import { AppShell } from './shells/AppShell.js';
import { paletteOpen } from './shells/bus.js';

/**
 * shell: 'public' | 'app' | 'auto' (app when signed in, public otherwise) | 'bare' | 'workspace'
 * auth:  true → signed-in only (redirects to /login?next=…)
 */
const ROUTES = [
  { path: '/', load: () => import('./pages/public/Landing.js'), shell: 'public' },
  { path: '/pricing', load: () => import('./pages/public/Pricing.js'), shell: 'public' },
  { path: '/enterprise', load: () => import('./pages/public/Enterprise.js'), shell: 'public' },
  { path: '/for/:persona', load: () => import('./pages/public/Persona.js'), shell: 'public' },
  { path: '/templates', load: () => import('./pages/public/Templates.js'), shell: 'auto' },
  { path: '/templates/:id', load: () => import('./pages/public/TemplateDetail.js'), shell: 'auto' },
  { path: '/marketplace', load: () => import('./pages/public/Marketplace.js'), shell: 'auto' },
  { path: '/marketplace/:slug', load: () => import('./pages/public/MarketplaceApp.js'), shell: 'auto' },
  { path: '/help', load: () => import('./pages/app/Help.js'), shell: 'auto' },
  { path: '/tour', load: () => import('./pages/tour/Tour.js'), shell: 'auto' },
  { path: '/login', load: () => import('./shells/Auth.js'), pick: 'LoginPage', shell: 'bare' },
  { path: '/signup', load: () => import('./shells/Auth.js'), pick: 'SignupPage', shell: 'bare' },
  { path: '/new', load: () => import('./shells/NewProject.js'), shell: 'bare' },
  { path: '/a/:slug/:rest*', load: () => import('./pages/live/LiveApp.js'), shell: 'bare' },
  { path: '/invite/:token', load: () => import('./pages/app/Invite.js'), shell: 'bare' },
  { path: '/onboarding', load: () => import('./pages/app/Onboarding.js'), shell: 'bare', auth: true },
  { path: '/start', load: () => import('./pages/app/Start.js'), shell: 'app', auth: true },
  { path: '/start/consultant', load: () => import('./pages/app/Consultant.js'), shell: 'app', auth: true },
  { path: '/start/import', load: () => import('./pages/app/ImportWizard.js'), shell: 'app', auth: true },
  { path: '/projects/:view?', load: () => import('./pages/app/Projects.js'), shell: 'app', auth: true },
  { path: '/agents', load: () => import('./pages/app/AgentsLibrary.js'), shell: 'app', auth: true },
  { path: '/connections/:tab?', load: () => import('./pages/app/Connections.js'), shell: 'app', auth: true },
  { path: '/inbox', load: () => import('./pages/app/Inbox.js'), shell: 'app', auth: true },
  { path: '/usage', load: () => import('./pages/app/Usage.js'), shell: 'app', auth: true },
  { path: '/billing', load: () => import('./pages/app/Billing.js'), shell: 'app', auth: true },
  { path: '/settings/:section?', load: () => import('./pages/app/Settings.js'), shell: 'app', auth: true },
  { path: '/admin/:section?', load: () => import('./pages/app/Admin.js'), shell: 'app', auth: true },
  { path: '/p/:id/:tab?/:a?/:b?', load: () => import('./workspace/Workspace.js'), shell: 'workspace' },
];

const cache = new Map();

function resolve(path) {
  for (const r of ROUTES) {
    const params = matchPath(r.path, path);
    if (params) return { r, params };
  }
  return null;
}

function Loading() {
  return html`<div class="route-loading"><span class="spinner"></span></div>`;
}

function RouteError({ error, reset }) {
  return html`<div class="route-error card">
    <div class="t-lg t-strong">This screen hit a problem</div>
    <p class="t-md t-muted mt-4">Your work is saved. You can go back or try again.</p>
    <pre class="mt-12">${String(error?.stack || error?.message || error)}</pre>
    <div class="row gap-8 mt-12"><${Button} variant="primary" onClick=${reset}>Try again<//><${Button} href="/start">Go to Start<//></div>
  </div>`;
}

function NotFound() {
  return html`<div class="route-error"><${Logo} /><h1 class="t-2xl mt-24">Page not found</h1><p class="t-muted mt-8">That link doesn’t go anywhere (yet).</p><div class="mt-16"><${Button} variant="primary" href="/">Go home<//></div></div>`;
}

function Page({ load, pick, params, routeKey }) {
  // Keep the module paired with the loader it came from, so a stale page never renders on a new route.
  const [state, setState] = useState(() => ({ load, mod: cache.get(load) || null }));
  const mod = state.load === load ? state.mod : cache.get(load) || null;
  const setMod = (m) => setState({ load, mod: m });
  const [error, resetError] = useErrorBoundary((e) => console.error('[route]', e));
  const [loadError, setLoadError] = useState(null);
  useEffect(() => {
    if (cache.get(load)) { setMod(cache.get(load)); return; }
    let alive = true;
    setLoadError(null);
    load().then((m) => { cache.set(load, m); if (alive) setMod(m); }).catch((e) => { console.error('[route] load failed', e); if (alive) setLoadError(e); });
    return () => { alive = false; };
  }, [load]);
  if (error || loadError) return html`<${RouteError} error=${error || loadError} reset=${() => { resetError(); setLoadError(null); cache.delete(load); setMod(null); load().then((m) => { cache.set(load, m); setMod(m); }); }} />`;
  if (!mod) return html`<${Loading} />`;
  const C = pick ? mod[pick] : mod.default;
  return html`<${C} params=${params} key=${routeKey} />`;
}

let Palette = null, Helper = null, TourLauncher = null;
function GlobalOverlays() {
  const [, force] = useState(0);
  useEffect(() => {
    Promise.all([import('./shells/CommandPalette.js'), import('./shells/Helper.js'), import('./pages/tour/TourLauncher.js')]).then(([a, b, c]) => { Palette = a.default; Helper = b.default; TourLauncher = c.default; force((x) => x + 1); }).catch((e) => console.warn(e));
  }, []);
  useHotkey('mod+k', () => { paletteOpen.value = !paletteOpen.value; });
  return html`${Palette ? html`<${Palette} />` : null}${Helper ? html`<${Helper} />` : null}${TourLauncher ? html`<${TourLauncher} />` : null}<${OverlayHost} />`;
}

export function App() {
  const { path } = route.value;
  const hit = resolve(path);
  const ready = authReady.value;
  const me = session.value;

  useEffect(() => {
    if (ready && hit?.r.auth && !me) navigate(`/login?next=${encodeURIComponent(path + window.location.search)}`, { replace: true });
  }, [ready, path, !!me]);

  let body;
  if (!hit) body = html`<${PublicShell}><${NotFound} /><//>`;
  else if (!ready || (hit.r.auth && !me)) body = html`<${Loading} />`;
  else {
    const page = html`<${Page} load=${hit.r.load} pick=${hit.r.pick} params=${hit.params} routeKey=${hit.r.path + (hit.params.id || '')} />`;
    const shell = hit.r.shell === 'auto' ? (me ? 'app' : 'public') : hit.r.shell;
    body = shell === 'public' ? html`<${PublicShell}>${page}<//>`
      : shell === 'app' ? html`<${AppShell}>${page}<//>`
        : page;
  }
  return html`${body}<${GlobalOverlays} />`;
}
