export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 4200
export const LEG_DURATION_MS = 50_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const MOVE_COOLDOWN_MS = 85
export const JUMP_COOLDOWN_MS = 380
export const FIRE_COOLDOWN_MS = 200
export const SLUG_FIRE_COOLDOWN_MS = 130
export const GRENADE_COOLDOWN_MS = 3400
export const INVULN_MS = 1400
export const SLUG_DURATION_MS = 7500
export const PLAYER_X_MIN = 8
export const PLAYER_X_MAX = 44
export const PLAYER_SPEED = 0.064
export const GRAVITY = 0.00022
export const JUMP_VY = -0.32
export const BULLET_SPEED = 0.44
export const HEAVY_BULLET_SPEED = 0.36
export const ENEMY_BULLET_SPEED = 0.17
export const MAX_PLAYER_BULLETS = 8
export const MAX_ENEMIES = 9
export const SPAWN_MS = 1600
export const PICKUP_SPAWN_MS = 9000
export const HIT_R = 4.5
export const GRENADE_BLAST_R = 9

export const PLATFORMS = [
  { y: 78, xMin: 0, xMax: 100 },
  { y: 52, xMin: 10, xMax: 92 },
  { y: 28, xMin: 24, xMax: 98 },
] as const

export type HorizDir = 'left' | 'right'
export type EnemyKind = 'grunt' | 'tank' | 'chopper'

export type MsEnemy = {
  id: number
  x: number
  y: number
  kind: EnemyKind
  hp: number
}

export type MsBullet = {
  id: number
  x: number
  y: number
  vx: number
  fromPlayer: boolean
  heavy: boolean
}

export type MsGrenade = {
  id: number
  x: number
  y: number
  vx: number
  vy: number
}

export type MsPickup = {
  id: number
  x: number
  y: number
  kind: 'slug'
}

export type MetalSlugSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  px: number
  py: number
  vy: number
  groundedY: number | null
  inSlug: boolean
  slugUntil: number
  enemies: MsEnemy[]
  bullets: MsBullet[]
  grenades: MsGrenade[]
  pickups: MsPickup[]
  kills: number
  lastMoveAt: number
  lastJumpAt: number
  lastFireAt: number
  lastGrenadeAt: number
  lastSpawnAt: number
  lastPickupAt: number
  invulnUntil: number
  nextId: number
}

export type MetalSlugState = {
  p1: MetalSlugSideState
  p2: MetalSlugSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

const SCORE: Record<EnemyKind, number> = { grunt: 260, tank: 420, chopper: 380 }
const ENEMY_HP: Record<EnemyKind, number> = { grunt: 1, tank: 2, chopper: 1 }

export function enemyGlyph(kind: EnemyKind) {
  if (kind === 'tank') return '🛡️'
  if (kind === 'chopper') return '🚁'
  return '🪖'
}

function surfaceAt(x: number, py: number): number | null {
  let best: number | null = null
  for (const p of PLATFORMS) {
    if (x < p.xMin || x > p.xMax) continue
    if (Math.abs(py - p.y) < 2.5) return p.y
    if (py >= p.y - 1 && (best == null || p.y > best)) best = p.y
  }
  return null
}

function landingPlatform(x: number, py: number, vy: number): number | null {
  if (vy < 0) return null
  for (const p of PLATFORMS) {
    if (x >= p.xMin && x <= p.xMax && py >= p.y - 2 && py <= p.y + 6) return p.y
  }
  return null
}

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by)
}

export function isInSlug(side: MetalSlugSideState, now: number) {
  return side.inSlug && now < side.slugUntil
}

export function createSide(sideId: 1 | 2, now: number): MetalSlugSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    px: 16,
    py: PLATFORMS[0]!.y,
    vy: 0,
    groundedY: PLATFORMS[0]!.y,
    inSlug: false,
    slugUntil: 0,
    enemies: [],
    bullets: [],
    grenades: [],
    pickups: [],
    kills: 0,
    lastMoveAt: 0,
    lastJumpAt: 0,
    lastFireAt: 0,
    lastGrenadeAt: -99999,
    lastSpawnAt: now + 800,
    lastPickupAt: now + 4000,
    invulnUntil: 0,
    nextId: 1,
  }
}

