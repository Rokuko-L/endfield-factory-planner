import { maxThroughput, ratePerMin } from './logistics.ts';
import { selectBestRecipe } from './recipes.ts';
import type { EditorState } from './layout.ts';
import type { Connection, MachineInstance, Recipe, ResourceKind, RecipeSlot } from './types.ts';

/**
 * Pure static flow solver: propagates throughput through the connection
 * graph to compute per-machine efficiency and per-connection flow. Plain
 * functions, no DOM — headless-testable like the other logic modules.
 * Foundation for gas mode, split/merge accounting, and auto-planner
 * validation.
 *
 * Model (rates normalized to per-minute; belts 30, pipes 120 — see
 * logistics.ts):
 *
 * - **Sources**: machines whose active recipe has no inputs (mining rigs,
 *   gas extractors) and depots with an assignment produce at full rate.
 * - **Efficiency** of a machine = scarcest input ratio
 *   min(fed/demand) across its recipe inputs; outputs scale by it.
 * - **Splitting** (several outgoing lines for a resource) divides supply
 *   proportionally to consumer demand, capped per line.
 * - **Converging** (several incoming lines) sums them; supply beyond
 *   what the machine consumes clogs the fullest inbound line.
 * - **Cycles** don't crash the solve: cycle members are flagged and
 *   solved conservatively from whatever flows in from outside the cycle.
 *
 * Warnings: `clogged`, `starved`, `stalled`, `cycle`.
 */

export interface FlowInput {
  resource: string;
  kind: ResourceKind;
  demandPerMin: number;
  fedPerMin: number;
  connections: number;
}

export interface FlowOutput {
  resource: string;
  kind: ResourceKind;
  producedPerMin: number;
}

export interface MachineFlow {
  machineId: string;
  name: string;
  recipeId: string | null;
  /** 0..1 — scarcest input ratio; 1 for pure sources; 0 when unfed. */
  efficiency: number;
  inCycle: boolean;
  inputs: FlowInput[];
  outputs: FlowOutput[];
}

export interface ConnectionFlow {
  connectionId: string;
  fromMachineId: string;
  toMachineId: string;
  resource: string;
  kind: ResourceKind;
  capacityPerMin: number;
  flowPerMin: number;
  clogged: boolean;
}

export interface FlowWarning {
  kind: 'clogged' | 'starved' | 'stalled' | 'cycle';
  /** Machine or connection id the warning is about. */
  subjectId: string;
  message: string;
}

export interface FlowReport {
  machines: MachineFlow[];
  connections: ConnectionFlow[];
  warnings: FlowWarning[];
}

interface Solver {
  machineById: Map<string, MachineInstance>;
  recipeOf: Map<string, Recipe | null>;
  /** per-machine fed amounts per resource, keyed `kind:resource` */
  fed: Map<string, Map<string, number>>;
  flow: Map<string, number>;
  clogged: Set<string>;
  depotAssignments: EditorState['depotAssignments'];
}

const resKey = (kind: ResourceKind, resource: string): string => `${kind}:${resource}`;

/**
 * Resolve the resource a generic ('' resource) connection carries: the
 * source machine's single recipe output, or its depot assignment. Mirrors
 * the inference in connections.ts so the graph matches what actually
 * flows.
 */
function resolveEdgeResource(connection: Connection, solver: Solver): string {
  if (connection.resource.trim() !== '') return connection.resource;
  const source = solver.machineById.get(connection.fromMachineId);
  if (!source) return '';
  const assignment = solver.depotAssignments[source.id];
  if (assignment && assignment.resource.trim() !== '') return assignment.resource;
  const recipe = solver.recipeOf.get(source.id);
  if (recipe && recipe.outputs.length > 0) {
    const distinct = new Set(recipe.outputs.map((o) => o.resource));
    if (distinct.size === 1) return [...distinct][0]!;
  }
  return '';
}

function outgoingFor(machineId: string, resource: string, connections: Connection[]): Connection[] {
  return connections.filter(
    (c) => c.fromMachineId === machineId && (c.resource === resource || c.resource === ''),
  );
}

/**
 * How much of `resource` the target machine consumes per minute: its
 * recipe demand, or — for machines that don't consume it (logistics
 * machines, sinks, or machines with a different recipe) — the capacity
 * of its own outgoing lines carrying it onward, so the flow passes
 * through. Sinks (no outgoing) accept everything.
 */
function consumerDemand(
  target: MachineInstance,
  resource: string,
  solver: Solver,
  connections: Connection[],
): number {
  const recipe = solver.recipeOf.get(target.id);
  if (recipe && recipe.inputs.length > 0) {
    const slot = recipe.inputs.find((s) => s.resource === resource);
    if (slot) return ratePerMin(slot);
  }
  const out = outgoingFor(target.id, resource, connections);
  if (out.length === 0) return Infinity;
  return out.reduce((a, c) => a + c.throughput, 0);
}

