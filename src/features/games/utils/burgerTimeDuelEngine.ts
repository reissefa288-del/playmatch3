export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 3400
export const LEG_DURATION_MS = 48_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const MOVE_COOLDOWN_MS = 140
export const INVULN_MS = 1300
export const ENEMY_MOVE_MS = 360
export const ENEMY_SPAWN_MS = 2800
export const MAX_ENEMIES = 5
export const COLS = 9
export const ROWS = 12
export const LADDER_COLS = [1, 3, 5, 7] as const
export const BURGER_COLS = [1, 3, 5, 7] as const
export const PLATFORM_ROWS = [2, 5, 8, 11] as const

export type Dir = 'up' | 'down' | 'left' | 'right'

export type BurgerPart = {
  id: number
  col: number
  row: number
  layer: number
  dropped: boolean
}

export type BurgerEnemy = {
  id: number
  col: number
  row: number
  kind: 'hotdog' | 'pickle' | 'egg'
  dir: 1 | -1
}

export type BurgerTimeSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  col: number
  row: number
  parts: BurgerPart[]
  enemies: BurgerEnemy[]
  burgersDone: number
  lastMoveAt: number
  lastEnemyAt: number
  lastSpawnAt: number
  invulnUntil: number
  nextEnemyId: number
}

export type BurgerTimeState = {
  p1: BurgerTimeSideState
  p2: BurgerTimeSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

const LAYER_SCORE = [100, 140, 180, 220]
const BURGER_BONUS = 450

export function colToPct(col: number) {
  return ((col + 0.5) / COLS) * 100
}

export function rowToPct(row: number) {
  return 6 + ((row + 0.5) / ROWS) * 88
}

export function enemyGlyph(kind: BurgerEnemy['kind']) {
  if (kind === 'egg') return '🥚'
  if (kind === 'pickle') return '🥒'
  return '🌭'
}

export function partGlyph(layer: number) {
  return ['🍞', '🥬', '🥩', '🧀'][layer] ?? '🍔'
}

function isPlatform(row: number) {
  return (PLATFORM_ROWS as readonly number[]).includes(row)
}

function isLadder(col: number) {
  return (LADDER_COLS as readonly number[]).includes(col)
}

function createParts(): BurgerPart[] {
  const parts: BurgerPart[] = []
  let id = 1
  for (let layer = 0; layer < 4; layer++) {
    const row = PLATFORM_ROWS[layer]!
    for (const col of BURGER_COLS) {
      parts.push({ id: id++, col, row, layer, dropped: false })
    }
  }
  return parts
}

export function createSide(sideId: 1 | 2, now: number): BurgerTimeSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    col: 4,
    row: PLATFORM_ROWS[0]!,
    parts: createParts(),
    enemies: [],
    burgersDone: 0,
    lastMoveAt: 0,
    lastEnemyAt: now + 500,
    lastSpawnAt: now + 1200,
    invulnUntil: 0,
    nextEnemyId: 1,
  }
}

