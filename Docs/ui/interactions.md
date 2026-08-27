# UI / Interactions (`src/main.ts`, `index.html`, `src/style.css`)

The editor's interaction layer. `main.ts` owns the editor state, wires
DOM events to the `Grid` and `Renderer`, and updates the status panel.
There is no framework — just typed DOM access and small event
handlers.

## State

```ts
const state = {
  machines: MachineInstance[];
  selectedIndex: number;       // index into ALL_MACHINE_TYPES
  orientation: 0 | 90 | 180 | 270;
  hover: { x, y } | null;      // tile under the cursor
  invalidFlash: { x, y, w, h } | null;  // set briefly on failed click
};
```

The `Grid` instance is the source of truth for occupancy. `state.machines`
is a denormalized copy that the renderer iterates over; the two stay
in sync because every state mutation calls `grid.placeMachine` /
`grid.removeMachine` immediately before mutating the array.

## Event Wiring

| Element | Event | Action |
|---|---|---|
| `<select id="machine-select">` | `change` | `state.selectedIndex = +select.value`; redraw. |
| `<canvas id="grid">` | `pointermove` | `state.hover = eventToTile(e)`; redraw. |
| `<canvas id="grid">` | `pointerleave` | `state.hover = null`; redraw. |
| `<canvas id="grid">` | `click` | `placeMachine(tile.x, tile.y)`. |
| `<canvas id="grid">` | `contextmenu` | `e.preventDefault()`; `removeMachineAt(...)`. |
| `<button id="clear-all">` | `click` | `clearAll()`. |
| `window` | `keydown` (R) | `rotate()`. |

`eventToTile` converts `(clientX, clientY)` to tile coordinates using
`canvas.getBoundingClientRect()` and `renderer.tilePx`. Out-of-bounds
results return `null` and the handlers become no-ops.

## Placement Flow

1. User clicks at tile `(x, y)` with the selected type.
2. `grid.canPlace(type, x, y)` is called.
3. On failure: status turns red with a message, `invalidFlash` is set,
   `redraw` flashes red, then a 350 ms `setTimeout` clears the flash.
4. On success: build a `MachineInstance` with a UUID (or
   `machine-<n>` fallback), call `grid.placeMachine`, push onto
   `state.machines`, set a success status, redraw.

## Removal Flow

Right-click looks up the machine id at the tile via
`grid.getOccupancyAt`. If one is found, `grid.removeMachine(id)`
clears the tiles and the id is filtered out of `state.machines`.

`removeMachine` is id-keyed (not position-keyed), so if multiple
machines somehow shared an id (they don't, given the placement
invariant) all would be cleared. Today this is an unreachable edge
case but it keeps the cleanup logic simple.

## Rotation

`R` advances `state.orientation` through the cycle `0 → 90 → 180 →
270 → 0`. The label in the toolbar (`#orientation-label`) is updated
and the canvas redraws so the hover preview reflects the new
orientation.

Rotation only affects the *next* placement — already-placed machines
keep the orientation they had when placed. To rotate an existing
machine you'd need to remove and re-place; the data model supports
arbitrary orientation per instance, but the UI doesn't expose a
"rotate selected" affordance yet.

## Bounding-Box Area

`boundingBoxArea()` scans `state.machines` and returns the area (in
tiles²) of the smallest axis-aligned rectangle that contains every
footprint. It's shown in the side panel alongside the machine count.
Useful as a rough "how big is my factory" metric.

## Init Order

1. `populateSelector()` — fills the `<select>` from
   `ALL_MACHINE_TYPES`.
2. `updateOrientationLabel()` — sets the toolbar label to `0°`.
3. `renderer.resize()` — sizes the canvas for the device pixel ratio.
4. `redraw()` — first scene draw (empty grid).
5. `setStatus('Ready. ...')` — initial status text.

## DOM Contract

The HTML in `index.html` is a contract that `main.ts` queries. The
element ids `#machine-select`, `#orientation-label`, `#status`,
`#metrics`, `#clear-all`, and `#grid` must stay in sync with the
queries at the top of `main.ts`. If you rename one, rename both.

## Styling

`src/style.css` defines CSS variables for color, the toolbar layout,
the side panel, and a small font stack. The renderer ignores CSS and
draws directly on the canvas — so the only styling that matters for
the grid is the canvas size, which the renderer sets imperatively.

Related: [renderer.md](../core/renderer.md) · [grid.md](../core/grid.md) · [extending.md](../reference/extending.md)
