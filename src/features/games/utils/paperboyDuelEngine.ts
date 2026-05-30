export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 3400
export const LEG_DURATION_MS = 48_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const MOVE_COOLDOWN_MS = 130
export const THROW_COOLDOWN_MS = 380
export const INVULN_MS = 1400
export const COLS = 7
export const HOUSE_COLS = [1, 3, 5] as const
export const VIEW_WORLD = 100
export const PLAYER_SCROLL_OFFSET = 10
export const SCROLL_SPEED = 0.04
export const SPAWN_AHEAD = 88
export const HOUSE_SPACING = 20
export const OBSTACLE_SPAWN_MS = 2800
export const MAX_OBSTACLES = 5
export const MAX_PAPERS = 6
export const SCORE_DELIVERY = 300
export const SCORE_STREAK = 80
export const PAPER_SPEED_Y = 0.14
export const PAPER_SPEED_X = 0.06

export type Dir = 'left' | 'right'

export type PbHouse = {
  id: number
  col: number
  worldY: number
  delivered: boolean
}

export type PbObstacle = {
  id: number
  col: number
  worldY: number
  kind: 'car' | 'dog' | 'hydrant'
}

export type PbPaper = {
  id: number
  col: number
  worldY: number
  vx: number
}

export type PaperboySideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  playerCol: number
  scroll: number
  houses: PbHouse[]
  obstacles: PbObstacle[]
  papers: PbPaper[]
  deliveries: number
  streak: number
  lastMoveAt: number
  lastThrowAt: number
  lastObstacleAt: number
  invulnUntil: number
  nextId: number
}

export type PaperboyState = {
  p1: PaperboySideState
  p2: PaperboySideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

export function colToPct(col: number) {
  return ((col + 0.5) / COLS) * 100
}

export function worldToPct(worldY: number, scroll: number) {
  const rel = (worldY - scroll) / VIEW_WORLD
  return 8 + rel * 78
}

export function playerWorldY(scroll: number) {
  return scroll + PLAYER_SCROLL_OFFSET
}

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function pickHouseCol(rand: () => number) {
  return HOUSE_COLS[Math.floor(rand() * HOUSE_COLS.length)]!
}

function initialHouses(scroll: number, startId: number, rand: () => number): PbHouse[] {
  const houses: PbHouse[] = []
  let id = startId
  for (let i = 0; i < 4; i++) {
    houses.push({
      id: id++,
      col: pickHouseCol(rand),
      worldY: scroll + 35 + i * HOUSE_SPACING,
      delivered: false,
    })
  }
  return houses
}

export function createSide(sideId: 1 | 2, seed: number): PaperboySideState {
  const rand = mulberry32(seed)
  const scroll = 0
  const houses = initialHouses(scroll, 1, rand)
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    playerCol: 3,
    scroll,
    houses,
    obstacles: [],
    papers: [],
    deliveries: 0,
    streak: 0,
    lastMoveAt: 0,
    lastThrowAt: 0,
    lastObstacleAt: 1200,
    invulnUntil: 0,
    nextId: houses.length + 1,
  }
}

