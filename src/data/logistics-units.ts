import type { MachineType } from "../types.ts";

/** Belt Bridge */
export const BELT_BRIDGE: MachineType = {
  "name": "Belt Bridge",
  "category": "Logistics Units",
  "width": 1,
  "height": 1,
  "noPower": true,
  "ports": [
    {
      "id": "port_1",
      "type": "output",
      "side": "north",
      "tileIndex": 0,
      "resource": "",
      "kind": "item",
      "rate": 30
    },
    {
      "id": "port_2",
      "type": "input",
      "side": "south",
      "tileIndex": 0,
      "resource": "",
      "kind": "item",
      "rate": 30
    }
  ],
  "edgeBands": {},
  "recipes": []
};

/** Converger */
export const CONVERGER: MachineType = {
  "name": "Converger",
  "category": "Logistics Units",
  "width": 1,
  "height": 1,
  "noPower": true,
  "ports": [
    {
      "id": "port_1",
      "type": "output",
      "side": "north",
      "tileIndex": 0,
      "resource": "",
      "kind": "item",
      "rate": 30
    },
    {
      "id": "port_2",
      "type": "input",
      "side": "east",
      "tileIndex": 0,
      "resource": "",
      "kind": "item",
      "rate": 30
    },
    {
      "id": "port_3",
      "type": "input",
      "side": "south",
      "tileIndex": 0,
      "resource": "",
      "kind": "item",
      "rate": 30
    },
    {
      "id": "port_4",
      "type": "input",
      "side": "west",
      "tileIndex": 0,
      "resource": "",
      "kind": "item",
      "rate": 30
    }
  ],
  "edgeBands": {},
  "recipes": []
};

/** Item Control Port */
export const ITEM_CONTROL_PORT: MachineType = {
  "name": "Item Control Port",
  "category": "Logistics Units",
  "width": 1,
  "height": 1,
  "noPower": true,
  "ports": [
    {
      "id": "port_1",
      "type": "output",
      "side": "north",
      "tileIndex": 0,
      "resource": "",
      "kind": "item",
      "rate": 30
    },
    {
      "id": "port_2",
      "type": "input",
      "side": "south",
      "tileIndex": 0,
      "resource": "",
      "kind": "item",
      "rate": 30
    }
  ],
  "edgeBands": {},
  "recipes": []
};

/** Pipe Bridge */
export const PIPE_BRIDGE: MachineType = {
  "name": "Pipe Bridge",
  "category": "Logistics Units",
  "width": 1,
  "height": 1,
  "noPower": true,
  "ports": [
    {
      "id": "port_1",
      "type": "output",
      "side": "north",
      "tileIndex": 0,
      "resource": "",
      "kind": "fluid",
      "rate": 30
    },
    {
      "id": "port_2",
      "type": "input",
      "side": "south",
      "tileIndex": 0,
      "resource": "",
      "kind": "fluid",
      "rate": 30
    }
  ],
  "edgeBands": {},
  "recipes": []
};

/** Pipe Control Port */
export const PIPE_CONTROL_PORT: MachineType = {
  "name": "Pipe Control Port",
  "category": "Logistics Units",
  "width": 1,
  "height": 1,
  "noPower": true,
  "ports": [
    {
      "id": "port_1",
      "type": "output",
      "side": "north",
      "tileIndex": 0,
      "resource": "",
      "kind": "fluid",
      "rate": 30
    },
    {
      "id": "port_2",
      "type": "input",
      "side": "south",
      "tileIndex": 0,
      "resource": "",
      "kind": "fluid",
      "rate": 30
    }
  ],
  "edgeBands": {},
  "recipes": []
};

/** Pipe Converger */
export const PIPE_CONVERGER: MachineType = {
  "name": "Pipe Converger",
  "category": "Logistics Units",
  "width": 1,
  "height": 1,
  "noPower": true,
  "ports": [
    {
      "id": "port_1",
      "type": "output",
      "side": "north",
      "tileIndex": 0,
      "resource": "",
      "kind": "item",
      "rate": 30
    },
    {
      "id": "port_2",
      "type": "input",
      "side": "east",
      "tileIndex": 0,
      "resource": "",
      "kind": "item",
      "rate": 30
    },
    {
      "id": "port_3",
      "type": "input",
      "side": "south",
      "tileIndex": 0,
      "resource": "",
      "kind": "item",
      "rate": 30
    },
    {
      "id": "port_4",
      "type": "input",
      "side": "west",
      "tileIndex": 0,
      "resource": "",
      "kind": "item",
      "rate": 30
    }
  ],
  "edgeBands": {},
  "recipes": []
};

/** Pipe Splitter */
export const PIPE_SPLITTER: MachineType = {
  "name": "Pipe Splitter",
  "category": "Logistics Units",
  "width": 1,
  "height": 1,
  "noPower": true,
  "ports": [
    {
      "id": "port_1",
      "type": "output",
      "side": "north",
      "tileIndex": 0,
      "resource": "",
      "kind": "fluid",
      "rate": 30
    },
    {
      "id": "port_2",
      "type": "output",
      "side": "east",
      "tileIndex": 0,
      "resource": "",
      "kind": "fluid",
      "rate": 30
    },
    {
      "id": "port_3",
      "type": "output",
      "side": "west",
      "tileIndex": 0,
      "resource": "",
      "kind": "fluid",
      "rate": 30
    },
    {
      "id": "port_4",
      "type": "input",
      "side": "south",
      "tileIndex": 0,
      "resource": "",
      "kind": "fluid",
      "rate": 30
    }
  ],
  "edgeBands": {},
  "recipes": []
};

/** Splitter */
export const SPLITTER: MachineType = {
  "name": "Splitter",
  "category": "Logistics Units",
  "width": 1,
  "height": 1,
  "noPower": true,
  "ports": [
    {
      "id": "port_1",
      "type": "output",
      "side": "north",
      "tileIndex": 0,
      "resource": "",
      "kind": "item",
      "rate": 30
    },
    {
      "id": "port_2",
      "type": "output",
      "side": "east",
      "tileIndex": 0,
      "resource": "",
      "kind": "item",
      "rate": 30
    },
    {
      "id": "port_3",
      "type": "output",
      "side": "west",
      "tileIndex": 0,
      "resource": "",
      "kind": "item",
      "rate": 30
    },
    {
      "id": "port_4",
      "type": "input",
      "side": "south",
      "tileIndex": 0,
      "resource": "",
      "kind": "item",
      "rate": 30
    }
  ],
  "edgeBands": {},
  "recipes": []
};

