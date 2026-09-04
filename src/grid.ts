import { effectiveSize } from './geometry.ts';
import type { MachineInstance, MachineType } from './types.ts';

/**
 * Manages tile occupancy on a fixed-size grid. The grid tracks two
 * layers:
 *
 * 1. **Machine occupancy** — each cell holds the id of the machine
 *    occupying it, or null when empty.
 * 2. **Connection occupancy** — each cell holds the id of the single
 *    belt/pipe occupying it, or none when empty. A cell can hold at
 *    most one connection: belts and pipes never overlap or stack.
 *
 * A cell is *free* iff both layers are empty. A cell is *connection-free*
 * iff the machine layer is empty.
 */
export class Grid {
  private readonly machineCells: (string | null)[][];
  private readonly connectionCells: (string | null)[][];

  constructor(public readonly width: number, public readonly height: number) {
    this.machineCells = Array.from({ length: height }, () =>
      Array<string | null>(width).fill(null),
    );
    this.connectionCells = Array.from({ length: height }, () =>
      Array<string | null>(width).fill(null),
    );
  }

  /** True if the given tile is inside the grid. */
  isWithinBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  /** True if the tile is in bounds and has neither a machine nor any connection. */
  isFree(x: number, y: number): boolean {
    if (!this.isWithinBounds(x, y)) return false;
    return this.machineCells[y]?.[x] == null && this.connectionCells[y]?.[x] == null;
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

  /** The id of the connection at a tile, or null if empty/out of bounds. */
  getConnectionAt(x: number, y: number): string | null {
    if (!this.isWithinBounds(x, y)) return null;
    return this.connectionCells[y]?.[x] ?? null;
  }

  /** All connection ids at a tile — zero or one under the no-stacking invariant. */
  getConnectionsAt(x: number, y: number): string[] {
    const id = this.getConnectionAt(x, y);
    return id ? [id] : [];
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
   * tile already holds a machine or a *different* connection — a tile
   * carries at most one belt/pipe.
   */
  placeConnectionTiles(connectionId: string, tiles: { x: number; y: number }[]): void {
    for (const t of tiles) {
      if (!this.canPlaceConnection(t.x, t.y)) {
        throw new Error(
          `Cannot place connection tile at (${t.x}, ${t.y}): cell has a machine.`,
        );
      }
      const occupant = this.connectionCells[t.y]![t.x];
      if (occupant != null && occupant !== connectionId) {
        throw new Error(
          `Cannot place connection tile at (${t.x}, ${t.y}): cell already has a connection.`,
        );
      }
    }
    for (const t of tiles) {
      this.connectionCells[t.y]![t.x] = connectionId;
    }
  }

  /** Clear every tile currently holding the given connection id. */
  removeConnection(connectionId: string): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.connectionCells[y]?.[x] === connectionId) {
          this.connectionCells[y]![x] = null;
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
        if (this.connectionCells[y]?.[x] != null) tiles.push({ x, y });
      }
    }
    return tiles;
  }
}
