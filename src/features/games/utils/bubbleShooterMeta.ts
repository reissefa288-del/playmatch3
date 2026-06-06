import type { BubbleKind } from './bubbleShooterEngine'

export type SpecialKind = Exclude<BubbleKind, 'normal'>

export const ROUND_BREAK_MS = 1000

export function pulseBubbleHaptic(kind: SpecialKind | 'overflow') {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return
  const patterns: Record<SpecialKind | 'overflow', number | number[]> = {
    fire: 12,
    bomb: [18, 40, 22],
    rainbow: [8, 30, 14],
    ice: [10, 24, 10],
    overflow: [24, 50, 24],
  }
  navigator.vibrate(patterns[kind])
}
