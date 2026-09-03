import { Grid } from '../grid.ts';
import { Renderer } from '../renderer.ts';
import { loadDepotAssignments } from '../depot.ts';
import { loadMachineTypes } from '../machineStore.ts';
import type { EditorState } from '../layout.ts';
import type { MachineInstance, MachineType, Orientation } from '../types.ts';

export const GRID_SIZE = 50;
export const ORIENTATIONS: readonly Orientation[] = [0, 90, 180, 270];

export const grid = new Grid(GRID_SIZE, GRID_SIZE);

export const state: EditorState = {
  machineTypes: loadMachineTypes(),
  machines: [],
  connections: [],
  selectedIndex: 0,
  orientation: 0,
  mode: 'place',
  hover: null,
  invalidFlash: null,
  draftSource: null,
  draftAdjacent: null,
  draftPath: null,
  depotAssignments: loadDepotAssignments(),
  powerPreviewId: null,
};

let selectedMachineId: string | null = null;

export function getSelectedMachineId(): string | null {
  return selectedMachineId;
}

export function setSelectedMachineId(id: string | null): void {
  selectedMachineId = id;
}

export function selectedMachine(): MachineInstance | null {
  if (!selectedMachineId) return null;
  return state.machines.find((m) => m.id === selectedMachineId) ?? null;
}

export function selectedType(): MachineType {
  return state.machineTypes[state.selectedIndex]!;
}

export let renderer: Renderer;

export function initRenderer(canvas: HTMLCanvasElement): void {
  renderer = new Renderer(canvas, grid);
}
