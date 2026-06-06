export type BlockColor = 'purple' | 'pink' | 'orange' | 'yellow' | 'green' | 'cyan' | 'blue'

/** 9×16 küp kuyusu — 7 klasik tetromino */
export const BLOCK_COLS = 9
export const BLOCK_ROWS = 16
const BUFFER_ROWS = 2
const TOTAL_ROWS = BLOCK_ROWS + BUFFER_ROWS

export type PieceKind =
  | 'aquaLine'
  | 'luna'
  | 'solar'
  | 'oro'
  | 'verda'
  | 'zeta'
  | 'novaT'

/** Oynanabilirlik — yalnızca aynı renk küme temizliği (satır / sütun yok) */
export const FUSION_MIN = 5
export const NOVA_FUSION_CELLS = 10

export type BlockCell = BlockColor | null

export type ActivePiece = {
  kind: PieceKind
  rotation: number
  col: number
  row: number
  color: BlockColor
}

export type BlockParticle = {
  col: number
  row: number
  color: BlockColor
  vx: number
  vy: number
  life: number
  size: number
}

export type BlockLaneState = {
  grid: BlockCell[][]
  active: ActivePiece | null
  nextKind: PieceKind
  nextQueue: PieceKind[]
  bag: PieceKind[]
  /** Füzyonla silinen hücre toplamı */
  fusions: number
  fusionCharge: number
  alive: boolean
  dropAccum: number
  lockAccum: number
  locking: boolean
  lockResets: number
  lineFlash: number
  fusionFlash: number
  combo: number
  spawnPulse: number
  clearParticles: BlockParticle[]
  lastClearCount: number
}

export type BlockLaneView = {
  grid: BlockCell[][]
  activePiece?: {
    cells: { col: number; row: number; color: BlockColor }[]
    trail?: boolean
    scale?: number
  }
  /** Gölge parça yok — sadece iniş hattı (Tetris “shadow” farkı) */
  landBeam?: { row: number; colMin: number; colMax: number }
  nextQueue?: PieceKind[]
  lineFlash?: number
  fusionFlash?: number
  fusionCharge?: number
  clearParticles?: BlockParticle[]
}

export type BlockInput = {
  left?: boolean
  right?: boolean
  down?: boolean
  rotate?: boolean
}

export type BlockLaneEvent =
  | 'move'
  | 'rotate'
  | 'drop'
  | 'lock'
  | 'fusion'
  | 'gameover'
  | 'combo'
  | 'nova'

export const ROUND_SECONDS = 90
export const WIN_ROUNDS = 2
export const MATCH_ROUNDS = 3

export const DROP_INTERVAL = 0.56
export const SOFT_DROP_INTERVAL = 0.011
export const LOCK_DELAY = 0.42
const MAX_LOCK_RESETS = 12
const FUSION_SPEED_BONUS = 0.0012
const MAX_SPEED_BONUS = 0.38

export const PIECE_COLOR: Record<PieceKind, BlockColor> = {
  aquaLine: 'cyan',
  luna: 'purple',
  solar: 'orange',
  oro: 'yellow',
  verda: 'green',
  zeta: 'pink',
  novaT: 'blue',
}

export const PIECE_LABEL: Record<PieceKind, string> = {
  aquaLine: 'AQUA LINE',
  luna: 'LUNA',
  solar: 'SOLAR',
  oro: 'ORO',
  verda: 'VERDA',
  zeta: 'ZETA',
  novaT: 'NOVA T',
}

type CellOffset = [number, number]

const BASE_SHAPES: Record<PieceKind, CellOffset[]> = {
  aquaLine: [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
  ],
  luna: [
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
  ],
  solar: [
    [0, 1],
    [1, 1],
    [2, 1],
    [2, 0],
  ],
  oro: [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ],
  verda: [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 2],
  ],
  zeta: [
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
  ],
  novaT: [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 1],
  ],
}

