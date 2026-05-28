import type { LaneId, RhythmNote } from './rhythmDuelEngine'
import { GOOD_MS } from './rhythmDuelEngine'

export function botHitOffsetMs(): number {
  return (Math.random() - 0.5) * GOOD_MS * 1.4
}

export function botMissChance(combo: number): number {
  const base = 0.06 + combo * 0.008
  return Math.min(0.22, base)
}

export function pickBotWrongLane(correct: LaneId): LaneId {
  return ((correct + 1 + Math.floor(Math.random() * 3)) % 4) as LaneId
}

export function pickBotNote(notes: RhythmNote[], now: number): RhythmNote | null {
  let best: RhythmNote | null = null
  let bestDelta = Infinity
  for (const n of notes) {
    if (n.resolved) continue
    const delta = Math.abs(now - n.hitAt)
    if (delta <= GOOD_MS && delta < bestDelta) {
      best = n
      bestDelta = delta
    }
  }
  return best
}
