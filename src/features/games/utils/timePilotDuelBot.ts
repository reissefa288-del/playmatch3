import { tryFire, tryMove, type Dir, type TimePilotSideState } from './timePilotDuelEngine'

const DIRS: Dir[] = ['up', 'down', 'left', 'right']

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by)
}

export function tickTimePilotBot(side: TimePilotSideState, now: number): TimePilotSideState {
  if (side.lives <= 0) return side

  let s = side
  const nearest = s.enemies
    .map((e) => ({ e, d: dist(e.x, e.y, s.px, s.py) }))
    .sort((a, b) => a.d - b.d)[0]

  if (nearest && nearest.d < 26) {
    const dx = s.px - nearest.e.x
    const dy = s.py - nearest.e.y
    const dir: Dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'
    s = tryMove(s, dir, now)
    const aim: Dir =
      Math.abs(nearest.e.x - s.px) > Math.abs(nearest.e.y - s.py)
        ? nearest.e.x > s.px
          ? 'right'
          : 'left'
        : nearest.e.y > s.py
          ? 'down'
          : 'up'
    s = { ...s, aim }
    s = tryFire(s, now)
  } else if (nearest) {
    const dx = nearest.e.x - s.px
    const dy = nearest.e.y - s.py
    const dir: Dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'
    s = tryMove(s, dir, now)
    s = { ...s, aim: dir }
    if (nearest.d < 35) s = tryFire(s, now)
  } else if (Math.random() > 0.5) {
    s = tryMove(s, DIRS[Math.floor(Math.random() * 4)]!, now)
  }

  if (nearest && nearest.d < 30) s = tryFire(s, now)

  return s
}
