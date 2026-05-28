export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 4200
export const LEG_DURATION_MS = 42_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const SHIP_Y = 88
export const FIRE_COOLDOWN_MS = 200
export const BULLET_SPEED = 0.14
export const ENEMY_BULLET_SPEED = 0.09
export const INVULN_MS = 1400
export const SHIP_W = 14

export type EnemyKind = 'bee' | 'butterfly' | 'boss'

export type GalagaEnemy = {
  id: number
  kind: EnemyKind
  mode: 'formation' | 'dive'
  x: number
  y: number
  homeX: number
  homeY: number
  hp: number
  vx: number
  vy: number
}

export type GalagaBullet = { id: number; x: number; y: number }
export type GalagaEnemyBullet = { id: number; x: number; y: number }

export type GalagaSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  shipX: number
  bullets: GalagaBullet[]
  enemyBullets: GalagaEnemyBullet[]
  enemies: GalagaEnemy[]
  formationPhase: number
  nextDiveAt: number
  nextEnemyShotAt: number
  lastShotAt: number
  invulnUntil: number
  nextBulletId: number
  nextEnemyId: number
}

export type GalagaState = {
  p1: GalagaSideState
  p2: GalagaSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

const SCORE: Record<EnemyKind, number> = { bee: 100, butterfly: 220, boss: 450 }

export function enemyGlyph(kind: EnemyKind) {
  if (kind === 'boss') return '👾'
  if (kind === 'butterfly') return '🛸'
  return '🐝'
}

export function createSide(sideId: 1 | 2, now: number): GalagaSideState {
  const side: GalagaSideState = {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    shipX: 50,
    bullets: [],
    enemyBullets: [],
    enemies: [],
    formationPhase: 0,
    nextDiveAt: now + 2200,
    nextEnemyShotAt: now + 1800,
    lastShotAt: 0,
    invulnUntil: 0,
    nextBulletId: 1,
    nextEnemyId: 1,
  }
  return { ...side, enemies: buildFormation(side) }
}

export function createGalagaState(now: number): GalagaState {
  return {
    p1: createSide(1, now),
    p2: createSide(2, now),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

function buildFormation(side: GalagaSideState): GalagaEnemy[] {
  const rows: { kind: EnemyKind; cols: number; y: number }[] = [
    { kind: 'boss', cols: 4, y: 10 },
    { kind: 'butterfly', cols: 5, y: 20 },
    { kind: 'butterfly', cols: 5, y: 28 },
    { kind: 'bee', cols: 6, y: 36 },
  ]
  const enemies: GalagaEnemy[] = []
  let id = side.nextEnemyId
  for (const row of rows) {
    const span = 78
    const startX = 50 - span / 2
    const gap = row.cols > 1 ? span / (row.cols - 1) : 0
    for (let c = 0; c < row.cols; c++) {
      const homeX = row.cols === 1 ? 50 : startX + c * gap
      const hp = row.kind === 'boss' ? 2 : 1
      enemies.push({
        id: id++,
        kind: row.kind,
        mode: 'formation',
        x: homeX,
        y: row.y,
        homeX,
        homeY: row.y,
        hp,
        vx: 0,
        vy: 0,
      })
    }
  }
  return enemies
}

export function respawnFormation(side: GalagaSideState): GalagaSideState {
  const enemies = buildFormation(side)
  const maxId = enemies.reduce((m, e) => Math.max(m, e.id), side.nextEnemyId)
  return {
    ...side,
    enemies,
    enemyBullets: [],
    bullets: [],
    nextEnemyId: maxId + 1,
  }
}

export function clampShip(x: number) {
  return Math.max(8, Math.min(92, x))
}

export function moveShip(side: GalagaSideState, x: number): GalagaSideState {
  return { ...side, shipX: clampShip(x) }
}

export function tryShoot(side: GalagaSideState, now: number): GalagaSideState {
  if (side.lives <= 0) return side
  if (now - side.lastShotAt < FIRE_COOLDOWN_MS) return side
  const bullet: GalagaBullet = {
    id: side.nextBulletId,
    x: side.shipX,
    y: SHIP_Y - 6,
  }
  return {
    ...side,
    bullets: [...side.bullets, bullet],
    nextBulletId: side.nextBulletId + 1,
    lastShotAt: now,
  }
}

function hitboxOverlap(ax: number, ay: number, bx: number, by: number, r: number) {
  const dx = ax - bx
  const dy = ay - by
  return dx * dx + dy * dy < r * r
}

function startDive(side: GalagaSideState, now: number, rand: () => number): GalagaSideState {
  const candidates = side.enemies.filter((e) => e.mode === 'formation')
  if (candidates.length === 0) {
    return { ...side, nextDiveAt: now + 1200 }
  }
  const pick = candidates[Math.floor(rand() * candidates.length)]!
  const toward = side.shipX > pick.x ? 0.04 : -0.04
  const enemies = side.enemies.map((e) =>
    e.id === pick.id
      ? {
          ...e,
          mode: 'dive' as const,
          vx: toward + (rand() - 0.5) * 0.03,
          vy: 0.055 + rand() * 0.02,
        }
      : e,
  )
  return { ...side, enemies, nextDiveAt: now + 2200 + rand() * 1800 }
}

function enemyShoot(side: GalagaSideState, now: number, rand: () => number): GalagaSideState {
  const divers = side.enemies.filter((e) => e.mode === 'dive' && e.y > 25 && e.y < 70)
  if (divers.length === 0) return { ...side, nextEnemyShotAt: now + 900 + rand() * 700 }
  const shooter = divers[Math.floor(rand() * divers.length)]!
  const bullet: GalagaEnemyBullet = {
    id: side.nextBulletId,
    x: shooter.x,
    y: shooter.y + 4,
  }
  return {
    ...side,
    enemyBullets: [...side.enemyBullets, bullet],
    nextBulletId: side.nextBulletId + 1,
    nextEnemyShotAt: now + 1100 + rand() * 900,
  }
}

export function tickSide(side: GalagaSideState, dt: number, now: number, rand: () => number): GalagaSideState {
  if (dt <= 0) return side

  let s = { ...side }
  s.formationPhase += dt * 0.0028
  const sway = Math.sin(s.formationPhase) * 18

  s.bullets = s.bullets
    .map((b) => ({ ...b, y: b.y - BULLET_SPEED * dt }))
    .filter((b) => b.y > -4)

  s.enemyBullets = s.enemyBullets
    .map((b) => ({ ...b, y: b.y + ENEMY_BULLET_SPEED * dt }))
    .filter((b) => b.y < 104)

  s.enemies = s.enemies
    .map((e) => {
      if (e.mode === 'formation') {
        return { ...e, x: e.homeX + sway, y: e.homeY }
      }
      return { ...e, x: e.x + e.vx * dt, y: e.y + e.vy * dt }
    })
    .filter((e) => e.y < 102)

  const hitBullets = new Set<number>()
  const hitEnemies = new Set<number>()
  let scoreGain = 0

  for (const b of s.bullets) {
    for (const e of s.enemies) {
      if (hitEnemies.has(e.id)) continue
      const r = e.kind === 'boss' ? 5.5 : 4.2
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
    s = respawnFormation(s)
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
    if (!invuln) {
      for (const e of s.enemies) {
        if (e.mode === 'dive' && hitboxOverlap(e.x, e.y, s.shipX, SHIP_Y, 6)) {
          s.lives -= 1
          s.invulnUntil = now + INVULN_MS
          s.enemies = s.enemies.filter((en) => en.id !== e.id)
          break
        }
      }
    }
  }

  if (now >= s.nextDiveAt) s = startDive(s, now, rand)
  if (now >= s.nextEnemyShotAt) s = enemyShoot(s, now, rand)

  return s
}

export function legShouldEnd(g: GalagaState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: GalagaSideState, p2: GalagaSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}
