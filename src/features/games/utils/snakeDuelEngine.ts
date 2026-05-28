export const COLS = 10
export const ROWS = 12
export const GRID_SIZE = COLS * ROWS
export const TICK_MS = 130
export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const ROUND_SECONDS = 60
export const ROUND_BREAK_MS = 2200
export const START_LENGTH = 3

export type Direction = 'up' | 'down' | 'left' | 'right'

export type SnakeLaneState = {
  laneId: 1 | 2
  body: number[]
  direction: Direction
  queuedDir: Direction
  food: number
  score: number
  length: number
  alive: boolean
  matchPoints: number
}

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function idx(col: number, row: number) {
  return row * COLS + col
}

export function colOf(index: number) {
  return index % COLS
}

export function rowOf(index: number) {
  return Math.floor(index / COLS)
}

export function isOpposite(a: Direction, b: Direction) {
  return (
    (a === 'up' && b === 'down') ||
    (a === 'down' && b === 'up') ||
    (a === 'left' && b === 'right') ||
    (a === 'right' && b === 'left')
  )
}

function spawnFood(occupied: Set<number>, rand: () => number) {
  for (let t = 0; t < 120; t++) {
    const i = Math.floor(rand() * GRID_SIZE)
    if (!occupied.has(i)) return i
  }
  return 0
}

function initialBody(laneId: 1 | 2): number[] {
  const midCol = Math.floor(COLS / 2)
  const row = laneId === 1 ? ROWS - 2 : 1
  const head = idx(midCol, row)
  const d = laneId === 1 ? -COLS : COLS
  return [head, head + d, head + d * 2]
}

export function createLane(laneId: 1 | 2, seed: number): SnakeLaneState {
  const rand = mulberry32(seed)
  const body = initialBody(laneId)
  const occupied = new Set(body)
  return {
    laneId,
    body,
    direction: laneId === 1 ? 'up' : 'down',
    queuedDir: laneId === 1 ? 'up' : 'down',
    food: spawnFood(occupied, rand),
    score: 0,
    length: START_LENGTH,
    alive: true,
    matchPoints: 0,
  }
}

export function queueDirection(lane: SnakeLaneState, dir: Direction): SnakeLaneState {
  if (!lane.alive) return lane
  if (isOpposite(lane.queuedDir, dir)) return lane
  return { ...lane, queuedDir: dir }
}

function nextHeadIndex(head: number, dir: Direction) {
  const c = colOf(head)
  const r = rowOf(head)
  if (dir === 'up') return idx(c, r - 1)
  if (dir === 'down') return idx(c, r + 1)
  if (dir === 'left') return idx(c - 1, r)
  return idx(c + 1, r)
}

export function tickLane(lane: SnakeLaneState, rand: () => number): SnakeLaneState {
  if (!lane.alive) return lane

  const dir = lane.queuedDir
  const head = lane.body[0]!
  const next = nextHeadIndex(head, dir)
  const nc = colOf(next)
  const nr = rowOf(next)

  if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS || lane.body.includes(next)) {
    return { ...lane, alive: false }
  }

  const ate = next === lane.food
  const body = [next, ...lane.body]
  if (!ate) body.pop()

  const score = lane.score + (ate ? 10 + lane.length : 0)
  const length = body.length
  const occupied = new Set(body)
  const food = ate ? spawnFood(occupied, rand) : lane.food

  return {
    ...lane,
    body,
    direction: dir,
    queuedDir: dir,
    food,
    score,
    length,
  }
}

export function respawnLane(lane: SnakeLaneState, seed: number): SnakeLaneState {
  const next = createLane(lane.laneId, seed)
  next.score = lane.score
  next.matchPoints = lane.matchPoints
  return next
}

export function resolveRoundWinner(l1: SnakeLaneState, l2: SnakeLaneState): 'p1' | 'p2' | 'draw' {
  if (l1.score > l2.score) return 'p1'
  if (l2.score > l1.score) return 'p2'
  return 'draw'
}
