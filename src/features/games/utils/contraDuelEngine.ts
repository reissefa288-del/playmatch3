export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 4000
export const LEG_DURATION_MS = 50_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const MOVE_COOLDOWN_MS = 85
export const JUMP_COOLDOWN_MS = 380
export const FIRE_COOLDOWN_MS = 220
export const INVULN_MS = 1400
export const PLAYER_X_MIN = 8
export const PLAYER_X_MAX = 42
export const PLAYER_SPEED = 0.062
export const GRAVITY = 0.00022
export const JUMP_VY = -0.32
export const BULLET_SPEED = 0.42
export const ENEMY_BULLET_SPEED = 0.18
export const MAX_PLAYER_BULLETS = 6
export const MAX_ENEMIES = 8
export const SPAWN_MS = 1700
export const HIT_R = 4.5

export const PLATFORMS = [
  { y: 78, xMin: 0, xMax: 100 },
  { y: 52, xMin: 12, xMax: 90 },
  { y: 28, xMin: 28, xMax: 98 },
] as const

export type HorizDir = 'left' | 'right'
export type EnemyKind = 'soldier' | 'runner' | 'sniper'

export type CxEnemy = {
  id: number
  x: number
  y: number
  kind: EnemyKind
  vy: number
}

export type CxBullet = {
  id: number
  x: number
  y: number
  vx: number
  fromPlayer: boolean
}

export type ContraSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  px: number
  py: number
  vy: number
  groundedY: number | null
  enemies: CxEnemy[]
  bullets: CxBullet[]
  kills: number
  lastMoveAt: number
  lastJumpAt: number
  lastFireAt: number
  lastSpawnAt: number
  invulnUntil: number
  nextId: number
}

export type ContraState = {
  p1: ContraSideState
  p2: ContraSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

const SCORE: Record<EnemyKind, number> = { soldier: 280, runner: 220, sniper: 360 }

export function enemyGlyph(kind: EnemyKind) {
  if (kind === 'runner') return '🏃'
  if (kind === 'sniper') return '🎯'
  return '💂'
}

function surfaceAt(x: number, py: number): number | null {
  let best: number | null = null
  for (const p of PLATFORMS) {
    if (x < p.xMin || x > p.xMax) continue
    if (Math.abs(py - p.y) < 2.5) return p.y
    if (py >= p.y - 1 && (best == null || p.y > best)) best = p.y
  }
  return best
}

function landingPlatform(x: number, py: number, vy: number): number | null {
  if (vy < 0) return null
  for (const p of PLATFORMS) {
    if (x >= p.xMin && x <= p.xMax && py >= p.y - 2 && py <= p.y + 6) return p.y
  }
  return null
}

export function createSide(sideId: 1 | 2, now: number): ContraSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    px: 16,
    py: PLATFORMS[0]!.y,
    vy: 0,
    groundedY: PLATFORMS[0]!.y,
    enemies: [],
    bullets: [],
    kills: 0,
    lastMoveAt: 0,
    lastJumpAt: 0,
    lastFireAt: 0,
    lastSpawnAt: now + 900,
    invulnUntil: 0,
    nextId: 1,
  }
}

