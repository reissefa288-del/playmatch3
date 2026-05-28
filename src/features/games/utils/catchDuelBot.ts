import type { CatchItem } from './catchDuelEngine'
import { CATCH_Y_MAX, CATCH_Y_MIN, itemY } from './catchDuelEngine'

export function botCatchDelayMs(): number {
  return 40 + Math.random() * 120
}

export function botMissChance(): number {
  return 0.12 + Math.random() * 0.1
}

export function pickBotCatchItem(items: CatchItem[], now: number): CatchItem | null {
  let best: CatchItem | null = null
  let bestY = -1
  for (const it of items) {
    if (it.caught) continue
    const y = itemY(it, now)
    if (y >= CATCH_Y_MIN && y <= CATCH_Y_MAX && y > bestY) {
      best = it
      bestY = y
    }
  }
  return best
}
