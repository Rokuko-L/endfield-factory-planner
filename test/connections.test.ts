import { describe, expect, it } from 'vitest';
import { Grid } from '../src/grid.ts';
import { completeDraft } from '../src/connections.ts';
import { allPortCells } from '../src/ports.ts';
import type { MachineInstance, MachineType } from '../src/types.ts';
import type { PickedPort, PortCell } from '../src/layout.ts';

/** north band = output, south band = input (like Refining/Moulding Units). */
const producer: MachineType = {
  name: 'Test Producer',
  width: 3,
  height: 3,
  ports: [],
  edgeBands: {
    north: { type: 'output', resourceKind: 'item' },
    south: { type: 'input', resourceKind: 'item' },
  },
  recipes: [
    {
      id: 'smelt',
      inputs: [{ resource: 'Raw', kind: 'item', rate: 30 }],
      outputs: [{ resource: 'Refined', kind: 'item', rate: 30 }],
    },
  ],
};

const depot: MachineType = {
  name: 'Test Depot',
  width: 3,
  height: 1,
  noPower: true,
  ports: [
    { id: 'p_out', type: 'output', side: 'north', tileIndex: 1, resource: 'Raw', kind: 'item', rate: 30 },
    { id: 'p_in', type: 'input', side: 'north', tileIndex: 1, resource: '', kind: 'item', rate: 30 },
  ],
  recipes: [],
};

function makeMachine(type: MachineType, id: string, x: number, y: number): MachineInstance {
  return { id, type, x, y, orientation: 0 };
}

function portOf(machine: MachineInstance, portId: string): PortCell {
  const cell = allPortCells([machine]).find((p) => p.portId === portId);
  if (!cell) throw new Error(`no port ${portId} on ${machine.type.name}`);
  return cell;
}

function pickedOf(cell: PortCell): PickedPort {
  return {
    machine: cell.machine,
    side: cell.side,
    cellIndex: cell.cellIndex,
    type: cell.type,
    kind: cell.kind,
    resource: cell.resource,
    portId: cell.portId,
    adjacentTiles: cell.adjacentTiles,
  };
}

describe('completeDraft direction validation', () => {
  it('rejects a connection whose source port is an input', () => {
    const grid = new Grid(20, 20);
    const a = makeMachine(depot, 'a', 2, 8);
    const b = makeMachine(producer, 'b', 8, 4);
    grid.placeMachine(a);
    grid.placeMachine(b);
    const result = completeDraft(
      grid,
      pickedOf(portOf(a, 'port:p_in')),
      portOf(b, 'band:south:0'),
    );
    expect(result).toEqual({
      error: "Connection must start at an output port, but the source port is an input.",
    });
  });

  it('rejects a connection whose destination port is an output', () => {
    const grid = new Grid(20, 20);
    const a = makeMachine(depot, 'a', 2, 8);
    const b = makeMachine(producer, 'b', 8, 4);
    grid.placeMachine(a);
    grid.placeMachine(b);
    const result = completeDraft(
      grid,
      pickedOf(portOf(a, 'port:p_out')),
      portOf(b, 'band:north:0'),
    );
    expect(result).toEqual({
      error: "Connection must end at an input port, but the destination port is an output.",
    });
  });

  it('allows output → input and infers the resource from the source machine recipes', () => {
    const grid = new Grid(20, 20);
    const a = makeMachine(depot, 'a', 2, 8);
    const b = makeMachine(producer, 'b', 8, 4);
    grid.placeMachine(a);
    grid.placeMachine(b);
    const result = completeDraft(
      grid,
      pickedOf(portOf(a, 'port:p_out')),
      portOf(b, 'band:south:1'),
    );
    if ('error' in result) throw new Error(`expected success, got: ${result.error}`);
    expect(result.connection.resource).toBe('Raw');
    expect(result.connection.matchedRecipeId).toBe('smelt');
  });

  it('carries the source recipe output through generic bands and matches the next recipe', () => {
    const grid = new Grid(20, 20);
    const b1 = makeMachine(producer, 'b1', 2, 2);
    const b2 = makeMachine(producer, 'b2', 12, 2);
    grid.placeMachine(b1);
    grid.placeMachine(b2);
    // b1's north (output) band → b2's south (input) band; both bands are generic.
    const result = completeDraft(
      grid,
      pickedOf(portOf(b1, 'band:north:1')),
      portOf(b2, 'band:south:1'),
    );
    if ('error' in result) throw new Error(`expected success, got: ${result.error}`);
    // "Refined" is inferred from b1's single recipe output; b2 consumes 'Raw',
    // so this connection is a passthrough carrying 'Refined'.
    expect(result.connection.resource).toBe('Refined');
    expect(result.connection.matchedRecipeId).toBe(null);
  });

  it('uses the recipe activated by an incoming connection when the source has several', () => {
    const grid = new Grid(20, 20);
    const multi: MachineType = {
      ...producer,
      name: 'Multi Recipe',
      recipes: [
        { id: 'r1', inputs: [{ resource: 'Raw', kind: 'item', rate: 30 }], outputs: [{ resource: 'Refined', kind: 'item', rate: 30 }] },
        { id: 'r2', inputs: [{ resource: 'Scrap', kind: 'item', rate: 30 }], outputs: [{ resource: 'Alloy', kind: 'item', rate: 30 }] },
      ],
    };
    const src = makeMachine(depot, 'src', 2, 8);
    const mid = makeMachine(multi, 'mid', 8, 4);
    const dst = makeMachine(producer, 'dst', 14, 4);
    const scrapSource: MachineType = {
      ...depot,
      name: 'Scrap Depot',
      ports: [{ id: 'p_out', type: 'output', side: 'north', tileIndex: 1, resource: 'Scrap', kind: 'item', rate: 30 }],
    };
    const scrapDepot = makeMachine(scrapSource, 'scrap', 2, 12);
    grid.placeMachine(src);
    grid.placeMachine(mid);
    grid.placeMachine(dst);
    grid.placeMachine(scrapDepot);
    // Feed 'Scrap' into mid → activates r2 → mid's output must infer 'Alloy'.
    const feed = completeDraft(grid, pickedOf(portOf(scrapDepot, 'port:p_out')), portOf(mid, 'band:south:1'));
    if ('error' in feed) throw new Error(`expected success, got: ${feed.error}`);
    grid.placeConnectionTiles(feed.connection.id, feed.connection.path);
    const existing = [feed.connection];
    const out = completeDraft(
      grid,
      pickedOf(portOf(mid, 'band:north:1')),
      portOf(dst, 'band:south:1'),
      existing,
    );
    if ('error' in out) throw new Error(`expected success, got: ${out.error}`);
    expect(out.connection.resource).toBe('Alloy');
    // dst consumes 'Raw', not 'Alloy' — correctly a passthrough connection.
    expect(out.connection.matchedRecipeId).toBe(null);
  });

  it('refuses to route through an existing belt when it blocks the only corridor', () => {
    const grid = new Grid(20, 20);
    const a = makeMachine(depot, 'a', 2, 8);
    const b = makeMachine(producer, 'b', 14, 8);
    grid.placeMachine(a);
    grid.placeMachine(b);
    // A wall of an existing belt sealing the two machines off from each other.
    const wall = [];
    for (let y = 0; y < 20; y++) {
      wall.push({ x: 8, y });
    }
    grid.placeConnectionTiles('wall', wall);
    const result = completeDraft(
      grid,
      pickedOf(portOf(a, 'port:p_out')),
      portOf(b, 'band:south:1'),
    );
    expect('error' in result && result.error).toBe('No path found between the picked ports.');
  });
});
