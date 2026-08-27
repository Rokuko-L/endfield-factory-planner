# Extending the Catalog

How to add a new machine type and ship it through tests, dropdown,
and editor.

## 1. Define the `MachineType`

Open `src/data.ts` and append a new constant. Port positions are for
the **unrotated** (facing north) machine; the editor rotates them
automatically.

```ts
export const ASSEMBLER: MachineType = {
  name: 'Assembler',
  width: 3,
  height: 3,
  ports: [
    {
      id: 'plate_in',
      type: 'input',
      side: 'south',
      tileIndex: 1,        // middle column on the south edge
      resource: 'Iron Plate',
      kind: 'item',
      rate: 30,
    },
    {
      id: 'gear_out',
      type: 'output',
      side: 'north',
      tileIndex: 1,
      resource: 'Iron Gear',
      kind: 'item',
      rate: 15,
    },
  ],
};
```

Conventions:

- `id` is unique within a `MachineType`. The editor doesn't depend on
  the format, but `snake_case` is used in the existing data.
- `rate` is **per minute for items**, **per second for fluids**
  (declared on `PortDef.rate` in `src/types.ts`).
- `tileIndex` is 0-based. For 3-wide: indices 0 / 1 / 2 are
  left / middle / right.

## 2. Register It in `ALL_MACHINE_TYPES`

The dropdown reads this array, so appending the new constant here is
what makes the editor show it:

```ts
export const ALL_MACHINE_TYPES: MachineType[] = [MINER, FURNACE, ASSEMBLER];
```

`main.ts` does the rest — `populateSelector()` iterates the array and
labels each option as `${name}  (${width}×${height})`.

## 3. Sanity-Check the Rotation

For each new port, mentally walk through the orientations. For the
3×3 Assembler with `south` input at `tileIndex: 1`:

| orientation | side | tileIndex | tile (rel. to (x, y)) |
|---|---|---|---|
| 0° | south | 1 | (x+1, y+3) |
| 90° | west | 1 | (x-1, y+1) |
| 180° | north | 1 (= 3-1-1, mirrored) | (x+1, y-1) |
| 270° | east | 1 (= 3-1-1, mirrored) | (x+3, y+1) |

If any of these surprise you, double-check the source `side` and
`tileIndex` first. The geometry math is in
[core/geometry.md](../core/geometry.md).

## 4. Run the Tests

```bash
npm test
```

The geometry tests cover the Miner and Furnace at every orientation
already. If you want explicit coverage for the new machine, add a
block in `test/geometry.test.ts` mirroring the existing
`describe('Furnace ports stay on their rotated edges', ...)` block.

## 5. Smoke-Test in the Browser

```bash
npm run dev
```

Open the URL, select the new machine, place a few of them at
different rotations, and confirm:

- The port square appears in the right spot.
- The footprint matches the `width × height` you declared.
- Right-click removes it cleanly.

## When You Need More Than a Footprint

Right now each machine is a single rigid rectangle with ports. If a
future machine has an irregular footprint or multi-tile ports, you'll
need to extend `MachineType` (e.g. an `occupancy: { dx, dy }[]` of
relative tile offsets) and rework `Grid.canPlace` to iterate that.
That's a real data-model change — discuss before implementing.

Related: [data.md](../core/data.md) · [geometry.md](../core/geometry.md) · [testing.md](testing.md)
