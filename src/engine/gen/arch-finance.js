// Archetypes: expense auditing and invoice collections.
import { col, table, people, companies, emailOf, team, runsTable, B, K, screen, P, stretch } from './kit.js';
import { past, dayFrom, D, H, sum, countBy, usd, fmtShort } from './text.js';

const MERCHANTS = {
  Travel: [['Delta Air Lines', 180, 640], ['Uber', 14, 62], ['Marriott Berlin', 190, 420], ['Eurostar', 90, 260], ['Lyft', 12, 48]],
  Meals: [['Blue Bottle Coffee', 8, 24], ['Dishoom', 45, 160], ['Sweetgreen', 12, 32], ['The Ivy', 80, 240], ['Nando’s', 18, 70]],
  Software: [['Figma', 15, 75], ['Notion', 10, 96], ['Zoom', 15, 150], ['Adobe', 55, 85]],
  Office: [['Staples', 20, 140], ['Amazon Business', 25, 320], ['IKEA', 60, 450]],
  'Client entertainment': [['Nobu', 180, 620], ['Topgolf', 90, 310], ['Soho House', 120, 380]],
};
export function expenseNote(row = {}) {
  return `Hi ${String(row.employee || '').split(' ')[0] || 'there'} — your ${row.merchant || ''} expense (${usd(row.amount || 0)}) needs a quick fix: ${row.flag || 'please check it'}. ${row.receipt ? '' : 'Could you upload the receipt? '}Reply here or update it in the app and I’ll re-check it right away.`;
}

