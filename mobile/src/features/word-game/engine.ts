export type Cell = { row: number; col: number };

export type PuzzleWord = {
  id: string;
  text: string;
  cells: Cell[];
};

export type PuzzleLevel = {
  id: string;
  title: string;
  letters: string[];
  words: PuzzleWord[];
  bonus: string[];
};

export type PuzzleState = {
  levelId: string;
  letterOrder: number[];
  foundIds: string[];
  revealed: string[];
  score: number;
};

export type SubmitResult = 'short' | 'invalid' | 'duplicate' | 'bonus' | 'found';

export const HINT_COST = 20;

export function normalizeWord(value: string): string {
  return value.normalize('NFC').trim().toLocaleUpperCase('tr-TR');
}

export function cellKey(cell: Cell): string {
  return `${cell.row}:${cell.col}`;
}

function counts(letters: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const letter of letters.map(normalizeWord)) {
    map.set(letter, (map.get(letter) ?? 0) + 1);
  }
  return map;
}

export function canSpell(letters: string[], word: string): boolean {
  const available = counts(letters);
  for (const letter of [...normalizeWord(word)]) {
    const left = available.get(letter) ?? 0;
    if (left <= 0) return false;
    available.set(letter, left - 1);
  }
  return true;
}

export function assertLevel(level: PuzzleLevel): void {
  const placed = new Map<string, string>();
  for (const word of level.words) {
    const text = normalizeWord(word.text);
    if (text.length < 2 || text.length !== word.cells.length) {
      throw new Error(`${level.id} kelimesi ızgarayla uyuşmuyor: ${word.id}`);
    }
    if (!canSpell(level.letters, text)) {
      throw new Error(`${level.id} harfleri ${text} kelimesini karşılamıyor`);
    }
    word.cells.forEach((cell, index) => {
      const key = cellKey(cell);
      const letter = text[index] ?? '';
      const previous = placed.get(key);
      if (previous && previous !== letter) {
        throw new Error(`${level.id} kesişimi uyuşmuyor: ${key}`);
      }
      placed.set(key, letter);
    });
  }
  for (const extra of level.bonus) {
    if (!canSpell(level.letters, extra)) {
      throw new Error(`${level.id} ek kelimesi kurulamıyor: ${extra}`);
    }
  }
}

export function createPuzzleState(
  level: PuzzleLevel,
  score = 0,
  foundIds: string[] = [],
  revealed: string[] = [],
): PuzzleState {
  const known = new Set(level.words.map((word) => word.id));
  return {
    levelId: level.id,
    letterOrder: level.letters.map((_, index) => index),
    foundIds: foundIds.filter((id) => known.has(id)),
    revealed: revealed.filter((key) => key.includes(':')),
    score: Math.max(0, score),
  };
}

export function lettersInOrder(level: PuzzleLevel, state: PuzzleState): string[] {
  return state.letterOrder.map((index) => level.letters[index] ?? '');
}

export function spell(level: PuzzleLevel, state: PuzzleState, selection: number[]): string {
  const letters = lettersInOrder(level, state);
  return selection.map((slot) => letters[slot] ?? '').join('');
}

export function shuffleOrder(order: number[], random: () => number = Math.random): number[] {
  const next = order.slice();
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    const current = next[index];
    const other = next[swap];
    if (current === undefined || other === undefined) continue;
    next[index] = other;
    next[swap] = current;
  }
  const unchanged = next.every((value, index) => value === order[index]);
  if (unchanged && next.length > 1) {
    const first = next[0];
    const second = next[1];
    if (first !== undefined && second !== undefined) {
      next[0] = second;
      next[1] = first;
    }
  }
  return next;
}

export function isLevelClear(level: PuzzleLevel, state: PuzzleState): boolean {
  return level.words.every((word) => state.foundIds.includes(word.id));
}

export function submitWord(
  level: PuzzleLevel,
  state: PuzzleState,
  selection: number[],
): { state: PuzzleState; result: SubmitResult } {
  const text = normalizeWord(spell(level, state, selection));
  if (text.length < 2) return { state, result: 'short' };

  const match = level.words.find((word) => normalizeWord(word.text) === text);
  if (match) {
    if (state.foundIds.includes(match.id)) return { state, result: 'duplicate' };
    return {
      state: {
        ...state,
        foundIds: [...state.foundIds, match.id],
        score: state.score + text.length * FOUND_PER_LETTER,
      },
      result: 'found',
    };
  }

  if (level.bonus.some((word) => normalizeWord(word) === text)) {
    return {
      state: { ...state, score: state.score + text.length * BONUS_PER_LETTER },
      result: 'bonus',
    };
  }

  return { state, result: 'invalid' };
}

const FOUND_PER_LETTER = 20;
const BONUS_PER_LETTER = 5;

export function applyHint(
  level: PuzzleLevel,
  state: PuzzleState,
): { state: PuzzleState; revealed: boolean } {
  const open = new Set(state.revealed);
  for (const word of level.words) {
    if (state.foundIds.includes(word.id)) continue;
    for (const cell of word.cells) {
      const key = cellKey(cell);
      if (open.has(key)) continue;
      return {
        state: {
          ...state,
          revealed: [...state.revealed, key],
          score: Math.max(0, state.score - HINT_COST),
        },
        revealed: true,
      };
    }
  }
  return { state, revealed: false };
}

