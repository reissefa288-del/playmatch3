export type BlockColor = 'purple' | 'red' | 'orange' | 'yellow' | 'green' | 'cyan' | 'blue'

export const BLOCK_COLS = 10
export const BLOCK_ROWS = 20
const BUFFER_ROWS = 2
const TOTAL_ROWS = BLOCK_ROWS + BUFFER_ROWS

export type PieceKind = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

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
  holdKind: PieceKind | null
  canHold: boolean
  lines: number
  attack: number
  incomingGarbage: number
  alive: boolean
  dropAccum: number
  lockAccum: number
  locking: boolean
  lockResets: number
  lineFlash: number
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
  ghostPiece?: {
    cells: { col: number; row: number; color: BlockColor }[]
  }
  nextQueue?: PieceKind[]
  holdKind?: PieceKind | null
  lineFlash?: number
  clearParticles?: BlockParticle[]
}

export type BlockInput = {
  left?: boolean
  right?: boolean
  down?: boolean
  rotate?: boolean
  hold?: boolean
}

export type BlockLaneEvent =
  | 'move'
  | 'rotate'
  | 'drop'
  | 'lock'
  | 'line'
  | 'attack'
  | 'gameover'
  | 'hold'
  | 'combo'
  | 'tetris'

export const ROUND_SECONDS = 90
export const WIN_ROUNDS = 2
export const MATCH_ROUNDS = 3

export const DROP_INTERVAL = 0.52
export const SOFT_DROP_INTERVAL = 0.012
export const LOCK_DELAY = 0.36
const MAX_LOCK_RESETS = 15
const LINE_SPEED_BONUS = 0.018
const MAX_SPEED_BONUS = 0.42

export const PIECE_COLOR: Record<PieceKind, BlockColor> = {
  I: 'cyan',
  O: 'yellow',
  T: 'purple',
  S: 'green',
  Z: 'red',
  J: 'blue',
  L: 'orange',
}

