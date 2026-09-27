// Archetype: sales & leads (mirrors the Lead Desk fixture's ids so replies work on it too).
import { col, table, people, companies, emailOf, team, runsTable, B, K, screen, P, stretch } from './kit.js';
import { past, avg, D, H } from './text.js';

const SIGNALS = [
  ['asked for pricing on the webinar', 17, 'Webinar'], ['visited the pricing page 3 times', 15, 'Website'], ['was referred by an existing customer', 16, 'Referral'],
  ['downloaded the ROI guide', 7, 'Website'], ['is on an active trial of a competitor', 12, 'Outbound'], ['booked a demo, then rescheduled twice', 4, 'Website'],
  ['replied “not now, maybe next quarter”', -8, 'Outbound'], ['signed up with a student email', -18, 'Website'], ['attended two webinars and asked about integrations', 10, 'Webinar'],
  ['opened every email but never replied', 0, 'Outbound'], ['came in through a partner intro', 12, 'Referral'], ['requested our security review pack', 14, 'Website'],
];
const FIT = new Set(['Healthcare', 'Logistics', 'Retail', 'Financial services', 'Hospitality', 'Education', 'Software', 'Energy']);

export function leadDraft(row = {}, ctx = {}) {
  const first = String(row.name || 'there').split(' ')[0];
  const rs = String(row.reason || '');
  const why = (rs.includes('—') ? rs.split('—').pop() : rs.split(/[;,]/).pop()).trim();
  const subject = /pricing/.test(why) ? `Pricing for ${row.company || 'your team'}, as promised` : /trial|competitor/.test(why) ? 'An honest side-by-side for your trial' : `A quick idea for ${row.company || 'your team'}`;
  const body = `Hi ${first} — thanks for your interest${why ? ` (I saw you ${why.replace(/^is /, 'are ').replace(/^was /, 'were ')})` : ''}. Teams like ${row.company || 'yours'} usually start with one workflow and see results in the first week. Would a 20-minute call on Thursday work to walk through it?\n\nBest,\n${ctx.sender || 'Meera'}`;
  return { to: row.email, subject, body };
}

