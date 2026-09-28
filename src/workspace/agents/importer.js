// Import agent code from any framework: detect the framework from its imports, count
// nodes/tools, pull out name, instructions and model, and map tools onto integrations.
import { INTEGRATIONS, frameworkById, MODELS } from '../../engine/catalog.js';
import { normalizeAgent, TIER_MODEL, isRisky } from './model.js';
import { uid } from '../../lib/util.js';
import { updateProject } from '../../lib/store.js';

const RULES = [
  ['langgraph', /\bfrom\s+langgraph|\bimport\s+langgraph|StateGraph\s*\(/],
  ['crewai', /\bfrom\s+crewai\b|\bimport\s+crewai\b/],
  ['google-adk', /\bgoogle\.adk\b/],
  ['openai-agents', /\bfrom\s+agents\s+import\b|@openai\/agents|Runner\.run(_sync)?\s*\(/],
  ['claude-agent-sdk', /@anthropic-ai\/claude-agent-sdk|\bclaude_agent_sdk\b/],
  ['mastra', /@mastra\//],
  ['architect', /apiVersion:\s*architect\.space/],
  ['gitagent', /^spec_version:/m],
];
const MAIN_FILE = { langgraph: 'graph.py', crewai: 'crew.py', 'openai-agents': 'agent.py', 'google-adk': 'agent.py', 'claude-agent-sdk': 'agent.ts', mastra: 'agent.ts', architect: 'agent.yaml', gitagent: 'agent.yaml' };

function uniq(a) { return [...new Set(a)]; }
function all(re, s) { const out = []; let m; const r = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'); while ((m = r.exec(s))) out.push(m[1]); return out; }

export function detectImport(code, filename = '') {
  const s = String(code || '');
  if (!s.trim()) return null;
  let fw = null;
  for (const [id, re] of RULES) if (re.test(s)) { fw = id; break; }
  if (!fw && /SOUL\.md$/i.test(filename)) fw = 'gitagent';
  const nodes = (s.match(/\.add_node\s*\(/g) || []).length;
  const pyTools = all(/@(?:tool|function_tool)(?:\([^)]*\))?\s*\n\s*(?:async\s+)?def\s+(\w+)/, s);
  const tsTools = [...all(/createTool\(\{\s*id:\s*['"]([\w-]+)['"]/, s), ...all(/\btool\(\s*['"]([\w-]+)['"]/, s)];
  const adkTools = fw === 'google-adk' ? (s.match(/tools\s*=\s*\[([^\]]*)\]/)?.[1] || '').split(',').map((x) => x.trim()).filter((x) => /^\w+$/.test(x)) : [];
  const toolNames = uniq([...pyTools, ...tsTools, ...adkTools]);
  const crewAgents = fw === 'crewai' ? Math.max((s.match(/@agent\b/g) || []).length, (s.match(/\bAgent\s*\(/g) || []).length) : 0;
  const handoffs = (s.match(/handoffs\s*=\s*\[([^\]]*)\]/)?.[1] || '').split(',').map((x) => x.trim()).filter(Boolean);
  const nameM = s.match(/\bname\s*[=:]\s*["'`]([^"'`\n]{2,60})["'`]/) || s.match(/\brole\s*[=:]\s*["'`]([^"'`\n]{2,60})["'`]/) || s.match(/class\s+(\w+?)(?:Crew|Agent)?\s*[:(]/);
  let name = nameM ? nameM[1] : filename.replace(/\.\w+$/, '') || 'Imported agent';
  if (/^[a-z0-9_-]+$/.test(name)) name = name.split(/[_-]/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
  const ins = s.match(/(?:INSTRUCTIONS|SYSTEM_PROMPT|system_prompt)\s*=\s*(?:"""|'''|`)([\s\S]*?)(?:"""|'''|`)/)
    || s.match(/\binstructions?\s*[=:]\s*(?:"""|'''|`)([\s\S]*?)(?:"""|'''|`)/)
    || s.match(/\b(?:instructions?|systemPrompt|backstory)\s*[=:]\s*["']([^"'\n]{10,})["']/)
    || s.match(/backstory:\s*>?\s*\n((?:\s{4,}.+\n?)+)/);
  const instructions = ins ? ins[1].replace(/\s+\n/g, '\n').replace(/^\s+/gm, '').trim() : '';
  const modelM = s.match(/\b(claude-(?:opus|sonnet|haiku)-[\d-]+|gpt-5(?:-mini)?|gpt-4o(?:-mini)?|gemini-2\.5-(?:pro|flash))\b/);
  const modelRaw = modelM?.[1] || null;
  const modelId = modelRaw ? ({ 'gemini-2.5-pro': 'gemini-pro', 'gemini-2.5-flash': 'gemini-flash', 'gpt-4o': 'gpt-5', 'gpt-4o-mini': 'gpt-5-mini' }[modelRaw] || modelRaw) : null;
  const mapped = [];
  const custom = [];
  for (const tn of toolNames) {
    const low = tn.toLowerCase();
    const it = INTEGRATIONS.find((i) => low.startsWith(i.id) || low.includes(i.id) || low.includes(i.name.toLowerCase().replace(/\s+/g, '_')));
    if (it) {
      const action = it.actions.find((a) => low.includes(a)) || it.actions[0];
      const ex = mapped.find((m) => m.id === it.id);
      if (ex) { if (!ex.actions.includes(action)) ex.actions.push(action); } else mapped.push({ id: it.id, name: it.name, actions: [action] });
    } else custom.push(tn);
  }
  if (/interrupt\s*\(|needs_approval\s*=\s*True|human_input\s*=\s*True|canUseTool/.test(s)) mapped.forEach((m) => m.actions.forEach((a) => { if (isRisky(a)) m.approve = true; }));
  const fwName = fw ? frameworkById(fw).name : null;
  const nT = toolNames.length;
  const tt = `${nT} tool${nT === 1 ? '' : 's'}`;
  let summary;
  if (!fw) summary = 'Couldn’t recognise a framework — we’ll import it as an Architect agent and keep the file as-is.';
  else if (fw === 'langgraph') summary = `Detected LangGraph graph with ${nodes} node${nodes === 1 ? '' : 's'} & ${tt}`;
  else if (fw === 'crewai') summary = `Detected CrewAI crew with ${crewAgents || 1} agent${crewAgents === 1 ? '' : 's'} & ${tt}`;
  else if (fw === 'openai-agents') summary = `Detected OpenAI Agents SDK agent with ${tt}${handoffs.length ? ` & ${handoffs.length} handoffs` : ''}`;
  else summary = `Detected ${fwName} agent with ${tt}`;
  return { framework: fw || 'architect', recognised: !!fw, frameworkName: fwName || 'Architect native', nodes, toolNames, mapped, custom, name, instructions, modelId, summary, mainFile: MAIN_FILE[fw || 'architect'], approvalsFound: mapped.some((m) => m.approve) };
}

// ---------------------------------------------------------------------------
// Trust gate — what we found in imported code before it can run on Architect.
// ---------------------------------------------------------------------------
const SECRET_RE = /(["'])((?:sk|pk|rk)-[A-Za-z0-9_-]{12,}|xox[abpr]-[A-Za-z0-9-]{10,}|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{20,})\1/g;
const SECRET_ASSIGN_RE = /\b([A-Z][A-Z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD))\b["']?\s*\]?\s*[:=]\s*["']([^"'\s]{8,})["']/g;
const envName = (s) => s.replace(/[^A-Z0-9_]/gi, '_').toUpperCase();

/** Returns { items: [{level:'high'|'warn'|'ok', icon, label, fix}], secrets: [{name, masked}], unapproved: [action] } */
export function trustScan(det, code = '') {
  const secrets = [];
  const seen = new Set();
  let m;
  const a = new RegExp(SECRET_ASSIGN_RE.source, 'g');
  while ((m = a.exec(code))) if (!seen.has(m[2])) { seen.add(m[2]); secrets.push({ name: envName(m[1]), value: m[2] }); }
  const b = new RegExp(SECRET_RE.source, 'g');
  while ((m = b.exec(code))) if (!seen.has(m[2])) { seen.add(m[2]); secrets.push({ name: `IMPORTED_SECRET_${secrets.length + 1}`, value: m[2] }); }
  const masked = secrets.map((s) => ({ name: s.name, masked: `${s.value.slice(0, 5)}…${s.value.slice(-2)}` }));
  const unapproved = [];
  for (const t of det?.mapped || []) if (!t.approve) for (const x of t.actions) if (isRisky(x)) unapproved.push(x);
  const shell = /\b(subprocess|os\.system|child_process|eval\s*\(|exec\s*\()/.test(code);
  const items = [
    secrets.length
      ? { level: 'high', icon: 'key', label: `${secrets.length} hard-coded secret${secrets.length > 1 ? 's' : ''} in the code (${masked.map((s) => s.name).join(', ')})`, fix: 'Moved to encrypted environment variables — the code reads them at run time and they never reach GitHub.' }
      : { level: 'ok', icon: 'key', label: 'No hard-coded secrets found' },
    unapproved.length
      ? { level: 'warn', icon: 'shield-alert', label: `${unapproved.map((x) => x.replace(/_/g, ' ')).join(', ').replace(/^./, (c) => c.toUpperCase())} would run without asking anyone`, fix: 'Added to “Must ask before” — a person approves each one until you change it.' }
      : { level: 'ok', icon: 'shield-check', label: 'Risky actions already ask a person first' },
    shell
      ? { level: 'warn', icon: 'terminal', label: 'Runs shell commands or eval()', fix: 'Runs in an isolated sandbox with no network except your connections.' }
      : { level: 'ok', icon: 'terminal', label: 'No shell commands or eval()' },
    det?.custom?.length
      ? { level: 'warn', icon: 'code', label: `${det.custom.length} custom tool${det.custom.length > 1 ? 's' : ''} we can’t map to a connection (${det.custom.join(', ')})`, fix: 'Kept exactly as written and shown as locked on the card.' }
      : null,
  ].filter(Boolean);
  return { items, secrets: masked, rawSecrets: secrets, unapproved };
}

/** Apply the trust-gate fixes: strip secrets into env refs, add missing approvals. */
export function applyTrustFixes(agent, scan, code) {
  let clean = code;
  for (const s of scan.rawSecrets) clean = clean.split(s.value).join(`\${env.${s.name}}`);
  const key = Object.keys(agent.codeOverrides || {})[0];
  return {
    ...agent,
    approvals: [...new Set([...(agent.approvals || []), ...scan.unapproved])],
    codeOverrides: key ? { ...agent.codeOverrides, [key]: clean } : agent.codeOverrides,
    envRefs: scan.rawSecrets.map((s) => ({ key: s.name, last4: s.value.slice(-4) })),
    imported: { ...(agent.imported || {}), trust: { secrets: scan.secrets.length, approvalsAdded: scan.unapproved.length, at: Date.now() } },
  };
}

/** Store secrets pulled out by the trust gate as project env vars (secret, all environments). */
export function addImportedEnv(pid, agent) {
  const refs = agent?.envRefs || [];
  if (!pid || !refs.length) return;
  updateProject(pid, (d) => {
    d.env = d.env || [];
    for (const r of refs) {
      if (d.env.some((e) => e.key === r.key)) continue;
      const v = { set: true, last4: r.last4 };
      d.env.push({ key: r.key, secret: true, source: 'import', values: { draft: v, staging: v, production: v } });
    }
  });
}

export function agentFromImport(det, code, filename) {
  const model = det.modelId && MODELS.find((m) => m.id === det.modelId);
  const approvals = [];
  for (const m of det.mapped) if (m.approve) for (const a of m.actions) if (isRisky(a)) approvals.push(a);
  return normalizeAgent({
    id: uid('a'), name: det.name, role: `Imported from ${filename || det.mainFile} (${det.frameworkName})`,
    instructions: det.instructions || 'Imported agent — describe what it does here so Architect can test and evaluate it.',
    framework: det.framework,
    model: model ? { tier: model.tier, provider: model.provider, model: model.id, creativity: 0.3 } : { tier: 'balanced', provider: 'Anthropic', model: TIER_MODEL.balanced, creativity: 0.3 },
    tools: det.mapped.map(({ approve, ...t }) => t), approvals,
    codeOverrides: { [`${det.framework}/${det.mainFile}`]: code },
    imported: { file: filename || det.mainFile, at: Date.now(), nodes: det.nodes, custom: det.custom, framework: det.framework },
    triggers: [{ type: 'chat', detail: 'Chat panel' }], outputs: [{ key: 'answer', type: 'text' }],
    version: 1, status: 'draft', evalScore: null, stats: { runs: 0, cost: 0, latencyMs: 0, errors: 0 },
  });
}

export const IMPORT_SAMPLES = [
  {
    id: 'langgraph', label: 'LangGraph', file: 'graph.py', code: `from typing import Literal
from langchain.chat_models import init_chat_model
from langchain_core.tools import tool
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.types import interrupt

INSTRUCTIONS = """You triage inbound support tickets. Decide urgency and topic,
draft a reply from the help center, and escalate billing errors to a human."""

@tool
def freshdesk_list_tickets(query: str) -> list:
    """Find open tickets in Freshdesk."""
    ...

@tool
def freshdesk_reply_ticket(ticket_id: str, body: str) -> dict:
    """Reply to a ticket in Freshdesk."""
    interrupt({"action": "reply_ticket", "ticket_id": ticket_id})
    ...

model = init_chat_model("anthropic:claude-sonnet-5").bind_tools([freshdesk_list_tickets, freshdesk_reply_ticket])

def agent(state: MessagesState):
    return {"messages": [model.invoke([("system", INSTRUCTIONS), *state["messages"]])]}

def escalate(state: MessagesState):
    ...

builder = StateGraph(MessagesState)
builder.add_node("agent", agent)
builder.add_node("tools", ToolNode([freshdesk_list_tickets, freshdesk_reply_ticket]))
builder.add_node("escalate", escalate)
builder.add_edge(START, "agent")
builder.add_conditional_edges("agent", tools_condition)
builder.add_edge("tools", "agent")
graph = builder.compile(name="ticket_triage")
`,
  },
  {
    id: 'crewai', label: 'CrewAI', file: 'crew.py', code: `import os
from crewai import Agent, Crew, Process, Task
from crewai.tools import tool

os.environ["SERPER_API_KEY"] = "sk-demo-7f3a9c21e84b4d0fa1c2"  # TODO move out of code

@tool("Search the web")
def websearch_search_web(query: str) -> str:
    """Search the public web."""
    ...

@tool("Post the brief to Slack")
def slack_post_message(channel: str, text: str) -> str:
    """Post a message to a Slack channel."""
    ...

researcher = Agent(
    role="Market Researcher",
    goal="Find how competitors price and position their product",
    backstory="You research competitors carefully and cite every source.",
    tools=[websearch_search_web, slack_post_message],
    llm="anthropic/claude-sonnet-5",
)
writer = Agent(role="Brief Writer", goal="Write a one-page brief", backstory="You write crisp briefs.")

crew = Crew(agents=[researcher, writer], tasks=[Task(description="Research {topic}", expected_output="A brief", agent=researcher)], process=Process.sequential)
`,
  },
  {
    id: 'openai-agents', label: 'OpenAI Agents SDK', file: 'agent.py', code: `from agents import Agent, Runner, function_tool

@function_tool
def gcal_list_events(query: str) -> list:
    """List calendar events."""
    ...

@function_tool(needs_approval=True)
def gcal_create_event(title: str, start: str, attendees: str) -> dict:
    """Create a calendar event."""
    ...

scheduler = Agent(
    name="Meeting Scheduler",
    instructions="Find three slots that work for everyone within working hours and book only after a person confirms.",
    model="gpt-5-mini",
    tools=[gcal_list_events, gcal_create_event],
)

result = Runner.run_sync(scheduler, "Find time with Priya next week")
`,
  },
];
