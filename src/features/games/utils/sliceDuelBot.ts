import type { SliceObject } from './sliceDuelEngine'
import { objectPos } from './sliceDuelEngine'

export function botSliceDelayMs(score: number): number {
  const fast = Math.min(score / 2200, 1) * 55
  return Math.max(12, 35 + Math.random() * 75 - fast)
}

export function botBombSliceChance(score: number): number {
  return Math.max(0.04, 0.1 - Math.min(score / 4000, 1) * 0.05)
}

export function pickBotTarget(objects: SliceObject[], now: number): SliceObject | null {
  let bestFruit: SliceObject | null = null
  let bestFruitY = Infinity
  let bestBomb: SliceObject | null = null
  let bestBombY = Infinity

  for (const o of objects) {
    if (o.sliced) continue
    const { y } = objectPos(o, now)
    if (y < 34 || y > 76) continue
    if (o.kind === 'fruit' && y < bestFruitY) {
      bestFruit = o
      bestFruitY = y
    }
    if (o.kind === 'bomb' && y < bestBombY) {
      bestBomb = o
      bestBombY = y
    }
  }

  return bestFruit ?? bestBomb
}
