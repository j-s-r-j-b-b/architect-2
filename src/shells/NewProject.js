// /new?prompt=…&template=…&skipPlan=1 — creates a project (works signed out) and opens its Plan tab.
import { html, useEffect } from '../lib/html.js';
import { navigate, route } from '../lib/router.js';
import { projectsReady } from '../lib/store.js';
import { startProject } from '../engine/conversation.js';
import { Logo } from '../ui/index.js';

export default function NewProject() {
  const ready = projectsReady.value;
  useEffect(() => {
    if (!ready) return;
    const q = route.value.query;
    let attachments = [];
    try { attachments = JSON.parse(sessionStorage.getItem('a2:pendingAttachments') || '[]'); sessionStorage.removeItem('a2:pendingAttachments'); } catch {}
    if (!q.prompt && !q.template) { navigate('/start', { replace: true }); return; }
    const p = startProject({ prompt: q.prompt || '', templateId: q.template, skipPlan: q.skipPlan === '1', attachments });
    navigate(`/p/${p.id}/plan`, { replace: true });
  }, [ready]);
  return html`<div class="route-loading"><div class="col gap-12" style="align-items:center"><${Logo} href=${null} /><span class="t-muted t-md">Setting up your project…</span><span class="spinner"></span></div></div>`;
}
