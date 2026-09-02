# Depot Picker (`src/depotPicker.ts`)

Modal that lets a Depot Access machine be assigned a specific `{ resource, kind, rate }`. Promise-based; creates transient DOM.

## Responsibilities

- Filters `allResources(catalog)` by the depot machine's port kind (from `depotPortKind`).
- Presents a searchable list (up to 200), rate + kind fields, and Save/Clear/Cancel actions.
- Resolves to the picked `DepotAssignment` or `null`. Clear also resolves `null` (meaning "generic sink/source").

## Key Exports

| Symbol | Signature | Purpose |
|---|---|---|
| `openDepotPicker` | `(MachineInstance, MachineType[], DepotAssignment \| null) => Promise<DepotAssignment \| null>` | Opens the modal and resolves on save/clear/cancel. |

## Wiring

`main.ts:handleDepotClick` guards with `isDepotMachine`, loads the current assignment from `state.depotAssignments[machine.id]`, awaits the picker, then persists via `saveDepotAssignments` and redraws. Clicking a Depot machine in place mode triggers this flow.

Related: [../core/depot.md](../core/depot.md) · [interactions.md](interactions.md) · [../core/types.md](../core/types.md)
