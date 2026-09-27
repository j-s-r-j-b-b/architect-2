// ============================================================================
// THE PROJECT CONTRACT
// Every screen, the generator, the build simulator and the app renderer agree on
// this shape. A complete example lives in ./fixtures.js (leadDeskProject()).
// ============================================================================

/**
 * @typedef {'planned'|'building'|'verified'|'live'|'deferred'|'failed'} PromiseStatus
 *
 * @typedef {Object} Promise_  A numbered, checkable commitment in the plan ("scope contract").
 * @property {string} id            'P1'
 * @property {string} title         'Score every new lead from 0–100'
 * @property {string} detail        one-sentence plain explanation
 * @property {string[]} checks      acceptance checks ('A lead with 50+ employees scores ≥ 60')
 * @property {PromiseStatus} status
 * @property {[number,number]} cost credit range for this promise
 * @property {string} [deferredReason] shown when status === 'deferred' ('Needs a Slack connection')
 * @property {string[]} [refs]      ids of screens/agents/tables that fulfil it
 * @property {string} [proof]       e.g. 'Screenshot of /leads with scores' (set when verified)
 *
 * @typedef {Object} Quote
 * @property {[number,number]} credits
 * @property {[number,number]} minutes     honest estimate for a real build
 * @property {number|null} cap             user budget cap (credits); pause-and-ask at 80%
 * @property {'fast'|'balanced'|'best'} modelTier
 * @property {{label:string, credits:[number,number]}[]} lines  itemised quote
 *
 * @typedef {Object} Question   Clarifying question card (2–4 options + "Other" + skip)
 * @property {string} id
 * @property {string} text
 * @property {string} [why]                 why we ask (shown small)
 * @property {{value:string,label:string,hint?:string}[]} options
 * @property {boolean} [multi]
 * @property {string|string[]} [answer]
 *
 * @typedef {Object} Column
 * @property {string} key
 * @property {string} label
 * @property {'text'|'number'|'money'|'percent'|'date'|'datetime'|'status'|'email'|'score'|'tags'|'person'|'url'|'bool'|'longtext'} type
 * @property {string[]} [options]   for status
 *
 * @typedef {Object} Table
 * @property {string} id            'leads'
 * @property {string} name          'Leads'
 * @property {string} icon
 * @property {Column[]} columns
 * @property {Object[]} rows        each row has an 'id'
 * @property {'sample'|'test'|'live'} source   Honest data: every widget bound to a sample table shows a badge
 * @property {string|null} connection          integration id that provides live data ('hubspot')
 * @property {string} [rules]                   plain-language access rule
 *
 * @typedef {'header'|'kpis'|'table'|'chart'|'form'|'agentChat'|'agentActivity'|'kanban'|'cards'|'list'|'detail'|'text'|'calendar'|'hero'|'steps'} BlockType
 *
 * @typedef {Object} Block        One UI section on a screen.
 * @property {string} id          'b_leads_table'
 * @property {BlockType} type
 * @property {string} [title]
 * @property {number} [span]      grid columns out of 12 (defaults by type, see BLOCK_DEFAULT_SPAN)
 * @property {Object} [props]     type-specific, see BLOCK_PROPS below
 * @property {{table?:string, agent?:string}} [bind]   data/agent binding
 * @property {string} [file]      source file that renders it (X-ray): 'app/leads/page.tsx'
 * @property {'pending'|'drafting'|'done'} [buildState]  set by the build simulator; undefined === 'done'
 * @property {string} [promise]   promise id this block fulfils
 *
 * @typedef {Object} Screen
 * @property {string} id
 * @property {string} route       '/leads'
 * @property {string} title
 * @property {string} icon
 * @property {boolean} [nav]      show in the generated app's sidebar (default true)
 * @property {Block[]} blocks
 *
 * @typedef {Object} AgentSpec
 * @property {string} id
 * @property {string} name                 'Lead Qualifier'
 * @property {'manager'|'worker'} kind
 * @property {string} role                 one line: what it does
 * @property {string} instructions         full instructions (the "What it does" field)
 * @property {string} [goal]
 * @property {string} color
 * @property {string} framework            FRAMEWORKS id (default 'architect')
 * @property {{tier:'fast'|'balanced'|'best', provider?:string, model?:string, creativity?:number}} model
 * @property {{id:string,type:'file'|'url'|'table'|'text', name:string, size?:string, status?:'ready'|'indexing'}[]} knowledge
 * @property {{id:string, name:string, actions:string[], mcp?:boolean}[]} tools   integration ids
 * @property {string[]} approvals          actions that must ask a human first ('send_email')
 * @property {{costPerRun:number, steps:number, monthlyBudget?:number}} limits
 * @property {{pii:boolean, injection:boolean, toxicity:boolean, groundedness:boolean, topics:string[], blocked:string[]}} guardrails
 * @property {'none'|'session'|'long-term'} memory
 * @property {{type:'chat'|'schedule'|'webhook'|'email'|'event', detail:string}[]} triggers
 * @property {{key:string, type:string, desc?:string}[]} outputs   typed contract the UI binds to
 * @property {string[]} usedBy             screen ids
 * @property {string[]} [delegatesTo]      for managers: worker agent ids
 * @property {number} version
 * @property {'draft'|'live'} status
 * @property {number|null} evalScore       0..1
 * @property {'building'|'done'} [buildState]
 * @property {{runs:number, cost:number, latencyMs:number, errors:number}} [stats]  last 7 days
 *
 * @typedef {Object} ChatMessage
 * @property {string} id
 * @property {number} at
 * @property {'user'|'assistant'|'system'} role
 * @property {string} thread     'main'
 * @property {string} type       see CHAT_TYPES
 * @property {string} [text]
 * @property {Object} [data]     type-specific payload
 *
 * Project: see newProject() in src/lib/store.js for every field and its default.
 */

