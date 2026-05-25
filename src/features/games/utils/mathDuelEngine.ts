export const MATCH_ROUNDS = 10
export const WIN_ROUNDS = 6
export const ROUND_SECONDS = 88
export const ROUND_BREAK_MS = 2600
export const QUESTION_MS = 14_000
export const CORRECT_POINTS = 250
export const WRONG_POINTS = 150
export const LIVES_START = 3
export const COMBO_SEGMENTS = 5

export type MathOp = '+' | '-' | '×'

export type MathToken =
  | { kind: 'num'; value: string }
  | { kind: 'op'; value: MathOp; tone: 'plus' | 'minus' | 'mul' }

export type MathProblem = {
  id: number
  tokens: MathToken[]
  answer: number
  choices: number[]
  correctIndex: number
}

export type MathFeedback = 'correct' | 'wrong' | null

export type MathPowerupId = 'time' | 'double' | 'shield' | 'erase'

export type MathLaneState = {
  laneId: number
  score: number
  lives: number
  combo: number
  comboFill: number
  selectedIndex: number | null
  feedback: MathFeedback
  feedbackPoints: number
  feedbackPop: string | null
  activeBuff: 'double' | 'shield' | null
  buffLabel: string | null
  powerups: Record<MathPowerupId, number>
  matchPoints: number
  answered: boolean
}

export type AnswerResult = {
  lane: MathLaneState
  correct: boolean
  points: number
  lostLife: boolean
}

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function evalExpr(nums: number[], ops: MathOp[]): number {
  let acc = nums[0]!
  for (let i = 0; i < ops.length; i++) {
    const n = nums[i + 1]!
    const op = ops[i]!
    if (op === '+') acc += n
    else if (op === '-') acc -= n
    else acc *= n
  }
  return acc
}

function buildChoices(answer: number, rand: () => number): { choices: number[]; correctIndex: number } {
  const deltas = new Set<number>()
  deltas.add(0)
  while (deltas.size < 4) {
    const spread = Math.max(3, Math.floor(Math.abs(answer) * 0.15) + 2)
    const d = Math.floor(rand() * spread * 2 + 1) * (rand() > 0.5 ? 1 : -1)
    if (d === 0) continue
    deltas.add(d)
  }
  const offsets = [...deltas]
  const choices = offsets.map((d) => answer + d)
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[choices[i], choices[j]] = [choices[j]!, choices[i]!]
  }
  const shuffledIndex = choices.indexOf(answer)
  return { choices, correctIndex: shuffledIndex }
}

export function createProblem(seed: number, round: number, id: number): MathProblem {
  const rand = mulberry32(seed + round * 31 + id * 7)
  const tier = Math.min(3, Math.floor(round / 3))
  const termCount = tier >= 2 && rand() > 0.35 ? 3 : 2
  const ops: MathOp[] = []
  const nums: number[] = []

  const maxNum = tier === 0 ? 28 : tier === 1 ? 45 : 72
  const allowMul = tier >= 1 && rand() > 0.55

  for (let i = 0; i < termCount; i++) {
    nums.push(5 + Math.floor(rand() * maxNum))
    if (i < termCount - 1) {
      if (allowMul && rand() > 0.72) ops.push('×')
      else ops.push(rand() > 0.42 ? '+' : '-')
    }
  }

  const answer = evalExpr(nums, ops)
  const tokens: MathToken[] = []
  nums.forEach((n, i) => {
    tokens.push({ kind: 'num', value: String(n) })
    if (i < ops.length) {
      const op = ops[i]!
      tokens.push({
        kind: 'op',
        value: op,
        tone: op === '+' ? 'plus' : op === '-' ? 'minus' : 'mul',
      })
    }
  })

  const { choices, correctIndex } = buildChoices(answer, rand)
  return { id, tokens, answer, choices, correctIndex }
}

export function createLane(laneId: number): MathLaneState {
  return {
    laneId,
    score: laneId === 1 ? 12_540 : 11_890,
    lives: LIVES_START,
    combo: 1,
    comboFill: 0.35,
    selectedIndex: null,
    feedback: null,
    feedbackPoints: 0,
    feedbackPop: null,
    activeBuff: null,
    buffLabel: null,
    powerups: { time: 3, double: 2, shield: 2, erase: 3 },
    matchPoints: 0,
    answered: false,
  }
}

