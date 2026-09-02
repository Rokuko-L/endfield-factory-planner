import type { MachineType, Recipe, RecipeSlot } from '../types.ts';
import { input, numberInput, select } from './formControls.ts';

export function buildRecipesSection(
  m: MachineType,
  onChange: (next: MachineType) => void,
): HTMLElement {
  const fieldset = document.createElement('fieldset');
  fieldset.innerHTML = `<legend>Recipes <span class="hint">(auto-detected by the connection editor)</span></legend>`;
  const list = document.createElement('div');
  list.className = 'recipes-list';
  for (let idx = 0; idx < m.recipes.length; idx++) {
    const r = m.recipes[idx]!;
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.appendChild(recipeRow(m, r, idx, onChange));
    list.appendChild(card);
  }
  const add = document.createElement('button');
  add.type = 'button';
  add.textContent = '+ Add Recipe';
  add.addEventListener('click', () => {
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
  const wrap = document.createElement('div');
  wrap.className = 'recipe-row';
  const head = document.createElement('div');
  head.className = 'recipe-head';
  head.append(
    input('id', r.id, (v) => updateRecipe(m, idx, { id: v }, onChange)),
    numberInput('time (s)', r.time ?? 0, 0, 9999, (v) =>
      updateRecipe(m, idx, { time: v || undefined }, onChange),
    ),
  );
  const del = document.createElement('button');
  del.type = 'button';
  del.textContent = '×';
  del.addEventListener('click', () => {
    onChange({ ...m, recipes: m.recipes.filter((_, i) => i !== idx) });
  });
  head.appendChild(del);
  wrap.appendChild(head);
  wrap.appendChild(slotList('Inputs', r.inputs, (next) =>
    updateRecipe(m, idx, { inputs: next }, onChange),
  ));
  wrap.appendChild(slotList('Outputs', r.outputs, (next) =>
    updateRecipe(m, idx, { outputs: next }, onChange),
  ));
  return wrap;
}

function slotList(
  title: string,
  slots: RecipeSlot[],
  onChange: (next: RecipeSlot[]) => void,
): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'slot-list';
  const head = document.createElement('h5');
  head.textContent = title;
  wrap.appendChild(head);
  for (let idx = 0; idx < slots.length; idx++) {
    const s = slots[idx]!;
    const row = document.createElement('div');
    row.className = 'slot-row';
    row.append(
      input('resource', s.resource, (v) => {
        const next = slots.slice();
        next[idx] = { ...s, resource: v };
        onChange(next);
      }),
      select(['item', 'fluid'], s.kind, (v) => {
        const next = slots.slice();
        next[idx] = { ...s, kind: v as 'item' | 'fluid' };
        onChange(next);
      }),
      numberInput('rate', s.rate, 0, 9999, (v) => {
        const next = slots.slice();
        next[idx] = { ...s, rate: v };
        onChange(next);
      }),
    );
    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = '×';
    del.addEventListener('click', () => {
      onChange(slots.filter((_, i) => i !== idx));
    });
    row.appendChild(del);
    wrap.appendChild(row);
  }
  const add = document.createElement('button');
  add.type = 'button';
  add.textContent = `+ Add ${title.slice(0, -1)}`;
  add.addEventListener('click', () => {
    onChange([...slots, { resource: '', kind: 'item', rate: 0 }]);
  });
  wrap.appendChild(add);
  return wrap;
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
