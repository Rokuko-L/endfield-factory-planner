import type { Grid } from './grid.ts';

/**
 * A 4-direction A* pathfinder that operates on grid cells. Returns the
 * inclusive list of tiles from `start` to `end`, or null if no path
 * exists. The start and end tiles must be free in the grid (i.e. not
 * occupied by a machine or another connection) for a path to be found
 * — callers should ensure that before invoking.
 *
 * Internally this delegates to `findPathMulti` with single-element
 * start/end sets. The returned path is `smoothPath`-processed.
 */
export function findPath(
  grid: Grid,
  start: { x: number; y: number },
  end: { x: number; y: number },
): { x: number; y: number }[] | null {
  return findPathMulti(grid, [start], [end]);
}

/**
 * Multi-source / multi-target A*. Returns the inclusive path from the
 * optimal start cell to the optimal end cell, or null if no path
 * exists.
 *
 * Strategy: enumerate every (start, end) pair, find an L-shaped
 * candidate for each, and use the shortest L that fits. Fall back to
 * A* on pairs where no L is clear.
 *
 * For typical Endfield port cells (≤5 per side), this is fast — the
 * dominant work is checking L-shape clarity along a row/column,
 * which is O(N) per pair. Total work is O(P² · N) where P is the
 * number of port cells per side and N is the grid area.
 */
export function findPathMulti(
  grid: Grid,
  starts: { x: number; y: number }[],
  ends: { x: number; y: number }[],
): { x: number; y: number }[] | null {
  if (starts.length === 0 || ends.length === 0) return null;

  // Same-cell cases: if any start equals any end, return a one-tile path.
  const endSet = new Set<string>();
  for (const e of ends) endSet.add(key(e.x, e.y));
  for (const s of starts) {
    if (endSet.has(key(s.x, s.y))) return [s];
  }

  let best: { path: { x: number; y: number }[]; cost: number } | null = null;

  for (const s of starts) {
    if (!grid.isFree(s.x, s.y)) continue;
    for (const e of ends) {
      if (!grid.isFree(e.x, e.y)) continue;
      const lPath = lShapePath(grid, s, e);
      if (lPath) {
        const cost = pathCost(lPath);
        if (best === null || cost < best.cost) {
          best = { path: expandPath(lPath), cost };
        }
        continue;
      }
      const aPath = aStarPath(grid, s, e);
      if (aPath) {
        const cost = pathCost(aPath);
        const expanded = expandPath(aPath);
        if (best === null || cost < best.cost) {
          best = { path: expanded, cost };
        }
      }
    }
  }

  return best ? best.path : null;
}

/**
 * Try both possible L-shapes between two cells. Returns the shorter
 * one (or null if neither fits). An L-shape is "horizontal first,
 * then vertical" or "vertical first, then horizontal".
 */
function lShapePath(
  grid: Grid,
  start: { x: number; y: number },
  end: { x: number; y: number },
): { x: number; y: number }[] | null {
  // Try both possible L-shapes. Each candidate is the COMPACT form
  // (start, optional corner, end); the caller expands it into a
  // tile-by-tile path for rendering.
  const candidates: { x: number; y: number }[][] = [];

  // Straight horizontal: just [start, end] if same row.
  if (start.y === end.y && lineClear(grid, start.x, start.y, end.x, end.y, "horizontal")) {
    candidates.push([start, end]);
  }
  // Straight vertical: just [start, end] if same column.
  if (start.x === end.x && lineClear(grid, start.x, start.y, end.x, end.y, "vertical")) {
    candidates.push([start, end]);
  }
  // Horizontal first, then vertical. Corner = (end.x, start.y).
  if (
    start.y !== end.y &&
    start.x !== end.x &&
    lineClear(grid, start.x, start.y, end.x, start.y, "horizontal") &&
    lineClear(grid, end.x, start.y, end.x, end.y, "vertical")
  ) {
    candidates.push([start, { x: end.x, y: start.y }, end]);
  }
  // Vertical first, then horizontal. Corner = (start.x, end.y).
  if (
    start.y !== end.y &&
    start.x !== end.x &&
    lineClear(grid, start.x, start.y, start.x, end.y, "vertical") &&
    lineClear(grid, start.x, end.y, end.x, end.y, "horizontal")
  ) {
    candidates.push([start, { x: start.x, y: end.y }, end]);
  }

  if (candidates.length === 0) return null;
  // Pick the candidate with the fewest moves. All candidates have the
  // same number of moves (= manhattan distance), but fewer "tiles"
  // is preferred for storage.
  candidates.sort((a, b) => pathMoves(a) - pathMoves(b));
  return candidates[0]!;
}

