import type { MachineType } from './types.ts';

/**
 * Miner: extracts raw ore from a node. 5x5 footprint, outputs one item on
 * the north side at tile index 2.
 */
export const MINER: MachineType = {
  name: 'Miner',
  width: 5,
  height: 5,
  ports: [
    {
      id: 'iron_ore_output',
      type: 'output',
      side: 'north',
      tileIndex: 2,
      resource: 'Iron Ore',
      kind: 'item',
      rate: 30,
    },
  ],
};

/**
 * Furnace: smelts ore into plate. Takes iron ore in on the south side and
 * outputs iron plate on the north side.
 */
export const FURNACE: MachineType = {
  name: 'Furnace',
  width: 5,
  height: 5,
  ports: [
    {
      id: 'iron_ore_input',
      type: 'input',
      side: 'south',
      tileIndex: 2,
      resource: 'Iron Ore',
      kind: 'item',
      rate: 30,
    },
    {
      id: 'iron_plate_output',
      type: 'output',
      side: 'north',
      tileIndex: 2,
      resource: 'Iron Plate',
      kind: 'item',
      rate: 15,
    },
  ],
};

/** Every machine type known to the editor. */
export const ALL_MACHINE_TYPES: MachineType[] = [MINER, FURNACE];