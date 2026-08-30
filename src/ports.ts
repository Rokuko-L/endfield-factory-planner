import { getAdjacentTile, transformPort } from './geometry.ts';
import { rotateSide } from './geometry.ts';
import { resourceForBand } from './bands.ts';
import type { MachineInstance, Side } from './types.ts';
import type { PortCell } from './layout.ts';

export function allPortCells(machines: MachineInstance[]): PortCell[] {
  const out: PortCell[] = [];
  for (const m of machines) {
    for (const [unrotatedSide, band] of Object.entries(m.type.edgeBands ?? {})) {
      if (!band) continue;
      const side = rotateSide(unrotatedSide as Side, m.orientation);
      const count = side === 'north' || side === 'south' ? m.type.width : m.type.height;
      const adjacentTiles: { x: number; y: number }[] = [];
      for (let i = 0; i < count; i++) adjacentTiles.push(getAdjacentTile(side, i, m));
      for (let i = 0; i < count; i++) {
        out.push({
          machine: m,
          side,
          cellIndex: i,
          kind: band.resourceKind,
          resource: resourceForBand(m, unrotatedSide as Side, band.resourceKind),
          portId: `band:${unrotatedSide}:${i}`,
          cell: adjacentTiles[i]!,
          adjacentTiles,
        });
      }
    }
    for (const port of m.type.ports) {
      const { side, tileIndex } = transformPort(port, m);
      out.push({
        machine: m,
        side,
        cellIndex: tileIndex,
        kind: port.kind,
        resource: port.resource,
        portId: `port:${port.id}`,
        cell: getAdjacentTile(side, tileIndex, m),
        adjacentTiles: [getAdjacentTile(side, tileIndex, m)],
      });
    }
  }
  return out;
}

export function pickPortAt(
  tile: { x: number; y: number },
  machines: MachineInstance[],
): PortCell | null {
  let best: PortCell | null = null;
  let bestDist = Infinity;
  for (const p of allPortCells(machines)) {
    const dx = p.cell.x - tile.x;
    const dy = p.cell.y - tile.y;
    const d = dx * dx + dy * dy;
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }
  if (best && bestDist > 9) return null;
  return best;
}
