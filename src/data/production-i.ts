import type { MachineType } from "../types.ts";

/** Fitting Unit — 7 recipes */
export const FITTING_UNIT: MachineType = {
  "name": "Fitting Unit",
  "category": "Production I",
  "width": 5,
  "height": 5,
  "ports": [],
  "edgeBands": {},
  "recipes": [
    {
      "id": "recipe_1",
      "inputs": [
        {
          "resource": "Ferrium",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Ferrium Part",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_2",
      "inputs": [
        {
          "resource": "Amethyst Fiber",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Amethyst Part",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_3",
      "inputs": [
        {
          "resource": "Steel",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Steel Part",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_4",
      "inputs": [
        {
          "resource": "Cryston Fiber",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cryston Part",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_5",
      "inputs": [
        {
          "resource": "Cuprium",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Part",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_6",
      "inputs": [
        {
          "resource": "Hetonite",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite Part",
          "kind": "item",
          "rate": 6
        }
      ],
      "time": 10
    },
    {
      "id": "recipe_7",
      "inputs": [
        {
          "resource": "Pyrrolite",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Pyrrolite Part",
          "kind": "item",
          "rate": 6
        }
      ],
      "time": 10
    }
  ]
};

/** Moulding Unit — 7 recipes */
export const MOULDING_UNIT: MachineType = {
  "name": "Moulding Unit",
  "category": "Production I",
  "width": 5,
  "height": 5,
  "ports": [],
  "edgeBands": {},
  "recipes": [
    {
      "id": "recipe_1",
      "inputs": [
        {
          "resource": "Ferrium",
          "kind": "item",
          "rate": 60
        }
      ],
      "outputs": [
        {
          "resource": "Ferrium Bottle",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_2",
      "inputs": [
        {
          "resource": "Amethyst Fiber",
          "kind": "item",
          "rate": 60
        }
      ],
      "outputs": [
        {
          "resource": "Amethyst Bottle",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_3",
      "inputs": [
        {
          "resource": "Steel",
          "kind": "item",
          "rate": 60
        }
      ],
      "outputs": [
        {
          "resource": "Steel Bottle",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_4",
      "inputs": [
        {
          "resource": "Cryston Fiber",
          "kind": "item",
          "rate": 60
        }
      ],
      "outputs": [
        {
          "resource": "Cryston Bottle",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_5",
      "inputs": [
        {
          "resource": "Cuprium",
          "kind": "item",
          "rate": 60
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Bottle",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_6",
      "inputs": [
        {
          "resource": "Hetonite",
          "kind": "item",
          "rate": 60
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite Bottle",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_7_gas_mode",
      "inputs": [
        {
          "resource": "Cuprium",
          "kind": "item",
          "rate": 60
        },
        {
          "resource": "Inergen",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Canister",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    }
  ]
};

/** Planting Unit — 6 recipes */
export const PLANTING_UNIT: MachineType = {
  "name": "Planting Unit",
  "category": "Production I",
  "width": 5,
  "height": 5,
  "ports": [],
  "edgeBands": {},
  "recipes": [
    {
      "id": "recipe_1",
      "inputs": [
        {
          "resource": "Buckflower Seed",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Buckflower",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_2",
      "inputs": [
        {
          "resource": "Citrome Seed",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Citrome",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_3",
      "inputs": [
        {
          "resource": "Sandleaf Seed",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Sandleaf",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_4",
      "inputs": [
        {
          "resource": "Aketine Seed",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Aketine",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_5_fluid_mode",
      "inputs": [
        {
          "resource": "Jincao Seed",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Clean Water",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Jincao",
          "kind": "item",
          "rate": 60
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_6_fluid_mode",
      "inputs": [
        {
          "resource": "Yazhen Seed",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Clean Water",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Yazhen",
          "kind": "item",
          "rate": 60
        }
      ],
      "time": 2
    }
  ]
};

/** Refining Unit — 26 recipes */
export const REFINING_UNIT: MachineType = {
  "name": "Refining Unit",
  "category": "Production I",
  "width": 5,
  "height": 5,
  "ports": [],
  "edgeBands": {},
  "recipes": [
    {
      "id": "recipe_1",
      "inputs": [
        {
          "resource": "Ferrium Ore",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Ferrium",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_2",
      "inputs": [
        {
          "resource": "Ferrium Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Ferrium",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_3",
      "inputs": [
        {
          "resource": "Amethyst Ore",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Amethyst Fiber",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_4",
      "inputs": [
        {
          "resource": "Amethyst Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Amethyst Fiber",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_5",
      "inputs": [
        {
          "resource": "Originium Ore",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Origocrust",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_6",
      "inputs": [
        {
          "resource": "Origocrust Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Origocrust",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_7",
      "inputs": [
        {
          "resource": "Dense Origocrust Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Packed Origocrust",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_8",
      "inputs": [
        {
          "resource": "Dense Ferrium Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Steel",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_9",
      "inputs": [
        {
          "resource": "Cryston Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cryston Fiber",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_10",
      "inputs": [
        {
          "resource": "Dense Carbon Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Stabilized Carbon",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_11",
      "inputs": [
        {
          "resource": "Dense Originium Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Dense Origocrust Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_12",
      "inputs": [
        {
          "resource": "Originium Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Origocrust Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_13",
      "inputs": [
        {
          "resource": "Yazhen",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Carbon",
          "kind": "item",
          "rate": 60
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_14",
      "inputs": [
        {
          "resource": "Jincao",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Carbon",
          "kind": "item",
          "rate": 60
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_15",
      "inputs": [
        {
          "resource": "Sandleaf",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Carbon",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_16",
      "inputs": [
        {
          "resource": "Buckflower",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Carbon",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_17",
      "inputs": [
        {
          "resource": "Citrome",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Carbon",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_18",
      "inputs": [
        {
          "resource": "Wood",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Carbon",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_19",
      "inputs": [
        {
          "resource": "Yazhen Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Carbon Powder",
          "kind": "item",
          "rate": 60
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_20",
      "inputs": [
        {
          "resource": "Jincao Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Carbon Powder",
          "kind": "item",
          "rate": 60
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_21",
      "inputs": [
        {
          "resource": "Sandleaf Powder",
          "kind": "item",
          "rate": 90
        }
      ],
      "outputs": [
        {
          "resource": "Carbon Powder",
          "kind": "item",
          "rate": 60
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_22",
      "inputs": [
        {
          "resource": "Buckflower Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Carbon Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_23",
      "inputs": [
        {
          "resource": "Citrome Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Carbon Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_24",
      "inputs": [
        {
          "resource": "Ground Buckflower Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Dense Carbon Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_25",
      "inputs": [
        {
          "resource": "Ground Citrome Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Dense Carbon Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_26",
      "inputs": [
        {
          "resource": "Cuprium Ore",
          "kind": "fluid",
          "rate": 30
        },
        {
          "resource": "Clean Water",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium",
          "kind": "fluid",
          "rate": 30
        },
        {
          "resource": "Sewage",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    }
  ]
};

/** Seed-Picking Unit — 10 recipes */
export const SEED_PICKING_UNIT: MachineType = {
  "name": "Seed-Picking Unit",
  "category": "Production I",
  "width": 5,
  "height": 5,
  "ports": [],
  "edgeBands": {},
  "recipes": [
    {
      "id": "recipe_1",
      "inputs": [
        {
          "resource": "Buckflower",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Buckflower Seed",
          "kind": "item",
          "rate": 60
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_2",
      "inputs": [
        {
          "resource": "Citrome",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Citrome Seed",
          "kind": "item",
          "rate": 60
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_3",
      "inputs": [
        {
          "resource": "Sandleaf",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Sandleaf Seed",
          "kind": "item",
          "rate": 60
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_4",
      "inputs": [
        {
          "resource": "Aketine",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Aketine Seed",
          "kind": "item",
          "rate": 60
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_5",
      "inputs": [
        {
          "resource": "Jincao",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Jincao Seed",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_6",
      "inputs": [
        {
          "resource": "Yazhen",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Yazhen Seed",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_7",
      "inputs": [
        {
          "resource": "Reed Rye",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Reed Rye Seed",
          "kind": "item",
          "rate": 60
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_8",
      "inputs": [
        {
          "resource": "Tartpepper",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Tartpepper Seed",
          "kind": "item",
          "rate": 60
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_9",
      "inputs": [
        {
          "resource": "Redjade Ginseng",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Redjade Ginseng Seed",
          "kind": "item",
          "rate": 60
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_10",
      "inputs": [
        {
          "resource": "Amber Rice",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Amber Rice Seed",
          "kind": "item",
          "rate": 60
        }
      ],
      "time": 2
    }
  ]
};

/** Shredding Unit — 12 recipes */
export const SHREDDING_UNIT: MachineType = {
  "name": "Shredding Unit",
  "category": "Production I",
  "width": 5,
  "height": 5,
  "ports": [],
  "edgeBands": {},
  "recipes": [
    {
      "id": "recipe_1",
      "inputs": [
        {
          "resource": "Cuprium",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_2",
      "inputs": [
        {
          "resource": "Ferrium",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Ferrium Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_3",
      "inputs": [
        {
          "resource": "Amethyst Fiber",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Amethyst Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_4",
      "inputs": [
        {
          "resource": "Originium Ore",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Originium Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_5",
      "inputs": [
        {
          "resource": "Carbon",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Carbon Powder",
          "kind": "item",
          "rate": 60
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_6",
      "inputs": [
        {
          "resource": "Origocrust",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Origocrust Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_7",
      "inputs": [
        {
          "resource": "Buckflower",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Buckflower Powder",
          "kind": "item",
          "rate": 60
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_8",
      "inputs": [
        {
          "resource": "Citrome",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Citrome Powder",
          "kind": "item",
          "rate": 60
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_9",
      "inputs": [
        {
          "resource": "Sandleaf",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Sandleaf Powder",
          "kind": "item",
          "rate": 90
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_10",
      "inputs": [
        {
          "resource": "Aketine",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Aketine Powder",
          "kind": "item",
          "rate": 60
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_11",
      "inputs": [
        {
          "resource": "Jincao",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Jincao Powder",
          "kind": "item",
          "rate": 60
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_12",
      "inputs": [
        {
          "resource": "Yazhen",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Yazhen Powder",
          "kind": "item",
          "rate": 60
        }
      ],
      "time": 2
    }
  ]
};

/** Water Treatment Unit — 3 recipes */
export const WATER_TREATMENT_UNIT: MachineType = {
  "name": "Water Treatment Unit",
  "category": "Production I",
  "width": 5,
  "height": 5,
  "ports": [],
  "edgeBands": {},
  "recipes": [
    {
      "id": "recipe_1",
      "inputs": [
        {
          "resource": "Sewage",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Clean Water",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_2",
      "inputs": [
        {
          "resource": "Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Clean Water",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_3",
      "inputs": [
        {
          "resource": "Inert Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Clean Water",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    }
  ]
};
