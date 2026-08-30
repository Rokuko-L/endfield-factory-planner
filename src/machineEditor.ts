import type { MachineType, PortDef, Recipe, RecipeSlot, Side } from './types.ts';
import {
  loadMachineTypes,
  saveMachineTypes,
  defaultMachineTypes,
  exportCatalog,
  importCatalog,
} from './machineStore.ts';
import { validateMachineTypes } from './machineValidate.ts';

const VALID_SIDES: ReadonlyArray<Side> = ['north', 'east', 'south', 'west'];

/**
 * Open a modal that lets the user view, edit, add, and delete machine
 * types. Returns a Promise that resolves to the new catalog (or null
 * if the user cancelled). The catalog persists to localStorage on
 * "Save".
 */
export async function openMachineEditor(): Promise<MachineType[] | null> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'machine-editor-overlay';
    overlay.innerHTML = `<div class="machine-editor" role="dialog" aria-modal="true" aria-label="Define Machines">
      <header class="machine-editor-header">
        <h2>Define Machines</h2>
        <div class="machine-editor-toolbar">
          <button type="button" data-act="add">+ Add Machine</button>
          <button type="button" data-act="import">Import JSON</button>
          <button type="button" data-act="export">Export JSON</button>
          <button type="button" data-act="reset">Reset to Defaults</button>
          <button type="button" data-act="save" class="primary">Save</button>
          <button type="button" data-act="cancel">Cancel</button>
        </div>
      </header>
      <div class="machine-editor-body">
        <aside class="machine-list"></aside>
        <main class="machine-detail">
          <p class="empty-hint">Select a machine on the left, or add a new one.</p>
        </main>
      </div>
      <footer class="machine-editor-footer">
        <ul class="machine-editor-errors"></ul>
      </footer>
    </div>`;
    document.body.appendChild(overlay);

    const state = {
      types: loadMachineTypes(),
      selectedIndex: -1,
      collapsed: new Set<string>(),
    };

    const listEl = overlay.querySelector(".machine-list") as HTMLElement;
    const detailEl = overlay.querySelector(".machine-detail") as HTMLElement;
    const errorsEl = overlay.querySelector(".machine-editor-errors") as HTMLElement;

    function render() {
      renderList();
      renderDetail();
      renderErrors();
    }

    function renderList() {
      listEl.innerHTML = "";
      const groups = groupByCategory(state.types);
      for (const [cat, indices] of groups) {
        const isCollapsed = state.collapsed.has(cat);
        const head = document.createElement("button");
        head.type = "button";
        head.className = "machine-list-category" + (isCollapsed ? " collapsed" : "");
        head.innerHTML = `<span class="caret">${isCollapsed ? "▸" : "▾"}</span> ${escapeHtml(cat)} (${indices.length})`;
        head.title = isCollapsed ? "Expand group" : "Collapse group";
        head.addEventListener("click", () => {
          if (state.collapsed.has(cat)) state.collapsed.delete(cat);
          else state.collapsed.add(cat);
          renderList();
        });
        listEl.appendChild(head);
        if (isCollapsed) continue;
        for (const i of indices) {
          const t = state.types[i]!;
          const row = document.createElement("button");
          row.type = "button";
          row.className = "machine-list-item" + (i === state.selectedIndex ? " active" : "");
          row.innerHTML = `<span class="name">${escapeHtml(t.name)}</span>
            <span class="meta">${t.width}×${t.height} · ${t.recipes.length} recipes</span>`;
          row.addEventListener("click", () => {
            state.selectedIndex = i;
            render();
          });
          listEl.appendChild(row);
        }
      }
    }

    function renderDetail() {
      detailEl.innerHTML = "";
      if (state.selectedIndex < 0) {
        const hint = document.createElement("p");
        hint.className = "empty-hint";
        hint.textContent = "Select a machine on the left, or add a new one.";
        detailEl.appendChild(hint);
        return;
      }
      const m = state.types[state.selectedIndex]!;
      detailEl.appendChild(buildMachineForm(m, (next) => {
        state.types[state.selectedIndex] = next;
        render();
      }, () => {
        state.types.splice(state.selectedIndex, 1);
        state.selectedIndex = Math.min(state.selectedIndex, state.types.length - 1);
        render();
      }));
    }

    function renderErrors() {
      const errs = validateMachineTypes(state.types);
      errorsEl.innerHTML = "";
      for (const e of errs) {
        const li = document.createElement("li");
        li.textContent = `${e.field}: ${e.message}`;
        errorsEl.appendChild(li);
      }
    }

    function triggerImport() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.addEventListener('change', async () => {
        const file = input.files?.[0];
        if (!file) return;
        const text = await file.text();
        const result = importCatalog(text);
        if (result.errors.length > 0) {
          errorsEl.innerHTML = '';
          for (const e of result.errors) {
            const li = document.createElement('li');
            li.textContent = `${e.field}: ${e.message}`;
            errorsEl.appendChild(li);
          }
          return;
        }
        state.types = result.types;
        state.selectedIndex = state.types.length > 0 ? 0 : -1;
        render();
      });
      input.click();
    }

    function triggerExport() {
      const json = exportCatalog(state.types);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'machines.json';
      a.click();
      URL.revokeObjectURL(url);
    }

    overlay.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('[data-act]') as HTMLElement | null;
      if (!btn) return;
      const act = btn.getAttribute('data-act');
      if (act === 'add') {
        const fresh: MachineType = {
          name: `New Machine ${state.types.length + 1}`,
          category: 'Miscellaneous',
          width: 3,
          height: 3,
          ports: [],
          recipes: [],
          edgeBands: {},
        };
        state.types.push(fresh);
        state.collapsed.delete('Miscellaneous');
        state.selectedIndex = state.types.length - 1;
        render();
      } else if (act === 'import') {
        triggerImport();
      } else if (act === 'export') {
        triggerExport();
      } else if (act === 'reset') {
        if (!confirm('Reset to defaults? This will discard your local edits.')) return;
        state.types = defaultMachineTypes();
        state.selectedIndex = 0;
        render();
      } else if (act === 'save') {
        const errs = validateMachineTypes(state.types);
        if (errs.length > 0) {
          renderErrors();
          return;
        }
        saveMachineTypes(state.types);
        cleanup();
        resolve(state.types);
      } else if (act === 'cancel') {
        cleanup();
        resolve(null);
      }
    });

    function cleanup() {
      document.body.removeChild(overlay);
    }

    render();
  });
}

