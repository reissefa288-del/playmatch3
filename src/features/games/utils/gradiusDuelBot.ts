import { setShipY, tryFire, tryMove, type GradiusSideState } from './gradiusDuelEngine'

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by)
}

export function tickGradiusBot(side: GradiusSideState, now: number): GradiusSideState {
  if (side.lives <= 0) return side

  let s = side

  const capsule = s.capsules[0]
  if (capsule && capsule.x < 85) {
    const dy = capsule.y - s.shipY
    if (Math.abs(dy) > 4) {
      s = tryMove(s, dy > 0 ? 'down' : 'up', now)
    }
    return tryFire(s, now)
  }

  const targets = s.enemies.filter((e) => e.x < 92)
  if (targets.length === 0) {
    if (Math.random() > 0.6) s = tryMove(s, Math.random() > 0.5 ? 'up' : 'down', now)
    return tryFire(s, now)
  }

  const focus = targets.reduce((a, b) => (a.x < b.x ? a : b))
  const dy = focus.y - s.shipY
  if (Math.abs(dy) > 5) {
    s = tryMove(s, dy > 0 ? 'down' : 'up', now)
  } else {
    s = setShipY(s, focus.y, now)
  }

  if (Math.abs(focus.y - s.shipY) < 12 && focus.x < 88) {
    s = tryFire(s, now)
  } else if (dist(focus.x, focus.y, 12, s.shipY) < 28 && Math.random() < 0.12) {
    s = tryFire(s, now)
  }

  return s
}
