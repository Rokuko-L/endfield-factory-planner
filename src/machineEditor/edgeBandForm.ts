import type { MachineType, Side } from '../types.ts';
import { input, select } from './formControls.ts';

const VALID_SIDES: ReadonlyArray<Side> = ['north', 'east', 'south', 'west'];

export function buildEdgeBandsSection(
  m: MachineType,
  onChange: (next: MachineType) => void,
): HTMLElement {
  const fieldset = document.createElement('fieldset');
  fieldset.innerHTML = `<legend>Edge bands <span class="hint">(visual port zones that span the whole edge)</span></legend>`;
  const bands = m.edgeBands ?? {};
  const list = document.createElement('div');
  list.className = 'edge-bands';
  for (const side of VALID_SIDES) {
    const band = bands[side];
    const row = document.createElement('div');
    row.className = 'edge-band-row';
    const label = document.createElement('label');
    label.textContent = side;
    row.appendChild(label);
    if (band) {
      const typeSel = select(
        ['input', 'output'],
        band.type,
        (v) => {
          const nextBands = { ...bands, [side]: { ...band, type: v as 'input' | 'output' } };
          onChange({ ...m, edgeBands: nextBands });
        },
      );
      const kindSel = select(
        ['item', 'fluid'],
        band.resourceKind,
        (v) => {
          const nextBands = { ...bands, [side]: { ...band, resourceKind: v as 'item' | 'fluid' } };
          onChange({ ...m, edgeBands: nextBands });
        },
      );
      const resourceInput = input('resource (empty = any)', band.resource ?? '', (v) => {
        const trimmed = v.trim();
        const nextBands = { ...bands, [side]: { ...band, resource: trimmed || undefined } };
        onChange({ ...m, edgeBands: nextBands });
      });
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = '×';
      remove.title = 'Remove this band';
      remove.addEventListener('click', () => {
        const nextBands = { ...bands };
        delete nextBands[side];
        onChange({ ...m, edgeBands: nextBands });
      });
      row.append(typeSel, kindSel, resourceInput, remove);
    } else {
      const add = document.createElement('button');
      add.type = 'button';
      add.textContent = '+ add';
      add.addEventListener('click', () => {
        onChange({
          ...m,
          edgeBands: { ...bands, [side]: { type: 'input', resourceKind: 'item' } },
        });
      });
      row.appendChild(add);
    }
    list.appendChild(row);
  }
  fieldset.appendChild(list);
  return fieldset;
}