function normalizeOffsets(cells: CellOffset[]): CellOffset[] {
  const minR = Math.min(...cells.map(([r]) => r))
  const minC = Math.min(...cells.map(([, c]) => c))
  return cells
    .map(([r, c]) => [r - minR, c - minC] as CellOffset)
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
}

function rotateOffsets90(cells: CellOffset[]): CellOffset[] {
  return normalizeOffsets(cells.map(([r, c]) => [c, -r] as CellOffset))
}

function buildRotations(base: CellOffset[]): CellOffset[][] {
  const seen = new Set<string>()
  const rotations: CellOffset[][] = []
  let current = normalizeOffsets(base)
  for (let i = 0; i < 4; i += 1) {
    const key = current.map(([r, c]) => `${r},${c}`).join('|')
    if (!seen.has(key)) {
      seen.add(key)
      rotations.push(current)
    }
    current = rotateOffsets90(current)
  }
  return rotations
}

const PIECE_ROTATIONS: Record<PieceKind, CellOffset[][]> = Object.fromEntries(
  (Object.keys(BASE_SHAPES) as PieceKind[]).map((kind) => [kind, buildRotations(BASE_SHAPES[kind])]),
) as Record<PieceKind, CellOffset[][]>

const KINDS: PieceKind[] = ['aquaLine', 'luna', 'solar', 'oro', 'verda', 'zeta', 'novaT']

const ROTATION_NUDGES_BASE: [number, number][] = [
  [0, 0],
  [0, -1],
  [0, -2],
  [0, -3],
  [1, 0],
  [-1, 0],
  [1, -1],
  [-1, -1],
  [1, -2],
  [-1, -2],
  [2, 0],
  [-2, 0],
]

function rotationKicksFor(kind: PieceKind): [number, number][] {
  if (cellCount(kind) <= 4 && kind !== 'oro') {
    return ROTATION_NUDGES_BASE
  }
  return ROTATION_NUDGES_BASE.slice(0, 8)
}

export function rotationCount(kind: PieceKind): number {
  return PIECE_ROTATIONS[kind].length
}

export function cellCount(kind: PieceKind): number {
  return BASE_SHAPES[kind].length
}

function pieceExtent(kind: PieceKind, rotation: number) {
  const offsets = PIECE_ROTATIONS[kind][rotation % rotationCount(kind)]!
  const rows = offsets.map(([r]) => r)
  const cols = offsets.map(([, c]) => c)
  return {
    minR: Math.min(...rows),
    maxR: Math.max(...rows),
    minC: Math.min(...cols),
    maxC: Math.max(...cols),
  }
}

/** Parça genişliğine göre yatay ortala */
export function spawnColFor(kind: PieceKind, rotation: number): number {
  const { minC, maxC } = pieceExtent(kind, rotation)
  const width = maxC - minC + 1
  const target = Math.floor((BLOCK_COLS - width) / 2) - minC
  return Math.max(0, Math.min(BLOCK_COLS - 1 - maxC, target))
}

function baseLaneFields(): Pick<BlockLaneState, 'spawnPulse' | 'clearParticles' | 'lastClearCount'> {
  return {
    spawnPulse: 0,
    clearParticles: [],
    lastClearCount: 0,
  }
}

export function tickLanePresentation(lane: BlockLaneState, dt: number): BlockLaneState {
  return decayFx(lane, dt)
}

export function createBlockLane(seed = 1, roundIndex = 1): BlockLaneState {
  const rng = mulberry32(seed * 7919 + roundIndex * 4177)
  let bag = refillMasterBag(rng)
  const first = drawFromBag(bag, rng)
  bag = first.bag

  const lane: BlockLaneState = {
    grid: emptyGrid(),
    active: null,
    nextKind: first.kind,
    nextQueue: [],
    bag,
    fusions: 0,
    fusionCharge: 0,
    alive: true,
    dropAccum: 0,
    lockAccum: 0,
    locking: false,
    lockResets: 0,
    lineFlash: 0,
    fusionFlash: 0,
    combo: 0,
    ...baseLaneFields(),
  }

  buildStartingStack(lane.grid, seed, roundIndex)
  stabilizeGrid(lane.grid)
  const spawned = spawnPiece(lane, rng)
  return { ...spawned, nextQueue: buildNextQueue(spawned, rng), spawnPulse: 1 }
}

