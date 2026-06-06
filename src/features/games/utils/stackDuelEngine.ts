export const TARGET_SCORE = 25_000
export const LIVES = 3
export const MATCH_ROUNDS = 5
export const WIN_ROUNDS = 3
export const ROUND_SECONDS = 88
export const ROUND_BREAK_MS = 2800
export const PERFECT_RATIO = 0.92
export const GOOD_RATIO = 0.72
export const MIN_OVERLAP = 0.03
export const MIN_PLAY_WIDTH = 0.09
export const DANGER_WIDTH = 0.12
export const MEGA_COMBO_AT = 4
export const MEGA_COMBO_MULT = 2
export const PLATFORM_WIDTH = 0.92
export const MAX_VISIBLE_BLOCKS = 18
export const MOVE_SPEED = 0.84
export const SPEED_TIER_EVERY = 5
export const MOVE_SPEED_BONUS = 0.09
export const MOVE_SPEED_MAX = 1.38
export const LIFE_RECOVERY_PERFECTS = 3
export const TICK_MS = 16
export const FALL_DURATION_MS = 920
export const SLIDE_TOP_PX = 14
export const STAGE_BASE_BOTTOM_PX = 28

export type StackBlock = {
  x: number
  width: number
  color: string
}

export type ActiveBlock = {
  x: number
  width: number
  color: string
  dir: 1 | -1
}

export type StackLaneEvent = 'place' | 'perfect' | 'good' | 'miss' | 'over'

export type FallingBlock = {
  x: number
  width: number
  color: string
}

export type StackLaneState = {
  laneId: number
  platform: StackBlock
  blocks: StackBlock[]
  active: ActiveBlock
  nextColor: string
  falling: FallingBlock | null
  score: number
  combo: number
  perfectStreak: number
  lives: number
  height: number
  perfectPop: string | null
  shake: number
  finished: boolean
  lastEvent: StackLaneEvent | null
}

export type DropResult = {
  lane: StackLaneState
  event: StackLaneEvent
  points: number
  overlapRatio: number
  lifeRecovered?: boolean
}

const P1_COLORS = ['#3d7bff', '#5a9bff', '#6b5cff', '#00e8ff', '#4d8aff', '#8b7cff', '#2ec4ff']
const P2_COLORS = ['#ff2d9a', '#ff6b3d', '#ff4088', '#ff8a5c', '#ff3d6a', '#ffb347', '#e91e8c']

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function paletteFor(laneId: number) {
  return laneId === 1 ? P1_COLORS : P2_COLORS
}

export function pickLaneColor(laneId: number, index: number, seed = 0): string {
  const colors = paletteFor(laneId)
  const rand = mulberry32(seed + index * 13 + laneId)
  const jitter = Math.floor(rand() * colors.length)
  return colors[(index + jitter) % colors.length]!
}

/** Üstteki hedef: son konan blok veya platform */
export function stackTop(lane: StackLaneState): StackBlock {
  if (lane.blocks.length > 0) return lane.blocks[lane.blocks.length - 1]!
  return lane.platform
}

export function comboScoreMultiplier(combo: number): number {
  return combo >= MEGA_COMBO_AT ? MEGA_COMBO_MULT : 1
}

export function lanePlayWidth(lane: StackLaneState): number {
  if (lane.finished || lane.lives <= 0) return stackTop(lane).width
  return lane.falling?.width ?? lane.active.width
}

export function isLaneInDanger(lane: StackLaneState): boolean {
  if (lane.finished || lane.lives <= 0) return false
  return lanePlayWidth(lane) <= DANGER_WIDTH + 0.008
}

export function laneSpeedTier(lane: StackLaneState): number {
  return Math.floor(lane.blocks.length / SPEED_TIER_EVERY)
}

export function laneMoveSpeed(lane: StackLaneState): number {
  const tier = laneSpeedTier(lane)
  return Math.min(MOVE_SPEED_MAX, MOVE_SPEED + tier * MOVE_SPEED_BONUS)
}

function createActive(width: number, color: string, seed: number, prevDir?: 1 | -1): ActiveBlock {
  const rand = mulberry32(seed)
  const half = width / 2
  const dir: 1 | -1 = prevDir ?? (rand() > 0.5 ? 1 : -1)
  const travel = Math.max(0, 1 - width - 0.04)
  const x = half + rand() * travel
  return {
    x: Math.min(1 - half, Math.max(half, x)),
    width,
    color,
    dir,
  }
}

