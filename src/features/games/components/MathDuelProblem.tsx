import { motion } from 'framer-motion'
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
      <motion.div
        className="pm-math-problem"
        key={problem.id}
        initial={{ opacity: 0, y: -8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      >
        <span className="pm-math-problem__shine" aria-hidden />
        <span className="pm-math-problem__pulse" aria-hidden />
        <p className="pm-math-problem__expr" aria-label="İşlem">
          {problem.tokens.map((token, i) =>
            token.kind === 'num' ? (
              <motion.span
                key={`${problem.id}-n-${i}`}
                className="is-num"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 + i * 0.03 }}
              >
                {token.value}
              </motion.span>
            ) : (
              <motion.span
                key={`${problem.id}-o-${i}`}
                className={`is-op is-${token.tone}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.06 + i * 0.03, type: 'spring', stiffness: 500 }}
              >
                {token.value}
              </motion.span>
            ),
          )}
          <span className="is-eq">=</span>
          <span className="is-q">?</span>
        </p>
      </motion.div>
    </div>
  )
}
