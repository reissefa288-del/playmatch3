import { tryFire, tryMove, type SpyHunterSideState } from './spyHunterDuelEngine'

export function tickSpyHunterBot(side: SpyHunterSideState, now: number): SpyHunterSideState {
  if (side.lives <= 0) return side

  const py = side.scroll + 9
  const hazard = side.hazards
    .filter((h) => Math.abs(h.worldY - py) < 10)
    .sort((a, b) => Math.abs(a.col - side.playerCol) - Math.abs(b.col - side.playerCol))[0]

  let s = side

  if (hazard && Math.abs(hazard.col - s.playerCol) < 2) {
    if (hazard.col >= s.playerCol) s = tryMove(s, 'left', now)
    else s = tryMove(s, 'right', now)
    return s
  }

  const target = s.enemies
    .filter((e) => e.worldY - s.scroll > 15 && e.worldY - s.scroll < 75)
    .sort((a, b) => b.worldY - a.worldY)[0]

  if (target) {
    if (target.col > s.playerCol) s = tryMove(s, 'right', now)
    else if (target.col < s.playerCol) s = tryMove(s, 'left', now)
    else if (Math.random() > 0.3) s = tryFire(s, now)
  } else if (Math.random() > 0.55) {
    s = tryFire(s, now)
  }

  return s
}
