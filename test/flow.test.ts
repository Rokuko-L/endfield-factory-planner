import { describe, expect, it } from 'vitest';
import { solveFlow } from '../src/flow.ts';
import { ratePerMin, maxThroughput, ITEM_BELT_RATE, PIPE_RATE } from '../src/logistics.ts';
import type { EditorState } from '../src/layout.ts';
import type { Connection, MachineInstance, MachineType, RecipeSlot } from '../src/types.ts';

/** 1-in south, 1-out north; consumes Raw 30/min → Refined 30/min. */
const converter: MachineType = {
  name: 'Converter',
  width: 2,
  height: 2,
  ports: [],
  edgeBands: {
    south: { type: 'input', resourceKind: 'item' },
    north: { type: 'output', resourceKind: 'item' },
  },
  recipes: [
    {
      id: 'convert',
      inputs: [{ resource: 'Raw', kind: 'item', rate: 30 }],
      outputs: [{ resource: 'Refined', kind: 'item', rate: 30 }],
    },
  ],
};

/** Same shape; consumes Refined 30/min → Widget 30/min. */
const finisher: MachineType = {
  ...converter,
  name: 'Finisher',
  recipes: [
    {
      id: 'finish',
      inputs: [{ resource: 'Refined', kind: 'item', rate: 30 }],
      outputs: [{ resource: 'Widget', kind: 'item', rate: 30 }],
    },
  ],
};

const depot: MachineType = {
  name: 'Depot',
  width: 1,
  height: 1,
  noPower: true,
  ports: [],
  edgeBands: {},
  recipes: [],
};

function machine(type: MachineType, id: string, x: number, y: number): MachineInstance {
  return { id, type, x, y, orientation: 0 };
}

function conn(
  id: string,
  from: string,
  to: string,
  resource: string,
  throughput = ITEM_BELT_RATE,
  kind: 'item' | 'fluid' = 'item',
): Connection {
  return {
    id,
    fromMachineId: from,
    fromPortId: 'p',
    toMachineId: to,
    toPortId: 'p',
    kind,
    resource,
    matchedRecipeId: null,
    path: [{ x: 0, y: 0 }],
    throughput,
  };
}

function makeState(
  machines: MachineInstance[],
  connections: Connection[],
  depotAssignments: EditorState['depotAssignments'] = {},
): EditorState {
  return {
    machineTypes: [],
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
    depotAssignments,
    powerPreviewId: null,
  };
}

describe('rate normalization', () => {
  it('per-second fluid slots normalize to per-minute', () => {
    const slot: RecipeSlot = { resource: 'Inergen', kind: 'fluid', rate: 0.1 };
    expect(ratePerMin(slot)).toBe(6);
    const gas: RecipeSlot = { resource: 'Cuprium Gas', kind: 'fluid', rate: 2 };
    expect(ratePerMin(gas)).toBe(120);
    const item: RecipeSlot = { resource: 'Raw', kind: 'item', rate: 30 };
    expect(ratePerMin(item)).toBe(30);
  });

  it('belt is 30/min and pipe is 120/min', () => {
    expect(ITEM_BELT_RATE).toBe(30);
    expect(PIPE_RATE).toBe(120);
    expect(maxThroughput('item')).toBe(30);
    expect(maxThroughput('fluid')).toBe(120);
  });
});

