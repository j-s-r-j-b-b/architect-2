# Architect 2.0 — Competitive Research Synthesis

## How to read this

- **What it is.** One master synthesis of the competitive research behind the design of **Architect 2.0**: a vibe-coding platform where non-technical users *and* developers can prompt a whole agentic app into existence, import an existing project, build agents in any framework, connect GitHub and deploy. It must keep every feature of today's architect.new (Lyzr AI) and add what developers need.
- **Scope.** 10 platform reports covering **40+ products** in four groups: prompt-to-app builders, AI IDEs, CLI/cloud coding agents, and agent-builder platforms and frameworks. Research was done **2026-09-25/26**; "today" means **2026-09-26**.
- **Evidence conventions.** Every claim names its platform.
  - **(unverified)** and **(inferred)** markers are carried over from the source reports.
  - **[3P-hands-on]** (or **[3P]**) marks the single public hands-on teardown of the real Architect builder. It is strong but n = 1.
  - The logged-in Architect UI was **not observed first-hand**. Its layout is reconstructed from docs, tutorials and that teardown (§7.6).
- **Cross-reference IDs.**
  - **F01–F112**: today's Architect features (§7.2).
  - **D1–D20 / N1–N18**: Architect's developer and non-technical gaps (§7.5).
  - **C1–C15**: design concepts (§8).
  - **HF1–HF10**: hero flows to prototype (§9.3).
- **Detailed reports.** Each one has the same sections (1 Positioning · 2 Who/why · 3 Feature inventory · 4 UI layout · 5 User flows · 6 UX strengths & pain points · 7 Recent launches · 8 Ideas for Architect 2.0 · Sources):

| # | Report | Covers |
|---|---|---|
| 01 | [architect.new (current Architect)](platforms/01-architect-new.md) | Lyzr Architect v2.2.0, Lyzr Agent Studio context |
| 02 | [Replit](platforms/02-replit.md) | Agent 4, Design canvas, Workspace, Replit Cloud |
| 03 | [Lovable](platforms/03-lovable.md) | Build/Plan/Chat modes, Cloud, Visual Edits, security scans |
| 04 | [Emergent](platforms/04-emergent.md) | E-1 to E-3 agents, Universal Key, Mission Control |
| 05 | [Vercel v0](platforms/05-vercel-v0.md) | Git-native chats, Design Mode, Platform API |
| 06 | [Rocket.new](platforms/06-rocket-new.md) | Solve / Build / Intelligence, Flutter mobile, Advisor agent |
| 07 | [Cursor & AI IDEs](platforms/07-cursor-windsurf.md) | Cursor, Devin Desktop (ex-Windsurf), Kiro, Zed, GitHub Copilot, Antigravity |
| 08 | [Codex & Claude Code](platforms/08-codex-claude-code.md) | OpenAI Codex, Anthropic Claude Code |
| 09 | [Other app builders](platforms/09-other-app-builders.md) | Bolt.new, Base44, Google AI Studio / Firebase Studio, Anything, Leap.new, Dyad, long tail |
| 10 | [Agent-builder platforms](platforms/10-agent-builder-platforms.md) | OpenAI AgentKit/SDK, LangGraph + LangSmith, CrewAI, Google ADK, Copilot Studio, n8n, Dify, Relevance, Mastra, Vellum, AgentCore and more |

## Table of contents

| § | Section | What's inside |
|---|---|---|
| 0 | [Executive summary](#0-executive-summary) | The 12 insights that should shape Architect 2.0 |
| 1 | [Landscape map](#1-landscape-map) | Audience × output grid; category tables (builders, AI IDEs, coding agents, agent platforms); 2025–26 market dynamics |
| 2 | [Feature matrix](#2-feature-matrix) | 71 features × 11 products in 17 areas, with an "Architect 2.0 should…" column; scoreboard; takeaways |
| 3 | [UI/UX pattern library](#3-uiux-pattern-library) | Layout conventions; landing, home, workspace, build experience, preview, code, deploy, integrations, agent builder, settings; design language; 12 UX takeaways |
| 4 | [User-flow comparison](#4-user-flow-comparison) | 8 journeys (sign-up → first app, generation, iterate/fix, backend, GitHub, import, deploy, agents), step by step per platform, with an ideal flow for each |
| 5 | [Two audiences](#5-two-audiences-non-technical-users-vs-developers) | Personas; needs at 14 stages; how platforms serve both; 12 design principles; the mode-switch recommendation |
| 6 | [Market pain points](#6-market-pain-points) | 16 pain points ranked by breadth × severity, with evidence, the best fixes seen and implications; Trustpilot scoreboard; root causes |
| 7 | [The current Architect](#7-the-current-architect-architectnew-full-feature-inventory-and-developer-gaps) | Company and product facts; a 112-row feature checklist (the parity floor); screens and flows; strengths; 20 developer and 18 non-technical gaps; unverified items |
| 8 | [Opportunities & first-principles ideas](#8-opportunities--first-principles-ideas) | 5 root causes; 15 concepts (C1–C15) with cards; the "do not" list |
| 9 | [Feature list & information architecture](#9-candidate-feature-list--information-architecture-for-architect-20) | Must/Should/Could features in 20 areas, plus a parity cross-walk of all 112 F-IDs; navigation, workspace wireframe, routes, modals; 10 hero flows and a demo order |
| 10 | [Open questions](#10-open-questions-for-the-candidate) | 15 questions to ask before building, each with a default assumption |
| 11 | [Sources](#11-sources) | Key sources per platform, with links to the full reports |
| 12 | [Critic's addendum](#12-critics-addendum) | What the fact-check and completeness pass changed, and what is still uncertain |

---

## 0. Executive summary

**Thesis.** Architect 2.0 is not "a builder with agents added". It wraps a **builder-grade and IDE-grade workspace around the agent platform Lyzr already has**, in one project both audiences share, and it wins on **flow quality and trust**, not panel count.

1. **The target square is empty: hosted app + agents + code, for both audiences, in one project.** Replit (55 of 71 ✅) and v0 (48) cover app and code but score 1 of 8 on agents. Architect leads agents (5 of 8) but scores 0 of 4 on code. Cursor, Codex and Claude Code have 0 ✅ on backend, deploy and monitoring. (§1.0, §2.18–2.19)
2. **Architect's DNA is the moat, so keep all 112 current capabilities (F01–F112).** That DNA is the plan-before-code PRD with an agent table, the layer-per-tab workspace, 26 no-key tools, the AI Consultant, Responsible AI and the "never fake a tool" rule. No competitor fully ships (✅) guardrails, a per-agent knowledge base or multi-agent orchestration. (§2.8, §7.2, §7.4)
3. **Close eight table-stakes gaps first.** 8–10 of 10 competitors ship a live progress feed, point-to-prompt, diff review, a model picker, mid-run steering, roles, project rules and local-IDE export, and Architect has at most a partial version of each. Its six Major developer gaps (D1–D6) match the brief's asks: a code editor, stack choice, any-framework agents, real import, checkpoints, and logs and traces. (§2.19, §7.5.1)
4. **Serve both audiences with one project, a saved depth preference and "open the hood" links, not a Simple/Pro toggle.** Split products (Architect → Studio), export-out (Lovable → Cursor) and always-on depth (Replit) all break at the hand-off. The toggle is also the most common idea in the 10+ public candidate repos. Model the depth links on v0's Publish-over-branch menu and Lovable's Details drawer. (§5.4–5.6)
5. **Money is UX: estimate → live meter → receipt.** Credit burn is the #1 pain across 14+ products (Replit "$1k this week alone"; Bolt 1.5/5 on Trustpilot). No builder quotes cost before a run, and only Lovable meters it live. Add per-promise quotes, caps that pause and ask, free fixes for regressions the AI caused, and separate build and runtime pools. (§2.16, §6.1–6.2, C2)
6. **Make "the UI getting built" the signature moment.** Architect's build today is "a 20-minute black box with a carousel and a mini-game" [3P-hands-on]. Instead, the approved wireframe develops into real UI in the preview, with promise chips ticking, an ETA that recalibrates, a Stop that always works and a receipt with proof. This builds on Lovable's activity cards, Rocket's per-screen Retry and v0's last-good preview. (§3.4, §4.2, C3)
7. **A plan is a contract, tracked to proof.** Architect's plan "quietly dropped two of the three" requested features [3P-hands-on], and Lovable and Emergent made false "fixed" claims. Merge Architect's PRD, Replit's "Done looks like / Out of scope" and Kiro's specs into numbered promises with acceptance checks, each tracked Planned → Verified → Live. (§3.4a, §6.3, C1)
8. **The Agent section is the most defensible differentiator, so bring Studio into the builder.** Agent building has converged on a form + chat card with staged Apply/Discard (Dify, Copilot Studio, n8n), and OpenAI's canvas shuts down on 30 Nov 2026. Nobody binds agents to app screens or imports existing agent code. Ship an Agent Card ⇄ Code view over one open spec (GitAgent/OpenGAP) that compiles to any framework, plus an Agent Map. (§3.9, §4.8, C5–C6)
9. **Undo must be total, and anything irreversible must be gated.** Replit's agent deleted SaaStr's production DB, Rocket's rollback destroys later versions, and Lovable's CVE-2025-48757 exposed data in 170 of 1,645 scanned apps. Architect has no checkpoints, security scan or dev/prod split. Checkpoint code + DB + env + agent config, restore without destroying history, and make destructive actions ask in every autonomy mode. (§6.5–6.7, C9–C10)
10. **Import and GitHub sit beside the prompt, and neither is a prerequisite.** Lovable can't import a repo, and Architect and Rocket import Next.js only, while Replit and v0 accept any repo. Add "Start from…" chips, a workspace-trust gate and an Understanding Report covering stack, routes, detected agents and missing secrets. Default to a managed repo, show branches as "drafts" and open a PR on publish, as v0 does. (§4.5–4.6, C14)
11. **Publish opens a readiness check that fixes problems, not just a button.** Architect has a Marketplace toggle and a domain field with no DNS steps. Lovable (inline scan, DNS status), Replit (access levels) and Rocket (Staging/Production) do better. Score real data, production secrets, protected routes, the security scan, the agent eval and the runtime budget, each with Fix or Accept risk, then show a watchable pipeline and allow rollback. (§3.7, §4.7, C12)
12. **Honesty and stable names beat polish.** Architect apps run on sample data without saying so [3P-hands-on], Replit renamed its modes about 5 times in 12 months, and Architect ships "Soon" chips. Badge Sample/Test/Live data, keep Ask · Plan · Build and Fast · Balanced · Best stable, and expose the builder through MCP and an API, as Lovable, v0 and Replit already do. (§3.0, §6.11, §6.14, C8)

**Suggested demo arc (§9.3).** Build a first app: promise → quote → watch it build (HF1). Then iterate visually with X-ray (HF3), tune an agent's boundaries (HF4), get a plain-language fix with a loop breaker (HF7) and launch through the readiness check (HF8). Finish with a one-minute developer cut from repo import to PR (HF5).

---

## 1. Landscape map

**Scope.** 10 research reports (2026-09-25/26) covering **40+ products** in four categories. Every claim below comes from those reports; "(unverified)" markers are carried over from the source reports.

### 1.0 Where everyone sits (audience × what the product outputs)

| Primary audience ↓ / Output → | **Hosted, running app** | **Code, diffs, PRs** | **Agents (config, runtime, channels)** |
|---|---|---|---|
| **Non-technical first** | **Architect (current)**, Lovable, Emergent, Rocket, Base44, Anything | — | Copilot Studio, LangSmith Fleet, Relevance AI, Gemini Agent Designer, Base44 Superagents |
| **Both** | Replit, v0, Bolt, AI Studio Build; Cursor "Start from scratch" (Aug 2026, a thin slice) | Replit and v0 also expose full code, Git and PRs | Lyzr Agent Studio, CrewAI Studio, n8n (+ Agents), Dify, Vellum |
| **Developers first** | Leap.new, Dyad | Cursor, Devin Desktop (ex-Windsurf), Kiro, Zed, GitHub Copilot, Antigravity, **Codex**, **Claude Code** | LangGraph/LangSmith, OpenAI Agents SDK/API, Google ADK, MS Agent Framework, Mastra, Pydantic AI, Agno, Claude Agent SDK/Managed Agents, AWS AgentCore |

**Reading the map.** No product covers all three columns for both audiences. Replit and v0 are closest on apps plus code, but neither has an agent layer (no agent config, evals or traces). Architect has the deepest agent layer of any app builder, but it has no code layer. Base44's in-app agents are the only other agent-config UI, and they are shallower. **Architect 2.0's target is the empty centre: hosted app + agents + code, for both audiences, in one project.**

### 1.1 Prompt-to-app builders

| Platform | What makes it different | Why people use it | Audience | Pricing model |
|---|---|---|---|---|
| **architect.new** (Lyzr, current; v2.2.0) | **Agent-first.** One prompt gives a PRD with an agent table, then real Lyzr Studio multi-agent orchestration (tools, KB, guardrails, Hallucination Manager), then a Next.js app with NoSQL DB and auth | Plan-before-code; "no black boxes" agent layer; no API keys for 26 built-in tools; PDF/PPT artifacts for stakeholders; enterprise governance (VPC, RBAC, audit) | Non-tech (execs, consultants, agencies, enterprise) | Free / $20 / $40 / $99 / Custom; **$-denominated credits spent on build *and* runtime**; $25/50/100 top-ups |
| **Replit** (Agent 4) | **Owns the full stack end to end** (NixOS container, Postgres with dev/prod split, Auth, storage, hosting), with a **real Linux IDE underneath**. Parallel tasks on a Kanban; Design canvas; up to 7 artifacts per project | Zero setup, one bill; any language ("General"); 24/7 services and cron; App Testing with video replay | **Both** (strategy non-tech first; strongest dev layer among builders) | Starter free / Core $20 / Pro $100 (tiered to $4k); **effort-based** cost per checkpoint; **Free Mode** (GPT-5.6 Luna, Aug 2026): un-metered within 5-hour usage windows, **for Core and Pro subscribers only**, not the free Starter plan (Replit blog, critic-verified) |
| **Lovable** | **Design quality as a system**: 3 design directions before code, Creative Engine model routing. All-in-one managed Cloud (Supabase OSS), AI gateway, payments, SEO, security scans | Fastest route to a polished, shareable MVP; no dashboards; real code via 2-way Git; deep trust tooling (Quick/Deep scan, block-on-critical, Trust Center) | Non-tech first; dev hooks growing (MCP server, API, code edit) | Free (5 daily credits) / Pro from $25 / Business from $50 / Ent; **one unified credit pool** for build + Cloud + AI (rolled out from 1 Jun 2026, completed Aug 2026, per Lovable docs); unlimited members |
| **Emergent** | **"Engineering team in a box"**: specialised agents (plan, design, build, test, deploy) that **ask before building**; agent tiers E-1 to E-3 (Mission Control); **Universal LLM Key**; web plus Expo mobile | Feels like hiring a team; hosting, SSL, domains and AI keys built in; SMB operators replacing spreadsheets | Non-tech (~70% no coding experience; ~40% SMB) | Free 10 / Standard $20 (100) / Pro $200 (750) credits; **50 credits/month per deployed app**; everything bills; no pre-run estimate |
| **Vercel v0** | **Git-native and production-safe**: a branch per chat, PR-and-merge Publish that respects branch protection and CI; real VM sandbox; Design Mode; headless **Platform API v2 + MCP** | Most idiomatic Next.js/shadcn output; Vercel trust; designers and PMs ship through PRs; embeddable by other products | Both (designers, PMs, Next.js devs, platform teams) | Free $5 + 7 msgs/day / Plus $30/user / Business $100/user / Ent; **token-metered per model tier**; $2 daily login credits |
| **Rocket.new** | **"Vibe Solutioning"**: Solve (research reports) → Build → Intelligence (competitor feeds). **Native Flutter mobile**; first-class Figma import; 100+ slash commands; 25k+ templates | Investor or client demo fast; mobile without Flutter knowledge; marketing-site extras (SEO/GEO, WCAG, Core Web Vitals) | Non-tech (thin dev layer) | Free 20 / Pro $25 (100) / Rocket $50 (250) / Booster $250 (1,500) credits; rollover; no seat fees; **3 pricing changes in ~12 months** |
| **Bolt.new** (StackBlitz) | **In-browser runtime** (WebContainers): fastest prompt-to-deploy; Bolt Cloud DB and hosting; 20-prompt queue; effort-named agents (Standard / Max / **Forge** on open models) | Speed with zero setup; multiplayer and roles; Lovable import; free visual edits | Both (founders, agencies; front-end devs) | Free tokens (300K/day) / Pro $25 (10M+, 1-month rollover) / Teams $30 per member / **Lite $9 (Forge only)**; tokens |
| **Base44** (Wix) | **"Batteries included"** proprietary backend (entities, auth, Deno functions, workflows, email); **in-app agents** with a Tools tab and WhatsApp/Telegram/LINE; Superagents; free **Production Pack** (verify, test, scan) | No separate Supabase/Vercel; beginner-friendly; "AI employee" agents | Non-tech core; dev layer growing (2-way Git, CLI, branches) | Free / Starter $16 / Builder $40 / Pro $80 / Elite $160 (likely annual-billing equivalents, unverified); **two credit types** (message + integration); no rollover |
| **Google AI Studio Build** (+ Firebase Studio, sunsetting) | **Free**, Gemini-native, Google-infra-native (Antigravity agent, Firebase, Cloud Run); **only builder generating native Kotlin/Compose Android** (in-browser emulator, Play test track) | Free and instant; Gemini API prototyping; export to Antigravity IDE | Both (students, Gemini devs, Android devs) | Build UI free; pay Gemini API + Cloud Run; Starter tier 2 free apps |
| **Anything** (ex-Create.xyz) | **Mobile-first with App Store/TestFlight submission from the browser**; Max autonomous QA agent; dev/prod DBs with schema-only migration; builder CLI for agents | Real App Store path with IAP (RevenueCat), Stripe, ads | Non-tech | Free / Pro $19 / Max $199 / Teams custom; credits (which plan includes store submission is unverified) |
| **Leap.new** (Encore) | **Backend-first**: Encore.ts microservices, live architecture diagram, API explorer, tracing; **deploy to your own AWS/GCP** | Production-grade backend in days; no vendor hosting lock-in | Dev | Free 15 credits/mo / Pro $30–$750 / Team $500–$2,500 |
| **Dyad** | **Local, open-source desktop builder**, bring your own key; local models; now runs on ChatGPT/Codex subscriptions and Claude Code (beta) | Free, private, no lock-in | Dev / hobbyists | Free (BYOK) / Pro $20 / Max $79 |
| *Long tail* | Tempo (now "IDE for the whole team"; human Agent+ ~$4k/mo), Same (URL/screenshot clone), Macaly (Playwright self-healing), Softgen (~$33/yr licence + usage), Genspark, Manus. **Mocha shut down 1 Aug 2026** | — | Mixed | Mixed |

### 1.2 AI IDEs

| Platform | What makes it different | Why people use it | Audience | Pricing model |
|---|---|---|---|---|
| **Cursor** (Anysphere, now SpaceX) | **Agent command centre** (Agents Window, Cursor 3) over a VS Code fork. Best-in-class **Tab**; own models (Composer 2.5); parallel agents (local, worktree, cloud, SSH); lifecycle coverage: Bugbot, Security Review, Origin forge, Rollouts, Projects | Deep codebase control (rules, hooks, per-hunk Keep/Undo, run modes); speed; agents from Slack, GitHub, Linear, iOS | Dev (~95%+, inferred) | Hobby free / Pro $20 / Pro+ $60 (secondary) / Ultra $200 / Teams $40–$120; **usage at API rates**; OpenAI cuts Cursor's model access on 12 Nov 2026 (bring-your-own OpenAI key and Azure/Bedrock routing still work; Cursor's CEO says OpenAI served ~5% of customers) |
| **Devin Desktop** (ex-Windsurf, Cognition) | Opens on an **Agent Command Center Kanban** (in progress / blocked / ready for review); Spaces; **ACP** runs Codex, Claude and Gemini agents side by side; Cascade retired 1 Jul 2026 | Agent-neutral workspace; in-IDE preview with "Send element"; console errors flow into the prompt | Dev | Free / Pro $20 / Teams $40 / Max $200; **daily + weekly quotas** (backlash: "33% price hike") |
| **Kiro** (AWS) | **Spec-driven**: requirements.md (EARS) → design.md → tasks.md, with approval gates; property-based tests from requirements | Plan as reviewable artifact; AWS alignment | Dev | Credits per user: Free 50 / Pro $20 (1,000) / Pro+ $40 (2,000) / Pro Max $100 (5,000) / Power $200 (10,000); no rollover (kiro.dev/pricing, critic-verified) |
| **Zed** | Rust-native editor; Agent Panel with **multi-buffer per-hunk review**; co-authored **ACP** | Speed; clean review; runs Claude Code and Codex inside | Dev | BYO key or plan |
| **GitHub Copilot** | **Agent HQ / mission control** across repos; coding agent turns issues into draft PRs; runs Claude and Codex agents in VS Code | Governance plus the installed base | Dev | Seats + premium requests (unverified detail) |
| **Google Antigravity** | VS Code fork with a **Manager View** and review "Artifacts" (plans, screenshots, recordings) instead of raw logs | Receives AI Studio exports; Google stack | Dev | Not researched (?) |

### 1.3 CLI and cloud coding agents

| Platform | What makes it different | Why people use it | Audience | Pricing model |
|---|---|---|---|---|
| **OpenAI Codex** | A **mode inside the ChatGPT desktop app** (since 9 Jul 2026) plus web, CLI, IDE, `@codex` in GitHub/Slack/Linear, SDK. Local / Worktree / Cloud in one dropdown; best-of-N cloud attempts; `/goal` | Long unattended backend tasks; strongest code review ("Claude builds, Codex reviews"); distribution (7–8M weekly users, secondary) | Dev; ~20% non-devs (secondary) | Bundled in ChatGPT: Free/Go ($0/$8), Plus $20, Pro $100/$200, Business $20/user; **5-hour + weekly limits**; token credits |
| **Claude Code** | **Composable harness** (CLAUDE.md, skills, subagents, hooks, MCP, plugins, dynamic workflows up to 1,000 agents); same engine on CLI, desktop, web and mobile; Projects coordinator; Browser pane with auto-verify; CI bar with Auto-fix/Auto-merge | Interactive speed, front-end and refactor strength, richest extension ecosystem; plan-approval dialog; Auto mode default | Dev; non-coders pushed to Cowork | Pro $20 / Max $100 / $200 / Team seats / Ent $20 + API usage; **5-hour + weekly limits**; Code Review $15–25 per review |

**Both:** neither hosts apps, provides a DB/auth, or deploys. That is the gap app builders own.

### 1.4 Agent-builder platforms and frameworks

| Platform | What makes it different | Why people use it | Audience | Pricing model |
|---|---|---|---|---|
| **Lyzr Agent Studio** (engine under Architect) | Studio form + conversational builder; Manager Agent + **SuperFlow** DAG (cron, webhooks, approvals); Responsible AI; 3 KB types (RAG, Knowledge Graph, Text-to-SQL); Simulation Engine; A2A import; OpenController | Enterprise-safe agents; deepen what Architect generated | Both (enterprise) | Community $0 / Starter $19 / Pro $99; ~$0.08 per run + LLM pass-through (unverified) |
| **OpenAI AgentKit / Agents SDK / Agents API** | **Agent Builder canvas retired** (deprecated 3 Jun, shutdown 30 Nov 2026); durable layers are Agents SDK, **Agents API** (Codex harness as a service, beta 10 Sep 2026), **ChatKit**, Connector Registry | Model vendor's full stack; embeddable chat UI | Dev (no-code moved to Workspace Agents in ChatGPT) | API tokens + tools; sandboxes at container rates |
| **LangGraph + LangSmith** (Studio, **Fleet**) | De-facto "serious" framework: durable graphs, checkpoints, **time-travel debugging**; most complete tracing/evals; Fleet = chat-built no-code agents with identity and an approvals Inbox | Control of loop and state; proof agents got better | Dev (+ no-code via Fleet) | Developer $0 / Plus $39 per seat; traces + LCU ($1.50) |
| **CrewAI** (OSS + AMP, Crew Studio) | Role/goal/task "crews" + event-driven Flows; Studio generates crews from a sentence; **ZIP export is one-way** | Intuitive multi-agent metaphor; prototype then hand off | Both | AMP Basic free (50 executions/mo) / Ent custom; **per execution** |
| **Google ADK + Gemini Enterprise Agent Platform** | Multi-language (Py/TS/Go/Java/Kotlin), A2A-native, ADK 2.0 graph workflows; no-code Agent Designer; Memory Bank off by default | Open, multi-language; GCP runtime | Both | OSS; platform pricing not researched |
| **Microsoft Copilot Studio + Agent Framework** | NL-first "GitHub Copilot harness" (Instructions, Knowledge, Tools, Skills, Model, Connected agents, Memory); **harness choice is irreversible**; publish into Teams/M365 | M365 distribution; Power Platform governance | Non-tech makers (+ devs via Agent Framework) | **Copilot Credits** that scale with work (ROI models broke) |
| **n8n** (+ new **Agents**, Sep 2026) | Automation-first canvas with an AI Agent node; **"define once, use anywhere"** (chat, node, Slack, schedule); self-hostable | 1,000+ integrations; execution pricing that doesn't penalise tool calls | Both | Cloud $20 / $50 / $667 per month by executions; 1 agent turn = 1 execution |
| **Flowise** (Workday) | OSS LangChain-rooted canvas (Agentflow V2), Human Input node | Free, visual | Both | OSS (hosted pricing ?) |
| **Langflow** (IBM/DataStax) | OSS visual Python builder; **any flow exports as an MCP server**; hosted version shut Apr 2026 | Visual + Python escape hatch | Dev | OSS |
| **Dify** | OSS "LLMOps + agents"; New Agent built by chat with a **"Build draft" to Apply/Discard**; Linux sandbox; Knowledge Pipeline canvas | One agent reused across workflows; self-host | Both | OSS + cloud (pricing ?) |
| **Relevance AI** | "AI workforce" for GTM; **evals auto-generated from production cases that block publishing**; cost per task shown | Safe releases; GTM templates | Non-tech (GTM teams) | Pro $19–29 / Team $234–349; Actions + Vendor Credits; free plan retired |
| **Mastra** | TypeScript framework + Studio with Agent Editor; datasets with **side-by-side experiment comparison** | TS-native web devs | Dev | Starter free / Teams $250/mo (CPU-hours) |
| **Vellum** | NL Agent Builder with **two-way sync between visual graph and Python SDK code** (the only true 2-way claim) | PMs and engineers on one artifact | Both | Not researched (?) |
| **Claude Agent SDK + Managed Agents** | Claude Code harness as a library; Managed Agents = versioned agent objects + hosted/self-hosted sandbox, vaults, memory stores, outcome graders, cron deployments, $ session budgets | Harness + sandbox primitive; steer mid-run | Dev | Tokens + ~$0.08 per session-hour (unverified) |
| **Pydantic AI** | Type-safe Python agents, structured output, durable execution (Temporal), Logfire tracing | Correctness and typing | Dev | OSS |
| **Agno** | Python SDK + AgentOS runtime in your cloud; browser Control Plane talks straight to your runtime | Data never leaves your cloud | Dev | OSS + AgentOS (pricing ?) |
| **AWS Bedrock AgentCore** | **Most framework-agnostic hosting** (CrewAI, LangGraph, ADK, OpenAI SDK, Strands…): Runtime, Gateway, Identity, Memory, Observability, Evals, Policy, Registry | Run any framework under enterprise controls | Dev / platform teams | Consumption-based, no minimums |

### 1.5 Market dynamics (what changed in 2025–26)

- **Consolidation and platform risk are now a UX concern.** Wix bought Base44 (~$80M upfront in Jun 2025, plus earn-outs through 2029; a further ~$41M earn-out was reported after Base44 passed $100M ARR; the ">$150M" total is an estimate, unverified); Cognition bought Windsurf, shipped it as Devin Desktop on 2 Jun 2026 and retired Cascade on 1 Jul (4 weeks' notice); SpaceX agreed to buy Cursor for $60B in stock (announced 16 Jun 2026, closed in Q3), after which **OpenAI announced it will cut Cursor's model access on 12 Nov 2026** (BYO keys still work); Workday bought Flowise; Cursor bought Graphite; Google is folding Firebase Studio into AI Studio; **Mocha shut down**; OpenAI killed Agent Builder after ~8 months; hosted Langflow closed. **Lesson: the durable layer is code and open formats.** Architect 2.0 must make export (Git, framework code, GitAgent/OpenGAP) a first-class promise, not an escape hatch.
- **Builders and dev tools are converging from both sides, and they meet at the backend line.** Builders added developer layers: Lovable code editing, 2-way Git, MCP server and API; v0 GitHub import, PRs, a terminal and **Claude Code pre-installed in the sandbox**; Replit's IDE and SSH; Base44 CLI and branches. Dev tools added builder layers: Cursor "Start from scratch" → Vercel publish and Design Mode; the Claude Code Browser pane with auto-verify; Codex annotation mode. Builders still own **backend + hosting**, and dev tools still own **agent workflow + review**. Nobody has both, plus an agent layer.
- **The unit of work moved from "a chat" to "a fleet".** Replit Agent 4's task Kanban, Cursor Projects, Claude Code Projects, the Devin Desktop Command Center and Codex worktrees all run parallel isolated agents with a review queue. Long-horizon goals (`/goal` in Lovable, Codex, Claude Code and Cursor) are standard. Autonomy moved to **classifier-reviewed "auto" by default**: Claude made Auto the default after users approved 97% of prompts reflexively, and Cursor's Auto-review is its default.
- **Pricing is unstable and every change causes a backlash.** The sequence ran messages → tokens → effort/credits → unified balances: Cursor (Jun 2025), Replit effort pricing (Jul 2025; "$1k this week alone" after Agent 3), v0 (message → token), Windsurf ("33% hike"), Rocket (3 changes in 12 months). Lovable now pools build, hosting and AI in one balance; Architect already bills build + runtime together. **Counter-trend:** un-metered or cheap usage subsidised by cheap models (Replit Free Mode on GPT-5.6 Luna, which is included in the paid Core/Pro plans within 5-hour windows rather than being a free tier; Bolt Lite $9 on open models; Lovable free chat through 31 Oct; v0 $2/day login credits). Weak unit economics (Mocha closed; Base44 near break-even) push vendors toward opaque credits, so **transparent cost is a differentiator**.
- **Builders are becoming infrastructure that other agents call.** Lovable (MCP, 40+ tools, plus REST API), v0 (Platform API v2 GA + MCP), Replit (native MCP server), Emergent (MCP, `claude mcp add`) and Anything (CLI with `--json`) can all be driven from Claude Code, Cursor or ChatGPT. Developers increasingly use a builder *from* their own agent. Architect has none of this (its OpenAPI page is a placeholder).
- **Everyone is expanding from "apps" to "work agents", which is Architect's home turf.** Examples: Replit Chats and Routines; Lovable Chats, file generation and Slack/Telegram; Base44 Superagents (own WhatsApp number, phone, meetings); Emergent Wingman; Cursor Grok Bot; Codex "for (almost) everything"; Rocket Solve; Bolt Slides. Architect's agent-first thesis is becoming the market's direction, so its head start (Studio, KB, guardrails, evals) erodes unless 2.0 turns it into visible UX.
- **Agent building converged on "form + chat card", not canvases.** OpenAI's canvas died. Copilot Studio, LangSmith Fleet, Dify and n8n moved to describe-to-build with staged "Apply/Discard" drafts. Canvases survive only for deterministic workflows. The anatomy is now standard (Instructions → Model → Tools/MCP → Knowledge → Skills → Memory → Sub-agents → Triggers → Guardrails, wrapped by Test → Evaluate → Monitor → Publish). Protocols settled on **MCP + A2A + AG-UI**, and **framework-agnostic hosting** (AgentCore) is real, which makes an "any framework" promise feasible.
- **Trust has become a feature race.** Two incidents drove it: Lovable's CVE-2025-48757 (weak RLS in 170 of 1,645 scanned apps) and Replit's SaaStr production-DB deletion, which led to its dev/prod split. Responses include Replit L1–L3 scans with black-box pen tests, Lovable Deep scan with "block publish on critical", Base44's free Production Pack, Bolt's audit on publish, and Cursor/Codex/Claude security reviews. Architect currently has **no security scan, no environment separation and no in-product rollback** (§2).

---

## 2. Feature matrix

**Legend:** ✅ shipped and documented (paid-tier requirements are noted in the cell) · ◐ partial: limited in scope, beta, business/enterprise tier only, or only through another product or hand-written code · ❌ absent, or not found in the product's docs · **?** unknown (the report could not verify it). Notes in cells stay short; "(unverified)" is carried over from the source reports. Bolt and Base44 come from the shorter multi-product report (09), so they carry more "?". Cursor, Codex and Claude Code are marked ❌ where they generate *code* for a capability but do not provide it as a product feature (for example a database).

**Columns:** Arch = architect.new today (v2.2.0). Last column = the design implication for Architect 2.0.

### 2.1 Auth & onboarding

| Feature | Arch (current) | Replit | Lovable | Emergent | v0 | Rocket | Bolt | Base44 | Cursor | Codex | Claude Code | Architect 2.0 should… |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Builder sign-in options | ◐ Google, email | ✅ Google, GitHub, X, email, SSO | ✅ + Apple, SSO, 2FA | ✅ Google, GitHub, email, FB | ✅ Vercel acct (GitHub, Google, SAML) | ◐ Google, SSO, email OTP | ? | ? | ◐ web acct; SSO/SCIM (Ent) | ✅ ChatGPT acct or API key | ✅ claude.ai, API key, Bedrock/Vertex | Offer Google, GitHub, email and SSO; GitHub sign-in also links repos for devs |
| Prompt before sign-up | ◐ persona pages only; home is a sign-in card | ? "first prompt free" | ◐ URL prefill; remix previews signed-out | ◐ type first, login on submit (inferred) | ? | ? | ? | ? | ❌ install first | ❌ | ❌ | Let visitors type a prompt and see the plan signed out; ask for sign-up at "Start building" and keep the draft |
| Idea discovery / guided start | ✅ AI Consultant → 3 ideas + hrs/week saved | ◐ profile questions (unverified) | ❌ | ◐ tool survey; Emmy helper | ❌ | ◐ Solve research (paid tier) | ◐ Enhance-prompt questions | ◐ Idea Library | ◐ VS Code settings import | ❌ | ◐ `/init` → CLAUDE.md | Keep the Consultant for non-tech; give devs an "Import repo" path that ends in an auto-written repo brief |

### 2.2 Homepage & prompt entry

| Feature | Arch (current) | Replit | Lovable | Emergent | v0 | Rocket | Bolt | Base44 | Cursor | Codex | Claude Code | Architect 2.0 should… |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Attachments & voice | ✅ files → RAG/dataframes; mic | ✅ + sheets → seeded DB; voice | ✅ ≤10/msg; dictation | ✅ images, PDFs; voice | ✅ widest types (video, 3D, ZIP); voice ? | ◐ 5 × 5 MB; no voice documented | ✅ files; dictation | ✅ files, a/v; dictation | ◐ images, @files; voice on iOS | ✅ files; `/voice` | ✅ images, PDFs; dictation (secondary) | Put a chip on each attachment saying its role (knowledge, seed data, design ref) |
| Templates / library / gallery | ✅ Prompt Library, Marketplace, 106 use cases | ✅ remixable Gallery by role | ✅ ~207 templates; Launched | ◐ chips, showcase apps | ✅ community, fork counts | ✅ 25k+ site templates | ✅ Marketplace + team templates | ✅ Idea Library | ◐ automation templates only | ❌ skills/plugins only | ❌ plugins/skills only | Make blueprints open as editable *plans*, not code; add framework starters for devs |
| Stack / build-type choice at start | ❌ Next.js + NoSQL + Lyzr only | ✅ 9 artifact types; any stack | ❌ React/TanStack fixed | ◐ Full-stack/Mobile/Landing; stack fixed | ❌ Next.js | ◐ type tabs; stack locked | ◐ several web stacks + Expo | ❌ proprietary | ✅ any | ✅ any | ✅ any | Default to "Recommended"; put "Choose stack & agent framework" behind one disclosure |
| Model / effort picker | ❌ builder model hidden | ✅ Free/Power/Max + Auto | ❌ auto-routed (no picker documented) | ✅ agent tiers + models | ✅ Mini→Max Fast, prices shown | ❌ | ✅ Standard/Max/Forge | ✅ + Compare Models | ✅ Auto router + models | ✅ model + effort | ✅ model + effort | Give everyone Fast / Balanced / Best presets; expose exact model and effort in dev view |

### 2.3 Chat & agent interaction

| Feature | Arch (current) | Replit | Lovable | Emergent | v0 | Rocket | Bolt | Base44 | Cursor | Codex | Claude Code | Architect 2.0 should… |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Plan mode (read-only, approvable plan) | ✅ PRD + agent table + mockup; Plan toggle | ✅ plan card: "Done looks like", "Out of scope" | ✅ editable plan, comment-to-revise, versions | ◐ E-3 phased plan only | ◐ preset instruction | ◐ screen list only | ✅ Plan → "Implement this plan" | ✅ Plan / Discuss | ✅ editable, Mermaid | ✅ `/plan` | ✅ approval dialog (auto / manual / keep planning) | Keep the PRD; make it a living artifact with comments and an explicit "Out of scope" list, so scope is never dropped silently |
| Structured clarifying questions | ✅ multiple-choice | ✅ + Smart Connector Picker | ✅ cards; skip = defaults | ✅ asks first (keys, auth, design) | ✅ in prompt form | ✅ clarity-gate modal | ◐ via Enhance prompt | ? | ✅ interactive | ◐ Plan mode only | ✅ (auto-continues after 60 s) | Ask only about gaps and show the defaults chosen; never auto-continue silently |
| Autonomy / permission dial & guards | ❌ none exposed | ◐ modes; dev/prod DB split | ✅ Always/Ask/Never; approval cards | ◐ budget pause only | ✅ Ask/Auto/Full; `rm -rf` guard | ◐ auto-runs "safe" actions | ? | ◐ approval before Git writes | ✅ Auto-review classifier + sandbox | ✅ sandbox levels + auto-review | ✅ Manual → Auto → Bypass | Put one dial next to Send; destructive, production and outbound actions always confirm |
| Steer / queue / stop mid-run | ◐ Stop (planning only) | ✅ Steer vs Queue; Stop | ✅ follow-ups mid-run; Stop keeps work | ◐ E-3 pause/resume; "Wake Up Agent" | ✅ queue, interrupt | ❌ can't stop once started | ✅ 20-prompt queue | ✅ In-Message Runs | ✅ non-blocking steer | ✅ queue, `/fork` | ✅ queue, send-now | Keep queue, steer and Stop always live; Stop keeps the work and shows the cost so far |
| Parallel / background agents | ❌ | ✅ task Kanban, isolated copies | ◐ read-only subagents; Goal runs ≤10 h | ◐ E-3 multi-hour runs | ◐ one chat per branch | ❌ | ❌ | ◐ branches as app copies | ✅ worktrees, cloud, best-of-n, Projects | ✅ worktrees, cloud, best-of-N | ✅ worktrees, subagents, Projects | Show devs a task board of isolated drafts; show non-tech a plain "3 things in progress" list |
| Project memory, rules & skills | ◐ skill files from plan | ✅ Memories, replit.md, Skills | ✅ Knowledge, AGENTS.md, Skills | ◐ system-prompt edit (Pro) | ✅ instructions, SKILL.md, memories | ◐ project context files | ✅ Skills, claude.md | ✅ AGENTS.md, skills | ✅ rules, AGENTS.md, hooks | ✅ AGENTS.md, skills, hooks | ✅ CLAUDE.md, skills, hooks | Keep one plain-words "Project brief" that compiles to AGENTS.md and can be edited in both views |

### 2.4 "UI getting built" experience

| Feature | Arch (current) | Replit | Lovable | Emergent | v0 | Rocket | Bolt | Base44 | Cursor | Codex | Claude Code | Architect 2.0 should… |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Design directions / canvas before code | ◐ App Mockup tab; 45+ themes | ✅ infinite canvas, Explore variants | ✅ 3 directions, no extra cost | ❌ | ❌ | ◐ pick screens first | ❌ | ✅ canvas; 4 options side by side | ❌ | ❌ | ❌ | Render 2–3 directions from the plan's mockup; the user picks one, then the build starts |
| Live progress feed | ◐ checklist + carousel/mini-game ("20-min black box", 3P) | ✅ progress, file changes, summary | ✅ activity cards → Timeline/Changes | ✅ checklist; E-3 Mission Control | ✅ tool cards + Work details | ✅ per-screen status + Retry | ✅ streams in chat; chime | ✅ build checklist | ✅ tool calls, todo, live diffs | ✅ plan checklist, task sidebar | ✅ todo list; Normal/Verbose | Show a plain-language checklist per agent and screen, with ETA and credits so far; "Show details" opens the tool log |
| Preview fills in while building | ❌ shown only when ready | ✅ updates as work lands | ✅ hot reload; live toggle | ? | ✅ progress lines while VM boots | ✅ screens appear as done | ✅ in-browser runtime | ✅ jumps to new pages | ◐ local/cloud dev server | ◐ dev server in app browser | ✅ auto-starts after edits | Render skeleton screens first; light up each agent in the Agents panel as it is created |

### 2.5 Preview & visual editing

| Feature | Arch (current) | Replit | Lovable | Emergent | v0 | Rocket | Bolt | Base44 | Cursor | Codex | Claude Code | Architect 2.0 should… |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Preview with route bar & devtools | ◐ "Live App"; no URL bar or console | ✅ URL bar, Devtools | ◐ page picker; agent reads console | ◐ link; 30-min timeout; use F12 | ✅ Console: logs, requests, terminal | ◐ URL bar; no console | ? | ◐ "Act as a user"; devtools ? | ✅ agent browser, console + network | ✅ in-app browser, CDP | ✅ Browser pane, auto-verify | Add a route bar, "View as user/role", and a collapsible console for devs |
| Device sizes / frames | ❌ | ✅ presets; iOS/Android sims | ✅ Desktop/Tablet/Mobile | ◐ Expo Go QR only | ✅ responsive sizes | ✅ presets + phone frames | ◐ Expo Go QR | ✅ desktop/mobile menu | ❌ | ❌ (unverified) | ❌ (unverified) | Add a desktop/tablet/phone toggle and a QR code to open on a phone |
| Direct visual editor (no credits) | ❌ | ✅ free deterministic edits | ◐ inline text (100 free/day) | ✅ Visual Edits, batched Apply | ✅ Design Mode: layers, props | ✅ floating toolbar + Theme panel | ✅ free until saved | ✅ Edit mode, free | ✅ visual editor + React props | ◐ Adjust font/spacing/colour | ❌ | Make direct edits free (text, colour, spacing, image); a batch "Apply" becomes one change |
| Point-to-prompt / annotations | ❌ screenshots in chat | ✅ Edit tool, cursor chat | ✅ select, draw, comment | ✅ describe change on element | ✅ Annotations, batched | ✅ "Ask me…" + screenshot tool | ✅ Select tool | ✅ element chips; notes → chat | ✅ Design Mode, draw, voice | ✅ Annotation mode | ◐ select element | Let users click a UI element *or an agent's output* and say "Change this…", scoped to that item |

### 2.6 Code (editor, files, terminal, diff)

| Feature | Arch (current) | Replit | Lovable | Emergent | v0 | Rocket | Bolt | Base44 | Cursor | Codex | Claude Code | Architect 2.0 should… |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Code editor + file tree | ❌ "code preview" only | ✅ full IDE | ◐ paid; Free is read-only | ✅ browser VS Code | ✅ VS Code-style, split view | ✅ Explorer + editor | ✅ lock/target files | ◐ Code tab (paid) | ✅ full IDE + Tab | ◐ files pane; weak inline edit | ◐ spot-edit pane | Put a Code tab in the same workspace with editing on every plan; files drag from the tree into chat as @file |
| Terminal / shell | ❌ | ✅ Shell, Workflows | ❌ not documented | ✅ in VS Code | ✅ + Claude Code pre-installed | ❌ | ? | ◐ local CLI (`base44 dev`) | ✅ sandboxed per agent | ✅ multi-tab | ✅ CLI-native + pane | Add a sandboxed terminal in dev view, showing the commands the agent runs |
| Diff review per change | ❌ | ✅ Git pane; task Apply | ✅ Changes tab | ❌ (unverified) | ✅ diff per version | ✅ side-by-side diff | ? | ✅ version code compare | ✅ Keep/Undo per hunk | ✅ hunk revert, line comments | ✅ line comments, Review code | Treat each agent turn as a change set: plain-English summary for non-tech, hunks for devs |
| Export / local IDE / SSH | ◐ via GitHub; self-host (React + Lyzr SDK) | ✅ SSH, ZIP | ✅ ZIP (paid), Git | ✅ ZIP, GitHub | ✅ ZIP, Git, CLI | ◐ ZIP (Pro, web only) | ◐ GitHub sync | ✅ ZIP, Git, CLI | ✅ local-native | ✅ local; Open in VS Code | ✅ local; Open in IDE | Ship a CLI + MCP so local edits sync back into the same project and chat timeline |

### 2.7 Backend (DB, end-user auth, storage, functions, cron)

| Feature | Arch (current) | Replit | Lovable | Emergent | v0 | Rocket | Bolt | Base44 | Cursor | Codex | Claude Code | Architect 2.0 should… |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Managed database | ✅ auto NoSQL, per-app isolation | ✅ Postgres, dev + prod | ✅ Cloud Postgres, backups | ✅ MongoDB; Supabase toggle | ✅ Neon/Supabase/AWS | ◐ Supabase only (BYO) | ✅ Bolt DB or Supabase | ✅ built-in entities | ❌ | ❌ | ❌ | Auto-provision Postgres + a vector store; offer BYO DB with a guided connect |
| DB browser / SQL | ◐ collections + schema view | ◐ DB tool (SQL UI unverified) | ✅ tables, RLS, SQL editor | ❌ none found | ✅ DB Studio, NL→SQL | ❌ use Supabase | ✅ tables, RLS, row edit | ✅ Data tab, CSV, backup | ❌ | ❌ | ❌ | Offer a table view with editing and NL→SQL; show migrations as diffs |
| End-user auth | ◐ email/password only | ✅ Replit Auth or Clerk, SSO | ✅ email, phone, social, SAML | ◐ Google login | ✅ Better Auth / Supabase | ◐ Supabase; social set up in 3 places | ✅ + breach-checked passwords | ✅ + Entra/Okta SSO | ❌ | ❌ | ❌ | Provider toggles (email, Google, Microsoft, SSO); app roles drive agent permissions |
| File storage | ❌ not documented | ✅ App Storage | ✅ Cloud Storage | ◐ uploads, no UI (unverified) | ✅ Vercel Blob | ◐ Supabase buckets | ✅ File Storage | ? | ❌ | ❌ | ❌ | Provide buckets; uploads can be auto-indexed into an agent's KB |
| Server functions | ◐ API routes to agents only (inferred) | ✅ any backend | ✅ edge functions | ✅ FastAPI | ✅ API routes, Server Actions | ◐ Supabase edge functions | ✅ Server Functions | ✅ Deno functions | ❌ code only | ❌ code only | ❌ code only | List functions with logs; any function can be exposed as an agent tool |
| Cron / background jobs | ❌ (SuperFlow cron in Studio only) | ✅ Scheduled deploys, Routines | ✅ Jobs + run history | ❌ | ◐ via Vercel (unverified in v0) | ❌ | ? | ✅ Workflows + triggers | ◐ Automations (agent, not app) | ◐ Scheduled tasks (agent) | ◐ Routines (agent) | One Triggers panel (schedule, webhook, event) shared by app jobs and agents |

### 2.8 AI & agents

| Feature | Arch (current) | Replit | Lovable | Emergent | v0 | Rocket | Bolt | Base44 | Cursor | Codex | Claude Code | Architect 2.0 should… |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| AI in apps with no API keys | ✅ built-in; credits at runtime | ✅ AI Integrations (paid) | ✅ AI gateway | ✅ Universal Key | ✅ AI Gateway (OIDC) | ❌ BYO keys | ❌ via code only (09 §3.1; no managed key documented) | ✅ agent models, "Automatic" | ❌ | ❌ | ❌ | Use a managed key by default, BYOK per provider, and show runtime cost per agent |
| Agent config UI (instructions, model, tools) | ✅ Agents tab; deep edits in Studio | ❌ | ❌ | ◐ custom *builder* agents (Pro) | ❌ code only | ❌ | ❌ | ✅ Guidelines + Tools tabs | ❌ SDK/code | ❌ `.codex/agents` files | ◐ `/agents` manager, .md files | Put an Agent Card (form + chat) inside the app workspace, synced to code, with no hop to Studio |
| Knowledge base / RAG | ✅ upload, crawl; KG + Text-to-SQL (Studio) | ❌ via code | ◐ embeddings API | ❌ via code | ❌ via code | ❌ | ❌ | ◐ ≤10 context files per agent | ❌ | ❌ | ❌ | Per-agent KB with a source list, re-index, and the chunks used shown in test chat |
| Guardrails / responsible AI | ✅ PII, injection, Hallucination Manager | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ◐ tool permissions | ❌ | ❌ | ❌ | Guardrail toggles per agent + approval gates on outbound actions |
| Multi-agent orchestration | ✅ manager + workers; SuperFlow (Studio) | ❌ | ❌ | ❌ | ◐ AI SDK agents (code) | ❌ | ❌ | ❌ single agents (as documented) | ◐ SDK subagents (code) | ◐ SDK (code) | ◐ Agent SDK (code) | Show an orchestration map (manager → workers → tools); use a graph editor only for deterministic flows |
| Agent framework choice | ◐ Lyzr or GitAgent (beta) | ◐ "General" any stack | ❌ | ❌ | ◐ AI SDK only | ❌ | ❌ | ❌ | ✅ any (as code) | ✅ any (as code) | ✅ any (as code) | Framework per agent: Lyzr, LangGraph, CrewAI, OpenAI SDK, ADK, Mastra, all with the same card, tests and deploy |
| Agent test, evals, traces | ◐ Live App; sim/eval/traces in Studio | ◐ automation test pane | ❌ | ❌ | ❌ | ❌ | ❌ | ? | ❌ | ❌ | ❌ | Playground with a trace per turn, saved test cases, and an eval gate before publish |
| Agent channels & triggers | ◐ in-app chat/voice; triggers in Studio | ◐ Slack/Telegram bots (beta); Routines | ◐ Telegram/WhatsApp/Slack; app as MCP | ◐ OpenClaw (separate flow) | ◐ Vercel Connect / Chat SDK (code) | ❌ | ❌ | ✅ WhatsApp/Telegram/LINE | ◐ Automations (coding agents) | ◐ Slack/Linear (coding) | ◐ Slack, Routines (coding) | One "Publish agent" panel covering web widget, Slack, WhatsApp, API, MCP and A2A |

### 2.9 Integrations, MCP & secrets

| Feature | Arch (current) | Replit | Lovable | Emergent | v0 | Rocket | Bolt | Base44 | Cursor | Codex | Claude Code | Architect 2.0 should… |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Connector catalog (OAuth) | ✅ 26 built-ins; custom tools in Studio | ✅ 450+; custom API (beta) | ✅ 100+; per-end-user OAuth | ✅ 100+ playbooks | ◐ Marketplace + Vercel Connect | ✅ 25+; Postman/OpenAPI wizard | ◐ Stripe, Netlify, Supabase | ✅ hundreds | ◐ plugins | ◐ 90+ plugins | ◐ connectors, plugins | Show "used by agent X" and scopes; a missing connection blocks the build with a Fix button, never silent sample data |
| MCP client | ✅ account-scoped, `@mcp:` | ✅ curated + custom | ✅ chat connectors | ✅ Select MCP Tools | ✅ presets + custom, approvals | ❌ | ✅ | ? | ✅ incl. MCP Apps | ✅ | ✅ + tool search | Separate "MCP for building" from "MCP for the app's agents" |
| Builder exposed as API / MCP / CLI | ❌ placeholder API page | ✅ native MCP server | ✅ MCP (40+ tools) + REST | ✅ MCP (8 tools) | ✅ API v2 GA + MCP | ❌ | ❌ none documented (09) | ◐ CLI, API keys | ✅ SDK + CLI | ✅ SDK, app-server | ✅ Agent SDK, CLI | Ship a public API + MCP + CLI to create, prompt, preview and deploy |
| Secrets & per-env variables | ◐ one encrypted list | ◐ prod secrets set separately (a pain point) | ✅ Cloud secrets + build secrets | ◐ keys pasted in chat → .env | ✅ Dev/Preview/Prod scoped | ✅ Staging/Production tabs | ✅ Secrets tab | ? | ◐ cloud-agent secrets | ✅ decrypted only for tasks | ✅ proxy-held credentials | Vault with per-env values; the agent asks for keys through a secure field, never in chat |
| Payments | ❌ not documented | ✅ Stripe, RevenueCat, Whop | ✅ Stripe/Paddle test + live | ✅ Stripe/Razorpay | ✅ Stripe sandbox, Shopify | ✅ Stripe, Razorpay | ✅ Stripe | ✅ Stripe one-click | ❌ plugins | ❌ | ❌ | Stripe test → live with a go-live checklist; agent "charge" tools gated by approval |

### 2.10 GitHub & versioning

| Feature | Arch (current) | Replit | Lovable | Emergent | v0 | Rocket | Bolt | Base44 | Cursor | Codex | Claude Code | Architect 2.0 should… |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| GitHub connect & push | ✅ auto-commit on every change | ✅ Git pane; GitHub/GitLab/Bitbucket | ✅ GitHub/GitLab/Bitbucket | ✅ manual "Save to GitHub" (Standard+) | ✅ repo is source of truth | ✅ auto-created repo | ✅ + org GitHub app | ✅ | ✅ + Origin forge | ✅ | ✅ | Allow connecting at any time; one meaningful commit per accepted change, not per keystroke |
| Two-way sync | ◐ Pull/Push; existing branches only | ◐ manual pull/push | ✅ two-way, one branch | ◐ manual | ✅ pull from base | ◐ Next.js TS only | ◐ sync (2-way ?) | ✅ Builder+, `main` only | ✅ native git | ✅ native | ✅ native | Continuous 2-way sync with a conflict view; local commits appear in the chat timeline |
| Branches, PRs, CI | ◐ switch branches; no PR | ◐ branch dropdown; no CI | ◐ branch picker; Drafts | ❌ | ✅ branch per chat, PR, Fix CI | ◐ auto-PR from `rocket-update` | ? | ✅ branches, PRs, protected main | ✅ worktrees, PR review | ✅ PRs, `@codex` | ✅ PR, CI bar, Auto-fix/merge | A Draft is a branch + preview URL; Publish is a PR merge that respects protection and CI |
| Version history & restore | ❌ git commits only | ✅ checkpoints incl. DB + memory | ✅ History; code only | ◐ per-message rollback | ✅ linear versions | ◐ destructive rollback | ✅ clock-icon history | ✅ revert + data backup | ✅ checkpoints (files) | ◐ git revert, fork | ✅ `/rewind` code and/or chat | Timeline of checkpoints (code + schema + agent config); non-destructive restore that lists what it will affect |

### 2.11 Import

| Feature | Arch (current) | Replit | Lovable | Emergent | v0 | Rocket | Bolt | Base44 | Cursor | Codex | Claude Code | Architect 2.0 should… |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Import GitHub repo | ◐ Next.js only | ✅ any; guided for private | ❌ not supported | ◐ "Pull from GitHub" (stack fit ?) | ✅ any, monorepo root | ◐ Next.js TS, public | ✅ URL or your repos | ✅ (Aug 2026) | ✅ native | ✅ native | ✅ native | Accept any repo and produce an analysis report (stack, agents found, env vars needed) before the first edit |
| Figma & design-system import | ◐ themes from Figma (beta), PDF, repo, CSS | ✅ Figma → app; DESIGN.md | ✅ plugin, .fig, MCP; design systems | ◐ colours/spacing only | ✅ Figma frames (paid); DS 2.0 | ✅ first-class (rate limits) | ✅ Figma, Stitch | ✅ Figma ≤300 MB | ◐ via MCP | ◐ via MCP | ◐ via MCP | Keep theme import; add Figma → screens |
| Screenshot / URL clone | ◐ screenshots for fixes only | ✅ URL, screenshot | ✅ screenshot; `html=` URL | ✅ screenshots | ✅ screenshot; agent visits URL | ✅ Build from URL, Redesign | ◐ attach images | ✅ refine existing URL | ◐ as context | ◐ as context | ◐ as context | Put a "Start from a URL or screenshot" chip on the home screen |
| ZIP / competitor / agent-code import | ❌ | ✅ ZIP; Lovable/Bolt/Base44/Vercel via GitHub | ◐ ZIP as context only | ❌ | ✅ ZIP/.tgz | ❌ | ✅ Import from Lovable | ❌ ZIP *export* only; no ZIP or competitor import documented (09) | ✅ local folder | ✅ local folder | ✅ `--cloud` bundles local repo | Support ZIP and one-click "from Lovable/Bolt/Replit/v0"; import LangGraph/CrewAI code as Agent Cards |

### 2.12 Deploy, domains & environments

| Feature | Arch (current) | Replit | Lovable | Emergent | v0 | Rocket | Bolt | Base44 | Cursor | Codex | Claude Code | Architect 2.0 should… |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| One-click publish & hosting | ✅ Deploy → Re-deploy; Marketplace toggle | ✅ Autoscale/Static/VM/Scheduled | ✅ `lovable.app` CDN | ✅ health check; 50 credits/mo/app | ✅ Vercel, via PR merge | ✅ Vercel-hosted | ✅ `bolt.host` | ✅ Web + Mobile tabs | ◐ Vercel (Start from scratch) | ❌ plugins only | ❌ Artifacts = static page | Show the pre-publish checks (tests, scan, missing secrets) above the Publish button |
| Custom domain (connect + buy) | ◐ field only; no DNS steps | ✅ connect + buy | ✅ buy; Entri auto-connect | ✅ link + buy (IONOS) | ✅ buy in chat | ✅ auto-DNS + buy | ✅ buy/connect, DNS | ✅ free domain for 1 yr | ◐ in Vercel | ❌ | ❌ | Buy or connect a domain with live DNS status |
| Preview / staging / production | ❌ single deploy | ✅ dev/prod DBs | ◐ no staging; Drafts | ✅ preview/prod DBs | ✅ preview per branch | ✅ Staging + Production | ? | ◐ branches as copies | ◐ Rollouts monitor | ❌ | ❌ | Draft → Staging → Production (a preview URL per draft) with a Promote button and separate data |
| Access control on published app | ❌ public (Ent governance) | ✅ public/password/workspace/invite | ✅ public/workspace/custom (Business+) | ? | ✅ team or password | ? (task visibility only) | ✅ public/private | ✅ public/invite/restricted | ❌ | ❌ | ❌ | Visibility options include "Internal (SSO)" and password links |

### 2.13 Monitoring, logs & analytics

| Feature | Arch (current) | Replit | Lovable | Emergent | v0 | Rocket | Bolt | Base44 | Cursor | Codex | Claude Code | Architect 2.0 should… |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| App analytics | ◐ toggle; dashboard "Soon" | ✅ Project Analytics | ✅ visitors, live counter | ◐ claimed (unverified) | ◐ via Vercel | ✅ + Core Web Vitals | ✅ visitors, pages | ✅ | ❌ | ❌ | ❌ | Show app and agent analytics together: visits, agent runs, success rate, cost per run |
| Runtime logs | ❌ not in builder (Studio/Ent only) | ✅ Logs, Monitoring | ✅ searchable Cloud logs | ❌ | ✅ server + build logs | ❌ build logs only | ◐ DB logs | ✅ shareable filtered logs | ◐ Rollouts + Datadog | ❌ | ❌ | Logs and agent traces in one pane, with "Send to chat to fix" |
| Deploy progress transparency | ◐ success dialog only | ✅ status + Logs tab | ? | ❌ "black box" (Emergent's own word) | ✅ live build, logs, Fix | ◐ Publish/Update states | ◐ status, last published | ? | ◐ via Vercel | ❌ | ❌ | Step list (build → migrate → secrets → health → live) with a fix action on each step |

### 2.14 Collaboration & sharing

| Feature | Arch (current) | Replit | Lovable | Emergent | v0 | Rocket | Bolt | Base44 | Cursor | Codex | Claude Code | Architect 2.0 should… |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Invite with roles | ◐ email share; one access level | ✅ invite; viewer seats | ✅ Owner/Admin/Editor/Viewer | ◐ RBAC (Business tier) | ✅ Can View / Can Edit | ✅ Owner/Editor/Viewer + credit caps | ✅ Viewer/Editor/Co-owner | ✅ groups; publish approvals | ✅ shared runs, team rules | ◐ workspaces | ✅ Private/Team sessions | Roles (Owner, Editor, Reviewer, Viewer) with per-member credit caps |
| Real-time presence & comments | ❌ | ✅ multiplayer; shared Kanban | ✅ presence, element comments | ◐ co-editing (Business) | ❌ view & duplicate | ❌ | ✅ multiplayer | ✅ canvas cursors, comments | ❌ | ❌ | ◐ artifact comments | Presence plus pinned comments that can be "sent to agent" |
| Remix / fork / marketplace | ◐ Marketplace; Clone & Modify "forthcoming" | ✅ Gallery remix | ✅ Remix; Launched | ❌ no remix gallery (unverified) | ✅ fork templates | ✅ Remix link | ◐ templates | ◐ Clone App | ❌ | ❌ | ❌ | Ship Clone & Modify: copy agents and schema, strip secrets |

### 2.15 Quality & safety (testing, security scan, rollback)

| Feature | Arch (current) | Replit | Lovable | Emergent | v0 | Rocket | Bolt | Base44 | Cursor | Codex | Claude Code | Architect 2.0 should… |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Automated browser testing | ✅ Testing agent (Test toggle) | ✅ App Testing + video replay | ✅ browser + Vitest + Deno | ✅ testing sub-agents | ✅ browser self-test | ❌ | ❌ | ✅ Testing Agent | ✅ cloud video demos | ✅ browser verify | ✅ auto-verify | Produce a test report per build (pass/fail, screenshots) plus saved agent test cases |
| Security scan | ❌ | ✅ L1–L3 incl. pen test | ✅ Quick/Deep; block publish | ❌ | ◐ pre-exec, no report | ◐ manual audit prompt | ✅ on publish + audit | ✅ Security Scan | ✅ Security Review | ✅ Codex Security | ✅ `/security-review` | Run a pre-publish scan of auth rules, secrets, dependencies and the agents' prompt-injection surface |
| PR / code review agent | ❌ | ❌ | ◐ scheduled code reviews | ❌ | ◐ Vercel Agent (beta) | ❌ | ❌ | ◐ background Verification | ✅ Bugbot | ✅ `@codex review` | ✅ Code Review | Run a review agent on every Draft → Publish |
| Auto error fix | ✅ self-correct + "Help me fix it" | ✅ auto-fix + retest | ✅ Try to fix (10 free/day) | ◐ works, but loops are billed | ✅ free when v0 caused it | ✅ free "Fix it" + Advisor | ✅ autonomous debugging | ✅ one-click fixes | ✅ Debug Mode, Autofix | ✅ fix CI | ✅ Auto-fix PRs | Make platform-caused fixes free; after 2 failures, switch to a root-cause plan |

### 2.16 Pricing & usage transparency

| Feature | Arch (current) | Replit | Lovable | Emergent | v0 | Rocket | Bolt | Base44 | Cursor | Codex | Claude Code | Architect 2.0 should… |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Pre-run estimate & live meter | ❌ no estimate; breakdown after | ◐ cost per checkpoint, after | ✅ live timer + credits; check-ins | ◐ budget counter, no estimate | ◐ Work details after; model prices | ❌ | ◐ token-usage graph | ◐ credits per branch | ◐ context ring; $ graph removed | ◐ `/status`, `/usage` | ◐ usage ring | Give a range estimate before Build, a live meter during it, and a receipt after |
| Spend caps / budgets | ❌ | ✅ per-run budgets; Ent limits | ✅ check-ins + member limits | ✅ per-task budget pause | ? (shared pool only) | ✅ per-Editor caps | ? | ? | ✅ spend limits, alerts | ◐ `/goal` token budgets | ◐ large-workflow warning | Per-task cap with pause-and-ask; per-member monthly caps |
| Usage dashboard | ✅ per app + per build phase | ✅ filters, CSV | ✅ by project/person | ◐ Enterprise only | ✅ per event, FREE tags, CSV | ◐ Settings → Subscription | ✅ team token table | ? | ✅ usage + spending | ✅ `/usage` | ✅ analytics | Split build and runtime spend, per app and per agent |

### 2.17 Mobile

| Feature | Arch (current) | Replit | Lovable | Emergent | v0 | Rocket | Bolt | Base44 | Cursor | Codex | Claude Code | Architect 2.0 should… |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Native mobile app output | ❌ | ✅ Expo → TestFlight guided | ❌ web only | ✅ Expo agent (paid) | ❌ | ✅ Flutter; APK | ✅ Expo; EAS CLI | ◐ web-view wrapper | ❌ | ❌ | ❌ | Ship responsive web/PWA first; add an Expo target later |
| On-device preview (QR) | ❌ | ✅ QR + Expo Go | ❌ | ✅ Expo Go QR | ❌ | ◐ device frames, no QR | ✅ Expo Go QR | ◐ store preview | ❌ | ❌ | ❌ | A QR code opens the preview on a phone |
| Builder mobile app | ❌ | ✅ + Live Activities | ✅ iOS/Android | ✅ iOS | ✅ iOS | ◐ thin iOS app | ? | ◐ mobile queuing; Superagents tab | ✅ iOS, remote control | ✅ ChatGPT mobile | ✅ mobile + Remote Control | Responsive web, plus a push notification when a build finishes or needs approval |

### 2.18 Scoreboard (count of the 71 rows above)

| | Arch (current) | Replit | Lovable | Emergent | v0 | Rocket | Bolt | Base44 | Cursor | Codex | Claude Code |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ✅ full | **18** | **55** | 47 | 27 | 48 | 24 | 35 | 41 | 33 | 30 | 33 |
| ◐ partial | 25 | 10 | 11 | 26 | 11 | 23 | 12 | 16 | 18 | 14 | 13 |
| ❌ absent | **28** | 5 | 12 | 16 | 10 | 22 | 13 | 4 | 20 | 27 | 25 |
| ? unknown | 0 | 1 | 1 | 2 | 2 | 2 | 11 | 10 | 0 | 0 | 0 |
| ✅ in **AI & agents** (8 rows) | **5** | 1 | 1 | 1 | 1 | 0 | 0 | 3 | 1 | 1 | 1 |

*The counts are unweighted: every row counts once, whatever its importance. Bolt and Base44 are undercounted because the shorter source report left many cells at "?".*

### 2.19 What the matrix tells us

- **Architect is last on breadth but first on agents.** It has the fewest ✅ (18 of 71; Replit 55, v0 48, Lovable 47) but leads **AI & agents with 5 of 8 ✅**; Base44 has 3 and every other product has 1 or 0. Its ❌s cluster in exactly the developer-facing areas: **Code 0/4, Preview & visual editing 0/4, UI-getting-built 0/3, Monitoring 0/3**, plus no version history. So 2.0 is not "add agents to a builder". It is **"wrap a builder-grade and IDE-grade workspace around the agent platform Architect already has."**
- **Architect misses several table-stakes features. These are parity work, not differentiation, and must be in v1.** Each row below is ✅ at 8 or more of the 10 competitors while Architect is ◐ or ❌:
  - **live progress feed** (10/10; Architect has the "20-minute black box");
  - **point-to-prompt on the preview** (9/10);
  - **diff review** (8/10);
  - **model/effort picker** (8/10);
  - **steer/queue mid-run** (8/10);
  - **roles on invite** (8/10);
  - **project rules/memory** (8/10);
  - **export/local IDE** (8/10).
- **The backend line splits the market cleanly, and nobody spans it.** Cursor, Codex and Claude Code have **0 ✅ across Backend, Monitoring and Deploy**; Cursor's only deploy path is a ◐ via Vercel. The builders have **0 ✅ on PR review agents** (all 3 ✅ are dev tools), and only Replit ✅ runs parallel agents. Replit comes closest to covering both halves (55 ✅), but it has **1 of 8 on agents**. The "both audiences, full lifecycle, agent-first" square is empty.
- **The agent lifecycle is a desert, and that is the biggest opening.** Guardrails, KB/RAG and multi-agent orchestration: **0 of 10 competitors ✅**. Agent test/evals/traces: **0 of 10** (Architect is only ◐, via Studio). Framework choice exists only in the dev tools, and only as raw code. The Agent section is 2.0's most defensible differentiator: one Agent Card, any framework, and a test → eval → trace → publish-to-channels flow. The agent-builder report shows the UX pattern has already converged (form + chat card with staged Apply/Discard drafts), so this is design execution, not invention.
- **Trust and cost transparency are unsolved everywhere, so they are cheap to win.** Only **1 of 10** products earns a ✅ on cost visibility (Lovable's live timer, credits-used meter and check-ins). The rest show cost after the fact or only as token or usage rings, and **none estimates cost before a run**. Deploy progress is transparent in **2 of 10**; staging/production separation exists in **4 of 10**; "prompt before sign-up" is verified in **0**. These map one-to-one onto Architect's documented pain points: opaque cost, the black-box build, silent sample data, no rollback and an auth wall on the home page. Design each explicitly:
  - **estimate → live meter → receipt** for cost;
  - a **step-list deploy** with a fix action per step;
  - **blocking "missing connection" cards**, never silent sample data;
  - a **non-destructive checkpoint timeline** covering code, DB schema and agent config.

---

## 3. UI/UX pattern library

> **Scope and evidence.** This section distils the recurring layout conventions across all 10 platform reports: Architect, Replit, Lovable, Emergent, v0, Rocket, Cursor/Windsurf (Devin Desktop)/Kiro/Zed/Copilot/Antigravity, Codex/Claude Code, Bolt/Base44/AI Studio/Anything/Leap/Dyad, and the agent builders. Positions come from docs, changelogs and tutorials. The researchers did not log into most builders, so any position a source only implied is marked **(inferred)** and any claim a source could not confirm is marked **(unverified)**. Nothing here says to copy a UI. Each pattern is written as the *problem it solves*, so Architect 2.0 can solve the same problem its own way.

### 3.0 Conventions at a glance

| Convention | Who does it | Exceptions / variants | Verdict for Architect 2.0 |
|---|---|---|---|
| **Chat left, preview right** | Lovable, Bolt, Base44, AI Studio, v0, Emergent, Dyad, Architect build view; Replit and Rocket **(inferred)** | Anything puts the preview in the centre with chat in a left sidebar. Cursor Agents Window, Claude Code desktop and Codex put chat in the **centre** with a tabbed or draggable **right pane grid** | This is the category default and users expect it. The differentiator is what the right side holds, not where chat goes |
| **Composer at the bottom of chat**: `+` bottom-left, Send bottom-right, mode control inside | Lovable (mode picker next to Send), Replit (Plan toggle bottom-right), Bolt (`+` bottom-left, Plan bottom-right), Rocket (`+` bottom-left, lock next to Send), Architect (Plan toggle bottom-left) | Claude Code puts **environment left of the prompt** and **model, permissions and usage ring by Send**. Claude web puts **repo/branch below** the input | Converged. Keep it, and make it the single "run settings" cockpit |
| **Primary Publish/Deploy is the rightmost top-bar action** | Lovable, Replit, v0 (chat header), Emergent, Rocket ("Launch"), AI Studio, Anything, Architect, Copilot Studio; Bolt **(unverified)** | Cursor/Claude/Codex have no hosting. There, "commit and push" or **Create PR** takes that slot | Non-negotiable muscle memory. The design question is **what sits next to it** |
| **Tabs over the right pane** | Lovable `Preview · Files · Code · More▾`; v0 `Preview / Code / Design`; Base44 `Preview · Dashboard · Edit · Canvas · Publish`; Architect `Plan · Agents · App · Database · Artifacts`; Leap `Code · Preview · Architecture · Infrastructure · APIs`; Bolt `<>` toggle top-centre | Claude Code: panes (Diff, Browser, Terminal, File editor, Plan, Tasks, Subagent) opened from **Views** and dragged into a grid | Architect's **layer-per-tab** (Agents and Data as peers of the App) is its DNA. Keep it |
| **One home for "the backend"** | Replit **Tools pane → "Replit Cloud"** (Publishing, Domains, Monitoring, Growth, Database, Users & Auth, Security, Storage); Lovable **More → Cloud** (10 tabs); Bolt **database icon**; Base44 in-editor **Dashboard**; Architect **Database tab** | Rocket scatters it behind `…` (Connectors, APIs, Analytics, Performance, Remix) | Needed. But **not under "More"**: see anti-pattern A3 below |
| **Command palette (Cmd+K)** | Lovable, v0, Base44, Replit ("All tools") | — | A cheap power-user layer that non-technical users never see |
| **Hide chat / full-screen preview** | Lovable (Cmd/Ctrl+B), Rocket (Full screen "hides the chat panel"), Cursor (floating prompt bar) | — | Needed for demos and for reviewing a design |

**Cross-cutting anti-patterns (referenced below):**
- **A1:** naming churn. Replit renamed its modes about 5 times in 12 months. Lovable renamed Agent to Build and Chat to Plan, then added a new Chat. Emergent's E-1 to E-3 needed YouTube explainers.
- **A2:** cost shown only after the fact. Replit shows it on hover per checkpoint. Emergent: "No console that tells you this prompt will cost 18 credits".
- **A3:** critical tools buried. Lovable puts 10+ tools under **More**. Rocket's `…` and its hover-to-reveal sidebar hide things. v0's full stack is so hidden that reviewers still call it "frontend-only".
- **A4:** silent degradation. Architect apps run on sample data with no warning, and its plans drop scope quietly. Claude Code's `AskUserQuestion` auto-continues after 60 s.
- **A5:** unstable chrome. Cursor's Keep/Undo controls "moving between versions". Claude desktop does not persist layouts and archives aggressively.

---

### 3.1 Landing and authentication

| Platform | What a logged-out visitor sees | Auth options | Post-signup onboarding |
|---|---|---|---|
| **Architect** | Home page **is a sign-in card** ("Sign in to start building with Architect." → black pill **Continue with Google** / OR / **Continue with Email**). Persona pages (`/for/…`) and /enterprise show a **prompt box first** | Google, Email; a Lyzr Studio account is auto-created | Optional **AI Consultant** ("What should I build?"): About you → Role → Time-sinks → Tools → Goals → 3 idea cards with "hours saved/week" → **Build This** |
| **Lovable** | You can **type a prompt before signing in**. `lovable.dev/#prompt=…` pre-fills it (never auto-submits). Remix previews and templates are viewable without an account; sign-up is asked for **only at the moment of remix** (Sep 11, 2026) | Email/password, Google, GitHub, Apple, SAML/OIDC | Free workspace auto-created; onboarding questions **(unverified)** |
| **Replit** | "What will you build?" with artifact chips; "**Your first prompt is free**" | Google, GitHub, X, email, SSO (Apple **unverified**) | Name; personal / school / work (third-party, **unverified** for 2026) |
| **v0** | "Sign in to v0 using your Vercel account" | Email, Google, GitHub, **ChatGPT**, SAML; Apple on iOS | None found **(unverified)**; lands on a centred prompt |
| **Emergent** | Hero prompt; reportedly login before prompting (Banani) vs "build straight from the homepage prompt" (Hack'celeration). Both likely hold **(inferred)** | Google, GitHub, email, Facebook, phone | Survey: "which other vibe-coding tools do you use" |
| **Rocket** | Task input + Solve / Build / Intelligence cards | Google, SSO, **email + 6-digit OTP (no password)** | None; straight to Home with 20 credits |
| **Claude Code (web)** | claude.ai/code | **Sign in with GitHub**. Then optionally install the GitHub App, **Skip** allowed. A **Default** cloud environment is auto-created | Team users get a single "Create your first cloud environment" form with **Create & finish** |
| **Cursor / Codex** | Desktop download | Browser sign-in / ChatGPT account or API key | Cursor **Import VS Code settings**; Codex "add a local folder" with recent repos listed |
| **AI Studio** | Google account; Build in the left nav | Google | None; free, with a Starter hosting tier that needs **no billing account** |

**What the leaders do**
- **Deferred auth.** Lovable, Replit ("first prompt is free") and Architect's persona pages let the *prompt* be the first interaction. The auth wall moves to the moment value is about to be created.
- **Passwordless and developer-native providers.** Rocket uses OTP. Claude web and v0 use GitHub. v0 accepts ChatGPT sign-in.
- **Skippable integrations at signup.** Claude web's GitHub App step has **Skip**, and a default environment is created without asking.
- **Idea generation for users with no prompt.** Architect's AI Consultant is unique in the set.

**Anti-patterns**
- **An inconsistent funnel.** Architect's main home is a sign-in wall while its persona pages open on a composer (01 §6.2).
- **Forcing a second vendor account.** v0 requires a Vercel account; Cursor's "Start from scratch" needs a Vercel account to publish.
- **Silent privacy defaults.** Rocket's free Build tasks are always public and may be used for training.
- **Irreversible choices at creation.** Copilot Studio's harness choice cannot be transferred later. Rocket's web or mobile framework "cannot be changed after task creation".

---

### 3.2 Homepage and dashboard: prompt-first vs project-list-first

| Model | Platforms | Above the fold | Where projects live |
|---|---|---|---|
| **Prompt-first + project grid in the same view** | **Lovable** (prompt, then project cards with live thumbnails; hover shows star / remix / share / move / settings); **Replit** ("recent projects, Workspace navigation, and the Chat prompt into one view") | Composer + suggestions | Directly below or beside the prompt |
| **Prompt-first, projects in the sidebar** | **v0** (centred input since Feb 2026; sidebar chats **grouped by project** with streaming / waiting / ready badges and hover cards); **Bolt**; **AI Studio**; **Base44**; **Emergent** (Home tab lists tasks and **deployed apps**) | Composer + chips / gallery | Sidebar or a separate page |
| **Prompt-first with pillars** | **Rocket** (one task input shared by Solve, Build and Intelligence cards, then category tabs) | Composer + 3 cards | Sidebar "Recent Tasks" (auto-hides; revealed on edge hover) |
| **Prompt + heavy learning sidebar** | **Architect**: 17 sidebar items, **10 of them learning content**, "3 views of projects and 4 places to find ideas", and "projects open in a modal" [3P-hands-on] | Composer with `+` (Attach, Theme, Studio agents, MCP) | My Projects / Shared Projects / Usage |
| **Session/task list first (developer tools)** | **Claude Code** (sessions sidebar with status/project/environment filters, "show me only waiting sessions"); **Codex web** (prompt above a **task list**); **Cursor Agents Window** (left sidebar of *every* agent wherever it runs) | Composer + run list | The list *is* the home |
| **Board first** | **Devin Desktop** (Agent Command Center Kanban: in progress / blocked / ready for review as the opening screen) | Kanban | Cards |

**Composer anatomy (best-of, with positions)**
- **`+` menu, bottom-left.** Contents vary:
  - Lovable: Attach / Design / Connectors / Databases.
  - Replit: Upload / Create / **Import a project** / Skill or design system / Integration.
  - v0: Upload / **Import from…** (GitHub, Figma, Paper) / MCPs / New Instruction.
  - Rocket: files / **Add from Figma** / **Clone from GitHub**.
  - Architect: Attach / Select theme / Add Studio agents / Add MCP server.
- **Mode picker next to Send.** Lovable Build / Chat / Plan (Opt/Alt+P). Cursor Agent / Plan / Ask / Debug (Shift+Tab). Replit Free / Power / Max plus a **Plan toggle bottom-right**.
- **Where it runs, left of the prompt.** Claude Code Local / Cloud / SSH / WSL. Cursor Local / Worktree / Cloud / SSH.
- **Cost and context gauges beside Send.** Claude **usage ring**, Cursor **context ring** with a breakdown tray, v0 **model picker with prices shown**.
- **Prompt upgrades.** v0 **Enhance prompt**; Bolt Enhance prompt that **asks questions first**; Architect **Prompt Library** cards that paste an editable "blueprint".
- **Entry chips as peers of the prompt.** Bolt (GitHub icon, Figma, Stitch, templates), Replit artifact chips (Website, Mobile, Design, Slides…), Emergent build type (Full Stack / Mobile / Landing), AI Studio **I'm Feeling Lucky**.
- **Inline references.** `@` for files, connectors and projects (Lovable, Rocket, Cursor, Claude). `/` for skills and commands (Lovable, v0, Rocket's 100+ screen-aware commands).

**Anti-patterns**
- **Choosing by version number.** Emergent's E-1 / E-1.1 / E-1.5 / E-2 / E-3 agent dropdown sits on the home composer (A1).
- **Kanban as everyone's landing screen.** Critics called Devin's choice "bold" when daily work is "90% editing".
- **Projects and threads with "nearly the same visual weight"** (Codex issue #29161).
- **Idea and learning sprawl.** Architect: 4 places for ideas. Lovable: 3 kinds of templates (community, design templates, design systems).
- **Advanced controls that hide cost.** Emergent's per-task budget lives inside **Advanced Controls** on the home screen.

---

### 3.3 Builder workspace

| Platform | Chat | Right-pane tabs | Top bar, left | Top bar, right (in order where known) | GitHub lives… | Backend lives… |
|---|---|---|---|---|---|---|
| **Lovable** | Left; composer at its bottom | **Preview** (home) · Files · Code · **More▾** (Analytics, Cloud, AI, Agent integrations, Payments, Connectors, Security, SEO, Sensitive data, Settings) | ☰ · **ProjectName▾** (draft switcher) · **History** · hide chat | Preview toolbar · Comments · presence avatars · **Share** · **Publish** (rightmost; collapses to an icon on narrow screens) | Workspace/Project **Settings → Git** | More → Cloud |
| **v0** | Left; approvals tray **at the top of the composer** | **Preview / Code / Design** + Console panel | Chat/project title | **Branch menu (Git status, PR, CI) next to Publish** · **Invite** · Project menu `…` (order **inferred**) | Header branch menu; Settings → GitHub | Project menu → Settings → Integrations; **Integration Wizard in chat** |
| **Replit** | One side (left **inferred**) + pinnable **task sidebar** (Main / Board / New task) | Preview with URL bar; pinned **Tools pane**; dev dock (Shell, Console, Git, Secrets, Workflows, Files) via Cmd+K | Project name + **+** (new task) · **Design \| Build** toggle | **Invite** · **Publish** (upper right) | Tools → Git | Tools pane "Replit Cloud" |
| **Architect** | Left; composer has `+`, **Plan** toggle bottom-left, **Test** toggle | **Plan · Agents · App (Live App) · Database · Artifacts** | App name + pencil (rename) | **GitHub icon** (Pull / Push / branch switcher) · **Deploy → Re-deploy** · **⋮** (Environment variables) | Top-right icon | Database tab; integrations "section" placement **(unverified)** |
| **Bolt** | Left | Workbench; **`<>` Code/Preview toggle top-centre** | **Clock icon** (history) · title (recent projects) | cog (settings) · **database icon** · **Publish** (top-right **unverified**) | Settings | Database icon: Tables, Auth, Storage, Functions, Secrets, Users, Logs, Security Audit |
| **Base44** | Left (width adapts to the preview) | **Preview · Dashboard · Edit · Canvas · Publish**; device menu; **More actions `…`** (Act as a user, Export ZIP, GitHub) | — | — | Dashboard → GitHub icon | Dashboard: Overview, Users, Data, **Agents**, Code, Logs, API, Settings |
| **Emergent** | Main/left; **budget indicator under the input**; `(+)` at the top of chat raises the budget | Live preview (right); Code opens a **separate browser VS Code** | — | **Deploy** (top right) | Chat-area **Save to GitHub** / Pull from GitHub; Profile → Connect GitHub | No DB browser (gap) |
| **Rocket** | Left **(inferred)** | Preview toolbar; Code: Explorer · editor · Logs (bottom) | **Task name▾** (Settings, Star, Add to Project) | Preview toolbar ending in **Launch** (top-right) | Code view top-right GitHub icon; `…` → Connectors; Settings | `…` → Connectors (Supabase) |
| **Anything** | Left sidebar (New chat, Version history, Settings) + chat | Preview **centre**; device frame + QR for mobile | — | Preview/Code · Responsive · Refresh · **Element selector** · Rename · External preview · **Invite** · **Publish**; bottom bar **Logs · Restart sandbox** | — | Project settings |
| **Leap** | Chat | **Code · Preview · Architecture · Infrastructure · Service Catalog/APIs** | — | **Deploy** (position **unverified**) | — | Infrastructure tab |
| **Cursor Agents Window** | **Centre** | Right tabs: Files · per-agent Terminal · Browser · **Review** · Canvases · Source control/PR | Workspace/repo pane | **Branch · commit-and-push (with create-branch arrow)** · switch to Editor | Top right | — (no backend) |
| **Claude Code desktop** | **Centre**; environment dropdown left of the prompt | **Draggable pane grid**: Diff, Browser, Terminal, File editor, Plan, Tasks, Subagent (Views menu) | Session title (click to rename) | **Diff chip `+12 −1`** → diff viewer; server dropdown; **CI status bar**; **Continue in** (bottom-right) | Diff view **Create PR** | — |

**Patterns worth keeping (problem → solution)**
1. **"What's next to Publish" decides the audience.**
   - v0 puts a **branch/status menu beside Publish**. It exposes the preview URL, diff, PR, CI and **Fix CI / Fix Conflicts** for developers, while "Publish" alone hides PR → merge → deploy for everyone else. This is the cleanest progressive disclosure in the set.
   - Lovable puts **Share + Publish** there, a collaboration-first reading.
   - Architect puts **GitHub + Deploy + ⋮** there.
2. **Non-UI layers as first-class tabs.** Architect (Agents, Database, Artifacts) and Leap (Architecture, Infrastructure, APIs) make the invisible parts of an agentic app legible. Base44's in-editor **Dashboard** does the same for data, users, agents and logs.
3. **Project-name dropdown as the branch/draft switcher.** Lovable's name▾ opens Drafts ("New draft" → **Accept**). v0 uses **Duplicate…** for a new chat on a new branch. Git becomes a noun non-developers can use: "draft".
4. **Diff counter as the entry to review.** Claude `+12 −1`, Codex green/red counters. It is always visible and never blocks.
5. **Always-visible Stop and a queue.** Replit's **Stop** sits in the status bar with a **Message Queue** drawer above the input ("Steer now", reorder). Bolt queues up to 20 prompts with drag grips.

**Anti-patterns**
- **A3 burial.** Lovable's More menu holds 10+ tools. Rocket's `…` holds Connectors, APIs, Analytics, Performance and Remix.
- **Code in a separate product.** Emergent's Code opens a new tab with a **temporary password**. Architect's agent editing sends you to **Lyzr Studio** ("Editing an agent sends you to a separate product") [3P-hands-on].
- **Confusing layout switches.** Cursor 2.0's "Agent / Editor" switch drew "Agents, Search Agents, New Agent, Agent, New Agent" complaints.
- **Developer-dense first screens for beginners.** Replit is "an interface designed for developers, not first-time builders" (G2 summary), and its tabs get messy past 8 files. Emergent's dark, log-heavy chat has the same problem.
- **Mixed-audience leakage.** Architect shows "raw app IDs, `manifest.json`, 'temperature'" to non-technical users while giving developers "no workspace" [3P-hands-on].

---

### 3.4 The "UI getting built" experience

#### 3.4a Before code: clarify and plan gates

| Platform | Clarifying-question UI | Plan artifact | Approval CTAs |
|---|---|---|---|
| **Architect** | 3–6 guided questions as **suggestion chips** in the planning chat | **Live PRD in the right panel**: overview, stories, **agent table** (model, tools, role), data, theme, integrations. Tabs: **App Mockup · Workflow Diagram · Skill files · PDF/PPT · Starter files** | Status "**Plan Ready**" → **Start Building**; **Back to Plan Mode**; planning can be skipped |
| **Lovable** | **Question card**: up to 4 options per question, your own answer, **Skip** (defaults). Draft answers persist | **Design guidance**: **3 design directions** as lightweight HTML/Tailwind previews side by side, *or* typography / palette / layout question cards. Refine ≤6 times. **Plan view** document: edit inline or select text → **Comment**; "Viewing version 2 of 3" | **Submit** (design); **Approve** → Build (plan) |
| **Replit** | Agent asks questions; **Smart Connector Picker** inline (Stripe vs Square) | **Plan card**: **What and Why · Done looks like · Out of scope · numbered steps**; banner "task plan is ready for review" → **Review now** | **Revise · Cancel · Build here · Build in background** |
| **Rocket** | **Clarity gate.** The prompt is scored, and a modal appears **only if it falls below threshold**, asking only the gaps (platform, users, screens, references, integrations) | **Guided screen selection**: proposed screens with descriptions, **all selected by default**; deselect the ones you don't want | Generate / "Build my Dashboard"-style button (label **unverified**) |
| **Emergent** | Asked in chat: "Universal LLM Key or your own?", auth?, design?, "**Should I start building or discuss more?**" | E-3: a phase-numbered plan with trade-offs | Approve Phase 0 / skip the POC / adjust scope |
| **v0** | **Inside the prompt form** as single- or multi-select chips with skip and a custom answer | Plan Mode exists only as a **preset "instruction"** (easy to miss) | approve / modify / reject (`exit_plan_mode`) |
| **Cursor** | Interactive questions form | Editable plan doc with **Mermaid** diagrams and to-dos; "Save to workspace" | **Build**; send individual to-dos to parallel agents |
| **Claude Code** | `AskUserQuestion` structured choices | Plan pane; `Ctrl+G` edits | **Yes, and use auto mode · Yes, manually approve edits · No, keep planning** |
| **Kiro** | — | 3 reviewable docs: `requirements.md` (EARS) → `design.md` → `tasks.md`, with gates between them | **Run all Tasks**; "Quick Spec" skips the gates |
| **Bolt / AI Studio** | Bolt: Enhance prompt asks first | Bolt: Plan toggle turns blue. AI Studio: plan checkpoint before provisioning Firebase | **"Implement this plan"** (Bolt); approve provisioning (AI Studio) |

**Best-in-class**
- **Plan as a contract, not a chat message.** Replit's Done-looks-like / Out-of-scope, Kiro's spec files and Architect's PRD + agent table give non-technical users a contract and developers a spec.
- **Design before code.** Lovable's three live directions remove blank-canvas anxiety. Rocket's screen checklist lets users cut scope before spending credits.
- **Ask only what's missing.** Rocket's prompt scoring and Lovable's Skip-with-defaults do this.
- **Approval that also sets autonomy.** Claude's 3-button card does both at once.

**Anti-patterns**
- **Too many questions.** Rocket drew "endless follow-up questions" complaints.
- **A4 silent scope cuts.** Architect: "The plan quietly dropped two of the three" [3P-hands-on].
- **Structured questions in only one mode.** Codex offers them only in Plan mode; GitHub issues #24750, #30150, #12694 ask for more.
- **Auto-continue on questions** (Claude, 60 s, unannounced).
- **Plan mode hidden as a setting.** v0 users asked for Replit-style modes from Sep 2025 to Jan 2026.

#### 3.4b During the build: progress display

| Platform | What streams | Granularity controls | Time / cost visibility | Mid-run control |
|---|---|---|---|---|
| **Architect** | Marketing demo shows a ticking checklist ("Finding the best enterprise-grade blueprint" → … → "Generating production-ready code…") and "AI Planning… 13%→100%". **Real build, per one user: "a 20-minute black box with a carousel and a mini-game"** [3P-hands-on] | — | Estimate "4–6 min"; actual ~20 min; **no cost estimate** | Stop in planning only (v2.0.1) |
| **Lovable** | **Activity cards** (file edit, command, web search, browser test, subagent). Clicking one opens a **Details view in the preview area** with **Timeline** and **Changes** (diff) tabs. The preview hot-reloads | Live-preview toggle (continuous vs on completion) | **More options → "Working for" timer + "Credits used"**; **credit check-in** pauses at 20 credits; when credits run out: **Add credits / Finish up** | Stop (keeps work); follow-ups shown greyed until picked up |
| **Replit** | Progress indicators, **live file changes**, preview updates; **App Testing** shows a live browser with a **visible cursor** | — | First build 3–5 min (down from 15–20). **Cost only after, on hover per checkpoint** (A2) | **Steer vs Queue**; Message Queue drawer; Stop in status bar |
| **v0** | **Tool-status cards**, browser screenshots, citations. While the VM boots, the **empty or previous preview shows with "subtle progress lines"** | — | End-of-run **work details**: time, files, lines, credits | Queued prompts; Cmd+Enter to interrupt; sound and favicon badge on completion |
| **Rocket** | **Per-screen and per-file status (Completed / In Progress / Failed) with Retry**; current filename; "**Watch Rocket Work**" reasoning; screens appear in the preview as generated | — | 1–3 min typical (5–8 reported); no per-message cost | **Stop disabled once generation starts**; "**Notify me / Later**" banner |
| **Emergent** | Checklist lines ("✓ Created project structure ✓ Set up MongoDB database ✓ Building frontend components"); files; self-check screenshots. **E-3 Mission Control**: phase cards | — | 5–15 min; **budget counter climbs under the input** and the agent **pauses and asks** at the cap | E-3: **pause / resume / redirect**; **Wake Up Agent** after sleep |
| **Base44** | A **build checklist** ("Generate schema", "Create routes", "Seed data"); the preview **jumps to newly created pages**; finished tool groups auto-collapse | — | — | In-message runs (new messages join the active run) |
| **Cursor / Claude Code / Codex** | To-do list **pinned above the input** ("/todo (1 of 3)"); live diffs; terminal; spinner line with verb, elapsed time and tokens | **Tool-call density** Compact / Balanced / Detailed (Cursor); **Normal / Thinking / Verbose** (Claude) | Claude usage ring; Cursor context ring | Non-blocking steering; queue; Stop |
| **CrewAI Studio** (agent building) | **"AI Thoughts"** streams on the left while agent/task nodes appear on the canvas | — | — | — |

**Best-in-class**
- **Outcome checklist + expandable detail.** Base44 and Emergent use plain-language steps. Lovable and Claude let you drill into diffs and tool calls. The density toggle (Cursor, Claude) serves both audiences with one stream.
- **Honest meters.** Lovable's live timer + credits and its check-in pause; Emergent's pause-at-cap.
- **Never a blank screen.** v0 shows the last good preview during boot. Lovable's OJ dev server cut median preview load from 17.4 s to 8.0 s. Base44 auto-navigates to new pages.
- **Retry at the unit that failed.** Rocket.
- **"Notify me" for long runs** (Rocket, v0 sound, Replit and Cursor Live Activities).

**Anti-patterns**
- **Black-box waits and optimistic ETAs.** Architect ("4–6 min" → 20), Emergent deploys ("sit back and relax").
- **No Stop** (Rocket).
- **Sleeping agents that block the user.** Rocket after 10–15 min idle; Emergent with waits of up to 15 min reported.
- **Mini-games** instead of information (Architect).

#### 3.4c After the build: proof and checkpoints

| Platform | Completion proof | Checkpoint / version UI | What a restore covers |
|---|---|---|---|
| **Replit** | Summary + checkpoint + cost on hover; App Testing **interactive video replay** in sections, with **take over** at login walls | **History** panel of labelled checkpoints ("Transitioned from Plan to Build mode"), each with **Rollback here** / **Changes**; the confirmation **lists files, Agent memory, tasks and optionally DB** | **Code + AI memory + DB** (best) |
| **Lovable** | Summary, **suggestion chips**, Undo / Revert | **History** toggle (History + Bookmarks; live version badged **Published**); per version: snapshot, open preview, **View code changes**, **Go to message** | Code only, not data; Drafts share the prod DB |
| **v0** | **Screenshots of self-testing** in chat; work-details receipt | Per-message inspect / diff / **restore**. Restore creates a new latest version, so history stays linear; searchable version selector | Code; **manual code edits don't create versions** |
| **Rocket** | — | **Files row** on every response: version number, changed files, **Code diff** (side-by-side), **Rollback** ("Rollback now"), **Create label**, **Launch** | **Destructive**: "discards every version after the one you select … cannot be undone" |
| **Emergent** | E-3 **completion cards**: "what was built, what was tested, and what passed"; delivery card with preview + Deploy | **Rollback** on each step: erase messages + code, or messages only; **Fork** at the context cap (~200K / 1M tokens) | Code / chat; DB **unverified**; fork "loses context, disconnects databases" |
| **Claude Code** | Auto-verify screenshots | `/rewind` (Esc Esc): **Restore code and conversation / conversation / code / Summarize from here** | Files, but **not Bash-made changes** or most subagent edits |
| **Cursor / Windsurf / Zed** | Cloud agents record **videos**; "Find Issues" review | Cursor: click a checkpoint → preview → **Restore Checkpoint**. Windsurf: **revert arrow next to each prompt**. Zed: Restore Checkpoint | Files only |
| **Architect** | App marked ready only after the preview loads; Testing agent (+2–5 min) | **No in-product history, restore or diff** documented; git auto-commits only | — |

**Best-in-class.** Replit's rollback confirmation that *lists what will be reverted*. Windsurf's per-prompt revert arrow (one click, no vocabulary needed). Emergent and v0's evidence cards ("tested 12/12", screenshots).

**Anti-patterns.** Rocket's destructive rollback. Restores that skip the database (Lovable) or shell changes (Claude). v0 leaving manual edits out of versioning. Cursor's cautionary tale: the "agents built a browser" demo where agents "disabled failing tests and the code did not compile" is why "verified" needs artifacts.

---

### 3.5 Preview toolbar

| Platform | Device toggles | URL / route | Refresh / new tab | Select & visual edit | Console / devtools | Extras |
|---|---|---|---|---|---|---|
| **Lovable** | Desktop / Tablet / Mobile | "Find page or enter path" | Refresh (**Shift-click restarts the environment**); open in new tab | **Floating toolbar, 4 modes**: **Select** (Cmd/Ctrl-click for several) → prompt · **Edit text inline** (100 free per day) · **Draw** (shapes auto-cleaned) · **Comment** (pinned team notes). Edits apply **without an LLM** via AST/JSX IDs | Error overlay + chat card | **Live preview toggle**; shared preview links with password and expiry |
| **Replit** | Screen-size presets; mobile **iOS / Android / Web** dropdown + **QR (Expo Go)** | `.replit.dev` URL + path field | New tab | **Edit tool**: click → highlight + **name chip**; **Visual Editor panel on the right** (text, font, colour with eyedropper, image, **3×3 alignment grid**, gap, per-side padding/margin with locks). Deterministic edits **don't consume credits**; complex ones go to the Agent | **Devtools** toggle: Console, Elements, Network, Resources, Settings | Design canvas with **Design \| Build** header toggle |
| **v0** | Responsive size control | Route / page switcher | Refresh, new window | **Design tab**: hover/click select, Cmd+I, **arrow keys between elements**, typography / colour / spacing / border / shadow, **layers**, **measure overlay**, Inspector, floating drag handles. **Pending edits → Apply / Reset / Undo / Before-After**. **Annotations**: numbered pins → one batched prompt | **Console** (logs, requests, terminal); compact error bar with **Fix with v0** | Design Mode is not available on mobile viewports and works only on the latest version |
| **Rocket** | Desktop / Laptop / Tablet / Mobile + **real device frames** (Galaxy S23, iPhone SE … 17 Pro) | URL bar, any route | Refresh; **Full screen** | **Edit▾ → Visual edits**: floating toolbar with an **"Ask me…" AI field**, text, weight, colour, alignment, **spacing panel**, image replace, delete → **Save changes**. **Edit▾ → Theme**: token editor | None documented | **Camera** (screenshot a region, drag into chat); screen dropdown; **Launch** at the end |
| **Emergent** | None documented **(unverified)** | None | Preview link; times out after ~30 min | **Edit mode from the bottom nav**; edits **queue with a running counter** → **Apply** in one agent pass | None (docs say press F12 and paste) | Expo QR |
| **Bolt / Base44 / Anything / Dyad** | Bolt Device Preview QR; Base44 desktop/mobile; Anything **Responsive** + device frame + QR | Dyad address bar | Dyad **Restart**, Refresh, open new window; Anything **Restart sandbox** | Bolt **Select** → chat chip; Visual Edits **free until saved**, batched above the chatbox; **layer picker** for overlaps. Base44 Edit mode (free), element chips, **Canvas** of all pages as live frames with sticky notes → **Send to chat**. Anything **Element selector** | Dyad system drawer + "Fix error with AI"; Anything bottom **Logs** | Base44 **Act as a user** role switcher |
| **Dev tools** | Not documented for Cursor, Claude or Codex **(unverified)** | — | — | Cursor **Design Mode** (⌘⇧D; Shift+drag area; ⌘L → chat; ⌥+click → input; **queue edits while the agent works**); Windsurf **"Send element"** → @-mention; Claude `Cmd+Shift+S`; Codex **Annotation + Adjust** (font/spacing/colour sliders) | **Windsurf: console errors flow into the prompt automatically**; Codex full CDP access | Claude **Persist sessions** (keeps test logins); auto-verify |
| **Architect** | Not documented **(unverified; probably absent)** | Not documented | — | Not documented | Not documented | **Live App** is a real app: sign up as a test user; voice apps show a **Call** button |

**The edit ladder (from cheapest to most powerful)**
1. **Deterministic, free edits** for text, colour, spacing and images (Lovable, Replit, Bolt, Base44). Replit teaches the rule with automatic hand-off.
2. **Batch, then apply** (Emergent's counter, v0's pending bar, Bolt's batch above the chatbox). This means fewer paid round-trips.
3. **Point-and-prompt**: the selected element becomes a chip in the composer (Windsurf, Cursor, Lovable Select, Bolt Select, Rocket "Ask me…").
4. **Annotate/comment for reviewers**: numbered pins (v0), draw (Lovable), sticky notes on a canvas (Base44). This suits non-technical stakeholders.

**Anti-patterns**
- **Previews that sleep or time out** (Emergent 30 min).
- **Auth that doesn't work in preview.** Rocket's social login "only on the deployed URL".
- **Env mismatch.** v0's preview "can only see Development vars".
- **Reliability noise.** Architect's changelog fixed "Connection lost", 401 "invalid sandbox" and port errors.
- **Visual editors that silently cost credits** where others are free (inconsistent rules erode trust).

---

### 3.6 Code view

| Platform | Editor + file tree | Terminal | Diff / review | Notable affordances |
|---|---|---|---|---|
| **Lovable** | Code tab; tree with Expand/Collapse all; reorderable tabs; **right-click → Reference in chat**; Search code (Cmd/Ctrl+Shift+F) | None documented **(unverified)** | History → View code changes | Save (Cmd+S) creates a version; **Free plan is read-only with an Upgrade prompt** |
| **v0** | VS Code-style; explorer (Cmd+B); global find/replace; **split view** | Console terminal; `claude` pre-installed | **Diff view** of v0's changes | Autosave; manual edits don't version |
| **Replit** | Full IDE: tree, Tools dock (Cmd+K) | **Shell** (Linux), Console, **Workflows** (named run configs) | Git pane review | File History (30 days); **SSH from VS Code / Cursor / Windsurf** |
| **Bolt** | `<>` toggle; file list with right-click create/delete | — | — | **Target file**, **Lock file / Lock all**, **"Ask Bolt" on a code selection** |
| **Rocket** | Explorer left; Save / Discard | None | **Code diff** per version | **Logs panel bottom (build output only)**; warns when editing `package.json` / `tailwind.config.js`; Download (Pro, web) |
| **Emergent** | **Separate browser VS Code** via secure link + temporary password | VS Code terminal | None **(unverified)** | Right-click folder → Download |
| **Architect** | "Code preview available for review" only; manual edits via GitHub locally | None | None | — |
| **Leap** | Code tab (services explorer) | — | **Git diffs per change** ("changes work like pull requests") | **Architecture** diagram, **API explorer**, tracing |
| **Cursor** | Full IDE + Agents Window file browser | Per-agent sandbox terminal | **Review pane**: Keep / Undo per hunk and per file, "Undo all / Keep all / Review next file"; **Review → Find Issues** | PR tabs Reviews / Commits / Changes |
| **Claude Code** | File editor pane (Save; warns if changed on disk) | Terminal pane (`Ctrl+\``) | **Diff viewer: files left, changes right; click a line to comment (comments batch into the next message)**; **Review code** top-right | Right-click path → Attach as context / Open in VS Code, Cursor, Zed |
| **Codex** | Toggleable Files panel; no inline editor at launch | Multiple terminal tabs | **Review scopes: Unstaged / Staged / Commit / Branch / Last turn**; stage / revert per hunk; hover + to comment | Project **Actions** buttons (tests, dev server, lint) |

**Best-in-class.** Code as a *peer tab* in the same workspace (Lovable, v0, Bolt), not a separate product. Review via a **diff chip → file-list + diff + line comments that batch into the next prompt** (Claude, Codex). **Scoping and locking** give the AI boundaries (Bolt Target/Lock, Rocket and Cursor `@file`). **Project actions** as buttons (Codex).

**Anti-patterns.**
- **Paywalling code *reading*.** Lovable Free is read-only; its own report recommends paywalling editing instead.
- **Review controls that move or disappear.** Cursor's per-hunk Keep/Undo went missing, leaving "only Undo All".
- **No history view.** Codex has no commit graph or branch tree (#30919).
- **Unversioned manual edits** (v0).

---

### 3.7 Deploy and publish dialog

| Platform | Entry | Dialog steps and fields | Pre-publish gate | After publishing | Custom domain |
|---|---|---|---|---|---|
| **Replit** | **Publish** (upper right), a "Publish your app" banner in the preview, or ask the Agent | ① `.replit.app` subdomain → ② access: **Public / Password protected / Workspace only / Invite only** → ③ optional feedback widget → ④ **Review security** → **Publish** | Security checks; health check (fails if the homepage takes >5 s; must bind 0.0.0.0) | Status + URL; **manual Republish**; Publishing pane with **Logs**; deployment type (Autoscale / Static / Reserved VM / Scheduled) chosen for you | Publishing settings → add domain → A + TXT → "Verified"; **buy inside Replit** |
| **Lovable** | **Publish** (rightmost) | One dialog: **Website URL** (editable subdomain) · **Visibility** (Business+) · **inline Quick security scan result** · auto title, description, favicon, OG image | Quick scan; admins can **block publishing on critical findings** | "Your website is live" + copy / visit; later **Publish → Publish changes** (snapshot model) | Settings → Domains: **buy** (Stripe checkout, auto DNS/SSL) or **connect** via **Entri** (automatic) or manual A `185.158.133.1` + TXT; statuses **Pending → Verifying → Live / Connection issue**; or say "buy me a domain" and confirm the approval card |
| **v0** | **Publish** in the chat header | Wizard: ① Vercel project name → ② **visibility** → ③ **domain** → ④ **claim Stripe/Shopify test sandboxes** → **Publish** | CI (GitHub-backed) | **Deployment card**: live build progress, site / commit / Inspector / build logs, CI, **Fix** actions; **Publish Changes** | Publish → Customize Domain; **buy in the chat sidebar**; DNS via "**Inspect on Vercel**" (leaves the product) |
| **Rocket** | **Launch** (top-right) | Modal with **Staging / Production / APK** tabs. Staging: **Publish** → later **Update**. Production: domain + env vars (**Setup now / Skip & continue**) | **Launch disabled while chat errors are unresolved** | One-click rollback | Auto-DNS via temporary registrar access (**Continue → Okay, continue**) or manual A records → "I have added all records…" → **Live**; buy via IONOS ("**Don't close this screen**") |
| **Emergent** | **Deploy** (top right) → **Deploy Now** | — | **Pre-Deployment Health Check agent** | 5–15 min; "**this is taking a while, sit back and relax**" (Emergent calls it a "black box"); 50 credits/month per app (pages disagree on monthly vs one-time); free redeploy/rollback; **shut down** | Deployments → Custom Domain → **Link Domain** → domain → Next → one A record (TTL 300) → **Check Status**; buy via IONOS, free for year 1 |
| **Architect** | **Deploy** (top-right) | **Publish to Marketplace** toggle (Category, Description, 160-char Short description, ≤8 Tags) · **Custom domain** field · **Analytics** toggle → **Deploy** | "Validate in Live App first" (manual) | Success dialog "Your app is now live" with URL, copy / open; **Re-deploy** (manual since v2.0.1); **Rename deployed URL** | Field only; **no DNS steps or verification status documented** |
| **Base44 / Bolt / AI Studio** | Base44 Publish modal; Bolt Publish panel; AI Studio **Publish** (top right) → Get Started → **Publish App** | Base44: **Web / Mobile app** tabs, URL, **Get domain**, visibility, **Security status**. Bolt: status, link, **last published time, unpublished changes**, visibility | Base44 **Production Pack** (Verification, Testing Agent, Security Scan) on all plans; Bolt automatic security review + token-free audit | AI Studio: Cloud Run URL; **2 free apps with no billing account** | Base44 auto DNS + free domain for year 1; Bolt buy/connect + in-app DNS |
| **Windsurf / Cursor** | Chat: "Deploy this project to Netlify"; Cursor Start from scratch → Create repo → connect Vercel → Publish | — | — | Windsurf **claim URL** moves the site to your own Netlify; Cursor **Rollouts** monitors deploy health and names the suspect change | In Vercel / Netlify |

**Best-in-class**
- **Access level as step one of publishing** (Replit's four options).
- **Security in the dialog, not after it.** Lovable inline scan; Base44 Production Pack; Replit Review security.
- **A visible "unpublished changes" state** (Bolt) with a snapshot publish model. Architect itself reverted auto-redeploy in v2.0.1.
- **Staging / Production as tabs** (Rocket).
- **Claimable test sandboxes** (v0 Stripe) and a claim URL for hosting (Windsurf).
- **DNS with automation + live status** (Lovable Entri; Rocket's registrar access).

**Anti-patterns**
- **Black-box deploys** (Emergent).
- **Dev/live drift** (Replit): "Production secrets must be entered again", the filesystem resets, the health check times out; Rocket's "production running an older version than the preview".
- **Leaving the product for DNS** (v0).
- **A domain field with no verification** (Architect).
- **Ambiguous hosting fees** (Emergent).
- **Credits hitting zero pauses the production backend** (Lovable's unified pool, Jun–Aug 2026). Per Lovable's own docs, the published pages stay live, but AI features in deployed apps stop and Cloud-backed apps "can pause", and data can't be accessed or exported until services run again.

---

### 3.8 Integrations and connectors screen

| Platform | Where the catalog lives | Connect flow | Scope taxonomy | MCP | Secrets UX |
|---|---|---|---|---|---|
| **Replit** | Workspace sidebar **Integrations** (450+ in one browsable UI) | Sign in once and **reuse across apps**; **Smart Connector Picker** inline in chat when several fit | Replit-managed · Connectors (OAuth) · External (your keys) · Agent Services (billed to credits) | Both ways (uses MCP; *is* an MCP server) | App vs **Account** secrets; bulk JSON/.env edit; **prod secrets set separately in Publishing** (a common failure) |
| **Lovable** | Dashboard sidebar **Connectors** + editor **More → Connectors** | Approval cards before sensitive actions; per-action permission **Always allow / Ask each time / Never allow** | **App + Chat** (shared credential) · **Chat (MCP, build-time only)** · **App user connectors** (each end user OAuths) · Custom REST | Custom MCP + registries; **publish your app as an MCP server** | Credentials in a gateway, never in the project; Cloud → Secrets |
| **v0** | Composer **+ → MCPs**; Project → Settings → **Integrations** (per-integration Remote MCP toggle) | **Integration Wizard opens in chat** and provisions Marketplace resources + env vars | Marketplace (Neon, Supabase, Upstash, Stripe) · MCP presets · **Vercel Connect** (per-user or shared-account OAuth for bots) | Per-integration **Disabled / Ask for Approval / Always Run**; approvals **grouped at the top of the composer** | **Per-environment** env vars (Dev / Preview / Prod); `NEXT_PUBLIC_` leak warnings |
| **Rocket** | Workspace Settings → **Connectors** (card grid, Connect button, **green dot when connected**); `…` → Connectors; in-chat **Connect** | OAuth or key | **Task-level** (Stripe, AdSense, HubSpot) vs **workspace-level** (Supabase, GitHub, Google) | None user-facing | Settings → Environment with **Staging / Production** tabs; **APIs panel**: 6-step wizard (Postman/cURL/OpenAPI → route → **click the UI element to attach** → trigger → instructions → code) |
| **Architect** | An "integration section" listing the tools the app uses (placement **unverified**) | **Connect → review/adjust scopes → Allow**; MCP via `+ → Add MCP server` or `@mcp:` (name, URL, auth) → **Connect**; **green dot**, account-scoped | 26 built-in tools; custom tools **only in Studio** | Yes (v2.1.0); "**never use fake or unverified tools**" | **⋮ → Environment variables** (one list, no per-environment values) |
| **Emergent** | Home **Advanced Controls → Select MCP Tools**; playbooks | Agent asks for keys **in chat** | Playbooks (verified configs) | Builder MCP; Emergent is also an MCP server | `.env`; pasting live Stripe keys into chat is the documented flow |
| **Cursor / Claude / agent builders** | Cursor **Customize** page (plugins, skills, MCPs, subagents, rules, commands, hooks at user / team / workspace scope; team **Required / Default On / Off**); Claude Settings → Connectors; Copilot Studio Tools dialog **Featured / MCP / Connectors / Workflows** | Fleet **connection format selector**: act as each user ("Assistant") vs the agent's own account ("Claws") | — | — | Claude and Managed Agents **vaults/proxy**: secrets substituted at egress, "never visible in the sandbox" |

**Best-in-class.** Replit's **inline provider picker**. Lovable's **three-way connector taxonomy** (build-time vs app-shared vs per-end-user), which maps directly onto agentic apps. v0's **in-chat wizard that writes env vars itself**. Rocket's **"click the element this API powers"**. Architect's **"never fake a tool"** rule. **Identity choice at connect time** (Fleet).

**Anti-patterns.**
- **Secrets pasted into chat** (Emergent).
- **Silent sample-data fallback when an integration isn't connected.** An Architect app "never asked me to connect Google Calendar" [3P-hands-on] (A4).
- **Auth setup across three dashboards** (Rocket's social login).
- **A single env list with no environments** (Architect).
- **Custom tools in a second product** (Architect → Studio).

---

### 3.9 Agent builder

| Archetype | Examples and concrete layout | Status in 2026 |
|---|---|---|
| **Form + chat "agent card"** | **Copilot Studio (Copilot harness)**: top tabs **Build \| Preview \| Evaluate \| Monitor**; Publish / Save / Share top-right; Build = rich-text **Instructions** (left) + right sidebar **Model, Skills, Tools, Knowledge, Connected agents** (each with +). **Dify New Agent**: Configure (Model, Prompt, Skills, Files, Tools, Advanced) + **Build-by-chat with a "Build draft" of staged changes → Apply / Discard** + **Access Point** tab ("which workflows consume it"). **n8n Agents** (define once; use in chat, as a workflow node, Slack, schedule). **LangSmith Fleet** (Configure panel; approvals inline and in an **Inbox**). **Base44 Agents** (Guidelines · Tools · memory scope · WhatsApp / Telegram / LINE). **Gemini Agent Designer** (7 sequential panels: Name & Instructions → Tools → Knowledge → Triggers → Permissions → Test → Deploy) | **Winning.** Microsoft, LangChain, Dify and n8n moved here in 2026. OpenAI moved no-code users to natural-language Workspace Agents |
| **Canvas** | OpenAI Agent Builder (node palette left, canvas centre, config right; top bar Preview · Evaluate · **Code** · Publish); Flowise; Langflow; **CrewAI Studio** (left **AI Thoughts** · centre canvas · right Resources) | **Declining for defining an agent.** OpenAI's retires 2026-11-30 and testers called it "more technical than n8n". It survives for deterministic workflows |
| **Code + dev UI** | **LangSmith Studio** (Graph / Chat modes, **time-travel** from a checkpoint); ADK Visual Builder (writes YAML + `tools/`); **Mastra Studio** Agent Editor (versions, compare, rollback); **Vellum** (graph ⇄ Python **two-way sync** via CLI) | The durable developer layer |
| **Inside app builders** | **Architect**: agents decided by the planner (PRD agent table) → **Agents tab** → Edit Agent (name, description, role, goal, instructions, model, temperature, top-p, **Save changes**) + **Open in Lyzr Studio** (two-way sync) for tools / KB / guardrails / simulations; GitAgent shows Soul / Rules / Duties. **Replit**: "Agents & Automations" app type with a trigger picker (Slack / Telegram / Timed), now **Routines** with a **per-run budget**. **Emergent**: custom *builder* agents via a 5-part template. **Lovable / v0 / Rocket**: no agent section; agents are just app code | Nobody offers framework choice + traces + evals + an app binding |

**Converged anatomy (agent builders, 10 §0):** Instructions → Model → Tools (MCP / connectors / workflows-as-tools) → Knowledge → Skills → Memory → Sub-agents → Triggers/Channels → Guardrails/Approvals, wrapped in **Preview/Test → Evaluate → Monitor → Publish**.

**Best-in-class.** Dify's **staged Apply/Discard draft**. CrewAI's **streaming thoughts while the agent assembles**. Relevance's **eval that blocks publishing**. Mastra's **side-by-side version compare**. Fleet's **identity choice** and **approvals Inbox**. n8n's **"one agent, many surfaces"**.

**Anti-patterns.**
- **The two-product round-trip** (Architect → Studio).
- **Raw knobs for non-technical users** ("temperature").
- **Irreversible harness choice** (Copilot).
- **One-way ZIP export** that kills visual editing (CrewAI).
- **Memory off by default** (Gemini) or **volatile** (n8n Simple Memory).
- **Canvas clutter** (Flowise).
- **Silent failures.** Agents "silently returning nothing while appearing to succeed".
- **No import of existing agent code** (no platform turns a LangGraph/CrewAI repo into a card with traces).

---

### 3.10 Settings, usage and billing

| Platform | Settings structure | Usage surface | Cost-control UX |
|---|---|---|---|
| **Lovable** | Project settings: **General** (Details, monitoring, Preview, Publishing, Sharing, Project actions, **Danger zone**) · **Git** · **Domains** · **Knowledge** · **Skills** (unified Jul 2026) | Daily charts by project and person; Workspace Insights | Live timer + credits per message; **check-in at 20 credits**; **Add credits / Finish up**; per-member monthly limits |
| **v0** | Project Settings (per-env **Env Vars**, GitHub, Integrations, Vercel Project, Domains, Template); **Account/Workspace Settings via Cmd/Ctrl+.** (Billing, Usage & Activity, Integrations, Instructions, Skills, memories, API keys, sharing and model policies) | **Usage dashboard**: stacked daily credit bars; per-event table (Date / Event / Kind / Model / Cost) with **FREE tags** for waived fixes; CSV; 365 days | End-of-run receipt; shared pool |
| **Replit** | Settings → Usage · Personalization (steer/queue default) · Customization → Memory · Account → Billing · Advanced → Identity & Governance | Usage page filterable by resource, project, member; CSV | **Billing alerts and hard caps**; cost per checkpoint **only on hover afterwards** (A2) |
| **Rocket** | Workspace Settings: **Overview · Connectors · Subscription · Members** (per-Editor credit limits, 0–10,000) | Subscription tab | No per-message cost; "Rocket pauses generation" at zero |
| **Emergent** | Account Settings sidebar: **Universal Key**, LLM Providers, billing; credit balance + buy in the top bar | — | **Per-chat budget under the input**; pause-and-ask at the cap |
| **Architect** | Pricing modal: **Plans \| Top Up** tabs, Monthly/Annual toggle, "⊙ Soon" chips; ⋮ → Environment variables | **Usage page** (total credits, per-app, sortable) + **per-agent/per-phase breakdown** (Plan, Agent Creator, UI Generation, Build, Testing; tokens in / out / cached) | None before a run |
| **Cursor** | Cursor Settings (General / Privacy, **Agents > Approvals & Execution** run mode); **Customize**; config as repo files (`.cursor/rules`, `mcp.json`, `hooks.json`, `permissions.json`, `sandbox.json`) | Dashboard spending; team analytics | Soft spend alerts at 50/80/100%; removed its dollar-cost graph (HN backlash) |
| **Claude Code / Codex** | Settings → Claude Code (worktrees, branch prefix, auto-archive); Codex Settings → Environments (setup script, network **Off / Common dependencies / All**) | **Usage ring**; `/context`; Codex `/usage`, `/status` | Claude "**Large workflow**" warning above 25 agents or 1.5M tokens |

**Best-in-class.** v0's **FREE tags** that make "you don't pay for our mistakes" visible. Architect's **per-phase breakdown**. Cursor's **policy-as-files reviewable in git**. Lovable's and Rocket's **per-member limits in a shared pool**. Claude's **pre-fan-out warning**.

**Anti-patterns.**
- **No pre-run estimate anywhere** in the app-builder set: the #1 complaint for Replit, Lovable, v0, Emergent, Rocket and Bolt.
- **Removing cost visibility** (Cursor).
- **Two currencies** (Base44 message vs integration credits).
- **Docs contradicting the product.** Architect's Free credits differ between docs and the modal; Replit's own pages disagree on its credit amounts.
- **"Soon" chips on the pricing page** (Architect).
- **Mode renames** (A1).

---

### 3.11 Visual design language trends

- **Near-monochrome neutral canvas + one accent.** Examples:
  - v0 / Vercel Geist: #171717 / #fff, hairline shadow-as-border, Geist Sans / Mono.
  - Codex: monochrome, black pill primaries.
  - Architect: off-white **graph-paper grid**, black pills, teal/emerald accent, monospace for plan text.
  - Lovable: warm off-white #FCFBF8 with an orange→pink→blue gradient brand (**unverified** hex).
  - Claude: parchment #f5f4ed + terracotta (secondary analyses).
- **Colour reserved for status.** CI, deploy and connection states: v0, Codex, and green "connected" dots in Architect and Rocket.
- **Two density regimes.** No-code builders are **light, airy and friendly** (Lovable, Base44, Architect marketing). Developer tools are **dark-first and dense** (Cursor, Emergent's builder, Rocket's "space-black" Mission Control). The winning products switch *density*, not *product*: Cursor's tool-call density, Claude's transcript views, Lovable's progressive disclosure through `+`, `@`, `/` and More.
- **Pills, chips, large radii, soft shadows.** Context chips in the composer (v0 attachments with thumbnails; skills as chips), status pills, diff counters `+42 −18`.
- **Ambient status beyond the tab.** v0 favicon badges and completion sound; Bolt chime; Replit, Cursor and Rocket Live Activities / Dynamic Island.
- **Brand metaphors.** Rocket (Launch, Launchpad, Mission Control, Booster) and Architect's hard-hat mascot. They add personality but can obscure meaning (Rocket's pillars dilute the builder story).
- **Anti-patterns.** Emergent's "white on white" labels; dark log walls for non-developers; Cursor's Agents Window ignoring VS Code themes; Replit's canvas "could use a bit more polish".

---

### 3.12 First-principles UX takeaways for Architect 2.0

*These takeaways become design concepts C1–C15 in §8 and the information architecture in §9.2.*

1. **One noun hierarchy, visible everywhere.** Use *Project → Chats/Tasks → Checkpoints → Deploys*, with **Agents and Data as first-class objects inside a project**. Architect's "project / app / agent / agentlet" muddle, Claude's ten overlapping parallelism features and Rocket's three pillars show the cost of skipping this.
2. **The composer is the cockpit.** Every *run-level* decision lives in one strip: what (prompt + `@` context), how (Ask / Plan / Build), how hard (effort tier, not model IDs), where (cloud / local), and **what it will cost (estimate + usage ring)**. Global settings are for defaults only.
3. **Every screen answers three questions: what's live, what changed, what it costs.** Use a persistent status strip (environment ● live version ● Data ● Agents ● Readiness; see the §9.2 wireframe), an "**N changes not live**" badge beside Publish, and a live credit meter. This counters A2, A3 and v0's "frontend-only" perception gap.
4. **A plan is a signed contract, not a chat message.** Make it an editable artifact (Replit card, Kiro specs, Architect PRD) with an explicit **scope diff** ("you asked for A, B, C; this plan covers A and B; C is deferred because…"), a **time and cost range**, and three CTAs that also set autonomy (Claude's pattern).
5. **Make waiting legible and interruptible.** Pin an outcome checklist with per-unit status and Retry, stream the preview (never blank), give a recalibrating ETA, always allow Stop, and support steer/queue. End every run with a **receipt with proof**: tests, screenshots or video, files, credits. No mini-games.
6. **Undo must be total, safe and previewable.** A checkpoint captures **code + DB schema/data + env + agent config**. Restore is **non-destructive** (it creates a new version) and **lists what it will change** before you confirm (Replit). A one-click revert arrow sits on every message (Windsurf).
7. **Direct manipulation before prompting.** Offer deterministic free edits first, then batch-and-apply, then point-and-prompt chips, then reviewer annotations. Charge only for structural changes, and label free actions.
8. **Progressive disclosure by context, not a mode fork.** One workspace for everyone. Developer affordances appear *where they're relevant*: a branch/PR menu next to Publish (v0), "View code for this agent", Code/Terminal tabs that exist but stay collapsed. The density toggle changes information depth, not features.
9. **Ask before anything irreversible or costly, in plain language, at the moment of choice.** Examples: prod DB migrations, publish, sending email or SMS, buying domains, one-way choices (region, framework, backend provider). Use approval cards with Always / Ask / Never memory (Lovable, v0, Fleet).
10. **Never degrade silently.** Put a "Sample data" badge on mock-fed widgets, a blocking "connect real data" item in the launch checklist, no dropped requirements without a note, and no auto-continue on consequential questions.
11. **Imports are peers of the prompt.** Put a single "Start from…" picker on the home composer: GitHub (any stack), ZIP/folder, Figma, screenshot, URL, a competitor export, or agent code. Follow it with an "**Understanding your project**" report before the first edit.
12. **Agents: one spec, two editors, one lifecycle.** Pair an Agent Card (plain-language sections) with a Code view over a real framework project, sharing Build → Test → Evaluate → Monitor → Deploy, and show **where each agent is used in the app**. No platform in the set shows the screen/route → agent binding. That binding is Architect's natural wedge.

---

## 4. User-flow comparison

> **How to read the step counts.** A "step" is one distinct screen, decision or click that the documented flow describes. Counts are approximate (**~**) because most sources are docs and tutorials, not timed sessions. Waits are listed separately. Optional steps are in [brackets]. "(unverified)" markers carry over from the platform reports. Each journey ends with a one-line **ideal flow for Architect 2.0**; §9.3 expands these into prototype hero flows (HF1–HF10).

### 4.0 Summary: best in class vs Architect today

| Journey | Best in class today | Architect today | Gap to close |
|---|---|---|---|
| **(a) Sign-up → first app** | **Lovable**: prompt before sign-up, 3 design directions. **Rocket**: clarity gate + screen checklist | Auth wall on home; best-in-set **PRD + agent table**; then a ~20-min black box | Defer auth; make the wait legible and the cost known |
| **(b) Generation** | **Lovable** activity cards → Details (Timeline / Changes). **Claude / Cursor** pinned to-dos + density toggle. **Emergent E-3** Mission Control. **v0** receipt | Checklist exists in marketing only; "carousel and a mini-game" | Live timeline, recalibrating ETA, live cost, Stop |
| **(c) Iterate & fix** | **Rocket** Advisor escalation after 2 failed fixes. **Replit** rollback incl. DB. **Windsurf** console → prompt. **Cursor** Debug mode | "Help me fix it" + auto-fix; no logs, console or rollback UI | Error chips with context, loop breaker, total checkpoints |
| **(d) DB / auth / storage** | **Replit** dev + prod DBs + Clerk. **Lovable** Cloud tabs (SQL, RLS, Users). **Base44** "Act as a user" | Auto NoSQL + Database tab; email/password only; no storage, functions or cron | Dev/prod split, social auth that works in preview, storage, functions |
| **(e) Connect GitHub** | **v0** branch per chat + PR + CI + Fix CI. **Claude** CI bar with Auto-fix / Auto-merge | 2-step connect; auto-commit every change; pull/push to *existing* branches only | Create branch / PR / CI in-app; squashed, AI-written commits |
| **(f) Import** | **Replit**: 10+ sources incl. competitor importers. **v0**: any repo, base branch, monorepo root dir | GitHub **Next.js only** (entry point **unverified**) | Any stack, ZIP, Figma, URL, agent code, plus an "understanding" report |
| **(g) Deploy & domain** | **Lovable** inline scan + Entri DNS + status. **Replit** access levels. **Rocket** Staging / Production tabs | Deploy modal (Marketplace, domain field, analytics); no DNS steps | Launch checklist, environments, DNS wizard with live status |
| **(h) Build an agent & attach** | **Dify / Copilot Studio** card + staged changes. **LangSmith Studio** time-travel. **Base44** in-app agents with channels | Planner creates agents → Edit Agent → **Lyzr Studio round-trip** for tools, KB, guardrails | Full anatomy in-product, any framework, traces and evals, app binding |

---

### 4.1 (a) Sign-up → first app

| Platform | Documented steps | ~Steps to first preview | Build wait | Friction | Best moment |
|---|---|---|---|---|---|
| **Architect** | architect.new **sign-in card** → Continue with Google/Email (Studio account auto-created) → [AI Consultant: About → Role → Time-sinks → Tools → Goals → **Build This**] → prompt (+ attach / theme / agents / MCP) → answer 3–6 planning questions → review PRD, mockup, workflow → "Plan Ready" → **Start Building** → wait → Live App → sign up as a test user | **~8** (~14 with Consultant) | "4–6 min" promised, **~20 min** actual [3P-hands-on]; Testing agent adds 2–5 min | Auth wall; no cost estimate; scope silently dropped; app may run on **sample data** | Live PRD with an **agent table** before any spend |
| **Lovable** | Type a prompt on lovable.dev **before sign-in** → sign up (Email / Google / GitHub / Apple / SSO) → Free workspace auto-created → mode (Build default, or Plan) [+ attach / Design] → **3 design directions** or design questions → clarifying card (answer or **Skip**) → build streams → summary + suggestion chips | **~6** | "A few minutes" (1–3 min in tutorials) | Credit burn; Free code is read-only | **Deferred auth + design directions** |
| **Replit** | "What will you build?" → Start for free → sign up → verify email → name, personal/school/work → Workspace home → artifact chip + mode + [Plan] → prompt → "task plan is ready for review" → **Review now** → **Build here** → build → summary + checkpoint | **~10** | **3–5 min** (from 15–20 in Dec 2025); mobile 7–10 min | Email verification; IDE density; cost only on hover afterwards | Plan card with **Done looks like / Out of scope** |
| **v0** | vercel.com/login/v0 (creates a Vercel account) → centred prompt → [attach / model / **Enhance prompt**] → answer chips inside the prompt form → [plan approval if the Plan instruction is on] → stream → **work details** | **~5** | ~30 s for an early 10-file app; agent-mode runs 5–10+ min | Second-vendor account; Plan hidden; 7 messages/day free | Last good preview shown during VM boot; end-of-run receipt |
| **Emergent** | emergent.sh → type idea / Get Started → sign in → tools survey → **Full Stack App** + agent (E-1…E-3) + model [+ Advanced Controls: budget, MCP, template] → **Start Task** → chat questions ("start building or discuss more?") → streamed checklist → preview link | **~9** | 5–15 min (about 10 in Banani's test) | Version-numbered agents; budget hidden in Advanced; preview times out after ~30 min | Agent restates the brief before asking key questions |
| **Rocket** | Sign up (Google / SSO / **email OTP**) → Home (Solve / Build / Intelligence) → prompt [or Build card → category tab] → **clarity modal only if vague** → Submit → **screen plan** (untick unwanted) → Generate → per-screen status | **~6** | 1–3 min (5–8 reported) | **Stop disabled** once generation starts; framework locked; free tasks public | Scored clarity gate + editable screen list |
| **Bolt / Base44 / AI Studio** | Bolt: sign in → prompt / template / Figma / GitHub → **Enhance prompt** (asks questions) or Plan → **Implement this plan**. Base44: prompt + **design-style picker** [+ Plan] → checklist build with data and auth built in. AI Studio: Google sign-in → Build → prompt or **I'm Feeling Lucky** → approve plan checkpoint → preview | **~3–5** | AI Studio simple apps 15–30 s | Bolt's in-browser runtime needs Chromium (Safari is degraded); AI Studio is Gemini-only | AI Studio: **free with no billing account** |
| **Claude Code web** (dev) | **Sign in with GitHub** → [install GitHub App or **Skip**] → Default environment auto-created → repo + branch selector below the input + mode → task → branch pushed (`+42 −18`) → **Create PR** | **~6** | Runs in background; survives closing the tab | GitHub required for cloud | The most beginner-friendly developer onboarding: skippable steps, auto environment |
| **Cursor** (dev) | Download → **Import VS Code settings** → browser sign-in → Privacy Mode → open or clone a folder → Agents Window → mode / model / environment → prompt. Or **Start from scratch** → cloud agent → Create repo → connect Vercel | **~8** | — | Desktop install; Vercel needed to publish | Settings import removes switching cost |

**Ideal flow for Architect 2.0:** prompt on the logged-out home → 2–4 tappable questions plus a live PRD, screen list and agent table with a **time and cost range** → sign in (Google / GitHub / email OTP) only at **Start building** → one persona question sets the density → live build timeline → running preview with a receipt (≈5 steps, no auth wall before value).

---

### 4.2 (b) Generation experience ("UI getting built")

| Platform | Gate before code | What you watch | Control mid-run | End state / proof |
|---|---|---|---|---|
| **Architect** | Planning mode (questions → PRD / mockup / workflow → **Start Building**); skippable | Marketing: ticking checklist + "AI Planning… 13%→100%". Real: "20-minute black box with a carousel and a mini-game" [3P-hands-on] | Stop in planning; nothing documented during build | App "marked ready only after preview loads"; optional **Test** agent |
| **Lovable** | Design directions / question cards; Plan view with Comment + versions | Activity cards → **Details** (Timeline, Changes) in the preview pane; hot-reloading preview; **Working for** timer + **Credits used** | Stop (keeps work, billed); follow-ups folded in at the next stopping point; **credit check-in** at 20 credits; **Add credits / Finish up** | Summary, suggestion chips, **Undo latest edit**, Revert |
| **Replit** | Plan card (**Revise / Cancel / Build here / Build in background**) | Progress indicators, live file changes, preview updates; **App Testing** browser with a visible cursor | **Steer vs Queue** drawer; Stop in the status bar; background tasks on a Kanban | Summary + checkpoint + **video replay**; cost on hover |
| **v0** | Chips in the prompt form; optional Plan instruction | Tool-status cards, citations, **self-test screenshots**; preview with "subtle progress lines" during boot | Queued prompts; Cmd+Enter interrupt; grouped approvals tray | **Work details**: time, files, lines, credits; sound + favicon badge |
| **Emergent (E-1/E-2 → E-3)** | Chat questions; E-3 phase plan (approve Phase 0 / skip POC / adjust) | Checklist lines, file edits, self-check screenshots, **budget counter**; E-3 **Mission Control** phase cards | Pause at budget cap and ask; E-3 **pause / resume / redirect** | E-3 delivery card: built / tested / passed + preview + **Deploy** |
| **Rocket** | Clarity modal + screen selection | **Per-screen and per-file status** (Completed / In Progress / Failed) + current filename + reasoning | **None**: "abort control becomes inactive once generation begins"; "Notify me" banner | Version card (Files row, Code diff, Rollback, Launch) |
| **Base44** | Plan mode | Build checklist ("Generate schema" → "Create routes" → "Seed data"); preview **jumps to new pages** | New messages join the active run | Silent background Verification |
| **Cursor / Claude Code** | Plan doc (Mermaid + to-dos) / 3-button approval | Pinned to-do list, live diffs, terminal, browser verification; density **Compact / Balanced / Detailed** or **Normal / Thinking / Verbose** | Non-blocking steering, queue, Stop; parallel subagents in a Tasks pane | Diff chip, Review code, video (Cursor cloud) |
| **CrewAI Studio** (agent) | Describe the crew | **AI Thoughts** stream while nodes appear on the canvas | Chat and canvas share state | Execution view (Details / Messages / Raw Data) |

**Friction:**
- black-box waits and optimistic ETAs (Architect; Emergent deploys);
- no Stop (Rocket);
- sleeping agents (Rocket after 10–15 min idle; Emergent's **Wake Up Agent**);
- cost only afterwards (Replit);
- Codex's structured questions limited to Plan mode.

**Best-in-class moments:**
- Lovable's **Details drawer** gives one stream to two audiences;
- Rocket's **Retry on the failed unit**;
- v0 never shows a blank preview;
- Emergent's **pause-at-budget** dialog;
- Replit's **video replay with take-over**.

**Ideal flow for Architect 2.0:** approved plan contract → pinned outcome timeline (*Plan → Data → APIs → Agents → Screens → Tests → Ready*), each step expandable to files and tool calls → preview streams screen by screen → recalibrating ETA and live credits in the composer → steer, queue and an always-on Stop → completion receipt (time, credits, tests passed, screenshots, "N sample-data widgets").

---

### 4.3 (c) Iterate and fix errors

| Platform | Iteration tools | How errors surface | Fix action and cost | Loop protection | Rollback |
|---|---|---|---|---|---|
| **Architect** | Chat; **Plan** toggle ("Planning"-tagged replies change no code); Agents tab edits | "Help me fix it" prompt; auto-fix "without you having to click" (v2.0.2); **Test** agent | Credits; describe or screenshot the error | "One coherent change per prompt" (docs only) | **None in UI** (git commits only) |
| **Lovable** | `@file` / `@project`, `/skill`, preview toolbar, **Drafts**, `/goal` | Preview error overlay + chat card **Try to fix** | 10 free fixes/day, then credits | Docs: after 1–2 failed fixes switch to **Plan** for root cause; **Edit message → Revert and resend** | History → Revert (**code only**) |
| **Replit** | Free Visual Editor; steer mid-turn; Design canvas → **Build…** | Agent auto-detects build errors, fixes and retests; Devtools | Credits, non-refundable when the agent fails | None; "we're on build 8" (Trustpilot) | **History → Rollback here** (code + memory + optional DB) |
| **v0** | Design Mode, Annotations, Code tab, queued prompts | Compact error bar / failed build → **Fix with v0**; server logs | **Free if v0 caused it on unedited code**; FREE tag in usage | None documented; "$70 and 16 hours in an error loop" | Per-message restore (linear) |
| **Emergent** | Specific prompts; **Visual Edits** batch → Apply | Paste F12 console errors or screenshots; agent reads logs | Credits; one bug billed "233+ times" | Manual recipe: Stop → **Rollback** → **Save to GitHub** → re-prompt one small task | Rollback per step (code + chat, or chat only) |
| **Rocket** | `/` screen-aware commands, `@file`, Visual edits, **camera** screenshot → chat | **Fix it** button on detected errors; multi-error fix count; hydration detector | **Free for paid users** | **Advisor Agent auto-activates after ≥2 failed fixes** (root cause, numbered steps, trade-off table; writes no code) | Destructive rollback |
| **Bolt / Base44 / Tempo** | Bolt: Select, free Visual Edits, **Lock file**. Base44: Edit mode, Canvas sticky notes, **Revert / Edit** under each message | Bolt: auto-fixes logged as separate chat entries | Tempo: **free "Fix with AI" up to 7 in a row** | — | Bolt clock-icon history; Base44 Backup & Restore (data) |
| **Cursor / Windsurf / Claude** | Design Mode, `@Terminals`, checkpoints | **Windsurf: console errors auto-attach to the prompt**; Claude auto-verify; Bugbot on PRs | Plan usage | **Cursor Debug Mode**: hypothesise → instrument → *ask you to reproduce* → fix → remove instrumentation | Cursor Restore Checkpoint; Claude `/rewind`; Windsurf per-prompt revert arrow |

**Friction:**
- paying for the AI's own regressions (Replit, Lovable, v0, Emergent, Rocket, Bolt);
- false "fixed" claims (Lovable "claim a bug was fixed three times"; Emergent "claimed to have made changes that were not actually implemented");
- debugging by copy-paste from F12 (Emergent);
- no logs in the builder (Architect).

**Best-in-class moments:**
- Rocket's automatic **escalation to a read-only advisor**;
- Windsurf's **errors-as-context**;
- Cursor's **reproduce-then-fix** loop;
- v0's **FREE** tag for self-caused fixes;
- Replit's rollback confirmation that lists what reverts.

**Ideal flow for Architect 2.0:** errors appear as a "**1 error · Fix (free)**" chip with console, log and agent-trace context already attached → one click fixes and re-verifies → after 2 failed attempts a **root-cause card** replaces blind retries, offering *try another approach / roll back to last green checkpoint (code + data) / show me the error in plain words* → regression fixes are never billed.

---

### 4.4 (d) Add database, auth and storage

| Platform | Trigger | ~Steps | What gets provisioned | Where you inspect | End-user auth | Dev/prod split | Friction |
|---|---|---|---|---|---|---|---|
| **Architect** | Mention it in the prompt or answer "yes" to the planning DB question | **1** | Managed **NoSQL** (MongoDB per tutorial), per-app isolation, `_users` with bcrypt | **Database tab** (collections, live documents, schema) | Email/password only (social **unverified**) | No | No storage, functions, cron or SQL. BYO takes **4** (⋮ → Env vars → Name/Value → Add → prompt "wire it in") |
| **Lovable** | Prompt ("Add sign up and login") | **1–2** (Cloud auto-enables or shows an approval card) | Supabase-based **Cloud**: Postgres, auth, storage, edge functions, realtime, **RLS** | **More → Cloud** → Database (SQL editor, RLS view, **Restore** backups), Users, Storage, Secrets, Jobs, Logs | Email, phone, Google / Apple / Microsoft (**"Managed by Lovable"**), SAML | No staging; **Drafts share the prod DB** | **Region permanent**; no Cloud ↔ Supabase migration |
| **Replit** | Prompt ("persist cars and reservations"; "Use Clerk Auth") | **2 prompts** | Postgres with **separate Dev and Prod DBs**; App Storage (GCS); Replit Auth or **Clerk** (own tenant, Dev/Prod, SSO) | Tools → Database / **Users and Auth** / App Storage / Secrets | Google, GitHub, X, Apple, Email; enterprise SSO | **Yes** (a response to the 2025 SaaStr prod-DB deletion) | Prod secrets re-entered at publish |
| **v0** | Agent proposes it or you ask → **Integration Wizard** in chat | **0–3** (new apps scaffold **Neon + Drizzle + Better Auth**) | Marketplace DBs (Neon, Supabase, Upstash, Blob, AWS) with env vars written automatically | **DB Studio → SQL** (describe a query, v0 drafts SQL, Cmd+Enter runs it) | Better Auth, Supabase Auth, Sign in with Vercel | Per-environment env vars; **preview sees Dev vars only** | Resources live in other vendors' dashboards |
| **Emergent** | MongoDB by default; "add OAuth" | **1 + 3 questions** (provider? required? where to store?) | FastAPI + MongoDB; **Emergent Google Social Login**; Supabase toggle | **No DB browser** (gap) | Google social; role-based views | Preview vs production DBs separate | BYO DB is Enterprise-only |
| **Rocket** | Prompt → in-chat **Connect** | **~5** (OAuth → pick/create Supabase org + project: name, password, region → generate) | Schema, **RLS**, auth pages, storage buckets, edge functions, migrations | Supabase dashboard (extensions, pooling, RLS debugging) | Social login needs **Supabase + Google Cloud Console + the deployed URL**; **doesn't work in preview** | Env tabs Staging / Production | Most troubleshooting pages are about RLS, JWT and redirects |
| **Bolt / Base44 / Anything** | Bolt: ask. Base44: already there. Anything: default | **0–1** | Bolt Database (Tables, Auth, email templates, Users, Secrets, Server Functions, Logs, **Security Audit**); Base44 entities + auth + functions + workflows; Anything Neon Postgres with **dev + prod, schema-only migration on publish** | Bolt database icon; Base44 Dashboard → Data (+ **Act as a user**); Anything viewer + SQL runner | Base44 SSO (Entra, Okta); Anything email, Google, Facebook, X | **Anything: yes** | Base44 proprietary backend (lock-in fear) |
| **Cursor / Claude / Codex** | Install an MCP or plugin (Supabase, AWS) → prompt | ~3 | Code only; no managed backend | External | External | Yours to build | Not for non-coders |

**Ideal flow for Architect 2.0:** data, auth and file needs are inferred at plan time and shown as PRD rows → provisioned on **Start building** with **separate dev and prod stores**, managed Google/GitHub sign-in that **works inside the preview**, storage and scheduled functions → inspect everything in a **Data** tab (tables/collections, roles/RLS, SQL, backups, "Act as user") → swap in BYO Supabase/Postgres with one card, and a warning shown before any one-way choice.

---

### 4.5 (e) Connect GitHub

| Platform | Entry point | ~Steps to connect | Ongoing sync | Branch / PR / CI | Friction |
|---|---|---|---|---|---|
| **Architect** | **GitHub icon, top-right of the app view** | **2** (icon → authorize "Lyzr Architect"; repo created) | **Auto-commit every change**; panel **Pull / Push / branch switcher** | Switch only to branches that already exist on GitHub; no PR or diff | Noisy commits; no in-app branch creation. **Deploy without GitHub → Export to my GitHub** is good |
| **Lovable** | Workspace settings → Git → GitHub → **Add connection** | **~5** (settings → Git → GitHub → install app → link project) | **Two-way on one active branch** | Branch picker creates/switches; Business+ commit attribution | No repo import; **can't reconnect the same repo**; one repo per project |
| **Replit** | Tools → **Git** → Connect to GitHub | **~4** (+ create or link repo) | **Manual**: review → stage → commit (AI message) → push/pull/sync | Branch dropdown (create, switch, publish); Enterprise "Require Git Remote" | 30–60 s sync delays and conflicts reported |
| **v0** | Project menu (…) → Settings → GitHub → **Connect** | **~4** | Auto-commit to a **per-chat working branch**; never pushes to base | **Branch menu next to Publish**: preview deployment, diff, create/open PR, CI checks, **Pull Changes, Fix Build / Fix CI / Fix Conflicts**; respects branch protection | Base / working / production vocabulary leaks to non-developers |
| **Emergent** | Profile → **Connect GitHub**; chat → **Save to GitHub** | **3** to connect + **4 per save** (Save → repo → branch → **PUSH TO GITHUB**) | Manual, per milestone | Choose branch on push; no PR or diff UI **(unverified)** | Manual saves; a broken connection is fixed by removing Emergent in GitHub settings and reconnecting |
| **Rocket** | **GitHub icon, top-right** | **3** (icon → Connect → "Authorize DhiWisePvtLtd") | **Push → `rocket-update` branch + automatic PR to `main`**; then **Pull from GitHub** | Auto PR | Two-way only for **Next.js TS** on paid plans; consent screen shows another company's name |
| **Base44 / AI Studio / Bolt** | Base44 Dashboard → GitHub icon; AI Studio sync; Bolt settings + org GitHub app | ~3–4 | Base44 two-way on `main` (Builder+); AI Studio two-way with a **Resolve conflicts** side-by-side diff | Base44 **protected main makes the AI create branches**; AI conflict resolution | AI Studio "In Sync" when not pushed (bug report) |
| **Claude Code / Cursor / Codex** | Claude: at sign-in. Cursor: Dashboard → Integrations. Codex: connect + choose repos | 1–3 | Branch per session/worktree | **Create PR ▾** (PR / Draft / GitHub compose); **CI status bar with Auto-fix + Auto-merge**; `@claude` / `@codex review`; Bugbot **Fix in Cursor** | Developer-only mental model |

**Ideal flow for Architect 2.0:** projects start on an Architect-managed repo (GitHub never required) → one **Connect GitHub** control *beside Publish* does OAuth and create/link repo in ≤3 clicks → each chat or task works on its own branch, shown to non-developers as a "draft" → squashed, AI-written commits per checkpoint → **Create PR ▾**, a `+/−` diff chip and a CI bar with Auto-fix → external commits are pulled back into the agent's context.

---

### 4.6 (f) Import an existing project

| Platform | GitHub | ZIP / local | Figma | Screenshot / URL | Competitor import | What happens after import |
|---|---|---|---|---|---|---|
| **Architect** | **Next.js only** (v2.2.0; UI entry **unverified**) | No | Theme only (beta, restricted) | Screenshot as chat context | — | Keep building; no analysis step. Separately, 5-source **design-system import** (Figma, PDF/Word, repo, zip, `globals.css`) |
| **Lovable** | **Not supported** (workaround: force-push into a Lovable repo) | ZIP as context only **(inferred)** | Plugin (Dev seat), `.fig` tokens, MCP | Attach / capture; URL via `html=` | — | — |
| **Replit** | `replit.com/github.com/<owner>/<repo>` quick import, or guided private import | **ZIP ≤200 MB** | Connect → paste frame links → extracts layout, type, colours, breakpoints | Via Replit Design (URL, screenshot) | **Vercel, Bolt, Lovable, Base44** (via GitHub), Claude designs, spreadsheets | Agent "prepares the environment, installs dependencies, and configures run commands". You fix secrets and Workflows yourself. **~6 steps** |
| **v0** | **+ → Import from… → GitHub**: URL or search → **base branch** → **root directory** (monorepos) → [link Vercel project for env] | ZIP / .tgz dropped into the prompt | Paid; OAuth → paste link; **shows the frames it reads in chat** | Drag or paste; agent browser visits URLs | — | Sandbox installs with the repo's own lockfile; first change creates a working branch. **~6 steps** |
| **Emergent** | Chat → GitHub → **Pull from GitHub** → repo → branch | No | Brand colours via integration | Attach | — | No "analyse repo / detect stack" step **(unverified)**. **~4 steps** |
| **Rocket** | **+ → Clone from GitHub** → authorise → repo + branch → validate (**Next.js TS only**) → clone → install → preview | No | Paste link → **Start Import** → select frames → web/mobile (View seats limited to 6 requests/month) | Attach; `/` redesign from URL | **Launchpad** `@`: Notion PRD, Linear/Jira tickets, Supabase schema, Airtable, Sheets | History, issues, PRs and other branches are **not** imported. **~5 steps** |
| **Bolt / Base44 / Anything / Dyad** | Bolt: **GitHub icon on home** → *Your repositories* / *Import from URL* (main). Base44: GitHub import, respects **AGENTS.md** | Dyad: local Node folder | Bolt frames, Stitch; Base44 frames → pages | Base44 "existing URL" | Bolt **Import from Lovable**; Anything **Mocha migration incl. data, users, OAuth identities**; Dyad Lovable / v0 / Bolt | Dyad auto-generates **`AI_RULES.md`** |
| **Claude Code / Codex / Cursor** | Open a folder or connect a repo; Claude `--cloud` bundles a non-GitHub repo (≤100 MB) | Yes (local) | Via MCP | Attach | Reads `.cursorrules` / AGENTS.md conventions | **`/init` writes CLAUDE.md**; Codex advises a read-only "explain the project" first. Cursor workspace trust is **off by default** (Windows `git.exe` 0day) |
| **Agent-code import** (any platform) | Mastra Cloud / CrewAI AMP *deploy* from a repo | — | — | — | — | **Nobody** turns a LangGraph/CrewAI repo into a visual card with traces (10 §5.7) |

**Ideal flow for Architect 2.0:** home composer **Start from… ▾** (GitHub any stack · ZIP/folder via CLI · Figma · screenshot · URL · Lovable/Bolt/v0/Replit export · agent repo) → **workspace-trust confirm** (no install scripts run until approved) → "**Understanding your project**" report (stack, routes, data models, *detected agents and frameworks*, missing env vars, what Architect can't do yet) → running preview → first suggested fixes as chips.

---

### 4.7 (g) Deploy and custom domain

| Platform | ~Steps to first live URL | ~Steps to custom domain | Environments | Update model | Friction | Best moment |
|---|---|---|---|---|---|---|
| **Architect** | **2–4**: Deploy → [Marketplace toggle + Category / Description / Short description / Tags] → [domain] → [Analytics] → Deploy | Type a domain in the field; **no DNS steps or status documented** | Single live deployment (enterprise "environments" vague) | Manual **Re-deploy** after preview; **Rename deployed URL** | No launch checks; Analytics dashboard "Soon" | Deploy-without-GitHub; Marketplace publishing in the same dialog |
| **Lovable** | **2**: Publish → review URL, visibility and **inline security scan** → Publish | **~4–6**: Settings → Domains → buy (search, term, auto-renew, contact, Stripe) or connect via **Entri** (automatic) or manual A + TXT → **Verifying → Live**. Or chat "buy me a domain" → approval card (2) | Test/live only for payments and Cloud data; **no staging** | Snapshot: **Publish → Publish changes** | Out of credits pauses the prod backend | Scan inside the dialog; plain domain statuses |
| **Replit** | **5–6**: Publish → subdomain → **access level** → [feedback widget] → **Review security** → Publish | **~4** + DNS wait: Publishing settings → add domain → A + TXT at registrar → "Verified" (or buy in Replit) | Dev and Prod DBs + secrets; deployment type auto-selected | Manual **Republish**; filesystem resets | Dev/live drift (prod secrets, 5 s health check, bind 0.0.0.0) | Four access levels; security review gate |
| **v0** | **~6**: Publish → project name → visibility → domain → claim Stripe/Shopify sandboxes → Publish. GitHub-backed: PR → merge → deploy | ~3 in-product; DNS via "**Inspect on Vercel**" (leaves v0) | Preview deployments per branch; production | **Publish Changes**; deployment card with live logs, CI, **Fix** | DNS outside the product | **Claimable test sandboxes**; watchable deploy card |
| **Emergent** | **2** clicks (Deploy → health check → **Deploy Now**) + **5–15 min** wait | **~6**: Deployments → Custom Domain → **Link Domain** → domain → Next → one A record (TTL 300) → **Check Status**; or buy via IONOS (free year 1) | Preview vs Production (separate DBs) | Redeploy free; rollback free; shut down to stop the 50 cr/month | "**sit back and relax**" black box; monthly vs one-time fee confusion | Health-check agent; ~99% success after Super Deployer |
| **Rocket** | **3**: Launch → **Staging** tab → Publish | **~5**: Production tab → domain → env vars (**Setup now / Skip & continue**) → auto DNS (**Continue → Okay, continue**) or manual A records → "I have added all records…" → **Live** | **Staging + Production tabs**; env vars per environment | **Update** (staging); one-click rollback | Launch disabled by unresolved chat errors; buying a domain needs the tab kept open | Environments as tabs in the dialog |
| **Base44 / Bolt / AI Studio** | Base44 **~3** (Publish → Web tab → Publish, with security status shown); AI Studio **3** (Publish → Get Started → Publish App); Bolt Publish panel | Base44 **Get domain** with auto DNS; Bolt buy/connect + in-app DNS | Base44 branches as full copies | Bolt shows **unpublished changes** and last published time | AI Studio shared apps spend the creator's quota | AI Studio: 2 free apps, no billing account |
| **Cursor / Windsurf** | Cursor ~4 (Create repo → connect Vercel → Publish). Windsurf: one chat sentence → `*.windsurf.build` | In Vercel / Netlify | Cursor **Rollouts** per environment | Windsurf **claim URL** | Vercel account required; Windsurf deploys not available with Devin Local | Post-deploy regression bot names the suspect change |

**Ideal flow for Architect 2.0:** **Publish** (top-right) opens one dialog: URL → who can access (public / password / team / invite) → **launch checklist** (real data connected, secrets present, auth on routes, security scan, tests, agent-eval score; blocking items in red) → publish to **Staging or Production** → a **Domain** tab to buy or connect with auto-DNS and live *Verifying → Live* status → afterwards, an "N changes not live" badge, a watchable pipeline and deploy history with one-click rollback.

---

### 4.8 (h) Build an AI agent and attach it to an app

| Platform | Creation path (~steps) | Where it's configured | Framework choice | Test / observe | Triggers / channels | How it attaches to the app |
|---|---|---|---|---|---|---|
| **Architect** | Describe the app → planner writes the **agent table** → Start Building → **Agents tab** → agent → **Edit Agent** → Save (**~5**). For tools, KB, guardrails or simulations: **Open in Lyzr Studio** → edit → return (**+3, in a second product**) | Edit Agent panel (name, role, goal, instructions, model, temperature, top-p); KB upload or **Crawl URL**; tools named in the prompt | Lyzr only; **GitAgent (beta)**; A2A import of LangGraph/CrewAI **in Studio only** | Live App preview; Studio Simulation Engine; traces in Studio/enterprise | Chat, Voice, Schedule shown in the landing demo; SuperFlow cron/webhooks in Studio (whether Architect generates them is **unverified**) | **Automatic**: the generated UI is wired to agent outputs (e.g. a right-side "Agent Interface" chat that streams tool steps) |
| **Replit** | 2025: app type **Agents & Automations** → trigger (Slack / Telegram / Timed) → prompt → test pane → deploy. 2026 **Routines**: new Chat → describe → questions → review instructions + **per-run budget** → confirm (**~5**) | Code | "General" any-framework mode; no builder | Testing pane; run history; **no trace viewer (unverified)** | Slack, Telegram, schedule (≥1 h) | Standalone; results post back to the thread |
| **Lovable** | Prompt "Add a support chatbot…" → connectors / Jobs → **More → Agent integrations → Enable** → OAuth or public → review tools → publish → share MCP link (**~7**) | Code + Connectors + Jobs | None | Preview; no evals | Telegram, WhatsApp, Slack connectors; cron via Jobs | Code in the app; the **app itself exposed as an MCP server** |
| **v0** | Prompt → v0 "autonomously decides how to implement AI features" → **Vercel Connect** OAuth → test → publish (**~4**) | Code only | AI SDK (eve / Workflow SDK code-first) | Preview | Via Vercel Connect (bots, scheduled agents) | Code in the Next.js app |
| **Emergent** | Custom agents (Pro): 5-part template (Persona, Task, Context, Workflow, Guidelines) → tools → sub-agents → save (**~4**). These are *builder* agents, not app agents | Template form | None | — | OpenClaw one-click: **Channels** tab (Telegram token, WhatsApp QR) | App agents are just generated Python |
| **Base44** | Dashboard → **Agents** → template or describe → **Guidelines** (instructions, ≤10 context files, model) → **Tools** (entity CRUD, functions, permissions) → memory scope → channel (**~6**) | In-editor Dashboard | Proprietary | — | **WhatsApp, Telegram, LINE**; Superagents with schedules, Goals, phone | Entity-level tool permissions inside the app |
| **Copilot Studio / Dify / Fleet / n8n** | Describe → clarifying questions → **staged draft** (Dify **Apply / Discard**) → connect accounts (Fleet: act as user vs agent) → **Preview** → set trigger → approvals → **Publish** (**~8–10**) | Card: Instructions, Model, Tools, Knowledge, Skills, Memory, Sub-agents, Triggers | Proprietary harnesses | **Build \| Preview \| Evaluate \| Monitor**; n8n Sessions (every tool call's I/O); approvals **Inbox** | Slack, Teams, email, schedule, webhook | Dify **Access Point** (web app / embed / API) + "which workflows consume it" |
| **LangGraph / ADK / Mastra (code)** | Scaffold → write the graph → `langgraph dev` → Studio (Graph mode, **time-travel**) → dataset → experiments → one-click deploy (**~6**) | IDE + Studio | Framework-native | Traces, evals, side-by-side experiments | Code | REST / MCP / A2A / **AG-UI** to a frontend |
| **Cursor / Claude Code / Codex** | Prompt the agent to write agent code in any framework; or SDK; Cursor `/automate`; Claude `.claude/agents/*.md` + `/agents` | Files | **Any** (just code) | Terminal | Automations / Routines (schedule, GitHub event, webhook, Slack) *for the coding agent* | Yours to wire |

**Friction:**
- no app builder combines **framework choice + traces + evals + an app binding**;
- Architect's Studio round-trip;
- raw knobs ("temperature") for business users;
- canvases that got "more technical than n8n";
- nobody imports existing agent code;
- silent agent failures;
- runaway cost ("$2,400 API bill from a single crew").

**Best-in-class moments:**
- Dify's **Apply/Discard** staged draft;
- CrewAI's **AI Thoughts** stream;
- Relevance's **eval gate on publish**;
- Fleet's **identity choice** and **Inbox**;
- n8n's **one agent, many surfaces**;
- Architect's own **agent table in the PRD** and automatic UI wiring.

**Ideal flow for Architect 2.0:** **Agents** tab → **New agent ▾** (*Describe · Template · Import code · Start in a framework*) → 2–4 questions → the **Agent Card** fills live (*What it does · Brain · Can use · Knows · Skills · Remembers · Team · Starts when · Must ask before · Limits*; the full anatomy is in §8 C5), with a **Card ⇄ Code** toggle over a real Lyzr / LangGraph / CrewAI / OpenAI Agents SDK / ADK / Mastra project → **Try it** chat with a step and cost trace → eval gate → **Publish** → the "**Used in app**" binding auto-wires screens through a typed output schema (AG-UI), with REST, MCP, A2A, Slack and schedule surfaces one toggle away.

---

## 5. Two audiences: non-technical users vs developers

> **Bottom line.** The market is converging from both ends.
> - **Builders for non-technical users are adding developer hooks.** Examples: Lovable's MCP server and REST API; v0's Git panel, terminal and repo import; Replit's full IDE under the agent; Architect's branches, env vars, MCP and GitAgent (v2.0.2–v2.2.0).
> - **Developer agents are reaching non-developers.** Cursor launched "Start from scratch" on Aug 27, 2026. About 20% of Codex users are non-developers, and that group is growing more than 3× faster than developers (secondary source).
>
> No product yet serves both audiences **in one project without a seam**. Every current approach picks one of three compromises: split products, export-out, or layered density. Each one breaks at the hand-off. Architect 2.0 should compete on removing that seam, not on adding a toggle.

### 5.1 Who the two audiences are

| Segment | Who, with evidence | Where they go today |
|---|---|---|
| **Non-technical: business builders** | Executives, consultants, ops, sales, HR and insurance teams, AI agencies. This is Architect's primary audience (the For Work menu; Accenture and KPMG as cited users) | Architect, Copilot Studio, LangSmith Fleet, Relevance |
| **Non-technical: founders and SMB operators** | Founders shipping an MVP: "blank page to a working, shareable web app in under an hour" (Lovable, NxCode); a working MVP "by Monday" for about $50 (v0, HN). Operators replacing spreadsheets: about **70% of Emergent users have no coding experience and about 40% are SMBs** (TechCrunch) | Lovable, Emergent, Rocket, Base44, Bolt |
| **Non-technical: PMs, designers, marketers** | Prototypes from PRDs, Figma files and tickets (v0 PRD guide, Lovable chat connectors); a Replit Gallery organised by role; Zillow's 600 Replit seats and 7,000+ apps | v0, Lovable, Replit |
| **Developers: engineers in existing repos** | "Delegate a well-scoped ticket and come back to a PR" (Codex, Claude Code). Cursor's user base is about 95%+ technical (inferred) | Cursor, Codex, Claude Code, Copilot, Devin Desktop |
| **Developers: technical founders who scaffold, then take over** | "Use Lovable for the prototype, then export to Cursor for the production version" (NxCode's "honest" path). Emergent users take over through GitHub or VS Code | Lovable → Cursor, Emergent → GitHub, Replit |
| **Developers: AI engineers building agents** | Control the loop, state and failure modes; see traces; ship the agent as a service. Framework fatigue: "8 months evaluating AutoGen, LangGraph, CrewAI, PydanticAI, Swarm, and Agno with no clear winner" (Reddit digest, secondary) | LangGraph + LangSmith, CrewAI, ADK, Mastra, OpenAI and Claude SDKs |
| **Mixed teams (the segment nobody owns)** | A founder plus a contract developer, or a PM plus an engineer. CrewAI Studio exists for "prototyping… before hand-off to developers", but its ZIP export is one-way. **Only Vellum claims true two-way visual↔code sync** (10-agent-builders) | Nothing serves them well; this is the whitespace |

### 5.2 The two profiles side by side

| Dimension | Non-technical user | Developer |
|---|---|---|
| **Core job** | "Turn my problem into something that works, today, without learning to code." Architect's AI Consultant starts from "I know my bottleneck, not the solution" | "Make the agent do the boring 80% while I keep ownership of the code, the architecture and production." |
| **Typical jobs (evidence)** | Idea → live URL (all builders). Automate a cross-tool workflow such as Apollo → HubSpot → Slack (Architect's 106 use-case pages). A demo plus spec or deck for stakeholders by Friday (Architect Artifacts, Rocket Solve). Replace a spreadsheet or email process (Emergent SMB report). Put an app in the App Store (Anything). Run "an agent I can text" (Base44 Superagents, Emergent Wingman) | Import a repo and keep working (Replit, v0). Parallel tasks without collisions (Codex and Claude worktrees). Keep CI green (Claude Auto-fix, `@codex fix`). Run a service 24/7 without DevOps (Replit Reserved VM). Build agents in a framework of their choice and expose them as REST, MCP or A2A (LangSmith, CrewAI AMP, Mastra). "Let me keep my code and leave if I want" (09-other) |
| **Biggest fears** | **Bill shock and getting stranded mid-build** ("I'll set a budget, but sometimes I end up stuck partway through", Emergent). **Breaking what already works** ("breaks previously working features", Replit Trustpilot). **Not knowing if it's really done** (false "fixed" claims at Lovable and Emergent). **Losing the app** (an Emergent app vanished with "no recovery option, no export, and no version history"). **Exposing customer data without knowing it** (Lovable CVE-2025-48757). **Feeling stupid** in a UI full of jargon | **Lock-in** (Replit `.replit` config, Base44's proprietary backend, v0's React-only output). **The agent silently making architecture decisions** ("The agent makes architecture decisions on its own", Emergent). **Losing code** (Cursor's reversion bug class; root cause unverified). **Unreviewed changes reaching prod** (Replit deleted SaaStr's production DB). **Opaque metering** (Cursor removed its dollar-cost graph). **Vendor and model risk** (OpenAI cutting Cursor off from Nov 12, 2026) |
| **Words they use** | page, screen, button, login, customers, "my data", link, publish, draft, undo, "make it look like…", "connect my Gmail" | repo, branch, PR, diff, commit, env var, migration, schema, RLS, CI, logs, trace, framework names, MCP, A2A, endpoint, SDK |
| **Words that alienate them** | branch, PR, env var, sandbox, worktree, RLS, JWT, temperature, `manifest.json`, raw app IDs. Architect's teardown: "Non-technical users see internals (raw app IDs, manifest.json, 'temperature')" [3P-hands-on] | Magic words with no inspectable meaning, such as "Your app is being optimised…". Hidden limits (v0's 24-hour sandboxes, preview-only Development env vars). Proprietary nouns (Emergent's E-1/E-1.5/E-2/E-3 tiers) |
| **What "control" means** | **Control of outcomes, not mechanics.** Choosing between options (Lovable's three design directions). Approving a plan in plain words (Replit's plan card, Emergent's clarify → approve). Pointing at the thing to change (visual edits). One-click undo. A budget cap. "Ask me before you send emails or spend money." | **Control of mechanics, at every layer.** Review each hunk (Cursor Keep/Undo, Zed multi-buffer). Choose the stack, framework and model. Run commands. Keep permissions and rules as files in git (`.cursor/`, AGENTS.md, CLAUDE.md). Work in a local loop (Base44 `base44 dev`). Eject. Steer mid-run (Codex, praised as "makes you wonder why nobody did it sooner") |
| **What "done" means** | A good-looking, working app at a shareable URL with real data, at the cost they expected | A merged PR with green CI, observable in production, reversible, portable |
| **Why they leave** | Credit burn and fix loops, which drive Trustpilot to 2.8 for Replit and Emergent and 1.5 for Bolt; no human support | Lock-in, a depth ceiling (no terminal, one branch, no import at Lovable), pricing churn (Cursor, Claude Code) |

### 5.3 What each audience needs at every stage, and how one UI can serve both

| Stage | Non-technical need | Developer need | How one UI serves both |
|---|---|---|---|
| **1. Start** | Start from a problem, a role example or a template. No auth wall before first value: Architect's home is a sign-in card while persona pages show a composer | Start from an existing repo, a zip, a competitor export or a framework template. Also from a CLI or an MCP client | **One composer with entry chips**: Describe · Import repo · From Lovable/Bolt/v0 · Figma/URL/screenshot · Build an agent. "What should I build?" (the AI Consultant) is a chip, not a gate. Import runs an **"Understand this project"** step (Lovable report; Claude `/init`) |
| **2. Prompting and planning** | Clarifying questions as tappable options, a plan in plain words, and visual choice of style (Lovable design directions; v0 answer chips; Emergent option cards) | An editable spec covering routes, data model, APIs and agents, plus stack and model choice. The plan should live as files (Kiro's `requirements.md` / `design.md` / `tasks.md`) | **One plan card**: What & why · Done looks like · Out of scope · Steps (Replit), plus agents and cost estimate. Buttons: **Build it / Build, let me approve changes / Keep planning** (Claude). "Open as files" reveals the Kiro-style docs in the repo. A **scope contract** shows "You asked for A, B, C → plan covers A, B; C deferred" (Architect idea; fixes silent scope cuts) |
| **3. Understanding progress** | Plain-language phases, an honest ETA, and proof that it works. The pain today: "a 20-minute black box with a carousel and a mini-game" (Architect [3P-hands-on]) | Tool calls, diffs, terminal output, a context meter (Cursor's context ring), mid-run steering | **One live timeline** with a density switch: **Story / Steps / Everything** (modelled on Claude Code's Normal / Thinking / Verbose views). Each phase card expands to diffs and logs. Status chips report **outcomes** ("Tests 12/12 passed", "Blocked: needs Stripe key") rather than infrastructure (Claude). Steer vs Queue for mid-run messages (Replit) |
| **4. Visual iteration** | "Point at it and say what to change". Small edits free and instant (Replit, Bolt and Base44 free visual edits; Lovable free text edits) | Know which component or file changed; precise props and design tokens (Cursor visual editor, v0 Design Mode layers) | **Click-to-select → @element chip** in the composer (Windsurf "Send element"). Deterministic free edits for text, colour and spacing. Every edit becomes a version with a diff. A **"View in code"** link jumps to file:line |
| **5. Errors and debugging** | A plain explanation, one **Fix** button, no charge for the AI's own mistakes, and a stop to loops | Stack traces, console, network, server logs, a way to reproduce, and root cause (Cursor Debug Mode) | An **error chip** ("1 error: Fix?", following Windsurf's auto console capture) with a plain-English summary. **Details** shows the trace and logs. After 2 failed attempts a **loop breaker** offers: roll back / try a deeper mode / explain the problem / ask a human (Replit, Lovable and v0 reports) |
| **6. Backend (DB, auth, storage)** | "Add login" just works, including inside the preview (Rocket's social login needs three dashboards and a deployed URL). No external dashboards. Honest data: Architect silently runs on sample data [3P-hands-on] | Schema, SQL, migrations, RLS policies, seeds, bring-your-own DB, separate dev and prod databases (Anything, Replit) | **Data tab**: a default "Tables · Users · Files" view with a **Sample data** badge wherever data is fake. One click opens SQL, migrations and policies. Managed Google sign-in works in preview, with BYO OAuth under Advanced. Dev and prod DBs are separate by default |
| **7. Integrations and secrets** | Connect through OAuth cards and never handle a key. Emergent users paste credentials into chat | Env vars per environment, MCP servers, custom REST connectors, secret scoping (v0 `NEXT_PUBLIC_` leak warnings) | **Inline Connect cards** in chat and a **secure-input card** whenever a key is needed. The Integrations tab shows per-environment values. `@mcp:` in the composer (Architect already has this). Architect's "never fake a tool" rule stays |
| **8. Agents** | Describe a job. Edit a card with "Can use / Must ask before / Limits". Test by chatting | Pick a framework; work in code with traces, evals and typed I/O; deploy as REST, MCP or A2A (LangGraph, Mastra, AgentCore) | **An Agent Card ⇄ Code mode on the same spec** (GitAgent/OpenGAP as source of truth). A **Try-it** chat whose messages expand into step timelines. Tabs **Build · Test · Evaluate · Monitor · Deploy** (Copilot Studio's tab set plus Deploy). No Studio round-trip |
| **9. Review and versions** | "Undo that" and "go back to yesterday", with thumbnails | Hunk-level diffs, a commit graph (missing in Codex, issue #30919), a branch per task | **One history**: checkpoint = commit = deploy, each with a thumbnail and a plain summary. **Diff** is on every item. Restore offers app+chat / app only / chat only, and says whether the **DB is included** |
| **10. GitHub** | Not required. The user only needs to hear "your work is saved safely" | Two-way sync, branch per chat, PRs, CI status, protected main (v0, Claude) | Use an **internal repo by default** and offer **Connect GitHub** as an upgrade: Codex and Claude cloud sessions are built around GitHub (only Claude's CLI can bundle a non-GitHub repo), which is a wall for non-developers. Git terms appear only once GitHub is connected or on hover ("Draft → Review → Live", from the v0 report) |
| **11. Deploy** | One Publish button, a custom-domain wizard, a readiness checklist in plain words, no surprises after launch | Dev, staging and prod environments; a preview URL per branch; build logs; rollback; export targets | A **Publish dialog with a pre-flight checklist**: security, tests, real data connected, secrets present. Environment tabs sit inside the dialog. A persistent **"3 changes not live"** badge (Replit idea). The deploy log is expandable. For developers, Publish can mean PR → merge → deploy (v0) |
| **12. Cost** | Know before spending, set a cap, and don't pay for AI errors | Token and context visibility, per-run and per-agent cost, BYO keys, model choice | An **estimate on the plan card**, a **live meter in the composer**, a **receipt** after each run (v0), and **per-agent and per-phase breakdowns** (Architect v2.2.0 already has these) under Usage |
| **13. Collaboration** | Share a link, comment on the screen, get sign-off | Roles, a branch per person, PR review, change attribution | Roles Owner / Editor / Reviewer / Viewer. **Comments pinned to the preview** are batched into the next agent prompt (Base44 "Send to chat", v0 Annotations). Each member keeps their own depth setting on the shared project |
| **14. After launch** | "Is anyone using it? Is it broken?" | Traces, errors, latency, alerts, and rolling back a suspect change (Cursor Rollouts) | A **Monitor tab** with plain KPIs and an error inbox, which expand to traces. It offers **"Roll back to v12"** when errors spike |

### 5.4 How today's platforms serve both audiences, and where they break

| Platform | Built for | How it serves the other audience | Where it breaks |
|---|---|---|---|
| **Replit** | Non-technical first by stated strategy ("the knowledge worker, that's where we think our market is"), with a real IDE underneath | **Layering.** A chat and canvas sit on top of Shell, file tree, Git, Workflows and SSH to VS Code or Cursor. "Agent on any framework" (Sep 2025). Separate dev and prod databases | Too dense for beginners: an "interface designed for developers, not first-time builders" (G2 summary). Too shallow for developers: Git is manual push/pull, there is no CI/CD and no Datadog hooks, and `.replit`, Secrets and ports create lock-in. The preview and the live app drift apart |
| **Lovable (code mode)** | Non-technical (the core audience) | A Code tab with file tree, search and Save-creates-version. Two-way Git sync with GitHub, GitLab and Bitbucket. An MCP server (40+ tools) and a REST API. AGENTS.md and SKILL.md | **Depth ceiling.** Code is read-only on Free. No terminal is documented (unverified). One active branch. **No repo import.** No staging. The developer path is to *leave*: prototype in Lovable, then "export to Cursor for the production version" |
| **v0** | Increasingly developers and teams; marketing still names founders, PMs and designers | **The best progressive disclosure seen.** A single **Publish** hides the branch → PR → merge → deploy pipeline, and a branch/status menu exposes the preview URL, diff, PR, CI and "Fix CI" for developers. A sandbox terminal with Claude Code pre-installed | **Developer vocabulary leaks into the non-technical path.** Base, working and production branches, CI checks, deployment policies, and split v0 and Vercel roles appear by default. DNS bounces users to the Vercel dashboard. Output is locked to React/Next.js on Vercel ("request Svelte… it spat out React") |
| **Emergent** | Non-technical and SMBs | Pro controls: 1M-token context, Ultra Thinking, **system-prompt editing** and custom agents. VS Code in the browser. Push to GitHub. MCP access from Claude Code and Codex | Criticised on both sides. For vibe coders it is too "code-centric" (LinkedIn critic). Developers get no diff review, no local dev and no DB UI, the agent picks the architecture, and credentials are pasted into chat |
| **Rocket** | Non-technical (the majority) | `/` commands (100+) and `@` file targeting; import and two-way sync for **Next.js TypeScript only**; APIs wired from Postman or OpenAPI specs | Developer features are narrow: no terminal, no tests, no agent frameworks, and the framework cannot change after creation. The "dev mode" is still "coming soon" (unverified if shipped) |
| **Cursor / Devin Desktop / Kiro** | Developers | Design Mode and a visual editor for designers. Cursor's "Start from scratch" (no repo → preview → publish to Vercel). Kiro's spec docs, which a non-developer can approve | "A strong AI coding tool, but only if you already know how to code" (G2). No managed backend or templates. Deploy needs a Vercel account. Devin's Kanban-first landing screen is "a bold choice" when work is "90% editing" |
| **Codex / Claude Code** | Developers | A growing non-developer minority. Plan approval cards and classifier-reviewed auto mode lower the skill floor | **GitHub is a de facto prerequisite** for cloud sessions (Claude's `--cloud` CLI flag can bundle a local repo). Unfamiliar vocabulary (sandbox, worktree, branch). Core features sit behind slash commands and key chords. **No hosting, DB or auth.** Both vendors *split* non-developers off into separate products (ChatGPT Work; Cowork) |
| **Architect (today)** | Non-technical: "The Agent Builder Platform for Business Executives & Consultants" | Developers are sent to **Agent Studio** ("where you go afterward to deepen and harden"), GitHub sync, env vars, MCP and GitAgent (beta) | **Fails both at once**: "Non-technical users see internals… Developers get no workspace" [3P-hands-on]. Editing an agent means leaving for Studio. No code editor, terminal, diff, logs or checkpoints in the UI (the 01 gap table lists 6 "Major" gaps) |
| **Agent builders** | Split: Fleet, Copilot Studio and Dify for makers; LangGraph, ADK and Mastra for engineers | Vellum syncs the visual graph and Python code both ways. Mastra's Agent Editor lets non-developers edit prompts and tools. The LangGraph + Fleet pair | Hand-off tools are mostly **one-way**: CrewAI's ZIP export breaks visual editing and versioning. Copilot harnesses are not transferable. OpenAI's canvas was killed after about 8 months |

**Three strategies, three seams:**

| Strategy | Who uses it | Where it breaks |
|---|---|---|
| **Split products** by audience | ChatGPT Work vs Codex; Cowork vs Claude Code; Architect vs Agent Studio; AI Studio vs Antigravity (Firebase Studio sunset) | Every hand-off is a context switch and often a one-way door. Architect's own teardown: "Editing an agent sends you to a separate product" |
| **Export-out** (prototype here, finish elsewhere) | Lovable → Cursor; Emergent → GitHub/VS Code; CrewAI Studio → ZIP | The platform loses the user at exactly the moment they become valuable. Changes made after export don't come back |
| **Layered density** (one product, depth underneath) | Replit, v0 | It works when disclosure is contextual (v0's Publish menu). It fails when the depth is always visible (Replit's IDE density) or leaks by default (v0's Git terms) |

**Takeaway:** only layering keeps one project. It succeeds only when **defaults differ by user and depth appears at the point of need**. The next section's principles follow from that.

### 5.5 Design principles for serving both audiences in one product without clutter

1. **One project, many lenses.** A single project holds the plan, agents, app, data, history and deploys. A founder and her developer open *the same* object. Lenses change how much you see, never what exists.
   - *Evidence:* the Studio round-trip (Architect), one-way exports (CrewAI, Lovable → Cursor) and split products (Codex/ChatGPT Work) each lose context at the seam.
   - *In the UI:* one set of workspace tabs for everyone (Plan · App · Agents · Data · Code · Launch · Insights; see §9.2). Code, Terminal and Review are panes inside the same workspace, not a separate product.
2. **Depth is a dial, not a fork.** The dial changes information density, not capability.
   - *How it's set:* one onboarding question ("Have you written code before?", from the Lovable report; v0 has no role-aware onboarding) sets defaults for:
     - transcript density (Story / Steps / Everything);
     - diff visibility;
     - whether the terminal is shown;
     - **auto-apply with easy undo** versus **stage-then-approve** (Cursor report).
   - *Persistence:* per user, overridable per project.
   - *Guarantee:* every developer surface is at most one click away for anyone.
3. **Open the hood where you stand.** Put a "show me how" affordance *on the object itself*, instead of making users hunt for a global toggle. Examples:
   - an activity card opens a Details drawer (Lovable);
   - Publish expands to PR and CI (v0);
   - a plan card opens as `requirements.md` (Kiro);
   - an agent card opens as LangGraph code;
   - an error chip opens the stack trace;
   - a "Sample data" badge opens the data source.

   This context-sensitive disclosure is the differentiator; a generic dual-mode toggle is not (see §5.6).
4. **Plain language by default, true names one hover away, and names that don't change.**
   - *Plain labels:* "Draft → Review → Live" backed by real branches and PRs (v0 report). **Ask / Plan / Build** with the technical mode name on hover (Codex/Claude report). "Creativity" rather than temperature; Fast / Balanced / Best rather than model IDs.
   - *Never shown to non-technical users by default:* raw IDs or `manifest.json`.
   - *Stable names:* Replit renamed its modes about 5 times in 12 months, Lovable swapped Agent/Build and Chat/Plan, and Emergent's E-tiers need YouTube explainers.
5. **Structured choices beat prompt engineering, for both audiences.** Clarifying questions render as chips with "Skip, use defaults". Offer three design directions. Plan cards have fixed actions. `/` commands and `@` mentions are a menu of possibilities for non-technical users and precision tools for developers (Rocket).
   - Ask only what's missing: a clarity gate scores the prompt first. Rocket was criticised for "endless follow-up questions".
   - Never auto-continue on money, data or deploy questions. Claude's 60-second auto-continue is the counter-example.
6. **Show outcomes, with proof.** Progress is phase cards plus outcome chips ("✓ Verified: login renders, 0 console errors"), backed by artifacts: screenshots, video replay (Replit App Testing) and test counts.
   - Developers expand any card to see tool calls and diffs.
   - "Done" is never claimed without evidence. The failures this prevents: Lovable "claim[ed] a bug was fixed three times in a row"; Emergent "claimed to have made changes that were not actually implemented".
7. **Money is a first-class UI element, for everyone.**
   - Show an estimate before the run, a meter during it and a receipt after.
   - Allow a per-task cap.
   - **Don't charge for regressions the agent caused.**
   - Show the cost multiplier *before* a parallel fan-out; Cursor Projects use about 5× the tokens.
   - Developers complain about this as loudly as non-technical users: Cursor's pricing reversals, Claude Code's "20x max usage gone in 19 minutes".
8. **Everything reversible; everything irreversible gated.**
   - Checkpoints restore code, DB, env and agent memory together (Replit), and restoring never destroys later versions (Rocket's rollback does).
   - These actions **always ask**, whatever the autonomy mode (Cursor report): dropping or migrating a prod DB, deleting data, publishing, sending email or SMS, spending money.
   - Dev and prod are separate by default. Replit only split them after its agent deleted SaaStr's production DB.
9. **Safe by default, configurable by exception.** Non-technical users cannot judge RLS, so the platform must.
   - Generate access policies with every table, and block publishing on critical findings with a plain-English "why this matters" (Lovable report).
   - Keys go in a vault through a secure-input card, never into chat (Emergent).
   - On import, don't run repo scripts until the user trusts the workspace (the Cursor `git.exe` 0-day).
   - Developers can override with an explicit acknowledgment, and keep policies as files (`.architect/permissions.json`, AGENTS.md).
10. **Escape hatches are features, not threats.** Developers trust a platform they can leave (the "let me keep my code and leave" job in the 09 report). Offer:
    - two-way GitHub as an upgrade, not a prerequisite;
    - a CLI (`architect pull / dev / deploy`);
    - an **Architect MCP server**, so Claude Code, Cursor or Codex can drive projects (as Lovable, v0 and Emergent already allow);
    - export that includes **backend and data** (Base44's proprietary backend is the anti-pattern);
    - BYO keys and a one-click "switch to my own keys" (Emergent's Universal Key creates hidden lock-in through `emergentintegrations`).
11. **Import is a peer of the prompt.** Show "Import repo / from Lovable, Bolt, v0 / zip / Figma / URL" beside the composer, not in the docs.
    - Import runs a **repo map**: detected stack and agents, routes, missing env vars, and a "what I can and can't do" report.
    - It honours existing `AGENTS.md`, `CLAUDE.md` and `.cursorrules` files.
    - *Evidence:* Lovable has no import at all. Rocket and Architect import Next.js only. Bolt, Dyad and Anything grow by importing competitors.
12. **Agents follow the same lifecycle as the app.** An agent is a *component of the app*: one spec, two editors (Agent Card and framework code) and one lifecycle (Build → Test → Evaluate → Monitor → Deploy) (10 report).
    - Simple-mode edits write back to code as a reviewed diff. Code-only constructs show on the card as locked "custom code" blocks.
    - An **Agent Map** shows which screen or API route calls which agent. No pure agent builder shows this.

### 5.6 Mode switch vs adaptive UI: the recommended position

| Option | Precedent | For | Against |
|---|---|---|---|
| **A. Separate products** | Codex vs ChatGPT Work; Claude Code vs Cowork; Architect vs Studio | Each UI stays clean | A seam at every hand-off. Mixed teams can't share a project. Architect's current weakness |
| **B. Global Simple ⇄ Pro toggle** | Proposed in the Replit, Lovable, Cursor and Emergent reports; common in candidate submissions | Easy to explain; one project | Users hunt for the toggle. Features disappear in Simple mode, so non-technical users never learn what exists. It is **the most-seen pattern** among the 10+ candidate repos, so it won't differentiate |
| **C. Fully adaptive** (the AI infers skill and reshapes the UI) | None observed | Zero configuration | Unpredictable. Layouts that move erode trust: Cursor's review controls moved around and drew bug reports; Claude desktop layouts failed to persist |
| **D. Recommended hybrid: a persisted depth preference plus contextual hood-openers** | v0's Publish/branch menu; Lovable's Details drawer; Claude's density switch | Predictable defaults set once. Depth appears on the object where it's needed. Every capability stays discoverable | Needs discipline: every plain-language object must have a mapped "true form" (file, diff, trace, log) |

**Recommendation: D.** Keep a small depth control ("Guided / Standard / Full detail") in the profile menu and the composer. Set it at onboarding and let it change *defaults* only: density, auto-apply vs review, visible panes. Pair it with hood-openers on every card, chip and dialog. The founder and the developer then share one URL, one history and one agent spec. Only what each of them sees expanded by default differs.

---

## 6. Market pain points

**Method.** Pain points are ranked by two things together:
- **breadth:** how many of the researched products have documented evidence of the pain, counting Architect, Replit, Lovable, Emergent, v0, Rocket, Cursor/Windsurf/Kiro, Codex/Claude Code, Bolt/Base44/AI Studio/Anything/Dyad and the agent builders;
- **severity:** money lost, work or data lost, or trust lost. Severity means *expected* harm: how often a typical user hits the pain × how bad it is. A rare catastrophe, such as a deleted production DB, therefore ranks below a common, costly pain such as a paid fix loop.

Evidence comes from the platform reports' pain-point sections, with their "(unverified)" and "[3P-hands-on]" markers kept. Where a count is given, it counts products with evidence, not individual complaints.

### 6.0 Ranking at a glance

| # | Pain point | Products with documented evidence | Severity | Architect 2.0 answer, in one line |
|---|---|---|---|---|
| 1 | **Credit burn and unpredictable pricing** | 14+ (every builder and every dev agent) | Critical | Estimate → live meter → receipt; caps; stable units |
| 2 | **Fix loops, and paying for the AI's own mistakes** | 10 | Critical | Loop breaker after 2 failures; free regression fixes |
| 3 | **Black-box progress and unverified "done" claims** | 8 (felt on every build) | High | Outcome timeline with proof artifacts; scope contract |
| 4 | **Lock-in, one-way doors and stack ceilings** | 12+ (felt later, mostly by developers) | High | Standard stacks; export including backend and data; framework as a generation target |
| 5 | **Security holes in generated apps (and platforms)** | 7 | Critical (10.3% of scanned Lovable apps) | Secure by construction; publish gate; secrets vault |
| 6 | **Preview ≠ production: deploy drift and failures** | 8 | High | Environments; drift badge; pre-flight checklist; visible pipeline |
| 7 | **Destructive actions and shallow version history** | 8 | Critical impact, rare | Whole-app checkpoints; always-ask guardrails; non-destructive restore |
| 8 | **Lost context on long projects** | 9 | High | Visible, editable Project Brief; context meter; rule chips |
| 9 | **One UI for two audiences serves neither** | 9 | High | §5 principles: depth dial plus hood-openers |
| 10 | **The agent layer is bolted on, split off or framework-locked** | 10+ | High (core to this brief) | One spec, two editors, one lifecycle; Agent Map |
| 11 | **Churn in pricing, mode names, UI and whole products** | 11+ | Medium–High | Stable names; What's-new panel; notice before breaking changes |
| 12 | **Slow generation, sleeping sandboxes, freezes** | 7 | Medium | Stream partial results; warm previews; background runs with notifications |
| 13 | **Support and billing recourse** | 7 | Medium–High | Human escalation; grounded helper; itemised credit history |
| 14 | **Integration and auth setup friction; silent fallbacks** | 5 | Medium | Inline Connect cards; managed auth in preview; Sample-data badges |
| 15 | **Weak mobile: native output and store publishing** | 6 | Medium | Honest scope; Expo target with QR preview; guided store wizard |
| 16 | **Weak collaboration** | 5 | Medium | Roles, presence, comments pinned to the preview → agent |

**Trust scoreboard.** Public ratings track billing and support complaints closely.

| Product | Rating | Top complaint theme |
|---|---|---|
| Bolt | Trustpilot **1.5/5** (202 reviews, 84% 1★) | Tokens spent on errors; bot-only support |
| Replit | Trustpilot **2.8/5** (1,549, 33% 1★); G2 4.5/5 | Billing |
| Emergent | Trustpilot **2.8/5** (626, 48% 1★ / 38% 5★) | Credits, refunds, AI-only support |
| Base44 | Trustpilot **2.8/5** (891) | Credit-draining loops, billing, account suspension |
| Lovable | Trustpilot **4.2/5** (1,730, 17% 1★) | Credit burn ("basically extortion") |
| Rocket | Trustpilot **4.5/5** (173, 74% 5★ / 14% 1★) | Credits on its own errors. Its named human support is the counterweight |

The 09 report's market signal is that **unit economics are a UX problem**. Mocha shut down on Aug 1, 2026, citing CAC, token costs and support costs, and Base44 was near break-even on gross margin. Vendors compensate with opaque credits, and users experience that opacity as distrust.

---

### 6.1 Credit burn and unpredictable pricing (rank 1)

**Evidence: who suffers it.**
- **Replit:** "$1k this week alone" against a usual $180–200 a month; "$70 in a night"; "$20 on one prompt" (The Register); $1,982 in 24 days (Softr). Cost is shown only *after* the fact, on hover, and charges are non-refundable even when the agent fails.
- **Lovable:** the #1 complaint across Trustpilot, Reddit and G2. Founders report four-figure monthly bills from failed fix loops (altar.io). When credits run out, **the production backend can pause**: pages stay live, but AI features and Cloud (DB, auth, storage) pause (Lovable docs).
- **Emergent:** the #1 complaint. "110 credits did not even last a day"; 2,150 → 10 credits in a day with the site "not even 20% done". No estimate before a task, and a gap from $20 straight to $200.
- **v0:** after agent mode, a badge colour change cost $0.39 instead of about $0.05; "$30USD on a single prompt"; Vercel said it "will not be reverting this change".
- **Rocket:** "3 sentences and need to upgrade"; a "retry tax" where "one stubborn feature can eat a week of allowance in an afternoon".
- **Bolt and Base44:** Bolt's 1.5/5 rating centres on token burn. Base44 has two confusing credit types and no rollover.
- **Developer tools are not immune:**
  - Cursor apologised for and refunded its June 2025 pricing change; Auto users saw "$110 usage against a $60 plan with 11 days remaining"; the dollar-cost graph was removed in Aug 2026.
  - Claude Code users posted "20x max usage gone in 19 minutes". On Sep 14, 2026 a temporary +50% weekly boost ended and a permanent +25% took its place: about 17% less than the summer allowance, though still 25% above the pre-May baseline. Users experienced it as a cut.
  - Windsurf's "33% price hike"; credit anxiety on Kiro.
- **Architect:** "No cost or time estimate before committing credits" [3P-hands-on]; credits drain during both build *and* runtime; G2: "token usage is quite a lot".
- **Agent builders:** an overnight "$2,400 API bill from a single crew" (CrewAI, secondary). Copilot's billing moved from "messages" to credits, so older benchmarks no longer compare.
- **Parallel runs multiply cost:** Cursor Projects use about 5× the tokens of a single agent; The Register's headline on Claude Projects was "work and pay in parallel".

**Best mitigations seen.**
- **Replit Free Mode** (Aug 2026, Core and Pro subscribers, 5-hour windows): "I haven't yet [found the outer limits]".
- **Lovable:** a live cost meter per message, credit check-ins, Plan mode at a flat 1 credit, and a free daily Chat allowance.
- **v0:** an end-of-run receipt and a per-event usage log with **FREE** tags.
- **Emergent:** a per-task budget cap.
- **Architect:** a per-agent and per-phase credit breakdown (v2.2.0).
- **Rocket:** per-editor credit caps and rollover.
- **n8n:** "one agent turn = one execution".

**Implication for Architect 2.0.**
- Show **cost at three moments**: an estimate range on the plan card; a live meter in the composer; a receipt on the completion card.
- Offer a **hard cap per task and per project**, with alerts at 50%, 80% and 100%, and a "Finish up / Add credits" choice instead of a silent stop.
- **Bill runtime separately from build**, so a deployed app never pauses because build credits ran out.
- Warn with a multiplier ("≈3× credits") before best-of-N or parallel runs.
- Keep one currency and publish worked cost examples.

### 6.2 Fix loops, and paying for the AI's own mistakes (rank 2)

**Evidence.**
- **Replit:** "The replit agent says it has fixed the issue but we're on build 8"; it "breaks previously working features" (Trustpilot); "fix loops that burn through credits" (Capterra).
- **Lovable:** a reviewer watched "the AI claim a bug was fixed three times in a row". Lovable's own docs warn that "repeated blind fixes tend to pile up code". A Trustpilot review cites "refusal to compensate for documented AI errors".
- **Emergent:** the same Google-login bug was billed "233+ times".
- **v0:** one user lost more than $70 and 16 hours in an error loop and could not revert cleanly; "20% of iteration spend went to corrections where v0 broke stuff".
- **Rocket:** "Constantly burns up credits fixing its own errors" (SourceForge).
- **Bolt:** 7–12M tokens lost in an afternoon, and 20M on a single auth issue.
- **Base44:** bug fixes cost 10–20 credits each.
- **Cursor:** agent loops that recreate the same files.
- **CrewAI:** a runaway retry loop.

**Best mitigations seen.**
- **Rocket:** free error fixing on paid plans, plus an Advisor agent that runs on Claude Opus.
- **Tempo:** up to 7 free "Fix with AI" attempts in a row.
- **v0:** free "Fix with v0", but only on *unedited* code.
- **Bolt v2:** claims 98% fewer error loops (vendor claim).
- **Cursor Debug Mode:** instrument → reproduce → fix → clean up.

**Implication.**
- Add a **loop breaker**. After 2 failed attempts on the same error:
  - stop;
  - show "Same error 3×" in plain words;
  - offer: roll back to the last working version / run a root-cause Plan in a deeper mode / explain the problem / ask a human.
- **Regressions the agent introduced are free.** Detect "fixing what I just broke" turns and tag them FREE on the receipt.
- A fix is not "done" until its test passes (see 6.3).

### 6.3 Black-box progress and unverified "done" claims (rank 3)

**Evidence.**
- **Architect:** "a 20-minute black box with a carousel and a mini-game" [3P-hands-on]. The plan silently drops requested scope [3P-hands-on].
- **Emergent:** deploys are a black box (its own post says "sit back and relax"). The AI "claimed to have made changes that were not actually implemented".
- **Lovable and Replit:** false "fixed" claims (see 6.2).
- **Cursor:** the "agents built a browser" demo "implied success without evidence"; the Cursor report also cites tests disabled to pass.
- **Rocket:** "stuck progress indicators… spinning indefinitely" (its own changelog).
- **Agent builders:** agents "silently returning nothing while appearing to succeed or hallucinating tool results" (secondary).
- **Claude:** its docs warn that a green routine run ≠ success.

**Best mitigations seen.**
- **Replit App Testing:** the agent drives a real browser, and the user gets a video replay and a take-over option.
- **v0:** self-test screenshots in chat, and "work details" per run.
- **Lovable:** activity cards with a Details drawer (Timeline and Changes).
- **Claude and Codex:** a live todo checklist.
- **Google Antigravity:** Artifacts (plans, screenshots, recordings) instead of raw logs.
- **CrewAI Studio:** a streaming "AI Thoughts" panel.
- **Rocket:** "Watch Rocket Work".

**Implication.**
- A **live build timeline** of phase cards: Plan → Data → APIs → Agents → Screens → Tests → Ready.
- An **honest ETA that recalibrates**.
- A **completion card that requires proof**: test counts, screenshots or video, build status.
- A **scope contract** at plan approval ("C deferred because…", with one-click include).
- For agents, **silent-failure detectors**: empty output, tool never called, repeated identical calls.

### 6.4 Lock-in, one-way doors and stack ceilings (rank 4)

**Evidence.**
- **Replit:** Secrets, the DB, `.replit` run commands and ports break on a move to Vercel or Railway, and ZIP export loses history.
- **Lovable:** no GitHub import; no Cloud ↔ Supabase migration; the Cloud region is permanent; one active branch.
- **v0:** React/Next.js only, with Vercel hosting assumed.
- **Emergent:** the Universal Key works through the `emergentintegrations` package and `EMERGENT_LLM_KEY`.
- **Rocket:** import and sync for Next.js TypeScript only, and the framework is fixed after creation.
- **Base44:** a proprietary backend ("migrating off requires rebuilding").
- **Architect:** Next.js + NoSQL + Lyzr agents only; import is Next.js only.
- **Agent layer:** CrewAI's one-way ZIP export; Copilot harnesses are not transferable; OpenAI's Agent Builder was deprecated after about 8 months ("the durable layer was the code-level SDK, not the visual builder").
- **Platform and vendor risk:** Firebase Studio lived about 11 months. OpenAI cuts Cursor's model access on Nov 12, 2026. Anything was removed from the App Store twice.

**Best mitigations seen.**
- **v0:** "Vercel doesn't own the code", plus a branch per chat.
- **Leap:** deploys to your own AWS or GCP.
- **Dyad:** local-first, bring your own key, or use an existing ChatGPT or Claude subscription.
- **AI Studio:** export to Antigravity that keeps history and secrets.
- **Windsurf:** a claim URL that moves the deployed site to the user's Netlify account.
- **Lovable, v0 and Emergent:** MCP servers.
- **Architect:** GitAgent/OpenGAP export to several frameworks.

**Implication.**
- Keep a great default stack, but allow overrides.
- Export includes **backend, schema and data**.
- Offer "Eject to GitHub + Vercel/Render".
- Treat the framework as a **generation target** from the shared agent spec, and say explicitly when custom code makes it non-convertible.
- **Flag one-way doors at the moment of choice** (region, backend provider).
- Stay model-agnostic and disclose which base models are used. Cursor's Composer 2 was based on Kimi K2.5, which users discovered themselves.

### 6.5 Security holes in generated apps, and in the platforms (rank 5)

**Evidence.**
- **Lovable:** CVE-2025-48757, where weak or missing RLS exposed data in **170 of 1,645 scanned apps (10.3%)**. A Feb 2026 HN story covers a Lovable-hosted app that exposed about 18K users because of **inverted auth logic**. altar.io reports an April 2026 exposure lasting about 48 days (unverified).
- **Emergent:** no built-in scanner, per a third-party scanner vendor with a commercial interest. The common problems it cites are Supabase without RLS, **API keys in client code** and unprotected endpoints. Users also paste credentials into chat.
- **Rocket:** offers only a copy-paste audit prompt.
- **Architect:** no security scan (01 gap table).
- **v0:** claims security analysis but shows no report. Vercel had React2Shell (Dec 2025) and an April 2026 OAuth / env-var incident.
- **Platform-level holes:** Cursor's Windows `git.exe` 0-day, with workspace trust off by default. Codex's malicious branch names could inject commands (patched Mar 2026).

**Best mitigations seen.**
- **Lovable:** an automatic Quick scan at publish, a Deep scan, Wiz and Aikido pen-testing, and a Trust Center.
- **Replit:** scan levels L1–L3, including black-box pen tests, and a Security Center with "Fix with Agent".
- **Base44:** a Production Pack (Verification, Testing Agent, Security Scan) on every plan.
- **Bolt:** token-free audits, and leaked-password protection on by default.
- **v0:** `NEXT_PUBLIC_` leak warnings.
- **Claude:** a credential proxy that keeps secrets out of the sandbox.

**Implication.**
- **Secure by construction, not scan-after.** Generate an access policy with every table, add auth to routes by default, and keep server keys server-side.
- A **publish gate**: critical findings block publishing for guided users. Each finding comes in plain English with a Fix button, and developers can override with an acknowledgment.
- A secrets vault with a secure-input card.
- **Workspace trust on import.**
- A "launch readiness" score in the Publish dialog.

### 6.6 Preview ≠ production: deploy drift and failures (rank 6)

**Evidence.**
- **Replit:** the published app is a separate copy that needs Republish; production secrets must be re-entered; the filesystem resets on publish; there is a 5-second health check; the server must bind to 0.0.0.0.
- **Emergent:** deploy success was about 85% before Super Deployer (Jul 2026) raised it to about 99%. Users were confused about whether the 50-credit deploy fee is monthly or one-time.
- **Lovable:** no staging; Drafts share the production DB; reverting a version doesn't touch data.
- **v0:** the preview sees only Development env vars; old versions must be restored before deploying; DNS sends users out to the Vercel dashboard.
- **Rocket:** social login works only on the deployed URL; APK build failures.
- **Architect:** a single deploy with one env-var list; auto-redeploy was reverted in v2.0.1.
- **Windsurf and Cursor:** Windsurf's App Deploys are meant for previews, not production; Cursor needs a Vercel account.

**Best mitigations seen.**
- **v0:** preview deployments per branch, and Publish = PR → merge → deploy.
- **Emergent:** Deploy engine V3 (blue-green, immutable runs).
- **Replit:** separate dev and prod databases.
- **Anything:** schema-only migration on publish.
- **Rocket:** staging and production.
- **Cursor Rollouts:** monitors errors after deploy.

**Implication.**
- Environments **Draft → Staging → Production**, with a preview URL per draft or branch. Each environment has its own env vars and DB, and a **Promote** action shows a draft-vs-production diff of code, schema and secrets.
- A persistent **"N changes not live"** badge.
- A pre-flight check for missing prod secrets and a failing health check.
- A **visible deploy pipeline**: build → DB → secrets → health → traffic.
- One-click rollback.

### 6.7 Destructive actions and shallow version history (rank 7)

**Evidence.**
- **Replit:** the agent deleted SaaStr's production DB during a code freeze and fabricated data (Jul 2025). The CEO called it "Unacceptable and should never be possible".
- **Rocket:** rollback wipes all later versions; deleting a task is permanent; making a task public reveals its whole history.
- **Lovable:** code-only revert; Drafts share the prod DB.
- **v0:** manual code edits don't create versions, and restore is linear.
- **Claude Code:** Bash-made changes and most subagent edits can't be rewound.
- **Cursor:** a reported code-reversion data-loss bug class (root cause unverified).
- **Emergent:** an app disappeared after an outage with "no recovery option, no export, and no version history".
- **Architect:** no checkpoints or deploy history in the UI, only auto-commits.

**Best mitigations seen.**
- **Replit:** rollback of code + DB + agent memory, with a dialog listing exactly what will revert, and a dev/prod split.
- **Claude:** Auto mode caught **89% of harmful actions vs 13.6% for humans**, who approved 97% of prompts reflexively.
- **Cursor:** hardcoded guardrails.
- **Base44 and Bolt:** trash with 30-day restore.

**Implication.**
- **Checkpoints capture the whole sandbox**: files, including shell changes, plus DB, env and agent memory. Restore is non-destructive: it creates a new version.
- **Always-ask actions** that no autonomy mode can bypass.
- A "code freeze" is an enforced setting, not a prompt instruction.
- Soft-delete everywhere.

### 6.8 Lost context on long projects (rank 8)

**Evidence.**
- **Replit:** "Almost zero context between agent sessions", which leads to contradictory decisions (StackBuilt).
- **Emergent:** forking "loses context, disconnects databases".
- **Codex:** "ran out of room in the model's context window".
- **Cursor:** forum threads on "crashes, loops, lost context".
- **Claude:** context compaction can drop user boundaries such as "don't deploy until I review".
- **v0:** hidden context costs.
- **Architect:** the PRD did not persist and Studio edits were overwritten (both fixed in v2.0.1–v2.2.0).
- **Agent builders:** n8n Simple Memory is volatile, and teams "wasted weeks debugging 'memory loss'". Gemini Memory Bank is off by default.

**Best mitigations seen.**
- **Codex and Claude:** AGENTS.md and CLAUDE.md with layered scopes and auto-memory.
- **Cursor:** a context ring with a breakdown tray.
- **Windsurf:** automatic Memories of architecture decisions.
- **Kiro:** steering files.
- **Replit and Lovable:** Replit Memories and replit.md; Lovable Knowledge.
- **Rocket 1.0:** cross-task context.
- **Emergent:** forking at least admits the limit honestly.

**Implication.**
- A **Project Brief panel** covering stack, decisions, conventions and design tokens. The agent reads and updates it, the user can edit it, and it is stored as AGENTS.md in the repo.
- **Rule chips** on a thread that survive compaction.
- A **context meter** for developers.
- Invisible auto-compaction for guided users.
- Agent memory is on by default, with visible retention settings.

### 6.9 One UI for two audiences serves neither (rank 9)

**Evidence.**
- **Replit:** too developer-first for beginners (G2).
- **v0:** growing Git and CI vocabulary for non-technical users.
- **Architect:** exposes internals to non-technical users, while developers get no workspace [3P-hands-on].
- **Emergent:** "code-centric" for vibe coders, yet too shallow for developers.
- **Lovable:** 10+ tools buried under **More**.
- **Cursor and Devin:** Cursor needs coding knowledge (G2); Cursor 3's agent-first redesign alienated IDE purists ("This view makes you lose any connection to your code"); Devin Desktop opens on a Kanban.
- **Codex and Claude:** a GitHub prerequisite and slash-command-only affordances.
- **Kiro:** spec overhead on small edits.

**Best mitigations seen.**
- **v0:** a single Publish over a branch menu.
- **Lovable:** a Details drawer.
- **Claude Code:** Normal / Thinking / Verbose transcript views.
- **Kiro:** Quick Spec to skip the gates.
- **Cursor:** Auto-review permissions, replacing "Ask Every Time" fatigue.

**Implication:** see §5.5 and §5.6 (depth dial plus hood-openers, plain language, stable names).

### 6.10 The agent layer is bolted on, split off or framework-locked (rank 10)

**Evidence.**
- **Architect:** "Editing an agent sends you to a separate product (Lyzr Studio)" [3P-hands-on]. Custom tools, guardrails and simulations are Studio-only, and the guidance is "Aim for 4–5 agents maximum".
- **Lovable:** agent building is spread across AI features, edge functions, connectors and MCP.
- **v0:** no visual agent builder.
- **Rocket and Cursor:** no agent builder at all.
- **Emergent:** "custom agents" are only personas for its own builder.
- **Replit:** its agent story moved from an "Agents & Automations" app type to Routines.
- **Base44:** proprietary agents.
- **Agent builders:** framework fatigue; one-way exports; a reliability ceiling where agents work "about 80% of the time" and more than 3–5 tools lowers reliability (secondary); volatile memory; MCP integrations "limiting and buggy" in OpenAI's Agent Builder.

**Best mitigations seen.**
- **Copilot Studio:** its harness tab set.
- **Vellum:** two-way graph ↔ code sync.
- **LangSmith:** traces and evals.
- **Relevance:** evals that block publishing.
- **n8n:** "define once, use anywhere".
- **Fleet and Gemini:** approval inboxes.
- **AgentCore:** framework-agnostic hosting.

**Implication.**
- Bring the whole Studio depth *into* the Agents tab.
- Use one spec (GitAgent/OpenGAP), two editors and the Build · Test · Evaluate · Monitor · Deploy lifecycle.
- Trace every framework the same way over OpenTelemetry.
- An **Agent Map** binding screens and routes to agents.
- Per-run budget and step limits on by default.

### 6.11 Churn in pricing, mode names, UI and whole products (rank 11)

**Evidence.**
- **Replit:** mode names changed about 5 times in 12 months, and its own pages contradict each other on credits and rollover.
- **Lovable:** Agent → Build, Chat → Plan, then a new Chat mode.
- **Emergent:** E-1 → E-3 naming needs YouTube explainers.
- **v0:** model choice removed, then restored, and a "will not revert" pricing message.
- **Cursor:** three pricing changes in about 14 months (Jun 2025–Aug 2026).
- **Claude Code:** a billing split announced, then cancelled; an undocumented 60-second auto-continue; Ultraplan shipped, then removed.
- **Codex:** the web Ask button removed, then restored.
- **Windsurf:** Cascade reached end of life on a four-week window.
- **Whole products killed:** OpenAI's Agent Builder (about 8 months) and Firebase Studio (about 11 months).
- **Rocket:** plans restructured three times in about a year.
- **Architect:** docs contradict the product (Free credits; stale model names); "Soon" chips on core surfaces; the tab still says "Beta".

**Best mitigation seen:** almost none. Cursor's refund and apology after the June 2025 change is the only corrective example.

**Implication.**
- Human, outcome-based names (**Ask / Plan / Build**; **Fast / Balanced / Best**) kept stable.
- An in-app **What's new** panel.
- Breaking changes behind toggles, with notice.
- No "Soon" chips on core surfaces. Ship fewer things, completely.

### 6.12 Slow generation, sleeping sandboxes and freezes (rank 12)

**Evidence.**
- **Architect:** "4–6 min" became about 20 [3P-hands-on].
- **Emergent:** about 10 minutes for a first build and about 5 for a minor visual change (before Visual Edits). The preview times out after 30 minutes, and "Wake Up Agent" waits can reach 15 minutes.
- **Rocket:** the agent sleeps after 10–15 minutes idle, "freezing mid-generation" was reported, and Stop is disabled during generation.
- **v0:** agent-mode runs take 5–10+ minutes.
- **Cursor:** 20+ GB of RAM across helper processes.
- **Tempo:** "laggy and stuck".
- **Replit:** cut first builds from 15–20 minutes to 3–5 with Fast Build (Dec 2025). The fix exists.

**Best mitigations seen.**
- **v0:** shows the last good preview while the sandbox boots.
- **Lovable:** design directions as fast HTML previews before any code.
- **Bolt:** WebContainers give near-instant boot.
- **Codex and Claude:** background runs with notifications.
- **Anything Max:** makes about 30-minute runs acceptable by being openly autonomous.

**Implication.**
- Stream the UI as it gets built, starting with a skeleton screen within seconds.
- Keep previews warm while the tab is open.
- **Stop is always available** and keeps completed work.
- Offer "Notify me when done" (push, email or Slack), and let users keep planning or chatting while a build runs.

### 6.13 Support and billing recourse (rank 13)

**Evidence.**
- **Replit:** email support takes about 18 hours, and Trustpilot has "over a week to respond" complaints.
- **Lovable:** "After 30+ hours, no response from support".
- **Emergent:** a no-refund stance, AI-only first-line support, and one escalation to AFCA.
- **Bolt:** bot-only support.
- **Base44:** an account suspension with no way to recover the app.
- **Cursor:** its AI support bot "Sam" **invented a login policy**, which caused cancellations (HN, 1,511 points).
- **v0:** access removed after cancelling.

**Best mitigations seen.**
- **Rocket:** named human agents replying "in under 10 minutes", and credits restored during a personal crisis. This is a large part of its 4.5/5.
- **Emergent:** human help on Discord.
- **Tempo Agent+:** paid human engineers.

**Implication.**
- A visible **human escalation path**.
- An always-on helper grounded in the docs *with read access to the project state* (the improvement on Emergent's Emmy).
- An itemised credit history per task ("what did I pay for").
- Easy cancellation.

### 6.14 Integration and auth setup friction; silent fallbacks (rank 14)

**Evidence.**
- **Rocket:** social login needs three dashboards and cannot be tested in preview, and most troubleshooting entries are about Supabase RLS/JWT, Stripe webhooks and env vars.
- **Emergent:** credentials pasted into chat.
- **Architect:** apps run on **sample data** when an integration isn't connected, with no warning [3P-hands-on]; the guidance is "Always test integrations in Studio".
- **Replit:** production secrets must be re-entered.
- **OpenAI Agent Builder:** a Zapier MCP integration failed repeatedly.

**Best mitigations seen.**
- **Lovable:** Google sign-in "Managed by Lovable", and a clear taxonomy of build-time, app and end-user connectors.
- **v0:** an in-chat Integration Wizard and claimable Stripe test sandboxes.
- **Replit:** sign in to a connector once and reuse it everywhere, plus a smart provider picker.
- **Architect:** the Connect → scopes → Allow flow and the "never fake a tool" rule.

**Implication.**
- Inline Connect cards.
- Managed auth that works in preview.
- **Sample-data badges plus a "Connect real data" checklist** that warns or blocks at publish.
- Test and live mode clearly labelled (for example Stripe test vs live).

### 6.15 Weak mobile: native output and store publishing (rank 15)

**Evidence.**
- **Web-only output:** Lovable and v0 build web apps only, even from their mobile apps.
- **Emergent:** its "native gap" means store submission still needs EAS and developer accounts despite "publish directly" marketing. Its claim that 80–90% of projects involve mobile is unverified.
- **Rocket:** persistent APK build failures, no downloadable iOS IPA, and a 3.2★ companion app described as a web wrapper. About 45% of its builds are mobile (TechCrunch).
- **Bolt:** mobile publishing depends on the EAS CLI.
- **Anything:** removed from the App Store twice (Mar–Apr 2026), a platform risk for on-phone builders.

**Best mitigations seen.**
- **Anything:** in-browser App Store build, signing and TestFlight.
- **AI Studio:** native Android, an in-browser emulator and the Play internal test track.
- **Lovable:** a 4.8★ builder app.
- **Emergent:** building from the phone.

**Implication.**
- Be honest about scope.
- If mobile is offered, use an Expo target sharing the same backend, a QR-code device preview and a **guided store wizard** (accounts checklist, icons, privacy policy).
- Keep the builder usable on a phone for review, approvals and small edits, which is where phone approvals (Codex, Claude) add value.

### 6.16 Weak collaboration (rank 16)

**Evidence.**
- **Architect:** one access level, with no fork, roles, comments, presence or change attribution.
- **v0:** no real-time co-editing; its docs recommend "View and Duplicate".
- **Emergent:** pooled credits with per-member limits are enterprise-only.
- **Codex:** thread pile-up and projects that look like threads.
- **Rocket:** making a private task public exposes its entire history.

**Best mitigations seen.**
- **Replit:** multi-user work on a Kanban ("a significant milestone for enterprises", SMFL).
- **Bolt:** real-time multiplayer, with an avatar per queued prompt.
- **Base44:** a multiplayer canvas with sticky notes that have "Send to chat".
- **Lovable:** unlimited members sharing one credit pool.
- **Fleet:** Can clone / Can run / Can edit permissions.
- **Claude:** shareable session pages.

**Implication.**
- Roles, presence and an activity feed with attribution.
- **Comments pinned to preview elements or PRD lines that batch into the agent prompt**.
- Fork and remix.
- Read-only "walkthrough" pages for stakeholders without an account.
- Per-member credit caps.

---

### 6.17 Root causes → design bets

The 16 pain points reduce to three root causes. Each maps to one design bet for Architect 2.0. §8.1 splits them into five finer root causes, and §8.2 turns the bets into concepts C1–C15.

| Root cause | Pain points | Design bet |
|---|---|---|
| **Opaque economics:** the vendor's cost structure leaks into the user's experience as surprise | 1, 2, 11, 13 | **Transparent economics.** Estimate, meter, receipt; caps; free regression fixes; stable units and names; human recourse |
| **Unverifiable autonomy:** the agent acts faster than the user can check it | 3, 5, 7, 8, 10 | **Verifiable autonomy.** Proof artifacts; outcome chips; whole-app checkpoints; always-ask guardrails; secure-by-construction; a visible Project Brief; agent traces and evals |
| **Seams:** a context break between preview and prod, between products, or between audiences | 4, 6, 9, 12, 14, 15, 16 | **Seamless depth.** One project with many lenses; environments with promotion; import and export as peers of the prompt; hood-openers everywhere; collaboration on the same object |

---

## 7. The current Architect (architect.new): full feature inventory and developer gaps

> **Scope and evidence.** This section covers the product that exists today at https://architect.new, as of **2026-09-26**. It draws on the full platform report (`platforms/01-architect-new.md`) and the Lyzr Agent Studio parts of `platforms/10-agent-builder-platforms.md`. The builder was **not** used logged-in. Builder screens are reconstructed from official docs, official tutorials and one third-party teardown, and each claim carries its label.
>
> **Source tags used in this section**
> - **D** = official Architect docs (docs.architect.new, page slug given)
> - **CL x.y.z** = Architect changelog entry
> - **O** = observed on the public, logged-out site on 2026-09-26
> - **T** = official Lyzr tutorial on tella.tv, Apr–May 2026. These pre-date the June 2026 UI rebuild, so labels may have changed.
> - **L** = Lyzr platform or Agent Studio docs (docs.lyzr.ai)
> - **3P** = the one public hands-on teardown of the real product (github.com/shambhu-10/lyzr), a single user
> - **P** = press, Product Hunt or funding coverage
> - **(unverified)** = kept exactly as in the source reports

---

### 7.1 What it is, who built it, where it sits

| Item | Fact | Source |
|---|---|---|
| **Maker** | **Lyzr AI** (Lyzr Inc.). HQ in Jersey City, NJ, with engineering in Bengaluru. Founded in 2023 by Siva Surendira (CEO) and Anirudh Narayan. The architect.new header shows the Lyzr logo, and the footer links to Lyzr's legal pages. | P (TechCrunch, TNW); O |
| **Product name** | "Lyzr Architect" in the docs. The browser tab still reads **"Architect Beta"**. | D introduction; O |
| **What it is** | An **enterprise "Text-to-App" / agentic vibe-coding builder**. One prompt produces three layers: **(1) Plan** (PRD, mockup, workflow diagram, skill files, PDF/PPT); **(2) Agents** (real Lyzr Agent Studio agents with tools, a knowledge base (KB) and guardrails); **(3) App** (Next.js/React, an auto-provisioned NoSQL DB (MongoDB per the tutorial) and email/password auth, hosted on a Lyzr subdomain). | D build-guide, database-auth; T |
| **Positioning lines** | "The Agent Builder Platform for Business Executives & Consultants" (landing subtitle). "Democratize agent building for non-technical users" (/enterprise). Maker framing on Product Hunt: "What if N8N and Lovable have a baby". Docs: "No black boxes"; "No environments, API keys, or framework decisions to make". | O; P; D why-architect |
| **Core differentiator** | **Agent-first, not app-first.** It designs a multi-agent system (manager plus sub-agents, tools, RAG, memory, guardrails) *before* wrapping it in UI, and **plans before it codes**. Lovable, Bolt and v0 generate an app and leave "the AI part" to the user. | D why-architect, planning-brainstorming |
| **Stack underneath** | **Agent Framework** (runtime; Python/TS ADK; REST) → **Agent Studio** (builder, form plus Conversational Builder; every agent is an OpenAPI 3.1 REST endpoint with gRPC stubs) → **Architect** (application layer). Siblings: **OpenController** (agent-spend control plane, launched 2026-09-16), Agentic OS, Sovereign AI. Open source: **OpenGAP/GitAgent**, Cognis memory. | L architecture; report 10 §1 |
| **Primary users** | Non-technical: executives, consultants, ops, sales, marketing, HR, insurance underwriters, AI agencies (the For Work menu). Named enterprise users: Accenture (also an investor) and KPMG. Target sectors: banking, insurance, consulting. | O; P (SiliconANGLE) |
| **Developers today** | Pushed to **Studio**: "Studio is where you go afterward to deepen and harden the intelligence". Inside Architect, developers get GitHub sync, Next.js repo import, env vars, MCP, GitAgent and code export. | D architect-vs-studio, faqs |
| **Stated non-goals** | Not for "pure static websites", "simple CRUD apps with no AI component" or "heavy real-time multiplayer apps". | D best-use-cases |
| **Version / latest release** | **v2.2.0 (2026-08-07) is still the latest on 2026-09-26.** Releases: v2.0.0 (06-18, UI rebuilt from scratch, Planning mode, themes) → v2.0.1 (06-25) → v2.0.2 (07-02) → v2.1.0 (07-27) → v2.2.0 (08-07). That is **5 releases in 7 weeks, then 7 weeks with no changelog entry.** | CL |
| **Launch history** | LinkedIn launch 2025-10-30 ("world's first true agentic app builder"). SiliconANGLE exclusive 2026-02-06. Press release 2026-02-16 ("first enterprise-grade text-to-agent platform"). **Product Hunt #3 Product of the Day, 2026-02-20.** | P |
| **Company scale** | ARR of about $12M in June 2026, up from about $3.5M in Feb 2026, with a 95% gross margin (unverified, secondary source). Funding: $8M Series A (late 2025); $14.5M at a $250M valuation (Mar 2026, led by Accenture); **$100M Series B at about $500M** (announced 2026-07-09), with investor outreach "run" by its own agent (SivaClaw) and about $400M of reported demand. TNW notes the $100M and $500M figures are **company-reported, with no named lead investor confirmed** (critic-verified). Press describes Lyzr as Bengaluru-based; its registered HQ is Jersey City. | P (TNW, TechCrunch, Bloomberg) |

**Two framing traps for the deliverable**
- **Name collision.** The live product already ships **v2.0.0–v2.2.0**, so "Architect 2.0" in the assignment is ambiguous. Use a codename, or say "the next Architect".
- **Crowded design space.** At least **10 public "Architect 2.0" take-home repos** exist (for example HeyImAnuj/architect-2, eppisai/architect-2, shivamATpaytm/Architect-2.0). They converge on the same ideas: dual "lenses", chat-left/preview-right, a framework dropdown, repo-import analysis. Parity is table stakes, so differentiation has to come from **flow quality and fixes for the evidenced pain points in 7.5**. (Report 01 §0.)

---

### 7.2 Exhaustive feature checklist (the parity floor for 2.0)

Every row is something Architect ships today, or ships through Studio for the same account. **2.0 must keep all of them.** IDs are stable, so later sections can cite them (for example "keeps F31").

#### A. Public entry, marketing surfaces, builder auth

| ID | Area | Feature | Details | Source |
|---|---|---|---|---|
| F01 | Auth | **Home page = sign-in card** | "Sign in to start building with Architect." **Continue with Google** (black pill) / OR / **Continue with Email** (ghost). A "Connect with [Gmail, Slack, Teams, Notion, GitHub, HubSpot…] And many more" logo row sits below. | O |
| F02 | Auth | **Auto-created Lyzr Studio account** | Sign-up creates one Lyzr profile, **one credit pool** and one project store, shared by Architect and Studio. | D prerequisites, plans-credits |
| F03 | Auth | Enterprise SSO/SAML | Available at Lyzr platform level. | L intro |
| F04 | Marketing | Top nav | Lyzr logo with a **mascot** avatar (yellow hard hat); a Product Hunt "#3 Product of the Day" badge; **How it works**; **Pricing** (opens a modal); **For Work ▾**; **Get started for free**; a **light/dark toggle**. Footer: Privacy, Security, Terms, Anti Slavery Policy. | O |
| F05 | Marketing | Scroll demo | A 3-step stepper, **01 Plan Mode · 02 Agentic Layer · 03 Production App**. It shows a ticking build checklist, then an orchestration graph (Input: Chat/Voice/Schedule → Manager + sub-agents → integrations → Dashboard, with a feedback loop), then an app frame with KPI cards and an "Agent Interface" chat. The "What is Architect?" video follows. | O |
| F06 | Marketing | **Persona pages** `/for/<persona>` | The For Work menu lists Enterprise, AI Agencies, Analysts, Sales Teams, Marketing Teams, Insurance Underwriters and HR Teams. Each page opens on a **prompt box before sign-in** (typewriter placeholder, paperclip, mic, send) with **3 suggestion cards** and **Browse Prompt Library**. | O |
| F07 | Marketing | **/enterprise page** | A hero prompt box: "State your problem or the agent description that you want to build." Also **Explore admin dashboard**, **Request a demo**, cards (RBAC & Policies; Safe & Responsible AI; Audit logs & observability), mock dashboards, and an "Enterprise controls, end-to-end" checklist. | O |
| F08 | Learning | **/resources hub** and community | **106 use-case pages** (Sales, Marketing, Operations, Support, Engineering, Finance, HR, AI Infrastructure, Voice AI, Outreach, CRM) and **19 tutorials**. lyzr.ai also runs a gallery of named agents (Jazon AI SDR, Skott AI Marketer, Diane AI HR…). The tutorials include a **credit-saving** one ("Optimize Architect credits with better prompts"). Events: Lyzr Agentathon, 2026-04-25, Bengaluru (₹2 lakh prizes; judged on orchestration complexity, technical execution, business impact/ROI and UX); all builds on Architect. | O; lyzr.ai/architect; devpost; tella.tv |
| F09 | Onboarding | Prep guidance ("5-minute rule") | Write down Who, What (input) and Outcome before starting. Prompt formula: Who / What / Vibe / Success criteria. "You do **not** need to tell Architect which agents to create." Name tools and MCPs up front. | D prerequisites, build-guide, best-practices |

#### B. Logged-in home, idea generation, templates

| ID | Area | Feature | Details | Source |
|---|---|---|---|---|
| F10 | Home | Left sidebar | **What should I build?**, **Prompt Library**, **My Projects** (the docs also say "My Apps"), **Shared Projects**, **Usage**, **Agent Studio** (opens Studio), and **Help & Support** pinned bottom-left. 3P counts **17 items, 10 of them learning content**. Where the Marketplace link sits is (unverified). | D; 3P |
| F11 | Home | Centre composer | A prompt box with the **+** menu (F17–F20). | D |
| F12 | Home | **My Projects** cards | **Auto-refreshing screenshot thumbnails**, **Open**, and a **share icon**. 3P: "projects open in a modal". | D share-app; 3P |
| F13 | Ideas | **AI Consultant, "What should I build?"** | Steps: About you (pre-filled) → Role (analyst, PM, sales, marketing, solution architect, student, HR, custom) → Time-sinks → Tools used → Goals & challenges. The docs list 4 steps; the tutorial shows 5. Buttons: **Continue**, **Update and Explore**, **Build This**. Output: **3 proposal cards** with capabilities, integrations and **hours saved per week** ("Lead Nurturing Agent – Save 15 hrs/week"), in a "Tailored App Ideas" panel. **Build This** goes straight to the PRD. | D ai-consultant; T |
| F14 | Templates | **Prompt Library** | Categories include Sales & Marketing, Operations, Product & Engineering, HR, Finance, Legal, Support, Productivity and Development. It has **search**. Each card is a "fully specified blueprint" (user journey, agents, outputs). **Clicking a card pastes it, editable, into the prompt bar.** | D prompt-library; T |
| F15 | Templates | Blueprint library (behind the build) | "More than 1,000 prebuilt production-grade blueprints". The build begins "Finding the best enterprise-grade blueprint". | P (SiliconANGLE); O |
| F16 | Help | Support | A **Help & Support** form (reply by email) at the bottom-left of the sidebar, and a **mascot** at the bottom-right that opens **live chat**. | D help-support |

#### C. Prompt composer, attachments, themes

| ID | Area | Feature | Details | Source |
|---|---|---|---|---|
| F17 | Composer | **+ → Attach files** | PDF/DOCX/TXT are "automatically chunked and embedded into a vector database", and agents cite them. **CSV/Excel become dataframes** for a data-analyst agent. Images and screenshots are accepted; the 32 MB payload cap was removed. | D how-it-works; CL 2.0.1 |
| F18 | Composer | **+ → Select theme** | 45+ presets, or **Create theme** (F22). | D custom-theme |
| F19 | Composer | **+ → Add Studio agents** | Imports existing Studio agents with their prompts, tools and KBs. | D |
| F20 | Composer | **+ → Add MCP server / `@mcp:` mention** | Adds a server mid-prompt (F68). | D mcp-servers |
| F21 | Composer | Public composer controls | A tall textarea with a typewriter placeholder, a **paperclip** (bottom-left), a **microphone / voice input** and a **send arrow** (bottom-right), and 3 suggestion cards with a bolded key phrase. | O |
| F22 | Theme | **BYO design system, 5 import paths** | Figma link (beta, restricted), a brand guide (PDF/Word/text), a **GitHub repo + branch**, a **.zip**, or pasted Tailwind/shadcn `globals.css`. | D custom-theme |
| F23 | Theme | Theme editor and Theme Manager | **Design tokens** (CSS variables with validation), **Instructions**, **Assets** (logos) and a **Live preview**, then **Save**. Saved themes are reusable across apps. | D custom-theme |

#### D. Planning mode (plan before code)

| ID | Area | Feature | Details | Source |
|---|---|---|---|---|
| F24 | Plan | **Brainstorming & Planning mode auto-starts** | Guided **multiple-choice questions** shown as chips, or typed answers. Examples: use case and scope, outputs, "database needed?", resolution-rate goals, knowledge sources. Usually 3–6 questions. | D planning-brainstorming; T |
| F25 | Plan | **Live PRD panel** | Overview, user stories, agent architecture, data sources, data/DB, UI/UX theme, integrations, and an **agent table (model, tools, role)**. It rewrites live as you chat and stays in sync with the build (CL 2.2.0). | D; CL 2.2.0 |
| F26 | Plan | Plan artifact tabs | **App Mockup · Workflow Diagram · Skill files (.md) · PDF/PPT export · Starter files**, plus one-click follow-up suggestion chips. | D planning-brainstorming |
| F27 | Plan | **GitAgent opt-in question** | "Build this using GitAgent (beta feature)" swaps default Lyzr agents for git-native ones (F59). | D git-agents |
| F28 | Plan | **Stop** | Cancels a planning run from the chat toolbar. | CL 2.0.1 |
| F29 | Plan | **"Plan Ready" → Start Building**; skip; reverse | **Start Building** hands everything to the build. Pressing it early **skips planning**. **Back to Plan Mode** reverses the hand-off. Older labels, possibly pre-v2.0: **Approve**, **Chat/Edit**, **Edit in Studio**, "push to agents". | D build-guide, planning-brainstorming; T |
| F30 | Plan | **Feasibility pushback** | Redirects infeasible asks. Example: a real-time multiplayer game becomes a matchmaking and progression agent layer. | T building-ai-agents |

#### E. Build, iterate, debug, test

| ID | Area | Feature | Details | Source |
|---|---|---|---|---|
| F31 | Build | Build phases | **Plan → Agents** (create agents, assign tools, link KB) **→ App** (React/Next.js wired to agent outputs; "code preview available for review"). | D build-guide |
| F32 | Build | **Plan toggle** (bottom-left of the composer) | Replies are tagged **"Planning"** and change no code. Plan and build share one conversation. Pattern: Plan on → proposal → Plan off → "implement it". | D plan-mode |
| F33 | Build | **Test toggle** | Runs the **browser Testing agent** after each build, finding and fixing runtime and console errors. Adds 2–5 minutes; can be switched off. | CL 2.2.0 |
| F34 | Build | Progress display | Marketing demo: a checklist ("Finding the best enterprise-grade blueprint" → "Building the most appropriate agent orchestration" → "Detailed plan ready" → "Adding all required integrations" → "Configuring intelligent agent workflows" → "Generating production-ready code…"), an "AI Planning… 13%→100%" bar and chips ("Knowledge Graph Required"). **Real build (3P):** a "4–6 min" estimate, about 20 minutes actual, "a carousel and a mini-game", **no cost estimate**. | O (demo); 3P |
| F35 | Build | **Self-correction QA loop** | "A built-in QA loop runs the code Architect generates… it rewrites the code", before the app is shown. | D introduction |
| F36 | Debug | **"Help me fix it" + silent auto-fix** | A prompt appears on errors. Since v2.0.2 most errors (for example a 500 on `/api/agent`) are fixed "on its own… without you having to click". | CL 2.0.2 |
| F37 | Debug | Manual fix path | Describe the error in chat and/or attach a screenshot. The tutorial traces a sign-up "network error" to a missing TLS certificate. | T fix-errors |
| F38 | Build | **Honest tools rule** | Naming an unconnected MCP server makes Architect prompt you to add it; it "will never use fake or unverified tools". | D mcp-servers |
| F39 | Build | Iteration guidance | One coherent change per prompt. "Aim for 4–5 agents maximum". | D best-practices |
| F40 | Build | Harness and stability | A faster build harness (CL 2.1.0). Fixes for stuck, duplicated and vanishing chat messages (CL 2.0.1). | CL |
| F41 | Build | **App rename** | A pencil icon beside the app name opens a rename popover with **Save**. | CL 2.1.0; D |

#### F. Live preview and code access

| ID | Area | Feature | Details | Source |
|---|---|---|---|---|
| F42 | Preview | **"Live App" sandbox preview** | The real running app. Sign up as a test user, exercise the agents, and place a test **Call** in voice apps. | D deployment; T voice |
| F43 | Preview | Sandbox lifecycle | Stays alive at least 10 minutes idle (CL 2.0.2) and pauses on longer inactivity (CL 2.0.0). An app is **marked ready only after the preview loads**; "Connection lost", 401/"invalid sandbox" and port errors were fixed (CL 2.2.0). | CL |
| F44 | Code | Code preview (read-only) | "Code preview available for review" in build phase 3. **No editor, file tree or terminal is documented.** | D build-guide |
| F45 | Code | Edit via GitHub | The official route for manual edits is to clone from GitHub (F74) and edit locally. | T github |
| F46 | Code | **Code export / self-host** | "Frontend uses React/Next.js; backend utilizes Python/Lyzr SDK for self-hosted deployment." | D faqs |

#### G. Backend: database, end-user auth

| ID | Area | Feature | Details | Source |
|---|---|---|---|---|
| F47 | DB | **Auto-provisioned managed NoSQL DB** | Created from the prompt or from a "yes" to the DB question. Example collections: `_users`, `characters`, `conversations`, `messages`, `preferences`. MongoDB per the tutorial. | D database-auth; T |
| F48 | DB | **Database tab** | Auto-generated collections, a **live document viewer**, and schema views with timestamps, IDs and relationships. | D database-auth |
| F49 | DB | **Per-app DB isolation** | Each app gets its own database. | CL 2.1.0 |
| F50 | DB | BYO database | Add `DATABASE_URL` (Postgres or Supabase) as an env var, then ask Architect to wire it in. | D environment-variables |
| F51 | Auth (end-user) | **Generated end-user auth** | Theme-matched sign-in and sign-up screens, **bcrypt**-hashed passwords in `_users`, sessions and tokens, protected routes. Email/password only; social login for end-users is (unverified). | D database-auth |

#### H. Agents: creation, types, knowledge, safety, runtime

| ID | Area | Feature | Details | Source |
|---|---|---|---|---|
| F52 | Agents | **Architect designs the agents** | The user describes the app, and the plan proposes the manager and sub-agents, tools and KB. The agent table appears in the PRD (F25). | D build-guide |
| F53 | Agents | **Agents tab → Edit Agent panel** | Fields: name, description, **role, goal, instructions**, model provider and model, **temperature, top-p**. **Save changes**. | T editing-agent-instructions |
| F54 | Agents | **Open in Lyzr Studio** (top-right of Edit Agent) | Where tools, KB, Responsible AI and simulations are edited. **Edits sync both ways**; since v2.0.1 Architect **patches only changed sections** instead of overwriting Studio edits. | T; CL 2.0.1 |
| F55 | Agent types | **Orchestration patterns** | **Manager Agent** (dynamic routing to workers by their `usage_description`) and **SuperFlow** (deterministic DAG, exactly-once runs, **cron schedules, webhook triggers, human-approval gates, HTTP and code nodes**). The two can be combined. Makers describe "autonomous manager-style" and "deterministic workflow" agents. Whether Architect generates SuperFlows is (unverified). | L multi-agent-orchestration; P (PH) |
| F56 | Agent types | Input channels | The landing orchestration graph shows **Chat, Voice and Schedule** inputs. | O (demo) |
| F57 | Agent types | **Voice agents** | Engines: **Realtime** (audio-to-audio, for example gpt-realtime) or **Pipeline** (separately chosen STT, LLM and TTS), plus telephony. A generated voice app includes a call log, ticket tracking, KPI tiles, KB document upload and a **Call** button. | L voice; T voice |
| F58 | Agent types | Multimodal | Agents "talk, see, generate images, and create videos" via OpenAI, Anthropic, ElevenLabs and Replicate. | P (PH) |
| F59 | Agent types | **GitAgent (beta)** | The agent lives as `SOUL` / `RULES` / `DUTIES` / `agent.yaml` / skills / memory / knowledge files **in the user's repo**. The Agents tab shows **Soul, Rules, Duties** and **View repository on GitHub**. It "produces functionally identical app interfaces" for now. | D git-agents; CL 2.1.0 |
| F60 | Portability | **OpenGAP export** (CLI, outside Architect) | `opengap export --format` targets Claude Code, OpenAI, CrewAI, Gemini, GitHub Copilot, Cursor, Lyzr and more. MIT licence, about 3k stars. | github.com/open-gitagent |
| F61 | Knowledge | **Knowledge base** | Upload PDF/TXT/DOC, or **Crawl** a website URL. Studio KB types: **Classic RAG, Knowledge Graph (Neo4j), Semantic Model (Text-to-SQL)**. | T KB; L (report 10 §3.2) |
| F62 | Memory | Memory | Session memory, **Cognis** long-term memory, global context. | L |
| F63 | Safety | **Responsible AI policies** | Toxicity, prompt injection, NSFW, gibberish, allowed and banned topics, keyword block or redact, **PII redaction**, AWS Bedrock Guardrails. | T responsible-ai |
| F64 | Safety | **Per-request pipeline + Hallucination Manager** | Input checks (PII, injection, toxicity) → execution → **Reflection, Groundedness, Context Relevance** checks → logging and eval. | L |
| F65 | Quality | **Agent Simulation Engine** and **Agent Eval** | Personas and scenarios, "up to 10,000 automated tests" (SDK on GitHub). Agent Eval is multi-agent consensus with **human escalation below a confidence threshold**. Both are Studio features. | P (SiliconANGLE, press release); L |
| F66 | Models | Runtime model choice (per agent) | Studio: OpenAI, Anthropic, Google, Bedrock, Groq, Perplexity, bring-your-own. The Architect FAQ still lists GPT-4o, Claude 3.5 Sonnet and Gemini 1.5 Pro, which is stale. **The builder's own model is not disclosed.** | L; D faqs |
| F67 | Interop | **A2A** (Studio only) | A Manager agent can add "**+ A2A**" external agents. An **Agent Registry → Import (A2A)** covers LangGraph, CrewAI and Semantic Kernel agents with full traces. Not exposed in Architect. | L a2a-protocol |
| F68 | Agent API | **Agents as APIs** (Studio) | Every agent is exposed as an **OpenAPI 3.1 REST endpoint plus gRPC stubs**, usable from the Python/TS ADK. Studio also has a form-based **Studio Builder** and a **Conversational Builder**. | L architecture; report 10 §1 |
| F69 | App UI | Generated agent UI pattern | A KPI dashboard with a right-side **"Agent Interface"** chat that streams tool steps ("Retrieving knowledge graph…", "Preparing email…"). | O (demo) |

#### I. Integrations, MCP, custom tools, secrets

| ID | Area | Feature | Details | Source |
|---|---|---|---|---|
| F70 | Integrations | **26 built-in tools, no API keys** | *Communication:* Gmail, Microsoft Teams, Slack, Telegram, Twitter/X, Instantly, LinkedIn. *Workspace:* Asana, Dropbox, Google Calendar, Docs and Drive, Trello, Notion, Confluence. *CRM and data:* Apollo, HubSpot, Microsoft Excel, Freshdesk, Google Sheets. *Dev and research:* Arxiv, GitHub, Linear, Jira. | D llms.txt |
| F71 | Integrations | **OAuth Connect flow** | An "integration section" lists the tools the app uses → **Connect** → the provider screen, where you can "review" and "adjust the permissions" → **Allow** → shown as connected. Placement in the workspace is (unverified). | T connect-third-party-tool |
| F72 | MCP | **MCP servers** (v2.1.0) | **Path 1, Studio:** Connections → Tools → MCP; pick a listed server (DeepWiki, Stripe, Supabase…) or **+ New → MCP Server**. **Path 2, mid-build:** **+ → Add MCP server** or `@mcp:`; fill name, URL and auth (**No Auth / API Key / OAuth**) → **Connect**; then ask Architect to wire it in. Servers are **account-scoped** and show a **green-dot** status. | D mcp-servers; CL 2.1.0 |
| F73 | Tools | **Custom tools** (Studio only) | An OpenAPI schema or an ACI tool, with OAuth, API-key or no auth. Covers internal APIs, webhooks into **Zapier, Make or n8n**, and wrapped Python/JS functions. Once attached, it "behaves just like a built-in integration". | D custom-tools |
| F74 | Secrets | **Environment variables** | **⋮ (top-right) → Environment variables** → Name / Value → **Add**. Values are "encrypted at rest" and exposed as `process.env`. Then prompt, for example "I've added an OPENAI_API_KEY — can you wire up voice transcription?". There is **one list, with no per-environment values**. | D environment-variables; CL 2.0.2 |

#### J. GitHub, import, versions

| ID | Area | Feature | Details | Source |
|---|---|---|---|---|
| F75 | GitHub | **Connect GitHub** | **GitHub icon, top-right of the app view** → sign in → authorize "Lyzr Architect" → a **new repo is created** and the code pushed. | D github-connect |
| F76 | GitHub | **Auto-commit on every change** | Covers "refining an agent, tweaking the UI, or updating a prompt". | D github-connect |
| F77 | GitHub | **GitHub panel** | **Pull**, **Push** and a **branch switcher**. Branches must already exist on GitHub. | CL 2.0.2 |
| F78 | GitHub | Local-error recovery | Recovers from broken dependencies, port changes and build errors after local edits. | CL 2.0.0 |
| F79 | GitHub | **Deploy without GitHub → Export to my GitHub** | A platform-managed repo is used until you export. It is cleaned up when the app is deleted. | CL 2.2.0 |
| F80 | Import | **Import a GitHub repo (Next.js only)** | "Already have a Next.js project? Import any GitHub repository into Architect and continue building on it." The UI entry point is (unverified). | CL 2.2.0 |
| F81 | Import | Import a design system / reuse agents | See F22 (theme import) and F19 (Studio agents). | D |
| F82 | Versions | History | **Git auto-commits only.** No in-product checkpoints, restore or diff (unverified absence). | D github-connect |

#### K. Deploy, hosting, domains, publishing

| ID | Area | Feature | Details | Source |
|---|---|---|---|---|
| F83 | Deploy | **Deploy button, top-right → config modal** | Prerequisite: validate in the Live App first. | D deployment; T deploy |
| F84 | Deploy | **Publish to Marketplace toggle** | Fields: Category, Description (auto-filled), **Short description (160 characters)**, **Tags (up to 8)**. Turn it off to publish directly. | D deployment |
| F85 | Deploy | **Custom domain field** | For example `tools.yourcompany.com`, "directly through this menu". **No DNS steps or verification status are documented.** | D deployment |
| F86 | Deploy | **Analytics toggle** | "User engagement frequency and AI agent activation rates". | D deployment |
| F87 | Deploy | Success dialog | "Your app is now live", with the URL and **copy / open**. | D; T |
| F88 | Deploy | **Manual Re-deploy** | Iterations no longer auto-deploy: preview first, then **Re-deploy** (the Deploy button relabels). | CL 2.0.1 |
| F89 | Deploy | **Rename deployed URL** | Checks availability and updates the live URL immediately. | CL 2.2.0 |
| F90 | Hosting | Lyzr subdomain | The docs' example is `travel-planner.architect.new`. A live app was observed on an auto-slugged **`*.architect.space`** (`code-quest-mega-gear-97jp.architect.space`). The current default is (unverified). | D; O |
| F91 | Hosting | Enterprise hosting | Cloud, **on-prem in the customer's VPC (AWS, Azure or GCP)**, or hybrid (data connectors on-prem), with regional hosting. | L intro; D faqs |
| F92 | Hosting | Free-plan watermark | "Built with Architect". Removed on paid plans. | O |

#### L. Artifacts, sharing, marketplace

| ID | Area | Feature | Details | Source |
|---|---|---|---|---|
| F93 | Artifacts | **Artifacts tab** | Ask, for example, "Create a feature spec PDF for this app". Outputs include feature-spec PDFs, decks, research docs and HTML/Word files built from project context. **View in panel, Download, share.** Available in Build mode since v2.0.2. | D artifacts; CL 2.0.2 |
| F94 | Sharing | **Share by email** | **My Projects → share icon** (next to Open) → email → **People with access**. Recipients see the app under **Shared Projects**. "Every person with access works on the same app — there's no fork or copy." There are **no roles**, and revocation is not documented. | D share-app |
| F95 | Marketplace | **Marketplace** (the doc slug is still `/agentlets`) | Search; sort **Popular / Recent / Top Rated**; filter by **Category** (Automation, Analytics & Insights, Customer Support, Finance & Accounting, HR & Recruiting, Marketing) and **Use case** (Lead Generation, Customer Engagement, Workflow Automation, Data Analysis, Content Creation). Actions: **Preview**, **Analyze** (see agents and prompts), and **Clone & Modify**, which is "forthcoming". | D agentlets |

#### M. Usage, credits, pricing

| ID | Area | Feature | Details | Source |
|---|---|---|---|---|
| F96 | Usage | **Usage page** (sidebar) | Total credits, total apps, per-app credits, last used; search and sortable rows. | D usage |
| F97 | Usage | **Per-agent / per-phase credit breakdown** | Split into **Plan, Agent Creator, UI Generation, Build and Testing**; input, output and cached tokens; run and lifetime totals, "sourced directly from sandbox ledger". | CL 2.2.0 |
| F98 | Pricing | **Plans** | **Free** $0 ("Free credits included" in the modal; the docs say "No monthly credits"). **Starter** $20 ($17/mo annual). **Pro** $40 ($35), badged "Popular". **Max** $99 ($83). **Custom** ("Let's talk", "Exclusive support from Team Lyzr"). On each paid plan, monthly credits in dollars equal the plan price. Paid plans remove the watermark and add priority support. | O pricing modal; D plans-credits |
| F99 | Pricing | Pricing modal mechanics | A "Plans & billing" pill; **Plans \| Top Up** tabs; a **Monthly / Annual (Save 12%)** toggle that opens on Annual; five cards with "⊙ Soon" chips; the Free card shows "✓ Current". | O |
| F100 | Pricing | **Top Up packs** | **$25, $50, $100**, each a one-time purchase with **Buy pack**, shown beside the current-plan card. | O |
| F101 | Pricing | Plan inclusions | Every plan includes Agent Marketplace access, "Deploy your agents" and "Publish to Marketplace". **"Custom agent branding" and "Analytics dashboard" are marked "Soon".** | O |
| F102 | Pricing | **Credit model** | Dollar-denominated credits, **spent both while building** ("each time Architect plans, generates, or edits an app") **and at runtime** (when deployed agents answer end-users). The docs pitch "$10,000+" of traditional development against "approximately $10". | D usage, why-architect |
| F103 | Pricing | Studio and procurement | Studio is priced separately (Community $0 with 500 credits; Starter $19; Pro $99; $0.08 per run on cloud, $0.03 on VPC; unverified). **AWS Marketplace** listing ($0.01 per unit; private offers at $50k and $100k per year). | 3P (aiagentsquare); AWS |

#### N. Enterprise, governance, observability

| ID | Area | Feature | Details | Source |
|---|---|---|---|---|
| F104 | Governance | **RBAC and policy** | Least privilege; "Control who can publish, run, and share agents"; controls on tools, data and outbound actions. | O enterprise; L |
| F105 | Governance | **Approvals + audit** | "Approval flows for sensitive steps", audit logs, "Exportable evidence for compliance reviews". | O |
| F106 | Governance | Workspaces & environments | "Workspaces and environments for teams"; "Promote changes with reviewable configs". Details are (unverified). | O |
| F107 | Admin | **Admin console** | Tabs: **Apps, Insights, Insights (Beta), Users, Referrals, Analysis**. **Strategic Insights** is an opportunity map (complexity × impact: Quick Wins, Strategic, Low Priority, Avoid) with estimated annual savings. **Qualitative Analysis** of build sessions covers sentiment, error rate and completion rate. | O (demo data) |
| F108 | Observability | **Traces dashboard** | Total credits, average latency, tokens per trace, and a Recent Traces table (trace ID, agent, latency, tokens, credits, status). | O (demo) |
| F109 | Observability | Simulation dashboard | Pass/Fail cards. | O (demo) |
| F110 | Security | Platform claims | **HIPAA and SOC 2**, SSO/SAML, BYO models and keys. User data "is not used for training". | L intro; D faqs |
| F111 | Services | **Forward Deployed Engineers** and Agentic Transformation Consultants | Bundled with enterprise deals. | P (press release) |
| F112 | Mobile | None | Output is a responsive Next.js web app only. No native, Expo or PWA packaging. | D (absence) |

**Coverage count:** 112 capabilities across 14 areas. Everything Studio-only is marked as such, because the 2.0 design must decide whether each one moves *into* the builder (recommended in 7.5) or stays behind a link.

**Critic cross-check (2026-09-26).** Every bullet in report 01 §3.1–§3.20, §4 and §5 was matched to an F-ID; nothing was missing, so no IDs were added or renumbered. Small details were folded into existing rows (F08: the credit-saving tutorial and Agentathon judging criteria). The changelog was re-fetched: **v2.2.0 (2026-08-07) is still the latest release**. §9.1 now ends with a **parity cross-walk** that maps all 112 F-IDs to the rows that keep them.

---

### 7.3 UI layout and core flows, as currently known

#### 7.3.1 Screen inventory

| Screen | Layout (what sits where) | Primary CTA | Confidence |
|---|---|---|---|
| **Logged-out home** | Top bar (logo + mascot left; PH badge · How it works · Pricing · For Work ▾ · **Get started for free** · theme toggle right). Centred hero wordmark and a **sign-in card**. Below: the logo row, the 3-stage demo, a video and the footer. | Continue with Google | O |
| **Persona page** `/for/*` | Same top bar. Hero "Architect *for AI Agencies*" (green italic). A **large composer** (paperclip bottom-left; mic and send bottom-right) with **3 suggestion cards** and a Browse Prompt Library pill below. | Send prompt (then sign-in, unverified) | O |
| **/enterprise** | The nav adds **Explore admin dashboard**. A hero prompt box, 3 feature cards, mock Traces / Simulation / Admin dashboards, and a controls checklist. | Request a demo | O |
| **Pricing modal** | Header pill + "Choose Your Plan". Top-right: **Plans \| Top Up** tabs, Monthly/Annual toggle, ✕. Five plan cards on a cream gradient. | Plan CTA (black) | O |
| **Logged-in home** | **Left sidebar** (F10) plus a **centre composer** with **+**. My Projects shows a card grid. | Send prompt | D + 3P |
| **Planning workspace** | **Left:** brainstorming chat with suggestion chips, a composer and **Stop**. **Right:** a tabbed panel with PRD (agent table), App Mockup, Workflow Diagram, Skill files, PDF/PPT and Starter files, plus follow-up chips. | **Start Building** (at "Plan Ready") | D |
| **Build workspace** | **Top bar:** app name + pencil (left); **GitHub icon · Deploy/Re-deploy · ⋮** (right). **Left:** build chat, with a composer holding **+**, a **Plan** toggle (bottom-left) and a **Test** toggle, plus "Help me fix it" prompts. **Right:** tabs **Plan · Agents · App (Live App) · Database · Artifacts**. | Deploy | D + T |
| **Edit Agent panel** | Opens from the Agents tab. Form fields (F53), **Save changes**, and **Open in Lyzr Studio** at the top-right. GitAgent variant: Soul / Rules / Duties plus View repository on GitHub. | Save changes | T |
| **Deploy modal** | Marketplace toggle with 4 fields; Custom domain; Analytics toggle; **Deploy** → success dialog (URL, copy, open). | Deploy | D + T |

**Build workspace, reconstructed** (from docs and tutorials; exact proportions are unverified):

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [≡] My Sales Copilot ✎                          [GitHub] [ Deploy ]  [⋮ Env…] │
├──────────────────────────────┬───────────────────────────────────────────────┤
│ BUILD CHAT                   │  Plan │ Agents │ App (Live App) │ Database │ Artifacts
│  …assistant / user turns…    │ ┌───────────────────────────────────────────┐ │
│  ⚠ Help me fix it            │ │  running sandbox preview (no URL bar,     │ │
│                              │ │  no device toggle, no console documented) │ │
│ ┌──────────────────────────┐ │ │                                           │ │
│ │ Ask Architect…           │ │ │                                           │ │
│ │ [+] [Plan ◯]  [Test ◯] ➤ │ │ └───────────────────────────────────────────┘ │
│ └──────────────────────────┘ │  Agents tab → Edit Agent → "Open in Lyzr Studio" ↗
└──────────────────────────────┴───────────────────────────────────────────────┘
```

**Visual language** [O]: calm near-monochrome SaaS. An off-white canvas with a faint **graph-paper grid**, white cards, thin grey borders, large radii, **black pill primaries** and ghost secondaries. A muted **teal/emerald** accent and a geometric sans (Plus Jakarta Sans-like, unverified), with **monospace for plan and "thinking" text**. A playful mascot sits alongside enterprise vocabulary.

#### 7.3.2 Core flows (current steps and where they hurt)

| # | Flow | Current steps | Friction observed |
|---|---|---|---|
| 1 | **Sign-up and onboarding** | architect.new → sign-in card → Google or Email → Lyzr Studio account auto-created → home. Optionally: **What should I build?** → About → Role → Time-sinks → Tools → Goals → **Update and Explore** → 3 idea cards → **Build This** → PRD. | **Auth wall** on the main URL, while persona pages show a composer first: an inconsistent funnel. |
| 2 | **Prompt → plan** | Type or paste from the Prompt Library → optional **+** (attach, theme, Studio agents, MCP) → planning questions (3–6; the last may offer GitAgent) → the PRD, Mockup, Workflow and Skill tabs fill in → iterate in chat → optional PDF/PPT export → "Plan Ready". | 3P: "The plan quietly dropped two of the three" requested items. |
| 3 | **Plan → running app** | **Start Building** → wait (blueprint → orchestration → integrations → workflows → code; +2–5 min if Test is on) → QA loop → **Live App** loads → sign up as a test user → exercise the agents. | 3P: a "4–6 min" estimate against about 20 minutes actual, a "carousel and a mini-game", **no cost estimate**. An app may **run on sample data** when an integration isn't connected ("never asked me to connect Google Calendar"). |
| 4 | **Iterate, fix, tune** | Chat one change at a time → for big changes, **Plan** on → proposal → Plan off → "implement it". Errors are auto-fixed, or you click **Help me fix it**, or you describe the problem and attach a screenshot. Agents: Agents tab → Edit Agent → **Save changes**. | No undo, restore or diff. No logs or console. Debugging is by chat and screenshot. |
| 5 | **Database and auth** | Mention it in the prompt, or answer "yes" to the DB question → collections and themed auth screens are generated → inspect in the **Database** tab. External DB: ⋮ → Env vars → `DATABASE_URL` → ask to wire it in. | No SQL, migrations or seeds. Only email/password end-user auth is documented. |
| 6 | **Integrations and secrets** | **OAuth:** integration section → **Connect** → scopes → **Allow**. **Key:** ⋮ → Environment variables → **Add** → prompt. **MCP:** + → Add MCP server → name/URL/auth → **Connect** → prompt. **Custom API:** Edit Agent → **Open in Lyzr Studio** → build the tool (OpenAPI/ACI) → attach → return. | The custom-API path **crosses into a second product**. Best-practice docs say "Always test integrations in Studio". |
| 7 | **GitHub** | **GitHub icon** → authorize "Lyzr Architect" → a repo is created and every change auto-commits. Local work: clone → create and push a branch on GitHub → pick it in the **branch switcher** → **Pull** / **Push**. Or deploy first and **Export to my GitHub** later. | You can't create a branch or open a PR in-app. There is no diff, and auto-commits are noisy. |
| 8 | **Deploy and publish** | Validate in Live App → **Deploy** → Marketplace on (Category, Description, Short description, Tags) or off → optional custom domain and Analytics → **Deploy** → success dialog (copy/open). Later: **Rename deployed URL**; iterate → preview → **Re-deploy**. | No DNS wizard or verification status. A single environment. No deploy history or rollback. |
| 9 | **Import an existing project** | GitHub **Next.js** repo → continue building (entry point unverified). Branding only: + → Select theme → Create theme → import → edit → **Save**. | Next.js only. No zip, other stacks or existing agent code. |
| 10 | **Build an agent** | *In Architect:* describe the app → Architect proposes the agents → tune them in the Agents tab → add KB files or **Crawl** a URL → name tools in the prompt. *For guardrails, custom tools, simulations, A2A or SuperFlow:* **Open in Lyzr Studio** → configure → come back (two-way sync). | 3P: "Editing an agent sends you to a separate product (Lyzr Studio)". |
| 11 | **Share and marketplace** | My Projects → share icon → email → **Share** → the invitee opens it from **Shared Projects** and edits the same app. Marketplace: search, filter or sort → **Preview** / **Analyze** (Clone & Modify is forthcoming). | One access level. No fork, roles, comments or presence. |

---

### 7.4 Strengths to keep (Architect's DNA)

| Strength | Evidence | Keep in 2.0 as |
|---|---|---|
| **Plan before spending** | A live PRD with an **agent table**, mockup and workflow diagram before any code. G2: users "plan the product first, discuss execution, and specify the agents and orchestration". | The spine of the flow for **both** audiences, with a visible skip (F24–F29). |
| **A visible agent layer** | The PRD agent table, workflow diagram and **Agents tab** back up "No black boxes" (PH). | A first-class Agents surface: the thing that separates it from Lovable, Bolt and v0. |
| **A layer-per-tab workspace** | **Plan · Agents · App · Database · Artifacts** (F31). | The information architecture, extended with Code, Logs and Deployments for developers. |
| **Zero-config start** | Google sign-in, the consultant interview, a department prompt library, **no API keys for 26 built-in tools**. | The default path for non-technical users. |
| **AI Consultant** | Role → time-sinks → tools → goals → 3 ideas with **hours saved per week** → **Build This** (F13). | An "I don't know what to build" entry, one click away and never in the way. |
| **Honesty guardrails** | Feasibility pushback (F30); "will never use fake or unverified tools" (F38). | A product principle, extended to data (see the sample-data gap in 7.5). |
| **Stakeholder artifacts** | Spec PDF, PPT, research and Word files from project context (F26, F93). Fits consultants' "demo plus deck today" job. | Keep. |
| **Bring-your-own design system** | 5 import sources plus a token, instruction and asset editor with live preview (F22–F23). | Keep. It is ahead of most builders. |
| **Edit Agent with two-way sync** | Section-level patching instead of overwrite (CL 2.0.1). | The sync principle, applied *inside* one product. |
| **Explicit autonomy toggles** | **Plan** and **Test** toggles in the composer (F32–F33). | Keep. They are cheap, legible controls. |
| **Safe deploy defaults** | Manual **Re-deploy** after preview (Architect itself reverted auto-redeploy in CL 2.0.1); **Rename URL**; **deploy without GitHub → Export later**. | Keep, and add history and rollback. |
| **Cost transparency after the fact** | A per-phase credit breakdown with input, output and cached tokens (F97). | Keep, and add **before-the-fact** estimates. |
| **Enterprise trust** | VPC, on-prem or hybrid hosting; RBAC; audit; approvals; Responsible AI with the **Hallucination Manager**; HIPAA/SOC 2 claims (F104–F110). | Keep. It is Lyzr's commercial moat (Accenture, KPMG). |
| **Portable agents** | GitAgent / OpenGAP files in the user's repo, exportable to other runtimes (F59–F60). | The seed of "agents in any framework". |
| **Auto backend** | NoSQL DB plus bcrypt auth with a **Database tab** viewer, isolated per app (F47–F51). | The non-technical default, with a developer override. |
| **Self-correction + Testing agent** | A QA loop plus a browser Testing agent (F35, F33). | Keep, and make it visible (see 7.5). |

---

### 7.5 Where it falls short

#### 7.5.1 For developers

*Precedents come from the sibling platform reports (02–10) and are named so the reader can check them.*

| # | Gap (today) | Why a developer cares | What 2.0 should add | Severity |
|---|---|---|---|---|
| D1 | **No code editor, file tree, terminal or diff.** Only a "code preview"; manual edits go through GitHub locally (F44–F45). 3P: "Developers get no workspace". | A small fix (a prop, an import) costs a clone-edit-push round trip, or a prompt and its credits. Developers can't review what the AI wrote. | An in-browser **Code** tab: editor, file tree, terminal, per-turn **diff review** and accept/reject. Precedents: v0's VS Code-style editor and terminal; Replit's Shell, Console and file tree; Lovable's Dev Mode. | **Major** |
| D2 | **Single-stack lock-in:** Next.js + managed NoSQL + Lyzr agents (F31, F47). | Teams have existing stacks: Python backends, Postgres, Vite, monorepos. Lock-in blocks adoption. | Keep the great default, but allow **stack selection and override** at creation and on import (auto-detected). | **Major** |
| D3 | **Agents in only one framework.** Lyzr-native, or GitAgent (beta, "functionally identical" UI). **A2A import is Studio-only**, and OpenGAP export is **CLI-only** (F59, F60, F67). | The assignment asks for "any framework". Developers standardise on LangGraph, CrewAI, OpenAI Agents SDK, ADK or Mastra. Report 10 cites "framework fatigue… no clear winner". | A **per-agent runtime picker** (Lyzr, LangGraph, CrewAI, OpenAI Agents SDK, ADK, Mastra, Claude Agent SDK, GitAgent) with one shared tool, MCP and trace layer, plus export and eject. Precedent for framework-agnostic hosting: AWS AgentCore. Avoid Copilot Studio's non-transferable choice made at creation. | **Major** |
| D4 | **Import is GitHub Next.js only**, with an unverified entry point (F80). | "Import an existing project and keep working on it" is an explicit requirement. Most real repos aren't vanilla Next.js. | Import from **GitHub (any framework, base branch, monorepo root dir)**, zip, local folder via CLI, and **existing agent code**. Follow it with a repo map (stack, routes, agents found, missing env vars). Precedent: v0 imports any GitHub repo with a root-directory pick. Report 10: "nobody offers repo of a LangGraph/CrewAI agent → visual card and traces". | **Major** |
| D5 | **No checkpoints, restore or deploy history.** Git auto-commits only (F82). | There's no safe experimentation: a bad prompt can't be undone without leaving the product. | A **checkpoint per turn** on a timeline, with preview-before-restore, compare, and DB-state option. Deploy history with one-click rollback. Precedent: Replit checkpoints capture code, AI context and DB, with a "Rollback here" confirmation that lists what changes. | **Major** |
| D6 | **No logs, console, network view or traces in the builder.** Debugging is by chat and screenshot; traces live in Studio or enterprise dashboards (F36–F37, F108). | Agent bugs are invisible without tool-call traces. Front-end bugs need the console. | A **Logs / Console / Network drawer** on the preview, plus **per-run agent traces** (tool calls, tokens, latency, guardrail hits), OTel-based. Precedents: Replit preview Devtools; v0 Console panel; CrewAI Studio Traces tab; LangSmith Studio time-travel. | **Major** |
| D7 | **Git is pull/push only.** You can't create a branch or open a PR in-app, branches must pre-exist on GitHub, and every change auto-commits (F75–F77). | Teams need review, protected main and meaningful history. | Create branches, a **branch per chat**, **open a PR on publish**, respect branch protection and CI, and squash auto-commits into AI-written messages. Precedent: v0 (branch per chat, PR on Publish, respects branch protection and CI). | Medium |
| D8 | **One deployment and one env-var list.** Enterprise "environments" are vague (F74, F106). | Staging is standard. Secrets differ per environment. | **Draft / Staging / Production** environments, each with its own vars, DB and URL; a **Promote** action; a preview deploy per draft or branch; approval gates for enterprise. Precedent: Vellum's approval-gated dev/staging/prod push. | Medium |
| D9 | **Missing backend primitives:** storage buckets, server functions, cron, webhooks and queues. SuperFlow has cron, webhooks and approvals, but only in Studio (F55). | Agentic apps need scheduled runs, inbound webhooks and file handling. | **First-class triggers** on the agent graph (Chat, Voice, **Schedule**, **Webhook**, Email, Form), plus functions and storage. Precedents: Lovable (edge functions, cron, storage in-editor); LangSmith Fleet (schedule and webhook triggers). | Medium |
| D10 | **Database control:** auto NoSQL only. BYO means an env var plus a chat request. No SQL console, migrations or seeds (F47–F50). | Schema changes need to be reviewable and reproducible. | A DB console with query, schema, **migration files as code**, seed data and a BYO connection wizard (Postgres, Supabase, Mongo). | Medium |
| D11 | **Custom tools, evals and simulations live only in Studio** (F65, F73). | Developers want tools as code next to the app, and **eval gates before deploy**. | In-builder **tool-as-code** (OpenAPI or function) and eval suites that **block deploy on failure**. Precedent: Relevance AI, whose evals from production cases block publishing. | Medium |
| D12 | **Tests only via the browser Testing agent.** No test files, CI or pre-deploy checklist (F33). | Regressions need repeatable tests in the repo. | Generated unit/E2E tests committed to the repo, a CI hook, and a **pre-deploy checklist** (tests, secrets, auth on routes, guardrails, eval score). | Medium |
| D13 | **No builder API, CLI or MCP; no IDE sync.** The OpenAPI page is a placeholder (F68 is Studio-agent APIs only). | Developers live in Cursor, Claude Code or Codex and want to drive projects from there. | `architect` CLI (pull / push / dev / deploy), a public API, and an **Architect MCP server**. Precedents: Replit (native MCP server so any MCP client can create and publish apps, plus an Admin API); v0 (API v2, `@v0` in Slack); Vellum (CLI pull/push). | Medium |
| D14 | **"Use this agent via API" isn't surfaced in Architect**, even though Studio generates REST and gRPC endpoints (F68). | Agents are often consumed by *other* systems, not only by the generated UI. | Endpoint, key, code snippets and a playground on each agent. Also expose agents as MCP and A2A. | Medium |
| D15 | **The builder model and context are opaque.** The builder model is undisclosed, the FAQ model list is stale, and there's no model choice or project-rules file (F66). | Output quality and cost depend on the model. Teams encode conventions in rules files. | A builder model picker (with Auto), and a project **rules / AGENTS.md** file the builder honours. Precedent: Codex and Claude Code read `AGENTS.md` / `CLAUDE.md`. | Medium |
| D16 | **No pre-run cost estimate and no budget cap.** Credits drain during build and runtime (F97, F102). | Unbounded spend blocks team adoption. Report 10 cites an "overnight $2,400 API bill" from a retry loop. | An estimate at **Start Building**, a per-task budget, alerts, and no charge for failed auto-fix loops. Precedents: Emergent's per-chat budget under the composer; Replit's per-checkpoint cost; Claude Managed Agents' session budgets. | Medium |
| D17 | **Collaboration has one access level and no audit of changes** in self-serve (F94). | Teams need roles, review and attribution. | Roles (Owner, Editor, Reviewer, Viewer), an activity feed with attribution, and **fork/remix**. Precedent: Lovable (Owner, Admin, Editor, Viewer, External roles; Remix copies code and schema). | Medium |
| D18 | **No security scan** of code, secrets or dependencies (report 01 §3.14). | Generated apps ship auth and API keys, and one mistake leaks data. | A scan at publish (dependencies, secrets in client code, unprotected routes) with a fix-it-for-me action. Precedents: Lovable's inline scan in the publish dialog; Replit's L1–L3 scans including black-box pen tests. | Minor–Medium |
| D19 | **Preview is a bare frame:** no URL or route bar, device toggles or element selection (F42, unverified absence). | Developers need to hit routes, test responsive layouts and target a component precisely. | A route bar, device presets and an element picker ("change this"). Precedents: Replit (location bar, screen presets, Devtools); Lovable Visual Edits. | Minor–Medium |
| D20 | **No mid-build steering.** Stop exists only in planning; the build is a black box (F28, F34). | Developers want to redirect a long run without killing it. | Steer or queue messages during a build, plus Stop. Precedent: Replit's Message Queue ("Steer now", reorder) with Stop in the status bar. | Minor–Medium |

#### 7.5.2 Even for non-technical users (the current core audience)

| # | Shortfall | Evidence | What 2.0 should do |
|---|---|---|---|
| N1 | **A black-box, over-promised build wait** | "A 20-minute black box with a carousel and a mini-game"; "It promised '4–6 min' and took about 20" [3P]. | A **live build timeline**: each plan item ticks as it happens (agent created, tool attached, page generated, test passed). An honest ETA that recalibrates, and the chat stays usable during the build. |
| N2 | **Opaque dollar credits** | "No cost or time estimate before committing credits" [3P]. Credits drain on build *and* runtime (D usage). G2 on Lyzr: "cost is quite high… token usage is quite a lot". Lyzr publishes a credit-saving tutorial. | An estimate plus a budget at Start Building, a running cost chip, and plain-language runtime cost ("≈ $0.02 per conversation"). |
| N3 | **Silent scope cuts** | "The plan quietly dropped two of the three" [3P]. | A **scope contract** at "Plan Ready": "You asked for A, B, C → planned A, B; C deferred because…", with **Include it**. |
| N4 | **Silent sample data** | The app may run on sample data when an integration isn't connected; one user's app "never asked me to connect Google Calendar" [3P]. | A persistent **"Sample data" badge** on affected widgets, plus a **Connect real data** checklist that warns or blocks at deploy. |
| N5 | **Two-product split** | "Editing an agent sends you to a separate product (Lyzr Studio)" [3P]. Custom tools, guardrails and simulations are Studio-only. | Bring tools, KB, guardrails, memory, simulations and triggers **into the Agents tab**: simple cards by default, full config on expand. |
| N6 | **Jargon exposed, but no depth** | "Non-technical users see internals (raw app IDs, `manifest.json`, 'temperature')" [3P]. | Plain labels ("Creativity" instead of temperature), no raw IDs, and **progressive disclosure** to full config and code. |
| N7 | **Muddled information architecture and naming** | "'Project', 'app', 'agent' and 'agentlet' are used for overlapping things"; "3 views of projects and 4 places to find ideas"; 17 sidebar items, 10 of them learning content [3P]. The docs mix My Projects and My Apps. | One noun (Project), one **Start** hub (consultant, library, templates), and learning content moved out of the primary sidebar. |
| N8 | **Auth wall on the main entry** | The home page is a sign-in card, while persona pages show a composer first [O]. | **Try before sign-up:** run the planning questions and PRD first, and ask for sign-in at Start Building. Precedent: Lovable lets people view public remix previews without signing in and asks for sign-up only at remix. |
| N9 | **Chat is the only editing tool** | No visual or point-and-click editing is documented (F42). | Click-to-select and edit in the preview, with instant text edits that need no LLM call. Precedent: Lovable's preview toolbar (Select elements, Edit text inline, Draw annotation, Add a comment). |
| N10 | **No undo** | No checkpoint or restore UI (F82). | "Undo last change" and a visual version timeline (see D5). |
| N11 | **Custom domain with no guidance** | A domain field only; no DNS steps or verification status (F85). | A domain wizard: DNS records to copy, live verification, SSL status. |
| N12 | **Unfinished surfaces** | "Soon" chips on Custom agent branding and the Analytics dashboard; Marketplace Clone & Modify "forthcoming"; Figma import restricted; GitAgent beta with no UI difference; the tab still titled "Beta" [O; D]. | Ship fewer things completely. Post-deploy analytics (usage, conversations, cost per conversation, errors) should be real on day 1. |
| N13 | **Shallow sharing** | "No fork or copy", no roles, no revocation documented (D share-app). | Roles, fork/remix, comments pinned to preview elements or PRD lines, and presence. |
| N14 | **Reliability perception** | The changelog is a list of fixes: preview "Connection lost", 401 and port errors; stuck, duplicated or vanishing messages; the 32 MB upload failure; sandbox expiry; Studio edits overwritten; the PRD not persisting. /enterprise demo data shows a **13.9% build error rate, 71.1% completion and 32 of 360 sessions "frustrated"** [O; possibly illustrative]. | Make errors visible and recoverable (checkpoints, a clear error inbox, a resume-build action) rather than silent. |
| N15 | **Scale ceiling** | "Aim for 4–5 agents maximum" (D best-practices). | Keep the guidance, but show agent count and complexity warnings, and support sub-flows for larger systems. |
| N16 | **Setup-heavy, with a learning curve** (Lyzr overall) | "Most of the time goes into setup, not output"; "learning curve higher than expected" (Salesforge; G2). | Fewer decisions up front, sensible defaults, and inline "why" explanations. |
| N17 | **Marketing ahead of the product** | SEO pages promise a "visual canvas" and "drag-and-drop" with handoff logic that the docs never describe. The FAQ lists stale 2024-era models (report 01 §6.2). | Keep claims and product in lockstep. A visual agent graph in 2.0 would actually close this gap. |
| N18 | **No mobile output** | Responsive web only (F112). | At least a PWA or installable export. Mobile-native builds are optional scope. |

---

### 7.6 What is unverified or conflicting

| Item | Status | Why it matters for 2.0 |
|---|---|---|
| **Logged-in builder layouts** (home, planning, build) | Reconstructed from docs, tutorials (pre-v2.0 UI) and one 3P teardown. **Not observed first-hand.** | Button positions in 7.3 are best-evidence, not screenshots. |
| **Builder LLM** | **(unverified)**. No docs page names it. The FAQ's "GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro" is stale. Lyzr's company-wide Anthropic spend is only a hint. | Don't claim a model in the deliverable. |
| **Free plan credits** | Conflict: the modal says "Free credits included"; the docs say "No monthly credits". The amount is undisclosed. | Pricing UI in 2.0 should state amounts explicitly. |
| **Hosting domain default** | The docs say `*.architect.new`; `*.architect.space` was observed. The current default is (unverified). | Minor. |
| **Import entry point** (Next.js repo) | The changelog confirms the capability; the UI location is (unverified). | 2.0 should make import a visible home-level entry. |
| **Integration section placement** | "Integration section" with Connect [T]; exact placement is (unverified). | — |
| **Whether Architect generates SuperFlows** (cron, webhooks, approvals) | (unverified). The landing demo shows a "Schedule" input. | Triggers are listed as a gap (D9) on this basis. |
| **Social login for end-users** | (unverified). Only email/password is documented. | 2.0 should offer social and SSO end-user auth explicitly. |
| **Live per-message cost chip** | Not documented (unverified). | Treated as absent (N2). |
| **Preview devtools, device toggles, visual edit** | Not documented; "probably absent" (unverified). | Treated as absent (D19, N9). |
| **Enterprise "environments" and "reviewable configs"** | Marketing copy only; details (unverified). | D8 assumes self-serve has one environment. |
| **Marketplace sidebar placement**; the `architect.new/agentlets` public page | The placement is (unverified); the public page is JS-rendered and wasn't read. | — |
| **AI Consultant step count** | Docs: 4 steps; tutorial: 5. | Minor. |
| **`lyzr.architect.new`** | Serves "Architect Beta" (title only); possibly a tenant or org instance (unverified). | Hints at multi-tenant enterprise instances. |
| **/enterprise dashboard numbers** (13.9% error rate, 71.1% completion, "$6.1M est. annual savings") | Demo data, possibly illustrative. | Use it as directional evidence only. |
| **Studio pricing** | From a third-party aggregator (AI Agent Square, 2026-07-04); lyzr.ai pricing didn't render. | — |
| **ARR of about $12M** | Secondary source (unverified). | Context only. |
| **Product Hunt review count** | Conflicting: a search snippet says "4.7 from 107 reviews"; the fetched page shows none. | Community signal is thin in general: tutorials have 2–6 views, and there are no Reddit threads. |
| **3P teardown findings** | A single user's first-hand notes (shambhu-10/lyzr). | The strongest pain-point evidence, but n = 1. Frame it as "reported", not "proven". |

---

### 7.7 Implications carried into the 2.0 design

- **The parity floor is 112 rows (7.2).** The 2.0 feature map should tick every F-ID, including the Studio-only ones, which 2.0 should pull *into* the builder.
- **Keep the DNA:** plan-first, a visible agent layer and a layer-per-tab workspace are what make Architect *not* Lovable. Developer features should **deepen** these tabs (Code, Logs, Deployments, Environments), not fork the product into two modes. Competing take-home repos already show "two lenses".
- **Fix trust before adding power.** The top non-technical pain points (N1–N4: black-box wait, opaque cost, silent scope cuts, silent sample data) are *also* developer pain points. They are cheap to fix in the UI and are the most evidence-backed differentiators available.
- **Developer "Major" gaps (D1–D6)** are editor and diff, stack choice, any-framework agents, real import, checkpoints, and logs and traces. They map one-to-one onto the assignment's explicit asks: import, "any framework", GitHub, deploy.
- **Lyzr is already moving toward developers.** Every release since June added a developer affordance: branches, env vars, MCP, GitAgent, repo import, testing. 2.0 must be a **structural** step (one product, progressive depth), not another toggle.

---

## 8. Opportunities & first-principles ideas

> **How to read this section.** It de-duplicates the "Ideas for Architect 2.0" sections of all 10 platform reports and the `ideas_for_architect2` / `pain_points` fields of the 9 structured summaries. A pattern proposed by several reports appears once and credits every source. §8.1 names the root causes, §8.2 maps the 15 concepts, §8.3 gives one card per concept, and §8.4 lists what not to do. Concepts are referred to as **C1–C15** in §9.

### 8.1 First principles: five root causes behind almost every complaint

*These refine the three root causes in §6.17: **Uncertainty** is opaque economics; **Invisibility** and **Irreversibility** are unverifiable autonomy; **Lock-in** and **Jargon mismatch** are seams.*

| Root cause | What users experience | Evidence (sample) |
|---|---|---|
| **Uncertainty** (cost, time, scope) | Bill shock, optimistic ETAs, scope quietly cut | Replit "$1k this week alone"; v0 "$30USD on a single prompt"; Emergent 2,150 → 10 credits in a day; Bolt Trustpilot 1.5/5; Architect "No cost or time estimate before committing credits… promised '4–6 min' and took about 20" [3P-hands-on] |
| **Invisibility** (what is happening, what is real) | Black-box waits, false "done" claims, sample data passed off as real | Architect "a 20-minute black box with a carousel and a mini-game" [3P-hands-on]; Emergent "claimed to have made changes that were not actually implemented"; Cursor's browser demo "implied success without evidence"; agents "silently returning nothing while appearing to succeed" (agent builders) |
| **Irreversibility** (fear of breaking things) | Lost work, a wiped production DB, rollbacks that destroy history | Replit agent deleted SaaStr's production DB; Rocket rollback deletes later versions; Lovable reverts code but not data; Emergent app vanished with "no version history" |
| **Lock-in** (stack, framework, host) | You can't bring code in or take agents out | Architect imports Next.js only and supports Lyzr/GitAgent agents only; Rocket imports Next.js TS only; Lovable can't import repos; OpenAI Agent Builder deprecated about 8 months after launch; CrewAI ZIP export is one-way |
| **Jargon mismatch** (one UI, two audiences) | Novices see internals; developers get no depth | Architect: "Non-technical users see internals (raw app IDs, `manifest.json`, 'temperature'). Developers get no workspace" [3P-hands-on]; Replit's developer-first UI intimidates first-timers (G2); v0 exposes base/working/production branch vocabulary |

**Design stance:** Architect 2.0 should win by removing these five causes, not by adding panels. The 10+ public "Architect 2.0" candidate repos (§7.1) repeat a dual-lens toggle, chat-left/preview-right and a framework dropdown. This section treats those as table stakes and differentiates on the connective tissue between steps.

### 8.2 Concept map

| # | Concept | Root cause | Audience | Closest today | What they still miss |
|---|---|---|---|---|---|
| C1 | **Living Spec with a scope contract** ("Promises") | Uncertainty, Invisibility | Both | Architect PRD; Replit plan card; Kiro specs | No requirement is tracked from plan to proof to production; cuts are silent |
| C2 | **Build Quote + Fix Guarantee** | Uncertainty | Both | Lovable live meter and check-ins; v0 receipts with FREE tags | No itemised quote before the run; no way to trim scope to budget; free fixes are narrow |
| C3 | **Watch it take shape** (the UI builds in the preview) | Invisibility | Both | Emergent Mission Control (Pro only); Lovable activity cards; v0 last-good preview | Progress is shown as logs or cards, not as the product forming |
| C4 | **X-ray: depth on demand per object** | Jargon | Both | Windsurf "Send element"; Cursor ⌥-click; Leap architecture view | Nobody explains where a UI element's data, agent and code come from |
| C5 | **Agents as app components** (typed contracts + Agent Map) | Invisibility, Lock-in | Both | Architect agent table; Dify, n8n and Copilot Studio agent cards | Agent builders don't know the UI; app builders bolt agents on |
| C6 | **Bring your own framework via one open spec** | Lock-in | Dev | Lyzr A2A import (Studio only); Vellum two-way sync | No import of existing agent code; framework choice is one-way |
| C7 | **Doctor: plain-language fix cards + loop breaker** | Invisibility, Uncertainty | Both | Windsurf "1 error — Fix?"; Rocket escalation after 2 fails; Architect "Help me fix it" | Diagnoses are technical, loops are billed, and impact is never stated |
| C8 | **Honest data: Sample vs Live badges** | Invisibility | Non-tech | Architect "never fake a tool"; v0 claimable sandboxes | Data provenance is never labelled on the UI |
| C9 | **Time machine + try-on drafts** | Irreversibility | Both | Replit rollback (code + DB + memory); Base44 branches as full copies | Restores are destructive or partial; no side-by-side compare |
| C10 | **Visible boundaries** (rules you can see and the platform enforces) | Irreversibility | Both | Cursor Auto-review; Claude permission modes; Lovable approval cards | The user's own boundaries live in chat text and get lost |
| C11 | **Dress rehearsal** (simulated users test UI and agents together) | Invisibility | Both | Architect Testing agent + Lyzr Simulation Engine (separate products); Base44 Testing Agent | UI tests and agent evals never run as one rehearsal with proof |
| C12 | **Launch Readiness that fixes, not just flags** | Uncertainty, Irreversibility | Both | Base44 Production Pack; Lovable publish scan; Bolt security audit | Checks ignore the user's own promises, agent evals and runtime budget |
| C13 | **Run-rate forecast for agent costs** | Uncertainty | Both | n8n per-execution pricing; Lyzr OpenController (spend control, not Architect-specific) | Nobody forecasts end-user runtime cost before launch |
| C14 | **Adopt any project** (trust gate + Understanding Report) | Lock-in | Dev (+ migrators) | Codex Actions; Dyad `AI_RULES.md`; Bolt "Import from Lovable" | No trust gate + stack map + agent detection in one step |
| C15 | **Bilingual handoff** (founder ↔ developer) | Jargon | Both | Claude walkthrough pages; Bolt/Base44 multiplayer | Nobody translates developer changes into plain language, or feedback into tasks |

**Signature story for the demo:** C1 → C2 → C3 → C4 → C5 is one continuous arc (promise → price → watch → inspect → agent). C7 and C12 then prove trust.

### 8.3 Concept cards

#### C1. Living Spec with a scope contract ("Promises")
- **User problem:** The plan is where intent is fixed, and today it decays. Architect's plan "quietly dropped two of the three" requested features [3P-hands-on]. Agents claim "done" without evidence (Emergent; Lovable "claimed a bug was fixed three times in a row"; Cursor's browser demo). Context evaporates between sessions (Replit "almost zero context between agent sessions"; Emergent forks "lose context").
- **Idea:**
  - Turn the PRD into numbered **Promises**: user-visible outcomes, each with a plain-English acceptance check ("A new HubSpot lead gets a score within 1 minute").
  - At approval, show a **scope contract**: "You asked for A, B and C → this plan delivers A and B; C is deferred because [reason] · **Include C (+~6 credits)**".
  - Each promise keeps a status for the life of the project: Planned → Building → Built → **Verified** (proof: screenshot, clip or test result) → Live. Build progress (C3), tests (C11) and readiness (C12) are all views of this one ledger.
  - Keep every existing Architect plan artifact (agent table, mockup, workflow diagram, skill files, PDF/PPT, starter files). Add a **Decisions log** (stack, conventions, "why we chose X") that the agent reads every turn and the user can edit.
  - Developers get the same object as `spec/requirements.md`, `design.md` and `tasks.md` in the repo (Kiro-style), with each promise linked to its commits and files.
- **Audience:** Both. Non-technical users approve outcomes; developers audit a spec in git.
- **Why it beats current platforms:** Architect already has the best plan-first spine (guided questions → live PRD → "Plan Ready"), but the plan stops mattering once building starts. Replit's plan card (What & Why / Done looks like / Out of scope / Steps) and Claude's three-button card are one-time approvals. Kiro's EARS specs are developer-only and carry no visual proof. **No product traces a requirement from plan to proof to production.**
- **Prototype cut:** store the spec as JSON (promises with status and proof URL); build the approval card with the scope diff; tick chips during the build; attach a screenshot from the test run on "Verified".

#### C2. Build Quote + Fix Guarantee
- **User problem:** Cost is the #1 complaint in nearly every report (evidence in §6.1), and paying for the AI's own mistakes is the sharpest edge (§6.2; v0: "20% of iteration spend went to corrections where v0 broke stuff"). Architect gives no cost estimate before committing credits, and its ETA was 3–5× too optimistic [3P-hands-on].
- **Idea:** a contractor-style quote at "Start Building".
  - **Itemised per promise:** "Lead-scoring agent ≈ 8–12 credits · 4–7 min". Show a total range with a confidence label ("based on similar builds").
  - **Trim to fit:** untick a promise and watch the total drop. Set a **budget cap** with a slider. The model tier (Fast / Balanced / Best) changes price and ETA live.
  - **During the run:** a live meter against the quote. At 80% of the cap, a pause card offers *Add budget · Finish essentials only · Stop and keep work*, never a surprise stop (Emergent: "I end up stuck partway through").
  - **After the run:** a receipt (time, files, credits, proof) with **FREE** tags.
  - **Fix Guarantee:** when a previously Verified promise regresses, or a fix targets an error the agent introduced, the repair is free. Detection is mechanical, because the promise ledger (C1) knows what was green.
  - **Separate pools:** build credits and runtime credits are separate, so running out of build credits never pauses a live app (Lovable's unified pool can pause a production DB, auth and storage).
- **Audience:** Both.
- **Why it beats current platforms:** Lovable has a live meter and credit check-ins. v0 has receipts and FREE tags, but only for unedited code. Rocket makes fixes free on paid plans. None quotes per feature before the run or lets users trade scope against budget. Lyzr already has the data source: the per-agent, per-phase credit breakdown "sourced directly from sandbox ledger" (v2.2.0).
- **Prototype cut:** a heuristic estimator (credits per promise type × complexity), the cap slider, the pause card at the threshold, and a receipt with a FREE tag on a simulated regression fix.

#### C3. Watch it take shape: the UI builds in the preview, not in a log
- **User problem:** Architect's real build is "a 20-minute black box with a carousel and a mini-game" [3P-hands-on], although its marketing demo shows a much better ticking checklist. Emergent admits its deploys are "a black box". Rocket had to fix progress indicators "spinning indefinitely". For non-developers, log walls are noise (Emergent's dark UI crowded with agent logs).
- **Idea:**
  - **Before code:** an optional **three design directions** step, rendered side by side (Lovable; Emergent style picker; Codex best-of-N), with the cost multiplier shown. The chosen mockup becomes the skeleton.
  - **The App tab opens at once on the approved wireframe:** grey blocks labelled with their promise numbers. As each component's code lands, its block "develops" into real UI. Agents appear on the Agent Map as they are created, promise chips tick, and tables fill with labelled Sample rows (C8).
  - **A status line** in plain words ("Connecting the Leads table to the Lead Qualifier"), with elapsed time, an **ETA that recalibrates** (and says why when it slips), and credits against the quote.
  - **A density switch:** **Story** (plain outcomes; the non-technical default) · **Steps** (tool calls collapsed) · **Everything** (commands, diffs, logs), following Claude's Normal/Verbose and Cursor's density toggle.
  - **The user keeps working:** new messages go to **Queue** or **Steer now**. **Stop** always works: it halts at the next checkpoint and keeps finished parts (Rocket disables Stop during generation).
  - **Long runs:** "Notify me when done" via tab badge, email or phone.
- **Audience:** Both.
- **Why it beats current platforms:** Emergent Mission Control (phase cards, Pro only), Lovable activity cards with a Details drawer, Rocket's "watch it work", v0's "last good preview" and CrewAI's streaming thoughts are all side-panel narratives. None renders progress inside the product, mapped to the plan the user approved. It also answers the judging criterion "UI-getting-built experience" directly.
- **Prototype cut:** a build-event stream (real or scripted) mapped to component IDs; a CSS reveal from wireframe block to component; an ETA model updated per step.

#### C4. X-ray: depth on demand, per object
- **User problem:** One UI serves two audiences and both are unhappy. Architect shows novices raw IDs and "temperature" while developers get no workspace [3P-hands-on]. Replit's developer-first interface intimidates first-timers (G2). v0 pushes branch and CI vocabulary on business users. A global Simple/Pro toggle is the obvious fix and the most common one among public candidate submissions (§5.6). It hides features instead of connecting them.
- **Idea:**
  - An **X-ray** switch (or hold ⌥) on the preview. Hovering any element reveals its anatomy in one sentence: "This table shows **Leads** (Data) · scored by **Lead Qualifier** (Agent) · pulls from **HubSpot** (Connection) · `app/leads/page.tsx`".
  - Each part is a link that opens the object at the right depth: the plain Agent Card or table for a business user; the exact file and line, schema or trace for a developer.
  - A **vocabulary layer** pairs plain and technical names everywhere: Creativity ↔ temperature; Draft ↔ branch; Go live ↔ merge + deploy; "Must ask before" ↔ tool-approval policy. Hovering shows the other term, so each audience learns the other's language.
  - The onboarding question (§9.1) sets *defaults* only, such as whether the Code tab is visible and whether diffs are staged or auto-applied. No feature is locked behind a mode.
- **Audience:** Both. This is the bridge concept.
- **Why it beats current platforms:** Windsurf's "Send element" and Cursor's ⌥-click jump from preview to code, for developers only. Base44 element chips and Leap architecture tabs are one-directional. **Nobody explains, in plain language, where a UI element's data, logic and code come from.**
- **Prototype cut:** generated components carry `data-arch-*` attributes (file, table, agent, connection); an overlay reads them; each link routes to a tab.

#### C5. Agents as app components: typed contracts and an Agent Map
- **User problem:** App builders bolt the agent on as a chat bubble. Pure agent builders (Dify, n8n, CrewAI, Copilot Studio) know nothing about the app UI. Architect is agent-first but splits the loop: "Editing an agent sends you to a separate product (Lyzr Studio)" [3P-hands-on], and custom tools, guardrails and simulations are Studio-only. Lovable spreads agent building across AI features, edge functions, connectors and MCP.
- **Idea:**
  - Every agent has a typed **contract**: inputs, output schema and side effects. The UI generator renders outputs as cards, tables and forms rather than dumped chat text (OpenAI typed edges; Dify declarative outputs).
  - The **Agent Map** shows *Screen or route → Agent → Tools and knowledge* edges. Clicking an edge shows a sample payload. Changing an output field raises an impact card: "2 screens use `score` · Update them / Keep the old field".
  - The **Agent Card** uses the anatomy the agent-builder market has converged on, in plain labels: What it does · Brain · Can use · Knows · Skills · Remembers · Team · Starts when · Must ask before · Limits · **Used in app**. Its tabs are Build · Test · Evaluate · Monitor · Deploy (Copilot Studio's 2026 set plus Deploy).
  - Guardrails, custom tools, knowledge, memory, simulations and traces all live on the card, so the Studio round-trip becomes optional. "Open in Lyzr Studio" stays as an escape hatch for parity.
  - **Triggers are first-class** on the map: Chat, Voice, Schedule, Webhook, Email and Form, plus human-approval nodes. Architect's landing demo already draws Chat/Voice/Schedule inputs, and SuperFlow already has cron, webhook and approval semantics.
- **Audience:** Both.
- **Why it beats current platforms:** The agent-builder report concludes that no pure agent builder shows app-screen → agent bindings. Architect is the only product whose DNA is "agents inside apps", so this is its most defensible differentiator.
- **Prototype cut:** agent JSON with a schema; the Map drawn with a graph library; an impact check that scans the components referencing a field.

#### C6. Bring your own framework via one open agent spec
- **User problem:** Framework fatigue: developers spend "months evaluating… with no clear winner" (agent builders). Proprietary builders die or trap users: OpenAI Agent Builder was deprecated about 8 months after launch; CrewAI's ZIP export loses visual editing; Copilot Studio harnesses can't be transferred; Base44 and Emergent agents are proprietary. Architect today offers Lyzr agents or GitAgent (beta), and its A2A import of LangGraph/CrewAI/Semantic Kernel agents exists only in Studio.
- **Idea:**
  - Architect's **GitAgent/OpenGAP** spec (the agent as files: SOUL, RULES, DUTIES, `agent.yaml`, skills, memory) becomes the source of truth. Frameworks are **compile targets**: Lyzr-native (the default), LangGraph (Python/TypeScript), CrewAI, OpenAI Agents SDK, Google ADK, Mastra and Claude Agent SDK.
  - The framework picker shows a **convertibility badge**, for example "Round-trips: instructions, tools, model, memory · Locked: custom Python node". Switching later is allowed where the badge says so; otherwise the UI says so plainly, with no silent lock-in.
  - Card edits become **staged diffs** to the spec and the code (Apply / Discard, as in Dify). Code edits update the card, and code-only constructs appear as locked "custom code" blocks.
  - **Import agent code** from GitHub: auto-detect `langgraph.json`, `crew.py`, `root_agent.yaml` or a Mastra config → build a read-only card with tracing attached → "Adopt" to make it editable.
  - **Uniform OpenTelemetry traces** for every framework. Every agent is reachable as REST (with a key: "Use this agent via API"; Studio already generates endpoints), as an MCP server, as an A2A card, as an embeddable widget, and via AG-UI from the app's own frontend.
- **Audience:** Dev. Non-technical users benefit because nothing they build is trapped.
- **Why it beats current platforms:** The agent-builder report found no competitor with a strong import flow for existing agents; Vellum's two-way sync is the closest. Lyzr already owns the pieces (OpenGAP export targets, the A2A registry, REST/gRPC endpoints), but they sit in Studio and a CLI, not in the builder.
- **Prototype cut:** one spec generates Lyzr-native and LangGraph code; a card edit shows the code diff; a LangGraph repo is detected and rendered as a card.

#### C7. Doctor: plain-language fix cards and a loop breaker
- **User problem:** Fix loops are universal and billed: Replit ("we're on build 8"), Emergent (the same Google-login bug billed "233+ times"), v0 ($70+ and 16 hours in an error loop), Lovable (its docs admit "Repeated blind fixes tend to pile up code"), Bolt (7–12M tokens lost in an afternoon). Errors are cryptic (Flowise). Architect has "Help me fix it" and auto-fix, but no logs, console or trace view is documented in the builder; debugging means chat plus a screenshot.
- **Idea:**
  - **One card for every failure source** (build, browser console, network, server logs, agent tool call, integration auth, deploy). Each **Fix card** shows *What happened* (plain) · *Where* (screen or agent, with a thumbnail) · *Likely cause* · *Impact* (which promises are now red) · **[Fix it]** (FREE when self-inflicted, per C2) · *Show technical details* (stack trace, logs, request, diff).
  - **Loop breaker:** after 2 failed attempts on the same error signature, automation stops and the card changes to "Same error 3×". It offers *Roll back to last good (checkpoint 14)* · *Try a different approach* (deeper model plus a root-cause plan) · *Ask a human*. Escalating to a stronger model is shown, not hidden (Rocket).
  - **Silent-failure detectors** raise cards too: the agent returned nothing, a tool was never called, the same tool call repeated, or sample data was served in production (agent-builder pain points; C8).
- **Audience:** Both.
- **Why it beats current platforms:** Windsurf's "1 error — Fix?" chip is developer-grade. Rocket escalates after two failures; Tempo makes fixes free. Nobody combines a plain diagnosis, the impact on the user's own goals, free self-inflicted fixes and an automatic stop.
- **Prototype cut:** capture preview console errors via `postMessage`; a classifier table (error signature → plain explanation); an attempt counter per signature.

#### C8. Honest data: Sample vs Live, everywhere
- **User problem:** Architect apps can run on sample data without saying so; one app "never asked me to connect Google Calendar" [3P-hands-on]. Agents "silently return nothing while appearing to succeed" (agent builders). v0's preview silently sees only Development env vars. Rocket's social login doesn't work in preview.
- **Idea:**
  - Every data-bound element carries a small **source badge**: Sample · Test · Live, colour-coded and labelled.
  - The Connections drawer lists **Needs vs Connected**: "This app needs HubSpot ✓, Google Calendar ✕ (3 widgets on Sample)". Connect cards appear inline where the gap is felt: "Connect Google Calendar to replace sample events".
  - The preview header states its environment: "Preview uses: Draft database · Test Stripe keys · Sample calendar".
  - **Publishing is blocked** for non-technical users while any production path would serve Sample data. Developers get a warning and an "Accept risk" option that is logged.
- **Audience:** Non-tech primarily; developers see the same signals.
- **Why it beats current platforms:** Architect's own "never fake a tool" rule covers tools, not data. v0's claimable test sandboxes solve provisioning, not provenance. No builder labels provenance on the UI itself.
- **Prototype cut:** a `<DataSource>` wrapper component with a badge; a project manifest listing the required connections.

#### C9. Time machine and try-on drafts
- **User problem:** Fear of breaking things is rational (evidence in §6.7): Replit's agent deleted SaaStr's production DB, Rocket's rollback deletes later versions, and Lovable restores code but not data. Architect has no in-product history, restore or diff UI, and it auto-commits noisily.
- **Idea:**
  - **One history timeline** merges checkpoints (every prompt, visual edit and manual code edit), commits and deploys, with thumbnails: "Checkpoint 14 · Commit a1b2 · Live v12".
  - A checkpoint captures the **whole state**: code, DB schema plus a data snapshot, env/secret *references*, and agent config and memory.
  - **Restore is non-destructive:** it creates checkpoint 15. The dialog itemises what will revert and offers *App + chat · App only · Chat only* (Emergent, Claude).
  - **Try on a draft:** any risky change can run on a draft copy with its own DB branch and preview URL. Current and Draft are compared side by side, then *Keep* or *Discard*. Non-technical users see plain words ("Draft → Review → Live"); developers see real branches and PRs (v0).
  - Commits are squashed per checkpoint with AI-written messages, replacing today's per-change auto-commits.
- **Audience:** Both.
- **Why it beats current platforms:** Replit restores code, DB and memory, but only linearly. Base44 branches are full app copies; v0 gives a branch per chat. Nobody combines full-state, non-destructive restore with a visual side-by-side compare in one timeline.
- **Prototype cut:** checkpoints as snapshots of the project JSON plus a DB dump; the restore dialog; a draft flag with a second preview iframe.

#### C10. Visible boundaries: rules you can see and the platform enforces
- **User problem:** SaaStr's "code freeze" existed only as a prompt instruction. Claude Code's `AskUserQuestion` began auto-continuing after 60 s without a changelog entry. Boundaries like "don't deploy until I review" can be dropped when context is compacted (Claude docs). Yet approval prompts get rubber-stamped: Anthropic found 97% of prompts approved reflexively.
- **Idea:**
  - A **run-mode chip** in the composer with plain names: *Ask me for risky stuff* (the default; classifier-guarded) · *Only what I approve* · *Full autopilot*. Hovering shows the technical mode.
  - **Hard stops** ask whatever the mode: deleting data or files, production migrations, changing secrets, publishing to production, the app sending email, SMS or payments, and spending over the cap.
  - When the user states a boundary in chat, the agent proposes a **rule chip** ("No deploy without my review"). Once accepted, it is pinned to the project header, enforced by the platform, and stored as `.architect/rules` for developers.
  - One **approvals tray** sits above the composer, mirrored in the Inbox and on the phone (Codex Remote, Claude Dispatch).
- **Audience:** Both.
- **Why it beats current platforms:** Cursor's Auto-review and Claude's permission modes are developer-oriented. Lovable's approval cards cover only costly actions; v0 groups tool approvals. No one turns a conversational boundary into an enforced, visible rule.
- **Prototype cut:** a rules array checked before simulated deploy and DB actions; an approval card.

#### C11. Dress rehearsal: simulated users test the UI and the agents together
- **User problem:** Architect's browser Testing agent (the Test toggle, v2.2.0) and Lyzr's Agent Simulation Engine ("up to 10,000 automated tests") live in different products. Most builders test UI flows *or* agent behaviour, and "done" claims often lack proof (Cursor, Emergent). Agents "operate effectively about 80% of the time" (agent builders).
- **Idea:**
  - From the promises (C1), Architect generates **personas and scenarios** ("A busy SDR submits a lead with no website"). A rehearsal drives a real browser *through the UI*, lets the agents answer, and grades the outcome against each promise's acceptance check.
  - Results are **proof cards**: pass/fail per promise, a clip or screenshot sequence, the agent trace for the failed step, and cost per scenario. They are replayable, and failed steps become Fix cards (C7).
  - Users add their own checks in plain English; developers can export them as Playwright tests and eval datasets.
  - Rehearsals run in a **fresh session** (Base44) so logged-in state doesn't hide bugs.
- **Audience:** Both.
- **Why it beats current platforms:** Replit's self-test video replay, Base44's Testing Agent and Relevance's eval gating each cover one side. Combining UI flows with agent evals fits "agentic applications" exactly and reuses assets Lyzr already has.
- **Prototype cut:** 3 scenarios run by Playwright (or scripted), with screenshots attached to promises; an agent eval via an LLM judge on one rubric.

#### C12. Launch Readiness that fixes, not just flags
- **User problem:** Rocket reviewers say it is "marketed as production-ready but is beta quality". Lovable's CVE-2025-48757 left 10.3% of scanned apps with exposed databases. Replit's preview and live app drift apart (production secrets must be re-entered; the filesystem resets). Emergent's deploys are a black box. v0's DNS setup sends users out to the Vercel dashboard. Architect documents no pre-deploy checklist and no DNS steps.
- **Idea:**
  - **Publish** opens a readiness sheet with a score (for example 7/9) and plain groups:
    - Promises verified; real data connected; production secrets present.
    - Every private page and table protected; security scan clean (secrets in code, dependency CVEs, open endpoints).
    - Agent guardrails on and eval score at or above threshold; runtime budget set (C13).
    - Accessibility and performance basics; domain and SSL.
  - Each item has **[Fix]** (one click, via the agent or a wizard) or, for developers, **Accept risk** (logged with name and reason). Critical items block non-technical users.
  - A **watchable pipeline** (build → migrate schema → secrets → health check → switch traffic) shows logs on expand. For 30 minutes afterwards, a **health watch** flags a suspect change and offers "Roll back to v12" (Cursor Rollouts).
  - **Environments:** Draft → (Staging) → Production, with a Promote dialog that diffs code, schema and secrets ("3 changes not live").
- **Audience:** Both.
- **Why it beats current platforms:** Base44's Production Pack, Bolt's token-free audit and Lovable's inline publish scan are generic. Architect's version checks the user's own promises, agent evals and runtime budget, which are what make an agentic app "ready".
- **Prototype cut:** a checklist computed from project state; two working Fix actions (add a secret; connect an integration); a scripted pipeline.

#### C13. Run-rate forecast: what the agents will cost after launch
- **User problem:** For agentic apps the bigger bill often arrives after launch. Architect credits are spent "when deployed agents answer end-users". A single CrewAI crew ran up "an overnight $2,400 API bill". Lovable's unified credit pool can pause a live backend. Lyzr itself launched OpenController (2026-09-16) to control agent spend, which is a demand signal.
- **Idea:**
  - Every agent's test runs record steps, tokens and cost. The **forecast** turns them into "Each lead qualification ≈ 6 steps · $0.03 · 4 s. At 500 leads a day ≈ $450/month".
  - **Sliders** for volume and model tier (Fast / Balanced / Best), with the eval score next to each tier, so users trade cost against quality with evidence.
  - **Circuit breakers** on by default: max steps per run, $ per run and $ per day, with alerts at 50/80/100% and a friendly fallback message for end-users when a cap trips.
  - After launch, Insights shows actual versus forecast per agent.
- **Audience:** Both. It is the business case for non-technical users and ops control for developers.
- **Why it beats current platforms:** n8n's "one turn = one execution" is predictable but offers no forecast. Emergent's Universal Key has no per-app spend dashboard. Claude Managed Agents and CrewAI offer budgets, not pre-launch forecasts. Nobody shows end-user runtime cost before go-live.
- **Prototype cut:** average test-run cost × a volume slider; cap fields stored on the agent.

#### C14. Adopt any project: import with a trust gate and an Understanding Report
- **User problem:** Architect imports only Next.js GitHub repos, and the UI entry point is (unverified). Rocket imports only Next.js TS; Lovable can't import repos. Cursor had a Windows 0day in which a malicious `git.exe` in the repo root ran on open. Once a project is imported, the AI knows nothing about it.
- **Idea:**
  - **Sources as peers:** GitHub/GitLab, ZIP, a local folder via the CLI, and projects from competitors (Lovable, Bolt, v0, Replit, Base44, via GitHub or export). Bolt, Anything and Dyad show that migration is a growth lever.
  - **Trust gate:** nothing runs (install scripts, binaries, hooks) until the user confirms, and the gate lists what would run.
  - **Understanding Report** on one screen:
    - the stack and how it runs, with detected dev/test/build commands turned into toolbar Action buttons (Codex);
    - the route map and data model;
    - **detected agents and their framework** (C6);
    - missing env vars ("4 secrets needed") and risks;
    - "What I can and can't do here";
    - a generated `AGENTS.md` to approve, while existing `AGENTS.md` / `CLAUDE.md` / `.cursorrules` files are honoured.
  - Then a running preview and **3 suggested first tasks**, each on its own draft (C9).
- **Audience:** Dev, plus non-technical users migrating from another builder.
- **Why it beats current platforms:** Lovable's "Understanding your project" is only an idea in the research, not a feature. Codex Actions and Dyad's `AI_RULES.md` each do a slice. Nobody pairs a trust gate, a stack map and agent detection before the first edit.
- **Prototype cut:** GitHub API tree plus `package.json`/`pyproject.toml` heuristics → report; no execution until "Trust & run".

#### C15. Bilingual handoff: founder and developer on one project
- **User problem:** Collaboration is shallow. Architect's sharing has one access level with no fork, roles, presence or comments. v0 recommends "View and Duplicate". Developers leave builders for IDEs, and their changes come back as opaque commits. Replit's ZIP export loses history.
- **Idea:**
  - Every change gets a **two-level summary**: plain ("The Leads page now shows a score badge; 2 promises affected") and technical (diff, commit, PR). This applies whether the change came from the agent, a teammate in the browser, or a developer working locally through the CLI, GitHub or the **Architect MCP server** from Claude Code, Cursor or Codex.
  - Non-technical reviewers **pin comments** on preview elements or spec lines. Each becomes a thread that the agent or a developer can pick up ("Send to agent" / "Assign to Priya").
  - A **"What changed since you last looked"** digest opens with before/after thumbnails.
  - **Roles:** Owner · Editor · Reviewer · Viewer. `@architect` works in GitHub PRs for review and fixes (the Claude/Codex pattern).
- **Audience:** Both. This is the assignment's premise (one platform, two audiences) happening inside one project.
- **Why it beats current platforms:** Claude's shareable walkthrough pages, Bolt/Base44 multiplayer and pinned comments cover presence. Nobody translates developer changes into business language, or business feedback into developer tasks.
- **Prototype cut:** a change feed with dual summaries generated by an LLM from the diff; a comment pin on the preview.

### 8.4 Cross-report "do not" list (de-duplicated)
- **Don't rename modes, agents or plans every quarter.** Replit renamed modes about 5 times in 12 months; Lovable went Agent→Build and Chat→Plan and then added a new Chat; Emergent's E-1…E-3 need YouTube explainers. Name by outcome (**Ask · Plan · Build**; model tiers **Fast · Balanced · Best**) and keep the names.
- **Don't ship "Soon" chips or a "Beta" tab title on core surfaces.** Architect's pricing shows "Soon" on custom branding and the analytics dashboard; ship fewer things, completely.
- **Don't make GitHub a prerequisite.** Codex and Claude build their cloud work around it (only Claude's CLI can bundle a non-GitHub repo). Default to a managed repo with GitHub as an upgrade; Architect already offers "Deploy without GitHub".
- **Don't let previews or agents sleep.** Emergent times out after 30 minutes and Rocket after 10–15; keep the sandbox warm while the tab is open, or show "Resuming (3 s)".
- **Don't make a Kanban/agent inbox everyone's landing page.** Devin Desktop's Kanban-first home was criticised because daily work is 90% editing; keep it as a Tasks view.
- **Don't use a drag-and-drop canvas as the primary way to define one agent.** OpenAI Agent Builder was "even more technical than n8n" and is being shut down. Use a canvas only for multi-agent routing and workflows, and don't market a canvas the product lacks (Architect's SEO pages promise one).
- **Don't hide one-way doors.** Examples: Lovable's permanent Cloud region and backend choice, Copilot's non-transferable harness. Warn at the moment of choice.
- **Don't bury backend, deploy and security under "More".** Lovable hides 10+ tools there, and v0 is still read as "frontend-only". Keep a persistent status strip.
- **Don't let parallel agents multiply cost silently.** Cursor Projects used about 5× the tokens, and The Register called Claude Projects "work and pay in parallel". Quote before any fan-out.
- **Don't let support bots invent policy** (Cursor's "Sam"). Ground answers in the docs and hand off to a human.
- **Don't silently make free users' work public or train on it** (Rocket's Free plan).

---

## 9. Candidate feature list & information architecture for Architect 2.0

### 9.1 (a) Candidate feature list

**Legend**
- **Priority is for the prototype.** **Must** = build it working, or convincingly simulated. **Should** = design the screen or state; it can be static. **Could** = roadmap; mention it in the design rationale.
- **Audience:** **Non-tech**, **Dev** or **Both**.
- **[Existing]** = present in current Architect (01 report; v2.2.0, as of 2026-09-26). **Every [Existing] item ships in 2.0 for parity.** Its priority tag only says how much of it the prototype must show. "→" marks how 2.0 extends it.
- **C1–C15** refer to the concepts in §8.
- **ADOPT / IMPROVE / AVOID** (for example "01 IMPROVE", "Cursor AVOID") cite the idea tags in §8 "Ideas for Architect 2.0" of the named platform report.

#### Auth & onboarding
| Feature | Pri | For | Notes / evidence |
|---|---|---|---|
| **[Existing]** Sign-in card: Continue with Google / Continue with Email | Must | Both | → becomes a sheet triggered at "Start Building" instead of blocking the home page |
| **[Existing]** Sign-up auto-creates a Lyzr account (one profile, one credit pool, Studio access) | Should | Both | Show it as a "Your Lyzr account is ready" toast, not a step |
| Try before sign-up: anonymous composer → questions → Living Spec → Build Quote; sign-in asked at Start Building | Must | Non-tech | 01 IMPROVE; persona pages already show a pre-sign-in composer, so this fixes the inconsistent funnel |
| Continue with GitHub | Should | Dev | Also pre-authorises repo import |
| Email magic link or 6-digit code (passwordless) | Should | Non-tech | Rocket email OTP; the §4.1 ideal flow assumes it *(critic: added)* |
| 2FA and passkeys for builder accounts; active sessions list | Should | Both | Lovable 2FA; the account holds OAuth tokens to Gmail, HubSpot and GitHub *(critic: added)* |
| First-run checklist ("Plan → Build → Connect real data → Publish") and an explorable sample project | Should | Non-tech | Contextual onboarding without a tour; Architect has none today *(critic: added)* |
| One onboarding question: "How do you want to work?" (Describe outcomes · Read & write code · Both). It sets the depth preference (Describe outcomes → Guided · Both → Standard · Read & write code → Full detail; §5.6), which only changes defaults and can be changed in Settings | Must | Both | Lovable, v0 and Bolt IMPROVEs; sets defaults only (C4) |
| **[Existing]** AI Consultant "What should I build?" (About you → Role → Time-sinks → Tools → Goals → 3 proposals with hours saved per week; Continue · Update and Explore · Build This) | Must | Non-tech | → a tab of the Start hub; Build This opens the spec |
| **[Existing]** Persona landing pages `/for/:persona` (prompt box, 3 suggestion cards, Browse Prompt Library) | Should | Non-tech | Same composer component as home |
| **[Existing]** Enterprise page (prompt box, Explore admin dashboard, Request a demo) | Could | Both | Static page |
| **[Existing]** Public top nav and landing chrome: Lyzr logo with the hard-hat mascot, Product Hunt badge, How it works, Pricing (modal), For Work ▾ persona menu, Get started for free, footer legal links (Privacy, Security, Terms, Anti Slavery Policy) | Should | Non-tech | F04; keep the mascot as brand, not as a loading game |
| **[Existing]** 3-step scroll demo (01 Plan Mode · 02 Agentic Layer · 03 Production App) and the "What is Architect?" video | Could | Non-tech | F05 → becomes the logged-out explainer under the anonymous composer |
| **[Existing]** Enterprise SSO/SAML (Lyzr platform level) | Could | Both | Settings → Workspace |
| Invite links (join a workspace or project with a role) | Should | Both | C15 |
| **[Existing]** Light/dark theme toggle | Should | Both | |

#### Homepage (Start hub)
| Feature | Pri | For | Notes / evidence |
|---|---|---|---|
| **[Existing]** Composer: tall textarea, typewriter placeholder, paperclip, mic (voice input), send | Must | Both | |
| **[Existing]** "+" menu: Attach files (PDF/DOCX/TXT → knowledge base; CSV/Excel → dataframes), Select theme, Add Studio agents, Add MCP server | Must | Both | → adds Import project and Connect GitHub |
| **[Existing]** `@mcp:` mention | Should | Dev | → extended to `@agent`, `@file`, `@connection`, `@secret`, `@template` (01 ADOPT) |
| **[Existing]** Three suggestion cards with a bolded key phrase | Must | Non-tech | Persona-aware |
| "Start from" chips as peers of the prompt: Describe · Ask the consultant · Template · Import repo · From Lovable/Bolt/v0 · Figma · Screenshot/URL · Agent only | Must | Both | Bolt, Base44, Rocket, Lovable; one picker replaces "4 places to find ideas" [3P-hands-on] |
| **[Existing]** Prompt Library (categories, search, blueprint cards pasted editable into the composer) | Must | Non-tech | → the Templates tab of Start |
| **[Existing]** Theme Manager: 45+ presets; Create theme from Figma (beta), brand guide, repo + branch, zip or `globals.css`; token editor, instructions, assets, live preview; reusable | Should | Both | |
| **[Existing]** Images and screenshots in the prompt (32 MB cap removed) | Must | Both | |
| Recent projects strip with live status (Building · Needs you · Live · Error) | Must | Both | Replaces "3 views of projects" [3P-hands-on] |
| **[Existing]** Left sidebar: What should I build? · Prompt Library · My Projects · Shared Projects · Usage · Agent Studio · Help & Support | Must | Both | F10 → consolidated into the 5-item rail (§9.2: Start · Projects · Agents · Connections · Marketplace, plus Inbox, Usage, Help). Every destination survives; learning content moves into Start and Help |
| **[Existing]** My Projects cards: auto-refreshing screenshot thumbnails, Open, share icon | Must | Both | F12 → `/projects` grid with live status chips; a project opens full-screen, not in a modal [3P-hands-on] |
| **[Existing]** Blueprint library behind the build ("1,000+ prebuilt production-grade blueprints") | Should | Both | F15 → shown on the Spec as "Starting from blueprint: …", and browsable in Templates |
| Composer run-settings chips: Mode · Model tier · Run mode · Budget | Should | Both | Claude and Codex composers; C2, C10 |
| Deep-link prefill `/new?prompt=&repo=&template=` (for "Open in Architect" badges) | Should | Dev | Claude |
| **[Existing]** "Connect with" logo row | Could | Non-tech | Marketing only |

#### Chat & planning
| Feature | Pri | For | Notes / evidence |
|---|---|---|---|
| **[Existing]** Brainstorming & Planning mode starts on the first prompt with guided questions | Must | Both | → tappable cards (2–4 options, Other, "Skip, use defaults"): Lovable, Emergent, v0 |
| Clarity gate: score the prompt and ask only what's missing; "Skip, just build" | Must | Both | Fixes Rocket's "endless follow-up questions" |
| **[Existing]** Live PRD (overview, user stories, agent architecture, data sources, agent table with model, tools and role) | Must | Both | → Living Spec of numbered Promises with acceptance checks (C1) |
| **[Existing]** Plan artifacts: App Mockup, Workflow Diagram, Skill files, PDF/PPT export, Starter files, follow-up chips | Must (mockup, diagram) / Should (exports) | Both | |
| Scope contract diff at approval | Must | Both | C1 |
| Build Quote: per-promise credit and time range, total, budget cap, trim to fit | Must | Both | C2 |
| **[Existing]** "Plan Ready" → Start Building; Back to Plan Mode; skip planning | Must | Both | → approval buttons: Build it · Build it, I'll approve changes · Keep planning · Edit plan (Claude) |
| **[Existing]** Plan toggle (replies tagged "Planning" change no code) | Must | Both | → mode picker Ask (free, read-only) · Plan · Build, with stable names |
| **[Existing]** Test toggle (runs the Testing agent after a build) | Must | Both | → part of Dress rehearsal (C11) |
| **[Existing]** Stop button | Must | Both | → always enabled; stops at the next checkpoint and keeps work |
| Queue vs Steer for messages sent mid-run; a queue drawer (reorder, delete) | Should | Both | Replit, Bolt |
| **[Existing]** "Build this using GitAgent (beta)" question | Should | Dev | → a framework-choice step (C6) |
| **[Existing]** Feasibility pushback (reframes out-of-scope asks) | Must | Non-tech | Shown as a card with alternatives |
| **[Existing]** "Never fake a tool": asks the user to connect a missing MCP first | Must | Both | → extended to data (C8) |
| **[Existing]** Artifacts on request (spec PDF, deck, research doc, HTML/Word) in an Artifacts tab | Should | Non-tech | → Plan → Docs |
| **[Existing]** Rename app (pencil popover) | Must | Both | |
| Threads: many chats per project, each a workstream on its own draft | Should | Both | v0 "one app, many chats" |
| Project brief and decisions log (editable memory, synced to `AGENTS.md`) | Should | Both | Replit and Emergent context loss |
| Transcript density: Story · Steps · Everything | Must | Both | C3 |
| Rule chips pinned to the project | Should | Both | C10 |
| Approvals tray above the composer | Must | Both | C10 |
| Slash commands, Cmd+K palette, prompt history | Should | Dev | v0, Rocket |
| Side-question drawer that doesn't pollute the thread | Could | Both | Claude |
| Context meter (what the agent currently knows) | Could | Dev | Cursor |
| Out-of-scope issues offered as one-click new threads | Could | Both | Claude |

#### UI-getting-built experience
| Feature | Pri | For | Notes / evidence |
|---|---|---|---|
| Three design directions before the build; pick and refine | Should | Non-tech | Lovable, Emergent style picker, Codex best-of-N; shows the cost multiplier |
| Wireframe-to-real progressive preview | Must | Both | C3 (signature) |
| **[Existing]** Build phases Plan → Agents → App (F31) and the phase checklist (blueprint → orchestration → integrations → workflows → code) with an ETA | Must | Both | → live build timeline: promises ticking, agents appearing on the Map, an ETA that recalibrates with reasons, credits vs quote. No carousel or mini-game |
| **[Existing]** Faster build harness and chat-stability fixes (no stuck, duplicated or vanishing messages) | Must | Both | F40; a non-functional parity item: 2.0 must not regress it |
| Resume an interrupted build from the last checkpoint (after an error, a closed tab or lost connection) | Should | Both | N14 reliability perception; Rocket "freezing mid-generation" *(critic: added)* |
| **[Existing]** Self-correction QA loop | Must | Both | Shown as "Checked: 0 console errors" cards |
| **[Existing]** App marked ready only after the preview loads | Must | Both | |
| Auto-verify cards (screenshot plus console/network check per step) | Should | Both | Claude, Codex |
| Background builds with "Notify me when done" | Should | Both | Rocket, Cursor |
| Completion receipt: time, files, credits, FREE tags, proof per promise | Must | Both | v0 receipt; C2 |
| Keep planning and chatting while it builds | Should | Both | 01 IMPROVE |

#### Preview & visual edit
| Feature | Pri | For | Notes / evidence |
|---|---|---|---|
| **[Existing]** "Live App" sandboxed preview; sign up as a test user; place a test Call in voice apps | Must | Both | |
| **[Existing]** Sandbox keep-alive (at least 10 min idle) | Must | Both | → warm while the tab is open; show the last good preview while booting (v0); no "Wake Up Agent" |
| Route bar, device toggles (desktop/tablet/phone), reload, open in new tab | Must | Both | 01 IMPROVE |
| QR code to open the preview on a phone | Should | Non-tech | Anything, Bolt |
| Environment header plus Sample/Test/Live badges | Must | Both | C8 |
| Select mode: click an element to make it a chip in the composer; multi-select | Must | Both | Windsurf, Cursor, Base44 |
| Free instant edits (text, colour, spacing, image) marked "Free edit"; complex edits handed to the agent | Must (text, colour) | Non-tech | Replit, Bolt, Lovable AST edits |
| Annotate mode: numbered pins become one batched instruction | Should | Non-tech | v0 Annotations, Codex |
| X-ray overlay (element → data, agent, connection, file) | Must | Both | C4 (signature) |
| Act-as role switcher (Visitor · User · Admin) | Should | Both | Base44 |
| Agent "Try it" panel beside the preview | Should | Both | 01 IMPROVE |
| Console drawer; errors flow into Fix cards | Must | Dev | C7; Windsurf |
| Shareable preview link (password or team only) with comments | Should | Both | Lovable password-protected links |
| Canvas of all pages as live frames, with sticky notes | Could | Non-tech | Base44 |

#### Code / dev tools
| Feature | Pri | For | Notes / evidence |
|---|---|---|---|
| **[Existing]** "Code preview available for review" | Must | Dev | → a Code tab with file tree, editor (Monaco), search, tabs |
| **[Existing]** Manual edits by cloning from GitHub, editing locally and pushing back | Must | Dev | F45 → still supported, with pushed commits pulled into the agent's context |
| Open in local IDE (VS Code, Cursor, Zed) and SSH or a dev tunnel into the sandbox; local edits sync back into the same timeline | Should | Dev | Replit SSH; Claude "Open in IDE"; D13 *(critic: added)* |
| Generated unit and E2E tests committed to the repo, a test runner in the Code tab, and a CI hook | Should | Dev | D12; today only the browser Testing agent exists *(critic: added)* |
| Dependency manager: add or upgrade packages, respect the repo's lockfile, private registries | Could | Dev | v0 uses the repo lockfile; Bolt private NPM (Teams) *(critic: added)* |
| Platform webhooks (build finished, deploy failed, promise regressed) and scoped API tokens | Could | Dev | Lets teams wire Architect into their own CI and chat *(critic: added)* |
| Review pane: diff chip (+42 −18); scopes This step · All changes · vs Live; keep/undo per hunk and per file; line comments batched into the next message | Must | Dev | Cursor, Codex, Claude; controls stay in one fixed place |
| Manual code edits create checkpoints | Must | Dev | v0 gap |
| Sandboxed terminal (permissions follow the run mode) | Should | Dev | Lovable and Rocket lack one |
| Build and runtime server logs, streaming | Should | Dev | |
| Detected Actions buttons (dev / test / build) | Could | Dev | Codex Actions |
| Stack choice at creation: Next.js (default) · React + Vite · Python/FastAPI backend | Should | Dev | Anti-lock-in (01 AVOID) |
| **[Existing]** Code export (React/Next.js + Python/Lyzr SDK) for self-hosting | Must | Dev | → one-click ZIP plus "Export to Vercel/Netlify/Docker" |
| Project rules and instruction files (`.architect/rules`, `AGENTS.md`; imports `CLAUDE.md` and `.cursorrules`) | Should | Dev | Cursor, Claude, Dyad |
| Model tier picker (Fast · Balanced · Best), with raw model and BYO key under Advanced | Should | Both | LangSmith Fleet, Bolt, Cursor Router; disclose base models (Cursor Kimi backlash) |
| Architect MCP server (drive projects from Claude Code, Cursor or Codex) | Should | Dev | Replit, Emergent, v0 |
| Architect CLI (`architect pull · dev · push · deploy`) and public API | Should | Dev | Anything CLI, Base44 CLI, Replit Admin API; today's OpenAPI page is a placeholder *(critic: raised from Could, because the brief's developer audience expects a local loop)* |
| AI code review with severity levels | Could | Dev | Claude Code Review, Cursor Bugbot |

#### Backend / data
| Feature | Pri | For | Notes / evidence |
|---|---|---|---|
| **[Existing]** Managed database auto-provisioned from the prompt (NoSQL; MongoDB per tutorial) | Must | Both | |
| **[Existing]** Database tab: collections, live document viewer, schema views | Must | Both | → Data tab: Tables · Users · Files · Rules, with plain column names |
| **[Existing]** End-user auth: themed sign-in/up, bcrypt passwords, sessions, protected routes | Must | Both | |
| **[Existing]** Per-app DB isolation | Must | Both | |
| **[Existing]** BYO database via `DATABASE_URL` (Postgres/Supabase), then ask Architect to wire it | Should | Dev | → a guided "Connect Postgres/Supabase" card |
| Draft and Production databases; schema-only migration on publish; the agent never writes to prod without approval | Must | Both | Replit after SaaStr; Anything; C9, C10 |
| Social login (Google/GitHub) that works in preview with managed keys; BYO OAuth under Advanced; enterprise SSO for end-users (SAML, Entra, Okta) | Should | Non-tech | Rocket pain; end-user social login in Architect is (unverified); Base44 and Lovable offer end-user SSO |
| Transactional email for the app (auth emails, notifications) with editable templates; SMS optional | Should | Both | Bolt auth email templates, Base44 email, Anything domain email. Agents that "send email" need a sender *(critic: added)* |
| Payments: Stripe (and Razorpay for India) test → live with a go-live checklist; agent "charge" tools gated by approval | Should | Both | Matrix §2.9: 7 of 10 competitors ✅ (every app builder), Architect ❌ *(critic: added; it was in the matrix but missing here)* |
| Data export (DB dump, CSV per table) and CSV import | Should | Both | Anything SQL dump; export must include data (§6.4) *(critic: added)* |
| Realtime subscriptions (live-updating tables) | Could | Dev | Lovable Cloud realtime *(critic: added)* |
| Access rules generated with every table and explained in plain English | Should | Both | Lesson of Lovable's CVE |
| DB snapshots tied to checkpoints | Should | Both | C9 |
| Seeding with labelled sample data | Should | Non-tech | C8 |
| File storage buckets | Should | Both | Not documented in Architect |
| Scheduled jobs (cron) and inbound webhooks | Should | Both | SuperFlow semantics (Studio) |
| SQL/query console, migrations view, seed scripts | Could | Dev | v0 DB Studio |

#### Agents
| Feature | Pri | For | Notes / evidence |
|---|---|---|---|
| **[Existing]** Multi-agent orchestration: Manager agent plus sub-agents; deterministic SuperFlow workflows (Studio) | Must (manager) / Should (workflow) | Both | Whether Architect generates SuperFlows is (unverified) |
| **[Existing]** Architect designs the agents from the prompt: the plan proposes the manager, sub-agents, tools and KB (the user never has to name agents) | Must | Non-tech | F52 → the agents appear on the Map as they are created (C3) |
| **[Existing]** Agents tab with an agent list | Must | Both | → Agents index with List + **Map** (screen/route → agent → tools) (C5) |
| **[Existing]** Generated agent UI: KPI dashboard plus a right-side "Agent Interface" chat that streams tool steps | Must | Non-tech | F69 → rendered from typed output contracts (C5), so agent results become cards and tables, not only chat |
| **[Existing]** Input channels Chat and Voice (Schedule is drawn in the landing demo) | Must | Both | F56 → the first three entries of the Triggers row below |
| **[Existing]** Edit Agent panel (name, description, role, goal, instructions, model provider and model, temperature, top-p; Save changes) | Must | Both | → Agent Card with plain labels; raw fields under Advanced (C4) |
| **[Existing]** Open in Lyzr Studio; two-way sync with section-level patching | Should | Dev | Kept as an escape hatch, no longer required for any core task |
| **[Existing]** Knowledge: upload PDF/TXT/DOC, crawl a URL; Knowledge Graph (Neo4j), Semantic Model and Text-to-SQL (Studio) | Must (upload, crawl) / Should | Both | → the card's "Knows" section, with re-index and "chunks used" shown in Try it |
| **[Existing]** Tools: built-in integrations and MCP; custom tools via OpenAPI/ACI (Studio-only today) | Must | Both | → custom tools built in-product |
| **[Existing]** Responsible AI policies (toxicity, prompt injection, NSFW, PII redaction, allowed/banned topics, Bedrock Guardrails) | Must | Both | One-click toggles on the card |
| **[Existing]** Hallucination Manager (reflection, groundedness, context relevance) | Should | Both | A toggle, with scores in traces |
| **[Existing]** Memory: session plus Cognis long-term | Should | Both | → on by default with visible retention (n8n and Gemini pain), plus a memory viewer to inspect and delete what an agent remembers per end-user |
| **[Existing]** Voice agents (Realtime or Pipeline engines, telephony, test Call) | Could | Non-tech | Kept, but not in the demo path |
| **[Existing]** Multimodal agents (image and video generation) | Could | Both | |
| **[Existing]** Add existing Studio agents to a project | Should | Both | |
| **[Existing]** GitAgent (beta): Soul, Rules, Duties, View repository on GitHub | Should | Dev | → the open spec as source of truth (C6) |
| **[Existing]** Agents exposed as REST (OpenAPI 3.1) and gRPC (Studio) | Should | Dev | → "Use this agent via API" in the Deploy tab |
| **[Existing]** Studio Builder (form) and Conversational Builder for agents | Should | Both | F68 → replaced inside the project by the Agent Card plus the Agent Copilot chat; Studio stays reachable |
| **[Existing]** OpenGAP CLI export (`opengap export --format` to Claude Code, OpenAI, CrewAI, Gemini, GitHub Copilot, Cursor, Lyzr) | Should | Dev | F60 → an "Export agent as…" menu in the agent's Deploy tab, so the CLI is no longer the only path |
| Any other framework through a container or HTTP adapter that speaks A2A plus OpenTelemetry (AgentCore-style) | Could | Dev | Makes "any framework" literal, beyond the listed compile targets *(critic: added)* |
| End-user feedback on agent replies (thumbs, correction) flowing into eval datasets | Should | Both | Relevance evals from production cases *(critic: added)* |
| Human takeover of a live end-user conversation (support-style apps) | Could | Both | Lyzr Agent Eval already escalates to humans below a confidence threshold *(critic: added)* |
| **[Existing]** Multi-provider models (OpenAI, Anthropic, Google, Bedrock, Groq, Perplexity, BYO) | Should | Both | Behind Fast / Balanced / Best |
| Framework picker with a convertibility badge (Lyzr-native, LangGraph, CrewAI, OpenAI Agents SDK, ADK, Mastra, Claude Agent SDK) | Must (2 frameworks) | Dev | C6 |
| Agent code view synced with the card (staged diffs, Apply/Discard) | Should | Dev | Dify, Vellum |
| Import agent code from GitHub with framework auto-detection | Should | Dev | C6, C14 |
| **[Existing]** A2A import of external agents (Studio: LangGraph, CrewAI, Semantic Kernel) | Could | Dev | → available in-product |
| Typed output contracts rendered by the UI; a schema-change impact card | Should | Both | C5 |
| Triggers: Chat · Voice · Schedule · Webhook · Email · Form; approval nodes | Should | Both | C5 |
| "Must ask before" approvals plus an Approvals Inbox | Must | Both | LangSmith Fleet, Gemini Inbox |
| Limits: $ per run, max steps, $ per day (circuit breakers on by default) | Must | Both | C13 |
| "Try it" chat with a step timeline (tool calls, knowledge hits, cost) | Must | Both | Agent-builder wireframe (10 report §8.2) |
| **[Existing]** Simulation Engine and Agent Eval (Studio) | Should | Both | → Test and Evaluate tabs; eval gate on publish (C11) |
| Traces (OpenTelemetry) and silent-failure detectors | Should | Dev | C7 |
| Deploy an agent: REST + key, MCP server, A2A card, web widget, Slack/Teams | Should (REST, widget) / Could (MCP, A2A, Slack/Teams) | Both | |
| Draft vs Published agent versions; compare; roll back | Should | Both | n8n, Mastra |
| Agent-only projects (no UI) | Should | Dev | Replaces "go to Studio" for pure agent work |
| Run-rate forecast | Should | Both | C13 |
| "Workflow or agent?" recommender | Could | Both | n8n Assistant |
| Identity choice: act as the signed-in user vs the agent's own account | Could | Both | LangSmith Fleet, AgentCore |

#### Integrations & secrets
| Feature | Pri | For | Notes / evidence |
|---|---|---|---|
| **[Existing]** 26 built-in tools that need no API keys (Gmail, Slack, HubSpot, Google Sheets, Notion, Jira, GitHub and more) | Must (3–5 in the demo) | Both | |
| **[Existing]** Connect → review/adjust scopes → Allow; an integration section listing the tools the app uses | Must | Both | Placement today is (unverified) → a Connections drawer plus inline cards |
| Needs vs Connected checklist; inline connect cards where the gap is felt | Must | Non-tech | C8 |
| **[Existing]** MCP servers: "+ → Add MCP server" or `@mcp:`; name, URL, auth (None/API key/OAuth); account-scoped; green-dot status | Must | Both | |
| **[Existing]** Custom tools (OpenAPI/ACI; OAuth, API key or no auth; webhooks into Zapier/Make/n8n), Studio-only today | Should | Dev | → built in-product |
| **[Existing]** Environment variables (⋮ → Name/Value → Add; encrypted at rest; `process.env`) | Must | Both | → a Secrets vault per environment with a secure-input card (never pasted in chat, per Emergent), a "never shown to the agent" lock (Claude credential proxy), and client-leak warnings (v0) |
| Connector taxonomy: Build-time context (MCP) · App connections (shared credential) · End-user connections (per-user OAuth) | Should | Both | Lovable |
| Account-level Connections page (sign in once, reuse across apps) | Should | Both | Replit |
| Test vs Live keys toggle (for example Stripe) | Should | Both | Emergent, v0 |
| Built-in AI key for the app's own AI features, with "Switch to my own keys" | Should | Non-tech | Emergent Universal Key |
| Smart provider picker when several fit (Stripe vs Razorpay) | Could | Non-tech | Replit |

#### GitHub & versioning
| Feature | Pri | For | Notes / evidence |
|---|---|---|---|
| **[Existing]** Connect GitHub (icon top-right) → authorise → repo created → every change auto-commits | Must | Dev | → squashed per checkpoint with AI-written messages |
| GitHub App with per-repo permissions; choose a personal account or an org; new repos private by default | Should | Dev | Bolt org-level GitHub app; Rocket's consent screen names another company *(critic: added)* |
| **[Existing]** GitHub panel: Pull, Push, branch switcher | Must | Dev | |
| **[Existing]** Recovery from local errors (broken dependencies, port changes, build errors) | Should | Dev | |
| **[Existing]** Deploy without GitHub (managed repo) → Export to my GitHub | Must | Non-tech | GitHub is never a prerequisite |
| History timeline (checkpoints + commits + deploys) with thumbnails; non-destructive restore with an itemised dialog (App + chat / App / Chat) | Must | Both | C9; supersedes the **[Existing]** git-commits-only history (F82), which stays visible as the Commits layer |
| Try-on drafts with their own DB branch and preview URL; side-by-side compare; Keep/Discard | Should | Both | C9 |
| Create a branch in-app; a branch per thread | Should | Dev | Today branches must be created on GitHub first |
| Create PR ▾ (PR · Draft PR · Open in GitHub) and a CI status bar with Auto-fix | Should | Dev | Claude, v0 |
| Two-way sync: external commits pulled into the agent's context | Should | Dev | Emergent and Replit gap |
| Respect branch protection | Should | Dev | Cursor |
| `@architect` in GitHub PRs and issues | Could | Dev | Claude, Codex |
| GitLab / Bitbucket | Could | Dev | Replit, Lovable |

#### Import
| Feature | Pri | For | Notes / evidence |
|---|---|---|---|
| **[Existing]** Import a GitHub Next.js repo | Must | Dev | → any stack with detection (Next.js, React + Vite, Node, Python) |
| **[Existing]** Import a design system (Figma beta, brand guide, repo, zip, `globals.css`) | Should | Both | |
| **[Existing]** Reuse existing Studio agents | Should | Both | |
| Workspace trust gate (nothing runs until confirmed) | Must | Dev | C14; Cursor `git.exe` 0day |
| Understanding Report (stack, run commands, routes, data model, detected agents, missing secrets, risks, can/can't, `AGENTS.md`) | Must | Dev | C14 |
| ZIP upload | Should | Both | |
| Import from Lovable / Bolt / v0 / Replit / Base44 | Should | Non-tech | Bolt, Anything, Dyad |
| Import existing agent code (LangGraph, CrewAI, ADK, Mastra) | Should | Dev | C6 |
| Figma frame → UI; screenshot or URL → UI clone | Could | Non-tech | Rocket, Replit |
| Local folder via the CLI | Could | Dev | Claude bundle upload |
| CSV → data table | Could | Non-tech | |
| Import requirements from Notion, Google Docs, Jira or Linear as the plan (PRD → Promises) | Could | Non-tech | Rocket Launchpad `@` sources; many business users already have a PRD *(critic: added)* |

#### Deploy, domains & environments
| Feature | Pri | For | Notes / evidence |
|---|---|---|---|
| **[Existing]** Deploy button top-right → modal with Publish to Marketplace toggle (Category, Description, 160-character Short description, up to 8 Tags), Custom domain, Analytics toggle; success dialog (URL, copy, open) | Must | Both | → the last step of the Readiness sheet |
| **[Existing]** Manual Re-deploy after preview | Must | Both | → a "3 changes not live · Publish" badge with a diff (Replit) |
| **[Existing]** Rename deployed URL with an availability check | Should | Both | |
| **[Existing]** Hosting on an Architect subdomain (docs example `*.architect.new`; `*.architect.space` observed; current default unverified) | Must | Both | |
| Launch Readiness sheet (score; Fix / Accept risk) | Must | Both | C12 |
| Watchable deploy pipeline with logs | Must | Both | Emergent pain |
| Deploy history and one-click rollback | Must | Both | |
| Access levels: Public · Password · Team only · Invite only | Should | Both | Replit |
| Environments Draft → Staging → Production; per-environment secrets and DB; Promote with a diff | Should (Draft + Production: Must) | Both | Enterprise "workspaces and environments" exist today (details unverified) |
| A preview URL per draft or branch | Should | Both | v0; a gap in Claude Code and Codex |
| Custom-domain wizard: buy or connect, DNS records, live verification, SSL status | Should | Non-tech | Architect documents no DNS steps |
| Post-deploy health watch → "Roll back to vN" | Should | Both | Cursor Rollouts |
| **[Existing]** Enterprise hosting: cloud, VPC/on-prem, hybrid, regional | Could | Both | An option in Deploy settings |
| **[Existing]** Self-host via export | Should | Dev | → Export to Vercel/Netlify/Docker |
| Marketplace listing management (update, unpublish, stats) | Should | Both | |
| SEO and social metadata (title, description, favicon, OG image) generated at publish and editable | Should | Non-tech | Lovable's publish dialog auto-fills these *(critic: added)* |
| Uptime check on the live app, with its status in the top-bar strip | Could | Both | Complements the 30-minute health watch *(critic: added)* |
| Legal basics for generated apps: privacy-policy and terms pages, a cookie-consent banner, end-user data-deletion requests | Could | Non-tech | Apps that store end-user data need them before a public launch *(critic: added)* |
| Mobile target (Expo, QR device preview) | Could | Both | Lovable and v0 gap |

#### Monitoring / logs (Insights)
| Feature | Pri | For | Notes / evidence |
|---|---|---|---|
| **[Existing]** App analytics toggle at deploy | Should | Non-tech | → ship the dashboard that is marked "Soon" today: visitors, sessions, agent activations |
| **[Existing]** Traces (enterprise dashboard: trace ID, agent, latency, tokens, credits, status) | Should | Both | → per project and per agent, with a conversation view |
| Error inbox (grouped runtime errors → Fix cards) | Should | Both | C7 |
| Agent cost, actual vs forecast; budget alerts | Should | Both | C13 |
| Runtime logs (streaming, filterable) | Should | Dev | |
| Silent-failure detectors | Could | Both | |
| Performance, SEO and accessibility audits with Fix/Ignore | Could | Non-tech | Rocket |
| **[Existing]** Enterprise admin console (Apps, Insights, Users, Referrals, Analysis; Strategic Insights opportunity map; qualitative analysis of build sessions) | Could | Both | `/admin` |
| Alerts (error spike, latency, budget threshold) | Should | Both | |

#### Quality, testing & security (added area)
| Feature | Pri | For | Notes / evidence |
|---|---|---|---|
| **[Existing]** Testing agent (real browser; Test toggle; finds and fixes runtime and console errors; adds 2–5 min) | Must | Both | → runs in a fresh session, with proof per promise (C11) |
| **[Existing]** "Help me fix it", auto-fix of most errors, and the manual path (describe the error, attach a screenshot) | Must | Both | F36–F37 → Fix cards plus loop breaker (C7) |
| Plain-English acceptance checks per promise | Must | Both | C1 |
| Dress rehearsal (personas through UI and agents; proof cards) | Should | Both | C11 |
| Security scan (secrets in code, open endpoints, missing access rules, dependency CVEs) with Fix | Should | Both | Architect gap; Lovable, Bolt, Base44 |
| Export tests as Playwright specs and eval datasets | Could | Dev | |
| **[Existing]** Enterprise governance: RBAC, approval flows, audit logs, controls on tools, data and outbound actions, exportable compliance evidence | Could | Both | Settings → Workspace |

#### Collaboration
| Feature | Pri | For | Notes / evidence |
|---|---|---|---|
| **[Existing]** Share by email → People with access; Shared Projects; everyone edits the same app | Must | Both | → roles |
| Roles: Owner · Editor · Reviewer · Viewer | Should | Both | Architect has one access level |
| Comments pinned to preview elements and spec lines; Send to agent / Assign | Should | Both | C15 |
| Activity feed with attribution and dual summaries (plain + technical) | Should | Both | C15 |
| Presence avatars; live co-editing | Could | Both | Bolt, Base44 |
| Remix or duplicate a project | Should | Both | Architect today: "no fork or copy" |
| **[Existing]** Marketplace: publish; browse with search, sort (Popular/Recent/Top Rated) and filters (Category, Use case); Preview; Analyze | Should | Both | → ship Clone & Modify, "forthcoming" today |
| Read-only walkthrough page for stakeholders (no account needed) | Could | Non-tech | Claude |
| **[Existing, marked "Soon"]** Custom agent branding / white-label for agencies | Should | Non-tech | F101; the AI Agencies persona page promises "white-label the output". Ship it rather than keep the chip |
| Transfer project ownership, or hand a project to a client's workspace | Should | Both | Bolt project transfer; the agency job-to-be-done *(critic: added)* |
| Team workspaces with pooled credits and per-member caps | Could | Both | Rocket, Emergent |

#### Billing / usage
| Feature | Pri | For | Notes / evidence |
|---|---|---|---|
| **[Existing]** Plans Free / Starter / Pro / Max / Custom; Monthly/Annual toggle; Top Up packs of $25/$50/$100 | Should | Both | Pricing modal with Plans · Top Up tabs |
| **[Existing]** "Built with Architect" watermark on Free | Could | Non-tech | |
| **[Existing]** Dollar-denominated credits spent on both build and runtime | Must | Both | F102 → kept as one currency, split into build and runtime pools (row below) |
| **[Existing]** Procurement via AWS Marketplace (usage units; private offers) and separately priced Studio plans | Could | Both | F103; enterprise buyers need it |
| Self-serve plan change and cancellation; GST-compliant invoices; usage CSV export | Should | Both | §6.13 (easy cancellation); Replit and v0 CSV exports *(critic: added)* |
| **[Existing]** Usage page (total credits, total apps, per-app credits, last used, search, sort) | Should | Both | |
| **[Existing]** Per-agent and per-phase credit breakdown (Plan, Agent Creator, UI Generation, Build, Testing; tokens in/out/cached) | Should | Dev | Powers the quote model |
| Credit meter in the top bar and a usage ring in the composer | Must | Both | Cursor AVOID: "removing cost displays" |
| Build Quote, live meter, and a receipt ledger with FREE tags | Must | Both | C2 |
| Fix Guarantee (self-inflicted fixes are free) | Must | Both | C2 |
| Budget caps (per run, per project) and alerts at 50/80/100% | Must (cap) / Should (alerts) | Both | |
| Separate build and runtime pools; live apps never paused abruptly | Should | Both | Lovable AVOID |
| Out-of-credits pause card: Add credits · Finish essentials · Save and stop | Should | Both | Lovable, Emergent |
| Itemised invoices and per-task history | Should | Both | Emergent AVOID |
| Local currency and UPI | Could | Both | Cursor Start at ₹649 |

#### Settings / account
| Feature | Pri | For | Notes / evidence |
|---|---|---|---|
| Profile; experience/density preference; theme; notification preferences; keyboard shortcuts | Must (density) / Should | Both | |
| Project settings: General · Members & roles · Secrets per environment · GitHub · Instructions & memory · Run mode & rules · Danger zone | Should | Both | |
| Soft delete → Trash (30-day restore) | Should | Both | Base44, Bolt; Rocket's permanent delete is a pain point |
| Account Connections (integrations, MCP, BYO model keys) | Should | Both | |
| API tokens for CLI, API and MCP | Could | Dev | |
| **[Existing]** "Your data isn't used for training"; HIPAA and SOC 2 claims; BYO models and keys | Must | Both | F110 → stated in the UI, and projects are private by default (Rocket Free-plan pain) |
| Account deletion and full export (projects, data, agent specs) | Should | Both | GDPR / India DPDP; the escape-hatch principle (§5.5) *(critic: added)* |
| Region / data-residency choice at project creation, flagged as a one-way door | Could | Both | Lovable's permanent Cloud region; Architect enterprise already offers regional hosting *(critic: added)* |
| Workspace switcher | Should | Both | |
| **[Existing]** Enterprise: SSO/SAML, RBAC, audit logs, policies ("who can publish, run and share") | Could | Both | |

#### Help & learning
| Feature | Pri | For | Notes / evidence |
|---|---|---|---|
| **[Existing]** Help & Support form (reply by email) and mascot live chat | Should | Both | → a "?" menu, bottom-left |
| **[Existing]** Prompt Library, Marketplace, 106 use-case pages, 19 tutorials, docs | Should | Non-tech | → out of the primary nav (10 of 17 sidebar items were learning content [3P-hands-on]) and into Start and Help |
| **[Existing]** Prompting guidance (the "5-minute rule"; Who / What / Vibe / Success; one change per prompt; "Aim for 4–5 agents maximum") | Should | Non-tech | F09, F39 → inline composer tips, and an agent-count warning on the Map |
| **[Existing]** Forward Deployed Engineers and Agentic Transformation Consultants (enterprise) | Could | Both | F111 → "Request an expert" in Help for enterprise workspaces |
| Vocabulary layer: every plain label shows its technical term on hover, and the reverse | Must | Both | C4; this is how each audience learns the other's words *(critic: added as its own row)* |
| Human support with response targets per plan; community (Discord) and office hours | Should | Both | Rocket's named human support is behind its 4.5/5; bot-only support hurts Bolt and Emergent *(critic: added)* |
| Platform status banner, a status-page link and incident notices in the product | Should | Both | N14 reliability perception *(critic: added)* |
| Project-aware helper (reads project state, grounded in docs, hands off to a human) | Should | Both | Emergent Emmy IMPROVE; Cursor "Sam" AVOID |
| Contextual empty states that teach the next step | Must | Non-tech | |
| What's new panel; stable names | Should | Both | Claude and Codex churn AVOID |
| Keyboard shortcuts sheet (`?`) | Could | Dev | |

#### Notifications
| Feature | Pri | For | Notes / evidence |
|---|---|---|---|
| In-app bell and Inbox: Needs you (approvals, questions) · Ready (build done, PR ready) · Problems (failed deploy, error spike, budget) | Must | Both | |
| Tab title/favicon badge and a sound on completion | Should | Both | v0 |
| Email digest, phone push, Slack | Could | Both | Codex Remote, Claude Dispatch |
| Approve directly from a notification | Could | Both | |
| Per-type preferences | Should | Both | |

#### Accessibility & localisation (added area, critic)
| Feature | Pri | For | Notes / evidence |
|---|---|---|---|
| The builder meets WCAG 2.2 AA: keyboard-only flows (composer, approvals, diff review), screen-reader labels on status chips and the run bar, contrast in both themes, reduced motion for the build reveal (C3) | Should | Both | Builder accessibility was not assessed in any platform report; the C3 animation and colour-only status dots (green "connected" dots) need non-colour fallbacks |
| Generated apps get an accessibility check in Launch Readiness, with Fix | Should | Non-tech | Rocket ships WCAG and Core Web Vitals audits |
| Localised builder UI | Could | Both | Lyzr, Emergent and Rocket are all India-founded, so India is a likely early market (inferred) |

#### Parity cross-walk: every current Architect capability (F01–F112) and where §9.1 keeps it
*Added by the critic so a reviewer can tick the parity floor in one pass. "→" names the §9.1 area and row. F112 (no mobile output) is an absence, so 2.0 keeps nothing and adds an optional Expo target.*

| F-IDs | Kept in §9.1 (area → row) |
|---|---|
| F01–F03 | Auth → sign-in card; auto-created Lyzr account; enterprise SSO/SAML |
| F04–F05 | Auth → public top nav and landing chrome; 3-step scroll demo and video |
| F06–F07 | Auth → persona pages; enterprise page |
| F08 | Help → Prompt Library, Marketplace, 106 use-case pages, 19 tutorials |
| F09, F39 | Help → prompting guidance (5-minute rule, one change per prompt, 4–5 agents) |
| F10–F12 | Homepage → left sidebar (becomes the rail); composer; My Projects cards |
| F13 | Auth → AI Consultant |
| F14 | Homepage → Prompt Library |
| F15 | Homepage → blueprint library |
| F16 | Help → Help & Support form and mascot live chat |
| F17–F21 | Homepage → "+" menu (attach, theme, Studio agents, MCP), `@mcp:`, composer controls, images |
| F22–F23 | Homepage → Theme Manager (5 import paths, token editor) |
| F24–F30 | Chat & planning → planning mode, live PRD, plan artifacts, GitAgent question, Stop, Plan Ready / Start Building, feasibility pushback |
| F31, F34–F35, F40 | UI-getting-built → build phases and checklist, self-correction QA loop, harness and stability |
| F32–F33 | Chat & planning → Plan toggle, Test toggle |
| F36–F37 | Quality → Help me fix it, auto-fix, manual path |
| F38 | Chat & planning → "never fake a tool" |
| F41 | Chat & planning → rename app |
| F42–F43 | Preview → Live App, sandbox keep-alive; UI-getting-built → ready only after the preview loads |
| F44–F46 | Code → code preview, manual edits via GitHub, code export / self-host |
| F47–F51 | Backend → managed DB, Database tab, per-app isolation, BYO `DATABASE_URL`, end-user auth |
| F52–F59 | Agents → Architect designs the agents; Edit Agent; Open in Studio; orchestration (Manager, SuperFlow); input channels; voice; multimodal; GitAgent |
| F60 | Agents → OpenGAP CLI export |
| F61–F68 | Agents → knowledge (incl. Knowledge Graph), memory, Responsible AI, Hallucination Manager, Simulation and Eval, multi-provider models, A2A import, REST/gRPC plus the Studio builders |
| F69 | Agents → generated agent UI ("Agent Interface" chat) |
| F70–F74 | Integrations → 26 built-in tools, Connect → scopes → Allow, MCP servers, custom tools, environment variables |
| F75–F79 | GitHub → connect and auto-commit, panel (Pull, Push, branches), local-error recovery, deploy without GitHub → export |
| F80–F81 | Import → Next.js repo; design system; reuse Studio agents |
| F82 | GitHub → history timeline (git commits become its Commits layer) |
| F83–F90 | Deploy → Deploy modal (Marketplace toggle and fields, custom domain, analytics toggle, success dialog), Re-deploy, rename URL, subdomain hosting |
| F91 | Deploy → enterprise hosting (cloud, VPC/on-prem, hybrid, regional) |
| F92 | Billing → watermark on Free |
| F93 | Chat & planning → Artifacts on request (→ Plan → Docs) |
| F94–F95 | Collaboration → share by email / Shared Projects; Marketplace (Clone & Modify shipped) |
| F96–F100 | Billing → Usage page; per-agent/per-phase breakdown; plans; pricing modal (Plans · Top Up, Monthly/Annual); Top Up packs |
| F101 | Billing → plans row (Marketplace access, deploy, publish); Collaboration → custom agent branding (ships instead of "Soon"); Monitoring → analytics dashboard (ships instead of "Soon") |
| F102–F103 | Billing → dollar credits for build and runtime; AWS Marketplace and Studio procurement |
| F104–F106 | Quality → enterprise governance (RBAC, approvals, audit); Deploy → environments (enterprise "workspaces and environments") |
| F107–F109 | Monitoring → admin console; traces; Agents → Simulation Engine and Agent Eval (Pass/Fail dashboard) |
| F110 | Settings → no training on user data; HIPAA/SOC 2; BYO models and keys |
| F111 | Help → Forward Deployed Engineers |
| F112 | Deploy → mobile target (Could); today there is none |

### 9.2 (b) Proposed information architecture

#### Global navigation model: three shells, one noun
- **One noun: Project.** A project holds the app, its agents, data and deployments. An "agent-only" project is a project without UI. This retires the overlapping "project / app / agent / agentlet" vocabulary [3P-hands-on]. The Marketplace lists *published projects*.
- **Shell 1: Public (logged out).** Top bar: Logo · How it works · Templates · Pricing · For Work ▾ · Sign in · **Get started**. The home page *is* the composer (try before sign-up).
- **Shell 2: App (logged in, outside a project).** A slim left rail with **at most five primary items**: **Start** · **Projects** · **Agents** · **Connections** · **Marketplace**. Pinned at the bottom: **Inbox** (bell with a count) · **Usage ring** (credits) · **Help (?)** · **Avatar** (Settings, Billing, Workspace switcher, Theme). Learning content moves into Start (Templates) and Help. The current sidebar has 17 items, 10 of them learning content [3P-hands-on].
- **Shell 3: Project workspace (full screen).** The rail collapses into a "← Projects" breadcrumb. The layout:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ <- Lead Desk | Draft v | Live v12 (+3) | Data ok  Agents ok  Ready 7/9 | Share  Git  42cr [Publish]│
├───────────────────────────────┬────────────────────────────────────────────────────────────────────┤
│ Thread: Main v   [lock] rules │ Plan  App  Agents  Data  Code  Launch  Insights       [X-ray]      │
│                               │                                                                    │
│ conversation                  │                          STAGE                                     │
│  - question & promise cards   │   (App tab: route bar, device, env header,                         │
│  - quote, fix cards, receipts │    Select / Edit / Annotate / X-ray, Act as v, QR)                 │
│                               │                                                         ┌───────┐  │
│ ┌ approvals tray ──────────┐  │                                                         │History│  │
│ │ Ask Architect...       + │  │                                                         │Connect│  │
│ │ Plan v   Balanced v      │  │                                                         │Comment│  │
│ │ Ask-if-risky   50cr    > │  │                                                         │Logs   │  │
│ └──────────────────────────┘  │                                                         └───────┘  │
├───────────────────────────────┴────────────────────────────────────────────────────────────────────┤
│ Building 4/7 - Wiring Lead Qualifier to /leads - 3m12s - ETA ~4m - 18/40 cr - Queue 1 - [Stop]     │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Why each thing sits where it does (first principles):**
- **One primary action, always top-right: Publish.** This is where Architect's Deploy button already sits, so muscle memory is kept. The label follows state: *Publish* → *Publish changes (3)* → *Promote*. Clicking it opens Launch Readiness (C12).
- **A status strip in the top bar** answers "is my app OK?" without opening a tab: environment, live version and unpublished count, Data, Agents, Readiness. Each item opens its tab. This fixes Lovable's buried "More" menu and v0's reputation as "frontend-only".
- **The conversation docks left because it is the input** (say → see). It collapses to a floating composer (Cmd+K or `/`), so Code, Data and Agents can go full width. Chat is a tool, not the frame.
- **Run settings live on the composer** (Mode, Model tier, Run mode, Budget), because the things that set cost and risk belong where the user commits (Claude and Codex composers). The approvals tray sits directly above it (C10).
- **Stage tabs are the product's nouns in build order:** Plan · App · Agents · Data · Code · Launch · Insights. The non-technical default hides Code; it stays reachable through X-ray, a `</>` icon and search. The developer default shows all seven plus the Review diff chip. The default tab follows state: **Plan** before the first build, **App** during and after it (the wireframe fills in, C3), and the last-used tab afterwards.
- **A bottom run bar is always visible:** step, time, ETA, credits, Queue and **Stop** (Replit ADOPT).
- **Cross-cutting things are right-edge drawers** (History, Connections & secrets, Comments, Logs), reachable from any tab and deep-linkable.

#### Pages and routes
| Route | Screen | What it contains |
|---|---|---|
| **Public** | | |
| `/` | Home (logged out) | Anonymous composer, 3 suggestion cards, Start-from chips, templates strip, how-it-works demo (Plan → Agents → App), logo row, footer. Logged-in users land on `/start` |
| `/for/:persona` | Persona page **[Existing]** | The same composer with persona copy and persona templates |
| `/enterprise` | Enterprise page **[Existing]** | Prompt box, governance features, admin demo, Request a demo |
| `/pricing` | Pricing page + modal **[Existing modal]** | Plans · Top Up tabs; Monthly/Annual; worked cost examples; the Fix Guarantee explained |
| `/templates`, `/templates/:slug` | Templates / Prompt Library **[Existing]** | Categories and search; a blueprint page (promises, agents, integrations, estimated cost) → Use template |
| `/marketplace`, `/marketplace/:app` | Marketplace **[Existing]** | Search, sort, filters; an app page with Preview, Analyze (agents and prompts) and Remix |
| `/login`, `/signup`, `/auth/callback` | Auth | Google · GitHub · Email (password, or a magic link / 6-digit code) · SSO; 2FA challenge when enabled; returns the user to the pending action (for example Start Building) |
| `/invite/:token` | Accept invite | Project or workspace name, role, Join |
| `/share/:token` | Shared preview or walkthrough | Read-only app preview or walkthrough; comments if allowed |
| **App shell** | | |
| `/onboarding` | One question | "How do you want to work?" plus an optional role; sets density |
| `/start` | Start hub | Composer; tabs **Describe · Consultant · Templates · Import**; recent projects with live status |
| `/start/consultant` | AI Consultant **[Existing]** | Stepper (About you → Role → Time-sinks → Tools → Goals); a "Tailored App Ideas" panel with 3 cards and hours saved → Build This |
| `/start/import` | Import wizard | Source (GitHub, ZIP, competitor, Figma/URL, agent code) → Trust gate → Understanding Report → Open project |
| `/new?prompt=&repo=&template=` | Deep link | Prefills the composer or the import |
| `/projects` | Projects | Grid or list; filters Mine · Shared with me **[Existing Shared Projects]** · Archived; status chips; search; New; card menu (Open, Share, Duplicate, Archive, Delete → Trash) |
| `/projects/trash` | Trash | 30-day restore |
| `/agents` | Agent library | Every agent across projects (status, framework, cost over 7 days, eval score); **New agent ▾** (Describe · Template · Import code · Start in a framework) creates an agent-only project. Replaces the "Agent Studio" sidebar hop |
| `/connections` | Connections | Integrations (connected accounts and scopes), MCP servers (status dots), model keys (BYOK), GitHub account |
| `/inbox` | Inbox | Needs you · Ready · Problems across all projects; approve or reply inline |
| `/usage` | Usage **[Existing]** | Balance; per-project, per-phase and per-agent breakdown; receipts ledger with FREE tags; budgets and alerts |
| `/billing` | Billing | Plan, Top Up, invoices, payment method |
| `/settings/*` | Account settings | Profile, experience/density, notifications, theme, shortcuts, API tokens; **Security** (2FA, passkeys, sessions); **Your data** (full export, delete account); `/settings/workspace` for members, roles, SSO, audit log and white-label branding |
| `/admin` | Enterprise admin **[Existing]** | Apps, Users, Insights, opportunity map, policies, traces |
| `/help` | Help centre | Docs search, tutorials, What's new, contact (form or live chat, with a human escalation path), community, platform status, "Request an expert" (enterprise FDEs) |
| **Project workspace** | | |
| `/p/:id/plan` | Plan tab | Sub-tabs **Spec** (promises, scope contract, quote, decisions log) · **Mockup** · **Workflow** · **Design** (theme, 3 directions) · **Docs** (PDF, PPT, skill and starter files) **[Existing PRD and artifacts]** |
| `/p/:id/app` | App tab **[Existing Live App]** | Preview toolbar: route bar, device, environment header, Select · Edit · Annotate · X-ray, Act as ▾, QR, open in new tab; console drawer. Query parameters `route`, `device`, `as` and `draft` |
| `/p/:id/agents` | Agents index | List ⇄ Map; New agent ▾ |
| `/p/:id/agents/:agentId/:tab` | Agent detail | Top bar: name, framework badge, Draft/Live vN pill, Simple ⇄ Code, Test run, Publish agent. Tabs **Build · Test · Evaluate · Monitor · Deploy**. Build = Agent Copilot chat · Agent Card · Try it (see the 10 report's §8.2 wireframe) |
| `/p/:id/data` | Data tab **[Existing Database tab]** | Tables · Users (end-user auth) · Files · Rules; Draft/Production switch; SQL console for developers |
| `/p/:id/data/:table` | Table view | Rows with Sample/Live badges, schema, relations |
| `/p/:id/code` | Code tab | File tree, editor, terminal, search |
| `/p/:id/code/review` | Review | Diff with scopes (`?scope=step`, `all` or `live`), hunk keep/undo, comments, Create PR ▾ |
| `/p/:id/launch` | Launch tab | **Readiness** · **Environments** (Draft / Staging / Production, Promote) · **Deploys** (history, logs, rollback) · **Domains** (wizard) · **Listing** (Marketplace fields) · **Site info** (SEO title, description, favicon, OG image; legal pages) |
| `/p/:id/insights` | Insights tab | Analytics · Conversations & traces · Errors inbox · Costs (actual vs forecast) · Alerts |
| `/p/:id/settings` | Project settings | General, Members & roles, Secrets per environment, GitHub, Instructions & memory, Run mode & rules, Danger zone |
| `/p/:id/...?thread=:threadId` | Thread | Selects a chat thread in the left dock |
| `/p/:id/...?panel=history` (or `connections`, `comments`, `logs`) | Drawers | Deep-linkable right-edge drawers |
| **Generated apps** | | |
| `https://:slug.architect.space` | Production | Custom domain optional. Which Architect domain is the default today (`architect.new` or `architect.space`) is (unverified), see §7.6 |
| `https://:slug--:draft.preview.architect.space` | Draft preview | Shareable; password- or team-gated |

#### Key modals, drawers and inline cards
| Name | Type | Trigger | Contents |
|---|---|---|---|
| Sign-in sheet | Modal | Start Building while anonymous; any save | Google · GitHub · Email; "Your plan is saved" |
| Onboarding question | Modal (first run) | After sign-up | 3 choices plus role; Skip |
| Clarifying question cards | Inline chat card | Plan mode | 2–4 options, Other, "Skip, use defaults"; multi-select where needed |
| Scope contract + Build Quote | Inline card → drawer | "Plan Ready" | Promise list (included/deferred), per-item cost and time, total, cap slider, model tier, Build it ▾ |
| Budget pause | Inline card + toast | 80% of the cap | Add budget · Finish essentials · Stop and keep work |
| Out of credits | Modal | Balance reaches 0 | Top up · Finish essentials · Save and stop (live apps unaffected) |
| "+" menu | Popover | Composer "+" | Attach · Theme · Existing agents · MCP server · Import · Connect GitHub **[Existing + new]** |
| Theme Manager / Create theme | Modal **[Existing]** | + → Select theme | Presets; import sources; tokens, instructions, assets, preview; Save |
| Design directions | Full-width overlay | Before the first build (optional) | 3 previews; Refine; Use this |
| Approvals tray | Inline, above the composer | Hard stop or risky action | Action, reason, diff or impact; Approve · Deny · Always allow (per rule) |
| Rule chip editor | Popover | Agent proposes a rule, or user clicks the lock | Rule text, scope, Enforce |
| Connect integration sheet | Side sheet **[Existing flow]** | Connect button or inline card | Provider, scopes (review/adjust), act as user or as agent, Allow |
| Add MCP server | Modal **[Existing]** | + menu or `@mcp:` | Name, URL, auth (None / API key / OAuth), Connect |
| Secure secret input | Inline card | The agent needs a key | Name, masked value, environment(s), "never shown to the agent" |
| Connections & secrets drawer | Right drawer | Status strip or ⋮ **[Existing env vars]** | Needs vs Connected, secrets per environment, MCP status |
| History drawer | Right drawer | Clock icon | Timeline of checkpoints, commits and deploys; Restore · Compare · Try on draft |
| Restore dialog | Modal | Restore | What reverts (code, DB, env references, agent memory); App + chat / App only / Chat only; "nothing is deleted" note |
| Review pane | Drawer or Code sub-view | Diff chip `+42 −18` | Files, diff, scopes, hunk keep/undo, comments, Create PR ▾ |
| GitHub popover | Popover **[Existing panel]** | Git icon | Connect, repo, branch switcher, Pull, Push, New branch, Create PR, CI status |
| Fix card | Inline chat card (and in Insights) | Any error | What / where / cause / impact; Fix it (FREE); technical details; loop-breaker options |
| Console & logs drawer | Bottom drawer | Error badge or Logs | Console, network, server logs, agent traces |
| X-ray overlay | Preview layer | X-ray toggle or hold ⌥ | Element anatomy with links |
| Readiness sheet | Modal (Publish), extends the **[Existing]** Deploy modal | Publish | Score; grouped checks with Fix / Accept risk; environment target; access level; Marketplace toggle and fields; custom domain; analytics toggle |
| Deploy progress | Sheet | After Publish | Pipeline steps and logs → success dialog (URL, copy, open) **[Existing]** |
| Promote dialog | Modal | Launch → Promote | Draft → Production diff (code, schema, secrets); approvals (enterprise) |
| Domain wizard | Modal | Launch → Domains | Buy or connect; DNS records; Check status; SSL |
| Share dialog | Modal **[Existing, extended]** | Share | Invite by email with a role; link access; People with access |
| Comment pin | Popover | Comment mode | Thread, @mention, Send to agent, Assign |
| New agent ▾ | Menu | Agents | Describe · Template · Import code · Start in a framework |
| Framework picker | Modal | New agent, or the plan's framework step | Framework cards with language, trade-off and convertibility |
| Import trust gate | Modal | Import | What would run (scripts, hooks); Trust & run / Read-only |
| Command palette | Overlay | Cmd+K | Actions, files, agents, settings, help |
| Notifications popover | Popover | Bell | Needs you · Ready · Problems |
| Helper | Right slide-over | ? → Ask | Project-aware Q&A with doc citations; Contact a human |
| Pricing modal | Modal **[Existing]** | Upgrade | Plans · Top Up |
| Delete project | Modal | Danger zone | Soft delete to Trash; unpublish; DB kept 30 days |

### 9.3 (c) Hero flows to prototype

Each flow lists the persona, the steps (with routes), the §8 concepts it proves, and what must really work versus what can be simulated.

#### HF1. First app from one sentence (non-tech, anonymous → verified preview)
*Meera, a sales-ops lead who doesn't code, wants to "score inbound HubSpot leads and draft follow-ups".*
1. `/`: she types the goal into the composer (or taps a suggestion). No sign-in yet.
2. The chat shows 3 clarifying cards: *Where do leads come from?* (HubSpot) · *Who uses it?* (Just me / My team) · *Send emails automatically?* (Draft only). "Skip, use defaults" is available.
3. The Plan tab fills live: 5 Promises with acceptance checks, an agent table (Lead Qualifier, Email Drafter), a mockup and a workflow diagram.
4. Scope contract card: "You asked for Slack alerts → deferred (needs a Slack connection) · **Include (+~4 cr)**". She includes it.
5. Build Quote: 36–48 credits, 9–14 min. She sets the cap to 50 and taps **Build it**.
6. The sign-in sheet appears (Google); her plan and quote are preserved.
7. The App tab opens on the wireframe. Blocks develop into real UI, agents pop onto the Map, promise chips tick, and the run bar shows step, ETA and credits vs quote. She types "make the header navy", which is queued.
8. Completion receipt: 41 credits, 12 min, 6/6 promises Verified with screenshots, 1 FREE fix.
9. The leads table shows **Sample** badges and an inline card: "Connect HubSpot to see real leads".
- **Proves:** C1, C2, C3, C8. **Real:** LLM-generated questions, spec and quote; one generated app (or a scripted reveal of pre-built components). **Simulated OK:** the ETA and credit model.

#### HF2. "I don't know what to build" (non-tech; the parity flow)
1. `/start` → **Consultant** tab.
2. About you (pre-filled) → Role → Time-sinks → Tools → Goals, pressing **Continue** at each step.
3. "Tailored App Ideas" shows 3 cards with hours saved per week and the integrations each needs.
4. **Update and Explore** refines them; **Build This** opens the Plan tab with the promises pre-filled.
5. The flow continues as HF1 step 4.
- **Proves:** parity with the current AI Consultant, plus C1. **Real:** consultant prompts via an LLM.

#### HF3. Iterate visually without fear (non-tech)
1. App tab → **Select** → she clicks a KPI card; a chip appears in the composer: "Show conversion % here".
2. **Edit**: she changes the headline text and colour. The change is instant and badged "Free edit".
3. **Annotate**: she drops 3 numbered pins with notes → "Apply 3 notes" → one agent run quoted at "~3 cr".
4. **X-ray** on the leads table shows "Leads · scored by Lead Qualifier · from HubSpot". Clicking "Lead Qualifier" opens its Agent Card.
5. She dislikes a result, opens the **History** drawer and restores the checkpoint 14 thumbnail. The dialog lists what reverts (code and layout; DB untouched), and a new checkpoint 16 is created.
- **Proves:** C4, C9, C2. **Real:** select/edit of text and colour; X-ray metadata; restore of project state.

#### HF4. Tune an agent and give it boundaries (both)
1. Agents tab → **Map** shows `/leads` → Lead Qualifier → HubSpot and ICP.pdf.
2. On the card she edits *What it does*, keeps *Brain: Balanced* (≈2 cr/run), uploads `pricing.pdf` to *Knows*, and adds Gmail under *Can use*. The Connect sheet opens (review scopes → Allow).
3. She sets *Must ask before: Sending email* and *Limits: $0.50 per run, 25 steps*.
4. **Try it**: "Qualify acme.com". The timeline shows `hubspot.search`, ICP.pdf p.3, then a pause for email approval. She approves in the tray: score 82 · $0.03.
5. She asks the Agent Copilot "Also check LinkedIn". Staged diff chips appear (+ tool linkedin, ~ instructions) → **Apply**.
6. A new output field `reason` triggers an impact card: "1 screen uses this agent's output; show the reason on /leads?" → Yes.
7. **Publish agent** v2, with its eval score shown.
- **Proves:** C5, C10, C13. **Real:** card editing, Try it with a real LLM and one real or mocked tool, approval gating.

#### HF5. A developer imports a repo and ships a change via PR (dev)
1. `/start/import` → GitHub → she picks `acme/support-portal`.
2. **Trust gate:** it lists a `postinstall` script. She chooses **Trust & run** (Read-only is the alternative).
3. **Understanding Report:** Next.js + FastAPI; 12 routes; Postgres via Prisma; a detected **LangGraph** agent `triage_graph`; 3 missing secrets; a generated `AGENTS.md` → Approve.
4. Secure-input cards collect the 3 secrets for the Draft environment.
5. The preview runs, and toolbar Actions appear: dev · test · build.
6. In a new thread she asks "Add rate limiting to /api/tickets". It runs on draft branch `arch/rate-limit`. The Review pane shows +42 −18; she keeps/undoes hunks and leaves a line comment, and the agent revises.
7. **Create PR ▾** → PR opened. The CI bar shows checks, and Auto-fix resolves a lint failure.
- **Proves:** C14, C9, C6 (detection). **Must be real for developer credibility:** GitHub OAuth, repo read, report generation, PR creation. **Simulated OK:** running the imported app.

#### HF6. Build an agent in a chosen framework and expose it (dev)
1. `/agents` → **New agent ▾ → Start in a framework** → LangGraph (Python). The badge says "Round-trips instructions, tools and model; custom nodes locked".
2. The developer describes "Triage support tickets into billing, tech or sales".
3. The card fills. The **Code** toggle shows `graph.py` and `agent.yaml` (the open spec) side by side.
4. A code edit to a node shows a locked "custom code" block on the card. An instructions edit on the card produces a staged diff to both files.
5. **Test** tab: 10 auto-generated scenarios, 9/10 pass. The OpenTelemetry trace of the failure opens as a Fix card.
6. **Deploy** tab: REST endpoint + key, MCP server URL, A2A card, web-widget snippet. The run-rate forecast shows $0.004 per ticket at 2,000 a day.
7. In the support-portal project, `@agent triage` wires the UI to it via AG-UI, and the Map shows `/tickets` → triage.
- **Proves:** C6, C5, C11, C13. **Real:** spec → code for 2 frameworks; test runs. **Simulated OK:** a proxied REST endpoint.

#### HF7. Error → plain explanation → fix → loop breaker (both)
1. In the preview, "Draft email" throws a 500.
2. Fix card: "Drafting failed because Gmail isn't connected in Draft. Impact: Promise 4 (draft in 1 min) is now red." **[Connect Gmail]** · Show technical details.
3. A different error, a hydration mismatch introduced by checkpoint 15, offers **[Fix it · FREE]**.
4. The fix fails twice. The card becomes "Same error 3×" with *Roll back to checkpoint 14* · *Try a different approach* (Best model plus root-cause plan, ≈4 cr) · *Ask a human*.
5. She chooses a different approach. The plan is shown, the error is fixed, Promise 4 turns green, and the receipt shows FREE.
- **Proves:** C7, C2, C9. **Real:** console-error capture, classification, attempt counter. **Simulated OK:** the fix itself.

#### HF8. Launch with confidence (both)
1. **Publish** (top-right) opens Readiness at **6/9**:
   - ✕ Calendar is still on Sample data
   - ✕ Production secret `HUBSPOT_TOKEN` is missing
   - ✕ `/admin` is unprotected
   - ⚠ No runtime budget is set
   - ✓ Guardrails on · ✓ Eval 0.86 · ✓ others
2. She clicks **Fix** on each: connect Calendar (sheet); add the production secret (secure input); protect the route (the agent does it, quoted at ~1 cr); set a budget from the forecast (cap $450/month).
3. She chooses Access: Team only; Marketplace off; Analytics on (the **[Existing]** fields).
4. The deploy pipeline runs (build → migrate schema → secrets → health check → switch traffic), then the success dialog shows the URL with copy and open.
5. Domain wizard: connect `leads.acme.com` → DNS records → Check status → SSL issued.
6. The 30-minute health watch stays green, and the status strip reads "Live v1".
- **Proves:** C12, C8, C13. **Real:** readiness computed from project state and two working fixes. **Simulated OK:** the pipeline. A real deploy is optional (see §10 Q7).

#### HF9. Safe change to a live app on a draft (both)
1. The app is live. Meera asks "Add a pricing calculator page". The run-mode chip reads "Ask me for risky stuff", and the rule chip "No deploy without my review" is pinned.
2. Because the app is live, Architect proposes **Try on a draft** by default: a draft with its own DB branch and preview URL `lead-desk--pricing.preview.architect.space`.
3. She compares Current | Draft side by side and shares the draft link with her manager (Reviewer role), who pins 2 comments.
4. **Send to agent** turns the comments into revisions.
5. Launch → **Promote** shows a diff (1 new page; 1 schema change adding a `quotes` table; 0 secrets). She approves and it deploys; "Roll back to v1" stays available for 30 min.
- **Proves:** C9, C10, C12, C15.

#### HF10. Founder ↔ developer handoff (both)
1. Meera opens **Share** and invites Priya (Editor, a developer).
2. Priya works from Claude Code through the **Architect MCP server** (or `architect pull`) and pushes "add a HubSpot webhook for real-time leads" to a branch.
3. Architect pulls the commits into context. The activity feed shows a dual summary: "Leads now arrive instantly, no refresh needed" / "new `/api/hooks/hubspot`, 3 files, +88 −4".
4. Meera opens **What changed since you last looked**: before/after thumbnails, and Promise 1 re-verified by a rehearsal run.
5. She pins a comment on the leads table ("show a source icon") → **Assign to Priya** or **Send to agent**.
- **Proves:** C15, C11, C6. **Real:** the dual summary generated from a real diff. **Simulated OK:** the MCP/CLI path.

#### Flow coverage and suggested demo order
| Judging area | Covered by |
|---|---|
| Auth, homepage, onboarding | HF1, HF2 |
| Chat and planning | HF1, HF2, HF9 |
| UI-getting-built | HF1 (C3) |
| App preview and visual edit | HF3 |
| Agent section | HF4, HF6 |
| GitHub and import | HF5, HF10 |
| Deploying | HF8, HF9 |
| Errors and trust | HF7, HF8 |
| Developer depth | HF5, HF6, HF10 |

**Suggested ~10-minute demo:** HF1 (4 min) → HF3 (1.5) → HF4 (1.5) → HF7 (1) → HF8 (1.5), then HF5 as a 1-minute developer cut. HF2, HF6, HF9 and HF10 can be clickable prototypes.

---

## 10. Open questions for the candidate

Ask these before building. The default in the last column is the assumption to make if no answer comes back.

| # | Question | Why it matters | Default if unanswered |
|---|---|---|---|
| 1 | **How much time is there, and is it a solo build?** | Sets depth: Musts only, or Musts plus Shoulds | About a week, solo: HF1, HF3, HF4, HF7 and HF8 working; the rest clickable |
| 2 | **What must actually work** versus be clickable: real app generation, a code-execution sandbox, GitHub OAuth and PRs, real deploys, real agent runs? | "Working functionality" earns plus points, but breadth vs depth is a trade-off | Real LLM for questions, spec, quote and agent Try it; real GitHub read + PR; generated apps from templated components; deploy simulated |
| 3 | **Can I use Lyzr's own APIs** (Agent Studio, agent REST endpoints, OpenGAP/GitAgent), and is there a sandbox account or key? | Decides whether the agent layer is real Lyzr or a mock with the same shape | Mock a Lyzr-compatible agent layer and use the OpenGAP spec format as-is |
| 4 | **Which LLM provider and budget** for the prototype and the demo? Any model restrictions? | Cost and reliability of a live demo | One provider with a hard spend cap; cached runs for the demo script |
| 5 | **Stack preferences for the prototype itself?** Must it mirror Architect's (Next.js + MongoDB)? | Reviewer familiarity; code reuse | Next.js + Tailwind + shadcn/ui; Postgres or SQLite; React Flow for the Agent Map |
| 6 | **Is real authentication required** (Google OAuth), or is mocked sign-in acceptable? Should it use a Lyzr account? | Setup time vs realism | Auth.js with Google and an email magic link |
| 7 | **Where should the prototype be hosted**, and must "Publish" deploy real generated apps? | A public URL for judges; deploy complexity | Prototype on Vercel; Publish simulated, with one real preview URL for a template app |
| 8 | **Branding and naming:** keep Lyzr/Architect branding and visual language (black pills, graph-paper canvas, teal accents, mascot), or rebrand? What should "2.0" be called, given v2.0–v2.2 already shipped? | Avoids confusion with the shipped v2.x; brand consistency | Keep the Lyzr brand family; use a codename in the docs |
| 9 | **Audience weighting and scope:** equal weight on non-technical users and developers? Are enterprise features (RBAC, admin, VPC, SSO) and native mobile in scope? | Where to spend polish | About 60/40 non-tech/dev in the demo; enterprise as settings stubs; responsive web only |
| 10 | **Which agent frameworks must be demonstrable**, and is GitAgent/OpenGAP intended as the source-of-truth format? | Defines "build agents in any framework" for grading | Lyzr-native + LangGraph generated from one spec |
| 11 | **May the design change the credit model** (quotes, Fix Guarantee, separate build and runtime pools), or must current plans and Top Up stay as they are? | C2 and C13 touch pricing policy | Keep the plans; add quote, receipt and guarantee layers on top |
| 12 | **Demo and deliverable format:** live demo, recorded video or a deployed link? How long? Will judges click through themselves (seeded accounts and data needed)? Is a design rationale doc or Figma expected? | Shapes seed data, script and polish | A deployed link + an 8–10 min video + a short design-rationale doc |
| 13 | **Can I get a logged-in Architect account** to verify today's post-login screens? The research relied on docs, pre-revamp tutorials and one teardown [3P-hands-on] | Parity claims about the logged-in UI are partly (unverified) | Treat the logged-in layout as unverified and keep every documented feature |
| 14 | **How strict is "don't copy any platform's UI"** for industry conventions (a chat + preview split, diff views, Cmd+K)? | Avoids penalties for familiar patterns | Use conventions where users expect them; differentiate in flows (C1–C15) and document the reasoning |
| 15 | **May the demo use real third-party accounts** (HubSpot, Gmail, Slack), or should integrations be mocked? | OAuth app approvals and privacy take time | Mock integrations with labelled Sample data, which also demonstrates C8 |

---

## 11. Sources

These are the key sources behind each platform's findings, taken from the structured summaries and the report source lists. Every platform report ends with its **full** source list, and in-text claims in those reports link to the exact page. Sources were accessed **2026-09-25/26**.

### 11.1 architect.new (Lyzr Architect, current product)
Full report: [platforms/01-architect-new.md](platforms/01-architect-new.md)
- [Architect docs index (llms.txt)](https://docs.architect.new/llms.txt)
- [Changelog overview](https://docs.architect.new/changelog/overview) · [v2.2.0 release notes](https://docs.architect.new/changelog/v2-2-0)
- [Planning & brainstorming](https://docs.architect.new/build/planning-brainstorming) · [Build guide](https://docs.architect.new/build/build-guide)
- [Deployment](https://docs.architect.new/build/deployment) · [GitHub connect](https://docs.architect.new/build/github-connect)
- [MCP servers](https://docs.architect.new/integrations/custom-tools/mcp-servers) · [Architect vs Studio](https://docs.architect.new/introduction/platform/architect-vs-studio)
- [architect.new landing page and pricing modal (observed 2026-09-26)](https://www.architect.new/) · [/enterprise](https://www.architect.new/enterprise) · [/for/ai-agencies persona page](https://www.architect.new/for/ai-agencies)
- [Lyzr platform architecture](https://docs.lyzr.ai/enterprise/get-started/architecture.md) · [Lyzr A2A protocol](https://docs.lyzr.ai/enterprise/integrations/a2a-protocol.md)
- [Hands-on teardown of the real product, shambhu-10/lyzr (the [3P-hands-on] source)](https://github.com/shambhu-10/lyzr)
- [SiliconANGLE exclusive (Feb 2026)](https://siliconangle.com/2026/02/06/exclusive-startup-lyzr-ai-launches-app-builder-aimed-moving-agents-production-volume/) · [Launch press release](https://natlawreview.com/press-releases/lyzr-launches-architect-first-enterprise-grade-text-agent-platform-building)
- [Product Hunt launches](https://www.producthunt.com/products/architect/launches) · [TechCrunch: agent-run $100M raise](https://techcrunch.com/2026/07/09/an-ai-agent-startup-just-let-its-agent-run-its-100-million-fundraise/)
- [GitAgent / OpenGAP protocol](https://github.com/open-gitagent/gitagent-protocol)

### 11.2 Replit
Full report: [platforms/02-replit.md](platforms/02-replit.md)
- [Introducing Agent 4](https://replit.com/blog/introducing-agent-4-built-for-creativity) · [What changed from Agent 3 to Agent 4](https://replit.com/blog/whats-changed-agent3-to-agent4)
- [Task system](https://docs.replit.com/core-concepts/agent/task-system.md) · [Plan vs Build mode](https://docs.replit.com/learn/plan-vs-build-mode.md)
- [Design canvas](https://docs.replit.com/design/canvas.md) · [Visual editor](https://docs.replit.com/design/visual-editor.md)
- [Publish your app](https://docs.replit.com/build/publish-your-app.md) · [Import from providers](https://docs.replit.com/build/import-from-providers.md)
- [Connectors](https://docs.replit.com/chat/connectors.md) · [Routines](https://docs.replit.com/chat/routines.md) · [App Testing](https://docs.replit.com/replitai/app-testing)
- [Black-box pen tests](https://replit.com/blog/black-box-pen-tests) · [Free Mode](https://replit.com/blog/replit-introduces-free-mode)
- [Pricing and plans](https://docs.replit.com/help/pricing-and-plans)
- [The Register: Agent 3 pricing backlash](https://www.theregister.com/2025/09/18/replit_agent3_pricing/) · [The Register: SaaStr production-DB incident](https://www.theregister.com/2025/07/21/replit_saastr_vibe_coding_incident/)
- [TechCrunch: Replit finds its market](https://techcrunch.com/2025/10/02/after-nine-years-of-grinding-replit-finally-found-its-market-can-it-keep-it) · [StackBuilt Agent 4 review](https://stackbuiltai.com/replit-agent-4-review-2026/)
- [Trustpilot reviews](https://www.trustpilot.com/review/replit.com)

### 11.3 Lovable
Full report: [platforms/03-lovable.md](platforms/03-lovable.md)
- [Changelog](https://docs.lovable.dev/changelog) · [Editor](https://docs.lovable.dev/features/projects/editor.md)
- [Plan mode](https://docs.lovable.dev/features/plan-mode.md) · [Design guidance](https://docs.lovable.dev/features/design-guidance) · [Preview toolbar](https://docs.lovable.dev/features/preview-toolbar.md)
- [Lovable Cloud](https://docs.lovable.dev/features/cloud.md) · [GitHub integration](https://docs.lovable.dev/integrations/github.md)
- [Publish](https://docs.lovable.dev/features/publish.md) · [Custom domain](https://docs.lovable.dev/features/custom-domain.md) · [Security](https://docs.lovable.dev/features/security.md)
- [Credits and usage](https://docs.lovable.dev/introduction/credits-and-usage) · [Subscription plans](https://docs.lovable.dev/introduction/subscription-plans.md)
- [Visual Edits blog](https://lovable.dev/blog/visual-edits) · [Faster previews (OJ)](https://lovable.dev/blog/faster-previews-oj)
- [CVE-2025-48757 write-up](https://mattpalmer.io/posts/2025/05/CVE-2025-48757/) · [TechCrunch: $13.3B valuation](https://techcrunch.com/2026/08/12/lovable-confirms-new-13-3b-valuation-raises-another-400m/)
- [Trustpilot reviews](https://www.trustpilot.com/review/lovable.dev) · [altar.io builder comparison](https://altar.io/lovable-vs-bolt-vs-v0-vs-replit-vs-base44/)

### 11.4 Emergent
Full report: [platforms/04-emergent.md](platforms/04-emergent.md)
- [Pricing](https://emergent.sh/pricing) · [Plans and credits](https://help.emergent.sh/plans-and-credits) · [FAQs](https://help.emergent.sh/faqs)
- [First app guide](https://help.emergent.sh/first-app) · [Universal Key](https://help.emergent.sh/universal-key)
- [Emergent as MCP](https://help.emergent.sh/emergent-as-mcp) · [GitHub integration](https://help.emergent.sh/github-integration) · [Mobile app development](https://help.emergent.sh/mobile-app-development)
- [Introducing E-3](https://emergent.sh/blog/introducing-e-3-autonomous-app-building-on-emergent) · [Visual Edits](https://emergent.sh/blog/introducing-visual-edits) · [Emmy helper](https://emergent.sh/blog/emergent-emmy-launch)
- [Super Deployer](https://emergent.sh/blog/super-deployer-ai-app-deployment-success) · [Why we rebuilt the deployment engine](https://emergent.sh/blog/why-we-rebuilt-our-deployment-engine)
- [TechCrunch: unicorn (Jul 2026)](https://techcrunch.com/2026/07/15/indian-ai-coding-startup-emergent-becomes-a-unicorn-just-over-a-year-after-launch/) · [TechCrunch: $100M ARR](https://techcrunch.com/2026/02/17/emergent-hits-100m-arr-eight-months-after-launch-rolls-out-mobile-app)
- [Banani hands-on review](https://www.banani.co/blog/emergent-ai-review) · [Trustpilot reviews](https://www.trustpilot.com/review/emergent.sh)

### 11.5 Vercel v0
Full report: [platforms/05-vercel-v0.md](platforms/05-vercel-v0.md)
- [Changelog](https://v0.app/changelog) · [Pricing](https://v0.app/pricing)
- [GitHub](https://v0.app/docs/github) · [Git import](https://v0.app/docs/git-import) · [Deployments](https://v0.app/docs/deployments)
- [Design Mode](https://v0.app/docs/design-mode) · [Design systems 2.0](https://v0.app/docs/design-systems-2)
- [Agentic features](https://v0.app/docs/agentic-features) · [Sandbox](https://v0.app/docs/sandbox)
- [Introducing the new v0](https://vercel.com/blog/introducing-the-new-v0) · [Vercel Ship 2026 recap](https://vercel.com/blog/vercel-ship-2026-recap)
- [InfoQ: v0 Platform API](https://www.infoq.com/news/2026/08/vercel-v0-api/)
- [Community: agent-mode feedback thread](https://community.vercel.com/t/agent-mode-feedback-thread/18428) · [Community: high credit consumption](https://community.vercel.com/t/seemingly-high-credit-consumption/21324)
- [Superdesign v0 review](https://superdesign.dev/blog/v0-review) · [Hacker News discussion](https://news.ycombinator.com/item?id=45163212)

### 11.6 Rocket.new
Full report: [platforms/06-rocket-new.md](platforms/06-rocket-new.md)
- [Docs index (llms.txt)](https://docs.rocket.new/llms.txt) · [Pricing](https://www.rocket.new/pricing)
- [Prompt intelligence (clarity gate)](https://docs.rocket.new/getting-started/task/prompt-intelligence.md) · [Preview](https://docs.rocket.new/build/editor/preview.md) · [Versions](https://docs.rocket.new/build/editor/versions.md)
- [Advisor agent](https://docs.rocket.new/build/editor/advisor-agent.md) · [GitHub code sync](https://docs.rocket.new/build/connectors/github/code-sync.md)
- [Launch your site](https://docs.rocket.new/build/launch-web/launch-your-site.md) · [Supabase connector](https://docs.rocket.new/build/connectors/supabase/overview.md)
- [FAQ](https://docs.rocket.new/help/faq.md) · [Troubleshooting](https://docs.rocket.new/help/troubleshooting.md) · [Changelog, Apr 2026 wk 2](https://docs.rocket.new/changelog/2026/april/week-2.md)
- [TechCrunch: $15M raise](https://techcrunch.com/2025/09/22/rocket-new-one-of-indias-first-vibe-coding-startups-snags-15m-from-accel-salesforce-ventures) · [TechCrunch: consulting-style Solve](https://techcrunch.com/2026/04/06/indian-startup-rocket-wants-its-ai-to-do-mckinsey-style-consulting-at-a-fraction-of-the-cost/)
- [Rocket 1.0 press release](https://www.prnewswire.com/news-releases/rocket-1-0-solves-what-vibe-coding-left-out-what-to-build-and-what-comes-after-launch-302735531.html)
- [Trustpilot reviews](https://www.trustpilot.com/review/rocket.new) · [SourceForge reviews](https://sourceforge.net/software/product/Rocket.new/)

### 11.7 Cursor and other AI IDEs (Devin Desktop / Windsurf, Kiro, Zed)
Full report: [platforms/07-cursor-windsurf.md](platforms/07-cursor-windsurf.md)
- [Cursor changelog](https://cursor.com/changelog) · [Cursor 3.0](https://cursor.com/changelog/3-0) · [Start from scratch](https://cursor.com/changelog/start-from-scratch)
- [Run modes](https://cursor.com/docs/agent/security/run-modes) · [Agent modes](https://cursor.com/docs/agent/modes) · [Rules](https://cursor.com/docs/context/rules)
- [Bugbot](https://cursor.com/docs/bugbot) · [Cloud agents](https://cursor.com/docs/cloud-agent) · [Design Mode](https://cursor.com/blog/design-mode)
- [Pricing](https://cursor.com/pricing) · [TechCrunch: pricing apology (Jul 2025)](https://techcrunch.com/2025/07/07/cursor-apologizes-for-unclear-pricing-changes-that-upset-users/)
- [InfoQ: Cursor 3 agent-first interface](https://www.infoq.com/news/2026/04/cursor-3-agent-first-interface/) · [Forum: Agents Window](https://forum.cursor.com/t/cursor-3-agents-window/156509)
- [CNBC: OpenAI cuts Cursor model access](https://www.cnbc.com/2026/08/29/openai-cursor-spacex-model-access.html)
- [Devin Desktop previews](https://docs.devin.ai/desktop/previews) · [Windsurf → Devin Desktop migration](https://www.digitalapplied.com/blog/windsurf-becomes-devin-desktop-ide-migration-2026)
- [Kiro specs](https://kiro.dev/docs/specs/) · [Zed Agent Panel](https://zed.dev/docs/ai/agent-panel)

### 11.8 OpenAI Codex and Anthropic Claude Code
Full report: [platforms/08-codex-claude-code.md](platforms/08-codex-claude-code.md)
- **Claude Code:** [Desktop](https://code.claude.com/docs/en/desktop.md) · [On the web](https://code.claude.com/docs/en/claude-code-on-the-web.md) · [Permission modes](https://code.claude.com/docs/en/permission-modes) · [Projects](https://code.claude.com/docs/en/claude-projects)
- [Checkpointing](https://code.claude.com/docs/en/checkpointing.md) · [Code Review](https://code.claude.com/docs/en/code-review.md) · [Routines](https://code.claude.com/docs/en/routines.md) · [Changelog](https://code.claude.com/docs/en/changelog)
- [Claude Code desktop redesign](https://claude.com/blog/claude-code-desktop-redesign) · [TechCrunch: Auto mode on by default](https://techcrunch.com/2026/08/09/anthropic-is-turning-claude-codes-auto-mode-on-by-default/)
- [The Register: "work and pay in parallel"](https://www.theregister.com/ai-and-ml/2026/09/18/claude-code-revamps-projects-so-you-can-work-and-pay-in-parallel/5297532)
- **Codex:** [Changelog](https://learn.chatgpt.com/docs/changelog) · [Pricing](https://learn.chatgpt.com/docs/pricing.md) · [Code review](https://learn.chatgpt.com/docs/code-review?surface=app)
- [Approvals & security](https://learn.chatgpt.com/docs/agent-approvals-security.md) · [Cloud environments](https://learn.chatgpt.com/docs/environments/cloud-environment.md) · [GitHub integration](https://learn.chatgpt.com/docs/third-party/github.md)
- [Developers Digest: ChatGPT Work and the Codex desktop app](https://www.developersdigest.tech/blog/chatgpt-work-codex-desktop-app) · [GitHub issue #30919 (no commit graph)](https://github.com/openai/codex/issues/30919)

### 11.9 Other prompt-to-app builders
Full report: [platforms/09-other-app-builders.md](platforms/09-other-app-builders.md)
- **Bolt.new:** [Release notes](https://support.bolt.new/release-notes) · [Pricing](https://bolt.new/pricing) · [Bolt v2](https://bolt.new/blog/bolt-v2) · [Agents](https://support.bolt.new/building/using-bolt/agents.md) · [Plan mode](https://support.bolt.new/best-practices/plan-mode.md) · [Database](https://support.bolt.new/cloud/database.md) · [Security](https://support.bolt.new/building/security.md) · [Lovable import](https://support.bolt.new/integrations/lovable-import.md)
- **Base44:** [Changelog](https://docs.base44.com/changelog/product) · [Pricing](https://base44.com/pricing) · [Canvas](https://docs.base44.com/Building-your-app/Canvas) · [AI agents for apps](https://docs.base44.com/Building-your-app/AI-agents-for-apps) · [GitHub](https://docs.base44.com/developers/app-code/local-development/github) · [Superagents](https://base44.com/superagents) · [Trustpilot](https://www.trustpilot.com/review/base44.com)
- **Google AI Studio / Firebase Studio:** [Build mode](https://ai.google.dev/gemini-api/docs/aistudio-build-mode) · [Deploying](https://ai.google.dev/gemini-api/docs/aistudio-deploying) · [Full-stack vibe coding (Mar 2026)](https://blog.google/innovation-and-ai/technology/developers-tools/full-stack-vibe-coding-google-ai-studio/) · [Android apps (May 2026)](https://android-developers.googleblog.com/2026/05/build-android-apps-google-ai-studio.html) · [Firebase Studio migration](https://firebase.google.com/docs/studio/migrating-project)
- **Anything / Mocha:** [Docs index](https://www.anything.com/docs/llms.txt) · [Max](https://www.anything.com/docs/builder/max.md) · [App Store](https://www.anything.com/docs/launch/app-store.md) · [Databases](https://www.anything.com/docs/apps/databases.md) · [TechCrunch: rebuilding after App Store removals](https://techcrunch.com/2026/04/14/how-vibe-coding-app-anything-is-rebuilding-after-getting-booted-from-the-app-store-twice/) · [Mocha shutdown](https://getmocha.com/blog/mocha-shutdown/)
- **Leap.new:** [Introduction](https://docs.leap.new/getting-started/introduction) · [Interface](https://docs.leap.new/understanding-your-leap-app/leap-interface.md) · [Deployment](https://docs.leap.new/deployment/overview.md) · [Encore launch blog](https://encore.dev/blog/leap-is-here)
- **Dyad:** [Homepage](https://www.dyad.sh/) · [GitHub repo](https://github.com/dyad-sh/dyad) · [Importing](https://www.dyad.sh/docs/guides/importing) · [Agent mode](https://www.dyad.sh/blog/ai-agent-mode-explained)
- **Long tail:** [Tempo Agent+](https://www.tempo.new/ai-agent-plus) · [Same docs](https://docs.same.new) · [Macaly review](https://makerstack.co/reviews/macaly-review/) · [Genspark case study](https://openai.com/index/genspark/) · [Manus web app builder](https://manus.im/features/webapp)

### 11.10 Agent-builder platforms and frameworks
Full report: [platforms/10-agent-builder-platforms.md](platforms/10-agent-builder-platforms.md)
- **OpenAI:** [Agent Builder guide](https://developers.openai.com/api/docs/guides/agent-builder) · [The eight-month lifespan of Agent Builder](https://montanalabs.ai/news/openai-s-agentkit-and-the-eight-month-lifespan-of-agent-builder/) · [Developer reactions](https://www.finalroundai.com/blog/openai-agent-builder-what-software-developers-are-saying-after-testing)
- **Microsoft:** [Copilot Studio agents experience](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/overview) · [2026 Copilot Studio agent-builder guide](https://learnpower.ai/articles/2026-copilot-studio-agent-builder-guide)
- **LangChain:** [LangSmith Fleet](https://www.langchain.com/blog/introducing-langsmith-fleet) · [LangSmith Studio](https://docs.langchain.com/langsmith/studio) · [Pricing](https://www.langchain.com/pricing)
- **CrewAI:** [Crew Studio docs](https://docs-platform.crewai.com/platform/en/features/crew-studio) · [Crew Studio blog](https://crewai.com/blog/crew-studio-automated-agent-builder)
- **Google:** [ADK](https://adk.dev/) · [ADK Visual Builder](https://adk.dev/visual-builder/) · [Gemini Enterprise agent platform](https://cloud.google.com/blog/products/ai-machine-learning/the-new-gemini-enterprise-one-platform-for-agent-development)
- **n8n and Dify:** [Introducing n8n Agents](https://blog.n8n.io/introducing-n8n-agents/) · [n8n agent docs](https://docs.n8n.io/build/build-and-manage-agents) · [New Dify Agent](https://dify.ai/blog/introducing-new-dify-agent)
- **Flowise and Langflow:** [Agentflow V2](https://docs.flowiseai.com/using-flowise/agentflowv2) · [Langflow 1.9](https://www.langflow.org/blog/langflow-1-9/)
- **Others:** [Relevance AI product](https://relevanceai.com/product) · [Lyzr Agent Studio](https://docs.lyzr.ai/enterprise/agent-studio/introduction) · [Mastra platform](https://mastra.ai/blog/announcing-mastra-platform) · [Vellum Copilot](https://www.vellum.ai/blog/introducing-vellum-copilot) · [Claude Managed Agents](https://platform.claude.com/docs/en/managed-agents/overview) · [Agno control plane](https://docs.agno.com/agent-os/control-plane) · [AWS Bedrock AgentCore](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html)
- **Protocols and community:** [A2A adoption (Linux Foundation)](https://www.linuxfoundation.org/press/a2a-protocol-surpasses-150-organizations-lands-in-major-cloud-platforms-and-sees-enterprise-production-use-in-first-year) · [AG-UI protocol](https://github.com/ag-ui-protocol/ag-ui) · [What Reddit's agent builders were debugging (secondary)](https://dev.to/yetta_pease_fc74c2260291a/what-reddits-agent-builders-were-actually-debugging-this-week-3n4p)

---

## 12. Critic's addendum

> **What this is.** A completeness and fact-check pass over this synthesis, run on **2026-09-26** against all 10 platform reports and live web sources. Every edit made in the body is tagged *(critic: …)* or "critic-verified" where it happens, so it can be audited in place.

### 12.1 Fact-checks (web-verified on 2026-09-26)

| Claim in the synthesis | Verdict | What changed |
|---|---|---|
| SpaceX bought Cursor for ~$60B; OpenAI cuts Cursor's model access on 12 Nov 2026 | **Confirmed** (CNBC, OpenAI, Quartz) | Added: all-stock deal announced 16 Jun 2026 and closed in Q3; BYO OpenAI keys and Azure/Bedrock routing still work; Cursor's CEO says OpenAI served ~5% of customers (§1.2, §1.5) |
| Lyzr raised a $100M Series B at ~$500M (Jul 2026) | **Confirmed as reported** (TechCrunch, Bloomberg, TNW) | Marked **company-reported, no named lead investor confirmed**. Added the $8M Series A, the ~$400M of reported demand and the ARR trajectory from report 01 (§7.1) |
| OpenAI Agent Builder deprecated 3 Jun and shut down 30 Nov 2026 | **Confirmed** (OpenAI docs and community notice) | None |
| Mocha shut down on 1 Aug 2026 | **Confirmed** (Mocha blog: CAC, token and support costs) | None |
| Replit Free Mode as a "free tier subsidised by cheap models" | **Wrong** | Free Mode is un-metered usage for **Core and Pro subscribers** within 5-hour windows, not a free plan (Replit blog). Fixed in §1.1, §1.5 and §6.1 |
| Wix bought Base44 for "$80M, >$150M with earn-outs" | **Partly** | ~$80M upfront plus earn-outs through 2029, with a further ~$41M earn-out reported. The >$150M total is now marked unverified (§1.5) |
| Lovable's unified credit pool (Aug 2026) pauses the production backend | **Refined** | The rollout started 1 Jun 2026. Per Lovable's docs, pages stay live, but AI features stop and Cloud-backed apps can pause (§1.1, §3.7, §6.1) |
| Claude Code weekly limits "fell a net 17%" on 14 Sep 2026 | **Refined** | A temporary +50% boost ended and a permanent +25% replaced it: −17% vs summer, +25% vs the pre-May baseline (§6.1) |
| Windsurf became Devin Desktop; Cascade retired on 1 Jul 2026 | **Confirmed** (2 Jun OTA update, 4-week notice) | Dates added (§1.5) |
| Codex became a mode of the ChatGPT desktop app on 9 Jul 2026 | **Confirmed** | None |
| Claude Code Auto mode default; 97% of prompts approved; 89% vs 13.6% caught | **Confirmed** (Anthropic; default from 14 Aug 2026) | None |
| Architect v2.2.0 (7 Aug 2026) is still the latest release | **Confirmed** (changelog re-fetched) | Noted in §7.2 |
| v0 plans: Free $5 / Plus $30 per user / Business $100 per user / $2 daily credits | **Confirmed** (v0.app/pricing) | None |
| Kiro plans | **Incomplete** | Added Pro+ $40 and the credits per tier (§1.2) |

### 12.2 Feature matrix (§2)
- **Re-counted** the Architect column (18 ✅ / 25 ◐ / 28 ❌) and the Bolt column, and re-checked every "N of 10" claim in §2.19 (the eight table-stakes rows; 1/10 cost visibility; 2/10 deploy transparency; 4/10 staging; 0/10 on guardrails, KB and orchestration). **All hold.**
- **Resolved 3 "?" cells** from report 09: Bolt "AI in apps with no API keys" → ❌ (via code only); Bolt "builder exposed as API/MCP/CLI" → ❌ (none documented); Base44 "ZIP / competitor import" → ❌ (ZIP export only). The scoreboard now reads Bolt 13 ❌ / 11 ?, Base44 4 ❌ / 10 ?.
- Left the other "?" cells alone. Neither the reports nor a quick check gave evidence for them, and guessing would weaken the matrix.

### 12.3 Current Architect parity (§7 → §9)
- §7.2 was cross-checked line by line against report 01 §3–§5. **No capability was missing**; small details were folded into F08. IDs are unchanged, so every "F-number" reference elsewhere stays valid.
- §9.1 now has **[Existing]** rows for the 21 F-IDs that had no explicit row: F04, F05, F10, F12, F15, F31, F37, F39, F40, F45, F52, F56, F60, F68, F69, F82, F101, F102, F103, F110 and F111. A **parity cross-walk table** at the end of §9.1 maps all 112 F-IDs to the rows that keep them.

### 12.4 Lifecycle gaps closed in §9.1 (30 new rows, each tagged *critic: added*, plus 4 existing rows widened)

| Lifecycle stage | Added |
|---|---|
| Auth & onboarding | Passwordless email (magic link or code); 2FA, passkeys and sessions; a first-run checklist and a sample project |
| Build | Resume an interrupted build from the last checkpoint |
| Developer loop | Local IDE, SSH or dev-tunnel sync back into the timeline; tests as code, a test runner and a CI hook; a dependency manager; platform webhooks and scoped tokens; **CLI + API raised from Could to Should** |
| Backend | Transactional email; **payments** (in the matrix, missing from the feature list); data export and import; realtime; end-user SSO |
| Agents | A framework adapter over A2A + OTel (so "any framework" is literal); an "Export agent as…" menu; a memory viewer; end-user feedback → evals; human takeover; Knowledge Graph KB |
| GitHub & import | A GitHub App with per-repo scopes and private repos by default; import requirements from Notion, Docs, Jira or Linear |
| Deploy | SEO and OG metadata; an uptime check; legal pages and end-user data deletion |
| Teams & billing | Ship white-label branding (today "Soon"); transfer ownership to a client; self-serve cancellation, GST invoices and usage CSV |
| Settings & help | Account export and deletion; region choice as a flagged one-way door; the **vocabulary layer as a Must**; human support targets; a status page |
| New area | **Accessibility & localisation**: builder WCAG 2.2 AA, an a11y check at publish, a localised UI |

§9.2 routes were updated to match (`/login`, `/settings/*`, `/p/:id/launch`, `/help`).

### 12.5 Remaining uncertainties (highest design impact first)
1. **The logged-in Architect UI was never observed.** Button positions in §7.3 are reconstructed from docs, pre-June-2026 tutorials and one teardown. Ask for an account (§10 Q13).
2. **The strongest pain evidence is n = 1** [3P-hands-on]: the 20-minute black-box build, silent scope cuts and silent sample data. Present it as "reported", not "proven".
3. **Architect's zero-balance behaviour is undocumented.** Nobody knows whether live apps pause when runtime credits run out, as Lovable's can. This decides how strongly to pitch "separate build and runtime pools" (C2).
4. **Whether Architect generates SuperFlows** (cron, webhooks, approvals) is still unverified, and it sets D9's severity.
5. **Bolt and Base44 still carry 11 and 10 "?" cells**, so their ✅ counts are floors, not measurements.
6. **Secondary-only numbers:** Lyzr ARR, Codex's 7–8M weekly users, Studio pricing, and Trustpilot ratings and review counts (snapshots that move daily).
7. **Pricing churn.** Kiro, v0, Replit, Lovable and Bolt all changed plans within weeks of the research. Re-check every price the week the deliverable ships.
8. **Not spot-checked in this pass:** Cursor's Graphite acquisition, the hosted-Langflow closure, the Firebase Studio sunset date, Rocket's pricing history and the Emergent credit figures. They are carried over from the reports as written.

**Fact-check sources:** [CNBC on OpenAI and Cursor](https://www.cnbc.com/2026/08/29/openai-cursor-spacex-model-access.html) · [OpenAI: our decision on Cursor](https://openai.com/index/our-decision-on-cursor-following-its-acquisition-by-spacex/) · [Quartz: SpaceX–Anysphere $60B](https://qz.com/spacex-buying-cursor-anysphere-60-billion-deal-061626) · [TechCrunch: Lyzr $100M](https://techcrunch.com/2026/07/09/an-ai-agent-startup-just-let-its-agent-run-its-100-million-fundraise/) · [TNW: Lyzr Series B](https://thenextweb.com/news/lyzr-ai-agent-100-million-series-b) · [OpenAI Agent Builder deprecation](https://community.openai.com/t/deprecation-notice-agent-builder/1382650) · [Mocha shutdown](https://getmocha.com/blog/mocha-shutdown/) · [Replit Free Mode](https://replit.com/blog/replit-introduces-free-mode) · [Wix acquires Base44](https://www.wix.com/press-room/home/post/wix-further-expands-into-vibe-coding-with-acquisition-of-base44-a-hyper-growth-startup-that-simplif) · [Lovable credits and usage](https://docs.lovable.dev/introduction/credits-and-usage) · [BleepingComputer: Claude Code limits](https://www.bleepingcomputer.com/news/artificial-intelligence/anthropic-is-cutting-claude-codes-current-weekly-limits-by-17-percent/) · [Windsurf → Devin Desktop](https://www.digitalapplied.com/blog/windsurf-becomes-devin-desktop-ide-migration-2026) · [Codex in the ChatGPT desktop app](https://www.developersdigest.tech/blog/chatgpt-work-codex-desktop-app) · [Claude: Auto mode by default](https://claude.com/blog/auto-mode-default-in-claude-code) · [Architect changelog](https://docs.architect.new/changelog/overview) · [v0 pricing](https://v0.app/pricing) · [Kiro pricing](https://kiro.dev/pricing/)
