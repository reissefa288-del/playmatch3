export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 3300
export const LEG_DURATION_MS = 46_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const MOVE_COOLDOWN_MS = 145
export const INVULN_MS = 1300
export const HUNTER_MOVE_MS = 480
export const ROWS = 11
export const COLS = 7
export const START_ROW = 10
export const START_COL = 3
export const GOAL_ROW = 0
export const GOAL_COL = 3
export const SCORE_FORWARD = 45
export const SCORE_GEM = 200
export const SCORE_GOAL = 1100

/** 0 wall · 1 path · 2 pit · 3 gem · 9 goal */
export const MAZE: readonly number[][] = [
  [0, 0, 0, 9, 0, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 1, 1, 0, 1, 1, 0],
  [0, 1, 0, 2, 0, 1, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [0, 0, 1, 2, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 0],
  [1, 1, 0, 2, 0, 1, 1],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 3, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
]

export type Dir = 'up' | 'down' | 'left' | 'right'

export type MmHunter = {
  id: number
  row: number
  col: number
}

export type MarbleMadnessSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  row: number
  col: number
  gemsTaken: string[]
  goals: number
  hunters: MmHunter[]
  lastMoveAt: number
  lastHunterAt: number
  invulnUntil: number
  nextId: number
}

export type MarbleMadnessState = {
  p1: MarbleMadnessSideState
  p2: MarbleMadnessSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

export function colToPct(col: number) {
  return ((col + 0.5) / COLS) * 100
}

export function rowToPct(row: number) {
  return 6 + ((row + 0.5) / ROWS) * 86
}

export function gemKey(row: number, col: number) {
  return `${row},${col}`
}

export function cellAt(row: number, col: number) {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return 0
  return MAZE[row]![col] ?? 0
}

export function isBlocked(row: number, col: number) {
  const c = cellAt(row, col)
  return c === 0
}

function initialHunters(nextId: number): MmHunter[] {
  return [
    { id: nextId, row: 4, col: 1 },
    { id: nextId + 1, row: 6, col: 5 },
  ]
}

export function createSide(sideId: 1 | 2, now: number): MarbleMadnessSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    row: START_ROW,
    col: START_COL,
    gemsTaken: [],
    goals: 0,
    hunters: initialHunters(1),
    lastMoveAt: 0,
    lastHunterAt: now + 600,
    invulnUntil: 0,
    nextId: 3,
  }
}

export function createMarbleMadnessState(now: number): MarbleMadnessState {
  return {
    p1: createSide(1, now),
    p2: createSide(2, now),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

function respawn(side: MarbleMadnessSideState, now: number): MarbleMadnessSideState {
  if (now < side.invulnUntil) return side
  const lives = side.lives - 1
  if (lives <= 0) return { ...side, lives: 0 }
  return {
    ...side,
    lives,
    row: START_ROW,
    col: START_COL,
    invulnUntil: now + INVULN_MS,
  }
}

function hunterNeighbors(row: number, col: number): { row: number; col: number }[] {
  const opts: { row: number; col: number }[] = []
  const dirs: Dir[] = ['up', 'down', 'left', 'right']
  for (const d of dirs) {
    let nr = row
    let nc = col
    if (d === 'up') nr--
    if (d === 'down') nr++
    if (d === 'left') nc--
    if (d === 'right') nc++
    const c = cellAt(nr, nc)
    if (c === 1 || c === 3 || c === 9) opts.push({ row: nr, col: nc })
  }
  return opts
}

function stepHunters(side: MarbleMadnessSideState, now: number, rand: () => number): MarbleMadnessSideState {
  if (side.lives <= 0 || now - side.lastHunterAt < HUNTER_MOVE_MS) return side

  const hunters = side.hunters.map((h) => {
    const opts = hunterNeighbors(h.row, h.col)
    if (opts.length === 0) return h
    const pick = opts[Math.floor(rand() * opts.length)]!
    return { ...h, row: pick.row, col: pick.col }
  })

  return { ...side, hunters, lastHunterAt: now }
}

function applyCell(side: MarbleMadnessSideState, row: number, col: number): MarbleMadnessSideState {
  const cell = cellAt(row, col)
  let s: MarbleMadnessSideState = { ...side, row, col }

  if (cell === 3) {
    const key = gemKey(row, col)
    if (!s.gemsTaken.includes(key)) {
      s = { ...s, gemsTaken: [...s.gemsTaken, key], score: s.score + SCORE_GEM }
    }
  }

  if (cell === 9) {
    s = {
      ...s,
      score: s.score + SCORE_GOAL,
      goals: s.goals + 1,
      row: START_ROW,
      col: START_COL,
    }
  }

  return s
}

export function tryMove(side: MarbleMadnessSideState, dir: Dir, now: number): MarbleMadnessSideState {
  if (side.lives <= 0 || now - side.lastMoveAt < MOVE_COOLDOWN_MS) return side

  let nr = side.row
  let nc = side.col
  if (dir === 'up') nr--
  if (dir === 'down') nr++
  if (dir === 'left') nc--
  if (dir === 'right') nc++

  if (isBlocked(nr, nc)) return side

  const cell = cellAt(nr, nc)
  if (cell === 0) return side

  let s: MarbleMadnessSideState = { ...side, lastMoveAt: now }

  if (cell === 2) {
    return respawn(s, now)
  }

  if (nr < s.row) s = { ...s, score: s.score + SCORE_FORWARD }

  s = applyCell(s, nr, nc)

  if (now >= s.invulnUntil) {
    for (const h of s.hunters) {
      if (h.row === s.row && h.col === s.col) {
        s = respawn(s, now)
        break
      }
    }
  }

  return s
}

export function tickSide(side: MarbleMadnessSideState, now: number, rand: () => number): MarbleMadnessSideState {
  if (side.lives <= 0) return side

  let s = stepHunters(side, now, rand)

  if (now >= s.invulnUntil) {
    for (const h of s.hunters) {
      if (h.row === s.row && h.col === s.col) {
        s = respawn(s, now)
        break
      }
    }
  }

  return s
}

export function legShouldEnd(g: MarbleMadnessState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(
  p1: MarbleMadnessSideState,
  p2: MarbleMadnessSideState,
): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}

export function gemsLeft(side: MarbleMadnessSideState) {
  let total = 0
  let taken = 0
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (cellAt(r, c) === 3) {
        total++
        if (side.gemsTaken.includes(gemKey(r, c))) taken++
      }
    }
  }
  return { total, taken }
}
