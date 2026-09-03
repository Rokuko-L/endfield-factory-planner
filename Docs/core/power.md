# Power System (`src/power.ts`)

Power infrastructure (pylons and relays) project an area of effect (AoE)
that powers nearby machines. The AoE extends `powerRange` tiles outward
from the machine's footprint edge.

## Type Extension

`MachineType` gains an optional `powerRange` field (`src/types.ts`):

```ts
powerRange?: number; // tiles from footprint edge
```

- **Pylons** (Electric Pylon, Xiranite Pylon): 2x2 footprint, range 5
- **Relays** (Relay Tower, Xiranite Relay): 3x3 footprint, range 2
- Machines without `powerRange` neither provide nor require power.
- Machines with `noPower: true` (Logistics Units, Depot Access) always
  show as powered and don't need to be in a power AoE.

## Functions

| Function | Purpose |
|---|---|
| `powerAoe(m)` | Compute the AoE bounding box for a power machine, or null. |
| `machineInAoe(target, aoe)` | Check if a target machine's footprint overlaps an AoE. |
| `isPowered(target, allMachines)` | True if any power source's AoE covers the target. |
| `powerSources(machines)` | Filter the list to machines that provide power. |

## How Power AoE Works

```
+-------------------------+
|       AoE (range 5)     |
|   +----------------+    |
|   |  Pylon (2x2)   |    |
|   +----------------+    |
|                         |
+-------------------------+
```

The AoE is a rectangle extending `powerRange` tiles in every direction
from the footprint. Any machine whose footprint overlaps this rectangle
(excluding the source itself) is considered powered.

## Interaction

- Click a power machine in the editor to toggle its AoE preview (yellow
  dashed rectangle).
- Click again or click empty space to hide the preview.
- Each machine shows a status dot: green = powered, red = unpowered.

Related: [types.md](types.md) · [renderer.md](renderer.md) · [interactions.md](../ui/interactions.md)
