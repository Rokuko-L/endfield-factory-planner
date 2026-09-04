# Agent Playground — `window.__ew`

A text-in/text-out API over the live editor, installed by
[src/agent/api.ts](../../src/agent/api.ts) on every page load. It lets an
AI agent (or a curious human in the devtools console) **play and test the
real editor** — every action drives the same code paths as mouse clicks
(`handleCanvasClick`, `placeMachine`, `handleConnectClick`), so exercising
this API is exercising the actual editor, not a mock.

It is designed so that **both vision-capable and text-only agents** can use it:

- **Vision-capable agents** screenshot the canvas (browser automation) and
  use `__ew` actions instead of fragile pixel clicking.
- **Text-only agents** evaluate JS and read the returned strings — in
  particular `__ew.dump()`, the ASCII rendering of everything on the board
  ([src/agent/dump.ts](../../src/agent/dump.ts), pure and unit-tested in
  [test/agentDump.test.ts](../../test/agentDump.test.ts)).

## Quick start

```js
__ew.help()                       // full cheat sheet, always available
__ew.types()                      // catalog: index, name, size, category, recipe count
__ew.place('Furnace', 10, 5)      // place by name (optional 4th arg: 0|90|180|270)
__ew.ports(10, 6)                 // exact port cells of the machine at a tile
__ew.connect(9, 7, 14, 7)         // two-click connection between port tiles
__ew.dump()                       // ASCII map + machines/ports + connections + status log
__ew.snapshot()                   // the same as JSON, for programmatic checks
```

Coordinates are grid tiles, top-left origin, y increasing downward — the
same coordinate system as the domain model.

## Actions

| Action | Effect |
|---|---|
| `dump()` | Full text view: mode, ASCII map, machine list with port summary, connection list, depot assignments, status history |
| `map()` | Just the ASCII map (`A`–`Z` = machines in placement order, `=` item belt, `~` fluid pipe, `%` stacked connections, `.` empty) |
| `snapshot()` | JSON-safe snapshot: machines, connections, every port cell with its adjacent tile, depot assignments |
| `types(filter?)` | Catalog listing with indices |
| `select(name)` | Select a catalog entry (affects click-to-place) |
| `place(name, x, y, orientation?)` | Select + orient + place in one call |
| `click(x, y)` | Left-click at a tile in the current mode — the real handler |
| `connect(x1, y1, x2, y2)` | Two-click connection; each click picks the nearest port cell within 3 tiles (use `ports()` for exact cells) |
| `remove(x, y)` | Right-click equivalent: removes the connection or machine at a tile |
| `mode(m?)` | Get/set `'place' \| 'connect'` |
| `rotate()` | Cycle orientation |
| `assignDepot(x, y, resource, kind?, rate?)` | Set a depot's resource without opening the picker modal |
| `demo()` | Load the LC Valley demo |
| `clearAll()` / `clearConnections()` | Wipe the board / just the connections |
| `status()` / `history(n?)` | Last status line / recent status log (errors prefixed `!`) |
| `ports(x?, y?)` | Every port cell (`portId`, side, `[input]`/`[output]`, kind, resource, adjacent tile) of one machine or all machines |
| `power()` | Machines that are unpowered (outside every pylon AoE); `dump()` also tags them `[UNPOWERED]` |
| `flow()` | Static flow solve: per-connection flow vs capacity (`[CLOGGED]`), per-machine efficiency, warnings (starved/stalled/cycle) — per-minute rates |

Every action returns a human-readable string — the resulting status line,
a small report, or `ERROR: ...` on failure — so a text-only agent never
needs to inspect thrown exceptions.

## Reading the dump

The map clips to the bounding box of placed content plus 2 tiles, with a
coordinate ruler on top. The machine list assigns each machine its legend
letter; the connection list references machines by letter (`Aband:south:0
→ Bport:out`), shows the carried resource, path length in tiles, and the
matched recipe id (or `passthrough`). The status history is the same log
the human sees in the status bar, so agent-visible errors match user-visible ones.

## Headless (no browser at all)

The pure logic under the editor is directly testable offline in vitest —
that is the "sandbox" route when no browser is warranted:

- [test/grid.test.ts](../../test/grid.test.ts),
  [test/pathfinding.test.ts](../../test/pathfinding.test.ts),
  [test/recipes.test.ts](../../test/recipes.test.ts) cover placement, A*,
  and recipe matching on an in-memory `Grid`.
- [src/agent/dump.ts](../../src/agent/dump.ts) itself is pure (no DOM), so
  [test/agentDump.test.ts](../../test/agentDump.test.ts) can assert on the
  exact text an agent would see.

## Extending the editor

When adding a feature, keep the playground honest:

1. New **state** visible on the canvas → extend
   [dump.ts](../../src/agent/dump.ts) (`dumpLayoutText` and/or
   `snapshotJson`) so text agents can see it.
2. New **interaction** → expose it as an action in
   [api.ts](../../src/agent/api.ts) that calls the same editor function the
   mouse handler calls. Do not reimplement logic inside the API.
3. Status messages are already captured by
   [editor/status.ts](../../src/editor/status.ts) — prefer reporting
   through `setStatus` so both human and agent see the same feedback.
