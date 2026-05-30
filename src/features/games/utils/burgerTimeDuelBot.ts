import { tryMove, type BurgerTimeSideState, type Dir } from './burgerTimeDuelEngine'

const DIRS: Dir[] = ['up', 'down', 'left', 'right']

export function tickBurgerTimeBot(side: BurgerTimeSideState, now: number): BurgerTimeSideState {
  if (side.lives <= 0) return side

  let s = side
  const target = s.parts
    .filter((p) => !p.dropped)
    .map((p) => ({ p, d: Math.abs(p.col - s.col) + Math.abs(p.row - s.row) }))
    .sort((a, b) => a.d - b.d)[0]

  const foe = s.enemies
    .filter((e) => e.row === s.row)
    .sort((a, b) => Math.abs(a.col - s.col) - Math.abs(b.col - s.col))[0]

  if (foe && Math.abs(foe.col - s.col) < 2) {
    const away: Dir = foe.col > s.col ? 'left' : 'right'
    s = tryMove(s, away, now)
    if (Math.random() > 0.5) s = tryMove(s, 'up', now)
  } else if (target) {
    const { p } = target
    if (p.row < s.row) s = tryMove(s, 'up', now)
    else if (p.row > s.row) s = tryMove(s, 'down', now)
    else if (p.col < s.col) s = tryMove(s, 'left', now)
    else if (p.col > s.col) s = tryMove(s, 'right', now)
  } else if (Math.random() > 0.6) {
    s = tryMove(s, DIRS[Math.floor(Math.random() * 4)]!, now)
  }

  return s
}
