import type { MachineInstance, MachineType, ResourceKind } from './types.ts';
import type { Connection } from './types.ts';
import type { DepotAssignment } from './layout.ts';

const SOURCE_NAMES = new Set([
  'Depot Unloader',
  'Conduit Outlet',
  'Conduit Outlet Manifold',
  'Fluid Tank',
  'Gas Tank',
]);

const SINK_NAMES = new Set([
  'Depot Loader',
  'Conduit Inlet',
  'Conduit Inlet Manifold',
  'Protocol Stash',
  'Fluid Tank',
]);

const DEPOT_KEY = 'endfield.depotAssignments.v1';

export function isDepotSource(m: MachineType | MachineInstance): boolean {
  const name = (m as MachineType).name ?? (m as MachineInstance).type.name;
  return SOURCE_NAMES.has(name);
}

export function isDepotSink(m: MachineType | MachineInstance): boolean {
  const name = (m as MachineType).name ?? (m as MachineInstance).type.name;
  return SINK_NAMES.has(name);
}

export function isDepotMachine(m: MachineType | MachineInstance): boolean {
  const t: MachineType = (m as MachineInstance).type ?? (m as MachineType);
  return t.category === 'Depot Access';
}

export function depotPortKind(machine: MachineInstance): ResourceKind | null {
  const ports = machine.type.ports;
  if (ports.length > 0) return ports[0]!.kind;
  const bands = Object.values(machine.type.edgeBands ?? {});
  if (bands.length > 0) return (bands[0] as { resourceKind: ResourceKind }).resourceKind;
  return null;
}

export function allResources(types: MachineType[]): { resource: string; kind: ResourceKind }[] {
  const seen = new Map<string, ResourceKind>();
  const key = (r: string, k: string) => `${k}:${r}`;
  for (const t of types) {
    for (const p of t.ports) seen.set(key(p.resource, p.kind), p.kind);
    for (const b of Object.values(t.edgeBands ?? {})) {
      if (!b) continue;
      if (b.resource && b.resource.trim() !== '') seen.set(key(b.resource.trim(), b.resourceKind), b.resourceKind);
    }
    for (const r of t.recipes) {
      for (const s of [...r.inputs, ...r.outputs]) seen.set(key(s.resource, s.kind), s.kind);
    }
  }
  const out: { resource: string; kind: ResourceKind }[] = [];
  for (const [k, kind] of seen) {
    const resource = k.slice(kind.length + 1);
    if (!resource) continue;
    out.push({ resource, kind });
  }
  out.sort((a, b) => a.resource.localeCompare(b.resource));
  return out;
}

export function loadDepotAssignments(): Record<string, DepotAssignment> {
  try {
    const raw = localStorage.getItem(DEPOT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, DepotAssignment>;
  } catch { /* ignore */ }
  return {};
}

export function saveDepotAssignments(map: Record<string, DepotAssignment>): void {
  localStorage.setItem(DEPOT_KEY, JSON.stringify(map));
}

export function sinkTotals(
  connections: Connection[],
  machines: MachineInstance[],
): Map<string, { count: number; resources: Map<string, number> }> {
  const byId = new Map(machines.map((m) => [m.id, m] as const));
  const out = new Map<string, { count: number; resources: Map<string, number> }>();
  for (const c of connections) {
    const target = byId.get(c.toMachineId);
    if (!target || !isDepotSink(target)) continue;
    let entry = out.get(target.id);
    if (!entry) {
      entry = { count: 0, resources: new Map() };
      out.set(target.id, entry);
    }
    entry.count++;
    entry.resources.set(c.resource, (entry.resources.get(c.resource) ?? 0) + 1);
  }
  return out;
}
