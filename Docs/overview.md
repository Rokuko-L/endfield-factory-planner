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
    logistics-units.ts // Logistics Units (8, passthrough 1×1 — see data.md)
    depot-access.ts // Depot Access (10)
    resourcing.ts   // Resourcing rigs/pumps (6)
    power.ts        // Power infra (5)
    production-i.ts // Production I (7)
    production-ii.ts// Production II (13)
    fixtures.ts     // MINER + FURNACE — test placeholders, not wiki-derived
  data.ts         // Compatibility shim: export * from "./data/index.ts"
  grid.ts         // Tile-occupancy grid (machines + connections)
  geometry.ts     // Side rotation + port tile computation
  pathfinding.ts  // A* on free cells (findPath, findPathMulti, internal MinHeap)
  recipes.ts      // Connection auto-detect: matchRecipe, reconcileConnectionRecipes
  power.ts        // Power AoE: powerAoe, isPowered, machineInAoe
  bands.ts        // Edge-band resource lookup (resourceForBand)
  ports.ts        // allPortCells, pickPortAt — enumerates every port cell on the grid
  connections.ts  // completeDraft / buildConnection — validates and creates connections
  depot.ts        // Depot assignment, source/sink detection, sinkTotals/stalledCount
  depotPicker.ts  // Depot resource picker modal (openDepotPicker)
  recipeInfo.ts   // Recipe resolution for the selected machine (selectedRecipeFor)
  recipeInfoUi.ts // Recipe info panel renderer (renderRecipeInfoPanel)
  layout.ts       // Editor state types (EditorState, PickedPort, PortCell, DepotAssignment)
  ids.ts          // nextId — UUID with seeded fallback
  renderer.ts     // Canvas drawing (grid, connections, machines, ports, hover, draft)
  editor/         // Editor wiring split from main.ts (composition root)
    state.ts        // Grid, EditorState, selectedMachine, renderer
    status.ts       // setStatus
    metrics.ts      // boundingBoxArea, updateMetrics
    canvas.ts       // eventToTile
    selection.ts    // refreshRecipeInfo
    placement.ts    // placeMachine, removeMachineAt, clearAll, populateSelector, rotate
    connect.ts      // handleDepotClick, handleConnectClick, setMode
    demo.ts         // loadLcValleyDemo
    redraw.ts       // redraw
  machineEditor/  // Define Machines modal (split from machineEditor.ts)
    index.ts        // openMachineEditor (overlay + toolbar)
    grouping.ts     // groupByCategory
    formControls.ts // input, numberInput, select, escapeHtml
    machineForm.ts  // buildMachineForm + header + footprint fields
    edgeBandForm.ts // buildEdgeBandsSection
    portForm.ts     // buildPortsSection
    recipeForm.ts   // buildRecipesSection + slot list
  main.ts         // Thin composition root: queries DOM, wires events, calls editor/*
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
                         ├──> powerAoe / isPowered (src/power.ts) for power AoE + status
                         │
                         └──> Renderer.draw (src/renderer.ts)
                                 │
                                 └──> geometry.getAdjacentTile per port (src/geometry.ts)
```

`main.ts` is a thin composition root that wires DOM events to `src/editor/*` and `src/machineEditor/*`. The shared `EditorState` + `Grid` + `Renderer` live in `src/editor/state.ts` (`main.ts` owns the wiring, not the logic). On every change the editor redraws via `editor/redraw.ts` → `Renderer.draw` (pure). See `[ui/interactions.md](ui/interactions.md)` for the event table.

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
| [core/power.md](core/power.md) | Power AoE system: pylons, relays, powered status |
| [core/depot.md](core/depot.md) | Depot source/sink rules, resource enumeration, assignment persistence |
| [core/recipe-info.md](core/recipe-info.md) | Recipe resolution for the selected machine |
| [ui/interactions.md](ui/interactions.md) | `main.ts` state machine, modes, event wiring, controls |
| [ui/depot-picker.md](ui/depot-picker.md) | Depot resource picker modal |
| [ui/recipe-info-ui.md](ui/recipe-info-ui.md) | Recipe info panel rendering |
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
