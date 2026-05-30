import { tryFire, tryMove, type BerzerkSideState, type Dir } from './berzerkDuelEngine'

const DIRS: Dir[] = ['up', 'down', 'left', 'right']

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by)
}

export function tickBerzerkBot(side: BerzerkSideState, now: number): BerzerkSideState {
  if (side.lives <= 0) return side

  let s = side
  const otto = s.robots.find((r) => r.kind === 'otto')
  const nearest = s.robots
    .filter((r) => r.kind !== 'otto')
    .map((r) => ({ r, d: dist(r.x, r.y, s.px, s.py) }))
    .sort((a, b) => a.d - b.d)[0]

  if (otto) {
    const dx = s.px - otto.x
    const dy = s.py - otto.y
    const dir: Dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'
    s = tryMove(s, dir, now)
    s = tryFire(s, now)
    return s
  }

  if (nearest && nearest.d < 24) {
    const dx = s.px - nearest.r.x
    const dy = s.py - nearest.r.y
    const dir: Dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'
    s = tryMove(s, dir, now)
    const aim: Dir =
      Math.abs(nearest.r.x - s.px) > Math.abs(nearest.r.y - s.py)
        ? nearest.r.x > s.px
          ? 'right'
          : 'left'
        : nearest.r.y > s.py
          ? 'down'
          : 'up'
    s = { ...s, aim }
    s = tryFire(s, now)
  } else if (nearest) {
    const dx = nearest.r.x - s.px
    const dy = nearest.r.y - s.py
    const dir: Dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'
    s = tryMove(s, dir, now)
    s = { ...s, aim: dir }
    s = tryFire(s, now)
  } else if (Math.random() > 0.55) {
    s = tryMove(s, DIRS[Math.floor(Math.random() * 4)]!, now)
  }

  if (nearest && nearest.d < 32) s = tryFire(s, now)

  return s
}
