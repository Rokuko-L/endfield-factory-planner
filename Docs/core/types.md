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
| `PortDef` | A single port: id, type, side, tileIndex, resource, kind, rate. |
| `MachineType` | A footprint definition: name, width, height, ports. |
| `MachineInstance` | A placed machine: id, type, x, y, orientation. |
| `Connection` | Reserved for a later phase. (id, from/to machine/port, kind.) |
| `Layout` | The full editor state: `{ machines, connections }`. |

## `PortDef` — the canonical port shape

```ts
interface PortDef {
  id: string;        // e.g. "iron_ore_input"
  type: 'input' | 'output';
  side: Side;        // unrotated side
  tileIndex: number; // left→right for north/south, top→bottom for east/west
  resource: string;  // e.g. "Iron Ore"
  kind: 'item' | 'fluid';
  rate: number;      // per minute for items, per second for fluids
}
```

A `PortDef` is **always** relative to the unrotated machine. The `side`
and `tileIndex` are the same on a data record regardless of how the
machine is later rotated on the grid. This is what lets the same
`MachineType` definition be used at any orientation.

`tileIndex` runs along the side: for `north`/`south` it counts
**left → right**; for `east`/`west` it counts **top → bottom**. The
`geometry` module mirrors this index when the side flips through a
half-turn rotation — see [geometry.md](geometry.md).

## `MachineType` vs `MachineInstance`

- `MachineType` is the **blueprint**: a footprint size and a set of
  ports. It has no position. Many `MachineInstance`s can share the same
  `MachineType`.
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

Related: [data.md](data.md) · [grid.md](grid.md) · [geometry.md](geometry.md)