export function createMetalSlugState(now: number): MetalSlugState {
  return {
    p1: createSide(1, now),
    p2: createSide(2, now),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

function respawn(side: MetalSlugSideState, now: number): MetalSlugSideState {
  if (now < side.invulnUntil) return side
  const lives = side.lives - 1
  if (lives <= 0) return { ...side, lives: 0, inSlug: false, slugUntil: 0 }
  return {
    ...side,
    lives,
    px: 16,
    py: PLATFORMS[0]!.y,
    vy: 0,
    groundedY: PLATFORMS[0]!.y,
    inSlug: false,
    slugUntil: 0,
    invulnUntil: now + INVULN_MS,
  }
}

function loseSlug(side: MetalSlugSideState, now: number): MetalSlugSideState {
  return { ...side, inSlug: false, slugUntil: 0, invulnUntil: now + 800 }
}

export function tryMove(side: MetalSlugSideState, dir: HorizDir, now: number): MetalSlugSideState {
  if (side.lives <= 0 || now - side.lastMoveAt < MOVE_COOLDOWN_MS) return side
  const slug = isInSlug(side, now)
  let px = side.px
  const mult = slug ? 0.75 : 1
  if (dir === 'left') px -= PLAYER_SPEED * 120 * mult
  if (dir === 'right') px += PLAYER_SPEED * 120 * mult
  px = Math.max(PLAYER_X_MIN, Math.min(PLAYER_X_MAX, px))

  let py = side.py
  let groundedY = side.groundedY
  if (side.groundedY != null && !slug) {
    const surf = surfaceAt(px, side.groundedY)
    if (surf == null) groundedY = null
    else {
      groundedY = surf
      py = surf
    }
  } else if (slug) {
    groundedY = PLATFORMS[0]!.y
    py = PLATFORMS[0]!.y
  }

  if (px === side.px && py === side.py && groundedY === side.groundedY) return side
  return { ...side, px, py, groundedY, lastMoveAt: now }
}

export function tryJump(side: MetalSlugSideState, now: number): MetalSlugSideState {
  if (side.lives <= 0 || isInSlug(side, now) || side.groundedY == null || now - side.lastJumpAt < JUMP_COOLDOWN_MS) {
    return side
  }
  return { ...side, vy: JUMP_VY, groundedY: null, lastJumpAt: now }
}

export function tryFire(side: MetalSlugSideState, now: number): MetalSlugSideState {
  const slug = isInSlug(side, now)
  const cd = slug ? SLUG_FIRE_COOLDOWN_MS : FIRE_COOLDOWN_MS
  if (side.lives <= 0 || now - side.lastFireAt < cd) return side
  if (side.bullets.filter((b) => b.fromPlayer).length >= MAX_PLAYER_BULLETS) return side

  const bullets: MsBullet[] = []
  const baseY = side.py - (slug ? 8 : 4)
  if (slug) {
    bullets.push({
      id: side.nextId,
      x: side.px + 5,
      y: baseY,
      vx: HEAVY_BULLET_SPEED,
      fromPlayer: true,
      heavy: true,
    })
  } else {
    bullets.push(
      { id: side.nextId, x: side.px + 3, y: baseY, vx: BULLET_SPEED, fromPlayer: true, heavy: false },
      {
        id: side.nextId + 1,
        x: side.px + 3,
        y: baseY - 2,
        vx: BULLET_SPEED * 0.98,
        fromPlayer: true,
        heavy: false,
      },
      {
        id: side.nextId + 2,
        x: side.px + 3,
        y: baseY + 2,
        vx: BULLET_SPEED * 0.98,
        fromPlayer: true,
        heavy: false,
      },
    )
  }

  return {
    ...side,
    bullets: [...side.bullets, ...bullets],
    nextId: side.nextId + (slug ? 1 : 3),
    lastFireAt: now,
  }
}

export function tryGrenade(side: MetalSlugSideState, now: number): MetalSlugSideState {
  if (side.lives <= 0 || isInSlug(side, now) || now - side.lastGrenadeAt < GRENADE_COOLDOWN_MS) return side
  const grenade: MsGrenade = {
    id: side.nextId,
    x: side.px + 4,
    y: side.py - 6,
    vx: 0.12,
    vy: -0.22,
  }
  return {
    ...side,
    grenades: [...side.grenades, grenade],
    nextId: side.nextId + 1,
    lastGrenadeAt: now,
  }
}

function spawnEnemy(side: MetalSlugSideState, now: number, rand: () => number): MetalSlugSideState {
  if (side.enemies.length >= MAX_ENEMIES || now - side.lastSpawnAt < SPAWN_MS) return side
  const kinds: EnemyKind[] = ['grunt', 'tank', 'chopper']
  const kind = kinds[Math.floor(rand() * kinds.length)]!
  const y = kind === 'chopper' ? 18 + rand() * 12 : PLATFORMS[Math.floor(rand() * PLATFORMS.length)]!.y
  const enemy: MsEnemy = {
    id: side.nextId,
    x: 102 + rand() * 10,
    y,
    kind,
    hp: ENEMY_HP[kind],
  }
  return {
    ...side,
    enemies: [...side.enemies, enemy],
    nextId: side.nextId + 1,
    lastSpawnAt: now,
  }
}

function spawnPickup(side: MetalSlugSideState, now: number, rand: () => number): MetalSlugSideState {
  if (side.pickups.length > 0 || isInSlug(side, now) || now - side.lastPickupAt < PICKUP_SPAWN_MS) return side
  const pickup: MsPickup = {
    id: side.nextId,
    x: 55 + rand() * 25,
    y: PLATFORMS[0]!.y,
    kind: 'slug',
  }
  return {
    ...side,
    pickups: [pickup],
    nextId: side.nextId + 1,
    lastPickupAt: now,
  }
}

function damageEnemy(
  side: MetalSlugSideState,
  enemy: MsEnemy,
): { side: MetalSlugSideState; killed: boolean } {
  const hp = enemy.hp - 1
  if (hp <= 0) {
    return {
      side: {
        ...side,
        score: side.score + SCORE[enemy.kind],
        kills: side.kills + 1,
      },
      killed: true,
    }
  }
  return { side, killed: false }
}

function explodeGrenade(side: MetalSlugSideState, gx: number, gy: number): MetalSlugSideState {
  let s = side
  s = {
    ...s,
    enemies: s.enemies.filter((e) => {
      if (dist(gx, gy, e.x, e.y - 4) < GRENADE_BLAST_R) {
        s = { ...s, score: s.score + SCORE[e.kind], kills: s.kills + 1 }
        return false
      }
      return true
    }),
  }
  return s
}

export function tickSide(side: MetalSlugSideState, dt: number, now: number, rand: () => number): MetalSlugSideState {
  if (dt <= 0 || side.lives <= 0) return side

  let s = spawnEnemy(side, now, rand)
  s = spawnPickup(s, now, rand)

  if (s.inSlug && now >= s.slugUntil) {
    s = { ...s, inSlug: false, slugUntil: 0 }
  }

  let px = s.px
  let py = s.py
  let vy = s.vy
  let groundedY = s.groundedY

  if (!isInSlug(s, now) && groundedY == null) {
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

  for (const p of s.pickups) {
    if (dist(s.px, s.py - 4, p.x, p.y - 4) < HIT_R + 2) {
      s = {
        ...s,
        pickups: [],
        inSlug: true,
        slugUntil: now + SLUG_DURATION_MS,
        groundedY: PLATFORMS[0]!.y,
        py: PLATFORMS[0]!.y,
      }
      break
    }
  }

  let enemies = s.enemies.map((e) => {
    const speed = e.kind === 'tank' ? 0.022 : e.kind === 'chopper' ? 0.05 : 0.048
    return { ...e, x: e.x - speed * dt }
  })

  let bullets = s.bullets.map((b) => ({ ...b, x: b.x + b.vx * dt }))
  let grenades = s.grenades.map((g) => ({
    ...g,
    x: g.x + g.vx * dt,
    y: g.y + g.vy * dt,
    vy: g.vy + GRAVITY * dt * 0.85,
  }))

  for (const e of enemies) {
    if (e.kind === 'chopper' && e.x < 88 && rand() > 0.992) {
      bullets = [
        ...bullets,
        { id: s.nextId, x: e.x - 2, y: e.y + 2, vx: -ENEMY_BULLET_SPEED, fromPlayer: false, heavy: false },
      ]
      s = { ...s, nextId: s.nextId + 1 }
    }
  }

  const invuln = now < s.invulnUntil

  const nextEnemies: MsEnemy[] = []
  for (const e of enemies) {
    let dead = false
    let updated = e
    for (const b of bullets) {
      if (!b.fromPlayer) continue
      const r = b.heavy ? HIT_R + 2 : HIT_R
      if (dist(b.x, b.y, e.x, e.y - 4) < r) {
        const res = damageEnemy(s, e)
        s = res.side
        bullets = bullets.filter((bl) => bl.id !== b.id)
        if (res.killed) dead = true
        else updated = { ...e, hp: e.hp - 1 }
        break
      }
    }
    if (!dead && updated.x > -6) nextEnemies.push(updated)
  }
  enemies = nextEnemies

  grenades = grenades.filter((g) => {
    const onGround = g.y >= PLATFORMS[0]!.y - 2
    if (onGround || g.x > 98) {
      s = explodeGrenade(s, g.x, g.y)
      return false
    }
    for (const e of enemies) {
      if (dist(g.x, g.y, e.x, e.y - 4) < HIT_R) {
        s = explodeGrenade(s, g.x, g.y)
        return false
      }
    }
    return g.x > -4
  })

  bullets = bullets.filter((b) => b.x > -4 && b.x < 108)

  if (!invuln) {
    for (const e of enemies) {
      if (dist(s.px, s.py - (isInSlug(s, now) ? 8 : 4), e.x, e.y - 4) < HIT_R) {
        if (isInSlug(s, now)) s = loseSlug(s, now)
        else s = respawn(s, now)
        break
      }
    }
    if (s.lives > 0 && now >= s.invulnUntil) {
      for (const b of bullets) {
        if (!b.fromPlayer && dist(b.x, b.y, s.px, s.py - 4) < HIT_R - 1) {
          if (isInSlug(s, now)) s = loseSlug(s, now)
          else s = respawn(s, now)
          bullets = bullets.filter((bl) => bl.id !== b.id)
          break
        }
      }
    }
  }

  return { ...s, enemies, bullets, grenades }
}

export function legShouldEnd(g: MetalSlugState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: MetalSlugSideState, p2: MetalSlugSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}

export function platformSegmentsForRender() {
  return PLATFORMS
}
