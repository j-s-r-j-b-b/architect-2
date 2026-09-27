// Review changes (/p/:id/code/review): real line diff vs a checkpoint + create pull request.
import { html, useState, useMemo } from '../../lib/html.js';
import { getProject, updateProject, logActivity } from '../../lib/store.js';
import { Link } from '../../lib/router.js';
import { createBranch, pushFiles, createPullRequest, isRealGitHub } from '../../lib/github.js';
import { generateFiles, filesAtCheckpoint } from '../../engine/codegen.js';
import { slugify, timeAgo, sleep, cx } from '../../lib/util.js';
import { Button, Select, Badge, Icon, Empty, Modal, Input, Textarea, Callout, Progress, openModal, toast } from '../../ui/index.js';
import { compareFiles, hunks, fileIcon } from './diff.js';
import { connectProjectRepo, SimBadge } from '../github/GitHubPopover.js';

const CI = ['Build', 'Type check', 'Promise tests', 'Preview deploy'];

function PRDialog({ close, projectId, changes, baseLabel }) {
  const p = getProject(projectId);
  const g = p.github || {};
  const add = changes.reduce((s, c) => s + c.add, 0), del = changes.reduce((s, c) => s + c.del, 0);
  const [title, setTitle] = useState(`Update ${p.name}: ${changes.length} file${changes.length === 1 ? '' : 's'} changed`);
  const [body, setBody] = useState(`## What changed\n${changes.slice(0, 12).map((c) => `- \`${c.path}\` (${c.status}, +${c.add} −${c.del})`).join('\n')}\n\nCompared with checkpoint “${baseLabel}”.\n\n_Opened from Architect._`);
  const [phase, setPhase] = useState('form');
  const [prog, setProg] = useState(null);
  const [pr, setPr] = useState(null);
  const [ci, setCi] = useState(CI.map(() => 'pending'));
  const [err, setErr] = useState('');
  async function go() {
    setPhase('working'); setErr('');
    try {
      const base = 'main';
      const head = `architect/${slugify(title).slice(0, 40) || 'update'}`;
      setProg({ label: `Creating branch ${head}`, v: 10 });
      await createBranch(g.repo, head, base).catch((e) => { if (!/exists/i.test(e.message || '')) throw e; });
      const files = changes.filter((c) => c.status !== 'deleted').map((c) => ({ path: c.path, content: generateFiles(getProject(projectId)).find((f) => f.path === c.path)?.content || '' }));
      await pushFiles(g.repo, files, title, head, (d, t, path) => setProg({ label: `Pushing ${path}`, v: 10 + (d / t) * 70 }));
      setProg({ label: 'Opening pull request', v: 90 });
      const res = await createPullRequest(g.repo, { title, body, head, base });
      const rec = { number: res.number, url: res.url, title, head, base, at: Date.now(), add, del, files: changes.length, real: !!res.real, status: 'open' };
      updateProject(projectId, (d) => { d.github.prs = [rec, ...(d.github.prs || [])].slice(0, 20); d.github.branches = [...new Set([...(d.github.branches || ['main']), head])]; });
      logActivity(projectId, { plain: `Opened pull request #${rec.number}: ${title}`, technical: `${g.repo} ${head} → ${base} · +${add} −${del}`, kind: 'code' });
      setPr(rec); setPhase('done');
      for (let i = 0; i < CI.length; i++) { setCi((a) => a.map((x, j) => (j === i ? 'running' : x))); await sleep(700 + i * 250); setCi((a) => a.map((x, j) => (j === i ? 'passed' : x))); }
    } catch (e) { setErr(e.message || 'GitHub request failed'); setPhase('form'); }
  }
  if (phase === 'done' && pr) {
    return html`<${Modal} title=${`Pull request #${pr.number} opened`} subtitle=${`${pr.head} → ${pr.base} · +${pr.add} −${pr.del}`} icon="git-pull-request" onClose=${() => close(true)}
      footer=${html`<${Button} variant="ghost" onClick=${() => close(true)}>Done<//><${Button} variant="primary" icon="external-link" href=${pr.url} target="_blank" rel="noopener">Open on GitHub<//>`}>
      <div class="cd-ci">
        <div class="row gap-8 mb-4"><span class="t-sm t-strong grow">Checks</span>${!pr.real ? html`<${Badge} size="sm" tone="neutral" icon="flask">CI simulated<//>` : null}</div>
        ${CI.map((c, i) => html`<div class="cd-ci__row" key=${c}>${ci[i] === 'passed' ? html`<span class="t-green"><${Icon} name="check-circle" size=${15} /></span>` : ci[i] === 'running' ? html`<span class="spinner spinner--sm spinner--amber"></span>` : html`<span class="t-faint"><${Icon} name="circle-dashed" size=${15} /></span>`}<span class="grow">${c}</span><span class="t-xs t-faint">${ci[i] === 'passed' ? 'Passed' : ci[i] === 'running' ? 'Running…' : 'Queued'}</span></div>`)}
        <a class="link t-sm t-truncate" href=${pr.url} target="_blank" rel="noopener">${pr.url}</a>
      </div>
    <//>`;
  }
  return html`<${Modal} title="Create pull request" subtitle=${`${g.repo} · ${changes.length} files · +${add} −${del}`} icon="git-pull-request" onClose=${() => close(false)}
    footer=${html`<${Button} variant="ghost" disabled=${phase === 'working'} onClick=${() => close(false)}>Cancel<//><${Button} variant="primary" icon="git-pull-request" loading=${phase === 'working'} disabled=${!title.trim()} onClick=${go}>Create pull request<//>`}>
    <div class="cd-form">
      <${Input} label="Title" value=${title} onValue=${setTitle} />
      <${Textarea} label="Description" rows=${7} value=${body} onValue=${setBody} />
      ${prog && phase === 'working' ? html`<div class="cd-push-prog"><${Progress} value=${prog.v} /><div class="t-xs t-faint t-truncate">${prog.label}</div></div>` : null}
      ${err ? html`<${Callout} tone="red" icon="alert-circle">${err}<//>` : null}
      ${!isRealGitHub() ? html`<div class="t-xs t-faint row gap-4"><${Icon} name="flask" size=${12} />Prototype: simulated — the branch, commit and PR are not created on github.com.</div>` : null}
    </div>
  <//>`;
}