// --- grouping ---

/** Display order for known facility categories; unknown ones sort
 *  alphabetically after these, "Uncategorized" last. */
const CATEGORY_ORDER: ReadonlyArray<string> = [
  "Production I",
  "Production II",
  "Logistics Units",
  "Depot Access",
  "Power",
  "Resourcing",
  "Planting",
];

function groupByCategory(types: readonly MachineType[]): Array<[string, number[]]> {
  const groups = new Map<string, number[]>();
  for (let i = 0; i < types.length; i++) {
    const cat = types[i]!.category?.trim() || "Uncategorized";
    const arr = groups.get(cat);
    if (arr) arr.push(i);
    else groups.set(cat, [i]);
  }
  return [...groups.entries()].sort(([a], [b]) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });
}

// --- form for a single machine ---

function buildMachineForm(
  m: MachineType,
  onChange: (next: MachineType) => void,
  onDelete: () => void,
): HTMLElement {
  const root = document.createElement("div");
  root.className = "machine-form";
  root.appendChild(buildHeader(m, onDelete));
  root.appendChild(buildBasicFields(m, onChange));
  root.appendChild(buildEdgeBandsSection(m, onChange));
  root.appendChild(buildPortsSection(m, onChange));
  root.appendChild(buildRecipesSection(m, onChange));
  return root;
}

