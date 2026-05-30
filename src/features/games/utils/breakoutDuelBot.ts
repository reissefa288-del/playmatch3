import { movePaddle, type BreakoutSideState } from './breakoutDuelEngine'

export function tickBreakoutBot(side: BreakoutSideState): BreakoutSideState {
  if (side.lives <= 0) return side

  const target = side.ball.active ? side.ball.x : side.paddleX
  const delta = target - side.paddleX
  const step = Math.sign(delta) * Math.min(Math.abs(delta), 1.8)
  return movePaddle(side, side.paddleX + step)
}