export function updateBlockLane(
  lane: BlockLaneState,
  dt: number,
  input: BlockInput,
): { lane: BlockLaneState; events: BlockLaneEvent[] } {
  if (!lane.alive) return { lane: decayFx(lane, dt), events: [] }

  let next = decayFx(lane, dt)
  const events: BlockLaneEvent[] = []

  if (!next.active) return { lane: next, events }

  next = { ...next, grid: next.grid.map((row) => [...row]), active: { ...next.active! } }

  if (input.rotate) {
    const rotated = tryRotate(next)
    if (rotated) {
      next = rotated
      events.push('rotate')
      next = resetLock(next)
      next.dropAccum = 0
    }
  }
  if (input.left) {
    const moved = tryMove(next, -1, 0)
    if (moved) {
      next = moved
      events.push('move')
      next = resetLock(next)
    }
  }
  if (input.right) {
    const moved = tryMove(next, 1, 0)
    if (moved) {
      next = moved
      events.push('move')
      next = resetLock(next)
    }
  }

  const speedBonus = Math.min(next.fusions * FUSION_SPEED_BONUS, MAX_SPEED_BONUS)
  const dropStep = input.down ? SOFT_DROP_INTERVAL : DROP_INTERVAL - speedBonus
  next.dropAccum += dt

  while (next.dropAccum >= dropStep) {
    next.dropAccum -= dropStep
    const moved = tryMove(next, 0, 1)
    if (moved) {
      next = moved
      if (input.down) events.push('drop')
    } else if (next.active) {
      if (!next.locking) {
        next = { ...next, locking: true, lockAccum: 0 }
      }
      break
    }
  }

  if (next.locking) {
    next.lockAccum += dt
    if (next.lockAccum >= LOCK_DELAY) {
      const locked = lockActive(next)
      next = locked.lane
      events.push('lock')
      applyClearEvents(locked, events)
      next = locked.lane
      if (!next.alive) events.push('gameover')
      else if (next.active) {
        next.dropAccum = 0
        next.spawnPulse = 1
      }
    }
  }

  return { lane: next, events }
}

export function hardDropLane(lane: BlockLaneState): { lane: BlockLaneState; events: BlockLaneEvent[] } {
  if (!lane.alive || !lane.active) return { lane, events: [] }
  const events: BlockLaneEvent[] = ['drop']
  let next: BlockLaneState = {
    ...lane,
    grid: lane.grid.map((row) => [...row]),
    active: { ...lane.active },
    locking: false,
    lockAccum: 0,
    lockResets: 0,
  }

  let moved = tryMove(next, 0, 1)
  while (moved) {
    next = moved
    events.push('drop')
    moved = tryMove(next, 0, 1)
  }

  if (!next.active) return { lane: next, events }

  const dropped = dropPieceToFloor(next.grid, next.active)
  next = { ...next, active: dropped }

  if (isStackOverflow(dropped) || !canPlace(next.grid, pieceCells(dropped))) {
    return { lane: { ...next, active: null, alive: false }, events: [...events, 'gameover'] }
  }

  const locked = lockActive(next)
  next = locked.lane
  events.push('lock')
  applyClearEvents(locked, events)
  next = locked.lane
  if (!next.alive) events.push('gameover')
  else if (next.active) next.spawnPulse = 1

  return { lane: next, events }
}

export type PlacementScore = {
  cleared: number
  fusionCells: number
  aggregateHeight: number
  holes: number
  bumpiness: number
}

