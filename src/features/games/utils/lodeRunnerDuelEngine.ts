export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 4000
export const LEG_DURATION_MS = 52_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const COLS = 13
export const ROWS = 11
export const MOVE_COOLDOWN_MS = 150
export const DIG_COOLDOWN_MS = 420
export const ENEMY_MOVE_MS = 340
export const HOLE_REFILL_MS = 2800
export const GRAVITY_MS = 95
export const MAX_ENEMIES = 4
export const INVULN_MS = 1300
export const TILE_EMPTY = 0
export const TILE_BRICK = 1
export const TILE_SOLID = 2
export const TILE_LADDER = 3
export const TILE_HOLE = 4

export type Dir = 'up' | 'down' | 'left' | 'right'
export type DigDir = 'left' | 'right'

export type LrEnemy = {
  id: number
  col: number
  row: number
  trappedUntil: number
  lastMoveAt: number
}

export type LodeRunnerSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  col: number
  row: number
  tiles: number[]
  gold: number[]
  enemies: LrEnemy[]
  goldCollected: number
  traps: number
  lastMoveAt: number
  lastDigAt: number
  lastFallAt: number
  invulnUntil: number
  nextId: number
}

export type LodeRunnerState = {
  p1: LodeRunnerSideState
  p2: LodeRunnerSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

const GOLD_SCORE = 320
const TRAP_SCORE = 480
const DIG_SCORE = 25
const CLEAR_BONUS = 900

export function tileIndex(col: number, row: number) {
  return row * COLS + col
}

export function offset(col: number, row: number, dir: Dir) {
  if (dir === 'up') return { col, row: row - 1 }
  if (dir === 'down') return { col, row: row + 1 }
  if (dir === 'left') return { col: col - 1, row }
  return { col: col + 1, row }
}

function getTile(tiles: number[], col: number, row: number) {
  if (col < 0 || row < 0 || col >= COLS || row >= ROWS) return TILE_SOLID
  return tiles[tileIndex(col, row)] ?? TILE_SOLID
}

function setTile(tiles: number[], col: number, row: number, v: number) {
  const next = [...tiles]
  next[tileIndex(col, row)] = v
  return next
}

function isOccupiable(t: number) {
  return t === TILE_EMPTY || t === TILE_LADDER || t === TILE_HOLE
}

function isSupport(t: number) {
  return t === TILE_BRICK || t === TILE_SOLID || t === TILE_LADDER
}

function enemyAt(enemies: LrEnemy[], col: number, row: number, now: number) {
  return enemies.some((e) => e.col === col && e.row === row && now >= e.trappedUntil)
}

export function createTiles(rand: () => number): number[] {
  const tiles: number[] = []
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (row === 0 || row === ROWS - 1 || col === 0 || col === COLS - 1) {
        tiles.push(TILE_SOLID)
      } else if (row % 2 === 0) {
        tiles.push(rand() > 0.12 ? TILE_BRICK : TILE_EMPTY)
      } else if (col % 4 === 2) {
        tiles.push(TILE_LADDER)
      } else {
        tiles.push(TILE_EMPTY)
      }
    }
  }
  return tiles
}

function goldOnTiles(tiles: number[], rand: () => number): number[] {
  const gold: number[] = []
  for (let row = 1; row < ROWS - 1; row++) {
    for (let col = 1; col < COLS - 1; col++) {
      const i = tileIndex(col, row)
      if (tiles[i] === TILE_BRICK && getTile(tiles, col, row - 1) === TILE_EMPTY && rand() > 0.62) {
        gold.push(tileIndex(col, row - 1))
      }
    }
  }
  return gold
}

function spawnEnemies(side: LodeRunnerSideState, rand: () => number, count = 3): LodeRunnerSideState {
  let s = side
  for (let n = 0; n < count && s.enemies.length < MAX_ENEMIES; n++) {
    let col = 0
    let row = 0
    for (let i = 0; i < 30; i++) {
      col = 2 + Math.floor(rand() * (COLS - 4))
      row = 1 + Math.floor(rand() * (ROWS - 3))
      const t = getTile(s.tiles, col, row)
      if (isOccupiable(t) && isSupport(getTile(s.tiles, col, row + 1)) && !(col === s.col && row === s.row)) break
    }
    const enemy: LrEnemy = { id: s.nextId, col, row, trappedUntil: 0, lastMoveAt: 0 }
    s = { ...s, enemies: [...s.enemies, enemy], nextId: s.nextId + 1 }
  }
  return s
}

