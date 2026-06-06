export const COLS = 10
export const ROWS = 30
export const GRID_SIZE = COLS * ROWS
export const TICK_MS = 132
export const TICK_MS_MIN = 76
export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const ROUND_SECONDS = 60
export const ROUND_BREAK_MS = 2200
export const START_LENGTH = 3
export const FOOD_SCORE = 10
export const DIAMOND_SCORE = 35
export const DIAMOND_SPAWN_CHANCE = 0.2
export const DIAMOND_LIFETIME_TICKS = 28
export const DEATH_RESPAWN_TICKS = 8
export const DEATH_RESPAWN_MS = 900
export const INVINCIBLE_TICKS = 6
/** Maç / respawn sonrası ilk birkaç tick çarpışma yok */
export const STARTUP_INVINCIBLE_TICKS = 5

export type Direction = 'up' | 'down' | 'left' | 'right'
export type DeathCause = 'self'
export type PickupKind = 'food' | 'diamond'

export type SnakePickupFx = {
  kind: PickupKind
  scoreGain: number
  tick: number
  cell: number
}

export type SnakeLaneState = {
  laneId: 1 | 2
  body: number[]
  direction: Direction
  queuedDir: Direction
  pendingDir: Direction | null
  food: number
  diamond: number | null
  diamondTicks: number
  score: number
  length: number
  alive: boolean
  matchPoints: number
  pickupFx: SnakePickupFx | null
  simTick: number
  respawnAtSimTick: number | null
  invincibleUntil: number
  deathCause: DeathCause | null
  combo: number
  diamondsCollected: number
  ticksSinceEat: number
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

export function wrapCol(col: number) {
  return ((col % COLS) + COLS) % COLS
}

export function wrapRow(row: number) {
  return ((row % ROWS) + ROWS) % ROWS
}

export function nextCellIndex(head: number, dir: Direction): number {
  let c = colOf(head)
  let r = rowOf(head)
  if (dir === 'up') r -= 1
  else if (dir === 'down') r += 1
  else if (dir === 'left') c -= 1
  else c += 1
  return idx(wrapCol(c), wrapRow(r))
}

export function isOpposite(a: Direction, b: Direction) {
  return (
    (a === 'up' && b === 'down') ||
    (a === 'down' && b === 'up') ||
    (a === 'left' && b === 'right') ||
    (a === 'right' && b === 'left')
  )
}

export function manhattan(a: number, b: number) {
  return Math.abs(colOf(a) - colOf(b)) + Math.abs(rowOf(a) - rowOf(b))
}

function spawnEmptyCell(occupied: Set<number>, rand: () => number) {
  const free: number[] = []
  for (let i = 0; i < GRID_SIZE; i++) {
    if (!occupied.has(i)) free.push(i)
  }
  if (free.length === 0) return null
  return free[Math.floor(rand() * free.length)]!
}

function pickSpawnCell(occupied: Set<number>, rand: () => number, fallback: number) {
  const spot = spawnEmptyCell(occupied, rand)
  if (spot !== null) return spot
  for (let i = 0; i < GRID_SIZE; i++) {
    if (!occupied.has(i)) return i
  }
  return fallback
}

function occupiedCells(lane: Pick<SnakeLaneState, 'body' | 'food' | 'diamond'>) {
  const set = new Set(lane.body)
  if (lane.food >= 0) set.add(lane.food)
  if (lane.diamond !== null) set.add(lane.diamond)
  return set
}

function peekBodyAfterMove(lane: SnakeLaneState): number[] | null {
  if (!lane.alive || lane.body.length === 0) return null
  const dir = resolveMoveDirection(lane)
  const head = lane.body[0]!
  const next = nextCellIndex(head, dir)
  const grows = next === lane.food
  let body = [next, ...lane.body]
  if (!grows) body = body.slice(0, -1)
  return body
}

/** Kuyruk hareket yönünün tersinde — ilk tick’te kendine çarpmaz */
function initialBody(laneId: 1 | 2): number[] {
  const midCol = Math.floor(COLS / 2)
  if (laneId === 1) {
    const head = idx(midCol, ROWS - 3)
    return [head, head + COLS, head + COLS * 2]
  }
  const head = idx(midCol, 2)
  return [head, head - COLS, head - COLS * 2]
}

export function tickIntervalMs(length1: number, length2: number, elapsedSec = 0) {
  const longest = Math.max(length1, length2)
  const lengthBoost = Math.max(0, longest - START_LENGTH) * 1.6
  const timeBoost = Math.max(0, elapsedSec) * 1.25
  return Math.max(TICK_MS_MIN, Math.round(TICK_MS - lengthBoost - timeBoost))
}

export function createLane(laneId: 1 | 2, seed: number): SnakeLaneState {
  const rand = mulberry32(seed)
  const body = initialBody(laneId)
  const occupied = new Set(body)
  const food = spawnEmptyCell(occupied, rand) ?? 0
  return {
    laneId,
    body,
    direction: laneId === 1 ? 'up' : 'down',
    queuedDir: laneId === 1 ? 'up' : 'down',
    pendingDir: null,
    food,
    diamond: null,
    diamondTicks: 0,
    score: 0,
    length: START_LENGTH,
    alive: true,
    matchPoints: 0,
    pickupFx: null,
    simTick: 0,
    respawnAtSimTick: null,
    invincibleUntil: STARTUP_INVINCIBLE_TICKS,
    deathCause: null,
    combo: 0,
    diamondsCollected: 0,
    ticksSinceEat: 0,
  }
}

export function willHitSelf(body: number[], next: number, willGrow: boolean): boolean {
  if (body.length === 0) return false
  const obstacles = willGrow ? body : body.slice(0, -1)
  return obstacles.includes(next)
}

function willCrashOnStep(body: number[], head: number, dir: Direction, food: number): boolean {
  const next = nextCellIndex(head, dir)
  return willHitSelf(body, next, next === food)
}

function wouldCrashIfQueued(lane: SnakeLaneState, dir: Direction): boolean {
  const moveDir = resolveMoveDirection(lane)
  if (isOpposite(moveDir, dir)) return true

  const hasBufferedTurn = lane.queuedDir !== lane.direction
  if (!hasBufferedTurn) {
    const head = lane.body[0]!
    return willCrashOnStep(lane.body, head, dir, lane.food)
  }

  if (isOpposite(lane.queuedDir, dir)) return true

  const peek = peekBodyAfterMove(lane)
  if (!peek || peek.length === 0) return false
  return willCrashOnStep(peek, peek[0]!, dir, lane.food)
}

export function queueDirection(lane: SnakeLaneState, dir: Direction): SnakeLaneState {
  if (!lane.alive) return lane
  if (wouldCrashIfQueued(lane, dir)) return lane

  const hasBufferedTurn = lane.queuedDir !== lane.direction
  if (!hasBufferedTurn) {
    return { ...lane, queuedDir: dir, pendingDir: null }
  }
  return { ...lane, pendingDir: dir }
}

export function resolveMoveDirection(lane: SnakeLaneState): Direction {
  if (isOpposite(lane.direction, lane.queuedDir)) return lane.direction
  return lane.queuedDir
}

function trySpawnDiamond(occupied: Set<number>, rand: () => number) {
  if (rand() >= DIAMOND_SPAWN_CHANCE) return null
  return spawnEmptyCell(occupied, rand)
}

function dieLane(lane: SnakeLaneState, simTick: number): SnakeLaneState {
  return {
    ...lane,
    alive: false,
    combo: 0,
    pickupFx: null,
    simTick,
    deathCause: 'self',
    respawnAtSimTick: simTick + DEATH_RESPAWN_TICKS,
  }
}

export function tickLane(lane: SnakeLaneState, rand: () => number): SnakeLaneState {
  const simTick = lane.simTick + 1

  if (!lane.alive) {
    return { ...lane, simTick, pickupFx: null }
  }

  const dir = resolveMoveDirection(lane)
  const head = lane.body[0]!
  const next = nextCellIndex(head, dir)
  const ateFood = next === lane.food
  const ateDiamond = lane.diamond !== null && next === lane.diamond
  const grows = ateFood

  if (simTick >= lane.invincibleUntil && willHitSelf(lane.body, next, grows)) {
    return dieLane(lane, simTick)
  }

  let body = [next, ...lane.body]
  if (!grows) body.pop()

  let diamond = lane.diamond
  let diamondTicks = lane.diamondTicks
  if (diamond !== null && !ateDiamond) {
    diamondTicks = Math.max(0, diamondTicks - 1)
    if (diamondTicks === 0) diamond = null
  }

  let score = lane.score
  let food = lane.food
  let diamondsCollected = lane.diamondsCollected
  let pickupFx: SnakePickupFx | null = null

  if (ateFood) {
    score += FOOD_SCORE
    const occupied = occupiedCells({ body, food, diamond })
    occupied.delete(lane.food)
    food = pickSpawnCell(occupied, rand, lane.food)
    pickupFx = { kind: 'food', scoreGain: FOOD_SCORE, tick: simTick, cell: next }

    if (diamond === null) {
      const spot = trySpawnDiamond(occupied, rand)
      if (spot !== null) {
        diamond = spot
        diamondTicks = DIAMOND_LIFETIME_TICKS
      }
    }
  }

  if (ateDiamond) {
    score += DIAMOND_SCORE
    diamondsCollected += 1
    diamond = null
    diamondTicks = 0
    pickupFx = { kind: 'diamond', scoreGain: DIAMOND_SCORE, tick: simTick, cell: next }
  }

  const nextQueued = lane.pendingDir ?? dir

  return {
    ...lane,
    body,
    direction: dir,
    queuedDir: nextQueued,
    pendingDir: null,
    food,
    diamond,
    diamondTicks,
    score,
    length: body.length,
    diamondsCollected,
    pickupFx,
    simTick,
    deathCause: null,
  }
}

export function respawnLane(lane: SnakeLaneState, seed: number): SnakeLaneState {
  const next = createLane(lane.laneId, seed)
  const simTick = lane.simTick
  next.score = lane.score
  next.matchPoints = lane.matchPoints
  next.diamondsCollected = lane.diamondsCollected
  next.simTick = simTick
  next.invincibleUntil = simTick + INVINCIBLE_TICKS
  next.respawnAtSimTick = null
  next.deathCause = null
  return next
}

export function canRespawnLane(lane: SnakeLaneState): boolean {
  return !lane.alive && lane.respawnAtSimTick !== null && lane.simTick >= lane.respawnAtSimTick
}

export function isInvincible(lane: SnakeLaneState): boolean {
  return lane.alive && lane.simTick < lane.invincibleUntil
}

export function respawnCountdownMs(lane: SnakeLaneState): number {
  if (lane.alive || lane.respawnAtSimTick === null) return 0
  const ticksLeft = Math.max(0, lane.respawnAtSimTick - lane.simTick)
  return Math.ceil(ticksLeft * TICK_MS)
}

export function resolveRoundWinner(l1: SnakeLaneState, l2: SnakeLaneState): 'p1' | 'p2' | 'draw' {
  if (l1.score > l2.score) return 'p1'
  if (l2.score > l1.score) return 'p2'
  if (l1.diamondsCollected > l2.diamondsCollected) return 'p1'
  if (l2.diamondsCollected > l1.diamondsCollected) return 'p2'
  if (l1.length > l2.length) return 'p1'
  if (l2.length > l1.length) return 'p2'
  return 'draw'
}

export function foodScoreGain() {
  return FOOD_SCORE
}
