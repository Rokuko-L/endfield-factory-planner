import { renderRecipeInfoPanel } from '../recipeInfoUi.ts';
import { selectedMachine, state } from './state.ts';

export function refreshRecipeInfo(): void {
  const host = document.querySelector<HTMLElement>('#recipe-info')!;
  const m = selectedMachine();
  renderRecipeInfoPanel(host, m, state.connections, m ? state.depotAssignments[m.id] : undefined);
}
