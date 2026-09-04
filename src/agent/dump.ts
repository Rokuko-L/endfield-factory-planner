import { effectiveSize } from '../geometry.ts';
import { allPortCells } from '../ports.ts';
import type { Grid } from '../grid.ts';
import type { EditorState } from '../layout.ts';
import type { Connection, MachineInstance, ResourceKind, Side } from '../types.ts';
import type { StatusEntry } from '../editor/status.ts';

/**
 * Pure text rendering of the editor state. This is the agent playground's
 * "eyes" for text-only agents: everything a vision-capable agent sees on
 * the canvas is expressed here as ASCII maps and tables. No DOM access —
 * unit-testable offline in vitest.
 */

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const MAP_PAD = 2;
/** Max map span before we clip and note it (keeps dumps bounded). */
const MAX_SPAN = 64;

function machineLetters(machines: MachineInstance[]): Map<string, string> {
  const map = new Map<string, string>();
  for (let i = 0; i < machines.length && i < LETTERS.length; i++) {
    map.set(machines[i]!.id, LETTERS[i]!);
  }
  return map;
}

function connectionKindById(connections: Connection[]): Map<string, ResourceKind> {
  const map = new Map<string, ResourceKind>();
  for (const c of connections) map.set(c.id, c.kind);
  return map;
}

function pad2(n: number): string {
  return n < 10 ? ` ${n}` : String(n);
}

/**
 * ASCII map of the grid, clipped to the bounding box of all placed
 * machines and connections (plus padding). Machine tiles show their
 * legend letter; connection tiles show `=` (item), `~` (fluid) or `%`
 * (both kinds stacked on the tile).
 */
export function dumpGridText(grid: Grid, machines: MachineInstance[], connections: Connection[]): string {
  const letters = machineLetters(machines);
  const kinds = connectionKindById(connections);

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const m of machines) {
    const { width, height } = effectiveSize(m.type, m.orientation);
    minX = Math.min(minX, m.x);
    minY = Math.min(minY, m.y);
    maxX = Math.max(maxX, m.x + width - 1);
    maxY = Math.max(maxY, m.y + height - 1);
  }
  for (const t of grid.connectionTiles()) {
    minX = Math.min(minX, t.x);
    minY = Math.min(minY, t.y);
    maxX = Math.max(maxX, t.x);
    maxY = Math.max(maxY, t.y);
  }
  if (minX === Infinity) {
    minX = 0;
    minY = 0;
    maxX = 11;
    maxY = 7;
  }
  minX = Math.max(0, minX - MAP_PAD);
  minY = Math.max(0, minY - MAP_PAD);
  maxX = Math.min(grid.width - 1, maxX + MAP_PAD);
  maxY = Math.min(grid.height - 1, maxY + MAP_PAD);

  const clipped = maxX - minX + 1 > MAX_SPAN || maxY - minY + 1 > MAX_SPAN;
  maxX = Math.min(maxX, minX + MAX_SPAN - 1);
  maxY = Math.min(maxY, minY + MAX_SPAN - 1);

  const lines: string[] = [];
  const tens: string[] = ['    '];
  const ones: string[] = ['    '];
  for (let x = minX; x <= maxX; x++) {
    tens.push(x % 10 === 0 ? String(Math.floor(x / 10) % 10) : ' ');
    ones.push(String(x % 10));
  }
  lines.push(tens.join(''));
  lines.push(ones.join(''));
  for (let y = minY; y <= maxY; y++) {
    let row = pad2(y) + ' ';
    for (let x = minX; x <= maxX; x++) {
      const occupant = grid.getOccupancyAt(x, y);
      if (occupant) {
        row += letters.get(occupant) ?? '?';
        continue;
      }
      const connIds = grid.getConnectionsAt(x, y);
      if (connIds.length === 0) {
        row += '.';
        continue;
      }
      const tileKinds = new Set(connIds.map((id) => kinds.get(id) ?? 'item'));
      row += tileKinds.size > 1 ? '%' : tileKinds.has('fluid') ? '~' : '=';
    }
    lines.push(row);
  }
  if (clipped) lines.push(`(map clipped to ${MAX_SPAN} tiles per axis)`);
  lines.push(`legend: machines A-Z by placement order (see machine list), = item belt, ~ fluid pipe, % stacked, . empty`);
  return lines.join('\n');
}

interface PortAccum {
  side: Side;
  kind: ResourceKind;
  resource: string;
  cells: { x: number; y: number }[];
}

