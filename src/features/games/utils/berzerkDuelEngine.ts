export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 3800
export const LEG_DURATION_MS = 46_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const MOVE_STEP = 4.2
export const MOVE_COOLDOWN_MS = 100
export const FIRE_COOLDOWN_MS = 220
export const BULLET_SPEED = 0.15
export const INVULN_MS = 1300
export const ENEMY_SPAWN_MS = 2100
export const OTTO_IDLE_MS = 6500
export const OTTO_DURATION_MS = 5500
export const MAX_ENEMIES = 9
export const MAX_BULLETS = 6
export const HIT_R = 4.2
export const PLAYER_R = 3.2

export type Dir = 'up' | 'down' | 'left' | 'right'
export type RobotKind = 'sentry' | 'runner' | 'otto'

export type Wall = { x: number; y: number; w: number; h: number }

export type BerzerkBullet = { id: number; x: number; y: number; vx: number; vy: number; fromPlayer: boolean }
export type BerzerkRobot = { id: number; x: number; y: number; kind: RobotKind; shootAt?: number }

export type BerzerkSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  px: number
  py: number
  aim: Dir
  bullets: BerzerkBullet[]
  robots: BerzerkRobot[]
  lastMoveAt: number
  lastFireAt: number
  lastActionAt: number
  lastSpawnAt: number
  ottoUntil: number
  invulnUntil: number
  nextBulletId: number
  nextRobotId: number
}

export type BerzerkState = {
  p1: BerzerkSideState
  p2: BerzerkSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

/** Berzerk-style cross maze (percent coords) */
export const MAZE_WALLS: Wall[] = [
  { x: 44, y: 6, w: 12, h: 38 },
  { x: 44, y: 56, w: 12, h: 38 },
  { x: 6, y: 44, w: 38, h: 12 },
  { x: 56, y: 44, w: 38, h: 12 },
  { x: 6, y: 6, w: 18, h: 6 },
  { x: 76, y: 6, w: 18, h: 6 },
  { x: 6, y: 88, w: 18, h: 6 },
  { x: 76, y: 88, w: 18, h: 6 },
]

const SCORE: Record<RobotKind, number> = { sentry: 180, runner: 260, otto: 520 }

function dirVec(dir: Dir) {
  if (dir === 'up') return { vx: 0, vy: -1 }
  if (dir === 'down') return { vx: 0, vy: 1 }
  if (dir === 'left') return { vx: -1, vy: 0 }
  return { vx: 1, vy: 0 }
}

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by)
}

export function hitsWall(x: number, y: number, r = PLAYER_R) {
  for (const w of MAZE_WALLS) {
    if (x + r > w.x && x - r < w.x + w.w && y + r > w.y && y - r < w.y + w.h) return true
  }
  return false
}

export function robotGlyph(kind: RobotKind) {
  if (kind === 'otto') return '☺'
  if (kind === 'runner') return '▲'
  return '◆'
}

export function createSide(sideId: 1 | 2, now: number): BerzerkSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    px: sideId === 1 ? 22 : 22,
    py: 72,
    aim: 'up',
    bullets: [],
    robots: [],
    lastMoveAt: 0,
    lastFireAt: 0,
    lastActionAt: now,
    lastSpawnAt: now + 1400,
    ottoUntil: 0,
    invulnUntil: 0,
    nextBulletId: 1,
    nextRobotId: 1,
  }
}

