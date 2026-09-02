import { sinkTotals, stalledCount } from '../depot.ts';
import { state } from './state.ts';

export function boundingBoxArea(): number {
  if (state.machines.length === 0) return 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const m of state.machines) {
    const isRot = m.orientation === 90 || m.orientation === 270;
    const effW = isRot ? m.type.height : m.type.width;
    const effH = isRot ? m.type.width : m.type.height;
    minX = Math.min(minX, m.x);
    minY = Math.min(minY, m.y);
    maxX = Math.max(maxX, m.x + effW);
    maxY = Math.max(maxY, m.y + effH);
  }
  return (maxX - minX) * (maxY - minY);
}

export function updateMetrics(): void {
  const el = document.querySelector<HTMLElement>('#metrics')!;
  const area = boundingBoxArea();
  let text =
    `Machines: ${state.machines.length}\n` +
    `Connections: ${state.connections.length}\n` +
    `Bounding box: ${area} tile${area === 1 ? '' : 's'}`;
  const sinks = sinkTotals(state.connections, state.machines);
  if (sinks.size > 0) {
    text += '\nSinks:';
    for (const [id, info] of sinks) {
      const m = state.machines.find((x) => x.id === id);
      const label = m ? m.type.name : id;
      const parts = [...info.resources.entries()].map(([r, n]) => `${r} x${n}`).join(', ');
      text += `\n  ${label}: ${parts || '—'}`;
    }
  }
  const stalled = stalledCount(state.connections, state.machines);
  if (stalled > 0) text += `\nStalled: ${stalled} (no recipe)`;
  el.textContent = text;
}
