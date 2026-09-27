// Single import point for the view layer. Every module imports from here so
// there is exactly one Preact instance (resolved via the import map in index.html).
import { h, render, Fragment, createContext, toChildArray, cloneElement } from 'preact';
import {
  useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback, useContext, useReducer, useId, useErrorBoundary,
} from 'preact/hooks';
import { signal, computed, effect, batch, useSignal, useComputed, useSignalEffect } from '@preact/signals';
import htm from 'htm';

/** Tagged-template JSX alternative: html`<div class="x">${value}</div>` */
export const html = htm.bind(h);

export {
  h, render, Fragment, createContext, toChildArray, cloneElement,
  useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback, useContext, useReducer, useId, useErrorBoundary,
  signal, computed, effect, batch, useSignal, useComputed, useSignalEffect,
};
