export const COLS = 3
export const ROWS = 9
export const GRID_SIZE = COLS * ROWS
export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const ROUND_SECONDS = 60
export const ROUND_BREAK_MS = 2200
export const TARGET_TIMEOUT_MS = 14000
export const BOARD_CLEAR_MS = 450

export const COLOR_IDS = ['violet', 'gold', 'cyan', 'pink'] as const
export type ColorId = (typeof COLOR_IDS)[number]

export type ColorCell = {
  color: ColorId
  cleared: boolean
}

export type ColorLaneState = {
  laneId: 1 | 2
  cells: ColorCell[]
  targets: ColorId[]
  targetKey: number
  score: number
  combo: number
  comboMult: number
  matchPoints: number
  hits: number
  misses: number
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

function shuffleIndices(rand: () => number, size: number) {
  const arr = Array.from({ length: size }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

function pickDistractor(rand: () => number, targets: ColorId[]): ColorId {
  const pool = COLOR_IDS.filter((c) => !targets.includes(c))
  if (pool.length === 0) return COLOR_IDS[Math.floor(rand() * COLOR_IDS.length)]!
  return pool[Math.floor(rand() * pool.length)]!
}

export function pickTargets(seed: number): ColorId[] {
  const rand = mulberry32(seed)
  const count = rand() > 0.45 ? 3 : 2
  const order = shuffleIndices(rand, COLOR_IDS.length)
  return order.slice(0, count).map((i) => COLOR_IDS[i]!)
}

export function buildGrid(seed: number, targets: ColorId[]): ColorCell[] {
  const rand = mulberry32(seed + 17)
  const cells: ColorCell[] = Array.from({ length: GRID_SIZE }, () => ({
    color: 'violet' as ColorId,
    cleared: false,
  }))
  const slots = shuffleIndices(rand, GRID_SIZE)
  let slot = 0

  const matchTotal = Math.min(GRID_SIZE - 6, Math.max(10, Math.floor(GRID_SIZE * 0.42)))
  const copiesPerTarget = Math.max(3, Math.floor(matchTotal / targets.length))

  for (const target of targets) {
    for (let c = 0; c < copiesPerTarget && slot < GRID_SIZE; c++) {
      cells[slots[slot]!] = { color: target, cleared: false }
      slot++
    }
  }

  while (slot < GRID_SIZE) {
    cells[slots[slot]!] = { color: pickDistractor(rand, targets), cleared: false }
    slot++
  }

  return cells
}

export function createLane(laneId: 1 | 2, seed = laneId * 97): ColorLaneState {
  const targets = pickTargets(seed)
  return {
    laneId,
    cells: buildGrid(seed + 11, targets),
    targets,
    targetKey: 0,
    score: 0,
    combo: 0,
    comboMult: 1,
    matchPoints: 0,
    hits: 0,
    misses: 0,
    lastFx: null,
  }
}

export function comboMultiplier(combo: number) {
  return Math.min(3, 1 + combo * 0.15)
}

export function isTargetColor(targets: ColorId[], color: ColorId) {
  return targets.includes(color)
}

export function remainingMatches(lane: ColorLaneState) {
  return lane.cells.filter((c) => !c.cleared && isTargetColor(lane.targets, c.color)).length
}

export function applyHit(lane: ColorLaneState, index: number): ColorLaneState {
  const cell = lane.cells[index]
  if (!cell || cell.cleared) {
    return { ...lane, lastFx: null }
  }

  if (!isTargetColor(lane.targets, cell.color)) {
    return {
      ...lane,
      combo: 0,
      comboMult: 1,
      misses: lane.misses + 1,
      lastFx: 'miss',
    }
  }

  const cells = lane.cells.map((c, i) => (i === index ? { ...c, cleared: true } : c))
  const combo = lane.combo + 1
  const mult = comboMultiplier(combo)
  const gain = Math.round(80 * mult)

  return {
    ...lane,
    cells,
    combo,
    comboMult: mult,
    score: lane.score + gain,
    hits: lane.hits + 1,
    lastFx: 'hit',
  }
}

export function refreshLaneBoard(lane: ColorLaneState, seed: number): ColorLaneState {
  const targets = pickTargets(seed + lane.laneId * 31)
  return {
    ...lane,
    targets,
    targetKey: lane.targetKey + 1,
    cells: buildGrid(seed + lane.laneId * 17, targets),
    lastFx: null,
  }
}

export function resolveRoundWinner(l1: ColorLaneState, l2: ColorLaneState): 'p1' | 'p2' | 'draw' {
  if (l1.score > l2.score) return 'p1'
  if (l2.score > l1.score) return 'p2'
  return 'draw'
}

export function findNextMatchIndex(lane: ColorLaneState) {
  return lane.cells.findIndex((c) => !c.cleared && isTargetColor(lane.targets, c.color))
}
