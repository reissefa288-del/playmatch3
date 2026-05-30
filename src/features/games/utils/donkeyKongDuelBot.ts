import { GOAL_ROW, tryJump, tryMove, type DonkeyKongSideState, type Dir } from './donkeyKongDuelEngine'

export function tickDonkeyKongBot(side: DonkeyKongSideState, now: number): DonkeyKongSideState {
  if (side.lives <= 0) return side

  let s = side
  const threat = s.barrels
    .filter((b) => b.row === s.row)
    .sort((a, b) => Math.abs(a.col - s.col) - Math.abs(b.col - s.col))[0]

  if (threat && Math.abs(threat.col - s.col) < 3) {
    if (threat.col > s.col) s = tryMove(s, 'left', now)
    else s = tryMove(s, 'right', now)
    if (Math.random() > 0.4) s = tryJump(s, now)
  } else if (s.row > GOAL_ROW) {
    s = tryMove(s, 'up', now)
    if (Math.random() > 0.5) s = tryJump(s, now)
    const toward: Dir = Math.random() > 0.5 ? 'left' : 'right'
    s = tryMove(s, toward, now)
  } else {
    s = tryMove(s, 'down', now)
  }

  return s
}
