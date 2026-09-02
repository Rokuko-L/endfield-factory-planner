# Recipe Info Panel (`src/recipeInfoUi.ts`)

Renders the selected-machine recipe panel inside `#recipe-info`. DOM helper; no layout logic beyond building elements.

## Responsibilities

- Given `MachineInstance | null`, the connection list, and the optional `DepotAssignment`, renders the recipe header, spawn assignment (when present), rate chips + arrow, efficiency, and the input/output table.
- Empty states: "Click a machine…" when nothing is selected; "…has no recipes." when `selectedRecipeFor` returns null.
- Emits `recipe-info-close` on the close button so `main.ts` can clear selection.

## Key Exports

| Symbol | Signature | Purpose |
|---|---|---|
| `renderRecipeInfoPanel` | `(host: HTMLElement, machine: MachineInstance \| null, connections: Connection[], assignment?) => void` | Clears `host` and rebuilds the panel. |

## Wiring

`main.ts` calls `renderRecipeInfoPanel` from `refreshRecipeInfo()` on every `redraw()`, passing the currently selected machine (by `selectedMachineId`) and `state.depotAssignments[machine.id]`.

Related: [../core/recipe-info.md](../core/recipe-info.md) · [interactions.md](interactions.md) · [../core/types.md](../core/types.md)