export function previewPiecePlacement(
  grid: BlockCell[][],
  kind: PieceKind,
  rotation: number,
  col: number,
): PlacementScore | null {
  let piece: ActivePiece = {
    kind,
    rotation,
    col,
    row: 0,
    color: PIECE_COLOR[kind],
  }
  if (!canPlace(grid, pieceCells(piece))) return null

  piece = dropPieceToFloor(grid, piece)
  if (isStackOverflow(piece)) return null

  const merged = grid.map((row) => [...row])
  for (const { row, col: c } of pieceCells(piece)) {
    if (row >= BUFFER_ROWS) merged[row]![c] = piece.color
  }

  const scratch = merged.map((row) => [...row])
  const result = resolveCrystalClears(scratch)
  return {
    cleared: result.fusionCells,
    fusionCells: result.fusionCells,
    ...boardMetrics(scratch),
  }
}

function laneClearScore(lane: BlockLaneState): number {
  const chainBonus = lane.combo >= 2 ? (lane.combo - 1) * 3 : 0
  return lane.fusions + chainBonus
}

export function resolveRoundWinner(l1: BlockLaneState, l2: BlockLaneState): 'p1' | 'p2' | 'draw' {
  const score1 = laneClearScore(l1)
  const score2 = laneClearScore(l2)
  if (score1 > score2) return 'p1'
  if (score2 > score1) return 'p2'
  return 'draw'
}

export function getLaneView(lane: BlockLaneState): BlockLaneView {
  const visible = sliceVisibleGrid(lane.grid)

  if (lane.active) {
    for (const { row, col } of pieceCells(lane.active)) {
      const viewRow = row - BUFFER_ROWS
      if (viewRow >= 0 && viewRow < BLOCK_ROWS) visible[viewRow]![col] = null
    }
  }

  const spawnScale = 1 + lane.spawnPulse * 0.12
  const view: BlockLaneView = {
    grid: visible,
    nextQueue: lane.nextQueue,
    lineFlash: lane.lineFlash,
    fusionFlash: lane.fusionFlash,
    fusionCharge: lane.fusionCharge,
    clearParticles: lane.clearParticles.map((p) => ({ ...p })),
  }

  if (!lane.active) return view

  const activeCells = pieceCells(lane.active)
    .map((c) => ({
      col: c.col,
      row: c.row - BUFFER_ROWS,
      color: lane.active!.color,
    }))
    .filter((c) => c.row >= 0 && c.row < BLOCK_ROWS)

  if (activeCells.length > 0) {
    view.activePiece = { cells: activeCells, trail: true, scale: spawnScale > 1.02 ? spawnScale : 1 }
    if (isPieceGrounded(lane)) {
      const beam = computeLandBeam(lane)
      if (beam) view.landBeam = beam
    }
  }

  return view
}

export function getPiecePreviewOffsets(kind: PieceKind): { col: number; row: number }[] {
  const piece: ActivePiece = {
    kind,
    rotation: 0,
    col: 0,
    row: 0,
    color: PIECE_COLOR[kind],
  }
  const cells = pieceCells(piece)
  const minC = Math.min(...cells.map((c) => c.col))
  const minR = Math.min(...cells.map((c) => c.row))
  return cells.map((c) => ({ col: c.col - minC, row: c.row - minR }))
}

function decayFx(lane: BlockLaneState, dt: number): BlockLaneState {
  const particles = lane.clearParticles
    .map((p) => ({
      ...p,
      col: p.col + p.vx * dt * 6,
      row: p.row + p.vy * dt * 6,
      vy: p.vy + dt * 14,
      life: p.life - dt,
    }))
    .filter((p) => p.life > 0)

  return {
    ...lane,
    lineFlash: Math.max(0, lane.lineFlash - dt * 2.8),
    fusionFlash: Math.max(0, lane.fusionFlash - dt * 3.2),
    fusionCharge: Math.max(0, lane.fusionCharge - dt * 0.08),
    spawnPulse: Math.max(0, lane.spawnPulse - dt * 3.5),
    clearParticles: particles,
  }
}

