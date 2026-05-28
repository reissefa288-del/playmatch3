import type { PadId } from './simonDuelEngine'

export function botTapDelayMs(inputIndex: number, seqLength: number): number {
  const base = 320 + inputIndex * 130
  const rush = seqLength > 5 ? -40 : 0
  const jitter = 40 + Math.random() * 120
  return Math.max(180, base + rush + jitter)
}

export function botMistakeChance(seqLength: number): number {
  if (seqLength <= 3) return 0.04
  if (seqLength <= 5) return 0.08
  return 0.12
}

export function pickBotWrongPad(correct: PadId): PadId {
  const wrong = ((correct + 1 + Math.floor(Math.random() * 3)) % 4) as PadId
  return wrong
}
