// Fallback archetype: any prompt → a coherent tracker for the nouns it mentions
// ("a todo app for my book club", "track plant watering", "manage our volunteers").
import { col, table, people, K, P, stretch } from './kit.js';
import { stdBuild, viewBlock, autonomyPromise } from './std.js';
import { nounsFrom, NOUN_KITS, entityWords } from './detect.js';
import { past, dayFrom, pct, trend, weekLabels, titleCase, singular, words, D } from './text.js';

const TODO = /\bto-?dos?\b|\btasks?\b|checklists?|chores?|\bjobs? list/;
const GROUP = /\b(?:for|at|in|with) (?:my|our|the|a) ((?:[a-z]+ ){0,2}(?:club|team|group|class|family|household|house|flat|shop|studio|society|league|choir|band|church|garden|lab|office|school|startup|nonprofit|charity|community|committee|crew|circle))\b/;
const TPL = {
  book: ['Finish reading “{i}”', 'Pick discussion questions for “{i}”', 'Host the “{i}” meetup', 'Vote on next month’s pick', 'Book a room for the next meeting', 'Send out the reading schedule', 'Order copies of “{i}”', 'Collect ratings for “{i}”', 'Sort out the snacks rota', 'Write a recap of “{i}”', 'Invite two new members', 'Update the reading list'],
  recipe: ['Shop for “{i}”', 'Test “{i}” this weekend', 'Photograph “{i}”', 'Plan next week’s menu', 'Write up “{i}”', 'Scale “{i}” for 8 people', 'Swap an ingredient in “{i}”', 'Share “{i}” with the group', 'Clear out the spice drawer', 'Price out “{i}”', 'Rate “{i}”', 'Batch-cook “{i}”'],
  event: ['Confirm the venue for “{i}”', 'Send invites for “{i}”', 'Order catering for “{i}”', 'Share the agenda for “{i}”', 'Book AV for “{i}”', 'Collect RSVPs', 'Print name badges', 'Brief the speakers', 'Send a thank-you note', 'Post photos from “{i}”', 'Survey attendees', 'Settle the invoices'],
  plant: ['Water the {i}', 'Repot the {i}', 'Fertilise the {i}', 'Check the {i} for pests', 'Move the {i} out of direct sun', 'Prune the {i}', 'Mist the {i}', 'Take a cutting of the {i}', 'Order new pots', 'Buy potting mix', 'Rotate the {i}', 'Clean the {i} leaves'],
  generic: ['Review “{i}”', 'Update notes on “{i}”', 'Follow up on “{i}”', 'Plan next steps for “{i}”', 'Share “{i}” with everyone', 'Check the status of “{i}”', 'Tidy up the shared folder', 'Set the agenda for the next meeting', 'Collect feedback from everyone', 'Send the weekly update', 'Archive finished items', 'Book time to review progress'],
};
const STATUS = { book: ['Up next', 'Reading', 'Finished'], recipe: ['Want to try', 'Tested', 'Favourite'], plant: ['Healthy', 'Needs water', 'Needs attention'], event: ['Planning', 'Confirmed', 'Done'], habit: ['On track', 'Slipping', 'Done today'], workout: ['Planned', 'Done', 'Skipped'], trip: ['Planning', 'Booked', 'Done'] };
const PEOPLE_STATUS = ['Active', 'New', 'Inactive'];

/** What the generic app is about, from the prompt alone. */
export function genericTopic(text = '') {
  const low = String(text).toLowerCase();
  const kitKey = words(low).map((w) => singular(w)).find((w) => NOUN_KITS[w]) || null;
  const todo = TODO.test(low);
  const group = (low.match(GROUP) || [])[1] || null;
  const noun = kitKey || nounsFrom(low).find((n) => !['todo', 'to-do', 'task', 'club', 'group', 'team'].includes(n)) || 'item';
  const ew = entityWords(noun);
  // "book club" + books → "Book Club", not "Book Club Books"
  const groupHasNoun = group && words(group).some((w) => singular(w) === singular(noun));
  const name = todo ? `${group ? titleCase(group) + ' ' : ''}To-dos` : group ? (groupHasNoun ? titleCase(group) : `${titleCase(group)} ${ew.Many}`) : `${ew.One} Tracker`;
  return { kitKey, todo, group, noun, ew, name };
}

