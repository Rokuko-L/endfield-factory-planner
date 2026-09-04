import type { Connection, MachineInstance, MachineType, Recipe, ResourceKind } from './types.ts';

/**
 * Find the recipe on `target` that consumes a connection's
 * `resource+kind` as an input. Returns the matching recipe, or null
 * if no recipe matches (the connection is then a passthrough).
 *
 * Match rule: a recipe matches if the connection's resource+kind
 * appears as one of its inputs. We do not yet check input ratios
 * or the destination's other required inputs — that's a future
 * enhancement for rate-based validation.
 */
export function matchRecipe(
  target: MachineInstance,
  resource: string,
  kind: ResourceKind,
): Recipe | null {
  for (const recipe of target.type.recipes) {
    for (const input of recipe.inputs) {
      if (input.resource === resource && input.kind === kind) {
        return recipe;
      }
    }
  }
  return null;
}

/**
 * Pick the recipe that the current inbound connections actually feed:
 * the one with the most distinct input slots receiving a matching
 * connection. Machines like the Packaging Unit share inputs across
 * recipes (Amethyst Part feeds both Industrial Explosive and LC Valley
 * Battery), so "first recipe containing the resource" picks the wrong
 * craft — counting fed slots disambiguates.
 */
export function selectBestRecipe(
  type: MachineType,
  inbound: Connection[],
): Recipe | null {
  let best: Recipe | null = null;
  let bestFed = 0;
  for (const recipe of type.recipes) {
    const fed = recipe.inputs.filter((slot) =>
      inbound.some((c) => c.resource === slot.resource && c.kind === slot.kind),
    ).length;
    if (fed > bestFed) {
      best = recipe;
      bestFed = fed;
    }
  }
  return best;
}

/**
 * Walk all connections, look up each destination's recipe, and
 * populate `matchedRecipeId` if not already set. Returns the new
 * array. Connections whose destination machine no longer exists
 * (e.g. it was removed) are left as-is with `matchedRecipeId: null`.
 */
export function reconcileConnectionRecipes(
  connections: Connection[],
  machines: MachineInstance[],
): Connection[] {
  const byId = new Map<string, MachineInstance>();
  for (const m of machines) byId.set(m.id, m);
  return connections.map((c) => {
    if (c.matchedRecipeId !== null) return c;
    const target = byId.get(c.toMachineId);
    if (!target) return c;
    const recipe = matchRecipe(target, c.resource, c.kind);
    return { ...c, matchedRecipeId: recipe ? recipe.id : null };
  });
}