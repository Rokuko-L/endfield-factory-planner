export interface StatusEntry {
  message: string;
  isError: boolean;
}

const MAX_HISTORY = 50;
const history: StatusEntry[] = [];

export function setStatus(message: string, isError = false): void {
  const el = document.querySelector<HTMLElement>('#status')!;
  el.textContent = message;
  el.classList.toggle('no-space', isError);
  history.push({ message, isError });
  if (history.length > MAX_HISTORY) history.shift();
}

export function statusHistory(): readonly StatusEntry[] {
  return history;
}
