import { useCallback, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { SliceDuelHealth } from './SliceDuelHealth'
import { SliceDuelIcon } from './SliceDuelIcons'
import type { SliceObject, SlicePoint, SliceSideState } from '../utils/sliceDuelEngine'
import { BOMB_SCORE_PENALTY, FRENZY_COMBO, objectPos } from '../utils/sliceDuelEngine'

type LaneProps = {
  side: SliceSideState
  now: number
  variant: 'p1' | 'p2'
  disabled?: boolean
  interactive?: boolean
  onSwipe?: (path: SlicePoint[]) => void
  slash?: SlicePoint[]
}

function toPercent(clientX: number, clientY: number, rect: DOMRect): SlicePoint {
  return {
    x: ((clientX - rect.left) / rect.width) * 100,
    y: ((clientY - rect.top) / rect.height) * 100,
  }
}

function ScorePopLayer({
  side,
  now,
  variant,
}: {
  side: SliceSideState
  now: number
  variant: 'p1' | 'p2'
}) {
  return (
    <>
      {side.scorePops.map((pop) => {
        if (now >= pop.until) return null
        const age = now - (pop.until - 820)
        const rise = age * 0.035
        return (
          <span
            key={pop.id}
            className={['pm-slice-score-pop', `is-${variant}`, `is-${pop.kind}`].join(' ')}
            style={{ left: `${pop.x}%`, top: `${pop.y - rise}%` }}
          >
            +{pop.amount}
          </span>
        )
      })}
    </>
  )
}

function JuiceBurstLayer({ side, now }: { side: SliceSideState; now: number }) {
  const JUICE_COLORS: Record<string, string> = {
    apple: '#ff5570',
    orange: '#ff9f43',
    melon: '#ff6b8a',
    star: '#ffd54a',
  }
  return (
    <>
      {side.juiceBursts.map((burst) => {
        if (now >= burst.until) return null
        const color = JUICE_COLORS[burst.icon] ?? '#b8ff3d'
        return (
          <span
            key={burst.id}
            className={`pm-slice-juice is-${burst.icon}`}
            style={{ left: `${burst.x}%`, top: `${burst.y}%`, '--juice-color': color } as CSSProperties}
            aria-hidden
          >
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i} className="pm-slice-juice__drop" style={{ '--i': i } as CSSProperties} />
            ))}
          </span>
        )
      })}
    </>
  )
}

function SparkLayer({ path, accent }: { path: SlicePoint[]; accent: 'cyan' | 'pink' }) {
  if (path.length < 2) return null
  const sparks: SlicePoint[] = []
  for (let i = 1; i < path.length; i += 2) {
    const a = path[i - 1]!
    const b = path[i]!
    sparks.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })
  }
  if (path.length > 0) sparks.push(path[path.length - 1]!)

  return (
    <>
      {sparks.map((s, i) => (
        <span
          key={`${i}-${s.x.toFixed(1)}`}
          className={`pm-slice-spark is-${accent}`}
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
          aria-hidden
        />
      ))}
    </>
  )
}

