import type { MathLaneState, MathProblem } from '../utils/mathDuelEngine'
import { MathAnswerFx } from './MathAnswerFx'
import { MathFeedbackToast } from './MathFeedbackToast'

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
  const showReveal =
    interactive && lane.answered && lane.feedback === 'wrong' && lane.lives >= 0

  return (
    <div
      className={`pm-math-grid is-${accent}${interactive ? ' is-interactive' : ''}${lane.feedback === 'wrong' ? ' is-shake' : ''}${lane.feedback === 'correct' ? ' is-celebrate' : ''}${lane.feedbackToast ? ' has-toast' : ''}`}
    >
      {lane.feedbackToast ? (
        <MathFeedbackToast toast={lane.feedbackToast} accent={accent} />
      ) : null}

      <div className="pm-math-grid__cells" role="group" aria-label="Cevap seçenekleri">
        {problem.choices.map((value, index) => {
          const selected = lane.selectedIndex === index
          const correctPick = selected && index === problem.correctIndex
          const wrongPick = selected && index !== problem.correctIndex
          const revealCorrect = showReveal && index === problem.correctIndex
          return (
            <button
              key={`${problem.id}-${index}`}
              type="button"
              className={`pm-math-cell${selected ? ' is-selected' : ''}${correctPick ? ' is-hit' : ''}${wrongPick ? ' is-miss' : ''}${revealCorrect ? ' is-reveal' : ''}`}
              aria-label={`Cevap ${value}`}
              disabled={!interactive || lane.answered || !lane.lives}
              onClick={() => onPick?.(index)}
             
             
             
            >
              <span className="pm-math-cell__edge" aria-hidden />
              <span className="pm-math-cell__glow" aria-hidden />
              {correctPick || wrongPick ? (
                <MathAnswerFx kind={correctPick ? 'hit' : 'miss'} accent={accent} />
              ) : null}
              <span className="pm-math-cell__value">{value}</span>
              {revealCorrect ? (
                <span className="pm-math-cell__tag" aria-hidden>
                  Doğru
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
