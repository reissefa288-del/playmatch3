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
    <div
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
     
     
     
    >
      <div className="pm-snake-board__meta">
        <span
          key={lane.score}
         
         
         
        >
          {lane.score}
        </span>
        <small>
          UZ {lane.length} · 💎 {lane.diamondsCollected}
        </small>
      </div>

      <div className="pm-snake-board__viewport">
        <span className="pm-snake-board__corner pm-snake-board__corner--tl" aria-hidden />
        <span className="pm-snake-board__corner pm-snake-board__corner--tr" aria-hidden />
        <span className="pm-snake-board__corner pm-snake-board__corner--bl" aria-hidden />
        <span className="pm-snake-board__corner pm-snake-board__corner--br" aria-hidden />

        <>
          {fx ? (
            <div
              key={fx.tick}
              className={`pm-snake-board__pickup-pop is-${fx.kind} is-${accent}`}
             
             
             
             
            >
              +{fx.scoreGain}
              {fx.kind === 'diamond' ? <em>ELMAS</em> : null}
            </div>
          ) : null}
        </>

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
          <>
            {fx ? (
              <div
                key={`burst-${fx.tick}`}
                className="pm-snake-board__burst-anchor"
                style={burstPosition(fx.cell)}
               
               
               
               
              >
                <SnakePickupBurst accent={accent} kind={fx.kind} />
              </div>
            ) : null}
          </>
        </div>
      </div>
    </div>
  )
}
