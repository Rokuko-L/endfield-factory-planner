# Recipe Info (`src/recipeInfo.ts`)

Resolves the displayed recipe for a selected machine given its current connections. Pure functions; no DOM.

## Responsibilities

- Given a `MachineInstance` and all `Connection`s, picks which `Recipe` to show in the info panel.
- Recipe selection uses `selectBestRecipe` ([recipes.ts](recipes.ts)): the recipe with the most fed input slots wins, so machines whose recipes share inputs (Amethyst Part) resolve correctly.
- For passthrough machines (no recipes), synthesizes a `passthrough` recipe from the actual inbound/outbound resources.
- Computes `supply`/`demand`/`efficiency` per minute (`ratePerMin` from [logistics.md](logistics.md) normalizes per-second fluid slots) and collects inbound/outbound connections for the panel.
- When a `FlowReport` ([flow.md](flow.md)) is passed, efficiency and fed amounts come from the graph-wide solve — they account for upstream shortages instead of raw connection sums. `editor/selection.ts` always solves and passes it.

## Key Exports

| Symbol | Signature | Purpose |
|---|---|---|
| `RecipeInfo` | `interface` | View model: recipe, source, supply, demand, efficiency, inputStatus, inbound, outbound, type, pickedResource. |
| `selectedRecipeFor` | `(MachineInstance, Connection[], FlowReport?) => RecipeInfo \| null` | Picks the recipe and aggregates connection/flow data. |

## Source Heuristic

- `source: 'sink'` when the machine has zero recipes (passthrough).
- `source: 'explicit'` when an inbound connection exists and a matching recipe was found.
- `source: 'inferred'` when no inbound exists and the first recipe is shown as a preview.

Related: [types.md](types.md) · [flow.md](flow.md) · [../ui/recipe-info-ui.md](../ui/recipe-info-ui.md) · [../ui/interactions.md](../ui/interactions.md)
