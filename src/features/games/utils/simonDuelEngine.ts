export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 5
export const ROUND_BREAK_MS = 2200
export const SHOW_PAD_MS = 480
export const START_SEQ_LEN = 3
export const MAX_SEQ_LEN = 9

export type PadId = 0 | 1 | 2 | 3
export type SimonPhase = 'idle' | 'show' | 'input' | 'break'

export type SimonLaneState = {
  laneId: 1 | 2
  score: number
  matchPoints: number
  inputIndex: number
  mistake: boolean
}

export type SimonState = {
  phase: SimonPhase
  sequence: PadId[]
  seqLength: number
  showIndex: number
  highlightPad: PadId | null
  showUntil: number
  breakUntil: number
  roundLocked: boolean
  roundWinner: 1 | 2 | null
  lane1: SimonLaneState
  lane2: SimonLaneState
  roundNumber: number
}

export function createLane(laneId: 1 | 2): SimonLaneState {
  return { laneId, score: 0, matchPoints: 0, inputIndex: 0, mistake: false }
}

export function createSimonState(): SimonState {
  return {
    phase: 'idle',
    sequence: [],
    seqLength: START_SEQ_LEN,
    showIndex: -1,
    highlightPad: null,
    showUntil: 0,
    breakUntil: 0,
    roundLocked: false,
    roundWinner: null,
    lane1: createLane(1),
    lane2: createLane(2),
    roundNumber: 1,
  }
}

export function generateSequence(length: number, rand: () => number): PadId[] {
  const seq: PadId[] = []
  for (let i = 0; i < length; i++) {
    seq.push(Math.floor(rand() * 4) as PadId)
  }
  return seq
}

export function beginRound(state: SimonState, now: number, rand: () => number): SimonState {
  const sequence = generateSequence(state.seqLength, rand)
  const first = sequence[0]!
  return {
    ...state,
    phase: 'show',
    sequence,
    showIndex: 0,
    highlightPad: first,
    showUntil: now + SHOW_PAD_MS,
    roundLocked: false,
    roundWinner: null,
    lane1: { ...state.lane1, inputIndex: 0, mistake: false },
    lane2: { ...state.lane2, inputIndex: 0, mistake: false },
  }
}

export function advanceShow(state: SimonState, now: number): SimonState {
  if (state.phase !== 'show' || now < state.showUntil) return state

  const nextIdx = state.showIndex + 1
  if (nextIdx >= state.sequence.length) {
    return {
      ...state,
      phase: 'input',
      showIndex: 0,
      highlightPad: null,
    }
  }

  const pad = state.sequence[nextIdx]!
  return {
    ...state,
    showIndex: nextIdx,
    highlightPad: pad,
    showUntil: now + SHOW_PAD_MS,
  }
}

export function applyTap(
  state: SimonState,
  player: 1 | 2,
  pad: PadId,
  now: number,
): SimonState {
  if (state.phase !== 'input' || state.roundLocked) return state

  const laneKey = player === 1 ? 'lane1' : 'lane2'
  const otherKey = player === 1 ? 'lane2' : 'lane1'
  const lane = state[laneKey]
  const expected = state.sequence[lane.inputIndex]

  if (pad !== expected) {
    const other = { ...state[otherKey], score: state[otherKey].score + 1 }
    return {
      ...state,
      [laneKey]: { ...lane, mistake: true },
      [otherKey]: other,
      phase: 'break',
      breakUntil: now + 1100,
      roundLocked: true,
      roundWinner: player === 1 ? 2 : 1,
      highlightPad: pad,
    }
  }

  const nextLane = { ...lane, inputIndex: lane.inputIndex + 1 }
  if (nextLane.inputIndex >= state.sequence.length) {
    const scored = { ...nextLane, score: nextLane.score + 1 }
    return {
      ...state,
      [laneKey]: scored,
      phase: 'break',
      breakUntil: now + 900,
      roundLocked: true,
      roundWinner: player,
      highlightPad: pad,
    }
  }

  return { ...state, [laneKey]: nextLane, highlightPad: pad }
}

export function resolveLegWinner(l1: SimonLaneState, l2: SimonLaneState): 'p1' | 'p2' | 'draw' {
  if (l1.score > l2.score) return 'p1'
  if (l2.score > l1.score) return 'p2'
  return 'draw'
}
