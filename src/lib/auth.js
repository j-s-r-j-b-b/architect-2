// Authentication adapter.
//   Firebase mode: real Google / GitHub / email+password sign-in (Firebase Auth).
//   Local mode:    a demo account kept in this browser (no network).
import * as db from './db.js';
import { session, authReady, loadUserData, claimAnonProjects, flushSaves } from './store.js';
import { loadJSON, saveJSON, removeKey, slugify } from './util.js';

export const authMode = db.mode; // 'firebase' | 'local'
const LOCAL_KEY = 'a2:localUser';
let githubToken = null;

function toSession(u, provider) {
  if (!u) return null;
  return {
    uid: u.uid,
    name: u.displayName || (u.email ? u.email.split('@')[0] : 'Builder'),
    email: u.email || '',
    photo: u.photoURL || null,
    provider: provider || u.providerData?.[0]?.providerId || 'password',
    createdAt: u.metadata?.creationTime ? new Date(u.metadata.creationTime).getTime() : Date.now(),
  };
}

async function setSession(s) {
  const wasAnon = !session.value;
  flushSaves();
  session.value = s;
  await loadUserData();
  if (s && wasAnon) await claimAnonProjects();
}

/** Boot: resolve the current user, then load their data. */
export async function initAuth() {
  if (authMode === 'firebase') {
    const fb = await db.initFirebase();
    if (fb) {
      await new Promise((resolve) => {
        let first = true;
        fb.authMod.onAuthStateChanged(fb.auth, async (u) => {
          const s = toSession(u);
          if (first) { first = false; session.value = s; await loadUserData(); authReady.value = true; resolve(); }
          else if ((s?.uid || null) !== (session.value?.uid || null)) await setSession(s);
        });
      });
      return;
    }
  }
  session.value = loadJSON(LOCAL_KEY, null);
  await loadUserData();
  authReady.value = true;
}

function friendlyError(e) {
  const code = e?.code || '';
  const map = {
    'auth/popup-closed-by-user': 'The sign-in window was closed before finishing.',
    'auth/cancelled-popup-request': 'Another sign-in window is already open.',
    'auth/popup-blocked': 'Your browser blocked the sign-in window. Allow pop-ups for this site and try again.',
    'auth/unauthorized-domain': 'This domain is not yet authorised for sign-in in Firebase (Authentication → Settings → Authorized domains).',
    'auth/operation-not-allowed': 'This sign-in method is not enabled yet in the Firebase console.',
    'auth/invalid-credential': 'That email and password don’t match.',
    'auth/wrong-password': 'That email and password don’t match.',
    'auth/user-not-found': 'No account with that email yet — create one instead.',
    'auth/email-already-in-use': 'An account with that email already exists — sign in instead.',
    'auth/weak-password': 'Use at least 6 characters for your password.',
    'auth/invalid-email': 'That email address looks incomplete.',
    'auth/account-exists-with-different-credential': 'You already signed up with a different method for this email. Use that method, then connect GitHub from Connections.',
    'auth/network-request-failed': 'Network problem — check your connection and try again.',
  };
  const err = new Error(map[code] || e?.message || 'Sign-in failed. Please try again.');
  err.code = code;
  return err;
}

export async function signInWithGoogle() {
  if (authMode !== 'firebase') return signInDemo({ provider: 'google' });
  const fb = await db.initFirebase();
  try {
    const { GoogleAuthProvider, signInWithPopup } = fb.authMod;
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const res = await signInWithPopup(fb.auth, provider);
    await setSession(toSession(res.user, 'google'));
    return session.value;
  } catch (e) { throw friendlyError(e); }
}

export async function signInWithGitHub() {
  if (authMode !== 'firebase') return signInDemo({ provider: 'github' });
  const fb = await db.initFirebase();
  try {
    const { GithubAuthProvider, signInWithPopup } = fb.authMod;
    const provider = new GithubAuthProvider();
    provider.addScope('repo');
    provider.addScope('read:user');
    const res = await signInWithPopup(fb.auth, provider);
    const cred = GithubAuthProvider.credentialFromResult(res);
    if (cred?.accessToken) rememberGitHubToken(cred.accessToken);
    await setSession(toSession(res.user, 'github'));
    return session.value;
  } catch (e) { throw friendlyError(e); }
}

