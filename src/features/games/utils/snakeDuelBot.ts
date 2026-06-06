import {
  isOpposite,
  manhattan,
  nextCellIndex,
  resolveMoveDirection,
  willHitSelf,
  type Direction,
  type SnakeLaneState,
} from './snakeDuelEngine'

const DIRS: Direction[] = ['up', 'down', 'left', 'right']
const MISTAKE_CHANCE = 0.12

function isSafe(lane: SnakeLaneState, dir: Direction) {
  if (isOpposite(resolveMoveDirection(lane), dir)) return false
  const head = lane.body[0]!
  const next = nextCellIndex(head, dir)
  const willGrow = next === lane.food
  return !willHitSelf(lane.body, next, willGrow)
}

function scoreDirection(lane: SnakeLaneState, dir: Direction) {
  if (!isSafe(lane, dir)) return -999
  const head = lane.body[0]!
  const next = nextCellIndex(head, dir)
  let score = 0

  if (lane.diamond !== null) {
    if (next === lane.diamond) score += 120
    else score += (manhattan(head, lane.diamond) - manhattan(next, lane.diamond)) * 11
    if (lane.diamondTicks <= 8) score += 25
  }

  if (next === lane.food) score += 75
  else score += (manhattan(head, lane.food) - manhattan(next, lane.food)) * 9

  return score
}

export function pickBotDirection(lane: SnakeLaneState, rand: () => number = Math.random): Direction {
  const options = DIRS.map((d) => ({ dir: d, score: scoreDirection(lane, d) })).filter((o) => o.score > -900)

  if (options.length === 0) return lane.queuedDir

  if (options.length > 1 && rand() < MISTAKE_CHANCE) {
    const pick = options[Math.floor(rand() * options.length)]!
    return pick.dir
  }

  let best = options[0]!
  for (const opt of options) {
    if (opt.score > best.score) best = opt
  }
  return best.dir
}