export function createLane(laneId: number, seed: number): StackLaneState {
  const platformColor = pickLaneColor(laneId, 0, seed)
  const platform: StackBlock = { x: 0.5, width: PLATFORM_WIDTH, color: platformColor }
  const activeColor = pickLaneColor(laneId, 1, seed + 1)
  const nextColor = pickLaneColor(laneId, 2, seed + 2)
  return {
    laneId,
    platform,
    blocks: [],
    active: createActive(platform.width, activeColor, seed + 3),
    nextColor,
    falling: null,
    score: 0,
    combo: 0,
    perfectStreak: 0,
    lives: LIVES,
    height: 0,
    perfectPop: null,
    shake: 0,
    finished: false,
    lastEvent: null,
  }
}

export function beginFall(lane: StackLaneState): StackLaneState | null {
  if (lane.finished || lane.lives <= 0 || lane.falling) return null
  return {
    ...lane,
    falling: {
      x: lane.active.x,
      width: lane.active.width,
      color: lane.active.color,
    },
  }
}

export function commitFall(lane: StackLaneState, seed: number): DropResult {
  const merged: StackLaneState = lane.falling
    ? {
        ...lane,
        active: {
          ...lane.active,
          x: lane.falling.x,
          width: lane.falling.width,
          color: lane.falling.color,
          dir: lane.active.dir,
        },
        falling: null,
      }
    : lane
  return dropBlock(merged, seed)
}

export function tickActive(lane: StackLaneState, dt: number): StackLaneState {
  if (lane.finished || lane.lives <= 0 || lane.falling) return lane
  const half = lane.active.width / 2
  const speed = laneMoveSpeed(lane)
  let x = lane.active.x + lane.active.dir * speed * dt
  let dir = lane.active.dir
  if (x - half <= 0) {
    x = half
    dir = 1
  } else if (x + half >= 1) {
    x = 1 - half
    dir = -1
  }
  return { ...lane, active: { ...lane.active, x, dir } }
}

export function nudgeActive(lane: StackLaneState, delta: number): StackLaneState {
  if (lane.finished || lane.lives <= 0 || lane.falling) return lane
  const half = lane.active.width / 2
  const x = Math.min(1 - half, Math.max(half, lane.active.x + delta))
  return { ...lane, active: { ...lane.active, x } }
}

export function previewLanding(lane: StackLaneState): { x: number; width: number; valid: boolean } {
  const target = stackTop(lane)
  const probe: ActiveBlock = lane.falling
    ? { x: lane.falling.x, width: lane.falling.width, color: lane.falling.color, dir: 1 }
    : lane.active
  const { width, center } = overlap(target, probe)
  return {
    x: center,
    width: Math.max(0, width),
    valid: width >= MIN_OVERLAP,
  }
}

function overlap(target: StackBlock, active: ActiveBlock) {
  const aL = active.x - active.width / 2
  const aR = active.x + active.width / 2
  const tL = target.x - target.width / 2
  const tR = target.x + target.width / 2
  const left = Math.max(aL, tL)
  const right = Math.min(aR, tR)
  const width = right - left
  return { width, center: (left + right) / 2, ratio: width / target.width }
}