function boardMetrics(grid: BlockCell[][]): { aggregateHeight: number; holes: number; bumpiness: number } {
  const heights: number[] = []
  let holes = 0

  for (let col = 0; col < BLOCK_COLS; col += 1) {
    let height = 0
    let found = false
    for (let row = BUFFER_ROWS; row < TOTAL_ROWS; row += 1) {
      const filled = grid[row]![col] != null
      if (!found && filled) {
        found = true
        height = TOTAL_ROWS - row
      }
      if (found && !filled) holes += 1
    }
    heights.push(height)
  }

  let bumpiness = 0
  for (let i = 0; i < heights.length - 1; i += 1) {
    bumpiness += Math.abs(heights[i]! - heights[i + 1]!)
  }

  return {
    aggregateHeight: heights.reduce((a, b) => a + b, 0),
    holes,
    bumpiness,
  }
}

/** Sütun bazlı yerçekimi */
function collapseGridColumns(grid: BlockCell[][]) {
  for (let col = 0; col < BLOCK_COLS; col += 1) {
    const colors: BlockColor[] = []
    for (let row = BUFFER_ROWS; row < TOTAL_ROWS; row += 1) {
      const cell = grid[row]![col]
      if (cell) colors.push(cell)
    }
    for (let row = BUFFER_ROWS; row < TOTAL_ROWS; row += 1) {
      grid[row]![col] = null
    }
    for (let i = 0; i < colors.length; i += 1) {
      grid[TOTAL_ROWS - 1 - i]![col] = colors[colors.length - 1 - i]!
    }
  }
}

/** Zemine bağlı olmayan adaları temizle */
function pruneFloatingCells(grid: BlockCell[][]) {
  const anchored = new Set<string>()
  const queue: { r: number; c: number }[] = []

  for (let c = 0; c < BLOCK_COLS; c += 1) {
    const r = TOTAL_ROWS - 1
    if (grid[r]![c]) {
      queue.push({ r, c })
      anchored.add(`${r},${c}`)
    }
  }

  while (queue.length > 0) {
    const cell = queue.shift()!
    const neighbors = [
      { r: cell.r + 1, c: cell.c },
      { r: cell.r - 1, c: cell.c },
      { r: cell.r, c: cell.c + 1 },
      { r: cell.r, c: cell.c - 1 },
    ]
    for (const n of neighbors) {
      if (n.r < BUFFER_ROWS || n.r >= TOTAL_ROWS || n.c < 0 || n.c >= BLOCK_COLS) continue
      const key = `${n.r},${n.c}`
      if (grid[n.r]![n.c] && !anchored.has(key)) {
        anchored.add(key)
        queue.push(n)
      }
    }
  }

  for (let r = BUFFER_ROWS; r < TOTAL_ROWS; r += 1) {
    for (let c = 0; c < BLOCK_COLS; c += 1) {
      if (grid[r]![c] && !anchored.has(`${r},${c}`)) grid[r]![c] = null
    }
  }
}

function stabilizeGrid(grid: BlockCell[][]) {
  collapseGridColumns(grid)
  pruneFloatingCells(grid)
}

function buildStartingStack(grid: BlockCell[][], seed: number, round: number) {
  const mix = mulberry32(seed * 4177 + round * 911)
  const rowCount = 2 + Math.floor(mix() * 2)
  const startRow = BUFFER_ROWS + BLOCK_ROWS - rowCount
  let holeCol = Math.floor(mix() * BLOCK_COLS)
  const wander = mix() < 0.5 ? -1 : 1

  for (let i = 0; i < rowCount; i += 1) {
    const row = startRow + i
    if (row < BUFFER_ROWS || row >= TOTAL_ROWS) continue

    if (mix() < 0.55) holeCol = Math.max(0, Math.min(BLOCK_COLS - 1, holeCol + wander))
    else if (mix() < 0.3) holeCol = Math.floor(mix() * BLOCK_COLS)

    const patchColor = PIECE_COLOR[KINDS[Math.floor(mix() * KINDS.length)]!]!
    const fillChance = 0.72 + mix() * 0.2

    for (let c = 0; c < BLOCK_COLS; c += 1) {
      if (c === holeCol) continue
      if (mix() > fillChance) continue
      if (c > 0 && mix() < 0.38 && grid[row]![c - 1]) {
        grid[row]![c] = grid[row]![c - 1]
        continue
      }
      grid[row]![c] = patchColor
    }
  }
}

