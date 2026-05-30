export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 3800
export const LEG_DURATION_MS = 52_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const COLS = 4
export const MOVE_COOLDOWN_MS = 95
export const SPRINT_COOLDOWN_MS = 4600
export const SPRINT_DURATION_MS = 2300
export const INVULN_MS = 1400
export const VIEW_WORLD = 100
export const PLAYER_SCROLL_OFFSET = 9
export const SCROLL_SPEED = 0.043
export const SPRINT_SCROLL_MULT = 1.75
export const OFFTRAIL_SCROLL_MULT = 0.4
export const RIDER_SPEED = 0.048
export const RIDER_SPAWN_MS = 1900
export const HAZARD_SPAWN_MS = 4200
export const MAX_RIDERS = 7
export const MAX_HAZARDS = 4
export const DIST_SCORE_PER_SCROLL = 0.36
export const OFFTRAIL_DAMAGE_MS = 850
export const TRAIL_TOLERANCE = 1.1

export type Dir = 'left' | 'right'
export type Weather = 'day' | 'dusk' | 'night' | 'fog'
export type RiderKind = 'scout' | 'cruiser' | 'pro'
export type HazardKind = 'rock' | 'puddle'

export type EnRider = {
  id: number
  lane: number
  worldY: number
  kind: RiderKind
  passed: boolean
}

export type EnHazard = {
  id: number
  lane: number
  worldY: number
  kind: HazardKind
}

export type EnduroSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  playerLane: number
  scroll: number
  riders: EnRider[]
  hazards: EnHazard[]
  overtakes: number
  sprintUntil: number
  lastMoveAt: number
  lastSprintAt: number
  lastRiderAt: number
  lastHazardAt: number
  invulnUntil: number
  offTrailSince: number | null
  nextId: number
}

export type EnduroState = {
  p1: EnduroSideState
  p2: EnduroSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

const OVERTAKE: Record<RiderKind, number> = { scout: 240, cruiser: 300, pro: 360 }
const WEATHER_MULT: Record<Weather, number> = { day: 1, dusk: 0.94, night: 0.86, fog: 0.8 }

export function weatherAt(scroll: number): Weather {
  const phases: Weather[] = ['day', 'dusk', 'night', 'fog']
  return phases[Math.floor(scroll / 42) % phases.length]!
}

export function weatherLabel(w: Weather) {
  if (w === 'dusk') return 'ALACAKARANLIK'
  if (w === 'night') return 'GECE'
  if (w === 'fog') return 'SİS'
  return 'GÜNDÜZ'
}

export function trailCenterAt(scroll: number) {
  return Math.sin(scroll * 0.068) * 0.9 + Math.sin(scroll * 0.029) * 0.38
}

export function lanePos(lane: number) {
  return lane - 1.5
}

export function isOnTrail(lane: number, scroll: number) {
  return Math.abs(lanePos(lane) - trailCenterAt(scroll)) < TRAIL_TOLERANCE
}

export function laneToScreenPct(lane: number, scroll: number) {
  const curve = trailCenterAt(scroll)
  const base = ((lane + 0.5) / COLS) * 100
  return base + curve * 12
}

export function worldToPct(worldY: number, scroll: number) {
  const rel = (worldY - scroll) / VIEW_WORLD
  return 8 + rel * 80
}

export function playerWorldY(scroll: number) {
  return scroll + PLAYER_SCROLL_OFFSET
}

export function riderGlyph(kind: RiderKind) {
  if (kind === 'pro') return '🏍️'
  if (kind === 'cruiser') return '🛵'
  return '🚲'
}

export function createSide(sideId: 1 | 2): EnduroSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    playerLane: 1,
    scroll: 0,
    riders: [],
    hazards: [],
    overtakes: 0,
    sprintUntil: 0,
    lastMoveAt: 0,
    lastSprintAt: -99999,
    lastRiderAt: 700,
    lastHazardAt: 2200,
    invulnUntil: 0,
    offTrailSince: null,
    nextId: 1,
  }
}

