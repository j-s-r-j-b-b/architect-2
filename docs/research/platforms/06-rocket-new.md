# Rocket.new: Competitive Research Report

*Researched 2026-09-25 for the Architect 2.0 design assignment. Main sources: Rocket's own docs (docs.rocket.new, including a weekly changelog from April 2025 to August 2026), its pricing and marketing pages, TechCrunch, press releases, and third-party reviews (Trustpilot, SourceForge, independent blogs, the App Store). Anything I could not confirm is marked **(unverified)**. Where I describe a layout that I pieced together from the docs rather than saw in a screenshot, I say so.*

---

## 0. Snapshot

| Item | Detail |
|---|---|
| Product | Rocket (rocket.new). Calls itself "the world's first **Vibe Solutioning** platform" ([rocket.new](https://www.rocket.new/)) |
| Company | Rocket, formerly **DhiWise**. Founded April 2021 in Surat, India. Founders: Vishal Virani (CEO), Rahul Shingala, Deepak Dhanak. Opened US operations in Palo Alto ([TechCrunch Sep 2025](https://techcrunch.com/2025/09/22/rocket-new-one-of-indias-first-vibe-coding-startups-snags-15m-from-accel-salesforce-ventures); [productgrowth.in](https://productgrowth.in/tools/no-code/dhiwise/)) |
| What it builds | **Next.js (TypeScript)** web apps, websites and landing pages. **Flutter (Dart)** mobile apps for iOS, Android and web preview. React and HTML are deprecated for new projects as of Feb–Mar 2026 ([FAQ](https://docs.rocket.new/help/faq.md); [changelog Mar wk2](https://docs.rocket.new/changelog/2026/march/week-2.md)) |
| Product pillars (since Rocket 1.0, 7 Apr 2026) | **Solve** (research reports), **Build** (app builder), **Intelligence** (competitor monitoring) ([docs intro](https://docs.rocket.new/getting-started/introduction)) |
| Funding | $15M seed in Sep 2025, led by Salesforce Ventures with Accel and Together Fund, at a reported ~$60M valuation. In June 2026 it was reported to be in talks to raise $40–50M at ~$500M, led by 360 ONE. **Not confirmed as closed** ([startupfeed.in, 29 Jun 2026](https://startupfeed.in/rocket-funding-360-one-500m-valuation/)) |
| Traction | Sep 2025: 400K users, 10K+ paid, $4.5M ARR, 500K apps ([TechCrunch](https://techcrunch.com/2025/09/22/rocket-new-one-of-indias-first-vibe-coding-startups-snags-15m-from-accel-salesforce-ventures)). Apr 2026: "1.5M people have tried Rocket" in 180 countries ([TechCrunch Apr 2026](https://techcrunch.com/2026/04/06/indian-startup-rocket-wants-its-ai-to-do-mckinsey-style-consulting-at-a-fraction-of-the-cost/)). A June 2026 report instead says "653,000+ users", so the user counts are **inconsistent** ([startupfeed.in](https://startupfeed.in/rocket-funding-360-one-500m-valuation/)) |
| Pricing (current) | Free $0 (20 credits). Pro $25/mo (100). Rocket $50/mo (250). Booster $250/mo (1,500). Unlimited members on every plan, credits roll over, 20% off annual billing ([pricing](https://www.rocket.new/pricing)) |
| Models | Claude Sonnet 4.6 for first generation and follow-up edits (Feb 2026). The Advisor sub-agent runs on Claude Opus. The company says it also uses OpenAI and Gemini plus proprietary models trained on DhiWise data ([changelog Feb wk4](https://docs.rocket.new/changelog/2026/february/week-4.md); [Advisor](https://docs.rocket.new/build/editor/advisor-agent.md); [TechCrunch](https://techcrunch.com/2025/09/22/rocket-new-one-of-indias-first-vibe-coding-startups-snags-15m-from-accel-salesforce-ventures)) |

---

## 1. Positioning: what makes Rocket different

- **"What to build" plus "what happens after launch", not only building.** Rocket 1.0 (7 Apr 2026) turned an app builder into a three-part product: Solve researches the market before you build, Build makes the app, and Intelligence watches competitors after you ship. The CEO's framing: "Everyone can generate the code now … it has become a commodity" ([TechCrunch Apr 2026](https://techcrunch.com/2026/04/06/indian-startup-rocket-wants-its-ai-to-do-mckinsey-style-consulting-at-a-fraction-of-the-cost/)). Homepage hero: "Most AI tools help you build faster. None of them tell you what to build. Or how to win after you build." ([rocket.new](https://www.rocket.new/)).
- **Real native mobile output.** Rocket generates Flutter code (not only responsive web), and TechCrunch reported about 45% of builds are mobile apps. Most rivals (Lovable, v0, Bolt) are web-first. This comes from DhiWise, which already converted Figma designs into Flutter and React code ([TechCrunch](https://techcrunch.com/2025/09/22/rocket-new-one-of-indias-first-vibe-coding-startups-snags-15m-from-accel-salesforce-ventures); [productgrowth.in](https://productgrowth.in/tools/no-code/dhiwise/)).
- **Figma-to-code built in.** Because of the DhiWise roots, Figma import is a first-class entry point, with frame selection and 10 pages of Figma design-hygiene rules in the docs ([Figma overview](https://docs.rocket.new/build/create/figma/overview.md)).
- **"Precision Mode" and slash commands.** Since Nov 2025 there are 100+ structured `/` commands and `@` file targeting, pitched as removing the "prompt engineering tax" ([blog, 13 Nov 2025](https://www.rocket.new/blog/rocket-precision-mode-command-based-ai-building)).
- **A large template library.** 25,000+ landing-page and website templates across 42 industry categories. Templates are free, and credits are only spent once you start customising ([changelog Mar wk2](https://docs.rocket.new/changelog/2026/march/week-2.md); [templates doc](https://docs.rocket.new/build/create/using-templates.md)).
- **"Day two" and marketing-site work.** Built-in SEO, GEO/AEO, WCAG accessibility and privacy-compliance audits, a Core Web Vitals performance tab, built-in visitor analytics, and in-app domain purchase. This suits agencies and marketers as much as app builders ([commands](https://docs.rocket.new/build/editor/commands.md); [performance](https://docs.rocket.new/build/measure/performance.md); [analytics](https://docs.rocket.new/build/measure/analytics.md)).
- **Team-friendly pricing.** Unlimited members on every plan, one shared credit pool, and per-Editor credit caps ([pricing](https://www.rocket.new/pricing); [changelog Aug 2026](https://docs.rocket.new/changelog/2026/august/week-3.md)).
- **Human support as part of the pitch.** Rocket marketing claims "24/7 dedicated support" and a "Success team" that steps in when the AI can't finish ([rocket-vs-lovable](https://www.rocket.new/rocket-vs-lovable)). Trustpilot reviewers often name individual support agents, which partly backs this up ([Trustpilot](https://www.trustpilot.com/review/rocket.new)).
- **Enterprise badges on the homepage.** SOC 2, ISO 27001, GDPR, CCPA, SSO/SAML, RBAC and audit logs are all listed ([rocket.new](https://www.rocket.new/)). I did not independently check the audit reports **(unverified)**.

---

## 2. Who uses it and why (jobs to be done)

**Segments Rocket names:** "Solo founders. Product teams. Engineering teams. Sales leaders. Consultants" ([/build](https://www.rocket.new/build)). The docs also have prompt-starter packs for founders, PMs, designers, developers and marketers ([docs index](https://docs.rocket.new/llms.txt)). Usage mix reported in Sep 2025: e-commerce 12%, fintech 10%, B2B tools 5–6%, mental health 4–5%. Revenue by region: US 26%, Europe 15–20%, India 10%. SMBs are 20–30% of customers ([TechCrunch](https://techcrunch.com/2025/09/22/rocket-new-one-of-indias-first-vibe-coding-startups-snags-15m-from-accel-salesforce-ventures); [TechCrunch Apr 2026](https://techcrunch.com/2026/04/06/indian-startup-rocket-wants-its-ai-to-do-mckinsey-style-consulting-at-a-fraction-of-the-cost/)).

**Non-technical users (the majority, judging by reviews and marketing):**
- *"Get a demo in front of investors or clients by Friday."* Reviewers describe a mobile prototype in 2 days before a pitch, a real-estate demo in an afternoon, and a marketplace MVP in under an hour ([JoinSecret reviews](https://www.joinsecret.com/rocket-new/reviews)).
- *"Replace a freelancer or agency."* One reviewer says it "saved me a massive amount of capital" ([Trustpilot p3](https://www.trustpilot.com/review/rocket.new?page=3)).
- *"Build a mobile app without knowing Flutter."* Examples include APK builds for testing and web-preview links for stakeholders ([APK doc](https://docs.rocket.new/build/launch-mobile/android-apk.md)).
- *"Redesign my existing website."* Paste a URL and use `/` redesign commands ([Redesign](https://docs.rocket.new/build/create/commands/redesign.md)).
- *"Tell me what to build, and what my competitors are doing."* Solve produces "McKinsey-grade" PDF, PPT or PRD reports, and Intelligence produces competitor cards ([TechCrunch Apr 2026](https://techcrunch.com/2026/04/06/indian-startup-rocket-wants-its-ai-to-do-mckinsey-style-consulting-at-a-fraction-of-the-cost/)).

**Technical users (a secondary audience; features exist but are narrow):**
- Designers and developers turning Figma into Flutter or Next.js code ([Figma](https://docs.rocket.new/build/create/figma/overview.md)).
- Developers who want to own the code: zip export (paid), GitHub push, and **two-way sync only for Next.js TypeScript**, with PRs raised from a `rocket-update` branch ([code sync](https://docs.rocket.new/build/connectors/github/code-sync.md)).
- Developers importing an existing **Next.js TypeScript** repo and continuing to build with AI ([From GitHub](https://docs.rocket.new/build/create/from-github.md)).
- API wiring from Postman collections, cURL commands or OpenAPI specs, bound to a UI element with a trigger ([APIs](https://docs.rocket.new/build/editor/apis.md)).
- The marketing page mentions a "dev mode (coming soon)" ([rocket-vs-lovable](https://www.rocket.new/rocket-vs-lovable)). I could not confirm it has shipped **(unverified)**.
- Third-party opinion on audience is split. Some reviewers call it "aimed at experienced developers" ([search summary of vibecoding.app comparison](https://vibecoding.app/compare/lovable-vs-rocket-new)), while most reviews and Rocket's own copy target non-developers. **Conclusion:** the product is built mainly for non-technical users, with a thin layer for developers.

---

## 3. Complete feature inventory, grouped by area

### 3.1 Onboarding and auth (for the Rocket user)
- Sign-up options: **Continue with Google**, **SSO** (work email sent to your identity provider), or **Email with a 6-digit one-time code**. There is no password option and no GitHub sign-in documented ([Create account](https://docs.rocket.new/getting-started/create-an-account.md)).
- **No onboarding questionnaire.** Users go straight to the home screen with "the task input and Solve, Build, and Intelligence cards" ([Create account](https://docs.rocket.new/getting-started/create-an-account.md)).
- A default workspace is created automatically on the Free plan ([Workspace manage](https://docs.rocket.new/getting-started/workspace/manage.md)).
- The Free plan gives 20 credits. The FAQ describes these as one-time ([FAQ](https://docs.rocket.new/help/faq.md)). The marketing page says 20 credits cover roughly "1-2 websites, 5-6 landing pages, or 1-2 apps" ([/build](https://www.rocket.new/build)).
- **Rocket: Pocket App Studio** on iOS has Face ID, push notifications and live progress in the Dynamic Island. It is rated 3.2★ from 9 ratings, and one reviewer said it is "the same as opening Rocket on a webpage in Safari" ([App Store](https://apps.apple.com/us/app/rocket-pocket-app-studio/id6752393417)).

### 3.2 Homepage and prompt entry
- A single **task input** is shared by all three pillars. Typing straight into it creates a Build task, or the user can pick a Solve, Build or Intelligence card first ([Build quick start](https://docs.rocket.new/build/quick-start.md)).
- **Build category tabs** each show example prompts: Landing page, Dashboard, Website, SaaS, Mobile App, E-commerce ([From an idea](https://docs.rocket.new/build/create/from-an-idea.md)).
- **Solve category chips:** Strategy, Product, GTM, Sales, Competition, "What to build" ([Solve quick start](https://docs.rocket.new/solve/quick-start.md)).
- **"+" menu at the lower left of the input:**
  - "Add files & photos": up to 5 files of 5 MB each (PNG, JPG, PDF, XLSX, CSV, MD) ([Attachments](https://docs.rocket.new/getting-started/task/attachments.md))
  - "Add from Figma"
  - "Clone from GitHub" ([From GitHub](https://docs.rocket.new/build/create/from-github.md))
- **Lock icon next to Send** sets the task to Public or Private. Private requires Pro or above ([Visibility](https://docs.rocket.new/build/editor/visibility.md)).
- **`@` menu:** Task, Files & Folders, or Connectors. Connectors are the **Launchpad** sources: Notion, Google Docs/Sheets, Linear, Airtable, Supabase, Mixpanel, Directus, and Jira, which was added in May 2026 ([Launchpad](https://docs.rocket.new/getting-started/task/launchpad.md); [changelog May wk3](https://docs.rocket.new/changelog/2026/may/week-3.md)).
- **`/` menu on the homepage** holds redesign commands such as "Reimagine Website Design", "Mobile-First Redesign" and "Fix Conversion Issues". These only work when starting a new task ([Redesign](https://docs.rocket.new/build/create/commands/redesign.md)).
- **Build from a URL:** Rocket reads the design system of the page you give it (Feb 2026) ([changelog Feb wk3](https://docs.rocket.new/changelog/2026/february/week-3.md)).
- **Templates** can be reached three ways: the sidebar, suggestions that appear from your prompt, or inline on the Build home. Each has a "Use this template" button ([Templates](https://docs.rocket.new/build/create/using-templates.md)).
- **The framework is chosen for you and cannot be changed.** Web gets Next.js, mobile gets Flutter. "Users cannot modify the framework after task creation" ([From an idea](https://docs.rocket.new/build/create/from-an-idea.md); [changelog Feb wk4](https://docs.rocket.new/changelog/2026/february/week-4.md)). Earlier versions (2025) let users choose React, HTML, Next.js or Flutter, and for Flutter a state-management option (Bloc, GetX or Stateless) ([changelog Apr 2025](https://docs.rocket.new/changelog/2025/april/week-4.md)).

### 3.3 Chat and agent interaction
- **Prompt Intelligence (clarity gate).** Every Build or Full Solve prompt is scored against a clarity threshold. If it falls short, a **clarifying-questions modal** appears with multiple-choice options and free-text fields, then a **Submit** button. It asks "only the specific gaps it needs filled": web or mobile, target users, essential screens, design references, integrations ([Prompt intelligence](https://docs.rocket.new/getting-started/task/prompt-intelligence.md)).
- **Guided screen selection (Mar 2026).** Before generating, Rocket proposes a list of screens with structured descriptions. The user deselects the ones they don't want, and all are selected by default ([changelog Mar wk2](https://docs.rocket.new/changelog/2026/march/week-2.md); [changelog Feb wk1](https://docs.rocket.new/changelog/2026/february/week-1.md); [blog guide](https://www.rocket.new/blog/how-to-create-first-app-with-rocket-new-practical-guide)). A third-party walkthrough says generation pauses after about 2 minutes for screen selection, followed by a "Build my Dashboard" style button and a 5–8 minute build ([search summary of a hands-on review](https://www.automateed.com/rocket-review), page now 410). I could not verify the exact label **(unverified)**.
- **User-in-the-loop (May 2026).** The agent can pause mid-generation to ask, for example, "analytics or admin dashboard?", then carry on from the same point ([changelog May wk4](https://docs.rocket.new/changelog/2026/may/week-4.md)).
- **Planning.** Since Dec 2025, generation "plans complex tasks before execution, tests the output, and resolves errors before displaying results" ([changelog Dec 2025](https://docs.rocket.new/changelog/2025/december/week-3.md)). **There is no separate Plan, Ask or Build mode toggle and no model picker in the docs.**
- **"Watch Rocket Work" (Apr 2026)** shows the agent's reasoning throughout the chat thread ([changelog Apr wk5](https://docs.rocket.new/changelog/2026/april/week-5.md)).
- **Progress display.** Rocket shows "each screen being generated with its status as it completes" and inline progress for each file. Since Feb 2026 it shows the specific filename being worked on. Status labels are **Completed / In Progress / Failed**, with a **Retry** button on failed pieces. Typical generation takes 1–3 minutes ([From an idea](https://docs.rocket.new/build/create/from-an-idea.md); [changelog Feb wk4](https://docs.rocket.new/changelog/2026/february/week-4.md); [blog guide](https://www.rocket.new/blog/how-to-create-first-app-with-rocket-new-practical-guide)).
- **Stop control.** Since 28 Apr 2026, "the abort control becomes inactive once generation begins" ([changelog Apr wk5](https://docs.rocket.new/changelog/2026/april/week-5.md)). In practice the user **cannot stop** a generation once it has started.
- **Auto-run safe actions (Oct 2025).** Routine, low-risk agent actions run without asking for confirmation ([changelog Oct wk4](https://docs.rocket.new/changelog/2025/october/week-4.md)).
- **Agent sleeping.** After 10–15 minutes idle, the chat shows "The agent is sleeping due to inactivity" and a **"Wake Up Agent"** button. While asleep, chat, preview, deploy and GitHub are all paused ([Agent sleeping](https://docs.rocket.new/build/editor/agent-sleeping.md)).
- **Advisor Agent (9 Jun 2026).** A read-only "senior architect" sub-agent running on Claude Opus. It activates **automatically** after the coding agent fails the same fix twice or more, before large refactors, or when there is a real architectural trade-off. It returns root causes, numbered steps and a trade-off table, and "never writes a line of code" ([Advisor](https://docs.rocket.new/build/editor/advisor-agent.md)).
- **Slash commands (100+, screen-aware).** They apply to the page currently open in the preview:
  - Brand: `/Update App Logo`, `/Change App Theme`, `/Add Light/Dark Theme`
  - Layout: `/Add Element`, `/Remove Screen`, `/Restructure Screen Layout`
  - Fixes: `/Fix Layout Issues`, `/Fix Navigation Issues`, `/Fix Hydration Errors`, `/Organize Code`
  - AI: `/Generate Image`, `/Generate SVG Illustration`, `/Suggest What to Build Next`, `/Migrate AI Integration`
  - i18n: `/Add RTL Support`, `/Add Multiple Languages`
  - SEO: `/Generate SEO Report`, `/Improve SEO`, `/Improve GEO And AEO`
  - Audits: `/Generate Accessibility Report`, `/Implement Privacy Compliance`
  - Connector commands for more than 20 services ([Commands](https://docs.rocket.new/build/editor/commands.md))
- **`@file` scoping.** For example, `@pages/login.jsx fix the submit button` limits the edit to one file ([Debugging](https://docs.rocket.new/learn/guides/debugging.md)).
- **Smart Suggestions (Dec 2025).** Clickable, context-aware next-step ideas that turn into prompts ([changelog Dec 2025](https://docs.rocket.new/changelog/2025/december/week-3.md)).
- **Agent web search.** Added for landing pages in Feb 2026, and for the whole initial generation flow in Jun 2026 ([changelog Jun wk1](https://docs.rocket.new/changelog/2026/june/week-1.md)).
- **Notifications.** An in-chat banner offers **"Notify me" / "Later"** for browser notifications when a long task finishes. You get an email if an APK build takes more than a minute. Android push notifications were added in Mar 2026 ([Notifications](https://docs.rocket.new/getting-started/task/notifications.md)).
- **Credits in chat.** I found no documentation of a cost shown per message, or an estimate before a run. Credits appear in Settings → Subscription ([Subscription](https://docs.rocket.new/getting-started/workspace/subscription.md)). Whether a live credit meter exists in the editor is **(unverified)**.

### 3.4 Live preview
- A **toolbar runs along the top of the preview** ([Preview](https://docs.rocket.new/build/editor/preview.md)) with these controls:
  - **Preview**
  - **Full screen**, which "hides the chat panel"
  - **`...` menu**, holding Connectors, APIs, Analytics, Performance and Remix
  - **URL bar**, where you can type any route
  - **Refresh**
  - **Edit dropdown** with *Visual edits* and *Theme*
  - **Camera**, which takes a screenshot of the full screen or a selected area so you can drag it into chat
  - **Device/responsive** switcher
  - **Launch**
- **Web device presets:** Desktop, Laptop, Tablet, Mobile.
- **Mobile device frames:** Galaxy S23, iPhone SE, 14 Pro, 16 Pro, 16 Pro Max, 17 Pro. Flutter apps run inside a device simulator ([Preview](https://docs.rocket.new/build/editor/preview.md); [Build quick start](https://docs.rocket.new/build/quick-start.md)).
- A **screen-selection dropdown** lets you jump between screens. Screen labels were added in Apr 2025 ([changelog Apr 2025](https://docs.rocket.new/changelog/2025/april/week-4.md)).
- **Visual edit.** Hovering highlights elements. Clicking one opens a **floating toolbar** with:
  - an **"Ask me..."** AI field
  - text editing
  - font size and weight (Bold, Semibold, Normal), italic and underline
  - colour picker and alignment
  - a **spacing panel** for margin and padding on each side
  - image replacement by URL, upload (1 MB limit), AI regeneration or a text description
  - delete
  - then **Save changes** ([Visual edit](https://docs.rocket.new/build/editor/visual-edit.md))
- **Theme panel** (websites and landing pages only):
  - font roles, chosen from Inter, Geist, DM Sans and others
  - colour tokens: Background, Foreground, Primary, Secondary, Accent, Muted, Card, Border, Input, Focus Ring
  - favicon and logo upload slots
  - every image grouped by page, plus "Shared Assets"
  - Theme changes never override element-level visual edits ([Theme](https://docs.rocket.new/build/editor/theme.md))
- **Limits:** there is no console or devtools panel in the preview docs, and no documented QR code for testing on a device. **Social login does not work inside Rocket's preview**, only on the deployed URL ([Social auth](https://docs.rocket.new/build/connectors/supabase/social-auth.md)).

### 3.5 Code view, editor and terminal
- **Explorer panel on the left** with a file tree and filename search. The editor saves with **Save / Discard** or Cmd/Ctrl+S. A **Logs panel along the bottom** shows live build output. The **top-right toolbar** has Refresh, **Download** (.zip, Pro or above, web only) and **GitHub** ([Code](https://docs.rocket.new/build/editor/code.md)).
- The editor warns when you edit `package.json` or `tailwind.config.js`.
- **No terminal or shell is documented.** No package-manager UI, no test runner, and no debugger ([Code](https://docs.rocket.new/build/editor/code.md)).
- **Custom code:** paste HTML, CSS, JS or iframe snippets and Rocket decides whether they go in `<head>`, `<body>`, before `</body>` or inline. Webhooks and server routes are not supported this way ([Custom code](https://docs.rocket.new/build/editor/custom-code.md)).
- On the mobile app, users can browse files and push to GitHub but cannot edit or download ([Code](https://docs.rocket.new/build/editor/code.md)).

### 3.6 Backend (database, end-user auth, storage, functions)
- **Rocket has no built-in database.** It relies on **Supabase** (connected by OAuth), and each task links to one Supabase project ([Supabase](https://docs.rocket.new/build/connectors/supabase/overview.md)).
- There are three ways to connect: Workspace Settings → Connectors; the task toolbar `...` → Connectors; or an in-chat **Connect** button that appears when your prompt mentions a backend.
- After authorising, the user picks or creates a Supabase organisation and project, entering a name, password and region.
- **What Rocket generates on top of Supabase:**
  - auth: sign-up, login, password reset and protected routes
  - Postgres schema
  - RLS policies
  - storage buckets
  - edge functions
  - realtime subscriptions
  - migration scripts, pushed from Rocket
- Extensions, connection pooling and RLS debugging still have to be done in the Supabase dashboard ([Supabase](https://docs.rocket.new/build/connectors/supabase/overview.md)).
- **End-user social login** needs setup in three places: the Supabase dashboard, the Google Cloud Console and your deployed URL ([Social auth](https://docs.rocket.new/build/connectors/supabase/social-auth.md)). Separately, "Google sign-in for Flutter in one step" was announced in Oct 2025 ([changelog Oct 2025](https://docs.rocket.new/changelog/2025/october/week-2.md)).
- Other data sources and CMSs: Airtable, Strapi, Directus, Webflow ([docs index](https://docs.rocket.new/llms.txt)).
- **Cron jobs and background workers are not documented.** An independent pricing analysis flags backend weaknesses: "authorization policies, background jobs, and API structure" typically need developer rewrites ([laracopilot, 26 Aug 2026](https://laracopilot.com/blog/rocket-new-pricing-2026/)).

### 3.7 AI features inside generated apps, and agent building
- AI connectors: **OpenAI, Anthropic, Gemini, Perplexity, ElevenLabs**. Each uses your own API key, and Rocket "uses the latest model for each provider automatically" ([AI connectors](https://docs.rocket.new/build/connectors/ai.md)).
- The "AI app" recipe produces a Next.js API route that proxies the model call server-side and streams the response. Conversations are stored in Supabase, history is capped at the last 20 messages, and there is an optional dropdown so users can pick the model. It takes about 30–45 minutes ([AI app recipe](https://docs.rocket.new/learn/recipes/ai-app.md)).
- `/Migrate AI Integration` moves client-side AI calls to server-side ([Commands](https://docs.rocket.new/build/editor/commands.md)).
- **There is no agent builder.** No framework support (LangGraph, CrewAI, OpenAI Agents SDK and so on), no tool-calling designer, and no evals or observability for agents. There is also no user-facing MCP support. "MCP Gateway" appears only as internal refactoring in a changelog ([Connectors overview](https://docs.rocket.new/build/connectors/overview.md); [changelog Apr wk4](https://docs.rocket.new/changelog/2026/april/week-4.md)). **This is a significant gap relative to the Architect 2.0 brief.**

### 3.8 Integrations, connectors, APIs and secrets
- More than 25 connectors in eight categories:
  - Payments: Stripe, Razorpay, AdSense
  - Email and messaging: Resend, SendGrid, Brevo, MailerLite, Mailchimp, Twilio
  - AI: OpenAI, Anthropic, Gemini, Perplexity, ElevenLabs
  - Database and CMS: Supabase, Airtable, Strapi, Directus, Webflow
  - Analytics: Google Analytics, Mixpanel
  - Forms and scheduling: Typeform, Tally, Calendly
  - Productivity: Notion, Linear, Jira, Azure DevOps, Google Workspace, Confluence
  - Other: Instagram, HubSpot, Figma, GitHub, Netlify
  ([docs index](https://docs.rocket.new/llms.txt))
- **Two scopes.** *Task-level* connectors (Stripe, AdSense, HubSpot) hold separate credentials for each task. *Workspace-level* connectors (Supabase, GitHub, Google, Typeform and others) are connected once in Settings. Keys are "encrypted at rest and never exposed in your code" ([Connectors](https://docs.rocket.new/build/connectors/overview.md)).
- You can add connectors from chat ("Connect Stripe to my project") as well as from menus. Rocket detects unsupported integrations and suggests alternatives, and warns when a setup could expose server secrets to the client (Mar 2026) ([changelog Mar wk3](https://docs.rocket.new/changelog/2026/march/week-3.md)).
- **APIs panel** (`...` → APIs), a 6-step wizard:
  1. Import from a Postman workspace, a cURL command, a Postman export file or a Swagger/OpenAPI file.
  2. Pick the route and the endpoint.
  3. **Click the UI element** the API should attach to.
  4. Choose a trigger, such as "On page load" or "On click".
  5. Add pre- and post-instructions.
  6. Rocket generates the code.
  ([APIs](https://docs.rocket.new/build/editor/apis.md))
- **Environment variables.** Open the task name (top-left) → Settings → **Environment**, which has **Staging** and **Production** tabs. Web apps use `.env` and mobile apps use `env.json`. The docs explain the difference between `NEXT_PUBLIC_` variables and server-only secrets. On custom-domain setup Rocket prompts with **Setup now / Skip & continue** ([Env vars](https://docs.rocket.new/build/editor/env-variables.md); [Custom domain](https://docs.rocket.new/build/launch-web/custom-domain.md)).

### 3.9 GitHub and version control
- The GitHub icon appears in three places: the top-right toolbar, `...` → Connectors, and workspace Settings. OAuth shows the consent screen "Authorize DhiWisePvtLtd". The connection is workspace-level. **Rocket creates the repo automatically** ([GitHub overview](https://docs.rocket.new/build/connectors/github/overview.md)).
- **Next.js TypeScript projects get two-way sync.** **Push** sends changes to a `rocket-update` branch and automatically opens a PR to `main`. The button then becomes **"Pull from GitHub"**, which pulls `main` with conflict resolution. Two-way sync requires a paid plan and shipped in Mar 2026 ([Code sync](https://docs.rocket.new/build/connectors/github/code-sync.md); [changelog Mar wk3](https://docs.rocket.new/changelog/2026/march/week-3.md)).
- **All other stacks, including Flutter and JS-only Next.js, get push only.** There are no automatic PRs and no pull ([GitHub overview](https://docs.rocket.new/build/connectors/github/overview.md)).
- **In-product versions.** Each AI response shows a **Files row** with the version number and changed files, plus buttons for **Code diff** (side-by-side, green and red), **Rollback** (confirmed with "Rollback now"), **Create label** (web only) and **Launch** ([Versions](https://docs.rocket.new/build/editor/versions.md)).
- **Rollback is destructive:** "Rolling back discards every version after the one you select … This cannot be undone" ([Versions](https://docs.rocket.new/build/editor/versions.md)).
- There are no branches or forks inside Rocket, other than Remix, which clones into another account.

### 3.10 Importing existing projects
- **From GitHub** ("+" → "Clone from GitHub"): **Next.js with TypeScript only.**
  - Flow: authorise, pick the repo and branch, then Rocket validates, clones, installs dependencies and builds a live preview.
  - Imported: files, dependencies, env keys and values, and routing.
  - *Not* imported: issues, PRs, Actions, git history and other branches.
  - The launch announcement says "public" repos ([From GitHub](https://docs.rocket.new/build/create/from-github.md); [changelog Apr wk2](https://docs.rocket.new/changelog/2026/april/week-2.md)).
- **From Figma:** paste a file or frame link (prototype links don't work), click **Start Import**, select frames, then choose web or mobile. Figma API rate limits can block this: View/Collab seats get only **6 requests per month** ([Figma](https://docs.rocket.new/build/create/figma/overview.md); [Rate limits](https://docs.rocket.new/build/create/figma/rate-limit-errors.md)).
- **From a screenshot or wireframe:** attach an image and describe the build ([From attachment](https://docs.rocket.new/build/create/from-an-attachment.md)).
- **From a URL:** "Build from a URL" and Redesign ([changelog Feb wk3](https://docs.rocket.new/changelog/2026/february/week-3.md)).
- **From documents and tools:** Launchpad sources (Notion PRDs, Linear or Jira tickets, a Supabase schema, Airtable bases, Google Sheets, Mixpanel funnels) ([Launchpad](https://docs.rocket.new/getting-started/task/launchpad.md)).
- **Zip upload is not documented** as an import option.

### 3.11 Deploy, hosting, custom domains and environments
- The **Launch** button sits top-right. It opens a dialog with **Staging** and **Production** tabs, and for mobile an **APK** tab ([Launch](https://docs.rocket.new/build/launch-web/launch-your-site.md); [APK](https://docs.rocket.new/build/launch-mobile/android-apk.md)).
- **Staging:** click **Publish** to get a staging URL. **Update** pushes new changes to the same URL. **Unpublish** requires Pro, and **Republish** is available. Production only updates when you publish, and rollback is one click (Apr 2026) ([changelog Apr wk2](https://docs.rocket.new/changelog/2026/april/week-2.md)).
- **Hosting:** Rocket's shared **Vercel** account by default. It moved from Netlify with a 7-day link cutover; the old domain was `builtwithrocket.new`. Users can connect their own **Netlify** account. Mobile web previews are "always hosted on Rocket's Netlify account" ([Netlify connector](https://docs.rocket.new/build/connectors/netlify.md); [Migrate hosting](https://docs.rocket.new/help/migrate-hosting.md); [Share as web preview](https://docs.rocket.new/build/launch-mobile/share-as-web-preview.md)).
- **Custom domain** (Pro or above), set up from the Production tab:
  - Rocket first tries to configure DNS automatically by getting temporary access to your registrar (**Continue**, then **Okay, continue**).
  - If that fails, it gives manual A records to add.
  - You confirm with "I have added all records above…", and the status changes to **Live**. HTTPS is automatic ([Custom domain](https://docs.rocket.new/build/launch-web/custom-domain.md)).
- **Buy a domain in the app** through **IONOS** (Apr 2026), from "Purchase a new domain" in either tab. The warning "Don't close this screen" matters because DNS is configured automatically only if the tab stays open ([Buy domain](https://docs.rocket.new/build/launch-web/buy-domain.md)).
- **Mobile publishing:**
  - **APK:** Launch → APK → **Build**, with a progress bar, an email if it takes more than a minute, then **Download**. Requires Pro or above.
  - The **APK Agent** auto-fixes common Android build errors (Oct 2025, improved Jan 2026) ([APK](https://docs.rocket.new/build/launch-mobile/android-apk.md); [changelog Jan 2026](https://docs.rocket.new/changelog/2026/january/week-2.md)).
  - **App Store and Play Store:** Rocket does **not** submit for you. You download the zip and build the IPA with Xcode on a Mac, or the AAB with the Flutter CLI ([Apple](https://docs.rocket.new/build/launch-mobile/apple-store.md); [Google Play](https://docs.rocket.new/build/launch-mobile/google-play.md)). IPA download is "coming soon" ([FAQ](https://docs.rocket.new/help/faq.md)).
  - A 2025 blog guide describes the Launch menu offering downloadable APK **and IPA** files ([blog guide](https://www.rocket.new/blog/how-to-create-first-app-with-rocket-new-practical-guide)). That conflicts with the FAQ, so IPA download is **(unverified)**.

### 3.12 Debugging and automatic error fixing
- **"Fix it" button.** Shown on errors Rocket detects, and **free for paid users** ([Credits](https://docs.rocket.new/getting-started/credits.md)).
- **Multi-error fix** with a count of issues resolved (Jun 2025) ([changelog Jun 2025](https://docs.rocket.new/changelog/2025/june/week-1.md)).
- **Hydration-error detector** in the Next.js lint pipeline, plus `/Fix Hydration Errors`, which reads live errors from the preview (May 2026) ([changelog May wk1–2](https://docs.rocket.new/changelog/2026/may/week-2.md)).
- **Escalation to the Advisor Agent** when fixes keep failing (see 3.3).
- **Flutter SDK dependency validation** to catch mismatched packages before a build (Nov 2025) ([changelog Nov 2025](https://docs.rocket.new/changelog/2025/november/week-2.md)).
- **Debugging guide.** The docs push users to describe the problem clearly (expected vs actual behaviour, the error, where it happens, what they've tried) and to use `/Fix …` commands ([Debugging](https://docs.rocket.new/learn/guides/debugging.md)).
- The **Troubleshooting page** shows where users commonly get stuck ([Troubleshooting](https://docs.rocket.new/help/troubleshooting.md)):
  - Supabase RLS, JWT and redirect problems
  - Stripe webhooks and test vs live mode
  - unverified email senders
  - the Launch button disabled because of unresolved chat errors
  - empty production env vars
  - production running an older version than the preview
  - blank or grey screens

### 3.13 Testing
- **There is no dedicated testing feature.** No unit or E2E test generation, and no automated browser agent that clicks through the app. The only related claim is that since Dec 2025 generation "tests the output … before displaying results" ([changelog Dec 2025](https://docs.rocket.new/changelog/2025/december/week-3.md)). The docs tell users to test manually after each change ([Best practices](https://docs.rocket.new/build/best-practices.md)).

### 3.14 Security scanning
- **Rocket does not scan continuously.** The security checklist tells users to paste a manual audit prompt before deploying ("Review my app for security issues. Check for exposed API keys, missing authentication…") ([Security checklist](https://docs.rocket.new/learn/tutorials/security-checklist.md)).
- There are passive warnings for configurations that would expose secrets (Mar 2026). Remix strips environment variables but "cannot detect" keys pasted into code ([Remix](https://docs.rocket.new/build/create/share-with-remix.md)).
- Compliance tooling: `/Implement Privacy Compliance` adds cookie banners and GDPR/CCPA policies. The WCAG 2.1 AA audit uses axe-core (Feb 2026) ([changelog Feb wk4](https://docs.rocket.new/changelog/2026/february/week-4.md)).

### 3.15 Analytics, monitoring and logs
- **Built-in analytics** (`...` → Analytics) with no setup needed ([Analytics](https://docs.rocket.new/build/measure/analytics.md)):
  - Visits, Unique Visitors, Pageviews, Visit Duration and Bounce Rate
  - breakdowns by Source, Page, Device, Country and UTM Campaign
  - date ranges with comparison
  - only the deployed site is tracked
- **Performance tab** (websites and landing pages only) ([Performance](https://docs.rocket.new/build/measure/performance.md)):
  - an A–F grade, LCP, INP and CLS, plus FCP and TTFB
  - Staging/Production and Desktop/Mobile toggles
  - **Try to fix** (costs credits) or **Ignore** on each issue, with estimated savings shown
- Automatic image compression, code splitting and lazy loading on builds (Feb 2026).
- **No runtime error monitoring or server log viewer** for deployed apps is documented. The Logs panel only shows build output.

### 3.16 Collaboration, teams, sharing and remixing
- **Structure:** Workspace → Project → Task, three levels of nesting.
  - Roles are Owner, Editor and Viewer. /build also mentions Admin.
  - Invitations go out by email or copyable link.
  - Access to existing projects is **only** granted if the inviter ticks "Grant access".
  - A **Requests** tab in notifications handles people asking for access.
  - Editors get a default 100-credit allowance, which owners can set anywhere from 0 to 10,000 (Aug 2026).
  - Free workspaces can hold up to 100 members (Jun 2026).
  ([Collaboration](https://docs.rocket.new/getting-started/collaboration/overview.md); [Workspace](https://docs.rocket.new/getting-started/workspace/overview.md); [changelog Jun wk4](https://docs.rocket.new/changelog/2026/june/week-4.md))
- **Projects** hold shared context: uploaded files, Notion and Google Drive links, and the outputs of earlier tasks. You can `@`-mention an earlier task, but only within the same project ([Project context](https://docs.rocket.new/getting-started/project/context/overview.md); [Cross-task context](https://docs.rocket.new/getting-started/task/task-context.md)).
- **Real-time co-editing and comments are not documented.** /build claims a "single compound context" instead ([/build](https://www.rocket.new/build)).
- **Remix** (Pro or above) creates a link. The recipient sees a preview page with the title, description, view count and a live app, then clicks **"Remix in Rocket"**. Secrets are stripped ([Remix](https://docs.rocket.new/build/create/share-with-remix.md)).
- **Visibility:** Public tasks show a "Built with Rocket" badge. **Free-plan Build tasks are always public and may be used to train Rocket's AI** ([Visibility](https://docs.rocket.new/build/editor/visibility.md); [FAQ](https://docs.rocket.new/help/faq.md)).

### 3.17 Templates and gallery
- 25,000+ website and landing-page templates in 42 or more categories. Technology alone has 3,969. Search covers category, use case and industry. Templates are free until you customise them ([/templates](https://www.rocket.new/templates); [Templates](https://docs.rocket.new/build/create/using-templates.md)).
- Since Feb 2026, template and remix links show interactive previews instead of static images ([changelog Feb wk2](https://docs.rocket.new/changelog/2026/february/week-2.md)).
- I found no community gallery with votes or rankings. A "Community" link sits in the footer, but its contents are **(unverified)**.

### 3.18 Mobile apps
- Flutter for iOS and Android from one codebase. Device-frame preview. APK build with auto-fix. A web-preview link. Store submission is left to the user (see 3.11).
- Flutter now supports the Notion, Linear and Google connectors (May 2026). Visual edits carry through into APK builds (May 2026 fix) ([changelog May wk2](https://docs.rocket.new/changelog/2026/may/week-2.md)).
- The company's own app, **Rocket: Pocket App Studio** for iOS, lets you build from your phone. It has fewer features than the web version: no visual edit, full screen, screenshots or Figma import ([Preview](https://docs.rocket.new/build/editor/preview.md)).

### 3.19 Pricing and credit model
- **Current plans** (since 12 May 2026) ([pricing](https://www.rocket.new/pricing); [changelog May wk2](https://docs.rocket.new/changelog/2026/may/week-2.md)):
  - **Free:** $0, 20 credits
  - **Pro:** $25/mo, 100 credits
  - **Rocket:** $50/mo, 250 credits, adds Full Solve and Intelligence
  - **Booster:** $250/mo, 1,500 credits
  - 20% off with annual billing. No per-seat fees. Add-on packs of 100, 1,000 or more.
- **What each paid tier unlocks:**
  - **Pro or above** is needed for: private tasks, code download, APK, custom domain, buying a domain, unpublishing, Remix links, and two-way GitHub sync.
  - **Rocket and Booster** include Intelligence at no extra credit cost.
- **Rollover:** unused credits roll over on monthly plans. On annual plans they roll over within the term. If you cancel, **all unused credits expire at the end of the cycle**. When the balance hits zero, "Rocket pauses generation" ([Credits](https://docs.rocket.new/getting-started/credits.md)).
- **What is free:** "Fix it" on errors Rocket detects (paid users only) and template use.
- **History:**
  - Before Apr 2026, Rocket billed in **tokens**: 1M tokens free, and $25 for 5M tokens.
  - A 2026 review lists older tiers of "Personal" at $25 (5M tokens, 6 Figma screens) and "Rocket" at $50 (10.5M tokens) ([aigearbase](https://aigearbase.com/tool/rocketnew)).
  - Token rollover was added Oct 2025.
  - Rocket 1.0 converted balances at **1M tokens = 20 credits** ([Tokens to credits](https://docs.rocket.new/help/tokens-to-credits.md)).
  - TechCrunch (Apr 2026) reported $25 for Build, $250 for strategy and $350 for the full platform. The pricing page replaced that a month later with the four tiers above ([TechCrunch Apr 2026](https://techcrunch.com/2026/04/06/indian-startup-rocket-wants-its-ai-to-do-mckinsey-style-consulting-at-a-fraction-of-the-cost/)).
  - Pricing has changed at least three times in about 12 months.
- **Unit economics:** gross margin 50–55%, targeting 60–70% ([TechCrunch](https://techcrunch.com/2025/09/22/rocket-new-one-of-indias-first-vibe-coding-startups-snags-15m-from-accel-salesforce-ventures)).

### 3.20 Enterprise
- SSO/SAML, data localisation, premium support, onboarding help, custom contracts and audit logs. SOC 2, ISO 27001, GDPR and CCPA are claimed ([pricing](https://www.rocket.new/pricing); [/build](https://www.rocket.new/build)). There is no public trust-centre detail **(unverified)**.

### 3.21 Non-Build pillars (context for the product's scope)
- **Solve** ([Solve](https://docs.rocket.new/solve/overview.md)):
  - *Light Solve* gives fast conversational answers.
  - *Full Solve* runs about 45 minutes as a six-step pipeline with parallel research agents shown in chat. Each stream lists positives and negatives, data, tools used, research done and an assessment.
  - A "Final report" link opens the report **in the right panel with chat on the left**.
  - Exports: PDF, PPT, HTML or PRD. Refinements are versioned.
- **Intelligence** ([Intelligence](https://docs.rocket.new/intelligence/overview.md); [changelog Jun wk1](https://docs.rocket.new/changelog/2026/june/week-1.md)):
  - Covers nine signal pillars, from website changes to hiring.
  - Feeds: For You, Following, Saved, Discover, Watchlist.
  - **Intel Cards** each show a title, what it means, why it matters, and a magnitude indicator.
  - Lives at `/dashboard/intelligence/`.

---

## 4. UI layout

*Everything here comes from the docs' text descriptions. I had no hands-on access, and YouTube pages were not readable. Anything inferred is labelled.*

**Visual language**
- Dark and space-themed. The Sep 2025 "Mission Control" redesign introduced "space-black panels" and "dynamic animated trails" ([changelog Sep 2025](https://docs.rocket.new/changelog/2025/september/week-3.md)). Light and dark appearance settings are available ([Workspace manage](https://docs.rocket.new/getting-started/workspace/manage.md)).
- The rocketry metaphor runs throughout: *Launch*, *Launchpad*, *Mission Control*, *Booster* plan, an "agent sleeping" state, and older docs paths named `/ignition/`.
- Pillar icons: lightbulb for Solve, rocket for Build, bolt for Intelligence ([Quick start](https://docs.rocket.new/getting-started/quick-start.md)).

**Home screen**
- The Rocket 1.0 home is described as "unified" ([changelog Apr wk2](https://docs.rocket.new/changelog/2026/april/week-2.md)).
- A **centred task input** carries the **+** attachment menu at bottom-left, a **lock** icon for visibility and a **Send** button. Below it sit **Solve, Build and Intelligence cards**, then category tabs or chips with example prompts, then template suggestions when Build is selected ([Solve quick start](https://docs.rocket.new/solve/quick-start.md); [From an idea](https://docs.rocket.new/build/create/from-an-idea.md)).

**Sidebar**
- The **workspace name sits top-left** and opens a menu: Switch workspace, Invite members, Settings, New workspace.
- Sidebar items include **Tasks** (with a "Start new Task" card), **Recent Tasks** (with a hover `...` menu for Rename, Star, Add to Project and Delete), **Templates**, **Intelligence** and projects ([Task manage](https://docs.rocket.new/getting-started/task/manage.md); [Workspace manage](https://docs.rocket.new/getting-started/workspace/manage.md)).
- In the templates doc the sidebar is revealed by **hovering over the left screen edge** ([Templates](https://docs.rocket.new/build/create/using-templates.md)), which suggests it auto-hides.
- The exact order of sidebar items is **(unverified)**.

**Build workspace (editor)**
- **Top-left:** the task name, which opens a dropdown with Settings, Star and Add to Project. Settings contains Overview (with visibility) and Environment (with Staging and Production tabs) ([Env vars](https://docs.rocket.new/build/editor/env-variables.md); [Task manage](https://docs.rocket.new/getting-started/task/manage.md)).
- **Chat panel:**
  - The message thread shows reasoning ("Watch Rocket Work"), per-screen and per-file progress, Fix it buttons, and a Files row on each response with Code diff, Rollback, Create label and Launch.
  - The input has **+** at bottom-left, supports `/` and `@`, and has Send.
  - Smart Suggestions appear as clickable chips **(position unverified)**.
- **Preview panel:** its toolbar runs across the top. From left to right, which is **inferred** from the order the docs list them: Preview, Full screen, `...`, URL bar, Refresh, Edit (Visual edits / Theme), Camera, Device, and **Launch at top-right**.
- **Chat is on the left and preview on the right. This is inferred, not confirmed.** Full screen "hides the chat panel", so the two sit side by side. Solve explicitly puts its output in "the right panel while chat remains visible on the left".
- **Code view:** Explorer on the left, the editor in the centre, Logs collapsible along the bottom, and Refresh / Download / GitHub at top-right ([Code](https://docs.rocket.new/build/editor/code.md)). How you switch between Preview and Code (tabs or toggle) is **(unverified)**.
- **Launch dialog:** a modal with Staging, Production and APK tabs.

**Settings**
- Workspace Settings has four tabs: **Overview** (name, description, invite permissions), **Connectors** (grid of cards with Connect buttons, green dot when connected), **Subscription** (plan, credits, payment, Invoices page) and **Members** (roles and credit limits per Editor) ([Workspace](https://docs.rocket.new/getting-started/workspace/overview.md)).
- Account settings: Profile, Notifications, Notification settings, Appearance ([docs index](https://docs.rocket.new/llms.txt)).

**Density**
- One user described it as a "clean and modern interface that initially appears professional" ([SourceForge](https://sourceforge.net/software/product/Rocket.new/)). Another praised the "intuitive visual editor" ([Trustpilot](https://www.trustpilot.com/review/rocket.new)).
- The editor has **many small surfaces** behind menus: `...` alone holds Connectors, APIs, Analytics, Performance and Remix. This is my inference from how the docs are organised.

---

## 5. Step-by-step user flows

### 5.1 Main flow: sign up to deployed app with a custom domain
1. **Sign up** with Continue with Google, SSO, or email plus a 6-digit OTP. There are no onboarding questions. The user lands on Home with the default Free workspace and 20 credits ([Create account](https://docs.rocket.new/getting-started/create-an-account.md)).
2. **First prompt.** Type into the central input, or pick the Build card, then a category tab or example. Optionally attach files, a Figma link or a GitHub repo with **+**, and set the lock icon to Public or Private. Web or mobile is decided from the prompt and **cannot be changed later**.
3. **Clarity gate.** If the prompt is vague, a modal of targeted questions appears. Answer them and click Submit ([Prompt intelligence](https://docs.rocket.new/getting-started/task/prompt-intelligence.md)).
4. **Screen plan.** Rocket shows suggested screens with descriptions, all selected by default. Untick the ones you don't want, then click Generate or Build ([changelog Mar wk2](https://docs.rocket.new/changelog/2026/march/week-2.md)).
5. **Watching the build.**
   - The chat shows each screen and file with Completed, In Progress or Failed status, the current filename, the agent's reasoning, and **Retry** on failures.
   - The agent may search the web or stop to ask a question (user-in-the-loop).
   - The **Stop button is disabled once generation starts**.
   - A banner offers "Notify me" for a browser notification.
   - Screens appear in the preview as they are generated. Typical time is 1–3 minutes, and some reviewers report 5–8.
6. **Iterate.** Three routes: chat in natural language, `/` commands for exact edits, `@file` for scoped edits, and **Edit → Visual edits** for direct changes. The camera tool lets you screenshot the preview and drop it into chat. Each response creates a version with Code diff and Rollback.
7. **Preview.** Use the URL bar to reach any route, the Device switcher for screen sizes or phone frames, and Full screen to hide chat.
8. **Fix errors.** A **Fix it** button appears on detected errors (free on paid plans). Repeated failures bring in the **Advisor Agent** automatically. As a last resort, roll back, which deletes later versions.
9. **Add a database or auth.** Ask in chat ("add login and save user projects"). Rocket shows an in-chat **Connect** button for Supabase. After OAuth, pick an organisation and a new or existing project. Rocket then generates the schema, RLS, auth pages and migrations. Social login also needs configuration in the Supabase and Google dashboards, and can only be tested on the deployed URL.
10. **Connect GitHub.** Click the GitHub icon (top-right), then Connect, then "Authorize DhiWisePvtLtd". Rocket creates the repo. **Push** sends to `rocket-update` with an automatic PR (two-way sync for Next.js TS only). Afterwards the button reads "Pull from GitHub".
11. **Deploy.** Click **Launch** (top-right), choose the **Staging** tab and click **Publish** to get a staging URL. Later edits are pushed with **Update**.
12. **Custom domain.** In the **Production** tab, enter a domain you own or pick "Purchase a new domain" (IONOS). Fill in production env vars (**Setup now / Skip & continue**). Rocket either configures DNS automatically or shows A records to add manually. Once DNS resolves the status reads **Live** and HTTPS is automatic ([Custom domain](https://docs.rocket.new/build/launch-web/custom-domain.md)).
13. **After launch.** Open `...` → Analytics for traffic and `...` → Performance for Core Web Vitals with Try to fix. Run `/Improve SEO` and similar audits. Optionally set up **Intelligence** to watch competitors.

### 5.2 Importing an existing project
- **GitHub:** Build → **+** → "Clone from GitHub" → authorise → pick the repo and branch → Rocket validates it is Next.js TS, clones, installs and previews → continue in chat → Push/Pull sync ([From GitHub](https://docs.rocket.new/build/create/from-github.md)). Repos in other stacks are rejected.
- **Figma:** **+** → "Add from Figma" → paste the link → **Start Import** → authorise Figma → select frames → choose web or mobile → Rocket generates the code.
- **Live website:** `/` → a redesign command → paste the URL and describe the direction.
- **Docs, tickets or schema:** `@` → Connectors → Notion, Linear, Jira, Supabase and so on → Rocket pulls features, workflows and data models from them ([Launchpad](https://docs.rocket.new/getting-started/task/launchpad.md)).

### 5.3 Research to build (Rocket's unique flow)
1. Create a Solve task.
2. Answer the clarity questions.
3. Watch the parallel research streams (about 45 minutes for Full Solve).
4. Open the Final report in the right panel.
5. Export it as PDF, PPT or PRD.
6. In the **same project**, start a Build task and `@`-mention the Solve task.
7. Launch, then monitor with Intelligence ([Research to launch](https://docs.rocket.new/learn/workflows/research-to-launch.md)).

### 5.4 Building an agent
- **There is no agent-building flow.** The nearest thing is the "Build an AI app" recipe: add an AI connector (your own API key), get a server-side streaming chat backed by Supabase history, then deploy ([AI app recipe](https://docs.rocket.new/learn/recipes/ai-app.md)).

### 5.5 Collaboration
1. The workspace owner opens the workspace menu, then **Invite members**.
2. Enter an email or copy an invite link, pick Editor or Viewer, and optionally tick "Grant access" to existing projects.
3. Editors receive a 100-credit allowance by default, adjustable in Settings → Members.
4. Access can also be granted at project or task level. Requests arrive in the notifications **Requests** tab.
5. To share with outsiders, use **Remix** (clone link) or **Public** visibility (view only) ([Collaboration](https://docs.rocket.new/getting-started/collaboration/overview.md)).

### 5.6 Mobile to device
1. Build a Flutter app.
2. Preview it in a phone frame.
3. Launch → **APK** tab → **Build** → wait for the progress bar or the email → **Download** → sideload on Android 8 or later.
4. To share, deploy a web preview link (hosted on Rocket's Netlify).
5. For the stores, download the zip and use Xcode or the Flutter CLI yourself ([APK](https://docs.rocket.new/build/launch-mobile/android-apk.md)).

---

## 6. UX strengths and pain points

### Strengths (with evidence)
- **Quick first result and good-looking output.** One review said it turned "a relatively complex project brief" into a working web app "in less than 15 minutes … design quality is miles ahead" (quoted in search summaries of third-party reviews). Trustpilot reviewers call it "modern, fast and insanely easy to use" ([Trustpilot p2](https://www.trustpilot.com/review/rocket.new?page=2)).
- **Support that responds fast and by name.** Trustpilot is 4.5/5 from 173 reviews, and 74% are 5★. Replies "in under 10 minutes" and named agents come up again and again. In one case credits were restored during a personal crisis ([Trustpilot](https://www.trustpilot.com/review/rocket.new)).
- **Integrations are woven through.** A 5★ reviewer praised Stripe, Supabase and GitHub as "tight integration peppered throughout" ([Trustpilot p3](https://www.trustpilot.com/review/rocket.new?page=3)).
- **Control without writing prompts.** `/` commands, `@` scoping, visual edit with a spacing panel, and the Theme token editor.
- **Error fixing is free on paid plans**, which Trustpilot reviewers mention specifically ([Trustpilot search summary](https://www.trustpilot.com/review/rocket.new)).
- **Wide range of starting points:** prompt, Figma, screenshot, URL, template, GitHub, and Notion or Jira context.
- **Built-in post-launch tools:** analytics, performance, SEO and accessibility, all in the same editor.

### Pain points (with evidence)
- **Credits run out fast, including on the platform's own mistakes.**
  - SourceForge: "Constantly burns up credits fixing its own errors", "Excessive token consumption without producing a usable or finished result" ([SourceForge](https://sourceforge.net/software/product/Rocket.new/)).
  - Trustpilot: one reviewer spent $75 over hours without the result they wanted, and another said "3 sentences and need to upgrade" (2★, Jul 2026) ([Trustpilot](https://www.trustpilot.com/review/rocket.new)).
  - Independent analysis: a "retry tax", where "one stubborn feature can eat a week of allowance in an afternoon" ([laracopilot](https://laracopilot.com/blog/rocket-new-pricing-2026/)).
- **Opinion is split between love and anger.** 74% 5★ but 14% 1★ on Trustpilot. The 1/10 reviews on SourceForge say it was "marketed as production-ready but is beta quality", with users "unable to build basic CRUD forms", navigation or scrolling broken, and uploads not showing on the live site ([SourceForge](https://sourceforge.net/software/product/Rocket.new/)).
- **Mobile builds fail.** "Persistent APK build failures" (SourceForge) and APK failures that needed support (Trustpilot). Rocket had to ship an APK Agent and a file-watcher fix (Jun 2026) ([changelog Jun wk4](https://docs.rocket.new/changelog/2026/june/week-4.md)).
- **Too many clarifying questions, and freezing.** One tester (Oct 2025) described "endless follow-up questions" and that "it started freezing mid-generation" ([shipper.now](https://shipper.now/rocket-alternatives/)). Rocket's own Jun 2026 changelog fixes "stuck progress indicators … spinning indefinitely" ([changelog Jun wk4](https://docs.rocket.new/changelog/2026/june/week-4.md)).
- **Developer features are narrow.** Import and two-way GitHub sync work **only with Next.js TS**. The framework cannot change after creation. There is no terminal, no tests and no agent frameworks. The iOS IPA isn't downloadable and store submission is manual.
- **Hidden destructive actions.** Rollback wipes all later versions. Deleting a task is permanent. Making a private task public reveals its entire history ([Versions](https://docs.rocket.new/build/editor/versions.md); [Visibility](https://docs.rocket.new/build/editor/visibility.md)).
- **Pauses caused by the platform.** The agent sleeps after 10–15 minutes idle, and connectors and preview are blocked until you wake it. Stop is disabled during generation.
- **Auth and payments are hard for non-technical users.** Social login needs three dashboards and doesn't work in preview. Most troubleshooting entries are about Supabase RLS/JWT, Stripe webhooks and env vars ([Troubleshooting](https://docs.rocket.new/help/troubleshooting.md)).
- **Free-plan privacy.** Free Build tasks are always public and may be used for training ([FAQ](https://docs.rocket.new/help/faq.md)).
- **Messaging and pricing keep changing.** Tokens became credits, and plans were restructured three times in about a year. "Pricing in active flux" ([productgrowth.in](https://productgrowth.in/tools/no-code/dhiwise/)). The shift to "Vibe Solutioning" also dilutes the builder story.
- **Weak mobile companion app.** 3.2★ on iOS, and reviewers say it is just a web wrapper ([App Store](https://apps.apple.com/us/app/rocket-pocket-app-studio/id6752393417)).
- **Mostly promotional content online.** A large share of search results are Rocket's own SEO blog posts comparing itself to rivals, and some press looks like paid placement. Independent review volume is thin and there is no real Hacker News or Reddit presence in the results. This is my observation.

---

## 7. Notable launches, 2025–2026

| Date | Launch |
|---|---|
| Apr 2025 | Figma-to-code (React/HTML/Flutter/Next.js), natural-language editing, visual edit, multi-tab preview, rollback, GitHub sync, Netlify deploy, token billing ([changelog](https://docs.rocket.new/changelog/2025/april/week-4.md)) |
| Jun 2025 | Public beta launch. Multi-error fix ([TechCrunch](https://techcrunch.com/2025/09/22/rocket-new-one-of-indias-first-vibe-coding-startups-snags-15m-from-accel-salesforce-ventures)) |
| Sep 2025 | $15M seed. DhiWise rebrands to Rocket. "Mission Control" dark redesign |
| Oct 2025 | `/` and `@` commands, APK Agent, Google sign-in for Flutter, token rollover, auto-run safe actions |
| Nov 2025 | **Precision Mode** (100+ commands), 13 Nov. iOS companion app, 29 Nov |
| Dec 2025 | Smart Suggestions. Plan, test and self-fix before showing results |
| Jan 2026 | APK auto bug-fix. Image attachments as design reference |
| Feb 2026 | Workspaces and roles, build from URL and redesign, SEO/GEO/AEO, accessibility (axe-core), privacy compliance, Claude Sonnet 4.6 as default, e-commerce project type, Next.js as default |
| Mar 2026 | 11 new connectors, Performance tab, 25K templates, two-way Git sync for Next.js, guided screen selection, React deprecated, multi-format uploads |
| **7 Apr 2026** | **Rocket 1.0 "Vibe Solutioning"**: Solve, Build and Intelligence. Projects, cross-task context, GitHub clone import, staging/production, domain purchase, tokens become credits, new sidebar and editor ([changelog](https://docs.rocket.new/changelog/2026/april/week-2.md); [PR Newswire](https://www.prnewswire.com/news-releases/rocket-1-0-solves-what-vibe-coding-left-out-what-to-build-and-what-comes-after-launch-302735531.html)) |
| Apr 2026 | Project-level collaboration, Razorpay, HubSpot, Confluence and Webflow connectors, 5 files per message, "Watch Rocket Work" reasoning |
| May 2026 | Four-tier credit pricing (12 May), **Launchpad** (build from Notion, Linear, Supabase and others), `/Fix Hydration Errors`, Jira and ElevenLabs, user-in-the-loop clarification |
| Jun 2026 | Intelligence redesign (Watchlist, Intel Cards), agent web search in first generation, **Advisor Agent** (9 Jun), Mixpanel and Directus Launchpad sources, reported talks on $40–50M at $500M |
| Jul 2026 | Light Solve for Free and Pro, automatic Light/Full routing, PDF/PPT/HTML/PRD export |
| Aug 2026 | Editor credit caps from 0 to 10,000 (last changelog entry found, 17 Aug) |

---

## 8. Ideas for Architect 2.0

- **ADOPT: A clarity gate that only asks what's missing.** Score the prompt. If it's clear enough, start building. If not, show a short modal with a few multiple-choice questions and an "Other" text field, covering only the missing pieces (platform, users, key screens, integrations). Add a "skip, just build" option to avoid Rocket's "endless follow-up questions" complaint.
- **ADOPT: An editable screen plan before generation.** Show a checklist of proposed screens or pages, each with a one-line description, that the user can edit before spending credits. It works for non-technical users, and developers can extend it to routes, data models and API endpoints.
- **ADOPT: Every AI turn is a version card in chat.** Changed files, a diff, restore, label and deploy on each turn. **IMPROVE** on Rocket by making restore non-destructive (restore creates a new version, or branches), unlike Rocket's irreversible rollback.
- **ADOPT: Staging and Production as first-class environments.** Put them as tabs in the Deploy dialog, with separate env vars and one-click promote and rollback. Show clearly which version is live in production.
- **ADOPT: Automatic escalation to a stronger model after two failed fixes, and free fixes for errors the platform itself detected.** Show this visibly ("Stuck? Architect is bringing in a reviewer"), and show the diagnosis as a readable card with root cause, plan and trade-offs.
- **ADOPT: `/` commands that know the current screen, plus `@` context.** Let `@` point to files, earlier chats, connectors and docs, and `/` run repeatable actions. This gives developers precision and gives non-developers a menu of what's possible.
- **ADOPT: Start from existing material.** Offer Figma, a screenshot, a live URL, a Notion PRD, Linear or Jira tickets, or a DB schema as starting points on the homepage, not buried in docs.
- **ADOPT: A "watch it work" transparency layer.** Per-file and per-screen status, the current file being written, the agent's reasoning, retry on failed steps, and a "Notify me when done" banner for long runs.
- **ADOPT: Built-in post-launch tools.** Analytics (visits, sources, devices), a Core Web Vitals grade with "Fix / Ignore" per issue, and SEO and accessibility audits. It gives non-technical users a "what next" after deploy.
- **ADOPT: Buy a domain in the app with automatic DNS**, plus a manual-records fallback with a live verification status.
- **ADOPT: Credit caps per member and one shared credit pool** for teams, with unlimited seats.
- **IMPROVE: Import and GitHub for real developers.** Rocket only supports Next.js TS. Architect should accept any repo or stack (Node, Python, monorepos) or a zip file, run a **compatibility check with clear results** before import, keep git history, and offer two-way sync with branch choice and PR review inside the product.
- **IMPROVE: Don't lock the framework or platform.** Let users add a mobile target (Expo or Flutter) to an existing web app that shares the same backend, instead of Rocket's "start a new task".
- **IMPROVE: Always allow Stop.** Stop safely at the next checkpoint and keep completed files. Rocket disables abort during generation.
- **IMPROVE: Don't let the agent go to sleep on the user.** Keep the sandbox warm, or wake it silently when the user comes back, instead of showing a "Wake Up Agent" wall.
- **IMPROVE: Show credit costs clearly.** Estimate before running ("~3 credits"), show actual cost after each turn, show the balance in the header, and warn before expensive actions. Rocket's pricing complaints mostly come from not knowing what things will cost.
- **IMPROVE: Auth that works in preview without configuration.** Provide managed Google and GitHub sign-in that works inside the preview, with "bring your own OAuth keys" as an advanced option. Rocket requires three dashboards and a deployed URL.
- **IMPROVE: A first-class Agent section (Rocket has none).**
  - A framework picker covering LangGraph, CrewAI, OpenAI Agents SDK, Vercel AI SDK and Mastra.
  - A tool and MCP connector catalogue.
  - A visual graph view of the agent.
  - A playground chat with a trace viewer.
  - Evals.
  - Deployment as an API or scheduled job.
- **IMPROVE: Automatic security scanning before deploy.** Check for secrets in code, missing RLS or auth on routes, and exposed server keys, and block or warn in the Deploy dialog. Rocket only offers a copy-paste audit prompt.
- **IMPROVE: A developer mode that is actually there.** A real terminal, logs from the running app (not only build logs), a test runner and generated tests, a console in the preview, and a Plan / Ask / Build mode toggle. Rocket has none of these, and its "dev mode" is still "coming soon".
- **IMPROVE: Hands-off mobile store publishing.** Cloud-build the IPA and AAB, add a store-listing checklist, and automate submission (for example through Expo EAS or Fastlane). Rocket leaves users with Xcode and the CLI.
- **AVOID: Destructive defaults hidden behind one confirmation.** Examples are irreversible rollback, permanent task deletion, and "make public reveals all history". Use undo, soft-delete and clear warnings.
- **AVOID: Charging credits for the platform's own failures.** This is Rocket's most repeated complaint. Make automatic fixes and failed generations free or refunded, and say so in the UI.
- **AVOID: Overpromising "production-ready" when output quality varies.** Set expectations with a readiness checklist (auth, RLS, env vars, errors, performance) shown before deploy.
- **AVOID: Spreading one app across too many new pillars.** Rocket needed three cards, projects, tasks, feeds and watchlists to explain Solve, Build and Intelligence, and its message keeps shifting. Architect 2.0 should keep one mental model: **Project → Chat, Preview, Code, Agents, Deploy**. Research and planning should be a mode inside a project, not a separate product.
- **AVOID: Silently making free users' work public or using it for training.** Make visibility explicit at creation and let free users keep private drafts.
- **AVOID: Key features buried in the `...` menu or a hover-to-reveal sidebar.** Put Deploy, GitHub, Database and Agents in a persistent, labelled top bar or left rail. This is my inference from Rocket's docs structure, not a documented user complaint.

---

## Sources

**Primary (Rocket)**
- https://www.rocket.new/
- https://www.rocket.new/pricing
- https://www.rocket.new/build
- https://www.rocket.new/templates
- https://www.rocket.new/rocket-vs-lovable
- https://docs.rocket.new/llms.txt (full docs index)
- https://docs.rocket.new/getting-started/introduction
- https://docs.rocket.new/getting-started/create-an-account.md
- https://docs.rocket.new/getting-started/quick-start.md
- https://docs.rocket.new/getting-started/credits.md
- https://docs.rocket.new/help/tokens-to-credits.md
- https://docs.rocket.new/getting-started/task/overview.md
- https://docs.rocket.new/getting-started/task/prompt-intelligence.md
- https://docs.rocket.new/getting-started/task/launchpad.md
- https://docs.rocket.new/getting-started/task/task-context.md
- https://docs.rocket.new/getting-started/task/attachments.md
- https://docs.rocket.new/getting-started/task/notifications.md
- https://docs.rocket.new/getting-started/task/manage.md
- https://docs.rocket.new/getting-started/workspace/overview.md
- https://docs.rocket.new/getting-started/workspace/manage.md
- https://docs.rocket.new/getting-started/workspace/subscription.md
- https://docs.rocket.new/getting-started/project/overview.md
- https://docs.rocket.new/getting-started/project/context/overview.md
- https://docs.rocket.new/getting-started/collaboration/overview.md
- https://docs.rocket.new/build/overview.md
- https://docs.rocket.new/build/quick-start.md
- https://docs.rocket.new/build/best-practices.md
- https://docs.rocket.new/build/create/from-an-idea.md
- https://docs.rocket.new/build/create/from-an-attachment.md
- https://docs.rocket.new/build/create/from-github.md
- https://docs.rocket.new/build/create/figma/overview.md
- https://docs.rocket.new/build/create/figma/rate-limit-errors.md
- https://docs.rocket.new/build/create/commands/redesign.md
- https://docs.rocket.new/build/create/share-with-remix.md
- https://docs.rocket.new/build/create/using-templates.md
- https://docs.rocket.new/build/editor/chat.md
- https://docs.rocket.new/build/editor/commands.md
- https://docs.rocket.new/build/editor/visual-edit.md
- https://docs.rocket.new/build/editor/theme.md
- https://docs.rocket.new/build/editor/preview.md
- https://docs.rocket.new/build/editor/versions.md
- https://docs.rocket.new/build/editor/code.md
- https://docs.rocket.new/build/editor/custom-code.md
- https://docs.rocket.new/build/editor/apis.md
- https://docs.rocket.new/build/editor/env-variables.md
- https://docs.rocket.new/build/editor/agent-sleeping.md
- https://docs.rocket.new/build/editor/advisor-agent.md
- https://docs.rocket.new/build/editor/visibility.md
- https://docs.rocket.new/build/connectors/overview.md
- https://docs.rocket.new/build/connectors/ai.md
- https://docs.rocket.new/build/connectors/supabase/overview.md
- https://docs.rocket.new/build/connectors/supabase/social-auth.md
- https://docs.rocket.new/build/connectors/github/overview.md
- https://docs.rocket.new/build/connectors/github/code-sync.md
- https://docs.rocket.new/build/connectors/netlify.md
- https://docs.rocket.new/build/launch-web/launch-your-site.md
- https://docs.rocket.new/build/launch-web/custom-domain.md
- https://docs.rocket.new/build/launch-web/buy-domain.md
- https://docs.rocket.new/build/launch-mobile/android-apk.md
- https://docs.rocket.new/build/launch-mobile/apple-store.md
- https://docs.rocket.new/build/launch-mobile/google-play.md
- https://docs.rocket.new/build/launch-mobile/share-as-web-preview.md
- https://docs.rocket.new/build/measure/analytics.md
- https://docs.rocket.new/build/measure/performance.md
- https://docs.rocket.new/solve/overview.md
- https://docs.rocket.new/solve/quick-start.md
- https://docs.rocket.new/intelligence/overview.md
- https://docs.rocket.new/learn/workflows/research-to-launch.md
- https://docs.rocket.new/learn/recipes/ai-app.md
- https://docs.rocket.new/learn/tutorials/your-first-task.md
- https://docs.rocket.new/learn/tutorials/security-checklist.md
- https://docs.rocket.new/learn/guides/debugging.md
- https://docs.rocket.new/learn/guides/core-concepts.md
- https://docs.rocket.new/learn/tips.md
- https://docs.rocket.new/help/faq.md
- https://docs.rocket.new/help/troubleshooting.md
- https://docs.rocket.new/help/migrate-hosting.md

**Changelog entries**
- 2025: [Apr wk4](https://docs.rocket.new/changelog/2025/april/week-4.md), [Jun wk1](https://docs.rocket.new/changelog/2025/june/week-1.md), [Sep wk3](https://docs.rocket.new/changelog/2025/september/week-3.md), [Oct wk2](https://docs.rocket.new/changelog/2025/october/week-2.md), [Oct wk4](https://docs.rocket.new/changelog/2025/october/week-4.md), [Nov wk1](https://docs.rocket.new/changelog/2025/november/week-1.md), [Nov wk2](https://docs.rocket.new/changelog/2025/november/week-2.md), [Dec wk3](https://docs.rocket.new/changelog/2025/december/week-3.md)
- 2026 Jan–Mar: [Jan wk2](https://docs.rocket.new/changelog/2026/january/week-2.md), [Feb wk1](https://docs.rocket.new/changelog/2026/february/week-1.md), [Feb wk2](https://docs.rocket.new/changelog/2026/february/week-2.md), [Feb wk3](https://docs.rocket.new/changelog/2026/february/week-3.md), [Feb wk4](https://docs.rocket.new/changelog/2026/february/week-4.md), [Mar wk1](https://docs.rocket.new/changelog/2026/march/week-1.md), [Mar wk2](https://docs.rocket.new/changelog/2026/march/week-2.md), [Mar wk3](https://docs.rocket.new/changelog/2026/march/week-3.md), [Mar wk4](https://docs.rocket.new/changelog/2026/march/week-4.md)
- 2026 Apr: [Apr wk1](https://docs.rocket.new/changelog/2026/april/week-1.md), [Apr wk2](https://docs.rocket.new/changelog/2026/april/week-2.md), [Apr wk3](https://docs.rocket.new/changelog/2026/april/week-3.md), [Apr wk4](https://docs.rocket.new/changelog/2026/april/week-4.md), [Apr wk5](https://docs.rocket.new/changelog/2026/april/week-5.md)
- 2026 May–Aug: [May wk1](https://docs.rocket.new/changelog/2026/may/week-1.md), [May wk2](https://docs.rocket.new/changelog/2026/may/week-2.md), [May wk3](https://docs.rocket.new/changelog/2026/may/week-3.md), [May wk4](https://docs.rocket.new/changelog/2026/may/week-4.md), [Jun wk1](https://docs.rocket.new/changelog/2026/june/week-1.md), [Jun wk2](https://docs.rocket.new/changelog/2026/june/week-2.md), [Jun wk3](https://docs.rocket.new/changelog/2026/june/week-3.md), [Jun wk4](https://docs.rocket.new/changelog/2026/june/week-4.md), [Jul wk2](https://docs.rocket.new/changelog/2026/july/week-2.md), [Aug wk3](https://docs.rocket.new/changelog/2026/august/week-3.md)

**Rocket blog (first-party, promotional)**
- https://www.rocket.new/blog/rocket-precision-mode-command-based-ai-building
- https://www.rocket.new/blog/rocket-new-build-vs-other-ai-app-builders
- https://www.rocket.new/blog/how-to-create-first-app-with-rocket-new-practical-guide
- https://www.rocket.new/blog/how-do-you-build-a-mobile-app-without-writing-code-on-rocket-new
- https://www.rocket.new/blog/rocket-new-vs-cursor-vs-windsurf-the-gap-is-context-depth

**Press and company background**
- https://techcrunch.com/2025/09/22/rocket-new-one-of-indias-first-vibe-coding-startups-snags-15m-from-accel-salesforce-ventures
- https://techcrunch.com/2026/04/06/indian-startup-rocket-wants-its-ai-to-do-mckinsey-style-consulting-at-a-fraction-of-the-cost/
- https://www.prnewswire.com/news-releases/rocket-1-0-solves-what-vibe-coding-left-out-what-to-build-and-what-comes-after-launch-302735531.html
- https://startupfeed.in/rocket-funding-360-one-500m-valuation/
- https://productgrowth.in/tools/no-code/dhiwise/

**Reviews and sentiment**
- https://www.trustpilot.com/review/rocket.new (also [page 2](https://www.trustpilot.com/review/rocket.new?page=2) and [page 3](https://www.trustpilot.com/review/rocket.new?page=3))
- https://sourceforge.net/software/product/Rocket.new/
- https://www.joinsecret.com/rocket-new/reviews
- https://apps.apple.com/us/app/rocket-pocket-app-studio/id6752393417
- https://shipper.now/rocket-alternatives/
- https://aigearbase.com/tool/rocketnew
- https://laracopilot.com/blog/rocket-new-pricing-2026/
- https://vibecoding.app/tools/rocket-new
- https://axiabits.com/the-easiest-way-to-build-your-mobile-app-in-minutes-rocket-new/
- https://theinvisiblementor.com/ai-monday-rocket-new-and-the-future-of-app-creation/

**Could not be read** (HTTP 403 or 410, or YouTube pages without metadata)
- G2 (https://www.g2.com/products/rocket-app-builder/reviews)
- HostAdvice review
- Medium (Rathod)
- automateed review
- YouTube tutorials BoHWB8HhtIM, G2uEVkuWdCU, WRVUwFVy3E0
