# 10 — AI Agent-Builder Platforms & Frameworks: Competitive Research (for the Architect 2.0 "Agent section")

> Research date: 2026-09-26. Scope: how the leading no-code and code-first tools let people **build AI agents**, and what that implies for the Agent section of Architect 2.0 (non-technical users and developers).
> Covered: OpenAI AgentKit / Agent Builder / Agents SDK / Agents API, LangGraph + LangSmith (Studio, Fleet, Deployment), CrewAI (framework + AMP/Studio), Google ADK + Gemini Enterprise Agent Platform (formerly Vertex AI), Microsoft Copilot Studio + Microsoft Agent Framework, n8n (AI Agent node, AI Assistant, new "Agents"), Flowise, Langflow, Dify, Relevance AI, Lyzr Agent Studio, Mastra, Vellum, Claude Agent SDK + Claude Managed Agents, Pydantic AI, Agno, and Amazon Bedrock AgentCore (framework-agnostic hosting).
> Method: web search (~45 queries) plus fetched primary sources (official docs, changelogs, launch blogs, pricing pages). Secondary sources (review blogs, tutorials, community threads) are used for sentiment and UI detail. No sign-ups or logins.
> Labels: **[doc]** = official docs or official blog. **[2nd]** = third-party tutorial or review. **(unverified)** = not confirmed from a primary source, or inferred. UI layouts come from docs text and tutorial descriptions, not from my own screenshots, so pixel positions are approximate.

---

## 0. TL;DR: the eight shifts that matter for Architect 2.0

