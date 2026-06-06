import { useCallback, useRef } from 'react'
import {
  EMITTER_CHARGES_MAX,
  EMITTER_X,
  EXPLODE_RADIUS,
  getThreatenedNodes,
  type McSideState,
} from '../utils/missileCommandDuelEngine'
import type { RwParticle } from '../utils/riftWardFx'

type Props = {
  p1: McSideState
  p2: McSideState
  now: number
  fxP1: RwParticle[]
  fxP2: RwParticle[]
  shakeP1?: boolean
  disabled?: boolean
  onFire: (clientX: number, clientY: number, rect: DOMRect) => void
}

const STAR_SEEDS = [
  { x: 8, y: 12, s: 1.2 },
  { x: 22, y: 28, s: 0.8 },
  { x: 41, y: 8, s: 1 },
  { x: 58, y: 22, s: 1.4 },
  { x: 73, y: 14, s: 0.9 },
  { x: 88, y: 34, s: 1.1 },
  { x: 15, y: 48, s: 0.7 },
  { x: 35, y: 55, s: 1.3 },
  { x: 52, y: 42, s: 0.85 },
  { x: 67, y: 58, s: 1 },
  { x: 82, y: 46, s: 0.75 },
  { x: 93, y: 18, s: 1.2 },
]

function ShardTrail({ points }: { points: { x: number; y: number }[] }) {
  if (points.length < 2) return null
  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')
  return (
    <svg className="pm-missile-screen__trail-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      <path className="pm-missile-screen__trail-path" d={d} />
    </svg>
  )
}

function FxLayer({ particles, now }: { particles: RwParticle[]; now: number }) {
  return (
    <>
      {particles.map((p) => {
        const age = now - p.bornAt
        const t = Math.min(1, age / p.lifeMs)
        return (
          <span
            key={p.id}
            className={['pm-missile-screen__fx', `is-${p.kind}`].join(' ')}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: `translate(-50%, -50%) rotate(${p.angle}deg) scale(${1 - t * 0.35})`,
              opacity: 1 - t,
            }}
            aria-hidden
          />
        )
      })}
    </>
  )
}

