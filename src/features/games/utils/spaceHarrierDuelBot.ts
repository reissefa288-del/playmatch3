import { clampPx, clampPy, movePlayer, tryShoot, type SpaceHarrierSideState } from './spaceHarrierDuelEngine'

export function tickSpaceHarrierBot(side: SpaceHarrierSideState, now: number): SpaceHarrierSideState {
  if (side.lives <= 0) return side

  let s = side

  const threat = s.enemies.find((e) => e.z > 70)
  if (threat) {
    const targetX = threat.x > s.px ? s.px + 8 : s.px - 8
    s = movePlayer(s, targetX, s.py)
  } else if (Math.random() < 0.06) {
    s = movePlayer(s, s.px + (Math.random() - 0.5) * 16, s.py + (Math.random() - 0.5) * 6)
  }

  const nearest = s.enemies
    .filter((e) => e.z > 15 && e.z < 85)
    .sort((a, b) => b.z - a.z)[0]

  if (nearest && Math.abs(nearest.x - s.px) < 18) {
    s = tryShoot(s, now)
  } else if (Math.random() < 0.08) {
    s = tryShoot(s, now)
  }

  if (s.enemyBullets.some((b) => Math.abs(b.x - s.px) < 12 && b.z > 75)) {
    s = movePlayer(s, clampPx(s.px + (Math.random() > 0.5 ? 14 : -14)), clampPy(s.py - 4))
  }

  return s
}
