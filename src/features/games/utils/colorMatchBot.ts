import type { ColorId, ColorLaneState } from './colorMatchEngine'
import { findTargetIndex } from './colorMatchEngine'

export function botThinkDelayMs(combo: number) {
  return Math.max(500, 1000 - combo * 50)
}

export function pickBotTapIndex(lane: ColorLaneState, target: ColorId, seed: number): number {
  const correct = findTargetIndex(lane.cells, target)
  if (correct >= 0) return correct
  return seed % 9
}
