export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const POINTS_TO_WIN = 3200
export const LEG_DURATION_MS = 45_000
export const ROUND_BREAK_MS = 2600
export const START_LIVES = 3
export const COLS = 6
export const ROWS = 5
export const PADDLE_W = 20
export const PADDLE_H = 3
export const PADDLE_Y = 90
export const BALL_R = 1.6
export const BRICK_LEFT = 8
export const BRICK_TOP = 10
export const BRICK_W = 14
export const BRICK_H = 4.2
export const BALL_SPEED = 0.095
export const SERVE_DELAY_MS = 600

export const BRICK_COLORS = ['#ff5c7a', '#ff9f43', '#ffe14a', '#5cff7a', '#5ecbff', '#c77dff'] as const

export type BreakoutBrick = {
  alive: boolean
  hp: number
}

export type BreakoutBall = {
  x: number
  y: number
  vx: number
  vy: number
  active: boolean
}

export type BreakoutSideState = {
  sideId: 1 | 2
  score: number
  matchPoints: number
  lives: number
  paddleX: number
  ball: BreakoutBall
  bricks: BreakoutBrick[][]
  serveAt: number
  wave: number
}

export type BreakoutState = {
  p1: BreakoutSideState
  p2: BreakoutSideState
  legStartAt: number
  legEndsAt: number
  roundNumber: number
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

export function brickColor(row: number) {
  return BRICK_COLORS[row % BRICK_COLORS.length]!
}

export function createBricks(seed: number): BreakoutBrick[][] {
  const rand = mulberry32(seed)
  const grid: BreakoutBrick[][] = []
  for (let row = 0; row < ROWS; row++) {
    const line: BreakoutBrick[] = []
    for (let col = 0; col < COLS; col++) {
      const edge = row === 0 && (col === 0 || col === COLS - 1)
      if (edge && rand() > 0.5) {
        line.push({ alive: false, hp: 0 })
      } else {
        const hp = row <= 1 && rand() > 0.78 ? 2 : 1
        line.push({ alive: true, hp })
      }
    }
    grid.push(line)
  }
  return grid
}

function restingBall(paddleX: number): BreakoutBall {
  return {
    x: paddleX,
    y: PADDLE_Y - 4,
    vx: 0,
    vy: 0,
    active: false,
  }
}

export function createSide(sideId: 1 | 2, seed: number, now: number): BreakoutSideState {
  return {
    sideId,
    score: 0,
    matchPoints: 0,
    lives: START_LIVES,
    paddleX: 50,
    ball: restingBall(50),
    bricks: createBricks(seed),
    serveAt: now + SERVE_DELAY_MS,
    wave: 1,
  }
}

export function createBreakoutState(now: number): BreakoutState {
  return {
    p1: createSide(1, 18001, now),
    p2: createSide(2, 28001, now),
    legStartAt: now,
    legEndsAt: now + LEG_DURATION_MS,
    roundNumber: 1,
  }
}

export function movePaddle(side: BreakoutSideState, x: number): BreakoutSideState {
  const half = PADDLE_W / 2
  const paddleX = Math.max(half, Math.min(100 - half, x))
  const ball = side.ball.active
    ? side.ball
    : { ...side.ball, x: paddleX, y: PADDLE_Y - 4 }
  return { ...side, paddleX, ball }
}

export function launchBall(side: BreakoutSideState, now: number): BreakoutSideState {
  if (side.lives <= 0 || side.ball.active) return side
  if (now < side.serveAt) return side
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.65
  return {
    ...side,
    ball: {
      x: side.paddleX,
      y: PADDLE_Y - 4,
      vx: Math.cos(angle) * BALL_SPEED,
      vy: Math.sin(angle) * BALL_SPEED,
      active: true,
    },
  }
}

function respawnBricks(side: BreakoutSideState, now: number): BreakoutSideState {
  const seed = side.sideId * 7000 + side.wave * 97 + Math.floor(now)
  return {
    ...side,
    bricks: createBricks(seed),
    wave: side.wave + 1,
    score: side.score + 400,
    serveAt: now + SERVE_DELAY_MS,
    ball: restingBall(side.paddleX),
  }
}

function loseLife(side: BreakoutSideState, now: number): BreakoutSideState {
  const lives = side.lives - 1
  if (lives <= 0) {
    return { ...side, lives: 0, ball: { ...side.ball, active: false } }
  }
  return {
    ...side,
    lives,
    ball: restingBall(side.paddleX),
    serveAt: now + SERVE_DELAY_MS,
  }
}

function reflectPaddle(ball: BreakoutBall, paddleX: number): BreakoutBall {
  const hit = (ball.x - paddleX) / (PADDLE_W / 2)
  const clamped = Math.max(-1, Math.min(1, hit))
  const speed = Math.hypot(ball.vx, ball.vy) || BALL_SPEED
  const angle = clamped * 0.75 - Math.PI / 2
  return {
    ...ball,
    vy: -Math.abs(Math.sin(angle) * speed),
    vx: Math.cos(angle) * speed,
    y: PADDLE_Y - PADDLE_H - BALL_R - 0.5,
  }
}

export function tickSide(side: BreakoutSideState, dt: number, now: number): BreakoutSideState {
  if (dt <= 0 || side.lives <= 0) return side

  let s = side

  if (!s.ball.active && now >= s.serveAt) {
    const angle = -Math.PI / 2 + ((s.sideId * 0.37) % 1) * 0.4 - 0.2
    s = {
      ...s,
      ball: {
        x: s.paddleX,
        y: PADDLE_Y - 4,
        vx: Math.cos(angle) * BALL_SPEED,
        vy: Math.sin(angle) * BALL_SPEED,
        active: true,
      },
    }
  }

  if (!s.ball.active) return s

  let { x, y, vx, vy } = s.ball
  x += vx * dt
  y += vy * dt

  const minX = BALL_R
  const maxX = 100 - BALL_R
  if (x < minX) {
    x = minX
    vx = Math.abs(vx)
  }
  if (x > maxX) {
    x = maxX
    vx = -Math.abs(vx)
  }
  if (y < BALL_R) {
    y = BALL_R
    vy = Math.abs(vy)
  }

  let bricks = s.bricks.map((row) => row.map((b) => ({ ...b })))
  let score = s.score

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const brick = bricks[row]![col]!
      if (!brick.alive) continue
      const left = BRICK_LEFT + col * BRICK_W
      const top = BRICK_TOP + row * BRICK_H
      const right = left + BRICK_W - 0.8
      const bottom = top + BRICK_H - 0.5
      if (x + BALL_R < left || x - BALL_R > right || y + BALL_R < top || y - BALL_R > bottom) continue

      brick.hp -= 1
      if (brick.hp <= 0) {
        brick.alive = false
        score += 80 + (ROWS - row) * 20
      }
      vy = Math.abs(vy)
      y = bottom + BALL_R + 0.2
      break
    }
  }

  const paddleLeft = s.paddleX - PADDLE_W / 2
  const paddleRight = s.paddleX + PADDLE_W / 2
  const paddleTop = PADDLE_Y - PADDLE_H
  if (
    vy > 0 &&
    y + BALL_R >= paddleTop &&
    y - BALL_R <= PADDLE_Y + 1 &&
    x >= paddleLeft - BALL_R &&
    x <= paddleRight + BALL_R
  ) {
    const bounced = reflectPaddle({ x, y, vx, vy, active: true }, s.paddleX)
    x = bounced.x
    y = bounced.y
    vx = bounced.vx
    vy = bounced.vy
  }

  if (y > 100 + BALL_R) {
    s = loseLife({ ...s, bricks, score, ball: { x, y, vx, vy, active: true } }, now)
    return s
  }

  s = { ...s, bricks, score, ball: { x, y, vx, vy, active: true } }

  if (bricks.every((row) => row.every((b) => !b.alive))) {
    s = respawnBricks(s, now)
  }

  return s
}

export function legShouldEnd(g: BreakoutState, now: number) {
  if (now >= g.legEndsAt) return true
  if (g.p1.score >= POINTS_TO_WIN || g.p2.score >= POINTS_TO_WIN) return true
  return false
}

export function resolveLegWinner(p1: BreakoutSideState, p2: BreakoutSideState): 'p1' | 'p2' | 'draw' {
  if (p1.score > p2.score) return 'p1'
  if (p2.score > p1.score) return 'p2'
  return 'draw'
}