/** Push flow along a connection, respecting line capacity. */
function deliver(connection: Connection, amount: number, resource: string, solver: Solver): void {
  const capacity = Math.min(connection.throughput, maxThroughput(connection.kind));
  const flow = Math.min(amount, capacity);
  if (amount > capacity + 1e-9) solver.clogged.add(connection.id);
  const fed = solver.fed.get(connection.toMachineId);
  if (fed) {
    const key = resKey(connection.kind, resource || 'any');
    fed.set(key, (fed.get(key) ?? 0) + flow);
  }
  solver.flow.set(connection.id, (solver.flow.get(connection.id) ?? 0) + flow);
}

/**
 * Push supply down the machine's outgoing lines for that resource, split
 * proportionally to consumer demand and capped per line.
 */
function emitSupply(
  machine: MachineInstance,
  supply: { resource: string; kind: ResourceKind; perMin: number },
  solver: Solver,
  connections: Connection[],
  resolved: Map<string, string>,
): void {
  if (supply.perMin <= 0) return;
  const lines = outgoingFor(machine.id, supply.resource, connections);
  if (lines.length === 0) return; // stalled — flagged in the report
  const wants = lines.map((c) => ({
    c,
    carried: resolved.get(c.id) ?? c.resource,
    want: Math.min(
      Math.min(c.throughput, maxThroughput(c.kind)),
      consumerDemand(solver.machineById.get(c.toMachineId) ?? machine, supply.resource, solver, connections),
    ),
  }));
  const totalWant = wants.reduce((a, w) => a + w.want, 0);
  if (totalWant <= supply.perMin + 1e-9) {
    for (const w of wants) deliver(w.c, w.want, w.carried, solver);
    // Everything downstream is saturated and supply remains → clogged.
    if (supply.perMin - totalWant > 1e-9 && lines.length > 0) {
      solver.clogged.add(lines[0]!.id);
    }
  } else {
    for (const w of wants) deliver(w.c, (supply.perMin * w.want) / totalWant, w.carried, solver);
  }
}

function sourceSupplies(
  machine: MachineInstance,
  solver: Solver,
): { resource: string; kind: ResourceKind; perMin: number }[] {
  const assignment = solver.depotAssignments[machine.id];
  if (assignment && assignment.resource.trim() !== '') {
    return [{ resource: assignment.resource, kind: assignment.kind, perMin: assignment.rate }];
  }
  return [];
}

/** What a machine emits given its recipe and efficiency. */
function outputSupplies(
  machine: MachineInstance,
  recipe: Recipe | null,
  efficiency: number,
  solver: Solver,
): { resource: string; kind: ResourceKind; perMin: number }[] {
  if (recipe) {
    return recipe.outputs.map((o) => ({ resource: o.resource, kind: o.kind, perMin: ratePerMin(o) * efficiency }));
  }
  const fedMap = solver.fed.get(machine.id);
  if (!fedMap || fedMap.size === 0) return sourceSupplies(machine, solver);
  // Passthrough: forward exactly what was fed.
  return [...fedMap.entries()].map(([k, amount]) => {
    const [kind, resource] = k.split(':') as [ResourceKind, string];
    return { resource: resource === 'any' ? '' : resource, kind, perMin: amount };
  });
}

/** Scarcest-input efficiency and per-slot fed/demand for one machine. */
function inputEfficiency(
  machineId: string,
  recipe: Recipe,
  solver: Solver,
  connections: Connection[],
): { efficiency: number; inputs: FlowInput[] } {
  let efficiency = 1;
  const inputs: FlowInput[] = recipe.inputs.map((slot: RecipeSlot) => {
    const fed = solver.fed.get(machineId)?.get(resKey(slot.kind, slot.resource)) ?? 0;
    const demand = ratePerMin(slot);
    efficiency = Math.min(efficiency, Math.min(fed, demand) / demand);
    return {
      resource: slot.resource,
      kind: slot.kind,
      demandPerMin: demand,
      fedPerMin: fed,
      connections: connections.filter(
        (c) => c.toMachineId === machineId && c.resource === slot.resource && c.kind === slot.kind,
      ).length,
    };
  });
  return { efficiency, inputs };
}

/**
 * Solve the whole layout. Pure: reads state, returns a report.
 */
