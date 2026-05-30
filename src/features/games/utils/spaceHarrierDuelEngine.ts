export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 4000
export const LEG_DURATION_MS = 48_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const FIRE_COOLDOWN_MS = 180
export const BULLET_VZ = 0.11
export const ENEMY_VZ = 0.045
export const ENEMY_BULLET_VZ = 0.08
export const INVULN_MS = 1400
export const SPAWN_MS = 1400
export const MAX_ENEMIES = 10
export const MAX_BULLETS = 8
export const PLAYER_Z = 92
export const SCROLL_SPEED = 0.028

export type EnemyKind = 'drone' | 'jet' | 'pillar'

export type ShEnemy = {
  id: number
  kind: EnemyKind
  x: number
  z: number
  vx: number
  lastShotAt: number
}

export type ShBullet = { id: number; x: number; z: number }
export type ShEnemyBullet = { id: number; x: number; z: number }

export type SpaceHarrierSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  px: number
  py: number
  scroll: number
  enemies: ShEnemy[]
  bullets: ShBullet[]
  enemyBullets: ShEnemyBullet[]
  kills: number
  lastShotAt: number
  lastSpawnAt: number
  invulnUntil: number
  nextId: number
}

export type SpaceHarrierState = {
  p1: SpaceHarrierSideState
  p2: SpaceHarrierSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

const SCORE: Record<EnemyKind, number> = { drone: 180, jet: 320, pillar: 420 }
const KILL_DIST = 260

export function enemyGlyph(kind: EnemyKind) {
  if (kind === 'pillar') return '🗼'
  if (kind === 'jet') return '✈️'
  return '🛸'
}

/** Depth 0 = horizon, 100 = near player */
export function zToTop(z: number) {
  return 10 + (1 - z / 100) * 58
}

export function zToScale(z: number) {
  return 0.35 + (z / 100) * 0.85
}

export function clampPx(x: number) {
  return Math.max(10, Math.min(90, x))
}

export function clampPy(y: number) {
  return Math.max(58, Math.min(90, y))
}

export function createSide(sideId: 1 | 2, now: number): SpaceHarrierSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    px: 50,
    py: 82,
    scroll: 0,
    enemies: [],
    bullets: [],
    enemyBullets: [],
    kills: 0,
    lastShotAt: 0,
    lastSpawnAt: now + 600,
    invulnUntil: 0,
    nextId: 1,
  }
}

