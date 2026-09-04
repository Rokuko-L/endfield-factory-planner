import { effectiveSize } from './geometry.ts';
import type { MachineInstance, MachineType } from './types.ts';

/**
 * Manages tile occupancy on a fixed-size grid. The grid tracks two
 * layers:
 *
 * 1. **Machine occupancy** — each cell holds the id of the machine
 *    occupying it, or null when empty.
 * 2. **Connection occupancy** — each cell holds the ids of the belts/
 *    pipes on it. A tile carries at most two connections, and only as
 *    a perpendicular crossing (over/under pass) — same-direction
 *    overlap is rejected where the paths are known
 *    (`connections.ts` validates direction; the grid is direction-
 *    blind and only caps the count).
 *
 * A cell is *free* iff both layers are empty. A cell is *connection-free*
 * iff the machine layer is empty.
 */
export class Grid {
  private readonly machineCells: (string | null)[][];
  private readonly connectionCells: string[][][];

  constructor(public readonly width: number, public readonly height: number) {
    this.machineCells = Array.from({ length: height }, () =>
      Array<string | null>(width).fill(null),
    );
    this.connectionCells = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => [] as string[]),
    );
  }

  /** True if the given tile is inside the grid. */
  isWithinBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  /** True if the tile is in bounds and has neither a machine nor any connection. */
  isFree(x: number, y: number): boolean {
    if (!this.isWithinBounds(x, y)) return false;
    return this.machineCells[y]?.[x] == null && (this.connectionCells[y]?.[x]?.length ?? 0) === 0;
  }

  /** True if the tile is in bounds and has no machine (or connection). */
  isConnectionFree(x: number, y: number): boolean {
    if (!this.isWithinBounds(x, y)) return false;
    return this.machineCells[y]?.[x] == null;
  }

  /** The id of the machine at a tile, or null if empty/out of bounds. */
  getOccupancyAt(x: number, y: number): string | null {
    if (!this.isWithinBounds(x, y)) return null;
    return this.machineCells[y]?.[x] ?? null;
  }

  /** The id of the first connection at a tile, or null if empty/out of bounds. */
  getConnectionAt(x: number, y: number): string | null {
    const ids = this.getConnectionsAt(x, y);
    return ids[0] ?? null;
  }

  /** All connection ids at a tile — up to two (a perpendicular crossing). */
  getConnectionsAt(x: number, y: number): string[] {
    if (!this.isWithinBounds(x, y)) return [];
    return this.connectionCells[y]?.[x] ?? [];
  }

  /** True if every tile of the machine's footprint is in bounds and unoccupied by machines or connections. */
  canPlace(machine: MachineType, x: number, y: number): boolean {
    return this.canPlaceWithOrientation(machine, x, y, 0);
  }

  canPlaceWithOrientation(
    machine: MachineType,
    x: number,
    y: number,
    orientation: import('./types.ts').Orientation,
  ): boolean {
    const { width, height } = effectiveSize(machine, orientation);
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        if (!this.isFree(x + dx, y + dy)) return false;
      }
    }
    return true;
  }

  /** True if the single tile is in bounds and has no machine. */
  canPlaceConnection(x: number, y: number): boolean {
    return this.isConnectionFree(x, y);
  }

  /** Fills the machine's footprint tiles with its id. Throws on collision. */
  placeMachine(machine: MachineInstance): void {
    if (!this.canPlaceWithOrientation(machine.type, machine.x, machine.y, machine.orientation)) {
      throw new Error(
        `Cannot place '${machine.type.name}' at (${machine.x}, ${machine.y}): ` +
          'footprint out of bounds or overlapping another machine or connection.',
      );
    }
    const { width, height } = effectiveSize(machine.type, machine.orientation);
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        this.machineCells[machine.y + dy]![machine.x + dx] = machine.id;
      }
    }
  }

  /** Clears any tiles occupied by the given machine id. */
  removeMachine(machineId: string): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.machineCells[y]?.[x] === machineId) {
          this.machineCells[y]![x] = null;
        }
      }
    }
  }

  /**
   * Mark the given tiles as occupied by the connection. Throws if any
   * tile has a machine, already holds this connection, or already
   * crosses two lines — a tile carries at most two connections, and
   * direction legality (perpendicular only) is enforced by the caller
   * that knows the paths.
   */
  placeConnectionTiles(connectionId: string, tiles: { x: number; y: number }[]): void {
    for (const t of tiles) {
      if (!this.canPlaceConnection(t.x, t.y)) {
        throw new Error(
          `Cannot place connection tile at (${t.x}, ${t.y}): cell has a machine.`,
        );
      }
      const cell = this.connectionCells[t.y]![t.x]!;
      if (cell.includes(connectionId)) {
        throw new Error(
          `Cannot place connection tile at (${t.x}, ${t.y}): connection already covers the tile.`,
        );
      }
      if (cell.length >= 2) {
        throw new Error(
          `Cannot place connection tile at (${t.x}, ${t.y}): cell already crosses two connections.`,
        );
      }
    }
    for (const t of tiles) {
      const cell = this.connectionCells[t.y]![t.x]!;
      if (!cell.includes(connectionId)) cell.push(connectionId);
    }
  }

  /** Clear every tile currently holding the given connection id. */
  removeConnection(connectionId: string): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.connectionCells[y]![x]!;
        const idx = cell.indexOf(connectionId);
        if (idx !== -1) {
          cell.splice(idx, 1);
        }
      }
    }
  }

  /** All occupied tiles as [x, y] pairs (machines only). */
  occupiedTiles(): { x: number; y: number }[] {
    const tiles: { x: number; y: number }[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.machineCells[y]?.[x] !== null) tiles.push({ x, y });
      }
    }
    return tiles;
  }

  /** All connection-occupied tiles as [x, y] pairs. */
  connectionTiles(): { x: number; y: number }[] {
    const tiles: { x: number; y: number }[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if ((this.connectionCells[y]?.[x]?.length ?? 0) > 0) tiles.push({ x, y });
      }
    }
    return tiles;
  }
}
