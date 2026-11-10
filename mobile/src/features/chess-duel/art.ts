/** Cropped board art is 1008×1015. Square centers were measured on that image. */
export const BOARD_RATIO = 1015 / 1008;
export const BOARD_FILES = [115.5, 228.5, 339, 449.5, 559.5, 669.5, 780, 889].map((value) => value / 1008);
export const BOARD_RANKS = [186, 297, 406, 516, 624, 732, 839, 949].map((value) => value / 1015);
export const BOARD_SQUARE = 111 / 1008;

export const chessBoard = require('./assets/board.png');

const light = {
  k: require('./assets/pieces/light/king.png'),
  q: require('./assets/pieces/light/queen.png'),
  b: require('./assets/pieces/light/bishop.png'),
  n: require('./assets/pieces/light/knight.png'),
  r: require('./assets/pieces/light/rook.png'),
  p: require('./assets/pieces/light/pawn.png'),
} as const;

const dark = {
  k: require('./assets/pieces/dark/king.png'),
  q: require('./assets/pieces/dark/queen.png'),
  b: require('./assets/pieces/dark/bishop.png'),
  n: require('./assets/pieces/dark/knight.png'),
  r: require('./assets/pieces/dark/rook.png'),
  p: require('./assets/pieces/dark/pawn.png'),
} as const;

/** Height in squares, and the cut image's height divided by its width. */
export const chessPieces = {
  K: { source: light.k, tall: 0.92, aspect: 408 / 165 },
  Q: { source: light.q, tall: 0.86, aspect: 353 / 156 },
  B: { source: light.b, tall: 0.8, aspect: 336 / 143 },
  N: { source: light.n, tall: 0.78, aspect: 328 / 167 },
  R: { source: light.r, tall: 0.72, aspect: 279 / 165 },
  P: { source: light.p, tall: 0.62, aspect: 264 / 137 },
  k: { source: dark.k, tall: 0.92, aspect: 483 / 189 },
  q: { source: dark.q, tall: 0.86, aspect: 416 / 178 },
  b: { source: dark.b, tall: 0.8, aspect: 386 / 159 },
  n: { source: dark.n, tall: 0.78, aspect: 379 / 197 },
  r: { source: dark.r, tall: 0.72, aspect: 328 / 182 },
  p: { source: dark.p, tall: 0.62, aspect: 288 / 146 },
} as const;

export const STARTING_RANKS = [
  'rnbqkbnr',
  'pppppppp',
  '........',
  '........',
  '........',
  '........',
  'PPPPPPPP',
  'RNBQKBNR',
] as const;
