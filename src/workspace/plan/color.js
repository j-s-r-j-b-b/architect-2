// Colour maths for the Theme Manager: parsing CSS colour syntaxes, conversions, contrast.
import { clamp } from '../../lib/util.js';

const NAMED = { white: '#ffffff', black: '#000000', red: '#ff0000', blue: '#0000ff', green: '#008000', navy: '#000080', teal: '#008080', purple: '#800080', orange: '#ffa500', gray: '#808080', grey: '#808080' };

export function hexToRgb(hex) {
  let h = String(hex || '').trim().replace('#', '');
  if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(h)) return null;
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 };
}
export function rgbToHex({ r, g, b }) {
  const x = (n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
  return `#${x(r)}${x(g)}${x(b)}`.toUpperCase();
}
export function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360; s = clamp(s, 0, 100) / 100; l = clamp(l, 0, 100) / 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return { r: f(0) * 255, g: f(8) * 255, b: f(4) * 255 };
}
export function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}
const hslHex = (h, s, l) => rgbToHex(hslToRgb(h, s, l));

/**
 * Parse any common CSS colour: #hex, rgb()/rgba(), hsl()/hsla(), named, and the
 * shadcn/tailwind "bare HSL" form `222.2 47.4% 11.2%`. Returns '#RRGGBB' or null.
 */
export function parseColor(input) {
  const v = String(input || '').trim().replace(/\s*!important$/, '').toLowerCase();
  if (!v) return null;
  if (NAMED[v]) return NAMED[v].toUpperCase();
  if (v.startsWith('#')) { const rgb = hexToRgb(v); return rgb ? rgbToHex(rgb) : null; }
  let m = v.match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const parts = m[1].split(/[\s,/]+/).filter(Boolean).slice(0, 3).map((x) => (x.endsWith('%') ? parseFloat(x) * 2.55 : parseFloat(x)));
    if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) return rgbToHex({ r: parts[0], g: parts[1], b: parts[2] });
    return null;
  }
  m = v.match(/^hsla?\(([^)]+)\)$/);
  const bare = v.match(/^(-?[\d.]+)(deg)?\s+([\d.]+)%\s+([\d.]+)%(\s*\/\s*[\d.]+%?)?$/);
  const body = m ? m[1] : bare ? v : null;
  if (body) {
    const parts = body.split(/[\s,/]+/).filter(Boolean);
    const h = parseFloat(parts[0]), s = parseFloat(parts[1]), l = parseFloat(parts[2]);
    if ([h, s, l].some((n) => Number.isNaN(n))) return null;
    return hslHex(h, s, l);
  }
  return null;
}

export function luminance(hex) {
  const c = hexToRgb(hex); if (!c) return 0;
  const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
}
export function contrast(a, b) {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
/** Best text colour (#FFFFFF or near-black) on a background. */
export function readableOn(bg) { return contrast(bg, '#FFFFFF') >= contrast(bg, '#111111') ? '#FFFFFF' : '#111111'; }

export function shiftHue(hex, deg) { const c = hexToRgb(hex); if (!c) return hex; const { h, s, l } = rgbToHsl(c); return hslHex(h + deg, s, l); }
export function withLightness(hex, l) { const c = hexToRgb(hex); if (!c) return hex; const x = rgbToHsl(c); return hslHex(x.h, x.s, l); }
export function withSaturation(hex, s) { const c = hexToRgb(hex); if (!c) return hex; const x = rgbToHsl(c); return hslHex(x.h, s, x.l); }
export function tint(hex, amount = 0.9) {
  const c = hexToRgb(hex); if (!c) return hex;
  return rgbToHex({ r: c.r + (255 - c.r) * amount, g: c.g + (255 - c.g) * amount, b: c.b + (255 - c.b) * amount });
}
export function mix(a, b, t = 0.5) {
  const x = hexToRgb(a), y = hexToRgb(b); if (!x || !y) return a;
  return rgbToHex({ r: x.r + (y.r - x.r) * t, g: x.g + (y.g - x.g) * t, b: x.b + (y.b - x.b) * t });
}
export function saturationOf(hex) { const c = hexToRgb(hex); return c ? rgbToHsl(c).s : 0; }
export function lightnessOf(hex) { const c = hexToRgb(hex); return c ? rgbToHsl(c).l : 0; }

/** Deterministic palette from any string (used where an import is simulated). */
export function paletteFromString(str = '') {
  let h = 0; for (const ch of String(str)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const hue = h % 360;
  return { primary: hslHex(hue, 70, 42), accent: hslHex(hue + 150, 72, 50), bg: hslHex(hue, 25, 97.5), surface: '#FFFFFF', text: hslHex(hue, 30, 10) };
}

/**
 * Extract a small palette from an image file (brand guide screenshot / logo) by sampling
 * pixels on a canvas and bucketing them. Resolves { primary, accent, bg, text } or null.
 */
export function paletteFromImage(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const size = 72;
        const cv = document.createElement('canvas'); cv.width = size; cv.height = size;
        const ctx = cv.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        const buckets = new Map();
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue;
          const key = ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4);
          const b = buckets.get(key) || { n: 0, r: 0, g: 0, b: 0 };
          b.n++; b.r += data[i]; b.g += data[i + 1]; b.b += data[i + 2];
          buckets.set(key, b);
        }
        const colors = [...buckets.values()].map((b) => ({ hex: rgbToHex({ r: b.r / b.n, g: b.g / b.n, b: b.b / b.n }), n: b.n }));
        colors.sort((a, b) => b.n - a.n);
        const vivid = colors.filter((c) => saturationOf(c.hex) > 28 && lightnessOf(c.hex) > 18 && lightnessOf(c.hex) < 78);
        const primary = vivid[0]?.hex || colors.find((c) => lightnessOf(c.hex) < 50)?.hex || '#2F5BEA';
        const accent = vivid.find((c) => Math.abs(rgbToHsl(hexToRgb(c.hex)).h - rgbToHsl(hexToRgb(primary)).h) > 35)?.hex || shiftHue(primary, 150);
        const light = colors.find((c) => lightnessOf(c.hex) > 90);
        const dark = colors.find((c) => lightnessOf(c.hex) < 16);
        resolve({ primary, accent, bg: light ? mix(light.hex, '#FFFFFF', 0.4) : tint(primary, 0.96), surface: '#FFFFFF', text: dark?.hex || withLightness(primary, 10) });
      } catch { resolve(null); } finally { URL.revokeObjectURL(url); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}
