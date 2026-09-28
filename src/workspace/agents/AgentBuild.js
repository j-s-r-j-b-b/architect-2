// Build sub-tab: the plain-language Agent Card. Every edit is staged (see state.js) until
// "Save as draft" in the footer. Includes the Agent Copilot box.
import { html, useState, useRef } from '../../lib/html.js';
import { cx, uid, sleep } from '../../lib/util.js';
import { connections } from '../../lib/store.js';
import { Button, Badge, Segmented, Icon, Input, Textarea, Select, Switch, Slider, Checkbox, Callout, Menu, IconButton, StatusPill, CopyButton, toast } from '../../ui/index.js';
import { INTEGRATIONS, MCP_SERVERS, MODEL_TIERS, MODELS, integrationById } from '../../engine/catalog.js';
import { IntegrationTile, openConnectSheet } from '../../shells/ConnectSheet.js';
import { Section, Disclosure, ChipInput } from './ui.js';
import { stageEdit, stagedChanges } from './state.js';
import { proposeChanges, examplesFor } from './copilot.js';
import { TIER_MODEL, estCostPerRun, fmtUsd, modelById, isRisky, riskyActions, humanizeAction, toolConnection, TRIGGER_TYPES, triggerType, SCHEDULE_PRESETS, eventOptions, webhookUrl, inboxAddress, outputImpact, normalizeAgent } from './model.js';

const KNOW_ICON = { file: 'file-text', url: 'globe', table: 'table', text: 'sticky-note' };
const OUT_TYPES = ['text', 'number', 'enum', 'boolean', 'list', 'json', 'date', 'email'];
const GUARDS = [
  { id: 'pii', label: 'Hide personal data', hint: 'Card numbers, IDs and phone numbers are redacted before the model sees them' },
  { id: 'injection', label: 'Ignore hidden instructions', hint: 'Web pages or emails can’t take over the agent (prompt-injection shield)' },
  { id: 'toxicity', label: 'Stay polite', hint: 'Blocks rude or harmful replies' },
  { id: 'groundedness', label: 'Only say what it can back up', hint: 'Checks every claim against its knowledge and tool results' },
];
const MEMORY = [
  { value: 'none', label: 'None', desc: 'Every run starts fresh.' },
  { value: 'session', label: 'This conversation', desc: 'Remembers what was said until the chat ends.' },
  { value: 'long-term', label: 'Long-term', desc: 'Remembers preferences and past outcomes per person, across runs. Stored in your database.' },
];

function CopilotBox({ project, agent }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [props, setProps] = useState(null);
  const [off, setOff] = useState({});
  const ask = async (t = text) => {
    if (!t.trim()) return;
    setText(t); setBusy(true); await sleep(450);
    const p = proposeChanges(project, agent, t);
    setBusy(false); setOff({}); setProps(p);
  };
  const chosen = (props || []).filter((p) => !off[p.id]);
  const apply = () => {
    stageEdit(project.id, agent.id, (d) => { for (const p of chosen) p.apply(d); });
    toast(`Staged ${chosen.length} change${chosen.length > 1 ? 's' : ''} — review them on the card, then save`, { tone: 'success' });
    setProps(null); setText('');
  };
  return html`<div class="ag-copilot">
    <div class="row gap-8 wrap"><span class="ag-copilot__icon"><${Icon} name="sparkles" size=${14} /></span><span class="t-strong">Agent Copilot</span><span class="t-xs t-faint">Say what to change — you review every edit before it’s saved</span></div>
    <div class="ag-copilot__bar">
      <input class="ag-copilot__input" value=${text} placeholder="e.g. Ask me before it sends anything" aria-label="Tell Copilot what to change"
        onInput=${(e) => setText(e.currentTarget.value)} onKeyDown=${(e) => { if (e.key === 'Enter') ask(); }} />
      <${Button} size="sm" variant="primary" icon="wand" loading=${busy} onClick=${() => ask()}>Suggest<//>
    </div>
    ${!props ? html`<div class="row gap-6 wrap">${examplesFor(agent).map((x) => html`<button type="button" class="chip chip--sm" onClick=${() => ask(x)}>${x}</button>`)}</div>` : null}
    ${props ? html`<div class="ag-copilot__props anim-rise">
      ${props.length ? html`
        <div class="t-sm t-muted">Here’s what I’d change. Untick anything you don’t want.</div>
        ${props.map((p) => html`<label class=${cx('ag-prop', off[p.id] && 'is-off')}>
          <${Checkbox} checked=${!off[p.id]} onChange=${(v) => setOff({ ...off, [p.id]: !v })} />
          <span class=${cx('ag-op', p.op === '+' ? 'is-add' : p.op === '−' ? 'is-rm' : 'is-mod')}>${p.op}</span>
          <span class="grow"><span class="t-strong">${p.label}</span>${p.detail ? html`<span class="t-xs t-muted"> — ${p.detail}</span>` : null}</span>
        </label>`)}
        <div class="row gap-8 mt-4"><${Button} size="sm" variant="primary" icon="check" disabled=${!chosen.length} onClick=${apply}>Stage ${chosen.length} change${chosen.length === 1 ? '' : 's'}<//><${Button} size="sm" variant="ghost" onClick=${() => setProps(null)}>Cancel<//></div>`
        : html`<div class="t-sm t-muted">I couldn’t turn that into a change. Try naming a tool, a limit, or a rule (“never mention pricing”).</div>`}
    </div>` : null}
  </div>`;
}

