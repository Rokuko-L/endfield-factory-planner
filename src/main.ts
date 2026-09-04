import { reconcileConnectionRecipes } from './recipes.ts';
import { openMachineEditor } from './machineEditor/index.ts';
import { grid, initRenderer, renderer, setSelectedMachineId, state } from './editor/state.ts';
import { clearAll, clearConnections, populateSelector, removeConnectionAt, removeMachineAt, rotate, updateOrientationLabel } from './editor/placement.ts';
import { setMode } from './editor/connect.ts';
import { handleCanvasClick } from './editor/click.ts';
import { eventToTile } from './editor/canvas.ts';
import { installAgentApi } from './agent/api.ts';
import { refreshRecipeInfo } from './editor/selection.ts';
import { loadLcValleyDemo } from './editor/demo.ts';
import { redraw } from './editor/redraw.ts';
import { setStatus } from './editor/status.ts';
import './style.css';

const select = document.querySelector<HTMLSelectElement>('#machine-select')!;
const modePlaceBtn = document.querySelector<HTMLButtonElement>('#mode-place')!;
const modeConnectBtn = document.querySelector<HTMLButtonElement>('#mode-connect')!;
const defineMachinesBtn = document.querySelector<HTMLButtonElement>('#define-machines')!;
const demoBtn = document.querySelector<HTMLButtonElement>('#demo-lc-valley')!;
const clearAllBtn = document.querySelector<HTMLButtonElement>('#clear-all')!;
const clearConnectionsBtn = document.querySelector<HTMLButtonElement>('#clear-connections')!;
const recipeInfoEl = document.querySelector<HTMLElement>('#recipe-info')!;
const canvas = document.querySelector<HTMLCanvasElement>('#grid')!;

initRenderer(canvas);

select.addEventListener('change', () => {
  state.selectedIndex = Number(select.value);
  setStatus(`Selected ${state.machineTypes[state.selectedIndex]!.name}.`);
  redraw();
});

canvas.addEventListener('pointermove', (e) => {
  state.hover = eventToTile(e);
  redraw();
});

canvas.addEventListener('pointerleave', () => {
  state.hover = null;
  redraw();
});

canvas.addEventListener('click', (e) => {
  const tile = eventToTile(e);
  if (tile) void handleCanvasClick(tile);
});

canvas.addEventListener('click', (e) => {
  if (e.detail >= 2) return;
});

recipeInfoEl.addEventListener('recipe-info-close', () => {
  setSelectedMachineId(null);
  refreshRecipeInfo();
});

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const tile = eventToTile(e);
  if (!tile) return;
  if (grid.getConnectionAt(tile.x, tile.y)) removeConnectionAt(tile.x, tile.y);
  else removeMachineAt(tile.x, tile.y);
});

clearAllBtn.addEventListener('click', clearAll);
clearConnectionsBtn.addEventListener('click', clearConnections);
modePlaceBtn.addEventListener('click', () => setMode('place'));
modeConnectBtn.addEventListener('click', () => setMode('connect'));

defineMachinesBtn.addEventListener('click', async () => {
  const result = await openMachineEditor();
  if (result) {
    state.machineTypes = result;
    populateSelector();
    state.connections = reconcileConnectionRecipes(state.connections, state.machines);
    setStatus(`Loaded ${result.length} machine type${result.length === 1 ? '' : 's'}.`);
    redraw();
  }
});

demoBtn.addEventListener('click', loadLcValleyDemo);

window.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLSelectElement) return;
  if (e.key === 'r' || e.key === 'R') {
    e.preventDefault();
    rotate();
  } else if (e.key === 'Escape') {
    if (state.draftSource) {
      state.draftSource = null;
      state.draftAdjacent = null;
      state.draftPath = null;
      setStatus('Cancelled connection draft.');
      redraw();
    }
  }
});

populateSelector();
updateOrientationLabel();
renderer.resize();
redraw();
setStatus('Ready. Pick a machine and click the grid.');
installAgentApi();
