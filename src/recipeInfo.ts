import { selectBestRecipe } from './recipes.ts';
import { ratePerMin } from './logistics.ts';
import type { FlowReport, FlowInput } from './flow.ts';
import type { Connection, MachineInstance, MachineType, Recipe, RecipeSlot } from './types.ts';

export interface RecipeInputStatus {
  slot: RecipeSlot;
  /** Number of inbound connections carrying this exact resource. */
  connections: number;
  /** Total throughput delivered for this input, per minute. */
  delivered: number;
}

export interface RecipeInfo {
  recipe: Recipe;
  source: 'explicit' | 'inferred' | 'sink';
  supply: number;
  demand: number;
  efficiency: number;
  /** Per-input delivery: what the recipe demands vs what connections feed. */
  inputStatus: RecipeInputStatus[];
  inbound: Connection[];
  outbound: Connection[];
  type: MachineType;
  pickedResource: string | null;
}

/**
 * Recipe state for one machine. When a FlowReport is passed, efficiency
 * and fed amounts come from the graph-wide solve (they account for
 * upstream shortages); otherwise they are computed from raw inbound
 * connection sums.
 */
export function selectedRecipeFor(
  machine: MachineInstance,
  connections: Connection[],
  flow?: FlowReport,
): RecipeInfo | null {
  const inbound = connections.filter((c) => c.toMachineId === machine.id);
  const outbound = connections.filter((c) => c.fromMachineId === machine.id);
  if (machine.type.recipes.length === 0) {
    const resources = collectResources(inbound, outbound);
    const total = inbound.length + outbound.length;
    return {
      recipe: {
        id: 'passthrough',
        inputs: resources.inbound.length > 0 ? resources.inbound : [],
        outputs: resources.outbound.length > 0 ? resources.outbound : [],
        time: 0,
      },
      source: 'sink',
      supply: total,
      demand: 0,
      efficiency: 0,
      inputStatus: [],
      inbound,
      outbound,
      type: machine.type,
      pickedResource: null,
    };
  }
  const rec = inbound[0]
    ? selectBestRecipe(machine.type, inbound) ?? machine.type.recipes[0]!
    : machine.type.recipes[0]!;

  const flowMachine = flow?.machines.find((m) => m.machineId === machine.id);
  const flowInputs = new Map<string, FlowInput>();
  if (flowMachine) {
    for (const input of flowMachine.inputs) {
      flowInputs.set(`${input.kind}:${input.resource}`, input);
    }
  }

  // Efficiency is measured against what is actually delivered, per minute.
  // Each input slot is fed by matching inbound connections; the scarcest
  // input bounds the machine. A 60/min demand needs two 30/min belts.
  const inputStatus: RecipeInputStatus[] = rec.inputs.map((slot) => {
    const matching = inbound.filter((c) => c.resource === slot.resource && c.kind === slot.kind);
    const flowInput = flowInputs.get(`${slot.kind}:${slot.resource}`);
    const delivered = flowInput
      ? flowInput.fedPerMin
      : matching.reduce((a, c) => a + c.throughput, 0);
    return { slot, connections: matching.length, delivered };
  });
  const demand = rec.inputs.reduce((a, s) => Math.max(a, ratePerMin(s)), 0);
  const fraction = inputStatus.reduce(
    (worst, s) => Math.min(worst, Math.min(s.delivered, ratePerMin(s.slot)) / ratePerMin(s.slot)),
    1,
  );
  const efficiency = flowMachine
    ? flowMachine.efficiency
    : demand === 0
      ? 1
      : fraction;
  const supply = Math.round(efficiency * demand * 100) / 100;
  return {
    recipe: rec,
    source: inbound[0] ? 'explicit' : 'inferred',
    supply,
    demand,
    efficiency,
    inputStatus,
    inbound,
    outbound,
    type: machine.type,
    pickedResource: inbound[0]?.resource ?? null,
  };
}

function collectResources(inbound: Connection[], outbound: Connection[]) {
  const seenIn = new Map<string, { resource: string; kind: 'item' | 'fluid'; rate: number }>();
  for (const c of inbound) {
    const k = `${c.kind}:${c.resource}`;
    const cur = seenIn.get(k);
    if (cur) cur.rate += c.throughput;
    else seenIn.set(k, { resource: c.resource, kind: c.kind, rate: c.throughput });
  }
  const seenOut = new Map<string, { resource: string; kind: 'item' | 'fluid'; rate: number }>();
  for (const c of outbound) {
    const k = `${c.kind}:${c.resource}`;
    const cur = seenOut.get(k);
    if (cur) cur.rate += c.throughput;
    else seenOut.set(k, { resource: c.resource, kind: c.kind, rate: c.throughput });
  }
  return {
    inbound: [...seenIn.values()],
    outbound: [...seenOut.values()],
  };
}
