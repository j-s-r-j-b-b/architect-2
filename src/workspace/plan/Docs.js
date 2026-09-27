// Plan › Docs — real, downloadable artifacts generated from the project.
import { html, useState, useEffect } from '../../lib/html.js';
import { updateProject } from '../../lib/store.js';
import { uid, timeAgo, downloadFile, cx, copyText } from '../../lib/util.js';
import { Button, IconButton, Input, Badge, Icon, Modal, openModal, toast, Empty, Menu } from '../../ui/index.js';
import { SectionHead, slug } from './shared.js';
import { specMarkdown, deckHtml, deckSlides, skillFiles, agentsMd, readmeMd, openPrint, requestedDoc } from './docgen.js';
import { mdToHtml } from './md.js';
import { makeZip } from './zip.js';

const SUGGEST = ['FAQ for sales reps', 'Onboarding guide for new teammates', 'Security & data overview', 'Launch announcement email', 'Test plan'];
const KIND_ICON = { spec: 'file-text', deck: 'presentation', skills: 'bot', starter: 'file-code', pdf: 'download', request: 'sparkles' };

function record(p, { kind, name, content }) {
  updateProject(p.id, (d) => {
    const list = (d.plan.artifacts || []).filter((a) => !(a.kind === kind && a.name === name));
    d.plan.artifacts = [{ id: uid('art'), kind, name, at: Date.now(), ...(content ? { content } : {}) }, ...list].slice(0, 30);
  }, { touch: false });
}

