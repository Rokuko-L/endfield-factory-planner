import type { MachineType } from "../types.ts";

/** Miner: extracts raw ore — placeholder for the test suite */
export const MINER: MachineType = {
  name: "Miner",
  width: 5,
  height: 5,
  ports: [],
  edgeBands: {
    north: { type: "output", resourceKind: "item" },
  },
  recipes: [],
};

/** Furnace: 5×5 south-input / north-output — placeholder for the test suite */
export const FURNACE: MachineType = {
  name: "Furnace",
  width: 5,
  height: 5,
  ports: [
    {
      id: "water_input",
      type: "input",
      side: "west",
      tileIndex: 2,
      resource: "Water",
      kind: "fluid",
      rate: 10,
    },
  ],
  edgeBands: {
    south: { type: "input", resourceKind: "item" },
    north: { type: "output", resourceKind: "item" },
  },
  recipes: [
    {
      id: "iron_ore_to_iron_plate",
      inputs: [{ resource: "Iron Ore", kind: "item", rate: 30 }],
      outputs: [{ resource: "Iron Plate", kind: "item", rate: 15 }],
    },
  ],
};
