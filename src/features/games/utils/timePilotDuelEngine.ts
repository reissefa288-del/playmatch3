export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 3900
export const LEG_DURATION_MS = 46_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const MOVE_STEP = 4.8
export const MOVE_COOLDOWN_MS = 95
export const FIRE_COOLDOWN_MS = 210
export const BULLET_SPEED = 0.15
export const INVULN_MS = 1300
export const ENEMY_SPAWN_MS = 2000
export const ERA_MS = 10_500
export const MAX_ENEMIES = 9
export const MAX_BULLETS = 7
export const HIT_R = 4.5

export const ERAS = ['1910', '1940', '1970', '1982'] as const
export type Era = (typeof ERAS)[number]
export type Dir = 'up' | 'down' | 'left' | 'right'
export type EnemyKind = 'biplane' | 'fighter' | 'jet' | 'saucer'

export type TimePilotBullet = { id: number; x: number; y: number; vx: number; vy: number }
export type TimePilotEnemy = { id: number; x: number; y: number; kind: EnemyKind }

export type TimePilotSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  px: number
  py: number
  aim: Dir
  eraClock: number
  bullets: TimePilotBullet[]
  enemies: TimePilotEnemy[]
  lastMoveAt: number
  lastFireAt: number
  lastSpawnAt: number
  invulnUntil: number
  nextBulletId: number
  nextEnemyId: number
}

export type TimePilotState = {
  p1: TimePilotSideState
  p2: TimePilotSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

const SCORE: Record<EnemyKind, number> = { biplane: 150, fighter: 240, jet: 320, saucer: 400 }

const ERA_KIND: Record<Era, EnemyKind> = {
  '1910': 'biplane',
  '1940': 'fighter',
  '1970': 'jet',
  '1982': 'saucer',
}

function dirVec(dir: Dir) {
  if (dir === 'up') return { vx: 0, vy: -1 }
  if (dir === 'down') return { vx: 0, vy: 1 }
  if (dir === 'left') return { vx: -1, vy: 0 }
  return { vx: 1, vy: 0 }
}

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by)
}

export function eraIndex(side: TimePilotSideState) {
  return Math.floor(side.eraClock / ERA_MS) % ERAS.length
}

export function currentEra(side: TimePilotSideState): Era {
  return ERAS[eraIndex(side)]!
}

export function eraLabel(side: TimePilotSideState) {
  return currentEra(side)
}

export function enemyGlyph(kind: EnemyKind) {
  if (kind === 'saucer') return '◉'
  if (kind === 'jet') return '▲'
  if (kind === 'fighter') return '✈'
  return '🛩'
}

export function createSide(sideId: 1 | 2, now: number): TimePilotSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    px: 50,
    py: 70,
    aim: 'up',
    eraClock: 0,
    bullets: [],
    enemies: [],
    lastMoveAt: 0,
    lastFireAt: 0,
    lastSpawnAt: now + 1100,
    invulnUntil: 0,
    nextBulletId: 1,
    nextEnemyId: 1,
  }
}

