// Plan › Design — Theme Manager: presets, three design directions, and "Create theme".
import { html, useMemo } from '../../lib/html.js';
import { updateProject, addCheckpoint, logActivity } from '../../lib/store.js';
import { cx, timeAgo } from '../../lib/util.js';
import { Badge, Icon, toast, Button, IconButton } from '../../ui/index.js';
import { THEME_PRESETS } from '../../engine/catalog.js';
import { AppThumbnail } from '../../genapp/Renderer.js';
import { SectionHead } from './shared.js';
import { fullTheme } from './ThemePreview.js';
import { shiftHue, withLightness, withSaturation, hexToRgb, rgbToHsl } from './color.js';
import ThemeCreate from './ThemeCreate.js';

/** Apply a theme as a free, checkpointed change. */
export function applyTheme(p, tokens, label) {
  const prev = p.theme;
  updateProject(p.id, (d) => { d.theme = { ...d.theme, ...tokens }; });
  addCheckpoint(p.id, { label: `Theme: ${label}`, summary: 'Free change · 0 credits', kind: 'edit', credits: 0 });
  logActivity(p.id, { plain: `Switched the app theme to ${label}.`, technical: `theme.primary → ${tokens.primary} · accent ${tokens.accent} · radius ${tokens.radius}px · font ${tokens.font}`, actor: 'You', kind: 'change' });
  toast(`Theme changed to ${label} — free, saved as a checkpoint`, { tone: 'success', action: { label: 'Undo', onClick: () => updateProject(p.id, (d) => { d.theme = prev; }) } });
}

const presetTokens = (t) => ({ preset: t.id, name: t.name, primary: t.primary, accent: t.accent, bg: t.bg, surface: t.surface, text: t.text, radius: t.radius, font: t.font, mode: t.dark ? 'dark' : 'light' });

function directions(p) {
  const base = fullTheme(p.theme).primary;
  const hue = rgbToHsl(hexToRgb(base) || { r: 47, g: 91, b: 234 }).h;
  return [
    { id: 'dir-calm', name: 'Calm & trustworthy', why: 'Quiet neutrals and one confident colour. Reads as reliable for a team that lives in it all day.',
      tokens: { preset: 'dir-calm', name: 'Calm & trustworthy', primary: withLightness(withSaturation(base, 60), 36), accent: shiftHue(withLightness(base, 45), 160), bg: '#F5F6F8', surface: '#FFFFFF', text: '#101828', radius: 8, font: 'Geist', mode: 'light' } },
    { id: 'dir-warm', name: 'Warm & friendly', why: 'Softer corners and a warm lead colour. Feels approachable for customers and first-time users.',
      tokens: { preset: 'dir-warm', name: 'Warm & friendly', primary: withLightness(withSaturation(shiftHue(base, 24 - hue), 78), 46), accent: withLightness(withSaturation(shiftHue(base, 170 - hue), 60), 36), bg: '#FFF8F1', surface: '#FFFFFF', text: '#231A14', radius: 16, font: 'Geist', mode: 'light' } },
    { id: 'dir-bold', name: 'Bold & focused', why: 'A dark canvas that makes numbers and agent activity stand out. Good for dashboards on big screens.',
      tokens: { preset: 'dir-bold', name: 'Bold & focused', primary: withLightness(withSaturation(base, 85), 64), accent: shiftHue(withLightness(base, 60), -70), bg: '#0C1017', surface: '#151B24', text: '#E7ECF3', radius: 12, font: 'Geist', mode: 'dark' } },
  ];
}

function Swatches({ t }) {
  return html`<span class="pl-swatches">${['primary', 'accent', 'bg', 'surface', 'text'].map((k) => html`<span style=${{ background: t[k] }} title=${`${k} ${t[k]}`}></span>`)}</span>`;
}

