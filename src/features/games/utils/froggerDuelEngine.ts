export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 3200
export const LEG_DURATION_MS = 48_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const MOVE_COOLDOWN_MS = 160
export const INVULN_MS = 1200
export const COLS = 9
export const ROWS = 10
export const GOAL_ROW = 0
export const START_ROW = 9
export const ROAD_ROWS = [2, 3, 4] as const
export const RIVER_ROWS = [6, 7, 8] as const
export const HOME_COLS = [1, 3, 5, 7, 8]
export const SCORE_HOME = 520
export const SCORE_FORWARD = 35

export type Dir = 'up' | 'down' | 'left' | 'right'

export type FroggerVehicle = {
  id: number
  row: number
  x: number
  width: number
  speed: number
  dir: 1 | -1
  kind: 'car' | 'log'
}

export type FroggerSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  frogCol: number
  frogRow: number
  ridingLogId: number | null
  vehicles: FroggerVehicle[]
  homesFilled: boolean[]
  lastMoveAt: number
  invulnUntil: number
  nextVehicleId: number
}

export type FroggerState = {
  p1: FroggerSideState
  p2: FroggerSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

export function colToPct(col: number) {
  return ((col + 0.5) / COLS) * 100
}

export function rowToPct(row: number) {
  return 7 + ((row + 0.5) / ROWS) * 86
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

function isRoad(row: number) {
  return (ROAD_ROWS as readonly number[]).includes(row)
}

function isRiver(row: number) {
  return (RIVER_ROWS as readonly number[]).includes(row)
}

function spawnVehicles(seed: number): FroggerVehicle[] {
  const rand = mulberry32(seed)
  const vehicles: FroggerVehicle[] = []
  let id = 1

  for (const row of ROAD_ROWS) {
    const dir: 1 | -1 = row % 2 === 0 ? 1 : -1
    const count = 2 + Math.floor(rand() * 2)
    for (let i = 0; i < count; i++) {
      vehicles.push({
        id: id++,
        row,
        x: rand() * (COLS - 2),
        width: 1.6,
        speed: (0.028 + rand() * 0.022) * dir,
        dir,
        kind: 'car',
      })
    }
  }

  for (const row of RIVER_ROWS) {
    const dir: 1 | -1 = row % 2 === 1 ? 1 : -1
    const count = 2
    for (let i = 0; i < count; i++) {
      vehicles.push({
        id: id++,
        row,
        x: rand() * (COLS - 3),
        width: 2.4 + rand() * 0.8,
        speed: (0.02 + rand() * 0.015) * dir,
        dir,
        kind: 'log',
      })
    }
  }

  return vehicles
}

export function createSide(sideId: 1 | 2, seed: number): FroggerSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    frogCol: Math.floor(COLS / 2),
    frogRow: START_ROW,
    ridingLogId: null,
    vehicles: spawnVehicles(seed),
    homesFilled: HOME_COLS.map(() => false),
    lastMoveAt: 0,
    invulnUntil: 0,
    nextVehicleId: 100,
  }
}

export function createFroggerState(now: number): FroggerState {
  return {
    p1: createSide(1, 14001),
    p2: createSide(2, 24001),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

function logAt(vehicles: FroggerVehicle[], col: number, row: number) {
  for (const v of vehicles) {
    if (v.kind !== 'log' || v.row !== row) continue
    if (col >= v.x && col <= v.x + v.width) return v
  }
  return null
}

function carHit(vehicles: FroggerVehicle[], col: number, row: number) {
  for (const v of vehicles) {
    if (v.kind !== 'car' || v.row !== row) continue
    if (col >= v.x - 0.2 && col <= v.x + v.width + 0.2) return true
  }
  return false
}

export function tryMove(side: FroggerSideState, dir: Dir, now: number): FroggerSideState {
  if (side.lives <= 0) return side
  if (now - side.lastMoveAt < MOVE_COOLDOWN_MS) return side

  let col = side.frogCol
  let row = side.frogRow
  if (dir === 'up') row -= 1
  if (dir === 'down') row += 1
  if (dir === 'left') col -= 1
  if (dir === 'right') col += 1

  col = Math.max(0, Math.min(COLS - 1, col))
  row = Math.max(0, Math.min(ROWS - 1, row))

  if (row === side.frogRow && col === side.frogCol) return side

  let score = side.score
  let homesFilled = [...side.homesFilled]
  let ridingLogId: number | null = null

  if (row === GOAL_ROW) {
    const homeIdx = HOME_COLS.indexOf(col)
    if (homeIdx < 0 || homesFilled[homeIdx]) return side
    homesFilled[homeIdx] = true
    score += SCORE_HOME
    row = START_ROW
    col = Math.floor(COLS / 2)
  } else if (row < side.frogRow) {
    score += SCORE_FORWARD
  }

  if (isRiver(row)) {
    const log = logAt(side.vehicles, col, row)
    ridingLogId = log?.id ?? null
  }

  return {
    ...side,
    frogCol: col,
    frogRow: row,
    ridingLogId,
    score,
    homesFilled,
    lastMoveAt: now,
  }
}

function respawnFrog(side: FroggerSideState, now: number): FroggerSideState {
  return {
    ...side,
    frogCol: Math.floor(COLS / 2),
    frogRow: START_ROW,
    ridingLogId: null,
    lives: side.lives - 1,
    invulnUntil: now + INVULN_MS,
  }
}

export function tickSide(side: FroggerSideState, dt: number, now: number): FroggerSideState {
  if (dt <= 0) return side

  let vehicles = side.vehicles.map((v) => {
    let x = v.x + v.speed * dt
    if (v.kind === 'log') {
      if (x > COLS + 1) x = -v.width
      if (x < -v.width - 1) x = COLS
    } else {
      if (x > COLS + 2) x = -v.width
      if (x < -v.width - 2) x = COLS
    }
    return { ...v, x }
  })

  let frogCol = side.frogCol
  let frogRow = side.frogRow
  let ridingLogId = side.ridingLogId

  if (ridingLogId != null) {
    const log = vehicles.find((v) => v.id === ridingLogId)
    if (log && log.row === frogRow) {
      frogCol += log.speed * dt
      if (frogCol < 0) frogCol = 0
      if (frogCol > COLS - 1) frogCol = COLS - 1
    } else {
      ridingLogId = null
    }
  }

  let s: FroggerSideState = { ...side, vehicles, frogCol, frogRow, ridingLogId }

  const invuln = now < s.invulnUntil
  if (!invuln && s.lives > 0) {
    if (isRoad(frogRow) && carHit(vehicles, frogCol, frogRow)) {
      return respawnFrog(s, now)
    }
    if (isRiver(frogRow)) {
      const onLog = logAt(vehicles, frogCol, frogRow)
      if (!onLog) {
        return respawnFrog(s, now)
      }
      s.ridingLogId = onLog.id
    }
  }

  if (s.homesFilled.every(Boolean) && s.lives > 0) {
    s = {
      ...s,
      homesFilled: HOME_COLS.map(() => false),
      score: s.score + 300,
      frogCol: Math.floor(COLS / 2),
      frogRow: START_ROW,
      ridingLogId: null,
    }
  }

  return s
}

export function legShouldEnd(g: FroggerState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: FroggerSideState, p2: FroggerSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}

export function homesDone(side: FroggerSideState) {
  return side.homesFilled.filter(Boolean).length
}
