# Logistics System (`src/logistics.ts`)

Transport constants and crossing rules. The heavy lifting (efficiency
propagation, split/merge) lives in the flow engine — see
[flow.md](flow.md).

## Rates (single source of truth)

- `ITEM_BELT_RATE` — belts carry **30/min**
- `PIPE_RATE` — pipes carry **120/min** (2/s), liquids and gases alike
- `maxThroughput(kind)` — capacity lookup
- `ratePerMin(slot)` — normalizes catalog rate slots (per-minute items,
  per-second fluids) to per-minute

Source: [endfield.wiki.gg/wiki/Flow_Rate](https://endfield.wiki.gg/wiki/Flow_Rate).

## Crossing (bridging)

A grid tile carries at most **two** connections, and only as a
**perpendicular** over/under pass:

- The router (`findPathMultiCrossing`) treats connection tiles as
  passable at a premium cost, so it only crosses when routing around is
  worse — auto-bridging as a last resort.
- `completeDraft` then validates every shared tile with `isCrossingAt`:
  direction vectors must be orthogonal. Same-direction (colinear)
  overlap is rejected with
  *"Connections cannot overlap — they may only cross other lines
  perpendicular (bridge)."*
- `isCrossingAt` / `pathDirectionAt` derive flow direction from each
  path's shape, so opposite-direction belts on one axis never count as
  crossings.

Crossings don't merge flows: each `Connection` remains its own edge in
the flow engine.

Related: [flow.md](flow.md) · [grid.md](grid.md) · [renderer.md](renderer.md)
