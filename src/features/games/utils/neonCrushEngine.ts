export const COLS = 5
export const ROWS = 8
export const GRID_SIZE = COLS * ROWS
/** Tek düello: 1:30 — en yüksek skor kazanır */
export const DUEL_SECONDS = 90
export const MATCH_ROUNDS = 1
export const WIN_ROUNDS = 1
export const ROUND_BREAK_MS = 2400
export const MATCH_ANIM_MS = 420
export const SETTLE_ANIM_MS = 380

/** a1–a5 referans PNG’leri ile birebir */
export const GEM_IDS = ['a1', 'a2', 'a3', 'a4', 'a5'] as const
export type GemId = (typeof GEM_IDS)[number]

export type NeonBoard = GemId[]

export type MatchSegment = {
  orientation: 'h' | 'v'
  indices: number[]
}

export type NeonLaneFx = {
  popIndices: number[]
  segments: MatchSegment[]
  scoreGain: number
  combo: number
  tick: number
  swap?: [number, number]
}

export type NeonLaneSettle = {
  indices: number[]
  tick: number
}

export type NeonLaneState = {
  laneId: 1 | 2
  cells: NeonBoard
  score: number
  combo: number
  comboMult: number
  matchPoints: number
  roundScore: number
  fx: NeonLaneFx | null
  settle: NeonLaneSettle | null
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

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function pickRandomGem(rand: () => number): GemId {
  return GEM_IDS[Math.floor(rand() * GEM_IDS.length)]!
}

export function normalizeBoard(cells: readonly string[]): NeonBoard {
  const legacy: Record<string, GemId> = {
    star: 'a1',
    moon: 'a2',
    diamond: 'a3',
    club: 'a4',
    flame: 'a5',
    heart: 'a1',
  }
  return cells.map((g) => {
    if (GEM_IDS.includes(g as GemId)) return g as GemId
    return legacy[g] ?? pickRandomGem(() => Math.random())
  }) as NeonBoard
}

export function findMatches(board: NeonBoard): Set<number> {
  const matched = new Set<number>()

  for (let row = 0; row < ROWS; row++) {
    let col = 0
    while (col < COLS) {
      const start = col
      const gem = board[idx(col, row)]
      while (col < COLS && board[idx(col, row)] === gem) col++
      if (col - start >= 3) {
        for (let c = start; c < col; c++) matched.add(idx(c, row))
      }
    }
  }

  for (let col = 0; col < COLS; col++) {
    let row = 0
    while (row < ROWS) {
      const start = row
      const gem = board[idx(col, row)]
      while (row < ROWS && board[idx(col, row)] === gem) row++
      if (row - start >= 3) {
        for (let r = start; r < row; r++) matched.add(idx(col, r))
      }
    }
  }

  return matched
}

export function findMatchSegments(board: NeonBoard): MatchSegment[] {
  const segments: MatchSegment[] = []

  for (let row = 0; row < ROWS; row++) {
    let col = 0
    while (col < COLS) {
      const start = col
      const gem = board[idx(col, row)]
      while (col < COLS && board[idx(col, row)] === gem) col++
      if (col - start >= 3) {
        const indices: number[] = []
        for (let c = start; c < col; c++) indices.push(idx(c, row))
        segments.push({ orientation: 'h', indices })
      }
    }
  }

  for (let col = 0; col < COLS; col++) {
    let row = 0
    while (row < ROWS) {
      const start = row
      const gem = board[idx(col, row)]
      while (row < ROWS && board[idx(col, row)] === gem) row++
      if (row - start >= 3) {
        const indices: number[] = []
        for (let r = start; r < row; r++) indices.push(idx(col, r))
        segments.push({ orientation: 'v', indices })
      }
    }
  }

  return segments
}

export function computeSpawnIndices(before: NeonBoard, after: NeonBoard) {
  const spawn: number[] = []
  for (let i = 0; i < GRID_SIZE; i++) {
    if (before[i] !== after[i]) spawn.push(i)
  }
  return spawn
}

function fillGravity(cells: (GemId | null)[], rand: () => number): NeonBoard {
  const out: GemId[] = new Array(GRID_SIZE)
  for (let col = 0; col < COLS; col++) {
    const stack: GemId[] = []
    for (let row = ROWS - 1; row >= 0; row--) {
      const gem = cells[idx(col, row)]
      if (gem) stack.push(gem)
    }
    let writeRow = ROWS - 1
    for (const gem of stack) {
      out[idx(col, writeRow)] = gem
      writeRow--
    }
    while (writeRow >= 0) {
      out[idx(col, writeRow)] = pickRandomGem(rand)
      writeRow--
    }
  }
  return out
}

export function resolveBoard(
  board: NeonBoard,
  rand: () => number,
): {
  board: NeonBoard
  cleared: number
  maxCombo: number
  popIndices: number[]
  segments: MatchSegment[]
} {
  let current = [...board]
  let totalCleared = 0
  let maxCombo = 0
  let chain = 0
  const popIndices: number[] = []
  const segments: MatchSegment[] = []

  while (true) {
    const matched = findMatches(current)
    if (matched.size === 0) break
    chain++
    maxCombo = Math.max(maxCombo, chain)
    totalCleared += matched.size
    matched.forEach((i) => popIndices.push(i))
    findMatchSegments(current).forEach((seg) => segments.push(seg))
    const next: (GemId | null)[] = current.map((gem, i) => (matched.has(i) ? null : gem))
    current = fillGravity(next, rand)
  }

  return { board: current, cleared: totalCleared, maxCombo, popIndices, segments }
}

export function comboMultiplier(combo: number) {
  return Math.min(3.5, 1 + combo * 0.25)
}

export function scoreForClear(cleared: number, maxCombo: number) {
  if (cleared === 0) return 0
  return Math.round(cleared * 55 * comboMultiplier(maxCombo))
}

export function areAdjacent(a: number, b: number) {
  if (a === b) return false
  const ca = colOf(a)
  const ra = rowOf(a)
  const cb = colOf(b)
  const rb = rowOf(b)
  return (ca === cb && Math.abs(ra - rb) === 1) || (ra === rb && Math.abs(ca - cb) === 1)
}

function swapCells(board: NeonBoard, a: number, b: number): NeonBoard {
  const next = [...board]
  const tmp = next[a]!
  next[a] = next[b]!
  next[b] = tmp
  return next
}

export function trySwap(
  board: NeonBoard,
  a: number,
  b: number,
  rand: () => number,
):
  | {
      ok: true
      previewBoard: NeonBoard
      board: NeonBoard
      scoreGain: number
      combo: number
      popIndices: number[]
      segments: MatchSegment[]
      swap: [number, number]
    }
  | { ok: false; board: NeonBoard } {
  if (!areAdjacent(a, b)) return { ok: false, board }
  const swapped = swapCells(board, a, b)
  if (findMatches(swapped).size === 0) return { ok: false, board }
  const resolved = resolveBoard(swapped, rand)
  const previewSegments = findMatchSegments(swapped)
  return {
    ok: true,
    previewBoard: swapped,
    board: resolved.board,
    scoreGain: scoreForClear(resolved.cleared, resolved.maxCombo),
    combo: resolved.maxCombo,
    popIndices: resolved.popIndices,
    segments: previewSegments.length > 0 ? previewSegments : resolved.segments,
    swap: [a, b],
  }
}

export function createBoard(seed: number): NeonBoard {
  const rand = mulberry32(seed)
  let board: NeonBoard
  let guard = 0
  do {
    board = Array.from({ length: GRID_SIZE }, () => pickRandomGem(rand))
    guard++
  } while (findMatches(board).size > 0 && guard < 40)
  return board
}

export function createLane(laneId: 1 | 2, seed: number): NeonLaneState {
  return {
    laneId,
    cells: createBoard(seed),
    score: 0,
    combo: 0,
    comboMult: 1,
    matchPoints: 0,
    roundScore: 0,
    fx: null,
    settle: null,
  }
}

export function resolveRoundWinner(l1: NeonLaneState, l2: NeonLaneState): 'p1' | 'p2' | 'draw' {
  if (l1.roundScore > l2.roundScore) return 'p1'
  if (l2.roundScore > l1.roundScore) return 'p2'
  return 'draw'
}

export function comboFill(combo: number) {
  return Math.min(1, combo / 8)
}
