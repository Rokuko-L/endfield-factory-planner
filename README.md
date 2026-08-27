# Endfield Factory Planner

A browser-based tool for planning factory layouts in **Arknights: Endfield**.
This first phase focuses on the foundation: core data structures, grid
placement, collision detection, and a minimal interactive grid editor. No
optimization, routing, or backend — everything runs client-side.

## Tech Stack

- TypeScript (strict mode, `noUncheckedIndexedAccess`, `noImplicitOverride`)
- Vite 5 with the `vanilla-ts` template
- Vitest 2 for unit tests
- HTML + CSS + a `<canvas>` for rendering
- No framework, no backend

## Quick Start

This project lives at `D:\Tugas\LLM\endminsworkshop` on Windows. Install
dependencies through the **Windows host's npm** — the WSL npm has hardlink
trouble on the DrvFs mount:

```powershell
cd D:\Tugas\LLM\endminsworkshop
npm install
npm run dev
```

From a WSL shell, route through `cmd.exe`:

```bash
cmd.exe /c "cd /d D:\Tugas\LLM\endminsworkshop && npm run dev"
```

The dev server prints a `http://localhost:5173/` URL. Open it in a Windows
browser. Click the grid to place, **R** to rotate, **right-click** to remove.

## Available Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR. |
| `npm run build` | Type-check (`tsc --noEmit`) and produce a `dist/` bundle. |
| `npm run preview` | Serve the production build locally. |
| `npm test` | Run the Vitest suite once. |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run typecheck` | Run `tsc --noEmit` only. |

## Documentation

Read **[Docs/overview.md](Docs/overview.md)** for the full tour. Highlights:

- [Docs/workflow.md](Docs/workflow.md) — how to run, scripts, project layout.
- [Docs/core/types.md](Docs/core/types.md) — the domain model.
- [Docs/core/grid.md](Docs/core/grid.md) — tile occupancy and placement.
- [Docs/core/geometry.md](Docs/core/geometry.md) — port rotation math.
- [Docs/core/renderer.md](Docs/core/renderer.md) — canvas drawing.
- [Docs/ui/interactions.md](Docs/ui/interactions.md) — `main.ts` events and state.
- [Docs/reference/extending.md](Docs/reference/extending.md) — how to add a
  new machine type.
- [Docs/reference/testing.md](Docs/reference/testing.md) — what the test
  suite covers and how to add to it.

## Editor Controls

- **Click** on the grid to place the selected machine at that cell
  (the click becomes the top-left corner of its footprint).
- **R** to rotate the next placement through 0° → 90° → 180° → 270°.
- **Right-click** on a machine to remove it.
- **Clear All** button to reset the layout.

Port colors: red = item input (whole edge), green = item output (whole
edge), blue = fluid input/output (single tile). Each is drawn as a
subtle fill on the cell plus a colored stroke on its outer edge.
