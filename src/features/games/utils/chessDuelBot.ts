import {
  allLegalMoves,
  applyMoveBoard,
  detectGameEnd,
  evaluateBoard,
  type Board,
  type ChessMove,
  type Color,
} from './chessDuelEngine'

export function pickBotMove(board: Board, color: Color): ChessMove | null {
  const moves = allLegalMoves(board, color)
  if (moves.length === 0) return null

  let best: ChessMove | null = null
  let bestScore = -Infinity

  for (const move of moves) {
    const next = applyMoveBoard(board, move.from, move.to)
    const end = detectGameEnd(next, color === 'w' ? 'b' : 'w')
    if (end.phase === 'ended' && end.winner === color) {
      return move
    }

    const replyMoves = allLegalMoves(next, color === 'w' ? 'b' : 'w')
    let worstReply = Infinity
    for (const rm of replyMoves.slice(0, 24)) {
      const after = applyMoveBoard(next, rm.from, rm.to)
      const score = evaluateBoard(after) * (color === 'b' ? -1 : 1)
      if (score < worstReply) worstReply = score
    }
    if (replyMoves.length === 0) worstReply = evaluateBoard(next) * (color === 'b' ? -1 : 1)

    if (worstReply > bestScore) {
      bestScore = worstReply
      best = move
    }
  }

  return best ?? moves[Math.floor(Math.random() * moves.length)]!
}

export function botThinkMs(): number {
  return 350 + Math.random() * 450
}