/** Default grid span (out of 12) per block type in the generated app renderer. */
export const BLOCK_DEFAULT_SPAN = {
  header: 12, hero: 12, kpis: 12, table: 8, chart: 4, form: 4, agentChat: 4, agentActivity: 4,
  kanban: 12, cards: 12, list: 4, detail: 6, text: 6, calendar: 8, steps: 12,
};

/**
 * Block props by type (all optional unless noted):
 *  header:        { title, subtitle, actions:[{label, variant:'primary'|'secondary', icon}] }
 *  hero:          { title, subtitle, cta, secondaryCta, image?:'gradient'|'none' }
 *  kpis:          { items:[{label, value, delta, tone:'up'|'down'|'flat', icon}] }
 *  table:         { columns:[colKeys] (default: all), searchable, filters:[colKey], rowAction:{label, agent?}, pageSize }
 *  chart:         { kind:'bar'|'line'|'donut'|'area', series:[{label, value}], xLabel, yLabel } or bind.table + { groupBy, metric:'count'|colKey }
 *  form:          { fields:[{key,label,type,options?,placeholder?}], submitLabel, successText }  bind.table → appends a row
 *  agentChat:     { placeholder, suggestions:[string], greeting }  bind.agent required
 *  agentActivity: { limit }  bind.agent — recent runs with tool steps
 *  kanban:        { groupBy: colKey, titleKey, subtitleKey }  bind.table
 *  cards:         { titleKey, subtitleKey, metaKeys:[colKey], badgeKey }  bind.table
 *  list:          { items:[{title, meta, icon}] } or bind.table + { titleKey, metaKey }
 *  detail:        { fields:[colKey] }  bind.table (first row)
 *  text:          { body }  (markdown-ish: **bold**, line breaks)
 *  calendar:      { dateKey, titleKey }  bind.table
 *  steps:         { items:[{title, body}] }
 */
export const BLOCK_TYPES = Object.keys(BLOCK_DEFAULT_SPAN);

/**
 * Chat message types rendered by the workspace chat dock (src/workspace/ChatDock.js):
 *  text       — plain message (role user|assistant)
 *  questions  — data: { questions: Question[], answered:boolean }
 *  plan       — data: { summary, promiseIds }  ("Here's the plan" card that links to the Plan tab)
 *  scope      — data: { included:[promiseId], deferred:[{id, reason}] }  scope contract
 *  quote      — data: { quote: Quote, status:'open'|'approved'|'expired' }
 *  progress   — data: { runId }  live build card (reads project.build)
 *  receipt    — data: { runId, credits, minutes, promises:{verified,total}, freeFixes, checkpoint }
 *  fix        — data: { errorId, what, where, cause, impact, promiseId, attempts, status:'open'|'fixing'|'fixed'|'escalated', free:boolean }
 *  approval   — data: { action, reason, impact, status:'pending'|'approved'|'denied' }
 *  checkpoint — data: { checkpointId, label }
 *  change     — data: { plain, technical, diff:{added, removed} }  summary of an edit run
 *  system     — small centered notice ('Switched to Plan mode')
 */
export const CHAT_TYPES = ['text', 'questions', 'plan', 'scope', 'quote', 'progress', 'receipt', 'fix', 'approval', 'checkpoint', 'change', 'system'];

/** Build steps kinds used by the simulator & progress UI. */
export const STEP_KINDS = ['setup', 'data', 'agent', 'tool', 'screen', 'wire', 'test', 'verify', 'deploy'];

// ---------------------------------------------------------------------------
// Helpers used across modules
// ---------------------------------------------------------------------------
export const tableById = (p, id) => p?.data?.tables?.find((t) => t.id === id) || null;
export const agentById = (p, id) => p?.agents?.find((a) => a.id === id) || null;
export const screenById = (p, id) => p?.screens?.find((s) => s.id === id) || null;
export const screenByRoute = (p, route) => p?.screens?.find((s) => s.route === route) || p?.screens?.[0] || null;
export function findBlock(p, blockId) {
  for (const s of p?.screens || []) for (const b of s.blocks) if (b.id === blockId) return { screen: s, block: b };
  return null;
}
/** Which screens/blocks use a given agent or table (for X-ray and impact cards). */
export function usagesOf(p, { agent, table }) {
  const out = [];
  for (const s of p?.screens || []) for (const b of s.blocks) {
    if ((agent && b.bind?.agent === agent) || (table && b.bind?.table === table)) out.push({ screen: s, block: b });
  }
  return out;
}
/** Is any bound table still on sample data? */
export const sampleTables = (p) => (p?.data?.tables || []).filter((t) => t.source !== 'live');
export const promiseStats = (p) => {
  const ps = p?.plan?.promises || [];
  const active = ps.filter((x) => x.status !== 'deferred');
  return { total: active.length, verified: active.filter((x) => x.status === 'verified' || x.status === 'live').length, deferred: ps.length - active.length, failed: active.filter((x) => x.status === 'failed').length };
};
