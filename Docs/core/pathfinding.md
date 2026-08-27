# Pathfinding (`src/pathfinding.ts`)

The connection editor's pathfinder. Given a set of "adjacent tiles" on
the source machine's port side and a set on the target machine's port
side, it returns the most compact valid path between them. Returns
`null` if no path exists.

## API

```ts
function findPath(
  grid: Grid,
  start: { x: number; y: number },
  end: { x: number; y: number },
): { x: number; y: number }[] | null;

function findPathMulti(
  grid: Grid,
  starts: { x: number; y: number }[],
  ends: { x: number; y: number }[],
): { x: number; y: number }[] | null;

function expandPath(
  path: { x: number; y: number }[],
): { x: number; y: number }[];
```

`findPath` is a convenience wrapper around `findPathMulti` with
single-element start/end sets.

`findPathMulti` returns the **expanded** path: every tile from the
chosen start cell to the chosen end cell, inclusive. The renderer
fills each tile with the connection's color so the visual is a
continuous belt/pipe.

`expandPath` is exported for tests and for callers that need to
expand a compact path (start, optional corner, end) into the
tile-by-tile form.

## Strategy

The pathfinder tries all `(start, end)` pairs (cartesian product of
the source set and target set) and picks the lowest-cost path. For
each pair, it tries in order:

1. **L-shape**: both possible L-corners (horizontal-first and
   vertical-first) and any straight-line variant. The L is "compact"
   (3 tiles: start, corner, end) or 2 tiles for a straight line.
   L-shapes with 1 turn are preferred because they're the cleanest
   visual.
2. **A\* with smoothing**: full 4-direction A* with Manhattan
   heuristic, plus a post-processor that drops colinear intermediates
   and collapses short "jog" segments at the path's start and end.

The path with the lowest `pathCost` (moves + 0.5 × turns) wins. For
typical Endfield port cells (≤5 per side), this is at most 25
candidates per connection.

## Why Multi-Source / Multi-Target

The user picks a *side* on each machine, not a specific cell. With
multi-source/target routing, the pathfinder is free to use any
adjacent cell on the source side and any on the target side. This
fixes the "clicked the wrong cell, the belt comes out somewhere
else" problem: the pathfinder picks the cell that produces the
cleanest path, regardless of which cell the user actually clicked.

## Smoothing

The raw A* path may include colinear intermediates. The smoother:

1. **Colinear pass** — drop any middle tile that lies on the line
   between its neighbors.
2. **End-jog collapse** — for short 1-tile perpendicular segments
   at the start or end of a long parallel run, try to absorb them
   into the long run if the line is clear.
3. **String-pulling** — for each pair of consecutive bends, check
   if a straight line from one bend to the next is clear; if so,
   drop the intermediate tiles.

These are best-effort heuristics for cleaning up the A* result
when no L is available. The L-shape path is already optimal.

## What the Pathfinder Does Not Do

- No diagonal movement.
- No weighted terrain.
- No path caching.
- No path-smoothing that bypasses turns on staircases (string-pulling
  only handles colinear bypasses).

## Tests

`test/pathfinding.test.ts` covers:

- Same-cell start and end.
- Straight horizontal and vertical paths.
- L-shape routing when both L-variants are valid.
- Occupied start/end → null.
- Routing around a wall.
- Fully enclosed destination → null.
- Connection tiles as obstacles.
- Multi-source / multi-target pair selection.
- Path expansion from compact to tile-by-tile form.

Related: [grid.md](grid.md) · [geometry.md](geometry.md) · [interactions.md](../ui/interactions.md)
