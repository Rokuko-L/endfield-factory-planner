import type { MachineInstance, ResourceKind, Side } from './types.ts';

export function resourceForBand(
  machine: MachineInstance,
  side: Side,
  kind: ResourceKind,
): string {
  const band = machine.type.edgeBands?.[side];
  if (band?.resource && band.resource.trim() !== '') return band.resource;
  const pool = kind === 'fluid'
    ? machine.type.recipes.flatMap((r) => [...r.inputs, ...r.outputs].filter((s) => s.kind === 'fluid'))
    : machine.type.recipes.flatMap((r) => [...r.inputs, ...r.outputs].filter((s) => s.kind === 'item'));
  if (pool.length > 0) return pool[0]!.resource;
  return '';
}
