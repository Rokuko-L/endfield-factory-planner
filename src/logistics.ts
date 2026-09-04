import type { ResourceKind } from './types.ts';

/**
 * Transport capacities, per minute. The single source of truth for flow
 * math (see Wiki Flow Rate: belts 30/min, pipes 120/min for liquids and
 * gases alike; exceeding capacity clogs the line).
 */
export const ITEM_BELT_RATE = 30;
export const PIPE_RATE = 120;

/** Max throughput per minute for a connection kind. */
export function maxThroughput(kind: ResourceKind): number {
  return kind === 'fluid' ? PIPE_RATE : ITEM_BELT_RATE;
}

/**
 * Normalize a rate slot to per-minute. Catalog rates are per-minute for
 * items and per-second for fluids (implicit by kind) — e.g. a gas recipe
 * input of 0.1/s is 6/min, the minimum-flow requirement of the Gas
 * Dispersing Unit.
 */
export function ratePerMin(slot: { rate: number; kind: ResourceKind }): number {
  return slot.kind === 'fluid' ? slot.rate * 60 : slot.rate;
}

/**
 * The direction of a connection's path at a specific tile.
 * Returns {dx, dy} flow direction, or null if the path has no direction
 * there (single-tile path).
 */
export function pathDirectionAt(
  path: { x: number; y: number }[],
  tile: { x: number; y: number },
): { dx: number; dy: number } | null {
  const idx = path.findIndex((t) => t.x === tile.x && t.y === tile.y);
  if (idx === -1) return null;
  if (idx < path.length - 1) {
    const a = path[idx]!;
    const b = path[idx + 1]!;
    return { dx: Math.sign(b.x - a.x), dy: Math.sign(b.y - a.y) };
  }
  if (idx > 0) {
    const a = path[idx - 1]!;
    const b = path[idx]!;
    return { dx: Math.sign(b.x - a.x), dy: Math.sign(b.y - a.y) };
  }
  return null;
}

/** True if two paths cross perpendicular at the tile (a bridge/overpass). */
export function isCrossingAt(
  pathA: { x: number; y: number }[],
  pathB: { x: number; y: number }[],
  tile: { x: number; y: number },
): boolean {
  const a = pathDirectionAt(pathA, tile);
  const b = pathDirectionAt(pathB, tile);
  if (!a || !b) return false;
  // Perpendicular iff the direction vectors are orthogonal — same-axis
  // overlap (including opposite directions) is never a valid crossing.
  return a.dx * b.dx + a.dy * b.dy === 0;
}
