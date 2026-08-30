# Workflow

How to install, run, test, and build the Endfield Factory Planner.

> Toolchain caveat: this project lives at `D:\Tugas\LLM\endminsworkshop` on
> Windows. Use **Windows' own `node`/`npm`** for all scripts (the WSL
> npm has hardlink trouble on DrvFs mounts). See
> [AGENTS.md](../AGENTS.md) for the full note. From a WSL shell, route
> through `cmd.exe`:
> ```bash
> cmd.exe /c "cd /d D:\Tugas\LLM\endminsworkshop && npm run dev"
> ```

---

## Quick Start

```powershell
cd D:\Tugas\LLM\endminsworkshop
npm install
npm run dev
```

The dev server prints a `http://localhost:5173/` URL. Open it in your
browser. Click the grid to place, **R** to rotate, **right-click** to
remove.

## Available Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR. |
| `npm run build` | Type-check (`tsc --noEmit`) and produce a `dist/` bundle. |
| `npm run preview` | Serve the production build locally. |
| `npm test` | Run the Vitest suite once. |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run typecheck` | Run `tsc --noEmit` only. |

The dev server uses Vite 5 + the `vanilla-ts` template. There is no
backend; the editor is fully client-side.

## Project Layout

```
endminsworkshop/
├── Docs/                This documentation tree
├── src/                 Application source
│   ├── data/              Modular catalog (one file per category + index.ts barrel)
│   ├── data.ts            Compatibility shim re-exporting data/index.ts
│   ├── bands.ts           Edge-band resource lookup
│   ├── ports.ts           Port-cell enumeration (allPortCells, pickPortAt)
│   ├── connections.ts     Connection validation + creation
│   ├── layout.ts          Editor state types
│   ├── ids.ts             ID generation (UUID with fallback)
│   └── ...
├── test/                Vitest unit tests
├── index.html           Vite entry
├── package.json
├── tsconfig.json
├── vite.config.ts
└── AGENTS.md            Runbook: toolchain + commit-and-push policy
```

`node_modules/`, `dist/`, and editor scratch are gitignored.

## Catalog Workflow

- **Source of truth**: `src/data/` — one file per category plus
  `index.ts` barrel. Edit directly to add or change machines.
- **Quick iteration**: Define Machines → Save (localStorage) for
  fast local iteration, Export JSON when ready to commit. Import JSON
  reloads a previously exported catalog.
- No `scraped/` or `scripts/` pipeline — the old wiki-scrape
  machinery has been removed.

## Run Loop From WSL

If you live in WSL, the dev server runs on the Windows host, so you
need to either open a Windows terminal or wrap the command:

```bash
# Run dev (Ctrl-C to stop)
cmd.exe /c "cd /d D:\Tugas\LLM\endminsworkshop && npx vite"

# Run tests
cmd.exe /c "cd /d D:\Tugas\LLM\endminsworkshop && npx vitest run"

# Type-check
cmd.exe /c "cd /d D:\Tugas\LLM\endminsworkshop && npx tsc --noEmit"
```

The dev server binds to a Windows-side localhost that the WSL network
namespace cannot reach directly — open the URL in a Windows browser.

## Editor Controls (in-app)

- **Click** on the grid to place the selected machine at that cell
  (the click becomes the top-left corner of its footprint).
- **R** to rotate the next placement through 0° → 90° → 180° → 270°.
- **Right-click** on a machine to remove it (also removes its connections).
- **Right-click** on a belt/pipe tile to remove the connection.
- **Clear All** / **Clear Connections** buttons.
- **Define Machines** — edit the catalog (Import/Export JSON, validation
  on Save and on load).
- The right-hand panel shows the live status, machine count, and the
  bounding-box area (in tiles) of all placed machines.

Related: [overview.md](overview.md) · [ui/interactions.md](ui/interactions.md) · [AGENTS.md](../AGENTS.md)
