// Profile archetypes: commerce (orders & stock), engineering (bugs & releases), education, research.
import { col, table, people, companies, K, P, stretch } from './kit.js';
import { stdBuild, autonomyPromise } from './std.js';
import { past, dayFrom, usd, pct, trend, weekLabels, D } from './text.js';

const series = (r, a, b, o) => trend(r, 8, a, b, o).map((value, i) => ({ label: weekLabels(8)[i], value }));

// ---------------------------------------------------------------------------
// Commerce: orders & inventory
// ---------------------------------------------------------------------------
const PRODUCTS = [['Organic cotton tee — white', 'TEE-WHT', 22], ['Organic cotton tee — black', 'TEE-BLK', 22], ['Merino beanie', 'BEA-MER', 34], ['Canvas tote bag', 'TOT-CNV', 18], ['Ceramic pour-over set', 'POS-CER', 48], ['Recycled notebook A5', 'NTB-A5', 12], ['Linen apron', 'APR-LIN', 39], ['Travel mug 350 ml', 'MUG-350', 26], ['Wool socks (3-pack)', 'SCK-3PK', 24], ['Bamboo cutting board', 'BRD-BAM', 32]];
const SUPPLIERS = ['Northfield Textiles', 'Kiln & Co', 'GreenLeaf Paper', 'Harbor Goods'];

export function orderReply(row = {}) {
  const first = String(row.customer || 'there').split(' ')[0];
  return { subject: `Your order ${row.number}`, body: `Hi ${first} — your order ${row.number} is ${String(row.status || 'on its way').toLowerCase()}${row.carrier ? ` with ${row.carrier}` : ''}. ${row.status === 'Delayed' ? 'It’s running about 2 days late — sorry! We’ve upgraded the shipping at no cost.' : 'You’ll get tracking updates by email.'}\n\nThanks for shopping with us!` };
}

