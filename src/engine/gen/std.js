// Shared assembly for profile-driven archetypes (booking, content, knowledge, legal,
// commerce, engineering, education, research, generic). A profile supplies data,
// agent specs, screen specs and promises; this file turns them into a build().
import { team, runsTable, B, screen, P } from './kit.js';

/** One "main view" block from a compact spec. */
export function viewBlock(id, v) {
  const o = { title: v.title, span: v.span ?? 8, promise: v.promise, agent: v.agent, file: v.file };
  switch (v.type) {
    case 'kanban': return B.kanban(id, v.table, { ...o, groupBy: v.groupBy, titleKey: v.titleKey, subtitleKey: v.subtitleKey });
    case 'calendar': return B.calendar(id, v.table, { ...o, dateKey: v.dateKey, titleKey: v.titleKey });
    case 'cards': return B.cards(id, v.table, { ...o, titleKey: v.titleKey, subtitleKey: v.subtitleKey, metaKeys: v.metaKeys, badgeKey: v.badgeKey });
    default: return B.table(id, v.table, { ...o, columns: v.columns, filters: v.filters, rowAction: v.rowAction });
  }
}

/**
 * Screen from a spec:
 * { key, route, title, icon, subtitle, actions, promise, kpis:{items, table, promise}, view, chat:{agent,title,greeting,placeholder,suggestions,promise},
 *   charts:[{title, table, kind, groupBy, metric, series, promise}], activity:agentId, blocks:[extra blocks] }
 */
export function specScreen(c, s, ids) {
  const k = s.key;
  const out = [B.header(`b_${k}_header`, s.route, s.title, s.subtitle, s.actions || [], { promise: s.promise })];
  if (s.kpis) out.push(B.kpis(`b_${k}_kpis`, s.kpis.items, { table: s.kpis.table, promise: s.kpis.promise }));
  if (s.view) out.push(viewBlock(`b_${k}_${s.view.type || 'table'}`, s.view));
  if (s.chat) {
    const ch = s.chat;
    out.push(B.chat(`b_${k}_chat`, ch.agent || ids.lead, { title: ch.title || `Ask ${c.name}`, promise: ch.promise, greeting: ch.greeting, placeholder: ch.placeholder, suggestions: ch.suggestions || [], span: 4 }));
  }
  const tail = [];
  (s.charts || []).forEach((g, i) => tail.push(B.chart(`b_${k}_chart${i + 1}`, { title: g.title, table: g.series ? undefined : g.table, kind: g.kind, groupBy: g.groupBy, metric: g.metric, series: g.series, promise: g.promise, span: g.span ?? 4 })));
  if (s.activity) tail.splice(Math.min(1, tail.length), 0, B.activity(`b_${k}_activity`, s.activity, {}));
  out.push(...tail, ...(s.blocks || []));
  return screen(`s_${k}`, s.route, s.title, s.icon, out, s.nav ?? true);
}

/** Insights screen: header, KPIs, trend (8) + one-paragraph summary (4). */
export function insightsScreen(c, i, ids) {
  return screen('s_insights', '/insights', 'Insights', 'bar-chart', [
    B.header('b_ins_header', '/insights', 'Insights', i.subtitle || `How your ${c.entity.many} and your agents are doing`),
    i.kpis && B.kpis('b_ins_kpis', i.kpis, { file: 'components/InsightKpis.tsx' }),
    B.chart('b_ins_trend', { title: i.trend.title, kind: i.trend.kind || 'area', span: 8, series: i.trend.series, promise: i.promise, file: 'components/Trend.tsx' }),
    B.text('b_ins_text', i.text, { title: 'This week in one paragraph', span: 4, agent: ids.lead, file: 'components/WeeklySummary.tsx' }),
  ]);
}

/** "Never do X without approval" / "Do X automatically and log it" promise. */
export function autonomyPromise(c, id, agentId, { action, what, autoTitle, autoDetail }) {
  return c.autonomy === 'auto'
    ? P(id, autoTitle || `${what} automatically — and log every one`, autoDetail || 'You can pause it anytime; every action appears in Agent runs.', ['Every action appears in Agent runs', 'Pausing stops new actions within 1 minute'], [agentId], 0.8)
    : P(id, `Never ${what.toLowerCase()} without your approval`, 'It’s always a human decision.', [`${action} requires approval in every run mode`], [agentId], 0.6);
}

/** Build function for a profile. */
export function stdBuild(p) {
  return function build(c) {
    const d = p.data(c);
    const { agents, lead, specs } = team(c, p.workers(c, d), p.manager ? p.manager(c, d) : {});
    const tables = [d.main, d.second, ...(d.extra || [])].filter(Boolean);
    tables.push(runsTable(c, agents, specs));
    const workers = agents.filter((a) => a.kind !== 'manager');
    const w1 = workers[0]?.id || lead, w2 = (workers[1] || workers[0])?.id || lead;
    const ids = { lead, w1, w2, w3: workers[2]?.id || null, workers: workers.map((a) => a.id), agents };
    const L = p.layout(c, d, ids);
    const screens = L.screens.map((s) => specScreen(c, s, ids));
    if (L.insights && !(c.maxScreens && screens.length >= c.maxScreens)) screens.push(insightsScreen(c, L.insights, ids));
    if (L.extra && screens.length < 4) screens.push(specScreen(c, L.extra, ids));
    return {
      tables, agents, lead, screens,
      promises: p.promises(c, d, ids),
      summary: p.summary(c, d), description: p.description ? p.description(c, d) : p.pitch(),
      decisions: p.decisions ? p.decisions(c, d) : [], env: p.env ? p.env(c, d) : [],
    };
  };
}
