export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 3600
export const LEG_DURATION_MS = 48_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const MOVE_COOLDOWN_MS = 90
export const FIRE_COOLDOWN_MS = 240
export const INVULN_MS = 1400
export const SHIP_X = 10
export const HUMAN_Y = 86
export const SHIP_MIN_Y = 14
export const SHIP_MAX_Y = 78
export const BULLET_SPEED = 0.38
export const ENEMY_BULLET_SPEED = 0.16
export const MAX_PLAYER_BULLETS = 5
export const MAX_ENEMIES = 7
export const SPAWN_MS = 1900
export const HUMAN_X = [18, 32, 46, 60, 74] as const

export type VerticalDir = 'up' | 'down'
export type EnemyKind = 'lander' | 'bomber' | 'mutant'

export type DefHuman = {
  id: number
  x: number
  alive: boolean
}

export type DefEnemy = {
  id: number
  x: number
  y: number
  kind: EnemyKind
  vy: number
  diving: boolean
}

export type DefBullet = {
  id: number
  x: number
  y: number
  vx: number
  fromPlayer: boolean
}

export type DefenderSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  shipY: number
  humans: DefHuman[]
  enemies: DefEnemy[]
  bullets: DefBullet[]
  kills: number
  saved: number
  lastMoveAt: number
  lastFireAt: number
  lastSpawnAt: number
  invulnUntil: number
  nextId: number
}

export type DefenderState = {
  p1: DefenderSideState
  p2: DefenderSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

const SCORE: Record<EnemyKind, number> = { lander: 280, bomber: 200, mutant: 350 }
const SCORE_SAVE = 450

export function enemyGlyph(kind: EnemyKind) {
  if (kind === 'bomber') return '✈️'
  if (kind === 'mutant') return '👾'
  return '🛸'
}

function createHumans(): DefHuman[] {
  return HUMAN_X.map((x, i) => ({ id: i + 1, x, alive: true }))
}

export function createSide(sideId: 1 | 2, now: number): DefenderSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    shipY: 48,
    humans: createHumans(),
    enemies: [],
    bullets: [],
    kills: 0,
    saved: 0,
    lastMoveAt: 0,
    lastFireAt: 0,
    lastSpawnAt: now + 1200,
    invulnUntil: 0,
    nextId: 1,
  }
}

