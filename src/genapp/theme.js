// Theme → CSS custom properties for the generated app (.gx root).
// Everything the generated app paints derives from these few variables, so a
// theme change (or a dark preset) restyles every block without leaking out.
import { THEME_PRESETS } from '../engine/catalog.js';

const DARK_FALLBACK = { bg: '#0F1117', surface: '#171A21', text: '#E8EAED' };

function hexToRgb(hex) {
  let h = String(hex || '').trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Relative luminance 0..1 (WCAG). Unknown colours count as mid-grey. */
export function luminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const [r, g, b] = rgb.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Merge a project's theme with its preset (dark presets bring their own bg/surface/text). */
export function resolveTheme(theme = {}) {
  const preset = THEME_PRESETS.find((t) => t.id === theme.preset) || null;
  const base = preset || THEME_PRESETS[0];
  const presetDark = !!(preset && preset.dark);
  const dark = presetDark || theme.mode === 'dark';
  const pal = presetDark ? base : dark ? DARK_FALLBACK : base;
  const radius = Number.isFinite(Number(theme.radius)) ? Number(theme.radius) : base.radius;
  return {
    primary: theme.primary || base.primary,
    accent: theme.accent || base.accent,
    bg: theme.bg || pal.bg,
    surface: theme.surface || pal.surface,
    text: theme.text || pal.text,
    radius: Math.max(0, Math.min(24, radius)),
    font: theme.font || base.font || 'Geist',
    dark,
    density: theme.density || 'comfortable',
  };
}

const SANS = '"Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';

/** Style object for the .gx root (Preact sets --custom-props via setProperty). */
export function themeStyle(theme) {
  const t = resolveTheme(theme);
  const serif = /serif/i.test(t.font) && !/sans/i.test(t.font);
  const mono = /mono/i.test(t.font);
  const body = serif || /^geist$/i.test(t.font) ? SANS : mono ? `"${t.font}", ui-monospace, monospace` : `"${t.font}", ${SANS}`;
  const head = serif ? `"${t.font}", Georgia, "Times New Roman", serif` : body;
  return {
    style: {
      '--gx-primary': t.primary,
      '--gx-accent': t.accent,
      '--gx-bg': t.bg,
      '--gx-surface': t.surface,
      '--gx-text': t.text,
      '--gx-on-primary': luminance(t.primary) > 0.5 ? '#0B0D12' : '#FFFFFF',
      '--gx-radius': `${t.radius}px`,
      '--gx-radius-sm': `${Math.max(2, Math.round(t.radius * 0.6))}px`,
      '--gx-font': body,
      '--gx-head': head,
      colorScheme: t.dark ? 'dark' : 'light',
    },
    serif,
    dark: t.dark,
    compact: t.density === 'compact',
  };
}
