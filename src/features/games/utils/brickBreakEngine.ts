export const BRICK_COLS = 7
export const BRICK_ROWS = 6
export const PADDLE_WIDTH = 0.34
export const PADDLE_HEIGHT = 0.028
export const BALL_RADIUS = 0.022
export const PADDLE_Y = 0.905
export const BRICK_ZONE_TOP = 0.07
export const BRICK_ZONE_HEIGHT = 0.32
export const MAX_LIVES = 3
export const PADDLE_SPEED = 2.4
export const BASE_BALL_SPEED = 0.7
export const TRAIL_LENGTH = 4
export const MATCH_SECONDS = 90

export const BRICK_COLORS = ['#ff6b2c', '#ffb020', '#4cd964', '#32ade6', '#7b61ff', '#ff2d9a'] as const

export type BrickPower = 'none' | 'charged' | 'armored' | 'bonus'
export type BallPower = 'none' | 'fast' | 'wide' | 'pierce'
export type DropKind = Exclude<BallPower, 'none'>

export type PowerDrop = {
  x: number
  y: number
  kind: DropKind
  wobble: number
}

export const DROP_FALL_SPEED = 0.38
export const MAX_DROPS_PER_LANE = 2

export type BrickCell = {
  alive: boolean
  power: BrickPower
  hits: number
}

export type BrickGrid = BrickCell[][]

export type BallState = {
  x: number
  y: number
  vx: number
  vy: number
  active: boolean
  power: BallPower
  powerTimer: number
}

export type TrailPoint = { x: number; y: number }

export type BrickParticle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
}

export type LaneEvent = 'paddle' | 'brick' | 'charge' | 'bonus' | 'armor' | 'life' | 'powerup'

export type PickupBanner = {
  label: string
  ttl: number
}

export type LaneState = {
  paddleX: number
  ball: BallState
  bricks: BrickGrid
  score: number
  bricksBroken: number
  particles: BrickParticle[]
  lives: number
  trail: TrailPoint[]
  serveCooldown: number
  drops: PowerDrop[]
  pickupBanner: PickupBanner | null
}

const PICKUP_BANNER_DURATION = 2.35

/** Düşen güçlendirme — toplandığında gösterilecek isim */
export function dropKindLabel(kind: DropKind): string {
  switch (kind) {
    case 'wide':
      return 'GENİŞ RAKET'
    case 'fast':
      return 'HIZLI TOP'
    case 'pierce':
      return 'DELİCİ TOP'
    default:
      return 'GÜÇLENDİRME'
  }
}

export function createBrickGrid(seed = 0): BrickGrid {
  const template: number[][] = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
  ]

  const mirror = seed % 2 === 0
  const rng = mulberry32(seed * 9973 + 17)

  return template.map((row, rowIndex) => {
    const shaped = mirror ? [...row].reverse() : row
    return shaped.map((cell) => {
      if (cell !== 1) return { alive: false, power: 'none' as const, hits: 0 }
      const roll = rng()
      let power: BrickPower = 'none'
      if (roll > 0.92) power = 'bonus'
      else if (roll > 0.82) power = 'armored'
      else if (roll > 0.68 && rowIndex <= 2) power = 'charged'
      return {
        alive: true,
        power,
        hits: power === 'armored' ? 0 : 0,
      }
    })
  })
}

export function createLane(seed = 0): LaneState {
  return {
    paddleX: 0.5,
    ball: {
      x: 0.5,
      y: 0.72,
      vx: 0,
      vy: 0,
      active: false,
      power: 'none',
      powerTimer: 0,
    },
    bricks: createBrickGrid(seed),
    score: 0,
    bricksBroken: 0,
    particles: [],
    lives: MAX_LIVES,
    trail: [],
    serveCooldown: 0.45,
    drops: [],
    pickupBanner: null,
  }
}

export function refillLaneBricks(lane: LaneState, seed: number): LaneState {
  return {
    ...lane,
    bricks: createBrickGrid(seed),
    drops: [],
    trail: [],
    serveCooldown: 0.55,
    ball: {
      x: lane.paddleX,
      y: 0.72,
      vx: 0,
      vy: 0,
      active: false,
      power: 'none',
      powerTimer: 0,
    },
  }
}

export function computeSpeedMultiplier(opts: {
  timeLeft: number
  roundSeconds: number
  round: number
  bricksBroken: number
}): number {
  const elapsedRatio = 1 - opts.timeLeft / opts.roundSeconds
  const timeBoost = elapsedRatio * 0.45
  const roundBoost = (opts.round - 1) * 0.08
  const brickBoost = Math.min(0.28, opts.bricksBroken * 0.0035)
  return 1 + timeBoost + roundBoost + brickBoost
}

