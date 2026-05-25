import { motion } from 'framer-motion'
import type { CandyLaneState, Cell } from '../utils/candyDuelEngine'

type CandyDuelBoardProps = {
  lane: CandyLaneState
  accent: 'cyan' | 'pink'
  interactive?: boolean
  onPick?: (cell: Cell) => void
}

const GLYPHS = ['△', '⬢', '▣', '⚡', '◉', '✶']

export function CandyDuelBoard({ lane, accent, interactive = false, onPick }: CandyDuelBoardProps) {
  return (
    <div className={`pm-candy-board is-${accent}`}>
      <div className="pm-candy-board__grid" role="grid" aria-label="Candy board">
        {lane.board.map((row, r) =>
          row.map((value, c) => {
            const selected = lane.selected?.row === r && lane.selected?.col === c
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                role="gridcell"
                className={`pm-candy-cell type-${value}${selected ? ' is-selected' : ''}`}
                onClick={() => onPick?.({ row: r, col: c })}
                disabled={!interactive}
                aria-pressed={selected}
              >
                <span>{GLYPHS[value] ?? '•'}</span>
              </button>
            )
          }),
        )}
      </div>

      {lane.message ? (
        <motion.span
          className={`pm-candy-board__message is-${accent}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {lane.message}
        </motion.span>
      ) : null}
    </div>
  )
}
