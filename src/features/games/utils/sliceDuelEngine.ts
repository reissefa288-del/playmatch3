export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 3200
export const LEG_DURATION_MS = 42_000
export const ROUND_BREAK_MS = 2400
export const FLIGHT_MS = 2400
export const SPAWN_GAP_MIN_MS = 420
export const SPAWN_GAP_MAX_MS = 780
export const SLICE_HIT_RADIUS = 11

export type SliceKind = 'fruit' | 'bomb'
export type SliceIcon = 'apple' | 'orange' | 'melon' | 'star' | 'bomb'

export const FRUIT_ICONS: SliceIcon[] = ['apple', 'orange', 'melon', 'star']
export const ICON_EMOJI: Record<SliceIcon, string> = {
  apple: '🍎',
  orange: '🍊',
  melon: '🍉',
  star: '⭐',
  bomb: '💣',
}

export type SlicePoint = { x: number; y: number }

export type SliceObject = {
  id: number
  x: number
  y: number
  spawnAt: number
  kind: SliceKind
  icon: SliceIcon
  sliced: boolean
}

export type SliceSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  combo: number
  objects: SliceObject[]
  nextSpawnAt: number
  lastFx: 'slice' | 'bomb' | null
  lastFxUntil: number
}

export type SliceState = {
  p1: SliceSideState
  p2: SliceSideState
  legStartAt: number
  legEndsAt: number
  nextObjectId: number
  roundNumber: number
}

export function createSide(sideId: 1 | 2): SliceSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    combo: 0,
    objects: [],
    nextSpawnAt: 0,
    lastFx: null,
    lastFxUntil: 0,
  }
}

export function createSliceState(now: number): SliceState {
  return {
    p1: createSide(1),
    p2: createSide(2),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    nextObjectId: 1,
    roundNumber: 1,
  }
}

export function objectY(obj: SliceObject, now: number): number {
  const p = Math.min(1.15, (now - obj.spawnAt) / FLIGHT_MS)
  return 90 - p * 102
}

export function spawnGapMs(rand: () => number) {
  return SPAWN_GAP_MIN_MS + rand() * (SPAWN_GAP_MAX_MS - SPAWN_GAP_MIN_MS)
}

export function spawnObject(
  side: SliceSideState,
  now: number,
  nextId: number,
  rand: () => number,
): { side: SliceSideState; nextId: number } {
  const isBomb = rand() < 0.28
  const icon = isBomb ? 'bomb' : FRUIT_ICONS[Math.floor(rand() * FRUIT_ICONS.length)]!
  const item: SliceObject = {
    id: nextId,
    x: 14 + rand() * 72,
    y: 90,
    spawnAt: now,
    kind: isBomb ? 'bomb' : 'fruit',
    icon,
    sliced: false,
  }
  return {
    side: {
      ...side,
      objects: [...side.objects, item],
      nextSpawnAt: now + spawnGapMs(rand),
    },
    nextId: nextId + 1,
  }
}

function distPointToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax
  const dy = by - ay
  const lenSq = dx * dx + dy * dy
  if (lenSq < 0.0001) return Math.hypot(px - ax, py - ay)
  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))
  const cx = ax + t * dx
  const cy = ay + t * dy
  return Math.hypot(px - cx, py - cy)
}

export function minDistToPath(x: number, y: number, path: SlicePoint[]): number {
  if (path.length < 2) {
    if (path.length === 1) return Math.hypot(x - path[0]!.x, y - path[0]!.y)
    return Infinity
  }
  let min = Infinity
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!
    const b = path[i]!
    min = Math.min(min, distPointToSegment(x, y, a.x, a.y, b.x, b.y))
  }
  return min
}

export function isValidSwipe(path: SlicePoint[]): boolean {
  if (path.length < 2) return false
  let len = 0
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!
    const b = path[i]!
    len += Math.hypot(b.x - a.x, b.y - a.y)
  }
  return len >= 8
}

export function applySwipe(side: SliceSideState, path: SlicePoint[], now: number): SliceSideState {
  if (!isValidSwipe(path)) return side

  let score = side.score
  let combo = side.combo
  let lastFx: 'slice' | 'bomb' | null = null
  let hit = false

  const objects = side.objects.map((obj) => {
    if (obj.sliced) return obj
    const y = objectY(obj, now)
    if (y < -5 || y > 98) return obj
    if (minDistToPath(obj.x, y, path) > SLICE_HIT_RADIUS) return obj

    hit = true
    if (obj.kind === 'bomb') {
      score = Math.max(0, score - 220)
      combo = 0
      lastFx = 'bomb'
      return { ...obj, sliced: true }
    }
    const add = Math.round(110 * (1 + Math.min(combo, 14) * 0.06))
    score += add
    combo += 1
    lastFx = 'slice'
    return { ...obj, sliced: true }
  })

  if (!hit) return side

  return {
    ...side,
    objects,
    score,
    combo,
    lastFx,
    lastFxUntil: now + 400,
  }
}

export function pruneObjects(side: SliceSideState, now: number): SliceSideState {
  const objects = side.objects.filter((o) => !o.sliced && objectY(o, now) < 108)
  if (objects.length === side.objects.length) return side
  return { ...side, objects }
}

export function botSliceObject(side: SliceSideState, obj: SliceObject, now: number): SliceSideState {
  const mid = { x: obj.x, y: objectY(obj, now) }
  const path: SlicePoint[] = [
    { x: mid.x - 6, y: mid.y + 8 },
    { x: mid.x + 6, y: mid.y - 8 },
  ]
  return applySwipe(side, path, now)
}

export function resolveLegWinner(p1: SliceSideState, p2: SliceSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}

export function legShouldEnd(state: SliceState, now: number): boolean {
  if (now >= state.legEndsAt) return true
  if (state.p1.score >= POINTS_TO_WIN || state.p2.score >= POINTS_TO_WIN) return true
  return false
}
