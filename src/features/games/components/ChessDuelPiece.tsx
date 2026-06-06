import { CHESS_DUEL_PIECES } from '../chessDuelAssets'
import type { Piece } from '../utils/chessDuelEngine'

type Props = {
  piece: Exclude<Piece, '.'>
}

export function ChessDuelPiece({ piece }: Props) {
  const isWhite = piece === piece.toUpperCase()

  return (
    <img
      className={`pm-chess-piece-img ${isWhite ? 'is-white' : 'is-black'}`}
      src={CHESS_DUEL_PIECES[piece]}
      alt=""
      draggable={false}
    />
  )
}
