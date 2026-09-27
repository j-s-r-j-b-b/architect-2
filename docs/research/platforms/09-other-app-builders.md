# Other Prompt-to-App Builders: Competitive Research Report

*Researched 2026-09-26 for the Architect 2.0 design assignment. Covers **Bolt.new, Base44, Google AI Studio (Build mode) / Firebase Studio, Anything, Leap.new and Dyad** in depth, plus shorter notes on **Tempo Labs, Same, Macaly, Mocha, Softgen, Genspark and Manus**. Main sources: official docs, changelogs, release notes, pricing pages and launch posts. Secondary sources: TechCrunch, CNBC, MacRumors, Hacker News, Trustpilot, Product Hunt and review blogs. Anything I could not confirm is marked **(unverified)**. Where I describe a layout from docs text rather than from a screenshot, I say so. No accounts were created.*

---

## 0. Snapshot (status as of late September 2026)

| Product | Category | What it builds | Entry price (paid) | 2026 status |
|---|---|---|---|---|
| **Bolt.new** (StackBlitz) | Browser prompt-to-app builder with an in-browser runtime | Web apps (Vite/React, Next, Astro, etc.), Expo mobile, and now slides | Pro $25/mo; new **Lite $9/mo** (Forge agent only) | Very active: weekly releases; Bolt Cloud (DB, hosting, domains); multiplayer; Bolt Forge on open-source models ([release notes](https://support.bolt.new/release-notes)) |
| **Base44** (Wix) | All-in-one "batteries included" no-code app builder, plus an agent platform | Web apps on a proprietary backend (Deno functions + Base44 SDK); web-view mobile wrappers | Starter $16/mo | Very active: "Superagents" (Mar 2026), Production Pack (Jun 2026), GitHub 2-way sync and branches ([changelog](https://docs.base44.com/changelog/product)) |
| **Google AI Studio – Build** | Free Gemini-powered vibe-coding surface | Full-stack React/Angular/Next + Node, and **native Android (Kotlin/Compose)** | Free UI; you pay for Gemini API and Cloud Run | Big upgrades Mar 2026 (Antigravity agent + Firebase) and at I/O May 2026 (Android, Play). **Firebase Studio is being sunset** ([Google blog](https://blog.google/innovation-and-ai/technology/developers-tools/full-stack-vibe-coding-google-ai-studio/), [Firebase](https://firebase.google.com/docs/studio/migrating-project)) |
| **Anything** (formerly Create.xyz) | Mobile-first prompt-to-app builder with in-app App Store submission | Expo (React Native) iOS/Android plus Next.js web; Postgres | Pro $19/mo; Max $199/mo | Pulled from the App Store twice (Mar–Apr 2026); official migration partner for Mocha; CLI for agents ([TechCrunch](https://techcrunch.com/2026/04/14/how-vibe-coding-app-anything-is-rebuilding-after-getting-booted-from-the-app-store-twice/), [docs](https://www.anything.com/docs/llms.txt)) |
| **Leap.new** (Encore) | Developer-grade AI agent for backend-heavy apps that deploys to your own cloud | Encore.ts microservices + frontend; deploys to AWS/GCP | Pro $30/mo (100 credits) | Launched May 2025. I found **no notable 2026 launches** ([Encore blog](https://encore.dev/blog/leap-is-here)) |
| **Dyad** | Local, open-source desktop builder; bring your own key | React/Next apps on your machine; Capacitor mobile | Pro $20/mo (optional) | Very active: v1.16 (21 Sep 2026) and v1.17 beta (24 Sep 2026) ([GitHub releases](https://github.com/dyad-sh/dyad/releases)) |
| Tempo Labs | Went from "PRD + design canvas builder" to "IDE for the whole team" | React/Vite on your real repo | Pro $30/mo; Agent+ about $4k/mo | Repositioned ([tempo.new](https://www.tempo.new/)) |
| Mocha | Beginner full-stack builder | — | — | **Shut down 1 Aug 2026** ([Mocha blog](https://getmocha.com/blog/mocha-shutdown/)) |

---

## 1. Positioning: what makes each one different

### Bolt.new
- **"Professional vibe coding" that runs in your browser.** Bolt came out of StackBlitz's WebContainers, which run Node inside the browser tab. Reviewers still credit it with the "fastest prompt-to-deployment speed in category via in-browser WebContainers" ([preuve.ai, Sep 2026](https://preuve.ai/blog/bolt-new-review)). Bolt required Chromium until July 2026, when it added Safari with a "hosted preview mode" and read-only code view ([release notes](https://support.bolt.new/release-notes)). That split confirms the in-browser runtime is still the main architecture.
- **Bolt v2 (2 Oct 2025)** added top coding agents, a built-in backend (hosting, database, storage) and "autonomous debugging" that it claimed cut error loops by 98%. It also claimed projects "1000x bigger" than v1 ([Bolt blog](https://bolt.new/blog/bolt-v2)). The tagline was "Today vibe coding goes pro" ([X](https://x.com/boltdotnew/status/1973063093849567591)).
- **2026 direction:** team and enterprise features (multiplayer, roles, design systems, org-level GitHub, admin controls on integrations), a cheaper open-model agent (Forge / Lite), and new output types beyond apps (**Bolt Slides**, Jul 2026) ([release notes](https://support.bolt.new/release-notes)).

### Base44
- **"Batteries included."** The UI, database, auth, hosting, analytics, email and integrations are all first-party. You don't need Supabase or Vercel ([NoCode MBA, Jun 2026](https://www.nocode.mba/articles/base44-review)). One reviewer called it "the Squarespace of AI app builders."
- **Backed by Wix and growing fast.** Wix bought it in June 2025 for $80M, and total consideration now exceeds $150M after earn-outs ([Ctech, 4 Aug 2026](https://www.calcalistech.com/ctechnews/article/5gj9agi67)). It passed $100M ARR by Q4 2025 ([Seeking Alpha](https://seekingalpha.com/news/4560867-wix-outlines-mid-teens-revenue-growth-for-2026-as-ai-strategy-accelerates-base44-surpasses)) and had 2M users in Nov 2025 ([Ctech](https://www.calcalistech.com/ctechnews/article/sy194qsg11g)). About $150M ARR by May 2026 is reported by aggregators **(unverified)**.
- **Moving from "app builder" to "app + agent platform."** Superagents (11 Mar 2026) are persistent autonomous agents you reach on WhatsApp, Telegram or Slack ([Wix press](https://www.wix.com/press-room/home/post/base44-launches-superagents-making-autonomous-ai-agents-accessible-to-anyone)). They now come with 130+ skills ([TestingCatalog](https://www.testingcatalog.com/base44-launches-skills-library-for-superagents-with-130-options/)).

### Google AI Studio (Build mode) / Firebase Studio
- **Free, Gemini-native and Google-infra-native.** Build mode has no subscription. You pay only for Gemini API usage above the free tier and for Cloud Run. The Mar 2026 relaunch turned it from a prompt playground into a full-stack environment. It uses the **Antigravity** coding agent, **Firebase** (Firestore + Auth), a secrets manager, npm packages and a framework choice of React, Angular or Next.js ([Google blog, 18 Mar 2026](https://blog.google/innovation-and-ai/technology/developers-tools/full-stack-vibe-coding-google-ai-studio/)).
- **The only one here that builds native Android.** Since I/O (19 May 2026) it generates Kotlin/Jetpack Compose apps with an **Android emulator embedded in the browser**, can install over USB via ADB, and publishes to a Google Play internal test track ([Google blog, I/O 2026](https://blog.google/innovation-and-ai/technology/developers-tools/google-ai-studio-io-2026/); [Android Developers](https://android-developers.googleblog.com/2026/05/build-android-apps-google-ai-studio.html)).
- **Consolidation:** Google is folding **Firebase Studio** (the cloud IDE with the "App Prototyping agent") into AI Studio for prompt-first work and Antigravity for code-first work ([Firebase migration doc](https://firebase.google.com/docs/studio/migrating-project)).

### Anything (formerly Create.xyz)
- **Mobile-first with a real path to the App Store.** It builds Expo/React Native apps, previews them on your phone via Expo Go, and automates build, signing and upload to App Store Connect and TestFlight from the browser ([docs: App Store](https://www.anything.com/docs/launch/app-store.md)). It has monetisation built in: Stripe, RevenueCat and Ads ([docs index](https://www.anything.com/docs/llms.txt)).
- **An autonomous "Max" agent** builds, then opens the app in a real browser or iOS simulator, clicks through it, and fixes what it finds. Runs typically take about 30 minutes and 100+ steps, and several agents can run in parallel ([docs: Max](https://www.anything.com/docs/builder/max.md)).
- **Traction and turbulence:** a $100M valuation in Sep 2025 after $2M ARR in its first two weeks. Apple then removed its iOS app twice under guideline 2.5.2 in March–April 2026 ([TechCrunch](https://techcrunch.com/2026/04/14/how-vibe-coding-app-anything-is-rebuilding-after-getting-booted-from-the-app-store-twice/); [MacRumors](https://www.macrumors.com/2026/03/30/apple-pulls-vibe-coding-app/)).

### Leap.new
- **A backend-first builder for developers.** It generates Encore.ts microservices with infrastructure-as-code (databases, pub/sub, cron, secrets). It shows a live architecture diagram and an API explorer, and deploys to your own AWS/GCP account, positioned as "no vendor lock-in, no proprietary hosting" ([Leap docs](https://docs.leap.new/getting-started/introduction); [Encore blog, 31 May 2025](https://encore.dev/blog/leap-is-here)).
- **Changes work like pull requests.** Each revision produces a diff to review, and previews run in isolation from production ([Encore blog](https://encore.dev/blog/leap-is-here)).

### Dyad
- **"The open-source AI app builder on your desktop."** It runs locally on Mac and Windows with no sign-up, you bring your own API keys, and it can use local models (Ollama, LM Studio) ([dyad.sh](https://www.dyad.sh/)). Licensing is Apache 2.0, except `src/pro`, which is under FSL 1.1 (fair-source). It has about 21.6k GitHub stars ([GitHub](https://github.com/dyad-sh/dyad)).
- **Pay with subscriptions you already have.** v1.16 (21 Sep 2026) lets free users build using a ChatGPT or Codex subscription. v1.17 beta adds an experimental **Claude Code integration** ([releases](https://github.com/dyad-sh/dyad/releases)).

### Others, briefly
- **Tempo Labs** used to be "Prompt. Develop. Design. Collaborate.": PRD, then user-flow diagram, then a visual React canvas ([NoCode MBA](https://www.nocode.mba/articles/tempo-app-builder-review); [vibecoding.app, Feb 2026](https://vibecoding.app/blog/tempo-review)). It now markets itself as **"The IDE for the whole team"**, where canvases are code in your repo, built from your real components, and ship as a PR ([tempo.new](https://www.tempo.new/); [search summary of site copy](https://www.tempo.new/progress)). **Agent+** offers agents plus *human* engineers and designers building 1–3 features a week ([Tempo Agent+](https://www.tempo.new/ai-agent-plus)).
- **Same (same.new, formerly same.dev)** is known for cloning a site from a URL or screenshot. Its docs describe an "agentic environment" with history/revert and web deploy, "trusted by 600,000+ builders" ([docs.same.new](https://docs.same.new)). A competitor's page says it is frontend-only with no backend or hosting ([Fabricate](https://fabricate.build/alternatives/same)). That conflicts with Same's docs, so its backend depth is **(unverified)**.
- **Macaly** is a Next.js builder for marketing sites and apps with a Convex database, hosting, SEO, analytics and A/B testing. Its "self-healing" loop runs Playwright tests and fixes bugs automatically ([MakerStack](https://makerstack.co/reviews/macaly-review/)). Pricing is inconsistent across sources **(unverified)**.
- **Mocha** shut down on 1 Aug 2026. Reasons given: acquisition costs, AI token unit economics and support costs. Anything is the migration partner ([Mocha blog](https://getmocha.com/blog/mocha-shutdown/); [Mocha on X](https://x.com/get_mocha/status/2055399529009299746); [Anything docs](https://www.anything.com/docs/import/mocha.md)).
- **Softgen** generates Next.js + Supabase/Firebase apps, with Stripe and Resend wired in. Its pricing is unusual: roughly a **$33/year licence plus pay-as-you-go AI usage** ([Vitara](https://vitara.ai/softgen-ai-review/); [search summary of Capterra/others](https://www.capterra.com/p/10027229/Softgen/)). Secondary sources only.
- **Genspark** offers "Genspark Code" (formerly AI Developer) inside a multi-agent workspace that also covers slides, images and phone calls. Its Super Agent reportedly hit $36M ARR in 45 days ([OpenAI case study](https://openai.com/index/genspark/); [The Rundown](https://www.therundown.ai/tools/genspark-ai-developer)).
- **Manus** has a web-app builder with a built-in database, login, auto-configured Stripe *sandbox* products and checkout, one-click domains (including buying them), a "design edit mode", analytics and real-time notifications for sign-ups ([manus.im](https://manus.im/features/webapp)). Meta's $2B acquisition was blocked by China on 27 Apr 2026 ([CNBC](https://www.cnbc.com/2026/04/27/meta-manus-china-blocks-acquisition-ai-startup.html)). Reports say Manus then went independent **(dates of unwinding unverified; [Wikipedia](https://en.wikipedia.org/wiki/Manus_(AI_agent)))**.

### Cross-product: unique ideas not seen (or not emphasised) in Lovable, Replit or v0
Some of these may have partial equivalents in those three. The list is about what each product does *distinctively*.

1. **Preview runs in the browser (Bolt WebContainers).** No per-user VM for dev previews, near-instant boot, and it works offline once loaded. The trade-off is browser lock-in: Chromium first, Safari only in a degraded mode ([release notes](https://support.bolt.new/release-notes)).
2. **Prompt queue (Bolt).** You can line up to 20 prompts while the agent works, then edit, reorder, pause or delete them. In multiplayer, each queued prompt shows who sent it ([chat tools](https://support.bolt.new/building/chat-tools.md)). Base44 added mobile message queuing and "In-Message Runs", where new messages join the active run ([changelog](https://docs.base44.com/changelog/product)).
3. **Agents named by effort, not by model (Bolt Standard/Max/Forge; Anything Thinking/Fast/Discussion/Plan/Max).** There is also a cheap open-model tier: Bolt Forge runs GLM, Kimi and DeepSeek, sold as a $9/mo **Lite** plan ([release notes](https://support.bolt.new/release-notes); [Anything agent](https://www.anything.com/docs/builder/agent.md)).
4. **Import from a competitor as a first-class entry point.** Bolt has "Import from Lovable" through GitHub ([doc](https://support.bolt.new/integrations/lovable-import.md)). Anything migrates Mocha apps, including production data, users and OAuth identities, rewriting to Next.js and moving SQLite to Postgres ([doc](https://www.anything.com/docs/import/mocha.md)). Dyad imports Lovable, v0 and Bolt apps and generates an `AI_RULES.md` ([doc](https://www.dyad.sh/docs/guides/importing)).
5. **Canvas of live page frames (Base44).** Every page sits on an infinite board as a live frame at desktop, tablet or phone size. Sticky notes connected to a frame have a **"Send to chat"** button that applies the note to that page. It has multiplayer named cursors and a "four design options side by side" redesign ([Base44 Canvas doc](https://docs.base44.com/Building-your-app/Canvas)).
6. **A pre-publish "Production Pack" on every plan (Base44, 16 Jun 2026).** *Verification* reviews code in the background as it is written. The *Testing Agent* clicks through the app like a user from a fresh, empty session and suggests one-click fixes. *Security Scan* checks access rules and dependencies ([Base44 blog](https://base44.com/blog/base44-app-review)). Bolt has a token-free security audit in the Publish menu (paid plans, 30 a day) ([Bolt security](https://support.bolt.new/building/security.md)).
7. **Agents that live outside the app (Base44 Superagents).** Each agent can have its own WhatsApp or Telegram number and phone number, join Zoom or Meet and take notes, pursue long-running "Goals", run schedules and triggers, and keep persistent memory ([changelog](https://docs.base44.com/changelog/product); [Superagents](https://base44.com/superagents)).
8. **Separate dev and prod databases, with only the schema migrated on publish (Anything).** Test data never leaks into production, and you can reset the schema to the last published state ([Anything DB doc](https://www.anything.com/docs/apps/databases.md)).
9. **A long-running QA agent that uses a real browser (Anything Max; Macaly's Playwright loop; Base44 Testing Agent).**
10. **Shipping to app stores from the browser.** Anything handles App Store build, signing and TestFlight. AI Studio creates the Play internal-testing app record, packages the bundle and uploads it, with an **in-browser Android emulator and ADB-over-USB install** ([Android blog](https://android-developers.googleblog.com/2026/05/build-android-apps-google-ai-studio.html)).
11. **Architecture as a first-class view (Leap).** Tabs for Architecture diagram, Infrastructure, Service Catalog/API explorer, and distributed tracing, plus deploy to your own AWS/GCP ([Leap interface](https://docs.leap.new/understanding-your-leap-app/leap-interface.md)).
12. **Local-first with your own keys, local models, or subscriptions you already pay for (Dyad)** ([releases](https://github.com/dyad-sh/dyad/releases)).
13. **Free hosting with no billing account (AI Studio Starter tier: 2 apps)** and an `*.ai.studio` subdomain. **Export to a local IDE (Antigravity) that keeps conversation history, files and secrets** ([deploy doc](https://ai.google.dev/gemini-api/docs/aistudio-deploying); [I/O blog](https://blog.google/innovation-and-ai/technology/developers-tools/google-ai-studio-io-2026/)).
14. **The builder as an API/CLI for other agents (Anything CLI).** `--json` output, exit codes, and an `anything skill` command so coding agents can drive the builder ([Anything CLI](https://www.anything.com/docs/cli.md)).
15. **"Act as a user" role impersonation in preview (Base44)** ([quick start](https://docs.base44.com/Getting-Started/Quick-start-guide)).
16. **Branches that work as full app copies**, with backend functions per branch and **credits tracked per branch** (Base44, Aug–Sep 2026) ([changelog](https://docs.base44.com/changelog/product)).
17. **Paid human QA as a tier (Tempo Agent+)** ([Tempo](https://www.tempo.new/ai-agent-plus)).
18. **Free manual edits and free error fixes.** Bolt visual edits are free and only *saving* uses tokens. Base44 Edit mode is free. Tempo error fixes are free, up to 7 "Fix with AI" in a row ([release notes](https://support.bolt.new/release-notes); [Base44 blog via search](https://base44.com/blog/base44-ai-app-builder); [NoCode MBA Tempo pricing via search](https://www.nocode.mba/articles/tempo-pricing)).
19. **"AI Visibility for SEO" (Base44, Sep 2026).** Shows how AI assistants describe your app ([changelog](https://docs.base44.com/changelog/product)).
20. **Breach-checked passwords on by default for end-user auth (Bolt, Jun 2026)** ([release notes](https://support.bolt.new/release-notes)).

---

## 2. Who uses each one and why (jobs to be done)

| Product | Non-technical users | Technical users |
|---|---|---|
| **Bolt** | Founders, agencies and marketers who want a live site or app quickly; teams applying brand design systems (Porsche and Cloudscape are preloaded) ([release notes](https://support.bolt.new/release-notes)) | Front-end devs who want instant in-browser environments, GitHub sync, `@`-file targeting, locked or targeted files, MCP servers and claude.md context |
| **Base44** | The core audience: solo makers, SMBs, internal-tool builders, e-commerce (Wix store connection), and people who want an "AI employee" (Superagents) | A growing segment: GitHub 2-way sync, a local CLI (`base44 dev`), branches, AGENTS.md support and API key scopes ([GitHub doc](https://docs.base44.com/developers/app-code/local-development/github)) |
| **AI Studio Build** | Curious users and students (free, "I'm Feeling Lucky"), Workspace users building on Sheets or Drive | Gemini API developers prototyping AI features; Android devs; people who graduate to Antigravity |
| **Anything** | People who want a phone app in the App Store with in-app purchases, without learning Xcode | Some developers value the CLI/API and code export; mostly non-technical |
| **Leap** | Few. Reviews call it "technically demanding" ([search summary](https://ai-review.com/developer-tools/leap/)) | Backend and platform engineers, SaaS or API products, teams that need data residency in their own cloud |
| **Dyad** | Budget and privacy-sensitive hobbyists and students ("Hobbyists, students, anyone on a tight budget", [pricing](https://www.dyad.sh/pricing)) | Power users who want model choice, local code, no lock-in and their own Git |

**Recurring jobs across products:**
- "Get from idea to a live URL today."
- "Don't make me wire Supabase, Vercel and Stripe separately."
- "Get my app into the App Store."
- "Let me keep my code and leave if I want."
- "Automate recurring work with an agent I can text."

---

## 3. Feature inventory

### 3.1 Comparison matrix (verified items; see per-product notes for sources)

| Area | Bolt.new | Base44 | AI Studio Build | Anything | Leap | Dyad |
|---|---|---|---|---|---|---|
| Prompt entry extras | Attach files, Figma frame, Stitch import, templates marketplace, enhance-prompt Q&A, voice, `@` files | Plan mode, existing URL, Figma, tool connections, design-style picker, attachments, voice | AI Chips, I'm Feeling Lucky, gallery remix, speech-to-text | `+` or `/` integrations, image refs, files, Mobbin/Sleek/Figma import | Plain chat prompt | Chat prompt, templates |
| Modes | Build / Plan; agents Standard, Max, Forge | Build / Discuss (plus Plan at start); model picker, compare models | Chat + checkpoints (plan approval) | Thinking, Fast, Discussion, Plan, Max | Chat → PR-like diffs | Build / Ask / Agent (Basic, Pro); Blueprint flow |
| Visual editing | Select tool + Visual Edits (free until saved), layer picker | Edit mode (free), Canvas, design options | Annotation mode | Element selector | — | Select component |
| Code / file tree | Code view with file list, target/lock files, "Ask Bolt" on selection | Code tab (paid), version code compare | Code tab | Preview/Code toggle | Code tab with git diffs | Local files; open in VS Code |
| Backend | Bolt Database (tables, auth, storage, server functions, secrets, users, logs) or Supabase | Built-in entities DB, auth, backend functions (Deno), workflows, email | Firestore + Firebase Auth; Node server; secrets | Postgres (Neon) dev+prod, auth, backend routes, uploads | Encore services, DBs, pub/sub, cron, secrets | Supabase / Neon |
| AI agents in apps | Via code | In-app agents with Tools tab + WhatsApp/Telegram/LINE; Superagents | Gemini API wired server-side automatically | AI integrations | OpenAI/Anthropic integrations | Via code |
| Integrations / MCP | MCP servers (Notion, Linear, GitHub), Stripe, Netlify, Supabase | 100s of connectors (Stripe one-click, HubSpot, Slack…) | Workspace APIs, Maps, npm | 100+ integrations, Stripe, RevenueCat | Stripe, Resend, Clerk, PostHog, Prisma | MCP support |
| GitHub | Sync, import by URL, org GitHub app | 2-way sync (Builder+), import, AI conflict resolution, PR support | 2-way sync with conflict diff viewer (Aug 2026) | Code export (Pro) (GitHub **unverified**) | GitHub sync | Git/GitHub |
| Deploy / domains | Bolt Hosting `bolt.host`, buy or connect domains, DNS, Netlify | Publish, "Get domain", auto DNS, free domain for 1 year (Starter+) | Cloud Run; `*.ai.studio`; 2 free apps | Publish; custom domains; domain email | Encore Cloud or own AWS/GCP | Vercel, Cloudflare Workers (beta), Coolify |
| Mobile | Expo + Expo Go QR; EAS CLI to publish | Web-view wrapper for stores | Native Android + Play internal test | Expo; App Store & Play submission from builder | — | Capacitor (experimental) |
| History | Version history (clock icon), restore | Revert per message, Backup & Restore (data), branches, trash 30 days | Checkpoints (**unverified** detail) | Version cards with Restore | Git | Undo / versions |
| QA / security | Auto security review on publish; paid audit | Verification, Testing Agent, Security Scan (all plans) | — | Max autonomous testing | Preview envs, tracing | Security review; E2E tests in preview (v1.13) |
| Analytics / logs | Hosting analytics; DB logs | Analytics, logs (shareable filtered views), infra visibility | Cloud Run console (**unverified**) | Analytics, runtime logs, TestFlight logs | Encore tracing and metrics | System drawer / console |
| Collaboration | Real-time multiplayer, roles (Viewer, Editor, Co-owner) | Workspace groups, canvas multiplayer, app comments, publish approvals | Shared apps (use creator's quota) | Invite, unlimited collaborators (Pro) | Team plans | Git only |

### 3.2 Bolt.new: feature inventory (primary source: [release notes](https://support.bolt.new/release-notes) unless noted)
- **Onboarding / auth:** browser sign-in; project management moved from StackBlitz into Bolt (Jul 2025). Details of the sign-up screens are **(unverified)**.
- **Prompt entry:** blank prompt, **Marketplace templates** (Aug 2026), Figma frames (Jan 2026), **Google Stitch export** with screenshots and HTML pre-attached (May 2026), file upload, GitHub import (URL or "Your repositories"), **Lovable import**, Team templates ([start a project](https://support.bolt.new/building/start-project.md)). **Enhance prompt** now asks contextual questions first (May 2026). **Prompt library** saves prompts (Jul 2025).
- **Chat / agent:** agents **Standard** (free), **Max** (paid, deeper reasoning) and **Bolt Forge** (open models, research preview 14 Sep–14 Oct 2026) ([agents doc](https://support.bolt.new/building/using-bolt/agents.md)). **Plan Mode** toggle sits bottom-right of the chatbox and turns blue when on; an **"Implement this plan"** button switches to Build ([Plan mode](https://support.bolt.new/best-practices/plan-mode.md)). Discussion Mode and the v1 agent were retired in Aug 2026. Also: `@` file tagging (Apr 2026), dictation (Aug 2026), a **queue of up to 20 prompts** with pause and resume, a Stop button, `/clear` to reset context (Oct 2025), **Skills** as reusable instructions (Jul 2026), a completion chime (Sep 2025), a token-usage graph (Jul 2025), and auto error fixing tracked separately in chat (Jun 2025).
- **Preview / visual editing:** the Select tool adds an element to the chat. **Visual Edits** let you change text, colours and styles directly, with changes batched above the chatbox. Edits are free and saving uses tokens (Aug–Sep 2026). A layer picker handles overlapping elements (Apr 2026). **Device Preview** gives an Expo Go QR ([Expo doc](https://support.bolt.new/integrations/expo.md)).
- **Code view:** a `<>` toggle at top centre, a file list with right-click create or delete, **Target file**, **Lock file / Lock all**, and **"Ask Bolt"** on a highlighted code selection. Save with Ctrl+S ([code view](https://support.bolt.new/building/using-bolt/code-view.md)). Images can be previewed in the Code view (Jul 2025). Safari gets a read-only Code view.
- **Backend (Bolt Cloud):** **Bolt Database**, with unlimited databases, created automatically when needed. Settings tabs: Tables, Authentication, File Storage, Server Functions, Secrets, User Management, Logs, Security Audit, Advanced ([database doc](https://support.bolt.new/cloud/database.md)). Also: editable auth email templates (Nov 2025), RLS policy view, row editing and export, published databases no longer auto-pause (Jul 2026), database restart (May 2026), and Supabase as an alternative.
- **Integrations:** MCP servers such as Notion, Linear and GitHub (Feb–Mar 2026); Stripe; Netlify; private NPM registries (Teams). **AI image generation and Nano Banana image editing** in chat.
- **GitHub:** sync; the org-level GitHub app (Apr 2026); disconnect per project.
- **Deploy:** "Deploy" was renamed **Publish** (Jul 2025). The Publish panel shows status, link, last published time and unpublished changes. Bolt Hosting on `bolt.host` (editable), buying and connecting domains, DNS records, manual SSL, subdomains as primary, public or private site visibility separate from project sharing, and private link sharing of prototypes. The free tier shows a "Made in Bolt" badge.
- **Versions:** visual version history with one-click restore (Aug 2025), moved to a **clock icon in the top nav** (Jul 2026).
- **Security:** an automatic review on publish (Oct 2025), a full audit from the Publish menu (paid, token-free, 30 a day) ([security](https://support.bolt.new/building/security.md)), and leaked-password protection (Jun 2026).
- **Analytics:** visitors, page views, top pages and bandwidth (Sep 2025).
- **Collaboration:** real-time multiplayer in one shared chat thread; roles Viewer, Editor and Co-owner; a Projects dashboard with star, rename and transfer (Apr 2026); team token-usage table; admin restrictions on integrations.
- **Other:** **Bolt Slides**, a presentation builder with 3D models, sliders and maps, and an open-source component library (Jul–Sep 2026).
- **Pricing:** Free has 300K tokens a day and 1M a month. Pro is $25/mo with 10M+ tokens, and tokens **roll over for one extra month**. Teams is $30 per member per month. Enterprise adds SSO and audit logs ([pricing](https://bolt.new/pricing)). **Lite at $9/mo** is Forge-only (release notes, 14–20 Sep 2026). It did not appear on the pricing page when I fetched it.

### 3.3 Base44: feature inventory (primary source: [changelog](https://docs.base44.com/changelog/product) unless noted)
- **Entry points:** prompt; **Plan mode** (discuss before building); refine an **existing URL**; **Figma** (files up to 300MB, frames become pages, import mid-build); **tool connections** at start (Google Workspace, Slack, GitHub) ([quick start](https://docs.base44.com/Getting-Started/Quick-start-guide)). There is a design-style picker (Neo-Brutalism, Neumorphism, Material, Glassmorphism, Claymorphism) ([WebsiteBuilderExpert, Dec 2025](https://www.websitebuilderexpert.com/vibe-coding/base44-review/)), an **Idea Library** of categories ([NoCode MBA](https://www.nocode.mba/articles/base44-review)), and a **component library** in the chat `+` menu (Sep 2026).
- **Chat / agent:** Build and **Discuss** modes; Discuss is about 0.3 credits per message ([search summary](https://base44.com/blog/base44-ai-app-builder)). Also: **Revert** and **Edit** icons under each message; a left-side build checklist ("Generate schema", "Create routes", "Seed data") ([NoCode MBA](https://www.nocode.mba/articles/base44-review)); a model picker grouped by provider, remembered across apps; **Compare Models**, which runs one prompt on two models; web search in chat; a slash menu for skills and integrations; auto-collapsing finished tool groups; smart dictation; Cmd+K command palette.
- **Visual:** **Edit mode** (free manual edits; lists, table cells and buttons editable; element chips), **Canvas** (see §1), design options you can refine before applying, a 25+ licensed font catalogue, workspace font upload, design systems generated from text or from a website in about 9 minutes, and logo crop and zoom.
- **Backend:** built-in data entities (the Data tab has CSV import, table delete, data **Backup & Restore** searchable across 200+ tables); auth and SSO (Microsoft Entra, Okta, SSO auto-access for private apps); **backend functions** (no ceiling after Aug 2026; per branch); **Workflows**, multi-step with branching and signup/login triggers (Jul–Sep 2026); email to non-users (paid); payments guided setup and Stripe one-click keys.
- **AI inside apps:** **in-app agents** via Dashboard → **Agents**. The **Guidelines** tab has description, instructions, up to 10 context files and a model (Automatic, about 3 credits per message, or Gemini, GPT, Claude or GLM). The **Tools** tab covers entity CRUD, backend functions and permissions. Memory scope can be global, per user or both. Channels are **WhatsApp, Telegram and LINE**, with a maximum of 3 WhatsApp agents per account ([agents doc](https://docs.base44.com/Building-your-app/AI-agents-for-apps)). **Superagents** are standalone and have their own mobile tab.
- **Integrations:** 2026 connector additions include Klaviyo, Asana, Sentry, PagerDuty, Bitbucket, Polar, Mailchimp, Meta Ads, Intercom, Zoho CRM, Microsoft Office, Gumroad and Twitch. Also Google Ads campaign tooling and Wix Stores product management.
- **GitHub:** **2-way sync on Builder+**, `main` branch only. The CLI runs `npm i -g base44` and `base44 dev` for full local backend, or `--remote` for frontend only ([GitHub doc](https://docs.base44.com/developers/app-code/local-development/github)). GitHub import, AI merge-conflict resolution, semantic commits, co-authorship, approval prompts before writing, AGENTS.md support, and a protected main that makes the AI create branches (Jul–Sep 2026).
- **Deploy:** a **Publish** modal with **Web** and **Mobile app** tabs, app URL, **Get domain**, share, **App visibility** (public, invite-only, restricted), **Security status**, then Publish ([quick start](https://docs.base44.com/Getting-Started/Quick-start-guide)). Automatic DNS, a custom domain on Starter, and publish permissions and approvals by group.
- **Quality / security:** **Verification**, **Testing Agent** (with a screenshots gallery) and **Security Scan** (with code vulnerability scanning, fix tracking with checkpoints, and an audit-logs API).
- **Mobile:** app-store packaging as a **web-view wrapper**, with no push notifications or full offline mode ([third-party guide](https://axonbuild.com/blog/can-base44-make-mobile-apps); [Base44 docs page title](https://docs.base44.com/documentation/building-your-app/uploading-to-app-stores)). Details come from third parties **(partly unverified)**. iOS permission strings are localised into 25 languages, and there is a "Store preview" button (Sep 2026).
- **Collaboration and governance:** workspace groups, **app comments pinned to elements** (Aug 2026), email-domain auto-join, enterprise encryption keys, channel governance, API key scopes, and daily invite limits.
- **Pricing:** Free has 25 message credits and 100 integration credits, up to 5 apps. Starter is $16 (100 / 2,000), Builder $40 (250 / 10,000), Pro $80 (500 / 20,000), Elite $160 (1,200 / 50,000) per month. Enterprise is custom ([pricing](https://base44.com/pricing)). NoCode MBA reports these as annual-billing equivalents, so monthly billing is likely about 20% higher **(unverified)**.

### 3.4 Google AI Studio Build: feature inventory
- **Entry:** prompt plus **AI Chips** (for example image generation or Google Maps), **"I'm Feeling Lucky"**, remix from the **App Gallery** ("Copy App") ([Build docs](https://ai.google.dev/gemini-api/docs/aistudio-build-mode)), and speech-to-text ([BuildFastWithAI, Apr 2026](https://blog.buildfastwithai.com/google-ai-studio-vibe-coding-guide)). You choose web (React + Node) or **Android** (Kotlin/Compose).
- **Agent:** Antigravity keeps context, manages multiple files and runs "verified execution" ([Build docs](https://ai.google.dev/gemini-api/docs/aistudio-build-mode)). A checkpoint approval sits before architectural steps such as provisioning Firebase ([BuildFastWithAI](https://blog.buildfastwithai.com/google-ai-studio-vibe-coding-guide)).
- **Preview:** **Annotation mode** lets you highlight a UI element and describe the change. In-preview editing tools and Nano Banana asset generation arrived at I/O 2026. Android gets an embedded emulator and ADB install.
- **Backend:** Node runtime, automatic npm installs, a **Secrets** panel (server-side only; the Gemini key is auto-configured as a secret), Firestore, Firebase Auth ("Sign in with Google"), real-time multiplayer state, and Workspace APIs (Gmail, Sheets, Docs, Drive, Calendar).
- **GitHub:** **2-way sync**, with AI commit messages, pull, and a **Resolve conflicts** side-by-side diff (rolled out about 19–20 Aug 2026) ([search summary](https://aistudio.google.com/learn/sync-your-ai-studio-apps-with-github)). A developer-forum bug reports it saying "In Sync" when changes were not pushed ([forum](https://discuss.ai.google.dev/t/ai-studio-github-sync-says-in-sync-but-latest-changes-are-not-pushed-to-github/180483)).
- **Deploy:** **Publish** (top right), then **Get Started**, then **Publish App**, which gives a Cloud Run URL. Custom `your-app.ai.studio` subdomains are first-come, first-served. **Starter tier:** 2 apps, no billing account, one region, and not available to accounts with prior Cloud billing ([deploy doc](https://ai.google.dev/gemini-api/docs/aistudio-deploying)). Other options: ZIP download and **Antigravity export**.
- **Pricing:** the Build UI is free. Pro models left the free API tier on 1 Apr 2026, so only Flash and Flash-Lite remain free ([search summary of NoCode MBA and others](https://www.nocode.mba/articles/google-ai-studio-pricing)) **(secondary)**. When other people use a shared app, it spends the creator's quota ([Build docs](https://ai.google.dev/gemini-api/docs/aistudio-build-mode)).

### 3.5 Anything: feature inventory (docs at [anything.com/docs](https://www.anything.com/docs/llms.txt))
- **Modes:** Thinking (default), Fast, Discussion, Plan and Max, with a model override next to the mode picker. The agent fixes errors on its own, reads runtime logs and explores the codebase. Thinking-mode steps can be expanded to see its reasoning ([agent](https://www.anything.com/docs/builder/agent.md)).
- **Threads:** **New chat** starts a thread with its own context ([controls](https://www.anything.com/docs/builder/controls.md)).
- **Backend:** Postgres on Neon, with **dev and prod databases**, a viewer with a SQL runner, backups, SQL dump export, and 1 / 10 / 100 GB storage tiers ([databases](https://www.anything.com/docs/apps/databases.md)). Auth covers email plus Google, Facebook and X, and third-party mobile auth. Also backend routes, uploads, secrets, and **in-app purchases** (RevenueCat), Stripe (test mode by default, then one prompt to go live ([Griffin Wooldridge](https://griffinwooldridge.com/blog/anything-ai-app-builder-review))) and Ads.
- **Imports:** Mocha, Figma, Mobbin, Sleek.
- **Launch:** Publish, Branding & SEO, Domains, **Domain email**, Analytics, Submit to App Store, Submit to Play Store, and TestFlight logs.
- **Share:** embed as an iframe, invite a team, export, community.
- **Agents:** **Max** runs autonomous, parallel agents with browser and iOS-simulator testing, on $200+/mo plans ([Max](https://www.anything.com/docs/builder/max.md)). The **CLI/API** is in controlled rollout ([CLI](https://www.anything.com/docs/cli.md)).
- **Pricing:** Free has public projects and "unlimited messages" (as listed). Pro is $19/mo with 20K credits, private projects, custom domains, code export and 50GB. Max is $199/mo with 220K credits, Max agent, 1M context, automated testing and 150GB. Teams is custom ([pricing](https://www.anything.com/pricing)). The pricing table I saw listed **App Store submission under Max only**. The docs do not say which plan is required, so which plans include submission is **(unverified)**.

### 3.6 Leap: feature inventory
- **Tabs:** **Code** (services file explorer, editing, git diffs), **Preview** (frontend wired to real APIs), **Architecture** (live diagram), **Infrastructure** (secrets, DB and compute), **Service Catalog / APIs** (interactive endpoint docs and testing) ([interface](https://docs.leap.new/understanding-your-leap-app/leap-interface.md); [quickstart](https://docs.leap.new/getting-started/quickstart.md)).
- **Infra:** Encore declarative infrastructure (databases, pub/sub, cron, secrets); Firecracker preview environments ([Encore blog](https://encore.dev/blog/leap-is-here)).
- **Observability:** distributed tracing, request, error and database metrics, and infrastructure cost, in the Encore Cloud dashboard ([monitoring](https://docs.leap.new/understanding-your-leap-app/monitoring-and-observability.md)).
- **Integrations:** Clerk auth, Prisma, Resend, Stripe, Tigris, OpenAI, Anthropic, PostHog, and database import ([docs index](https://docs.leap.new/llms.txt)).
- **Deploy:** the **Deploy** button goes to Encore Cloud (free, with usage limits, under 60 s). Your own AWS/GCP needs Encore Cloud Pro ([deployment](https://docs.leap.new/deployment/overview.md)). Custom domains are on Pro.
- **Pricing:** Free has 15 credits a month (5 a day). Pro ranges from $30 for 100 up to $750 for 2,500 credits. Team plans run $500–$2,500. Top-ups are valid for 2 months ([plans](https://docs.leap.new/plans-credits/overview.md)).

### 3.7 Dyad: feature inventory
- **Modes:** **Build** (default: prompt, code, apply), **Ask** (read-only tools), **Basic Agent** (free with your own key; limited to 5 messages a day per the Feb 2026 blog, now "20 messages daily" per the pricing page) and **Pro Agent** (multi-model, Turbo Edits, Smart Context, website cloning, web search, image generation) ([agent mode blog](https://www.dyad.sh/blog/ai-agent-mode-explained); [pricing](https://www.dyad.sh/pricing)). A "Blueprint flow" before implementation arrived in v1.13 (31 Aug 2026) ([releases](https://github.com/dyad-sh/dyad/releases)).
- **Preview:** **Restart** (restarts the Node server), **Refresh**, an address bar, **Open new window**, a bottom system drawer, "Fix error with AI" ([previewing](https://www.dyad.sh/docs/guides/previewing); [NoCode MBA](https://www.nocode.mba/articles/dyad-review)), select component (v0.8), and isolated E2E tests in the preview panel (v1.13).
- **Integrations:** Supabase (create projects from connectors, v1.14), Neon, GitHub, Vercel, **Cloudflare Workers** (v1.17 beta), **Coolify over SSH** (v1.14), MCP (Chrome DevTools, web search, custom), security review, templates, custom theme generator (v0.34), Capacitor mobile (v0.10, experimental).
- **Import:** Node.js apps with a `dev` script. It auto-generates `AI_RULES.md`. Still experimental ([importing](https://www.dyad.sh/docs/guides/importing)).
- **Pricing:** Free. Pro $20 (200 credits). Max $79 (900 credits) ([pricing](https://www.dyad.sh/pricing)).

---

## 4. UI layout (main screens)

> Unless marked otherwise, the layouts below are **reconstructed from docs text and tutorial descriptions, not from screenshots I inspected**. Visual design language (colour, density) is largely **(unverified)**.

### Bolt.new
- **Homepage:** a large centred chatbox. Around it: a **GitHub icon** for import ([Lovable import doc](https://support.bolt.new/integrations/lovable-import.md)), Figma and Stitch import, and the templates marketplace at `bolt.new/resources/templates`. On Teams plans you pick a design system before the first prompt ([start project](https://support.bolt.new/building/start-project.md)). The **Projects dashboard** combines personal and team projects with star, rename and transfer.
- **Workspace:** the chat panel is on the left and the workbench on the right. **Preview mode** shows chat and live preview side by side. The **`<>` Code/Preview toggle** sits at top centre ([code view](https://support.bolt.new/building/using-bolt/code-view.md)). The top nav has a **clock icon for version history** and a title bar you click for recent projects. Project settings sit behind a **cog**, and database settings behind a **database icon**. **Publish** is the primary action; it is top-right in tutorials **(position unverified)**.
- **Chatbox anatomy:** the **plus menu** is bottom-left (Enhance prompt, Search Help Center). **Plan toggle** is bottom-right. There is also the Select tool, a mic for dictation, `@` tagging, a queue list with drag grips, and Stop ([chat tools](https://support.bolt.new/building/chat-tools.md)). Visual edits batch up *above* the chatbox until you save.
- **Visual language:** a dark, developer-style IDE aesthetic is widely associated with Bolt **(unverified)**.

### Base44
- **Homepage / dashboard:** a prompt box with Plan mode, attachments and entry points (URL, Figma, connections). Design-style cards and an Idea Library are described by reviewers. The **All Apps** page was redesigned in Aug 2026 with filters, search, sorting and drag-and-drop folders. App Trash keeps deleted apps for 30 days ([changelog](https://docs.base44.com/changelog/product)).
- **Editor:** **AI chat on the left** and **live preview on the right** ([quick start](https://docs.base44.com/Getting-Started/Quick-start-guide)). The **top bar** has tabs **Preview | Dashboard | Edit | Canvas | Publish**, a device menu (desktop or mobile), and a **More actions** (…) menu with *Act as a user*, *Export project as ZIP* and *GitHub connection*. The chat adapts its width to the preview. Cmd+K opens the command palette.
- **Dashboard (in-editor):** a left menu with Overview/Analytics, Users, **Data**, **Agents**, Code, Logs, API, Settings (including Danger Zone → Unpublish, and Clone App), plus a GitHub icon ([quick start](https://docs.base44.com/Getting-Started/Quick-start-guide); [agents](https://docs.base44.com/Building-your-app/AI-agents-for-apps); [GitHub](https://docs.base44.com/developers/app-code/local-development/github)). The exact item order is **(unverified)**.
- **Canvas:** an infinite board of page frames, sticky notes with **Send to chat** at their bottom right, drawing tools and multiplayer cursors ([Canvas](https://docs.base44.com/Building-your-app/Canvas)).
- **Visual language:** Base44 rebranded with a new logo and identity in Jul 2026 ([changelog](https://docs.base44.com/changelog/product)). Its look is friendly and consumer-grade **(unverified)**.

### Google AI Studio Build
- **Home:** the AI Studio left nav has **Build**. The Build landing page has a prompt box, AI Chips, a mic, **I'm Feeling Lucky** and the App Gallery ([Build docs](https://ai.google.dev/gemini-api/docs/aistudio-build-mode); [Marily Nika, Nov 2025](https://marily.substack.com/p/the-complete-guide-to-building-with)).
- **Workspace:** a **three-panel layout** with the chat panel on the left and Code and live Preview on the right, toggled ([Build docs](https://ai.google.dev/gemini-api/docs/aistudio-build-mode); [Medium, Mar 2026, via search](https://medium.com/@kojo_shaddy/the-architecture-of-vibe-coding-a-deep-dive-into-google-ai-studio-build-mode-d1896274f82a)). **Settings** holds framework choice and **Secrets**. **Publish** is at **top right** ([deploy doc](https://ai.google.dev/gemini-api/docs/aistudio-deploying)). GitHub and Download sit alongside it **(exact placement unverified)**. The **Apps page** lists your apps with a trash icon.

### Anything
- **Workspace** ([controls doc](https://www.anything.com/docs/builder/controls.md)):
  - A **left sidebar** with the logo (project menu), **New chat**, **Version history** and a **Settings** gear.
  - **Chat**, with the mode selector and model selector at the bottom.
  - The **app preview** in the centre: full width for web, a device frame with a QR code for mobile.
  - A **top toolbar** with Preview/Code, Responsive, Refresh, **Element selector**, Rename, External preview, **Invite** and **Publish** (top right, per the [first-app doc](https://www.anything.com/docs/first-app.md)).
  - A **bottom bar** with **Logs** and **Restart sandbox**.
- **Project settings:** Custom Instructions, Assets, Secrets, Auth Providers, Branding & Icons, In App Purchases, Social Share.

### Leap
- **Workspace:** a chat plus five tabs: **Code, Preview, Architecture, Infrastructure, Service Catalog/APIs**, and a **Deploy** button ([interface](https://docs.leap.new/understanding-your-leap-app/leap-interface.md); [deployment](https://docs.leap.new/deployment/overview.md)). Where the chat and the Deploy button sit is **(unverified)**.

### Dyad
- **Desktop app:** the preview is on the right ([NoCode MBA](https://www.nocode.mba/articles/dyad-review)). The chat is to the left of the preview. An app and chat list likely sits in a left sidebar **(unverified)**. The preview toolbar has Restart, Refresh, the address bar and Open in new window, with a system drawer at the bottom ([previewing](https://www.dyad.sh/docs/guides/previewing)).

---

## 5. Step-by-step user flows

### Bolt.new: prompt to custom domain
1. Sign in. Details **(unverified)**; there is a Google SSO item in the Oct 2025 notes, but it appears to cover *end-user* auth for Bolt databases.
2. On the homepage, type a prompt, or pick a template, Figma frame, Stitch design, GitHub repo or Lovable repo. You can run **Enhance prompt**, which asks clarifying questions, or turn on **Plan**, discuss, then click **Implement this plan**.
3. **During generation:** the agent streams its work in chat, and the preview updates in the in-browser runtime. Auto error fixes appear as separate chat entries (Jun 2025), and a chime plays when it finishes. You can queue follow-up prompts while it works.
4. **Iterate:** use Select or Visual Edits for small changes (free until saved), or `@`-tag files and lock files in Code view.
5. **Database and auth:** ask for it, and Bolt provisions a Bolt Database automatically. Manage it from the **database icon**: Tables, Authentication, email templates, Users, Secrets, Server Functions, Logs, Security Audit.
6. **GitHub:** connect for sync. Org admins install the Bolt GitHub app.
7. **Publish:** open the Publish panel. The automatic security review runs, and you can run a full audit on paid plans. The site goes live on `*.bolt.host`, with visibility set to Public or Private.
8. **Domain:** buy or connect a domain in Bolt Domains and manage DNS in-app. Subdomains can be primary.
9. **Mobile:** scan the Expo Go QR in Device Preview. Store publishing needs the local **EAS CLI** plus Apple/Google accounts ([Expo doc](https://support.bolt.new/integrations/expo.md)). There is no in-browser store submission.
10. **Collaborate:** invite by email as Viewer, Editor or Co-owner. Everyone prompts in a single shared thread in real time.

### Base44: prompt to published app and agent
1. **Welcome page:** enter a prompt, pick a design style, attach files (image, doc, video or audio) ([WebsiteBuilderExpert](https://www.websitebuilderexpert.com/vibe-coding/base44-review/)), and optionally start in **Plan mode**.
2. **During generation:** the AI explains its approach, and a checklist shows steps such as "Generate schema", "Create routes" and "Seed data" ([NoCode MBA](https://www.nocode.mba/articles/base44-review)). *Verification* runs silently. The preview jumps to newly created pages (Jul 2026).
3. **Iterate:** chat, **Discuss** for questions, **Edit** mode for free visual tweaks, or **Canvas** to review all pages, drop moodboards and sticky notes, and use Send to chat. Revert or Edit any earlier message.
4. **Data and auth are already there:** Dashboard → Data shows entities and records. Auth, roles and **Act as a user** let you test each role.
5. **Add AI:** Dashboard → **Agents**. Pick a template or describe the agent in chat. Configure **Guidelines** and **Tools**, then optionally connect WhatsApp or Telegram.
6. **Pre-publish:** run the **Testing Agent** (fresh-session click-through with suggested fixes) and **Security Scan**.
7. **Publish:** Publish, then the **Web** tab: URL, **Get domain** (auto DNS), App visibility, Security status, Publish. The **Mobile app** tab prepares store builds.
8. **GitHub (Builder+):** Dashboard → GitHub icon, authorise, then link or create a repo. After that, 2-way sync on `main`. Local work uses `base44 dev`.

### Google AI Studio Build
1. Sign in with a Google account and pick **Build** in the left nav.
2. Prompt, with optional AI Chips, voice, or I'm Feeling Lucky. For Android, pick the Android app type.
3. The agent proposes a **plan checkpoint**, and you **approve Firebase provisioning** when asked ([BuildFastWithAI](https://blog.buildfastwithai.com/google-ai-studio-vibe-coding-guide)).
4. The preview renders; simple apps take roughly 15–30 s ([Marily Nika](https://marily.substack.com/p/the-complete-guide-to-building-with)). Android runs in the embedded emulator.
5. Iterate by chat or **Annotation mode**. Add keys in **Settings → Secrets**.
6. **Publish** (top right), then Get Started, then Publish App, which gives a Cloud Run URL. Optionally claim an `*.ai.studio` name. On Android, install via ADB or publish to Play internal testing.
7. **GitHub** 2-way sync, or **Export to Antigravity**, which keeps conversation history and secrets.

### Anything: mobile app to the App Store
1. Describe the app in 1–3 sentences. The agent starts immediately; there is no explicit web-vs-mobile picker, so the type is inferred from the prompt ([first app](https://www.anything.com/docs/first-app.md)).
2. It builds the frontend, database, auth, backend and payments in one pass. Thinking-mode steps can be expanded.
3. **Preview** in the device frame, or scan the QR code with **Expo Go** on your phone.
4. **Iterate** by chat or the element selector. **Max** runs a long autonomous test-and-fix loop that you can watch in the steps panel.
5. **Publish** the web version with the Publish button.
6. **Submit to App Store:** first verify your Apple developer account (new accounts take about 3 days). Authenticate with your Apple ID. Anything builds, signs and uploads in under 30 minutes. Install via TestFlight. Complete the metadata in App Store Connect, then submit; review takes 1–3 days ([App Store doc](https://www.anything.com/docs/launch/app-store.md)).

### Leap
1. Describe the system in chat.
2. After about 3 minutes, the **Code, Preview, Architecture and APIs** tabs fill ([quickstart](https://docs.leap.new/getting-started/quickstart.md)).
3. Review changes as diffs.
4. Test endpoints in the API explorer.
5. **Deploy** to Encore Cloud in under 60 s, or connect AWS/GCP.
6. Set up GitHub for automated deploys.
7. Add a custom domain on Pro.

### Dyad
1. Download the desktop app; no account is needed.
2. Pick a model provider: Ollama, OpenRouter, Google or others ([NoCode MBA](https://www.nocode.mba/articles/dyad-review)).
3. Prompt. Files are written locally, and the first preview installs npm packages, which can be slow ([previewing](https://www.dyad.sh/docs/guides/previewing)).
4. Errors appear with "Fix error with AI".
5. Connect Supabase or Neon for data and auth.
6. Connect GitHub.
7. Publish to Vercel, Cloudflare Workers or Coolify.
8. To import an existing project, point Dyad at a Node app; it generates `AI_RULES.md`.

### Import-existing-project flows (compared)
- **Bolt:** a GitHub icon on the homepage, then *Your repositories* or *Import from URL*. It loads the `main` branch. Lovable projects come in through GitHub ([doc](https://support.bolt.new/integrations/lovable-import.md)).
- **Base44:** GitHub Project Import (Aug 2026), with AGENTS.md respected (Sep 2026). Figma frames become pages. You can also refine an existing URL.
- **AI Studio:** pull through GitHub sync. Firebase Studio workspaces migrate in.
- **Anything:** Mocha migration (code, data, users, files), Figma, Mobbin and Sleek.
- **Dyad:** local folder import (experimental).

### Agent-building flow (Base44, the most complete here)
1. Describe the agent in natural language. Base44 builds the workflows, connects tools and deploys it ([Wix press](https://www.wix.com/press-room/home/post/base44-launches-superagents-making-autonomous-ai-agents-accessible-to-anyone)).
2. Add skills from 130+.
3. Connect channels: WhatsApp (dedicated number), Telegram (one tap), Slack, phone.
4. Set schedules and triggers, or **Goals** for long-running tasks with persistent state.
5. Memory persists across conversations; you can clear it in one step.
6. Answers can include clickable options.

---

## 6. UX strengths and pain points (with evidence)

### Strengths users praise
- **Speed with zero setup** (Bolt's in-browser runtime; AI Studio is free and instant) ([preuve.ai](https://preuve.ai/blog/bolt-new-review)).
- **All-in-one backend** means no separate Supabase or Vercel bills, which suits beginners (Base44: "Integrated database and authentication eliminate setup friction") ([NoCode MBA](https://www.nocode.mba/articles/base44-review)). Base44's support team is often praised on Trustpilot ([Trustpilot](https://www.trustpilot.com/review/base44.com)).
- **Freedom and ownership** (Dyad reviewers say it "outclasses" paid rivals; free models are possible) ([Product Hunt](https://www.producthunt.com/products/dyad-free-local-vibe-coding-tool/reviews)).
- **Production-grade backend** (Leap: "accomplishing in days what would typically take months" of backend setup) ([search summary of Medium](https://medium.com/@ivan_91528/building-production-ready-apps-with-leap-new-8dcd9db3998b)).
- **A real App Store path** (Anything builds on Expo with a pre-submission review scanner) ([HostAdvice via search](https://hostadvice.com/ai-app-builders/anything-review/)).

### Pain points
- **Token and credit burn on AI-made bugs (all of them).** Bolt's Trustpilot score is **1.5/5 across 202 reviews (84% one-star)**. Complaints centre on tokens spent on errors and bot-only support ([preuve.ai, 1 Sep 2026](https://preuve.ai/blog/bolt-new-review)). Reported cases include 7–12M tokens lost in an afternoon to error loops and 20M on a single auth issue ([search summary of Superdesign/Afterbuild](https://superdesign.dev/blog/bolt-review)). Bolt says most token use comes from syncing the file system into context ([pricing](https://bolt.new/pricing)).
- **Base44:** Trustpilot is **2.8/5 across 891 reviews**. Complaints: AI loops that drain credits, billing and cancellation problems, and a reported account suspension with no way to recover the app ([Trustpilot](https://www.trustpilot.com/review/base44.com)). There is no rollover, you can't buy extra credits without upgrading, and bug fixes cost 10–20 credits each ([search summary of Fuzen/checkthat](https://www.fuzen.io/posts/base44-review-2026-pricing-is-it-legit-and-is-it-free)). The **lock-in fear** comes from the proprietary backend ("migrating off requires rebuilding"). The two credit types (message vs integration) confuse beginners, code export requires Builder, and the visual editor is "clunky" ([WebsiteBuilderExpert](https://www.websitebuilderexpert.com/vibe-coding/base44-review/)).
- **Google AI Studio:** Firebase Studio lived only about 11 months, and Google's sunset history erodes trust ([BuildFastWithAI](https://blog.buildfastwithai.com/google-ai-studio-vibe-coding-guide); [Firebase](https://firebase.google.com/docs/studio/migrating-project)). It is Gemini-only. Free-tier cuts after 1 Apr 2026 annoyed users. Shared apps spend the creator's quota. The GitHub sync "In Sync" bug is noted above.
- **Anything:** Apple removed the iOS app on 26 Mar 2026, reinstated it on 3 Apr, then removed it again ([MacRumors](https://www.macrumors.com/2026/03/30/apple-pulls-vibe-coding-app/); [TechCrunch](https://techcrunch.com/2026/04/14/how-vibe-coding-app-anything-is-rebuilding-after-getting-booted-from-the-app-store-twice/)). This is a platform risk for anyone building "on-phone builders". Reviewers say complex redesigns burn credits and the first UI is generic ([Griffin Wooldridge](https://griffinwooldridge.com/blog/anything-ai-app-builder-review)).
- **Leap:** it demands developer knowledge. The founders themselves said larger codebases are the biggest challenge ([HN Show HN](https://news.ycombinator.com/item?id=44137177)). Its public comparison pages are dated; for example, they claim Bolt only deploys to Netlify or Cloudflare ([Leap vs Bolt](https://docs.leap.new/comparisons/leap-vs-bolt.md)).
- **Dyad:** setup friction, such as Node detection bugs ([GitHub issue #1403](https://github.com/dyad-sh/dyad/issues/1403)); incomplete edits with some models; mobile is experimental; you need a powerful laptop for local models ([NoCode MBA](https://www.nocode.mba/articles/dyad-review)).
- **Tempo:** "laggy and stuck" ([Medium](https://medium.com/@albertodesignz/you-need-to-check-out-tempo-labs-it-not-only-builds-the-app-but-it-also-generates-a-prd-flow-map-7705cbc7347b)); React-only; a gap between $30 Pro and roughly $4.5k Agent+ ([vibecoding.app](https://vibecoding.app/blog/tempo-review)).
- **Market signal:** Mocha shut down, citing CAC, token costs and support costs ([Mocha blog](https://getmocha.com/blog/mocha-shutdown/)). Base44 was near break-even on gross margin early in 2026 ([Ctech](https://www.calcalistech.com/ctechnews/article/5gj9agi67)). **Unit economics are a UX problem:** products compensate with opaque credits.

---

## 7. Recent notable launches (2025–2026)

| Date | Product | Launch |
|---|---|---|
| 31 May 2025 | Leap | Public beta: Encore.ts, deploy to own AWS/GCP ([Encore](https://encore.dev/blog/leap-is-here)) |
| Jun 2025 | Base44 | Acquired by Wix for $80M ([Ctech](https://www.calcalistech.com/ctechnews/article/5gj9agi67)) |
| Aug–Sep 2025 | Bolt | Bolt Cloud (hosting, domains), Bolt Database, Claude Agent default, analytics |
| 2 Oct 2025 | Bolt | **Bolt v2** ([blog](https://bolt.new/blog/bolt-v2)) |
| Jan–Feb 2026 | Bolt | Figma import, private sharing, Nano Banana edits, Team templates, Opus 4.6 |
| 4 Feb 2026 | Dyad | Agent mode (Basic free with your own key, Pro) ([blog](https://www.dyad.sh/blog/ai-agent-mode-explained)) |
| 11 Mar 2026 | Base44 | **Superagents** ([Wix](https://www.wix.com/press-room/home/post/base44-launches-superagents-making-autonomous-ai-agents-accessible-to-anyone)) |
| 18–19 Mar 2026 | Google | Full-stack AI Studio (Antigravity + Firebase). **Firebase Studio sunset announced** |
| 26 Mar–Apr 2026 | Anything | Pulled from the App Store twice. Pivots to iMessage apps and a desktop companion |
| Apr 2026 | Bolt | Real-time multiplayer, roles, Projects dashboard, Opus 4.7, design systems |
| 19 May 2026 | Google | I/O: native Android, Play internal testing, Antigravity export, free deploys, mobile app pre-registration |
| May 2026 | Bolt | Standard and Max agents replace model picker; Stitch import |
| 16 Jun 2026 | Base44 | **Production Pack:** Verification, Testing Agent, Security Scan |
| 22 Jun 2026 | Google | Firebase Studio new workspaces and sign-ups disabled |
| Jul 2026 | Base44 / Bolt | Base44: Workflows, rebrand, connectors, GPT-5.6 models. Bolt: Slides, Skills, security audits, Safari |
| 1 Aug 2026 | Mocha | Shut down; migration to Anything |
| Aug 2026 | Base44 | Branches, GitHub import, app comments, canvas design options, Claude Opus 5, compare models |
| Aug 2026 | Bolt | Marketplace templates, v1 agent and Discussion mode retired, voice, prompt queue, Visual Edits |
| 19–20 Aug 2026 | Google | GitHub 2-way sync in AI Studio |
| Sep 2026 | Base44 | AI Visibility for SEO, presentation builder, Superagent Goals and phone, version code compare |
| 14 Sep 2026 | Bolt | **Bolt Forge** open-model agent + **Lite $9/mo** |
| 21–24 Sep 2026 | Dyad | v1.16 (ChatGPT/Codex subscriptions), v1.17 beta (Claude Code, Cloudflare Workers) |
| 22 Mar 2027 (planned) | Google | Firebase Studio shutdown; data deleted |

---

## 8. Ideas for Architect 2.0

**Onboarding and home**
- ADOPT: One prompt box with **visible entry chips**: *Start from prompt*, *Import GitHub*, *Import from Lovable/Bolt/zip*, *Figma*, *Clone URL*, *Template*, *Build an agent*. Bolt and Base44 both treat imports as peers of the prompt, and Anything turned a competitor's shutdown (Mocha) into a migration funnel.
- ADOPT: **Enhance prompt with clarifying questions** before generating (Bolt, May 2026). A design-style picker helps non-technical users (Base44).
- IMPROVE: Detect the user type implicitly. Offer "I'm technical" and "I'm not" toggles that change defaults (visible code tab, terminal, model picker) rather than forking the product. None of the competitors do this cleanly.

**Chat and agent**
- ADOPT: Name modes by intent: **Plan / Build / Ask**. Name agents by effort (*Standard / Max*), not by model. Put a single **"Implement this plan"** CTA at the end of a plan (Bolt).
- ADOPT: A **prompt queue** with reorder, pause and an avatar per prompt (Bolt). Let new messages join the active run (Base44).
- ADOPT: Show a **live step checklist** ("Generate schema → Create routes → Seed data"), with expandable reasoning (Base44, Anything). Put **Revert** and **Edit** on each message.
- IMPROVE: Show the **credit cost before and after each step**, and make **fixing the AI's own errors free** (Tempo) or capped. Credit burn on bug loops is the most common complaint in every product.
- AVOID: Two confusing currencies (Base44's message vs integration credits) and credits that don't roll over.

**Preview and visual editing**
- ADOPT: **Select → edit visually for free; pay only to save** (Bolt). Add element chips in chat (Base44) and a layer picker for overlapping elements.
- ADOPT: A **Canvas** of all pages as live frames, with sticky notes that have **Send to chat** (Base44). It fits designers and PMs, and is a strong differentiator in the judging criteria.
- ADOPT: **Act as a user / role switcher** in the preview (Base44).
- ADOPT: A **device frame + QR to open on phone** (Anything, Bolt).

**Developer surface**
- ADOPT: **Architecture** and **API explorer** tabs, plus traces (Leap), shown only in "technical" mode. They make an *agentic backend* legible.
- ADOPT: In Code view, **Target file / Lock file / Ask about selection** (Bolt), and `@` file tagging.
- ADOPT: **Branches as full copies** with per-branch credits (Base44). Protected main makes the AI open a branch (Base44).
- ADOPT: Keep a project rules file (`AI_RULES.md`, `AGENTS.md`, `claude.md`) and honour imported ones (Dyad, Base44, Bolt).
- ADOPT: A **CLI/API with a machine-readable skill file** so external agents like Claude Code or Codex can drive Architect (Anything). Offer BYOK or "use your existing subscription" for developers (Dyad).

**Backend, data and AI agents**
- ADOPT: **Separate dev and prod databases, with schema-only migration on publish** (Anything).
- ADOPT: A consolidated **Database panel** (Tables, Auth, Storage, Functions, Secrets, Users, Logs, Security) behind one icon (Bolt).
- ADOPT: An **agent builder** with **Guidelines / Tools / Memory / Channels** tabs and entity-level tool permissions (Base44). Supported channels: WhatsApp, Telegram, Slack.
- IMPROVE: Let developers build agents in *any framework* (LangGraph, CrewAI, Mastra, OpenAI Agents SDK). Show a trace view per run, which none of the builders here have. Base44's agents are proprietary. Leap shows traces only for services.
- AVOID: A proprietary, non-exportable backend (Base44's lock-in fear). Export must include backend and data, not just frontend code.

**Quality and publish**
- ADOPT: A **pre-publish checklist in the Publish modal**: Security status, Testing Agent run, visibility, domain (Base44, Bolt). Offer **token-free security audits** (Bolt) and leaked-password protection on by default.
- ADOPT: Show **publish status**: live link, last published time, unpublished changes (Bolt).
- ADOPT: A free first deploy with **no card**, on a subdomain (AI Studio Starter tier). Offer domain purchase and auto-DNS in-app (Bolt, Base44).
- IMPROVE: Run the **Testing Agent in a fresh session** with screenshots (Base44), and bring an optional long-running "Max"-style QA agent to cheaper tiers.
- AVOID: Mobile store publishing that needs a local CLI (Bolt's EAS path). If you offer mobile, either do it in-browser (Anything, AI Studio) or say clearly that it's web-only.

**Collaboration and trust**
- ADOPT: **Real-time multiplayer in a single thread**, roles (Viewer, Editor, Co-owner), and comments pinned to elements (Bolt, Base44).
- ADOPT: **Trash with 30-day restore** and a one-click full project delete that also unpublishes and drops the database (Base44, Bolt).
- AVOID: Bot-only support and hard cancellation. These drive Bolt's 1.5/5 and Base44's 2.8/5 Trustpilot scores.
- AVOID: Scope creep that dilutes the core. Bolt Slides and Base44 presentation builders are interesting, but judges reward depth in the core flows.
- AVOID: Depending on a single model vendor or platform policy (AI Studio's Gemini-only approach; Anything's App Store removals). Keep models swappable, and keep the build surface on the web.

---

## Sources

**Bolt.new**
- Release notes: https://support.bolt.new/release-notes
- Pricing: https://bolt.new/pricing
- Bolt v2 blog: https://bolt.new/blog/bolt-v2
- Docs index: https://support.bolt.new/llms.txt
- Chat tools: https://support.bolt.new/building/chat-tools.md
- Start a project: https://support.bolt.new/building/start-project.md
- Agents: https://support.bolt.new/building/using-bolt/agents.md
- Plan mode: https://support.bolt.new/best-practices/plan-mode.md
- Code view: https://support.bolt.new/building/using-bolt/code-view.md
- Database: https://support.bolt.new/cloud/database.md
- Security: https://support.bolt.new/building/security.md
- Expo: https://support.bolt.new/integrations/expo.md
- Lovable import: https://support.bolt.new/integrations/lovable-import.md
- Bolt v2 launch post on X: https://x.com/boltdotnew/status/1973063093849567591
- preuve.ai review: https://preuve.ai/blog/bolt-new-review
- Superdesign review: https://superdesign.dev/blog/bolt-review
- Sacra: https://sacra.com/c/bolt-new/

**Base44**
- Changelog: https://docs.base44.com/changelog/product
- Pricing: https://base44.com/pricing
- Quick start: https://docs.base44.com/Getting-Started/Quick-start-guide
- Canvas: https://docs.base44.com/Building-your-app/Canvas
- AI agents: https://docs.base44.com/Building-your-app/AI-agents-for-apps
- GitHub: https://docs.base44.com/developers/app-code/local-development/github
- Production Pack blog: https://base44.com/blog/base44-app-review
- Superagents: https://base44.com/superagents
- Wix press release: https://www.wix.com/press-room/home/post/base44-launches-superagents-making-autonomous-ai-agents-accessible-to-anyone
- TestingCatalog: https://www.testingcatalog.com/base44-launches-skills-library-for-superagents-with-130-options/
- Ctech (Aug 2026): https://www.calcalistech.com/ctechnews/article/5gj9agi67
- Ctech (Nov 2025): https://www.calcalistech.com/ctechnews/article/sy194qsg11g
- Seeking Alpha: https://seekingalpha.com/news/4560867-wix-outlines-mid-teens-revenue-growth-for-2026-as-ai-strategy-accelerates-base44-surpasses
- Trustpilot: https://www.trustpilot.com/review/base44.com
- NoCode MBA review: https://www.nocode.mba/articles/base44-review
- WebsiteBuilderExpert review: https://www.websitebuilderexpert.com/vibe-coding/base44-review/
- Axonbuild (mobile): https://axonbuild.com/blog/can-base44-make-mobile-apps
- Fuzen review: https://www.fuzen.io/posts/base44-review-2026-pricing-is-it-legit-and-is-it-free

**Google AI Studio / Firebase Studio**
- Build mode docs: https://ai.google.dev/gemini-api/docs/aistudio-build-mode
- Deploying: https://ai.google.dev/gemini-api/docs/aistudio-deploying
- Full-stack vibe coding (Mar 2026): https://blog.google/innovation-and-ai/technology/developers-tools/full-stack-vibe-coding-google-ai-studio/
- I/O 2026: https://blog.google/innovation-and-ai/technology/developers-tools/google-ai-studio-io-2026/
- Android Developers blog: https://android-developers.googleblog.com/2026/05/build-android-apps-google-ai-studio.html
- Firebase Studio sunset and migration: https://firebase.google.com/docs/studio/migrating-project
- TechCrunch: https://techcrunch.com/2026/05/19/googles-ai-studio-now-lets-anyone-build-android-apps-in-minutes/
- GitHub sync forum thread: https://discuss.ai.google.dev/t/ai-studio-github-sync-says-in-sync-but-latest-changes-are-not-pushed-to-github/180483
- BuildFastWithAI guide: https://blog.buildfastwithai.com/google-ai-studio-vibe-coding-guide
- Marily Nika guide: https://marily.substack.com/p/the-complete-guide-to-building-with
- NoCode MBA pricing: https://www.nocode.mba/articles/google-ai-studio-pricing

**Anything / Mocha**
- Docs index: https://www.anything.com/docs/llms.txt
- Controls: https://www.anything.com/docs/builder/controls.md
- Agent: https://www.anything.com/docs/builder/agent.md
- Max: https://www.anything.com/docs/builder/max.md
- App Store: https://www.anything.com/docs/launch/app-store.md
- Databases: https://www.anything.com/docs/apps/databases.md
- First app: https://www.anything.com/docs/first-app.md
- CLI: https://www.anything.com/docs/cli.md
- Mocha import: https://www.anything.com/docs/import/mocha.md
- Pricing: https://www.anything.com/pricing
- TechCrunch (Apr 2026): https://techcrunch.com/2026/04/14/how-vibe-coding-app-anything-is-rebuilding-after-getting-booted-from-the-app-store-twice/
- MacRumors: https://www.macrumors.com/2026/03/30/apple-pulls-vibe-coding-app/
- Griffin Wooldridge review: https://griffinwooldridge.com/blog/anything-ai-app-builder-review
- Mocha shutdown blog: https://getmocha.com/blog/mocha-shutdown/
- Mocha on X: https://x.com/get_mocha/status/2055399529009299746

**Leap**
- Introduction: https://docs.leap.new/getting-started/introduction
- Docs index: https://docs.leap.new/llms.txt
- Interface: https://docs.leap.new/understanding-your-leap-app/leap-interface.md
- Plans and credits: https://docs.leap.new/plans-credits/overview.md
- Deployment: https://docs.leap.new/deployment/overview.md
- Monitoring and observability: https://docs.leap.new/understanding-your-leap-app/monitoring-and-observability.md
- Quickstart: https://docs.leap.new/getting-started/quickstart.md
- Leap vs Bolt: https://docs.leap.new/comparisons/leap-vs-bolt.md
- Encore launch blog: https://encore.dev/blog/leap-is-here
- Show HN: https://news.ycombinator.com/item?id=44137177

**Dyad**
- Homepage: https://www.dyad.sh/
- Pricing: https://www.dyad.sh/pricing
- GitHub repo: https://github.com/dyad-sh/dyad
- Releases: https://github.com/dyad-sh/dyad/releases
- Agent mode blog: https://www.dyad.sh/blog/ai-agent-mode-explained
- Previewing: https://www.dyad.sh/docs/guides/previewing
- Importing: https://www.dyad.sh/docs/guides/importing
- NoCode MBA review: https://www.nocode.mba/articles/dyad-review
- Product Hunt reviews: https://www.producthunt.com/products/dyad-free-local-vibe-coding-tool/reviews
- GitHub issue #1403: https://github.com/dyad-sh/dyad/issues/1403

**Others**
- Tempo homepage: https://www.tempo.new/
- Tempo Agent+: https://www.tempo.new/ai-agent-plus
- vibecoding.app Tempo review: https://vibecoding.app/blog/tempo-review
- aiidelist Tempo page: https://aiidelist.com/ide/tempo
- NoCode MBA Tempo review: https://www.nocode.mba/articles/tempo-app-builder-review
- Same docs: https://docs.same.new
- Fabricate on Same: https://fabricate.build/alternatives/same
- MakerStack Macaly review: https://makerstack.co/reviews/macaly-review/
- Vitara Softgen review: https://vitara.ai/softgen-ai-review/
- OpenAI Genspark case study: https://openai.com/index/genspark/
- Manus web app builder: https://manus.im/features/webapp
- CNBC on the Meta–Manus block: https://www.cnbc.com/2026/04/27/meta-manus-china-blocks-acquisition-ai-startup.html
