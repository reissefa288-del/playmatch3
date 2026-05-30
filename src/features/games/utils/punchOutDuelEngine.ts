export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 3600
export const LEG_DURATION_MS = 55_000
export const ROUND_BREAK_MS = 2600
export const PLAYER_MAX_HP = 100
export const OPPONENT_MAX_HP = 100
export const TELEGRAPH_MS = 850
export const ATTACK_MS = 550
export const OPENING_MS = 750
export const IDLE_MIN_MS = 450
export const IDLE_MAX_MS = 950
export const STUN_MS = 900
export const ACTION_COOLDOWN_MS = 120

export type AttackKind = 'left' | 'right' | 'body'
export type DodgeKind = 'left' | 'right' | 'duck'
export type PunchKind = 'jab' | 'hook' | 'uppercut'
export type Phase = 'idle' | 'telegraph' | 'attack' | 'opening' | 'stunned'

export type PunchOutSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  playerHp: number
  opponentHp: number
  phase: Phase
  attackKind: AttackKind | null
  phaseUntil: number
  nextPhaseAt: number
  knockdowns: number
  perfectDodges: number
  lastActionAt: number
  lastPunchKind: PunchKind | null
  flashMessage: string | null
}

export type PunchOutState = {
  p1: PunchOutSideState
  p2: PunchOutSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

const ATTACKS: AttackKind[] = ['left', 'right', 'body']
const PUNCH_SCORE: Record<PunchKind, number> = { jab: 280, hook: 340, uppercut: 420 }
const DODGE_SCORE = 120
const COUNTER_BONUS = 180
const HIT_DAMAGE = 22
const HP_DAMAGE = 18

export function attackLabel(kind: AttackKind) {
  if (kind === 'left') return 'SOL'
  if (kind === 'right') return 'SAĞ'
  return 'ALT'
}

export function dodgeForAttack(kind: AttackKind): DodgeKind {
  if (kind === 'left') return 'left'
  if (kind === 'right') return 'right'
  return 'duck'
}

export function attackArrow(kind: AttackKind) {
  if (kind === 'left') return '←'
  if (kind === 'right') return '→'
  return '↓'
}

export function createSide(sideId: 1 | 2, now: number): PunchOutSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    playerHp: PLAYER_MAX_HP,
    opponentHp: OPPONENT_MAX_HP,
    phase: 'idle',
    attackKind: null,
    phaseUntil: 0,
    nextPhaseAt: now + 600,
    knockdowns: 0,
    perfectDodges: 0,
    lastActionAt: 0,
    lastPunchKind: null,
    flashMessage: null,
  }
}

export function createPunchOutState(now: number): PunchOutState {
  return {
    p1: createSide(1, now),
    p2: createSide(2, now),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

function pickAttack(rand: () => number): AttackKind {
  return ATTACKS[Math.floor(rand() * ATTACKS.length)]!
}

function scheduleIdle(side: PunchOutSideState, now: number, rand: () => number): PunchOutSideState {
  const gap = IDLE_MIN_MS + rand() * (IDLE_MAX_MS - IDLE_MIN_MS)
  return { ...side, phase: 'idle', attackKind: null, phaseUntil: 0, nextPhaseAt: now + gap, flashMessage: null }
}

function startTelegraph(side: PunchOutSideState, now: number, rand: () => number): PunchOutSideState {
  const kind = pickAttack(rand)
  return {
    ...side,
    phase: 'telegraph',
    attackKind: kind,
    phaseUntil: now + TELEGRAPH_MS,
    nextPhaseAt: 0,
    flashMessage: attackLabel(kind),
  }
}

function startAttack(side: PunchOutSideState, now: number): PunchOutSideState {
  return { ...side, phase: 'attack', phaseUntil: now + ATTACK_MS }
}

function startOpening(side: PunchOutSideState, now: number): PunchOutSideState {
  return { ...side, phase: 'opening', phaseUntil: now + OPENING_MS, flashMessage: 'VUR!' }
}

function takeHit(side: PunchOutSideState, now: number, rand: () => number): PunchOutSideState {
  const playerHp = Math.max(0, side.playerHp - HP_DAMAGE)
  return {
    ...scheduleIdle({ ...side, playerHp, flashMessage: 'YEDİN!' }, now, rand),
    phase: 'stunned',
    phaseUntil: now + STUN_MS,
    nextPhaseAt: now + STUN_MS,
  }
}

function damageOpponent(side: PunchOutSideState, dmg: number, now: number, rand: () => number): PunchOutSideState {
  let opponentHp = Math.max(0, side.opponentHp - dmg)
  let knockdowns = side.knockdowns
  let score = side.score
  if (opponentHp <= 0) {
    knockdowns += 1
    score += 600
    opponentHp = OPPONENT_MAX_HP
  }
  return scheduleIdle({ ...side, opponentHp, knockdowns, score, flashMessage: 'GÜZEL!' }, now, rand)
}

export function tryDodge(side: PunchOutSideState, dodge: DodgeKind, now: number, rand: () => number): PunchOutSideState {
  if (side.playerHp <= 0 || side.phase !== 'attack' || now - side.lastActionAt < ACTION_COOLDOWN_MS) return side
  if (!side.attackKind) return side

  const correct = dodgeForAttack(side.attackKind) === dodge
  if (!correct) return takeHit({ ...side, lastActionAt: now }, now, rand)

  return {
    ...startOpening({ ...side, lastActionAt: now }, now),
    score: side.score + DODGE_SCORE,
    perfectDodges: side.perfectDodges + 1,
    flashMessage: 'KAÇTIN!',
  }
}

export function tryPunch(side: PunchOutSideState, punch: PunchKind, now: number, rand: () => number): PunchOutSideState {
  if (side.playerHp <= 0 || side.phase !== 'opening' || now - side.lastActionAt < ACTION_COOLDOWN_MS) return side

  let scoreGain = PUNCH_SCORE[punch]
  if (side.attackKind === 'left' && punch === 'hook') scoreGain += COUNTER_BONUS
  if (side.attackKind === 'right' && punch === 'jab') scoreGain += COUNTER_BONUS
  if (side.attackKind === 'body' && punch === 'uppercut') scoreGain += COUNTER_BONUS

  const dmg = Math.round(HIT_DAMAGE * (punch === 'uppercut' ? 1.35 : punch === 'hook' ? 1.15 : 1))
  return damageOpponent(
    { ...side, score: side.score + scoreGain, lastActionAt: now, lastPunchKind: punch },
    dmg,
    now,
    rand,
  )
}

export function tickSide(side: PunchOutSideState, now: number, rand: () => number): PunchOutSideState {
  if (side.playerHp <= 0) return side

  let s = side

  if (s.flashMessage && s.phase === 'idle' && now > s.nextPhaseAt - 200) {
    s = { ...s, flashMessage: null }
  }

  if (s.phase === 'idle' && now >= s.nextPhaseAt) {
    s = startTelegraph(s, now, rand)
  } else if (s.phase === 'telegraph' && now >= s.phaseUntil) {
    s = startAttack(s, now)
  } else if (s.phase === 'attack' && now >= s.phaseUntil) {
    s = takeHit(s, now, rand)
  } else if (s.phase === 'opening' && now >= s.phaseUntil) {
    s = scheduleIdle(s, now, rand)
  } else if (s.phase === 'stunned' && now >= s.phaseUntil) {
    s = scheduleIdle(s, now, rand)
  }

  return s
}

export function legShouldEnd(g: PunchOutState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: PunchOutSideState, p2: PunchOutSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}

export function hpPct(hp: number) {
  return Math.max(0, Math.min(100, hp))
}
