// Workspace-wide UI signals that let tabs talk to the chat dock, drawers and preview
// without importing each other.
import { signal } from '../lib/html.js';

/** Prefill the composer (e.g. "Fix this error", "Apply 3 notes"). The chat dock consumes & clears it. */
export const composerText = signal('');
/** Context chip shown on the composer: { kind:'block'|'file'|'agent'|'comment'|'error', id, label, screenId? } */
export const composerContext = signal(null);
/** Ask the composer to focus itself (increment to trigger). */
export const composerFocus = signal(0);

/** Request a right-edge drawer: 'history' | 'connections' | 'comments' | 'logs' | null */
export const panelRequest = signal(null);

/** Shared preview state (App tab): current route, device and tool mode. */
export const previewState = signal({ route: null, device: 'desktop', mode: 'interact', actAs: 'admin' });

/** Bottom console in the App tab. */
export const consoleOpen = signal(false);

export function askArchitect(text, context = null) {
  composerText.value = text;
  composerContext.value = context;
  composerFocus.value++;
}
export function openPanel(name) { panelRequest.value = name; }
