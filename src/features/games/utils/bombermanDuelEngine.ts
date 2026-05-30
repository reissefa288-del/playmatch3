export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 4000
export const LEG_DURATION_MS = 52_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const COLS = 11
export const ROWS = 9
export const MOVE_COOLDOWN_MS = 170
export const BOMB_COOLDOWN_MS = 450
export const BOMB_FUSE_MS = 2200
export const BLAST_MS = 520
export const BLAST_RANGE = 2
export const MAX_BOMBS = 2
export const INVULN_MS = 1400
export const ENEMY_MOVE_MS = 380
export const MAX_ENEMIES = 4
export const TILE_HARD = 1
export const TILE_SOFT = 2

export type Dir = 'up' | 'down' | 'left' | 'right'

export type BmEnemy = {
  id: number
  col: number
  row: number
  lastMoveAt: number
}

export type BmBomb = {
  id: number
  col: number
  row: number
  plantedAt: number
  range: number
}

export type BmBlast = {
  id: number
  cells: { col: number; row: number }[]
  until: number
}

export type BombermanSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  col: number
  row: number
  tiles: number[]
  enemies: BmEnemy[]
  bombs: BmBomb[]
  blasts: BmBlast[]
  blocksBroken: number
  lastMoveAt: number
  lastBombAt: number
  invulnUntil: number
  nextId: number
}

export type BombermanState = {
  p1: BombermanSideState
  p2: BombermanSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

const BLOCK_SCORE = 90
const ENEMY_SCORE = 320
const CLEAR_BONUS = 900

export function tileIndex(col: number, row: number) {
  return row * COLS + col
}

export function isHardWall(col: number, row: number) {
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
      if (isHardWall(col, row)) tiles.push(TILE_HARD)
      else if (isSpawnSafe(col, row)) tiles.push(0)
      else tiles.push(rand() > 0.42 ? TILE_SOFT : 0)
    }
  }
  return tiles
}

function getTile(tiles: number[], col: number, row: number) {
  if (col < 0 || row < 0 || col >= COLS || row >= ROWS) return TILE_HARD
  return tiles[tileIndex(col, row)] ?? TILE_HARD
}

function setTile(tiles: number[], col: number, row: number, v: number) {
  const i = tileIndex(col, row)
  const next = [...tiles]
  next[i] = v
  return next
}

function bombAt(bombs: BmBomb[], col: number, row: number) {
  return bombs.some((b) => b.col === col && b.row === row)
}

function blastAt(blasts: BmBlast[], col: number, row: number, now: number) {
  return blasts.some((b) => now < b.until && b.cells.some((c) => c.col === col && c.row === row))
}

function enemyAt(enemies: BmEnemy[], col: number, row: number) {
  return enemies.some((e) => e.col === col && e.row === row)
}

export function canWalk(
  tiles: number[],
  bombs: BmBomb[],
  blasts: BmBlast[],
  enemies: BmEnemy[],
  col: number,
  row: number,
  now: number,
  ignoreBlast = false,
) {
  const t = getTile(tiles, col, row)
  if (t === TILE_HARD || t === TILE_SOFT) return false
  if (bombAt(bombs, col, row)) return false
  if (!ignoreBlast && blastAt(blasts, col, row, now)) return false
  if (enemyAt(enemies, col, row)) return false
  return true
}

function blastCells(tiles: number[], col: number, row: number, range: number) {
  const cells = [{ col, row }]
  const dirs: Dir[] = ['up', 'down', 'left', 'right']
  for (const dir of dirs) {
    for (let i = 1; i <= range; i++) {
      let nc = col
      let nr = row
      if (dir === 'up') nr -= i
      if (dir === 'down') nr += i
      if (dir === 'left') nc -= i
      if (dir === 'right') nc += i
      const t = getTile(tiles, nc, nr)
      if (t === TILE_HARD) break
      cells.push({ col: nc, row: nr })
      if (t === TILE_SOFT) break
    }
  }
  return cells
}

function spawnEnemies(side: BombermanSideState, rand: () => number): BombermanSideState {
  if (side.enemies.length >= MAX_ENEMIES) return side
  let col = 0
  let row = 0
  for (let i = 0; i < 20; i++) {
    col = 2 + Math.floor(rand() * (COLS - 4))
    row = 2 + Math.floor(rand() * (ROWS - 4))
    if (canWalk(side.tiles, side.bombs, side.blasts, side.enemies, col, row, 0, true)) break
  }
  const enemy: BmEnemy = { id: side.nextId, col, row, lastMoveAt: 0 }
  return { ...side, enemies: [...side.enemies, enemy], nextId: side.nextId + 1 }
}

export function createSide(sideId: 1 | 2, now: number, rand: () => number): BombermanSideState {
  const startCol = sideId === 1 ? 1 : COLS - 2
  const startRow = sideId === 1 ? 1 : ROWS - 2
  let s: BombermanSideState = {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    col: startCol,
    row: startRow,
    tiles: createTiles(rand),
    enemies: [],
    bombs: [],
    blasts: [],
    blocksBroken: 0,
    lastMoveAt: now,
    lastBombAt: -99999,
    invulnUntil: 0,
    nextId: 1,
  }
  for (let i = 0; i < 3; i++) s = spawnEnemies(s, rand)
  return s
}

