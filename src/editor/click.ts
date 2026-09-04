import { isDepotMachine } from '../depot.ts';
import { grid, setSelectedMachineId, state } from './state.ts';
import { placeMachine } from './placement.ts';
import { handleConnectClick, handleDepotClick } from './connect.ts';
import { refreshRecipeInfo } from './selection.ts';
import { redraw } from './redraw.ts';
import { setStatus } from './status.ts';

/** Handles a left click on the grid at the given tile, in the current mode. */
export async function handleCanvasClick(tile: { x: number; y: number }): Promise<void> {
  if (state.mode === 'connect') {
    handleConnectClick(tile);
    return;
  }
  const occupantId = grid.getOccupancyAt(tile.x, tile.y);
  if (occupantId) {
    const occupant = state.machines.find((m) => m.id === occupantId);
    if (occupant && isDepotMachine(occupant)) {
      await handleDepotClick(occupant);
      return;
    }
    if (occupant) {
      setSelectedMachineId(occupant.id);
      refreshRecipeInfo();
      // Toggle power AoE preview if clicking on a power machine
      if (occupant.type.powerRange != null) {
        state.powerPreviewId = state.powerPreviewId === occupant.id ? null : occupant.id;
        const aoe = state.powerPreviewId ? `${occupant.type.powerRange} tiles` : 'off';
        setStatus(`${occupant.type.name} power AoE: ${aoe}.`);
      } else {
        state.powerPreviewId = null;
      }
      redraw();
      return;
    }
  }
  state.powerPreviewId = null;
  placeMachine(tile.x, tile.y);
}
