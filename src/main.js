// Boot: theme → auth/session → mount.
import { html, render } from './lib/html.js';
import { applyTheme } from './lib/store.js';
import { initAuth } from './lib/auth.js';
import { App } from './app.js';

applyTheme();
window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);

const root = document.getElementById('app');
root.innerHTML = '';
render(html`<${App} />`, root);
initAuth().catch((e) => console.error('[boot] auth init failed', e));
