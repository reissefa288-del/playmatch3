export const COLS = 5
export const ROWS = 8
export const GRID_SIZE = COLS * ROWS
export const DUEL_SECONDS = 90
export const MATCH_ROUNDS = 1
export const WIN_ROUNDS = 1
export const ROUND_BREAK_MS = 2400
export const MATCH_ANIM_MS = 420
export const SETTLE_ANIM_MS = 380

export const GEM_IDS = ['a1', 'a2', 'a3', 'a4', 'a5'] as const
export type GemId = (typeof GEM_IDS)[number]

export type SpecialKind = 'stripe-h' | 'stripe-v' | 'prism'

export type NeonCell = {
  gem: GemId
  special: SpecialKind | null
}

export type NeonBoard = NeonCell[]

export type MatchTier = 3 | 4 | 5

export type MatchSegment = {
  orientation: 'h' | 'v'
  indices: number[]
  length: number
  tier: MatchTier
}

export type MatchBurst = {
  tier: 4 | 5
  label: string
  comboLabel: string
  count: number
}

export type SpecialSpawnFx = {
  index: number
  kind: SpecialKind
}

export type SpecialActivateFx = {
  kind: SpecialKind
  label: string
}

export type NeonLaneFx = {
  popIndices: number[]
  segments: MatchSegment[]
  scoreGain: number
  combo: number
  tick: number
  swap?: [number, number]
  burst: MatchBurst | null
  specialSpawn: SpecialSpawnFx | null
  specialActivate: SpecialActivateFx | null
}

export type NeonLaneSettle = {
  indices: number[]
  tick: number
}

export type NeonPressureFx = {
  indices: number[]
  tick: number
  label: string
}

export type PressureIntensity = 'light' | 'medium' | 'heavy'

export const PRESSURE_COOLDOWN_MS = 2200
export const FINAL_RUSH_SECONDS = 10
export const FINAL_RUSH_SCORE_MULT = 1.25

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
  pressure: NeonPressureFx | null
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

export function createCell(gem: GemId, special: SpecialKind | null = null): NeonCell {
  return { gem, special }
}

