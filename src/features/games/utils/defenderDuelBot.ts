import { setShipY, tryFire, tryMove, type DefenderSideState } from './defenderDuelEngine'

export function tickDefenderBot(side: DefenderSideState, now: number): DefenderSideState {
  if (side.lives <= 0) return side

  const threat = side.enemies
    .filter((e) => e.x < 55)
    .sort((a, b) => a.x - b.x)[0]

  let s = side

  if (threat) {
    if (threat.y < s.shipY - 4) s = tryMove(s, 'up', now)
    else if (threat.y > s.shipY + 4) s = tryMove(s, 'down', now)
    else if (Math.random() > 0.25) s = tryFire(s, now)
  } else {
    const target = side.enemies.sort((a, b) => b.x - a.x)[0]
    if (target) {
      if (target.y < s.shipY - 6) s = tryMove(s, 'up', now)
      else if (target.y > s.shipY + 6) s = tryMove(s, 'down', now)
      if (Math.random() > 0.4) s = tryFire(s, now)
    }
  }

  const lowLander = side.enemies.find((e) => e.kind === 'lander' && e.diving && e.x < 80)
  if (lowLander && Math.abs(lowLander.y - s.shipY) > 8) {
    s = setShipY(s, lowLander.y, now)
    s = tryFire(s, now)
  }

  return s
}
