# Extending the Catalog

How to add a new machine type and ship it through tests, dropdown,
and editor.

## 1. Define the `MachineType`

Open `src/data.ts` and append a new constant. A 3×3 Assembler with
an item input on the entire south edge and an item output on the
entire north edge:

```ts
export const ASSEMBLER: MachineType = {
  name: 'Assembler',
  width: 3,
  height: 3,
  ports: [],
  edgeBands: {
    south: { type: 'input',  resourceKind: 'item' },
    north: { type: 'output', resourceKind: 'item' },
  },
};
```

If the machine needs a single-tile port instead of (or in addition
to) a band — for example a fluid input on the west center cell — add
a `PortDef`:

```ts
export const ASSEMBLER: MachineType = {
  name: 'Assembler',
  width: 3,
  height: 3,
  ports: [
    {
      id: 'water_in',
      type: 'input',
      side: 'west',
      tileIndex: 1,         // center cell of the west edge
      resource: 'Water',
      kind: 'fluid',
      rate: 10,
    },
  ],
  edgeBands: {
    south: { type: 'input',  resourceKind: 'item' },
    north: { type: 'output', resourceKind: 'item' },
  },
};
```

Conventions:

- `id` is unique within a `MachineType`. The editor doesn't depend on
  the format, but `snake_case` is used in the existing data.
- `rate` is **per minute for items**, **per second for fluids**.
- `tileIndex` is 0-based. For 3-wide: indices 0 / 1 / 2 are
  left / middle / right.
- `side` and `tileIndex` are for the **unrotated** machine; the
  editor rotates them automatically when the machine is placed.

## 2. Register It in `ALL_MACHINE_TYPES`

The dropdown reads this array, so appending the new constant here is
what makes the editor show it:

```ts
export const ALL_MACHINE_TYPES: MachineType[] = [MINER, FURNACE, ASSEMBLER];
```

`main.ts` does the rest — `populateSelector()` iterates the array and
labels each option as `${name}  (${width}×${height})`.

## 3. Sanity-Check the Rotation

Edge bands rotate automatically through `rotateSide`, so you don't
have to think about them per orientation. Single-tile ports go
through `transformPort`, which mirrors `tileIndex` on half-turn
rotations. For the 3×3 Assembler with a `west` port at `tileIndex: 1`:

| orientation | side | tileIndex | tile (rel. to (x, y)) |
|---|---|---|---|
| 0° | west | 1 | (x, y+1) |
| 90° | north | 1 | (x+1, y-1) |
| 180° | east | 1 (= 3-1-1, mirrored) | (x+3, y+1) |
| 270° | south | 1 (= 3-1-1, mirrored) | (x+1, y+3) |

If any of these surprise you, double-check the source `side` and
`tileIndex` first. The geometry math is in
[core/geometry.md](../core/geometry.md).

## 4. Run the Tests

```bash
npm test
```

The geometry tests cover rotation for the Miner and Furnace. If you
want explicit coverage for the new machine, add a block in
`test/geometry.test.ts` mirroring the existing
`describe('Furnace ports stay on their rotated edges', ...)` block.

## 5. Smoke-Test in the Browser

```bash
npm run dev
```

Open the URL, select the new machine, place a few at different
rotations, and confirm:

- The edge band is in the right place and rotated correctly.
- The single-tile port (if any) lines up.
- The footprint matches the `width × height` you declared.
- Right-click removes it cleanly.

## When You Need More Than a Footprint

Right now each machine is a single rigid rectangle. If a future
machine has an irregular footprint, you'll need to extend
`MachineType` (e.g. an `occupancy: { dx, dy }[]` of relative tile
offsets) and rework `Grid.canPlace` to iterate that. That's a real
data-model change — discuss before implementing.

Related: [data.md](../core/data.md) · [geometry.md](../core/geometry.md) · [testing.md](testing.md) · [types.md](../core/types.md)