export function updateLane(
  lane: LaneState,
  paddleDir: -1 | 0 | 1,
  dt: number,
  speedMult = 1,
): { lane: LaneState; events: LaneEvent[] } {
  const events: LaneEvent[] = []
  let pickupBanner = lane.pickupBanner
  if (pickupBanner) {
    const ttl = pickupBanner.ttl - dt
    pickupBanner = ttl > 0 ? { ...pickupBanner, ttl } : null
  }

  const effectivePaddleW =
    lane.ball.power === 'wide' && lane.ball.powerTimer > 0
      ? PADDLE_WIDTH * 1.38
      : PADDLE_WIDTH

  const next: LaneState = {
    ...lane,
    paddleX: clamp(
      lane.paddleX + paddleDir * dt * PADDLE_SPEED,
      effectivePaddleW / 2,
      1 - effectivePaddleW / 2,
    ),
    ball: { ...lane.ball, powerTimer: Math.max(0, lane.ball.powerTimer - dt) },
    bricks: lane.bricks.map((row) => row.map((cell) => ({ ...cell }))),
    particles: lane.particles
      .map((p) => ({
        ...p,
        x: p.x + p.vx * dt,
        y: p.y + p.vy * dt,
        vy: p.vy + dt * 0.35,
        life: p.life - dt,
      }))
      .filter((p) => p.life > 0),
    trail: [...lane.trail],
    serveCooldown: Math.max(0, lane.serveCooldown - dt),
    drops: lane.drops.map((drop) => ({
      ...drop,
      y: drop.y + dt * DROP_FALL_SPEED,
      wobble: drop.wobble + dt * 5,
    })),
    pickupBanner,
  }

  next.drops = next.drops.filter((drop) => drop.y < 1.06)
  collectPowerDrops(next, effectivePaddleW, events)

  if (next.ball.powerTimer <= 0 && next.ball.power !== 'none') {
    next.ball.power = 'none'
  }

  grazeChargeBricks(next, next.ball)

  if (!next.ball.active) {
    next.trail = []
    if (next.lives > 0 && next.serveCooldown <= 0) {
      next.ball = launchBall(next.paddleX, speedMult, next.ball.power !== 'none' ? next.ball.power : 'none')
    }
    return { lane: next, events }
  }

  let { x, y, vx, vy } = next.ball
  const ballSpeed = Math.hypot(vx, vy)
  let targetSpeed = BASE_BALL_SPEED * speedMult
  if (next.ball.power === 'fast' && next.ball.powerTimer > 0) targetSpeed *= 1.22

  if (ballSpeed > 0.001) {
    if (ballSpeed < targetSpeed * 0.92) {
      const scale = targetSpeed / ballSpeed
      vx *= scale
      vy *= scale
    } else if (ballSpeed > targetSpeed * 1.4) {
      const scale = (targetSpeed * 1.4) / ballSpeed
      vx *= scale
      vy *= scale
    }
  }

  x += vx * dt
  y += vy * dt

  next.trail = [{ x, y }, ...next.trail].slice(0, TRAIL_LENGTH)

  if (x <= BALL_RADIUS) {
    x = BALL_RADIUS
    vx = Math.abs(vx)
  } else if (x >= 1 - BALL_RADIUS) {
    x = 1 - BALL_RADIUS
    vx = -Math.abs(vx)
  }

  if (y <= BALL_RADIUS) {
    y = BALL_RADIUS
    vy = Math.abs(vy)
  }

  const paddleTop = PADDLE_Y - PADDLE_HEIGHT * 0.65
  const paddleLeft = next.paddleX - effectivePaddleW / 2
  const paddleRight = next.paddleX + effectivePaddleW / 2

  if (
    vy > 0 &&
    y + BALL_RADIUS >= paddleTop &&
    y - BALL_RADIUS <= PADDLE_Y + 0.015 &&
    x >= paddleLeft - BALL_RADIUS * 0.35 &&
    x <= paddleRight + BALL_RADIUS * 0.35
  ) {
    y = paddleTop - BALL_RADIUS
    const hit = clamp((x - next.paddleX) / (effectivePaddleW / 2), -1, 1)
    const angle = hit * 0.78
    const speed = targetSpeed * 1.05
    vx = Math.sin(angle) * speed
    vy = -Math.cos(angle) * speed
    events.push('paddle')
  }

  if (y > 1.05) {
    next.lives = Math.max(0, lane.lives - 1)
    next.trail = []
    next.ball = {
      x: next.paddleX,
      y: 0.75,
      vx: 0,
      vy: 0,
      active: false,
      power: 'none',
      powerTimer: 0,
    }
    next.serveCooldown = next.lives > 0 ? 0.85 : 0
    events.push('life')
    return { lane: next, events }
  }

  const brickHit = collideBricks(next.bricks, x, y, vx, vy, next.ball.power === 'pierce' && next.ball.powerTimer > 0)
  if (brickHit) {
    x = brickHit.x
    y = brickHit.y
    vx = brickHit.vx
    vy = brickHit.vy
    if (brickHit.event) events.push(brickHit.event)
    if (brickHit.broken) {
      next.score += brickHit.points
      next.bricksBroken += 1
      next.particles.push(
        ...spawnBrickParticles(brickHit.brickX, brickHit.brickY, brickHit.color),
      )
      if (brickHit.ballPower && brickHit.ballPower !== 'none') {
        applyBallPower(next, brickHit.ballPower)
      }
      maybeSpawnPowerDrop(next, brickHit.brickX, brickHit.brickY, brickHit.brickPower)
    }
  }

  next.ball = { ...next.ball, x, y, vx, vy, active: true }
  return { lane: next, events }
}

