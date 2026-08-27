import { describe, expect, it } from 'vitest';
import { MINER, FURNACE } from '../src/data.ts';
import { getPortTile, transformPort, rotateSide } from '../src/geometry.ts';
import type { MachineInstance, Orientation } from '../src/types.ts';

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
    const result = transformPort(MINER.ports[0]!, miner(0));
    expect(result).toEqual({ side: 'north', tileIndex: 2 });
  });

  it('rotates to east with the index carried as a height axis (length 5)', () => {
    const result = transformPort(MINER.ports[0]!, miner(90));
    expect(result).toEqual({ side: 'east', tileIndex: 2 });
  });

  it('rotates to south and mirrors the index on the 5-wide side', () => {
    const result = transformPort(MINER.ports[0]!, miner(180));
    expect(result.side).toBe('south');
    expect(result.tileIndex).toBe(5 - 1 - 2);
  });

  it('rotates to west and mirrors the index on the 5-tall side', () => {
    const result = transformPort(MINER.ports[0]!, miner(270));
    expect(result.side).toBe('west');
    expect(result.tileIndex).toBe(5 - 1 - 2);
  });
});

describe('getPortTile', () => {
  it('returns the tile just outside the north edge for an unrotated Miner at (0,0)', () => {
    expect(getPortTile(MINER.ports[0]!, miner(0, 0, 0))).toEqual({ x: 2, y: -1 });
  });

  it('returns the east edge tile after a 90° rotation', () => {
    expect(getPortTile(MINER.ports[0]!, miner(90, 0, 0))).toEqual({ x: 5, y: 2 });
  });

  it('returns the south edge tile after a 180° rotation, mirrored column', () => {
    expect(getPortTile(MINER.ports[0]!, miner(180, 0, 0))).toEqual({
      x: 5 - 1 - 2,
      y: 5,
    });
  });

  it('returns the west edge tile after a 270° rotation, mirrored row', () => {
    expect(getPortTile(MINER.ports[0]!, miner(270, 0, 0))).toEqual({
      x: -1,
      y: 5 - 1 - 2,
    });
  });

  it('honors the machine origin offset', () => {
    expect(getPortTile(MINER.ports[0]!, miner(0, 10, 20))).toEqual({
      x: 10 + 2,
      y: 20 - 1,
    });
  });
});

describe('Furnace ports stay on their rotated edges', () => {
  it('keeps iron-ore input on the south at 0°', () => {
    const port = FURNACE.ports.find((p) => p.id === 'iron_ore_input')!;
    const tile = getPortTile(port, furnace(0, 0, 0));
    expect(tile).toEqual({ x: 2, y: 5 });
  });

  it('puts iron-ore input on the west edge at 90°', () => {
    const port = FURNACE.ports.find((p) => p.id === 'iron_ore_input')!;
    const tile = getPortTile(port, furnace(90, 0, 0));
    expect(tile).toEqual({ x: -1, y: 2 });
  });
});