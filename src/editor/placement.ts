import { saveDepotAssignments } from '../depot.ts';
import { nextId } from '../ids.ts';
import type { MachineInstance } from '../types.ts';
import { grid, state, ORIENTATIONS, selectedType } from './state.ts';
import { setStatus } from './status.ts';
import { redraw } from './redraw.ts';

export function updateOrientationLabel(): void {
  const el = document.querySelector<HTMLElement>('#orientation-label')!;
  el.textContent = `${state.orientation}°`;
}

export function rotate(): void {
  const idx = ORIENTATIONS.indexOf(state.orientation);
  state.orientation = ORIENTATIONS[(idx + 1) % ORIENTATIONS.length]!;
  updateOrientationLabel();
  redraw();
}

export function placeMachine(x: number, y: number): void {
  const type = selectedType();
  const isRot = state.orientation === 90 || state.orientation === 270;
  const effW = isRot ? type.height : type.width;
  const effH = isRot ? type.width : type.height;
  if (!grid.canPlaceWithOrientation(type, x, y, state.orientation)) {
    setStatus(`Invalid placement! '${type.name}' overlaps or is out of bounds.`, true);
    state.invalidFlash = { x, y, w: effW, h: effH };
    redraw();
    setTimeout(() => {
      state.invalidFlash = null;
      redraw();
    }, 350);
    return;
  }
  const machine: MachineInstance = {
    id: nextId('machine'),
    type,
    x,
    y,
    orientation: state.orientation,
  };
  grid.placeMachine(machine);
  state.machines.push(machine);
  setStatus(`Placed ${type.name} at (${x}, ${y}) ${state.orientation}°.`);
  redraw();
}

export function removeMachineAt(x: number, y: number): void {
  const id = grid.getOccupancyAt(x, y);
  if (!id) return;
  if (state.depotAssignments[id]) {
    delete state.depotAssignments[id];
    saveDepotAssignments(state.depotAssignments);
  }
  for (const c of [...state.connections]) {
    if (c.fromMachineId === id || c.toMachineId === id) {
      grid.removeConnection(c.id);
    }
  }
  state.connections = state.connections.filter(
    (c) => c.fromMachineId !== id && c.toMachineId !== id,
  );
  grid.removeMachine(id);
  state.machines = state.machines.filter((m) => m.id !== id);
  setStatus('Removed machine (and any connections referencing it).');
  redraw();
}

export function removeConnectionAt(x: number, y: number): void {
  const id = grid.getConnectionAt(x, y);
  if (!id) return;
  grid.removeConnection(id);
  state.connections = state.connections.filter((c) => c.id !== id);
  setStatus('Removed connection.');
  redraw();
}

export function clearAll(): void {
  for (const m of state.machines) grid.removeMachine(m.id);
  for (const c of state.connections) grid.removeConnection(c.id);
  state.machines = [];
  state.connections = [];
  state.hover = null;
  state.draftSource = null;
  state.draftAdjacent = null;
  state.draftPath = null;
  state.depotAssignments = {};
  saveDepotAssignments(state.depotAssignments);
  setStatus('Cleared layout.');
  redraw();
}

export function clearConnections(): void {
  for (const c of state.connections) grid.removeConnection(c.id);
  state.connections = [];
  state.draftSource = null;
  state.draftAdjacent = null;
  state.draftPath = null;
  setStatus('Cleared connections.');
  redraw();
}

export function populateSelector(): void {
  const select = document.querySelector<HTMLSelectElement>('#machine-select')!;
  select.innerHTML = '';
  for (const [i, t] of state.machineTypes.entries()) {
    const option = document.createElement('option');
    option.value = String(i);
    option.textContent = `${t.name}  (${t.width}×${t.height})`;
    select.appendChild(option);
  }
  if (state.machineTypes.length > 0) {
    state.selectedIndex = Math.min(state.selectedIndex, state.machineTypes.length - 1);
    select.value = String(state.selectedIndex);
  } else {
    state.selectedIndex = 0;
    select.value = '0';
  }
}
