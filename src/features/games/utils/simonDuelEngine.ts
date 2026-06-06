export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 20
export const ROUND_BREAK_MS = 2200
export const SHOW_PAD_MS = 520
export const SHOW_GAP_MS = 140
export const WRONG_REPLAY_MS = 560
export const SCORE_PAUSE_MS = 1000
export const AUTO_START_MS = 420
export const START_SEQ_LEN = 3
export const MAX_SEQ_LEN = 9

export type PadId = 0 | 1 | 2 | 3
export type SimonLanePhase = 'ready' | 'show' | 'input'
export type SimonShowBeat = 'lit' | 'gap'

export type SimonLaneState = {
  laneId: 1 | 2
  score: number
  matchPoints: number
  phase: SimonLanePhase
  sequence: PadId[]
  showIndex: number
  showPad: PadId | null
  showBeat: SimonShowBeat
  showUntil: number
  inputIndex: number
  highlightPad: PadId | null
  inputStartedAt: number
  replayCount: number
  combo: number
  lastScoreGain: number
  wrongFlashUntil: number
  activeSeqLength: number
}

export type SimonState = {
  seqLength: number
  lane1: SimonLaneState
  lane2: SimonLaneState
  roundNumber: number
}

export function comboBonus(combo: number): number {
  if (combo < 2) return 0
  return Math.min(8, (combo - 1) * 2)
}

export function createLane(laneId: 1 | 2): SimonLaneState {
  return {
    laneId,
    score: 0,
    matchPoints: 0,
    phase: 'ready',
    sequence: [],
    showIndex: -1,
    showPad: null,
    showBeat: 'lit',
    showUntil: 0,
    inputIndex: 0,
    highlightPad: null,
    inputStartedAt: 0,
    replayCount: 0,
    combo: 0,
    lastScoreGain: 0,
    wrongFlashUntil: 0,
    activeSeqLength: 0,
  }
}

export function createSimonState(): SimonState {
  return {
    seqLength: START_SEQ_LEN,
    lane1: createLane(1),
    lane2: createLane(2),
    roundNumber: 1,
  }
}

export function scoreForCompletion(
  seqLength: number,
  inputStartedAt: number,
  completedAt: number,
  replayCount: number,
): number {
  if (seqLength <= 0) return 0
  const elapsed = Math.max(1, completedAt - inputStartedAt)
  const ideal = seqLength * 460
  const speedFactor = Math.min(2.1, ideal / elapsed)
  const base = seqLength * 2.2
  const raw = base * speedFactor
  const penalty = replayCount * 1.8
  return Math.max(1, Math.min(14, Math.round(raw - penalty)))
}

export function beginWatch(lane: SimonLaneState, sequence: PadId[], now: number): SimonLaneState {
  const first = sequence[0]!
  return {
    ...lane,
    phase: 'show',
    sequence,
    activeSeqLength: sequence.length,
    showIndex: 0,
    showPad: first,
    showBeat: 'lit',
    showUntil: now + SHOW_PAD_MS,
    inputIndex: 0,
    highlightPad: null,
    inputStartedAt: 0,
    replayCount: 0,
    lastScoreGain: 0,
    wrongFlashUntil: 0,
  }
}

export function replayAfterMistake(lane: SimonLaneState, pad: PadId, now: number): SimonLaneState {
  const first = lane.sequence[0]!
  return {
    ...lane,
    phase: 'show',
    replayCount: lane.replayCount + 1,
    combo: 0,
    highlightPad: pad,
    wrongFlashUntil: now + 400,
    showIndex: 0,
    showPad: first,
    showBeat: 'lit',
    showUntil: now + WRONG_REPLAY_MS + SHOW_PAD_MS,
    inputIndex: 0,
    inputStartedAt: 0,
  }
}

export function advanceLaneShow(lane: SimonLaneState, now: number): SimonLaneState {
  if (lane.phase !== 'show' || now < lane.showUntil) return lane

  if (lane.showBeat === 'lit') {
    if (lane.showIndex >= lane.sequence.length - 1) {
      return {
        ...lane,
        phase: 'input',
        showIndex: lane.sequence.length,
        showPad: null,
        showBeat: 'lit',
        highlightPad: null,
        inputStartedAt: now,
        wrongFlashUntil: 0,
      }
    }

    return {
      ...lane,
      showBeat: 'gap',
      showPad: null,
      showUntil: now + SHOW_GAP_MS,
    }
  }

  const nextIdx = lane.showIndex + 1
  const pad = lane.sequence[nextIdx]!
  return {
    ...lane,
    showIndex: nextIdx,
    showPad: pad,
    showBeat: 'lit',
    showUntil: now + SHOW_PAD_MS,
  }
}

export function applyLaneTap(lane: SimonLaneState, pad: PadId, now: number): SimonLaneState {
  if (lane.phase !== 'input') return lane

  const expected = lane.sequence[lane.inputIndex]
  if (pad !== expected) {
    return replayAfterMistake(lane, pad, now)
  }

  const nextIndex = lane.inputIndex + 1
  if (nextIndex >= lane.sequence.length) {
    const nextCombo = lane.combo + 1
    const baseGain = scoreForCompletion(lane.sequence.length, lane.inputStartedAt, now, lane.replayCount)
    const gain = baseGain + comboBonus(nextCombo)
    return {
      ...lane,
      phase: 'ready',
      inputIndex: 0,
      highlightPad: pad,
      showPad: null,
      score: lane.score + gain,
      combo: nextCombo,
      lastScoreGain: gain,
      replayCount: 0,
    }
  }

  return {
    ...lane,
    inputIndex: nextIndex,
    highlightPad: pad,
    showPad: null,
  }
}

export function resolveLegWinner(l1: SimonLaneState, l2: SimonLaneState): 'p1' | 'p2' | 'draw' {
  if (l1.score > l2.score) return 'p1'
  if (l2.score > l1.score) return 'p2'
  return 'draw'
}