export const GENERIC = {
  id: 'generic', family: 'generic', label: 'Custom app', category: 'Operations',
  match: [], hints: {},
  name: (low) => genericTopic(low).name,
  icon: 'layers', preset: 'blueprint', entity: ['item', 'items'], team: 'team', teamSize: 'a few people',
  sources: ['builtin', 'gsheets', 'notion', 'airtable'], sourceText: 'Where do you keep this today?', sourceWhy: 'We’ll import what you have so nothing is retyped.', sourceLabels: { builtin: 'Nowhere yet — start fresh here', gsheets: 'A spreadsheet' },
  usersRec: 'team', usersLabels: { team: 'Me and a few others' },
  autonomy: { text: 'Should reminders go out automatically?', ask: 'Show me first — I send them', auto: 'Send reminders automatically', decision: 'Reminders', askA: 'Drafted — you send each reminder', autoA: 'Sent automatically the day before something is due' },
  domainQ: { id: 'q_view', text: 'How do you want to see things?', why: 'This becomes the main screen — you can add the others later.', options: [['board', 'A board by status'], ['list', 'A simple list'], ['calendar', 'A calendar by date']], rec: 'board', decision: 'Main view' },
  pitch: () => 'Keeps everything in one place with owners, due dates and friendly reminders.',
  sampleQuestion: 'What’s due this week?',
  data(c) {
    const { r, now } = c;
    const t = c.topic || genericTopic(c.low);
    const kit = t.kitKey ? NOUN_KITS[t.kitKey] : null;
    const who = people(r, 12);
    const itemW = entityWords(t.todo && !kit ? 'project' : t.noun);
    const items = kit?.people ? who.map((p) => p.name) : kit?.items?.length ? kit.items.slice() : ['Welcome pack', 'Spring newsletter', 'Budget sheet', 'Website refresh', 'Volunteer rota', 'Annual report', 'Photo day', 'Supplier list', 'Kickoff deck', 'Feedback survey', 'Holiday schedule', 'Onboarding guide'];
    const cats = kit?.cats || ['Priority', 'Standard', 'Later', 'Someday'];
    const statuses = STATUS[t.kitKey] || (kit?.people ? PEOPLE_STATUS : ['Active', 'On hold', 'Done']);
    const members = [...c.team.slice(0, 2), ...who.slice(0, 3).map((p) => p.first)];
    const itemRows = items.slice(0, 12).map((name, i) => ({ name, category: cats[i % cats.length], status: statuses[i % 5 === 4 ? 2 : i % 3 === 1 ? 1 : 0], owner: members[i % members.length], date: dayFrom(now, r.int(-20, 20)), rating: t.kitKey === 'book' || t.kitKey === 'recipe' ? r.int(55, 98) : null, notes: i % 4 === 0 ? 'Started by the group last month' : i % 4 === 2 ? 'Needs a decision at the next meetup' : '' }));
    const tpl = TPL[t.kitKey] || TPL.generic;
    const taskRows = tpl.map((x, i) => {
      const it = itemRows[i % itemRows.length].name, due = dayFrom(now, r.int(-4, 12));
      const status = due < now ? r.pick(['Done', 'Done', 'In progress']) : r.pick(['To do', 'To do', 'In progress']);
      return { title: x.replace('{i}', t.kitKey === 'plant' ? it.toLowerCase() : it), owner: members[(i * 3) % members.length], due, status, priority: i % 4 === 0 ? 'High' : i % 3 === 0 ? 'Low' : 'Medium', related: x.includes('{i}') ? it : '—', notes: '' };
    });
    const itemsTable = table(snakeId(itemW.many), itemW.Many, kit?.icon || 'layers', [
      col('name', itemW.One, kit?.people ? 'person' : 'text'), col('category', 'Category', 'status', cats), col('status', 'Status', 'status', statuses), col('owner', 'Owner', 'person'),
      col('date', t.kitKey === 'plant' ? 'Next check' : 'Date', 'date'), ...(itemRows[0].rating != null ? [col('rating', 'Rating', 'score')] : []), col('notes', 'Notes', 'longtext'),
    ], itemRows.map((x) => { if (x.rating == null) delete x.rating; return x; }), { connection: !t.todo ? c.src?.id : null, prefix: 'it', rules: c.users === 'me' ? 'Only you can see this.' : 'Everyone you invite can view and edit.' });
    const tasksTable = table('tasks', 'To-dos', 'check-circle', [
      col('title', 'To-do', 'text'), col('owner', 'Owner', 'person'), col('due', 'Due', 'date'), col('status', 'Status', 'status', ['To do', 'In progress', 'Done']), col('priority', 'Priority', 'status', ['High', 'Medium', 'Low']), col('related', 'About', 'text'), col('notes', 'Notes', 'longtext'),
    ], taskRows, { connection: t.todo ? c.src?.id : null, prefix: 't', rules: 'Anyone can add a to-do; owners tick off their own.' });
    const main = t.todo ? tasksTable : itemsTable, second = t.todo ? itemsTable : tasksTable;
    return { main, second, t, itemW, itemRows, taskRows, members, open: taskRows.filter((x) => x.status !== 'Done'), overdue: taskRows.filter((x) => x.status !== 'Done' && x.due < now) };
  },
  workers(c, d) {
    const rem = c.has('whatsapp') ? ['whatsapp', ['send_message']] : c.has('telegram') ? ['telegram', ['send_message']] : c.has('slack') || c.has('teams') ? c.chatTool : c.mailTool;
    const act = rem[1][rem[1].length - 1], via = rem[0] === c.mail.id ? 'email' : `${rem[0] === 'whatsapp' ? 'WhatsApp' : rem[0] === 'telegram' ? 'Telegram' : c.chat.name}`;
    const e = c.entity;
    return [
      { id: 'a_organizer', name: 'Organizer', alias: ['organi', 'plan', 'assist', 'help'], handles: 'questions, planning and summaries',
        role: `Keeps ${e.many} organised, answers questions and plans what’s next`, goal: `Everyone knows what’s next and who owns it.`,
        instructions: `Help the ${c.topic?.group || 'group'} keep track of ${e.many}. Answer questions using only the ${d.main.name} and ${d.second.name} tables, suggest owners for unassigned to-dos, and write a short weekly summary. Keep answers friendly and under 5 sentences. Never delete anything — suggest it instead.`,
        creativity: 0.4, memory: 'session', tools: [c.src && [c.src.id, [...c.src.read, ...c.src.write.slice(0, 1)]]], knowledge: [['table', d.main.name, `${d.main.rows.length} rows`]],
        triggers: [['chat', `${c.name} panel`], ['schedule', 'Mondays at 9:00']], outputs: [['answer', 'text'], ['summary', 'markdown']],
        runs: [['Wrote the weekly summary', `${d.main.name} · ${d.second.name} → summary`], [`Suggested an owner for “${d.taskRows[4].title}”`, `${d.main.name} · workload check`]] },
      { id: 'a_reminder', name: 'Reminder Agent', alias: ['remind', 'nudge'], handles: 'reminders and nudges',
        role: `Reminds owners by ${via} the day before something is due`, goal: 'Nothing slips because someone forgot.',
        instructions: `The day before a to-do is due, send its owner one short, friendly reminder by ${via} with a link. Remind overdue owners once more after 2 days, then stop. Never remind the same person twice in one day.`,
        creativity: 0.3, tools: [rem], risky: [act], triggers: [['schedule', 'Daily at 9:00']], outputs: [['reminders', 'list']],
        runs: [[`Reminded ${d.open[0]?.owner || d.members[0]} about “${d.open[0]?.title || d.taskRows[0].title}”`, `${rem[0]}.${act}${c.autonomy === 'auto' ? '' : ' (awaiting approval)'}`]] },
    ];
  },
  layout(c, d, ids) {
    const m = d.main, s = d.second, todo = d.t.todo, key = m.id.replace(/_/g, '-');
    const tKey = todo ? 'title' : 'name', dKey = todo ? 'due' : 'date', v = c.domain || 'board';
    const view = v === 'calendar' ? { type: 'calendar', table: m.id, dateKey: dKey, titleKey: tKey, title: 'Calendar' } : v === 'list' ? { type: 'table', table: m.id, title: `All ${m.name.toLowerCase()}`, filters: ['status'], rowAction: { label: 'Ask about this', agent: ids.w1 } } : { type: 'kanban', table: m.id, groupBy: 'status', titleKey: tKey, subtitleKey: 'owner', title: 'Board' };
    const full = v === 'list' ? null : { type: 'table', table: m.id, title: `All ${m.name.toLowerCase()}`, span: 12, filters: ['status'], rowAction: { label: 'Ask about this', agent: ids.w1 } };
    const doneN = d.taskRows.filter((x) => x.status === 'Done').length;
    return {
      screens: [
        { key, route: `/${key}`, title: m.name, icon: m.icon, promise: 'P1', subtitle: todo ? `${d.open.length} open · ${d.overdue.length} overdue · reminders ${c.autonomy === 'auto' ? 'go out automatically' : 'wait for you'}` : `Everything in one place${c.src ? ` · synced with ${c.src.name}` : ''}`,
          actions: [['Import', 'secondary', 'upload'], [`Add ${todo ? 'to-do' : c.entity.one}`, 'primary', 'plus']],
          kpis: { table: m.id, promise: 'P5', items: todo
            ? [K('Open', d.open.length, 'to-dos', 'flat', 'check-circle'), K('Due this week', d.taskRows.filter((x) => x.status !== 'Done' && x.due - c.now < 7 * D && x.due >= c.now).length, 'coming up', 'flat', 'calendar'), K('Overdue', d.overdue.length, 'reminders sent', 'flat', 'alert-triangle'), K('Done', doneN, `+${c.r.int(2, 5)} this week`, 'up', 'trending-up')]
            : [K(`All ${c.entity.many}`, m.rows.length, 'tracked', 'flat', m.icon), K(m.columns[2].options[0], m.rows.filter((x) => x.status === m.columns[2].options[0]).length, 'right now', 'flat', 'check-circle'), K(m.columns[2].options[1], m.rows.filter((x) => x.status === m.columns[2].options[1]).length, 'right now', 'flat', 'clock'), K('Open to-dos', d.open.length, `${d.overdue.length} overdue`, 'flat', 'check-circle')] },
          view: { ...view, promise: 'P1', agent: ids.w1 },
          chat: { agent: ids.lead, promise: 'P2', greeting: `Hi! Ask me anything about your ${c.entity.many} — or tell me what to add.`, placeholder: `Ask about ${c.entity.many}…`, suggestions: [todo ? 'What’s due this week?' : `Which ${c.entity.many} need attention?`, `Who owns “${d.taskRows[1].title}”?`, 'Summarise this week'] },
          charts: [{ title: 'By status', table: m.id, kind: 'donut', groupBy: 'status', promise: 'P5' }, { title: todo ? 'By owner' : 'By category', table: m.id, kind: 'bar', groupBy: todo ? 'owner' : 'category', promise: 'P5' }], activity: ids.w2,
          blocks: full ? [viewBlock(`b_${key}_all`, full)] : [] },
        { key: s.id.replace(/_/g, '-'), route: `/${s.id.replace(/_/g, '-')}`, title: s.name, icon: s.icon, promise: 'P3', subtitle: todo ? `What the ${c.topic?.group || 'group'} is working on` : `To-dos for your ${c.entity.many} — owners get reminded`,
          view: todo ? { type: 'cards', table: s.id, title: s.name, titleKey: 'name', subtitleKey: 'category', metaKeys: ['owner', 'date'], badgeKey: 'status', promise: 'P1' } : { type: 'table', table: s.id, title: 'To-dos', columns: ['title', 'owner', 'due', 'status', 'priority'], filters: ['status', 'priority'], rowAction: { label: 'Send a reminder', agent: ids.w2 }, promise: 'P3', agent: ids.w2 },
          chat: { agent: ids.w2, title: 'Reminder Agent', promise: 'P3', greeting: `I remind owners the day before something is due.${c.autonomy === 'auto' ? '' : ' Nothing is sent until you say so.'}`, suggestions: ['Who’s overdue?', 'Draft reminders for tomorrow', 'Make reminders friendlier'] } },
      ],
      insights: { promise: 'P5', subtitle: 'Progress over time', kpis: [K('Done this month', doneN + c.r.int(6, 14), `+${c.r.int(10, 30)}%`, 'up', 'check-circle'), K('On time', pct(c.r.int(72, 92)), 'last 30 days', 'flat', 'clock'), K('Active people', d.members.length, 'this week', 'flat', 'users'), K('Agent cost', `$${(0.3 + c.r()).toFixed(2)}`, 'this month', 'flat', 'coins')],
        trend: { title: 'Done per week', kind: 'bar', series: trend(c.r, 8, 4, 11).map((value, i) => ({ label: weekLabels(8)[i], value })) },
        text: `**${d.open.length} open to-do${d.open.length === 1 ? '' : 's'}**, ${d.overdue.length} overdue. ${d.members[0]} has the most on their plate; “${d.open[0]?.title || d.taskRows[0].title}” is next up.` },
    };
  },
  promises: (c, d, ids) => [
    P('P1', `Keep every ${d.t.todo ? 'to-do' : c.entity.one} in one place, with an owner and a status`, 'One shared view instead of scattered messages.', ['Adding an item shows up for everyone instantly', 'Every item has an owner and status'], [`s_${d.main.id.replace(/_/g, '-')}`, d.main.id], 3),
    P('P2', 'Answer questions and write a weekly summary', 'Ask in plain words; get an answer from your own data.', ['Answers only use your tables', 'A summary is written every Monday'], [ids.w1], 2),
    P('P3', 'Remind owners the day before something is due', 'Nothing slips because someone forgot.', ['Each due item gets one reminder the day before', 'Overdue items get one follow-up'], [ids.w2, 'tasks'], 2),
    autonomyPromise(c, 'P4', ids.w2, { action: ids.agents.find((a) => a.id === ids.w2)?.tools?.[0]?.actions?.slice(-1)[0] || 'send_email', what: 'Send a reminder' }),
    P('P5', 'Show progress at a glance', 'See what’s done, what’s next and who’s busy.', ['Charts match the tables'], ['s_insights'], 1.5),
    stretch(c, 'P6', `Share a Monday digest in ${c.chat.name}`, 'Everyone sees the week ahead without opening the app.', [`A digest is posted in ${c.chat.name} every Monday`], { integration: c.chat.id, est: [2, 3] }),
  ],
  summary: (c, d) => `${d.t.todo ? `A shared to-do app for ${d.t.group ? `your ${d.t.group}` : c.audienceShort}` : `${/^[aeiou]/i.test(c.entity.one) ? 'An' : 'A'} ${c.entity.one} tracker for ${d.t.group ? `your ${d.t.group}` : c.audienceShort}`}: every ${d.t.todo ? 'to-do' : c.entity.one} has an owner and a status, an Organizer answers questions and writes a weekly summary, and owners are reminded the day before things are due.`,
  decisions: (c, d) => [{ q: 'Main view', a: { board: 'A board by status', list: 'A simple list', calendar: 'A calendar by date' }[c.domain || 'board'] }],
  env: () => [['REMINDER_HOUR', 9]],
  reply: { table: 'tasks', title: 'title', sub: 'owner', status: 'status', reason: 'related', priority: ['High', 'Medium', 'Low'], priorityKey: 'priority' },
};
GENERIC.build = stdBuild(GENERIC);

function snakeId(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'items'; }
