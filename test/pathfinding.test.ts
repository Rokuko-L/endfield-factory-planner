import { describe, expect, it } from 'vitest';
import { Grid } from '../src/grid.ts';
import { findPath } from '../src/pathfinding.ts';
import type { MachineInstance, MachineType } from '../src/types.ts';

const tiny: MachineType = { name: 'T', width: 1, height: 1, ports: [] };

function inst(id: string, x: number, y: number): MachineInstance {
  return { id, type: tiny, x, y, orientation: 0 };
}

describe('findPath', () => {
  it('returns a single-tile path when start equals end', () => {
    const grid = new Grid(5, 5);
    const path = findPath(grid, { x: 2, y: 2 }, { x: 2, y: 2 });
    expect(path).toEqual([{ x: 2, y: 2 }]);
  });

  it('finds a straight horizontal path on an empty grid', () => {
    const grid = new Grid(10, 5);
    const path = findPath(grid, { x: 0, y: 2 }, { x: 5, y: 2 });
    expect(path).not.toBeNull();
    expect(path![0]).toEqual({ x: 0, y: 2 });
    expect(path![path!.length - 1]).toEqual({ x: 5, y: 2 });
    expect(path!.length).toBe(6); // 0..5 inclusive
  });

  it('finds a straight vertical path on an empty grid', () => {
    const grid = new Grid(5, 10);
    const path = findPath(grid, { x: 2, y: 0 }, { x: 2, y: 7 });
    expect(path).not.toBeNull();
    expect(path![0]).toEqual({ x: 2, y: 0 });
    expect(path![path!.length - 1]).toEqual({ x: 2, y: 7 });
    expect(path!.length).toBe(8);
  });

  it('returns null when the start cell is occupied by a machine', () => {
    const grid = new Grid(10, 10);
    grid.placeMachine(inst('a', 2, 2));
    const path = findPath(grid, { x: 2, y: 2 }, { x: 5, y: 5 });
    expect(path).toBeNull();
  });

  it('returns null when the end cell is occupied by a machine', () => {
    const grid = new Grid(10, 10);
    grid.placeMachine(inst('a', 5, 5));
    const path = findPath(grid, { x: 0, y: 0 }, { x: 5, y: 5 });
    expect(path).toBeNull();
  });

  it('routes around a blocking machine', () => {
    const grid = new Grid(10, 5);
    // Block a horizontal strip in the middle: x=1..4 and x=6..9, with
    // a single gap at (5, 2). Start at (0, 2) and end at (9, 0).
    for (let x = 1; x <= 4; x++) {
      grid.placeMachine(inst(`b${x}`, x, 2));
    }
    for (let x = 6; x <= 9; x++) {
      grid.placeMachine(inst(`b${x}`, x, 2));
    }
    const path = findPath(grid, { x: 0, y: 2 }, { x: 9, y: 0 });
    expect(path).not.toBeNull();
    expect(path![0]).toEqual({ x: 0, y: 2 });
    expect(path![path!.length - 1]).toEqual({ x: 9, y: 0 });
    // The path must not pass through any blocked tile.
    for (const tile of path!) {
      const occupied = grid.getOccupancyAt(tile.x, tile.y);
      expect(occupied).toBeNull();
    }
  });

  it('returns null when the destination is fully enclosed', () => {
    const grid = new Grid(6, 6);
    // Enclose (3, 3) with a ring of 1x1 machines.
    for (let x = 2; x <= 4; x++) {
      grid.placeMachine(inst(`t${x}`, x, 2));
      grid.placeMachine(inst(`b${x}`, x, 4));
    }
    grid.placeMachine(inst('l', 2, 3));
    grid.placeMachine(inst('r', 4, 3));
    const path = findPath(grid, { x: 0, y: 0 }, { x: 3, y: 3 });
    expect(path).toBeNull();
  });

  it('respects connection tiles as obstacles', () => {
    const grid = new Grid(10, 5);
    grid.placeConnectionTiles('c1', [
      { x: 5, y: 1 },
      { x: 5, y: 2 },
      { x: 5, y: 3 },
    ]);
    const path = findPath(grid, { x: 0, y: 2 }, { x: 9, y: 2 });
    expect(path).not.toBeNull();
    // The path should not pass through (5, 1), (5, 2), or (5, 3).
    for (const tile of path!) {
      expect(tile.x !== 5 || (tile.y !== 1 && tile.y !== 2 && tile.y !== 3)).toBe(true);
    }
  });

  it('returns the optimal (Manhattan) length when no obstacles exist', () => {
    const grid = new Grid(20, 20);
    const path = findPath(grid, { x: 0, y: 0 }, { x: 4, y: 3 });
    expect(path).not.toBeNull();
    // Manhattan distance from (0,0) to (4,3) is 7; path length is 8.
    expect(path!.length).toBe(8);
  });
});