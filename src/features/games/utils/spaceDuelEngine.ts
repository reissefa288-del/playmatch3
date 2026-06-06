export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 4200
export const LEG_DURATION_MS = 42_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const SHIP_Y = 88
export const FIRE_COOLDOWN_MS = 130
export const BULLET_SPEED = 0.15
export const ENEMY_BULLET_SPEED = 0.085
export const INVULN_MS = 1400
export const WAVE_CLEAR_BONUS = 280

export type EnemyKind = 'drone' | 'saucer' | 'core'

export type SpaceEnemy = {
  id: number
  kind: EnemyKind
  x: number
  y: number
  homeX: number
  homeY: number
  hp: number
  phase: number
}

export type SpaceBullet = { id: number; x: number; y: number }
export type SpaceEnemyBullet = { id: number; x: number; y: number }

export type SpaceSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  shipX: number
  wave: number
  waveFlashUntil: number
  bullets: SpaceBullet[]
  enemyBullets: SpaceEnemyBullet[]
  enemies: SpaceEnemy[]
  formationPhase: number
  nextEnemyShotAt: number
  lastShotAt: number
  invulnUntil: number
  nextBulletId: number
  nextEnemyId: number
}

export type SpaceState = {
  p1: SpaceSideState
  p2: SpaceSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

const SCORE: Record<EnemyKind, number> = { drone: 90, saucer: 200, core: 380 }

export function enemyLabel(kind: EnemyKind) {
  if (kind === 'core') return '★'
  if (kind === 'saucer') return '⬡'
  return '◆'
}

function spawnEnemy(
  id: number,
  kind: EnemyKind,
  homeX: number,
  homeY: number,
  hp = 1,
): SpaceEnemy {
  return {
    id,
    kind,
    x: homeX,
    y: homeY,
    homeX,
    homeY,
    hp,
    phase: homeX * 0.11 + homeY * 0.07,
  }
}

function buildWave(side: SpaceSideState, wave: number): SpaceEnemy[] {
  const pattern = (wave - 1) % 3
  const enemies: SpaceEnemy[] = []
  let id = side.nextEnemyId

  if (pattern === 0) {
    const count = 6 + Math.min(3, Math.floor(wave / 2))
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1)
      const homeX = 18 + t * 64
      const homeY = 12 + Math.sin(t * Math.PI) * 10
      enemies.push(spawnEnemy(id++, 'drone', homeX, homeY))
    }
  } else if (pattern === 1) {
    for (let c = 0; c < 5; c++) {
      enemies.push(spawnEnemy(id++, 'saucer', 22 + c * 14, 18))
    }
    for (let c = 0; c < 4; c++) {
      enemies.push(spawnEnemy(id++, 'drone', 28 + c * 14, 30))
    }
    if (wave >= 2) {
      enemies.push(spawnEnemy(id++, 'core', 50, 14, 2))
    }
  } else {
    const nodes = [
      [50, 12, 'core', 2],
      [34, 22, 'saucer', 1],
      [66, 22, 'saucer', 1],
      [26, 34, 'drone', 1],
      [50, 32, 'drone', 1],
      [74, 34, 'drone', 1],
      [38, 42, 'drone', 1],
      [62, 42, 'drone', 1],
    ] as const
    for (const [x, y, kind, hp] of nodes) {
      enemies.push(spawnEnemy(id++, kind, x, y, hp))
    }
    if (wave >= 3) {
      enemies.push(spawnEnemy(id++, 'saucer', 18, 26))
      enemies.push(spawnEnemy(id++, 'saucer', 82, 26))
    }
  }

  return enemies
}

export function createSide(sideId: 1 | 2, now: number): SpaceSideState {
  const side: SpaceSideState = {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    shipX: 50,
    wave: 1,
    waveFlashUntil: 0,
    bullets: [],
    enemyBullets: [],
    enemies: [],
    formationPhase: 0,
    nextEnemyShotAt: now + 1400,
    lastShotAt: 0,
    invulnUntil: 0,
    nextBulletId: 1,
    nextEnemyId: 1,
  }
  return { ...side, enemies: buildWave(side, 1) }
}

