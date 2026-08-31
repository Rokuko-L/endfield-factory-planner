import { Grid } from './grid.ts';
import { Renderer } from './renderer.ts';
import { reconcileConnectionRecipes } from './recipes.ts';
import { loadMachineTypes } from './machineStore.ts';
import { openMachineEditor } from './machineEditor.ts';
import { nextId } from './ids.ts';
import { pickPortAt } from './ports.ts';
import { completeDraft } from './connections.ts';
import { isDepotMachine, loadDepotAssignments, saveDepotAssignments, sinkTotals, stalledCount } from './depot.ts';
import { openDepotPicker } from './depotPicker.ts';
import type { MachineInstance, MachineType, Orientation } from './types.ts';
import type { EditorState } from './layout.ts';
import './style.css';

const GRID_SIZE = 50;
const ORIENTATIONS: readonly Orientation[] = [0, 90, 180, 270];

const select = document.querySelector<HTMLSelectElement>('#machine-select')!;
const orientationLabel = document.querySelector<HTMLElement>('#orientation-label')!;
const statusEl = document.querySelector<HTMLElement>('#status')!;
const metricsEl = document.querySelector<HTMLElement>('#metrics')!;
const hintEl = document.querySelector<HTMLElement>('#hint')!;
const clearAllBtn = document.querySelector<HTMLButtonElement>('#clear-all')!;
const clearConnectionsBtn = document.querySelector<HTMLButtonElement>('#clear-connections')!;
const modePlaceBtn = document.querySelector<HTMLButtonElement>('#mode-place')!;
const modeConnectBtn = document.querySelector<HTMLButtonElement>('#mode-connect')!;
const defineMachinesBtn = document.querySelector<HTMLButtonElement>('#define-machines')!;
const canvas = document.querySelector<HTMLCanvasElement>('#grid')!;

const grid = new Grid(GRID_SIZE, GRID_SIZE);
const renderer = new Renderer(canvas, grid);

const state: EditorState = {
  machineTypes: loadMachineTypes(),
  machines: [],
  connections: [],
  selectedIndex: 0,
  orientation: 0,
  mode: 'place',
  hover: null,
  invalidFlash: null,
  draftSource: null,
  draftAdjacent: null,
  draftPath: null,
  depotAssignments: loadDepotAssignments(),
};

function selectedType(): MachineType {
  return state.machineTypes[state.selectedIndex]!;
}

function eventToTile(e: MouseEvent): { x: number; y: number } | null {
  const rect = canvas.getBoundingClientRect();
  const tile = renderer.tilePx;
  const px = Math.floor((e.clientX - rect.left) / tile);
  const py = Math.floor((e.clientY - rect.top) / tile);
  return grid.isWithinBounds(px, py) ? { x: px, y: py } : null;
}

function setStatus(message: string, isError = false): void {
  statusEl.textContent = message;
  statusEl.classList.toggle('no-space', isError);
}

function updateOrientationLabel(): void {
  orientationLabel.textContent = `${state.orientation}°`;
}

function updateModeUi(): void {
  modePlaceBtn.classList.toggle('active', state.mode === 'place');
  modeConnectBtn.classList.toggle('active', state.mode === 'connect');
  if (state.mode === 'place') {
    hintEl.textContent = 'Place: click · R: rotate · right-click: remove machine';
  } else {
    hintEl.textContent = 'Connect: click an output port, then an input port · right-click a belt/pipe to remove';
  }
}

function rotate(): void {
  const idx = ORIENTATIONS.indexOf(state.orientation);
  state.orientation = ORIENTATIONS[(idx + 1) % ORIENTATIONS.length]!;
  updateOrientationLabel();
  redraw();
}

