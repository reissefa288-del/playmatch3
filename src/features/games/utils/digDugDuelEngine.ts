export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 3600
export const LEG_DURATION_MS = 48_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const MOVE_COOLDOWN_MS = 150
export const PUMP_COOLDOWN_MS = 220
export const PUMPS_TO_POP = 3
export const INVULN_MS = 1300
export const ENEMY_MOVE_MS = 380
export const COLS = 10
export const ROWS = 14
export const SCORE_POOKA = 260
export const SCORE_FYGAR = 420
export const SCORE_VEGGIE = 800

export type Dir = 'up' | 'down' | 'left' | 'right'

export type EnemyKind = 'pooka' | 'fygar'

export type DigEnemy = {
  id: number
  col: number
  row: number
  kind: EnemyKind
  pump: number
  alive: boolean
}

export type DigRock = {
  id: number
  col: number
  row: number
}

export type DigDugSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  col: number
  row: number
  dug: Set<string>
  rocks: DigRock[]
  enemies: DigEnemy[]
  pumpTargetId: number | null
  lastMoveAt: number
  lastPumpAt: number
  lastEnemyAt: number
  invulnUntil: number
  wave: number
  veggieRow: number | null
}

export type DigDugState = {
  p1: DigDugSideState
  p2: DigDugSideState
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

function key(col: number, row: number) {
  return `${col},${row}`
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

function inBounds(col: number, row: number) {
  return col >= 0 && col < COLS && row >= 0 && row < ROWS
}

function isDug(side: DigDugSideState, col: number, row: number) {
  return side.dug.has(key(col, row))
}

function rockAt(side: DigDugSideState, col: number, row: number) {
  return side.rocks.find((r) => r.col === col && r.row === row)
}

function enemyAt(side: DigDugSideState, col: number, row: number) {
  return side.enemies.find((e) => e.alive && e.col === col && e.row === row)
}

function spawnEnemies(rand: () => number, wave: number): DigEnemy[] {
  const enemies: DigEnemy[] = []
  let id = 1
  const count = 4 + Math.min(3, wave - 1)
  let guard = 0
  while (enemies.length < count && guard++ < 80) {
    const col = 1 + Math.floor(rand() * (COLS - 2))
    const row = 2 + Math.floor(rand() * 6)
    if (enemies.some((e) => e.col === col && e.row === row)) continue
    enemies.push({
      id: id++,
      col,
      row,
      kind: rand() > 0.65 ? 'fygar' : 'pooka',
      pump: 0,
      alive: true,
    })
  }
  return enemies
}

function spawnRocks(rand: () => number): DigRock[] {
  const rocks: DigRock[] = []
  let id = 1
  let guard = 0
  while (rocks.length < 4 && guard++ < 60) {
    const col = 1 + Math.floor(rand() * (COLS - 2))
    const row = 3 + Math.floor(rand() * 7)
    if (rocks.some((r) => r.col === col && r.row === row)) continue
    rocks.push({ id: id++, col, row })
  }
  return rocks
}

function initialDug(): Set<string> {
  const dug = new Set<string>()
  for (let c = 0; c < COLS; c++) {
    dug.add(key(c, ROWS - 1))
    dug.add(key(c, ROWS - 2))
  }
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < COLS; c++) dug.add(key(c, r))
  }
  return dug
}

export function createSide(sideId: 1 | 2, seed: number): DigDugSideState {
  const rand = mulberry32(seed)
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    col: Math.floor(COLS / 2),
    row: ROWS - 2,
    dug: initialDug(),
    rocks: spawnRocks(rand),
    enemies: spawnEnemies(rand, 1),
    pumpTargetId: null,
    lastMoveAt: 0,
    lastPumpAt: 0,
    lastEnemyAt: performance.now() + 400,
    invulnUntil: 0,
    wave: 1,
    veggieRow: null,
  }
}

