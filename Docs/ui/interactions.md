# UI / Interactions (`src/main.ts` + `src/editor/*`, `index.html`, `src/style.css`)

The editor's interaction layer. `main.ts` is a thin composition root
that wires DOM events; the actual editor logic lives in `src/editor/*`
and the Define Machines modal in `src/machineEditor/*`. There is no
framework — just typed DOM access and small event handlers. Port and
connection logic lives in `src/ports.ts` and `src/connections.ts`; ID
generation in `src/ids.ts`; band resource lookup in `src/bands.ts`;
state types in `src/layout.ts`; shared `EditorState` + `Grid` +
`Renderer` in `src/editor/state.ts`.

## State

```ts
// src/layout.ts — EditorState
const state: EditorState = {
  machineTypes: MachineType[];  // from loadMachineTypes() (validated on load)
  machines: MachineInstance[];
  connections: Connection[];
  selectedIndex: number;       // index into ALL_MACHINE_TYPES
  orientation: 0 | 90 | 180 | 270;
  mode: 'place' | 'connect';
  hover: { x, y } | null;      // tile under the cursor
  invalidFlash: { x, y, w, h } | null;  // set briefly on failed click
  draftSource: PickedPort | null;
  draftAdjacent: { x, y } | null;
  draftPath: { x, y }[] | null;
};
```

The `Grid` instance is the source of truth for occupancy of both
machines and connections. `state.machines` and `state.connections`
are denormalized copies that the renderer iterates over; they stay
in sync because every state mutation calls `grid.placeMachine` /
`grid.removeMachine` / `grid.placeConnectionTiles` /
`grid.removeConnection` immediately before mutating the array.

## Modes

The editor runs in one of two modes:

- **Place** (default). Click an empty tile to drop the selected
  machine. R rotates the next placement. Right-click removes a
  machine.
- **Connect**. Click an output port (or any cell on a band), then an
  input port. The editor runs A* between the two ports' adjacent
  tiles and creates a connection on success. Right-click on a
  belt/pipe removes the connection; right-click on a machine removes
  the machine.

The toolbar buttons `#mode-place` and `#mode-connect` toggle between
the two. Switching modes drops any in-progress draft.

## Event Wiring

| Element | Event | Action |
|---|---|---|
| `<select id="machine-select">` | `change` | `state.selectedIndex = +select.value`; redraw. |
| `<canvas id="grid">` | `pointermove` | `state.hover = eventToTile(e)`; redraw. |
| `<canvas id="grid">` | `pointerleave` | `state.hover = null`; redraw. |
| `<canvas id="grid">` | `click` | Place: `placeMachine(tile.x, tile.y)`. Connect: `handleConnectClick(tile)`. |
| `<canvas id="grid">` | `contextmenu` | `e.preventDefault()`. Connection tile? `removeConnectionAt(...)`. Otherwise `removeMachineAt(...)`. |
| `<button id="clear-all">` | `click` | `clearAll()`. |
| `<button id="clear-connections">` | `click` | `clearConnections()`. |
| `<button id="mode-place">` | `click` | `setMode('place')`. |
| `<button id="mode-connect">` | `click` | `setMode('connect')`. |
| `window` | `keydown` (R) | `rotate()`. |
| `window` | `keydown` (Esc) | Cancel any in-progress connection draft. |

`eventToTile` converts `(clientX, clientY)` to tile coordinates using
`canvas.getBoundingClientRect()` and `renderer.tilePx`. Out-of-bounds
results return `null` and the handlers become no-ops.

## Placement Flow

1. User clicks at tile `(x, y)` with the selected type.
2. `grid.canPlace(type, x, y)` is called.
3. On failure: status turns red with a message, `invalidFlash` is set,
   `redraw` flashes red, then a 350 ms `setTimeout` clears the flash.
4. On success: build a `MachineInstance` with a UUID, call
   `grid.placeMachine`, push onto `state.machines`, set a success
   status, redraw.

## Connection Flow

