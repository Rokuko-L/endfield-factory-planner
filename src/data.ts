import type { MachineType } from './types.ts';

/**
 * Miner: extracts raw ore from a node. 5x5 footprint with a full-edge
 * item output on the north side.
 */
export const MINER: MachineType = {
  name: 'Miner',
  width: 5,
  height: 5,
  ports: [],
  edgeBands: {
    north: { type: 'output', resourceKind: 'item' },
  },
  recipes: [],
};

/**
 * Furnace: smelts ore into plate. Full-edge item input on the south
 * side, full-edge item output on the north side, and a single fluid
 * input tile on the west edge (center cell).
 */
export const FURNACE: MachineType = {
  name: 'Furnace',
  width: 5,
  height: 5,
  ports: [
    {
      id: 'water_input',
      type: 'input',
      side: 'west',
      tileIndex: 2,
      resource: 'Water',
      kind: 'fluid',
      rate: 10,
    },
  ],
  edgeBands: {
    south: { type: 'input', resourceKind: 'item' },
    north: { type: 'output', resourceKind: 'item' },
  },
  recipes: [
    {
      id: 'iron_ore_to_iron_plate',
      inputs: [{ resource: 'Iron Ore', kind: 'item', rate: 30 }],
      outputs: [{ resource: 'Iron Plate', kind: 'item', rate: 15 }],
    },
  ],
};

/** Every machine type known to the editor. */
export const ALL_MACHINE_TYPES: MachineType[] = [MINER, FURNACE];