function findStart(tiles: number[], sideId: 1 | 2) {
  const preferCol = sideId === 1 ? 2 : COLS - 3
  for (let row = ROWS - 2; row >= 1; row--) {
    for (const col of [preferCol, preferCol + 1, preferCol - 1, 2, COLS - 3]) {
      if (col < 1 || col >= COLS - 1) continue
      if (isOccupiable(getTile(tiles, col, row)) && isSupport(getTile(tiles, col, row + 1))) {
        return { col, row }
      }
    }
  }
  return { col: 2, row: ROWS - 2 }
}

export function createSide(sideId: 1 | 2, now: number, rand: () => number): LodeRunnerSideState {
  const tiles = createTiles(rand)
  const start = findStart(tiles, sideId)
  let s: LodeRunnerSideState = {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    col: start.col,
    row: start.row,
    tiles,
    gold: goldOnTiles(tiles, rand),
    enemies: [],
    goldCollected: 0,
    traps: 0,
    lastMoveAt: now,
    lastDigAt: -99999,
    lastFallAt: now,
    invulnUntil: 0,
    nextId: 1,
  }
  return spawnEnemies(s, rand, 3)
}

export function createLodeRunnerState(now: number, rand: () => number): LodeRunnerState {
  return {
    p1: createSide(1, now, rand),
    p2: createSide(2, now, rand),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

function respawn(side: LodeRunnerSideState, now: number): LodeRunnerSideState {
  const lives = side.lives - 1
  if (lives <= 0) return { ...side, lives: 0 }
  const start = findStart(side.tiles, side.sideId)
  return { ...side, lives, col: start.col, row: start.row, invulnUntil: now + INVULN_MS }
}

function collectGold(side: LodeRunnerSideState, col: number, row: number) {
  const i = tileIndex(col, row)
  if (!side.gold.includes(i)) return side
  return {
    ...side,
    gold: side.gold.filter((g) => g !== i),
    goldCollected: side.goldCollected + 1,
    score: side.score + GOLD_SCORE,
  }
}

function canEnter(side: LodeRunnerSideState, col: number, row: number, now: number) {
  const t = getTile(side.tiles, col, row)
  if (!isOccupiable(t)) return false
  if (enemyAt(side.enemies, col, row, now)) return false
  if (t === TILE_LADDER) return true
  return isSupport(getTile(side.tiles, col, row + 1))
}

export function tryMove(side: LodeRunnerSideState, dir: Dir, now: number): LodeRunnerSideState {
  if (side.lives <= 0 || now - side.lastMoveAt < MOVE_COOLDOWN_MS) return side

  const next = offset(side.col, side.row, dir)
  const curTile = getTile(side.tiles, side.col, side.row)
  const nextTile = getTile(side.tiles, next.col, next.row)

  if (dir === 'up' || dir === 'down') {
    if (curTile !== TILE_LADDER && nextTile !== TILE_LADDER) return side
    if (!isOccupiable(nextTile)) return side
    if (enemyAt(side.enemies, next.col, next.row, now)) return side
    let s = { ...side, col: next.col, row: next.row, lastMoveAt: now }
    s = collectGold(s, next.col, next.row)
    return s
  }

  if (!canEnter(side, next.col, next.row, now)) return side
  let s = { ...side, col: next.col, row: next.row, lastMoveAt: now }
  s = collectGold(s, next.col, next.row)
  return s
}

export function tryDig(side: LodeRunnerSideState, digDir: DigDir, now: number): LodeRunnerSideState {
  if (side.lives <= 0 || now - side.lastDigAt < DIG_COOLDOWN_MS) return side

  const below = getTile(side.tiles, side.col, side.row + 1)
  if (!isSupport(below) || below === TILE_LADDER) return side

  const targetCol = digDir === 'left' ? side.col - 1 : side.col + 1
  const targetRow = side.row + 1
  if (getTile(side.tiles, targetCol, targetRow) !== TILE_BRICK) return side

  let tiles = setTile(side.tiles, targetCol, targetRow, TILE_HOLE)
  const goldIdx = tileIndex(targetCol, targetRow - 1)
  let gold = side.gold
  if (gold.includes(goldIdx)) gold = gold.filter((g) => g !== goldIdx)

  return {
    ...side,
    tiles,
    gold,
    score: side.score + DIG_SCORE,
    lastDigAt: now,
  }
}

function applyGravityEntity(
  side: LodeRunnerSideState,
  col: number,
  row: number,
  now: number,
): { col: number; row: number; trappedUntil: number } {
  let c = col
  let r = row
  let trappedUntil = 0

  while (true) {
    const below = getTile(side.tiles, c, r + 1)
    if (isSupport(below)) break
    if (below === TILE_HOLE) {
      trappedUntil = now + HOLE_REFILL_MS
      r += 1
      break
    }
    if (getTile(side.tiles, c, r) === TILE_LADDER && below === TILE_LADDER) {
      r += 1
      continue
    }
    if (!isOccupiable(below) && below !== TILE_HOLE) break
    r += 1
    if (r >= ROWS - 1) break
  }

  return { col: c, row: r, trappedUntil }
}

function refillHoles(side: LodeRunnerSideState, now: number): LodeRunnerSideState {
  let tiles = side.tiles
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (getTile(tiles, col, row) !== TILE_HOLE) continue
      const hasTrapped = side.enemies.some(
        (e) => e.col === col && e.row === row && now < e.trappedUntil,
      )
      if (hasTrapped) continue
      tiles = setTile(tiles, col, row, TILE_BRICK)
    }
  }
  return { ...side, tiles }
}

