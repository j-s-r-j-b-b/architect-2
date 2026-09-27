// Archetype: customer support desk (triage → grounded replies → escalation).
import { integrationById } from '../catalog.js';
import { col, table, people, personalEmail, team, runsTable, B, K, screen, P, stretch } from './kit.js';
import { past, H, M, countBy } from './text.js';

const SAAS = [
  ['Charged twice for my March invoice', 'Billing', 'High', 'Angry'], ['Can’t log in after resetting my password', 'Account', 'High', 'Frustrated'],
  ['How do I export my data to CSV?', 'How-to', 'Low', 'Neutral'], ['App crashes when I upload a photo', 'Bug', 'Urgent', 'Frustrated'],
  ['Please cancel my subscription', 'Billing', 'Normal', 'Neutral'], ['Where is my refund? It’s been 10 days', 'Billing', 'Urgent', 'Angry'],
  ['Feature request: dark mode', 'Feedback', 'Low', 'Happy'], ['Slack integration stopped syncing', 'Integrations', 'High', 'Frustrated'],
  ['Can I add more seats mid-month?', 'Billing', 'Normal', 'Neutral'], ['Thanks — the new dashboard is great!', 'Feedback', 'Low', 'Happy'],
  ['Two-factor code never arrives', 'Account', 'High', 'Frustrated'], ['Your update deleted my saved filters!!', 'Bug', 'Urgent', 'Angry'],
  ['API returns 429 errors since yesterday', 'Integrations', 'High', 'Neutral'], ['Do you offer a nonprofit discount?', 'How-to', 'Low', 'Neutral'],
];
const STORE = [
  ['Where is my order #10482?', 'Shipping', 'Normal', 'Neutral'], ['Package arrived damaged', 'Returns', 'High', 'Frustrated'],
  ['Wrong size — how do I exchange?', 'Returns', 'Normal', 'Neutral'], ['Charged but no confirmation email', 'Billing', 'High', 'Frustrated'],
  ['Still no refund after 2 weeks!!', 'Billing', 'Urgent', 'Angry'], ['Do you ship to Canada?', 'Shipping', 'Low', 'Neutral'],
  ['Discount code SPRING20 doesn’t work', 'Billing', 'Normal', 'Frustrated'], ['Love the new collection!', 'Feedback', 'Low', 'Happy'],
  ['Tracking hasn’t updated in 5 days', 'Shipping', 'High', 'Frustrated'], ['Cancel my order please, ordered twice', 'Orders', 'Urgent', 'Neutral'],
  ['Item out of stock — when is it back?', 'Orders', 'Low', 'Neutral'], ['This is the third time I’m asking. Unacceptable.', 'Shipping', 'Urgent', 'Angry'],
];
const ARTICLES = { Billing: 'Refunds & billing FAQ', Account: 'Signing in & two-factor', 'How-to': 'Exporting your data', Bug: 'Known issues & workarounds', Integrations: 'Integration troubleshooting', Feedback: 'How we use feedback', Shipping: 'Shipping times & tracking', Returns: 'Returns & exchanges', Orders: 'Changing or cancelling an order' };

export function supportReply(row = {}) {
  const first = String(row.customer || 'there').split(' ')[0];
  const art = ARTICLES[row.topic] || 'our help center';
  const sorry = /Angry|Frustrated/.test(row.sentiment) ? `I’m sorry about this — I can see why it’s frustrating. ` : '';
  const body = `Hi ${first},\n\n${sorry}Thanks for reaching out about “${row.subject || 'your question'}”. ${row.topic === 'Billing' ? 'I’ve checked your account: the duplicate charge is marked for refund and will reach your card within 5–7 business days.' : row.topic === 'Shipping' ? 'Your parcel is with the carrier and the latest scan shows it is on its way; I’ve asked them to prioritise it.' : `Here’s what usually fixes it — our guide “${art}” walks through each step.`} If anything is still unclear, just reply here and I’ll take care of it.\n\nBest,\nThe support team`;
  return { to: row.email, subject: `Re: ${row.subject || 'your request'}`, body, sources: [`Help center: “${art}”`] };
}