function computeLandBeam(lane: BlockLaneState): { row: number; colMin: number; colMax: number } | null {
  if (!lane.active) return null
  let landed: ActivePiece = { ...lane.active }
  while (canPlace(lane.grid, pieceCells({ ...landed, row: landed.row + 1 }))) {
    landed = { ...landed, row: landed.row + 1 }
  }
  if (landed.row === lane.active.row) return null
  const cells = pieceCells(landed)
  const rows = cells.map((c) => c.row - BUFFER_ROWS).filter((r) => r >= 0 && r < BLOCK_ROWS)
  const cols = cells.map((c) => c.col)
  if (rows.length === 0) return null
  return {
    row: Math.max(...rows),
    colMin: Math.min(...cols),
    colMax: Math.max(...cols),
  }
}

function resetLock(lane: BlockLaneState): BlockLaneState {
  if (lane.lockResets >= MAX_LOCK_RESETS) {
    return { ...lane, locking: true, lockAccum: LOCK_DELAY * 0.85 }
  }
  return { ...lane, locking: false, lockAccum: 0, lockResets: lane.lockResets + 1 }
}

function emptyGrid(): BlockCell[][] {
  return Array.from({ length: TOTAL_ROWS }, () => Array.from({ length: BLOCK_COLS }, () => null))
}

function sliceVisibleGrid(grid: BlockCell[][]): BlockCell[][] {
  return grid.slice(BUFFER_ROWS).map((row) => [...row])
}

function shuffleKinds(rng: () => number, kinds: PieceKind[]): PieceKind[] {
  const bag = [...kinds]
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    ;[bag[i], bag[j]] = [bag[j]!, bag[i]!]
  }
  return bag
}

/** Klasik 7-parça çantası */
function refillMasterBag(rng: () => number): PieceKind[] {
  return shuffleKinds(rng, KINDS)
}

function drawFromBag(bag: PieceKind[], rng: () => number): { kind: PieceKind; bag: PieceKind[] } {
  let queue = bag
  if (queue.length === 0) queue = refillMasterBag(rng)
  const [kind, ...rest] = queue
  return { kind: kind!, bag: rest }
}

function buildNextQueue(lane: BlockLaneState, rng: () => number): PieceKind[] {
  const queue: PieceKind[] = [lane.nextKind]
  let bag = [...lane.bag]
  while (queue.length < 3) {
    if (bag.length === 0) bag = refillMasterBag(rng)
    const draw = drawFromBag(bag, rng)
    queue.push(draw.kind)
    bag = draw.bag
  }
  return queue.slice(0, 3)
}

function spawnPiece(lane: BlockLaneState, rng: () => number): BlockLaneState {
  const kind = lane.nextKind
  const draw = drawFromBag(lane.bag, rng)
  const nextBase = {
    ...lane,
    nextKind: draw.kind,
    bag: draw.bag,
    locking: false,
    lockAccum: 0,
    lockResets: 0,
    dropAccum: 0,
  }

  for (let rot = 0; rot < rotationCount(kind); rot += 1) {
    const col = spawnColFor(kind, rot)
    const active: ActivePiece = {
      kind,
      rotation: rot,
      col,
      row: 0,
      color: PIECE_COLOR[kind],
    }
    const next = { ...nextBase, active }
    if (canPlace(next.grid, pieceCells(active))) {
      return { ...next, nextQueue: buildNextQueue(next, rng) }
    }
  }

  return { ...nextBase, active: null, alive: false, nextQueue: buildNextQueue(nextBase, rng) }
}

function pieceCells(piece: ActivePiece) {
  const rot = piece.rotation % rotationCount(piece.kind)
  const offsets = PIECE_ROTATIONS[piece.kind][rot]!
  return offsets.map(([r, c]) => ({ row: piece.row + r, col: piece.col + c }))
}

