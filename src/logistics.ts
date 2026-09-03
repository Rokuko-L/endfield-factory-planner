import type { Connection, MachineInstance, MachineType } from './types.ts';

/** Max throughput for belts (items/min) and pipes (items/sec). */
const MAX_THROUGHPUT: Record<'item' | 'fluid', number> = {
  item: 30,
  fluid: 2,
};

/**
 * Get the direction of a connection at a specific tile.
 * Returns {dx, dy} indicating the flow direction, or null if unknown.
 */
export function directionAtTile(
  conn: Connection,
  tile: { x: number; y: number },
): { dx: number; dy: number } | null {
  const idx = conn.path.findIndex((t) => t.x === tile.x && t.y === tile.y);
  if (idx === -1) return null;
  if (idx < conn.path.length - 1) {
    const a = conn.path[idx]!;
    const b = conn.path[idx + 1]!;
    return { dx: Math.sign(b.x - a.x), dy: Math.sign(b.y - a.y) };
  }
  if (idx > 0) {
    const a = conn.path[idx - 1]!;
    const b = conn.path[idx]!;
    return { dx: Math.sign(b.x - a.x), dy: Math.sign(b.y - a.y) };
  }
  return null;
}

/**
 * Check if two connections cross at a given tile (different directions).
 * Returns true if they form a bridge at this tile.
 */
export function isBridgeAt(
  conn1: Connection,
  conn2: Connection,
  tile: { x: number; y: number },
): boolean {
  const dir1 = directionAtTile(conn1, tile);
  const dir2 = directionAtTile(conn2, tile);
  if (!dir1 || !dir2) return false;
  // Bridge if directions are perpendicular (crossing)
  return dir1.dx !== dir2.dx || dir1.dy !== dir2.dy;
}

/**
 * Get all bridge points for a connection (tiles where it crosses another connection).
 */
export function getBridgePoints(
  conn: Connection,
  allConnections: Connection[],
): { x: number; y: number }[] {
  const bridges: { x: number; y: number }[] = [];
  for (const tile of conn.path) {
    for (const other of allConnections) {
      if (other.id === conn.id) continue;
      if (isBridgeAt(conn, other, tile)) {
        bridges.push(tile);
        break;
      }
    }
  }
  return bridges;
}

/**
 * Check if a machine is a splitter (has multiple outputs).
 */
export function isSplitter(machine: MachineInstance): boolean {
  return machine.type.name === 'Splitter' || machine.type.name === 'Pipe Splitter';
}

/**
 * Check if a machine is a converger (has multiple inputs).
 */
export function isConverger(machine: MachineInstance): boolean {
  return machine.type.name === 'Converger' || machine.type.name === 'Pipe Converger';
}

/**
 * Get the output connections from a splitter machine.
 * Only returns connections that actually exist.
 */
export function getSplitterOutputs(
  machine: MachineInstance,
  allConnections: Connection[],
): Connection[] {
  return allConnections.filter((c) => c.fromMachineId === machine.id);
}

/**
 * Get the input connections to a converger machine.
 */
export function getConvergerInputs(
  machine: MachineInstance,
  allConnections: Connection[],
): Connection[] {
  return allConnections.filter((c) => c.toMachineId === machine.id);
}

/**
 * Calculate effective throughput for a connection passing through a splitter.
 * Round-robin distribution: input throughput divided by available outputs.
 * If an output has no belt, it's skipped.
 */
export function getSplitterThroughput(
  conn: Connection,
  machine: MachineInstance,
  allConnections: Connection[],
): number {
  if (!isSplitter(machine)) return conn.throughput;
  const outputs = getSplitterOutputs(machine, allConnections);
  if (outputs.length === 0) return conn.throughput;
  // Round-robin: divide input throughput by number of available outputs
  return Math.floor(conn.throughput / outputs.length);
}

/**
 * Calculate effective throughput for a converger output.
 * Capped at max throughput (30/min for belts, 2/s for pipes).
 * Round-robin: each input gets a turn, but total output is capped.
 */
export function getConvergerThroughput(
  machine: MachineInstance,
  allConnections: Connection[],
): number {
  if (!isConverger(machine)) return 0;
  const inputs = getConvergerInputs(machine, allConnections);
  if (inputs.length === 0) return 0;
  // Sum all input throughputs
  const totalInput = inputs.reduce((sum, c) => sum + c.throughput, 0);
  // Cap at max throughput for this kind
  const kind = inputs[0]!.kind;
  const max = MAX_THROUGHPUT[kind];
  return Math.min(totalInput, max);
}

/**
 * Get the max throughput for a connection kind.
 */
