export const MATCH_ROUNDS = 5
export const WIN_ROUNDS = 3
export const ROUND_SECONDS = 88
export const ROUND_BREAK_MS = 2600
export const LIVES_START = 3

export const BIRD_X = 0.28
export const BIRD_R = 0.042
export const GRAVITY = 2.65
export const FLAP_VY = -0.92
export const MAX_FALL_VY = 1.35
export const PIPE_SPEED = 0.38
export const PIPE_W = 0.13
export const PIPE_GAP = 0.3
export const PIPE_SPAWN_X = 1.08
export const PIPE_MIN_SPACING = 0.48
export const FLOOR_Y = 0.94
export const CEIL_Y = 0.06

export type Pipe = {
  id: number
  x: number
  gapY: number
  scored: boolean
}

export type FlappyLaneState = {
  laneId: number
  birdY: number
  birdVy: number
  birdRot: number
  pipes: Pipe[]
  nextPipeId: number
  lastPipeX: number
  score: number
  combo: number
  best: number
  lives: number
  alive: boolean
  flapFlash: number
  trail: { x: number; y: number; life: number }[]
  matchPoints: number
  crashPop: string | null
}

export type FlappyLaneEvent = 'flap' | 'score' | 'crash' | 'die'

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function spawnPipe(lane: FlappyLaneState, seed: number): Pipe {
  const rand = mulberry32(seed + lane.nextPipeId * 17 + lane.laneId * 31)
  const gapY = 0.32 + rand() * 0.36
  const id = lane.nextPipeId
  return { id, x: PIPE_SPAWN_X, gapY, scored: false }
}

export function createLane(laneId: number, seed: number): FlappyLaneState {
  const lane: FlappyLaneState = {
    laneId,
    birdY: 0.5,
    birdVy: 0,
    birdRot: 0,
    pipes: [],
    nextPipeId: 1,
    lastPipeX: PIPE_SPAWN_X - PIPE_MIN_SPACING,
    score: laneId === 1 ? 0 : 0,
    combo: 1,
    best: laneId === 1 ? 32 : 28,
    lives: LIVES_START,
    alive: true,
    flapFlash: 0,
    trail: [],
    matchPoints: 0,
    crashPop: null,
  }
  const p1 = spawnPipe(lane, seed)
  lane.pipes.push(p1)
  lane.nextPipeId = 2
  lane.lastPipeX = p1.x
  return lane
}

function circleRectHit(
  cx: number,
  cy: number,
  r: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
): boolean {
  const nx = Math.max(rx, Math.min(cx, rx + rw))
  const ny = Math.max(ry, Math.min(cy, ry + rh))
  const dx = cx - nx
  const dy = cy - ny
  return dx * dx + dy * dy < r * r
}

function pipeRects(pipe: Pipe) {
  const half = PIPE_GAP / 2
  const topH = pipe.gapY - half
  const botY = pipe.gapY + half
  return {
    top: { x: pipe.x, y: 0, w: PIPE_W, h: Math.max(0, topH) },
    bot: { x: pipe.x, y: botY, w: PIPE_W, h: Math.max(0, 1 - botY) },
  }
}

function resetBird(lane: FlappyLaneState): FlappyLaneState {
  return {
    ...lane,
    birdY: 0.5,
    birdVy: 0,
    birdRot: 0,
    flapFlash: 0,
    crashPop: null,
  }
}

export function updateLane(
  lane: FlappyLaneState,
  dt: number,
  flap: boolean,
  seed: number,
): { lane: FlappyLaneState; events: FlappyLaneEvent[] } {
  const events: FlappyLaneEvent[] = []
  if (!lane.alive) return { lane, events }

  let next = { ...lane }
  next.flapFlash = Math.max(0, next.flapFlash - dt * 4)

  if (flap) {
    next.birdVy = FLAP_VY
    next.flapFlash = 1
    events.push('flap')
  }

  next.birdVy = Math.min(MAX_FALL_VY, next.birdVy + GRAVITY * dt)
  next.birdY += next.birdVy * dt
  next.birdRot = Math.max(-0.55, Math.min(0.85, next.birdVy * 0.75))

  next.trail = [
    { x: BIRD_X - 0.03, y: next.birdY, life: 1 },
    ...next.trail.map((t) => ({ ...t, life: t.life - dt * 2.8 })).filter((t) => t.life > 0),
  ].slice(0, 8)

  const moved = next.pipes.map((p) => ({ ...p, x: p.x - PIPE_SPEED * dt }))
  let pipes = moved.filter((p) => p.x > -PIPE_W - 0.05)

  const rightmost = pipes.length ? Math.max(...pipes.map((p) => p.x)) : 0
  if (rightmost < 1 - PIPE_MIN_SPACING || pipes.length === 0) {
    const np = spawnPipe(next, seed)
    pipes = [...pipes, np]
    next = { ...next, nextPipeId: next.nextPipeId + 1, lastPipeX: np.x }
  }

  for (const pipe of pipes) {
    if (!pipe.scored && pipe.x + PIPE_W < BIRD_X - BIRD_R) {
      pipe.scored = true
      next.score += 1
      next.combo = Math.min(9, next.combo + 1)
      next.best = Math.max(next.best, next.score)
      events.push('score')
    }
  }
  next.pipes = pipes

  let crashed = false
  if (next.birdY > FLOOR_Y || next.birdY < CEIL_Y) crashed = true

  if (!crashed) {
    for (const pipe of pipes) {
      const { top, bot } = pipeRects(pipe)
      if (
        circleRectHit(BIRD_X, next.birdY, BIRD_R, top.x, top.y, top.w, top.h) ||
        circleRectHit(BIRD_X, next.birdY, BIRD_R, bot.x, bot.y, bot.w, bot.h)
      ) {
        crashed = true
        break
      }
    }
  }

  if (crashed) {
    events.push('crash')
    const lives = next.lives - 1
    if (lives <= 0) {
      next = { ...next, lives: 0, alive: false, crashPop: 'ELENDİ', birdVy: 0 }
      events.push('die')
    } else {
      next = resetBird({ ...next, lives, crashPop: 'ÇARPTI!' })
      next.pipes = next.pipes.filter((p) => p.x > BIRD_X - 0.05)
    }
  }

  return { lane: next, events }
}

export function resolveRoundWinner(l1: FlappyLaneState, l2: FlappyLaneState): 'p1' | 'p2' | 'draw' {
  if (l1.score > l2.score) return 'p1'
  if (l2.score > l1.score) return 'p2'
  return 'draw'
}

export function startNewRound(_l1: FlappyLaneState, _l2: FlappyLaneState, seed: number): {
  lane1: FlappyLaneState
  lane2: FlappyLaneState
} {
  return {
    lane1: createLane(1, seed),
    lane2: createLane(2, seed + 99),
  }
}
