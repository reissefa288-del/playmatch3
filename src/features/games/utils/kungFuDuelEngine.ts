export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 3800
export const LEG_DURATION_MS = 55_000
export const ROUND_BREAK_MS = 2600
export const PLAYER_MAX_HP = 100
export const OPPONENT_MAX_HP = 100
export const TELEGRAPH_MS = 800
export const ATTACK_MS = 520
export const OPENING_MS = 800
export const IDLE_MIN_MS = 420
export const IDLE_MAX_MS = 900
export const STUN_MS = 850
export const ACTION_COOLDOWN_MS = 110

export type AttackKind = 'high' | 'low' | 'rush'
export type BlockKind = 'high' | 'low' | 'back'
export type StrikeKind = 'punch' | 'kick' | 'palm'
export type Phase = 'idle' | 'telegraph' | 'attack' | 'opening' | 'stunned'

export type KungFuSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  playerHp: number
  opponentHp: number
  phase: Phase
  attackKind: AttackKind | null
  phaseUntil: number
  nextPhaseAt: number
  combos: number
  perfectBlocks: number
  lastActionAt: number
  lastStrikeKind: StrikeKind | null
  flashMessage: string | null
}

export type KungFuState = {
  p1: KungFuSideState
  p2: KungFuSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

const ATTACKS: AttackKind[] = ['high', 'low', 'rush']
const STRIKE_SCORE: Record<StrikeKind, number> = { punch: 260, kick: 360, palm: 320 }
const BLOCK_SCORE = 130
const COUNTER_BONUS = 200
const COMBO_BONUS = 80
const FINISHER_BONUS = 650
const HIT_DAMAGE = 20
const HP_DAMAGE = 16

export function attackLabel(kind: AttackKind) {
  if (kind === 'high') return 'ÜST'
  if (kind === 'low') return 'ALT'
  return 'DAL'
}

export function blockForAttack(kind: AttackKind): BlockKind {
  if (kind === 'high') return 'high'
  if (kind === 'low') return 'low'
  return 'back'
}

export function attackGlyph(kind: AttackKind) {
  if (kind === 'high') return '↑'
  if (kind === 'low') return '↓'
  return '⇢'
}

export function createSide(sideId: 1 | 2, now: number): KungFuSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    playerHp: PLAYER_MAX_HP,
    opponentHp: OPPONENT_MAX_HP,
    phase: 'idle',
    attackKind: null,
    phaseUntil: 0,
    nextPhaseAt: now + 550,
    combos: 0,
    perfectBlocks: 0,
    lastActionAt: 0,
    lastStrikeKind: null,
    flashMessage: null,
  }
}

export function createKungFuState(now: number): KungFuState {
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

function scheduleIdle(side: KungFuSideState, now: number, rand: () => number): KungFuSideState {
  const gap = IDLE_MIN_MS + rand() * (IDLE_MAX_MS - IDLE_MIN_MS)
  return { ...side, phase: 'idle', attackKind: null, phaseUntil: 0, nextPhaseAt: now + gap, flashMessage: null }
}

function startTelegraph(side: KungFuSideState, now: number, rand: () => number): KungFuSideState {
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

function startAttack(side: KungFuSideState, now: number): KungFuSideState {
  return { ...side, phase: 'attack', phaseUntil: now + ATTACK_MS }
}

function startOpening(side: KungFuSideState, now: number): KungFuSideState {
  return { ...side, phase: 'opening', phaseUntil: now + OPENING_MS, flashMessage: 'KONTRA!' }
}

function takeHit(side: KungFuSideState, now: number, rand: () => number): KungFuSideState {
  const playerHp = Math.max(0, side.playerHp - HP_DAMAGE)
  return {
    ...scheduleIdle({ ...side, playerHp, combos: 0, flashMessage: 'VURULDUN!' }, now, rand),
    phase: 'stunned',
    phaseUntil: now + STUN_MS,
    nextPhaseAt: now + STUN_MS,
  }
}

function damageOpponent(side: KungFuSideState, dmg: number, now: number, rand: () => number): KungFuSideState {
  let opponentHp = Math.max(0, side.opponentHp - dmg)
  let combos = side.combos + 1
  let score = side.score + (combos > 1 ? COMBO_BONUS : 0)
  if (opponentHp <= 0) {
    score += FINISHER_BONUS
    combos = 0
    opponentHp = OPPONENT_MAX_HP
  }
  return scheduleIdle({ ...side, opponentHp, combos, score, flashMessage: 'Hİ-YA!' }, now, rand)
}

export function tryBlock(side: KungFuSideState, block: BlockKind, now: number, rand: () => number): KungFuSideState {
  if (side.playerHp <= 0 || side.phase !== 'attack' || now - side.lastActionAt < ACTION_COOLDOWN_MS) return side
  if (!side.attackKind) return side

  const correct = blockForAttack(side.attackKind) === block
  if (!correct) return takeHit({ ...side, lastActionAt: now }, now, rand)

  return {
    ...startOpening({ ...side, lastActionAt: now }, now),
    score: side.score + BLOCK_SCORE,
    perfectBlocks: side.perfectBlocks + 1,
    flashMessage: 'BLOK!',
  }
}

export function tryStrike(side: KungFuSideState, strike: StrikeKind, now: number, rand: () => number): KungFuSideState {
  if (side.playerHp <= 0 || side.phase !== 'opening' || now - side.lastActionAt < ACTION_COOLDOWN_MS) return side

  let scoreGain = STRIKE_SCORE[strike]
  if (side.attackKind === 'high' && strike === 'palm') scoreGain += COUNTER_BONUS
  if (side.attackKind === 'low' && strike === 'kick') scoreGain += COUNTER_BONUS
  if (side.attackKind === 'rush' && strike === 'punch') scoreGain += COUNTER_BONUS

  const dmg = Math.round(HIT_DAMAGE * (strike === 'kick' ? 1.3 : strike === 'palm' ? 1.15 : 1))
  return damageOpponent(
    { ...side, score: side.score + scoreGain, lastActionAt: now, lastStrikeKind: strike },
    dmg,
    now,
    rand,
  )
}

export function tickSide(side: KungFuSideState, now: number, rand: () => number): KungFuSideState {
  if (side.playerHp <= 0) return side

  let s = side

  if (s.phase === 'idle' && now >= s.nextPhaseAt) {
    s = startTelegraph(s, now, rand)
  } else if (s.phase === 'telegraph' && now >= s.phaseUntil) {
    s = startAttack(s, now)
  } else if (s.phase === 'attack' && now >= s.phaseUntil) {
    s = takeHit(s, now, rand)
  } else if (s.phase === 'opening' && now >= s.phaseUntil) {
    s = scheduleIdle({ ...s, combos: 0 }, now, rand)
  } else if (s.phase === 'stunned' && now >= s.phaseUntil) {
    s = scheduleIdle(s, now, rand)
  }

  return s
}

export function legShouldEnd(g: KungFuState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: KungFuSideState, p2: KungFuSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}

export function hpPct(hp: number) {
  return Math.max(0, Math.min(100, hp))
}
