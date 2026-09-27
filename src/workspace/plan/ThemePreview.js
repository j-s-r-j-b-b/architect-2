// A small, faithful mock of a generated app painted with theme tokens (live preview).
import { html } from '../../lib/html.js';
import { mix, readableOn } from './color.js';
import { themePreset } from '../../engine/catalog.js';

export const FONTS = [
  { value: 'Geist', label: 'Geist (clean sans)', css: '"Geist", system-ui, sans-serif' },
  { value: 'Instrument Serif', label: 'Instrument Serif (editorial)', css: '"Instrument Serif", Georgia, serif' },
  { value: 'System', label: 'System UI', css: 'system-ui, -apple-system, "Segoe UI", sans-serif' },
  { value: 'Georgia', label: 'Georgia (classic serif)', css: 'Georgia, "Times New Roman", serif' },
  { value: 'Geist Mono', label: 'Geist Mono (technical)', css: '"Geist Mono", ui-monospace, monospace' },
];
export const fontCss = (f) => FONTS.find((x) => x.value === f)?.css || `"${f}", system-ui, sans-serif`;

/** Fill in bg/surface/text for older themes that only stored primary/accent. */
export function fullTheme(theme = {}) {
  const pr = themePreset(theme.preset);
  const dark = theme.mode === 'dark';
  return {
    preset: theme.preset || 'custom', primary: theme.primary || pr.primary, accent: theme.accent || pr.accent,
    bg: theme.bg || (theme.preset === pr.id ? pr.bg : dark ? '#0E1117' : '#F7F8FA'),
    surface: theme.surface || (theme.preset === pr.id ? pr.surface : dark ? '#161B22' : '#FFFFFF'),
    text: theme.text || (theme.preset === pr.id ? pr.text : dark ? '#E6EDF3' : '#111827'),
    radius: theme.radius ?? pr.radius ?? 10, font: theme.font || pr.font || 'Geist', mode: theme.mode || (pr.dark ? 'dark' : 'light'),
    density: theme.density || 'comfortable', logo: theme.logo || null, instructions: theme.instructions || '', name: theme.name || null,
  };
}

export function themeVars(t) {
  return {
    '--tp-primary': t.primary, '--tp-on-primary': readableOn(t.primary), '--tp-accent': t.accent,
    '--tp-bg': t.bg, '--tp-surface': t.surface, '--tp-text': t.text,
    '--tp-muted': mix(t.text, t.surface, 0.45), '--tp-border': mix(t.text, t.surface, 0.87),
    '--tp-soft': mix(t.primary, t.surface, 0.87), '--tp-radius': `${t.radius}px`, '--tp-font': fontCss(t.font),
  };
}

export function ThemePreview({ theme, name = 'Your app', compact }) {
  const t = fullTheme(theme);
  return html`<div class=${'pl-tp' + (compact ? ' pl-tp--compact' : '')} style=${themeVars(t)} aria-label="Theme preview">
    <aside class="pl-tp__side">
      <div class="pl-tp__brand">${t.logo ? html`<img src=${t.logo} alt="" />` : html`<span class="pl-tp__mark">${(name || 'A')[0]}</span>`}<span>${name}</span></div>
      <span class="pl-tp__nav is-active">Dashboard</span><span class="pl-tp__nav">Leads</span><span class="pl-tp__nav">Outreach</span>
    </aside>
    <div class="pl-tp__main">
      <div class="pl-tp__head"><div><div class="pl-tp__h">Good morning</div><div class="pl-tp__s">6 hot leads need a follow-up</div></div><span class="pl-tp__btn">Add lead</span></div>
      <div class="pl-tp__kpis">
        ${[['New today', '18'], ['Hot leads', '6'], ['Reply rate', '31%']].map(([l, v], i) => html`<div class="pl-tp__card"><div class="pl-tp__s">${l}</div><div class="pl-tp__v">${v}</div>${i === 2 ? html`<div class="pl-tp__bar"><span style="width:31%"></span></div>` : null}</div>`)}
      </div>
      ${compact ? null : html`<div class="pl-tp__row">
        <div class="pl-tp__card pl-tp__table">
          ${[['Priya Raman', 'Hot', 91], ['Daniel Okafor', 'Hot', 86], ['Liam Chen', 'Warm', 64]].map(([n, tier, s]) => html`<div class="pl-tp__tr"><span>${n}</span><span class=${'pl-tp__chip' + (tier === 'Hot' ? ' is-accent' : '')}>${tier}</span><span class="pl-tp__s">${s}</span></div>`)}
        </div>
        <div class="pl-tp__card pl-tp__chat">
          <div class="pl-tp__bubble">Which leads should I call today?</div>
          <div class="pl-tp__bubble is-agent">Call Priya and Daniel first — both asked about pricing.</div>
        </div>
      </div>`}
    </div>
  </div>`;
}
