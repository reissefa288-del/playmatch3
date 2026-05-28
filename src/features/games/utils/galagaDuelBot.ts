import { clampShip, tryShoot, type GalagaSideState } from './galagaDuelEngine'

export function tickGalagaBot(side: GalagaSideState, now: number): GalagaSideState {
  if (side.lives <= 0) return side

  const targets = side.enemies.filter((e) => e.y < 72)
  let targetX = 50
  if (targets.length > 0) {
    const lowest = targets.reduce((a, b) => (b.y > a.y ? b : a))
    targetX = lowest.x
  }

  const dx = targetX - side.shipX
  const step = Math.sign(dx) * Math.min(Math.abs(dx), 0.35 * 16)
  let next = { ...side, shipX: clampShip(side.shipX + step) }

  const aligned = targets.some((e) => Math.abs(e.x - next.shipX) < 9 && e.y > 18)
  if (aligned || Math.random() < 0.08) {
    next = tryShoot(next, now - 40)
  }

  return next
}
