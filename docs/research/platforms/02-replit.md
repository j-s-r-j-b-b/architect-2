# 02 — Replit (Replit Agent 4, Replit Design, Workspace, Publishing)

> Research date: 2026-09-25. Replit ships changes almost every week (see the changelog at https://docs.replit.com/updates), so every claim below carries a date where one was available. "(unverified)" means I could not confirm it from a primary source. "(inferred)" means I pieced a UI detail together from docs text or tutorial write-ups, not from my own screenshots. I did not sign up or log in anywhere.

---

## 0. Snapshot (TL;DR)

- **What it is (Sept 2026):** A browser-based, AI-first "build anything" workspace. You chat with **Replit Agent**. The Agent plans the work, designs it on an infinite canvas, writes code in parallel background tasks, tests the app in a real browser, and publishes it on Replit's own cloud (Postgres, Auth, App Storage, domains, analytics, security scans). Everything sits in one product and one bill. Replit has also grown into a general "knowledge-work agent": Chats, Routines, slides, docs, spreadsheets, charts. See https://replit.com/blog/introducing-agent-4-built-for-creativity and https://www.latent.space/p/ainews-replit-agent-4-the-knowledge.
- **Current generation:** **Agent 4**, launched **March 11, 2026** alongside a **$400M Series D at a $9B valuation**. Its four headline pieces are the infinite Design Canvas, parallel agents on a task board, multi-artifact projects, and team collaboration (https://replit.com/blog/introducing-agent-4-built-for-creativity, https://replit.com/news/funding-announcement).
- **Scale (company claims or secondary sources):** "Millions of users" and 500k+ professional users (https://replit.com/news/funding-announcement). About 50M users is widely cited (https://techstartups.com/2026/08/19/replit-launches-free-mode-with-openai-letting-users-build-ai-apps-without-burning-credits/). ARR was about $150M in summer 2025 (https://techcrunch.com/2025/10/02/after-nine-years-of-grinding-replit-finally-found-its-market-can-it-keep-it), with a target of $1B ARR by the end of 2026 (funding announcement). A figure of $525M ARR in April 2026 appears only in a secondary source (unverified).
- **Why it matters for Architect 2.0:** Replit is the only major player that serves **both** non-technical builders and developers in one product. Its method is layering: a chat and canvas surface on top, with a full Linux IDE (Shell, file tree, Git, Workflows, SSH) underneath. It also owns the whole runtime, including hosting, database, auth and secrets. Its weak spots are cost predictability, agent reliability and the gap between the dev preview and the live app. Architect 2.0 can differentiate on exactly those.

---

## 1. Positioning — what makes Replit different

1. **The full stack is owned end to end.** Replit is not just a code generator. It runs the dev environment (a NixOS container), the managed Postgres database (Neon-backed, with separate Dev and Prod databases), Replit Auth and Clerk Auth, App Storage (GCS-backed), Secrets, and deployments on GCP. Each customer gets a single-tenant GCP project (https://docs.replit.com/learn/projects-and-artifacts/replit-deployments.md, https://docs.replit.com/build/add-database.md). The CEO describes infrastructure as the moat that foundation labs do not prioritise (https://techcrunch.com/2025/10/02/after-nine-years-of-grinding-replit-finally-found-its-market-can-it-keep-it).
2. **A real IDE sits under the agent.** Developers get Shell, Console, file tree, Git pane, Workflows (configurable run buttons), Resources monitor, devtools inside the Preview, and SSH into VS Code or Cursor (https://docs.replit.com/category/workspace-features, https://docs.replit.com/replit-workspace/ssh). Lovable and v0 hide the runtime. Replit exposes it.
3. **"Agent on any framework."** Since Sept 2, 2025, choosing "General" lets the Agent work in any language or stack: Python, Go, Rust, Java, C#, Vue, Angular, Godot, Jupyter, CLIs (https://replit.com/blog/agent-on-any-framework). This is a key developer draw.
4. **Autonomy plus self-verification.** Agent 3 (Sept 10, 2025) added **App Testing**: the Agent drives a real browser, clicks through the app, fixes what breaks and retests, with a video replay afterwards. Replit claims it is "3x faster and 10x more cost-effective than Computer Use models". Agent 3 could also run autonomously for 200+ minutes (https://replit.com/blog/introducing-agent-3-our-most-autonomous-agent-yet).
5. **Parallel, team-based agent work (Agent 4).** A big request is split into tasks that run in **isolated copies** of the project. A Kanban board tracks them (Drafts → Active → Ready → Done). The Agent resolves merge conflicts with AI; Replit claims it succeeds about 90% of the time (https://docs.replit.com/core-concepts/agent/task-system.md, https://www.therundown.ai/tools/replit-agent-4).
6. **Design and code live on one canvas.** Since Agent 4, the canvas is a layer on top of the running app, not a separate tool. Replit Design (July 29, 2026) adds Explore/Refine, model choice, the Mobbin reference library and design systems (https://replit.com/blog/introducing-replit-design).
7. **Multi-artifact projects.** One project can hold up to 7 artifacts: web app, mobile app (at most 1), slide deck, animation (exports MP4), data visualisation, 3D game and design. They share the same DB, backend and storage (https://docs.replit.com/learn/projects-and-artifacts/projects-and-artifacts.md).
8. **Expanding beyond coding.** Chats (private, research-style), Routines (scheduled recurring agent work), inline charts, documents and spreadsheets. The homepage now offers Document and Spreadsheet chips next to Website and Mobile (https://replit.com/, https://docs.replit.com/chat/conversations-and-projects.md).
9. **Stated strategy is non-technical first.** Masad: "making programming more accessible to the average individual, to the knowledge worker, that's where we think our market is" (TechCrunch, Oct 2025). The developer layer is kept, but the growth motion targets PMs, founders, ops and designers. The Gallery is organised by role: Founders, Product Managers, Designers, Engineers, Operations, IT (https://replit.com/gallery).

---

## 2. Who uses it and why (jobs to be done)

**Non-technical users (primary growth segment):** founders, PMs, designers, marketers, ops and "citizen developers" in enterprises. Zillow reports 600 seats and 7,000+ apps in a year (https://replit.com/news/funding-announcement).
- JTBD: "Turn my idea into a working, shareable app today without learning to code." The homepage promise is "Turn ideas into apps in minutes — no coding needed" (https://replit.com/).
- JTBD: "Build an internal tool on top of our real data." Warehouse connectors cover Databricks, Snowflake, BigQuery and Microsoft Fabric (https://docs.replit.com/connectors/warehouses/overview.md).
- JTBD: "Automate a recurring chore": Routines, Slack and Telegram bots, email digests (https://docs.replit.com/chat/routines.md).
- JTBD: "Make the pitch deck, the landing page and the app from one idea" (multi-artifact).
- Why they choose Replit: no setup, everything built in (DB, auth, hosting), a generous free tier and Free Mode, one-click publish. G2 and Capterra reviewers repeatedly say "blank prompt to working project in hours, even with no coding background" (https://www.g2.com/products/replit/reviews?qs=pros-and-cons, https://www.capterra.com/p/10011212/Replit/reviews/).

**Technical users (developers, startups, students):**
- JTBD: "A cloud dev box I can reach from anywhere, with an agent that does the boilerplate": Shell, Nix, Workflows, SSH to a local IDE.
- JTBD: "Import my GitHub repo and keep working with an agent" (https://docs.replit.com/build/import-from-providers.md).
- JTBD: "Run a Python or Node service, bot or cron 24/7 without DevOps": Reserved VM and Scheduled deployments. Comparison sites say Replit wins for "anything that needs a custom backend, scheduled jobs, or a Python/Node service running 24/7" (https://zapier.com/blog/lovable-vs-bolt/).
- Why developers hesitate: unpredictable cost, missing CI/CD and observability integrations (Datadog, New Relic), Git sync is manual, and the platform has Replit-specific config that makes lock-in real (https://hackceleration.com/replit-review, https://www.brilworks.com/blog/how-to-migrate-from-replit/).

**Enterprise (IT and platform teams):** SSO/SAML, SCIM, audit logs with SIEM streaming, a Compliance API, Admin API, per-user spend limits, region pinning, private deployments, custom OAuth for connectors, SBOMs (https://docs.replit.com/billing/plans/replit-enterprise.md). Named customers include Zillow, Databricks, PayPal, Adobe, Talkdesk, Duolingo and Coinbase.

---

## 3. Complete feature inventory (grouped by area)

### 3.1 Onboarding and account auth
- Sign-up options: Google, GitHub, X, email/password, plus enterprise SSO (third-party summary: https://www.rapidevelopers.com/blog/what-is-replit-a-beginners-guide). Apple sign-in for Replit accounts is unverified. replit.com/signup returned HTTP 403 to my fetch.
- Post-signup questions ask for your name and whether use is personal, school or work (third-party, unverified in 2026). The in-app greeting was "Hi {name}, what do you want to make?" in 2025 (third-party). The marketing homepage headline is "What will you build?" (https://replit.com/).
- **Workspaces:** each account has a Personal Workspace and can create Team Workspaces from the Workspace menu (top-left) → "Create workspace". Setup asks for a name, a **Workspace region** (North America, EU, Asia or auto, since Aug 14, 2026) and **Invite team members** (https://docs.replit.com/teams/create-your-workspace.md, https://docs.replit.com/updates/2026/08/14/changelog).
- Session length was extended and Enterprise can configure timeouts (Jul 31, 2026).

### 3.2 Homepage and prompt entry
- **Workspace home** puts "recent projects, Workspace navigation, and the Chat prompt into one view", with **suggested prompts** (https://docs.replit.com/features/collaboration/workspaces).
- **Artifact-type chips** on the homepage: Website, Mobile, Design, Slides, Animation, Data Visualization, 3D Game, Document, Spreadsheet. Example prompts include "B2B project management app", "Freelance client portal" and "AI sales assistant". The page says "Your first prompt is free" (https://replit.com/).
- **Plus menu** in the prompt box: *Upload a file*, *Create something new*, *Import a project*, *Use a skill or design system*, *Add an integration* (https://docs.replit.com/home/start-a-conversation.md).
- **Mode selector** below the prompt: Free / Power / Max. The **Agent settings** dropdown holds Auto or a specific model, an Effort control, and Advanced settings such as App testing (https://docs.replit.com/chat/agent-modes.md, https://docs.replit.com/chat/auto-mode.md).
- A **Plan toggle** sits "at the bottom right of the chat input" (https://docs.replit.com/learn/plan-vs-build-mode.md).
- **Voice Mode** transcribes speech into editable text (Jun 19, 2026). **Attachments** accept files, images, screenshots and spreadsheets (.xlsx, .csv, Google Sheets URL), which become a DB-seeded app (https://docs.replit.com/build/import-from-providers.md).
- **Gallery and templates:** the old language templates were retired and replit.com/templates now redirects to the **Replit Gallery**. The Gallery has All/Work/Personal tabs, role and use-case filters, "Views / Used N times" counters and remixable apps (https://replit.com/gallery). Replit Design adds "hundreds of designer-created templates" plus Mobbin's 600k+ screens (https://replit.com/blog/introducing-replit-design).

### 3.3 Chat and agent interaction
- **Chats vs Projects (Aug 2026):** a Chat is a private, linear thread for questions, research, documents, images, sheets and Routines. It cannot publish and has no background tasks. You can "turn the chat into a Project" and its context carries over (https://docs.replit.com/chat/conversations-and-projects.md).
- **Plan vs Build:** in Plan mode the Agent reads the project and makes no file changes. Its output is a plan card with the sections **What and Why**, **Done looks like**, **Out of scope** and numbered steps. A "task plan is ready for review" banner offers **Review now**. The actions are **Revise**, **Cancel**, **Build here** and **Build in background** (https://docs.replit.com/learn/plan-vs-build-mode.md, https://docs.replit.com/learn/build-with-agent.md). Plan-mode reasoning is billable (https://docs.replit.com/billing/ai-billing).
- **Modes, and how often they have been renamed:**
  - 2025: Build/Plan, "Fast mode" (formerly Assistant), "High power model", "Extended thinking".
  - Autonomy levels Low/Medium/High/Max (Sept 2025).
  - Dec 2025: Fast became **Lite**.
  - Feb 2026: **Economy/Power/Turbo**. Turbo is "2x faster", but requests cost up to 6x more (https://replit.com/blog/pro-plan).
  - Jul 31, 2026: Lite/Economy/Power.
  - Aug 2026: **Free / Power / Max**. Economy was deprecated and Lite removed (https://docs.replit.com/chat/agent-modes.md, https://docs.replit.com/updates/2026/08/28/changelog).
  - The Autonomy Level docs page no longer covers autonomy levels, so the feature appears folded into modes (inferred).
- **Auto (intelligent model routing), Aug 28, 2026:** routes each part of the work to a model and effort level. Providers include Anthropic, OpenAI and Kimi. Free Mode always uses Auto (https://docs.replit.com/chat/auto-mode.md). Free Mode runs on OpenAI **GPT-5.6 Luna** (https://fortune.com/2026/08/19/exclusive-replit-taps-openais-low-cost-luna-model-for-new-free-mode-subscription-tier/).
- **Steer vs Queue:** a follow-up sent mid-turn either steers the active turn (the default) or queues. The **Message Queue** drawer above the input supports "Steer now", edit, delete and drag to reorder. Cmd/Ctrl+Enter overrides the default for one message. **Stop** sits in the status bar (https://docs.replit.com/features/agent/steer-and-queue-messages).
- **Clarifying questions:** the Agent asks questions. Since Jul 10, 2026, any editor in a shared app can answer routine Agent questions. A **Smart Connector Picker** shows provider options inline when several fit, e.g. Stripe vs Square (Jul 17, 2026).
- **Context tools:** **Memories** (Settings → Customization → Memory), **Custom Instructions** at workspace level, **Skills** (reusable procedures, importable from GitHub, with access levels Required / Available / No access), and `replit.md` for persistent project rules (https://docs.replit.com/chat/memories-custom-instructions-and-skills.md, https://docs.replit.com/learn/foundations/context-management.md).
- **Progress display:** progress indicators, real-time file changes, a preview that updates as work lands, a summary when finished, and **inline charts** for data questions (Aug 14, 2026) (https://docs.replit.com/learn/build-with-agent.md).
- **Cost display:** each checkpoint's cost appears by hovering the usage icon in the Agent tab, e.g. "Agent implemented feature X for $0.18". The Usage page updates within about 30 minutes (https://docs.replit.com/billing/ai-billing).

### 3.4 Parallel tasks and task board (Agent 4)
- Create a task with the **+** next to the project name or **New task** on the board. The Agent proposes a plan, and you choose **Accept tasks** / **Start building** or **Revise plan**. Tasks run in isolated copies (https://docs.replit.com/learn/build-in-parallel.md).
- **Board columns:** Drafts, Active, Ready, Done. Blocked tasks name their prerequisites, and dependencies are detected automatically, e.g. a dashboard waits for its schema.
- **Concurrency by plan:** Core 1, Pro 10, Enterprise 64 (https://docs.replit.com/core-concepts/agent/task-system.md).
- A finished task shows a work log, test results and a live preview. You then **Apply changes to main version** or dismiss it. When tasks touch the same files, the card reads **Resolving conflicts**.
- Background tasks wait for your review by default, and auto-apply is optional. **Archive** keeps a planning session, while **Cancel** kills a running task with no recovery.
- **Task sidebar** (pinnable) has **Main**, **Board** and **New task** entries, a task list with hover cards, and "Apply changes" cards (Jul 17, 2026).
- Replit's own advice is "Never batch-approve. Three unreviewed features applied at once means three suspects when something looks wrong."

### 3.5 Live preview, visual editing and design
- **Preview pane** has a location bar with the `{...}.replit.dev` dev URL and a path field. On the right of that bar: a screen-size preset selector, a **Devtools** toggle (Console, Elements, Network, Resources, Settings) and a new-tab button (https://docs.replit.com/features/editor/preview).
- **Mobile preview:** a dropdown switches between **iOS / Android / Web** simulators, and you can test on a phone through a QR code and Expo Go (https://docs.replit.com/build/mobile-first-app.md).
- **Visual Editor:** pick the **Edit** tool and click any element in a frame or in the Preview. The element gets a highlight and a name chip, and a Visual Editor panel opens **on the right**. It edits text, font, color (picker, hex, name or eyedropper), images (URL or upload) and layout: a 3×3 alignment grid, row/column direction, gap and per-side padding/margin with lock toggles. "Simple, deterministic edits … don't consume AI credits". Anything complex is handed to the Agent automatically (https://docs.replit.com/design/visual-editor.md).
- **Design Canvas / Replit Design:** an infinite pan-and-zoom surface of **frames**, one frame per design direction.
  - A floating toolbar at the bottom offers **Chat, Draw, Edit, Generate**, plus a library panel.
  - Each frame has an action bar: **Edit, Chat, Focus, Copy, Duplicate, Delete**.
  - Press `/` for cursor chat. Selecting frames attaches them to chat as snapshots.
  - **Explore** gives one-click suggestions and lets you "explore with different models": Claude, GPT-5, Gemini, Kimi, GLM.
  - **Refine** works through chat, the Visual Editor, drawing, or generating images, video and vectors.
  - **Build…** on a frame turns it into a working app. This needs Core or Pro.
  - The **header toggle Design | Build** switches between canvas and running app.
  - Sources: https://docs.replit.com/design/canvas.md, https://docs.replit.com/design/design-vs-build.md, https://replit.com/blog/introducing-replit-design.
- Agent 4 canvas controls also cover multi-select, hover/active states, responsive overrides per breakpoint, interactions, undo and "generate variants" (https://replit.com/agent4).
- **Design systems:** create one or extract it from a design, stored as **DESIGN.md**, then apply it to projects (https://docs.replit.com/design/design-md.md).
- **Imports into Design:** Figma, Claude designs, a website URL, or a screenshot (https://docs.replit.com/design/import-a-website-into-replit-design.md).
- **Excalidraw** diagrams inside projects (Jul 10, 2026).

### 3.6 Code, editor, file tree and terminal (developer layer)
- File tree (folder icon on the left), a Tools dock with an "All tools" search (Cmd+K), the **Run** button (runs the selected Workflow), a Search bar, a **Resources** panel (RAM/CPU/storage), and an Options menu to arrange windows, panes and tabs (https://docs.replit.com/category/workspace-features).
- **Shell** is an interactive Linux terminal. **Console** shows app output. **File History** keeps character-level history for 30 days (https://docs.replit.com/learn/projects-and-artifacts/version-control.md).
- **Workflows** are named run configs. They run sequentially or in parallel, with task types Execute Shell Command, Install Packages and Run Workflow (https://docs.replit.com/features/workspace-tools/workflows).
- **SSH** from VS Code, Cursor or Windsurf on paid plans (https://docs.replit.com/replit-workspace/ssh). There is also a native **desktop app**, redesigned Jul 3, 2026, with a multi-app workspace, Agent notifications and tab previews.
- **Multiplayer** real-time editing, like Google Docs for code (https://docs.replit.com/build/invite-teammates.md).
- **General Agent** works in any language (Sept 2025), and the environment is NixOS.

### 3.7 Backend: database, end-user auth, storage and secrets
- **Database:** managed PostgreSQL provisioned by the Agent, Neon-backed per the docs example. It has **separate Development and Production** databases, and Prod credentials are wired into the deployment automatically (https://docs.replit.com/build/add-database.md). This separation followed the July 2025 SaaStr production-DB deletion (https://www.theregister.com/2025/07/22/replit_saastr_response/).
  - Restore windows: 7 days on Core, 28 days on Pro.
  - **Scheduled daily backups** with a "Keep backups for" retention setting (Sept 4, 2026).
  - Production DB credentials can be regenerated with automatic redeploy (Aug 7, 2026).
  - Databricks **Lakebase** managed Postgres (Sept 11, 2026).
  - A Database tool lives in the Tools pane. A table browser or SQL runner UI is unverified for 2026.
- **End-user auth** comes in two options, both "provisioned by Agent — no separate dashboard signup, no copy-pasting of OAuth keys" (https://docs.replit.com/learn/projects-and-artifacts/auth.md):
  - **Replit Auth** (May 2025) is zero-config, uses Replit accounts and shows a Replit-branded login page. Its Auth pane supports Google, GitHub, X, Apple and Email, with customisable name and logo (docs page and 3rd-party summary).
  - **Clerk Auth** gives each app its own Clerk tenant, branded screens, and separate Dev and Prod. Enterprise SSO (Okta, Entra ID via OIDC/SAML) arrived Aug 7, 2026, and Agent-assisted migration from Replit Auth to Clerk that keeps user data arrived Aug 14, 2026.
  - The **Users and Auth** tool sits in the Tools pane.
- **App Storage:** object storage on GCS, "buckets, files", used through the Replit App Storage SDK (Aug 2025) (https://docs.replit.com/learn/projects-and-artifacts/storage-and-databases.md).
- **Secrets:** App Secrets and Account Secrets (reusable across projects), AES-256 at rest, bulk edit in JSON or .env. **Production app secrets** are set separately in Publishing, which is a common failure point (https://docs.replit.com/core-concepts/project-editor/app-setup/secrets, https://docs.replit.com/build/troubleshooting.md).
- **Scheduled jobs:** Scheduled Deployments and Routines.

### 3.8 AI inside generated apps, and agent building
- **Replit AI Integrations:** apps call OpenAI, Anthropic, Gemini and OpenRouter models with **no API keys**, billed at public API prices to Replit credits and broken down per app. Requires a paid plan (https://docs.replit.com/features/integrations/replit-ai-integrations).
- **Agent Services:** paid APIs the Agent handles for you, such as ElevenLabs, Brave Search and Gemini image generation, deducted from credits (https://docs.replit.com/chat/connectors.md).
- **Agents & Automations** (Agent 3, Sept 2025, beta): pick "Agents & Automations" as the app type, then choose a trigger (**Slack, Telegram or Timed Automation**). A testing pane simulates it, and it must be deployed before live triggers work. Examples include a Slack bot answering questions about a GitHub codebase and a Telegram bot booking Outlook appointments (https://replit.com/blog/introducing-agent-3-our-most-autonomous-agent-yet, https://www.youtube.com/watch?v=sQFQticAbzE). In 2026 the Projects filter still lists "Agent & Automation" (https://docs.replit.com/home/projects.md), but the docs URL now redirects to **Routines**.
- **Routines** (Aug 2026): scheduled recurring work (hourly, daily or weekly, with a 1-hour minimum) created from a Chat. Setup asks clarifying questions, then you review the instructions and a **per-run budget** before confirming. Runs use deterministic code by default and call Agent reasoning only when needed. Results come back into the same thread. Routines need Power or Max; Core allows 5 active and Pro 10 (https://docs.replit.com/chat/routines.md).
- **Framework choice for agents:** there is no dedicated LangGraph, CrewAI or OpenAI Agents SDK builder. You rely on "General" any-framework mode (inferred from the absence of docs). There is no agent trace or eval viewer either (unverified).

### 3.9 Integrations, connectors, MCP and APIs
- **Four integration types:** Replit-managed (DB, Auth, App Storage, Domains); **Connectors** (first-party OAuth, "sign in once" and reuse across apps); External integrations (your API keys); Agent Services (https://docs.replit.com/chat/connectors.md).
- Connector categories include Google Workspace, M365, GitHub/GitLab/Bitbucket, Linear, Jira, Slack, Discord, Twilio, Salesforce, HubSpot, Stripe, Square, Shopify, Plaid, RevenueCat, BigQuery, Snowflake, Databricks, Segment, Amplitude, Notion, Airtable, OpenAI and ElevenLabs.
- The **Integrations catalog** reached **450+ integrations** in one browsable UI (Jun 26, 2026) and lives in the Workspace sidebar under **Integrations** (https://replit.com/integrations).
- **Custom API connectors (beta, Sept 18, 2026):** add an endpoint, add auth, and "describe how Agent should use it". Enterprise can set **custom OAuth** (Client ID, Secret, scopes) (Aug 28, 2026).
- **MCP works both ways:** Replit can use curated or custom MCP servers such as Supabase, Statsig, Calendly, Braintrust, Apollo and Black Forest Labs. Replit is also a **native MCP server**, so ChatGPT, Claude, Slack or any MCP client can "create, find, inspect, update, and publish apps" (Aug 14 and Sept 11, 2026) (https://docs.replit.com/chat/connect-through-mcp.md). There is also a Claude connector (Jun 19, 2026), a ChatGPT app (Dec 2025) and a Slackbot (Jun 2026).
- **Payments:** Stripe (integrated for Core since Nov 2025), RevenueCat for mobile, and **Whop**. For Whop, the Agent creates the account and builds checkout with no keys (Jul 3, 2026).
- **Growth Skills** (Aug 28, 2026) help you find your first customers through Apollo, Clay, SideShift, RevenueCat, Stripe and PostHog.

### 3.10 GitHub and version control
- The **Git pane** (Tools → Git) has initialise, "Connect to a Git provider" / Connect to GitHub, a review-changes diff, a commit message box with staging, a branch dropdown (create, switch, publish), and Push / Pull / Sync. The Shell and the pane stay in sync, and AI suggests commit messages (https://docs.replit.com/features/workspace-tools/git-interface).
- Sync is **manual**: "Replit does not auto-sync — you explicitly pull before working and push when ready" (third-party guide). One review reports 30–60s sync delays and merge conflicts (https://hackceleration.com/replit-review).
- Enterprise **source-control policies**: "Require Git Remote" (you must push before publishing) and private-remote enforcement (https://docs.replit.com/teams/enterprise-privacy-settings.md).
- Providers: GitHub, GitLab and Bitbucket (Nov 2025).

### 3.11 Importing existing projects
- Enter through **replit.com/import** or the prompt-box plus menu → **Import an existing project** (https://docs.replit.com/chat/import-a-project.md).
- Sources: **GitHub** (public quick import via `replit.com/github.com/<owner>/<repo>`, or guided import for private repos), Bitbucket, **Vercel, Bolt, Lovable, Base44** (these go through GitHub export first), **Figma**, **Claude designs**, **ZIP** (≤200 MB, leave out node_modules), **spreadsheets**, a previous Agent export, or an empty project.
- During import the "Agent prepares the environment, installs dependencies, and configures run commands". Afterwards you fix secrets and Workflows yourself (https://docs.replit.com/build/import-from-providers.md).
- Figma to app: connect Figma, paste the file or frame links, state the project type, and the Agent extracts layout, type, colors, spacing and breakpoints into an editable app (https://docs.replit.com/use-cases/import-figma-design.md).

### 3.12 Publishing, hosting, domains and environments
- **Publish button** in the upper-right of the Project Editor, a "Publish your app" banner in the dev preview, or just ask the Agent (https://docs.replit.com/build/publish-your-app.md).
- **Dialog, step by step:**
  1. Pick a `.replit.app` subdomain.
  2. Pick access: **Public / Password protected / Workspace only / Invite only**.
  3. Optionally add a feedback widget.
  4. Click **Review security**, then **Publish**.
  5. Replit provisions resources, runs security checks, builds and promotes. You then see the status and the URL.
- **Deployment types:** Autoscale, Static, Reserved VM, Scheduled. Replit "automatically selects the best publishing option" (https://docs.replit.com/learn/projects-and-artifacts/replit-deployments.md).
- Updates need a manual **Republish**. The dev app and the live app are separate copies, and the filesystem resets on each publish.
- The **Publishing pane** has status, access and resources, plus a **Logs** tab. The health check fails if the homepage takes longer than 5s to respond, and the server must listen on 0.0.0.0 (https://docs.replit.com/build/troubleshooting.md).
- **Custom domains:** in Publishing settings, add the domain, create the A and TXT records, and wait for "Verified". HTTPS is automatic (https://docs.replit.com/build/add-custom-domain.md). You can **buy domains inside Replit** (2025, expanded Jul 10, 2026).
- Hosting runs in the US on GCP, with an EU option for Enterprise and region choice for Pro workspaces since Aug 2026.
- **Mobile:** Expo builds go Replit → TestFlight → App Store in a guided flow, with no Mac or Xcode needed. There are guides for app icons, store screenshots, push notifications, haptics, the camera and RevenueCat (https://replit.com/blog/building-mobile-apps-on-replit, https://docs.replit.com/build/mobile-upload-ios.md).

### 3.13 Versions, history, checkpoints and rollback
- **Checkpoints** are created automatically at logical milestones. They capture **code + AI context/memory + database state** (https://docs.replit.com/learn/projects-and-artifacts/version-control.md).
- The **History** panel shows labelled checkpoints, e.g. "Transitioned from Plan to Build mode", each with **Rollback here** and **Changes**. Rollback opens a confirmation dialog listing what will be affected: files, Agent memory, tasks, and optionally the DB (https://docs.replit.com/learn/build-with-agent.md).
- Each checkpoint is also the billing unit under effort-based pricing.

### 3.14 Debugging, testing and quality
- **App Testing** runs a live browser inside the Agent pane with a visible cursor. You get an **interactive video replay** broken into sections afterwards, and can **take over** at hurdles such as login. It lives in Advanced settings, runs only in Power or Max, and supports only Full-Stack JS and Streamlit (https://docs.replit.com/replitai/app-testing).
- Build errors are auto-fixed and retested (https://www.developersdigest.tech/blog/replit-agent-4-design-to-app). Preview devtools and the Console are there for manual debugging.

### 3.15 Security
- **Security scan levels:** L1 dependency checks plus static analysis (free); L2 a deep white-box agent scan; **L3 a black-box pen test** run in parallel with the white-box scan against a private copy, with confirmed findings sent to the Agent to fix (Aug 17, 2026) (https://replit.com/blog/black-box-pen-tests).
- **Security Center 2.0** (May 7, 2026): critical and high CVEs, a table grouped by project, bulk notify or unpublish, **Fix with Agent**, and background rescans every few hours plus on each new CVE. SBOMs are Enterprise-only (https://replit.com/blog/security-center).
- Other protections: the Agent checks changed files for risky patterns and hardcoded secrets (Aug 7, 2026); a **Package Firewall** blocks malicious dependencies (Jun 12, 2026); a pre-publish **Review security** step; SOC 2 Type II (Aug 2025).

### 3.16 Analytics, monitoring and logs
- The **Growth** pane holds **Project Analytics**: visitors, pages, sources, geo, browser and device, over 30 days. You turn on "Enable analytics" and republish. The Agent can add custom events and funnels (Sept 4, 2026).
- The **Monitoring** pane shows requests, response times and infra. Production alert emails can be controlled (Jun 12, 2026).
- The **Usage** page can be filtered by date, resource, project, workspace, group and member, and exported to CSV. Audit logs have 65+ new event types (Sept 18, 2026) and can stream to a SIEM (https://docs.replit.com/teams/observability.md).

### 3.17 Collaboration, teams and sharing
- Use **Invite** or share a link. Each teammate keeps their own Agent threads while sharing the Kanban. The old fork-and-merge model was removed in Agent 4 (https://replit.com/blog/whats-changed-agent3-to-agent4).
- Limits: Core has 5 collaborators and 1 background task. Pro has 15 builders, 50 viewers and 10 tasks (https://replit.com/pricing).
- Project transfers between workspaces (Aug 7, 2026). Enterprise guest access without SSO (Jun 19, 2026). Viewer seats. Shared workspace Skills.
- **Projects page:** cards show artifact icons with hover previews. It is sorted by "last opened by you" and can be filtered by build type: Web, Mobile, Data, Slides, Design, 3D Game, Agent & Automation. Pins are private to you (https://docs.replit.com/home/projects.md).

### 3.18 Mobile and desktop apps
- The **Replit mobile app** (refreshed Jul 24, 2026) lets you swipe between Agent, tasks and Preview, build by voice, and follow progress through notifications and iOS Live Activities.
- The **desktop app** (Jul 3, 2026) supports several apps open at once.

---

## 4. UI layout (main screens)

> Sources: Replit docs text plus tutorial write-ups. I could not see live screenshots, so positions marked (inferred) come from the docs' wording.

**4.1 Workspace home / dashboard**
- **Left sidebar, top:** the **Workspace selector** dropdown, which switches between Personal and Team workspaces.
- **Left sidebar, items:** **New**, **Search**, **Projects**, **Routines**, **Library**, **Integrations**, **Security**, then Settings and Usage (https://docs.replit.com/features/collaboration/workspaces, https://docs.replit.com/chat/conversations.md). Chat threads are listed in the left sidebar (https://docs.replit.com/chat/overview.md).
- **Main area:** a large chat prompt with **suggested prompts**, and recent projects / Chats / Routines beneath or beside it. The docs say the prompt box sits "prominently at the bottom of the home screen" in the chat view (https://docs.replit.com/home/understand-your-workspace.md). The marketing homepage centres the prompt under "What will you build?" with artifact chips.
- **Prompt box anatomy:** textarea; **+** menu (upload, create, import, skill/design system, integration); a mode selector below it (Free / Power / Max, and Agent settings with Auto, model, Effort and Advanced); a **Plan** toggle at the bottom right; a voice button; Start/send.

**4.2 Project Editor (builder)**
- **Header:** project name with a **+** (new task) next to it; a **Design | Build** toggle; **Invite**; **Publish** at the upper right (https://docs.replit.com/design/canvas.md, https://docs.replit.com/build/publish-your-app.md). An artifact switcher for multi-artifact projects is (inferred).
- **Task sidebar (pinnable, left side, inferred):** **Main** (the main thread), **Board**, **New task**, a list of tasks with status, hover cards, and "Apply changes" cards.
- **Main split:** "your conversation with Agent on one side, and a live preview of your app on the other" (https://docs.replit.com/learn/projects-and-artifacts/project-editor.md). Through 2024–25 the chat was on the left and the preview on the right. That this is still true in Agent 4 is (inferred).
  - Chat column: threads, the plan card, progress, the checkpoint **History** panel, the **Message Queue** drawer above the input, and **Stop** in the status bar.
  - Preview: a URL bar with the `.replit.dev` URL, a device-size selector, Devtools and new-tab buttons. For mobile it shows the iOS / Android / Web dropdown and a QR code.
- **Board view:** a full-width Kanban (Drafts / Active / Ready / Done) with task cards. Ready cards show the log, tests, a preview and **Apply changes to main version**.
- **Tools pane (pinned, since Jul 17, 2026):** a **Replit Cloud** section with Publishing, Domains, Monitoring, Growth, Database, Users and Auth, Security Center, App Storage. A separate developer tools dock holds Shell, Console, Git, Secrets, Workflows, Files and Resources, and opens via "All tools" or Cmd+K. Tools open as tabs or panes you can split and rearrange (https://docs.replit.com/category/workspace-features).
- **Design canvas view:** an infinite canvas of frames; a floating toolbar at the bottom (Chat / Draw / Edit / Generate); a library panel; per-frame action bars; the Visual Editor properties panel on the **right** when an element is selected.

**4.3 Settings and account**
- Settings → Usage shows Free Mode allowance and reset times. Settings → Personalization → Agent holds the steer/queue default. Settings → Customization → Memory. Account → Billing holds alerts and hard caps. Settings → Advanced → Identity & Governance holds audit logs, and there is a Developer tab for the Admin API (https://docs.replit.com/billing/ai-billing, https://docs.replit.com/teams/observability.md).

**4.4 Visual design language (inferred / unverified)**
- The brand uses Replit orange (the logo "⠕" mark) on neutral dark or light surfaces.
- The IDE is dense, tabbed and developer-styled. Reviewers note it is "an interface designed for developers, not first-time builders" (G2 summary) and that tabs get messy past 8 or more open files (https://hackceleration.com/replit-review).
- The newer Agent 4 surfaces (canvas, board, chat home) look closer to Figma, Linear or Trello. Peter Yang: "the canvas could use a bit more polish" (https://creatoreconomy.so/p/replit-agent-4-is-here-plan-design-build-tutorial).

---

## 5. Step-by-step user flows

**5.1 Sign-up → first app (non-technical happy path)**
1. On replit.com, the page shows "What will you build?". Click "Start for free" or "Try Free Mode". Sign up with Google, GitHub, X or email, then verify your email (third-party).
2. Answer the onboarding questions (name; personal, school or work). You land on Workspace home with a chat prompt and suggested prompts.
3. Pick an artifact chip such as **Website** and choose a mode (Free by default for trials). Optionally turn on **Plan**, then type the idea (https://docs.replit.com/build/your-first-app).
4. With Plan on, you see a "task plan is ready for review" banner and **Review now**. The plan shows What and Why / Done looks like / Out of scope / steps. Choose **Build here**, **Build in background**, **Revise** or **Cancel**.
5. **While it builds:** progress indicators, files changing live, the Preview updating. In Power or Max with App Testing on, a live browser with a moving cursor tests the app, and a video replay is available afterwards. First builds dropped from 15–20 min to **3–5 min** in Dec 2025 (https://replit.com/blog/2025-replit-in-review). Mobile builds take about 7–10 min (https://www.vktr.com/ai-news/replit-launches-mobile-app-builder-with-direct-app-store-path/).
6. **Done:** a summary of changes, a checkpoint, and its cost on hover. The Preview is running on a `.replit.dev` URL.
7. **Iterate:** click elements with the Visual Editor for free text, color and spacing changes; write follow-up prompts; steer mid-turn; open the Design canvas to explore variants and **Build…** one.
8. **Fix errors:** the Agent auto-detects build errors, fixes and retests. If a change goes badly, open **History → Rollback here**. A confirmation lists files, memory, tasks and optionally DB changes.

**5.2 Add a database and auth**
1. Prompt, for example "persist cars and reservations". The Agent provisions Postgres with separate Dev and Prod databases, migrates the data and wires in Prod credentials (https://docs.replit.com/build/add-database.md).
2. Prompt "Add sign-in … Use Clerk Auth" or "Use Replit Auth". The Agent provisions a tenant, gates routes, and adds sign-out and a "My bookings" area (https://docs.replit.com/build/add-login.md). Check it with two test accounts.
3. Manage everything under Tools → Database / Users and Auth / App Storage / Secrets.

**5.3 Connect GitHub**
1. Tools → **Git** → Connect to GitHub (OAuth) → create a new repo or link an existing one (https://docs.replit.com/features/workspace-tools/git-interface).
2. Review changes, stage, commit (AI can suggest the message), then push, pull or sync. Branches are handled from the dropdown. None of this is automatic.

**5.4 Publish → custom domain**
1. Click **Publish** (upper right) → edit the subdomain → choose access level → feedback widget (optional) → **Review security** → **Publish** (https://docs.replit.com/build/publish-your-app.md).
2. Replit provisions, scans, builds and promotes, then shows status and the live URL. Add payment details if prompted, and add Production secrets in Publishing.
3. For later changes, test in Preview and then **Republish**.
4. For a domain: Publishing settings → add domain → set the A and TXT records at your registrar → wait for "Verified" → HTTPS is automatic. Or buy the domain inside Replit (https://docs.replit.com/build/add-custom-domain.md, https://docs.replit.com/build/domain-purchasing.md).
5. After launch: Growth (analytics), Monitoring, Security Center (L1–L3 scans, Fix with Agent).

**5.5 Import an existing project (developer path)**
1. Go to replit.com/import, or use the + menu → **Import an existing project** → choose a source (GitHub, Bitbucket, Vercel, Bolt, Lovable, Base44, Figma, Claude, ZIP, spreadsheet) (https://docs.replit.com/build/import-from-providers.md).
2. Authenticate, pick the repo or files, add secrets, confirm. The Agent sets up the environment, installs dependencies and configures run commands (Workflows).
3. Keep going with the Agent. The old guidance was Medium autonomy for imports; in 2026 you pick Power or Max. Fix leftover secrets and provider-specific services by hand.

**5.6 Build an agent or automation**
- **2025 path (Agent 3):** Home → app type **Agents & Automations** → trigger selector (Slack / Telegram / Timed Automation) → prompt → the Agent builds code, integrations and deploy config → test in the testing pane → **deploy**, which live triggers require (https://docs.replit.com/replitai/agents-and-automations, which now redirects).
- **2026 path (Routines):** New Chat in Power or Max → describe the recurring job → answer clarifying questions (schedule, scope) → review instructions and the **per-run budget** → confirm. Runs post results back into the thread, and the Routines sidebar page shows schedules, run history and budgets (https://docs.replit.com/chat/routines.md).

**5.7 Collaboration flow**
1. Click **Invite** or share the project link. Teammates join with their own Agent threads (https://docs.replit.com/build/invite-teammates.md).
2. Everyone adds tasks to the shared board. Tasks run in isolated copies, and any editor can answer the Agent's routine questions.
3. Review Ready cards and apply them one at a time. The Agent resolves conflicts ("Resolving conflicts"), and you verify the main version afterwards.

**5.8 Design-first flow (designers and PMs)**
1. Choose the Design chip → prompt, template, Figma, URL or screenshot import. Frames appear on the canvas (https://docs.replit.com/design/what-is-replit-design.md).
2. Explore (suggestions, other models) → Refine (chat, Edit tool, draw, generate assets) → optionally extract a design system (DESIGN.md).
3. Choose **Build…** on the chosen frame. The Agent adds data, auth and integrations while keeping the design. Then publish.

**5.9 Mobile flow**
Choose **Mobile app** → prompt → iOS / Android / Web simulator in the preview → test on a phone through QR / Expo Go → set up an Apple Developer account → upload to App Store Connect → TestFlight → submit. All steps are guided by the docs (https://docs.replit.com/build/mobile-first-app.md).

---

## 6. UX strengths and pain points

### Strengths (what users love)
- **Zero setup, everything built in.** "Code in browser within 60 seconds". Integrated deployment and databases (https://hackceleration.com/replit-review). G2 4.5/5 (357 reviews) and Capterra 4.4/5 praise speed from prompt to working app (https://www.g2.com/products/replit/reviews?qs=pros-and-cons, https://www.capterra.com/p/10011212/Replit/reviews/).
- **Real backend depth.** Replit wins when you need custom backends, cron jobs or 24/7 services (https://zapier.com/blog/lovable-vs-bolt/).
- **The planning card is well liked.** Gusto: "ability to take a one-shot prompt and flesh out requirements before a full build is unmatched" (https://replit.com/blog/introducing-agent-4-built-for-creativity).
- **Design in the same project as the build.** The canvas "is a layer on top of your running app" (https://www.developersdigest.tech/blog/replit-agent-4-design-to-app). Reviewers compare it favourably to Figma-style tools.
- **Enterprises value multi-user vibe coding on a Kanban.** SMFL: "Multi-user vibe coding via the kanban is a significant milestone for enterprises."
- **Self-testing with video replay** builds trust, and the take-over option handles logins.
- **Free visual edits** mean small changes do not burn credits.
- **Rollback covers code, DB and memory**, so non-developers can undo without knowing Git.
- **Free Mode (Aug 2026)** removed much of the cost anxiety for everyday work. An early-access quote: "I was trying to find the outer limits of Free Mode. I haven't yet." (https://replit.com/blog/replit-introduces-free-mode).

### Pain points (with evidence)
- **Credit burn and bill shock under effort-based pricing.**
  - After Agent 3, one user spent "$1k this week alone" against a usual $180–200 a month. Another burned "$70 in a night". Another was charged "$20 on one prompt" (https://www.theregister.com/2025/09/18/replit_agent3_pricing/).
  - Other reports: $1,982 in 24 days on a pre-launch app, and projects "up to 4x higher" in cost (https://www.softr.io/blog/replit-pricing).
  - Trustpilot is **2.8/5 (1,549 reviews, 33% one-star)**, and billing is the top complaint (https://www.trustpilot.com/review/replit.com).
  - Cost appears **after** the fact (hover per checkpoint), not before. Charges are non-refundable even when the agent fails (https://axonbuild.com/blog/fix-a-replit-app-that-keeps-breaking/).
- **Fix loops, and the agent breaking working features.** Examples: "The replit agent says it has fixed the issue but we're on build 8", and the agent "breaks previously working features during more complex development tasks" (Trustpilot). Capterra reviewers mention "fix loops that burn through credits".
- **Destructive autonomy.** In July 2025 the Agent deleted SaaStr's production DB during a code freeze and fabricated data. The CEO called it "Unacceptable and should never be possible" (https://www.theregister.com/2025/07/21/replit_saastr_vibe_coding_incident/, https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure/). Replit then introduced dev/prod DB separation.
- **The dev preview and the live app drift apart.**
  - Publishing is a separate copy that needs Republish.
  - Production secrets must be entered again.
  - The filesystem resets on publish.
  - The health check times out after 5s.
  - The server must bind to 0.0.0.0.
  - Sources: https://docs.replit.com/build/troubleshooting.md, https://axonbuild.com/blog/fix-a-replit-app-that-keeps-breaking/.
- **Reliability at launch.** Within two days of Agent 4's release, forum reports described tasks "falling away without being committed", tasks stuck in "active" and blocking the queue, blank previews and freezes (https://stackbuiltai.com/replit-agent-4-review-2026/).
- **Weak context between sessions.** "Almost zero context between agent sessions", which leads to contradictory decisions (StackBuilt). Replit's answer is Memories, Skills and replit.md.
- **Mode and pricing churn.** Mode names changed about 5 times in 12 months (Fast → Lite → Economy/Power/Turbo → Lite/Economy/Power → Free/Power/Max), which is confusing and erodes trust. Different sources also disagree on details: Core annual price ($18/mo vs $204/yr), Pro rollover (1 vs 2 months), and Core credits ($20 vs $25 in reviews).
- **Complexity for beginners.** An "interface designed for developers, not first-time builders" (G2 summary), with messy tab management.
- **Lock-in.** Replit Secrets, the DB, `.replit` run commands, ports and paths break when you move to Vercel or Railway. ZIP export loses history (https://www.brilworks.com/blog/how-to-migrate-from-replit/).
- **Limits and paywalls.** App Testing works only on Full-Stack JS and Streamlit. Parallelism really starts at Pro ($100), since Core gets 1 task. Git has no auto-sync or CI/CD, and there are no Datadog or New Relic hooks (Hackceleration).
- **Support.** Email support is slow (about 18h), and there is no live chat below Enterprise (Hackceleration). Trustpilot has "over a week to respond" complaints.

---

## 7. Recent notable launches (2025 → Sept 2026)

| Date | Launch |
|---|---|
| Feb 2025 | Agent v2 (Claude 3.7 Sonnet); first 10 checkpoints free; React Native/Expo; one-click deploy |
| Mar 2025 | Visual Editor for the JS stack |
| May 2025 | **Replit Auth**; Claude Sonnet 4; security scans; Stripe/PayPal/Notion integrations; SCIM |
| Jun 2025 | Figma import (replit.com/import) |
| Jul 2025 | **Effort-based pricing** (replacing $0.25 per checkpoint); web search; replit.md custom instructions; domain purchasing; Agent queue. SaaStr DB incident, followed by dev/prod DB split |
| Aug 2025 | App Storage; image generation; SOC 2 Type II; app themes |
| Sep 2, 2025 | Agent on any framework ("General") |
| Sep 10, 2025 | **Agent 3**: App Testing, 200-min Max autonomy, Agents & Automations; Autonomy Level control |
| Oct 2025 | Connectors platform (24+ at launch); Vercel import; warehouse connectors; dependency vulnerability scanning |
| Nov 2025 | **Design Mode** (Gemini 3 Pro); AI Integrations; GitLab/Bitbucket; Opus/Sonnet 4.5 |
| Dec 2025 | Free-tier revamp; **Fast Build**; full-stack mobile apps; new DB GA; custom MCP servers; Enterprise Security Center; ChatGPT app. First build 15–20 min → 3–5 min |
| Feb 24, 2026 | **Replit Pro** ($100); Core cut from $25 to $20; Economy/Power/Turbo; Teams sunset |
| Mar 11, 2026 | **Agent 4**: infinite canvas, parallel tasks and Kanban, multi-artifact; $400M at a $9B valuation |
| May 7, 2026 | Security Center 2.0 (Fix with Agent, continuous CVE scanning) |
| Jun 2026 | Workspace custom instructions and skills; Package Firewall; Claude connector; Voice Mode; 450+ integration catalog; Slackbot |
| Jul 2026 | Desktop app redesign; Whop payments; in-app domain purchasing; Excalidraw; **Tools pane**; smart connector picker; mobile app refresh; cloud price cuts; **Replit Design** (Jul 29) |
| Aug 2026 | Changed-file security scanning; Clerk enterprise SSO; region selection; **native MCP server**; inline charts; Admin API; **black-box pen tests** (L3); **Free Mode** (GPT-5.6 Luna, Aug 18–19); Chats; **Routines**; Agent steering; **Auto model routing**; Growth Skills; custom OAuth |
| Sep 2026 | Scheduled DB backups; **Project Analytics**; desktop MCP clients; Databricks Lakebase Postgres; Compliance API; **custom API connectors** (beta); 65+ audit log events |

Sources: https://replit.com/blog/2025-replit-in-review, https://releasebot.io/updates/replit, https://docs.replit.com/updates.

---

## 8. Ideas for Architect 2.0

**ADOPT**
- ADOPT: A plan card with **What & Why / Done looks like / Out of scope / Steps** and exactly four actions (Revise, Cancel, Build here, Build in background). It gives non-developers a contract and gives developers a spec.
- ADOPT: **Checkpoints that restore code, DB and agent memory together**, with a confirmation dialog that lists exactly what will be reverted, each with "Rollback here" and "View changes".
- ADOPT: **Zero-credit deterministic visual edits** (text, color, spacing, image), with automatic hand-off to the agent when an edit is complex. Show a "Free edit" badge so users learn the rule.
- ADOPT: A **Tools pane that groups "Cloud" resources** (Publishing, Domains, Monitoring, Growth/Analytics, Database, Users & Auth, Security, Storage, Secrets). One predictable home for "the backend" serves both audiences.
- ADOPT: **Dev/prod separation by default**: separate databases, separate secrets, and an explicit "promote to production" step. Never let the agent touch prod data.
- ADOPT: A **publish dialog with access levels** (Public / Password / Team-only / Invite-only) plus a **Review security** gate before go-live.
- ADOPT: **Steer vs Queue** for mid-run messages, with a visible queue drawer and a one-keystroke override. Keep a Stop button always visible in a status bar.
- ADOPT: **Importers from competitors** (Lovable, Bolt, v0/Vercel, Base44, Replit) plus GitHub, Figma, ZIP, screenshot/URL and spreadsheet → app. The "switch to us" path is a growth lever.
- ADOPT: **Browser self-testing with video replay and a take-over option**, shown as a test report card attached to each checkpoint.
- ADOPT: **Connectors you sign into once and reuse across all apps**, with a **smart provider picker** inline in chat when several providers fit (Stripe vs Razorpay, SendGrid vs Resend).
- ADOPT: **Architect as an MCP server**, so users can create, inspect and publish apps from Claude, ChatGPT, Cursor or Slack.

**IMPROVE**
- IMPROVE: **Cost before, during and after.** Show an estimated cost range on the plan card before running, a live meter while running, and a per-task hard cap ("stop at ₹X / $Y"). Refund or discount credits when the agent's own error forced a redo. Replit only shows cost afterwards on hover, and this is its #1 complaint.
- IMPROVE: **One product, two depths.** Use a "Simple ⇄ Developer" view toggle rather than Replit's IDE-first density. Simple view shows Chat, Preview and Publish. Developer view reveals the file tree, terminal, diff, Git, env and logs. The chosen view persists per user and is set by an onboarding question.
- IMPROVE: **Git as a first-class, automatic citizen.** Auto-commit each checkpoint, give each background task its own branch and open a PR per task, keep two-way sync with GitHub, and show CI status. Replit's Git is manual push/pull.
- IMPROVE: **Make preview-to-live drift visible.** Show a persistent "3 changes not live · Publish" badge, a diff of dev vs prod (code, schema, secrets), and warn before publishing about missing prod secrets or a failing health check.
- IMPROVE: **A real agent builder.** Replit's agent story moved from an "Agents & Automations" app type to Routines in Chats. Architect can offer a dedicated **Agent studio**: pick a framework (LangGraph, CrewAI, OpenAI Agents SDK, Mastra, Vercel AI SDK, or "any"), triggers (chat, webhook, Slack, cron, email), a tools/MCP list, memory, a **trace viewer** and an **eval runner**. Add a per-run budget, as in Routines.
- IMPROVE: **Stable, human mode names** tied to outcomes, such as "Quick edit / Build / Deep work", with the model router hidden behind them. Do not rename them every quarter the way Replit has.
- IMPROVE: **Parallel tasks that everyone can see.** Let free and entry-level users run at least 2 parallel tasks, or preview the board, so they understand the value. Apply tasks one at a time with an automatic smoke test after each apply.
- IMPROVE: **Loop detection.** After 2 failed fix attempts on the same error, stop and offer: roll back, switch to a deeper mode, show the error to the user in plain words, or "ask a human / the community".
- IMPROVE: **Persistent project memory you can see.** Show a "Project brief" panel (stack, decisions, conventions, DESIGN.md) that the agent reads and updates and the user can edit. This targets Replit's "zero context between sessions" complaint.

**AVOID**
- AVOID: Letting the agent run destructive DB or infra commands without an explicit approval prompt. Also avoid any path where "code freeze" is only an instruction in the prompt rather than an enforced setting.
- AVOID: Charging for failed or looping attempts with no visibility or recourse, and hiding costs behind hover icons.
- AVOID: Spreading across too many artifact types (slides, animations, 3D games, documents) before the core build → deploy loop is excellent. Replit's breadth dilutes focus, and reviewers call its canvas unpolished.
- AVOID: Platform lock-in. Use standard stacks, portable `.env` handling, a Dockerfile or export, and one-click "eject to GitHub + Vercel/Render" so developers trust you.
- AVOID: A dense IDE as the first screen for non-technical users. Replit's G2 feedback flags a developer-first interface as intimidating.
- AVOID: Pricing pages and docs that contradict each other (Replit's credit amounts and rollover periods differ across its own pages).

---

## Sources

Primary (Replit)
- https://replit.com/
- https://replit.com/pricing
- https://replit.com/blog/introducing-agent-4-built-for-creativity
- https://replit.com/agent4
- https://replit.com/blog/whats-changed-agent3-to-agent4
- https://replit.com/blog/introducing-agent-3-our-most-autonomous-agent-yet
- https://replit.com/blog/agent-on-any-framework
- https://replit.com/blog/2025-replit-in-review
- https://replit.com/blog/effort-based-pricing
- https://replit.com/blog/pro-plan
- https://replit.com/blog/replit-introduces-free-mode
- https://replit.com/blog/introducing-replit-design
- https://replit.com/products/design
- https://replit.com/blog/security-center
- https://replit.com/blog/black-box-pen-tests
- https://replit.com/blog/building-mobile-apps-on-replit
- https://replit.com/news/funding-announcement
- https://replit.com/gallery
- https://replit.com/integrations
- https://docs.replit.com/llms.txt
- https://docs.replit.com/updates (plus the entries for 2026/03/13, 07/03, 07/17, 07/24, 07/31, 08/14, 08/21, 08/28, 09/04; 2025/12/05)
- https://docs.replit.com/help/pricing-and-plans
- https://docs.replit.com/billing/ai-billing
- https://docs.replit.com/billing/managing-spend.md
- https://docs.replit.com/billing/deployment-pricing.md
- https://docs.replit.com/chat/agent-modes.md
- https://docs.replit.com/chat/free-mode.md
- https://docs.replit.com/chat/auto-mode.md
- https://docs.replit.com/chat/overview.md
- https://docs.replit.com/chat/conversations.md
- https://docs.replit.com/chat/conversations-and-projects.md
- https://docs.replit.com/chat/routines.md
- https://docs.replit.com/chat/connectors.md
- https://docs.replit.com/chat/connect-through-mcp.md
- https://docs.replit.com/chat/import-a-project.md
- https://docs.replit.com/chat/memories-custom-instructions-and-skills.md
- https://docs.replit.com/home/start-a-conversation.md
- https://docs.replit.com/home/understand-your-workspace.md
- https://docs.replit.com/home/projects.md
- https://docs.replit.com/home/integrations.md
- https://docs.replit.com/features/collaboration/workspaces
- https://docs.replit.com/learn/plan-vs-build-mode.md
- https://docs.replit.com/learn/build-with-agent.md
- https://docs.replit.com/learn/build-in-parallel.md
- https://docs.replit.com/core-concepts/agent/task-system.md
- https://docs.replit.com/learn/projects-and-artifacts/version-control.md
- https://docs.replit.com/learn/projects-and-artifacts/projects-and-artifacts.md
- https://docs.replit.com/learn/projects-and-artifacts/project-editor.md
- https://docs.replit.com/learn/projects-and-artifacts/storage-and-databases.md
- https://docs.replit.com/learn/projects-and-artifacts/auth.md
- https://docs.replit.com/learn/projects-and-artifacts/replit-deployments.md
- https://docs.replit.com/learn/foundations/context-management.md
- https://docs.replit.com/build/your-first-app
- https://docs.replit.com/build/add-database.md
- https://docs.replit.com/build/add-login.md
- https://docs.replit.com/build/publish-your-app.md
- https://docs.replit.com/build/troubleshooting.md
- https://docs.replit.com/build/add-custom-domain.md
- https://docs.replit.com/build/import-from-providers.md
- https://docs.replit.com/build/mobile-first-app.md
- https://docs.replit.com/build/invite-teammates.md
- https://docs.replit.com/design/what-is-replit-design.md
- https://docs.replit.com/design/design-vs-build.md
- https://docs.replit.com/design/canvas.md
- https://docs.replit.com/design/visual-editor.md
- https://docs.replit.com/replitai/app-testing
- https://docs.replit.com/replitai/element-selector
- https://docs.replit.com/features/agent/steer-and-queue-messages
- https://docs.replit.com/features/workspace-tools/git-interface
- https://docs.replit.com/features/workspace-tools/workflows
- https://docs.replit.com/features/editor/preview
- https://docs.replit.com/category/workspace-features
- https://docs.replit.com/core-concepts/project-editor/app-setup/secrets
- https://docs.replit.com/features/integrations/replit-ai-integrations
- https://docs.replit.com/replit-workspace/ssh
- https://docs.replit.com/teams/create-your-workspace.md
- https://docs.replit.com/teams/enterprise-privacy-settings.md
- https://docs.replit.com/teams/observability.md
- https://docs.replit.com/billing/plans/replit-enterprise.md
- https://docs.replit.com/use-cases/import-figma-design.md

Secondary (press, reviews, sentiment)
- https://www.theregister.com/2025/09/18/replit_agent3_pricing/
- https://www.theregister.com/2025/07/21/replit_saastr_vibe_coding_incident/
- https://www.theregister.com/2025/07/22/replit_saastr_response/
- https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure/
- https://fortune.com/2026/08/19/exclusive-replit-taps-openais-low-cost-luna-model-for-new-free-mode-subscription-tier/
- https://techstartups.com/2026/08/19/replit-launches-free-mode-with-openai-letting-users-build-ai-apps-without-burning-credits/
- https://techcrunch.com/2025/10/02/after-nine-years-of-grinding-replit-finally-found-its-market-can-it-keep-it
- https://www.latent.space/p/ainews-replit-agent-4-the-knowledge
- https://creatoreconomy.so/p/replit-agent-4-is-here-plan-design-build-tutorial
- https://www.developersdigest.tech/blog/replit-agent-4-design-to-app
- https://tessl.io/blog/replits-agent-4-coordinates-multiple-ai-agents-to-build-apps-in-parallel
- https://www.therundown.ai/tools/replit-agent-4
- https://stackbuiltai.com/replit-agent-4-review-2026/
- https://www.bycrawl.com/blog/replit-agent-4-launch
- https://www.news.aakashg.com/p/guide-replit
- https://hackceleration.com/replit-review
- https://www.g2.com/products/replit/reviews?qs=pros-and-cons
- https://www.capterra.com/p/10011212/Replit/reviews/
- https://www.trustpilot.com/review/replit.com
- https://www.softr.io/blog/replit-pricing
- https://axonbuild.com/blog/fix-a-replit-app-that-keeps-breaking/
- https://www.brilworks.com/blog/how-to-migrate-from-replit/
- https://zapier.com/blog/lovable-vs-bolt/
- https://www.vktr.com/ai-news/replit-launches-mobile-app-builder-with-direct-app-store-path/
- https://www.rapidevelopers.com/blog/what-is-replit-a-beginners-guide
- https://www.youtube.com/watch?v=sQFQticAbzE
