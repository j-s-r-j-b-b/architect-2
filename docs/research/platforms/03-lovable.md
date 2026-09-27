# 03 — Lovable (lovable.dev): Competitive Research for Architect 2.0

> Research date: 2026-09-25. Main sources: Lovable docs (docs.lovable.dev, including the changelog through Sep 23, 2026), the Lovable blog, TechCrunch, Wikipedia, Trustpilot, Hacker News, and comparison/tutorial blogs.
> I did not sign up or log in. **The lovable.dev homepage and pricing table returned HTTP 403 or partial content to the fetcher**, so the homepage copy and some visual details come from secondary sources and are marked as such. Most UI detail below comes from Lovable's own docs, which name buttons and panels. Anything I inferred is labelled "(inferred)", and anything I could not confirm is labelled "(unverified)".

---

## 0. Snapshot

| Item | Detail |
|---|---|
| Company | Lovable AB, Stockholm. Founded by Anton Osika and Fabian Hedin. It grew out of the open-source **GPT Engineer** CLI (June 2023) and rebranded to "Lovable" around Nov–Dec 2024 ([Wikipedia](https://en.wikipedia.org/wiki/Lovable_(company)), [Till Freitag timeline](https://till-freitag.com/en/blog/lovable-2-roadmap-recap-en)) |
| Scale | About **$500M ARR (June 2026)**. **$400M Series C at a $13.3B valuation (Aug 12, 2026)**. **60M projects hosted and 900M monthly visitors** to Lovable-built sites ([TechCrunch](https://techcrunch.com/2026/08/12/lovable-confirms-new-13-3b-valuation-raises-another-400m/)). Series B was $330M at $6.6B (Dec 18, 2025), when Lovable reported 100K+ new projects per day ([Lovable blog](https://lovable.dev/blog/series-b)) |
| Category | Prompt-to-app builder: a "vibe-coding" platform with a managed backend, hosting and AI gateway |
| Generated stack | React + Tailwind + shadcn/ui. Originally Vite SPA. **TanStack Start (SSR) has been the default for new projects since May 13, 2026** ([hosting docs](https://docs.lovable.dev/features/hosting.md), [Blink](https://blink.new/blog/lovable-update-may-2026)). The backend is **Lovable Cloud**, built on Supabase's open-source stack ([Cloud docs](https://docs.lovable.dev/features/cloud.md)) |
| Tagline | "Build something Lovable" / "Create apps and websites by chatting with AI" (from secondary sources; I could not fetch the homepage, 403) |

---

## 1. Positioning: what makes Lovable different

- **Design quality is the headline differentiator.** Comparison reviews repeatedly say Lovable has "the best out-of-the-box visual polish" and "the most polished output of the category" ([ToolJet](https://blog.tooljet.com/lovable-vs-bolt-vs-v0/), [altar.io](https://altar.io/lovable-vs-bolt-vs-v0-vs-replit-vs-base44/)). In 2026 Lovable made this a system:
  - The **Creative Engine** (May 2026) sends each build step (code, layout, images) to whichever frontier model does that step best ([Blink](https://blink.new/blog/lovable-update-may-2026)).
  - **Design directions** show three rendered previews before any code is written ([Design guidance docs](https://docs.lovable.dev/features/design-guidance)).
- **An all-in-one managed stack, with no outside dashboards.** Hosting, database, auth, storage, edge functions, cron jobs, secrets, email, an AI gateway (no API keys), payments (Stripe/Paddle), domain purchase, analytics, SEO tooling and security scanning all live inside the editor's **More** menu ([editor docs](https://docs.lovable.dev/features/projects/editor.md)).
- **Non-technical first, with a growing set of developer hooks:**
  - direct code editing (paid plans)
  - two-way Git sync with GitHub, GitLab and Bitbucket
  - an MCP server so Claude Code, Cursor and Codex can drive Lovable
  - a REST API
  - AGENTS.md and SKILL.md support
  - frontend, edge-function and browser tests ([MCP docs](https://docs.lovable.dev/integrations/lovable-mcp-server), [testing docs](https://docs.lovable.dev/features/testing.md))
  - It still **cannot import an existing repo** ([GitHub docs](https://docs.lovable.dev/integrations/github.md)).
- **Autonomy is exposed in layers:**
  - **Chat** (free daily allowance, read-only)
  - **Plan** (1 credit, read-only, produces an editable plan)
  - **Build** (variable cost, autonomous)
  - **Goal runs** (Build mode that keeps working until the goal is met, up to 10 hours)
  - **Subagents** (read-only parallel researchers) ([Build mode](https://docs.lovable.dev/features/agent-mode), [Goal runs](https://docs.lovable.dev/features/goal-runs.md), [Subagents](https://docs.lovable.dev/features/subagents.md)).
- **Trust and governance as a moat:**
  - Quick and Deep scans, Wiz, and Aikido AI pen-testing
  - Trust Center pages for published apps
  - SOC 2 Type II, ISO 27001:2022, AIUC-1
  - SSO, SCIM and audit logs ([Security](https://docs.lovable.dev/features/security.md), [Enterprise](https://docs.lovable.dev/introduction/lovable-for-enterprise.md))
- **Moving beyond apps (2026).**
  - **Chats**: a workspace-level assistant with connectors and a free daily allowance ([Chats](https://docs.lovable.dev/features/chats.md)).
  - File, document and data-analysis generation in a Linux sandbox ([Generate files](https://docs.lovable.dev/features/generate-files.md)).
  - Lovable in Slack and Telegram, plus a ChatGPT app. Lovable is becoming a "work agent" platform, not only an app builder.
- **Pricing is by credits, not seats.** Workspaces allow unlimited members who share one credit pool ([workspace docs](https://docs.lovable.dev/features/workspace.md)).

---

## 2. Who uses it and why (jobs to be done)

**Non-technical users (the core audience)**
- Founders validating an MVP. Reviews say a founder can go "from blank page to a working, shareable web app in under an hour" ([NxCode](https://www.nxcode.io/resources/news/lovable-review-2026)). Lovable's own case studies cite Lumoo ($800K ARR in 9 months) and ShiftNex ($1M ARR in 5 months) ([Series B post](https://lovable.dev/blog/series-b)).
- Marketers and small businesses building landing pages, sites and SEO pages. The SSR and SEO/AI-search tooling targets this group ([SEO docs](https://docs.lovable.dev/features/seo-aeo.md)).
- Shopify merchants building AI storefronts. The Shopify integration launched Oct 20, 2025 ([search summary of launch coverage](https://lovable.dev/blog/shopify-integration)).
- PMs and designers turning Figma files, Linear/Jira tickets or Miro boards into clickable prototypes through chat connectors ([Chat connectors](https://docs.lovable.dev/integrations/chat-connectors.md)).
- Students (50% off Pro for 12 months) ([plans](https://docs.lovable.dev/introduction/subscription-plans.md)).
- The template gallery filters by 13 personas, including Founders, Marketers, Designers, Engineers, Students and Nonprofits ([templates](https://lovable.dev/templates)).

**Technical users (a growing but secondary audience)**
- Engineers who prototype in Lovable, then export through GitHub to Cursor or Claude Code. Reviewers call this the "honest" path: "use Lovable for the prototype, then export to Cursor for the production version" ([NxCode](https://www.nxcode.io/resources/news/lovable-review-2026)).
- Developers who drive Lovable from their own agent via the MCP server. There are 40+ tools, including `create_project`, `send_message`, `get_diff` and `query_database`. The Claude Code plugin adds `/build`, `/deploy` and `/db`, and the Cursor plugin adds `/lovable-new` and `/lovable-deploy` ([MCP docs](https://docs.lovable.dev/integrations/lovable-mcp-server), [mcp.directory](https://mcp.directory/blog/lovable-mcp-server)).
- Enterprise teams building internal tools under governance. Named customers include Klarna, Deutsche Telekom, Zendesk and Uber AI ([Series B](https://lovable.dev/blog/series-b)).

**Why people choose it:** speed, beautiful default UI, zero setup (no terminal, no hosting, no API keys), one bill, real code they own via Git sync, and a fun, friendly brand.

---

## 3. Feature inventory, by area

### 3.1 Onboarding and account auth
- Sign-up options: email/password, Google, GitHub, Apple, and SAML/OIDC SSO. A personal Free workspace is created automatically and you land on the dashboard with "no additional setup steps" ([Create account](https://docs.lovable.dev/introduction/create-an-account.md)).
- **Post-signup onboarding questions: not documented (unverified).**
- Account security: 2FA, workspace-enforced 2FA, sign-in alerts for new devices or countries (Jul 15, 2026), and "sign out everywhere" (Aug 26, 2026) ([changelog](https://docs.lovable.dev/changelog)).
- Build with URL: `lovable.dev/#prompt=...&images=...&html=...` pre-fills the prompt. It never auto-submits; the old `autosubmit` parameter is ignored ([Build with URL](https://docs.lovable.dev/integrations/build-with-url.md)).
- Public remix previews and templates can be viewed without signing in. Sign-up is requested only at the moment of remixing (Sep 11, 2026) ([changelog](https://docs.lovable.dev/changelog), [remix docs](https://docs.lovable.dev/features/projects/remix.md)).

### 3.2 Homepage and dashboard prompt entry
- A central prompt box with a **microphone** for dictation. Dictation strips filler words and recognises product names (Sep 19, 2026).
- A **mode picker next to Send**:
  - **Build**: "Create a new project and have Lovable build it"
  - **Chat**: "Start a chat outside your projects"
  - **Plan**: "Create a new project and start it in Plan mode" ([Dashboard docs](https://docs.lovable.dev/introduction/dashboard-overview.md))
- The **`+` menu** has four entries:
  - **Attach**: files, images, screenshots
  - **Design**: templates and design systems
  - **Connectors**: MCP
  - **Databases**: link a backend
- **Templates:** about 207 community templates, split into Websites and Apps, with 22 subcategories and 13 personas. Cards show a thumbnail, title, description and an App/Website badge ([templates](https://lovable.dev/templates)). Business+ workspaces also get private **design templates**: pick them via `+` → **Design → Use a template** ([design templates](https://docs.lovable.dev/features/business/design-templates.md)).

### 3.3 Chat and agent interaction
- **Three modes plus Goal.**
  - Build (formerly "Agent mode") has variable cost.
  - Plan (formerly "Chat mode") costs 1 credit plus any subagent research.
  - Chat is read-only and priced at a fraction of a credit, covered first by a free daily allowance.
  - Switch modes with the picker or **Option/Alt+P** ([chat docs](https://docs.lovable.dev/features/projects/chat.md), [axonbuild on the renaming](https://axonbuild.com/blog/lovable-agent-mode)).
- **Build mode tools:** read and search the codebase, web search, fetch docs, generate or edit images and video, read console and network logs, run browser tests, frontend tests (Vitest) and edge-function tests (Deno), and make coordinated front-end, back-end and config edits ([Build mode](https://docs.lovable.dev/features/agent-mode)). The Agent Mode launch (Jun 30, 2025) claimed a "90%" drop in build errors ([blog](https://lovable.dev/blog/agent-mode-beta)).
- **Activity cards** show each file edit, command, web search, browser test and subagent. Clicking one opens the **Details view** in the preview area, with a **Timeline** tab (every step and tool call) and a **Changes** tab (file diffs) ([Build mode](https://docs.lovable.dev/features/agent-mode)).
- **Clarifying questions** appear as a question card with up to four options per question. You can move between questions, write your own answer, or **skip** (Lovable continues with defaults). Draft answers persist. This launched Dec 5, 2025 ([chat docs](https://docs.lovable.dev/features/projects/chat.md), [blog](https://lovable.dev/blog/chat-mode-and-questions)). The Skip button no longer approves extra work (Sep 15, 2026).
- **Follow-ups:** you can send messages while Lovable works. They show grayed out until Lovable picks them up at the next natural stopping point, usually within seconds. This replaced the message queue on Sep 8, 2026. **Edit message → Revert and resend** rewinds from an earlier message.
- **Controls during and after a run:**
  - **Stop** keeps the work done so far, and you are charged for it.
  - After a response: **Undo latest edit** (no confirmation), **Revert to this version**, Copy, Helpful / Not helpful.
  - **Suggestion chips** after a response pre-fill the next prompt.
- **Cost transparency:**
  - **More options** shows a live **Working for** timer and **Credits used** (Aug 25, 2026).
  - **Credit check-ins** pause a single message once it passes a threshold (20 credits by default).
  - If credits run out mid-run, the message pauses with **Add credits** or **Finish up** instead of failing.
  - Chat messages display "Free" when the daily allowance covers them ([chat docs](https://docs.lovable.dev/features/projects/chat.md), [Build mode](https://docs.lovable.dev/features/agent-mode)).
- **Context shortcuts:**
  - `@` references projects, connectors, code files and Figma designs.
  - `/` opens skills and `/goal`.
  - The **Add context** menu adds screenshots and files (up to 10 per message: 20 MB on Free, 256 MB paid, 1 GB Enterprise) ([chat docs](https://docs.lovable.dev/features/projects/chat.md)).
- **Plan mode:**
  - Produces a structured plan document in a **Plan view**: approach, decisions and assumptions, components, data models, APIs, step sequencing and optional diagrams.
  - You can edit the plan directly, or select text, click **Comment** and type into "Describe the change..." to revise just that section.
  - Plan versions have undo/redo arrows, a "Viewing version 2 of 3" banner, **Back to latest** and **Save**.
  - Approving the plan switches to Build and starts implementation ([Plan mode](https://docs.lovable.dev/features/plan-mode.md)).
- **Goal runs** (Aug 30, 2026): `/goal` shows the banner "Lovable will work until your goal is achieved. This might take hours and use a large number of credits." Runs last up to 10 hours, and the last 30 minutes are spent wrapping up ([Goal runs](https://docs.lovable.dev/features/goal-runs.md)).
- **Subagents** (May 27, 2026) are read-only helpers of two kinds: generic and "Explore". They appear as rows inside an activity card, and clicking a row shows the files it inspected and what it found ([Subagents](https://docs.lovable.dev/features/subagents.md)).
- **Approval cards** appear before significant actions, such as buying a domain or sending through a connector. Agent permissions (Always allow / Ask each time / Never allow) are set in account settings (Sep 21, 2026) ([Cloud docs](https://docs.lovable.dev/features/cloud.md), [changelog](https://docs.lovable.dev/changelog)).

### 3.4 Live preview, visual editing and the "UI getting built" experience
- **Toolbar:** device toggle (Desktop / Tablet / Mobile view), a page selector ("Find page or enter path"), **Refresh** (Shift-click restarts the environment), **Open in new tab**, and a **Live preview** toggle that chooses between continuous updates and updates on completion. Errors show states such as "Live preview couldn't start" with a **Try again** button ([Preview docs](https://docs.lovable.dev/features/projects/preview.md)).
- **Preview toolbar** (edit from the preview) has four modes:
  1. **Select elements**: point at an element and prompt about it. Cmd/Ctrl-click selects several at once.
  2. **Edit text inline**: 100 free edits per account on a 24-hour renewal, 2,000 per workspace per day.
  3. **Draw annotation**: circles, rectangles and arrows are recognised and cleaned up automatically.
  4. **Add a comment**: pinned team notes. Comments are free, but sending a thread to Lovable is billed as build usage ([Preview toolbar](https://docs.lovable.dev/features/preview-toolbar.md)).
- **Visual Edits history:**
  - Launched Feb 2025 (765 Product Hunt upvotes) ([hunted.space](https://hunted.space/product/lovable-visual-edits)).
  - The engineering write-up (Mar 13, 2025) explains that edits apply **instantly without an LLM**. A Vite plugin tags JSX with stable IDs, the project syncs to the browser as a Babel/SWC AST, Tailwind is generated client-side, and HMR pushes the result ([blog](https://lovable.dev/blog/visual-edits)).
  - Early versions had a properties panel (colour, typography, spacing) and custom Tailwind classes ([alternativeto](https://alternativeto.net/news/2025/2/lovable-launches-visual-edits-update)). **Whether the 2026 toolbar still has a full property panel is unverified**: current docs describe prompt-driven select plus inline text.
- **What you see while the UI is being built:**
  1. For open-ended UI prompts, **design guidance** comes first. Lovable either shows **three design directions**, rendered as lightweight HTML/Tailwind previews side by side with a full-screen view and thumbnail switching, or asks **design questions**:
     - **Typography** font pairs grouped by feel
     - **Colour palettes** grouped by mood
     - **Layout** choices, such as hero grid, bento, split screen or magazine
  2. You can refine a chosen direction up to 6 times with "Describe changes" and three suggestions, then press **Submit** to start the full build. The docs say this adds no extra credit cost ([Design guidance](https://docs.lovable.dev/features/design-guidance)).
  3. During the build, the chat streams activity cards (file edits, commands and so on). A tutorial describes the agent as one that "narrates what it's doing" ([Mantlr](https://mantlr.com/blog/how-to-use-lovable-2026)). The preview is a real dev server with hot reload that "updates as Lovable works" ([editor docs](https://docs.lovable.dev/features/projects/editor.md)).
  4. The first version takes "a few minutes" ([Quick start](https://docs.lovable.dev/introduction/getting-started.md)); tutorials say typically 1–3 minutes ([Mantlr](https://mantlr.com/blog/how-to-use-lovable-2026)).
  - Lovable also shipped **OJ** (Sep 2026), a Rust dev server that replaces Vite for previews. It cut median preview load time from 17.4s to 8.0s and sandbox acquisition from 14.5s to 3.0s ([OJ blog](https://lovable.dev/blog/faster-previews-oj)).
- **Shared preview links:** view-only, no account needed, with expiry and password options (Business+, Sep 4, 2026) ([Preview docs](https://docs.lovable.dev/features/projects/preview.md), [plans](https://docs.lovable.dev/introduction/subscription-plans.md)).

### 3.5 Code view, editor and files
- The **Code** tab has a file tree with Expand/Collapse all, reorderable file tabs, a right-click **Reference in chat** option, and **Search code** (Cmd/Ctrl+Shift+F), with replace on paid plans.
- Editing: Save (Cmd+S, which creates a version) or Discard. There is a format button, Markdown preview, copy/download per file, and **Download codebase** (.zip, paid).
- **Free plan code is "Read only" with an Upgrade prompt** ([Code docs](https://docs.lovable.dev/features/code-mode.md)).
- **No terminal is documented (unverified).** Build secrets and npm packages are supported, and a Managed Registry is in beta.
- The **Files** tab (redesigned Sep 20, 2026) holds uploads and generated files (PDF, DOCX, PPTX, CSV and more), kept separate from the code ([Generate files](https://docs.lovable.dev/features/generate-files.md)).

### 3.6 Backend (Lovable Cloud) and Supabase
- **Cloud** launched Sep 29, 2025 ([blog](https://lovable.dev/blog/lovable-cloud)). It is built on Supabase OSS: Postgres, auth, storage, edge functions and realtime. It is enabled per workspace, and Lovable either turns it on automatically or asks first, depending on the **Enable Cloud** permission ([Cloud docs](https://docs.lovable.dev/features/cloud.md)).
- **Cloud tabs**, in order under More → Cloud: Emails, Database (with SQL editor), Users, Storage, Secrets, Jobs, Edge functions, Logs, Usage, Advanced settings.
- **Database:**
  - Tables with row counts, inline double-click editing, an **Edit row** form, filters, pagination and **Export CSV**.
  - An **RLS policies** view with Policy name, Command, Applies to and Rule expression.
  - A SQL editor with autocomplete and confirmation for destructive statements.
  - Daily backups kept about 14 days, with **Restore to this backup** ([Database docs](https://docs.lovable.dev/features/database.md)).
- **Auth for end users:**
  - Email (confirmation, one-time codes), phone (Twilio and others), Google/Apple/Microsoft ("Managed by Lovable" or your own credentials), and SAML.
  - The Users view has a signups chart (7/30/90 days), user search, invite/create user, and settings such as Disable sign-up, anonymous users and redirect URLs ([Auth docs](https://docs.lovable.dev/features/authentication.md)).
- **Jobs (cron):** created only by asking in chat. The Jobs view shows the schedule in plain English, run history (Succeeded/Failed/Running) and enable toggles ([Jobs](https://docs.lovable.dev/features/jobs.md)).
- **Logs:** server, edge function, auth, Postgres, realtime and storage logs, with text search, a time range and a status filter. The docs suggest pasting a log entry into chat to get a fix ([Logs](https://docs.lovable.dev/features/logs.md)).
- **Advanced settings:**
  - CPU, Memory and Disk "pressure" cards for the last 24 hours.
  - Instance sizes Tiny → X-Large, with estimated monthly cost.
  - Storage can only grow ([Advanced](https://docs.lovable.dev/features/advanced-settings.md)).
  - **The region (Americas, Europe or APAC) cannot be changed after Cloud is enabled.**
- **Supabase (bring your own):** an alternative for teams that want to own their backend. **There is no automatic migration between Cloud and Supabase in either direction** ([Supabase docs](https://docs.lovable.dev/integrations/supabase.md)).

### 3.7 AI features inside generated apps, and agent building
- **Lovable AI gateway:**
  - Every project gets an auto-managed `LOVABLE_API_KEY`.
  - Chat models include Gemini 3.x (default Gemini 3.8 Flash), GPT-5.x/6, and Claude models (added for AI features Sep 23, 2026).
  - It also offers image, video (Veo, Gemini Omni), embeddings, TTS/STT, and a "Jev" typed-decision model for classification and scoring.
  - When credits run out, calls return HTTP 402 ([AI docs](https://docs.lovable.dev/features/ai.md), [changelog](https://docs.lovable.dev/changelog)).
- **Ways to build agents, spread across features** (there is no dedicated agent builder):
  - AI features plus edge functions plus Jobs.
  - Connectors such as the **Telegram bot** tool and **WhatsApp Business**, and apps that act as a **Slack agent**.
  - **Agent integrations:** publish your app as an **MCP server** for ChatGPT, Claude, Cursor or VS Code. OAuth-protected is the default and public is optional. Tools carry badges (Active / Not published / Inactive; Read-only / May modify data) ([Agent integrations](https://docs.lovable.dev/features/agent-integrations.md)).
  - **No visual agent canvas, framework choice (LangGraph, CrewAI and so on) or eval tooling is documented (unverified / appears absent).**

### 3.8 Integrations, connectors, MCP and secrets
- **Connector types** ([Connectors intro](https://docs.lovable.dev/integrations/introduction.md)):
  - **App + Chat connectors**: one shared credential that works both in chat and in the published app.
  - **Chat connectors (MCP)**: personal, used only while building. Examples: Notion, Linear, Jira, Miro, Sentry, Amplitude.
  - **App user connectors** (Jul 13, 2026): each end user of the app connects their own account via OAuth. Examples: Gmail, Outlook, Salesforce, GitHub.
  - **Custom connectors** for any REST API (Aug 31, 2026).
  - **Custom MCP servers**, plus MCP registries.
  - **Direct API integration**: Lovable writes the integration code itself.
- The catalog has 100+ entries across search, BI/warehouses (Snowflake, BigQuery, Databricks, Power BI), CRM (HubSpot, Salesforce), communication (Twilio, Resend), ecommerce (Shopify, WooCommerce), finance (Stripe, Xero), CMS, and security (Wiz, Aikido) ([docs index](https://docs.lovable.dev/llms.txt)).
- Credentials are held in a connector gateway and never exposed to the project. **Secrets** live in a Cloud tab, and **build secrets** are workspace-level.
- **Payments:** built-in Stripe or **Paddle** (merchant of record). Each has test and live environments, a Payments dashboard with revenue and refunds, and a go-live checklist. Products sync from test to live on publish ([Payments](https://docs.lovable.dev/features/payments.md)).

### 3.9 GitHub and version control
- **Git sync** works with GitHub (including Enterprise Cloud with data residency and Enterprise Server), GitLab, and Bitbucket (added Sep 10, 2026).
- Setup: **Workspace settings → Git → GitHub → Add connection**, install the GitHub app, then link one project to one repo.
- Sync is **two-way on a single active branch**. A branch picker can create or switch branches.
- Business+ can add member emails to commits for attribution ([GitHub docs](https://docs.lovable.dev/integrations/github.md), [Git overview](https://docs.lovable.dev/integrations/git-sync-overview.md)).
- **Limits:** no import of existing repos, no reconnecting to the same repo after disconnecting, one repo per project.
- **Version history:**
  - The **History** toggle in the top bar opens History and Bookmarks tabs. The live version carries a **Published** badge.
  - Each version has a snapshot view, **Open preview in new tab**, **View code changes** (diff) and **Go to message in chat**.
  - **Revert restores code only, not database data** ([History docs](https://docs.lovable.dev/features/projects/history.md)).
- **Drafts** (Sep 9, 2026) are branch-like copies with their own chat and preview. Create one via the project-name switcher → **New draft**, then **Accept** to merge. **Drafts share the project's database** ([Drafts](https://docs.lovable.dev/features/drafts.md)).

### 3.10 Importing existing work
- **GitHub repo import: not supported.** The community workaround is to create a Lovable repo, force-push your own code into it, and let Lovable adopt it ([ValidMVPs guide](https://www.validmvps.studio/blog/import-existing-github-repo-into-lovable/), [GitHub docs](https://docs.lovable.dev/integrations/github.md)).
- **Figma**, three ways ([Figma docs](https://docs.lovable.dev/integrations/figma.md)):
  - the Figma plugin (Aug 21, 2026; needs a Figma Dev seat; up to 100 files)
  - a `.fig` upload, which brings in tokens and frame structure only
  - Figma MCP via the desktop app
- **Screenshots and images:** attach them or capture a screenshot. **URL clone:** pass `html=` in Build with URL. **ZIP:** can be attached and previewed (Sep 10, 2026), but a ZIP is context, not a project import (inferred).
- **Design systems:** import from an npm package, a public Git repo or uploaded files into a dedicated design-system project, then connect it to other projects. Updates are versioned and adherence is enforced ([Design systems](https://docs.lovable.dev/features/design-systems.md)).

### 3.11 Deploying, hosting and domains
- **Publish** (top right) gives each app a `*.lovable.app` URL on a global CDN with automatic SSL. The live site is a **snapshot**; later edits need **Publish → Publish changes**.
- **No separate staging environment** exists (Payments and Cloud do have test/live data) ([Publish](https://docs.lovable.dev/features/publish.md), [Hosting](https://docs.lovable.dev/features/hosting.md)).
- Free-plan limit: 1,000 server requests per 10 seconds per project. When credits run out, the backend pauses but the site stays up ([Hosting](https://docs.lovable.dev/features/hosting.md)).
- **Custom domains (paid)** ([Custom domain](https://docs.lovable.dev/features/custom-domain.md)):
  - **Buy one inside Lovable** (Stripe checkout, auto DNS and SSL; the domain belongs to the workspace), or ask for it in chat, which shows an approval card (Sep 1, 2026).
  - **Connect an existing domain** automatically via **Entri**, or manually with an A record to `185.158.133.1` plus a TXT record.
  - Statuses: Pending, Verifying, Live, Connection issue. The www → root redirect is on by default.
- **Audience** (Business+): Public, Workspace or Custom (internal publishing). **Unpublish** is available per project or in bulk.
- **Deploying elsewhere:** via GitHub to Vercel, Netlify, Cloudflare and others. You then take on secrets, SSL, monitoring and backend migration yourself ([External hosting](https://docs.lovable.dev/tips-tricks/external-deployment-hosting.md)).

### 3.12 Debugging and automatic error fixing
- Errors show in a **preview error overlay** and as a **chat card** with **Try to fix**. There are 10 free fixes per account on a 24-hour renewal (Aug 11, 2026).
- The docs' advice: after 1–2 failed fixes, switch to **Plan mode** for root-cause analysis, or rewind with history or "Revert and resend". In their words, "Repeated blind fixes tend to pile up code that hides the real problem" ([Debugging](https://docs.lovable.dev/prompting/prompting-debugging)).
- **Project monitoring** runs daily or weekly code reviews and scans visitor errors. It sends email plus a summary above the chat, with **Try to fix / Skip / Ignore**. It **does not auto-fix** ([Monitoring](https://docs.lovable.dev/features/project-monitoring.md)).

### 3.13 Testing
- **Browser testing** in a remote browser: the Details view shows each step, screenshots, URLs and a pass/fail summary.
  - It can **sign in as the app user** whose email matches yours (Sep 8, 2026).
  - It struggles with canvas, drag-and-drop and icon-only buttons.
- **Frontend tests** (Vitest + RTL) and **edge-function tests** (Deno).
- Most tests run only when asked ("verify it works") ([Browser testing](https://docs.lovable.dev/features/browser-testing.md), [Testing](https://docs.lovable.dev/features/testing.md)).

### 3.14 Security
- **Quick scan** runs automatically at publish and checks RLS/access rules, npm dependencies and MCP auth.
- **Deep scan** adds access control, abusable endpoints, injection, leaked secrets, payments, auth and PII.
- The **Security view** (redesigned Sep 23, 2026) has scan status cards, findings grouped into 8 areas, Critical/Warning/Info labels, **Try to fix** / **Try to fix all**, Ignore-with-reason, and a dependencies card ([Security](https://docs.lovable.dev/features/security.md), [Security view](https://docs.lovable.dev/features/security-view.md)).
- Settings allow auto-fixing security issues, and admins can **block publishing with critical issues**.
- Sensitive-data (PII) scanning covers chat, database and storage, with log / ask / block modes.
- **Trust Center** at `/.well-known/trust.html`.
- Optional **Wiz** (SCA/SAST) and **Aikido** AI pen-testing.
- **History:** CVE-2025-48757 (reported Mar 2025, public May 29, 2025). Weak or missing RLS exposed data in 170 of 1,645 scanned apps ([Matt Palmer](https://mattpalmer.io/posts/2025/05/CVE-2025-48757/), [Superblocks](https://www.superblocks.com/blog/lovable-vulnerabilities)). Security remains the strongest criticism ([HN, Feb 2026](https://news.ycombinator.com/item?id=47182659)).

### 3.15 Analytics, SEO, usage and logs
- **Project analytics** (More → Analytics):
  - A chart of visitors, pageviews, views per visit, duration or bounce rate.
  - A "last 5 minutes" live counter.
  - Breakdowns by Source, Page, Device and Country ([Analytics](https://docs.lovable.dev/features/analytics.md)).
- **SEO & AI search review:**
  - audits sitemap, robots.txt, metadata, structured data and alt text
  - connects Google Search Console
  - offers Semrush research
  - serves Markdown to AI crawlers ([SEO](https://docs.lovable.dev/features/seo-aeo.md))
- **Usage details:** daily charts by project and person. **Workspace Insights** shows adoption metrics (Sep 3, 2026).

### 3.16 Collaboration, workspaces and sharing
- **Roles:** Owner, Admin, Editor, Viewer, and External collaborator. Membership is unlimited because pricing follows credits; free workspaces can send 5 email invites per day.
- **Credit controls:** a shared pool with per-member monthly limits.
- **Real-time presence avatars**, element-pinned **Comments**, and a **Share** menu ([Workspace](https://docs.lovable.dev/features/workspace.md)).
- **Knowledge:** workspace and project instructions, 10,000 characters each; project knowledge wins on conflict; AGENTS.md is also read ([Knowledge](https://docs.lovable.dev/features/knowledge.md)).
- **Skills** (May 2026): SKILL.md format, auto-applied or invoked with `/`. Built-in skills cover accessibility, redesign, SEO and video. Skills can be created five ways: guided, manual, GitHub import, ZIP, or save from chat ([Skills](https://docs.lovable.dev/features/skills.md)).
- **Cross-project referencing:** `@OtherProject` gives read-only reuse of components, styles and auth flows, up to 10 references ([docs](https://docs.lovable.dev/features/cross-project-referencing.md)).
- **Remix:** copies code, schema (no data), optionally chat history and files, and knowledge. Public remixing is optional ([Remix](https://docs.lovable.dev/features/projects/remix.md)).
- **Community:** the **Lovable Launched** gallery (launched.lovable.dev) has weekly upvotes and credit prizes. Every free app shows an "Edit with Lovable" badge, which drives growth loops ([Lovable blog](https://lovable.dev/blog/2025-01-30-how-to-launch-and-get-traffic-to-an-app-built-with-lovable), [alternativeto](https://alternativeto.net/news/2025/2/lovable-announces-lovable-launched--a-platform-for-lovable-apps-discovery)).

### 3.17 Other surfaces: mobile, desktop, API
- **Mobile apps** for iOS and Android (Apr 27, 2026): prompt by text, voice or camera; swipe between chat and preview; push notifications when a build is ready; manage drafts. **Lovable still builds only web apps, not native end-user apps** ([Mobile docs](https://docs.lovable.dev/integrations/lovable-mobile-app.md), [TechCrunch](https://techcrunch.com/2026/04/28/lovable-launches-its-vibe-coding-app-on-ios-and-android/)).
- **Desktop app** for macOS and Windows: multi-project tabs, Cmd+K command palette, and local MCP (Figma Desktop, Paper) ([Desktop](https://docs.lovable.dev/integrations/desktop-app.md)).
- **Lovable API** (REST, Business+, Sep 17, 2026), the **MCP server**, **Slack** (`@Lovable` in threads), **Telegram**, and a **ChatGPT app** ([Slack](https://docs.lovable.dev/integrations/lovable-for-slack.md)).

### 3.18 Pricing and credits (as of Sep 2026)
- **Plans** ([Plans docs](https://docs.lovable.dev/introduction/subscription-plans.md)):

  | Plan | Price | Credits | Notable features |
  |---|---|---|---|
  | **Free** | $0 | 5 daily build credits (capped at 30/month) | Daily chat allowance, 20 Cloud and 4 AI credits per month, private projects, Git sync. No code editing, no custom domain, no badge removal |
  | **Pro** | from $25/mo ($21 annual) | 100 credits, scaling up to 10,000 for $2,250 | Code editing, custom domains, badge removal, design systems, code download, roles, rollover, top-ups |
  | **Business** | from $50/mo | 100 credits (about 2× Pro's price per credit) | Adds design templates, personal projects, internal publishing, the API, preview passwords, SSO, security center, Insights, commit attribution, training opt-out on by default |
  | **Enterprise** | custom | custom | Adds SCIM, audit logs (13 weeks, SIEM export), publishing and sharing controls, npm design systems, scheduled scans, dedicated support |

- **Top-ups** cost $0.30 per credit on Pro and $0.60 on Business, and last 12 months ([Credits](https://docs.lovable.dev/introduction/credits-and-usage)).
- **Example costs:** "Make the button gray" 0.50, "Add authentication" 1.20, "landing page with images" 1.70–2.00. Plan mode is 1 credit ([pricing page](https://lovable.dev/pricing)).
- **August 2026: one unified balance.** Build, Cloud hosting and AI usage now draw from a single credit pool. Totalum reports that when credits hit zero, "building stops and your deployed app's database, storage, and authentication pause" ([Totalum](https://www.totalum.app/blog/lovable-pricing-2026)).
- **Chat pricing** ("free daily allowance") is guaranteed only through **Oct 31, 2026** ([Chat for free](https://lovable.dev/blog/chat-for-free)).

---

## 4. UI layout: the main screens

**Dashboard / home (from the docs; layout details inferred from the doc descriptions)**
- **Left sidebar (collapsible):**
  - **Workspace selector** at the top.
  - **Dashboard**, **Chats**, **Search**, **Connectors**.
  - **Projects** (with filters and folders), **Starred**, **Recents**.
  - A referral card and an upgrade prompt.
  - The **avatar menu** at the bottom: profile, notifications, appearance (light/dark), support, log out ([Dashboard](https://docs.lovable.dev/introduction/dashboard-overview.md)).
- **Centre:**
  - A large prompt box with **mic**, **`+`** (Attach / Design / Connectors / Databases) and the **mode picker** (Build / Chat / Plan) beside **Send**.
  - Below it, **project cards** with live thumbnails. Hovering shows star, remix, share, move to folder and settings; multi-select allows bulk transfer or unpublish.
  - Project cards were redesigned Sep 18, 2026 and the Projects page refreshed Sep 23, 2026.
- **Command palette:** Cmd+K.

**Builder / editor** ([Editor docs](https://docs.lovable.dev/features/projects/editor.md))
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ☰  ProjectName ▾(drafts)  History  [⇤ hide chat]  Preview | Files | Code | More ▾ │
│                                    [Preview toolbar] [Comments] (avatars) Share  Publish │
├───────────────────────────┬──────────────────────────────────────────────────┤
│ CHAT PANEL (left)         │ PREVIEW (right)                                   │
│ - message thread          │ [Desktop/Tablet/Mobile] [Find page or enter path] │
│ - activity cards          │ [Refresh] [Open in new tab]                       │
│ - question / plan /       │  live app (hot reload)                            │
│   approval cards          │  floating toolbar: Select | Edit text | Draw |    │
│ - suggestion chips        │                    Comment                        │
│ ┌───────────────────────┐ │  (Details view with Timeline / Changes tabs       │
│ │ prompt box            │ │   opens here when you click an activity card)     │
│ │ [+] [mic] [Build ▾] ➤ │ │                                                   │
│ └───────────────────────┘ │                                                   │
└───────────────────────────┴──────────────────────────────────────────────────┘
```
- **Top bar, left:** the menu icon opens the dashboard sidebar inside the editor. Clicking the **project name** opens the **draft switcher**. Next come the **History** toggle, **Hide chat panel** (Cmd/Ctrl+B), and the **tabs** Preview (home), Files, Code and **More**.
- **More** holds Analytics, Cloud, AI, Agent integrations, Payments, Connectors, Security, SEO & AI search, Sensitive data and Settings.
- **Top bar, right:** the **Preview toolbar** button, **Comments**, collaborator avatars, **Share**, and **Publish**, which is the rightmost primary action and collapses to an icon on narrow screens ([Publish](https://docs.lovable.dev/features/publish.md)).
- **Chat panel on the left, preview on the right.** The prompt box sits at the bottom of the chat panel.
- **Project settings** tabs: General (Details, Project monitoring, Preview, Publishing, Sharing, Project actions, Danger zone), **Git**, **Domains**, **Knowledge**, **Skills** ([Settings](https://docs.lovable.dev/features/projects/settings.md)). Settings were unified and redesigned Jul 13, 2026.
- **Mobile layout:** swipeable views (chat ↔ preview) instead of a top bar. **Desktop app:** browser-like project tabs.

**Visual design language (partly inferred)**
- The product UI is minimal and neutral, with a light theme on a warm off-white background plus a dark theme, rounded cards and a generous prompt box (inferred from docs and third-party descriptions).
- The brand is **gradient-rich**, running from warm orange and pink to blue. A third-party analysis lists #FCFBF8 (off-white), #FE7B02 (orange) and #4B73FF (blue) as brand colours (unverified; [Medium brand analysis](https://medium.com/@chidolueebube/lovable-ai-visual-brand-analysis-368e20812473)).
- The logo is a heart. A new "living heartbeat" kinetic identity by the agency Primary was published Sep 24, 2026 ([Primary](https://www.primary.studio/work/lovable)).
- The tone is friendly and non-technical ("Build something Lovable") and the density is low. Power features are progressively disclosed through `+`, `@`, `/`, **More** and settings.

---

## 5. Step-by-step user flows

**A. Sign-up → first app**
1. Go to lovable.dev (you can type a prompt before signing in; via Build with URL it arrives pre-filled). Sign up with Google, GitHub, Apple, email or SSO. A Free personal workspace is created automatically, and onboarding questions are **unverified** ([Create account](https://docs.lovable.dev/introduction/create-an-account.md)).
2. On the dashboard, type or dictate a prompt. Optionally attach a screenshot or Figma file, pick a template or design system (`+` → Design), and pick a mode (Build by default, or Plan for a plan first).
3. **Design guidance:** Lovable shows three design directions, asks design questions (fonts, palette, layout), or builds directly if the prompt already has a visual brief.
4. **Clarifying questions card:** answer, write your own, or skip to accept defaults.
5. **Build:** the editor opens with chat on the left and preview on the right.
   - Activity cards stream steps (file edits, commands, searches).
   - Clicking a card opens the **Details** timeline and diffs in the preview area.
   - **More options** shows a live **Working for** and **Credits used**.
   - The preview hot-reloads while Lovable works.
   - The first version arrives in "a few minutes" ([Quick start](https://docs.lovable.dev/introduction/getting-started.md)).
6. After completion come a summary, **suggestion chips** for next features, Undo and Revert.

**B. Iterate**
- Chat prompts, with `@file` or `@project` references and `/skill`.
- The preview toolbar: select an element and prompt, edit text inline (free), draw an annotation, or comment.
- Follow-ups sent while Lovable is working get folded in.
- **Plan mode** for bigger changes: review the plan, comment on sections to revise them, **Approve**, and Build starts.
- **Drafts** for risky experiments: **New draft** → build → **Accept**.
- **/goal** for long autonomous runs, with credit check-ins.

**C. Preview → fix errors**
1. The error appears in the preview overlay or a chat card. Click **Try to fix** (free fixes renew daily).
2. If it fails once or twice, switch to **Plan** and ask "What is the root cause…". Or rewind via **History** or **Edit message → Revert and resend** ([Debugging](https://docs.lovable.dev/prompting/prompting-debugging)).
3. Optionally, ask "test the sign-up flow". The browser-test steps and screenshots appear in Details.

**D. Add a database and auth**
1. Prompt something like "Add sign up and login". Lovable enables **Cloud** automatically or shows an approval card, depending on your permission setting.
2. Lovable creates the tables, RLS rules and login pages. Check them under **More → Cloud → Database** (tables, RLS policies, SQL) and **Users → Auth settings**. Google sign-in can be "Managed by Lovable", so no Google Cloud setup is needed ([Auth](https://docs.lovable.dev/features/authentication.md)).
3. Alternatively, connect your own **Supabase** project. You can't migrate between the two later.

**E. Connect GitHub**
1. Go to **Workspace settings → Git → GitHub → Add connection** (or open Project settings → Git), then install and authorise the Lovable GitHub app for your account or org.
2. Link the project, which creates a new repo. Changes sync both ways on the active branch, which you can change with the branch picker ([GitHub](https://docs.lovable.dev/integrations/github.md)).

**F. Publish and custom domain**
1. Click **Publish** (top right). The dialog contains:
   - a **Website URL** (editable subdomain)
   - **Visibility / audience** (Business+)
   - an inline **Quick security scan** result ("No security issues found" or a findings count)
   - auto-generated title, description, favicon and OG image
2. Click **Publish** and see "Your website is live", with copy-link and visit buttons. Later updates go through **Publish → Publish changes** ([Publish](https://docs.lovable.dev/features/publish.md)).
3. Go to **Project settings → Domains**. Buy a domain (search, term, auto-renew, ICANN contact details, Stripe checkout) or connect one (Entri automatic or manual DNS). Watch the status move from Verifying to Live; SSL is automatic ([Custom domain](https://docs.lovable.dev/features/custom-domain.md)). You can also just say "buy me a domain" in chat and confirm the approval card.

**G. Import an existing project (weak spot)**
- A GitHub repo cannot be imported. The workaround is to push your code into a Lovable-created repo ([ValidMVPs](https://www.validmvps.studio/blog/import-existing-github-repo-into-lovable/)).
- Designs can come in through the Figma plugin, `.fig` tokens or Figma MCP.
- Look and feel can be referenced from screenshots or a URL (`html=`).
- A company component library can be imported as a **design system**.

**H. Agent building (indirect)**
1. Prompt, for example, "Add a support chatbot that answers from our docs". This uses the Lovable AI gateway (no keys), an edge function and a database for RAG.
2. Add tools through connectors (Slack, Telegram, WhatsApp, Gmail via app user connectors) and schedules through Jobs.
3. Expose the app to other agents via **More → Agent integrations → Enable agent integrations**: choose OAuth or public, review the generated tools, publish, and share the MCP link ([Agent integrations](https://docs.lovable.dev/features/agent-integrations.md)).

**I. Collaboration**
1. **Share** → invite by email or link, choosing a role.
2. Teammates appear as presence avatars. Comments are pinned to elements, and a comment thread can be sent to Lovable.
3. **Shared preview links** (password and expiry) for stakeholders who have no account.
4. A shared workspace credit pool with per-member limits. Private **Chats** for thinking before building. Lovable in **Slack** lets the team build from a thread.

---

## 6. UX strengths and pain points

**What users love (evidence)**
- **The "magic" first build and polish.** Trustpilot praise includes "I built a professional website within minutes" (Sep 8, 2026). The TrustScore is 4.2/5 from 1,730 reviews, with 68% giving 5 stars ([Trustpilot](https://www.trustpilot.com/review/lovable.dev)). Comparison sites rank Lovable top for visual polish ([ToolJet](https://blog.tooljet.com/lovable-vs-bolt-vs-v0/), [altar.io](https://altar.io/lovable-vs-bolt-vs-v0-vs-replit-vs-base44/)).
- **Zero setup:** no API keys, a managed backend, domain purchase and one bill.
- **You can see and steer the work:** activity cards and diffs, a live cost meter, check-ins, Stop that keeps completed work, follow-ups while running, and plan versions.
- **Cheap safe modes:** Plan costs 1 credit and Chat is free daily, so users can think without burning money.
- **Visual edits** are instant and free for text.
- **Collaboration** with unlimited members, plus **code ownership** via Git sync. A July 2025 HN thread mentions using Lovable "to collaborate with designers" on functional mockups ([HN](https://news.ycombinator.com/item?id=44671194)).
- **The mobile app** is rated 4.8 stars from 2,000+ ratings ([App Store](https://apps.apple.com/us/app/lovable-build-apps-with-ai/id6757471107)).

**Pain points (evidence)**
- **Credit burn and unpredictable cost** is the number-one complaint across Trustpilot, Reddit and G2 ([Zite](https://www.zite.com/blog/lovable-reviews)):
  - "The subscription is basically extortion…" (Trustpilot)
  - 17% of Trustpilot reviews are 1-star
  - founders report four-figure monthly bills from failed fix loops ([altar.io](https://altar.io/lovable-vs-bolt-vs-v0-vs-replit-vs-base44/))
- **Bug and fix loops, and paying for the AI's own mistakes.** One reviewer watched "the AI claim a bug was fixed three times in a row" ([altar.io](https://altar.io/lovable-vs-bolt-vs-v0-vs-replit-vs-base44/)). Another review says "Refusal to compensate for documented AI errors" (Trustpilot, Sep 23, 2026). Lovable's own docs warn that "Repeated blind fixes tend to pile up code" ([Debugging](https://docs.lovable.dev/prompting/prompting-debugging)).
- **A complexity ceiling.** Reviewers say Lovable "struggles to get past the prototype stage" for multi-role apps with complex logic ([NxCode](https://www.nxcode.io/resources/news/lovable-review-2026)).
- **Security:**
  - CVE-2025-48757 left 10.3% of scanned apps with exposed databases.
  - A Feb 2026 HN story covers a Lovable-hosted app that exposed about 18K users because of inverted auth logic ([HN](https://news.ycombinator.com/item?id=47182659)).
  - altar.io reports an April 2026 exposure lasting about 48 days (**unverified by me**).
- **Lock-in and one-way doors:**
  - no GitHub import
  - no Cloud ↔ Supabase migration
  - the Cloud region is permanent
  - remixes of Cloud projects stay on Cloud
  - one active branch
- **Environment gaps:**
  - no staging environment
  - Drafts share the production database
  - reverting a version doesn't touch data
- **The unified credit pool.** When credits run out, the production backend (database, auth, storage) pauses ([Totalum](https://www.totalum.app/blog/lovable-pricing-2026), [Hosting](https://docs.lovable.dev/features/hosting.md)).
- **Support responsiveness:** "After 30+ hours, no response from support" (Trustpilot, Sep 24, 2026). Free users get community support only.
- **Naming churn:** Agent mode became Build and Chat mode became Plan, and a new Chat mode was then added ([axonbuild](https://axonbuild.com/blog/lovable-agent-mode)). This confuses returning users.
- **Web-only output:** no native iOS or Android apps.
- **Paywalls:** on Free, code is read-only and there is no custom domain or badge removal.
- **Feature sprawl:** 10+ tools under **More**, many connector types, and three kinds of templates (community, design templates, design systems). Discoverability costs rise (inferred).

---

## 7. Notable launches, 2025–2026

| Date | Launch |
|---|---|
| Jan 30 / Feb 2025 | **Lovable Launched** community gallery ([blog](https://lovable.dev/blog/2025-01-30-how-to-launch-and-get-traffic-to-an-app-built-with-lovable)) |
| Feb 2025 | **Visual Edits**. The engineering write-up followed Mar 13, 2025 ([blog](https://lovable.dev/blog/visual-edits)) |
| Apr 24, 2025 | **Lovable 2.0**: multiplayer workspaces, the Chat Mode agent, Security Scan, Dev Mode (code editing) ([AlternativeTo](https://alternativeto.net/news/2025/4/lovable-launches-major-update-2-0-with-multiplayer-new-chat-agent-updated-design-and-more/)) |
| Jun 30, 2025 | **Agent Mode (beta)**: autonomous work with usage-based pricing ([blog](https://lovable.dev/blog/agent-mode-beta)) |
| Jul 2025 | **$200M Series A at $1.8B** (Accel). Sources disagree on the date: Wikipedia's summary lists Feb 2025 |
| Sep 2025 | Voice mode ([AlternativeTo](https://alternativeto.net/news/2025/9/lovable-introduces-voice-mode-for-hands-free-app-and-website-building)) |
| Sep 29, 2025 | **Lovable Cloud and Lovable AI** ([blog](https://lovable.dev/blog/lovable-cloud)) |
| Oct 20, 2025 | **Shopify integration** |
| Dec 5, 2025 | **Chat mode planning and clarifying questions** ([blog](https://lovable.dev/blog/chat-mode-and-questions)) |
| Dec 18, 2025 | **$330M Series B at $6.6B** |
| Mar 19–20, 2026 | "Beyond apps": documents, data analysis, image and video, file-to-app ([TestingCatalog](https://www.testingcatalog.com/lovable-launches-ai-platform-for-document-data-and-app-creation/)) |
| Apr 27, 2026 | **iOS and Android apps** |
| May 13, 2026 | **TanStack Start SSR** becomes the default for new projects |
| May 2026 | **Creative Engine** (multi-model routing), **design previews / three directions**, **Skills**, **Subagents** (May 27) ([Blink](https://blink.new/blog/lovable-update-may-2026)) |
| Jun 2026 | $500M ARR |
| Jul 13, 2026 | **App user connectors** and a unified settings redesign |
| Aug 2026 | **Unified credit balance**; Trust Center (Aug 7); **$400M Series C at $13.3B** (Aug 12); credit check-ins (Aug 17); design systems on all paid plans and a simplified Publish dialog (Aug 19); Figma plugin (Aug 21); Slack (Aug 26); **Goal runs** of up to 10 hours (Aug 30); custom REST connectors (Aug 31) |
| Sep 2026 | Domain purchase via chat (Sep 1); password-protected preview links (Sep 4); Follow-ups replace the message queue (Sep 8); **Drafts** (Sep 9); Bitbucket sync (Sep 10); MCP client OAuth (Sep 11); **OJ** Rust preview server and Salesforce partnership (Sep 15); **Lovable API** (Sep 17); Sutro acquisition (Sep 18); **Chats and a free daily chat allowance** (Sep 21/24); Claude Opus 5.5 builds and the Blueprint Alliance (Sep 22); Security view redesign and Projects page refresh (Sep 23); brand refresh (Sep 24) ([changelog](https://docs.lovable.dev/changelog), [blog](https://lovable.dev/blog)) |

---

## 8. Ideas for Architect 2.0

**ADOPT**
- ADOPT: **One composer with a mode picker** (Chat, Plan, Build, plus a Goal option) and a keyboard shortcut. Make the cheap, safe modes (Chat free, Plan flat 1 credit) obvious, so non-technical users can "think out loud" without fear.
- ADOPT: **Design directions before code.** Show three lightweight HTML previews side by side, allow refining one up to N times, and use typography, palette and layout "question cards" for vague prompts. This is the best "UI getting built" pattern in the category and removes the blank-canvas anxiety of a first build.
- ADOPT: **Clarifying-question cards** with 2–4 options, a free-text answer, and "Skip, use defaults". Asking beats guessing, and one card is faster than a paragraph.
- ADOPT: **Activity cards with a Details drawer** (Timeline and Changes tabs) that opens in the preview pane. Non-technical users see progress; technical users can drill down to tool calls and diffs.
- ADOPT: **A live cost and time meter per message, credit check-ins, and pausing when out of credits** ("Add credits / Finish up") instead of failing silently.
- ADOPT: **A four-mode preview toolbar** (Select, Edit text, Draw, Comment) with **instant, LLM-free visual edits** through AST mapping.
- ADOPT: **A publish dialog that runs a security scan inline**, plus a snapshot publish model ("Publish changes") and a visible "unpublished changes" state.
- ADOPT: **Knowledge (workspace and project), Skills (SKILL.md), AGENTS.md, and @project cross-references.** These are portable and familiar to developers.
- ADOPT: **A clear connector taxonomy**: *Build-time context* (MCP), *App connectors* (shared credential), *End-user connectors* (per-user OAuth). This maps well onto "agentic apps".
- ADOPT: **"Expose my app as an MCP server" in one toggle.** Agent-native distribution is a strong story for an "agentic application" builder.
- ADOPT: **Approval cards for irreversible or costly actions** (buying a domain, sending emails, enabling a backend), with per-action permissions (Always / Ask / Never).

**IMPROVE**
- IMPROVE: **Make import first-class, where Lovable fails.** Offer "Import from GitHub / GitLab / ZIP / URL / Figma" on the homepage. Then run an **"Understanding your project"** step: stack detection, a dependency and route map, a generated AGENTS.md, a runnable preview, and a "what I can and can't do" report.
- IMPROVE: **Real environments.** Offer Dev → Preview (per branch or draft) → Production, **each draft or branch with an isolated database branch**, and one-click promotion. Lovable's drafts share the production database and it has no staging.
- IMPROVE: **Reverting code and data together.** Show which migrations a rollback will undo, and offer a data snapshot and restore alongside the code revert. Lovable restores code only.
- IMPROVE: **A developer mode, not just a code tab.** Include a real **terminal**, env/secrets manager, log streaming, a PR-based workflow (multiple branches, PR previews, review comments), a CLI and a local-sync option. Lovable has one active branch and no terminal.
- IMPROVE: **A dedicated Agent section.** Lovable spreads agent building across AI features, edge functions, connectors and MCP. Architect 2.0 should have a first-class **Agents** workspace:
  - pick a framework (OpenAI Agents SDK, LangGraph, CrewAI, Mastra, Vercel AI SDK, Google ADK)
  - an agent canvas or spec (instructions, tools, memory, guardrails)
  - a **playground with traces**, an **eval runner**, and deploy as API, MCP or chat widget
- IMPROVE: **Cost predictability and fairness.** Give an estimate before a large run, let users set a hard budget per task, and **don't charge for fixing errors the agent introduced** (detect "regression fix" turns). This turns the biggest competitor complaint into a selling point.
- IMPROVE: **Secure by default, not scan after.** Generate RLS or authorization policies with every table. Block publishing on critical findings by default for non-technical users, with a plain-English "why this matters".
- IMPROVE: **Dual-persona onboarding.** Ask one question ("Have you written code before?") that sets defaults such as density, whether diffs show, whether the terminal is visible, and plan-first versus build-first. Keep a **Simple ↔ Pro** toggle in the top bar, rather than hiding power features under a generic **More** menu.
- IMPROVE: **Native mobile output** (Expo / React Native with device QR preview). Lovable builds web apps only, even from its mobile app.
- IMPROVE: **Stable naming.** Lovable renamed Agent to Build and Chat to Plan, then added a new Chat. Pick names that describe outcomes ("Ask", "Plan", "Build") and keep them.

**AVOID**
- AVOID: **A single credit pool that can pause a production backend** when build credits run out. Separate "runtime" billing from "build" billing, or at least grant a grace period with warnings.
- AVOID: **Export-only Git and one-way-door choices** (backend provider, region) without a prominent warning. Show irreversibility at the moment of choice.
- AVOID: **Opaque "Try to fix" loops.** After two failed automatic fixes, force a root-cause Plan step automatically and show a "the same error has happened 3 times" banner.
- AVOID: **Burying 10+ critical tools** (Cloud, Security, Payments, Analytics, Domains) under **More**. Give backend, deploy and security persistent, glanceable status in the workspace chrome, such as a status strip: DB ● Auth ● Deploy ● Security ●.
- AVOID: **Paywalling code visibility for learners.** Let every user read code, and paywall advanced editing or automation instead. Transparency builds trust with both audiences.
- AVOID: **Template, design-system and design-template sprawl.** Offer one "Start from…" concept (Template, Design system, Existing repo, Figma, Screenshot, URL) in a single picker.

---

## Sources

**Primary (Lovable)**
- https://docs.lovable.dev/changelog
- https://docs.lovable.dev/llms.txt
- https://docs.lovable.dev/introduction/dashboard-overview.md
- https://docs.lovable.dev/introduction/getting-started.md
- https://docs.lovable.dev/introduction/create-an-account.md
- https://docs.lovable.dev/introduction/credits-and-usage
- https://docs.lovable.dev/introduction/subscription-plans.md
- https://docs.lovable.dev/introduction/lovable-for-enterprise.md
- https://docs.lovable.dev/features/projects/editor.md
- https://docs.lovable.dev/features/projects/chat.md
- https://docs.lovable.dev/features/projects/preview.md
- https://docs.lovable.dev/features/preview-toolbar.md
- https://docs.lovable.dev/features/projects/history.md
- https://docs.lovable.dev/features/projects/settings.md
- https://docs.lovable.dev/features/projects/remix.md
- https://docs.lovable.dev/features/drafts.md
- https://docs.lovable.dev/features/code-mode.md
- https://docs.lovable.dev/features/agent-mode
- https://docs.lovable.dev/features/plan-mode.md
- https://docs.lovable.dev/features/chat-mode.md
- https://docs.lovable.dev/features/chats.md
- https://docs.lovable.dev/features/goal-runs.md
- https://docs.lovable.dev/features/subagents.md
- https://docs.lovable.dev/features/knowledge.md
- https://docs.lovable.dev/features/skills.md
- https://docs.lovable.dev/features/cross-project-referencing.md
- https://docs.lovable.dev/features/design-guidance
- https://docs.lovable.dev/features/design-systems.md
- https://docs.lovable.dev/features/business/design-templates.md
- https://docs.lovable.dev/features/cloud.md
- https://docs.lovable.dev/features/database.md
- https://docs.lovable.dev/features/authentication.md
- https://docs.lovable.dev/features/jobs.md
- https://docs.lovable.dev/features/logs.md
- https://docs.lovable.dev/features/advanced-settings.md
- https://docs.lovable.dev/features/ai.md
- https://docs.lovable.dev/features/agent-integrations.md
- https://docs.lovable.dev/features/payments.md
- https://docs.lovable.dev/features/security.md
- https://docs.lovable.dev/features/security-view.md
- https://docs.lovable.dev/features/browser-testing.md
- https://docs.lovable.dev/features/testing.md
- https://docs.lovable.dev/features/project-monitoring.md
- https://docs.lovable.dev/features/analytics.md
- https://docs.lovable.dev/features/seo-aeo.md
- https://docs.lovable.dev/features/publish.md
- https://docs.lovable.dev/features/hosting.md
- https://docs.lovable.dev/features/custom-domain.md
- https://docs.lovable.dev/features/generate-files.md
- https://docs.lovable.dev/features/workspace.md
- https://docs.lovable.dev/prompting/prompting-debugging
- https://docs.lovable.dev/integrations/introduction.md
- https://docs.lovable.dev/integrations/chat-connectors.md
- https://docs.lovable.dev/integrations/app-user-connectors.md
- https://docs.lovable.dev/integrations/supabase.md
- https://docs.lovable.dev/integrations/github.md
- https://docs.lovable.dev/integrations/git-sync-overview.md
- https://docs.lovable.dev/integrations/figma.md
- https://docs.lovable.dev/integrations/build-with-url.md
- https://docs.lovable.dev/integrations/lovable-mcp-server
- https://docs.lovable.dev/integrations/lovable-mobile-app.md
- https://docs.lovable.dev/integrations/desktop-app.md
- https://docs.lovable.dev/integrations/lovable-for-slack.md
- https://docs.lovable.dev/tips-tricks/external-deployment-hosting.md
- https://lovable.dev/pricing
- https://lovable.dev/templates
- https://lovable.dev/cloud
- https://lovable.dev/blog
- https://lovable.dev/blog/lovable-cloud
- https://lovable.dev/blog/agent-mode-beta
- https://lovable.dev/blog/chat-mode-and-questions
- https://lovable.dev/blog/chat-for-free
- https://lovable.dev/blog/series-b
- https://lovable.dev/blog/visual-edits
- https://lovable.dev/blog/faster-previews-oj
- https://lovable.dev/blog/2025-01-30-how-to-launch-and-get-traffic-to-an-app-built-with-lovable

**Secondary (news, reviews, community)**
- https://techcrunch.com/2026/08/12/lovable-confirms-new-13-3b-valuation-raises-another-400m/
- https://techcrunch.com/2026/04/28/lovable-launches-its-vibe-coding-app-on-ios-and-android/
- https://en.wikipedia.org/wiki/Lovable_(company)
- https://till-freitag.com/en/blog/lovable-2-roadmap-recap-en
- https://blink.new/blog/lovable-update-may-2026
- https://www.totalum.app/blog/lovable-pricing-2026
- https://www.trustpilot.com/review/lovable.dev
- https://www.zite.com/blog/lovable-reviews
- https://www.nxcode.io/resources/news/lovable-review-2026
- https://altar.io/lovable-vs-bolt-vs-v0-vs-replit-vs-base44/
- https://blog.tooljet.com/lovable-vs-bolt-vs-v0/
- https://mantlr.com/blog/how-to-use-lovable-2026
- https://axonbuild.com/blog/lovable-agent-mode
- https://momen.app/blogs/why-lovable-projects-keep-breaking-and-how-to-fix-them/
- https://www.validmvps.studio/blog/import-existing-github-repo-into-lovable/
- https://mcp.directory/blog/lovable-mcp-server
- https://www.testingcatalog.com/lovable-launches-ai-platform-for-document-data-and-app-creation/
- https://alternativeto.net/news/2025/4/lovable-launches-major-update-2-0-with-multiplayer-new-chat-agent-updated-design-and-more/
- https://alternativeto.net/news/2025/2/lovable-launches-visual-edits-update
- https://alternativeto.net/news/2025/2/lovable-announces-lovable-launched--a-platform-for-lovable-apps-discovery
- https://hunted.space/product/lovable-visual-edits
- https://mattpalmer.io/posts/2025/05/CVE-2025-48757/
- https://www.superblocks.com/blog/lovable-vulnerabilities
- https://vibegraveyard.ai/story/lovable-public-buckets/
- https://news.ycombinator.com/item?id=47182659
- https://news.ycombinator.com/item?id=44671194
- https://apps.apple.com/us/app/lovable-build-apps-with-ai/id6757471107
- https://www.primary.studio/work/lovable
- https://medium.com/@chidolueebube/lovable-ai-visual-brand-analysis-368e20812473
- https://livemy.app/blog/lovable-custom-domain