function buildHeader(m: MachineType, onDelete: () => void): HTMLElement {
  const header = document.createElement("div");
  header.className = "machine-form-header";
  const title = document.createElement("h3");
  title.textContent = m.name || "(unnamed)";
  const del = document.createElement("button");
  del.type = "button";
  del.textContent = "Delete";
  del.addEventListener("click", () => {
    if (confirm(`Delete "${m.name}"?`)) onDelete();
  });
  header.append(title, del);
  return header;
}

function buildBasicFields(m: MachineType, onChange: (next: MachineType) => void): HTMLElement {
  const fieldset = document.createElement("fieldset");
  fieldset.innerHTML = `<legend>Footprint</legend>`;
  const grid = document.createElement("div");
  grid.className = "field-grid";

  const nameInput = input("Name", m.name, (v) => onChange({ ...m, name: v }));
  const categoryInput = input("Category", m.category ?? "", (v) =>
    onChange({ ...m, category: v.trim() || undefined }),
  );
  const widthInput = numberInput("Width", m.width, 1, 16, (v) =>
    onChange({ ...m, width: v }),
  );
  const heightInput = numberInput("Height", m.height, 1, 16, (v) =>
    onChange({ ...m, height: v }),
  );
  grid.append(nameInput, categoryInput, widthInput, heightInput);
  fieldset.appendChild(grid);
  return fieldset;
}

function buildEdgeBandsSection(
  m: MachineType,
  onChange: (next: MachineType) => void,
): HTMLElement {
  const fieldset = document.createElement("fieldset");
  fieldset.innerHTML = `<legend>Edge bands <span class="hint">(visual port zones that span the whole edge)</span></legend>`;
  const bands = m.edgeBands ?? {};
  const list = document.createElement("div");
  list.className = "edge-bands";
  for (const side of VALID_SIDES) {
    const band = bands[side];
    const row = document.createElement("div");
    row.className = "edge-band-row";
    const label = document.createElement("label");
    label.textContent = side;
    row.appendChild(label);
    if (band) {
      const typeSel = select(
        ["input", "output"],
        band.type,
        (v) => {
          const nextBands = { ...bands, [side]: { ...band, type: v as "input" | "output" } };
          onChange({ ...m, edgeBands: nextBands });
        },
      );
      const kindSel = select(
        ["item", "fluid"],
        band.resourceKind,
        (v) => {
          const nextBands = { ...bands, [side]: { ...band, resourceKind: v as "item" | "fluid" } };
          onChange({ ...m, edgeBands: nextBands });
        },
      );
      const resourceInput = input("resource", band.resource ?? "", (v) => {
        const nextBands = { ...bands, [side]: { ...band, resource: v.trim() || undefined } };
        onChange({ ...m, edgeBands: nextBands });
      });
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "×";
      remove.title = "Remove this band";
      remove.addEventListener("click", () => {
        const nextBands = { ...bands };
        delete nextBands[side];
        onChange({ ...m, edgeBands: nextBands });
      });
      row.append(typeSel, kindSel, resourceInput, remove);
    } else {
      const add = document.createElement("button");
      add.type = "button";
      add.textContent = "+ add";
      add.addEventListener("click", () => {
        onChange({
          ...m,
          edgeBands: { ...bands, [side]: { type: "input", resourceKind: "item" } },
        });
      });
      row.appendChild(add);
    }
    list.appendChild(row);
  }
  fieldset.appendChild(list);
  return fieldset;
}

