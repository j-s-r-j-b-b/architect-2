// Code tab (/p/:id/code, /p/:id/code/review): file tree, editable highlighted editor, terminal, review.
import { html, useState, useMemo, useEffect, useRef } from '../../lib/html.js';
import { updateProject } from '../../lib/store.js';
import { route, setQuery, Link } from '../../lib/router.js';
import { cx, debounce, downloadFile } from '../../lib/util.js';
import { Icon, IconButton, Button, Badge, CopyButton, highlight, toast, confirmDialog } from '../../ui/index.js';
import { generateFiles, filesAtCheckpoint } from '../../engine/codegen.js';
import { askArchitect } from '../bus.js';
import { buildTree, compareFiles, fileIcon } from '../code/diff.js';
import { Terminal } from '../code/Terminal.js';
import { Review } from '../code/Review.js';
import { SimBadge } from '../github/GitHubPopover.js';

const PLAIN = new Set(['md', 'text', 'sql', 'css']);
const hl = (code, lang) => (PLAIN.has(lang) ? code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : highlight(code, lang === 'tsx' || lang === 'ts' ? 'js' : lang));

function TreeNode({ node, depth, open, toggle, sel, onSel }) {
  if (node.dir) {
    const isOpen = open.has(node.path) ? false : true; // folders open unless collapsed
    return html`<div>
      <button class="cd-tree__row cd-tree__row--dir" style=${{ paddingLeft: 8 + depth * 12 + 'px' }} onClick=${() => toggle(node.path)}>
        <${Icon} name=${isOpen ? 'chevron-down' : 'chevron-right'} size=${12} /><${Icon} name=${isOpen ? 'folder-open' : 'folder'} size=${14} /><span class="t-truncate">${node.name}</span>
      </button>
      ${isOpen ? node.children.map((c) => html`<${TreeNode} key=${c.path} node=${c} depth=${depth + 1} open=${open} toggle=${toggle} sel=${sel} onSel=${onSel} />`) : null}
    </div>`;
  }
  return html`<button class=${cx('cd-tree__row', sel === node.path && 'is-sel')} style=${{ paddingLeft: 20 + depth * 12 + 'px' }} onClick=${() => onSel(node.path)} title=${node.path}>
    <${Icon} name=${fileIcon(node.path)} size=${14} /><span class="t-truncate grow">${node.name}</span>${node.file?.edited ? html`<span class="cd-dot" title="Edited by you"></span>` : null}
  </button>`;
}

function Editor({ project, file }) {
  const [val, setVal] = useState(file.content);
  const pid = project.id;
  const saver = useMemo(() => debounce((path, v, gen) => {
    updateProject(pid, (d) => { d.codeOverrides = { ...(d.codeOverrides || {}) }; if (v === gen) delete d.codeOverrides[path]; else d.codeOverrides[path] = v; });
  }, 350), [pid]);
  useEffect(() => { setVal(file.content); }, [file.path]);
  useEffect(() => () => saver.flush && saver.flush(), [saver]);
  const lines = val.split('\n').length;
  const onInput = (e) => { setVal(e.target.value); saver(file.path, e.target.value, file.generated); };
  const onKey = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const t = e.target, s = t.selectionStart, en = t.selectionEnd;
      const v = val.slice(0, s) + '  ' + val.slice(en);
      setVal(v); saver(file.path, v, file.generated);
      requestAnimationFrame(() => { t.selectionStart = t.selectionEnd = s + 2; });
    } else if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); saver.flush && saver.flush(); toast('Saved — your edit is kept even when Architect regenerates', { tone: 'success' }); }
  };
  return html`<div class="cd-editor">
    <div class="cd-gutter" aria-hidden="true">${Array.from({ length: lines }, (_, i) => html`<div>${i + 1}</div>`)}</div>
    <div class="cd-code">
      <pre class="cd-hl" aria-hidden="true"><code dangerouslySetInnerHTML=${{ __html: hl(val, file.lang) + '\n ' }}></code></pre>
      <textarea class="cd-ta" value=${val} onInput=${onInput} onKeyDown=${onKey} spellcheck=${false} autocapitalize="off" autocomplete="off" wrap="off" rows="1" cols="1" aria-label=${`Edit ${file.path}`}></textarea>
    </div>
  </div>`;
}

export default function CodeTab({ project, params = {} }) {
  const seg = (route.value?.path || '').split('/');
  const review = params.a === 'review' || params.sub === 'review' || seg[4] === 'review';
  return review ? html`<${Review} project=${project} />` : html`<${CodeMain} project=${project} />`;
}

