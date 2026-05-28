export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 5
export const ROUND_BREAK_MS = 2000
export const WAIT_MIN_MS = 900
export const WAIT_MAX_MS = 2800
export const GO_WINDOW_MS = 1200

export type ReflexPhase = 'idle' | 'wait' | 'go' | 'result'

export type ReflexLaneState = {
  laneId: 1 | 2
  score: number
  matchPoints: number
  lastReactionMs: number | null
  falseStarts: number
}

export type ReflexRoundResult = {
  winner: 1 | 2 | 'draw' | 'false-p1' | 'false-p2'
  p1Ms: number | null
  p2Ms: number | null
}

export type ReflexState = {
  phase: ReflexPhase
  lane1: ReflexLaneState
  lane2: ReflexLaneState
  goAt: number
  waitEndsAt: number
  resultUntil: number
  lastResult: ReflexRoundResult | null
  roundNumber: number
}

export function createLane(laneId: 1 | 2): ReflexLaneState {
  return {
    laneId,
    score: 0,
    matchPoints: 0,
    lastReactionMs: null,
    falseStarts: 0,
  }
}

export function createReflexState(): ReflexState {
  return {
    phase: 'idle',
    lane1: createLane(1),
    lane2: createLane(2),
    goAt: 0,
    waitEndsAt: 0,
    resultUntil: 0,
    lastResult: null,
    roundNumber: 1,
  }
}

export function scheduleWait(now: number, rand: () => number): Pick<ReflexState, 'phase' | 'waitEndsAt' | 'goAt'> {
  const delay = WAIT_MIN_MS + rand() * (WAIT_MAX_MS - WAIT_MIN_MS)
  return {
    phase: 'wait',
    waitEndsAt: now + delay,
    goAt: now + delay,
  }
}

export function activateGo(now: number): Pick<ReflexState, 'phase' | 'goAt'> {
  return { phase: 'go', goAt: now }
}

export function scoreReaction(ms: number) {
  return Math.max(10, Math.round(500 - ms * 0.45))
}

export function applyTap(
  state: ReflexState,
  player: 1 | 2,
  now: number,
): { state: ReflexState; result: ReflexRoundResult | null } {
  if (state.phase === 'result') return { state, result: null }

  if (state.phase === 'wait') {
    const laneKey = player === 1 ? 'lane1' : 'lane2'
    const lane = {
      ...state[laneKey],
      falseStarts: state[laneKey].falseStarts + 1,
    }
    const otherKey = player === 1 ? 'lane2' : 'lane1'
    const other = { ...state[otherKey], score: state[otherKey].score + 1 }
    const result: ReflexRoundResult = {
      winner: player === 1 ? 'false-p1' : 'false-p2',
      p1Ms: null,
      p2Ms: null,
    }
    const next: ReflexState = {
      ...state,
      [laneKey]: lane,
      [otherKey]: other,
      phase: 'result',
      lastResult: result,
      resultUntil: now + 1400,
    }
    return { state: next, result }
  }

  if (state.phase !== 'go') return { state, result: null }

  const ms = now - state.goAt
  if (ms > GO_WINDOW_MS) return { state, result: null }

  let lane1 = state.lane1
  let lane2 = state.lane2

  if (player === 1) {
    lane1 = { ...lane1, lastReactionMs: ms, score: lane1.score + 1 }
  } else {
    lane2 = { ...lane2, lastReactionMs: ms, score: lane2.score + 1 }
  }

  const result: ReflexRoundResult = {
    winner: player,
    p1Ms: player === 1 ? ms : state.lane1.lastReactionMs,
    p2Ms: player === 2 ? ms : state.lane2.lastReactionMs,
  }

  const next: ReflexState = {
    ...state,
    lane1,
    lane2,
    phase: 'result',
    lastResult: result,
    resultUntil: now + 1200,
  }
  return { state: next, result }
}

export function resolveLegWinner(l1: ReflexLaneState, l2: ReflexLaneState): 'p1' | 'p2' | 'draw' {
  if (l1.score > l2.score) return 'p1'
  if (l2.score > l1.score) return 'p2'
  return 'draw'
}
