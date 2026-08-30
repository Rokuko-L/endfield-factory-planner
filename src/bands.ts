import type { MachineInstance, Side } from './types.ts';

export function resourceForBand(
  machine: MachineInstance,
  side: Side,
  _kind: string,
): string {
  const band = machine.type.edgeBands?.[side];
  if (band?.resource != null) {
    const trimmed = band.resource.trim();
    if (trimmed === '') return '';
    return band.resource;
  }
  return '';
}
