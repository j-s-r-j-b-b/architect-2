// Static catalogs shared by every screen: integrations, MCP servers, frameworks, models,
// plans, roles, theme presets, templates (prompt library) and persona pages.

// ---------------------------------------------------------------------------
// Integrations (built-in tools need no API keys — parity with today's Architect)
// ---------------------------------------------------------------------------
export const INTEGRATION_CATEGORIES = ['Communication', 'Workspace', 'CRM & Sales', 'Data', 'Support', 'Payments & Commerce', 'Developer', 'Research', 'Automation'];

/** color = brand-ish swatch for the letter tile; auth: oauth | apikey | none */
export const INTEGRATIONS = [
  { id: 'gmail', name: 'Gmail', category: 'Communication', color: '#EA4335', auth: 'oauth', builtIn: true, desc: 'Read, draft and send email', scopes: ['Read messages', 'Create drafts', 'Send email'], actions: ['search_email', 'create_draft', 'send_email'] },
  { id: 'outlook', name: 'Outlook', category: 'Communication', color: '#0A64C9', auth: 'oauth', builtIn: true, desc: 'Microsoft 365 mail & calendar', scopes: ['Read mail', 'Send mail'], actions: ['search_mail', 'send_mail'] },
  { id: 'slack', name: 'Slack', category: 'Communication', color: '#611F69', auth: 'oauth', builtIn: true, desc: 'Post messages and alerts to channels', scopes: ['Post to channels', 'Read channel list'], actions: ['post_message', 'list_channels'] },
  { id: 'teams', name: 'Microsoft Teams', category: 'Communication', color: '#4B53BC', auth: 'oauth', builtIn: true, desc: 'Send messages to Teams channels', scopes: ['Post messages'], actions: ['post_message'] },
  { id: 'telegram', name: 'Telegram', category: 'Communication', color: '#229ED9', auth: 'apikey', builtIn: true, desc: 'Bot messages and notifications', scopes: ['Send messages'], actions: ['send_message'] },
  { id: 'whatsapp', name: 'WhatsApp', category: 'Communication', color: '#25D366', auth: 'apikey', builtIn: false, desc: 'Business messaging via Cloud API', scopes: ['Send messages'], actions: ['send_message'] },
  { id: 'twitter', name: 'X (Twitter)', category: 'Communication', color: '#111111', auth: 'oauth', builtIn: true, desc: 'Post and monitor', scopes: ['Read posts', 'Write posts'], actions: ['post', 'search'] },
  { id: 'linkedin', name: 'LinkedIn', category: 'Communication', color: '#0A66C2', auth: 'oauth', builtIn: true, desc: 'Profiles and company pages', scopes: ['Read profile', 'Share posts'], actions: ['lookup_profile', 'share_post'] },
  { id: 'instantly', name: 'Instantly', category: 'Communication', color: '#1D4ED8', auth: 'apikey', builtIn: true, desc: 'Cold email campaigns', scopes: ['Manage campaigns'], actions: ['add_lead', 'start_campaign'] },
  { id: 'twilio', name: 'Twilio', category: 'Communication', color: '#F22F46', auth: 'apikey', builtIn: false, desc: 'SMS and voice calls', scopes: ['Send SMS', 'Voice'], actions: ['send_sms', 'place_call'] },
  { id: 'gcal', name: 'Google Calendar', category: 'Workspace', color: '#1A73E8', auth: 'oauth', builtIn: true, desc: 'Read and create events', scopes: ['Read events', 'Create events'], actions: ['list_events', 'create_event'] },
  { id: 'gdrive', name: 'Google Drive', category: 'Workspace', color: '#0F9D58', auth: 'oauth', builtIn: true, desc: 'Files and folders', scopes: ['Read files'], actions: ['search_files', 'read_file'] },
  { id: 'gdocs', name: 'Google Docs', category: 'Workspace', color: '#4285F4', auth: 'oauth', builtIn: true, desc: 'Create and edit documents', scopes: ['Create docs', 'Edit docs'], actions: ['create_doc', 'append_text'] },
  { id: 'gsheets', name: 'Google Sheets', category: 'Data', color: '#0F9D58', auth: 'oauth', builtIn: true, desc: 'Read and write spreadsheets', scopes: ['Read sheets', 'Write sheets'], actions: ['read_rows', 'append_row'] },
  { id: 'excel', name: 'Microsoft Excel', category: 'Data', color: '#107C41', auth: 'oauth', builtIn: true, desc: 'Workbooks in OneDrive', scopes: ['Read workbooks'], actions: ['read_range'] },
  { id: 'notion', name: 'Notion', category: 'Workspace', color: '#111111', auth: 'oauth', builtIn: true, desc: 'Pages and databases', scopes: ['Read pages', 'Insert content'], actions: ['search', 'create_page'] },
  { id: 'confluence', name: 'Confluence', category: 'Workspace', color: '#1868DB', auth: 'oauth', builtIn: true, desc: 'Team wiki pages', scopes: ['Read pages'], actions: ['search_pages'] },
  { id: 'dropbox', name: 'Dropbox', category: 'Workspace', color: '#0061FF', auth: 'oauth', builtIn: true, desc: 'Cloud files', scopes: ['Read files'], actions: ['list_files'] },
  { id: 'asana', name: 'Asana', category: 'Workspace', color: '#F06A6A', auth: 'oauth', builtIn: true, desc: 'Tasks and projects', scopes: ['Read tasks', 'Create tasks'], actions: ['create_task'] },
  { id: 'trello', name: 'Trello', category: 'Workspace', color: '#0079BF', auth: 'oauth', builtIn: true, desc: 'Boards and cards', scopes: ['Read boards', 'Create cards'], actions: ['create_card'] },
  { id: 'hubspot', name: 'HubSpot', category: 'CRM & Sales', color: '#FF7A59', auth: 'oauth', builtIn: true, desc: 'Contacts, companies and deals', scopes: ['Read contacts', 'Update deals'], actions: ['search_contacts', 'update_deal', 'create_note'] },
  { id: 'salesforce', name: 'Salesforce', category: 'CRM & Sales', color: '#00A1E0', auth: 'oauth', builtIn: false, desc: 'Leads, accounts, opportunities', scopes: ['Read records', 'Update records'], actions: ['query', 'update_record'] },
  { id: 'apollo', name: 'Apollo', category: 'CRM & Sales', color: '#1B1B1B', auth: 'apikey', builtIn: true, desc: 'Prospect and company enrichment', scopes: ['Enrichment'], actions: ['enrich_company', 'find_people'] },
  { id: 'freshdesk', name: 'Freshdesk', category: 'Support', color: '#25C16F', auth: 'apikey', builtIn: true, desc: 'Support tickets', scopes: ['Read tickets', 'Reply'], actions: ['list_tickets', 'reply_ticket'] },
  { id: 'zendesk', name: 'Zendesk', category: 'Support', color: '#03363D', auth: 'oauth', builtIn: false, desc: 'Tickets and help center', scopes: ['Read tickets', 'Reply'], actions: ['list_tickets', 'reply_ticket'] },
  { id: 'intercom', name: 'Intercom', category: 'Support', color: '#1F8DED', auth: 'oauth', builtIn: false, desc: 'Conversations and help articles', scopes: ['Read conversations'], actions: ['list_conversations'] },
  { id: 'stripe', name: 'Stripe', category: 'Payments & Commerce', color: '#635BFF', auth: 'apikey', builtIn: false, desc: 'Payments, invoices and subscriptions', scopes: ['Read payments', 'Create invoices'], actions: ['list_charges', 'create_invoice'] },
  { id: 'shopify', name: 'Shopify', category: 'Payments & Commerce', color: '#5E8E3E', auth: 'oauth', builtIn: false, desc: 'Orders, products and customers', scopes: ['Read orders', 'Read products'], actions: ['list_orders', 'update_inventory'] },
  { id: 'quickbooks', name: 'QuickBooks', category: 'Payments & Commerce', color: '#2CA01C', auth: 'oauth', builtIn: false, desc: 'Accounting and invoices', scopes: ['Read invoices'], actions: ['list_invoices'] },
  { id: 'github', name: 'GitHub', category: 'Developer', color: '#181717', auth: 'oauth', builtIn: true, desc: 'Issues, pull requests, repos', scopes: ['Read repos', 'Create issues'], actions: ['create_issue', 'list_prs'] },
  { id: 'linear', name: 'Linear', category: 'Developer', color: '#5E6AD2', auth: 'oauth', builtIn: true, desc: 'Issues and cycles', scopes: ['Read issues', 'Create issues'], actions: ['create_issue'] },
  { id: 'jira', name: 'Jira', category: 'Developer', color: '#0052CC', auth: 'oauth', builtIn: true, desc: 'Issues and sprints', scopes: ['Read issues', 'Create issues'], actions: ['create_issue', 'search_issues'] },
  { id: 'postgres', name: 'PostgreSQL', category: 'Data', color: '#336791', auth: 'apikey', builtIn: false, desc: 'Bring your own database (DATABASE_URL)', scopes: ['Read', 'Write'], actions: ['query'] },
  { id: 'airtable', name: 'Airtable', category: 'Data', color: '#18BFFF', auth: 'oauth', builtIn: false, desc: 'Bases and tables', scopes: ['Read records', 'Write records'], actions: ['list_records', 'create_record'] },
  { id: 'websearch', name: 'Web search', category: 'Research', color: '#2F5BEA', auth: 'none', builtIn: true, desc: 'Search the public web', scopes: [], actions: ['search_web'] },
  { id: 'scraper', name: 'Web reader', category: 'Research', color: '#7446F0', auth: 'none', builtIn: true, desc: 'Read and summarise web pages', scopes: [], actions: ['read_url'] },
  { id: 'arxiv', name: 'arXiv', category: 'Research', color: '#B31B1B', auth: 'none', builtIn: true, desc: 'Search research papers', scopes: [], actions: ['search_papers'] },
  { id: 'webhook', name: 'Webhook', category: 'Automation', color: '#5A6B7F', auth: 'none', builtIn: true, desc: 'Send or receive HTTP events (Zapier, Make, n8n)', scopes: [], actions: ['post_webhook'] },
  { id: 'zapier', name: 'Zapier', category: 'Automation', color: '#FF4F00', auth: 'apikey', builtIn: false, desc: 'Trigger 7,000+ app automations', scopes: ['Trigger zaps'], actions: ['trigger_zap'] },
];
export const integrationById = (id) => INTEGRATIONS.find((i) => i.id === id) || { id, name: id, color: '#5A6B7F', category: 'Other', auth: 'apikey', scopes: [], actions: [] };

