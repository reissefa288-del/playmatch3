export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 3800
export const LEG_DURATION_MS = 50_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const COLS = 11
export const ROWS = 9
export const MOVE_COOLDOWN_MS = 165
export const ENEMY_MOVE_MS = 360
export const MAX_ENEMIES = 5
export const INVULN_MS = 1300
export const TILE_WALL = 1
export const TILE_ICE = 2

export type Dir = 'up' | 'down' | 'left' | 'right'

export type PgEnemy = {
  id: number
  col: number
  row: number
  lastMoveAt: number
}

export type PengoSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  col: number
  row: number
  tiles: number[]
  enemies: PgEnemy[]
  crushes: number
  waves: number
  lastMoveAt: number
  invulnUntil: number
  nextId: number
}

export type PengoState = {
  p1: PengoSideState
  p2: PengoSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

const CRUSH_SCORE = 420
const WAVE_BONUS = 750
const PUSH_BONUS = 35

export function tileIndex(col: number, row: number) {
  return row * COLS + col
}

export function isFixedWall(col: number, row: number) {
  if (col <= 0 || row <= 0 || col >= COLS - 1 || row >= ROWS - 1) return true
  if (col % 2 === 0 && row % 2 === 0) return true
  return false
}

function isSpawnSafe(col: number, row: number) {
  return (
    (col <= 2 && row <= 2) ||
    (col >= COLS - 3 && row <= 2) ||
    (col <= 2 && row >= ROWS - 3) ||
    (col >= COLS - 3 && row >= ROWS - 3)
  )
}

export function createTiles(rand: () => number): number[] {
  const tiles: number[] = []
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (isFixedWall(col, row)) tiles.push(TILE_WALL)
      else if (isSpawnSafe(col, row)) tiles.push(0)
      else tiles.push(rand() > 0.28 ? TILE_ICE : 0)
    }
  }
  return tiles
}

function getTile(tiles: number[], col: number, row: number) {
  if (col < 0 || row < 0 || col >= COLS || row >= ROWS) return TILE_WALL
  return tiles[tileIndex(col, row)] ?? TILE_WALL
}

function setTile(tiles: number[], col: number, row: number, v: number) {
  const next = [...tiles]
  next[tileIndex(col, row)] = v
  return next
}

function enemyAt(enemies: PgEnemy[], col: number, row: number) {
  return enemies.some((e) => e.col === col && e.row === row)
}

export function offset(col: number, row: number, dir: Dir) {
  if (dir === 'up') return { col, row: row - 1 }
  if (dir === 'down') return { col, row: row + 1 }
  if (dir === 'left') return { col: col - 1, row }
  return { col: col + 1, row }
}

export function canWalkCell(tiles: number[], enemies: PgEnemy[], col: number, row: number) {
  const t = getTile(tiles, col, row)
  if (t !== 0) return false
  if (enemyAt(enemies, col, row)) return false
  return true
}

function spawnEnemies(side: PengoSideState, rand: () => number, count = 3): PengoSideState {
  let s = side
  for (let n = 0; n < count && s.enemies.length < MAX_ENEMIES; n++) {
    let col = 0
    let row = 0
    for (let i = 0; i < 24; i++) {
      col = 2 + Math.floor(rand() * (COLS - 4))
      row = 2 + Math.floor(rand() * (ROWS - 4))
      if (canWalkCell(s.tiles, s.enemies, col, row) && !(col === s.col && row === s.row)) break
    }
    const enemy: PgEnemy = { id: s.nextId, col, row, lastMoveAt: 0 }
    s = { ...s, enemies: [...s.enemies, enemy], nextId: s.nextId + 1 }
  }
  return s
}

export function createSide(sideId: 1 | 2, now: number, rand: () => number): PengoSideState {
  const startCol = sideId === 1 ? 1 : COLS - 2
  const startRow = sideId === 1 ? 1 : ROWS - 2
  let s: PengoSideState = {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    col: startCol,
    row: startRow,
    tiles: createTiles(rand),
    enemies: [],
    crushes: 0,
    waves: 0,
    lastMoveAt: now,
    invulnUntil: 0,
    nextId: 1,
  }
  return spawnEnemies(s, rand, 4)
}

