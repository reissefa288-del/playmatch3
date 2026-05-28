import {
  colOf,
  COLS,
  idx,
  isOpposite,
  rowOf,
  ROWS,
  type Direction,
  type SnakeLaneState,
} from './snakeDuelEngine'

const DIRS: Direction[] = ['up', 'down', 'left', 'right']

function nextIndex(head: number, dir: Direction) {
  const c = colOf(head)
  const r = rowOf(head)
  if (dir === 'up') return idx(c, r - 1)
  if (dir === 'down') return idx(c, r + 1)
  if (dir === 'left') return idx(c - 1, r)
  return idx(c + 1, r)
}

function isSafe(lane: SnakeLaneState, dir: Direction) {
  if (isOpposite(lane.queuedDir, dir)) return false
  const head = lane.body[0]!
  const next = nextIndex(head, dir)
  const c = colOf(next)
  const r = rowOf(next)
  if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return false
  return !lane.body.includes(next)
}

export function pickBotDirection(lane: SnakeLaneState): Direction {
  const head = lane.body[0]!
  const fc = colOf(lane.food)
  const fr = rowOf(lane.food)
  const hc = colOf(head)
  const hr = rowOf(head)

  const preferred: Direction[] = []
  if (fr < hr) preferred.push('up')
  if (fr > hr) preferred.push('down')
  if (fc < hc) preferred.push('left')
  if (fc > hc) preferred.push('right')

  for (const d of preferred) {
    if (isSafe(lane, d)) return d
  }
  for (const d of DIRS) {
    if (isSafe(lane, d)) return d
  }
  return lane.queuedDir
}
