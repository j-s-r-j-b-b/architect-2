# Emergent (emergent.sh): Competitive Research for Architect 2.0

**Researched:** 2026-09-25 | **Product URL:** https://emergent.sh (app at https://app.emergent.sh) | **Docs:** https://help.emergent.sh

> **Method and caveats.** I did not sign up or log in anywhere. Everything below comes from Emergent's own site, docs, blog and pricing page, press coverage (TechCrunch, BusinessWire/WebWire, Sacra), and hands-on reviews and tutorials written by third parties. Many help-center pages load client-side, so some doc pages only returned their navigation. Where a UI detail comes from one third-party review, or where I inferred a layout from tutorial wording, I say so. **(unverified)** marks claims I could not confirm from a primary source. Emergent ships something new roughly every month, so dates are noted throughout.

---

## 0. Snapshot (TL;DR)

- **What it is:** a browser-based, chat-first "agentic vibe-coding" platform. A team of specialised agents (planner/architect, designer, developer, integrations, testing, deploy) builds **full-stack web apps** (React + FastAPI + MongoDB) and **native mobile apps** (Expo/React Native) from a brief. It then **tests, deploys and hosts** them on Emergent's infrastructure. Source: https://help.emergent.sh/ and https://www.closefuture.io/blogs/deep-dive-emergent-ai-vibe-coding-platform
- **Signature ideas:**
  1. The agent **asks clarifying questions before it builds**.
  2. **Testing sub-agents** check the work before you see it.
  3. A **Universal LLM Key** puts GPT, Claude and Gemini inside generated apps, billed in Emergent credits.
  4. **Forking** starts a fresh context window when a chat gets too long.
  5. A **per-task credit budget** caps spend.
  6. **Agent tiers** (E-1 → E-1.1 → E-1.5 → E-2 → E-3, plus Prototype and Mobile) let users trade speed against depth.
- **Traction (company-reported, verified in press):**
  - Launched publicly around June 2025, YC S24.
  - About **$100M ARR by Feb 2026** and **$120M ARR with 200K+ paying customers by Jul 2026**.
  - **$130M Series C at a $1.5B valuation (Jul 15, 2026)**, about $230M raised in total.
  - Sources: https://techcrunch.com/2026/07/15/indian-ai-coding-startup-emergent-becomes-a-unicorn-just-over-a-year-after-launch/ and https://techcrunch.com/2026/02/17/emergent-hits-100m-arr-eight-months-after-launch-rolls-out-mobile-app
- **Biggest weaknesses:**
  - Credit burn that nobody can predict, and debug loops that you pay for.
  - Generic-looking UI design.
  - Context loss across forks.
  - A black box during deploys.
  - Refund and support friction. Trustpilot is split, about 2.8/5 over 626 reviews.

---

## 1. Positioning: what makes Emergent different

