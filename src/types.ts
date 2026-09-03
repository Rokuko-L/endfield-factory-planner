/**
 * Core domain types for the factory layout planner.
 *
 * All coordinates are grid-tile coordinates with a top-left origin
 * (0,0) and y increasing downward.
 */

/** Machine rotation in degrees, clockwise from facing north. */
export type Orientation = 0 | 90 | 180 | 270;

/** The four grid sides a port can sit on. */
export type Side = 'north' | 'east' | 'south' | 'west';

/** Whether a port feeds a machine or is fed by it. */
export type PortType = 'input' | 'output';

/** The category of resource a port carries. */
export type ResourceKind = 'item' | 'fluid';

/**
 * A port definition. Positions are relative to the machine's *unrotated*
 * (facing north) orientation.
 */
export interface PortDef {
  id: string;
  type: PortType;
  side: Side;
  tileIndex: number;
  /** Carried resource name or '' for "any" (generic side — e.g. Reactor Crucible). */
  resource: string;
  kind: ResourceKind;
  rate: number;
}

/**
 * An edge band describes a port zone that spans the *entire* edge of a
 * machine. Used for the in-game style where, e.g., the south edge of a
 * furnace is "the input side" rather than a single tile.
 */
export interface EdgeBand {
  type: PortType;
  resourceKind: ResourceKind;
  /** Specific resource name or ''/absent for "any" (generic side — e.g. Reactor Crucible). */
  resource?: string;
}

/** A recipe: a single transformation that takes N inputs and produces
 *  M outputs. Recipes are matched by checking whether the connection's
 *  source resource+kind appears in the inputs; the matched recipe's
 *  outputs tell the rest of the editor what the destination produces.
 *
 *  Recipes are per-machine, not per-port-cell: any input port on the
 *  machine that matches the source resource will trigger the recipe.
 */
export interface RecipeSlot {
  resource: string;
  kind: ResourceKind;
  /** Per-minute for items, per-second for fluids. */
  rate: number;
}

export interface Recipe {
  /** Unique id within the machine, e.g. "ferrium_ore_to_ferrium". */
  id: string;
  inputs: RecipeSlot[];
  outputs: RecipeSlot[];
  /** Optional craft time in seconds. Informational. */
  time?: number;
}

/** A machine footprint definition, without any placement info. */
export interface MachineType {
  /** Display name, e.g. "Miner". */
  name: string;
  /** Facility category, e.g. "Production I" or "Logistics Units".
   *  Used to group machines in the editor UI. */
  category?: string;
  /** Footprint width in tiles. */
  width: number;
  /** Footprint height in tiles. */
  height: number;
  /** Power area-of-effect radius in tiles from the machine footprint edge.
   *  When set, this machine provides power to other machines within range. */
  powerRange?: number;
  /** When true, this machine does not require power (always shows as on). */
  noPower?: boolean;
  /** Per-port data, kept for future per-tile routing. May be empty when
   *  the visual is driven entirely by `edgeBands`. */
  ports: PortDef[];
  /** Per-edge port bands. The renderer paints every cell along each
   *  declared side. Optional; machines without bands render no ports. */
  edgeBands?: Partial<Record<Side, EdgeBand>>;
  /** Recipes the machine can perform. Empty array means "passthrough"
   *  (e.g. a Transport Belt just moves items along without changing
   *  them). The connection editor uses these to validate connections:
   *  a connection from a source that matches one of these recipes'
   *  inputs is "valid" and the recipe's outputs are produced. */
  recipes: Recipe[];
}

/** A single machine placed in the layout. */
export interface MachineInstance {
  /** Unique identifier, e.g. a UUID. */
  id: string;
  type: MachineType;
  /** Top-left footprint tile X coordinate. */
  x: number;
  /** Top-left footprint tile Y coordinate. */
  y: number;
  /** 0 = facing north; 90 = east; 180 = south; 270 = west. */
  orientation: Orientation;
}

/**
 * A connection between two machine ports. Today a `Connection` represents
 * a belt (item) or pipe (fluid) that occupies a routed path of grid tiles.
 */
export interface Connection {
  id: string;
  fromMachineId: string;
  fromPortId: string;
  toMachineId: string;
  toPortId: string;
  kind: ResourceKind;
  /** Resource name carried, e.g. "Iron Ore". */
  resource: string;
  /** If the destination machine has a recipe matching this connection's
   *  resource+kind, the id of that recipe. Otherwise null (the
   *  connection is "passthrough" — items flow but no transformation
   *  is implied). */
  matchedRecipeId: string | null;
  /** The routed path, inclusive of the port-adjacent endpoint tiles. */
  path: { x: number; y: number }[];
  /** Throughput in items/min (belts) or items/sec (pipes). */
  throughput: number;
}

/** The full state of a layout: placed machines + their connections. */
export interface Layout {
  machines: MachineInstance[];
  connections: Connection[];
}