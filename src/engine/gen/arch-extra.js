// Profile archetypes: booking, content/marketing, knowledge (policy Q&A), legal (contracts), claims.
import { col, table, people, companies, B, K, P, stretch } from './kit.js';
import { stdBuild, viewBlock, autonomyPromise } from './std.js';
import { SERVICES } from './pools.js';
import { past, slot, dayFrom, usd, pct, trend, weekLabels, countBy, D } from './text.js';

const series = (r, a, b, o) => trend(r, 8, a, b, o).map((value, i) => ({ label: weekLabels(8)[i], value }));
const firstName = (s = '') => String(s).split(' ')[0];

// ---------------------------------------------------------------------------
// Booking & appointments
// ---------------------------------------------------------------------------
const SVC_KIND = { Dental: 'dental', Salon: 'salon', Spa: 'salon', Fitness: 'fitness', Yoga: 'fitness', Pilates: 'fitness', Vet: 'vet', Clinic: 'clinic', Physio: 'clinic' };
const CARE = new Set(['dental', 'clinic', 'vet']);
const CHAN = { sms: 'text message', email: 'email', whatsapp: 'WhatsApp' };

export const BOOKING = {
  id: 'booking', family: 'booking', label: 'Bookings & appointments', category: 'Commerce',
  match: [[/\bbook(?:ing|ings)?\b(?! club)|appointments?|reservations?|\bslots?\b|walk-?ins?/, 3], [/patients?|clinic|salon|dentist|dental|physio|\bvet\b|barber|\bspa\b|no-?shows?/, 1.2]],
  hints: { gcal: 1, twilio: 1 },
  name: (low, q) => (/concierge/.test(low) ? 'Booking Concierge' : q ? `${q} Bookings` : 'Booking Concierge'),
  icon: 'calendar', preset: 'teal', entity: ['appointment', 'appointments'], team: 'front desk', teamSize: '2–6 people',
  sources: ['gcal', 'builtin', 'gsheets'], sourceText: 'Where do you keep appointments today?', sourceWhy: 'Booking Assistant reads and books open slots here.',
  sourceLabels: { gcal: 'Google Calendar', builtin: 'Nowhere yet — use this app', gsheets: 'A spreadsheet' },
  usersRec: 'company', usersLabels: { company: 'Staff + customers booking online' },
  autonomy: { text: 'Should reminders go out automatically?', ask: 'Draft them — I approve each batch', auto: 'Send reminders automatically', decision: 'Reminders', askA: 'Drafted — the front desk approves each batch', autoA: 'Sent automatically 24 h before each visit' },
  domainQ: { id: 'q_channel', text: 'How should reminders reach people?', why: 'Reminder Agent uses this channel the day before each visit.', options: [['sms', 'Text message (SMS)'], ['email', 'Email'], ['whatsapp', 'WhatsApp']], rec: 'sms', decision: 'Reminder channel' },
  pitch: () => 'A booking page with an assistant that answers questions, plus reminders that cut no-shows.',
  sampleQuestion: 'Who’s coming in today?',
  data(c) {
    const { r, now } = c;
    const k = SVC_KIND[c.q] || 'generic', svc = SERVICES[k], care = CARE.has(k);
    const staff = c.team.slice(0, 3);
    const notes = ['First visit', 'Prefers mornings', 'Asked about prices by phone', 'Rescheduled once', 'Regular — every 6 weeks', 'Needs a reminder the day before', 'Referred by a friend', '', 'Ran 10 min late last time', 'Wants the same person as last time', '', 'Paying by card on the day'];
    const rows = people(r, 12).map((p, i) => {
      const s = svc[i % svc.length], off = i < 3 ? -r.int(1, 3) : i < 7 ? 0 : r.int(1, 6);
      const when = slot(r, now, off);
      const status = when < now ? r.weighted([['Completed', 6], ['No-show', 1.5], ['Cancelled', 1]]) : off <= 1 ? r.pick(['Confirmed', 'Reminded', 'Reminded']) : r.pick(['Booked', 'Booked', 'Confirmed']);
      return { client: p.name, phone: `+1 555 01${String(10 + i * 7).slice(-2)}`, service: s[0], when, duration: s[1], price: s[2], staff: staff[i % staff.length], status, channel: r.pick(['Online', 'Online', 'Phone', 'Walk-in']), notes: notes[i] };
    }).sort((a, b) => a.when - b.when);
    const who = care ? 'Patient' : 'Client';
    const main = table('appointments', 'Appointments', 'calendar', [
      col('client', who, 'person'), col('phone', 'Phone', 'text'), col('service', 'Service', 'status', svc.map((s) => s[0])), col('when', 'When', 'datetime'), col('duration', 'Minutes', 'number'),
      col('price', 'Price', 'money'), col('staff', 'With', 'person'), col('status', 'Status', 'status', ['Booked', 'Confirmed', 'Reminded', 'Completed', 'No-show', 'Cancelled']),
      col('channel', 'Booked via', 'status', ['Online', 'Phone', 'Walk-in']), col('notes', 'Notes', 'longtext'),
    ], rows, { connection: c.src?.id, rules: `Staff see every appointment; ${who.toLowerCase()}s only ever see their own.` });
    const second = table('services', 'Services & prices', 'tag', [col('name', 'Service', 'text'), col('duration', 'Minutes', 'number'), col('price', 'Price', 'money'), col('booked', 'Booked this month', 'number'), col('desc', 'Description', 'longtext')],
      svc.map(([name, dur, price]) => ({ name, duration: dur, price, booked: rows.filter((x) => x.service === name).length + r.int(4, 18), desc: `${dur}-minute ${name.toLowerCase()}${price ? ` · ${usd(price)}` : ' · free'}` })), { prefix: 'sv', rules: 'Anyone can see services and prices.' });
    const today = rows.filter((x) => Math.abs(x.when - now) < 12 * 36e5 && new Date(x.when).getDate() === new Date(now).getDate()).length;
    const done = rows.filter((x) => x.when < now), noShow = done.filter((x) => x.status === 'No-show').length;
    return { main, second, rows, svc, care, who, today, left: rows.filter((x) => x.when > now && new Date(x.when).getDate() === new Date(now).getDate()).length, noShow: done.length ? Math.round((noShow / done.length) * 100) : 0, revenue: rows.filter((x) => x.status !== 'Cancelled').reduce((s, x) => s + x.price, 0) };
  },
  workers(c, d) {
    const rem = c.domain === 'email' ? c.mailTool : c.domain === 'whatsapp' ? ['whatsapp', ['send_message']] : ['twilio', ['send_sms']];
    const act = rem[1][rem[1].length - 1], chan = CHAN[c.domain] || 'text message', place = d.care ? 'clinic' : 'studio';
    const soon = d.rows.filter((x) => x.when > c.now);
    return [
      {
        id: 'a_booking', name: 'Booking Assistant', alias: ['book', 'concierge', 'assist'], handles: 'questions about services, prices and open slots',
        role: 'Answers questions about services and prices, and books open slots', goal: 'Every visitor gets a correct answer and a booked slot in under 2 minutes.',
        instructions: `Answer questions about services, prices and opening hours using Services & prices and the FAQ only. Offer the three earliest open slots that fit the service length and book the one the ${d.who.toLowerCase()} picks. ${d.care ? 'Never give medical advice — suggest calling the clinic instead.' : 'Never promise discounts.'} Collect a name and phone number, nothing else.`,
        creativity: 0.3, memory: 'session', knowledge: [['table', 'Services & prices', `${d.svc.length} rows`], ['file', `${c.q || 'Studio'} FAQ.md`, '9 KB']],
        tools: [['gcal', ['list_events', 'create_event']], c.src?.id === 'gsheets' && ['gsheets', ['read_rows', 'append_row']]],
        triggers: [['chat', 'Booking page chat'], ['chat', 'Booking Assistant panel']], outputs: [['answer', 'text'], ['slot', 'datetime'], ['booking', 'record']],
        topics: ['Services', 'Prices', 'Opening hours', 'Booking'], blocked: d.care ? ['Medical advice', 'Diagnoses'] : ['Discounts'],
        runs: [[`Booked ${soon[soon.length - 1]?.client || 'a new visitor'} for ${soon[soon.length - 1]?.service || 'a consultation'}`, 'Services & prices · gcal.list_events → gcal.create_event'], ['Answered a price question', `Services & prices p.1 · ${d.svc[0][0]}`]],
      },
      {
        id: 'a_reminder', name: 'Reminder Agent', alias: ['remind', 'nudge', 'sms'], handles: 'reminders and no-show follow-ups',
        role: c.autonomy === 'auto' ? `Sends a ${chan} reminder 24 h before every visit` : `Drafts ${chan} reminders 24 h before each visit — you approve each batch`,
        goal: 'Cut no-shows by reminding everyone the day before.',
        instructions: `The day before each appointment, send a short, friendly ${chan} with the time, the service and how to reschedule. If someone replies to cancel, mark the appointment Cancelled and free the slot. Never include health or payment details in a message, and never message anyone twice in one day about the same visit.`,
        creativity: 0.3, tools: [rem], risky: [act], triggers: [['schedule', 'Daily at 10:00'], ['event', 'An appointment is booked']], outputs: [['reminders', 'list']],
        runs: [[`Reminded ${Math.max(2, soon.length - 2)} people about their next visit`, `${rem[0]}.${act} ×${Math.max(2, soon.length - 2)}${c.autonomy === 'auto' ? '' : ' (awaiting approval)'}`], [`Freed a cancelled ${place} slot`, 'reply “cancel” → status Cancelled']],
      },
    ];
  },
  layout(c, d, ids) {
    const chan = CHAN[c.domain] || 'text message';
    return {
      screens: [
        {
          key: 'schedule', route: '/schedule', title: 'Schedule', icon: 'calendar', promise: 'P5', subtitle: `Reminders ${c.autonomy === 'auto' ? `go out by ${chan} automatically` : 'wait for your approval'} · ${d.who.toLowerCase()}s book online`,
          actions: [['Block time', 'secondary', 'clock'], ['New appointment', 'primary', 'plus']],
          kpis: { table: 'appointments', promise: 'P5', items: [K('Today', d.today || 1, `${d.left} still to come`, 'flat', 'calendar'), K('Next 7 days', d.rows.filter((x) => x.when > c.now).length, `+${c.r.int(2, 6)} vs last week`, 'up', 'trending-up'), K('No-show rate', pct(d.noShow), 'down from 12%', 'up', 'user'), K('Booked value', usd(d.revenue), 'this week', 'flat', 'coins')] },
          view: { type: 'calendar', table: 'appointments', dateKey: 'when', titleKey: 'client', title: 'This week', promise: 'P5', agent: ids.w1 },
          chat: { agent: ids.lead, promise: 'P2', greeting: 'Hi! I can find appointments, explain prices and draft reminders.', placeholder: 'Ask about bookings…', suggestions: ['Who’s coming in today?', `How much is ${d.svc[1][0].toLowerCase()}?`, 'Draft reminders for tomorrow'] },
          charts: [{ title: 'Bookings by service', table: 'appointments', kind: 'donut', groupBy: 'service', promise: 'P5' }, { title: 'By status', table: 'appointments', kind: 'bar', groupBy: 'status', promise: 'P5' }], activity: ids.w2,
          blocks: [viewBlock('b_schedule_table', { type: 'table', table: 'appointments', title: 'All appointments', span: 12, columns: ['client', 'service', 'when', 'staff', 'status', 'channel'], filters: ['status', 'service'], rowAction: { label: 'Send reminder', agent: ids.w2 }, promise: 'P3' })],
        },
        {
          key: 'reminders', route: '/reminders', title: 'Reminders', icon: 'bell', promise: 'P3', subtitle: c.autonomy === 'auto' ? 'Sent automatically the day before — every message is logged' : 'Drafted the day before — approve a batch in one click',
          actions: [[c.autonomy === 'auto' ? 'Pause reminders' : 'Approve tomorrow’s batch', 'primary', c.autonomy === 'auto' ? 'pause' : 'check']],
          view: { type: 'kanban', table: 'appointments', groupBy: 'status', titleKey: 'client', subtitleKey: 'service', title: 'Upcoming by status', promise: 'P3', agent: ids.w2 },
          chat: { agent: ids.w2, title: 'Reminder Agent', promise: 'P4', greeting: `I remind people by ${chan} the day before.${c.autonomy === 'auto' ? '' : ' Nothing goes out until you approve it.'}`, placeholder: 'e.g. Remind tomorrow’s visitors', suggestions: ['Draft reminders for tomorrow', 'Who didn’t show up this week?', 'Make reminders shorter'] },
        },
      ],
      extra: {
        key: 'book', route: '/book', title: 'Book online', icon: 'globe', promise: 'P1', subtitle: 'Your public booking page — pick a service and a time',
        view: { type: 'cards', table: 'services', titleKey: 'name', subtitleKey: 'desc', metaKeys: ['duration', 'price'], title: 'Services', promise: 'P2' },
        blocks: [
          B.form('b_book_form', d.main, ['client', 'phone', 'service', 'when'], { title: 'Book a slot', span: 4, promise: 'P1', submitLabel: 'Book appointment', successText: 'You’re booked! We’ll remind you the day before.' }),
          B.chat('b_book_chat', ids.w1, { title: 'Questions? Ask us', span: 6, promise: 'P2', greeting: 'Hi! Ask me about services, prices or the next free slot.', placeholder: 'e.g. Do you have anything Saturday morning?', suggestions: [`What does ${d.svc[0][0].toLowerCase()} cost?`, 'What’s the next free slot?'] }),
          B.text('b_book_hours', `**Opening hours**\nMon–Fri 9:00–18:00 · Sat 9:00–13:00\n\nCancel or reschedule free of charge up to 24 hours before your visit.`, { title: 'Good to know', span: 6 }),
        ],
      },
    };
  },
  promises(c, d, ids) {
    const chan = CHAN[c.domain] || 'text message';
    const act = c.domain === 'email' ? c.mail.send : c.domain === 'whatsapp' ? 'send_message' : 'send_sms';
    return [
      P('P1', 'Let people book an open slot online in under a minute', 'A public page shows services and only the times that are really free.', ['A booked slot disappears for everyone else', 'Double-booking is impossible'], ['s_book', 'appointments'], 3),
      P('P2', 'Answer questions about services and prices from your price list', 'Booking Assistant only quotes Services & prices and the FAQ.', ['Every price quoted matches the price list', `It never gives ${d.care ? 'medical advice' : 'discounts'}`], [ids.w1], 1.5),
      P('P3', `Remind everyone by ${chan} the day before`, 'Fewer no-shows without anyone making calls.', ['Every appointment tomorrow gets exactly one reminder', 'Replies of “cancel” free the slot'], [ids.w2, 'appointments'], 2),
      autonomyPromise(c, 'P4', ids.w2, { action: act, what: 'Send reminders' }),
      P('P5', 'Show today’s schedule, bookings and no-shows at a glance', 'One screen for the front desk.', ['Calendar matches the appointments table', 'Loads in under 2 s'], ['s_schedule'], 2.5),
      stretch(c, 'P6', 'Take a deposit for no-show-prone services', 'A small card deposit when someone books a long appointment.', ['A deposit is requested for 60+ minute services'], { integration: 'stripe', est: [4, 5] }),
    ];
  },
  summary: (c, d) => `A booking app for ${c.audienceShort}: ${d.who.toLowerCase()}s pick an open slot online, Booking Assistant answers questions about services and prices, and reminders go out by ${CHAN[c.domain] || 'text message'} the day before${c.autonomy === 'auto' ? ' automatically' : ' once you approve them'}.`,
  decisions: () => [{ q: 'Reminder timing', a: '24 hours before each visit (editable)' }],
  env: () => [['REMINDER_HOURS_BEFORE', 24], ['BOOKING_BUFFER_MIN', 10]],
  reply: { table: 'appointments', title: 'client', sub: 'service', money: 'price', status: 'status', reason: 'notes', dateKey: 'when', schedule: 'appointments', priority: ['Booked', 'Confirmed', 'Reminded', 'No-show', 'Completed', 'Cancelled'] },
};
BOOKING.build = stdBuild(BOOKING);

