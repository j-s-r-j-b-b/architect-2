# Architect 2.0 — concept prototype

**Describe it. See the plan and the price. Watch it build. Own every layer.**

A vibe-coding platform where people who don't code **and** developers build agentic apps by prompting, import existing projects, build agents in any framework, connect GitHub and deploy — designed from first principles around the problems users actually report with today's builders.

- **Live demo:** https://architect-2-gray.vercel.app. Start at the homepage, type an idea, and follow the plan → quote → build flow. After signing in you'll also find the example project "Lead Desk" under Projects.
- **Repository:** https://github.com/j-s-r-j-b-b/architect-2
- **Research (Part 1):** [`docs/research/00-RESEARCH-SYNTHESIS.md`](docs/research/00-RESEARCH-SYNTHESIS.md) plus 10 platform reports in [`docs/research/platforms/`](docs/research/platforms/)

---

## The idea in one paragraph

Research across 40+ products (architect.new, Replit, Lovable, Emergent, v0, Rocket, Bolt, Base44, Cursor, Codex, Claude Code, LangGraph, CrewAI, n8n…) showed the same five root causes behind most complaints:

1. **uncertainty:** surprise bills, optimistic ETAs, silently dropped scope;
2. **invisibility:** black-box builds, false "done" claims, sample data passed off as real;
3. **irreversibility:** fear of breaking things, destructive rollbacks;
4. **lock-in:** one stack, one framework;
5. **jargon mismatch:** one UI that serves neither novices nor developers.

Architect 2.0 is designed to remove those causes rather than add panels.

| Principle | Where you see it |
|---|---|
| **Nothing is spent without a quote** | Plan → itemised quote with a budget cap → live meter in the run bar → receipt vs quote. Fixes for mistakes we caused are **free** |
| **A plan is a contract** | Numbered **Promises** with acceptance checks go Planned → Building → Verified → Live. Scope cuts are shown as **Deferred** with a reason and an "Include" button |
| **Watch it take shape** | The approved wireframe turns into real UI block by block in the preview, with step, ETA, credits and Stop always visible |
| **Nothing fake without a badge** | Every widget on sample data says **Sample data**. Simulated prototype features say so |
| **Undo anything** | A checkpoint for every change. A restore first saves a safety checkpoint, so nothing is ever deleted |
| **One project, every depth** | There is no Simple/Pro toggle. Plain language comes first; **X-ray** any element to see its data, agent and code file |
| **Agents are part of the app** | An Agent Map (screens → agents → tools), plain-language Agent Cards with boundaries ("Must ask before: sending email"), Try it, Test, Evals, Deploy as API/MCP/A2A. Any framework comes from one open spec |

The lifecycle colour system is used everywhere and never decoratively: **blueprint** = planned, **amber** = building, **green** = verified/live, **red** = problem, **violet** = AI/agents.

## Feature tour (mapped to the brief)

| Brief item | What to try |
|---|---|
| Authentication | `/signup` offers Google, GitHub and email. Try before sign-up: you can plan anonymously, and sign-in is asked only at **Build it** (your plan is kept) |
| Homepage | `/` has a prompt-first hero, start-from chips (GitHub, template, Figma/URL, agent code, "Help me decide"), how it works and persona pages at `/for/developers` |
| Chat window | The workspace chat has question cards, plan, scope contract, quote, live progress, receipt, Doctor fix cards with a loop breaker, approvals, and change cards with plain and technical summaries. **Ask · Plan · Build** modes, model tier, run mode and `@mentions` |
| App preview | **App** tab: devices, route bar, **Select / Edit / Annotate / X-ray**, act-as, console and QR |
| Agent section | **Agents** tab: Map/List, Agent Card, Agent Copilot, Try it with traces, Test scenarios, Evaluate, Monitor, Deploy (REST, MCP, A2A, widget, run-rate forecast), and code in Architect-native, GitAgent, LangGraph, CrewAI, OpenAI Agents SDK, Claude Agent SDK, Google ADK or Mastra |
| UI getting built | Approve a quote and watch the blueprint wireframe fill in, the promises tick and the credits meter run (demo speed ×10) |
| GitHub integration | Top-bar GitHub control: connect → create repo → push the generated Next.js source → branches → **Review changes** (real line diff) → pull request. Also **Import** a repo via trust gate → Understanding Report |
| Deploying | **Publish** opens a Launch Readiness check that *fixes* problems (connect real data, add secrets, protect routes, set budget), then a deploy pipeline, then a **real live URL** at `/a/<slug>`. Also environments, deploy history with rollback, custom-domain wizard and Marketplace listing |
| And more | Plan tab (spec, wireframe mockup, workflow diagram, Theme Manager with import-your-brand, downloadable docs), Data tab (real CSV import/export, SQL console), Insights (traces, errors, cost forecast), AI Consultant, templates, marketplace, connections (integrations, MCP, bring-your-own model keys), usage and budgets, billing, settings (API & CLI), enterprise admin, command palette (`Ctrl/⌘ K`) |

Parity with today's Architect is kept: plan-first PRD with an agent table, the AI Consultant, prompt library, themes, artifacts, the integrations connect flow, MCP, env vars, GitHub sync, Deploy with Marketplace, custom domain and analytics, and the Usage breakdown.

## What is real vs simulated

- **Real:**
  - sign-in and database via Firebase (Google, email; GitHub optional) — without config it runs in local demo mode;
  - published apps served at `/a/<slug>`;
  - edits, checkpoints and restore;
  - generated source code, the line diff, CSV import/export, the SQL console, file downloads and voice input;
  - GitHub API calls (repos, push, branches, PRs) when a GitHub token is present.
- **Simulated (labelled in the UI):**
  - the "AI" is a deterministic generator that turns any prompt into a consistent plan, agents, data and UI;
  - agent runs are grounded in the project's own data;
  - third-party OAuth connections, CI and DNS verification.

## Tech

This is a static SPA with no build step: Preact + htm + signals via an import map, and Firebase Auth + Firestore (optional). It deploys to any static host (Vercel config included).

```
index.html            import map + styles
src/lib               store (signals), router, auth, db, github
src/ui                design system components + icons
src/engine            generator, quotes, intents, agent simulation, build simulator, codegen, deploy, frameworks
src/genapp            renderer for the generated apps (blocks, themes, X-ray, build states)
src/workspace         project workspace: chat, tabs (Plan, App, Agents, Data, Code, Launch, Insights), drawers
src/pages             public and app pages
docs/research         Part 1 research
```

**Run locally:** serve the folder with any static server using SPA fallback, for example `powershell -File serve.ps1` (Windows, no Node needed), then open http://localhost:5173.

**Enable real sign-in and database:** paste your Firebase web config into `src/config.js` and publish `firestore.rules` in the Firebase console.
