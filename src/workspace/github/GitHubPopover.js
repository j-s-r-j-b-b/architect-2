// Top-bar GitHub control: connect, create repo + push, branches, pull/push, create PR.
import { html, useState } from '../../lib/html.js';
import { getProject, updateProject, logActivity } from '../../lib/store.js';
import { navigate } from '../../lib/router.js';
import { githubAccount, isRealGitHub, connectGitHub, disconnectGitHub, createRepo, pushFiles, createBranch } from '../../lib/github.js';
import { generateFiles } from '../../engine/codegen.js';
import { slugify, timeAgo, cx } from '../../lib/util.js';
import { Popover, Modal, Button, Input, Switch, Select, Badge, Progress, Icon, Callout, openModal, toast, confirmDialog } from '../../ui/index.js';

export function hashText(s = '') { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
const fakeSha = (s) => (hashText(s) + hashText(s + '!')).slice(0, 7);
/** In simulated mode a github.com link would 404 — explain instead of opening a dead page. */
export function simLinkClick(real, what = 'This repository') {
  return (e) => { if (real || isRealGitHub()) return; e.preventDefault(); e.stopPropagation(); toast(`${what} exists only in this prototype. Add a GitHub token to open it on github.com.`, { tone: 'info' }); };
}
export const SimBadge = () => (isRealGitHub() ? null : html`<${Badge} size="sm" tone="neutral" icon="flask" tip="No GitHub token in this session — repo actions are simulated">Simulated<//>`);

/** Files that differ from the last push. */
export function pendingChanges(project, files = generateFiles(project)) {
  const prev = project.github?.lastPush?.hashes;
  if (!prev) return files;
  return files.filter((f) => prev[f.path] !== hashText(f.content));
}

/** Push the current tree to the project's repo/branch. */
export async function pushProject(projectId, { message = 'Update from Architect', branch, onProgress } = {}) {
  const p = getProject(projectId);
  const g = p.github || {};
  const all = generateFiles(p);
  const changed = pendingChanges(p, all);
  const br = branch || g.branch || 'main';
  const res = await pushFiles(g.repo, (changed.length ? changed : all).map((f) => ({ path: f.path, content: f.content })), message, br, onProgress);
  const hashes = Object.fromEntries(all.map((f) => [f.path, hashText(f.content)]));
  const lastPush = { at: Date.now(), message, branch: br, files: changed.length || all.length, sha: fakeSha(message + Date.now()), hashes, url: res.url, real: !!res.real };
  updateProject(projectId, (d) => { d.github = { ...d.github, lastPush }; });
  logActivity(projectId, { plain: `Pushed ${lastPush.files} file${lastPush.files === 1 ? '' : 's'} to GitHub (${g.repo}@${br})`, technical: `commit ${lastPush.sha} “${message}”`, kind: 'code' });
  return lastPush;
}

function CreateRepoDialog({ close, projectId }) {
  const p = getProject(projectId);
  const [name, setName] = useState(slugify(p?.name || 'my-app'));
  const [priv, setPriv] = useState(true);
  const [busy, setBusy] = useState(false);
  const [prog, setProg] = useState(null);
  const [err, setErr] = useState('');
  const owner = githubAccount.value?.login || 'you';
  async function go() {
    setBusy(true); setErr('');
    try {
      const repo = await createRepo(slugify(name), { isPrivate: priv, description: p.description || `${p.name} — built with Architect` });
      updateProject(projectId, (d) => { d.github = { ...d.github, connected: true, repo: repo.full_name, url: repo.html_url, branch: repo.default_branch || 'main', branches: [repo.default_branch || 'main'], private: priv, real: !!repo.real }; });
      setProg({ done: 0, total: 1, path: '' });
      await pushProject(projectId, { message: 'Initial commit from Architect', onProgress: (done, total, path) => setProg({ done, total, path }) });
      toast(`Pushed to ${repo.full_name}`, { tone: 'success' });
      close(true);
    } catch (e) { setErr(e.message || 'GitHub said no'); setBusy(false); }
  }
  return html`<${Modal} title="Create a GitHub repository" subtitle="We push the full source: app, database schema, agents and tests." icon="github" onClose=${() => close(false)}
    footer=${html`<${Button} variant="ghost" onClick=${() => close(false)} disabled=${busy}>Cancel<//><${Button} variant="primary" icon="upload" loading=${busy} disabled=${!slugify(name)} onClick=${go}>Create & push<//>`}>
    <div class="cd-form">
      <${Input} label="Repository name" value=${name} onValue=${setName} suffix=${html`<span class="t-xs t-faint">${owner}/${slugify(name) || '…'}</span>`} />
      <${Switch} checked=${priv} onChange=${setPriv} label="Private repository" hint="Only people you invite on GitHub can see the code." />
      ${prog ? html`<div class="cd-push-prog"><${Progress} value=${(prog.done / prog.total) * 100} /><div class="t-xs t-faint t-truncate">${prog.done}/${prog.total} · ${prog.path}</div></div>` : null}
      ${err ? html`<${Callout} tone="red" icon="alert-circle">${err}<//>` : null}
      ${!isRealGitHub() ? html`<div class="t-xs t-faint row gap-4"><${Icon} name="flask" size=${12} />Prototype: simulated — no repository is created on github.com in this session.</div>` : null}
    </div>
  <//>`;
}

/** Connect GitHub (if needed) then create the repo. Resolves true when the project has a repo. */
export async function connectProjectRepo(projectId) {
  try { if (!githubAccount.value?.connected) await connectGitHub(); } catch (e) { toast(e.message || 'Could not connect GitHub', { tone: 'error' }); return false; }
  if (getProject(projectId)?.github?.repo) { updateProject(projectId, (d) => { d.github.connected = true; }); return true; }
  return new Promise((resolve) => openModal(CreateRepoDialog, { projectId }, { onClose: (ok) => resolve(!!ok) }));
}

function Panel({ project, close }) {
  const g = project.github || {};
  const [busy, setBusy] = useState(null);
  const [newBr, setNewBr] = useState(null);
  const pending = pendingChanges(project).length;
  const run = async (key, fn) => { setBusy(key); try { await fn(); } catch (e) { toast(e.message || 'GitHub request failed', { tone: 'error' }); } finally { setBusy(null); } };
  if (!g.connected || !g.repo) {
    return html`<div class="cd-gh">
      <div class="cd-gh__head"><${Icon} name="github" size=${18} /><span class="t-strong grow">GitHub</span><${SimBadge} /></div>
      <p class="t-sm t-muted">Own your code. Export the whole app — screens, database, agents and tests — to a repository you control. Changes pushed there can be pulled back.</p>
      <${Button} variant="ink" icon="github" full loading=${busy === 'connect'} onClick=${() => run('connect', async () => { close(); await connectProjectRepo(project.id); })}>${githubAccount.value?.connected ? 'Create repository' : 'Connect GitHub'}<//>
    </div>`;
  }
  const branches = g.branches?.length ? g.branches : ['main'];
  return html`<div class="cd-gh">
    <div class="cd-gh__head"><${Icon} name="github" size=${18} />
      <a class="t-strong grow t-truncate link" href=${g.url || `https://github.com/${g.repo}`} target="_blank" rel="noopener" onClick=${simLinkClick(g.real)}>${g.repo}</a>${g.private ? html`<${Icon} name="lock" size=${12} />` : null}<${SimBadge} /></div>
    <div class="cd-gh__row">
      <${Icon} name="git-branch" size=${14} />
      <${Select} size="sm" class="grow" value=${g.branch || 'main'} options=${branches.map((b) => ({ value: b, label: b }))} onValue=${(b) => updateProject(project.id, (d) => { d.github.branch = b; })} />
      <${Button} size="sm" variant="ghost" icon="plus" onClick=${() => setNewBr(newBr == null ? 'architect/' : null)}>New<//>
    </div>
    ${newBr != null ? html`<div class="cd-gh__row">
      <${Input} size="sm" class="grow" value=${newBr} onValue=${setNewBr} placeholder="feature/my-change" />
      <${Button} size="sm" variant="primary" loading=${busy === 'branch'} disabled=${!/^[\w./-]+$/.test(newBr) || branches.includes(newBr)} onClick=${() => run('branch', async () => {
        await createBranch(g.repo, newBr, g.branch || 'main');
        updateProject(project.id, (d) => { d.github.branches = [...new Set([...(d.github.branches || ['main']), newBr])]; d.github.branch = newBr; });
        toast(`Created branch ${newBr}`, { tone: 'success' }); setNewBr(null);
      })}>Create<//>
    </div>` : null}
    <div class="cd-gh__btns">
      <${Button} size="sm" variant="secondary" icon="download" loading=${busy === 'pull'} onClick=${() => run('pull', async () => { await new Promise((r) => setTimeout(r, 700)); updateProject(project.id, (d) => { d.github.lastPull = Date.now(); }); toast('Already up to date with GitHub', { tone: 'success' }); })}>Pull<//>
      <${Button} size="sm" variant="primary" icon="upload" loading=${busy === 'push'} disabled=${!pending} onClick=${() => run('push', async () => { const lp = await pushProject(project.id, { message: `Update from Architect (${pending} file${pending === 1 ? '' : 's'})` }); toast(`Pushed ${lp.files} file${lp.files === 1 ? '' : 's'} to ${lp.branch}`, { tone: 'success' }); })}>Push${pending ? ` ${pending}` : ''}<//>
    </div>
    <div class="cd-gh__meta">
      ${g.lastPush ? html`<${Icon} name="git-commit" size=${12} /><span class="t-mono">${g.lastPush.sha}</span><span class="t-truncate grow">${g.lastPush.message}</span><span class="t-faint">${timeAgo(g.lastPush.at)}</span>` : html`<span class="t-faint">Nothing pushed yet</span>`}
    </div>
    <div class="cd-gh__meta t-faint">${pending ? `${pending} file${pending === 1 ? '' : 's'} changed since last push` : 'In sync with GitHub'}</div>
    <${Button} size="sm" variant="secondary" icon="git-pull-request" full onClick=${() => { close(); navigate(`/p/${project.id}/code/review`); }}>Review & create PR<//>
    <button class="link t-xs cd-gh__disc" onClick=${async () => { close(); if (await confirmDialog({ title: 'Disconnect GitHub?', body: 'The repository stays on GitHub. You can reconnect any time.', confirmLabel: 'Disconnect', danger: true })) { updateProject(project.id, (d) => { d.github = { ...d.github, connected: false }; }); disconnectGitHub(); toast('GitHub disconnected'); } }}>Disconnect</button>
  </div>`;
}

/** Top-bar GitHub control: connect, repo, branches, pull/push, create PR. */
export function GitHubPopover({ project }) {
  const [open, setOpen] = useState(false);
  if (!project) return null;
  const g = project.github || {};
  const on = g.connected && g.repo;
  return html`<${Popover} align="bottom-end" width=${300} open=${open} onOpenChange=${setOpen}
    trigger=${(isOpen, toggle) => html`<button class=${cx('cd-gh-trigger', isOpen && 'is-open', on && 'is-on')} onClick=${toggle} aria-label="GitHub" data-tip=${on ? g.repo : 'Connect GitHub'}>
      <${Icon} name="github" size=${16} />${on ? html`<span class="cd-gh-trigger__label">${g.branch || 'main'}</span>` : null}${on ? html`<span class="cd-gh-trigger__dot"></span>` : null}
    </button>`}>
    ${(close) => html`<${Panel} project=${project} close=${() => { setOpen(false); close(); }} />`}
  <//>`;
}
