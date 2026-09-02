---
name: endmins-style
description: Applies the endminsworkshop (Endfield Factory Planner) coding style — plain functions over classes, flat modules, one responsibility per file, no premature abstraction, strict TypeScript, and pure-function rendering. Use this whenever you write or review TypeScript code in this project, and especially when touching main.ts or machineEditor.ts.
---

# Endfield Factory Planner Coding Style

This skill encodes how `endminsworkshop` should write TypeScript. Most of the codebase does this well (`geometry.ts`, `pathfinding.ts`, `recipes.ts`, `bands.ts`) — small, single-purpose function modules. The main way this codebase has drifted from its own style historically is files quietly growing into monoliths as features get bolted on (composition-root files like `main.ts` and large UI-modal files are the highest-risk spots for this — check whichever files currently fill that role, not a fixed list). Follow these principles when writing new code, reviewing changes, or refactoring.

> **Note on classes:** this project correctly uses almost no classes, and that's not a problem to fix. Composition-over-inheritance in a functional TS codebase means *plain functions over classes*, not "add more classes." `Grid` is the one legitimate exception (real mutable state + invariants). Don't introduce classes just to add structure — see Rule 0 below for what real structure looks like here instead.

---

## Core Principles

### 0. One Responsibility per Module — Check Before You Add to a File, Don't Assume

- Every file in `src/` should answer "what is this file's one job?" in a sentence. `bands.ts` → edge-band lookup. `pathfinding.ts` → A*. That's the standard to hold new and existing code to.
- **Before adding code to an existing file (especially `main.ts`, the composition root, and any large modal/editor UI file), check its current size and responsibility first** — run `wc -l` on it and skim what it currently does. Don't assume from memory or from a past conversation that a file is (or isn't) already a monolith; verify fresh, since the codebase changes over time and a file that was fine last week may not be now, or one that was flagged before may have already been split.
- **Rule of thumb:** if a file is already over roughly 200–250 lines, or adding your change would push it there, or you can't state its single responsibility in one sentence, that's the signal to split rather than append — pull the new concern into its own module (e.g. under `src/ui/` for a new panel) and have the composition root import and call into it, the same way `bands.ts`, `ports.ts`, `depotPicker.ts`, and `recipeInfoUi.ts` are already split out instead of living inside a bigger file.
- The composition root (currently `main.ts`) should stay a thin wiring layer — own top-level state, wire top-level events, delegate feature logic elsewhere — the same role the "Game layer" plays in Demeter. If you find it's grown past that, propose splitting it rather than adding to it further.
- Don't go looking for a monolith to fix if none exists — this rule is about how to evaluate a file *when you're about to touch it*, not a standing claim that specific files are currently broken.

### 1. Functions over Classes

- **Default to plain exported functions operating on plain data**, not classes with methods. Most of `src/` (`geometry.ts`, `pathfinding.ts`, `recipes.ts`, `bands.ts`, `ports.ts`, `connections.ts`, `renderer.ts`) is functions, not objects.
- Only reach for a class when there's real encapsulated mutable state with invariants to protect across many calls — e.g. `Grid` (tile occupancy + collision rules). That's the exception, not the pattern.
- No inheritance, no abstract base classes. Nothing in this codebase subclasses anything. If two things share behavior, share a function or a type, not a base class.

**Good** — function on plain data:
```ts
export function resourceForBand(band: EdgeBand): ResourceKind {
  // pure lookup, no state
}
```

**Good** — class only because state + invariants genuinely require it:
```ts
export class Grid {
  private cells: (string | null)[][];
  canPlace(machine: MachineInstance): boolean { /* ... */ }
  placeMachine(machine: MachineInstance): void { /* throws on collision */ }
}
```

**Bad** — wrapping a stateless operation in a class "for organization":
```ts
// Don't. This is just a function.
class GeometryHelper {
  static getAdjacentTile(...) { /* ... */ }
}
```

### 2. Flat Readability — No Useless Indirection

- A function called from exactly one place that does something simple should probably be **inlined**.
- Don't extract a 2-line helper "for clarity" when the call site reads fine as-is.
- Exception: extracting removes real duplication, or names a nontrivial block inside a longer function (e.g. splitting `completeDraft` into a path-search step and a tile-fill step because each is independently meaningful).

**Good** — inline when simple:
```ts
export function canPlace(grid: Grid, machine: MachineInstance): boolean {
  return machine.footprint.every(([x, y]) => grid.isFree(x, y));
}
```

**Bad** — one-use wrapper:
```ts
// Called once, adds nothing:
function checkIfCanPlace(grid: Grid, machine: MachineInstance): boolean {
  return canPlace(grid, machine);
}
```

### 3. No Premature Abstraction

- Write the function, type, or module the code **needs right now** — not a generic version for a hypothetical future machine type, resource kind, or renderer backend.
- Don't introduce a generic `<T>` parameter, plugin interface, or strategy pattern unless more than one concrete variant already exists in the codebase (e.g. don't build a "pathfinding algorithm interface" for A* when there's only A*).
- One-off catalog data goes directly in `src/data/*.ts`. Don't build a DSL or code-generator for it unless the catalog genuinely needs one.

### 4. Prefer Simple Data Structures

