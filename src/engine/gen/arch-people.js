// Archetypes: recruiting (screen → rank → schedule) and onboarding (checklists → answers → nudges).
import { col, table, people, personalEmail, team, runsTable, B, K, screen, P, stretch } from './kit.js';
import { past, slot, dayFrom, D, H, avg, countBy, fmtDay, fmtClock } from './text.js';

const ROLES = [
  [/back[- ]?end|server|platform engineer/, 'Senior Backend Engineer', ['Go', 'PostgreSQL', 'Kubernetes', 'AWS', 'Kafka', 'Python', 'gRPC', 'Redis']],
  [/front[- ]?end|react|web developer/, 'Frontend Engineer', ['React', 'TypeScript', 'Accessibility', 'Next.js', 'CSS', 'Testing', 'Performance']],
  [/full[- ]?stack|software engineer|developer|engineers?\b/, 'Software Engineer', ['TypeScript', 'Python', 'PostgreSQL', 'React', 'AWS', 'Testing', 'System design']],
  [/data scien|machine learning|\bml\b|analyst/, 'Data Scientist', ['Python', 'SQL', 'Statistics', 'Experimentation', 'dbt', 'ML', 'Storytelling']],
  [/designer|ux|ui\b/, 'Product Designer', ['Figma', 'Prototyping', 'User research', 'Design systems', 'Accessibility', 'Interaction design']],
  [/product manager|\bpm\b/, 'Product Manager', ['Discovery', 'Roadmapping', 'Analytics', 'B2B SaaS', 'Stakeholder mgmt', 'Experimentation']],
  [/account executive|sales rep|\bsdr\b|\bae\b|salesperson/, 'Account Executive', ['SaaS sales', 'Salesforce', 'Negotiation', 'Enterprise', 'Discovery', 'Forecasting']],
  [/nurse|nursing/, 'Registered Nurse', ['Patient care', 'ICU', 'EHR', 'BLS/ACLS', 'Triage', 'Pediatrics']],
  [/customer success|\bcsm\b|account manager/, 'Customer Success Manager', ['Onboarding', 'Renewals', 'QBRs', 'Gainsight', 'Upsell', 'SaaS']],
  [/teacher|tutor/, 'Teacher', ['Lesson planning', 'Classroom mgmt', 'Assessment', 'SEN support', 'EdTech', 'Parent comms']],
  [/marketing/, 'Marketing Manager', ['Content', 'SEO', 'Paid social', 'Lifecycle email', 'Analytics', 'Brand']],
];
const HIGHLIGHTS = ['led a payments migration with zero downtime', 'grew a team from 2 to 9', 'shipped a design system used by 40 engineers', 'cut churn 18% in one year', 'closed three $250k+ deals last year', 'published open-source work with 2k stars', 'ran 60+ user interviews for a 0→1 product', 'managed a 30-bed ward', 'built the first data warehouse at a Series B startup', 'mentors two junior colleagues', 'switched careers from finance two years ago', 'freelanced for 4 years across 20 clients'];
const CITIES = ['Berlin', 'Lisbon', 'London', 'Bengaluru', 'Toronto', 'Austin', 'Nairobi', 'Remote (EU)', 'Remote (US)', 'Singapore', 'Amsterdam', 'Mexico City'];

function pickRoles(low) {
  const hits = ROLES.filter(([re]) => re.test(low));
  return (hits.length ? hits : [ROLES[0], ROLES[4], ROLES[6]]).slice(0, 3);
}

export function candidateEmail(row = {}, ctx = {}) {
  const first = String(row.name || 'there').split(' ')[0];
  const when = ctx.when ? `${fmtDay(ctx.when)} at ${fmtClock(ctx.when)}` : 'Thursday at 10:00';
  return { to: row.email, subject: `Interview for ${row.role || 'the role'} — ${when}?`, body: `Hi ${first},\n\nThank you for applying for the ${row.role || 'role'}. We enjoyed reading about your experience${row.reason ? ` (${String(row.reason).split('—').pop().trim()})` : ''} and would love to talk. Does ${when} work for a 45-minute video interview? If not, reply with two times that suit you.\n\nBest regards,\nThe hiring team` };
}

