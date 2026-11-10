export type SavedProgress = {
  levelIndex: number;
  score: number;
  foundByLevel: Record<string, string[]>;
  revealedByLevel: Record<string, string[]>;
};

const KEY = 'playmeet-word-game-v1';

let memory: SavedProgress = { levelIndex: 0, score: 0, foundByLevel: {}, revealedByLevel: {} };

function wordMap(raw: unknown): Record<string, string[]> {
  const found: Record<string, string[]> = {};
  if (!raw || typeof raw !== 'object') return found;
  for (const [id, words] of Object.entries(raw)) {
    if (Array.isArray(words)) {
      found[id] = words.filter((word): word is string => typeof word === 'string');
    }
  }
  return found;
}

export function emptyProgress(): SavedProgress {
  return { levelIndex: 0, score: 0, foundByLevel: {}, revealedByLevel: {} };
}

export function sanitizeProgress(raw: unknown, levelCount: number): SavedProgress {
  if (!raw || typeof raw !== 'object') return emptyProgress();
  const record = raw as Partial<SavedProgress>;
  const levelIndex =
    typeof record.levelIndex === 'number' && Number.isFinite(record.levelIndex)
      ? Math.min(levelCount - 1, Math.max(0, Math.floor(record.levelIndex)))
      : 0;
  const score =
    typeof record.score === 'number' && Number.isFinite(record.score)
      ? Math.max(0, Math.floor(record.score))
      : 0;
  return {
    levelIndex,
    score,
    foundByLevel: wordMap(record.foundByLevel),
    revealedByLevel: wordMap(record.revealedByLevel),
  };
}

async function storage() {
  const module = await import('@react-native-async-storage/async-storage');
  return module.default;
}

export async function loadProgress(levelCount: number): Promise<SavedProgress> {
  try {
    const store = await storage();
    const raw = await store.getItem(KEY);
    if (!raw) return memory;
    const parsed = sanitizeProgress(JSON.parse(raw), levelCount);
    memory = parsed;
    return parsed;
  } catch {
    return memory;
  }
}

export async function saveProgress(progress: SavedProgress): Promise<void> {
  memory = progress;
  try {
    const store = await storage();
    await store.setItem(KEY, JSON.stringify(progress));
  } catch {
    memory = progress;
  }
}
