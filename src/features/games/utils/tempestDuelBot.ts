import { rotateLane, tryShoot, type RotateDir, type TempestSideState } from './tempestDuelEngine'

export function tickTempestBot(side: TempestSideState, now: number): TempestSideState {
  if (side.lives <= 0) return side

  let s = side
  const threats = s.enemies.filter((e) => e.depth < 5)
  const onLane = threats.filter((e) => e.lane === s.lane)

  if (onLane.length > 0) {
    s = tryShoot(s, now)
  } else if (threats.length > 0) {
    const nearest = threats.sort((a, b) => a.depth - b.depth)[0]!
    let diff = (nearest.lane - s.lane + 8) % 8
    if (diff > 4) diff -= 8
    const dir: RotateDir = diff < 0 ? 'left' : 'right'
    s = rotateLane(s, dir, now)
    if (Math.abs(diff) <= 1) s = tryShoot(s, now)
  } else if (Math.random() > 0.6) {
    s = rotateLane(s, Math.random() > 0.5 ? 'left' : 'right', now)
  }

  if (Math.random() > 0.55) s = tryShoot(s, now)

  return s
}
