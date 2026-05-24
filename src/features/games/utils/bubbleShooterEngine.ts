export const BUBBLE_RADIUS = 0.036
export const GRID_TOP = 0.1
export const DANGER_Y = 0.74
export const SHOOTER_Y = 0.9
export const SHOOTER_X = 0.5
export const WIN_POINTS = 3
export const ROUND_SECONDS = 75
export const OVERTIME_SECONDS = 20
export const ROUND_BREAK_MS = 2600
const PRESSURE_AFTER_MISSES = 4
export const COLLISION_DISTANCE = BUBBLE_RADIUS * 2.34
export const AIM_MIN = -2.75
export const AIM_MAX = -0.38
export const AIM_SPEED = 1.85
export const SHOT_SPEED = 1.05

export type BubbleColor = 'cyan' | 'pink' | 'yellow' | 'green' | 'purple'

export const BUBBLE_COLORS: BubbleColor[] = ['cyan', 'pink', 'yellow', 'green', 'purple']

export const COLOR_HEX: Record<BubbleColor, string> = {
  cyan: '#22c8ff',
  pink: '#ff3a78',
  yellow: '#ffd54a',
  green: '#42f090',
  purple: '#9d6cff',
}

/** Referans görseldeki neon halo tonları */
export const COLOR_GLOW: Record<BubbleColor, string> = {
  cyan: 'rgba(34, 200, 255, 0.5)',
  pink: 'rgba(255, 58, 120, 0.5)',
  yellow: 'rgba(255, 213, 74, 0.45)',
  green: 'rgba(66, 240, 144, 0.45)',
  purple: 'rgba(157, 108, 255, 0.48)',
}

export type LaneEvent = 'shoot' | 'pop' | 'drop' | 'swap' | 'burst' | 'overflow' | 'combo' | 'clear'

export type BubbleParticle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
}

export type Projectile = {
  x: number
  y: number
  vx: number
  vy: number
  color: BubbleColor
  active: boolean
}

export type LaneState = {
  grid: Map<string, BubbleColor>
  projectile: Projectile | null
  currentColor: BubbleColor
  nextColor: BubbleColor
  aimAngle: number
  /** Bu turdaki skor (her tur sıfırlanır) */
  score: number
  /** 3 round sonunda beraberlik olursa toplam skor belirler */
  totalScore: number
  /** Kazanılan tur sayısı — maçı 3 yapan kazanır */
  matchPoints: number
  /** Puan getirmeyen atışlar baskı satırı ekler */
  missStreak: number
  particles: BubbleParticle[]
  canShoot: boolean
  /** Balonlar tehlike çizgisini geçince tur kaybı */
  overflowed: boolean
}

export function createLane(seed = 0): LaneState {
  return {
    grid: createInitialGrid(seed),
    projectile: null,
    currentColor: pickColor(seed + 1),
    nextColor: pickColor(seed + 2),
    aimAngle: -Math.PI / 2,
    score: 0,
    totalScore: 0,
    matchPoints: 0,
    missStreak: 0,
    particles: [],
    canShoot: true,
    overflowed: false,
  }
}

/** Yeni tur: grid ve tur skoru sıfır, maç puanları korunur */
export function startNewRound(lane: LaneState, seed: number): LaneState {
  const fresh = createLane(seed)
  return {
    ...fresh,
    matchPoints: lane.matchPoints,
    totalScore: lane.totalScore,
    score: 0,
    missStreak: 0,
    overflowed: false,
  }
}

export function calcPopScore(popped: number): number {
  if (popped <= 0) return 0
  const base = popped * 25
  const combo = popped >= 8 ? 120 : popped >= 6 ? 70 : popped >= 4 ? 35 : 0
  return base + combo
}

