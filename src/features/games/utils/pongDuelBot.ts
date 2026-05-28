import type { PongState } from './pongDuelEngine'
import { setPaddle2 } from './pongDuelEngine'

export function updateBotPaddle(state: PongState, skill = 0.82): PongState {
  const target = state.ball.y
  const current = state.paddle2.y
  const maxStep = 0.045 * skill
  const err = (Math.random() - 0.5) * 0.04 * (1 - skill)
  const next = current + clamp(target + err - current, -maxStep, maxStep)
  return setPaddle2(state, next)
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}