1. User clicks somewhere on the canvas. `pickPortAt(tile, machines)`
   (in `src/ports.ts`) walks every machine's edge bands and
   single-tile ports and picks the port cell whose adjacent tile is
   closest to the click (within a 3-tile radius). Band resources are
   resolved via `resourceForBand` in `src/bands.ts` (explicit
   `edgeBands[side].resource` when present, else the machine's
   recipe resources).
2. **First click**: `state.draftSource` is set to the picked port
   info, `state.draftAdjacent` records the adjacent tile, and the
   status prompts the user to pick an input port. The renderer
   highlights the source cell.
3. **Second click**: `completeDraft(grid, source, target)` (in
   `src/connections.ts`) validates the picks (resource kind + name
   must match, source ≠ target machine) and runs
   `findPathMulti(grid, source.adjacentTiles,
   target.adjacentTiles)`. The pathfinder is multi-source /
   multi-target: it considers **all** adjacent tiles on the source
   side and **all** on the target side, and picks the (start, end)
   pair that yields the most compact path. This means the user
   doesn't have to click the exact right port cell — the
   pathfinder picks the optimal one automatically.

   The chosen path is expanded tile-by-tile and the interior tiles
   (excluding the start/end adjacent tiles, which sit beside the
   machines) are marked in the grid via `grid.placeConnectionTiles`.
4. **Mismatch or no path**: the draft is cleared, a red status
   message is shown, and redraw.
5. **Empty click or Esc**: the draft is cleared silently.

## Removal Flow

Right-click on the canvas:

- If the tile is occupied by a connection, `removeConnectionAt`
  drops the entire connection (clears its tiles and removes it from
  `state.connections`).
- Otherwise, if the tile is occupied by a machine, `removeMachineAt`
  removes the machine. The editor also drops any connection whose
  source or destination machine id matches the removed machine, so
  no connection is left "floating" pointing to a gone machine.

`removeMachine` and `removeConnection` are both id-keyed (not
position-keyed), so if multiple things shared an id (they don't,
given the placement invariants) all would be cleared. Defensive
logic, harmless in practice.

## Rotation

`R` advances `state.orientation` through the cycle `0 → 90 → 180 →
270 → 0`. The label in the toolbar (`#orientation-label`) is updated
and the canvas redraws so the hover preview reflects the new
orientation.

Rotation only affects the *next* placement — already-placed machines
keep the orientation they had when placed. To rotate an existing
machine you'd remove and re-place; the data model supports
arbitrary orientation per instance, but the UI doesn't expose a
"rotate selected" affordance yet.

## Bounding-Box Area

`boundingBoxArea()` scans `state.machines` and returns the area (in
tiles²) of the smallest axis-aligned rectangle that contains every
footprint. It's shown in the side panel alongside the machine count
and connection count.

## Init Order

1. `populateSelector()` — fills the `<select>` from
   `ALL_MACHINE_TYPES`.
2. `updateOrientationLabel()` — sets the toolbar label to `0°`.
3. `updateModeUi()` — toggles `.active` on the mode buttons, sets
   the hint text.
4. `renderer.resize()` — sizes the canvas for the device pixel ratio.
5. `redraw()` — first scene draw (empty grid).
6. `setStatus('Ready. ...')` — initial status text.

## DOM Contract

The HTML in `index.html` is a contract that `main.ts` queries. The
element ids `#machine-select`, `#orientation-label`, `#status`,
`#metrics`, `#clear-all`, `#clear-connections`, `#mode-place`,
`#mode-connect`, `#hint`, and `#grid` must stay in sync with the
queries at the top of `main.ts`. If you rename one, rename both.

## Styling

`src/style.css` defines CSS variables for color, the toolbar layout,
the side panel, and a small font stack. Active mode buttons get
`.active` for the highlight. The renderer ignores CSS and draws
directly on the canvas — so the only styling that matters for the
grid is the canvas size, which the renderer sets imperatively.

Related: [renderer.md](../core/renderer.md) · [grid.md](../core/grid.md) · [pathfinding.md](../core/pathfinding.md) · [extending.md](../reference/extending.md)
