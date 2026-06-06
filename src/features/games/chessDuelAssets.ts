import kingWhite from '../../assets/chess-duel/piece-king-white.svg'
import kingBlack from '../../assets/chess-duel/piece-king-black.svg'
import queenWhite from '../../assets/chess-duel/piece-queen-white.svg'
import queenBlack from '../../assets/chess-duel/piece-queen-black.svg'
import rookWhite from '../../assets/chess-duel/piece-rook-white.svg'
import rookBlack from '../../assets/chess-duel/piece-rook-black.svg'
import bishopWhite from '../../assets/chess-duel/piece-bishop-white.svg'
import bishopBlack from '../../assets/chess-duel/piece-bishop-black.svg'
import knightWhite from '../../assets/chess-duel/piece-knight-white.svg'
import knightBlack from '../../assets/chess-duel/piece-knight-black.svg'
import pawnWhite from '../../assets/chess-duel/piece-pawn-white.svg'
import pawnBlack from '../../assets/chess-duel/piece-pawn-black.svg'
import type { Piece } from './utils/chessDuelEngine'

export const CHESS_DUEL_PIECES: Record<Exclude<Piece, '.'>, string> = {
  K: kingWhite,
  Q: queenWhite,
  R: rookWhite,
  B: bishopWhite,
  N: knightWhite,
  P: pawnWhite,
  k: kingBlack,
  q: queenBlack,
  r: rookBlack,
  b: bishopBlack,
  n: knightBlack,
  p: pawnBlack,
}
