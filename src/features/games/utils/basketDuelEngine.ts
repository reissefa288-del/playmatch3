export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 11
export const ROUND_BREAK_MS = 2600
export const FLIGHT_MS = 900
export const TURN_GAP_MS = 600
export const MARKER_SPEED = 0.095

export type ShotGrade = 'perfect' | 'good' | 'ok' | 'miss'
export type BasketPhase = 'aim' | 'flight' | 'turn-end' | 'idle'

export type BasketLaneState = {
  laneId: 1 | 2
  score: number
  matchPoints: number
}

export type BasketState = {
  phase: BasketPhase
  turn: 1 | 2
  marker: number
  markerDir: 1 | -1
  lockedMarker: number | null
  lastGrade: ShotGrade | null
  lastPoints: number
  flightUntil: number
  turnEndUntil: number
  lane1: BasketLaneState
  lane2: BasketLaneState
  roundNumber: number
}

export function createLane(laneId: 1 | 2): BasketLaneState {
  return { laneId, score: 0, matchPoints: 0 }
}

export function createBasketState(): BasketState {
  return {
    phase: 'aim',
    turn: 1,
    marker: 50,
    markerDir: 1,
    lockedMarker: null,
    lastGrade: null,
    lastPoints: 0,
    flightUntil: 0,
    turnEndUntil: 0,
    lane1: createLane(1),
    lane2: createLane(2),
    roundNumber: 1,
  }
}

export function gradeMarker(pos: number): ShotGrade {
  const d = Math.abs(pos - 50)
  if (d <= 9) return 'perfect'
  if (d <= 20) return 'good'
  if (d <= 34) return 'ok'
  return 'miss'
}

export function pointsForGrade(grade: ShotGrade): number {
  if (grade === 'perfect') return 3
  if (grade === 'good') return 2
  if (grade === 'ok') return 1
  return 0
}

export function tickMarker(state: BasketState, dt: number): BasketState {
  if (state.phase !== 'aim') return state
  let marker = state.marker + state.markerDir * MARKER_SPEED * dt * 60
  let markerDir = state.markerDir
  if (marker >= 100) {
    marker = 100
    markerDir = -1
  } else if (marker <= 0) {
    marker = 0
    markerDir = 1
  }
  return { ...state, marker, markerDir }
}

export function shoot(state: BasketState, player: 1 | 2, now: number): BasketState {
  if (state.phase !== 'aim' || state.turn !== player) return state

  const pos = state.marker
  const grade = gradeMarker(pos)
  const pts = pointsForGrade(grade)
  const laneKey = player === 1 ? 'lane1' : 'lane2'
  const lane = { ...state[laneKey], score: state[laneKey].score + pts }

  return {
    ...state,
    [laneKey]: lane,
    phase: 'flight',
    lockedMarker: pos,
    lastGrade: grade,
    lastPoints: pts,
    flightUntil: now + FLIGHT_MS,
  }
}

export function endFlight(state: BasketState, now: number): BasketState {
  if (state.phase !== 'flight') return state
  return {
    ...state,
    phase: 'turn-end',
    turnEndUntil: now + TURN_GAP_MS,
  }
}

export function nextTurn(state: BasketState): BasketState {
  const nextPlayer = state.turn === 1 ? 2 : 1
  return {
    ...state,
    phase: 'aim',
    turn: nextPlayer as 1 | 2,
    marker: 50,
    markerDir: 1,
    lockedMarker: null,
    lastGrade: null,
    lastPoints: 0,
  }
}

export function resolveLegWinner(l1: BasketLaneState, l2: BasketLaneState): 'p1' | 'p2' | 'draw' {
  if (l1.score > l2.score) return 'p1'
  if (l2.score > l1.score) return 'p2'
  return 'draw'
}

export function legShouldEnd(state: BasketState): boolean {
  return state.lane1.score >= POINTS_TO_WIN || state.lane2.score >= POINTS_TO_WIN
}