export function createTimePilotState(now: number): TimePilotState {
  return {
    p1: createSide(1, now),
    p2: createSide(2, now),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

function clampPos(x: number, y: number) {
  return {
    px: Math.max(8, Math.min(92, x)),
    py: Math.max(10, Math.min(90, y)),
  }
}

function spawnEnemy(side: TimePilotSideState, rand: () => number): TimePilotSideState {
  if (side.enemies.length >= MAX_ENEMIES) return side
  const edge = Math.floor(rand() * 4)
  let x = 50
  let y = 50
  if (edge === 0) {
    x = 10 + rand() * 80
    y = 8
  } else if (edge === 1) {
    x = 10 + rand() * 80
    y = 92
  } else if (edge === 2) {
    x = 8
    y = 10 + rand() * 80
  } else {
    x = 92
    y = 10 + rand() * 80
  }
  const era = currentEra(side)
  const kind = ERA_KIND[era]
  const r = rand()
  const altKind: EnemyKind =
    r > 0.75 ? 'saucer' : r > 0.5 ? 'jet' : r > 0.25 ? 'fighter' : 'biplane'
  const enemy: TimePilotEnemy = {
    id: side.nextEnemyId,
    x,
    y,
    kind: r > 0.7 ? kind : altKind,
  }
  return { ...side, enemies: [...side.enemies, enemy], nextEnemyId: side.nextEnemyId + 1 }
}

export function tryMove(side: TimePilotSideState, dir: Dir, now: number): TimePilotSideState {
  if (side.lives <= 0 || now - side.lastMoveAt < MOVE_COOLDOWN_MS) return side
  const { vx, vy } = dirVec(dir)
  const pos = clampPos(side.px + vx * MOVE_STEP, side.py + vy * MOVE_STEP)
  return { ...side, ...pos, aim: dir, lastMoveAt: now }
}

export function setShipFromPointer(
  side: TimePilotSideState,
  clientX: number,
  clientY: number,
  rect: DOMRect,
  now: number,
): TimePilotSideState {
  if (side.lives <= 0) return side
  const px = ((clientX - rect.left) / rect.width) * 100
  const py = ((clientY - rect.top) / rect.height) * 100
  return { ...side, ...clampPos(px, py), lastMoveAt: now }
}

export function tryFire(side: TimePilotSideState, now: number): TimePilotSideState {
  if (side.lives <= 0 || side.bullets.length >= MAX_BULLETS) return side
  if (now - side.lastFireAt < FIRE_COOLDOWN_MS) return side
  const { vx, vy } = dirVec(side.aim)
  const bullet: TimePilotBullet = {
    id: side.nextBulletId,
    x: side.px,
    y: side.py,
    vx: vx * BULLET_SPEED,
    vy: vy * BULLET_SPEED,
  }
  return {
    ...side,
    bullets: [...side.bullets, bullet],
    nextBulletId: side.nextBulletId + 1,
    lastFireAt: now,
  }
}

function killPlayer(side: TimePilotSideState, now: number): TimePilotSideState {
  if (now < side.invulnUntil) return side
  const lives = side.lives - 1
  if (lives <= 0) return { ...side, lives: 0, bullets: [] }
  return {
    ...side,
    lives,
    px: 50,
    py: 70,
    bullets: [],
    invulnUntil: now + INVULN_MS,
  }
}

export function tickSide(side: TimePilotSideState, dt: number, now: number, rand: () => number): TimePilotSideState {
  if (dt <= 0 || side.lives <= 0) return side

  let s = { ...side, eraClock: side.eraClock + dt }

  if (now - s.lastSpawnAt >= ENEMY_SPAWN_MS) {
    s = spawnEnemy(s, rand)
    s = { ...s, lastSpawnAt: now }
  }

  let bullets = s.bullets.map((b) => ({
    ...b,
    x: b.x + b.vx * dt,
    y: b.y + b.vy * dt,
  }))
  bullets = bullets.filter((b) => b.x > 2 && b.x < 98 && b.y > 2 && b.y < 98)

  let enemies = s.enemies.map((e) => {
    const d = dist(e.x, e.y, s.px, s.py) || 0.01
    const speed = e.kind === 'jet' ? 0.048 : e.kind === 'saucer' ? 0.04 : 0.036
    return {
      ...e,
      x: e.x + ((s.px - e.x) / d) * speed * dt,
      y: e.y + ((s.py - e.y) / d) * speed * dt,
    }
  })

  let score = s.score
  const deadEnemies = new Set<number>()
  const deadBullets = new Set<number>()

  for (const b of bullets) {
    for (const e of enemies) {
      if (deadEnemies.has(e.id)) continue
      if (dist(b.x, b.y, e.x, e.y) < HIT_R) {
        deadEnemies.add(e.id)
        deadBullets.add(b.id)
        score += SCORE[e.kind]
      }
    }
  }

  bullets = bullets.filter((b) => !deadBullets.has(b.id))
  enemies = enemies.filter((e) => !deadEnemies.has(e.id))

  const invuln = now < s.invulnUntil
  if (!invuln) {
    for (const e of enemies) {
      if (dist(e.x, e.y, s.px, s.py) < HIT_R + 1) {
        s = killPlayer(s, now)
        break
      }
    }
  }

  return { ...s, bullets, enemies, score }
}

export function legShouldEnd(g: TimePilotState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: TimePilotSideState, p2: TimePilotSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}
