import { ALL_MACHINE_TYPES } from './data.ts';
import { Grid } from './grid.ts';
import { Renderer } from './renderer.ts';
import { findPathMulti } from './pathfinding.ts';
import type {
  Connection,
  MachineInstance,
  Orientation,
  ResourceKind,
  Side,
} from './types.ts';
import { getAdjacentTile, transformPort } from './geometry.ts';
import './style.css';

const GRID_SIZE = 50;
const ORIENTATIONS: readonly Orientation[] = [0, 90, 180, 270];

const select = document.querySelector<HTMLSelectElement>('#machine-select')!;
const orientationLabel =
  document.querySelector<HTMLElement>('#orientation-label')!;
const statusEl = document.querySelector<HTMLElement>('#status')!;
const metricsEl = document.querySelector<HTMLElement>('#metrics')!;
const hintEl = document.querySelector<HTMLElement>('#hint')!;
const clearAllBtn = document.querySelector<HTMLButtonElement>('#clear-all')!;
const clearConnectionsBtn = document.querySelector<HTMLButtonElement>(
  '#clear-connections',
)!;
const modePlaceBtn = document.querySelector<HTMLButtonElement>('#mode-place')!;
const modeConnectBtn = document.querySelector<HTMLButtonElement>('#mode-connect')!;
const canvas = document.querySelector<HTMLCanvasElement>('#grid')!;

const grid = new Grid(GRID_SIZE, GRID_SIZE);
const renderer = new Renderer(canvas, grid);

/** A picked port cell on a placed machine. */
interface PickedPort {
  machine: MachineInstance;
  side: Side; // rotated side
  /** The cell of the side closest to the user's click. Used for highlighting. */
  cellIndex: number;
  kind: ResourceKind;
  resource: string;
  /**
   * Unique id for this specific port cell. Bands get `band:<side>:<i>`,
   * single-tile ports get `port:<portDefId>`.
   */
  portId: string;
  /**
   * Adjacent tiles for *every* cell along this side. The pathfinder
   * treats this as a multi-source set so A* can pick the optimal
   * start cell even when the user didn't click exactly on it.
   */
  adjacentTiles: { x: number; y: number }[];
}

/** The full state of the editor. */
const state = {
  machines: [] as MachineInstance[],
  connections: [] as Connection[],
  selectedIndex: 0,
  orientation: 0 as Orientation,
  mode: 'place' as 'place' | 'connect',
  hover: null as { x: number; y: number } | null,
  invalidFlash: null as { x: number; y: number; w: number; h: number } | null,
  draftSource: null as PickedPort | null,
  draftAdjacent: null as { x: number; y: number } | null,
  draftPath: null as { x: number; y: number }[] | null,
};

let idCounter = 0;

function selectedType() {
  return ALL_MACHINE_TYPES[state.selectedIndex]!;
}

