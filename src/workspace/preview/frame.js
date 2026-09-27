// Device stage for the App tab: measures the canvas, picks a natural device size and
// CSS-scales the frame (browser chrome / tablet / phone) to fit. Also the QR modal.
import { html, useState, useEffect } from '../../lib/html.js';
import { Icon, Modal, Badge, CopyButton, Button } from '../../ui/index.js';

const PAD = 28;

function useBox(ref) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setBox((b) => (b.w === el.clientWidth && b.h === el.clientHeight ? b : { w: el.clientWidth, h: el.clientHeight }));
    read();
    if (typeof ResizeObserver === 'undefined') { window.addEventListener('resize', read); return () => window.removeEventListener('resize', read); }
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return box;
}

/** Natural frame size (fw×fh) and the scale that fits it in the available box. */
export function fitDevice(device, w, h) {
  // floor + 2px slack: fractional layout widths must never trigger scrollbars (which would re-measure and oscillate)
  const aw = Math.max(220, Math.floor(w - PAD * 2) - 2);
  const ah = Math.max(360, Math.floor(h - PAD * 2) - 2);
  if (device === 'mobile') {
    const fw = 414, fh = 868;
    return { s: Math.min(1, aw / fw, Math.max(0.62, ah / fh)), fw, fh };
  }
  if (device === 'tablet') {
    const fw = 848;
    const s = Math.min(1, aw / fw);
    return { s, fw, fh: Math.round(Math.min(1208, Math.max(660, ah / s))) };
  }
  const fw = aw >= 1040 ? aw : 1200;
  const s = Math.min(1, aw / fw);
  return { s, fw, fh: Math.round(Math.max(540, ah / s)) };
}

export function DeviceStage({ device = 'desktop', url, stageRef, children, overlay }) {
  const box = useBox(stageRef);
  const f = fitDevice(device, box.w, box.h);
  return html`<div class="pv-stage" ref=${stageRef}>
    ${box.w ? html`<div class="pv-fit" style=${{ width: `${Math.floor(f.fw * f.s)}px`, height: `${Math.floor(f.fh * f.s)}px` }}>
      <div class=${`pv-device pv-device--${device}`} style=${{ width: `${f.fw}px`, height: `${f.fh}px`, transform: `scale(${f.s})` }}>
        ${device === 'desktop' ? html`<div class="pv-chrome">
          <span class="pv-dots" aria-hidden="true"><i></i><i></i><i></i></span>
          <div class="pv-url" title=${url}><${Icon} name="lock" size=${12} /><span>${url}</span></div>
          <span class="pv-chrome__tag">Prototype: simulated</span>
        </div>` : null}
        <div class="pv-glass">
          ${device === 'mobile' ? html`<div class="pv-status" aria-hidden="true"><span>9:41</span><span class="pv-notch"></span><span class="pv-status__r"><i></i><i></i><i></i><b></b></span></div>` : null}
          <div class="pv-screen">${children}</div>
          ${device === 'mobile' ? html`<span class="pv-home" aria-hidden="true"></span>` : null}
        </div>
      </div>
    </div>` : null}
    ${overlay || null}
  </div>`;
}

/** Decorative QR (deterministic from the URL). Honestly badged as simulated. */
function QrSvg({ text, n = 25, size = 184 }) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  const rnd = () => { h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; };
  const inFinder = (x, y) => (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);
  const cells = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!inFinder(x, y) && rnd() > 0.52) cells.push(html`<rect x=${x} y=${y} width="1" height="1" />`);
  const finder = (x, y) => html`<rect x=${x} y=${y} width="7" height="7" /><rect x=${x + 1} y=${y + 1} width="5" height="5" class="pv-qr__bg" /><rect x=${x + 2} y=${y + 2} width="3" height="3" />`;
  return html`<svg class="pv-qr__code" viewBox=${`-2 -2 ${n + 4} ${n + 4}`} width=${size} height=${size} role="img" aria-label="QR code (simulated)" shape-rendering="crispEdges">
    <rect x="-2" y="-2" width=${n + 4} height=${n + 4} class="pv-qr__bg" />
    ${cells}${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}
  </svg>`;
}

export function QrModal({ url, name, close }) {
  const footer = html`<${Button} variant="ghost" onClick=${close}>Close<//>
    <${Button} variant="primary" icon="external-link" onClick=${() => window.open(url, '_blank', 'noopener')}>Open link<//>`;
  return html`<${Modal} title="Open on your phone" subtitle=${`Try ${name} on a real device`} icon="qr-code" size="sm" onClose=${close} footer=${footer}>
    <div class="pv-qr">
      <div class="pv-qr__frame"><${QrSvg} text=${url} /></div>
      <${Badge} tone="amber" icon="info">Prototype: simulated QR<//>
      <p class="t-sm t-muted pv-qr__note">Scanning is simulated in this prototype. Copy the link and open it on your phone. It works the same way.</p>
      <div class="pv-qr__link"><code>${url}</code><${CopyButton} text=${url} label="Copy link" /></div>
    </div>
  <//>`;
}
