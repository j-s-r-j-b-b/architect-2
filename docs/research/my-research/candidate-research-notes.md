# Candidate's research notes (as provided, 2026-09-26)

## 1. The "Prompt-to-Production" Builders (Zero-Code)
These platforms abstract away code entirely, generating full-stack infrastructure, databases, and UI from a single prompt.

* **Rocket.new**
   * Differentiator: "Vibe Solutioning." It researches market data and product-market fit before writing any code.
   * Key Features: Automated Supabase database generation, Stripe integration, native React/Flutter code export, and separated staging/production environments.
   * Why People Use It: To skip the prototype phase and generate a live, scalable app ready for users on day one.
   * UX Flow: Type an idea → AI suggests architecture → Generates Next.js/Flutter code → 1-click deploy. Follow-up prompts safely iterate on the existing state.
* **Emergent AI**
   * Differentiator: Multi-agent development engine that breaks down a prompt into specialized logic, UI, and backend tasks.
   * Key Features: Live preview editing, bidirectional GitHub integration, full-stack generation (APIs + UI).
   * Why People Use It: Rapid MVP validation for startups. It provides high velocity but can struggle with regression on deeply complex legacy codebases.
   * UX Flow: Conversational requirement gathering → Agents spin up the app → Side-by-side chat to iterate → Code export.

## 2. The Visual / UI-First Generators
These platforms excel at building beautiful, functional frontends, mapping directly to design and product workflows.

* **Lovable (lovable.dev)**
   * Differentiator: Deeply aligned with UX phases. Bridges the gap between UI design and frontend engineering.
   * Key Features: Component-level visual tweaking, version control, AI-driven animations.
   * Why People Use It: Designers and PMs use it to create interactive, high-fidelity prototypes that compile to actual React code, eliminating "developer handoff."
   * UX Flow: Prompt or Figma import → AI generates layout → User interacts with the live preview directly (clicking components to edit their "vibe" or logic).
* **Vercel v0**
   * Differentiator: Generates isolated, production-ready React components using Tailwind CSS and Shadcn UI.
   * Key Features: Iterative versioning (v1, v2, v3), component forking, and instant CLI command generation to copy the code.
   * Why People Use It: Frontend developers use it to skip writing tedious CSS/markup, generating perfect starting points for complex UI elements.
   * UX Flow: Chat input → v0 streams three UI variations → User picks one and gives follow-up tweaks → Copies `npx` command to drop into their local project.

## 3. The Browser Web-Containers (Scaffolding)
These platforms run full Node environments directly in the browser, eliminating local setup.

* **Replit (Replit Agent)**
   * Differentiator: The pioneer of cloud-native development, now supercharged with an autonomous agent.
   * Key Features: Web-based IDE, autonomous package installation, database hosting, one-click domains.
   * Why People Use It: Time-to-first-run. It's the fastest way to test a Python script or spin up a web app without touching a terminal.
   * UX Flow: Open browser → "Build me a web scraper" → Agent writes files, runs the shell, installs dependencies, and previews the result in a side panel.
* **architect.new (and bolt.new)**
   * Differentiator: Leverages WebContainers to run a full-stack Next.js/Vite environment instantly in the browser.
   * Key Features: Ephemeral environments, instantaneous boot times, direct deployment to edge networks.
   * Why People Use It: Zero lock-in scaffolding. It creates a local-feeling environment in the cloud that can easily be downloaded or pushed to GitHub.
   * UX Flow: URL access → Prompt → Instantly renders a live preview alongside a file explorer; edits are instantly hot-reloaded.

## 4. The AI-Native Pro Tools (For Developers)
These platforms are designed for engineers who want AI to assist with complex architectures rather than abstracting them away.

* **Cursor**
   * Differentiator: A fork of VS Code that indexes your entire local codebase. It understands how your files interact.
   * Key Features: Composer (multi-file generation), CMD+K (inline code generation), CMD+L (codebase-aware chat).
   * Why People Use It: It is currently the industry standard for professional engineers. It refactors across dozens of files instantly.
   * UX Flow: Traditional IDE feel, but you highlight code and hit CMD+K to say "refactor this to use React Context," and it streams a live diff you can accept or reject.
* **Claude Code**
   * Differentiator: Anthropic's autonomous CLI agent. It lives in your terminal, not your text editor.
   * Key Features: Can read files, run bash commands, execute unit tests, and self-correct errors autonomously.
   * Why People Use It: Keeps developers in their existing environments. You can tell it to "find out why the build is failing and fix it," and it will investigate independently.
   * UX Flow: Run `claude` in terminal → Give command → Agent loops through thinking, searching, editing, and testing until complete.
* **Codex (OpenAI / GitHub Copilot)**
   * Differentiator: The foundational model approach that integrates into almost every existing IDE.
   * Key Features: "Ghost text" autocomplete, inline chat, test generation.
   * Why People Use It: Low friction. It predicts what you are about to type based on your current context, acting as a real-time pair programmer.
   * UX Flow: As you type standard code, entire lines or blocks appear in gray text—press `Tab` to accept.
