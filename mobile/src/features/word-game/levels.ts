import { assertLevel, type PuzzleLevel } from './engine';

export const LEVELS: PuzzleLevel[] = [
  {
    id: 'kas',
    title: 'Kaş',
    letters: ['K', 'A', 'Ş'],
    words: [
      {
        id: 'kas',
        text: 'KAŞ',
        cells: [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
          { row: 0, col: 2 },
        ],
      },
      {
        id: 'ask',
        text: 'AŞK',
        cells: [
          { row: 0, col: 1 },
          { row: 1, col: 1 },
          { row: 2, col: 1 },
        ],
      },
    ],
    bonus: [],
  },
  {
    id: 'cay',
    title: 'Çay',
    letters: ['Ç', 'A', 'Y', 'O', 'L'],
    words: [
      {
        id: 'cay',
        text: 'ÇAY',
        cells: [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
          { row: 0, col: 2 },
        ],
      },
      {
        id: 'yol',
        text: 'YOL',
        cells: [
          { row: 0, col: 2 },
          { row: 1, col: 2 },
          { row: 2, col: 2 },
        ],
      },
    ],
    bonus: ['OY'],
  },
  {
    id: 'deniz',
    title: 'Deniz',
    letters: ['D', 'E', 'N', 'İ', 'Z'],
    words: [
      {
        id: 'deniz',
        text: 'DENİZ',
        cells: [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
          { row: 0, col: 2 },
          { row: 0, col: 3 },
          { row: 0, col: 4 },
        ],
      },
      {
        id: 'iz',
        text: 'İZ',
        cells: [
          { row: 0, col: 3 },
          { row: 1, col: 3 },
        ],
      },
    ],
    bonus: ['NE'],
  },
  {
    id: 'gunes',
    title: 'Güneş',
    letters: ['G', 'Ü', 'N', 'E', 'Ş'],
    words: [
      {
        id: 'gunes',
        text: 'GÜNEŞ',
        cells: [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
          { row: 0, col: 2 },
          { row: 0, col: 3 },
          { row: 0, col: 4 },
        ],
      },
      {
        id: 'ne',
        text: 'NE',
        cells: [
          { row: 0, col: 2 },
          { row: 1, col: 2 },
        ],
      },
      {
        id: 'es',
        text: 'EŞ',
        cells: [
          { row: 0, col: 3 },
          { row: 0, col: 4 },
        ],
      },
    ],
    bonus: ['ÜN'],
  },
  {
    id: 'kitap',
    title: 'Kitap',
    letters: ['K', 'İ', 'T', 'A', 'P'],
    words: [
      {
        id: 'kitap',
        text: 'KİTAP',
        cells: [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
          { row: 0, col: 2 },
          { row: 0, col: 3 },
          { row: 0, col: 4 },
        ],
      },
      {
        id: 'ta',
        text: 'TA',
        cells: [
          { row: 0, col: 2 },
          { row: 1, col: 2 },
        ],
      },
    ],
    bonus: ['AT'],
  },
];

for (const level of LEVELS) assertLevel(level);

export function levelAt(index: number): PuzzleLevel {
  return LEVELS[Math.min(LEVELS.length - 1, Math.max(0, index))] ?? LEVELS[0];
}
