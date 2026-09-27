// Import an existing project and keep working: GitHub · ZIP · other builders · Figma/URL · agent code.
// Flow: source → choose → trust gate → animated Understanding report → open project.
import { html, useState, useEffect, useMemo } from '../../lib/html.js';
import { AppPage } from '../../shells/AppShell.js';
import { route, navigate, setQuery } from '../../lib/router.js';
import { createProject, addCheckpoint, logActivity, addChat } from '../../lib/store.js';
import { githubAccount, connectGitHub, listRepos, inspectRepo, isRealGitHub } from '../../lib/github.js';
import { startProject } from '../../engine/conversation.js';
import { Button, Icon, Input, Textarea, Badge, Callout, Card, Spinner, Skeleton, CodeBlock, Empty, toast, PageHeader, Segmented } from '../../ui/index.js';
import { cx, sleep, timeAgo, plural } from '../../lib/util.js';
import { frameworkById } from '../../engine/catalog.js';
import { IMPORT_SOURCES } from './Start.js';
import { analyzeRepo, simulatedTree, projectFromReport } from './parts/importAnalysis.js';

const BUILDERS = [{ value: 'lovable', label: 'Lovable' }, { value: 'bolt', label: 'Bolt' }, { value: 'v0', label: 'v0' }, { value: 'replit', label: 'Replit' }, { value: 'base44', label: 'Base44' }];
const STEPS = ['Source', 'Choose', 'Review scripts', 'Understand', 'Open'];

function Stepper({ at }) {
  return html`<ol class="ap-stepper">${STEPS.map((s, i) => html`<li class=${cx(i < at && 'is-done', i === at && 'is-active')}><span>${i < at ? html`<${Icon} name="check" size=${12} />` : i + 1}</span>${s}</li>`)}</ol>`;
}

function SourcePicker() {
  return html`<div class="ap-grid-3">${IMPORT_SOURCES.map((s) => html`<button type="button" class="ap-source" onClick=${() => setQuery({ source: s.id })}>
    <span class="ap-source__icon"><${Icon} name=${s.icon} size=${18} /></span><span class="t-strong">${s.title}</span><span class="t-sm t-muted">${s.desc}</span>
  </button>`)}</div>`;
}

