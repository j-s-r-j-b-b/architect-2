// Block registry: type → component (see BLOCK_PROPS in src/engine/schema.js).
import { html } from '../../lib/html.js';
import { Icon } from '../../ui/icons.js';
import { HeaderBlock, HeroBlock, KpisBlock, TextBlock, StepsBlock, ListBlock, DetailBlock } from './basic.js';
import { TableBlock } from './table.js';
import { ChartBlock } from './chart.js';
import { FormBlock } from './form.js';
import { AgentChatBlock, AgentActivityBlock } from './agent.js';
import { KanbanBlock, CardsBlock, CalendarBlock } from './boards.js';

export { Wireframe } from './wire.js';
export { chartSeries } from './chart.js';

export const BLOCKS = {
  header: HeaderBlock,
  hero: HeroBlock,
  kpis: KpisBlock,
  table: TableBlock,
  chart: ChartBlock,
  form: FormBlock,
  agentChat: AgentChatBlock,
  agentActivity: AgentActivityBlock,
  kanban: KanbanBlock,
  cards: CardsBlock,
  list: ListBlock,
  detail: DetailBlock,
  text: TextBlock,
  calendar: CalendarBlock,
  steps: StepsBlock,
};

/** Neutral placeholder for block types this renderer doesn't know. */
export function UnknownBlock({ block }) {
  return html`<div class="gx-card gx-unknown">
    <${Icon} name="box" size=${16} />
    <div><strong>${block.title || 'Untitled block'}</strong><span>Type “${block.type}” can’t be previewed yet.</span></div>
  </div>`;
}