function moveEnemy(side: LodeRunnerSideState, enemy: LrEnemy, now: number, rand: () => number): LrEnemy {
  if (now < enemy.trappedUntil) return enemy
  if (now - enemy.lastMoveAt < ENEMY_MOVE_MS) return enemy

  const dirs: Dir[] = []
  if (enemy.col < side.col) dirs.push('right')
  if (enemy.col > side.col) dirs.push('left')
  if (enemy.row > side.row) dirs.push('up')
  if (enemy.row < side.row) dirs.push('down')
  dirs.push('left', 'right', 'up', 'down')

  for (const dir of dirs) {
    const next = offset(enemy.col, enemy.row, dir)
    if (!canEnter({ ...side, enemies: side.enemies.filter((e) => e.id !== enemy.id) }, next.col, next.row, now)) {
      continue
    }
    if (Math.random() > 0.35 && dir !== dirs[0]) continue
    return { ...enemy, col: next.col, row: next.row, lastMoveAt: now }
  }

  const options = (['left', 'right', 'up', 'down'] as Dir[])
    .map((dir) => offset(enemy.col, enemy.row, dir))
    .filter(({ col, row }) =>
      canEnter({ ...side, enemies: side.enemies.filter((e) => e.id !== enemy.id) }, col, row, now),
    )
  if (options.length === 0) return { ...enemy, lastMoveAt: now }
  const pick = options[Math.floor(rand() * options.length)]!
  return { ...enemy, col: pick.col, row: pick.row, lastMoveAt: now }
}

export function tickSide(side: LodeRunnerSideState, now: number, rand: () => number): LodeRunnerSideState {
  if (side.lives <= 0) return side

  const hadGold = side.gold.length > 0
  let s = refillHoles(side, now)

  if (now - s.lastFallAt >= GRAVITY_MS) {
    if (s.lives > 0) {
      const fallen = applyGravityEntity(s, s.col, s.row, now)
      if (fallen.row !== s.row || fallen.col !== s.col) {
        s = collectGold({ ...s, col: fallen.col, row: fallen.row, lastFallAt: now }, fallen.col, fallen.row)
      } else {
        s = { ...s, lastFallAt: now }
      }
    }

    let score = s.score
    let traps = s.traps
    const enemies = s.enemies.map((e) => {
      const g = applyGravityEntity(s, e.col, e.row, now)
      let trappedUntil = e.trappedUntil
      const justTrapped = g.trappedUntil > 0 && trappedUntil === 0
      if (g.trappedUntil > 0) trappedUntil = g.trappedUntil
      if (justTrapped) {
        score += TRAP_SCORE
        traps += 1
      }
      return { ...e, col: g.col, row: g.row, trappedUntil }
    })
    s = { ...s, enemies, score, traps }
  }

  s = {
    ...s,
    enemies: s.enemies.map((e) => moveEnemy(s, e, now, rand)),
  }

  if (now >= s.invulnUntil) {
    for (const e of s.enemies) {
      if (now >= e.trappedUntil && e.col === s.col && e.row === s.row) {
        s = respawn(s, now)
        break
      }
    }
  }

  if (hadGold && s.gold.length === 0) {
    s = { ...s, score: s.score + CLEAR_BONUS, gold: goldOnTiles(s.tiles, rand) }
    s = spawnEnemies(s, rand, 2)
  }

  return s
}

export function goldLeft(side: LodeRunnerSideState) {
  return side.gold.length
}

export function legShouldEnd(g: LodeRunnerState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: LodeRunnerSideState, p2: LodeRunnerSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  if (p1.goldCollected > p2.goldCollected) return 'p1'
  if (p2.goldCollected > p1.goldCollected) return 'p2'
  return 'draw'
}
