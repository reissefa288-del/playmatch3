import {
  aimAtCell,
  bubblePos,
  listAttachCandidates,
  neighbors,
  scorePlacement,
  type BubbleColor,
  type LaneState,
} from './bubbleShooterEngine'

export type BotDecision = {
  targetAngle: number
  shouldSwap: boolean
  quality: number
}

export function getBotDecision(lane: LaneState, rng = Math.random): BotDecision {
  let best = {
    score: -1,
    row: 0,
    col: 0,
    swap: false,
  }

  const evaluate = (color: BubbleColor, swap: boolean) => {
    for (const { row, col } of listAttachCandidates(lane.grid)) {
      const removed = scorePlacement(lane.grid, row, col, color)
      if (removed <= 0) continue
      const pos = bubblePos(row, col)
      const heightBonus = (1 - pos.y) * 0.35
      const connectBonus = countSameNeighbors(lane.grid, row, col, color) * 0.5
      const total = removed * 3 + heightBonus + connectBonus
      if (total > best.score) {
        best = { score: total, row, col, swap }
      }
    }
  }

  evaluate(lane.currentColor, false)
  evaluate(lane.nextColor, true)

  if (best.score < 0) {
    return { targetAngle: -Math.PI / 2 + (rng() - 0.5) * 0.16, shouldSwap: false, quality: 0 }
  }

  let angle = aimAtCell(best.row, best.col)
  const jitter = best.score > 4 ? 0.02 : 0.045
  angle += (rng() - 0.5) * jitter

  const currentScore = scorePlacement(lane.grid, best.row, best.col, lane.currentColor)
  const nextScore = scorePlacement(lane.grid, best.row, best.col, lane.nextColor)
  const shouldSwap = best.swap && nextScore > currentScore + 0.5

  return { targetAngle: angle, shouldSwap, quality: best.score }
}

function countSameNeighbors(
  grid: Map<string, BubbleColor>,
  row: number,
  col: number,
  color: BubbleColor,
) {
  let count = 0
  for (const n of neighbors(row, col)) {
    if (grid.get(`${n.row},${n.col}`) === color) count += 1
  }
  return count
}

export function smoothBotAim(current: number, target: number, dt: number, quality: number): number {
  const speed = quality > 5 ? 3.1 : quality > 2 ? 2.45 : 1.85
  const delta = target - current
  const step = Math.sign(delta) * Math.min(Math.abs(delta), speed * dt)
  return current + step
}

export function botFireDelay(quality: number, rng = Math.random): number {
  const base = quality > 5 ? 0.4 : quality > 2 ? 0.5 : 0.62
  return base + rng() * 0.18
}
