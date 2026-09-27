// First-run: "How do you like to work?" — sets defaults only; nothing is locked.
import { html, useState } from '../../lib/html.js';
import { navigate, route } from '../../lib/router.js';
import { setPrefs, prefs, session } from '../../lib/store.js';
import { Button, Logo, Icon } from '../../ui/index.js';
import { cx } from '../../lib/util.js';
import { ExperiencePicker } from './parts/common.js';

const ROLE_CHIPS = [
  { id: 'founder', label: 'Founder', icon: 'rocket' }, { id: 'pm', label: 'Product manager', icon: 'layout-dashboard' },
  { id: 'developer', label: 'Developer', icon: 'code' }, { id: 'designer', label: 'Designer', icon: 'palette' },
  { id: 'ops', label: 'Operations', icon: 'settings' }, { id: 'sales', label: 'Sales & marketing', icon: 'megaphone' },
  { id: 'agency', label: 'Agency / freelancer', icon: 'briefcase' }, { id: 'student', label: 'Student', icon: 'graduation-cap' },
];

export default function Onboarding() {
  const [experience, setExperience] = useState(prefs.value.experience || 'balanced');
  const [role, setRole] = useState(prefs.value.role || null);
  const first = session.value?.name?.split(' ')[0];
  const done = (skip) => {
    setPrefs({ experience: skip ? prefs.value.experience : experience, role: skip ? prefs.value.role : role, onboarded: true });
    navigate(route.value.query.next || '/start', { replace: true });
  };
  return html`<div class="ap-onb paper-grid">
    <div class="ap-onb__top"><${Logo} href=${null} /><button class="link t-sm t-muted" onClick=${() => done(true)}>Skip for now</button></div>
    <main class="ap-onb__main anim-rise">
      <div class="ap-onb__eyebrow"><${Icon} name="sparkles" size=${14} />${first ? `Welcome, ${first}` : 'Welcome'}</div>
      <h1 class="ap-onb__title">How do you like to work?</h1>
      <p class="t-md t-muted ap-onb__sub">This only sets what you see first. Every detail stays one click away.</p>
      <${ExperiencePicker} value=${experience} onChange=${setExperience} />
      <div class="ap-onb__roles">
        <div class="t-sm t-strong">What best describes you? <span class="t-faint" style="font-weight:400">optional</span></div>
        <div class="row gap-8 wrap mt-8">
          ${ROLE_CHIPS.map((r) => html`<button type="button" class=${cx('chip', role === r.id && 'is-active')} aria-pressed=${role === r.id} onClick=${() => setRole(role === r.id ? null : r.id)}><${Icon} name=${r.icon} size=${13} />${r.label}</button>`)}
        </div>
      </div>
      <div class="ap-onb__foot">
        <span class="t-sm t-faint row gap-6"><${Icon} name="info" size=${14} />You can change this anytime in Settings → Experience.</span>
        <${Button} variant="primary" size="lg" iconRight="arrow-right" onClick=${() => done(false)}>Continue<//>
      </div>
    </main>
  </div>`;
}