function canPlace(grid: BlockCell[][], cells: { row: number; col: number }[]) {
  const seen = new Set<string>()
  for (const { row, col } of cells) {
    if (col < 0 || col >= BLOCK_COLS || row < 0 || row >= TOTAL_ROWS) return false
    const key = `${row},${col}`
    if (seen.has(key)) return false
    seen.add(key)
    if (grid[row]![col]) return false
  }
  return true
}

function tryMove(lane: BlockLaneState, dx: number, dy: number): BlockLaneState | null {
  if (!lane.active) return null
  const moved: ActivePiece = { ...lane.active, col: lane.active.col + dx, row: lane.active.row + dy }
  if (!canPlace(lane.grid, pieceCells(moved))) return null
  return { ...lane, active: moved }
}

function tryRotate(lane: BlockLaneState): BlockLaneState | null {
  if (!lane.active) return null
  const limit = rotationCount(lane.active.kind)
  const fromRot = lane.active.rotation % limit
  const toRot = (fromRot + 1) % limit

  const oldBottom = Math.max(...pieceCells(lane.active).map((c) => c.row))
  const kicks = rotationKicksFor(lane.active.kind)

  let best: BlockLaneState | null = null
  let bestScore = Infinity

  for (const [dx, dy] of kicks) {
    const rotated: ActivePiece = {
      ...lane.active,
      rotation: toRot,
      col: lane.active.col + dx,
      row: lane.active.row + dy,
    }
    if (!canPlace(lane.grid, pieceCells(rotated))) continue

    const newBottom = Math.max(...pieceCells(rotated).map((c) => c.row))
    const drop = newBottom - oldBottom
    const score = drop > 0 ? 100 + drop : drop

    if (score < bestScore) {
      bestScore = score
      best = { ...lane, active: rotated }
    }
  }

  return best
}

type LockResult = {
  lane: BlockLaneState
  cleared: number
  fusionCells: number
}

function applyClearEvents(result: LockResult, events: BlockLaneEvent[]) {
  const { lane } = result
  if (result.cleared <= 0) return
  if (result.fusionCells > 0) events.push('fusion')
  if (result.fusionCells >= NOVA_FUSION_CELLS) events.push('nova')
  else if (lane.combo >= 2) events.push('combo')
}

function lockActive(lane: BlockLaneState): LockResult {
  if (!lane.active) {
    return { lane, cleared: 0, fusionCells: 0 }
  }

  const active = dropPieceToFloor(lane.grid, lane.active)
  if (isStackOverflow(active)) {
    return {
      lane: { ...lane, active: null, alive: false, locking: false, lockAccum: 0 },
      cleared: 0,
      fusionCells: 0,
    }
  }

  const rng = mulberry32(lane.fusions * 31 + lane.combo * 13)

  const grid = lane.grid.map((row) => [...row])
  if (!canPlace(grid, pieceCells(active))) {
    return {
      lane: { ...lane, active: null, alive: false, locking: false, lockAccum: 0 },
      cleared: 0,
      fusionCells: 0,
    }
  }

  for (const { row, col } of pieceCells(active)) {
    if (row < BUFFER_ROWS || row >= TOTAL_ROWS || col < 0 || col >= BLOCK_COLS) continue
    grid[row]![col] = active.color
  }

  const clearResult = resolveCrystalClears(grid)
  const particles = spawnParticles(clearResult.burstCells, rng)
  const totalClear = clearResult.fusionCells
  const newCombo = totalClear > 0 ? lane.combo + 1 : 0
  const fusionCharge = Math.min(1, lane.fusionCharge + clearResult.fusionCells * 0.08)

  const afterSpawn = spawnPiece(
    {
      ...lane,
      grid,
      active: null,
      locking: false,
      lockAccum: 0,
      fusions: lane.fusions + clearResult.fusionCells,
      fusionCharge,
      fusionFlash: clearResult.fusionCells > 0 ? 1 : lane.fusionFlash,
      combo: newCombo,
      lastClearCount: totalClear,
      clearParticles: [...lane.clearParticles, ...particles],
    },
    rng,
  )

  return {
    lane: afterSpawn,
    cleared: totalClear,
    fusionCells: clearResult.fusionCells,
  }
}