// ---------------------------------------------------------------------------
// Content & marketing
// ---------------------------------------------------------------------------
const TOPICS = ['Launch: AI summaries are here', '5 ways teams cut reporting time', 'Customer story: how {co} saves 12 hours a week', 'What we learned shipping v3', 'Behind the scenes of our design sprint', 'Product update — what’s new this month', 'The hidden cost of manual follow-ups', 'Getting started in 10 minutes', 'Webinar recap: automating operations', 'Why we rebuilt onboarding from scratch', 'Pricing questions, answered', 'Meet the team: customer success'];
const WORDS = { Blog: [900, 1500], Newsletter: [400, 700], LinkedIn: [120, 220], X: [30, 60] };
const NOTES = ['Too salesy in the intro — soften the CTA', 'Great hook; cut the last paragraph', 'Needs a source for the stat in paragraph 2', 'On voice. Ready for approval.'];

export function postDraft(row = {}) {
  return { subject: row.title, body: `${row.title}\n\n${row.channel === 'X' ? 'Short version: ' : ''}Most teams lose hours every week to work nobody sees. Here’s what changed for us — and what you can try on Monday.\n\n→ Read more on our blog` };
}

export const CONTENT = {
  id: 'content', family: 'marketing', label: 'Content & marketing', category: 'Marketing',
  match: [[/blog posts?|newsletters?|social (?:media )?posts?|linkedin posts?|content (?:calendar|studio|plan|pipeline|team)|copywrit|brand voice|campaigns?/, 3], [/marketing|\bseo\b|articles?|captions?|tweets?|press releases?|social media/, 1.5]],
  hints: { linkedin: 1, twitter: 1 },
  name: (low, q) => (/newsletter/.test(low) && !/blog|linkedin/.test(low) ? 'Newsletter Studio' : q ? `${q} Content` : 'Content Studio'),
  icon: 'megaphone', preset: 'sunset', entity: ['post', 'posts'], team: 'marketing team', teamSize: '2–6 people',
  sources: ['notion', 'gdocs', 'gdrive', 'builtin'], sourceText: 'Where do briefs and drafts live today?', sourceWhy: 'Content Writer reads briefs and saves drafts there.', sourceLabels: { builtin: 'Nowhere yet — keep them in this app' },
  usersRec: 'team',
  autonomy: { text: 'Should approved posts publish automatically?', ask: 'I approve every post before it goes out', auto: 'Publish on schedule after the brand check', decision: 'Publishing', askA: 'A human approves every post', autoA: 'Published on schedule after passing the brand check' },
  domainQ: { id: 'q_channels', text: 'Which channels matter most?', why: 'Content Writer adapts length and format per channel.', options: [['all', 'Blog, LinkedIn and newsletter'], ['social', 'LinkedIn & X'], ['blog', 'Blog & newsletter']], rec: 'all', decision: 'Channels' },
  pitch: () => 'Turns one update into posts for every channel in your brand voice, with approval before publishing.',
  sampleQuestion: 'What’s waiting for review?',
  data(c) {
    const { r, now } = c;
    const chans = c.domain === 'social' ? ['LinkedIn', 'X'] : c.domain === 'blog' ? ['Blog', 'Newsletter'] : ['Blog', 'LinkedIn', 'Newsletter', 'LinkedIn'];
    const order = ['Published', 'Published', 'Published', 'Approved', 'In review', 'In review', 'Drafting', 'Drafting', 'Drafting', 'Idea', 'Idea', 'Idea'];
    const co = companies(r, 1)[0].name, team = c.team;
    const rows = TOPICS.map((t, i) => {
      const status = order[i], channel = chans[i % chans.length], [a, b] = WORDS[channel];
      const brand = status === 'Idea' ? null : status === 'Drafting' ? r.int(55, 78) : r.int(80, 96);
      return { title: t.replace('{co}', co), channel, status, author: team[i % 3], due: status === 'Published' ? dayFrom(now, -r.int(1, 12)) : dayFrom(now, r.int(1, 14)), words: status === 'Idea' ? 0 : r.int(a, b), brand, notes: status === 'In review' ? NOTES[i % 4] : status === 'Approved' ? NOTES[3] : '' };
    });
    const main = table('posts', 'Posts', 'megaphone', [
      col('title', 'Title', 'text'), col('channel', 'Channel', 'status', [...new Set(chans)]), col('status', 'Status', 'status', ['Idea', 'Drafting', 'In review', 'Approved', 'Published']), col('author', 'Owner', 'person'),
      col('due', 'Publish date', 'date'), col('words', 'Words', 'number'), col('brand', 'Brand fit', 'score'), col('notes', 'Editor notes', 'longtext'),
    ], rows, { connection: c.src?.id, rules: 'The marketing team can edit; everyone else can read published posts.' });
    const perf = rows.filter((x) => x.status === 'Published').concat(people(r, 0)).map((x) => x);
    const older = ['Our 2025 year in review', 'How we think about pricing', 'Five automation myths', 'Template: weekly status update', 'Case study: Parcelpoint'];
    const prow = [...perf.map((x) => ({ post: x.title, channel: x.channel, when: x.due })), ...older.map((t, i) => ({ post: t, channel: chans[i % chans.length], when: dayFrom(now, -r.int(14, 60)) }))]
      .map((x) => { const reach = r.int(x.channel === 'X' ? 800 : 1500, x.channel === 'Blog' ? 9000 : 6000); const clicks = Math.round(reach * (0.01 + r() * 0.05)); return { post: x.post, channel: x.channel, reach, clicks, engagement: Math.round((clicks / reach) * 1000) / 10, published: x.when }; });
    const second = table('performance', 'Performance', 'bar-chart', [col('post', 'Post', 'text'), col('channel', 'Channel', 'status', [...new Set(chans)]), col('reach', 'Reach', 'number'), col('clicks', 'Clicks', 'number'), col('engagement', 'Engagement', 'percent'), col('published', 'Published', 'date')], prow, { source: 'sample', prefix: 'pf', rules: 'Read-only; synced nightly.' });
    return { main, second, rows, chans, reach: prow.reduce((s, x) => s + x.reach, 0) };
  },
  workers(c, d) {
    const social = d.chans.some((x) => x === 'LinkedIn' || x === 'X');
    return [
      {
        id: 'a_writer', name: 'Content Writer', alias: ['writ', 'draft', 'content', 'copy'], handles: 'drafting and rewriting posts',
        role: 'Turns one update or brief into a draft for every channel', goal: 'A first draft for every channel within 10 minutes of a brief.',
        instructions: `Turn each brief or product update into ${d.chans.includes('Blog') ? 'a blog post (900–1,500 words), ' : ''}${social ? 'a LinkedIn post (under 200 words), ' : ''}${d.chans.includes('Newsletter') ? 'a newsletter section, ' : ''}written in the brand voice. Lead with the reader’s problem, keep one idea per paragraph and end with one clear call to action. Never invent customer names, numbers or quotes.`,
        creativity: 0.7, memory: 'long-term', knowledge: [['file', 'Brand voice.md', '8 KB'], ['url', 'Last 20 published posts', '20 pages'], ['file', 'Product update notes.md', '5 KB']],
        tools: [c.src && c.src.write.length && [c.src.id, c.src.write], social && ['linkedin', ['share_post']], d.chans.includes('X') && ['twitter', ['post']]], risky: ['share_post', 'post'],
        triggers: [['event', 'A brief is added'], ['chat', 'Content Writer panel']], outputs: [['drafts', 'list'], ['headline', 'text']],
        runs: [[`Drafted “${d.rows[6].title}”`, `Brand voice.md · Product update notes.md${c.src && c.src.write.length ? ` · ${c.src.id}.${c.src.write[0]}` : ''}`], [`Rewrote “${d.rows[4].title}” for LinkedIn`, 'Brand voice.md p.2 · 186 words']],
      },
      {
        id: 'a_editor', name: 'Brand Editor', alias: ['edit', 'brand', 'review'], handles: 'brand checks and feedback',
        role: 'Checks every draft against your brand voice and scores it', goal: 'No post goes out off-voice or with an unsourced claim.',
        instructions: 'Score each draft from 0–100 for brand fit using the voice and style guides. Flag salesy language, jargon, unsourced numbers and anything that sounds like a promise. Give at most three specific edits, quoting the sentence to change.',
        creativity: 0.2, knowledge: [['file', 'Brand voice.md', '8 KB'], ['file', 'Style guide.pdf', '1.1 MB']], tools: [],
        triggers: [['event', 'A draft moves to In review']], outputs: [['brand_score', 'number', '0–100'], ['notes', 'list']],
        runs: [[`Reviewed “${d.rows[5].title}”`, 'Style guide.pdf p.4 · score 81 · 2 edits'], [`Approved “${d.rows[3].title}”`, 'Brand voice.md · score 92']],
      },
    ];
  },
  layout(c, d, ids) {
    const review = d.rows.filter((x) => x.status === 'In review');
    return {
      screens: [
        {
          key: 'content', route: '/content', title: 'Content', icon: 'megaphone', promise: 'P3', subtitle: `From idea to published — ${c.autonomy === 'auto' ? 'approved posts publish on schedule' : 'nothing publishes without your approval'}`,
          actions: [['Import brief', 'secondary', 'upload'], ['New post', 'primary', 'plus']],
          kpis: { table: 'posts', promise: 'P3', items: [K('In review', review.length, 'waiting for you', 'flat', 'eye'), K('Published this month', d.rows.filter((x) => x.status === 'Published').length + c.r.int(3, 8), `+${c.r.int(2, 5)} vs last month`, 'up', 'send'), K('Avg brand fit', Math.round(d.rows.filter((x) => x.brand).reduce((s, x) => s + x.brand, 0) / d.rows.filter((x) => x.brand).length), 'out of 100', 'flat', 'sparkles'), K('Hours saved', `${c.r.int(12, 30)} h`, 'this month', 'up', 'clock')] },
          view: { type: 'kanban', table: 'posts', groupBy: 'status', titleKey: 'title', subtitleKey: 'channel', title: 'Pipeline', promise: 'P3', agent: ids.w1 },
          chat: { agent: ids.lead, promise: 'P1', greeting: 'Paste a product update and I’ll draft it for every channel.', placeholder: 'e.g. Turn our September update into a LinkedIn post', suggestions: ['What’s waiting for review?', `Draft a LinkedIn post about “${d.rows[9].title}”`, 'Summarise this month’s content'] },
          charts: [{ title: 'Posts by channel', table: 'posts', kind: 'donut', groupBy: 'channel', promise: 'P3' }, { title: 'By status', table: 'posts', kind: 'bar', groupBy: 'status', promise: 'P3' }], activity: ids.w1,
        },
        {
          key: 'review', route: '/review', title: 'Review', icon: 'eye', promise: 'P2', subtitle: 'Brand Editor scores every draft and suggests edits',
          actions: [[c.autonomy === 'auto' ? 'Pause publishing' : 'Approve selected', 'primary', c.autonomy === 'auto' ? 'pause' : 'check']],
          view: { type: 'table', table: 'posts', title: 'Drafts', columns: ['title', 'channel', 'brand', 'notes', 'status'], filters: ['status', 'channel'], rowAction: { label: 'Rewrite in brand voice', agent: ids.w1 }, promise: 'P2', agent: ids.w2 },
          chat: { agent: ids.w2, title: 'Brand Editor', promise: 'P2', greeting: 'Share a draft and I’ll score it against your brand voice.', placeholder: 'Paste a draft…', suggestions: [`Why is “${(review[0] || d.rows[4]).title}” not approved yet?`, 'Make it less salesy', 'Check this for jargon'] },
        },
      ],
      insights: {
        promise: 'P5', subtitle: 'Reach and engagement across channels',
        kpis: [K('Reach, 30 days', d.reach.toLocaleString('en-US'), `+${c.r.int(8, 22)}%`, 'up', 'globe'), K('Avg engagement', `${(2 + c.r() * 2).toFixed(1)}%`, `+0.${c.r.int(2, 8)} pts`, 'up', 'activity'), K('Posts shipped', d.rows.filter((x) => x.status === 'Published').length + 9, 'last 30 days', 'flat', 'send'), K('Agent cost', `$${(1 + c.r() * 2).toFixed(2)}`, '$0.06 / post', 'flat', 'coins')],
        trend: { title: 'Reach, last 8 weeks', series: series(c.r, 4200, 9800) },
        text: `**${d.chans[0]} drives the most reach** this month. ${review.length} draft${review.length === 1 ? ' is' : 's are'} waiting for review, and the best performer was “${d.rows[0].title}”.`,
      },
    };
  },
  promises: (c, d, ids) => [
    P('P1', `Turn one update into a draft for every channel`, `One brief becomes ${d.chans.includes('Blog') ? 'a blog post, ' : ''}social posts${d.chans.includes('Newsletter') ? ' and a newsletter section' : ''} in your voice.`, ['Every channel gets a draft within 10 minutes', 'Drafts stay within each channel’s length'], [ids.w1, 'posts'], 3),
    P('P2', 'Check every draft against your brand voice', 'Brand Editor scores drafts and quotes the lines to change.', ['Every draft has a brand score', 'Edits quote the exact sentence'], [ids.w2], 2),
    P('P3', 'Keep every post on one board from idea to published', 'Everyone sees what’s next and who owns it.', ['Board matches the posts table', 'Moving a card updates its status'], ['s_content', 'posts'], 2),
    autonomyPromise(c, 'P4', ids.w1, { action: 'share_post', what: 'Publish a post' }),
    P('P5', 'Show reach and engagement for every channel', 'See what works without opening five tools.', ['Charts match the performance table'], ['s_insights', 'performance'], 1.5),
    stretch(c, 'P6', `Post a Monday content digest in ${c.chat.name}`, 'What’s publishing this week and what needs review.', [`A digest is posted in ${c.chat.name} every Monday at 9am`], { integration: c.chat.id, est: [2, 3] }),
  ],
  summary: (c, d) => `A content studio for ${c.audienceShort}: one product update becomes drafts for ${d.chans.filter((x, i, a) => a.indexOf(x) === i).join(', ')} in your brand voice, Brand Editor checks every draft, and ${c.autonomy === 'auto' ? 'approved posts publish on schedule' : 'nothing is published until you approve it'}.`,
  decisions: () => [{ q: 'Brand fit threshold', a: 'Score of 80 or more to approve (editable)' }],
  env: () => [['BRAND_MIN_SCORE', 80]],
  reply: { table: 'posts', title: 'title', sub: 'channel', metric: 'brand', reason: 'notes', status: 'status', draft: postDraft, priority: ['In review', 'Drafting', 'Approved', 'Idea', 'Published'] },
};
CONTENT.build = stdBuild(CONTENT);