export function updateLane(
  lane: LaneState,
  aimDir: -1 | 0 | 1,
  dt: number,
  fire = false,
  swap = false,
): { lane: LaneState; events: LaneEvent[] } {
  const events: LaneEvent[] = []
  const next: LaneState = {
    ...lane,
    grid: new Map(lane.grid),
    particles: lane.particles
      .map((p) => ({
        ...p,
        x: p.x + p.vx * dt,
        y: p.y + p.vy * dt,
        vy: p.vy + dt * 0.4,
        life: p.life - dt,
      }))
      .filter((p) => p.life > 0)
      .slice(-72),
    projectile: lane.projectile ? { ...lane.projectile } : null,
  }

  if (swap && !next.projectile && next.canShoot) {
    const temp = next.currentColor
    next.currentColor = next.nextColor
    next.nextColor = pickColorForLane(next.grid, Math.floor(next.score + temp.length))
    events.push('swap')
  }

  if (aimDir !== 0 && !next.projectile) {
    next.aimAngle = clamp(next.aimAngle + aimDir * dt * AIM_SPEED, AIM_MIN, AIM_MAX)
  }

  if (fire && !next.projectile && next.canShoot) {
    next.projectile = {
      x: SHOOTER_X,
      y: SHOOTER_Y,
      vx: Math.cos(next.aimAngle) * SHOT_SPEED,
      vy: Math.sin(next.aimAngle) * SHOT_SPEED,
      color: next.currentColor,
      active: true,
    }
    next.currentColor = next.nextColor
    next.nextColor = pickColorForLane(next.grid, Math.floor(next.score + next.grid.size))
    next.canShoot = false
    events.push('shoot')
  }

  if (next.projectile?.active) {
    const hit = stepProjectile(next, dt)
    if (hit) {
      if (hit.popped > 0) {
        events.push('pop')
        const gained = calcPopScore(hit.popped)
        next.score += gained
        next.totalScore += gained
        next.missStreak = 0
        if (hit.popped >= 4) events.push('burst')
        if (hit.popped >= 6) events.push('combo')
        if (next.grid.size === 0) events.push('clear')
      } else {
        next.missStreak += 1
        if (next.missStreak >= PRESSURE_AFTER_MISSES) {
          next.missStreak = 0
          addPressureRow(next, Math.floor(next.score + next.grid.size))
          events.push('drop')
        }
      }
      next.projectile = null
      next.canShoot = true

      const danger = getLowestY(next.grid)
      if (danger > DANGER_Y && !next.overflowed) {
        next.overflowed = true
        events.push('overflow')
      }
    }
  }

  return { lane: next, events }
}

function stepProjectile(
  lane: LaneState,
  dt: number,
): { row: number; col: number; color: BubbleColor; popped: number } | null {
  const maxStep = 0.0075
  const steps = Math.max(1, Math.ceil(dt / maxStep))
  const subDt = dt / steps
  for (let i = 0; i < steps; i += 1) {
    const hit = stepProjectileOnce(lane, subDt)
    if (hit) return hit
  }
  return null
}

function stepProjectileOnce(
  lane: LaneState,
  dt: number,
): { row: number; col: number; color: BubbleColor; popped: number } | null {
  const p = lane.projectile!
  p.x += p.vx * dt
  p.y += p.vy * dt

  if (p.x <= BUBBLE_RADIUS) {
    p.x = BUBBLE_RADIUS
    p.vx = Math.abs(p.vx)
  } else if (p.x >= 1 - BUBBLE_RADIUS) {
    p.x = 1 - BUBBLE_RADIUS
    p.vx = -Math.abs(p.vx)
  }

  if (p.y <= GRID_TOP + BUBBLE_RADIUS) {
    return attachAtCeiling(lane, p.x, p.color)
  }

  for (const [key] of lane.grid) {
    const [row, col] = key.split(',').map(Number)
    const pos = bubblePos(row, col)
    const dist = Math.hypot(p.x - pos.x, p.y - pos.y)
    if (dist < COLLISION_DISTANCE) {
      const attached = attachNear(lane, p.x, p.y, p.color, row, col)
      if (attached) return attached
      return forceAttachBubble(lane, p.x, p.y, p.color)
    }
  }

  if (p.y > 1.08) {
    lane.projectile = null
    lane.canShoot = true
  }

  return null
}

