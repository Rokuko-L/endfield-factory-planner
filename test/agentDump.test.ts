import { describe, expect, it } from 'vitest';
import { Grid } from '../src/grid.ts';
import { dumpGridText, dumpLayoutText, snapshotJson } from '../src/agent/dump.ts';
import type { EditorState } from '../src/layout.ts';
import type { Connection, MachineInstance, MachineType } from '../src/types.ts';

const smelter: MachineType = {
  name: 'Test Smelter',
  width: 2,
  height: 2,
  ports: [],
  edgeBands: { south: { type: 'output', resourceKind: 'item', resource: 'Ingot' } },
  recipes: [],
};

const miner: MachineType = {
  name: 'Test Miner',
  width: 1,
  height: 1,
  ports: [{ id: 'out', type: 'output', side: 'east', tileIndex: 0, resource: 'Ore', kind: 'item', rate: 30 }],
  recipes: [],
};

function makeMachine(type: MachineType, id: string, x: number, y: number): MachineInstance {
  return { id, type, x, y, orientation: 0 };
}

function makeConnection(id: string, resource: string, kind: 'item' | 'fluid'): Connection {
  return {
    id,
    fromMachineId: 'm1',
    fromPortId: 'band:south:0',
    toMachineId: 'm2',
    toPortId: 'port:out',
    kind,
    resource,
    matchedRecipeId: null,
    path: [
      { x: 0, y: 3 },
      { x: 1, y: 3 },
    ],
    throughput: 30,
  };
}

function makeState(machines: MachineInstance[], connections: Connection[]): EditorState {
  return {
    machineTypes: [smelter, miner],
    machines,
    connections,
    selectedIndex: 0,
    orientation: 0,
    mode: 'place',
    hover: null,
    invalidFlash: null,
    draftSource: null,
    draftAdjacent: null,
    draftPath: null,
    depotAssignments: {},
    powerPreviewId: null,
  };
}

describe('dumpGridText', () => {
  it('renders an empty map with ruler and legend when nothing is placed', () => {
    const grid = new Grid(20, 20);
    const text = dumpGridText(grid, [], []);
    expect(text).toContain('legend');
    expect(text.split('legend')[0]).not.toContain('=');
  });

  it('shows machines as legend letters and item connections as =', () => {
    const grid = new Grid(20, 20);
    const m1 = makeMachine(smelter, 'm1', 2, 1);
    const m2 = makeMachine(miner, 'm2', 6, 4);
    grid.placeMachine(m1);
    grid.placeMachine(m2);
    const conn = makeConnection('c1', 'Ore', 'item');
    grid.placeConnectionTiles('c1', conn.path);
    const text = dumpGridText(grid, [m1, m2], [conn]);
    const lines = text.split('\n');
    // Machine row: smelter occupies y=1..2, x=2..3 → 'AA'
    const machineRow = lines.find((l) => l.startsWith(' 1 '))!;
    expect(machineRow).toContain('AA');
    // Connection row y=3 → '=='
    const connRow = lines.find((l) => l.startsWith(' 3 '))!;
    expect(connRow).toContain('==');
    expect(text).toContain('legend');
  });

  it('shows fluid connections as ~', () => {
    const grid = new Grid(20, 20);
    const conn = makeConnection('c1', 'Water', 'fluid');
    grid.placeConnectionTiles('c1', conn.path);
    const text = dumpGridText(grid, [], [conn]);
    expect(text).toContain('~');
    expect(text).not.toContain('==');
  });
});

describe('dumpLayoutText', () => {
  it('includes mode, machines with ports, connections, and status history', () => {
    const grid = new Grid(20, 20);
    const m1 = makeMachine(smelter, 'm1', 2, 1);
    const m2 = makeMachine(miner, 'm2', 6, 4);
    grid.placeMachine(m1);
    grid.placeMachine(m2);
    const conn = makeConnection('c1', 'Ore', 'item');
    grid.placeConnectionTiles('c1', conn.path);
    const state = makeState([m1, m2], [conn]);
    const text = dumpLayoutText(grid, state, [
      { message: 'Placed Test Miner at (6, 4) 0°.', isError: false },
      { message: 'boom', isError: true },
    ]);
    expect(text).toContain('mode: place');
    expect(text).toContain('Test Smelter');
    expect(text).toContain('Test Miner');
    expect(text).toContain('port south = "Ingot" (item)');
    expect(text).toContain('port east = "Ore" (item)');
    expect(text).toContain('band:south:0 → Bport:out');
    expect(text).toContain('! boom');
    expect(text).toContain('[depot assignments]');
    expect(text).toContain('(none)');
  });

  it('lists depot assignments with machine letters', () => {
    const grid = new Grid(20, 20);
    const m1 = makeMachine(smelter, 'm1', 2, 1);
    grid.placeMachine(m1);
    const state = makeState([m1], []);
    state.depotAssignments['m1'] = { resource: 'Ferrium', kind: 'item', rate: 30 };
    const text = dumpLayoutText(grid, state, []);
    expect(text).toContain('A Test Smelter: Ferrium (item) 30/min');
  });
});

describe('snapshotJson', () => {
  it('captures machines, ports, and connections as JSON-safe data', () => {
    const grid = new Grid(20, 20);
    const m1 = makeMachine(smelter, 'm1', 2, 1);
    const m2 = makeMachine(miner, 'm2', 6, 4);
    grid.placeMachine(m1);
    grid.placeMachine(m2);
    const conn = makeConnection('c1', 'Ore', 'item');
    const snap = snapshotJson(grid, makeState([m1, m2], [conn])) as {
      machines: { letter: string; type: string; x: number; width: number }[];
      connections: { resource: string; pathLength: number }[];
      ports: { machineId: string; side: string; adjacentCell: { x: number; y: number } }[];
    };
    expect(snap.machines[0]).toMatchObject({ letter: 'A', type: 'Test Smelter', x: 2, width: 2 });
    expect(snap.connections[0]).toMatchObject({ resource: 'Ore', pathLength: 2 });
    const bandPort = snap.ports.find((p) => p.machineId === 'm1')!;
    expect(bandPort.side).toBe('south');
    expect(bandPort.adjacentCell.y).toBe(3);
  });
});