/** Connect GitHub to an already signed-in account (for repo import / push). Returns an access token. */
export async function linkGitHub() {
  if (authMode !== 'firebase') return null;
  const fb = await db.initFirebase();
  const { GithubAuthProvider, linkWithPopup, reauthenticateWithPopup } = fb.authMod;
  const provider = new GithubAuthProvider();
  provider.addScope('repo');
  provider.addScope('read:user');
  try {
    let res;
    try { res = await linkWithPopup(fb.auth.currentUser, provider); }
    catch (e) {
      if (e?.code === 'auth/provider-already-linked') res = await reauthenticateWithPopup(fb.auth.currentUser, provider);
      else throw e;
    }
    const cred = GithubAuthProvider.credentialFromResult(res);
    if (cred?.accessToken) rememberGitHubToken(cred.accessToken);
    return githubToken;
  } catch (e) { throw friendlyError(e); }
}

export async function signInWithEmail(email, password) {
  if (authMode !== 'firebase') return signInDemo({ email, provider: 'password' });
  const fb = await db.initFirebase();
  try {
    const res = await fb.authMod.signInWithEmailAndPassword(fb.auth, email, password);
    await setSession(toSession(res.user, 'password'));
    return session.value;
  } catch (e) { throw friendlyError(e); }
}

export async function signUpWithEmail(name, email, password) {
  if (authMode !== 'firebase') return signInDemo({ name, email, provider: 'password' });
  const fb = await db.initFirebase();
  try {
    const res = await fb.authMod.createUserWithEmailAndPassword(fb.auth, email, password);
    if (name) await fb.authMod.updateProfile(res.user, { displayName: name });
    await setSession({ ...toSession(res.user, 'password'), name: name || toSession(res.user).name });
    return session.value;
  } catch (e) { throw friendlyError(e); }
}

export async function sendPasswordReset(email) {
  if (authMode !== 'firebase') return true;
  const fb = await db.initFirebase();
  try { await fb.authMod.sendPasswordResetEmail(fb.auth, email); return true; } catch (e) { throw friendlyError(e); }
}

/** Local demo sign-in: no network; data stays in this browser. */
export async function signInDemo({ name, email, provider = 'demo' } = {}) {
  const nm = name || (email ? email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Demo Builder');
  const em = email || `${slugify(nm)}@demo.architect`;
  const s = { uid: `local_${slugify(em)}`, name: nm, email: em, photo: null, provider, createdAt: Date.now() };
  saveJSON(LOCAL_KEY, s);
  await setSession(s);
  return s;
}

export async function updateProfileName(name) {
  if (authMode === 'firebase') {
    const fb = await db.initFirebase();
    if (fb?.auth.currentUser) await fb.authMod.updateProfile(fb.auth.currentUser, { displayName: name });
  } else {
    const s = { ...loadJSON(LOCAL_KEY, {}), name };
    saveJSON(LOCAL_KEY, s);
  }
  session.value = { ...session.value, name };
}

export async function signOut() {
  flushSaves();
  forgetGitHubToken();
  if (authMode === 'firebase') {
    const fb = await db.initFirebase();
    if (fb) await fb.authMod.signOut(fb.auth);
  }
  removeKey(LOCAL_KEY);
  session.value = null;
  await loadUserData();
}

// ---------- GitHub token (kept for this browser session only) ----------
function rememberGitHubToken(t) { githubToken = t; try { sessionStorage.setItem('a2:gh', t); } catch {} }
function forgetGitHubToken() { githubToken = null; try { sessionStorage.removeItem('a2:gh'); } catch {} }
export function getGitHubToken() {
  if (githubToken) return githubToken;
  try { githubToken = sessionStorage.getItem('a2:gh'); } catch {}
  return githubToken;
}
