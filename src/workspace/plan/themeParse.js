// Extract theme tokens (colours, radius, font) from real CSS: globals.css, Tailwind v4 @theme,
// shadcn "bare HSL" variables, plain :root variables or ordinary declarations.
import { parseColor, saturationOf, lightnessOf } from './color.js';

const MAP = {
  primary: ['primary', 'color-primary', 'brand', 'brand-primary', 'color-brand', 'primary-500', 'primary-600', 'theme-primary', 'main', 'blue-600'],
  accent: ['accent', 'color-accent', 'secondary', 'color-secondary', 'brand-secondary', 'highlight', 'accent-500'],
  bg: ['background', 'color-background', 'bg', 'body-bg', 'page', 'canvas', 'base-100', 'color-bg'],
  surface: ['card', 'color-card', 'surface', 'color-surface', 'popover', 'panel', 'paper', 'base-200'],
  text: ['foreground', 'color-foreground', 'text', 'color-text', 'body-color', 'fg', 'ink', 'base-content', 'text-primary'],
};
const RADIUS = ['radius', 'border-radius', 'rounded', 'radius-md', 'radius-lg', 'radius-base'];
const FONT = ['font-sans', 'font-family', 'font-body', 'font', 'font-base'];
const COLOR_RE = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/g;

function stripDarkBlocks(src) {
  let out = '', i = 0;
  const re = /(@media[^{]*prefers-color-scheme\s*:\s*dark[^{]*|\.dark[^{,]*|\[data-theme=["']?dark["']?\][^{,]*)\{/gi;
  let m;
  while ((m = re.exec(src))) {
    out += src.slice(i, m.index);
    let depth = 1, j = m.index + m[0].length;
    while (j < src.length && depth) { if (src[j] === '{') depth++; else if (src[j] === '}') depth--; j++; }
    i = j; re.lastIndex = j;
  }
  return out + src.slice(i);
}

function toPx(v) {
  const m = String(v).trim().match(/^(-?[\d.]+)(px|rem|em)?/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return Math.round(m[2] === 'rem' || m[2] === 'em' ? n * 16 : n);
}

/**
 * @returns {{tokens:{primary?,accent?,bg?,surface?,text?,radius?,font?}, found:{token:string, source:string, raw:string, hex?:string}[], warnings:string[], colors:number}}
 */
export function parseThemeCss(css) {
  const warnings = [], found = [];
  const src = stripDarkBlocks(String(css || '').replace(/\/\*[\s\S]*?\*\//g, ''));
  const vars = new Map();
  const declRe = /(--[\w-]+)\s*:\s*([^;{}]+)/g;
  let d;
  while ((d = declRe.exec(src))) { const k = d[1].slice(2).toLowerCase(); if (!vars.has(k)) vars.set(k, d[2].trim()); }
  const resolve = (raw, depth = 0) => {
    const m = String(raw).match(/^var\(\s*--([\w-]+)\s*(?:,\s*([^)]+))?\)$/);
    if (!m || depth > 6) return raw;
    const v = vars.get(m[1].toLowerCase());
    return v != null ? resolve(v, depth + 1) : (m[2] ? resolve(m[2].trim(), depth + 1) : raw);
  };
  const tokens = {};
  for (const [token, names] of Object.entries(MAP)) {
    for (const n of names) {
      if (!vars.has(n)) continue;
      const raw = resolve(vars.get(n));
      const hex = parseColor(raw);
      if (hex) { tokens[token] = hex; found.push({ token, source: `--${n}`, raw: vars.get(n), hex }); break; }
      if (/oklch|oklab|lab\(|lch\(|color-mix/i.test(raw)) warnings.push(`--${n} uses ${raw.split('(')[0]}() which isn't converted yet — pick that colour by hand.`);
    }
  }
  for (const n of RADIUS) {
    if (!vars.has(n)) continue;
    const px = toPx(resolve(vars.get(n)));
    if (px != null) { tokens.radius = Math.max(0, Math.min(24, px)); found.push({ token: 'radius', source: `--${n}`, raw: vars.get(n) }); break; }
  }
  for (const n of FONT) {
    if (!vars.has(n)) continue;
    const fam = resolve(vars.get(n)).split(',')[0].replace(/["']/g, '').trim();
    if (fam && !/^var\(/.test(fam)) { tokens.font = fam; found.push({ token: 'font', source: `--${n}`, raw: vars.get(n) }); break; }
  }
  // Plain declarations on body/html/:root when variables are missing
  const bodyBlock = src.match(/(?:^|[}\s,])(?:body|html|:root)\s*\{([^}]*)\}/);
  if (bodyBlock) {
    const b = bodyBlock[1];
    const bg = b.match(/background(?:-color)?\s*:\s*([^;]+)/); const col = b.match(/(?:^|[;\s])color\s*:\s*([^;]+)/); const ff = b.match(/font-family\s*:\s*([^;]+)/);
    if (!tokens.bg && bg && parseColor(resolve(bg[1].trim()))) { tokens.bg = parseColor(resolve(bg[1].trim())); found.push({ token: 'bg', source: 'body background', raw: bg[1].trim(), hex: tokens.bg }); }
    if (!tokens.text && col && parseColor(resolve(col[1].trim()))) { tokens.text = parseColor(resolve(col[1].trim())); found.push({ token: 'text', source: 'body color', raw: col[1].trim(), hex: tokens.text }); }
    if (!tokens.font && ff) { tokens.font = ff[1].split(',')[0].replace(/["']/g, '').trim(); found.push({ token: 'font', source: 'body font-family', raw: ff[1].trim() }); }
  }
  if (tokens.radius == null) {
    const counts = {};
    for (const m of src.matchAll(/border-radius\s*:\s*([\d.]+(?:px|rem))/g)) { const px = toPx(m[1]); if (px != null && px < 30) counts[px] = (counts[px] || 0) + 1; }
    const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (best) { tokens.radius = +best[0]; found.push({ token: 'radius', source: 'most-used border-radius', raw: `${best[0]}px` }); }
  }
  // Fallback: rank every colour literal in the file
  const all = new Map();
  for (const m of src.matchAll(COLOR_RE)) { const hex = parseColor(m[0]); if (hex) all.set(hex, (all.get(hex) || 0) + 1); }
  for (const raw of vars.values()) { const hex = /^-?[\d.]+(deg)?\s+[\d.]+%\s+[\d.]+%/.test(raw) ? parseColor(raw) : null; if (hex) all.set(hex, (all.get(hex) || 0) + 1); }
  const ranked = [...all.entries()].sort((a, b) => b[1] - a[1]).map(([hex]) => hex);
  const vivid = ranked.filter((h) => saturationOf(h) > 35 && lightnessOf(h) > 20 && lightnessOf(h) < 75);
  if (!tokens.primary && vivid[0]) { tokens.primary = vivid[0]; found.push({ token: 'primary', source: 'most-used vivid colour', raw: vivid[0], hex: vivid[0] }); }
  if (!tokens.accent && vivid.find((h) => h !== tokens.primary)) { const h = vivid.find((x) => x !== tokens.primary); tokens.accent = h; found.push({ token: 'accent', source: 'second vivid colour', raw: h, hex: h }); }
  if (!tokens.bg) { const light = ranked.find((h) => lightnessOf(h) > 94); if (light) { tokens.bg = light; found.push({ token: 'bg', source: 'lightest colour', raw: light, hex: light }); } }
  if (!tokens.text) { const dark = ranked.find((h) => lightnessOf(h) < 18); if (dark) { tokens.text = dark; found.push({ token: 'text', source: 'darkest colour', raw: dark, hex: dark }); } }
  if (!found.length) warnings.push('No colours, radius or fonts found. Paste the file that defines your CSS variables (often globals.css or index.css).');
  return { tokens, found, warnings, colors: all.size };
}
