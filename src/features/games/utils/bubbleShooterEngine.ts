export const BUBBLE_RADIUS = 0.036
/** Yatay kenar boşluğu — çizim halo’su için merkezler içeride kalır */
export const GRID_H_MARGIN = 0.052
export const GRID_COLS_EVEN = 8
export const BUBBLE_DRAW_MULT = 2
export const GRID_TOP = 0.1
export const SHOOTER_Y = 0.9
export const SHOOTER_X = 0.5
export const WIN_POINTS = 3
export const ROUND_SECONDS = 75
export const OVERTIME_SECONDS = 20
export const ROUND_BREAK_MS = 2600
/** Izgara boşluklarını kapatır — tünellemeden kaçınmak için biraz geniş */
export const COLLISION_DISTANCE = BUBBLE_RADIUS * 2.38
/** Balonlar bu çizgiyi geçerse oyuncu kaybeder (normalize Y) */
export const DANGER_LINE_Y = SHOOTER_Y - 0.128
export const ROW_VERTICAL_STEP = BUBBLE_RADIUS * 1.72

/** Canvas genişlik/yükseklik — çarpışma mesafesi dikeyde düzeltilir */
let playfieldAspect = 1

export function setPlayfieldAspect(width: number, height: number) {
  if (height <= 0) return
  playfieldAspect = Math.max(0.38, Math.min(1.15, width / height))
}

export function bubbleDrawRadiusPx(canvasWidth: number) {
  return BUBBLE_RADIUS * canvasWidth * BUBBLE_DRAW_MULT
}
export const AIM_MIN = -2.88
export const AIM_MAX = -0.32
export const AIM_SPEED = 2.35
export const AIM_HOLD_SPEED = 2.45
export const SHOT_SPEED = 1.32
/** Nişan önizlemesi ve gerçek atış — aynı adım */
export const SHOT_PHYSICS_STEP = 0.007
export const AIM_ACCEL = 14
export const AIM_DAMP = 10
export const AIM_SNAP_MAX_DIFF = 0.26
export const AIM_SNAP_STRENGTH = 14

/** Dokunmatik nişan — çarpışma mesafesiyle aynı dikey düzeltme */
export function aimFromNormalizedPointer(nx: number, ny: number): number {
  const dx = nx - SHOOTER_X
  const dy = (ny - SHOOTER_Y) * playfieldAspect
  return clamp(Math.atan2(dy, dx), AIM_MIN, AIM_MAX)
}

export type BubbleColor = 'cyan' | 'pink' | 'yellow' | 'green' | 'purple'

export type BubbleKind = 'normal' | 'fire' | 'bomb' | 'rainbow'

export type BubbleSlot = {
  color: BubbleColor
  kind: BubbleKind
}

export const BUBBLE_COLORS: BubbleColor[] = ['cyan', 'pink', 'yellow', 'green', 'purple']

export const SPECIAL_KIND_META: Record<
  Exclude<BubbleKind, 'normal'>,
  { label: string; hex: string; glow: string }
> = {
  fire: { label: 'ATEŞ', hex: '#ff6b35', glow: 'rgba(255, 107, 53, 0.55)' },
  bomb: { label: 'BOMBA', hex: '#ff3a78', glow: 'rgba(255, 58, 120, 0.5)' },
  rainbow: { label: 'GÖK', hex: '#e8f0ff', glow: 'rgba(200, 220, 255, 0.55)' },
}

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

export type LaneEvent =
  | 'shoot'
  | 'pop'
  | 'drop'
  | 'swap'
  | 'burst'
  | 'overflow'
  | 'combo'
  | 'clear'
  | 'refill'
  | 'special'

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
  kind: BubbleKind
  active: boolean
}

