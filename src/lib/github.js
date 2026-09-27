// GitHub integration.
//   Real: when the user connected GitHub through Firebase (OAuth token in session), calls api.github.com.
//   Demo: realistic sample repositories so every flow is explorable without an account.
import { signal } from './html.js';
import { authMode, linkGitHub, getGitHubToken } from './auth.js';
import { session } from './store.js';
import { sleep, slugify } from './util.js';

const API = 'https://api.github.com';
/** { connected, login, name, avatar, real } */
export const githubAccount = signal(loadAccount());

function loadAccount() {
  try { return JSON.parse(sessionStorage.getItem('a2:gh:acct')) || { connected: false }; } catch { return { connected: false }; }
}
function saveAccount(a) {
  githubAccount.value = a;
  try { sessionStorage.setItem('a2:gh:acct', JSON.stringify(a)); } catch {}
}

async function gh(path, { method = 'GET', body } = {}) {
  const token = getGitHubToken();
  const res = await fetch(API + path, {
    method,
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let msg = `GitHub ${res.status}`;
    try { const j = await res.json(); msg = j.message || msg; } catch {}
    const err = new Error(msg); err.status = res.status; throw err;
  }
  return res.status === 204 ? null : res.json();
}

export const isRealGitHub = () => authMode === 'firebase' && !!getGitHubToken();

/** Connect a GitHub account. Real OAuth in Firebase mode; demo account otherwise. */
export async function connectGitHub() {
  if (authMode === 'firebase' && session.value) {
    let token = getGitHubToken();
    if (!token) token = await linkGitHub();
    if (token) {
      const me = await gh('/user');
      saveAccount({ connected: true, login: me.login, name: me.name || me.login, avatar: me.avatar_url, real: true });
      return githubAccount.value;
    }
  }
  await sleep(900);
  const base = session.value?.name ? slugify(session.value.name).replace(/-/g, '') : 'builder';
  saveAccount({ connected: true, login: base || 'builder', name: session.value?.name || 'Builder', avatar: null, real: false });
  return githubAccount.value;
}
export function disconnectGitHub() { saveAccount({ connected: false }); }

// ---------------------------------------------------------------------------
const DEMO_REPOS = [
  { full_name: 'acme/support-portal', name: 'support-portal', private: true, language: 'TypeScript', updated_at: Date.now() - 3600e3 * 5, description: 'Customer support portal — Next.js + FastAPI + LangGraph triage agent', default_branch: 'main', stars: 12 },
  { full_name: 'acme/crm-lite', name: 'crm-lite', private: true, language: 'TypeScript', updated_at: Date.now() - 86400e3 * 2, description: 'Lightweight CRM on Next.js 14 with Prisma/Postgres', default_branch: 'main', stars: 4 },
  { full_name: 'acme/agents-playground', name: 'agents-playground', private: false, language: 'Python', updated_at: Date.now() - 86400e3 * 6, description: 'CrewAI research crew + tools experiments', default_branch: 'main', stars: 31 },
  { full_name: 'acme/marketing-site', name: 'marketing-site', private: false, language: 'JavaScript', updated_at: Date.now() - 86400e3 * 14, description: 'Vite + React marketing site', default_branch: 'main', stars: 2 },
  { full_name: 'acme/invoice-bot', name: 'invoice-bot', private: true, language: 'Python', updated_at: Date.now() - 86400e3 * 30, description: 'OpenAI Agents SDK invoice extraction service', default_branch: 'main', stars: 0 },
];

/** List the user's repositories (most recently updated first). */
export async function listRepos() {
  if (isRealGitHub()) {
    const repos = await gh('/user/repos?per_page=50&sort=updated&affiliation=owner,collaborator,organization_member');
    return repos.map((r) => ({ full_name: r.full_name, name: r.name, private: r.private, language: r.language, updated_at: new Date(r.updated_at).getTime(), description: r.description, default_branch: r.default_branch, stars: r.stargazers_count, real: true }));
  }
  await sleep(500);
  const owner = githubAccount.value.login || 'acme';
  return DEMO_REPOS.map((r) => ({ ...r, full_name: r.full_name.replace('acme', owner) }));
}

/**
 * Inspect a repository for the Understanding Report.
 * Returns { files: string[], packageJson?: object, requirements?: string, readme?: string, real }
 */
export async function inspectRepo(fullName) {
  if (isRealGitHub()) {
    const repo = await gh(`/repos/${fullName}`);
    const tree = await gh(`/repos/${fullName}/git/trees/${encodeURIComponent(repo.default_branch)}?recursive=1`);
    const files = (tree.tree || []).filter((t) => t.type === 'blob').map((t) => t.path);
    const read = async (p) => {
      try { const f = await gh(`/repos/${fullName}/contents/${encodeURIComponent(p).replace(/%2F/g, '/')}`); return decodeURIComponent(escape(atob((f.content || '').replace(/\n/g, '')))); } catch { return null; }
    };
    const pkgPath = files.find((f) => f === 'package.json') || files.find((f) => f.endsWith('/package.json'));
    const pkgText = pkgPath ? await read(pkgPath) : null;
    let packageJson = null; try { packageJson = pkgText ? JSON.parse(pkgText) : null; } catch {}
    const reqPath = files.find((f) => /(^|\/)requirements\.txt$/.test(f)) || files.find((f) => /(^|\/)pyproject\.toml$/.test(f));
    const requirements = reqPath ? await read(reqPath) : null;
    return { files, packageJson, requirements, defaultBranch: repo.default_branch, real: true };
  }
  await sleep(700);
  return demoInspect(fullName);
}

function demoInspect(fullName) {
  const name = fullName.split('/')[1];
  if (/agents|invoice/.test(name)) {
    return { real: false, defaultBranch: 'main', files: ['README.md', 'pyproject.toml', 'src/crew.py', 'src/agents.yaml', 'src/tasks.yaml', 'src/tools/search.py', 'src/tools/scrape.py', 'tests/test_crew.py', '.env.example'], requirements: 'crewai==0.86.0\ncrewai-tools\nopenai\npython-dotenv', packageJson: null };
  }
  return {
    real: false, defaultBranch: 'main',
    files: ['package.json', 'next.config.mjs', 'app/layout.tsx', 'app/page.tsx', 'app/tickets/page.tsx', 'app/tickets/[id]/page.tsx', 'app/api/tickets/route.ts', 'app/api/auth/[...nextauth]/route.ts', 'components/TicketTable.tsx', 'components/ReplyBox.tsx', 'lib/db.ts', 'prisma/schema.prisma', 'agents/triage_graph.py', 'agents/requirements.txt', '.env.example', 'README.md', 'tests/tickets.spec.ts'],
    packageJson: { name, dependencies: { next: '14.2.5', react: '18.3.1', '@prisma/client': '5.18.0', 'next-auth': '4.24.7', tailwindcss: '3.4.4' }, scripts: { dev: 'next dev', build: 'next build', test: 'playwright test', postinstall: 'prisma generate' } },
    requirements: 'langgraph==0.2.34\nlangchain-openai\nfastapi\nuvicorn',
  };
}

/** Create a repository for the signed-in user. */
export async function createRepo(name, { isPrivate = true, description = 'Built with Architect' } = {}) {
  if (isRealGitHub()) {
    const r = await gh('/user/repos', { method: 'POST', body: { name, private: isPrivate, description, auto_init: true } });
    return { full_name: r.full_name, html_url: r.html_url, default_branch: r.default_branch || 'main', real: true };
  }
  await sleep(800);
  const owner = githubAccount.value.login || 'builder';
  return { full_name: `${owner}/${name}`, html_url: `https://github.com/${owner}/${name}`, default_branch: 'main', real: false };
}

/**
 * Commit files to a branch (creating or updating each file).
 * files: [{ path, content }]. Returns { commits, url }.
 */
export async function pushFiles(fullName, files, message = 'Update from Architect', branch = 'main', onProgress) {
  if (isRealGitHub()) {
    let done = 0;
    for (const f of files) {
      const path = f.path.replace(/^\/+/, '');
      let sha;
      try { const cur = await gh(`/repos/${fullName}/contents/${path}?ref=${encodeURIComponent(branch)}`); sha = cur.sha; } catch {}
      const content = btoa(unescape(encodeURIComponent(f.content)));
      await gh(`/repos/${fullName}/contents/${path}`, { method: 'PUT', body: { message, content, branch, ...(sha ? { sha } : {}) } });
      done++; onProgress && onProgress(done, files.length, path);
    }
    return { commits: files.length, url: `https://github.com/${fullName}/tree/${branch}`, real: true };
  }
  for (let i = 0; i < files.length; i++) { await sleep(60); onProgress && onProgress(i + 1, files.length, files[i].path); }
  return { commits: 1, url: `https://github.com/${fullName}/tree/${branch}`, real: false };
}

/** Create a branch from the default branch. */
export async function createBranch(fullName, branch, from = 'main') {
  if (isRealGitHub()) {
    const ref = await gh(`/repos/${fullName}/git/ref/heads/${encodeURIComponent(from)}`);
    await gh(`/repos/${fullName}/git/refs`, { method: 'POST', body: { ref: `refs/heads/${branch}`, sha: ref.object.sha } });
    return { branch, real: true };
  }
  await sleep(400);
  return { branch, real: false };
}

/** Open a pull request. */
export async function createPullRequest(fullName, { title, body, head, base = 'main' }) {
  if (isRealGitHub()) {
    const pr = await gh(`/repos/${fullName}/pulls`, { method: 'POST', body: { title, body, head, base } });
    return { number: pr.number, url: pr.html_url, real: true };
  }
  await sleep(900);
  const number = 10 + Math.floor(Math.random() * 80);
  return { number, url: `https://github.com/${fullName}/pull/${number}`, real: false };
}