export function createPengoState(now: number, rand: () => number): PengoState {
  return {
    p1: createSide(1, now, rand),
    p2: createSide(2, now, rand),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

function respawn(side: PengoSideState, now: number): PengoSideState {
  const lives = side.lives - 1
  if (lives <= 0) return { ...side, lives: 0 }
  const col = side.sideId === 1 ? 1 : COLS - 2
  const row = side.sideId === 1 ? 1 : ROWS - 2
  return { ...side, lives, col, row, invulnUntil: now + INVULN_MS }
}

export function tryMove(side: PengoSideState, dir: Dir, now: number): PengoSideState {
  if (side.lives <= 0 || now - side.lastMoveAt < MOVE_COOLDOWN_MS) return side

  const next = offset(side.col, side.row, dir)
  const tile = getTile(side.tiles, next.col, next.row)

  if (tile === TILE_WALL) return side

  if (tile === 0) {
    if (!canWalkCell(side.tiles, side.enemies, next.col, next.row)) return side
    return { ...side, col: next.col, row: next.row, lastMoveAt: now }
  }

  if (tile !== TILE_ICE) return side

  const beyond = offset(next.col, next.row, dir)
  const beyondTile = getTile(side.tiles, beyond.col, beyond.row)
  if (beyondTile === TILE_WALL || beyondTile === TILE_ICE) return side

  let tiles = setTile(side.tiles, next.col, next.row, 0)
  tiles = setTile(tiles, beyond.col, beyond.row, TILE_ICE)

  let enemies = side.enemies
  let score = side.score + PUSH_BONUS
  let crushes = side.crushes

  const crushed = enemies.filter((e) => e.col === beyond.col && e.row === beyond.row)
  if (crushed.length > 0) {
    enemies = enemies.filter((e) => e.col !== beyond.col || e.row !== beyond.row)
    score += CRUSH_SCORE * crushed.length
    crushes += crushed.length
  }

  let s: PengoSideState = {
    ...side,
    col: next.col,
    row: next.row,
    tiles,
    enemies,
    score,
    crushes,
    lastMoveAt: now,
  }

  if (s.enemies.length === 0) {
    s = { ...s, score: s.score + WAVE_BONUS, waves: s.waves + 1 }
    s = spawnEnemies(s, () => Math.random(), 4)
  }

  return s
}

function moveEnemy(side: PengoSideState, enemy: PgEnemy, now: number, rand: () => number): PgEnemy {
  if (now - enemy.lastMoveAt < ENEMY_MOVE_MS) return enemy
  const dirs: Dir[] = ['up', 'down', 'left', 'right']
  const options = dirs
    .map((dir) => offset(enemy.col, enemy.row, dir))
    .filter(({ col, row }) => canWalkCell(side.tiles, side.enemies, col, row))

  if (options.length === 0) return { ...enemy, lastMoveAt: now }
  const pick = options[Math.floor(rand() * options.length)]!
  return { ...enemy, col: pick.col, row: pick.row, lastMoveAt: now }
}

export function tickSide(side: PengoSideState, now: number, rand: () => number): PengoSideState {
  if (side.lives <= 0) return side

  let s: PengoSideState = {
    ...side,
    enemies: side.enemies.map((e) => moveEnemy(side, e, now, rand)),
  }

  if (now >= s.invulnUntil) {
    for (const e of s.enemies) {
      if (e.col === s.col && e.row === s.row) {
        s = respawn(s, now)
        break
      }
    }
  }

  return s
}

export function enemiesLeft(side: PengoSideState) {
  return side.enemies.length
}

export function legShouldEnd(g: PengoState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: PengoSideState, p2: PengoSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  if (p1.crushes > p2.crushes) return 'p1'
  if (p2.crushes > p1.crushes) return 'p2'
  return 'draw'
}
