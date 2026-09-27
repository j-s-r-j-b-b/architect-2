# Research reconciliation: candidate notes vs deep research

> Compares the candidate's notes ([my-research/candidate-research-notes.md](my-research/candidate-research-notes.md)) with the 10 deep reports ([platforms/](platforms/)) and the master synthesis ([00-RESEARCH-SYNTHESIS.md](00-RESEARCH-SYNTHESIS.md)). Date: 2026-09-26.

## 1. What we keep from the candidate's notes

- **The four-category taxonomy** is clear and easy to present:
  1. Prompt-to-Production builders;
  2. Visual/UI-first generators;
  3. Browser/cloud scaffolding;
  4. AI-native pro tools.

  Architect 2.0 is positioned as the product that joins categories 1 and 4, and adds an agent layer that none of them has (synthesis §1.0).
- **Rocket's "research before code" (Vibe Solutioning)** backs up our plan-first spine (concept C1 Living Spec).
- **Rocket's separate staging and production environments** feed our Draft → Staging → Production **Launch** tab.
- **Emergent's multi-agent split** (logic, UI and backend tasks) is shown in our build timeline as named build steps.
- **Lovable's "click the component to edit its vibe or logic"** becomes our **Select / Edit / X-ray** preview tools (C4).
- **v0's iterative versions (v1, v2, v3) and forking** become our **History** drawer with checkpoints, compare and "try on a draft" (C9).
- **Cursor's accept/reject streaming diff** becomes our **Review** pane with keep/undo per change (developer lens).
- **Claude Code's think → search → edit → test loop** becomes our visible **run timeline** and the "Doctor" fix loop (C7).
- **"Low friction" as a design goal**, from Copilot's ghost text, becomes our "one primary action per screen" rule.

## 2. Corrections: claims that are outdated or incorrect as of Sep 2026

These need fixing before anything is submitted. The examiner (Lyzr) knows its own product.

| Candidate note | What the evidence says | Source |
|---|---|---|
| "architect.new … leverages WebContainers … ephemeral environments … file explorer, hot-reload" | **Incorrect.** architect.new is **Lyzr's agent-first builder**: plan (PRD + agent table + mockup) → Lyzr Agent Studio agents (tools, knowledge base, guardrails) → Next.js app with a managed NoSQL DB and auth, deployed to a Lyzr subdomain. It has **no documented file explorer or code editor**, and WebContainers belong to **Bolt.new** (StackBlitz). | [01-architect-new.md](platforms/01-architect-new.md) §0–§3 |
| Replit is a "browser web-container" | Replit runs **cloud containers** (NixOS), not in-browser WebContainers. It is now on **Agent 4**, with a parallel task board, a Design canvas, a Postgres dev/prod split and Replit Auth. | [02-replit.md](platforms/02-replit.md) |
| v0 "streams three UI variations … copy an `npx` command" | That describes the **2023–24 component generator**. v0.app is now an **agentic full-stack builder**: a Git branch per chat, PR-based Publish, Design Mode, a VM sandbox with a terminal, one-click deploy to Vercel, and Platform API v2 + MCP. | [05-vercel-v0.md](platforms/05-vercel-v0.md) |
| Codex = "ghost text autocomplete" | That was the 2021 Codex model behind early Copilot. **Today's OpenAI Codex is an agentic coding agent**: cloud tasks in sandboxes, CLI, IDE extension, a mode inside the ChatGPT desktop app, `@codex` in GitHub and Slack, and automatic PR creation and code review. Ghost text belongs to **GitHub Copilot / Cursor Tab**. | [08-codex-claude-code.md](platforms/08-codex-claude-code.md) |
| Cursor = Composer + CMD+K + CMD+L | True but dated. Cursor now centres on an **Agents window**: parallel local, worktree and cloud agents, Plan mode, Bugbot review, rules and MCP. | [07-cursor-windsurf.md](platforms/07-cursor-windsurf.md) |
| Claude Code = terminal-only CLI | Claude Code is now also available as a **desktop app, on the web and in IDEs**, with plan mode, permission modes, subagents, hooks, skills, plugins, MCP and checkpoints. | [08-codex-claude-code.md](platforms/08-codex-claude-code.md) |
| Lovable: "AI-driven animations" | Not a documented headline feature (unverified). Lovable's real differentiators are **Lovable Cloud** (a built-in backend: DB, auth and storage), **Visual Edits**, **security scans that can block publishing**, two-way GitHub sync and Plan/Chat modes. | [03-lovable.md](platforms/03-lovable.md) |

## 3. What the candidate's notes did not cover (added by the deep research)

- **The agent-builder market** is where the "Agent section" and "any framework" requirements come from. It covers OpenAI AgentKit, LangGraph, CrewAI, Google ADK, n8n, Dify and others. Its main finding: agent building has moved from canvases to **form + chat cards** ([10-agent-builder-platforms.md](platforms/10-agent-builder-platforms.md)).
- **Other builders:** Bolt.new, Base44, Google AI Studio, Anything, Leap.new and Dyad ([09-other-app-builders.md](platforms/09-other-app-builders.md)).
- **The pain-point evidence** that drives our design: credit burn, fix loops, black-box builds, silent scope cuts, sample-data fallbacks and destructive rollbacks (synthesis §6).
- **The full parity list** of today's Architect features, F01–F112 (synthesis §7).
- **Competitive signal:** 10+ public "Architect 2.0" candidate repos repeat a Simple/Pro toggle, chat-left/preview-right and a framework dropdown. We differentiate on the connections between steps, not on the panel layout (synthesis §8).

## 4. Net effect on the design

Nothing in the candidate's notes contradicts the design direction. Section 1 confirms five of our concepts (C1, C4, C7, C9 and the Review pane), and section 2 fixes the factual framing for the submission write-up.
