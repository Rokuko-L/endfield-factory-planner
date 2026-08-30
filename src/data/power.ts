import type { MachineType } from "../types.ts";

/** Electric Pylon — passthrough, no I/O */
export const ELECTRIC_PYLON: MachineType = {
  "name": "Electric Pylon",
  "category": "Power",
  "width": 5,
  "height": 5,
  "ports": [],
  "edgeBands": {},
  "recipes": []
};

/** Relay Tower — passthrough, no I/O */
export const RELAY_TOWER: MachineType = {
  "name": "Relay Tower",
  "category": "Power",
  "width": 5,
  "height": 5,
  "ports": [],
  "edgeBands": {},
  "recipes": []
};

/** Thermal Bank — 6 recipes */
export const THERMAL_BANK: MachineType = {
  "name": "Thermal Bank",
  "category": "Power",
  "width": 5,
  "height": 5,
  "ports": [],
  "edgeBands": {},
  "recipes": [
    {
      "id": "recipe_1",
      "inputs": [
        {
          "resource": "Originium Ore",
          "kind": "item",
          "rate": 7.5
        }
      ],
      "outputs": [
        {
          "resource": "Power",
          "kind": "item",
          "rate": 50
        }
      ],
      "time": 8
    },
    {
      "id": "recipe_2",
      "inputs": [
        {
          "resource": "LC Valley Battery",
          "kind": "item",
          "rate": 1.5
        }
      ],
      "outputs": [
        {
          "resource": "Power",
          "kind": "item",
          "rate": 220
        }
      ],
      "time": 40
    },
    {
      "id": "recipe_3",
      "inputs": [
        {
          "resource": "SC Valley Battery",
          "kind": "item",
          "rate": 1.5
        }
      ],
      "outputs": [
        {
          "resource": "Power",
          "kind": "item",
          "rate": 420
        }
      ],
      "time": 40
    },
    {
      "id": "recipe_4",
      "inputs": [
        {
          "resource": "HC Valley Battery",
          "kind": "item",
          "rate": 1.5
        }
      ],
      "outputs": [
        {
          "resource": "Power",
          "kind": "item",
          "rate": 1100
        }
      ],
      "time": 40
    },
    {
      "id": "recipe_5",
      "inputs": [
        {
          "resource": "LC Wuling Battery",
          "kind": "item",
          "rate": 1.5
        }
      ],
      "outputs": [
        {
          "resource": "Power",
          "kind": "item",
          "rate": 1600
        }
      ],
      "time": 40
    },
    {
      "id": "recipe_6",
      "inputs": [
        {
          "resource": "SC Wuling Battery",
          "kind": "item",
          "rate": 1.5
        }
      ],
      "outputs": [
        {
          "resource": "Power",
          "kind": "item",
          "rate": 3200
        }
      ],
      "time": 40
    }
  ]
};

/** Xiranite Pylon — passthrough, no I/O */
export const XIRANITE_PYLON: MachineType = {
  "name": "Xiranite Pylon",
  "category": "Power",
  "width": 5,
  "height": 5,
  "ports": [],
  "edgeBands": {},
  "recipes": []
};

/** Xiranite Relay — passthrough, no I/O */
export const XIRANITE_RELAY: MachineType = {
  "name": "Xiranite Relay",
  "category": "Power",
  "width": 5,
  "height": 5,
  "ports": [],
  "edgeBands": {},
  "recipes": []
};