function placeMachine(x: number, y: number): void {
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

async function handleDepotClick(machine: MachineInstance): Promise<boolean> {
  if (!isDepotMachine(machine)) return false;
  const current = state.depotAssignments[machine.id] ?? null;
  const next = await openDepotPicker(machine, state.machineTypes, current);
  if (next) {
    state.depotAssignments[machine.id] = next;
  } else if (current && !next) {
    delete state.depotAssignments[machine.id];
  } else if (!current && !next) {
    setStatus(`No resource set for ${machine.type.name} — acts as generic sink/source.`);
    redraw();
    return true;
  }
  saveDepotAssignments(state.depotAssignments);
  const label = next ? `${next.resource} (${next.kind})` : 'generic';
  setStatus(`${machine.type.name} now ${label}.`);
  redraw();
  return true;
}

function removeMachineAt(x: number, y: number): void {
  const id = grid.getOccupancyAt(x, y);
  if (!id) return;
  if (state.depotAssignments[id]) {
    delete state.depotAssignments[id];
    saveDepotAssignments(state.depotAssignments);
  }
  const removedMachines = new Set([id]);
  for (const c of [...state.connections]) {
    if (removedMachines.has(c.fromMachineId) || removedMachines.has(c.toMachineId)) {
      grid.removeConnection(c.id);
    }
  }
  state.connections = state.connections.filter(
    (c) => !removedMachines.has(c.fromMachineId) && !removedMachines.has(c.toMachineId),
  );
  grid.removeMachine(id);
  state.machines = state.machines.filter((m) => m.id !== id);
  setStatus('Removed machine (and any connections referencing it).');
  redraw();
}

function removeConnectionAt(x: number, y: number): void {
  const id = grid.getConnectionAt(x, y);
  if (!id) return;
  grid.removeConnection(id);
  state.connections = state.connections.filter((c) => c.id !== id);
  setStatus('Removed connection.');
  redraw();
}

function clearAll(): void {
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

function clearConnections(): void {
  for (const c of state.connections) grid.removeConnection(c.id);
  state.connections = [];
  state.draftSource = null;
  state.draftAdjacent = null;
  state.draftPath = null;
  setStatus('Cleared connections.');
  redraw();
}

function boundingBoxArea(): number {
  if (state.machines.length === 0) return 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const m of state.machines) {
    const isRot = m.orientation === 90 || m.orientation === 270;
    const effW = isRot ? m.type.height : m.type.width;
    const effH = isRot ? m.type.width : m.type.height;
    minX = Math.min(minX, m.x);
    minY = Math.min(minY, m.y);
    maxX = Math.max(maxX, m.x + effW);
    maxY = Math.max(maxY, m.y + effH);
  }
  return (maxX - minX) * (maxY - minY);
}

function updateMetrics(): void {
  const area = boundingBoxArea();
  let text =
    `Machines: ${state.machines.length}\n` +
    `Connections: ${state.connections.length}\n` +
    `Bounding box: ${area} tile${area === 1 ? '' : 's'}`;
  const sinks = sinkTotals(state.connections, state.machines);
  if (sinks.size > 0) {
    text += '\nSinks:';
    for (const [id, info] of sinks) {
      const m = state.machines.find((x) => x.id === id);
      const label = m ? m.type.name : id;
      const parts = [...info.resources.entries()].map(([r, n]) => `${r} x${n}`).join(', ');
      text += `\n  ${label}: ${parts || '—'}`;
    }
  }
  const stalled = stalledCount(state.connections, state.machines);
  if (stalled > 0) text += `\nStalled: ${stalled} (no recipe)`;
  metricsEl.textContent = text;
}

function effectivePicked(picked: ReturnType<typeof pickPortAt>): NonNullable<ReturnType<typeof pickPortAt>> {
  if (!picked) return picked as never;
  const assignment = state.depotAssignments[picked.machine.id];
  if (assignment && assignment.resource.trim() !== '') {
    return { ...picked, resource: assignment.resource, kind: assignment.kind } as typeof picked;
  }
  return picked;
}

function handleConnectClick(tile: { x: number; y: number }): void {
  let picked = pickPortAt(tile, state.machines);
  if (!picked) {
    if (state.draftSource) setStatus('Cancelled connection draft.');
    state.draftSource = null;
    state.draftAdjacent = null;
    state.draftPath = null;
    redraw();
    return;
  }
  picked = effectivePicked(picked);
  if (!state.draftSource) {
    state.draftSource = {
      machine: picked.machine,
      side: picked.side,
      cellIndex: picked.cellIndex,
      kind: picked.kind,
      resource: picked.resource,
      portId: picked.portId,
      adjacentTiles: picked.adjacentTiles,
    };
    state.draftAdjacent = picked.cell;
    state.draftPath = null;
    const label = picked.resource.trim() !== '' ? picked.resource : 'generic';
    setStatus(
      `Source picked: ${label} (${picked.kind}) on ${picked.machine.type.name}. Click an input port to connect.`,
    );
    redraw();
    return;
  }
  const result = completeDraft(grid, state.draftSource, picked);
  if ('error' in result) {
    setStatus(result.error, true);
    state.draftSource = null;
    state.draftAdjacent = null;
    state.draftPath = null;
    redraw();
    return;
  }
  try {
    grid.placeConnectionTiles(result.connection.id, result.connection.path);
  } catch (err) {
    setStatus(`Could not place connection: ${(err as Error).message}`, true);
    state.draftSource = null;
    state.draftAdjacent = null;
    state.draftPath = null;
    redraw();
    return;
  }
  state.connections.push(result.connection);
  setStatus(
    `Connected ${result.connection.resource} (${result.connection.kind}) across ${result.connection.path.length} tile${result.connection.path.length === 1 ? '' : 's'}.`,
  );
  state.draftSource = null;
  state.draftAdjacent = null;
  state.draftPath = null;
  redraw();
}

function setMode(mode: 'place' | 'connect'): void {
  state.mode = mode;
  state.draftSource = null;
  state.draftAdjacent = null;
  state.draftPath = null;
  updateModeUi();
  redraw();
}

function redraw(): void {
  let preview = null;
  if (state.hover && state.mode === 'place') {
    const type = selectedType();
    const isRot = state.orientation === 90 || state.orientation === 270;
    const effW = isRot ? type.height : type.width;
    const effH = isRot ? type.width : type.height;
    const valid = grid.canPlaceWithOrientation(type, state.hover.x, state.hover.y, state.orientation);
    preview = { ...state.hover, w: effW, h: effH, valid };
  }
  renderer.draw(
    state.machines,
    state.connections,
    preview,
    state.invalidFlash,
    state.draftAdjacent,
    state.draftPath,
  );
  updateMetrics();
}

function populateSelector(): void {
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

select.addEventListener('change', () => {
  state.selectedIndex = Number(select.value);
  setStatus(`Selected ${selectedType().name}.`);
  redraw();
});

canvas.addEventListener('pointermove', (e) => {
  const tile = eventToTile(e);
  state.hover = tile;
  redraw();
});

canvas.addEventListener('pointerleave', () => {
  state.hover = null;
  redraw();
});

canvas.addEventListener('click', async (e) => {
  const tile = eventToTile(e);
  if (!tile) return;
  if (state.mode === 'place') {
    const occupantId = grid.getOccupancyAt(tile.x, tile.y);
    if (occupantId) {
      const occupant = state.machines.find((m) => m.id === occupantId);
      if (occupant && isDepotMachine(occupant)) {
        await handleDepotClick(occupant);
        return;
      }
    }
    placeMachine(tile.x, tile.y);
  } else handleConnectClick(tile);
});

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const tile = eventToTile(e);
  if (!tile) return;
  if (grid.getConnectionAt(tile.x, tile.y)) removeConnectionAt(tile.x, tile.y);
  else removeMachineAt(tile.x, tile.y);
});

clearAllBtn.addEventListener('click', clearAll);
clearConnectionsBtn.addEventListener('click', clearConnections);
modePlaceBtn.addEventListener('click', () => setMode('place'));
modeConnectBtn.addEventListener('click', () => setMode('connect'));
defineMachinesBtn.addEventListener('click', async () => {
  const result = await openMachineEditor();
  if (result) {
    state.machineTypes = result;
    populateSelector();
    state.connections = reconcileConnectionRecipes(state.connections, state.machines);
    setStatus(`Loaded ${result.length} machine type${result.length === 1 ? '' : 's'}.`);
    redraw();
  }
});

window.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLSelectElement) return;
  if (e.key === 'r' || e.key === 'R') {
    e.preventDefault();
    rotate();
  } else if (e.key === 'Escape') {
    if (state.draftSource) {
      state.draftSource = null;
      state.draftAdjacent = null;
      state.draftPath = null;
      setStatus('Cancelled connection draft.');
      redraw();
    }
  }
});

populateSelector();
updateOrientationLabel();
updateModeUi();
renderer.resize();
redraw();
setStatus('Ready. Pick a machine and click the grid.');