export const COMMERCE = {
  id: 'commerce', family: 'commerce', label: 'Orders & inventory', category: 'Commerce',
  match: [[/\borders?\b(?! to\b)|inventory|stock levels?|low stock|restock|purchase orders?|suppliers?|e-?commerce|online (?:store|shop)|\bskus?\b/, 3], [/products?|shipping|fulfil+ment|returns?|warehouse/, 1.2]],
  hints: { shopify: 3 },
  name: (low, q) => (/inventory|stock/.test(low) && !/order/.test(low) ? 'Stock Keeper' : q ? `${q} Orders` : 'Order Ops'),
  icon: 'shopping-cart', preset: 'rose', entity: ['order', 'orders'], team: 'ops team', teamSize: '2–8 people',
  sources: ['shopify', 'gsheets', 'airtable', 'builtin'], sourceText: 'Where do your orders come from?', sourceWhy: 'Inventory Planner reads orders and stock from here.', sourceLabels: { builtin: 'Entered in this app' },
  usersRec: 'team',
  autonomy: { text: 'Should purchase orders go to suppliers automatically?', ask: 'Draft them — I approve each PO', auto: 'Send POs under $2,000 automatically', decision: 'Purchase orders', askA: 'A human approves every purchase order', autoA: 'POs under $2,000 go out automatically; larger ones ask first' },
  domainQ: { id: 'q_reorder', text: 'When should we reorder?', why: 'This becomes Inventory Planner’s reorder rule.', options: [['days', 'When stock covers less than 14 days'], ['fixed', 'At a fixed minimum per product'], ['forecast', 'Let the planner forecast demand']], rec: 'days', decision: 'Reorder rule' },
  pitch: () => 'Watches orders and stock, drafts purchase orders and answers “where is my order?”.',
  sampleQuestion: 'What’s running low?',
  data(c) {
    const { r, now } = c;
    const prods = PRODUCTS.map(([name, sku, price], i) => {
      const daily = r.int(2, 14), stock = i % 4 === 1 ? r.int(0, 12) : r.int(20, 260), cover = Math.round(stock / daily);
      return { sku, name, price, stock, daily, cover, status: stock === 0 ? 'Out' : cover < 14 ? 'Low' : 'OK', supplier: SUPPLIERS[i % 4] };
    });
    const orders = people(r, 12).map((p, i) => {
      const items = r.shuffle(prods).slice(0, r.int(1, 3));
      const status = i < 2 ? 'Paid' : r.weighted([['Packed', 2], ['Shipped', 4], ['Delivered', 4], ['Delayed', 1.2]]);
      return { number: `#${10480 + 12 - i}`, customer: p.name, items: items.map((x) => x.name).join(', '), total: items.reduce((s, x) => s + x.price, 0) + 5, status, carrier: status === 'Paid' ? '' : r.pick(['DHL', 'UPS', 'Royal Mail', 'FedEx']), placed: past(r, now, 6, 0.5 + i * 0.4) };
    }).sort((a, b) => b.placed - a.placed);
    const main = table('orders', 'Orders', 'shopping-cart', [
      col('number', 'Order', 'text'), col('customer', 'Customer', 'person'), col('items', 'Items', 'text'), col('total', 'Total', 'money'),
      col('status', 'Status', 'status', ['Paid', 'Packed', 'Shipped', 'Delivered', 'Delayed']), col('carrier', 'Carrier', 'text'), col('placed', 'Placed', 'datetime'),
    ], orders, { connection: c.src?.id, rules: 'Ops team only; customers see their own order status.' });
    const second = table('products', 'Stock', 'box', [col('sku', 'SKU', 'text'), col('name', 'Product', 'text'), col('stock', 'In stock', 'number'), col('daily', 'Sold / day', 'number'), col('cover', 'Days of cover', 'number'), col('status', 'Status', 'status', ['OK', 'Low', 'Out']), col('supplier', 'Supplier', 'text'), col('price', 'Price', 'money')], prods, { connection: c.src?.id === 'shopify' ? 'shopify' : null, prefix: 'sk', rules: 'Ops team only.' });
    return { main, second, orders, prods, low: prods.filter((x) => x.status !== 'OK') };
  },
  workers: (c, d) => [
    { id: 'a_planner', name: 'Inventory Planner', alias: ['inventory', 'plan', 'stock'], handles: 'stock levels and purchase orders', role: 'Predicts low stock and drafts purchase orders for suppliers', goal: 'Nothing sells out that could have been reordered in time.',
      instructions: `Every morning, compare stock with the last 30 days of sales. ${c.domain === 'fixed' ? 'Reorder when stock falls below each product’s minimum.' : c.domain === 'forecast' ? 'Forecast the next 30 days of demand and reorder to cover it.' : 'Reorder when stock covers less than 14 days of sales.'} Draft one purchase order per supplier with quantities and a short reason. Never change prices.`,
      creativity: 0.1, tools: [c.src && c.src.id !== 'builtin' && [c.src.id, [...c.src.read, ...c.src.write]], c.mailTool], risky: [c.mail.send, 'update_inventory'],
      triggers: [['schedule', 'Daily at 7:00'], ['event', 'Stock drops below the reorder point']], outputs: [['purchase_orders', 'list'], ['forecast', 'table']],
      runs: [[`Drafted a PO for ${d.low[0]?.supplier || SUPPLIERS[0]}`, `${c.src?.id === 'shopify' ? 'shopify.list_orders → ' : ''}forecast → ${c.mail.id}.${c.mail.draft || c.mail.send}${c.autonomy === 'auto' ? '' : ' (awaiting approval)'}`], [`Flagged ${d.low.length} products as low`, 'days of cover < 14']] },
    { id: 'a_orders', name: 'Order Assistant', alias: ['order', 'assist', 'customer', 'wismo'], handles: '“where is my order?” questions', role: 'Answers “where is my order?” questions with live status', goal: 'Customers get an accurate status in one reply.',
      instructions: 'Look up the order by number or email and reply with its status, carrier and expected delivery. If it is delayed, apologise once and offer the standard upgrade. Never share another customer’s details and never promise a refund — hand refunds to a human.',
      creativity: 0.4, memory: 'session', tools: [c.src?.id === 'shopify' && ['shopify', ['list_orders']], c.mailTool], risky: [c.mail.send], blocked: ['Refunds', 'Other customers’ details'],
      triggers: [['email', 'Customer email: “where is my order”'], ['chat', 'Store chat']], outputs: [['reply', 'text']],
      runs: [[`Answered ${d.orders[3].customer} about ${d.orders[3].number}`, `${c.src?.id === 'shopify' ? 'shopify.list_orders' : 'orders'} → status ${d.orders[3].status}`]] },
  ],
  layout: (c, d, ids) => ({
    screens: [
      { key: 'orders', route: '/orders', title: 'Orders', icon: 'shopping-cart', promise: 'P4', subtitle: `${c.src && c.src.id !== 'builtin' ? `Synced from ${c.src.name} · ` : ''}newest first`, actions: [['Export', 'secondary', 'download']],
        kpis: { table: 'orders', promise: 'P4', items: [K('Orders today', d.orders.filter((x) => c.now - x.placed < D).length || 2, `+${c.r.int(1, 5)} vs yesterday`, 'up', 'shopping-cart'), K('Revenue, 7 days', usd(d.orders.reduce((s, x) => s + x.total, 0) * 6), `+${c.r.int(3, 12)}%`, 'up', 'coins'), K('Delayed', d.orders.filter((x) => x.status === 'Delayed').length, 'customers told', 'flat', 'alert-triangle'), K('Low stock', d.low.length, 'POs drafted', 'flat', 'box')] },
        view: { type: 'table', table: 'orders', title: 'Recent orders', columns: ['number', 'customer', 'items', 'total', 'status', 'carrier'], filters: ['status'], rowAction: { label: 'Draft status reply', agent: ids.w2 }, promise: 'P2', agent: ids.w2 },
        chat: { agent: ids.lead, promise: 'P2', greeting: 'Ask about orders or stock — I’ll check the live numbers.', placeholder: 'Ask about orders…', suggestions: ['What’s running low?', `Where is order ${d.orders[2].number}?`, 'Summarise this week'] },
        charts: [{ title: 'Orders by status', table: 'orders', kind: 'donut', groupBy: 'status', promise: 'P4' }, { title: 'Stock status', table: 'products', kind: 'bar', groupBy: 'status', promise: 'P1' }], activity: ids.w1 },
      { key: 'stock', route: '/stock', title: 'Stock', icon: 'box', promise: 'P1', subtitle: c.autonomy === 'auto' ? 'POs under $2,000 go to suppliers automatically' : 'Purchase orders wait for your approval', actions: [[c.autonomy === 'auto' ? 'Pause auto-orders' : 'Review draft POs', 'primary', c.autonomy === 'auto' ? 'pause' : 'check']],
        view: { type: 'table', table: 'products', title: 'Stock levels', columns: ['name', 'stock', 'daily', 'cover', 'status', 'supplier'], filters: ['status', 'supplier'], rowAction: { label: 'Draft purchase order', agent: ids.w1 }, promise: 'P1', agent: ids.w1 },
        chat: { agent: ids.w1, title: 'Inventory Planner', promise: 'P1', greeting: 'I watch stock and draft purchase orders before you run out.', suggestions: ['What will sell out in 2 weeks?', `Draft a PO for ${SUPPLIERS[0]}`, 'Why is the beanie low?'] } },
    ],
    insights: { promise: 'P4', kpis: [K('Revenue, 30 days', usd(d.orders.reduce((s, x) => s + x.total, 0) * 26), `+${c.r.int(4, 14)}%`, 'up', 'coins'), K('Stock-outs avoided', c.r.int(3, 9), 'this month', 'up', 'shield-check'), K('On-time delivery', pct(c.r.int(91, 98)), 'last 30 days', 'flat', 'send'), K('Agent cost', `$${(2 + c.r() * 2).toFixed(2)}`, '$0.01 / order', 'flat', 'coins')],
      trend: { title: 'Orders per week', kind: 'bar', series: series(c.r, 60, 110) }, text: `**${d.low.length} product${d.low.length === 1 ? ' is' : 's are'} running low** — ${d.low.slice(0, 2).map((x) => x.name).join(' and ') || 'none right now'}. ${d.orders.filter((x) => x.status === 'Delayed').length} delayed order${d.orders.filter((x) => x.status === 'Delayed').length === 1 ? '' : 's'} this week.` },
  }),
  promises: (c, d, ids) => [
    P('P1', 'Predict low stock and draft purchase orders before you sell out', 'One PO per supplier with quantities and a reason.', ['A product with under 14 days of cover gets a PO', 'POs group items by supplier'], [ids.w1, 'products'], 3),
    P('P2', 'Answer “where is my order?” with the live status', 'Customers get the carrier and delivery estimate in one reply.', ['Replies quote the real order status', 'Refund requests go to a human'], [ids.w2, 'orders'], 2),
    autonomyPromise(c, 'P3', ids.w1, { action: c.mail.send, what: 'Send a purchase order' }),
    P('P4', 'Show orders, revenue and stock at a glance', 'One screen for the whole shop.', ['Charts match the orders and stock tables'], ['s_orders', 's_insights'], 2),
    stretch(c, 'P5', `Alert ${c.chat.name} when a best-seller is about to sell out`, 'A heads-up before it hurts.', [`A ${c.chat.name} alert is posted within 5 minutes`], { integration: c.chat.id, est: [2, 3] }),
  ],
  summary: (c) => `An order desk for ${c.audienceShort}: orders and stock stay in sync${c.src && c.src.id !== 'builtin' ? ` with ${c.src.name}` : ''}, Inventory Planner drafts purchase orders before anything sells out, and Order Assistant answers “where is my order?” with the live status.`,
  decisions: () => [{ q: 'Refunds', a: 'Always handled by a human' }],
  env: () => [['REORDER_DAYS_COVER', 14], ['AUTO_PO_LIMIT_USD', 2000]],
  reply: { table: 'orders', title: 'number', sub: 'customer', money: 'total', status: 'status', reason: 'items', draft: orderReply, priority: ['Delayed', 'Paid', 'Packed', 'Shipped', 'Delivered'] },
};
COMMERCE.build = stdBuild(COMMERCE);

