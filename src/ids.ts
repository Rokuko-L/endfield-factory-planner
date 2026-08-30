let counter = 0;
let seeded = false;

function seedCounter(): void {
  if (seeded) return;
  seeded = true;
  counter = Date.now() % 1_000_000;
}

export function nextId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  seedCounter();
  counter += 1;
  return `${prefix}-${counter.toString(36)}-${Date.now().toString(36)}`;
}

export function resetIdCounter(): void {
  counter = 0;
  seeded = false;
}
