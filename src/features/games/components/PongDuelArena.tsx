import type { PointerEvent } from 'react'
import { BALL_R, PADDLE_H, PADDLE_W, type PongState } from '../utils/pongDuelEngine'

type Props = {
  game: PongState
  interactive?: boolean
  onMove?: (yNorm: number) => void
}

export function PongDuelArena({ game, interactive = false, onMove }: Props) {
  const handlePointer = (e: PointerEvent<HTMLDivElement>) => {
    if (!interactive || !onMove) return
    const rect = e.currentTarget.getBoundingClientRect()
    const y = (e.clientY - rect.top) / rect.height
    onMove(Math.max(0, Math.min(1, y)))
  }

  const ball = game.ball
  const p1 = game.paddle1
  const p2 = game.paddle2

  return (
    <div
      className="pm-pong-arena"
      onPointerDown={handlePointer}
      onPointerMove={handlePointer}
      role="application"
      aria-label="Pong sahası"
    >
      <div className="pm-pong-arena__mid" aria-hidden />
      <span className="pm-pong-arena__vs">VS</span>

      <span
        className="pm-pong-paddle is-p1"
        style={{
          top: `${(p1.y - PADDLE_H / 2) * 100}%`,
          height: `${PADDLE_H * 100}%`,
          width: `${PADDLE_W * 100}%`,
        }}
      />
      <span
        className="pm-pong-paddle is-p2"
        style={{
          top: `${(p2.y - PADDLE_H / 2) * 100}%`,
          height: `${PADDLE_H * 100}%`,
          width: `${PADDLE_W * 100}%`,
        }}
      />

      <span
        className="pm-pong-ball"
        style={{
          left: `${ball.x * 100}%`,
          top: `${ball.y * 100}%`,
          width: `${BALL_R * 200}%`,
          height: `${BALL_R * 200}%`,
        }}
      />
    </div>
  )
}
