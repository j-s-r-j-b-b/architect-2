// Public (logged-out) shell: sticky top nav + footer. Logged-in users see "Open app".
import { html, useState, useEffect } from '../lib/html.js';
import { Link, route } from '../lib/router.js';
import { session, prefs, setPrefs, resolvedTheme } from '../lib/store.js';
import { Logo, Button, IconButton, Menu, Icon } from '../ui/index.js';
import { PERSONAS, TEMPLATES } from '../engine/catalog.js';
import { cx } from '../lib/util.js';

export function ThemeToggle({ size = 'md' }) {
  const t = resolvedTheme();
  return html`<${IconButton} size=${size} icon=${t === 'dark' ? 'sun' : 'moon'} label=${t === 'dark' ? 'Light mode' : 'Dark mode'} tipPos="bottom" onClick=${() => setPrefs({ theme: t === 'dark' ? 'light' : 'dark' })} />`;
}

/** Tab titles for public pages (the workspace sets its own, which otherwise leaks back here). */
function publicTitle(path = '/') {
  const seg = path.split('/').filter(Boolean);
  if (!seg.length) return 'Architect — build agentic apps you can trust';
  if (seg[0] === 'for' && PERSONAS[seg[1]]) return `Architect for ${PERSONAS[seg[1]].label}`;
  if (seg[0] === 'templates' && seg[1]) { const t = TEMPLATES.find((x) => x.id === seg[1]); if (t) return `${t.title} template · Architect`; }
  if (seg[0] === 'marketplace' && seg[1]) return `${seg[1].split('-').map((w) => (w[0] || '').toUpperCase() + w.slice(1)).join(' ')} · Marketplace · Architect`;
  const names = { pricing: 'Pricing', templates: 'Templates', marketplace: 'Marketplace', enterprise: 'Enterprise', help: 'Docs & help' };
  return `${names[seg[0]] || 'Architect'}${names[seg[0]] ? ' · Architect' : ''}`;
}

export function PublicShell({ children }) {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => { setMenu(false); if (!route.value.path.startsWith('/tour')) document.title = publicTitle(route.value.path); }, [route.value.path]);
  prefs.value; // re-render on theme change
  const me = session.value;
  const personaItems = Object.entries(PERSONAS).map(([id, p]) => ({ label: p.label, href: `/for/${id}`, icon: { agencies: 'briefcase', founders: 'rocket', sales: 'target', support: 'headphones', hr: 'users', developers: 'code' }[id] }));
  personaItems.push({ divider: true }, { label: 'Enterprise', href: '/enterprise', icon: 'building' });
  const links = html`
    <${Link} href="/#how" class="pub-nav__link" activeClass="">How it works<//>
    <${Link} href="/templates" class="pub-nav__link">Templates<//>
    <${Link} href="/marketplace" class="pub-nav__link">Marketplace<//>
    <${Menu} align="bottom-start" width=${220} items=${personaItems} trigger=${(open, toggle) => html`<button class=${cx('pub-nav__link', open && 'is-active')} onClick=${toggle}>For teams <${Icon} name="chevron-down" size=${14} /></button>`} />
    <${Link} href="/pricing" class="pub-nav__link">Pricing<//>
    <${Link} href="/help" class="pub-nav__link">Docs<//>`;
  return html`<div class="pub">
    <header class=${cx('pub-nav', scrolled && 'is-scrolled')}>
      <div class="pub-nav__inner">
        <${Logo} />
        <nav class="pub-nav__links" aria-label="Main">${links}</nav>
        <div class="pub-nav__right">
          <${ThemeToggle} />
          ${me
            ? html`<${Button} variant="primary" href="/start" iconRight="arrow-right">Open app<//>`
            : html`<${Button} variant="ghost" href="/login" class="hide-sm">Sign in<//><${Button} variant="primary" href="/signup">Start building<//>`}
          <${IconButton} class="pub-nav__burger" icon=${menu ? 'x' : 'menu'} label="Menu" onClick=${() => setMenu(!menu)} />
        </div>
      </div>
      <div class=${cx('pub-mobile-menu', menu && 'is-open')}>${links}${!me ? html`<${Link} href="/login" class="pub-nav__link">Sign in<//>` : null}</div>
    </header>
    <main class="pub-main">${children}</main>
    <${PublicFooter} />
  </div>`;
}

export function PublicFooter() {
  return html`<footer class="pub-footer">
    <div class="pub-footer__inner">
      <div class="col gap-12">
        <${Logo} />
        <p class="t-md t-muted" style="max-width:280px">Describe it. Approve the plan and the price. Watch it build. Own every layer.</p>
      </div>
      <div class="pub-footer__col"><h4>Product</h4><a href="/tour">Reviewer guide</a><a href="/#how">How it works</a><a href="/templates">Templates</a><a href="/marketplace">Marketplace</a><a href="/pricing">Pricing</a><a href="/start/import">Import a project</a></div>
      <div class="pub-footer__col"><h4>For</h4>${Object.entries(PERSONAS).map(([id, p]) => html`<a href=${`/for/${id}`}>${p.label}</a>`)}</div>
      <div class="pub-footer__col"><h4>Build</h4><a href="/agents">Agents</a><a href="/connections">Integrations & MCP</a><a href="/help">Docs & guides</a><a href="/help#status">Status</a></div>
      <div class="pub-footer__col"><h4>Company</h4><a href="/enterprise">Enterprise</a><a href="/help#contact">Contact</a><a href="/help#security">Security</a><a href="/help#terms">Terms & privacy</a></div>
    </div>
    <div class="pub-footer__bottom">
      <span>Architect 2.0 — concept prototype built for a product design assignment.</span>
      <span>Made with care · ${new Date().getFullYear()}</span>
    </div>
  </footer>`;
}
