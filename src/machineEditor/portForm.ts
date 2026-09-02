import type { MachineType, PortDef, Side } from '../types.ts';
import { input, numberInput, select } from './formControls.ts';

const VALID_SIDES: ReadonlyArray<Side> = ['north', 'east', 'south', 'west'];

export function buildPortsSection(
  m: MachineType,
  onChange: (next: MachineType) => void,
): HTMLElement {
  const fieldset = document.createElement('fieldset');
  fieldset.innerHTML = `<legend>Single-tile ports <span class="hint">(e.g. fluid inputs on a specific tile)</span></legend>`;
  const list = document.createElement('div');
  list.className = 'ports-list';
  for (let idx = 0; idx < m.ports.length; idx++) {
    const p = m.ports[idx]!;
    const row = document.createElement('div');
    row.className = 'port-row';
    row.append(
      input('id', p.id, (v) => updatePort(m, idx, { id: v }, onChange)),
      select(['input', 'output'], p.type, (v) =>
        updatePort(m, idx, { type: v as 'input' | 'output' }, onChange),
      ),
      select(VALID_SIDES, p.side, (v) => updatePort(m, idx, { side: v as Side }, onChange)),
      numberInput('tileIndex', p.tileIndex, 0, 31, (v) =>
        updatePort(m, idx, { tileIndex: v }, onChange),
      ),
      input('resource (leave empty = any)', p.resource, (v) =>
        updatePort(m, idx, { resource: v }, onChange),
      ),
      select(['item', 'fluid'], p.kind, (v) =>
        updatePort(m, idx, { kind: v as 'item' | 'fluid' }, onChange),
      ),
      numberInput('rate', p.rate, 0, 9999, (v) =>
        updatePort(m, idx, { rate: v }, onChange),
      ),
    );
    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = '×';
    del.addEventListener('click', () => {
      onChange({ ...m, ports: m.ports.filter((_, i) => i !== idx) });
    });
    row.appendChild(del);
    list.appendChild(row);
  }
  const add = document.createElement('button');
  add.type = 'button';
  add.textContent = '+ Add Port';
  add.addEventListener('click', () => {
    const newPort: PortDef = {
      id: `port_${m.ports.length + 1}`,
      type: 'input',
      side: 'north',
      tileIndex: 0,
      resource: '',
      kind: 'item',
      rate: 30,
    };
    onChange({ ...m, ports: [...m.ports, newPort] });
  });
  fieldset.append(list, add);
  return fieldset;
}

function updatePort(
  m: MachineType,
  idx: number,
  patch: Partial<PortDef>,
  onChange: (next: MachineType) => void,
): void {
  const next = m.ports.slice();
  next[idx] = { ...next[idx]!, ...patch };
  onChange({ ...m, ports: next });
}
