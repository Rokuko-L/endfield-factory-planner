import { ALL_MACHINE_TYPES } from './data.ts';
import { Grid } from './grid.ts';
import { Renderer } from './renderer.ts';
import type { MachineInstance, Orientation } from './types.ts';
import './style.css';

const GRID_SIZE = 50;
const ORIENTATIONS: readonly Orientation[] = [0, 90, 180, 270];

const select = document.querySelector<HTMLSelectElement>('#machine-select')!;
const orientationLabel =
  document.querySelector<HTMLElement>('#orientation-label')!;
const statusEl = document.querySelector<HTMLElement>('#status')!;
const metricsEl = document.querySelector<HTMLElement>('#metrics')!;
const clearAllBtn = document.querySelector<HTMLButtonElement>('#clear-all')!;
const canvas = document.querySelector<HTMLCanvasElement>('#grid')!;

const grid = new Grid(GRID_SIZE, GRID_SIZE);
const renderer = new Renderer(canvas, grid);

/** State of the editor. */
const state = {
  machines: [] as MachineInstance[],
  selectedIndex: 0,
  orientation: 0 as Orientation,
  hover: null as { x: number; y: number } | null,
  invalidFlash: null as { x: number; y: number; w: number; h: number } | null,
};

let idCounter = 0;

function selectedType() {
  return ALL_MACHINE_TYPES[state.selectedIndex]!;
}

function nextId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `machine-${++idCounter}`;
}

/** Convert a mouse event to grid tile coordinates. */
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

function rotate(): void {
  const idx = ORIENTATIONS.indexOf(state.orientation);
  state.orientation = ORIENTATIONS[(idx + 1) % ORIENTATIONS.length]!;
  updateOrientationLabel();
  redraw();
}

function placeMachine(x: number, y: number): void {
  const type = selectedType();
  if (!grid.canPlace(type, x, y)) {
    setStatus(
      `Invalid placement! '${type.name}' overlaps or is out of bounds.`,
      true,
    );
    state.invalidFlash = { x, y, w: type.width, h: type.height };
    redraw();
    setTimeout(() => {
      state.invalidFlash = null;
      redraw();
    }, 350);
    return;
  }

  const machine: MachineInstance = {
    id: nextId(),
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

function removeMachineAt(x: number, y: number): void {
  const id = grid.getOccupancyAt(x, y);
  if (!id) return;
  grid.removeMachine(id);
  state.machines = state.machines.filter((m) => m.id !== id);
  setStatus('Removed machine.');
  redraw();
}

function clearAll(): void {
  for (const m of state.machines) grid.removeMachine(m.id);
  state.machines = [];
  state.hover = null;
  setStatus('Cleared layout.');
  redraw();
}

function boundingBoxArea(): number {
  if (state.machines.length === 0) return 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const m of state.machines) {
    minX = Math.min(minX, m.x);
    minY = Math.min(minY, m.y);
    maxX = Math.max(maxX, m.x + m.type.width);
    maxY = Math.max(maxY, m.y + m.type.height);
  }
  return (maxX - minX) * (maxY - minY);
}

function updateMetrics(): void {
  const area = boundingBoxArea();
  metricsEl.textContent =
    `Machines: ${state.machines.length}\n` +
    `Bounding box: ${area} tile${area === 1 ? '' : 's'}`;
}

function redraw(): void {
  let preview = null;
  if (state.hover) {
    const type = selectedType();
    const valid = grid.canPlace(type, state.hover.x, state.hover.y);
    preview = { ...state.hover, w: type.width, h: type.height, valid };
  }
  renderer.draw(state.machines, preview, state.invalidFlash);
  updateMetrics();
}

function populateSelector(): void {
  for (const [i, t] of ALL_MACHINE_TYPES.entries()) {
    const option = document.createElement('option');
    option.value = String(i);
    option.textContent = `${t.name}  (${t.width}×${t.height})`;
    select.appendChild(option);
  }
  select.value = String(state.selectedIndex);
}

// ---- Event wiring ----

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

canvas.addEventListener('click', (e) => {
  const tile = eventToTile(e);
  if (tile) placeMachine(tile.x, tile.y);
});

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const tile = eventToTile(e);
  if (tile) removeMachineAt(tile.x, tile.y);
});

clearAllBtn.addEventListener('click', clearAll);

window.addEventListener('keydown', (e) => {
  if (e.key === 'r' || e.key === 'R') {
    e.preventDefault();
    rotate();
  }
});

// ---- Init ----

populateSelector();
updateOrientationLabel();
renderer.resize();
redraw();
setStatus('Ready. Pick a machine and click the grid.');