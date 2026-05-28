export const START_SCORE = 301
export const THROWS_PER_TURN = 3
export const MATCH_LEGS = 3
export const WIN_LEGS = 2
export const TURN_MS = 14000

export type DartRing = 'miss' | 'outer' | 'single' | 'triple' | 'double' | 'bull' | 'inner'

export type DartThrow = {
  x: number
  y: number
  score: number
  ring: DartRing
  mult: number
}

export type DartLaneState = {
  laneId: 1 | 2
  remaining: number
  legPoints: number
  lastThrows: DartThrow[]
  lastTotal: number
}

export function createLane(laneId: 1 | 2): DartLaneState {
  return {
    laneId,
    remaining: START_SCORE,
    legPoints: 0,
    lastThrows: [],
    lastTotal: 0,
  }
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n))
}

/** aimX 0..1 (sol-sağ), power 0..1 (zayıf-güçlü) → tahta koordinatı */
export function landingFromThrow(aimX: number, power: number, rand: () => number) {
  const sweetAim = 0.5
  const sweetPower = 0.74
  const aimErr = (aimX - sweetAim) * 1.2
  const powerErr = (power - sweetPower) * 1.35
  const jitter = (rand() - 0.5) * 0.07
  return {
    x: clamp01(0.5 + aimErr + jitter),
    y: clamp01(0.5 + powerErr + (rand() - 0.5) * 0.06),
  }
}

export function throwFromAimPower(aimX: number, power: number, rand: () => number): DartThrow {
  const { x, y } = landingFromThrow(aimX, power, rand)
  return scoreFromTap(x, y)
}

/** nx, ny — tahta kutusu içinde 0..1 */
export function scoreFromTap(nx: number, ny: number): DartThrow {
  const cx = 0.5
  const cy = 0.5
  const dx = (nx - cx) * 2
  const dy = (ny - cy) * 2
  const r = Math.sqrt(dx * dx + dy * dy)

  if (r > 1.02) {
    return { x: nx, y: ny, score: 0, ring: 'miss', mult: 0 }
  }
  if (r <= 0.06) {
    return { x: nx, y: ny, score: 50, ring: 'bull', mult: 1 }
  }
  if (r <= 0.11) {
    return { x: nx, y: ny, score: 25, ring: 'inner', mult: 1 }
  }

  const segment = Math.floor(((Math.atan2(dy, dx) + Math.PI) / (2 * Math.PI)) * 20) % 20
  const base = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5][segment] ?? 10

  let ring: DartRing = 'single'
  let mult = 1
  if (r >= 0.88 && r <= 1.02) {
    ring = 'double'
    mult = 2
  } else if (r >= 0.52 && r <= 0.6) {
    ring = 'triple'
    mult = 3
  } else if (r >= 0.72) {
    ring = 'outer'
    mult = 1
  }

  const score = Math.round(base * mult)
  return { x: nx, y: ny, score, ring, mult }
}

export function applyThrow(lane: DartLaneState, tap: DartThrow): DartLaneState {
  const nextRemaining = Math.max(0, lane.remaining - tap.score)
  const throws = [...lane.lastThrows, tap].slice(-THROWS_PER_TURN)
  const lastTotal = throws.reduce((s, t) => s + t.score, 0)
  return {
    ...lane,
    remaining: nextRemaining,
    lastThrows: throws,
    lastTotal,
  }
}

export function resetLaneThrows(lane: DartLaneState): DartLaneState {
  return { ...lane, lastThrows: [], lastTotal: 0 }
}

export function resetLaneLeg(lane: DartLaneState, keepLegPoints: boolean): DartLaneState {
  return {
    ...lane,
    remaining: START_SCORE,
    lastThrows: [],
    lastTotal: 0,
    legPoints: keepLegPoints ? lane.legPoints : 0,
  }
}

export function resolveLegWinner(l1: DartLaneState, l2: DartLaneState): 'p1' | 'p2' | 'draw' {
  const p1Done = l1.remaining === 0
  const p2Done = l2.remaining === 0
  if (p1Done && !p2Done) return 'p1'
  if (p2Done && !p1Done) return 'p2'
  if (p1Done && p2Done) return 'draw'
  if (l1.remaining < l2.remaining) return 'p1'
  if (l2.remaining < l1.remaining) return 'p2'
  return 'draw'
}
