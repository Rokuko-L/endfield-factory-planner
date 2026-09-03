import type { MachineInstance } from './types.ts';
import { effectiveSize } from './geometry.ts';

/**
 * Compute the power AoE rectangle for a machine.
 * Returns the bounding box of all tiles within `powerRange` of the
 * machine footprint (excluding the footprint itself), or null if the
 * machine has no powerRange.
 */
export function powerAoe(m: MachineInstance): { x: number; y: number; w: number; h: number } | null {
  const range = m.type.powerRange;
  if (range == null) return null;
  const { width, height } = effectiveSize(m.type, m.orientation);
  return {
    x: m.x - range,
    y: m.y - range,
    w: width + range * 2,
    h: height + range * 2,
  };
}

/**
 * Check if a machine's footprint overlaps with a power AoE rectangle.
 * Used to determine if a machine is powered by a given source.
 */
export function machineInAoe(
  target: MachineInstance,
  aoe: { x: number; y: number; w: number; h: number },
): boolean {
  const { width, height } = effectiveSize(target.type, target.orientation);
  return (
    target.x < aoe.x + aoe.w &&
    target.x + width > aoe.x &&
    target.y < aoe.y + aoe.h &&
    target.y + height > aoe.y
  );
}

/**
 * Determine if a machine is powered by any power source in the layout.
 * A machine is powered if any part of its footprint falls within the
 * AoE of a power-providing machine (excluding itself).
 */
export function isPowered(target: MachineInstance, allMachines: MachineInstance[]): boolean {
  for (const source of allMachines) {
    if (source.id === target.id) continue;
    const aoe = powerAoe(source);
    if (!aoe) continue;
    if (machineInAoe(target, aoe)) return true;
  }
  return false;
}

/**
 * Get all machines that provide power (have a powerRange defined).
 */
export function powerSources(machines: MachineInstance[]): MachineInstance[] {
  return machines.filter((m) => m.type.powerRange != null);
}