export default function Design({ project: p }) {
  const cur = fullTheme(p.theme);
  const saved = p.plan?.savedThemes || [];
  const dirs = useMemo(() => directions(p), [p.theme?.primary]);
  const activeName = THEME_PRESETS.find((t) => t.id === cur.preset)?.name || cur.name || 'Custom theme';
  const removeSaved = (id) => updateProject(p.id, (d) => { d.plan.savedThemes = (d.plan.savedThemes || []).filter((x) => x.id !== id); });
  return html`<div class="pl-design">
    <div class="card pl-current">
      <${Swatches} t=${cur} />
      <div class="grow">
        <div class="t-md t-strong">Current theme: ${activeName}</div>
        <div class="t-xs t-faint">${cur.font} · ${cur.radius}px corners · ${cur.mode === 'dark' ? 'Dark' : 'Light'}</div>
      </div>
      <${Badge} tone="green" icon="check">Theme changes are free<//>
    </div>

    <section>
      <${SectionHead} icon="palette" title="Presets" sub="One click. Every change is free and saved as a checkpoint you can restore." />
      <div class="pl-presets">
        ${THEME_PRESETS.map((t) => html`<${PresetCard} key=${t.id} t=${presetTokens(t)} active=${cur.preset === t.id} onClick=${() => cur.preset !== t.id && applyTheme(p, presetTokens(t), t.name)} />`)}
      </div>
      ${saved.length ? html`<div class="mt-16">
        <div class="pl-label mb-8">Your themes</div>
        <div class="pl-presets">
          ${saved.map((s) => html`<div class="pl-saved" key=${s.id}>
            <${PresetCard} t=${s.tokens} active=${cur.preset === s.tokens.preset && cur.primary === s.tokens.primary} sub=${`Saved ${timeAgo(s.at)}`} onClick=${() => applyTheme(p, s.tokens, s.name)} />
            <${IconButton} size="sm" icon="trash" label="Delete saved theme" class="pl-saved__del" onClick=${() => removeSaved(s.id)} />
          </div>`)}
        </div>
      </div>` : null}
    </section>

    <section>
      <${SectionHead} icon="sparkles" title="3 design directions" sub="Generated from your current colours. Pick one as a starting point — you can fine-tune it below." />
      <div class="pl-dirs">
        ${dirs.map((d) => html`<div class="card pl-dir" key=${d.id}>
          <div class="pl-dir__thumb" style=${{ background: d.tokens.bg }}><${AppThumbnail} project=${{ ...p, theme: { ...p.theme, ...d.tokens } }} /></div>
          <div class="pl-dir__body">
            <div class="row between gap-8"><div class="t-md t-strong">${d.name}</div><${Swatches} t=${d.tokens} /></div>
            <p class="t-sm t-muted mt-4">${d.why}</p>
            <${Button} size="sm" class="mt-12" icon=${cur.preset === d.id ? 'check' : 'wand'} disabled=${cur.preset === d.id} onClick=${() => applyTheme(p, d.tokens, d.name)}>${cur.preset === d.id ? 'In use' : 'Use this'}<//>
          </div>
        </div>`)}
      </div>
    </section>

    <section>
      <${SectionHead} icon="pencil" title="Create a theme" sub="Import from Figma, a brand guide, a GitHub repo, a .zip or pasted CSS — or set tokens by hand. The preview updates live." />
      <${ThemeCreate} project=${p} />
    </section>
  </div>`;
}

function PresetCard({ t, active, onClick, sub }) {
  return html`<button class=${cx('pl-preset', active && 'is-active')} onClick=${onClick} aria-pressed=${active}>
    <span class="pl-preset__art" style=${{ background: t.bg, borderRadius: `${Math.min(t.radius, 14)}px` }}>
      <span class="pl-preset__bar" style=${{ background: t.surface }}><i style=${{ background: t.primary }}></i></span>
      <span class="pl-preset__blocks">
        <span style=${{ background: t.surface, borderRadius: `${Math.min(t.radius, 10) / 2}px` }}><b style=${{ background: t.text }}></b></span>
        <span style=${{ background: t.primary, borderRadius: `${Math.min(t.radius, 10) / 2}px` }}></span>
        <span style=${{ background: t.accent, borderRadius: `${Math.min(t.radius, 10) / 2}px` }}></span>
      </span>
    </span>
    <span class="pl-preset__name">${t.name || 'Theme'}${active ? html`<${Icon} name="check" size=${14} />` : null}</span>
    <span class="pl-preset__meta">${sub || `${t.radius}px · ${t.font === 'Instrument Serif' ? 'Serif' : t.font}${t.mode === 'dark' ? ' · Dark' : ''}`}</span>
  </button>`;
}
