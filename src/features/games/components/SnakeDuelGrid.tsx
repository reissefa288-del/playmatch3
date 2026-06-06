import { AnimatePresence, motion } from 'framer-motion'
import {
  COLS,
  DIAMOND_LIFETIME_TICKS,
  ROWS,
  colOf,
  isInvincible,
  type SnakeLaneState,
} from '../utils/snakeDuelEngine'
import { SnakeArenaCanvas } from './SnakeArenaCanvas'
import { SnakePickupBurst } from './SnakePickupBurst'

type Props = {
  lane: SnakeLaneState
  accent: 'cyan' | 'pink'
  roundElapsedSec?: number
}

function burstPosition(cell: number) {
  const col = colOf(cell)
  const row = Math.floor(cell / COLS)
  return {
    left: `${((col + 0.5) / COLS) * 100}%`,
    top: `${((row + 0.5) / ROWS) * 100}%`,
  }
}

export function SnakeDuelGrid({ lane, accent, roundElapsedSec = 0 }: Props) {
  const fx = lane.pickupFx
  const invincible = isInvincible(lane)
  const diamondUrgent = lane.diamond !== null && lane.diamondTicks > 0 && lane.diamondTicks <= 8

  return (
    <motion.div
      className={[
        'pm-snake-board',
        'is-nokia',
        `is-${accent}`,
        lane.alive ? '' : 'is-dead',
        invincible ? 'is-invincible' : '',
        lane.diamond !== null ? 'has-diamond' : '',
        diamondUrgent ? 'is-diamond-urgent' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
    >
      <div className="pm-snake-board__meta">
        <motion.span
          key={lane.score}
          initial={{ scale: 1.35, color: accent === 'cyan' ? '#93c5fd' : '#fbcfe8' }}
          animate={{ scale: 1, color: accent === 'cyan' ? '#60a5fa' : '#f9a8d4' }}
          transition={{ type: 'spring', stiffness: 520, damping: 18 }}
        >
          {lane.score}
        </motion.span>
        <small>
          UZ {lane.length} · 💎 {lane.diamondsCollected}
        </small>
      </div>

      <div className="pm-snake-board__viewport">
        <span className="pm-snake-board__corner pm-snake-board__corner--tl" aria-hidden />
        <span className="pm-snake-board__corner pm-snake-board__corner--tr" aria-hidden />
        <span className="pm-snake-board__corner pm-snake-board__corner--bl" aria-hidden />
        <span className="pm-snake-board__corner pm-snake-board__corner--br" aria-hidden />

        <AnimatePresence>
          {fx ? (
            <motion.div
              key={fx.tick}
              className={`pm-snake-board__pickup-pop is-${fx.kind} is-${accent}`}
              initial={{ opacity: 0, y: 10, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 560, damping: 22 }}
            >
              +{fx.scoreGain}
              {fx.kind === 'diamond' ? <em>ELMAS</em> : null}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {lane.diamond !== null ? (
          <div
            className="pm-snake-board__diamond-timer"
            aria-hidden
            style={{
              ['--diamond-pct' as string]: `${(lane.diamondTicks / DIAMOND_LIFETIME_TICKS) * 100}%`,
            }}
          />
        ) : null}

        <div className="pm-snake-board__playfield">
          <SnakeArenaCanvas lane={lane} accent={accent} roundElapsedSec={roundElapsedSec} />
          <AnimatePresence>
            {fx ? (
              <motion.div
                key={`burst-${fx.tick}`}
                className="pm-snake-board__burst-anchor"
                style={burstPosition(fx.cell)}
                initial={{ opacity: 1, scale: 0.6 }}
                animate={{ opacity: 0, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                <SnakePickupBurst accent={accent} kind={fx.kind} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
