// Inbox: things that need you, things that are ready, problems.
import { html, useState } from '../../lib/html.js';
import { AppPage } from '../../shells/AppShell.js';
import { inbox, markInbox, removeInbox, unreadCount, projects } from '../../lib/store.js';
import { navigate } from '../../lib/router.js';
import { PageHeader, Tabs, Button, IconButton, Empty, Icon } from '../../ui/index.js';
import { timeAgo, cx } from '../../lib/util.js';

const KINDS = { needs: { icon: 'hand', label: 'Needs you', tone: 'amber', ic: 'alert-circle' }, ready: { label: 'Ready', tone: 'green', ic: 'check-circle' }, problem: { label: 'Problems', tone: 'red', ic: 'alert-triangle' } };

export default function Inbox() {
  const [tab, setTab] = useState('all');
  const items = inbox.value;
  const list = items.filter((i) => tab === 'all' || (tab === 'unread' ? !i.read : i.kind === tab));
  const count = (k) => items.filter((i) => i.kind === k && !i.read).length || null;
  const open = (i) => { markInbox(i.id); if (i.href) navigate(i.href); };
  return html`<${AppPage} narrow>
    <${PageHeader} title="Inbox" subtitle="Approvals, finished builds and anything that needs a look." actions=${unreadCount.value ? html`<${Button} size="sm" icon="check" onClick=${() => markInbox('*')}>Mark all read<//>` : null} />
    <${Tabs} class="mb-16" value=${tab} onChange=${setTab} tabs=${[{ id: 'all', label: 'All', count: items.length || null }, { id: 'unread', label: 'Unread', count: unreadCount.value || null }, { id: 'needs', label: 'Needs you', count: count('needs') }, { id: 'ready', label: 'Ready', count: count('ready') }, { id: 'problem', label: 'Problems', count: count('problem') }]} />
    ${list.length ? html`<div class="ap-inbox">${list.map((i) => {
      const k = KINDS[i.kind] || KINDS.ready;
      return html`<div class=${cx('ap-inbox__item', !i.read && 'is-unread')}>
        <span class=${cx('ap-inbox__icon', `ap-tone--${k.tone}`)}><${Icon} name=${k.ic} size=${16} /></span>
        <button type="button" class="ap-inbox__main" onClick=${() => open(i)}>
          <span class="row gap-8"><span class="t-sm t-strong grow">${i.title}</span><span class="t-xs t-faint t-nowrap">${timeAgo(i.at)}</span></span>
          ${i.body ? html`<span class="t-sm t-muted">${i.body}</span>` : null}
          ${i.projectId && projects.value[i.projectId] ? html`<span class="t-xs t-faint row gap-4"><${Icon} name="folder" size=${11} />${projects.value[i.projectId].name}</span>` : null}
        </button>
        <div class="row gap-2 ap-inbox__actions">
          <${IconButton} size="sm" icon=${i.read ? 'circle-dot' : 'check'} label=${i.read ? 'Mark unread' : 'Mark read'} onClick=${() => markInbox(i.id, { read: !i.read })} />
          <${IconButton} size="sm" icon="x" label="Dismiss" onClick=${() => removeInbox(i.id)} />
        </div>
      </div>`;
    })}</div>` : html`<${Empty} icon="inbox" title=${tab === 'all' ? 'You’re all caught up' : 'Nothing here'} body="We’ll let you know when a build finishes, an agent needs approval or something breaks." />`}
  <//>`;
}
