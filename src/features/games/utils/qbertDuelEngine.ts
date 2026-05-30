export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 3200
export const LEG_DURATION_MS = 45_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const HOP_COOLDOWN_MS = 200
export const INVULN_MS = 1300
export const COILY_MOVE_MS = 520
export const CUBE_FLIP_SCORE = 120
export const CUBE_DONE_SCORE = 180
export const PYRAMID_CLEAR_BONUS = 1400
export const PYRAMID_ROWS = 7
export const CUBE_COUNT = (PYRAMID_ROWS * (PYRAMID_ROWS + 1)) / 2

export type HopDir = 'ul' | 'ur' | 'dl' | 'dr'

export type QbertSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  row: number
  col: number
  cubes: number[]
  clears: number
  coilyRow: number
  coilyCol: number
  lastHopAt: number
  lastCoilyAt: number
  invulnUntil: number
}

export type QbertState = {
  p1: QbertSideState
  p2: QbertSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

export function cubeIndex(row: number, col: number) {
  return (row * (row + 1)) / 2 + col
}

export function isValidCell(row: number, col: number) {
  return row >= 0 && row < PYRAMID_ROWS && col >= 0 && col <= row
}

export function createCubes(): number[] {
  return Array.from({ length: CUBE_COUNT }, () => 0)
}

export function createSide(sideId: 1 | 2, now: number): QbertSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    row: 0,
    col: 0,
    cubes: createCubes(),
    clears: 0,
    coilyRow: PYRAMID_ROWS - 1,
    coilyCol: PYRAMID_ROWS - 1,
    lastHopAt: 0,
    lastCoilyAt: now + 800,
    invulnUntil: 0,
  }
}

export function createQbertState(now: number): QbertState {
  return {
    p1: createSide(1, now),
    p2: createSide(2, now),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

export function hopTarget(row: number, col: number, dir: HopDir): { row: number; col: number } | null {
  let nr = row
  let nc = col
  if (dir === 'ul') {
    nr--
    nc--
  } else if (dir === 'ur') {
    nr--
  } else if (dir === 'dl') {
    nr++
  } else if (dir === 'dr') {
    nr++
    nc++
  }
  if (!isValidCell(nr, nc)) return null
  return { row: nr, col: nc }
}

function flipCube(side: QbertSideState, row: number, col: number): QbertSideState {
  const i = cubeIndex(row, col)
  const prev = side.cubes[i] ?? 0
  if (prev >= 2) return side

  const cubes = [...side.cubes]
  cubes[i] = prev + 1
  let score = side.score + (cubes[i] === 2 ? CUBE_DONE_SCORE : CUBE_FLIP_SCORE)

  let clears = side.clears
  if (cubes.every((c) => c >= 2)) {
    score += PYRAMID_CLEAR_BONUS
    clears += 1
    for (let r = 0; r < cubes.length; r++) cubes[r] = 0
  }

  return { ...side, cubes, score, clears }
}

function respawn(side: QbertSideState, now: number): QbertSideState {
  const lives = side.lives - 1
  if (lives <= 0) return { ...side, lives: 0 }
  return {
    ...side,
    lives,
    row: 0,
    col: 0,
    invulnUntil: now + INVULN_MS,
  }
}

export function tryHop(side: QbertSideState, dir: HopDir, now: number): QbertSideState {
  if (side.lives <= 0 || now - side.lastHopAt < HOP_COOLDOWN_MS) return side

  const target = hopTarget(side.row, side.col, dir)
  if (!target) {
    if (now < side.invulnUntil) return side
    return respawn(side, now)
  }

  let s: QbertSideState = {
    ...side,
    row: target.row,
    col: target.col,
    lastHopAt: now,
  }
  s = flipCube(s, target.row, target.col)

  if (s.coilyRow === s.row && s.coilyCol === s.col && now >= s.invulnUntil) {
    s = respawn(s, now)
  }

  return s
}

function coilyDirs(row: number, col: number): HopDir[] {
  const dirs: HopDir[] = ['ul', 'ur', 'dl', 'dr']
  return dirs.filter((d) => hopTarget(row, col, d) != null)
}

function stepCoily(side: QbertSideState, now: number, rand: () => number): QbertSideState {
  if (side.lives <= 0 || now - side.lastCoilyAt < COILY_MOVE_MS) return side

  const options = coilyDirs(side.coilyRow, side.coilyCol)
  if (options.length === 0) return { ...side, lastCoilyAt: now }

  let pick = options[Math.floor(rand() * options.length)]!

  const towardPlayer = options
    .map((d) => {
      const t = hopTarget(side.coilyRow, side.coilyCol, d)!
      const dist = Math.abs(t.row - side.row) + Math.abs(t.col - side.col)
      return { d, dist }
    })
    .sort((a, b) => a.dist - b.dist)[0]

  if (towardPlayer && rand() > 0.35) pick = towardPlayer.d

  const t = hopTarget(side.coilyRow, side.coilyCol, pick)!
  let s: QbertSideState = {
    ...side,
    coilyRow: t.row,
    coilyCol: t.col,
    lastCoilyAt: now,
  }

  if (s.coilyRow === s.row && s.coilyCol === s.col && now >= s.invulnUntil) {
    s = respawn(s, now)
  }

  return s
}

export function tickSide(side: QbertSideState, now: number, rand: () => number): QbertSideState {
  if (side.lives <= 0) return side
  return stepCoily(side, now, rand)
}

export function legShouldEnd(g: QbertState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: QbertSideState, p2: QbertSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}

export function cubesDoneCount(cubes: number[]) {
  return cubes.filter((c) => c >= 2).length
}
