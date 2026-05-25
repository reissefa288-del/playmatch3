import { MathDuelAnswerGrid } from './MathDuelAnswerGrid'
import { MathDuelProblem } from './MathDuelProblem'
import type { MathLaneState, MathProblem } from '../utils/mathDuelEngine'

type MathDuelSideProps = {
  lane: MathLaneState
  problem: MathProblem
  accent: 'cyan' | 'pink'
  interactive?: boolean
  onPick?: (index: number) => void
}

export function MathDuelSide({ lane, problem, accent, interactive, onPick }: MathDuelSideProps) {
  return (
    <div className={`pm-math-side is-${accent}`}>
      <MathDuelProblem problem={problem} compact />
      <MathDuelAnswerGrid
        lane={lane}
        problem={problem}
        accent={accent}
        interactive={interactive}
        onPick={onPick}
      />
    </div>
  )
}
