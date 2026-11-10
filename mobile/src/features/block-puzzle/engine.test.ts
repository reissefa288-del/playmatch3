import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BOARD_SIZE,
  SHAPES,
  TILES,
  anyPlacement,
  canPlace,
  isTrayStuck,
  commitPlacement,
  createGame,
  createIdSource,
  dealPieces,
  emptyBoard,
  scoreMove,
  type Board,
  type Piece,
  type TileId,
} from './engine.ts';

function rng(values: number[]): () => number {
  let index = 0;
  return () => {
    const value = values[index % values.length];
    index += 1;
    return value;
  };
}

function piece(partial: Partial<Piece> & Pick<Piece, 'cells'>): Piece {
  return {
    uid: partial.uid ?? 'piece',
    shapeId: partial.shapeId ?? 'custom',
    tile: partial.tile ?? 'ruby',
    cells: partial.cells,
  };
}

function fill(board: Board, row: number, col: number, tile: TileId = 'ruby') {
  board[row][col] = tile;
}

test('empty board accepts a piece and rejects an overlap or an overhang', () => {
  const board = emptyBoard();
  const domino = piece({ cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }] });
  assert.equal(canPlace(board, domino, 0, 0), true);
  board[0][1] = 'sapphire';
  assert.equal(canPlace(board, domino, 0, 0), false);
  assert.equal(canPlace(board, domino, 0, BOARD_SIZE - 1), false);
});

test('a row and a column clear once at their intersection', () => {
  const board = emptyBoard();
  for (let col = 1; col < BOARD_SIZE; col += 1) fill(board, 0, col);
  for (let row = 1; row < BOARD_SIZE; row += 1) fill(board, row, 0, 'sapphire');
  const ids = createIdSource();
  const state = {
    board,
    tray: [piece({ uid: 'dot', shapeId: 'mono', tile: 'amber', cells: [{ row: 0, col: 0 }] })],
    score: 0,
    highScore: 0,
    status: 'playing' as const,
  };
  const result = commitPlacement(state, 'dot', 0, 0, rng([0]), ids);
  assert.equal(result.placed, true);
  assert.equal(result.cleared.length, 15);
  assert.equal(result.state.board[0][0], null);
  assert.equal(result.state.board[0][3], null);
  assert.equal(result.state.board[4][0], null);
  assert.equal(result.state.board[3][3], null);
  assert.equal(result.state.score, scoreMove(1, 2, 15));
  assert.equal(result.state.score, 10 + 200 + 75);
});

test('score counts placed cells without a line bonus when nothing clears', () => {
  assert.equal(scoreMove(4, 0, 0), 40);
  const ids = createIdSource();
  const state = createGame(rng([0]), 0, ids);
  const first = state.tray[0];
  const result = commitPlacement(state, first.uid, 0, 0, rng([0.2]), ids);
  assert.equal(result.placed, true);
  assert.equal(result.cleared.length, 0);
  assert.equal(result.state.score, first.cells.length * 10);
  assert.equal(result.state.tray.some((entry) => entry.uid === first.uid), false);
});

test('using all three pieces deals three new unique shapes', () => {
  const ids = createIdSource('a');
  let state = {
    board: emptyBoard(),
    tray: [0, 1, 2].map((index) =>
      piece({
        uid: `m${index}`,
        shapeId: 'mono',
        tile: TILES[index] ?? 'ruby',
        cells: [{ row: 0, col: 0 }],
      }),
    ),
    score: 0,
    highScore: 0,
    status: 'playing' as const,
  };
  for (let index = 0; index < 3; index += 1) {
    const move = commitPlacement(state, `m${index}`, 0, index, rng([0.2, 0.5, 0.8]), ids);
    assert.equal(move.placed, true);
    state = move.state;
  }
  assert.equal(state.tray.length, 3);
  assert.equal(new Set(state.tray.map((entry) => entry.shapeId)).size, 3);
  assert.equal(state.tray.every((entry) => !entry.uid.startsWith('m')), true);
  assert.equal(state.score, 30);
});

test('deal prefers a shape that still fits', () => {
  const board = emptyBoard();
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      if (!(row === 0 && col === 0)) board[row][col] = 'emerald';
    }
  }
  const tray = dealPieces(board, rng([0.99]), createIdSource());
  assert.equal(tray.length, 3);
  assert.ok(tray.some((entry) => entry.shapeId === 'mono' && anyPlacement(board, entry)));
  assert.equal(new Set(tray.map((entry) => entry.shapeId)).size, 3);
});

test('no legal move ends the game and restart opens a fresh board', () => {
  const board = emptyBoard();
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      if ((row + col) % 2 === 0) board[row][col] = 'amethyst';
    }
  }
  const square = SHAPES.find((entry) => entry.id === 'square-2');
  assert.ok(square);
  const ids = createIdSource();
  const squares = [0, 1, 2].map((index) => ({
    uid: `sq${index}`,
    shapeId: square.id,
    tile: TILES[index] ?? 'ruby',
    cells: square.cells,
  }));
  const state = {
    board,
    tray: squares,
    score: 40,
    highScore: 40,
    status: 'playing' as const,
  };
  const blocked = commitPlacement(state, 'missing', 0, 1, rng([0]), ids);
  assert.equal(blocked.placed, false);
  assert.equal(squares.every((entry) => !anyPlacement(board, entry)), true);
  const mono = piece({ uid: 'last', shapeId: 'mono', tile: 'ruby', cells: [{ row: 0, col: 0 }] });
  const ended = commitPlacement({ ...state, tray: [mono, ...squares] }, 'last', 0, 1, rng([0]), ids);
  assert.equal(ended.placed, true);
  assert.equal(ended.cleared.length, 0);
  assert.equal(ended.state.status, 'over');

  const restarted = createGame(rng([0.2]), ended.state.highScore, createIdSource('b'));
  assert.equal(restarted.status, 'playing');
  assert.equal(restarted.score, 0);
  assert.equal(restarted.highScore, ended.state.highScore);
  assert.equal(restarted.board.every((row) => row.every((cell) => cell === null)), true);
  assert.equal(restarted.tray.length, 3);
});
