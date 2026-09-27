# 01 — architect.new (Lyzr Architect): Competitive Research, final

> **Research date:** 2026-09-26 (final pass; this replaces the earlier drafts).
> **Target:** the **current** Architect at https://architect.new. Architect 2.0 must match it feature for feature and then extend it for developers.
>
> **Method.** I re-read the official docs page by page (docs.architect.new, including every changelog entry; the latest is still **v2.2.0, 2026-08-07**). I read the public, logged-out architect.new pages in a browser on 2026-09-26: the landing page, the pricing modal (Plans and Top Up tabs), the For Work menu, a persona page, /enterprise and /resources. I did not sign up, log in or submit anything. Other sources:
> - 13 official Lyzr tutorial transcripts on tella.tv (dated 2026-04-24 to 05-03);
> - Lyzr enterprise docs (docs.lyzr.ai) for the Studio layer that sits under Architect;
> - launch press, Product Hunt and funding coverage;
> - third-party reviews;
> - one public, hands-on teardown of the real product written by an assignment candidate.
>
> **Confidence labels:**
> - **[doc]** official Architect docs;
> - **[lyzr-doc]** Lyzr platform or Studio docs;
> - **[observed]** I saw it on the public site on 2026-09-26;
> - **[tutorial]** an official Lyzr video, April–May 2026, *before* the June 2026 UI revamp, so labels may have changed;
> - **[3P-hands-on]** a single third-party user's first-hand notes;
> - **(unverified)** inferred or not confirmed.

---

## 0. TL;DR and framing notes

