import {
  loadMachineTypes,
  saveMachineTypes,
  defaultMachineTypes,
  exportCatalog,
  importCatalog,
} from '../machineStore.ts';
import { validateMachineTypes } from '../machineValidate.ts';
import type { MachineType } from '../types.ts';
import { buildMachineForm } from './machineForm.ts';
import { groupByCategory } from './grouping.ts';
import { escapeHtml } from './formControls.ts';

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

    const listEl = overlay.querySelector('.machine-list') as HTMLElement;
    const detailEl = overlay.querySelector('.machine-detail') as HTMLElement;
    const errorsEl = overlay.querySelector('.machine-editor-errors') as HTMLElement;

    function render() {
      renderList();
      renderDetail();
      renderErrors();
    }

    function renderList() {
      listEl.innerHTML = '';
      const groups = groupByCategory(state.types);
      for (const [cat, indices] of groups) {
        const isCollapsed = state.collapsed.has(cat);
        const head = document.createElement('button');
        head.type = 'button';
        head.className = 'machine-list-category' + (isCollapsed ? ' collapsed' : '');
        head.innerHTML = `<span class="caret">${isCollapsed ? '▸' : '▾'}</span> ${escapeHtml(cat)} (${indices.length})`;
        head.title = isCollapsed ? 'Expand group' : 'Collapse group';
        head.addEventListener('click', () => {
          if (state.collapsed.has(cat)) state.collapsed.delete(cat);
          else state.collapsed.add(cat);
          renderList();
        });
        listEl.appendChild(head);
        if (isCollapsed) continue;
        for (const i of indices) {
          const t = state.types[i]!;
          const row = document.createElement('button');
          row.type = 'button';
          row.className = 'machine-list-item' + (i === state.selectedIndex ? ' active' : '');
          row.innerHTML = `<span class="name">${escapeHtml(t.name)}</span>
            <span class="meta">${t.width}×${t.height} · ${t.recipes.length} recipes</span>`;
          row.addEventListener('click', () => {
            state.selectedIndex = i;
            render();
          });
          listEl.appendChild(row);
        }
      }
    }

    function renderDetail() {
      detailEl.innerHTML = '';
      if (state.selectedIndex < 0) {
        const hint = document.createElement('p');
        hint.className = 'empty-hint';
        hint.textContent = 'Select a machine on the left, or add a new one.';
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
      errorsEl.innerHTML = '';
      for (const e of errs) {
        const li = document.createElement('li');
        li.textContent = `${e.field}: ${e.message}`;
        errorsEl.appendChild(li);
      }
    }

    function triggerImport() {
      const inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = '.json,application/json';
      inp.addEventListener('change', async () => {
        const file = inp.files?.[0];
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
      inp.click();
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
