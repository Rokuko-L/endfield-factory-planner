# Endfield Factory Planner — Overview

A browser-based tool for planning factory layouts in **Arknights: Endfield**.
This first phase focuses on the foundation: core data structures, grid
placement, collision detection, and a minimal interactive grid editor. No
optimization, routing, or backend — everything runs client-side.

> **Start here if unsure which doc to read.** This page cross-links everything.

---

## Code Architecture

```
src/
  types.ts        // Domain model: MachineInstance, MachineType, PortDef, EdgeBand, Connection, Layout
  data/           // Modular catalog — one file per category + barrel (source of truth)
    index.ts        // Barrel: re-exports every constant + ALL_MACHINE_TYPES
    planting.ts     // Planting plots (10)
    logistics-units.ts // Logistics Units (8, passthrough 1×1 — see data.md)
    depot-access.ts // Depot Access (10)
    resourcing.ts   // Resourcing rigs/pumps (6)
    power.ts        // Power infra (5)
    production-i.ts // Production I (7)
    production-ii.ts// Production II (13)
    miscellaneous.ts// Miscellaneous (1)
    fixtures.ts     // MINER + FURNACE — test placeholders, not wiki-derived
  data.ts         // Compatibility shim: export * from "./data/index.ts"
  grid.ts         // Tile-occupancy grid (machines + connections)
  geometry.ts     // Side rotation + port tile computation
  pathfinding.ts  // A* on free cells (findPath, findPathMulti, internal MinHeap)
  recipes.ts      // Connection auto-detect: matchRecipe, reconcileConnectionRecipes
  bands.ts        // Edge-band resource lookup (resourceForBand)
  ports.ts        // allPortCells, pickPortAt — enumerates every port cell on the grid
  connections.ts  // completeDraft / buildConnection — validates and creates connections
  layout.ts       // Editor state types (EditorState, PickedPort, PortCell)
  ids.ts          // nextId — UUID with seeded fallback
  renderer.ts     // Canvas drawing (grid, connections, machines, ports, hover, draft)
  main.ts         // UI wiring, event handling, editor state (place + connect modes)
  machineEditor.ts // Modal for editing the catalog (Import/Export, validation)
  machineStore.ts  // Catalog persistence: localStorage + import/export + validation on load
  machineValidate.ts // Catalog validation
  style.css       // Editor styling
index.html        // Vite entry (toolbar, canvas, status panel)
test/             // Vitest unit tests
  grid.test.ts
  geometry.test.ts
  pathfinding.test.ts
  recipes.test.ts
```

**Data flow:**

```
Mouse/keyboard events ──> main.ts (state, mode)
                         │
                         ├──> Grid.canPlace / placeMachine / removeMachine (src/grid.ts)
                         ├──> pickPortAt / allPortCells (src/ports.ts) + resourceForBand (src/bands.ts)
                         ├──> completeDraft (src/connections.ts) → findPathMulti (src/pathfinding.ts)
                         ├──> matchRecipe (src/recipes.ts) for connection auto-detect
                         │
                         └──> Renderer.draw (src/renderer.ts)
                                 │
                                 └──> geometry.getAdjacentTile per port (src/geometry.ts)
```

`main.ts` owns the editor state and the `Grid` instance. It runs in
one of two modes: **place** (default — click to add machines) or
**connect** (click output port → click input port → A* finds a
path → fills connection tiles). On every change it redraws the
`Renderer` with the latest machine list, connections, hover
preview, and the in-progress connection draft. The `Renderer` is a
pure function of its inputs — it does not hold state.

The catalog lives directly in `src/data/` (one file per category +
barrel). Edit those files or use Define Machines → Export JSON to
update the catalog. `scripts/` and `scraped/` have been removed.

---

## Documentation Map

| Doc | Contents |
|---|---|
| [workflow.md](workflow.md) | How to run, scripts, project layout on disk |
| [core/types.md](core/types.md) | The domain model — what each type means and how they relate |
| [core/data.md](core/data.md) | The machine catalog and how to extend it |
| [core/grid.md](core/grid.md) | Tile occupancy, bounds, and the placement invariant |
| [core/geometry.md](core/geometry.md) | Port rotation rules and the tile-index mirror |
| [core/pathfinding.md](core/pathfinding.md) | A* on free cells, obstacle model, algorithm notes |
| [core/renderer.md](core/renderer.md) | Canvas drawing conventions, colors, and DPI scaling |
| [ui/interactions.md](ui/interactions.md) | `main.ts` state machine, modes, event wiring, controls |
| [reference/testing.md](reference/testing.md) | Vitest setup, what is covered, how to add tests |
| [reference/extending.md](reference/extending.md) | How to add a new machine type (the canonical recipe) |
| [reference/machine-editor.md](reference/machine-editor.md) | The machine editor modal (Import/Export, validation) |

---

## Key Rules (short version)

1. **Coordinates are grid tiles, top-left origin, y increasing downward.**
   `0,0` is the top-left cell; `width-1, height-1` is the bottom-right.
2. **Port definitions are for the unrotated machine.** Rotation is applied
   at render time and on port lookup — `src/data/*` is orientation-agnostic.
3. **Tile occupancy is the source of truth for placement.** Always go
   through `Grid.canPlace` before writing; `placeMachine` will throw on
   collision but the editor should *prevent* collisions, not just report
   them.
4. **The `Renderer` is a pure function of its inputs.** No state in the
   renderer; all editor state lives in `main.ts`.
5. **Strict TypeScript is on.** `tsc --noEmit` must pass for every change
   (`npm run typecheck`).
6. **Tests run offline via Vitest.** No network, no real timers beyond
   the in-test placement flow.

Related: [workflow.md](workflow.md) · [AGENTS.md](../AGENTS.md) · [README.md](../README.md)
