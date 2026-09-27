// The shared "describe it" composer used on the landing page, persona pages and the Start hub.
import { html, useState, useEffect, useRef } from '../lib/html.js';
import { navigate } from '../lib/router.js';
import { Icon, IconButton, Menu, Segmented, toast } from '../ui/index.js';
import { cx } from '../lib/util.js';

const EXAMPLES = [
  'Score inbound HubSpot leads and draft follow-ups I approve…',
  'A support desk that triages tickets and drafts replies from our help center…',
  'Screen resumes against a job description and book interviews…',
  'Import my Next.js repo and add an AI agent that triages tickets…',
  'A clinic booking page with an assistant that answers questions…',
];

/** Rotating typewriter placeholder. */
function useTypewriter(list, enabled) {
  const [text, setText] = useState(list[0]);
  useEffect(() => {
    if (!enabled) return;
    let i = 0, j = 0, dir = 1, t;
    const tick = () => {
      const s = list[i];
      j += dir;
      setText(s.slice(0, Math.max(1, j)));
      if (dir > 0 && j >= s.length) { dir = -1; t = setTimeout(tick, 2200); return; }
      if (dir < 0 && j <= 0) { dir = 1; i = (i + 1) % list.length; }
      t = setTimeout(tick, dir > 0 ? 28 : 12);
    };
    t = setTimeout(tick, 1600);
    return () => clearTimeout(t);
  }, [enabled]);
  return text;
}

/**
 * <PromptBox onSubmit=${({ prompt, attachments, mode }) => …} />
 * Defaults to creating a project via /new when onSubmit is omitted.
 */
export function PromptBox({ onSubmit, initial = '', autoFocus, examples = EXAMPLES, showModes = true, compact, submitLabel = 'Plan it' }) {
  const [value, setValue] = useState(initial);
  const [attachments, setAttachments] = useState([]);
  const [mode, setMode] = useState('plan');
  const [listening, setListening] = useState(false);
  const ta = useRef(null);
  const file = useRef(null);
  const placeholder = useTypewriter(examples, !value);

  useEffect(() => { if (autoFocus && ta.current) ta.current.focus(); }, []);
  useEffect(() => { setValue(initial); }, [initial]);
  useEffect(() => {
    const el = ta.current; if (!el) return;
    el.style.height = 'auto'; el.style.height = Math.min(280, Math.max(compact ? 64 : 96, el.scrollHeight)) + 'px';
  }, [value]);

  const submit = () => {
    const prompt = value.trim();
    if (!prompt) { ta.current && ta.current.focus(); return; }
    if (onSubmit) onSubmit({ prompt, attachments, mode });
    else {
      sessionStorage.setItem('a2:pendingAttachments', JSON.stringify(attachments));
      navigate(`/new?prompt=${encodeURIComponent(prompt)}${mode === 'build' ? '&skipPlan=1' : ''}`);
    }
  };

  const onFiles = (e) => {
    const files = [...(e.currentTarget.files || [])].map((f) => ({ name: f.name, size: f.size, type: f.type }));
    setAttachments([...attachments, ...files].slice(0, 8));
    if (files.length) toast(`${files.length} file${files.length > 1 ? 's' : ''} attached — PDFs and docs become agent knowledge, spreadsheets become data`, { tone: 'info' });
    e.currentTarget.value = '';
  };

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast('Voice input isn’t supported in this browser', { tone: 'warn' }); return; }
    const rec = new SR(); rec.lang = 'en-US'; rec.interimResults = true;
    const base = value ? value.trim() + ' ' : '';
    rec.onresult = (ev) => setValue(base + [...ev.results].map((r) => r[0].transcript).join(' '));
    rec.onend = () => setListening(false);
    rec.onerror = () => { setListening(false); toast('Couldn’t hear anything — check microphone permissions', { tone: 'warn' }); };
    setListening(true); rec.start();
  };

  const plusItems = [
    { section: 'Add to your prompt' },
    { label: 'Attach files', icon: 'paperclip', desc: 'PDF, DOCX, CSV, images', onClick: () => file.current && file.current.click() },
    { label: 'Import a GitHub repo', icon: 'github', desc: 'Keep building an existing project', onClick: () => navigate('/start/import?source=github') },
    { label: 'Start from Figma or a URL', icon: 'figma', desc: 'Use a design as the starting point', onClick: () => navigate('/start/import?source=design') },
    { label: 'Use a template', icon: 'layout-grid', onClick: () => navigate('/templates') },
    { divider: true },
    { label: 'Mention an integration', icon: 'plug', hint: '@', onClick: () => setValue((v) => (v ? v + ' ' : '') + '@') },
    { label: 'Add an MCP server', icon: 'server', hint: '@mcp:', onClick: () => setValue((v) => (v ? v + ' ' : '') + '@mcp:') },
  ];

  return html`<div class="promptbox" onClick=${(e) => { if (e.target === e.currentTarget) ta.current && ta.current.focus(); }}>
    <textarea ref=${ta} class="promptbox__input" style=${compact ? 'min-height:64px;font-size:15px' : null} value=${value} placeholder=${placeholder} aria-label="Describe what you want to build"
      onInput=${(e) => setValue(e.currentTarget.value)}
      onKeyDown=${(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); submit(); } }}></textarea>
    ${attachments.length ? html`<div class="promptbox__attachments">${attachments.map((a, i) => html`<span class="promptbox__attachment"><${Icon} name=${/sheet|csv|excel/.test(a.type + a.name) ? 'table' : /image/.test(a.type) ? 'image' : 'file-text'} size=${12} />${a.name}<button aria-label="Remove" onClick=${() => setAttachments(attachments.filter((_, j) => j !== i))}><${Icon} name="x" size=${11} /></button></span>`)}</div>` : null}
    <div class="promptbox__bar">
      <input ref=${file} type="file" multiple hidden onChange=${onFiles} accept=".pdf,.doc,.docx,.txt,.md,.csv,.xlsx,.png,.jpg,.jpeg" />
      <${Menu} align="top-start" width=${260} items=${plusItems} trigger=${(open, toggle) => html`<${IconButton} icon="plus" label="Add files, repos, designs…" variant="bordered" active=${open} onClick=${toggle} />`} />
      <${IconButton} icon="mic" label=${listening ? 'Listening…' : 'Speak your idea'} active=${listening} onClick=${startVoice} />
      ${showModes ? html`<${Segmented} size="sm" value=${mode} onChange=${setMode} options=${[{ value: 'plan', label: 'Plan first', icon: 'list-checks', tip: 'Questions → plan → price, then build (recommended)' }, { value: 'build', label: 'Just build', icon: 'zap', tip: 'Skip questions and use sensible defaults' }]} />` : null}
      <span class="grow"></span>
      <span class="promptbox__hint hide-sm">${value.trim() ? html`<span class="kbd">Enter</span> to ${mode === 'plan' ? 'plan' : 'build'} · free until you approve a quote` : 'Planning is always free'}</span>
      <button class="promptbox__send" disabled=${!value.trim()} onClick=${submit} aria-label=${submitLabel} data-tip=${submitLabel}><${Icon} name="arrow-up" size=${18} stroke=${2.4} /></button>
    </div>
  </div>`;
}
