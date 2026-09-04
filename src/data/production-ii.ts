import type { MachineType } from "../types.ts";

/** Expanded Crucible */
export const EXPANDED_CRUCIBLE: MachineType = {
  "name": "Expanded Crucible",
  "category": "Production II",
  "width": 6,
  "height": 5,
  "ports": [
    {
      "id": "port_1",
      "type": "input",
      "side": "south",
      "tileIndex": 1,
      "resource": "",
      "kind": "item",
      "rate": 30
    },
    {
      "id": "port_2",
      "type": "input",
      "side": "south",
      "tileIndex": 2,
      "resource": "",
      "kind": "item",
      "rate": 30
    },
    {
      "id": "port_3",
      "type": "input",
      "side": "south",
      "tileIndex": 3,
      "resource": "",
      "kind": "item",
      "rate": 30
    },
    {
      "id": "port_4",
      "type": "input",
      "side": "south",
      "tileIndex": 4,
      "resource": "",
      "kind": "item",
      "rate": 30
    },
    {
      "id": "port_5",
      "type": "output",
      "side": "west",
      "tileIndex": 1,
      "resource": "",
      "kind": "fluid",
      "rate": 30
    },
    {
      "id": "port_6",
      "type": "output",
      "side": "west",
      "tileIndex": 3,
      "resource": "",
      "kind": "fluid",
      "rate": 30
    },
    {
      "id": "port_7",
      "type": "output",
      "side": "north",
      "tileIndex": 1,
      "resource": "",
      "kind": "item",
      "rate": 30
    },
    {
      "id": "port_8",
      "type": "output",
      "side": "north",
      "tileIndex": 2,
      "resource": "",
      "kind": "item",
      "rate": 30
    },
    {
      "id": "port_9",
      "type": "output",
      "side": "north",
      "tileIndex": 3,
      "resource": "",
      "kind": "item",
      "rate": 30
    },
    {
      "id": "port_10",
      "type": "output",
      "side": "north",
      "tileIndex": 4,
      "resource": "",
      "kind": "item",
      "rate": 30
    },
    {
      "id": "port_11",
      "type": "input",
      "side": "east",
      "tileIndex": 1,
      "resource": "",
      "kind": "fluid",
      "rate": 30
    },
    {
      "id": "port_12",
      "type": "input",
      "side": "east",
      "tileIndex": 3,
      "resource": "",
      "kind": "fluid",
      "rate": 30
    }
  ],
  "edgeBands": {},
  "recipes": [
    {
      "id": "recipe_1",
      "inputs": [
        {
          "resource": "Jincao Powder",
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
          "resource": "Jincao Solution",
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
          "resource": "Yazhen Powder",
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
          "resource": "Yazhen Solution",
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
          "resource": "Xiranite",
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
          "resource": "Liquid Xiranite",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_4",
      "inputs": [
        {
          "resource": "Heavy Xiranite",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Precipitation Acid",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Liquid Heavy Xiranite",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_5",
      "inputs": [
        {
          "resource": "Cuprium Powder",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Precipitation Acid",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_6",
      "inputs": [
        {
          "resource": "Liquid Xiranite",
          "kind": "fluid",
          "rate": 30
        },
        {
          "resource": "Sewage",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        },
        {
          "resource": "Inert Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_7",
      "inputs": [
        {
          "resource": "Xircon Effluent",
          "kind": "fluid",
          "rate": 60
        },
        {
          "resource": "Ferrium Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Xircon",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Sewage",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_8",
      "inputs": [
        {
          "resource": "Hetonite Solution",
          "kind": "fluid",
          "rate": 60
        },
        {
          "resource": "Ferrium Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite",
          "kind": "item",
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

/** Filling Unit */
export const FILLING_UNIT: MachineType = {
  "name": "Filling Unit",
  "category": "Production II",
  "width": 6,
  "height": 4,
  "ports": [],
  "edgeBands": {
    "north": {
      "type": "output",
      "resourceKind": "item"
    },
    "south": {
      "type": "input",
      "resourceKind": "item"
    }
  },
  "recipes": [
    {
      "id": "recipe_1",
      "inputs": [
        {
          "resource": "Amethyst Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Citrome Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Canned Citrome (C)",
          "kind": "item",
          "rate": 6
        }
      ],
      "time": 10
    },
    {
      "id": "recipe_2",
      "inputs": [
        {
          "resource": "Ferrium Bottle",
          "kind": "item",
          "rate": 60
        },
        {
          "resource": "Citrome Powder",
          "kind": "item",
          "rate": 60
        }
      ],
      "outputs": [
        {
          "resource": "Canned Citrome (B)",
          "kind": "item",
          "rate": 6
        }
      ],
      "time": 10
    },
    {
      "id": "recipe_3",
      "inputs": [
        {
          "resource": "Steel Bottle",
          "kind": "item",
          "rate": 60
        },
        {
          "resource": "Ground Citrome Powder",
          "kind": "item",
          "rate": 60
        }
      ],
      "outputs": [
        {
          "resource": "Canned Citrome (A)",
          "kind": "item",
          "rate": 6
        }
      ],
      "time": 10
    },
    {
      "id": "recipe_4",
      "inputs": [
        {
          "resource": "Amethyst Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Buckflower Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Buck Capsule (C)",
          "kind": "item",
          "rate": 6
        }
      ],
      "time": 10
    },
    {
      "id": "recipe_5",
      "inputs": [
        {
          "resource": "Ferrium Bottle",
          "kind": "item",
          "rate": 60
        },
        {
          "resource": "Buckflower Powder",
          "kind": "item",
          "rate": 60
        }
      ],
      "outputs": [
        {
          "resource": "Buck Capsule (B)",
          "kind": "item",
          "rate": 6
        }
      ],
      "time": 10
    },
    {
      "id": "recipe_6",
      "inputs": [
        {
          "resource": "Steel Bottle",
          "kind": "item",
          "rate": 60
        },
        {
          "resource": "Ground Buckflower Powder",
          "kind": "item",
          "rate": 60
        }
      ],
      "outputs": [
        {
          "resource": "Buck Capsule (A)",
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
          "resource": "Amethyst Bottle",
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
          "resource": "Amethyst Bottle (Clean Water)",
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
          "resource": "Amethyst Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Precipitation Acid",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Amethyst Bottle (Precipitation Acid)",
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
          "resource": "Amethyst Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Sewage",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Amethyst Bottle (Sewage)",
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
          "resource": "Amethyst Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Jincao Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Amethyst Bottle (Jincao Solution)",
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
          "resource": "Amethyst Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Yazhen Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Amethyst Bottle (Yazhen Solution)",
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
          "resource": "Amethyst Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Liquid Xiranite",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Amethyst Bottle (Liquid Xiranite)",
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
          "resource": "Amethyst Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Liquid Heavy Xiranite",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Amethyst Bottle (Liquid Heavy Xiranite)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_14",
      "inputs": [
        {
          "resource": "Amethyst Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Amethyst Bottle (Xircon Effluent)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_15",
      "inputs": [
        {
          "resource": "Amethyst Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Inert Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Amethyst Bottle (Inert Xircon Effluent)",
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
          "resource": "Amethyst Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Cuprium Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Amethyst Bottle (Cuprium Solution)",
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
          "resource": "Amethyst Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Hetonite Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Amethyst Bottle (Hetonite Solution)",
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
          "resource": "Cryston Bottle",
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
          "resource": "Cryston Bottle (Clean Water)",
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
          "resource": "Cryston Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Precipitation Acid",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cryston Bottle (Precipitation Acid)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_20",
      "inputs": [
        {
          "resource": "Cryston Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Sewage",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cryston Bottle (Sewage)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_21",
      "inputs": [
        {
          "resource": "Cryston Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Jincao Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cryston Bottle (Jincao Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_22",
      "inputs": [
        {
          "resource": "Cryston Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Yazhen Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cryston Bottle (Yazhen Solution)",
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
          "resource": "Cryston Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Liquid Xiranite",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cryston Bottle (Liquid Xiranite)",
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
          "resource": "Cryston Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Liquid Heavy Xiranite",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cryston Bottle (Liquid Heavy Xiranite)",
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
          "resource": "Cryston Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cryston Bottle (Xircon Effluent)",
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
          "resource": "Cryston Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Inert Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cryston Bottle (Inert Xircon Effluent)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_27",
      "inputs": [
        {
          "resource": "Cryston Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Cuprium Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cryston Bottle (Cuprium Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_28",
      "inputs": [
        {
          "resource": "Cryston Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Hetonite Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cryston Bottle (Hetonite Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_29",
      "inputs": [
        {
          "resource": "Ferrium Bottle",
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
          "resource": "Ferrium Bottle (Clean Water)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_30",
      "inputs": [
        {
          "resource": "Ferrium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Precipitation Acid",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Ferrium Bottle (Precipitation Acid)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_31",
      "inputs": [
        {
          "resource": "Ferrium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Sewage",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Ferrium Bottle (Sewage)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_32",
      "inputs": [
        {
          "resource": "Ferrium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Jincao Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Ferrium Bottle (Jincao Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_33",
      "inputs": [
        {
          "resource": "Ferrium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Yazhen Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Ferrium Bottle (Yazhen Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_34",
      "inputs": [
        {
          "resource": "Ferrium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Liquid Xiranite",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Ferrium Bottle (Liquid Xiranite)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_35",
      "inputs": [
        {
          "resource": "Ferrium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Liquid Heavy Xiranite",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Ferrium Bottle (Liquid Heavy Xiranite)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_36",
      "inputs": [
        {
          "resource": "Ferrium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Ferrium Bottle (Xircon Effluent)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_37",
      "inputs": [
        {
          "resource": "Ferrium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Inert Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Ferrium Bottle (Inert Xircon Effluent)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_38",
      "inputs": [
        {
          "resource": "Ferrium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Cuprium Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Ferrium Bottle (Cuprium Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_39",
      "inputs": [
        {
          "resource": "Ferrium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Hetonite Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Ferrium Bottle (Hetonite Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_40",
      "inputs": [
        {
          "resource": "Steel Bottle",
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
          "resource": "Steel Bottle (Clean Water)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_41",
      "inputs": [
        {
          "resource": "Steel Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Precipitation Acid",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Steel Bottle (Precipitation Acid)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_42",
      "inputs": [
        {
          "resource": "Steel Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Sewage",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Steel Bottle (Sewage)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_43",
      "inputs": [
        {
          "resource": "Steel Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Jincao Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Steel Bottle (Jincao Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_44",
      "inputs": [
        {
          "resource": "Steel Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Yazhen Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Steel Bottle (Yazhen Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_45",
      "inputs": [
        {
          "resource": "Steel Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Liquid Xiranite",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Steel Bottle (Liquid Xiranite)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_46",
      "inputs": [
        {
          "resource": "Steel Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Liquid Heavy Xiranite",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Steel Bottle (Liquid Heavy Xiranite)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_47",
      "inputs": [
        {
          "resource": "Steel Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Steel Bottle (Xircon Effluent)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_48",
      "inputs": [
        {
          "resource": "Steel Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Inert Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Steel Bottle (Inert Xircon Effluent)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_49",
      "inputs": [
        {
          "resource": "Steel Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Cuprium Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Steel Bottle (Cuprium Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_50",
      "inputs": [
        {
          "resource": "Steel Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Hetonite Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Steel Bottle (Hetonite Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_51",
      "inputs": [
        {
          "resource": "Cuprium Bottle",
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
          "resource": "Cuprium Bottle (Clean Water)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_52",
      "inputs": [
        {
          "resource": "Cuprium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Precipitation Acid",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Bottle (Precipitation Acid)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_53",
      "inputs": [
        {
          "resource": "Cuprium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Sewage",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Bottle (Sewage)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_54",
      "inputs": [
        {
          "resource": "Cuprium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Jincao Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Bottle (Jincao Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_55",
      "inputs": [
        {
          "resource": "Cuprium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Yazhen Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Bottle (Yazhen Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_56",
      "inputs": [
        {
          "resource": "Cuprium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Liquid Xiranite",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Bottle (Liquid Xiranite)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_57",
      "inputs": [
        {
          "resource": "Cuprium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Liquid Heavy Xiranite",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Bottle (Liquid Heavy Xiranite)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_58",
      "inputs": [
        {
          "resource": "Cuprium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Bottle (Xircon Effluent)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_59",
      "inputs": [
        {
          "resource": "Cuprium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Inert Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Bottle (Inert Xircon Effluent)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_60",
      "inputs": [
        {
          "resource": "Cuprium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Cuprium Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Bottle (Cuprium Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_61",
      "inputs": [
        {
          "resource": "Cuprium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Hetonite Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Bottle (Hetonite Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_62",
      "inputs": [
        {
          "resource": "Hetonite Bottle",
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
          "resource": "Hetonite Bottle (Clean Water)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_63",
      "inputs": [
        {
          "resource": "Hetonite Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Precipitation Acid",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite Bottle (Precipitation Acid)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_64",
      "inputs": [
        {
          "resource": "Hetonite Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Sewage",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite Bottle (Sewage)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_65",
      "inputs": [
        {
          "resource": "Hetonite Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Jincao Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite Bottle (Jincao Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_66",
      "inputs": [
        {
          "resource": "Hetonite Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Yazhen Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite Bottle (Yazhen Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_67",
      "inputs": [
        {
          "resource": "Hetonite Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite Bottle (Xircon Effluent)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_68",
      "inputs": [
        {
          "resource": "Hetonite Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Inert Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite Bottle (Inert Xircon Effluent)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_69",
      "inputs": [
        {
          "resource": "Hetonite Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Cuprium Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite Bottle (Cuprium Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_70",
      "inputs": [
        {
          "resource": "Hetonite Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Hetonite Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite Bottle (Hetonite Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_71",
      "inputs": [
        {
          "resource": "Cuprium Canister",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Aquagen",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Canister (Aquagen)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_72",
      "inputs": [
        {
          "resource": "Cuprium Canister",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Acridgen",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Canister (Acridgen)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_73",
      "inputs": [
        {
          "resource": "Cuprium Canister",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Xiragen",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Canister (Xiragen)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_74",
      "inputs": [
        {
          "resource": "Cuprium Canister",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Heavy Xiragen",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Canister (Heavy Xiragen)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_75",
      "inputs": [
        {
          "resource": "Cuprium Canister",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Inergen",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Canister (Inergen)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_76",
      "inputs": [
        {
          "resource": "Cuprium Canister",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Cuprium Gas",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Canister (Cuprium Gas)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_77",
      "inputs": [
        {
          "resource": "Cuprium Canister",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Hetonite Gas",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Canister (Hetonite Gas)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_78",
      "inputs": [
        {
          "resource": "Cuprium Canister",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Pyrrolite Gas",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Canister (Pyrrolite Gas)",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    }
  ]
};

/** Fluid-Gas Transmuting Unit */
export const FLUID_GAS_TRANSMUTING_UNIT: MachineType = {
  "name": "Fluid-Gas Transmuting Unit",
  "category": "Production II",
  "width": 5,
  "height": 5,
  "ports": [],
  "edgeBands": {},
  "recipes": [
    {
      "id": "recipe_1",
      "inputs": [
        {
          "resource": "Aquagen",
          "kind": "item",
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
          "resource": "Clean Water",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Aquagen",
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
          "resource": "Precipitation Acid",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Acridgen",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_4",
      "inputs": [
        {
          "resource": "Acridgen",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Precipitation Acid",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_5",
      "inputs": [
        {
          "resource": "Liquid Xiranite",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Xiragen",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_6",
      "inputs": [
        {
          "resource": "Xiragen",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Liquid Xiranite",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_7",
      "inputs": [
        {
          "resource": "Liquid Heavy Xiranite",
          "kind": "fluid",
          "rate": 12
        }
      ],
      "outputs": [
        {
          "resource": "Heavy Xiragen",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 10
    },
    {
      "id": "recipe_8",
      "inputs": [
        {
          "resource": "Heavy Xiragen",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Liquid Heavy Xiranite",
          "kind": "fluid",
          "rate": 12
        }
      ],
      "time": 10
    },
    {
      "id": "recipe_9",
      "inputs": [
        {
          "resource": "Cuprium Solution",
          "kind": "fluid",
          "rate": 60
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Gas",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_10",
      "inputs": [
        {
          "resource": "Cuprium Gas",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Solution",
          "kind": "fluid",
          "rate": 60
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_11",
      "inputs": [
        {
          "resource": "Hetonite Gas",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_12",
      "inputs": [
        {
          "resource": "Hetonite Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite Gas",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    }
  ]
};

/** Forge of the Sky */
export const FORGE_OF_THE_SKY: MachineType = {
  "name": "Forge of the Sky",
  "category": "Production II",
  "width": 5,
  "height": 5,
  "ports": [],
  "edgeBands": {
    "north": {
      "type": "output",
      "resourceKind": "item"
    },
    "south": {
      "type": "input",
      "resourceKind": "item"
    }
  },
  "recipes": [
    {
      "id": "recipe_1",
      "inputs": [
        {
          "resource": "Carbon",
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
          "resource": "Xiranite",
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
          "resource": "Stabilized Carbon",
          "kind": "item",
          "rate": 60
        },
        {
          "resource": "Clean Water",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Xiranite",
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
          "resource": "Xiranite",
          "kind": "item",
          "rate": 60
        },
        {
          "resource": "Xircon Effluent",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Heavy Xiranite",
          "kind": "item",
          "rate": 6
        }
      ],
      "time": 10
    },
    {
      "id": "recipe_4",
      "inputs": [
        {
          "resource": "Burdo-Muck",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Liquid Xiranite",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Bumper-Rich",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    }
  ]
};

/** Gas Dispersing Unit */
export const GAS_DISPERSING_UNIT: MachineType = {
  "name": "Gas Dispersing Unit",
  "category": "Production II",
  "width": 5,
  "height": 5,
  "noPower": true,
  "ports": [],
  "edgeBands": {
    "north": {
      "type": "input",
      "resourceKind": "fluid"
    }
  },
  "recipes": [
    {
      "id": "inergen_env",
      "inputs": [
        {
          "resource": "Inergen",
          "kind": "fluid",
          "rate": 0.1
        }
      ],
      "outputs": []
    },
    {
      "id": "acrid_env",
      "inputs": [
        {
          "resource": "Hetonite Gas",
          "kind": "fluid",
          "rate": 0.1
        }
      ],
      "outputs": []
    },
    {
      "id": "xiranite_env",
      "inputs": [
        {
          "resource": "Pyrrolite Gas",
          "kind": "fluid",
          "rate": 0.1
        }
      ],
      "outputs": []
    }
  ]
};

/** Gas Reactor Globe */
export const GAS_REACTOR_GLOBE: MachineType = {
  "name": "Gas Reactor Globe",
  "category": "Production II",
  "width": 5,
  "height": 5,
  "ports": [],
  "edgeBands": {},
  "recipes": [
    {
      "id": "recipe_1",
      "inputs": [
        {
          "resource": "Hetonite Gas",
          "kind": "fluid",
          "rate": 60
        },
        {
          "resource": "Xiragen",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Pyrrolite Gas",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    }
  ]
};

/** Gearing Unit */
export const GEARING_UNIT: MachineType = {
  "name": "Gearing Unit",
  "category": "Production II",
  "width": 6,
  "height": 4,
  "ports": [],
  "edgeBands": {
    "north": {
      "type": "output",
      "resourceKind": "item"
    },
    "south": {
      "type": "input",
      "resourceKind": "item"
    }
  },
  "recipes": [
    {
      "id": "recipe_1",
      "inputs": [
        {
          "resource": "Origocrust",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Amethyst Fiber",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Amethyst Component",
          "kind": "item",
          "rate": 6
        }
      ],
      "time": 10
    },
    {
      "id": "recipe_2",
      "inputs": [
        {
          "resource": "Origocrust",
          "kind": "item",
          "rate": 60
        },
        {
          "resource": "Ferrium",
          "kind": "item",
          "rate": 60
        }
      ],
      "outputs": [
        {
          "resource": "Ferrium Component",
          "kind": "item",
          "rate": 6
        }
      ],
      "time": 10
    },
    {
      "id": "recipe_3",
      "inputs": [
        {
          "resource": "Packed Origocrust",
          "kind": "item",
          "rate": 60
        },
        {
          "resource": "Cryston Fiber",
          "kind": "item",
          "rate": 60
        }
      ],
      "outputs": [
        {
          "resource": "Cryston Component",
          "kind": "item",
          "rate": 6
        }
      ],
      "time": 10
    },
    {
      "id": "recipe_4",
      "inputs": [
        {
          "resource": "Hetonite Part",
          "kind": "item",
          "rate": 12
        },
        {
          "resource": "Heavy Xiranite",
          "kind": "item",
          "rate": 12
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite Component",
          "kind": "item",
          "rate": 6
        }
      ],
      "time": 10
    },
    {
      "id": "recipe_5",
      "inputs": [
        {
          "resource": "Packed Origocrust",
          "kind": "item",
          "rate": 60
        },
        {
          "resource": "Xiranite",
          "kind": "item",
          "rate": 60
        }
      ],
      "outputs": [
        {
          "resource": "Xiranite Component",
          "kind": "item",
          "rate": 6
        }
      ],
      "time": 10
    },
    {
      "id": "recipe_6",
      "inputs": [
        {
          "resource": "Cuprium Part",
          "kind": "item",
          "rate": 60
        },
        {
          "resource": "Xiranite",
          "kind": "item",
          "rate": 60
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Component",
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
          "resource": "Pyrrolite Part",
          "kind": "item",
          "rate": 6
        },
        {
          "resource": "Heavy Xiranite",
          "kind": "item",
          "rate": 12
        }
      ],
      "outputs": [
        {
          "resource": "Pyrrolite Component",
          "kind": "item",
          "rate": 6
        }
      ],
      "time": 10
    }
  ]
};

/** Grinding Unit */
export const GRINDING_UNIT: MachineType = {
  "name": "Grinding Unit",
  "category": "Production II",
  "width": 6,
  "height": 4,
  "ports": [],
  "edgeBands": {
    "north": {
      "type": "output",
      "resourceKind": "item"
    },
    "south": {
      "type": "input",
      "resourceKind": "item"
    }
  },
  "recipes": [
    {
      "id": "recipe_1",
      "inputs": [
        {
          "resource": "Ferrium Powder",
          "kind": "item",
          "rate": 60
        },
        {
          "resource": "Sandleaf Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Dense Ferrium Powder",
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
          "resource": "Amethyst Powder",
          "kind": "item",
          "rate": 60
        },
        {
          "resource": "Sandleaf Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cryston Powder",
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
          "resource": "Originium Powder",
          "kind": "item",
          "rate": 60
        },
        {
          "resource": "Sandleaf Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Dense Originium Powder",
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
          "resource": "Carbon Powder",
          "kind": "item",
          "rate": 60
        },
        {
          "resource": "Sandleaf Powder",
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
      "id": "recipe_5",
      "inputs": [
        {
          "resource": "Origocrust Powder",
          "kind": "item",
          "rate": 60
        },
        {
          "resource": "Sandleaf Powder",
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
      "id": "recipe_6",
      "inputs": [
        {
          "resource": "Buckflower Powder",
          "kind": "item",
          "rate": 60
        },
        {
          "resource": "Sandleaf Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Ground Buckflower Powder",
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
          "resource": "Citrome Powder",
          "kind": "item",
          "rate": 60
        },
        {
          "resource": "Sandleaf Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Ground Citrome Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    }
  ]
};

/** Packaging Unit */
export const PACKAGING_UNIT: MachineType = {
  "name": "Packaging Unit",
  "category": "Production II",
  "width": 6,
  "height": 4,
  "ports": [],
  "edgeBands": {
    "north": {
      "type": "output",
      "resourceKind": "item"
    },
    "south": {
      "type": "input",
      "resourceKind": "item"
    }
  },
  "recipes": [
    {
      "id": "recipe_1",
      "inputs": [
        {
          "resource": "Amethyst Part",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Aketine Powder",
          "kind": "item",
          "rate": 6
        }
      ],
      "outputs": [
        {
          "resource": "Industrial Explosive",
          "kind": "item",
          "rate": 6
        }
      ],
      "time": 10
    },
    {
      "id": "recipe_2",
      "inputs": [
        {
          "resource": "Amethyst Part",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Originium Powder",
          "kind": "item",
          "rate": 60
        }
      ],
      "outputs": [
        {
          "resource": "LC Valley Battery",
          "kind": "item",
          "rate": 6
        }
      ],
      "time": 10
    },
    {
      "id": "recipe_3",
      "inputs": [
        {
          "resource": "Ferrium Part",
          "kind": "item",
          "rate": 60
        },
        {
          "resource": "Originium Powder",
          "kind": "item",
          "rate": 90
        }
      ],
      "outputs": [
        {
          "resource": "SC Valley Battery",
          "kind": "item",
          "rate": 6
        }
      ],
      "time": 10
    },
    {
      "id": "recipe_4",
      "inputs": [
        {
          "resource": "Steel Part",
          "kind": "item",
          "rate": 60
        },
        {
          "resource": "Dense Originium Powder",
          "kind": "item",
          "rate": 90
        }
      ],
      "outputs": [
        {
          "resource": "HC Valley Battery",
          "kind": "item",
          "rate": 6
        }
      ],
      "time": 10
    },
    {
      "id": "recipe_5",
      "inputs": [
        {
          "resource": "Ferrium Part",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Ferrium Bottle (Yazhen Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Yazhen Syringe (C)",
          "kind": "item",
          "rate": 6
        }
      ],
      "time": 10
    },
    {
      "id": "recipe_6",
      "inputs": [
        {
          "resource": "Cuprium Part",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Cuprium Bottle (Yazhen Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Yazhen Syringe (A)",
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
          "resource": "Ferrium Part",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Ferrium Bottle (Jincao Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Jincao Drink",
          "kind": "item",
          "rate": 6
        }
      ],
      "time": 10
    },
    {
      "id": "recipe_8",
      "inputs": [
        {
          "resource": "Cuprium Part",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Cuprium Bottle (Jincao Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Jincao Tea",
          "kind": "item",
          "rate": 6
        }
      ],
      "time": 10
    },
    {
      "id": "recipe_9",
      "inputs": [
        {
          "resource": "Xiranite",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Dense Originium Powder",
          "kind": "item",
          "rate": 90
        }
      ],
      "outputs": [
        {
          "resource": "LC Wuling Battery",
          "kind": "item",
          "rate": 6
        }
      ],
      "time": 10
    },
    {
      "id": "recipe_10",
      "inputs": [
        {
          "resource": "Xircon",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Dense Originium Powder",
          "kind": "item",
          "rate": 120
        }
      ],
      "outputs": [
        {
          "resource": "SC Wuling Battery",
          "kind": "item",
          "rate": 6
        }
      ],
      "time": 10
    },
    {
      "id": "recipe_11",
      "inputs": [
        {
          "resource": "Cuprium Canister",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Xiranite",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Separator Core",
          "kind": "item",
          "rate": 60
        }
      ],
      "time": 2
    }
  ]
};

/** Purification Unit */
export const PURIFICATION_UNIT: MachineType = {
  "name": "Purification Unit",
  "category": "Production II",
  "width": 5,
  "height": 5,
  "ports": [
    {
      "id": "port_1",
      "type": "input",
      "side": "east",
      "tileIndex": 1,
      "resource": "",
      "kind": "fluid",
      "rate": 30
    },
    {
      "id": "port_2",
      "type": "input",
      "side": "east",
      "tileIndex": 3,
      "resource": "",
      "kind": "fluid",
      "rate": 30
    },
    {
      "id": "port_3",
      "type": "input",
      "side": "west",
      "tileIndex": 1,
      "resource": "",
      "kind": "fluid",
      "rate": 30
    },
    {
      "id": "port_4",
      "type": "input",
      "side": "west",
      "tileIndex": 3,
      "resource": "",
      "kind": "fluid",
      "rate": 30
    }
  ],
  "edgeBands": {},
  "recipes": [
    {
      "id": "recipe_1",
      "inputs": [
        {
          "resource": "Inert Xircon Effluent",
          "kind": "fluid",
          "rate": 120
        }
      ],
      "outputs": [
        {
          "resource": "Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        },
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
          "resource": "Cuprium Solution",
          "kind": "fluid",
          "rate": 120
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite Solution",
          "kind": "fluid",
          "rate": 30
        },
        {
          "resource": "Precipitation Acid",
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
          "resource": "Xiragen",
          "kind": "fluid",
          "rate": 60
        },
        {
          "resource": "Separator Core",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Heavy Xiragen",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_4",
      "inputs": [
        {
          "resource": "Cuprium Gas",
          "kind": "fluid",
          "rate": 60
        },
        {
          "resource": "Separator Core",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite Gas",
          "kind": "fluid",
          "rate": 60
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_5",
      "inputs": [
        {
          "resource": "Xiragen",
          "kind": "fluid",
          "rate": 60
        },
        {
          "resource": "Separator Core",
          "kind": "item",
          "rate": 60
        }
      ],
      "outputs": [
        {
          "resource": "Heavy Xiragen",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_6",
      "inputs": [
        {
          "resource": "Cuprium Gas",
          "kind": "fluid",
          "rate": 60
        },
        {
          "resource": "Separator Core",
          "kind": "item",
          "rate": 60
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite Gas",
          "kind": "fluid",
          "rate": 60
        }
      ],
      "time": 2
    }
  ]
};

/** Reactor Crucible */
export const REACTOR_CRUCIBLE: MachineType = {
  "name": "Reactor Crucible",
  "category": "Production II",
  "width": 5,
  "height": 5,
  "ports": [
    {
      "id": "port_1",
      "type": "input",
      "side": "south",
      "tileIndex": 1,
      "resource": "",
      "kind": "item",
      "rate": 30
    },
    {
      "id": "port_2",
      "type": "input",
      "side": "south",
      "tileIndex": 3,
      "resource": "",
      "kind": "item",
      "rate": 30
    },
    {
      "id": "port_3",
      "type": "output",
      "side": "west",
      "tileIndex": 1,
      "resource": "",
      "kind": "fluid",
      "rate": 30
    },
    {
      "id": "port_4",
      "type": "output",
      "side": "west",
      "tileIndex": 3,
      "resource": "",
      "kind": "fluid",
      "rate": 30
    },
    {
      "id": "port_5",
      "type": "output",
      "side": "north",
      "tileIndex": 1,
      "resource": "",
      "kind": "item",
      "rate": 30
    },
    {
      "id": "port_6",
      "type": "output",
      "side": "north",
      "tileIndex": 3,
      "resource": "",
      "kind": "item",
      "rate": 30
    },
    {
      "id": "port_7",
      "type": "input",
      "side": "east",
      "tileIndex": 1,
      "resource": "",
      "kind": "fluid",
      "rate": 30
    },
    {
      "id": "port_8",
      "type": "input",
      "side": "east",
      "tileIndex": 3,
      "resource": "",
      "kind": "fluid",
      "rate": 30
    }
  ],
  "edgeBands": {},
  "recipes": [
    {
      "id": "recipe_1",
      "inputs": [
        {
          "resource": "Jincao Powder",
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
          "resource": "Jincao Solution",
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
          "resource": "Yazhen Powder",
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
          "resource": "Yazhen Solution",
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
          "resource": "Xiranite",
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
          "resource": "Liquid Xiranite",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_4",
      "inputs": [
        {
          "resource": "Heavy Xiranite",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Precipitation Acid",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Liquid Heavy Xiranite",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_5",
      "inputs": [
        {
          "resource": "Cuprium Powder",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Precipitation Acid",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_6",
      "inputs": [
        {
          "resource": "Liquid Xiranite",
          "kind": "fluid",
          "rate": 30
        },
        {
          "resource": "Sewage",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        },
        {
          "resource": "Inert Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_7",
      "inputs": [
        {
          "resource": "Xircon Effluent",
          "kind": "fluid",
          "rate": 60
        },
        {
          "resource": "Ferrium Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Xircon",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Sewage",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_8",
      "inputs": [
        {
          "resource": "Hetonite Solution",
          "kind": "fluid",
          "rate": 60
        },
        {
          "resource": "Ferrium Powder",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite",
          "kind": "item",
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

/** Separating Unit */
export const SEPARATING_UNIT: MachineType = {
  "name": "Separating Unit",
  "category": "Production II",
  "width": 5,
  "height": 5,
  "ports": [],
  "edgeBands": {},
  "recipes": [
    {
      "id": "recipe_1",
      "inputs": [
        {
          "resource": "Amethyst Bottle (Clean Water)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Amethyst Bottle",
          "kind": "item",
          "rate": 30
        },
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
          "resource": "Amethyst Bottle (Precipitation Acid)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Amethyst Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Precipitation Acid",
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
          "resource": "Amethyst Bottle (Sewage)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Amethyst Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Sewage",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_4",
      "inputs": [
        {
          "resource": "Amethyst Bottle (Jincao Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Amethyst Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Jincao Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_5",
      "inputs": [
        {
          "resource": "Amethyst Bottle (Yazhen Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Amethyst Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Yazhen Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_6",
      "inputs": [
        {
          "resource": "Amethyst Bottle (Liquid Xiranite)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Amethyst Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Liquid Xiranite",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_7",
      "inputs": [
        {
          "resource": "Amethyst Bottle (Liquid Heavy Xiranite)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Amethyst Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Liquid Heavy Xiranite",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_8",
      "inputs": [
        {
          "resource": "Amethyst Bottle (Xircon Effluent)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Amethyst Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_9",
      "inputs": [
        {
          "resource": "Amethyst Bottle (Inert Xircon Effluent)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Amethyst Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Inert Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_10",
      "inputs": [
        {
          "resource": "Amethyst Bottle (Cuprium Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Amethyst Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Cuprium Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_11",
      "inputs": [
        {
          "resource": "Amethyst Bottle (Hetonite Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Amethyst Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Hetonite Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_12",
      "inputs": [
        {
          "resource": "Cryston Bottle (Clean Water)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cryston Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Clean Water",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_13",
      "inputs": [
        {
          "resource": "Cryston Bottle (Precipitation Acid)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cryston Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Precipitation Acid",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_14",
      "inputs": [
        {
          "resource": "Cryston Bottle (Sewage)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cryston Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Sewage",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_15",
      "inputs": [
        {
          "resource": "Cryston Bottle (Jincao Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cryston Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Jincao Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_16",
      "inputs": [
        {
          "resource": "Cryston Bottle (Yazhen Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cryston Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Yazhen Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_17",
      "inputs": [
        {
          "resource": "Cryston Bottle (Liquid Xiranite)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cryston Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Liquid Xiranite",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_18",
      "inputs": [
        {
          "resource": "Cryston Bottle (Liquid Heavy Xiranite)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cryston Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Liquid Heavy Xiranite",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_19",
      "inputs": [
        {
          "resource": "Cryston Bottle (Xircon Effluent)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cryston Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_20",
      "inputs": [
        {
          "resource": "Cryston Bottle (Inert Xircon Effluent)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cryston Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Inert Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_21",
      "inputs": [
        {
          "resource": "Cryston Bottle (Cuprium Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cryston Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Cuprium Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_22",
      "inputs": [
        {
          "resource": "Cryston Bottle (Hetonite Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cryston Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Hetonite Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_23",
      "inputs": [
        {
          "resource": "Ferrium Bottle (Clean Water)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Ferrium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Clean Water",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_24",
      "inputs": [
        {
          "resource": "Ferrium Bottle (Precipitation Acid)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Ferrium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Precipitation Acid",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_25",
      "inputs": [
        {
          "resource": "Ferrium Bottle (Sewage)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Ferrium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Sewage",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_26",
      "inputs": [
        {
          "resource": "Ferrium Bottle (Jincao Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Ferrium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Jincao Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_27",
      "inputs": [
        {
          "resource": "Ferrium Bottle (Yazhen Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Ferrium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Yazhen Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_28",
      "inputs": [
        {
          "resource": "Ferrium Bottle (Liquid Xiranite)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Ferrium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Liquid Xiranite",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_29",
      "inputs": [
        {
          "resource": "Ferrium Bottle (Liquid Heavy Xiranite)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Ferrium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Liquid Heavy Xiranite",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_30",
      "inputs": [
        {
          "resource": "Ferrium Bottle (Xircon Effluent)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Ferrium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_31",
      "inputs": [
        {
          "resource": "Ferrium Bottle (Inert Xircon Effluent)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Ferrium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Inert Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_32",
      "inputs": [
        {
          "resource": "Ferrium Bottle (Cuprium Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Ferrium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Cuprium Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_33",
      "inputs": [
        {
          "resource": "Ferrium Bottle (Hetonite Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Ferrium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Hetonite Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_34",
      "inputs": [
        {
          "resource": "Steel Bottle (Clean Water)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Steel Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Clean Water",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_35",
      "inputs": [
        {
          "resource": "Steel Bottle (Precipitation Acid)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Steel Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Precipitation Acid",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_36",
      "inputs": [
        {
          "resource": "Steel Bottle (Sewage)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Steel Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Sewage",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_37",
      "inputs": [
        {
          "resource": "Steel Bottle (Jincao Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Steel Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Jincao Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_38",
      "inputs": [
        {
          "resource": "Steel Bottle (Yazhen Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Steel Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Yazhen Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_39",
      "inputs": [
        {
          "resource": "Steel Bottle (Liquid Xiranite)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Steel Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Liquid Xiranite",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_40",
      "inputs": [
        {
          "resource": "Steel Bottle (Liquid Heavy Xiranite)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Steel Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Liquid Heavy Xiranite",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_41",
      "inputs": [
        {
          "resource": "Steel Bottle (Xircon Effluent)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Steel Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_42",
      "inputs": [
        {
          "resource": "Steel Bottle (Inert Xircon Effluent)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Steel Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Inert Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_43",
      "inputs": [
        {
          "resource": "Steel Bottle (Cuprium Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Steel Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Cuprium Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_44",
      "inputs": [
        {
          "resource": "Steel Bottle (Hetonite Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Steel Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Hetonite Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_45",
      "inputs": [
        {
          "resource": "Cuprium Bottle (Clean Water)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Clean Water",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_46",
      "inputs": [
        {
          "resource": "Cuprium Bottle (Precipitation Acid)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Precipitation Acid",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_47",
      "inputs": [
        {
          "resource": "Cuprium Bottle (Sewage)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Sewage",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_48",
      "inputs": [
        {
          "resource": "Cuprium Bottle (Jincao Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Jincao Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_49",
      "inputs": [
        {
          "resource": "Cuprium Bottle (Yazhen Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Yazhen Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_50",
      "inputs": [
        {
          "resource": "Cuprium Bottle (Liquid Xiranite)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Liquid Xiranite",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_51",
      "inputs": [
        {
          "resource": "Cuprium Bottle (Liquid Heavy Xiranite)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Liquid Heavy Xiranite",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_52",
      "inputs": [
        {
          "resource": "Cuprium Bottle (Xircon Effluent)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_53",
      "inputs": [
        {
          "resource": "Cuprium Bottle (Inert Xircon Effluent)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Inert Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_54",
      "inputs": [
        {
          "resource": "Cuprium Bottle (Cuprium Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Cuprium Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_55",
      "inputs": [
        {
          "resource": "Cuprium Bottle (Hetonite Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Hetonite Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_56",
      "inputs": [
        {
          "resource": "Hetonite Bottle (Clean Water)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Clean Water",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_57",
      "inputs": [
        {
          "resource": "Hetonite Bottle (Precipitation Acid)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Precipitation Acid",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_58",
      "inputs": [
        {
          "resource": "Hetonite Bottle (Sewage)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Sewage",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_59",
      "inputs": [
        {
          "resource": "Hetonite Bottle (Jincao Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Jincao Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_60",
      "inputs": [
        {
          "resource": "Hetonite Bottle (Yazhen Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Yazhen Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_61",
      "inputs": [
        {
          "resource": "Hetonite Bottle (Liquid Xiranite)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Liquid Xiranite",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_62",
      "inputs": [
        {
          "resource": "Hetonite Bottle (Liquid Heavy Xiranite)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Liquid Heavy Xiranite",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_63",
      "inputs": [
        {
          "resource": "Hetonite Bottle (Xircon Effluent)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_64",
      "inputs": [
        {
          "resource": "Hetonite Bottle (Inert Xircon Effluent)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Inert Xircon Effluent",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_65",
      "inputs": [
        {
          "resource": "Hetonite Bottle (Cuprium Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Cuprium Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_66",
      "inputs": [
        {
          "resource": "Hetonite Bottle (Hetonite Solution)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite Bottle",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Hetonite Solution",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_67",
      "inputs": [
        {
          "resource": "Cuprium Canister (Aquagen)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Canister",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Aquagen",
          "kind": "item",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_68",
      "inputs": [
        {
          "resource": "Cuprium Canister (Acridgen)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Canister",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Acridgen",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_69",
      "inputs": [
        {
          "resource": "Cuprium Canister (Xiragen)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Canister",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Xiragen",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_70",
      "inputs": [
        {
          "resource": "Cuprium Canister (Heavy Xiragen)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Canister",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Heavy Xiragen",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_71",
      "inputs": [
        {
          "resource": "Cuprium Canister (Inergen)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Canister",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Inergen",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_72",
      "inputs": [
        {
          "resource": "Cuprium Canister (Cuprium Gas)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Canister",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Cuprium Gas",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_73",
      "inputs": [
        {
          "resource": "Cuprium Canister (Hetonite Gas)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Canister",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Hetonite Gas",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_74",
      "inputs": [
        {
          "resource": "Cuprium Canister (Pyrrolite Gas)",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Canister",
          "kind": "item",
          "rate": 30
        },
        {
          "resource": "Pyrrolite Gas",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    }
  ]
};

/** Solid-Gas Transmuting Unit */
export const SOLID_GAS_TRANSMUTING_UNIT: MachineType = {
  "name": "Solid-Gas Transmuting Unit",
  "category": "Production II",
  "width": 5,
  "height": 5,
  "ports": [],
  "edgeBands": {},
  "recipes": [
    {
      "id": "recipe_1",
      "inputs": [
        {
          "resource": "Xiragen",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Xiranite",
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
          "resource": "Heavy Xiragen",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Heavy Xiranite",
          "kind": "item",
          "rate": 12
        }
      ],
      "time": 10
    },
    {
      "id": "recipe_3",
      "inputs": [
        {
          "resource": "Cuprium Gas",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium",
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
          "resource": "Hetonite Gas",
          "kind": "fluid",
          "rate": 60
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite",
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
          "resource": "Pyrrolite Gas",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Pyrrolite",
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
          "resource": "Xiranite",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Xiragen",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_7",
      "inputs": [
        {
          "resource": "Heavy Xiranite",
          "kind": "item",
          "rate": 12
        }
      ],
      "outputs": [
        {
          "resource": "Heavy Xiragen",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 10
    },
    {
      "id": "recipe_8",
      "inputs": [
        {
          "resource": "Cuprium",
          "kind": "item",
          "rate": 60
        }
      ],
      "outputs": [
        {
          "resource": "Cuprium Gas",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_9",
      "inputs": [
        {
          "resource": "Hetonite",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Hetonite Gas",
          "kind": "fluid",
          "rate": 60
        }
      ],
      "time": 2
    },
    {
      "id": "recipe_10",
      "inputs": [
        {
          "resource": "Pyrrolite",
          "kind": "item",
          "rate": 30
        }
      ],
      "outputs": [
        {
          "resource": "Pyrrolite Gas",
          "kind": "fluid",
          "rate": 30
        }
      ],
      "time": 2
    }
  ]
};

