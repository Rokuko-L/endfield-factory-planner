import { saveDepotAssignments } from '../depot.ts';
import { grid, state } from '../editor/state.ts';
import { clearAll, clearConnections, placeMachine, removeConnectionAt, removeMachineAt, rotate, updateOrientationLabel } from '../editor/placement.ts';
import { setMode } from '../editor/connect.ts';
import { handleCanvasClick } from '../editor/click.ts';
import { loadLcValleyDemo } from '../editor/demo.ts';
import { redraw } from '../editor/redraw.ts';
import { statusHistory } from '../editor/status.ts';
import { dumpGridText, dumpLayoutText, snapshotJson } from './dump.ts';
import { allPortCells } from '../ports.ts';
import type { EditorState } from '../layout.ts';
import type { MachineType, Orientation } from '../types.ts';

/**
 * The agent playground: installs `window.__ew`, a text-in/text-out API
 * over the live editor. Actions drive the *same* code paths as mouse
 * clicks (handleCanvasClick / placeMachine / handleConnectClick), so an
 * agent exercising this API is testing the real editor, not a mock.
 *
 * Every action returns a human-readable string so a text-only agent can
 * play by evaluating JS and reading return values; vision-capable agents
 * can additionally screenshot the canvas. See Docs/reference/agent-playground.md.
 */

export interface AgentApi {
  help(): string;
  types(filter?: string): string;
  select(name: string): string;
  place(name: string, x: number, y: number, orientation?: Orientation): string;
  click(x: number, y: number): Promise<string>;
  connect(x1: number, y1: number, x2: number, y2: number): Promise<string>;
  remove(x: number, y: number): string;
  mode(mode?: 'place' | 'connect'): string;
  rotate(): string;
  assignDepot(x: number, y: number, resource: string, kind?: 'item' | 'fluid', rate?: number): string;
  ports(x?: number, y?: number): string;
  demo(): string;
  clearAll(): string;
  clearConnections(): string;
  status(): string;
  history(entries?: number): string;
  map(): string;
  dump(): string;
  snapshot(): object;
}

const HELP = `__ew — Endfield Workshop agent API (text-in/text-out, drives the real editor)

look:
  dump()                 full text view: map, machines+ports, connections, depots, status log
  map()                  just the ASCII map
  snapshot()             JSON of machines/connections/ports (for programmatic use)
  ports(x?, y?)          port cells of one machine (at tile x,y) or all machines
  types(filter?)         catalog entries (name, index, size, category, recipes)
  status()               last status message      history(n?) recent messages
act:
  place(name, x, y, orientation?)    place machine type by name (0|90|180|270)
  select(name)           select catalog entry (affects click-to-place)
  click(x, y)            left-click at tile in current mode (same handler as a real click)
  connect(x1, y1, x2, y2)  two-click connection: output-ish tile → input-ish tile
  mode('place'|'connect')  get/set mode        rotate()  cycle orientation
  remove(x, y)           remove machine or connection at tile (right-click equivalent)
  assignDepot(x, y, resource, kind='item', rate=30)  set depot assignment without the modal
  demo()                 load the LC Valley demo      clearAll()  clearConnections()
notes:
  - coords are grid tiles, top-left origin, y grows downward
  - connect() clicks pick the nearest port cell within 3 tiles; use ports() for exact cells
  - every action returns text: the last status line(s), or ERROR: ... on failure`;

function lastStatus(): string {
  const log = statusHistory();
  const last = log[log.length - 1];
  return last ? `${last.isError ? '!' : '·'} ${last.message}` : '(no status)';
}

function statusTail(n: number): string {
  const log = statusHistory().slice(-n);
  if (log.length === 0) return '(no status history)';
  return log.map((s) => `${s.isError ? '!' : '·'} ${s.message}`).join('\n');
}

function findType(name: string): { type: MachineType; index: number } | null {
  const needle = name.trim().toLowerCase();
  const index = state.machineTypes.findIndex(
    (t) => t.name.toLowerCase() === needle || t.name.toLowerCase().includes(needle),
  );
  return index === -1 ? null : { type: state.machineTypes[index]!, index };
}

function machineIdAt(x: number, y: number): string | null {
  return grid.getOccupancyAt(x, y);
}

function typeSummary(t: MachineType, index: number): string {
  const bits = [`#${index} ${t.name} ${t.width}×${t.height}`];
  if (t.category) bits.push(`[${t.category}]`);
  if (t.powerRange != null) bits.push(`power AoE ${t.powerRange}`);
  bits.push(`${t.recipes.length} recipe${t.recipes.length === 1 ? '' : 's'}`);
  return bits.join(' ');
}

