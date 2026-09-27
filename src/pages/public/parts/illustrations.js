// Small CSS/SVG illustrations for the marketing pages — no images, all theme-aware.
// Each one is driven by useLoop() and pauses when off-screen or when reduced motion is preferred.
import { html, useState, useEffect } from '../../../lib/html.js';
import { Icon, Ring, Switch } from '../../../ui/index.js';
import { IntegrationTile } from '../../../shells/ConnectSheet.js';
import { StatusPill } from '../../../ui/index.js';
import { cx } from '../../../lib/util.js';
import { useLoop, useRefInView, reducedMotion } from './common.js';

// ---------------------------------------------------------------------------
// 1 · Plan — promises tick in, then the quote chip appears
// ---------------------------------------------------------------------------
const PROMISES = ['Score every new lead', 'Explain each score', 'Draft follow-ups', 'Ask before sending'];
export function PlanIllo() {
  const [ref, on] = useRefInView();
  const s = useLoop(9, 620, on);
  return html`<div class="pb-illo" ref=${ref} aria-hidden="true">
    <div class="pb-pl">
      <div class="pb-pl__head"><span>Plan · 4 promises</span><span class="pb-pl__free">Free</span></div>
      ${PROMISES.map((p, i) => html`<div class=${cx('pb-pl__row', s > i && 'is-on')}>
        <span class="pb-pl__check"><${Icon} name="check" size=${10} stroke=${3} /></span>
        <span class="pb-pl__num">P${i + 1}</span><span class="t-truncate">${p}</span>
      </div>`)}
    </div>
    <div class=${cx('pb-quote-chip', s >= 5 && 'is-on')}><${Icon} name="receipt" size=${13} /><b>36–48 cr</b><span>· 9–14 min</span></div>
  </div>`;
}

// ---------------------------------------------------------------------------
// 2 · Build — wireframe blocks fill in, amber progress bar
// ---------------------------------------------------------------------------
const BLOCKS = ['wide3 h-s', 'k', 'k', 'k', 'wide2 h-l', 'agent h-l'];
export function BuildIllo() {
  const [ref, on] = useRefInView();
  const s = useLoop(10, 560, on);
  const done = s >= 7;
  const pct = Math.min(100, Math.round((s / 7) * 100));
  return html`<div class="pb-illo" ref=${ref} aria-hidden="true">
    <div class="pb-bd">
      <div class="pb-bd__bar"><i style=${{ width: pct + '%' }} class=${done ? 'is-done' : ''}></i></div>
      <div class="pb-bd__top">
        ${done
          ? html`<span class="pb-bd__state is-done"><${Icon} name="check-circle" size=${12} />Built · 4/4 promises verified</span>`
          : html`<span class="pb-bd__state"><span class="dot dot--amber dot--pulse" style="width:6px;height:6px"></span>Building · step ${Math.max(1, s * 2)} of 14</span>`}
      </div>
      <div class="pb-bd__grid">
        ${BLOCKS.map((b, i) => {
          const st = s < i + 1 ? 'pending' : s === i + 1 ? 'drafting' : 'done';
          return html`<span class=${cx('pb-bd__blk', b.split(' ').map((c) => 'pb-bd__blk--' + c), 'is-' + st)}></span>`;
        })}
      </div>
    </div>
  </div>`;
}

// ---------------------------------------------------------------------------
// 3 · Tune agents — a boundary switches on, creativity slides down, saved with evals
// ---------------------------------------------------------------------------
export function TuneIllo() {
  const [ref, on] = useRefInView();
  const s = useLoop(9, 650, on);
  const guard = s >= 2;
  const creativity = s >= 3 ? 30 : 62;
  return html`<div class="pb-illo" ref=${ref} aria-hidden="true">
    <div class="pb-ag">
      <div class="pb-ag__head">
        <span class="pb-ag__avatar"><${Icon} name="bot" size=${14} /></span>
        <div class="grow" style="min-width:0"><div class="pb-ag__name">Email Drafter</div><div class="pb-ag__role t-truncate">Writes follow-ups for hot leads</div></div>
        <span class="pb-ag__tiles"><${IntegrationTile} id="gmail" size="sm" /><${IntegrationTile} id="hubspot" size="sm" /></span>
      </div>
      <div class="pb-ag__row"><span>Creativity</span><span class="pb-ag__track"><i style=${{ left: creativity + '%' }}></i></span></div>
      <div class=${cx('pb-ag__rule', guard && 'is-on')}>
        <${Icon} name="lock" size=${12} /><span class="grow">Must ask before: <b>Sending email</b></span>
        <span class="pb-ag__switch"><i></i></span>
      </div>
      <div class=${cx('pb-ag__saved', s >= 5 && 'is-on')}><${Icon} name="check" size=${11} stroke=${3} />Saved as v3 · evals 0.91</div>
    </div>
  </div>`;
}

