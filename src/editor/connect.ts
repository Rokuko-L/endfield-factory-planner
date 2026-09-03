import { saveDepotAssignments } from '../depot.ts';
import { isDepotMachine } from '../depot.ts';
import { openDepotPicker } from '../depotPicker.ts';
import { completeDraft } from '../connections.ts';
import { pickPortAt } from '../ports.ts';
import { autoPlaceBridges } from '../logistics.ts';
import { nextId } from '../ids.ts';
import { grid, state } from './state.ts';
import { setStatus } from './status.ts';
import { redraw } from './redraw.ts';

export async function handleDepotClick(machine: import('../types.ts').MachineInstance): Promise<boolean> {
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

function effectivePicked(picked: NonNullable<ReturnType<typeof pickPortAt>>): NonNullable<ReturnType<typeof pickPortAt>> {
  const assignment = state.depotAssignments[picked.machine.id];
  if (assignment && assignment.resource.trim() !== '') {
    return { ...picked, resource: assignment.resource, kind: assignment.kind } as typeof picked;
  }
  return picked;
}

export function handleConnectClick(tile: { x: number; y: number }): void {
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

  // Auto-place bridges where path crosses existing connections
  const bridges = autoPlaceBridges(
    result.connection.path,
    result.connection.kind,
    result.connection.resource,
    state.connections,
    state.machineTypes,
    nextId,
  );

  if (bridges.length > 0) {
    // Place bridge machines and their connections
    for (const bridge of bridges) {
      grid.placeMachine(bridge.machine);
      state.machines.push(bridge.machine);
      for (const conn of bridge.connections) {
        grid.placeConnectionTiles(conn.id, [bridge.machine]);
        state.connections.push(conn);
      }
    }
    // Place the main connection
    grid.placeConnectionTiles(result.connection.id, result.connection.path);
    state.connections.push(result.connection);
    setStatus(
      `Connected ${result.connection.resource} (${result.connection.kind}) with ${bridges.length} auto-bridge${bridges.length === 1 ? '' : 's'}.`,
    );
  } else {
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
  }

  state.draftSource = null;
  state.draftAdjacent = null;
  state.draftPath = null;
  redraw();
}

export function setMode(mode: 'place' | 'connect'): void {
  const modePlaceBtn = document.querySelector<HTMLButtonElement>('#mode-place')!;
  const modeConnectBtn = document.querySelector<HTMLButtonElement>('#mode-connect')!;
  const hintEl = document.querySelector<HTMLElement>('#hint')!;
  state.mode = mode;
  state.draftSource = null;
  state.draftAdjacent = null;
  state.draftPath = null;
  modePlaceBtn.classList.toggle('active', state.mode === 'place');
  modeConnectBtn.classList.toggle('active', state.mode === 'connect');
  if (state.mode === 'place') {
    hintEl.textContent = 'Place: click · R: rotate · right-click: remove machine';
  } else {
    hintEl.textContent = 'Connect: click an output port, then an input port · right-click a belt/pipe to remove';
  }
  redraw();
}
