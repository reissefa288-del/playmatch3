export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 4200
export const LEG_DURATION_MS = 48_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const COLS = 5
export const MOVE_COOLDOWN_MS = 95
export const BOOST_COOLDOWN_MS = 4500
export const BOOST_DURATION_MS = 2200
export const INVULN_MS = 1400
export const VIEW_WORLD = 100
export const PLAYER_SCROLL_OFFSET = 9
export const SCROLL_SPEED = 0.042
export const BOOST_SCROLL_MULT = 1.75
export const TRAFFIC_SPEED = 0.048
export const TRAFFIC_SPAWN_MS = 1800
export const HAZARD_SPAWN_MS = 5000
export const MAX_TRAFFIC = 7
export const MAX_HAZARDS = 3
export const DIST_SCORE_PER_SCROLL = 0.35

export type Dir = 'left' | 'right'
export type TrafficKind = 'coupe' | 'jeep' | 'bus'

export type OrTraffic = {
  id: number
  col: number
  worldY: number
  kind: TrafficKind
  passed: boolean
}

export type OrHazard = {
  id: number
  col: number
  worldY: number
}

export type OutRunSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  playerCol: number
  scroll: number
  traffic: OrTraffic[]
  hazards: OrHazard[]
  overtakes: number
  boostUntil: number
  lastMoveAt: number
  lastBoostAt: number
  lastTrafficAt: number
  lastHazardAt: number
  invulnUntil: number
  nextId: number
}

export type OutRunState = {
  p1: OutRunSideState
  p2: OutRunSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

const OVERTAKE: Record<TrafficKind, number> = { coupe: 280, jeep: 200, bus: 360 }

export function colToPct(col: number) {
  return ((col + 0.5) / COLS) * 100
}

export function worldToPct(worldY: number, scroll: number) {
  const rel = (worldY - scroll) / VIEW_WORLD
  return 6 + rel * 82
}

export function playerWorldY(scroll: number) {
  return scroll + PLAYER_SCROLL_OFFSET
}

export function trafficGlyph(kind: TrafficKind) {
  if (kind === 'bus') return '🚌'
  if (kind === 'jeep') return '🚙'
  return '🏎️'
}

export function createSide(sideId: 1 | 2): OutRunSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    playerCol: 2,
    scroll: 0,
    traffic: [],
    hazards: [],
    overtakes: 0,
    boostUntil: 0,
    lastMoveAt: 0,
    lastBoostAt: -99999,
    lastTrafficAt: 700,
    lastHazardAt: 2500,
    invulnUntil: 0,
    nextId: 1,
  }
}

export function createOutRunState(now: number): OutRunState {
  return {
    p1: createSide(1),
    p2: createSide(2),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

export function tryMove(side: OutRunSideState, dir: Dir, now: number): OutRunSideState {
  if (side.lives <= 0 || now - side.lastMoveAt < MOVE_COOLDOWN_MS) return side
  let col = side.playerCol
  if (dir === 'left') col--
  if (dir === 'right') col++
  col = Math.max(0, Math.min(COLS - 1, col))
  if (col === side.playerCol) return side
  return { ...side, playerCol: col, lastMoveAt: now }
}

export function tryBoost(side: OutRunSideState, now: number): OutRunSideState {
  if (side.lives <= 0 || now - side.lastBoostAt < BOOST_COOLDOWN_MS) return side
  return { ...side, boostUntil: now + BOOST_DURATION_MS, lastBoostAt: now }
}

export function isBoosting(side: OutRunSideState, now: number) {
  return now < side.boostUntil
}

function crash(side: OutRunSideState, now: number): OutRunSideState {
  if (now < side.invulnUntil) return side
  const lives = side.lives - 1
  return {
    ...side,
    lives: lives > 0 ? lives : 0,
    invulnUntil: now + INVULN_MS,
    boostUntil: 0,
  }
}

function spawnTraffic(side: OutRunSideState, now: number, rand: () => number): OutRunSideState {
  if (side.traffic.length >= MAX_TRAFFIC || now - side.lastTrafficAt < TRAFFIC_SPAWN_MS) return side
  const kinds: TrafficKind[] = ['coupe', 'jeep', 'bus']
  const kind = kinds[Math.floor(rand() * kinds.length)]!
  const traffic: OrTraffic = {
    id: side.nextId,
    col: Math.floor(rand() * COLS),
    worldY: side.scroll + 85 + rand() * 12,
    kind,
    passed: false,
  }
  return {
    ...side,
    traffic: [...side.traffic, traffic],
    nextId: side.nextId + 1,
    lastTrafficAt: now,
  }
}

function spawnHazard(side: OutRunSideState, now: number, rand: () => number): OutRunSideState {
  if (side.hazards.length >= MAX_HAZARDS || now - side.lastHazardAt < HAZARD_SPAWN_MS) return side
  const hazard: OrHazard = {
    id: side.nextId,
    col: Math.floor(rand() * COLS),
    worldY: side.scroll + 50 + rand() * 30,
  }
  return {
    ...side,
    hazards: [...side.hazards, hazard],
    nextId: side.nextId + 1,
    lastHazardAt: now,
  }
}

export function tickSide(side: OutRunSideState, dt: number, now: number, rand: () => number): OutRunSideState {
  if (dt <= 0 || side.lives <= 0) return side

  const boost = isBoosting(side, now)
  const scrollMult = boost ? BOOST_SCROLL_MULT : 1

  let s: OutRunSideState = {
    ...side,
    scroll: side.scroll + SCROLL_SPEED * scrollMult * dt,
    score: side.score + Math.floor(SCROLL_SPEED * scrollMult * dt * DIST_SCORE_PER_SCROLL),
  }

  s = spawnTraffic(s, now, rand)
  s = spawnHazard(s, now, rand)

  let traffic = s.traffic.map((t) => ({
    ...t,
    worldY: t.worldY - TRAFFIC_SPEED * scrollMult * dt,
  }))

  const py = playerWorldY(s.scroll)
  let score = s.score
  let overtakes = s.overtakes

  traffic = traffic.map((t) => {
    if (!t.passed && t.worldY < py - 4 && Math.abs(t.col - s.playerCol) >= 1) {
      score += OVERTAKE[t.kind]
      overtakes += 1
      return { ...t, passed: true }
    }
    return t
  })

  const invuln = now < s.invulnUntil

  if (!invuln) {
    for (const t of traffic) {
      if (Math.abs(t.col - s.playerCol) < 0.85 && Math.abs(t.worldY - py) < 4) {
        s = crash(s, now)
        break
      }
    }
    if (s.lives > 0 && now >= s.invulnUntil) {
      for (const h of s.hazards) {
        if (Math.abs(h.col - s.playerCol) < 0.85 && Math.abs(h.worldY - py) < 3.5) {
          s = crash(s, now)
          break
        }
      }
    }
  }

  const minY = s.scroll - 6
  s = {
    ...s,
    traffic: traffic.filter((t) => t.worldY > minY),
    hazards: s.hazards.filter((h) => h.worldY > minY),
    score,
    overtakes,
  }

  return s
}

export function legShouldEnd(g: OutRunState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: OutRunSideState, p2: OutRunSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}
