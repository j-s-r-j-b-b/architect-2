# Cursor (plus Windsurf / Devin Desktop, Kiro, Zed, Copilot and others): Competitive Research for Architect 2.0

- **Researched:** 2026-09-26. The latest Cursor changelog entry reviewed is dated **Sep 23, 2026** (Rollouts and Security Review).
- **Why this file matters:** Cursor sets what *developers* expect from an AI builder: fine control over context, reviewable diffs, reversible changes, clear permissions and parallel agents. Architect 2.0 must meet those expectations for its technical users without scaring off non-technical ones.
- **Method:**
  - Primary sources first: Cursor docs (https://cursor.com/docs), the changelog (https://cursor.com/changelog, pages 1–8), the blog, and the pricing page (https://cursor.com/pricing).
  - For Windsurf, the Devin/Cognition docs and blog.
  - Secondary sources: Cursor community forum threads, Hacker News (via the HN Algolia API), InfoQ, The Decoder, CNBC, TechCrunch, and review and tutorial blogs.
- **Limits:**
  - I did not sign up or log in, so I never saw the logged-in UI directly. Layout comes from docs, changelogs and tutorials.
  - **(inferred)** marks a detail I pieced together. **(unverified)** marks a claim I could not confirm from a primary source.
- **Warning about secondary sources:** many 2026 "pricing guides" are out of date.
  - Several still say Auto mode is "unlimited". It stopped being unlimited in Sep 2025. On Aug 24, 2026 the flat Auto rate was retired too.
  - Many still call Windsurf "Windsurf". Since Jun 2, 2026 it has been **Devin Desktop**, and its Cascade agent reached end of life on Jul 1, 2026.

---

## 1. Positioning: what makes Cursor different

**One-line summary:** Cursor started as an AI-first fork of VS Code. In 2026 it became an **agent command center for professional developers**: many parallel agents (local, git worktrees, cloud VMs, remote SSH), started from anywhere (desktop, web, iOS, Slack, GitHub, Linear, Jira, Teams). All their output is reviewed as diffs and PRs.

**How the product evolved:**

| Date | Milestone | Source |
|---|---|---|
| Jun 4, 2025 | **Cursor 1.0**: Bugbot, Background Agents for everyone, one-click MCP | HN 44185256 |
| Jun 16, 2025 | Pricing moves from 500 requests to $20 of usage, which triggers a backlash | https://techcrunch.com/2025/07/07/cursor-apologizes-for-unclear-pricing-changes-that-upset-users/ |
| Aug 7, 2025 | **Cursor CLI** (headless agent) | HN 44830221 |
| Oct 29, 2025 | **Cursor 2.0**: Composer, its first in-house model; an agent-centric UI; up to 8 parallel agents in worktrees; a native browser tool | https://cursor.com/blog/2-0 |
| Nov 21, 2025 | **2.1**: interactive clarifying questions in Plan Mode; AI code review in the editor; Instant Grep | https://cursor.com/changelog/2-1 |
| Dec 10, 2025 | **2.2**: Debug Mode; a visual editor in the browser; Mermaid diagrams in plans; multi-agent judging | https://cursor.com/changelog/2-2 |
| Dec 2025 | Acquires **Graphite** (stacked PRs and code review) | https://en.wikipedia.org/wiki/Cursor_(company) |
| Jan 22, 2026 | **2.4**: subagents, Skills (`SKILL.md`), image generation, a clarifying-questions tool | https://cursor.com/changelog/2-4 |
| Feb 17, 2026 | **2.5**: Plugins and the Cursor Marketplace; async subagents; sandbox network controls | https://cursor.com/changelog/2-5 |
| Apr 2, 2026 | **Cursor 3**: the Agents Window, an "agent-first" interface InfoQ reports was built from scratch, not as an extension of the VS Code fork (code-named "Glass" per dev.to) | https://cursor.com/changelog/3-0 ; https://www.infoq.com/news/2026/04/cursor-3-agent-first-interface/ |
| Apr–Sep 2026 | Nearly weekly releases (3.1 to 3.11+): canvases, Security Review, SDK, Composer 2.5, Auto-review run mode, iOS app, Cursor Router, Origin, Start from scratch, Projects | changelog pages 1–8 |
| Aug 14, 2026 | **SpaceX completes a ~$60B all-stock acquisition** of Anysphere. Cursor now sits in the "SpaceXAI" unit | https://finance.yahoo.com/technology/ai/articles/spacex-completes-record-60-billion-131311785.html ; https://en.wikipedia.org/wiki/Cursor_(company) |
| Aug 28, 2026 | **OpenAI says it will end model access to Cursor on Nov 12, 2026.** CEO Michael Truell says OpenAI models are about 5% of traffic | https://www.cnbc.com/2026/08/29/openai-cursor-spacex-model-access.html ; https://openai.com/index/our-decision-on-cursor-following-its-acquisition-by-spacex/ |

**What sets it apart:**
1. **Developer-grade control inside the loop.**
   - **Context control:** @-mentions and a context ring with a token breakdown.
   - **Standing instructions:** rules, AGENTS.md, skills and hooks.
   - **Review:** Keep/Undo per file and per hunk, plus checkpoints.
   - **Permissions:** run modes, a sandbox, `permissions.json` and hooks.
   No prompt-to-app builder offers this depth.
2. **The best-in-class Tab model**, which predicts your next edit and where you will jump next. It is trained with online RL and updated several times a day. Cursor reports 21% fewer suggestions and a 28% higher acceptance rate (https://cursor.com/blog/tab-rl). Tab is the original moat.
3. **Its own models.** Composer (Oct 2025), then Composer 2 (Mar 19, 2026, built on Moonshot's Kimi K2.5), then **Composer 2.5** (May 18, 2026).
   - Composer 2.5 prices: $0.50/M input and $2.50/M output tokens; the "Fast" variant costs $3/$15 (https://cursor.com/blog/composer-2-5).
   - Artificial Analysis ranks Composer 2.5 third on its Coding Agent Index at about **$0.07 per task**. Opus 4.7 in Claude Code costs about $4.10 per task (https://artificialanalysis.ai/articles/cursor-composer-2-5-coding-agent-index).
   - After the SpaceX deal: **Grok 4.5 and 4.6** are "Cursor models", and the **Cursor Router** powers Auto (https://cursor.com/changelog/router).
4. **Agents everywhere, one backend.** Desktop, the web (cursor.com/agents), iOS/iPad, Slack, Microsoft Teams, GitHub, Linear, Jira, the CLI and the SDK all feed one agent list (https://cursor.com/docs/cloud-agent).
5. **Owning the whole software lifecycle:**
   - **Write:** Tab, Agent, Projects.
   - **Review:** Bugbot, Graphite, Security Review.
   - **Host:** Origin, a git forge.
   - **Ship:** Vercel publish and the Rollouts deploy monitor.
   This is the stack Architect 2.0 must match for developers.
6. **Scale and money.** About $3B ARR by May 2026 (Wikipedia). Cursor's own team says 35% of its merged PRs come from autonomous cloud agents. Agent users now outnumber Tab users 2:1, a reversal from March 2025 (https://www.infoq.com/news/2026/04/cursor-3-agent-first-interface/).

---

## 2. Who uses it and why (jobs-to-be-done)

**Primary users: technical (about 95%+) (inferred from product design and reviews)**
- **Professional software engineers** in an existing codebase:
  - "Finish this edit" (Tab).
  - "Implement this ticket" (Agent or Plan).
  - "Find the bug" (Debug Mode).
  - "Review my PR" (Bugbot).
- **Tech leads and staff engineers** running many agents at once:
  - Migrations, refactors and CI fixing through Projects, Automations and `/best-of-n`.
- **Engineering orgs and enterprises** that need:
  - Governance: SSO, SCIM, audit logs, model, MCP and repo access controls, pooled usage, an AI code tracking API (https://cursor.com/pricing).
  - Automated review and security: Bugbot, Security Review, Rollouts.
- **India and students:** the **Cursor Start** plan (₹649/month, UPI, Jul 28, 2026) targets this group. Cursor says India has "more power users than any other market and the highest number of agent requests per developer" (https://cursor.com/blog/cursor-start-india ; https://analyticsindiamag.com/ai-news/cursor-launches-649-monthly-india-plan-with-upi-payments).

**Secondary users: semi-technical and non-technical (small but growing)**
- Designers and PMs using **Design Mode** and the visual editor to tweak UI by pointing at it (https://cursor.com/blog/design-mode).
- **Start from scratch** (Aug 27, 2026) lets anyone prompt a cloud agent with no repo, preview the result, and publish to Vercel. This is Cursor's first real move into Lovable and Bolt territory (https://cursor.com/changelog/start-from-scratch).
- **Grok Bot** (Aug 11, 2026): "AI teammates" with names and jobs, running on a persistent cloud computer. It targets non-code knowledge work (https://cursor.com/docs/grok-bot).
- Reviews still say plainly: "It's a strong AI coding tool, but only if you already know how to code" (G2 summary, https://www.g2.com/products/cursor/reviews).

**Why people choose Cursor (evidence)**
- Familiar VS Code base: extensions, themes and keybindings import in one click (https://daily.dev/blog/setup-cursor-first-time/).
- It "feels like an IDE first and an AI tool second", with deep codebase awareness (G2 reviews).
- Speed. Composer completes "most turns in under 30 seconds" (https://cursor.com/blog/2-0). Bugbot reviews take about 90 seconds (https://cursor.com/changelog/bugbot-updates-june-2026).
- Model choice in one app, along with Auto routing. This advantage is shrinking: OpenAI models leave Nov 12, 2026.
- Control. You can micromanage one agent or delegate to a fleet.

---

## 3. Complete feature inventory (grouped by area)

### 3.1 Onboarding and auth
- **Desktop download** for macOS, Windows and Linux. The first-launch wizard offers **Import VS Code settings**: extensions, themes, keybindings and `settings.json` (https://daily.dev/blog/setup-cursor-first-time/).
  - The import can be re-run later from *Cursor Settings > General > Account > Import from VS Code* (https://devtoolsreview.com/tutorials/setup-cursor-vscode/).
- **Sign-in** goes through a cursor.com account in the browser. Exact identity providers: **(unverified)**; Google, GitHub and email are commonly described.
- **Privacy Mode** is in *Settings > General > Privacy*. It stops code being retained or used for training. Teams can enforce it team-wide (https://cursor.com/pricing).
- **Hobby (free)** needs no credit card.
- **Enterprise:** SAML/OIDC SSO, SCIM, and (since Jun 3, 2026) **Organizations**, which hold multiple teams and groups with their own budgets and model access (changelog page 5).

### 3.2 Home / prompt entry (Agents Window, web, mobile)
- **Prompt box** at the centre of the Agents Window (https://www.learncursor.dev/learn/cursor-agents/agents-window). Controls attached to the prompt:
  - **Mode picker:** Agent, Plan, Ask, Debug and Custom Modes. Shift+Tab cycles through them (https://cursor.com/docs/agent/modes).
  - **Model picker:**
    - **Auto**, powered by Cursor Router, with **Intelligence / Balance / Cost** settings. The routed model is hidden by default (https://cursor.com/changelog/router).
    - Or a specific model: Composer 2.5, Grok 4.5/4.6, Claude, Gemini, and GPT until Nov 12.
  - **Environment dropdown:** Local, Worktree, **Cloud** or remote SSH. "Select 'Cloud' in the agent input dropdown" (https://cursor.com/docs/cloud-agent).
  - **Repo/workspace picker**, redesigned in 3.11. It includes **Start from scratch** (no repo).
  - **Context ring:** click it to open a breakdown tray of tokens by category (system prompt, tools, rules, skills, MCP, subagents, summarized conversation, live conversation) (https://cursor.com/docs/context/mentions).
- **Attachments:** paste or drag images. Mention files, folders, `@Terminals`, `@Chats`, `@Commit`, `@Branch` and `@Browser`.
- **Slash commands** (the key ones):
  - `/worktree`, `/best-of-n` (the same task across several models; judged in 2.2)
  - `/in-cloud`, `/autopilot`, `/multitask`
  - `/loop` (repeat until done or on a schedule), `/goal` (a long-lived objective), `/automate`
  - `/review` (local Bugbot), `/create-rule`, `/add-plugin`
  - Sources: changelogs for 3.0, 3.2, 3.5, 3.7, 3.8 and Aug 19, 2026.
- **Quick-action pills** for pinned skills and common workflows (3.3). **Custom Modes** pin skills to a mode (Aug 19, 2026).
- **Voice input** on iOS and in Design Mode.
- **Templates:** there is no app-template gallery. The Marketplace does offer **automation templates**: Slack digest, product analytics, FAQ, finance and customer health agents (3.5).

### 3.3 Chat and agent interaction
- **Modes:**
  - **Agent:** full tools.
  - **Ask:** read-only. Since 2.2 it gets read-only terminal access.
  - **Plan:** researches the codebase, asks **clarifying questions in an interactive UI**, and writes an **editable plan document** with inline **Mermaid diagrams** and to-dos. You then click **Build**; "Save to workspace" persists the plan.
  - **Debug:** forms hypotheses, adds instrumentation logs sent to a local debug server, asks you to reproduce, analyses the logs, fixes, then removes the instrumentation.
  - Sources: https://cursor.com/docs/agent/modes ; https://cursor.com/docs/agent/debug-mode ; 2.1 and 2.2 changelogs.
- **Clarifying-questions tool** in any mode. The agent keeps working while it waits for your answer (2.4).
- **Plan hand-off:** send individual to-dos to new agents (2.2). "Build in Parallel" runs plan steps as async subagents (3.3). **Split PRs** divides work into dependent PRs automatically (3.3).
- **Subagents:** built-in ones cover codebase exploration, terminal and parallel work. They can be custom, async, and nested in trees (2.4, 2.5). Cloud subagents run on separate VMs (3.7).
- **Streaming display:**
  - Tool calls: read, grep, edit, terminal, browser.
  - A to-do list.
  - Live diffs: "The diff view shows changes as they happen" (https://cursor.com/docs/agent/review).
  - **Tool-call density** is Compact, Balanced or Detailed (3.4).
  - **Stop** (Cmd+Shift+Backspace) cancels and redirects.
  - **Non-blocking steering:** redirect the agent mid-action (Aug 19, 2026).
- **Chat management:** agent tabs side-by-side or in a grid (3.0), **Fork Chat** (2.5), **Side Chats** (3.11), pinned chats (2.2), transcript search, and shared transcripts that include the plan (3.0).
- **Canvases** (Apr 15, 2026). The agent answers with interactive React "durable artifacts" (tables, diagrams, charts, diff views) that sit in the side panel. They can be shared as read-only links (3.5) (https://cursor.com/blog/canvas).
- **Credits and usage shown:**
  - The context ring appears in chat.
  - Usage lives in the dashboard, with a Spending page.
  - Soft spend alerts fire at 50/80/100% (May 4, 2026).
  - **Controversy:** the dollar-cost graph was removed from the usage page (Aug 2026). See §6.

### 3.4 Live preview and visual editing
- The **Cursor Browser** is a native pane the agent drives:
  - Navigate, click, type, scroll, screenshot.
  - Read console errors and network requests.
  - Cookies and storage persist across sessions.
  - Tool approval: manual (the default), allow-listed, or auto-run.
  - Enterprises can set origin allowlists.
  - Source: https://cursor.com/docs/agent/browser
- **Visual editor** (2.2, Dec 2025):
  - A sidebar component tree.
  - Drag and drop across the DOM.
  - Sliders, colour pickers using your tokens, and flex/grid/typography controls.
  - **React props** surfaced for each variant.
  - Point-and-prompt ("make this bigger"). Agents apply the edits in parallel.
  - Source: https://cursor.com/blog/browser-visual-editor
- **Design Mode** (3.0, improved Jun 5, 2026):
  - ⌘⇧D toggles it; Shift+drag selects an area; ⌘L adds the element to chat; ⌥+click adds it to the input.
  - Draw on a frozen frame, multi-select elements, narrate by voice.
  - **Queue edits while the agent works.**
  - Each selection captures the xpath, component, computed styles, fiber props and a screenshot.
  - Source: https://cursor.com/blog/design-mode
- **Cloud preview:** cloud agents' live environments are port-forwarded to your browser (Aug 27, 2026). Cloud agents also record **videos and screenshots** of their own testing, and you can take **remote desktop control** of the VM (https://cursor.com/docs/cloud-agent).
- **No device toggles** were documented for the browser pane **(unverified)**.

### 3.5 Code view, editor, file tree and terminal
- The **full VS Code-based IDE** stays available. Switch with *Cmd+Shift+P → Open Editor Window*, or the arrow at top right (https://www.learncursor.dev/learn/cursor-agents/agents-window).
- The **Agents Window right panel** holds:
  - a file browser;
  - a **per-agent sandbox terminal**;
  - the Cursor Browser;
  - a **Review pane**;
  - canvases and source control.
  - ⌘P file search and ⌘⇧F workspace search work there too.
- **Tab** handles multi-line edits and next-edit "jumps" (https://cursor.com/blog/tab-update). **Cmd+K** does inline edits (a long-standing feature).
- **Terminal commands and run modes** (*Settings > Agents > Approvals & Execution*; https://cursor.com/docs/agent/security/run-modes):
  - **Auto-review** (the default since 3.6, May 29, 2026):
    - Allowlisted calls run immediately.
    - Other shell commands run **in the sandbox** where possible.
    - Anything else goes to an **LLM classifier** (Claude 4.5 Haiku or GPT-5.4 Mini), which approves it, suggests an alternative, or escalates to you.
  - **Allowlist:** only allowlisted calls run without approval; the sandbox is optional.
  - **Run Everything:** no prompts.
  - "Ask Every Time" was deprecated in 3.5.
  - The classifier is steered by plain-English rules in `~/.cursor/permissions.json` or `.cursor/permissions.json`, for example: "Every AWS CLI command should go through approval first".
- **Sandbox** (https://cursor.com/docs/agent/security/run-modes):
  - macOS uses Seatbelt; Linux uses Landlock plus seccomp.
  - Network is **blocked by default**.
  - Network modes: sandbox.json only, sandbox.json plus 100+ default domains, or Allow All.
  - Protected paths include `.git/config`, `.git/hooks`, `.vscode` and Cursor config.
  - These always need approval, whatever the mode: browser actions, `rm`, and writes outside the workspace.
- **Checkpoints:**
  - Created automatically before significant changes.
  - Click one in the timeline to **preview**, then **Restore Checkpoint**.
  - Restoring reverts files only; the messages stay.
  - Stored locally and separately from git.
  - Source: https://cursor.com/docs/agent/chat/checkpoints

### 3.6 Diff review (accept or reject changes)
- **In the IDE:**
  - A per-file review bar sits at the top of the editor next to the breadcrumbs: a file counter, **Undo File** and **Keep File**.
  - Per-change Keep/Undo appears inline.
  - Floating controls read "**Undo all / Keep all / Review next file**".
  - Source: forum reports, https://forum.cursor.com/t/per-change-keep-undo-buttons-missing-after-agent-edits-only-undo-all-available/158983 ; https://forum.cursor.com/t/agent-multi-file-review-controls-appear-in-the-editor-tab-breadcrumb-area-i-want-the-bottom-undo-keep-style-back-or-a-setting-to-choose/155718
  - Users repeatedly report the controls going missing or moving between versions.
- **Agent Review:** after a run, click **Review → Find Issues** and an AI reviews the diff line by line. From Source Control you can review all local changes against main (https://cursor.com/docs/agent/review).
- **PR review in Cursor** (3.3): a redesigned PR interface with **Reviews / Commits / Changes** tabs. The branch shows at top right, next to a **commit-and-push** button with a small arrow for creating a branch.
- **Multi-agent judging:** when agents run in parallel, Cursor evaluates every result and recommends the winner with an explanation (2.2).

### 3.7 Backend (database, end-user auth, storage, functions, cron)
- **There is no built-in backend.** Cursor edits your code and your infrastructure. It does not host a database or auth for your end users. This is a real gap compared with Lovable, Replit and Emergent.
- It fills the gap through **plugins and MCP**:
  - Launch partners: AWS, Stripe, Figma, Linear, Amplitude (2.5).
  - Google Workspace plugins (Aug 3, 2026).
  - Community servers on cursor.directory.
- **Cron-like work** is covered by **Automations** (schedules and events) and `/loop`, but these automate *the agent*, not the user's app.

### 3.8 AI features and agent building
- **Cursor SDK** (Apr 29, 2026; custom tools added Jun 4):
  - `npm install @cursor/sdk`, plus Python.
  - Lets you build programmatic agents on Cursor's runtime, with custom tools, stores (SQLite/JSONL), auto-review permission rules, and nested subagents.
  - Source: changelog pages 5 and 8
- **Framework-agnostic:** the agent writes LangGraph, CrewAI, AI SDK or Mastra code like any other code. There is no agent-specific builder UI for *end-user* agents.
- **Customize page** (3.9, Jun 22, 2026): one place for plugins, skills, MCPs, subagents, rules, commands and hooks, at user, team or workspace level. It adds a marketplace leaderboard and plugin canvases.
- **Automations** (Feb–Mar 2026, extended in 3.5 and 3.8):
  - Always-on cloud agents triggered by schedules, GitHub/GitLab events, Slack (including emoji triggers), webhooks or Linear.
  - They can be multi-repo or have no repo at all.
  - `/automate` builds an automation from a local chat.
  - Source: https://cursor.com/docs/cloud-agent/automations
- **Projects** (Sep 10, 2026, beta):
  - A **coordinator agent** plans and delegates to fleets of cloud subagents, "thousands" of them.
  - Keeps **shared context files** that agents write their learnings into.
  - **Subscriptions** let it watch Slack channels or PRs, or run on a schedule.
  - Returns PRs.
  - Cursor claims heavy users merged 6× more PRs. A reviewer measured about 5× the tokens of a single agent.
  - Sources: https://www.eesel.ai/blog/cursor-projects-review ; https://pondero.ai/news/2026-09-11-cursor-projects/
- **Grok Bot** (Aug 11, 2026): named bots set up by chatting ("Create a Bot, describe the job, and grant access as it asks"). They share one persistent cloud computer, use plugins or computer use, and can save a learned path as a skill to rerun on a schedule (https://cursor.com/docs/grok-bot).

### 3.9 Integrations, connectors, MCP, APIs and secrets
- **MCP** (https://cursor.com/docs/context/mcp):
  - Transports: stdio, SSE and Streamable HTTP, with OAuth.
  - Config in `.cursor/mcp.json` or `~/.cursor/mcp.json`.
  - One-click install from Customize.
  - Supports Tools, Prompts, Resources, Roots, Elicitation and **MCP Apps**, which return interactive UI.
  - Tools need approval by default.
  - Admins can allowlist servers and tools.
- **Rules** (https://cursor.com/docs/context/rules):
  - `.cursor/rules/*.mdc` with four types: **Always Apply**, **Apply Intelligently** (the agent decides from the description), **Apply to Specific Files** (globs) and **Apply Manually** (@-mention).
  - **AGENTS.md**, including nested files where the most specific wins.
  - User Rules and **Team Rules** from the dashboard; Team Rules take precedence.
  - `/create-rule` creates one.
- **Skills** (`SKILL.md`) and **Hooks** (`hooks.json` at enterprise, team, project or user level):
  - Hook events include `preToolUse`, `beforeShellExecution`, `beforeMCPExecution`, `afterFileEdit`, `beforeSubmitPrompt`, `subagentStart`, `stop` and more.
  - A hook can **deny**, **ask**, rewrite input or inject a follow-up (https://cursor.com/docs/agent/hooks).
- **Chat surfaces:**
  - **Slack:** `@cursor repo=… model=… branch=… env=…`. It reads the whole thread, posts a plan first, then posts status updates and a PR (https://cursor.com/docs/integrations/slack).
  - Microsoft Teams (May 11, 2026) and Jira (May 19, 2026).
  - Linear, and GitHub/Bitbucket `@cursor` comments.
- **Secrets:** a Secrets tab in the dashboard for cloud agents, build secrets for Dockerfile environments, Tailscale for private networks, and team-level admin control of secrets (3.0 and 3.4).
- **Self-hosted machines** (Sep 2, 2026): run agents on your own laptop, VM or team worker pools. Supports AWS Lambda, Coder, Cloudflare, Modal, Vercel and E2B, plus computer use.

### 3.10 GitHub and version control
- **Git providers:** GitHub (including Enterprise Server), GitLab (including self-hosted), Bitbucket (including Data Center) and Azure DevOps, connected in the dashboard (https://cursor.com/docs/bugbot).
- **Worktrees:** each local agent gets an isolated checkout. `/worktree` creates one and `/best-of-n` fans a task out across them (3.0 and 3.2). Multi-root workspaces handle changes that span repos.
- **Origin** (Aug 17, 2026, early beta) is Cursor's **own git forge** (https://cursor.com/docs/origin):
  - Git-compatible repos, PRs, and code browsing in a **Codebase tab** at cursor.com/codebase, with "Find repo…", **New**, and GitHub sync.
  - It can mirror GitHub; GitHub stays the source of truth.
  - Paid plans only.
  - HN: "Cursor launches Origin, GitHub alternative", 597 points.
- **Graphite** (acquired Dec 2025): stacked PRs and the Diamond reviewer. Cursor cloud agents can create and ship PRs inside Graphite (Mar 3, 2026) (https://tessl.io/blog/cursor-acquires-graphite-to-bridge-code-creation-and-review/).

### 3.11 Importing existing projects
- Open a local folder, **clone a repo**, or connect over **Remote SSH** / WSL. WSL has gaps in the Agents Window per forum reports.
- Cursor indexes the codebase for semantic search; `.cursorignore` excludes files.
- Cloud agents work on any connected repo. Origin can mirror a GitHub repo.
- **Figma:** available through the Figma plugin/MCP (2.5 launch partner). There is no native "import from Figma / screenshot / URL clone" flow like the prompt-to-app builders have. You can paste a screenshot into chat.

### 3.12 Deploy, hosting, domains and environments
- There was **no native hosting until Aug 2026**. Now:
  - **Start from scratch → Create repo → connect Vercel → publish** gives a live URL. Vercel is required (https://cursor.com/changelog/start-from-scratch).
  - Origin integrates with Vercel, Depot and Buildkite.
- **Rollouts** (Sep 23, 2026; Teams and Enterprise):
  - A bot attaches to PRs and builds a **monitoring plan** covering risks and instrumentation gaps.
  - Tracks each deploy per environment (staging, prod) against logs, metrics and traces.
  - Integrates with Datadog.
  - Flags regressions and names the suspect change (https://cursor.com/changelog).
- **Custom domains:** handled in Vercel, not in Cursor.

### 3.13 Versions, history, checkpoints and rollback
- Agent checkpoints (local, file-only), git, worktrees, and PR history in Origin or GitHub.
- Cloud environments have **version history and rollback** (3.4). Builds fall back to the last good build (Aug 13, 2026).

### 3.14 Debugging and automatic error fixing
- Debug Mode, browser console and network tools, `@Terminals`, and agents that monitor long-running jobs through an `Await` tool (3.0).
- **Bugbot Autofix** starts a cloud agent to fix the bugs it found. Options: **Off**, **Create New Branch** (recommended) or **Commit to Existing Branch** (at most 3 attempts per PR).
- PR comments carry **Fix in Cursor** and **Fix in Web** buttons.
- Projects and Automations can "follow all your PRs, fixing CI".

### 3.15 Testing
- Agents run tests in the terminal or sandbox, drive the browser, and record video demos (cloud computer use, 3.8).
- There is no dedicated test-authoring UI. The **Jan 2026 "agents built a browser" experiment** drew criticism because agents disabled failing tests and the code did not compile (HN 46646777, 724 points). This is the cautionary tale for "verified by agent" claims.

### 3.16 Security scanning
- **Security Review** (beta Apr 30, 2026; expanded Sep 23, 2026):
  - A PR bot that finds exploitable bugs: injection, auth bypass, secrets, SSRF, deserialization, vulnerable dependencies.
  - Reports severity, the attack path and a proposed fix.
  - Supports custom team rules and skips draft PRs.
  - A scheduled **Vulnerability Scanner** runs alongside it.
- **Bugbot rules:** `.cursor/BUGBOT.md` (nested files supported), Team Rules, and **Learned Rules**. Teach it inline with `@cursor remember …`. Analytics show how often each rule is accepted.
- **Agent safety:** the Auto-review classifier, the sandbox and the hardcoded protections (§3.5).
- Docs admit plainly: "The allowlist is best-effort, not a security boundary."

### 3.17 Analytics, monitoring and logs
- Team usage analytics filtered by user and product surface, real-time pool dashboards, and spend alerts via Slack or email (Teams, Jun 2026).
- Bugbot analytics API, audit logs and an AI code tracking API for Enterprise.
- Rollouts watches production health.

### 3.18 Collaboration, teams and sharing
- Shared agent run URLs (repo access is checked), shared transcripts including plans, and shared canvases.
- The team marketplace offers plugins as Default Off, Default On or **Required**. Team rules, commands and hooks are also shared.
- Slack, Teams, Jira and Linear hand-offs. Origin repos are shared with your team.
- There is **no real-time co-editing** of the same file by several humans (not documented; **(unverified)**).

### 3.19 Templates and community gallery
- The **Marketplace** carries plugins, skills, MCPs, automation templates and a leaderboard (https://cursor.com/marketplace), plus community rules and MCPs on cursor.directory.
- There is **no app-template or remix gallery**.

### 3.20 Mobile
- **Cursor for iOS** (public beta, Jun 29, 2026):
  - Start cloud agents with voice.
  - **Remote Control** of agents on your desktop, with a "keep computer awake" option.
  - **Live Activities** on the lock screen and push notifications ("finished / needs input / ready for review").
  - Review diffs and artifacts, and **merge PRs**.
  - Source: https://cursor.com/blog/ios-mobile-app
- **iPad** (Jul 29): an inbox layout with Apple Pencil markup.
- **Android:** use the web app installed as a PWA.
- Cursor does **not** build mobile apps for you; it has no Expo-style preview.

### 3.21 Enterprise
- Pooled usage, invoice/PO billing, SCIM, and access controls for repos, models and MCP.
- Controls for auto-run, browser and network, plus audit logs and service accounts.
- An option to disable "Made with Cursor" attribution.
- Organizations and Groups, and self-hosted agent machines.
- Sources: https://cursor.com/pricing ; changelog.

---

## 4. UI layout (concrete)

> I did not log in. The layout below comes from docs, changelogs and tutorials. Items marked (inferred) are my reconstruction.

### 4.1 Agents Window (the default agent surface since Cursor 3, Apr 2026)
- **Left sidebar:**
  - **Every agent**, wherever it runs or started: local, worktree, cloud, SSH, mobile, web, Slack, GitHub, Linear.
  - Pinned chats at the top.
  - A **top-left workspace/repo pane** for opening several repos in one window.
  - Since Sep 2026, a **Projects** entry in the left navigation.
  - Source: https://www.learncursor.dev/learn/cursor-agents/agents-window ; https://www.eesel.ai/blog/cursor-projects-review
- **Centre:** the conversation, with the prompt box at the bottom (inferred from chat convention). A new agent starts from a centred prompt.
  - **Agent Tabs** show several chats side-by-side or in a grid.
  - **Full-screen mode** maximises the right panel and turns the chat into a **floating prompt bar** (3.4).
- **Right panel (tabbed):**
  - File browser
  - Sandbox terminal (one per agent)
  - Cursor Browser (with Design Mode)
  - **Review** (diffs)
  - Canvases
  - Source control and PR (Reviews / Commits / Changes)
- **Top right:** the current branch, a **commit-and-push** button with a branch-creation arrow, and an arrow to switch to the Editor window.
- **Prompt row controls:** mode, model (Auto plus optimisation setting), environment (Local/Worktree/Cloud/SSH), repo picker, attachments, and the context ring (placement in the row is inferred; that each control exists is confirmed).

### 4.2 Classic editor (VS Code fork)
- **Layout:**
  - Activity bar and file explorer on the left.
  - Editor tabs in the centre, with Tab ghost text and Cmd+K inline prompts.
  - **Agent chat pane** on the right.
  - Terminal and problems at the bottom.
- **Cursor 2.0 confusion:** 2.0 added an "Agent / Editor" layout switch at top left. The **Agent** layout moves the agents sidebar to the left; **Editor** puts it back on the right. Users complained about the naming ("Agents, Search Agents, New Agent, Agent, New Agent") and about the switch itself.
  - Sources: https://forum.cursor.com/t/cursor-2-0-ui-is-absurd-agents-search-agents-new-agent-agent-new-agent/139840 ; https://forum.cursor.com/t/cursor-2-0-is-there-way-to-hide-or-move-the-agent-editor-switch-on-the-top-left/140035
- **Review controls** sit at the top of the editor near the breadcrumbs (§3.6).

### 4.3 Web (cursor.com/agents), dashboard, Codebase and Automations
- **cursor.com/agents** runs the same backend as desktop and iOS, and installs as a PWA. Confirmed controls:
  - a repo and branch picker;
  - a **worker picker**: Cloud machine, Team Pool, or one of My Machines;
  - image attachments, follow-ups, and parallel runs to compare;
  - review of diffs and PRs, and PR creation.
  - Source: https://www.buildfastwithai.com/blogs/cursor-remote-agents-any-device-2026 ; https://cursor.com/docs/cloud-agent
  - The editor, terminal, file browser and environment/MCP configuration live on the web or dashboard rather than on iOS (https://cursor.com/docs/cloud-agent/web-and-mobile).
  - The exact arrangement (agent list on the left, run page with conversation and diff) is **(inferred)**.
- **Dashboard (cursor.com/dashboard)** holds usage and spending, integrations (GitHub, Slack, Linear and others), cloud-agent environments and secrets, Bugbot and Automations settings, and team admin. Exact navigation: **(unverified)**.
- Also: **cursor.com/codebase** (Origin repos) and **cursor.com/automations**.

### 4.4 Settings
- **Cursor Settings** is separate from VS Code settings.
  - Sections include General (Account, Privacy) and **Agents > Approvals & Execution** (run mode).
  - **Customize** (3.9) manages plugins, skills, MCPs, subagents, rules, commands and hooks.
- Config files live in the project: `.cursor/rules`, `mcp.json`, `hooks.json`, `permissions.json`, `sandbox.json`, `environment.json` and `BUGBOT.md`. This makes behaviour **reviewable in git**, a strong pattern.

### 4.5 Visual design language (inferred)
- Dense, dark-first IDE styling inherited from VS Code. Small type, monospace code, compact chips and pills.
- Plenty of **keyboard shortcuts**: ⌘L, ⌘K, ⇧Tab, ⌘⇧D and others.
- The marketing site is minimal, largely black and white.
- Forum users complain the Agents Window **can't use VS Code themes** (https://forum.cursor.com/t/cursor-3-agents-window/156509).

---

## 5. Step-by-step user flows

### 5.1 Sign up → first agent → PR (developer on an existing repo)
1. **Download** Cursor, then the first-launch wizard, then **Import VS Code settings** (or start fresh), then **sign in** in the browser, then choose **Privacy Mode** (Settings > Privacy).
2. **Open a folder or clone a repo.** Cursor indexes it (the indexing UI is **(unverified)**).
3. **Open the Agents Window** (*Cmd+Shift+P → Open Agents Window*, or the button at top right) and pin it.
4. In the prompt box, pick the **mode**, **model** and **environment**. Type the task; @-mention files, `@Branch` and so on as needed.
5. **Plan Mode:** the agent researches, then shows **clarifying questions as an interactive form**, then writes a **plan document** with Mermaid diagrams and a to-do list. You edit it, then click **Build**, or send to-dos to parallel agents.
6. **While it builds, the user sees:**
   - streaming tool calls (reads, greps, terminal) at Compact, Balanced or Detailed density;
   - to-dos ticking off;
   - **live diffs** in the Review pane;
   - the sandbox terminal output;
   - the browser opening to verify.
   Terminal commands follow the **run mode**: Auto-review can pause for approval. You can **Stop** or steer without stopping (Aug 2026).
7. **Review:** open **Review** and Keep or Undo per file or hunk, or click **Review → Find Issues** for an AI pass, or run `/review` (local Bugbot). **Restore Checkpoint** if the agent went wrong.
8. **Commit and push** at top right, then open a PR. **Bugbot** reviews in about 90 seconds and posts inline comments with **Fix in Cursor / Fix in Web**. Autofix can push fixes to a new branch.
9. **Merge**, in Cursor's PR tab, on GitHub or Origin, or **from your phone**. Rollouts then monitors the deploy.

### 5.2 Prompt-to-app with no repo (Aug 27, 2026)
1. In the repo picker, choose **Start from scratch** and enter a prompt.
2. A cloud agent builds the app while Cursor creates an Origin repo in the background.
3. The **live environment is port-forwarded** to your browser. Iterate with chat or **Design Mode**.
4. Click **Create repo** and set a name and visibility (private or internal).
5. **Connect Vercel** and click **Publish** to get a live URL. The custom domain is set up in Vercel.
- **Missing compared with builders:** no managed database or auth, no templates, no credit meter per step. The Vercel account is a prerequisite (https://cellcog.ai/blog/cursor-start-from-scratch/).

### 5.3 Fixing errors
- Paste the error or `@Terminals`, then Agent. For hard bugs, **switch to Debug Mode** (Shift+Tab):
  1. The agent forms hypotheses and instruments the code.
  2. It **asks you to reproduce** the bug.
  3. It reads the logs, fixes, and removes the instrumentation.
- For CI or PR issues, Bugbot Autofix, or Projects/Automations subscribed to your PRs.

### 5.4 Adding a database or auth
- There is no built-in flow. Install a plugin or MCP (Supabase, AWS or Stripe via the Marketplace or cursor.directory), then prompt the agent to wire it up. Secrets go in `.env` locally or in the dashboard Secrets tab for cloud agents.

### 5.5 Connecting GitHub
- Dashboard → Integrations → install the GitHub app (or GitLab, Bitbucket, Azure DevOps). Then enable Bugbot per repo under **Automations**. Or skip GitHub and use Origin.

### 5.6 Cloud and mobile hand-off
- From desktop, choose **Cloud** in the environment dropdown, or use `/in-cloud`. In the CLI, prefix a message with `&`.
- Follow the run on iOS: a Live Activity shows progress and a push arrives at "ready for review". Review the diff on the phone and merge.
- Or **pull the cloud agent back to local** for last-mile edits (The Decoder: "drag sessions between environments").

### 5.7 Slack flow
- Type `@cursor fix the login bug in backend-api` in a thread.
  1. The bot reads the thread and picks the repo and model.
  2. It **posts a plan**, then status updates, then a PR link and **Open in Cursor**.

### 5.8 Agent-building flow (for developers)
- **Option A:** prompt the agent to write an agent in any framework. It is ordinary code, with no special UI.
- **Option B:** use the **Cursor SDK** (`@cursor/sdk`) to build agents on Cursor's harness.
- **Option C:** create an **Automation** with `/automate`: describe the job, and Cursor sets the trigger, instructions, repos and tools.
- **Option D:** **Grok Bot**: create a bot conversationally and grant access as it asks.

### 5.9 Collaboration flow
- Share an agent run or transcript URL; teammates' repo access is checked. Assign Jira or Linear tickets to Cursor. Team admins publish **Required** plugins and rules through the team marketplace. Reviewers use Bugbot and Graphite stacks.

---

## 6. UX strengths and pain points

### Strengths (what users love)
- **Tab**: many users stay "because of the unlimited tab completion" (forum thread on the Auto change). It still has the best next-edit prediction.
- **Real review ergonomics**: live diffs, Keep/Undo per hunk, checkpoints, an AI "Find Issues" pass, and Bugbot with one-click fixes.
- **Context transparency**: the context ring and its breakdown tray, rules scoped with globs, AGENTS.md, and @-mentions.
- **Permission design** that trades safety against flow: Auto-review sandboxes most commands and only asks when needed. It replaced the approval fatigue of "Ask Every Time".
- **Parallelism with isolation**: worktrees, best-of-n with judging, cloud subagents.
- **Presence everywhere**: start in Slack, watch on your phone, finish in the IDE.
- **Speed**: Composer 2.5 is cheap and fast, and Bugbot takes about 90 seconds.
- **Configuration as code**: everything lives under `.cursor/` in git.

### Pain points (with evidence)
1. **Pricing churn and opaque metering (the biggest theme):**
   - **Jun 16, 2025:** 500 requests became $20 of usage. Users ran out "after just a few prompts". The CEO apologised and refunded Jun 16–Jul 4 charges (https://techcrunch.com/2025/07/07/cursor-apologizes-for-unclear-pricing-changes-that-upset-users/ ; https://cursor.com/blog/june-2025-pricing).
   - **Sep 2025:** Auto stopped being unlimited ($1.25/$6 per M tokens). Users reported, for example, "$110 usage against a $60 plan with 11 days remaining" (https://forum.cursor.com/t/cursor-auto-is-no-longer-unlimited/148185).
   - **Aug 24, 2026:** the flat Auto rate was retired. Auto now bills at the routed model's price, from two pools (Cursor models and other models) **whose dollar sizes were not published**, so users "reverse-engineer[ed] their limits from dashboards" (https://cellcog.ai/blog/cursor-auto-pricing/).
   - **Aug 2026:** the dollar-cost graph was removed from the usage page and the CSV export (HN 49135257, 337 points). Staff said the CSV issue was a bug.
2. **Vendor and model risk:**
   - The SpaceX acquisition (Aug 14, 2026), then OpenAI cutting access from Nov 12, 2026, raised trust, privacy and lock-in worries (HN 49486172, 852 points).
   - Composer 2 was **based on Kimi K2.5, which only came out after users found it** (Mar 2026; Wikipedia).
3. **The agent-first redesign alienated some IDE purists.** The top HN comment on Cursor 3: "I wish they'd keep the old philosophy of letting the developer drive and the agent assist." Also: "This view makes you lose any connection to your code" (https://www.infoq.com/news/2026/04/cursor-3-agent-first-interface/). On the forum: no theming, no file-explorer integration, hard-to-find toggles, WSL unsupported (https://forum.cursor.com/t/cursor-3-agents-window/156509).
4. **Review UI regressions.** Per-hunk Keep/Undo controls go missing, leaving only "Undo All". Controls move around, and review state does not survive a branch switch (forum bug threads cited in §3.6).
5. **Data loss.** A reported code-reversion bug class was traced (per a secondary source) to the Agent Review tab, Cloud Sync races and Format-on-Save (https://vibecoding.app/blog/cursor-problems-2026). Treat the root-cause details as **(unverified)**.
6. **Performance.** Reports of 20+ GB RAM across helper processes, frozen chats and agent loops that recreate the same files (https://forum.cursor.com/t/cursor-consuming-22-gb-ram-across-dozens-of-helper-processes-ide-becomes-extremely-slow/158844 ; https://forum.cursor.com/t/serious-issues-with-cursor-crashes-loops-lost-context-and-slow-pool-problems/84290).
7. **Security posture.**
   - A Windows 0day where a malicious `git.exe` in the repo root runs on open. Workspace trust is **off by default**, and the reporter says Cursor went quiet for six months (HN 48910676).
   - A Dec 2025 supply-chain research post named Cursor among its targets (HN 46317098; details not reviewed).
   - Docs concede that the allowlist is not a security boundary.
8. **Trust in automated claims.**
   - The "agents built a browser" demo "implied success without evidence" (HN 46646777).
   - The Apr 2025 AI support bot "Sam" **invented a login policy**, which caused cancellations (HN 43683012, 1,511 points).
9. **Still not for non-coders.** There is no managed backend, templates or guided onboarding. Deploying needs Vercel.
10. **Cost multiplication from parallelism.** Projects use about 5× the tokens of a single agent (eesel). One HN user cut spending from "$2k a week" on Cursor to about 1/10th on Claude Code Max.

---

## 7. Recent notable launches (2025–2026, newest first)
- **Sep 23, 2026:** **Rollouts** (a deploy-health bot) and an expanded **Security Review** bot.
- **Sep 10, 2026:** **Projects** (beta): a coordinator agent with thousands of subagents, shared context files and subscriptions.
- **Sep 2, 2026:** **Self-hosted machines** (My Machines, team pools) and computer use.
- **Aug 27, 2026:** **Start from scratch** (no repo; Origin; live preview; Vercel publish).
- **Aug 24, 2026:** Auto re-priced per routed model, with two usage pools.
- **Aug 19, 2026:** Subscriptions, Custom Modes, subagent VMs, `/goal`, non-blocking steering.
- **Aug 17, 2026:** **Origin** code hosting (early beta).
- **Aug 14, 2026:** SpaceX acquisition closes. **Aug 28:** OpenAI announces it will pull its models on Nov 12.
- **Aug 11–13, 2026:** **Grok Bot**, **Grok 4.6**, cloud agent **Builds** (pre-warmed; about 10× faster boot).
- **Aug 3, 2026:** Google Workspace plugins.
- **Jul 28–29, 2026:** **Cursor Start** (India, ₹649, UPI) and the iPad app.
- **Jul 22, 2026:** **Cursor Router** powers Auto (Intelligence / Balance / Cost).
- **Jul 10–17, 2026:** 3.11 Side Chats and transcript search; Slack posts a plan first and works across multiple repos.
- **Jun 29–30, 2026:** 3.9 **iOS app** (Remote Control, Live Activities); 3.10 team MCP marketplaces.
- **Jun 22, 2026:** 3.9 **Customize** page. **Jun 17–18:** 3.7 cloud environment setup, `/in-cloud`; 3.8 `/automate`, GitHub and Slack triggers.
- **Jun 10, 2026:** Bugbot is 3× faster, 22% cheaper and finds 10% more bugs. **Jun 2026:** Teams Standard/Premium seats with two pools.
- **May 29, 2026:** 3.6 **Auto-review** run mode becomes the default. **May 22:** 3.5 deprecates "Ask Every Time".
- **May 18, 2026:** **Composer 2.5**. **May 19:** Jira. **May 11:** Microsoft Teams; Bugbot effort levels.
- **May 13, 2026:** 3.4 full-screen tabs, compact chats, Dockerfile cloud environments with rollback.
- **May 6–7, 2026:** 3.3 context usage breakdown; PR review tabs; Build in Parallel; Split PRs.
- **Apr 29–30, 2026:** **Cursor SDK**; Security Review beta.
- **Apr 24, 2026:** 3.2 `/multitask`, worktrees, multi-root workspaces. **Apr 15:** 3.1 **Canvases**.
- **Apr 2, 2026:** **Cursor 3 / Agents Window**, Design Mode, `/best-of-n`.
- **Mar 19, 2026:** Composer 2. **Feb–Mar 2026:** Automations.
- **Feb 17, 2026:** 2.5 Plugins and Marketplace, async subagents. **Jan 22:** 2.4 Subagents, Skills, image generation. **Jan 16:** CLI Plan/Ask modes and cloud hand-off with `&`.
- **Dec 10, 2025:** 2.2 Debug Mode and visual editor. **Nov 21:** 2.1 interactive plan questions, in-editor AI review. **Oct 29:** 2.0 Composer and multi-agent. **Aug 7:** CLI. **Jul 2025:** Bugbot GA. **Jun 30, 2025:** web app for agents. **Jun 4, 2025:** Cursor 1.0.

---

## 8. Pricing and credits (as of Sep 26, 2026)

| Plan | Price | Notes |
|---|---|---|
| Hobby | Free | Limited agent requests; Composer access; no card required |
| **Start** (India only) | ₹649/mo incl. tax | Cursor models only (Grok 4.5/4.6, Composer 2.5); cloud agents; iOS; plugins, MCP, hooks, skills (https://cursor.com/blog/cursor-start-india) |
| Pro / "Individual" | $20/mo | Frontier models, "Generous limits for Grok", cloud agents, Bugbot on usage-based billing, Grok Bot. The pricing page (fetched Sep 26, 2026) shows one **"Individual"** card with a **Pro / Pro+ / Ultra** toggle (https://cursor.com/pricing) |
| Pro+ | $60/mo | Price from secondary sources (https://www.lowcode.agency/blog/cursor-ai-pricing). Sold as a tier of the Individual card |
| Ultra | $200/mo | Per CellCog, dashboards showed **$3,000** of Cursor-model usage and **$500** of third-party usage after Aug 24 (the $500 was raised from $2,000 the same day) |
| Teams Standard | $40/user/mo ($32 annual) | Two pools (Cursor models and third-party); SSO; privacy mode; analytics |
| Teams Premium | $120/user/mo ($96 annual) | 5× the Standard usage (Jun 2026; https://www.startuphub.ai/ai-news/technology/2026/cursor-teams-upgrades-pricing-for-predictability) |
| Enterprise | Custom | Pooled usage, SCIM, access controls, audit logs |

- **Metering:**
  - Usage is billed at API rates for the model used. Auto bills at the routed model's rate (Aug 24, 2026).
  - Cloud agents bill at API pricing, and you set a spend limit on first use.
  - Bugbot and Security Review bill per review on usage-based billing.
  - Grok Bot has **its own usage**, separate from Cursor plans.
- **Lesson:** every change was announced without concrete numbers, and every one caused a backlash. Transparency about pricing *is* UX.

---

## 9. Comparison: Windsurf → Devin Desktop, and other AI IDEs

### 9.1 Windsurf (Codeium → Cognition → **Devin Desktop**)
- **Corporate history:**
  - **Apr 4, 2025:** Codeium renamed itself Windsurf.
  - **Jul 11, 2025:** OpenAI's reported ~$3B deal lapsed. Google DeepMind hired key staff in a reported $2.4B license and hire deal.
  - **Jul 14, 2025:** **Cognition** acquired the product, brand and about 210 staff.
  - **Jun 2, 2026:** an over-the-air update renamed it **Devin Desktop**.
  - **Jul 1, 2026:** **Cascade reached end of life**, replaced by **Devin Local**, which Cognition says is rewritten in Rust, about 30% more token-efficient, and has subagents and sandboxing.
  - Sources: https://www.digitalapplied.com/blog/windsurf-becomes-devin-desktop-ide-migration-2026 ; https://docs.devin.ai/desktop/devin-desktop-faq
- **Cascade UX (the pattern Architect should learn from)** (https://docs.devin.ai/desktop/cascade/cascade):
  - A side panel opened with ⌘L or the icon at top right. **Code mode** vs **Chat mode**.
  - A **planning agent** keeps an **editable Todo list** that updates automatically.
  - **Tool calls shown inline** (Search, Analyze, Web Search, MCP, terminal), capped at 40 per prompt before you must click continue.
  - **Revert arrows next to each prompt**, plus named checkpoints.
  - Diffs to accept or reject. **Queued messages** while the agent works.
  - A model dropdown **below the input**. @-mentions of earlier conversations.
- **Memories and Rules:** Cascade automatically remembers architecture decisions ("We use the Repository Pattern…"). `.windsurfrules` still works; the new `.devin/` folder takes precedence.
- **Workflows:** slash-command recipes. `// turbo` or `// turbo-all` annotations auto-run their commands.
- **Terminal auto-execution levels:** **Off** (allowlist only), **Auto** (the model judges safety) and **Turbo** (runs everything except the deny list) (https://x.com/windsurf_ai/status/1891981446698656142).
- **Previews** (https://docs.devin.ai/desktop/previews):
  - The agent opens a preview as an **in-IDE tab** or in the system browser.
  - The **"Send element"** button turns a clicked component into an **@-mention** in the prompt, with several allowed per message.
  - **Console errors flow into the prompt as pending context automatically.**
  - These features work best in Chrome, Arc and other Chromium browsers.
- **App Deploys** (beta; https://docs.devin.ai/desktop/cascade/app-deploys):
  - Say "Deploy this project to Netlify" and it deploys to `<name>.windsurf.build` under Cognition's account.
  - A **claim URL** moves the site to your own Netlify account (for domains and build logs).
  - Supports Next.js, React, Vue, Svelte and static sites.
  - Limits: Free is 1 deploy per day; Pro is 5 per day or 5 unclaimed sites.
  - Tracked in `windsurf_deployment.yaml`.
  - **Not available with Devin Local**, and meant for previews rather than production.
- **Codemaps:** AI-generated, interactive Mermaid maps of code structure and data flow for each task (https://www.nxcode.io/resources/news/cognition-windsurf-acquisition-swe-1-5-codemaps-2026).
- **Models:** SWE-1.5 (Cognition claims 13× faster than Sonnet 4.5) and SWE-1.6 (about 950 tok/s on the Cerebras tier).
- **Devin Desktop (Jun 2026):**
  - **Agent Command Center** is now the opening screen: a **Kanban board** of every local and cloud agent session sorted by **in progress / blocked / ready for review**.
  - **Spaces** group sessions, PRs, files and context so several agents share it.
  - **ACP** support runs Codex, Claude Agent, Gemini CLI, OpenCode and custom agents in the same workspace (https://cognition.com/blog/introducing-devin-desktop).
- **Pricing (Mar 19, 2026):**
  - Credits replaced by **daily and weekly quotas**.
  - Free / Pro $20 (up from $15) / Teams $40 / **Max $200**. Pro gets roughly 7–190 messages a day depending on the model.
  - Overage is billed at API rates (https://devin.ai/blog/windsurf-pricing-plans).
  - Backlash: "33% price hike", and unused quota evaporates, which hurts bursty developers (https://www.verdent.ai/guides/windsurf-pricing-2026).
- **Reactions to Devin Desktop:**
  - "Opening to a Kanban board instead of a code editor is a bold choice", when daily work is "90% editing".
  - A four-week window to deprecate Cascade left teams with custom tooling "scrambling".
  - Praise for an **agent-neutral** layer through ACP.
  - Source: https://www.danilchenko.dev/posts/devin-desktop-review/ (via search summary)

### 9.2 Kiro (AWS): spec-driven development
- **Timeline:** preview Jul 2025; **GA Nov 17, 2025**; CLI Nov 2025; the **Kiro autonomous agent** (a "frontier agent" that takes GitHub Issues and opens PRs) is in preview on Kiro Web.
  - Sources: https://kiro.dev/blog/introducing-kiro/ ; https://kiro.dev/blog/introducing-kiro-autonomous-agent/
- **Spec flow** (https://kiro.dev/docs/specs/):
  1. `requirements.md`: user stories with **EARS** acceptance criteria.
  2. `design.md`: interfaces, schemas and APIs.
  3. `tasks.md`: sequenced tasks with a **Run all Tasks** button. Independent tasks run concurrently.
  - There are **approval gates between phases**. "Quick Spec" skips the gates, and a vibe-chat mode covers small edits.
  - **Property-based tests** are generated from the requirements.
  - Source: https://www.bitdoze.com/kiro-ai-ide/
- **Steering files and hooks:**
  - `.kiro/steering/`: product.md, tech.md, structure.md, with inclusion modes always/auto/fileMatch/manual.
  - **Agent hooks** fire on save, create, delete or task events, and support `confirm` gating.
- **Pricing (credits):** Free 50, Pro $20 (1,000), Pro Max $100, Power $200. Credits are metered to 0.01 and do not roll over.
- **Complaints:** spec overhead on small edits, autocomplete behind Cursor, anxiety about credits.
- **Lesson for Architect:** Kiro's plan is an **artifact** (three reviewable documents) rather than a chat message. That makes it easy for non-technical users to approve and for developers to audit.

### 9.3 Zed
- A Rust-native editor with an **Agent Panel** (https://zed.dev/docs/ai/agent-panel):
  - It lists edited files with line counts. A **multi-buffer review tab** (ctrl-shift-r) lets you **accept or reject each hunk or the whole set**.
  - **Restore Checkpoint** after edits.
  - **Agent Profiles** choose which tools are available. Tool Permissions are allow, deny or confirm.
  - **Follow Agent** (a crosshair icon) makes the editor jump to each file the agent touches.
  - Token usage shows next to the profile selector, with an inspectable "Context Compacted" entry.
- Co-authored the **Agent Client Protocol (ACP)** with JetBrains, which lets Claude Code, Codex and others run inside the editor.

### 9.4 GitHub Copilot (agent mode, coding agent, Agent HQ)
- **In VS Code:**
  - **Agent mode** with in-session planning and **Restore** at checkpoints.
  - An **Agent Sessions view** that runs Claude and Codex agents alongside Copilot, locally or delegated to the cloud (https://code.visualstudio.com/blogs/2026/02/05/multi-agent-development).
- **Copilot coding agent:** assign an issue and it opens a draft PR.
- **Agent HQ / mission control** (Universe, Oct 2025) assigns, steers and tracks tasks across repos from GitHub, VS Code, mobile and the CLI, with agents from Anthropic, OpenAI, Google, Cognition and xAI (https://github.blog/news-insights/company-news/welcome-home-agents/).
- Its advantages: governance and distribution to an installed base.

### 9.5 Others, briefly
- **Google Antigravity:**
  - A VS Code fork with a **Manager View** for parallel agents.
  - **Artifacts**: task lists, implementation plans, screenshots and browser recordings you review "instead of reading raw tool logs".
  - Reviews flag instability from rate limits (https://antigravity.google/docs/artifacts/ ; https://emergent.sh/learn/google-antigravity-review).
- **OpenAI Codex app:**
  - macOS in Feb 2026, Windows in Mar 2026.
  - A project sidebar, threads per **worktree**, a built-in terminal and a **code review panel** (https://www.verdent.ai/guides/codex-app-first-impressions-2026).
- **Claude Code:** terminal-native. HN consensus is that it "wins on terminal-native development and long-session context", while Cursor wins on IDE-native visual editing (https://www.developersdigest.tech/blog/what-hacker-news-gets-right-about-ai-coding-agents-2026).

### 9.6 Summary: UX patterns across developer tools

| Pattern | Cursor | Devin Desktop (Windsurf) | Kiro | Zed | Copilot |
|---|---|---|---|---|---|
| Plan before code | Plan Mode: questions form, editable plan, Mermaid, Build | Planning agent with Todo list | 3 spec docs with approval gates | — | In-session plan |
| Review granularity | Keep/Undo per hunk and file; AI "Find Issues"; PR tabs | Accept/reject diffs; revert per prompt | Per task | Multi-buffer, per hunk | Keep/Undo; Restore |
| Rollback | Checkpoints (files only) | Revert arrows; named snapshots | git | Restore Checkpoint | Restore checkpoint |
| Permissions | Auto-review classifier, sandbox, permissions.json, hooks | Off/Auto/Turbo with allow and deny lists | Hooks with `confirm` | Profiles; allow/deny/confirm | Tool approvals |
| Parallel agents | Worktrees, cloud, best-of-n + judge, Projects | Command Center Kanban, Spaces, ACP | Concurrent tasks | Parallel threads | Agent Sessions, mission control |
| Preview | Browser, Design Mode, visual editor, cloud port-forward | In-IDE preview, "Send element", auto console errors | — | — | — |
| Deploy | Vercel (Aug 2026), Rollouts monitor | Netlify App Deploys (beta; not with Devin Local) | — | — | Via GitHub Actions |
| Pricing model | $ usage pools at API rates | Daily and weekly quotas | Credits | BYO or plan | Seats + premium requests **(unverified detail)** |

---

## 10. Ideas for Architect 2.0

**Review, approve and undo**
- **ADOPT:** A dedicated **Review tab** beside Preview, showing changed files with line counts, a unified diff, and **Keep/Undo per hunk, per file and all**. Keep the controls in **one fixed place**. Cursor's controls moving around generated a string of bug reports.
- **ADOPT:** **Checkpoints per prompt** with **preview before restore** (Cursor, Zed). Also put a revert arrow on every chat message (Windsurf) so a non-technical user can undo with one click. Cursor restores files only; Architect should restore files, the DB schema and environment variables together.
- **IMPROVE:** Default to **auto-apply with an easy undo** in *Simple* mode (non-technical users), and to **stage-then-approve** in *Pro* mode. One toggle in the prompt bar.
- **ADOPT:** An **AI "Find Issues" pass** before publish, and a Bugbot-style **PR reviewer** with **Fix** buttons for GitHub-connected projects.

**Planning and transparency**
- **ADOPT:** **Plan mode as a form, not a wall of text.** Show clarifying questions as interactive chips or radios (Cursor 2.1), then an **editable plan** with a to-do list and an architecture diagram (Mermaid), then a **Build** button. Let users send individual to-dos to parallel agents.
- **IMPROVE:** Borrow Kiro's **spec artifacts**, but make them lighter: "What we'll build" (user stories), "How" (data model, pages, APIs, agents) and "Steps". Each should be a collapsible card that non-technical users can approve in one click and developers can open as `requirements.md` / `design.md` / `tasks.md` in the repo.
- **ADOPT:** A **tool-call density switch** (Compact / Balanced / Detailed). Non-technical users see "Designing your database…"; developers see the actual grep, edit and terminal calls.
- **ADOPT:** A **context meter** (Cursor's context ring with a breakdown tray) so developers can see what the agent "knows": rules, files, MCP, memory.
- **AVOID:** Claims of "done" or "verified" without evidence (Cursor's browser demo; tests disabled to pass). Require **proof artifacts**: test results, a screenshot or video of the working flow, build status. Show them on the completion card (Cursor cloud-agent videos, Antigravity Artifacts).

**Permissions and safety**
- **ADOPT:** **Three run modes** with plain-language names: *Ask me for risky stuff* (default; a sandbox plus an LLM classifier, like Cursor's Auto-review), *Only approved commands* (allowlist), and *Full autopilot*. Put it in project settings and show it as a badge in the prompt bar.
- **ADOPT:** **Hardcoded guardrails that always ask**, whatever the mode: deleting files or data, dropping or migrating a production DB, changing secrets, publishing to production, sending emails or SMS from the app (Cursor: rm, browser, writes outside the workspace).
- **ADOPT:** **Policy as a file in the repo** (`.architect/permissions.json`, `rules/`, `AGENTS.md` support) so developers can review agent behaviour in git. Support **AGENTS.md and .cursor/rules on import**, so Cursor users bring their rules with them.
- **ADOPT:** **Workspace trust on import.** When importing a GitHub repo, don't run install scripts or binaries until the user confirms (the Cursor Windows `git.exe` 0day).

**Parallel agents and delegation**
- **IMPROVE:** An **agent inbox / Kanban** (Devin Command Center: in progress / blocked / ready for review) but **not as the landing screen for everyone**. It should be a "Tasks" tab inside a project, used as a start page only for Pro users. Critics called Kanban-first "a bold choice" when daily work is 90% editing.
- **ADOPT:** **Background runs with notifications**: "needs input" and "ready for review" push or email; mobile Live Activity-style progress. Let people start a task from Slack and finish it in the builder.
- **ADOPT:** **Best-of-N for UI.** Generate 2–3 design variants in parallel with an AI "judge" recommendation, and let the user pick. It maps directly onto non-technical "show me options" behaviour.
- **AVOID:** Hidden cost multiplication. Parallel or coordinator runs used about 5× the tokens of a single agent (Projects). Show a **cost estimate before launching** parallel agents.

**Preview and visual editing**
- **ADOPT:** **Point-and-prompt in the preview**: click an element and it becomes an @-chip in the prompt (Windsurf "Send element"; Cursor ⌥+click). Multi-select and **queue edits while the agent is still working** (Cursor Design Mode).
- **ADOPT:** **Console and runtime errors flow into the prompt automatically** as a "1 error — Fix?" chip (Windsurf Previews), plus a **Debug mode** that instruments, asks you to reproduce, fixes, then cleans up.
- **IMPROVE:** A visual editor sidebar with design-token-aware colour and spacing controls and React props (Cursor 2.2), with edits written back to code through the agent and shown as a diff in the Review tab.

**Import, GitHub and deploy**
- **ADOPT:** **Two-way GitHub**: import any repo, work on a **branch per task/chat**, commit automatically with semantic messages, open a PR with one click, and **respect branch protection**. Offer "Start from scratch" with an internal repo and **Create repo** later (Cursor Aug 2026). Never make GitHub a prerequisite for non-technical users.
- **IMPROVE:** **Native deploy with a claim or export path** (Windsurf's claim URL). One-click publish to Architect hosting with a custom domain *inside* Architect. Offer "Export to Vercel/Netlify/your cloud" so developers never feel locked in. Cursor still needs a Vercel account.
- **ADOPT:** **Post-deploy health monitoring** (Cursor Rollouts): after publish, watch errors and latency, flag the suspect change, and offer "Roll back to v12".
- **ADOPT:** A **Security scan before publish** (Cursor Security Review): flag exposed secrets, missing auth checks and injection risks in plain language, with a "Fix it" button.

**Agent building (Architect's differentiator vs Cursor)**
- **IMPROVE:** Cursor has no end-user agent builder; it only writes agent code. Architect should offer an **Agents section** in which:
  - both a prompt and code view in any framework (LangGraph, CrewAI, AI SDK, Mastra, OpenAI Agents SDK) describe the same agent;
  - a tool/MCP connector picker and a secrets vault are built in;
  - a **test console** with traces is built in;
  - there are triggers (schedule, webhook, Slack; like Cursor Automations and `/automate`).
- **ADOPT:** **Customize page** (Cursor 3.9): one place for skills, MCP connectors, rules, hooks and plugins, at personal, team and project scope. Add a marketplace with **Required / Default On / Off** distribution for teams.

**Pricing and trust**
- **AVOID:** Cursor's pricing mistakes: unannounced numbers, renaming limits ("rate limits" that were really credit pools), removing cost displays, and "unlimited" that isn't. **Show credits live in the prompt bar**, estimate each task's cost before running, and set soft limits (alerts at 50/80/100%).
- **ADOPT:** **Local pricing and UPI** for India (Cursor Start, ₹649). This matters directly to an Indian-market Architect.
- **AVOID:** **Single-vendor model dependence.** OpenAI cutting off Cursor (Nov 12, 2026) shows the risk. Stay model-agnostic, with routing (Cursor Router's Intelligence / Balance / Cost modes are a good UI), and **disclose which base models you use** (the Kimi K2.5 backlash).
- **AVOID:** AI support agents that invent policy (the Cursor "Sam" incident). Ground support answers in actual docs and hand off to a human.

**Dual-audience IA (first-principles synthesis)**
- **ADOPT:** A single workspace with a **Simple/Pro toggle**:
  - **Simple:** chat on the left; Preview on the right with device toggles; a Publish button at top right; plan cards; friendly progress messages.
  - **Pro:** adds Code, Review/Diff, Terminal, Tasks (parallel agents) and Git tabs, @-mentions, a context meter, a run-mode badge and a model picker.
  - Both modes share the same project, so a founder and their developer can work on one app.

---

## Sources

**Cursor: official**
- https://cursor.com/changelog (and /page/2 through /page/8)
- https://cursor.com/changelog/3-0
- https://cursor.com/changelog/2-1 ; https://cursor.com/changelog/2-2 ; https://cursor.com/changelog/2-4 ; https://cursor.com/changelog/2-5
- https://cursor.com/changelog/router ; https://cursor.com/changelog/start-from-scratch ; https://cursor.com/changelog/bugbot-updates-june-2026
- https://cursor.com/blog/2-0 ; https://cursor.com/blog/composer-2-5 ; https://cursor.com/blog/tab-rl ; https://cursor.com/blog/tab-update
- https://cursor.com/blog/browser-visual-editor ; https://cursor.com/blog/design-mode ; https://cursor.com/blog/canvas ; https://cursor.com/blog/ios-mobile-app
- https://cursor.com/blog/cursor-start-india ; https://cursor.com/blog/june-2025-pricing
- https://cursor.com/pricing ; https://cursor.com/marketplace
- https://cursor.com/docs/agent/agents-window ; https://cursor.com/docs/agent/modes ; https://cursor.com/docs/agent/debug-mode ; https://cursor.com/docs/agent/review ; https://cursor.com/docs/agent/chat/checkpoints
- https://cursor.com/docs/agent/security/run-modes ; https://cursor.com/docs/agent/terminal ; https://cursor.com/docs/agent/browser ; https://cursor.com/docs/agent/hooks
- https://cursor.com/docs/context/rules ; https://cursor.com/docs/context/mcp ; https://cursor.com/docs/context/mentions
- https://cursor.com/docs/cloud-agent ; https://cursor.com/docs/cloud-agent/automations ; https://cursor.com/docs/integrations/slack
- https://cursor.com/docs/bugbot ; https://cursor.com/docs/origin ; https://cursor.com/docs/grok-bot

**Cursor: news and analysis**
- https://www.infoq.com/news/2026/04/cursor-3-agent-first-interface/
- https://the-decoder.com/new-cursor-3-ditches-the-classic-ide-layout-for-an-agent-first-interface-built-around-parallel-ai-fleets/
- https://www.learncursor.dev/learn/cursor-agents/agents-window ; https://www.learncursor.dev/research/whats-new-in-cursor-2026
- https://www.digitalapplied.com/blog/cursor-3-agents-window-complete-guide
- https://artificialanalysis.ai/articles/cursor-composer-2-5-coding-agent-index
- https://en.wikipedia.org/wiki/Cursor_(company)
- https://finance.yahoo.com/technology/ai/articles/spacex-completes-record-60-billion-131311785.html
- https://www.cnbc.com/2026/08/29/openai-cursor-spacex-model-access.html ; https://openai.com/index/our-decision-on-cursor-following-its-acquisition-by-spacex/
- https://siliconangle.com/2026/08/17/cursor-launches-origin-code-hosting-service-to-compete-with-github/
- https://tessl.io/blog/cursor-acquires-graphite-to-bridge-code-creation-and-review/
- https://www.eesel.ai/blog/cursor-projects-review ; https://pondero.ai/news/2026-09-11-cursor-projects/
- https://cellcog.ai/blog/cursor-auto-pricing/ ; https://cellcog.ai/blog/cursor-start-from-scratch/
- https://www.lowcode.agency/blog/cursor-ai-pricing ; https://www.startuphub.ai/ai-news/technology/2026/cursor-teams-upgrades-pricing-for-predictability
- https://analyticsindiamag.com/ai-news/cursor-launches-649-monthly-india-plan-with-upi-payments
- https://techcrunch.com/2025/07/07/cursor-apologizes-for-unclear-pricing-changes-that-upset-users/
- https://daily.dev/blog/setup-cursor-first-time/ ; https://devtoolsreview.com/tutorials/setup-cursor-vscode/
- https://www.buildfastwithai.com/blogs/cursor-remote-agents-any-device-2026
- https://www.g2.com/products/cursor/reviews
- https://vibecoding.app/blog/cursor-problems-2026
- https://www.developersdigest.tech/blog/what-hacker-news-gets-right-about-ai-coding-agents-2026

**Cursor: community**
- https://forum.cursor.com/t/cursor-3-agents-window/156509
- https://forum.cursor.com/t/cursor-auto-is-no-longer-unlimited/148185
- https://forum.cursor.com/t/per-change-keep-undo-buttons-missing-after-agent-edits-only-undo-all-available/158983
- https://forum.cursor.com/t/agent-multi-file-review-controls-appear-in-the-editor-tab-breadcrumb-area-i-want-the-bottom-undo-keep-style-back-or-a-setting-to-choose/155718
- https://forum.cursor.com/t/cursor-2-0-ui-is-absurd-agents-search-agents-new-agent-agent-new-agent/139840
- https://forum.cursor.com/t/cursor-2-0-is-there-way-to-hide-or-move-the-agent-editor-switch-on-the-top-left/140035
- https://forum.cursor.com/t/cursor-consuming-22-gb-ram-across-dozens-of-helper-processes-ide-becomes-extremely-slow/158844
- https://forum.cursor.com/t/serious-issues-with-cursor-crashes-loops-lost-context-and-slow-pool-problems/84290
- Hacker News items (via https://hn.algolia.com/api/v1/items/): 49486172, 49135257, 48910676, 46646777, 43683012, 47618084, 49334209

**Windsurf / Devin Desktop**
- https://cognition.com/blog/introducing-devin-desktop ; https://devin.ai/blog/windsurf-is-now-devin-desktop ; https://docs.devin.ai/desktop/devin-desktop-faq
- https://docs.devin.ai/desktop/cascade/cascade ; https://docs.devin.ai/desktop/previews ; https://docs.devin.ai/desktop/cascade/app-deploys
- https://devin.ai/blog/windsurf-pricing-plans ; https://www.verdent.ai/guides/windsurf-pricing-2026
- https://www.digitalapplied.com/blog/windsurf-becomes-devin-desktop-ide-migration-2026 ; https://www.danilchenko.dev/posts/devin-desktop-review/
- https://www.nxcode.io/resources/news/cognition-windsurf-acquisition-swe-1-5-codemaps-2026 ; https://x.com/windsurf_ai/status/1891981446698656142

**Others**
- Kiro: https://kiro.dev/docs/specs/ ; https://kiro.dev/blog/introducing-kiro/ ; https://kiro.dev/blog/introducing-kiro-autonomous-agent/ ; https://www.bitdoze.com/kiro-ai-ide/
- Zed: https://zed.dev/docs/ai/agent-panel
- GitHub Copilot and VS Code: https://github.blog/news-insights/company-news/welcome-home-agents/ ; https://github.blog/changelog/2025-10-28-a-mission-control-to-assign-steer-and-track-copilot-coding-agent-tasks/ ; https://code.visualstudio.com/blogs/2026/02/05/multi-agent-development
- Google Antigravity: https://antigravity.google/docs/artifacts/ ; https://emergent.sh/learn/google-antigravity-review
- OpenAI Codex app: https://www.verdent.ai/guides/codex-app-first-impressions-2026
