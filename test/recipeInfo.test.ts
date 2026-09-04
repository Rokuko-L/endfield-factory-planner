import { describe, expect, it } from 'vitest';
import { selectedRecipeFor } from '../src/recipeInfo.ts';
import type { Connection, MachineInstance, MachineType } from '../src/types.ts';

/** Mirrors the real LC Valley Battery chain: Amethyst Part 30 + Originium Powder 60 → 6/min. */
const packaging: MachineType = {
  name: 'Test Packaging',
  width: 6,
  height: 4,
  ports: [],
  recipes: [
    {
      id: 'lc_battery',
      inputs: [
        { resource: 'Amethyst Part', kind: 'item', rate: 30 },
        { resource: 'Originium Powder', kind: 'item', rate: 60 },
      ],
      outputs: [{ resource: 'LC Valley Battery', kind: 'item', rate: 6 }],
      time: 10,
    },
  ],
};

const machine: MachineInstance = { id: 'p1', type: packaging, x: 0, y: 0, orientation: 0 };

function inbound(resource: string, throughput = 30): Connection {
  return {
    id: `c-${resource}`,
    fromMachineId: 'src',
    fromPortId: 'p',
    toMachineId: 'p1',
    toPortId: 'p',
    kind: 'item',
    resource,
    matchedRecipeId: null,
    path: [],
    throughput,
  };
}

describe('selectedRecipeFor efficiency', () => {
  it('shows 100% when every input is fully fed (30 + 2×30 belts)', () => {
    const info = selectedRecipeFor(machine, [
      inbound('Amethyst Part', 30),
      inbound('Originium Powder', 30),
      inbound('Originium Powder', 30),
    ]);
    expect(info!.recipe.id).toBe('lc_battery');
    expect(info!.efficiency).toBe(1);
    expect(info!.supply).toBe(60);
    expect(info!.demand).toBe(60);
    expect(info!.inputStatus.map((s) => s.delivered)).toEqual([30, 60]);
  });

  it('drops to 50% when the 60/min input is fed by a single 30/min belt', () => {
    const info = selectedRecipeFor(machine, [
      inbound('Amethyst Part', 30),
      inbound('Originium Powder', 30),
    ]);
    expect(info!.efficiency).toBe(0.5);
    expect(info!.supply).toBe(30);
  });

  it('shows 0% when nothing is delivered', () => {
    const info = selectedRecipeFor(machine, []);
    expect(info!.efficiency).toBe(0);
    expect(info!.supply).toBe(0);
  });

  it('treats input-free recipes (mining rigs) as fully efficient', () => {
    const rig: MachineType = {
      name: 'Test Rig',
      width: 1,
      height: 1,
      ports: [],
      recipes: [
        { id: 'mine', inputs: [], outputs: [{ resource: 'Ore', kind: 'item', rate: 30 }] },
      ],
    };
    const info = selectedRecipeFor({ id: 'r1', type: rig, x: 0, y: 0, orientation: 0 }, []);
    expect(info!.efficiency).toBe(1);
  });

  it('picks the recipe with the most fed inputs when recipes share an input', () => {
    const multi: MachineType = {
      ...packaging,
      recipes: [
        { // shares 'Amethyst Part' with the battery recipe — must NOT win
          id: 'explosive',
          inputs: [
            { resource: 'Amethyst Part', kind: 'item', rate: 30 },
            { resource: 'Aketine Powder', kind: 'item', rate: 6 },
          ],
          outputs: [{ resource: 'Industrial Explosive', kind: 'item', rate: 6 }],
        },
        {
          id: 'lc_battery',
          inputs: [
            { resource: 'Amethyst Part', kind: 'item', rate: 30 },
            { resource: 'Originium Powder', kind: 'item', rate: 60 },
          ],
          outputs: [{ resource: 'LC Valley Battery', kind: 'item', rate: 6 }],
        },
      ],
    };
    const info = selectedRecipeFor({ id: 'p1', type: multi, x: 0, y: 0, orientation: 0 }, [
      inbound('Amethyst Part', 30),
      inbound('Originium Powder', 30),
      inbound('Originium Powder', 30),
    ]);
    expect(info!.recipe.id).toBe('lc_battery');
    expect(info!.efficiency).toBe(1);
  });
});
