const KEY = 'playmeet-block-puzzle-v1';

let memory = 0;

export function readMemoryHighScore(): number {
  return memory;
}

export async function loadHighScore(): Promise<number> {
  try {
    const module = await import('@react-native-async-storage/async-storage');
    const raw = await module.default.getItem(KEY);
    const parsed = raw ? Number(raw) : 0;
    memory = Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : memory;
    return memory;
  } catch {
    return memory;
  }
}

export async function saveHighScore(score: number): Promise<void> {
  memory = Math.max(memory, Math.floor(score));
  try {
    const module = await import('@react-native-async-storage/async-storage');
    await module.default.setItem(KEY, String(memory));
  } catch {
    memory = Math.max(memory, Math.floor(score));
  }
}
