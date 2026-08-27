# Pathfinding (`src/pathfinding.ts`)

A 4-direction A* that operates on the `Grid`'s free cells. Returns
the inclusive list of tiles from `start` to `end`, or `null` if no
path exists. Movement is orthogonal (no diagonals); the heuristic is
Manhattan distance.

## `findPath(grid, start, end)`

```ts
function findPath(
  grid: Grid,
  start: { x: number; y: number },
  end: { x: number; y: number },
): { x: number; y: number }[] | null;
```

The pathfinder reads `grid.isFree(x, y)` to decide whether a neighbor
is passable. Cells occupied by machines or other connections are
treated as obstacles.

The returned path is inclusive: the first element is `start` and the
last is `end`. If `start` and `end` are the same cell, the result is
`[start]`.

`null` is returned when:

- `start` is not free (and is not the same cell as `end`),
- `end` is not free (and is not the same cell as `start`),
- the destination is fully enclosed and unreachable.

## Obstacle Model

Anything `grid.isFree` reports as occupied is an obstacle. Today that
includes machine tiles and connection tiles (belts and pipes). The
pathfinder doesn't know about the difference — it just avoids
non-free cells.

When the editor asks for a path between two ports, the start and end
are the cells *adjacent* to the source and target machines (computed
by `getAdjacentTile` / `getPortAdjacentTile`). Those adjacent cells
must be free; if a port sits flush against another machine, the
adjacent cell is occupied and the connection can't start there.

## Implementation Notes

The implementation is self-contained — no external dependencies.

- **Priority queue** — a small binary min-heap keyed by `f = g +
  manhattan(end)`. The heap is in the same file as a private
  `MinHeap<T>` class.
- **Visited set** — a `Set<string>` of `"x,y"` keys. Cheap to
  build/lookup.
- **Best-g map** — a `Map<string, number>` of the best known `g`
  per cell. Stops the algorithm from re-queueing a worse path to a
  cell it has already reached more cheaply.
- **4 neighbors** — `(+1, 0)`, `(-1, 0)`, `(0, +1)`, `(0, -1)`. No
  diagonal movement.

The heap pushes duplicate nodes for the same cell if a shorter path
is found; the closed-set check in the main loop skips the duplicates.

## What the Pathfinder Does Not Do

- No diagonal movement. Belts and pipes are 4-direction in this
  model.
- No weighted terrain — every move costs 1.
- No path smoothing. The result is a tile-by-tile route.
- No caching. Each call recomputes from scratch.

## Tests

`test/pathfinding.test.ts` covers:

- Same-cell start and end.
- Straight horizontal and vertical paths.
- Occupied start or end → `null`.
- Routing around a wall of machines.
- A fully enclosed destination → `null`.
- Connection tiles as obstacles.
- Optimal (Manhattan) length on an empty grid.

Related: [grid.md](grid.md) · [geometry.md](geometry.md) · [interactions.md](../ui/interactions.md)