export function dropBlock(lane: StackLaneState, seed: number): DropResult {
  if (lane.finished || lane.lives <= 0) {
    return { lane, event: 'over', points: 0, overlapRatio: 0 }
  }

  const rand = mulberry32(seed + lane.blocks.length * 31)
  const target = stackTop(lane)
  const { width: overlapW, center, ratio } = overlap(target, lane.active)

  if (overlapW < MIN_OVERLAP) {
    const lives = lane.lives - 1
    const finished = lives <= 0
    const top = stackTop(lane)
    const next: StackLaneState = {
      ...lane,
      lives,
      combo: 0,
      perfectStreak: 0,
      shake: 8,
      finished,
      lastEvent: 'miss',
      perfectPop: 'KAÇIRDIN!',
      active: createActive(top.width, lane.nextColor, seed + 99, lane.active.dir),
    }
    return { lane: next, event: finished ? 'over' : 'miss', points: 0, overlapRatio: 0 }
  }

  const isPerfect = ratio >= PERFECT_RATIO
  const isGood = ratio >= GOOD_RATIO
  const combo = isPerfect ? lane.combo + 1 : isGood ? Math.max(1, lane.combo) : 0
  let perfectStreak = isPerfect ? lane.perfectStreak + 1 : 0
  let lives = lane.lives
  let lifeRecovered = false
  if (isPerfect && perfectStreak >= LIFE_RECOVERY_PERFECTS && lives < LIVES) {
    lives += 1
    perfectStreak = 0
    lifeRecovered = true
  }
  const basePts = Math.round(overlapW * 220)
  const bonus = isPerfect ? 260 + combo * 28 : isGood ? 140 + combo * 12 : Math.round((1 - ratio) * 40)
  const mult = comboScoreMultiplier(combo)
  const points = Math.round((basePts + bonus) * mult)

  const placed: StackBlock = {
    x: center,
    width: overlapW,
    color: lane.active.color,
  }
  const blocks = [...lane.blocks, placed].slice(-MAX_VISIBLE_BLOCKS)
  const nextColor = pickLaneColor(lane.laneId, blocks.length + 1, seed + Math.floor(rand() * 100))
  const score = lane.score + points

  let perfectPop: string | null = null
  if (isPerfect) {
    perfectPop = mult > 1 ? `MEGA x${mult}! +${points}` : `PERFECT! +${points}`
  } else if (isGood) {
    perfectPop = mult > 1 ? `MEGA x${mult}! +${points}` : `İYİ! +${points}`
  } else {
    perfectPop = `KÜÇÜLDÜ! ${Math.round(overlapW * 100)}%`
  }
  if (lifeRecovered) perfectPop = `+1 CAN! ${perfectPop}`

  const tooThin = overlapW < MIN_PLAY_WIDTH
  const next: StackLaneState = {
    ...lane,
    blocks,
    active: createActive(overlapW, nextColor, seed + 7, lane.active.dir),
    nextColor: pickLaneColor(lane.laneId, blocks.length + 2, seed + 11),
    score,
    combo: isPerfect ? combo : isGood ? combo : 0,
    perfectStreak,
    lives,
    height: blocks.length,
    perfectPop,
    shake: isPerfect ? 0 : 4,
    finished: tooThin,
    lastEvent: isPerfect ? 'perfect' : isGood ? 'good' : 'place',
  }

  return {
    lane: next,
    event: tooThin ? 'over' : isPerfect ? 'perfect' : isGood ? 'good' : 'place',
    points,
    overlapRatio: ratio,
    lifeRecovered,
  }
}

export function decayLaneFx(lane: StackLaneState): StackLaneState {
  return {
    ...lane,
    shake: Math.max(0, lane.shake - 1),
  }
}

/** Oyuncu artık blok koyamaz (can bitti veya kule çok ince). */
export function laneOutOfMoves(lane: StackLaneState): boolean {
  return lane.lives <= 0 || lane.finished
}

export function isLaneEliminated(lane: StackLaneState): boolean {
  return laneOutOfMoves(lane)
}

/** Can bitti veya kule inceldiğinde tur hemen biter; kazanan skora göre belirlenir. */
export function shouldEndRoundEarly(l1: StackLaneState, l2: StackLaneState): boolean {
  return laneOutOfMoves(l1) || laneOutOfMoves(l2)
}

export function resolveRoundWinner(l1: StackLaneState, l2: StackLaneState): 'p1' | 'p2' | 'draw' {
  if (l1.score > l2.score) return 'p1'
  if (l2.score > l1.score) return 'p2'
  return 'draw'
}

export function startNewRound(lane: StackLaneState, seed: number): StackLaneState {
  return createLane(lane.laneId, seed)
}

export function blockHeightForCount(stackCount: number): number {
  const total = stackCount + 1
  return Math.max(10, Math.min(16, Math.floor(132 / Math.max(total, 4))))
}

/** İstif üstü iniş satırı (stage altından px; platform + konan bloklar) */
export function landingBottomPx(stackCount: number, blockH: number, gap = 3): number {
  return STAGE_BASE_BOTTOM_PX + (stackCount + 1) * (blockH + gap)
}

export function calcDropDistancePx(stageHeight: number, stackCount: number, blockH: number, gap = 3): number {
  const landBottom = landingBottomPx(stackCount, blockH, gap)
  return Math.max(56, stageHeight - SLIDE_TOP_PX - blockH - landBottom)
}
