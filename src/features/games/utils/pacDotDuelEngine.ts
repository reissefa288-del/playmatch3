export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 3500
export const LEG_DURATION_MS = 50_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const MOVE_COOLDOWN_MS = 130
export const GHOST_MOVE_MS = 260
export const POWER_MS = 5500
export const INVULN_MS = 1500
export const COLS = 11
export const ROWS = 11

export const SCORE_DOT = 10
export const SCORE_POWER = 60
export const SCORE_GHOST = 200

export type Dir = 'up' | 'down' | 'left' | 'right'

export type PacDot = { col: number; row: number; power: boolean }

export type PacGhost = {
  id: number
  col: number
  row: number
  dir: Dir
  eatenUntil: number
}

export type PacSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  playerCol: number
  playerRow: number
  pendingDir: Dir | null
  ghosts: PacGhost[]
  dots: PacDot[]
  powerUntil: number
  lastMoveAt: number
  lastGhostMoveAt: number
  invulnUntil: number
}

export type PacDotState = {
  p1: PacSideState
  p2: PacSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

const MAZE = [
  '###########',
  '#.........#',
  '#.###.###.#',
  '#.#.....#.#',
  '#.###.###.#',
  '#.........#',
  '#.#######.#',
  '#.........#',
  '#.###.###.#',
  '#.........#',
  '###########',
]

const WALLS = new Set<string>()
const POWER_SPOTS: [number, number][] = [
  [1, 1],
  [9, 1],
  [1, 9],
  [9, 9],
]

for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    if (MAZE[r]![c] === '#') WALLS.add(`${c},${r}`)
  }
}

export function colToPct(col: number) {
  return ((col + 0.5) / COLS) * 100
}

export function rowToPct(row: number) {
  return 7 + ((row + 0.5) / ROWS) * 86
}

export function isWall(col: number, row: number) {
  return WALLS.has(`${col},${row}`)
}

function buildDots(): PacDot[] {
  const dots: PacDot[] = []
  const powerSet = new Set(POWER_SPOTS.map(([c, r]) => `${c},${r}`))
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (isWall(c, r)) continue
      dots.push({ col: c, row: r, power: powerSet.has(`${c},${r}`) })
    }
  }
  return dots
}

const START_POS = { col: 5, row: 9 }
const GHOST_START = [
  { col: 5, row: 5, dir: 'left' as Dir },
  { col: 4, row: 5, dir: 'right' as Dir },
  { col: 6, row: 5, dir: 'up' as Dir },
]

export function createSide(sideId: 1 | 2): PacSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    playerCol: START_POS.col,
    playerRow: START_POS.row,
    pendingDir: null,
    ghosts: GHOST_START.map((g, i) => ({ id: i + 1, ...g, eatenUntil: 0 })),
    dots: buildDots(),
    powerUntil: 0,
    lastMoveAt: 0,
    lastGhostMoveAt: 0,
    invulnUntil: 0,
  }
}

