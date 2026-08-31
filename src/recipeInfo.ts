import type { Connection, MachineInstance, MachineType, Recipe } from './types.ts';

export interface RecipeInfo {
  recipe: Recipe;
  source: 'explicit' | 'inferred' | 'sink';
  supply: number;
  demand: number;
  efficiency: number;
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
      inbound,
      outbound,
      type: machine.type,
      pickedResource: null,
    };
  }
  const rec = inbound[0]
    ? matchRecipeByResource(machine.type, inbound[0].resource, inbound[0].kind) ?? machine.type.recipes[0]!
    : machine.type.recipes[0]!;
  const inputs = rec.inputs.map((slot) => {
    const inb = inbound.filter((c) => c.resource === slot.resource && c.kind === slot.kind);
    return { slot, inbound: inb };
  });
  const outputs = rec.outputs.map((slot) => {
    const out = outbound.filter((c) => c.resource === slot.resource && c.kind === slot.kind);
    return { slot, outbound: out };
  });
  const maxIn = inputs.reduce((a, x) => Math.max(a, x.slot.rate), 0);
  const maxOut = outputs.reduce((a, x) => Math.max(a, x.slot.rate), 0);
  const demand = maxIn;
  const supply = maxOut;
  const efficiency = demand === 0 ? 0 : Math.min(supply, demand) / demand;
  return {
    recipe: rec,
    source: inbound[0] ? 'explicit' : 'inferred',
    supply,
    demand,
    efficiency,
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

function matchRecipeByResource(type: MachineType, resource: string, kind: 'item' | 'fluid'): Recipe | null {
  for (const r of type.recipes) {
    if (r.inputs.some((i) => i.resource === resource && i.kind === kind)) return r;
  }
  return null;
}
