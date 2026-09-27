// Small, dependency-free helpers shared across the app.

/** Join class names: cx('a', cond && 'b', {c: true}) */
export function cx(...args) {
  const out = [];
  for (const a of args) {
    if (!a) continue;
    if (typeof a === 'string') out.push(a);
    else if (typeof a === 'object') for (const k in a) if (a[k]) out.push(k);
  }
  return out.join(' ');
}

let _n = 0;
/** Short unique id, optionally prefixed: uid('p') -> "p_lq3k9x2a" */
export function uid(prefix = '') {
  _n = (_n + 1) % 1e6;
  const s = Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 6) + _n.toString(36);
  return prefix ? `${prefix}_${s}` : s;
}

export function slugify(str = '') {
  return String(str).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'app';
}

export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const deepClone = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));

export function debounce(fn, ms = 300) {
  let t;
  const d = (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  d.flush = (...a) => { clearTimeout(t); fn(...a); };
  return d;
}

/** Deterministic pseudo-random generator (for stable sample data). */
export function seeded(seed = 1) {
  let s = typeof seed === 'string' ? [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) : seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

// ---------- Formatting ----------
export function fmtNumber(n, opts = {}) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1, ...opts }).format(n);
}
export function fmtCompact(n) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}
export function fmtMoney(n, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: n < 10 ? 2 : 0 }).format(n);
}
export function fmtCredits(n) {
  const v = Math.round(n * 10) / 10;
  return `${fmtNumber(v)} cr`;
}
export function fmtRange([a, b], unit = '') {
  if (a === b) return `${a}${unit}`;
  return `${a}–${b}${unit}`;
}
export function fmtDuration(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60), r = s % 60;
  if (m < 60) return r ? `${m}m ${String(r).padStart(2, '0')}s` : `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}
export function timeAgo(ts) {
  if (!ts) return '';
  const d = (Date.now() - new Date(ts).getTime()) / 1000;
  if (d < 45) return 'just now';
  if (d < 90) return '1 min ago';
  if (d < 3600) return `${Math.round(d / 60)} min ago`;
  if (d < 5400) return '1 hour ago';
  if (d < 86400) return `${Math.round(d / 3600)} hours ago`;
  if (d < 172800) return 'yesterday';
  if (d < 604800) return `${Math.round(d / 86400)} days ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
export function fmtDate(ts, opts = { month: 'short', day: 'numeric', year: 'numeric' }) {
  return new Date(ts).toLocaleDateString('en-US', opts);
}
export function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
export function initials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}
/** Stable colour for a string (avatars, agent chips). */
export function colorFor(str = '') {
  const palette = ['#2F5BEA', '#7446F0', '#139B4F', '#D9830B', '#D93A2B', '#0E8DA8', '#C2388F', '#5A6B7F'];
  let h = 0;
  for (const c of String(str)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return palette[h % palette.length];
}
export function plural(n, one, many = one + 's') { return `${n} ${n === 1 ? one : many}`; }
export function titleCase(s = '') { return s.replace(/\b\w/g, (c) => c.toUpperCase()); }

// ---------- Local storage (safe) ----------
// Dev isolation: open any URL with ?sandbox=name and this tab gets its own storage namespace.
const SANDBOX = (() => {
  try {
    const q = new URLSearchParams(window.location.search).get('sandbox');
    if (q) sessionStorage.setItem('a2:sandbox', q);
    return sessionStorage.getItem('a2:sandbox') || '';
  } catch { return ''; }
})();
const nsKey = (key) => (SANDBOX ? `sb:${SANDBOX}:${key}` : key);
export function loadJSON(key, fallback) {
  try { const v = localStorage.getItem(nsKey(key)); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
export function saveJSON(key, value) {
  try { localStorage.setItem(nsKey(key), JSON.stringify(value)); return true; } catch { return false; }
}
export function removeKey(key) { try { localStorage.removeItem(nsKey(key)); } catch {} }

/** Copy text to clipboard; resolves true on success. */
export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch {
    try {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); ta.remove(); return true;
    } catch { return false; }
  }
}

/** Trigger a real file download of generated content. */
export function downloadFile(filename, content, type = 'text/plain') {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
}

export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
export const modKey = isMac ? '⌘' : 'Ctrl';
