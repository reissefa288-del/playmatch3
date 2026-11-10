import { buildRoundFromWords, type PuzzleLevel } from './engine';
import { WORD_BANK } from './words';

export function buildRound(random: () => number = Math.random): PuzzleLevel {
  return buildRoundFromWords(WORD_BANK, random);
}