- **Maker: confirmed as Lyzr AI.** Lyzr Inc. is headquartered in Jersey City, NJ, with engineering in Bengaluru, and was founded in 2023 by Siva Surendira (CEO) and Anirudh Narayan (https://techcrunch.com/2026/07/09/an-ai-agent-startup-just-let-its-agent-run-its-100-million-fundraise/; https://thenextweb.com/news/lyzr-ai-agent-100-million-series-b). The architect.new header shows the Lyzr logo, and the footer links to Lyzr privacy, security and terms pages [observed]. The docs call the product "Lyzr Architect" (https://docs.architect.new/introduction/overview/introduction). The browser tab still reads **"Architect Beta"** [observed].
- **What it is: an enterprise "Text-to-App" / agentic vibe-coding builder.** One prompt produces three layers:
  1. **Plan:** a PRD, a mockup, a workflow diagram, skill files and PDF/PPT exports.
  2. **Agents:** real Lyzr Agent Studio agents with tools, a knowledge base (KB) and guardrails.
  3. **App:** a Next.js/React web app with an auto-provisioned NoSQL database (MongoDB, per the tutorial) and email/password auth, hosted on a Lyzr subdomain.

  Sources: https://docs.architect.new/build/build-guide, https://docs.architect.new/build/database-auth, https://www.tella.tv/video/set-up-databases-auth-with-architect-8dwg.
- **Where it sits in the Lyzr stack.** Lyzr describes the build-and-run stack in layers:
  - Agent Framework: the runtime, accessed through the Python/TypeScript Agent Development Kit (ADK) or a REST API;
  - Agent Studio: the builder, which exposes every agent as an OpenAPI 3.1 REST endpoint plus gRPC stubs;
  - Architect: the application layer on top (https://docs.lyzr.ai/enterprise/get-started/architecture.md).

  Sibling products are OpenController, a control plane for agent spend launched 2026-09-16; Agentic OS; and Sovereign AI. The open-source projects are OpenGAP/GitAgent and Cognis memory (https://www.lyzr.ai/).
- **Positioning line:** "What if N8N and Lovable have a baby" is the Product Hunt maker framing (https://www.producthunt.com/products/architect/launches). The landing subtitle says "The Agent Builder Platform for Business Executives & Consultants" [observed]. The enterprise page says "Democratize agent building for non-technical users" [observed].
- **Naming trap.** The current product already ships releases numbered **v2.0.0 to v2.2.0** (June–August 2026). The assignment's "Architect 2.0" is a different thing, so a codename in the deliverable avoids confusion. Two other name collisions:
  - https://github.com/shreyas-lyzr/architect is a GitAgent CLI assistant, not architect.new;
  - HackerEarth's "Lyzr AI Architect Challenge" (May–July 2025) was a Studio hackathon (https://www.hackerearth.com/challenges/hackathon/lyzr/).
- **Competitive signal for the deliverable.** At least 10 public repos are "Architect 2.0" take-home submissions, described as a "Lyzr TPM assignment": HeyImAnuj/architect-2, eppisai/architect-2, shivamATpaytm/Architect-2.0, shambhu-10/lyzr, abhikatkar/architect-2, not-your-averagetechie/architect-2, Vinay-rajpal/Lyzrarchitect, adminthelinkai/lyzr-architect-2-tpm, Abhay-SKulkarni123/Lyzr, and jainsaurav13/custom-lyzr-studio.
  - Their ideas repeat heavily: dual "lenses"/"lanes" (guided vs code), chat left and preview right, a framework switcher (LangGraph, CrewAI, OpenAI Agents SDK), repo-import analysis, pre-flight checks and rollback. One is literally titled "one project, two lenses".
  - **The examiner has seen these patterns many times.** Parity is table stakes; differentiation must come from flow quality and first-principles fixes to the pain points in §6.
  - Nothing from those repos' proposed designs is attributed to the real product here. Only shambhu-10/lyzr contains a first-hand teardown of the real Architect, cited as [3P-hands-on].

### 0.1 Corrections to the earlier drafts (verification log)
- **Wrong:** "the how-it-works page names Claude as the code-generation backbone". Neither how-it-works nor the introduction page names any builder model. The only model list in the docs is the FAQ's stale "GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro" (https://docs.architect.new/references/faqs.md). The builder's model remains **(unverified)**.
  - Indirect hint only: Lyzr's own OpenController release says Anthropic usage was "$36,000 of the company's $50,000 monthly AI tools budget". That figure is company-wide, not Architect's (https://www.einpresswire.com/article/942704499/).
- **Free plan credits conflict.** The live pricing modal says "Free credits included" [observed]. The docs say the Free plan has "No monthly credits" (https://docs.architect.new/introduction/essentials/plans-credits.md). The amount is not disclosed.
- **New: Top Up packs** of **$25, $50 and $100**, each a one-time purchase, sit in the pricing modal's Top Up tab [observed].
- **The enterprise hero is a prompt box**, not just a "Browse Prompt Library" CTA. It reads "State your problem or the agent description that you want to build." The nav adds **Explore admin dashboard** [observed].
- **New: persona landing pages** at `/for/<persona>` (for example /for/ai-agencies) show a **prompt box before sign-in** with a paperclip, microphone and send buttons, three suggestion cards and "Browse Prompt Library" [observed].
- **"What should I build?" sits in the home sidebar**, not in the centre of the page (https://docs.architect.new/introduction/platform/ai-consultant.md).
- **Hosting domain.** The docs' example is `travel-planner.architect.new`. A live generated app was observed on an auto-generated **`*.architect.space`** subdomain (`code-quest-mega-gear-97jp.architect.space`, a Next.js app) [observed]. That suggests auto-generated URLs live on architect.space; the current default is (unverified).
- **Also new:**
  - the plan state label **"Plan Ready"**;
  - planning can be **skipped** via Start Building;
  - the preview is called **"Live App"**;
  - the AI Consultant buttons are **Continue → Update and Explore → Build This**;
  - Studio capabilities: A2A, SuperFlow, the Hallucination Manager, voice engines;
  - funding facts;
  - the hands-on teardown findings.

---

## 1. Positioning — what makes it different

- **Agent-first, not app-first.** Lovable, Bolt and v0 generate a web app and leave "the AI part" to you. Architect designs the **multi-agent system** first: a manager agent plus sub-agents, tools, RAG, memory and guardrails. Only then does it wrap that system in a UI. The docs put it this way: "Building an app is no longer about writing boilerplate — it's about orchestrating intelligence" (https://docs.architect.new/introduction/overview/why-architect.md).
- **Plan before code.** Every new app starts in **Brainstorming & Planning mode**. It asks multiple-choice questions, then produces a live PRD with an agent table, a mockup, a workflow diagram, skill files, PDF/PPT exports and starter files (https://docs.architect.new/build/planning-brainstorming.md).
- **A full agent platform underneath.** Every agent is a Lyzr Agent Studio agent, and edits sync both ways. Studio adds:
  - tools, KB (including Semantic Model and Text-to-SQL), memory (Cognis) and Responsible AI;
  - the Hallucination Manager, which runs reflection, groundedness and context-relevance checks;
  - simulations and evaluation;
  - RBAC and audit logging, and A2A interoperability.

  Sources: https://docs.lyzr.ai/llms.txt, https://docs.lyzr.ai/enterprise/get-started/architecture.md.
- **Governance story for enterprises:** RBAC, approvals, audit logs, guardrails, VPC or on-prem hosting, and an admin view that "know[s] what your employees are building" (https://www.architect.new/enterprise [observed]). Lyzr claims HIPAA and SOC 2 compliance and SSO/SAML at platform level (https://docs.lyzr.ai/enterprise/get-started/intro.md).
- **Blueprint library.** Lyzr claims "more than 1,000 prebuilt production-grade blueprints"; the build animation starts with "Finding the best enterprise-grade blueprint" (https://siliconangle.com/2026/02/06/exclusive-startup-lyzr-ai-launches-app-builder-aimed-moving-agents-production-volume/; [observed]).
- **Self-correction loop plus a Testing agent.** "A built-in QA loop runs the code Architect generates… it rewrites the code" (https://docs.architect.new/introduction/overview/introduction.md). The browser **Testing agent** arrived in v2.2.0 (https://docs.architect.new/changelog/v2-2-0.md).
- **Git-native, portable agents (GitAgent, beta).** The agent lives as SOUL/RULES/DUTIES/agent.yaml/skills/memory/knowledge files in the user's repo. It is based on OpenGAP (MIT, about 3k GitHub stars), whose CLI `opengap export --format` targets Claude Code, OpenAI, CrewAI, Gemini, GitHub Copilot, Cursor, Lyzr and more (https://docs.architect.new/build/git-agents.md; https://github.com/open-gitagent/gitagent-protocol).
- **"Platform plus people" delivery.** Enterprise deals include Forward Deployed Engineers and Agentic Transformation Consultants (https://natlawreview.com/press-releases/lyzr-launches-architect-first-enterprise-grade-text-agent-platform-building).
- **Honest scope.** The docs say Architect is *not* for "pure static websites", "simple CRUD apps with no AI component" or "heavy real-time multiplayer apps" (https://docs.architect.new/introduction/overview/best-use-cases.md).

## 2. Who uses it and why (jobs-to-be-done)

**Non-technical users are the primary audience.** They include business executives, consultants, ops, sales, marketing and HR leads, insurance underwriters and AI agencies. The For Work menu lists Architect Enterprise, AI Agencies, Analysts, Sales Teams, Marketing Teams, Insurance Underwriters and HR Teams [observed].
- **JTBD 1: "I know my bottleneck, not the solution."** The **AI Consultant** interviews the user (role → time-sinks → tools → goals) and returns 3 agent proposals with hours saved per week (https://docs.architect.new/introduction/platform/ai-consultant.md).
- **JTBD 2: "Automate a cross-tool workflow"** such as Apollo → HubSpot → Slack, or Gmail → CRM. There are 106 use-case pages across Sales, Marketing, Operations, Support, Engineering, Finance, HR, AI Infrastructure, Voice AI, Outreach and CRM (https://www.architect.new/resources [observed]).
- **JTBD 3: "Show stakeholders a working demo plus a spec or deck today."** Artifacts (a feature-spec PDF, decks, research docs, HTML/Word) are generated from the project's context (https://docs.architect.new/build/artifacts.md).
- **JTBD 4, agencies:** "Build AI agents for your clients in minutes… white-label the output" (https://www.architect.new/for/ai-agencies [observed]). Custom branding is still marked "Soon".
- **JTBD 5, enterprises:** "Let employees build agents without losing governance" (https://www.architect.new/enterprise [observed]).
- **Deal evidence:** Accenture (an investor, which runs a 200+ agent system) and KPMG are cited users. The target sectors are banking, insurance and consulting (SiliconANGLE; press release).

**Technical users are secondary.** Lyzr positions **Agent Studio** as the developer tool: "Architect gets you from an idea to a working, deployed app in minutes. Studio is where you go afterward to deepen and harden the intelligence" (https://docs.architect.new/introduction/platform/architect-vs-studio.md). The CEO says developers "also use it extensively" (secondary, via search).
- **What developers get today inside Architect:**
  - GitHub sync (auto-commit, pull/push, branch switching) and import of a Next.js repo;
  - environment variables and MCP servers;
  - GitAgent;
  - code export ("Frontend uses React/Next.js; backend utilizes Python/Lyzr SDK for self-hosted deployment", https://docs.architect.new/references/faqs.md).
- **Why people choose it:**
  - it plans first and makes the agent layer visible ("No black boxes");
  - built-in tools need no API keys ("No environments, API keys, or framework decisions to make", why-architect);
  - one Lyzr account covers both Architect and Studio;
  - enterprises get VPC hosting and governance.

## 3. Complete feature inventory, by area

### 3.1 Onboarding and builder auth
- The logged-out home page *is* the sign-in card: "Sign in to start building with Architect.", then **Continue with Google** (black pill) / OR / **Continue with Email** [observed].
- Persona pages (`/for/…`) and /enterprise show a **prompt box first** and suggestion cards. Submitting presumably requires sign-in (unverified; not tested).
- Signing up **auto-creates a Lyzr Studio account**, giving one Lyzr profile, one credit pool and one project store (https://docs.architect.new/introduction/essentials/prerequisites.md; plans-credits.md).
- The **AI Consultant ("What should I build?")** runs from the home sidebar. It has five steps in the tutorial and four in the docs:
  1. About yourself (pre-filled from the account);
  2. Role (analyst, product management, sales, marketing, solution architect, student, HR, or custom);
  3. Time-sinks;
  4. Tools used;
  5. Goals and challenges.

  The buttons are **Continue**, **Update and Explore** and **Build This**. The output is three proposal cards with capabilities, integrations and weekly hours saved, for example "Lead Nurturing Agent – Save 15 hrs/week". The right-hand panel is titled "Tailored App Ideas" (https://docs.architect.new/build/build-guide.md; https://www.tella.tv/video/getting-started-with-what-should-i-build-d2n9 [tutorial]).
- Prep advice (the "5-minute rule"): write down the Who, the What (input) and the Outcome before starting (prerequisites.md).

### 3.2 Homepage and prompt entry
- **Prompt box** with a **+ menu** [doc]:
  - **Attach files.** PDF/DOCX/TXT are "automatically chunked and embedded into a vector database" and agents can cite them. CSV/Excel become dataframes for a data-analyst agent (https://docs.architect.new/introduction/platform/how-it-works.md).
  - **Select theme:** 45+ presets or **Create theme** (see 3.2.1).
  - **Add Studio agents:** import existing agents with their prompts, tools and KBs.
  - **Add MCP server**, also reachable by typing `@mcp:` (https://docs.architect.new/integrations/custom-tools/mcp-servers.md).
- **Public composer as seen on persona pages** [observed]:
  - a tall rounded textarea with a typewriter-animated placeholder ("Build me a customer support agent I can deploy for my client's e-commerce store…");
  - a black **paperclip** button bottom-left;
  - a **microphone** (voice input) button and a grey **send arrow** bottom-right;
  - three **suggestion cards** below with a bolded key phrase ("Build me a **document processing agent** for my client's legal team");
  - a **Browse Prompt Library** pill and a "Connect with [Gmail, Slack, Teams, Notion, GitHub, HubSpot, …] And many more" logo row.
- **Prompt Library** (left sidebar). Categories include Sales & Marketing, Operations, Product & Engineering, HR, Finance and others; the tutorial also shows Legal, Support, Productivity and Development. It has **search**. Each card is a "fully specified blueprint" (user journey, agents, outputs). Clicking a card pastes it, editable, into the prompt bar (https://docs.architect.new/build/prompt-library.md; https://www.tella.tv/video/how-to-use-the-architect-prompt-library-f92r [tutorial]).
- **Prompting guidance:**
  - Who / What / Vibe / Success criteria, with a focus on the user journey (build-guide);
  - "You do **not** need to tell Architect which agents to create";
  - mention tools and MCPs up front (https://docs.architect.new/references/best-practices.md).
- Screenshots and images can go into chat; the 32 MB payload cap was removed in v2.0.1 (https://docs.architect.new/changelog/v2-0-1.md).

#### 3.2.1 Themes and bring-your-own design system
- Open Theme Manager via **+ → Select theme**. It offers 45+ presets or **Create theme**, with five import paths:
  1. Figma link (beta, restricted access);
  2. a brand guide as PDF, Word or text;
  3. a GitHub repo plus branch;
  4. a .zip;
  5. pasted Tailwind/shadcn `globals.css`.
- The editor has four areas: **Design tokens** (CSS variables with validation), **Instructions**, **Assets** (logos) and a **Live preview**, then **Save**. Saved themes are reusable across apps (https://docs.architect.new/build/custom-theme.md).

### 3.3 Chat and agent interaction (modes, autonomy, progress)
- **Brainstorming & Planning mode** starts automatically when a prompt is submitted from the homepage:
  1. **Guided questions.** The user picks a suggestion or types an answer. The tutorial shows use case and scope, outputs, and "database needed?". The voice tutorial also shows resolution-rate goals and knowledge sources.
  2. **PRD in the right panel:** overview, user stories, agent architecture, data sources, and an **agent table** (model, tools, role). It updates live.
  3. **Artifact tabs:** App Mockup, Workflow Diagram, Skill files (.md), PDF/PPT and Starter files, with one-click follow-up suggestions.
  4. The status reaches **"Plan Ready"**, then **Start Building** hands everything off. **Back to Plan Mode** reverses it. Planning can be skipped entirely by pressing Start Building.

  Sources: https://docs.architect.new/build/planning-brainstorming.md; https://www.tella.tv/video/how-to-iterate-your-prd-before-building-an-ai-agent-gx8r [tutorial].
- A **Stop** button in the planning chat toolbar cancels a run (v2.0.1).
- An optional question **"Build this using GitAgent (beta feature)"** replaces default Lyzr agents with git-native ones (git-agents.md).
- A **Plan toggle** sits **bottom-left of the message box** during iteration. Replies are tagged "Planning" and change no code, and plan and build share one conversation (https://docs.architect.new/build/plan-mode.md).
- A **Test toggle** in the composer runs the browser **Testing agent** after each build, adding 2–5 minutes (v2.2.0).
- **Build phases** (docs): Plan → Agents (create agents, assign tools, link KB) → App (React/Next.js wired to agent outputs, "code preview available for review"). Older docs name plan buttons **Approve**, **Chat/Edit** and **Edit in Studio**. The tutorials say "push to agents". These labels may pre-date the v2.0 revamp (build-guide.md).
- **Progress display.** The marketing demo shows a checklist ticking: "Finding the best enterprise-grade blueprint", "Building the most appropriate agent orchestration", "Detailed plan ready", "Adding all required integrations", "Configuring intelligent agent workflows", "Agent orchestration built", "Generating production-ready code…". It also shows a monospace plan typing out, an "AI Planning… 13%→100%" bar and chips ("Knowledge Graph Required", "Integration with Gmail") [observed, marketing demo].
- **What the real build screen looks like, per one user:**
  - "Building is a 20-minute black box with a carousel and a mini-game";
  - "It promised '4–6 min' and took about 20";
  - "No cost or time estimate before committing credits".

  That means a time estimate is shown but no cost estimate (https://github.com/shambhu-10/lyzr [3P-hands-on]).
- **Feasibility pushback.** Architect redirects out-of-scope asks, for example turning a real-time multiplayer game into a matchmaking and progression agent layer (https://www.tella.tv/video/building-ai-agents-with-architect-1vk5 [tutorial]).
- **Honest tools.** If you name an MCP server that isn't connected, Architect "prompts you to add it first and will never use fake or unverified tools" (mcp-servers.md).
- **Credits in the UI:** a Usage page plus a per-run breakdown (3.15). A live per-message cost chip is not documented (unverified).

### 3.4 Live preview
- A sandboxed **live preview**, called the **"Live App"** in the deploy docs, runs the real app. You can sign up as a test user and exercise the agents, including placing a test **Call** in voice apps (https://docs.architect.new/build/deployment.md; https://www.tella.tv/video/building-a-voice-support-agent-in-architect-1-b87z [tutorial]).
- **Sandbox lifecycle.** The sandbox stays alive at least 10 minutes when idle (v2.0.2) and pauses during longer inactivity (v2.0.0). Since v2.2.0 an app is "marked ready only after preview loads", and the "Connection lost", 401/"invalid sandbox" and port errors are fixed.
- **Not documented:** device toggles, a URL or route bar, point-and-click or visual editing, element selection, and a console or network panel (unverified; probably absent).

### 3.5 Code view, editor, file tree, terminal
- **No code editor, file tree or terminal is documented.** Build Phase 3 mentions a "code preview available for review" (build-guide.md). The official route for manual edits is GitHub: the tutorial "How to Connect GitHub to Architect" opens by explaining how to get the code "for manual edits" (https://www.tella.tv/video/how-to-connect-github-to-architect-3fzp [tutorial]).
- One hands-on user: "Non-technical users see internals (raw app IDs, `manifest.json`, 'temperature'). Developers get no workspace" [3P-hands-on].

### 3.6 Backend (database, end-user auth, storage, functions)
- A **managed NoSQL DB is auto-provisioned** from the prompt, with collections such as `_users`, `characters`, `conversations`, `messages` and `preferences` (database-auth.md). The tutorial names **MongoDB** [tutorial].
- The **Database tab** shows auto-generated collections, a live document viewer, and schema views with timestamps, IDs and relationships.
- **End-user auth:**
  - sign-in and sign-up screens that match the theme;
  - passwords hashed with **bcrypt** into `_users`;
  - sessions and tokens, and protected routes.

  Only email/password is documented; social login for end-users is (unverified).
- **Per-app DB isolation** since v2.1.0.
- **BYO database:** add `DATABASE_URL` (Postgres or Supabase) as an env var, then ask Architect to wire it in (environment-variables.md).
- **Not documented in Architect:** file storage buckets, serverless functions, cron or scheduled jobs, webhooks, SQL and migrations.
  - Studio's **SuperFlow** does support DAG workflows with **cron schedules, webhook triggers, human-approval gates, HTTP and code nodes** (https://docs.lyzr.ai/enterprise/get-started/concepts/multi-agent-orchestration.md).
  - The landing demo shows "Schedule" as an input beside Chat and Voice [observed].
  - Whether Architect generates SuperFlows is (unverified).

### 3.7 AI inside generated apps and agent building
- **Orchestration patterns [lyzr-doc]:**
  - **Manager Agent:** dynamic routing to worker agents via their `usage_description`;
  - **SuperFlow:** a deterministic DAG with exactly-once runs, cron and approvals.

  They can be combined. The makers describe both "autonomous manager-style" and "deterministic workflow" agents (Product Hunt).
- **Recommended size:** "Aim for 4–5 agents maximum for your starting point", to reduce hallucination risk (best-practices.md).
- **The Agents tab** opens the Edit Agent panel:
  - fields: name, description, role, goal, instructions; model provider and model; temperature, top-p;
  - **Save changes**;
  - **Open in Lyzr Studio** at top-right, where tools and KB are edited.

  Edits sync **both ways**. Since v2.0.1, Architect patches only changed sections instead of overwriting Studio edits (https://www.tella.tv/video/editing-agent-instructions-in-architect-and-studio-2yow [tutorial]; custom-tools.md).
- **Knowledge base:** upload PDF, TXT or DOC files, or **Crawl** a website URL (https://www.tella.tv/video/how-to-add-a-knowledge-base-to-your-ai-agent-2jch [tutorial]). Studio adds Semantic Model and Text-to-SQL KBs [lyzr-doc].
- **Responsible AI** (Studio policies): toxicity, prompt injection, NSFW, gibberish, allowed and banned topics, keyword block or redact, PII redaction, and AWS Bedrock Guardrails (https://www.tella.tv/video/how-to-enable-responsible-ai-in-architect-frql [tutorial]).
- **Every request runs a pipeline:** input checks (PII, injection, toxicity) → execution → **Hallucination Manager** (Reflection, Groundedness, Context Relevance) → logging and eval [lyzr-doc].
- **Agent Simulation Engine** (Studio): personas and scenarios, "up to 10,000 automated tests" (SiliconANGLE; https://www.lyzr.ai/blog/agent-simulation-engine/). **Agent Eval** is multi-agent consensus with human escalation below a confidence threshold (press release).
- **Multimodal:** agents "talk, see, generate images, and create videos" via OpenAI, Anthropic, ElevenLabs and Replicate (Product Hunt).
  - Voice agents use a **Realtime** engine (audio-to-audio, for example gpt-realtime) or a **Pipeline** engine (separately chosen speech-to-text, LLM and text-to-speech), plus telephony (https://docs.lyzr.ai/enterprise/agent-studio/voice/overview.md).
  - A generated voice app includes a call log, ticket tracking, KPI tiles, document upload for the KB and a **Call** button [tutorial].
- **Models:**
  - Studio runtime: OpenAI, Anthropic, Google, Bedrock, Groq, Perplexity, and bring-your-own [lyzr-doc];
  - the Architect FAQ still lists GPT-4o, Claude 3.5 Sonnet and Gemini 1.5 Pro, which is stale;
  - the builder's own model is not disclosed.
- **Memory:** session memory, Cognis long-term memory and global context (Studio) [lyzr-doc].
- **Cross-framework agents (Studio, not Architect):** **A2A**. A Manager agent can add "+ A2A" external agents, and an Agent Registry offers "Import (A2A)" for **LangGraph, CrewAI and Semantic Kernel** agents with full traces (https://docs.lyzr.ai/enterprise/integrations/a2a-protocol.md). Architect itself does not document this.
- **GitAgent (beta):** the Agents tab shows **Soul**, **Rules** and **Duties** plus **View repository on GitHub**. It "produces functionally identical app interfaces" to standard agents for now (git-agents.md).
- **The generated-app look** (landing demo): a KPI dashboard plus a right-side **"Agent Interface"** chat that streams tool steps ("Retrieving knowledge graph…", "Preparing email…") [observed].

### 3.8 Integrations, connectors, MCP, APIs, secrets
- **26 documented built-in tools** (https://docs.architect.new/llms.txt):
  - Communication: Gmail, Microsoft Teams, Slack, Telegram, Twitter/X, Instantly, LinkedIn;
  - Workspace: Asana, Dropbox, Google Calendar, Google Docs, Google Drive, Trello, Notion, Confluence;
  - CRM and data: Apollo, HubSpot, Microsoft Excel, Freshdesk, Google Sheets;
  - Dev and research: Arxiv, GitHub, Linear, Jira.
- **Connect flow:** an **integration section** lists the tools the app uses. Click **Connect**, then on the provider's permission screen you can "review" and "adjust the permissions", then click **Allow** to show it as connected (https://www.tella.tv/video/how-to-connect-third-party-tool-in-architect-9rgr [tutorial]).
- **Custom tools** are built only in Studio (OpenAPI schema or ACI tool; OAuth, API-key or no auth), and cover:
  - internal APIs;
  - webhooks into **Zapier, Make or n8n**;
  - wrapped Python or JS functions.

  Once attached, a custom tool "behaves just like a built-in integration" (custom-tools.md).
- **MCP servers** (v2.1.0) connect two ways:
  1. **In Studio:** Agent Studio (sidebar) → Connections → Tools → MCP, choosing a listed server (DeepWiki, Stripe, Supabase…) or **+ New → MCP Server**, then naming the server in the prompt.
  2. **Mid-build:** **+ → Add MCP server** or `@mcp:`, fill name, URL and auth (No Auth, API Key or OAuth), click **Connect**, then ask Architect to wire it in.

  Servers are **account-scoped**, and a green dot marks a connected server (mcp-servers.md).
- **Environment variables:** open **⋮ (top-right) → Environment variables**, enter Name and Value, and click **Add**. Values are "encrypted at rest" and exposed as `process.env`. Then prompt, for example "I've added an OPENAI_API_KEY — can you wire up voice transcription?" (environment-variables.md). There is one list, with no per-environment values.
- **No public Architect API, CLI or builder MCP.** The docs' OpenAPI page is a generic placeholder spec (https://docs.architect.new/api-reference/openapi.json). Studio agents do get REST, gRPC and SDK access [lyzr-doc].

### 3.9 GitHub and version control
- **Connect:** click the **GitHub icon top-right of the app view**, sign in to GitHub and authorize "Lyzr Architect". A new repo is created and the code pushed (https://docs.architect.new/build/github-connect.md).
- **Every change auto-commits** ("refining an agent, tweaking the UI, or updating a prompt").
- **GitHub panel:** **Pull**, **Push** and a **branch switcher** (v2.0.2). Branches must already exist on GitHub, so create them locally or on GitHub first. v2.0.0 added recovery from local errors (broken dependencies, port changes, build errors).
- **Deploy without GitHub** (v2.2.0) uses a platform-managed repo, with **Export to my GitHub** later. The managed repo is cleaned up when the app is deleted.
- **Versions, checkpoints and rollback:** there is no in-product history, restore or diff UI documented. History exists only as git commits (unverified absence).

### 3.10 Importing existing projects
- **Import a GitHub repo (Next.js only), v2.2.0:** "Already have a Next.js project? Import any GitHub repository into Architect and continue building on it." The UI entry point is (unverified).
- **Import a design system** (not an app): Figma (beta), PDF/Word, repo, zip or `globals.css` (3.2.1).
- **Reuse agents:** + → **Add Studio agents**.
- **Not supported or not documented:** zip or local-folder app import, non-Next.js frameworks, Figma-to-app, screenshot-to-app, URL clone, and importing LangGraph or CrewAI code into Architect.

### 3.11 Deploy, hosting, domains, environments
- The **Deploy** button sits **top-right** and opens a config menu (https://docs.architect.new/build/deployment.md; https://www.tella.tv/video/how-to-deploy-the-agent-on-architect-aze8 [tutorial]):
  - **Publish to Marketplace** toggle. Fields: Category, Description (auto-filled), a 160-character Short description, and up to 8 Tags. Turn it off to publish directly.
  - **Custom domain**, for example `tools.yourcompany.com`, "directly through this menu". No DNS steps are documented.
  - **Analytics** toggle ("user engagement frequency and AI agent activation rates").
  - A success dialog ("Your app is now live") with the URL and **copy/open** actions.
- **Prerequisite:** validate the app in the "Live App" preview first.
- **Re-deploy** (v2.0.1): iterations no longer auto-deploy. You preview first, then press **Re-deploy**.
- **Rename deployed URL** (v2.2.0) checks availability and updates the live URL immediately.
- **Domain.** The docs' example is `travel-planner.architect.new`. A live app was observed on `*.architect.space` with an auto-generated slug [observed].
- **Environments:** self-serve users get a single live deployment. The enterprise page lists "Workspaces and environments for teams" and "Promote changes with reviewable configs" [observed]; details are unverified.
- **Enterprise hosting:** cloud, on-prem in the customer's VPC (AWS, Azure or GCP), or hybrid (data connectors on-prem), with regional hosting (https://docs.lyzr.ai/enterprise/get-started/intro.md; faqs.md).
- **Self-host via export:** React/Next.js plus Python/Lyzr SDK (faqs.md).
- An **unverified `lyzr.architect.new`** host also serves "Architect Beta", possibly a tenant or org instance [observed title only].

### 3.12 Debugging and auto error fixing
- The **self-correction loop** runs before the app is shown.
- A **"Help me fix it"** prompt appears on errors. Since v2.0.2 Architect fixes most errors (for example a 500 on `/api/agent`) "on its own… without you having to click".
- **Manual path:** describe the error in chat and/or upload a screenshot. The tutorial fixes a sign-up "network error" traced to a missing TLS certificate (https://www.tella.tv/video/how-to-fix-errors-in-architect-7e20 [tutorial]).
- **Tool debugging guidance:** "Always test integrations in Studio before deploying" (best-practices.md).
- **No logs, console or trace view** in the Architect builder is documented. Traces live in Studio and the enterprise dashboards.

### 3.13 Testing
- **Testing agent** (v2.2.0, **Test** toggle): runs a real browser after each build, finds runtime and console errors and fixes them. It adds 2–5 minutes and can be turned off.
- **Studio agent testing:** the Simulation Engine (personas and scenarios) and Agent Eval with test cases and hardening [lyzr-doc].
- No unit or E2E test files, test reports, CI or a pre-deploy checklist are documented.

### 3.14 Security
- **Platform:** HIPAA and SOC 2 claims, SSO/SAML, RBAC and audit logs [lyzr-doc].
- **Built apps:** per-app DB isolation, bcrypt, encrypted env vars, and Responsible AI with the Hallucination Manager.
- **Data use:** "No, enterprise-grade infrastructure ensures data isolation"; user data is not used for training (faqs.md).
- **Enterprise:** "Control who can publish, run, and share agents", "Approval flows for sensitive steps" and "Exportable evidence for compliance reviews" [observed].
- **Gap:** no security scan of generated code, secrets or dependencies is documented.

### 3.15 Analytics, monitoring, logs
- **Usage page** (home sidebar): total credits, total apps, per-app credits, last used, search and sortable rows (https://docs.architect.new/introduction/platform/usage.md).
- **Per-agent credit breakdown** (v2.2.0) splits usage into Plan, Agent Creator, UI Generation, Build and Testing, with input/output/cached tokens and run and lifetime totals, "sourced directly from sandbox ledger".
- **App analytics:** a toggle at deploy time [doc], but pricing marks the "Analytics dashboard" as **Soon** [observed].
- **Enterprise dashboards** (demo data on /enterprise [observed]):
  - *Traces:* total credits 14,370.88, average latency 8.32s, 7,753 tokens per trace, and a Recent Traces table with trace ID, agent, latency, tokens, credits and status (OK or Err).
  - *Simulation:* Pass/Fail cards.
  - *Admin console:* tabs for Apps, Insights, Insights (Beta), Users, Referrals and Analysis.
    - **Strategic Insights (Beta):** an Opportunity Map on complexity × impact with Quick Wins, Strategic, Low Priority and Avoid, plus an opportunities table with priority, impact, savings and app count ("$6.1M est. annual savings, 297 apps analyzed").
    - **Qualitative Analysis of build sessions:** 360 apps, 38.1% positive, **13.9% error rate**, **71.1% completion**; sentiment negative 9, neutral 182, positive 137, **frustrated 32**.

### 3.16 Collaboration, teams, sharing, remixing
- **Share:** **My Projects → share icon** (next to **Open** on the app card) → enter an email → **People with access**. Recipients see the app under **Shared Projects**.
  - "Every person with access works on the same app — there's no fork or copy."
  - There are **no roles**, presence or comments, and access revocation isn't documented (https://docs.architect.new/build/share-app.md).
- **Marketplace** (the doc slug is still `/agentlets`; a public `architect.new/agentlets` URL exists but is JS-rendered):
  - search;
  - sort by Popular, Recent or Top Rated;
  - filter by Category (Automation, Analytics & Insights, Customer Support, Finance & Accounting, HR & Recruiting, Marketing) and Use case (Lead Generation, Customer Engagement, Workflow Automation, Data Analysis, Content Creation);
  - actions **Preview**, **Analyze** (see agents and prompts) and **Clone & Modify**, which is "forthcoming" (https://docs.architect.new/introduction/platform/agentlets.md).

### 3.17 Templates, learning and community
- Learning resources: the Prompt Library, the Marketplace, **106 use-case pages** and **19 tutorials** at /resources [observed], and the lyzr.ai use-case gallery of named agents (Jazon AI SDR, Skott AI Marketer, Diane AI HR…) (https://www.lyzr.ai/architect/).
- The hands-on user counted "10 of the 17 sidebar items are learning content", "3 views of projects and 4 places to find ideas" [3P-hands-on].
- **Support:** the **Help & Support** form at the bottom-left of the sidebar (reply by email) and the **mascot** at the bottom-right, which opens live chat (https://docs.architect.new/introduction/essentials/help-support.md).
- **Events:** Lyzr Agentathon on 2026-04-25 in Bengaluru, ₹2 lakh in prizes, all builds on Architect. Judging criteria were Orchestration Complexity, Technical Execution, Business Impact & ROI, and UX/"Vibe" (https://lyzr-agentathon.devpost.com/).

### 3.18 Mobile apps
- **None.** Output is a responsive Next.js web app. No native, Expo or PWA packaging is documented.

### 3.19 Pricing and credits (pricing modal [observed 2026-09-26]; plans-credits.md)

| Plan | Monthly | Annual (per month) | Credits / month | Notes |
|---|---|---|---|---|
| Free | $0 | $0 | "Free credits included" (docs say "No monthly credits") | Keeps the "Built with Architect" watermark; no priority support; **Sign up for free** |
| Starter | $20 | $17 (save $40/yr) | $20 of credits | Watermark removed; priority support |
| **Pro** ("Popular") | $40 | $35 (save $60/yr) | $40 of credits | Same as Starter |
| Max | $99 | $83 (save $189/yr) | $99 of credits | Same as Starter |
| Custom | "Let's talk" | — | Custom allocation | "Exclusive support from Team Lyzr"; **Contact Us** |

- **Every plan** includes Agent Marketplace access, "Deploy your agents" and "Publish to Marketplace". **"Custom agent branding" and "Analytics dashboard" are marked "Soon"** on every plan. The modal opens on **Annual**, with a Monthly/Annual toggle marked "Save 12%".
- **Top Up tab:** "Buy Additional Credits". Credit packs are **$25, $50 and $100**, each a one-time purchase with a **Buy pack** button, shown next to the current-plan card [observed].
- **Credits are denominated in dollars and are spent while building and at runtime**: "each time Architect plans, generates, or edits an app", and when deployed agents answer end-users (usage.md). The docs pitch "$10,000+" of traditional development against "approximately $10" (why-architect.md).
- **Lyzr Studio** is priced separately (AI Agent Square, 2026-07-04; unverified against lyzr.ai, whose pricing page did not render):
  - Community: $0, 500 credits, 10 agents;
  - Starter: $19, 2,000 credits;
  - Pro: $99 ($79 billed yearly), 10,000 credits;
  - Enterprise: custom;
  - top-ups at $10 per 1,000 credits;
  - a **$0.08 per run** on cloud or $0.03 on VPC, plus LLM pass-through (https://aiagentsquare.com/agents/lyzr).
- **AWS Marketplace:** $0.01 per usage unit, or private offers at $50k and $100k per year (https://aws.amazon.com/marketplace/pp/prodview-eoostoonb4wxg).

### 3.20 Enterprise features
- RBAC with least privilege; guardrails, approvals and audit logs; controls on tools, data and outbound actions.
- Workspaces and environments, and promotion through reviewable configs.
- The admin dashboard (apps, users, referrals, strategic and qualitative insights) and trace analytics; the Simulation Engine.
- VPC, on-prem or hybrid hosting, BYO models and keys, SSO/SAML, and HIPAA/SOC 2.
- Forward Deployed Engineers and Agentic Transformation Consultants.

Sources: https://www.architect.new/enterprise [observed]; press release; docs.lyzr.ai.

### 3.21 Company context (useful for framing)
- **Revenue:** ARR of about $12M at June 2026, up from $3.5M in February 2026, with a 95% gross margin (secondary: https://the-agent-report.com/2026/07/lyzr-ai-agent-sivaclaw-100m-fundraise-july-2026/; unverified).
- **Funding:**
  - Series A of $8M in late 2025 (Rocketship.VC, with Accenture backing);
  - $14.5M at a $250M valuation in March 2026, led by Accenture;
  - a Series B targeting $100M at about $500M in July 2026, "run" by its own agent (TNW; TechCrunch; Bloomberg).

## 4. UI layout — the main screens

> **What I saw myself:** the logged-out pages only. Builder layouts below are reconstructed from docs, tutorials and one hands-on teardown, and each claim is labelled.

### 4.1 Logged-out home, architect.new [observed]
- **Top bar:**
  - left: the Lyzr logo, with a floating **mascot** avatar (a cartoon builder in a yellow hard hat and sunglasses) overlapping it top-left;
  - right, in order: a **Product Hunt "#3 Product of the Day"** badge (coral outline), **How it works**, **Pricing** (opens a modal), **For Work ▾** (persona dropdown), a black pill **Get started for free**, and a sun icon **theme toggle**.
- **Hero** (centred): a large "Architect" wordmark with a sketchy hand-drawn flourish, the subtitle, and a white **sign-in card**: "Sign in to start building with Architect." / black pill **Continue with Google** / OR / ghost **Continue with Email**. Below it sits a "Connect with" row of monochrome logos and "And many more".
- **Demo** (scroll): a small "Lyzr Architect" window with macOS traffic-light dots, a user bubble ("We struggle with managing credit card transactions and claim processing…") and a ticking checklist. Beside it:
  - a 3-step stepper: **01 Plan Mode · 02 Agentic Layer · 03 Production App**;
  - a large panel that switches between three views:
    - a monospace plan with wireframes;
    - an orchestration graph: Input (Chat/Voice/Schedule) → Agent → Manager with sub-agents → integrations → Dashboard, with a feedback loop;
    - an "app.lyzr.ai" browser frame with KPI cards, a line chart and a right-hand "Agent Interface" chat.
- **Below:** the "What is Architect?" YouTube embed, then a footer with Privacy policy | Security | Terms of Use | Anti Slavery Policy.

### 4.2 Persona pages (`/for/<persona>`) [observed: /for/ai-agencies]
- The same top bar. The hero reads "Architect", with *for AI Agencies* in green italic, and a persona pitch paragraph.
- A **large prompt box** with a typewriter placeholder, a paperclip at bottom-left, and mic and send buttons at bottom-right.
- **3 suggestion cards** in a row, then a **Browse Prompt Library** pill, the logo row and the same demo.
- This is effectively the **logged-in home composer shown publicly**. The exact logged-in home layout is (unverified).

### 4.3 Enterprise page (/enterprise) [observed]
- The nav adds **Explore admin dashboard**.
- The hero, "Architect *for Enterprises*", has a prompt box: "State your problem or the agent description that you want to build." It is followed by "Browse Prompt Library" and "Trusted by Fortune 500s and global enterprises".
- "How it works" (the 3-stage demo), then three feature cards: RBAC & Policies; Safe & Responsible AI by Lyzr Studio; Audit logs & observability.
- Mock dashboards: Traces, the Simulation Engine, and the admin console with tabs (see 3.15).
- A final "Enterprise controls, end-to-end" checklist, with **Request a demo**, **Get started for free** and **Explore admin dashboard**.

### 4.4 Pricing modal [observed]
- **Header:** a "Plans & billing" pill, the title "Choose Your Plan" (large, dark green) and the italic subtitle "Select the perfect plan for your needs". At top-right are the **Plans | Top Up** tabs, a **Monthly / Annual (Save 12%)** segmented toggle and a close ✕.
- **Plan cards:** five cards in a row on a cream gradient, each with a teal icon tile, price, credit line, a black CTA and a feature checklist. Some items carry "⊙ Soon" chips; others are struck through. The Free card shows "✓ Current"; Pro shows "☆ Popular".
- **Top Up tab:** credit packs listed on the left, the current-plan card on the right.

### 4.5 Logged-in home / dashboard [doc + 3P-hands-on]
- **Left sidebar:**
  - **What should I build?** (AI Consultant) and **Prompt Library**;
  - **My Projects** (the docs also say "My Apps"), **Shared Projects** and **Usage**;
  - **Agent Studio** (opens Lyzr Studio);
  - **Help & Support** pinned bottom-left.

  The hands-on user reports **17 sidebar items, 10 of them learning content**, and that **"projects open in a modal"** [3P-hands-on]. Where the Marketplace link sits is (unverified).
- **Centre:** the prompt box with the **+** menu (Attach, Select theme, Add Studio agents, Add MCP server).
- **My Projects:** app cards with auto-refreshing screenshot thumbnails, **Open**, and a **share** icon.

### 4.6 Planning workspace [doc]
- **Left:** the brainstorming chat. Questions appear as selectable suggestion chips, and a composer sits below. A **Stop** button lives in the chat toolbar.
- **Right:** a tabbed artifact panel with Plan/PRD (agent table), App Mockup, Workflow Diagram, Skill files, PDF/PPT and Starter files, plus follow-up suggestion chips.
- **Primary CTA:** **Start Building**, once the plan shows "Plan Ready".

### 4.7 Build workspace [doc + tutorial]
- **Top bar:**
  - the app name with a **pencil** icon (a rename popover with Save);
  - at top-right, the **GitHub icon** (panel: Pull, Push, branch switcher), **Deploy** (which becomes **Re-deploy**) and the **⋮** menu (Environment variables…).
- **Left:** the build chat. The composer has **+**, a **Plan** toggle at bottom-left and a **Test** toggle. Errors surface a "Help me fix it" prompt, and there is a **Back to Plan Mode** route.
- **Right:** tabs **Plan · Agents · App (Live App preview) · Database · Artifacts** (artifacts.md):
  - **Agents:** an agent list; clicking an agent opens the **Edit Agent** panel (Save changes; **Open in Lyzr Studio** top-right). GitAgent agents show Soul, Rules and Duties plus **View repository on GitHub**.
  - **Database:** collections, documents and schema.
  - **Artifacts:** view in panel, **Download** and share.
  - **Integrations:** an "integration section" lists the tools the app uses, each with **Connect** [tutorial]. Its exact placement is (unverified).

### 4.8 Deploy modal [doc + tutorial]
- A **Publish to Marketplace** toggle with Category, Description, Short description (160 characters) and Tags (≤8).
- A **Custom domain** field and an **Analytics** toggle.
- A **Deploy** button leading to a success dialog with the URL, copy and open.

### 4.9 Visual design language [observed]
- **Colour:** a calm, near-monochrome SaaS look. An off-white canvas carries a faint **graph-paper grid**, with white cards, thin grey borders, large radii and soft shadows. Primary buttons are **black pills**; secondaries are ghost buttons. A muted **teal/emerald green** accents italic sub-headings, icon tiles and ticks, and the pricing modal uses a cream/beige gradient.
- **Type:** a geometric sans (Plus Jakarta Sans-like; unverified) for UI text and **monospace** for plan and "thinking" text.
- **Density:** marketing pages are airy. Enterprise dashboards are dense (KPI tiles, bubble charts, tables). A light/dark toggle exists.
- **Tone:** a playful mascot plus enterprise vocabulary ("enterprise-grade blueprint", "governance").

## 5. Step-by-step user flows

### 5.1 Sign-up and onboarding
1. Open architect.new, which shows the sign-in card. A persona page instead offers a prompt box first.
2. Choose **Continue with Google** or **Continue with Email**. A Lyzr Studio account is created automatically.
3. Optionally, open **What should I build?**: About you → **Continue** → Role → Time-sinks → Tools → Goals → **Update and Explore** → 3 idea cards → **Build This**, which leads to the PRD.
4. Or type a prompt, or pick one from the **Prompt Library**, which pastes it into the prompt bar.

### 5.2 First prompt through to a running app
1. Enter the prompt. Optionally use **+** to attach files (for RAG or dataframes), select or create a theme, add Studio agents, or add an MCP server.
2. **Planning** starts. Answer 3–6 guided questions; the last one optionally offers GitAgent.
3. The PRD fills in on the right: overview, stories, agent table (model, tools, role), data and DB, UI/UX theme, integrations. Then the Mockup, Workflow Diagram and Skill-file tabs appear.
4. Iterate in chat ("dark theme instead of emerald, add job insights"). The PRD rewrites itself. Export a PDF or PPT for stakeholders, or press **Stop** if a run goes wrong.
5. When the plan shows "Plan Ready", click **Start Building**.
6. **Wait.** The demo shows a blueprint → orchestration → integrations → workflows → code checklist. One real user saw a "4–6 min" estimate, about 20 minutes of actual build, "a carousel and a mini-game" and no cost estimate [3P-hands-on]. Agents are created, the UI is generated, and the QA loop runs. The Testing agent adds 2–5 minutes if **Test** is on.
7. The app becomes ready only once the **Live App** preview loads. Sign up in the app as a test user and exercise the agents.
8. **Watch-out:** if an integration isn't connected, the app may **run on sample data** without saying so. One user's app "never asked me to connect Google Calendar" [3P-hands-on]. The plan may also **quietly drop requested scope**: "The plan quietly dropped two of the three" [3P-hands-on].

### 5.3 Iterate, fix and tune
- Make one coherent change per prompt; don't stack unrelated asks (best-practices).
- For big changes, turn on **Plan**, get a "Planning"-tagged proposal, turn Plan off, then say "implement it".
- **Errors** are auto-fixed, or you click **Help me fix it**, or you describe the problem and attach a screenshot.
- **Agents:** Agents tab → agent → Edit Agent (instructions, model, temperature) → **Save changes**. For deeper work, **Open in Lyzr Studio** to change tools, KB, Responsible AI or simulations; edits sync back.
- **Artifacts:** ask "Create a feature spec PDF for this app", and the file appears in the **Artifacts** tab.

### 5.4 Add database and auth
- Mention the need in the prompt, or answer "yes" to the DB question. Collections and auth screens are generated. Inspect them in the **Database** tab.
- For an external DB: add `DATABASE_URL` under ⋮ → Environment variables, then ask Architect to wire it in.

### 5.5 Connect integrations and secrets
- **OAuth tool:** integration section → **Connect** → review or adjust scopes → **Allow**.
- **API key:** ⋮ → **Environment variables** → Name/Value → **Add**, then prompt Architect to use it.
- **MCP:** **+ → Add MCP server** (or `@mcp:`) → name, URL, auth → **Connect**, then prompt.
- **Custom API:** Edit Agent → **Open in Lyzr Studio** → create a custom tool (OpenAPI or ACI) → attach it; it then works like a built-in.

### 5.6 Connect GitHub
- Click the **GitHub icon** (top-right) → authorize "Lyzr Architect". A repo is created and every change auto-commits.
- **Local work:** clone, create and push a branch, pick it in the **branch switcher**, and use **Pull** or **Push**.
- Without GitHub, you can deploy and later **Export to my GitHub**.

### 5.7 Deploy, publish and domain
1. Validate in **Live App**.
2. Click **Deploy** (top-right) → Marketplace on (fill the fields) or off → optionally a custom domain and analytics → **Deploy**.
3. The success dialog shows the URL with copy and open.
4. **Later:** **Rename deployed URL**; after iterating and previewing, **Re-deploy**. There is no documented DNS wizard or domain-verification status.

### 5.8 Import an existing project
- Import a **GitHub Next.js repo** (v2.2.0) and keep building, add agents and deploy. The entry point is (unverified).
- For branding only, go to **+ → Select theme → Create theme**, import from a source, edit the tokens, instructions and assets, and **Save**.

### 5.9 Build an agent (inside Architect vs Studio)
- **In Architect:** describe the app; Architect decides the agents. Tune them in the Agents tab. Add KB files or **Crawl** a URL. Attach tools by naming them in the prompt.
- **For guardrails, custom tools, simulations, A2A agents or SuperFlow:** go to Studio, then come back.

### 5.10 Collaboration and marketplace
- **Share:** **My Projects** → share icon → email → **Share**. The invitee opens it from **Shared Projects**, and both edit the same app.
- **Marketplace:** search, filter or sort → **Preview** or **Analyze**. **Clone & Modify** is forthcoming.

## 6. UX strengths and pain points

### 6.1 Strengths
- **Planning before spending.** Users "plan the product first, discuss execution, and specify the agents and orchestration" (G2 snippet, https://www.g2.com/products/lyzr-lyzr-ai/reviews). The PRD, agent table and mockup make intent reviewable.
- **A visible agent layer.** The PRD agent table, the workflow diagram and the Agents tab back up "No black boxes" (Product Hunt).
- **A zero-config start:** Google sign-in, the consultant interview, the department prompt library, and no API keys for built-in tools.
- **Stakeholder outputs:** PDF, PPT and research artifacts in the same context, which suits consultants.
- **Honest guardrails:** it pushes back on infeasible scope and never fakes MCP tools.
- **Enterprise trust:** VPC or hybrid hosting, RBAC, audit, SOC 2/HIPAA claims, Responsible AI and the Hallucination Manager.
- **A shipping cadence aimed at real friction:** 5 releases in 7 weeks (June 18 – August 7, 2026). Since then, 7 weeks have passed without a new changelog entry (as of 2026-09-26).

### 6.2 Pain points (with evidence)
- **Opaque cost and time.**
  - "No cost or time estimate before committing credits. It promised '4–6 min' and took about 20" [3P-hands-on].
  - Credits drain during build *and* runtime (usage.md).
  - G2 on Lyzr overall: "cost is quite high… token usage is quite a lot", and trial-and-error "wastes credits" (G2 snippets).
  - Lyzr publishes a tutorial on saving credits (https://www.tella.tv/video/optimize-architect-credits-with-better-prompts-0wvv).
- **A black-box build wait:** "a 20-minute black box with a carousel and a mini-game" [3P-hands-on].
- **Silent failure modes:**
  - the plan silently drops requested scope;
  - the app runs on **sample data** when an integration isn't connected;
  - both reported first-hand [3P-hands-on].
- **Two-product split.**
  - "Editing an agent sends you to a separate product (Lyzr Studio)" [3P-hands-on].
  - Custom tools, guardrails and simulations are Studio-only.
  - "Always test integrations in Studio" (best-practices).
- **Mixed-audience UI.** "Non-technical users see internals (raw app IDs, manifest.json, 'temperature'). Developers get no workspace" [3P-hands-on].
- **Muddled IA and naming:**
  - "'Project', 'app', 'agent' and 'agentlet' are used for overlapping things. There are 3 views of projects and 4 places to find ideas" [3P-hands-on];
  - the docs themselves mix My Projects, My Apps and agentlets.
- **Reliability history,** per the changelog's own fixes:
  - preview "Connection lost", 401 and port errors (v2.2.0);
  - stuck, duplicated or vanishing chat messages (v2.0.1);
  - the 32 MB upload failure (v2.0.1);
  - sandbox expiry (v2.0.2);
  - Studio edits being overwritten (v2.0.1);
  - the PRD not persisting (v2.2.0).
  - The /enterprise demo data shows a **13.9% build error rate, 71.1% completion and 32 of 360 sessions "frustrated"** [observed; possibly illustrative].
- **Setup-heavy for the value** (Lyzr overall): "most of the time goes into setup, not output"; a "learning curve higher than expected"; documentation gaps (https://www.salesforge.ai/blog/lyzr-ai-review; G2).
- **A scale ceiling:** "Aim for 4–5 agents maximum" (best-practices).
- **Unfinished surfaces:**
  - "Soon" chips on Custom branding and the Analytics dashboard;
  - Marketplace Clone & Modify "forthcoming";
  - Figma import restricted;
  - GitAgent in beta with no UI difference;
  - the tab title still says "Beta".
- **Docs versus reality:**
  - the placeholder OpenAPI page;
  - stale 2024-era model names;
  - Free credits contradicting between docs and the pricing modal;
  - SEO pages promising a "visual canvas" and "drag-and-drop" with handoff logic and branches, which the product docs never describe (https://architect.new/use-cases/ai-infrastructure/build-a-multi-agent-ai-app-without-code).
- **An auth wall on the main entry point.** The home page is a sign-in card. Persona pages show a composer, so the funnel is inconsistent.
- **Shallow collaboration:** one access level, no fork, no roles, comments or presence, and no change attribution.
- **Low community signal:** official tutorials show 2–6 views on Tella, and there are no Reddit threads or independent in-depth reviews. The Product Hunt review count is conflicting (a search snippet says "4.7 from 107 reviews"; the fetched page says none) (unverified).

### 6.3 What a developer would miss (gap analysis)

| Developer need | Current Architect | Gap |
|---|---|---|
| Code editor, file tree, terminal, diff | "Code preview" only; edit via GitHub locally | **Major** |
| Stack choice | Next.js + NoSQL + Lyzr agents only | **Major** |
| Agents in any framework (LangGraph, CrewAI, OpenAI Agents SDK, ADK, Mastra) | Lyzr agents or GitAgent (beta). A2A import exists in *Studio*, not Architect; OpenGAP export is CLI-only | **Major** |
| Import an existing project | GitHub **Next.js** only | **Major** |
| Checkpoints, rollback, deploy history | None in UI; auto-commits only | **Major** |
| Logs, console, network, traces in the builder | None (traces in Studio or enterprise); debugging by chat or screenshot | **Major** |
| Branches, PRs, review | Switch existing branches, pull/push; no create-branch, PR or diff; noisy auto-commits | Medium |
| Environments, preview deploys | A single deploy (enterprise "environments" vague); one env-var list | Medium |
| Triggers (cron, webhooks, queues), server functions | Not in Architect (SuperFlow in Studio has cron, webhooks and approvals) | Medium |
| DB control (SQL, migrations, seeds, BYO) | Auto NoSQL; BYO via env var plus chat | Medium |
| Tests as code, CI, pre-deploy checks | Browser testing agent only | Medium |
| API, CLI, MCP for the builder; IDE sync | None (placeholder API page); agents themselves have REST/gRPC via Studio | Medium |
| Builder model choice; context and cost control | Not exposed; no pre-run cost estimate | Medium |
| Team roles, permissions, audit of changes | One access level (self-serve) | Medium |
| Security scan (secrets, auth routes, dependencies) | None | Minor/Medium |

## 7. Recent notable launches (2025–2026)

| Date | Launch | Source |
|---|---|---|
| 2025-05-23 → 07-23 | "Lyzr AI Architect Challenge" (HackerEarth), a *Studio*-based hackathon, not this product | https://www.hackerearth.com/challenges/hackathon/lyzr/ |
| **2025-10-30** (decoded from the activity ID) | Siva Surendira's LinkedIn launch: "world's first true agentic app builder" | https://www.linkedin.com/posts/sivasurend_architect-productionization-activity-7389468985257459712-VJXf |
| 2026-02-06 | SiliconANGLE exclusive: 1,000+ blueprints, 10k-test simulation, Accenture and KPMG | https://siliconangle.com/2026/02/06/exclusive-startup-lyzr-ai-launches-app-builder-aimed-moving-agents-production-volume/ |
| 2026-02-16 | Press release: "first enterprise-grade text-to-agent platform", Agent Eval consensus, RBAC and audit, FDE model | https://natlawreview.com/press-releases/lyzr-launches-architect-first-enterprise-grade-text-agent-platform-building |
| 2026-02-20 | Product Hunt #3 Product of the Day (306 points on the PH page; hunted.space shows 336 and 34 comments) | https://www.producthunt.com/products/architect/launches |
| Feb 2026 | YouTube: "Architect Is Now Live", "Demo Day", "Full Demo + Q&A", "Lyzr's CTO Explains how Architect actually works" (titles only) | https://www.youtube.com/watch?v=i3j2r9v4cmU, https://www.youtube.com/watch?v=2FELCW84iJI, https://www.youtube.com/watch?v=5hg1BOdF1-Q, https://www.youtube.com/watch?v=3Cvy5f6Bft0 |
| Mar 2026 | Lyzr raises $14.5M at a $250M valuation, led by Accenture | https://thenextweb.com/news/lyzr-ai-agent-100-million-series-b |
| 2026-03-20 | OpenGAP/GitAgent on Product Hunt (#5, 229 points), "Your repository becomes your agent" | https://www.producthunt.com/products/gitagent-2 |
| 2026-04-24 → 05-03 | 19 official tutorials on Tella | https://www.architect.new/resources |
| 2026-04-25 | Lyzr Agentathon, Bengaluru (all builds on Architect) | https://lyzr-agentathon.devpost.com/ |
| **2026-06-18** | **v2.0.0**: UI rebuilt from scratch, Brainstorming & Planning mode, custom brand themes, Plan/Build toggle | https://docs.architect.new/changelog/v2-0-0 |
| 2026-06-25 | v2.0.1: manual Re-deploy, Stop in planning, Studio-edit patching, chat stability, 32 MB fix | https://docs.architect.new/changelog/v2-0-1 |
| 2026-07-02 | v2.0.2: Artifacts in Build mode, branch switching, environment variables, 10-minute sandbox, auto-fix | https://docs.architect.new/changelog/v2-0-2 |
| 2026-07-09 | $100M Series B at about $500M, raised with its own agent | https://techcrunch.com/2026/07/09/an-ai-agent-startup-just-let-its-agent-run-its-100-million-fundraise/ |
| 2026-07-27 | v2.1.0: GitAgent (beta), MCP servers, faster harness, per-app DB isolation, app rename | https://docs.architect.new/changelog/v2-1-0 |
| **2026-08-07** | **v2.2.0 (latest as of 2026-09-26)**: Testing agent, deploy without GitHub, **import GitHub (Next.js) repo**, rename URL, per-agent credit breakdown, preview reliability, PRD stays in sync | https://docs.architect.new/changelog/v2-2-0 |
| 2026-09-16 | Lyzr OpenController, a control plane for agent spend (pilots: Anaplan, Pepsi); not Architect-specific | https://www.einpresswire.com/article/942704499/ |

**Direction of travel:** every release since June adds developer affordances: branches, env vars, MCP, GitAgent, repo import, testing. Lyzr is already inching toward developers, so Architect 2.0 must make a *structural* leap, not another incremental toggle.

## 8. Ideas for Architect 2.0

### ADOPT (parity is mandatory; these are Architect's best ideas)
- ADOPT: **The plan-first flow.** Guided multiple-choice questions → a live PRD with an **agent table** → Mockup → Workflow Diagram → "Plan Ready" → **Start Building**, with a skip option. Keep it as the spine for both audiences.
- ADOPT: **The AI Consultant** (role → time-sinks → tools → goals → 3 ideas with hours saved per week → **Build This**) for users without a prompt. Keep it one click away, not in the way.
- ADOPT: **A layer-per-tab workspace** (Plan · Agents · App · Database · Artifacts). This makes the agent middle layer first-class and is Architect's DNA against Lovable and Bolt.
- ADOPT: **The composer + menu** (Attach, Theme, Existing agents, MCP) and the `@mcp:` mention. Extend it to `@agent`, `@file`, `@integration`, `@env`.
- ADOPT: **Plan/Build and Test toggles** in the composer, as explicit, cheap autonomy controls.
- ADOPT: **Artifacts** (spec PDF, deck, research doc, HTML/Word) generated from project context.
- ADOPT: **Bring-your-own design system**: import from five sources, then a token editor with instructions, assets and a live preview, saved to a Theme Manager with 45+ presets.
- ADOPT: **The Edit Agent panel** (role, goal, instructions, model, temperature) with two-way sync and section-level patching of user edits.
- ADOPT: **The deploy model:** Marketplace toggle and fields, **rename subdomain**, **deploy without GitHub → Export to my GitHub**, and **manual Re-deploy after preview**.
- ADOPT: **The integration Connect → scopes → Allow flow**, account-scoped MCP with a green-dot status, and the **"never fake a tool"** rule.
- ADOPT: **Per-agent and per-phase credit breakdown** (Plan, Agent Creator, UI, Build, Testing; tokens in, out and cached).
- ADOPT: **Responsible AI and the Hallucination Manager** as reusable policies, surfaced as one-click toggles per agent.
- ADOPT: **GitAgent/OpenGAP** as the portable, developer-owned agent format, with export to other runtimes.
- ADOPT: **Persona entry pages** that open on a prompt box and three role-specific suggestions.
- ADOPT: **The enterprise admin view** (app inventory, users, opportunity map, build-session sentiment, traces).

### IMPROVE (fix the observed pain points; this is where to differentiate)
- IMPROVE: **Replace the black-box wait with a live build timeline.** Stream each plan item as it happens: agent created, tool attached, file written, test passed. Give an honest ETA that recalibrates, a running cost counter, and let the user keep planning or chatting while it builds. No mini-game.
- IMPROVE: **Estimate before spending.** At "Start Building", show an estimated time and cost range, with a budget cap, and "don't charge for failed auto-fix loops".
- IMPROVE: **A scope contract at plan approval.** Show a diff of "You asked for A, B, C → the plan covers A and B; C is deferred because…", with one-click "include it". This addresses the silent scope cuts.
- IMPROVE: **Data honesty.** Put a persistent "Sample data" badge on any widget fed by mock data, plus a "Connect real data" checklist that blocks or warns at deploy. This addresses the silent sample-data fallback.
- IMPROVE: **Remove the Studio round-trip.** Bring tools, KB, guardrails, memory, simulations, traces, A2A agents and SuperFlow triggers *into* the Agents tab. A simple card view is the default, and it expands into the full configuration, YAML and code for developers.
- IMPROVE: **Progressive depth instead of two lenses.** Every project, for every user, has a hidden-by-default **Code** tab (Monaco editor, file tree, terminal, diff review, logs and console). Add jargon-hiding labels for business users: "Creativity" instead of "temperature", and no raw IDs. Many candidates propose a dual-mode toggle, so the differentiation is *context-sensitive disclosure*: a developer affordance appears where it is relevant, such as "View code for this agent's tool".
- IMPROVE: **Real version history.** A checkpoint per prompt on a visual timeline, preview-before-restore, compare, and "undo last change". Squash auto-commits into meaningful commits with AI-written messages, add deploy history, and allow one-click rollback.
- IMPROVE: **Import anything:** GitHub in any framework (auto-detected), zip or local folder (via a CLI), Figma frame to UI, screenshot or URL to a UI clone, and **existing agents via A2A/OpenGAP** (LangGraph, CrewAI, OpenAI Agents SDK). Follow the import with a repo map: detected agents, routes, env vars missing, what to fix first.
- IMPROVE: **Agents in any framework:** a per-agent runtime picker (Lyzr, LangGraph, CrewAI, OpenAI Agents SDK, Google ADK, Mastra, GitAgent) with a common tool and MCP layer, plus export and eject. Expose each agent's **REST endpoint and API key** ("Use this agent via API"), which Studio already generates.
- IMPROVE: **First-class triggers.** The agent graph should show inputs such as Chat, Voice, **Schedule (cron)**, **Webhook**, Email and Form, as the landing demo already implies, plus human-approval nodes. This is backed by SuperFlow semantics.
- IMPROVE: **Git workflow in-app:** create branches, open PRs, review AI changes as a diff or PR, get a preview deployment per branch, and protect main.
- IMPROVE: **Environments:** Dev, Staging and Prod, each with its own env vars, DB and URL, a **Promote** action and approval gates for enterprise.
- IMPROVE: **Preview power:** device toggles, a route/URL bar, a console drawer, point-and-click element selection ("change this"), a test-persona switcher, and an **agent playground** beside the app preview.
- IMPROVE: **A pre-deploy checklist:** real data connected, secrets present, auth on routes, guardrails on, Testing agent passed, agent-eval score, accessibility.
- IMPROVE: **A custom-domain wizard** with DNS records, live verification and SSL status.
- IMPROVE: **Post-deploy observability** in the project: usage analytics, agent traces, cost per conversation and an error inbox. This replaces today's "Analytics dashboard — Soon".
- IMPROVE: **Collaboration:** roles (Owner, Editor, Viewer, Commenter), presence, comments pinned to preview elements or PRD lines, an activity feed with attribution, and **fork/remix** as well as shared editing.
- IMPROVE: **Try before sign-up** everywhere. The main home page should also open on the composer and run the first planning questions and PRD before asking for sign-in at "Start Building".
- IMPROVE: **A developer surface outside the browser:** a CLI (`architect pull/push/dev/deploy`), a real public API, and an **Architect MCP server** so Claude Code, Cursor or Codex can drive projects.
- IMPROVE: **Information architecture.** One noun (Project) and one place for ideas (a "Start" hub combining the consultant, the library and templates). Move learning content out of the primary sidebar; the teardown counted 10 of 17 items as learning content.

### AVOID
- AVOID: **Splitting the core loop across two products**, which forces context switches to edit or debug agents.
- AVOID: **Black-box waits and optimistic ETAs.** "4–6 min" that becomes 20 minutes erodes trust faster than an honest "15–25 min".
- AVOID: **Silent degradation**, such as sample-data fallbacks and quietly dropped requirements.
- AVOID: **Opaque dollar-credits** spent by both build and runtime without estimates, caps or alerts.
- AVOID: **"Soon" chips on pricing and core surfaces**, and a product still labelled "Beta". Ship fewer things completely.
- AVOID: **Marketing that the product doesn't back up**, such as the SEO pages' drag-and-drop canvas when the product is chat-first.
- AVOID: **Hard single-stack lock-in** (Next.js plus a NoSQL DB only). Keep a great default, but allow overrides.
- AVOID: **Exposing internals to non-technical users** (raw IDs, manifest.json, temperature) while giving developers nothing deeper.
- AVOID: **Noisy auto-commits and auto-redeploys.** Architect itself reverted auto-redeploy in v2.0.1.
- AVOID: **Me-too submissions.** A generic dual-mode toggle, chat-left and preview-right, and a framework dropdown are what most competing candidates show. Anchor the design in the evidence-backed pain points above.

---

## Sources

**Official: Architect docs (docs.architect.new), all re-read 2026-09-26**
- Index: https://docs.architect.new/llms.txt; https://docs.architect.new/llms-full.txt
- Introduction and platform:
  - https://docs.architect.new/introduction/overview/introduction; …/why-architect; …/best-use-cases
  - https://docs.architect.new/introduction/platform/how-it-works; …/ai-consultant; …/agentlets (Marketplace); …/architect-vs-studio; …/usage
  - https://docs.architect.new/introduction/essentials/prerequisites; …/plans-credits; …/help-support
- Build:
  - https://docs.architect.new/build/build-guide; …/planning-brainstorming; …/plan-mode; …/custom-theme; …/database-auth; …/deployment
  - https://docs.architect.new/build/github-connect; …/artifacts; …/environment-variables; …/git-agents; …/prompt-library; …/share-app
- Integrations: https://docs.architect.new/integrations/custom-tools/custom-tools; …/mcp-servers; the per-tool pages listed in llms.txt
- References: https://docs.architect.new/references/best-practices; …/faqs
- Changelog: https://docs.architect.new/changelog/overview; /v2-0-0; /v2-0-1; /v2-0-2; /v2-1-0; /v2-2-0
- https://docs.architect.new/api-reference/openapi.json (placeholder spec)

**Official: architect.new public pages (read logged-out in a browser, 2026-09-26)**
- https://www.architect.new/ (sign-in card; the pricing modal's Plans and Top Up tabs; the For Work menu)
- https://www.architect.new/for/ai-agencies (persona page with composer)
- https://www.architect.new/enterprise
- https://www.architect.new/resources (106 use cases, 19 tutorials); https://www.architect.new/sitemap.xml
- https://architect.new/use-cases/ai-infrastructure/build-a-multi-agent-ai-app-without-code (SEO claims)
- https://code-quest-mega-gear-97jp.architect.space (a live generated app; domain evidence)
- https://lyzr.architect.new/ (title only)

**Official tutorials (tella.tv, 2026-04-24 to 05-03)**
- https://www.tella.tv/video/how-to-connect-github-to-architect-3fzp
- https://www.tella.tv/video/iterating-on-your-ai-app-without-code-ailt
- https://www.tella.tv/video/how-to-fix-errors-in-architect-7e20
- https://www.tella.tv/video/editing-agent-instructions-in-architect-and-studio-2yow
- https://www.tella.tv/video/how-to-deploy-the-agent-on-architect-aze8
- https://www.tella.tv/video/how-to-iterate-your-prd-before-building-an-ai-agent-gx8r
- https://www.tella.tv/video/optimize-architect-credits-with-better-prompts-0wvv
- https://www.tella.tv/video/how-to-connect-third-party-tool-in-architect-9rgr
- https://www.tella.tv/video/building-a-voice-support-agent-in-architect-1-b87z
- https://www.tella.tv/video/how-to-use-the-architect-prompt-library-f92r
- https://www.tella.tv/video/getting-started-with-what-should-i-build-d2n9
- https://www.tella.tv/video/set-up-databases-auth-with-architect-8dwg
- From the earlier pass (not re-checked): …/how-to-add-a-knowledge-base-to-your-ai-agent-2jch, …/how-to-enable-responsible-ai-in-architect-frql, …/building-ai-agents-with-architect-1vk5, …/how-to-test-your-ai-agents-in-architect-studio-gqa6, …/building-custom-integrations-in-studio-63w8, …/how-to-share-your-apps-with-teammates-hr0n, …/how-to-build-your-first-ai-agent-with-architect-9rr1

**Lyzr platform, Studio and open source**
- https://www.lyzr.ai/; https://www.lyzr.ai/architect/; https://www.lyzr.ai/lyzr-agent-studio/
- https://docs.lyzr.ai/llms.txt; https://docs.lyzr.ai/enterprise/get-started/architecture.md; https://docs.lyzr.ai/enterprise/get-started/intro.md
- https://docs.lyzr.ai/enterprise/get-started/concepts/multi-agent-orchestration.md; https://docs.lyzr.ai/enterprise/integrations/a2a-protocol.md; https://docs.lyzr.ai/enterprise/agent-studio/voice/overview.md
- https://github.com/open-gitagent/gitagent-protocol; https://www.lyzr.ai/blog/gitagent/; https://www.producthunt.com/products/gitagent-2
- https://www.lyzr.ai/blog/agent-simulation-engine/
- https://aws.amazon.com/marketplace/pp/prodview-eoostoonb4wxg

**Press, launch and company**
- https://siliconangle.com/2026/02/06/exclusive-startup-lyzr-ai-launches-app-builder-aimed-moving-agents-production-volume/
- https://natlawreview.com/press-releases/lyzr-launches-architect-first-enterprise-grade-text-agent-platform-building
- https://www.producthunt.com/products/architect; https://www.producthunt.com/products/architect/launches
- https://www.linkedin.com/posts/sivasurend_architect-productionization-activity-7389468985257459712-VJXf
- https://techcrunch.com/2026/07/09/an-ai-agent-startup-just-let-its-agent-run-its-100-million-fundraise/; https://thenextweb.com/news/lyzr-ai-agent-100-million-series-b; https://www.bloomberg.com/news/articles/2026-07-09/a-startup-that-builds-ai-agents-used-one-to-raise-100-million
- https://the-agent-report.com/2026/07/lyzr-ai-agent-sivaclaw-100m-fundraise-july-2026/ (ARR; secondary)
- https://www.einpresswire.com/article/942704499/lyzr-launches-opencontroller-to-give-enterprises-visibility-into-ai-agent-spend-and-performance
- https://lyzr-agentathon.devpost.com/; https://www.hackerearth.com/challenges/hackathon/lyzr/
- YouTube (titles only; pages unreadable): https://www.youtube.com/watch?v=UBgvrccLTpk, https://www.youtube.com/watch?v=3Cvy5f6Bft0, https://www.youtube.com/watch?v=5hg1BOdF1-Q, https://www.youtube.com/watch?v=2FELCW84iJI, https://www.youtube.com/watch?v=i3j2r9v4cmU

**Third-party reviews and hands-on (lower reliability)**
- https://github.com/shambhu-10/lyzr (the only first-hand teardown of the real product; a single user)
- https://www.g2.com/products/lyzr-lyzr-ai/reviews (snippets via search; the page returns 403; about Lyzr overall)
- https://www.salesforge.ai/blog/lyzr-ai-review (about Lyzr overall, not Architect; updated 2026-04-24)
- https://aiagentsquare.com/agents/lyzr (Studio pricing, 2026-07-04)
- https://www.funblocks.net/aitools/reviews/architect-by-lyzr (generic; describes a canvas the docs don't have)
- Competing "Architect 2.0" assignment repos (design patterns only, not product facts): github.com/HeyImAnuj/architect-2, eppisai/architect-2, shivamATpaytm/Architect-2.0, abhikatkar/architect-2, not-your-averagetechie/architect-2, Vinay-rajpal/Lyzrarchitect, adminthelinkai/lyzr-architect-2-tpm, Abhay-SKulkarni123/Lyzr
