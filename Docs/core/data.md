# Machine Catalog (`src/data.ts`)

The static, orientation-agnostic definitions of every machine the
editor knows about. `main.ts` reads `ALL_MACHINE_TYPES` to populate the
dropdown, so the catalog is the single place to add or remove a
machine.

## Built-in Types

| Constant | Footprint | Edge bands | Single-tile ports |
|---|---|---|---|
| `MINER` | 5×5 | `north`: output, item | — |
| `FURNACE` | 5×5 | `south`: input, item; `north`: output, item | `water_input` (west, tileIndex 2) |

Both are exported as individual constants and rolled into
`ALL_MACHINE_TYPES: MachineType[]` — that's the array the editor
actually consumes.

## Edge Bands vs Single-Tile Ports

A `MachineType` carries two kinds of port data:

- **`edgeBands`** — a per-side map of `{ type, resourceKind }`. The
  renderer paints the entire edge of the machine in the band color.
  Use this for whole-edge port zones (typical of item inputs/outputs).
- **`ports`** — a list of `PortDef` records. Each renders as a
  single-tile marker on the machine's edge. Use this for
  single-connection fluid inputs, or any future per-tile port.

The current data has the Furnace using both: a south band for the
item input, a north band for the item output, and a single-tile
fluid port for water on the west center.

## Why two ways to reference machines?

`ALL_MACHINE_TYPES` is what the UI iterates over. The named constants
(`MINER`, `FURNACE`) exist so tests and documentation can refer to a
specific type without an index lookup. New machine definitions should
follow the same pattern: declare a `const NAME: MachineType`, then add
it to the array.

## Adding a Machine

The full recipe lives in [reference/extending.md](../reference/extending.md).
In short:

1. Add a new `const X: MachineType = { name, width, height, ports: [...], edgeBands: {...} }`.
2. Append it to `ALL_MACHINE_TYPES`.
3. Run `npm test` to confirm the new port geometry still works at
   every orientation, then `npm run dev` to see it in the dropdown.

## Edge Band Convention

In 1-based user-friendly coordinates (machine origin at (1,1)):

- **South edge, all 5 cells (y=1, x=1..5)** — red, item input.
- **North edge, all 5 cells (y=5, x=1..5)** — green, item output.
- **West edge, only the center cell (x=1, y=3)** — blue, fluid input.

These match the typical Endfield machines (Furnace in particular).
Custom machines can vary the band color, fill, and which side(s) get
bands; the renderer just iterates whatever `edgeBands` declares.

## Rate Convention

`rate` is **per minute for items**, **per second for fluids**. This is
declared in the JSDoc on `PortDef.rate` and is not enforced by the type
system — it is a convention.

Related: [types.md](types.md) · [extending.md](../reference/extending.md) · [renderer.md](renderer.md)

