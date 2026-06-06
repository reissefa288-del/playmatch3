import { motion } from 'framer-motion'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  blockHeightForCount,
  calcDropDistancePx,
  FALL_DURATION_MS,
  isLaneEliminated,
  isLaneInDanger,
  landingBottomPx,
  laneSpeedTier,
  LIFE_RECOVERY_PERFECTS,
  LIVES,
  MEGA_COMBO_AT,
  previewLanding,
  SLIDE_TOP_PX,
  type StackLaneState,
} from '../utils/stackDuelEngine'
import { StackHitReaction } from './StackHitReaction'

type StackDuelTowerProps = {
  lane: StackLaneState
  accent: 'cyan' | 'pink'
  liveScore?: number
  interactive?: boolean
  onLand?: () => void
}

function formatScore(n: number) {
  return n.toLocaleString('tr-TR')
}

export function StackDuelTower({
  lane,
  accent,
  liveScore = 0,
  interactive = false,
  onLand,
}: StackDuelTowerProps) {
  const { platform, blocks } = lane
  const blockH = blockHeightForCount(blocks.length)
  const gap = 3
  const landBottom = landingBottomPx(blocks.length, blockH, gap)
  const stageRef = useRef<HTMLDivElement>(null)
  const landedRef = useRef(false)
  const [dropPx, setDropPx] = useState(100)

  const showMover = !lane.finished && lane.lives > 0 && !lane.falling
  const isFalling = Boolean(lane.falling)
  const mover = lane.falling ?? lane.active

  const preview = useMemo(() => previewLanding(lane), [lane])
  const inDanger = isLaneInDanger(lane)
  const eliminated = isLaneEliminated(lane)
  const speedTier = laneSpeedTier(lane)

  useLayoutEffect(() => {
    const el = stageRef.current
    if (!el) return
    setDropPx(calcDropDistancePx(el.clientHeight, blocks.length, blockH, gap))
  }, [blocks.length, blockH, gap, isFalling])

  useLayoutEffect(() => {
    if (!isFalling) landedRef.current = false
  }, [isFalling])

  const handleLand = () => {
    if (landedRef.current) return
    landedRef.current = true
    onLand?.()
  }

  const reacting = Boolean(lane.perfectPop && lane.lastEvent && lane.lastEvent !== 'over')
  const reactionClass = reacting ? ` is-reacting is-reacting--${lane.lastEvent}` : ''

  return (
    <motion.div
      className={`pm-stack-tower is-${accent}${interactive ? ' is-interactive' : ''}${reactionClass}${inDanger ? ' is-danger' : ''}${eliminated ? ' is-eliminated' : ''}`}
      animate={lane.shake > 0 ? { x: [0, -5, 5, -3, 0] } : { x: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      <span className="pm-stack-tower__bloom" aria-hidden />
      <span className="pm-stack-tower__volumetric" aria-hidden />
      <span className="pm-stack-tower__ssr" aria-hidden />
      <span className="pm-stack-tower__aura" aria-hidden />
      <span className="pm-stack-tower__corner pm-stack-tower__corner--tl" aria-hidden />
      <span className="pm-stack-tower__corner pm-stack-tower__corner--tr" aria-hidden />
      <span className="pm-stack-tower__corner pm-stack-tower__corner--bl" aria-hidden />
      <span className="pm-stack-tower__corner pm-stack-tower__corner--br" aria-hidden />

      <div className="pm-stack-tower__next">
        <span>NEXT</span>
        <i className="pm-stack-tower__next-sq" style={{ background: lane.nextColor }} aria-hidden />
      </div>

      <p className="pm-stack-tower__live-score">{formatScore(liveScore)}</p>

      <div
        className={`pm-stack-tower__lives${lane.perfectStreak > 0 && lane.lives < LIVES ? ' is-streaking' : ''}`}
        aria-label={`${lane.lives} can kaldı${lane.perfectStreak > 0 ? `, ${lane.perfectStreak} perfect serisi` : ''}`}
      >
        {Array.from({ length: LIVES }, (_, i) => (
          <i key={i} className={i < lane.lives ? 'is-full' : 'is-empty'} aria-hidden />
        ))}
        {lane.perfectStreak > 0 && lane.lives < LIVES ? (
          <span className="pm-stack-tower__life-streak">
            {lane.perfectStreak}/{LIFE_RECOVERY_PERFECTS}
          </span>
        ) : null}
      </div>

      {speedTier > 0 ? (
        <span className="pm-stack-tower__speed-tier">HIZ {speedTier + 1}</span>
      ) : null}

      {eliminated ? <span className="pm-stack-tower__eliminated">ELENDİ</span> : null}
      {inDanger && !eliminated ? <span className="pm-stack-tower__danger-tag">TEHLİKE</span> : null}

      <div
        ref={stageRef}
        className="pm-stack-tower__stage"
        style={{ ['--stack-block-h' as string]: `${blockH}px`, ['--stack-block-gap' as string]: `${gap}px` }}
      >
        <span className="pm-stack-tower__grid" aria-hidden />
        <span className="pm-stack-tower__vignette" aria-hidden />
        <span className="pm-stack-tower__stage-bloom" aria-hidden />
        <span className="pm-stack-tower__motion-blur" aria-hidden />

        <div className="pm-stack-tower__slide-zone" style={{ height: dropPx + blockH + 24 }}>
          <span className="pm-stack-tower__rail-glow" aria-hidden />
          <span className="pm-stack-tower__rail" aria-hidden />
          <span className="pm-stack-tower__energy-trail" aria-hidden />
        </div>

        <div className="pm-stack-tower__stack">
          <span
            className="pm-stack-block is-platform"
            style={{
              ['--block-x' as string]: `${platform.x * 100}%`,
              ['--block-w' as string]: `${platform.width * 100}%`,
              ['--block-color' as string]: platform.color,
            }}
          />

          {blocks.map((block, i) => (
            <span
              key={`${i}-${block.x}-${block.width}`}
              className="pm-stack-block is-placed"
              style={{
                ['--stack-index' as string]: String(i),
                ['--block-x' as string]: `${block.x * 100}%`,
                ['--block-w' as string]: `${block.width * 100}%`,
                ['--block-color' as string]: block.color,
              }}
            />
          ))}
        </div>

        {showMover ? (
          <>
            <span
              className={`pm-stack-ghost${preview.valid ? '' : ' is-danger'}`}
              style={{
                ['--block-x' as string]: `${preview.x * 100}%`,
                ['--block-w' as string]: `${Math.max(preview.width, 0.06) * 100}%`,
                bottom: landBottom,
              }}
              aria-hidden
            />
            <span
              className="pm-stack-drop-line"
              style={{
                ['--block-x' as string]: `${mover.x * 100}%`,
                ['--block-color' as string]: mover.color,
                ['--drop-h' as string]: `${dropPx}px`,
              }}
              aria-hidden
            />
            <span
              className="pm-stack-block is-sliding"
              style={{
                ['--block-x' as string]: `${mover.x * 100}%`,
                ['--block-w' as string]: `${mover.width * 100}%`,
                ['--block-color' as string]: mover.color,
                top: SLIDE_TOP_PX,
              }}
            />
          </>
        ) : null}

        {isFalling && lane.falling ? (
          <>
            <span
              className="pm-stack-ghost is-locked"
              style={{
                ['--block-x' as string]: `${preview.x * 100}%`,
                ['--block-w' as string]: `${Math.max(preview.width, 0.06) * 100}%`,
                bottom: landBottom,
              }}
              aria-hidden
            />
            <motion.span
              className="pm-stack-block is-falling"
              style={{
                ['--block-x' as string]: `${lane.falling.x * 100}%`,
                ['--block-w' as string]: `${lane.falling.width * 100}%`,
                ['--block-color' as string]: lane.falling.color,
                top: SLIDE_TOP_PX,
              }}
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: dropPx, opacity: 1 }}
              transition={{ duration: FALL_DURATION_MS / 1000, ease: 'linear' }}
              onAnimationComplete={handleLand}
            />
            <motion.span
              className="pm-stack-fall-trail"
              style={{
                ['--block-x' as string]: `${lane.falling.x * 100}%`,
                ['--block-w' as string]: `${lane.falling.width * 100}%`,
                ['--block-color' as string]: lane.falling.color,
                top: SLIDE_TOP_PX,
              }}
              initial={{ y: 0, opacity: 0.55, scaleY: 0.15 }}
              animate={{ y: dropPx * 0.5, opacity: 0, scaleY: 0.9 }}
              transition={{ duration: FALL_DURATION_MS / 1000, ease: 'linear' }}
              aria-hidden
            />
          </>
        ) : null}

        <span className="pm-stack-tower__platform-ring" aria-hidden />
        <span className="pm-stack-tower__platform" aria-hidden />
        <span className="pm-stack-tower__landing-glow" aria-hidden />
      </div>

      {reacting && lane.lastEvent ? (
        <StackHitReaction event={lane.lastEvent} accent={accent} />
      ) : null}

      {lane.perfectPop ? (
        <motion.span
          className={`pm-stack-tower__perfect is-${lane.lastEvent ?? 'place'}`}
          initial={{ opacity: 0, y: 16, scale: 0.5 }}
          animate={{ opacity: 1, y: -8, scale: 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 22 }}
        >
          <span className="pm-stack-tower__perfect-glow" aria-hidden />
          <span className="pm-stack-tower__perfect-text">{lane.perfectPop}</span>
        </motion.span>
      ) : null}

      {lane.combo >= MEGA_COMBO_AT ? (
        <motion.span
          className="pm-stack-tower__mega-badge"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          x2 PUAN
        </motion.span>
      ) : null}

      {lane.combo > 1 ? (
        <motion.span
          className={`pm-stack-tower__combo${lane.combo >= 4 ? ' is-mega' : lane.combo >= 2 ? ' is-hot' : ''}`}
          key={lane.combo}
          initial={{ opacity: 0, scale: 0.4, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
        >
          <span className="pm-stack-tower__combo-streak" aria-hidden />
          <span className="pm-stack-tower__combo-label">COMBO</span>
          <strong>x{lane.combo}</strong>
        </motion.span>
      ) : null}
    </motion.div>
  )
}