export type LaneState = {
  grid: Map<string, BubbleColor>
  projectile: Projectile | null
  currentColor: BubbleColor
  nextColor: BubbleColor
  currentKind: BubbleKind
  nextKind: BubbleKind
  aimAngle: number
  aimVel: number
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
  const grid = createInitialGrid(seed)
  const next = rollShooterBubble(grid, seed + 2)
  const current = rollShooterBubble(grid, seed + 1)
  return {
    grid,
    projectile: null,
    currentColor: current.color,
    nextColor: next.color,
    currentKind: current.kind,
    nextKind: next.kind,
    aimAngle: -Math.PI / 2,
    aimVel: 0,
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
  if (lane.overflowed) return { lane, events }

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
    const tempColor = next.currentColor
    const tempKind = next.currentKind
    next.currentColor = next.nextColor
    next.currentKind = next.nextKind
    next.nextColor = tempColor
    next.nextKind = tempKind
    events.push('swap')
  }

  if (!next.projectile) {
    if (aimDir !== 0) {
      next.aimVel = 0
      next.aimAngle = clamp(next.aimAngle + aimDir * AIM_HOLD_SPEED * dt, AIM_MIN, AIM_MAX)
    } else if (!fire) {
      const damp = Math.exp(-AIM_DAMP * dt)
      next.aimVel *= damp
      next.aimAngle = clamp(next.aimAngle + next.aimVel * dt * AIM_SPEED, AIM_MIN, AIM_MAX)

      const target = predictAttachCell(next.grid, next.aimAngle)
      if (target) {
        const desired = aimAtCell(target.row, target.col)
        const diff = wrapAngle(desired - next.aimAngle)
        if (Math.abs(diff) <= AIM_SNAP_MAX_DIFF) {
          const snap = 1 - Math.exp(-AIM_SNAP_STRENGTH * dt)
          next.aimAngle = clamp(next.aimAngle + diff * snap, AIM_MIN, AIM_MAX)
        }
      }
    }
  }

  if (fire && !next.projectile && next.canShoot) {
    const shotKind = next.currentKind
    next.aimVel = 0
    next.projectile = {
      x: SHOOTER_X,
      y: SHOOTER_Y,
      vx: Math.cos(next.aimAngle) * SHOT_SPEED,
      vy: Math.sin(next.aimAngle) * SHOT_SPEED,
      color: next.currentColor,
      kind: shotKind,
      active: true,
    }
    next.currentColor = next.nextColor
    next.currentKind = next.nextKind
    const rolled = rollShooterBubble(next.grid, Math.floor(next.score + next.grid.size + 7))
    next.nextColor = rolled.color
    next.nextKind = rolled.kind
    next.canShoot = false
    events.push('shoot')
    if (shotKind !== 'normal') events.push('special')
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
      }
      next.projectile = null
      next.canShoot = true
      refillGridIfEmpty(next, Math.floor(next.score + next.totalScore + 11), events)
    }
  }

  if (!next.overflowed && checkDangerLine(next)) {
    next.overflowed = true
    events.push('overflow')
  }

  return { lane: next, events }
}

export function checkDangerLine(lane: LaneState): boolean {
  for (const key of lane.grid.keys()) {
    const [row, col] = key.split(',').map(Number)
    const pos = bubblePos(row, col)
    if (pos.y + BUBBLE_RADIUS >= DANGER_LINE_Y) return true
  }
  return false
}

function stepProjectile(
  lane: LaneState,
  dt: number,
): { row: number; col: number; color: BubbleColor; kind: BubbleKind; popped: number } | null {
  let remaining = dt
  while (remaining > 1e-6) {
    const step = Math.min(remaining, SHOT_PHYSICS_STEP)
    const hit = stepProjectileOnce(lane, step)
    if (hit) return hit
    remaining -= step
  }
  return null
}

type GridHit = { x: number; y: number; row: number; col: number }

function hitBubbleAt(grid: Map<string, BubbleColor>, x: number, y: number): GridHit | null {
  for (const [key] of grid) {
    const [row, col] = key.split(',').map(Number)
    const pos = bubblePos(row, col)
    if (bubbleDistance(x, y, pos.x, pos.y) < COLLISION_DISTANCE) {
      return { x, y, row, col }
    }
  }
  return null
}