export function createSpaceHarrierState(now: number): SpaceHarrierState {
  return {
    p1: createSide(1, now),
    p2: createSide(2, now),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

export function movePlayer(side: SpaceHarrierSideState, px: number, py: number): SpaceHarrierSideState {
  return { ...side, px: clampPx(px), py: clampPy(py) }
}

export function tryShoot(side: SpaceHarrierSideState, now: number): SpaceHarrierSideState {
  if (side.lives <= 0 || now - side.lastShotAt < FIRE_COOLDOWN_MS) return side
  if (side.bullets.length >= MAX_BULLETS) return side
  const bullet: ShBullet = { id: side.nextId, x: side.px, z: PLAYER_Z - 4 }
  return {
    ...side,
    bullets: [...side.bullets, bullet],
    nextId: side.nextId + 1,
    lastShotAt: now,
  }
}

function spawnEnemy(side: SpaceHarrierSideState, now: number, rand: () => number): SpaceHarrierSideState {
  if (side.enemies.length >= MAX_ENEMIES || now - side.lastSpawnAt < SPAWN_MS) return side
  const kinds: EnemyKind[] = ['drone', 'drone', 'jet', 'pillar']
  const kind = kinds[Math.floor(rand() * kinds.length)]!
  const enemy: ShEnemy = {
    id: side.nextId,
    kind,
    x: 18 + rand() * 64,
    z: 4 + rand() * 14,
    vx: (rand() - 0.5) * 0.02,
    lastShotAt: now,
  }
  return {
    ...side,
    enemies: [...side.enemies, enemy],
    nextId: side.nextId + 1,
    lastSpawnAt: now,
  }
}

function hitRadius(kind: EnemyKind, z: number) {
  const base = kind === 'pillar' ? 7 : kind === 'jet' ? 5.5 : 4.5
  return base * zToScale(z)
}

function dist2(ax: number, az: number, bx: number, bz: number) {
  const dx = (ax - bx) * 0.85
  const dz = (az - bz) * 1.2
  return dx * dx + dz * dz
}

export function tickSide(
  side: SpaceHarrierSideState,
  dt: number,
  now: number,
  rand: () => number,
): SpaceHarrierSideState {
  if (dt <= 0) return side

  let s: SpaceHarrierSideState = {
    ...side,
    scroll: side.scroll + SCROLL_SPEED * dt,
  }

  s.bullets = s.bullets
    .map((b) => ({ ...b, z: b.z - BULLET_VZ * dt }))
    .filter((b) => b.z > 2)

  s.enemyBullets = s.enemyBullets
    .map((b) => ({ ...b, z: b.z + ENEMY_BULLET_VZ * dt }))
    .filter((b) => b.z < PLAYER_Z + 8)

  s.enemies = s.enemies
    .map((e) => ({
      ...e,
      x: clampPx(e.x + e.vx * dt),
      z: e.z + ENEMY_VZ * dt,
      vx: e.vx + (rand() - 0.5) * 0.0008 * dt,
    }))
    .filter((e) => e.z < PLAYER_Z + 6)

  const hitBullets = new Set<number>()
  const hitEnemies = new Set<number>()
  let scoreGain = 0

  for (const b of s.bullets) {
    for (const e of s.enemies) {
      if (hitEnemies.has(e.id)) continue
      const r = hitRadius(e.kind, e.z)
      if (dist2(b.x, b.z, e.x, e.z) < r * r) {
        hitBullets.add(b.id)
        hitEnemies.add(e.id)
        scoreGain += SCORE[e.kind]
        break
      }
    }
  }

  if (hitBullets.size > 0) s.bullets = s.bullets.filter((b) => !hitBullets.has(b.id))
  if (hitEnemies.size > 0) {
    s.enemies = s.enemies.filter((e) => !hitEnemies.has(e.id))
    s.score += scoreGain
    s.kills += hitEnemies.size
    if (s.kills > 0 && s.kills % 8 === 0) s.score += KILL_DIST
  }

  for (const e of s.enemies) {
    if (e.z > 55 && now - e.lastShotAt > 1200 + rand() * 800) {
      s.enemyBullets = [
        ...s.enemyBullets,
        { id: s.nextId, x: e.x, z: e.z + 2 },
      ]
      s.nextId += 1
      s.enemies = s.enemies.map((en) => (en.id === e.id ? { ...en, lastShotAt: now } : en))
    }
  }

  const invuln = now < s.invulnUntil
  if (!invuln && s.lives > 0) {
    for (const eb of s.enemyBullets) {
      if (dist2(eb.x, eb.z, s.px, PLAYER_Z) < 36) {
        s.lives -= 1
        s.invulnUntil = now + INVULN_MS
        s.enemyBullets = []
        break
      }
    }
  }

  if (s.lives > 0 && now >= s.invulnUntil) {
    for (const e of s.enemies) {
      if (e.z > 88 && dist2(e.x, e.z, s.px, PLAYER_Z) < hitRadius(e.kind, e.z) ** 2) {
        s.lives -= 1
        s.invulnUntil = now + INVULN_MS
        s.enemies = s.enemies.filter((en) => en.id !== e.id)
        break
      }
    }
  }

  s = spawnEnemy(s, now, rand)

  return s
}

export function legShouldEnd(g: SpaceHarrierState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(
  p1: SpaceHarrierSideState,
  p2: SpaceHarrierSideState,
): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  if (p1.kills > p2.kills) return 'p1'
  if (p2.kills > p1.kills) return 'p2'
  return 'draw'
}
