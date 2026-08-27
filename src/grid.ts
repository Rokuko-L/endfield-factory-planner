import type { MachineInstance, MachineType } from './types.ts';

/**
 * Manages tile occupancy on a fixed-size grid. Each cell holds the id of the
 * machine occupying it, or null when empty. Indices are row-major:
 * cells[y][x].
 */
export class Grid {
  private readonly cells: (string | null)[][];

  constructor(public readonly width: number, public readonly height: number) {
    this.cells = Array.from({ length: height }, () =>
      Array<string | null>(width).fill(null),
    );
  }

  /** True if the given tile is inside the grid. */
  isWithinBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  /** The id of the machine at a tile, or null if empty/out of bounds. */
  getOccupancyAt(x: number, y: number): string | null {
    if (!this.isWithinBounds(x, y)) return null;
    return this.cells[y]?.[x] ?? null;
  }

  /** True if every tile of the footprint is in-bounds and unoccupied. */
  canPlace(machine: MachineType, x: number, y: number): boolean {
    for (let dy = 0; dy < machine.height; dy++) {
      for (let dx = 0; dx < machine.width; dx++) {
        if (!this.isWithinBounds(x + dx, y + dy)) return false;
        if (this.getOccupancyAt(x + dx, y + dy) !== null) return false;
      }
    }
    return true;
  }

  /** Fills the machine's footprint tiles with its id. Throws if invalid. */
  placeMachine(machine: MachineInstance): void {
    if (!this.canPlace(machine.type, machine.x, machine.y)) {
      throw new Error(
        `Cannot place '${machine.type.name}' at (${machine.x}, ${machine.y}): ` +
          'footprint out of bounds or overlapping another machine.',
      );
    }
    for (let dy = 0; dy < machine.type.height; dy++) {
      for (let dx = 0; dx < machine.type.width; dx++) {
        this.cells[machine.y + dy]![machine.x + dx] = machine.id;
      }
    }
  }

  /** Clears any tiles occupied by the given machine id. */
  removeMachine(machineId: string): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.cells[y]?.[x] === machineId) {
          this.cells[y]![x] = null;
        }
      }
    }
  }

  /** All occupied tiles as [x, y] pairs. */
  occupiedTiles(): { x: number; y: number }[] {
    const tiles: { x: number; y: number }[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.cells[y]?.[x] !== null) tiles.push({ x, y });
      }
    }
    return tiles;
  }
}