import { aimShip, tryShoot, type AsteroidSideState } from './asteroidsDuelEngine'

export function tickAsteroidsBot(side: AsteroidSideState, now: number): AsteroidSideState {
  if (side.lives <= 0 || side.asteroids.length === 0) return side

  let target = side.asteroids[0]!
  let best = Infinity
  for (const a of side.asteroids) {
    const d = Math.hypot(a.x - side.shipX, a.y - side.shipY)
    if (d < best) {
      best = d
      target = a
    }
  }

  let next = aimShip(side, target.x, target.y, best > 18)

  const dx = target.x - next.shipX
  const dy = target.y - next.shipY
  const aimDx = Math.sin(next.shipAngle)
  const aimDy = -Math.cos(next.shipAngle)
  const dot = dx * aimDx + dy * aimDy
  const aligned = dot > 0 && Math.abs(dx * aimDy - dy * aimDx) < 12

  if (aligned && Math.random() < 0.14) {
    next = tryShoot(next, now)
  }

  return next
}