export const SUPPORT = {
  id: 'support', family: 'support', label: 'Customer support', category: 'Support',
  match: [[/\btickets?\b|help ?desk|support (?:desk|team|inbox|agent|queue)|customer (?:support|service|questions|complaints)/, 3], [/\btriage\b|escalat|angry|complain|\bcsat\b|help[- ]cent(?:er|re)|\bfaqs?\b/, 1.5], [/\bsupport\b|refunds?\b|where is my order/, 1]],
  hints: { zendesk: 3, freshdesk: 3, intercom: 3 },
  name: (low, q) => (/copilot/.test(low) ? 'Support Copilot' : /store|shop|e-?commerce|orders?/.test(low) ? 'Store Support' : q ? `${q} Support` : 'Support Copilot'),
  icon: 'headphones', preset: 'teal', entity: ['ticket', 'tickets'], team: 'support team', teamSize: '4–12 agents',
  sources: ['freshdesk', 'zendesk', 'intercom', 'gmail'], sourceText: 'Where do support requests arrive today?', sourceWhy: 'Ticket Triage reads new requests from here.',
  usersRec: 'team',
  autonomy: { text: 'Should replies go to customers automatically?', ask: 'Draft replies — an agent approves each one', auto: 'Send simple answers automatically', decision: 'Replying to customers', askA: 'Drafts only — a human approves every reply', autoA: 'Simple how-to answers are sent automatically; everything else is drafted' },
  domainQ: { id: 'q_escalate', text: 'When should a human take over?', why: 'Escalation Watcher alerts your team when this happens.', options: [['angry', 'Angry or frustrated customers'], ['vip', 'VIP accounts, refunds and legal threats'], ['both', 'Both']], rec: 'both', decision: 'Escalate to a human' },
  pitch: () => 'Triages tickets, drafts grounded replies and escalates upset customers.',
  sampleQuestion: 'What’s urgent right now?',

  build(c) {
    const { r, now, src } = c;
    const store = /store|shop|e-?commerce|orders?|deliver|shipping/.test(c.low);
    const pool = r.shuffle(store ? STORE : SAAS).slice(0, 12);
    const ppl = people(r, 12), agentsTeam = c.team.slice(0, 3);
    const channels = src?.id === 'intercom' ? ['Chat', 'Chat', 'Email'] : src?.id === 'gmail' ? ['Email'] : ['Email', 'Web form', 'Chat', 'Email'];
    const tickets = pool.map(([subject, topic, urgency, sentiment], i) => {
      const esc = (c.domain !== 'vip' && sentiment === 'Angry') || (c.domain !== 'angry' && /refund|legal|unacceptable|third time/i.test(subject));
      const status = esc ? 'Escalated' : urgency === 'Low' && sentiment === 'Happy' ? 'Solved' : r.pick(['New', 'Triaged', 'Drafted', 'Drafted', 'Waiting']);
      const created = past(r, now, 2, 0.1 + i * 0.25);
      return { id: `t${i + 1}`, key: `#${4810 + i * 3 + r.int(0, 2)}`, subject, customer: ppl[i].name, email: personalEmail(ppl[i], r), channel: r.pick(channels), topic, urgency, sentiment, status, assignee: status === 'New' ? '' : agentsTeam[i % 3], created, summary: `${topic} · ${sentiment.toLowerCase()} · ${urgency === 'Urgent' ? 'reply within 1 hour' : urgency === 'High' ? 'reply within 4 hours' : 'reply within 1 day'}${esc ? ' · escalated to a human' : ''}` };
    }).sort((a, b) => b.created - a.created);

    const drafted = tickets.filter((t) => t.status === 'Drafted' || t.status === 'Solved' || t.status === 'Waiting').slice(0, 5);
    const rstat = c.autonomy === 'auto' ? ['Sent', 'Needs approval', 'Sent', 'Sent', 'Approved'] : ['Needs approval', 'Needs approval', 'Approved', 'Sent', 'Sent'];
    const replies = drafted.map((t, i) => { const d = supportReply(t); return { id: `rp${i + 1}`, ticket: t.key, customer: t.customer, subject: d.subject, body: d.body, sources: d.sources.join(' · '), status: rstat[i], created: t.created + (8 + i * 3) * M }; });

    const topics = store ? ['Shipping', 'Returns', 'Billing', 'Orders', 'Feedback'] : ['Billing', 'Account', 'How-to', 'Bug', 'Integrations', 'Feedback'];
    const tables = [
      table('tickets', 'Tickets', 'ticket', [
        col('key', 'Ticket', 'text'), col('subject', 'Subject', 'text'), col('customer', 'Customer', 'person'), col('email', 'Email', 'email'), col('channel', 'Channel', 'status', ['Email', 'Web form', 'Chat']),
        col('topic', 'Topic', 'status', topics), col('urgency', 'Urgency', 'status', ['Urgent', 'High', 'Normal', 'Low']), col('sentiment', 'Sentiment', 'status', ['Angry', 'Frustrated', 'Neutral', 'Happy']),
        col('status', 'Status', 'status', ['New', 'Triaged', 'Drafted', 'Waiting', 'Escalated', 'Solved']), col('assignee', 'Assignee', 'person'), col('created', 'Received', 'datetime'), col('summary', 'Triage note', 'longtext'),
      ], tickets, { connection: src?.id, rules: 'Support agents see every ticket; customers never see triage notes.' }),
      table('replies', 'Reply drafts', 'message-square', [
        col('ticket', 'Ticket', 'text'), col('customer', 'Customer', 'person'), col('subject', 'Subject', 'text'), col('body', 'Reply', 'longtext'), col('sources', 'Sources', 'text'),
        col('status', 'Status', 'status', ['Needs approval', 'Approved', 'Sent']), col('created', 'Drafted', 'datetime'),
      ], replies, { connection: src?.id || c.mail.id, rules: 'Drafts are visible to the support team only.' }),
    ];

    const replyTool = src && integrationById(src.id).actions.includes('reply_ticket') ? [src.id, ['reply_ticket']] : c.mailTool;
    const sendAct = replyTool[0] === src?.id ? 'reply_ticket' : c.mail.send;
    const help = store ? [['url', 'Help center', '64 articles'], ['file', 'Shipping & returns policy.pdf', '120 KB']] : [['url', 'Help center', '142 articles'], ['file', 'Refund & billing policy.pdf', '96 KB']];
    const { agents, lead, specs } = team(c, [
      {
        id: 'a_triage', name: 'Ticket Triage', alias: ['triage', 'classif', 'sort'], handles: 'triage and “what’s urgent?” questions',
        role: 'Tags every new ticket with topic, urgency and sentiment in under a minute',
        goal: 'No ticket waits more than 2 minutes to be triaged.',
        instructions: `Read each new ticket and set topic (${topics.join(', ')}), urgency (Urgent, High, Normal, Low) and sentiment. Urgent means the customer is blocked, losing money or has asked more than twice. Write a one-line triage note an agent can act on. Never reply to the customer yourself.`,
        creativity: 0.1, tools: [src && [src.id, src.read]], knowledge: [['file', 'Urgency rules.md', '3 KB']],
        triggers: [['webhook', src ? `${src.name}: new ticket` : 'New ticket in the app'], ['schedule', 'Every 2 minutes']],
        outputs: [['topic', 'text'], ['urgency', 'Urgent | High | Normal | Low'], ['sentiment', 'text'], ['summary', 'text']], toxicity: false, costPerRun: 0.02,
        runs: [[`Triaged ${r.int(4, 9)} new tickets`, `${src ? src.id + '.' + src.read[0] : 'tickets'} → classify ×${r.int(4, 9)}`], ['Triaged 3 new tickets', `${src ? src.id + '.' + src.read[0] : 'tickets'} → classify ×3`]],
      },
      {
        id: 'a_reply', name: 'Reply Writer', alias: ['reply', 'writ', 'draft', 'answer'], handles: 'drafting replies',
        role: c.autonomy === 'auto' ? 'Answers simple questions and drafts the rest from your help center' : 'Drafts replies from your help center — an agent approves before sending',
        goal: 'Every triaged ticket has an accurate, kind draft within 5 minutes.',
        instructions: 'Draft a reply using only the help center and policies. Quote the article you used. Be warm, specific and brief (under 150 words). If the answer is not in the knowledge base, say so and hand the ticket to a human — never invent policies, refunds or dates.',
        creativity: 0.4, memory: 'long-term', knowledge: [...help, ['file', 'Tone of voice.md', '4 KB']], tools: [replyTool], risky: [sendAct],
        triggers: [['event', 'A ticket is triaged'], ['chat', 'Reply Writer panel']], outputs: [['reply', 'text'], ['sources', 'list'], ['confidence', 'number', '0–1']],
        blocked: ['Refund promises outside policy', 'Legal advice'],
        runs: [[`Drafted reply to ${replies[0]?.ticket || 'a ticket'}`, `Help center “${ARTICLES[drafted[0]?.topic] || 'FAQ'}” · ${replyTool[0]}.${replyTool[1][0]}${c.autonomy === 'auto' ? '' : ' (awaiting approval)'}`], [`Drafted reply to ${replies[1]?.ticket || 'a ticket'}`, 'Help center · policy p.2']],
      },
      {
        id: 'a_escalate', name: 'Escalation Watcher', alias: ['escalat', 'watch', 'alert'], handles: 'escalations and upset customers',
        role: `Spots upset or high-stakes customers and alerts a human in ${c.chat.name}`,
        goal: 'An upset customer reaches a human within 10 minutes.',
        instructions: `Watch triaged tickets. Escalate when ${c.domain === 'angry' ? 'the customer is angry or frustrated' : c.domain === 'vip' ? 'the account is a VIP, a refund is requested, or legal action is mentioned' : 'the customer is angry, the account is a VIP, a refund is requested, or legal action is mentioned'}. Post a short alert in ${c.chat.name} with the ticket link, a one-line summary and why it needs a human. Do not reply to the customer.`,
        creativity: 0.2, tools: [c.chatTool], triggers: [['event', 'A ticket is triaged as Angry or Urgent']],
        outputs: [['escalate', 'boolean'], ['reason', 'text']],
        runs: [[`Escalated ${tickets.find((t) => t.status === 'Escalated')?.key || '#4812'} to a human`, `${c.chat.id}.${c.chat.action} → #support-escalations`]],
      },
    ], { name: `${c.name} Manager`, knowledge: help.slice(0, 1), topics: ['Our product', 'Support tickets'] });
    tables.push(runsTable(c, agents, specs));

    const triage = agents.find((a) => a.id.startsWith('a_triage'))?.id || lead;
    const writer = agents.find((a) => a.id.startsWith('a_reply'))?.id || lead;
    const watcher = agents.find((a) => a.id.startsWith('a_escalate'))?.id || lead;
    const open = tickets.filter((t) => t.status !== 'Solved');
    const urgent = tickets.filter((t) => t.urgency === 'Urgent');
    const byTopic = countBy(tickets, 'topic');
    const topTopic = Object.entries(byTopic).sort((a, b) => b[1] - a[1])[0]?.[0] || topics[0];
    const esc = tickets.find((t) => t.status === 'Escalated') || tickets[0];
    const screens = [
      screen('s_inbox', '/inbox', 'Inbox', 'inbox', [
        B.header('b_inbox_header', '/inbox', 'Inbox', `Triaged automatically${src ? ` from ${src.name}` : ''} · urgent first`, [['Assign to me', 'secondary', 'user'], ['New ticket', 'primary', 'plus']], { promise: 'P1' }),
        B.kpis('b_inbox_kpis', [K('Open tickets', open.length, `${urgent.length} urgent`, 'flat', 'inbox'), K('First reply', `${r.int(6, 14)} min`, `−${r.int(20, 45)}% vs last week`, 'up', 'clock'), K('Drafted by AI', `${Math.round((replies.length / tickets.length) * 100 + 30)}%`, 'of replies', 'up', 'sparkles'), K('CSAT', `${r.int(88, 96)}%`, `+${r.int(1, 4)} pts`, 'up', 'heart')], { table: 'tickets', promise: 'P5', file: 'components/InboxKpis.tsx' }),
        B.table('b_inbox_table', 'tickets', { title: 'Tickets', file: 'components/TicketTable.tsx', promise: 'P1', agent: triage, columns: ['key', 'subject', 'customer', 'topic', 'urgency', 'sentiment', 'status'], filters: ['urgency', 'status', 'topic'], rowAction: { label: 'Draft reply', agent: writer } }),
        B.chat('b_inbox_chat', lead, { title: `Ask ${c.name}`, file: 'components/AskSupport.tsx', promise: 'P2', greeting: 'I can find tickets, explain triage and draft replies from your help center.', placeholder: 'Ask about tickets…', suggestions: ['What’s urgent right now?', `Draft a reply to ${esc.key}`, `Summarise today’s ${topTopic.toLowerCase()} tickets`] }),
        B.chart('b_inbox_topics', { title: 'Tickets by topic', table: 'tickets', kind: 'donut', groupBy: 'topic', promise: 'P5', file: 'components/TopicChart.tsx' }),
        B.chart('b_inbox_urgency', { title: 'By urgency', table: 'tickets', kind: 'bar', groupBy: 'urgency', promise: 'P5', file: 'components/UrgencyChart.tsx' }),
        B.activity('b_inbox_activity', watcher, { title: 'Escalations & agent activity', file: 'components/AgentActivity.tsx', promise: 'P4' }),
      ]),
      screen('s_replies', '/replies', 'Replies', 'message-square', [
        B.header('b_rep_header', '/replies', 'Replies', c.autonomy === 'auto' ? 'Simple answers go out automatically · the rest wait for you' : 'Every reply waits for a teammate to approve it', [['Approve all ready', 'primary', 'check']]),
        B.kanban('b_rep_board', 'replies', { title: 'Reply drafts', span: 8, file: 'components/ReplyBoard.tsx', promise: 'P3', agent: writer, groupBy: 'status', titleKey: 'subject', subtitleKey: 'customer' }),
        B.chat('b_rep_chat', writer, { title: 'Reply Writer', file: 'components/ReplyWriterChat.tsx', promise: 'P2', greeting: 'Paste a ticket or ask me to redraft one. I only use your help center, and I show my sources.', placeholder: 'e.g. Softer tone for #4812', suggestions: ['Make it more empathetic', 'Shorter, please', 'Which article did you use?'] }),
      ]),
      screen('s_insights', '/insights', 'Insights', 'bar-chart', [
        B.header('b_ins_header', '/insights', 'Insights', 'Volume, speed and what customers ask about'),
        B.kpis('b_ins_kpis', [K('Tickets this week', r.int(180, 420), `+${r.int(3, 15)}%`, 'up', 'ticket'), K('Resolved by AI draft', `${r.int(52, 71)}%`, 'approved with no edits', 'up', 'sparkles'), K('Escalations', r.int(6, 19), `−${r.int(1, 5)} vs last week`, 'up', 'alert-triangle'), K('Hours saved', `${r.int(22, 60)} h`, 'this week', 'flat', 'clock')], { file: 'components/SupportInsightKpis.tsx' }),
        B.chart('b_ins_trend', { title: 'Median first-reply time (minutes)', kind: 'line', span: 8, file: 'components/ReplyTimeTrend.tsx', series: [48, 41, 36, 30, 24, 19, 15, 11].map((v, i) => ({ label: `W${i + 1}`, value: v + r.int(-2, 2) })) }),
        B.text('b_ins_text', `**${topTopic} is the top topic** this week (${byTopic[topTopic]} of ${tickets.length} tickets). ${urgent.length} tickets were urgent and ${tickets.filter((t) => t.status === 'Escalated').length} went to a human. The most-used article was “${ARTICLES[topTopic] || 'FAQ'}”.`, { title: 'This week in one paragraph', span: 4, agent: lead, file: 'components/WeeklySummary.tsx' }),
      ]),
    ];

    const promises = [
      P('P1', 'Triage every new ticket by topic, urgency and sentiment', 'Tickets are tagged within 2 minutes so urgent ones rise to the top.', ['An angry refund ticket is marked Urgent', 'A “thank you” email is marked Low', 'Every ticket has a triage note'], [triage, 'tickets'], 2.5),
      P('P2', 'Draft replies grounded in your help center — with sources', 'Each draft cites the article it used; nothing is made up.', ['Every draft lists at least one source', 'Questions outside the help center are handed to a human'], [writer], 2.5),
      c.autonomy === 'auto'
        ? P('P3', 'Send simple how-to answers automatically; draft the rest', 'Only high-confidence, low-risk answers go out on their own.', ['Billing and refund tickets are never auto-sent', 'Every auto-send is logged'], [writer, 'replies'], 1)
        : P('P3', 'Never reply to a customer without approval', 'A teammate approves every reply before it’s sent.', [`${sendAct} requires approval in every run mode`], [writer, 'replies'], 0.8),
      P('P4', `Escalate upset customers to a human in ${c.chat.name}`, 'The right person hears about it within minutes.', [`An angry ticket posts an alert in ${c.chat.name} within 1 minute`, 'Alerts include the ticket link and why'], [watcher], 1.5),
      P('P5', 'Show a live inbox with volume, topics and response times', 'One screen for the whole queue.', ['Inbox loads in under 2 s', 'Charts match the tickets table'], ['s_inbox', 's_insights'], 3),
    ];
    promises.push(stretch(c, 'P6', 'Suggest a new help-center article when a question repeats', 'When the same question comes up 5 times, get a ready-to-edit article draft.', ['A draft article appears after the 5th similar ticket'], { est: [4, 5] }));

    return {
      tables, agents, lead, screens, promises,
      summary: `A support copilot for ${c.audienceShort}: every new ${src ? src.name + ' ' : ''}ticket is triaged by urgency and topic, replies are drafted from your help center with sources${c.autonomy === 'auto' ? ' (simple ones go out automatically)' : ' for a teammate to approve'}, and upset customers are escalated to a human in ${c.chat.name}.`,
      description: 'Triages tickets, drafts grounded replies and escalates upset customers to a human.',
      decisions: [{ q: 'Knowledge used for replies', a: 'Your help center and policy documents only' }],
      env: [['URGENT_REPLY_MINUTES', 60]],
    };
  },
  reply: { table: 'tickets', title: 'key', sub: 'subject', person: 'customer', status: 'urgency', reason: 'summary', draft: supportReply, draftTable: 'replies', priority: ['Urgent', 'High', 'Normal', 'Low'] },
};
