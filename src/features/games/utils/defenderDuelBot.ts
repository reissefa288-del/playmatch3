import { setShipY, tryMove, type DefenderSideState } from './defenderDuelEngine'

export function tickDefenderBot(side: DefenderSideState, now: number): DefenderSideState {
  if (side.lives <= 0) return side

  const threat = side.enemies
    .filter((e) => e.x < 58)
    .sort((a, b) => a.x - b.x)[0]

  let s = side

  if (threat) {
    if (threat.y < s.shipY - 3) s = tryMove(s, 'up', now)
    else if (threat.y > s.shipY + 3) s = tryMove(s, 'down', now)
  } else {
    const target = side.enemies.sort((a, b) => b.x - a.x)[0]
    if (target) {
      if (target.y < s.shipY - 5) s = tryMove(s, 'up', now)
      else if (target.y > s.shipY + 5) s = tryMove(s, 'down', now)
    }
  }

  const lowLander = side.enemies.find((e) => e.kind === 'lander' && e.diving && e.x < 82)
  if (lowLander && Math.abs(lowLander.y - s.shipY) > 6) {
    s = setShipY(s, lowLander.y, now)
  }

  return s
}