// ---------------------------------------------------------------------------
// Knowledge / policy Q&A
// ---------------------------------------------------------------------------
const QA = [
  ['How many vacation days do I get?', '25 days a year plus public holidays, pro-rated in your first year.', 'Leave & holiday policy.pdf', 2],
  ['Can I expense a home-office chair?', 'Yes — up to $250 once every three years, with a receipt.', 'Expense policy.pdf', 4],
  ['What is the parental leave policy?', '16 weeks fully paid for every parent, after 6 months of service.', 'Parental leave policy.pdf', 1],
  ['Can I work from another country?', 'Up to 30 days a year with your manager’s approval; longer needs HR sign-off.', 'Remote work policy.pdf', 3],
  ['Who do I tell if I lose my laptop?', 'Report it to IT within 24 hours in #it-help so it can be locked remotely.', 'Security & devices policy.pdf', 5],
  ['Is there a learning budget?', '$1,000 a year for courses, books and conferences.', 'Benefits guide.pdf', 6],
  ['When is payday?', 'The last working day of each month.', 'Employee handbook 2026.pdf', 12],
  ['Can I bring my dog to the office?', null, null, null],
  ['Is gym membership reimbursed?', 'Up to $40 a month through the wellbeing allowance.', 'Benefits guide.pdf', 8],
  ['How do I report harassment?', 'Tell your manager or HR, or use the anonymous form — every report is investigated within 5 days.', 'Code of conduct.pdf', 9],
  ['Do we get time off to vote?', null, null, null],
  ['How much notice do I give to resign?', 'Four weeks, or as stated in your contract.', 'Employee handbook 2026.pdf', 21],
];
const DOCS = [['Employee handbook 2026.pdf', 48], ['Leave & holiday policy.pdf', 6], ['Expense policy.pdf', 9], ['Remote work policy.pdf', 5], ['Code of conduct.pdf', 12], ['Benefits guide.pdf', 14], ['Security & devices policy.pdf', 7], ['Parental leave policy.pdf', 4]];