function GitHubChoose({ onPick }) {
  const acct = githubAccount.value;
  const [repos, setRepos] = useState(null);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  useEffect(() => {
    if (!acct.connected) return;
    let alive = true;
    listRepos().then((r) => alive && setRepos(r)).catch((e) => alive && setErr(e.message));
    return () => { alive = false; };
  }, [acct.connected]);
  if (!acct.connected) {
    return html`<${Card} padded class="ap-connect">
      <div class="ap-connect__icon"><${Icon} name="github" size=${26} /></div>
      <div class="t-lg t-strong">Connect GitHub</div>
      <p class="t-sm t-muted">We ask for read access to pick a repository, and write access only to a branch we create. Your main branch is never changed without a pull request.</p>
      <${Button} variant="ink" icon="github" loading=${busy} onClick=${async () => { setBusy(true); try { await connectGitHub(); toast('GitHub connected', { tone: 'success' }); } catch (e) { toast(e.message || 'Could not connect', { tone: 'error' }); } setBusy(false); }}>Connect GitHub<//>
      ${!isRealGitHub() ? html`<div class="t-xs t-faint row gap-4"><${Icon} name="flask" size=${12} />Prototype: a demo GitHub account with sample repositories.</div>` : null}
    <//>`;
  }
  const list = (repos || []).filter((r) => !q || (r.full_name + ' ' + (r.description || '')).toLowerCase().includes(q.toLowerCase()));
  return html`<div>
    <div class="row gap-8 mb-12 wrap">
      <div class="grow" style="min-width:200px"><${Input} icon="search" placeholder="Search repositories" value=${q} onValue=${setQ} /></div>
      <${Badge} tone=${acct.real ? 'green' : 'amber'} icon=${acct.real ? 'github' : 'flask'}>${acct.real ? `@${acct.login}` : `@${acct.login} · demo`}<//>
    </div>
    ${err ? html`<${Callout} tone="red" icon="alert-circle">${err}<//>` : null}
    ${!repos && !err ? html`<div class="col gap-8">${[0, 1, 2].map(() => html`<${Skeleton} h=${62} r=${10} />`)}</div>` : null}
    ${repos && !list.length ? html`<${Empty} icon="search" title="No repositories match" body="Try a different search." />` : null}
    <div class="ap-repos">${list.map((r) => html`<button type="button" class="ap-repo" onClick=${() => onPick(r)}>
      <${Icon} name=${r.private ? 'lock' : 'book-open'} size=${16} class="t-faint" />
      <span class="grow col gap-2" style="min-width:0"><span class="t-strong t-truncate">${r.full_name}</span><span class="t-xs t-muted t-truncate">${r.description || 'No description'}</span></span>
      <span class="t-xs t-faint t-nowrap ap-repo__meta">${r.language || ''} · ${timeAgo(r.updated_at)}</span>
      <${Icon} name="chevron-right" size=${16} class="t-faint" />
    </button>`)}</div>
  </div>`;
}

function OtherChoose({ source, onPick }) {
  const [file, setFile] = useState(null);
  const [builder, setBuilder] = useState('lovable');
  const [url, setUrl] = useState('');
  const [code, setCode] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const pickFile = (e) => { const f = e.currentTarget.files?.[0]; if (f) setFile({ name: f.name, size: f.size }); };
  const fileName = (file?.name || '').replace(/\.(zip|py|ts|js)$/i, '');

  if (source === 'design') {
    const ok = /^https?:\/\/\S+\.\S+/.test(url.trim());
    const isFigma = /figma\.com/.test(url);
    const go = () => {
      setBusy(true);
      const host = (() => { try { return new URL(url.trim()).hostname.replace(/^www\./, ''); } catch { return 'the page'; } })();
      const prompt = isFigma
        ? `Build the app shown in this Figma design (${url.trim()}). Match its screens, layout and colours, and make every button and form work.${notes ? ` Notes: ${notes}` : ''}`
        : `Recreate the core of ${host} (${url.trim()}) as an app: its main pages, navigation and look, with working forms and data.${notes ? ` Notes: ${notes}` : ''}`;
      const p = startProject({ prompt, source: { type: 'import', ref: url.trim(), provider: isFigma ? 'figma' : 'url' } });
      toast('Planning from your design', { tone: 'success' });
      navigate(`/p/${p.id}/plan`);
    };
    return html`<${Card} padded class="col gap-12">
      <${Input} label="Figma file or website URL" icon=${isFigma ? 'figma' : 'globe'} placeholder="https://www.figma.com/design/… or https://example.com" value=${url} onValue=${setUrl} error=${url && !ok ? 'Enter a full URL starting with https://' : null} />
      <${Textarea} label="Anything to change?" optional rows=${2} placeholder="e.g. Keep the layout, but add a sign-in and a bookings table" value=${notes} onValue=${setNotes} />
      <${Callout} tone="blueprint" icon="info">We turn the design into a plan first — you approve the screens and the price before anything is built.<//>
      <div class="row"><span class="grow"></span><${Button} variant="primary" iconRight="arrow-right" disabled=${!ok} loading=${busy} onClick=${go}>Plan from this design<//></div>
    <//>`;
  }
  if (source === 'agent') {
    return html`<${Card} padded class="col gap-12">
      <${Textarea} label="Paste your agent code" rows=${8} class="t-mono" placeholder=${'from langgraph.graph import StateGraph\n…'} value=${code} onValue=${setCode} />
      <div class="row gap-8 wrap"><span class="t-sm t-muted">or</span><label class="btn btn--secondary btn--sm"><${Icon} name="upload" size=${14} /><span>Upload .py / .ts file</span><input type="file" accept=".py,.ts,.js,.zip" hidden onChange=${pickFile} /></label>${file ? html`<${Badge} icon="file-code">${file.name}<//>` : null}</div>
      <div class="row"><span class="grow t-xs t-faint">We detect LangGraph, CrewAI and OpenAI Agents SDK automatically.</span>
        <${Button} variant="primary" iconRight="arrow-right" disabled=${!code.trim() && !file} onClick=${() => { const nm = fileName || 'my-agent'; onPick({ name: nm, ref: file?.name || 'pasted code', tree: simulatedTree('agent', nm, code) }); }}>Analyse agent<//></div>
    <//>`;
  }
  // zip + builder
  return html`<${Card} padded class="col gap-12">
    ${source === 'builder' ? html`<div class="col gap-6"><span class="field__label">Which builder?</span><${Segmented} options=${BUILDERS} value=${builder} onChange=${setBuilder} /></div>
      <${Input} label="Project URL" optional icon="link" placeholder=${`https://${builder === 'v0' ? 'v0.dev' : builder + (builder === 'replit' ? '.com' : '.dev')}/projects/…`} value=${url} onValue=${setUrl} />` : null}
    <label class=${cx('ap-drop', file && 'is-filled')}>
      <input type="file" accept=".zip" hidden onChange=${pickFile} />
      <${Icon} name=${file ? 'check-circle' : 'upload'} size=${22} />
      <span class="t-strong">${file ? file.name : 'Choose a .zip export'}</span>
      <span class="t-xs t-muted">${file ? `${(file.size / 1024).toFixed(0)} KB · ready to analyse` : 'Up to 200 MB. node_modules and build folders are ignored.'}</span>
    </label>
    <div class="row gap-8"><span class="grow t-xs t-faint row gap-4"><${Icon} name="flask" size=${12} />Prototype: analysis is simulated from the file name.</span>
      <${Button} variant="primary" iconRight="arrow-right" disabled=${!file && !url} onClick=${() => {
        const nm = fileName || (url.split('/').filter(Boolean).pop() || `${builder}-export`);
        onPick({ name: nm, ref: file?.name || url, tree: simulatedTree(source === 'builder' && ['lovable', 'bolt'].includes(builder) ? 'builder-vite' : 'next', nm) });
      }}>Analyse project<//></div>
  <//>`;
}

