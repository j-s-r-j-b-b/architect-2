# Vercel v0 (v0.app): Competitive Research for Architect 2.0

- **Researched:** 2026-09-25. The latest v0 changelog entry reviewed is dated **Sep 22, 2026**.
- **Method:** primary sources first: v0 docs (https://v0.app/docs), the v0 changelog (https://v0.app/changelog), the pricing page (https://v0.app/pricing), and Vercel blog and launch posts. Secondary sources: Vercel Community forum, Hacker News, Product Hunt, InfoQ, InfoWorld, review blogs, and tutorials.
- **Limits of this research:** I did not sign up or log in, so the logged-in UI was never observed directly. Layout details come from the official docs, the changelog, and tutorials that walk through the interface. Where I inferred a detail rather than confirmed it, it is marked **(inferred)**. Where I could not confirm a claim, it is marked **(unverified)**.
- **Warning about secondary sources:** many 2026 "review" blogs still describe v0 as "frontend only, no backend". That is outdated. Since Feb 2026, v0 has run a real VM sandbox with API routes, databases, auth scaffolding and Git workflows. I cite primary sources wherever the two disagree.

---

## 1. Positioning: what makes v0 different

**How v0 describes itself:** "an AI agent that helps anyone create real code and full-stack apps and agents… Deploy to production immediately, or open a pull request for review" (https://v0.app/docs).

**Where it came from:**
- **2023–mid-2025:** a UI and component generator (v0.dev).
- **Aug 11, 2025:** rebranded to **v0.app** as an agent that "plans, researches, debugs, and builds end-to-end" (https://vercel.com/blog/v0-app).
- **Feb 3, 2026:** "the new v0" added a VM sandbox runtime, GitHub import, a Git panel with a branch per chat, and PRs (https://vercel.com/blog/introducing-the-new-v0).
- **Aug 2026:** the v0 API (v2) became GA, so v0 is now also infrastructure that other products call (https://www.infoq.com/news/2026/08/vercel-v0-api/).

**What sets it apart:**
1. **Vertical ownership of the stack.** v0 generates Next.js, React, TypeScript, Tailwind and shadcn/ui, uses AI SDK 6 by default for AI features, and deploys on Vercel (https://v0.app/docs/faqs). Vercel builds Next.js and the AI SDK, and shadcn/ui ships "day 1" in v0 (changelog, Oct 3, 2025). The result is the most "idiomatic React" output of any prompt-to-app tool. Reviewers rate its UI output 9.5/10 and its React/Next code 9.2/10 (https://automationatlas.io/answers/v0-review-2026/).
2. **Git-native, production-safe workflow.** Each chat gets its own working branch. v0 commits automatically, preview deployments are real, and **Publish** creates or reuses a PR, merges it and deploys to production. It respects branch protection and CI (https://v0.app/docs/github; changelog, Sep 1, 2026).
   - This is v0's core pitch to engineering orgs. Business users can ship through "proper Git workflows", and engineers keep "production stability through controlled PR processes" (https://vercel.com/blog/introducing-the-new-v0).
3. **A real runtime, not a browser emulator.** Each chat gets a Vercel Sandbox microVM running a full Node.js environment. It supports pnpm, npm, yarn and bun, and runs a framework-aware dev server for Next.js, Vite or Node (https://v0.app/docs/sandbox).
4. **Designer-grade editing.** **Design Mode** offers layers, a properties panel, a floating toolbar, a measure overlay, and pending edits that you "Apply". **Annotations mode** turns clicks into numbered comments. **Design Systems 2.0** teaches v0 your real components and tokens as a reusable "skill" (https://v0.app/docs/design-mode, https://v0.app/docs/design-systems-2).
5. **Enterprise data and governance.** Snowflake and AWS databases (Aurora PostgreSQL, DynamoDB, Aurora DSQL), deployment policies, RBAC (Builder / Creator / Viewer), SAML SSO, directory sync, model allowlists, and a training opt-out (https://v0.app/docs/enterprise, https://vercel.com/blog/aws-databases-are-now-live-on-the-vercel-marketplace-and-v0).
6. **Headless and agent-callable.** The Platform API v2, SDKs (`v0-sdk`, `@v0-sdk/react`, `@v0-sdk/ai-tools`) and a v0 MCP server mean "any MCP-compatible agent can spin up and deploy apps" (https://alphasignal.ai/news/vercel-s-v0-api-v2-lets-ai-agents-build-and-ship-apps-without-humans).
   - InfoQ describes this as positioning v0 "as infrastructure for developers to invoke from products, scripts, CI pipelines, or other AI agents", unlike Lovable and Bolt.
   - ZoomInfo embeds v0 for 40,000+ customers (https://vercel.com/blog/vercel-ship-2026-recap).
7. **Model-agnostic.** The model picker offers v0 Mini, Pro, Max and Max Fast, plus custom models from the AI Gateway catalog (Claude Opus 5, GPT-5.6 Sol, Grok and others), with Thinking and Fast toggles (https://v0.app/docs/model-picker; changelog, Sep 22, Aug 28 and Jul 31, 2026).
8. **Multi-surface.** Web app, an iOS app ("the next generation of your Notes app, where your ideas get built in the background"), a Slack bot (`@v0` opens a PR), and the API/MCP (https://vercel.com/blog/how-we-built-the-v0-ios-app, https://v0.app/docs/slack).

**How v0 frames rivals** (its own comparison pages):
- **vs Replit:** v0 is "prompt-driven generation" with a working branch per chat and Vercel preview/production deploys, versus Replit's "workspace tool" (https://v0.app/docs/compare/v0-vs-replit).
- **vs Figma Make:** v0 centres on "developer workflows… version-controlled codebases rather than isolated prototypes" (https://v0.app/docs/compare/v0-vs-figma-make).

---

## 2. Who uses it and why (jobs-to-be-done)

The official role list is founders, PMs, designers, engineers, data scientists, marketers, sales engineers, content creators, customer support and educators (https://v0.app/docs, https://v0.app/docs/faqs). Prompts work in any language, and the UI added Simplified Chinese in Mar 2026.

**Non-technical users**
- **PMs:** "work from shared, working prototypes rather than static docs". There is a PRD Design guide covering feature breakdowns, API specs and mermaid DB schemas (https://v0.app/docs/prototyping, https://v0.app/docs/prd-design). Linear, Notion and Glean MCPs let v0 build from tickets, PRDs and internal docs (changelog, Dec 16 and Dec 22, 2025).
- **Designers:** Figma file or frame links (v0 now inspects structure and styles directly, changelog Jul 31, 2026), screenshots, Design Mode, annotations, Paper import, and Nano Banana image editing inside Design Mode.
- **Marketers and content teams:** landing pages, copy updates, and "ship features, refine designs, update copy" straight into production through a PR (https://v0.app/docs).
- **Founders:** idea to MVP to deployed URL. On HN, one user says "a working MVP delivered and in use by Monday" for about $50 of credits (https://news.ycombinator.com/item?id=45163212).
- **Data teams:** Snowflake data apps and dashboards that are role-based and deploy to Snowflake (https://v0.app/docs/snowflake).
- **Anyone on a team:** tag `@v0` in Slack; it reads the thread, creates a branch and opens a PR (https://v0.app/docs/slack).

**Technical users**
- **Frontend and full-stack Next.js devs:** import any GitHub repo, including monorepos. They get a VS Code-style editor, a terminal with permission modes, pre-installed **Claude Code** in the sandbox terminal, CI fixing and merge-conflict resolution (https://v0.app/docs/git-import, https://v0.app/docs/pre-installed-agents).
- **Platform and product teams:** embed v0 through the API v2 to build their own "AI app builder" (https://vercel.com/blog/build-your-own-ai-app-builder-with-the-v0-platform-api).
- **Design-system teams:** SAP rebuilt its design system so "people and agents" assemble interfaces from the same parts, with v0 across build, deliver and decide (https://vercel.com/blog/vercel-ship-2026-recap).
- **Agent builders:** AI SDK agents inside Next.js apps, plus the v0 MCP server as a tool for other agents.

**Why people choose it:** speed (it solves "the blank canvas problem", per HN), polished UI by default, one-click deploy to a shareable URL, real code the user owns ("Vercel doesn't own the code", per the FAQ), a Git and PR safety net, and the trust of the Vercel and Next.js ecosystem.

---

## 3. Complete feature inventory, by area

### 3.1 Onboarding and auth (for the builder)
- **Sign-in:** a Vercel account is required. The page reads "Sign in to v0 using your Vercel account", with options **Continue with Email, Google, GitHub, ChatGPT, SAML SSO**, and "Show other options" (https://vercel.com/login/v0). Sign in with Apple works on iOS (changelog, Nov 18, 2025). Email is described as a passwordless link (**unverified**; secondary source).
- **No role-based onboarding questionnaire found (unverified).** Users land directly on the prompt screen.
- A v0 for Students programme runs at Stanford, Harvard, MIT, NYU, Georgia Tech, Waterloo and others (changelog, Oct 24 and Nov 26, 2025).

### 3.2 Homepage and prompt entry (the composer)
- **Layout:** since Feb 2026 the signed-in home is a "simplified home page with centered input" (changelog).
- **"+" menu in the composer:**
  - Upload from computer
  - **Import from…** (GitHub, Figma and Paper, consolidated into one menu Aug 14, 2026)
  - **MCPs**
  - **New Instruction**
  - Sources: https://v0.app/docs/git-import, https://v0.app/docs/MCP, https://v0.app/docs/instructions
- **Attachments:**
  - Types: images, video, audio, PDF, DOCX, XLSX, 3D (GLB/glTF/OBJ), code, fonts, ZIP/GZ, .tgz, .riv and EML.
  - Limits: 5 MB (Free) or 20 MB (paid) per file; ZIP 10 MB or 50 MB. Attach by drag-drop, paste or the menu (https://v0.app/docs/images-and-videos).
  - Pasted items appear as inline chips with thumbnails that persist across reloads (changelog, Jun 26, 2026). A dropped ZIP is read like an attachment (May 15, 2026).
- **Model picker** in the composer toolbar: Mini / Pro / Max / Max Fast, plus "Add models" from the AI Gateway, with Thinking effort and Fast Mode toggles and prices shown (https://v0.app/docs/model-picker).
- **Enhance prompt** button: expands a short brief before running (https://vercel.com/academy/vercel-foundations/v0-way).
- **Design system attach:** from the prompt toolbar (https://v0.app/docs/design-systems-2).
- **Slash commands (`/`):** attach skills without leaving the keyboard. Skills show as chips (Jul 21, 2026).
- **Keyboard:** arrow-key prompt history (including attachments and skills); Cmd/Ctrl+Enter to send or interrupt; Cmd/Ctrl+Up/Down to move through queued prompts (Jul 31, 2026).
- **Queued prompts:** type the next instruction while v0 is still working (changelog, Jun 19 and Jul 31, 2026).
- **Community content:** templates and community projects can be browsed and forked (https://v0.app/templates). Whether they still appear on the signed-in home is **unverified**.

### 3.3 Chat and agent interaction
- **Agent abilities:** web search with citations; browser use (opens the app it built, tests it, captures screenshots, inspects external URLs); error diagnosis and fixing; terminal commands; MCP tools (https://v0.app/docs/agentic-features).
- **Progress display:** "live updates on each agent action", including progress indicators, browser screenshots, citation links and **tool-execution status cards**. Users can interrupt at any time, and **auto-continue** handles multi-step runs. Long runs continue automatically past the timeout (changelog, Jun 8, 2026).
- **Work details** after each run: time worked, files modified, lines changed, credits used (changelog, Oct 30, 2025).
- **Clarifying questions:**
  - Added Dec 17, 2025. Since Jun 19, 2026 they render **inside the prompt form** as single-select or multi-select options, with **skip** and a **custom answer**.
  - The API exposes these as `ask_user_questions` (https://v0.app/docs/api/v2/guides/handling-agent-interactions).
- **Plan mode:**
  - Ships as a preset **instruction** ("Plan Mode – generates detailed implementation plans… and requests approval"), not as a top-level mode switch (https://v0.app/docs/instructions).
  - Plan approval is an `exit_plan_mode` action: approve, modify or reject.
  - Users asked for Replit-style Plan/Build modes from Sep 2025 to Jan 2026, and staff pointed them to plan mode (https://community.vercel.com/t/requesting-plan-and-build-modes/22153).
  - **There is no separate "Ask/Chat-only" mode.** The FAQ-style claim that "chatting without generation does not consume credits" comes from a secondary source (**unverified**).
- **Autonomy and permissions:**
  - Three global permission modes: **Ask** (applies your rules), **Auto** (the default; pre-approved safe commands run and the rest ask), and **Full** (no checks).
  - Per-integration MCP setting: Disabled / Ask for Approval / Always Run.
  - A deletion guard blocks `rm -rf` (https://v0.app/docs/terminal-commands, https://v0.app/docs/MCP).
  - Since Jul 7, 2026, approvals for MCP and bash are **grouped in one panel at the top of the composer**.
- **Integration requests:** the agent proposes integrations (Supabase, Neon and others) and opens an **Integration Wizard** in chat (changelog, Oct 31, 2025).
- **Presets:** "Be Concise" and "Plan Mode". Custom instructions can be saved and toggled on per message (https://v0.app/docs/instructions).
- **Notifications:** optional sound when v0 finishes (off by default; Jul 21, 2026). Favicon and status badges in the sidebar show streaming / waiting / ready (Aug 2026; https://alternativeto.net/news/2026/8/v0-sidebar-groups-chats-by-project-with-real-time-status-updates/).

### 3.4 Live preview
- **Right-pane tabs:** **Preview / Code / Design** (https://v0.app/docs/quickstart). A **Console** panel shows dev-server logs, real request and response traffic, and a terminal (https://v0.app/docs/sandbox, https://vercel.com/academy/vercel-foundations/v0-way).
- **Toolbar icons** (from a tutorial, Aug 2026): switch between Preview and Code, switch pages or routes, test responsive sizes, refresh, open in a new window, developer console (https://flaviocopes.com/v0-tutorial/). Exact icon order is **(inferred)**.
- **While the VM boots:** v0 shows the empty or previous preview immediately with "subtle progress lines" (Jul 7, 2026). If the dev server fails, a compact error bar appears (Aug 28, 2026).
- **Sign in with Vercel inside previews,** with persistent sessions (Aug 28, 2026).
- On iOS, iframe previews suggest the native app (May 15, 2026).

### 3.5 Design Mode and annotations (visual editing)
- **Entering and selecting:** enter via the **Design** tab. Hover highlights elements and a click selects one. Cmd/Ctrl+I toggles select mode and Esc deselects. Arrow keys navigate between elements, Enter edits, and Cmd+click quick-selects (https://v0.app/docs/design-mode; changelog, Dec 18, 2025).
- **Controls:** typography, color, background, margin and padding, border, opacity and radius, shadow, and direct text editing. Tailwind-aware values are used when Tailwind is detected.
- **Structural changes by prompt:** for example, "add a button next to this text". An element screenshot is attached automatically.
- **Pending edits:** Undo/Redo, Reset, a Before/After toggle, and a warning if you leave with unapplied edits. **Apply** produces a new chat version you can diff or revert.
- **June 2026 additions:** a floating toolbar (drag handles for spacing and gaps, drag to reorder, delete shortcut), a layers viewer, a measure overlay and an Inspector (changelog, Jun 8, 2026; https://www.createwith.com/tool/v0/updates/v0-launches-design-mode-with-visual-editing-and-layer-management).
- **Image editing:** select an image in Design Mode and prompt Nano Banana (Oct 29, 2025).
- **Annotations mode** (Jun 19, 2026): click preview elements to drop **numbered comments**, then send them to the agent as one batched prompt.
- **Limits:** Design Mode works only on the latest version, not on read-only chats, and not on mobile viewports.

### 3.6 Code view, editor and terminal
- **Editor:** a VS Code-style editor with a file explorer (Cmd+B), per-file find, global search and replace (Shift+Cmd+F), create/rename/delete files and folders, a **diff view** of v0's changes, and **split view** (https://v0.app/docs/code-editing; changelog, Dec 10, 2025).
- **Saving and themes:** autosave by default, with Vercel Light and dark themes (May 12, 2026). Markdown, SVG and .riv files preview in the editor.
- **Manual edits do not create versions.** Only agent messages do (https://v0.app/docs/versions).
- **Terminal:** the agent runs commands with permission prompts (May 12, 2026). Users can run commands themselves in the Console terminal.
- **Pre-installed agents:** run `claude` for Claude Code, routed through the AI Gateway and billed to team credits. Disabled by default on Enterprise (https://v0.app/docs/pre-installed-agents).
- **Getting code out:** download as ZIP (view-only members too, since Jun 19, 2026); GitHub sync; the older "Add to Codebase" / `npx shadcn add` / `npx v0 add` CLI (https://www.datacamp.com/tutorial/vercel-v0 — older UI).

### 3.7 Backend
- **Server logic:** Next.js App Router API routes, Server Actions and React Server Components (https://v0.app/docs/full-stack-apps).
- **Databases:** Neon Postgres, Supabase, Upstash Redis, Vercel Blob storage, Snowflake, and AWS (Aurora PostgreSQL, DynamoDB, Aurora DSQL), all through the Vercel Marketplace. v0 provisions the account and adds env vars automatically (https://v0.app/docs/databases, https://vercel.com/blog/aws-databases-are-now-live-on-the-vercel-marketplace-and-v0).
- **Default scaffold** (Jun 8, 2026): new apps start with **Neon + Drizzle + Better Auth**. Before that, the docs said "without ORMs by default".
- **DB Studio with a SQL tab:** describe a query, v0 drafts the SQL, and Cmd+Enter runs it (Jun 8, 2026). v0 can also create, alter and drop tables.
- **End-user auth:** Better Auth scaffold, Supabase Auth, and Sign in with Vercel for internal apps. Visibility options include "Team or password" (Aug 28, 2026).
- **Payments and commerce:**
  - **Stripe:** one-click claimable test sandboxes, claimed at publish time (https://vercel.com/changelog/stripe-is-now-generally-available-on-the-marketplace-and-v0).
  - **Shopify:** live products, prices and inventory (Jun and Jul 2026; https://v0.app/docs/shopify).
- **Cron, queues and background jobs:** v0 docs mention "queues" through the Marketplace. v0-specific cron and workflow UX is **unverified**. Vercel itself provides Cron, the Workflow SDK and Queues.
- **Private npm packages:** supported through `NPM_TOKEN` / `NPM_RC` env vars (https://v0.app/docs/private-dependencies).
- **Feature flags:** v0 understands Vercel Flags (Jun 19, 2026).

### 3.8 AI features inside generated apps, and agent building
- **AI Gateway:** generated apps call models through it by default, with **zero-config OIDC** and no API keys needed (Aug 28, 2026; https://v0.app/docs/ai-models). Marketplace AI providers include fal, Deep Infra and Grok.
- **Autonomy over AI features:** since Jul 31, 2026, v0 "autonomously decides how to implement AI features… without asking users".
- **Chat UIs:** built with shadcn/ui chat primitives and the latest AI SDK (Jul 7, 2026). AI SDK v6 agents are supported (Jan 2026).
- **Vercel Connect:** gives generated apps and agents short-lived OAuth tokens for Slack, GitHub, Notion, Salesforce and others, either per user or through a shared account ("suitable for bots and scheduled agents") (https://v0.app/docs/vercel-connect).
- **The template gallery has an "Agents" category** (https://v0.app/templates).
- **Gap:** no dedicated visual **agent builder** (canvas, tools list, evals, schedules) exists inside v0 **(unverified; none found)**. Agents are built as code in Next.js apps.
  - Vercel promised in Feb 2026: "Soon, you'll be able to build end-to-end agentic workflows in v0… and deploy them on Vercel's self-driving infrastructure."
  - I found no dedicated launch of that by Sep 2026 **(unverified)**.
- **Vercel's broader agent stack** (relevant to "build agents in any framework"):
  - **AI SDK 6** (Dec 22, 2025): `ToolLoopAgent`, `needsApproval` human-in-the-loop, MCP with OAuth, DevTools (https://vercel.com/blog/ai-sdk-6).
  - **AI SDK 7** (Jun 25, 2026): `WorkflowAgent` for durable runs; `HarnessAgent`, which runs Claude Code, Codex, Pi and similar through one interface; OpenTelemetry; voice and video. About 16M weekly downloads (https://vercel.com/blog/ai-sdk-7).
  - **AI Gateway:** hundreds of models with failover, OIDC, BYOK, and per-user budgets (Sep 2026).
  - **Vercel Sandbox:** microVMs; Cursor cloud agents can run in it (Sep 2026 weekly).
  - **Workflow SDK:** `"use workflow"` / `"use step"`. Vercel Workflows GA Apr 16, 2026 (https://vercel.com/docs/workflows).
  - **Chat SDK:** one codebase for Slack, Discord and GitHub bots (https://vercel.com/blog/vercel-ship-2026-recap).
  - **eve** (Jun 17, 2026, Apache-2.0): a filesystem-first agent framework where "an agent is a directory": `agent.ts`, `instructions.md`, `tools/*.ts`, `skills/*.md`, `subagents/`, `channels/` (Slack, Discord, Teams…), `schedules/` (cron). It adds durable execution, sandboxing, `needsApproval` and evals (https://vercel.com/blog/introducing-eve).
  - **Vercel Agent** (public beta): AI code review and production investigations (https://vercel.com/docs/agent).

### 3.9 Integrations, MCP, APIs and secrets
- **MCP presets:** Contentful, Context7, Glean, Granola, Hex, Linear, Mobbin, Notion, PostHog, Sanity, Sentry and Zapier.
- **Marketplace:** Neon, Supabase, Upstash and Stripe.
- **Custom MCP:** auth by none, custom headers, bearer token or OAuth. Opened from **+ → MCPs** (https://v0.app/docs/MCP; BYO MCP since Dec 3, 2025).
- **Where integrations are managed:** Project menu (…) → Settings → Integrations, with a per-integration Remote MCP toggle. The GitHub connection status appears in Settings → Integrations (Jul 21, 2026).
- **Environment variables:**
  - Location: Project menu → Settings → Environment Variables, scoped **per environment** (Development / Preview / Production / all) (Oct 31, 2025).
  - Encrypted in the Vercel vault.
  - **The preview can only see Development vars** (https://v0.app/docs/external-apis).
  - v0 warns about `NEXT_PUBLIC_` exposure and can move code server-side (https://v0.app/docs/security).

### 3.10 GitHub and version control
- **Connecting:** Project menu → Settings → GitHub → **Connect**. v0 creates a private repo and pushes the code, and the repo becomes the "source of truth" (https://v0.app/docs/github).
- **Branch model:**
  - The default branch, the **base branch** (where the chat starts and where its PR targets), a per-chat **working branch** created lazily on the first push, and the production branch (on Vercel).
  - v0 auto-commits and pushes to the working branch and never pushes to the base branch.
  - Commits are signed and verified (Jun 8, 2026).
  - v0 respects the repo's configured default branch name (Jun 19, 2026).
- **The branch menu** (next to Publish in the chat header): preview deployment, branch and diff on GitHub, create or open the PR, CI checks (running / passing / skipped / failing), **Pull Changes** from the base branch, and **Review Code / Fix Build / Fix CI / Fix Conflicts**.
- **Duplicate…:** creates a new chat on a new branch from the current commits.
- **Branch protection:** if required reviews or checks block a merge, v0 keeps the PR open, explains why, and links to it.
- **Team setting "Allow v0 to Act on Behalf of Members":** lets members without GitHub accounts collaborate (Feb 2026).

### 3.11 Importing existing projects
- **GitHub:** + → Import from… → **Import from GitHub**. Paste a URL or search, pick the **base branch**, and pick the **root directory** for monorepos. v0 uses the repo's lockfile and package manager and pulls development env vars from a linked Vercel project (https://v0.app/docs/git-import; any repo supported since Jan 2026). New in-project chats start with the project's source code (Aug 28, 2026). The API v2 can also start a chat from a repo (Jun 26, 2026).
- **Figma:** a paid feature. + → Import from Figma → OAuth. Paste a file link or frame link. v0 "shows the Figma frames it reads in the chat", extracting tokens, variables, layout, text, assets and Dev Mode links, subject to Figma API rate limits. The Figma skill auto-loads when a message contains a Figma link (https://v0.app/docs/figma; Jul 31, 2026).
- **Paper** (paper.design): import from the same menu (https://v0.app/docs/paper).
- **Screenshots and mockups:** drag or paste an image. v0 replicates the layout, colors and components and infers behavior (https://v0.app/docs/screenshots).
- **URLs:** the agent's browser can "visit external URLs to capture visual references or inspect a page's layout before recreating it" (https://v0.app/docs/agentic-features).
- **ZIP / .tgz:** drop into the prompt. The API accepts GitHub repos, ZIP archives or file sets.

### 3.12 Deploy, hosting, domains and environments
- **Publish button:** in the chat header.
- **First-publish wizard:** (1) confirm the Vercel project name, (2) **visibility**, (3) **domain** (a default `*.vercel.app` or a custom one), (4) claim any Stripe or Shopify test sandboxes, then **Publish** (https://v0.app/docs/deployments). It was simplified on Jul 21, 2026 to put visibility before domains and label the final action "Publish".
- **Later updates:** **Publish Changes**.
- **GitHub-backed projects:** create or reuse a PR, merge it, then run the production deploy.
- **Preview vs production:** preview deployments are built from working branches and get unique URLs.
- **Deployment popover / card:** live build progress; links to the site, the commit, the Vercel Inspector and build logs; live CI; contextual **Fix** actions (Aug 14, 2026).
- **Custom domains:** Publish → Customize Domain, or Settings → Domains. **Domains can be bought in the in-chat sidebar** (Dec 4, 2025). DNS is configured through "Inspect on Vercel" (https://v0.app/docs/custom-domains).
- **Snowflake apps:** Publish → **Deploy to Snowflake** (https://v0.app/docs/snowflake).
- **Governance:** deployment policies are respected, and blocked sources require Owner approval (Jul 7, 2026).
- **Branding:** the "Built with v0" badge was **removed** from published apps (Aug 14, 2026).

### 3.13 Versions, history and rollback
- **How versions are made:** every agent message that changes code creates a version.
- **Controls:** per-message controls let you inspect a version, view its diff, or **restore** it. Restoring creates a new latest version, so history stays **linear** (https://v0.app/docs/versions).
- **Selector:** a searchable version selector (Jan 2026). The Academy describes clicking "Latest" to roll back or restoring "any earlier checkpoint".
- **Deploying an old version:** only possible by restoring it first.
- **Git history:** real commits live in GitHub when connected.

### 3.14 Debugging and automatic error fixing
- **Auto-fix:** v0 automatically fixes missing dependencies, syntax errors, runtime bugs and import errors.
- **"Fix with v0":** appears in the deployment popover and on error bars and sends the logs to the agent.
- **Cost:** free when v0's own code caused the failure (since Oct 1, 2025). Free-tier daily complimentary uses apply "on unedited code"; after that, fixes cost credits (https://v0.app/docs/deployments).
- **Logs:** server logs (Jan 2026) and preview console capture.

### 3.15 Testing
- **Browser-use self-testing with screenshots** shown in chat (May 15, 2026).
- **Unit tests** through terminal commands (https://v0.app/docs/terminal-commands).
- **CI results** in the branch menu, and **Vercel Agent** code review on PRs (public beta).
- **No dedicated test-suite UI or QA report inside v0 (unverified).**

### 3.16 Security
- **Sandbox isolation:** per chat and per user or team, never on the same machine as production. There is a Sandbox Network Policy for outbound traffic.
- **Secrets:** env vars are stored in a vault, with `NEXT_PUBLIC_` leak warnings.
- **Code analysis:** "All generated code undergoes security analysis before execution" (https://v0.app/docs/security). There is **no user-visible security-scan report (unverified)**.
- **Compliance:** SOC 2 Type 2, ISO 27001 and PCI DSS (https://v0.app/docs/compare/v0-vs-replit).
- **React2Shell (Dec 2025):** v0 automatically patched more than 800,000 vulnerable deployments and now detects vulnerable projects (changelog, Dec 9, 2025).
- **Trust events:**
  - The Vercel April 2026 incident (an OAuth app compromise through a third-party AI tool) exposed environment variables and secrets. v0 itself was not reported as involved (https://news.ycombinator.com/item?id=47824463).
  - Vercel Passport (beta) keeps internal apps behind an IdP.

### 3.17 Analytics, monitoring, logs and usage
- **Usage & Activity dashboard** at v0.app/settings/usage (available to all users since Aug 14, 2026):
  - A Credits tab with a stacked daily bar chart of monthly vs shared-pool credits.
  - A per-event table with Date / Event / Kind / Model / Cost columns and **FREE tags** for waived fixes.
  - An Activity tab (active users, chats, messages) grouped by user or project.
  - Date ranges up to 365 days and CSV export (https://v0.app/docs/usage-dashboard).
- **App analytics and observability:** handled through Vercel (Web Analytics, logs, observability). The project settings panel shows analytics (Dec 2, 2025).

### 3.18 Collaboration, teams and sharing
- **Invite button (chat header):** sets visibility to Private, Team (view or edit), **Anyone with the link**, or Public. You can also invite people individually as **Can View / Can Edit**. Owners can see any team chat by URL (https://v0.app/docs/sharing).
- **The recommended pattern is "View and Duplicate"** rather than simultaneous editing, because there is no real-time multiplayer.
- **Workspace defaults:** default chat visibility (Sep 10, 2026). Project cards show teammates active in the last 24 hours. Users can request access to private chats (Jul 21, 2026), transfer chats between scopes, and use team templates, team skills and memories, team design-system defaults, a **shared credit pool** and team custom instructions (https://v0.app/docs/teams).
- **Slack bot:** `@v0 [repo=acme/dashboard] …` produces a branch, a PR and a preview link in the thread.
- **Management:** `Cmd+K` command palette across workspaces; v0 can "list and manage other user chats when requested" (Aug 14, 2026).

### 3.19 Templates and community
- **Gallery** at https://v0.app/templates: "Discover the best apps, components and starters from the community".
- **Categories:** Apps & Games, Landing Pages, Dashboards, Components, Login & Sign Up, Blog & Portfolio, E-commerce, AI, Animations, Design Systems, Layouts, Website Templates, **Agents**.
- **Cards:** preview image, title, @author, **fork and like counts** (for example 6.6K forks), and "View Details".
- **Publishing a template:** Project menu → Settings → Template → Publish. Requires a 1920×1080 image, name, description, category, up to 10 tags and visibility. Git-connected templates update through **Sync from Repo** (https://v0.app/docs/templates).

### 3.20 Mobile
- **iOS app** (Oct 23, 2025): React Native + Expo. It has a floating "Liquid Glass" composer and builds run in the background. Integrations install with one tap, and credit packs are sold through IAP at $6.99, $34.99 and $139.99 (https://apps.apple.com/us/app/v0/id6745097949, https://vercel.com/blog/how-we-built-the-v0-ios-app).
- **No native mobile app generation.** There is no React Native or Expo output; the community workaround is wrapping the web app with Capacitor (https://community.vercel.com/t/mobile-native-app-development-in-v0/8762).

### 3.21 Personalization: instructions, skills, memories, design systems
- **Instructions:** custom instructions (personal and team) and longer project instructions.
- **Custom skills (SKILL.md):**
  - Revision history (Aug 28, 2026) and in-place renaming.
  - A `disable-model-invocation` flag keeps a skill available manually without auto-loading it.
  - Owners can restrict who edits team skills and memories (Jul 7, 2026).
- **Design Systems 2.0:**
  - **Sources:** up to three GitHub repos, Figma frames, Storybook or doc links, and .tgz packages.
  - **Setup:** add context notes; `v0.json` describes the sources and the starter app; v0 builds a starter app and **pauses for approval** before saving.
  - **Customization:** logo and colors in the SKILL.md frontmatter.
  - **Management:** team default, revision history, and restricted editing (https://v0.app/docs/design-systems-2).
  - **Legacy:** shadcn registries with an **"Open in v0"** button (https://v0.app/docs/design-systems-legacy).

### 3.22 Platform API, SDK and MCP server
- **v1:** beta from Jul 9, 2025 (https://vercel.com/changelog/v0-platform-api-now-in-beta).
- **v2:** beta Jun 26, 2026; GA Aug 2026 at `https://api.v0.dev/v2`.
  - Chats and messages, sync, async and streaming modes, and exposed agent actions (file operations, edits, search, bash).
  - Start from a GitHub repo, a ZIP or files.
  - Short-lived preview tokens through a server proxy; attach and deploy Vercel projects.
  - MCP servers, and up to three skills per request.
  - Tasks for plan reviews, questions and permissions.
  - Organizations (multi-tenant), webhooks, usage and resume-stream endpoints (https://v0.app/docs/sitemap.md, https://www.infoq.com/news/2026/08/vercel-v0-api/).
- **Packages:** `v0-sdk`, `@v0-sdk/react` (AI SDK transport and SWR hooks), `@v0-sdk/ai-tools`, and `create-v0-sdk-app` (https://github.com/vercel/v0-sdk).
- **v0 MCP server tools:** create, find and read chats; fetch a preview; send a message; `listMessages`; `resolveTask` (Jun 26 and Jul 7, 2026).

### 3.23 Models
- **Tiers:** Dec 12, 2025 introduced **v0 Mini / Pro / Max**. Jun 8, 2026 reorganized the picker to Mini / Pro / Max / **Max Fast**, with v0 Max running Claude Opus 4.8.
- **Third-party models:** Claude Opus 5 and Opus 5 Fast (Jul 31, 2026), GPT-5.6 Sol and Sol Fast (Aug 28, 2026), Grok, Gemini and more through "Add models". On Enterprise, the owner must switch on "Allow custom models" (Sep 22, 2026).

### 3.24 Pricing and credits (as of Sep 2026)
- **Plans** (https://v0.app/pricing, https://v0.app/docs/pricing):

| Plan | Price | Included | Notable |
|---|---|---|---|
| Free | $0 | $5/mo credits, **7 messages/day** | Deploy, Design Mode, GitHub sync |
| Premium (legacy) | $20/mo | $20 credits | Sunset for new users |
| **Plus** (formerly "Team") | $30/user/mo | $30/user/mo + **$2 free daily credits on login** | All models, shared purchasable credits, centralized billing, shared chats |
| Business | $100/user/mo | Same credits as Plus | **Training opt-out by default** |
| Enterprise | Custom | Custom | Data never used for training, SAML SSO, RBAC, priority performance, support SLAs |

- **Token rates** per 1M tokens (input / output), from the Sep 2026 pricing page:
  - v0 Mini: $0.20 / $1.20
  - v0 Pro: $2 / $10
  - v0 Max: $5 / $25
  - v0 Max Fast: $10 / $50
  - Earlier 2026 third-party figures were higher (Mini $1/$5, Pro $3/$15, Max Fast about $150 output) (https://dev.to/jovan_chan_9500711396d4e6/v0-by-vercel-review-2026-ui-generation-the-credit-math-and-who-should-actually-pay-20month-31ig, https://www.agentrank.tech/blog/v0-pricing-credits-system-what-it-actually-costs).
- **Expiry and rollover:** monthly credits roll over and expire after 65 days (pricing docs; the teams doc says "one month", an inconsistency). Purchased credits expire one year after purchase.
- **Context costs tokens:** chat history, attachments and Vercel knowledge all count toward token use (https://vercel.com/blog/updated-v0-pricing).
- **Pricing history:**
  - **May 13, 2025:** moved from message-based to token-based pricing.
  - **Nov 5, 2025:** daily $2 credits added.
  - **Oct 31, 2025:** Business plan launched.
  - **Jul 15, 2026:** referral credits discontinued.
  - **Jun 19, 2026:** Apple Pay and Google Pay added.

### 3.25 Enterprise
- **Roles:** v0 Builder, Creator and Viewer (Viewers are free), plus an Integrations Manager permission. Access is provisioned through Directory Sync and Access Groups (https://v0.app/docs/enterprise).
- **Controls:** restrict chat sharing, model allowlists, deployment policies, sandbox network policy, and pre-installed agents disabled by default.
- **Integrations:** Snowflake, AWS, Glean.
- **Upcoming Vercel features:** Vercel Passport and BYOC (private beta).

---

## 4. UI layout (main screens)

The descriptions below are assembled from the docs, changelog and tutorials. Positions not stated explicitly by a source are marked **(inferred)**.

**Visual design language**
- Vercel's Geist system: Geist Sans and Geist Mono typefaces, a stark monochrome palette (#171717 and #fff), hairline shadow-as-border outlines, and generous whitespace (https://vercel.com/geist/introduction).
- v0's sidebar, scope picker, account navigation and env-var settings were redesigned in Jun 2026 to match the Vercel dashboard, and the editor uses "Vercel Light" and a dark theme.
- The overall feel is quiet, developer-tool minimalism with dense but calm information. Color is mostly reserved for status (CI, deploy) **(inferred)**.

**1. Homepage (signed in)**
- A centered prompt composer (Feb 2026).
- The composer holds the "+" menu (upload, Import from GitHub/Figma/Paper, MCPs, New Instruction), the model picker, design-system attach, skill chips, and the send button.
- The left sidebar holds recent chats and projects **(inferred: sidebar persists on home)**.
- Community templates and projects can be browsed and forked. Their exact placement on the signed-in home is **(unverified)**.

**2. Left sidebar (global)**
- Resizable, with a width that persists.
- Chats are **grouped by project** and sorted by activity, and there is a Projects tab.
- Favicon and status badges show streaming / waiting / ready. Hover cards show a site preview, changed files and the git branch.
- Right-click menus, archive (in place of delete), favorites and folders.
- The account dropdown includes integration management.
- Sources: changelog Aug 14, 2026; https://v0.app/docs/projects.

**3. Builder / chat workspace (split view)**
- **Header:** the chat or project title; the **branch menu** (Git status, PR and CI) sitting **next to the Publish** button; the **Invite** (share) button; and the **Project menu (…)**, which opens Settings (GitHub, Env Vars, Integrations, Vercel Project, Domains, Template) (https://v0.app/docs/github, https://v0.app/docs/sharing, https://v0.app/docs/projects). Left-to-right order is **(inferred)**.
- **Left column: chat.**
  - Messages show tool-status cards, browser screenshots, citations, work details (time / files / lines / credits), and version controls on each message.
  - Clarifying questions render inside the prompt form.
  - Approvals group in a panel at the **top of the composer**.
  - The **composer sits at the bottom of the chat column (inferred)**, with queued prompts and attachment chips.
- **Right column: the preview pane.**
  - A toolbar with **Preview / Code / Design** tabs, plus a route or page switcher, responsive size control, refresh, open in new tab and console.
  - The **Console** panel shows logs and the terminal.
  - Annotations mode overlays numbered pins on the preview.
- **Design tab:** the preview plus a side panel with layers and properties. Selecting an element shows a floating toolbar near it, and there is a measure overlay. An **Apply / Reset / Undo / Before-After** bar applies pending edits.
- **Code tab:** a file explorer on the left (toggle with Cmd+B), editor tabs, and diff and split toggles in the toolbar. Unsaved-change banners appear when autosave is off.

**4. Project Settings.** Reached from Project menu → Settings; it also lives in the chat sidebar (Dec 2, 2025). Sections: Environment Variables (per environment), GitHub, Integrations (with MCP toggles), Vercel Project (with production visibility), Domains (with purchase), and Template (publish). Advanced DNS and redirects deep-link to the Vercel dashboard ("Inspect on Vercel").

**5. Account and Workspace Settings.** Opened with Cmd/Ctrl+. (Jul 7, 2026). Contents:
- Billing: plan, credit balances and expiry, payment methods, invoices.
- Usage and Activity.
- Integrations: GitHub Connect / Reconnect / Manage, Figma, Snowflake.
- Instructions, custom skills and memories.
- Sound notifications.
- API keys.
- Workspace settings: default chat visibility, "Allow v0 to Act on Behalf of Members", Allow custom models, Restrict Chat Sharing, Restrict Memories and Skills.
- Sources: https://v0.app/docs/account, https://v0.app/docs/teams.

**6. Design Systems page.** A "Your Design Systems" list, built-in examples, a full-height import panel with inline Add buttons, and revision history.

**7. Templates gallery.** Category navigation plus a grid of cards with preview image, author, forks, likes and "View Details".

**8. Command palette (Cmd+K).** Jumps to chats, projects and actions across all workspaces, with results grouped by workspace.

---

## 5. Step-by-step user flows

### 5.1 Main flow: sign-up to custom domain
1. **Sign in** at vercel.com/login/v0 with Email, Google, GitHub, ChatGPT or SAML SSO. This creates a Vercel account (Hobby / Free).
2. **Onboarding:** no questionnaire was found **(unverified)**. The user lands on the centered prompt.
3. **First prompt.** The user can optionally attach a screenshot, Figma link or design system, pick a model, and press Enhance prompt.
4. **Clarifying questions** may appear inside the prompt form as option chips (single or multi-select, skip, or a custom answer).
5. **Plan approval.** If the Plan Mode instruction is on, v0 presents a plan to approve, modify or reject.
6. **What the user sees during generation:**
   - The chat streams tool-status cards (for example searching, reading, editing files, running commands) along with web citations.
   - The sandbox VM boots while the preview shows an empty or previous state with thin progress lines.
   - The preview updates live as files are written. The first generation is the slowest because it scaffolds the whole project. A tutorial measured about 30 s and 10 files for an early app (https://www.datacamp.com/tutorial/vercel-v0). Agent-mode users have reported 5–10+ minute runs (https://community.vercel.com/t/agent-mode-feedback-thread/18428).
   - The agent may open the app and post **screenshots** of its own testing.
   - The run ends with **work details**: time, files, lines, credits.
   - A sound or favicon badge signals completion.
7. **Iterate** in whichever way suits the user:
   - Follow-up prompts.
   - **Design Mode**: select, tweak, then Apply to create a new version.
   - **Annotations**: numbered pins sent as one batched prompt.
   - **Code tab** edits (these do not create versions).
   - Queued prompts while v0 is working.
8. **Preview.** Test routes and responsive sizes, read the Console logs, or open the preview in a new tab.
9. **Fix errors.** A compact error bar or failed build shows **Fix with v0**; the agent reads the logs and patches. It is free if v0 caused the error on unedited code.
10. **Add database and auth.**
    - Either v0 suggests an integration or the user asks for one, and the **Integration Wizard** opens in chat. It provisions Neon, Supabase, Upstash, AWS and others and writes env vars automatically.
    - New apps already scaffold Neon + Drizzle + Better Auth.
    - Schema and queries are handled through the agent or **DB Studio → SQL**.
11. **Connect GitHub.** Project menu → Settings → GitHub → Connect creates a private repo. From then on, every change goes to the chat's working branch and gets a preview deployment.
12. **Publish.**
    - First time: a wizard for project name → visibility → domain → claiming Stripe or Shopify sandboxes → **Publish**.
    - With GitHub connected: v0 creates or reuses the PR, merges it, and deploys to production, showing a live build card with CI results, logs and the Inspector.
    - Later: **Publish Changes**.
13. **Custom domain.** Publish → Customize Domain, or Settings → Domains. Buy a domain in the sidebar or connect an existing one, with DNS set through "Inspect on Vercel".

### 5.2 Import an existing project
- **GitHub:**
  1. + → Import from… → Import from GitHub.
  2. Paste a URL or search for the repo. Requires the Vercel GitHub App.
  3. Pick the **base branch**, and the **root directory** for a monorepo.
  4. Optionally link an existing Vercel project so development env vars and framework settings come across.
  5. The sandbox checks out the repo and installs dependencies with its lockfile's package manager.
  6. The first code change creates a working branch and a preview deployment.
  7. Publishing opens and merges a PR (https://v0.app/docs/git-import).
- **Figma:** + → Import from Figma → OAuth. Paste a file or frame link. v0 shows the frames it reads in chat, and you can redirect it to other frames.
- **Screenshot or ZIP:** drag and drop, or paste.
- **Design system:** Design Systems page → Import. Add sources and notes, v0 builds a starter app, you **approve** it, and it is saved as a team or personal skill.

### 5.3 Agent-building flow (as it exists today)
1. Prompt for an AI feature or agent, for example a support chatbot with tools.
2. v0 decides the implementation autonomously: AI SDK agent code, shadcn chat primitives, models through the AI Gateway with zero-config OIDC.
3. If external services are needed, **Vercel Connect** runs an OAuth setup in the browser (per user, or a shared account for bots and scheduled agents).
4. Test in the preview, then publish.
- **There is no visual agent canvas, eval runner or schedule UI in v0 (unverified).** eve, Workflow and Chat SDK capabilities exist in Vercel's stack but are code-first.

### 5.4 Collaboration flow
1. Click **Invite** and set visibility (private / team view / team edit / link / public), or invite people as Can View or Can Edit.
2. Teammates see active colleagues on project cards and can request access to private chats.
3. For parallel work, use **Duplicate…** to get a new chat on a new branch in the same repo and Vercel project. Deploying from any chat updates the same production URL.
4. Non-engineers can also tag `@v0` in Slack, which creates a branch, opens a PR and posts a preview link, for engineers to review.
5. Team owners set defaults: visibility, design system, skills, instructions, and model access.

### 5.5 Headless / developer-platform flow
1. Create an API key and install `v0-sdk` (or scaffold with `create-v0-sdk-app`).
2. `chats.create` with a prompt, design-system skill and MCP servers.
3. Stream the agent's activity.
4. Resolve tasks (questions, permissions, plan approvals).
5. Embed the preview through a proxy token.
6. Deploy to a Vercel project.
- Other agents can do the same through the v0 MCP server.

---

## 6. UX strengths and pain points

### What users love (with evidence)
- **Output quality and polish.** Clean React, Tailwind and shadcn output that is accessible and responsive by default. Product Hunt rates it 4.9/5 over 60 reviews ("turns a rough idea into a working UI in minutes") (https://www.producthunt.com/products/v0/reviews). Reviewers score UI generation 9.5/10 (https://automationatlas.io/answers/v0-review-2026/).
- **Speed to a shareable URL.** "v0 instantly solved the 'blank canvas' problem"; an MVP in a weekend (https://news.ycombinator.com/item?id=45163212).
- **Git safety for real teams.** Branch per chat, previews, PRs, CI and Fix CI let business users contribute without scaring engineers (https://vercel.com/blog/introducing-the-new-v0).
- **Visual precision.** Design Mode, the measure overlay, layers, annotations and Apply-as-version close the gap between "prompting" and "designing".
- **Ecosystem convenience.** One-click Marketplace databases with automatic env vars, Stripe test sandboxes, zero-config AI Gateway, and domain purchase inside the app.
- **Transparency features.** Work details per run, per-event usage logs with FREE tags, visible tool cards, and screenshots of self-testing.
- **Power-user ergonomics.** Cmd+K, slash commands, prompt history, queued prompts, keyboard control in Design Mode, and a terminal with Claude Code.

### Pain points and complaints (with evidence)
- **Credit burn and unpredictable cost (the dominant complaint since May 2025).**
  - After the token switch, one user had $4.89 left after about 40 prompts.
  - Agent mode (Aug 2025) made a badge color change cost $0.39 instead of about $0.05. Users reported $1–$8 per prompt and $10–$50 sessions (https://community.vercel.com/t/agent-mode-feedback-thread/18428, https://community.vercel.com/t/seemingly-high-credit-consumption/21324).
  - A current forum topic cites "$30USD on a single prompt" (https://community.vercel.com/c/v0/59).
  - Vercel said it "will not be reverting this change" (https://superdesign.dev/blog/v0-review).
- **Paying for the AI's own mistakes and bug loops.**
  - One user lost more than $70 and 16 hours in an error loop and could not revert cleanly (https://community.vercel.com/t/experiencing-persistent-issues-and-error-loops-in-v0/12695).
  - "20% of iteration spend went to corrections where v0 broke stuff".
  - Free fixes apply only to *unedited* code.
- **Loss of control when agent mode launched.** Model choice was removed in Aug 2025 ("significant regression"), and runs got slower (5–10+ minutes). Tiered model choice was later restored (Mini / Pro / Max in Dec 2025, custom models in 2026).
- **No clear Plan / Build / Ask switch.** Users asked for Replit-style modes. Plan mode lives as an "instruction" checkbox, which is easy to miss.
- **Stack and host lock-in.** Output is React / Next.js only ("request Svelte… it spat out React"). The full workflow assumes Vercel hosting, and native mobile apps are not supported (https://superdesign.dev/blog/v0-review, https://community.vercel.com/t/mobile-native-app-development-in-v0/8762).
- **Growing complexity for non-technical users.** Base, working and production branches, PRs, CI checks, deployment policies, and split roles (v0 roles vs Vercel roles) show how much the product now assumes a developer mental model. DNS still sends users out to the Vercel dashboard.
- **Version-model gaps.** Manual code edits do not create versions. Restoring is linear, with no branching timeline inside the chat. Old versions must be restored before they can be deployed.
- **Collaboration limits.** No real-time co-editing; docs recommend "View and Duplicate".
- **Environment gotchas.** The preview only sees Development env vars. Sandboxes live at most 24 hours (the filesystem persists). Figma import depends on Figma API rate limits and a paid plan.
- **Account and access friction.** Forum reports describe chats turning "Private/Unauthorized", access removed after cancelling, and slow recovery responses (https://community.vercel.com/c/v0/59).
- **Trust and security headlines around Vercel.** React2Shell (Dec 2025) and the April 2026 OAuth / env-var incident, described as the "third major vulnerability… within 12 months" (https://news.ycombinator.com/item?id=47824463).
- **Perception lag.** Many 2026 comparison articles still call v0 "frontend-only", which suggests its full-stack capabilities are not self-evident from the product or its marketing.
- **Free tier too thin to evaluate.** Seven messages a day and $5 of credits (https://www.agentrank.tech/blog/v0-pricing-credits-system-what-it-actually-costs).

---

## 7. Recent notable launches (2025–2026)

| Date | Launch |
|---|---|
| May 13, 2025 | Token-based credit pricing replaces message counts |
| Jun 2025 | Design Mode introduced (visual editing) |
| Jul 9, 2025 | v0 Platform API beta |
| Aug 11, 2025 | v0.dev becomes **v0.app**; agentic v0 (plan, research, build, debug) |
| Oct 2025 | Free "Fix with v0" (Oct 1); Custom Instructions and Plan Mode preset (Oct 6); Next.js 16; **iOS app** (Oct 23); work details and chat sidebar redesign (Oct 30); **Business plan**, per-environment env vars, Integration Wizard (Oct 31) |
| Nov 2025 | $2 daily credits (Nov 5); **Stripe** (Nov 10); MCP presets and Enterprise page (Nov 17); Snowflake early access (Nov 25) |
| Dec 2025 | Project settings in sidebar; **bring-your-own MCPs**; domain purchase; editor upgrade (diff, split, search and replace); React2Shell auto-patch; **Mini / Pro / Max** tiers; Linear and Notion MCPs; **clarifying questions** (Dec 17); Glean |
| Jan 2026 | **Import any GitHub repo**; Folders and Projects; AI SDK v6; credit rollover; server logs; AWS databases (Jan 15) |
| **Feb 3, 2026** | **"The new v0"**: VM sandbox runtime, Git panel (branch per chat, PR, deploy on merge), Snowflake and AWS, enterprise security; simplified centered home |
| Mar 2026 | Stability fixes; Simplified Chinese; Tailwind 4.2; branch picker; SSO page; Stripe GA on Marketplace and v0 |
| May 2026 | **Terminal commands** with permissions; sandboxes 50% faster; agent browser screenshots |
| Jun 2026 | **Cmd+K palette**; Fix PR Conflicts; **DB Studio SQL**; Max = Opus 4.8 plus Max Fast; Design Mode floating toolbar, layers and measure; Neon + Drizzle + Better Auth default; Shopify; **Annotations mode** and in-form questions (Jun 19); **API v2 beta** and MCP chat tools (Jun 26); Vercel Ship 2026: eve, AI SDK 7, Vercel Connect, Agent Stack |
| Jul 2026 | Grouped tool approvals; deployment policies; team design-system defaults (Jul 7); slash commands, Shopify public, simplified publish wizard (Jul 21); **Claude Opus 5**, direct Figma inspection (Jul 31) |
| Aug 2026 | **v0 API GA**; redesigned sidebar, deployment popover, Usage dashboard for all, "Built with v0" badge removed (Aug 14); GPT-5.6 Sol, zero-config AI Gateway in generated apps, Sign in with Vercel in previews (Aug 28) |
| Sep 2026 | **Unified GitHub publishing** in one Publish click (Sep 1); team default chat visibility and "active teammates" on project cards (Sep 10); enterprise model picker controls (Sep 22) |

Sources: https://v0.app/changelog, https://vercel.com/blog/v0-app, https://vercel.com/blog/introducing-the-new-v0, https://vercel.com/blog/vercel-ship-2026-recap.

---

## 8. Ideas for Architect 2.0

**ADOPT**
- ADOPT: **"One app, many chats" project model.** Every chat is a workstream (with a branch underneath), and every deploy updates the same production URL. It scales from solo use to team use without a new mental model.
- ADOPT: **A single "Publish" action that hides the PR, merge and deploy pipeline** for non-technical users, next to a **branch/status menu** that exposes preview URL, diff, PR, CI and "Fix CI / Fix conflicts" for developers. This is progressive disclosure done right.
- ADOPT: **An end-of-run "receipt"** (time worked, files changed, lines, credits spent), plus a usage log per event with **FREE** tags for AI-caused fixes.
- ADOPT: **Clarifying questions rendered as answer chips inside the composer** (single or multi-select, skip, "other"), so a vague prompt becomes a structured brief without a wall of text.
- ADOPT: **One approvals tray above the composer** for terminal, MCP and integration permissions, with **Ask / Auto / Full** autonomy modes shown in plain language ("Ask me first / Only risky things / Never ask").
- ADOPT: **Visual edits held as "pending", then Apply**, which creates a normal version with a diff. Add an **Annotations mode** where numbered pins on the preview become one batched instruction; this is ideal for non-technical reviewers.
- ADOPT: **Show the last good preview immediately while the sandbox boots**, with a thin progress line, instead of a blank spinner.
- ADOPT: **Agent self-testing with screenshots posted in chat**, as proof that it checked its own work.
- ADOPT: **An in-chat integration wizard.** When the agent needs a database, payments or auth, it asks, provisions, and writes env vars itself. Pair this with **claimable test sandboxes** (the Stripe-style "test now, claim at publish").
- ADOPT: **Per-environment secrets (Dev / Preview / Prod)** with automatic warnings when a secret would leak client-side.
- ADOPT: **Design systems as "skills".** Point at repos, Figma or Storybook; the agent builds a starter app; the user **approves** it before it becomes the team default, with revision history.
- ADOPT: **Headless API plus an MCP server** so other agents, CI and Slack can drive Architect ("Architect as infrastructure"). Include a **Slack @mention → PR + preview link** flow.
- ADOPT: **Power-user layer:** Cmd+K palette, slash-command skills, prompt history, queued prompts, sound and favicon notifications, and sidebar status badges (streaming / waiting / ready).

**IMPROVE**
- IMPROVE: **Cost predictability,** v0's biggest wound. Show an **estimate before a run**, a **live cost meter** while it runs, a per-task **spend cap**, and **automatic refunds** whenever the AI broke its own code, not only on "unedited code".
- IMPROVE: **Make modes first-class.** Put a visible **Plan / Build / Ask** switch in the composer rather than burying Plan Mode as an optional "instruction". Users explicitly asked for this.
- IMPROVE: **A real checkpoint timeline.** Every change, including manual code edits and visual edits, should create a checkpoint. Allow **branching from any checkpoint** and **deploying any checkpoint** directly, with visual thumbnails of each version.
- IMPROVE: **Live multiplayer** (presence, cursors, comment threads on the preview) instead of v0's "View and Duplicate" workaround. Keep v0's "teammates active in last 24h" signal.
- IMPROVE: **A true Agent Studio.** v0 has no visual agent builder. Offer a dual view: a visual canvas (triggers, tools, memory, approvals, schedules, channels, evals) **synced to a file tree**, inspired by eve's "an agent is a directory" model. Let developers choose the framework (AI SDK, eve, LangGraph, CrewAI, Mastra, OpenAI Agents SDK) while non-technical users only see the canvas.
- IMPROVE: **Framework and host freedom.** v0 is locked to React, Next.js and Vercel. Offer framework templates (Next, Vite, Python/FastAPI and others), plus export or deploy targets, to answer the lock-in objection.
- IMPROVE: **Plain-language Git for non-technical users.** Use terms like "Draft → Review → Live" and "Your changes are saved safely on a draft copy", backed by real branches and PRs, with a toggle to reveal Git terminology.
- IMPROVE: **Preview environment parity.** Let the user pick which env set the preview uses and show it clearly, fixing v0's "preview only sees Development vars" gotcha.
- IMPROVE: **Loop detection.** After N failed fix attempts, stop, explain, and offer "roll back to last working version" or "try a different approach", instead of silently burning credits.
- IMPROVE: **Make security and quality visible.** Add a pre-publish checklist covering a secrets scan, dependency CVEs, auth on routes, and Lighthouse and a11y. v0 claims security analysis but shows no report.
- IMPROVE: **Role-aware onboarding.** Ask "What best describes you?" plus a goal, then set the default workspace density (for example, hide the Code tab and Git terms for builders, show the terminal and branch menu for developers). No v0 equivalent was found.
- IMPROVE: **Keep everything in one product.** DNS, domains, roles and logs should not bounce the user out to a separate dashboard ("Inspect on Vercel").
- IMPROVE: **Native mobile output** (Expo / React Native) with device-frame previews and QR-code testing. v0 cannot do this.

**AVOID**
- AVOID: **Abrupt pricing-model changes with "we will not revert" messaging.** Grandfather users, give notice, and publish worked cost examples.
- AVOID: **Forcing one "agent mode" and removing model and cost control.** v0 had to re-add tiers after the backlash.
- AVOID: **Exposing CI, branch protection, base/working/production branch vocabulary, or split permission systems** (v0 roles vs Vercel roles) to non-technical users by default.
- AVOID: **Hidden context costs.** If chat history and attachments consume tokens, show and manage them, for example with an auto-summarized context indicator.
- AVOID: **Silent limits** such as a 24-hour sandbox lifespan, file-size caps and preview env scoping. Surface them in the UI at the moment they matter.
- AVOID: **Letting the product undersell itself.** v0's full-stack features are so buried behind menus that reviewers still call it "frontend-only". Make backend, database, auth and agents visible on the home screen and in the workspace (for example, a "Data", "Agents" or "Deploy" status strip).

---

## Sources

**Primary: v0 / Vercel**
- https://v0.app/
- https://v0.app/changelog
- https://v0.app/pricing
- https://v0.app/docs
- https://v0.app/docs/sitemap.md
- https://v0.app/docs/faqs
- https://v0.app/docs/pricing
- https://v0.app/docs/quickstart
- https://v0.app/docs/agentic-features
- https://v0.app/docs/model-picker
- https://v0.app/docs/ai-models
- https://v0.app/docs/design-mode
- https://v0.app/docs/design-systems-2
- https://v0.app/docs/design-systems-legacy
- https://v0.app/docs/figma
- https://v0.app/docs/screenshots
- https://v0.app/docs/images-and-videos
- https://v0.app/docs/projects
- https://v0.app/docs/sandbox
- https://v0.app/docs/code-editing
- https://v0.app/docs/terminal-commands
- https://v0.app/docs/pre-installed-agents
- https://v0.app/docs/github
- https://v0.app/docs/git-import
- https://v0.app/docs/deployments
- https://v0.app/docs/custom-domains
- https://v0.app/docs/databases
- https://v0.app/docs/full-stack-apps
- https://v0.app/docs/external-apis
- https://v0.app/docs/versions
- https://v0.app/docs/sharing
- https://v0.app/docs/teams
- https://v0.app/docs/templates
- https://v0.app/docs/security
- https://v0.app/docs/vercel-connect
- https://v0.app/docs/vercel-integration
- https://v0.app/docs/MCP
- https://v0.app/docs/instructions
- https://v0.app/docs/prd-design
- https://v0.app/docs/prototyping
- https://v0.app/docs/usage-dashboard
- https://v0.app/docs/slack
- https://v0.app/docs/snowflake
- https://v0.app/docs/enterprise
- https://v0.app/docs/account
- https://v0.app/docs/api/v2
- https://v0.app/docs/api/v2/guides/handling-agent-interactions
- https://v0.app/docs/compare/v0-vs-replit
- https://v0.app/docs/compare/v0-vs-figma-make
- https://v0.app/templates
- https://vercel.com/login/v0
- https://vercel.com/blog/introducing-the-new-v0
- https://vercel.com/blog/v0-app
- https://vercel.com/blog/updated-v0-pricing
- https://vercel.com/blog/vercel-ship-2026-recap
- https://vercel.com/blog/introducing-eve
- https://vercel.com/blog/ai-sdk-6
- https://vercel.com/blog/ai-sdk-7
- https://vercel.com/blog/how-we-built-the-v0-ios-app
- https://vercel.com/blog/working-with-figma-and-custom-design-systems-in-v0
- https://vercel.com/blog/aws-databases-are-now-live-on-the-vercel-marketplace-and-v0
- https://vercel.com/blog/build-your-own-ai-app-builder-with-the-v0-platform-api
- https://vercel.com/changelog/v0-platform-api-now-in-beta
- https://vercel.com/changelog/stripe-is-now-generally-available-on-the-marketplace-and-v0
- https://vercel.com/docs/agent
- https://vercel.com/docs/workflows
- https://vercel.com/geist/introduction
- https://vercel.com/academy/vercel-foundations/v0-way
- https://github.com/vercel/v0-sdk
- https://apps.apple.com/us/app/v0/id6745097949

**Secondary: press, community, reviews**
- https://www.infoq.com/news/2026/08/vercel-v0-api/
- https://www.infoq.com/news/2026/06/vercel-eve-agents/
- https://www.infoworld.com/article/4126837/vercel-revamps-ai-powered-v0-development-platform.html
- https://alphasignal.ai/news/vercel-s-v0-api-v2-lets-ai-agents-build-and-ship-apps-without-humans
- https://siliconangle.com/2025/08/11/vercels-v0-app-launches-allowing-anyone-create-deploy-working-app-website-using-prompts/
- https://alternativeto.net/news/2026/8/v0-sidebar-groups-chats-by-project-with-real-time-status-updates/
- https://www.createwith.com/tool/v0/updates/v0-launches-design-mode-with-visual-editing-and-layer-management
- https://community.vercel.com/t/agent-mode-feedback-thread/18428
- https://community.vercel.com/t/seemingly-high-credit-consumption/21324
- https://community.vercel.com/t/experiencing-persistent-issues-and-error-loops-in-v0/12695
- https://community.vercel.com/t/requesting-plan-and-build-modes/22153
- https://community.vercel.com/t/mobile-native-app-development-in-v0/8762
- https://community.vercel.com/c/v0/59
- https://community.vercel.com/t/vercel-weekly-2026-09-21/49532
- https://community.vercel.com/t/vercel-weekly-2026-09-07/48955
- https://news.ycombinator.com/item?id=45163212
- https://news.ycombinator.com/item?id=47824463
- https://www.producthunt.com/products/v0/reviews
- https://superdesign.dev/blog/v0-review
- https://www.agentrank.tech/blog/v0-pricing-credits-system-what-it-actually-costs
- https://dev.to/jovan_chan_9500711396d4e6/v0-by-vercel-review-2026-ui-generation-the-credit-math-and-who-should-actually-pay-20month-31ig
- https://automationatlas.io/answers/v0-review-2026/
- https://www.nxcode.io/resources/news/v0-by-vercel-complete-guide-2026
- https://www.nocode.mba/articles/v0-review-ai-apps
- https://weavai.app/blog/en/2026/04/28/v0-by-vercel-2026-review-ui-quality-pricing-verdict/
- https://flaviocopes.com/v0-tutorial/
- https://www.datacamp.com/tutorial/vercel-v0
- https://xerocoding.com/articles/how-to-use-v0-vercel-build-apps-2026