function grazeChargeBricks(lane: LaneState, ball: BallState) {
  if (!ball.active) return
  const col = Math.floor(ball.x * BRICK_COLS)
  const row = Math.floor(((ball.y - BRICK_ZONE_TOP) / BRICK_ZONE_HEIGHT) * BRICK_ROWS)
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      const r = row + dr
      const c = col + dc
      if (r < 0 || r >= BRICK_ROWS || c < 0 || c >= BRICK_COLS) continue
      const brick = lane.bricks[r][c]
      if (!brick.alive || brick.power !== 'none') continue
      const cx = (c + 0.5) / BRICK_COLS
      const cy = BRICK_ZONE_TOP + ((r + 0.5) / BRICK_ROWS) * BRICK_ZONE_HEIGHT
      const dist = Math.hypot(ball.x - cx, ball.y - cy)
      if (dist < 0.09 && Math.random() < 0.018) {
        lane.bricks[r][c] = { ...brick, power: 'charged' }
      }
    }
  }
}

function collideBricks(
  bricks: BrickGrid,
  x: number,
  y: number,
  vx: number,
  vy: number,
  pierce: boolean,
): {
  x: number
  y: number
  vx: number
  vy: number
  broken: boolean
  points: number
  brickX: number
  brickY: number
  color: string
  event?: LaneEvent
  ballPower?: BallPower
  brickPower: BrickPower
} | null {
  const col = Math.floor(x * BRICK_COLS)
  const row = Math.floor(((y - BRICK_ZONE_TOP) / BRICK_ZONE_HEIGHT) * BRICK_ROWS)
  if (row < 0 || row >= BRICK_ROWS || col < 0 || col >= BRICK_COLS) return null
  const brick = bricks[row][col]
  if (!brick.alive) return null

  const centerX = (col + 0.5) / BRICK_COLS
  const centerY = BRICK_ZONE_TOP + ((row + 0.5) / BRICK_ROWS) * BRICK_ZONE_HEIGHT
  const color = BRICK_COLORS[(row + col) % BRICK_COLORS.length]

  let nvx = vx
  let nvy = vy
  if (Math.abs(x - centerX) > Math.abs(y - centerY)) nvx = -nvx
  else nvy = -nvy

  if (brick.power === 'armored' && brick.hits < 1) {
    bricks[row][col] = { ...brick, hits: 1, power: 'charged' }
    return {
      x,
      y,
      vx: nvx,
      vy: nvy,
      broken: false,
      points: 0,
      brickX: centerX,
      brickY: centerY,
      color,
      event: 'armor',
      brickPower: brick.power,
    }
  }

  if (brick.power === 'none' && Math.random() < 0.22) {
    bricks[row][col] = { ...brick, power: 'charged' }
    return {
      x,
      y,
      vx: nvx,
      vy: nvy,
      broken: false,
      points: 0,
      brickX: centerX,
      brickY: centerY,
      color,
      event: 'charge',
      brickPower: 'none',
    }
  }

  bricks[row][col] = { alive: false, power: 'none', hits: 0 }

  let points = 50
  let event: LaneEvent = 'brick'
  let ballPower: BallPower | undefined

  if (brick.power === 'bonus') {
    points = 150
    event = 'bonus'
    ballPower = 'fast'
  } else if (brick.power === 'charged') {
    points = 90
    event = 'charge'
    ballPower = Math.random() > 0.5 ? 'wide' : 'pierce'
  }

  if (pierce) {
    nvx = vx
    nvy = vy
  }

  return {
    x,
    y,
    vx: nvx,
    vy: nvy,
    broken: true,
    points,
    brickX: centerX,
    brickY: centerY,
    color,
    event,
    ballPower,
    brickPower: brick.power,
  }
}