// ---------------------------------------------------------------------------
// Engineering: bugs, issues & releases
// ---------------------------------------------------------------------------
const BUGS = [['Checkout button does nothing on Safari', 'Checkout'], ['Password reset email never arrives', 'Login'], ['Dashboard totals off by one day', 'Dashboard'], ['API returns 500 on large exports', 'API'], ['App crashes when uploading a photo', 'Mobile app'], ['Duplicate notifications after update', 'Notifications'], ['Checkout fails with saved cards', 'Checkout'], ['Can’t log in with Google on Android', 'Login'], ['CSV export missing the last row', 'API'], ['Dark mode text unreadable in settings', 'Mobile app'], ['Search ignores accented letters', 'Dashboard'], ['Slow page load on the reports tab', 'Dashboard']];
const COMPONENTS = ['Checkout', 'Login', 'Dashboard', 'API', 'Mobile app', 'Notifications'];

export const ENGINEERING = {
  id: 'engineering', family: 'engineering', label: 'Bugs & releases', category: 'Product & Engineering',
  match: [[/\bbugs?\b|bug reports?|issues? (?:tracker|triage)|sprints?|release notes|changelog|pull requests?|incidents?|on-?call|what shipped/, 3], [/\bjira\b|\blinear\b|github|engineering|developers?|standups?|deploys?/, 1.5]],
  hints: { jira: 1.5, linear: 1.5, github: 1.5 },
  name: (low) => (/release|changelog|shipped|sprint/.test(low) && !/bug/.test(low) ? 'Sprint Reporter' : 'Bug Triage'),
  icon: 'bug', preset: 'slate', entity: ['issue', 'issues'], team: 'engineering team', teamSize: '4–20 engineers',
  sources: ['jira', 'linear', 'github', 'builtin'], sourceText: 'Where do you track issues today?', sourceWhy: 'Issue Writer files issues there.', sourceLabels: { builtin: 'In this app for now' },
  usersRec: 'team',
  autonomy: { text: 'Should issues be filed automatically?', ask: 'Draft them — an engineer reviews before filing', auto: 'File automatically; we review later', decision: 'Filing issues', askA: 'An engineer approves every issue before it’s filed', autoA: 'Filed automatically with a link back to the report' },
  domainQ: { id: 'q_sev', text: 'How should severity be judged?', why: 'Triage Agent uses this to rank the queue.', options: [['both', 'Users affected and revenue at risk'], ['users', 'By how many users are affected'], ['revenue', 'By revenue at risk']], rec: 'both', decision: 'Severity rule' },
  pitch: () => 'Triages bug reports, removes duplicates, rates severity and files clear issues.',
  sampleQuestion: 'What’s critical right now?',
  data(c) {
    const { r, now } = c;
    const ppl = people(r, 12), key = c.src?.id === 'linear' ? 'ENG' : c.src?.id === 'github' ? '#' : 'BUG-';
    const rows = BUGS.map(([title, comp], i) => {
      const affected = r.int(3, 900), sev = affected > 500 || comp === 'Checkout' ? 'Critical' : affected > 150 ? 'High' : affected > 40 ? 'Medium' : 'Low';
      const status = i === 6 ? 'Duplicate' : r.pick(['New', 'Triaged', 'Filed', 'Filed', 'Fixed']);
      return { key: key === '#' ? `#${880 + i * 3}` : `${key}${412 + i * 3}`, title, component: comp, severity: sev, affected, status, reporter: ppl[i].name, created: past(r, now, 7, 0.5 + i * 0.3), repro: `1. Open ${comp.toLowerCase()}\n2. ${title.toLowerCase().includes('upload') ? 'Upload a 12 MB photo' : 'Repeat the reported action'}\n3. Expected it to work — it ${title.toLowerCase().includes('slow') ? 'takes 9 s' : 'fails'}` };
    }).sort((a, b) => b.created - a.created);
    const main = table('issues', 'Issues', 'bug', [
      col('key', 'Key', 'text'), col('title', 'Title', 'text'), col('component', 'Area', 'status', COMPONENTS), col('severity', 'Severity', 'status', ['Critical', 'High', 'Medium', 'Low']), col('affected', 'Users affected', 'number'),
      col('status', 'Status', 'status', ['New', 'Triaged', 'Filed', 'Duplicate', 'Fixed']), col('reporter', 'Reported by', 'person'), col('created', 'Reported', 'datetime'), col('repro', 'Steps to reproduce', 'longtext'),
    ], rows, { connection: c.src?.id, rules: 'Engineering and support can see issues; only engineers change severity.' });
    const rel = Array.from({ length: 6 }, (_, i) => ({ version: `v3.${14 - i}`, date: dayFrom(now, -7 * i - 2), shipped: r.int(6, 19), fixed: r.int(2, 9), highlights: ['Faster exports and a new reports tab', 'Google sign-in on Android fixed', 'Saved cards at checkout', 'Dark mode polish', 'Bulk edit for records', 'New notifications centre'][i], risk: r.pick(['Low', 'Low', 'Medium', 'High']) }));
    const second = table('releases', 'Releases', 'rocket', [col('version', 'Version', 'text'), col('date', 'Shipped', 'date'), col('shipped', 'Changes', 'number'), col('fixed', 'Bugs fixed', 'number'), col('highlights', 'Highlights', 'longtext'), col('risk', 'Risk', 'status', ['Low', 'Medium', 'High'])], rel, { prefix: 'rel', rules: 'Everyone can read release notes.' });
    return { main, second, rows, crit: rows.filter((x) => x.severity === 'Critical' && x.status !== 'Fixed') };
  },
  workers(c, d) {
    const filer = c.src && c.src.id !== 'builtin' ? [c.src.id, ['create_issue']] : ['jira', ['create_issue']];
    return [
      { id: 'a_triage', name: 'Triage Agent', alias: ['triage', 'dedup', 'sever'], handles: 'severity and duplicate questions', role: 'Deduplicates bug reports and rates severity', goal: 'Every report is triaged within 10 minutes.',
        instructions: `For each new report, search for duplicates and merge them. Rate severity ${c.domain === 'users' ? 'by users affected' : c.domain === 'revenue' ? 'by revenue at risk' : 'by users affected and revenue at risk'}: anything blocking checkout or login is Critical. Write a one-line summary an engineer understands.`,
        creativity: 0.1, tools: [c.has('freshdesk') && ['freshdesk', ['list_tickets']], c.has('zendesk') && ['zendesk', ['list_tickets']], c.src?.id === 'jira' && ['jira', ['search_issues']]], knowledge: [['file', 'Severity guide.md', '4 KB']],
        triggers: [['webhook', 'New bug report'], ['schedule', 'Every 10 minutes']], outputs: [['severity', 'Critical | High | Medium | Low'], ['duplicate_of', 'text']],
        runs: [[`Triaged ${c.r.int(4, 9)} new reports`, 'dedupe → severity'], [`Merged a duplicate into ${d.rows[1].key}`, 'similarity 0.93']] },
      { id: 'a_writer', name: 'Issue Writer', alias: ['issue', 'writ', 'file', 'changelog', 'release'], handles: 'writing issues and release notes', role: 'Turns reports into well-written issues with reproduction steps', goal: 'Engineers can start fixing without asking a question.',
        instructions: 'Write each issue with a clear title, the impact, numbered steps to reproduce, expected vs actual behaviour and the affected area. Link the original reports. Never include customer personal data — refer to them by account id.',
        creativity: 0.3, tools: [filer], risky: ['create_issue'], triggers: [['event', 'A report is triaged']], outputs: [['issue', 'markdown']],
        runs: [[`Filed ${d.rows[2].key}`, `${filer[0]}.create_issue${c.autonomy === 'auto' ? '' : ' (awaiting approval)'}`]] },
    ];
  },
  layout: (c, d, ids) => ({
    screens: [
      { key: 'issues', route: '/issues', title: 'Issues', icon: 'bug', promise: 'P1', subtitle: 'Deduplicated and ranked by severity automatically', actions: [['Report a bug', 'primary', 'plus']],
        kpis: { table: 'issues', promise: 'P4', items: [K('New today', d.rows.filter((x) => c.now - x.created < D).length || 2, 'reports', 'flat', 'inbox'), K('Critical open', d.crit.length, 'blocking users', 'flat', 'alert-triangle'), K('Duplicates merged', c.r.int(8, 20), 'this week', 'up', 'layers'), K('Time to triage', `${c.r.int(4, 9)} min`, 'was 1 day', 'up', 'clock')] },
        view: { type: 'table', table: 'issues', title: 'Queue', columns: ['key', 'title', 'component', 'severity', 'affected', 'status'], filters: ['severity', 'status', 'component'], rowAction: { label: 'Write the issue', agent: ids.w2 }, promise: 'P1', agent: ids.w1 },
        chat: { agent: ids.lead, promise: 'P2', greeting: 'Ask about bugs, severity or what shipped.', placeholder: 'Ask about issues…', suggestions: ['What’s critical right now?', `Write up ${d.rows[0].key}`, 'What shipped last week?'] },
        charts: [{ title: 'By severity', table: 'issues', kind: 'donut', groupBy: 'severity', promise: 'P4' }, { title: 'By area', table: 'issues', kind: 'bar', groupBy: 'component', promise: 'P4' }], activity: ids.w1 },
      { key: 'board', route: '/board', title: 'Board', icon: 'layers', promise: 'P2', subtitle: c.autonomy === 'auto' ? 'Issues are filed automatically' : 'Drafted issues wait for an engineer’s approval',
        view: { type: 'kanban', table: 'issues', groupBy: 'status', titleKey: 'title', subtitleKey: 'key', title: 'Issue board', promise: 'P2', agent: ids.w2 },
        chat: { agent: ids.w2, title: 'Issue Writer', promise: 'P2', greeting: 'Paste a bug report and I’ll write a clear issue.', suggestions: ['Add steps to reproduce', 'Make the title clearer', 'Draft release notes for v3.14'] } },
    ],
    insights: { promise: 'P4', subtitle: 'Quality and release health', kpis: [K('Bugs fixed', c.r.int(20, 40), 'last 30 days', 'up', 'check-circle'), K('Releases', d.second.rows.length, 'last 6 weeks', 'flat', 'rocket'), K('Critical open', d.crit.length, 'right now', 'flat', 'alert-triangle'), K('Agent cost', `$${(1 + c.r() * 2).toFixed(2)}`, '$0.02 / report', 'flat', 'coins')],
      trend: { title: 'Open bugs, last 8 weeks', kind: 'line', series: series(c.r, 48, 26) }, text: `**Open bugs are trending down.** ${d.crit.length} critical issue${d.crit.length === 1 ? '' : 's'} still open, most in ${d.crit[0]?.component || 'Checkout'}. The last release, ${d.second.rows[0].version}, fixed ${d.second.rows[0].fixed} bugs.` },
  }),
  promises: (c, d, ids) => [
    P('P1', 'Deduplicate every bug report and rate its severity', 'The queue shows what really matters first.', ['Checkout and login failures are always Critical', 'Duplicates are merged, not deleted'], [ids.w1, 'issues'], 3),
    P('P2', 'Write clear issues with steps to reproduce', 'Engineers can start without a single question.', ['Every issue has numbered steps', 'No customer personal data in issues'], [ids.w2], 2),
    autonomyPromise(c, 'P3', ids.w2, { action: 'create_issue', what: 'File an issue' }),
    P('P4', 'Show the bug queue and release health at a glance', 'Leads see risk without a meeting.', ['Charts match the issues table'], ['s_issues', 's_insights'], 2),
    stretch(c, 'P5', `Post a weekly “what shipped” summary in ${c.chat.name}`, 'Release notes for the whole company.', [`A summary is posted every Friday in ${c.chat.name}`], { integration: c.chat.id, est: [2, 3] }),
  ],
  summary: (c) => `A bug desk for ${c.audienceShort}: every report is deduplicated and rated by severity, Issue Writer turns it into a clear issue with steps to reproduce${c.autonomy === 'auto' ? ' and files it' : ' for an engineer to approve'}, and a dashboard shows release health.`,
  decisions: () => [{ q: 'Critical means', a: 'Blocks checkout or login, or affects 500+ users' }],
  env: () => [['CRITICAL_USERS_THRESHOLD', 500]],
  reply: { table: 'issues', title: 'key', sub: 'title', metric: 'affected', reason: 'repro', status: 'severity', priority: ['Critical', 'High', 'Medium', 'Low'] },
};
ENGINEERING.build = stdBuild(ENGINEERING);