// ---------------------------------------------------------------------------
// 4 · Launch — readiness 0→9/9, then the live URL
// ---------------------------------------------------------------------------
const READY = ['Promises verified', 'Connections live', 'Secrets set'];
export function LaunchIllo() {
  const [ref, on] = useRefInView();
  const s = useLoop(13, 380, on);
  const n = Math.min(9, s);
  const live = s >= 10;
  return html`<div class="pb-illo" ref=${ref} aria-hidden="true">
    <div class="pb-ln">
      <div class="pb-ln__top">
        <${Ring} value=${(n / 9) * 100} size=${54} stroke=${5} tone=${n === 9 ? 'green' : 'blueprint'} label=${`${n}/9`} />
        <div class="col gap-4 grow" style="min-width:0">
          ${READY.map((r, i) => html`<div class=${cx('pb-ln__item', n >= (i + 1) * 3 && 'is-on')}><${Icon} name="check-circle" size=${12} /><span class="t-truncate">${r}</span></div>`)}
        </div>
      </div>
      <div class=${cx('pb-ln__url', live && 'is-live')}>
        <span class="pb-ln__dot"></span><span class="t-truncate">leaddesk.architect.space</span>
        <span class="pb-ln__badge">${live ? 'Live' : 'Ready'}</span>
      </div>
    </div>
  </div>`;
}

// ---------------------------------------------------------------------------
// X-ray: a UI card whose overlay reveals data → agent → code
// ---------------------------------------------------------------------------
const XROWS = [['Priya Raman', 'Northwind Health', 91], ['Daniel Okafor', 'Brightline', 86], ['Liam Chen', 'Quanta Robotics', 64]];
export function XRayIllo() {
  const [on, setOn] = useState(true);
  const [manual, setManual] = useState(false);
  const [ref, visible] = useRefInView();
  useEffect(() => {
    if (manual || !visible || reducedMotion()) return;
    const t = setInterval(() => setOn((v) => !v), 3200);
    return () => clearInterval(t);
  }, [manual, visible]);
  return html`<div class=${cx('pb-xray', on && 'is-on')} ref=${ref}>
    <div class="pb-xray__bar">
      <span class="pb-xray__app-name"><span class="pb-xray__logo"><${Icon} name="target" size=${11} /></span>Lead Desk</span>
      <${Switch} checked=${on} onChange=${(v) => { setManual(true); setOn(v); }} label=${html`<span class="row gap-4"><${Icon} name="scan-eye" size=${14} />X-ray</span>`} />
    </div>
    <div class="pb-xray__stage">
      <div class="pb-xray__block">
        <div class="pb-xray__bh"><span>Hot leads</span><span class="pb-xray__file">LeadTable.tsx</span></div>
        ${XROWS.map(([n, c, sc]) => html`<div class="pb-xray__tr"><span class="t-truncate"><b>${n}</b><span class="t-faint"> · ${c}</span></span><span class=${cx('pb-xray__score', sc >= 75 ? 'is-hot' : '')}>${sc}</span></div>`)}
      </div>
    </div>
    <div class="pb-xray__layers" aria-hidden=${!on}>
      <div class="pb-layer pb-layer--data"><${Icon} name="database" size=${14} /><span class="grow">Data · <b>leads</b> table</span><${StatusPill} status="sample" size="sm" /></div>
      <div class="pb-layer pb-layer--agent"><${Icon} name="bot" size=${14} /><span class="grow">Agent · <b>Lead Qualifier</b> scores each row</span></div>
      <div class="pb-layer pb-layer--code"><${Icon} name="file-code" size=${14} /><span class="grow t-mono">components/LeadTable.tsx</span><span class="pb-layer__diff">+42</span></div>
    </div>
  </div>`;
}

