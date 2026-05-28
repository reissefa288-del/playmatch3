export const GRID_SIZE = 9
export const COLS = 3
export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const ROUND_SECONDS = 60
export const ROUND_BREAK_MS = 2200
export const TARGET_TIMEOUT_MS = 4500

export const COLOR_IDS = ['violet', 'gold', 'cyan', 'pink'] as const
export type ColorId = (typeof COLOR_IDS)[number]

export type ColorCell = {
  color: ColorId
}

export type ColorLaneState = {
  laneId: 1 | 2
  cells: ColorCell[]
  score: number
  combo: number
  comboMult: number
  matchPoints: number
  lastFx: 'hit' | 'miss' | null
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

function pickOtherColor(rand: () => number, exclude: ColorId): ColorId {
  const pool = COLOR_IDS.filter((c) => c !== exclude)
  return pool[Math.floor(rand() * pool.length)]!
}

export function buildGrid(seed: number, target: ColorId): ColorCell[] {
  const rand = mulberry32(seed)
  const matchIndex = Math.floor(rand() * GRID_SIZE)
  return Array.from({ length: GRID_SIZE }, (_, i) => ({
    color: i === matchIndex ? target : pickOtherColor(rand, target),
  }))
}

export function createLane(laneId: 1 | 2): ColorLaneState {
  return {
    laneId,
    cells: Array.from({ length: GRID_SIZE }, () => ({ color: 'violet' })),
    score: 0,
    combo: 0,
    comboMult: 1,
    matchPoints: 0,
    lastFx: null,
  }
}

export function comboMultiplier(combo: number) {
  return Math.min(3, 1 + combo * 0.15)
}

export function applyHit(lane: ColorLaneState, index: number, target: ColorId): ColorLaneState {
  const cell = lane.cells[index]
  if (!cell || cell.color !== target) {
    return {
      ...lane,
      combo: 0,
      comboMult: 1,
      lastFx: 'miss',
    }
  }
  const combo = lane.combo + 1
  const mult = comboMultiplier(combo)
  const gain = Math.round(100 * mult)
  return {
    ...lane,
    combo,
    comboMult: mult,
    score: lane.score + gain,
    lastFx: 'hit',
  }
}

export function resolveRoundWinner(l1: ColorLaneState, l2: ColorLaneState): 'p1' | 'p2' | 'draw' {
  if (l1.score > l2.score) return 'p1'
  if (l2.score > l1.score) return 'p2'
  return 'draw'
}

export function findTargetIndex(cells: ColorCell[], target: ColorId) {
  return cells.findIndex((c) => c.color === target)
}