export function createSpaceState(now: number): SpaceState {
  return {
    p1: createSide(1, now),
    p2: createSide(2, now),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

export function advanceWave(side: SpaceSideState, now: number): SpaceSideState {
  const wave = side.wave + 1
  const enemies = buildWave({ ...side, wave }, wave)
  const maxId = enemies.reduce((m, e) => Math.max(m, e.id), side.nextEnemyId)
  const bonus = WAVE_CLEAR_BONUS * side.wave
  return {
    ...side,
    wave,
    score: side.score + bonus,
    enemies,
    enemyBullets: [],
    bullets: [],
    nextEnemyId: maxId + 1,
    waveFlashUntil: now + 700,
    nextEnemyShotAt: now + 900,
  }
}

export function clampShip(x: number) {
  return Math.max(8, Math.min(92, x))
}

export function moveShip(side: SpaceSideState, x: number): SpaceSideState {
  return { ...side, shipX: clampShip(x) }
}

function autoShoot(side: SpaceSideState, now: number): SpaceSideState {
  if (side.lives <= 0) return side
  if (now - side.lastShotAt < FIRE_COOLDOWN_MS) return side

  const y = SHIP_Y - 6
  const spread = 2.8
  const bullets: SpaceBullet[] = [
    { id: side.nextBulletId, x: side.shipX - spread, y },
    { id: side.nextBulletId + 1, x: side.shipX + spread, y },
  ]

  return {
    ...side,
    bullets: [...side.bullets, ...bullets],
    nextBulletId: side.nextBulletId + 2,
    lastShotAt: now,
  }
}

function hitboxOverlap(ax: number, ay: number, bx: number, by: number, r: number) {
  const dx = ax - bx
  const dy = ay - by
  return dx * dx + dy * dy < r * r
}

function enemyShoot(side: SpaceSideState, now: number, rand: () => number): SpaceSideState {
  if (side.enemies.length === 0) {
    return { ...side, nextEnemyShotAt: now + 800 }
  }
  const shooter = side.enemies[Math.floor(rand() * side.enemies.length)]!
  const bullet: SpaceEnemyBullet = {
    id: side.nextBulletId,
    x: shooter.x,
    y: shooter.y + 5,
  }
  const interval = Math.max(650, 1200 - side.wave * 45)
  return {
    ...side,
    enemyBullets: [...side.enemyBullets, bullet],
    nextBulletId: side.nextBulletId + 1,
    nextEnemyShotAt: now + interval + rand() * 500,
  }
}

export function tickSide(side: SpaceSideState, dt: number, now: number, rand: () => number): SpaceSideState {
  if (dt <= 0) return side

  let s = autoShoot(side, now)
  s = { ...s, formationPhase: s.formationPhase + dt * 0.0024 }

  s.bullets = s.bullets
    .map((b) => ({ ...b, y: b.y - BULLET_SPEED * dt }))
    .filter((b) => b.y > -4)

  s.enemyBullets = s.enemyBullets
    .map((b) => ({ ...b, y: b.y + (ENEMY_BULLET_SPEED + s.wave * 0.0012) * dt }))
    .filter((b) => b.y < 104)

  s.enemies = s.enemies.map((e) => {
    const orbitX = Math.sin(s.formationPhase + e.phase) * 10
    const orbitY = Math.cos(s.formationPhase * 0.85 + e.phase) * 5
    const driftY = Math.min(8, s.wave * 0.6)
    return {
      ...e,
      x: e.homeX + orbitX,
      y: e.homeY + orbitY + driftY,
    }
  })

  const hitBullets = new Set<number>()
  const hitEnemies = new Set<number>()
  let scoreGain = 0

  for (const b of s.bullets) {
    for (const e of s.enemies) {
      if (hitEnemies.has(e.id)) continue
      const r = e.kind === 'core' ? 5.5 : 4
      if (hitboxOverlap(b.x, b.y, e.x, e.y, r)) {
        hitBullets.add(b.id)
        const hp = e.hp - 1
        if (hp <= 0) {
          hitEnemies.add(e.id)
          scoreGain += SCORE[e.kind]
        } else {
          s.enemies = s.enemies.map((en) => (en.id === e.id ? { ...en, hp } : en))
        }
        break
      }
    }
  }

  if (hitBullets.size > 0) {
    s.bullets = s.bullets.filter((b) => !hitBullets.has(b.id))
  }
  if (hitEnemies.size > 0) {
    s.enemies = s.enemies.filter((e) => !hitEnemies.has(e.id))
    s.score += scoreGain
  }

  if (s.enemies.length === 0) {
    s = advanceWave(s, now)
  }

  const invuln = now < s.invulnUntil
  if (!invuln && s.lives > 0) {
    for (const eb of s.enemyBullets) {
      if (hitboxOverlap(eb.x, eb.y, s.shipX, SHIP_Y, 5.5)) {
        s.lives -= 1
        s.invulnUntil = now + INVULN_MS
        s.enemyBullets = []
        break
      }
    }
    if (now >= s.invulnUntil) {
      for (const e of s.enemies) {
        if (hitboxOverlap(e.x, e.y, s.shipX, SHIP_Y, 5.8)) {
          s.lives -= 1
          s.invulnUntil = now + INVULN_MS
          s.enemies = s.enemies.filter((en) => en.id !== e.id)
          break
        }
      }
    }
  }

  if (now >= s.nextEnemyShotAt) s = enemyShoot(s, now, rand)

  return s
}

export function legShouldEnd(g: SpaceState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: SpaceSideState, p2: SpaceSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}