export const KNOWLEDGE = {
  id: 'knowledge', family: 'knowledge', label: 'Knowledge & policy Q&A', category: 'Operations',
  match: [[/polic(?:y|ies)|handbook|knowledge base|internal (?:faq|questions|wiki|docs)|answers? (?:employee |staff |team )?questions|\bsops?\b|standard operating/, 3], [/with citations|from (?:our|the) (?:docs|pdfs|documents|wiki)|q&a|\bfaqs?\b|ask (?:our|the) docs/, 1.5]],
  hints: { confluence: 1, notion: 0.5, gdrive: 0.5 },
  name: (low, q) => (/wiki|docs/.test(low) && !/polic/.test(low) ? 'Ask the Docs' : q ? `${q} Answers` : 'Policy Q&A'),
  icon: 'book-open', preset: 'ink', entity: ['question', 'questions'], team: 'people team', teamSize: 'everyone in the company',
  sources: ['gdrive', 'notion', 'confluence', 'builtin'], sourceText: 'Where do your policies live?', sourceWhy: 'Policy Expert answers only from these documents, with citations.', sourceLabels: { builtin: 'Upload the PDFs here' },
  usersRec: 'company',
  autonomy: { text: 'Should unanswered questions go to HR automatically?', ask: 'Collect them — HR reviews daily', auto: `Post each one to HR right away`, decision: 'Unanswered questions', askA: 'Collected for a daily HR review', autoA: 'Posted to HR as they happen' },
  domainQ: { id: 'q_style', text: 'How should answers be written?', why: 'Policy Expert never guesses — this only changes the style.', options: [['explain', 'Plain words, with citations'], ['strict', 'Quote the document word for word'], ['hr', 'Short answer + who to ask in HR']], rec: 'explain', decision: 'Answer style' },
  pitch: () => 'Answers questions from your documents with citations and logs what it can’t answer.',
  sampleQuestion: 'How many vacation days do I get?',
  data(c) {
    const { r, now } = c;
    const ppl = people(r, 12);
    const rows = QA.map(([q, a, src, page], i) => ({ question: q, asked_by: ppl[i].name, answer: a || 'Not covered by any document — logged for HR.', source: src || '—', page: page || null, confidence: a ? r.int(82, 98) : r.int(12, 35), status: a ? (i === 3 ? 'Needs HR' : 'Answered') : 'Unanswered', asked: past(r, now, 6, 0.5 + i * 0.3) })).sort((a, b) => b.asked - a.asked);
    const main = table('questions', 'Questions', 'message-square', [
      col('question', 'Question', 'text'), col('asked_by', 'Asked by', 'person'), col('answer', 'Answer', 'longtext'), col('source', 'Source', 'text'), col('page', 'Page', 'number'),
      col('confidence', 'Confidence', 'percent'), col('status', 'Status', 'status', ['Answered', 'Needs HR', 'Unanswered']), col('asked', 'Asked', 'datetime'),
    ], rows, { rules: 'Everyone sees their own questions; HR sees all of them.' });
    const second = table('documents', 'Documents', 'file-text', [col('name', 'Document', 'text'), col('pages', 'Pages', 'number'), col('owner', 'Owner', 'person'), col('updated', 'Last updated', 'date'), col('cited', 'Times cited', 'number'), col('status', 'Status', 'status', ['Indexed', 'Needs review'])],
      DOCS.map(([name, pages], i) => ({ name, pages, owner: c.team[i % 3], updated: dayFrom(now, -r.int(10, 240)), cited: rows.filter((x) => x.source === name).length * r.int(6, 14) + r.int(0, 5), status: i === 6 ? 'Needs review' : 'Indexed' })), { connection: c.src?.id, prefix: 'doc', rules: 'HR can add and replace documents.' });
    return { main, second, rows, unanswered: rows.filter((x) => x.status !== 'Answered') };
  },
  workers(c, d) {
    const style = c.domain === 'strict' ? 'Quote the exact sentence from the document' : c.domain === 'hr' ? 'Answer in one or two sentences and name who in HR can help' : 'Explain the answer in plain words';
    return [
      {
        id: 'a_expert', name: 'Policy Expert', alias: ['policy', 'expert', 'answer', 'assist'], handles: 'questions about policies and benefits',
        role: 'Answers questions from your policy documents, always with a citation', goal: 'Every answer is correct, cited and under 80 words.',
        instructions: `Answer employee questions using only the policy documents. ${style}, and always cite the document and page. If the answer isn’t in the documents, say so plainly and log the question for HR — never guess or use outside knowledge.`,
        creativity: 0.1, memory: 'session', knowledge: DOCS.slice(0, 4).map(([n, p]) => ['file', n, `${p} pages`]), tools: [c.src && [c.src.id, c.src.read]],
        triggers: [['chat', 'Ask panel'], ['chat', `${c.chat.name} DM`]], outputs: [['answer', 'text'], ['citations', 'list']], blocked: ['Legal advice', 'Other people’s personal data', 'Salaries'],
        runs: [[`Answered “${d.rows[0].question}”`, `${d.rows[0].source} p.${d.rows[0].page || 1} · confidence ${d.rows[0].confidence}%`], [`Answered “${d.rows[1].question}”`, `${d.rows[1].source} p.${d.rows[1].page || 1}`]],
      },
      {
        id: 'a_gaps', name: 'Gap Logger', alias: ['gap', 'log', 'hr'], handles: 'questions the documents don’t cover',
        role: `Logs questions nobody could answer and tells HR in ${c.chat.name}`, goal: 'HR knows which questions the documents don’t cover yet.',
        instructions: `When Policy Expert can’t answer, add the question to the log with who asked and when. ${c.autonomy === 'auto' ? `Post it to #people-team in ${c.chat.name} straight away.` : 'Prepare a daily digest for HR to review.'} Never share who asked outside HR.`,
        creativity: 0.2, tools: [c.chatTool], risky: [c.chat.action], triggers: [['event', 'A question can’t be answered']], outputs: [['gap', 'record']],
        runs: [[`Logged “${(d.unanswered[0] || d.rows[0]).question}”`, `${c.chat.id}.${c.chat.action}${c.autonomy === 'auto' ? '' : ' (awaiting approval)'}`]],
      },
    ];
  },
  layout(c, d, ids) {
    return {
      screens: [
        {
          key: 'ask', route: '/ask', title: 'Ask', icon: 'message-square', promise: 'P1', subtitle: 'Answers come only from your documents — every one has a citation',
          kpis: { table: 'questions', promise: 'P3', items: [K('Questions this week', d.rows.length + c.r.int(20, 40), `+${c.r.int(5, 15)}%`, 'up', 'message-square'), K('Answered', pct((d.rows.filter((x) => x.status === 'Answered').length / d.rows.length) * 100), 'with a citation', 'flat', 'check-circle'), K('Unanswered', d.unanswered.length, 'logged for HR', 'flat', 'alert-triangle'), K('HR hours saved', `${c.r.int(6, 14)} h`, 'this week', 'up', 'clock')] },
          view: { type: 'table', table: 'questions', title: 'Recent questions', columns: ['question', 'asked_by', 'source', 'confidence', 'status'], filters: ['status'], rowAction: { label: 'Show the answer', agent: ids.w1 }, promise: 'P1', agent: ids.w1 },
          chat: { agent: ids.lead, title: 'Ask a policy question', promise: 'P1', greeting: 'Ask me anything about our policies — I’ll answer with the page it’s on.', placeholder: 'e.g. How many vacation days do I get?', suggestions: [d.rows[2].question, 'Can I expense a home-office chair?', 'What is the parental leave policy?'] },
          charts: [{ title: 'Questions by status', table: 'questions', kind: 'donut', groupBy: 'status', promise: 'P3' }, { title: 'Most cited documents', table: 'questions', kind: 'bar', groupBy: 'source', promise: 'P3' }], activity: ids.w2,
        },
        {
          key: 'documents', route: '/documents', title: 'Documents', icon: 'file-text', promise: 'P2', subtitle: `${DOCS.length} documents indexed${c.src ? ` from ${c.src.name}` : ''} · re-indexed when they change`,
          actions: [['Upload document', 'primary', 'upload']],
          view: { type: 'cards', table: 'documents', title: 'Indexed documents', titleKey: 'name', subtitleKey: 'owner', metaKeys: ['pages', 'updated', 'cited'], badgeKey: 'status', promise: 'P2' },
          blocks: [B.list('b_documents_gaps', { title: 'Couldn’t answer yet', span: 4, promise: 'P3', items: d.unanswered.map((x) => ({ title: x.question, meta: `Asked by ${x.asked_by}`, icon: 'alert-triangle' })) })],
        },
      ],
    };
  },
  promises: (c, d, ids) => [
    P('P1', 'Answer policy questions from your documents, with a citation every time', 'Employees get an answer in seconds with the document and page.', ['Every answer names a document and page', 'Answers match the document text'], [ids.w1, 'questions'], 3),
    P('P2', 'Only ever use your documents — never guess', 'If it isn’t written down, it says so.', ['A question outside the documents gets “I don’t know”', 'No answer uses outside knowledge'], [ids.w1, 'documents'], 2),
    P('P3', 'Log every question it couldn’t answer for HR', 'HR sees exactly which gaps to fill.', ['Unanswered questions appear in the log within 1 minute'], [ids.w2, 'questions'], 1.5),
    autonomyPromise(c, 'P4', ids.w2, { action: c.chat.action, what: `Post to HR in ${c.chat.name}` }),
    stretch(c, 'P5', `Answer questions directly in ${c.chat.name}`, 'Employees DM the assistant without opening the app.', [`A ${c.chat.name} DM gets a cited answer within 10 seconds`], { integration: c.chat.id, est: [3, 4] }),
  ],
  summary: (c) => `A policy assistant for ${c.audienceShort}: questions are answered only from your documents${c.src ? ` in ${c.src.name}` : ''} with the page they came from, and anything it can’t answer is logged for HR.`,
  decisions: () => [{ q: 'When unsure', a: 'Say “I don’t know” and log it — never guess' }],
  env: () => [['MIN_CONFIDENCE', 0.7]],
  reply: { table: 'questions', title: 'question', sub: 'asked_by', metric: 'confidence', reason: 'answer', status: 'status', cite: 'source', page: 'page', priority: ['Unanswered', 'Needs HR', 'Answered'] },
};
KNOWLEDGE.build = stdBuild(KNOWLEDGE);