function pathMoves(path: { x: number; y: number }[]): number {
  if (path.length <= 1) return 0;
  let moves = 0;
  for (let i = 1; i < path.length; i++) {
    moves += Math.abs(path[i]!.x - path[i - 1]!.x) + Math.abs(path[i]!.y - path[i - 1]!.y);
  }
  return moves;
}

/**
 * Check that every cell on a horizontal or vertical line is free.
 */
function lineClear(
  grid: Grid,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  axis: "horizontal" | "vertical",
): boolean {
  if (axis === "horizontal") {
    if (y0 !== y1) return false;
    const step = x1 >= x0 ? 1 : -1;
    for (let x = x0; x !== x1 + step; x += step) {
      if (!grid.isFree(x, y0)) return false;
    }
    return true;
  }
  if (x0 !== x1) return false;
  const step = y1 >= y0 ? 1 : -1;
  for (let y = y0; y !== y1 + step; y += step) {
    if (!grid.isFree(x0, y)) return false;
  }
  return true;
}

/**
 * Single-source / single-target A* with Manhattan heuristic. Returns
 * the smoothed path, or null if no path exists.
 */
function aStarPath(
  grid: Grid,
  start: { x: number; y: number },
  end: { x: number; y: number },
): { x: number; y: number }[] | null {
  if (sameTile(start, end)) return [start];
  if (!grid.isFree(start.x, start.y)) return null;
  if (!grid.isFree(end.x, end.y)) return null;

  const open = new MinHeap<INode>((a, b) => a.f - b.f);
  const closed = new Set<string>();
  const bestG = new Map<string, number>();

  open.push({
    x: start.x,
    y: start.y,
    g: 0,
    f: manhattan(start, end),
    parent: null,
  });
  bestG.set(key(start.x, start.y), 0);

  const DIRS: ReadonlyArray<{ dx: number; dy: number }> = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
  ];

  while (!open.isEmpty()) {
    const current = open.pop()!;
    const ck = key(current.x, current.y);
    if (closed.has(ck)) continue;
    closed.add(ck);

    if (current.x === end.x && current.y === end.y) {
      return smoothPath(reconstruct(current), grid);
    }

    for (const { dx, dy } of DIRS) {
      const nx = current.x + dx;
      const ny = current.y + dy;
      if (!grid.isFree(nx, ny)) continue;
      const nk = key(nx, ny);
      if (closed.has(nk)) continue;

      const tentativeG = current.g + 1;
      const prior = bestG.get(nk);
      if (prior !== undefined && tentativeG >= prior) continue;
      bestG.set(nk, tentativeG);

      const neighbor: INode = {
        x: nx,
        y: ny,
        g: tentativeG,
        f: tentativeG + manhattan({ x: nx, y: ny }, end),
        parent: current,
      };
      open.push(neighbor);
    }
  }

  return null;
}

/**
 * Expand a compact path (start, optional corner, end) into a
 * tile-by-tile path that includes every cell along the way. Used
 * for rendering, since the visual belt/pipe fills each tile.
 */
