import { tryFire, tryOrbit, type GyrussSideState } from './gyrussDuelEngine'

function normalizeAngle(a: number) {
  while (a > Math.PI) a -= Math.PI * 2
  while (a < -Math.PI) a += Math.PI * 2
  return a
}

function angleDiff(from: number, to: number) {
  return normalizeAngle(to - from)
}

export function tickGyrussBot(side: GyrussSideState, now: number): GyrussSideState {
  if (side.lives <= 0) return side

  let s = side
  if (s.enemies.length === 0) {
    if (Math.random() > 0.5) s = tryOrbit(s, Math.random() > 0.5 ? 'right' : 'left', now)
    return tryFire(s, now)
  }

  const target = s.enemies.reduce((best, e) => {
    const a = Math.atan2(e.y - 50, e.x - 50)
    const d = Math.hypot(e.x - 50, e.y - 50)
    if (!best || d < best.d) return { e, a, d }
    return best
  }, null as { e: (typeof s.enemies)[0]; a: number; d: number } | null)

  if (!target) return s

  const diff = angleDiff(s.angle, target.a)
  if (Math.abs(diff) > 0.12) {
    s = tryOrbit(s, diff > 0 ? 'right' : 'left', now)
  }

  if (Math.abs(angleDiff(s.angle, target.a)) < 0.35 && target.d < 42) {
    s = tryFire(s, now)
  } else if (Math.random() < 0.06) {
    s = tryFire(s, now)
  }

  return s
}