1. **The visual canvas is losing as the main way to *define an agent*.** OpenAI launched Agent Builder, a drag-and-drop canvas, on 2025-10-06. It deprecated it on 2026-06-03 and will shut it down on **2026-11-30**, after about 8 months. OpenAI now points code users to the Agents SDK and no-code users to **Workspace Agents in ChatGPT** (natural language). ChatKit and the Connector Registry survive (https://developers.openai.com/api/docs/guides/agent-builder [doc]; https://montanalabs.ai/news/openai-s-agentkit-and-the-eight-month-lifespan-of-agent-builder/ [2nd]).
2. **Copilot Studio moved the same way.** Microsoft's new **GitHub Copilot harness** agents replace authored "topics, flows and branching logic" with "describe your agent in natural language". They use one Build tab with **Instructions, Knowledge, Tools, Skills, Model, Connected agents and Memory** (https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/overview [doc], page dated 2026-09-21). LangChain's no-code builder (Agent Builder, renamed **LangSmith Fleet** on 2026-03-19) is chat-first, not a canvas. So are Dify's "New Agent" (2026-08-27) and n8n's new **Agents** (Sept 2026).
3. **Canvases survive for deterministic workflows**, not for agent definition. Examples: n8n workflows, Copilot Studio's new workflow designer with **agent nodes**, CrewAI Flows, ADK 2.0 graph workflows, Flowise Agentflow V2, Dify Workflow. The emerging pattern is **"agent = a configured card; workflow = a graph that can call agents as nodes."**
4. **The agent anatomy has converged.** Almost every builder now exposes the same sections: **Instructions → Model → Tools (MCP / connectors / workflows-as-tools) → Knowledge → Skills → Memory → Sub-agents → Triggers/Channels → Guardrails/Approvals**, with **Preview/Test, Evaluate, Monitor and Publish** around them. "Skills" (reusable instruction-plus-file packages) became a first-class section in 2026 across Copilot Studio, n8n, Dify, LangSmith Fleet and Claude.
5. **"Build by chatting, with staged changes" is the new no-code UX.** The user describes the goal. The builder asks clarifying questions, drafts the prompt, tools and triggers, and shows the changes as a **draft to Apply or Discard** (Dify's "Build draft"; Fleet's setup conversation; CrewAI Studio's streaming "AI Thoughts" panel; Copilot's synced Describe/Configure tabs).
6. **Harness plus sandbox is the new developer primitive.** OpenAI Agents SDK (sandbox + harness, April 2026) and then the **Agents API** (public beta, 2026-09-10). Claude Agent SDK plus **Claude Managed Agents** (April 2026). AWS **AgentCore Harness**. LangChain **Deep Agents**. Dify's agent Linux sandbox. Agents now get a file system, a shell and long-running sessions by default.
7. **Framework-agnostic hosting is real**, but mostly in cloud platforms. AWS AgentCore Runtime explicitly hosts CrewAI, LangGraph, LlamaIndex, Google ADK, OpenAI Agents SDK and Strands "and any foundation model", over MCP and A2A (https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html [doc]). Framework vendors (LangSmith, CrewAI AMP, Mastra Platform, Agno AgentOS) host mainly their own framework.
8. **The protocol stack settled into MCP + A2A + AG-UI.** MCP is for tools. **A2A** is for agent-to-agent calls: a Linux Foundation project with 150+ organisations by April 2026, and GA in Copilot Studio in May 2026. **AG-UI** connects an agent backend to a frontend: CopilotKit's protocol, with first-party integrations in Microsoft Agent Framework, Google ADK, AWS Strands/AgentCore, LangGraph and CrewAI (https://www.linuxfoundation.org/press/a2a-protocol-surpasses-150-organizations-lands-in-major-cloud-platforms-and-sees-enterprise-production-use-in-first-year [doc]; https://github.com/ag-ui-protocol/ag-ui [doc]).

**Implication for Architect 2.0 (details in §8):** the Agent section should be a **form-plus-chat "Agent Card"** for non-technical users. It should have a **Code mode that is a real framework project** (LangGraph / CrewAI / OpenAI Agents SDK / ADK / Mastra / Claude Agent SDK) for developers. Both modes should share one spec, one Test/Evaluate/Monitor/Deploy lifecycle, and one "where this agent is used in my app" map. Architect already has a head start: every Architect agent is a Lyzr Studio agent, and GitAgent/OpenGAP already exports to several frameworks (see `01-architect-new.md`).

---

## 1. Positioning: what makes each one different

| Platform | Primary way to define an agent | One-line positioning / differentiator |
|---|---|---|
| **OpenAI AgentKit** (Agent Builder, ChatKit, Evals, Connector Registry) | Canvas (being retired) → Agents SDK code / Workspace Agents (NL) | Model vendor's full stack. The visual builder dies on 2026-11-30. **ChatKit** (embeddable chat UI with widgets) and the **Connector Registry** survive [doc]. The durable layers are the Agents SDK, the new **Agents API** (Codex harness as a managed service, public beta 2026-09-10) and hosted sandboxes (https://openai.com/index/introducing-the-agents-api/ [doc, title only; details 2nd: https://xnews.sk/en/2026/09/11/openai-agents-api-public-beta-cloud-agents/]). |
| **LangGraph + LangSmith** | Code (graph state machine); Studio for visual debugging; **Fleet** for no-code | The de-facto "serious" framework. Low-level durable graphs, checkpoints and time travel, plus the most complete observability/eval product (LangSmith). Fleet adds no-code agents with identity, sharing and an approvals Inbox (https://www.langchain.com/blog/introducing-langsmith-fleet [doc]). |
| **CrewAI** (OSS + AMP) | Code (role-based "crews" + event-driven "Flows"); **Crew Studio** no-code (chat + canvas) | Opinionated multi-agent metaphor (roles, goals, tasks). Studio generates crews from a sentence, "drawing on 700K+ use-case patterns", with 1,000+ connectors. The ZIP export is **one-way** (https://docs-platform.crewai.com/platform/en/features/crew-studio [doc]; https://crewai.com/blog/crew-studio-automated-agent-builder [doc]). |
| **Google ADK + Gemini Enterprise Agent Platform** | Code (ADK: Python/TS/Go/Java/Kotlin) + experimental **Visual Builder**; no-code **Agent Designer** | Multi-language, open, A2A-native. ADK 2.0 adds graph workflows. Vertex AI was renamed **Gemini Enterprise Agent Platform** (2026-04-22). It bundles ADK, the low-code Agent Studio, the no-code Agent Designer, Agent Runtime, Memory Bank, Agent Identity and Agent Gateway (https://adk.dev/ [doc]; https://cloud.google.com/blog/products/ai-machine-learning/the-new-gemini-enterprise-one-platform-for-agent-development [doc]). |
| **Microsoft Copilot Studio + Agent Framework** | NL-first "Build" tab (new harness) or classic topics; code via **Microsoft Agent Framework** (AutoGen + Semantic Kernel merged; 1.0 GA ~2026-04-03 [2nd]) | Enterprise and M365 distribution: publish into Teams/M365, with Power Platform governance, computer-using agents (GA May 2026) and A2A GA (https://www.microsoft.com/en-us/copilot/blog/copilot-studio/new-and-improved-computer-using-agents-a-new-workflows-experience-and-real-time-voice-experiences/ [doc]). |
| **n8n** | Canvas workflows with an AI Agent node; new chat-built **Agents** tab (Sept 2026); **AI Assistant** builds workflows from NL (preview 2026-07-09) | Automation-first: 1,000+ integrations, self-hostable, execution-based pricing. "Define an agent once and use it anywhere": chat, as a workflow node, Slack/Telegram/Linear/Discord, or on a schedule (https://blog.n8n.io/introducing-n8n-agents/ [doc]). |
| **Flowise** (Workday since 2025-08-14) | Canvas (Agentflow V2, 14+ native nodes) | Open-source, LangChain-rooted visual builder, now owned by Workday. Roadmap risk toward HR/finance use cases (https://newsroom.workday.com/2025-08-14-Workday-Acquires-Flowise,-Bringing-Powerful-AI-Agent-Builder-Capabilities-to-the-Workday-Platform [doc]). |
| **Langflow** (IBM/DataStax) | Canvas of components + Playground; 1.9 adds an NL **Langflow Assistant** and the Flow DevOps Toolkit | Open-source visual Python builder. Flows can be exported **as MCP servers**. The hosted DataStax Langflow was deprecated in March 2026, while OSS continues (https://www.langflow.org/blog/langflow-1-9/ [doc]; https://www.betterclaw.io/blog/langflow-alternative-2026 [2nd]). |
| **Dify** | "New Agent" built by chat (2026-08-27) + Workflow canvas + Knowledge Pipeline | Open-source "LLMOps plus agents". Agents are standalone apps with a Linux sandbox, Skills and an Agent Roster. They publish as a web app, an API, or a node inside workflows (https://dify.ai/blog/introducing-new-dify-agent [doc]). |
| **Relevance AI** | Form ("Build" tab) + Flow Builder + **Invent** (NL agent that builds agents) + Workforce canvas | "AI workforce" for go-to-market teams. **Evals auto-generated from production cases can block publishing**, and cost per task is shown (https://relevanceai.com/product [doc]). |
| **Lyzr Agent Studio** (the engine behind Architect) | Studio Builder (form) + Conversational Builder; Manager Agent + **SuperFlow** (DAG) | Built-in Responsible AI (PII, hallucination manager), three KB types (RAG, Knowledge Graph, Text-to-SQL) and an Agent Simulation Engine. New in 2026: **OpenController** ("control plane for agent sprawl") and Agentic OS (https://docs.lyzr.ai/enterprise/agent-studio/introduction [doc]; https://www.lyzr.ai/ [doc]). |
| **Mastra** | TypeScript code + **Studio** (with an Agent Editor for no-code prompt/tool edits) | TS-first framework for web developers. Studio became a shared team workspace, and the Mastra Platform (2026-04-09) adds Server (deploy as REST) and a Memory Gateway (https://mastra.ai/blog/announcing-mastra-platform [doc]). |
| **Vellum** | NL **Agent Builder** → synced **visual graph + Python SDK code** | The clearest two-way visual/code sync: "edit the graph directly in the builder, or pull the code into your IDE using the Vellum CLI… both views stay in sync" (https://www.vellum.ai/blog/introducing-vellum-copilot [doc]). |
| **Claude Agent SDK + Claude Managed Agents** | Code (Agent SDK = Claude Code harness as a library) / REST-configured, **versioned agent objects** (Managed Agents) | Harness with built-in file/shell/web tools, subagents, hooks and permissions. Managed Agents is built on four concepts, **Agent, Environment, Session, Events**. It hosts the loop plus a cloud *or self-hosted* sandbox, and you can **steer or interrupt** mid-run. It adds versioned agents, vaults, memory stores, outcome graders, multi-agent coordinators and **cron "scheduled deployments"**. It is beta, and not eligible for ZDR/HIPAA BAA because it is stateful (https://platform.claude.com/docs/en/managed-agents/overview [doc]; launch 2026-04-08 [2nd: https://alternativeto.net/news/2026/4/anthropic-launches-claude-managed-agents-to-accelerate-ai-agent-development-and-deployment]). |
| **Pydantic AI** | Python code (type-safe, FastAPI-style) | Type safety and structured outputs, durable execution (Temporal and others), Logfire/OTel tracing. v1.0 shipped 2025-09-04 (https://github.com/pydantic/pydantic-ai/releases/tag/v1.0.0 [doc]). |
| **Agno** | Python SDK + **AgentOS** runtime + browser Control Plane | "Self-driving agent platform that runs in your cloud". A FastAPI runtime with 80+ endpoints, an MCP server, tracing, scheduling, approvals and RBAC. The Control Plane connects the browser directly to your runtime, so no data goes to Agno (https://docs.agno.com/agent-os/control-plane [doc]). |
| **Amazon Bedrock AgentCore** | Bring any framework (or the managed **Harness**) | The most explicitly **framework-agnostic** hosting. Services: Runtime, Harness, Memory, Gateway (APIs → MCP), Identity, Code Interpreter, Browser, Observability (OTel), Evaluations, Optimization (A/B), Policy (Cedar-compatible), Registry and Payments [doc]. |

---

## 2. Who uses them and why (jobs-to-be-done)

**Non-technical / business builders** (Copilot Studio makers, Fleet, Gemini Agent Designer, Relevance, Lyzr Studio, n8n Agents, CrewAI Studio, Dify New Agent):
- **JTBD: "Automate the repetitive part of my job with an assistant that can act in my tools."** Examples: email triage, meeting prep, CRM updates, applicant screening. Fleet's featured templates are Executive Assistant, Software Engineer, Brand Copywriter and Applicant Screening (https://docs.langchain.com/langsmith/fleet/changelog [doc]).
- **JTBD: "Share an agent with my team, safely."** Fleet permissions are Can clone / Can run / Can edit. It has "Claws" identity (agent uses fixed service credentials) versus "Assistant" identity (acts on behalf of each user via OAuth) [doc].
- **JTBD: "Keep a human in control."** Approval inboxes (Fleet Inbox; the Gemini Enterprise **Inbox**; n8n human approvals; Relevance escalations).
- **JTBD: "Prototype for stakeholders, then hand off to engineers."** CrewAI names this the core Studio use case ("prototyping and reviewing workflows before hand-off to developers") [2nd: https://aiagentsquare.com/agents/crewai].

**Developers / AI engineers** (LangGraph, CrewAI OSS, ADK, OpenAI/Claude SDKs, Mastra, Pydantic AI, Agno, Microsoft Agent Framework):
- **JTBD: "Control the loop, state and failure modes."** Graphs, checkpoints and durable execution (LangGraph; Pydantic AI + Temporal; ADK 2.0 "separates execution control from language processing") [2nd: https://byteiota.com/google-adk-2-0-graph-workflows-ship-langgraph-has-a-fight/].
- **JTBD: "See exactly what the agent did and prove it got better."** Traces, datasets, experiments and LLM judges (LangSmith, Mastra Studio datasets/experiments, Logfire, AgentCore Evaluations).
- **JTBD: "Ship it as a service."** One-click deploy to LangSmith Deployment, CrewAI AMP, Mastra Server, AgentOS, AgentCore Runtime or Managed Agents, then expose it as REST, MCP, A2A or chat channels.
- **Framework fatigue is real.** One Reddit digest: builders "spent 8 months evaluating AutoGen, LangGraph, CrewAI, PydanticAI, Swarm, and Agno with no clear winner" (https://dev.to/yetta_pease_fc74c2260291a/what-reddits-agent-builders-were-actually-debugging-this-week-3n4p [2nd]). This argues for **letting developers pick a framework without penalty**, which is exactly the assignment's "any framework" requirement.

**Mixed teams (the gap Architect 2.0 can own).** Vellum, Mastra's Agent Editor, CrewAI Studio's export, the LangGraph + Fleet pair and Lyzr Studio + Architect all try to let a PM edit prompts and tools while engineers own the code. Only Vellum claims true two-way sync [doc].

---

## 3. Feature inventory, grouped by area

> Generic vibe-coding areas (live app preview, device toggles, custom domains) mostly don't apply to agent builders. The inventory below is organised around the agent lifecycle. Items from the brief's generic list are mapped where they exist.

### 3.1 Onboarding / creation entry points
- **Describe-to-build (NL):**
  - Copilot Studio: the Describe tab is synced with the Configure tab ([doc] https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-first-bot); the new harness is "natural-language-first" [doc].
  - Fleet: "start with your request… asks clarifying questions" and drafts the prompt, tools, triggers and subagents (https://www.langchain.com/blog/langsmith-agent-builder [doc]).
  - CrewAI Studio: prompt, voice input via a mic icon, and built-in prompt templates [doc].
  - Dify: builds by chat and writes a `build_note.md` of changes [doc].
  - n8n: "describe what the agent should do in plain language". The n8n Assistant can recommend "workflow vs agent" [doc].
  - Relevance: **Invent** [doc].
  - Vellum: Agent Builder may ask clarifying questions [doc].
  - Gemini: Agent Designer, "using natural language or a visual interface" [2nd].
  - ADK Visual Builder: a Gemini-powered assistant panel [doc].
- **Templates / blueprints:**
  - OpenAI Agent Builder: a Templates list next to the Drafts and Published tabs [2nd: Composio].
  - Fleet: a template gallery (Executive Assistant, Software Engineer…) [doc].
  - Lyzr: a blueprint library [2nd].
  - n8n: a large workflow template gallery.
  - Relevance: prebuilt agent templates.
- **Blank form:** Dify ("Create from Blank" → name, role, description) [doc]; Copilot Configure tab; n8n "Create Agent".
- **Code scaffolds:** `langgraph dev` (LangGraph CLI), `crewai create`, `adk web` (http://localhost:8000/dev-ui), `mastra dev`. The CrewAI CLI now initialises Git repos and opens the deployment page after `crewai deploy` [2nd: https://releasebot.io/updates/crewai].
- **Choice made at creation that can't be undone:** in Copilot Studio you pick the harness (standard vs GitHub Copilot) at creation, and "Agents created with the GitHub Copilot harness can't be transferred to the standard harness, and vice versa" [doc]. That is a UX trap to avoid.

### 3.2 Configuration surface (the "agent anatomy")
| Section | Notable implementations |
|---|---|
| **Instructions** | Copilot: a rich-text editor with a template prompting role, scope, tone and decision triggers [2nd: https://learnpower.ai/articles/2026-copilot-studio-agent-builder-guide]. Dify: prompt with `/` to reference specific tools [doc]. Relevance: "Core Instructions" vs "Flow Builder" (step-by-step SOP) [2nd]. |
| **Model** | Dropdown everywhere. Fleet: a **Fast / Pro / Max** picker, with LCU-billed models separated from bring-your-own [doc]. Relevance: fallbacks, temperature, reasoning modes [doc]. n8n: any model or n8n Gateway credits [doc]. |
| **Tools** | MCP everywhere in 2026. Copilot Tools dialog tabs: **Featured, MCP, Connectors, Workflows** [2nd]. n8n: MCP servers, n8n integrations, or **existing workflows as tools** [doc]. Dify: Dify tools, plugins, APIs, MCP, Workflows [doc]. OpenAI Agent Builder nodes: File Search, Guardrails, MCP [2nd]. AgentCore Gateway turns APIs and Lambdas into MCP tools [doc]. |
| **Knowledge (RAG)** | File upload (n8n: CSV/PDF/MD/TXT; Dify limits: docs 15 MB, images 10 MB, video 100 MB, audio 50 MB) [doc]. Lyzr offers three KB types: Classic RAG, **Knowledge Graph (Neo4j)**, **Semantic Model (Text-to-SQL)** [doc]. Gemini separates Tools (actions) from Knowledge ("data the agent can read") [2nd]. Dify's Knowledge Pipeline is a visible RAG ETL canvas [doc]. |
| **Skills** (new in 2026) | Reusable instructions plus reference files/scripts, loaded on demand. Copilot Skills [doc]; n8n Skills "shareable across agents" [doc]; Dify Skills (up to 20 library skills, or `.zip` up to 50 MB) [doc]; Fleet workspace skills [doc]; Claude Agent Skills (`.claude/skills` loaded from a GitHub repo in Managed Agents) [doc]. |
| **Memory** | Copilot: a Memory toggle (preview) [doc]. n8n: session memory plus optional cross-session memory [doc]. Gemini: **Memory Bank, off by default** [2nd]. Claude Managed Agents: memory stores with versions/redaction and "Dreaming" consolidation (May 2026) [2nd]. Mastra: Memory Gateway [doc]. Flowise: full / windowed / summarised memory [doc]. |
| **Sub-agents / multi-agent** | Copilot "Connected agents" (disabled until the agent is saved) [2nd]. n8n sub-agents [doc]. Fleet subagents [doc]. CrewAI crews plus router nodes [doc]. Lyzr Manager Agent / SuperFlow [doc]. OpenAI SDK handoffs. ADK Sequential / Parallel / Loop agents [doc]. Claude Managed Agents coordinator roster, including `{"type":"self"}` for self-delegation [doc]. |
| **Triggers & channels** | Fleet: email, Slack, schedule, webhook [doc]. n8n: Slack, Telegram, Linear, Discord, schedule [doc]. CrewAI AMP: Gmail, Drive, Calendar, Outlook, Teams, Slack, Salesforce, HubSpot, Zapier and webhooks, each with a **toggle** per trigger (https://docs.crewai.com/en/enterprise/guides/automation-triggers [doc]). Gemini: manual / schedule (cron) / event [2nd]. Dify triggers (Nov 2025) [doc]. |
| **Guardrails** | OpenAI Guardrails node (PII, hallucination and jailbreak checks were praised by testers) [2nd]. Lyzr Responsible AI (PII redaction, toxicity, prompt injection, hallucination manager) [2nd]. AgentCore **Policy** (natural language or Cedar-compatible rules intercepting every tool call) [doc]. Gemini Model Armor [doc]. |
| **Human-in-the-loop** | OpenAI **User Approval** node. Flowise **Human Input** node plus checkpointing [doc]. Fleet **Inbox** and approvals in Slack [doc]. Gemini "tool execution mode: auto vs ask first" [2nd]. Claude Managed Agents permission policies `always_allow` / `always_ask` / `auto` [doc]. Relevance approvals with conditional and **cost-based pauses** [doc]. |
| **Identity & secrets** | Fleet Claws vs Assistant [doc]. AgentCore Identity (Okta, Entra, Cognito, Auth0) [doc]. Claude Managed Agents **vaults**: secrets substituted at egress, never visible in the sandbox [doc]. Dify environment variables [doc]. |
| **Budgets / limits** | Claude Managed Agents dollar-denominated **session budgets** that pause at `budget_reached` [doc]. Relevance autonomy step limits [doc]. CrewAI `max_iter`, `max_execution_time`, `max_rpm` [2nd]. |
| **Sandbox / computer** | Dify Linux sandbox (E2B support in v1.17) [doc]. Fleet agent-scoped sandboxes and "Fleet computers" [doc]. OpenAI Agents SDK sandbox (Apr 2026) and Agents API hosted sandboxes, with partners Blaxel, Cloudflare, Daytona, DigitalOcean, E2B, Modal, Oracle, Runloop and Vercel [2nd]. AgentCore Code Interpreter and Browser [doc]. Copilot computer-using agents [doc]. |

### 3.3 Playground / testing
- **Split build + preview chat** is standard:
  - Copilot's **Preview** tab ("Try it") [doc].
  - OpenAI's top-bar **Preview** button opens a chat that shows intermediate steps [2nd].
  - n8n's "docked agent preview chat" (v2.36, Aug 2026) [2nd: https://releasebot.io/updates/n8n].
  - Langflow's **Playground** button (needs a Chat Input component) (https://docs.langflow.org/concepts-overview [doc]).
  - Gemini Agent Designer's Test panel: "see which Tools it called and which Knowledge sources it pulled from" [2nd].
- **Node-level testing:** Copilot's new workflow designer has "inline configuration and node-level testing" [doc]; Dify has "Last Run" and "Variable Inspect" per node [doc].
- **Time-travel debugging:** LangSmith Studio rewinds to a checkpoint, edits state and re-runs; it has Graph mode vs Chat mode (https://docs.langchain.com/langsmith/studio [doc]).
- **Simulated users:** Lyzr Agent Simulation Engine (personas and scenarios, SDK on GitHub) [doc]. Relevance "Evals… with simulated conversations" [doc]. ADK "user simulation, environment simulation" [doc]. Gemini "Agent Simulation" [doc].

### 3.4 Evals
- **LangSmith:** datasets, experiments, online evaluators; "Tuned Evaluators" billed at 0.01 LCU per run (https://www.langchain.com/pricing [doc]).
- **OpenAI Evals:** datasets, trace grading, prompt optimisation. The **standalone Evals product is also being wound down** alongside Agent Builder [2nd: Montana Labs].
- **Relevance:** "auto-generates test suites from production cases, **blocks failing versions from publishing**, monitors production drift via sampling" [doc]. This is the strongest publish-gating pattern found.
- **Mastra:** datasets of runs (ground truth, edge cases, regressions) with experiments that replay against a new prompt, model or tool config and **compare side by side** [doc snippet: mastra.ai].
- **Copilot Studio:** an **Evaluate** tab with test sets [doc].
- **n8n:** Evaluations for AI workflows, with "execution scenarios for first-class agents in evals" (v2.35) [2nd].
- **AgentCore:** Evaluations plus **Optimization** (AI-suggested prompt and tool-description changes, validated by A/B traffic splitting) [doc].
- **Claude Managed Agents:** "outcomes", where a separate grader iterates the agent against a rubric until it passes [doc].

### 3.5 Tracing / observability
- **OpenAI Agents SDK:** every run emits a trace (model calls, tool calls, handoffs, guardrails) viewable in the OpenAI dashboard. The processor interface can export elsewhere (https://openai.github.io/openai-agents-python/tracing/ [doc]).
- **CrewAI Studio:** **Output** and **Traces** tabs; an Execution view with an event timeline and Details / Messages / Raw Data sections [doc].
- **Dify:** three tiers (single-run logs/traces; node Last Run / Variable Inspect; system trends of usage, quality, performance and cost). Tracing adapters for Phoenix and LangSmith (v1.17) [doc].
- **n8n:** "Each session shows every step the agent took, which tools it called, and the input and output of each call" [doc].
- **Copilot:** a **Monitor** tab (recent tasks, files accessed, activity) [doc].
- **OpenTelemetry is the lingua franca:** AgentCore Observability, Logfire (Pydantic AI), Relevance OTel export, Agno traces.

### 3.6 Versioning / history / rollback
- **OpenAI Agent Builder:** autosave; **Publish creates a new major version snapshot**; API calls can pin older versions [doc].
- **n8n Agents:** draft vs published, version history with restore and revert, RBAC for editor vs publisher [doc].
- **Mastra Agent Editor:** save versions, compare side by side, roll back [doc snippet].
- **Claude Managed Agents:** every update creates an immutable version, and sessions pin to one [doc].
- **Dify:** autosave then publish; a draft→publish lifecycle for workspace skills (v1.17) [doc].
- **Relevance:** version history across agents, tools and workforces [doc].
- **CrewAI:** only the Studio project keeps versioning. After a ZIP export and custom-code deploy, the automation becomes "a separate code-sourced automation without the Studio visual editor, versioning, or validation" [doc].

### 3.7 Deployment / distribution
- **API endpoint:** universal (Dify Access Point tab; Mastra Server REST + OpenAPI; LangSmith Deployment; AgentOS FastAPI; CrewAI AMP; Managed Agents sessions API).
- **Embeddable chat:** OpenAI **ChatKit**, with widgets for cards, forms and lists, theming, and a self-hosted Python server (https://developers.openai.com/api/docs/guides/chatkit [doc]). Dify web app / embed [doc]. Relevance widget [doc]. Langflow embed and shareable Playground links [doc].
- **Chat channels:** Slack (Fleet `@vendor-intake` style bot handles; n8n; Agno), Teams (Copilot), Telegram/Discord/Linear (n8n), Slack slash commands (CrewAI) [doc].
- **Export as MCP server:** Langflow (any flow → MCP server) [doc]; CrewAI "export as MCP" and "export React components" after publishing [doc]; AgentOS ships an MCP server [doc].
- **Export as code:** OpenAI Agent Builder's "Code" button → Agents SDK in TS or Python [2nd]; CrewAI ZIP (one-way) [doc]; ADK Visual Builder → YAML Agent Config plus Python tools [doc]; Vellum CLI pull (two-way) [doc].
- **Scheduled / background runs:** Claude Managed Agents deployments (cron, pause/auto-pause, run records) [doc]; Fleet schedules with presets and cron [doc]; n8n schedules [doc].

### 3.8 Protocols
- **MCP:** universal as a client. As a *server*: Langflow, AgentOS, CrewAI export, Dify (two-way MCP since v1.6, Jul 2025) [doc].
- **A2A:** ADK (native), Copilot Studio (GA May 2026), Gemini Agent Runtime, AgentCore Runtime [doc].
- **AG-UI:** Microsoft Agent Framework, ADK, AWS Strands/AgentCore, LangGraph, CrewAI, Mastra, Pydantic AI, Agno, AG2 [2nd: https://www.copilotkit.ai/ag-ui].

### 3.9 Pricing models (2026)
- **OpenAI:** API tokens plus tools. Hosted sandboxes bill at container rates. Workspace Agents moved to credits from 2026-07-06 [2nd: https://www.techwyse.com/news/ai-search/openai-chatgpt-workspace-agents-launch-2026].
- **LangSmith:**
  - Developer: $0, 1 seat, 5k traces/mo, 5 LCU of Fleet.
  - Plus: $39/seat/mo, unlimited seats, 10k traces, 25 LCU of Fleet, 1 free small deployment.
  - Enterprise: custom. 1 LCU = $1.50 [doc].
- **CrewAI AMP:** Basic is free (Studio, Copilot, GitHub integration, tracing, guardrails, 50 executions/mo); Enterprise is custom (up to 30k executions). A $25 Professional tier was reportedly removed in spring 2026 [2nd: https://www.lindy.ai/blog/crew-ai-pricing]. **One execution = one crew kickoff**, regardless of tokens [2nd].
- **n8n Cloud:**
  - Starter $20/mo (annual) for 2,500 executions.
  - Pro $50 for 10k.
  - Business $667 for 40k.
  - AI credits included. Agents: "One turn with an agent is one execution. Tool calls to your workflows and to sub-agents don't count separately" [doc + 2nd: https://www.cloudzero.com/blog/n8n-pricing/].
- **Relevance AI:**
  - Pro $19 annual / $29 monthly: 2,500 Actions and $20 Vendor Credits.
  - Team $234 / $349: 7,000 Actions and $70 credits.
  - Extra Actions cost $80 per 1,000. **The Free plan is retired** [doc: https://relevanceai.com/docs/get-started/pricing].
- **Mastra Platform:** free Starter; Teams $250/mo (250 CPU-hours, 100 GB egress, 1M memory tokens) [doc].
- **Copilot Studio:** "messages" renamed to **Copilot Credits** on 2025-09-01, which now scale with agent work rather than turns. Makers complain that old ROI models no longer compare [2nd: https://licenseq.com/copilot-studio-licensing/].
- **Claude Managed Agents:** token rates plus **$0.08 per active session-hour** (unverified; secondary: https://hatchworks.com/blog/claude/claude-agent-sdk-and-managed-agents/).
- **AgentCore:** consumption-based, no minimums [doc].

### 3.10 Enterprise / governance
- RBAC, audit logs, SSO/SAML, data residency and VPC/on-prem are table stakes (Relevance, Lyzr, CrewAI AMP, Dify Enterprise, Copilot/Power Platform).
- **New in 2026: "agent sprawl" control planes and registries.** Lyzr **OpenController** [doc]. AgentCore **Registry** (publish/review/approve agents, MCP servers and skills) [doc]. Gemini **Agent Identity** (cryptographic IDs per agent) and **Agent Gateway** [doc]. Fleet agent identity and access profiles [doc].

### 3.11 Code-first framework quick comparison
| Framework | Lang | Core abstraction | Local dev UI | Multi-agent | Durable / HITL | Managed hosting |
|---|---|---|---|---|---|---|
| LangGraph (+ LangChain 1.0 `create_agent`, middleware; Deep Agents) | Py / TS | State graph; middleware hooks (`before_model`, `wrap_tool_call`, `after_model`…) | **LangSmith Studio** (graph/chat modes, time travel) | Subgraphs, supervisor, Deep Agents subagents | Checkpointers, interrupts | LangSmith Deployment (ex-LangGraph Platform, renamed Oct 2025) |
| CrewAI | Py | Agents (role/goal/backstory) + Tasks → Crew; **Flows** (event-driven) | Crew Studio (cloud) | Crews, hierarchical manager | HITL feedback; guardrails | CrewAI AMP |
| OpenAI Agents SDK | Py / TS | Agent + Tools + **Handoffs** + **Guardrails** + Sessions; harness + sandbox (Apr 2026) | Traces dashboard (no local canvas) | Handoffs, agents-as-tools | Approvals, sessions | Agents API (beta Sept 2026) |
| Google ADK 2.0 | Py / TS / Go / Java / Kotlin | LlmAgent + Sequential / Parallel / Loop; **graph Workflow runtime** (2.0) | `adk web` dev UI + Visual Builder (experimental) | Sub-agents, A2A | Callbacks, eval sets | Agent Runtime (Agent Engine), Cloud Run, GKE |
| Microsoft Agent Framework 1.0 | Py / .NET | Agents + graph workflows (SK plumbing + AutoGen orchestration) | DevUI (unverified) | AutoGen patterns | Filters, telemetry | Foundry Hosted Agents |
| Mastra | TS | Agents, Workflows, Tools, Memory, RAG, evals | **Studio** (`mastra dev`) with Agent Editor | Agent networks | Workflow suspend/resume | Mastra Server / Platform |
| Pydantic AI | Py | Typed Agent + deps injection + structured output | Logfire | Agent delegation, pydantic-graph | Durable execution (Temporal), tool approval | Self-host |
| Agno | Py | Agents, Teams, Workflows | **Control Plane** (browser → your runtime) | Teams | Approvals, schedules | AgentOS (your cloud) |
| Claude Agent SDK | Py / TS | `query(prompt, options)` over the Claude Code harness; built-in Read/Write/Edit/Bash/Grep/Web tools, subagents, hooks, permissions | none bundled (Console session viewer for Managed Agents) | Subagents | Hooks, permission modes | Claude Managed Agents (hosted loop + sandbox) |

---

## 4. UI layout: concrete screen descriptions

> Sources are docs text and tutorials, not my own screenshots. Treat exact positions as approximate unless marked [doc].

### 4.1 OpenAI Agent Builder (retiring 2026-11-30)
- **Workflows home:** tabs for **Templates**, **Drafts** and **Published Workflows** [2nd: Composio].
- **Builder:**
  - **Left sidebar:** node palette in four groups: *Core* (Start, Agent, End, Note), *Tools* (File Search, Guardrails, MCP), *Logic* (If/Else, While, User Approval), *Data* (Transform, Set State).
  - **Centre:** the canvas with typed edges.
  - **Right panel:** configuration of the selected node.
  - **Top bar:** **Preview** (opens a chat with intermediate steps), **Evaluate** (trace graders), **Code** (export to Agents SDK Python/TS), **Publish**.
  - A pencil icon generates a JSON output schema from natural language [2nd: https://composio.dev/content/openai-agent-builder-step-by-step-guide-to-building-ai-agents-with-mcp; doc for Evaluate/Publish].
- **Tester complaints:** you can't click a node to inspect its execution; the UI is "not user-friendly and intuitive at all"; "even more technical than n8n" (https://www.finalroundai.com/blog/openai-agent-builder-what-software-developers-are-saying-after-testing [2nd]).

### 4.2 Microsoft Copilot Studio: GitHub Copilot harness agent (2026)
- **Top tabs** (left to right): **Build | Preview | Evaluate | Monitor** [doc].
- **Top-right:** Publish, Save, Share, and an overflow menu (Settings, Keyboard shortcuts, Download, Delete agent) [2nd: LearnPower].
- **Build tab:** two panes [2nd: LearnPower].
  - **Left / main:** a rich-text **Instructions** editor (bold, italic, lists, code, links) with a scaffold template.
  - **Right sidebar:** collapsible sections **Model, Skills, Tools** (dialog tabs Featured / MCP / Connectors / Workflows), **Knowledge** and **Connected agents** (locked until first save), each with a "+" button.
- **Feedback button** in the top toolbar [doc].
- **Classic agents** keep an Overview page (Describe/Configure), Topics, Actions and a docked Test pane (the long-standing layout; exact positions unverified).
- **Workflows** (May 2026): "a single, unified visual canvas with node-by-node testing and robust versioning". Agent nodes let a deterministic workflow hand open-ended parts to an agent [doc].

### 4.3 CrewAI Crew Studio [doc]
- **Three panels:**
  - **Left: "AI Thoughts"**, streaming the builder's reasoning as it designs the crew.
  - **Centre: Canvas**, with agents and tasks as connected nodes.
  - **Right: Resources**, drag-and-drop agents, tasks and tools.
- **Chat and canvas share state**, so users can switch between them freely.
- **Prompt box:** includes a mic icon for voice and built-in prompts.
- **Run:** opens an **Execution view** (event timeline; Details / Messages / Raw Data).
- **Actions:** **Publish** and **Download** (ZIP, one-way).
- **After publishing, the Options menu offers:** chat with crew, export React component, export as MCP.
- **Node types** in the automated builder (July 2026): single-agent, crew and router [doc].

### 4.4 Google ADK Visual Builder (experimental, ADK Python ≥ 1.18) [doc]
- **Three panels:**
  - **Left:** edit the component values of the selected agent.
  - **Centre:** add and arrange components (Root, LLM, Sequential, Loop and Parallel agents; tools; callbacks).
  - **Right:** an **AI assistant** that takes prompts to modify the agent.
- **Output:** writes `root_agent.yaml`, sub-agent YAMLs and a `tools/` Python directory.
- **Availability:** only while running `adk web` locally, not in headless deploys.

### 4.5 Gemini Enterprise Agent Designer (no-code) [2nd: https://findskill.ai/blog/gemini-enterprise-agent-designer-5-minute-tutorial/]
- **Seven sequential panels:** Name & Instructions → Tools → Knowledge Sources → Triggers → Permissions → Test → Deploy (Gemini Enterprise chat, org gallery, embeddable link).
- **"Hidden" settings:** Memory Bank (off by default), Tool Execution Mode (auto vs ask first), knowledge freshness (24 h cache).
- **An Inbox** monitors agents and long-running workflows [doc].

### 4.6 LangSmith Studio (developer) [doc]
- **Graph mode:** a rendered graph with nodes traversed, intermediate state, and a thread list.
- **Chat mode:** for `MessagesState` graphs.
- **Other features:** assistants (config variants), prompt editing in place, time-travel (fork from a checkpoint), "run experiments over a dataset", memory management.
- **Launch and deploy:** starts via `langgraph dev`, with one-click deploy to LangSmith Cloud.

### 4.7 LangSmith Fleet (no-code) [doc: changelog]
- **Home:** agent cards (the action is labelled "Configure"), a templates gallery and a welcome modal.
- **Agent screen:** a thread sidebar and a chat centre with a **Configure panel**: sidebar-based editor sections for prompt, tools, skills, triggers (schedule presets + cron, webhooks), channels (Slack/Teams) and access profiles.
- **File edits** render as syntax-highlighted diffs.
- **Approvals** appear inline in chat and in Slack.
- **Usage dashboard** with an LCU spend meter.
- **Model picker:** Fast / Pro / Max, with icons.

### 4.8 Dify New Agent [doc]
- **Agents console:** filter by status, creator and update time.
- **Agent page:**
  - **Configure** panel sections: Model, Prompt, Skills, Files, Tools, Advanced (env vars).
  - **Build-by-chat** panel with a **Build draft** showing staged changes, with **Apply / Discard**.
  - **Preview** before publishing.
  - **Access Point** tab (web app, embed, API), plus "which workflows consume it".

### 4.9 n8n Agents (Sept 2026) [doc]
- **Navigation:** an **Agents tab** inside a project, next to Workflows; **Create Agent** opens the builder. Alternatively, ask the n8n Assistant from the left sidebar.
- **Configuration order in the docs:** name and icon → model → instructions → tools → capabilities (web search, skills) → knowledge upload → memory → sub-agents. **Channels** and **Schedules** apply once published (https://docs.n8n.io/build/build-and-manage-agents).
- **Other surfaces:**
  - **Preview**, for testing before publishing (a "docked agent preview chat" arrived in v2.36).
  - A **Sessions tab** showing conversation history and every tool call's input and output.
  - Draft vs published, with only published versions running in production; version history.
- **Limits:** the feature is labelled **Preview** ("can make mistakes, and their behavior may change"). Queue mode isn't supported for agents on self-hosted. Each agent turn counts as one execution against the shared workflow quota.
- **The workflow canvas itself** (for comparison): a node canvas with a right-side node panel and a bottom execution log (well known; exact 2026 layout unverified).

### 4.10 Langflow [doc]
- **Main area:** a central canvas with a components menu. The docs don't pin its position; it is historically a left sidebar (unverified).
- **Top-area controls:** a **Playground** button and a **Share** menu (API access, export, **MCP Server**, embed, shareable Playground).
- **Other controls:** canvas controls (zoom, lock), Add Note, Logs.

### 4.11 Flowise Agentflow V2 [doc]
- **Canvas nodes:** Start, LLM, Agent, Tool, Retriever, HTTP, Condition, Condition Agent, Iteration, Loop, Human Input, Direct Reply, Custom Function, Execute Flow.
- **Flow state:** a shared `$flow.state` referenced with `{{ }}`.

### 4.12 Mastra Studio / Agno Control Plane
- **Mastra:** Studio lists Agents / Workflows / Tools. Chatting with an agent shows traces and evals. The **Agent Editor** lets non-coders edit prompts and tools and save, compare and roll back versions. It can be shared via a Mastra Cloud sandbox link [doc: https://mastra.ai/blog/agent-studio].
- **Agno:** "select an agent from the right panel and start a conversation". It covers sessions, knowledge, memory, evals, approvals and schedules, plus a live drag-and-drop canvas for agents, teams and workflows [doc: https://docs.agno.com/agent-os/control-plane].

### 4.13 Visual design language (observed trends; mostly unverified)
- **Enterprise builders** (Copilot Studio, Gemini) use their suite design systems: Fluent / Material, light-first, dense forms and sidebars (unverified).
- **Developer tools** (LangSmith, Mastra, Agno) lean towards dark-capable, monospace-accented, trace-heavy dense UIs (unverified).
- **Canvas tools** (n8n, Flowise, Langflow, CrewAI) use dotted-grid canvases with coloured node cards and typed ports (n8n and Flowise well known; others unverified).
- **Common 2026 micro-patterns:** syntax-highlighted diffs for agent changes (Fleet), status badges (Active/Paused schedules in Fleet), streaming "thoughts" panels (CrewAI), inline tool-approval cards in chat (Fleet, Claude), cost/usage meters (Fleet LCU meter; Relevance per-task cost).

---

## 5. Step-by-step user flows

### 5.1 No-code "describe → agent" flow (synthesised from Fleet, Dify, CrewAI Studio, Copilot, n8n)
1. **Entry:** "New agent" → choose *Describe*, *Template* or *Blank*. Copilot Studio also asks which harness here, and the choice is irreversible [doc].
2. **Describe the goal** in plain language, sometimes by voice (CrewAI mic icon).
3. **Clarifying questions:** Fleet asks for "necessary details before auto-generating"; Vellum asks about external data needs; n8n's Assistant proposes a plan that needs confirmation [doc].
4. **Generation, visible while it happens:**
   - CrewAI streams "AI Thoughts" on the left while nodes appear on the canvas [doc].
   - Dify stages each change into a **Build draft** and writes `build_note.md` [doc].
   - Fleet renders file edits as diffs [doc].
   - Copilot fills the Configure tab from the Describe chat [doc].
5. **Connect accounts:** OAuth for Gmail, Slack and others, or MCP servers. Fleet chooses shared vs per-user accounts through a "connection format selector" [doc]. n8n has an inline "Available tools" card in the assistant chat for connecting MCP servers (v2.35) [2nd].
6. **Test** in the preview chat. Inspect tool calls and knowledge hits (Gemini Test panel; n8n sessions).
7. **Add a trigger or channel:** schedule, email, Slack, webhook.
8. **Set guardrails and approvals:** "ask first" for sensitive tools; approvals route to an Inbox or Slack.
9. **Publish:** creates a version. Then share (Fleet: Can clone / run / edit) or deploy to a channel.
10. **Operate:** Inbox approvals, sessions/traces, usage meter. Iterate by chatting again; the agent "remembers corrections" (Fleet memory) [doc].

### 5.2 Canvas flow (OpenAI Agent Builder, Flowise, Langflow, n8n workflows)
1. Pick a template or blank → drag Start → Agent → tools and logic nodes → End.
2. Configure each node in the right panel: instructions, model, tools, output schema.
3. Preview chat (OpenAI) or Playground (Langflow).
4. Evaluate (OpenAI trace graders) → Publish (major version) → deploy via ChatKit with a workflow ID, or export code [doc].

### 5.3 Code-first developer flow (LangGraph example; ADK and Mastra are analogous)
1. Scaffold: `langgraph new` / `pip install langgraph`; ADK `pip install google-adk` → `adk web`; Mastra `mastra dev`.
2. Write the graph or agent in the IDE. `langgraph dev` starts a local Agent Server, and Studio opens in the browser [doc].
3. Run threads in Studio (Graph mode). Inspect state per node; **time-travel** to a checkpoint, edit it and re-run [doc].
4. Traces go to LangSmith automatically. Build a dataset from traces → run experiments with evaluators [doc].
5. One-click deploy to LangSmith Deployment from Studio, or `crewai deploy` / Mastra Server / AgentCore Runtime (`agentcore` CLI) [doc].
6. Expose: REST plus streaming; optionally MCP (AgentOS, Langflow), A2A (ADK) or AG-UI for the frontend.

### 5.4 Hybrid "prototype no-code → hand off to code" flow
- **CrewAI:** Studio → Download ZIP → engineers extend → deploy as code. **Visual editing is lost after that** [doc].
- **Vellum:** Agent Builder → graph and Python stay in sync → `vellum` CLI pull/push → approval-gated push to production across dev / staging / prod environments with audit logs [doc].
- **OpenAI:** canvas → **Code** export (Agents SDK). With Agent Builder retiring, this export is now the migration path [doc].
- **Lyzr:** Architect agent → "Open in Lyzr Studio" (two-way sync) → optional GitAgent files in GitHub (see `01-architect-new.md`).

### 5.5 Human-in-the-loop flow (Fleet / Claude / Flowise)
1. The agent hits a sensitive tool call (send email, update CRM).
2. The run pauses. An approval card appears inline in chat, in Slack and in a central Inbox. Fleet also titles such threads while they wait [doc].
3. The human approves, rejects or edits the message. Fleet supports composing a message during the prompt [doc].
4. The run resumes from its checkpoint. Flowise checkpointing survives restarts [doc].

### 5.6 Collaboration / sharing flow
- **Fleet:** Share → individual or workspace → Can clone / Can run / Can edit. An agent can be published as a template [doc].
- **Mastra:** share a Studio link backed by a cloud sandbox [doc].
- **n8n:** RBAC separates editors from publishers [doc].
- **CrewAI AMP:** seats and roles, plus internal agent repositories [doc].
- **Relevance:** Sharing plus Build vs End users on the Team plan [doc].

### 5.7 Import existing agent code
- **Rarely a first-class flow.** The closest options:
  - Mastra Cloud: "connect existing deployments, GitHub repos, or use Mastra templates" [doc].
  - CrewAI AMP: deploy from a GitHub repo [2nd].
  - AgentCore: containerise any framework [doc].
  - Claude Managed Agents: load skills from a repo's `.claude/skills` [doc].
- **Nobody offers "paste a GitHub repo of a LangGraph/CrewAI agent → get a visual card and traces automatically".** That is a clear gap for Architect 2.0.

---

## 6. UX strengths and pain points (with evidence)

### Strengths users love
- **Guardrails and RAG as simple nodes.** OpenAI testers called Guardrails "one of the coolest things… pretty unique" and File Search "makes RAG super easy" [2nd: finalroundai].
- **Seeing the reasoning while it builds.** CrewAI's streaming AI Thoughts panel, Output/Traces tabs and step-by-step inspection [doc].
- **One agent, many surfaces.** n8n's "set up once and use anywhere" (chat, node, Slack, schedule) [doc]. Dify's "one single source of truth" for agents reused across workflows [doc].
- **Time-travel debugging** in LangGraph Studio [doc].
- **Execution-based pricing that doesn't penalise complexity.** n8n: one agent turn = one execution, and tool and sub-agent calls don't count [doc].
- **Evals that block bad releases** (Relevance) [doc]. **Side-by-side experiment comparison** (Mastra) [doc].
- **Data stays in your cloud:** the Agno Control Plane connects the browser directly to your runtime [doc].

### Pain points and complaints
- **Platform-risk and lock-in shock.** Agent Builder was killed after about 8 months. Community reaction: shipping a tool and killing it within six months "isn't a sound business strategy". The lesson: "the durable layer was the code-level SDK, not the visual builder" (https://community.openai.com/t/deprecation-notice-agent-builder/1382650 [2nd]; Montana Labs [2nd]). Model lock-in was also criticised: OpenAI-only models [2nd: finalroundai].
- **Canvases get technical and cluttered.** Agent Builder was "even more technical than n8n" [2nd]. Flowise's most common complaint is "canvas clutter and unpredictable cost… error messages becoming cryptic" [2nd: https://aixcove.com/flowise-review-2026-pricing-pros-cons-and-best-use-cases/].
- **Breaking upgrades / instability in OSS builders.** Flowise: "memory leaks under load, breaking upgrades, and thin observability" [2nd]. The hosted DataStax Langflow shut down in April 2026 [2nd].
- **Memory surprises.** n8n Simple Memory is volatile ("data disappears when n8n restarts or when you save the workflow"), and teams "wasted weeks debugging 'memory loss'" [2nd: https://towardsai.net/p/machine-learning/n8n-ai-agent-node-memory-complete-setup-guide-for-2026]. Gemini Memory Bank is **off by default** [2nd].
- **Silent failures.** Agents "silently returning nothing while appearing to succeed or hallucinating tool results" [2nd: logicworkflow.com via search].
- **Runaway cost.** "An overnight $2,400 API bill from a single crew that hit a tool error and kept retrying". Reasoning loops use up to 10x the tokens, and multi-agent up to 4x [2nd: https://blog.reviewaitool.com/2026/04/12/crewai-review-2026/].
- **Reliability ceiling.** Agents "operate effectively about 80% of the time". Giving an agent more than 3–5 tools reduces reliability [2nd].
- **Opaque pricing units.** Copilot "messages" became "Copilot Credits" that scale with work, so "any benchmark… built before September is no longer directly comparable" [2nd: licenseq]. Relevance splits pricing into Actions plus Vendor Credits and retired its Free plan [doc].
- **One-way export.** CrewAI's ZIP breaks visual editing and versioning for the deployed automation [doc].
- **Irreversible early choices.** Copilot harnesses are not transferable [doc].
- **MCP flakiness in young builders.** OpenAI testers found MCP integrations "limiting and buggy"; one Zapier MCP integration failed repeatedly [2nd].
- **Framework fatigue:** months of evaluation with "no clear winner" [2nd: dev.to Reddit digest].

---

## 7. Recent notable launches (2025–2026 timeline)

| Date | Launch |
|---|---|
| 2025-04-09 | Google announces A2A. Donated to the Linux Foundation 2025-06-23 [2nd: Wikipedia/LF] |
| 2025-07-10 | Dify v1.6: built-in two-way MCP [doc] |
| 2025-07-18 | Vellum Agent Builder (beta) [doc] |
| 2025-08-14 | Workday acquires Flowise [doc] |
| 2025-09-04 | Pydantic AI v1.0 [doc] |
| 2025-10-01 | Microsoft Agent Framework public preview (AutoGen + SK) [2nd] |
| 2025-10-02 | CrewAI AMP (announced as "AOP") [doc] |
| 2025-10-06 | OpenAI AgentKit: Agent Builder, ChatKit, Evals, Connector Registry [2nd] |
| Oct 2025 | Amazon Bedrock AgentCore GA [doc]. LangGraph Platform renamed LangSmith Deployment [2nd] |
| 2025-10-22 | LangChain 1.0 & LangGraph 1.0 (middleware, `create_agent`) [doc] |
| 2025-10-29 | LangSmith Agent Builder (no-code, built on `deepagents`) [doc] |
| 2025-10-30 | Mastra Agent Studio (Playground → Studio) [doc] |
| 2025-11-21 | Dify Triggers [doc] |
| 2025-12-22 | Langflow 1.7 (MCP Streamable HTTP, ALTK/CUGA agents) [doc] |
| Jan 2026 | LangSmith Agent Builder GA [2nd] |
| 2026-03-09 | DataStax Langflow (hosted) deprecated; shut down 2026-04-09 [2nd] |
| 2026-03-19 | Agent Builder renamed **LangSmith Fleet**: identity, sharing, Inbox, Slack bots [doc] |
| ~2026-04-03 | Microsoft Agent Framework 1.0 GA [2nd] |
| 2026-04-08 | **Claude Managed Agents** (beta) [2nd; API beta header `managed-agents-2026-04-01`] |
| 2026-04-09 | Mastra Platform (Studio, Server, Memory Gateway) [doc]. A2A reports 150+ orgs [doc] |
| Apr 2026 | OpenAI Agents SDK harness + sandbox update [2nd: TechCrunch 2026-04-15]. Langflow 1.9 (Assistant, Flow DevOps Toolkit, MCP) [doc] |
| 2026-04-22/23 | Vertex AI → **Gemini Enterprise Agent Platform**; enhanced Agent Designer, Inbox. OpenAI **Workspace Agents** in ChatGPT (research preview) [doc/2nd] |
| May 2026 | Copilot Studio: computer-using agents GA, new workflows designer, A2A GA, remote MCP [doc]. Claude "Dreaming" memory consolidation [2nd]. CopilotKit $27M Series A on the back of AG-UI [2nd] |
| 2026-05-19 | Google ADK Python 2.0 GA (graph workflows). Go 2.0 on 2026-06-30, TS 2.0 on 2026-08-21 [2nd; TS 2.0 GA confirmed on adk.dev] |
| 2026-06-03 | **OpenAI deprecates Agent Builder and standalone Evals** (shutdown 2026-11-30) [doc] |
| 2026-07-09 | n8n AI Assistant (workflow-building agent) preview [doc] |
| Jul 2026 | Dify Agent open beta (v1.16: sandbox, skills, roster) [doc] |
| 2026-07-28 | CrewAI Studio "automated agent builder" (single-agent / crew / router nodes) [doc] |
| 2026-08-27 | Dify "Introducing New Agent" (build by chat) [doc] |
| Aug–Sept 2026 | Fleet: sandboxes, Office file authoring, Slack files, Sonnet 5, templates gallery [doc] |
| 2026-09-10 | **OpenAI Agents API** public beta (Codex harness, hosted / BYO / partner sandboxes) [doc title; 2nd details] |
| 2026-09-21 | Copilot Studio GitHub Copilot harness agent docs (Build / Preview / Evaluate / Monitor) [doc] |
| 2026-09-25 | **n8n Agents** (blog post date per fetch; preview on n8n Cloud) [doc] |

---

## 8. Synthesis: what the Architect 2.0 "Agent section" should look like

### 8.1 First-principles framing
- An agent inside an Architect app is **a component of the app**, not a standalone chatbot. It has: an **interface contract** (typed inputs and outputs that the UI renders), **capabilities** (tools, knowledge, skills), **behaviour** (instructions, model, memory), **boundaries** (guardrails, approvals, budget, identity), and **a lifecycle** (test → evaluate → publish → monitor).
- Non-technical users think in **jobs and outcomes** ("triage my inbox", "qualify leads"). Developers think in **frameworks, code and traces**. Both need the same lifecycle. So: **one spec, two editors, one lifecycle**.
- The market lesson is that the durable layer is **code + open spec + open protocols**; proprietary canvases get deprecated. Architect already has **GitAgent/OpenGAP** (agent-as-files, exportable to multiple frameworks). Make that spec the source of truth, so that "any framework" is an adapter, not a rewrite.

### 8.2 Proposed information architecture (concrete)
- **Workspace top-level tabs** (next to the app Preview/Code tabs): `App` · **`Agents`** · `Data` · `Integrations` · `Deploy`.
- **Agents index:**
  - **Header:** "New agent" split button (**Describe it** · **From template** · **Import code** · **Start in a framework**).
  - **Two views:** **List** (cards with status pill Draft/Live vX, owner, last run, cost/7d, eval score) and **Map** (auto-generated graph: manager → sub-agents → tools/knowledge, plus **which app screens/API routes call each agent**, like Dify "Access Points" but visual).
- **Agent detail page:**
  - **Top bar:** name · framework badge (e.g. "Lyzr native", "LangGraph (Py)") · status/version pill · **Simple ⇄ Code** toggle · Test run · **Publish** (primary, top-right).
  - **Tabs:** **Build · Test · Evaluate · Monitor · Deploy.** Copilot Studio's validated tab set, plus Deploy.
  - **Build (Simple mode):** three columns.
    - **Left: Agent Copilot chat.** Proposes changes as **staged diff chips with Apply / Discard**, as in Dify's Build draft.
    - **Centre: the Agent Card.** Sections: *What it does* (instructions, rich text), *Brain* (model: Fast/Balanced/Best, not raw model IDs, with an advanced dropdown), *Can use* (tools/MCP/connectors/app actions), *Knows* (knowledge), *Skills*, *Remembers* (memory, **on by default with a visible retention setting**), *Team* (sub-agents), *Starts when* (triggers/channels), *Must ask before* (approvals), *Limits* (budget per run, max steps).
    - **Right: live "Try it" chat.** Each message expands into a step timeline: tool calls, knowledge hits, cost.
  - **Build (Code mode):** file tree (left) · editor (centre) · right pane with the **graph render + run panel** (Studio-style, time-travel for LangGraph) · bottom panel **Terminal | Traces | Problems**. The framework's native dev server (`langgraph dev`, `adk web`, `mastra dev`, `crewai run`) runs in a sandbox.
  - **Test:**
    - Scenario list (auto-generated from the description, like Relevance Invent / Lyzr A-Sim).
    - Simulated-user runs.
    - **Compare versions side by side** (Mastra).
  - **Evaluate:**
    - Datasets (from saved runs or production traces).
    - Rubrics / LLM judges with plain-English criteria.
    - Score trend.
    - **Publish gate toggle:** "block publish if score drops".
  - **Monitor:**
    - Sessions and traces (normalised over OpenTelemetry/OpenInference, regardless of framework).
    - Cost per run.
    - Errors and "silent failure" detectors: empty output, tool not called, loop detected.
    - **Approvals Inbox.**
  - **Deploy:**
    - Endpoints: REST + streaming, **MCP server**, **A2A agent card**, **AG-UI endpoint** used by the generated app's frontend.
    - Channels: web widget snippet, Slack, Teams, email.
    - Schedules; environments (dev/staging/prod); secrets vault; version pinning and rollback.

**Wireframe of the Agent detail page, Build tab, Simple mode** (a proposal, not an observed product):
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ ← Agents / Lead Qualifier   [Lyzr native ▾]  ● Draft (v4 live)  Simple|Code  ▶ Test  [Publish] │
│ Build · Test · Evaluate · Monitor · Deploy                                              │
├──────────────────────┬───────────────────────────────────────┬────────────────────────┤
│ Agent Copilot (chat) │ AGENT CARD                            │ Try it                 │
│ "Also check          │ What it does   [rich-text instructions]│ > Qualify acme.com     │
│  LinkedIn"           │ Brain          Balanced ▾   (≈2 cr/run)│  ├ 🔧 hubspot.search   │
│ ┌ Staged changes ──┐ │ Can use        HubSpot · Gmail · +MCP  │  ├ 📚 ICP.pdf p.3      │
│ │ + tool linkedin  │ │ Knows          ICP.pdf · pricing.md    │  ├ ⏸ approval: email   │
│ │ ~ instructions   │ │ Skills         Lead-scoring v2         │  └ ✓ score 82 · $0.03  │
│ │ [Apply][Discard] │ │ Remembers      On · 30 days            │                        │
│ └──────────────────┘ │ Team           researcher · writer     │                        │
│ [ask for a change…]  │ Starts when    New HubSpot lead        │ [message…]             │
│                      │ Must ask before Sending email          │                        │
│                      │ Limits         $0.50/run · 25 steps    │                        │
│                      │ Used in app    /leads page · POST /api │                        │
└──────────────────────┴───────────────────────────────────────┴────────────────────────┘
```

### 8.3 (a) Non-technical users
- **Entry:** templates by job ("Inbox triage", "Lead qualifier", "Support deflection") plus a "Describe it" prompt with 2–4 clarifying multiple-choice questions. This reuses Architect's existing planning-mode pattern.
- **While it builds:** a streaming "thinking" rail plus Agent Card sections filling in one at a time, with sub-agents appearing on the Map. This mirrors CrewAI's AI Thoughts and makes the wait legible.
- **Plain-language labels** ("Can use", "Must ask before"), and **no graph editing required**.
- **Guided connections:** OAuth cards inline in chat. The user chooses "act as me" vs "act as the agent's own account" (Fleet's Assistant vs Claws).
- **Safety defaults:** approvals ON for write/send actions; per-run budget ON; persistent memory ON with clear retention.

### 8.4 (b) Developers
- **Framework picker at creation:** cards for Lyzr-native, LangGraph (Py/TS), CrewAI, OpenAI Agents SDK, Google ADK, Mastra, Claude Agent SDK, Pydantic AI and Agno, with language and a one-line tradeoff each.
- **Switchable later:** framework is a *code-generation target* from the shared spec where possible. If custom code makes it non-convertible, say so explicitly (no silent lock-in).
- **Import code:** connect a GitHub repo → auto-detect the framework (`langgraph.json`, `crew.py`, `root_agent.yaml`, `mastra.config`) → build the Agent Card read-only from the code and attach tracing. Nobody else does this well (see §5.7).
- **Two-way sync where feasible** (Vellum-style). Prompt, model and tool-list edits in Simple mode write back to code/YAML as a reviewed diff. Code-only constructs show as locked "custom code" blocks on the card.
- **Traces and evals are framework-agnostic** via OTel. Deploy to a managed container runtime, AgentCore-style, so "any framework" is real.

### 8.5 Ideas for Architect 2.0

- ADOPT: The converged "agent anatomy" card: Instructions, Model, Tools (MCP / connectors / app actions / workflows-as-tools), Knowledge, Skills, Memory, Sub-agents, Triggers/Channels, Approvals, Limits. It is validated by Copilot Studio's new harness, n8n Agents, Dify New Agent and Gemini Agent Designer.
- ADOPT: Build · Test · Evaluate · Monitor · Deploy tabs on every agent (Copilot Studio's 2026 tab set plus Deploy), with Publish fixed top-right.
- ADOPT: "Build by chatting" with **staged changes you Apply or Discard** (Dify Build draft; Fleet diffs), so the user never loses control of what the AI changed.
- ADOPT: A streaming "AI thoughts" rail plus progressive card and Map filling while an agent is generated (CrewAI Studio), to make the agent-getting-built experience legible.
- ADOPT: One agent, many surfaces: in-app, REST, MCP server, A2A card, web widget, Slack/Teams, schedule (n8n Agents; Dify Access Points; Langflow MCP export).
- ADOPT: A central **Approvals Inbox** plus inline approval cards in chat and Slack (Fleet Inbox, Gemini Inbox, Claude permission policies always-allow / always-ask / auto).
- ADOPT: Agent identity choice at connection time: "act as the signed-in user" vs "act as the agent's own account" (Fleet Assistant vs Claws; AgentCore Identity).
- ADOPT: Per-run **budget caps and max-step limits** as visible defaults (Claude Managed Agents session budgets; CrewAI `max_iter`), with cost shown per run in the Try-it timeline.
- ADOPT: Draft vs Published versions with version pinning, compare and rollback (n8n Agents; Mastra Agent Editor; Claude Managed Agents immutable versions).
- ADOPT: Eval gating on publish (Relevance) and auto-generated test scenarios from the agent description (Relevance Invent; Lyzr A-Sim).
- ADOPT: OpenTelemetry-based tracing, so traces look the same for Lyzr-native, LangGraph, CrewAI, ADK and OpenAI Agents SDK agents.
- ADOPT: AG-UI as the contract between generated app frontends and agent backends of any framework. It is already supported by LangGraph, CrewAI, ADK, Mastra, Pydantic AI, Agno and Microsoft Agent Framework.
- IMPROVE: Make Architect's existing GitAgent/OpenGAP spec the single source of truth. Simple-mode edits become reviewed diffs to the spec and code, which fixes CrewAI's one-way ZIP export problem.
- IMPROVE: "Import agent code from GitHub" with framework auto-detection and a read-only Agent Card plus traces. No competitor has a strong import flow for existing agents.
- IMPROVE: An "Agent Map" that shows not just agent → tool edges but **app screen / API route → agent** bindings. Architect's unique angle is agents embedded in apps, and no pure agent builder shows this.
- IMPROVE: Typed agent output schemas (OpenAI's typed edges; Dify's declarative outputs) that the UI generator uses to render cards, tables and forms automatically, instead of dumping chat text into the app.
- IMPROVE: Model picker as Fast / Balanced / Best tiers (Fleet Fast/Pro/Max), with the raw model and BYO-key behind "Advanced", and credit cost per tier shown upfront.
- IMPROVE: Silent-failure detection in Monitor: empty result, tool never called, repeated identical tool calls, hallucinated tool names. This is a top Reddit/n8n pain point.
- IMPROVE: A "Workflow vs Agent?" recommender during creation (n8n Assistant does this). Route deterministic multi-step jobs to a workflow canvas with agent nodes (the Copilot Studio 2026 pattern), and open-ended jobs to an agent.
- IMPROVE: A framework choice that is reversible where possible, with explicit warnings when custom code makes it non-convertible. Avoid Copilot's non-transferable harness trap.
- AVOID: A drag-and-drop canvas as the *primary* way to define a single agent. OpenAI killed Agent Builder after about 8 months, and testers found it "more technical than n8n". Use the canvas only for multi-agent routing and deterministic workflows.
- AVOID: Volatile or off-by-default memory (n8n Simple Memory; Gemini Memory Bank off by default). Make memory persistent by default, with visible retention controls.
- AVOID: Opaque, shifting billing units (Copilot messages → credits; Relevance Actions + Vendor Credits). Price per run or per agent turn like n8n ("one turn = one execution"), with a live meter.
- AVOID: Model or vendor lock-in in the agent layer (the "model lock-in" complaint about OpenAI Agent Builder). Keep models swappable and frameworks exportable.
- AVOID: Unbounded agent loops with no cost circuit-breaker (the $2,400 overnight CrewAI bill anecdote).
- AVOID: Hiding critical settings behind "advanced" (Gemini's hidden Memory Bank, tool execution mode and knowledge freshness). Surface safety- and cost-relevant settings on the card.

---

## Sources

**Primary (official docs / blogs / pricing)**
- OpenAI Agent Builder guide (deprecation, shutdown 2026-11-30): https://developers.openai.com/api/docs/guides/agent-builder
- OpenAI ChatKit: https://developers.openai.com/api/docs/guides/chatkit
- OpenAI Agents SDK tracing: https://openai.github.io/openai-agents-python/tracing/
- OpenAI Agents API: https://openai.com/index/introducing-the-agents-api/ (403 on fetch; title via search)
- OpenAI Workspace agents: https://openai.com/index/introducing-workspace-agents-in-chatgpt/
- OpenAI Agents SDK evolution: https://openai.com/index/the-next-evolution-of-the-agents-sdk/
- LangSmith Agent Builder launch: https://www.langchain.com/blog/langsmith-agent-builder
- LangSmith Fleet launch: https://www.langchain.com/blog/introducing-langsmith-fleet
- LangSmith Fleet changelog: https://docs.langchain.com/langsmith/fleet/changelog
- LangSmith Studio: https://docs.langchain.com/langsmith/studio
- LangSmith pricing: https://www.langchain.com/pricing
- LangChain/LangGraph 1.0: https://www.langchain.com/blog/langchain-langgraph-1dot0
- CrewAI Studio automated builder: https://crewai.com/blog/crew-studio-automated-agent-builder
- Crew Studio docs: https://docs-platform.crewai.com/platform/en/features/crew-studio
- CrewAI AMP: https://crewai.com/blog/crewai-amp---the-agent-management-platform
- CrewAI triggers: https://docs.crewai.com/en/enterprise/guides/automation-triggers
- ADK: https://adk.dev/
- ADK Visual Builder: https://adk.dev/visual-builder/
- ADK 2.0: https://adk.dev/2.0/
- Gemini Enterprise: https://cloud.google.com/blog/products/ai-machine-learning/the-new-gemini-enterprise-one-platform-for-agent-development
- Gemini Enterprise Agent Platform name changes: https://docs.cloud.google.com/gemini-enterprise-agent-platform/vertex-ai-name-changes
- Copilot Studio new harness overview: https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/overview
- Copilot Studio May 2026 updates: https://www.microsoft.com/en-us/copilot/blog/copilot-studio/new-and-improved-computer-using-agents-a-new-workflows-experience-and-real-time-voice-experiences/
- Copilot Studio create agents: https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-first-bot
- n8n Agents: https://blog.n8n.io/introducing-n8n-agents/
- n8n AI Assistant: https://community.n8n.io/t/introducing-the-ai-assistant-the-workflow-building-agent-inside-n8n/302667
- n8n pricing: https://n8n.io/pricing/
- Flowise Agentflow V2: https://docs.flowiseai.com/using-flowise/agentflowv2
- Workday acquires Flowise: https://newsroom.workday.com/2025-08-14-Workday-Acquires-Flowise,-Bringing-Powerful-AI-Agent-Builder-Capabilities-to-the-Workday-Platform
- Langflow 1.7: https://www.langflow.org/blog/langflow-1-7
- Langflow 1.9: https://www.langflow.org/blog/langflow-1-9/
- Langflow concepts: https://docs.langflow.org/concepts-overview
- Dify blog: https://dify.ai/blog
- Dify New Agent: https://dify.ai/blog/introducing-new-dify-agent
- Dify build an agent: https://docs.dify.ai/en/self-host/use-dify/build/new-agent/build
- Dify releases: https://github.com/langgenius/dify/releases
- Relevance AI product: https://relevanceai.com/product
- Relevance AI pricing: https://relevanceai.com/docs/get-started/pricing
- Relevance AI docs index: https://relevanceai.com/docs/llms.txt
- Lyzr: https://www.lyzr.ai/
- Lyzr Agent Studio docs: https://docs.lyzr.ai/enterprise/agent-studio/introduction
- Lyzr Agent Simulation Engine: https://github.com/LyzrCore/agent-simulation-engine
- Mastra Agent Studio: https://mastra.ai/blog/agent-studio
- Mastra Platform: https://mastra.ai/blog/announcing-mastra-platform
- Vellum Agent Builder: https://www.vellum.ai/blog/introducing-vellum-copilot
- Claude Managed Agents overview: https://platform.claude.com/docs/en/managed-agents/overview (plus Anthropic API skill reference, beta `managed-agents-2026-04-01`)
- Pydantic AI v1.0: https://github.com/pydantic/pydantic-ai/releases/tag/v1.0.0
- Pydantic AI durable execution: https://pydantic.dev/docs/ai/integrations/durable_execution/overview/
- Agno Control Plane: https://docs.agno.com/agent-os/control-plane
- Agno: https://www.agno.com/
- Amazon Bedrock AgentCore: https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html
- A2A one year (Linux Foundation): https://www.linuxfoundation.org/press/a2a-protocol-surpasses-150-organizations-lands-in-major-cloud-platforms-and-sees-enterprise-production-use-in-first-year
- AG-UI: https://github.com/ag-ui-protocol/ag-ui

**Secondary (reviews, tutorials, sentiment)**
- Agent Builder lifespan analysis: https://montanalabs.ai/news/openai-s-agentkit-and-the-eight-month-lifespan-of-agent-builder/
- OpenAI community deprecation thread: https://community.openai.com/t/deprecation-notice-agent-builder/1382650
- Agent Builder UI walkthrough: https://composio.dev/content/openai-agent-builder-step-by-step-guide-to-building-ai-agents-with-mcp
- Developer reactions to Agent Builder: https://www.finalroundai.com/blog/openai-agent-builder-what-software-developers-are-saying-after-testing
- Agents API details: https://xnews.sk/en/2026/09/11/openai-agents-api-public-beta-cloud-agents/
- Workspace agents pricing: https://www.techwyse.com/news/ai-search/openai-chatgpt-workspace-agents-launch-2026
- Copilot Studio agent builder UI: https://learnpower.ai/articles/2026-copilot-studio-agent-builder-guide
- Copilot Studio licensing: https://licenseq.com/copilot-studio-licensing/
- Gemini Agent Designer tutorial: https://findskill.ai/blog/gemini-enterprise-agent-designer-5-minute-tutorial/
- ADK 2.0 review: https://byteiota.com/google-adk-2-0-graph-workflows-ship-langgraph-has-a-fight/
- Microsoft Agent Framework merger: https://alexbevi.com/blog/2026/06/18/two-lineages-one-framework-how-autogen-and-semantic-kernel-became-the-microsoft-agent-framework/
- CrewAI pricing: https://www.lindy.ai/blog/crew-ai-pricing
- CrewAI review 2026: https://blog.reviewaitool.com/2026/04/12/crewai-review-2026/
- CrewAI release notes: https://releasebot.io/updates/crewai
- n8n release notes: https://releasebot.io/updates/n8n
- n8n pricing breakdown: https://www.cloudzero.com/blog/n8n-pricing/
- n8n memory pitfalls: https://towardsai.net/p/machine-learning/n8n-ai-agent-node-memory-complete-setup-guide-for-2026
- Reddit agent-builder digest: https://dev.to/yetta_pease_fc74c2260291a/what-reddits-agent-builders-were-actually-debugging-this-week-3n4p
- Flowise review 2026: https://aixcove.com/flowise-review-2026-pricing-pros-cons-and-best-use-cases/
- Langflow alternatives (DataStax shutdown): https://www.betterclaw.io/blog/langflow-alternative-2026
- Claude Agent SDK vs Managed Agents: https://hatchworks.com/blog/claude/claude-agent-sdk-and-managed-agents/
- Claude Managed Agents launch: https://alternativeto.net/news/2026/4/anthropic-launches-claude-managed-agents-to-accelerate-ai-agent-development-and-deployment
- AG-UI overview: https://www.copilotkit.ai/ag-ui
- Sibling report (current Architect/Lyzr agent layer): `C:\Claude Code test\research\platforms\01-architect-new.md`