function ToolPicker({ agent, onAdd, onClose }) {
  const [q, setQ] = useState('');
  const has = new Set((agent.tools || []).map((t) => t.id));
  const s = q.trim().toLowerCase();
  const list = INTEGRATIONS.filter((i) => !has.has(i.id) && (!s || `${i.name} ${i.category} ${i.desc}`.toLowerCase().includes(s))).slice(0, 18);
  const mcps = MCP_SERVERS.filter((m) => !has.has(m.id) && (!s || `${m.name} ${m.desc}`.toLowerCase().includes(s))).slice(0, 6);
  return html`<div class="ag-picker anim-rise">
    <div class="row gap-8"><${Input} size="sm" icon="search" autofocus placeholder="Search tools — Slack, Stripe, Sheets…" value=${q} onValue=${setQ} class="grow" /><${IconButton} icon="x" label="Close" size="sm" onClick=${onClose} /></div>
    <div class="ag-picker__grid">
      ${list.map((i) => html`<button type="button" class="ag-picker__item" onClick=${() => onAdd({ id: i.id, name: i.name, actions: [...i.actions] })}><${IntegrationTile} id=${i.id} size="sm" /><span class="grow"><span class="t-strong t-sm">${i.name}</span><span class="t-xs t-faint ag-clamp1">${i.desc}</span></span></button>`)}
    </div>
    ${mcps.length ? html`<div class="t-xs t-faint mt-8">MCP servers</div><div class="ag-picker__grid">${mcps.map((m) => html`<button type="button" class="ag-picker__item" onClick=${() => onAdd({ id: m.id, name: m.name, actions: ['*'], mcp: true, url: m.url })}><span class="ag-mcp-tile"><${Icon} name="server" size=${11} /></span><span class="grow"><span class="t-strong t-sm">${m.name}</span><span class="t-xs t-faint ag-clamp1">${m.desc}</span></span></button>`)}</div>` : null}
    ${!list.length && !mcps.length ? html`<div class="t-sm t-faint">Nothing matches “${q}”.</div>` : null}
  </div>`;
}

