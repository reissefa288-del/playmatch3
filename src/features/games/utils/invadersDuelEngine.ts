export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 4000
export const LEG_DURATION_MS = 45_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const FIRE_COOLDOWN_MS = 280
export const BULLET_SPEED = 0.22
export const ENEMY_BULLET_SPEED = 0.12
export const INVULN_MS = 1400
export const MAX_PLAYER_BULLETS = 3
export const INVADER_ROWS = 4
export const INVADER_COLS = 8
export const SHIP_Y = 92
export const FORMATION_SPEED = 0.045

export type InvaderBullet = { id: number; x: number; y: number }
export type PlayerBullet = { id: number; x: number; y: number }

export type Invader = {
  id: number
  col: number
  row: number
  x: number
  y: number
  alive: boolean
}

export type ShieldCell = { id: number; x: number; y: number; hp: number }

export type InvadersSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  shipX: number
  invaders: Invader[]
  shields: ShieldCell[]
  playerBullets: PlayerBullet[]
  enemyBullets: InvaderBullet[]
  formationDir: 1 | -1
  lastFireAt: number
  lastEnemyShotAt: number
  invulnUntil: number
  nextBulletId: number
  wave: number
}

export type InvadersState = {
  p1: InvadersSideState
  p2: InvadersSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

const ROW_SCORE = [40, 30, 20, 10]
const COL_GAP = 10
const ROW_GAP = 7
const FORMATION_START_X = 12
const FORMATION_START_Y = 14

export function createInvaders(): Invader[] {
  const list: Invader[] = []
  let id = 1
  for (let row = 0; row < INVADER_ROWS; row++) {
    for (let col = 0; col < INVADER_COLS; col++) {
      list.push({
        id: id++,
        col,
        row,
        x: FORMATION_START_X + col * COL_GAP,
        y: FORMATION_START_Y + row * ROW_GAP,
        alive: true,
      })
    }
  }
  return list
}

function createShields(): ShieldCell[] {
  const cells: ShieldCell[] = []
  let id = 1
  const bases = [22, 50, 78]
  for (const bx of bases) {
    for (let dx = -4; dx <= 4; dx += 4) {
      for (let dy = 0; dy < 8; dy += 4) {
        cells.push({ id: id++, x: bx + dx, y: 68 + dy, hp: 3 })
      }
    }
  }
  return cells
}

export function createSide(sideId: 1 | 2): InvadersSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    shipX: 50,
    invaders: createInvaders(),
    shields: createShields(),
    playerBullets: [],
    enemyBullets: [],
    formationDir: 1,
    lastFireAt: 0,
    lastEnemyShotAt: performance.now() + 2000,
    invulnUntil: 0,
    nextBulletId: 1,
    wave: 1,
  }
}

