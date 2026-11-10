import {
  BOARD_SIZE,
  canPlace,
  commitPlacement,
  pieceSpan,
  type GameState,
  type Rng,
} from '@/features/block-puzzle/engine';

export type BotMove = {
  pieceUid: string;
  originRow: number;
  originCol: number;
};

function filledCells(board: GameState['board']): number {
  let count = 0;
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      if (board[row][col]) count += 1;
    }
  }
  return count;
}

/** Greedy duel bot: prefer clears and score, with light randomness. */
export function chooseBotMove(state: GameState, random: Rng = Math.random): BotMove | null {
  if (state.status !== 'playing') return null;

  let best: { move: BotMove; value: number } | null = null;
  const probeIds = () => 'probe';

  for (const piece of state.tray) {
    const span = pieceSpan(piece);
    for (let row = 0; row <= BOARD_SIZE - span.rows; row += 1) {
      for (let col = 0; col <= BOARD_SIZE - span.cols; col += 1) {
        if (!canPlace(state.board, piece, row, col)) continue;
        const probe = commitPlacement(state, piece.uid, row, col, () => 0, probeIds);
        if (!probe.placed) continue;

        const gained = probe.state.score - state.score;
        const clears = probe.cleared.length;
        const packed = filledCells(probe.state.board);
        const value = gained * 10 + clears * 40 + packed + random() * 8;

        if (!best || value > best.value) {
          best = {
            move: { pieceUid: piece.uid, originRow: row, originCol: col },
            value,
          };
        }
      }
    }
  }

  return best?.move ?? null;
}
