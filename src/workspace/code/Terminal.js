// Simulated terminal for the Code tab. Commands run against the generated tree.
import { html, useState, useRef, useEffect } from '../../lib/html.js';
import { Icon, Badge } from '../../ui/index.js';
import { sleep } from '../../lib/util.js';
import { pendingChanges } from '../github/GitHubPopover.js';

const HELP = [
  'Available commands (prototype: simulated sandbox)',
  '  ls [dir]        list files',
  '  cat <file>      print a file',
  '  npm test        run one Playwright suite per promise',
  '  npm run build   production build',
  '  git status      files changed since the last push',
  '  git log         commit history (from checkpoints)',
  '  clear           clear the screen',
];

export function Terminal({ project, files, onOpenFile }) {
  const [lines, setLines] = useState([{ k: 'dim', t: `Architect sandbox · ${project.slug} · type “help”` }]);
  const [cmd, setCmd] = useState('');
  const [busy, setBusy] = useState(false);
  const [hist, setHist] = useState([]);
  const [hi, setHi] = useState(-1);
  const out = useRef(null);
  useEffect(() => { if (out.current) out.current.scrollTop = out.current.scrollHeight; }, [lines.length]);
  const print = (t, k = '') => setLines((l) => [...l, ...(Array.isArray(t) ? t : [t]).map((x) => ({ t: x, k }))].slice(-500));

  async function exec(raw) {
    const c = raw.trim();
    print(`$ ${c}`, 'cmd');
    if (!c) return;
    setHist((h) => [c, ...h.filter((x) => x !== c)].slice(0, 30)); setHi(-1);
    const [bin, ...args] = c.split(/\s+/);
    const arg = args.join(' ');
    if (bin === 'help') return print(HELP, 'dim');
    if (bin === 'clear') return setLines([]);
    if (bin === 'pwd') return print(`/workspace/${project.slug}`);
    if (bin === 'ls') {
      const dir = arg.replace(/^\.\/?|\/$/g, '');
      const set = new Set();
      for (const f of files) {
        if (dir && !f.path.startsWith(dir + '/')) continue;
        const rest = dir ? f.path.slice(dir.length + 1) : f.path;
        const seg = rest.split('/');
        set.add(seg.length > 1 ? seg[0] + '/' : seg[0]);
      }
      return print(set.size ? [...set].sort().join('   ') : `ls: ${arg}: No such file or directory`, set.size ? '' : 'err');
    }
    if (bin === 'cat') {
      const f = files.find((x) => x.path === arg.replace(/^\.\//, ''));
      if (!f) return print(`cat: ${arg || '(missing file)'}: No such file`, 'err');
      onOpenFile && onOpenFile(f.path);
      return print(f.content.split('\n').slice(0, 200));
    }
    setBusy(true);
    try {
      if (c === 'npm test' || c === 'npm run test') {
        const ps = (project.plan?.promises || []).filter((p) => p.status !== 'deferred');
        print(['> playwright test tests/promises.spec.ts', ''], 'dim');
        let pass = 0, fail = 0;
        for (const p of ps) {
          await sleep(220);
          const ok = p.status === 'verified' || p.status === 'live';
          ok ? pass++ : fail++;
          print(`${ok ? '  ✓' : '  ✗'} ${p.id} ${p.title} (${(p.checks || []).length} checks)`, ok ? 'ok' : 'err');
          if (!ok) print(`      ${p.status === 'failed' ? 'Assertion failed' : 'Not built yet'}: ${(p.checks || [])[0] || 'no checks'}`, 'dim');
        }
        print(['', `  ${pass} passed${fail ? `, ${fail} failed` : ''} (${(ps.length * 0.8 + 1.2).toFixed(1)}s)`], fail ? 'err' : 'ok');
      } else if (c === 'npm run build') {
        const steps = ['> next build', '   Creating an optimized production build …', `   Compiled ${project.screens?.length || 0} routes`, '   Linting and checking types …', `   Generated ${files.length} files`, '   Route (app)                  Size'];
        for (const s of steps) { await sleep(260); print(s, 'dim'); }
        for (const s of project.screens || []) print(`   ○ ${s.route.padEnd(28)} ${(3 + (s.blocks?.length || 1) * 1.7).toFixed(1)} kB`);
        await sleep(200); print('✓ Build finished', 'ok');
      } else if (c === 'git status') {
        const g = project.github;
        if (!g?.repo) print(['fatal: no remote yet — use the GitHub button to create a repository'], 'err');
        else {
          const ch = pendingChanges(project, files);
          print([`On branch ${g.branch || 'main'} · remote ${g.repo}`, ch.length ? 'Changes not pushed:' : 'nothing to commit, working tree clean'], ch.length ? '' : 'ok');
          ch.slice(0, 40).forEach((f) => print(`   modified:   ${f.path}`, 'warn'));
        }
      } else if (c === 'git log') {
        const cps = project.checkpoints || [];
        if (!cps.length) print('No commits yet', 'dim');
        cps.slice(0, 12).forEach((cp) => print([`commit ${(cp.id + '0000000').replace(/[^a-z0-9]/gi, '').slice(-7)}  ${new Date(cp.at).toLocaleString()}`, `    ${cp.label}${cp.summary ? ` — ${cp.summary}` : ''}`], ''));
      } else if (bin === 'npm' || bin === 'git' || bin === 'node' || bin === 'npx') {
        await sleep(200); print(`${c}: not available in this sandbox — try “help”`, 'err');
      } else print(`${bin}: command not found`, 'err');
    } finally { setBusy(false); }
  }

  return html`<div class="cd-term">
    <div class="cd-term__head"><${Icon} name="terminal" size=${13} /><span>Terminal</span><${Badge} size="sm" tone="neutral">Simulated<//><span class="grow"></span>
      ${['npm test', 'npm run build', 'git status'].map((q) => html`<button class="cd-term__chip" disabled=${busy} onClick=${() => exec(q)}>${q}</button>`)}
    </div>
    <div class="cd-term__out" ref=${out} onClick=${(e) => e.currentTarget.parentNode.querySelector('input')?.focus()}>
      ${lines.map((l, i) => html`<div key=${i} class=${`cd-term__l cd-term__l--${l.k || 'n'}`}>${l.t || ' '}</div>`)}
      <div class="cd-term__prompt"><span>${busy ? '…' : '$'}</span>
        <input value=${cmd} disabled=${busy} spellcheck=${false} aria-label="Terminal command" onInput=${(e) => setCmd(e.target.value)}
          onKeyDown=${(e) => {
            if (e.key === 'Enter') { const v = cmd; setCmd(''); exec(v); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); const n = Math.min(hist.length - 1, hi + 1); if (hist[n]) { setHi(n); setCmd(hist[n]); } }
            else if (e.key === 'ArrowDown') { e.preventDefault(); const n = hi - 1; setHi(Math.max(-1, n)); setCmd(n >= 0 ? hist[n] : ''); }
          }} />
      </div>
    </div>
  </div>`;
}
