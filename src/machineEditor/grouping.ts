import type { MachineType } from '../types.ts';

const CATEGORY_ORDER: ReadonlyArray<string> = [
  'Production I',
  'Production II',
  'Logistics Units',
  'Depot Access',
  'Power',
  'Resourcing',
  'Planting',
];

export function groupByCategory(types: readonly MachineType[]): Array<[string, number[]]> {
  const groups = new Map<string, number[]>();
  for (let i = 0; i < types.length; i++) {
    const cat = types[i]!.category?.trim() || 'Uncategorized';
    const arr = groups.get(cat);
    if (arr) arr.push(i);
    else groups.set(cat, [i]);
  }
  return [...groups.entries()].sort(([a], [b]) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });
}
