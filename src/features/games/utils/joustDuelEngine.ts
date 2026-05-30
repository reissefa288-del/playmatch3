export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 3600
export const LEG_DURATION_MS = 48_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const INVULN_MS = 1400
export const FLAP_COOLDOWN_MS = 220
export const MOVE_COOLDOWN_MS = 90
export const GRAVITY = 0.00042
export const FLAP_VY = -0.13
export const MAX_FALL_VY = 0.14
export const LAVA_Y = 86
export const ENEMY_SPAWN_MS = 2600
export const MAX_ENEMIES = 6
export const HIT_R = 5.5

export type HorizDir = 'left' | 'right'

export type JoustPlatform = { id: number; x: number; y: number; w: number }

export type JoustEnemy = {
  id: number
  x: number
  y: number
  vy: number
  vx: number
  kind: 'knight' | 'hunter'
}

export type JoustSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  px: number
  py: number
  vy: number
  facing: HorizDir
  enemies: JoustEnemy[]
  lastFlapAt: number
  lastMoveAt: number
  lastSpawnAt: number
  invulnUntil: number
  nextEnemyId: number
}

export type JoustState = {
  p1: JoustSideState
  p2: JoustSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

export const PLATFORMS: JoustPlatform[] = [
  { id: 1, x: 8, y: 58, w: 38 },
  { id: 2, x: 42, y: 42, w: 32 },
  { id: 3, x: 62, y: 68, w: 30 },
]

const SCORE: Record<JoustEnemy['kind'], number> = { knight: 220, hunter: 340 }

export function enemyGlyph(kind: JoustEnemy['kind']) {
  return kind === 'hunter' ? '🦅' : '🐦'
}

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by)
}

function onPlatform(px: number, py: number, vy: number) {
  const foot = py + 4
  for (const p of PLATFORMS) {
    if (vy >= 0 && foot >= p.y - 1.5 && foot <= p.y + 2 && px >= p.x && px <= p.x + p.w) {
      return p
    }
  }
  return null
}

export function createSide(sideId: 1 | 2, now: number): JoustSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    px: 50,
    py: 42,
    vy: 0,
    facing: 'right',
    enemies: [],
    lastFlapAt: 0,
    lastMoveAt: 0,
    lastSpawnAt: now + 1000,
    invulnUntil: 0,
    nextEnemyId: 1,
  }
}

export function createJoustState(now: number): JoustState {
  return {
    p1: createSide(1, now),
    p2: createSide(2, now),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

function spawnEnemy(side: JoustSideState, rand: () => number): JoustSideState {
  if (side.enemies.length >= MAX_ENEMIES) return side
  const enemy: JoustEnemy = {
    id: side.nextEnemyId,
    x: 12 + rand() * 76,
    y: 18 + rand() * 28,
    vy: 0,
    vx: (rand() > 0.5 ? 1 : -1) * 0.04,
    kind: rand() > 0.75 ? 'hunter' : 'knight',
  }
  return { ...side, enemies: [...side.enemies, enemy], nextEnemyId: side.nextEnemyId + 1 }
}

export function tryFlap(side: JoustSideState, now: number): JoustSideState {
  if (side.lives <= 0 || now - side.lastFlapAt < FLAP_COOLDOWN_MS) return side
  return { ...side, vy: FLAP_VY, lastFlapAt: now }
}

export function tryMoveHoriz(side: JoustSideState, dir: HorizDir, now: number): JoustSideState {
  if (side.lives <= 0 || now - side.lastMoveAt < MOVE_COOLDOWN_MS) return side
  const sign = dir === 'left' ? -1 : 1
  const px = Math.max(8, Math.min(92, side.px + sign * 5))
  return { ...side, px, facing: dir, lastMoveAt: now }
}

function killPlayer(side: JoustSideState, now: number): JoustSideState {
  if (now < side.invulnUntil) return side
  const lives = side.lives - 1
  if (lives <= 0) return { ...side, lives: 0 }
  return {
    ...side,
    lives,
    px: 50,
    py: 42,
    vy: 0,
    invulnUntil: now + INVULN_MS,
  }
}

export function tickSide(side: JoustSideState, dt: number, now: number, rand: () => number): JoustSideState {
  if (dt <= 0 || side.lives <= 0) return side

  let s = side

  if (now - s.lastSpawnAt >= ENEMY_SPAWN_MS) {
    s = spawnEnemy(s, rand)
    s = { ...s, lastSpawnAt: now }
  }

  let vy = s.vy + GRAVITY * dt
  if (vy > MAX_FALL_VY) vy = MAX_FALL_VY
  let py = s.py + vy * dt
  let px = s.px

  const plat = onPlatform(px, py, vy)
  if (plat) {
    py = plat.y - 4
    vy = 0
  }

  if (py < 12) {
    py = 12
    vy = 0
  }

  if (py >= LAVA_Y && now >= s.invulnUntil) {
    s = killPlayer({ ...s, px, py, vy }, now)
    return s
  }

  let enemies = s.enemies.map((e) => {
    let evy = e.vy + GRAVITY * dt * 0.85
    if (rand() > 0.992) evy = FLAP_VY * 0.9
    if (evy > MAX_FALL_VY) evy = MAX_FALL_VY
    let ey = e.y + evy * dt
    let ex = e.x + e.vx * dt
    if (ex < 8 || ex > 92) {
      ex = Math.max(8, Math.min(92, ex))
      return { ...e, x: ex, y: ey, vy: evy, vx: -e.vx }
    }
    const ep = onPlatform(ex, ey, evy)
    if (ep) {
      ey = ep.y - 4
      evy = 0
    }
    if (ey < 10) {
      ey = 10
      evy = 0
    }
    return { ...e, x: ex, y: ey, vy: evy }
  })

  let score = s.score
  const dead = new Set<number>()

  for (const e of enemies) {
    if (dead.has(e.id)) continue
    if (dist(px, py, e.x, e.y) > HIT_R + 2) continue
    if (py < e.y - 1.5) {
      dead.add(e.id)
      score += SCORE[e.kind]
    } else if (now >= s.invulnUntil) {
      s = killPlayer({ ...s, px, py, vy }, now)
      break
    }
  }

  enemies = enemies.filter((e) => !dead.has(e.id))

  return { ...s, px, py, vy, enemies, score }
}

export function legShouldEnd(g: JoustState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: JoustSideState, p2: JoustSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}
