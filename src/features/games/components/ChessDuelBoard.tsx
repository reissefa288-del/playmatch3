import type { Board, ChessMove, Piece } from '../utils/chessDuelEngine'
import { ChessDuelPiece } from './ChessDuelPiece'

type Props = {
  board: Board
  selected: number | null
  legalTargets: number[]
  lastMove: ChessMove | null
  inCheck: boolean
  disabled: boolean
  onSquare: (sq: number) => void
}

export function ChessDuelBoard({
  board,
  selected,
  legalTargets,
  lastMove,
  inCheck,
  disabled,
  onSquare,
}: Props) {
  const rows = Array.from({ length: 8 }, (_, r) => r)

  return (
    <div className={`pm-chess-board ${inCheck ? 'is-check' : ''}`} role="grid" aria-label="Satranç tahtası">
      {rows.map((r) => (
        <div key={r} className="pm-chess-board__row" role="row">
          {Array.from({ length: 8 }, (_, c) => {
            const sq = r * 8 + c
            const piece = board[sq]!
            const isLight = (r + c) % 2 === 0
            const isSelected = selected === sq
            const isTarget = legalTargets.includes(sq)
            const isLast =
              lastMove != null && (lastMove.from === sq || lastMove.to === sq)
            const isKingInCheck = inCheck && (piece === 'K' || piece === 'k')

            return (
              <button
                key={sq}
                type="button"
                className={[
                  'pm-chess-board__sq',
                  isLight ? 'is-light' : 'is-dark',
                  isSelected ? 'is-selected' : '',
                  isTarget ? 'is-target' : '',
                  isLast ? 'is-last' : '',
                  isKingInCheck ? 'is-king-check' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                disabled={disabled}
                onClick={() => onSquare(sq)}
                aria-label={`${String.fromCharCode(97 + c)}${8 - r}`}
              >
                {isTarget ? <span className="pm-chess-board__dot" aria-hidden /> : null}
                {piece !== '.' ? (
                  <span
                    className={`pm-chess-board__piece ${piece === piece.toUpperCase() ? 'is-white' : 'is-black'}`}
                    aria-hidden
                  >
                    <ChessDuelPiece piece={piece as Exclude<Piece, '.'>} />
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      ))}
      <div className="pm-chess-board__files" aria-hidden>
        {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((f) => (
          <span key={f}>{f}</span>
        ))}
      </div>
    </div>
  )
}