export default function Docs({ project: p }) {
  const base = slug(p.name);
  const skills = skillFiles(p);
  const dl = (kind, name, content, type = 'text/markdown') => { downloadFile(name, content, type); record(p, { kind, name }); toast(`Downloaded ${name}`, { tone: 'success' }); };
  const preview = (title, md, filename, kind) => openModal(PreviewModal, { title, md, filename, onDownload: () => dl(kind, filename, md) }, {});
  const hasPlan = (p.plan?.promises || []).length > 0;
  if (!hasPlan && !(p.agents || []).length) {
    return html`<div class="card"><${Empty} icon="file-text" title="Documents appear once there's a plan"
      body="The product spec, pitch deck, agent skill files and starter files are generated from your plan — so they're always in sync with what's being built." /></div>`;
  }
  const starter = [{ name: 'AGENTS.md', content: agentsMd(p) }, { name: 'README.md', content: readmeMd(p) }];
  return html`<div class="pl-docs">
    <${SectionHead} icon="file-text" title="Documents from your plan" sub="Real files, generated from the current plan. Regenerate anytime — they always match what's being built." />
    <div class="pl-doc-grid">
      <${DocCard} icon="file-text" title="Product spec" format=".md" desc="Promises with acceptance checks, agents, screens, data, decisions and the quote."
        actions=${html`<${Button} size="sm" variant="ghost" icon="eye" onClick=${() => preview(`${p.name} — product spec`, specMarkdown(p), `${base}-spec.md`, 'spec')}>Preview<//>
          <${Button} size="sm" icon="download" onClick=${() => dl('spec', `${base}-spec.md`, specMarkdown(p))}>Download<//>`} />
      <${DocCard} icon="presentation" title="Pitch deck" format=".html" desc=${`${deckSlides(p).length} slides in your theme colours. Opens in any browser; arrow keys to move.`}
        actions=${html`<${Button} size="sm" variant="primary" icon="play" onClick=${() => openModal(PresentDeck, { project: p }, {})}>Present<//>
          <${Button} size="sm" variant="ghost" icon="eye" onClick=${() => openModal(HtmlPreview, { title: `${p.name} — pitch deck`, doc: deckHtml(p), onDownload: () => dl('deck', `${base}-pitch-deck.html`, deckHtml(p), 'text/html') }, {})}>Preview<//>
          <${Button} size="sm" icon="download" onClick=${() => dl('deck', `${base}-pitch-deck.html`, deckHtml(p), 'text/html')}>Download<//>`} />
      <${DocCard} icon="bot" title="Agent skill files" format=${`.md × ${skills.length}`} desc="One portable SKILL.md per agent: instructions, tools, approvals, guardrails, limits and output contract."
        actions=${html`${skills.length ? html`<${Menu} width=${260} items=${skills.flatMap((s) => [{ label: s.agent.name, icon: 'eye', desc: 'Preview', onClick: () => preview(s.name, s.content, `${slug(s.agent.name)}.SKILL.md`, 'skills') }, { label: `Download ${slug(s.agent.name)}.SKILL.md`, icon: 'download', onClick: () => dl('skills', `${slug(s.agent.name)}.SKILL.md`, s.content) }])}
            trigger=${(o, t) => html`<${Button} size="sm" variant="ghost" iconRight="chevron-down" onClick=${t}>Per agent<//>`} />` : null}
          <${Button} size="sm" icon="download" disabled=${!skills.length} onClick=${() => { downloadFile(`${base}-agent-skills.zip`, makeZip(skills.map((s) => ({ name: s.name, content: s.content })))); record(p, { kind: 'skills', name: `${base}-agent-skills.zip` }); toast('Downloaded agent skills (.zip)', { tone: 'success' }); }}>All (.zip)<//>`} />
      <${DocCard} icon="file-code" title="Starter files" format="AGENTS.md · README.md" desc="Drop into a repo so coding agents and teammates know the stack, commands, promises and rules."
        actions=${html`<${Menu} width=${220} items=${starter.map((f) => ({ label: f.name, icon: 'eye', desc: 'Preview', onClick: () => preview(f.name, f.content, f.name, 'starter') }))}
            trigger=${(o, t) => html`<${Button} size="sm" variant="ghost" icon="eye" iconRight="chevron-down" onClick=${t}>Preview<//>`} />
          <${Button} size="sm" icon="download" onClick=${() => { downloadFile(`${base}-starter-files.zip`, makeZip(starter)); record(p, { kind: 'starter', name: `${base}-starter-files.zip` }); toast('Downloaded starter files (.zip)', { tone: 'success' }); }}>Download (.zip)<//>`} />
      <${DocCard} icon="download" title="Save as PDF" format="print" desc="A clean, print-styled version of the spec. Choose “Save as PDF” in the print dialog."
        actions=${html`<${Button} size="sm" icon="external-link" onClick=${() => { if (openPrint(p)) record(p, { kind: 'pdf', name: `${base}-spec.pdf` }); else toast('Your browser blocked the print window — allow pop-ups for this site', { tone: 'warn' }); }}>Open print view<//>`} />
    </div>
    <${AskForDoc} project=${p} onPreview=${preview} />
    <${History} project=${p} onPreview=${preview} dl=${dl} />
  </div>`;
}

function DocCard({ icon, title, format, desc, actions }) {
  return html`<div class="card pl-doc">
    <div class="row gap-12 pl-doc__head"><span class="pl-doc__icon"><${Icon} name=${icon} size=${18} /></span><div class="grow"><div class="t-md t-strong">${title}</div><div class="t-xs t-faint t-mono">${format}</div></div></div>
    <p class="t-sm t-muted pl-doc__desc">${desc}</p>
    <div class="row wrap gap-6 pl-doc__actions">${actions}</div>
  </div>`;
}

function AskForDoc({ project: p, onPreview }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const go = async (req = text) => {
    const r = req.trim(); if (!r) return;
    setBusy(true); await new Promise((res) => setTimeout(res, 500));
    const doc = requestedDoc(p, r);
    const name = `${slug(doc.title)}.md`;
    record(p, { kind: 'request', name, content: doc.content });
    setBusy(false); setText('');
    onPreview(doc.title, doc.content, name, 'request');
  };
  return html`<div class="card pl-ask">
    <div class="pl-side-title"><${Icon} name="sparkles" size=${15} />Ask for a document</div>
    <p class="t-sm t-muted mt-4">Describe the document and who it's for. It's written from your plan — free, no credits.</p>
    <div class="row gap-8 mt-12">
      <${Input} class="grow" value=${text} onValue=${setText} placeholder="e.g. FAQ for sales reps" onKeyDown=${(e) => e.key === 'Enter' && go()} />
      <${Button} variant="primary" icon="wand" loading=${busy} disabled=${!text.trim()} onClick=${() => go()}>Write it<//>
    </div>
    <div class="row wrap gap-6 mt-8">${SUGGEST.map((s) => html`<button class="chip chip--sm" onClick=${() => go(s)}>${s}</button>`)}</div>
  </div>`;
}

function History({ project: p, onPreview, dl }) {
  const list = p.plan?.artifacts || [];
  const regenerate = (a) => {
    if (a.content) return { md: a.content };
    if (a.kind === 'spec') return { md: specMarkdown(p) };
    return null;
  };
  const del = (a) => updateProject(p.id, (d) => { d.plan.artifacts = d.plan.artifacts.filter((x) => x.id !== a.id); }, { touch: false });
  return html`<section class="mt-24">
    <${SectionHead} icon="history" title="Generated documents" sub=${list.length ? 'Everything you downloaded or asked for, newest first.' : null} />
    ${!list.length ? html`<div class="card"><${Empty} icon="history" title="Nothing generated yet" body="Downloads and documents you ask for are listed here so the team can find them again." /></div>`
      : html`<div class="card pl-hist">${list.map((a) => {
        const r = regenerate(a);
        return html`<div class="pl-hist__row" key=${a.id}>
          <${Icon} name=${KIND_ICON[a.kind] || 'file'} size=${15} class="t-faint" />
          <span class="grow t-truncate t-md">${a.name}</span>
          ${a.kind === 'request' ? html`<${Badge} size="sm" tone="violet">Written by Architect<//>` : null}
          <span class="t-xs t-faint t-nowrap">${timeAgo(a.at)}</span>
          ${r ? html`<${IconButton} size="sm" icon="eye" label="Preview" onClick=${() => onPreview(a.name.replace(/\.md$/, ''), r.md, a.name, a.kind)} />
            <${IconButton} size="sm" icon="download" label="Download" onClick=${() => dl(a.kind, a.name, r.md)} />` : null}
          <${IconButton} size="sm" icon="trash" label="Remove from list" onClick=${() => del(a)} />
        </div>`;
      })}</div>`}
  </section>`;
}

function PreviewModal({ close, title, md, filename, onDownload }) {
  const [copied, setCopied] = useState(false);
  return html`<${Modal} title=${title} subtitle=${filename} size="xl" onClose=${close}
    footer=${html`<${Button} variant="ghost" icon=${copied ? 'check' : 'copy'} onClick=${async () => { if (await copyText(md)) { setCopied(true); setTimeout(() => setCopied(false), 1400); } }}>${copied ? 'Copied' : 'Copy Markdown'}<//>
      <${Button} variant="primary" icon="download" onClick=${() => { onDownload(); }}>Download<//>`}>
    <article class="pl-md" dangerouslySetInnerHTML=${{ __html: mdToHtml(md) }}></article>
  <//>`;
}

function HtmlPreview({ close, title, doc, onDownload }) {
  return html`<${Modal} title=${title} size="xl" onClose=${close} footer=${html`<${Button} variant="primary" icon="download" onClick=${onDownload}>Download .html<//>`}>
    <iframe class="pl-iframe" title=${title} srcdoc=${doc} sandbox="allow-scripts"></iframe>
  <//>`;
}

function PresentDeck({ close, project: p }) {
  const slides = deckSlides(p);
  const [i, setI] = useState(0);
  const go = (d) => setI((x) => Math.max(0, Math.min(slides.length - 1, x + d)));
  useEffect(() => {
    const onKey = (e) => {
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(1); }
      if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); go(-1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const s = slides[i];
  return html`<div class="pl-present" style=${{ '--pp-primary': p.theme?.primary || 'var(--blueprint)' }} role="dialog" aria-modal="true" aria-label="Presenting pitch deck">
    <div class=${cx('pl-present__slide', s.big && 'is-big')} key=${i} onClick=${() => go(1)}>
      <div class="pl-present__kicker">${s.kicker}</div>
      <h1>${s.title}</h1>
      ${s.body ? html`<p>${s.body}</p>` : null}
      ${s.bullets?.length ? html`<ul>${s.bullets.map((b) => html`<li>${b}</li>`)}</ul>` : null}
    </div>
    <div class="pl-present__bar">
      <button class="pl-present__btn" onClick=${() => go(-1)} disabled=${i === 0} aria-label="Previous slide"><${Icon} name="chevron-left" size=${18} /></button>
      <div class="pl-present__dots">${slides.map((_, j) => html`<button class=${cx(j === i && 'is-on')} onClick=${() => setI(j)} aria-label=${`Slide ${j + 1}`}></button>`)}</div>
      <span class="pl-present__count">${i + 1} / ${slides.length}</span>
      <button class="pl-present__btn" onClick=${() => go(1)} disabled=${i === slides.length - 1} aria-label="Next slide"><${Icon} name="chevron-right" size=${18} /></button>
      <button class="pl-present__btn" onClick=${() => close()} aria-label="Stop presenting"><${Icon} name="x" size=${18} /></button>
    </div>
  </div>`;
}
