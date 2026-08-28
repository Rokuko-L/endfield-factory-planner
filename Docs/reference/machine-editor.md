# Machine Editor (dev-only)

The editor is a modal that lets the developer (you) define the
catalog of `MachineType` entries that the rest of the editor uses.
The catalog is persisted to `localStorage` under the key
`endfield.machineTypes.v1`. There's no server round-trip; clearing
browser storage reverts to the hard-coded defaults in
`src/data.ts`.

## When To Use It

- You need a new machine type that the hard-coded catalog doesn't
  cover (most production machines — Refining Unit, Packaging Unit,
  etc.).
- You need to add or change a machine's recipes.
- You need to tweak a machine's footprint or port layout.

The catalog is per-browser. If you open the editor on a different
machine or in a different browser profile, you'll see the defaults
until you re-enter your definitions.

## How To Open

Click **Define Machines** in the toolbar. The modal opens with a list
of machines on the left and an edit form on the right. **+ Add
Machine** creates a new entry. Click a row to edit it.

## Fields Per Machine

| Field | What it does |
|---|---|
| **Name** | Display name shown in the dropdown and on the canvas. Must be unique across the catalog. |
| **Width / Height** | Footprint in tiles. Used by the renderer and the grid's `canPlace`. |
| **Edge bands** | Per-side port zones. Each side can be `input` (item or fluid) or `output`. The renderer paints every cell along that side. |
| **Single-tile ports** | Specific cells with id, type, side, tileIndex, resource, kind, rate. Use for things like the Furnace's water input on the west center. |
| **Recipes** | Each recipe has N inputs and M outputs, each with a resource name, kind, and rate. Recipes drive the auto-detect: when a connection is created, the editor looks up a recipe on the destination whose input matches the source's resource+kind. If found, the connection's `matchedRecipeId` is set; otherwise it's passthrough. |

## Save / Reset

**Save** writes the catalog to localStorage and closes the modal.
The dropdown in the toolbar refreshes. Existing connections
re-check their destinations against the new recipes via
`reconcileConnectionRecipes` — connections that now match a recipe
get `matchedRecipeId` set.

**Reset to Defaults** discards the localStorage copy and reloads
the hard-coded catalog from `data.ts`. Use this if your local
catalog gets into a broken state.

**Cancel** discards in-progress edits without saving.

## Validation

The bottom of the modal lists validation errors in real time. Save
is blocked while errors are present. Common issues:

- Two machines with the same name.
- Width or height outside 1..16.
- A recipe slot with an empty resource name.
- A recipe with no inputs and no outputs.

## How Connection Auto-Detect Works

When a connection is created from a source's output port to a
target's input port:

1. The source's resource+kind is on the connection record (set when
   the source port was picked).
2. The editor calls `matchRecipe(target.machine, source.resource, source.kind)`.
3. If a recipe on the target has an input matching the source's
   resource+kind, the connection is "valid" and the recipe's id is
   stored as `matchedRecipeId`.
4. If no recipe matches, the connection is "passthrough" — items
   flow but no transformation is implied. `matchedRecipeId` is null.

The renderer can use `matchedRecipeId` to color the connection
differently (e.g. green for valid, orange for passthrough) — a
future enhancement.

## Where The Catalog Lives

- **Hard-coded defaults**: `src/data.ts`. The Miner and Furnace
  with one recipe each. Touched when adding the very first version
  of a machine.
- **At runtime**: `state.machineTypes` in `src/main.ts`, hydrated
  from localStorage on page load.
- **Persisted**: `localStorage[endfield.machineTypes.v1]`. JSON
  blob. View / edit from DevTools → Application → Local Storage.

## Limitations

- One recipe is a flat list of inputs and outputs — no per-input
  rate validation, no multi-stage recipes, no time-based batching.
  Those are future enhancements.
- The match is on the *first input* of the recipe only. A future
  enhancement could require all inputs to be present (i.e. "this
  recipe needs both Iron Ore AND Coal to produce Steel").
- The catalog is per-browser. There's no export/import yet (planned
  in a future enhancement).
