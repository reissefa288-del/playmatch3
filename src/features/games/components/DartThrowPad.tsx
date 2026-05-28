import { useCallback, useRef, useState, type PointerEvent } from 'react'

type Props = {
  disabled?: boolean
  onThrow: (aimX: number, power: number) => void
  onAimChange?: (aimX: number | null) => void
}

const MIN_SWIPE_PX = 36

export function DartThrowPad({ disabled = false, onThrow, onAimChange }: Props) {
  const zoneRef = useRef<HTMLDivElement>(null)
  const startRef = useRef<{ x: number; y: number } | null>(null)
  const [pull, setPull] = useState<{ dx: number; dy: number } | null>(null)
  const [aimPreview, setAimPreview] = useState(0.5)

  const reset = useCallback(() => {
    startRef.current = null
    setPull(null)
    onAimChange?.(null)
  }, [onAimChange])

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled) return
    const zone = zoneRef.current
    if (!zone) return
    zone.setPointerCapture(e.pointerId)
    startRef.current = { x: e.clientX, y: e.clientY }
    setPull({ dx: 0, dy: 0 })
  }

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled || !startRef.current || !zoneRef.current) return
    const rect = zoneRef.current.getBoundingClientRect()
    const dx = e.clientX - startRef.current.x
    const dy = startRef.current.y - e.clientY
    setPull({ dx, dy: Math.max(0, dy) })
    const aim = Math.max(0.1, Math.min(0.9, 0.5 + dx / rect.width))
    setAimPreview(aim)
    onAimChange?.(aim)
  }

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled || !startRef.current || !zoneRef.current) {
      reset()
      return
    }
    try {
      zoneRef.current.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }

    const rect = zoneRef.current.getBoundingClientRect()
    const dx = e.clientX - startRef.current.x
    const dy = startRef.current.y - e.clientY

    reset()

    if (dy < MIN_SWIPE_PX) return

    const aimX = Math.max(0.08, Math.min(0.92, 0.5 + (dx / rect.width) * 0.5))
    const power = Math.max(0.22, Math.min(0.98, 0.32 + dy / 160))
    onThrow(aimX, power)
  }

  const powerPct = pull ? Math.min(100, Math.round((pull.dy / 140) * 100)) : 0

  return (
    <div className={`pm-dart-throw ${disabled ? 'is-disabled' : ''}`}>
      <div className="pm-dart-throw__aim">
        <span>NİŞAN</span>
        <div className="pm-dart-throw__aim-track" aria-hidden>
          <i style={{ left: `${aimPreview * 100}%` }} />
        </div>
      </div>
      <div
        ref={zoneRef}
        className={`pm-dart-throw__zone ${pull ? 'is-pulling' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={reset}
        role="application"
        aria-label="Dart atış alanı — aşağıdan yukarı sürükle ve bırak"
      >
        <span className="pm-dart-throw__oche" />
        {pull ? (
          <>
            <span
              className="pm-dart-throw__dart"
              style={{
                transform: `translate(${pull.dx * 0.35}px, ${Math.min(pull.dy * 0.5, 48)}px) rotate(-12deg)`,
              }}
            />
            <span className="pm-dart-throw__power" style={{ height: `${powerPct}%` }} />
          </>
        ) : (
          <span className="pm-dart-throw__hint">Yukarı sürükle &amp; bırak</span>
        )}
      </div>
      <div className="pm-dart-throw__power-label">
        <span>GÜÇ</span>
        <strong>{pull ? `${powerPct}%` : '—'}</strong>
      </div>
    </div>
  )
}
