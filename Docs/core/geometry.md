# Port Geometry (`src/geometry.ts`)

The math that turns a *unrotated* port definition into the absolute
grid tile it occupies after the machine is placed and rotated, plus
helpers for finding the cell just outside the machine on a given
edge. Used by the renderer, the connection-mode hit-testing, and the
A* pathfinder.

## Exported Functions

| Function | Returns |
|---|---|
| `rotateSide(side, orientation)` | The `Side` after applying a clockwise rotation. |
| `transformPort(port, machine)` | The `{ side, tileIndex }` of a `PortDef` after applying the machine's orientation. |
| `getPortTile(port, machine)` | The grid tile just outside the machine at the port's rotated position. |
| `getAdjacentTile(side, cellIndex, machine)` | The grid tile just outside the machine on a given (rotated) side at a given cellIndex. |
| `getPortAdjacentTile(port, machine)` | Convenience: `getAdjacentTile(transformPort(port, machine).side, transformPort(port, machine).tileIndex, machine)`. |

## `rotateSide(side, orientation)` → `Side`

Maps a side through a clockwise rotation. The side list is kept in
clockwise order: `['north', 'east', 'south', 'west']`. Rotating by
`90 * quarters` adds `quarters` positions in the list, modulo 4.

| side \ orientation | 0 | 90 | 180 | 270 |
|---|---|---|---|---|
| north | north | east | south | west |
| east | east | south | west | north |
| south | south | west | north | east |
| west | west | north | east | south |

## `transformPort(port, machine)` → `{ side, tileIndex }`

Rotates both the **side** and the **tileIndex**. The side goes through
`rotateSide`. The tileIndex is mirrored on half-turn rotations:

- `0°` and `90°`: index is preserved.
- `180°` and `270°`: index becomes `sideLength - 1 - tileIndex`,
  where `sideLength` is the dimension the index runs along **in the
  source orientation** — `width` for a side that was north/south,
  `height` for a side that was east/west.

This mirrors the visual sense of a half-turn: a port that was on the
top edge of the machine now sits on the bottom edge, with the same
left-to-right ordering preserved relative to the *machine's* local
frame.

The mirroring length comes from the *source* orientation. For a
quarter-turn (90° or 270°), the index axis is swapped but the index
is not mirrored, because the new side has its own count direction.

## `getPortTile(port, machine)` → `{ x, y }`

The absolute grid coordinates of the port tile. The port occupies
**one tile just outside the machine's footprint** on its side:

| `side` | Resulting tile (relative to machine top-left at (x, y)) |
|---|---|
| north | `(x + tileIndex, y - 1)` |
| south | `(x + tileIndex, y + height)` |
| east | `(x + width, y + tileIndex)` |
| west | `(x - 1, y + tileIndex)` |

A port is intentionally placed on a tile **outside** the footprint so
two adjacent machines can meet port-to-port with no gap. The grid
treats those outside tiles as ordinary unoccupied space — `placeMachine`
never fills them. The only constraint today is that two footprints
can't overlap; port-vs-port matching will be a future routing
concern.

## Worked Example

A 5×5 Miner with a `north` port at `tileIndex: 2`, placed at
`(0, 0)`:

| orientation | side | tileIndex | tile |
|---|---|---|---|
| 0° | north | 2 | (2, -1) |
| 90° | east | 2 | (5, 2) |
| 180° | south | 2 (mirrored → 2) | (2, 5) |
| 270° | west | 2 (mirrored → 2) | (-1, 2) |

For a 3×3 machine with the *same* port definition the half-turn
mirroring would change: `tileIndex: 0` at 180° becomes `2`, etc. The
source-side length is what flips.

## `getAdjacentTile(side, cellIndex, machine)` → `{ x, y }`

Returns the tile just outside the machine on a given edge at a
specific position along that edge. The side and cellIndex are in the
**rotated** frame — they describe the actual visible edge of the
placed machine, not the unrotated port definition. This is the
function connection routing uses to find the start/end of a path.

| `side` | Resulting tile (relative to machine top-left at (x, y)) |
|---|---|
| north | `(x + cellIndex, y - 1)` |
| south | `(x + cellIndex, y + height)` |
| east | `(x + width, y + cellIndex)` |
| west | `(x - 1, y + cellIndex)` |

For a south band on a 5×5 machine, every cell of the band has an
adjacent tile: cell at `(x+0, y+4)` → adjacent `(x+0, y+5)`,
cell at `(x+1, y+4)` → adjacent `(x+1, y+5)`, and so on. The
connection's start or end is whichever adjacent cell the user
clicked on (the closest band cell to the click).

`getPortAdjacentTile(port, machine)` is a one-call convenience for
single-tile `PortDef`s: it runs `transformPort` and then
`getAdjacentTile` so callers don't have to thread the rotated
side+index through manually.

## Tests

`test/geometry.test.ts` covers `rotateSide` for every (side, orientation)
combination, `transformPort` and `getPortTile` for all four rotations
of the Miner and Furnace, plus `getAdjacentTile` for the four
directions and a non-zero machine origin.

Related: [types.md](types.md) · [grid.md](grid.md) · [renderer.md](renderer.md)
