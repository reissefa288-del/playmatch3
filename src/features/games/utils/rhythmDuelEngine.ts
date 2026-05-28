export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 3500
export const LEG_DURATION_MS = 45_000
export const ROUND_BREAK_MS = 2400
export const FALL_MS = 1500
export const PERFECT_MS = 70
export const GOOD_MS = 130
export const MISS_LATE_MS = 160
export const LANE_COUNT = 4
export const BEAT_BASE_MS = 400

export type LaneId = 0 | 1 | 2 | 3
export type HitGrade = 'perfect' | 'good' | 'miss'

export type RhythmNote = {
  id: number
  lane: LaneId
  spawnAt: number
  hitAt: number
  resolved: boolean
}

export type RhythmLaneState = {
  laneId: 1 | 2
  score: number
  matchPoints: number
  combo: number
  perfects: number
  lastGrade: HitGrade | null
  lastGradeUntil: number
}

export type RhythmState = {
  notes: RhythmNote[]
  legStartAt: number
  legEndsAt: number
  nextSpawnAt: number
  nextNoteId: number
  lane1: RhythmLaneState
  lane2: RhythmLaneState
  roundNumber: number
}

export function createLane(laneId: 1 | 2): RhythmLaneState {
  return {
    laneId,
    score: 0,
    matchPoints: 0,
    combo: 0,
    perfects: 0,
    lastGrade: null,
    lastGradeUntil: 0,
  }
}

export function createRhythmState(now: number): RhythmState {
  return {
    notes: [],
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    nextSpawnAt: now + 600,
    nextNoteId: 1,
    lane1: createLane(1),
    lane2: createLane(2),
    roundNumber: 1,
  }
}

export function spawnNote(state: RhythmState, now: number, rand: () => number): RhythmState {
  const lane = Math.floor(rand() * LANE_COUNT) as LaneId
  const note: RhythmNote = {
    id: state.nextNoteId,
    lane,
    spawnAt: now,
    hitAt: now + FALL_MS,
    resolved: false,
  }
  const gap = BEAT_BASE_MS * (0.75 + rand() * 0.55)
  return {
    ...state,
    notes: [...state.notes, note],
    nextNoteId: state.nextNoteId + 1,
    nextSpawnAt: now + gap,
  }
}

export function gradeForDelta(ms: number): HitGrade | null {
  const d = Math.abs(ms)
  if (d <= PERFECT_MS) return 'perfect'
  if (d <= GOOD_MS) return 'good'
  return null
}

export function pointsForGrade(grade: HitGrade, combo: number): number {
  const mult = 1 + Math.min(combo, 12) * 0.06
  if (grade === 'perfect') return Math.round(150 * mult)
  return Math.round(70 * mult)
}

export function applyLaneHit(
  lane: RhythmLaneState,
  grade: HitGrade,
  now: number,
): RhythmLaneState {
  if (grade === 'miss') {
    return {
      ...lane,
      combo: 0,
      lastGrade: 'miss',
      lastGradeUntil: now + 500,
    }
  }
  const combo = lane.combo + 1
  const add = pointsForGrade(grade, lane.combo)
  return {
    ...lane,
    score: lane.score + add,
    combo,
    perfects: grade === 'perfect' ? lane.perfects + 1 : lane.perfects,
    lastGrade: grade,
    lastGradeUntil: now + 450,
  }
}

export function findHittableNote(notes: RhythmNote[], tapLane: LaneId, now: number): RhythmNote | null {
  let best: RhythmNote | null = null
  let bestDelta = Infinity
  for (const n of notes) {
    if (n.resolved || n.lane !== tapLane) continue
    const delta = Math.abs(now - n.hitAt)
    if (delta <= GOOD_MS && delta < bestDelta) {
      best = n
      bestDelta = delta
    }
  }
  return best
}

export function tapLane(
  state: RhythmState,
  player: 1 | 2,
  tapLaneId: LaneId,
  now: number,
): RhythmState {
  const note = findHittableNote(state.notes, tapLaneId, now)
  const laneKey = player === 1 ? 'lane1' : 'lane2'
  let lane = state[laneKey]

  if (!note) {
    lane = applyLaneHit(lane, 'miss', now)
    return { ...state, [laneKey]: lane }
  }

  const grade = gradeForDelta(now - note.hitAt) ?? 'miss'
  lane = applyLaneHit(lane, grade, now)
  const notes = state.notes.map((n) => (n.id === note.id ? { ...n, resolved: true } : n))
  return { ...state, notes, [laneKey]: lane }
}

export function resolveMissedNotes(state: RhythmState, now: number): RhythmState {
  let changed = false

  const notes = state.notes.map((n) => {
    if (n.resolved) return n
    if (now - n.hitAt > MISS_LATE_MS) {
      changed = true
      return { ...n, resolved: true }
    }
    return n
  })

  if (!changed) return state
  return { ...state, notes }
}

export function noteProgress(note: RhythmNote, now: number): number {
  return Math.min(1.12, Math.max(0, (now - note.spawnAt) / FALL_MS))
}

export function resolveLegWinner(l1: RhythmLaneState, l2: RhythmLaneState): 'p1' | 'p2' | 'draw' {
  if (l1.score > l2.score) return 'p1'
  if (l2.score > l1.score) return 'p2'
  return 'draw'
}

export function legShouldEnd(state: RhythmState, now: number): boolean {
  if (now >= state.legEndsAt) return true
  if (state.lane1.score >= POINTS_TO_WIN || state.lane2.score >= POINTS_TO_WIN) return true
  return false
}