const SHAPES: Record<PieceKind, number[][][]> = {
  I: [
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
    [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
    [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]],
  ],
  O: [
    [[0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
  ],
  T: [
    [[0, 1, 0, 0], [1, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[0, 1, 0, 0], [0, 1, 1, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
    [[0, 0, 0, 0], [1, 1, 1, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
    [[0, 1, 0, 0], [1, 1, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
  ],
  S: [
    [[0, 1, 1, 0], [1, 1, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[0, 1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 0], [0, 0, 0, 0]],
    [[0, 0, 0, 0], [0, 1, 1, 0], [1, 1, 0, 0], [0, 0, 0, 0]],
    [[1, 0, 0, 0], [1, 1, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
  ],
  Z: [
    [[1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[0, 0, 1, 0], [0, 1, 1, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
    [[0, 0, 0, 0], [1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 0, 0]],
    [[0, 1, 0, 0], [1, 1, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0]],
  ],
  J: [
    [[1, 0, 0, 0], [1, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[0, 1, 1, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
    [[0, 0, 0, 0], [1, 1, 1, 0], [0, 0, 1, 0], [0, 0, 0, 0]],
    [[0, 1, 0, 0], [0, 1, 0, 0], [1, 1, 0, 0], [0, 0, 0, 0]],
  ],
  L: [
    [[0, 0, 1, 0], [1, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 1, 0], [0, 0, 0, 0]],
    [[0, 0, 0, 0], [1, 1, 1, 0], [1, 0, 0, 0], [0, 0, 0, 0]],
    [[1, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
  ],
}

const KINDS: PieceKind[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']

const SRS_KICKS: Record<PieceKind, [number, number][][]> = {
  I: [
    [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
    [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
    [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
    [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  ],
  O: [[[0, 0]], [[0, 0]], [[0, 0]], [[0, 0]]],
  T: standardKicks(),
  S: standardKicks(),
  Z: standardKicks(),
  J: standardKicks(),
  L: standardKicks(),
}

function standardKicks(): [number, number][][] {
  const base: [number, number][] = [
    [0, 0], [-1, 0], [1, 0], [0, -1], [-1, -1], [1, -1], [0, 1], [-2, 0], [2, 0],
  ]
  return [base, base, base, base]
}

function baseLaneFields(): Pick<
  BlockLaneState,
  'holdKind' | 'canHold' | 'spawnPulse' | 'clearParticles' | 'lastClearCount'
> {
  return {
    holdKind: null,
    canHold: true,
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
  let bag = shuffleBag(rng)
  const first = drawFromBag(bag, rng)
  bag = first.bag

  const lane: BlockLaneState = {
    grid: emptyGrid(),
    active: null,
    nextKind: first.kind,
    nextQueue: [],
    bag,
    lines: 0,
    attack: 0,
    incomingGarbage: 0,
    alive: true,
    dropAccum: 0,
    lockAccum: 0,
    locking: false,
    lockResets: 0,
    lineFlash: 0,
    combo: 0,
    ...baseLaneFields(),
  }

  buildStartingStack(lane.grid, seed, roundIndex, rng)
  const spawned = spawnPiece(lane, rng)
  return { ...spawned, nextQueue: buildNextQueue(spawned, rng), spawnPulse: 1 }
}

export function updateBlockLane(
  lane: BlockLaneState,
  dt: number,
  input: BlockInput,
): { lane: BlockLaneState; events: BlockLaneEvent[]; attackSent: number } {
  if (!lane.alive) return { lane: decayFx(lane, dt), events: [], attackSent: 0 }

  let next = decayFx(lane, dt)
  const events: BlockLaneEvent[] = []
  let attackSent = 0

  if (input.hold) {
    const held = holdPiece(next, mulberry32(next.lines * 17))
    next = held.lane
    events.push(...held.events)
    if (!next.alive) return { lane: next, events, attackSent: 0 }
    if (held.events.includes('hold')) return { lane: next, events, attackSent: 0 }
  }

  if (!next.active) return { lane: next, events, attackSent: 0 }

  next = { ...next, grid: next.grid.map((row) => [...row]), active: { ...next.active! } }

  if (input.rotate) {
    const rotated = tryRotate(next)
    if (rotated) {
      next = rotated
      events.push('rotate')
      next = resetLock(next)
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

  const speedBonus = Math.min(next.lines * LINE_SPEED_BONUS, MAX_SPEED_BONUS)
  const dropStep = input.down ? SOFT_DROP_INTERVAL : DROP_INTERVAL - speedBonus
  next.dropAccum += dt

  while (next.dropAccum >= dropStep) {
    next.dropAccum -= dropStep
    const moved = tryMove(next, 0, 1)
    if (moved) {
      next = moved
      if (input.down) events.push('drop')
    } else if (next.active && isFullyInPlayfield(next.active)) {
      next.locking = true
      break
    } else {
      break
    }
  }

  if (next.locking && next.active && !isFullyInPlayfield(next.active)) {
    next = { ...next, locking: false, lockAccum: 0 }
  }

  if (next.locking) {
    next.lockAccum += dt
    if (next.lockAccum >= LOCK_DELAY) {
      const locked = lockActive(next)
      next = locked.lane
      events.push('lock')
      if (locked.cleared > 0) {
        events.push('line')
        const newCombo = locked.cleared >= 2 ? next.combo + 1 : 0
        if (locked.cleared >= 4) events.push('tetris')
        else if (newCombo >= 2) events.push('combo')
        next.lines += locked.cleared
        next.attack += locked.attackRows
        attackSent = locked.attackRows
        next.lineFlash = 1
        next.lastClearCount = locked.cleared
        next.combo = newCombo
        if (locked.attackRows > 0) events.push('attack')
      } else {
        next.combo = 0
        next.lastClearCount = 0
      }
      if (!next.alive) events.push('gameover')
      else if (next.active) {
        next.dropAccum = 0
        next.spawnPulse = 1
      }
    }
  }

  return { lane: next, events, attackSent }
}

export function hardDropLane(lane: BlockLaneState): { lane: BlockLaneState; events: BlockLaneEvent[]; attackSent: number } {
  if (!lane.alive || !lane.active) return { lane, events: [], attackSent: 0 }
  const events: BlockLaneEvent[] = ['drop']
  let attackSent = 0
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

  const locked = lockActive(next)
  next = locked.lane
  events.push('lock')
  if (locked.cleared > 0) {
    events.push('line')
    const newCombo = locked.cleared >= 2 ? next.combo + 1 : 0
    if (locked.cleared >= 4) events.push('tetris')
    else if (newCombo >= 2) events.push('combo')
    next.lines += locked.cleared
    next.attack += locked.attackRows
    attackSent = locked.attackRows
    next.lineFlash = 1
    next.lastClearCount = locked.cleared
    next.combo = newCombo
    if (locked.attackRows > 0) events.push('attack')
  } else {
    next.combo = 0
    next.lastClearCount = 0
  }
  if (!next.alive) events.push('gameover')
  else if (next.active) next.spawnPulse = 1

  return { lane: next, events, attackSent }
}

export function holdPiece(lane: BlockLaneState, rng: () => number): { lane: BlockLaneState; events: BlockLaneEvent[] } {
  if (!lane.alive || !lane.active || !lane.canHold) return { lane, events: [] }

  const events: BlockLaneEvent[] = ['hold']
  const currentKind = lane.active.kind

  if (lane.holdKind === null) {
    const spawned = spawnPiece({ ...lane, active: null }, rng)
    return {
      lane: { ...spawned, holdKind: currentKind, canHold: false, spawnPulse: 1 },
      events,
    }
  }

  const swapped = placeActiveAtSpawn(lane.holdKind, { ...lane, active: null })
  if (!swapped.alive) return { lane: swapped, events: [...events, 'gameover'] }
  return {
    lane: { ...swapped, holdKind: currentKind, canHold: false, spawnPulse: 1 },
    events,
  }
}

export type PlacementScore = {
  cleared: number
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

  while (canPlace(grid, pieceCells({ ...piece, row: piece.row + 1 }))) {
    piece = { ...piece, row: piece.row + 1 }
  }

  const merged = grid.map((row) => [...row])
  for (const { row, col: c } of pieceCells(piece)) {
    if (row >= 0) merged[row]![c] = piece.color
  }

  const { count } = clearLines(merged)
  return { cleared: count, ...boardMetrics(merged) }
}

export function calcAttackRows(cleared: number, combo: number): number {
  let rows = 0
  if (cleared <= 1) rows = 0
  else if (cleared === 2) rows = 1
  else if (cleared === 3) rows = 2
  else rows = 4
  if (combo >= 2 && rows > 0) rows += 1
  return rows
}

export function queueGarbage(lane: BlockLaneState, rows: number): BlockLaneState {
  if (rows <= 0) return lane
  return { ...lane, incomingGarbage: lane.incomingGarbage + rows }
}

export function resolveRoundWinner(l1: BlockLaneState, l2: BlockLaneState): 'p1' | 'p2' | 'draw' {
  if (l1.lines > l2.lines) return 'p1'
  if (l2.lines > l1.lines) return 'p2'
  if (l1.attack > l2.attack) return 'p1'
  if (l2.attack > l1.attack) return 'p2'
  return 'draw'
}

export function getLaneView(lane: BlockLaneState): BlockLaneView {
  const visible = sliceVisibleGrid(lane.grid)
  const spawnScale = 1 + lane.spawnPulse * 0.12
  const view: BlockLaneView = {
    grid: visible,
    nextQueue: lane.nextQueue,
    holdKind: lane.holdKind,
    lineFlash: lane.lineFlash,
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
    view.activePiece = { cells: activeCells, trail: true, scale: spawnScale }
    const ghost = computeGhostCells(lane)
    if (ghost.length > 0) view.ghostPiece = { cells: ghost }
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

function buildStartingStack(grid: BlockCell[][], _seed: number, round: number, rng: () => number) {
  const rowCount = Math.min(11, 8 + Math.floor(rng() * 2) + Math.min(round - 1, 2))
  const startRow = BUFFER_ROWS + BLOCK_ROWS - rowCount
  let holeCol = 3 + Math.floor(rng() * 4)

  for (let i = 0; i < rowCount; i += 1) {
    const row = startRow + i
    if (row < BUFFER_ROWS || row >= TOTAL_ROWS) continue

    const drift = rng() < 0.55 ? (rng() < 0.5 ? -1 : 1) : 0
    holeCol = Math.max(0, Math.min(BLOCK_COLS - 1, holeCol + drift))
    const extraHole =
      rng() < 0.28 ? Math.max(0, Math.min(BLOCK_COLS - 1, holeCol + (rng() < 0.5 ? -3 : 3))) : -1

    const kindBias = KINDS[Math.floor(rng() * KINDS.length)]!
    for (let c = 0; c < BLOCK_COLS; c += 1) {
      if (c === holeCol || c === extraHole) continue
      const kind = rng() < 0.62 ? kindBias : KINDS[Math.floor(rng() * KINDS.length)]!
      grid[row]![c] = PIECE_COLOR[kind]
    }
  }
}

function placeActiveAtSpawn(kind: PieceKind, lane: BlockLaneState): BlockLaneState {
  const active: ActivePiece = {
    kind,
    rotation: 0,
    col: Math.floor(BLOCK_COLS / 2) - 2,
    row: 0,
    color: PIECE_COLOR[kind],
  }
  const next = { ...lane, active, locking: false, lockAccum: 0, lockResets: 0, dropAccum: 0 }
  if (!canPlace(next.grid, pieceCells(active))) {
    return { ...next, active: null, alive: false }
  }
  return next
}

function computeGhostCells(lane: BlockLaneState): { col: number; row: number; color: BlockColor }[] {
  if (!lane.active) return []
  let ghost: ActivePiece = { ...lane.active }
  while (canPlace(lane.grid, pieceCells({ ...ghost, row: ghost.row + 1 }))) {
    ghost = { ...ghost, row: ghost.row + 1 }
  }
  if (ghost.row === lane.active.row) return []
  return pieceCells(ghost)
    .map((c) => ({
      col: c.col,
      row: c.row - BUFFER_ROWS,
      color: lane.active!.color,
    }))
    .filter((c) => c.row >= 0 && c.row < BLOCK_ROWS)
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

function shuffleBag(rng: () => number): PieceKind[] {
  const bag = [...KINDS]
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    ;[bag[i], bag[j]] = [bag[j]!, bag[i]!]
  }
  return bag
}

function drawFromBag(bag: PieceKind[], rng: () => number): { kind: PieceKind; bag: PieceKind[] } {
  let queue = bag
  if (queue.length === 0) queue = shuffleBag(rng)
  const [kind, ...rest] = queue
  return { kind: kind!, bag: rest }
}

function buildNextQueue(lane: BlockLaneState, rng: () => number): PieceKind[] {
  const queue: PieceKind[] = [lane.nextKind]
  let bag = [...lane.bag]
  while (queue.length < 3) {
    if (bag.length === 0) bag = shuffleBag(rng)
    const draw = drawFromBag(bag, rng)
    queue.push(draw.kind)
    bag = draw.bag
  }
  return queue.slice(0, 3)
}

function spawnPiece(lane: BlockLaneState, rng: () => number): BlockLaneState {
  const kind = lane.nextKind
  const draw = drawFromBag(lane.bag, rng)
  const active: ActivePiece = {
    kind,
    rotation: 0,
    col: Math.floor(BLOCK_COLS / 2) - 2,
    row: 0,
    color: PIECE_COLOR[kind],
  }
  const next = {
    ...lane,
    active,
    nextKind: draw.kind,
    bag: draw.bag,
    locking: false,
    lockAccum: 0,
    lockResets: 0,
    dropAccum: 0,
    canHold: true,
  }
  if (!canPlace(next.grid, pieceCells(active))) {
    return { ...next, active: null, alive: false, nextQueue: buildNextQueue(next, rng) }
  }
  return { ...next, nextQueue: buildNextQueue(next, rng) }
}

function pieceCells(piece: ActivePiece) {
  const shape = SHAPES[piece.kind][piece.rotation % 4]!
  const cells: { row: number; col: number }[] = []
  for (let r = 0; r < 4; r += 1) {
    for (let c = 0; c < 4; c += 1) {
      if (!shape[r]![c]) continue
      cells.push({ row: piece.row + r, col: piece.col + c })
    }
  }
  return cells
}

function canPlace(grid: BlockCell[][], cells: { row: number; col: number }[]) {
  for (const { row, col } of cells) {
    if (col < 0 || col >= BLOCK_COLS || row >= TOTAL_ROWS) return false
    if (row >= 0 && grid[row]![col]) return false
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
  const fromRot = lane.active.rotation % 4
  const toRot = (fromRot + 1) % 4
  const kicks = SRS_KICKS[lane.active.kind][toRot] ?? [[0, 0]]

  for (const [dx, dy] of kicks) {
    const rotated: ActivePiece = {
      ...lane.active,
      rotation: toRot,
      col: lane.active.col + dx,
      row: lane.active.row + dy,
    }
    if (canPlace(lane.grid, pieceCells(rotated))) {
      return { ...lane, active: rotated }
    }
  }
  return null
}

function lockActive(lane: BlockLaneState): { lane: BlockLaneState; cleared: number; attackRows: number } {
  if (!lane.active) return { lane, cleared: 0, attackRows: 0 }
  if (!isFullyInPlayfield(lane.active)) {
    return { lane: { ...lane, locking: false, lockAccum: 0 }, cleared: 0, attackRows: 0 }
  }

  const rng = mulberry32(lane.lines * 31 + lane.incomingGarbage * 7 + lane.combo * 13)
  const afterGarbage = applyIncomingGarbage(lane, rng)
  if (!afterGarbage.alive) {
    return { lane: afterGarbage, cleared: 0, attackRows: 0 }
  }

  const active = afterGarbage.active
  if (!active || !isFullyInPlayfield(active)) {
    return {
      lane: { ...afterGarbage, locking: false, lockAccum: 0 },
      cleared: 0,
      attackRows: 0,
    }
  }

  const grid = afterGarbage.grid.map((row) => [...row])
  for (const { row, col } of pieceCells(active)) {
    grid[row]![col] = active.color
  }

  const { count, burstCells } = clearLines(grid)
  const particles = spawnParticles(burstCells, rng)
  const attackRows = calcAttackRows(count, afterGarbage.combo)

  const afterSpawn = spawnPiece(
    {
      ...afterGarbage,
      grid,
      active: null,
      locking: false,
      lockAccum: 0,
      incomingGarbage: 0,
      clearParticles: [...afterGarbage.clearParticles, ...particles],
    },
    rng,
  )

  return { lane: afterSpawn, cleared: count, attackRows }
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

function isFullyInPlayfield(active: ActivePiece): boolean {
  return pieceCells(active).every((cell) => cell.row >= 0)
}

function shiftGridForGarbage(grid: BlockCell[][], rows: number, rng: () => number): BlockCell[][] {
  const next = grid.map((row) => [...row])
  for (let i = 0; i < rows; i += 1) {
    next.shift()
    next.push(createGarbageRow(rng))
  }
  return next
}

/** Grid yukarı kayınca aktif parçayı hizala ve zemine oturt. */
function settleActiveAfterGridChange(
  grid: BlockCell[][],
  active: ActivePiece,
  rowsShiftedUp: number,
): ActivePiece | null {
  let piece: ActivePiece = { ...active, row: active.row - rowsShiftedUp }

  if (!canPlace(grid, pieceCells(piece))) {
    let placed: ActivePiece | null = null
    for (let up = 1; up <= 4; up += 1) {
      const candidate = { ...piece, row: piece.row - up }
      if (canPlace(grid, pieceCells(candidate))) {
        placed = candidate
        break
      }
    }
    if (!placed) return null
    piece = placed
  }

  while (canPlace(grid, pieceCells({ ...piece, row: piece.row + 1 }))) {
    piece = { ...piece, row: piece.row + 1 }
  }

  return isFullyInPlayfield(piece) ? piece : null
}

function applyIncomingGarbage(lane: BlockLaneState, rng: () => number): BlockLaneState {
  if (lane.incomingGarbage <= 0) return lane

  const rows = lane.incomingGarbage
  const grid = shiftGridForGarbage(lane.grid, rows, rng)

  if (lane.active) {
    const settled = settleActiveAfterGridChange(grid, lane.active, rows)
    if (!settled) {
      return { ...lane, grid, incomingGarbage: 0, active: null, alive: false }
    }
    return { ...lane, grid, active: settled, incomingGarbage: 0 }
  }

  const spawnCol = Math.floor(BLOCK_COLS / 2) - 2
  const blocked = !canPlace(
    grid,
    pieceCells({
      kind: lane.nextKind,
      rotation: 0,
      col: spawnCol,
      row: 0,
      color: PIECE_COLOR[lane.nextKind],
    }),
  )

  if (blocked) {
    return { ...lane, grid, incomingGarbage: 0, active: null, alive: false }
  }

  return { ...lane, grid, incomingGarbage: 0 }
}

function createGarbageRow(rng: () => number): BlockCell[] {
  const hole = Math.floor(rng() * BLOCK_COLS)
  return Array.from({ length: BLOCK_COLS }, (_, col) => (col === hole ? null : 'purple'))
}

function clearLines(grid: BlockCell[][]): {
  count: number
  burstCells: { row: number; col: number; color: BlockColor }[]
} {
  let count = 0
  const burstCells: { row: number; col: number; color: BlockColor }[] = []

  for (let row = TOTAL_ROWS - 1; row >= 0; ) {
    const full = grid[row]!.every((cell) => cell != null)
    if (!full) {
      row -= 1
      continue
    }
    for (let col = 0; col < BLOCK_COLS; col += 1) {
      const color = grid[row]![col]
      if (color) burstCells.push({ row, col, color })
    }
    grid.splice(row, 1)
    grid.unshift(Array.from({ length: BLOCK_COLS }, () => null))
    count += 1
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