export const MCP_SERVERS = [
  { id: 'deepwiki', name: 'DeepWiki', url: 'https://mcp.deepwiki.com/mcp', auth: 'none', desc: 'Ask questions about any public GitHub repo' },
  { id: 'stripe-mcp', name: 'Stripe', url: 'https://mcp.stripe.com', auth: 'oauth', desc: 'Payments, customers, invoices' },
  { id: 'supabase-mcp', name: 'Supabase', url: 'https://mcp.supabase.com/mcp', auth: 'oauth', desc: 'Query and manage a Supabase project' },
  { id: 'linear-mcp', name: 'Linear', url: 'https://mcp.linear.app/mcp', auth: 'oauth', desc: 'Issues, projects and cycles' },
  { id: 'sentry-mcp', name: 'Sentry', url: 'https://mcp.sentry.dev/mcp', auth: 'oauth', desc: 'Errors and performance issues' },
  { id: 'context7', name: 'Context7', url: 'https://mcp.context7.com/mcp', auth: 'apikey', desc: 'Up-to-date library documentation' },
];

// ---------------------------------------------------------------------------
// Agent frameworks — "build agents in any framework" from one open spec
// ---------------------------------------------------------------------------
export const FRAMEWORKS = [
  { id: 'architect', name: 'Architect native', lang: 'Managed', badge: 'Default', desc: 'Managed runtime with guardrails, memory, evals and one-click deploy. No code required.', roundTrip: 'full', files: ['agent.yaml'] },
  { id: 'gitagent', name: 'GitAgent (open spec)', lang: 'YAML + Markdown', desc: 'Portable, git-native agent files (SOUL / RULES / DUTIES / agent.yaml). Export to any runtime.', roundTrip: 'full', files: ['agent.yaml', 'SOUL.md', 'RULES.md', 'DUTIES.md'] },
  { id: 'langgraph', name: 'LangGraph', lang: 'Python', desc: 'Durable graphs with checkpoints and time-travel debugging. Best for complex control flow.', roundTrip: 'partial', files: ['graph.py', 'tools.py'] },
  { id: 'crewai', name: 'CrewAI', lang: 'Python', desc: 'Role / goal / task crews. Intuitive for multi-agent teams.', roundTrip: 'partial', files: ['crew.py', 'agents.yaml', 'tasks.yaml'] },
  { id: 'openai-agents', name: 'OpenAI Agents SDK', lang: 'Python · TypeScript', desc: 'Handoffs, guardrails and tracing with a minimal API.', roundTrip: 'partial', files: ['agent.py'] },
  { id: 'claude-agent-sdk', name: 'Claude Agent SDK', lang: 'Python · TypeScript', desc: 'The Claude Code harness as a library: tools, subagents, MCP, permissions.', roundTrip: 'partial', files: ['agent.ts'] },
  { id: 'google-adk', name: 'Google ADK', lang: 'Python · TS · Go · Java', desc: 'Multi-language, A2A-native agents with graph workflows.', roundTrip: 'partial', files: ['agent.py'] },
  { id: 'mastra', name: 'Mastra', lang: 'TypeScript', desc: 'TypeScript-native agents, workflows and evals for web teams.', roundTrip: 'partial', files: ['agent.ts'] },
];
export const frameworkById = (id) => FRAMEWORKS.find((f) => f.id === id) || FRAMEWORKS[0];

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------
/** Plain-language tiers shown by default; exact models live behind "Advanced". */
export const MODEL_TIERS = [
  { id: 'fast', label: 'Fast', desc: 'Quick, low-cost. Great for simple steps.', multiplier: 0.5, icon: 'zap' },
  { id: 'balanced', label: 'Balanced', desc: 'Best mix of quality and cost. Recommended.', multiplier: 1, icon: 'gauge' },
  { id: 'best', label: 'Best', desc: 'Highest quality reasoning. Costs more.', multiplier: 2.5, icon: 'crown' },
];
export const MODELS = [
  { id: 'claude-opus-5-5', provider: 'Anthropic', name: 'Claude Opus 5.5', tier: 'best' },
  { id: 'claude-sonnet-5', provider: 'Anthropic', name: 'Claude Sonnet 5', tier: 'balanced' },
  { id: 'claude-haiku-4-5', provider: 'Anthropic', name: 'Claude Haiku 4.5', tier: 'fast' },
  { id: 'gpt-5', provider: 'OpenAI', name: 'GPT-5 class', tier: 'best' },
  { id: 'gpt-5-mini', provider: 'OpenAI', name: 'GPT-5 mini class', tier: 'fast' },
  { id: 'gemini-pro', provider: 'Google', name: 'Gemini Pro', tier: 'balanced' },
  { id: 'gemini-flash', provider: 'Google', name: 'Gemini Flash', tier: 'fast' },
  { id: 'llama-groq', provider: 'Groq', name: 'Llama (open weights)', tier: 'fast' },
];

