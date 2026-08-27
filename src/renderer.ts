import type { Grid } from './grid.ts';
import type { MachineInstance, PortDef, Side } from './types.ts';
import { rotateSide, transformPort } from './geometry.ts';

/**
 * Color pairs for edge bands and single-tile ports. Each entry is a
 * { stroke, fill } pair; the fill is a translucent tint of the stroke
 * for the "subtle fill" look.
 */
const BAND_COLORS: Record<string, { stroke: string; fill: string }> = {
  'item-input': { stroke: '#f87171', fill: 'rgba(248,113,113,0.20)' },
  'item-output': { stroke: '#4fd1a5', fill: 'rgba(79,209,165,0.20)' },
  'fluid-input': { stroke: '#6ea8ff', fill: 'rgba(110,168,255,0.20)' },
  'fluid-output': { stroke: '#6ea8ff', fill: 'rgba(110,168,255,0.20)' },
};

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
    const { x, y } = m;
    const { width, height } = m.type;

    // Footprint.
    ctx.fillStyle = '#39404f';
    ctx.fillRect(x * t, y * t, width * t, height * t);
    ctx.strokeStyle = '#8a93a8';
    ctx.lineWidth = 2;
    ctx.strokeRect(x * t + 1, y * t + 1, width * t - 2, height * t - 2);

    // Edge bands (full-edge port zones, rotated with the machine).
    for (const [side, band] of Object.entries(m.type.edgeBands ?? {})) {
      if (!band) continue;
      this.drawEdgeBand(ctx, m, side as Side, band);
    }

    // Single-tile ports (e.g. fluid inputs in the center of an edge).
    for (const port of m.type.ports) {
      this.drawPortTile(ctx, m, port);
    }

    // Machine name label (centered, unrotated). Drawn last so it sits
    // on top of any port fills.
    ctx.fillStyle = '#e6e8ee';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(m.type.name, (x + width / 2) * t, (y + height / 2) * t);
  }

  /**
   * Paint a full-edge band: subtle fill on every cell along the side,
   * plus a colored stroke on the outer edge of each cell.
   */
  private drawEdgeBand(
    ctx: CanvasRenderingContext2D,
    m: MachineInstance,
    unrotatedSide: Side,
    band: { type: 'input' | 'output'; resourceKind: 'item' | 'fluid' },
  ): void {
    const t = this.tilePx;
    const side = rotateSide(unrotatedSide, m.orientation);
    const palette = BAND_COLORS[`${band.resourceKind}-${band.type}`];
    if (!palette) return;
    const { width, height } = m.type;
    const { x, y } = m;

    // Subtle fill on each cell of the side.
    ctx.fillStyle = palette.fill;
    switch (side) {
      case 'north':
        ctx.fillRect(x * t, y * t, width * t, t);
        break;
      case 'south':
        ctx.fillRect(x * t, (y + height - 1) * t, width * t, t);
        break;
      case 'west':
        ctx.fillRect(x * t, y * t, t, height * t);
        break;
      case 'east':
        ctx.fillRect((x + width - 1) * t, y * t, t, height * t);
        break;
    }

    // Colored stroke on the outer edge of each cell in the band.
    ctx.strokeStyle = palette.stroke;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < (side === 'north' || side === 'south' ? width : height); i++) {
      switch (side) {
        case 'north':
          ctx.moveTo((x + i) * t + 0.5, y * t + 1.5);
          ctx.lineTo((x + i + 1) * t - 0.5, y * t + 1.5);
          break;
        case 'south':
          ctx.moveTo((x + i) * t + 0.5, (y + height) * t - 1.5);
          ctx.lineTo((x + i + 1) * t - 0.5, (y + height) * t - 1.5);
          break;
        case 'west':
          ctx.moveTo(x * t + 1.5, (y + i) * t + 0.5);
          ctx.lineTo(x * t + 1.5, (y + i + 1) * t - 0.5);
          break;
        case 'east':
          ctx.moveTo((x + width) * t - 1.5, (y + i) * t + 0.5);
          ctx.lineTo((x + width) * t - 1.5, (y + i + 1) * t - 0.5);
          break;
      }
    }
    ctx.stroke();
  }

  /**
   * Paint a single-tile port marker. The marker is the cell on the
   * inside of the machine footprint at the port's position, with a
   * subtle fill and a colored stroke on its outer edge.
   */
  private drawPortTile(
    ctx: CanvasRenderingContext2D,
    m: MachineInstance,
    port: PortDef,
  ): void {
    const t = this.tilePx;
    const palette = BAND_COLORS[`${port.kind}-${port.type}`];
    if (!palette) return;
    const { side, tileIndex } = transformPort(port, m);
    const { width, height } = m.type;
    const { x, y } = m;

    // Cell origin in canvas pixels.
    let cx: number;
    let cy: number;
    switch (side) {
      case 'north':
        cx = x + tileIndex;
        cy = y;
        break;
      case 'south':
        cx = x + tileIndex;
        cy = y + height - 1;
        break;
      case 'west':
        cx = x;
        cy = y + tileIndex;
        break;
      case 'east':
        cx = x + width - 1;
        cy = y + tileIndex;
        break;
    }

    // Subtle fill.
    ctx.fillStyle = palette.fill;
    ctx.fillRect(cx * t, cy * t, t, t);

    // Outer-edge stroke.
    ctx.strokeStyle = palette.stroke;
    ctx.lineWidth = 3;
    ctx.beginPath();
    switch (side) {
      case 'north':
        ctx.moveTo(cx * t + 0.5, cy * t + 1.5);
        ctx.lineTo((cx + 1) * t - 0.5, cy * t + 1.5);
        break;
      case 'south':
        ctx.moveTo(cx * t + 0.5, (cy + 1) * t - 1.5);
        ctx.lineTo((cx + 1) * t - 0.5, (cy + 1) * t - 1.5);
        break;
      case 'west':
        ctx.moveTo(cx * t + 1.5, cy * t + 0.5);
        ctx.lineTo(cx * t + 1.5, (cy + 1) * t - 0.5);
        break;
      case 'east':
        ctx.moveTo((cx + 1) * t - 1.5, cy * t + 0.5);
        ctx.lineTo((cx + 1) * t - 1.5, (cy + 1) * t - 0.5);
        break;
    }
    ctx.stroke();
  }
}