// ---------------------------------------------------------------------------
// Legal: contract review
// ---------------------------------------------------------------------------
const CTYPES = ['MSA', 'NDA', 'DPA', 'SOW', 'Reseller agreement', 'Lease'];
const CLAUSES = [['§9.2 Limitation of liability', 'High', 'Liability is uncapped for the supplier.', 'Cap liability at 12 months of fees.'], ['§4.1 Auto-renewal', 'Medium', 'Renews for 3 years unless cancelled 90 days before.', 'Change to 1-year renewals with 30 days’ notice.'], ['§11 Indemnity', 'High', 'One-way indemnity in their favour.', 'Make the indemnity mutual.'], ['§7.3 Payment terms', 'Low', 'Net 60 payment terms.', 'Ask for Net 30 — acceptable as is.'], ['§12 Governing law', 'Medium', 'Governed by the laws of another country.', 'Propose our home jurisdiction.'], ['§5.2 Data processing', 'High', 'No breach-notification deadline.', 'Require notice within 72 hours.'], ['§3 Exclusivity', 'Medium', 'Exclusive for 24 months.', 'Remove exclusivity or cut to 6 months.'], ['§14 Termination', 'Low', 'Termination for convenience with 60 days’ notice.', 'Standard — no change needed.']];

export const LEGAL = {
  id: 'legal', family: 'legal', label: 'Contract review', category: 'Legal',
  match: [[/contracts?|clauses?|redlines?|\bndas?\b|agreements?|legal review/, 3], [/lawyers?|legal team|obligations|renewal dates?|playbook|terms and conditions/, 1.2]],
  hints: {},
  name: (low, q) => (/nda/.test(low) && !/contract/.test(low) ? 'NDA Reviewer' : q === 'Legal' ? 'Legal Review' : 'Contract Reviewer'),
  icon: 'file-text', preset: 'editorial', entity: ['contract', 'contracts'], team: 'legal team', teamSize: '2–8 people',
  sources: ['gdrive', 'dropbox', 'gmail', 'builtin'], sourceText: 'Where do contracts arrive today?', sourceWhy: 'Clause Analyst reviews new contracts from here.', sourceLabels: { gmail: 'Emailed to a legal inbox', builtin: 'Uploaded in this app' },
  usersRec: 'team',
  autonomy: { text: 'Should suggested redlines go to the other side automatically?', ask: 'Never — a lawyer approves every redline', auto: 'Send standard redlines for low-risk contracts', decision: 'Redlines', askA: 'A lawyer approves every redline', autoA: 'Standard redlines go out automatically for low-risk contracts' },
  domainQ: { id: 'q_risk', text: 'Which clauses worry you most?', why: 'Clause Analyst checks these first, against your playbook.', options: [['all', 'Everything in our playbook'], ['liability', 'Liability & indemnity'], ['term', 'Auto-renewal & termination']], rec: 'all', decision: 'Risk focus' },
  pitch: () => 'Reviews contracts against your playbook, flags risky clauses and tracks renewal dates.',
  sampleQuestion: 'Which contracts are high risk?',
  data(c) {
    const { r, now } = c;
    const cos = companies(r, 10);
    const cl = r.shuffle(CLAUSES);
    const rows = cos.map((co, i) => {
      const type = CTYPES[i % CTYPES.length], flags = [cl[i % 8], cl[(i + 3) % 8]];
      const risk = flags.some((f) => f[1] === 'High') ? 'High' : flags.some((f) => f[1] === 'Medium') ? 'Medium' : 'Low';
      return { name: `${co.name} — ${type}`, counterparty: co.name, type, value: type === 'NDA' ? 0 : r.money(8000, 240000, 500), risk, renewal: dayFrom(now, r.int(12, 330)), status: r.pick(['In review', 'In review', 'Redlines sent', 'Signed', 'Signed']), flags: flags.map((f) => `${f[0]}: ${f[2]}`).join('\n'), owner: c.team[i % 3], received: past(r, now, 20, 2) };
    }).sort((a, b) => b.received - a.received);
    const main = table('contracts', 'Contracts', 'file-text', [
      col('name', 'Contract', 'text'), col('counterparty', 'Counterparty', 'text'), col('type', 'Type', 'status', CTYPES), col('value', 'Value', 'money'), col('risk', 'Risk', 'status', ['High', 'Medium', 'Low']),
      col('renewal', 'Renews', 'date'), col('status', 'Status', 'status', ['In review', 'Redlines sent', 'Signed']), col('flags', 'Flagged clauses', 'longtext'), col('owner', 'Owner', 'person'), col('received', 'Received', 'datetime'),
    ], rows, { connection: c.src?.id, rules: 'Legal team only. Contracts are never used to train models.' });
    const crow = rows.slice(0, 6).flatMap((x, i) => [cl[i % 8], cl[(i + 3) % 8]].map((f) => ({ contract: x.name, clause: f[0], risk: f[1], issue: f[2], suggestion: f[3] })));
    const second = table('clauses', 'Flagged clauses', 'alert-triangle', [col('contract', 'Contract', 'text'), col('clause', 'Clause', 'text'), col('risk', 'Risk', 'status', ['High', 'Medium', 'Low']), col('issue', 'Issue', 'longtext'), col('suggestion', 'Suggested redline', 'longtext')], crow, { prefix: 'cl', rules: 'Legal team only.' });
    return { main, second, rows, high: rows.filter((x) => x.risk === 'High') };
  },
  workers: (c, d) => [
    {
      id: 'a_clause', name: 'Clause Analyst', alias: ['clause', 'analy', 'risk', 'review'], handles: 'clause risk and redline questions',
      role: 'Checks every clause against your playbook and suggests redlines', goal: 'Every new contract has a risk rating and suggested redlines within 10 minutes.',
      instructions: `Read each contract clause by clause and compare it with the legal playbook${c.domain === 'liability' ? ', starting with liability and indemnity' : c.domain === 'term' ? ', starting with renewal and termination' : ''}. Rate each deviation High, Medium or Low, quote the clause and suggest a redline in plain English. You are not a lawyer: never say a contract is safe to sign.`,
      creativity: 0.1, knowledge: [['file', 'Legal playbook 2026.pdf', '640 KB'], ['file', 'Fallback clauses.docx', '88 KB']], tools: [c.src && c.src.id !== 'gmail' && [c.src.id, c.src.read], c.src?.id === 'gmail' && ['gmail', ['search_email']]],
      triggers: [['event', 'A contract is uploaded']], outputs: [['risk', 'High | Medium | Low'], ['flags', 'list'], ['redlines', 'list']], blocked: ['Legal advice to non-lawyers'],
      runs: [[`Reviewed ${d.rows[0].name}`, `Legal playbook p.${c.r.int(3, 18)} · ${d.rows[0].flags.split('\n').length} clauses flagged`], [`Reviewed ${d.rows[1].name}`, 'Legal playbook p.7 · Fallback clauses']],
    },
    {
      id: 'a_summary', name: 'Summary Writer', alias: ['summar', 'writ', 'obligation'], handles: 'summaries, obligations and renewal reminders',
      role: 'Summarises obligations and key dates, and emails reminders before renewals', goal: 'No contract renews without someone deciding to renew it.',
      instructions: 'Write a one-page summary of each contract: parties, term, fees, obligations on each side and the renewal/notice dates. Email the owner 60 and 30 days before a renewal deadline. Quote clause numbers for every obligation.',
      creativity: 0.3, tools: [c.mailTool], risky: [c.mail.send], triggers: [['schedule', 'Daily at 8:00'], ['event', 'A contract is signed']], outputs: [['summary', 'markdown'], ['dates', 'list']],
      runs: [[`Summarised ${d.rows[2].name}`, '§2 Term · §7 Fees · §14 Termination'], [`Renewal reminder for ${d.rows[3].counterparty}`, `${c.mail.id}.${c.mail.draft || c.mail.send}${c.autonomy === 'auto' ? '' : ' (awaiting approval)'}`]],
    },
  ],
  layout: (c, d, ids) => ({
    screens: [
      {
        key: 'contracts', route: '/contracts', title: 'Contracts', icon: 'file-text', promise: 'P1', subtitle: 'Reviewed against your playbook · highest risk first', actions: [['Upload contract', 'primary', 'upload']],
        kpis: { table: 'contracts', promise: 'P4', items: [K('In review', d.rows.filter((x) => x.status === 'In review').length, 'waiting for legal', 'flat', 'eye'), K('High risk', d.high.length, 'need a lawyer', 'flat', 'alert-triangle'), K('Renewing in 60 days', d.rows.filter((x) => x.renewal - c.now < 60 * D).length, 'reminders scheduled', 'flat', 'calendar'), K('Review time', `${c.r.int(6, 12)} min`, 'was 2 days', 'up', 'clock')] },
        view: { type: 'table', table: 'contracts', title: 'All contracts', columns: ['name', 'type', 'value', 'risk', 'renewal', 'status', 'owner'], filters: ['risk', 'status', 'type'], rowAction: { label: 'Summarise', agent: ids.w2 }, promise: 'P1', agent: ids.w1 },
        chat: { agent: ids.lead, promise: 'P2', greeting: 'Ask me about any contract — I’ll quote the clause.', placeholder: 'Ask about a contract…', suggestions: ['Which contracts are high risk?', `Summarise the ${d.rows[0].counterparty} contract`, 'What renews next month?'] },
        charts: [{ title: 'Contracts by risk', table: 'contracts', kind: 'donut', groupBy: 'risk', promise: 'P4' }, { title: 'By type', table: 'contracts', kind: 'bar', groupBy: 'type', promise: 'P4' }], activity: ids.w1,
      },
      {
        key: 'clauses', route: '/clauses', title: 'Flagged clauses', icon: 'alert-triangle', promise: 'P2', subtitle: c.autonomy === 'auto' ? 'Standard redlines go out for low-risk contracts' : 'Suggested redlines — a lawyer approves each one',
        view: { type: 'table', table: 'clauses', title: 'Clauses to fix', columns: ['contract', 'clause', 'risk', 'suggestion'], filters: ['risk'], rowAction: { label: 'Explain this clause', agent: ids.w1 }, promise: 'P2' },
        chat: { agent: ids.w1, title: 'Clause Analyst', promise: 'P2', greeting: 'Paste a clause and I’ll compare it with your playbook.', placeholder: 'Paste a clause…', suggestions: ['Is uncapped liability ever OK?', 'Suggest a fallback for auto-renewal', 'Which clauses are High risk?'] },
      },
    ],
    insights: {
      promise: 'P4', kpis: [K('Contracts reviewed', d.rows.length + c.r.int(20, 40), 'last 30 days', 'up', 'file-text'), K('Clauses flagged', d.second.rows.length + c.r.int(30, 60), 'against the playbook', 'flat', 'flag'), K('Value under review', usd(d.rows.filter((x) => x.status === 'In review').reduce((s, x) => s + x.value, 0)), 'open', 'flat', 'coins'), K('Lawyer hours saved', `${c.r.int(20, 50)} h`, 'this month', 'up', 'clock')],
      trend: { title: 'Contracts reviewed per week', kind: 'bar', series: series(c.r, 6, 14) },
      text: `**${d.high.length} contract${d.high.length === 1 ? ' is' : 's are'} high risk**, mostly for liability and indemnity. ${d.rows.filter((x) => x.renewal - c.now < 60 * D).length} renew in the next 60 days — reminders are scheduled.`,
    },
  }),
  promises: (c, d, ids) => [
    P('P1', 'Rate every new contract’s risk against your playbook', 'Each contract gets High, Medium or Low with the reasons.', ['Uncapped liability is always High', 'Ratings quote the clause'], [ids.w1, 'contracts'], 3),
    P('P2', 'Suggest a redline for every flagged clause', 'Plain-English fixes based on your fallback clauses.', ['Every flag has a suggestion', 'Suggestions cite the playbook'], [ids.w1, 'clauses'], 2),
    P('P3', 'Summarise obligations and remind owners before renewals', 'No contract renews by accident.', ['Owners are emailed 60 and 30 days before a deadline'], [ids.w2], 2),
    autonomyPromise(c, 'P5', ids.w2, { action: c.mail.send, what: 'Send a redline or reminder' }),
    P('P4', 'Show risk, renewals and workload at a glance', 'One view of every contract.', ['Charts match the contracts table'], ['s_contracts', 's_insights'], 1.5),
    stretch(c, 'P6', 'Send signed contracts for e-signature tracking', 'Know who still has to sign.', ['Signature status updates within 5 minutes'], { integration: 'webhook', est: [3, 4] }),
  ].sort((a, b) => a.id.localeCompare(b.id)),
  summary: (c) => `A contract reviewer for ${c.audienceShort}: every new contract is checked clause by clause against your playbook, risky clauses get a suggested redline${c.autonomy === 'auto' ? '' : ' for a lawyer to approve'}, and owners are reminded before renewals.`,
  decisions: () => [{ q: 'Final say', a: 'A lawyer signs off every contract — the agents only advise' }],
  env: () => [['RENEWAL_REMINDER_DAYS', '60,30']],
  reply: { table: 'contracts', title: 'name', sub: 'counterparty', money: 'value', reason: 'flags', status: 'risk', priority: ['High', 'Medium', 'Low'], draftTable: null },
};
LEGAL.build = stdBuild(LEGAL);

