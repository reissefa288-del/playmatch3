import { COLS, movePlayer, tryShoot, type CentipedeSideState } from './centipedeDuelEngine'

export function tickCentipedeBot(side: CentipedeSideState, now: number): CentipedeSideState {
  if (side.lives <= 0 || side.segments.length === 0) return side

  const threats = side.segments.filter((s) => s.row >= 6)
  let targetCol = Math.floor(COLS / 2)
  if (threats.length > 0) {
    const lowest = threats.reduce((a, b) => (b.row > a.row ? b : a))
    targetCol = lowest.col
  }

  let next = movePlayer(side, targetCol)

  const aligned = threats.some((s) => s.col === next.playerCol && s.row >= 7)
  if ((aligned || Math.random() < 0.1) && !next.bullet) {
    next = tryShoot(next, now)
  }

  return next
}
