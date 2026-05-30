export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 3600
export const LEG_DURATION_MS = 48_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const COLS = 5
export const MOVE_COOLDOWN_MS = 110
export const FIRE_COOLDOWN_MS = 260
export const INVULN_MS = 1400
export const VIEW_WORLD = 100
export const PLAYER_SCROLL_OFFSET = 9
export const SCROLL_SPEED = 0.038
export const ENEMY_SPEED = 0.052
export const BULLET_SPEED = 0.2
export const ENEMY_SPAWN_MS = 2100
export const HAZARD_SPAWN_MS = 4500
export const MAX_ENEMIES = 6
export const MAX_BULLETS = 8
export const MAX_HAZARDS = 4

export type Dir = 'left' | 'right'
export type EnemyKind = 'sedan' | 'bike' | 'truck'

export type ShEnemy = {
  id: number
  col: number
  worldY: number
  kind: EnemyKind
  hp: number
}

export type ShHazard = {
  id: number
  col: number
  worldY: number
}

export type ShBullet = {
  id: number
  col: number
  worldY: number
}

export type SpyHunterSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  playerCol: number
  scroll: number
  enemies: ShEnemy[]
  hazards: ShHazard[]
  bullets: ShBullet[]
  kills: number
  lastMoveAt: number
  lastFireAt: number
  lastEnemyAt: number
  lastHazardAt: number
  invulnUntil: number
  nextId: number
}

export type SpyHunterState = {
  p1: SpyHunterSideState
  p2: SpyHunterSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

const SCORE: Record<EnemyKind, number> = { sedan: 220, bike: 160, truck: 380 }

export function colToPct(col: number) {
  return ((col + 0.5) / COLS) * 100
}

export function worldToPct(worldY: number, scroll: number) {
  const rel = (worldY - scroll) / VIEW_WORLD
  return 6 + rel * 82
}

export function playerWorldY(scroll: number) {
  return scroll + PLAYER_SCROLL_OFFSET
}

export function enemyGlyph(kind: EnemyKind) {
  if (kind === 'truck') return '🚛'
  if (kind === 'bike') return '🏍️'
  return '🚗'
}

export function createSide(sideId: 1 | 2): SpyHunterSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    playerCol: 2,
    scroll: 0,
    enemies: [],
    hazards: [],
    bullets: [],
    kills: 0,
    lastMoveAt: 0,
    lastFireAt: 0,
    lastEnemyAt: 800,
    lastHazardAt: 2000,
    invulnUntil: 0,
    nextId: 1,
  }
}

