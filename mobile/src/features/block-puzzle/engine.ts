export const BOARD_SIZE = 8;

export const TILES = ['ruby', 'sapphire', 'emerald', 'amethyst', 'amber'] as const;
export type TileId = (typeof TILES)[number];
export type Board = (TileId | null)[][];

export type Offset = { row: number; col: number };

export type Shape = { id: string; cells: Offset[] };

export type Piece = {
  uid: string;
  shapeId: string;
  tile: TileId;
  cells: Offset[];
};

export type GameStatus = 'playing' | 'over';

export type GameState = {
  board: Board;
  tray: Piece[];
  score: number;
  highScore: number;
  status: GameStatus;
};

export type ClearedCell = { row: number; col: number; tile: TileId };

export type MoveResult = {
  state: GameState;
  placed: boolean;
  cleared: ClearedCell[];
};

export type Rng = () => number;
export type IdSource = () => string;

const CELL_POINTS = 10;
const LINE_POINTS = 100;
const CLEARED_CELL_POINTS = 5;

function offsets(cells: [number, number][]): Offset[] {
  const minRow = Math.min(...cells.map(([row]) => row));
  const minCol = Math.min(...cells.map(([, col]) => col));
  return cells.map(([row, col]) => ({ row: row - minRow, col: col - minCol }));
}

function shape(id: string, cells: [number, number][]): Shape {
  return { id, cells: offsets(cells) };
}

export const SHAPES: Shape[] = [
  shape('mono', [[0, 0]]),
  shape('domino-h', [[0, 0], [0, 1]]),
  shape('domino-v', [[0, 0], [1, 0]]),
  shape('trio-h', [[0, 0], [0, 1], [0, 2]]),
  shape('trio-v', [[0, 0], [1, 0], [2, 0]]),
  shape('square-2', [[0, 0], [0, 1], [1, 0], [1, 1]]),
  shape('square-3', [
    [0, 0], [0, 1], [0, 2],
    [1, 0], [1, 1], [1, 2],
    [2, 0], [2, 1], [2, 2],
  ]),
  shape('rect-2x3', [
    [0, 0], [0, 1], [0, 2],
    [1, 0], [1, 1], [1, 2],
  ]),
  shape('l-3', [[0, 0], [1, 0], [1, 1]]),
  shape('j-3', [[0, 1], [1, 0], [1, 1]]),
  shape('v-3', [[0, 0], [1, 1], [0, 2]]),
  shape('diag-3', [[0, 0], [1, 1], [2, 2]]),
  shape('skew-3', [[0, 0], [1, 0], [2, 1]]),
  shape('l-4', [[0, 0], [1, 0], [2, 0], [2, 1]]),
  shape('j-4', [[0, 1], [1, 1], [2, 0], [2, 1]]),
  shape('t-4', [[0, 0], [0, 1], [0, 2], [1, 1]]),
  shape('s-4', [[0, 1], [0, 2], [1, 0], [1, 1]]),
  shape('z-4', [[0, 0], [0, 1], [1, 1], [1, 2]]),
  shape('claw-4', [[0, 0], [0, 1], [1, 1], [2, 1]]),
  shape('stair-4', [[0, 0], [1, 0], [1, 1], [2, 1]]),
  shape('corner-4', [[0, 0], [0, 1], [0, 2], [1, 0]]),
];

export function createIdSource(prefix = 'p'): IdSource {
  let next = 0;
  return () => `${prefix}${++next}`;
}

export function emptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array<TileId | null>(BOARD_SIZE).fill(null));
}

export function pieceSpan(piece: Piece): { rows: number; cols: number } {
  return {
    rows: Math.max(...piece.cells.map((cell) => cell.row)) + 1,
    cols: Math.max(...piece.cells.map((cell) => cell.col)) + 1,
  };
}

export function canPlace(board: Board, piece: Piece, originRow: number, originCol: number): boolean {
  return piece.cells.every((cell) => {
    const row = originRow + cell.row;
    const col = originCol + cell.col;
    return row >= 0 && col >= 0 && row < BOARD_SIZE && col < BOARD_SIZE && board[row][col] === null;
  });
}

export function anyPlacement(board: Board, piece: Piece): boolean {
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      if (canPlace(board, piece, row, col)) return true;
    }
  }
  return false;
}

export function scoreMove(placedCells: number, lineCount: number, cellsCleared: number): number {
  const placed = placedCells * CELL_POINTS;
  if (lineCount <= 0) return placed;
  return placed + lineCount * LINE_POINTS + cellsCleared * CLEARED_CELL_POINTS;
}

