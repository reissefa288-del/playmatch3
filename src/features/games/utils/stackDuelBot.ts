import { dropBlock, stackTop, type StackLaneState } from './stackDuelEngine'

export function botThinkDelayMs(combo: number) {
  return Math.max(380, 900 - combo * 45)
}

export function shouldBotDrop(lane: StackLaneState, seed: number): boolean {
  if (lane.finished || lane.lives <= 0) return false
  const top = stackTop(lane)
  const err = Math.abs(lane.active.x - top.x)
  const tol = top.width * 0.07 + 0.015
  const jitter = ((seed * 17) % 100) / 1000
  return err <= tol + jitter
}

export function runBotDrop(lane: StackLaneState, seed: number) {
  return dropBlock(lane, seed)
}
