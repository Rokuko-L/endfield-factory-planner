---
name: endmins-docs
description: Read or update the endminsworkshop (Endfield Factory Planner) project documentation (Docs/). Use this skill when asked about project docs, to explain a system, to update docs after code changes, or to add documentation for a new module or machine type.
---

# Endfield Factory Planner Documentation Skill

This skill tells you how to work with `endminsworkshop`'s documentation located in `Docs/`.

> **This project's docs have a history of drifting from `src/`** — new modules get added faster than `overview.md`'s tree gets updated. Treat that as an ongoing risk to check for, not a fixed, one-time list of gaps — the specific files that are out of sync will change over time as the docs get fixed and the code keeps moving. Always re-verify fresh rather than trusting a past finding (yours or anyone else's) to still be accurate.

## Step 0 — Before Explaining Architecture, Verify Against `src/`

Don't answer "what modules exist" or "how does X fit in" purely from `overview.md` from memory. First list the actual current contents of `src/` (and `src/data/`) and diff it against `overview.md`'s tree, right now, in this turn. If you find a module in `src/` with no corresponding doc entry:
- Say so to the user rather than silently working around the gap.
- If you're doing documentation work anyway, add the missing module to `overview.md`'s tree and give it a doc file under the right subdirectory (see "When to Update Docs" below) rather than leaving the gap for later.
- If the diff comes back clean, proceed normally — don't report a drift problem that isn't there.

## Documentation Structure

All docs live in `Docs/` and mirror the `src/` module layout:

```
Docs/
├── overview.md                            # Entry point — architecture, data flow, key rules, links to everything
├── workflow.md                            # How to run, scripts, project layout on disk
├── core/                                  # Domain model + core systems
│   ├── types.md                           # The domain model (MachineInstance, MachineType, PortDef, EdgeBand, Connection, Layout)
│   ├── data.md                            # The machine catalog (src/data/*) and how to extend it
│   ├── grid.md                            # Tile occupancy, bounds, the placement invariant
│   ├── geometry.md                        # Port rotation rules and the tile-index mirror
│   ├── pathfinding.md                     # A* on free cells, obstacle model, algorithm notes
│   └── renderer.md                        # Canvas drawing conventions, colors, DPI scaling
├── ui/
│   └── interactions.md                    # main.ts state machine, modes, event wiring, controls
└── reference/
    ├── testing.md                         # Vitest setup, what's covered, how to add tests
    ├── extending.md                       # How to add a new machine type (the canonical recipe)
    └── machine-editor.md                  # The machine editor modal (Import/Export, validation)
```

## How to Use These Docs

- **To explain a system to the user**: read the relevant `.md` file under `core/`, `ui/`, or `reference/` and summarize it.
- **To answer a question about a feature**: match the feature to a module in `overview.md`'s architecture diagram, then read that module's doc.
- **The overview page** (`overview.md`) has the architecture diagram, the data-flow diagram, and the "Key Rules" list — start there if you're unsure which file to read, or if a question is about how pieces fit together rather than one system in isolation.
- **For "how do I add X" questions** (new machine, new recipe rule, new render layer), check `reference/extending.md` first — it's the canonical recipe and should be followed rather than improvised.

## When to Update Docs

Update the documentation whenever you make changes to the codebase that affect:

1. **Domain model** — new or changed fields on `MachineInstance`, `MachineType`, `PortDef`, `EdgeBand`, `Connection`, or `Layout` → update `core/types.md`.
2. **The catalog** — new machine category file under `src/data/`, or a structural change to catalog entries → update `core/data.md` and the file tree in `overview.md`.
3. **Core algorithms** — changes to placement rules (`grid.ts`), rotation math (`geometry.ts`), pathfinding (`pathfinding.ts`), or recipe matching (`recipes.ts`) → update the matching `core/*.md`.
4. **Editor interactions** — new mode, new keybinding, new event flow in `main.ts` → update `ui/interactions.md`.
5. **New module** — a new top-level file in `src/` → add it to the architecture tree and data-flow diagram in `overview.md`, and give it its own doc under the right subdirectory.
6. **Testing** — new test file or new category of coverage → update `reference/testing.md`.

If a change doesn't fit an existing doc's scope, prefer adding a new focused file over overloading an existing one — the structure mirrors `src/` one-to-one on purpose.

7. **Growing files** — if applying `endfield-style`'s module-size check to a file flags it as overdue for a split, and you're the one doing that split, the doc structure should split with it: a newly-decomposed feature module should gain its own `ui/*.md` or `reference/*.md` entry rather than staying folded into a broader doc that no longer matches the code's shape.

## Guidelines for Writing

- Keep each file focused on **one module or one concern**, mirroring the `src/` file it documents.
- Match the existing structure: short intro, key types/functions, code snippets, a data-flow or rule list, related-docs links at the bottom.
- Reference file paths relative to the repo root (e.g. `src/geometry.ts`, `src/data/production-ii.ts`), not absolute paths.
- Add cross-links to related docs using relative markdown links (e.g. `[core/grid.md](../core/grid.md)`).
- Update `overview.md`'s architecture tree and documentation-map table if you add, remove, or rename a doc file or a `src/` module.
- Update `overview.md`'s "Key Rules" section if a change alters one of the numbered invariants (coordinate system, orientation-agnostic data, tile occupancy as source of truth, renderer purity, strict TypeScript, offline tests).
- Do not include implementation code verbatim beyond a short illustrative snippet — link to the source file for the rest.

### Inline Comments vs Documentation

- **Docs/ files** explain *why* a module exists, what invariants it protects, and how data flows through it. Use prose, tables, and the occasional short snippet or diagram.
- **Inline code comments** are for non-obvious logic only (e.g. why a heuristic was chosen in `pathfinding.ts`). If the code is self-explanatory, don't comment it — the code is the source of truth; comments and `Docs/` are supplements, not restatements.