export const EXPENSES = {
  id: 'expenses', family: 'finance', label: 'Expense auditing', category: 'Finance',
  match: [[/expenses?|receipts?|reimburs|per diem|spend policy|travel policy/, 3], [/corporate cards?|mileage|out[- ]of[- ]policy/, 2]],
  hints: {},
  name: (low) => (/audit/.test(low) ? 'Expense Auditor' : 'Expense Check'),
  icon: 'receipt', preset: 'forest', entity: ['expense', 'expenses'], team: 'finance team', teamSize: 'finance + every employee',
  sources: ['gmail', 'gdrive', 'gsheets', 'builtin'], sourceText: 'Where do receipts arrive today?', sourceWhy: 'Receipt Reader picks up new receipts from here.',
  sourceLabels: { gmail: 'Forwarded to an inbox (Gmail)', gdrive: 'A Google Drive folder', gsheets: 'Logged in a spreadsheet', builtin: 'Uploaded in this app' },
  usersRec: 'company', usersLabels: { company: 'Every employee submits, finance reviews' },
  autonomy: { text: 'Should compliant expenses be approved automatically?', ask: 'Flag only — finance approves everything', auto: 'Auto-approve compliant ones; flag the rest', decision: 'Approvals', askA: 'Finance approves every expense', autoA: 'Compliant expenses are approved automatically; flags go to finance' },
  domainQ: { id: 'q_rules', text: 'Which policy rules matter most?', why: 'Policy Checker explains every flag with the rule it broke.', options: [['meals', 'Meal limits & alcohol'], ['receipts', 'Missing receipts over $25'], ['all', 'Our full expense policy']], rec: 'all', decision: 'Rules checked' },
  pitch: () => 'Reads receipts, flags policy violations with reasons and reports weekly to finance.',
  sampleQuestion: 'What got flagged this week?',

  build(c) {
    const { r, now, src } = c;
    const ppl = people(r, 7);
    const cats = Object.keys(MERCHANTS);
    const rows = Array.from({ length: 12 }, (_, i) => {
      const cat = cats[(i * 3 + r.int(0, 4)) % cats.length];
      const [merchant, lo, hi] = r.pick(MERCHANTS[cat]);
      const amount = r.money(lo, hi, 0.01);
      const receipt = !(amount > 25 && r.chance(0.18));
      let status = 'Approved', flag = '', rule = '';
      const checkMeals = c.domain !== 'receipts', checkReceipts = c.domain !== 'meals';
      if (checkReceipts && !receipt) { status = 'Needs receipt'; flag = 'No receipt attached for an amount over $25'; rule = '§2.1 Receipts'; }
      else if (checkMeals && cat === 'Meals' && amount > 75) { status = 'Flagged'; flag = `Over the $75 per-person meal limit by ${usd(amount - 75)}`; rule = '§3.2 Meals'; }
      else if (checkMeals && cat === 'Client entertainment' && r.chance(0.5)) { status = 'Flagged'; flag = 'Includes alcohol without a named client on the claim'; rule = '§3.4 Alcohol'; }
      else if (c.domain === 'all' && cat === 'Travel' && /Marriott/.test(merchant) && amount > 250) { status = 'Flagged'; flag = `Hotel above the $250/night cap (${usd(amount)})`; rule = '§4.1 Hotels'; }
      else if (c.domain === 'all' && cat === 'Software') { status = 'Pending'; flag = 'New software needs IT approval first'; rule = '§5.3 Software'; }
      if (status === 'Approved' && c.autonomy !== 'auto' && r.chance(0.4)) status = 'Pending';
      return { id: `e${i + 1}`, employee: ppl[i % ppl.length].name, merchant, category: cat, amount, date: dayFrom(now, -r.int(0, 13)), receipt, status, flag, rule };
    }).sort((a, b) => b.date - a.date);
    const flagged = rows.filter((x) => x.status === 'Flagged' || x.status === 'Needs receipt');
    const weeks = Array.from({ length: 6 }, (_, i) => {
      const total = r.money(3200, 7400, 1), n = r.int(28, 64), fl = r.int(2, 9);
      return { id: `w${i + 1}`, week: `Week of ${fmtShort(now - (i + 1) * 7 * D)}`, total, count: n, flagged: fl, top: r.pick(['Travel', 'Meals', 'Software']), status: i === 0 ? 'Draft' : 'Sent' };
    });
    const tables = [
      table('expenses', 'Expenses', 'receipt', [
        col('employee', 'Employee', 'person'), col('merchant', 'Merchant', 'text'), col('category', 'Category', 'status', cats), col('amount', 'Amount', 'money'), col('date', 'Date', 'date'),
        col('receipt', 'Receipt', 'bool'), col('status', 'Status', 'status', ['Pending', 'Approved', 'Flagged', 'Needs receipt']), col('flag', 'Why flagged', 'longtext'), col('rule', 'Policy rule', 'text'),
      ], rows, { connection: src?.id, rules: 'Employees see their own expenses; finance sees everything.' }),
      table('weekly_reports', 'Weekly summaries', 'file-text', [
        col('week', 'Week', 'text'), col('total', 'Total spend', 'money'), col('count', 'Expenses', 'number'), col('flagged', 'Flagged', 'number'), col('top', 'Top category', 'text'), col('status', 'Status', 'status', ['Draft', 'Sent']),
      ], weeks, { connection: c.has('excel') ? 'excel' : 'gsheets', prefix: 'w', rules: 'Finance only.' }),
    ];
    const sheet = c.has('excel') ? ['excel', ['read_range']] : ['gsheets', ['append_row', 'read_rows']];
    const { agents, lead, specs } = team(c, [
      {
        id: 'a_reader', name: 'Receipt Reader', alias: ['receipt', 'read', 'extract'], handles: 'reading receipts and missing details',
        role: 'Reads every receipt and fills in merchant, amount, date and category',
        goal: 'Every receipt is read and categorised within 5 minutes of arriving.',
        instructions: 'Read each receipt image or PDF. Extract merchant, total amount, currency, date and category. If a field is unreadable, mark it "unclear" and ask the employee — never guess amounts. Detect duplicates of the same receipt.',
        creativity: 0.05, tier: 'balanced', tools: [src && src.id !== 'builtin' && [src.id, src.read]], knowledge: [['file', 'Category guide.md', '3 KB']],
        triggers: [['event', 'A receipt arrives'], ['email', 'receipts@ inbox']], outputs: [['merchant', 'text'], ['amount', 'money'], ['date', 'date'], ['category', 'text'], ['confidence', 'number', '0–1']], toxicity: false,
        runs: [[`Read ${r.int(4, 9)} new receipts`, `${src && src.id !== 'builtin' ? src.id + '.' + src.read[0] + ' → ' : ''}OCR → categorise`], ['Spotted a duplicate Uber receipt', 'hash match with e-4410']],
      },
      {
        id: 'a_policy', name: 'Policy Checker', alias: ['policy', 'check', 'audit', 'flag'], handles: 'policy questions and flags',
        role: 'Checks each expense against your policy and explains every flag',
        goal: 'Every violation is flagged with the exact rule and a plain explanation.',
        instructions: `Check each expense against the expense policy${c.domain === 'meals' ? ', focusing on meal limits and alcohol' : c.domain === 'receipts' ? ', focusing on receipts for anything over $25' : ''}. For each problem, quote the rule (e.g. "§3.2 Meals — $75 per person") and explain it in one friendly sentence the employee will understand. On Fridays, write the weekly summary to ${sheet[0] === 'excel' ? 'Excel' : 'Google Sheets'} and email it to finance.`,
        creativity: 0.1, knowledge: [['file', 'Expense policy 2026.pdf', '310 KB']], tools: [sheet, c.mailTool], risky: ['approve_expense', c.mail.send], platform: ['approve_expense'],
        triggers: [['event', 'An expense is read'], ['schedule', 'Fridays at 16:00']], outputs: [['status', 'Approved | Flagged | Needs receipt'], ['rule', 'text'], ['explanation', 'text']],
        runs: [[`Flagged ${flagged[0]?.merchant || 'an expense'} (${flagged[0]?.rule || '§3.2 Meals'})`, 'Expense policy p.4 · rule match'], ['Wrote the weekly summary', `${sheet[0]}.${sheet[1][0]} · ${c.mail.id}.${c.mail.draft || c.mail.send}${c.autonomy === 'auto' ? '' : ' (awaiting approval)'}`]],
      },
    ], { name: `${c.name} Manager`, knowledge: [['file', 'Expense policy 2026.pdf', '310 KB']], topics: ['Expenses', 'Expense policy'] });
    tables.push(runsTable(c, agents, specs));
    const reader = agents.find((a) => a.id.startsWith('a_reader'))?.id || lead;
    const checker = agents.find((a) => a.id.startsWith('a_policy'))?.id || lead;
    const total = sum(rows.map((x) => x.amount));
    const byCat = countBy(rows, 'category');
    const screens = [
      screen('s_expenses', '/expenses', 'Expenses', 'receipt', [
        B.header('b_exp_header', '/expenses', 'Expenses', 'Read by Receipt Reader · checked against your policy', [['Upload receipts', 'secondary', 'upload'], ['New expense', 'primary', 'plus']]),
        B.kpis('b_exp_kpis', [K('Spend (14 days)', usd(total), `${rows.length} expenses`, 'flat', 'coins'), K('Flagged', flagged.length, `${Math.round((flagged.length / rows.length) * 100)}% of claims`, flagged.length > 3 ? 'down' : 'flat', 'flag'), K('Awaiting approval', rows.filter((x) => x.status === 'Pending').length, 'finance queue', 'flat', 'clock'), K('Hours saved', `${r.int(8, 22)} h`, 'this month', 'up', 'sparkles')], { table: 'expenses', promise: 'P4', file: 'components/ExpenseKpis.tsx' }),
        B.table('b_exp_table', 'expenses', { title: 'All expenses', file: 'components/ExpenseTable.tsx', promise: 'P1', agent: reader, columns: ['employee', 'merchant', 'category', 'amount', 'date', 'status'], filters: ['status', 'category'], rowAction: { label: 'Explain', agent: checker } }),
        B.chat('b_exp_chat', lead, { title: `Ask ${c.name}`, file: 'components/AskExpenses.tsx', greeting: 'Ask what was flagged, why, or how much was spent on anything.', placeholder: 'Ask about expenses…', suggestions: ['What got flagged this week?', `Why was ${flagged[0]?.merchant || 'the Dishoom dinner'} flagged?`, 'Total travel spend this month'] }),
        B.chart('b_exp_cat', { title: 'Spend by category', table: 'expenses', kind: 'donut', groupBy: 'category', metric: 'amount', file: 'components/CategoryChart.tsx', promise: 'P4' }),
        B.chart('b_exp_status', { title: 'By status', table: 'expenses', kind: 'bar', groupBy: 'status', file: 'components/StatusChart.tsx' }),
        B.activity('b_exp_activity', checker, { file: 'components/AgentActivity.tsx' }),
      ]),
      screen('s_flags', '/flags', 'Flagged', 'flag', [
        B.header('b_flags_header', '/flags', 'Flagged', 'Every flag names the rule it broke — approve, reject or ask for a fix', [['Approve selected', 'primary', 'check']], { promise: 'P2' }),
        B.cards('b_flags_cards', 'expenses', { title: 'Needs a decision', span: 8, file: 'components/FlagCards.tsx', promise: 'P2', agent: checker, titleKey: 'merchant', subtitleKey: 'flag', metaKeys: ['employee', 'amount', 'rule'], badgeKey: 'status' }),
        B.chat('b_flags_chat', checker, { title: 'Policy Checker', file: 'components/PolicyChat.tsx', promise: 'P3', greeting: 'Ask me about any rule or flag. I quote the policy section every time.', placeholder: 'e.g. Is alcohol ever allowed?', suggestions: ['Is alcohol ever allowed?', 'What’s the hotel limit in London?', 'Write a friendly note to the employee'] }),
      ]),
      screen('s_reports', '/reports', 'Weekly summary', 'file-text', [
        B.header('b_rep_header', '/reports', 'Weekly summary', `Written every Friday · saved to ${sheet[0] === 'excel' ? 'Excel' : 'Google Sheets'} and emailed to finance`, [['Send now', 'primary', 'send']], { promise: 'P5' }),
        B.chart('b_rep_trend', { title: 'Weekly spend', kind: 'area', span: 8, file: 'components/SpendTrend.tsx', series: weeks.slice().reverse().map((w) => ({ label: w.week.replace('Week of ', ''), value: w.total })) }),
        B.text('b_rep_text', `**${usd(weeks[0].total)} spent last week**, ${weeks[0].flagged} expenses flagged. ${Object.entries(byCat).sort((a, b) => b[1] - a[1])[0][0]} was the busiest category. Most flags were ${c.domain === 'receipts' ? 'missing receipts' : 'meals over the $75 limit'}.`, { title: 'This week', span: 4, agent: checker, file: 'components/WeeklyNote.tsx' }),
        B.table('b_rep_table', 'weekly_reports', { title: 'Past summaries', searchable: false, file: 'components/ReportTable.tsx', promise: 'P5' }),
      ]),
    ];
    const promises = [
      P('P1', 'Read every receipt and fill in the details', 'Merchant, amount, date and category — no typing.', ['A photographed receipt is read correctly', 'Unreadable fields are marked “unclear”, never guessed'], [reader, 'expenses'], 2.5),
      P('P2', 'Flag policy violations with the rule and a plain explanation', 'Employees see exactly what to fix.', ['A $120 dinner for one is flagged under §3.2', 'Every flag quotes a rule'], [checker, 's_flags'], 3),
      c.autonomy === 'auto'
        ? P('P3', 'Approve compliant expenses automatically', 'Only expenses that pass every rule skip the queue.', ['Flagged expenses are never auto-approved', 'Every auto-approval is logged'], [checker], 1)
        : P('P3', 'Nothing is approved without finance', 'The checker recommends; people decide.', ['approve_expense always requires a human'], [checker], 0.8),
      P('P4', 'Show spend by category and status at a glance', 'One screen for the whole month.', ['Totals match the expenses table'], ['s_expenses'], 2),
      P('P5', `Write a weekly summary to ${sheet[0] === 'excel' ? 'Excel' : 'Google Sheets'} for finance`, 'Every Friday: totals, flags and the top category.', ['A summary row is added every Friday', 'The email lists flagged items'], ['weekly_reports', checker], 1.5),
    ];
    promises.push(stretch(c, 'P6', 'Sync approved expenses to QuickBooks', 'Approved items land in your books automatically.', ['An approved expense appears in QuickBooks within 5 minutes'], { integration: 'quickbooks', est: [4, 5] }));
    return {
      tables, agents, lead, screens, promises,
      summary: `An expense auditor for ${c.audienceShort}: receipts are read automatically, every expense is checked against your policy with a plain-language reason for each flag, ${c.autonomy === 'auto' ? 'compliant ones are approved automatically' : 'finance approves everything'}, and a weekly summary lands in ${sheet[0] === 'excel' ? 'Excel' : 'Google Sheets'}.`,
      description: 'Reads receipts, flags policy violations with reasons and sends finance a weekly summary.',
      decisions: [{ q: 'Meal limit', a: '$75 per person (editable)' }],
      env: [['MEAL_LIMIT_USD', 75], ['RECEIPT_REQUIRED_OVER_USD', 25]],
    };
  },
  reply: { table: 'expenses', title: 'merchant', sub: 'employee', money: 'amount', reason: 'flag', status: 'status', priority: ['Flagged', 'Needs receipt', 'Pending', 'Approved'], note: expenseNote },
};