// ---------------------------------------------------------------------------
// Insurance claims
// ---------------------------------------------------------------------------
const CLAIM_TYPES = [['Water damage', 1200, 18000], ['Car accident', 900, 14000], ['Theft', 300, 6000], ['Storm damage', 2000, 26000], ['Medical', 150, 4200], ['Travel cancellation', 250, 3200]];
const FRAUD = ['Claim filed 3 days after the policy started', 'Same bank account as another claimant', 'Receipts look edited', '', '', '', 'Third claim this year', ''];

export const CLAIMS = {
  id: 'claims', family: 'finance', label: 'Insurance claims', category: 'Finance',
  match: [[/insurance claims?|\bclaims?\b(?! (?:that|to be|it))|adjusters?|policyholders?|coverage (?:rules|check)/, 3], [/insurance|fraud|payouts?|underwrit/, 1.5]],
  hints: {},
  name: (low, q) => (q && q !== 'Claims' ? `${q} Claims` : 'Claims Desk'),
  icon: 'shield-check', preset: 'navy', entity: ['claim', 'claims'], team: 'claims team', teamSize: 'adjusters + reviewers',
  sources: ['gmail', 'gdrive', 'builtin'], sourceText: 'How do claims arrive today?', sourceWhy: 'Document Extractor reads new claims from here.', sourceLabels: { gmail: 'Emailed to a claims inbox', gdrive: 'A shared Drive folder', builtin: 'A claim form in this app' },
  usersRec: 'team',
  autonomy: { text: 'Should decision letters go out automatically?', ask: 'Draft only — an adjuster approves each one', auto: 'Send approvals under $1,000 automatically', decision: 'Decision letters', askA: 'An adjuster approves every decision', autoA: 'Small, clean claims are approved automatically' },
  domainQ: { id: 'q_fraud', text: 'How cautious should fraud checks be?', why: 'Fraud Watcher only flags — a person always decides.', options: [['balanced', 'Balanced — flag clear warning signs'], ['strict', 'Strict — flag anything unusual'], ['light', 'Light — only obvious cases']], rec: 'balanced', decision: 'Fraud sensitivity' },
  pitch: () => 'Extracts claim details, checks coverage, flags possible fraud and drafts decision letters.',
  sampleQuestion: 'Which claims need a decision today?',
  data(c) {
    const { r, now } = c;
    const rows = people(r, 12).map((p, i) => {
      const [type, a, b] = CLAIM_TYPES[i % CLAIM_TYPES.length], amount = r.money(a, b, 50), fraud = FRAUD[i % FRAUD.length];
      const covered = !(i % 5 === 4);
      return { claimant: p.name, policy: `POL-${String(48210 + i * 137)}`, type, amount, coverage: covered ? 'Covered' : 'Excluded', fraud: fraud ? r.int(55, 88) : r.int(3, 25), signals: fraud || (covered ? 'Documents complete' : 'Excluded under §6.3 (wear and tear)'), status: fraud ? 'Flagged' : covered ? r.pick(['New', 'Decision drafted', 'Approved', 'Paid']) : 'Decision drafted', filed: past(r, now, 10, 1 + i * 0.5) };
    }).sort((a, b) => b.filed - a.filed);
    const main = table('claims', 'Claims', 'shield-check', [
      col('claimant', 'Claimant', 'person'), col('policy', 'Policy', 'text'), col('type', 'Type', 'status', CLAIM_TYPES.map((t) => t[0])), col('amount', 'Amount', 'money'), col('coverage', 'Coverage', 'status', ['Covered', 'Excluded']),
      col('fraud', 'Fraud risk', 'score'), col('signals', 'Why', 'longtext'), col('status', 'Status', 'status', ['New', 'Flagged', 'Decision drafted', 'Approved', 'Paid']), col('filed', 'Filed', 'datetime'),
    ], rows, { connection: c.src?.id, rules: 'Claims team only. Personal data is masked for reviewers.' });
    const letters = rows.filter((x) => x.status === 'Decision drafted' || x.status === 'Approved').slice(0, 5).map((x) => ({ claim: x.policy, claimant: x.claimant, decision: x.coverage === 'Covered' ? 'Approve' : 'Decline', body: `Dear ${firstName(x.claimant)}, thank you for your ${x.type.toLowerCase()} claim. ${x.coverage === 'Covered' ? `We’ve approved ${usd(x.amount)}; payment follows within 5 working days.` : 'Unfortunately this loss is excluded under section 6.3 of your policy. You can ask for a review within 30 days.'}`, status: x.status === 'Approved' ? 'Sent' : 'Needs approval' }));
    const second = table('letters', 'Decision letters', 'mail', [col('claim', 'Policy', 'text'), col('claimant', 'Claimant', 'person'), col('decision', 'Decision', 'status', ['Approve', 'Decline']), col('body', 'Letter', 'longtext'), col('status', 'Status', 'status', ['Needs approval', 'Sent'])], letters, { connection: c.mail.id, prefix: 'lt', rules: 'Adjusters only.' });
    return { main, second, rows, flagged: rows.filter((x) => x.status === 'Flagged') };
  },
  workers: (c, d) => [
    { id: 'a_extract', name: 'Document Extractor', alias: ['extract', 'document', 'intake'], handles: 'reading claim documents', role: 'Reads claim forms, photos and receipts and fills in the claim', goal: 'Every claim is complete and structured within 5 minutes.', instructions: 'Extract the policy number, loss type, date, amount and supporting documents from each claim. Mark anything missing instead of guessing, and never store card or bank numbers in notes.', creativity: 0.05, tools: [c.src && [c.src.id, c.src.read]], triggers: [['event', 'A claim is submitted']], outputs: [['claim', 'record']], runs: [[`Extracted ${d.rows[0].policy}`, '4 documents · 1 photo · amount matched receipt']] },
    { id: 'a_coverage', name: 'Coverage Checker', alias: ['coverage', 'check', 'policy'], handles: 'coverage and decision letters', role: 'Checks each claim against the policy wording and drafts the decision letter', goal: 'Every decision cites the policy section it relies on.', instructions: 'Compare the claim with the policy wording. Decide Covered or Excluded and cite the section. Draft a clear, kind decision letter. Only an adjuster can approve a decline.', creativity: 0.2, knowledge: [['file', 'Policy wording 2026.pdf', '2.4 MB'], ['file', 'Claims handbook.pdf', '910 KB']], tools: [c.mailTool], risky: [c.mail.send], critical: ['decide_claim'], platform: ['decide_claim'], triggers: [['event', 'A claim is extracted']], outputs: [['coverage', 'Covered | Excluded'], ['letter', 'text']], runs: [[`Checked coverage for ${d.rows[1].policy}`, 'Policy wording §4.2 · Covered'], ['Drafted 2 decision letters', `${c.mail.id}.${c.mail.draft || c.mail.send} (awaiting approval)`]] },
    { id: 'a_fraud', name: 'Fraud Watcher', alias: ['fraud', 'watch', 'risk'], handles: 'fraud risk questions', role: 'Scores fraud risk and explains the warning signs', goal: 'Suspicious claims are spotted before any payout.', instructions: `Score each claim 0–100 for fraud risk using timing, duplicates and document checks${c.domain === 'strict' ? '; flag anything unusual' : c.domain === 'light' ? '; only flag obvious cases' : ''}. Always list the signals. Never accuse the claimant — a person decides.`, creativity: 0.1, knowledge: [['table', 'Past fraud cases', '214 rows']], tools: [], triggers: [['event', 'A claim is extracted']], outputs: [['fraud_score', 'number', '0–100'], ['signals', 'list']], runs: [[`Flagged ${(d.flagged[0] || d.rows[0]).policy}`, `${(d.flagged[0] || d.rows[0]).signals} · score ${(d.flagged[0] || d.rows[0]).fraud}`]] },
  ],
  layout: (c, d, ids) => ({
    screens: [
      { key: 'claims', route: '/claims', title: 'Claims', icon: 'shield-check', promise: 'P1', subtitle: 'Extracted, coverage-checked and fraud-scored automatically', actions: [['New claim', 'primary', 'plus']],
        kpis: { table: 'claims', promise: 'P5', items: [K('Open claims', d.rows.filter((x) => x.status !== 'Paid').length, 'across the team', 'flat', 'shield-check'), K('Flagged', d.flagged.length, 'need a closer look', 'flat', 'alert-triangle'), K('Awaiting approval', d.second.rows.filter((x) => x.status === 'Needs approval').length, 'decision letters', 'flat', 'mail'), K('Avg handling time', `${c.r.int(2, 5)}.${c.r.int(0, 9)} days`, 'was 9 days', 'up', 'clock')] },
        view: { type: 'table', table: 'claims', title: 'All claims', columns: ['claimant', 'policy', 'type', 'amount', 'coverage', 'fraud', 'status'], filters: ['status', 'coverage', 'type'], rowAction: { label: 'Draft decision', agent: ids.w2 }, promise: 'P1', agent: ids.w1 },
        chat: { agent: ids.lead, promise: 'P2', greeting: 'Ask about any claim — I’ll show the policy section and the evidence.', placeholder: 'Ask about claims…', suggestions: ['Which claims need a decision today?', `Why is ${(d.flagged[0] || d.rows[0]).policy} flagged?`, 'Summarise this week'] },
        charts: [{ title: 'Claims by type', table: 'claims', kind: 'donut', groupBy: 'type', promise: 'P5' }, { title: 'By status', table: 'claims', kind: 'bar', groupBy: 'status', promise: 'P5' }], activity: ids.w3 || ids.w1 },
      { key: 'decisions', route: '/decisions', title: 'Decisions', icon: 'mail', promise: 'P4', subtitle: 'Decision letters wait for an adjuster before anything is sent',
        view: { type: 'kanban', table: 'letters', groupBy: 'status', titleKey: 'claimant', subtitleKey: 'decision', title: 'Decision letters', promise: 'P4', agent: ids.w2 },
        chat: { agent: ids.w2, title: 'Coverage Checker', promise: 'P2', greeting: 'Ask me whether something is covered — I’ll cite the policy wording.', suggestions: ['Is storm damage to a fence covered?', 'Make this letter kinder', 'Which section excludes wear and tear?'] } },
      { key: 'fraud', route: '/fraud', title: 'Fraud review', icon: 'alert-triangle', promise: 'P3', subtitle: 'Signals only — a person always decides',
        view: { type: 'cards', table: 'claims', title: 'Highest risk first', titleKey: 'claimant', subtitleKey: 'signals', metaKeys: ['amount', 'fraud'], badgeKey: 'status', promise: 'P3' },
        chat: { agent: ids.w3 || ids.w1, title: 'Fraud Watcher', promise: 'P3', greeting: 'I explain every fraud score — ask me why.', suggestions: [`Why is ${(d.flagged[0] || d.rows[0]).claimant.split(' ')[0]}’s claim risky?`, 'Show duplicate bank accounts'] } },
    ],
  }),
  promises: (c, d, ids) => [
    P('P1', 'Extract every claim’s details from the documents', 'Claims arrive complete and structured.', ['Policy number, amount and date are filled for every claim', 'Missing items are marked, not guessed'], [ids.w1, 'claims'], 2.5),
    P('P2', 'Check coverage and cite the policy section', 'Every decision is explainable.', ['Each decision cites a section of the policy wording'], [ids.w2], 2),
    P('P3', 'Flag possible fraud with the reasons', 'Suspicious claims are spotted before payout.', ['Every flag lists at least one signal', 'Nothing is declined automatically for fraud'], [ids.w3 || ids.w1], 2),
    P('P4', 'Never send a decision without an adjuster’s approval', 'Decisions are always a human call.', ['decide_claim requires approval in every run mode'], [ids.w2, 'letters'], 0.8),
    P('P5', 'Show open claims, flags and handling time at a glance', 'One screen for the whole team.', ['Charts match the claims table'], ['s_claims'], 1.5),
    stretch(c, 'P6', 'Pay approved claims through Stripe', 'Payouts go out without re-typing bank details.', ['An approved claim creates a payout within 1 minute'], { integration: 'stripe', est: [4, 5] }),
  ],
  summary: (c) => `A claims desk for ${c.audienceShort}: every claim is extracted from its documents, checked against the policy wording, scored for fraud with reasons, and gets a decision letter for an adjuster to approve.`,
  decisions: () => [{ q: 'Declines', a: 'Always approved by an adjuster' }],
  env: () => [['AUTO_APPROVE_LIMIT', 1000]],
  reply: { table: 'claims', title: 'claimant', sub: 'policy', money: 'amount', metric: 'fraud', reason: 'signals', status: 'status', priority: ['Flagged', 'New', 'Decision drafted', 'Approved', 'Paid'] },
};
CLAIMS.build = stdBuild(CLAIMS);

export { countBy };