export function cellGem(cell: NeonCell): GemId {
  return cell.gem
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

export function normalizeBoard(cells: readonly (NeonCell | string)[]): NeonBoard {
  const legacy: Record<string, GemId> = {
    star: 'a1',
    moon: 'a2',
    diamond: 'a3',
    club: 'a4',
    flame: 'a5',
    heart: 'a1',
  }
  return cells.map((raw) => {
    if (typeof raw === 'object' && raw !== null && 'gem' in raw) {
      const c = raw as NeonCell
      return createCell(
        GEM_IDS.includes(c.gem) ? c.gem : 'a1',
        c.special ?? null,
      )
    }
    const g = String(raw)
    if (GEM_IDS.includes(g as GemId)) return createCell(g as GemId)
    return createCell(legacy[g] ?? pickRandomGem(() => Math.random()))
  })
}

export function findMatches(board: NeonBoard): Set<number> {
  const matched = new Set<number>()

  for (let row = 0; row < ROWS; row++) {
    let col = 0
    while (col < COLS) {
      const start = col
      const gem = board[idx(col, row)]!.gem
      while (col < COLS && board[idx(col, row)]!.gem === gem) col++
      if (col - start >= 3) {
        for (let c = start; c < col; c++) matched.add(idx(c, row))
      }
    }
  }

  for (let col = 0; col < COLS; col++) {
    let row = 0
    while (row < ROWS) {
      const start = row
      const gem = board[idx(col, row)]!.gem
      while (row < ROWS && board[idx(col, row)]!.gem === gem) row++
      if (row - start >= 3) {
        for (let r = start; r < row; r++) matched.add(idx(col, r))
      }
    }
  }

  return matched
}

export function tierFromLength(length: number): MatchTier {
  if (length >= 5) return 5
  if (length === 4) return 4
  return 3
}

export function segmentLineBonus(segments: MatchSegment[]): number {
  let bonus = 0
  for (const seg of segments) {
    if (seg.tier === 5) bonus += 240
    else if (seg.tier === 4) bonus += 120
  }
  return bonus
}

export function analyzeMatchBurst(segments: MatchSegment[]): MatchBurst | null {
  let fives = 0
  let fours = 0
  for (const seg of segments) {
    if (seg.tier === 5) fives += 1
    else if (seg.tier === 4) fours += 1
  }
  if (fives > 0) {
    return {
      tier: 5,
      label: fives > 1 ? 'MEGA BEŞLİ' : 'BEŞLİ',
      comboLabel: fives > 1 ? `×5 COMBO ×${fives}` : '×5 COMBO',
      count: fives,
    }
  }
  if (fours > 0) {
    return {
      tier: 4,
      label: fours > 1 ? 'ÇİFT DÖRTLÜ' : 'DÖRTLÜ',
      comboLabel: fours > 1 ? `×4 COMBO ×${fours}` : '×4 COMBO',
      count: fours,
    }
  }
  return null
}

export function findMatchSegments(board: NeonBoard): MatchSegment[] {
  const segments: MatchSegment[] = []

  for (let row = 0; row < ROWS; row++) {
    let col = 0
    while (col < COLS) {
      const start = col
      const gem = board[idx(col, row)]!.gem
      while (col < COLS && board[idx(col, row)]!.gem === gem) col++
      const length = col - start
      if (length >= 3) {
        const indices: number[] = []
        for (let c = start; c < col; c++) indices.push(idx(c, row))
        segments.push({ orientation: 'h', indices, length, tier: tierFromLength(length) })
      }
    }
  }

  for (let col = 0; col < COLS; col++) {
    let row = 0
    while (row < ROWS) {
      const start = row
      const gem = board[idx(col, row)]!.gem
      while (row < ROWS && board[idx(col, row)]!.gem === gem) row++
      const length = row - start
      if (length >= 3) {
        const indices: number[] = []
        for (let r = start; r < row; r++) indices.push(idx(col, r))
        segments.push({ orientation: 'v', indices, length, tier: tierFromLength(length) })
      }
    }
  }

  return segments
}

export function specialLabel(kind: SpecialKind): string {
  if (kind === 'stripe-h') return 'SATIR PATLAMA'
  if (kind === 'stripe-v') return 'SÜTUN PATLAMA'
  return 'RENK PATLAMA'
}

function stripeKindForSegment(seg: MatchSegment): SpecialKind {
  return seg.orientation === 'h' ? 'stripe-h' : 'stripe-v'
}

function pickSpawnIndex(seg: MatchSegment): number {
  const mid = Math.floor(seg.indices.length / 2)
  return seg.indices[mid] ?? seg.indices[0]!
}

function planSpecialSpawns(segments: MatchSegment[]): Map<number, SpecialKind> {
  const spawns = new Map<number, SpecialKind>()
  for (const seg of segments) {
    if (seg.tier < 4) continue
    const index = pickSpawnIndex(seg)
    const kind: SpecialKind = seg.tier >= 5 ? 'prism' : stripeKindForSegment(seg)
    const existing = spawns.get(index)
    if (!existing || (existing !== 'prism' && kind === 'prism')) {
      spawns.set(index, kind)
    }
  }
  return spawns
}

export function activateSpecialAt(
  board: NeonBoard,
  index: number,
  partnerGem?: GemId,
): Set<number> {
  const cell = board[index]
  if (!cell?.special) return new Set()

  const cleared = new Set<number>()
  if (cell.special === 'stripe-h') {
    const row = rowOf(index)
    for (let c = 0; c < COLS; c++) cleared.add(idx(c, row))
  } else if (cell.special === 'stripe-v') {
    const col = colOf(index)
    for (let r = 0; r < ROWS; r++) cleared.add(idx(col, r))
  } else if (cell.special === 'prism') {
    const color = partnerGem ?? cell.gem
    for (let i = 0; i < GRID_SIZE; i++) {
      if (board[i]!.gem === color) cleared.add(i)
    }
  }
  return cleared
}

export function collectSwapActivations(board: NeonBoard, a: number, b: number): Set<number> {
  const cleared = new Set<number>()
  activateSpecialAt(board, a, board[b]!.gem).forEach((i) => cleared.add(i))
  activateSpecialAt(board, b, board[a]!.gem).forEach((i) => cleared.add(i))
  return cleared
}

function describeActivation(board: NeonBoard, a: number, b: number): SpecialActivateFx | null {
  const kinds = new Set<SpecialKind>()
  if (board[a]?.special) kinds.add(board[a]!.special!)
  if (board[b]?.special) kinds.add(board[b]!.special!)
  if (kinds.size === 0) return null
  if (kinds.has('prism')) return { kind: 'prism', label: 'RENK PATLAMA!' }
  if (kinds.has('stripe-h') && kinds.has('stripe-v')) {
    return { kind: 'stripe-h', label: 'ÇİFT ŞERİT!' }
  }
  const kind = kinds.values().next().value as SpecialKind
  return { kind, label: specialLabel(kind) + '!' }
}

export function computeSpawnIndices(before: NeonBoard, after: NeonBoard) {
  const spawn: number[] = []
  for (let i = 0; i < GRID_SIZE; i++) {
    const b = before[i]!
    const a = after[i]!
    if (b.gem !== a.gem || b.special !== a.special) spawn.push(i)
  }
  return spawn
}

function fillGravityCells(cells: (NeonCell | null)[], rand: () => number): NeonBoard {
  const out: NeonCell[] = new Array(GRID_SIZE)
  for (let col = 0; col < COLS; col++) {
    const stack: NeonCell[] = []
    for (let row = ROWS - 1; row >= 0; row--) {
      const cell = cells[idx(col, row)]
      if (cell) stack.push(cell)
    }
    let writeRow = ROWS - 1
    for (const cell of stack) {
      out[idx(col, writeRow)] = cell
      writeRow--
    }
    while (writeRow >= 0) {
      out[idx(col, writeRow)] = createCell(pickRandomGem(rand))
      writeRow--
    }
  }
  return out
}

function applyClears(board: NeonBoard, toClear: Set<number>, rand: () => number): NeonBoard {
  const cells = board.map((cell, i) => (toClear.has(i) ? null : cell))
  return fillGravityCells(cells, rand)
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
  segmentBonus: number
  specialSpawn: SpecialSpawnFx | null
} {
  let current = [...board]
  let totalCleared = 0
  let maxCombo = 0
  let chain = 0
  let segmentBonus = 0
  let specialSpawn: SpecialSpawnFx | null = null
  const popIndices: number[] = []
  const segments: MatchSegment[] = []

  while (true) {
    const matched = findMatches(current)
    if (matched.size === 0) break
    chain++
    maxCombo = Math.max(maxCombo, chain)
    totalCleared += matched.size
    matched.forEach((i) => popIndices.push(i))

    const chainSegs = findMatchSegments(current)
    segmentBonus += segmentLineBonus(chainSegs)
    chainSegs.forEach((seg) => segments.push(seg))

    const spawnMap = chain === 1 ? planSpecialSpawns(chainSegs) : new Map<number, SpecialKind>()
    if (chain === 1 && spawnMap.size > 0 && !specialSpawn) {
      const [index, kind] = [...spawnMap.entries()][0]!
      specialSpawn = { index, kind }
    }

    const next: (NeonCell | null)[] = current.map((cell, i) => {
      if (!matched.has(i)) return cell
      const kind = spawnMap.get(i)
      if (kind) return createCell(cell.gem, kind)
      return null
    })
    current = fillGravityCells(next, rand)
  }

  return { board: current, cleared: totalCleared, maxCombo, popIndices, segments, segmentBonus, specialSpawn }
}

export function comboMultiplier(combo: number) {
  return Math.min(3.5, 1 + combo * 0.25)
}

export function scoreForClear(cleared: number, maxCombo: number, segmentBonus = 0) {
  if (cleared === 0) return 0
  return Math.round(cleared * 55 * comboMultiplier(maxCombo)) + segmentBonus
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
  const next = board.map((c) => ({ ...c, special: c.special }))
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
      burst: MatchBurst | null
      specialSpawn: SpecialSpawnFx | null
      specialActivate: SpecialActivateFx | null
    }
  | { ok: false; board: NeonBoard } {
  if (!areAdjacent(a, b)) return { ok: false, board }

  const swapped = swapCells(board, a, b)
  const activationClears = collectSwapActivations(swapped, a, b)
  const matchClears = findMatches(swapped)
  if (activationClears.size === 0 && matchClears.size === 0) {
    return { ok: false, board }
  }

  const specialActivate = describeActivation(swapped, a, b)
  let work = swapped
  if (activationClears.size > 0) {
    work = applyClears(swapped, activationClears, rand)
  }

  const resolved = resolveBoard(work, rand)
  const activationCount = activationClears.size
  const totalCleared = resolved.cleared + activationCount
  const previewSegments = findMatchSegments(swapped)
  const segments = previewSegments.length > 0 ? previewSegments : resolved.segments
  const burst = analyzeMatchBurst(previewSegments.length > 0 ? previewSegments : segments)
  const popIndices =
    activationCount > 0
      ? [...activationClears, ...resolved.popIndices]
      : resolved.popIndices

  return {
    ok: true,
    previewBoard: swapped,
    board: resolved.board,
    scoreGain: scoreForClear(totalCleared, resolved.maxCombo, resolved.segmentBonus),
    combo: resolved.maxCombo,
    popIndices,
    segments,
    swap: [a, b],
    burst,
    specialSpawn: resolved.specialSpawn,
    specialActivate,
  }
}

export function createBoard(seed: number): NeonBoard {
  const rand = mulberry32(seed)
  let board: NeonBoard
  let guard = 0
  do {
    board = Array.from({ length: GRID_SIZE }, () => createCell(pickRandomGem(rand)))
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
    pressure: null,
  }
}

export function pressureCellCount(intensity: PressureIntensity) {
  if (intensity === 'heavy') return 5
  if (intensity === 'medium') return 3
  return 2
}

export function pressureLabel(intensity: PressureIntensity) {
  if (intensity === 'heavy') return 'AĞIR BASKI!'
  if (intensity === 'medium') return 'BASKI GELDİ!'
  return 'BASKI'
}

export function pressureFromPlayerHit(
  scoreGain: number,
  combo: number,
  burst: MatchBurst | null,
  specialActivate: SpecialActivateFx | null,
): PressureIntensity | null {
  if (burst?.tier === 5 || specialActivate?.kind === 'prism') return 'heavy'
  if (burst?.tier === 4 || specialActivate) return 'medium'
  if (combo >= 3 || scoreGain >= 300) return 'medium'
  if (combo >= 2 || scoreGain >= 150) return 'light'
  return null
}

export function injectOpponentPressure(
  board: NeonBoard,
  intensity: PressureIntensity,
  rand: () => number,
): { board: NeonBoard; indices: number[] } {
  const count = pressureCellCount(intensity)
  const pool: number[] = []
  for (let i = 0; i < GRID_SIZE; i++) {
    if (rowOf(i) <= 2) pool.push(i)
  }
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j]!, pool[i]!]
  }
  const indices = pool.slice(0, Math.min(count, pool.length))
  const next = board.map((c) => ({ gem: c.gem, special: c.special }))
  for (const index of indices) {
    next[index] = createCell(pickRandomGem(rand))
  }
  return { board: next, indices }
}

export function scoreRacePercents(p1: number, p2: number): { p1: number; p2: number } {
  const total = p1 + p2
  if (total <= 0) return { p1: 50, p2: 50 }
  return {
    p1: Math.round((p1 / total) * 100),
    p2: Math.round((p2 / total) * 100),
  }
}

export function duelLeader(p1: number, p2: number): 'p1' | 'p2' | 'draw' {
  if (p1 > p2) return 'p1'
  if (p2 > p1) return 'p2'
  return 'draw'
}

export function resolveRoundWinner(l1: NeonLaneState, l2: NeonLaneState): 'p1' | 'p2' | 'draw' {
  if (l1.roundScore > l2.roundScore) return 'p1'
  if (l2.roundScore > l1.roundScore) return 'p2'
  return 'draw'
}

export function comboFill(combo: number) {
  return Math.min(1, combo / 8)
}
