export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 2800
export const LEG_DURATION_MS = 40_000
export const ROUND_BREAK_MS = 2400
export const FALL_MS = 2200
export const LANE_COUNT = 3
export const CATCH_Y_MIN = 70
export const CATCH_Y_MAX = 94
export const SPAWN_GAP_MIN_MS = 380
export const SPAWN_GAP_MAX_MS = 720

export type LaneId = 0 | 1 | 2
export type CatchIcon = 'star' | 'gem' | 'coin' | 'bolt'

export const CATCH_ICONS: CatchIcon[] = ['star', 'gem', 'coin', 'bolt']

export const ICON_EMOJI: Record<CatchIcon, string> = {
  star: '⭐',
  gem: '💎',
  coin: '🪙',
  bolt: '⚡',
}

export type CatchItem = {
  id: number
  lane: LaneId
  icon: CatchIcon
  spawnAt: number
  caught: boolean
}

export type CatchSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  combo: number
  items: CatchItem[]
  nextSpawnAt: number
  lastCatchLane: LaneId | null
  lastCatchUntil: number
}

export type CatchState = {
  p1: CatchSideState
  p2: CatchSideState
  legStartAt: number
  legEndsAt: number
  nextItemId: number
  roundNumber: number
}

export function createSide(sideId: 1 | 2): CatchSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    combo: 0,
    items: [],
    nextSpawnAt: 0,
    lastCatchLane: null,
    lastCatchUntil: 0,
  }
}

export function createCatchState(now: number): CatchState {
  return {
    p1: createSide(1),
    p2: createSide(2),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    nextItemId: 1,
    roundNumber: 1,
  }
}

export function itemY(item: CatchItem, now: number): number {
  return ((now - item.spawnAt) / FALL_MS) * 100
}

export function spawnGapMs(rand: () => number) {
  return SPAWN_GAP_MIN_MS + rand() * (SPAWN_GAP_MAX_MS - SPAWN_GAP_MIN_MS)
}

export function spawnItem(side: CatchSideState, now: number, nextId: number, rand: () => number) {
  const lane = Math.floor(rand() * LANE_COUNT) as LaneId
  const icon = CATCH_ICONS[Math.floor(rand() * CATCH_ICONS.length)]!
  const item: CatchItem = { id: nextId, lane, icon, spawnAt: now, caught: false }
  return {
    side: {
      ...side,
      items: [...side.items, item],
      nextSpawnAt: now + spawnGapMs(rand),
    },
    nextId: nextId + 1,
  }
}

export function pruneItems(side: CatchSideState, now: number): CatchSideState {
  const items = side.items.filter((it) => !it.caught && itemY(it, now) < 108)
  if (items.length === side.items.length) return side
  return { ...side, items }
}

export function pointsForCatch(combo: number) {
  return Math.round(120 * (1 + Math.min(combo, 15) * 0.05))
}

export function tryCatch(side: CatchSideState, lane: LaneId, now: number): CatchSideState {
  let target: CatchItem | null = null
  let bestDelta = Infinity

  for (const it of side.items) {
    if (it.caught || it.lane !== lane) continue
    const y = itemY(it, now)
    if (y < CATCH_Y_MIN || y > CATCH_Y_MAX) continue
    const mid = (CATCH_Y_MIN + CATCH_Y_MAX) / 2
    const delta = Math.abs(y - mid)
    if (delta < bestDelta) {
      target = it
      bestDelta = delta
    }
  }

  if (!target) {
    return { ...side, combo: 0, lastCatchLane: lane, lastCatchUntil: now + 280 }
  }

  const combo = side.combo + 1
  const add = pointsForCatch(side.combo)
  const items = side.items.map((it) => (it.id === target!.id ? { ...it, caught: true } : it))

  return {
    ...side,
    items,
    score: side.score + add,
    combo,
    lastCatchLane: lane,
    lastCatchUntil: now + 320,
  }
}

export function resolveLegWinner(p1: CatchSideState, p2: CatchSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}

export function legShouldEnd(state: CatchState, now: number): boolean {
  if (now >= state.legEndsAt) return true
  if (state.p1.score >= POINTS_TO_WIN || state.p2.score >= POINTS_TO_WIN) return true
  return false
}
