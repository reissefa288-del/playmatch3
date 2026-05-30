export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 3500
export const LEG_DURATION_MS = 48_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const MOVE_COOLDOWN_MS = 130
export const JUMP_COOLDOWN_MS = 400
export const INVULN_MS = 1400
export const BARREL_SPAWN_MS = 2400
export const MAX_BARRELS = 4
export const COLS = 9
export const ROWS = 12
export const GOAL_ROW = 1
export const START_ROW = 10
export const LADDER_COLS = [0, 2, 4, 6, 8] as const
export const PLATFORM_ROWS = [2, 4, 6, 8, 10] as const
export const TOP_SCORE = 900
export const BARREL_SPEED = 0.1

export type Dir = 'up' | 'down' | 'left' | 'right'

export type DkBarrel = {
  id: number
  col: number
  row: number
  vx: number
  falling: boolean
}

export type DonkeyKongSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  col: number
  row: number
  barrels: DkBarrel[]
  climbs: number
  lastMoveAt: number
  lastJumpAt: number
  lastBarrelAt: number
  invulnUntil: number
  nextBarrelId: number
}

export type DonkeyKongState = {
  p1: DonkeyKongSideState
  p2: DonkeyKongSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

export function colToPct(col: number) {
  return ((col + 0.5) / COLS) * 100
}

export function rowToPct(row: number) {
  return 5 + ((row + 0.5) / ROWS) * 90
}

function isPlatform(row: number) {
  return row === GOAL_ROW || (PLATFORM_ROWS as readonly number[]).includes(row)
}

function isLadder(col: number) {
  return (LADDER_COLS as readonly number[]).includes(col)
}

function platformBelow(row: number) {
  if (row === GOAL_ROW) return PLATFORM_ROWS[0]
  const idx = (PLATFORM_ROWS as readonly number[]).indexOf(row)
  if (idx < 0) return null
  if (idx >= PLATFORM_ROWS.length - 1) return null
  return PLATFORM_ROWS[idx + 1]
}

export function createSide(sideId: 1 | 2, now: number): DonkeyKongSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    col: 4,
    row: START_ROW,
    barrels: [],
    climbs: 0,
    lastMoveAt: 0,
    lastJumpAt: 0,
    lastBarrelAt: now + 1500,
    invulnUntil: 0,
    nextBarrelId: 1,
  }
}

export function createDonkeyKongState(now: number): DonkeyKongState {
  return {
    p1: createSide(1, now),
    p2: createSide(2, now),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

function spawnBarrel(side: DonkeyKongSideState, rand: () => number): DonkeyKongSideState {
  if (side.barrels.length >= MAX_BARRELS) return side
  const barrel: DkBarrel = {
    id: side.nextBarrelId,
    col: 1 + rand() * (COLS - 2),
    row: GOAL_ROW,
    vx: rand() > 0.5 ? BARREL_SPEED : -BARREL_SPEED,
    falling: false,
  }
  return { ...side, barrels: [...side.barrels, barrel], nextBarrelId: side.nextBarrelId + 1 }
}

export function tryMove(side: DonkeyKongSideState, dir: Dir, now: number): DonkeyKongSideState {
  if (side.lives <= 0 || now - side.lastMoveAt < MOVE_COOLDOWN_MS) return side

  let nc = side.col
  let nr = side.row

  if (dir === 'left') nc--
  if (dir === 'right') nc++
  if (dir === 'up' || dir === 'down') {
    if (!isLadder(side.col)) return side
    const rows = [GOAL_ROW, ...PLATFORM_ROWS]
    const idx = rows.indexOf(side.row)
    if (idx < 0) return side
    if (dir === 'up' && idx > 0) nr = rows[idx - 1]!
    if (dir === 'down' && idx < rows.length - 1) nr = rows[idx + 1]!
  }

  if (nc < 0 || nc >= COLS || !isPlatform(nr)) return side

  let s = { ...side, col: nc, row: nr, lastMoveAt: now }
  if (nr === GOAL_ROW) {
    s = {
      ...s,
      score: s.score + TOP_SCORE,
      climbs: s.climbs + 1,
      row: START_ROW,
      col: 4,
    }
  }
  return s
}

export function tryJump(side: DonkeyKongSideState, now: number): DonkeyKongSideState {
  if (side.lives <= 0 || now - side.lastJumpAt < JUMP_COOLDOWN_MS) return side
  const rows = [GOAL_ROW, ...PLATFORM_ROWS]
  const idx = rows.indexOf(side.row)
  if (idx <= 0) return side
  const nr = rows[idx - 1]!
  if (!isPlatform(nr)) return side
  let s = { ...side, row: nr, lastJumpAt: now, lastMoveAt: now }
  if (nr === GOAL_ROW) {
    s = { ...s, score: s.score + TOP_SCORE, climbs: s.climbs + 1, row: START_ROW, col: 4 }
  }
  return s
}

function killPlayer(side: DonkeyKongSideState, now: number): DonkeyKongSideState {
  if (now < side.invulnUntil) return side
  const lives = side.lives - 1
  if (lives <= 0) return { ...side, lives: 0 }
  return {
    ...side,
    lives,
    col: 4,
    row: START_ROW,
    invulnUntil: now + INVULN_MS,
  }
}

function stepBarrels(side: DonkeyKongSideState, dt: number, now: number, rand: () => number): DonkeyKongSideState {
  let s = side
  let barrels = s.barrels.map((b) => {
    if (b.falling) {
      const below = platformBelow(b.row)
      if (below == null) return { ...b, row: b.row + 0.15 * dt, col: b.col }
      const targetRow = below
      const ny = b.row + 0.12 * dt
      if (ny >= targetRow) {
        return { ...b, row: targetRow, falling: false, vx: b.vx || BARREL_SPEED }
      }
      return { ...b, row: ny }
    }

    let col = b.col + b.vx * dt
    let vx = b.vx
    let row = b.row
    let falling = false

    if (col <= 0 || col >= COLS - 1) {
      vx = -vx
      col = Math.max(0, Math.min(COLS - 1, col))
      if (isLadder(Math.round(col))) falling = true
    } else if (isLadder(Math.round(col)) && rand() > 0.985) {
      falling = true
    }

    return { ...b, col, vx, row, falling }
  })

  barrels = barrels.filter((b) => b.row <= START_ROW + 0.5)

  s = { ...s, barrels }

  for (const b of barrels) {
    if (b.row === s.row && Math.abs(b.col - s.col) < 1.2 && now >= s.invulnUntil) {
      s = killPlayer(s, now)
      break
    }
  }

  return s
}

export function tickSide(side: DonkeyKongSideState, dt: number, now: number, rand: () => number): DonkeyKongSideState {
  if (dt <= 0 || side.lives <= 0) return side

  let s = side
  if (now - s.lastBarrelAt >= BARREL_SPAWN_MS) {
    s = spawnBarrel(s, rand)
    s = { ...s, lastBarrelAt: now }
  }
  s = stepBarrels(s, dt, now, rand)
  return s
}

export function legShouldEnd(g: DonkeyKongState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: DonkeyKongSideState, p2: DonkeyKongSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}
