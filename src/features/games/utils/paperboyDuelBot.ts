import { tryMove, tryThrow, type PaperboySideState } from './paperboyDuelEngine'

export function tickPaperboyBot(side: PaperboySideState, now: number): PaperboySideState {
  if (side.lives <= 0) return side

  const py = side.scroll + 10
  const threat = side.obstacles
    .filter((o) => Math.abs(o.worldY - py) < 8)
    .sort((a, b) => Math.abs(a.col - side.playerCol) - Math.abs(b.col - side.playerCol))[0]

  let s = side

  if (threat && Math.abs(threat.col - s.playerCol) < 2) {
    if (threat.col >= s.playerCol) s = tryMove(s, 'left', now)
    else s = tryMove(s, 'right', now)
    return s
  }

  const target = s.houses
    .filter((h) => !h.delivered)
    .sort((a, b) => a.worldY - b.worldY)[0]

  if (target) {
    if (target.col > s.playerCol) s = tryMove(s, 'right', now)
    else if (target.col < s.playerCol) s = tryMove(s, 'left', now)
    else if (Math.random() > 0.35) s = tryThrow(s, now)
  } else if (Math.random() > 0.6) {
    s = tryThrow(s, now)
  }

  return s
}
