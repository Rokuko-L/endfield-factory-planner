# Depot Assignments (`src/depot.ts`)

Depot source/sink detection, resource enumeration, and per-machine assignment persistence for Depot Access machines. Pure functions plus localStorage I/O; no DOM.

## Responsibilities

- Identifies depot sources (`Depot Unloader`, `Conduit Outlet`, etc.) and sinks (`Depot Loader`, `Conduit Inlet`, etc.) by display name.
- Resolves the resource kind for a depot machine's port/band.
- Enumerates all distinct `{ resource, kind }` pairs across the catalog (ports, edge bands, recipes).
- Persists `DepotAssignment` records (`endfield.depotAssignments.v1`) and aggregates sink usage / stalled-connection counts for the metrics panel.

## Key Exports

| Symbol | Signature | Purpose |
|---|---|---|
| `isDepotSource` | `(MachineType \| MachineInstance) => boolean` | True if machine name is in the source set. |
| `isDepotSink` | `(MachineType \| MachineInstance) => boolean` | True if machine name is in the sink set. |
| `isDepotMachine` | `(MachineType \| MachineInstance) => boolean` | True if `category === 'Depot Access'`. |
| `depotPortKind` | `(MachineInstance) => ResourceKind \| null` | Kind of the machine's first port/band. |
| `allResources` | `(MachineType[]) => { resource, kind }[]` | Deduped, sorted resource list from the catalog. |
| `loadDepotAssignments` | `() => Record<string, DepotAssignment>` | Reads from localStorage. |
| `saveDepotAssignments` | `(Record<string, DepotAssignment>) => void` | Writes to localStorage. |
| `sinkTotals` | `(Connection[], MachineInstance[]) => Map` | Per-sink inbound counts grouped by resource. |
| `stalledCount` | `(Connection[], MachineInstance[]) => number` | Connections with no recipe that target a non-depot machine. |

## Storage

Key `endfield.depotAssignments.v1` holds `Record<machineId, { resource, kind, rate }>`. Invalid JSON is ignored and treated as `{}`. `main.ts` owns the in-memory copy on `EditorState.depotAssignments` and calls `saveDepotAssignments` after every picker commit or removal.

Related: [types.md](types.md) · [data.md](data.md) · [../ui/depot-picker.md](../ui/depot-picker.md) · [../ui/interactions.md](../ui/interactions.md)
