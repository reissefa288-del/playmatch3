export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 3800
export const LEG_DURATION_MS = 46_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const MOVE_COOLDOWN_MS = 85
export const FIRE_COOLDOWN_MS = 230
export const INVULN_MS = 1400
export const SHIP_X = 12
export const SHIP_MIN_Y = 14
export const SHIP_MAX_Y = 82
export const BULLET_SPEED = 0.4
export const ENEMY_BULLET_SPEED = 0.18
export const MAX_PLAYER_BULLETS = 8
export const MAX_ENEMIES = 8
export const SPAWN_MS = 1750
export const SCROLL_SPEED = 0.018

export type VerticalDir = 'up' | 'down'
export type EnemyKind = 'fighter' | 'gunship' | 'core'

export type GradiusEnemy = {
  id: number
  x: number
  y: number
  kind: EnemyKind
  hp: number
  wobble: number
}

export type GradiusBullet = {
  id: number
  x: number
  y: number
  vx: number
  fromPlayer: boolean
}

export type GradiusCapsule = {
  id: number
  x: number
  y: number
}

export type GradiusSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  shipY: number
  power: number
  scrollPhase: number
  enemies: GradiusEnemy[]
  bullets: GradiusBullet[]
  capsules: GradiusCapsule[]
  lastMoveAt: number
  lastFireAt: number
  lastSpawnAt: number
  invulnUntil: number
  nextId: number
}

export type GradiusState = {
  p1: GradiusSideState
  p2: GradiusSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

const SCORE: Record<EnemyKind, number> = { fighter: 160, gunship: 280, core: 420 }

function powerFireCooldown(power: number) {
  return power >= 2 ? 160 : power >= 1 ? 200 : 230
}

export function enemyGlyph(kind: EnemyKind) {
  if (kind === 'core') return '◈'
  if (kind === 'gunship') return '▣'
  return '◇'
}

export function createSide(sideId: 1 | 2, now: number): GradiusSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    shipY: 50,
    power: 0,
    scrollPhase: 0,
    enemies: [],
    bullets: [],
    capsules: [],
    lastMoveAt: 0,
    lastFireAt: 0,
    lastSpawnAt: now + 1000,
    invulnUntil: 0,
    nextId: 1,
  }
}