// ---------------------------------------------------------------------------
// Mini agent map: screens → manager → specialists → tools (SVG, scales with its box)
// ---------------------------------------------------------------------------
const W = 640;
function node(x, y, w, h, kind, label, sub, extra) {
  return html`<g class=${`pb-map__node pb-map__node--${kind}`} transform=${`translate(${x - w / 2},${y})`}>
    <rect width=${w} height=${h} rx="10" />
    ${extra || null}
    <text class="pb-map__label" x=${extra ? 34 : w / 2} y=${sub ? h / 2 - 2 : h / 2 + 4} text-anchor=${extra ? 'start' : 'middle'}>${label}</text>
    ${sub ? html`<text class="pb-map__sub" x=${extra ? 34 : w / 2} y=${h / 2 + 12} text-anchor=${extra ? 'start' : 'middle'}>${sub}</text>` : null}
  </g>`;
}
function edge(x1, y1, x2, y2, cls = '') {
  const my = (y1 + y2) / 2;
  return html`<path class=${'pb-map__edge ' + cls} d=${`M${x1} ${y1} C${x1} ${my} ${x2} ${my} ${x2} ${y2}`} />`;
}
function tile(color, letter) {
  return html`<g transform="translate(10,8)"><rect class="pb-map__tile" width="18" height="18" rx="5" style=${{ fill: color }} /><text class="pb-map__tile-t" x="9" y="13" text-anchor="middle">${letter}</text></g>`;
}
export function AgentMap() {
  return html`<figure class="pb-map" aria-label="Example agent map: three screens use a manager agent, which delegates to two specialists that use HubSpot, Apollo and Gmail">
    <svg viewBox=${`0 0 ${W} 372`} role="img">
      ${edge(130, 56, 320, 116, 'pb-map__edge--ui')}
      ${edge(320, 56, 320, 116, 'pb-map__edge--ui')}
      ${edge(510, 56, 320, 116, 'pb-map__edge--ui')}
      ${edge(320, 160, 190, 214, 'pb-map__edge--flow')}
      ${edge(320, 160, 450, 214, 'pb-map__edge--flow')}
      ${edge(190, 258, 96, 314)}
      ${edge(190, 258, 300, 314)}
      ${edge(450, 258, 300, 314)}
      ${edge(450, 258, 520, 314, 'pb-map__edge--gate')}
      ${node(130, 20, 150, 36, 'screen', 'Leads screen')}
      ${node(320, 20, 150, 36, 'screen', 'Outreach')}
      ${node(510, 20, 150, 36, 'screen', 'Insights')}
      ${node(320, 116, 220, 44, 'agent', 'Lead Desk Manager', 'Routes questions to specialists')}
      ${node(190, 214, 190, 44, 'agent', 'Lead Qualifier', 'Scores leads 0–100')}
      ${node(450, 214, 190, 44, 'agent', 'Email Drafter', 'Drafts follow-ups')}
      ${node(96, 314, 132, 34, 'tool', 'Apollo', null, tile('#1B1B1B', 'A'))}
      ${node(300, 314, 132, 34, 'tool', 'HubSpot', null, tile('#FF7A59', 'H'))}
      ${node(520, 314, 132, 34, 'tool', 'Gmail', null, tile('#EA4335', 'G'))}
      <g class="pb-map__gate" transform="translate(452,280)">
        <rect width="78" height="20" rx="10" />
        <text x="39" y="14" text-anchor="middle">asks first</text>
      </g>
    </svg>
    <figcaption class="pb-map__legend">
      <span><i class="pb-lg pb-lg--screen"></i>Screen</span>
      <span><i class="pb-lg pb-lg--agent"></i>Agent</span>
      <span><i class="pb-lg pb-lg--tool"></i>Tool</span>
      <span><i class="pb-lg pb-lg--gate"></i>Needs a human</span>
    </figcaption>
  </figure>`;
}

// ---------------------------------------------------------------------------
// Composed sections used on several pages
// ---------------------------------------------------------------------------
export const STEPS = [
  { n: '01', title: 'Plan', body: 'Answer two or three questions. Get numbered promises and an itemised quote — before a single credit is spent.', meta: 'Always free', icon: 'list-checks', Illo: PlanIllo },
  { n: '02', title: 'Build', body: 'Watch screens, data and agents take shape step by step. Pause, stop or change course at any point.', meta: '≈ 9–14 min for a 3-screen app', icon: 'blocks', Illo: BuildIllo },
  { n: '03', title: 'Tune agents', body: 'Give each agent a job, tools and boundaries in plain words — or open the code behind them.', meta: 'Tested with evals first', icon: 'bot', Illo: TuneIllo },
  { n: '04', title: 'Launch', body: 'A readiness check explains every item, then you get a live URL. Roll back to any checkpoint.', meta: 'Staging & production', icon: 'rocket', Illo: LaunchIllo },
];

export function HowSteps() {
  return html`<ol class="pb-steps">
    ${STEPS.map((s) => html`<li class="pb-step">
      <${s.Illo} />
      <div class="pb-step__body">
        <div class="pb-step__n"><span>${s.n}</span><span class="pb-step__line"></span></div>
        <h3 class="pb-step__title">${s.title}</h3>
        <p class="pb-step__text">${s.body}</p>
        <div class="pb-step__meta"><${Icon} name=${s.icon} size=${13} />${s.meta}</div>
      </div>
    </li>`)}
  </ol>`;
}

export const TRUST = [
  { icon: 'receipt', title: 'Quote before you spend', body: 'Every build is priced line by line. Set a cap and we pause and ask at 80%.' },
  { icon: 'eye', title: 'Watch every step — no black box', body: 'See each screen, agent and test take shape. Stop anytime and keep what’s done.' },
  { icon: 'undo', title: 'Undo anything', body: 'Every change is a checkpoint. Roll back in one click — restores never delete.' },
  { icon: 'code', title: 'Your code, any framework', body: 'Real code in your GitHub. Agents in LangGraph, CrewAI, OpenAI Agents SDK and more.' },
];
export function TrustStrip() {
  return html`<div class="pb-trust">
    ${TRUST.map((t) => html`<div class="pb-trust__item">
      <span class="pb-trust__icon"><${Icon} name=${t.icon} size=${17} /></span>
      <div><div class="pb-trust__title">${t.title}</div><p class="pb-trust__body">${t.body}</p></div>
    </div>`)}
  </div>`;
}