export function createPaperboyState(now: number): PaperboyState {
  return {
    p1: createSide(1, 44001),
    p2: createSide(2, 54001),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

export function tryMove(side: PaperboySideState, dir: Dir, now: number): PaperboySideState {
  if (side.lives <= 0 || now - side.lastMoveAt < MOVE_COOLDOWN_MS) return side
  let col = side.playerCol
  if (dir === 'left') col--
  if (dir === 'right') col++
  col = Math.max(0, Math.min(COLS - 1, col))
  if (col === side.playerCol) return side
  return { ...side, playerCol: col, lastMoveAt: now }
}

export function tryThrow(side: PaperboySideState, now: number): PaperboySideState {
  if (side.lives <= 0 || now - side.lastThrowAt < THROW_COOLDOWN_MS) return side
  if (side.papers.length >= MAX_PAPERS) return side

  const target = side.houses
    .filter((h) => !h.delivered)
    .sort((a, b) => a.worldY - b.worldY)[0]

  let vx = 0
  if (target) {
    vx = target.col > side.playerCol ? PAPER_SPEED_X : target.col < side.playerCol ? -PAPER_SPEED_X : 0
  }

  const paper: PbPaper = {
    id: side.nextId,
    col: side.playerCol,
    worldY: playerWorldY(side.scroll) + 2,
    vx,
  }

  return {
    ...side,
    papers: [...side.papers, paper],
    nextId: side.nextId + 1,
    lastThrowAt: now,
  }
}

function crash(side: PaperboySideState, now: number): PaperboySideState {
  if (now < side.invulnUntil) return side
  const lives = side.lives - 1
  return {
    ...side,
    lives: lives > 0 ? lives : 0,
    streak: 0,
    invulnUntil: now + INVULN_MS,
  }
}

function deliverHouse(side: PaperboySideState, houseId: number): PaperboySideState {
  const houses = side.houses.map((h) => (h.id === houseId ? { ...h, delivered: true } : h))
  const streak = side.streak + 1
  return {
    ...side,
    houses,
    score: side.score + SCORE_DELIVERY + (streak > 1 ? SCORE_STREAK : 0),
    deliveries: side.deliveries + 1,
    streak,
  }
}

function spawnAhead(side: PaperboySideState, rand: () => number): PaperboySideState {
  let s = side
  const maxHouseY = s.houses.reduce((m, h) => Math.max(m, h.worldY), s.scroll)
  if (maxHouseY < s.scroll + SPAWN_AHEAD) {
    const house: PbHouse = {
      id: s.nextId,
      col: pickHouseCol(rand),
      worldY: s.scroll + SPAWN_AHEAD + rand() * 12,
      delivered: false,
    }
    s = { ...s, houses: [...s.houses, house], nextId: s.nextId + 1 }
  }
  return s
}

function spawnObstacle(side: PaperboySideState, now: number, rand: () => number): PaperboySideState {
  if (side.obstacles.length >= MAX_OBSTACLES || now - side.lastObstacleAt < OBSTACLE_SPAWN_MS) return side
  const kinds: PbObstacle['kind'][] = ['car', 'dog', 'hydrant']
  const obs: PbObstacle = {
    id: side.nextId,
    col: Math.floor(rand() * COLS),
    worldY: side.scroll + SPAWN_AHEAD * 0.65 + rand() * 20,
    kind: kinds[Math.floor(rand() * kinds.length)]!,
  }
  return {
    ...side,
    obstacles: [...side.obstacles, obs],
    nextId: side.nextId + 1,
    lastObstacleAt: now,
  }
}

export function tickSide(side: PaperboySideState, dt: number, now: number, rand: () => number): PaperboySideState {
  if (dt <= 0 || side.lives <= 0) return side

  let s: PaperboySideState = {
    ...side,
    scroll: side.scroll + SCROLL_SPEED * dt,
  }

  s = spawnAhead(s, rand)
  s = spawnObstacle(s, now, rand)

  let papers = s.papers.map((p) => ({
    ...p,
    col: p.col + p.vx * dt,
    worldY: p.worldY + PAPER_SPEED_Y * dt,
  }))

  const hitPaperIds = new Set<number>()
  for (const p of papers) {
    for (const h of s.houses) {
      if (h.delivered) continue
      if (Math.abs(p.col - h.col) < 0.55 && Math.abs(p.worldY - h.worldY) < 4) {
        s = deliverHouse(s, h.id)
        hitPaperIds.add(p.id)
        break
      }
    }
  }

  papers = papers.filter(
    (p) => !hitPaperIds.has(p.id) && p.worldY - s.scroll < VIEW_WORLD + 10,
  )
  s = { ...s, papers: papers.slice(-MAX_PAPERS) }

  const py = playerWorldY(s.scroll)
  const invuln = now < s.invulnUntil

  if (!invuln) {
    for (const o of s.obstacles) {
      if (Math.abs(o.col - s.playerCol) < 0.85 && Math.abs(o.worldY - py) < 3.5) {
        s = crash(s, now)
        break
      }
    }
  }

  const minY = s.scroll - 8
  s = {
    ...s,
    houses: s.houses.filter((h) => h.worldY > minY),
    obstacles: s.obstacles.filter((o) => o.worldY > minY),
  }

  return s
}

export function legShouldEnd(g: PaperboyState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: PaperboySideState, p2: PaperboySideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}
