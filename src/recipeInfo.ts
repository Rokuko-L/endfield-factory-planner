import type { Connection, MachineInstance, MachineType, Recipe, RecipeSlot } from './types.ts';

export interface RecipeInputStatus {
  slot: RecipeSlot;
  /** Number of inbound connections carrying this exact resource. */
  connections: number;
  /** Total throughput delivered for this input, in the slot's rate unit. */
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

export function selectedRecipeFor(machine: MachineInstance, connections: Connection[]): RecipeInfo | null {
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
  // Efficiency is measured against what is actually delivered: each input
  // slot is fed by the throughput of matching inbound connections, and the
  // scarcest input bounds the machine. Belt throughput is 30/min, so a
  // 60/min demand needs two belts — a single line caps the machine at 50%.
  const inputStatus: RecipeInputStatus[] = rec.inputs.map((slot) => {
    const matching = inbound.filter((c) => c.resource === slot.resource && c.kind === slot.kind);
    const delivered = matching.reduce((a, c) => a + c.throughput, 0);
    return { slot, connections: matching.length, delivered };
  });
  const demand = rec.inputs.reduce((a, s) => Math.max(a, s.rate), 0);
  const fraction = inputStatus.reduce(
    (worst, s) => Math.min(worst, Math.min(s.delivered, s.slot.rate) / s.slot.rate),
    1,
  );
  const efficiency = demand === 0 ? 1 : fraction;
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
    if (cur) cur.rate += 30;
    else seenIn.set(k, { resource: c.resource, kind: c.kind, rate: 30 });
  }
  const seenOut = new Map<string, { resource: string; kind: 'item' | 'fluid'; rate: number }>();
  for (const c of outbound) {
    const k = `${c.kind}:${c.resource}`;
    const cur = seenOut.get(k);
    if (cur) cur.rate += 30;
    else seenOut.set(k, { resource: c.resource, kind: c.kind, rate: 30 });
  }
  return {
    inbound: [...seenIn.values()],
    outbound: [...seenOut.values()],
  };
}

/**
 * Pick the recipe that the current inbound connections actually feed:
 * the one with the most distinct input slots receiving a matching
 * connection. Machines like the Packaging Unit share inputs across
 * recipes (Amethyst Part feeds both Industrial Explosive and LC Valley
 * Battery), so "first recipe containing the resource" picks the wrong
 * craft — counting fed slots disambiguates.
 */
function selectBestRecipe(type: MachineType, inbound: Connection[]): Recipe | null {
  let best: Recipe | null = null;
  let bestFed = 0;
  for (const recipe of type.recipes) {
    const fed = recipe.inputs.filter((slot) =>
      inbound.some((c) => c.resource === slot.resource && c.kind === slot.kind),
    ).length;
    if (fed > bestFed) {
      best = recipe;
      bestFed = fed;
    }
  }
  return best;
}
