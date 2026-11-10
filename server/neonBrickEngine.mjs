/**
 * Neon Brick Breaker physics for PlayMeet duels.
 * Bounce angle and AABB resolution follow the ideas in Sam Chang's
 * Neon Brick Breaker (MIT), https://github.com/samecchang/BrickBreaker
 * Copyright (c) 2026 Sam Chang. This file is an original PlayMeet adaptation.
 */

export const COLS = 8
export const ROWS = 5
export const MAX_LIVES = 3
export const MATCH_SECONDS = 90
export const BALL_R = 0.018
export const PADDLE_W = 0.3
export const PADDLE_H = 0.022
export const PADDLE_Y = 0.9
const PADDLE_SPEED = 1.85
const BASE_SPEED = 0.52
const ZONE_TOP = 0.07
const ZONE_H = 0.38

const ROW_COLORS = ['#7af0ff', '#8d7bff', '#ff5ad1', '#ffb020', '#4cd964']

export function brickColor(row) {
  return ROW_COLORS[row % ROW_COLORS.length]
}

export function createBricks(wave) {
  const layout = ((wave - 1) % 3 + 3) % 3
  const bricks = []
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      bricks.push(brickAt(layout, row, col))
    }
  }
  return bricks
}

function brickAt(layout, row, col) {
  if (layout === 1) {
    if (col < row || col >= COLS - row) return emptyBrick()
    return solidBrick(row === 0 ? 2 : 1)
  }
  if (layout === 2) {
    if (col === 3 && row > 0 && row < ROWS - 1) return emptyBrick()
    if ((row + col) % 5 === 0) return { hp: 1, max: 1, steel: true }
    return solidBrick((row + col) % 4 === 0 ? 2 : 1)
  }
  return solidBrick(1)
}

function emptyBrick() {
  return { hp: 0, max: 1, steel: false }
}

function solidBrick(hp) {
  return { hp, max: hp, steel: false }
}

export function createSide(wave = 1) {
  return {
    paddleX: 0.5,
    targetX: 0.5,
    ball: serve(0.5, 1),
    bricks: createBricks(wave),
    score: 0,
    lives: MAX_LIVES,
    wave,
    serveIn: 0,
  }
}

export function breakableLeft(bricks) {
  return bricks.reduce((sum, brick) => sum + (brick.hp > 0 && !brick.steel ? 1 : 0), 0)
}

export function speedForWave(wave) {
  return 1 + Math.max(0, wave - 1) * 0.07
}

export function stepSide(side, dt, speedMul = 1) {
  const events = []
  const half = PADDLE_W / 2
  const desired = clamp(side.targetX, half, 1 - half)
  const delta = desired - side.paddleX
  const maxStep = PADDLE_SPEED * dt
  side.paddleX += Math.sign(delta) * Math.min(Math.abs(delta), maxStep)

  if (!side.ball.active) {
    side.serveIn -= dt
    if (side.serveIn <= 0 && side.lives > 0) {
      side.ball = serve(side.paddleX, speedMul)
      side.ball.active = true
    }
    return { cleared: false, events }
  }

  const speed = Math.hypot(side.ball.vx, side.ball.vy) || BASE_SPEED * speedMul
  const steps = Math.max(1, Math.ceil((speed * dt) / 0.01))
  const slice = dt / steps
  for (let index = 0; index < steps; index += 1) {
    const dead = moveBall(side, slice, speedMul, events)
    if (dead) break
  }

  return { cleared: breakableLeft(side.bricks) === 0, events }
}

export function refillSide(side, wave) {
  side.wave = wave
  side.bricks = createBricks(wave)
  side.ball = { x: side.paddleX, y: 0.72, vx: 0, vy: 0, active: false }
  side.serveIn = 0.45
}

function serve(paddleX, speedMul) {
  const tilt = Math.random() * 0.7 - 0.35
  const speed = BASE_SPEED * speedMul
  return {
    x: paddleX,
    y: PADDLE_Y - 0.08,
    vx: Math.sin(tilt) * speed,
    vy: -Math.cos(tilt) * speed,
    active: true,
  }
}

