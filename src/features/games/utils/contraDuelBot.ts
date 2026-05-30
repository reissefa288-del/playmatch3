import { tryFire, tryJump, tryMove, type ContraSideState } from './contraDuelEngine'

export function tickContraBot(side: ContraSideState, now: number): ContraSideState {
  if (side.lives <= 0) return side

  let s = side
  const nearest = s.enemies
    .filter((e) => e.x > s.px && e.x < s.px + 55)
    .sort((a, b) => a.x - b.x)[0]

  if (nearest) {
    if (Math.abs(nearest.y - s.py) > 8 && s.groundedY != null) {
      s = tryJump(s, now)
    }
    if (nearest.x > s.px + 8) s = tryMove(s, 'right', now)
    else if (nearest.x < s.px - 4) s = tryMove(s, 'left', now)
    s = tryFire(s, now)
  } else {
    if (Math.random() < 0.02) s = tryMove(s, Math.random() > 0.5 ? 'right' : 'left', now)
    if (Math.random() < 0.008) s = tryJump(s, now)
  }

  const sniper = s.enemies.find((e) => e.kind === 'sniper' && e.x < 80)
  if (sniper && Math.abs(sniper.y - s.py) < 6) {
    s = tryJump(s, now)
  }

  if (Math.random() < 0.025) s = tryFire(s, now)

  return s
}
