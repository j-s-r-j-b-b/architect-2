// Persistence adapter.
//   mode === 'firebase' → Cloud Firestore (real, multi-device, shareable published apps)
//   mode === 'local'    → localStorage (demo mode, this browser only)
// Projects are stored as JSON strings so arbitrary nested structures survive Firestore's type rules.
import { FIREBASE_CONFIG } from '../config.js';
import { loadJSON, saveJSON } from './util.js';

const FB_VERSION = '11.0.2';
export const mode = FIREBASE_CONFIG ? 'firebase' : 'local';

let fb = null;
let fbPromise = null;

/** Lazily load and initialise Firebase (only when configured). */
export function initFirebase() {
  if (!FIREBASE_CONFIG) return Promise.resolve(null);
  if (fb) return Promise.resolve(fb);
  if (!fbPromise) {
    const base = `https://www.gstatic.com/firebasejs/${FB_VERSION}`;
    fbPromise = Promise.all([
      import(`${base}/firebase-app.js`),
      import(`${base}/firebase-auth.js`),
      import(`${base}/firebase-firestore.js`),
    ]).then(([appMod, authMod, fsMod]) => {
      const app = appMod.initializeApp(FIREBASE_CONFIG);
      fb = { app, auth: authMod.getAuth(app), db: fsMod.getFirestore(app), authMod, fsMod };
      return fb;
    }).catch((err) => {
      console.error('[db] Firebase failed to load — falling back to local mode', err);
      fbPromise = null;
      return null;
    });
  }
  return fbPromise;
}
export const getFirebase = () => fb;
const useFirebase = () => mode === 'firebase' && fb;

// ---------- Local helpers ----------
const lk = (uid, what) => `a2:u:${uid}:${what}`;

// ---------- Projects ----------
export async function listProjects(uid) {
  if (useFirebase() && uid !== 'anon') {
    const { collection, getDocs } = fb.fsMod;
    const snap = await getDocs(collection(fb.db, 'users', uid, 'projects'));
    const out = {};
    snap.forEach((d) => { try { out[d.id] = JSON.parse(d.data().json); } catch {} });
    return out;
  }
  return loadJSON(lk(uid, 'projects'), {});
}

export async function saveProject(uid, project) {
  if (useFirebase() && uid !== 'anon') {
    const { doc, setDoc } = fb.fsMod;
    await setDoc(doc(fb.db, 'users', uid, 'projects', project.id), {
      json: JSON.stringify(project), name: project.name || '', updatedAt: project.updatedAt || Date.now(),
    });
    return;
  }
  const all = loadJSON(lk(uid, 'projects'), {});
  all[project.id] = project;
  if (!saveJSON(lk(uid, 'projects'), all)) console.warn('[db] localStorage is full — project not saved');
}

export async function deleteProject(uid, id) {
  if (useFirebase() && uid !== 'anon') {
    const { doc, deleteDoc } = fb.fsMod;
    await deleteDoc(doc(fb.db, 'users', uid, 'projects', id));
    return;
  }
  const all = loadJSON(lk(uid, 'projects'), {});
  delete all[id];
  saveJSON(lk(uid, 'projects'), all);
}

// ---------- User document (prefs, wallet, inbox) ----------
export async function loadUserDoc(uid) {
  if (useFirebase() && uid !== 'anon') {
    const { doc, getDoc } = fb.fsMod;
    const s = await getDoc(doc(fb.db, 'users', uid));
    if (!s.exists()) return null;
    try { return JSON.parse(s.data().json); } catch { return null; }
  }
  return loadJSON(lk(uid, 'doc'), null);
}

export async function saveUserDoc(uid, data) {
  if (useFirebase() && uid !== 'anon') {
    const { doc, setDoc } = fb.fsMod;
    await setDoc(doc(fb.db, 'users', uid), { json: JSON.stringify(data), updatedAt: Date.now() });
    return;
  }
  saveJSON(lk(uid, 'doc'), data);
}

// ---------- Published apps (public, read by anyone with the link) ----------
export async function publishApp(slug, payload) {
  const data = { ...payload, slug, publishedAt: Date.now() };
  if (useFirebase() && payload.ownerId !== 'anon') {
    const { doc, setDoc } = fb.fsMod;
    await setDoc(doc(fb.db, 'published', slug), { ownerId: payload.ownerId, json: JSON.stringify(data), updatedAt: Date.now() });
    return data;
  }
  const all = loadJSON('a2:published', {});
  all[slug] = data;
  saveJSON('a2:published', all);
  return data;
}

export async function getPublished(slug) {
  if (mode === 'firebase') {
    await initFirebase();
    if (fb) {
      const { doc, getDoc } = fb.fsMod;
      try {
        const s = await getDoc(doc(fb.db, 'published', slug));
        if (s.exists()) return JSON.parse(s.data().json);
      } catch (e) { console.warn('[db] getPublished', e); }
    }
  }
  return loadJSON('a2:published', {})[slug] || null;
}

export async function unpublishApp(slug) {
  if (useFirebase()) {
    const { doc, deleteDoc } = fb.fsMod;
    try { await deleteDoc(doc(fb.db, 'published', slug)); } catch (e) { console.warn(e); }
  }
  const all = loadJSON('a2:published', {});
  delete all[slug];
  saveJSON('a2:published', all);
}

/** Is a slug free? (used by "Rename URL") */
export async function isSlugAvailable(slug, ownerId) {
  const existing = await getPublished(slug);
  return !existing || existing.ownerId === ownerId;
}
