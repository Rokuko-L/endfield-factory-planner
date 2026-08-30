import type { MachineType } from './types.ts';
import { ALL_MACHINE_TYPES as DEFAULT_MACHINE_TYPES } from './data/index.ts';
import { validateMachineTypes } from './machineValidate.ts';

const STORAGE_KEY = 'endfield.machineTypes.v1';

export function loadMachineTypes(): MachineType[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_MACHINE_TYPES;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('not an array');
    const errs = validateMachineTypes(parsed as MachineType[]);
    if (errs.length > 0) throw new Error(errs[0]!.message);
    return parsed as MachineType[];
  } catch {
    localStorage.removeItem(STORAGE_KEY);
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
  return JSON.parse(JSON.stringify(DEFAULT_MACHINE_TYPES));
}

export function exportCatalog(types: MachineType[]): string {
  return JSON.stringify(types, null, 2);
}

export function importCatalog(json: string): { types: MachineType[]; errors: ReturnType<typeof validateMachineTypes> } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { types: [], errors: [{ field: 'catalog', message: 'Invalid JSON.' }] };
  }
  if (!Array.isArray(parsed)) {
    return { types: [], errors: [{ field: 'catalog', message: 'Catalog must be an array.' }] };
  }
  const errors = validateMachineTypes(parsed as MachineType[]);
  if (errors.length > 0) return { types: [], errors };
  return { types: parsed as MachineType[], errors: [] };
}