export function createEnduroState(now: number): EnduroState {
  return {
    p1: createSide(1),
    p2: createSide(2),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

export function tryMove(side: EnduroSideState, dir: Dir, now: number): EnduroSideState {
  if (side.lives <= 0 || now - side.lastMoveAt < MOVE_COOLDOWN_MS) return side
  let lane = side.playerLane
  if (dir === 'left') lane--
  if (dir === 'right') lane++
  lane = Math.max(0, Math.min(COLS - 1, lane))
  if (lane === side.playerLane) return side
  return { ...side, playerLane: lane, lastMoveAt: now }
}

export function trySprint(side: EnduroSideState, now: number): EnduroSideState {
  if (side.lives <= 0 || now - side.lastSprintAt < SPRINT_COOLDOWN_MS) return side
  return { ...side, sprintUntil: now + SPRINT_DURATION_MS, lastSprintAt: now }
}

export function isSprinting(side: EnduroSideState, now: number) {
  return now < side.sprintUntil
}

function crash(side: EnduroSideState, now: number): EnduroSideState {
  if (now < side.invulnUntil) return side
  const lives = side.lives - 1
  return {
    ...side,
    lives: lives > 0 ? lives : 0,
    invulnUntil: now + INVULN_MS,
    sprintUntil: 0,
    offTrailSince: null,
  }
}

function spawnRider(side: EnduroSideState, now: number, rand: () => number): EnduroSideState {
  if (side.riders.length >= MAX_RIDERS || now - side.lastRiderAt < RIDER_SPAWN_MS) return side
  const kinds: RiderKind[] = ['scout', 'cruiser', 'pro']
  const kind = kinds[Math.floor(rand() * kinds.length)]!
  const rider: EnRider = {
    id: side.nextId,
    lane: Math.floor(rand() * COLS),
    worldY: side.scroll + 84 + rand() * 12,
    kind,
    passed: false,
  }
  return {
    ...side,
    riders: [...side.riders, rider],
    nextId: side.nextId + 1,
    lastRiderAt: now,
  }
}

function spawnHazard(side: EnduroSideState, now: number, rand: () => number): EnduroSideState {
  if (side.hazards.length >= MAX_HAZARDS || now - side.lastHazardAt < HAZARD_SPAWN_MS) return side
  const kinds: HazardKind[] = ['rock', 'puddle']
  const kind = kinds[Math.floor(rand() * kinds.length)]!
  const hazard: EnHazard = {
    id: side.nextId,
    lane: Math.floor(rand() * COLS),
    worldY: side.scroll + 55 + rand() * 28,
    kind,
  }
  return {
    ...side,
    hazards: [...side.hazards, hazard],
    nextId: side.nextId + 1,
    lastHazardAt: now,
  }
}

export function tickSide(side: EnduroSideState, dt: number, now: number, rand: () => number): EnduroSideState {
  if (dt <= 0 || side.lives <= 0) return side

  const sprint = isSprinting(side, now)
  const weather = weatherAt(side.scroll)
  const onTrail = isOnTrail(side.playerLane, side.scroll)
  let scrollMult = WEATHER_MULT[weather] * (sprint ? SPRINT_SCROLL_MULT : 1)
  if (!onTrail) scrollMult *= OFFTRAIL_SCROLL_MULT

  let s: EnduroSideState = {
    ...side,
    scroll: side.scroll + SCROLL_SPEED * scrollMult * dt,
    score: side.score + Math.floor(SCROLL_SPEED * scrollMult * dt * DIST_SCORE_PER_SCROLL),
  }

  if (!onTrail) {
    if (s.offTrailSince == null) s = { ...s, offTrailSince: now }
    else if (now - s.offTrailSince >= OFFTRAIL_DAMAGE_MS && now >= s.invulnUntil) {
      s = crash(s, now)
    }
  } else {
    s = { ...s, offTrailSince: null }
  }

  s = spawnRider(s, now, rand)
  s = spawnHazard(s, now, rand)

  let riders = s.riders.map((r) => ({
    ...r,
    worldY: r.worldY - RIDER_SPEED * scrollMult * dt,
  }))

  const py = playerWorldY(s.scroll)
  let score = s.score
  let overtakes = s.overtakes

  riders = riders.map((r) => {
    if (!r.passed && r.worldY < py - 4 && r.lane !== s.playerLane) {
      score += OVERTAKE[r.kind]
      overtakes += 1
      return { ...r, passed: true }
    }
    return r
  })

  const invuln = now < s.invulnUntil

  if (!invuln) {
    for (const r of riders) {
      if (r.lane === s.playerLane && Math.abs(r.worldY - py) < 4) {
        s = crash(s, now)
        break
      }
    }
    if (s.lives > 0 && now >= s.invulnUntil) {
      for (const h of s.hazards) {
        if (h.lane === s.playerLane && Math.abs(h.worldY - py) < 3.5) {
          s = crash(s, now)
          break
        }
      }
    }
  }

  const minY = s.scroll - 6
  s = {
    ...s,
    riders: riders.filter((r) => r.worldY > minY),
    hazards: s.hazards.filter((h) => h.worldY > minY),
    score,
    overtakes,
  }

  return s
}

export function legShouldEnd(g: EnduroState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: EnduroSideState, p2: EnduroSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}