export function gridBounds(level: PuzzleLevel): { rows: number; cols: number } {
  let rows = 1;
  let cols = 1;
  for (const word of level.words) {
    for (const cell of word.cells) {
      rows = Math.max(rows, cell.row + 1);
      cols = Math.max(cols, cell.col + 1);
    }
  }
  return { rows, cols };
}

export function letterAt(level: PuzzleLevel, cell: Cell): string | null {
  for (const word of level.words) {
    const index = word.cells.findIndex(
      (item) => item.row === cell.row && item.col === cell.col,
    );
    if (index >= 0) return normalizeWord(word.text)[index] ?? null;
  }
  return null;
}

export function isCellOpen(level: PuzzleLevel, state: PuzzleState, cell: Cell): boolean {
  const key = cellKey(cell);
  if (state.revealed.includes(key)) return true;
  return level.words.some(
    (word) =>
      state.foundIds.includes(word.id) &&
      word.cells.some((item) => item.row === cell.row && item.col === cell.col),
  );
}

export function slotsForWord(letters: string[], word: string): number[] | null {
  const used = new Set<number>();
  const path: number[] = [];
  for (const char of normalizeWord(word)) {
    const index = letters.findIndex(
      (letter, slot) => !used.has(slot) && normalizeWord(letter) === char,
    );
    if (index < 0) return null;
    used.add(index);
    path.push(index);
  }
  return path.length >= 2 ? path : null;
}

function wheelLetters(words: string[]): string[] {
  const need = new Map<string, number>();
  for (const word of words) {
    const local = counts([...normalizeWord(word)]);
    for (const [letter, count] of local) {
      need.set(letter, Math.max(need.get(letter) ?? 0, count));
    }
  }
  const letters: string[] = [];
  for (const [letter, count] of need) {
    for (let index = 0; index < count; index += 1) letters.push(letter);
  }
  return letters;
}

function placePair(spine: string, cross: string): PuzzleLevel | null {
  let spineIndex = -1;
  let crossIndex = -1;
  for (let index = 0; index < spine.length; index += 1) {
    const found = cross.indexOf(spine[index] ?? '');
    if (found >= 0) {
      spineIndex = index;
      crossIndex = found;
      break;
    }
  }
  if (spineIndex < 0 || crossIndex < 0) return null;
  const words: PuzzleWord[] = [
    {
      id: spine,
      text: spine,
      cells: [...spine].map((_, index) => ({ row: crossIndex, col: index })),
    },
    {
      id: cross,
      text: cross,
      cells: [...cross].map((_, index) => ({ row: index, col: spineIndex })),
    },
  ];
  const letters = wheelLetters([spine, cross]);
  if (letters.length < 3 || letters.length > 7) return null;
  return { id: `${spine}-${cross}`, title: spine, letters, words, bonus: [] };
}

const FALLBACK_ROUND: PuzzleLevel = {
  id: 'kas-ask',
  title: 'KAŞ',
  letters: ['K', 'A', 'Ş'],
  words: [
    {
      id: 'KAŞ',
      text: 'KAŞ',
      cells: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
      ],
    },
    {
      id: 'AŞK',
      text: 'AŞK',
      cells: [
        { row: 0, col: 1 },
        { row: 1, col: 1 },
        { row: 2, col: 1 },
      ],
    },
  ],
  bonus: [],
};

function pickWord(words: string[], random: () => number): string | undefined {
  if (words.length === 0) return undefined;
  return words[Math.floor(random() * words.length)];
}

export function buildRoundFromWords(bank: string[], random: () => number = Math.random): PuzzleLevel {
  const words = [...new Set(bank.map(normalizeWord))].filter(
    (word) => word.length >= 3 && word.length <= 6,
  );
  for (let attempt = 0; attempt < 48; attempt += 1) {
    const spine = pickWord(words, random);
    if (!spine) break;
    let placed: PuzzleLevel | null = null;
    let cross = '';
    for (let draw = 0; draw < 16; draw += 1) {
      const candidate = pickWord(words, random);
      if (!candidate || candidate === spine || candidate.length > 5) continue;
      if (![...candidate].some((letter) => spine.includes(letter))) continue;
      placed = placePair(spine, candidate);
      if (!placed) continue;
      cross = candidate;
      break;
    }
    if (!placed || !cross) continue;
    const bonus: string[] = [];
    for (let draw = 0; draw < 24 && bonus.length < 4; draw += 1) {
      const extra = pickWord(words, random);
      if (!extra || extra === spine || extra === cross || bonus.includes(extra)) continue;
      if (canSpell(placed.letters, extra)) bonus.push(extra);
    }
    const level = { ...placed, bonus };
    try {
      assertLevel(level);
      return level;
    } catch {
      continue;
    }
  }
  return FALLBACK_ROUND;
}