// ---------------------------------------------------------------------------
// Plans & credits (mirrors today's Architect pricing so parity is obvious)
// ---------------------------------------------------------------------------
export const PLANS = [
  { id: 'free', name: 'Free', monthly: 0, annual: 0, credits: 300, blurb: 'Explore and build your first apps', features: ['300 credits / month', 'Unlimited planning & quotes', 'Deploy to architect.space', '“Built with Architect” badge'], cta: 'Current plan' },
  { id: 'starter', name: 'Starter', monthly: 20, annual: 17, credits: 2000, blurb: 'For side projects that go live', features: ['2,000 credits / month', 'Remove badge', 'Custom domain', 'Priority support'] },
  { id: 'pro', name: 'Pro', monthly: 40, annual: 35, credits: 4500, popular: true, blurb: 'For builders shipping every week', features: ['4,500 credits / month', 'Staging environment', 'Agent evals & traces', 'GitHub PR workflow', 'Bring your own model keys'] },
  { id: 'max', name: 'Max', monthly: 99, annual: 83, credits: 12000, blurb: 'For teams and agencies', features: ['12,000 credits / month', 'Roles & approvals', 'White-label branding', 'Audit log'] },
  { id: 'custom', name: 'Enterprise', monthly: null, annual: null, credits: null, blurb: 'Governance, VPC and SSO', features: ['Custom credit allocation', 'SSO / SAML, RBAC', 'VPC or on-prem hosting', 'Forward-deployed engineers'], cta: 'Talk to us' },
];
export const TOP_UPS = [{ usd: 25, credits: 2500 }, { usd: 50, credits: 5200 }, { usd: 100, credits: 11000 }];