function ObjectLayer({ objects, now }: { objects: SliceObject[]; now: number }) {
  return (
    <>
      {objects.map((o) => {
        const { x, y, rotation } = objectPos(o, now)
        if (y < -12 || y > 112) return null

        if (o.sliced && o.slicedAt) {
          const age = now - o.slicedAt
          const split = age < 420
          if (!split) return null
          const drift = age * 0.022
          const isBomb = o.kind === 'bomb'
          return (
            <span
              key={o.id}
              className={['pm-slice-obj', 'is-sliced', isBomb ? 'is-bomb-burst' : ''].filter(Boolean).join(' ')}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {isBomb ? (
                <span className="pm-slice-obj__explosion" aria-hidden />
              ) : (
                <>
                  <span
                    className="pm-slice-obj__half is-left"
                    style={{
                      transform: `rotate(${rotation - 18 - age * 0.08}deg) translate(${-drift}px, ${drift * 0.6}px)`,
                    }}
                  >
                    <SliceDuelIcon icon={o.icon} />
                  </span>
                  <span
                    className="pm-slice-obj__half is-right"
                    style={{
                      transform: `rotate(${rotation + 22 + age * 0.08}deg) translate(${drift}px, ${-drift * 0.4}px)`,
                    }}
                  >
                    <SliceDuelIcon icon={o.icon} />
                  </span>
                </>
              )}
            </span>
          )
        }

        return (
          <span
            key={o.id}
            className={[
              'pm-slice-obj',
              o.kind === 'bomb' ? 'is-bomb' : 'is-fruit',
              o.icon === 'star' ? 'is-star' : '',
              `is-icon-${o.icon}`,
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            }}
          >
            <span className="pm-slice-obj__aura" aria-hidden />
            <span className="pm-slice-obj__body">
              <SliceDuelIcon icon={o.icon} />
            </span>
            <span className="pm-slice-obj__rim" aria-hidden />
          </span>
        )
      })}
    </>
  )
}