describe('solveFlow', () => {
  it('propagates flow through a linear chain at full efficiency', () => {
    const src = machine(depot, 'src', 0, 0);
    const mid = machine(converter, 'mid', 4, 0);
    const dst = machine(finisher, 'dst', 8, 0);
    const sink = machine(depot, 'sink', 12, 0);
    const state = makeState(
      [src, mid, dst, sink],
      [
        conn('c1', 'src', 'mid', 'Raw'),
        conn('c2', 'mid', 'dst', 'Refined'),
        conn('c3', 'dst', 'sink', 'Widget'),
      ],
      { src: { resource: 'Raw', kind: 'item', rate: 30 } },
    );
    const report = solveFlow(state);
    const byId = new Map(report.machines.map((m) => [m.machineId, m]));
    expect(byId.get('mid')!.efficiency).toBe(1);
    expect(byId.get('dst')!.efficiency).toBe(1);
    const c2 = report.connections.find((c) => c.connectionId === 'c2')!;
    expect(c2.flowPerMin).toBe(30);
    expect(report.warnings).toHaveLength(0);
  });

  it('propagates upstream inefficiency downstream', () => {
    const src = machine(depot, 'src', 0, 0);
    const mid = machine(converter, 'mid', 4, 0);
    const dst = machine(finisher, 'dst', 8, 0);
    const sink = machine(depot, 'sink', 12, 0);
    const state = makeState(
      [src, mid, dst, sink],
      [
        conn('c1', 'src', 'mid', 'Raw'),
        conn('c2', 'mid', 'dst', 'Refined'),
        conn('c3', 'dst', 'sink', 'Widget'),
      ],
      // Source provides only 15/min of the 30/min the converter demands.
      { src: { resource: 'Raw', kind: 'item', rate: 15 } },
    );
    const report = solveFlow(state);
    const byId = new Map(report.machines.map((m) => [m.machineId, m]));
    expect(byId.get('mid')!.efficiency).toBe(0.5);
    // Downstream only receives half of the refined output it could use.
    expect(byId.get('dst')!.efficiency).toBe(0.5);
    expect(byId.get('dst')!.inputs[0]!.fedPerMin).toBe(15);
    expect(report.warnings.some((w) => w.kind === 'starved' && w.subjectId === 'mid')).toBe(true);
  });

  it('splits supply across a splitter round-robin', () => {
    const splitter: MachineType = {
      ...depot,
      name: 'Splitter',
      edgeBands: {
        north: { type: 'output', resourceKind: 'item' },
        east: { type: 'output', resourceKind: 'item' },
        south: { type: 'input', resourceKind: 'item' },
      },
    };
    const src = machine(depot, 'src', 0, 0);
    const split = machine(splitter, 'split', 4, 0);
    const sink1 = machine(converter, 'sink1', 8, 0);
    const sink2 = machine(converter, 'sink2', 12, 4);
    const state = makeState(
      [src, split, sink1, sink2],
      [conn('in', 'src', 'split', 'Raw'), conn('o1', 'split', 'sink1', 'Raw'), conn('o2', 'split', 'sink2', 'Raw')],
      { src: { resource: 'Raw', kind: 'item', rate: 30 } },
    );
    const report = solveFlow(state);
    const f1 = report.connections.find((c) => c.connectionId === 'o1')!;
    const f2 = report.connections.find((c) => c.connectionId === 'o2')!;
    // Both consumers demand 30 each; 30/min of supply splits evenly.
    expect(f1.flowPerMin).toBe(15);
    expect(f2.flowPerMin).toBe(15);
  });

  it('caps a converger at its output and flags the clog', () => {
    const converger: MachineType = {
      ...depot,
      name: 'Converger',
      edgeBands: {
        north: { type: 'output', resourceKind: 'item' },
        east: { type: 'input', resourceKind: 'item' },
        west: { type: 'input', resourceKind: 'item' },
      },
    };
    const s1 = machine(depot, 's1', 0, 0);
    const s2 = machine(depot, 's2', 0, 4);
    const conv = machine(converger, 'conv', 4, 2);
    const out = machine(converter, 'out', 8, 2);
    const state = makeState(
      [s1, s2, conv, out],
      [
        conn('i1', 's1', 'conv', 'Raw'),
        conn('i2', 's2', 'conv', 'Raw'),
        conn('o', 'conv', 'out', 'Raw'),
      ],
      { s1: { resource: 'Raw', kind: 'item', rate: 30 }, s2: { resource: 'Raw', kind: 'item', rate: 30 } },
    );
    const report = solveFlow(state);
    // 60/min offered into a single 30/min output line → capped + clogged.
    expect(report.connections.find((c) => c.connectionId === 'o')!.flowPerMin).toBe(30);
    expect(report.warnings.some((w) => w.kind === 'clogged')).toBe(true);
    expect(report.connections.find((c) => c.connectionId === 'o')!.clogged).toBe(true);
  });

  it('flags over-capacity supply into one belt as clogged', () => {
    const src = machine(depot, 'src', 0, 0);
    const dst = machine(converter, 'dst', 4, 0);
    const state = makeState(
      [src, dst],
      [conn('c1', 'src', 'dst', 'Raw')],
      // 60/min offered into a 30/min belt.
      { src: { resource: 'Raw', kind: 'item', rate: 60 } },
    );
    const report = solveFlow(state);
    const c1 = report.connections.find((c) => c.connectionId === 'c1')!;
    expect(c1.flowPerMin).toBe(30);
    expect(c1.clogged).toBe(true);
    expect(report.warnings.some((w) => w.kind === 'clogged')).toBe(true);
  });

  it('detects cycles without crashing and flags them', () => {
    const a = machine(converter, 'a', 0, 0);
    const b = machine(converter, 'b', 4, 0);
    const state = makeState(
      [a, b],
      [
        conn('c1', 'a', 'b', 'Refined'),
        conn('c2', 'b', 'a', 'Raw'),
      ],
      {},
    );
    const report = solveFlow(state);
    expect(report.machines).toHaveLength(2);
    const byId = new Map(report.machines.map((m) => [m.machineId, m]));
    expect(byId.get('a')!.inCycle).toBe(true);
    expect(byId.get('b')!.inCycle).toBe(true);
    expect(report.warnings.filter((w) => w.kind === 'cycle')).toHaveLength(2);
    for (const m of report.machines) expect(Number.isFinite(m.efficiency)).toBe(true);
  });

  it('solves a gas pipe chain and respects the 6/min minimum-flow input', () => {
    const extractor: MachineType = {
      name: 'Gas Extractor',
      width: 1,
      height: 1,
      noPower: true,
      ports: [],
      edgeBands: { south: { type: 'output', resourceKind: 'fluid' } },
      recipes: [
        { id: 'extract', inputs: [], outputs: [{ resource: 'Inergen', kind: 'fluid', rate: 2 }] },
      ],
    };
    const disperser: MachineType = {
      name: 'Gas Dispersing Unit',
      width: 1,
      height: 1,
      noPower: true,
      ports: [],
      edgeBands: { north: { type: 'input', resourceKind: 'fluid' } },
      recipes: [
        { id: 'inergen_env', inputs: [{ resource: 'Inergen', kind: 'fluid', rate: 0.1 }], outputs: [] },
      ],
    };
    const src = machine(extractor, 'ext', 0, 0);
    const dis = machine(disperser, 'dis', 4, 0);
    const state = makeState(
      [src, dis],
      [conn('pipe', 'ext', 'dis', 'Inergen', PIPE_RATE, 'fluid')],
      {},
    );
    const report = solveFlow(state);
    const disFlow = report.machines.find((m) => m.machineId === 'dis')!;
    // 120/min offered of a 6/min minimum → fully satisfied (excess wasted).
    expect(disFlow.efficiency).toBe(1);
    expect(disFlow.inputs[0]!.demandPerMin).toBe(6);
    const pipe = report.connections.find((c) => c.connectionId === 'pipe')!;
    expect(pipe.capacityPerMin).toBe(120);
    expect(pipe.flowPerMin).toBe(6);

    // Starve it: a trickle source delivers below the 6/min minimum.
    const weak: MachineType = {
      ...extractor,
      recipes: [{ id: 'weak', inputs: [], outputs: [{ resource: 'Inergen', kind: 'fluid', rate: 0.05 }] }],
    };
    const weakSrc = machine(weak, 'ext2', 0, 0);
    const state2 = makeState([weakSrc, dis], [conn('pipe2', 'ext2', 'dis', 'Inergen', PIPE_RATE, 'fluid')], {});
    const report2 = solveFlow(state2);
    const disFlow2 = report2.machines.find((m) => m.machineId === 'dis')!;
    expect(disFlow2.efficiency).toBe(0.5);
    expect(report2.warnings.some((w) => w.kind === 'starved')).toBe(true);
  });

  it('resolves a generic gas pipe to the extractor\'s single output resource', () => {
    const extractor: MachineType = {
      name: 'Gas Extractor',
      width: 1,
      height: 1,
      noPower: true,
      ports: [],
      edgeBands: { south: { type: 'output', resourceKind: 'fluid' } },
      recipes: [
        { id: 'extract', inputs: [], outputs: [{ resource: 'Inergen', kind: 'fluid', rate: 2 }] },
      ],
    };
    const disperser: MachineType = {
      name: 'Gas Dispersing Unit',
      width: 1,
      height: 1,
      noPower: true,
      ports: [],
      edgeBands: { north: { type: 'input', resourceKind: 'fluid' } },
      recipes: [
        { id: 'inergen_env', inputs: [{ resource: 'Inergen', kind: 'fluid', rate: 0.1 }], outputs: [] },
      ],
    };
    const src = machine(extractor, 'ext', 0, 0);
    const dis = machine(disperser, 'dis', 4, 0);
    // A generic ('' resource) pipe — the solver must infer Inergen from the
    // extractor's single recipe output, or the disperser starves on paper.
    const state = makeState(
      [src, dis],
      [conn('pipe', 'ext', 'dis', '', PIPE_RATE, 'fluid')],
      {},
    );
    const report = solveFlow(state);
    const disFlow = report.machines.find((m) => m.machineId === 'dis')!;
    expect(disFlow.efficiency).toBe(1);
    expect(disFlow.inputs[0]!.fedPerMin).toBe(6);
    const pipe = report.connections.find((c) => c.connectionId === 'pipe')!;
    expect(pipe.resource).toBe('Inergen');
    expect(pipe.flowPerMin).toBe(6);
  });

  it('flags stalled output that goes nowhere', () => {
    const rig: MachineType = {
      ...converter,
      name: 'Rig',
      edgeBands: {},
      recipes: [{ id: 'mine', inputs: [], outputs: [{ resource: 'Ore', kind: 'item', rate: 30 }] }],
    };
    const state = makeState([machine(rig, 'rig', 0, 0)], []);
    const report = solveFlow(state);
    expect(report.warnings.some((w) => w.kind === 'stalled')).toBe(true);
  });
});
