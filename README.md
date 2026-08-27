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

## Getting Started

This project lives at `D:\Tugas\LLM\endminsworkshop` on Windows.
The first time you work on it, install dependencies **through the Windows
host's npm** (WSL's npm has hardlink trouble on DrvFs mounts):

```powershell
cd D:\Tugas\LLM\endminsworkshop
npm install
```

Then run the dev server:

```powershell
npm run dev
```

…or, equivalently from WSL, route the commands through `cmd.exe`:

```bash
cmd.exe /c "cd /d D:\Tugas\LLM\endminsworkshop && npm run dev"
```

The dev server prints a `http://localhost:5173/` URL. Open it in your browser.

## Available Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR. |
| `npm run build` | Type-check (`tsc --noEmit`) and produce a `dist/` bundle. |
| `npm run preview` | Serve the production build locally. |
| `npm test` | Run the Vitest suite once. |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run typecheck` | Run `tsc --noEmit` only. |

## Editor Controls

- **Click** on the grid to place the selected machine at that cell
  (the click becomes the top-left corner of its footprint).
- **R** to rotate the next placement through 0° → 90° → 180° → 270°.
- **Right-click** on a machine to remove it.
- **Clear All** button to reset the layout.
- The right-hand panel shows the live status, machine count, and the
  bounding box area (in tiles) of all placed machines.

Ports are color-coded: red = item input, green = item output, blue = fluid
(input or output).

## Project Layout

```
src/
  types.ts     // MachineInstance, MachineType, PortDef, Connection, …
  data.ts      // Sample machine definitions + ALL_MACHINE_TYPES
  grid.ts      // Tile-occupancy grid (canPlace / placeMachine / remove)
  geometry.ts  // Port rotation + absolute tile computation
  renderer.ts  // Canvas drawing (grid, machines, ports, preview)
  main.ts      // UI wiring and event handling
  style.css    // Editor styling
index.html     // Vite entry
test/          // Vitest unit tests
  grid.test.ts
  geometry.test.ts
```

## Adding a New Machine Type

1. Open `src/data.ts`.
2. Append a new `MachineType` constant. Ports are defined for the
   *unrotated* (facing north) machine:
   ```ts
   export const ASSEMBLER: MachineType = {
     name: 'Assembler',
     width: 3,
     height: 3,
     ports: [
       { id: 'plate_in', type: 'input',  side: 'south', tileIndex: 1,
         resource: 'Iron Plate', kind: 'item', rate: 30 },
       { id: 'gear_out', type: 'output', side: 'north', tileIndex: 1,
         resource: 'Iron Gear',  kind: 'item', rate: 15 },
     ],
   };
   ```
3. Add the constant to `ALL_MACHINE_TYPES` so the dropdown picks it up:
   ```ts
   export const ALL_MACHINE_TYPES: MachineType[] = [MINER, FURNACE, ASSEMBLER];
   ```
4. Run `npm test` to confirm rotation + placement still behave correctly,
   and `npm run dev` to see it in the dropdown.

### Port Semantics

- `side` is the unrotated side: `north | east | south | west`.
- `tileIndex` is 0-based along that side: left→right for north/south,
  top→bottom for east/west.
- The port occupies the single tile *just outside* the machine's footprint
  on the side it points to. The `geometry.ts` module rotates the port
  with the machine so a 5x5 machine with a `north` port at `tileIndex: 2`
  places that port at the tile above column 2 at 0°, the tile right of
  row 2 at 90°, etc.

## Next Phases (not yet implemented)

- Connections between machine ports (matching resource kind, balancing rate).
- Layout save/load (JSON export/import).
- Routing / conveyor visualization.
- Rate-based throughput validation.
