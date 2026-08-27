import { describe, expect, it } from 'vitest';
import { MINER, FURNACE } from '../src/data.ts';
import {
  getAdjacentTile,
  getPortAdjacentTile,
  getPortTile,
  rotateSide,
  transformPort,
} from '../src/geometry.ts';
import type { MachineInstance, Orientation, PortDef } from '../src/types.ts';

/** Test fixture: a single north-side port on a 5x5 machine. */
const MINER_PORT: PortDef = {
  id: 'test_north_port',
  type: 'output',
  side: 'north',
  tileIndex: 2,
  resource: 'Iron Ore',
  kind: 'item',
  rate: 30,
};

const miner = (orientation: Orientation, x = 0, y = 0): MachineInstance => ({
  id: `m-${orientation}`,
  type: MINER,
  x,
  y,
  orientation,
});

const furnace = (orientation: Orientation, x = 0, y = 0): MachineInstance => ({
  id: `f-${orientation}`,
  type: FURNACE,
  x,
  y,
  orientation,
});

describe('rotateSide', () => {
  it('maps each side at each orientation correctly', () => {
    const cases: Array<[Parameters<typeof rotateSide>[0], Orientation, ReturnType<typeof rotateSide>]> = [
      ['north', 0, 'north'],
      ['north', 90, 'east'],
      ['north', 180, 'south'],
      ['north', 270, 'west'],
      ['east', 90, 'south'],
      ['east', 180, 'west'],
      ['south', 90, 'west'],
      ['west', 90, 'north'],
    ];
    for (const [side, orientation, expected] of cases) {
      expect(rotateSide(side, orientation)).toBe(expected);
    }
  });
});

describe('transformPort (Miner, 5x5, north tileIndex 2)', () => {
  it('keeps north/north and the index at 0°', () => {
    const result = transformPort(MINER_PORT, miner(0));
    expect(result).toEqual({ side: 'north', tileIndex: 2 });
  });

  it('rotates to east with the index carried as a height axis (length 5)', () => {
    const result = transformPort(MINER_PORT, miner(90));
    expect(result).toEqual({ side: 'east', tileIndex: 2 });
  });

  it('rotates to south and mirrors the index on the 5-wide side', () => {
    const result = transformPort(MINER_PORT, miner(180));
    expect(result.side).toBe('south');
    expect(result.tileIndex).toBe(5 - 1 - 2);
  });

  it('rotates to west and mirrors the index on the 5-tall side', () => {
    const result = transformPort(MINER_PORT, miner(270));
    expect(result.side).toBe('west');
    expect(result.tileIndex).toBe(5 - 1 - 2);
  });
});

describe('getPortTile', () => {
  it('returns the tile just outside the north edge for an unrotated Miner at (0,0)', () => {
    expect(getPortTile(MINER_PORT, miner(0, 0, 0))).toEqual({ x: 2, y: -1 });
  });

  it('returns the east edge tile after a 90° rotation', () => {
    expect(getPortTile(MINER_PORT, miner(90, 0, 0))).toEqual({ x: 5, y: 2 });
  });

  it('returns the south edge tile after a 180° rotation, mirrored column', () => {
    expect(getPortTile(MINER_PORT, miner(180, 0, 0))).toEqual({
      x: 5 - 1 - 2,
      y: 5,
    });
  });

  it('returns the west edge tile after a 270° rotation, mirrored row', () => {
    expect(getPortTile(MINER_PORT, miner(270, 0, 0))).toEqual({
      x: -1,
      y: 5 - 1 - 2,
    });
  });

  it('honors the machine origin offset', () => {
    expect(getPortTile(MINER_PORT, miner(0, 10, 20))).toEqual({
      x: 10 + 2,
      y: 20 - 1,
    });
  });
});

describe('Furnace ports stay on their rotated edges', () => {
  // The Furnace's south-edge item input is now an edge band, not a
  // PortDef. We use a representative fixture port on the south side
  // to exercise the rotation math end-to-end.
  const FURNACE_SOUTH_PORT: PortDef = {
    id: 'test_south_input',
    type: 'input',
    side: 'south',
    tileIndex: 2,
    resource: 'Iron Ore',
    kind: 'item',
    rate: 30,
  };

  it('keeps a south-side port on the south at 0°', () => {
    const tile = getPortTile(FURNACE_SOUTH_PORT, furnace(0, 0, 0));
    expect(tile).toEqual({ x: 2, y: 5 });
  });

  it('puts a south-side port on the west edge at 90°', () => {
    const tile = getPortTile(FURNACE_SOUTH_PORT, furnace(90, 0, 0));
    expect(tile).toEqual({ x: -1, y: 2 });
  });

  it('rotates the Furnace water input to the north at 90°', () => {
    const waterPort = FURNACE.ports.find((p) => p.id === 'water_input')!;
    const tile = getPortTile(waterPort, furnace(90, 0, 0));
    expect(tile).toEqual({ x: 2, y: -1 });
  });
});

describe('getAdjacentTile (rotated frame)', () => {
  it('returns the cell just north of the machine for a north-side port', () => {
    const tile = getAdjacentTile('north', 2, miner(0, 0, 0));
    expect(tile).toEqual({ x: 2, y: -1 });
  });

  it('returns the cell just south of the machine for a south-side port', () => {
    const tile = getAdjacentTile('south', 2, miner(0, 0, 0));
    expect(tile).toEqual({ x: 2, y: 5 });
  });

  it('returns the cell just west of the machine for a west-side port', () => {
    const tile = getAdjacentTile('west', 2, miner(0, 0, 0));
    expect(tile).toEqual({ x: -1, y: 2 });
  });

  it('returns the cell just east of the machine for an east-side port', () => {
    const tile = getAdjacentTile('east', 2, miner(0, 0, 0));
    expect(tile).toEqual({ x: 5, y: 2 });
  });

  it('honors the machine origin offset', () => {
    expect(getAdjacentTile('south', 1, miner(0, 10, 20))).toEqual({
      x: 10 + 1,
      y: 20 + 5,
    });
  });
});

describe('getPortAdjacentTile (single-tile port on a placed machine)', () => {
  it('matches getPortTile for the Furnace water input at 0°', () => {
    const waterPort = FURNACE.ports.find((p) => p.id === 'water_input')!;
    expect(getPortAdjacentTile(waterPort, furnace(0, 0, 0))).toEqual(
      getPortTile(waterPort, furnace(0, 0, 0)),
    );
    expect(getPortAdjacentTile(waterPort, furnace(0, 0, 0))).toEqual({
      x: -1,
      y: 2,
    });
  });

  it('rotates the Furnace water input adjacent tile through 90°', () => {
    const waterPort = FURNACE.ports.find((p) => p.id === 'water_input')!;
    expect(getPortAdjacentTile(waterPort, furnace(90, 0, 0))).toEqual({
      x: 2,
      y: -1,
    });
  });
});