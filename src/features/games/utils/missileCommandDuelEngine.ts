export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 3600
export const LEG_DURATION_MS = 45_000
export const ROUND_BREAK_MS = 2600
export const FIRE_COOLDOWN_MS = 140
export const MAX_COUNTERS = 4
export const EXPLODE_RADIUS = 13
export const EXPLODE_MS = 520
export const COUNTER_SPEED = 0.2
export const SCORE_PER_KILL = 160
export const CITY_PENALTY = 400

const CITY_X = [14, 32, 50, 68, 86]
const BATTERY_X = [25, 50, 75]
const CITY_Y = 90
const BATTERY_Y = 95

export type McCity = { id: number; x: number; y: number; alive: boolean }

export type McIncoming = {
  id: number
  x: number
  y: number
  vx: number
  vy: number
}

export type McCounter = {
  id: number
  x: number
  y: number
  tx: number
  ty: number
  phase: 'fly' | 'boom'
  boomUntil: number
}

export type McSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  cities: McCity[]
  incoming: McIncoming[]
  counters: McCounter[]
  lastFireAt: number
  nextSpawnAt: number
  nextIncomingId: number
  nextCounterId: number
}

export type MissileCommandState = {
  p1: McSideState
  p2: McSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

export function createCities(): McCity[] {
  return CITY_X.map((x, i) => ({ id: i + 1, x, y: CITY_Y, alive: true }))
}

export function createSide(sideId: 1 | 2, now: number): McSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    cities: createCities(),
    incoming: [],
    counters: [],
    lastFireAt: 0,
    nextSpawnAt: now + 900,
    nextIncomingId: 1,
    nextCounterId: 1,
  }
}

export function createMissileCommandState(now: number): MissileCommandState {
  return {
    p1: createSide(1, now),
    p2: createSide(2, now),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by)
}

function pickBattery(tx: number) {
  let best = BATTERY_X[1]!
  let bestD = Infinity
  for (const x of BATTERY_X) {
    const d = Math.abs(x - tx)
    if (d < bestD) {
      bestD = d
      best = x
    }
  }
  return { x: best, y: BATTERY_Y }
}

export function launchCounter(side: McSideState, tx: number, ty: number, now: number): McSideState {
  const active = side.counters.filter((c) => c.phase === 'fly' || (c.phase === 'boom' && c.boomUntil > now))
  if (active.length >= MAX_COUNTERS) return side
  if (now - side.lastFireAt < FIRE_COOLDOWN_MS) return side

  const clampedX = Math.max(6, Math.min(94, tx))
  const clampedY = Math.max(8, Math.min(88, ty))
  const bat = pickBattery(clampedX)

  const counter: McCounter = {
    id: side.nextCounterId,
    x: bat.x,
    y: bat.y,
    tx: clampedX,
    ty: clampedY,
    phase: 'fly',
    boomUntil: 0,
  }

  return {
    ...side,
    counters: [...side.counters, counter],
    nextCounterId: side.nextCounterId + 1,
    lastFireAt: now,
  }
}

function spawnIncoming(side: McSideState, now: number, rand: () => number): McSideState {
  const targets = side.cities.filter((c) => c.alive)
  if (targets.length === 0) return { ...side, nextSpawnAt: now + 1200 }

  const target = targets[Math.floor(rand() * targets.length)]!
  const startX = 8 + rand() * 84
  const startY = 2 + rand() * 8
  const flightMs = 2200 + rand() * 1400
  const vx = (target.x - startX) / flightMs
  const vy = (target.y - startY) / flightMs

  const incoming: McIncoming = {
    id: side.nextIncomingId,
    x: startX,
    y: startY,
    vx,
    vy,
  }

  return {
    ...side,
    incoming: [...side.incoming, incoming],
    nextIncomingId: side.nextIncomingId + 1,
    nextSpawnAt: now + 700 + rand() * 800,
  }
}

function activeExplosions(counters: McCounter[], now: number) {
  return counters.filter((c) => c.phase === 'boom' && c.boomUntil > now)
}

export function tickSide(side: McSideState, dt: number, now: number, rand: () => number): McSideState {
  if (dt <= 0) return side

  let s = { ...side }

  if (now >= s.nextSpawnAt && s.cities.some((c) => c.alive)) {
    s = spawnIncoming(s, now, rand)
  }

  s.incoming = s.incoming.map((m) => ({
    ...m,
    x: m.x + m.vx * dt,
    y: m.y + m.vy * dt,
  }))

  const counters: McCounter[] = []
  for (const c of s.counters) {
    if (c.phase === 'fly') {
      const d = dist(c.x, c.y, c.tx, c.ty)
      if (d < 2.5) {
        counters.push({ ...c, x: c.tx, y: c.ty, phase: 'boom', boomUntil: now + EXPLODE_MS })
      } else {
        const step = COUNTER_SPEED * dt
        const t = Math.min(1, step / d)
        counters.push({
          ...c,
          x: c.x + (c.tx - c.x) * t,
          y: c.y + (c.ty - c.y) * t,
        })
      }
    } else if (c.boomUntil > now) {
      counters.push(c)
    }
  }
  s.counters = counters

  const booms = activeExplosions(s.counters, now)
  const hitIncoming = new Set<number>()
  for (const m of s.incoming) {
    for (const b of booms) {
      if (dist(m.x, m.y, b.x, b.y) < EXPLODE_RADIUS) {
        hitIncoming.add(m.id)
        break
      }
    }
  }
  if (hitIncoming.size > 0) {
    s.incoming = s.incoming.filter((m) => !hitIncoming.has(m.id))
    s.score += hitIncoming.size * SCORE_PER_KILL
  }

  let cities = [...s.cities]
  let score = s.score
  const survived: McIncoming[] = []
  for (const m of s.incoming) {
    let hit = false
    for (const c of cities) {
      if (!c.alive) continue
      if (m.y >= c.y - 2 && Math.abs(m.x - c.x) < 6) {
        cities = cities.map((ci) => (ci.id === c.id ? { ...ci, alive: false } : ci))
        score = Math.max(0, score - CITY_PENALTY)
        hit = true
        break
      }
    }
    if (!hit && m.y < 102) survived.push(m)
  }
  s.incoming = survived
  s.cities = cities
  s.score = score

  return s
}

export function legShouldEnd(g: MissileCommandState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: McSideState, p2: McSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}

export function aliveCities(side: McSideState) {
  return side.cities.filter((c) => c.alive).length
}
