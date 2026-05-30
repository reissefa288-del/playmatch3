import { HOME_COLS, tryMove, type FroggerSideState } from './froggerDuelEngine'

const RIVER_ROWS = [6, 7, 8]

export function tickFroggerBot(side: FroggerSideState, now: number): FroggerSideState {
  if (side.lives <= 0) return side

  let next = side
  const col = side.frogCol
  const row = side.frogRow

  if (row === 9) {
    next = tryMove(next, 'up', now)
    return next
  }

  if (RIVER_ROWS.includes(row)) {
    const logs = next.vehicles.filter((v) => v.kind === 'log' && v.row === row)
    const log = logs.find((l) => col >= l.x && col <= l.x + l.width)
    if (log) {
      const center = log.x + log.width / 2
      if (col < center - 0.3) next = tryMove(next, 'right', now)
      else if (col > center + 0.3) next = tryMove(next, 'left', now)
      else if (Math.random() < 0.35) next = tryMove(next, 'up', now)
    } else {
      const nearest = logs.reduce<(typeof logs)[0] | null>((best, l) => {
        const d = Math.abs(col - (l.x + l.width / 2))
        if (!best) return l
        const bd = Math.abs(col - (best.x + best.width / 2))
        return d < bd ? l : best
      }, null)
      if (nearest) {
        if (col < nearest.x) next = tryMove(next, 'right', now)
        else next = tryMove(next, 'left', now)
      }
    }
    return next
  }

  if (row >= 2 && row <= 4) {
    const cars = next.vehicles.filter((v) => v.kind === 'car' && v.row === row)
    const danger = cars.some((c) => Math.abs(col - (c.x + c.width / 2)) < 2)
    if (!danger && Math.random() < 0.45) next = tryMove(next, 'up', now)
    else if (danger && col > 0 && Math.random() < 0.5) next = tryMove(next, 'left', now)
    else if (danger && col < 8) next = tryMove(next, 'right', now)
    return next
  }

  if (row === 1 || row === 5) {
    if (Math.random() < 0.5) next = tryMove(next, 'up', now)
    return next
  }

  if (row === 0) {
    const open = side.homesFilled.findIndex((filled) => !filled)
    if (open >= 0) {
      const target = HOME_COLS[open]!
      if (col < target) next = tryMove(next, 'right', now)
      else if (col > target) next = tryMove(next, 'left', now)
    }
  }

  return next
}