function findGridHitOnSegment(
  grid: Map<string, BubbleColor>,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): GridHit | null {
  const segLen = bubbleDistance(x0, y0, x1, y1)
  if (segLen <= 0) return hitBubbleAt(grid, x0, y0)

  const coarse = Math.max(4, Math.ceil(segLen / (BUBBLE_RADIUS * 0.22)))
  let hitT = -1
  let hitBubble: { row: number; col: number } | null = null

  for (let i = 0; i <= coarse; i += 1) {
    const t = i / coarse
    const x = x0 + (x1 - x0) * t
    const y = y0 + (y1 - y0) * t
    const hit = hitBubbleAt(grid, x, y)
    if (hit && (hitT < 0 || t < hitT)) {
      hitT = t
      hitBubble = { row: hit.row, col: hit.col }
    }
  }

  if (hitT < 0 || !hitBubble) return null

  let lo = Math.max(0, hitT - 1 / coarse)
  let hi = hitT
  for (let r = 0; r < 10; r += 1) {
    const mid = (lo + hi) * 0.5
    const x = x0 + (x1 - x0) * mid
    const y = y0 + (y1 - y0) * mid
    if (hitBubbleAt(grid, x, y)) hi = mid
    else lo = mid
  }

  const x = x0 + (x1 - x0) * hi
  const y = y0 + (y1 - y0) * hi
  return { x, y, row: hitBubble.row, col: hitBubble.col }
}

function findFirstGridHitOnPath(
  grid: Map<string, BubbleColor>,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  bounce: { x: number; y: number } | null,
): GridHit | null {
  if (bounce) {
    const first = findGridHitOnSegment(grid, x0, y0, bounce.x, bounce.y)
    if (first) return first
    return findGridHitOnSegment(grid, bounce.x, bounce.y, x1, y1)
  }
  return findGridHitOnSegment(grid, x0, y0, x1, y1)
}

function stepProjectileOnce(
  lane: LaneState,
  dt: number,
): { row: number; col: number; color: BubbleColor; kind: BubbleKind; popped: number } | null {
  const p = lane.projectile!
  const startX = p.x
  const startY = p.y
  const moved = advanceShotStep(p.x, p.y, p.vx, p.vy, dt)
  p.x = moved.x
  p.y = moved.y
  p.vx = moved.vx
  p.vy = moved.vy

  if (p.y <= GRID_TOP + BUBBLE_RADIUS) {
    return attachAtCeiling(lane, p.x, p.color, p.kind)
  }

  const gridHit = findFirstGridHitOnPath(lane.grid, startX, startY, p.x, p.y, moved.bounce)
  if (gridHit) {
    p.x = gridHit.x
    p.y = gridHit.y
    const attached = attachNear(lane, p.x, p.y, p.color, p.kind, gridHit.row, gridHit.col)
    if (attached) return attached
    return forceAttachBubble(lane, p.x, p.y, p.color, p.kind)
  }

  if (p.y > 1.08) {
    lane.projectile = null
    lane.canShoot = true
  }

  return null
}

type AttachResult = {
  row: number
  col: number
  color: BubbleColor
  kind: BubbleKind
  popped: number
}

function forceAttachBubble(
  lane: LaneState,
  x: number,
  y: number,
  color: BubbleColor,
  kind: BubbleKind,
): AttachResult {
  const candidates = listAttachCandidates(lane.grid)
  if (candidates.length === 0) {
    const col = nearestColInRow(0, x)
    const key0 = cellKey(0, col)
    if (!lane.grid.has(key0)) {
      const popped = placeBubbleAndResolve(lane, 0, col, color, kind)
      return { row: 0, col, color, kind, popped }
    }
    return { row: 0, col, color, kind, popped: 0 }
  }

  let best = candidates[0]!
  let bestDist = Infinity
  for (const c of candidates) {
    const pos = bubblePos(c.row, c.col)
    const d = bubbleDistance(x, y, pos.x, pos.y)
    if (d < bestDist) {
      bestDist = d
      best = c
    }
  }

  const key = cellKey(best.row, best.col)
  if (!lane.grid.has(key)) {
    const popped = placeBubbleAndResolve(lane, best.row, best.col, color, kind)
    return { row: best.row, col: best.col, color, kind, popped }
  }

  return attachAtCeiling(lane, x, color, kind) ?? { row: 0, col: 0, color, kind, popped: 0 }
}

function attachAtCeiling(lane: LaneState, x: number, color: BubbleColor, kind: BubbleKind) {
  const row = 0
  const col = nearestColInRow(row, x)
  const key = cellKey(row, col)
  if (!lane.grid.has(key)) {
    const popped = placeBubbleAndResolve(lane, row, col, color, kind)
    return { row, col, color, kind, popped }
  }
  const fallback = attachNear(lane, x, GRID_TOP + BUBBLE_RADIUS, color, kind, row, col)
  if (fallback) return fallback
  return forceAttachBubble(lane, x, GRID_TOP + BUBBLE_RADIUS, color, kind)
}