export function createGradiusState(now: number): GradiusState {
  return {
    p1: createSide(1, now),
    p2: createSide(2, now),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

function respawn(side: GradiusSideState, now: number): GradiusSideState {
  if (now < side.invulnUntil) return side
  const lives = side.lives - 1
  if (lives <= 0) return { ...side, lives: 0, power: 0 }
  return { ...side, lives, power: Math.max(0, side.power - 1), invulnUntil: now + INVULN_MS }
}

export function tryMove(side: GradiusSideState, dir: VerticalDir, now: number): GradiusSideState {
  if (side.lives <= 0 || now - side.lastMoveAt < MOVE_COOLDOWN_MS) return side
  let shipY = side.shipY
  if (dir === 'up') shipY -= 5.5
  if (dir === 'down') shipY += 5.5
  shipY = Math.max(SHIP_MIN_Y, Math.min(SHIP_MAX_Y, shipY))
  if (shipY === side.shipY) return side
  return { ...side, shipY, lastMoveAt: now }
}

export function setShipY(side: GradiusSideState, y: number, now: number): GradiusSideState {
  if (side.lives <= 0) return side
  const shipY = Math.max(SHIP_MIN_Y, Math.min(SHIP_MAX_Y, y))
  return { ...side, shipY, lastMoveAt: now }
}

export function tryFire(side: GradiusSideState, now: number): GradiusSideState {
  if (side.lives <= 0 || now - side.lastFireAt < powerFireCooldown(side.power)) return side
  const playerBullets = side.bullets.filter((b) => b.fromPlayer)
  if (playerBullets.length >= MAX_PLAYER_BULLETS) return side

  const bullets: GradiusBullet[] = []
  const base: Omit<GradiusBullet, 'id' | 'y'> = {
    x: SHIP_X + 5,
    vx: BULLET_SPEED,
    fromPlayer: true,
  }

  let nextId = side.nextId
  if (side.power >= 1) {
    bullets.push({ ...base, id: nextId++, y: side.shipY - 4 })
    bullets.push({ ...base, id: nextId++, y: side.shipY + 4 })
  } else {
    bullets.push({ ...base, id: nextId++, y: side.shipY })
  }

  return {
    ...side,
    bullets: [...side.bullets, ...bullets],
    nextId,
    lastFireAt: now,
  }
}

function spawnEnemy(side: GradiusSideState, now: number, rand: () => number): GradiusSideState {
  if (side.enemies.length >= MAX_ENEMIES || now - side.lastSpawnAt < SPAWN_MS) return side

  const r = rand()
  const kind: EnemyKind = r > 0.88 ? 'core' : r > 0.55 ? 'gunship' : 'fighter'
  const y = 12 + rand() * 76
  const hp = kind === 'core' ? 2 : 1

  const enemy: GradiusEnemy = {
    id: side.nextId,
    x: 104 + rand() * 6,
    y,
    kind,
    hp,
    wobble: rand() * Math.PI * 2,
  }
  return {
    ...side,
    enemies: [...side.enemies, enemy],
    nextId: side.nextId + 1,
    lastSpawnAt: now,
  }
}

function hit(ax: number, ay: number, bx: number, by: number, rx: number, ry: number) {
  return Math.abs(ax - bx) < rx && Math.abs(ay - by) < ry
}

export function tickSide(side: GradiusSideState, dt: number, now: number, rand: () => number): GradiusSideState {
  if (dt <= 0 || side.lives <= 0) return side

  let s = spawnEnemy(side, now, rand)
  s = { ...s, scrollPhase: s.scrollPhase + SCROLL_SPEED * dt }

  let enemies = s.enemies.map((e) => {
    const speed = e.kind === 'fighter' ? 0.042 : e.kind === 'gunship' ? 0.032 : 0.026
    const wobble = e.wobble + dt * 0.004
    const y = e.y + Math.sin(wobble) * (e.kind === 'fighter' ? 0.08 : 0.04) * dt
    let x = e.x - speed * dt

    if (e.kind === 'gunship' && rand() > 0.993) {
      s = {
        ...s,
        bullets: [
          ...s.bullets,
          {
            id: s.nextId,
            x,
            y,
            vx: -ENEMY_BULLET_SPEED,
            fromPlayer: false,
          },
        ],
        nextId: s.nextId + 1,
      }
    }

    return { ...e, x, y, wobble }
  })

  let capsules = s.capsules.map((c) => ({ ...c, x: c.x - 0.028 * dt })).filter((c) => c.x > 4)

  let bullets = s.bullets.map((b) => ({ ...b, x: b.x + b.vx * dt }))

  const hitEnemyIds = new Set<number>()
  const hitBulletIds = new Set<number>()

  for (const b of bullets) {
    if (!b.fromPlayer) continue
    for (const e of enemies) {
      if (hitEnemyIds.has(e.id)) continue
      const rx = e.kind === 'core' ? 6 : 5
      if (hit(b.x, b.y, e.x, e.y, rx, 5)) {
        hitBulletIds.add(b.id)
        const hp = e.hp - 1
        if (hp <= 0) {
          hitEnemyIds.add(e.id)
          s = { ...s, score: s.score + SCORE[e.kind] }
          if (rand() > 0.82) {
            capsules.push({ id: s.nextId, x: e.x, y: e.y })
            s = { ...s, nextId: s.nextId + 1 }
          }
        } else {
          enemies = enemies.map((en) => (en.id === e.id ? { ...en, hp } : en))
        }
        break
      }
    }
  }

  enemies = enemies.filter((e) => !hitEnemyIds.has(e.id))
  bullets = bullets.filter((b) => !hitBulletIds.has(b.id) && b.x > -2 && b.x < 108)

  for (const c of capsules) {
    if (hit(SHIP_X, s.shipY, c.x, c.y, 7, 7)) {
      s = { ...s, power: Math.min(2, s.power + 1) }
      capsules = capsules.filter((cap) => cap.id !== c.id)
      break
    }
  }

  const invuln = now < s.invulnUntil
  if (!invuln) {
    for (const e of enemies) {
      if (hit(e.x, e.y, SHIP_X, s.shipY, 7, 7)) {
        s = respawn(s, now)
        break
      }
    }
    if (s.lives > 0 && now >= s.invulnUntil) {
      for (const b of bullets) {
        if (b.fromPlayer) continue
        if (hit(b.x, b.y, SHIP_X, s.shipY, 6, 6)) {
          s = respawn(s, now)
          bullets = []
          break
        }
      }
    }
  }

  return {
    ...s,
    enemies: enemies.filter((e) => e.x > -4),
    bullets: bullets.slice(-14),
    capsules,
  }
}

export function legShouldEnd(g: GradiusState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: GradiusSideState, p2: GradiusSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}

export function powerLabel(power: number) {
  if (power >= 2) return 'MAX'
  if (power >= 1) return 'ÇİFT'
  return 'NORMAL'
}