export const ROLES = [
  { id: 'owner', label: 'Owner', desc: 'Full control, billing and deletion' },
  { id: 'editor', label: 'Editor', desc: 'Build, change agents and publish drafts' },
  { id: 'reviewer', label: 'Reviewer', desc: 'Comment and approve changes to production' },
  { id: 'viewer', label: 'Viewer', desc: 'See the plan, preview and insights' },
];

// ---------------------------------------------------------------------------
// Themes for generated apps (Theme Manager presets)
// ---------------------------------------------------------------------------
export const THEME_PRESETS = [
  { id: 'blueprint', name: 'Blueprint', primary: '#2F5BEA', accent: '#7446F0', bg: '#F7F8FB', surface: '#FFFFFF', text: '#111827', radius: 10, font: 'Geist' },
  { id: 'ink', name: 'Ink', primary: '#111827', accent: '#2563EB', bg: '#F6F6F4', surface: '#FFFFFF', text: '#111111', radius: 8, font: 'Geist' },
  { id: 'navy', name: 'Navy', primary: '#1E3A8A', accent: '#0EA5E9', bg: '#F5F7FB', surface: '#FFFFFF', text: '#0F172A', radius: 10, font: 'Geist' },
  { id: 'forest', name: 'Forest', primary: '#166534', accent: '#CA8A04', bg: '#F6F8F5', surface: '#FFFFFF', text: '#14231A', radius: 12, font: 'Geist' },
  { id: 'sunset', name: 'Sunset', primary: '#EA580C', accent: '#DB2777', bg: '#FFF8F3', surface: '#FFFFFF', text: '#1F1410', radius: 14, font: 'Geist' },
  { id: 'grape', name: 'Grape', primary: '#7C3AED', accent: '#EC4899', bg: '#F9F7FF', surface: '#FFFFFF', text: '#1E1433', radius: 14, font: 'Geist' },
  { id: 'teal', name: 'Lagoon', primary: '#0F766E', accent: '#2563EB', bg: '#F3F8F8', surface: '#FFFFFF', text: '#0F1F1E', radius: 10, font: 'Geist' },
  { id: 'rose', name: 'Rose', primary: '#E11D48', accent: '#F59E0B', bg: '#FFF7F8', surface: '#FFFFFF', text: '#2A1117', radius: 12, font: 'Geist' },
  { id: 'slate', name: 'Slate', primary: '#334155', accent: '#10B981', bg: '#F4F5F7', surface: '#FFFFFF', text: '#0F172A', radius: 6, font: 'Geist' },
  { id: 'midnight', name: 'Midnight', primary: '#6366F1', accent: '#22D3EE', bg: '#0B1020', surface: '#121A2E', text: '#E6E9F2', radius: 12, font: 'Geist', dark: true },
  { id: 'carbon', name: 'Carbon', primary: '#F97316', accent: '#FACC15', bg: '#0E0E10', surface: '#18181B', text: '#F4F4F5', radius: 8, font: 'Geist', dark: true },
  { id: 'editorial', name: 'Editorial', primary: '#9A3412', accent: '#1D4ED8', bg: '#FBF8F3', surface: '#FFFFFF', text: '#1C1917', radius: 4, font: 'Instrument Serif' },
];
export const themePreset = (id) => THEME_PRESETS.find((t) => t.id === id) || THEME_PRESETS[0];

