export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const LEG_DURATION_MS = 60_000
export const MAX_LIVES = 5
export const BOMB_SCORE_PENALTY = 340
export const BOMB_LIFE_DAMAGE = 1
export const FRENZY_COMBO = 8
export const FRENZY_MS = 5500
export const FRENZY_SCORE_MUL = 1.45
/** Skor tabanlı zorluk ölçeği (leg kazanma eşiği değil) */
export const DIFFICULTY_SCORE_CAP = 2800
export const ROUND_BREAK_MS = 2400
export const SPAWN_GAP_MIN_MS = 380
export const SPAWN_GAP_MAX_MS = 720
export const SLICE_HIT_RADIUS = 12
export const GRAVITY = 0.00004
export const SPAWN_Y = 94

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
  startX: number
  vx: number
  vy0: number
  spawnAt: number
  kind: SliceKind
  icon: SliceIcon
  sliced: boolean
  slicedAt?: number
  rotation: number
  rotSpeed: number
}

export type SliceScorePop = {
  id: number
  x: number
  y: number
  amount: number
  kind: 'fruit' | 'star' | 'frenzy'
  until: number
}

export type SliceJuiceBurst = {
  id: number
  x: number
  y: number
  icon: SliceIcon
  until: number
}

export type SliceSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  combo: number
  objects: SliceObject[]
  nextSpawnAt: number
  lastFx: 'slice' | 'star' | 'bomb' | 'miss' | 'ko' | null
  lastFxUntil: number
  lastSlash: SlicePoint[] | null
  lastSlashUntil: number
  knockedOut: boolean
  frenzyUntil: number
  scorePops: SliceScorePop[]
  juiceBursts: SliceJuiceBurst[]
  fxSeq: number
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
    lives: MAX_LIVES,
    combo: 0,
    objects: [],
    nextSpawnAt: 0,
    lastFx: null,
    lastFxUntil: 0,
    lastSlash: null,
    lastSlashUntil: 0,
    knockedOut: false,
    frenzyUntil: 0,
    scorePops: [],
    juiceBursts: [],
    fxSeq: 0,
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

export function objectPos(obj: SliceObject, now: number) {
  const dt = Math.max(0, now - obj.spawnAt)
  const x = obj.startX + obj.vx * dt
  const y = SPAWN_Y - obj.vy0 * dt + 0.5 * GRAVITY * dt * dt
  const rotation = obj.rotation + obj.rotSpeed * dt
  return { x, y, rotation }
}

/** @deprecated use objectPos */
export function objectY(obj: SliceObject, now: number): number {
  return objectPos(obj, now).y
}

function difficultyT(score: number) {
  return Math.min(1, score / DIFFICULTY_SCORE_CAP)
}

export function spawnGapMs(score: number, rand: () => number) {
  const t = difficultyT(score)
  const min = SPAWN_GAP_MIN_MS * (1 - t * 0.38)
  const max = SPAWN_GAP_MAX_MS * (1 - t * 0.32)
  return min + rand() * (max - min)
}

function bombChance(score: number, rand: () => number) {
  return Math.min(0.32, 0.16 + difficultyT(score) * 0.14 + rand() * 0.04)
}

