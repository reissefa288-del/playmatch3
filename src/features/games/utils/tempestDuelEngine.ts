export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 3800
export const LEG_DURATION_MS = 46_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const LANES = 8
export const MAX_DEPTH = 12
export const FIRE_COOLDOWN_MS = 220
export const ROTATE_COOLDOWN_MS = 90
export const INVULN_MS = 1400
export const BULLET_SPEED = 0.011
export const ENEMY_SPEED = 0.0055
export const ENEMY_SPAWN_MS = 2400
export const MAX_ENEMIES = 7
export const MAX_BULLETS = 4

export type RotateDir = 'left' | 'right'
export type EnemyKind = 'spike' | 'flank' | 'jumper'

export type TempestEnemy = {
  id: number
  lane: number
  depth: number
  kind: EnemyKind
}

export type TempestBullet = {
  id: number
  lane: number
  depth: number
}

export type TempestSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  lane: number
  bullets: TempestBullet[]
  enemies: TempestEnemy[]
  lastShotAt: number
  lastRotateAt: number
  lastSpawnAt: number
  invulnUntil: number
  nextBulletId: number
  nextEnemyId: number
  wave: number
}

export type TempestState = {
  p1: TempestSideState
  p2: TempestSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

const SCORE: Record<EnemyKind, number> = { spike: 180, flank: 280, jumper: 360 }

export function enemyGlyph(kind: EnemyKind) {
  if (kind === 'jumper') return '◆'
  if (kind === 'flank') return '▲'
  return '▼'
}

/** 0 = oyuncu halkası, MAX = kuyu merkezi */
export function depthToRadiusPct(depth: number) {
  const t = Math.max(0, Math.min(1, depth / MAX_DEPTH))
  return 86 - t * 72
}

export function laneToAngle(lane: number) {
  return (lane / LANES) * Math.PI * 2 - Math.PI / 2
}

export function laneDepthToPosition(lane: number, depth: number) {
  const angle = laneToAngle(lane)
  const r = depthToRadiusPct(depth) * 0.46
  return {
    left: 50 + Math.cos(angle) * r,
    top: 54 + Math.sin(angle) * r * 0.92,
  }
}

export function createSide(sideId: 1 | 2, now: number): TempestSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    lane: 0,
    bullets: [],
    enemies: [],
    lastShotAt: 0,
    lastRotateAt: 0,
    lastSpawnAt: now + 800,
    invulnUntil: 0,
    nextBulletId: 1,
    nextEnemyId: 1,
    wave: 1,
  }
}

export function createTempestState(now: number): TempestState {
  return {
    p1: createSide(1, now),
    p2: createSide(2, now),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

function spawnEnemy(side: TempestSideState, rand: () => number): TempestSideState {
  if (side.enemies.length >= MAX_ENEMIES) return side
  const r = rand()
  const kind: EnemyKind = r > 0.82 ? 'jumper' : r > 0.5 ? 'flank' : 'spike'
  const lane = Math.floor(rand() * LANES)
  const enemy: TempestEnemy = {
    id: side.nextEnemyId,
    lane,
    depth: MAX_DEPTH - 0.5 + rand() * 2,
    kind,
  }
  return {
    ...side,
    enemies: [...side.enemies, enemy],
    nextEnemyId: side.nextEnemyId + 1,
  }
}

export function rotateLane(side: TempestSideState, dir: RotateDir, now: number): TempestSideState {
  if (side.lives <= 0 || now - side.lastRotateAt < ROTATE_COOLDOWN_MS) return side
  const delta = dir === 'left' ? -1 : 1
  const lane = (side.lane + delta + LANES) % LANES
  return { ...side, lane, lastRotateAt: now }
}

export function tryShoot(side: TempestSideState, now: number): TempestSideState {
  if (side.lives <= 0 || side.bullets.length >= MAX_BULLETS) return side
  if (now - side.lastShotAt < FIRE_COOLDOWN_MS) return side
  const bullet: TempestBullet = {
    id: side.nextBulletId,
    lane: side.lane,
    depth: 1.4,
  }
  return {
    ...side,
    bullets: [...side.bullets, bullet],
    nextBulletId: side.nextBulletId + 1,
    lastShotAt: now,
  }
}

function killPlayer(side: TempestSideState, now: number): TempestSideState {
  if (now < side.invulnUntil) return side
  const lives = side.lives - 1
  if (lives <= 0) {
    return { ...side, lives: 0, bullets: [] }
  }
  return {
    ...side,
    lives,
    invulnUntil: now + INVULN_MS,
    bullets: [],
  }
}

function sameLane(a: number, b: number) {
  return a === b
}

export function tickSide(side: TempestSideState, dt: number, now: number, rand: () => number): TempestSideState {
  if (dt <= 0 || side.lives <= 0) return side

  let s = side

  if (now - s.lastSpawnAt >= ENEMY_SPAWN_MS) {
    s = spawnEnemy(s, rand)
    s = { ...s, lastSpawnAt: now }
  }

  let bullets = s.bullets.map((b) => ({ ...b, depth: b.depth + BULLET_SPEED * dt }))
  bullets = bullets.filter((b) => b.depth <= MAX_DEPTH + 1)

  let enemies = s.enemies.map((e) => {
    const speed = e.kind === 'spike' ? ENEMY_SPEED * 1.15 : ENEMY_SPEED
    let depth = e.depth - speed * dt
    let lane = e.lane
    if (e.kind === 'jumper' && rand() > 0.992) {
      lane = (lane + (rand() > 0.5 ? 1 : -1) + LANES) % LANES
    }
    if (e.kind === 'flank' && rand() > 0.996) {
      lane = (lane + 1) % LANES
    }
    return { ...e, depth, lane }
  })

  let score = s.score
  const hitEnemyIds = new Set<number>()
  const hitBulletIds = new Set<number>()

  for (const b of bullets) {
    for (const e of enemies) {
      if (hitEnemyIds.has(e.id)) continue
      if (!sameLane(b.lane, e.lane)) continue
      if (Math.abs(b.depth - e.depth) < 1.1) {
        hitEnemyIds.add(e.id)
        hitBulletIds.add(b.id)
        score += SCORE[e.kind]
      }
    }
  }

  enemies = enemies.filter((e) => !hitEnemyIds.has(e.id))
  bullets = bullets.filter((b) => !hitBulletIds.has(b.id))

  for (const e of enemies) {
    if (!sameLane(e.lane, s.lane)) continue
    if (e.depth < 1.6 && now >= s.invulnUntil) {
      s = killPlayer(s, now)
      break
    }
  }

  enemies = enemies.filter((e) => e.depth > -0.5)

  return { ...s, bullets, enemies, score }
}

export function legShouldEnd(g: TempestState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: TempestSideState, p2: TempestSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}
