import { queueDir, type Dir, type PacSideState } from './pacDotDuelEngine'

export function tickPacDotBot(side: PacSideState, now: number): PacSideState {
  if (side.lives <= 0 || side.dots.length === 0) return side

  const powered = now < side.powerUntil
  let bestDir: Dir = 'left'
  let bestScore = -Infinity

  for (const d of ['up', 'down', 'left', 'right'] as Dir[]) {
    const dc = d === 'left' ? -1 : d === 'right' ? 1 : 0
    const dr = d === 'up' ? -1 : d === 'down' ? 1 : 0
    const nc = side.playerCol + dc
    const nr = side.playerRow + dr

    let score = 0
    const nearDot = side.dots.some((dot) => Math.abs(dot.col - nc) + Math.abs(dot.row - nr) <= 1)
    if (nearDot) score += 8

    const ghostNear = side.ghosts.some(
      (g) => g.eatenUntil <= now && Math.abs(g.col - nc) + Math.abs(g.row - nr) <= 1,
    )
    if (ghostNear && !powered) score -= 20
    if (ghostNear && powered) score += 15

    if (score > bestScore) {
      bestScore = score
      bestDir = d
    }
  }

  return queueDir(side, bestDir)
}