export function createBerzerkState(now: number): BerzerkState {
  return {
    p1: createSide(1, now),
    p2: createSide(2, now),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

function clampPos(x: number, y: number) {
  let px = Math.max(6, Math.min(94, x))
  let py = Math.max(6, Math.min(94, y))
  if (hitsWall(px, py)) {
    px = Math.max(6, Math.min(94, x))
    py = Math.max(6, Math.min(94, y))
  }
  return { px, py }
}

function spawnRobot(side: BerzerkSideState, rand: () => number): BerzerkSideState {
  if (side.robots.filter((r) => r.kind !== 'otto').length >= MAX_ENEMIES) return side
  const edge = Math.floor(rand() * 4)
  let x = 50
  let y = 50
  if (edge === 0) {
    x = 12 + rand() * 76
    y = 10
  } else if (edge === 1) {
    x = 12 + rand() * 76
    y = 90
  } else if (edge === 2) {
    x = 10
    y = 12 + rand() * 76
  } else {
    x = 90
    y = 12 + rand() * 76
  }
  let tries = 0
  while (hitsWall(x, y, HIT_R) && tries++ < 8) {
    x = 12 + rand() * 76
    y = 12 + rand() * 76
  }
  const kind: RobotKind = rand() > 0.72 ? 'runner' : 'sentry'
  const robot: BerzerkRobot = { id: side.nextRobotId, x, y, kind }
  return { ...side, robots: [...side.robots, robot], nextRobotId: side.nextRobotId + 1 }
}

function spawnOtto(side: BerzerkSideState, now: number): BerzerkSideState {
  if (side.ottoUntil > now || side.robots.some((r) => r.kind === 'otto')) return side
  const otto: BerzerkRobot = {
    id: side.nextRobotId,
    x: 88,
    y: 12,
    kind: 'otto',
  }
  return {
    ...side,
    robots: [...side.robots, otto],
    nextRobotId: side.nextRobotId + 1,
    ottoUntil: now + OTTO_DURATION_MS,
    lastActionAt: now,
  }
}

export function tryMove(side: BerzerkSideState, dir: Dir, now: number): BerzerkSideState {
  if (side.lives <= 0 || now - side.lastMoveAt < MOVE_COOLDOWN_MS) return side
  const { vx, vy } = dirVec(dir)
  const nx = side.px + vx * MOVE_STEP
  const ny = side.py + vy * MOVE_STEP
  if (hitsWall(nx, ny)) return { ...side, aim: dir, lastActionAt: now }
  const pos = clampPos(nx, ny)
  return { ...side, ...pos, aim: dir, lastMoveAt: now, lastActionAt: now }
}

export function tryFire(side: BerzerkSideState, now: number): BerzerkSideState {
  if (side.lives <= 0 || side.bullets.length >= MAX_BULLETS) return side
  if (now - side.lastFireAt < FIRE_COOLDOWN_MS) return side
  const { vx, vy } = dirVec(side.aim)
  const bullet: BerzerkBullet = {
    id: side.nextBulletId,
    x: side.px,
    y: side.py,
    vx: vx * BULLET_SPEED,
    vy: vy * BULLET_SPEED,
    fromPlayer: true,
  }
  return {
    ...side,
    bullets: [...side.bullets, bullet],
    nextBulletId: side.nextBulletId + 1,
    lastFireAt: now,
    lastActionAt: now,
  }
}

function killPlayer(side: BerzerkSideState, now: number): BerzerkSideState {
  if (now < side.invulnUntil) return side
  const lives = side.lives - 1
  if (lives <= 0) return { ...side, lives: 0, bullets: [] }
  return {
    ...side,
    lives,
    px: 22,
    py: 72,
    bullets: [],
    invulnUntil: now + INVULN_MS,
    ottoUntil: 0,
    robots: side.robots.filter((r) => r.kind !== 'otto'),
  }
}

function moveRobot(r: BerzerkRobot, px: number, py: number, dt: number): BerzerkRobot {
  if (r.kind === 'otto') {
    const d = dist(r.x, r.y, px, py) || 0.01
    const speed = 0.095
    let nx = r.x + ((px - r.x) / d) * speed * dt
    let ny = r.y + ((py - r.y) / d) * speed * dt
    if (hitsWall(nx, ny, HIT_R)) {
      nx = r.x + ((px - r.x) / d) * speed * dt * 0.5
      ny = r.y
    }
    return { ...r, x: nx, y: ny }
  }
  const d = dist(r.x, r.y, px, py) || 0.01
  const speed = r.kind === 'runner' ? 0.048 : 0.032
  let nx = r.x + ((px - r.x) / d) * speed * dt
  let ny = r.y + ((py - r.y) / d) * speed * dt
  if (hitsWall(nx, ny, HIT_R)) {
    const alt = r.kind === 'runner' ? { nx: r.x, ny: r.y + speed * dt * (py > r.y ? 1 : -1) } : { nx: r.x + speed * dt, ny: r.y }
    nx = alt.nx
    ny = alt.ny
  }
  return { ...r, x: nx, y: ny }
}

export function tickSide(side: BerzerkSideState, dt: number, now: number, rand: () => number): BerzerkSideState {
  if (dt <= 0 || side.lives <= 0) return side

  let s = side

  if (
    now - s.lastActionAt >= OTTO_IDLE_MS &&
    !s.robots.some((r) => r.kind === 'otto') &&
    s.ottoUntil <= now
  ) {
    s = spawnOtto(s, now)
  }

  if (s.ottoUntil > 0 && s.ottoUntil <= now) {
    s = { ...s, robots: s.robots.filter((r) => r.kind !== 'otto'), ottoUntil: 0 }
  }

  if (now - s.lastSpawnAt >= ENEMY_SPAWN_MS) {
    s = spawnRobot(s, rand)
    s = { ...s, lastSpawnAt: now }
  }

  let bullets = s.bullets.map((b) => ({
    ...b,
    x: b.x + b.vx * dt,
    y: b.y + b.vy * dt,
  }))
  bullets = bullets.filter((b) => b.x > 2 && b.x < 98 && b.y > 2 && b.y < 98 && !hitsWall(b.x, b.y, 1.5))

  let robots = s.robots.map((r) => moveRobot(r, s.px, s.py, dt))

  for (const r of robots) {
    if (r.kind === 'sentry' && (!r.shootAt || r.shootAt <= now) && dist(r.x, r.y, s.px, s.py) < 42) {
      if (rand() > 0.985) {
        const d = dist(r.x, r.y, s.px, s.py) || 0.01
        const spd = 0.11
        bullets.push({
          id: s.nextBulletId,
          x: r.x,
          y: r.y,
          vx: ((s.px - r.x) / d) * spd,
          vy: ((s.py - r.y) / d) * spd,
          fromPlayer: false,
        })
        s = { ...s, nextBulletId: s.nextBulletId + 1 }
      }
      robots = robots.map((rb) => (rb.id === r.id ? { ...rb, shootAt: now + 900 + rand() * 400 } : rb))
    }
  }

  let score = s.score
  const deadRobots = new Set<number>()
  const deadBullets = new Set<number>()

  for (const b of bullets) {
    if (!b.fromPlayer) continue
    for (const r of robots) {
      if (deadRobots.has(r.id)) continue
      const hitR = r.kind === 'otto' ? HIT_R + 2 : HIT_R
      if (dist(b.x, b.y, r.x, r.y) < hitR) {
        if (r.kind !== 'otto' || rand() > 0.15) {
          deadRobots.add(r.id)
          deadBullets.add(b.id)
          score += SCORE[r.kind]
        }
      }
    }
  }

  bullets = bullets.filter((b) => !deadBullets.has(b.id))
  robots = robots.filter((r) => !deadRobots.has(r.id))

  for (const b of bullets) {
    if (!b.fromPlayer && dist(b.x, b.y, s.px, s.py) < HIT_R && now >= s.invulnUntil) {
      s = killPlayer(s, now)
      deadBullets.add(b.id)
      break
    }
  }
  bullets = bullets.filter((b) => !deadBullets.has(b.id))

  for (const r of robots) {
    const touch = r.kind === 'otto' ? HIT_R + 3 : HIT_R + 1
    if (dist(r.x, r.y, s.px, s.py) < touch && now >= s.invulnUntil) {
      s = killPlayer(s, now)
      if (r.kind === 'otto') {
        robots = robots.filter((rb) => rb.id !== r.id)
      }
      break
    }
  }

  return { ...s, bullets, robots, score }
}

export function legShouldEnd(g: BerzerkState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: BerzerkSideState, p2: BerzerkSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}