export function createBombermanState(now: number, rand: () => number): BombermanState {
  return {
    p1: createSide(1, now, rand),
    p2: createSide(2, now, rand),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

function respawn(side: BombermanSideState, now: number): BombermanSideState {
  const lives = side.lives - 1
  if (lives <= 0) return { ...side, lives: 0 }
  const col = side.sideId === 1 ? 1 : COLS - 2
  const row = side.sideId === 1 ? 1 : ROWS - 2
  return { ...side, lives, col, row, invulnUntil: now + INVULN_MS }
}

export function tryMove(side: BombermanSideState, dir: Dir, now: number): BombermanSideState {
  if (side.lives <= 0 || now - side.lastMoveAt < MOVE_COOLDOWN_MS) return side
  let col = side.col
  let row = side.row
  if (dir === 'up') row--
  if (dir === 'down') row++
  if (dir === 'left') col--
  if (dir === 'right') col++
  if (!canWalk(side.tiles, side.bombs, side.blasts, side.enemies, col, row, now)) return side
  return { ...side, col, row, lastMoveAt: now }
}

export function tryBomb(side: BombermanSideState, now: number): BombermanSideState {
  if (side.lives <= 0 || now - side.lastBombAt < BOMB_COOLDOWN_MS) return side
  if (side.bombs.length >= MAX_BOMBS) return side
  if (bombAt(side.bombs, side.col, side.row)) return side
  const bomb: BmBomb = {
    id: side.nextId,
    col: side.col,
    row: side.row,
    plantedAt: now,
    range: BLAST_RANGE,
  }
  return { ...side, bombs: [...side.bombs, bomb], nextId: side.nextId + 1, lastBombAt: now }
}

function applyBlast(side: BombermanSideState, cells: { col: number; row: number }[], now: number): BombermanSideState {
  let s = side
  let score = s.score
  let blocksBroken = s.blocksBroken
  let tiles = s.tiles

  for (const { col, row } of cells) {
    const t = getTile(tiles, col, row)
    if (t === TILE_SOFT) {
      tiles = setTile(tiles, col, row, 0)
      score += BLOCK_SCORE
      blocksBroken += 1
    }
    const killed = s.enemies.filter((e) => e.col === col && e.row === row)
    if (killed.length > 0) {
      score += ENEMY_SCORE * killed.length
      s = { ...s, enemies: s.enemies.filter((e) => e.col !== col || e.row !== row) }
    }
  }

  if (!tiles.some((t) => t === TILE_SOFT) && side.tiles.some((t) => t === TILE_SOFT)) {
    score += CLEAR_BONUS
  }

  s = { ...s, tiles, score, blocksBroken }

  if (now >= s.invulnUntil) {
    for (const { col, row } of cells) {
      if (col === s.col && row === s.row) {
        s = respawn(s, now)
        break
      }
    }
  }

  return s
}

function moveEnemy(side: BombermanSideState, enemy: BmEnemy, now: number, rand: () => number): BmEnemy {
  if (now - enemy.lastMoveAt < ENEMY_MOVE_MS) return enemy
  const dirs: Dir[] = ['up', 'down', 'left', 'right']
  const options = dirs
    .map((dir) => {
      let col = enemy.col
      let row = enemy.row
      if (dir === 'up') row--
      if (dir === 'down') row++
      if (dir === 'left') col--
      if (dir === 'right') col++
      return { dir, col, row }
    })
    .filter(({ col, row }) => canWalk(side.tiles, side.bombs, side.blasts, side.enemies, col, row, now, true))

  if (options.length === 0) return { ...enemy, lastMoveAt: now }
  const pick = options[Math.floor(rand() * options.length)]!
  return { ...enemy, col: pick.col, row: pick.row, lastMoveAt: now }
}

export function tickSide(side: BombermanSideState, now: number, rand: () => number): BombermanSideState {
  if (side.lives <= 0) return side

  let s = side

  s = {
    ...s,
    blasts: s.blasts.filter((b) => now < b.until),
  }

  const detonated: BmBomb[] = []
  const remain: BmBomb[] = []
  for (const b of s.bombs) {
    if (now - b.plantedAt >= BOMB_FUSE_MS) detonated.push(b)
    else remain.push(b)
  }

  if (detonated.length > 0) {
    let cells: { col: number; row: number }[] = []
    for (const b of detonated) {
      cells = [...cells, ...blastCells(s.tiles, b.col, b.row, b.range)]
    }
    const uniq = cells.filter(
      (c, i, arr) => arr.findIndex((x) => x.col === c.col && x.row === c.row) === i,
    )
    s = applyBlast({ ...s, bombs: remain }, uniq, now)
    s = {
      ...s,
      blasts: [...s.blasts, { id: s.nextId, cells: uniq, until: now + BLAST_MS }],
      nextId: s.nextId + 1,
    }
  } else {
    s = { ...s, bombs: remain }
  }

  s = {
    ...s,
    enemies: s.enemies.map((e) => moveEnemy(s, e, now, rand)),
  }

  if (now >= s.invulnUntil) {
    for (const e of s.enemies) {
      if (e.col === s.col && e.row === s.row) {
        s = respawn(s, now)
        break
      }
    }
  }

  if (s.enemies.length < MAX_ENEMIES && rand() > 0.996) {
    s = spawnEnemies(s, rand)
  }

  return s
}

export function softBlocksLeft(tiles: number[]) {
  return tiles.filter((t) => t === TILE_SOFT).length
}

export function legShouldEnd(g: BombermanState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: BombermanSideState, p2: BombermanSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}
