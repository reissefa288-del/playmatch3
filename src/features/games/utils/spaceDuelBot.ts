import { clampShip, type SpaceSideState } from './spaceDuelEngine'

export function tickSpaceBot(side: SpaceSideState): SpaceSideState {
  if (side.lives <= 0) return side

  const targets = side.enemies.filter((e) => e.y < 68)
  let targetX = 50
  if (targets.length > 0) {
    const focus = targets.reduce((a, b) => (b.y + b.x * 0.02 > a.y + a.x * 0.02 ? b : a))
    targetX = focus.x
  }

  const dx = targetX - side.shipX
  const step = Math.sign(dx) * Math.min(Math.abs(dx), 0.42 * 16)
  return { ...side, shipX: clampShip(side.shipX + step) }
}
