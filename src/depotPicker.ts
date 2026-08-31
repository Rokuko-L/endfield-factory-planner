import type { MachineInstance } from './types.ts';
import type { DepotAssignment } from './layout.ts';
import { allResources, depotPortKind } from './depot.ts';
import type { MachineType } from './types.ts';

export async function openDepotPicker(
  machine: MachineInstance,
  machineTypes: MachineType[],
  current: DepotAssignment | null,
): Promise<DepotAssignment | null> {
  const kind = depotPortKind(machine);
  const all = allResources(machineTypes).filter((r) => !kind || r.kind === kind);
  const fallback = machine.type.recipes.flatMap((r) => [...r.inputs, ...r.outputs]);
  const extra = fallback.length > 0 ? [] : all;

  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'machine-editor-overlay';
    overlay.innerHTML = `<div class="machine-editor" role="dialog" aria-modal="true" aria-label="Depot assignment">
      <header class="machine-editor-header">
        <h2>${escapeHtml(machine.type.name)} — pick resource</h2>
        <div class="machine-editor-toolbar">
          <button type="button" data-act="clear">Clear</button>
          <button type="button" data-act="save" class="primary">Save</button>
          <button type="button" data-act="cancel">Cancel</button>
        </div>
      </header>
      <div class="machine-editor-body" style="flex-direction:column;gap:12px;padding:16px;">
        <div style="display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap;">
          <label class="field" style="min-width:160px;"><span class="field-label">Source rate /min</span><input type="number" min="0" step="1" data-role="rate" value="30" style="width:100%;" /></label>
          <label class="field" style="min-width:160px;"><span class="field-label">Kind</span><input type="text" data-role="kind" value="${escapeHtml(kind ?? 'item')}" readonly /></label>
        </div>
        <label class="field"><span class="field-label">Search</span><input type="text" data-role="search" placeholder="Filter resources…" style="width:100%;" /></label>
        <div data-role="list" style="max-height:320px;overflow:auto;border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:8px;display:flex;flex-direction:column;gap:4px;"></div>
        <div data-role="picked" style="font-size:13px;opacity:0.9;"></div>
      </div>
    </div>`;
    document.body.appendChild(overlay);

    const searchEl = overlay.querySelector('[data-role="search"]') as HTMLInputElement;
    const listEl = overlay.querySelector('[data-role="list"]') as HTMLElement;
    const pickedEl = overlay.querySelector('[data-role="picked"]') as HTMLElement;
    const rateEl = overlay.querySelector('[data-role="rate"]') as HTMLInputElement;
    if (rateEl && current) rateEl.value = String(current.rate);

    let selected: DepotAssignment | null = current ? { ...current } : null;
    let filter = '';

    function renderList() {
      const items = filter
        ? all.filter((r) => r.resource.toLowerCase().includes(filter.toLowerCase()))
        : all;
      const toShow = items.length > 0 ? items : extra;
      listEl.innerHTML = '';
      if (toShow.length === 0) {
        const empty = document.createElement('div');
        empty.textContent = 'No resources found.';
        empty.style.opacity = '0.6';
        listEl.appendChild(empty);
        return;
      }
      for (const r of toShow.slice(0, 200)) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'machine-list-item' + (selected?.resource === r.resource && selected?.kind === r.kind ? ' active' : '');
        btn.innerHTML = `<span class="name">${escapeHtml(r.resource)}</span> <span class="meta">${r.kind}</span>`;
        btn.addEventListener('click', () => {
          selected = { resource: r.resource, kind: r.kind, rate: selected?.rate ?? 30 };
          pickedEl.textContent = `Picked: ${selected.resource} (${selected.kind})`;
          renderList();
        });
        listEl.appendChild(btn);
      }
    }

    function renderPicked() {
      pickedEl.textContent = selected ? `Picked: ${selected.resource} (${selected.kind})` : 'No resource — will behave as infinite any-resource sink/source.';
    }

    searchEl.addEventListener('input', () => {
      filter = searchEl.value;
      renderList();
    });

    overlay.addEventListener('click', (e) => {
      const act = (e.target as HTMLElement).closest('[data-act]') as HTMLElement | null;
      if (!act) return;
      const a = act.getAttribute('data-act');
      if (a === 'save') {
        if (selected) {
          const r = Number((overlay.querySelector('[data-role="rate"]') as HTMLInputElement).value);
          selected = { ...selected, rate: Number.isFinite(r) && r >= 0 ? r : 30 };
        }
        cleanup();
        resolve(selected);
      } else if (a === 'clear') {
        cleanup();
        resolve(null);
      } else if (a === 'cancel') {
        cleanup();
        resolve(null);
      }
    });

    function cleanup() {
      document.body.removeChild(overlay);
    }

    renderList();
    renderPicked();
    searchEl.focus();
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
