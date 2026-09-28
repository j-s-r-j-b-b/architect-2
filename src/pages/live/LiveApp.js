// Public app page "/a/:slug": renders a published app full-page, or a local draft
// with ?preview=1&project=<id>. Friendly 404 when nothing is published at the slug.
import { html, useState, useEffect } from '../../lib/html.js';
import { AppRenderer } from '../../genapp/Renderer.js';
import { getPublished } from '../../lib/db.js';
import { getProject, projectsReady, projectList } from '../../lib/store.js';
import { route as routeSig, navigate as navigateTo } from '../../lib/router.js';
import { Icon, Button, Logo } from '../../ui/index.js';

const deviceFor = (w) => (w < 640 ? 'mobile' : w < 1000 ? 'tablet' : 'desktop');

function BuiltWith() {
  return html`<a class="pv-built" href="/" target="_blank" rel="noopener" aria-label="Built with Architect">
    <span class="pv-built__txt">Built with</span><${Logo} size=${16} tag=${false} href=${null} />
  </a>`;
}

export default function LiveApp({ params }) {
  const slug = params.slug;
  const q = routeSig.value.query || {};
  const draftId = q.preview === '1' || q.preview === 'true' ? q.project : null;
  const draft = draftId ? getProject(draftId) : null;
  const waitDraft = !!draftId && !draft && !projectsReady.value;
  const [state, setState] = useState({ status: 'loading', app: null });
  const [r, setR] = useState(`/${params.rest || ''}`);
  const [device, setDevice] = useState(deviceFor(window.innerWidth));

  useEffect(() => {
    const on = () => setDevice(deviceFor(window.innerWidth));
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  useEffect(() => {
    if (draft || waitDraft) return;
    let alive = true;
    setState({ status: 'loading', app: null });
    getPublished(slug)
      .then((app) => { if (alive) setState({ status: app ? 'ok' : 'missing', app }); })
      .catch(() => { if (alive) setState({ status: 'missing', app: null }); });
    return () => { alive = false; };
  }, [slug, !!draft, waitDraft]);

  const app = draft || state.app;
  useEffect(() => {
    const prev = document.title;
    if (app?.name) document.title = draft ? `${app.name} · Draft preview` : app.name;
    else if (state.status === 'missing') document.title = 'App not found · Architect';
    return () => { document.title = prev; };
  }, [app?.name, !!draft, state.status]);

  // The URL is the source of truth: in-app links, Back/Forward and deep links all change the screen.
  useEffect(() => { setR(`/${params.rest || ''}`); }, [params.rest]);
  const onNavigate = (to) => {
    setR(to);
    navigateTo(`/a/${slug}${to === '/' ? '' : to}${location.search}`, { scroll: false });
  };

  if (!app && (waitDraft || state.status === 'loading')) {
    return html`<div class="pv-live pv-live--center" aria-busy="true"><span class="pv-spinner"></span><span class="t-sm t-muted">Loading app…</span></div>`;
  }

  if (!app) {
    const own = (projectList.value || []).find((p) => p.slug === slug && !p.deletedAt);
    return html`<div class="pv-live pv-live--center">
      <div class="pv-404">
        <div class="pv-404__mark"><${Icon} name="globe" size=${22} /></div>
        <div class="pv-404__code">404</div>
        <h1 class="pv-404__title">This app isn’t live (yet)</h1>
        <p class="pv-404__body">Nothing is published at <code>/a/${slug}</code>. It may have been unpublished, or the link has a typo.</p>
        ${draftId ? html`<p class="pv-404__body t-sm">The draft this link points to isn’t saved in this browser.</p>` : null}
        <div class="pv-404__actions">
          ${own ? html`<${Button} variant="primary" icon="eye" href=${`/a/${slug}?preview=1&project=${own.id}`}>Preview your draft<//>` : null}
          <${Button} variant=${own ? 'secondary' : 'primary'} href="/">Go to Architect<//>
        </div>
      </div>
      <${BuiltWith} />
    </div>`;
  }

  return html`<div class="pv-live">
    ${draft ? html`<div class="pv-live__banner" role="status">
      <${Icon} name="eye" size=${14} /><strong>Draft preview — not published</strong>
      <span class="pv-live__sub">Only you can see this. It uses sample data.</span>
      <a class="pv-live__back" href=${`/p/${draft.id}/app`}>Back to workspace</a>
    </div>` : null}
    <div class="pv-live__app">
      <${AppRenderer} project=${app} route=${r} device=${device} live=${!draft} onNavigate=${onNavigate} />
    </div>
    <${BuiltWith} />
  </div>`;
}