// ---------------------------------------------------------------------------
// Education
// ---------------------------------------------------------------------------
const LESSONS = ['Cells and organelles', 'Photosynthesis', 'Respiration', 'DNA and genes', 'Ecosystems', 'Evolution', 'The nervous system', 'Enzymes'];

export const EDUCATION = {
  id: 'education', family: 'education', label: 'Teaching & tutoring', category: 'Education',
  match: [[/students?|lessons?|quiz(?:zes)?|courses?|tutor(?:ing)?|homework|classroom|curriculum|learners?/, 3], [/teachers?|grades?|school|study|exams?|revision/, 1.2]],
  hints: {},
  name: (low, q) => (/quiz/.test(low) && !/tutor|course/.test(low) ? 'Quiz Master' : q === 'Campus' ? 'Campus Tutor' : 'Course Tutor'),
  icon: 'graduation-cap', preset: 'grape', entity: ['student', 'students'], team: 'teachers', teamSize: '1–10 teachers',
  sources: ['gdocs', 'gdrive', 'gsheets', 'builtin'], sourceText: 'Where do your lesson materials live?', sourceWhy: 'Tutor and Quiz Maker only use these materials.', sourceLabels: { builtin: 'Upload them here' },
  usersRec: 'company', usersLabels: { company: 'Teachers + students' },
  autonomy: { text: 'Should new quizzes go to students automatically?', ask: 'I review each quiz first', auto: 'Publish after each lesson', decision: 'Publishing quizzes', askA: 'A teacher approves every quiz', autoA: 'Quizzes publish automatically after each lesson' },
  domainQ: { id: 'q_level', text: 'Who are the learners?', why: 'Tutor adjusts its language and examples.', options: [['school', 'School (ages 11–18)'], ['uni', 'University'], ['adult', 'Adult learners']], rec: 'school', decision: 'Level' },
  pitch: () => 'Quizzes students on each lesson, explains wrong answers and shows teachers who needs help.',
  sampleQuestion: 'Who needs help this week?',
  data(c) {
    const { r, now } = c;
    const cls = c.domain === 'uni' ? ['BIO101 — Group A', 'BIO101 — Group B'] : c.domain === 'adult' ? ['Evening course', 'Weekend course'] : ['Year 9 Biology', 'Year 10 Biology'];
    const rows = people(r, 12).map((p, i) => {
      const progress = r.int(35, 100), score = r.int(42, 98);
      return { name: p.name, class: cls[i % 2], progress, score, status: score < 60 ? 'Needs help' : score > 88 && progress > 80 ? 'Ahead' : 'On track', weak: LESSONS[r.int(0, 7)], active: past(r, now, 5, 1) };
    });
    const main = table('students', 'Students', 'users', [col('name', 'Student', 'person'), col('class', 'Class', 'status', cls), col('progress', 'Progress', 'percent'), col('score', 'Quiz average', 'score'), col('status', 'Status', 'status', ['Needs help', 'On track', 'Ahead']), col('weak', 'Weakest topic', 'text'), col('active', 'Last active', 'datetime')], rows, { rules: 'Teachers see their classes; students see only their own progress.' });
    const second = table('quizzes', 'Quizzes', 'check-circle', [col('lesson', 'Lesson', 'text'), col('questions', 'Questions', 'number'), col('avg', 'Average score', 'percent'), col('attempts', 'Attempts', 'number'), col('status', 'Status', 'status', ['Draft', 'Published'])],
      LESSONS.map((l, i) => ({ lesson: l, questions: r.int(6, 12), avg: i < 6 ? r.int(58, 91) : null, attempts: i < 6 ? r.int(14, 24) : 0, status: i < 6 ? 'Published' : 'Draft' })), { connection: c.src?.id === 'gdocs' ? 'gdocs' : null, prefix: 'qz', rules: 'Teachers edit; students take published quizzes.' });
    return { main, second, rows, help: rows.filter((x) => x.status === 'Needs help') };
  },
  workers: (c, d) => [
    { id: 'a_tutor', name: 'Tutor', alias: ['tutor', 'explain', 'teach'], handles: 'explanations and study help', role: 'Explains wrong answers step by step and suggests what to revise', goal: 'Every student understands why an answer was wrong.',
      instructions: `Explain concepts from the lesson materials only, using language for ${c.domain === 'uni' ? 'university students' : c.domain === 'adult' ? 'adult learners' : 'students aged 11–18'}. When an answer is wrong, give a hint first, then the explanation. Never just give answers to homework, and never discuss anything unrelated to the course.`,
      creativity: 0.4, memory: 'long-term', knowledge: LESSONS.slice(0, 4).map((l, i) => ['file', `Lesson ${i + 1} — ${l}.pdf`, `${8 + i * 2} pages`]), tools: [c.src && c.src.id !== 'builtin' && [c.src.id, c.src.read]], blocked: ['Homework answers', 'Personal topics'],
      triggers: [['chat', 'Student chat'], ['event', 'A quiz answer is wrong']], outputs: [['explanation', 'text'], ['next_topic', 'text']],
      runs: [[`Explained ${d.rows[0].weak.toLowerCase()} to ${d.rows[0].name.split(' ')[0]}`, `Lesson notes p.${c.r.int(2, 9)} · hint → explanation`]] },
    { id: 'a_quiz', name: 'Quiz Maker', alias: ['quiz', 'test', 'question'], handles: 'creating and grading quizzes', role: 'Writes a quiz for every lesson and grades it', goal: 'Every lesson has a fair quiz within an hour.',
      instructions: 'Write 8–10 questions per lesson that cover every learning objective: mostly multiple choice, plus one short answer. Include the correct answer and an explanation for each. Match the difficulty to the class.',
      creativity: 0.5, tools: [c.src?.id === 'gdocs' && ['gdocs', ['create_doc']]], risky: ['publish_quiz'], platform: ['publish_quiz'], triggers: [['event', 'A lesson is added']], outputs: [['quiz', 'list']],
      runs: [[`Wrote a quiz on ${LESSONS[6]}`, `10 questions · ${c.autonomy === 'auto' ? 'published' : 'awaiting approval'}`]] },
  ],
  layout: (c, d, ids) => ({
    screens: [
      { key: 'students', route: '/students', title: 'Students', icon: 'users', promise: 'P3', subtitle: 'Progress per student — who needs help comes first',
        kpis: { table: 'students', promise: 'P3', items: [K('Students', d.rows.length, 'active this week', 'flat', 'users'), K('Need help', d.help.length, 'below 60%', 'flat', 'alert-triangle'), K('Quiz average', pct(d.rows.reduce((s, x) => s + x.score, 0) / d.rows.length), `+${c.r.int(2, 6)} pts`, 'up', 'check-circle'), K('Teacher hours saved', `${c.r.int(4, 10)} h`, 'this week', 'up', 'clock')] },
        view: { type: 'table', table: 'students', title: 'Class progress', columns: ['name', 'class', 'progress', 'score', 'status', 'weak'], filters: ['status', 'class'], rowAction: { label: 'Suggest revision', agent: ids.w1 }, promise: 'P3' },
        chat: { agent: ids.lead, promise: 'P1', greeting: 'Ask about any student or lesson.', placeholder: 'Ask about progress…', suggestions: ['Who needs help this week?', `How is ${d.rows[1].name.split(' ')[0]} doing?`, 'Which lesson was hardest?'] },
        charts: [{ title: 'Students by status', table: 'students', kind: 'donut', groupBy: 'status', promise: 'P3' }, { title: 'By class', table: 'students', kind: 'bar', groupBy: 'class', promise: 'P3' }], activity: ids.w1 },
      { key: 'quizzes', route: '/quizzes', title: 'Quizzes', icon: 'check-circle', promise: 'P2', subtitle: c.autonomy === 'auto' ? 'Quizzes publish after each lesson' : 'Draft quizzes wait for a teacher', actions: [['New quiz', 'primary', 'plus']],
        view: { type: 'cards', table: 'quizzes', title: 'Quizzes by lesson', titleKey: 'lesson', subtitleKey: 'status', metaKeys: ['questions', 'avg', 'attempts'], badgeKey: 'status', promise: 'P2' },
        chat: { agent: ids.w2, title: 'Quiz Maker', promise: 'P2', greeting: 'Tell me the lesson and I’ll write a quiz.', suggestions: [`Write a quiz on ${LESSONS[7]}`, 'Make it harder', 'Add a short-answer question'] } },
    ],
    insights: { promise: 'P3', subtitle: 'Learning across your classes', kpis: [K('Quizzes taken', c.r.int(120, 240), 'last 30 days', 'up', 'check-circle'), K('Avg improvement', `+${c.r.int(6, 14)} pts`, 'after tutoring', 'up', 'trending-up'), K('Questions asked', c.r.int(200, 400), 'to Tutor', 'flat', 'message-square'), K('Agent cost', `$${(1 + c.r() * 2).toFixed(2)}`, '$0.01 / question', 'flat', 'coins')],
      trend: { title: 'Class quiz average, last 8 weeks', kind: 'line', series: series(c.r, 64, 78) }, text: `**${d.help.length} student${d.help.length === 1 ? ' needs' : 's need'} help**, mostly with ${d.help[0]?.weak || LESSONS[1]}. Quiz averages are up this month.` },
  }),
  promises: (c, d, ids) => [
    P('P1', 'Explain every wrong answer step by step', 'Hint first, then the explanation — from your materials only.', ['Explanations cite the lesson', 'Homework answers are never given outright'], [ids.w1], 2.5),
    P('P2', 'Write a quiz for every lesson', '8–10 questions covering every objective, with answers.', ['Every lesson has a quiz', 'Each question has an explanation'], [ids.w2, 'quizzes'], 2),
    P('P3', 'Show teachers each student’s progress', 'Who needs help is obvious at a glance.', ['Students under 60% are marked Needs help', 'Dashboard matches the students table'], ['s_students', 'students'], 2.5),
    autonomyPromise(c, 'P4', ids.w2, { action: 'publish_quiz', what: 'Publish a quiz' }),
    stretch(c, 'P5', 'Email parents a weekly progress note', 'A short, kind summary for each student.', ['A note is drafted for each student every Friday'], { integration: c.mail.id, est: [2, 3] }),
  ],
  summary: (c) => `A course companion for ${c.audienceShort}: students are quizzed on each lesson, Tutor explains wrong answers from your materials, and teachers see every student’s progress on one dashboard.`,
  decisions: () => [{ q: 'Needs help', a: 'Quiz average below 60%' }],
  env: () => [['NEEDS_HELP_BELOW', 60]],
  reply: { table: 'students', title: 'name', sub: 'class', metric: 'score', status: 'status', reason: 'weak', priority: ['Needs help', 'On track', 'Ahead'] },
};
EDUCATION.build = stdBuild(EDUCATION);