export function createInvadersState(now: number): InvadersState {
  return {
    p1: createSide(1),
    p2: createSide(2),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

export function clampShip(x: number) {
  return Math.max(8, Math.min(92, x))
}

export function moveShip(side: InvadersSideState, x: number): InvadersSideState {
  return { ...side, shipX: clampShip(x) }
}

export function tryShoot(side: InvadersSideState, now: number): InvadersSideState {
  if (side.lives <= 0) return side
  if (now - side.lastFireAt < FIRE_COOLDOWN_MS) return side
  if (side.playerBullets.length >= MAX_PLAYER_BULLETS) return side

  const bullet: PlayerBullet = {
    id: side.nextBulletId,
    x: side.shipX,
    y: SHIP_Y - 5,
  }
  return {
    ...side,
    playerBullets: [...side.playerBullets, bullet],
    nextBulletId: side.nextBulletId + 1,
    lastFireAt: now,
  }
}

function hitbox(ax: number, ay: number, bx: number, by: number, r: number) {
  return Math.hypot(ax - bx, ay - by) < r
}

function moveFormation(side: InvadersSideState, dt: number): InvadersSideState {
  const live = side.invaders.filter((i) => i.alive)
  if (live.length === 0) return side

  let dir = side.formationDir
  let drop = false
  const dx = dir * FORMATION_SPEED * dt

  let minX = Infinity
  let maxX = -Infinity
  for (const inv of live) {
    const nx = inv.x + dx
    minX = Math.min(minX, nx)
    maxX = Math.max(maxX, nx)
    if (nx < 6 || nx > 94) drop = true
  }

  let invaders = side.invaders
  if (drop) {
    dir = (dir * -1) as 1 | -1
    invaders = invaders.map((inv) =>
      inv.alive ? { ...inv, y: inv.y + 5, x: inv.x + dir * 2 } : inv,
    )
  } else {
    invaders = invaders.map((inv) => (inv.alive ? { ...inv, x: inv.x + dx } : inv))
  }

  return { ...side, invaders, formationDir: dir }
}

function enemyShoot(side: InvadersSideState, now: number, rand: () => number): InvadersSideState {
  const live = side.invaders.filter((i) => i.alive)
  if (live.length === 0) return { ...side, lastEnemyShotAt: now + 800 }

  const shooter = live[Math.floor(rand() * live.length)]!
  const bullet: InvaderBullet = {
    id: side.nextBulletId,
    x: shooter.x,
    y: shooter.y + 4,
  }
  return {
    ...side,
    enemyBullets: [...side.enemyBullets, bullet],
    nextBulletId: side.nextBulletId + 1,
    lastEnemyShotAt: now + 900 + rand() * 700,
  }
}

export function tickSide(side: InvadersSideState, dt: number, now: number, rand: () => number): InvadersSideState {
  if (dt <= 0) return side

  let s = moveFormation(side, dt)

  s = {
    ...s,
    playerBullets: s.playerBullets
      .map((b) => ({ ...b, y: b.y - BULLET_SPEED * dt }))
      .filter((b) => b.y > 2),
    enemyBullets: s.enemyBullets
      .map((b) => ({ ...b, y: b.y + ENEMY_BULLET_SPEED * dt }))
      .filter((b) => b.y < 98),
  }

  const hitPlayerBullets = new Set<number>()
  let invaders = [...s.invaders]
  let shields = [...s.shields]
  let score = s.score

  for (const b of s.playerBullets) {
    for (let i = 0; i < invaders.length; i++) {
      const inv = invaders[i]!
      if (!inv.alive) continue
      if (hitbox(b.x, b.y, inv.x, inv.y, 5)) {
        invaders[i] = { ...inv, alive: false }
        hitPlayerBullets.add(b.id)
        score += ROW_SCORE[inv.row] ?? 20
        break
      }
    }
    shields = shields.map((sh) => {
      if (sh.hp <= 0) return sh
      if (hitbox(b.x, b.y, sh.x, sh.y, 4)) {
        hitPlayerBullets.add(b.id)
        const hp = sh.hp - 1
        return { ...sh, hp }
      }
      return sh
    })
  }

  if (hitPlayerBullets.size > 0) {
    s = {
      ...s,
      playerBullets: s.playerBullets.filter((b) => !hitPlayerBullets.has(b.id)),
      invaders,
      shields: shields.filter((sh) => sh.hp > 0),
      score,
    }
  } else {
    s = { ...s, invaders, shields: shields.filter((sh) => sh.hp > 0), score }
  }

  if (now >= s.lastEnemyShotAt) {
    s = enemyShoot(s, now, rand)
  }

  const invuln = now < s.invulnUntil
  if (!invuln && s.lives > 0) {
    let hit = false
    for (const eb of s.enemyBullets) {
      if (hitbox(eb.x, eb.y, s.shipX, SHIP_Y, 5)) {
        hit = true
        break
      }
    }
    const lowest = s.invaders.filter((i) => i.alive)
    if (!hit && lowest.length > 0) {
      const maxY = lowest.reduce((m, i) => Math.max(m, i.y), 0)
      if (maxY >= SHIP_Y - 8) hit = true
    }
    if (hit) {
      return {
        ...s,
        lives: s.lives - 1,
        invulnUntil: now + INVULN_MS,
        enemyBullets: [],
        playerBullets: [],
        shipX: 50,
      }
    }
  }

  if (s.invaders.every((i) => !i.alive)) {
    const wave = s.wave + 1
    const fresh = createSide(s.sideId)
    return {
      ...fresh,
      score: s.score + 400,
      matchPoints: s.matchPoints,
      lives: s.lives,
      wave,
      formationDir: s.formationDir,
      invaders: createInvaders().map((inv) => ({
        ...inv,
        y: Math.max(8, inv.y - Math.min(3, wave)),
      })),
      lastEnemyShotAt: now + 1200,
    }
  }

  return s
}

export function legShouldEnd(g: InvadersState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: InvadersSideState, p2: InvadersSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}

export function invaderGlyph(row: number) {
  if (row === 0) return '👾'
  if (row === 1) return '🛸'
  return '👽'
}