function TrustGate({ report, onChoose }) {
  const auto = report.scripts.filter((s) => s.auto);
  return html`<${Card} padded class="col gap-12">
    <div class="row gap-12"><span class="ap-trust__icon"><${Icon} name="shield-check" size=${20} /></span><div class="grow"><div class="t-lg t-strong">Do you trust this code?</div><div class="t-sm t-muted">${report.ref} · ${plural(report.files.length, 'file')}. Running its scripts lets us install, test and preview it in an isolated sandbox.</div></div></div>
    <div class="ap-scripts">
      ${report.scripts.length ? report.scripts.map((s) => html`<div class="ap-script"><code class="t-mono">${s.name}</code><span class="grow t-sm t-muted t-mono t-truncate">${s.cmd}</span>${s.auto ? html`<${Badge} tone="amber" size="sm" icon="alert-triangle">Runs on install<//>` : null}</div>`) : html`<div class="t-sm t-muted p-12">No scripts found — nothing will run automatically.</div>`}
    </div>
    ${auto.length ? html`<${Callout} tone="amber" icon="alert-triangle"><b>${auto.map((s) => s.name).join(', ')}</b> runs automatically when dependencies install. It looks standard, but only trust code you know.<//>` : null}
    <div class="ap-trust__opts">
      <button type="button" class="ap-trust__opt" onClick=${() => onChoose(true)}><${Icon} name="play" size=${16} /><span class="t-strong">Trust & run</span><span class="t-xs t-muted">Install, run tests and preview in a sandbox. No network access to your systems.</span></button>
      <button type="button" class="ap-trust__opt" onClick=${() => onChoose(false)}><${Icon} name="eye" size=${16} /><span class="t-strong">Read-only</span><span class="t-xs t-muted">Just read the files. Nothing is executed. You can trust it later.</span></button>
    </div>
  <//>`;
}

