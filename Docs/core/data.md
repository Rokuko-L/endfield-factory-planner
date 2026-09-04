# Machine Catalog (`src/data/`)

The static, orientation-agnostic definitions of every machine the
editor knows about. `main.ts` reads `ALL_MACHINE_TYPES` from the
barrel to populate the dropdown, so the catalog is the single place
to add or remove a machine.

## Layout

```
src/data/
  index.ts            // Barrel: re-exports every constant + ALL_MACHINE_TYPES
  planting.ts         // Planting plots (10)
  logistics-units.ts  // Logistics Units (8) — passthrough 1×1, no I/O
  depot-access.ts     // Depot Access (10)
  resourcing.ts       // Resourcing rigs/pumps (6)
  power.ts            // Power infra (5)
  production-i.ts     // Production I (7)
  production-ii.ts    // Production II (13)
  miscellaneous.ts    // Miscellaneous (1)
  fixtures.ts         // MINER + FURNACE — test placeholders, not wiki-derived
src/data.ts           // Compatibility shim: export * from "./data/index.ts"
```

Each `*.ts` file exports named `MachineType` constants (e.g.
`AKETINE_PLOT`, `BELT_BRIDGE`). The barrel re-exports them and
assembles `ALL_MACHINE_TYPES: MachineType[]` — that's the array the
editor actually consumes. `src/data.ts` re-exports the barrel so
`import { X } from './data.ts'` keeps working.

`src/data/` is the source of truth — edit those files directly.
Define Machines → Export/Import JSON is for quick round-trips without
hand-editing.

## Built-in Fixtures

| Constant | Footprint | Edge bands | Single-tile ports |
|---|---|---|---|
| `MINER` | 5×5 | `north`: output, item | — |
| `FURNACE` | 5×5 | `south`: input, item; `north`: output, item | `water_input` (west, tileIndex 2) |

Both live in `fixtures.ts` and are rolled into `ALL_MACHINE_TYPES`.
They are placeholders for the test suite, not wiki-derived.

## Passthrough Machines (no I/O)

Not every machine needs ports or recipes. The catalog marks these
explicitly as `ports: [], edgeBands: {}, recipes: []` with a
`— passthrough, no I/O` comment:

- **Logistics Units** (8): Belt/Pipe bridges, splitters, convergences,
  control ports — all 1×1 passthrough addons.
- **Some Depot/Power/Planting entries** that the wiki lists without
  recipes.

This is intentional. Don't invent ports where the game has none.

## Edge Bands vs Single-Tile Ports

A `MachineType` carries two kinds of port data:

- **`edgeBands`** — a per-side map of `{ type, resourceKind, resource? }`.
  The renderer paints the entire edge of the machine in the band color.
  Use this for whole-edge port zones (typical of item inputs/outputs).
  `resource` is optional; when absent the band is "unconfigured" and
  `resourceForBand` falls back to the machine's recipe inputs/outputs.
- **`ports`** — a list of `PortDef` records. Each renders as a
  single-tile marker on the machine's edge. Use this for
  single-connection fluid inputs, or any future per-tile port.

## Why two ways to reference machines?

`ALL_MACHINE_TYPES` is what the UI iterates over. The named constants
(`AKETINE_PLOT`, `FURNACE`, etc.) exist so tests and documentation
can refer to a specific type without an index lookup. New machine
definitions should follow the same pattern: declare a
`const NAME: MachineType`, then add it to the barrel array.

## Adding a Machine

The full recipe lives in [reference/extending.md](../reference/extending.md).
In short: edit or add a constant in the appropriate `src/data/*.ts`
file, export it, add it to the barrel's `ALL_MACHINE_TYPES` array,
then `npm test` and `npm run dev` to verify.

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

## Gases Ride Pipes

All gaseous resources — Cuprium/Hetonite/Pyrrolite Gas, Inergen, Xiragen,
Acridgen, Heavy Xiragen — are cataloged as `kind: "fluid"` so they flow
through pipes (120/min), matching the game
([Flow Rate](https://endfield.wiki.gg/wiki/Flow_Rate)). Canisters remain
items.

Gas chain anchors (wiki-derived):

- **Gas Extractor** — produces Inergen or Xiragen (2/s), needs no power
  (natural flow extraction), fluid output band on the south edge.
- **Gas Dispersing Unit** — consumes a gas at a **0.1/s (6/min) minimum**
  to create environments; excess is wasted. Fluid input band, north edge.
- Fluid-Gas / Solid-Gas Transmuting Units and the Gas Reactor Globe
  consume/produce gases in 2s recipes at 30–60/min.

Known gap: some gas consumers (e.g. Filling Unit) still have item-only
edge bands, so their gas-side recipes are not yet connectable in the
editor — their bands predate fluid gases.

Related: [flow.md](flow.md) for how these rates propagate.