- Domain model is a small set of **plain interfaces/types** in `types.ts` (`MachineInstance`, `MachineType`, `PortDef`, `EdgeBand`, `Connection`, `Layout`) — no classes, no getters/setters, no private fields.
- Prefer union types and discriminated unions (`"input" | "output"`, edge band kinds) over enums-with-behavior or class hierarchies for variants.
- Editor/UI state (`EditorState`, `PickedPort`, `PortCell` in `layout.ts`) is also plain data, mutated in one place (`main.ts`), not spread across objects with their own mutation methods.

### 5. Avoid Ceremony

- No dependency injection framework, no service locator, no factory classes. Modules import what they need directly.
- No `class` used purely as a namespace for static methods — use a module with exported functions instead.
- Small stateless helper modules (`bands.ts`, `ids.ts`) are fine and expected; keep each cohesive and named for what it does.

---

## Concrete Conventions

| Convention | Rule |
|---|---|
| **Strictness** | `strict` mode, `noUncheckedIndexedAccess`, `noImplicitOverride` — never weaken these, never sprinkle `any` or `!` to silence errors; fix the type. |
| **Module shape** | One concern per file (`geometry.ts` = rotation math, `pathfinding.ts` = A*, `bands.ts` = edge-band lookup). Don't merge unrelated concerns into one file. |
| **Exports** | Named exports for functions/types. No default exports. |
| **Types vs classes** | `interface`/`type` for data. `class` only for stateful, invariant-protecting objects (see `Grid`). |
| **Coordinates** | Grid tiles, top-left origin, y increasing downward. Never assume screen-pixel space inside domain logic — that's the renderer's job. |
| **Orientation** | Data in `src/data/*` is defined unrotated. Rotation is applied at render time and at port lookup, never baked into stored data. |
| **Purity** | `Renderer` (and similarly-shaped modules) are pure functions of their inputs — no internal state, no mutation of arguments. State lives in `main.ts` or `Grid`, not scattered across helpers. |
| **Errors vs prevention** | Prefer preventing invalid states (e.g. checking `canPlace` before calling) over throwing and catching. A throw (like `placeMachine` on collision) is a last-resort invariant check, not a control-flow mechanism. |
| **Async** | Prefer plain sync code; this is a client-only, offline-capable tool. Don't introduce Promises/async where the existing code is sync unless the operation is genuinely asynchronous (e.g. file import). |
| **Comments** | Only for non-obvious logic (e.g. why A* uses a particular heuristic). Never comment what the code already says. |

---

## Architecture — How Pieces Fit Together

```
types.ts        — domain model (source of truth for shapes)
data/           — the machine catalog (plain data, one file per category + barrel)
grid.ts         — tile occupancy + placement invariants (the one stateful class)
geometry.ts     — rotation math, pure functions
pathfinding.ts  — A* on free cells, pure functions
recipes.ts      — connection auto-detection, pure functions
bands.ts        — edge-band → resource lookup, pure functions
ports.ts        — port cell enumeration, pure functions
connections.ts  — draft → validated Connection, pure functions
layout.ts       — editor state *types* only, no logic
renderer.ts     — canvas drawing, pure function of (ctx, state) → pixels
main.ts         — the only place that owns mutable editor state and wires events
```

**Rules:**

1. **`types.ts`** is the single source of truth for domain shapes. New concepts get a type here before they get used anywhere else.
2. **`data/`** holds only data (machine definitions), never logic. If a catalog entry needs computed behavior, that logic belongs in a sibling module (e.g. `recipes.ts`), not inlined into the data file.
3. **Logic modules** (`grid.ts`, `geometry.ts`, `pathfinding.ts`, `recipes.ts`, `bands.ts`, `ports.ts`, `connections.ts`) are self-contained: given inputs, they compute outputs. They don't reach into `main.ts` state or the DOM.
4. **`renderer.ts`** only reads state and draws; it never mutates the grid, the machine list, or the editor state.
5. **`main.ts`** is the composition root: it owns `EditorState` and the `Grid` instance, wires DOM events, calls into logic modules, and calls `Renderer.draw` after every change. New interactive features get wired here, not by adding hidden state to a logic module.

**When adding a feature:**
1. Add/extend the type in `types.ts` if it introduces a new domain concept.
2. Write the logic as **plain functions** in the module that owns that concern (or a new single-purpose module if none fits).
3. If it's catalog data (a new machine, port, or recipe), add it to `src/data/*.ts`.
4. Wire it into `main.ts` (event handling) and, if it needs to be drawn, into `renderer.ts`.
5. Keep logic modules **agnostic of the DOM and of `main.ts`** — they should be callable and testable without a browser event ever firing.

When writing TypeScript that isn't directly in this project but should follow this style, apply the same principles: functions over classes unless state genuinely requires a class, flat and readable, no abstraction ahead of actual need.

---

## What to Avoid

- ❌ **Adding another top-level function to the composition root (`main.ts`) or a large modal/editor file for a new feature** without first checking its current size/responsibility — this is how files silently become monoliths over many small changes.
- ❌ Wrapping stateless logic in a class "for organization" — use a module of functions.
- ❌ Class hierarchies or inheritance of any kind.
- ❌ One-line functions that simply forward to another function.
- ❌ Generic type parameters or plugin/strategy interfaces with only one concrete case in the codebase.
- ❌ `any`, non-null assertions (`!`), or `@ts-ignore` to work around strict mode instead of fixing the type.
- ❌ Baking rotation/orientation into stored data instead of computing it at lookup/render time.
- ❌ Mutating state inside the renderer or any other "pure function of its inputs" module.
- ❌ Reaching into `main.ts`'s editor state from a logic module instead of taking it as a parameter.