function forceAttachBubble(
  lane: LaneState,
  x: number,
  y: number,
  color: BubbleColor,
): { row: number; col: number; color: BubbleColor; popped: number } {
  const candidates = listAttachCandidates(lane.grid)
  if (candidates.length === 0) {
    const col = nearestColInRow(0, x)
    const key0 = cellKey(0, col)
    if (!lane.grid.has(key0)) {
      lane.grid.set(key0, color)
      spawnParticles(lane, bubblePos(0, col), color)
      const popped = resolveAttachment(lane, 0, col)
      return { row: 0, col, color, popped }
    }
    return { row: 0, col, color, popped: 0 }
  }

  let best = candidates[0]!
  let bestDist = Infinity
  for (const c of candidates) {
    const pos = bubblePos(c.row, c.col)
    const d = Math.hypot(x - pos.x, y - pos.y)
    if (d < bestDist) {
      bestDist = d
      best = c
    }
  }

  const key = cellKey(best.row, best.col)
  if (!lane.grid.has(key)) {
    lane.grid.set(key, color)
    spawnParticles(lane, bubblePos(best.row, best.col), color)
    const popped = resolveAttachment(lane, best.row, best.col)
    return { row: best.row, col: best.col, color, popped }
  }

  return attachAtCeiling(lane, x, color) ?? { row: 0, col: 0, color, popped: 0 }
}

function attachAtCeiling(lane: LaneState, x: number, color: BubbleColor) {
  const row = 0
  const col = nearestColInRow(row, x)
  const key = cellKey(row, col)
  if (!lane.grid.has(key)) {
    lane.grid.set(key, color)
    spawnParticles(lane, bubblePos(row, col), color)
    const popped = resolveAttachment(lane, row, col)
    return { row, col, color, popped }
  }
  const fallback = attachNear(lane, x, GRID_TOP + BUBBLE_RADIUS, color, row, col)
  if (fallback) return fallback
  return forceAttachBubble(lane, x, GRID_TOP + BUBBLE_RADIUS, color)
}

function attachNear(
  lane: LaneState,
  x: number,
  y: number,
  color: BubbleColor,
  hitRow: number,
  hitCol: number,
): { row: number; col: number; color: BubbleColor; popped: number } | null {
  const candidates = neighbors(hitRow, hitCol).filter(({ row, col }) => {
    const key = cellKey(row, col)
    return row >= 0 && !lane.grid.has(key)
  })

  if (candidates.length === 0) {
    const row = hitRow + 1
    const col = nearestColInRow(row, x)
    const key = cellKey(row, col)
    if (!lane.grid.has(key)) {
      lane.grid.set(key, color)
      spawnParticles(lane, bubblePos(row, col), color)
      const popped = resolveAttachment(lane, row, col)
      return { row, col, color, popped }
    }
    return forceAttachBubble(lane, x, y, color)
  }

  let best = candidates[0]
  let bestDist = Infinity
  for (const c of candidates) {
    const pos = bubblePos(c.row, c.col)
    const d = Math.hypot(x - pos.x, y - pos.y)
    if (d < bestDist) {
      bestDist = d
      best = c
    }
  }

  lane.grid.set(cellKey(best.row, best.col), color)
  spawnParticles(lane, bubblePos(best.row, best.col), color)
  const popped = resolveAttachment(lane, best.row, best.col)
  return { row: best.row, col: best.col, color, popped }
}

function resolveAttachment(lane: LaneState, row: number, col: number): number {
  const cluster = floodColor(lane.grid, row, col)
  let removed = 0

  if (cluster.size >= 3) {
    for (const key of cluster) {
      const [r, c] = key.split(',').map(Number)
      spawnParticles(lane, bubblePos(r, c), lane.grid.get(key)!)
      lane.grid.delete(key)
      removed += 1
    }
  }

  const floating = findFloating(lane.grid)
  for (const key of floating) {
    const [r, c] = key.split(',').map(Number)
    spawnParticles(lane, bubblePos(r, c), lane.grid.get(key)!)
    lane.grid.delete(key)
    removed += 1
  }

  return removed
}

