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
  /** Unique id, e.g. "iron_ore_input". */
  id: string;
  type: PortType;
  /** Which side of the machine the port sits on (unrotated). */
  side: Side;
  /** 0-based index along that side: left→right for north/south, top→bottom for east/west. */
  tileIndex: number;
  /** Resource name, e.g. "Iron Ore", "Water". */
  resource: string;
  kind: ResourceKind;
  /** Rate: per minute for items, per second for fluids. */
  rate: number;
}

/**
 * An edge band describes a port zone that spans the *entire* edge of a
 * machine. Used for the in-game style where, e.g., the south edge of a
 * furnace is "the input side" rather than a single tile.
 */
export interface EdgeBand {
  /** Whether this edge receives or emits. */
  type: PortType;
  /** The category of resource flowing across this edge. */
  resourceKind: ResourceKind;
}

/** A machine footprint definition, without any placement info. */
export interface MachineType {
  /** Display name, e.g. "Miner". */
  name: string;
  /** Footprint width in tiles. */
  width: number;
  /** Footprint height in tiles. */
  height: number;
  /** Per-port data, kept for future per-tile routing. May be empty when
   *  the visual is driven entirely by `edgeBands`. */
  ports: PortDef[];
  /** Per-edge port bands. The renderer paints every cell along each
   *  declared side. Optional; machines without bands render no ports. */
  edgeBands?: Partial<Record<Side, EdgeBand>>;
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

/** A connection between two machines (reserved for a later phase). */
export interface Connection {
  id: string;
  fromMachineId: string;
  fromPortId: string;
  toMachineId: string;
  toPortId: string;
  kind: ResourceKind;
}

/** The full state of a layout: placed machines + their connections. */
export interface Layout {
  machines: MachineInstance[];
  connections: Connection[];
}