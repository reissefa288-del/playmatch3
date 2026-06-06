import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import { FiChevronDown, FiChevronLeft, FiChevronRight, FiChevronUp } from 'react-icons/fi'
import type { Direction } from '../utils/snakeDuelEngine'

type Props = {
  disabled?: boolean
  onDirection: (dir: Direction) => void
  onInteract?: () => void
}

const HOLD_REPEAT_MS = 95

export function SnakeDuelControls({ disabled = false, onDirection, onInteract }: Props) {
  const [held, setHeld] = useState<Direction | null>(null)
  const heldRef = useRef<Direction | null>(null)

  const fire = useCallback(
    (dir: Direction) => {
      onInteract?.()
      onDirection(dir)
    },
    [onDirection, onInteract],
  )

  const bind = (dir: Direction) => ({
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      if (disabled) return
      e.currentTarget.setPointerCapture(e.pointerId)
      heldRef.current = dir
      setHeld(dir)
      fire(dir)
    },
    onPointerUp: () => {
      heldRef.current = null
      setHeld(null)
    },
    onPointerCancel: () => {
      heldRef.current = null
      setHeld(null)
    },
    onPointerLeave: (e: PointerEvent<HTMLButtonElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) return
      heldRef.current = null
      setHeld(null)
    },
  })

  useEffect(() => {
    if (disabled || !held) return
    const id = window.setInterval(() => {
      if (heldRef.current) fire(heldRef.current)
    }, HOLD_REPEAT_MS)
    return () => window.clearInterval(id)
  }, [disabled, held, fire])

  return (
    <div
      className={[
        'pm-snake-controls',
        disabled ? 'is-disabled' : '',
        held ? `is-holding is-holding-${held}` : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Yön kontrolleri"
    >
      <button
        type="button"
        className={`is-up${held === 'up' ? ' is-held' : ''}`}
        disabled={disabled}
        aria-label="Yukarı"
        {...bind('up')}
      >
        <span className="pm-snake-controls__glow" aria-hidden />
        <span className="pm-snake-controls__face" />
        <FiChevronUp />
      </button>
      <button
        type="button"
        className={`is-left${held === 'left' ? ' is-held' : ''}`}
        disabled={disabled}
        aria-label="Sol"
        {...bind('left')}
      >
        <span className="pm-snake-controls__glow" aria-hidden />
        <span className="pm-snake-controls__face" />
        <FiChevronLeft />
      </button>
      <button
        type="button"
        className={`is-right${held === 'right' ? ' is-held' : ''}`}
        disabled={disabled}
        aria-label="Sağ"
        {...bind('right')}
      >
        <span className="pm-snake-controls__glow" aria-hidden />
        <span className="pm-snake-controls__face" />
        <FiChevronRight />
      </button>
      <button
        type="button"
        className={`is-down${held === 'down' ? ' is-held' : ''}`}
        disabled={disabled}
        aria-label="Aşağı"
        {...bind('down')}
      >
        <span className="pm-snake-controls__glow" aria-hidden />
        <span className="pm-snake-controls__face" />
        <FiChevronDown />
      </button>
    </div>
  )
}
