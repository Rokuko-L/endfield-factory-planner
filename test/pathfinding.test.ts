import { describe, expect, it } from 'vitest';
import { Grid } from '../src/grid.ts';
import { findPath, findPathMulti, smoothPath } from '../src/pathfinding.ts';
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

  it('finds a straight horizontal path between two points', () => {
    const grid = new Grid(10, 5);
    const path = findPath(grid, { x: 0, y: 2 }, { x: 5, y: 2 });
    expect(path).not.toBeNull();
    // Every tile on the line is included so the renderer can draw a
    // continuous belt/pipe.
    expect(path).toEqual([
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
      { x: 5, y: 2 },
    ]);
  });

  it('finds a straight vertical path between two points', () => {
    const grid = new Grid(5, 10);
    const path = findPath(grid, { x: 2, y: 0 }, { x: 2, y: 7 });
    expect(path).not.toBeNull();
    expect(path).toEqual([
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 2, y: 4 },
      { x: 2, y: 5 },
      { x: 2, y: 6 },
      { x: 2, y: 7 },
    ]);
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

  it('returns a path with optimal Manhattan length on an empty grid', () => {
    const grid = new Grid(20, 20);
    const path = findPath(grid, { x: 0, y: 0 }, { x: 4, y: 3 });
    expect(path).not.toBeNull();
    // Optimal L-shape expanded to every tile: 4 horizontal + 3 vertical
    // = 7 cells, plus a corner that's shared. Total 8 tiles.
    expect(path!.length).toBe(8);
    // The corner should be at the L intersection.
    const corner = path!.find(
      (t) => (t.x === 4 && t.y === 0) || (t.x === 0 && t.y === 3),
    );
    expect(corner).toBeDefined();
  });
});

describe('smoothPath', () => {
  it('returns the path unchanged when shorter than 3 tiles', () => {
    expect(smoothPath([{ x: 0, y: 0 }])).toEqual([{ x: 0, y: 0 }]);
    expect(
      smoothPath([
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ]),
    ).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ]);
  });

  it('drops colinear intermediates on a horizontal run', () => {
    const path = [
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
    ];
    expect(smoothPath(path)).toEqual([
      { x: 0, y: 2 },
      { x: 4, y: 2 },
    ]);
  });

  it('keeps the corner of an L-shaped path', () => {
    const path = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
    ];
    expect(smoothPath(path)).toEqual([
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 2 },
    ]);
  });

  it('keeps a staircase (no three colinear points)', () => {
    const path = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
    ];
    // (0,0)-(1,0)-(1,1) is a corner, (1,0)-(1,1)-(2,1) is a corner, and
    // (1,1)-(2,1)-(2,2) is a corner. None of the triples are colinear,
    // so the path stays the same.
    expect(smoothPath(path)).toEqual(path);
  });

  it('collapses long colinear stretches to a single segment', () => {
    const path = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 4, y: 0 },
      { x: 4, y: 1 },
      { x: 4, y: 2 },
    ];
    expect(smoothPath(path)).toEqual([
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 4, y: 2 },
    ]);
  });
});

describe('findPathMulti (multi-source / multi-target)', () => {
  it('picks the closest start and end when given alternatives', () => {
    // Path from a band of 3 sources on the left to a band of 3 targets
    // on the right, with a wall in the middle and a single gap.
    const grid = new Grid(10, 5);
    for (let y = 0; y < 5; y++) {
      if (y === 2) continue;
      grid.placeMachine(inst(`w${y}`, 5, y));
    }
    const starts = [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ];
    const ends = [
      { x: 8, y: 4 },
      { x: 8, y: 3 },
      { x: 8, y: 2 },
    ];
    const path = findPathMulti(grid, starts, ends);
    expect(path).not.toBeNull();
    expect(path![0]).toEqual({ x: 1, y: 2 });
    expect(path![path!.length - 1]).toEqual({ x: 8, y: 2 });
  });

  it('returns a single-tile path when start and end sets overlap', () => {
    const grid = new Grid(5, 5);
    const path = findPathMulti(
      grid,
      [{ x: 2, y: 2 }, { x: 2, y: 3 }],
      [{ x: 2, y: 2 }, { x: 3, y: 2 }],
    );
    expect(path).toEqual([{ x: 2, y: 2 }]);
  });

  it('returns null when no start cell is free', () => {
    const grid = new Grid(5, 5);
    grid.placeMachine(inst('a', 1, 0));
    grid.placeMachine(inst('b', 1, 1));
    const path = findPathMulti(
      grid,
      [{ x: 1, y: 0 }, { x: 1, y: 1 }],
      [{ x: 4, y: 4 }],
    );
    expect(path).toBeNull();
  });

  it('produces a path with no unnecessary turns', () => {
    const grid = new Grid(20, 5);
    const path = findPathMulti(
      grid,
      [{ x: 0, y: 2 }],
      [{ x: 10, y: 0 }],
    );
    expect(path).not.toBeNull();
    // Optimal L-shape: 10 horizontal + 2 vertical = 12 cells, with a
    // corner shared. The path has at most 13 tiles.
    expect(path!.length).toBeLessThanOrEqual(13);
  });
});