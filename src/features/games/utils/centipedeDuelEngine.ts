export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 4000
export const LEG_DURATION_MS = 45_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const FIRE_COOLDOWN_MS = 180
export const MOVE_INTERVAL_MS = 220
export const BULLET_SPEED_ROWS = 0.018
export const COLS = 11
export const ROWS = 12
export const PLAYER_ROW = 12

export type CentipedeSegment = { id: number; col: number; row: number }
export type CentipedeMushroom = { col: number; row: number; hp: number }
export type CentipedeBullet = { id: number; col: number; row: number }

export type CentipedeSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  wave: number
  segments: CentipedeSegment[]
  mushrooms: CentipedeMushroom[]
  bullet: CentipedeBullet | null
  playerCol: number
  dir: 1 | -1
  pendingDrop: boolean
  lastMoveAt: number
  lastFireAt: number
  invulnUntil: number
  nextSegmentId: number
  nextBulletId: number
}

export type CentipedeState = {
  p1: CentipedeSideState
  p2: CentipedeSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
}

export function colToPct(col: number) {
  return ((col + 0.5) / COLS) * 100
}

export function rowToPct(row: number) {
  return 6 + ((row + 0.5) / (ROWS + 1)) * 84
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

function mushroomAt(mushrooms: CentipedeMushroom[], col: number, row: number) {
  return mushrooms.find((m) => m.col === col && m.row === row)
}

function segmentAt(segments: CentipedeSegment[], col: number, row: number) {
  return segments.find((s) => s.col === col && s.row === row)
}

export function createMushrooms(rand: () => number, count: number): CentipedeMushroom[] {
  const out: CentipedeMushroom[] = []
  let guard = 0
  while (out.length < count && guard++ < 200) {
    const col = Math.floor(rand() * COLS)
    const row = 2 + Math.floor(rand() * (ROWS - 3))
    if (mushroomAt(out, col, row)) continue
    out.push({ col, row, hp: 1 + Math.floor(rand() * 3) })
  }
  return out
}

export function spawnCentipede(side: CentipedeSideState, length: number): CentipedeSideState {
  const segments: CentipedeSegment[] = []
  let id = side.nextSegmentId
  for (let c = 0; c < length; c++) {
    segments.push({ id: id++, col: c, row: 0 })
  }
  return {
    ...side,
    segments,
    nextSegmentId: id,
    dir: 1,
    pendingDrop: false,
    wave: side.wave + 1,
  }
}

export function createSide(sideId: 1 | 2, seed: number): CentipedeSideState {
  const rand = mulberry32(seed)
  const side: CentipedeSideState = {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    wave: 0,
    segments: [],
    mushrooms: createMushrooms(rand, 22),
    bullet: null,
    playerCol: Math.floor(COLS / 2),
    dir: 1,
    pendingDrop: false,
    lastMoveAt: 0,
    lastFireAt: 0,
    invulnUntil: 0,
    nextSegmentId: 1,
    nextBulletId: 1,
  }
  return spawnCentipede(side, 8)
}

export function createCentipedeState(now: number): CentipedeState {
  return {
    p1: createSide(1, 12031),
    p2: createSide(2, 22031),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

export function movePlayer(side: CentipedeSideState, col: number): CentipedeSideState {
  const c = Math.max(0, Math.min(COLS - 1, Math.round(col)))
  return { ...side, playerCol: c }
}

export function tryShoot(side: CentipedeSideState, now: number): CentipedeSideState {
  if (side.lives <= 0 || side.bullet) return side
  if (now - side.lastFireAt < FIRE_COOLDOWN_MS) return side
  const bullet: CentipedeBullet = {
    id: side.nextBulletId,
    col: side.playerCol,
    row: PLAYER_ROW - 0.35,
  }
  return {
    ...side,
    bullet,
    nextBulletId: side.nextBulletId + 1,
    lastFireAt: now,
  }
}

function stepCentipedeMove(side: CentipedeSideState): CentipedeSideState {
  if (side.segments.length === 0) return side

  let segments = [...side.segments]
  let dir = side.dir
  let pendingDrop = side.pendingDrop

  if (pendingDrop) {
    segments = segments.map((s) => ({ ...s, row: s.row + 1 }))
    dir = (dir * -1) as 1 | -1
    pendingDrop = false
  } else {
    const dCol = dir
    let blocked = false
    for (const s of segments) {
      const nc = s.col + dCol
      if (nc < 0 || nc >= COLS) {
        blocked = true
        break
      }
      if (mushroomAt(side.mushrooms, nc, s.row)) {
        blocked = true
        break
      }
    }
    if (!blocked) {
      segments = segments.map((s) => ({ ...s, col: s.col + dCol }))
    } else {
      pendingDrop = true
    }
  }

  return { ...side, segments, dir, pendingDrop }
}

export function tickSide(side: CentipedeSideState, dt: number, now: number, rand: () => number): CentipedeSideState {
  if (dt <= 0) return side

  let s = { ...side }

  if (s.segments.length > 0 && now - s.lastMoveAt >= MOVE_INTERVAL_MS) {
    s = stepCentipedeMove(s)
    s.lastMoveAt = now
  }

  if (s.bullet) {
    let row = s.bullet.row - BULLET_SPEED_ROWS * dt
    let bullet: CentipedeBullet | null = { ...s.bullet, row }
    let mushrooms = s.mushrooms
    let segments = s.segments
    let score = s.score

    const hitRow = Math.round(row)
    const hitCol = bullet.col

    const mush = mushroomAt(mushrooms, hitCol, hitRow)
    if (mush) {
      const hp = mush.hp - 1
      mushrooms =
        hp <= 0
          ? mushrooms.filter((m) => !(m.col === hitCol && m.row === hitRow))
          : mushrooms.map((m) => (m.col === hitCol && m.row === hitRow ? { ...m, hp } : m))
      bullet = null
      score += 10
    } else {
      const seg = segmentAt(segments, hitCol, hitRow)
      if (seg) {
        segments = segments.filter((x) => x.id !== seg.id)
        bullet = null
        score += seg.row < 3 ? 120 : 80
      } else if (row < -0.5) {
        bullet = null
      }
    }

    s = { ...s, bullet, mushrooms, segments, score }
  }

  if (s.segments.length === 0) {
    const len = Math.min(12, 6 + s.wave)
    s = spawnCentipede(s, len)
    if (rand() < 0.35) {
      const m = createMushrooms(rand, 2)
      s.mushrooms = [...s.mushrooms, ...m]
    }
  }

  const invuln = now < s.invulnUntil
  if (!invuln && s.lives > 0) {
    for (const seg of s.segments) {
      if (seg.row >= ROWS - 1 && seg.col === s.playerCol) {
        s.lives -= 1
        s.invulnUntil = now + 1400
        s.segments = s.segments.filter((x) => x.id !== seg.id)
        break
      }
    }
  }

  return s
}

export function legShouldEnd(g: CentipedeState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: CentipedeSideState, p2: CentipedeSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}
