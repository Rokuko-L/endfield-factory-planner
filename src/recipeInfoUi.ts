import type { MachineInstance, Connection } from './types.ts';
import { selectedRecipeFor } from './recipeInfo.ts';

export function renderRecipeInfoPanel(
  host: HTMLElement,
  machine: MachineInstance | null,
  connections: Connection[],
  assignment: { resource: string; kind: 'item' | 'fluid'; rate: number } | undefined,
): void {
  host.innerHTML = '';
  if (!machine) {
    const empty = document.createElement('div');
    empty.className = 'info-empty';
    empty.textContent = 'Click a machine to see its recipe.';
    host.appendChild(empty);
    return;
  }
  const info = selectedRecipeFor(machine, connections);
  if (!info) {
    const empty = document.createElement('div');
    empty.className = 'info-empty';
    empty.textContent = `${machine.type.name} has no recipes.`;
    host.appendChild(empty);
    return;
  }

  const header = document.createElement('header');
  header.className = 'recipe-info-header';
  const name = document.createElement('h2');
  name.textContent = machine.type.name.toUpperCase();
  const recipe = document.createElement('div');
  recipe.className = 'recipe-info-id';
  recipe.textContent = info.recipe.id;
  const close = document.createElement('button');
  close.className = 'recipe-info-close';
  close.textContent = '×';
  close.addEventListener('click', () => {
    const ev = new CustomEvent('recipe-info-close');
    host.dispatchEvent(ev);
  });
  header.append(name, recipe, close);
  host.appendChild(header);

  if (assignment) {
    const picked = document.createElement('div');
    picked.className = 'recipe-info-picked';
    picked.textContent = `Spawns: ${assignment.resource} (${assignment.kind}) @ ${assignment.rate}/min`;
    host.appendChild(picked);
  }

  const inputsRow = document.createElement('div');
  inputsRow.className = 'recipe-info-row';
  for (const slot of info.recipe.inputs) {
    const tile = document.createElement('div');
    tile.className = 'recipe-info-chip';
    tile.innerHTML = `<span class="rate">${slot.rate}</span><span class="res">${escape(slot.resource)}</span>`;
    inputsRow.appendChild(tile);
  }
  const arrow = document.createElement('div');
  arrow.className = 'recipe-info-arrow';
  arrow.textContent = info.recipe.time ? `→ ${info.recipe.time}s →` : '→';
  inputsRow.appendChild(arrow);
  for (const slot of info.recipe.outputs) {
    const tile = document.createElement('div');
    tile.className = 'recipe-info-chip out';
    tile.innerHTML = `<span class="rate">${slot.rate}</span><span class="res">${escape(slot.resource)}</span>`;
    inputsRow.appendChild(tile);
  }
  host.appendChild(inputsRow);

  if (info.efficiency >= 0) {
    const eff = document.createElement('div');
    eff.className = 'recipe-info-eff';
    const pct = Math.round(info.efficiency * 100);
    eff.textContent = `Efficiency: ${pct}%`;
    host.appendChild(eff);
  }

  const table = document.createElement('div');
  table.className = 'recipe-info-table';
  const inputHeader = document.createElement('div');
  inputHeader.className = 'th';
  inputHeader.textContent = 'Input: final rate per minute';
  const supplyHeader = document.createElement('div');
  supplyHeader.className = 'th';
  supplyHeader.textContent = 'Supply | Demand';
  table.append(inputHeader, supplyHeader);
  for (const slot of info.recipe.inputs) {
    const inb = info.inbound.find((c) => c.resource === slot.resource && c.kind === slot.kind);
    const supply = inb ? slot.rate : 0;
    const demand = slot.rate;
    table.append(
      cell(`${slot.resource} (${slot.kind})`),
      cell(`${supply} | ${demand}`),
    );
  }
  for (const slot of info.recipe.outputs) {
    const outb = info.outbound.find((c) => c.resource === slot.resource && c.kind === slot.kind);
    const current = outb ? slot.rate : 0;
    table.append(
      cell(`${slot.resource} (${slot.kind})`),
      cell(`${current} | ${slot.rate}`),
    );
  }
  host.appendChild(table);
}

function cell(text: string): HTMLElement {
  const d = document.createElement('div');
  d.className = 'td';
  d.textContent = text;
  return d;
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