export function createPacDotState(now: number): PacDotState {
  return {
    p1: createSide(1),
    p2: createSide(2),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

const DIR_DELTA: Record<Dir, { dc: number; dr: number }> = {
  up: { dc: 0, dr: -1 },
  down: { dc: 0, dr: 1 },
  left: { dc: -1, dr: 0 },
  right: { dc: 1, dr: 0 },
}

const OPPOSITE: Record<Dir, Dir> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
}

function wrapCol(col: number) {
  if (col < 0) return COLS - 1
  if (col >= COLS) return 0
  return col
}

function canMove(col: number, row: number) {
  if (row < 0 || row >= ROWS) return false
  const wc = wrapCol(col)
  return !isWall(wc, row)
}

function dotAt(dots: PacDot[], col: number, row: number) {
  return dots.find((d) => d.col === col && d.row === row)
}

function removeDot(dots: PacDot[], col: number, row: number) {
  return dots.filter((d) => !(d.col === col && d.row === row))
}

function dirsAvailable(col: number, row: number, forbid?: Dir) {
  const out: Dir[] = []
  for (const d of ['up', 'down', 'left', 'right'] as Dir[]) {
    if (forbid && d === forbid) continue
    const { dc, dr } = DIR_DELTA[d]
    if (canMove(col + dc, row + dr)) out.push(d)
  }
  return out
}

function pickGhostDir(ghost: PacGhost, targetCol: number, targetRow: number, flee: boolean) {
  const options = dirsAvailable(ghost.col, ghost.row, OPPOSITE[ghost.dir])
  if (options.length === 0) return ghost.dir

  let best = options[0]!
  let bestScore = flee ? -Infinity : Infinity

  for (const d of options) {
    const { dc, dr } = DIR_DELTA[d]
    const nc = wrapCol(ghost.col + dc)
    const nr = ghost.row + dr
    const dist = Math.abs(nc - targetCol) + Math.abs(nr - targetRow)
    const score = flee ? dist : -dist
    if (flee) {
      if (score > bestScore) {
        bestScore = score
        best = d
      }
    } else if (score > bestScore) {
      bestScore = score
      best = d
    }
  }
  return best
}

function moveGhost(ghost: PacGhost, dir: Dir): PacGhost {
  const { dc, dr } = DIR_DELTA[dir]
  const nc = wrapCol(ghost.col + dc)
  const nr = ghost.row + dr
  if (!canMove(ghost.col + dc, ghost.row + dr)) return { ...ghost, dir }
  return { col: nc, row: nr, id: ghost.id, dir, eatenUntil: ghost.eatenUntil }
}

function respawnPlayer(side: PacSideState, now: number): PacSideState {
  return {
    ...side,
    playerCol: START_POS.col,
    playerRow: START_POS.row,
    pendingDir: null,
    lives: side.lives - 1,
    invulnUntil: now + INVULN_MS,
    ghosts: GHOST_START.map((g, i) => ({
      id: i + 1,
      col: g.col,
      row: g.row,
      dir: g.dir,
      eatenUntil: 0,
    })),
  }
}

export function queueDir(side: PacSideState, dir: Dir): PacSideState {
  return { ...side, pendingDir: dir }
}

export function tryMovePlayer(side: PacSideState, now: number): PacSideState {
  if (side.lives <= 0) return side
  if (now - side.lastMoveAt < MOVE_COOLDOWN_MS) return side

  const tryDir = (d: Dir) => {
    const { dc, dr } = DIR_DELTA[d]
    const nc = wrapCol(side.playerCol + dc)
    const nr = side.playerRow + dr
    if (canMove(side.playerCol + dc, side.playerRow + dr)) return { col: nc, row: nr, dir: d }
    return null
  }

  let moved: { col: number; row: number; dir: Dir } | null = null
  if (side.pendingDir) moved = tryDir(side.pendingDir)
  if (!moved) {
    const last = side.pendingDir ?? 'left'
    moved = tryDir(last)
  }
  if (!moved) return side

  let score = side.score
  let dots = side.dots
  let powerUntil = side.powerUntil
  const dot = dotAt(dots, moved.col, moved.row)
  if (dot) {
    dots = removeDot(dots, moved.col, moved.row)
    score += dot.power ? SCORE_POWER : SCORE_DOT
    if (dot.power) powerUntil = now + POWER_MS
  }

  return {
    ...side,
    playerCol: moved.col,
    playerRow: moved.row,
    pendingDir: moved.dir,
    dots,
    score,
    powerUntil,
    lastMoveAt: now,
  }
}

function tickGhosts(side: PacSideState, now: number): PacSideState {
  if (now - side.lastGhostMoveAt < GHOST_MOVE_MS) return side
  const powered = now < side.powerUntil

  const ghosts = side.ghosts.map((g) => {
    if (g.eatenUntil > now) return g
    const dir = pickGhostDir(g, side.playerCol, side.playerRow, powered)
    return moveGhost(g, dir)
  })

  return { ...side, ghosts, lastGhostMoveAt: now }
}

function handleCollisions(side: PacSideState, now: number): PacSideState {
  const invuln = now < side.invulnUntil
  if (invuln || side.lives <= 0) return side

  const powered = now < side.powerUntil
  let ghosts = [...side.ghosts]
  let score = side.score

  for (let i = 0; i < ghosts.length; i++) {
    const g = ghosts[i]!
    if (g.eatenUntil > now) continue
    if (g.col !== side.playerCol || g.row !== side.playerRow) continue

    if (powered) {
      ghosts[i] = {
        ...g,
        col: 5,
        row: 5,
        eatenUntil: now + 4000,
      }
      score += SCORE_GHOST
    } else {
      return respawnPlayer(side, now)
    }
  }

  return { ...side, ghosts, score }
}

export function tickSide(side: PacSideState, now: number): PacSideState {
  let s = tryMovePlayer(side, now)
  s = tickGhosts(s, now)
  s = handleCollisions(s, now)

  if (s.dots.length === 0) {
    s = {
      ...createSide(s.sideId),
      score: s.score + 500,
      matchPoints: s.matchPoints,
      lives: s.lives,
    }
  }

  return s
}

export function legShouldEnd(g: PacDotState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: PacSideState, p2: PacSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}

export function dotsLeft(side: PacSideState) {
  return side.dots.length
}
