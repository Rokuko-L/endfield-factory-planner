import { describe, expect, it } from "vitest";
import { matchRecipe, reconcileConnectionRecipes } from "../src/recipes.ts";
import type { Connection, MachineInstance, MachineType } from "../src/types.ts";

function machine(
  id: string,
  recipes: MachineType["recipes"],
  x = 0,
  y = 0,
): MachineInstance {
  const t: MachineType = {
    name: "Test",
    width: 3,
    height: 3,
    ports: [],
    recipes,
  };
  return { id, type: t, x, y, orientation: 0 };
}

describe("matchRecipe", () => {
  it("finds a recipe whose input matches the source resource+kind", () => {
    const m = machine("furnace", [
      {
        id: "iron_to_plate",
        inputs: [{ resource: "Iron Ore", kind: "item", rate: 30 }],
        outputs: [{ resource: "Iron Plate", kind: "item", rate: 15 }],
      },
    ]);
    const r = matchRecipe(m, "Iron Ore", "item");
    expect(r?.id).toBe("iron_to_plate");
  });

  it("returns null when no recipe matches", () => {
    const m = machine("furnace", [
      {
        id: "iron_to_plate",
        inputs: [{ resource: "Iron Ore", kind: "item", rate: 30 }],
        outputs: [{ resource: "Iron Plate", kind: "item", rate: 15 }],
      },
    ]);
    expect(matchRecipe(m, "Copper Ore", "item")).toBeNull();
  });

  it("returns null when kind matches but resource does not", () => {
    const m = machine("furnace", [
      {
        id: "iron_to_plate",
        inputs: [{ resource: "Iron Ore", kind: "item", rate: 30 }],
        outputs: [],
      },
    ]);
    expect(matchRecipe(m, "Iron Plate", "item")).toBeNull();
  });

  it("matches a fluid input on a fluid-output recipe", () => {
    const m = machine("refinery", [
      {
        id: "water_to_sewage",
        inputs: [{ resource: "Water", kind: "fluid", rate: 1 }],
        outputs: [{ resource: "Sewage", kind: "fluid", rate: 1 }],
      },
    ]);
    const r = matchRecipe(m, "Water", "fluid");
    expect(r?.id).toBe("water_to_sewage");
  });

  it("returns the first recipe that matches when several do", () => {
    const m = machine("m", [
      {
        id: "first",
        inputs: [{ resource: "Ore", kind: "item", rate: 1 }],
        outputs: [],
      },
      {
        id: "second",
        inputs: [{ resource: "Ore", kind: "item", rate: 1 }],
        outputs: [],
      },
    ]);
    expect(matchRecipe(m, "Ore", "item")?.id).toBe("first");
  });
});

describe("reconcileConnectionRecipes", () => {
  it("populates matchedRecipeId for connections whose destination has a matching recipe", () => {
    const furnace = machine("furnace", [
      {
        id: "iron_to_plate",
        inputs: [{ resource: "Iron Ore", kind: "item", rate: 30 }],
        outputs: [{ resource: "Iron Plate", kind: "item", rate: 15 }],
      },
    ]);
    const conns: Connection[] = [
      {
        id: "c1",
        fromMachineId: "miner",
        fromPortId: "p",
        toMachineId: "furnace",
        toPortId: "p",
        kind: "item",
        resource: "Iron Ore",
        matchedRecipeId: null,
        path: [],
      },
    ];
    const out = reconcileConnectionRecipes(conns, [furnace]);
    expect(out[0]!.matchedRecipeId).toBe("iron_to_plate");
  });

  it("leaves matchedRecipeId null when no recipe matches", () => {
    const furnace = machine("furnace", [
      {
        id: "iron_to_plate",
        inputs: [{ resource: "Iron Ore", kind: "item", rate: 30 }],
        outputs: [],
      },
    ]);
    const conns: Connection[] = [
      {
        id: "c1",
        fromMachineId: "miner",
        fromPortId: "p",
        toMachineId: "furnace",
        toPortId: "p",
        kind: "item",
        resource: "Copper Ore",
        matchedRecipeId: null,
        path: [],
      },
    ];
    const out = reconcileConnectionRecipes(conns, [furnace]);
    expect(out[0]!.matchedRecipeId).toBeNull();
  });

  it("leaves existing matchedRecipeId intact", () => {
    const conns: Connection[] = [
      {
        id: "c1",
        fromMachineId: "miner",
        fromPortId: "p",
        toMachineId: "furnace",
        toPortId: "p",
        kind: "item",
        resource: "Iron Ore",
        matchedRecipeId: "manual",
        path: [],
      },
    ];
    const out = reconcileConnectionRecipes(conns, []);
    expect(out[0]!.matchedRecipeId).toBe("manual");
  });

  it("leaves the connection alone when destination machine is gone", () => {
    const conns: Connection[] = [
      {
        id: "c1",
        fromMachineId: "miner",
        fromPortId: "p",
        toMachineId: "missing",
        toPortId: "p",
        kind: "item",
        resource: "Iron Ore",
        matchedRecipeId: null,
        path: [],
      },
    ];
    const out = reconcileConnectionRecipes(conns, []);
    expect(out[0]!.matchedRecipeId).toBeNull();
  });
});