export function AgentBuild({ project, agent }) {
  const pid = project.id;
  const stage = (fn) => stageEdit(pid, agent.id, fn);
  const changed = new Set(stagedChanges(project, agent.id).map((c) => c.section));
  const tone = (...ids) => (ids.some((i) => changed.has(i)) ? 'changed' : undefined);
  const [picker, setPicker] = useState(false);
  const [url, setUrl] = useState('');
  const fileRef = useRef(null);
  const saved = normalizeAgent(project.agents.find((a) => a.id === agent.id));
  const impact = outputImpact(project, saved, agent);
  const risky = riskyActions(agent);
  const ungated = risky.filter((r) => !agent.approvals.includes(r.action));
  const est = estCostPerRun(agent);
  const tables = (project.data?.tables || []).filter((t) => !agent.knowledge.some((k) => k.type === 'table' && k.name === t.name));
  const others = project.agents.filter((a) => a.id !== agent.id);

  const addTool = (t) => {
    stage((d) => { d.tools.push(t); for (const a of t.actions) if (isRisky(a) && !d.approvals.includes(a)) d.approvals.push(a); });
    const gated = t.actions.filter(isRisky);
    toast(`Added ${t.name}${gated.length ? ` — ${humanizeAction(gated[0]).toLowerCase()} asks you first` : ''}`, { tone: 'success' });
    setPicker(false);
  };
  const addKnow = (k) => stage((d) => { d.knowledge.push({ id: uid('k'), status: 'ready', ...k }); });
  const onFile = async (e) => {
    const f = e.currentTarget.files?.[0]; e.currentTarget.value = '';
    if (!f) return;
    addKnow({ type: 'file', name: f.name, size: f.size > 1e6 ? `${(f.size / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(f.size / 1024))} KB` });
    toast(`${f.name} added — indexed in your browser (Prototype: simulated)`, { tone: 'success' });
  };
  const setTrig = (i, patch) => stage((d) => { d.triggers[i] = { ...d.triggers[i], ...patch }; });
  const trigDefault = (type) => ({ chat: 'Chat panel', schedule: SCHEDULE_PRESETS[2], webhook: 'Incoming webhook', email: inboxAddress(agent), event: eventOptions(project)[0] || 'New row added' }[type]);

  return html`<div class="ag-build">
    <${CopilotBox} project=${project} agent=${agent} />

    <${Section} id="what" icon="file-text" title="What it does" tone=${tone('what', 'name')} summary=${`${String(agent.instructions).split(/\s+/).filter(Boolean).length} words`}>
      <div class="ag-grid2">
        <${Input} label="Role — in one line" value=${agent.role} placeholder="Scores new leads 0–100 and explains why" onValue=${(v) => stage((d) => { d.role = v; })} />
        <${Input} label="Goal" optional value=${agent.goal} placeholder="What good looks like" onValue=${(v) => stage((d) => { d.goal = v; })} />
      </div>
      <${Textarea} label="Instructions" rows=${6} value=${agent.instructions} hint="Write it like you’d brief a new colleague. Plain words work best." onValue=${(v) => stage((d) => { d.instructions = v; })} />
      <div class="row gap-12 wrap">
        <span class="t-sm t-muted">Type</span>
        <${Segmented} size="sm" value=${agent.kind} onChange=${(v) => stage((d) => { d.kind = v; })} options=${[{ value: 'worker', label: 'Worker', icon: 'bot', tip: 'Does one job itself' }, { value: 'manager', label: 'Manager', icon: 'network', tip: 'Routes work to other agents' }]} />
      </div>
      ${agent.kind === 'manager' ? html`<div class="ag-team">
        <div class="t-sm t-strong">Hands work to</div>
        ${others.length ? others.map((o) => html`<${Checkbox} checked=${agent.delegatesTo.includes(o.id)} label=${`${o.name} — ${o.role || 'agent'}`} onChange=${(v) => stage((d) => { d.delegatesTo = v ? [...new Set([...d.delegatesTo, o.id])] : d.delegatesTo.filter((x) => x !== o.id); })} />`) : html`<span class="t-sm t-faint">Add another agent first — a manager needs a team.</span>`}
      </div>` : null}
    <//>

    <${Section} id="brain" icon="brain" title="Brain" tone=${tone('brain')} summary=${`≈ ${fmtUsd(est)} / run`} hint="How much thinking power it uses. You can change this any time.">
      <${Segmented} full value=${agent.model.tier} onChange=${(v) => stage((d) => { d.model = { ...d.model, tier: v, model: TIER_MODEL[v], provider: 'Anthropic' }; })} options=${MODEL_TIERS.map((t) => ({ value: t.id, label: t.label, icon: t.icon, tip: t.desc }))} />
      <div class="ag-tiers">${MODEL_TIERS.map((t) => html`<div class=${cx('ag-tiercost', agent.model.tier === t.id && 'is-active')}><span>${t.desc}</span><span class="t-mono">≈ ${fmtUsd(estCostPerRun(agent, t.id))}</span></div>`)}</div>
      <${Disclosure} label="Advanced — exact model and creativity">
        <div class="ag-grid2">
          <${Select} label="Model" value=${agent.model.model} onValue=${(v) => stage((d) => { d.model = { ...d.model, model: v, provider: modelById(v)?.provider, tier: modelById(v)?.tier || d.model.tier }; })} options=${MODELS.map((m) => ({ value: m.id, label: `${m.name} · ${m.provider}` }))} />
          <div class="col gap-6"><span class="t-sm t-strong">Creativity · ${Math.round((agent.model.creativity ?? 0.3) * 100)}%</span><${Slider} min=${0} max=${100} value=${Math.round((agent.model.creativity ?? 0.3) * 100)} onChange=${(v) => stage((d) => { d.model = { ...d.model, creativity: v / 100 }; })} /><span class="t-xs t-faint">Low = consistent and factual. High = more varied wording.</span></div>
        </div>
        ${modelById(agent.model.model)?.provider && modelById(agent.model.model).provider !== 'Anthropic' ? html`<${Callout} tone="blueprint" icon="key" class="mt-8">Uses your ${modelById(agent.model.model).provider} key from Settings → Models. Prototype: simulated.<//>` : null}
      <//>
    <//>

    <${Section} id="knows" icon="book-open" title="Knows" tone=${tone('knows')} summary=${`${agent.knowledge.length} source${agent.knowledge.length === 1 ? '' : 's'}`} hint="What it can look things up in. It cites these when it answers.">
      ${agent.knowledge.length ? html`<ul class="ag-rows">${agent.knowledge.map((k) => html`<li class="ag-row">
        <span class="ag-row__ico"><${Icon} name=${KNOW_ICON[k.type] || 'book-open'} size=${14} /></span>
        <span class="grow ag-row__txt"><span class="t-strong">${k.name}</span><span class="t-xs t-faint">${k.type === 'table' ? 'Table in your app' : k.type === 'url' ? 'Web page · re-read weekly' : k.size || 'Note'}</span></span>
        <${StatusPill} status=${k.status === 'indexing' ? 'running' : 'ready'} label=${k.status === 'indexing' ? 'Indexing' : 'Ready'} size="sm" />
        <${IconButton} icon="x" size="sm" label=${`Remove ${k.name}`} onClick=${() => stage((d) => { d.knowledge = d.knowledge.filter((x) => x.id !== k.id); })} />
      </li>`)}</ul>` : html`<div class="t-sm t-faint">Nothing yet — it will answer from its instructions only.</div>`}
      <div class="row gap-8 wrap">
        ${tables.length ? html`<${Menu} width=${240} items=${tables.map((t) => ({ label: t.name, icon: 'table', desc: `${t.rows?.length || 0} rows`, onClick: () => addKnow({ type: 'table', name: t.name, tableId: t.id }) }))} trigger=${(o, t) => html`<${Button} size="sm" variant="secondary" icon="table" iconRight="chevron-down" onClick=${t}>Add a table<//>`} />` : null}
        <${Button} size="sm" variant="secondary" icon="upload" onClick=${() => fileRef.current?.click()}>Upload a file<//>
        <input ref=${fileRef} type="file" class="sr-only" accept=".pdf,.md,.txt,.csv,.docx,.json" onChange=${onFile} />
        <div class="ag-inline"><input class="ag-inline__input" placeholder="https://…" value=${url} onInput=${(e) => setUrl(e.currentTarget.value)} onKeyDown=${(e) => { if (e.key === 'Enter') e.currentTarget.nextElementSibling.click(); }} aria-label="Web page URL" />
          <button type="button" class="ag-inline__btn" onClick=${() => { const u = url.trim(); if (!/^https?:\/\/\S+\.\S+/.test(u)) { toast('Enter a full link starting with https://', { tone: 'warn' }); return; } addKnow({ type: 'url', name: u.replace(/^https?:\/\//, '').slice(0, 60) }); setUrl(''); }}>Add link</button></div>
      </div>
    <//>

    <${Section} id="tools" icon="plug" title="Can use" tone=${tone('tools')} summary=${`${agent.tools.length} tool${agent.tools.length === 1 ? '' : 's'}`} hint="Apps it can read from and act in. Tap an action to switch it on or off.">
      ${agent.tools.length ? html`<ul class="ag-rows">${agent.tools.map((t) => {
        const it = integrationById(t.id);
        const all = [...new Set([...(t.mcp ? [] : it.actions || []), ...(t.actions || [])])];
        const need = !t.mcp && toolConnection(project, t.id, connections.value) === 'needed';
        return html`<li class="ag-row ag-row--tool">
          ${t.mcp ? html`<span class="ag-mcp-tile ag-mcp-tile--md"><${Icon} name="server" size=${13} /></span>` : html`<${IntegrationTile} id=${t.id} />`}
          <div class="grow ag-row__txt">
            <span class="row gap-6"><span class="t-strong">${t.mcp ? t.name : it.name || t.name}</span>${t.mcp ? html`<${Badge} size="sm" tone="violet">MCP<//>` : null}</span>
            <span class="ag-acts">${all.map((a) => { const on = t.actions.includes(a); return html`<button type="button" class=${cx('ag-act', on && 'is-on', isRisky(a) && 'is-risky')} aria-pressed=${on} data-tip=${isRisky(a) ? 'Changes data or reaches people' : 'Read-only'} onClick=${() => stage((d) => { const x = d.tools.find((y) => y.id === t.id); x.actions = on ? x.actions.filter((y) => y !== a) : [...x.actions, a]; if (!on && isRisky(a) && !d.approvals.includes(a)) d.approvals.push(a); })}>${a === '*' ? 'All tools' : humanizeAction(a)}</button>`; })}</span>
          </div>
          ${need ? html`<${Button} size="sm" variant="secondary" icon="plug" onClick=${() => openConnectSheet(t.id, { projectId: pid })}>Connect<//>` : html`<${StatusPill} status="connected" size="sm" />`}
          <${IconButton} icon="x" size="sm" label=${`Remove ${t.name || t.id}`} onClick=${() => stage((d) => { d.tools = d.tools.filter((x) => x.id !== t.id); d.approvals = d.approvals.filter((a) => !(t.actions || []).includes(a)); })} />
        </li>`;
      })}</ul>` : html`<div class="t-sm t-faint">No tools — it can only think and write.</div>`}
      ${picker ? html`<${ToolPicker} agent=${agent} onAdd=${addTool} onClose=${() => setPicker(false)} />` : html`<div><${Button} size="sm" variant="secondary" icon="plus" onClick=${() => setPicker(true)}>Add a tool<//></div>`}
    <//>

    <${Section} id="approvals" icon="shield" title="Must ask before" tone=${tone('approvals')} summary=${risky.length ? `${risky.length - ungated.length} of ${risky.length} gated` : 'nothing risky'} hint="Actions that change data or reach other people pause until a person approves.">
      ${risky.length ? html`<div class="col gap-10">${risky.map((r) => html`<${Switch} checked=${agent.approvals.includes(r.action)} label=${humanizeAction(r.action)} hint=${`${r.toolName} · ${agent.approvals.includes(r.action) ? 'waits for a person to approve' : 'runs on its own'}`}
        onChange=${(v) => stage((d) => { d.approvals = v ? [...new Set([...d.approvals, r.action])] : d.approvals.filter((a) => a !== r.action); })} />`)}</div>` : html`<div class="t-sm t-faint">None of its tools can change data or contact anyone.</div>`}
      ${ungated.length ? html`<${Callout} tone="amber" icon="alert-triangle">${ungated.map((r) => humanizeAction(r.action)).join(', ')} will happen without asking anyone.<//>` : null}
    <//>

    <${Section} id="limits" icon="gauge" title="Limits" tone=${tone('limits')} summary=${`$${agent.limits.monthlyBudget ?? '—'} / month`} hint="Hard stops. A run that hits a limit stops and explains what’s left.">
      <div class="ag-grid3">
        <${Input} label="Max cost per run" type="number" step="0.01" min="0" value=${agent.limits.costPerRun} suffix="$" onValue=${(v) => stage((d) => { d.limits.costPerRun = Math.max(0, +v || 0); })} hint=${`Typical run ≈ ${fmtUsd(est)}`} error=${agent.limits.costPerRun < est ? 'Lower than a typical run — most runs would stop early' : null} />
        <${Input} label="Max steps per run" type="number" min="1" max="100" value=${agent.limits.steps} onValue=${(v) => stage((d) => { d.limits.steps = Math.max(1, Math.round(+v || 1)); })} hint="Tool calls + reasoning steps" />
        <${Input} label="Monthly budget" type="number" min="0" value=${agent.limits.monthlyBudget ?? ''} suffix="$" onValue=${(v) => stage((d) => { d.limits.monthlyBudget = v === '' ? null : Math.max(0, +v || 0); })} hint="Pauses the agent and emails you at 100%" />
      </div>
    <//>

    <${Section} id="guardrails" icon="shield-check" title="Guardrails" tone=${tone('guardrails')} summary=${`${GUARDS.filter((g) => agent.guardrails[g.id]).length} of ${GUARDS.length} on`}>
      <div class="ag-grid2">${GUARDS.map((g) => html`<${Switch} tone="green" checked=${!!agent.guardrails[g.id]} label=${g.label} hint=${g.hint} onChange=${(v) => stage((d) => { d.guardrails[g.id] = v; })} />`)}</div>
      <div class="ag-grid2">
        <div class="col gap-6"><span class="t-sm t-strong">Stick to these topics</span><${ChipInput} values=${agent.guardrails.topics || []} placeholder="Add a topic…" onChange=${(v) => stage((d) => { d.guardrails.topics = v; })} /></div>
        <div class="col gap-6"><span class="t-sm t-strong">Never talk about</span><${ChipInput} tone="red" values=${agent.guardrails.blocked || []} placeholder="e.g. discounts" onChange=${(v) => stage((d) => { d.guardrails.blocked = v; })} /></div>
      </div>
    <//>

    <${Section} id="memory" icon="history" title="Memory" tone=${tone('memory')} summary=${MEMORY.find((m) => m.value === agent.memory)?.label}>
      <${Segmented} size="sm" value=${agent.memory} onChange=${(v) => stage((d) => { d.memory = v; })} options=${MEMORY.map((m) => ({ value: m.value, label: m.label }))} />
      <div class="t-sm t-muted">${MEMORY.find((m) => m.value === agent.memory)?.desc}</div>
    <//>

    <${Section} id="triggers" icon="zap" title="Triggers" tone=${tone('triggers')} summary=${`${agent.triggers.length} way${agent.triggers.length === 1 ? '' : 's'} to start`} hint="What makes it run.">
      ${agent.triggers.length ? html`<ul class="ag-rows">${agent.triggers.map((t, i) => {
        const tt = triggerType(t.type);
        return html`<li class="ag-row ag-row--trig">
          <span class="ag-row__ico is-amber"><${Icon} name=${tt.icon} size=${14} /></span>
          <${Select} size="sm" value=${t.type} options=${TRIGGER_TYPES.map((x) => ({ value: x.id, label: x.label }))} onValue=${(v) => setTrig(i, { type: v, detail: trigDefault(v) })} />
          <div class="grow" style="min-width:0">
            ${t.type === 'schedule' ? html`<${Select} size="sm" value=${t.detail} options=${[...new Set([t.detail, ...SCHEDULE_PRESETS].filter(Boolean))]} onValue=${(v) => setTrig(i, { detail: v })} />`
              : t.type === 'event' ? html`<${Select} size="sm" value=${t.detail} options=${[...new Set([t.detail, ...eventOptions(project)].filter(Boolean))]} onValue=${(v) => setTrig(i, { detail: v })} />`
                : t.type === 'webhook' ? html`<div class="ag-urlrow"><code class="ag-url">${webhookUrl(project, agent)}</code><${CopyButton} text=${webhookUrl(project, agent)} /></div>`
                  : t.type === 'email' ? html`<div class="ag-urlrow"><code class="ag-url">${inboxAddress(agent)}</code><${CopyButton} text=${inboxAddress(agent)} /></div>`
                    : html`<${Input} size="sm" value=${t.detail} placeholder="Where people chat with it" onValue=${(v) => setTrig(i, { detail: v })} />`}
          </div>
          <${IconButton} icon="x" size="sm" label="Remove trigger" onClick=${() => stage((d) => { d.triggers.splice(i, 1); })} />
        </li>`;
      })}</ul>` : html`<div class="t-sm t-faint">No triggers — it only runs when you try it here.</div>`}
      <div><${Menu} width=${250} items=${TRIGGER_TYPES.map((x) => ({ label: x.label, icon: x.icon, desc: x.desc, onClick: () => stage((d) => { d.triggers.push({ type: x.id, detail: trigDefault(x.id) }); }) }))} trigger=${(o, t) => html`<${Button} size="sm" variant="secondary" icon="plus" iconRight="chevron-down" onClick=${t}>Add a trigger<//>`} /></div>
    <//>

    <${Section} id="outputs" icon="list-checks" title="Output contract" tone=${tone('outputs')} summary=${`${agent.outputs.length} field${agent.outputs.length === 1 ? '' : 's'}`} hint="The typed fields it always returns. Screens bind to these.">
      ${agent.outputs.length ? html`<div class="ag-outs">
        <div class="ag-outs__head t-xs t-faint"><span>Field</span><span>Type</span><span>Meaning</span><span></span></div>
        ${agent.outputs.map((o, i) => html`<div class="ag-outs__row">
          <input class="ag-cell t-mono" value=${o.key} aria-label="Field name" onInput=${(e) => { const v = e.currentTarget.value.replace(/[^a-zA-Z0-9_]/g, '_'); stage((d) => { d.outputs[i] = { ...d.outputs[i], key: v }; }); }} />
          <select class="ag-cell" value=${o.type} aria-label="Field type" onChange=${(e) => { const v = e.currentTarget.value; stage((d) => { d.outputs[i] = { ...d.outputs[i], type: v }; }); }}>${[...new Set([o.type, ...OUT_TYPES])].map((t) => html`<option value=${t} selected=${t === o.type}>${t}</option>`)}</select>
          <input class="ag-cell" value=${o.desc || ''} placeholder="What it means" aria-label="Field meaning" onInput=${(e) => { const v = e.currentTarget.value; stage((d) => { d.outputs[i] = { ...d.outputs[i], desc: v }; }); }} />
          <${IconButton} icon="x" size="sm" label=${`Remove ${o.key}`} onClick=${() => stage((d) => { d.outputs.splice(i, 1); })} />
        </div>`)}
      </div>` : html`<div class="t-sm t-faint">Free-text answers only.</div>`}
      <div><${Button} size="sm" variant="secondary" icon="plus" onClick=${() => stage((d) => { d.outputs.push({ key: `field_${d.outputs.length + 1}`, type: 'text', desc: '' }); })}>Add a field<//></div>
      ${impact?.screens?.length ? html`<${Callout} tone="amber" icon="monitor">Changing outputs affects ${impact.screens.map((s) => s.screen.name).join(', ')}. Architect re-wires those blocks when you save.<//>` : null}
    <//>
  </div>`;
}