function DiffFile({ c }) {
  const [open, setOpen] = useState(true);
  const hs = useMemo(() => hunks(c.ops), [c]);
  return html`<section class="cd-dfile" id=${`d-${c.path}`}>
    <button class="cd-dfile__head" onClick=${() => setOpen(!open)}>
      <${Icon} name=${open ? 'chevron-down' : 'chevron-right'} size=${14} />
      <${Icon} name=${fileIcon(c.path)} size=${14} />
      <span class="t-mono t-truncate grow">${c.path}</span>
      <${Badge} size="sm" tone=${c.status === 'added' ? 'green' : c.status === 'deleted' ? 'red' : 'blueprint'}>${c.status}<//>
      <span class="cd-plus">+${c.add}</span><span class="cd-minus">−${c.del}</span>
    </button>
    ${open ? html`<div class="cd-diff">${hs.map((h, hi) => html`<div key=${hi}>
      <div class="cd-diff__hunk">${h.header}</div>
      ${h.lines.map((l) => html`<div class=${cx('cd-diff__l', l.t === '+' && 'is-add', l.t === '-' && 'is-del')}><span class="cd-diff__n">${l.a || ''}</span><span class="cd-diff__n">${l.b || ''}</span><span class="cd-diff__m">${l.t}</span><span class="cd-diff__t">${l.text || ' '}</span></div>`)}
    </div>`)}</div>` : null}
  </section>`;
}

export function Review({ project }) {
  const cps = project.checkpoints || [];
  const [baseId, setBaseId] = useState((cps[1] || cps[0])?.id || '');
  const base = cps.find((c) => c.id === baseId) || null;
  const changes = useMemo(() => compareFiles(filesAtCheckpoint(project, base), generateFiles(project)), [project, base]);
  const add = changes.reduce((s, c) => s + c.add, 0), del = changes.reduce((s, c) => s + c.del, 0);
  const g = project.github || {};
  async function openPR() {
    if (!g.connected || !g.repo) { if (!(await connectProjectRepo(project.id))) return; }
    openModal(PRDialog, { projectId: project.id, changes, baseLabel: base?.label || 'initial generation' }, {});
  }
  return html`<div class="cd-review">
    <div class="cd-review__bar">
      <${Link} href=${`/p/${project.id}/code`} class="cd-back"><${Icon} name="arrow-left" size=${14} />Code<//>
      <div class="grow">
        <div class="t-lg t-strong">Review changes <span class="cd-plus">+${add}</span> <span class="cd-minus">−${del}</span></div>
        <div class="t-xs t-muted">${changes.length} file${changes.length === 1 ? '' : 's'} changed compared with the checkpoint below</div>
      </div>
      ${cps.length ? html`<${Select} size="sm" value=${baseId} onValue=${setBaseId} options=${cps.slice(0, 30).map((c) => ({ value: c.id, label: `#${c.n} ${c.label} · ${timeAgo(c.at)}` }))} />` : null}
      <${SimBadge} />
      <${Button} variant="primary" icon="git-pull-request" disabled=${!changes.length} onClick=${openPR}>Create pull request<//>
    </div>
    ${g.prs?.length ? html`<div class="cd-prs">${g.prs.slice(0, 3).map((pr) => html`<a class="cd-pr" href=${pr.url} target="_blank" rel="noopener" key=${pr.number}><${Icon} name="git-pull-request" size=${13} /><span class="t-truncate">#${pr.number} ${pr.title}</span><span class="t-faint t-xs">${timeAgo(pr.at)}</span></a>`)}</div>` : null}
    ${!changes.length ? html`<${Empty} icon="git-commit" title="No changes" body=${base ? `The code matches “${base.label}”. Edit a file or ask Architect for a change, then come back.` : 'Nothing to compare yet.'} />` : html`<div class="cd-review__body">
      <nav class="cd-review__files">
        ${changes.map((c) => html`<a key=${c.path} class="cd-review__file" href=${`#d-${c.path}`} onClick=${(e) => { e.preventDefault(); document.getElementById(`d-${c.path}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
          <span class=${`cd-st cd-st--${c.status}`}>${c.status[0].toUpperCase()}</span><span class="t-truncate grow">${c.path}</span><span class="cd-plus">+${c.add}</span><span class="cd-minus">−${c.del}</span></a>`)}
      </nav>
      <div class="cd-review__diffs">${changes.map((c) => html`<${DiffFile} key=${c.path} c=${c} />`)}</div>
    </div>`}
  </div>`;
}
