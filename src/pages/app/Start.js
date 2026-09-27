// Start: describe · help me decide · templates · import — plus "continue where you left off".
import { html } from '../../lib/html.js';
import { AppPage } from '../../shells/AppShell.js';
import { PromptBox } from '../../shells/PromptBox.js';
import { session, projectList, projectsReady } from '../../lib/store.js';
import { route, setQuery, navigate, Link } from '../../lib/router.js';
import { Tabs, Button, Icon, Empty, Skeleton, Badge } from '../../ui/index.js';
import { TEMPLATES } from '../../engine/catalog.js';
import { IntegrationTile } from '../../shells/ConnectSheet.js';
import { fmtRange, fmtNumber } from '../../lib/util.js';
import { ProjectCard, greeting } from './parts/common.js';

export const IMPORT_SOURCES = [
  { id: 'github', icon: 'github', title: 'GitHub repository', desc: 'Pick a repo. We read it, explain it and keep building on a branch.' },
  { id: 'zip', icon: 'package', title: 'ZIP upload', desc: 'Drop an exported project folder as a .zip file.' },
  { id: 'builder', icon: 'blocks', title: 'From another builder', desc: 'Lovable, Bolt, v0, Replit or Base44 exports.' },
  { id: 'design', icon: 'figma', title: 'Figma or a URL', desc: 'Start from a design file or a live website.' },
  { id: 'agent', icon: 'bot', title: 'Agent code', desc: 'LangGraph, CrewAI or OpenAI Agents code — we wrap it in an app.' },
];

const TABS = [
  { id: 'describe', label: 'Describe', icon: 'message-circle' },
  { id: 'decide', label: 'Help me decide', icon: 'compass' },
  { id: 'templates', label: 'Templates', icon: 'layout-grid' },
  { id: 'import', label: 'Import', icon: 'upload' },
];

function TemplateCard({ t }) {
  return html`<${Link} href=${`/templates/${t.id}`} class="ap-tcard">
    <div class="row gap-8"><span class="ap-tcard__icon"><${Icon} name=${t.icon} size=${16} /></span><span class="t-strong grow t-truncate">${t.title}</span>${t.popular ? html`<${Badge} tone="blueprint" size="sm">Popular<//>` : null}</div>
    <p class="t-sm t-muted ap-tcard__prompt">${t.prompt}</p>
    <div class="row gap-8 mt-auto">
      <span class="row gap-4">${t.integrations.slice(0, 3).map((i) => html`<${IntegrationTile} id=${i} size="sm" />`)}</span>
      <span class="t-xs t-faint grow">${t.agents.length} agents · ${t.screens} screens</span>
      <span class="t-xs t-muted t-tabular">${fmtRange(t.credits)} cr</span>
    </div>
  <//>`;
}

export default function Start() {
  const q = route.value.query;
  const tab = TABS.some((t) => t.id === q.tab) ? q.tab : 'describe';
  const first = session.value?.name?.split(' ')[0] || 'there';
  const recent = projectList.value.slice(0, 6);
  const templates = [...TEMPLATES].sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0) || b.uses - a.uses).slice(0, 6);

  return html`<${AppPage}>
    <div class="ap-start">
      <div class="ap-start__hero">
        <div class="ap-start__eyebrow">${greeting()}, ${first}</div>
        <h1 class="ap-start__title">What are we building today?</h1>
        <${Tabs} variant="pill" class="ap-start__tabs" tabs=${TABS} value=${tab} onChange=${(id) => setQuery({ tab: id === 'describe' ? undefined : id })} />
        <div class="ap-start__panel anim-fade" key=${tab}>
          ${tab === 'describe' ? html`<${PromptBox} autoFocus initial=${q.prompt || ''} />
            <p class="t-xs t-faint t-center mt-12">Planning and quotes are free. Nothing is built or spent until you approve a price.</p>` : null}
          ${tab === 'decide' ? html`<div class="ap-decide">
            <div class="ap-decide__art"><${Icon} name="compass" size=${28} /></div>
            <div class="grow">
              <div class="t-lg t-strong">Not sure what to build?</div>
              <p class="t-md t-muted mt-4">Answer four quick questions about your work. We’ll suggest three apps with the hours they save, the agents they use and the tools they connect to.</p>
              <div class="row gap-8 wrap mt-12 t-sm t-muted">
                ${['Your role', 'Where time goes', 'Tools you use', 'What “better” looks like'].map((s, i) => html`<span class="ap-step-chip"><b>${i + 1}</b>${s}</span>`)}
              </div>
              <div class="mt-16"><${Button} variant="primary" iconRight="arrow-right" href="/start/consultant">Start the 2-minute consultant<//></div>
            </div>
          </div>` : null}
          ${tab === 'templates' ? html`<div class="ap-grid-3">${templates.map((t) => html`<${TemplateCard} t=${t} />`)}</div>
            <div class="row mt-12"><span class="grow t-sm t-faint">${fmtNumber(TEMPLATES.length)} templates, each a starting prompt you can edit.</span><${Button} variant="ghost" size="sm" iconRight="arrow-right" href="/templates">Browse all<//></div>` : null}
          ${tab === 'import' ? html`<div class="ap-grid-3">${IMPORT_SOURCES.map((s) => html`<button type="button" class="ap-source" onClick=${() => navigate(`/start/import?source=${s.id}`)}>
              <span class="ap-source__icon"><${Icon} name=${s.icon} size=${18} /></span>
              <span class="t-strong">${s.title}</span><span class="t-sm t-muted">${s.desc}</span>
            </button>`)}</div>
            <p class="t-xs t-faint mt-12">Importing never changes your original. We work on a copy and show you what we found before anything runs.</p>` : null}
        </div>
      </div>

      <section class="mt-32">
        <div class="row mb-12"><h2 class="t-lg t-strong grow">Continue where you left off</h2>${recent.length ? html`<${Button} variant="ghost" size="sm" iconRight="arrow-right" href="/projects">All projects<//>` : null}</div>
        ${!projectsReady.value ? html`<div class="ap-grid-3">${[0, 1, 2].map(() => html`<${Skeleton} h=${210} r=${12} />`)}</div>`
          : recent.length ? html`<div class="ap-grid-3">${recent.map((p) => html`<${ProjectCard} project=${p} />`)}</div>`
            : html`<${Empty} icon="folder" title="No projects yet" body="Describe an app above — your first plan and quote are free." />`}
      </section>
    </div>
  <//>`;
}