function portSummary(machines: MachineInstance[]): Map<string, string[]> {
  const byMachine = new Map<string, PortAccum[]>();
  for (const p of allPortCells(machines)) {
    let list = byMachine.get(p.machine.id);
    if (!list) {
      list = [];
      byMachine.set(p.machine.id, list);
    }
    let acc = list.find((a) => a.side === p.side && a.kind === p.kind && a.resource === p.resource);
    if (!acc) {
      acc = { side: p.side, kind: p.kind, resource: p.resource, cells: [] };
      list.push(acc);
    }
    acc.cells.push(p.cell);
  }
  const out = new Map<string, string[]>();
  for (const [id, list] of byMachine) {
    out.set(
      id,
      list.map((a) => {
        const arrow = a.kind === 'fluid' ? '~' : '=';
        const label = a.resource.trim() === '' ? 'any' : a.resource;
        const xs = a.cells.map((c) => c.x);
        const ys = a.cells.map((c) => c.y);
        const span =
          a.cells.length === 1
            ? `(${xs[0]},${ys[0]})`
            : `(${Math.min(...xs)},${Math.min(...ys)})..(${Math.max(...xs)},${Math.max(...ys)})`;
        return `${a.side} ${arrow} "${label}" (${a.kind}) ×${a.cells.length} @ adjacent ${span}`;
      }),
    );
  }
  return out;
}

/**
 * Full text view of the editor: mode, ASCII map, machine list with ports,
 * connection list, depot assignments, and recent status history.
 */
export function dumpLayoutText(
  grid: Grid,
  state: EditorState,
  statusLog: readonly StatusEntry[],
): string {
  const lines: string[] = [];
  const selected = state.machineTypes[state.selectedIndex];
  lines.push('=== layout dump ===');
  lines.push(
    `mode: ${state.mode} · selected type: ${selected ? selected.name : '(none)'} · orientation: ${state.orientation}° · ` +
      `${state.machines.length} machines, ${state.connections.length} connections · grid ${grid.width}×${grid.height}`,
  );
  lines.push('');
  lines.push('[map]');
  lines.push(dumpGridText(grid, state.machines, state.connections));
  lines.push('');

  const letters = machineLetters(state.machines);
  const ports = portSummary(state.machines);
  lines.push('[machines]');
  if (state.machines.length === 0) lines.push('(none)');
  for (const m of state.machines) {
    const { width, height } = effectiveSize(m.type, m.orientation);
    lines.push(
      `  ${letters.get(m.id) ?? '?'}  ${m.type.name}  at (${m.x},${m.y}) ${width}×${height} ${m.orientation}°  id=${m.id}`,
    );
    for (const p of ports.get(m.id) ?? []) lines.push(`     port ${p}`);
  }
  lines.push('');

  lines.push('[connections]');
  if (state.connections.length === 0) lines.push('(none)');
  for (const c of state.connections) {
    const label = c.resource.trim() === '' ? 'any' : c.resource;
    lines.push(
      `  ${letters.get(c.fromMachineId) ?? '?'}${c.fromPortId} → ${letters.get(c.toMachineId) ?? '?'}${c.toPortId}` +
        `  ${label} (${c.kind})  path ${c.path.length} tiles  recipe: ${c.matchedRecipeId ?? 'passthrough'}` +
        `  id=${c.id}`,
    );
  }
  lines.push('');

  lines.push('[depot assignments]');
  const depotIds = Object.keys(state.depotAssignments);
  if (depotIds.length === 0) lines.push('(none)');
  for (const id of depotIds) {
    const m = state.machines.find((mm) => mm.id === id);
    const a = state.depotAssignments[id]!;
    lines.push(`  ${letters.get(id) ?? '?'} ${m ? m.type.name : id}: ${a.resource} (${a.kind}) ${a.rate}/min`);
  }
  lines.push('');

  lines.push('[status history]');
  const recent = statusLog.slice(-8);
  if (recent.length === 0) lines.push('(empty)');
  for (const s of recent) lines.push(`  ${s.isError ? '!' : '·'} ${s.message}`);
  return lines.join('\n');
}

/** Machine-readable snapshot of everything on the board (JSON-safe). */
export function snapshotJson(grid: Grid, state: EditorState): object {
  const letters = machineLetters(state.machines);
  return {
    grid: { width: grid.width, height: grid.height },
    mode: state.mode,
    orientation: state.orientation,
    selectedTypeIndex: state.selectedIndex,
    machines: state.machines.map((m) => ({
      letter: letters.get(m.id) ?? '?',
      id: m.id,
      type: m.type.name,
      category: m.type.category ?? null,
      x: m.x,
      y: m.y,
      width: effectiveSize(m.type, m.orientation).width,
      height: effectiveSize(m.type, m.orientation).height,
      orientation: m.orientation,
    })),
    connections: state.connections.map((c) => ({
      id: c.id,
      from: { machine: c.fromMachineId, port: c.fromPortId },
      to: { machine: c.toMachineId, port: c.toPortId },
      resource: c.resource,
      kind: c.kind,
      throughput: c.throughput,
      pathLength: c.path.length,
      matchedRecipeId: c.matchedRecipeId,
    })),
    ports: allPortCells(state.machines).map((p) => ({
      machineId: p.machine.id,
      machineLetter: letters.get(p.machine.id) ?? '?',
      portId: p.portId,
      side: p.side,
      kind: p.kind,
      resource: p.resource,
      adjacentCell: p.cell,
    })),
    depotAssignments: { ...state.depotAssignments },
  };
}
