// Import analysis: turns a file tree (+ package.json / requirements) into an
// "Understanding report" and then into a complete Architect project.
import { slugify, titleCase, seeded } from '../../../lib/util.js';

const clean = (v = '') => String(v).replace(/^[\^~>=<\s]+/, '').split('.').slice(0, 2).join('.');

/** Simulated file trees for non-GitHub sources (ZIP, other builders, agent code). */
export function simulatedTree(kind, name = 'project', code = '') {
  const n = slugify(name) || 'project';
  if (kind === 'agent') {
    const fw = /crewai|Crew\(|@agent/i.test(code) ? 'crewai' : /openai.agents|from agents import|Runner\.run/i.test(code) ? 'openai-agents' : 'langgraph';
    const reqs = { crewai: 'crewai==0.86.0\ncrewai-tools', 'openai-agents': 'openai-agents==0.4.0\nopenai', langgraph: 'langgraph==0.2.34\nlangchain-openai' }[fw];
    return { files: [`agents/${n.replace(/-/g, '_')}.py`, 'agents/tools.py', 'requirements.txt', '.env.example', 'tests/test_agent.py'], requirements: reqs + '\npython-dotenv', packageJson: null, defaultBranch: 'main' };
  }
  const vite = kind === 'builder-vite';
  return {
    defaultBranch: 'main',
    files: vite
      ? ['package.json', 'vite.config.ts', 'src/main.tsx', 'src/App.tsx', 'src/pages/Dashboard.tsx', 'src/components/DataTable.tsx', 'supabase/migrations/001_init.sql', '.env.example', 'README.md']
      : ['package.json', 'app/layout.tsx', 'app/page.tsx', 'app/dashboard/page.tsx', 'app/customers/page.tsx', 'app/customers/[id]/page.tsx', 'app/settings/page.tsx', 'app/api/customers/route.ts', 'components/CustomerTable.tsx', 'lib/db.ts', '.env.example', 'README.md', 'tests/customers.spec.ts'],
    packageJson: vite
      ? { name: n, dependencies: { react: '18.3.1', vite: '5.4.2', '@supabase/supabase-js': '2.45.0', tailwindcss: '3.4.10' }, scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' } }
      : { name: n, dependencies: { next: '14.2.5', react: '18.3.1', '@prisma/client': '5.18.0', tailwindcss: '3.4.4' }, scripts: { dev: 'next dev', build: 'next build', test: 'playwright test', postinstall: 'prisma generate' } },
    requirements: null,
  };
}

/** Build the Understanding report. */
export function analyzeRepo({ files = [], packageJson = null, requirements = '', name = 'project', ref = '', defaultBranch = 'main' }) {
  const deps = { ...(packageJson?.dependencies || {}), ...(packageJson?.devDependencies || {}) };
  const req = String(requirements || '').toLowerCase();
  const has = (re) => files.some((f) => re.test(f));
  const stack = [];
  if (deps.next) stack.push({ label: `Next.js ${clean(deps.next)}`, kind: 'Frontend', icon: 'layers' });
  else if (deps.vite) stack.push({ label: 'Vite + React', kind: 'Frontend', icon: 'layers' });
  else if (deps.react) stack.push({ label: 'React', kind: 'Frontend', icon: 'layers' });
  if (deps.tailwindcss) stack.push({ label: 'Tailwind CSS', kind: 'Styling', icon: 'palette' });
  if (deps['@prisma/client'] || has(/schema\.prisma$/)) stack.push({ label: 'Prisma + PostgreSQL', kind: 'Database', icon: 'database' });
  if (deps['@supabase/supabase-js'] || has(/^supabase\//)) stack.push({ label: 'Supabase', kind: 'Database', icon: 'database' });
  if (deps['next-auth']) stack.push({ label: 'NextAuth', kind: 'Sign-in', icon: 'lock' });
  if (/fastapi/.test(req)) stack.push({ label: 'FastAPI', kind: 'API', icon: 'server' });
  const framework = /langgraph/.test(req) ? 'langgraph' : /crewai/.test(req) ? 'crewai' : /openai-agents|openai_agents/.test(req) ? 'openai-agents' : null;
  if (framework) stack.push({ label: { langgraph: 'LangGraph', crewai: 'CrewAI', 'openai-agents': 'OpenAI Agents SDK' }[framework], kind: 'Agents', icon: 'bot' });
  if (!packageJson && req) stack.push({ label: 'Python', kind: 'Runtime', icon: 'terminal' });

  // Routes from app/**/page.tsx (App Router) or src/pages/*.tsx
  const routes = [];
  for (const f of files) {
    let m = f.match(/^(?:src\/)?app\/(?:(.*)\/)?page\.[jt]sx?$/);
    if (m) { const seg = (m[1] || '').split('/').filter((s) => !/^\(.*\)$/.test(s)); routes.push({ route: '/' + seg.map((s) => s.replace(/^\[(\.\.\.)?(.+?)\]$/, ':$2')).join('/'), file: f, dynamic: /\[/.test(f) }); continue; }
    m = f.match(/^src\/pages\/([A-Za-z]+)\.[jt]sx$/);
    if (m) routes.push({ route: '/' + slugify(m[1]), file: f, dynamic: false });
  }
  if (!routes.length && has(/^src\/App\.[jt]sx$/)) routes.push({ route: '/', file: 'src/App.tsx', dynamic: false });
  routes.sort((a, b) => a.route.length - b.route.length);
  const api = files.filter((f) => /^(?:src\/)?app\/api\/.+\/route\.[jt]s$/.test(f)).map((f) => '/' + f.replace(/^(?:src\/)?app\//, '').replace(/\/route\.[jt]s$/, '').replace(/\[(\.\.\.)?(.+?)\]/g, ':$2'));

  // Agents
  const agentFiles = files.filter((f) => /(^|\/)agents\/[^/]+\.py$/.test(f) && !/tools\.py$|__init__/.test(f));
  if (!agentFiles.length && has(/(^|\/)crew\.py$/)) agentFiles.push(files.find((f) => /crew\.py$/.test(f)));
  const agents = agentFiles.map((f) => {
    const base = f.split('/').pop().replace(/\.py$/, '').replace(/_(graph|agent|crew)$/, '');
    const nm = base === 'crew' ? `${titleCase(name.replace(/[-_]/g, ' '))} Crew` : `${titleCase(base.replace(/_/g, ' '))} Agent`;
    return { name: nm, file: f, framework: framework || 'architect' };
  });

  // Secrets (.env.example)
  const secrets = [];
  if (has(/\.env\.example$/)) {
    if (deps['@prisma/client'] || has(/schema\.prisma$/)) secrets.push('DATABASE_URL');
    if (deps['@supabase/supabase-js']) secrets.push('SUPABASE_URL', 'SUPABASE_ANON_KEY');
    if (deps['next-auth']) secrets.push('NEXTAUTH_SECRET');
    if (/openai|langchain|crewai/.test(req) || framework) secrets.push('OPENAI_API_KEY');
    if (!secrets.length) secrets.push('APP_SECRET');
  }
  const tests = files.filter((f) => /(^|\/)(tests?|__tests__)\/|\.(spec|test)\.[jt]sx?$|(^|\/)test_[^/]+\.py$/.test(f));
  const scripts = Object.entries(packageJson?.scripts || {}).map(([k, v]) => ({ name: k, cmd: v, auto: /^(pre|post)?install$|^prepare$/.test(k) }));
  if (req) scripts.push({ name: 'pip install', cmd: `${req.split('\n').filter(Boolean).length} Python packages from requirements`, auto: false });

  const pageRoutes = routes.filter((r) => !r.dynamic && r.route !== '/');
  const entity = (pageRoutes.find((r) => !/dashboard|settings|login|account/.test(r.route)) || pageRoutes[0])?.route.slice(1).split('/')[0] || (agents.length ? 'runs' : 'records');
  const report = { name: titleCase(name.replace(/[-_]/g, ' ')), ref, defaultBranch, files, stack, routes, api, agents, secrets, tests, scripts, entity, framework };
  report.agentsMd = agentsMd(report);
  return report;
}

function agentsMd(r) {
  return `# AGENTS.md — ${r.name}

## Stack
${r.stack.map((s) => `- ${s.kind}: ${s.label}`).join('\n') || '- (not detected)'}

## Screens
${r.routes.map((x) => `- \`${x.route}\` → ${x.file}`).join('\n') || '- none'}

## Agents
${r.agents.map((a) => `- ${a.name} (${a.framework}) → ${a.file}`).join('\n') || '- none detected'}

## Rules for Architect
- Work on a branch; open a pull request for every change.
- Never commit secrets. Required: ${r.secrets.join(', ') || 'none'}.
- Run ${r.tests.length ? `the ${r.tests.length} existing test file(s)` : 'a smoke test'} after each change.
`;
}

/** Report → createProject() partial. */
export function projectFromReport(r, { sourceType = 'github', trusted = false } = {}) {
  const rnd = seeded(r.name.length * 97 + r.files.length);
  const tableId = slugify(r.entity).replace(/-/g, '_') || 'records';
  const label = titleCase(r.entity.replace(/[-_]/g, ' '));
  const people = ['Meera', 'Arjun', 'Sam', 'Lena', 'Kofi'];
  const titles = ['Onboarding checklist', 'Renewal follow-up', 'Billing question', 'Feature request', 'Data export', 'Access issue'];
  const rows = titles.map((t, i) => ({ id: `r${i + 1}`, title: t, status: ['Open', 'In progress', 'Done'][Math.floor(rnd() * 3)], owner: people[i % people.length], updated: Date.now() - Math.round(rnd() * 5 * 864e5) }));
  const table = {
    id: tableId, name: label, icon: 'table', source: 'sample', connection: r.stack.some((s) => s.kind === 'Database') ? 'postgres' : null,
    rules: 'Signed-in teammates can read and edit.',
    columns: [{ key: 'title', label: 'Title', type: 'text' }, { key: 'status', label: 'Status', type: 'status', options: ['Open', 'In progress', 'Done'] }, { key: 'owner', label: 'Owner', type: 'person' }, { key: 'updated', label: 'Updated', type: 'datetime' }],
    rows,
  };
  const agents = r.agents.map((a, i) => ({
    id: `a_${slugify(a.name).replace(/-/g, '_')}`, name: a.name, kind: 'worker', role: `Imported from ${a.file}`,
    instructions: `Existing ${a.framework} agent imported from ${a.file}. Architect keeps the original code and edits it on a branch.`,
    goal: '', color: ['#7446F0', '#2F5BEA', '#0F766E'][i % 3], framework: a.framework, model: { tier: 'balanced' },
    knowledge: [], tools: [], approvals: [], limits: { costPerRun: 0.05, steps: 10 },
    guardrails: { pii: true, injection: true, toxicity: true, groundedness: false, topics: [], blocked: [] },
    memory: 'session', triggers: [{ type: 'chat', detail: 'From the app' }], outputs: [], usedBy: [], version: 1, status: 'draft', evalScore: null,
    stats: { runs: 0, cost: 0, latencyMs: 0, errors: 0 }, file: a.file,
  }));
  const pageRoutes = r.routes.filter((x) => !x.dynamic);
  if (!pageRoutes.length) pageRoutes.push({ route: '/', file: agents[0]?.file || 'README.md' });
  const screens = pageRoutes.map((x) => {
    const slug = slugify(x.route.slice(1).replace(/\//g, '-')) || 'home';
    const title = x.route === '/' ? 'Home' : titleCase(x.route.slice(1).split('/').pop().replace(/-/g, ' '));
    const blocks = [
      { id: `b_${slug}_header`, type: 'header', file: x.file, props: { title, subtitle: `Imported from ${x.file}` } },
      { id: `b_${slug}_table`, type: 'table', span: agents.length && x.route === '/' ? 8 : 12, title: `All ${label.toLowerCase()}`, file: x.file, bind: { table: tableId }, props: { searchable: true } },
    ];
    if (agents.length && x.route === '/') blocks.push({ id: `b_${slug}_agent`, type: 'agentChat', span: 4, title: agents[0].name, bind: { agent: agents[0].id }, props: { placeholder: 'Ask the agent…', suggestions: ['What can you do?'] } });
    return { id: `s_${slug.replace(/-/g, '_')}`, route: x.route, title, icon: x.route === '/' ? 'home' : 'list', nav: true, blocks };
  });
  const out = {
    name: r.name, status: 'built', icon: sourceType === 'agent' ? 'bot' : sourceType === 'github' ? 'github' : 'package',
    description: `Imported ${r.stack.map((s) => s.label).slice(0, 3).join(' · ') || 'project'}`,
    source: { type: 'import', ref: r.ref, provider: sourceType, trusted, agentsMd: r.agentsMd },
    screens, agents, data: { tables: [table] },
    env: r.secrets.map((k) => ({ key: k, secret: true, source: 'import', values: { draft: null, staging: null, production: null } })),
    plan: { summary: `Imported from ${r.ref}. ${r.routes.length} routes, ${r.agents.length} agents, ${r.tests.length} test files.` },
    settings: { mode: 'build' },
  };
  if (sourceType === 'github') out.github = { connected: true, repo: r.ref, branch: r.defaultBranch, branches: [r.defaultBranch], lastPush: null, prs: [] };
  return out;
}