function NexusField({
  side,
  label,
  accent,
  now,
  particles,
  shaking,
  interactive,
  disabled,
  onFire,
}: {
  side: McSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  particles: RwParticle[]
  shaking?: boolean
  interactive: boolean
  disabled?: boolean
  onFire?: (clientX: number, clientY: number, rect: DOMRect) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)

  const handlePointer = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive || disabled || !trackRef.current || !onFire) return
      onFire(e.clientX, e.clientY, trackRef.current.getBoundingClientRect())
    },
    [disabled, interactive, onFire],
  )

  const emitterFlash = side.emitterFlashUntil > now
  const threatened = getThreatenedNodes(side)
  const comboActive = side.combo >= 2 && side.comboUntil > now

  return (
    <div className={['pm-missile-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-missile-screen__label">{label}</p>
      <div
        ref={trackRef}
        className={['pm-missile-screen__track', shaking ? 'is-shake' : ''].filter(Boolean).join(' ')}
        onPointerDown={handlePointer}
        role="presentation"
      >
        <div className="pm-missile-screen__lane-hud" aria-hidden>
          <span className="pm-missile-screen__wave">DALGA {side.wave}</span>
          {comboActive ? <span className="pm-missile-screen__combo">REZONANS ×{side.combo}</span> : null}
        </div>

        <div className="pm-missile-screen__void" aria-hidden />
        <div className="pm-missile-screen__aurora" aria-hidden />
        <div className="pm-missile-screen__hexgrid" aria-hidden />
        {STAR_SEEDS.map((star, i) => (
          <span
            key={i}
            className="pm-missile-screen__star"
            style={{ left: `${star.x}%`, top: `${star.y}%`, animationDelay: `${i * 0.35}s`, opacity: star.s }}
            aria-hidden
          />
        ))}
        <div className="pm-missile-screen__platform" aria-hidden />
        <div className="pm-missile-screen__scanline" aria-hidden />

        {side.nodes.map((n) => (
          <span
            key={n.id}
            className={[
              'pm-missile-screen__nexus',
              n.alive ? '' : 'is-dead',
              threatened.includes(n.id) ? 'is-threat' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
            aria-hidden
          >
            {threatened.includes(n.id) ? <span className="pm-missile-screen__nexus-threat" /> : null}
            <span className="pm-missile-screen__nexus-core" />
            <span className="pm-missile-screen__nexus-ring" />
          </span>
        ))}

        {EMITTER_X.map((x, i) => {
          const charges = side.emitters[i]?.charges ?? 0
          const empty = charges <= 0
          return (
            <span
              key={x}
              className={[
                'pm-missile-screen__emitter',
                emitterFlash ? 'is-firing' : '',
                empty ? 'is-empty' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ left: `${x}%` }}
              aria-hidden
            >
              <span className="pm-missile-screen__emitter-pylon" />
              <span className="pm-missile-screen__emitter-ring" />
              <span className="pm-missile-screen__emitter-charges">
                {Array.from({ length: EMITTER_CHARGES_MAX }, (_, j) => (
                  <span key={j} className={['pm-missile-screen__emitter-charge', j < charges ? 'is-on' : ''].filter(Boolean).join(' ')} />
                ))}
              </span>
              {emitterFlash ? <span className="pm-missile-screen__emitter-flash" /> : null}
            </span>
          )
        })}

        {side.shards.map((s) => (
          <ShardTrail key={`trail-${s.id}`} points={s.trail} />
        ))}

        {side.shards.map((s) => (
          <span
            key={s.id}
            className={['pm-missile-screen__shard', `is-${s.kind}`].join(' ')}
            style={{ left: `${s.x}%`, top: `${s.y}%`, transform: `translate(-50%, -50%) rotate(${s.heading}deg)` }}
            aria-hidden
          >
            <span className="pm-missile-screen__shard-trail" />
            <span className="pm-missile-screen__shard-core" />
          </span>
        ))}

        {side.pulses.map((p) => {
          if (p.phase === 'burst' && p.boomUntil <= now) return null

          if (p.phase === 'burst') {
            return (
              <span key={p.id} className="pm-missile-screen__burst-wrap" aria-hidden>
                <span
                  className="pm-missile-screen__burst"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: `${EXPLODE_RADIUS * 2}%`,
                    height: `${EXPLODE_RADIUS * 2}%`,
                  }}
                />
                <span
                  className="pm-missile-screen__burst-flash"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                />
              </span>
            )
          }

          return (
            <span key={p.id} className="pm-missile-screen__pulse-wrap" aria-hidden>
              <span
                className="pm-missile-screen__pulse-beam"
                style={{
                  left: `${p.originX}%`,
                  top: `${p.originY}%`,
                  width: `${Math.hypot(p.x - p.originX, p.y - p.originY)}%`,
                  transform: `rotate(${Math.atan2(p.y - p.originY, p.x - p.originX) * (180 / Math.PI)}deg)`,
                }}
              />
              <span className="pm-missile-screen__pulse-head" style={{ left: `${p.x}%`, top: `${p.y}%` }} />
            </span>
          )
        })}

        <FxLayer particles={particles} now={now} />
      </div>
    </div>
  )
}

export function MissileCommandDuelArena({
  p1,
  p2,
  now,
  fxP1,
  fxP2,
  shakeP1 = false,
  disabled = false,
  onFire,
}: Props) {
  return (
    <div className="pm-missile-arena">
      <NexusField
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        particles={fxP1}
        shaking={shakeP1}
        interactive
        disabled={disabled}
        onFire={onFire}
      />
      <NexusField side={p2} label="RAKİP" accent="pink" now={now} particles={fxP2} interactive={false} />
    </div>
  )
}
