// Prompt understanding: which tools are mentioned, which business, which nouns.
import { integrationById } from '../catalog.js';
import { singular, plural, titleCase, words } from './text.js';

/** [integration id, pattern] — synonyms and common phrasings. Order is irrelevant; mention position wins. */
const SYNONYMS = [
  ['hubspot', /hub\s?spot/],
  ['greenhouse', /greenhouse/],
  ['lever', /\blever\b(?! arch)/],
  ['workday', /workday/],
  ['bamboohr', /bamboo\s?hr/],
  ['salesforce', /sales\s?force|\bsfdc\b/],
  ['gmail', /\bgmail\b|google mail|g-mail/],
  ['outlook', /\boutlook\b|office\s?365|microsoft 365|\bo365\b|exchange mail/],
  ['slack', /\bslack\b/],
  ['teams', /microsoft teams|\bms teams\b|\bin teams\b|teams channel|teams chat/],
  ['telegram', /telegram/],
  ['whatsapp', /whats\s?app/],
  ['twilio', /twilio|\bsms\b|text messages?|texts? (?:them|patients|customers|clients|members|parents)|\btexting\b/],
  ['twitter', /twitter|\btweets?\b|\bx\.com\b/],
  ['linkedin', /linked\s?in/],
  ['instantly', /instantly\.ai|\binstantly\b(?= (?:campaign|sequence))/],
  ['gcal', /google calendar|\bgcal\b|\bcalendar\b|calendly/],
  ['gdrive', /google drive|\bgdrive\b|\bdrive folder|shared drive|\bpdfs?\b(?= (?:in|on|from) (?:a |our |the )?drive)/],
  ['gdocs', /google docs?|\bgdocs\b|\bgoogle doc\b/],
  ['gsheets', /google sheets?|\bgsheets?\b|spreadsheets?|\bsheets?\b(?! of paper)/],
  ['excel', /\bexcel\b|\bxlsx\b/],
  ['notion', /\bnotion\b/],
  ['confluence', /confluence/],
  ['dropbox', /dropbox/],
  ['asana', /\basana\b/],
  ['trello', /\btrello\b/],
  ['apollo', /apollo\.io|\bapollo\b|enrich(?:ment|ed|es)?\b/],
  ['freshdesk', /fresh\s?desk/],
  ['zendesk', /zen\s?desk/],
  ['intercom', /intercom/],
  ['stripe', /\bstripe\b/],
  ['shopify', /shopify/],
  ['quickbooks', /quick\s?books|\bqbo\b|\bxero\b/],
  ['github', /git\s?hub|pull requests?/],
  ['linear', /\blinear\b(?!\s+(?:algebra|regression|equations?|models?|functions?|programming|time|growth|scale|process))/],
  ['jira', /\bjira\b/],
  ['postgres', /postgres(?:ql)?|\bsupabase\b|\bsql database\b|\bmysql\b/],
  ['airtable', /airtable/],
  ['websearch', /web search|search(?:es|ing)? the web|on the web|the internet|google search|online research|\bbrowse\b|news about/],
  ['scraper', /scrap(?:e|es|ing)|crawl|(?:competitor|their) websites?|read (?:web ?)?pages/],
  ['arxiv', /arxiv|research papers|academic papers|scientific papers/],
  ['webhook', /webhooks?|make\.com|\bn8n\b/],
  ['zapier', /zapier/],
];

/** Mentioned integration ids, in order of first mention. */
export function detectIntegrations(text = '') {
  const low = String(text).toLowerCase();
  const hits = [];
  for (const [id, re] of SYNONYMS) {
    const m = low.match(re);
    if (m) hits.push([m.index, id]);
  }
  hits.sort((a, b) => a[0] - b[0]);
  let ids = hits.map(([, id]) => id);
  // "spreadsheet" means Excel when Excel is named; Outlook calendar users still get gcal-like scheduling
  if (ids.includes('excel')) ids = ids.filter((i) => i !== 'gsheets' || /google sheets?|gsheets?/.test(low));
  if (ids.includes('gdocs') && !/google docs?|gdocs|google doc\b/.test(low)) ids = ids.filter((i) => i !== 'gdocs');
  return [...new Set(ids)];
}

export const integrationName = (id) => integrationById(id).name;

