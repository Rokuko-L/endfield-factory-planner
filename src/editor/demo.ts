import { saveDepotAssignments } from '../depot.ts';
import { nextId } from '../ids.ts';
import { completeDraft } from '../connections.ts';
import { allPortCells, pickPortAt } from '../ports.ts';
import type { Connection, MachineInstance, Orientation } from '../types.ts';
import { grid, state, setSelectedMachineId } from './state.ts';
import { clearAll } from './placement.ts';
import { setMode } from './connect.ts';
import { setStatus } from './status.ts';
import { redraw } from './redraw.ts';

function placeDemoMachine(
  typeName: string,
  x: number,
  y: number,
  orientation: Orientation = 0,
): MachineInstance | null {
  const type = state.machineTypes.find((t) => t.name === typeName);
  if (!type) return null;
  if (!grid.canPlaceWithOrientation(type, x, y, orientation)) return null;
  const m: MachineInstance = { id: nextId('machine'), type, x, y, orientation };
  grid.placeMachine(m);
  state.machines.push(m);
  return m;
}

function demoConnect(
  from: MachineInstance,
  to: MachineInstance,
  resource: string,
  kind: 'item' | 'fluid',
): Connection | null {
  // Pick a real output cell on `from` and a real input cell on `to`
  // (edge bands or ports — band-only machines like the Fitting Unit have
  // no `ports` entries at all). Prefer cells not already used by another
  // connection so parallel belts terminate on separate tiles.
  const used = new Set(
    state.connections.flatMap((c) => c.path.map((t) => `${t.x},${t.y}`)),
  );
  const fromCells = allPortCells([from]).filter((p) => p.type === 'output' && p.kind === kind);
  const toCells = allPortCells([to]).filter((p) => p.type === 'input' && p.kind === kind);
  const sourceCell = fromCells.find((p) => !used.has(`${p.cell.x},${p.cell.y}`)) ?? fromCells[0];
  const targetCell = toCells.find((p) => !used.has(`${p.cell.x},${p.cell.y}`)) ?? toCells[0];
  if (!sourceCell || !targetCell) {
    setStatus(`Demo connect failed: no ${kind} ${!sourceCell ? 'output' : 'input'} port on ${!sourceCell ? from.type.name : to.type.name}.`, true);
    return null;
  }
  const source: NonNullable<ReturnType<typeof pickPortAt>> = {
    machine: sourceCell.machine,
    side: sourceCell.side,
    cellIndex: sourceCell.cellIndex,
    type: sourceCell.type,
    kind: sourceCell.kind,
    resource,
    portId: sourceCell.portId,
    cell: sourceCell.cell,
    adjacentTiles: sourceCell.adjacentTiles,
  };
  const target: NonNullable<ReturnType<typeof pickPortAt>> = {
    machine: targetCell.machine,
    side: targetCell.side,
    cellIndex: targetCell.cellIndex,
    type: targetCell.type,
    kind: targetCell.kind,
    resource: targetCell.resource,
    portId: targetCell.portId,
    cell: targetCell.cell,
    adjacentTiles: targetCell.adjacentTiles,
  };
  const result = completeDraft(grid, source, target, state.connections);
  if ('error' in result) {
    setStatus(`Demo connect failed: ${result.error}`, true);
    return null;
  }
  try {
    grid.placeConnectionTiles(result.connection.id, result.connection.path);
  } catch (err) {
    setStatus(`Demo connect failed: ${(err as Error).message}`, true);
    return null;
  }
  state.connections.push(result.connection);
  return result.connection;
}

export function loadLcValleyDemo(): void {
  clearAll();
  setMode('place');
  // Layout fits the current catalog sizes (Depot Unloader 3×1, Fitting Unit
  // 3×3, Packaging Unit 6×4, Depot Loader 3×1, Electric Pylon 2×2). The two
  // pylons sit inside each other's AoE so every powered machine is covered.
  // Powder corridors stay disjoint: powder1 approaches from the west along
  // row 15, powder2 sits under the Packaging Unit and runs straight up
  // column 17. With one-connection-per-tile they cannot share tiles.
  const amethystUnloader = placeDemoMachine('Depot Unloader', 4, 8);
  const fittingUnit = placeDemoMachine('Fitting Unit', 8, 8);
  const packagingUnit = placeDemoMachine('Packaging Unit', 14, 8);
  const lcLoader = placeDemoMachine('Depot Loader', 21, 9);
  const lcLoader2 = placeDemoMachine('Depot Loader', 21, 12);
  const powder1 = placeDemoMachine('Depot Unloader', 8, 16);
  const powder2 = placeDemoMachine('Depot Unloader', 16, 16);
  const pylon1 = placeDemoMachine('Electric Pylon', 10, 12);
  const pylon2 = placeDemoMachine('Electric Pylon', 13, 13);
  const batterySplitter = placeDemoMachine('Splitter', 20, 8);
  if (!amethystUnloader || !fittingUnit || !packagingUnit || !lcLoader || !lcLoader2 || !powder1 || !powder2 || !pylon1 || !pylon2 || !batterySplitter) {
    setStatus('Demo: a machine is missing from the catalog or does not fit.', true);
    return;
  }
  // LC Valley Battery = Amethyst Part 30/min + Originium Powder 60/min → 6/min,
  // so the powder line needs TWO belts to run the Packaging Unit at 100%.
  state.depotAssignments[amethystUnloader.id] = { resource: 'Amethyst Fiber', kind: 'item', rate: 30 };
  state.depotAssignments[powder1.id] = { resource: 'Originium Powder', kind: 'item', rate: 30 };
  state.depotAssignments[powder2.id] = { resource: 'Originium Powder', kind: 'item', rate: 30 };
  saveDepotAssignments(state.depotAssignments);
  const results = [
    demoConnect(amethystUnloader, fittingUnit, 'Amethyst Fiber', 'item'),
    demoConnect(fittingUnit, packagingUnit, 'Amethyst Part', 'item'),
    demoConnect(powder1, packagingUnit, 'Originium Powder', 'item'),
    demoConnect(powder2, packagingUnit, 'Originium Powder', 'item'),
    // Splitter case: 6/min of batteries split round-robin into 2 loaders (3/min each).
    demoConnect(packagingUnit, batterySplitter, 'LC Valley Battery', 'item'),
    demoConnect(batterySplitter, lcLoader, 'LC Valley Battery', 'item'),
    demoConnect(batterySplitter, lcLoader2, 'LC Valley Battery', 'item'),
  ];
  if (results.some((c) => c === null)) {
    setStatus('Demo: one or more demo connections failed.', true);
    redraw();
    return;
  }
  setSelectedMachineId(packagingUnit.id);
  setStatus('LC Valley demo loaded — 6 LC Valley Battery / min at 100% efficiency, split across 2 loaders.');
  redraw();
}
