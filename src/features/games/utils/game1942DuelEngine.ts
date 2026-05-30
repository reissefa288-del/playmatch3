export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 4000
export const LEG_DURATION_MS = 44_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const SHIP_Y = 88
export const FIRE_COOLDOWN_MS = 190
export const BULLET_SPEED = 0.16
export const ENEMY_BULLET_SPEED = 0.095
export const INVULN_MS = 1400
export const SCROLL_SPEED = 0.012

export type EnemyKind = 'zero' | 'valkyrie' | 'ace'

export type Game1942Enemy = {
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

export type Game1942Bullet = { id: number; x: number; y: number }
export type Game1942EnemyBullet = { id: number; x: number; y: number }

export type Game1942SideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  shipX: number
  bullets: Game1942Bullet[]
  enemyBullets: Game1942EnemyBullet[]
  enemies: Game1942Enemy[]
  formationPhase: number
  scrollY: number
  nextDiveAt: number
  nextEnemyShotAt: number
  lastShotAt: number
  invulnUntil: number
  nextBulletId: number
  nextEnemyId: number
}

export type Game1942State = {
  p1: Game1942SideState
  p2: Game1942SideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

const SCORE: Record<EnemyKind, number> = { zero: 120, valkyrie: 240, ace: 480 }

export function enemyGlyph(kind: EnemyKind) {
  if (kind === 'ace') return '🔴'
  if (kind === 'valkyrie') return '✈'
  return '▪'
}

export function createSide(sideId: 1 | 2, now: number): Game1942SideState {
  const side: Game1942SideState = {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    shipX: 50,
    bullets: [],
    enemyBullets: [],
    enemies: [],
    formationPhase: 0,
    scrollY: 0,
    nextDiveAt: now + 2000,
    nextEnemyShotAt: now + 1600,
    lastShotAt: 0,
    invulnUntil: 0,
    nextBulletId: 1,
    nextEnemyId: 1,
  }
  return { ...side, enemies: buildFormation(side) }
}

export function createGame1942State(now: number): Game1942State {
  return {
    p1: createSide(1, now),
    p2: createSide(2, now),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

function buildFormation(side: Game1942SideState): Game1942Enemy[] {
  const layout: { kind: EnemyKind; cols: number; y: number; spread: number }[] = [
    { kind: 'ace', cols: 5, y: 8, spread: 70 },
    { kind: 'valkyrie', cols: 4, y: 18, spread: 58 },
    { kind: 'valkyrie', cols: 4, y: 26, spread: 58 },
    { kind: 'zero', cols: 6, y: 36, spread: 76 },
  ]
  const enemies: Game1942Enemy[] = []
  let id = side.nextEnemyId
  for (const row of layout) {
    const gap = row.cols > 1 ? row.spread / (row.cols - 1) : 0
    const startX = 50 - row.spread / 2
    for (let c = 0; c < row.cols; c++) {
      const homeX = row.cols === 1 ? 50 : startX + c * gap
      const hp = row.kind === 'ace' ? 2 : 1
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

export function respawnFormation(side: Game1942SideState): Game1942SideState {
  const enemies = buildFormation(side)
  const maxId = enemies.reduce((m, e) => Math.max(m, e.id), side.nextEnemyId)
  return {
    ...side,
    enemies,
    enemyBullets: [],
    bullets: [],
    scrollY: 0,
    nextEnemyId: maxId + 1,
  }
}

export function clampShip(x: number) {
  return Math.max(8, Math.min(92, x))
}

export function moveShip(side: Game1942SideState, x: number): Game1942SideState {
  return { ...side, shipX: clampShip(x) }
}

export function tryShoot(side: Game1942SideState, now: number): Game1942SideState {
  if (side.lives <= 0) return side
  if (now - side.lastShotAt < FIRE_COOLDOWN_MS) return side
  const bullet: Game1942Bullet = {
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

function startDive(side: Game1942SideState, now: number, rand: () => number): Game1942SideState {
  const candidates = side.enemies.filter((e) => e.mode === 'formation')
  if (candidates.length === 0) {
    return { ...side, nextDiveAt: now + 1100 }
  }
  const pick = candidates[Math.floor(rand() * candidates.length)]!
  const toward = side.shipX > pick.x ? 0.045 : -0.045
  const enemies = side.enemies.map((e) =>
    e.id === pick.id
      ? {
          ...e,
          mode: 'dive' as const,
          vx: toward + (rand() - 0.5) * 0.035,
          vy: 0.06 + rand() * 0.025,
        }
      : e,
  )
  return { ...side, enemies, nextDiveAt: now + 2000 + rand() * 1600 }
}

function enemyShoot(side: Game1942SideState, now: number, rand: () => number): Game1942SideState {
  const shooters = side.enemies.filter((e) => (e.mode === 'dive' || e.kind === 'valkyrie') && e.y > 22 && e.y < 72)
  if (shooters.length === 0) return { ...side, nextEnemyShotAt: now + 800 + rand() * 600 }
  const shooter = shooters[Math.floor(rand() * shooters.length)]!
  const bullet: Game1942EnemyBullet = {
    id: side.nextBulletId,
    x: shooter.x,
    y: shooter.y + 4,
  }
  return {
    ...side,
    enemyBullets: [...side.enemyBullets, bullet],
    nextBulletId: side.nextBulletId + 1,
    nextEnemyShotAt: now + 1000 + rand() * 800,
  }
}

export function tickSide(side: Game1942SideState, dt: number, now: number, rand: () => number): Game1942SideState {
  if (dt <= 0) return side

  let s = { ...side }
  s.formationPhase += dt * 0.0025
  s.scrollY += SCROLL_SPEED * dt
  const sway = Math.sin(s.formationPhase) * 14

  s.bullets = s.bullets
    .map((b) => ({ ...b, y: b.y - BULLET_SPEED * dt }))
    .filter((b) => b.y > -4)

  s.enemyBullets = s.enemyBullets
    .map((b) => ({ ...b, y: b.y + ENEMY_BULLET_SPEED * dt }))
    .filter((b) => b.y < 104)

  s.enemies = s.enemies
    .map((e) => {
      if (e.mode === 'formation') {
        return { ...e, x: e.homeX + sway, y: e.homeY + s.scrollY * 0.35 }
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
      const r = e.kind === 'ace' ? 5.5 : 4.2
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
    if (now >= s.invulnUntil) {
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

export function legShouldEnd(g: Game1942State, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: Game1942SideState, p2: Game1942SideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}
