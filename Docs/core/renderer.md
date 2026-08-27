# Renderer (`src/renderer.ts`)

A pure-function canvas drawer. The `Renderer` instance holds a
reference to the canvas and the `Grid` (so it knows how big to draw),
and a tile-pixel size (default 28 px). It does **not** hold editor
state — every call to `draw` redraws the entire scene from the
machine list and the optional preview/flash rects.

## Construction

```ts
new Renderer(canvas, grid, tilePx = 28);
```

`tilePx` is exposed as a public getter (`renderer.tilePx`) so `main.ts`
can convert pointer events to tile coordinates using the same value
the renderer draws at.

## `resize()`

Sets the canvas backing-store size to `(grid.width * tilePx,
grid.height * tilePx)` CSS pixels, multiplied by the device pixel
ratio. The `setTransform(dpr, 0, 0, dpr, 0, 0)` call lets the rest of
the drawing code use CSS pixels and still render crisp on HiDPI
displays. Call this once on init (and again on window resize, if you
add that later).

## `draw(machines, previewFootprint, invalidFlash)`

Redraws everything. `previewFootprint` is the cursor-following
footprint highlight (green-ish when placeable, red when not).
`invalidFlash` is the red flash on a failed click placement, set by
`main.ts` for ~350 ms after a collision.

The draw order is:

1. Clear.
2. Tile background + grid lines + preview + invalid flash.
3. Each machine in `machines`, in the order given. (Order is
   insertion order from `main.ts`, so newer machines draw on top of
   older ones.)

## Port Color Code

| Port | Color |
|---|---|
| `type: 'input'` | red (`#f87171`) |
| `type: 'output'` | green (`#4fd1a5`) |
| `kind: 'fluid'` (any type) | blue (`#6ea8ff`) |

`kind === 'fluid'` wins over the input/output color, so a fluid input
and a fluid output both render blue. The same `getPortTile` is used
to compute the port location, so the rotation math is shared with the
data layer.

The port square is inset by `0.25 * tilePx` from its tile so it sits
visually inside the tile and adjacent ports don't merge.

## What the Renderer Does Not Do

- No event handling. `main.ts` owns `pointermove`, `click`,
  `contextmenu`, etc.
- No state. Pass the full machine list every redraw.
- No machine-specific rendering. The footprint fill, name label, and
  ports are all drawn generically from `MachineType` + `MachineInstance`.
- No collision detection. It draws whatever `main.ts` gives it.

## Performance

Redrawing the whole 50×50 grid + up to ~100 machines is fine on the
canvas. If a future change adds thousands of ports or machines, switch
to per-machine redraws or a dirty-rect strategy — but don't pre-optimize.

Related: [geometry.md](geometry.md) · [interactions.md](../ui/interactions.md)