function floodColor(grid: Map<string, BubbleColor>, startRow: number, startCol: number) {
  const startKey = cellKey(startRow, startCol)
  const color = grid.get(startKey)
  if (!color) return new Set<string>()

  const cluster = new Set<string>()
  const queue = [{ row: startRow, col: startCol }]

  while (queue.length > 0) {
    const { row, col } = queue.pop()!
    const key = cellKey(row, col)
    if (cluster.has(key) || grid.get(key) !== color) continue
    cluster.add(key)
    for (const n of neighbors(row, col)) {
      const nKey = cellKey(n.row, n.col)
      if (grid.has(nKey) && !cluster.has(nKey)) queue.push(n)
    }
  }

  return cluster
}

function findFloating(grid: Map<string, BubbleColor>) {
  const anchored = new Set<string>()
  const queue: { row: number; col: number }[] = []

  for (const key of grid.keys()) {
    const [row] = key.split(',').map(Number)
    if (row === 0) {
      queue.push({ row: 0, col: Number(key.split(',')[1]) })
    }
  }

  while (queue.length > 0) {
    const { row, col } = queue.pop()!
    const key = cellKey(row, col)
    if (anchored.has(key) || !grid.has(key)) continue
    anchored.add(key)
    for (const n of neighbors(row, col)) {
      const nKey = cellKey(n.row, n.col)
      if (grid.has(nKey) && !anchored.has(nKey)) queue.push(n)
    }
  }

  const floating = new Set<string>()
  for (const key of grid.keys()) {
    if (!anchored.has(key)) floating.add(key)
  }
  return floating
}

function getLowestY(grid: Map<string, BubbleColor>) {
  let max = 0
  for (const key of grid.keys()) {
    const [row, col] = key.split(',').map(Number)
    max = Math.max(max, bubblePos(row, col).y)
  }
  return max
}

function addPressureRow(lane: LaneState, seed: number) {
  const shifted = new Map<string, BubbleColor>()
  const cells = [...lane.grid.entries()]
    .map(([key, color]) => {
      const [row, col] = key.split(',').map(Number)
      return { row, col, color }
    })
    .sort((a, b) => b.row - a.row)

  for (const { row, col, color } of cells) {
    const targetRow = row + 1
    const targetCol = nearestFreeColInRow(shifted, targetRow, bubblePos(row, col).x)
    if (targetCol != null) shifted.set(cellKey(targetRow, targetCol), color)
  }

  const rng = mulberry32((seed + 17) * 1409)
  for (let col = 0; col < colsForRow(0); col += 1) {
    if (rng() > 0.86) continue
    shifted.set(cellKey(0, col), BUBBLE_COLORS[Math.floor(rng() * BUBBLE_COLORS.length)])
  }

  lane.grid = shifted
}

export function bubblePos(row: number, col: number) {
  const cols = colsForRow(row)
  const stepX = cols > 1 ? (1 - BUBBLE_RADIUS * 2) / (cols - 1) : 0
  const stagger = row % 2 === 1 ? stepX * 0.5 : 0
  return {
    x: BUBBLE_RADIUS + stagger + col * stepX,
    y: GRID_TOP + row * BUBBLE_RADIUS * 1.72,
  }
}

export function colsForRow(row: number) {
  return row % 2 === 0 ? 8 : 7
}

export function neighbors(row: number, col: number) {
  const even = row % 2 === 0
  const deltas = even
    ? [
        [-1, -1], [-1, 0],
        [0, -1], [0, 1],
        [1, -1], [1, 0],
      ]
    : [
        [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, 0], [1, 1],
      ]
  return deltas
    .map(([dr, dc]) => ({ row: row + dr, col: col + dc }))
    .filter(({ row: r, col: c }) => r >= 0 && c >= 0 && c < colsForRow(r))
}

function nearestColInRow(row: number, x: number) {
  const cols = colsForRow(row)
  let best = 0
  let bestDist = Infinity
  for (let col = 0; col < cols; col += 1) {
    const d = Math.abs(bubblePos(row, col).x - x)
    if (d < bestDist) {
      bestDist = d
      best = col
    }
  }
  return best
}