export function createDefenderState(now: number): DefenderState {
  return {
    p1: createSide(1, now),
    p2: createSide(2, now),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

function respawn(side: DefenderSideState, now: number): DefenderSideState {
  if (now < side.invulnUntil) return side
  const lives = side.lives - 1
  if (lives <= 0) return { ...side, lives: 0 }
  return { ...side, lives, invulnUntil: now + INVULN_MS }
}

export function tryMove(side: DefenderSideState, dir: VerticalDir, now: number): DefenderSideState {
  if (side.lives <= 0 || now - side.lastMoveAt < MOVE_COOLDOWN_MS) return side
  let shipY = side.shipY
  if (dir === 'up') shipY -= 5
  if (dir === 'down') shipY += 5
  shipY = Math.max(SHIP_MIN_Y, Math.min(SHIP_MAX_Y, shipY))
  if (shipY === side.shipY) return side
  return { ...side, shipY, lastMoveAt: now }
}

export function setShipY(side: DefenderSideState, y: number, now: number): DefenderSideState {
  if (side.lives <= 0) return side
  const shipY = Math.max(SHIP_MIN_Y, Math.min(SHIP_MAX_Y, y))
  return { ...side, shipY, lastMoveAt: now }
}

export function tryFire(side: DefenderSideState, now: number): DefenderSideState {
  if (side.lives <= 0 || now - side.lastFireAt < FIRE_COOLDOWN_MS) return side
  if (side.bullets.filter((b) => b.fromPlayer).length >= MAX_PLAYER_BULLETS) return side

  const bullet: DefBullet = {
    id: side.nextId,
    x: SHIP_X + 4,
    y: side.shipY,
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

function spawnEnemy(side: DefenderSideState, now: number, rand: () => number): DefenderSideState {
  if (side.enemies.length >= MAX_ENEMIES || now - side.lastSpawnAt < SPAWN_MS) return side

  const kinds: EnemyKind[] = ['lander', 'bomber', 'mutant']
  const kind = kinds[Math.floor(rand() * kinds.length)]!
  const y = kind === 'bomber' ? 12 + rand() * 18 : kind === 'mutant' ? 30 + rand() * 30 : 22 + rand() * 20

  const enemy: DefEnemy = {
    id: side.nextId,
    x: 102 + rand() * 8,
    y,
    kind,
    vy: 0,
    diving: false,
  }
  return {
    ...side,
    enemies: [...side.enemies, enemy],
    nextId: side.nextId + 1,
    lastSpawnAt: now,
  }
}

function nearestHumanX(side: DefenderSideState, x: number) {
  const alive = side.humans.filter((h) => h.alive)
  if (alive.length === 0) return null
  return alive.sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0]!
}

export function tickSide(side: DefenderSideState, dt: number, now: number, rand: () => number): DefenderSideState {
  if (dt <= 0 || side.lives <= 0) return side

  let s = spawnEnemy(side, now, rand)

  let enemies = s.enemies.map((e) => {
    let { x, y, vy, diving } = e
    const speed = e.kind === 'mutant' ? 0.055 : e.kind === 'bomber' ? 0.04 : 0.035
    x -= speed * dt

    if (e.kind === 'lander' && x < 72 && !diving) {
      const target = nearestHumanX(s, x)
      if (target && rand() > 0.02) {
        diving = true
        vy = 0.045
      }
    }
    if (diving) {
      y += vy * dt
    }

    if (e.kind === 'bomber' && rand() > 0.992) {
      s = {
        ...s,
        bullets: [
          ...s.bullets,
          {
            id: s.nextId,
            x,
            y: y + 2,
            vx: -ENEMY_BULLET_SPEED,
            fromPlayer: false,
          },
        ],
        nextId: s.nextId + 1,
      }
    }

    return { ...e, x, y, vy, diving }
  })

  for (const e of enemies) {
    if (e.kind !== 'lander' || !e.diving || e.y < HUMAN_Y - 5) continue
    const h = nearestHumanX(s, e.x)
    if (h && Math.abs(e.x - h.x) < 10) {
      s = {
        ...s,
        humans: s.humans.map((hum) => (hum.id === h.id ? { ...hum, alive: false } : hum)),
        score: Math.max(0, s.score - 80),
      }
      enemies = enemies.filter((en) => en.id !== e.id)
      break
    }
  }

  let bullets = s.bullets.map((b) => ({
    ...b,
    x: b.x + b.vx * dt,
  }))

  const hitEnemyIds = new Set<number>()
  const hitBulletIds = new Set<number>()

  for (const b of bullets) {
    if (!b.fromPlayer) continue
    for (const e of enemies) {
      if (hitEnemyIds.has(e.id)) continue
      if (Math.abs(b.x - e.x) < 5 && Math.abs(b.y - e.y) < 6) {
        hitEnemyIds.add(e.id)
        hitBulletIds.add(b.id)
        let score = s.score + SCORE[e.kind]
        let saved = s.saved
        if (e.kind === 'lander' && e.diving) {
          score += SCORE_SAVE
          saved += 1
        }
        s = { ...s, score, kills: s.kills + 1, saved }
        break
      }
    }
  }

  enemies = enemies.filter((e) => !hitEnemyIds.has(e.id))
  bullets = bullets.filter((b) => !hitBulletIds.has(b.id) && b.x > -2 && b.x < 108)

  const invuln = now < s.invulnUntil
  if (!invuln) {
    for (const e of enemies) {
      if (Math.abs(e.x - SHIP_X) < 8 && Math.abs(e.y - s.shipY) < 8) {
        s = respawn(s, now)
        break
      }
    }
    if (s.lives > 0 && now >= s.invulnUntil) {
      for (const b of bullets) {
        if (b.fromPlayer) continue
        if (Math.abs(b.x - SHIP_X) < 6 && Math.abs(b.y - s.shipY) < 6) {
          s = respawn(s, now)
          break
        }
      }
    }
  }

  s = {
    ...s,
    enemies: enemies.filter((e) => e.x > -5),
    bullets: bullets.slice(-12),
  }

  return s
}

export function legShouldEnd(g: DefenderState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: DefenderSideState, p2: DefenderSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}

export function humansAlive(side: DefenderSideState) {
  return side.humans.filter((h) => h.alive).length
}