// ---------------------------------------------------------------------------
export function reminderDraft(row = {}, ctx = {}) {
  const stage = ctx.stage || (row.overdue > 30 ? 'Final notice' : row.overdue > 10 ? 'Firm' : 'Friendly');
  const amt = usd(row.amount || 0);
  const open = stage === 'Friendly' ? `Just a friendly reminder that invoice ${row.number} for ${amt} was due on ${row.due ? fmtShort(row.due) : 'its due date'}.` : stage === 'Firm' ? `Invoice ${row.number} for ${amt} is now ${row.overdue} days overdue. Please arrange payment this week.` : `This is a final notice for invoice ${row.number} (${amt}), now ${row.overdue} days overdue. If we don’t receive payment within 7 days we’ll need to pause the account.`;
  return { to: row.email, stage, subject: `${stage === 'Final notice' ? 'Final notice: ' : ''}Invoice ${row.number} — ${amt}`, body: `Hi ${row.contact || 'there'},\n\n${open} You can pay securely with the link below. If you’ve already paid, thank you — please ignore this note.\n\nThanks,\nAccounts team` };
}

export const INVOICES = {
  id: 'invoices', family: 'finance', label: 'Invoices & collections', category: 'Finance',
  match: [[/invoices?|unpaid|overdue payments?|collections?|accounts receivable|\bar\b aging|dunning|payment reminders?/, 3], [/cash ?flow|get paid|late pay/, 1.5]],
  hints: { stripe: 1.5, quickbooks: 2 },
  name: (low) => (/chase|chaser/.test(low) ? 'Invoice Chaser' : 'Collections Desk'),
  icon: 'coins', preset: 'slate', entity: ['invoice', 'invoices'], team: 'finance team', teamSize: '2–6 people',
  sources: ['stripe', 'quickbooks', 'gsheets', 'builtin'], sourceText: 'Where do your invoices live?', sourceWhy: 'Collections Agent reads open invoices from here.',
  usersRec: 'team',
  autonomy: { text: 'Should reminders go to customers automatically?', ask: 'Draft them — I approve each send', auto: 'Send the sequence automatically', decision: 'Reminder emails', askA: 'Drafted — finance approves each send', autoA: 'Sent automatically on schedule' },
  domainQ: { id: 'q_tone', text: 'How firm should reminders get?', why: 'This sets the reminder sequence. You can edit every template.', options: [['gentle', 'Always friendly'], ['escalate', 'Friendly → firm → final notice'], ['call', 'Escalate to a phone call after 30 days']], rec: 'escalate', decision: 'Reminder sequence' },
  pitch: () => 'Tracks unpaid invoices, sends escalating reminders and forecasts cash collection.',
  sampleQuestion: 'Who owes us the most?',

  build(c) {
    const { r, now, src } = c;
    const cos = companies(r, 12), ppl = people(r, 12);
    const inv = cos.map((co, i) => {
      const issued = dayFrom(now, -r.int(8, 70));
      const due = issued + 30 * D;
      const overdue = Math.max(0, Math.round((now - due) / D));
      const amount = r.money(800, 24000, 10);
      const reminders = overdue > 30 ? 3 : overdue > 10 ? 2 : overdue > 0 ? 1 : 0;
      const status = i % 5 === 4 ? 'Paid' : overdue > 0 ? (i % 4 === 1 ? 'Promised' : reminders ? 'Reminded' : 'Overdue') : 'Due';
      const next = status === 'Paid' ? '—' : status === 'Promised' ? `Promised by ${fmtShort(now + r.int(2, 8) * D)}` : overdue > 30 ? (c.domain === 'call' ? 'Call the customer' : 'Final notice') : overdue > 10 ? 'Firm reminder' : overdue > 0 ? 'Friendly reminder' : `Due ${fmtShort(due)}`;
      return { id: `i${i + 1}`, number: `INV-${2040 + i * 3}`, customer: co.name, contact: ppl[i].first, email: emailOf(ppl[i], co.domain), amount, issued, due, overdue: status === 'Paid' ? 0 : overdue, status, reminders: status === 'Paid' ? 0 : reminders, next };
    }).sort((a, b) => b.overdue - a.overdue);
    const late = inv.filter((x) => x.overdue > 0 && x.status !== 'Paid');
    const rem = late.slice(0, 5).map((x, i) => { const d = reminderDraft(x, c.domain === 'gentle' ? { stage: 'Friendly' } : {}); return { id: `rm${i + 1}`, invoice: x.number, customer: x.customer, stage: d.stage, subject: d.subject, body: d.body, status: c.autonomy === 'auto' ? (i < 2 ? 'Scheduled' : 'Sent') : (i < 3 ? 'Needs approval' : 'Sent') }; });
    const tables = [
      table('invoices', 'Invoices', 'coins', [
        col('number', 'Invoice', 'text'), col('customer', 'Customer', 'text'), col('email', 'Billing email', 'email'), col('amount', 'Amount', 'money'), col('issued', 'Issued', 'date'), col('due', 'Due', 'date'),
        col('overdue', 'Days overdue', 'number'), col('status', 'Status', 'status', ['Due', 'Overdue', 'Reminded', 'Promised', 'Paid']), col('reminders', 'Reminders sent', 'number'), col('next', 'Next step', 'text'),
      ], inv, { connection: src?.id, rules: 'Finance team only.' }),
      table('reminders', 'Reminders', 'mail', [
        col('invoice', 'Invoice', 'text'), col('customer', 'Customer', 'text'), col('stage', 'Stage', 'status', ['Friendly', 'Firm', 'Final notice']), col('subject', 'Subject', 'text'), col('body', 'Email', 'longtext'), col('status', 'Status', 'status', ['Needs approval', 'Scheduled', 'Sent']),
      ], rem, { connection: c.mail.id, prefix: 'rm', rules: 'Finance team only.' }),
    ];
    const { agents, lead, specs } = team(c, [
      {
        id: 'a_collect', name: 'Collections Agent', alias: ['collect', 'remind', 'chase'], handles: 'reminders and “who owes us?” questions',
        role: c.autonomy === 'auto' ? 'Sends polite reminder sequences that escalate over time' : 'Drafts polite reminder sequences that escalate over time — you approve',
        goal: 'Every overdue invoice gets the right reminder on the right day.',
        instructions: `Check open invoices every morning. ${c.domain === 'gentle' ? 'Send friendly reminders at 1, 10 and 30 days overdue.' : c.domain === 'call' ? 'Send friendly (day 1) and firm (day 10) reminders; after 30 days, create a task for a human to call instead of emailing.' : 'Send a friendly reminder at 1 day overdue, a firm one at 10 days and a final notice at 30 days.'} Always include the invoice number, amount and a payment link. Stop immediately when an invoice is paid or a payment is promised. Never threaten legal action.`,
        creativity: 0.3, tools: [src && src.id !== 'builtin' && [src.id, src.read], c.mailTool], risky: [c.mail.send],
        triggers: [['schedule', 'Weekdays at 8:00'], src?.id === 'stripe' ? ['webhook', 'Stripe: invoice.payment_failed'] : ['event', 'An invoice becomes overdue']],
        outputs: [['reminder', 'text'], ['stage', 'Friendly | Firm | Final notice']], blocked: ['Legal threats'], memory: 'long-term',
        runs: [[`Drafted ${rem.length} reminders`, `${src && src.id !== 'builtin' ? src.id + '.' + src.read[0] + ' → ' : ''}${c.mail.id}.${c.mail.draft || c.mail.send}${c.autonomy === 'auto' ? '' : ' (awaiting approval)'}`], [`Stopped the sequence for ${inv.find((x) => x.status === 'Promised')?.customer || 'a customer'}`, 'payment promised · sequence paused']],
      },
      {
        id: 'a_forecast', name: 'Forecaster', alias: ['forecast', 'predict', 'cash'], handles: 'forecasts and cash questions',
        role: 'Forecasts how much cash you’ll collect this month and which invoices are at risk',
        goal: 'A weekly cash-collection forecast within ±10%.',
        instructions: 'Estimate the probability each open invoice is paid this month from the customer’s payment history, days overdue and promises. Sum expected collections by week. Flag invoices with under 40% probability as at risk, with one reason each. Show your working in plain numbers.',
        creativity: 0.1, tier: 'balanced', knowledge: [['table', 'Payment history (12 months)', '1,480 rows']], tools: [src && src.id !== 'builtin' && [src.id, src.read.slice(0, 1)]],
        triggers: [['schedule', 'Mondays at 7:00'], ['chat', 'Forecast panel']], outputs: [['expected', 'money'], ['atRisk', 'list'], ['byWeek', 'series']], toxicity: false,
        runs: [['Updated the monthly forecast', 'payment history → probabilities → weekly totals']],
      },
    ], { name: `${c.name} Manager`, topics: ['Invoices', 'Cash collection'] });
    tables.push(runsTable(c, agents, specs));
    const col1 = agents.find((a) => a.id.startsWith('a_collect'))?.id || lead;
    const fc = agents.find((a) => a.id.startsWith('a_forecast'))?.id || lead;
    const outstanding = sum(inv.filter((x) => x.status !== 'Paid').map((x) => x.amount));
    const overdueAmt = sum(late.map((x) => x.amount));
    const expected = Math.round(outstanding * (0.55 + r() * 0.15));
    const weeksF = [0.22, 0.31, 0.27, 0.2].map((f, i) => ({ label: `Week ${i + 1}`, value: Math.round(expected * f) }));
    const screens = [
      screen('s_invoices', '/invoices', 'Invoices', 'coins', [
        B.header('b_inv_header', '/invoices', 'Invoices', `${src && src.id !== 'builtin' ? `Synced from ${src.name} · ` : ''}most overdue first`, [['Export', 'secondary', 'download'], ['Record payment', 'primary', 'check']]),
        B.kpis('b_inv_kpis', [K('Outstanding', usd(outstanding), `${inv.filter((x) => x.status !== 'Paid').length} invoices`, 'flat', 'coins'), K('Overdue', usd(overdueAmt), `${late.length} invoices`, 'down', 'alert-triangle'), K('Expected this month', usd(expected), 'forecast', 'up', 'trending-up'), K('Days sales outstanding', r.int(34, 52), `−${r.int(2, 8)} days`, 'up', 'clock')], { table: 'invoices', promise: 'P4', file: 'components/InvoiceKpis.tsx' }),
        B.table('b_inv_table', 'invoices', { title: 'Open invoices', file: 'components/InvoiceTable.tsx', promise: 'P1', agent: col1, columns: ['number', 'customer', 'amount', 'due', 'overdue', 'status', 'next'], filters: ['status'], rowAction: { label: 'Draft reminder', agent: col1 } }),
        B.chat('b_inv_chat', lead, { title: `Ask ${c.name}`, file: 'components/AskCollections.tsx', greeting: 'Ask who owes you, what’s at risk, or to draft a reminder.', placeholder: 'Ask about invoices…', suggestions: ['Who owes us the most?', `Draft a reminder for ${late[0]?.customer || inv[0].customer}`, 'How much will we collect this month?'] }),
        B.chart('b_inv_status', { title: 'Amount by status', table: 'invoices', kind: 'donut', groupBy: 'status', metric: 'amount', file: 'components/StatusChart.tsx', promise: 'P4' }),
        B.chart('b_inv_forecast', { title: 'Expected collections this month', kind: 'bar', span: 8, file: 'components/ForecastChart.tsx', promise: 'P3', series: weeksF }),
      ]),
      screen('s_reminders', '/reminders', 'Reminders', 'mail', [
        B.header('b_rem_header', '/reminders', 'Reminders', c.autonomy === 'auto' ? 'The sequence runs on its own — pause any customer anytime' : 'Drafts wait for your approval', [[c.autonomy === 'auto' ? 'Pause all' : 'Approve all', 'primary', c.autonomy === 'auto' ? 'pause' : 'check']], { promise: 'P2' }),
        B.kanban('b_rem_board', 'reminders', { title: 'Reminder queue', span: 8, file: 'components/ReminderBoard.tsx', promise: 'P2', agent: col1, groupBy: 'status', titleKey: 'subject', subtitleKey: 'customer' }),
        B.chat('b_rem_chat', col1, { title: 'Collections Agent', file: 'components/CollectionsChat.tsx', greeting: 'I write reminders that stay polite and get paid. Tell me who and how firm.', placeholder: 'e.g. Softer reminder for Northwind', suggestions: ['Softer, please', `Final notice for ${late[0]?.customer || 'the oldest invoice'}`, 'Pause reminders for Tandem Bank'] }),
      ]),
      screen('s_forecast', '/forecast', 'Forecast', 'trending-up', [
        B.header('b_fc_header', '/forecast', 'Forecast', 'Updated every Monday by Forecaster'),
        B.chart('b_fc_trend', { title: 'Collected per month', kind: 'area', span: 8, file: 'components/CollectedTrend.tsx', series: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((m, i) => ({ label: m, value: Math.round(expected * (0.8 + i * 0.06 + (r() - 0.5) * 0.1)) })) }),
        B.text('b_fc_text', `**${usd(expected)} expected this month** (±9%). ${late.slice(0, 2).map((x) => x.customer).join(' and ')} are the biggest risks — ${late[0]?.overdue || 0}+ days overdue with no promise to pay.`, { title: 'Forecaster says', span: 4, agent: fc, file: 'components/ForecastNote.tsx', promise: 'P3' }),
      ]),
    ];
    const promises = [
      P('P1', 'Track every unpaid invoice and how late it is', `Open invoices${src && src.id !== 'builtin' ? ` sync from ${src.name}` : ''} with days overdue and the next step.`, ['Paid invoices drop off within 5 minutes', 'Days overdue are correct'], ['invoices', col1], 2),
      P('P2', `Send reminders that ${c.domain === 'gentle' ? 'stay friendly' : 'escalate politely over time'}`, c.autonomy === 'auto' ? 'The sequence runs automatically and stops when someone pays.' : 'Each reminder waits for your approval.', ['A 12-day-late invoice gets a firm reminder', 'Reminders stop after payment'], [col1, 'reminders'], 3),
      P('P3', 'Forecast cash collection for the month', 'Weekly expected totals and invoices at risk.', ['Forecast updates every Monday', 'At-risk invoices have a reason'], [fc], 2.5),
      P('P4', 'Show outstanding, overdue and expected cash at a glance', 'One screen for accounts receivable.', ['Totals match the invoices table'], ['s_invoices'], 2),
    ];
    promises.push(stretch(c, 'P5', 'Text a payment link when an invoice is 30+ days late', 'A short SMS nudge with a secure payment link.', ['An SMS is sent once, at day 30'], { integration: 'twilio', est: [3, 4] }));
    return {
      tables, agents, lead, screens, promises,
      summary: `A collections desk for ${c.audienceShort}: every unpaid ${src && src.id !== 'builtin' ? src.name + ' ' : ''}invoice is tracked, customers get reminders that ${c.domain === 'gentle' ? 'stay friendly' : 'escalate politely'}${c.autonomy === 'auto' ? ' automatically' : ' after you approve them'}, and a weekly forecast shows how much cash to expect.`,
      description: 'Tracks unpaid invoices, sends escalating reminders and forecasts cash collection.',
      decisions: [{ q: 'Reminder days', a: c.domain === 'gentle' ? 'Friendly reminders at 1, 10 and 30 days' : 'Day 1 friendly · day 10 firm · day 30 final' }],
      env: [['REMINDER_DAYS', c.domain === 'gentle' ? '1,10,30' : '1,10,30'], ['PAYMENT_LINK_BASE', 'https://pay.example.com']],
    };
  },
  reply: { table: 'invoices', title: 'customer', sub: 'number', money: 'amount', metric: 'overdue', status: 'status', reason: 'next', draft: reminderDraft, draftTable: 'reminders' },
};
