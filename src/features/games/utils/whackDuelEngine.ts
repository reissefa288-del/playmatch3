export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 10
export const ROUND_BREAK_MS = 2200
export const MOLE_VISIBLE_MS = 850
export const SPAWN_GAP_MIN_MS = 280
export const SPAWN_GAP_MAX_MS = 520

export type WhackLaneState = {
  laneId: 1 | 2
  score: number
  matchPoints: number
  activeCell: number | null
  moleUntil: number
  nextSpawnAt: number
  lastHitCell: number | null
}

export type WhackState = {
  lane1: WhackLaneState
  lane2: WhackLaneState
  roundNumber: number
}

export function createLane(laneId: 1 | 2): WhackLaneState {
  return {
    laneId,
    score: 0,
    matchPoints: 0,
    activeCell: null,
    moleUntil: 0,
    nextSpawnAt: 0,
    lastHitCell: null,
  }
}

export function createWhackState(): WhackState {
  return {
    lane1: createLane(1),
    lane2: createLane(2),
    roundNumber: 1,
  }
}

export function spawnDelayMs(rand: () => number) {
  return SPAWN_GAP_MIN_MS + rand() * (SPAWN_GAP_MAX_MS - SPAWN_GAP_MIN_MS)
}

export function spawnMole(lane: WhackLaneState, now: number, rand: () => number): WhackLaneState {
  let cell = Math.floor(rand() * 9)
  if (lane.activeCell != null && rand() > 0.35) {
    cell = (cell + 3 + Math.floor(rand() * 6)) % 9
  }
  return {
    ...lane,
    activeCell: cell,
    moleUntil: now + MOLE_VISIBLE_MS,
    lastHitCell: null,
  }
}

export function tickLane(lane: WhackLaneState, now: number, rand: () => number): WhackLaneState {
  if (lane.activeCell != null && now >= lane.moleUntil) {
    return {
      ...lane,
      activeCell: null,
      moleUntil: 0,
      nextSpawnAt: now + spawnDelayMs(rand),
      lastHitCell: null,
    }
  }

  if (lane.activeCell == null && now >= lane.nextSpawnAt) {
    return spawnMole(lane, now, rand)
  }

  return lane
}

export function applyWhack(lane: WhackLaneState, cell: number, now: number, rand: () => number): WhackLaneState {
  if (lane.activeCell !== cell || now > lane.moleUntil) return lane

  return {
    ...lane,
    score: lane.score + 1,
    activeCell: null,
    moleUntil: 0,
    nextSpawnAt: now + spawnDelayMs(rand),
    lastHitCell: cell,
  }
}

export function resolveLegWinner(l1: WhackLaneState, l2: WhackLaneState): 'p1' | 'p2' | 'draw' {
  if (l1.score > l2.score) return 'p1'
  if (l2.score > l1.score) return 'p2'
  return 'draw'
}