export function createContraState(now: number): ContraState {
  return {
    p1: createSide(1, now),
    p2: createSide(2, now),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

function respawn(side: ContraSideState, now: number): ContraSideState {
  if (now < side.invulnUntil) return side
  const lives = side.lives - 1
  if (lives <= 0) return { ...side, lives: 0 }
  return {
    ...side,
    lives,
    px: 16,
    py: PLATFORMS[0]!.y,
    vy: 0,
    groundedY: PLATFORMS[0]!.y,
    invulnUntil: now + INVULN_MS,
  }
}

export function tryMove(side: ContraSideState, dir: HorizDir, now: number): ContraSideState {
  if (side.lives <= 0 || now - side.lastMoveAt < MOVE_COOLDOWN_MS) return side
  let px = side.px
  if (dir === 'left') px -= PLAYER_SPEED * 120
  if (dir === 'right') px += PLAYER_SPEED * 120
  px = Math.max(PLAYER_X_MIN, Math.min(PLAYER_X_MAX, px))

  let py = side.py
  let groundedY = side.groundedY
  if (side.groundedY != null) {
    const surf = surfaceAt(px, side.groundedY)
    if (surf == null) {
      groundedY = null
    } else {
      groundedY = surf
      py = surf
    }
  }

  if (px === side.px && py === side.py && groundedY === side.groundedY) return side
  return { ...side, px, py, groundedY, lastMoveAt: now }
}

export function tryJump(side: ContraSideState, now: number): ContraSideState {
  if (side.lives <= 0 || side.groundedY == null || now - side.lastJumpAt < JUMP_COOLDOWN_MS) return side
  return { ...side, vy: JUMP_VY, groundedY: null, lastJumpAt: now }
}

export function tryFire(side: ContraSideState, now: number): ContraSideState {
  if (side.lives <= 0 || now - side.lastFireAt < FIRE_COOLDOWN_MS) return side
  if (side.bullets.filter((b) => b.fromPlayer).length >= MAX_PLAYER_BULLETS) return side

  const bullet: CxBullet = {
    id: side.nextId,
    x: side.px + 3,
    y: side.py - 4,
    vx: BULLET_SPEED,
    fromPlayer: true,
  }
  return {
    ...side,
    bullets: [...side.bullets, bullet],
    nextId: side.nextId + 1,
    lastFireAt: now,
  }
}

function spawnEnemy(side: ContraSideState, now: number, rand: () => number): ContraSideState {
  if (side.enemies.length >= MAX_ENEMIES || now - side.lastSpawnAt < SPAWN_MS) return side

  const kinds: EnemyKind[] = ['soldier', 'runner', 'sniper']
  const kind = kinds[Math.floor(rand() * kinds.length)]!
  const plat = PLATFORMS[Math.floor(rand() * PLATFORMS.length)]!
  const enemy: CxEnemy = {
    id: side.nextId,
    x: 102 + rand() * 10,
    y: plat.y,
    kind,
    vy: 0,
  }
  return {
    ...side,
    enemies: [...side.enemies, enemy],
    nextId: side.nextId + 1,
    lastSpawnAt: now,
  }
}

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by)
}

export function tickSide(side: ContraSideState, dt: number, now: number, rand: () => number): ContraSideState {
  if (dt <= 0 || side.lives <= 0) return side

  let s = spawnEnemy(side, now, rand)

  let px = s.px
  let py = s.py
  let vy = s.vy
  let groundedY = s.groundedY

  if (groundedY == null) {
    vy += GRAVITY * dt
    py += vy * dt
    const land = landingPlatform(px, py, vy)
    if (land != null) {
      py = land
      vy = 0
      groundedY = land
    } else if (py > 92) {
      py = PLATFORMS[0]!.y
      vy = 0
      groundedY = PLATFORMS[0]!.y
    }
  }

  s = { ...s, px, py, vy, groundedY }

  let enemies = s.enemies.map((e) => {
    const speed = e.kind === 'runner' ? 0.07 : e.kind === 'sniper' ? 0.028 : 0.045
    return { ...e, x: e.x - speed * dt }
  })

  let bullets = s.bullets.map((b) => ({ ...b, x: b.x + b.vx * dt }))

  for (const e of enemies) {
    if (e.kind === 'sniper' && e.x < 85 && rand() > 0.993) {
      bullets = [
        ...bullets,
        { id: s.nextId, x: e.x - 2, y: e.y - 4, vx: -ENEMY_BULLET_SPEED, fromPlayer: false },
      ]
      s = { ...s, nextId: s.nextId + 1 }
    }
  }

  let score = s.score
  let kills = s.kills
  const invuln = now < s.invulnUntil

  enemies = enemies.filter((e) => {
    for (const b of bullets) {
      if (!b.fromPlayer) continue
      if (dist(b.x, b.y, e.x, e.y - 4) < HIT_R) {
        score += SCORE[e.kind]
        kills += 1
        bullets = bullets.filter((bl) => bl.id !== b.id)
        return false
      }
    }
    return e.x > -6
  })

  bullets = bullets.filter((b) => b.x > -4 && b.x < 108)

  if (!invuln) {
    for (const e of enemies) {
      if (dist(s.px, s.py - 4, e.x, e.y - 4) < HIT_R) {
        s = respawn(s, now)
        break
      }
    }
    if (s.lives > 0 && now >= s.invulnUntil) {
      for (const b of bullets) {
        if (!b.fromPlayer && dist(b.x, b.y, s.px, s.py - 4) < HIT_R - 1) {
          s = respawn(s, now)
          bullets = bullets.filter((bl) => bl.id !== b.id)
          break
        }
      }
    }
  }

  return { ...s, enemies, bullets, score, kills }
}

export function legShouldEnd(g: ContraState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: ContraSideState, p2: ContraSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}

export function platformSegmentsForRender() {
  return PLATFORMS
}
