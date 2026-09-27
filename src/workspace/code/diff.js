// Real line diff (LCS) + file tree helpers for the Code tab.

/** Line diff via LCS. Returns ops [{t:' '|'+'|'-', text, a?:lineNoOld, b?:lineNoNew}]. */
export function lineDiff(oldText = '', newText = '') {
  const A = oldText === '' ? [] : oldText.split('\n');
  const B = newText === '' ? [] : newText.split('\n');
  let s = 0;
  while (s < A.length && s < B.length && A[s] === B[s]) s++;
  let ea = A.length, eb = B.length;
  while (ea > s && eb > s && A[ea - 1] === B[eb - 1]) { ea--; eb--; }
  const a = A.slice(s, ea), b = B.slice(s, eb);
  const n = a.length, m = b.length;
  const mid = [];
  if (n * m > 4e6) { // too big: treat as replace
    for (const x of a) mid.push({ t: '-', text: x });
    for (const y of b) mid.push({ t: '+', text: y });
  } else {
    const W = m + 1;
    const L = new Uint32Array((n + 1) * W);
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) {
      L[i * W + j] = a[i] === b[j] ? L[(i + 1) * W + j + 1] + 1 : Math.max(L[(i + 1) * W + j], L[i * W + j + 1]);
    }
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j]) { mid.push({ t: ' ', text: a[i] }); i++; j++; }
      else if (L[(i + 1) * W + j] >= L[i * W + j + 1]) mid.push({ t: '-', text: a[i++] });
      else mid.push({ t: '+', text: b[j++] });
    }
    while (i < n) mid.push({ t: '-', text: a[i++] });
    while (j < m) mid.push({ t: '+', text: b[j++] });
  }
  const ops = [...A.slice(0, s).map((text) => ({ t: ' ', text })), ...mid, ...A.slice(ea).map((text) => ({ t: ' ', text }))];
  let la = 0, lb = 0;
  for (const o of ops) { if (o.t !== '+') o.a = ++la; if (o.t !== '-') o.b = ++lb; }
  return ops;
}

export function diffStats(ops) {
  let add = 0, del = 0;
  for (const o of ops) { if (o.t === '+') add++; else if (o.t === '-') del++; }
  return { add, del };
}

/** Group ops into hunks with `ctx` lines of context. */
export function hunks(ops, ctx = 3) {
  const out = [];
  let cur = null, lastChange = -Infinity;
  ops.forEach((o, i) => {
    if (o.t === ' ') return;
    const from = Math.max(0, i - ctx);
    if (cur && from <= lastChange + ctx + 1) { cur.end = i; }
    else { if (cur) out.push(cur); cur = { start: from, end: i }; }
    lastChange = i;
  });
  if (cur) out.push(cur);
  return out.map((h) => {
    const lines = ops.slice(h.start, Math.min(ops.length, h.end + ctx + 1));
    const fa = lines.find((l) => l.a)?.a || 0, fb = lines.find((l) => l.b)?.b || 0;
    const na = lines.filter((l) => l.t !== '+').length, nb = lines.filter((l) => l.t !== '-').length;
    return { header: `@@ -${fa},${na} +${fb},${nb} @@`, lines };
  });
}

/** Compare two file lists → [{path, status:'added'|'modified'|'deleted', ops, add, del}] */
export function compareFiles(before = [], after = []) {
  const bm = new Map(before.map((f) => [f.path, f.content]));
  const am = new Map(after.map((f) => [f.path, f.content]));
  const paths = [...new Set([...am.keys(), ...bm.keys()])];
  const out = [];
  for (const p of paths) {
    const o = bm.get(p), n = am.get(p);
    if (o === n) continue;
    const ops = lineDiff(o ?? '', n ?? '');
    const st = diffStats(ops);
    if (!st.add && !st.del) continue;
    out.push({ path: p, status: o == null ? 'added' : n == null ? 'deleted' : 'modified', ops, ...st });
  }
  return out.sort((x, y) => x.path.localeCompare(y.path));
}

/** Nested tree from flat paths: {name, path, dir, children[]} with folders first. */
export function buildTree(files) {
  const root = { name: '', path: '', dir: true, children: [] };
  for (const f of files) {
    const parts = f.path.split('/');
    let node = root;
    parts.forEach((part, i) => {
      const leaf = i === parts.length - 1;
      const path = parts.slice(0, i + 1).join('/');
      let child = node.children.find((c) => c.name === part && c.dir === !leaf);
      if (!child) { child = { name: part, path, dir: !leaf, children: [], file: leaf ? f : null }; node.children.push(child); }
      node = child;
    });
  }
  const sort = (n) => { n.children.sort((a, b) => (a.dir !== b.dir ? (a.dir ? -1 : 1) : a.name.localeCompare(b.name))); n.children.forEach(sort); };
  sort(root);
  return root;
}

export function fileIcon(path = '') {
  if (/\.spec\./.test(path)) return 'flask';
  if (/\.(tsx|ts|js|mjs)$/.test(path)) return 'file-code';
  if (/\.json$/.test(path)) return 'file-json';
  if (/\.sql$/.test(path)) return 'database';
  if (/\.ya?ml$/.test(path)) return 'bot';
  if (/\.md$/.test(path)) return 'file-text';
  if (/\.spec\./.test(path)) return 'flask';
  if (/\.env/.test(path)) return 'key';
  return 'file';
}
