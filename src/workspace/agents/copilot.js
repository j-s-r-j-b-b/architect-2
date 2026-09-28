// Agent Copilot: "Tell me what to change" → a list of staged, reviewable changes.
// Each proposal is a small, named edit ({op, label, apply(draft)}) so the person can drop
// any of them before applying. Nothing here saves anything.
import { uid } from '../../lib/util.js';
import { INTEGRATIONS } from '../../engine/catalog.js';
import { isRisky, humanizeAction, TIER_MODEL } from './model.js';

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const sentence = (s) => { const x = s.trim().replace(/\s+/g, ' '); return (x.charAt(0).toUpperCase() + x.slice(1)).replace(/([^.!?])$/, '$1.'); };

export const COPILOT_EXAMPLES = {
  qualifier: ['Also check LinkedIn before deciding', 'Use the faster brain — cost matters more than nuance', 'Run every hour instead, and cap it at $10 a month'],
  email: ['Make the emails shorter and friendlier', 'Never mention pricing in the first email', 'Ask me before creating drafts too'],
  default: ['Ask me before it sends anything', 'Remember what each customer prefers', 'Don’t talk about competitors'],
};
export function examplesFor(agent) {
  if ((agent.outputs || []).some((o) => o.key === 'score')) return COPILOT_EXAMPLES.qualifier;
  if ((agent.tools || []).some((t) => t.id === 'gmail')) return COPILOT_EXAMPLES.email;
  return COPILOT_EXAMPLES.default;
}