/** Business qualifier used for naming ("dental clinic" → "Dental"). */
const QUALIFIERS = [
  [/dental|dentist|orthodont/, 'Dental'], [/\bvet\b|veterinar/, 'Vet'], [/physio/, 'Physio'], [/salon|barber/, 'Salon'], [/\bspa\b/, 'Spa'],
  [/yoga/, 'Yoga'], [/pilates/, 'Pilates'], [/\bgym\b|fitness/, 'Fitness'], [/clinic|hospital|medical|patients?/, 'Clinic'],
  [/restaurant|bistro|cafe|café/, 'Table'], [/bakery/, 'Bakery'], [/real estate|realty|realtor|property|properties/, 'Realty'],
  [/law firm|legal team|lawyers?|attorneys?/, 'Legal'], [/insurance|insurer/, 'Claims'], [/hotel|hospitality/, 'Hotel'],
  [/nonprofit|non-profit|charity|donors?/, 'Impact'], [/agency/, 'Agency'], [/school|academy|university|college/, 'Campus'],
  [/coworking/, 'Cowork'], [/florist/, 'Florist'], [/brewery|winery/, 'Cellar'], [/saas|startup/, 'Startup'],
];
export function qualifier(low = '') {
  for (const [re, q] of QUALIFIERS) if (re.test(low)) return q;
  return null;
}

// ---------- Generic noun extraction (fallback archetype) ----------
const STOP = new Set(('a an the and or but for to of in on at by with from into onto my our your their his her its this that these those it them they we i me you us ' +
  'app apps application tool tools system platform dashboard page pages site website web portal simple small quick new basic nice good great ' +
  'build make create want need help me let lets keep track manage organize organise run handle automate see view show list lists add remove ' +
  'every each all any some many more most few one two three day days week weeks month months year years time today tomorrow daily weekly monthly ' +
  'people person someone team teams company business work thing things stuff data info information details way ways using use can could should would will ' +
  'also just like so when where who what which how why there here then than able ai agent agents assistant bot smart automatically auto ' +
  'please thanks about around over under between after before through without within via based up down out off get got give takes take ' +
  'is are was were be been being do does did have has had am').split(/\s+/));

/** Candidate domain nouns from the prompt ("track plant watering for my greenhouse" → ['plant', 'greenhouse']). */
export function nounsFrom(text = '') {
  const low = String(text).toLowerCase();
  const out = [];
  const verbs = /\b(?:track|tracking|manage|managing|organi[sz]e|log|logging|catalog(?:ue)?|schedule|book|monitor|record|collect|store|review|plan|planning|rate|compare|share|sell|rent|list|find)\s+(?:(?:my|our|the|all|every|each|new|incoming|upcoming|daily)\s+)*([a-z][a-z-]{2,}(?:\s+[a-z][a-z-]{2,})?)/g;
  let m;
  while ((m = verbs.exec(low))) out.push(m[1].split(/\s+/).filter((w) => !STOP.has(w)).pop());
  const forOf = /\b(?:for|of)\s+(?:my|our|the|a|an)?\s*([a-z][a-z-]{3,})/g;
  while ((m = forOf.exec(low))) out.push(m[1]);
  for (const w of words(low)) if (w.length > 3 && !STOP.has(w) && /s$/.test(w)) out.push(w);
  return [...new Set(out.filter((w) => w && !STOP.has(w) && !STOP.has(singular(w)) && w.length > 2).map((w) => singular(w)))].slice(0, 4);
}

