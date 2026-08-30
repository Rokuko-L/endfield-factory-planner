import { findPathMulti } from './pathfinding.ts';
import { matchRecipe } from './recipes.ts';
import { nextId } from './ids.ts';
import type { Grid } from './grid.ts';
import type { Connection } from './types.ts';
import type { PickedPort, PortCell } from './layout.ts';

export function completeDraft(
  grid: Grid,
  source: PickedPort,
  target: PortCell,
): { connection: Connection; interior: { x: number; y: number }[] } | { error: string } {
  if (source.machine.id === target.machine.id) return { error: 'Cannot connect a machine to itself.' };
  if (source.kind !== target.kind) return { error: `Resource kind mismatch: '${source.kind}' vs '${target.kind}'.` };
  if (source.resource !== target.resource) return { error: `Resource mismatch: '${source.resource}' vs '${target.resource}'.` };
  const path = findPathMulti(grid, source.adjacentTiles, target.adjacentTiles);
  if (!path || path.length === 0) return { error: 'No path found between the picked ports.' };
  const fromTile = path[0]!;
  const toTile = path[path.length - 1]!;
  const fromCellIndex = source.adjacentTiles.findIndex((t) => t.x === fromTile.x && t.y === fromTile.y);
  const toCellIndex = target.adjacentTiles.findIndex((t) => t.x === toTile.x && t.y === toTile.y);
  const interior = path.length > 2 ? path.slice(1, -1) : [];
  return { connection: buildConnection(source, fromCellIndex, target, toCellIndex, interior), interior };
}

function buildConnection(
  source: PickedPort,
  fromCellIndex: number,
  target: PortCell,
  toCellIndex: number,
  path: { x: number; y: number }[],
): Connection {
  const fromPortId =
    fromCellIndex >= 0 && source.portId.startsWith('band:')
      ? `band:${source.portId.slice('band:'.length)}:${fromCellIndex}`
      : source.portId;
  const toPortId =
    toCellIndex >= 0 && target.portId.startsWith('band:')
      ? `band:${target.portId.slice('band:'.length)}:${toCellIndex}`
      : target.portId;
  const recipe = matchRecipe(target.machine, source.resource, source.kind);
  return {
    id: nextId('conn'),
    fromMachineId: source.machine.id,
    fromPortId,
    toMachineId: target.machine.id,
    toPortId,
    kind: source.kind,
    resource: source.resource,
    matchedRecipeId: recipe ? recipe.id : null,
    path,
  };
}
