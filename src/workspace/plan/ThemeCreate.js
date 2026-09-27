// Plan › Design › Create theme: importers (Figma · brand guide · GitHub · .zip · pasted CSS),
// a token editor and a live preview with contrast checks.
import { html, useState, useRef } from '../../lib/html.js';
import { updateProject, addCheckpoint } from '../../lib/store.js';
import { uid, cx } from '../../lib/util.js';
import { Button, Input, Textarea, Select, Slider, Tabs, Badge, Icon, Callout, toast, Spinner } from '../../ui/index.js';
import { ThemePreview, fullTheme, FONTS } from './ThemePreview.js';
import { parseThemeCss } from './themeParse.js';
import { readZipTextFiles } from './zip.js';
import { parseColor, contrast, paletteFromString, paletteFromImage, withLightness, lightnessOf, readableOn } from './color.js';

const IMPORTS = [
  { id: 'figma', label: 'Figma link', icon: 'figma' },
  { id: 'brand', label: 'Brand guide', icon: 'image' },
  { id: 'github', label: 'GitHub repo', icon: 'github' },
  { id: 'zip', label: '.zip', icon: 'box' },
  { id: 'css', label: 'Paste globals.css', icon: 'code' },
];
const TOKEN_FIELDS = [
  { key: 'primary', label: 'Primary', hint: 'Buttons, links, highlights' },
  { key: 'accent', label: 'Accent', hint: 'Badges, charts, secondary highlights' },
  { key: 'bg', label: 'Background', hint: 'The page behind everything' },
  { key: 'surface', label: 'Surface', hint: 'Cards, tables, panels' },
  { key: 'text', label: 'Text', hint: 'Body copy and headings' },
];
const SAMPLE_CSS = `:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --primary: 262 83% 58%;
  --accent: 24 95% 53%;
  --radius: 0.75rem;
}`;

export default function ThemeCreate({ project: p }) {
  const [tokens, setTokens] = useState(() => fullTheme(p.theme));
  const [name, setName] = useState('');
  const [tab, setTab] = useState('css');
  const [result, setResult] = useState(null); // { source, found, warnings, simulated }
  const set = (k, v) => setTokens((t) => ({ ...t, [k]: v }));
  const merge = (found, meta) => {
    setTokens((t) => ({ ...t, ...Object.fromEntries(Object.entries(found.tokens || found).filter(([, v]) => v != null && v !== '')) }));
    setResult(meta);
  };
  const cText = contrast(tokens.text, tokens.bg), cBtn = contrast(readableOn(tokens.primary), tokens.primary);
  const save = () => {
    const nm = name.trim() || `Custom theme ${(p.plan?.savedThemes?.length || 0) + 1}`;
    const tk = { ...tokens, preset: `custom_${uid().slice(0, 6)}`, name: nm };
    updateProject(p.id, (d) => {
      d.theme = { ...d.theme, ...tk };
      d.plan.savedThemes = [{ id: uid('th'), name: nm, tokens: tk, at: Date.now() }, ...(d.plan.savedThemes || [])].slice(0, 12);
    });
    addCheckpoint(p.id, { label: `Theme: ${nm}`, summary: 'Custom theme saved · 0 credits', kind: 'edit', credits: 0 });
    toast(`“${nm}” saved and applied — free`, { tone: 'success' });
    setName('');
  };
  return html`<div class="pl-create">
    <div class="pl-create__left">
      <div class="card">
        <div class="pl-create__tabs"><${Tabs} variant="pill" value=${tab} onChange=${(v) => { setTab(v); setResult(null); }} tabs=${IMPORTS} /></div>
        <div class="pl-create__import">
          ${tab === 'figma' ? html`<${FigmaImport} onTokens=${merge} />` : null}
          ${tab === 'brand' ? html`<${BrandImport} onTokens=${merge} />` : null}
          ${tab === 'github' ? html`<${GitHubImport} onTokens=${merge} />` : null}
          ${tab === 'zip' ? html`<${ZipImport} onTokens=${merge} />` : null}
          ${tab === 'css' ? html`<${CssImport} onTokens=${merge} />` : null}
          ${result ? html`<${ImportResult} r=${result} />` : null}
        </div>
      </div>
      <div class="card pl-tokens">
        <div class="pl-side-title"><${Icon} name="sliders" size=${15} />Tokens</div>
        <div class="pl-tokens__grid">
          ${TOKEN_FIELDS.map((f) => html`<${ColorField} key=${f.key} f=${f} value=${tokens[f.key]} onChange=${(v) => set(f.key, v)} />`)}
        </div>
        <div class="grid-2 mt-16">
          <div class="field"><div class="row between"><span class="field__label">Corner radius</span><span class="t-sm t-tabular">${tokens.radius}px</span></div>
            <${Slider} min=${0} max=${24} value=${tokens.radius} onChange=${(v) => set('radius', v)} aria-label="Corner radius" /></div>
          <${Select} label="Font" value=${FONTS.some((x) => x.value === tokens.font) ? tokens.font : 'Geist'} onValue=${(v) => set('font', v)} options=${FONTS} />
        </div>
        <div class="grid-2 mt-16">
          <${Textarea} label="Brand instructions" optional rows=${3} value=${tokens.instructions} onValue=${(v) => set('instructions', v)} placeholder="e.g. Friendly but precise. Never use exclamation marks. Charts use the accent colour." />
          <${LogoField} value=${tokens.logo} onChange=${(v) => set('logo', v)} />
        </div>
      </div>
    </div>
    <div class="pl-create__right">
      <div class="card pl-preview-card">
        <div class="row between mb-8"><div class="pl-side-title"><${Icon} name="eye" size=${15} />Live preview</div><${Badge} size="sm">Not applied yet<//></div>
        <${ThemePreview} theme=${tokens} name=${p.name} />
        <div class="pl-contrast">
          <${ContrastRow} label="Text on background" ratio=${cText} onFix=${() => set('text', lightnessOf(tokens.bg) > 50 ? withLightness(tokens.text, 12) : withLightness(tokens.text, 92))} />
          <${ContrastRow} label="Button label on primary" ratio=${cBtn} onFix=${() => set('primary', withLightness(tokens.primary, lightnessOf(tokens.primary) > 50 ? 30 : Math.max(12, lightnessOf(tokens.primary) - 12)))} />
        </div>
        <div class="row gap-8 mt-16">
          <${Input} size="sm" class="grow" value=${name} onValue=${setName} placeholder="Theme name, e.g. Northwind brand" onKeyDown=${(e) => e.key === 'Enter' && save()} />
          <${Button} variant="primary" size="sm" icon="save" onClick=${save}>Save theme<//>
        </div>
        <button class="pl-reset" onClick=${() => { setTokens(fullTheme(p.theme)); setResult(null); }}>Reset to the current theme</button>
      </div>
    </div>
  </div>`;
}

