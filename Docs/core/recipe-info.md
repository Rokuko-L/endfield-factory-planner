# Recipe Info (`src/recipeInfo.ts`)

Resolves the displayed recipe for a selected machine given its current connections. Pure functions; no DOM.

## Responsibilities

- Given a `MachineInstance` and all `Connection`s, picks which `Recipe` to show in the info panel.
- For passthrough machines (no recipes), synthesizes a `passthrough` recipe from the actual inbound/outbound resources.
- For machines with recipes, matches the first inbound connection's resource+kind to a recipe input; falls back to the first recipe.
- Computes `supply`/`demand`/`efficiency` and collects inbound/outbound connections for the panel.

## Key Exports

| Symbol | Signature | Purpose |
|---|---|---|
| `RecipeInfo` | `interface` | View model: recipe, source, supply, demand, efficiency, inbound, outbound, type, pickedResource. |
| `selectedRecipeFor` | `(MachineInstance, Connection[]) => RecipeInfo \| null` | Picks the recipe and aggregates connection data. Returns null only if machine is nullish (caller guards). |

## Source Heuristic

- `source: 'sink'` when the machine has zero recipes (passthrough).
- `source: 'explicit'` when an inbound connection exists and a matching recipe was found.
- `source: 'inferred'` when no inbound exists and the first recipe is shown as a preview.

Related: [types.md](types.md) · [../ui/recipe-info-ui.md](../ui/recipe-info-ui.md) · [../ui/interactions.md](../ui/interactions.md)