function buildPortsSection(
  m: MachineType,
  onChange: (next: MachineType) => void,
): HTMLElement {
  const fieldset = document.createElement("fieldset");
  fieldset.innerHTML = `<legend>Single-tile ports <span class="hint">(e.g. fluid inputs on a specific tile)</span></legend>`;
  const list = document.createElement("div");
  list.className = "ports-list";

  m.ports.forEach((p, idx) => {
    const row = document.createElement("div");
    row.className = "port-row";
    row.append(
      input("id", p.id, (v) => updatePort(m, idx, { id: v }, onChange)),
      select(["input", "output"], p.type, (v) =>
        updatePort(m, idx, { type: v as "input" | "output" }, onChange),
      ),
      select(VALID_SIDES, p.side, (v) => updatePort(m, idx, { side: v as Side }, onChange)),
      numberInput("tileIndex", p.tileIndex, 0, 31, (v) =>
        updatePort(m, idx, { tileIndex: v }, onChange),
      ),
      input("resource", p.resource, (v) =>
        updatePort(m, idx, { resource: v }, onChange),
      ),
      select(["item", "fluid"], p.kind, (v) =>
        updatePort(m, idx, { kind: v as "item" | "fluid" }, onChange),
      ),
      numberInput("rate", p.rate, 0, 9999, (v) =>
        updatePort(m, idx, { rate: v }, onChange),
      ),
    );
    const del = document.createElement("button");
    del.type = "button";
    del.textContent = "×";
    del.addEventListener("click", () => {
      onChange({ ...m, ports: m.ports.filter((_, i) => i !== idx) });
    });
    row.appendChild(del);
    list.appendChild(row);
  });

  const add = document.createElement("button");
  add.type = "button";
  add.textContent = "+ Add Port";
  add.addEventListener("click", () => {
    const newPort: PortDef = {
      id: `port_${m.ports.length + 1}`,
      type: "input",
      side: "north",
      tileIndex: 0,
      resource: "",
      kind: "item",
      rate: 30,
    };
    onChange({ ...m, ports: [...m.ports, newPort] });
  });
  fieldset.append(list, add);
  return fieldset;
}

function buildRecipesSection(
  m: MachineType,
  onChange: (next: MachineType) => void,
): HTMLElement {
  const fieldset = document.createElement("fieldset");
  fieldset.innerHTML = `<legend>Recipes <span class="hint">(auto-detected by the connection editor)</span></legend>`;

  const list = document.createElement("div");
  list.className = "recipes-list";

  m.recipes.forEach((r, idx) => {
    const card = document.createElement("div");
    card.className = "recipe-card";
    card.appendChild(recipeRow(m, r, idx, onChange));
    list.appendChild(card);
  });

  const add = document.createElement("button");
  add.type = "button";
  add.textContent = "+ Add Recipe";
  add.addEventListener("click", () => {
    const fresh: Recipe = {
      id: `recipe_${m.recipes.length + 1}`,
      inputs: [],
      outputs: [],
    };
    onChange({ ...m, recipes: [...m.recipes, fresh] });
  });

  fieldset.append(list, add);
  return fieldset;
}

function recipeRow(
  m: MachineType,
  r: Recipe,
  idx: number,
  onChange: (next: MachineType) => void,
): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "recipe-row";

  const head = document.createElement("div");
  head.className = "recipe-head";
  head.append(
    input("id", r.id, (v) => updateRecipe(m, idx, { id: v }, onChange)),
    numberInput("time (s)", r.time ?? 0, 0, 9999, (v) =>
      updateRecipe(m, idx, { time: v || undefined }, onChange),
    ),
  );
  const del = document.createElement("button");
  del.type = "button";
  del.textContent = "×";
  del.addEventListener("click", () => {
    onChange({ ...m, recipes: m.recipes.filter((_, i) => i !== idx) });
  });
  head.appendChild(del);
  wrap.appendChild(head);

  wrap.appendChild(slotList("Inputs", r.inputs, (next) =>
    updateRecipe(m, idx, { inputs: next }, onChange),
  ));
  wrap.appendChild(slotList("Outputs", r.outputs, (next) =>
    updateRecipe(m, idx, { outputs: next }, onChange),
  ));

  return wrap;
}

