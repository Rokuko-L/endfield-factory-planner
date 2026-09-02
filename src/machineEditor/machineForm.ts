import type { MachineType } from '../types.ts';
import { input, numberInput } from './formControls.ts';
import { buildEdgeBandsSection } from './edgeBandForm.ts';
import { buildPortsSection } from './portForm.ts';
import { buildRecipesSection } from './recipeForm.ts';

export function buildMachineForm(
  m: MachineType,
  onChange: (next: MachineType) => void,
  onDelete: () => void,
): HTMLElement {
  const root = document.createElement('div');
  root.className = 'machine-form';
  root.appendChild(buildHeader(m, onDelete));
  root.appendChild(buildBasicFields(m, onChange));
  root.appendChild(buildEdgeBandsSection(m, onChange));
  root.appendChild(buildPortsSection(m, onChange));
  root.appendChild(buildRecipesSection(m, onChange));
  return root;
}

function buildHeader(m: MachineType, onDelete: () => void): HTMLElement {
  const header = document.createElement('div');
  header.className = 'machine-form-header';
  const title = document.createElement('h3');
  title.textContent = m.name || '(unnamed)';
  const del = document.createElement('button');
  del.type = 'button';
  del.textContent = 'Delete';
  del.addEventListener('click', () => {
    if (confirm(`Delete "${m.name}"?`)) onDelete();
  });
  header.append(title, del);
  return header;
}

function buildBasicFields(m: MachineType, onChange: (next: MachineType) => void): HTMLElement {
  const fieldset = document.createElement('fieldset');
  fieldset.innerHTML = `<legend>Footprint</legend>`;
  const grid = document.createElement('div');
  grid.className = 'field-grid';
  grid.append(
    input('Name', m.name, (v) => onChange({ ...m, name: v })),
    input('Category', m.category ?? '', (v) => onChange({ ...m, category: v.trim() || undefined })),
    numberInput('Width', m.width, 1, 16, (v) => onChange({ ...m, width: v })),
    numberInput('Height', m.height, 1, 16, (v) => onChange({ ...m, height: v })),
  );
  fieldset.appendChild(grid);
  return fieldset;
}
