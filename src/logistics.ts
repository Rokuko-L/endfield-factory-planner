import type { Connection, MachineInstance } from './types.ts';

/** Max throughput for belts (items/min) and pipes (items/sec). */
const MAX_THROUGHPUT: Record<'item' | 'fluid', number> = {
  item: 30,
  fluid: 2,
};

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

