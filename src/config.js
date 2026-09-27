// Runtime configuration.
//
// FIREBASE_CONFIG: paste the web-app config from
//   Firebase console → Project settings → General → Your apps → SDK setup and configuration → Config
// When it is null, Architect runs in local demo mode: sign-in and data live in this browser only.
// (Firebase web config values are public identifiers, not secrets — access is enforced by Firestore rules.)
export const FIREBASE_CONFIG = null;

export const APP = {
  name: 'Architect',
  version: '2.0',
  // Public base URL used for "live app" links. Falls back to the current origin.
  publicBase: typeof window !== 'undefined' ? window.location.origin : '',
  demoSpeed: 10, // simulated builds run this many times faster than their estimates
};
