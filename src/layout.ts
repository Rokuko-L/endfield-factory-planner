import type { Connection, MachineInstance, Orientation, ResourceKind, Side } from './types.ts';

export interface PickedPort {
  machine: MachineInstance;
  side: Side;
  cellIndex: number;
  kind: ResourceKind;
  resource: string;
  portId: string;
  adjacentTiles: { x: number; y: number }[];
}

export interface PortCell {
  machine: MachineInstance;
  side: Side;
  cellIndex: number;
  kind: ResourceKind;
  resource: string;
  portId: string;
  cell: { x: number; y: number };
  adjacentTiles: { x: number; y: number }[];
}

export interface EditorState {
  machineTypes: import('./types.ts').MachineType[];
  machines: MachineInstance[];
  connections: Connection[];
  selectedIndex: number;
  orientation: Orientation;
  mode: 'place' | 'connect';
  hover: { x: number; y: number } | null;
  invalidFlash: { x: number; y: number; w: number; h: number } | null;
  draftSource: PickedPort | null;
  draftAdjacent: { x: number; y: number } | null;
  draftPath: { x: number; y: number }[] | null;
}