export function expandPath(
  path: { x: number; y: number }[],
): { x: number; y: number }[] {
  if (path.length <= 1) return path.slice();
  const out: { x: number; y: number }[] = [path[0]!];
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!;
    const b = path[i]!;
    const stepX = Math.sign(b.x - a.x);
    const stepY = Math.sign(b.y - a.y);
    let x = a.x;
    let y = a.y;
    while (x !== b.x || y !== b.y) {
      x += stepX;
      y += stepY;
      out.push({ x, y });
    }
  }
  return out;
}

/** Cost: number of moves plus turn count, on the expanded path. */
function pathCost(path: { x: number; y: number }[]): number {
  const expanded = expandPath(path);
  if (expanded.length <= 1) return 0;
  let turns = 0;
  let prevDx = 0;
  let prevDy = 0;
  for (let i = 1; i < expanded.length; i++) {
    const a = expanded[i - 1]!;
    const b = expanded[i]!;
    const dx = Math.sign(b.x - a.x);
    const dy = Math.sign(b.y - a.y);
    if (i > 1 && (dx !== prevDx || dy !== prevDy)) turns++;
    prevDx = dx;
    prevDy = dy;
  }
  return expanded.length - 1 + turns * 0.5;
}

interface INode {
  x: number;
  y: number;
  g: number;
  f: number;
  parent: INode | null;
}

function key(x: number, y: number): string {
  return `${x},${y}`;
}

function sameTile(
  a: { x: number; y: number },
  b: { x: number; y: number },
): boolean {
  return a.x === b.x && a.y === b.y;
}

function manhattan(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function reconstruct(node: INode): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  let cur: INode | null = node;
  while (cur) {
    out.push({ x: cur.x, y: cur.y });
    cur = cur.parent;
  }
  out.reverse();
  return out;
}

/**
 * Drop intermediate tiles that lie on a straight line between their
 * neighbors. A→B→C with B on the line A→C gets shortened to A→C.
 *
 * Then collapses short "jog" segments at the start and end of the
 * path: if the last (or first) 1-tile perpendicular step can be
 * absorbed by extending the previous long run, do so.
 *
 * Finally, "string-pulls" the path: for each pair (i, j) of
 * consecutive bends, check if a straight line from path[i] to the
 * tile at the corner of the next segment is free; if so, replace
 * the jog. This catches mid-path detours that the per-end jog
 * collapse misses.
 */
export function smoothPath(
  path: { x: number; y: number }[],
  grid?: Grid,
): { x: number; y: number }[] {
  if (path.length <= 2) return path.slice();
  let out: { x: number; y: number }[] = [path[0]!];
  for (let i = 1; i < path.length - 1; i++) {
    const prev = out[out.length - 1]!;
    const cur = path[i]!;
    const next = path[i + 1]!;
    if (isColinear(prev, cur, next)) continue;
    out.push(cur);
  }
  out.push(path[path.length - 1]!);

  if (grid) {
    out = collapseEndJogs(out, grid);
    out = collapseStartJogs(out, grid);
    out = stringPull(out, grid);
  }
  return out;
}

function stringPull(
  path: { x: number; y: number }[],
  grid: Grid,
): { x: number; y: number }[] {
  if (path.length <= 2) return path;
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < path.length - 1 && !changed; i++) {
      const a = path[i]!;
      const b = path[i + 1]!;
      // Look ahead: from a, can we reach any tile beyond b on a
      // straight line? If b is colinear with a and the next tile, we
      // don't gain anything (already handled by the colinear pass).
      // Look for the farthest j > i+1 such that the line a→path[j] is
      // clear AND the path[i+1] is still "useful" (a 1-tile step
      // perpendicular to a's direction).
      if (i + 2 >= path.length) continue;
      const c = path[i + 2]!;
      // Skip if a, b, c are colinear (already smoothed).
      if (isColinear(a, b, c)) continue;
      // Try to bypass b by jumping directly from a to c.
      if (
        (a.x === c.x || a.y === c.y) &&
        lineClear(
          grid,
          a.x,
          a.y,
          c.x,
          c.y,
          a.x === c.x ? "vertical" : "horizontal",
        )
      ) {
        path = [...path.slice(0, i + 1), c, ...path.slice(i + 3)];
        changed = true;
      }
    }
  }
  return path;
}

