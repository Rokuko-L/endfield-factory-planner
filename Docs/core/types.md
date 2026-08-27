# Domain Types (`src/types.ts`)

The single source of truth for the data model. Every other module imports
from here. All coordinates are **grid tiles** with top-left origin
(0,0) and y increasing downward.

## Type Map

| Symbol | Purpose |
|---|---|
| `Orientation` | `0 \| 90 \| 180 \| 270` — clockwise rotation from facing north. |
| `Side` | `'north' \| 'east' \| 'south' \| 'west'` — which edge a port sits on (unrotated). |
| `PortType` | `'input' \| 'output'` — feeds a machine or is fed by it. |
| `ResourceKind` | `'item' \| 'fluid'` — categorical type of resource. |
| `PortDef` | A single-tile port: id, type, side, tileIndex, resource, kind, rate. |
| `EdgeBand` | A full-edge port zone: type + resourceKind for one side. |
| `MachineType` | A footprint definition: name, width, height, ports, edgeBands. |
| `MachineInstance` | A placed machine: id, type, x, y, orientation. |
| `Connection` | Reserved for a later phase. (id, from/to machine/port, kind.) |
| `Layout` | The full editor state: `{ machines, connections }`. |

## Two Ways a Port Can Live on a Machine

Endfield machines have two kinds of port zones, and the type model
covers both:

1. **Edge bands** — a whole edge of the machine is "the input side"
   (or output). Used for item inputs/outputs where any of the edge
   cells can connect to a neighboring machine's port. This is the
   common case.
2. **Single-tile ports** — one specific tile on an edge is the port.
   Used for fluid inputs that occupy a single connection point (e.g.
   the Furnace's water input on the west center cell).

Both are defined on the unrotated `MachineType` and rendered through
the rotated `MachineInstance`.

## `PortDef` — single-tile port shape

```ts
interface PortDef {
  id: string;
  type: 'input' | 'output';
  side: Side;        // unrotated side
  tileIndex: number; // left→right for north/south, top→bottom for east/west
  resource: string;
  kind: 'item' | 'fluid';
  rate: number;      // per minute for items, per second for fluids
}
```

The renderer paints the **inside cell** of the footprint at the
port's position (i.e. the cell whose outer edge faces the port's
side), with a stroke on the outer edge and a subtle fill in the
port's color.

`tileIndex` is mirrored on half-turn rotations by `transformPort` —
see [geometry.md](geometry.md).

## `EdgeBand` — full-edge port zone

```ts
interface EdgeBand {
  type: 'input' | 'output';
  resourceKind: 'item' | 'fluid';
}
```

The renderer paints **every cell** along the declared side with a
subtle fill, plus a 3-px colored stroke on the outer edge of each
cell. The side is rotated through `rotateSide` so the band follows
the machine's orientation. Multiple bands on different sides of the
same machine are allowed and stack cleanly.

```ts
const FURNACE: MachineType = {
  name: 'Furnace', width: 5, height: 5,
  ports: [/* single-tile fluid port here */],
  edgeBands: {
    south: { type: 'input',  resourceKind: 'item' },
    north: { type: 'output', resourceKind: 'item' },
  },
};
```

`edgeBands` is optional. Machines without it (and without `ports`)
render as plain footprints with no port indicators.

## `MachineType` vs `MachineInstance`

- `MachineType` is the **blueprint**: a footprint size, a list of
  single-tile ports, and a map of edge bands. It has no position.
  Many `MachineInstance`s can share the same `MachineType`.
- `MachineInstance` is a **placed copy**: a unique id, a reference to
  its `MachineType`, the top-left tile coordinates `(x, y)`, and the
  current `orientation`.

This split keeps the data model simple. Adding a new machine type is
purely a data change in `src/data.ts` — see
[reference/extending.md](../reference/extending.md).

## Reserved Types

- `Connection` is declared but not yet used by the editor. It exists
  so the data model is forward-compatible with a later routing phase.
- `Layout` wraps `machines` and `connections`. Today the editor only
  reads and mutates `machines` directly inside `main.ts`; when
  connections are introduced, lift that state into a single `Layout`
  object.

Related: [data.md](data.md) · [grid.md](grid.md) · [geometry.md](geometry.md) · [renderer.md](renderer.md)