export function resetLaneForRound(lane: MathLaneState): MathLaneState {
  return {
    ...lane,
    selectedIndex: null,
    feedback: null,
    feedbackPoints: 0,
    feedbackPop: null,
    activeBuff: null,
    buffLabel: null,
    answered: false,
  }
}

export function decayLaneFx(lane: MathLaneState): MathLaneState {
  if (!lane.feedbackPop && !lane.feedback) return lane
  return {
    ...lane,
    feedback: null,
    feedbackPoints: 0,
    feedbackPop: null,
    selectedIndex: null,
  }
}

export function applyAnswer(
  lane: MathLaneState,
  choiceIndex: number,
  problem: MathProblem,
): AnswerResult {
  if (lane.answered || lane.lives <= 0) {
    return { lane, correct: false, points: 0, lostLife: false }
  }

  const correct = choiceIndex === problem.correctIndex
  let points = 0
  let lostLife = false
  let combo = lane.combo
  let comboFill = lane.comboFill
  let lives = lane.lives
  let activeBuff = lane.activeBuff
  let buffLabel = lane.buffLabel
  let shielded = false

  if (correct) {
    const mult = activeBuff === 'double' ? 2 : 1
    points = CORRECT_POINTS * mult * Math.max(1, combo)
    combo = Math.min(9, combo + 1)
    comboFill = Math.min(1, comboFill + 0.22)
    if (activeBuff === 'double') {
      activeBuff = null
      buffLabel = null
    }
  } else {
    shielded = activeBuff === 'shield'
    if (!shielded) {
      points = -WRONG_POINTS
      lostLife = true
      lives = Math.max(0, lives - 1)
    } else {
      activeBuff = null
      buffLabel = null
    }
    combo = 1
    comboFill = 0.12
  }

  const feedbackPop = correct
    ? `✓ DOĞRU! +${points}`
    : shielded && !correct
      ? 'KORUNDU'
      : `✕ YANLIŞ! ${points}`

  const next: MathLaneState = {
    ...lane,
    score: Math.max(0, lane.score + points),
    lives,
    combo,
    comboFill,
    selectedIndex: choiceIndex,
    feedback: correct ? 'correct' : 'wrong',
    feedbackPoints: points,
    feedbackPop,
    activeBuff,
    buffLabel,
    answered: true,
  }

  return { lane: next, correct, points, lostLife }
}

export function usePowerup(lane: MathLaneState, id: MathPowerupId): { lane: MathLaneState; effect: string | null } {
  const stock = lane.powerups[id]
  if (stock <= 0) return { lane, effect: null }

  const powerups = { ...lane.powerups, [id]: stock - 1 }
  let activeBuff = lane.activeBuff
  let buffLabel = lane.buffLabel
  let effect: string | null = null

  if (id === 'double') {
    activeBuff = 'double'
    buffLabel = '2X PUAN'
    effect = 'double'
  } else if (id === 'shield') {
    activeBuff = 'shield'
    buffLabel = 'SKOR KORUMA'
    effect = 'shield'
  } else if (id === 'time') {
    effect = 'time'
  } else if (id === 'erase') {
    effect = 'erase'
  }

  return {
    lane: { ...lane, powerups, activeBuff, buffLabel },
    effect,
  }
}

export function resolveRoundWinner(l1: MathLaneState, l2: MathLaneState): 'p1' | 'p2' | 'draw' {
  if (l1.score > l2.score) return 'p1'
  if (l2.score > l1.score) return 'p2'
  return 'draw'
}

export function startNewRound(l1: MathLaneState, l2: MathLaneState): { lane1: MathLaneState; lane2: MathLaneState } {
  return {
    lane1: resetLaneForRound({ ...l1, score: 0, lives: LIVES_START, combo: 1, comboFill: 0 }),
    lane2: resetLaneForRound({ ...l2, score: 0, lives: LIVES_START, combo: 1, comboFill: 0 }),
  }
}