export const SALES = {
  id: 'sales', family: 'sales', label: 'Sales & leads', category: 'Sales',
  match: [[/\bleads?\b/, 3], [/pipeline|\bcrm\b|prospect|\bicp\b|ideal customer/, 2], [/\bsales\b|\bdeals?\b|outreach|follow[- ]?ups?|cold (?:email|outreach)|quota|\bsdrs?\b|\bbdrs?\b|account executive/, 1.5]],
  hints: { hubspot: 2, salesforce: 2, apollo: 1, instantly: 1.5 },
  name: (low, q) => (/deal|pipeline|opportunit/.test(low) ? 'Pipeline Pilot' : /outreach|cold/.test(low) ? 'Outreach Desk' : q ? `${q} Leads` : 'Lead Desk'),
  icon: 'target', preset: 'navy', entity: ['lead', 'leads'], team: 'sales team', teamSize: '5–10 people',
  sources: ['hubspot', 'salesforce', 'gsheets', 'airtable'], sourceText: 'Where do your leads come from today?', sourceWhy: 'So the Lead Qualifier reads the right system.',
  usersRec: 'team',
  autonomy: { text: 'Should follow-up emails be sent automatically?', ask: 'Draft only — I approve each send', auto: 'Send automatically', decision: 'Sending email', askA: 'Draft only — a human approves every send', autoA: 'Sent automatically; every send is logged' },
  domainQ: { id: 'q_hot', text: 'What makes a lead “hot” for you?', why: 'This becomes the Lead Qualifier’s scoring rules — editable later.', options: [['fit', 'Company size & industry fit'], ['intent', 'Buying signals — pricing visits, demo requests'], ['both', 'Both, weighted equally']], rec: 'both', decision: 'Hot lead rule' },
  pitch: () => 'Scores inbound leads, explains why, and drafts follow-ups you approve.',
  sampleQuestion: 'Which leads should I call today?',

  build(c) {
    const { r, now, src } = c;
    const ppl = people(r, 12), cos = companies(r, 12), owners = c.team.slice(0, 2);
    const wFit = c.domain === 'fit' ? 0.7 : c.domain === 'intent' ? 0.3 : 0.5;
    const sigs = r.shuffle(SIGNALS);
    const leads = ppl.map((p, i) => {
      const co = cos[i], sig = sigs[i % sigs.length];
      const sizeN = co.size >= 200 ? 1 : co.size >= 50 ? 0.7 : co.size >= 10 ? 0.35 : 0.05;
      const fitN = sizeN * 0.55 + (FIT.has(co.industry) ? 0.45 : 0.15);
      const intentN = (sig[1] + 20) / 40;
      const score = Math.max(8, Math.min(97, Math.round(100 * (wFit * fitN + (1 - wFit) * intentN) + r.int(-4, 4))));
      const tier = score >= 75 ? 'Hot' : score >= 50 ? 'Warm' : 'Cold';
      const stage = tier === 'Hot' ? r.pick(['Qualified', 'Contacted', 'Meeting', 'Won']) : tier === 'Warm' ? r.pick(['New', 'Qualified', 'Contacted']) : r.pick(['New', 'Lost']);
      return { id: `l${i + 1}`, name: p.name, company: co.name, email: emailOf(p, co.domain), source: sig[2], employees: co.size, score, tier, reason: `${co.industry}, ${co.size.toLocaleString('en-US')} staff — ${sig[0]}`, stage, owner: owners[i % 2], created: past(r, now, 5, 1 + i * 0.4) };
    }).sort((a, b) => b.created - a.created);

    const hot = leads.filter((l) => l.tier === 'Hot').sort((a, b) => b.score - a.score);
    const draftSrc = (hot.length >= 3 ? hot : leads.slice().sort((a, b) => b.score - a.score)).slice(0, 5);
    const statuses = c.autonomy === 'auto' ? ['Sent', 'Sent', 'Approved', 'Sent', 'Sent'] : ['Needs approval', 'Needs approval', 'Approved', 'Sent', 'Sent'];
    const drafts = draftSrc.map((l, i) => { const d = leadDraft(l, { sender: l.owner }); return { id: `d${i + 1}`, lead: l.name, subject: d.subject, body: d.body, status: statuses[i], created: now - (1.5 + i * 7) * H }; });

    const tables = [
      table('leads', 'Leads', 'target', [
        col('name', 'Name', 'person'), col('company', 'Company', 'text'), col('email', 'Email', 'email'), col('source', 'Source', 'status', ['Website', 'Webinar', 'Referral', 'Outbound']),
        col('employees', 'Employees', 'number'), col('score', 'Score', 'score'), col('tier', 'Tier', 'status', ['Hot', 'Warm', 'Cold']), col('reason', 'Why this score', 'longtext'),
        col('stage', 'Stage', 'status', ['New', 'Qualified', 'Contacted', 'Meeting', 'Won', 'Lost']), col('owner', 'Owner', 'person'), col('created', 'Created', 'datetime'),
      ], leads, { connection: src?.id, rules: c.users === 'me' ? 'Only you can see leads.' : 'Only signed-in teammates can see leads. Owners can edit their own leads.' }),
      table('drafts', 'Email drafts', 'mail', [
        col('lead', 'Lead', 'person'), col('subject', 'Subject', 'text'), col('body', 'Body', 'longtext'), col('status', 'Status', 'status', ['Needs approval', 'Approved', 'Sent']), col('created', 'Created', 'datetime'),
      ], drafts, { connection: c.mail.id, rules: 'Drafts are private to the lead owner until approved.' }),
    ];

    const research = /research|linkedin|news|account plan|before (?:every|each|the) call|brief/.test(c.low);
    const srcRead = src ? `${src.id}.${src.read[0]} → ` : '';
    const { agents, lead, specs } = team(c, [
      {
        id: 'a_qualifier', name: 'Lead Qualifier', alias: ['qualif', 'scor'], handles: 'scoring and “why is this lead hot?” questions',
        role: 'Scores every new lead 0–100 against your ideal customer profile',
        goal: 'Give every inbound lead a score and a one-sentence reason within 5 minutes.',
        instructions: `Score each new lead from 0–100 against the ideal customer profile in ICP.pdf. ${wFit > 0.5 ? 'Weight company size and industry most.' : wFit < 0.5 ? 'Weight buying signals most — pricing-page visits, demo requests and replies.' : 'Weight company fit and buying signals equally.'} Enrich the company with Apollo first. 75+ is Hot, 50–74 Warm, below 50 Cold. Always write a one-sentence reason a salesperson would find useful. Never invent company facts — say "unknown" instead.`,
        creativity: 0.1, knowledge: [['file', 'ICP.pdf', '84 KB'], ['table', 'Won deals 2025', '312 rows']],
        tools: [src && [src.id, [...src.read, ...src.write.slice(0, 1)]], ['apollo', ['enrich_company']]],
        triggers: [['schedule', 'Every 5 minutes'], src ? ['webhook', `${src.name}: new ${src.id === 'gsheets' || src.id === 'airtable' ? 'row added' : 'contact created'}`] : ['event', 'A lead is added in the app']],
        outputs: [['score', 'number', '0–100'], ['tier', 'Hot | Warm | Cold'], ['reason', 'text']], toxicity: false, costPerRun: 0.05, budget: 30,
        runs: [['Scored 3 new leads', `${srcRead}apollo.enrich_company ×3 → score`], ['Scored 2 new leads', `${srcRead}apollo.enrich_company ×2 → score`]],
      },
      {
        id: 'a_email', name: 'Email Drafter', alias: ['email', 'draft', 'writ', 'follow'], handles: 'writing and follow-up tasks',
        role: c.autonomy === 'auto' ? 'Writes and sends personalised follow-ups to hot leads' : 'Writes personalised follow-ups for hot leads — you approve before sending',
        goal: 'Draft a relevant, on-brand follow-up within an hour of a lead turning Hot.',
        instructions: 'Write a short, personal follow-up email (under 120 words) for the lead, referencing why they scored well. Use the tone guide. Offer one clear next step. Never promise discounts or make legal commitments.',
        creativity: 0.6, memory: 'long-term', knowledge: [['file', 'Tone guide.md', '6 KB'], ['file', 'pricing.pdf', '220 KB']],
        tools: [c.mailTool, src?.note && [src.id, [src.note]]], risky: [c.mail.send],
        triggers: [['event', 'A lead becomes Hot'], ['chat', 'Email Drafter panel']], outputs: [['subject', 'text'], ['body', 'text']],
        blocked: ['Discounts', 'Legal commitments'],
        runs: [[`Drafted follow-up for ${drafts[0]?.lead || 'a hot lead'}`, `ICP.pdf p.3 · Tone guide · ${c.mail.id}.${c.mail.draft || c.mail.send}${c.autonomy === 'auto' ? '' : ' (awaiting approval)'}`], [`Drafted follow-up for ${drafts[1]?.lead || 'a hot lead'}`, `pricing.pdf p.1 · ${c.mail.id}.${c.mail.draft || c.mail.send}`]],
      },
      research && {
        id: 'a_research', name: 'Account Researcher', alias: ['research'], handles: 'account research before calls',
        role: 'Builds a one-page brief on each hot account before your call',
        goal: 'Every hot lead has a fresh account brief before the first call.',
        instructions: 'For each hot lead, research the company on the web and LinkedIn: what they do, recent news, likely priorities and who else to involve. Write a brief of 5 bullets with a source link on every bullet. Only use public information and never guess revenue.',
        creativity: 0.3, tools: [['websearch', ['search_web']], ['scraper', ['read_url']], c.has('linkedin') && ['linkedin', ['lookup_profile']]],
        triggers: [['event', 'A lead becomes Hot']], outputs: [['brief', 'markdown'], ['sources', 'list']],
        runs: [[`Researched ${hot[0]?.company || 'a hot account'}`, 'websearch.search_web ×3 · scraper.read_url ×2 → brief']],
      },
    ], { name: `${c.name} Manager`, knowledge: [['file', 'ICP.pdf', '84 KB']], topics: ['Sales pipeline', 'Our product'], blocked: ['Competitor pricing speculation'] });
    tables.push(runsTable(c, agents, specs));

    const today = leads.filter((l) => now - l.created < D).length;
    const hotN = leads.filter((l) => l.tier === 'Hot').length;
    const writer = agents.find((a) => a.id.startsWith('a_email'))?.id || lead;
    const qualId = agents.find((a) => a.id.startsWith('a_qualifier'))?.id || lead;
    const top = hot[0] || leads[0], second = hot[1] || leads[1];
    const screens = [
      screen('s_leads', '/leads', 'Leads', 'target', [
        B.header('b_leads_header', '/leads', 'Leads', `Scored automatically by Lead Qualifier${src ? ` · synced from ${src.name}` : ''}`, [['Import CSV', 'secondary', 'upload'], ['Add lead', 'primary', 'plus']], { promise: 'P5' }),
        B.kpis('b_leads_kpis', [K('New today', today || 1, `+${r.int(1, 4)} vs yesterday`, 'up', 'user-plus'), K('Hot leads', hotN, 'score ≥ 75', 'flat', 'target'), K('Average score', Math.round(avg(leads.map((l) => l.score))), `+${r.int(1, 5)} this week`, 'up', 'gauge'), K('Reply rate', `${r.int(24, 38)}%`, `+${r.int(2, 7)} pts`, 'up', 'mail')], { table: 'leads', promise: 'P5', file: 'components/LeadKpis.tsx' }),
        B.table('b_leads_table', 'leads', { title: 'All leads', file: 'components/LeadTable.tsx', promise: 'P1', agent: qualId, columns: ['name', 'company', 'source', 'score', 'tier', 'stage', 'owner'], filters: ['tier', 'stage'], rowAction: { label: 'Draft follow-up', agent: writer } }),
        B.chat('b_leads_chat', lead, { title: `Ask ${c.name}`, file: `components/Ask${c.pascal}.tsx`, promise: 'P2', greeting: 'Hi! I can find, explain and follow up on leads. Try a question below.', placeholder: 'Ask about your leads…', suggestions: ['Which leads should I call today?', `Why is ${top.company} scored ${top.score}?`, `Draft a follow-up for ${second.name.split(' ')[0]}`] }),
        B.chart('b_leads_sources', { title: 'Leads by source', table: 'leads', kind: 'donut', groupBy: 'source', promise: 'P5', file: 'components/SourceChart.tsx' }),
        B.activity('b_leads_activity', qualId, { file: 'components/AgentActivity.tsx' }),
        B.chart('b_leads_stages', { title: 'Pipeline by stage', table: 'leads', kind: 'bar', groupBy: 'stage', promise: 'P5', file: 'components/StageChart.tsx' }),
      ]),
      screen('s_outreach', '/outreach', 'Outreach', 'mail', [
        B.header('b_out_header', '/outreach', 'Outreach', c.autonomy === 'auto' ? 'Follow-ups go out automatically — every send is logged here' : 'Drafts wait for your approval before anything is sent', [[c.autonomy === 'auto' ? 'Pause sending' : 'Approve all ready', 'primary', c.autonomy === 'auto' ? 'pause' : 'check']]),
        B.kanban('b_out_board', 'drafts', { title: 'Follow-ups', span: 8, file: 'components/DraftBoard.tsx', promise: 'P3', agent: writer, groupBy: 'status', titleKey: 'subject', subtitleKey: 'lead' }),
        B.chat('b_out_chat', writer, { title: 'Email Drafter', file: 'components/DrafterChat.tsx', promise: 'P4', greeting: `Tell me who to write to and what matters — I’ll draft it in your tone.${c.autonomy === 'auto' ? '' : ' I never send without your approval.'}`, placeholder: `e.g. Warm follow-up for ${leads[3].name.split(' ')[0]} about the demo`, suggestions: ['Make it shorter and friendlier', `Follow up with ${leads[3].name}`, 'Mention our SOC 2 report'] }),
      ]),
      screen('s_insights', '/insights', 'Insights', 'bar-chart', [
        B.header('b_ins_header', '/insights', 'Insights', 'How your pipeline and your agents are performing'),
        B.kpis('b_ins_kpis', [K('Leads this month', r.int(140, 260), `+${r.int(8, 24)}%`, 'up', 'users'), K('Meetings booked', r.int(18, 34), `+${r.int(3, 9)}`, 'up', 'calendar'), K('Hours saved', `${r.int(30, 60)} h`, 'by agents', 'flat', 'clock'), K('Agent cost', `$${(2 + r() * 3).toFixed(2)}`, '$0.02 / lead', 'flat', 'coins')], { file: 'components/InsightKpis.tsx' }),
        B.chart('b_ins_trend', { title: 'Average lead score, last 8 weeks', kind: 'area', span: 8, file: 'components/ScoreTrend.tsx', series: [52, 55, 54, 58, 61, 60, 63, 64].map((v, i) => ({ label: `W${i + 1}`, value: v + r.int(-2, 2) })) }),
        B.text('b_ins_text', `**${top.source} leads convert best** — ${hotN} hot leads this week, led by ${top.company} (${top.score}). ${drafts.filter((d) => d.status === 'Needs approval').length ? `${drafts.filter((d) => d.status === 'Needs approval').length} drafts are waiting for your approval.` : 'Every follow-up has gone out.'}`, { title: 'This week in one paragraph', span: 4, agent: lead, file: 'components/WeeklySummary.tsx' }),
      ]),
    ];

    const promises = [
      P('P1', 'Score every new lead from 0–100 against your ideal customer profile', `New ${src ? src.name + ' ' : ''}leads are enriched and scored within 5 minutes.`, ['A 400-person healthcare lead scores 75 or more', 'A freelancer scores under 30', 'New leads are scored within 5 minutes'], [qualId, 'leads'], 3),
      P('P2', 'Explain every score in one plain sentence', 'Salespeople see why a lead is hot without opening anything.', ['Every scored lead has a reason', 'Reasons mention a real fact about the lead'], [qualId], 1),
      P('P3', 'Draft a personalised follow-up for every hot lead', 'Hot leads (score 75+) get a draft in your tone within an hour.', ['A draft exists for each Hot lead', 'Drafts are under 120 words', 'Drafts use the tone guide'], [writer, 'drafts'], 2.5),
      c.autonomy === 'auto'
        ? P('P4', 'Send follow-ups automatically — and log every send', 'Hot leads hear back within an hour; you can pause sending anytime.', ['Every send appears in Agent runs', 'Sending stops within 1 minute of pressing Pause'], [writer], 0.8)
        : P('P4', 'Never send an email without your approval', 'Sending is always a human decision.', [`${c.mail.send} requires approval in every run mode`], [writer], 0.6),
      P('P5', 'Show a live dashboard of leads, sources and stages', 'One screen for the whole pipeline.', ['Dashboard loads in under 2 s', 'Charts match the table'], ['s_leads', 's_insights'], 3),
    ];
    if (research) promises.push(P('P6', 'Research every hot account before your first call', 'A five-bullet brief with sources, ready when the lead turns Hot.', ['Each hot lead has a brief', 'Every bullet links to a source'], ['a_research'], 2));
    promises.push(stretch(c, `P${promises.length + 1}`, `Alert ${c.chat.id === 'slack' ? '#sales in Slack' : `the team in ${c.chat.name}`} when a hot lead arrives`, 'Instant heads-up for the team.', [`A ${c.chat.name} message is posted within 1 minute of a Hot score`], { integration: c.chat.id, est: [3, 4] }));

    return {
      tables, agents, lead, screens, promises,
      summary: `A lead desk for ${c.audienceShort}: every new ${src ? src.name + ' ' : ''}lead is scored against your ideal customer profile with a one-line reason, hot leads get a personalised follow-up ${c.autonomy === 'auto' ? 'sent automatically' : 'draft that you approve'}, and a dashboard shows the pipeline at a glance.`,
      description: c.autonomy === 'auto' ? 'Scores inbound leads, explains why, and follows up automatically.' : 'Scores inbound leads, explains why, and drafts follow-ups you approve.',
      decisions: [{ q: 'Hot lead threshold', a: 'Score of 75 or more (editable)' }],
      env: [['ICP_MIN_EMPLOYEES', 25], ['HOT_LEAD_THRESHOLD', 75]],
    };
  },
  reply: { table: 'leads', title: 'name', sub: 'company', metric: 'score', reason: 'reason', status: 'tier', draft: leadDraft, draftTable: 'drafts' },
};