export const RECRUITING = {
  id: 'recruiting', family: 'recruiting', label: 'Recruiting', category: 'HR & Recruiting',
  match: [[/resumes?|\bcvs?\b|candidates?|applicants?|recruit|hiring|job descriptions?|shortlist/, 3], [/interviews?|open roles?|job (?:posts?|openings?)|talent/, 1.5], [/\bhire\b|\bhires\b/, 1]],
  hints: {},
  name: (low, q) => (/screen/.test(low) ? 'Candidate Screener' : q ? `${q} Hiring` : 'Hire Desk'),
  icon: 'users', preset: 'grape', entity: ['candidate', 'candidates'], team: 'hiring team', teamSize: '3–8 people',
  sources: ['gmail', 'gdrive', 'gsheets', 'builtin'], sourceText: 'Where do resumes arrive today?', sourceWhy: 'Resume Screener reads new applications from here.',
  sourceLabels: { gmail: 'A shared inbox (Gmail)', gdrive: 'A Google Drive folder', gsheets: 'A spreadsheet of applicants', builtin: 'An application form in this app' },
  usersRec: 'team',
  autonomy: { text: 'Should interview invites go out automatically?', ask: 'Suggest times — I confirm each invite', auto: 'Book and send invites automatically', decision: 'Interview invites', askA: 'Suggested only — a recruiter confirms every invite', autoA: 'Booked and sent automatically for the shortlist' },
  domainQ: { id: 'q_rank', text: 'How should candidates be ranked?', why: 'This becomes Resume Screener’s rubric. Names, photos and ages are always hidden from it.', options: [['skills', 'Skills match to the job description'], ['experience', 'Experience & seniority'], ['rubric', 'Our own scoring rubric (upload later)']], rec: 'skills', decision: 'Ranking rule' },
  pitch: () => 'Screens resumes against the job description, ranks with reasons and books interviews.',
  sampleQuestion: 'Who should we interview this week?',

  build(c) {
    const { r, now, src } = c;
    const roles = pickRoles(c.low);
    const ppl = people(r, 12);
    const stages = ['Applied', 'Screened', 'Shortlisted', 'Interview', 'Offer', 'Rejected'];
    const hl = r.shuffle(HIGHLIGHTS);
    const cands = ppl.map((p, i) => {
      const [, role, skills] = roles[i % roles.length];
      const years = r.int(1, 12);
      const mine = r.shuffle(skills).slice(0, r.int(2, 5));
      const need = skills.slice(0, 4);
      const match = mine.filter((s) => need.includes(s)).length / 4;
      const expN = Math.min(1, years / 8);
      const w = c.domain === 'experience' ? 0.35 : 0.7;
      const score = Math.max(12, Math.min(96, Math.round(100 * (w * match + (1 - w) * expN) + r.int(-6, 8))));
      const stage = score >= 80 ? r.pick(['Shortlisted', 'Interview', 'Interview', 'Offer']) : score >= 60 ? r.pick(['Screened', 'Shortlisted']) : score >= 40 ? r.pick(['Applied', 'Screened']) : 'Rejected';
      const missing = need.filter((s) => !mine.includes(s));
      return { id: `c${i + 1}`, name: p.name, email: personalEmail(p, r), role, location: r.pick(CITIES), years, skills: mine, score, stage, reason: `${years} yrs · ${mine.slice(0, 3).join(', ')} — ${hl[i % hl.length]}`, gaps: missing.length ? `No evidence of ${missing.slice(0, 2).join(' or ')}` : 'Covers every must-have', source: r.pick(['LinkedIn', 'Referral', 'Careers page', 'Careers page', 'Agency']), applied: past(r, now, 9, 2 + i) };
    }).sort((a, b) => b.score - a.score);

    const inter = cands.filter((x) => ['Shortlisted', 'Interview', 'Offer'].includes(x.stage)).slice(0, 7);
    const types = ['Phone screen', 'Technical', 'Culture', 'Final'];
    const interviews = inter.map((x, i) => ({ id: `iv${i + 1}`, candidate: x.name, role: x.role, interviewer: c.team[i % 4], when: slot(r, now, 1 + Math.floor(i * 0.8)), type: x.stage === 'Offer' ? 'Final' : types[i % 3], status: i < 2 ? 'Confirmed' : c.autonomy === 'auto' ? 'Confirmed' : 'Proposed' }));
    const tables = [
      table('candidates', 'Candidates', 'users', [
        col('name', 'Name', 'person'), col('email', 'Email', 'email'), col('role', 'Role', 'status', roles.map((x) => x[1])), col('location', 'Location', 'text'), col('years', 'Years', 'number'),
        col('skills', 'Skills', 'tags'), col('score', 'Match', 'score'), col('stage', 'Stage', 'status', stages), col('reason', 'Why this score', 'longtext'), col('gaps', 'Gaps', 'text'),
        col('source', 'Source', 'status', ['LinkedIn', 'Referral', 'Careers page', 'Agency']), col('applied', 'Applied', 'datetime'),
      ], cands, { connection: src?.id, rules: 'Only the hiring team can see candidates. Personal details are deleted 6 months after a decision.' }),
      table('interviews', 'Interviews', 'calendar', [
        col('candidate', 'Candidate', 'person'), col('role', 'Role', 'text'), col('interviewer', 'Interviewer', 'person'), col('when', 'When', 'datetime'), col('type', 'Type', 'status', types), col('status', 'Status', 'status', ['Proposed', 'Confirmed', 'Done']),
      ], interviews, { connection: 'gcal', rules: 'Interviewers see their own interviews.' }),
    ];

    const { agents, lead, specs } = team(c, [
      {
        id: 'a_screener', name: 'Resume Screener', alias: ['screen', 'rank', 'resume'], handles: 'ranking and “why this candidate?” questions',
        role: 'Scores every resume against the job description and explains the ranking',
        goal: 'Every application gets a fair, explained score within 10 minutes.',
        instructions: `Compare each resume with the job description for its role. ${c.domain === 'experience' ? 'Weight years and seniority most, then skills.' : c.domain === 'rubric' ? 'Score with the uploaded rubric, one line per criterion.' : 'Weight must-have skills most, then relevant experience.'} Give a 0–100 match score, the three strongest reasons and any gaps. Ignore name, photo, age, gender, address and school prestige. Never reject anyone yourself — recommend, and let a human decide.`,
        creativity: 0.1, knowledge: roles.map(([, role]) => ['file', `${role} — job description.pdf`, `${40 + role.length} KB`]).concat([['file', 'Scoring rubric.md', '5 KB']]),
        tools: [src && [src.id, src.read]], triggers: [['event', 'A new application arrives'], ['schedule', 'Every 15 minutes']],
        outputs: [['score', 'number', '0–100'], ['reasons', 'list'], ['gaps', 'text']], blocked: ['Age', 'Gender', 'Ethnicity', 'Photos'], toxicity: false,
        runs: [[`Screened ${r.int(3, 7)} new applications`, `${src ? src.id + '.' + src.read[0] + ' → ' : ''}rubric → score`], [`Ranked the ${roles[0][1]} shortlist`, 'job description p.1–2 · rubric']],
      },
      {
        id: 'a_scheduler', name: 'Interview Scheduler', alias: ['schedul', 'calendar', 'book'], handles: 'scheduling and candidate emails',
        role: c.autonomy === 'auto' ? 'Books interviews for the shortlist and sends the invites' : 'Finds interview slots for the shortlist and drafts invites you confirm',
        goal: 'Shortlisted candidates get an interview slot within one working day.',
        instructions: 'For each shortlisted candidate, find a 45-minute slot where the interviewer is free within the next 5 working days, avoiding early mornings and Fridays after 3pm. Write a warm, short invite with the time in the candidate’s timezone and a way to reschedule.',
        creativity: 0.4, tools: [['gcal', ['list_events', 'create_event']], c.mailTool], risky: ['create_event', c.mail.send],
        triggers: [['event', 'A candidate is shortlisted'], ['chat', 'Scheduler panel']], outputs: [['slot', 'datetime'], ['invite', 'text']], memory: 'session',
        runs: [[`Proposed a slot for ${interviews[0]?.candidate || 'a candidate'}`, `gcal.list_events → gcal.create_event${c.autonomy === 'auto' ? '' : ' (awaiting approval)'}`], [`Emailed ${interviews[1]?.candidate || 'a candidate'} an invite`, `${c.mail.id}.${c.mail.draft || c.mail.send}`]],
      },
    ], { name: 'Hiring Coordinator', knowledge: [['file', 'Hiring process.md', '7 KB']], topics: ['Open roles', 'Candidates'], blocked: ['Age', 'Gender', 'Ethnicity'] });
    tables.push(runsTable(c, agents, specs));

    const scr = agents.find((a) => a.id.startsWith('a_screener'))?.id || lead;
    const sch = agents.find((a) => a.id.startsWith('a_scheduler'))?.id || lead;
    const short = cands.filter((x) => ['Shortlisted', 'Interview', 'Offer'].includes(x.stage));
    const screens = [
      screen('s_candidates', '/candidates', 'Candidates', 'users', [
        B.header('b_cand_header', '/candidates', 'Candidates', `Ranked by Resume Screener · ${roles.map((x) => x[1]).join(', ')}`, [['Upload resumes', 'secondary', 'upload'], ['Add role', 'primary', 'plus']], { promise: 'P1' }),
        B.kpis('b_cand_kpis', [K('New applications', cands.filter((x) => now - x.applied < 3 * D).length, 'last 3 days', 'up', 'user-plus'), K('Shortlisted', short.length, 'match ≥ 80', 'flat', 'star'), K('Average match', Math.round(avg(cands.map((x) => x.score))), `across ${roles.length} role${roles.length > 1 ? 's' : ''}`, 'flat', 'gauge'), K('Time to shortlist', `${r.int(1, 3)} days`, `−${r.int(3, 9)} days`, 'up', 'clock')], { table: 'candidates', promise: 'P5', file: 'components/CandidateKpis.tsx' }),
        B.table('b_cand_table', 'candidates', { title: 'Ranked candidates', file: 'components/CandidateTable.tsx', promise: 'P1', agent: scr, columns: ['name', 'role', 'score', 'stage', 'years', 'location', 'source'], filters: ['role', 'stage'], rowAction: { label: 'Invite to interview', agent: sch } }),
        B.chat('b_cand_chat', lead, { title: `Ask ${c.name}`, file: 'components/AskHiring.tsx', promise: 'P2', greeting: 'Ask me who to interview, why someone ranked where they did, or to schedule a slot.', placeholder: 'Ask about candidates…', suggestions: ['Who should we interview this week?', `Why is ${cands[0].name} ranked first?`, `Compare the top 3 for ${roles[0][1]}`] }),
        B.chart('b_cand_stage', { title: 'Candidates by stage', table: 'candidates', kind: 'bar', groupBy: 'stage', promise: 'P5', file: 'components/StageChart.tsx' }),
        B.chart('b_cand_source', { title: 'Where candidates come from', table: 'candidates', kind: 'donut', groupBy: 'source', promise: 'P5', file: 'components/SourceChart.tsx' }),
        B.activity('b_cand_activity', scr, { file: 'components/AgentActivity.tsx' }),
      ]),
      screen('s_pipeline', '/pipeline', 'Pipeline', 'columns', [
        B.header('b_pipe_header', '/pipeline', 'Pipeline', 'Drag candidates between stages · the screener never rejects anyone on its own'),
        B.kanban('b_pipe_board', 'candidates', { title: 'Hiring pipeline', file: 'components/PipelineBoard.tsx', promise: 'P2', agent: scr, groupBy: 'stage', titleKey: 'name', subtitleKey: 'role' }),
      ]),
      screen('s_interviews', '/interviews', 'Interviews', 'calendar', [
        B.header('b_int_header', '/interviews', 'Interviews', c.autonomy === 'auto' ? 'Booked automatically for the shortlist' : 'Proposed slots wait for a recruiter to confirm', [['Confirm proposed', 'primary', 'check']], { promise: 'P3' }),
        B.calendar('b_int_calendar', 'interviews', { title: 'Next two weeks', span: 8, file: 'components/InterviewCalendar.tsx', promise: 'P3', dateKey: 'when', titleKey: 'candidate' }),
        B.chat('b_int_chat', sch, { title: 'Interview Scheduler', file: 'components/SchedulerChat.tsx', promise: 'P4', greeting: 'Tell me who to schedule and with whom — I’ll find a slot that works for everyone.', placeholder: `e.g. Book ${short[0]?.name.split(' ')[0] || 'Priya'} with ${c.team[0]} next week`, suggestions: [`Schedule ${short[0]?.name || cands[0].name}`, 'Who hasn’t been scheduled yet?', 'Move Friday interviews to Monday'] }),
        B.table('b_int_table', 'interviews', { title: 'Upcoming interviews', columns: ['candidate', 'role', 'interviewer', 'when', 'type', 'status'], filters: ['status'], searchable: false, file: 'components/InterviewTable.tsx' }),
      ]),
    ];

    const promises = [
      P('P1', 'Score every resume against the job description', 'Each application gets a 0–100 match within 10 minutes.', ['A resume covering all must-haves scores 80+', 'An unrelated resume scores under 40', 'Every candidate has a score'], [scr, 'candidates'], 3),
      P('P2', 'Explain every ranking — and keep it fair', 'Three reasons and the gaps, with names, photos and ages hidden from the screener.', ['Every score lists reasons and gaps', 'Changing a name does not change the score'], [scr], 2),
      P('P3', 'Schedule interviews on Google Calendar for the shortlist', 'Slots respect interviewers’ calendars and working hours.', ['No slot overlaps an existing event', 'Slots are within 5 working days'], [sch, 'interviews'], 2.5),
      c.autonomy === 'auto'
        ? P('P4', 'Send invites automatically and log every one', 'Shortlisted candidates hear back the same day.', ['Every invite appears in Agent runs'], [sch], 1)
        : P('P4', 'Never contact a candidate without a recruiter’s OK', 'Invites and calendar holds wait for approval.', ['create_event and email sends require approval'], [sch], 0.8),
      P('P5', 'Show the hiring pipeline at a glance', 'Stages, sources and time-to-shortlist in one place.', ['Pipeline loads in under 2 s', 'Counts match the candidates table'], ['s_candidates', 's_pipeline'], 3),
    ];
    promises.push(stretch(c, 'P6', `Post a daily hiring digest in ${c.chat.name}`, 'New applications, shortlist changes and today’s interviews at 9am.', [`A digest is posted in ${c.chat.name} every weekday at 9am`], { integration: c.chat.id, est: [3, 4] }));

    return {
      tables, agents, lead, screens, promises,
      summary: `A hiring desk for ${c.audienceShort}: every resume is scored against the job description with visible reasons (names, photos and ages hidden), the shortlist is ranked for you, and interviews are ${c.autonomy === 'auto' ? 'booked automatically' : 'proposed on Google Calendar for you to confirm'}.`,
      description: 'Screens resumes against the job description, ranks candidates with reasons and schedules interviews.',
      decisions: [{ q: 'Open roles', a: roles.map((x) => x[1]).join(', ') }, { q: 'Fairness', a: 'Name, photo, age and address hidden from scoring' }],
      env: [['SHORTLIST_THRESHOLD', 80]],
    };
  },
  reply: { table: 'candidates', title: 'name', sub: 'role', metric: 'score', reason: 'reason', status: 'stage', draft: candidateEmail, draftTable: null, schedule: 'interviews' },
};

