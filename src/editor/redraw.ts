import { grid, renderer, selectedType, state } from './state.ts';
import { updateMetrics } from './metrics.ts';
import { refreshRecipeInfo } from './selection.ts';

export function redraw(): void {
  let preview = null;
  if (state.hover && state.mode === 'place') {
    const type = selectedType();
    const isRot = state.orientation === 90 || state.orientation === 270;
    const effW = isRot ? type.height : type.width;
    const effH = isRot ? type.width : type.height;
    const valid = grid.canPlaceWithOrientation(type, state.hover.x, state.hover.y, state.orientation);
    preview = { ...state.hover, w: effW, h: effH, valid };
  }
  renderer.draw(
    state.machines,
    state.connections,
    preview,
    state.invalidFlash,
    state.draftAdjacent,
    state.draftPath,
  );
  updateMetrics();
  refreshRecipeInfo();
}
