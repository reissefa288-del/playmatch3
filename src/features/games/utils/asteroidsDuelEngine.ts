export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 3800
export const LEG_DURATION_MS = 45_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const FIRE_COOLDOWN_MS = 220
export const BULLET_LIFE_MS = 900
export const INVULN_MS = 1600
export const MAX_BULLETS = 4
export const MAX_SPEED = 0.22
export const THRUST_ACCEL = 0.00042
export const FRICTION = 0.991

export type AsteroidSize = 'large' | 'medium' | 'small'

export type AsteroidRock = {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: AsteroidSize
  rot: number
  rotSpeed: number
}

export type AsteroidBullet = {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  bornAt: number
}

export type AsteroidSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  wave: number
  shipX: number
  shipY: number
  shipAngle: number
  shipVx: number
  shipVy: number
  thrusting: boolean
  bullets: AsteroidBullet[]
  asteroids: AsteroidRock[]
  lastShotAt: number
  invulnUntil: number
  nextAsteroidId: number
  nextBulletId: number
}

export type AsteroidsState = {
  p1: AsteroidSideState
  p2: AsteroidSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

const SCORE: Record<AsteroidSize, number> = { large: 200, medium: 120, small: 60 }
const RADIUS: Record<AsteroidSize, number> = { large: 9, medium: 6, small: 3.8 }
const SHIP_R = 4.5

export function wrapCoord(n: number) {
  let v = n
  while (v < 0) v += 100
  while (v > 100) v -= 100
  return v
}

export function createSide(sideId: 1 | 2): AsteroidSideState {
  const side: AsteroidSideState = {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    wave: 0,
    shipX: 50,
    shipY: 50,
    shipAngle: -Math.PI / 2,
    shipVx: 0,
    shipVy: 0,
    thrusting: false,
    bullets: [],
    asteroids: [],
    lastShotAt: 0,
    invulnUntil: 0,
    nextAsteroidId: 1,
    nextBulletId: 1,
  }
  return spawnWave(side, () => Math.random(), 4)
}

export function createAsteroidsState(now: number): AsteroidsState {
  return {
    p1: createSide(1),
    p2: createSide(2),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

function dist(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx
  const dy = ay - by
  return Math.sqrt(dx * dx + dy * dy)
}

function forwardVx(angle: number) {
  return Math.sin(angle)
}

function forwardVy(angle: number) {
  return -Math.cos(angle)
}

function clampSpeed(vx: number, vy: number) {
  const sp = Math.sqrt(vx * vx + vy * vy)
  if (sp <= MAX_SPEED) return { vx, vy }
  const s = MAX_SPEED / sp
  return { vx: vx * s, vy: vy * s }
}

export function aimShip(side: AsteroidSideState, x: number, y: number, thrusting: boolean): AsteroidSideState {
  const dx = x - side.shipX
  const dy = y - side.shipY
  const angle = Math.atan2(dx, -dy)
  return { ...side, shipAngle: angle, thrusting: thrusting && side.lives > 0 }
}

export function setThrust(side: AsteroidSideState, thrusting: boolean): AsteroidSideState {
  return { ...side, thrusting: thrusting && side.lives > 0 }
}

export function rotateShip(side: AsteroidSideState, delta: number): AsteroidSideState {
  return { ...side, shipAngle: side.shipAngle + delta }
}

export function tryShoot(side: AsteroidSideState, now: number): AsteroidSideState {
  if (side.lives <= 0) return side
  if (now - side.lastShotAt < FIRE_COOLDOWN_MS) return side
  if (side.bullets.length >= MAX_BULLETS) return side

  const speed = 0.28
  const bullet: AsteroidBullet = {
    id: side.nextBulletId,
    x: side.shipX + forwardVx(side.shipAngle) * 5,
    y: side.shipY + forwardVy(side.shipAngle) * 5,
    vx: forwardVx(side.shipAngle) * speed,
    vy: forwardVy(side.shipAngle) * speed,
    bornAt: now,
  }
  return {
    ...side,
    bullets: [...side.bullets, bullet],
    nextBulletId: side.nextBulletId + 1,
    lastShotAt: now,
  }
}

function splitRock(rock: AsteroidRock, nextId: number): { rocks: AsteroidRock[]; nextId: number } {
  if (rock.size === 'small') return { rocks: [], nextId }
  const nextSize: AsteroidSize = rock.size === 'large' ? 'medium' : 'small'
  const r = RADIUS[nextSize]
  const rocks: AsteroidRock[] = []
  let id = nextId
  for (let i = 0; i < 2; i++) {
    const a = rock.rot + (i === 0 ? 0.6 : -0.6)
    const speed = 0.04 + Math.random() * 0.03
    rocks.push({
      id: id++,
      x: rock.x + Math.sin(a) * r * 0.3,
      y: rock.y - Math.cos(a) * r * 0.3,
      vx: rock.vx + Math.sin(a) * speed,
      vy: rock.vy - Math.cos(a) * speed,
      size: nextSize,
      rot: rock.rot + i,
      rotSpeed: rock.rotSpeed * 1.4,
    })
  }
  return { rocks, nextId: id }
}

export function spawnWave(side: AsteroidSideState, rand: () => number, count: number): AsteroidSideState {
  const asteroids = [...side.asteroids]
  let id = side.nextAsteroidId
  for (let i = 0; i < count; i++) {
    let x = 50
    let y = 50
    for (let t = 0; t < 12; t++) {
      x = 8 + rand() * 84
      y = 8 + rand() * 84
      if (dist(x, y, 50, 50) > 22) break
    }
    const angle = rand() * Math.PI * 2
    const speed = 0.028 + rand() * 0.035
    asteroids.push({
      id: id++,
      x,
      y,
      vx: Math.sin(angle) * speed,
      vy: -Math.cos(angle) * speed,
      size: 'large',
      rot: rand() * Math.PI * 2,
      rotSpeed: (rand() - 0.5) * 0.004,
    })
  }
  return { ...side, asteroids, nextAsteroidId: id, wave: side.wave + 1 }
}

function hit(ax: number, ay: number, bx: number, by: number, r: number) {
  return dist(ax, ay, bx, by) < r
}

export function tickSide(side: AsteroidSideState, dt: number, now: number, rand: () => number): AsteroidSideState {
  if (dt <= 0) return side

  let s = { ...side }

  if (s.lives > 0 && s.thrusting) {
    s.shipVx += forwardVx(s.shipAngle) * THRUST_ACCEL * dt
    s.shipVy += forwardVy(s.shipAngle) * THRUST_ACCEL * dt
    const clamped = clampSpeed(s.shipVx, s.shipVy)
    s.shipVx = clamped.vx
    s.shipVy = clamped.vy
  }

  s.shipVx *= Math.pow(FRICTION, dt / 16)
  s.shipVy *= Math.pow(FRICTION, dt / 16)
  s.shipX = wrapCoord(s.shipX + s.shipVx * dt)
  s.shipY = wrapCoord(s.shipY + s.shipVy * dt)

  s.asteroids = s.asteroids.map((a) => ({
    ...a,
    x: wrapCoord(a.x + a.vx * dt),
    y: wrapCoord(a.y + a.vy * dt),
    rot: a.rot + a.rotSpeed * dt,
  }))

  s.bullets = s.bullets
    .map((b) => ({
      ...b,
      x: wrapCoord(b.x + b.vx * dt),
      y: wrapCoord(b.y + b.vy * dt),
    }))
    .filter((b) => now - b.bornAt < BULLET_LIFE_MS)

  const hitBulletIds = new Set<number>()
  const hitRockIds = new Set<number>()
  const spawnedRocks: AsteroidRock[] = []
  let scoreGain = 0
  let nextId = s.nextAsteroidId

  for (const b of s.bullets) {
    for (const a of s.asteroids) {
      if (hitRockIds.has(a.id)) continue
      if (hit(b.x, b.y, a.x, a.y, RADIUS[a.size])) {
        hitBulletIds.add(b.id)
        hitRockIds.add(a.id)
        scoreGain += SCORE[a.size]
        const split = splitRock(a, nextId)
        nextId = split.nextId
        spawnedRocks.push(...split.rocks)
        break
      }
    }
  }

  if (hitBulletIds.size > 0) {
    s.bullets = s.bullets.filter((b) => !hitBulletIds.has(b.id))
  }
  if (hitRockIds.size > 0) {
    s.asteroids = s.asteroids.filter((a) => !hitRockIds.has(a.id)).concat(spawnedRocks)
    s.score += scoreGain
    s.nextAsteroidId = nextId
  }

  if (s.asteroids.length === 0) {
    const count = Math.min(6, 3 + s.wave)
    s = spawnWave(s, rand, count)
  }

  const invuln = now < s.invulnUntil
  if (!invuln && s.lives > 0) {
    for (const a of s.asteroids) {
      if (hit(s.shipX, s.shipY, a.x, a.y, RADIUS[a.size] + SHIP_R)) {
        s.lives -= 1
        s.invulnUntil = now + INVULN_MS
        s.shipX = 50
        s.shipY = 50
        s.shipVx = 0
        s.shipVy = 0
        s.thrusting = false
        break
      }
    }
  }

  return s
}

export function rockScale(size: AsteroidSize) {
  if (size === 'large') return 1.35
  if (size === 'medium') return 0.9
  return 0.55
}

export function legShouldEnd(g: AsteroidsState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: AsteroidSideState, p2: AsteroidSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}
