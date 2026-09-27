// Form block: validates, then appends a row to the bound table (draft preview) or keeps
// it in local state (live app). Always tells the truth about where the data went.
import { html, useState } from '../../lib/html.js';
import { Icon } from '../../ui/icons.js';
import { cx, uid } from '../../lib/util.js';
import { tableById } from '../../engine/schema.js';
import { updateProject, getProject } from '../../lib/store.js';
import { useGx, Panel, GxButton, Editable } from '../util.js';

function defaultFields(table) {
  if (!table) return [{ key: 'name', label: 'Name', type: 'text' }, { key: 'email', label: 'Email', type: 'email' }, { key: 'message', label: 'Message', type: 'longtext' }];
  return table.columns
    .filter((c) => !['score', 'datetime'].includes(c.type) && c.key !== 'id')
    .slice(0, 5)
    .map((c) => ({ key: c.key, label: c.label, type: c.type === 'status' ? 'select' : c.type === 'longtext' ? 'textarea' : c.type, options: c.options }));
}

export function FormBlock({ block }) {
  const ctx = useGx();
  const p = block.props || {};
  const table = block.bind?.table ? tableById(ctx.project, block.bind.table) : null;
  const fields = p.fields?.length ? p.fields : defaultFields(table);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(null); // {where}
  const [busy, setBusy] = useState(false);
  const inert = ctx.isStatic || ctx.mode === 'wireframe';

  const set = (k, v) => { setValues((s) => ({ ...s, [k]: v })); if (errors[k]) setErrors((e) => ({ ...e, [k]: null })); };
  const submit = async (e) => {
    e.preventDefault();
    if (inert || busy) return;
    const errs = {};
    fields.forEach((f, i) => {
      const v = String(values[f.key] ?? '').trim();
      if ((f.required || i === 0) && !v) errs[f.key] = `${f.label} is required`;
      else if (f.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) errs[f.key] = 'Enter a valid email';
      else if ((f.type === 'number' || f.type === 'money') && v && Number.isNaN(Number(v))) errs[f.key] = 'Enter a number';
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 450));
    const row = { id: uid('r'), created: Date.now() };
    for (const f of fields) row[f.key] = f.type === 'number' || f.type === 'money' ? Number(values[f.key] || 0) : values[f.key] ?? '';
    let where = 'this browser only';
    if (!ctx.live && table && ctx.project.id && getProject(ctx.project.id)) {
      updateProject(ctx.project.id, (d) => { const t = d.data.tables.find((x) => x.id === table.id); if (t) t.rows.unshift(row); });
      where = `${table.name}${table.source !== 'live' ? ` (${table.source === 'test' ? 'test' : 'sample'} data)` : ''}`;
      ctx.emit('info', `form ${block.id} → insert into ${table.id} · 1 row`);
    }
    setBusy(false);
    setValues({});
    setDone({ where });
  };

  if (done) {
    return html`<${Panel} block=${block}>
      <div class="gx-success">
        <span class="gx-success__icon"><${Icon} name="check" size=${18} stroke=${2.6} /></span>
        <div class="gx-success__title">${p.successText || 'Thanks — we got it.'}</div>
        <div class="gx-success__where">Saved to ${done.where}</div>
        <button class="gx-textbtn" onClick=${() => setDone(null)}>Submit another</button>
      </div>
    <//>`;
  }

  return html`<${Panel} block=${block} table=${table}>
    <form class="gx-form" onSubmit=${submit} novalidate>
      ${fields.map((f) => {
        const id = `${block.id}_${f.key}`;
        const common = { id, value: values[f.key] ?? '', disabled: inert, onInput: (e) => set(f.key, e.currentTarget.value), 'aria-invalid': errors[f.key] ? 'true' : undefined };
        let control;
        if (f.type === 'select' || f.type === 'status' || (f.options && f.options.length)) {
          control = html`<select ...${common} class="gx-input" onChange=${(e) => set(f.key, e.currentTarget.value)}><option value="">${f.placeholder || 'Choose…'}</option>${(f.options || []).map((o) => html`<option value=${o}>${o}</option>`)}</select>`;
        } else if (f.type === 'textarea' || f.type === 'longtext') {
          control = html`<textarea ...${common} class="gx-input" rows="3" placeholder=${f.placeholder || ''}></textarea>`;
        } else {
          const t = f.type === 'email' ? 'email' : f.type === 'number' || f.type === 'money' ? 'number' : f.type === 'date' ? 'date' : 'text';
          control = html`<input ...${common} class="gx-input" type=${t} placeholder=${f.placeholder || ''} />`;
        }
        return html`<div class=${cx('gx-field', errors[f.key] && 'is-error')} key=${f.key}>
          <label for=${id}>${f.label}</label>
          ${control}
          ${errors[f.key] ? html`<span class="gx-field__err">${errors[f.key]}</span>` : null}
        </div>`;
      })}
      <div class="gx-form__foot">
        <${GxButton} type="submit" variant="primary" label=${p.submitLabel || 'Submit'} busy=${busy} disabled=${inert}
          onSaveLabel=${(v) => ctx.saveEdit(block.id, (b) => { b.props = b.props || {}; b.props.submitLabel = v; }, 'button label')} />
        ${table && !ctx.live ? html`<span class="gx-form__hint">Adds a row to ${table.name}</span>` : null}
      </div>
    </form>
  <//>`;
}
