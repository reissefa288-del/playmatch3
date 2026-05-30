export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 4000
export const LEG_DURATION_MS = 50_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const COLS = 3
export const MOVE_COOLDOWN_MS = 100
export const TURBO_COOLDOWN_MS = 4800
export const TURBO_DURATION_MS = 2400
export const INVULN_MS = 1400
export const VIEW_WORLD = 100
export const PLAYER_SCROLL_OFFSET = 9
export const SCROLL_SPEED = 0.044
export const TURBO_SCROLL_MULT = 1.8
export const OFFROAD_SCROLL_MULT = 0.42
export const TRAFFIC_SPEED = 0.05
export const TRAFFIC_SPAWN_MS = 2000
export const MAX_TRAFFIC = 6
export const DIST_SCORE_PER_SCROLL = 0.38
export const OFFROAD_DAMAGE_MS = 900
export const ROAD_TOLERANCE = 1.05

export type Dir = 'left' | 'right'
export type TrafficKind = 'sedan' | 'truck' | 'sports'

export type RrTraffic = {
  id: number
  lane: number
  worldY: number
  kind: TrafficKind
  passed: boolean
}

export type RadRacerSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  playerLane: number
  scroll: number
  traffic: RrTraffic[]
  overtakes: number
  turboUntil: number
  lastMoveAt: number
  lastTurboAt: number
  lastTrafficAt: number
  invulnUntil: number
  offRoadSince: number | null
  nextId: number
}

export type RadRacerState = {
  p1: RadRacerSideState
  p2: RadRacerSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

const OVERTAKE: Record<TrafficKind, number> = { sedan: 260, truck: 340, sports: 220 }

export function roadCenterAt(scroll: number) {
  return Math.sin(scroll * 0.075) * 0.85 + Math.sin(scroll * 0.031) * 0.35
}

export function lanePos(lane: number) {
  return lane - 1
}

export function isOnRoad(lane: number, scroll: number) {
  return Math.abs(lanePos(lane) - roadCenterAt(scroll)) < ROAD_TOLERANCE
}

export function laneToScreenPct(lane: number, scroll: number) {
  const curve = roadCenterAt(scroll)
  const base = ((lane + 0.5) / COLS) * 100
  return base + curve * 14
}

export function worldToPct(worldY: number, scroll: number) {
  const rel = (worldY - scroll) / VIEW_WORLD
  return 8 + rel * 80
}

export function playerWorldY(scroll: number) {
  return scroll + PLAYER_SCROLL_OFFSET
}

export function trafficGlyph(kind: TrafficKind) {
  if (kind === 'truck') return '🚚'
  if (kind === 'sports') return '🏎️'
  return '🚗'
}

export function createSide(sideId: 1 | 2): RadRacerSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    playerLane: 1,
    scroll: 0,
    traffic: [],
    overtakes: 0,
    turboUntil: 0,
    lastMoveAt: 0,
    lastTurboAt: -99999,
    lastTrafficAt: 800,
    invulnUntil: 0,
    offRoadSince: null,
    nextId: 1,
  }
}

export function createRadRacerState(now: number): RadRacerState {
  return {
    p1: createSide(1),
    p2: createSide(2),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

export function tryMove(side: RadRacerSideState, dir: Dir, now: number): RadRacerSideState {
  if (side.lives <= 0 || now - side.lastMoveAt < MOVE_COOLDOWN_MS) return side
  let lane = side.playerLane
  if (dir === 'left') lane--
  if (dir === 'right') lane++
  lane = Math.max(0, Math.min(COLS - 1, lane))
  if (lane === side.playerLane) return side
  return { ...side, playerLane: lane, lastMoveAt: now }
}

export function tryTurbo(side: RadRacerSideState, now: number): RadRacerSideState {
  if (side.lives <= 0 || now - side.lastTurboAt < TURBO_COOLDOWN_MS) return side
  return { ...side, turboUntil: now + TURBO_DURATION_MS, lastTurboAt: now }
}

export function isTurboing(side: RadRacerSideState, now: number) {
  return now < side.turboUntil
}

function crash(side: RadRacerSideState, now: number): RadRacerSideState {
  if (now < side.invulnUntil) return side
  const lives = side.lives - 1
  return {
    ...side,
    lives: lives > 0 ? lives : 0,
    invulnUntil: now + INVULN_MS,
    turboUntil: 0,
    offRoadSince: null,
  }
}

function spawnTraffic(side: RadRacerSideState, now: number, rand: () => number): RadRacerSideState {
  if (side.traffic.length >= MAX_TRAFFIC || now - side.lastTrafficAt < TRAFFIC_SPAWN_MS) return side
  const kinds: TrafficKind[] = ['sedan', 'truck', 'sports']
  const kind = kinds[Math.floor(rand() * kinds.length)]!
  const traffic: RrTraffic = {
    id: side.nextId,
    lane: Math.floor(rand() * COLS),
    worldY: side.scroll + 82 + rand() * 14,
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

export function tickSide(side: RadRacerSideState, dt: number, now: number, rand: () => number): RadRacerSideState {
  if (dt <= 0 || side.lives <= 0) return side

  const turbo = isTurboing(side, now)
  const onRoad = isOnRoad(side.playerLane, side.scroll)
  let scrollMult = turbo ? TURBO_SCROLL_MULT : 1
  if (!onRoad) scrollMult *= OFFROAD_SCROLL_MULT

  let s: RadRacerSideState = {
    ...side,
    scroll: side.scroll + SCROLL_SPEED * scrollMult * dt,
    score: side.score + Math.floor(SCROLL_SPEED * scrollMult * dt * DIST_SCORE_PER_SCROLL),
  }

  if (!onRoad) {
    if (s.offRoadSince == null) s = { ...s, offRoadSince: now }
    else if (now - s.offRoadSince >= OFFROAD_DAMAGE_MS && now >= s.invulnUntil) {
      s = crash(s, now)
    }
  } else {
    s = { ...s, offRoadSince: null }
  }

  s = spawnTraffic(s, now, rand)

  let traffic = s.traffic.map((t) => ({
    ...t,
    worldY: t.worldY - TRAFFIC_SPEED * scrollMult * dt,
  }))

  const py = playerWorldY(s.scroll)
  let score = s.score
  let overtakes = s.overtakes

  traffic = traffic.map((t) => {
    if (!t.passed && t.worldY < py - 4 && t.lane !== s.playerLane) {
      score += OVERTAKE[t.kind]
      overtakes += 1
      return { ...t, passed: true }
    }
    return t
  })

  const invuln = now < s.invulnUntil
  if (!invuln) {
    for (const t of traffic) {
      if (t.lane === s.playerLane && Math.abs(t.worldY - py) < 4) {
        s = crash(s, now)
        break
      }
    }
  }

  const minY = s.scroll - 6
  s = {
    ...s,
    traffic: traffic.filter((t) => t.worldY > minY),
    score,
    overtakes,
  }

  return s
}

export function legShouldEnd(g: RadRacerState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: RadRacerSideState, p2: RadRacerSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}
