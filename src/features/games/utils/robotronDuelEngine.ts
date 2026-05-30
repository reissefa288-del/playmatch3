export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 4000
export const LEG_DURATION_MS = 46_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const MOVE_STEP = 4.5
export const MOVE_COOLDOWN_MS = 110
export const FIRE_COOLDOWN_MS = 200
export const BULLET_SPEED = 0.14
export const INVULN_MS = 1300
export const ENEMY_SPAWN_MS = 2200
export const MAX_ENEMIES = 10
export const MAX_BULLETS = 6
export const HIT_R = 4.5

export type Dir = 'up' | 'down' | 'left' | 'right'

export type RobotronBullet = { id: number; x: number; y: number; vx: number; vy: number }
export type RobotronEnemy = {
  id: number
  x: number
  y: number
  kind: 'grunt' | 'sphere' | 'brain'
}
export type RobotronHuman = { id: number; x: number; y: number; saved: boolean }

export type RobotronSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  px: number
  py: number
  aim: Dir
  bullets: RobotronBullet[]
  enemies: RobotronEnemy[]
  humans: RobotronHuman[]
  lastMoveAt: number
  lastFireAt: number
  lastSpawnAt: number
  invulnUntil: number
  nextBulletId: number
  nextEnemyId: number
  nextHumanId: number
}

export type RobotronState = {
  p1: RobotronSideState
  p2: RobotronSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

const SCORE: Record<RobotronEnemy['kind'] | 'human', number> = {
  grunt: 160,
  sphere: 240,
  brain: 360,
  human: 520,
}

function dirVec(dir: Dir) {
  if (dir === 'up') return { vx: 0, vy: -1 }
  if (dir === 'down') return { vx: 0, vy: 1 }
  if (dir === 'left') return { vx: -1, vy: 0 }
  return { vx: 1, vy: 0 }
}

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function enemyGlyph(kind: RobotronEnemy['kind']) {
  if (kind === 'brain') return '🧠'
  if (kind === 'sphere') return '●'
  return '▣'
}

export function createHumans(seed: number): RobotronHuman[] {
  const rand = mulberry32(seed)
  const humans: RobotronHuman[] = []
  for (let i = 0; i < 3; i++) {
    humans.push({
      id: i + 1,
      x: 15 + rand() * 70,
      y: 12 + rand() * 35,
      saved: false,
    })
  }
  return humans
}

export function createSide(sideId: 1 | 2, seed: number, now: number): RobotronSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    px: 50,
    py: 72,
    aim: 'up',
    bullets: [],
    enemies: [],
    humans: createHumans(seed),
    lastMoveAt: 0,
    lastFireAt: 0,
    lastSpawnAt: now + 1200,
    invulnUntil: 0,
    nextBulletId: 1,
    nextEnemyId: 1,
    nextHumanId: 10,
  }
}

export function createRobotronState(now: number): RobotronState {
  return {
    p1: createSide(1, 19001, now),
    p2: createSide(2, 29001, now),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

function clampPos(x: number, y: number) {
  return {
    px: Math.max(8, Math.min(92, x)),
    py: Math.max(10, Math.min(88, y)),
  }
}

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by)
}

function spawnEnemy(side: RobotronSideState, rand: () => number): RobotronSideState {
  if (side.enemies.length >= MAX_ENEMIES) return side
  const edge = Math.floor(rand() * 4)
  let x = 50
  let y = 50
  if (edge === 0) {
    x = rand() * 100
    y = 8
  } else if (edge === 1) {
    x = rand() * 100
    y = 92
  } else if (edge === 2) {
    x = 8
    y = rand() * 100
  } else {
    x = 92
    y = rand() * 100
  }
  const r = rand()
  const kind: RobotronEnemy['kind'] = r > 0.82 ? 'brain' : r > 0.55 ? 'sphere' : 'grunt'
  const enemy: RobotronEnemy = { id: side.nextEnemyId, x, y, kind }
  return { ...side, enemies: [...side.enemies, enemy], nextEnemyId: side.nextEnemyId + 1 }
}

export function tryMove(side: RobotronSideState, dir: Dir, now: number): RobotronSideState {
  if (side.lives <= 0 || now - side.lastMoveAt < MOVE_COOLDOWN_MS) return side
  const { vx, vy } = dirVec(dir)
  const pos = clampPos(side.px + vx * MOVE_STEP, side.py + vy * MOVE_STEP)
  return { ...side, ...pos, aim: dir, lastMoveAt: now }
}

export function tryFire(side: RobotronSideState, now: number): RobotronSideState {
  if (side.lives <= 0 || side.bullets.length >= MAX_BULLETS) return side
  if (now - side.lastFireAt < FIRE_COOLDOWN_MS) return side
  const { vx, vy } = dirVec(side.aim)
  const bullet: RobotronBullet = {
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

function killPlayer(side: RobotronSideState, now: number): RobotronSideState {
  if (now < side.invulnUntil) return side
  const lives = side.lives - 1
  if (lives <= 0) return { ...side, lives: 0, bullets: [] }
  return {
    ...side,
    lives,
    px: 50,
    py: 72,
    bullets: [],
    invulnUntil: now + INVULN_MS,
  }
}

export function tickSide(side: RobotronSideState, dt: number, now: number, rand: () => number): RobotronSideState {
  if (dt <= 0 || side.lives <= 0) return side

  let s = side

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
    const speed = e.kind === 'sphere' ? 0.042 : e.kind === 'brain' ? 0.028 : 0.035
    const vx = ((s.px - e.x) / d) * speed * dt
    const vy = ((s.py - e.y) / d) * speed * dt
    return { ...e, x: e.x + vx, y: e.y + vy }
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

  for (const e of enemies) {
    if (dist(e.x, e.y, s.px, s.py) < HIT_R + 1 && now >= s.invulnUntil) {
      s = killPlayer(s, now)
      break
    }
  }

  let humans = s.humans.map((h) => {
    if (h.saved) return h
    if (dist(h.x, h.y, s.px, s.py) < HIT_R + 2) {
      score += SCORE.human
      return { ...h, saved: true }
    }
    for (const e of enemies) {
      if (dist(h.x, h.y, e.x, e.y) < HIT_R) {
        return { ...h, saved: true }
      }
    }
    return h
  })

  if (humans.every((h) => h.saved) && enemies.length < 4) {
    humans = createHumans(s.sideId * 3000 + Math.floor(now / 1000))
    s = { ...s, nextHumanId: s.nextHumanId + 3 }
  }

  return { ...s, bullets, enemies, humans, score }
}

export function legShouldEnd(g: RobotronState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: RobotronSideState, p2: RobotronSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}
