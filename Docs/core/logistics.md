# Logistics System (`src/logistics.ts`)

Handles belt/pipe throughput rules: splitters and convergers.

## One Connection Per Tile

A grid tile carries **at most one** connection — belts and pipes never
overlap or stack. `Grid.placeConnectionTiles` throws if the tile already
holds a different connection id, and the router treats other connections
as obstacles, so new belts route around existing ones (or fail with
"No path found"). Machines block connections as always; to cross another
line, route around it or interpose a logistics machine (e.g. a Belt
Bridge as a normal pass-through machine).

## Throughput

- **Belts** (item): 30 items/min
- **Pipes** (fluid): 2 items/sec

Each connection stores its throughput. Recipe efficiency consumes these
rates (see [recipe-info.md](recipe-info.md)) — a 60/min input demand
needs two belts feeding it.

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
| `isSplitter(machine)` | Check if machine is a splitter. |
| `isConverger(machine)` | Check if machine is a converger. |
| `getSplitterThroughput(conn, machine, all)` | Calculate output throughput after splitter. |
| `getConvergerThroughput(machine, all)` | Calculate capped output throughput. |
| `maxThroughput(kind)` | Max throughput for item/fluid. |

Related: [types.md](types.md) · [grid.md](grid.md) · [renderer.md](renderer.md)
