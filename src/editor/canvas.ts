import { grid, renderer } from './state.ts';

export function eventToTile(e: MouseEvent): { x: number; y: number } | null {
  const canvas = document.querySelector<HTMLCanvasElement>('#grid')!;
  const rect = canvas.getBoundingClientRect();
  const tile = renderer.tilePx;
  const px = Math.floor((e.clientX - rect.left) / tile);
  const py = Math.floor((e.clientY - rect.top) / tile);
  return grid.isWithinBounds(px, py) ? { x: px, y: py } : null;
}
