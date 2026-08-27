# Machine Catalog (`src/data.ts`)

The static, orientation-agnostic definitions of every machine the
editor knows about. `main.ts` reads `ALL_MACHINE_TYPES` to populate the
dropdown, so the catalog is the single place to add or remove a
machine.

## Built-in Types

| Constant | Footprint | Ports |
|---|---|---|
| `MINER` | 5×5 | one `output` on `north`, tileIndex 2 — Iron Ore, 30/min |
| `FURNACE` | 5×5 | `input` Iron Ore on `south`, tileIndex 2 (30/min); `output` Iron Plate on `north`, tileIndex 2 (15/min) |

Both are exported as individual constants and rolled into
`ALL_MACHINE_TYPES: MachineType[]` — that's the array the editor
actually consumes.

## Why two ways to reference machines?

`ALL_MACHINE_TYPES` is what the UI iterates over. The named constants
(`MINER`, `FURNACE`) exist so tests and documentation can refer to a
specific type without an index lookup. New machine definitions should
follow the same pattern: declare a `const NAME: MachineType`, then add
it to the array.

## Adding a Machine

The full recipe lives in [reference/extending.md](../reference/extending.md).
In short:

1. Add a new `const X: MachineType = { name, width, height, ports: [...] }`.
2. Append it to `ALL_MACHINE_TYPES`.
3. Run `npm test` to confirm the new port geometry still works at
   every orientation, then `npm run dev` to see it in the dropdown.

## What Goes In `ports`?

A port must specify a `side` and a `tileIndex` *for the unrotated
machine*. The editor will rotate them automatically when the machine
is placed. A 5×5 machine with a single `north` port at `tileIndex: 2`
produces:

| Orientation | Resulting side | tileIndex | Tile |
|---|---|---|---|
| 0° | north | 2 | (x+2, y-1) |
| 90° | east | 2 | (x+5, y+2) |
| 180° | south | 2 (mirrored → 2) | (x+2, y+5) |
| 270° | west | 2 (mirrored → 2) | (x-1, y+2) |

For a 3×3 machine the half-turns would mirror: `tileIndex: 0` at 180°
becomes `2` (= 3 - 1 - 0). See [geometry.md](geometry.md) for the rule.

## Rate Convention

`rate` is **per minute for items**, **per second for fluids**. This is
declared in the JSDoc on `PortDef.rate` and is not enforced by the type
system — it is a convention.

Related: [types.md](types.md) · [extending.md](../reference/extending.md)