export function createDigDugState(now: number): DigDugState {
  return {
    p1: createSide(1, 16001),
    p2: createSide(2, 26001),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

function dirDelta(dir: Dir) {
  if (dir === 'up') return { dc: 0, dr: -1 }
  if (dir === 'down') return { dc: 0, dr: 1 }
  if (dir === 'left') return { dc: -1, dr: 0 }
  return { dc: 1, dr: 0 }
}

function killPlayer(side: DigDugSideState, now: number): DigDugSideState {
  if (now < side.invulnUntil) return side
  const lives = side.lives - 1
  if (lives <= 0) {
    return { ...side, lives: 0, pumpTargetId: null }
  }
  return {
    ...side,
    lives,
    col: Math.floor(COLS / 2),
    row: ROWS - 2,
    invulnUntil: now + INVULN_MS,
    pumpTargetId: null,
  }
}

export function tryMove(side: DigDugSideState, dir: Dir, now: number): DigDugSideState {
  if (side.lives <= 0 || now - side.lastMoveAt < MOVE_COOLDOWN_MS) return side

  const { dc, dr } = dirDelta(dir)
  const nc = side.col + dc
  const nr = side.row + dr
  if (!inBounds(nc, nr)) return side
  if (rockAt(side, nc, nr)) return side

  const foe = enemyAt(side, nc, nr)
  if (foe) return killPlayer(side, now)

  const dug = new Set(side.dug)
  dug.add(key(nc, nr))

  return {
    ...side,
    col: nc,
    row: nr,
    dug,
    lastMoveAt: now,
    pumpTargetId: null,
  }
}

function adjacentEnemy(side: DigDugSideState) {
  for (const e of side.enemies) {
    if (!e.alive) continue
    const dist = Math.abs(e.col - side.col) + Math.abs(e.row - side.row)
    if (dist === 1) return e
  }
  return null
}

export function tryPump(side: DigDugSideState, now: number): DigDugSideState {
  if (side.lives <= 0 || now - side.lastPumpAt < PUMP_COOLDOWN_MS) return side

  const target = adjacentEnemy(side)
  if (!target) return { ...side, pumpTargetId: null }

  let enemies = side.enemies.map((e) => {
    if (e.id !== target.id) return { ...e, pump: 0 }
    const pump = e.pump + 1
    return { ...e, pump }
  })

  const hit = enemies.find((e) => e.id === target.id)!
  let score = side.score
  if (hit.pump >= PUMPS_TO_POP) {
    score += hit.kind === 'fygar' ? SCORE_FYGAR : SCORE_POOKA
    enemies = enemies.map((e) => (e.id === hit.id ? { ...e, alive: false, pump: 0 } : e))
  }

  let next: DigDugSideState = {
    ...side,
    enemies,
    score,
    lastPumpAt: now,
    pumpTargetId: target.id,
  }

  if (enemies.every((e) => !e.alive)) {
    next = respawnWave(next, now)
  }

  return next
}

function respawnWave(side: DigDugSideState, now: number): DigDugSideState {
  const seed = side.sideId * 9000 + side.wave * 131 + Math.floor(now)
  const rand = mulberry32(seed)
  return {
    ...side,
    wave: side.wave + 1,
    enemies: spawnEnemies(rand, side.wave + 1),
    veggieRow: 2,
  }
}

function collectVeggie(side: DigDugSideState): DigDugSideState {
  if (side.veggieRow == null || side.row !== side.veggieRow) return side
  return {
    ...side,
    score: side.score + SCORE_VEGGIE,
    veggieRow: null,
  }
}

function stepRocks(side: DigDugSideState, now: number): DigDugSideState {
  let s = side
  const rocks: DigRock[] = []

  for (const rock of s.rocks) {
    const below = rock.row + 1
    if (below >= ROWS) {
      rocks.push(rock)
      continue
    }
    const blocked = rockAt(s, rock.col, below) != null
    const canFall = isDug(s, rock.col, below) && !blocked
    if (!canFall) {
      rocks.push(rock)
      continue
    }
    const nr = below
    if (s.col === rock.col && s.row === nr && now >= s.invulnUntil) {
      s = killPlayer(s, now)
      rocks.push({ ...rock, row: nr })
      continue
    }
    const foe = enemyAt(s, rock.col, nr)
    let enemies = s.enemies
    if (foe) {
      enemies = enemies.map((e) => (e.id === foe.id ? { ...e, alive: false } : e))
      s = { ...s, enemies }
    }
    rocks.push({ ...rock, row: nr })
  }

  return { ...s, rocks }
}

function enemyStep(side: DigDugSideState, now: number, rand: () => number): DigDugSideState {
  if (now - side.lastEnemyAt < ENEMY_MOVE_MS) return side
  if (side.enemies.every((e) => !e.alive)) return side

  let s = { ...side, lastEnemyAt: now }
  const dirs: Dir[] = ['up', 'down', 'left', 'right']

  const enemies = s.enemies.map((e) => {
    if (!e.alive) return e

    const inTunnel = isDug(s, e.col, e.row)
    let choices: { nc: number; nr: number }[] = []

    for (const dir of dirs) {
      const { dc, dr } = dirDelta(dir)
      const nc = e.col + dc
      const nr = e.row + dr
      if (!inBounds(nc, nr)) continue
      if (rockAt(s, nc, nr)) continue
      if (enemyAt(s, nc, nr)) continue
      const dug = isDug(s, nc, nr)
      if (!dug && inTunnel) continue
      if (!dug && !inTunnel && rand() > 0.35) continue
      choices.push({ nc, nr })
    }

    if (choices.length === 0) return e

    if (inTunnel) {
      choices.sort((a, b) => {
        const da = Math.abs(a.nc - s.col) + Math.abs(a.nr - s.row)
        const db = Math.abs(b.nc - s.col) + Math.abs(b.nr - s.row)
        return da - db
      })
      if (rand() > 0.25) {
        const pick = choices[0]!
        if (pick.nc === s.col && pick.nr === s.row && now >= s.invulnUntil) {
          s = killPlayer(s, now)
        }
        return { ...e, col: pick.nc, row: pick.nr, pump: 0 }
      }
    }

    const pick = choices[Math.floor(rand() * choices.length)]!
    if (pick.nc === s.col && pick.nr === s.row && now >= s.invulnUntil) {
      s = killPlayer(s, now)
    }
    return { ...e, col: pick.nc, row: pick.nr, pump: 0 }
  })

  s = { ...s, enemies }

  if (enemyAt(s, s.col, s.row) && now >= s.invulnUntil) {
    s = killPlayer(s, now)
  }

  return s
}

export function tickSide(side: DigDugSideState, dt: number, now: number, rand: () => number): DigDugSideState {
  if (dt <= 0 || side.lives <= 0) return side
  let s = collectVeggie(side)
  s = stepRocks(s, now)
  s = enemyStep(s, now, rand)
  return s
}

export function legShouldEnd(g: DigDugState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: DigDugSideState, p2: DigDugSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}

export function enemyGlyph(kind: EnemyKind) {
  return kind === 'fygar' ? '🐉' : '👾'
}
