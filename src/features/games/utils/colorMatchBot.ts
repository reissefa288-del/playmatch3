import type { ColorLaneState } from './colorMatchEngine'
import { findNextMatchIndex } from './colorMatchEngine'

export function botThinkDelayMs(combo: number) {
  return Math.max(750, 1200 - combo * 40)
}

export function pickBotTapIndex(lane: ColorLaneState, seed: number): number {
  const correct = findNextMatchIndex(lane)
  if (correct >= 0) return correct
  return seed % lane.cells.length
}
