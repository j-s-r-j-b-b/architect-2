// Text + randomness helpers for the simulated generator. Pure functions, no DOM.
import { seeded } from '../../lib/util.js';

export const M = 60e3, H = 3600e3, D = 86400e3;

export function hashStr(s = '') {
  let h = 2166136261;
  for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

/** Deterministic RNG with helpers, seeded by any string. */
export function rng(seed = 'seed') {
  const next = seeded(hashStr(seed) || 1);
  const r = () => next();
  r.int = (a, b) => a + Math.floor(next() * (b - a + 1));
  r.pick = (arr) => arr[Math.floor(next() * arr.length)];
  r.chance = (p) => next() < p;
  r.shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  r.weighted = (pairs) => { // [[value, weight], ...]
    const total = pairs.reduce((s, [, w]) => s + w, 0);
    let x = next() * total;
    for (const [v, w] of pairs) { x -= w; if (x <= 0) return v; }
    return pairs[pairs.length - 1][0];
  };
  r.money = (a, b, step = 1) => Math.round((a + next() * (b - a)) / step) * step;
  return r;
}

export const uniq = (arr) => [...new Set(arr.filter((x) => x !== undefined && x !== null && x !== ''))];
export const cap = (s = '') => (s ? s[0].toUpperCase() + s.slice(1) : s);
export const titleCase = (s = '') => String(s).replace(/\b([a-z])([a-z']*)/g, (m, a, b) => (SMALL.has(m) ? m : a.toUpperCase() + b)).replace(/^./, (c) => c.toUpperCase());
const SMALL = new Set(['and', 'of', 'the', 'for', 'to', 'in', 'on', 'a', 'an', 'or', 'with', 'by']);
export const pascal = (s = '') => String(s).replace(/[^A-Za-z0-9]+/g, ' ').trim().split(' ').filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join('') || 'Block';
export const snake = (s = '') => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 28) || 'field';
export const truncate = (s = '', n = 80) => (String(s).length > n ? String(s).slice(0, n - 1).trimEnd() + '…' : String(s));
export const words = (s = '') => String(s).toLowerCase().match(/[a-z0-9][a-z0-9'’-]*/g) || [];
export const escapeRe = (s = '') => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function plural(word = '') {
  const w = String(word);
  if (!w) return w;
  if (/(s|x|z|ch|sh)$/i.test(w)) return w + 'es';
  if (/[^aeiou]y$/i.test(w)) return w.slice(0, -1) + 'ies';
  if (/(person)$/i.test(w)) return w.replace(/person$/i, 'people');
  return w + 's';
}
export function singular(word = '') {
  const w = String(word);
  if (/people$/i.test(w)) return w.replace(/people$/i, 'person');
  if (/ies$/i.test(w) && w.length > 4) return w.slice(0, -3) + 'y';
  if (/(ches|shes|xes|sses|zes)$/i.test(w)) return w.slice(0, -2);
  if (/ss$/i.test(w)) return w;
  if (/s$/i.test(w) && !/(us|is|ss)$/i.test(w)) return w.slice(0, -1);
  return w;
}

/** "…called Pulse", "named 'Deal Room'", "call it HelpHub" → "Pulse" */
export function calledName(text = '') {
  const m = String(text).match(/\b(?:called|named|name it|call it|titled)\s+["“'‘]?([A-Za-z0-9][\w&'’.+-]*(?:\s+[A-Z0-9][\w&'’.+-]*){0,2})["”'’]?/);
  if (!m) return null;
  const quoted = String(text).match(/\b(?:called|named|name it|call it|titled)\s+["“'‘]([^"”'’]{2,32})["”'’]/);
  const raw = (quoted ? quoted[1] : m[1]).trim().replace(/[.,;:!?]+$/, '');
  if (!raw || /^(a|an|the|it|my|our)$/i.test(raw)) return null;
  return raw.split(/\s+/).slice(0, 3).map((w) => (/^[a-z]/.test(w) ? w[0].toUpperCase() + w.slice(1) : w)).join(' ');
}

// ---------- Dates ----------
/** A moment in the past between minH hours and maxDays days ago. */
export function past(r, now, maxDays = 7, minH = 0.5) {
  const ms = minH * H + r() * Math.max(0, maxDays * D - minH * H);
  return Math.round((now - ms) / M) * M;
}
/** Business-hours slot `dayOffset` days from now (can be negative). */
export function slot(r, now, dayOffset = 1, { start = 9, end = 17, step = 30 } = {}) {
  const d = new Date(now + dayOffset * D);
  const mins = (start * 60) + Math.floor(r() * ((end - start) * 60 / step)) * step;
  d.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
  const day = d.getDay();
  if (day === 0) d.setDate(d.getDate() + 1);
  if (day === 6) d.setDate(d.getDate() + 2);
  return d.getTime();
}
/** Midnight-ish date n days from now (for due dates). */
export function dayFrom(now, n) {
  const d = new Date(now + n * D); d.setHours(12, 0, 0, 0); return d.getTime();
}
export const fmtDay = (ts) => new Date(ts).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
export const fmtShort = (ts) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
export const fmtClock = (ts) => new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
export const usd = (n) => '$' + Math.round(n).toLocaleString('en-US');
export const usd2 = (n) => '$' + (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const pct = (n) => `${Math.round(n)}%`;
export function weekLabels(n = 8) { return Array.from({ length: n }, (_, i) => `W${i + 1}`); }
/** Gentle upward trend series with noise. */
export function trend(r, n, start, end, { noise = 0.06, round = 0 } = {}) {
  const f = 10 ** round;
  return Array.from({ length: n }, (_, i) => {
    const base = start + ((end - start) * i) / Math.max(1, n - 1);
    const v = base * (1 + (r() - 0.5) * 2 * noise);
    return Math.round(v * f) / f;
  });
}
export const sum = (arr) => arr.reduce((s, x) => s + (Number(x) || 0), 0);
export const avg = (arr) => (arr.length ? sum(arr) / arr.length : 0);
export function countBy(rows, key) {
  const out = {};
  for (const r of rows) { const k = r[key] ?? '—'; out[k] = (out[k] || 0) + 1; }
  return out;
}
export const listJoin = (arr) => (arr.length <= 1 ? arr.join('') : arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1]);
