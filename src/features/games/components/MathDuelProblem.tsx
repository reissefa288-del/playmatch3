import type { MathProblem } from '../utils/mathDuelEngine'

type MathDuelProblemProps = {
  problem: MathProblem
  roundLabel?: string
  compact?: boolean
}

export function MathDuelProblem({ problem, roundLabel, compact = false }: MathDuelProblemProps) {
  return (
    <div className={`pm-math-problem-wrap${compact ? ' is-compact' : ''}`}>
      {roundLabel ? <p className="pm-math-problem__round">{roundLabel}</p> : null}
      <div className="pm-math-problem">
        <p className="pm-math-problem__expr" aria-label="İşlem">
          {problem.tokens.map((token, i) =>
            token.kind === 'num' ? (
              <span key={i} className="is-num">
                {token.value}
              </span>
            ) : (
              <span key={i} className={`is-op is-${token.tone}`}>
                {token.value}
              </span>
            ),
          )}
          <span className="is-eq">=</span>
          <span className="is-q">?</span>
        </p>
      </div>
    </div>
  )
}
