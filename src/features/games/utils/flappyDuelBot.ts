import { BIRD_X, type FlappyLaneState } from './flappyDuelEngine'

export function botShouldFlap(lane: FlappyLaneState, nowSec: number): boolean {
  if (!lane.alive) return false
  const ahead = lane.pipes
    .filter((p) => p.x + 0.13 > BIRD_X - 0.08)
    .sort((a, b) => a.x - b.x)[0]
  if (!ahead) return lane.birdY > 0.58 && Math.sin(nowSec * 4) > 0.2

  const target = ahead.gapY
  const err = lane.birdY - target
  if (err > 0.06) return true
  if (lane.birdY > 0.72) return true
  if (lane.birdVy > 0.55 && lane.birdY > target - 0.02) return true
  return false
}
