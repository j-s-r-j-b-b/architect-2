// A complete, realistic example project ("Lead Desk") used to seed new accounts and as the
// reference for every module's development. It shows the full contract from schema.js.
import { uid, deepClone } from '../lib/util.js';

const H = 3600e3, D = 86400e3;

export function leadDeskProject() {
  const now = Date.now();
  const id = uid('p');

  const leads = [
    { id: 'l1', name: 'Priya Raman', company: 'Northwind Health', email: 'priya@northwind.health', source: 'Webinar', employees: 420, score: 91, tier: 'Hot', reason: 'Healthcare, 400+ staff, asked for pricing on the webinar', stage: 'Qualified', owner: 'Meera', created: now - 2 * H },
    { id: 'l2', name: 'Daniel Okafor', company: 'Brightline Logistics', email: 'daniel@brightline.io', source: 'Website', employees: 1200, score: 86, tier: 'Hot', reason: 'Logistics enterprise; visited pricing page 3 times', stage: 'Contacted', owner: 'Arjun', created: now - 5 * H },
    { id: 'l3', name: 'Sofia Marquez', company: 'Casa Verde Foods', email: 'sofia@casaverde.mx', source: 'Referral', employees: 85, score: 78, tier: 'Hot', reason: 'Referred by an existing customer; budget confirmed', stage: 'Meeting', owner: 'Meera', created: now - 9 * H },
    { id: 'l4', name: 'Liam Chen', company: 'Quanta Robotics', email: 'liam@quanta.ai', source: 'Outbound', employees: 60, score: 64, tier: 'Warm', reason: 'Good fit industry, but small team for now', stage: 'New', owner: 'Arjun', created: now - 14 * H },
    { id: 'l5', name: 'Hannah Weiss', company: 'Keller & Partner', email: 'h.weiss@kellerpartner.de', source: 'Website', employees: 35, score: 52, tier: 'Warm', reason: 'Professional services; downloaded the ROI guide', stage: 'New', owner: 'Meera', created: now - 20 * H },
    { id: 'l6', name: 'Marcus Johnson', company: 'Evergreen Schools', email: 'mjohnson@evergreen.edu', source: 'Webinar', employees: 900, score: 73, tier: 'Warm', reason: 'Large org, education budget cycle starts in Q1', stage: 'Qualified', owner: 'Arjun', created: now - 1 * D },
    { id: 'l7', name: 'Aiko Tanaka', company: 'Sakura Retail', email: 'aiko@sakura-retail.jp', source: 'Referral', employees: 240, score: 82, tier: 'Hot', reason: 'Retail chain, active trial of a competitor', stage: 'Contacted', owner: 'Meera', created: now - 1.3 * D },
    { id: 'l8', name: 'Tom Becker', company: 'Solo Studio', email: 'tom@solostudio.co', source: 'Website', employees: 3, score: 18, tier: 'Cold', reason: 'Freelancer — outside the ideal customer profile', stage: 'Lost', owner: 'Arjun', created: now - 2 * D },
    { id: 'l9', name: 'Grace Mwangi', company: 'Savanna Fintech', email: 'grace@savannafin.com', source: 'Outbound', employees: 150, score: 69, tier: 'Warm', reason: 'Fintech, growing fast; no decision maker yet', stage: 'New', owner: 'Meera', created: now - 2.4 * D },
    { id: 'l10', name: 'Oliver Grant', company: 'Grant Architects', email: 'oliver@grantarch.co.uk', source: 'Webinar', employees: 48, score: 57, tier: 'Warm', reason: 'Attended 2 webinars; asked about integrations', stage: 'Contacted', owner: 'Arjun', created: now - 3 * D },
    { id: 'l11', name: 'Nadia Haddad', company: 'Cedar Hospitality', email: 'nadia@cedarhotels.com', source: 'Referral', employees: 610, score: 88, tier: 'Hot', reason: 'Hotel group; champion from a previous company', stage: 'Won', owner: 'Meera', created: now - 4 * D },
    { id: 'l12', name: 'Ethan Brooks', company: 'Brooks & Co', email: 'ethan@brooksco.com', source: 'Website', employees: 12, score: 31, tier: 'Cold', reason: 'Very small team, student email domain on signup', stage: 'New', owner: 'Arjun', created: now - 5 * D },
  ];

  const drafts = [
    { id: 'd1', lead: 'Priya Raman', subject: 'Your pricing question from Tuesday’s webinar', body: 'Hi Priya — thanks for joining the webinar. You asked how pricing scales for 400+ staff; here’s a one-page breakdown for Northwind…', status: 'Needs approval', created: now - 1.5 * H },
    { id: 'd2', lead: 'Daniel Okafor', subject: 'Routing 1,200 drivers’ questions without extra headcount', body: 'Hi Daniel — noticed Brightline has been looking at our pricing page. Teams your size usually start with…', status: 'Needs approval', created: now - 4 * H },
    { id: 'd3', lead: 'Aiko Tanaka', subject: 'A side-by-side for your current trial', body: 'Hi Aiko — if you’re comparing tools this month, here’s an honest comparison…', status: 'Approved', created: now - 1.2 * D },
    { id: 'd4', lead: 'Sofia Marquez', subject: 'Agenda for Thursday', body: 'Hi Sofia — looking forward to Thursday. I’ll bring the rollout plan we discussed…', status: 'Sent', created: now - 1.6 * D },
    { id: 'd5', lead: 'Nadia Haddad', subject: 'Welcome aboard, Cedar Hospitality', body: 'Hi Nadia — thrilled to be working together. Your onboarding call is booked…', status: 'Sent', created: now - 3.8 * D },
  ];

  const activity = [
    { id: 'r1', at: now - 12 * 60e3, agent: 'Lead Qualifier', action: 'Scored 3 new leads', detail: 'hubspot.search_contacts → apollo.enrich_company ×3 → score', cost: 0.09 },
    { id: 'r2', at: now - 90 * 60e3, agent: 'Email Drafter', action: 'Drafted follow-up for Priya Raman', detail: 'ICP.pdf p.3 · Tone guide · gmail.create_draft (awaiting approval)', cost: 0.04 },
    { id: 'r3', at: now - 4 * H, agent: 'Email Drafter', action: 'Drafted follow-up for Daniel Okafor', detail: 'pricing.pdf p.1 · gmail.create_draft (awaiting approval)', cost: 0.04 },
    { id: 'r4', at: now - 5 * H, agent: 'Lead Qualifier', action: 'Scored 2 new leads', detail: 'hubspot.search_contacts → apollo.enrich_company ×2 → score', cost: 0.06 },
    { id: 'r5', at: now - 26 * H, agent: 'Lead Desk Manager', action: 'Answered “Which leads should I call today?”', detail: 'delegated → Lead Qualifier · leads table (Sample)', cost: 0.02 },
  ];

  const tables = [
    {
      id: 'leads', name: 'Leads', icon: 'target', source: 'sample', connection: 'hubspot',
      rules: 'Only signed-in teammates can see leads. Owners can edit their own leads.',
      columns: [
        { key: 'name', label: 'Name', type: 'person' },
        { key: 'company', label: 'Company', type: 'text' },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'source', label: 'Source', type: 'status', options: ['Website', 'Webinar', 'Referral', 'Outbound'] },
        { key: 'employees', label: 'Employees', type: 'number' },
        { key: 'score', label: 'Score', type: 'score' },
        { key: 'tier', label: 'Tier', type: 'status', options: ['Hot', 'Warm', 'Cold'] },
        { key: 'reason', label: 'Why this score', type: 'longtext' },
        { key: 'stage', label: 'Stage', type: 'status', options: ['New', 'Qualified', 'Contacted', 'Meeting', 'Won', 'Lost'] },
        { key: 'owner', label: 'Owner', type: 'person' },
        { key: 'created', label: 'Created', type: 'datetime' },
      ],
      rows: leads,
    },
    {
      id: 'drafts', name: 'Email drafts', icon: 'mail', source: 'sample', connection: 'gmail',
      rules: 'Drafts are private to the lead owner until approved.',
      columns: [
        { key: 'lead', label: 'Lead', type: 'person' },
        { key: 'subject', label: 'Subject', type: 'text' },
        { key: 'body', label: 'Body', type: 'longtext' },
        { key: 'status', label: 'Status', type: 'status', options: ['Needs approval', 'Approved', 'Sent'] },
        { key: 'created', label: 'Created', type: 'datetime' },
      ],
      rows: drafts,
    },
    {
      id: 'agent_runs', name: 'Agent runs', icon: 'activity', source: 'test', connection: null,
      rules: 'Written by agents; read-only for teammates.',
      columns: [
        { key: 'at', label: 'When', type: 'datetime' },
        { key: 'agent', label: 'Agent', type: 'text' },
        { key: 'action', label: 'What happened', type: 'text' },
        { key: 'detail', label: 'Steps', type: 'longtext' },
        { key: 'cost', label: 'Cost ($)', type: 'money' },
      ],
      rows: activity,
    },
  ];

  const screens = [
    {
      id: 's_leads', route: '/leads', title: 'Leads', icon: 'target', nav: true,
      blocks: [
        { id: 'b_leads_header', type: 'header', span: 12, file: 'app/leads/page.tsx', promise: 'P5', props: { title: 'Leads', subtitle: 'Scored automatically by Lead Qualifier · refreshed every 5 minutes', actions: [{ label: 'Import CSV', variant: 'secondary', icon: 'upload' }, { label: 'Add lead', variant: 'primary', icon: 'plus' }] } },
        { id: 'b_leads_kpis', type: 'kpis', span: 12, file: 'components/LeadKpis.tsx', promise: 'P5', bind: { table: 'leads' }, props: { items: [{ label: 'New today', value: '18', delta: '+4 vs yesterday', tone: 'up', icon: 'user-plus' }, { label: 'Hot leads', value: '6', delta: 'score ≥ 75', tone: 'flat', icon: 'target' }, { label: 'Average score', value: '64', delta: '+3 this week', tone: 'up', icon: 'gauge' }, { label: 'Reply rate', value: '31%', delta: '+6 pts', tone: 'up', icon: 'mail' }] } },
        { id: 'b_leads_table', type: 'table', span: 8, title: 'All leads', file: 'components/LeadTable.tsx', promise: 'P1', bind: { table: 'leads', agent: 'a_qualifier' }, props: { columns: ['name', 'company', 'source', 'score', 'tier', 'stage', 'owner'], searchable: true, filters: ['tier', 'stage'], rowAction: { label: 'Draft follow-up', agent: 'a_email' }, pageSize: 8 } },
        { id: 'b_leads_chat', type: 'agentChat', span: 4, title: 'Ask Lead Desk', file: 'components/AskLeadDesk.tsx', promise: 'P2', bind: { agent: 'a_manager' }, props: { greeting: 'Hi! I can find, explain and follow up on leads. Try a question below.', placeholder: 'Ask about your leads…', suggestions: ['Which leads should I call today?', 'Why is Brightline scored 86?', 'Draft a follow-up for Aiko'] } },
        { id: 'b_leads_sources', type: 'chart', span: 4, title: 'Leads by source', file: 'components/SourceChart.tsx', promise: 'P5', bind: { table: 'leads' }, props: { kind: 'donut', groupBy: 'source', metric: 'count' } },
        { id: 'b_leads_activity', type: 'agentActivity', span: 4, title: 'What the agents did', file: 'components/AgentActivity.tsx', bind: { agent: 'a_qualifier', table: 'agent_runs' }, props: { limit: 4 } },
        { id: 'b_leads_stages', type: 'chart', span: 4, title: 'Pipeline by stage', file: 'components/StageChart.tsx', promise: 'P5', bind: { table: 'leads' }, props: { kind: 'bar', groupBy: 'stage', metric: 'count' } },
      ],
    },
    {
      id: 's_outreach', route: '/outreach', title: 'Outreach', icon: 'mail', nav: true,
      blocks: [
        { id: 'b_out_header', type: 'header', span: 12, file: 'app/outreach/page.tsx', props: { title: 'Outreach', subtitle: 'Drafts wait for your approval before anything is sent', actions: [{ label: 'Approve all ready', variant: 'primary', icon: 'check' }] } },
        { id: 'b_out_board', type: 'kanban', span: 8, title: 'Follow-ups', file: 'components/DraftBoard.tsx', promise: 'P3', bind: { table: 'drafts', agent: 'a_email' }, props: { groupBy: 'status', titleKey: 'subject', subtitleKey: 'lead' } },
        { id: 'b_out_chat', type: 'agentChat', span: 4, title: 'Email Drafter', file: 'components/DrafterChat.tsx', promise: 'P4', bind: { agent: 'a_email' }, props: { greeting: 'Tell me who to write to and what matters — I’ll draft it in your tone. I never send without your approval.', placeholder: 'e.g. Warm follow-up for Liam about the demo', suggestions: ['Shorter and friendlier', 'Follow up with Liam Chen', 'Mention our SOC 2 report'] } },
      ],
    },
    {
      id: 's_insights', route: '/insights', title: 'Insights', icon: 'bar-chart', nav: true,
      blocks: [
        { id: 'b_ins_header', type: 'header', span: 12, file: 'app/insights/page.tsx', props: { title: 'Insights', subtitle: 'How your pipeline and your agents are performing' } },
        { id: 'b_ins_kpis', type: 'kpis', span: 12, file: 'components/InsightKpis.tsx', props: { items: [{ label: 'Leads this month', value: '212', delta: '+18%', tone: 'up', icon: 'users' }, { label: 'Meetings booked', value: '27', delta: '+9', tone: 'up', icon: 'calendar' }, { label: 'Hours saved', value: '46 h', delta: 'by agents', tone: 'flat', icon: 'clock' }, { label: 'Agent cost', value: '$3.84', delta: '$0.02 / lead', tone: 'flat', icon: 'coins' }] } },
        { id: 'b_ins_trend', type: 'chart', span: 8, title: 'Average lead score, last 8 weeks', file: 'components/ScoreTrend.tsx', props: { kind: 'area', series: [{ label: 'W1', value: 52 }, { label: 'W2', value: 55 }, { label: 'W3', value: 54 }, { label: 'W4', value: 58 }, { label: 'W5', value: 61 }, { label: 'W6', value: 60 }, { label: 'W7', value: 63 }, { label: 'W8', value: 64 }] } },
        { id: 'b_ins_text', type: 'text', span: 4, title: 'This week in one paragraph', file: 'components/WeeklySummary.tsx', bind: { agent: 'a_manager' }, props: { body: '**Webinar leads convert best** — 3 of 4 hot leads came from Tuesday’s session. Referrals score highest on average (84). Two drafts are waiting for your approval.' } },
      ],
    },
  ];

  const agents = [
    {
      id: 'a_manager', name: 'Lead Desk Manager', kind: 'manager', color: '#7446F0', framework: 'architect',
      role: 'Understands your question and hands it to the right specialist',
      goal: 'Answer questions about the pipeline and route work to specialists.',
      instructions: 'You coordinate the Lead Desk team. When the user asks about leads, delegate scoring questions to Lead Qualifier and writing tasks to Email Drafter. Always cite which leads you looked at. Keep answers under 5 sentences.',
      model: { tier: 'balanced', provider: 'Anthropic', model: 'claude-sonnet-5', creativity: 0.3 },
      knowledge: [{ id: 'k1', type: 'file', name: 'ICP.pdf', size: '84 KB', status: 'ready' }],
      tools: [],
      approvals: [],
      limits: { costPerRun: 0.1, steps: 15, monthlyBudget: 20 },
      guardrails: { pii: true, injection: true, toxicity: true, groundedness: true, topics: ['Sales pipeline', 'Our product'], blocked: ['Competitor pricing speculation'] },
      memory: 'session',
      triggers: [{ type: 'chat', detail: 'Ask Lead Desk panel' }],
      outputs: [{ key: 'answer', type: 'text' }, { key: 'citations', type: 'list' }],
      usedBy: ['s_leads', 's_insights'],
      delegatesTo: ['a_qualifier', 'a_email'],
      version: 2, status: 'draft', evalScore: 0.88,
      stats: { runs: 64, cost: 0.92, latencyMs: 2100, errors: 1 },
    },
    {
      id: 'a_qualifier', name: 'Lead Qualifier', kind: 'worker', color: '#2F5BEA', framework: 'architect',
      role: 'Scores every new lead 0–100 against your ideal customer profile',
      goal: 'Give every inbound lead a score and a one-sentence reason within 5 minutes.',
      instructions: 'Score each new lead from 0–100 against the ideal customer profile in ICP.pdf. Enrich the company with Apollo first. 75+ is Hot, 50–74 Warm, below 50 Cold. Always write a one-sentence reason a salesperson would find useful. Never invent company facts — say "unknown" instead.',
      model: { tier: 'balanced', provider: 'Anthropic', model: 'claude-sonnet-5', creativity: 0.1 },
      knowledge: [{ id: 'k2', type: 'file', name: 'ICP.pdf', size: '84 KB', status: 'ready' }, { id: 'k3', type: 'table', name: 'Won deals 2025', size: '312 rows', status: 'ready' }],
      tools: [{ id: 'hubspot', name: 'HubSpot', actions: ['search_contacts', 'update_deal'] }, { id: 'apollo', name: 'Apollo', actions: ['enrich_company'] }],
      approvals: [],
      limits: { costPerRun: 0.05, steps: 12, monthlyBudget: 30 },
      guardrails: { pii: true, injection: true, toxicity: false, groundedness: true, topics: [], blocked: [] },
      memory: 'none',
      triggers: [{ type: 'schedule', detail: 'Every 5 minutes' }, { type: 'webhook', detail: 'HubSpot: new contact created' }],
      outputs: [{ key: 'score', type: 'number', desc: '0–100' }, { key: 'tier', type: 'Hot | Warm | Cold' }, { key: 'reason', type: 'text' }],
      usedBy: ['s_leads'],
      version: 3, status: 'draft', evalScore: 0.91,
      stats: { runs: 212, cost: 2.12, latencyMs: 3400, errors: 2 },
    },
    {
      id: 'a_email', name: 'Email Drafter', kind: 'worker', color: '#139B4F', framework: 'architect',
      role: 'Writes personalised follow-ups for hot leads — you approve before sending',
      goal: 'Draft a relevant, on-brand follow-up within an hour of a lead turning Hot.',
      instructions: 'Write a short, personal follow-up email (under 120 words) for the lead, referencing why they scored well. Use the tone guide. Offer one clear next step. Never promise discounts. Drafts must be approved by the lead owner before sending.',
      model: { tier: 'balanced', provider: 'Anthropic', model: 'claude-sonnet-5', creativity: 0.6 },
      knowledge: [{ id: 'k4', type: 'file', name: 'Tone guide.md', size: '6 KB', status: 'ready' }, { id: 'k5', type: 'file', name: 'pricing.pdf', size: '220 KB', status: 'ready' }],
      tools: [{ id: 'gmail', name: 'Gmail', actions: ['create_draft', 'send_email'] }, { id: 'hubspot', name: 'HubSpot', actions: ['create_note'] }],
      approvals: ['send_email'],
      limits: { costPerRun: 0.08, steps: 10, monthlyBudget: 25 },
      guardrails: { pii: true, injection: true, toxicity: true, groundedness: true, topics: [], blocked: ['Discounts', 'Legal commitments'] },
      memory: 'long-term',
      triggers: [{ type: 'event', detail: 'A lead becomes Hot' }, { type: 'chat', detail: 'Email Drafter panel' }],
      outputs: [{ key: 'subject', type: 'text' }, { key: 'body', type: 'text' }],
      usedBy: ['s_outreach', 's_leads'],
      version: 2, status: 'draft', evalScore: 0.84,
      stats: { runs: 38, cost: 1.52, latencyMs: 4100, errors: 0 },
    },
  ];

  const promises = [
    { id: 'P1', title: 'Score every new lead from 0–100 against your ideal customer profile', detail: 'New HubSpot contacts are enriched and scored within 5 minutes.', checks: ['A 400-person healthcare lead scores 75 or more', 'A freelancer scores under 30', 'New leads are scored within 5 minutes'], status: 'verified', cost: [8, 11], refs: ['a_qualifier', 'leads'], proof: 'Test run: 12/12 sample leads scored, median 2.8 s' },
    { id: 'P2', title: 'Explain every score in one plain sentence', detail: 'Salespeople see why a lead is hot without opening anything.', checks: ['Every scored lead has a reason', 'Reasons mention a real fact about the lead'], status: 'verified', cost: [3, 4], refs: ['a_qualifier'], proof: 'Groundedness check 0.93 on 12 reasons' },
    { id: 'P3', title: 'Draft a personalised follow-up for every hot lead', detail: 'Hot leads (score 75+) get a draft in your tone within an hour.', checks: ['A draft exists for each Hot lead', 'Drafts are under 120 words', 'Drafts use the tone guide'], status: 'verified', cost: [7, 9], refs: ['a_email', 'drafts'], proof: '5/5 hot leads have drafts' },
    { id: 'P4', title: 'Never send an email without your approval', detail: 'Sending is always a human decision.', checks: ['send_email requires approval in every run mode'], status: 'verified', cost: [1, 2], refs: ['a_email'], proof: 'Approval gate enforced by the platform (rule R1)' },
    { id: 'P5', title: 'Show a live dashboard of leads, sources and stages', detail: 'One screen for the whole pipeline.', checks: ['Dashboard loads in under 2 s', 'Charts match the table'], status: 'verified', cost: [9, 12], refs: ['s_leads', 's_insights'], proof: 'Screenshot of /leads (desktop + mobile)' },
    { id: 'P6', title: 'Alert #sales in Slack when a hot lead arrives', detail: 'Instant heads-up for the team.', checks: ['A Slack message is posted within 1 minute of a Hot score'], status: 'deferred', cost: [3, 4], deferredReason: 'Needs a Slack connection — include it anytime (≈4 credits).', refs: [] },
  ];

  const project = {
    id,
    slug: `lead-desk-${id.slice(-4)}`,
    name: 'Lead Desk',
    description: 'Scores inbound leads, explains why, and drafts follow-ups you approve.',
    prompt: 'Score inbound HubSpot leads against our ideal customer profile, draft personalised follow-up emails for the best ones, and alert the team in Slack when a hot lead arrives.',
    icon: 'target',
    color: '#2F5BEA',
    createdAt: now - 3 * D,
    updatedAt: now - 20 * 60e3,
    status: 'built',
    archetype: 'sales',
    questions: [
      { id: 'q_source', text: 'Where do your leads come from today?', why: 'So the Lead Qualifier reads the right system.', options: [{ value: 'hubspot', label: 'HubSpot' }, { value: 'salesforce', label: 'Salesforce' }, { value: 'sheets', label: 'A spreadsheet' }, { value: 'forms', label: 'Website forms' }], answer: 'hubspot' },
      { id: 'q_users', text: 'Who will use Lead Desk?', options: [{ value: 'me', label: 'Just me' }, { value: 'team', label: 'My sales team' }, { value: 'company', label: 'The whole company' }], answer: 'team' },
      { id: 'q_send', text: 'Should emails be sent automatically?', why: 'You can change this later in the Email Drafter’s boundaries.', options: [{ value: 'draft', label: 'Draft only — I approve', hint: 'Recommended' }, { value: 'auto', label: 'Send automatically' }], answer: 'draft' },
    ],
    answers: { q_source: 'hubspot', q_users: 'team', q_send: 'draft' },
    plan: {
      summary: 'A lead desk for your sales team: every new HubSpot lead is scored against your ideal customer profile with a one-line reason, hot leads get a personalised follow-up draft that you approve, and a dashboard shows the pipeline at a glance.',
      audience: 'Sales team (5–10 people)',
      promises,
      decisions: [
        { q: 'Lead source', a: 'HubSpot (new contacts)' },
        { q: 'Who uses it', a: 'Sales team, sign-in required' },
        { q: 'Sending email', a: 'Draft only — a human approves every send' },
        { q: 'Hot lead threshold', a: 'Score of 75 or more (editable)' },
      ],
      quote: {
        credits: [36, 48], minutes: [9, 14], cap: 50, modelTier: 'balanced',
        lines: [
          { label: 'Plan, data model & auth', credits: [5, 6] },
          { label: '3 agents (manager + 2 specialists)', credits: [14, 19] },
          { label: '3 screens, 16 components', credits: [12, 16] },
          { label: 'Connect HubSpot, Gmail, Apollo', credits: [2, 3] },
          { label: 'Tests & promise verification', credits: [3, 4] },
        ],
      },
      approvedAt: now - 3 * D + 20 * 60e3,
      artifacts: [
        { id: 'art1', kind: 'spec', name: 'Lead Desk — product spec.md', at: now - 3 * D + 15 * 60e3 },
      ],
    },
    theme: { preset: 'navy', primary: '#1E3A8A', accent: '#0EA5E9', radius: 10, font: 'Geist', mode: 'light', density: 'comfortable' },
    screens,
    data: { tables },
    agents,
    integrations: [
      { id: 'hubspot', status: 'needed', scopes: ['Read contacts', 'Update deals'], usedBy: ['a_qualifier', 'a_email'] },
      { id: 'gmail', status: 'needed', scopes: ['Create drafts', 'Send email'], usedBy: ['a_email'] },
      { id: 'apollo', status: 'connected', scopes: ['Enrichment'], usedBy: ['a_qualifier'], builtIn: true },
    ],
    env: [
      { key: 'HUBSPOT_ACCESS_TOKEN', secret: true, source: 'hubspot', values: { draft: null, staging: null, production: null } },
      { key: 'GMAIL_OAUTH', secret: true, source: 'gmail', values: { draft: null, staging: null, production: null } },
      { key: 'ICP_MIN_EMPLOYEES', secret: false, source: 'user', values: { draft: '25', staging: '25', production: '25' } },
    ],
    checkpoints: [],
    runs: [
      { id: 'run_1', kind: 'build', label: 'First build', startedAt: now - 3 * D + 22 * 60e3, endedAt: now - 3 * D + 34 * 60e3, credits: 41, quoted: [36, 48], minutes: 12, status: 'done', promises: { verified: 5, total: 5 }, freeFixes: 1, steps: 14 },
      { id: 'run_2', kind: 'edit', label: 'Navy header + reply-rate KPI', startedAt: now - 22 * 60e3, endedAt: now - 20 * 60e3, credits: 2.5, quoted: [2, 3], minutes: 1, status: 'done', promises: { verified: 5, total: 5 }, freeFixes: 0, steps: 3 },
    ],
    build: null,
    deployments: [],
    environments: { draft: { version: 3, url: null }, staging: null, production: null },
    domain: null,
    listing: { marketplace: false, category: 'Sales', description: 'Scores inbound leads, explains why, and drafts follow-ups you approve.', short: 'AI lead scoring with approved follow-ups', tags: ['sales', 'hubspot', 'lead scoring'] },
    analyticsEnabled: true,
    github: { connected: false, repo: null, branch: 'main', branches: ['main'], lastPush: null, prs: [] },
    chat: [
      { id: 'm1', at: now - 3 * D, role: 'user', type: 'text', thread: 'main', text: 'Score inbound HubSpot leads against our ideal customer profile, draft personalised follow-up emails for the best ones, and alert the team in Slack when a hot lead arrives.' },
      { id: 'm2', at: now - 3 * D + 20e3, role: 'assistant', type: 'questions', thread: 'main', text: 'Three quick questions so the plan fits how you work:', data: { answered: true } },
      { id: 'm3', at: now - 3 * D + 5 * 60e3, role: 'assistant', type: 'plan', thread: 'main', text: 'Here’s the plan — 6 promises, 3 agents and 3 screens. Nothing is built or charged yet.', data: {} },
      { id: 'm4', at: now - 3 * D + 5 * 60e3 + 1e3, role: 'assistant', type: 'scope', thread: 'main', text: 'Scope check: one thing you asked for needs a connection first.', data: { included: ['P1', 'P2', 'P3', 'P4', 'P5'], deferred: [{ id: 'P6', reason: 'Needs a Slack connection — include it anytime (≈4 credits).' }] } },
      { id: 'm5', at: now - 3 * D + 5 * 60e3 + 2e3, role: 'assistant', type: 'quote', thread: 'main', data: { status: 'approved' } },
      { id: 'm6', at: now - 3 * D + 34 * 60e3, role: 'assistant', type: 'receipt', thread: 'main', text: 'Lead Desk is built. Every promise was checked.', data: { runId: 'run_1', credits: 41, minutes: 12, promises: { verified: 5, total: 5 }, freeFixes: 1 } },
      { id: 'm7', at: now - 23 * 60e3, role: 'user', type: 'text', thread: 'main', text: 'Make the header navy and add a reply-rate KPI' },
      { id: 'm8', at: now - 20 * 60e3, role: 'assistant', type: 'change', thread: 'main', text: 'Done — the app now uses a navy theme and the Leads page has a Reply rate tile.', data: { plain: 'Navy theme and a new “Reply rate” tile on Leads.', technical: 'theme.primary → #1E3A8A · components/LeadKpis.tsx +14 −2', diff: { added: 14, removed: 2 }, credits: 2.5, checkpoint: 3 } },
    ],
    threads: [{ id: 'main', name: 'Main' }],
    comments: [
      { id: 'c1', blockId: 'b_leads_table', screen: 's_leads', author: 'Arjun', text: 'Can we show the company logo next to the name?', at: now - 5 * H, resolved: false, replies: [] },
    ],
    activity: [
      { id: 'ac1', at: now - 20 * 60e3, actor: 'Architect', kind: 'change', plain: 'Switched to a navy theme and added a Reply rate tile.', technical: 'theme.primary #1E3A8A · components/LeadKpis.tsx +14 −2' },
      { id: 'ac2', at: now - 3 * D + 34 * 60e3, actor: 'Architect', kind: 'build', plain: 'Built Lead Desk: 3 screens, 3 agents, 3 tables. 5 of 5 promises verified.', technical: '31 files · 2,480 lines · 14 build steps · 1 free fix (hydration mismatch in LeadTable.tsx)' },
      { id: 'ac3', at: now - 3 * D + 20 * 60e3, actor: 'You', kind: 'plan', plain: 'Approved the plan and the quote (36–48 credits).', technical: 'plan v1 approved · cap 50 cr' },
    ],
    settings: { mode: 'build', modelTier: 'balanced', runMode: 'ask-risky', testAfterBuild: true, budgetCap: 50, rules: [{ id: 'R1', text: 'Never send email without my approval', scope: 'Email Drafter', enforced: true }, { id: 'R2', text: 'Don’t change the database schema without asking', scope: 'Project', enforced: true }] },
    source: { type: 'template', ref: 'lead-desk' },
    sample: true,
    deletedAt: null,
  };

  // Checkpoints (time machine): newest first. Earlier states are real snapshots.
  const snap = (p) => deepClone({ name: p.name, plan: p.plan, theme: p.theme, screens: p.screens, data: p.data, agents: p.agents, integrations: p.integrations, env: p.env });
  const cp3 = snap(project);
  const cp2 = snap(project);
  cp2.theme = { ...cp2.theme, preset: 'blueprint', primary: '#2F5BEA', accent: '#7446F0' };
  cp2.screens[0].blocks[1].props.items = cp2.screens[0].blocks[1].props.items.slice(0, 3);
  const cp1 = snap(project);
  cp1.theme = cp2.theme;
  cp1.screens.forEach((s) => s.blocks.forEach((b) => { b.buildState = 'pending'; }));
  project.checkpoints = [
    { id: uid('cp'), n: 3, at: now - 20 * 60e3, label: 'Navy theme + reply-rate KPI', summary: 'Edit run · 2.5 credits', kind: 'edit', credits: 2.5, snapshot: cp3 },
    { id: uid('cp'), n: 2, at: now - 3 * D + 34 * 60e3, label: 'First build complete', summary: 'Build run · 41 credits · 5/5 promises verified', kind: 'build', credits: 41, snapshot: cp2 },
    { id: uid('cp'), n: 1, at: now - 3 * D + 20 * 60e3, label: 'Plan approved', summary: 'Nothing built yet — wireframes only', kind: 'plan', credits: 0, snapshot: cp1 },
  ];
  return project;
}
