// Global UI signals shared across shells (command palette, helper panel, mobile rail).
import { signal } from '../lib/html.js';

export const paletteOpen = signal(false);
export const helperOpen = signal(false);   // project-aware Help slide-over
export const mobileRailOpen = signal(false);

export const openPalette = () => { paletteOpen.value = true; };
export const openHelper = () => { helperOpen.value = true; };
