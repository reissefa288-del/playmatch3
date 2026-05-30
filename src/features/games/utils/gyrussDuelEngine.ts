export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 4000
export const LEG_DURATION_MS = 46_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const ORBIT_ROT_STEP = 0.14
export const ORBIT_COOLDOWN_MS = 70
export const FIRE_COOLDOWN_MS = 200
export const BULLET_SPEED = 0.17
export const INVULN_MS = 1400
export const SPAWN_MS = 1900
export const MAX_ENEMIES = 10
export const MAX_BULLETS = 8
export const HIT_R = 4.2
export const CX = 50
export const CY = 50
export const ORBIT_R = 38

export type OrbitDir = 'left' | 'right'
export type EnemyKind = 'drone' | 'hornet' | 'planet'

export type GyrussBullet = { id: number; x: number; y: number; vx: number; vy: number }
export type GyrussEnemy = {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  kind: EnemyKind
  hp: number
}

export type GyrussSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  angle: number
  tunnelPhase: number
  bullets: GyrussBullet[]
  enemies: GyrussEnemy[]
  lastOrbitAt: number
  lastFireAt: number
  lastSpawnAt: number
  invulnUntil: number
  nextBulletId: number
  nextEnemyId: number
}

export type GyrussState = {
  p1: GyrussSideState
  p2: GyrussSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

const SCORE: Record<EnemyKind, number> = { drone: 140, hornet: 260, planet: 480 }

export function shipPosition(angle: number) {
  return {
    px: CX + Math.cos(angle) * ORBIT_R,
    py: CY + Math.sin(angle) * ORBIT_R,
  }
}

export function enemyGlyph(kind: EnemyKind) {
  if (kind === 'planet') return '◉'
  if (kind === 'hornet') return '✦'
  return '·'
}

export function createSide(sideId: 1 | 2, now: number): GyrussSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    angle: -Math.PI / 2,
    tunnelPhase: 0,
    bullets: [],
    enemies: [],
    lastOrbitAt: 0,
    lastFireAt: 0,
    lastSpawnAt: now + 1000,
    invulnUntil: 0,
    nextBulletId: 1,
    nextEnemyId: 1,
  }
}

export function createGyrussState(now: number): GyrussState {
  return {
    p1: createSide(1, now),
    p2: createSide(2, now),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by)
}

function spawnEnemy(side: GyrussSideState, rand: () => number): GyrussSideState {
  if (side.enemies.length >= MAX_ENEMIES) return side
  const a = rand() * Math.PI * 2
  const r = 4 + rand() * 8
  const x = CX + Math.cos(a) * r
  const y = CY + Math.sin(a) * r
  const speed = 0.038 + rand() * 0.02
  const kind: EnemyKind = rand() > 0.9 ? 'planet' : rand() > 0.6 ? 'hornet' : 'drone'
  const hp = kind === 'planet' ? 2 : 1
  const enemy: GyrussEnemy = {
    id: side.nextEnemyId,
    x,
    y,
    vx: Math.cos(a) * speed,
    vy: Math.sin(a) * speed,
    kind,
    hp,
  }
  return { ...side, enemies: [...side.enemies, enemy], nextEnemyId: side.nextEnemyId + 1 }
}

export function tryOrbit(side: GyrussSideState, dir: OrbitDir, now: number): GyrussSideState {
  if (side.lives <= 0 || now - side.lastOrbitAt < ORBIT_COOLDOWN_MS) return side
  const delta = dir === 'right' ? ORBIT_ROT_STEP : -ORBIT_ROT_STEP
  return { ...side, angle: side.angle + delta, lastOrbitAt: now }
}

export function setAngleFromPointer(
  side: GyrussSideState,
  clientX: number,
  clientY: number,
  rect: DOMRect,
  now: number,
): GyrussSideState {
  if (side.lives <= 0) return side
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const angle = Math.atan2(clientY - cy, clientX - cx)
  return { ...side, angle, lastOrbitAt: now }
}

export function tryFire(side: GyrussSideState, now: number): GyrussSideState {
  if (side.lives <= 0 || side.bullets.length >= MAX_BULLETS) return side
  if (now - side.lastFireAt < FIRE_COOLDOWN_MS) return side
  const { px, py } = shipPosition(side.angle)
  const d = dist(px, py, CX, CY) || 0.01
  const vx = ((CX - px) / d) * BULLET_SPEED
  const vy = ((CY - py) / d) * BULLET_SPEED
  const bullet: GyrussBullet = {
    id: side.nextBulletId,
    x: px,
    y: py,
    vx,
    vy,
  }
  return {
    ...side,
    bullets: [...side.bullets, bullet],
    nextBulletId: side.nextBulletId + 1,
    lastFireAt: now,
  }
}

function killPlayer(side: GyrussSideState, now: number): GyrussSideState {
  if (now < side.invulnUntil) return side
  const lives = side.lives - 1
  if (lives <= 0) return { ...side, lives: 0, bullets: [] }
  return {
    ...side,
    lives,
    bullets: [],
    invulnUntil: now + INVULN_MS,
    angle: -Math.PI / 2,
  }
}

export function tickSide(side: GyrussSideState, dt: number, now: number, rand: () => number): GyrussSideState {
  if (dt <= 0 || side.lives <= 0) return side

  let s = { ...side, tunnelPhase: side.tunnelPhase + dt * 0.003 }

  if (now - s.lastSpawnAt >= SPAWN_MS) {
    s = spawnEnemy(s, rand)
    s = { ...s, lastSpawnAt: now }
  }

  let enemies = s.enemies.map((e) => ({
    ...e,
    x: e.x + e.vx * dt,
    y: e.y + e.vy * dt,
  }))
  enemies = enemies.filter((e) => e.x > 2 && e.x < 98 && e.y > 2 && e.y < 98)

  let bullets = s.bullets.map((b) => ({
    ...b,
    x: b.x + b.vx * dt,
    y: b.y + b.vy * dt,
  }))
  bullets = bullets.filter((b) => b.x > 0 && b.x < 100 && b.y > 0 && b.y < 100)

  const { px, py } = shipPosition(s.angle)
  let score = s.score
  const deadEnemies = new Set<number>()
  const deadBullets = new Set<number>()

  for (const b of bullets) {
    for (const e of enemies) {
      if (deadEnemies.has(e.id)) continue
      const r = e.kind === 'planet' ? HIT_R + 1.5 : HIT_R
      if (dist(b.x, b.y, e.x, e.y) < r) {
        deadBullets.add(b.id)
        const hp = e.hp - 1
        if (hp <= 0) {
          deadEnemies.add(e.id)
          score += SCORE[e.kind]
        } else {
          enemies = enemies.map((en) => (en.id === e.id ? { ...en, hp } : en))
        }
        break
      }
    }
  }

  bullets = bullets.filter((b) => !deadBullets.has(b.id))
  enemies = enemies.filter((e) => !deadEnemies.has(e.id))

  const invuln = now < s.invulnUntil
  if (!invuln) {
    for (const e of enemies) {
      if (dist(e.x, e.y, px, py) < HIT_R + 2) {
        s = killPlayer(s, now)
        break
      }
    }
  }

  return { ...s, bullets, enemies, score }
}

export function legShouldEnd(g: GyrussState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: GyrussSideState, p2: GyrussSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}