// ---------------------------------------------------------------------------
// Research
// ---------------------------------------------------------------------------
const RIVALS = [['Flowbase', 'flowbase.io', 29, 'All-in-one for small teams'], ['Stackly', 'stackly.com', 49, 'Enterprise-first, heavy onboarding'], ['Kitewing', 'kitewing.app', 19, 'Cheapest; limited integrations'], ['Northstar HQ', 'northstarhq.com', 39, 'Strong analytics, weak mobile'], ['Parallel', 'parallel.so', 0, 'Free tier, paid add-ons'], ['Tidewater', 'tidewater.ai', 59, 'AI-first, premium pricing'], ['Brightdesk', 'brightdesk.co', 25, 'Great support, dated UI'], ['Loop Labs', 'looplabs.dev', 35, 'Developer-focused, API first']];
const FIND = [['Raised prices by 20% on the Team plan', 'Pricing'], ['Launched an AI assistant in beta', 'Feature'], ['Hiring 12 enterprise sales reps', 'Hiring'], ['Removed the free tier', 'Pricing'], ['Announced a Salesforce integration', 'Feature'], ['Published a SOC 2 report', 'News'], ['Cut onboarding to 1 day', 'Feature'], ['Opened an office in London', 'News']];

export const RESEARCH = {
  id: 'research', family: 'research', label: 'Research & competitive intel', category: 'Marketing',
  match: [[/competitors?|competitive|market research|research (?:brief|report)|landscape|benchmark|compare (?:features|pricing)/, 3], [/\bresearch\b|papers?|arxiv|trends?|analysis/, 1]],
  hints: { websearch: 1, scraper: 1.5, arxiv: 1 },
  name: (low) => (/paper|arxiv|academic/.test(low) ? 'Paper Scout' : /competitor|competitive/.test(low) ? 'Competitor Watch' : 'Research Brief'),
  icon: 'compass', preset: 'blueprint', entity: ['competitor', 'competitors'], team: 'strategy team', teamSize: '1–5 people',
  sources: ['gdocs', 'notion', 'gdrive', 'builtin'], sourceText: 'Where should briefs be saved?', sourceWhy: 'Analyst saves each brief there.', sourceLabels: { builtin: 'Keep them in this app' },
  usersRec: 'team',
  autonomy: { text: 'Should the weekly brief be shared automatically?', ask: 'I review before it’s shared', auto: 'Share every Monday automatically', decision: 'Sharing briefs', askA: 'A human reviews every brief before sharing', autoA: 'Shared every Monday at 9:00' },
  domainQ: { id: 'q_focus', text: 'What should the research focus on?', why: 'Web Researcher prioritises these sources.', options: [['all', 'Pricing, features and news'], ['pricing', 'Pricing & packaging'], ['features', 'Features & positioning']], rec: 'all', decision: 'Focus' },
  pitch: () => 'Researches competitors on the web, compares them in a table and writes a one-page brief.',
  sampleQuestion: 'What changed this week?',
  data(c) {
    const { r, now } = c;
    const rows = RIVALS.map(([name, site, price, pos], i) => ({ name, website: `https://${site}`, price, positioning: pos, features: r.int(18, 46), threat: i % 3 === 0 ? 'High' : i % 3 === 1 ? 'Medium' : 'Low', updated: past(r, now, 6, 2) }));
    const main = table('competitors', 'Competitors', 'compass', [col('name', 'Competitor', 'text'), col('website', 'Website', 'url'), col('price', 'Price / seat', 'money'), col('positioning', 'Positioning', 'longtext'), col('features', 'Features', 'number'), col('threat', 'Threat', 'status', ['High', 'Medium', 'Low']), col('updated', 'Last checked', 'datetime')], rows, { rules: 'Internal only.' });
    const frows = FIND.map(([f, cat], i) => ({ finding: f, competitor: rows[(i * 3) % rows.length].name, category: cat, source: `${rows[(i * 3) % rows.length].website}/${cat === 'Pricing' ? 'pricing' : cat === 'Hiring' ? 'careers' : 'blog'}`, found: past(r, now, 10, 1) })).sort((a, b) => b.found - a.found);
    const second = table('findings', 'Findings', 'search', [col('finding', 'Finding', 'text'), col('competitor', 'Competitor', 'text'), col('category', 'Type', 'status', ['Pricing', 'Feature', 'News', 'Hiring']), col('source', 'Source', 'url'), col('found', 'Found', 'datetime')], frows, { prefix: 'f', rules: 'Every finding links to its source.' });
    return { main, second, rows, frows };
  },
  workers: (c, d) => [
    { id: 'a_web', name: 'Web Researcher', alias: ['research', 'web', 'scout', 'search'], handles: 'finding and checking facts on the web', role: 'Checks competitor websites, pricing pages and news every week', goal: 'Every change is spotted within a week, with a source.',
      instructions: `Every week, read each competitor’s website, pricing page and recent news${c.domain === 'pricing' ? ', focusing on pricing and packaging' : c.domain === 'features' ? ', focusing on features and positioning' : ''}. Record each change as a finding with the exact source URL. Only use public information and never guess numbers.`,
      creativity: 0.2, tools: [['websearch', ['search_web']], ['scraper', ['read_url']], c.has('arxiv') && ['arxiv', ['search_papers']]], triggers: [['schedule', 'Mondays at 7:00']], outputs: [['findings', 'list'], ['sources', 'list']],
      runs: [[`Checked ${d.rows.length} competitors`, `websearch.search_web ×${d.rows.length} · scraper.read_url ×${d.rows.length * 2}`], [`Found: ${d.frows[0].competitor} ${d.frows[0].finding.toLowerCase()}`, d.frows[0].source]] },
    { id: 'a_analyst', name: 'Analyst', alias: ['analy', 'brief', 'compar', 'writ'], handles: 'comparisons and the weekly brief', role: 'Compares features and pricing and writes a one-page brief', goal: 'A brief a busy exec can read in two minutes.',
      instructions: 'Compare competitors on price, features and positioning in a table. Write a one-page brief: what changed, what it means for us, and three opportunities. Every claim links to a finding. Mark anything uncertain as such.',
      creativity: 0.4, tools: [c.src && c.src.write.length && [c.src.id, c.src.write.slice(0, 1)], !c.src && ['gdocs', ['create_doc']]], risky: ['create_doc', 'create_page'], triggers: [['schedule', 'Mondays at 9:00'], ['chat', 'Analyst panel']], outputs: [['brief', 'markdown'], ['table', 'table']],
      runs: [['Wrote this week’s brief', `${d.frows.length} findings · ${c.src?.write?.length ? `${c.src.id}.${c.src.write[0]}` : 'gdocs.create_doc'}${c.autonomy === 'auto' ? '' : ' (awaiting approval)'}`]] },
  ],
  layout: (c, d, ids) => ({
    screens: [
      { key: 'competitors', route: '/competitors', title: 'Competitors', icon: 'compass', promise: 'P2', subtitle: 'Checked on the web every week — every fact has a source', actions: [['Add competitor', 'primary', 'plus']],
        kpis: { table: 'competitors', promise: 'P2', items: [K('Tracked', d.rows.length, 'competitors', 'flat', 'compass'), K('Changes this week', d.frows.filter((x) => c.now - x.found < 7 * D).length, 'with sources', 'up', 'search'), K('Price range', `${usd(Math.min(...d.rows.map((x) => x.price)))}–${usd(Math.max(...d.rows.map((x) => x.price)))}`, 'per seat', 'flat', 'coins'), K('High threat', d.rows.filter((x) => x.threat === 'High').length, 'to watch', 'flat', 'alert-triangle')] },
        view: { type: 'table', table: 'competitors', title: 'Comparison', columns: ['name', 'price', 'features', 'threat', 'positioning', 'updated'], filters: ['threat'], rowAction: { label: 'Research again', agent: ids.w1 }, promise: 'P2', agent: ids.w2 },
        chat: { agent: ids.lead, promise: 'P3', greeting: 'Ask me about any competitor — I’ll cite the source.', placeholder: 'Ask about competitors…', suggestions: ['What changed this week?', `How does ${d.rows[1].name} price?`, 'Where are the opportunities?'] },
        charts: [{ title: 'Competitors by threat', table: 'competitors', kind: 'donut', groupBy: 'threat', promise: 'P2' }, { title: 'Findings by type', table: 'findings', kind: 'bar', groupBy: 'category', promise: 'P1' }], activity: ids.w1 },
      { key: 'findings', route: '/findings', title: 'Findings', icon: 'search', promise: 'P1', subtitle: 'Every change we found, newest first, with its source',
        view: { type: 'table', table: 'findings', title: 'Findings', columns: ['finding', 'competitor', 'category', 'source', 'found'], filters: ['category', 'competitor'], promise: 'P1', agent: ids.w1 },
        chat: { agent: ids.w2, title: 'Analyst', promise: 'P3', greeting: 'I turn findings into a one-page brief.', suggestions: ['Write this week’s brief', 'Compare pricing in a table', 'What should we do next?'] } },
    ],
  }),
  promises: (c, d, ids) => [
    P('P1', 'Find every competitor change on the web, with a source', 'Websites, pricing pages and news, checked weekly.', ['Every finding links to a public URL', 'Nothing is guessed'], [ids.w1, 'findings'], 3),
    P('P2', 'Compare features and pricing in one table', 'See the whole market at a glance.', ['Prices match the pricing pages', 'Table updates weekly'], [ids.w2, 'competitors'], 2),
    P('P3', 'Write a one-page brief with three opportunities', 'Readable in two minutes.', ['Every claim links to a finding', 'Brief fits on one page'], [ids.w2], 2),
    autonomyPromise(c, 'P4', ids.w2, { action: 'create_doc', what: 'Share a brief' }),
    stretch(c, 'P5', `Post the Monday brief in ${c.chat.name}`, 'The whole team sees it without logging in.', [`The brief is posted in ${c.chat.name} every Monday`], { integration: c.chat.id, est: [2, 3] }),
  ],
  summary: (c) => `A research desk for ${c.audienceShort}: competitors are checked on the web every week with a source for every fact, compared on features and pricing in one table, and summed up in a one-page brief with opportunities.`,
  decisions: () => [{ q: 'Sources', a: 'Public web only — every fact links to its source' }],
  env: () => [['RESEARCH_DAY', 'monday']],
  reply: { table: 'competitors', title: 'name', sub: 'positioning', money: 'price', status: 'threat', reason: 'positioning', priority: ['High', 'Medium', 'Low'] },
};
RESEARCH.build = stdBuild(RESEARCH);