function placeOnBoard(board: Board, piece: Piece, originRow: number, originCol: number): Board {
  const next = board.map((row) => row.slice());
  for (const cell of piece.cells) {
    next[originRow + cell.row][originCol + cell.col] = piece.tile;
  }
  return next;
}

function fullLines(board: Board): { rows: number[]; cols: number[] } {
  const rows: number[] = [];
  const cols: number[] = [];
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    if (board[row].every((cell) => cell !== null)) rows.push(row);
  }
  for (let col = 0; col < BOARD_SIZE; col += 1) {
    if (board.every((row) => row[col] !== null)) cols.push(col);
  }
  return { rows, cols };
}

function collectClears(board: Board, rows: number[], cols: number[]): ClearedCell[] {
  const rowSet = new Set(rows);
  const colSet = new Set(cols);
  const cleared: ClearedCell[] = [];
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const tile = board[row][col];
      if (tile && (rowSet.has(row) || colSet.has(col))) cleared.push({ row, col, tile });
    }
  }
  return cleared;
}

function eraseClears(board: Board, cleared: ClearedCell[]): Board {
  const next = board.map((row) => row.slice());
  for (const cell of cleared) next[cell.row][cell.col] = null;
  return next;
}

function pickIndex(random: Rng, length: number): number {
  if (length <= 1) return 0;
  return Math.min(length - 1, Math.floor(random() * length));
}

function makePiece(shapeDef: Shape, tile: TileId, ids: IdSource): Piece {
  return { uid: ids(), shapeId: shapeDef.id, tile, cells: shapeDef.cells };
}

export function dealPieces(board: Board, random: Rng, ids: IdSource): Piece[] {
  const used = new Set<string>();
  const tray: Piece[] = [];
  for (let index = 0; index < 3; index += 1) {
    const tile = TILES[pickIndex(random, TILES.length)];
    const available = SHAPES.filter((entry) => !used.has(entry.id));
    const fitting = available.filter((entry) => anyPlacement(board, makePiece(entry, tile, () => 'probe')));
    const pool = fitting.length > 0 ? fitting : available;
    const chosen = pool[pickIndex(random, pool.length)];
    used.add(chosen.id);
    tray.push(makePiece(chosen, tile, ids));
  }
  return tray;
}

export function isTrayStuck(board: Board, tray: Piece[]): boolean {
  return tray.length > 0 && tray.every((piece) => !anyPlacement(board, piece));
}

function finish(board: Board, tray: Piece[], score: number, highScore: number, status: GameStatus = 'playing'): GameState {
  return {
    board,
    tray,
    score,
    highScore: Math.max(highScore, score),
    status,
  };
}

/** Replace the tray after a life is lost; board and score stay. */
export function refreshTray(
  state: GameState,
  random: Rng = Math.random,
  ids: IdSource = createIdSource(),
): GameState {
  return finish(state.board, dealPieces(state.board, random, ids), state.score, state.highScore, state.status);
}

export function endGame(state: GameState): GameState {
  return finish(state.board, state.tray, state.score, state.highScore, 'over');
}

export function createGame(random: Rng = Math.random, highScore = 0, ids: IdSource = createIdSource()): GameState {
  const board = emptyBoard();
  return finish(board, dealPieces(board, random, ids), 0, highScore);
}

export function commitPlacement(
  state: GameState,
  pieceUid: string,
  originRow: number,
  originCol: number,
  random: Rng = Math.random,
  ids: IdSource = createIdSource(),
): MoveResult {
  if (state.status !== 'playing') return { state, placed: false, cleared: [] };
  const piece = state.tray.find((entry) => entry.uid === pieceUid);
  if (!piece || !canPlace(state.board, piece, originRow, originCol)) {
    return { state, placed: false, cleared: [] };
  }
  const occupied = placeOnBoard(state.board, piece, originRow, originCol);
  const lines = fullLines(occupied);
  const cleared = collectClears(occupied, lines.rows, lines.cols);
  const board = eraseClears(occupied, cleared);
  const score = state.score + scoreMove(piece.cells.length, lines.rows.length + lines.cols.length, cleared.length);
  let tray = state.tray.filter((entry) => entry.uid !== pieceUid);
  if (tray.length === 0) tray = dealPieces(board, random, ids);
  return {
    state: finish(board, tray, score, state.highScore),
    placed: true,
    cleared,
  };
}
