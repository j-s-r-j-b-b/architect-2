// Runtime events emitted by the generated app while it runs in the preview
// (agent runs, form submits, board moves, crashes). The App tab console reads them.
import { signal } from '../lib/html.js';
import { uid } from '../lib/util.js';

/** [{id, at, projectId, level:'debug'|'info'|'warn'|'error', text, blockId?, file?}] */
export const gxEvents = signal([]);

export function pushGxEvent(projectId, level, text, extra = {}) {
  if (!projectId) return;
  const ev = { id: uid('ev'), at: Date.now(), projectId, level, text, ...extra };
  gxEvents.value = [...gxEvents.value.slice(-299), ev];
  return ev;
}

export function clearGxEvents(projectId) {
  gxEvents.value = gxEvents.value.filter((e) => e.projectId !== projectId);
}