// ---------------------------------------------------------------------------
// Prompt library / templates
// ---------------------------------------------------------------------------
export const TEMPLATE_CATEGORIES = ['Sales', 'Marketing', 'Support', 'Operations', 'HR & Recruiting', 'Finance', 'Product & Engineering', 'Legal', 'Education', 'Commerce'];

export const TEMPLATES = [
  { id: 'lead-desk', title: 'Lead Desk', category: 'Sales', icon: 'target', popular: true, prompt: 'Score inbound HubSpot leads against our ideal customer profile, draft personalised follow-up emails for the best ones, and alert the team in Slack when a hot lead arrives.', agents: ['Lead Qualifier', 'Email Drafter'], integrations: ['hubspot', 'gmail', 'slack'], screens: 3, credits: [36, 48], minutes: [9, 14], uses: 4820 },
  { id: 'support-copilot', title: 'Support Copilot', category: 'Support', icon: 'headphones', popular: true, prompt: 'A support desk that triages incoming Freshdesk tickets by urgency and topic, drafts replies from our help-center knowledge base, and escalates angry customers to a human.', agents: ['Ticket Triage', 'Reply Writer', 'Escalation Watcher'], integrations: ['freshdesk', 'slack'], screens: 3, credits: [40, 55], minutes: [10, 16], uses: 3910 },
  { id: 'recruit-screen', title: 'Candidate Screener', category: 'HR & Recruiting', icon: 'users', popular: true, prompt: 'Screen resumes for open roles against the job description, rank candidates with reasons, and schedule interviews on Google Calendar for the shortlist.', agents: ['Resume Screener', 'Interview Scheduler'], integrations: ['gcal', 'gmail'], screens: 3, credits: [34, 46], minutes: [9, 13], uses: 2760 },
  { id: 'expense-auditor', title: 'Expense Auditor', category: 'Finance', icon: 'receipt', prompt: 'Review submitted expense receipts, flag policy violations with explanations, and produce a weekly summary for finance in Google Sheets.', agents: ['Receipt Reader', 'Policy Checker'], integrations: ['gsheets', 'gmail'], screens: 3, credits: [32, 44], minutes: [8, 12], uses: 1640 },
  { id: 'content-studio', title: 'Content Studio', category: 'Marketing', icon: 'megaphone', popular: true, prompt: 'Turn a product update into a blog post, a LinkedIn post and a newsletter in our brand voice, with an approval step before anything is published.', agents: ['Content Writer', 'Brand Editor'], integrations: ['linkedin', 'notion'], screens: 3, credits: [30, 42], minutes: [8, 12], uses: 3320 },
  { id: 'policy-assistant', title: 'Policy Q&A', category: 'Operations', icon: 'book-open', prompt: 'An internal assistant that answers employee questions from our policy PDFs with citations, and logs questions it could not answer for HR.', agents: ['Policy Expert'], integrations: ['gdrive', 'slack'], screens: 2, credits: [22, 30], minutes: [6, 9], uses: 2210 },
  { id: 'contract-review', title: 'Contract Reviewer', category: 'Legal', icon: 'file-text', prompt: 'Review uploaded contracts, highlight risky clauses against our playbook, suggest redlines and summarise obligations and renewal dates.', agents: ['Clause Analyst', 'Summary Writer'], integrations: ['gdrive'], screens: 3, credits: [34, 48], minutes: [9, 14], uses: 980 },
  { id: 'claims-desk', title: 'Claims Desk', category: 'Finance', icon: 'shield-check', prompt: 'Process insurance claims: extract details from submitted documents, check coverage rules, flag potential fraud and draft a decision letter for an adjuster to approve.', agents: ['Document Extractor', 'Coverage Checker', 'Fraud Watcher'], integrations: ['gmail', 'gdrive'], screens: 4, credits: [44, 60], minutes: [11, 17], uses: 740 },
  { id: 'booking-concierge', title: 'Booking Concierge', category: 'Commerce', icon: 'calendar', prompt: 'A booking page for a clinic where patients pick a slot, an assistant answers questions about services and prices, and reminders go out by SMS.', agents: ['Booking Assistant', 'Reminder Agent'], integrations: ['gcal', 'twilio'], screens: 3, credits: [30, 42], minutes: [8, 12], uses: 1530 },
  { id: 'order-ops', title: 'Order Ops', category: 'Commerce', icon: 'shopping-cart', prompt: 'Monitor Shopify orders, predict low stock, draft purchase orders for suppliers and answer "where is my order" questions from customers.', agents: ['Inventory Planner', 'Order Assistant'], integrations: ['shopify', 'gmail'], screens: 3, credits: [36, 50], minutes: [9, 14], uses: 1120 },
  { id: 'sprint-reporter', title: 'Sprint Reporter', category: 'Product & Engineering', icon: 'git-branch', prompt: 'Summarise what shipped each week from Linear and GitHub, write release notes for customers and a risk summary for leadership.', agents: ['Changelog Writer', 'Risk Analyst'], integrations: ['linear', 'github', 'slack'], screens: 3, credits: [30, 40], minutes: [8, 12], uses: 1890 },
  { id: 'tutor', title: 'Course Tutor', category: 'Education', icon: 'graduation-cap', prompt: 'A course companion that quizzes students on each lesson, explains wrong answers, and gives teachers a progress dashboard per student.', agents: ['Tutor', 'Quiz Maker'], integrations: ['gdocs'], screens: 3, credits: [30, 42], minutes: [8, 12], uses: 1370 },
  { id: 'research-brief', title: 'Market Research Brief', category: 'Marketing', icon: 'compass', prompt: 'Research competitors for a product idea on the web, compare features and pricing in a table, and produce a one-page brief with opportunities.', agents: ['Web Researcher', 'Analyst'], integrations: ['websearch', 'scraper', 'gdocs'], screens: 2, credits: [26, 36], minutes: [7, 10], uses: 2640 },
  { id: 'onboarding-buddy', title: 'Onboarding Buddy', category: 'HR & Recruiting', icon: 'user-plus', prompt: 'Guide new hires through their first 30 days: a checklist per role, answers from the handbook, and nudges to managers when tasks are overdue.', agents: ['Onboarding Guide', 'Nudge Agent'], integrations: ['slack', 'notion'], screens: 3, credits: [30, 40], minutes: [8, 12], uses: 860 },
  { id: 'invoice-chaser', title: 'Invoice Chaser', category: 'Finance', icon: 'coins', prompt: 'Track unpaid Stripe invoices, send polite reminder sequences that escalate over time, and forecast cash collection for the month.', agents: ['Collections Agent', 'Forecaster'], integrations: ['stripe', 'gmail'], screens: 3, credits: [32, 44], minutes: [8, 12], uses: 1010 },
  { id: 'bug-triage', title: 'Bug Triage', category: 'Product & Engineering', icon: 'bug', prompt: 'Triage incoming bug reports from support, deduplicate them, estimate severity, and file well-written Jira issues with reproduction steps.', agents: ['Triage Agent', 'Issue Writer'], integrations: ['jira', 'freshdesk'], screens: 3, credits: [30, 42], minutes: [8, 12], uses: 720 },
];
export const templateById = (id) => TEMPLATES.find((t) => t.id === id);

