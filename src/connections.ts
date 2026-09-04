import { findPathMultiCrossing } from './pathfinding.ts';
import { matchRecipe } from './recipes.ts';
import { nextId } from './ids.ts';
import type { Grid } from './grid.ts';
import type { Connection, Recipe } from './types.ts';
import type { PickedPort, PortCell } from './layout.ts';

export function completeDraft(
  grid: Grid,
  source: PickedPort,
  target: PortCell,
  existingConnections: Connection[] = [],
): { connection: Connection; interior: { x: number; y: number }[] } | { error: string } {
  if (source.machine.id === target.machine.id) return { error: 'Cannot connect a machine to itself.' };
  if (source.type !== 'output') {
    return { error: `Connection must start at an output port, but the source port is an ${source.type}.` };
  }
  if (target.type !== 'input') {
    return { error: `Connection must end at an input port, but the destination port is an ${target.type}.` };
  }
  if (source.kind !== target.kind) return { error: `Resource kind mismatch: '${source.kind}' vs '${target.kind}'.` };
  const srcRes = source.resource?.trim() ?? '';
  const tgtRes = target.resource?.trim() ?? '';
  const bothSpecific = srcRes !== '' && tgtRes !== '';
  if (bothSpecific && srcRes !== tgtRes) return { error: `Resource mismatch: '${srcRes}' vs '${tgtRes}'.` };
  // Use crossing pathfinder so belts/pipes can cross (bridges auto-place)
  const path = findPathMultiCrossing(grid, source.adjacentTiles, target.adjacentTiles);
  if (!path || path.length === 0) return { error: 'No path found between the picked ports.' };
  const fromTile = path[0]!;
  const toTile = path[path.length - 1]!;
  const fromCellIndex = source.adjacentTiles.findIndex((t) => t.x === fromTile.x && t.y === fromTile.y);
  const toCellIndex = target.adjacentTiles.findIndex((t) => t.x === toTile.x && t.y === toTile.y);
  return {
    connection: buildConnection(source, fromCellIndex, target, toCellIndex, path, existingConnections),
    interior: path,
  };
}

/**
 * When both picked ports are generic ('' resource), work out what the
 * source machine actually produces, in two steps:
 *
 * 1. If its recipes produce exactly one distinct resource, that's it.
 * 2. Otherwise, look at the connections already feeding this machine:
 *    a recipe whose inputs match an incoming connection's resource is
 *    the one running, and its outputs are what flows out (if they
 *    resolve to exactly one distinct resource).
 */
function inferredSourceResource(source: PickedPort, existing: Connection[]): string {
  const collect = (recipes: Recipe[]): Set<string> => {
    const outputs = new Set<string>();
    for (const recipe of recipes) {
      for (const out of recipe.outputs) {
        if (out.resource.trim() !== '') outputs.add(out.resource);
      }
    }
    return outputs;
  };
  const all = collect(source.machine.type.recipes);
  if (all.size === 1) return [...all][0]!;
  const activated: Recipe[] = [];
  for (const c of existing) {
    if (c.toMachineId !== source.machine.id) continue;
    for (const recipe of source.machine.type.recipes) {
      if (!recipe.inputs.some((i) => i.resource === c.resource && i.kind === c.kind)) continue;
      if (!activated.includes(recipe)) activated.push(recipe);
    }
  }
  const activatedOutputs = collect(activated);
  return activatedOutputs.size === 1 ? [...activatedOutputs][0]! : '';
}

function buildConnection(
  source: PickedPort,
  fromCellIndex: number,
  target: PortCell,
  toCellIndex: number,
  path: { x: number; y: number }[],
  existingConnections: Connection[],
): Connection {
  const fromPortId =
    fromCellIndex >= 0 && source.portId.startsWith('band:')
      ? `band:${source.portId.slice('band:'.length)}:${fromCellIndex}`
      : source.portId;
  const toPortId =
    toCellIndex >= 0 && target.portId.startsWith('band:')
      ? `band:${target.portId.slice('band:'.length)}:${toCellIndex}`
      : target.portId;
  const explicit = source.resource?.trim() || target.resource?.trim() || '';
  const resolvedResource = explicit || inferredSourceResource(source, existingConnections);
  const recipe = resolvedResource.trim() ? matchRecipe(target.machine, resolvedResource.trim(), source.kind) : null;
  // Throughput: belts 30/min, pipes 2/s
  const throughput = source.kind === 'item' ? 30 : 2;
  return {
    id: nextId('conn'),
    fromMachineId: source.machine.id,
    fromPortId,
    toMachineId: target.machine.id,
    toPortId,
    kind: source.kind,
    resource: resolvedResource.trim() || source.resource,
    matchedRecipeId: recipe ? recipe.id : null,
    path,
    throughput,
  };
}