function buildApi(): AgentApi {
  const api: AgentApi = {
    help: () => HELP,

    types: (filter) => {
      const needle = filter?.trim().toLowerCase() ?? '';
      const lines = state.machineTypes
        .map((t, i) => ({ t, i }))
        .filter(({ t }) => needle === '' || t.name.toLowerCase().includes(needle) || (t.category ?? '').toLowerCase().includes(needle))
        .map(({ t, i }) => typeSummary(t, i));
      return lines.length === 0 ? `no types matching '${filter}'` : lines.join('\n');
    },

    select: (name) => {
      const found = findType(name);
      if (!found) return `ERROR: no machine type matching '${name}'`;
      state.selectedIndex = found.index;
      const select = document.querySelector<HTMLSelectElement>('#machine-select');
      if (select) select.value = String(found.index);
      redraw();
      return `selected #${found.index} ${found.type.name} (${found.type.width}×${found.type.height})`;
    },

    place: (name, x, y, orientation) => {
      const found = findType(name);
      if (!found) return `ERROR: no machine type matching '${name}' — see types()`;
      api.select(found.type.name);
      state.orientation = orientation ?? state.orientation;
      updateOrientationLabel();
      placeMachine(x, y);
      return lastStatus();
    },

    click: async (x, y) => {
      if (!grid.isWithinBounds(x, y)) return `ERROR: (${x},${y}) is out of bounds`;
      await handleCanvasClick({ x, y });
      return lastStatus();
    },

    connect: async (x1, y1, x2, y2) => {
      setMode('connect');
      await handleCanvasClick({ x: x1, y: y1 });
      if (!state.draftSource) {
        return `ERROR: no port picked at (${x1},${y1}) — draft cancelled.\n${statusTail(2)}`;
      }
      await handleCanvasClick({ x: x2, y: y2 });
      return statusTail(2);
    },

    remove: (x, y) => {
      if (grid.getConnectionAt(x, y)) {
        removeConnectionAt(x, y);
        return lastStatus();
      }
      if (!machineIdAt(x, y)) return `ERROR: nothing at (${x},${y}) to remove`;
      removeMachineAt(x, y);
      return lastStatus();
    },

    mode: (mode) => {
      if (mode) setMode(mode);
      return `mode: ${state.mode}`;
    },

    rotate: () => {
      rotate();
      return lastStatus();
    },

    assignDepot: (x, y, resource, kind = 'item', rate = 30) => {
      const id = machineIdAt(x, y);
      if (!id) return `ERROR: no machine at (${x},${y})`;
      const machine = state.machines.find((m) => m.id === id);
      if (!machine) return `ERROR: no machine at (${x},${y})`;
      state.depotAssignments[id] = { resource, kind, rate };
      saveDepotAssignments(state.depotAssignments);
      redraw();
      return `${machine.type.name} (${id}) assigned ${resource} (${kind}) ${rate}/min`;
    },

    ports: (x, y) => {
      let machines = state.machines;
      if (x != null && y != null) {
        const id = machineIdAt(x, y);
        if (!id) return `ERROR: no machine at (${x},${y})`;
        machines = state.machines.filter((m) => m.id === id);
      }
      const cells = allPortCells(machines);
      if (cells.length === 0) return '(no ports)';
      return cells
        .map((p) => {
          const letter = state.machines.indexOf(p.machine) >= 0
            ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[state.machines.indexOf(p.machine)] ?? '?'
            : '?';
          const label = p.resource.trim() === '' ? 'any' : p.resource;
          return `${letter} ${p.machine.type.name} ${p.portId} ${p.side} ${p.kind} "${label}" @ (${p.cell.x},${p.cell.y})`;
        })
        .join('\n');
    },

    demo: () => {
      loadLcValleyDemo();
      return lastStatus();
    },

    clearAll: () => {
      clearAll();
      return lastStatus();
    },

    clearConnections: () => {
      clearConnections();
      return lastStatus();
    },

    status: () => lastStatus(),

    history: (entries = 10) => statusTail(entries),

    map: () => dumpGridText(grid, state.machines, state.connections),

    dump: () => dumpLayoutText(grid, state as EditorState, statusHistory()),

    snapshot: () => snapshotJson(grid, state as EditorState),
  };
  return api;
}

declare global {
  interface Window {
    __ew?: AgentApi;
  }
}

/** Installs the agent API on `window.__ew`. Called once from main.ts. */
export function installAgentApi(): void {
  window.__ew = buildApi();
}
