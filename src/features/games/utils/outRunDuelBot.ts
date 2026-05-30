import { COLS, tryBoost, tryMove, type OutRunSideState } from './outRunDuelEngine'

export function tickOutRunBot(side: OutRunSideState, now: number): OutRunSideState {
  if (side.lives <= 0) return side

  let s = side
  const py = side.scroll + 9

  const ahead = s.traffic
    .filter((t) => t.worldY > py && t.worldY < py + 35)
    .sort((a, b) => a.worldY - b.worldY)[0]

  if (ahead) {
    if (ahead.col < s.playerCol && s.playerCol < COLS - 1) {
      s = tryMove(s, 'right', now)
    } else if (ahead.col > s.playerCol && s.playerCol > 0) {
      s = tryMove(s, 'left', now)
    } else if (ahead.col === s.playerCol) {
      s = tryMove(s, Math.random() > 0.5 ? 'right' : 'left', now)
    }
  }

  const hazard = s.hazards.find((h) => h.worldY > py && h.worldY < py + 28 && h.col === s.playerCol)
  if (hazard) {
    s = tryMove(s, hazard.col < 2 ? 'right' : 'left', now)
  }

  if (Math.random() < 0.015) s = tryBoost(s, now)

  return s
}
