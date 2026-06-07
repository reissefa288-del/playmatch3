import { useCallback, useRef } from 'react'
import { enemyGlyph, SHIP_Y, type Game1942SideState } from '../utils/game1942DuelEngine'
import type { Y42Particle } from '../utils/game1942DuelFx'

type Props = {
  p1: Game1942SideState
  p2: Game1942SideState
  now: number
  fxP1: Y42Particle[]
  fxP2: Y42Particle[]
  shakeP1Until?: number
  muzzleP1Until?: number
  disabled?: boolean
  onShipX: (x: number) => void
}

const STAR_SEEDS = [
  { x: 8, y: 6, s: 1, d: 0 },
  { x: 22, y: 14, s: 0.7, d: 0.5 },
  { x: 38, y: 4, s: 1.1, d: 1.1 },
  { x: 55, y: 12, s: 0.85, d: 0.3 },
  { x: 72, y: 8, s: 0.95, d: 1.4 },
  { x: 88, y: 18, s: 0.75, d: 0.8 },
  { x: 15, y: 28, s: 0.65, d: 1.7 },
  { x: 48, y: 22, s: 1.05, d: 0.2 },
  { x: 65, y: 32, s: 0.8, d: 1.2 },
  { x: 82, y: 26, s: 0.9, d: 0.6 },
]

function FxLayer({ particles, now }: { particles: Y42Particle[]; now: number }) {
  return (
    <>
      {particles.map((p) => {
        const age = now - p.bornAt
        const t = Math.min(1, age / p.lifeMs)
        const isRing = p.kind === 'ring'
        return (
          <span
            key={p.id}
            className={['pm-y42-screen__fx', `is-${p.kind}`].join(' ')}
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
    <div className="pm-y42-screen__atmos" aria-hidden>
      <div className={`pm-y42-screen__sky is-${accent}`} />
      <div className={`pm-y42-screen__sun is-${accent}`} />
      {STAR_SEEDS.map((star, index) => (
        <span
          key={index}
          className="pm-y42-screen__star"
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
      <div className="pm-y42-screen__haze" />
      <div className={`pm-y42-screen__horizon-glow is-${accent}`} />
    </div>
  )
}

function Game1942Screen({
  side,
  label,
  accent,
  now,
  particles,
  shaking,
  muzzleFlash,
  interactive,
  disabled,
  onShipX,
}: {
  side: Game1942SideState
  label: string
  accent: 'cyan' | 'pink'
  now: number
  particles: Y42Particle[]
  shaking?: boolean
  muzzleFlash?: boolean
  interactive: boolean
  disabled?: boolean
  onShipX?: (x: number) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const invuln = now < side.invulnUntil

  const pointerToX = useCallback(
    (clientX: number) => {
      const el = trackRef.current
      if (!el || !onShipX) return
      const rect = el.getBoundingClientRect()
      const pct = ((clientX - rect.left) / rect.width) * 100
      onShipX(pct)
    },
    [onShipX],
  )

  const handlePointer = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive || disabled) return
      pointerToX(e.clientX)
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    },
    [disabled, interactive, pointerToX],
  )

  return (
    <div className={['pm-y42-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <div className="pm-y42-screen__bezel" aria-hidden />
      <p className="pm-y42-screen__label">
        <span className="pm-y42-screen__label-dot" aria-hidden />
        {label}
      </p>
      <div
        ref={trackRef}
        className={['pm-y42-screen__track', shaking ? 'is-shake' : ''].filter(Boolean).join(' ')}
        onPointerDown={handlePointer}
        onPointerMove={handlePointer}
        role="presentation"
        style={{ '--y42-scroll': side.scrollY } as React.CSSProperties}
      >
        <TrackAtmosphere accent={accent} />

        <div className="pm-y42-screen__ocean">
          <div className="pm-y42-screen__ocean-wave" />
          <div className="pm-y42-screen__ocean-depth" />
        </div>
        <div className="pm-y42-screen__clouds" aria-hidden />

        {side.enemies.map((e) => (
          <span
            key={e.id}
            className={['pm-y42-screen__enemy', `is-${e.kind}`, e.mode === 'dive' ? 'is-diving' : ''].join(' ')}
            style={{ left: `${e.x}%`, top: `${e.y}%` }}
          >
            {enemyGlyph(e.kind)}
          </span>
        ))}

        {side.bullets.map((b) => (
          <span key={b.id} className="pm-y42-screen__bullet is-player" style={{ left: `${b.x}%`, top: `${b.y}%` }}>
            <span className="pm-y42-screen__bullet-core" aria-hidden />
            <span className="pm-y42-screen__bullet-trail" aria-hidden />
          </span>
        ))}

        {side.enemyBullets.map((b) => (
          <span key={b.id} className="pm-y42-screen__bullet is-enemy" style={{ left: `${b.x}%`, top: `${b.y}%` }}>
            <span className="pm-y42-screen__bullet-core" aria-hidden />
            <span className="pm-y42-screen__bullet-trail" aria-hidden />
          </span>
        ))}

        {side.lives > 0 ? (
          <>
            {muzzleFlash ? (
              <span
                className={`pm-y42-screen__muzzle-flash is-${accent}`}
                style={{ left: `${side.shipX}%`, top: `${SHIP_Y - 8}%` }}
                aria-hidden
              />
            ) : null}
            <span
              className={['pm-y42-screen__ship-glow', `is-${accent}`, invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
              style={{ left: `${side.shipX}%`, top: `${SHIP_Y}%` }}
              aria-hidden
            />
            <span
              className={['pm-y42-screen__ship', invuln ? 'is-invuln' : ''].filter(Boolean).join(' ')}
              style={{ left: `${side.shipX}%`, top: `${SHIP_Y}%` }}
              aria-hidden
            />
          </>
        ) : null}

        <FxLayer particles={particles} now={now} />

        {interactive ? <div className={`pm-y42-screen__spotlight is-${accent}`} aria-hidden /> : null}
        <div className="pm-y42-screen__vignette" aria-hidden />
        <div className="pm-y42-screen__scanline" aria-hidden />
      </div>
      {interactive ? <p className="pm-y42-screen__auto-fire">OTOMATİK ATEŞ</p> : null}
    </div>
  )
}

export function Game1942DuelArena({
  p1,
  p2,
  now,
  fxP1,
  fxP2,
  shakeP1Until = 0,
  muzzleP1Until = 0,
  disabled = false,
  onShipX,
}: Props) {
  const shaking = now < shakeP1Until
  const muzzleFlash = now < muzzleP1Until

  return (
    <div className="pm-y42-arena">
      <div className="pm-y42-arena__frame" aria-hidden />
      <div className="pm-y42-arena__beam" aria-hidden />
      <Game1942Screen
        side={p1}
        label="SEN"
        accent="cyan"
        now={now}
        particles={fxP1}
        shaking={shaking}
        muzzleFlash={muzzleFlash}
        interactive
        disabled={disabled}
        onShipX={onShipX}
      />
      <Game1942Screen side={p2} label="RAKİP" accent="pink" now={now} particles={fxP2} interactive={false} />
    </div>
  )
}