function nextId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${++idCounter}`;
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

function updateModeUi(): void {
  modePlaceBtn.classList.toggle('active', state.mode === 'place');
  modeConnectBtn.classList.toggle('active', state.mode === 'connect');
  if (state.mode === 'place') {
    hintEl.textContent = 'Place: click · R: rotate · right-click: remove machine';
  } else {
    hintEl.textContent =
      'Connect: click an output port, then an input port · right-click a belt/pipe to remove';
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

function removeMachineAt(x: number, y: number): void {
  const id = grid.getOccupancyAt(x, y);
  if (!id) return;
  // Also remove any connection that referenced this machine. Today's
  // implementation keeps connections simple: drop any whose source or
  // destination machine id matches the removed one.
  const removedMachines = new Set([id]);
  for (const c of [...state.connections]) {
    if (
      removedMachines.has(c.fromMachineId) ||
      removedMachines.has(c.toMachineId)
    ) {
      grid.removeConnection(c.id);
    }
  }
  state.connections = state.connections.filter(
    (c) =>
      !removedMachines.has(c.fromMachineId) &&
      !removedMachines.has(c.toMachineId),
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
    `Connections: ${state.connections.length}\n` +
    `Bounding box: ${area} tile${area === 1 ? '' : 's'}`;
}

/**
 * Enumerate every "port cell" on every placed machine as a
 * (machine, side, cellIndex, kind, resource, portId, cell) tuple.
 * For edge bands, every cell along the side is its own port cell.
 * For single-tile PortDef, only the cell at the port's tileIndex.
 */
interface PortCell {
  machine: MachineInstance;
  side: Side;
  cellIndex: number;
  kind: ResourceKind;
  resource: string;
  /** `band:<unrotatedSide>:<i>` for bands, `port:<portDefId>` for single-tile ports. */
  portId: string;
  cell: { x: number; y: number };
  /** Adjacent tiles for *every* cell along this side. Multi-source set for A*. */
  adjacentTiles: { x: number; y: number }[];
}

function allPortCells(): PortCell[] {
  const out: PortCell[] = [];
  for (const m of state.machines) {
    for (const [unrotatedSide, band] of Object.entries(m.type.edgeBands ?? {})) {
      if (!band) continue;
      const side = rotateSideStatic(unrotatedSide as Side, m.orientation);
      const count =
        side === 'north' || side === 'south' ? m.type.width : m.type.height;
      const adjacentTiles: { x: number; y: number }[] = [];
      for (let i = 0; i < count; i++) {
        adjacentTiles.push(getAdjacentTile(side, i, m));
      }
      for (let i = 0; i < count; i++) {
        out.push({
          machine: m,
          side,
          cellIndex: i,
          kind: band.resourceKind,
          resource: resourceForBand(m, unrotatedSide as Side, band.resourceKind),
          portId: `band:${unrotatedSide}:${i}`,
          cell: adjacentTiles[i]!,
          adjacentTiles,
        });
      }
    }
    for (const port of m.type.ports) {
      const { side, tileIndex } = transformPort(port, m);
      out.push({
        machine: m,
        side,
        cellIndex: tileIndex,
        kind: port.kind,
        resource: port.resource,
        portId: `port:${port.id}`,
        cell: getAdjacentTile(side, tileIndex, m),
        adjacentTiles: [getAdjacentTile(side, tileIndex, m)],
      });
    }
  }
  return out;
}

/**
 * Local copy of `rotateSide` so we don't need to import it again — the
 * static map is small enough to inline here. Kept for symmetry with
 * `transformPort` which is imported.
 */
function rotateSideStatic(side: Side, orientation: Orientation): Side {
  const order: Side[] = ['north', 'east', 'south', 'west'];
  const quarters = orientation / 90;
  const idx = order.indexOf(side);
  return order[(idx + quarters) % 4]!;
}

/**
 * Look up a representative resource name for a band. Today the catalog
 * uses a single resource per band (e.g. Iron Ore input on Furnace's
 * south band). We carry the kind through and pick a default name.
 */
function resourceForBand(
  _m: MachineInstance,
  _side: Side,
  kind: ResourceKind,
): string {
  // Today: catalog machines only use a single item resource ('Iron Ore'
  // or 'Iron Plate'). Future machines with per-band resources should
  // extend the data model to name them.
  if (kind === 'fluid') return 'Water';
  return 'Iron Ore';
}

/**
 * Pick the closest port cell to a given tile. Used by the connect-mode
 * click handler: the user clicks somewhere; we pick the nearest port
 * cell on any machine.
 */
function pickPortAt(tile: { x: number; y: number }): PortCell | null {
  let best: PortCell | null = null;
  let bestDist = Infinity;
  for (const p of allPortCells()) {
    const dx = p.cell.x - tile.x;
    const dy = p.cell.y - tile.y;
    const d = dx * dx + dy * dy;
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }
  // Only accept ports within a small radius of the click (3 tiles).
  if (best && bestDist > 9) return null;
  return best;
}

function completeDraft(target: PortCell): void {
  const source = state.draftSource;
  if (!source) return;
  if (source.machine.id === target.machine.id) {
    setStatus('Cannot connect a machine to itself.', true);
    state.draftSource = null;
    state.draftAdjacent = null;
    state.draftPath = null;
    redraw();
    return;
  }
  if (source.kind !== target.kind) {
    setStatus(
      `Resource kind mismatch: '${source.kind}' vs '${target.kind}'.`,
      true,
    );
    state.draftSource = null;
    state.draftAdjacent = null;
    state.draftPath = null;
    redraw();
    return;
  }
  if (source.resource !== target.resource) {
    setStatus(
      `Resource mismatch: '${source.resource}' vs '${target.resource}'.`,
      true,
    );
    state.draftSource = null;
    state.draftAdjacent = null;
    state.draftPath = null;
    redraw();
    return;
  }

  // Multi-source / multi-target A*: the pathfinder is free to use any
  // adjacent tile on the source side and any adjacent tile on the
  // target side. This solves the "clicked the wrong cell, the path
  // comes out somewhere else" problem — the optimal port cell on
  // each side is what A* actually uses.
  const path = findPathMulti(grid, source.adjacentTiles, target.adjacentTiles);
  if (!path || path.length === 0) {
    setStatus('No path found between the picked ports.', true);
    state.draftSource = null;
    state.draftAdjacent = null;
    state.draftPath = null;
    redraw();
    return;
  }

  // Figure out which port cells A* actually used. The first tile of
  // the path lies on the source's adjacent side; the last tile lies
  // on the target's adjacent side. Map them back to cellIndex so the
  // connection's `fromPortId` / `toPortId` reflect the real entry/exit
  // points, not the cells the user happened to click.
  const fromTile = path[0]!;
  const toTile = path[path.length - 1]!;
  const fromCellIndex = source.adjacentTiles.findIndex(
    (t) => t.x === fromTile.x && t.y === fromTile.y,
  );
  const toCellIndex = target.adjacentTiles.findIndex(
    (t) => t.x === toTile.x && t.y === toTile.y,
  );

  // The path's first and last tiles sit adjacent to the source and
  // target machines — they are not part of the connection itself.
  // The "interior" of the path is what the connection occupies.
  const interior = path.length > 2 ? path.slice(1, -1) : [];

  finalizeConnection(
    source,
    fromCellIndex,
    target,
    toCellIndex,
    interior,
  );
}

function finalizeConnection(
  source: PickedPort,
  fromCellIndex: number,
  target: PortCell,
  toCellIndex: number,
  path: { x: number; y: number }[],
): void {
  // Build port ids that point at the *actual* port cells A* used,
  // not just the side. For bands this means `band:<side>:<i>`; for
  // single-tile ports the original portId already encodes the cell.
  const fromPortId =
    fromCellIndex >= 0 && source.portId.startsWith('band:')
      ? `band:${source.portId.slice('band:'.length)}:${fromCellIndex}`
      : source.portId;
  const toPortId =
    toCellIndex >= 0 && target.portId.startsWith('band:')
      ? `band:${target.portId.slice('band:'.length)}:${toCellIndex}`
      : target.portId;

  const connection: Connection = {
    id: nextId('conn'),
    fromMachineId: source.machine.id,
    fromPortId,
    toMachineId: target.machine.id,
    toPortId,
    kind: source.kind,
    resource: source.resource,
    path,
  };
  try {
    grid.placeConnectionTiles(connection.id, path);
  } catch (err) {
    setStatus(`Could not place connection: ${(err as Error).message}`, true);
    state.draftSource = null;
    state.draftAdjacent = null;
    state.draftPath = null;
    redraw();
    return;
  }
  state.connections.push(connection);
  setStatus(
    `Connected ${source.resource} (${source.kind}) across ${path.length} tile${path.length === 1 ? '' : 's'}.`,
  );
  state.draftSource = null;
  state.draftAdjacent = null;
  state.draftPath = null;
  redraw();
}

function handleConnectClick(tile: { x: number; y: number }): void {
  const picked = pickPortAt(tile);
  if (!picked) {
    // Click on empty area cancels any current selection.
    if (state.draftSource) {
      setStatus('Cancelled connection draft.');
    }
    state.draftSource = null;
    state.draftAdjacent = null;
    state.draftPath = null;
    redraw();
    return;
  }
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
    setStatus(
      `Source picked: ${picked.resource} (${picked.kind}) on ${picked.machine.type.name}. Click an input port to connect.`,
    );
    redraw();
    return;
  }
  completeDraft(picked);
}

function setMode(mode: 'place' | 'connect'): void {
  state.mode = mode;
  // Drop any in-progress draft when switching modes.
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
    const valid = grid.canPlace(type, state.hover.x, state.hover.y);
    preview = { ...state.hover, w: type.width, h: type.height, valid };
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
  if (!tile) return;
  if (state.mode === 'place') {
    placeMachine(tile.x, tile.y);
  } else {
    handleConnectClick(tile);
  }
});

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const tile = eventToTile(e);
  if (!tile) return;
  // Connection takes precedence: right-click on a belt/pipe removes
  // the connection; right-click on a machine removes the machine.
  if (grid.getConnectionAt(tile.x, tile.y)) {
    removeConnectionAt(tile.x, tile.y);
  } else {
    removeMachineAt(tile.x, tile.y);
  }
});

clearAllBtn.addEventListener('click', clearAll);
clearConnectionsBtn.addEventListener('click', clearConnections);
modePlaceBtn.addEventListener('click', () => setMode('place'));
modeConnectBtn.addEventListener('click', () => setMode('connect'));

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

// ---- Init ----

populateSelector();
updateOrientationLabel();
updateModeUi();
renderer.resize();
redraw();
setStatus('Ready. Pick a machine and click the grid.');