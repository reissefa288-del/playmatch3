export const POINTS_TO_WIN = 5
export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const ROUND_BREAK_MS = 2200
export const PADDLE_H = 0.24
export const PADDLE_W = 0.028
export const BALL_R = 0.022
export const BALL_SPEED = 0.014
export const BALL_SPEED_MAX_MUL = 2.15
export const SPEED_RAMP_PER_TICK = 0.000028
export const SPEED_RAMP_ON_PADDLE = 0.055
export const FIRE_HEAT_THRESHOLD = 0.52

export type Paddle = { y: number }
export type Ball = { x: number; y: number; vx: number; vy: number }

export type PongLaneState = {
  laneId: 1 | 2
  score: number
  matchPoints: number
}

export type PongState = {
  paddle1: Paddle
  paddle2: Paddle
  ball: Ball
  lane1: PongLaneState
  lane2: PongLaneState
  serving: 1 | 2
  lastScorer: 1 | 2 | null
  /** Rally boyutu; 1 = başlangıç hızı */
  speedMul: number
}

export function clampSpeedMul(mul: number) {
  return Math.max(1, Math.min(BALL_SPEED_MAX_MUL, mul))
}

export function ballHeatLevel(speedMul: number) {
  return Math.min(1, Math.max(0, (speedMul - 1) / (BALL_SPEED_MAX_MUL - 1)))
}

export function isFireBall(speedMul: number) {
  return ballHeatLevel(speedMul) >= FIRE_HEAT_THRESHOLD
}

function targetBallSpeed(speedMul: number) {
  return BALL_SPEED * clampSpeedMul(speedMul)
}

function setBallSpeed(ball: Ball, speed: number): Ball {
  const current = Math.hypot(ball.vx, ball.vy)
  if (current < 1e-6) {
    const dir = ball.vx >= 0 ? 1 : -1
    return { ...ball, vx: dir * speed, vy: 0 }
  }
  const ratio = speed / current
  return { ...ball, vx: ball.vx * ratio, vy: ball.vy * ratio }
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
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

export function createPongState(seed: number): PongState {
  const rand = mulberry32(seed)
  const dir = rand() > 0.5 ? 1 : -1
  return {
    paddle1: { y: 0.5 },
    paddle2: { y: 0.5 },
    ball: {
      x: 0.5,
      y: 0.35 + rand() * 0.3,
      vx: dir * BALL_SPEED,
      vy: (rand() - 0.5) * BALL_SPEED * 0.8,
    },
    lane1: { laneId: 1, score: 0, matchPoints: 0 },
    lane2: { laneId: 2, score: 0, matchPoints: 0 },
    serving: 1,
    lastScorer: null,
    speedMul: 1,
  }
}

export function resetBall(state: PongState, toward: 1 | 2, seed: number): PongState {
  const rand = mulberry32(seed)
  return {
    ...state,
    ball: {
      x: 0.5,
      y: 0.35 + rand() * 0.3,
      vx: (toward === 2 ? 1 : -1) * BALL_SPEED,
      vy: (rand() - 0.5) * BALL_SPEED * 0.75,
    },
    serving: toward === 1 ? 2 : 1,
    speedMul: 1,
  }
}

export function setPaddle1(state: PongState, yNorm: number): PongState {
  const half = PADDLE_H / 2
  return {
    ...state,
    paddle1: { y: clamp(yNorm, half, 1 - half) },
  }
}

export function setPaddle2(state: PongState, yNorm: number): PongState {
  const half = PADDLE_H / 2
  return {
    ...state,
    paddle2: { y: clamp(yNorm, half, 1 - half) },
  }
}

function reflectBallOnPaddle(
  ball: Ball,
  paddleY: number,
  paddleSide: 'left' | 'right',
  speedMul: number,
): Ball {
  const half = PADDLE_H / 2
  const rel = (ball.y - paddleY) / half
  const angle = rel * 0.75
  const speed = targetBallSpeed(speedMul)
  const dir = paddleSide === 'left' ? 1 : -1
  return {
    x: paddleSide === 'left' ? PADDLE_W + BALL_R + 0.01 : 1 - PADDLE_W - BALL_R - 0.01,
    y: ball.y,
    vx: dir * speed * Math.cos(angle),
    vy: speed * Math.sin(angle),
  }
}

export type TickResult = {
  state: PongState
  scored: 1 | 2 | null
}

export function tickPong(state: PongState): TickResult {
  let { ball } = state
  let scored: 1 | 2 | null = null
  let speedMul = clampSpeedMul(state.speedMul + SPEED_RAMP_PER_TICK)
  let paddleHit = false

  ball = {
    ...ball,
    x: ball.x + ball.vx,
    y: ball.y + ball.vy,
  }

  if (ball.y - BALL_R <= 0) {
    ball = { ...ball, y: BALL_R, vy: Math.abs(ball.vy) }
  }
  if (ball.y + BALL_R >= 1) {
    ball = { ...ball, y: 1 - BALL_R, vy: -Math.abs(ball.vy) }
  }

  const p1Top = state.paddle1.y - PADDLE_H / 2
  const p1Bot = state.paddle1.y + PADDLE_H / 2
  const p2Top = state.paddle2.y - PADDLE_H / 2
  const p2Bot = state.paddle2.y + PADDLE_H / 2

  if (ball.x - BALL_R <= PADDLE_W && ball.vx < 0 && ball.y >= p1Top && ball.y <= p1Bot) {
    speedMul = clampSpeedMul(speedMul + SPEED_RAMP_ON_PADDLE)
    ball = reflectBallOnPaddle(ball, state.paddle1.y, 'left', speedMul)
    paddleHit = true
  }

  if (ball.x + BALL_R >= 1 - PADDLE_W && ball.vx > 0 && ball.y >= p2Top && ball.y <= p2Bot) {
    speedMul = clampSpeedMul(speedMul + SPEED_RAMP_ON_PADDLE)
    ball = reflectBallOnPaddle(ball, state.paddle2.y, 'right', speedMul)
    paddleHit = true
  }

  if (!paddleHit) {
    ball = setBallSpeed(ball, targetBallSpeed(speedMul))
  }

  let lane1 = state.lane1
  let lane2 = state.lane2

  if (ball.x < -BALL_R) {
    lane2 = { ...lane2, score: lane2.score + 1 }
    scored = 2
  } else if (ball.x > 1 + BALL_R) {
    lane1 = { ...lane1, score: lane1.score + 1 }
    scored = 1
  }

  return {
    state: { ...state, ball, lane1, lane2, lastScorer: scored, speedMul },
    scored,
  }
}

export function resolveRoundWinner(l1: PongLaneState, l2: PongLaneState): 'p1' | 'p2' | 'draw' {
  if (l1.score > l2.score) return 'p1'
  if (l2.score > l1.score) return 'p2'
  return 'draw'
}