- **"Engineering team in a box," not "screen generator."** Emergent pitches a **multi-agent team** that plans, builds, tests and deploys. Competitors like Lovable and v0 feel more like one prompt producing one screen. The CEO described it as "basically getting an engineering team in a box" (TechCrunch, Jul 2026: https://techcrunch.com/2026/07/15/indian-ai-coding-startup-emergent-becomes-a-unicorn-just-over-a-year-after-launch/). The E-2 launch put it as "a product manager, UX designer, developer in your pocket" (https://www.webwire.com/ViewPressRel.asp?aId=347685).
- **Covers the whole lifecycle after the code is written.** Lightspeed's partner framed the edge as enabling "the post-development lifecycle of deployment, sharing, bug fixing, and support with AI" (Sep 2025: https://finance.yahoo.com/news/emergent-raises-23m-lightspeed-let-140000354.html). Hosting, domains, Universal Key, rollback and Super Deployer all make the platform the runtime, not just the code generator.
- **Web and native mobile from one tool.** It has a dedicated Mobile agent (Expo). E-3 can build web and mobile in one monorepo. Per TechCrunch, 80–90% of new projects involve mobile **(unverified; Sacra claim)** (https://sacra.com/c/emergent/, https://emergent.sh/blog/introducing-e-3-autonomous-app-building-on-emergent).
- **Real, exportable code on a conventional stack.** The stack is React/Tailwind/shadcn frontend, FastAPI backend and MongoDB. You can view it in a browser VS Code, push it to GitHub, or download it. The lock-in points are the Universal Key (`emergentintegrations` package, `EMERGENT_LLM_KEY`) and Emergent hosting (https://github.com/emergentbase/emergentintegrations, https://kuberns.com/blogs/deploy-emergent-app-to-production/).
- **Built for SMBs and non-developers first.**
  - About 70% of users have no prior coding experience and about 40% are small businesses (TechCrunch, Feb 2026).
  - Customers include trucking companies, factories, construction firms and property managers (TechCrunch, Jul 2026).
  - Emergent sampled 50K+ deployed business apps and found "almost none were built by a development team" (https://emergent.sh/blog/emergent-smb-report, Jul 22, 2026).
- **Growing past app building:**
  - **Wingman**, a messaging-first autonomous work agent on WhatsApp, Telegram and iMessage (Apr 2026).
  - An **MCP connector** so users can build from Claude or ChatGPT (Jun 2026).
  - **Emmy**, a free in-product helper (Jul 2026).
  - Sources: https://techcrunch.com/2026/04/15/indias-vibe-coding-startup-emergent-enters-openclaw-like-ai-agent-space/, https://emergent.sh/blog/emergent-mcp-connector, https://emergent.sh/blog/emergent-emmy-launch
- **Weakness the company admits:** design consistency across AI-built sites (TechCrunch, Jul 2026). The CEO calls software *quality* the biggest threat to vibe coding (Mar 2026: https://www.aol.com/news/emergents-ceo-told-us-2-060200522.html).

---

## 2. Who uses it and why (jobs-to-be-done)

**Non-technical users (the large majority):**
- SMB operators replace spreadsheets and email workflows with custom software: booking pages, storefronts, CRMs, inventory, client portals, rent collection. Only "1 in 7 operators felt satisfied with existing market software." For "1 in 3," the app replaced nothing because no affordable option existed before (https://emergent.sh/blog/emergent-smb-report).
- Solo founders build a monetisable MVP with login and Stripe from one brief (https://emergent.sh/learn/best-vibe-coding-tools, https://emergent.sh/tutorials/how-to-integrate-stripe-into-your-web-application).
- People who want a phone app in the App Store or Play Store without learning Xcode or Expo.
- Agencies, PMs and ops teams deliver client tools faster (https://emergent.sh/build).
- **Why they choose it:**
  - The agent asks questions instead of guessing.
  - Hosting, SSL and domains are built in.
  - The Universal Key means no API accounts to set up.
  - It feels like hiring a team rather than using a tool.

**Technical users (a minority, but served):**
- Developers and technical founders who want a fast full-stack scaffold with a real backend, then take it over via GitHub or VS Code (https://help.emergent.sh/faqs).
- Pro users who want **1M-token context**, **Ultra Thinking**, **system-prompt editing** and **custom agents** (https://emergent.sh/pricing).
- Developers who use Emergent **from inside Claude Code or Codex** through the MCP server, with `claude mcp add` or `codex mcp add` (https://help.emergent.sh/emergent-as-mcp).
- **Friction for developers:**
  - Cloud-only; there is no local dev loop. Hack'celeration lists "cloud-only operation with no local dev."
  - The stack is mostly fixed (MongoDB default; no Flutter, Swift or Kotlin).
  - The agent makes architecture decisions on its own (https://justinmckelvey.com/blog/emergent-vs-lovable).
- One critic argued the opposite for non-developers. Exposing Python libraries and code is wrong for vibe coders ("code-centric philosophy") (LinkedIn, around Sep 2025: https://www.linkedin.com/posts/stephansmithbc93_tried-out-emergentsh-this-week-i-have-noticed-activity-7374849961949143040-55r9).

---

## 3. Complete feature inventory

### 3.1 Onboarding and auth (for Emergent's own users)
- Sign in with **Google, GitHub, email, Facebook**, and phone per the homepage (https://www.banani.co/blog/emergent-ai-review, https://emergent.sh).
- According to Banani, the first screen asks you to log in before you can prompt, unlike some competitors. Hack'celeration says you "build straight from the homepage prompt." Both are probably true: you type on the marketing page, then get sent to login **(inferred)**.
- The onboarding survey asks which other vibe-coding tools you use (Banani).
- No credit card is needed for the free plan (10 credits/month). The free plan is limited to personal, non-commercial use (https://omidsaffari.com/blog/emergent-review).

### 3.2 Homepage and prompt entry
- A big prompt box: "What will you build today?" The box grows as you type.
- Quick-start chips such as **Clone YouTube, Task Manager, AI Pen, Surprise Me** (https://work-management.org/software-development/emergent-review/).
- A **build-type selector**: **Full Stack App / Mobile App / Landing Page** (https://app.emergent.sh/landing/start-building/, Banani).
- **Attachments:** images, UI screenshots and PDFs, plus a GitHub repo connection (Banani).
- An **agent selector dropdown** (E-1, E-1.1, E-1.5, E-2, E-3, Prototype, Mobile). A **model selector** (Claude Sonnet/Opus variants, GPT-5.x, Gemini) with an **"Ultra Thinking"** mode on Pro (https://help.emergent.sh/mobile-app-development, https://www.closefuture.io/blogs/deep-dive-emergent-ai-vibe-coding-platform).
- An **"Advanced Controls"** section with:
  - Integration toggles: Supabase, Notion, custom servers.
  - A **template** choice: "Full Stack" (recommended) or "Base Python".
  - A **credit budget per task**.
  - A **"Select MCP Tools"** button that opens the MCP config.
  - A privacy (private project) toggle.
  - Sources: search summaries of the Elevoras Medium walkthrough; https://solstleblog.com/how-to-use-emergent-ai/; Banani.
- **Voice mode:** a microphone icon in the bottom toolbar. It works on web and mobile (https://help.emergent.sh/voice-mode).
- **Special chips:** the "MoltBot/OpenClaw" chip provisions a hosted OpenClaw agent (https://emergent.sh/tutorials/moltbot-on-emergent, Jan 2026).
- Trending app prompts and showcase apps sit below the box (for example "My Counter Part", "Bill Generator", "Word of the Day").
- **Start button:** "Start Task" (https://help.emergent.sh/mobile-app-development).

### 3.3 Agent lineup

| Agent | Purpose (as documented) | Notes |
|---|---|---|
| **E-1** | Stable, production-ready full-stack builds | The original flagship. Sessions typically run 10–15 min. |
| **E-1.1** | Faster, modular, **backend first**, with optional frontend later | Cheaper; needs more input from you. Some guides call it the default for CRUD apps. |
| **E-1.5** | "Advanced structured builds" | Pro users (FAQ) |
| **E-2** (Dec 9, 2025) | Tests the hard parts first (OAuth flows, scrapers, Stripe webhooks) **before building the frontend** | 30–35% faster builds. Roles: PM, UX/UI, dev, QA, DevOps. |
| **E-3** (Jun 8, 2026, beta, Pro only) | Autonomous multi-hour builds. Brainstorm interview → phase-numbered plan you approve → **"Mission Control"** live progress → agents verify the app themselves | About 30% more tokens than E-1. Can build web and mobile in one monorepo. Pause, resume or redirect mid-build. |
| **Prototype** | Speed over stability; frontend mockups | "looks okay" over "edge-case correct" |
| **Mobile** | Expo/React Native + FastAPI + MongoDB | **Paid plans only** |
| **Custom agents** (Pro) | Your own agent with a custom system prompt, tools and sub-agents | See 3.8 |

Sources:
- FAQ: https://help.emergent.sh/faqs
- E-2: https://pulse2.com/emergent-secures-google-ai-futures-fund-investment-as-it-launches-e2-agent-and-reaches-25-million-arr/ and https://www.webwire.com/ViewPressRel.asp?aId=347685
- E-3: https://emergent.sh/blog/introducing-e-3-autonomous-app-building-on-emergent
- Agent guidance: https://simplifyaitools.com/blog/emergent-ai-review-vibe-coding/

Sacra says E-2 is "powered by Claude 3.5 Sonnet" **(unverified, likely outdated)**.

Models Emergent announced on its platform:
- GPT-5.3 Codex (Mar 3, 2026), GPT-5.4 (Mar 9), Claude Opus 4.6 (Mar 18).
- "Fable 5" (Anthropic's "Mythos-class" model per Emergent's blog; launched Jun 9, paused Jun 12 over export controls, back Jul 1, 2026).
- Claude Opus 5.5 and GPT-6 Sol/Astra per the Sep 2026 news page.
- Sources: https://emergent.sh/blog, https://emergent.sh/blog/fable-5-the-next-shape-of-app-building, https://emergent.sh/news

Emergent's stated direction is **E-3 as an orchestrator**. A strong "judgment" model plans and reviews, and cheaper models do routine execution (Fable 5 post).

### 3.4 Chat and agent interaction
- **Clarifying questions come first.** Documented examples (https://help.emergent.sh/first-app, https://emergent.sh/tutorials/start-vibecoding-as-a-beginner):
  - "Should I use the Universal LLM Key or your own API key?"
  - "Do you want user authentication?"
  - "Any specific design framework or color preferences?"
  - "Should I start building or do you want to discuss more?"
- Reviewers saw the agent "summarise your request, then ask key questions" about auth, analytics, calendar integration and payments (work-management.org).
- **E-3's interview** covers platform priority (web or mobile), whether billing in the MVP should work or be a placeholder, and whether you have API credentials. The goal is to avoid stalls mid-build.
- **A plan before code.** E-3 produces a phase-numbered plan with tradeoffs. Buttons let you approve and start Phase 0 (proof of concept), skip the proof of concept, or adjust scope. Guides also recommend "Don't code until I approve" for other agents (simplifyaitools).
- **Progress shown as it streams:**
  - Checklist-style updates: "✓ Created project structure ✓ Set up MongoDB database ✓ Building frontend components" (first-app doc).
  - Status lines like "Installing dependencies", "Generating FastAPI routes", "Running backend tests", plus which files are being created or edited (work-management.org).
  - The agent takes screenshots to check its own work (Banani).
  - Typical build time is 5–15 min; Banani saw about 10 min for the first build and about 5 min for a visual rebuild.
- **Modes:** early press mentioned a **Brainstorming mode** and an **Educational mode** that explains APIs and components (Sep 2025, Yahoo/TechCrunch). Newer docs don't clearly show whether these are still separate modes **(unverified)**. There is no documented Lovable-style "plan / ask only" toggle. The planning phase is built into how the agent works.
- **Budget control:**
  - A per-chat **budget** sits under the message box.
  - The counter climbs as the agent works.
  - At the cap, the agent **pauses and asks** whether to continue, raise the cap or stop.
  - A **(+) icon at the top of the chat** raises the budget.
  - One reviewer reports a default of about 5 credits per run, adjustable up to a ceiling. Sources give a 500–1,000 credits/task maximum **(sources conflict)**.
  - Sources: https://help.emergent.sh/articles/769724-credits-and-pricing (search excerpt), https://omidsaffari.com/blog/emergent-review
- **"Wake Up Agent" button:** appears when the agent or environment has gone to sleep. It can take a few minutes to restart (https://vibeanswers.com/emergent/agent-stuck-burning-credits/).
- **Pausing:** E-3 builds can be paused, resumed or redirected. The MCP connector also has `pause_job`.
- **Emmy:** a free assistant that answers questions about the product. Its chat bubble sits bottom-right on every page. It turns vague ideas into build-ready prompts, explains agent choices, debugs from screenshots, reports remaining credits and whether they will cover the project, and guides deployment. It doesn't read your code (Jul 31, 2026: https://emergent.sh/blog/emergent-emmy-launch).

### 3.5 Live preview and visual editing
- **Preview link** to the running app, hosted at `*.preview.emergentagent.com` (many public examples, e.g. https://client-portal-42.preview.emergentagent.com/). Emergent's glossary also mentions an `emergent.app` default URL **(inconsistent naming)** (https://emergent.sh/glossary/deployment).
- **Preview limits:**
  - Browser previews **time out after about 30 minutes** (Banani; Hack'celeration).
  - Preview has less CPU and RAM than production.
  - **Preview and production databases are separate** (https://omidsaffari.com/blog/emergent-review, https://emergent.sh/glossary/deployment).
- **Mobile preview:** scan a QR code with **Expo Go**. The iOS app has a full-screen preview with hot reload (App Store notes via search).
- **Visual Edits** (Sep 16, 2026: https://emergent.sh/blog/introducing-visual-edits):
  - Turn on **edit mode from the bottom navigation** of the preview.
  - Click an element to open a panel. From there you can rewrite text; change color, typography, borders and layout; swap images; delete elements; add effects; or "describe a layout change in plain words."
  - You can select several elements or whole sections.
  - Edits **queue up with a running counter** in the bottom nav. You review the list, then click **Apply**, and the agent applies them all in one batch. Emergent says this is cheaper than sending edits one at a time.
- Before Visual Edits, reviewers complained that small visual tweaks needed a full agent round-trip (about 5 min), and that requests like "3D icons" were ignored (Banani).
- Not documented: a device-size toggle inside the web preview, an in-preview console, or a URL bar **(unverified)**. The docs tell users to open the browser devtools (F12) and paste console errors into chat (first-app doc).

### 3.6 Code view, editor and terminal
- **Browser VS Code:** "Preview in VS Code" (or the Code button) creates a **secure link plus a temporary password** to a browser-based VS Code (code-server). The Explorer shows `backend/` (server.py, .env, requirements.txt) and `frontend/` (src, components, config) (search summary of the HostAdvice hands-on review).
- It's standard VS Code: file explorer on the left, editor in the center, terminal at the bottom, with syntax highlighting and linting (work-management.org). Some reviews describe the preview on the right; that probably means the separate preview panel **(layout partly inferred)**.
- **Download:** in the code viewer, right-click a folder → **Download** to get a .zip (https://zeabur.com/docs/en-US/get-started/migration/emergent).
- Emergent's help center has a "VS Code Modules" article. A VS Code extension for local access is mentioned in search snippets **(unverified; page content not retrievable)**.
- **Runtime:** each task runs in its own **Kubernetes pod** with root inside the container. State is backed up to object storage and restored in 2–6 s. A warm pool gives startup under 8 s. It has scaled to 30K+ concurrent environments (Mar 3, 2026: https://emergent.sh/blog/real-environments-for-ai-agents-and-why-we-bet-on-kubernetes). Pro gets "2× larger machine" (plans doc).

### 3.7 Backend (database, auth, storage, functions)
- **Default stack:** FastAPI (Python, async) on port 8001 with `/api` routes; MongoDB via motor; React + Tailwind + shadcn frontend. Next.js is mentioned for some builds. Env files hold `REACT_APP_BACKEND_URL` and `MONGO_URL`. Source: a reportedly leaked E-1 system prompt, Oct 2025, **unofficial**: https://github.com/EliFuzz/awesome-system-prompts/blob/main/leaks/emergent/2025-10-15_prompt.md
- **Auth for end users:**
  - The agent offers a built-in **"Emergent OAuth" / Google Social Login**. It asks which provider, whether login is required, and where to store data (MongoDB suggested).
  - It generates login and registration pages and per-user history (https://emergent.sh/tutorials/how-to-integrate-stripe-into-your-web-application, https://www.nocode.mba/articles/ai-app-builder-emergent).
  - Emergent's own comparison says it generates role-based views (client / designer / owner) (https://emergent.sh/learn/cline-vs-cursor).
- **Other databases:** a Supabase toggle and playbook (Postgres). **Self-hosted / bring-your-own database** is an Enterprise feature (https://emergent.sh/pricing).
- **Storage:** file uploads work in generated apps (Emergent claims). There is no dedicated storage UI **(unverified)**.
- **Cron and background jobs:** not documented for apps. The OpenClaw flow supports scheduled tasks written in natural language **(unverified for general apps)**.
- **No database browser, schema view or table editor was found** in any source. Data is reached through code or chat **(gap)**.

### 3.8 AI features inside generated apps, and agent building
- **Universal Key (LLM key)** (announced around Aug 2025: https://x.com/mukundjha/status/1955275583656489066):
  - One credential for **GPT, Claude, Gemini** text; **image generation** (Nano Banana, GPT-Image-1); and **vision**. It doesn't support audio or other generation types.
  - Usage comes out of Emergent credits, with **Top-Up** and **Auto-Recharge** thresholds.
  - Location: **Account icon → Account Settings → "Universal Key"**, where you can view, disable or regenerate it. An **"LLM Providers"** screen toggles models on or off. Or just ask the agent to use it (https://help.emergent.sh/universal-key).
  - Under the hood: the `emergentintegrations` PyPI package, `EMERGENT_LLM_KEY` and `sk-emergent-*` keys. After export you decide whether to keep it or switch to your own provider keys.
- **Custom agents (Pro)** are **your own Emergent build/worker agents**. They are not LangGraph or CrewAI agents inside your app (https://emergent.sh/tutorials/build-custom-ai-agents-for-beginners).
  - You fill in a 5-part system-prompt template: Persona, Task, Context, Workflow, Guidelines.
  - Built-in tools: Web Search, File Reader, Screenshot, plus read-only Default Tools.
  - **Sub-agents** are delegated specialists with restricted tools.
  - Your agent then appears in the agent list on the landing page.
  - Pro also allows **system prompt editing**.
- **Marketing claims about AI agents inside apps:**
  - Sales, research, support and ops agents built by "describe → review → test → deploy."
  - Publish to a URL or embed as a copilot.
  - Channels: Slack, Teams, Discord, Intercom, Zendesk, website widget.
  - Data: Drive, OneDrive, Dropbox, Notion, Postgres, Mongo.
  - Source: https://emergent.sh/ai-agent-builder
- **No framework choice** (LangGraph, CrewAI, OpenAI Agents SDK, etc.) is documented. Agents are just Python code the build agent writes **(gap and opportunity for Architect)**.
- **OpenClaw/MoltBot one-click** (Jan 31, 2026):
  - Provisions a 24/7 agent on a cloud VM in 2–8 min.
  - A **"Channels"** tab connects Telegram (BotFather token plus pairing code) and WhatsApp (QR code).
  - A **"Control UI"** manages the agent. **Deploy sits top right.**
  - Scheduled tasks are set up in plain English (https://emergent.sh/tutorials/moltbot-on-emergent).
- **Wingman** (Apr 15, 2026) is a separate product: a background work agent you talk to over WhatsApp, Telegram or iMessage. It connects to 300+ apps (Gmail, Calendar, Slack, Drive, GitHub, Notion, CRM), with **approval gates for external sends, public posts, permission grants and destructive changes** (https://emergent.sh/blog/building-security-into-wingman-from-the-start).

### 3.9 Integrations, connectors, MCP, APIs and secrets
- **Playbooks** are "verified, pre-tested configurations." An integration sub-agent (`integration_playbook_expert_v2` in the leaked prompt) uses them instead of installing SDKs by hand.
  - Documented playbooks: Airtable, Calendly, Stripe, Razorpay, Supabase, OpenAI, Claude, Gemini, Giphy, Slack, Resend, SendGrid, Twilio, ElevenLabs, Google Suite, plus custom APIs (https://help.emergent.sh/).
  - Marketing lists 100+ integrations across 11 categories (https://emergent.sh/integrations).
- **Secrets:** the agent asks for keys in chat, then stores them in `.env`. Docs say "treat API keys like passwords." Secrets are *not* pushed to GitHub (https://help.emergent.sh/using-apis-on-emergent). Env vars and secrets can also be managed after deployment. **There's no dedicated secrets vault UI in the builder (unverified).** Pasting live Stripe keys into chat is the documented flow, which is a security and UX smell.
- **MCP inside the builder:** Advanced Controls → "Select MCP Tools" to configure MCP servers.
- **Emergent as an MCP server:** `https://mcp.emergent.sh/`, set up from Claude, ChatGPT (developer mode), Claude Code or Codex CLI.
  - 8 tools: `create_job`, `wait_for_job`, `send_message`, `list_jobs`, `get_job_status`, `get_recent_trajectories`, `get_job_preview`, `pause_job`.
  - Claude shows a **live job card with an embedded preview**.
  - Deploying still happens inside Emergent (https://help.emergent.sh/emergent-as-mcp, Jun 22, 2026).
  - There is also an Emergent connector in "Claude for Small Business" (https://emergent.sh/news).

### 3.10 GitHub and version control
- **Connect:** Profile icon → **"Connect GitHub"** → authorize on GitHub (Standard plan and up).
- **Push:** **"Save to GitHub"** button in the chat area → create a new repo or pick an existing one → pick a branch → **"PUSH TO GITHUB"**. Commit messages are written automatically (https://help.emergent.sh/github-integration, https://feature1.ai/blog/export-emergent-project-to-github/).
- **Pull:** GitHub button on the chat screen → **"Pull from GitHub"** → repo → branch → import.
- The docs recommend pulling the latest before each session and using branches (e.g. `experimental-ui`) to avoid conflicts.
- **Fix for a broken connection:** GitHub Settings → Applications → remove Emergent → reconnect (FAQ). There is **no automatic two-way sync**; saving is manual. There is also no PR, diff-review or branch-switcher UI in the builder **(unverified)**.

### 3.11 Importing existing projects
- **GitHub import** works via "Pull from GitHub." The docs don't say how well it handles stacks that aren't React, FastAPI and Mongo **(unverified)**.
- **Screenshots, images and PDFs** can be attached to the prompt so the agent can copy a design (Banani). A Figma integration can bring in brand colors and spacing (https://emergent.sh/integrations/figma). Neither is a dedicated "import" flow.
- **No zip-upload or clone-from-URL flow** is documented **(unverified)**.

### 3.12 Deploy, hosting, custom domains and environments
- **Flow:** test in Preview → **Deploy** (top right) → **"Deploy Now."** A **Pre-Deployment Health Check** agent flags problems first. The app goes live at `*.emergent.host` in about 5–15 min (docs vary) (https://emergent.sh/tutorials/how-to-deploy-your-app-on-emergent, FAQ).
- **Cost:** **50 credits per month per deployed app**, covering infrastructure, SSL, monitoring and env vars. Some pages say "50 credits once," which confuses buyers (https://omidsaffari.com/blog/emergent-review). Redeploys are free, rolling back a deployment is free, and you can **shut down** an app to stop the charge. Deployed apps are listed on the **Home tab**.
- **Environments:** Preview and Production are separate, databases included. Changes in preview go live only after you redeploy.
- **Custom domains:** Deployments → **Custom Domain** → **"Link Domain"** → enter the domain → **Next** → add the A record Emergent gives you (TTL 300, and only ONE A record) → **"Check Status"** (5–15 min).
  - Since May 2026 you can **buy a domain in-product through IONOS, free for the first year**, with DNS and SSL set up automatically (https://emergent.sh/blog/how-to-buy-a-custom-domain-on-emergent).
- **Infrastructure:**
  - Deploy engine **V3** (Jul 24, 2026) has 7 steps: fetch source → build image → prepare DB → deliver secrets → apply K8s resources → health-check → switch traffic.
  - Deploys are **blue-green with immutable run records**. Rollback doesn't need a rebuild. Multi-region GDPR support is included (https://emergent.sh/blog/why-we-rebuilt-our-deployment-engine).
  - **Super Deployer** (Jul 2, 2026) is a fallback agent. When a deploy fails, it reads the code and logs, writes custom K8s manifests, and retries up to 3 times. Success rose from about 85% to **98.5–99%**.
  - The user still sees only a vague waiting message ("this is taking a while, sit back and relax"). Emergent itself calls this a "black box" (https://emergent.sh/blog/super-deployer-ai-app-deployment-success).
- **Mobile:** Expo/EAS (see 3.19).

### 3.13 Versions, history, rollback and forking
- **Rollback:** a "Rollback" option on **each step in your messages**. After you choose it, you can erase **both messages and code**, or **messages only and keep the code** (https://help.emergent.sh/articles/944837-rollback-feature, search excerpt). Rollback **does not clearly include the database** **(unverified)**.
- **Forking:**
  - Each plan has a context cap: about **200K tokens on Standard and 1M on Pro**. Emergent **warns you** as you get close.
  - A **Fork** starts a new task with a fresh context window. The code is kept, but the chat history is not (https://emergent.sh/glossary/context-limits).
  - Fork tasks is a Standard+ feature. Emergent's own guide also frames fork as a "save a working version before a risky edit" checkpoint.
- **What users say:**
  - "Conversation forking and spawning of a new environment post forking can drive you crazy" (Product Hunt).
  - Forking "loses context, disconnects databases" (Trustpilot, Jul 2026).
  - Guides recommend **Save to GitHub before each milestone** as the real backup (FAQ).

### 3.14 Debugging, auto-fixing and testing
- **Testing sub-agents:** a backend testing agent (`deep_testing_backend_v2` in the leaked prompt) runs after the backend is built. Per the leaked prompt, frontend (UI) testing ran **only with the user's permission** because it is expensive.
- Emergent's marketing says a "testing agent [runs] before you see anything" (https://emergent.sh/learn/lovable-vs-replit).
- **E-3 "agentic verification"** has no human in the loop. The testing agent clicks through the app like a user, sends failures to the right agent, and re-checks. **Completion cards** show "what was built, what was tested, and what passed."
- **Self-diagnosis:** the agent reads backend logs and takes screenshots to fix issues (No Code MBA; Banani).
- **Known failure mode:** loops where the agent "announces a fix for the same bug, bug persists" and every attempt is billed. Recommended recovery: stop → Rollback → Save to GitHub → re-prompt one small task with the exact error (https://vibeanswers.com/emergent/agent-stuck-burning-credits/).
- One Trustpilot user was charged to fix the same Google login bug "233+ times" over 12 weeks. Another says the AI "claimed to have made changes that were not actually implemented" (Trustpilot).

### 3.15 Security
- **Platform:** SOC 2 and ISO 27001 badges (https://emergent.sh). Code is "private, encrypted, and not used for AI training" (FAQ).
- **Apps:** there is **no built-in security scanner** for generated apps, according to a third-party scanner vendor who has a commercial interest (https://vibeappscanner.com/question/how-secure-emergent). Common problems: Supabase without RLS, API keys in client code, and unprotected endpoints.
- A review notes that neither Emergent nor Lovable does a "security review before launch" (https://justinmckelvey.com/blog/emergent-vs-lovable). Emergent "self-flags as unsuitable for regulated finance, health or compliance work" (Hack'celeration).
- Early press mentioned an "AI Code Review" that scans for quality issues (https://www.webtonative.com/blog/what-is-emergent-ai) **(unverified as a user-facing feature)**.

### 3.16 Analytics, monitoring and logs
- Emergent says deployments come with "traffic/error dashboards, health monitoring" (https://emergent.sh/learn/lovable-vs-replit). No third-party walkthrough shows this dashboard **(unverified detail)**.
- Enterprise lists "usage analytics" and audit logs. Users have no deploy log view; the Super Deployer post admits there is no progress tracking during deploys.

### 3.17 Collaboration, teams, sharing and remixing
- **Business tier** (custom price): RBAC, SSO, **shared team workspaces**, **real-time co-editing**.
- **Enterprise tier:** user-level credit limits, audit logs, self-hosted database, priority SLA, user groups, VPC deployment, usage analytics (https://emergent.sh/pricing).
- An older **Team plan** (Dec 2025) cost $300/month billed annually, with 5 members and 1,250 pooled credits (https://emergent.sh/learn/best-collaborative-ai-app-builders-for-teams). It seems to have been folded into Business/Enterprise by mid-2026.
- On lower tiers, you collaborate by sharing through GitHub (FAQ).
- **Sharing:** you can share the preview link. Deployed apps carry a "Made with Emergent" badge that links back with a UTM tag (https://help.emergent.sh/). **No public remix gallery was found (unverified).**

### 3.18 Templates and community
- Quick-start chips, trending prompts and showcase apps on the home screen.
- A large tutorial library (https://emergent.sh/tutorial), a Discord (support within hours), and an affiliate program.
- Hundreds of SEO "AI ___ builder" landing pages.
- There is no community template marketplace comparable to Lovable's or Replit's **(unverified)**.

### 3.19 Mobile apps
- The **Mobile agent** (paid plans) builds with Expo/React Native + FastAPI + MongoDB. It supports camera, location and push notifications, and **OTA updates** via `eas update`. Flutter, Swift, Kotlin and native code changes after launch are not supported (https://help.emergent.sh/mobile-app-development).
- **Preview** uses Expo Go and a QR code. Banani also saw deploy options for "Permanent app access via Expo Go," **IPA** (iOS), and **APK/AAB** (Android).
- **Publishing** to the stores, per the docs, is done by the user with `eas build` and `eas submit`, plus Apple ($99/year) and Google ($25) developer accounts. Review takes about 1–3 days on iOS and 1–7 days on Android.
- Emergent's marketing and TechCrunch (Feb 2026) say the mobile app can **publish directly to the App Store and Play Store**. Third parties call this the "native gap" (https://superapp.dev/blog/emergent-app-builder-review-2026-pricing-reviews-native-gap). **These claims conflict.**
- **Web ↔ Mobile** conversion is a documented advanced feature. E-3 builds both in one monorepo.
- **Emergent's own iOS app**, "Emergent AI: Vibe Code Apps":
  - First release around Aug 28, 2025; v1.0.17 around Sep 2026; 250k+ downloads.
  - You can build by text or voice, get a real-time preview, deploy with one tap, and sync with desktop.
  - Recent notes: Android/iOS build generation, "guided discovery tabs for free users," "mobile agent quick select," and full-screen preview with hot reload.
  - Written reviews average about 2.3/5, mostly credit complaints (https://mwm.ai/apps/emergent-ai-vibe-code-apps/6748029391).

### 3.20 Pricing and credits (Sep 2026)

| Plan | Price | Credits/month | Key inclusions |
|---|---|---|---|
| Free | $0 | 10 | Core platform, web/mobile building*, "advanced models", one-click LLM integration |
| Standard | $20/mo ($17 annual) | 100 | Private projects, GitHub, fork tasks, Mobile agent, deployments |
| Pro | $200/mo ($167 annual) | 750 | 1M context, Ultra Thinking, system-prompt editing, custom agents, 2× machine, priority support, E-3 |
| Business | Custom | — | RBAC, SSO, shared workspaces, real-time co-editing |
| Enterprise | Custom | Pooled | Audit logs, user credit limits, self-hosted DB, VPC, SLA, usage analytics |

\*The mobile docs say the Mobile agent needs a paid plan, which contradicts the pricing page.

Sources: https://emergent.sh/pricing, https://help.emergent.sh/plans-and-credits

- **Top-ups:** 5 credits for $1 (intro), 100/$20, 250/$50, 500/$100, 3,000/$500 (20% bonus), 6,000/$1,000. Top-up credits never expire; monthly credits reset. Older pages list $10 per 50.
- **Other charges:** 50 credits/month per deployed app. Universal Key LLM calls also draw on credits. Emmy is free.
- **Everything spends credits:** chat, planning, code, tests, deploys and loading context. **No estimate is shown before a task runs.** From a third party: "No console that tells you this prompt will cost 18 credits" (https://dev.to/grewup/emergent-ai-pricing-explained-credits-plans-how-not-to-waste-money-ddc).
- **Typical costs (third-party estimates):** landing page + form 10–20; auth 25–40; Stripe 35–60; a debug loop 30–50 per round (https://hackceleration.com/labs/compare/replit-vs-emergent).
- **Promotions** like "FLAT 95% OFF" first month (landing banner). Some users report being charged more than the advertised promo price (Trustpilot).
- **Revenue model:** subscriptions, usage-based top-ups, and deployment/hosting fees. The CEO says gross margins improve every month (TechCrunch, Feb 2026).

### 3.21 Enterprise
- SOC 2, ISO 27001, SSO, RBAC, audit logs, VPC deployment, self-hosted DB, user-level credit limits, usage analytics, priority SLA, multi-region/GDPR deploys (pricing page; deploy-engine blog).

---

## 4. UI layout

> Assembled from docs, Emergent tutorials and third-party reviews. **I could not see the logged-in app directly.** Items marked *(inferred)* come from tutorial wording, not screenshots.

**Visual language:**
- A **dark theme** builder, minimal and text-heavy (work-management.org; HostAdvice).
- The marketing landing uses "cloud-themed background imagery" with a clean, minimal layout.
- The UI is **chat-first and dense with agent logs**: tool steps, file edits, test results.
- An early critic reported "white on white" labels (around Sep 2025). Generated apps are described as "minimal, but not premium" (Banani).

**A. Home / dashboard (logged in)**
- **Center:** the headline prompt box, "What will you build today?" Inside or under it:
  - Build type (Full Stack App / Mobile App / Landing Page)
  - Attachment (paperclip), GitHub connect/import, microphone (voice)
  - Agent dropdown (E-1…E-3 / Prototype / Mobile / custom agents)
  - Model selector with Ultra Thinking
  - **Advanced Controls** (integrations, template, budget, MCP tools, private toggle)
  - **Start Task** button
- **Below the box:** quick-start chips (Clone YouTube, Task Manager, AI Pen, Surprise Me), trending or example apps, and special chips like MoltBot/OpenClaw.
- **Home tab** lists your tasks/projects and **deployed apps** (deploy tutorial).
- **Top bar:** credit balance and buy-credits entry, plus a **profile icon**. The profile menu holds Connect GitHub and Account Settings (sidebar: Universal Key, LLM Providers, billing).
- **Bottom-right:** the **Emmy** chat bubble.
- Each task may open as its own **browser-style tab** in a top tab strip next to "Home" **(unverified: recalled from 2025 product imagery, not confirmed in sources fetched this session)**.

**B. Builder / workspace (one task)**
- **Main or left:** the **agent chat**.
  - The agent greets you on the left after "Start Building."
  - Your messages sit next to agent turns that include clarifying-question prompts, plans, streamed status and checklist items, file create/edit entries, screenshots, and test results.
  - Each step has a **Rollback** option.
- **Chat bottom:** the message input with attachments and mic, plus the **budget indicator** below it. A **(+)** at the top of the chat raises the budget.
- **Chat-area action buttons:** **Save to GitHub** / GitHub (Pull from GitHub), **Preview**, **Code / "Preview in VS Code"**, **Fork** (Standard+). **Deploy** sits **top right**, confirmed in Emergent's OpenClaw tutorial and consistent with the deploy guide.
- **Right:** the **live preview panel**. One tutorial says "live preview panel on the right" while "the left panel lists every component it is building" (https://solstleblog.com/how-to-use-emergent-ai/). A preview can also open as a standalone URL. Visual Edits adds an **edit-mode toggle and change counter with Apply** in the preview's bottom navigation.
- **Agent asleep:** a **Wake Up Agent** button appears.
- **E-3 variant:** the chat becomes a **Mission Control** view with streaming phase and completion cards (built / tested / passed) and **pause / resume / redirect** controls. It ends with a delivery card holding the test summary, **preview link** and **Deploy** button.

**C. Code view.** Opens as a **separate browser VS Code** (new tab plus password). Explorer on the left, editor in the center, terminal at the bottom. You can right-click a folder to download it.

**D. Deployments panel** *(inferred panel structure)*. Deploy status, env vars and secrets, **Custom Domain → Link Domain / buy domain**, rollback, and shut down.

**E. Mobile app (iOS)**
- A prompt screen with voice input and a **mobile agent quick select**.
- **Guided discovery tabs** for free users.
- A full-screen preview with hot reload, one-tap deploy, and sync with desktop.

---

## 5. Step-by-step user flows

**5.1 Sign up → first app (Full Stack, E-1/E-2)**
1. Land on emergent.sh. Type an idea in the hero prompt or click **Get Started / Start Building**.
2. Sign in with Google, GitHub, email or phone. Answer the onboarding survey ("what other tools do you use").
3. On Home: pick **Full Stack App** and an agent and model. Optionally open **Advanced Controls** to set the budget, toggle integrations and choose MCP tools. Attach screenshots or PDFs if you have them. Click **Start Task**.
4. The agent restates the brief and **asks clarifying questions**: Universal Key or own key, auth, design and colors, "start building or discuss more?" You answer in chat.
5. The build streams:
   - Status and checklist lines ("Created project structure → Set up MongoDB → Building frontend components → Installing dependencies → Generating FastAPI routes → Running backend tests").
   - File edits and screenshots.
   - A budget counter climbing.
   - This takes 5–15 min. The leaked prompt suggests a frontend with mock data comes first for an "aha" moment, then the backend and contracts, then tests **(unofficial)**.
6. The agent posts a summary and a **preview link**. Test in the preview (it times out after about 30 min).
7. **Iterate** with specific prompts ("make covers 20% larger"), or use **Visual Edits**: click elements, queue changes, click **Apply**.
8. **Errors:** paste console errors (F12) or screenshots. The agent reads the logs and fixes. If it loops: **Rollback** to a good step → Save to GitHub → re-prompt one small task. If the agent is asleep: **Wake Up Agent**.
9. **Budget hit:** the agent pauses and asks. Raise the budget with **(+)** or buy a top-up.
10. **Context near the limit:** you get a warning, then **Fork** into a new task with the code kept.

**5.2 Add database and auth**
- MongoDB is there by default, so there is no setup step.
- For auth, ask "add OAuth." The agent asks which provider (it recommends Emergent's Google Social Login), whether login is required, and where to store data. It then edits `backend/server.py` and adds login/register pages.
- For Postgres, turn on the Supabase toggle or playbook.

**5.3 Add payments (Stripe)**
- Prompt for Stripe plus tiers and "use test keys."
- The agent asks for test or live mode and the keys, which you paste into chat.
- It builds a pricing page, checkout and feature gating. You test with 4242 4242 4242 4242, then paste live keys (https://emergent.sh/tutorials/how-to-integrate-stripe-into-your-web-application).

**5.4 Connect GitHub**
- Profile → **Connect GitHub** → authorize.
- In the chat: **Save to GitHub** → new or existing repo → branch → **PUSH TO GITHUB**.
- Push again at each milestone (manual).

**5.5 Deploy and custom domain**
- **Deploy** (top right) → pre-deployment health check → **Deploy Now**. Wait about 5–15 min; if it runs long, you see "sit back and relax."
- The live URL is `*.emergent.host`, costing 50 credits/month.
- Deployments → Custom Domain → **Link Domain**. Either buy through IONOS (free first year, automatic DNS) or enter your own domain → add the A record → **Check Status**.
- Later changes: edit in preview → **redeploy** (free). Roll back a deployment for free, or shut it down to stop charges.

**5.6 Import an existing project**
- In the chat, click the GitHub button → **Pull from GitHub** → repo → branch.
- The code is imported into the task's environment and you keep prompting.
- Save back with Save to GitHub. There is no guided "analyze repo / detect stack" step **(unverified)**.

**5.7 Mobile app**
- Paid plan → Home → agent dropdown **Mobile** → describe the app → **Start Task**.
- Preview via an Expo Go QR code.
- Download builds (IPA/APK/AAB) or publish with `eas build` / `eas submit`. OTA updates via `eas update`.

**5.8 Autonomous build (E-3, Pro)**
- Choose **E-3** → brainstorm interview → **review the plan** (approve Phase 0, skip the POC, or adjust scope) → watch **Mission Control** (pause, resume, redirect) → delivery card (test summary + preview + Deploy).

**5.9 Custom agent (Pro)**
- Define a persona, task, context, workflow and guidelines.
- Choose tools (web search, file reader, screenshot) and add sub-agents with restricted tools.
- Save it. The agent shows up in the landing-page agent list for future tasks.

**5.10 Build from Claude or ChatGPT (MCP)**
- Add the connector `https://mcp.emergent.sh/` and approve 3 permissions.
- In chat: "build me X." A live job card with an embedded preview appears.
- Send feedback, check status, or pause. Go to Emergent to deploy.

**5.11 Collaboration**
- **Standard/Pro:** share through a GitHub repo and branches; "always pull the latest before starting."
- **Business:** shared workspaces with real-time co-editing and RBAC. No public walkthrough of the co-editing UI was found **(unverified)**.

---

## 6. UX strengths and pain points

### Strengths (what users love)
- **It asks before it builds.** Clarifying questions and E-3's plan approval cut down on wrong guesses. Reviewers see this "deliberate friction" as a strength (https://omidsaffari.com/blog/emergent-review).
- **Full-stack apps that actually work.** Product Hunt reviewers note "clean code," "high-quality output," and non-technical founders shipping on their own (4.6/5, 14 reviews: https://www.producthunt.com/products/emergent-2/reviews). A G2 reviewer called the frontend and backend "genuinely premium quality" (via superapp.dev).
- **Self-testing and self-debugging.** The agent reads logs and screenshots, and E-3 verifies in the browser by itself.
- **No API setup.** The Universal Key removes the "create an OpenAI account" hurdle for adding AI features.
- **Hosting, domains and SSL included.** You can even buy a domain free for the first year inside the product. Deploy success is now about 99%.
- **Honest context handling.** The fork approach explicitly admits the context limit instead of letting quality silently degrade (closefuture).
- **One tool for web and native mobile**, plus building from your phone.
- **Batch-then-apply Visual Edits** is a good pattern: fewer paid round-trips.
- **Fast support** on Discord or when a human steps in (Trustpilot positives).

### Pain points (with evidence)
- **Credit burn and unpredictable cost.** This is the #1 complaint.
  - "110 credits did not even last a day" (eesel).
  - Someone went from 2,150 to 10 credits in a day with the site "not even 20% done" (Trustpilot app.emergent.sh, Aug 2026).
  - There's no estimate before a task; debugging regressions the AI caused still costs money; monthly credits expire.
  - Sources: https://www.eesel.ai/blog/emergent-ai-pricing, https://www.trustpilot.com/review/app.emergent.sh
- **Stranded mid-build behind a credit wall:** "I'll set a budget, but sometimes I end up stuck partway through" (via superapp.dev).
- **Bug loops and false "done" claims.** The same Google-login bug was billed "233+ times"; the AI "claimed to have made changes that were not actually implemented" (Trustpilot, Jul and Sep 2026).
- **Lost context and lost work.**
  - Forking "loses context, disconnects databases."
  - An app disappeared after an outage with "no recovery option, no export, and no version history" (Jan 2026).
  - A Product Hunt reviewer lost all code across two accounts (Trustpilot; Product Hunt).
- **Design quality.** "Minimal, but not premium." CTA overlapping sections, misaligned icons, style requests ignored (Banani). The company admits this weakness (TechCrunch, Jul 2026).
- **Slow loops.** About 10 min for a first build and about 5 min for a minor visual change (before Visual Edits). The preview times out after 30 min and the agent sleeps ("Wake Up Agent," with waits of up to 15 min reported).
- **Deploy is a black box.** There is no progress tracking; "sit back and relax" (Emergent's own post). Early success was about 85%. Plus confusion over whether the 50-credit deploy fee is monthly or one-time.
- **Mobile "native gap."** Store submission still needs EAS and developer accounts, despite the "publish directly" marketing.
- **The jump from $20 to $200** leaves no middle tier (closefuture). The free tier of 10 credits "barely covers one screen" (Hack'celeration).
- **Billing, refunds and support.** A no-refund stance, AI-only first-line support, promo pricing mismatches, and renewals after cancelling. One user escalated to AFCA (Trustpilot). **Trustpilot for emergent.sh: 2.8/5 over 626 reviews, 48% one-star and 38% five-star** (https://www.trustpilot.com/review/emergent.sh, fetched 2026-09-25).
- **Less control for developers.** The agent makes architecture choices on its own; there is no diff review, local dev, or database UI. Credentials get pasted into chat.

---

## 7. Recent notable launches (2025–2026)

| Date | Launch |
|---|---|
| May 27, 2025 | Public "agentic vibe-coding platform" launch (HN / Launch YC). 10K+ apps in the first two weeks of alpha. |
| ~Aug 2025 | **Universal Key** for LLMs inside apps |
| Aug 28, 2025 | iOS app first released (per mwm.ai) |
| Sep 24, 2025 | $23M Series A (Lightspeed). About $15M ARR in 90 days; 1M+ users |
| Dec 9, 2025 | **E-2 agent** (tests integrations first; 30–35% faster). Google AI Futures Fund; $25M ARR |
| Jan 20, 2026 | $70M Series B (SoftBank VF2, Khosla) at $300M; $50M ARR; 5M+ users |
| Jan 31, 2026 | One-click **OpenClaw/MoltBot** hosted agents (Telegram/WhatsApp channels) |
| Feb 17, 2026 | **$100M ARR**; 6M users, 150K paying; **mobile app for building (iOS/Android)** |
| Mar 2026 | Kubernetes agent-environment post; GPT-5.3 Codex, GPT-5.4, Claude Opus 4.6 added |
| Apr 15, 2026 | **Wingman** (messaging-first autonomous work agent); 8M builders, 1.5M MAU |
| May 13, 2026 | **Buy a custom domain in-product** (IONOS, free first year) |
| Jun 8, 2026 | **E-3** autonomous multi-hour builds, Mission Control (beta, Pro) |
| Jun 9 / Jul 1, 2026 | "Fable 5" model on Emergent (paused Jun 12 for export controls) |
| Jun 22, 2026 | **Emergent MCP connector** (build from Claude, ChatGPT, Claude Code, Codex) |
| Jul 2, 2026 | **Super Deployer** (deploy success from about 85% to about 99%) |
| Jul 15, 2026 | **$130M Series C, $1.5B valuation**; $120M ARR; 200K+ paying; about 200 staff |
| Jul 24, 2026 | **Deploy engine V3** (blue-green, immutable runs, multi-region GDPR) |
| Jul 31, 2026 | **Emmy**, a free in-product assistant |
| Sep 16, 2026 | **Visual Edits** (click, queue, batch-apply) |
| Sep 2026 | Claude Opus 5.5 and GPT-6 Sol/Astra available via Universal Key (news page) |

Note: ARR, user and paying-customer numbers are company-reported run rates quoted in the press. They are not audited.

---

## 8. Ideas for Architect 2.0

- **ADOPT:** A **clarify → plan → approve** gate before any code. Show the agent's questions as **tappable option cards** (e.g. "Login: Google / Email / None"), not a wall of text. End with a one-screen plan (pages, data model, integrations, estimated time and cost) and **Approve / Edit / Just build it** buttons. This gives non-developers structure and developers control.
- **ADOPT:** **Agent profiles by intent, not version numbers.** Emergent's E-1/E-1.1/E-1.5/E-2/E-3 naming confuses people (YouTube explainers exist just to decode it). Offer "Quick prototype / Production app / Autonomous (long-running) / Mobile / Custom agent," each with a one-line tradeoff and a cost hint.
- **IMPROVE:** **Show the cost before it's spent.** Emergent's #1 complaint is that credits are unpredictable. Show an **estimated cost range before each run**, a live meter while it runs, and "**no charge for fixing regressions the agent itself caused**" (or auto-refund when a fix fails its own tests). Keep the per-task budget cap, but make hitting it a clear dialog, not a surprise stop.
- **IMPROVE:** **Mission Control for every build**, not just Pro. Stream **phase cards** (Plan → Data → API → UI → Tests → Ready) with pass/fail checks, a timeline, and pause, resume and redirect buttons. Non-technical users see progress in plain language. Developers can expand a card to see file diffs and logs.
- **ADOPT:** **Self-testing as a first-class, visible step.** Show a "Tested: 12/12 flows passed" badge with replayable screenshots or video of the test agent clicking through the app. Let users add their own "acceptance checks" in plain English.
- **IMPROVE:** **Replace forking with invisible memory.** Emergent's forks lose context and confuse users. Keep a persistent **project brief, decisions log and architecture map** that the agent always reads. Compact the conversation automatically, and show a "memory" panel the user can edit. Only expose "branch" as a developer feature, tied to git branches.
- **ADOPT:** **Rollback on every step**, with a clear choice: "undo code + chat," "undo code only," or "undo chat only." **IMPROVE:** make it a visual **timeline of checkpoints with preview thumbnails**, and state clearly whether the **database** is rolled back too.
- **ADOPT:** **Batch-then-apply visual edits.** Click elements, queue several edits and comments, then apply them in one agent pass. **IMPROVE:** make simple property changes (text, color, spacing) **deterministic and instant, with no AI call or cost**, and send only structural changes to the agent.
- **ADOPT:** **A built-in multi-model AI key** for AI features in generated apps, so non-technical users never make an OpenAI account. **IMPROVE:** show a per-app **AI usage dashboard and spend cap**, and a one-click "switch to my own keys" before export, so there's no hidden lock-in through an SDK like `emergentintegrations`.
- **AVOID:** **Pasting secrets into chat.** Give a **Secrets vault** that pops up an inline "secure input" card when the agent needs a key. Label test and live environments (Stripe test vs live) with a clear toggle.
- **IMPROVE:** **Deploys you can watch.** Emergent itself admits its deploys are a "black box." Show the 7-step pipeline live (build → DB → secrets → health check → traffic switch) with logs for developers, and let an auto-fix agent explain what it changed. Show hosting cost clearly (per month vs one-time was a real confusion). Offer **preview vs production environments** with a "promote" button and a diff of what changes.
- **ADOPT:** **Buy or connect a domain in the product** with DNS and SSL set up automatically, plus a guided A/CNAME checker with a live "Check status" button.
- **IMPROVE:** **Two-way GitHub sync** instead of a manual "Save to GitHub." Auto-commit per checkpoint, a branch switcher, PRs created by the agent, diff review before merge, and pulling external commits back into the agent's context. Add an **"Import repo" wizard** that detects the stack, runs the app, and shows a "what I understood about your codebase" summary before editing.
- **ADOPT:** **Two-way MCP.** Architect can be *used from* Claude Code, Codex or ChatGPT (live job card + preview), and can *use* MCP tools inside builds. **IMPROVE:** add a proper CLI / local sync (`architect pull`, `architect dev`) so developers can edit locally and the agent sees their changes. That's a gap in Emergent's cloud-only model.
- **IMPROVE:** **Agent building in any framework.** Emergent's "custom agents" are only personas for its own builder, and its app-agents don't let you choose a framework. Architect should offer an **Agent Studio**: pick a framework (LangGraph, CrewAI, OpenAI Agents SDK, Mastra, Claude Agent SDK, or "no-code"), then tools, memory, triggers (cron, webhook, chat channel), eval runs and traces, then deploy with channels (Slack, WhatsApp, web widget).
- **ADOPT:** **An always-on helper separate from the builder** (like Emmy), free, answering "what does this button do / will my credits cover this / why did deploy fail." **IMPROVE:** give it read access to project state so it can actually diagnose problems, which Emmy can't.
- **ADOPT:** **Cross-device continuity.** Start on your phone by voice, keep going on desktop. Include a mobile preview via QR, with an in-browser device frame for quick checks.
- **AVOID:** **Promising "publish to the App Store" and then handing over CLI commands.** Either run a guided store-submission wizard (accounts checklist, icons, screenshots, privacy policy generator, build status) or say plainly what the user must do.
- **AVOID:** **Previews that sleep after 30 minutes** or need "Wake Up Agent" plus a wait. Keep previews warm while the tab is open, or show a clear "resuming (3s)" state.
- **AVOID:** **A dark UI crowded with agent logs** for non-developers. Use progressive disclosure: plain-language summaries by default, and "Show technical details" for developers. One idea is a **mode switch (Simple ↔ Pro)** that changes information density, not features.
- **IMPROVE:** **Design quality as a feature**, since this is a weakness Emergent admits. Before building, offer a quick **style picker with 3–4 generated mockups** or a brand-kit import (logo → palette, fonts). Then enforce that design system across pages so the result doesn't look generic.
- **ADOPT:** A **pre-deploy health check.** **IMPROVE:** add a **security scan** Emergent doesn't have (exposed keys, unauthenticated endpoints, missing RLS/roles, dependency CVEs) with one-click fixes and a "launch readiness" score.
- **AVOID:** **Opaque billing, no refunds, AI-only support**, which drag Trustpilot down to about 2.8/5. Show transparent invoices, an itemised credit history per task ("what did I pay for"), and a visible human escalation path.
- **IMPROVE:** **Collaboration** that works on every tier: share a link with view, comment or edit rights; comments pinned on preview elements; presence avatars; roles (owner, builder, viewer); and pooled team credits with per-member limits (an Emergent enterprise feature worth bringing to smaller teams).

---

## Sources

**Primary (Emergent):**
- https://emergent.sh (homepage)
- https://emergent.sh/pricing
- https://help.emergent.sh/
- https://help.emergent.sh/first-app
- https://help.emergent.sh/plans-and-credits
- https://help.emergent.sh/faqs
- https://help.emergent.sh/universal-key
- https://help.emergent.sh/mobile-app-development
- https://help.emergent.sh/emergent-as-mcp
- https://help.emergent.sh/github-integration
- https://help.emergent.sh/using-apis-on-emergent
- https://help.emergent.sh/voice-mode
- https://help.emergent.sh/articles/944837-rollback-feature
- https://help.emergent.sh/articles/769724-credits-and-pricing
- https://help.emergent.sh/articles/272715-features-and-tools
- https://emergent.sh/glossary/context-limits
- https://emergent.sh/glossary/deployment
- https://emergent.sh/blog (index)
- https://emergent.sh/blog/introducing-e-3-autonomous-app-building-on-emergent
- https://emergent.sh/blog/introducing-visual-edits
- https://emergent.sh/blog/emergent-emmy-launch
- https://emergent.sh/blog/emergent-mcp-connector
- https://emergent.sh/blog/why-we-rebuilt-our-deployment-engine
- https://emergent.sh/blog/super-deployer-ai-app-deployment-success
- https://emergent.sh/blog/real-environments-for-ai-agents-and-why-we-bet-on-kubernetes
- https://emergent.sh/blog/fable-5-the-next-shape-of-app-building
- https://emergent.sh/blog/emergent-smb-report
- https://emergent.sh/blog/how-to-buy-a-custom-domain-on-emergent
- https://emergent.sh/blog/building-security-into-wingman-from-the-start
- https://emergent.sh/blog/how-our-pricing-engine-evolved-from-an-if-ladder
- https://emergent.sh/tutorials/how-to-deploy-your-app-on-emergent
- https://emergent.sh/tutorials/start-vibecoding-as-a-beginner
- https://emergent.sh/tutorials/build-custom-ai-agents-for-beginners
- https://emergent.sh/tutorials/how-to-integrate-stripe-into-your-web-application
- https://emergent.sh/tutorials/moltbot-on-emergent
- https://emergent.sh/ai-agent-builder
- https://emergent.sh/integrations
- https://emergent.sh/integrations/github
- https://emergent.sh/integrations/figma
- https://emergent.sh/build
- https://emergent.sh/news
- https://emergent.sh/learn/lovable-vs-replit
- https://emergent.sh/learn/best-vibe-coding-tools
- https://emergent.sh/learn/cline-vs-cursor
- https://emergent.sh/learn/best-collaborative-ai-app-builders-for-teams
- https://app.emergent.sh/landing/start-building/
- https://x.com/mukundjha/status/1955275583656489066
- https://github.com/emergentbase/emergentintegrations

**Press and funding:**
- https://techcrunch.com/2026/07/15/indian-ai-coding-startup-emergent-becomes-a-unicorn-just-over-a-year-after-launch/
- https://techcrunch.com/2026/02/17/emergent-hits-100m-arr-eight-months-after-launch-rolls-out-mobile-app
- https://techcrunch.com/2026/01/20/indian-vibe-coding-startup-emergent-raises-70m-at-300m-valuation-from-softbank-khosla-ventures/
- https://techcrunch.com/2026/04/15/indias-vibe-coding-startup-emergent-enters-openclaw-like-ai-agent-space/
- https://finance.yahoo.com/news/emergent-raises-23m-lightspeed-let-140000354.html
- https://pulse2.com/emergent-secures-google-ai-futures-fund-investment-as-it-launches-e2-agent-and-reaches-25-million-arr/
- https://www.webwire.com/ViewPressRel.asp?aId=347685
- https://sacra.com/c/emergent/
- https://stripe.com/customers/emergent
- https://www.aol.com/news/emergents-ceo-told-us-2-060200522.html
- https://www.aol.com/articles/emergents-ceo-says-vibe-coding-040202431.html
- https://www.ycombinator.com/launches/NZl-emergent-build-ambitious-apps
- https://news.ycombinator.com/item?id=44109919

**Reviews, tutorials and user sentiment:**
- https://www.banani.co/blog/emergent-ai-review
- https://work-management.org/software-development/emergent-review/
- https://hostadvice.com/ai-app-builders/emergent-review/ (via search excerpts; direct fetch blocked)
- https://www.closefuture.io/blogs/deep-dive-emergent-ai-vibe-coding-platform
- https://hackceleration.com/labs/compare/replit-vs-emergent
- https://hackceleration.com/labs/review/emergent
- https://omidsaffari.com/blog/emergent-review
- https://www.eesel.ai/blog/emergent-ai-pricing
- https://dev.to/grewup/emergent-ai-pricing-explained-credits-plans-how-not-to-waste-money-ddc
- https://simplifyaitools.com/blog/emergent-ai-review-vibe-coding/
- https://solstleblog.com/how-to-use-emergent-ai/
- https://justinmckelvey.com/blog/emergent-vs-lovable
- https://superapp.dev/blog/emergent-app-builder-review-2026-pricing-reviews-native-gap
- https://vibeanswers.com/emergent/agent-stuck-burning-credits/
- https://vibeappscanner.com/question/how-secure-emergent
- https://www.nocode.mba/articles/ai-app-builder-emergent
- https://www.webtonative.com/blog/what-is-emergent-ai
- https://feature1.ai/blog/export-emergent-project-to-github/
- https://zeabur.com/docs/en-US/get-started/migration/emergent
- https://kuberns.com/blogs/deploy-emergent-app-to-production/
- https://www.trustpilot.com/review/emergent.sh
- https://www.trustpilot.com/review/app.emergent.sh
- https://www.producthunt.com/products/emergent-2/reviews
- https://mwm.ai/apps/emergent-ai-vibe-code-apps/6748029391
- https://www.linkedin.com/posts/stephansmithbc93_tried-out-emergentsh-this-week-i-have-noticed-activity-7374849961949143040-55r9
- https://github.com/EliFuzz/awesome-system-prompts/blob/main/leaks/emergent/2025-10-15_prompt.md (unofficial, reportedly leaked system prompt; used only for behaviour hints)
