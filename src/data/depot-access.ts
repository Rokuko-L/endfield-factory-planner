import type { MachineType } from "../types.ts";

/** Conduit Inlet */
export const CONDUIT_INLET: MachineType = {
  "name": "Conduit Inlet",
  "category": "Depot Access",
  "width": 3,
  "height": 3,
  "noPower": true,
  "ports": [
    {
      "id": "port_1",
      "type": "input",
      "side": "east",
      "tileIndex": 1,
      "resource": "",
      "kind": "fluid",
      "rate": 30
    }
  ],
  "edgeBands": {},
  "recipes": []
};

/** Conduit Inlet Manifold */
export const CONDUIT_INLET_MANIFOLD: MachineType = {
  "name": "Conduit Inlet Manifold",
  "category": "Depot Access",
  "width": 3,
  "height": 5,
  "noPower": true,
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
    }
  ],
  "edgeBands": {},
  "recipes": []
};

/** Conduit Outlet */
export const CONDUIT_OUTLET: MachineType = {
  "name": "Conduit Outlet",
  "category": "Depot Access",
  "width": 3,
  "height": 3,
  "noPower": true,
  "ports": [
    {
      "id": "port_1",
      "type": "output",
      "side": "east",
      "tileIndex": 1,
      "resource": "",
      "kind": "fluid",
      "rate": 30
    }
  ],
  "recipes": [],
  "edgeBands": {}
};

/** Conduit Outlet Manifold */
export const CONDUIT_OUTLET_MANIFOLD: MachineType = {
  "name": "Conduit Outlet Manifold",
  "category": "Depot Access",
  "width": 3,
  "height": 5,
  "noPower": true,
  "ports": [
    {
      "id": "port_1",
      "type": "output",
      "side": "east",
      "tileIndex": 1,
      "resource": "",
      "kind": "fluid",
      "rate": 30
    },
    {
      "id": "port_2",
      "type": "output",
      "side": "east",
      "tileIndex": 3,
      "resource": "",
      "kind": "fluid",
      "rate": 30
    }
  ],
  "edgeBands": {},
  "recipes": []
};

/** Depot Bus Port */
export const DEPOT_BUS_PORT: MachineType = {
  "name": "Depot Bus Port",
  "category": "Depot Access",
  "width": 4,
  "height": 4,
  "noPower": true,
  "ports": [],
  "edgeBands": {},
  "recipes": []
};

/** Depot Bus Section */
export const DEPOT_BUS_SECTION: MachineType = {
  "name": "Depot Bus Section",
  "category": "Depot Access",
  "width": 4,
  "height": 8,
  "noPower": true,
  "ports": [],
  "edgeBands": {},
  "recipes": []
};

/** Depot Loader */
export const DEPOT_LOADER: MachineType = {
  "name": "Depot Loader",
  "category": "Depot Access",
  "width": 3,
  "height": 1,
  "noPower": true,
  "ports": [
    {
      "id": "port_1",
      "type": "input",
      "side": "north",
      "tileIndex": 1,
      "resource": "",
      "kind": "item",
      "rate": 30
    }
  ],
  "edgeBands": {},
  "recipes": []
};

/** Depot Unloader */
export const DEPOT_UNLOADER: MachineType = {
  "name": "Depot Unloader",
  "category": "Depot Access",
  "width": 3,
  "height": 1,
  "noPower": true,
  "ports": [
    {
      "id": "port_1",
      "type": "output",
      "side": "north",
      "tileIndex": 1,
      "resource": "",
      "kind": "item",
      "rate": 30
    }
  ],
  "edgeBands": {},
  "recipes": []
};

/** Fluid Tank */
export const FLUID_TANK: MachineType = {
  "name": "Fluid Tank",
  "category": "Depot Access",
  "width": 3,
  "height": 3,
  "noPower": true,
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
      "type": "output",
      "side": "west",
      "tileIndex": 1,
      "resource": "",
      "kind": "fluid",
      "rate": 30
    }
  ],
  "edgeBands": {},
  "recipes": []
};

/** Gas Tank */
export const GAS_TANK: MachineType = {
  "name": "Gas Tank",
  "category": "Depot Access",
  "width": 3,
  "height": 3,
  "noPower": true,
  "ports": [],
  "edgeBands": {},
  "recipes": []
};

/** Protocol Stash */
export const PROTOCOL_STASH: MachineType = {
  "name": "Protocol Stash",
  "category": "Depot Access",
  "width": 3,
  "height": 3,
  "noPower": true,
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
  "recipes": []
};
