import {
  COLS,
  isOnRoad,
  lanePos,
  roadCenterAt,
  tryMove,
  tryTurbo,
  type RadRacerSideState,
} from './radRacerDuelEngine'

export function tickRadRacerBot(side: RadRacerSideState, now: number): RadRacerSideState {
  if (side.lives <= 0) return side

  let s = side
  const center = roadCenterAt(s.scroll)
  const targetLane = Math.max(0, Math.min(COLS - 1, Math.round(center + 1)))

  if (!isOnRoad(s.playerLane, s.scroll)) {
    if (lanePos(s.playerLane) < center) s = tryMove(s, 'right', now)
    else s = tryMove(s, 'left', now)
  } else if (Math.abs(s.playerLane - targetLane) >= 1) {
    s = tryMove(s, s.playerLane < targetLane ? 'right' : 'left', now)
  }

  const py = s.scroll + 9
  const ahead = s.traffic
    .filter((t) => t.worldY > py && t.worldY < py + 32 && t.lane === s.playerLane)
    .sort((a, b) => a.worldY - b.worldY)[0]

  if (ahead) {
    if (s.playerLane > 0) s = tryMove(s, 'left', now)
    else if (s.playerLane < COLS - 1) s = tryMove(s, 'right', now)
  }

  if (Math.random() < 0.012) s = tryTurbo(s, now)

  return s
}