export function createSpyHunterState(now: number): SpyHunterState {
  return {
    p1: createSide(1),
    p2: createSide(2),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

export function tryMove(side: SpyHunterSideState, dir: Dir, now: number): SpyHunterSideState {
  if (side.lives <= 0 || now - side.lastMoveAt < MOVE_COOLDOWN_MS) return side
  let col = side.playerCol
  if (dir === 'left') col--
  if (dir === 'right') col++
  col = Math.max(0, Math.min(COLS - 1, col))
  if (col === side.playerCol) return side
  return { ...side, playerCol: col, lastMoveAt: now }
}

export function tryFire(side: SpyHunterSideState, now: number): SpyHunterSideState {
  if (side.lives <= 0 || now - side.lastFireAt < FIRE_COOLDOWN_MS) return side
  if (side.bullets.length >= MAX_BULLETS) return side

  const bullet: ShBullet = {
    id: side.nextId,
    col: side.playerCol,
    worldY: playerWorldY(side.scroll) + 3,
  }

  return {
    ...side,
    bullets: [...side.bullets, bullet],
    nextId: side.nextId + 1,
    lastFireAt: now,
  }
}

function crash(side: SpyHunterSideState, now: number): SpyHunterSideState {
  if (now < side.invulnUntil) return side
  const lives = side.lives - 1
  return {
    ...side,
    lives: lives > 0 ? lives : 0,
    invulnUntil: now + INVULN_MS,
  }
}

function spawnEnemy(side: SpyHunterSideState, now: number, rand: () => number): SpyHunterSideState {
  if (side.enemies.length >= MAX_ENEMIES || now - side.lastEnemyAt < ENEMY_SPAWN_MS) return side
  const kinds: EnemyKind[] = ['sedan', 'bike', 'truck']
  const kind = kinds[Math.floor(rand() * kinds.length)]!
  const enemy: ShEnemy = {
    id: side.nextId,
    col: Math.floor(rand() * COLS),
    worldY: side.scroll + 82 + rand() * 15,
    kind,
    hp: kind === 'truck' ? 2 : 1,
  }
  return {
    ...side,
    enemies: [...side.enemies, enemy],
    nextId: side.nextId + 1,
    lastEnemyAt: now,
  }
}

function spawnHazard(side: SpyHunterSideState, now: number, rand: () => number): SpyHunterSideState {
  if (side.hazards.length >= MAX_HAZARDS || now - side.lastHazardAt < HAZARD_SPAWN_MS) return side
  const hazard: ShHazard = {
    id: side.nextId,
    col: Math.floor(rand() * COLS),
    worldY: side.scroll + 55 + rand() * 25,
  }
  return {
    ...side,
    hazards: [...side.hazards, hazard],
    nextId: side.nextId + 1,
    lastHazardAt: now,
  }
}

export function tickSide(
  side: SpyHunterSideState,
  dt: number,
  now: number,
  rand: () => number,
): SpyHunterSideState {
  if (dt <= 0 || side.lives <= 0) return side

  let s: SpyHunterSideState = {
    ...side,
    scroll: side.scroll + SCROLL_SPEED * dt,
  }

  s = spawnEnemy(s, now, rand)
  s = spawnHazard(s, now, rand)

  let enemies = s.enemies.map((e) => ({
    ...e,
    worldY: e.worldY - ENEMY_SPEED * dt,
  }))

  let bullets = s.bullets.map((b) => ({
    ...b,
    worldY: b.worldY + BULLET_SPEED * dt,
  }))

  const hitEnemyIds = new Set<number>()
  const hitBulletIds = new Set<number>()

  for (const b of bullets) {
    for (const e of enemies) {
      if (hitEnemyIds.has(e.id)) continue
      if (Math.abs(b.col - e.col) < 0.65 && Math.abs(b.worldY - e.worldY) < 5) {
        hitBulletIds.add(b.id)
        const hp = e.hp - 1
        if (hp <= 0) {
          hitEnemyIds.add(e.id)
          s = {
            ...s,
            score: s.score + SCORE[e.kind],
            kills: s.kills + 1,
          }
        } else {
          enemies = enemies.map((en) => (en.id === e.id ? { ...en, hp } : en))
        }
        break
      }
    }
  }

  enemies = enemies.filter((e) => !hitEnemyIds.has(e.id))
  bullets = bullets.filter((b) => !hitBulletIds.has(b.id) && b.worldY - s.scroll < VIEW_WORLD + 8)

  const py = playerWorldY(s.scroll)
  const invuln = now < s.invulnUntil

  if (!invuln) {
    for (const e of enemies) {
      if (Math.abs(e.col - s.playerCol) < 0.85 && Math.abs(e.worldY - py) < 4) {
        s = crash(s, now)
        break
      }
    }
    if (s.lives > 0 && now >= s.invulnUntil) {
      for (const h of s.hazards) {
        if (Math.abs(h.col - s.playerCol) < 0.85 && Math.abs(h.worldY - py) < 3.5) {
          s = crash(s, now)
          break
        }
      }
    }
  }

  const minY = s.scroll - 6
  s = {
    ...s,
    enemies: enemies.filter((e) => e.worldY > minY),
    hazards: s.hazards.filter((h) => h.worldY > minY),
    bullets: bullets.slice(-MAX_BULLETS),
  }

  return s
}

export function legShouldEnd(g: SpyHunterState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(
  p1: SpyHunterSideState,
  p2: SpyHunterSideState,
): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}
