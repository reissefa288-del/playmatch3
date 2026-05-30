import { tryFlap, tryMoveHoriz, type HorizDir, type JoustSideState } from './joustDuelEngine'

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by)
}

export function tickJoustBot(side: JoustSideState, now: number): JoustSideState {
  if (side.lives <= 0) return side

  let s = side
  const target = s.enemies
    .map((e) => ({ e, d: dist(e.x, e.y, s.px, s.py) }))
    .sort((a, b) => a.d - b.d)[0]

  if (s.py > 72) s = tryFlap(s, now)

  if (target) {
    const dir: HorizDir = target.e.x > s.px ? 'right' : 'left'
    s = tryMoveHoriz(s, dir, now)
    if (s.py >= target.e.y - 2) s = tryFlap(s, now)
    else if (Math.random() > 0.55) s = tryFlap(s, now)
  } else if (Math.random() > 0.65) {
    s = tryMoveHoriz(s, Math.random() > 0.5 ? 'left' : 'right', now)
    if (Math.random() > 0.5) s = tryFlap(s, now)
  }

  return s
}