function pickAttachCell(
  grid: Map<string, BubbleColor>,
  x: number,
  y: number,
  hitRow: number,
  hitCol: number,
): AttachCell {
  const candidates = neighbors(hitRow, hitCol).filter(({ row, col }) => {
    const key = cellKey(row, col)
    return row >= 0 && !grid.has(key)
  })

  if (candidates.length === 0) {
    const row = hitRow + 1
    const col = nearestColInRow(row, x)
    const key = cellKey(row, col)
    if (!grid.has(key)) return { row, col }
    return pickForceAttachCell(grid, x, y)
  }

  let best = candidates[0]!
  let bestDist = Infinity
  for (const c of candidates) {
    const pos = bubblePos(c.row, c.col)
    const d = bubbleDistance(x, y, pos.x, pos.y)
    if (d < bestDist) {
      bestDist = d
      best = c
    }
  }

  return { row: best.row, col: best.col }
}

function attachNear(
  lane: LaneState,
  x: number,
  y: number,
  color: BubbleColor,
  kind: BubbleKind,
  hitRow: number,
  hitCol: number,
): AttachResult | null {
  const cell = pickAttachCell(lane.grid, x, y, hitRow, hitCol)
  const key = cellKey(cell.row, cell.col)
  if (!lane.grid.has(key)) {
    const popped = placeBubbleAndResolve(lane, cell.row, cell.col, color, kind)
    return { row: cell.row, col: cell.col, color, kind, popped }
  }
  return forceAttachBubble(lane, x, y, color, kind)
}

function placeBubbleAndResolve(
  lane: LaneState,
  row: number,
  col: number,
  color: BubbleColor,
  kind: BubbleKind,
): number {
  const key = cellKey(row, col)
  lane.grid.set(key, color)
  spawnParticles(lane, bubblePos(row, col), color, kind === 'normal' ? 8 : 14)
  return resolveAttachmentWithKind(lane, row, col, kind)
}

