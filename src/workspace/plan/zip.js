// Minimal ZIP support, no dependencies:
//  makeZip(files)            → Blob (stored entries, UTF-8 names) for "Download all" buttons
//  readZipTextFiles(buf, fn) → text of matching entries (stored or deflate via DecompressionStream)
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
function crc32(bytes) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function dosTime(d = new Date()) {
  return { time: (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2), date: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate() };
}

/** @param {{name:string, content:string|Uint8Array}[]} files */
export function makeZip(files) {
  const enc = new TextEncoder();
  const { time, date } = dosTime();
  const chunks = [], central = [];
  let offset = 0;
  for (const f of files) {
    const name = enc.encode(f.name);
    const data = typeof f.content === 'string' ? enc.encode(f.content) : f.content;
    const crc = crc32(data);
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true);
    lh.setUint16(10, time, true); lh.setUint16(12, date, true); lh.setUint32(14, crc, true);
    lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true); lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
    chunks.push(new Uint8Array(lh.buffer), name, data);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true);
    ch.setUint16(12, time, true); ch.setUint16(14, date, true); ch.setUint32(16, crc, true);
    ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true); ch.setUint16(28, name.length, true);
    ch.setUint16(30, 0, true); ch.setUint16(32, 0, true); ch.setUint16(34, 0, true); ch.setUint16(36, 0, true); ch.setUint32(38, 0, true); ch.setUint32(42, offset, true);
    central.push(new Uint8Array(ch.buffer), name);
    offset += 30 + name.length + data.length;
  }
  const cdSize = central.reduce((a, c) => a + c.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
  end.setUint32(12, cdSize, true); end.setUint32(16, offset, true);
  return new Blob([...chunks, ...central, new Uint8Array(end.buffer)], { type: 'application/zip' });
}

/** Read text entries whose name passes `filter`. Throws a friendly Error on bad archives. */
export async function readZipTextFiles(buffer, filter = () => true, { maxFiles = 40 } = {}) {
  const bytes = new Uint8Array(buffer);
  const dv = new DataView(buffer);
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('That file is not a valid .zip archive.');
  const count = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);
  const dec = new TextDecoder();
  const out = [];
  for (let n = 0; n < count && p + 46 <= bytes.length; n++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true), compSize = dv.getUint32(p + 20, true);
    const nameLen = dv.getUint16(p + 28, true), extraLen = dv.getUint16(p + 30, true), commentLen = dv.getUint16(p + 32, true);
    const local = dv.getUint32(p + 42, true);
    const name = dec.decode(bytes.subarray(p + 46, p + 46 + nameLen));
    p += 46 + nameLen + extraLen + commentLen;
    if (name.endsWith('/') || !filter(name) || out.length >= maxFiles) continue;
    const ln = dv.getUint16(local + 26, true), le = dv.getUint16(local + 28, true);
    const start = local + 30 + ln + le;
    const data = bytes.subarray(start, start + compSize);
    let text;
    if (method === 0) text = dec.decode(data);
    else if (method === 8 && typeof DecompressionStream !== 'undefined') {
      const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      text = dec.decode(await new Response(stream).arrayBuffer());
    } else continue;
    out.push({ name, text });
  }
  return out;
}