function SlashLayer({ path, accent }: { path: SlicePoint[]; accent: 'cyan' | 'pink' }) {
  if (path.length < 2) return null
  const points = path.map((p) => `${p.x},${p.y}`).join(' ')
  const gid = `pm-slice-slash-${accent}`
  return (
    <svg className="pm-slice-lane__slash" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={accent === 'cyan' ? 'rgba(45,255,212,0)' : 'rgba(255,140,190,0)'} />
          <stop offset="50%" stopColor={accent === 'cyan' ? 'rgba(184,255,61,0.98)' : 'rgba(255,159,67,0.98)'} />
          <stop offset="100%" stopColor={accent === 'cyan' ? 'rgba(45,255,212,0)' : 'rgba(255,140,190,0)'} />
        </linearGradient>
        <filter id={`${gid}-glow`}>
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.35"
        filter={`url(#${gid}-glow)`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LaneFx({ side, now }: { side: SliceSideState; now: number }) {
  const frenzy = now < side.frenzyUntil

  if (frenzy) {
    return (
      <span className="pm-slice-lane__fx is-frenzy">
        <strong>FRENZY</strong>
        <small>×{FRENZY_COMBO}+ COMBO • +45% SKOR</small>
      </span>
    )
  }

  if (!side.lastFx || now >= side.lastFxUntil) return null

  if (side.lastFx === 'bomb' || side.lastFx === 'ko') {
    return (
      <span className={`pm-slice-lane__fx is-bomb${side.lastFx === 'ko' ? ' is-ko' : ''}`}>
        <strong>BOMBA!</strong>
        <small>-{BOMB_SCORE_PENALTY} SKOR • -1 CAN</small>
      </span>
    )
  }

  if (side.lastFx === 'miss') {
    return <span className="pm-slice-lane__fx is-miss">KAÇIRDI</span>
  }

  if (side.combo >= 2) {
    return (
      <span className={`pm-slice-lane__fx is-combo${side.combo >= 5 ? ' is-hot' : ''}`}>
        COMBO ×{side.combo}
      </span>
    )
  }

  return null
}

function SliceDuelLane({ side, now, variant, disabled = false, interactive = false, onSwipe, slash = [] }: LaneProps) {
  const arenaRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SlicePoint[]>([])
  const drawingRef = useRef(false)
  const [localSlash, setLocalSlash] = useState<SlicePoint[]>([])
  const accent = variant === 'p1' ? 'cyan' : 'pink'
  const canDraw = interactive && !disabled && !side.knockedOut && Boolean(onSwipe)

  const botSlash =
    !interactive && side.lastSlash && now < side.lastSlashUntil ? side.lastSlash : []
  const visibleSlash = slash.length > 1 ? slash : localSlash.length > 1 ? localSlash : botSlash

  const shaking =
    (side.lastFx === 'bomb' || side.lastFx === 'ko') && now < side.lastFxUntil
  const frenzy = now < side.frenzyUntil

  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!canDraw) return
      const rect = arenaRef.current?.getBoundingClientRect()
      if (!rect) return
      drawingRef.current = true
      pathRef.current = [toPercent(e.clientX, e.clientY, rect)]
      setLocalSlash(pathRef.current)
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [canDraw],
  )

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!drawingRef.current || !canDraw) return
      const rect = arenaRef.current?.getBoundingClientRect()
      if (!rect) return
      const pt = toPercent(e.clientX, e.clientY, rect)
      const last = pathRef.current[pathRef.current.length - 1]
      if (!last || Math.hypot(pt.x - last.x, pt.y - last.y) > 1.8) {
        pathRef.current.push(pt)
        setLocalSlash([...pathRef.current])
      }
    },
    [canDraw],
  )

  const finishSwipe = useCallback(() => {
    if (!drawingRef.current) return
    drawingRef.current = false
    const path = pathRef.current
    pathRef.current = []
    onSwipe?.(path)
    window.setTimeout(() => setLocalSlash([]), 160)
  }, [onSwipe])

  return (
    <div
      ref={arenaRef}
      className={[
        'pm-slice-lane',
        `is-${variant}`,
        disabled && !interactive ? 'is-watch' : '',
        !canDraw ? 'is-disabled' : '',
        shaking ? 'is-shake' : '',
        frenzy ? 'is-frenzy' : '',
        side.knockedOut ? 'is-ko' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishSwipe}
      onPointerCancel={finishSwipe}
      role={interactive ? 'application' : 'img'}
      aria-label={variant === 'p1' ? 'Kesme alanı — kaydır ve kes' : 'Rakip kesme alanı'}
    >
      <span className="pm-slice-lane__sky" aria-hidden />
      {frenzy ? <span className="pm-slice-lane__frenzy-aura" aria-hidden /> : null}
      <span className="pm-slice-lane__grid" aria-hidden />
      <span className="pm-slice-lane__floor" aria-hidden />
      <div className="pm-slice-lane__hud">
        <SliceDuelHealth lives={side.lives} variant={variant} compact />
        {frenzy ? <span className="pm-slice-lane__frenzy-tag">FRENZY</span> : null}
        {side.combo >= 2 ? (
          <span className={`pm-slice-lane__combo${side.combo >= 5 ? ' is-hot' : ''}${side.combo >= FRENZY_COMBO ? ' is-mega' : ''}`}>
            ×{side.combo}
          </span>
        ) : null}
      </div>
      <ObjectLayer objects={side.objects} now={now} />
      <ScorePopLayer side={side} now={now} variant={variant} />
      <JuiceBurstLayer side={side} now={now} />
      <SlashLayer path={visibleSlash} accent={accent} />
      <SparkLayer path={visibleSlash} accent={accent} />
      <LaneFx side={side} now={now} />
      {side.knockedOut ? (
        <span className="pm-slice-lane__ko" aria-hidden>
          CAN BİTTİ
        </span>
      ) : null}
    </div>
  )
}

type Props = {
  p1: SliceSideState
  p2: SliceSideState
  now: number
  disabled?: boolean
  onSwipe: (path: SlicePoint[]) => void
}

export function SliceDuelArena({ p1, p2, now, disabled = false, onSwipe }: Props) {
  return (
    <section className={['pm-slice-arena', disabled ? 'is-disabled' : ''].filter(Boolean).join(' ')} aria-label="Slice duel alanları">
      <div className="pm-slice-zone is-p1">
        <SliceDuelLane
          side={p1}
          now={now}
          variant="p1"
          disabled={disabled}
          interactive
          onSwipe={onSwipe}
        />
      </div>
      <span className="pm-slice-arena__vs" aria-hidden>
        VS
      </span>
      <div className="pm-slice-zone is-p2">
        <SliceDuelLane side={p2} now={now} variant="p2" disabled interactive={false} />
      </div>
    </section>
  )
}