// ---------------------------------------------------------------------------
const TASKS = [
  ['Laptop & accounts ready', 'IT setup', 'IT', -3], ['Sign contract & tax forms', 'HR paperwork', 'HR', -1], ['Security & privacy training', 'Training', 'New hire', 3],
  ['Meet your buddy', 'Meet the team', 'Buddy', 1], ['1:1 with manager — 30-day goals', 'Meet the team', 'Manager', 2], ['Product walkthrough', 'Training', 'New hire', 5],
  ['Shadow three customer calls', 'First project', 'New hire', 10], ['Set up payroll & benefits', 'HR paperwork', 'HR', 4], ['First small project shipped', 'First project', 'New hire', 21],
  ['30-day check-in', 'Meet the team', 'Manager', 30], ['Join team rituals (stand-up, retro)', 'Meet the team', 'New hire', 2], ['Read the handbook', 'Training', 'New hire', 3],
];
const TEAMS = [['Engineering', 'Software Engineer'], ['Sales', 'Account Executive'], ['Design', 'Product Designer'], ['Customer Success', 'CS Manager'], ['Finance', 'Financial Analyst'], ['Marketing', 'Content Marketer']];

export const ONBOARDING = {
  id: 'onboarding', family: 'recruiting', label: 'Employee onboarding', category: 'HR & Recruiting',
  match: [[/onboard(?:ing)? (?:new )?(?:hires?|employees?|staff|starters?)|new (?:hires?|joiners?|starters?|employees?)|first (?:30|60|90) days/, 4], [/onboarding|handbook|checklists? per role|buddy/, 1.5]],
  hints: {},
  name: (low) => (/buddy/.test(low) ? 'Onboarding Buddy' : 'First 30'),
  icon: 'user-plus', preset: 'forest', entity: ['new hire', 'new hires'], team: 'people team', teamSize: 'HR + managers',
  sources: ['notion', 'gdrive', 'confluence', 'builtin'], sourceText: 'Where does your employee handbook live?', sourceWhy: 'Onboarding Guide answers questions from it, with citations.',
  sourceLabels: { builtin: 'Upload the PDF here' },
  usersRec: 'company',
  autonomy: { text: 'Should overdue-task nudges go to managers automatically?', ask: 'Show me first — I send them', auto: 'Nudge automatically', decision: 'Manager nudges', askA: 'Drafted — HR approves each nudge', autoA: 'Sent automatically when a task is 2 days overdue' },
  domainQ: { id: 'q_plan', text: 'How should checklists work?', why: 'We’ll create the first checklists from your handbook.', options: [['role', 'A checklist per role'], ['same', 'One checklist for everyone'], ['team', 'Per team, set by each manager']], rec: 'role', decision: 'Checklists' },
  pitch: () => 'Guides new hires through their first 30 days with checklists, answers and nudges.',
  sampleQuestion: 'Who is behind on onboarding?',

  build(c) {
    const { r, now, src } = c;
    const ppl = people(r, 8);
    const hires = ppl.map((p, i) => {
      const [tm, role] = TEAMS[i % TEAMS.length];
      const day = i === 7 ? -3 : r.int(2, 29);
      const expected = Math.min(100, Math.round((day / 30) * 100));
      const progress = day < 0 ? 0 : Math.max(5, Math.min(100, expected + r.int(-35, 15)));
      const status = day < 0 ? 'Not started' : progress >= 100 ? 'Done' : progress < expected - 15 ? 'Behind' : 'On track';
      return { id: `h${i + 1}`, name: p.name, email: `${p.first.toLowerCase()}@company.com`, role, team: tm, manager: c.team[i % 4], start: dayFrom(now, -day), day: Math.max(0, day), progress, status, buddy: c.team[(i + 2) % 6] };
    });
    const tasks = [];
    hires.slice(0, 4).forEach((h, hi) => r.shuffle(TASKS).slice(0, 3 + (hi % 2)).forEach(([task, cat, owner, dueDay]) => {
      const due = h.start + dueDay * D;
      const st = due < now - 2 * D ? r.pick(['Done', 'Done', 'Overdue']) : due < now ? r.pick(['Done', 'In progress', 'Overdue']) : r.pick(['To do', 'To do', 'In progress']);
      tasks.push({ hire: h.name, task, category: cat, owner: owner === 'Manager' ? h.manager : owner === 'Buddy' ? h.buddy : owner, due, status: st });
    }));
    const tables = [
      table('hires', 'New hires', 'user-plus', [
        col('name', 'Name', 'person'), col('email', 'Email', 'email'), col('role', 'Role', 'text'), col('team', 'Team', 'status', TEAMS.map((t) => t[0])), col('manager', 'Manager', 'person'),
        col('start', 'Start date', 'date'), col('day', 'Day', 'number'), col('progress', 'Progress', 'percent'), col('status', 'Status', 'status', ['Not started', 'On track', 'Behind', 'Done']), col('buddy', 'Buddy', 'person'),
      ], hires, { rules: 'New hires see their own checklist; managers see their team; HR sees everyone.' }),
      table('tasks', 'Onboarding tasks', 'list-checks', [
        col('hire', 'New hire', 'person'), col('task', 'Task', 'text'), col('category', 'Category', 'status', ['IT setup', 'HR paperwork', 'Training', 'Meet the team', 'First project']), col('owner', 'Owner', 'person'),
        col('due', 'Due', 'date'), col('status', 'Status', 'status', ['To do', 'In progress', 'Overdue', 'Done']),
      ], tasks, { connection: src?.id === 'notion' ? 'notion' : null, prefix: 'tk', rules: 'Task owners can tick off their own tasks.' }),
    ];
    const hb = src?.id === 'notion' ? ['url', 'Notion: Employee handbook', '48 pages'] : src?.id === 'confluence' ? ['url', 'Confluence: People space', '36 pages'] : ['file', 'Employee handbook.pdf', '1.2 MB'];
    const overdue = tasks.filter((t) => t.status === 'Overdue');
    const { agents, lead, specs } = team(c, [
      {
        id: 'a_guide', name: 'Onboarding Guide', alias: ['guide', 'answer', 'handbook'], handles: 'handbook questions and “what’s next for me?”',
        role: 'Answers new hires’ questions from the handbook and tells them what’s next',
        goal: 'New hires get a correct, cited answer in seconds instead of waiting for HR.',
        instructions: `Answer questions using only the employee handbook and the ${c.domain === 'same' ? 'shared' : 'role-specific'} 30-day plan. Cite the page or section for every answer. Be friendly and concise. If the handbook does not cover it, say so and offer to pass the question to HR. Never discuss other employees’ salaries or personal data.`,
        creativity: 0.3, memory: 'long-term', knowledge: [hb, ['file', '30-day plans by role.md', '12 KB']], tools: [src && src.id !== 'builtin' && [src.id, src.read]],
        triggers: [['chat', 'Ask HR panel'], ['chat', `${c.chat.name} DM`]], outputs: [['answer', 'text'], ['citations', 'list']], blocked: ['Salaries of others', 'Medical information'],
        runs: [[`Answered “How do I book time off?”`, `${hb[1]} §4.2 · cited`], ['Answered “Who approves my expenses?”', `${hb[1]} §6.1`]],
      },
      {
        id: 'a_nudge', name: 'Nudge Agent', alias: ['nudge', 'remind', 'overdue'], handles: 'overdue tasks and reminders',
        role: `Notices overdue onboarding tasks and nudges the owner in ${c.chat.name}`,
        goal: 'No onboarding task stays overdue for more than 2 days.',
        instructions: `Every morning, find tasks that are overdue or due today. Send the owner one short, friendly ${c.chat.name} message per task with the new hire’s name and a direct link. Never nudge the same person twice in one day, and never nudge the new hire about tasks owned by someone else.`,
        creativity: 0.3, tools: [c.chatTool], risky: [c.chat.action], triggers: [['schedule', 'Weekdays at 9:00']], outputs: [['nudges', 'list']],
        runs: [[`Nudged ${overdue[0]?.owner || c.team[0]} about “${overdue[0]?.task || 'Laptop & accounts ready'}”`, `${c.chat.id}.${c.chat.action}${c.autonomy === 'auto' ? '' : ' (awaiting approval)'}`]],
      },
    ], { name: `${c.name} Manager`, knowledge: [hb] });
    tables.push(runsTable(c, agents, specs));

    const guide = agents.find((a) => a.id.startsWith('a_guide'))?.id || lead;
    const nudge = agents.find((a) => a.id.startsWith('a_nudge'))?.id || lead;
    const behind = hires.filter((h) => h.status === 'Behind');
    const screens = [
      screen('s_hires', '/hires', 'New hires', 'user-plus', [
        B.header('b_hires_header', '/hires', 'New hires', 'Everyone in their first 30 days', [['Add new hire', 'primary', 'plus']], { promise: 'P4' }),
        B.kpis('b_hires_kpis', [K('In onboarding', hires.filter((h) => h.status !== 'Done').length, `${hires.filter((h) => h.status === 'Not started').length} starting soon`, 'flat', 'users'), K('On track', `${Math.round((hires.filter((h) => h.status === 'On track' || h.status === 'Done').length / hires.length) * 100)}%`, `${behind.length} behind`, behind.length > 2 ? 'down' : 'up', 'check-circle'), K('Overdue tasks', overdue.length, 'nudged daily', overdue.length ? 'down' : 'flat', 'alert-triangle'), K('Questions answered', r.int(40, 120), 'this month', 'up', 'message-square')], { table: 'hires', promise: 'P4', file: 'components/HireKpis.tsx' }),
        B.table('b_hires_table', 'hires', { title: 'Progress by person', file: 'components/HireTable.tsx', promise: 'P1', columns: ['name', 'role', 'team', 'day', 'progress', 'status', 'manager'], filters: ['team', 'status'], rowAction: { label: 'Nudge manager', agent: nudge } }),
        B.chat('b_hires_chat', lead, { title: `Ask ${c.name}`, file: 'components/AskOnboarding.tsx', greeting: 'Ask who’s behind, what’s overdue or what a new hire should do next.', placeholder: 'Ask about onboarding…', suggestions: ['Who is behind on onboarding?', `What’s next for ${hires[0].name.split(' ')[0]}?`, 'Which tasks are overdue?'] }),
        B.chart('b_hires_status', { title: 'Onboarding status', table: 'hires', kind: 'donut', groupBy: 'status', file: 'components/StatusChart.tsx', promise: 'P4' }),
        B.chart('b_hires_team', { title: 'New hires by team', table: 'hires', kind: 'bar', groupBy: 'team', file: 'components/TeamChart.tsx' }),
        B.activity('b_hires_activity', nudge, { file: 'components/AgentActivity.tsx', promise: 'P3' }),
      ]),
      screen('s_checklist', '/checklist', 'Checklist', 'list-checks', [
        B.header('b_check_header', '/checklist', 'Checklist', c.domain === 'same' ? 'One shared 30-day checklist' : 'Tasks from each role’s 30-day plan'),
        B.kanban('b_check_board', 'tasks', { title: 'Onboarding tasks', span: 8, file: 'components/TaskBoard.tsx', promise: 'P1', groupBy: 'status', titleKey: 'task', subtitleKey: 'hire' }),
        B.list('b_check_due', { title: 'Due this week', span: 4, table: 'tasks', titleKey: 'task', metaKey: 'owner', file: 'components/DueList.tsx' }),
      ]),
      screen('s_ask', '/ask', 'Ask HR', 'message-square', [
        B.header('b_ask_header', '/ask', 'Ask HR', 'Answers from the handbook, with the page it came from'),
        B.chat('b_ask_chat', guide, { title: 'Onboarding Guide', span: 8, file: 'components/GuideChat.tsx', promise: 'P2', greeting: `Welcome! I know the handbook inside out. Ask me anything about your first 30 days.`, placeholder: 'e.g. How do I book time off?', suggestions: ['How do I book time off?', 'What should I do in week one?', 'Who approves my expenses?'] }),
        B.list('b_ask_popular', { title: 'Popular questions', span: 4, file: 'components/PopularQuestions.tsx', items: [{ title: 'How do I book time off?', meta: `${hb[1]} §4.2`, icon: 'calendar' }, { title: 'When is payday?', meta: `${hb[1]} §3.1`, icon: 'coins' }, { title: 'Can I work remotely?', meta: `${hb[1]} §2.4`, icon: 'home' }, { title: 'How do expenses work?', meta: `${hb[1]} §6.1`, icon: 'receipt' }] }),
      ]),
    ];
    const promises = [
      P('P1', `Give every new hire a 30-day checklist${c.domain === 'same' ? '' : ' for their role'}`, 'Tasks, owners and due dates appear the moment someone is added.', ['Adding a new hire creates their tasks', 'Each task has an owner and a due date'], ['tasks', 's_checklist'], 2.5),
      P('P2', 'Answer handbook questions with citations', 'New hires get an answer with the section it came from.', ['Every answer cites a section', 'Unknown questions are passed to HR'], [guide], 2.5),
      P('P3', `Nudge owners in ${c.chat.name} when a task is overdue`, c.autonomy === 'auto' ? 'Owners get one friendly nudge a day until it’s done.' : 'Nudges are drafted for HR to send.', ['An overdue task creates one nudge per day at most'], [nudge], 1.5),
      P('P4', 'Show HR who is on track and who is behind', 'One screen for every new hire’s progress.', ['Progress matches completed tasks', 'Behind = 15+ points below expected'], ['s_hires', 'hires'], 2.5),
    ];
    promises.push(stretch(c, 'P5', 'Send a welcome email the day before someone starts', 'First-day logistics, their buddy and what to bring.', ['A welcome email is drafted 1 day before the start date'], { integration: c.mail.id, est: [2, 3] }));
    return {
      tables, agents, lead, screens, promises,
      summary: `An onboarding buddy for ${c.audienceShort}: every new hire gets a ${c.domain === 'same' ? 'shared' : 'role-specific'} 30-day checklist, answers from the handbook with citations, and owners are nudged in ${c.chat.name} when tasks slip.`,
      description: 'Guides new hires through their first 30 days with checklists, cited answers and nudges.',
      decisions: [{ q: 'Handbook source', a: hb[1] }],
      env: [['OVERDUE_GRACE_DAYS', 2]],
    };
  },
  reply: { table: 'hires', title: 'name', sub: 'role', metric: 'progress', status: 'status', priority: ['Behind', 'Not started', 'On track', 'Done'] },
};
