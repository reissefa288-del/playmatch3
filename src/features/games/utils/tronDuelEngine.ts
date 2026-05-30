export const COLS = 12
export const ROWS = 10
export const GRID_SIZE = COLS * ROWS
export const TICK_MS = 105
export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 3600
export const LEG_DURATION_MS = 50_000
export const ROUND_BREAK_MS = 2600
export const RESPAWN_MS = 900
export const TICK_SCORE = 14
export const LENGTH_BONUS_EVERY = 5
export const LENGTH_BONUS = 45
export const CRASH_PENALTY = 120

export type Direction = 'up' | 'down' | 'left' | 'right'

export type TronSideState = {
  sideId: 1 | 2
  trail: number[]
  dir: Direction
  queuedDir: Direction
  score: number
  matchPoints: number
  alive: boolean
  crashes: number
  maxTrail: number
  respawnAt: number
  lastTickAt: number
}

export type TronState = {
  p1: TronSideState
  p2: TronSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
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

function nextIndex(head: number, dir: Direction) {
  const c = colOf(head)
  const r = rowOf(head)
  if (dir === 'up') return idx(c, r - 1)
  if (dir === 'down') return idx(c, r + 1)
  if (dir === 'left') return idx(c - 1, r)
  return idx(c + 1, r)
}

function startTrail(sideId: 1 | 2) {
  if (sideId === 1) {
    const head = idx(Math.floor(COLS / 2), ROWS - 2)
    return { trail: [head], dir: 'up' as Direction, queuedDir: 'up' as Direction }
  }
  const head = idx(Math.floor(COLS / 2), 1)
  return { trail: [head], dir: 'down' as Direction, queuedDir: 'down' as Direction }
}

export function createSide(sideId: 1 | 2, now: number): TronSideState {
  const start = startTrail(sideId)
  return {
    sideId,
    trail: start.trail,
    dir: start.dir,
    queuedDir: start.queuedDir,
    score: 0,
    matchPoints: 0,
    alive: true,
    crashes: 0,
    maxTrail: 1,
    respawnAt: 0,
    lastTickAt: now,
  }
}

export function createTronState(now: number): TronState {
  return {
    p1: createSide(1, now),
    p2: createSide(2, now),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

export function queueDirection(side: TronSideState, dir: Direction): TronSideState {
  if (!side.alive || isOpposite(side.queuedDir, dir)) return side
  return { ...side, queuedDir: dir }
}

export function isDirectionSafe(side: TronSideState, dir: Direction) {
  if (!side.alive || isOpposite(side.queuedDir, dir)) return false
  const head = side.trail[0]
  if (head == null) return false
  const next = nextIndex(head, dir)
  const c = colOf(next)
  const r = rowOf(next)
  if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return false
  return !side.trail.includes(next)
}

function respawnSide(side: TronSideState, now: number): TronSideState {
  const start = startTrail(side.sideId)
  return {
    ...side,
    trail: start.trail,
    dir: start.dir,
    queuedDir: start.dir,
    alive: true,
    respawnAt: 0,
    lastTickAt: now,
  }
}

export function tickSide(side: TronSideState, now: number): TronSideState {
  if (now - side.lastTickAt < TICK_MS) return side

  if (!side.alive) {
    if (now < side.respawnAt) return side
    return respawnSide(side, now)
  }

  const dir = side.queuedDir
  const head = side.trail[0]!
  const next = nextIndex(head, dir)
  const c = colOf(next)
  const r = rowOf(next)

  if (c < 0 || c >= COLS || r < 0 || r >= ROWS || side.trail.includes(next)) {
    return {
      ...side,
      alive: false,
      respawnAt: now + RESPAWN_MS,
      score: Math.max(0, side.score - CRASH_PENALTY),
      crashes: side.crashes + 1,
      lastTickAt: now,
    }
  }

  const trail = [next, ...side.trail]
  const len = trail.length
  const bonus = len > 1 && len % LENGTH_BONUS_EVERY === 0 ? LENGTH_BONUS : 0

  return {
    ...side,
    trail,
    dir,
    queuedDir: dir,
    score: side.score + TICK_SCORE + bonus,
    maxTrail: Math.max(side.maxTrail, len),
    lastTickAt: now,
  }
}

export function legShouldEnd(state: TronState, now: number) {
  if (now >= state.legEndsAt) return true
  if (state.p1.score >= POINTS_TO_WIN || state.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: TronSideState, p2: TronSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  if (p1.maxTrail > p2.maxTrail) return 'p1'
  if (p2.maxTrail > p1.maxTrail) return 'p2'
  return 'draw'
}
