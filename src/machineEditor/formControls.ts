export function input(
  label: string,
  value: string,
  onChange: (v: string) => void,
): HTMLElement {
  const wrap = document.createElement('label');
  wrap.className = 'field';
  wrap.appendChild(span(label));
  const i = document.createElement('input');
  i.type = 'text';
  i.value = value;
  i.addEventListener('input', () => onChange(i.value));
  wrap.appendChild(i);
  return wrap;
}

export function numberInput(
  label: string,
  value: number,
  min: number,
  max: number,
  onChange: (v: number) => void,
): HTMLElement {
  const wrap = document.createElement('label');
  wrap.className = 'field';
  wrap.appendChild(span(label));
  const i = document.createElement('input');
  i.type = 'number';
  i.value = String(value);
  i.min = String(min);
  i.max = String(max);
  const err = document.createElement('span');
  err.className = 'field-error';
  err.style.display = 'none';
  err.style.color = '#f87171';
  err.style.fontSize = '11px';
  i.addEventListener('input', () => {
    const raw = i.value.trim();
    if (raw === '') {
      err.textContent = 'Required';
      err.style.display = 'inline';
      return;
    }
    const n = Number(raw);
    if (!Number.isFinite(n)) {
      err.textContent = 'Must be a number';
      err.style.display = 'inline';
      return;
    }
    if (n < min || n > max) {
      err.textContent = `Must be ${min}..${max}`;
      err.style.display = 'inline';
      return;
    }
    err.style.display = 'none';
    onChange(n);
  });
  wrap.append(i, err);
  return wrap;
}

export function select(
  options: ReadonlyArray<string>,
  value: string,
  onChange: (v: string) => void,
): HTMLElement {
  const wrap = document.createElement('label');
  wrap.className = 'field';
  const s = document.createElement('select');
  for (const o of options) {
    const opt = document.createElement('option');
    opt.value = o;
    opt.textContent = o;
    if (o === value) opt.selected = true;
    s.appendChild(opt);
  }
  s.addEventListener('change', () => onChange(s.value));
  wrap.appendChild(s);
  return wrap;
}

export function span(text: string): HTMLElement {
  const s = document.createElement('span');
  s.className = 'field-label';
  s.textContent = text;
  return s;
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
