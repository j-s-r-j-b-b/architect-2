// "/templates/:id" — read the plan before you commit: prompt, wireframe, promises, agents, data, quote.
import { html, useMemo, useState } from '../../lib/html.js';
import { navigate } from '../../lib/router.js';
import { newProject } from '../../lib/store.js';
import { Icon, Button, Badge, StatusPill, Empty, Tabs, CopyButton } from '../../ui/index.js';
import { IntegrationTile } from '../../shells/ConnectSheet.js';
import { AppRenderer } from '../../genapp/Renderer.js';
import { planFromTemplate } from '../../engine/generate.js';
import { templateById, integrationById, MODEL_TIERS, TEMPLATES } from '../../engine/catalog.js';
import { fmtCompact, plural } from '../../lib/util.js';
import { Frame, SafeRender, BrowserFrame } from './parts/common.js';
import { TemplateCard } from './parts/cards.js';

export const humanAction = (a = '') => { const s = a.replace(/_/g, ' '); return s[0] ? s[0].toUpperCase() + s.slice(1) : s; };
const tierLabel = (id) => MODEL_TIERS.find((m) => m.id === id)?.label || 'Balanced';

/** Project-shaped object the renderer can draw, built from a template's plan. */
export function templateProject(t, plan) {
  return newProject({ id: `tpl_${t.id}`, slug: t.id, name: t.title, prompt: t.prompt, icon: t.icon, description: plan.description, plan: plan.plan, theme: plan.theme, screens: plan.screens, data: plan.data, agents: plan.agents, integrations: plan.integrations, env: plan.env, status: 'ready', sample: true });
}

export function AgentSummary({ a, full }) {
  const [open, setOpen] = useState(false);
  return html`<div class="pb-agent">
    <div class="pb-agent__head">
      <span class="pb-agent__avatar" style=${{ '--agent': a.color }}><${Icon} name="bot" size=${15} /></span>
      <div class="grow" style="min-width:0">
        <div class="row gap-6 wrap"><span class="pb-agent__name">${a.name}</span><${Badge} size="sm" tone="violet">${a.kind === 'manager' ? 'Manager' : 'Specialist'}<//></div>
        <div class="pb-agent__role">${a.role}</div>
      </div>
      <span class="pb-meta" title="Model tier"><${Icon} name="cpu" size=${12} />${tierLabel(a.model?.tier)}</span>
    </div>
    <div class="pb-agent__rows">
      ${a.tools?.length ? html`<div class="pb-agent__row"><span class="pb-agent__k">Tools</span><span class="pb-agent__v">${a.tools.map((t) => html`<span class="pb-tool"><${IntegrationTile} id=${t.id} size="sm" />${t.name}${full ? html`<span class="pb-tool__acts">${t.actions.join(' · ')}</span>` : null}</span>`)}</span></div>` : null}
      ${a.delegatesTo?.length ? html`<div class="pb-agent__row"><span class="pb-agent__k">Hands off to</span><span class="pb-agent__v t-sm">${plural(a.delegatesTo.length, 'specialist')}</span></div>` : null}
      ${a.approvals?.length ? html`<div class="pb-agent__row"><span class="pb-agent__k">Must ask before</span><span class="pb-agent__v">${a.approvals.map((x) => html`<span class="pb-ask"><${Icon} name="lock" size=${11} />${humanAction(x)}</span>`)}</span></div>` : null}
      ${full && a.triggers?.length ? html`<div class="pb-agent__row"><span class="pb-agent__k">Runs when</span><span class="pb-agent__v t-sm">${a.triggers.map((t) => t.detail).join(' · ')}</span></div>` : null}
      ${full && a.guardrails ? html`<div class="pb-agent__row"><span class="pb-agent__k">Guardrails</span><span class="pb-agent__v">${[a.guardrails.pii && 'PII redaction', a.guardrails.injection && 'Prompt-injection shield', a.guardrails.toxicity && 'Toxicity filter', a.guardrails.groundedness && 'Groundedness check', ...(a.guardrails.blocked || []).map((b) => `Never: ${b}`)].filter(Boolean).map((g) => html`<${Badge} size="sm">${g}<//>`)}</span></div>` : null}
      ${full && a.limits ? html`<div class="pb-agent__row"><span class="pb-agent__k">Budget</span><span class="pb-agent__v t-sm">≤ $${a.limits.costPerRun} per run · ${a.limits.steps} steps max${a.limits.monthlyBudget ? ` · $${a.limits.monthlyBudget}/month` : ''}</span></div>` : null}
    </div>
    ${full ? html`<div class="pb-agent__instr">
      <button class="pb-agent__toggle" onClick=${() => setOpen(!open)} aria-expanded=${open}><${Icon} name=${open ? 'chevron-up' : 'chevron-down'} size=${14} />${open ? 'Hide instructions' : 'Show instructions'}</button>
      ${open ? html`<div class="pb-agent__text"><div class="row between mb-4"><span class="t-xs t-faint">What it does — plain-language instructions</span><${CopyButton} text=${a.instructions} label="Copy instructions" /></div>${a.instructions}</div>` : null}
    </div>` : null}
  </div>`;
}

