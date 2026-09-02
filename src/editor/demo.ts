import { saveDepotAssignments } from '../depot.ts';
import { nextId } from '../ids.ts';
import { completeDraft } from '../connections.ts';
import { pickPortAt } from '../ports.ts';
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
  const fromType = from.type;
  const toType = to.type;
  if (fromType.ports.length === 0 || toType.ports.length === 0) return null;
  const fp = fromType.ports.find((p) => p.kind === kind) ?? fromType.ports[0]!;
  const tp = toType.ports.find((p) => p.kind === kind) ?? toType.ports[0]!;
  const source: ReturnType<typeof pickPortAt> = {
    machine: from,
    side: 'north',
    cellIndex: 0,
    kind: fp.kind,
    resource: fp.resource,
    portId: `port:${fp.id}`,
    cell: { x: from.x, y: from.y - 1 },
    adjacentTiles: [{ x: from.x, y: from.y - 1 }],
  };
  const target: ReturnType<typeof pickPortAt> = {
    machine: to,
    side: 'south',
    cellIndex: 0,
    kind: tp.kind,
    resource: tp.resource,
    portId: `port:${tp.id}`,
    cell: { x: to.x, y: to.y + 1 },
    adjacentTiles: [{ x: to.x, y: to.y + 1 }],
  };
  const sourceWithResource = { ...source, resource } as typeof source;
  const result = completeDraft(grid, sourceWithResource, target);
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
  const y = 6;
  const ferriumUnloader = placeDemoMachine('Depot Unloader', 4, y + 4);
  const ferriumConveyor = placeDemoMachine('Belt Bridge', 6, y + 4);
  const fittingUnit = placeDemoMachine('Fitting Unit', 7, y + 3);
  const originUnloader = placeDemoMachine('Depot Unloader', 4, y + 10);
  const originConveyor = placeDemoMachine('Belt Bridge', 6, y + 10);
  const packagingUnit = placeDemoMachine('Packaging Unit', 7, y + 7);
  const lcLoader = placeDemoMachine('Depot Loader', 14, y + 6);
  if (!ferriumUnloader || !ferriumConveyor || !fittingUnit || !originUnloader || !originConveyor || !packagingUnit || !lcLoader) {
    setStatus('Demo: missing required machines in catalog.', true);
    return;
  }
  state.depotAssignments[ferriumUnloader.id] = { resource: 'Ferrium', kind: 'item', rate: 30 };
  state.depotAssignments[originUnloader.id] = { resource: 'Originium Powder', kind: 'item', rate: 60 };
  saveDepotAssignments(state.depotAssignments);
  const ferriumToFitting = demoConnect(ferriumUnloader, fittingUnit, 'Ferrium', 'item');
  const fittingToPackaging = demoConnect(fittingUnit, packagingUnit, 'Ferrium Part', 'item');
  const originToPackaging = demoConnect(originUnloader, packagingUnit, 'Originium Powder', 'item');
  const packagingToLoader = demoConnect(packagingUnit, lcLoader, 'LC Valley Battery', 'item');
  if (!ferriumToFitting || !fittingToPackaging || !originToPackaging || !packagingToLoader) {
    setStatus('Demo: one or more demo connections failed.', true);
  }
  setSelectedMachineId(packagingUnit.id);
  setStatus('LC Valley demo loaded — 6 LC Valley Battery / min, 100% efficiency.');
  redraw();
}
