import type { SliceObject } from './sliceDuelEngine'
import { objectY } from './sliceDuelEngine'

export function botSliceDelayMs(): number {
  return 30 + Math.random() * 90
}

export function botBombSliceChance(): number {
  return 0.06
}

export function pickBotTarget(objects: SliceObject[], now: number): SliceObject | null {
  let best: SliceObject | null = null
  let bestY = Infinity
  for (const o of objects) {
    if (o.sliced) continue
    const y = objectY(o, now)
    if (y >= 38 && y <= 78 && y < bestY) {
      best = o
      bestY = y
    }
  }
  return best
}