function maybeSpawnPowerDrop(lane: LaneState, x: number, y: number, brickPower: BrickPower) {
  if (lane.drops.length >= MAX_DROPS_PER_LANE) return

  let chance = 0.14
  if (brickPower === 'charged') chance = 0.36
  else if (brickPower === 'bonus') chance = 0.58
  else if (brickPower === 'armored') chance = 0.22

  if (Math.random() > chance) return

  const roll = Math.random()
  let kind: DropKind
  if (roll < 0.34) kind = 'wide'
  else if (roll < 0.67) kind = 'fast'
  else kind = 'pierce'

  lane.drops.push({
    x: clamp(x + (Math.random() - 0.5) * 0.04, 0.08, 0.92),
    y,
    kind,
    wobble: Math.random() * Math.PI * 2,
  })
}

function collectPowerDrops(lane: LaneState, paddleW: number, events: LaneEvent[]) {
  const paddleTop = PADDLE_Y - PADDLE_HEIGHT * 0.8
  const paddleBottom = PADDLE_Y + PADDLE_HEIGHT * 0.5
  const paddleLeft = lane.paddleX - paddleW / 2
  const paddleRight = lane.paddleX + paddleW / 2
  const dropRadius = 0.028

  lane.drops = lane.drops.filter((drop) => {
    const inX = drop.x >= paddleLeft - dropRadius && drop.x <= paddleRight + dropRadius
    const inY = drop.y >= paddleTop && drop.y <= paddleBottom + 0.04
    if (!inX || !inY) return true

    applyDropKind(lane, drop.kind)
    lane.pickupBanner = { label: dropKindLabel(drop.kind), ttl: PICKUP_BANNER_DURATION }
    events.push('powerup')
    return false
  })
}

function applyDropKind(lane: LaneState, kind: DropKind) {
  applyBallPower(lane, kind)
}

function applyBallPower(lane: LaneState, power: Exclude<BallPower, 'none'>) {
  lane.ball.power = power
  lane.ball.powerTimer = power === 'fast' ? 8 : power === 'wide' ? 10 : 5
}

function spawnBrickParticles(x: number, y: number, color: string): BrickParticle[] {
  return Array.from({ length: 10 }, () => ({
    x,
    y,
    vx: (Math.random() - 0.5) * 0.55,
    vy: (Math.random() - 0.5) * 0.55 - 0.15,
    life: 0.35 + Math.random() * 0.35,
    color,
  }))
}

function launchBall(paddleX: number, speedMult = 1, power: BallPower = 'none'): BallState {
  const angle = -0.72 - Math.random() * 0.28
  const speed = BASE_BALL_SPEED * speedMult
  return {
    x: paddleX,
    y: 0.72,
    vx: Math.sin(angle) * speed * 0.42,
    vy: Math.cos(angle) * speed,
    active: true,
    power,
    powerTimer: power === 'none' ? 0 : 5,
  }
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

export function botPaddleTarget(lane: LaneState): number {
  const w = lane.ball.power === 'wide' && lane.ball.powerTimer > 0 ? PADDLE_WIDTH * 1.38 : PADDLE_WIDTH

  const fallingDrop = lane.drops
    .filter((drop) => drop.y > 0.45)
    .sort((a, b) => b.y - a.y)[0]
  if (fallingDrop) {
    return clamp(fallingDrop.x, w / 2, 1 - w / 2)
  }

  if (!lane.ball.active) return lane.paddleX
  const predict = lane.ball.x + lane.ball.vx * 0.2
  return clamp(predict, w / 2, 1 - w / 2)
}

export function bricksRemaining(bricks: BrickGrid) {
  return bricks.reduce((sum, row) => sum + row.filter((cell) => cell.alive).length, 0)
}

export function getMatchWinner(lane1: LaneState, lane2: LaneState): 'p1' | 'p2' | 'draw' {
  if (lane1.score > lane2.score) return 'p1'
  if (lane2.score > lane1.score) return 'p2'
  return 'draw'
}