function Understanding({ report, trusted, onOpen, opening }) {
  const lines = useMemo(() => [
    `Reading ${plural(report.files.length, 'file')}`,
    `Detecting the stack${report.stack.length ? ` — ${report.stack[0].label}` : ''}`,
    `Mapping ${plural(report.routes.length, 'route')}${report.api.length ? ` and ${plural(report.api.length, 'API endpoint')}` : ''}`,
    `Finding agents — ${report.agents.length ? report.agents.map((a) => frameworkById(a.framework).name).filter((v, i, a) => a.indexOf(v) === i).join(', ') : 'none'}`,
    `Checking secrets — ${report.secrets.length} needed`,
    trusted ? `Running ${plural(report.tests.length, 'test file')} in the sandbox` : 'Skipping tests (read-only)',
    'Writing AGENTS.md so every agent knows the rules',
  ], [report, trusted]);
  const [at, setAt] = useState(0);
  useEffect(() => {
    let alive = true;
    (async () => { for (let i = 1; i <= lines.length; i++) { await sleep(420 + Math.random() * 380); if (!alive) return; setAt(i); } })();
    return () => { alive = false; };
  }, [lines]);
  const done = at >= lines.length;
  return html`<div class="col gap-16">
    <${Card} padded>
      <div class="row gap-8 mb-8"><span class="t-strong grow">${done ? 'Here’s what we found' : 'Understanding your project…'}</span>${!done ? html`<${Spinner} size="sm" />` : html`<${Badge} tone="green" icon="check">Done<//>`}</div>
      <ul class="ap-analyse">${lines.map((l, i) => html`<li class=${cx(i < at && 'is-done', i === at && 'is-active')}>${i < at ? html`<${Icon} name="check" size=${13} />` : i === at ? html`<${Spinner} size="sm" />` : html`<${Icon} name="circle" size=${13} />`}<span>${l}</span></li>`)}</ul>
    <//>
    ${done ? html`<div class="ap-report anim-rise">
      <${Card} title="Stack" icon="layers">${report.stack.length ? html`<div class="row gap-6 wrap">${report.stack.map((s) => html`<${Badge} icon=${s.icon}>${s.kind}: ${s.label}<//>`)}</div>` : html`<span class="t-sm t-muted">Not detected</span>`}<//>
      <${Card} title=${`Screens (${report.routes.length})`} icon="monitor">${report.routes.length ? html`<ul class="ap-kv">${report.routes.map((r) => html`<li><code>${r.route}</code><span class="t-faint t-truncate">${r.file}</span></li>`)}</ul>` : html`<span class="t-sm t-muted">No UI routes — we’ll add a simple console screen.</span>`}<//>
      <${Card} title=${`Agents (${report.agents.length})`} icon="bot">${report.agents.length ? html`<ul class="ap-kv">${report.agents.map((a) => html`<li><span class="t-strong">${a.name}</span><${Badge} tone="violet" size="sm">${frameworkById(a.framework).name}<//></li>`)}</ul>` : html`<span class="t-sm t-muted">None found. You can add agents after import.</span>`}<//>
      <${Card} title="Secrets needed" icon="key">${report.secrets.length ? html`<div class="row gap-6 wrap">${report.secrets.map((s) => html`<${Badge} tone="amber" icon="lock">${s}<//>`)}</div><div class="t-xs t-faint mt-8">From .env.example — you’ll add values in a secure sheet. They’re never stored in code.</div>` : html`<span class="t-sm t-muted">None</span>`}<//>
      <${Card} title="Tests" icon="flask">${report.tests.length ? html`<div class="t-sm">${plural(report.tests.length, 'test file')} ${trusted ? html`· <span class="t-green t-strong">${report.tests.length * 3} passed</span> <${Badge} tone="amber" size="sm">Prototype: simulated<//>` : html`· <span class="t-muted">not run (read-only)</span>`}</div>` : html`<span class="t-sm t-muted">No tests found — Architect will add smoke tests.</span>`}<//>
      <${Card} title="AGENTS.md (generated)" icon="file-text" class="ap-report__wide"><${CodeBlock} code=${report.agentsMd} lang="md" title="AGENTS.md" maxHeight=${220} /><//>
    </div>
    <div class="row gap-8 wrap"><span class="grow t-sm t-muted">We’ll create a checkpoint first, so you can always return to exactly what you imported.</span><${Button} variant="primary" size="lg" iconRight="arrow-right" loading=${opening} onClick=${onOpen}>Open project<//></div>` : null}
  </div>`;
}

export default function ImportWizard() {
  const q = route.value.query;
  const source = q.source === 'figma' ? 'design' : q.source;
  const src = IMPORT_SOURCES.find((s) => s.id === source);
  const [report, setReport] = useState(null);
  const [inspecting, setInspecting] = useState(null);
  const [trusted, setTrusted] = useState(null);
  const [opening, setOpening] = useState(false);
  useEffect(() => { setReport(null); setTrusted(null); }, [source]);

  const pickRepo = async (repo) => {
    setInspecting(repo.full_name);
    try {
      const info = await inspectRepo(repo.full_name);
      setReport(analyzeRepo({ ...info, name: repo.name, ref: repo.full_name, defaultBranch: info.defaultBranch || repo.default_branch }));
    } catch (e) { toast(`Couldn’t read ${repo.full_name}: ${e.message}`, { tone: 'error' }); }
    setInspecting(null);
  };
  const pickOther = ({ name, ref, tree }) => setReport(analyzeRepo({ ...tree, name, ref }));
  const open = async () => {
    setOpening(true);
    await sleep(350);
    const partial = projectFromReport(report, { sourceType: source, trusted });
    const p = createProject(partial);
    addCheckpoint(p.id, { label: 'Imported', summary: `Exactly as imported from ${report.ref}`, kind: 'import' });
    logActivity(p.id, { actor: 'You', kind: 'import', plain: `Imported “${p.name}” from ${source === 'github' ? 'GitHub' : src?.title}. Found ${plural(report.routes.length, 'screen')} and ${plural(report.agents.length, 'agent')}.`, technical: `ref:${report.ref} · files:${report.files.length} · trusted:${trusted}` });
    addChat(p.id, { type: 'text', text: `I read **${report.ref}** and mapped ${plural(report.routes.length, 'route')}, ${plural(report.agents.length, 'agent')} and ${plural(report.secrets.length, 'secret')}. ${report.secrets.length ? `Add ${report.secrets.join(', ')} when you’re ready to connect real data. ` : ''}Tell me what to change next — I’ll work on a branch.` });
    toast(`${p.name} imported`, { tone: 'success' });
    navigate(`/p/${p.id}/app`);
  };

  const stepAt = !src ? 0 : !report ? 1 : trusted === null ? 2 : 3;
  return html`<${AppPage} narrow>
    <${PageHeader} crumb=${html`<a href="/start?tab=import" class="link t-sm">← Start</a>`} title=${src ? `Import: ${src.title}` : 'Import an existing project'} subtitle="Bring what you already have and keep working on it with Architect." />
    <${Stepper} at=${stepAt} />
    <div class="mt-16 anim-fade" key=${stepAt + (source || '')}>
      ${!src ? html`<${SourcePicker} />` : null}
      ${src && !report ? html`${source === 'github' ? html`<${GitHubChoose} onPick=${pickRepo} />` : html`<${OtherChoose} source=${source} onPick=${pickOther} />`}
        ${inspecting ? html`<div class="ap-inspecting"><${Spinner} size="sm" /> Reading ${inspecting}…</div>` : null}
        <div class="mt-12"><button class="link t-sm" onClick=${() => setQuery({ source: null })}>← Choose a different source</button></div>` : null}
      ${report && trusted === null ? html`<${TrustGate} report=${report} onChoose=${setTrusted} /><div class="mt-12"><button class="link t-sm" onClick=${() => setReport(null)}>← Back</button></div>` : null}
      ${report && trusted !== null ? html`<${Understanding} report=${report} trusted=${trusted} onOpen=${open} opening=${opening} />` : null}
    </div>
  <//>`;
}
