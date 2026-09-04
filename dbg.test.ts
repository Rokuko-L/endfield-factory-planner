import { it } from 'vitest';
import { allPortCells } from 'D:/Tugas/LLM/endminsworkshop/src/ports.ts';
const smelter = {
  name: 'Test Smelter', width: 2, height: 2, ports: [],
  edgeBands: { south: { type: 'output', resourceKind: 'item', resource: 'Ingot' } },
  recipes: [],
} as any;
const m1 = { id: 'm1', type: smelter, x: 2, y: 1, orientation: 0 };
it('dbg', () => {
  console.log('CELLS:', JSON.stringify(allPortCells([m1]), null, 1));
});
