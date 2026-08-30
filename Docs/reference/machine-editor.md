# Machine Editor

The editor is a modal that lets the developer (you) define the
catalog of `MachineType` entries that the rest of the editor uses.

## Where the Catalog Lives

- **Hard-coded defaults**: `src/data/*.ts` + barrel `src/data/index.ts`
  (`src/data.ts` is a compatibility shim re-exporting the barrel).
- **At runtime**: `state.machineTypes` in `src/main.ts`, hydrated
  from `localStorage` on page load, validated via `machineValidate`.
  Corrupt or invalid localStorage is evicted and falls back to
  `ALL_MACHINE_TYPES`.
- **Persisted (session)**: `localStorage[endfield.machineTypes.v1]`.
  JSON blob. View / edit from DevTools → Application → Local Storage.
- **Persisted (durable)**: edit `src/data/*.ts` directly, or export a
  `machines.json` snapshot via **Export JSON** and re-import it later.

## When To Use It

- You need a new machine type that the hard-coded catalog doesn't
  cover (most production machines — Refining Unit, Packaging Unit,
  etc.).
- You need to add or change a machine's recipes.
- You need to tweak a machine's footprint or port layout.

## How To Open

Click **Define Machines** in the toolbar. The modal opens with a list
of machines on the left and an edit form on the right. **+ Add
Machine** creates a new entry. Click a row to edit it.

## Fields Per Machine

| Field | What it does |
|---|---|
| **Name** | Display name shown in the dropdown and on the canvas. Must be unique across the catalog. |
| **Width / Height** | Footprint in tiles. Used by the renderer and the grid's `canPlace`. |
| **Edge bands** | Per-side port zones. Each side can be `input` (item or fluid) or `output`, plus an optional `resource` name. The renderer paints every cell along that side. When `resource` is empty the band is "unconfigured" — `resourceForBand` falls back to the machine's recipe resources. |
| **Single-tile ports** | Specific cells with id, type, side, tileIndex, resource, kind, rate. Use for things like the Furnace's water input on the west center. |
| **Recipes** | Each recipe has N inputs and M outputs, each with a resource name, kind, and rate. Recipes drive the auto-detect: when a connection is created, the editor looks up a recipe on the destination whose input matches the source's resource+kind. If found, the connection's `matchedRecipeId` is set; otherwise it's passthrough. |

## Save / Reset / Import / Export

- **Save** validates, writes the catalog to localStorage and closes
  the modal. The dropdown refreshes. Existing connections re-check
  their destinations via `reconcileConnectionRecipes`.
- **Reset to Defaults** discards the localStorage copy and reloads
  `ALL_MACHINE_TYPES` from `src/data/index.ts`.
- **Import JSON** picks a `machines.json` file (an array of
  `MachineType`). The file is validated; on success it replaces the
  in-memory catalog. On failure the validation errors are shown in
  the footer.
- **Export JSON** downloads the current in-memory catalog as
  `machines.json` — edit `src/data/*.ts` and commit when ready to
  make it durable.
- **Cancel** discards in-progress edits without saving.

Number fields show inline errors (`Required`, `Must be a number`,
`Must be 1..16` / `Must be 0..9999`) instead of silently ignoring
bad input.

## Validation

The bottom of the modal lists validation errors in real time. Save
and Import are blocked while errors are present. Common issues:

- Two machines with the same name.
- Width or height outside 1..16.
- Edge band with invalid `type` / `resourceKind`.
- Port with missing `id` / `resource` / invalid `side`.
- A recipe slot with an empty resource name.
- A recipe with no inputs and no outputs.

`loadMachineTypes()` also validates on page load; a corrupt
localStorage entry is removed and the defaults are used.

## How Connection Auto-Detect Works

When a connection is created from a source's output port to a
target's input port:

1. The source's resource+kind is on the connection record (set when
   the source port was picked; for bands via `resourceForBand`).
2. The editor calls `matchRecipe(target.machine, source.resource, source.kind)`.
3. If a recipe on the target has an input matching the source's
   resource+kind, the connection is "valid" and the recipe's id is
   stored as `matchedRecipeId`.
4. If no recipe matches, the connection is "passthrough" — items
   flow but no transformation is implied. `matchedRecipeId` is null.

## Limitations

- One recipe is a flat list of inputs and outputs — no per-input
  rate validation, no multi-stage recipes, no time-based batching.
- The match is on the first matching input of the recipe. A future
  enhancement could require all inputs to be present.