function isColinear(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number },
): boolean {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) === 0;
}

function collapseEndJogs(
  path: { x: number; y: number }[],
  grid: Grid,
): { x: number; y: number }[] {
  for (let i = path.length - 3; i >= 0; i--) {
    const a = path[i]!;
    const b = path[i + 1]!;
    const c = path[i + 2]!;
    if (Math.abs(b.x - a.x) + Math.abs(b.y - a.y) !== 1) break;
    if (Math.abs(c.x - b.x) + Math.abs(c.y - b.y) !== 1) break;
    const stepAB = { dx: Math.sign(b.x - a.x), dy: Math.sign(b.y - a.y) };
    const stepBC = { dx: Math.sign(c.x - b.x), dy: Math.sign(c.y - b.y) };
    if (stepAB.dx === stepBC.dx && stepAB.dy === stepBC.dy) break;
    if (a.x !== c.x && a.y !== c.y) break;
    if (!lineClear(grid, a.x, a.y, c.x, c.y, a.x === c.x ? "vertical" : "horizontal")) break;
    return [...path.slice(0, i + 1), c, ...path.slice(i + 3)];
  }
  return path;
}

function collapseStartJogs(
  path: { x: number; y: number }[],
  grid: Grid,
): { x: number; y: number }[] {
  for (let i = 0; i <= path.length - 3; i++) {
    const a = path[i]!;
    const b = path[i + 1]!;
    const c = path[i + 2]!;
    if (Math.abs(b.x - a.x) + Math.abs(b.y - a.y) !== 1) break;
    if (Math.abs(c.x - b.x) + Math.abs(c.y - b.y) !== 1) break;
    const stepAB = { dx: Math.sign(b.x - a.x), dy: Math.sign(b.y - a.y) };
    const stepBC = { dx: Math.sign(c.x - b.x), dy: Math.sign(c.y - b.y) };
    if (stepAB.dx === stepBC.dx && stepAB.dy === stepBC.dy) break;
    if (a.x !== c.x && a.y !== c.y) break;
    if (!lineClear(grid, a.x, a.y, c.x, c.y, a.x === c.x ? "vertical" : "horizontal")) break;
    return [a, c, ...path.slice(i + 3)];
  }
  return path;
}

/**
 * A small binary min-heap keyed by a comparator. Standard array-as-heap
 * with `push`/`pop`/`isEmpty`. Self-contained — no external deps.
 */
class MinHeap<T> {
  private readonly data: T[] = [];
  constructor(private readonly cmp: (a: T, b: T) => number) {}

  isEmpty(): boolean {
    return this.data.length === 0;
  }

  push(value: T): void {
    this.data.push(value);
    this.bubbleUp(this.data.length - 1);
  }

  pop(): T | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0]!;
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      this.sinkDown(0);
    }
    return top;
  }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.cmp(this.data[i]!, this.data[parent]!) < 0) {
        [this.data[i], this.data[parent]] = [this.data[parent]!, this.data[i]!];
        i = parent;
      } else break;
    }
  }

  private sinkDown(i: number): void {
    const n = this.data.length;
    for (;;) {
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      let smallest = i;
      if (l < n && this.cmp(this.data[l]!, this.data[smallest]!) < 0) smallest = l;
      if (r < n && this.cmp(this.data[r]!, this.data[smallest]!) < 0) smallest = r;
      if (smallest === i) break;
      [this.data[i], this.data[smallest]] = [this.data[smallest]!, this.data[i]!];
      i = smallest;
    }
  }
}