export function solveFlow(state: EditorState): FlowReport {
  const connections = state.connections;
  const solver: Solver = {
    machineById: new Map(state.machines.map((m) => [m.id, m])),
    recipeOf: new Map(),
    fed: new Map(),
    flow: new Map(),
    clogged: new Set(),
    depotAssignments: state.depotAssignments,
  };
  for (const m of state.machines) solver.fed.set(m.id, new Map());

  // Active recipe per machine: best-fed by current inbound, falling back
  // to the machine's first recipe (it will produce once fed).
  for (const m of state.machines) {
    const inbound = connections.filter((c) => c.toMachineId === m.id);
    const recipe =
      m.type.recipes.length === 0
        ? null
        : (inbound.length > 0 ? selectBestRecipe(m.type, inbound) : null) ?? m.type.recipes[0]!;
    solver.recipeOf.set(m.id, recipe);
  }

  // Resolve generic ('' resource) edges from their source machine, then
  // solve against the resolved graph — a generic pipe out of a Gas
  // Extractor carries Inergen, not "any".
  const resolvedResource = new Map<string, string>();
  for (const c of connections) resolvedResource.set(c.id, resolveEdgeResource(c, solver));
  const graph = connections.map((c) => {
    const r = resolvedResource.get(c.id) ?? '';
    return r && c.resource !== r ? { ...c, resource: r } : c;
  });

  // Re-select recipes against the resolved graph, so a machine fed via a
  // generic edge picks the recipe its actual resource activates.
  for (const m of state.machines) {
    const inbound = graph.filter((c) => c.toMachineId === m.id);
    if (m.type.recipes.length === 0 || inbound.length === 0) continue;
    solver.recipeOf.set(m.id, selectBestRecipe(m.type, inbound) ?? m.type.recipes[0]!);
  }

  // Topological order (Kahn). Cycle members are appended at the end and
  // flagged — the solve continues conservatively from outside the cycle.
  const indegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();
  for (const m of state.machines) {
    indegree.set(m.id, 0);
    adjacency.set(m.id, []);
  }
  for (const c of connections) {
    if (!indegree.has(c.toMachineId) || !indegree.has(c.fromMachineId)) continue;
    adjacency.get(c.fromMachineId)!.push(c.toMachineId);
    indegree.set(c.toMachineId, (indegree.get(c.toMachineId) ?? 0) + 1);
  }
  const queue = state.machines.filter((m) => (indegree.get(m.id) ?? 0) === 0).map((m) => m.id);
  const order: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    order.push(id);
    for (const next of adjacency.get(id) ?? []) {
      const d = (indegree.get(next) ?? 0) - 1;
      indegree.set(next, d);
      if (d === 0) queue.push(next);
    }
  }
  const cyclicIds = new Set(state.machines.filter((m) => !order.includes(m.id)).map((m) => m.id));
  const solveOrder = [...order, ...cyclicIds];

  for (const id of solveOrder) {
    const machine = solver.machineById.get(id)!;
    const recipe = solver.recipeOf.get(id) ?? null;
    const solved = recipe && recipe.inputs.length > 0
      ? inputEfficiency(id, recipe, solver, graph)
      : { efficiency: 1, inputs: [] as FlowInput[] };
    for (const supply of outputSupplies(machine, recipe, solved.efficiency, solver)) {
      emitSupply(machine, supply, solver, graph, resolvedResource);
    }
  }

  // Assemble the report.
  const warnings: FlowWarning[] = [];
  const machineFlows: MachineFlow[] = solveOrder.map((id) => {
    const machine = solver.machineById.get(id)!;
    const recipe = solver.recipeOf.get(id) ?? null;
    const inCycle = cyclicIds.has(id);
    const { efficiency, inputs } = recipe && recipe.inputs.length > 0
      ? inputEfficiency(id, recipe, solver, graph)
      : { efficiency: 1, inputs: [] };
    if (inCycle) {
      warnings.push({
        kind: 'cycle',
        subjectId: id,
        message: `${machine.type.name} is part of a connection cycle — flow through it is a conservative estimate.`,
      });
    }
    for (const input of inputs) {
      if (input.fedPerMin < input.demandPerMin - 1e-9) {
        warnings.push({
          kind: 'starved',
          subjectId: id,
          message: `${machine.type.name} is starved: ${input.resource} fed ${round1(input.fedPerMin)}/min of ${input.demandPerMin}/min demanded.`,
        });
      }
    }
    const outputs: FlowOutput[] = recipe
      ? recipe.outputs.map((o) => ({
          resource: o.resource,
          kind: o.kind,
          producedPerMin: ratePerMin(o) * efficiency,
        }))
      : sourceSupplies(machine, solver).map((s) => ({
          resource: s.resource,
          kind: s.kind,
          producedPerMin: s.perMin,
        }));
    for (const out of outputs) {
      if (out.producedPerMin > 0 && outgoingFor(id, out.resource, graph).length === 0) {
        warnings.push({
          kind: 'stalled',
          subjectId: id,
          message: `${machine.type.name} produces ${round1(out.producedPerMin)}/min of ${out.resource} but nothing carries it away.`,
        });
      }
    }
    return {
      machineId: id,
      name: machine.type.name,
      recipeId: recipe ? recipe.id : null,
      efficiency,
      inCycle,
      inputs,
      outputs,
    };
  });

  const connectionFlows: ConnectionFlow[] = connections.map((c) => {
    const capacity = Math.min(c.throughput, maxThroughput(c.kind));
    if (solver.clogged.has(c.id)) {
      warnings.push({
        kind: 'clogged',
        subjectId: c.id,
        message: `Belt/pipe for ${c.resource || 'generic'} is clogged: offered flow exceeds its ${capacity}/min capacity.`,
      });
    }
    return {
      connectionId: c.id,
      fromMachineId: c.fromMachineId,
      toMachineId: c.toMachineId,
      resource: resolvedResource.get(c.id) || c.resource,
      kind: c.kind,
      capacityPerMin: capacity,
      flowPerMin: round1(solver.flow.get(c.id) ?? 0),
      clogged: solver.clogged.has(c.id),
    };
  });

  return { machines: machineFlows, connections: connectionFlows, warnings };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export type { RecipeSlot };
