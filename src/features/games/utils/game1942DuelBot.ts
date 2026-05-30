import { clampShip, tryShoot, type Game1942SideState } from './game1942DuelEngine'

export function tickGame1942Bot(side: Game1942SideState, now: number): Game1942SideState {
  if (side.lives <= 0) return side

  const targets = side.enemies.filter((e) => e.y < 75)
  let targetX = 50
  if (targets.length > 0) {
    const lowest = targets.reduce((a, b) => (b.y > a.y ? b : a))
    targetX = lowest.x
  }

  const dx = targetX - side.shipX
  const step = Math.sign(dx) * Math.min(Math.abs(dx), 5.5)
  let next = { ...side, shipX: clampShip(side.shipX + step) }

  const aligned = targets.some((e) => Math.abs(e.x - next.shipX) < 10 && e.y > 16)
  if (aligned || Math.random() < 0.09) {
    next = tryShoot(next, now - 35)
  }

  return next
}
