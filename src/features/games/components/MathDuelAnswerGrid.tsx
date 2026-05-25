import { motion } from 'framer-motion'
import type { MathLaneState, MathProblem } from '../utils/mathDuelEngine'

type MathDuelAnswerGridProps = {
  lane: MathLaneState
  problem: MathProblem
  accent: 'cyan' | 'pink'
  interactive?: boolean
  onPick?: (index: number) => void
}

export function MathDuelAnswerGrid({
  lane,
  problem,
  accent,
  interactive = false,
  onPick,
}: MathDuelAnswerGridProps) {
  const feedbackClass =
    lane.feedback === 'correct' ? 'is-correct' : lane.feedback === 'wrong' ? 'is-wrong' : ''

  return (
    <div className={`pm-math-grid is-${accent}${interactive ? ' is-interactive' : ''}`}>
      {lane.feedbackPop ? (
        <motion.span
          className={`pm-math-grid__banner ${feedbackClass}`}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {lane.feedbackPop}
        </motion.span>
      ) : null}

      <div className="pm-math-grid__cells" role="group" aria-label="Cevap seçenekleri">
        {problem.choices.map((value, index) => {
          const selected = lane.selectedIndex === index
          const correctPick = selected && index === problem.correctIndex
          const wrongPick = selected && index !== problem.correctIndex
          return (
            <button
              key={`${problem.id}-${index}`}
              type="button"
              className={`pm-math-cell${selected ? ' is-selected' : ''}${correctPick ? ' is-hit' : ''}${wrongPick ? ' is-miss' : ''}`}
              disabled={!interactive || lane.answered || !lane.lives}
              onClick={() => onPick?.(index)}
            >
              <span>{value}</span>
              {interactive && selected && correctPick ? (
                <span className="pm-math-cell__hand" aria-hidden>
                  👆
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
