import type { Grid } from './grid.ts';

/**
 * A 4-direction A* pathfinder that operates on grid cells. Returns the
 * inclusive list of tiles from `start` to `end`, or null if no path
 * exists. The start and end tiles must be free in the grid (i.e. not
 * occupied by a machine or another connection) for a path to be found
 * — callers should ensure that before invoking.
 */
export function findPath(
  grid: Grid,
  start: { x: number; y: number },
  end: { x: number; y: number },
): { x: number; y: number }[] | null {
  if (!grid.isFree(start.x, start.y) && !sameTile(start, end)) {
    return null;
  }
  if (!grid.isFree(end.x, end.y) && !sameTile(start, end)) {
    return null;
  }
  if (sameTile(start, end)) {
    return [start];
  }

  const open = new MinHeap<INode>((a, b) => a.f - b.f);
  const startNode: INode = {
    x: start.x,
    y: start.y,
    g: 0,
    f: manhattan(start, end),
    parent: null,
  };
  open.push(startNode);

  // Visited as a Set of "x,y" strings to keep allocation low.
  const closed = new Set<string>();
  const bestG = new Map<string, number>();
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
      return reconstruct(current);
    }

    for (const { dx, dy } of DIRS) {
      const nx = current.x + dx;
      const ny = current.y + dy;
      if (!grid.isFree(nx, ny)) continue;
      // The end cell is allowed even if it is on a port cell.
      // isFree already returned true for it above; we don't need a
      // special case here.
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

function sameTile(a: { x: number; y: number }, b: { x: number; y: number }): boolean {
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