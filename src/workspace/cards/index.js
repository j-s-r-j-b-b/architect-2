// Chat card dispatcher: one component per CHAT_TYPES entry (see src/engine/schema.js).
import { html, useErrorBoundary } from '../../lib/html.js';
import { Icon } from '../../ui/index.js';
import { QuestionsCard, PlanCard, ScopeCard, QuoteCard } from './PlanCards.js';
import { ProgressCard, ReceiptCard, FixCard, LiveRunCard } from './RunCards.js';
import { TextMessage, SystemNotice, ApprovalCard, CheckpointCard, ChangeCard, ArchitectMark } from './MiscCards.js';

const CARDS = {
  text: TextMessage, questions: QuestionsCard, plan: PlanCard, scope: ScopeCard, quote: QuoteCard,
  progress: ProgressCard, receipt: ReceiptCard, fix: FixCard, approval: ApprovalCard,
  checkpoint: CheckpointCard, change: ChangeCard, system: SystemNotice,
  promises: PlanCard, // legacy alias
};

export function MessageCard({ msg, project }) {
  const [err, reset] = useErrorBoundary((e) => console.error('[chat card]', msg.type, e));
  if (err) return html`<div class="ws-lazy-error"><${Icon} name="alert-triangle" size=${14} /><span>This message couldn’t be shown.</span><button class="link t-sm" onClick=${reset}>Retry</button></div>`;
  const C = CARDS[msg.type] || TextMessage;
  const wrapped = msg.type !== 'text' && msg.type !== 'system' && msg.type !== 'checkpoint';
  return html`<div class=${`ws-item ws-item--${msg.type}`} id=${`msg-${msg.id}`}>
    ${wrapped ? html`<div class="ws-msg ws-msg--ai ws-msg--card">
      <${ArchitectMark} />
      <div class="ws-msg__body">
        ${msg.text && ['progress', 'fix', 'approval'].includes(msg.type) ? html`<p class="ws-ai-text">${msg.text}</p>` : null}
        <${C} msg=${msg} project=${project} />
      </div>
    </div>` : html`<${C} msg=${msg} project=${project} />`}
  </div>`;
}

export { LiveRunCard, ArchitectMark };