function spawnParticles(
  cells: { row: number; col: number; color: BlockColor }[],
  rng: () => number,
): BlockParticle[] {
  return cells.map(({ row, col, color }) => ({
    col,
    row: row - BUFFER_ROWS,
    color,
    vx: (rng() - 0.5) * 2.2,
    vy: -(0.8 + rng() * 1.6),
    life: 0.55 + rng() * 0.35,
    size: 0.85 + rng() * 0.35,
  }))
}

function dropPieceToFloor(grid: BlockCell[][], piece: ActivePiece): ActivePiece {
  let current = piece
  while (canPlace(grid, pieceCells({ ...current, row: current.row + 1 }))) {
    current = { ...current, row: current.row + 1 }
  }
  return current
}

/** Tahta doldu — parça görünür alana inemeden sıkıştı */
function isStackOverflow(active: ActivePiece): boolean {
  return pieceCells(active).some((cell) => cell.row < BUFFER_ROWS)
}

function isPieceGrounded(lane: BlockLaneState): boolean {
  if (!lane.active) return false
  return !canPlace(lane.grid, pieceCells({ ...lane.active, row: lane.active.row + 1 }))
}

type CrystalClearResult = {
  fusionCells: number
  burstCells: { row: number; col: number; color: BlockColor }[]
}

function resolveCrystalClears(grid: BlockCell[][]): CrystalClearResult {
  let fusionCells = 0
  const burstCells: { row: number; col: number; color: BlockColor }[] = []
  let chain = true

  while (chain) {
    chain = false
    const fusion = clearFusionClusters(grid)
    if (fusion.count > 0) {
      fusionCells += fusion.count
      burstCells.push(...fusion.burstCells)
      stabilizeGrid(grid)
      chain = true
    }
  }

  return { fusionCells, burstCells }
}

function clearFusionClusters(grid: BlockCell[][]): {
  count: number
  burstCells: { row: number; col: number; color: BlockColor }[]
} {
  const visited = new Set<string>()
  const toRemove = new Set<string>()
  let count = 0
  const burstCells: { row: number; col: number; color: BlockColor }[] = []

  for (let row = BUFFER_ROWS; row < TOTAL_ROWS; row += 1) {
    for (let col = 0; col < BLOCK_COLS; col += 1) {
      const color = grid[row]![col]
      const key = `${row},${col}`
      if (!color || visited.has(key)) continue

      const stack: { r: number; c: number }[] = [{ r: row, c: col }]
      const group: { r: number; c: number; color: BlockColor }[] = []
      visited.add(key)

      while (stack.length > 0) {
        const cell = stack.pop()!
        group.push({ r: cell.r, c: cell.c, color: grid[cell.r]![cell.c]! })
        const neighbors = [
          { r: cell.r + 1, c: cell.c },
          { r: cell.r - 1, c: cell.c },
          { r: cell.r, c: cell.c + 1 },
          { r: cell.r, c: cell.c - 1 },
        ]
        for (const n of neighbors) {
          if (n.r < BUFFER_ROWS || n.r >= TOTAL_ROWS || n.c < 0 || n.c >= BLOCK_COLS) continue
          const nk = `${n.r},${n.c}`
          if (visited.has(nk) || grid[n.r]![n.c] !== color) continue
          visited.add(nk)
          stack.push(n)
        }
      }

      if (group.length >= FUSION_MIN) {
        count += group.length
        for (const g of group) {
          toRemove.add(`${g.r},${g.c}`)
          burstCells.push({ row: g.r, col: g.c, color: g.color })
        }
      }
    }
  }

  for (const key of toRemove) {
    const [r, c] = key.split(',').map(Number)
    grid[r!]![c!] = null
  }

  return { count, burstCells }
}

function mulberry32(seed: number) {
  let t = seed
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