export function spawnObject(
  side: SliceSideState,
  now: number,
  nextId: number,
  rand: () => number,
): { side: SliceSideState; nextId: number } {
  const isBomb = rand() < bombChance(side.score, rand)
  const icon = isBomb ? 'bomb' : FRUIT_ICONS[Math.floor(rand() * FRUIT_ICONS.length)]!
  const startX = 14 + rand() * 72
  const vx = (rand() - 0.5) * 0.034
  const vy0 = 0.042 + rand() * 0.024
  const item: SliceObject = {
    id: nextId,
    startX,
    vx,
    vy0,
    spawnAt: now,
    kind: isBomb ? 'bomb' : 'fruit',
    icon,
    sliced: false,
    rotation: rand() * 360,
    rotSpeed: (rand() - 0.5) * 0.18,
  }
  const frenzy = now < side.frenzyUntil
  const gapMul = frenzy ? 0.76 : 1
  return {
    side: {
      ...side,
      objects: [...side.objects, item],
      nextSpawnAt: now + spawnGapMs(side.score, rand) * gapMul,
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
  return len >= 7
}

export function applySwipe(side: SliceSideState, path: SlicePoint[], now: number): SliceSideState {
  if (!isValidSwipe(path) || side.knockedOut) return side

  let score = side.score
  let lives = side.lives
  let combo = side.combo
  let lastFx: SliceSideState['lastFx'] = null
  let knockedOut: boolean = side.knockedOut
  let frenzyUntil = side.frenzyUntil
  let fxSeq = side.fxSeq
  const scorePops = [...side.scorePops]
  const juiceBursts = [...side.juiceBursts]
  let hit = false
  const frenzyActive = now < frenzyUntil

  const objects = side.objects.map((obj) => {
    if (obj.sliced) return obj
    const { x, y } = objectPos(obj, now)
    if (y < -8 || y > 98) return obj
    if (minDistToPath(x, y, path) > SLICE_HIT_RADIUS) return obj

    hit = true
    if (obj.kind === 'bomb') {
      score = Math.max(0, score - BOMB_SCORE_PENALTY)
      lives = Math.max(0, lives - BOMB_LIFE_DAMAGE)
      combo = 0
      frenzyUntil = 0
      lastFx = lives <= 0 ? 'ko' : 'bomb'
      knockedOut = lives <= 0
      return { ...obj, sliced: true, slicedAt: now }
    }
    const starMul = obj.icon === 'star' ? 1.6 : 1
    const mul = frenzyActive ? FRENZY_SCORE_MUL : 1
    const add = Math.round(120 * starMul * (1 + Math.min(combo, 16) * 0.065) * mul)
    score += add
    combo += 1
    lastFx = obj.icon === 'star' ? 'star' : 'slice'

    fxSeq += 1
    scorePops.push({
      id: fxSeq,
      x,
      y,
      amount: add,
      kind: obj.icon === 'star' ? 'star' : frenzyActive ? 'frenzy' : 'fruit',
      until: now + 820,
    })
    fxSeq += 1
    juiceBursts.push({
      id: fxSeq,
      x,
      y,
      icon: obj.icon,
      until: now + 520,
    })

    return { ...obj, sliced: true, slicedAt: now }
  })

  if (!hit) return side

  if (combo >= FRENZY_COMBO && side.combo < FRENZY_COMBO) {
    frenzyUntil = now + FRENZY_MS
  }

  return {
    ...side,
    objects,
    score,
    lives,
    combo,
    knockedOut,
    frenzyUntil,
    scorePops,
    juiceBursts,
    fxSeq,
    lastFx,
    lastFxUntil: now + (lastFx === 'bomb' || lastFx === 'ko' ? 680 : 420),
    lastSlash: path,
    lastSlashUntil: now + 220,
  }
}

export function pruneObjects(side: SliceSideState, now: number): SliceSideState {
  let combo = side.combo
  let lastFx = side.lastFx
  let lastFxUntil = side.lastFxUntil
  let missed = false

  const objects = side.objects.filter((o) => {
    if (o.sliced) return o.slicedAt != null && now - o.slicedAt < 420
    const { y } = objectPos(o, now)
    if (y > 106) {
      if (o.kind === 'fruit') missed = true
      return false
    }
    return true
  })

  if (missed && combo > 0) {
    combo = 0
    lastFx = 'miss'
    lastFxUntil = now + 320
  }

  const lastSlash =
    side.lastSlash && now < side.lastSlashUntil ? side.lastSlash : null
  const lastSlashUntil = lastSlash ? side.lastSlashUntil : 0

  const scorePops = side.scorePops.filter((p) => now < p.until)
  const juiceBursts = side.juiceBursts.filter((b) => now < b.until)

  if (
    objects.length === side.objects.length &&
    combo === side.combo &&
    lastFx === side.lastFx &&
    lastSlash === side.lastSlash &&
    scorePops.length === side.scorePops.length &&
    juiceBursts.length === side.juiceBursts.length
  ) {
    return side
  }

  return {
    ...side,
    objects,
    combo,
    lastFx,
    lastFxUntil,
    lastSlash,
    lastSlashUntil,
    scorePops,
    juiceBursts,
  }
}

export function botSliceObject(side: SliceSideState, obj: SliceObject, now: number): SliceSideState {
  const { x, y } = objectPos(obj, now)
  const path: SlicePoint[] = [
    { x: x - 8, y: y + 10 },
    { x: x + 8, y: y - 10 },
  ]
  return applySwipe(side, path, now)
}

export function resolveLegWinner(p1: SliceSideState, p2: SliceSideState): 'p1' | 'p2' | 'draw' {
  if (p1.knockedOut && !p2.knockedOut) return 'p2'
  if (p2.knockedOut && !p1.knockedOut) return 'p1'
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}

export function legShouldEnd(state: SliceState, now: number): boolean {
  return now >= state.legEndsAt || state.p1.knockedOut || state.p2.knockedOut
}