export function createBurgerTimeState(now: number): BurgerTimeState {
  return {
    p1: createSide(1, now),
    p2: createSide(2, now),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

function canStand(col: number, row: number) {
  return isPlatform(row) && col >= 0 && col < COLS
}

function dropPartAt(side: BurgerTimeSideState, col: number, row: number): BurgerTimeSideState {
  const hit = side.parts.find((p) => !p.dropped && p.col === col && p.row === row)
  if (!hit) return side

  let parts = side.parts.map((p) => (p.id === hit.id ? { ...p, dropped: true } : p))
  let score = side.score + (LAYER_SCORE[hit.layer] ?? 100)
  let burgersDone = side.burgersDone

  for (const bc of BURGER_COLS) {
    const before = side.parts.filter((p) => p.col === bc && !p.dropped).length
    const after = parts.filter((p) => p.col === bc && !p.dropped).length
    if (before > 0 && after === 0) {
      score += BURGER_BONUS
      burgersDone += 1
    }
  }

  if (parts.every((p) => p.dropped)) {
    parts = createParts()
  }

  return { ...side, parts, score, burgersDone }
}

function spawnEnemy(side: BurgerTimeSideState, rand: () => number): BurgerTimeSideState {
  if (side.enemies.length >= MAX_ENEMIES) return side
  const row = PLATFORM_ROWS[Math.floor(rand() * PLATFORM_ROWS.length)]!
  const kind: BurgerEnemy['kind'] = rand() > 0.8 ? 'egg' : rand() > 0.5 ? 'pickle' : 'hotdog'
  const enemy: BurgerEnemy = {
    id: side.nextEnemyId,
    col: Math.floor(rand() * COLS),
    row,
    kind,
    dir: rand() > 0.5 ? 1 : -1,
  }
  return { ...side, enemies: [...side.enemies, enemy], nextEnemyId: side.nextEnemyId + 1 }
}

export function tryMove(side: BurgerTimeSideState, dir: Dir, now: number): BurgerTimeSideState {
  if (side.lives <= 0 || now - side.lastMoveAt < MOVE_COOLDOWN_MS) return side

  let nc = side.col
  let nr = side.row

  if (dir === 'left') nc--
  if (dir === 'right') nc++
  if (dir === 'up' || dir === 'down') {
    if (!isLadder(side.col)) return side
    const idx = PLATFORM_ROWS.indexOf(side.row as (typeof PLATFORM_ROWS)[number])
    if (idx < 0) return side
    if (dir === 'up' && idx > 0) nr = PLATFORM_ROWS[idx - 1]!
    if (dir === 'down' && idx < PLATFORM_ROWS.length - 1) nr = PLATFORM_ROWS[idx + 1]!
  }

  if (!canStand(nc, nr)) return side

  let s = { ...side, col: nc, row: nr, lastMoveAt: now }
  s = dropPartAt(s, nc, nr)
  return s
}

function killPlayer(side: BurgerTimeSideState, now: number): BurgerTimeSideState {
  if (now < side.invulnUntil) return side
  const lives = side.lives - 1
  if (lives <= 0) return { ...side, lives: 0 }
  return {
    ...side,
    lives,
    col: 4,
    row: PLATFORM_ROWS[0]!,
    invulnUntil: now + INVULN_MS,
  }
}

export function tickSide(side: BurgerTimeSideState, dt: number, now: number, rand: () => number): BurgerTimeSideState {
  if (dt <= 0 || side.lives <= 0) return side

  let s = side

  if (now - s.lastSpawnAt >= ENEMY_SPAWN_MS) {
    s = spawnEnemy(s, rand)
    s = { ...s, lastSpawnAt: now }
  }

  if (now - s.lastEnemyAt >= ENEMY_MOVE_MS) {
    const enemies = s.enemies.map((e) => {
      let col = e.col + e.dir * 0.35
      let dir = e.dir
      if (col <= 0 || col >= COLS - 1) {
        dir = (dir * -1) as 1 | -1
        col = Math.max(0, Math.min(COLS - 1, col))
      }
      if (rand() > 0.92 && isLadder(col)) {
        const idx = PLATFORM_ROWS.indexOf(e.row as (typeof PLATFORM_ROWS)[number])
        if (idx >= 0) {
          const nr =
            rand() > 0.5 && idx > 0
              ? PLATFORM_ROWS[idx - 1]!
              : idx < PLATFORM_ROWS.length - 1
                ? PLATFORM_ROWS[idx + 1]!
                : e.row
          return { ...e, col: Math.round(col), row: nr, dir }
        }
      }
      return { ...e, col: Math.round(col), dir }
    })
    s = { ...s, enemies, lastEnemyAt: now }
  }

  for (const e of s.enemies) {
    if (e.row === s.row && Math.abs(e.col - s.col) < 1.1 && now >= s.invulnUntil) {
      s = killPlayer(s, now)
      break
    }
  }

  return s
}

export function legShouldEnd(g: BurgerTimeState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: BurgerTimeSideState, p2: BurgerTimeSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}