function resolveAttachmentWithKind(lane: LaneState, row: number, col: number, kind: BubbleKind): number {
  if (kind === 'bomb') {
    return popHexRadius(lane, row, col, 2)
  }
  if (kind === 'rainbow') {
    return popRainbowAt(lane, row, col)
  }
  if (kind === 'fire') {
    const cluster = floodColor(lane.grid, row, col)
    if (cluster.size >= 3) {
      return resolveAttachment(lane, row, col) + popHexRadius(lane, row, col, 1)
    }
    return popHexRadius(lane, row, col, 1)
  }
  return resolveAttachment(lane, row, col)
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

export function bubblePos(row: number, col: number) {
  const hStep = GRID_COLS_EVEN > 1 ? (1 - GRID_H_MARGIN * 2) / (GRID_COLS_EVEN - 1) : 0
  const stagger = row % 2 === 1 ? hStep * 0.5 : 0
  return {
    x: GRID_H_MARGIN + stagger + col * hStep,
    y: GRID_TOP + row * ROW_VERTICAL_STEP,
  }
}

export function bubbleDistance(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx
  const dy = (ay - by) * playfieldAspect
  return Math.hypot(dx, dy)
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

function wrapAngle(angle: number) {
  let a = angle
  while (a > Math.PI) a -= Math.PI * 2
  while (a < -Math.PI) a += Math.PI * 2
  return a
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

export type AttachCell = { row: number; col: number }

function pickForceAttachCell(grid: Map<string, BubbleColor>, x: number, y: number): AttachCell {
  const candidates = listAttachCandidates(grid)
  if (candidates.length === 0) {
    return { row: 0, col: nearestColInRow(0, x) }
  }

  let best = candidates[0]!
  let bestDist = Infinity
  for (const c of candidates) {
    const pos = bubblePos(c.row, c.col)
    const d = bubbleDistance(x, y, pos.x, pos.y)
    if (d < bestDist) {
      bestDist = d
      best = c
    }
  }

  const key = cellKey(best.row, best.col)
  if (!grid.has(key)) return { row: best.row, col: best.col }
  return predictAttachAtCeiling(grid, x)
}

function predictAttachAtCeiling(grid: Map<string, BubbleColor>, x: number): AttachCell {
  const row = 0
  const col = nearestColInRow(row, x)
  const key = cellKey(row, col)
  if (!grid.has(key)) return { row, col }
  return pickAttachCell(grid, x, GRID_TOP + BUBBLE_RADIUS, row, col)
}

const AIM_GUIDE_DOT_SPACING = 0.036
const SHOT_SIM_MAX_STEPS = 480

type ShotSimResult = {
  dots: { x: number; y: number }[]
  pathVertices: { x: number; y: number }[]
  target: AttachCell | null
}

function advanceShotStep(
  x: number,
  y: number,
  vx: number,
  vy: number,
  step: number,
): { x: number; y: number; vx: number; vy: number; bounce: { x: number; y: number } | null } {
  let nx = x + vx * step
  let ny = y + vy * step
  let nvx = vx
  let bounce: { x: number; y: number } | null = null
  const left = GRID_H_MARGIN
  const right = 1 - GRID_H_MARGIN

  if (nx < left && vx < 0) {
    const t = (left - x) / (nx - x)
    const by = y + (ny - y) * t
    bounce = { x: left, y: by }
    nx = left + (left - nx)
    nvx = -vx
  } else if (nx > right && vx > 0) {
    const t = (right - x) / (nx - x)
    const by = y + (ny - y) * t
    bounce = { x: right, y: by }
    nx = right - (nx - right)
    nvx = -vx
  }

  return { x: nx, y: ny, vx: nvx, vy, bounce }
}

function sampleDotsAlongPath(vertices: { x: number; y: number }[], spacing: number) {
  const dots: { x: number; y: number }[] = []
  if (vertices.length === 0) return dots

  let carry = spacing * 0.45
  for (let v = 0; v < vertices.length - 1; v += 1) {
    const ax = vertices[v]!.x
    const ay = vertices[v]!.y
    const bx = vertices[v + 1]!.x
    const by = vertices[v + 1]!.y
    const segLen = bubbleDistance(ax, ay, bx, by)
    if (segLen <= 0) continue
    let traveled = 0
    while (traveled < segLen) {
      const remain = carry > 0 ? carry : spacing
      const stepAlong = Math.min(remain, segLen - traveled)
      traveled += stepAlong
      carry -= stepAlong
      if (carry <= 0.0001) {
        const t = traveled / segLen
        dots.push({ x: ax + (bx - ax) * t, y: ay + (by - ay) * t })
        carry = spacing
      }
    }
  }
  return dots
}

function simulateShotPath(
  grid: Map<string, BubbleColor>,
  aimAngle: number,
  collectGuide: boolean,
): ShotSimResult {
  let x = SHOOTER_X
  let y = SHOOTER_Y
  let vx = Math.cos(aimAngle) * SHOT_SPEED
  let vy = Math.sin(aimAngle) * SHOT_SPEED
  const pathVertices: { x: number; y: number }[] = [{ x, y }]
  let target: AttachCell | null = null

  for (let i = 0; i < SHOT_SIM_MAX_STEPS; i += 1) {
    const prevX = x
    const prevY = y
    const moved = advanceShotStep(x, y, vx, vy, SHOT_PHYSICS_STEP)
    x = moved.x
    y = moved.y
    vx = moved.vx
    vy = moved.vy

    if (collectGuide && moved.bounce) {
      pathVertices.push(moved.bounce)
    }

    if (y <= GRID_TOP + BUBBLE_RADIUS) {
      target = predictAttachAtCeiling(grid, x)
      if (collectGuide) {
        pathVertices.push({ x, y })
        pathVertices.push(bubblePos(target.row, target.col))
      }
      break
    }

    const gridHit = findFirstGridHitOnPath(grid, prevX, prevY, x, y, moved.bounce)
    if (gridHit) {
      target = pickAttachCell(grid, gridHit.x, gridHit.y, gridHit.row, gridHit.col)
      if (collectGuide) {
        pathVertices.push({ x: gridHit.x, y: gridHit.y })
        pathVertices.push(bubblePos(target.row, target.col))
      }
      break
    }

    if (y > 1.08) {
      if (collectGuide) pathVertices.push({ x, y })
      break
    }
  }

  const dots = collectGuide ? sampleDotsAlongPath(pathVertices, AIM_GUIDE_DOT_SPACING) : []
  return { dots, pathVertices, target }
}

/** Nişan çizgisi için atış yolundan eşit aralıklı noktalar */
export function sampleAimGuideDots(
  grid: Map<string, BubbleColor>,
  aimAngle: number,
): { dots: { x: number; y: number }[]; pathVertices: { x: number; y: number }[]; target: AttachCell | null } {
  const { dots, pathVertices, target } = simulateShotPath(grid, aimAngle, true)
  return { dots, pathVertices, target }
}

/** Nişan açısında topun ızgarada oturacağı hücre (atışla aynı mantık) */
export function predictAttachCell(grid: Map<string, BubbleColor>, aimAngle: number): AttachCell | null {
  return simulateShotPath(grid, aimAngle, false).target
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
  const dx = pos.x - SHOOTER_X
  const dy = (pos.y - SHOOTER_Y) * playfieldAspect
  return clamp(Math.atan2(dy, dx), AIM_MIN, AIM_MAX)
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

function rollShooterBubble(grid: Map<string, BubbleColor>, seed: number): BubbleSlot {
  const rng = mulberry32(seed * 313)
  const color = pickColorForLane(grid, Math.floor(rng() * 999))
  const roll = rng()
  if (roll < 0.08) return { color, kind: 'fire' }
  if (roll < 0.14) return { color, kind: 'bomb' }
  if (roll < 0.2) return { color, kind: 'rainbow' }
  return { color, kind: 'normal' }
}

function refillGridIfEmpty(lane: LaneState, seed: number, events: LaneEvent[]) {
  if (lane.grid.size > 0) return
  lane.grid = createInitialGrid(seed)
  const rolled = rollShooterBubble(lane.grid, seed + 5)
  lane.currentColor = rolled.color
  lane.currentKind = rolled.kind
  const rolledNext = rollShooterBubble(lane.grid, seed + 9)
  lane.nextColor = rolledNext.color
  lane.nextKind = rolledNext.kind
  events.push('refill')
}

function hexSteps(row0: number, col0: number, row1: number, col1: number): number {
  if (row0 === row1 && col0 === col1) return 0
  const visited = new Set<string>()
  const queue: { row: number; col: number; d: number }[] = [{ row: row0, col: col0, d: 0 }]
  while (queue.length > 0) {
    const { row, col, d } = queue.shift()!
    const key = cellKey(row, col)
    if (visited.has(key)) continue
    visited.add(key)
    if (row === row1 && col === col1) return d
    for (const n of neighbors(row, col)) {
      const nKey = cellKey(n.row, n.col)
      if (!visited.has(nKey)) queue.push({ row: n.row, col: n.col, d: d + 1 })
    }
  }
  return 99
}

function popHexRadius(lane: LaneState, centerRow: number, centerCol: number, radius: number): number {
  let removed = 0
  for (const key of [...lane.grid.keys()]) {
    const [row, col] = key.split(',').map(Number)
    if (hexSteps(centerRow, centerCol, row, col) > radius) continue
    spawnParticles(lane, bubblePos(row, col), lane.grid.get(key)!, 10)
    lane.grid.delete(key)
    removed += 1
  }
  return removed + popFloating(lane)
}

function popRainbowAt(lane: LaneState, row: number, col: number): number {
  let removed = 0
  const handled = new Set<string>()
  for (const n of neighbors(row, col)) {
    const nKey = cellKey(n.row, n.col)
    const color = lane.grid.get(nKey)
    if (!color) continue
    const cluster = floodColor(lane.grid, n.row, n.col)
    if (cluster.size < 2) continue
    const signature = [...cluster].sort().join('|')
    if (handled.has(signature)) continue
    handled.add(signature)
    for (const key of cluster) {
      if (!lane.grid.has(key)) continue
      const [r, c] = key.split(',').map(Number)
      spawnParticles(lane, bubblePos(r, c), lane.grid.get(key)!, 10)
      lane.grid.delete(key)
      removed += 1
    }
  }
  const selfKey = cellKey(row, col)
  if (lane.grid.has(selfKey)) {
    spawnParticles(lane, bubblePos(row, col), lane.grid.get(selfKey)!, 8)
    lane.grid.delete(selfKey)
    removed += 1
  }
  return removed + popFloating(lane)
}

function popFloating(lane: LaneState): number {
  let removed = 0
  const floating = findFloating(lane.grid)
  for (const key of floating) {
    const [r, c] = key.split(',').map(Number)
    spawnParticles(lane, bubblePos(r, c), lane.grid.get(key)!)
    lane.grid.delete(key)
    removed += 1
  }
  return removed
}