function ContrastRow({ label, ratio, onFix }) {
  const ok = ratio >= 4.5, large = ratio >= 3;
  return html`<div class="pl-contrast__row">
    <span class="grow t-sm">${label}</span>
    <span class="t-sm t-tabular t-faint">${ratio.toFixed(1)}:1</span>
    ${ok ? html`<${Badge} size="sm" tone="green" icon="check">AA<//>` : html`<${Badge} size="sm" tone=${large ? 'amber' : 'red'} icon="alert-triangle">${large ? 'Large text only' : 'Hard to read'}<//>`}
    ${!ok ? html`<button class="link t-sm" onClick=${onFix}>Fix</button>` : null}
  </div>`;
}

function ColorField({ f, value, onChange }) {
  const [draft, setDraft] = useState(null);
  const shown = draft ?? value;
  const commit = (v) => { const hex = parseColor(v); if (hex) onChange(hex); setDraft(null); };
  return html`<label class="pl-color">
    <span class="pl-color__swatch" style=${{ background: value }}><input type="color" value=${(value || '#000000').slice(0, 7).toLowerCase()} onInput=${(e) => onChange(e.currentTarget.value.toUpperCase())} aria-label=${`${f.label} colour`} /></span>
    <span class="grow col gap-2"><span class="t-sm t-medium">${f.label}</span><span class="t-xs t-faint">${f.hint}</span></span>
    <input class="input input--sm pl-color__hex" value=${shown} onInput=${(e) => setDraft(e.currentTarget.value)} onBlur=${(e) => commit(e.currentTarget.value)} onKeyDown=${(e) => e.key === 'Enter' && commit(e.currentTarget.value)} aria-label=${`${f.label} hex`} />
  </label>`;
}

function LogoField({ value, onChange }) {
  const ref = useRef(null);
  const pick = (file) => {
    if (!file) return;
    if (!/^image\//.test(file.type)) { toast('Pick an image file (PNG, SVG, JPG)', { tone: 'warn' }); return; }
    if (file.size > 300 * 1024) { toast('Logo is over 300 KB — please use a smaller file', { tone: 'warn' }); return; }
    const r = new FileReader();
    r.onload = () => onChange(r.result);
    r.readAsDataURL(file);
  };
  return html`<div class="field">
    <span class="field__label">Logo <span class="t-faint t-xs" style="font-weight:400">optional</span></span>
    <div class="pl-logo" onClick=${() => ref.current?.click()} role="button" tabindex="0" onKeyDown=${(e) => e.key === 'Enter' && ref.current?.click()}>
      ${value ? html`<img src=${value} alt="Logo preview" />` : html`<${Icon} name="upload" size=${18} />`}
      <span class="t-sm">${value ? 'Replace logo' : 'Upload a logo'}</span>
      ${value ? html`<button class="link t-xs" onClick=${(e) => { e.stopPropagation(); onChange(null); }}>Remove</button>` : html`<span class="t-xs t-faint">PNG or SVG, up to 300 KB</span>`}
    </div>
    <input ref=${ref} type="file" accept="image/*" class="sr-only" onChange=${(e) => { pick(e.currentTarget.files[0]); e.currentTarget.value = ''; }} />
  </div>`;
}

function ImportResult({ r }) {
  return html`<div class="pl-import-result">
    <div class="row gap-8 wrap">
      <${Icon} name=${r.found?.length ? 'check-circle' : 'alert-triangle'} size=${15} class=${r.found?.length ? 't-green' : 't-amber'} />
      <span class="t-sm t-strong">${r.found?.length ? `Found ${r.found.length} ${r.found.length === 1 ? 'token' : 'tokens'}` : 'Nothing found'}</span>
      <span class="t-xs t-faint">from ${r.source}</span>
      ${r.simulated ? html`<${Badge} size="sm" tone="amber" icon="flask">Prototype: simulated<//>` : null}
    </div>
    ${r.found?.length ? html`<ul class="pl-found">${r.found.map((f) => html`<li>${f.hex ? html`<span class="pl-found__sw" style=${{ background: f.hex }}></span>` : html`<${Icon} name=${f.token === 'font' ? 'type' : 'square'} size=${12} />`}<b>${f.token}</b><code>${f.source}</code><span class="t-faint t-truncate">${f.raw}</span></li>`)}</ul>` : null}
    ${(r.warnings || []).map((w) => html`<div class="t-xs t-amber mt-4">${w}</div>`)}
    ${r.found?.length ? html`<div class="t-xs t-faint mt-8">Applied to the token editor below — review, then Save theme.</div>` : null}
  </div>`;
}

// ---------------------------------------------------------------------------
// Importers
// ---------------------------------------------------------------------------
function CssImport({ onTokens }) {
  const [css, setCss] = useState('');
  const run = () => {
    const r = parseThemeCss(css);
    onTokens(r, { source: 'pasted CSS', found: r.found, warnings: r.warnings });
  };
  return html`<div class="col gap-8">
    <${Textarea} rows=${7} class="pl-mono" value=${css} onValue=${setCss} placeholder=${'Paste your globals.css, tailwind @theme block or :root variables…'} />
    <div class="row gap-8 wrap">
      <${Button} size="sm" variant="primary" icon="wand" disabled=${!css.trim()} onClick=${run}>Extract tokens<//>
      <button class="link t-sm" onClick=${() => setCss(SAMPLE_CSS)}>Try a sample</button>
      <span class="t-xs t-faint">Reads hex, rgb(), hsl() and shadcn-style HSL variables, radius and font.</span>
    </div>
  </div>`;
}

function FigmaImport({ onTokens }) {
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const m = url.match(/figma\.com\/(?:file|design|proto|board)\/([A-Za-z0-9]+)/);
  const run = async () => {
    if (!m) { toast('Paste a Figma file link (figma.com/design/…)', { tone: 'warn' }); return; }
    setBusy(true); await new Promise((r) => setTimeout(r, 900)); setBusy(false);
    const pal = paletteFromString(m[1]);
    onTokens({ ...pal, radius: 10 }, { source: `Figma file ${m[1].slice(0, 8)}…`, simulated: true, found: Object.entries(pal).map(([token, hex]) => ({ token, source: 'Figma style', raw: hex, hex })) });
  };
  return html`<div class="col gap-8">
    <div class="row gap-6"><${Badge} size="sm" tone="violet">Beta<//><span class="t-xs t-faint">Reads colour and text styles from a Figma file you can view.</span></div>
    <div class="row gap-8">
      <${Input} class="grow" value=${url} onValue=${setUrl} placeholder="https://www.figma.com/design/…" icon="link" />
      <${Button} variant="primary" loading=${busy} onClick=${run}>Import<//>
    </div>
    <${Callout} tone="amber" icon="flask"><b>Prototype:</b> Figma import is simulated here — colours are derived from the file key. Use “Paste globals.css” for a real import.<//>
  </div>`;
}

function BrandImport({ onTokens }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const pick = async (file) => {
    if (!file) return;
    setBusy(true);
    if (/^image\//.test(file.type)) {
      const pal = await paletteFromImage(file);
      setBusy(false);
      if (!pal) { toast('Could not read that image', { tone: 'error' }); return; }
      onTokens(pal, { source: file.name, found: Object.entries(pal).map(([token, hex]) => ({ token, source: 'image pixels', raw: hex, hex })) });
    } else {
      await new Promise((r) => setTimeout(r, 700)); setBusy(false);
      const pal = paletteFromString(file.name);
      onTokens(pal, { source: file.name, simulated: true, found: Object.entries(pal).map(([token, hex]) => ({ token, source: 'brand guide', raw: hex, hex })), warnings: ['PDF parsing runs on the server in production. For a real result here, upload a PNG/JPG of your logo or brand page.'] });
    }
  };
  return html`<div class="pl-drop" onClick=${() => ref.current?.click()} onDragOver=${(e) => e.preventDefault()} onDrop=${(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]); }} role="button" tabindex="0">
    ${busy ? html`<${Spinner} />` : html`<${Icon} name="upload" size=${20} />`}
    <div class="t-md t-medium">Drop a logo, screenshot or brand guide</div>
    <div class="t-xs t-faint">Images are analysed in your browser — we pick the dominant colours. PDF: simulated.</div>
    <input ref=${ref} type="file" accept="image/*,.pdf" class="sr-only" onChange=${(e) => { pick(e.currentTarget.files[0]); e.currentTarget.value = ''; }} />
  </div>`;
}

const CSS_CANDIDATES = ['app/globals.css', 'src/app/globals.css', 'styles/globals.css', 'src/styles/globals.css', 'src/index.css', 'src/globals.css', 'src/styles.css', 'src/app.css', 'styles.css', 'index.css', 'app/global.css'];
function GitHubImport({ onTokens }) {
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const run = async () => {
    setErr('');
    const m = repo.trim().replace(/\.git$/, '').match(/(?:github\.com\/)?([\w.-]+)\/([\w.-]+)/);
    if (!m) { setErr('Use the form owner/repo or a github.com link.'); return; }
    const [, owner, name] = m;
    setBusy(true);
    const tries = await Promise.allSettled(CSS_CANDIDATES.map(async (path) => {
      const res = await fetch(`https://raw.githubusercontent.com/${owner}/${name}/${encodeURIComponent(branch.trim() || 'main')}/${path}`);
      if (!res.ok) throw new Error(String(res.status));
      return { path, text: await res.text() };
    }));
    setBusy(false);
    const hit = tries.find((t) => t.status === 'fulfilled')?.value;
    if (!hit) { setErr(`No globals.css found on ${owner}/${name}@${branch || 'main'} (checked ${CSS_CANDIDATES.length} usual paths). Private repo? Connect GitHub, or paste the file instead.`); return; }
    const r = parseThemeCss(hit.text);
    onTokens(r, { source: `${owner}/${name}@${branch || 'main'} · ${hit.path}`, found: r.found, warnings: r.warnings });
  };
  return html`<div class="col gap-8">
    <div class="pl-gh-row">
      <${Input} value=${repo} onValue=${setRepo} placeholder="owner/repo" icon="github" onKeyDown=${(e) => e.key === 'Enter' && run()} />
      <${Input} value=${branch} onValue=${setBranch} placeholder="main" icon="git-branch" />
      <${Button} variant="primary" loading=${busy} onClick=${run}>Import<//>
    </div>
    <span class="t-xs t-faint">Reads a public repo’s global stylesheet straight from GitHub (e.g. <code>shadcn-ui/taxonomy</code>).</span>
    ${err ? html`<${Callout} tone="red" icon="alert-circle">${err}<//>` : null}
  </div>`;
}

function ZipImport({ onTokens }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const pick = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const files = await readZipTextFiles(await file.arrayBuffer(), (n) => /\.(css|scss)$/i.test(n) && !/node_modules\//.test(n));
      if (!files.length) throw new Error('No .css files inside that archive.');
      const score = (n) => (/globals?\.css$/i.test(n) ? 0 : /index\.css$|app\.css$|theme/i.test(n) ? 1 : 2);
      files.sort((a, b) => score(a.name) - score(b.name));
      const r = parseThemeCss(files.slice(0, 3).map((f) => f.text).join('\n'));
      onTokens(r, { source: `${file.name} · ${files[0].name}${files.length > 1 ? ` (+${files.length - 1} more)` : ''}`, found: r.found, warnings: r.warnings });
    } catch (e) {
      onTokens({}, { source: file.name, found: [], warnings: [e.message || 'Could not read that archive.'] });
    } finally { setBusy(false); }
  };
  return html`<div class="pl-drop" onClick=${() => ref.current?.click()} onDragOver=${(e) => e.preventDefault()} onDrop=${(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]); }} role="button" tabindex="0">
    ${busy ? html`<${Spinner} />` : html`<${Icon} name="box" size=${20} />`}
    <div class="t-md t-medium">Drop a project .zip</div>
    <div class="t-xs t-faint">Unzipped in your browser. We look for globals.css, index.css or theme files.</div>
    <input ref=${ref} type="file" accept=".zip,application/zip" class="sr-only" onChange=${(e) => { pick(e.currentTarget.files[0]); e.currentTarget.value = ''; }} />
  </div>`;
}
