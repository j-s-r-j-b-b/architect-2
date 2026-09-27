# OpenAI Codex and Anthropic Claude Code: Competitive Research for Architect 2.0

- **Researched:** 2026-09-26. The latest Codex changelog entry reviewed is **Codex CLI 0.157.1 (Sep 26, 2026)**. The latest Claude Code entry reviewed is **v2.1.283 (Sep 25, 2026)**.
- **Method:** primary sources first:
  - Codex docs, which moved from developers.openai.com/codex to **learn.chatgpt.com/docs** in 2026 (the old URLs now 308-redirect).
  - The Codex changelog and pricing page.
  - Claude Code docs (**code.claude.com/docs**) and the Claude Code changelog.
  - Anthropic and OpenAI blog and launch posts, and Wikipedia timelines.
  - Secondary sources: Hacker News threads, GitHub issues, The Register, TechCrunch, MacRumors, Fortune, and practitioner blogs and guides (Daniel Vaughan's Codex Knowledge Base, Flavio Copes, Developers Digest, FindSkill, Verdent).
- **Limits of this research:** I did not sign in to either product. Layout details come from the official docs, which for Claude Code describe the UI unusually precisely, and from hands-on reviews. Anything I inferred is marked **(inferred)**. Anything I could not confirm is marked **(unverified)**. Anything that rests only on a third-party blog is marked **(secondary)**.
- **Why these two matter for Architect 2.0:** neither is a prompt-to-app builder. Both are *agentic coding harnesses* that work on a real repo. Together they set the bar that a "developer / pro mode" in a vibe-coding platform will be measured against:
  - delegating a task,
  - running agents in parallel,
  - plan-then-execute,
  - reviewing diffs and PRs,
  - permissions and safety,
  - repo-level memory,
  - running tests and CI,
  - showing agent progress.

---

## TL;DR: what Architect 2.0 should take from these two

1. **The unit of work has moved from "a chat" to "a fleet of sessions".**
   - Both products redesigned their desktop apps in 2026 around a left sidebar of parallel sessions with status, and a right-hand set of panes: diff, terminal, browser/preview, files.
   - Claude Code desktop redesign (Apr 14, 2026): https://claude.com/blog/claude-code-desktop-redesign
   - Codex app (Feb 2, 2026), merged into the ChatGPT desktop app on Jul 9, 2026: https://www.developersdigest.tech/blog/chatgpt-work-codex-desktop-app
2. **Plan, approve, then execute is a first-class control, not a prompt trick.**
   - Claude Code's plan approval dialog offers three choices: **Yes, and use auto mode**, **Yes, manually approve edits**, and **No, keep planning**. `Ctrl+G` opens the plan in an editor (https://code.claude.com/docs/en/permission-modes).
   - Codex has a **Plan** toggle in the composer plus `/plan` (https://flaviocopes.com/codex/).
3. **Autonomy is a single visible dial next to the Send button.**
   - Claude: **Manual / Accept edits / Plan / Auto / Bypass permissions** (https://code.claude.com/docs/en/desktop).
   - Codex: a permission picker with **Default permissions / Full access**, permission profiles, and **auto-review** (https://learn.chatgpt.com/docs/agent-approvals-security.md).
   - The industry moved to classifier-reviewed autonomy by default. Anthropic made Auto the default on Aug 14, 2026, after finding that users approved 97% of prompts reflexively (https://techcrunch.com/2026/08/09/anthropic-is-turning-claude-codes-auto-mode-on-by-default/).
4. **A diff chip becomes a review pane, which becomes a PR, which becomes CI auto-fix, which becomes auto-merge.**
   - Both show a `+42 −18` diff stat. Clicking it opens a review pane with a file list and line-level comments that are *batched into your next message*.
   - Both then offer commit, push and **Create PR**.
   - Claude adds a **CI status bar** with **Auto-fix** and **Auto-merge** toggles.
5. **Repo memory is a markdown file.**
   - `AGENTS.md` (Codex; Claude Code also reads it since v2.1.277, Sep 18, 2026) and `CLAUDE.md`.
   - Both have layered scopes (org, user, repo, subfolder), plus auto-written "memory" notes.
6. **Neither hosts your app.** Neither offers a managed database, end-user auth or deploy. This is the gap Architect 2.0 can own: *Codex/Claude-grade agent workflows plus one-click backend, preview URLs and deploy.*

---

## 1. Positioning: what makes each different

### 1a. OpenAI Codex

**What it is:** OpenAI's software-engineering agent. It runs as:
- a **mode inside the unified ChatGPT desktop app** (macOS and Windows), next to "Chat" and "Work";
- a **cloud agent** at chatgpt.com/codex (web and ChatGPT mobile);
- the open-source **Codex CLI** (Rust TUI);
- an **IDE extension** (VS Code, Cursor, Windsurf, JetBrains, Xcode);
- a **GitHub reviewer** (`@codex review`), plus Slack and Linear integrations;
- the **Codex SDK** (TypeScript and Python) and **app-server**.

Sources: https://learn.chatgpt.com/docs/codex/ide.md, https://learn.chatgpt.com/docs/codex-sdk.md, https://en.wikipedia.org/wiki/OpenAI_Codex_(AI_agent)

**Positioning, as of Sep 2026:**
- **"Command center for agents" rather than an IDE.** The app's mental model is *thread → isolated workspace (worktree or cloud container) → review queue* (https://kingy.ai/news/the-codex-app-super-guide-2026-from-hello-world-to-worktrees-skills-mcp-ci-and-enterprise-governance/).
- **Local, Worktree and Cloud in one dropdown.** Each chat runs in one of three environment modes: **Local** (your checkout), **Worktree** (an isolated git worktree Codex creates), or **Cloud** (a remote container). **Hand off** moves a thread between Local and Worktree (https://learn.chatgpt.com/docs/environments/modes.md, https://codex.danielvaughan.com/2026/04/11/codex-app-worktree-lifecycle-local-environments/).
- **Bundled with ChatGPT.** Since Jul 9, 2026, Codex lives inside the ChatGPT desktop app on every plan, Free included. The old ChatGPT desktop app became "ChatGPT Classic" (https://www.developersdigest.tech/blog/chatgpt-work-codex-desktop-app, https://codex.danielvaughan.com/2026/07/10/chatgpt-work-codex-unification-cli-developer-guide-scheduled-tasks-unified-runtime/).
  - This is a distribution moat: roughly 1M weekly users in Feb 2026, 5M+ by Jun 2, and 7–8M by mid-July (https://thenewstack.io/gpt-5-6-codex-user-surge/ (secondary), https://www.unite.ai/openai-says-codex-and-chatgpt-work-hit-10-million-users/ (secondary)).
- **"Codex for (almost) everything"** (desktop v26.415, Apr 16, 2026). Codex expanded beyond code to:
  - computer use and an in-app browser (built on Atlas);
  - a 90+ plugin marketplace;
  - image generation, persistent memory and thread automations;
  - artifact previews (PDF, sheets, docs) and multiple terminals.

  Sources: https://www.digitalapplied.com/blog/openai-codex-for-almost-everything-release-guide (secondary), https://www.developersdigest.tech/blog/codex-changelog-april-2026
- **Reputation:** strong on **long, unattended backend tasks and code review quality**. Developers on HN and Reddit describe it as catching race conditions and edge cases that Claude misses. A common pattern is "Claude builds, Codex reviews" (https://www.firecrawl.dev/blog/claude-code-vs-codex (secondary), https://www.developersdigest.tech/blog/codex-vs-claude-code-april-2026 (secondary)).

### 1b. Anthropic Claude Code

**What it is:** Anthropic's agentic coding tool. It runs as:
- a terminal **CLI** (the original surface, Feb 24, 2025);
- **VS Code and JetBrains** extensions;
- a **Code tab in the Claude desktop app** (tabs: Chat / Cowork / Code);
- **Claude Code on the web** (claude.ai/code) and the **Code tab in the mobile app**;
- **GitHub Actions** (`@claude`) and a managed **Code Review** service;
- **Slack** (Claude Tag), **Routines** (cloud automations), and the **Claude Agent SDK** (Python and TypeScript).

Sources: https://code.claude.com/docs/en/desktop.md, https://code.claude.com/docs/en/claude-code-on-the-web.md, https://www.scriptbyai.com/claude-code-timeline/ (secondary timeline)

**Positioning:**
- **A composable agent harness** with a deep extension stack:
  - `CLAUDE.md` and rules;
  - output styles and skills;
  - subagents, agent teams and dynamic workflows (scripted fan-out of up to 1,000 agents per run);
  - hooks, MCP, plugins and marketplaces;
  - artifacts.

  Source: https://code.claude.com/docs/en/features-overview.md
- **Same engine everywhere.** Desktop "runs the same underlying engine as the CLI". It reads the same `CLAUDE.md`, MCP config, hooks, skills and settings, so a session can move between terminal, desktop, web and phone:
  - `/desktop` sends a CLI session to Desktop.
  - `--cloud` starts a cloud session from the terminal.
  - `--teleport` pulls a cloud session into the terminal.
  - **Remote Control** steers a local session from the phone.

  Sources: https://code.claude.com/docs/en/desktop.md, https://code.claude.com/docs/en/claude-code-on-the-web.md
- **Orchestration, not editing.** The Apr 2026 desktop redesign is described as "an agent orchestration dashboard rather than traditional IDE replacement". Reviewers noted there is "no code editor anywhere in the main interface" (a spot-edit file pane exists) (https://findskill.ai/blog/claude-code-desktop-redesign-review/ (secondary)).
- **Coordinator-of-agents model (newest).** **Projects** (public beta Sep 17, 2026) is one long conversation in which Claude acts as a coordinator. It splits work into parallel cloud **threads**, each with its own branch and PR, and tracks them in an **Overview** pane (https://code.claude.com/docs/en/claude-projects, https://www.marktechpost.com/2026/09/17/anthropic-launches-claude-code-projects-in-beta-parallel-cloud-sessions-that-keep-running-after-you-close-your-laptop/).
- **Scale:**
  - Run-rate revenue passed $2.5B by Feb 2026, more than double since Jan 1 (quoted by Simon Willison: https://x.com/simonw/status/2022044549733056861).
  - It went viral with **non-programmers** over the 2025–26 holidays, which led Anthropic to spin out **Cowork** for non-coders in Jan 2026 (https://fortune.com/2026/01/24/anthropic-boris-cherny-claude-code-non-coders-software-engineers/).
- **Reputation:** faster in the interactive loop, strong on UI and front-end work and repo-scale refactors, and has the richer extension ecosystem. The recurring complaint is usage limits (see §6) (https://www.firecrawl.dev/blog/claude-code-vs-codex (secondary)).

### 1c. How both differ from prompt-to-app builders (Lovable, v0, Replit, Architect)

| Dimension | Codex / Claude Code | Prompt-to-app builders |
|---|---|---|
| Starting point | An **existing Git repo** or local folder. Both clone or open real code. | A blank prompt, a template or a screenshot. |
| Runtime | Your machine, a git worktree, or a cloud VM/container clone of your repo. | A vendor sandbox tied to vendor hosting. |
| Output | **Branches, commits, PRs**. The human merges. | A live hosted app. |
| Backend, DB, auth | Not provided. Code only; you bring Supabase, Vercel and so on through plugins or MCP. | Usually bundled. |
| Deploy | Not provided. PR → your CI/CD. Codex plugins for Vercel and Netlify (https://flaviocopes.com/codex/). | One-click publish. |
| Preview | Local dev server in an embedded browser (both), with an agent that auto-verifies. | Always-on hosted preview. |
| Primary user | Developers, plus a fast-growing non-dev minority (about 20% of Codex users in Jun 2026, per OpenAI; secondary). | Non-technical users first. |

---

## 2. Who uses them and why (jobs-to-be-done)

### Technical users (the core)

- **"Delegate a well-scoped ticket and come back to a PR."** This is the main job for Codex cloud, Claude cloud sessions and Claude Projects. "Submit a well-defined task, do something else, and review the result" (https://code.claude.com/docs/en/web-quickstart.md). Codex: "watch the task logs or let the task run in the background" (https://learn.chatgpt.com/docs/cloud.md).
- **"Run N things at once without them stepping on each other."** Worktree isolation in both desktop apps:
  - Codex creates a worktree in about 0.8 s at roughly 120 MB each (secondary: https://aitoolsreview.co.uk/insights/openai-codex-app).
  - Claude stores worktrees in `.claude/worktrees/`.
- **"Pair-program interactively in my terminal or IDE."** This is the CLI job, and Claude Code's historical strength.
- **"Review PRs automatically and catch real bugs."**
  - `@codex review` flags only P0/P1 issues.
  - Claude Code Review is multi-agent, averages $15–25 and about 20 minutes per review, and labels findings with severity markers.
- **"Keep CI green."**
  - Claude **Auto-fix** watches a PR and pushes fixes for failing checks and review comments.
  - Codex handles `@codex fix the CI failures`.
- **"Automate recurring engineering chores."** Codex **Scheduled** tasks (formerly Automations); Claude **Routines** (schedule, API or GitHub-event triggers). Examples: nightly triage, dependency reports, docs drift, alert triage opening draft PRs.
- **"Build agents into my product."** The Claude Agent SDK ("Claude Code as a library") and the Codex SDK and app-server (threads, `run()`, streamed events).
- **"Audit or migrate a whole codebase."** Claude dynamic workflows (`ultracode`, `/deep-research`) and Codex `/goal` long-horizon loops.

### Non-technical users (a growing minority)

- **Claude Code:** non-coders used it over the 2025–26 holidays "to book theater tickets, file taxes, and even monitor tomato plants" (Fortune, Jan 24, 2026). Anthropic's answer was **Cowork**, "much easier for non-programmers", built in about 1.5 weeks with Claude Code (https://fortune.com/2026/01/24/anthropic-boris-cherny-claude-code-non-coders-software-engineers/).
- **Codex:** OpenAI said that on Jun 2, 2026, "non-developers — analysts, marketers, operators, designers, researchers, investors, bankers" made up about 20% of Codex users and were growing more than 3x faster than developers (reported by https://techjacksolutions.com/ai-brief/openai-codex-passes-5-million-weekly-users-and-1-in-5-arent/ and a LinkedIn digest; the OpenAI post returned 403 to me, so this is **secondary**).
- **The split:** OpenAI pushes non-developers to **ChatGPT Work** (docs, sheets, slides, web apps) and keeps Codex for "repository-aware implementation, diffs, tests, and pull request review" (https://www.developersdigest.tech/blog/chatgpt-work-codex-desktop-app).
- **Why non-devs still struggle** (inferred from the UX):
  - GitHub is a hard prerequisite for cloud sessions.
  - The permission vocabulary is unfamiliar (sandbox, worktree, branch).
  - Many features are exposed as slash commands and keyboard chords.
  - Neither tool helps with backend or hosting.

---

## 3. Complete feature inventory, by area

Each area gives Codex, then Claude Code. The feature is available on both unless noted.

### 3.1 Onboarding and auth

**Codex:**
- Sign in with a ChatGPT account (Free, Go, Plus, Pro, Business, Enterprise) or an **OpenAI API key**. An API key covers the CLI, SDK and IDE only, with no cloud features (https://learn.chatgpt.com/docs/pricing.md).
- **Desktop first run:** download the ChatGPT app, switch to the Codex mode, sign in, then "add a local folder". The app lists "Git repositories you used recently" (https://flaviocopes.com/codex/).
- **Cloud setup:** connect GitHub (or GitLab), "choose the repositories Codex can access", then create an **environment** in Codex settings (https://learn.chatgpt.com/docs/cloud.md).
- **Remote pairing:** phone-to-desktop pairing via a **QR code** in desktop Settings (https://learn.chatgpt.com/docs/remote.md).
- **Security keys:** Touch ID verification on supported Macs (CLI 0.155.0, Sep 18, 2026) (https://releasebot.io/updates/openai/codex).

**Claude Code:**
- Sign in with a claude.ai account (Pro, Max, Team, Enterprise). API-key, Bedrock, Vertex and Foundry auth also work locally, but cloud, Routines, Artifacts and teleport require a claude.ai login.
- **Web onboarding:**
  1. Sign in at claude.ai/code.
  2. **Sign in with GitHub** (OAuth).
  3. Optionally install the **Claude GitHub App** for private repos and Auto-fix. The **Skip** option exists.
  4. A **Default** cloud environment is created with **Trusted** network access. Team/Enterprise users instead see a **Create your first cloud environment** form with a **Create & finish** button.

  Source: https://code.claude.com/docs/en/web-quickstart.md
- **Terminal shortcut:** `/web-setup` sends your local `gh` token to connect GitHub from the terminal.
- **Desktop SSH:** **+ Add SSH connection**, with Name, SSH Host, Port and Identity File. Desktop installs Claude Code on the remote host automatically (https://code.claude.com/docs/en/desktop.md).

### 3.2 Home and prompt entry

**Codex app:**
- The home screen is "a composer asking what you should work on, with the permission picker, the model picker, and a project selector built into it" (secondary, via search snippet of a beginner's guide).
- The composer lets you "attach a file or image, choose a model and reasoning level" and "select the project, environment, and branch" (https://flaviocopes.com/codex/).
- A toggle *above* the composer selects **Chat** or **Work** in the unified app; Codex is its own mode (https://learn.chatgpt.com/docs/app).
- **Home screen redesigned** Sep 23, 2026 (iOS 1.2026.258, plus desktop per aggregators) (https://learn.chatgpt.com/docs/changelog).
- **Codex web:**
  - Originally had two buttons, **Code** (run a task) and **Ask** (Q&A). OpenAI tried merging them into one button in Sep 2025, then reverted because it "unintentionally negatively affected suggested tasks" (https://community.openai.com/t/ask-button-on-chatgpt-com-codex-web-ui-removed/1359618/42).
  - **Suggested tasks** appear on the web home (per the same thread).
- **Mentions:** `@Browser`, `@Computer` and plugin `@` mentions in the prompt (https://learn.chatgpt.com/docs/browser.md, https://flaviocopes.com/codex/).

**Claude Code desktop and web:**
- **Prompt area controls:**
  - an **environment dropdown** left of the prompt box (Local / Cloud / SSH / WSL);
  - a **project folder selector**, plus a **+** button to add repos in cloud sessions;
  - a **model dropdown** right of Send;
  - a **permission mode selector** next to the model;
  - a **usage ring** next to the model picker;
  - a **Transcript view** dropdown next to Send;
  - a **+** button for attachments, **Slash commands** (skills), **Connectors** and **Plugins**.

  Source: https://code.claude.com/docs/en/desktop.md
- **Context and attachments:** `@`-mention files; drag-drop images and PDFs.
- **Web:** a repository selector *below* the input box with a per-repo branch selector, and a mode dropdown next to the input (https://code.claude.com/docs/en/web-quickstart.md).
- **Deep links:** `claude.ai/code?prompt=…&repositories=owner/repo&environment=…`, useful for "Open in Claude Code" buttons in issue trackers (same source).

### 3.3 Chat and agent interaction

| Capability | Codex | Claude Code |
|---|---|---|
| **Plan mode** | **Plan** in the composer, or `/plan`, or Shift+Tab. It "inspects files without editing and proposes an approach"; you approve or ask for changes (https://flaviocopes.com/codex/). | Shift+Tab or `/plan`. Explores read-only, then shows the approval dialog: **Yes, and use auto mode / Yes, manually approve edits / No, keep planning**. `Ctrl+G` edits the plan (https://code.claude.com/docs/en/permission-modes). **Ultraplan** (browser plan review) was *removed* (https://code.claude.com/docs/en/ultraplan.md). |
| **Ask / Q&A** | Web "Ask" button (above); "read-only inspection" prompts. | Plan mode or plain questions; **side chat** (`Cmd+;` or `/btw`) asks without polluting the main thread. |
| **Autonomy levels** | Sandbox: `read-only`, `workspace-write` (default), `danger-full-access` (`--yolo`). Approval: `on-request` or `never`. UI labels **Default permissions** and **Full access**; `/permissions`; **permission profiles** (Apr 30, 2026) replaced `--full-auto`; **auto-review** ("Guardian") routes approvals to a reviewer agent (https://learn.chatgpt.com/docs/agent-approvals-security.md, https://www.developersdigest.tech/blog/codex-changelog-april-2026). | **Manual** (`default`), **Accept edits**, **Plan**, **Auto** (classifier), **Bypass permissions**, plus `dontAsk` for CI. Auto is the default in the terminal and VS Code from v2.1.283; it was the default for Pro, Max and Team from Aug 14, 2026. Status bar: `⏸ plan mode on`, `⏵⏵ auto mode on`, and so on. |
| **Clarifying questions** | Structured multiple-choice questions (`request_user_input`) **work only in Plan mode**; elsewhere Codex asks in plain text. This is a long-running complaint (GitHub issues #24750, #30150, #12694). | `AskUserQuestion` shows structured choices. A silent change made it **auto-continue after 60 s**, which drew an HN backlash (https://news.ycombinator.com/item?id=48947776). |
| **Goals / long-horizon** | `/goal <objective>` with check, pause, resume and clear, plus token budgets. Shipped in CLI 0.128.0 (Apr 30); GA across app, CLI and IDE in 0.133.0 (May 21, 2026) (https://codex.danielvaughan.com/2026/05/07/codex-cli-goal-command-persisted-long-horizon-workflows-pause-resume-budget/). | `/goal` was also added around May 11, 2026 (secondary: https://www.scriptbyai.com/claude-code-timeline/). `/loop` handles recurring in-session prompts. |
| **Parallel agents** | Subagents are TOML files in `.codex/agents/`, with built-ins `default`, `worker` and `explorer`. "Spawn one agent per point". Web shows a **Subagents** panel with Active/Done lists; app, CLI and IDE show expandable subagent threads (https://learn.chatgpt.com/docs/agent-configuration/subagents.md). **Best-of-N:** cloud tasks accept `--attempts 1–4`, which runs independent attempts that you compare in the dashboard before picking one (https://codex.danielvaughan.com/2026/04/08/codex-cloud-task-application/ (secondary)). | Subagents in `.claude/agents/*.md`, with built-ins **Explore**, **Plan** and general-purpose; background by default. **Agent teams** (experimental). **Dynamic workflows** (JS scripts, up to 16 concurrent and 1,000 agents per run). **Agent view** (`claude agents`). **Projects** coordinator (https://code.claude.com/docs/en/sub-agents.md, /agent-teams, /workflows, /agent-view). |
| **Progress display** | CLI: `Working (48m 52s • esc to interrupt)`, an `update_plan` checklist, live reasoning summaries in status rows (0.155.0). App: a **task sidebar** "surfaces the agent's plan, sources, generated artefacts, and task summary"; desktop notifications when input is needed (https://codex.danielvaughan.com/2026/04/17/codex-app-workspace-pr-review-task-sidebar-artifact-viewer/ (secondary)). | CLI: a spinner line with a whimsical verb, elapsed time, token count and "esc to interrupt" (for example `✳ Infusing… (esc to interrupt · 5s · ↓ 217 tokens · thinking)`), and a fixed todo list above the input ("/todo (1 of 3)"). Desktop: **Normal / Thinking / Verbose** views; **Plan**, **Tasks** and **Subagent** panes; the Tasks pane lists subagents, background shells and workflows. |
| **Steering mid-run** | Queue a message: "Messages to be submitted after next tool call (press esc to interrupt and send immediately)"; `/side` and `/fork`; fork with `f` (0.157.0). | Queue messages (take one back with ✕ on web); `Ctrl+Enter` "send now" (2.1.275); Stop button; `/branch` and fork. |
| **Usage and credits shown** | `/status` shows model, permissions and context; `/usage` dashboard (0.156.0); warnings when "less than half of their allowance remains" (0.153.0); rate-limit banners. | A **usage ring** shows the context window plus plan usage "shared across all Claude Code surfaces"; `/context`; the `/workflows` view shows tokens per agent; a **Large workflow** warning above 25 agents or 1.5M tokens. |
| **Voice** | `/voice` conversations (0.155.0), on by default with F8 (0.156.0). | "Hold space to speak" dictation hint in the CLI footer (secondary). |
| **Models** | GPT-6 Sol and Luna (Sep 22, 2026); GPT-5.6 Sol/Terra/Luna (Jul); GPT-5.5 retires Oct 14, 2026. Reasoning effort up to **max/ultra**. | Opus 5.5 is the default (Sep 22, 2026, 1M context); Sonnet, Haiku and Fable families; effort levels up to `xhigh` and `ultracode`; fast mode. |

### 3.4 Live preview and browser

**Codex:**
- An **in-app browser** opens with `Cmd+Shift+B`, from the toolbar, or by clicking a URL.
- Start a dev server in the integrated terminal, then open local routes.
- **Annotation mode:** click elements or select areas and write comments. **Adjust** gives "granular adjustments to font, spacing, and color values with live preview".
- **`@Browser`** lets the agent click and type, asking permission before new sites and before submissions or purchases.
- **Settings > Browser > Developer mode > "Enable full CDP access"** gives console, network and DOM access.
- It uses a separate browser profile and cannot automate file uploads.
- Sources: https://learn.chatgpt.com/docs/browser.md. Browser verification shipped Apr 23, 2026 (https://www.developersdigest.tech/blog/codex-changelog-april-2026).

**Claude Code desktop:**
- The **Browser pane** auto-starts your dev server after edits and stores its config in `.claude/launch.json` (name, runtimeExecutable, args, port).
- **Auto-verify:** Claude "takes screenshots, inspects DOM, clicks elements, fixes issues". It can be toggled in the server dropdown or with `"autoVerify": false`.
- The **server dropdown** in the session toolbar starts and stops servers and has **Persist sessions** (keeps cookies and localStorage) and **Edit configuration**.
- **Select an element** with `Cmd+Shift+S`.
- Tabs for external sites, with an approval card offering **Allow once / Always allow / Deny**.
- Admin settings can block external navigation.
- The pane also renders HTML, PDF, images and video.
- Source: https://code.claude.com/docs/en/desktop.md
- **Claude in Chrome** (extension) is the alternative when Claude needs your logged-in identity.

**Neither has:**
- device-size toggles (unverified for both; not mentioned in the docs), or
- a hosted shareable preview URL. Claude **Artifacts** are the closest: static single-page previews on claude.ai with versioning, sharing and comments.

### 3.5 Code view, editor, file tree and terminal

**Codex:**
- **Toggleable right-side panels** for "project files, a terminal, the built-in browser, or the Git diff" (https://flaviocopes.com/codex/).
- **Multiple terminal tabs** scoped to the project.
- An **artifact viewer** for PDFs, spreadsheets, docs and slides.
- At launch (Feb 2026) reviewers noted "No Inline Editor" and the need to jump to an IDE. The diff has **Open in VS Code** (https://www.verdent.ai/guides/codex-app-first-impressions-2026).
- **Actions:** toolbar shortcut buttons for tests, dev server and lint, defined per project in `.codex` (secondary: https://codex.danielvaughan.com/2026/04/11/codex-app-worktree-lifecycle-local-environments/).

**Claude Code desktop:**
- A **File editor pane** for spot edits with **Save**, which warns if the file changed on disk.
- A **Terminal pane** (`` Ctrl+` ``); add terminals with **+**.
- **Right-click a path** for **Attach as context**, **Open in** (VS Code, Cursor, Zed), **Show in Finder** and **Copy path**.
- All panes (Diff, Browser, Terminal, File editor, Plan, Tasks, Subagent) can be dragged, resized, or popped out into separate windows.
- Terminal is local-only; the file editor works in local and SSH sessions.

### 3.6 Backend (database, end-user auth, storage, server functions, cron)

- **Neither product provides a managed backend.** They write backend code in your repo, and you connect services via MCP, plugins or connectors.
  - Codex plugins cover Netlify, Vercel and Codex Security (https://flaviocopes.com/codex/).
  - Claude connectors are MCP servers with GUI setup.
- **"Cron" exists for the agent itself, not for your app:** Codex **Scheduled** tasks and Claude **Routines** or Desktop scheduled tasks.
- **Opportunity for Architect:** own the backend layer (DB, auth, storage, functions, cron for the *user's* app) while matching Codex/Claude on agent workflow.

### 3.7 AI inside generated apps and agent building

**Claude Agent SDK** (Python and TypeScript):
- "Claude Code as a library". It exposes built-in tools (read, write, edit, bash, web), hooks, subagents, MCP, permissions, sessions (resume and fork), skills, commands, memory and plugins.
- It is positioned against three alternatives:
  - the Client SDK, where you write the tool loop yourself;
  - **Managed Agents**, a hosted harness on the Claude Platform with Anthropic-managed or self-hosted sandboxes;
  - the CLI in `-p` mode.
- **Branding rule:** partners may not call their product "Claude Code".
- Sources: https://code.claude.com/docs/en/agent-sdk/overview.md. The GitHub Action is built on the SDK.

**Codex SDK:**
- TypeScript and Python. **Threads** are the primitive (`startThread()`, `run()`, resume by ID), with streamed events via the **app-server** (which replaced `codex mcp-server`).
- Sandbox presets per thread or turn (https://learn.chatgpt.com/docs/codex-sdk.md).
- The same app-server powers CLI, VS Code, web, desktop, JetBrains and Xcode (https://en.wikipedia.org/wiki/OpenAI_Codex_(AI_agent)).

**Agent-building UI:**
- Neither has a visual agent builder. Agents are defined as files: `.claude/agents/*.md` with YAML frontmatter (tools, model, permissionMode, memory, isolation), or `.codex/agents/*.toml`.
- Claude has an interactive `/agents` manager in the CLI (https://code.claude.com/docs/en/sub-agents.md).

### 3.8 Integrations, connectors, MCP and secrets

**Codex:**
- MCP servers.
- A **plugin marketplace** (90+ at the Apr 16 launch), with `codex marketplace add`, remote install and plugin-bundled hooks.
- **Skills** (folders with `SKILL.md`) are shared across app, CLI and IDE.
- **Hooks**.
- Slack, Linear and GitHub integrations; event triggers from Gmail, Slack and GitHub for scheduled tasks.
- **Secrets** in cloud environments are "only decrypted for task execution" and are available only to setup scripts. Environment variables persist for the whole task (https://learn.chatgpt.com/docs/environments/cloud-environment.md).

**Claude Code:**
- MCP, with **tool search** on by default so idle tools cost little context.
- **Connectors** are claude.ai MCP integrations (Google Calendar, Slack, GitHub, Linear, Notion and more), managed at Settings → Connectors.
- **Plugins** plus marketplaces (Anthropic official marketplace).
- **Skills** (`/deploy`-style), **hooks** (shell, HTTP, MCP tool, prompt or subagent on lifecycle events), **output styles** and **code intelligence (LSP)** plugins.
- Cloud-environment **API credentials** stay outside the sandbox and are attached by a proxy (Pro and Max).
- A **GitHub proxy** keeps git credentials out of the VM (https://code.claude.com/docs/en/claude-code-on-the-web.md).

### 3.9 GitHub and version control

**Codex:**
- **Review pane** scopes: **Unstaged** (default), **Staged**, **Commit**, **Branch** and **Last turn**.
- Hover a diff line and click **+** to comment.
- Stage, unstage or revert at diff, file or hunk level.
- Commit (Codex can suggest the message), push, create PR.
- **PR context:** reviewer comments inline beside the diff when you're on a PR branch.
- `/review` scopes: against a base branch, uncommitted changes, a commit, or custom instructions.
- Sources: https://learn.chatgpt.com/docs/code-review?surface=app, https://flaviocopes.com/codex/
- **GitHub:**
  - `@codex review` (the bot reacts 👀 and flags **only P0/P1**);
  - an **Automatic reviews** toggle;
  - `@codex fix the P1 issue` or any `@codex …` mention starts a cloud task;
  - `@codex security review`;
  - a "Code Review Rules" section in `AGENTS.md` guides reviews.
  - Source: https://learn.chatgpt.com/docs/third-party/github.md
- **Gap:** there is no commit-graph or branch-tree UI. A Jul 2026 feature request asks for a JetBrains-style Git workspace (https://github.com/openai/codex/issues/30919).

**Claude Code:**
- **Diff viewer:** a file list on the left and changes on the right. Click a line to comment; `Cmd+Enter` submits.
- **Review code** in the diff toolbar's top-right flags compile errors, logic errors, security issues and obvious bugs, and deliberately not style.
- **Web:** **Compare against** any branch; **Create PR** at the top of the diff view, which opens a full PR, a draft, or GitHub's compose page with a generated title and description.
- **CI status bar** with **Auto-fix** and **Auto-merge** (squash) toggles.
- **Auto-archive after PR merge or close**.
- Git worktree per session (`.claude/worktrees/`; branch prefix setting; `.worktreeinclude` for `.env`).
- Sources: https://code.claude.com/docs/en/desktop.md, https://code.claude.com/docs/en/web-quickstart.md
- **Claude Code GitHub Actions:**
  - `/install-github-app` sets up the app, the secret and the workflow PR.
  - `@claude` in issues and PRs "turn[s] issues into pull requests".
  - Automation mode runs on any event or cron.
  - Source: https://code.claude.com/docs/en/github-actions.md
- **Code Review** (Team and Enterprise research preview):
  - multi-agent review with a verification step;
  - severity markers 🔴 Important, 🟡 Nit, 🟣 Pre-existing;
  - per-repo **Review Behavior**: Once after PR creation / After every push / Manual;
  - `@claude review`, `@claude review always`, `@claude review once`;
  - a `REVIEW.md` file;
  - a neutral check run that never blocks merge;
  - an analytics dashboard;
  - $15–25 per review.
  - Source: https://code.claude.com/docs/en/code-review.md
- **Branch safety:** cloud pushes go to `claude/`-prefixed branches. Claude refuses to push to protected branches or branches with others' commits (https://code.claude.com/docs/en/routines.md).

### 3.10 Importing existing projects

- **Both are native to existing code.** Open any local folder (desktop or CLI) or connect a GitHub repo (cloud).
- **Claude:**
  - `claude --cloud` **bundles a local repo without GitHub** (up to 100 MB, with credentials-like files excluded) (https://code.claude.com/docs/en/claude-code-on-the-web.md).
  - Cloud sessions can span **multiple repos** (**+** next to the repository).
  - Projects accept uploaded files, folders and Google Drive folders.
- **Codex:**
  - GitHub or GitLab for cloud.
  - Multiple folders per local project, with a "primary" folder (https://learn.chatgpt.com/docs/projects.md).
  - `/import` in remote and background sessions (0.157.0).
- **Neither imports from Figma, a screenshot or a URL clone** as a flow. Screenshots can be attached as prompt context. Figma is available via MCP or plugin; Figma announced a Codex MCP integration in Feb 2026 (https://en.wikipedia.org/wiki/OpenAI_Codex_(AI_agent)).
- **First-run repo understanding:**
  - `/init` generates `CLAUDE.md` from the codebase (https://code.claude.com/docs/en/memory.md).
  - Codex's docs advise starting with a read-only "explain the project" prompt (https://flaviocopes.com/codex/).

### 3.11 Deploy, hosting, custom domains and environments

- **No first-party hosting in either product.**
- Deploy happens through the PR → CI/CD path, or through plugins (Codex: Vercel and Netlify plugins).
- "Environments" in both products means **the agent's execution environment**, not app staging or prod:
  - **Codex cloud environments:** the `universal` image; automatic setup for npm, yarn, pnpm, pip, pipenv and poetry, or a custom Bash **setup script**; an optional **maintenance script** for cached containers; containers cached up to 12 h; the cache is shared workspace-wide on Business and Enterprise.
  - **Codex internet access:** **Off** by default in the agent phase, or **On** with allowlist presets **None / Common dependencies / All**, plus restricting HTTP methods to GET/HEAD/OPTIONS.
  - Sources: https://learn.chatgpt.com/docs/environments/cloud-environment.md, https://learn.chatgpt.com/docs/cloud/internet-access.md
  - **Claude cloud environments:** network access **None / Trusted** (default allowlist of package registries and cloud APIs) **/ Custom** (with "Also include default list of common package managers") **/ Full**; env vars; a setup script (cached if it finishes in about 5 min); **self-hosted environments** (beta Aug 7, 2026) run on your own infrastructure.
  - Sources: https://code.claude.com/docs/en/routines.md, https://code.claude.com/docs/en/web-quickstart.md
- **Claude Artifacts** publish a single static HTML page to a private claude.ai URL, shareable to your org or publicly. They support versions, comments, live MCP-connector data and file downloads, but **no backend and no multi-route apps** (https://code.claude.com/docs/en/artifacts.md).

### 3.12 Versions, history, checkpoints and rollback

**Claude Code checkpoints:**
- Every prompt that starts a turn creates a checkpoint; the 100 most recent are kept.
- **`/rewind`** or **Esc Esc** opens the menu: **Restore code and conversation / Restore conversation / Restore code / Summarize from here / Summarize up to here / Never mind**.
- **Limits:** Bash-made file changes, most subagent edits and external edits are **not** tracked. "Not a replacement for version control."
- Source: https://code.claude.com/docs/en/checkpointing.md

**Codex:**
- Rollback relies on git: the review pane's revert per hunk or file, worktrees, and **snapshots before deleting managed worktrees** (the default limit is about 15) (https://codex.danielvaughan.com/2026/04/11/codex-app-worktree-lifecycle-local-environments/ (secondary)).
- Fork conversations with `/fork` or `f`.
- A dedicated per-turn checkpoint UI was not found **(unverified)**.

### 3.13 Debugging and automatic error fixing

- **Claude:**
  - **Auto-fix PRs** subscribe to GitHub events and push clear fixes; they *ask* when a reviewer comment is ambiguous.
  - The browser pane's auto-verify.
  - Hooks such as "run ESLint after every file edit".
  - `/debug` skill.
  - Dynamic workflow "keep fixing until tsc passes".
- **Codex:**
  - `@codex fix the CI failures`.
  - Browser verification and CDP console access.
  - `/goal` loops ("tests and verifies each change, and continues iterating until that objective is met").

### 3.14 Testing

- Both discover and run test commands from `AGENTS.md` / `CLAUDE.md` ("find project-specific lint and test commands": https://learn.chatgpt.com/docs/environments/cloud-environment.md).
- Both have integrated terminals.
- Neither has a dedicated test-results UI (unverified). Results appear in the transcript, the terminal and the CI status bar.

### 3.15 Security scanning

- **Codex Security** (launched Mar 10, 2026, a separate application-security agent) and `@codex security review`.
- **Patch the Planet** (Jun 2026) with Trail of Bits for open-source projects.
- A **1Password** security director raised patch-quality concerns in Aug 2026 (Dark Reading via https://en.wikipedia.org/wiki/OpenAI_Codex_(AI_agent)).
- **Claude Code Security** (preview Feb 20, 2026); a `/security-review` command; the Code Review security lens.
- **Auto mode classifier** blocks: exfiltration; `git reset --hard`; merging PRs no human approved; disabling CI; actions driven by hostile content (https://code.claude.com/docs/en/permission-modes).

### 3.16 Analytics, monitoring and logs

- **Codex:** Enterprise analytics dashboard and API, audit logs, Compliance API (https://learn.chatgpt.com/docs/pricing.md); `/usage` analytics in the CLI.
- **Claude:** an analytics dashboard, Code Review analytics (PRs reviewed, weekly cost, auto-resolved comments, per-repo breakdown), OpenTelemetry, a Compliance API, and audit log events for artifacts.

### 3.17 Collaboration, teams and sharing

**Claude:**
- **Share a session:**
  - Team and Enterprise: **Private / Team**, with repo-access verification.
  - Pro and Max: **Private / Public**.
  - Recipients see the latest state, but it does not update in real time.
- Slack sessions are auto-shared to Team.
- **Artifacts:** viewer and editor roles, comments, and **Send to Claude** comment threads.
- **Cross-session messaging** ("tell the payments session the schema changed").
- Source: https://code.claude.com/docs/en/claude-code-on-the-web.md

**Codex:**
- Team workspaces (Business and Enterprise) with shared environment caches.
- Plugins as "where durable team knowledge lives".
- Session-link sharing was not found **(unverified)**.

### 3.18 Templates, community and marketplace

- **Both:** plugin marketplaces and skills, not app templates.
  - Codex ships prebuilt skills (Figma, Linear, deploy platforms, docs).
  - Claude has Anthropic's official marketplace, bundled skills (`/code-review`, `/batch`, `/debug`) and `/deep-research`.
- There is no community gallery of *apps* in either product.

### 3.19 Mobile apps

**Codex:**
- ChatGPT iOS and Android: start tasks on a paired computer, monitor progress, **approve requested actions**, review diffs and send instructions (https://learn.chatgpt.com/docs/remote.md).
- **iPad split view** shows the task list beside the open task (Sep 23, 2026).

**Claude:**
- A **Code** tab in the Claude mobile app for cloud sessions.
- **Remote Control** (`/remote-control`) steers a *local* session from the phone, with subagent and workflow progress synced and photos or files attachable.
- **Dispatch** (Cowork) routes tasks to Code sessions and sends a push notification on completion or when approval is needed.
- Sources: https://code.claude.com/docs/en/remote-control.md, https://code.claude.com/docs/en/desktop.md

### 3.20 Pricing and credits

**Codex** (https://learn.chatgpt.com/docs/pricing.md):

| Plan | Price | Codex includes |
|---|---|---|
| Free / Go | $0 / $8 | GPT-6 Luna at Standard speed in the desktop app (subject to rollout). |
| Plus | $20/mo | Web, CLI, IDE, iOS; cloud integrations (code review, Slack); GPT-6 Sol and Luna; credit top-ups. |
| Pro | $100 (5x) / $200 (20x) | Higher limits. The morphllm.com pricing page says new 20x sign-ups are paused (secondary; unverified). |
| Business | $20/user/mo (2+ users, annual) | SAML SSO, MFA, no training on data, cloud environments. |
| Enterprise / Edu | Custom | SCIM, EKM, RBAC, audit logs, Compliance API, residency, analytics. |

- **Limits** are "local messages per 5-hour window" ranges, for example Plus GPT-6 Sol 15–150 and Pro 20x 300–3,000. Weekly limits also apply, and cloud tasks "may use more allowance".
- **Credits:** token-based rate card (for example GPT-6 Sol at 50 / 5 / 250 credits per 1M input / cached / output tokens). **Fast mode** costs 2.5x.
- **Code Review usage** applies only to GitHub-based reviews.

**Claude Code** (https://claude.com/pricing):

| Plan | Price | Claude Code includes |
|---|---|---|
| Pro | $17/mo annual or $20 monthly | Claude Code; cloud sessions; Routines; Artifacts. |
| Max 5x / Max 20x | $100 / $200 | "5x / 20x more usage than Pro per 5-hour session". (The fetched page text said "Starting at $100" for both tiers; $200 for 20x is widely reported.) |
| Team | Standard seat $20–25; Premium seat $100–125 | Admin controls; Code Review add-on. |
| Enterprise | $20/seat + usage at API rates | SCIM, audit logs, Compliance API. |

- **Code Review** is billed separately through usage credits, at $15–25 per review.
- **Rate limits:** cloud sessions share rate limits with all Claude usage, and there is no separate VM charge.
- **Limit history:**
  - Weekly limits introduced Aug 28, 2025.
  - 5-hour limits doubled May 6, 2026.
  - A +50% weekly boost ran May 13 to Sep 13, 2026, then was replaced by a permanent +25%, a net cut of about 17% versus summer (https://bigguyonstuff.com/claude-code-usage-limits-production/ (secondary)).

### 3.21 Enterprise features

**Codex:**
- SSO, SCIM, EKM, RBAC, audit and Compliance API, data residency.
- An **admin rollout guide** (https://developers.openai.com/codex/enterprise/admin-setup).
- Plugin policy controls (Mar 2026).
- Available on Amazon Bedrock (Sep 2026).

**Claude:**
- Managed settings: `permissions.deny`, forced sandbox, `availableModels` allowlists, `sshConfigs` and `sshHostAllowlist`, `disableWorkflows`, and admin toggles for Routines, Artifacts and Code Review.
- Bedrock, Vertex and Foundry support.
- ZDR orgs lose cloud features.
- GitHub Enterprise Server support.
- Self-hosted environments.

---

## 4. UI layout: main screens, concretely

> Claude Code's docs describe positions explicitly. Codex's docs are mostly functional, so some Codex layout details below come from guides and are marked accordingly.

### 4.1 Codex: ChatGPT desktop app, Codex mode

- **Top of window:** a mode switch between **Chat / Work / Codex**; you can set Codex as the default opening view. A toggle "above the composer" selects Chat or Work (https://learn.chatgpt.com/docs/app, https://www.developersdigest.tech/blog/chatgpt-work-codex-desktop-app).
- **Left sidebar:**
  - a unified **Projects** view that combines ChatGPT projects and local folder projects;
  - chats nested under projects;
  - **Pinned** items near the top, plus search;
  - **Plugins**, **Scheduled** (an inbox with unread dots) and Settings.
  - One guide lists "New chat, Search (⌘G), Plugins, Automations, your Pinned items, Projects, and Chats" (secondary).
  - Threads show whether they are local, cloud or worktree runs (https://getpushtoprod.substack.com/p/complete-beginners-guide-to-openais (secondary)).
  - **Known weakness:** projects and threads "have nearly the same visual weight" (GitHub issue #29161, Jun 20, 2026).
- **Centre:** the thread transcript. The **composer** sits at the bottom (inferred from the chat-app convention and the docs' "above the composer" wording). The composer holds:
  - attach;
  - model and reasoning level;
  - the permissions picker;
  - the **Plan** toggle;
  - project, environment (**Local / Worktree / Cloud**) and branch selectors.
- **Right side:**
  - toggleable panels: **Files**, **Terminal** (multiple tabs), **Browser** and the **Git diff / review pane**;
  - a **task sidebar** listing plan, sources, artifacts and summary;
  - an artifact viewer.
  - The review pane toggles with `Cmd+Option+B` (secondary). It shows green and red line counters, split or unified diff, and **stage / revert / commit / push / open a pull request** (https://flaviocopes.com/codex/).
- **Toolbar:** project **Actions** buttons for tests, dev server and so on (secondary); an **Open in** IDE control (inferred from "Open in VS Code").
- **Settings:** General (baseline permissions), **Appearance** (Light/Dark with separate accent, background and ink colours; presets such as Catppuccin, Monokai and Solarized), **Browser > Developer mode**, **Plugins**, **Archived chats** and remote-device pairing (https://codex.danielvaughan.com/2026/03/30/codex-app-theming-customisation/, https://learn.chatgpt.com/docs/projects.md).
- **Visual language:** monochrome and minimal, with high contrast, black pill primary buttons and colour reserved for semantic states. This comes from third-party design analyses (https://www.typeui.sh/design-skills/codex (secondary)). Critics say it has subtle states and hidden affordances. It is dense and IDE-like, with theme customisation as a pro feature.

### 4.2 Codex web (chatgpt.com/codex)

- A prompt box with environment and repository selectors and the **Code** and **Ask** actions, above a **task list**.
- Each task opens a view with **logs**, a **summary** and a **diff**, with actions to request changes, **open a pull request**, or pull the changes locally (https://learn.chatgpt.com/docs/cloud.md, https://community.openai.com/t/ask-button-on-chatgpt-com-codex-web-ui-removed/1359618).
- A read-only **Subagents** panel with Active/Done lists.
- **Settings → Environments** covers setup and maintenance scripts, env vars, secrets and internet access, plus **Code review** toggles.

### 4.3 Codex CLI and IDE

- **CLI:** a full-screen TUI (default since 0.157.0) with:
  - transcript search and mouse selection;
  - six themes;
  - Mermaid and equation rendering;
  - Vim mode;
  - status rows showing live reasoning summaries;
  - an `update_plan` checklist;
  - slash commands `/plan`, `/goal`, `/review`, `/diff`, `/status`, `/permissions`, `/usage`, `/agent`, `/side`, `/fork` and `/compact`.
  - Sources: https://learn.chatgpt.com/docs/changelog, https://flaviocopes.com/codex/
- **IDE:** a **Codex sidebar** (Command Palette → "Codex: Open Codex Sidebar"). It references open files and selections, delegates to cloud, and applies cloud diffs back into the editor (https://learn.chatgpt.com/docs/codex/ide.md).

### 4.4 Claude Code desktop, Code tab

Source for the whole section: https://code.claude.com/docs/en/desktop.md

- **Top-level tabs:** **Chat / Cowork / Code**.
- **Left sidebar:**
  - **+ New session** (`Cmd+N`);
  - filter controls at the top (status, project, environment) and **group by project**;
  - **Routines** (or the **More** menu);
  - **Projects** (beta);
  - hover a session to archive it;
  - `Cmd`-click opens a second session side by side.
  - Sessions from Dispatch carry a **Dispatch** badge.
- **Centre:** the chat pane. The session **title** is in the toolbar at the top of the active session; click it to rename.
- **Prompt area**, left to right:
  - the **environment dropdown** (Local / Cloud / SSH / WSL), then the project folder, then the prompt box;
  - **+** (attachments, slash commands, connectors, plugins) next to the prompt;
  - the **Transcript view** dropdown, the **model** dropdown, the **permission mode** selector and the **usage ring**, all near **Send**;
  - a **Stop** button while running.
  - A **worktree** option sits next to the branch name.
- **Right side:**
  - a draggable grid of panes: **Diff**, **Browser**, **Terminal**, **File editor**, **Plan**, **Tasks**, **Subagent**, opened from the **Views** menu or by shortcut;
  - a **diff stats indicator** (`+12 -1`) that opens the diff viewer (file list left, changes right, **Review code** top-right);
  - a **server dropdown** in the session toolbar for the preview;
  - a **CI status bar** after a PR is opened;
  - the **Continue in** menu at the bottom right of the session toolbar (VS Code icon) to move a session to Cloud or IDE.
- **Floating elements:**
  - **session suggestion chips** in chat for out-of-scope fixes;
  - approval cards (browser sites, workflows with **Once / Always / Deny**, computer-use apps with **Allow for this session / Deny**);
  - desktop notifications.
- **Settings → Claude Code:** worktree location, branch prefix, **Auto-archive after PR merge or close**, **Use this computer from your phone and claude.ai**, **Computer use** toggle (Settings > General), Connectors, and sharing settings.
- **Visual language:**
  - Claude brand: warm "parchment" cream backgrounds (about #f5f4ed), terracotta and coral accents (about #c96442 / #d97757), near-black warm text, an Anthropic Serif display face with a sans for UI (third-party design-system analyses: https://getdesign.md/claude/design-md (secondary)).
  - The Code tab is denser, with dark and light themes. Its feel is calmer and more editorial than Codex's stark monochrome (inferred).

### 4.5 Claude Code on the web (claude.ai/code) and Projects

- **Left sidebar:** sessions (with archive and delete), plus **Projects** and **Routines** entries.
- **Centre:** the conversation, with the input box at the bottom. The repo and branch selectors sit **below** the input; the mode dropdown sits next to it.
- **Diff view:** `+42 -18` indicator, then a file list on the left and changes on the right, **Compare against**, and **Create PR** at the top.
- **CI status bar:** **Auto-fix** toggle.
- **Session menu** (dropdown next to the title): rename, share visibility, **Open in > Terminal**, archive, **Delete**.
- Sources: https://code.claude.com/docs/en/claude-code-on-the-web.md, https://code.claude.com/docs/en/web-quickstart.md
- **Projects screen:**
  - The **project conversation** is in the centre.
  - Each new thread appears *under your message* as a **card** with title and status.
  - The **Overview** pane sits beside the conversation. The **Overview** button in the project header shows a dot when a thread is waiting on you.
  - The Overview **Threads** tab groups threads as **Ready for review / Waiting on you / Working / Landing / Idle / Resolved**.
  - Other tabs are **Library** (files in and out), **Pull requests** and **Routines**.
  - **Project settings** include **Memory** (`MEMORY.md` index) and **Environment**.
  - Source: https://code.claude.com/docs/en/claude-projects
- **Routines screen** (claude.ai/code/routines):
  - a list, plus a **New routine** form (name, prompt with model selector, repositories, environment, **Select a trigger** with Schedule / GitHub event / API, and **Connectors**);
  - a detail page with **Run now**, an on/off switch and a run history.
  - Source: https://code.claude.com/docs/en/routines.md

### 4.6 Claude Code CLI and Agent View

- **CLI:**
  - a transcript with collapsed tool calls and inline diffs;
  - a spinner status line (verb, elapsed time, tokens, "esc to interrupt");
  - a fixed todo list above the input;
  - an **agent panel below the prompt input** listing subagents and teammates (arrows plus Enter to open);
  - a status bar showing the permission mode;
  - a customisable **status line** (https://code.claude.com/docs/en/statusline).
- **Agent View** (`claude agents`, research preview since v2.1.140):
  - a one-screen TUI grouping background sessions into **Pinned / Ready for review / Needs input / Working / Completed**;
  - each row shows an animated state icon, name, a **one-line summary written by a Haiku-class model**, age and PR number;
  - `Space` opens a **peek and reply** panel;
  - `Enter` attaches to the session;
  - typing a task dispatches a new session, with `@repo` and `@agent` prefixes.
  - Source: https://code.claude.com/docs/en/agent-view.md

---

## 5. Step-by-step user flows

### 5.1 Codex: first local task in the desktop app

1. **Install and sign in.** Download the ChatGPT desktop app, switch to **Codex**, and sign in with ChatGPT or an API key (https://flaviocopes.com/codex/).
2. **Add a project.** "Add a local folder"; the picker shows "Git repositories you used recently".
3. **Check permissions.** The defaults let Codex "read and edit files inside the workspace and asks when it needs more". This lives in Settings → General.
4. **Optional read-only warm-up.** Ask Codex to explain the project.
5. **Compose.** Pick the model and reasoning level and the environment (**Local** or **Worktree**), optionally toggle **Plan**, and type the task.
6. **Plan (if on).** Codex inspects and proposes a plan. "Read the plan before you continue. You can approve it, or tell Codex what to change first."
7. **Watch.** "Codex now reads the files, applies its patches, and runs the commands." The task sidebar shows plan, sources and artifacts (secondary). Approval prompts appear when an action exceeds the sandbox, or auto-review evaluates them. Desktop notifications fire on decisions or completion.
8. **Verify the UI.** Open the **Browser** panel on localhost, or let `@Browser` click through. Use **Annotation mode** to point at problems.
9. **Review.** Open the review pane (green and red counters). Leave **+** inline comments and send a follow-up message; stage or revert hunks.
10. **Ship.** **Commit** (Codex can suggest the message), then **Push**, then **Create PR**. With worktrees, **Hand off** the thread to Local to test in your main checkout.

### 5.2 Codex: cloud delegation and PR review

1. Go to chatgpt.com/codex and connect GitHub, choosing which repos Codex can access.
2. **Settings → Environments:** pick the repo, set a setup script (or automatic install), env vars and secrets, and internet access (**Off**, or **On** with **Common dependencies**).
3. Type the task and click **Code** (or **Ask**). Codex "creates a container and checks out your repo at the selected branch or commit SHA", runs the setup script, and turns internet access off for the agent phase.
4. Watch the logs or leave. Review the summary and diff, ask for changes or **open a pull request**.
5. **On the PR:** `@codex review` (the 👀 reaction, then P0/P1 comments), then `@codex fix the P1 issue`, which starts a new cloud task that pushes a fix.
6. **Alternative starts:** trigger the same flow from Slack, Linear, or the IDE's cloud delegation, and apply the cloud diff locally.
   - **Slack:** `@Codex fix the above in org/repo`. Codex picks the matching environment, reacts 👀, and replies with a task link.
   - **Applying results:** the web **Apply** button, or `codex apply TASK_ID` locally (which runs `git apply`), or create a PR straight from the cloud result (https://codex.danielvaughan.com/2026/04/08/codex-cloud-task-application/ (secondary)).

### 5.3 Claude Code: first cloud task from the browser

This is the most beginner-friendly flow of either product (https://code.claude.com/docs/en/web-quickstart.md).

1. Go to claude.ai/code and click **Sign in with GitHub**. Optionally install the Claude GitHub App (**Skip** is allowed).
2. The **Default** environment (Trusted network) is created automatically on Pro and Max. Team users click **Create & finish**.
3. Use the **repository selector** below the input and the branch selector per repo. Pick a mode (**Auto / Accept edits / Plan**).
4. Describe the task and press Enter. The session clones the repo, runs the setup script, configures the network, then works and runs tests.
5. **While it works:** the transcript shows collapsed tool calls; you can queue messages (take one back with ✕). The session keeps running after you close the tab.
6. **At a stopping point:** Claude **pushes a branch** and the `+42 −18` indicator appears. Open the diff, click lines to comment (comments batch with your next message), and use **Compare against** for another base.
7. Click **Create PR** and choose a full PR, a draft, or GitHub compose.
8. **After the PR:** turn on **Auto-fix** in the CI status bar. Claude reacts to failing checks and review comments, pushes fixes, and asks you when something is ambiguous.
9. **Optional:** **Open in > Terminal** or `claude --teleport` continues locally.

### 5.4 Claude Code: plan, then execute locally (desktop or CLI)

1. **Start a session.** Desktop: choose **Local**, the folder and the model, and set the mode to **Plan**. CLI: `claude --permission-mode plan` or Shift+Tab.
2. Claude explores read-only (with Explore and Plan subagents) and writes a plan in the **Plan** pane.
3. **Approve the plan:**
   - **Yes, and use auto mode** runs it with classifier-reviewed actions;
   - **Yes, manually approve edits** has you accept or reject each diff;
   - **No, keep planning**, or `Ctrl+G` to edit the plan yourself.
4. **Execution.** Todo items tick off, the diff stats grow, and the **Browser pane** auto-starts the dev server and auto-verifies with screenshots and DOM checks. Background subagents appear in the **Tasks** pane.
5. **Course-correct.** Side chat (`Cmd+;`), **Stop**, or `/rewind` to **Restore code and conversation** at an earlier prompt.
6. **Review.** The diff viewer offers **Review code** plus line comments, then create a PR, then the **CI status bar** with **Auto-fix** and **Auto-merge**, then auto-archive the session on merge.

### 5.5 Claude Code: parallel "fleet" flows

- **Manual fleet:** **+ New session** × N, each with **worktree** isolation. The sidebar filter "show me only waiting sessions" is a favourite of reviewers (https://findskill.ai/blog/claude-code-desktop-redesign-review/).
- **Agent View:** type tasks into `claude agents`; triage rows by status; press **Space** to peek and reply without attaching.
- **Projects** (beta):
  1. **Projects → New project**: name (required), optional goal, repos and files.
  2. Send tasks one at a time or in batches. The coordinator starts a **thread** per task (or routes the task to an existing thread) and shows a card under your message.
  3. **Overview → Threads** groups threads by state. The dot on **Overview** means "waiting on you".
  4. Threads run in **Auto** and open PRs. Project **memory** holds decisions.
  5. Ask for "a status update on every thread". Resolve threads after merge.
  - Source: https://code.claude.com/docs/en/claude-projects
- **Dynamic workflows:** prompt with `ultracode:` or "use a workflow". An approval dialog lists phases (**Yes, run it / View raw script / No**). `/workflows` shows per-phase agent counts, tokens and elapsed time, with `p` to pause and `s` to save as a command (https://code.claude.com/docs/en/workflows.md).

### 5.6 Automations and routines

- **Codex Scheduled:**
  1. Describe the task and schedule in chat, or use the **Scheduled** sidebar.
  2. Choose standalone or in-chat, local or worktree, model and effort, and an event trigger (Gmail, Slack or GitHub PR).
  3. Results land in the **Scheduled** inbox with unread indicators.
  - Source: https://learn.chatgpt.com/docs/automations.md
- **Claude Routines:**
  1. **New routine**: prompt, repos, environment and a trigger (Schedule / GitHub event with filters such as base branch or label / API with **Generate token**).
  2. Review the connectors, which are all included by default.
  3. Click **Create**; each run becomes a normal session.
  - **Caveat:** "A green status… does not mean the task in your prompt succeeded" (https://code.claude.com/docs/en/routines.md).

### 5.7 Import an existing project

- **Local, both:** open a folder, then run `/init` (Claude) or write `AGENTS.md` (Codex). The agent reads the repo and proposes conventions.
- **Cloud:** connect a GitHub repo. Claude can also **bundle a non-GitHub repo** via `claude --cloud`, but results can't be pushed back to GitLab or Bitbucket.
- **Mid-stream handoff:** Claude's `/desktop`, **Continue in**, `--teleport` and `/resume`; Codex's **Hand off** and `/import`.

### 5.8 Agent-building flow

- There is no UI builder in either product. The path is code-first:
  1. Install the Agent SDK or Codex SDK and set an API key (Claude forbids claude.ai login for third-party products).
  2. Define tools and MCP servers, permissions and hooks.
  3. Run the agent loop; host it yourself, or use Anthropic **Managed Agents**.
- **Inside the tools:** define subagents as markdown or TOML files; on Claude, manage them with `/agents`.

### 5.9 Collaboration flow

- **Claude:** share a session (**Team** or **Public**) and share **Artifacts** (a PR walkthrough or dashboard, with viewer and editor roles and comments that can be **Sent to Claude**). `@claude` works in GitHub; **Claude Tag** in Slack auto-shares with Team.
- **Codex:** `@codex` in GitHub, Slack and Linear; shared workspace environments and plugins.

---

## 6. UX strengths and pain points

### 6.1 What users love

**Codex:**
- **Polished parallel agents:** "Skills + Automations feel 'complete', not experimental"; the "Cloud/Local Hybrid" gives seamless context (https://www.verdent.ai/guides/codex-app-first-impressions-2026).
- **Review quality:** strong praise for catching logic errors and race conditions (https://www.firecrawl.dev/blog/claude-code-vs-codex (secondary)).
- **Long autonomous runs:** `/goal`, durable goal state across restarts, and token budgets (https://codex.danielvaughan.com/2026/05/03/codex-cli-goal-mode-persistent-objectives-token-budgets-agentic-loops/).
- **Point-and-instruct UI iteration:** browser comment annotations turn front-end work into "a point-and-instruct loop instead of a prompt-and-pray one" (secondary).
- **Value:** Codex is included in ChatGPT plans; token-based credits cover overflow.
- **Hands-on praise** (Feb 18, 2026; https://thecartine.substack.com/p/codex-app-doesnt-suck):
  - "Everything In One Place", with compact thread navigation on the left;
  - a side-pane diff that stops blind trust;
  - **mid-run steering** without restarting ("makes you wonder why nobody did it sooner");
  - the app keeps working while the laptop sleeps.
  - The same reviewer disliked thread pile-up (wants "soft-archiving automation"), found the Run-action setup unnecessary, and was unsure what Automations were for.

**Claude Code:**
- **Session continuity everywhere:** terminal, desktop, web, phone, and teleport between them.
- **Frictionless review loop:** line comments bundled into the next message, **Create PR**, then **Auto-fix** and **Auto-merge**.
- **Extensibility:** CLAUDE.md, skills, hooks, subagents, plugins and MCP. A "build your setup over time" ladder tells users when to add each (https://code.claude.com/docs/en/features-overview.md).
- **Desktop redesign:** the sidebar filters are "genuinely useful"; the preview pane "is better than expected" (https://findskill.ai/blog/claude-code-desktop-redesign-review/).
- **Auto mode:** users like fewer prompts. Anthropic's data (97% of prompts approved reflexively; auto mode caught 89% of harmful actions versus 13.6% for humans) made "safer by default" credible (https://techcrunch.com/2026/08/09/anthropic-is-turning-claude-codes-auto-mode-on-by-default/). Claude Code's head: couldn't "imagine going back to permission prompts".

### 6.2 Pain points and complaints (with evidence)

**Claude Code:**
- **Usage-limit whiplash:**
  - Reddit threads "20x max usage gone in 19 minutes" (330+ comments) and "Claude Code Limits Were Silently Reduced" (360+) (https://www.theregister.com/2026/01/05/claude_devs_usage_limits/ (secondary summary)).
  - A billing split for automated workloads was announced May 14, then cancelled Jun 15.
  - A net −17% weekly cut on Sep 14, 2026 (https://bigguyonstuff.com/claude-code-usage-limits-production/).
- **Parallelism burns quota:** Projects "can reach usage limits faster"; The Register's headline was "work and pay in parallel" (https://www.theregister.com/ai-and-ml/2026/09/18/claude-code-revamps-projects-so-you-can-work-and-pay-in-parallel/5297532).
- **Undocumented behaviour changes:** `AskUserQuestion` began auto-continuing after 60 s with no changelog entry; commenters cited "Product Instability" from frequent UI changes (https://news.ycombinator.com/item?id=48947776).
- **Quality regressions:** the Feb 2026 GitHub issue "Claude Code is unusable for complex engineering tasks with Feb updates" hit the HN front page, and a team member responded (https://news.ycombinator.com/item?id=47660925, https://news.ycombinator.com/item?id=47664442).
- **Trust split over the auto default:** "I want to effectively pair program with the agent" versus "if you allow agents to write and run code, it's equivalent to YOLO mode" (https://news.ycombinator.com/item?id=49239021).
- **Desktop bugs** (Apr 2026 review): session state drift on the same repo across branches; the preview not refreshing; the sidebar freezing with 10+ sessions; aggressive archiving; layouts not persisting (https://findskill.ai/blog/claude-code-desktop-redesign-review/).
- **Checkpoint blind spots:** Bash-made changes and most subagent edits aren't rewindable (https://code.claude.com/docs/en/checkpointing.md).
- **Feature sprawl and churn:** subagents, agent teams, dynamic workflows, agent view, Projects, Routines, scheduled tasks, `/loop`, Dispatch and Cowork overlap, and the docs need a comparison page ("Run agents in parallel"). **Ultraplan** was shipped, then removed.

**Codex:**
- **Structured questions only in Plan mode:** many GitHub issues (#24750, #30150, #12694, #10384) ask for `request_user_input` in Default mode for human-in-the-loop flows.
- **Navigation clarity:** projects and threads look the same in the sidebar (#29161). "Tab proliferation" makes old work hard to find (https://macaron.im/blog/codex-app-troubleshooting (secondary)).
- **Weak Git history:** only a diff pane for uncommitted changes, with no branch tree or commit graph (#30919).
- **Worktree bloat, merge chaos and permission fatigue;** slow setup scripts re-run per worktree (https://macaron.im/blog/codex-app-troubleshooting (secondary)).
- **Context-window failures** ("Codex ran out of room in the model's context window"), plus usage-limit visibility complaints and requests for real-time stdout (https://dev.to/vitramir/codex-most-common-issues-and-feature-requests-293h (secondary, likely 2025 data)).
- **Security incidents:** malicious GitHub branch names could inject commands and steal tokens (Mar 2026, patched); patch-quality concerns from 1Password's security director (Aug 2026) (https://en.wikipedia.org/wiki/OpenAI_Codex_(AI_agent)).
- **UI churn:** the web **Ask** button was removed, then restored after complaints (Sep 2025). The Jul 2026 app merger forced CLI users to adjust app detection (https://codex.danielvaughan.com/2026/07/17/codex-chatgpt-unified-desktop-app-cli-migration-codex-app-detection-workarounds/).
- **Regional gaps:** computer use was not available at launch in the EEA, UK or Switzerland (secondary).

---

## 7. Recent notable launches (2025–2026)

### Codex

| Date | Launch |
|---|---|
| Apr 16, 2025 | Codex CLI (open source). |
| May 16, 2025 | Codex cloud research preview (codex-1). |
| Sep–Oct 2025 | GPT-5-Codex; web "Ask/Code" experiments; GitHub code review. |
| Feb 2, 2026 | **Codex desktop app** (macOS): worktrees, skills, automations, review queue. |
| Feb 4–5, 2026 | GPT-5.3-Codex; Codex in GitHub Agent HQ; Figma MCP integration. |
| Mar 4–5, 2026 | Windows app with native PowerShell sandbox; GPT-5.4. |
| Mar 10, 2026 | **Codex Security** agent. |
| Mar 2026 | Enterprise plugin system; superapp plan announced (Mar 19); Astral acquisition. |
| Apr 16, 2026 | **"Codex for (almost) everything"**: computer use, in-app browser, 90+ plugins, memory, image generation, thread automations, PR review pane, artifact viewer. |
| Apr 23, 2026 | GPT-5.5; browser verification; **auto-review** of approvals. |
| Apr 30, 2026 | **Permission profiles**; `/goal` (CLI 0.128). |
| May 21, 2026 | `/goal` GA across app, CLI and IDE (0.133). |
| Jun 2, 2026 | 5M+ weekly users, about 20% non-developers (per OpenAI, secondary). |
| Jul 9, 2026 | **Codex merged into the ChatGPT desktop app** (Chat / Work / Codex); GPT-5.6 Sol/Terra/Luna. |
| Sep 2026 | GPT-6 Sol and Luna (Sep 22); full-screen TUI; voice; `/usage` dashboard; worktree sessions by default; redesigned home screen and iPad split view (Sep 23); fork shortcut (0.157, Sep 25). |

### Claude Code

| Date | Launch |
|---|---|
| Feb 24, 2025 | Research preview (CLI). |
| May 22, 2025 | GA with Claude 4. |
| Jun–Jul 2025 | Remote MCP (OAuth), hooks, custom subagents (`/agents`). |
| Oct 20, 2025 | **Claude Code on the web** (cloud sessions). |
| Oct 31, 2025 | Plugins and marketplaces. |
| Dec 8, 2025 | Claude Code in Slack. |
| Jan 2026 | Viral with non-coders; **Cowork** launched for non-programmers. |
| Feb 5, 2026 | Opus 4.6; agent teams preview. |
| Feb 20, 2026 | Desktop review tools; Claude Code Security preview. |
| Mar 2026 | Computer use, Remote Control, cloud scheduled tasks, cloud auto-fix, Code Review; **Auto mode** research preview (Mar 24). |
| Apr 14, 2026 | **Desktop redesign** (parallel sessions sidebar, drag-drop panes, terminal, file editor, preview, side chat); **Routines** preview. |
| May 11, 2026 | **Agent View**; `/goal` (secondary). |
| Jun 2, 2026 | **Dynamic workflows** preview (`ultracode`, `/deep-research`). |
| Jul 10, 2026 | Auto mode GA. |
| Aug 7, 2026 | Self-hosted cloud environments (beta). |
| Aug 14, 2026 | **Auto mode default** for Pro, Max and Team. |
| Sep 17, 2026 | **Projects** public beta (coordinator plus parallel cloud threads plus Overview pane). |
| Sep 18–25, 2026 | **AGENTS.md support** (v2.1.277); server-side auto-mode classifier (2.1.278); **Opus 5.5 default, 1M context** (2.1.280); auto mode as the built-in default for all interactive sessions (2.1.283). |

Sources: https://www.scriptbyai.com/claude-code-timeline/ (secondary timeline), https://code.claude.com/docs/en/changelog, https://claude.com/blog/claude-code-desktop-redesign, https://en.wikipedia.org/wiki/OpenAI_Codex_(AI_agent), https://learn.chatgpt.com/docs/changelog

---

## 8. Comparison: Codex vs Claude Code, and what a pro mode should borrow

| Dimension | Codex | Claude Code | Best pattern to borrow |
|---|---|---|---|
| Home / entry | Composer with project, environment, branch, model, permissions and Plan built in. | Prompt area with environment dropdown (left), folder, model, mode and usage ring (right). | **One composer that carries all run settings as chips.** |
| Environment choice | Local / Worktree / Cloud dropdown plus **Hand off**. | Local / Cloud / SSH / WSL plus a worktree toggle plus **Continue in**. | A **"Where it runs"** chip; a one-click move to cloud. |
| Autonomy | Default permissions / Full access / profiles / auto-review. | Manual / Accept edits / Plan / Auto / Bypass (Auto is the default). | **Auto by default, with plain-language modes.** |
| Plan | Plan toggle; approve or revise. | Three-way approval dialog; edit the plan. | **Claude's 3-button plan card.** |
| Clarifying questions | Structured only in Plan mode (a pain point). | Structured choices (with a 60 s auto-continue controversy). | **Structured, blocking questions in every mode.** |
| Progress | Task sidebar (plan, sources, artifacts, summary); status rows. | Normal / Thinking / Verbose views; Plan, Tasks and Subagent panes; spinner plus todo list. | **A live plan checklist plus a density toggle.** |
| Parallelism | Worktrees, subagents, cloud tasks. | Sessions, agent view, agent teams, workflows, Projects coordinator. | **A coordinator conversation plus an Overview board.** |
| Preview | In-app browser, annotation plus **Adjust**, CDP. | Browser pane, auto-start, **auto-verify**, element select. | **Annotate, adjust and auto-verify together.** |
| Review | Scoped review pane (Unstaged / Staged / Commit / Branch / Last turn); `+` comments; stage and revert hunks. | Diff viewer plus **Review code**; batched comments; Compare against. | Codex's **scopes plus hunk staging**, and Claude's **batched comments**. |
| PR / CI | Commit, push, PR; `@codex review` / `fix`. | Create PR (full / draft / compose); **CI bar with Auto-fix and Auto-merge**. | **Claude's CI bar.** |
| Memory | `AGENTS.md` layering, overrides, 32 KiB cap; memories. | `CLAUDE.md` / `AGENTS.md`, rules, imports, auto memory, project memory. | **AGENTS.md plus visible, editable memory.** |
| Rollback | Git revert; worktree snapshots. | `/rewind` checkpoints (code and/or chat). | **Checkpoints that cover the full sandbox.** |
| Automations | Scheduled (time plus Gmail, Slack, GitHub events). | Routines (schedule, API, GitHub events plus filters). | **A trigger builder reusable for users' own agents.** |
| Mobile | Remote approvals, diffs, iPad split view. | Code tab, Remote Control, Dispatch push notifications. | **Approve from phone.** |
| Hosting / backend | None. | None (Artifacts are static pages only). | **Architect's differentiation.** |

---

## 9. Ideas for Architect 2.0

Each idea is tagged **ADOPT:**, **IMPROVE:** or **AVOID:**. Placement suggestions are concrete where possible.

### Composer, modes and autonomy

- **ADOPT: A single run-settings strip in the composer.**
  - Left of the prompt box: **Where** (Cloud sandbox / My computer via CLI bridge).
  - Right, next to Send: **Model**, **Mode**, a **Usage ring**.
  - Below the input: **Repo and branch** chips.
  - This mirrors Claude desktop and web and the Codex composer.
- **ADOPT: Human-labelled modes with a dev translation on hover.**
  - The modes: **Ask** (read-only), **Plan**, **Build** (auto with safety checks) and **Build (approve each step)**.
  - Hover shows the technical name (`plan` / `acceptEdits` / `auto` / `default`).
  - Default non-technical users to Build-auto, following Anthropic's 97% / 89% evidence. Let developers pin "approve each step" per project.
- **ADOPT: Claude's three-button plan approval card.**
  - The buttons: **Build it**, **Build it — let me approve changes**, **Keep planning**.
  - An **Edit plan** button opens the plan as an editable checklist.
  - Show estimated credits and time on the card.
- **IMPROVE: Structured clarifying questions in every mode, not just Plan (fixing Codex's gap).**
  - Render them as chips or radio cards, with "Other…" free text.
  - **Never auto-continue** on questions that affect data, money or deploys. Claude's 60 s auto-continue is the counter-example.
- **ADOPT: A side chat for "quick question" (`Cmd+;`).** It reads the thread context but adds nothing back. Put it in a slide-over drawer on the right.

### Progress: what users see while the app is built

- **ADOPT: A live plan checklist pinned above the composer**, like Claude's todo list ("/todo (1 of 3)") and Codex's `update_plan`.
  - Each step expands to show its tool calls.
  - Pair it with a status line: current step verb, elapsed time and credits used so far.
- **ADOPT: A transcript density toggle:**
  - **Summary** (the default for non-technical users): steps and outcomes only;
  - **Normal**: tool calls collapsed;
  - **Verbose** (developers): every command and file read.

  This follows Claude's Normal / Thinking / Verbose.
- **ADOPT: Auto-verify cards.** After each build step the agent screenshots the preview, checks the console and network, and posts a "✓ Verified: login form renders; 0 console errors" card with a thumbnail. This follows Claude's auto-verify and Codex browser verification.
- **IMPROVE: Outcome-based status, not infrastructure status.** Claude warns that a green routine run ≠ success. Status chips should report *outcomes*: "Tests 42/42 passed", "PR #12 opened", "Deploy preview live", "Blocked: needs Stripe key".

### Parallel work and the agent section

- **ADOPT: A Project coordinator plus an Overview board** (Claude Projects) as the "build an entire agentic application" experience.
  - The user describes the app. The coordinator splits the work into threads (UI, API, DB schema, agent, tests), each on its own branch.
  - Threads appear as **cards under the message**.
  - A right-hand **Overview** pane groups threads: **Needs you / Working / Ready for review / Shipped**.
  - Tabs: **Files**, **PRs**, **Automations**.
- **ADOPT: A sessions sidebar with status filters** (Claude desktop and Agent View).
  - One-line AI summaries per session ("Adding swept-AABB checks…"); a **Needs input** badge count.
  - **Peek and reply** on hover, without opening the session.
- **IMPROVE: A clear visual hierarchy between Projects and Threads** (Codex issue #29161): bold project rows with an accent bar and icon, indented threads with status dots.
- **ADOPT: A worktree-style "branch per thread" by default**, hidden from non-technical users behind the word "version".
  - Developers see branch names and a **Hand off / Continue in** menu (Cloud ↔ Local ↔ IDE).
- **ADOPT: A "Try 3 versions" button (best-of-N)** next to Send for design-heavy prompts, following Codex's `--attempts 1–4`.
  - Show the variants side by side as preview thumbnails, each with **Keep this one**.
  - Show the cost multiplier ("≈3× credits") on the button.
  - This fits vibe coding well: non-technical users choose visually rather than by reading diffs.
- **AVOID: Unbounded parallel token burn.**
  - Before fanning out, show a **cost estimate and a cap**, like Claude's "Large workflow" warning above 25 agents or 1.5M tokens.
  - Let users set a per-project budget. The Register's "work and pay in parallel" is the reputational risk.
- **AVOID: Feature sprawl.** Claude now has subagents, agent teams, workflows, agent view, Projects, Routines, scheduled tasks, `/loop`, Dispatch and Cowork, with overlapping mental models. Architect should expose **one hierarchy**: *Project → Threads → Checkpoints → Deploys*, with "agents" as a first-class object inside a project.

### Review, Git and CI

- **ADOPT: A diff chip (`+42 −18`) in the session toolbar that opens a Review pane.**
  - A file list on the left and the diff on the right.
  - Codex-style **scopes** (This step / All changes / vs main).
  - **Hunk-level keep / undo**.
  - **Line comments that batch into the next message** (Claude).
  - A **Review code** button in the top-right that runs an AI reviewer with 🔴 / 🟡 / 🟣 severity (Claude Code Review).
- **ADOPT: A split button at the top of the review pane: Create PR ▾ (PR / Draft PR / Open in GitHub)** (Claude web).
- **ADOPT: A CI status bar after a PR opens, with Auto-fix and Auto-merge toggles** and desktop and phone notifications (Claude desktop). This is the single most "pro" feature to copy.
- **ADOPT: `@architect` in GitHub PRs and issues:** `@architect review`, `@architect fix the failing test`, and `@architect review always`. Follow Claude's once/always semantics and label every bot reply "via Architect".
- **IMPROVE: A real Git history view**, which Codex lacks (issue #30919). Add a commit timeline merged with checkpoints and deploys: one vertical history showing "Checkpoint 14 · Commit a1b2 · Deployed to preview". Each item gets **Restore**, **Diff** and **Promote to production** actions.
- **ADOPT: `REVIEW.md` and `AGENTS.md` support on import** (read `AGENTS.md`, `CLAUDE.md` and `.cursorrules`). Show them in **Project settings → Instructions**, with an **Auto memory** list the user can edit and delete (Claude project memory, Codex memories).

### Preview, visual editing and verification

- **ADOPT: Annotation mode plus Adjust in the preview.**
  - Click an element and type a comment, or open an **Adjust** popover with font, spacing and colour sliders and live preview (Codex).
  - Add `Cmd+Shift+S` element select (Claude).
  - Batch the annotations into the next prompt.
- **IMPROVE: Hosted preview URLs, which neither tool has.**
  - Every thread or branch gets a shareable live preview URL (not just localhost), with device toggles.
  - A **Persist sessions** option (Claude) keeps test logins across reloads.
- **ADOPT: Deep links to prefill a new session**: `architect.new/new?prompt=…&repo=…`, following Claude's `?prompt=&repositories=`. Use them for "Open in Architect" README badges and "Fix with Architect" buttons in error emails.

### Environments, safety and secrets

- **ADOPT: Environment settings with plain-language network presets:**
  - **No internet / Package registries only (recommended) / Custom allowlist / Full**;
  - an optional "read-only HTTP methods" toggle (Codex);
  - a setup script with a cache status ("Environment cached 2 h ago").
- **ADOPT: Secrets UX that explains *when* a secret is visible** (setup only vs runtime), following Codex. Keep credentials out of the sandbox via a proxy (Claude's GitHub and API-credential proxy). Show a lock icon and a "never shown to the agent" label.
- **ADOPT: Classifier-reviewed auto mode that respects conversational boundaries.** "Don't deploy until I review" becomes a *visible rule chip* on the thread, so it survives context compaction; Claude notes compaction can drop boundaries.
- **IMPROVE: Checkpoints that capture the whole sandbox,** covering files changed by shell commands, database state and env, with the menu **Restore app and chat / app only / chat only**. This fixes Claude's "Bash changes not tracked" limitation.

### Automations, mobile and collaboration

- **ADOPT: One trigger builder** (Schedule / Webhook / GitHub event with filters) used both for *agent chores* (Claude Routines, Codex Scheduled) and for *the user's deployed agents* (cron and webhooks in their app). This is a natural bridge to "build AI agents in any framework".
- **ADOPT: Phone approvals and push notifications** ("Thread 'Payments' needs approval: run migration?"), with diff review on mobile (Codex Remote, Claude Dispatch and Remote Control).
- **ADOPT: Shareable session and "walkthrough" pages**, like Claude Artifacts. One click publishes a read-only page of what the agent built, with annotated diffs and preview screenshots, for stakeholders who shouldn't need an account. Include **viewer and editor roles and comments that can be sent to the agent**.
- **ADOPT: Session suggestion chips.** When the agent notices out-of-scope issues, it offers them as one-click new threads without derailing the current one (Claude desktop).

### Onboarding and non-technical parity

- **IMPROVE: Don't make GitHub a prerequisite** (both tools require it for cloud).
  - Default to an Architect-hosted repo, with **Connect GitHub** as an upgrade.
  - Import from GitHub, zip, or a local folder via a CLI bridge (Claude's bundle upload is precedent).
- **ADOPT: A first-run "Understand this project" step on import.** Run `/init`-style analysis, show a generated instructions file for approval, and list detected commands (dev, test, build) as **Actions** buttons in the toolbar (Codex Actions).
- **AVOID: Terminal-only affordances for core flows.** Slash commands, `Esc Esc` and `Ctrl+G` are fine as accelerators. Every action also needs a visible button, and keyboard hints belong in a `?` sheet (Claude's `Cmd+/`).

### Pricing and trust

- **IMPROVE: A single, predictable credit meter.**
  - Codex's 5-hour windows, weekly caps and credits, and Claude's shifting limits (−17% on Sep 14, 2026; the cancelled billing split), are top complaints.
  - Show one balance with a **per-task estimate before run**, **live spend during the run**, and **"this will use ~X credits; you have Y"** before parallel fan-outs.
- **AVOID: Silent behaviour changes and abrupt removals** (Claude's AskUserQuestion auto-continue, Ultraplan's removal; Codex's Ask button). Ship an in-app **What's new** panel. Put breaking changes behind toggles with notice.
- **AVOID: Aggressive auto-archiving and unstable layouts** (FindSkill complaints). Persist pane layouts per project. Archive only on explicit merge or close, with an undo toast.

---

## Sources

**OpenAI Codex (primary)**
- https://learn.chatgpt.com/docs/changelog (the Codex changelog; formerly developers.openai.com/codex/changelog)
- https://learn.chatgpt.com/docs/app
- https://learn.chatgpt.com/docs/pricing.md
- https://learn.chatgpt.com/docs/cloud.md
- https://learn.chatgpt.com/docs/environments/cloud-environment.md
- https://learn.chatgpt.com/docs/environments/modes.md
- https://learn.chatgpt.com/docs/cloud/internet-access.md
- https://learn.chatgpt.com/docs/agent-approvals-security.md
- https://learn.chatgpt.com/docs/agent-configuration/agents-md.md
- https://learn.chatgpt.com/docs/agent-configuration/subagents.md
- https://learn.chatgpt.com/docs/automations.md
- https://learn.chatgpt.com/docs/browser.md
- https://learn.chatgpt.com/docs/code-review?surface=app
- https://learn.chatgpt.com/docs/third-party/github.md
- https://learn.chatgpt.com/docs/remote.md
- https://learn.chatgpt.com/docs/projects.md
- https://learn.chatgpt.com/docs/codex/ide.md
- https://learn.chatgpt.com/docs/codex-sdk.md
- https://learn.chatgpt.com/docs/llms.txt
- https://developers.openai.com/codex/enterprise/admin-setup
- https://community.openai.com/t/ask-button-on-chatgpt-com-codex-web-ui-removed/1359618/42
- https://github.com/openai/codex/issues/29161
- https://github.com/openai/codex/issues/30919
- https://github.com/openai/codex/issues/24750 , https://github.com/openai/codex/issues/30150

**Anthropic Claude Code (primary)**
- https://code.claude.com/docs/en/changelog
- https://code.claude.com/docs/en/desktop.md
- https://code.claude.com/docs/en/claude-code-on-the-web.md
- https://code.claude.com/docs/en/web-quickstart.md
- https://code.claude.com/docs/en/permission-modes
- https://code.claude.com/docs/en/checkpointing.md
- https://code.claude.com/docs/en/memory.md
- https://code.claude.com/docs/en/sub-agents.md
- https://code.claude.com/docs/en/agent-teams.md
- https://code.claude.com/docs/en/agent-view.md
- https://code.claude.com/docs/en/workflows.md
- https://code.claude.com/docs/en/claude-projects
- https://code.claude.com/docs/en/routines.md
- https://code.claude.com/docs/en/code-review.md
- https://code.claude.com/docs/en/github-actions.md
- https://code.claude.com/docs/en/artifacts.md
- https://code.claude.com/docs/en/remote-control.md
- https://code.claude.com/docs/en/features-overview.md
- https://code.claude.com/docs/en/agent-sdk/overview.md
- https://code.claude.com/docs/en/ultraplan.md
- https://code.claude.com/docs/en/statusline
- https://claude.com/blog/claude-code-desktop-redesign
- https://claude.com/pricing

**News, analysis and secondary**
- https://en.wikipedia.org/wiki/OpenAI_Codex_(AI_agent)
- https://en.wikipedia.org/wiki/Claude_(language_model)
- https://www.developersdigest.tech/blog/chatgpt-work-codex-desktop-app
- https://www.developersdigest.tech/blog/codex-changelog-april-2026
- https://www.developersdigest.tech/blog/codex-vs-claude-code-april-2026
- https://codex.danielvaughan.com/2026/04/17/codex-app-workspace-pr-review-task-sidebar-artifact-viewer/
- https://codex.danielvaughan.com/2026/04/11/codex-app-worktree-lifecycle-local-environments/
- https://codex.danielvaughan.com/2026/05/07/codex-cli-goal-command-persisted-long-horizon-workflows-pause-resume-budget/
- https://codex.danielvaughan.com/2026/03/30/codex-app-theming-customisation/
- https://codex.danielvaughan.com/2026/07/10/chatgpt-work-codex-unification-cli-developer-guide-scheduled-tasks-unified-runtime/
- https://codex.danielvaughan.com/2026/07/17/codex-chatgpt-unified-desktop-app-cli-migration-codex-app-detection-workarounds/
- https://flaviocopes.com/codex/ (Sep 15, 2026 guide)
- https://thecartine.substack.com/p/codex-app-doesnt-suck (Feb 18, 2026 hands-on)
- https://codex.danielvaughan.com/2026/04/08/codex-cloud-task-application/ (Slack → apply flow, best-of-N)
- https://getpushtoprod.substack.com/p/complete-beginners-guide-to-openais
- https://www.verdent.ai/guides/codex-app-first-impressions-2026
- https://kingy.ai/news/the-codex-app-super-guide-2026-from-hello-world-to-worktrees-skills-mcp-ci-and-enterprise-governance/
- https://www.digitalapplied.com/blog/openai-codex-for-almost-everything-release-guide
- https://macaron.im/blog/codex-app-troubleshooting
- https://dev.to/vitramir/codex-most-common-issues-and-feature-requests-293h
- https://thenewstack.io/gpt-5-6-codex-user-surge/
- https://www.unite.ai/openai-says-codex-and-chatgpt-work-hit-10-million-users/
- https://techjacksolutions.com/ai-brief/openai-codex-passes-5-million-weekly-users-and-1-in-5-arent/
- https://releasebot.io/updates/openai/codex
- https://www.firecrawl.dev/blog/claude-code-vs-codex
- https://www.macrumors.com/2026/04/15/anthropic-rebuilds-claude-code-desktop-app/
- https://findskill.ai/blog/claude-code-desktop-redesign-review/
- https://techcrunch.com/2026/08/09/anthropic-is-turning-claude-codes-auto-mode-on-by-default/
- https://www.theregister.com/ai-and-ml/2026/09/18/claude-code-revamps-projects-so-you-can-work-and-pay-in-parallel/5297532
- https://www.theregister.com/2026/01/05/claude_devs_usage_limits/
- https://www.marktechpost.com/2026/09/17/anthropic-launches-claude-code-projects-in-beta-parallel-cloud-sessions-that-keep-running-after-you-close-your-laptop/
- https://bigguyonstuff.com/claude-code-usage-limits-production/
- https://fortune.com/2026/01/24/anthropic-boris-cherny-claude-code-non-coders-software-engineers/
- https://www.scriptbyai.com/claude-code-timeline/
- https://x.com/simonw/status/2022044549733056861
- https://news.ycombinator.com/item?id=49239021 (auto mode default)
- https://news.ycombinator.com/item?id=48947776 (AskUserQuestion misfeature)
- https://news.ycombinator.com/item?id=47660925 , https://news.ycombinator.com/item?id=47664442 (Feb 2026 quality issue)
- https://getdesign.md/claude/design-md (Claude visual language analysis)
- https://www.typeui.sh/design-skills/codex (Codex visual language analysis)