export function WirePreview({ project, mode = 'wireframe', url, badge, height = 500 }) {
  const screens = project.screens || [];
  const [route, setRoute] = useState(screens[0]?.route || '/');
  const cur = screens.find((s) => s.route === route) || screens[0];
  return html`<div class="pb-preview">
    ${screens.length > 1 ? html`<${Tabs} variant="pill" value=${cur?.id} onChange=${(sid) => setRoute(screens.find((s) => s.id === sid)?.route)} tabs=${screens.map((s) => ({ id: s.id, label: s.title, icon: s.icon }))} />` : null}
    <${BrowserFrame} url=${url || `${project.slug || 'app'}.architect.space${cur?.route || ''}`} badge=${badge} height=${height}>
      <${SafeRender} label="The preview couldn’t be drawn — the plan below is still accurate.">
        ${screens.length ? html`<${AppRenderer} project=${project} route=${cur?.route} mode=${mode} device="desktop" onNavigate=${setRoute} />` : html`<div class="pb-preview-error">No screens in this plan yet</div>`}
      <//>
    <//>
  </div>`;
}

export default function TemplateDetail({ params }) {
  const t = templateById(params.id);
  const plan = useMemo(() => (t ? planFromTemplate(t.id) : null), [params.id]);
  const project = useMemo(() => (t && plan ? templateProject(t, plan) : null), [plan]);

  if (!t) return html`<${Frame}><div class="pb-empty-card"><${Empty} icon="layout-grid" title="That template doesn’t exist" body="It may have been renamed or removed. Browse the library, or describe what you want and get a plan in a minute." action=${html`<div class="row gap-8 center wrap"><${Button} variant="primary" href="/templates">Browse templates<//><${Button} variant="ghost" href="/">Describe it instead<//></div>`} /></div><//>`;

  const quote = plan?.plan?.quote || { credits: t.credits, minutes: t.minutes, lines: [], modelTier: 'balanced' };
  const promises = plan?.plan?.promises || [];
  const agents = plan?.agents || [];
  const tables = plan?.data?.tables || [];
  const ints = [...new Set([...(t.integrations || []), ...(plan?.integrations || []).map((i) => i.id)])];
  const use = () => navigate(`/new?template=${t.id}`);
  const customise = () => navigate(`/start?prompt=${encodeURIComponent(t.prompt)}`);
  const related = TEMPLATES.filter((x) => x.category === t.category && x.id !== t.id).slice(0, 3);

  return html`<${Frame}>
    <nav class="pb-crumb" aria-label="Breadcrumb"><a href="/templates">Templates</a><${Icon} name="chevron-right" size=${13} /><a href=${`/templates?cat=${encodeURIComponent(t.category)}`}>${t.category}</a><${Icon} name="chevron-right" size=${13} /><span>${t.title}</span></nav>

    <header class="pb-thead">
      <span class="pb-thead__icon"><${Icon} name=${t.icon} size=${24} /></span>
      <div class="grow" style="min-width:0">
        <h1 class="pb-thead__title">${t.title}</h1>
        <div class="pb-thead__meta">
          <${StatusPill} status="planned" label="Ready-made plan" />
          ${t.popular ? html`<${Badge} tone="outline">Popular<//>` : null}
          <span class="pb-meta"><${Icon} name="users" size=${12} />${fmtCompact(t.uses)} projects started</span>
          <span class="pb-meta"><${Icon} name="bot" size=${12} />${plural(agents.length || t.agents.length, 'agent')}</span>
          <span class="pb-meta"><${Icon} name="layout-dashboard" size=${12} />${plural(plan?.screens?.length || t.screens, 'screen')}</span>
        </div>
      </div>
      <div class="pb-thead__actions">
        <${Button} variant="secondary" icon="pencil" onClick=${customise}>Customise the prompt<//>
        <${Button} variant="primary" iconRight="arrow-right" onClick=${use}>Use this template<//>
      </div>
    </header>

    <div class="pb-detail">
      <div class="pb-detail__main">
        <div class="pb-promptcard">
          <div class="pb-promptcard__k"><${Icon} name="quote-mark" size=${14} />The prompt behind it</div>
          <p class="pb-promptcard__text">${t.prompt}</p>
          <div class="pb-promptcard__foot"><span class="t-xs t-faint">Change any words before planning — the plan is regenerated for you, free.</span><button class="link t-sm" onClick=${customise}>Edit prompt</button></div>
        </div>

        <section class="pb-block">
          <div class="pb-block__head"><h2 class="pb-block__title">Wireframe preview</h2><span class="t-sm t-faint">Layout only — your theme and real content are generated when you build.</span></div>
          ${project ? html`<${WirePreview} project=${project} badge=${html`<${Badge} size="sm" tone="blueprint" icon="circle-dashed">Wireframe<//>`} height=${460} />` : null}
        </section>

        <section class="pb-block">
          <div class="pb-block__head"><h2 class="pb-block__title">What you’ll get</h2><span class="t-sm t-faint">${plural(promises.length, 'promise')} — each is checked before the build is called done.</span></div>
          <ol class="pb-promises">
            ${promises.map((p) => html`<li class=${'pb-promise' + (p.status === 'deferred' ? ' is-deferred' : '')}>
              <span class="pb-promise__id">${p.id}</span>
              <div class="grow" style="min-width:0">
                <div class="pb-promise__title">${p.title}</div>
                <div class="pb-promise__detail">${p.status === 'deferred' ? p.deferredReason || p.detail : p.detail}</div>
              </div>
              <div class="pb-promise__side">
                <${StatusPill} status=${p.status === 'deferred' ? 'deferred' : 'planned'} size="sm" />
                ${p.cost ? html`<span class="pb-meta">${p.cost[0]}–${p.cost[1]} cr</span>` : null}
              </div>
            </li>`)}
          </ol>
        </section>

        <section class="pb-block">
          <div class="pb-block__head"><h2 class="pb-block__title">Agents</h2><span class="t-sm t-faint">Each has a job, tools and boundaries you can change in plain words.</span></div>
          <div class="pb-agents">${agents.map((a) => html`<${AgentSummary} a=${a} />`)}</div>
        </section>

        <section class="pb-block">
          <div class="pb-block__head"><h2 class="pb-block__title">Screens & data</h2></div>
          <div class="pb-sd">
            ${(plan?.screens || []).map((s) => html`<div class="pb-sd__item"><span class="pb-sd__icon"><${Icon} name=${s.icon || 'layout-dashboard'} size=${15} /></span><div class="grow" style="min-width:0"><div class="pb-sd__t">${s.title}</div><div class="pb-sd__s t-mono">${s.route} · ${plural(s.blocks.length, 'section')}</div></div></div>`)}
            ${tables.map((tb) => html`<div class="pb-sd__item"><span class="pb-sd__icon pb-sd__icon--data"><${Icon} name="database" size=${15} /></span><div class="grow" style="min-width:0"><div class="pb-sd__t">${tb.name}</div><div class="pb-sd__s">${plural(tb.columns.length, 'field')}${tb.connection ? ` · from ${integrationById(tb.connection).name}` : ''}</div></div><${StatusPill} status=${tb.source === 'live' ? 'real' : tb.source === 'test' ? 'test' : 'sample'} size="sm" /></div>`)}
          </div>
        </section>
      </div>

      <aside class="pb-detail__aside">
        <div class="pb-quote">
          <div class="pb-quote__k">Estimated quote</div>
          <div class="pb-quote__big">${quote.credits[0]}–${quote.credits[1]}<span> credits</span></div>
          <div class="pb-quote__sub"><${Icon} name="timer" size=${13} />${quote.minutes[0]}–${quote.minutes[1]} min · ${tierLabel(quote.modelTier)} models</div>
          ${quote.lines?.length ? html`<div class="pb-quote__lines">${quote.lines.map((l) => html`<div class="pb-quote__line"><span>${l.label}</span><span class="t-tabular">${l.credits[0]}–${l.credits[1]}</span></div>`)}</div>` : null}
          <div class="pb-quote__free"><${Icon} name="check-circle" size=${14} />Planning is free. You approve the final quote before anything is built.</div>
          <${Button} variant="primary" full size="lg" iconRight="arrow-right" onClick=${use}>Use this template<//>
          <${Button} variant="ghost" full icon="pencil" onClick=${customise}>Customise the prompt<//>
        </div>
        <div class="pb-side-card">
          <div class="pb-side-card__title">Connections</div>
          ${ints.map((id) => { const it = integrationById(id); return html`<div class="pb-int"><${IntegrationTile} id=${id} /><div class="grow" style="min-width:0"><div class="pb-int__n">${it.name}</div><div class="pb-int__d">${it.builtIn ? 'Built-in · no API key' : it.auth === 'apikey' ? 'API key when you launch' : 'Sign in when you launch'}</div></div></div>`; })}
          <p class="pb-side-card__note">Until you connect, the app runs on clearly labelled sample data.</p>
        </div>
      </aside>
    </div>

    ${related.length ? html`<section class="pb-block pb-block--related">
      <div class="pb-block__head"><h2 class="pb-block__title">More in ${t.category}</h2><a class="link t-sm" href=${`/templates?cat=${encodeURIComponent(t.category)}`}>See all</a></div>
      <div class="pb-tgrid">${related.map((x) => html`<${TemplateCard} t=${x} compact />`)}</div>
    </section>` : null}
  <//>`;
}
