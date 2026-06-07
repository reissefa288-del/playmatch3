import { useCallback, useRef } from 'react'
import {
  enemyGlyph,
  HUMAN_Y,
  SHIP_X,
  type DefenderSideState,
} from '../utils/defenderDuelEngine'
import type { DefParticle } from '../utils/defenderDuelFx'

type Props = {
  p1: DefenderSideState
  p2: DefenderSideState
  now: number
  fxP1: DefParticle[]
  fxP2: DefParticle[]
  shakeP1Until?: number
  muzzleP1Until?: number
  disabled?: boolean
  onPointerShip: (clientY: number, rect: DOMRect) => void
}

const STAR_SEEDS = [
  { x: 6, y: 10, s: 1.1, d: 0 },
  { x: 18, y: 24, s: 0.75, d: 0.4 },
  { x: 31, y: 7, s: 0.95, d: 0.8 },
  { x: 44, y: 18, s: 1.25, d: 1.2 },
  { x: 57, y: 11, s: 0.85, d: 0.2 },
  { x: 69, y: 26, s: 1.05, d: 1.6 },
  { x: 82, y: 9, s: 0.7, d: 0.6 },
  { x: 91, y: 21, s: 1.15, d: 1.1 },
  { x: 12, y: 38, s: 0.65, d: 1.4 },
  { x: 28, y: 44, s: 1.2, d: 0.3 },
  { x: 48, y: 36, s: 0.8, d: 0.9 },
  { x: 63, y: 48, s: 1.05, d: 1.8 },
  { x: 76, y: 40, s: 0.72, d: 0.5 },
  { x: 88, y: 52, s: 0.95, d: 1.3 },
]

function FxLayer({ particles, now }: { particles: DefParticle[]; now: number }) {
  return (
    <>
      {particles.map((p) => {
        const age = now - p.bornAt
        const t = Math.min(1, age / p.lifeMs)
        const isRing = p.kind === 'ring'
        return (
          <span
            key={p.id}
            className={['pm-def-screen__fx', `is-${p.kind}`].join(' ')}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              opacity: 1 - t,
              ...(isRing
                ? {}
                : {
                    transform: `translate(-50%, -50%) rotate(${p.angle}deg) scale(${1 - t * 0.4})`,
                  }),
            }}
            aria-hidden
          />
        )
      })}
    </>
  )
}

function TrackAtmosphere({ accent }: { accent: 'cyan' | 'pink' }) {
  return (
    <div className="pm-def-screen__atmos" aria-hidden>
      <div className={`pm-def-screen__void is-${accent}`} />
      <div className={`pm-def-screen__aurora is-${accent}`} />
      {STAR_SEEDS.map((star, index) => (
        <span
          key={index}
          className="pm-def-screen__star"
          style={
            {
              left: `${star.x}%`,
              top: `${star.y}%`,
              '--star-scale': star.s,
              '--star-delay': `${star.d}s`,
            } as React.CSSProperties
          }
        />
      ))}
      <div className="pm-def-screen__grid" />
      <div className={`pm-def-screen__horizon-glow is-${accent}`} />
    </div>
  )
}

function DefenderScreen({
  side,
  label,
  accent,
  now,
  particles,
  shaking,
  muzzleFlash,
  interactive,
  disabled,
  onPointerShip,
}: {
  side: DefenderSideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  particles: DefParticle[]
  shaking?: boolean
  muzzleFlash?: boolean
  interactive: boolean
  disabled?: boolean
  onPointerShip?: (clientY: number, rect: DOMRect) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const invuln = now < side.invulnUntil

  const handlePointer = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive || disabled || !trackRef.current || !onPointerShip) return
      onPointerShip(e.clientY, trackRef.current.getBoundingClientRect())
    },
    [disabled, interactive, onPointerShip],
  )

  return (
    <div className={['pm-def-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <div className="pm-def-screen__bezel" aria-hidden />
      <p className="pm-def-screen__label">
        <span className="pm-def-screen__label-dot" aria-hidden />
        {label}
      </p>
      <div
        ref={trackRef}
        className={['pm-def-screen__track', shaking ? 'is-shake' : ''].filter(Boolean).join(' ')}
        onPointerDown={handlePointer}
        onPointerMove={handlePointer}
        role="presentation"
      >
        <TrackAtmosphere accent={accent} />

        <div className="pm-def-screen__ground">
          <div className={`pm-def-screen__ground-glow is-${accent}`} />
          <div className="pm-def-screen__city-lights" />
          <div className="pm-def-screen__defense-line" />
        </div>

        {side.humans.map((h) => (
          <span
            key={h.id}
            className={['pm-def-screen__human', h.alive ? '' : 'is-lost'].filter(Boolean).join(' ')}
            style={{ left: `${h.x}%`, top: `${HUMAN_Y}%` }}
            aria-hidden
          >
            {h.alive ? '🧑' : '·'}
          </span>
        ))}

        {side.enemies.map((e) => (
          <span
            key={e.id}
            className={['pm-def-screen__enemy', `is-${e.kind}`, e.diving ? 'is-dive' : ''].filter(Boolean).join(' ')}
            style={{ left: `${e.x}%`, top: `${e.y}%` }}
            aria-hidden
          >
            {enemyGlyph(e.kind)}
          </span>
        ))}

        {side.bullets.map((b) => (
          <span
            key={b.id}
            className={['pm-def-screen__bullet', b.fromPlayer ? 'is-player' : 'is-enemy'].filter(Boolean).join(' ')}
            style={{ left: `${b.x}%`, top: `${b.y}%` }}
            aria-hidden
          >
            <span className="pm-def-screen__bullet-core" aria-hidden />
            <span className="pm-def-screen__bullet-trail" aria-hidden />
          </span>
        ))}

        {side.lives > 0 ? (
          <>
            {muzzleFlash ? (
              <span
                className={`pm-def-screen__muzzle-flash is-${accent}`}
                style={{ left: `${SHIP_X + 5}%`, top: `${side.shipY}%` }}
                aria-hidden
              />
            ) : null}
            <span
              className={['pm-def-screen__ship-glow', `is-${accent}`, invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
              style={{ left: `${SHIP_X}%`, top: `${side.shipY}%` }}
              aria-hidden
            />
            <span
              className={['pm-def-screen__ship', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
              style={{ left: `${SHIP_X}%`, top: `${side.shipY}%` }}
              aria-hidden
            />
          </>
        ) : null}

        <FxLayer particles={particles} now={now} />

        {interactive ? <div className={`pm-def-screen__spotlight is-${accent}`} aria-hidden /> : null}
        <div className="pm-def-screen__vignette" aria-hidden />
        <div className="pm-def-screen__scanline" aria-hidden />
      </div>
    </div>
  )
}

export function DefenderDuelArena({
  p1,
  p2,
  now,
  fxP1,
  fxP2,
  shakeP1Until = 0,
  muzzleP1Until = 0,
  disabled = false,
  onPointerShip,
}: Props) {
  const shaking = now < shakeP1Until
  const muzzleFlash = now < muzzleP1Until

  return (
    <div className="pm-def-arena">
      <div className="pm-def-arena__frame" aria-hidden />
      <div className="pm-def-arena__beam" aria-hidden />
      <DefenderScreen
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        particles={fxP1}
        shaking={shaking}
        muzzleFlash={muzzleFlash}
        interactive
        disabled={disabled}
        onPointerShip={onPointerShip}
      />
      <DefenderScreen side={p2} label="RAKİP" accent="pink" now={now} particles={fxP2} interactive={false} />
    </div>
  )
}
