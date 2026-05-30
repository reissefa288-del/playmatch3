import { tryFire, tryMove, type Dir, type RobotronSideState } from './robotronDuelEngine'

const DIRS: Dir[] = ['up', 'down', 'left', 'right']

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by)
}

export function tickRobotronBot(side: RobotronSideState, now: number): RobotronSideState {
  if (side.lives <= 0) return side

  let s = side
  const nearest = s.enemies
    .map((e) => ({ e, d: dist(e.x, e.y, s.px, s.py) }))
    .sort((a, b) => a.d - b.d)[0]

  const human = s.humans.find((h) => !h.saved)

  if (nearest && nearest.d < 22) {
    const dx = s.px - nearest.e.x
    const dy = s.py - nearest.e.y
    let dir: Dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'
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
  } else if (human) {
    const dx = human.x - s.px
    const dy = human.y - s.py
    const dir: Dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'
    s = tryMove(s, dir, now)
    if (dist(human.x, human.y, s.px, s.py) < 18) {
      s = { ...s, aim: dir }
      s = tryFire(s, now)
    }
  } else if (Math.random() > 0.5) {
    s = tryMove(s, DIRS[Math.floor(Math.random() * 4)]!, now)
  }

  if (nearest) s = tryFire(s, now)

  return s
}
