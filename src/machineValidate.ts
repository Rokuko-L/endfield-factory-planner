import type { MachineType, PortDef, Recipe, Side } from './types.ts';

const VALID_SIDES: ReadonlyArray<Side> = ['north', 'east', 'south', 'west'];

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate a list of machine types. Returns an array of errors (empty
 * if valid). Used by the machine editor to gate the "Save" button.
 */
export function validateMachineTypes(types: MachineType[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const names = new Set<string>();

  types.forEach((m, mi) => {
    const prefix = `Machines[${mi}] (${m.name || "?"})`;

    if (!m.name || m.name.trim() === "") {
      errors.push({ field: `${prefix}.name`, message: "Name is required." });
    } else if (names.has(m.name)) {
      errors.push({ field: `${prefix}.name`, message: `Duplicate name "${m.name}".` });
    } else {
      names.add(m.name);
    }

    if (!Number.isInteger(m.width) || m.width < 1 || m.width > 16) {
      errors.push({ field: `${prefix}.width`, message: "Width must be 1..16." });
    }
    if (!Number.isInteger(m.height) || m.height < 1 || m.height > 16) {
      errors.push({ field: `${prefix}.height`, message: "Height must be 1..16." });
    }

    for (const [side, band] of Object.entries(m.edgeBands ?? {})) {
      if (!VALID_SIDES.includes(side as Side)) {
        errors.push({ field: `${prefix}.edgeBands`, message: `Unknown side "${side}".` });
      }
      if (!band) continue;
      if (band.type !== "input" && band.type !== "output") {
        errors.push({ field: `${prefix}.edgeBands.${side}.type`, message: 'Must be "input" or "output".' });
      }
    }

    m.ports.forEach((p, pi) => {
      const pfx = `${prefix}.ports[${pi}]`;
      errors.push(...validatePort(p, pfx));
    });

    m.recipes.forEach((r, ri) => {
      const rfx = `${prefix}.recipes[${ri}]`;
      errors.push(...validateRecipe(r, rfx));
    });
  });

  return errors;
}

function validatePort(p: PortDef, prefix: string): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!p.id) errors.push({ field: `${prefix}.id`, message: "id is required." });
  if (!VALID_SIDES.includes(p.side))
    errors.push({ field: `${prefix}.side`, message: "Invalid side." });
  if (p.type !== "input" && p.type !== "output")
    errors.push({ field: `${prefix}.type`, message: 'Type must be "input" or "output".' });
  if (p.kind !== "item" && p.kind !== "fluid")
    errors.push({ field: `${prefix}.kind`, message: 'Kind must be "item" or "fluid".' });
  if (typeof p.tileIndex !== "number" || p.tileIndex < 0)
    errors.push({ field: `${prefix}.tileIndex`, message: "tileIndex must be ≥ 0." });
  if (typeof p.rate !== "number" || p.rate < 0)
    errors.push({ field: `${prefix}.rate`, message: "rate must be ≥ 0." });
  return errors;
}

function validateRecipe(r: Recipe, prefix: string): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!r.id) errors.push({ field: `${prefix}.id`, message: "id is required." });
  if (r.inputs.length === 0 && r.outputs.length === 0) {
    errors.push({ field: prefix, message: "Recipe has no inputs and no outputs." });
  }
  for (const slot of [...r.inputs, ...r.outputs]) {
    if (!slot.resource) errors.push({ field: `${prefix}`, message: "Slot resource is required." });
    if (slot.kind !== "item" && slot.kind !== "fluid")
      errors.push({ field: `${prefix}`, message: "Slot kind must be item or fluid." });
  }
  return errors;
}
