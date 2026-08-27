import { describe, expect, it } from 'vitest';
import { MINER } from '../src/data.ts';
import { Grid } from '../src/grid.ts';
import type { MachineInstance, MachineType } from '../src/types.ts';

const miner: MachineType = MINER;

function instance(
  id: string,
  x: number,
  y: number,
  type: MachineType = miner,
): MachineInstance {
  return { id, type, x, y, orientation: 0 };
}

describe('Grid', () => {
  it('is empty after construction', () => {
    const grid = new Grid(10, 10);
    expect(grid.occupiedTiles()).toEqual([]);
  });

  it('isWithinBounds is true inside, false outside', () => {
    const grid = new Grid(5, 5);
    expect(grid.isWithinBounds(0, 0)).toBe(true);
    expect(grid.isWithinBounds(4, 4)).toBe(true);
    expect(grid.isWithinBounds(5, 4)).toBe(false);
    expect(grid.isWithinBounds(-1, 0)).toBe(false);
  });

  it('canPlace is true for an empty in-bounds footprint', () => {
    const grid = new Grid(10, 10);
    expect(grid.canPlace(miner, 2, 2)).toBe(true);
  });

  it('canPlace is false when the footprint crosses the right/bottom edge', () => {
    const grid = new Grid(10, 10);
    // 5x5 machine at (0, 5) extends to (4, 9) — within bounds
    expect(grid.canPlace(miner, 0, 5)).toBe(true);
    // 5x5 machine at (0, 6) extends to (4, 10) — past the bottom row 9
    expect(grid.canPlace(miner, 0, 6)).toBe(false);
    // 5x5 machine at (5, 0) extends to (9, 4) — within bounds
    expect(grid.canPlace(miner, 5, 0)).toBe(true);
    // 5x5 machine at (6, 0) extends to (10, 4) — past the right column 9
    expect(grid.canPlace(miner, 6, 0)).toBe(false);
  });

  it('canPlace is false when the footprint overlaps an existing machine', () => {
    const grid = new Grid(10, 10);
    grid.placeMachine(instance('a', 0, 0));
    expect(grid.canPlace(miner, 0, 0)).toBe(false);
    // Footprint corners: a at (0,0) occupies (0..4, 0..4).
    // A new machine at (1, 1) overlaps by 1 tile; at (4, 4) overlaps by 1 tile.
    expect(grid.canPlace(miner, 1, 1)).toBe(false);
    expect(grid.canPlace(miner, 4, 4)).toBe(false);
    // No overlap: a new machine at (5, 0) starts where 'a' ends.
    expect(grid.canPlace(miner, 5, 0)).toBe(true);
  });

  it('placeMachine fills the footprint tiles with the machine id', () => {
    const grid = new Grid(10, 10);
    grid.placeMachine(instance('a', 2, 2));
    // 5x5 footprint: (2..6, 2..6)
    expect(grid.getOccupancyAt(2, 2)).toBe('a');
    expect(grid.getOccupancyAt(6, 6)).toBe('a');
    expect(grid.getOccupancyAt(7, 2)).toBeNull();
    expect(grid.occupiedTiles()).toHaveLength(25);
  });

  it('placeMachine throws on invalid placement', () => {
    const grid = new Grid(10, 10);
    expect(() => grid.placeMachine(instance('a', 0, 0))).not.toThrow();
    expect(() => grid.placeMachine(instance('b', 0, 0))).toThrow();
  });

  it('removeMachine clears all tiles for a given id', () => {
    const grid = new Grid(10, 10);
    grid.placeMachine(instance('a', 0, 0));
    grid.placeMachine(instance('b', 5, 0));
    grid.removeMachine('a');
    expect(grid.occupiedTiles()).toHaveLength(25);
    expect(grid.getOccupancyAt(0, 0)).toBeNull();
    expect(grid.getOccupancyAt(5, 0)).toBe('b');
  });

  it('getOccupancyAt returns null for out-of-bounds tiles', () => {
    const grid = new Grid(5, 5);
    expect(grid.getOccupancyAt(-1, 0)).toBeNull();
    expect(grid.getOccupancyAt(5, 5)).toBeNull();
  });
});