// ---------------------------------------------------------------------------
// Persona landing pages (/for/:persona)
// ---------------------------------------------------------------------------
export const PERSONAS = {
  agencies: { label: 'AI Agencies', headline: 'Ship client agents in days, not quarters', pitch: 'Plan with your client in the room, quote the cost before you build, and hand over a white-label app with the code in their GitHub.', suggestions: ['Build a support agent for my client’s e-commerce store', 'Create a lead-scoring app for a real-estate agency', 'Make a document-processing agent for a law firm'] },
  founders: { label: 'Founders', headline: 'From idea to a live, agentic MVP today', pitch: 'Describe the product. Approve the plan and the price. Launch on your own domain with real users — and keep every line of code.', suggestions: ['A marketplace MVP with an AI matching agent', 'A waitlist site with an onboarding assistant', 'An investor-update generator from my metrics'] },
  sales: { label: 'Sales teams', headline: 'Agents that work your pipeline while you sell', pitch: 'Score leads, research accounts and draft follow-ups inside the tools you already use — with approvals before anything is sent.', suggestions: ['Score inbound HubSpot leads and draft follow-ups', 'Research target accounts before every call', 'Summarise call notes into CRM updates'] },
  support: { label: 'Support teams', headline: 'Resolve more tickets with less copy-paste', pitch: 'Triage, draft and escalate with agents grounded in your own help center — and see every answer’s sources.', suggestions: ['Triage Freshdesk tickets by urgency', 'Draft replies from our help-center articles', 'Alert a human when a customer is angry'] },
  hr: { label: 'HR teams', headline: 'Hiring and onboarding on autopilot — with a human in charge', pitch: 'Screen candidates fairly with visible reasoning, schedule interviews and onboard new hires without chasing spreadsheets.', suggestions: ['Screen resumes against a job description', 'Answer employee policy questions with citations', 'Run a 30-day onboarding checklist per role'] },
  developers: { label: 'Developers', headline: 'Bring your repo. Keep your framework. Ship faster.', pitch: 'Import any GitHub project, build agents in LangGraph, CrewAI or the OpenAI Agents SDK, review every diff and ship through pull requests.', suggestions: ['Import my Next.js repo and add an AI triage agent', 'Wrap my LangGraph agent in a UI with auth', 'Expose my CrewAI crew as an API with evals'] },
};
