# Grid (`src/grid.ts`)

The `Grid` class manages tile occupancy on a fixed-size, row-major
array. Each cell holds the `id` of the machine occupying it, or
`null` when empty. It is the only thing the editor trusts to decide
whether a placement is valid.

## Internal Layout

```ts
private readonly cells: (string | null)[][];
```

Indexing is `cells[y][x]`. The grid's `width` × `height` are public
readonly — `main.ts` sizes the canvas from them. The default editor
grid is **50 × 50** tiles (`main.ts: GRID_SIZE = 50`).

## API

| Method | Behavior |
|---|---|
| `isWithinBounds(x, y)` | True if `(x, y)` is inside the grid. |
| `getOccupancyAt(x, y)` | Returns the machine id at `(x, y)`, or `null` if empty or out of bounds. |
| `canPlace(machine, x, y)` | True iff every tile of the footprint is in bounds **and** unoccupied. |
| `placeMachine(machine)` | Fills the footprint with `machine.id`. Throws on invalid placement. |
| `removeMachine(machineId)` | Clears every tile currently holding `machineId`. |
| `occupiedTiles()` | Returns every occupied `(x, y)` as a flat list. |

## Placement Invariant

A placement is valid **iff** the entire footprint is in bounds and
unoccupied. The editor enforces this in two places:

1. **Proactive check** — `main.ts` calls `grid.canPlace` before
   constructing a `MachineInstance` and shows a red flash + status
   message if it fails.
2. **Reactive check** — `Grid.placeMachine` calls `canPlace` again
   and `throws` on failure. This is a safety net: if the editor is
   ever wrong about state, the grid refuses to corrupt itself.

`removeMachine` is keyed by id, not by position. If you remove a
machine and another machine happens to share tiles (which is
impossible given the invariant, but as a defensive note), the grid
clears every tile holding the id, not just the one you pointed at.

## What the Grid Does Not Do

- It does **not** know about ports or machine orientation.
- It does **not** validate that a port tile is reachable from another
  machine's port tile.
- It does **not** store rate information or connections.

All of those concerns are layered on top by `main.ts` and the future
routing phase.

## Tests

`test/grid.test.ts` covers bounds, empty/occupied read, footprint
fill on place, throw on invalid place, full-clear on remove, and the
"no-overlap" check from `canPlace`. See
[reference/testing.md](../reference/testing.md).

Related: [types.md](types.md) · [geometry.md](geometry.md) · [interactions.md](../ui/interactions.md)
