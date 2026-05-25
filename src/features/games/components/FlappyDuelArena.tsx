import { motion } from 'framer-motion'
import type { RefObject } from 'react'
import { FlappyDuelCanvas } from './FlappyDuelCanvas'
import type { FlappyLaneState } from '../utils/flappyDuelEngine'

type FlappyDuelArenaProps = {
  lane: FlappyLaneState
  laneRef: RefObject<FlappyLaneState>
  accent: 'cyan' | 'pink'
  interactive?: boolean
  onFlap?: () => void
  active?: boolean
}

export function FlappyDuelArena({
  lane,
  laneRef,
  accent,
  interactive = false,
  onFlap,
  active = true,
}: FlappyDuelArenaProps) {
  const gaugePct = Math.min(100, (lane.score / Math.max(lane.best, 1)) * 100)
  const status = lane.alive ? 'AKTİF' : 'ELENDİ'

  return (
    <div className={`pm-flappy-arena is-${accent}`}>
      <aside className={`pm-flappy-gauge is-${accent}`} aria-hidden>
        <span className="pm-flappy-gauge__label">EN YÜKSEK</span>
        <strong>{lane.best}</strong>
        <div className="pm-flappy-gauge__track">
          <i style={{ height: `${gaugePct}%` }} />
        </div>
        <span className="pm-flappy-gauge__label">SENİN</span>
        <strong className="is-live">{lane.score}</strong>
      </aside>

      <button
        type="button"
        className="pm-flappy-arena__play"
        disabled={!interactive || !lane.alive}
        onPointerDown={(e) => {
          e.preventDefault()
          onFlap?.()
        }}
        aria-label={interactive ? 'Zıpla' : 'Rakip alanı'}
      >
        <span className={`pm-flappy-arena__status ${lane.alive ? 'is-live' : 'is-down'}`}>{status}</span>
        <FlappyDuelCanvas laneRef={laneRef} accent={accent} active={active} />
        <div className="pm-flappy-arena__overlay">
          <span className="pm-flappy-arena__score-wrap">
            <span className="pm-flappy-arena__score-ring" aria-hidden />
            <span className="pm-flappy-arena__score">{lane.score}</span>
          </span>
          <span className="pm-flappy-arena__combo">COMBO x{lane.combo}</span>
          {lane.crashPop ? (
            <motion.span
              className="pm-flappy-arena__pop"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {lane.crashPop}
            </motion.span>
          ) : null}
        </div>
      </button>
    </div>
  )
}
