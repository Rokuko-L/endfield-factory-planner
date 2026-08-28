import type { MachineType } from './types.ts';
import { ALL_MACHINE_TYPES as DEFAULT_MACHINE_TYPES } from './data.ts';

/**
 * localStorage key for the user's custom machine catalog. The value
 * is a JSON-serialized array of MachineType. When the key is unset
 * (or the JSON fails to parse), the editor falls back to the
 * hard-coded defaults in data.ts.
 *
 * Bumping the version suffix invalidates older saves if the schema
 * ever changes incompatibly.
 */
const STORAGE_KEY = 'endfield.machineTypes.v1';

export function loadMachineTypes(): MachineType[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MACHINE_TYPES;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_MACHINE_TYPES;
    return parsed as MachineType[];
  } catch {
    return DEFAULT_MACHINE_TYPES;
  }
}

export function saveMachineTypes(types: MachineType[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(types));
}

export function resetMachineTypes(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function defaultMachineTypes(): MachineType[] {
  // Deep clone so the editor doesn't mutate the source of truth.
  return JSON.parse(JSON.stringify(DEFAULT_MACHINE_TYPES));
}
