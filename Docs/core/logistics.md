# Logistics System (`src/logistics.ts`)

Handles belt/pipe interactions: bridges, splitters, and convergers.

## Connection Stacking

Belts and pipes can occupy the same tile (stack). The grid tracks multiple
connections per cell (`string[][][]`). Machines block stacking — connections
cannot overlap with any machine.

## Throughput

- **Belts** (item): 30 items/min
- **Pipes** (fluid): 2 items/sec

Each connection stores its throughput. Pipes render smaller (60% of tile)
so belts show through when they overlap.

## Bridges

When two connections cross at a tile with perpendicular directions, they
form a bridge. Both connections retain their original direction and
throughput — bridges don't slow anything down.

Bridge points are visualized as small white circles where connections cross.

## Splitters

Splitters (item/pipe) distribute input round-robin to available outputs:

- 30/min input with 3 outputs → 10/min each
- If middle output has no belt → 15/min per side (skips empty outputs)

The splitter dynamically detects which outputs have connections.

## Convergers

Convergers (item/pipe) merge multiple inputs to one output, capped at max
throughput:

- 3 inputs × 30/min → output capped at 30/min
- Round-robin gives each input a turn at the output

## Functions

| Function | Purpose |
|---|---|
| `directionAtTile(conn, tile)` | Get flow direction at a tile. |
| `isBridgeAt(c1, c2, tile)` | Check if two connections cross at a tile. |
| `getBridgePoints(conn, all)` | Get all bridge points for a connection. |
| `isSplitter(machine)` | Check if machine is a splitter. |
| `isConverger(machine)` | Check if machine is a converger. |
| `getSplitterThroughput(conn, machine, all)` | Calculate output throughput after splitter. |
| `getConvergerThroughput(machine, all)` | Calculate capped output throughput. |
| `maxThroughput(kind)` | Max throughput for item/fluid. |

Related: [types.md](types.md) · [grid.md](grid.md) · [renderer.md](renderer.md)
