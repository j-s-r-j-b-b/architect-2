// Plan tab (/p/:id/plan/:sub) — Spec · Mockup · Workflow · Design · Docs
import { html } from '../../lib/html.js';
import { Tabs } from '../../ui/index.js';
import Spec from '../plan/Spec.js';
import Mockup from '../plan/Mockup.js';
import Workflow from '../plan/Workflow.js';
import Design from '../plan/Design.js';
import Docs from '../plan/Docs.js';

const SUBS = [
  { id: 'spec', label: 'Spec', icon: 'list-checks', C: Spec },
  { id: 'mockup', label: 'Mockup', icon: 'layout-dashboard', C: Mockup },
  { id: 'workflow', label: 'Workflow', icon: 'workflow', C: Workflow },
  { id: 'design', label: 'Design', icon: 'palette', C: Design },
  { id: 'docs', label: 'Docs', icon: 'file-text', C: Docs },
];

export default function PlanTab({ project, params = {} }) {
  const want = params.sub || params.a || 'spec';
  const sub = SUBS.find((s) => s.id === want) || SUBS[0];
  const promises = (project.plan?.promises || []).filter((x) => x.status !== 'deferred').length;
  const counts = { spec: promises || null, mockup: project.screens?.length || null, workflow: project.agents?.length || null, docs: project.plan?.artifacts?.length || null };
  const C = sub.C;
  return html`<div class="pl-root">
    <div class="pl-subnav">
      <${Tabs} variant="pill" value=${sub.id} tabs=${SUBS.map((s) => ({ id: s.id, label: s.label, icon: s.icon, count: counts[s.id], href: `/p/${project.id}/plan/${s.id}` }))} />
    </div>
    <div class="pl-body" key=${sub.id}><${C} project=${project} /></div>
  </div>`;
}
