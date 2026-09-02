export function setStatus(message: string, isError = false): void {
  const el = document.querySelector<HTMLElement>('#status')!;
  el.textContent = message;
  el.classList.toggle('no-space', isError);
}