export function maxThroughput(kind: 'item' | 'fluid'): number {
  return MAX_THROUGHPUT[kind];
}

/**
 * Find bridge points where a new path crosses existing connections.
 * Returns tiles where bridges should be auto-placed.
 */
export function findBridgePoints(
  path: { x: number; y: number }[],
  existingConnections: Connection[],
  kind: 'item' | 'fluid',
): { x: number; y: number }[] {
  const bridges: { x: number; y: number }[] = [];
  for (const tile of path) {
    for (const conn of existingConnections) {
      if (conn.kind !== kind) continue; // Only bridge same kind
      if (conn.path.some((t) => t.x === tile.x && t.y === tile.y)) {
        bridges.push(tile);
        break;
      }
    }
  }
  return bridges;
}

/**
 * Split a path at bridge points into segments.
 * Each segment is a sub-path between bridges (or endpoints).
 */
export function splitPathAtBridges(
  path: { x: number; y: number }[],
  bridgePoints: { x: number; y: number }[],
): { x: number; y: number }[][] {
  if (bridgePoints.length === 0) return [path];
  const segments: { x: number; y: number }[][] = [];
  let currentSegment: { x: number; y: number }[] = [];
  for (const tile of path) {
    const isBridge = bridgePoints.some((b) => b.x === tile.x && b.y === tile.y);
    if (isBridge) {
      if (currentSegment.length > 0) {
        segments.push([...currentSegment, tile]);
      }
      currentSegment = [tile];
    } else {
      currentSegment.push(tile);
    }
  }
  if (currentSegment.length > 0) {
    segments.push(currentSegment);
  }
  return segments;
}

/**
 * Get the bridge machine type for a given kind.
 */
export function getBridgeType(kind: 'item' | 'fluid', machineTypes: MachineType[]): MachineType | undefined {
  const name = kind === 'item' ? 'Belt Bridge' : 'Pipe Bridge';
  return machineTypes.find((t) => t.name === name);
}

/**
 * Result of auto-placing bridges.
 */
export interface BridgePlacement {
  machine: MachineInstance;
  connections: Connection[];
  splitExisting: Connection[];
}

/**
 * Auto-place bridges where a new path crosses existing connections.
 * Returns the bridge machines to place and the connections to create.
 */
export function autoPlaceBridges(
  path: { x: number; y: number }[],
  kind: 'item' | 'fluid',
  resource: string,
  existingConnections: Connection[],
  machineTypes: MachineType[],
  nextId: (prefix: string) => string,
): BridgePlacement[] {
  const bridgeType = getBridgeType(kind, machineTypes);
  if (!bridgeType) return [];

  const bridgePoints = findBridgePoints(path, existingConnections, kind);
  if (bridgePoints.length === 0) return [];

  const placements: BridgePlacement[] = [];
  const existingToSplit = new Map<string, Connection>();

  for (const point of bridgePoints) {
    // Check if there's already a bridge at this point
    const hasBridge = placements.some(
      (p) => p.machine.x === point.x && p.machine.y === point.y,
    );
    if (hasBridge) continue;

    // Create bridge machine instance
    const bridgeMachine: MachineInstance = {
      id: nextId('bridge'),
      type: bridgeType,
      x: point.x,
      y: point.y,
      orientation: 0,
    };

    // Find existing connections that pass through this point
    const crossingConns = existingConnections.filter((c) =>
      c.kind === kind && c.path.some((t) => t.x === point.x && t.y === point.y),
    );

    // Mark existing connections for splitting
    for (const conn of crossingConns) {
      existingToSplit.set(conn.id, conn);
    }

    // Create bridge connections (crossing the bridge)
    const bridgeConnections: Connection[] = [];
    const throughput = kind === 'item' ? 30 : 2;

    // Create connections through the bridge (both directions)
    // North-South direction
    bridgeConnections.push({
      id: nextId('conn'),
      fromMachineId: bridgeMachine.id,
      fromPortId: 'port_ns_out',
      toMachineId: bridgeMachine.id,
      toPortId: 'port_ns_in',
      kind,
      resource,
      matchedRecipeId: null,
      path: [point],
      throughput,
    });

    // East-West direction
    bridgeConnections.push({
      id: nextId('conn'),
      fromMachineId: bridgeMachine.id,
      fromPortId: 'port_ew_out',
      toMachineId: bridgeMachine.id,
      toPortId: 'port_ew_in',
      kind,
      resource,
      matchedRecipeId: null,
      path: [point],
      throughput,
    });

    placements.push({
      machine: bridgeMachine,
      connections: bridgeConnections,
      splitExisting: crossingConns,
    });
  }

  return placements;
}