function nearestFreeColInRow(grid: Map<string, BubbleColor>, row: number, x: number) {
  const cols = colsForRow(row)
  const preferred = nearestColInRow(row, x)
  for (let offset = 0; offset < cols; offset += 1) {
    const left = preferred - offset
    if (left >= 0 && !grid.has(cellKey(row, left))) return left
    const right = preferred + offset
    if (right < cols && !grid.has(cellKey(row, right))) return right
  }
  return null
}

function createInitialGrid(seed: number) {
  const grid = new Map<string, BubbleColor>()
  const rng = mulberry32(seed * 991)
  for (let row = 0; row < 6; row += 1) {
    for (let col = 0; col < colsForRow(row); col += 1) {
      if (row >= 4 && rng() > 0.55) continue
      grid.set(cellKey(row, col), BUBBLE_COLORS[Math.floor(rng() * BUBBLE_COLORS.length)])
    }
  }
  return grid
}

function spawnParticles(lane: LaneState, pos: { x: number; y: number }, color: BubbleColor, count = 8) {
  const hex = COLOR_HEX[color]
  lane.particles.push(
    ...Array.from({ length: count }, () => ({
      x: pos.x,
      y: pos.y,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55 - 0.12,
      life: 0.35 + Math.random() * 0.3,
      color: hex,
    })),
  )
}

function pickColor(seed: number): BubbleColor {
  return BUBBLE_COLORS[Math.abs(seed) % BUBBLE_COLORS.length]
}

function pickColorForLane(grid: Map<string, BubbleColor>, seed: number): BubbleColor {
  if (grid.size === 0) return pickColor(seed)
  const onField = [...grid.values()]
  return onField[Math.abs(seed) % onField.length] ?? pickColor(seed)
}

function cellKey(row: number, col: number) {
  return `${row},${col}`
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function mulberry32(seed: number) {
  let t = seed
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function listAttachCandidates(grid: Map<string, BubbleColor>) {
  const candidates = new Set<string>()
  for (let col = 0; col < colsForRow(0); col += 1) {
    const key = cellKey(0, col)
    if (!grid.has(key)) candidates.add(key)
  }
  for (const key of grid.keys()) {
    const [row, col] = key.split(',').map(Number)
    for (const n of neighbors(row, col)) {
      const nKey = cellKey(n.row, n.col)
      if (!grid.has(nKey)) candidates.add(nKey)
    }
  }
  return [...candidates].map((key) => {
    const [row, col] = key.split(',').map(Number)
    return { row, col }
  })
}

export function scorePlacement(
  grid: Map<string, BubbleColor>,
  row: number,
  col: number,
  color: BubbleColor,
): number {
  const key = cellKey(row, col)
  if (grid.has(key)) return -1
  const clone = new Map(grid)
  clone.set(key, color)
  return countRemovedAt(clone, row, col)
}

export function aimAtCell(row: number, col: number): number {
  const pos = bubblePos(row, col)
  return clamp(Math.atan2(pos.y - SHOOTER_Y, pos.x - SHOOTER_X), AIM_MIN, AIM_MAX)
}

function countRemovedAt(grid: Map<string, BubbleColor>, row: number, col: number): number {
  const cluster = floodColor(grid, row, col)
  let removed = 0
  if (cluster.size >= 3) {
    for (const key of cluster) {
      grid.delete(key)
      removed += 1
    }
  }
  const floating = findFloating(grid)
  removed += floating.size
  return removed
}

export function getMatchWinner(lane1: LaneState, lane2: LaneState): 'p1' | 'p2' | 'draw' {
  if (lane1.matchPoints > lane2.matchPoints) return 'p1'
  if (lane2.matchPoints > lane1.matchPoints) return 'p2'
  return 'draw'
}

export function resolveRoundByScore(lane1: LaneState, lane2: LaneState): 'p1' | 'p2' | 'draw' {
  if (lane1.score > lane2.score) return 'p1'
  if (lane2.score > lane1.score) return 'p2'
  return 'draw'
}
