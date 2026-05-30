import { useCallback, useRef } from 'react'
import {
  BALL_R,
  BRICK_H,
  BRICK_LEFT,
  BRICK_TOP,
  BRICK_W,
  brickColor,
  PADDLE_H,
  PADDLE_W,
  PADDLE_Y,
  type BreakoutSideState,
} from '../utils/breakoutDuelEngine'

type Props = {
  p1: BreakoutSideState
  p2: BreakoutSideState
  disabled?: boolean
  onPointerPaddle: (clientX: number, rect: DOMRect) => void
}

function BreakoutScreen({
  side,
  label,
  accent,
  interactive,
  disabled,
  onPointerPaddle,
}: {
  side: BreakoutSideState
  label: string
  accent: 'cyan' | 'pink'
  interactive: boolean
  disabled?: boolean
  onPointerPaddle?: (clientX: number, rect: DOMRect) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)

  const handlePointer = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive || disabled || !trackRef.current || !onPointerPaddle) return
      onPointerPaddle(e.clientX, trackRef.current.getBoundingClientRect())
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    },
    [disabled, interactive, onPointerPaddle],
  )

  return (
    <div className={['pm-breakout-screen', `is-${accent}`, interactive ? 'is-you' : 'is-rival'].join(' ')}>
      <p className="pm-breakout-screen__label">{label}</p>
      <div
        ref={trackRef}
        className="pm-breakout-screen__track"
        onPointerDown={handlePointer}
        onPointerMove={handlePointer}
        role="presentation"
      >
        {side.bricks.map((row, rowIndex) =>
          row.map((brick, col) => {
            if (!brick.alive) return null
            return (
              <span
                key={`${rowIndex}-${col}`}
                className={['pm-breakout-screen__brick', brick.hp > 1 ? 'is-hard' : ''].filter(Boolean).join(' ')}
                style={{
                  left: `${BRICK_LEFT + col * BRICK_W}%`,
                  top: `${BRICK_TOP + rowIndex * BRICK_H}%`,
                  width: `${BRICK_W - 1}%`,
                  height: `${BRICK_H - 0.6}%`,
                  background: brickColor(rowIndex),
                }}
                aria-hidden
              />
            )
          }),
        )}

        <span
          className="pm-breakout-screen__paddle"
          style={{
            left: `${side.paddleX - PADDLE_W / 2}%`,
            top: `${PADDLE_Y - PADDLE_H}%`,
            width: `${PADDLE_W}%`,
            height: `${PADDLE_H}%`,
          }}
          aria-hidden
        />

        {side.lives > 0 ? (
          <span
            className="pm-breakout-screen__ball"
            style={{
              left: `${side.ball.x}%`,
              top: `${side.ball.y}%`,
              width: `${BALL_R * 2}%`,
              height: `${BALL_R * 2}%`,
            }}
            aria-hidden
          />
        ) : null}

        <div className="pm-breakout-screen__lives" aria-label={`${side.lives} can`}>
          {Array.from({ length: side.lives }, (_, i) => (
            <span key={i} className="pm-breakout-screen__life" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function BreakoutDuelArena({ p1, p2, disabled = false, onPointerPaddle }: Props) {
  return (
    <div className="pm-breakout-arena">
      <BreakoutScreen
        side={p1}
        label="SEN"
        accent="cyan"
        interactive
        disabled={disabled}
        onPointerPaddle={onPointerPaddle}
      />
      <BreakoutScreen side={p2} label="RAKİP" accent="pink" interactive={false} />
    </div>
  )
}
