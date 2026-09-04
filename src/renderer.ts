import type { Grid } from './grid.ts';
import type { Connection, MachineInstance, PortDef, Side } from './types.ts';
import { rotateSide, transformPort, effectiveSize } from './geometry.ts';
import { powerAoe, isPowered } from './power.ts';

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

/** Connection fill + stroke by kind. */
const CONNECTION_COLORS: Record<'item' | 'fluid', { stroke: string; fill: string }> = {
  item: { stroke: '#f59e0b', fill: 'rgba(245,158,11,0.55)' },
  fluid: { stroke: '#6ea8ff', fill: 'rgba(110,168,255,0.55)' },
};

const GRID_LINE = 'rgba(255,255,255,0.06)';
const EMPTY_TILE = 'rgba(255,255,255,0.04)';
const HOVER_TILE = 'rgba(110,168,255,0.12)';
const INVALID_FLASH = 'rgba(248,113,113,0.25)';
const DRAFT_SOURCE_FILL = 'rgba(245,158,11,0.85)';
const DRAFT_SOURCE_STROKE = '#fde68a';

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
   * @param machines Placed machines.
   * @param connections Routed connections.
   * @param previewFootprint Footprint rect to highlight as placement preview,
   *   or null. `valid` picks the color (green when placeable, red otherwise).
   * @param invalidFlash Top-left tile whose footprint failed placement, or null.
   * @param draftSource Tile of the picked source port (in connection mode), or null.
   * @param draftPath Path returned by A* during preview, or null.
   * @param powerPreviewId Machine id to show power AoE for, or null.
   */
  draw(
    machines: MachineInstance[],
    connections: Connection[],
    previewFootprint: { x: number; y: number; w: number; h: number; valid: boolean } | null,
    invalidFlash: { x: number; y: number; w: number; h: number } | null,
    draftSource: { x: number; y: number } | null,
    draftPath: { x: number; y: number }[] | null,
    powerPreviewId: string | null = null,
  ): void {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawTiles(ctx, previewFootprint, invalidFlash);
    this.drawConnections(ctx, connections);
    for (const m of machines) this.drawMachine(ctx, m);
    this.drawPowerAoe(ctx, machines, powerPreviewId);
    this.drawPowerStatus(ctx, machines);
    this.drawDraft(ctx, draftSource, draftPath);
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
    const { width: rawW, height: rawH } = m.type;
    const isRot = m.orientation === 90 || m.orientation === 270;
    const width = isRot ? rawH : rawW;
    const height = isRot ? rawW : rawH;

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
    const isRot = m.orientation === 90 || m.orientation === 270;
    const width = isRot ? m.type.height : m.type.width;
    const height = isRot ? m.type.width : m.type.height;
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
    const { x, y } = m;
    const isRot = m.orientation === 90 || m.orientation === 270;
    const effW = isRot ? m.type.height : m.type.width;
    const effH = isRot ? m.type.width : m.type.height;

    let cx: number;
    let cy: number;
    switch (side) {
      case 'north':
        cx = x + tileIndex;
        cy = y;
        break;
      case 'south':
        cx = x + tileIndex;
        cy = y + effH - 1;
        break;
      case 'west':
        cx = x;
        cy = y + tileIndex;
        break;
      case 'east':
        cx = x + effW - 1;
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

  /**
   * Draw the power AoE overlay for the selected power machine.
   * Shows a translucent yellow highlight over the area of effect.
   */
  private drawPowerAoe(
    ctx: CanvasRenderingContext2D,
    machines: MachineInstance[],
    powerPreviewId: string | null,
  ): void {
    if (!powerPreviewId) return;
    const source = machines.find((m) => m.id === powerPreviewId);
    if (!source) return;
    const aoe = powerAoe(source);
    if (!aoe) return;

    const t = this.tilePx;
    ctx.fillStyle = 'rgba(250,204,21,0.15)';
    ctx.fillRect(aoe.x * t, aoe.y * t, aoe.w * t, aoe.h * t);

    ctx.strokeStyle = 'rgba(250,204,21,0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(aoe.x * t + 1, aoe.y * t + 1, aoe.w * t - 2, aoe.h * t - 2);
    ctx.setLineDash([]);
  }

  /**
   * Draw power status indicator on each machine.
   * Green dot = powered, red dot = unpowered.
   */
  private drawPowerStatus(ctx: CanvasRenderingContext2D, machines: MachineInstance[]): void {
    const t = this.tilePx;
    for (const m of machines) {
      const powered = isPowered(m, machines);
      const { width } = effectiveSize(m.type, m.orientation);

      // Indicator position: top-right corner of machine
      const cx = (m.x + width) * t - 6;
      const cy = m.y * t + 6;
      const r = 4;

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = powered ? '#4ade80' : '#f87171';
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  private drawConnections(ctx: CanvasRenderingContext2D, connections: Connection[]): void {
    const t = this.tilePx;
    for (const c of connections) {
      const palette = CONNECTION_COLORS[c.kind];
      const isPipe = c.kind === 'fluid';
      // Pipes draw smaller so belts show through when they overlap
      const inset = isPipe ? t * 0.2 : 0;
      const size = t - inset * 2;
      ctx.fillStyle = palette.fill;
      ctx.strokeStyle = palette.stroke;
      ctx.lineWidth = 2;
      for (let i = 0; i < c.path.length; i++) {
        const tile = c.path[i]!;
        const px = tile.x * t + inset;
        const py = tile.y * t + inset;
        ctx.fillRect(px, py, size, size);
        ctx.strokeRect(px + 1, py + 1, size - 2, size - 2);
        const dir = this.directionAt(c.path, i);
        if (!dir) continue;
        const cx = (tile.x + 0.5) * t;
        const cy = (tile.y + 0.5) * t;
        const s = (isPipe ? t * 0.2 : t * 0.34);
        ctx.fillStyle = palette.stroke;
        ctx.beginPath();
        ctx.moveTo(cx + dir.dx * s * 0.5, cy + dir.dy * s * 0.5);
        ctx.lineTo(cx - dir.dx * s * 0.28 + dir.dy * s * 0.28, cy - dir.dy * s * 0.28 - dir.dx * s * 0.28);
        ctx.lineTo(cx - dir.dx * s * 0.28 - dir.dy * s * 0.28, cy - dir.dy * s * 0.28 + dir.dx * s * 0.28);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = palette.fill;
        ctx.strokeStyle = palette.stroke;
      }
    }
  }

  private directionAt(path: { x: number; y: number }[], i: number): { dx: number; dy: number } | null {
    if (path.length < 2) return null;
    if (i < path.length - 1) {
      const a = path[i]!;
      const b = path[i + 1]!;
      return { dx: Math.sign(b.x - a.x), dy: Math.sign(b.y - a.y) };
    }
    const a = path[path.length - 2]!;
    const b = path[path.length - 1]!;
    return { dx: Math.sign(b.x - a.x), dy: Math.sign(b.y - a.y) };
  }

  /**
   * Paint the in-progress connection draft: the picked source tile
   * (highlighted) and the A*-returned path (a translucent preview).
   */
  private drawDraft(
    ctx: CanvasRenderingContext2D,
    source: { x: number; y: number } | null,
    path: { x: number; y: number }[] | null,
  ): void {
    const t = this.tilePx;
    if (source) {
      ctx.fillStyle = DRAFT_SOURCE_FILL;
      ctx.fillRect(source.x * t, source.y * t, t, t);
      ctx.strokeStyle = DRAFT_SOURCE_STROKE;
      ctx.lineWidth = 3;
      ctx.strokeRect(source.x * t + 1, source.y * t + 1, t - 2, t - 2);
    }
    if (path && path.length > 0) {
      ctx.fillStyle = 'rgba(253,230,138,0.45)';
      for (let i = 0; i < path.length; i++) {
        const tile = path[i]!;
        ctx.fillRect(tile.x * t, tile.y * t, t, t);
        const dir = this.directionAt(path, i);
        if (!dir) continue;
        const cx = (tile.x + 0.5) * t;
        const cy = (tile.y + 0.5) * t;
        const s = t * 0.3;
        ctx.fillStyle = 'rgba(120,90,0,0.95)';
        ctx.beginPath();
        ctx.moveTo(cx + dir.dx * s * 0.5, cy + dir.dy * s * 0.5);
        ctx.lineTo(cx - dir.dx * s * 0.28 + dir.dy * s * 0.28, cy - dir.dy * s * 0.28 - dir.dx * s * 0.28);
        ctx.lineTo(cx - dir.dx * s * 0.28 - dir.dy * s * 0.28, cy - dir.dy * s * 0.28 + dir.dx * s * 0.28);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(253,230,138,0.45)';
      }
    }
  }
}