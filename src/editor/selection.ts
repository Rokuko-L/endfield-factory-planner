import { renderRecipeInfoPanel } from '../recipeInfoUi.ts';
import { solveFlow } from '../flow.ts';
import { selectedMachine, state } from './state.ts';

export function refreshRecipeInfo(): void {
  const host = document.querySelector<HTMLElement>('#recipe-info')!;
  const m = selectedMachine();
  const flow = solveFlow(state);
  renderRecipeInfoPanel(host, m, state.connections, m ? state.depotAssignments[m.id] : undefined, flow);
}
