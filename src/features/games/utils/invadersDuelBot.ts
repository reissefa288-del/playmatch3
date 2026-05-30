import { clampShip, tryShoot, type InvadersSideState } from './invadersDuelEngine'

export function tickInvadersBot(side: InvadersSideState, now: number): InvadersSideState {
  if (side.lives <= 0) return side

  const live = side.invaders.filter((i) => i.alive)
  if (live.length === 0) return side

  const lowest = live.reduce((a, b) => (b.y > a.y ? b : a))
  let targetX = lowest.x

  const threatening = side.enemyBullets.filter((b) => Math.abs(b.x - side.shipX) < 12)
  if (threatening.length > 0) {
    const bullet = threatening[0]!
    targetX = bullet.x < side.shipX ? side.shipX + 14 : side.shipX - 14
  }

  let next = { ...side, shipX: clampShip(side.shipX + (targetX - side.shipX) * 0.08) }

  const aligned = live.some((i) => Math.abs(i.x - next.shipX) < 8)
  if (aligned || Math.random() < 0.12) {
    next = tryShoot(next, now)
  }

  return next
}