export function proposeChanges(project, agent, text) {
  const raw = String(text || '').trim();
  const t = raw.toLowerCase();
  const out = [];
  if (!raw) return out;
  const add = (op, label, apply, detail) => { if (!out.some((x) => x.label === label)) out.push({ id: uid('chg'), op, label, apply, detail }); };
  const removing = /\b(remove|stop using|don'?t use|no longer use|drop|get rid of)\b/.test(t);
  const toolsAfter = new Set((agent.tools || []).map((x) => x.id));

  // Tools
  for (const it of INTEGRATIONS) {
    const re = new RegExp(`\\b(${esc(it.name.toLowerCase())}|${esc(it.id)})\\b`);
    if (!re.test(t)) continue;
    const has = toolsAfter.has(it.id);
    if (removing && has) { toolsAfter.delete(it.id); add('−', `tool ${it.id}`, (d) => { d.tools = d.tools.filter((x) => x.id !== it.id); d.approvals = d.approvals.filter((a) => !it.actions.includes(a)); }, `Stop using ${it.name}`); }
    else if (!removing && !has) {
      toolsAfter.add(it.id);
      add('+', `tool ${it.id}`, (d) => { if (!d.tools.some((x) => x.id === it.id)) d.tools.push({ id: it.id, name: it.name, actions: [...it.actions] }); }, `${it.name}: ${it.actions.map(humanizeAction).join(', ')}`);
      for (const a of it.actions) if (isRisky(a) && !(agent.approvals || []).includes(a)) add('+', `approval ${a}`, (d) => { if (!d.approvals.includes(a)) d.approvals.push(a); }, `Safe default: ${humanizeAction(a).toLowerCase()} asks a person first`);
    }
  }

  // Approvals
  const allActions = [];
  for (const id of toolsAfter) { const it = INTEGRATIONS.find((x) => x.id === id); const own = (agent.tools || []).find((x) => x.id === id); for (const a of own?.actions || it?.actions || []) allActions.push(a); }
  const wantsAsk = /\b(ask|check with|confirm with) (me|us|a (person|human)|someone)?\s*(before|first)\b|\bapprov(e|al)\b|\bnever \w+ without\b/.test(t);
  const noAsk = /\b(don'?t|no need to|stop|never) ask\b|\bwithout asking\b|\bauto(matically)?[- ](send|post|reply|book)\b/.test(t);
  if (wantsAsk && !noAsk) {
    const verbs = ['send', 'post', 'reply', 'create', 'update', 'book', 'share', 'delete', 'draft'];
    const hit = verbs.filter((v) => new RegExp(`\\b${v}`).test(t));
    let targets = allActions.filter((a) => hit.some((v) => a.startsWith(v === 'book' ? 'create_event' : v) || a.includes(v)));
    if (!targets.length) targets = allActions.filter(isRisky);
    for (const a of targets) if (!(agent.approvals || []).includes(a)) add('+', `approval ${a}`, (d) => { if (!d.approvals.includes(a)) d.approvals.push(a); }, `${humanizeAction(a)} waits for a person`);
  }
  if (noAsk) for (const a of agent.approvals || []) add('−', `approval ${a}`, (d) => { d.approvals = d.approvals.filter((x) => x !== a); }, `${humanizeAction(a)} runs without asking — risky`);

  // Brain
  const tier = agent.model?.tier;
  if (/\b(faster|cheaper|save money|lower cost|cost matters|quick(er)?)\b/.test(t) && tier !== 'fast') add('~', 'brain → Fast', (d) => { d.model = { ...d.model, tier: 'fast', model: TIER_MODEL.fast }; }, 'Quicker and about half the cost per run');
  else if (/\b(smarter|better quality|more accurate|best model|more careful|think harder|best brain)\b/.test(t) && tier !== 'best') add('~', 'brain → Best', (d) => { d.model = { ...d.model, tier: 'best', model: TIER_MODEL.best }; }, 'Highest quality; about 2.5× the cost per run');
  if (/\bmore (creative|varied|playful)|less robotic\b/.test(t)) add('~', 'creativity ↑', (d) => { d.model = { ...d.model, creativity: Math.min(1, Math.round(((d.model.creativity ?? 0.3) + 0.2) * 10) / 10) }; });
  if (/\bmore (precise|factual|consistent)|less creative\b/.test(t)) add('~', 'creativity ↓', (d) => { d.model = { ...d.model, creativity: Math.max(0, Math.round(((d.model.creativity ?? 0.3) - 0.2) * 10) / 10) }; });

  // Memory
  if (/\b(remember|recall|past conversations|preferences)\b/.test(t) && agent.memory !== 'long-term') add('~', 'memory → long-term', (d) => { d.memory = 'long-term'; }, 'Remembers people and preferences across runs');
  if (/\b(forget|stateless|don'?t remember)\b/.test(t) && agent.memory !== 'none') add('~', 'memory → none', (d) => { d.memory = 'none'; });

  // Schedule
  const sched = raw.match(/\bevery\s+(\d+\s+minutes?|hour|day|morning|weekday|week|monday|tuesday|wednesday|thursday|friday)(\s+at\s+[\d:]+\s*(am|pm)?)?/i);
  if (sched) {
    const detail = sentence(sched[0]).replace(/\.$/, '');
    const instead = /\binstead\b/.test(t);
    add('+', `trigger schedule · ${detail}`, (d) => { if (instead) d.triggers = d.triggers.filter((x) => x.type !== 'schedule'); d.triggers.push({ type: 'schedule', detail }); }, instead ? 'Replaces the current schedule' : null);
  }

  // Limits
  const month = raw.match(/\$\s?(\d+(?:\.\d+)?)\s*(?:a|per|\/)\s*month/i) || raw.match(/cap (?:it )?at \$\s?(\d+(?:\.\d+)?)/i);
  if (month) add('~', `monthly budget → $${month[1]}`, (d) => { d.limits = { ...d.limits, monthlyBudget: +month[1] }; });
  const perRun = raw.match(/\$\s?(\d+(?:\.\d+)?)\s*(?:a|per|\/)\s*run/i);
  if (perRun) add('~', `cost limit → $${perRun[1]}/run`, (d) => { d.limits = { ...d.limits, costPerRun: +perRun[1] }; });
  const steps = raw.match(/(\d+)\s*steps/i);
  if (steps) add('~', `max steps → ${steps[1]}`, (d) => { d.limits = { ...d.limits, steps: +steps[1] }; });

  // Guardrails & topics
  const blocked = raw.match(/\b(?:don'?t|never|avoid|do not)\s+(?:talk|discuss|mention|bring up)(?:\s+about)?\s+([^.,;]+)/i);
  if (blocked) { const topic = sentence(blocked[1]).replace(/\.$/, ''); add('+', `blocked topic · ${topic}`, (d) => { d.guardrails = { ...d.guardrails, blocked: [...new Set([...(d.guardrails.blocked || []), topic])] }; }); }
  const only = raw.match(/\bonly (?:talk|discuss|answer)(?: questions)?(?: about)?\s+([^.,;]+)/i);
  if (only) { const topic = sentence(only[1]).replace(/\.$/, ''); add('+', `allowed topic · ${topic}`, (d) => { d.guardrails = { ...d.guardrails, topics: [...new Set([...(d.guardrails.topics || []), topic])] }; }); }
  if (/\b(redact|pii|personal data|privacy)\b/.test(t) && !agent.guardrails?.pii) add('+', 'guardrail PII redaction', (d) => { d.guardrails = { ...d.guardrails, pii: true }; });
  if (/\b(hallucinat|make things up|invent|made up)\b/.test(t) && !agent.guardrails?.groundedness) add('+', 'guardrail groundedness check', (d) => { d.guardrails = { ...d.guardrails, groundedness: true }; });

  // Output fields
  const outField = raw.match(/\b(?:add|return|include|output)\s+(?:an?\s+)?(?:output|field)?\s*(?:called|named)?\s*[`"“]?([a-z][a-z_ ]{2,24}?)[`"”]?\s+(?:field|output|column)\b/i);
  if (outField) { const key = outField[1].trim().toLowerCase().replace(/\s+/g, '_'); if (!(agent.outputs || []).some((o) => o.key === key)) add('+', `output ${key}`, (d) => { d.outputs.push({ key, type: 'text' }); }, '1 screen may need a new column'); }

  // Style & behaviour → instructions
  const styleRe = /\b(shorter|longer|concise|brief|friendl|warm|formal|casual|tone|always|never|mention|sign[- ]off|emoji|bullet|polite|apolog|explain|cite|in (spanish|french|german|hindi)|first email|decision maker)\b/;
  const onlyStructural = out.length > 0 && !styleRe.test(t);
  if (!onlyStructural) {
    const line = sentence(raw);
    add('~', 'instructions', (d) => { if (!d.instructions.includes(line)) d.instructions = `${d.instructions.trim()}${d.instructions.trim() ? ' ' : ''}${line}`; }, `Adds: “${line}”`);
  }
  return out;
}