function slotList(
  title: string,
  slots: RecipeSlot[],
  onChange: (next: RecipeSlot[]) => void,
): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "slot-list";
  const head = document.createElement("h5");
  head.textContent = title;
  wrap.appendChild(head);

  slots.forEach((s, idx) => {
    const row = document.createElement("div");
    row.className = "slot-row";
    row.append(
      input("resource", s.resource, (v) => {
        const next = slots.slice();
        next[idx] = { ...s, resource: v };
        onChange(next);
      }),
      select(["item", "fluid"], s.kind, (v) => {
        const next = slots.slice();
        next[idx] = { ...s, kind: v as "item" | "fluid" };
        onChange(next);
      }),
      numberInput("rate", s.rate, 0, 9999, (v) => {
        const next = slots.slice();
        next[idx] = { ...s, rate: v };
        onChange(next);
      }),
    );
    const del = document.createElement("button");
    del.type = "button";
    del.textContent = "×";
    del.addEventListener("click", () => {
      onChange(slots.filter((_, i) => i !== idx));
    });
    row.appendChild(del);
    wrap.appendChild(row);
  });

  const add = document.createElement("button");
  add.type = "button";
  add.textContent = `+ Add ${title.slice(0, -1)}`;
  add.addEventListener("click", () => {
    onChange([...slots, { resource: "", kind: "item", rate: 0 }]);
  });
  wrap.appendChild(add);

  return wrap;
}

function updatePort(
  m: MachineType,
  idx: number,
  patch: Partial<PortDef>,
  onChange: (next: MachineType) => void,
): void {
  const next = m.ports.slice();
  next[idx] = { ...next[idx]!, ...patch };
  onChange({ ...m, ports: next });
}

function updateRecipe(
  m: MachineType,
  idx: number,
  patch: Partial<Recipe>,
  onChange: (next: MachineType) => void,
): void {
  const next = m.recipes.slice();
  next[idx] = { ...next[idx]!, ...patch };
  onChange({ ...m, recipes: next });
}

// --- small DOM helpers ---

function input(
  label: string,
  value: string,
  onChange: (v: string) => void,
): HTMLElement {
  const wrap = document.createElement("label");
  wrap.className = "field";
  wrap.appendChild(span(label));
  const i = document.createElement("input");
  i.type = "text";
  i.value = value;
  i.addEventListener("input", () => onChange(i.value));
  wrap.appendChild(i);
  return wrap;
}

function numberInput(
  label: string,
  value: number,
  min: number,
  max: number,
  onChange: (v: number) => void,
): HTMLElement {
  const wrap = document.createElement("label");
  wrap.className = "field";
  wrap.appendChild(span(label));
  const i = document.createElement("input");
  i.type = "number";
  i.value = String(value);
  i.min = String(min);
  i.max = String(max);
  const err = document.createElement("span");
  err.className = "field-error";
  err.style.display = "none";
  err.style.color = "#f87171";
  err.style.fontSize = "11px";
  i.addEventListener("input", () => {
    const raw = i.value.trim();
    if (raw === "") {
      err.textContent = "Required";
      err.style.display = "inline";
      return;
    }
    const n = Number(raw);
    if (!Number.isFinite(n)) {
      err.textContent = "Must be a number";
      err.style.display = "inline";
      return;
    }
    if (n < min || n > max) {
      err.textContent = `Must be ${min}..${max}`;
      err.style.display = "inline";
      return;
    }
    err.style.display = "none";
    onChange(n);
  });
  wrap.append(i, err);
  return wrap;
}

function select(
  options: ReadonlyArray<string>,
  value: string,
  onChange: (v: string) => void,
): HTMLElement {
  const wrap = document.createElement("label");
  wrap.className = "field";
  const s = document.createElement("select");
  for (const o of options) {
    const opt = document.createElement("option");
    opt.value = o;
    opt.textContent = o;
    if (o === value) opt.selected = true;
    s.appendChild(opt);
  }
  s.addEventListener("change", () => onChange(s.value));
  wrap.appendChild(s);
  return wrap;
}

function span(text: string): HTMLElement {
  const s = document.createElement("span");
  s.className = "field-label";
  s.textContent = text;
  return s;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