function moveBall(side, dt, speedMul, events) {
  const ball = side.ball
  let { x, y, vx, vy } = ball
  const target = BASE_SPEED * speedMul
  const current = Math.hypot(vx, vy)
  if (current > 0.001) {
    const capped = Math.min(Math.max(current, target * 0.92), target * 1.45)
    vx = (vx / current) * capped
    vy = (vy / current) * capped
  }
  x += vx * dt
  y += vy * dt

  if (x <= BALL_R) {
    x = BALL_R
    vx = Math.abs(vx)
  } else if (x >= 1 - BALL_R) {
    x = 1 - BALL_R
    vx = -Math.abs(vx)
  }
  if (y <= BALL_R) {
    y = BALL_R
    vy = Math.abs(vy)
  }

  const paddleTop = PADDLE_Y - PADDLE_H
  const left = side.paddleX - PADDLE_W / 2
  const right = side.paddleX + PADDLE_W / 2
  if (
    vy > 0 &&
    y + BALL_R >= paddleTop &&
    y - BALL_R <= PADDLE_Y + PADDLE_H &&
    x >= left - BALL_R &&
    x <= right + BALL_R
  ) {
    const hit = clamp((x - side.paddleX) / (PADDLE_W / 2), -1, 1)
    const angle = hit * 1.05
    const speed = Math.max(target, Math.hypot(vx, vy))
    vx = Math.sin(angle) * speed
    vy = -Math.abs(Math.cos(angle) * speed)
    if (Math.abs(vy) < speed * 0.32) vy = -speed * 0.32
    y = paddleTop - BALL_R
    events.push({ type: 'paddle', x, y })
  }

  if (y > 1.04) {
    side.lives = Math.max(0, side.lives - 1)
    side.ball = { x: side.paddleX, y: 0.74, vx: 0, vy: 0, active: false }
    side.serveIn = side.lives > 0 ? 0.7 : 99
    events.push({ type: 'life', x: side.paddleX, y: 1 })
    return true
  }

  const hitIndex = brickIndexAt(side, x, y)
  if (hitIndex >= 0) {
    const brick = side.bricks[hitIndex]
    const rect = brickRect(hitIndex)
    const resolved = separate(x, y, vx, vy, rect)
    x = resolved.x
    y = resolved.y
    vx = resolved.vx
    vy = resolved.vy
    if (!brick.steel) {
      brick.hp -= 1
      if (brick.hp <= 0) {
        side.score += brick.max > 1 ? 180 : 100
        events.push({ type: 'brick', x: rect.x + rect.w / 2, y: rect.y + rect.h / 2, row: Math.floor(hitIndex / COLS) })
      } else {
        events.push({ type: 'crack', x: rect.x + rect.w / 2, y: rect.y + rect.h / 2, row: Math.floor(hitIndex / COLS) })
      }
    } else {
      events.push({ type: 'steel', x: rect.x + rect.w / 2, y: rect.y + rect.h / 2, row: Math.floor(hitIndex / COLS) })
    }
  }

  side.ball = { ...ball, x, y, vx, vy, active: true }
  return false
}

function brickIndexAt(side, x, y) {
  let found = -1
  let best = Infinity
  for (let index = 0; index < COLS * ROWS; index += 1) {
    if (side.bricks[index].hp <= 0) continue
    const rect = brickRect(index)
    const nearestX = clamp(x, rect.x, rect.x + rect.w)
    const nearestY = clamp(y, rect.y, rect.y + rect.h)
    const distance = Math.hypot(x - nearestX, y - nearestY)
    if (distance <= BALL_R && distance < best) {
      best = distance
      found = index
    }
  }
  return found
}

export function brickRect(index) {
  const col = index % COLS
  const row = Math.floor(index / COLS)
  const gapX = 0.012
  const gapY = 0.01
  const w = (1 - gapX * (COLS + 1)) / COLS
  const h = (ZONE_H - gapY * (ROWS + 1)) / ROWS
  return {
    x: gapX + col * (w + gapX),
    y: ZONE_TOP + gapY + row * (h + gapY),
    w,
    h,
  }
}

function separate(x, y, vx, vy, rect) {
  const left = x - (rect.x - BALL_R)
  const right = rect.x + rect.w + BALL_R - x
  const top = y - (rect.y - BALL_R)
  const bottom = rect.y + rect.h + BALL_R - y
  const min = Math.min(left, right, top, bottom)
  if (min === left) return { x: rect.x - BALL_R - 0.001, y, vx: -Math.abs(vx), vy }
  if (min === right) return { x: rect.x + rect.w + BALL_R + 0.001, y, vx: Math.abs(vx), vy }
  if (min === top) return { x, y: rect.y - BALL_R - 0.001, vx, vy: -Math.abs(vy) }
  return { x, y: rect.y + rect.h + BALL_R + 0.001, vx, vy: Math.abs(vy) }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

export function packSide(side) {
  return {
    paddleX: round(side.paddleX),
    ball: {
      x: round(side.ball.x),
      y: round(side.ball.y),
      active: side.ball.active,
    },
    bricks: side.bricks.map((brick) => (brick.steel ? 9 : brick.hp)),
    score: side.score,
    lives: side.lives,
    wave: side.wave,
  }
}

function round(value) {
  return Math.round(value * 1000) / 1000
}
