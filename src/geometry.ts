import type { MachineInstance, Orientation, PortDef, Side } from './types.ts';

/** The four side directions in clockwise order, starting at north. */
const SIDE_ORDER: readonly Side[] = ['north', 'east', 'south', 'west'];

/** Steps (dx, dy) in grid space for each side direction. */
const SIDE_DELTA: Readonly<Record<Side, { dx: number; dy: number }>> = {
  north: { dx: 0, dy: -1 },
  east: { dx: 1, dy: 0 },
  south: { dx: 0, dy: 1 },
  west: { dx: -1, dy: 0 },
};

/** How many quarter-turns a given orientation represents. */
const ORIENTATION_QUARTERS: Record<Orientation, number> = {
  0: 0,
  90: 1,
  180: 2,
  270: 3,
};

/**
 * Rotates a side by the given orientation (clockwise). E.g. rotating
 * 'north' by 90° yields 'east'.
 */
export function rotateSide(side: Side, orientation: Orientation): Side {
  const quarters = ORIENTATION_QUARTERS[orientation];
  const idx = SIDE_ORDER.indexOf(side);
  return SIDE_ORDER[(idx + quarters) % SIDE_ORDER.length]!;
}

/**
 * Transforms a port's side and tileIndex through an orientation.
 *
 * The tileIndex runs along the side: left→right for north/south,
 * top→bottom for east/west. When a side rotates to become its own
 * opposite (north↔south, east↔west) the index direction is mirrored.
 * Rotating by 90°/270° swaps the axis the index runs along, so the
 * mirroring length is the machine's other dimension.
 */
export function transformPort(
  port: PortDef,
  machine: Pick<MachineInstance, 'orientation'> &
    Pick<MachineInstance['type'], 'width' | 'height'>,
): { side: Side; tileIndex: number } {
  const { orientation } = machine;
  const side = rotateSide(port.side, orientation);

  // The index direction only flips on half-turn rotations (180°/270°).
  const quarterTurns = ORIENTATION_QUARTERS[orientation];
  const mirrored = quarterTurns >= 2;

  // The length over which the index runs: for a side that started as
  // north/south the index ran along the machine width; for east/west it
  // ran along the height. On a quarter turn that axis becomes the other one.
  const isHorizontalSource = port.side === 'north' || port.side === 'south';
  const sideLength = isHorizontalSource ? machine.width : machine.height;

  if (!mirrored) {
    return { side, tileIndex: port.tileIndex };
  }
  return { side, tileIndex: sideLength - 1 - port.tileIndex };
}

/**
 * Absolute grid coordinates (in tiles) of a single port tile relative to a
 * placed machine, accounting for rotation. The returned tile is the one just
 * outside the machine footprint on the port's side.
 *
 * Because the port tile always sits next to the rotated edge, the index
 * transformation exactly offsets the footprint rotation. Example: an
 * unrotated north port at tileIndex 2 of a 5x5 machine contains the tile
 * directly above tile column 2.
 */
export function getPortTile(
  port: PortDef,
  machine: MachineInstance,
): { x: number; y: number } {
  const { side, tileIndex } = transformPort(port, machine);
  const { width, height, x, y } = machine;
  const dx = SIDE_DELTA[side].dx;
  const dy = SIDE_DELTA[side].dy;

  // For north/south sides the index runs along the width (x); for
  // east/west it runs along the height (y).
  const horizontal = side === 'north' || side === 'south';
  return horizontal
    ? { x: x + tileIndex, y: y + (side === 'north' ? -1 : height) }
    : { x: x + (side === 'east' ? width : -1), y: y + tileIndex };
}