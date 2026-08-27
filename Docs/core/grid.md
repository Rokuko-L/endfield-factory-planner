# Grid (`src/grid.ts`)

The `Grid` class manages tile occupancy on a fixed-size, row-major
array. It tracks two independent layers:

1. **Machine occupancy** — each cell holds the id of the machine
   occupying it, or null when empty.
2. **Connection occupancy** — each cell holds the id of the
   connection (belt/pipe) occupying it, or null when empty.

A cell is **free** iff both layers are null. This is the only thing
the editor trusts to decide whether a placement is valid.

## Internal Layout

```ts
private readonly machineCells: (string | null)[][];
private readonly connectionCells: (string | null)[][];
```

Indexing is `cells[y][x]` for both layers. The grid's `width` ×
`height` are public readonly — `main.ts` sizes the canvas from them.
The default editor grid is **50 × 50** tiles (`main.ts: GRID_SIZE = 50`).

## API

| Method | Behavior |
|---|---|
| `isWithinBounds(x, y)` | True if `(x, y)` is inside the grid. |
| `isFree(x, y)` | True iff in bounds **and** neither a machine nor a connection occupies the cell. |
| `getOccupancyAt(x, y)` | Returns the machine id at `(x, y)`, or `null`. |
| `getConnectionAt(x, y)` | Returns the connection id at `(x, y)`, or `null`. |
| `canPlace(machine, x, y)` | True iff every tile of the machine's footprint is in bounds **and** free. |
| `canPlaceConnection(x, y)` | True iff the single tile is in bounds **and** free. |
| `placeMachine(machine)` | Fills the footprint with `machine.id`. Throws on collision. |
| `removeMachine(machineId)` | Clears every tile currently holding `machineId`. |
| `placeConnectionTiles(id, tiles)` | Marks the given tiles as occupied by `id`. Throws if any tile isn't free. |
| `removeConnection(id)` | Clears every tile currently holding `id`. |
| `occupiedTiles()` | All machine-occupied `(x, y)` pairs. |
| `connectionTiles()` | All connection-occupied `(x, y)` pairs. |

## Placement Invariant

A machine placement is valid **iff** the entire footprint is in
bounds and free. The editor enforces this in two places:

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
The editor also drops any connection whose source or destination
machine id matches the removed machine.

A connection placement is valid iff every tile in the routed path is
free. `Grid.placeConnectionTiles` enforces this and throws if any
tile is occupied.

## What the Grid Does Not Do

- It does **not** know about ports or machine orientation.
- It does **not** validate that a port tile is reachable from
  another machine's port tile — that is `pathfinding.ts`'s job.
- It does **not** own connection objects; it only tracks which
  tiles are occupied by which connection id. The `Connection` array
  lives in `main.ts` state.

## Tests

`test/grid.test.ts` covers bounds, empty/occupied read, footprint
fill on place, throw on invalid place, full-clear on remove, and the
"no-overlap" check from `canPlace`. The pathfinding tests cover
obstacle avoidance in `test/pathfinding.test.ts`. See
[reference/testing.md](../reference/testing.md).

Related: [types.md](types.md) · [geometry.md](geometry.md) · [pathfinding.md](pathfinding.md) · [interactions.md](../ui/interactions.md)
