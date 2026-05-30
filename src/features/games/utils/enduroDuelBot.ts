import {
  COLS,
  isOnTrail,
  lanePos,
  trailCenterAt,
  tryMove,
  trySprint,
  type EnduroSideState,
} from './enduroDuelEngine'

export function tickEnduroBot(side: EnduroSideState, now: number): EnduroSideState {
  if (side.lives <= 0) return side

  let s = side
  const center = trailCenterAt(s.scroll)
  const targetLane = Math.max(0, Math.min(COLS - 1, Math.round(center + 1.5)))

  if (!isOnTrail(s.playerLane, s.scroll)) {
    if (lanePos(s.playerLane) < center) s = tryMove(s, 'right', now)
    else s = tryMove(s, 'left', now)
  } else if (Math.abs(s.playerLane - targetLane) >= 1) {
    s = tryMove(s, s.playerLane < targetLane ? 'right' : 'left', now)
  }

  const py = s.scroll + 9
  const aheadRider = s.riders
    .filter((r) => r.worldY > py && r.worldY < py + 30 && r.lane === s.playerLane)
    .sort((a, b) => a.worldY - b.worldY)[0]

  if (aheadRider) {
    if (s.playerLane > 0) s = tryMove(s, 'left', now)
    else if (s.playerLane < COLS - 1) s = tryMove(s, 'right', now)
  }

  const aheadHazard = s.hazards.find((h) => h.worldY > py && h.worldY < py + 26 && h.lane === s.playerLane)
  if (aheadHazard) {
    s = tryMove(s, aheadHazard.lane < 2 ? 'right' : 'left', now)
  }

  if (Math.random() < 0.014) s = trySprint(s, now)

  return s
}
