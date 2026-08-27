import type { Grid } from './grid.ts';
import type { MachineInstance } from './types.ts';
import { getPortTile } from './geometry.ts';

/** Color used to draw each port type. */
const PORT_COLORS: Record<string, string> = {
  input: '#f87171', // red
  output: '#4fd1a5', // green
};
/** Fluid ports render as blue regardless of input/output. */
const FLUID_COLOR = '#6ea8ff';

const GRID_LINE = 'rgba(255,255,255,0.06)';
const EMPTY_TILE = 'rgba(255,255,255,0.04)';
const HOVER_TILE = 'rgba(110,168,255,0.12)';
const INVALID_FLASH = 'rgba(248,113,113,0.25)';

/**
 * Draws the grid and all placed machines to a canvas backed by a
 * device-pixel-ratio-scaled bitmap.
 */
export class Renderer {
  private readonly _tilePx: number;

  /** Pixel size of a single tile, as exposed for event-to-grid conversion. */
  get tilePx(): number {
    return this._tilePx;
  }

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly grid: Grid,
    tilePx = 28,
  ) {
    this._tilePx = tilePx;
  }

  /** Resize the backing store for the current device pixel ratio. */
  resize(): void {
    const dpr = window.devicePixelRatio || 1;
    const cssW = this.grid.width * this.tilePx;
    const cssH = this.grid.height * this.tilePx;
    this.canvas.style.width = `${cssW}px`;
    this.canvas.style.height = `${cssH}px`;
    this.canvas.width = Math.round(cssW * dpr);
    this.canvas.height = Math.round(cssH * dpr);
    const ctx = this.canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /**
   * Redraw the entire scene.
   * @param previewFootprint Footprint rect to highlight as placement preview,
   *   or null. `valid` picks the color (green when placeable, red otherwise).
   * @param invalidFlash Top-left tile whose footprint failed placement, or null.
   */
  draw(
    machines: MachineInstance[],
    previewFootprint: { x: number; y: number; w: number; h: number; valid: boolean } | null,
    invalidFlash: { x: number; y: number; w: number; h: number } | null,
  ): void {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    const t = this.tilePx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawTiles(ctx, previewFootprint, invalidFlash);
    for (const m of machines) this.drawMachine(ctx, m);
  }

  private drawTiles(
    ctx: CanvasRenderingContext2D,
    previewFootprint: { x: number; y: number; w: number; h: number; valid: boolean } | null,
    invalidFlash: { x: number; y: number; w: number; h: number } | null,
  ): void {
    const t = this.tilePx;
    const w = this.grid.width;
    const h = this.grid.height;

    // Fill the odd/even tile pattern for visibility.
    ctx.fillStyle = EMPTY_TILE;
    ctx.fillRect(0, 0, w * t, h * t);

    // Placement footprint preview under the cursor.
    if (previewFootprint) {
      ctx.fillStyle = previewFootprint.valid ? HOVER_TILE : INVALID_FLASH;
      ctx.fillRect(
        previewFootprint.x * t,
        previewFootprint.y * t,
        previewFootprint.w * t,
        previewFootprint.h * t,
      );
    }

    // Red flash on an invalid click placement.
    if (invalidFlash) {
      ctx.fillStyle = INVALID_FLASH;
      ctx.fillRect(
        invalidFlash.x * t,
        invalidFlash.y * t,
        invalidFlash.w * t,
        invalidFlash.h * t,
      );
    }

    // Grid lines.
    ctx.strokeStyle = GRID_LINE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= w; x++) {
      ctx.moveTo(x * t + 0.5, 0);
      ctx.lineTo(x * t + 0.5, h * t);
    }
    for (let y = 0; y <= h; y++) {
      ctx.moveTo(0, y * t + 0.5);
      ctx.lineTo(w * t, y * t + 0.5);
    }
    ctx.stroke();
  }

  private drawMachine(ctx: CanvasRenderingContext2D, m: MachineInstance): void {
    const t = this.tilePx;
    const { x, y, width, height } = m.type;

    // Footprint.
    ctx.fillStyle = '#39404f';
    ctx.fillRect(x * t, y * t, width * t, height * t);
    ctx.strokeStyle = '#8a93a8';
    ctx.lineWidth = 2;
    ctx.strokeRect(x * t + 1, y * t + 1, width * t - 2, height * t - 2);

    // Machine name label (centered, unrotated).
    ctx.fillStyle = '#e6e8ee';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(m.type.name, (x + width / 2) * t, (y + height / 2) * t);

    // Ports.
    for (const port of m.type.ports) {
      const tile = getPortTile(port, m);
      ctx.fillStyle =
        port.kind === 'fluid' ? FLUID_COLOR : PORT_COLORS[port.type] ?? '#fff';
      const inset = t * 0.25;
      ctx.fillRect(
        tile.x * t + inset,
        tile.y * t + inset,
        t - inset * 2,
        t - inset * 2,
      );
    }
  }
}