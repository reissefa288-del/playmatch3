import { useCallback, useRef, useState, type PointerEvent } from 'react'
import type { SliceObject, SlicePoint, SliceSideState } from '../utils/sliceDuelEngine'
import { ICON_EMOJI, objectY } from '../utils/sliceDuelEngine'

type Props = {
  p1: SliceSideState
  p2: SliceSideState
  now: number
  disabled?: boolean
  onSwipe: (path: SlicePoint[]) => void
}

function toPercent(clientX: number, clientY: number, rect: DOMRect): SlicePoint {
  return {
    x: ((clientX - rect.left) / rect.width) * 100,
    y: ((clientY - rect.top) / rect.height) * 100,
  }
}

function ObjectLayer({ objects, now, mirror }: { objects: SliceObject[]; now: number; mirror?: boolean }) {
  const active = objects.filter((o) => !o.sliced && objectY(o, now) < 105)
  return (
    <>
      {active.map((o) => {
        const y = objectY(o, now)
        return (
          <span
            key={o.id}
            className={['pm-slice-obj', o.kind === 'bomb' ? 'is-bomb' : 'is-fruit'].join(' ')}
            style={{
              left: mirror ? `${100 - o.x}%` : `${o.x}%`,
              top: `${y}%`,
            }}
          >
            {ICON_EMOJI[o.icon]}
          </span>
        )
      })}
    </>
  )
}

export function SliceDuelArena({ p1, p2, now, disabled = false, onSwipe }: Props) {
  const arenaRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SlicePoint[]>([])
  const drawingRef = useRef(false)
  const [slash, setSlash] = useState<SlicePoint[]>([])

  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (disabled) return
      const rect = arenaRef.current?.getBoundingClientRect()
      if (!rect) return
      drawingRef.current = true
      pathRef.current = [toPercent(e.clientX, e.clientY, rect)]
      setSlash(pathRef.current)
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [disabled],
  )

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!drawingRef.current || disabled) return
      const rect = arenaRef.current?.getBoundingClientRect()
      if (!rect) return
      const pt = toPercent(e.clientX, e.clientY, rect)
      const last = pathRef.current[pathRef.current.length - 1]
      if (!last || Math.hypot(pt.x - last.x, pt.y - last.y) > 2) {
        pathRef.current.push(pt)
        setSlash([...pathRef.current])
      }
    },
    [disabled],
  )

  const finishSwipe = useCallback(() => {
    if (!drawingRef.current) return
    drawingRef.current = false
    const path = pathRef.current
    pathRef.current = []
    onSwipe(path)
    window.setTimeout(() => setSlash([]), 120)
  }, [onSwipe])

  const handlePointerUp = useCallback(() => {
    finishSwipe()
  }, [finishSwipe])

  const handlePointerCancel = useCallback(() => {
    finishSwipe()
  }, [finishSwipe])

  return (
    <div className={['pm-slice-arena', disabled ? 'is-disabled' : ''].filter(Boolean).join(' ')}>
      <div className="pm-slice-arena__rival" aria-hidden>
        <p>RAKİP</p>
        <div className="pm-slice-arena__panel is-rival">
          <ObjectLayer objects={p2.objects} now={now} mirror />
        </div>
      </div>

      <div
        ref={arenaRef}
        className="pm-slice-arena__play"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        role="application"
        aria-label="Kesme alanı — parmağınla kaydır"
      >
        <p className="pm-slice-arena__play-label">SEN — KAYDIR & KES</p>
        <ObjectLayer objects={p1.objects} now={now} />
        {slash.length > 1 ? (
          <svg className="pm-slice-arena__slash" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <polyline
              points={slash.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="rgba(184, 255, 61, 0.9)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        ) : null}
        {p1.lastFx && now < p1.lastFxUntil ? (
          <span className={`pm-slice-arena__fx is-${p1.lastFx}`}>
            {p1.lastFx === 'bomb' ? 'BOMBA!' : `+COMBO x${p1.combo}`}
          </span>
        ) : null}
      </div>
    </div>
  )
}
