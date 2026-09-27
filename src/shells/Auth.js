// Authentication UI: /login, /signup, the in-flow sign-in sheet and requireAuth().
// Real Google / GitHub / email sign-in when Firebase is configured; demo accounts otherwise.
import { html, useState } from '../lib/html.js';
import { navigate, route } from '../lib/router.js';
import { session, prefs, getProject } from '../lib/store.js';
import { authMode, signInWithGoogle, signInWithGitHub, signInWithEmail, signUpWithEmail, sendPasswordReset, signInDemo } from '../lib/auth.js';
import { Button, Input, Logo, Icon, Modal, openModal, toast, Callout, Badge } from '../ui/index.js';
import { fmtRange } from '../lib/util.js';

const GOOGLE_G = html`<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z"/></svg>`;

function afterSignIn(next) {
  const dest = next && next.startsWith('/') ? next : '/start';
  if (!prefs.value.onboarded) navigate(`/onboarding?next=${encodeURIComponent(dest)}`, { replace: true });
  else navigate(dest, { replace: true });
}

/** Provider buttons + email form. mode: 'login' | 'signup'. onDone called after success. */
export function AuthForm({ mode = 'login', onDone, compact }) {
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmail, setShowEmail] = useState(!compact);

  const run = async (key, fn) => {
    setBusy(key); setError('');
    try { await fn(); onDone && onDone(); }
    catch (e) { setError(e.message || 'Something went wrong.'); }
    finally { setBusy(null); }
  };
  const submitEmail = (e) => {
    e.preventDefault();
    if (!email.includes('@')) { setError('Enter a valid email address.'); return; }
    if (authMode === 'firebase' && password.length < 6) { setError('Use at least 6 characters for your password.'); return; }
    run('email', () => (mode === 'signup' ? signUpWithEmail(name.trim(), email.trim(), password) : signInWithEmail(email.trim(), password)));
  };
  const demo = authMode !== 'firebase';

  return html`<div class="col gap-12">
    <${Button} variant="secondary" size="lg" full class="auth__provider" loading=${busy === 'google'} onClick=${() => run('google', () => (demo ? signInDemo({ name: name || undefined, email: email || undefined, provider: 'google' }) : signInWithGoogle()))}>
      ${busy === 'google' ? null : GOOGLE_G}<span class="grow t-center" style="margin-right:18px">Continue with Google</span>
    <//>
    <${Button} variant="secondary" size="lg" full class="auth__provider" loading=${busy === 'github'} onClick=${() => run('github', () => (demo ? signInDemo({ name: name || undefined, email: email || undefined, provider: 'github' }) : signInWithGitHub()))}>
      ${busy === 'github' ? null : html`<${Icon} name="github" size=${18} />`}<span class="grow t-center" style="margin-right:18px">Continue with GitHub</span>
    <//>
    <div class="or-divider">or</div>
    ${showEmail ? html`<form class="col gap-12" onSubmit=${submitEmail}>
      ${mode === 'signup' ? html`<${Input} label="Your name" placeholder="Meera Shah" value=${name} onValue=${setName} autocomplete="name" />` : null}
      <${Input} label="Work email" type="email" placeholder="you@company.com" value=${email} onValue=${setEmail} autocomplete="email" />
      ${!demo ? html`<${Input} label="Password" type="password" placeholder=${mode === 'signup' ? 'At least 6 characters' : 'Your password'} value=${password} onValue=${setPassword} autocomplete=${mode === 'signup' ? 'new-password' : 'current-password'} />` : null}
      <${Button} type="submit" variant="primary" size="lg" full loading=${busy === 'email'}>${mode === 'signup' ? 'Create account' : 'Sign in with email'}<//>
      ${mode === 'login' && !demo ? html`<button type="button" class="link t-sm" style="align-self:flex-start" onClick=${async () => { if (!email) { setError('Type your email first, then click “Forgot password”.'); return; } try { await sendPasswordReset(email); toast('Password reset email sent', { tone: 'success' }); } catch (e) { setError(e.message); } }}>Forgot password?</button>` : null}
    </form>` : html`<${Button} variant="ghost" full icon="mail" onClick=${() => setShowEmail(true)}>Continue with email<//>`}
    ${error ? html`<${Callout} tone="red" icon="alert-circle">${error}<//>` : null}
    ${demo ? html`<div class="auth__mode-note"><${Icon} name="info" size=${13} /><span><b>Demo mode.</b> Your account and projects stay in this browser. Connect Firebase to enable real Google sign-in and a shared database.</span></div>` : null}
  </div>`;
}

function AuthAside({ projectId }) {
  const p = projectId ? getProject(projectId) : null;
  const q = p?.plan?.quote;
  return html`<aside class="auth__aside paper-grid">
    ${p ? html`<div class="card card--padded anim-rise" style="max-width:420px">
      <div class="row gap-8 mb-8"><${Badge} tone="blueprint" icon="check">Your plan is saved<//></div>
      <div class="t-xl t-strong">${p.name}</div>
      <p class="t-md t-muted mt-4">${p.plan.summary || p.prompt}</p>
      <div class="row gap-16 mt-16 t-sm">
        <span class="row gap-6"><${Icon} name="list-checks" size=${15} />${p.plan.promises.length} promises</span>
        <span class="row gap-6"><${Icon} name="bot" size=${15} />${p.agents.length} agents</span>
        ${q ? html`<span class="row gap-6"><${Icon} name="coins" size=${15} />${fmtRange(q.credits)} credits</span>` : null}
      </div>
      <p class="t-sm t-faint mt-16">Sign in to build it. Nothing is charged until you approve the quote.</p>
    </div>` : html`<div class="col gap-24" style="max-width:440px">
      <h2 class="t-display" style="font-size:44px;line-height:1.05">Build agentic apps<br/><i>you can trust.</i></h2>
      ${[['coins', 'A price before you spend', 'Every build starts with an itemised quote and a budget cap.'], ['history', 'Undo anything', 'Checkpoints restore code, data and agents — nothing is ever deleted.'], ['scan-eye', 'Every layer, open', 'Click any part of your app to see its data, its agent and its code.'], ['github', 'Your code, your repo', 'Git, pull requests and agents in any framework.']].map(([ic, t, b]) => html`<div class="row-top gap-12">
        <div style="width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:var(--surface);border:1px solid var(--border);flex-shrink:0"><${Icon} name=${ic} size=${16} class="t-blueprint" /></div>
        <div><div class="t-strong">${t}</div><div class="t-md t-muted">${b}</div></div></div>`)}
    </div>`}
  </aside>`;
}

export function LoginPage() {
  const next = route.value.query.next;
  if (session.value) { setTimeout(() => navigate(next || '/start', { replace: true }), 0); return null; }
  return html`<div class="auth">
    <div class="auth__form">
      <${Logo} />
      <div class="auth__form-inner">
        <div><h1 class="auth__title">Welcome back</h1><p class="t-muted mt-4">Sign in to keep building.</p></div>
        <${AuthForm} mode="login" onDone=${() => afterSignIn(next)} />
        <p class="t-sm t-muted">New to Architect? <a class="link" href=${`/signup${next ? `?next=${encodeURIComponent(next)}` : ''}`}>Create an account</a></p>
      </div>
    </div>
    <${AuthAside} projectId=${route.value.query.project} />
  </div>`;
}

export function SignupPage() {
  const next = route.value.query.next;
  if (session.value) { setTimeout(() => navigate(next || '/start', { replace: true }), 0); return null; }
  return html`<div class="auth">
    <div class="auth__form">
      <${Logo} />
      <div class="auth__form-inner">
        <div><h1 class="auth__title">Start building</h1><p class="t-muted mt-4">Free to start. No credit card. Plans and quotes are always free.</p></div>
        <${AuthForm} mode="signup" onDone=${() => afterSignIn(next)} />
        <p class="t-sm t-muted">Already have an account? <a class="link" href=${`/login${next ? `?next=${encodeURIComponent(next)}` : ''}`}>Sign in</a></p>
        <p class="t-xs t-faint">By continuing you agree to the Terms and acknowledge the Privacy Policy.</p>
      </div>
    </div>
    <${AuthAside} projectId=${route.value.query.project} />
  </div>`;
}

/** In-flow sign-in sheet (e.g. pressing "Build it" while anonymous). */
function SignInSheet({ close, reason, projectId }) {
  const p = projectId ? getProject(projectId) : null;
  return html`<${Modal} size="sm" onClose=${() => close(false)} title=${reason || 'Sign in to continue'} subtitle=${p ? `Your plan for “${p.name}” is saved — nothing is lost.` : 'It takes a few seconds.'} icon="lock">
    <${AuthForm} mode="signup" compact onDone=${() => close(true)} />
  <//>`;
}

/**
 * Resolve true when the user is signed in (opening the sign-in sheet if needed).
 *   if (!(await requireAuth({ reason: 'Sign in to build your app', projectId }))) return;
 */
export function requireAuth({ reason, projectId } = {}) {
  if (session.value) return Promise.resolve(true);
  return new Promise((resolve) => {
    openModal(SignInSheet, { reason, projectId }, { onClose: (ok) => resolve(!!ok && !!session.value), persist: true });
  });
}