/** Known generic nouns with realistic example items for the fallback archetype. */
export const NOUN_KITS = {
  plant: { icon: 'sparkles', items: ['Monstera deliciosa', 'Fiddle-leaf fig', 'Snake plant', 'Pothos (golden)', 'Calathea orbifolia', 'ZZ plant', 'Peace lily', 'String of pearls', 'Bird of paradise', 'Rubber plant', 'Aloe vera', 'Boston fern'], cats: ['Living room', 'Office', 'Balcony', 'Bedroom'] },
  book: { icon: 'book-open', items: ['The Pragmatic Programmer', 'Thinking, Fast and Slow', 'Project Hail Mary', 'Atomic Habits', 'The Design of Everyday Things', 'Sapiens', 'Educated', 'Klara and the Sun', 'Deep Work', 'The Midnight Library', 'Shoe Dog', 'Dune'], cats: ['Fiction', 'Non-fiction', 'Business', 'Science'] },
  recipe: { icon: 'heart', items: ['Weeknight dal tadka', 'Lemon herb chicken', 'Shakshuka', 'Miso salmon bowl', 'Mushroom risotto', 'Black bean tacos', 'Thai green curry', 'Banana oat pancakes', 'Greek salad', 'Pesto pasta', 'Chickpea stew', 'Overnight oats'], cats: ['Breakfast', 'Lunch', 'Dinner', 'Snack'] },
  event: { icon: 'calendar', items: ['Spring product meetup', 'Customer advisory board', 'Team offsite — Lisbon', 'Webinar: AI in ops', 'Partner summit', 'Hack night', 'Quarterly all-hands', 'Launch party', 'Workshop: pricing', 'Community AMA', 'Charity 5K', 'Holiday dinner'], cats: ['Internal', 'Customer', 'Community', 'Partner'] },
  property: { icon: 'building', items: ['12 Elm Street, Apt 4B', '88 Harbor View', '5 Maple Court', 'Loft 21, Mill Lane', '301 Park Avenue', '17 Orchard Road', 'Unit 9, Riverside', '44 Kings Road', 'The Willows, Plot 3', '2 Station Square', '60 Ocean Drive', '9 Cedar Close'], cats: ['Apartment', 'House', 'Office', 'Retail'] },
  vehicle: { icon: 'box', items: ['Van 07 — Ford Transit', 'Truck 12 — Volvo FH', 'Car 03 — Toyota Corolla', 'Van 02 — Mercedes Sprinter', 'Bike 11 — Cargo e-bike', 'Truck 05 — Scania R', 'Car 09 — Tesla Model 3', 'Van 14 — Renault Master', 'Car 01 — Honda Civic', 'Truck 08 — MAN TGX', 'Van 10 — VW Crafter', 'Car 06 — Kia Niro'], cats: ['Van', 'Truck', 'Car', 'Bike'] },
  asset: { icon: 'box', items: ['MacBook Pro 14 (AS-1042)', 'Dell U2723 monitor (AS-1043)', 'iPhone 15 (AS-1051)', 'Logitech MX kit (AS-1060)', 'Standing desk (AS-1077)', 'iPad Air (AS-1081)', 'Jabra headset (AS-1090)', 'ThinkPad X1 (AS-1102)', 'Projector (AS-1110)', 'Router (AS-1115)', 'Label printer (AS-1121)', 'Camera kit (AS-1130)'], cats: ['Laptop', 'Peripheral', 'Phone', 'Furniture'] },
  volunteer: { icon: 'users', items: [], cats: ['Events', 'Outreach', 'Admin', 'Fundraising'], people: true },
  member: { icon: 'users', items: [], cats: ['Monthly', 'Annual', 'Trial', 'Lifetime'], people: true },
  donation: { icon: 'gift', items: [], cats: ['One-off', 'Monthly', 'Corporate', 'Grant'], people: true },
  tenant: { icon: 'building', items: [], cats: ['Residential', 'Commercial', 'Short stay', 'Student'], people: true },
  client: { icon: 'briefcase', items: [], cats: ['Retainer', 'Project', 'Trial', 'Enterprise'], people: true },
  habit: { icon: 'check-circle', items: ['Morning run', 'Read 20 pages', 'Meditate 10 min', 'No phone after 10pm', 'Drink 2L water', 'Practice Spanish', 'Stretch', 'Journal', 'Cook at home', 'Walk 8k steps', 'Sleep by 11', 'Call family'], cats: ['Health', 'Learning', 'Mind', 'Social'] },
  trip: { icon: 'plane', items: ['Lisbon offsite', 'Tokyo client visit', 'Berlin conference', 'NYC sales week', 'Nairobi partner trip', 'Mumbai hiring drive', 'Toronto summit', 'Paris launch', 'Singapore roadshow', 'Austin meetup', 'London board meeting', 'Sydney kickoff'], cats: ['Client', 'Conference', 'Internal', 'Sales'] },
  grant: { icon: 'landmark', items: ['Community Arts Fund 2026', 'Green Futures Grant', 'Digital Inclusion Award', 'Youth STEM Programme', 'Health Equity Fund', 'Local Heritage Grant', 'Climate Action Seed', 'Small Business Boost', 'Innovation Voucher', 'Library Access Fund', 'Clean Water Initiative', 'Women in Tech Fund'], cats: ['Arts', 'Environment', 'Education', 'Health'] },
  workout: { icon: 'activity', items: ['Leg day — squats & lunges', 'Upper body push', '5K tempo run', 'Yoga flow 30', 'HIIT circuit', 'Pull & core', 'Long easy run', 'Mobility session', 'Rowing intervals', 'Full-body strength', 'Swim 1500m', 'Cycling hills'], cats: ['Strength', 'Cardio', 'Mobility', 'Endurance'] },
};

export function nounKit(noun) {
  if (!noun) return null;
  const n = singular(noun);
  return NOUN_KITS[n] ? { key: n, ...NOUN_KITS[n] } : null;
}

export function entityWords(noun = 'item') {
  const one = singular(noun).toLowerCase();
  return { one, many: plural(one), One: titleCase(one), Many: titleCase(plural(one)) };
}