function CodeMain({ project }) {
  const files = useMemo(() => generateFiles(project), [project]);
  const tree = useMemo(() => buildTree(files), [files]);
  const cps = project.checkpoints || [];
  const stats = useMemo(() => {
    const ch = compareFiles(filesAtCheckpoint(project, cps[1] || cps[0] || null), files);
    return { n: ch.length, add: ch.reduce((s, c) => s + c.add, 0), del: ch.reduce((s, c) => s + c.del, 0) };
  }, [files]);
  const [filter, setFilter] = useState('');
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [showTree, setShowTree] = useState(false);
  const [termOpen, setTermOpen] = useState(true);
  const q = route.value?.query?.file;
  const sel = files.find((f) => f.path === q) || files.find((f) => f.path === 'README.md') || files[0];
  const onSel = (path) => { setQuery({ file: path }); setShowTree(false); };
  const toggle = (path) => setCollapsed((s) => { const n = new Set(s); n.has(path) ? n.delete(path) : n.add(path); return n; });
  const edited = files.filter((f) => f.edited).length;
  const matches = filter ? files.filter((f) => f.path.toLowerCase().includes(filter.toLowerCase())) : null;
  const scrollRef = useRef(null);

  async function revert() {
    if (!(await confirmDialog({ title: `Revert ${sel.path}?`, body: 'Your edits to this file are removed and the generated version comes back. A checkpoint still has your old version.', confirmLabel: 'Revert' }))) return;
    updateProject(project.id, (d) => { const o = { ...(d.codeOverrides || {}) }; delete o[sel.path]; d.codeOverrides = o; });
    toast('Reverted to the generated version');
  }

  return html`<div class="cd-root">
    <div class="cd-bar">
      <${IconButton} icon="folder" label="Files" class="cd-bar__files" onClick=${() => setShowTree(!showTree)} active=${showTree} />
      <div class="cd-crumb t-mono t-truncate">${sel?.path.split('/').map((p, i, a) => html`<span class=${i === a.length - 1 ? 't-strong' : 't-faint'}>${p}</span>${i < a.length - 1 ? html`<span class="t-faint">/</span>` : null}`)}</div>
      ${sel?.edited ? html`<${Badge} size="sm" tone="amber" dot>Edited<//>` : html`<${Badge} size="sm" tone="neutral">Generated<//>`}
      <span class="grow"></span>
      ${sel?.edited ? html`<${Button} size="sm" variant="ghost" icon="undo" onClick=${revert}>Revert<//>` : null}
      <${IconButton} icon="sparkles" label="Ask Architect about this file" onClick=${() => askArchitect(`About ${sel.path}: `, { kind: 'file', id: sel.path, label: sel.path })} />
      <${CopyButton} text=${() => sel?.content || ''} label="Copy file" />
      <${IconButton} icon="download" label="Download file" onClick=${() => downloadFile(sel.path.split('/').pop(), sel.content, 'text/plain')} />
      <${Button} size="sm" variant=${stats.n ? 'secondary' : 'ghost'} icon="git-pull-request" href=${`/p/${project.id}/code/review`}>
        Review changes${stats.n ? html` <span class="cd-plus">+${stats.add}</span> <span class="cd-minus">−${stats.del}</span>` : ''}
      <//>
    </div>
    <div class="cd-main">
      <aside class=${cx('cd-tree', showTree && 'is-open')}>
        <div class="cd-tree__filter"><${Icon} name="search" size=${13} /><input placeholder="Filter files" value=${filter} onInput=${(e) => setFilter(e.target.value)} aria-label="Filter files" />${filter ? html`<button class="icon-btn icon-btn--sm" aria-label="Clear" onClick=${() => setFilter('')}><${Icon} name="x" size=${12} /></button>` : null}</div>
        <div class="cd-tree__list">
          ${matches ? (matches.length ? matches.map((f) => html`<button key=${f.path} class=${cx('cd-tree__row', sel?.path === f.path && 'is-sel')} style="padding-left:10px" onClick=${() => onSel(f.path)}><${Icon} name=${fileIcon(f.path)} size=${14} /><span class="t-truncate grow">${f.path}</span>${f.edited ? html`<span class="cd-dot"></span>` : null}</button>`) : html`<div class="t-xs t-faint p-12">No files match “${filter}”</div>`)
            : tree.children.map((c) => html`<${TreeNode} key=${c.path} node=${c} depth=${0} open=${collapsed} toggle=${toggle} sel=${sel?.path} onSel=${onSel} />`)}
        </div>
        <div class="cd-tree__foot t-xs t-faint">${files.length} files${edited ? html` · <span class="t-amber">${edited} edited</span>` : ''} · Next.js</div>
      </aside>
      <div class="cd-pane">
        <div class="cd-scroll" ref=${scrollRef}>${sel ? html`<${Editor} key=${sel.path} project=${project} file=${sel} />` : null}</div>
        <div class=${cx('cd-termwrap', !termOpen && 'is-closed')}>
          <button class="cd-termtoggle" onClick=${() => setTermOpen(!termOpen)} aria-label=${termOpen ? 'Hide terminal' : 'Show terminal'}><${Icon} name=${termOpen ? 'chevron-down' : 'chevron-up'} size=${13} />${termOpen ? '' : html`<span>Terminal</span>`}</button>
          ${termOpen ? html`<${Terminal} project=${project} files=${files} onOpenFile=${onSel} />` : null}
        </div>
      </div>
    </div>
  </div>`;
}
