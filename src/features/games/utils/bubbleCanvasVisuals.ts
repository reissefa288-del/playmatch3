import {
  COLOR_HEX,
  SPECIAL_KIND_META,
  bubblePos,
  type BubbleColor,
  type BubbleKind,
  type LaneState,
} from './bubbleShooterEngine'

/** Tek ışık kaynağı — sol üst */
export const BUBBLE_LIGHT = {
  hx: -0.34,
  hy: -0.36,
  bodyFx: 0.06,
  bodyFy: 0.1,
  specX: -0.26,
  specY: -0.3,
} as const

export const BUBBLE_RENDER_HEX: Record<BubbleColor, string> = {
  cyan: '#22c8ff',
  pink: '#ff3a78',
  yellow: '#ffd54a',
  green: '#42f090',
  purple: '#9d6cff',
}

const POP_DURATION = 0.28
const PLACE_DURATION = 0.22
const SPRITE_CACHE_MAX = 48

export type PopFx = { x: number; y: number; color: BubbleColor; age: number }

export type BubbleVisualState = {
  prevGrid: Map<string, BubbleColor>
  pops: PopFx[]
  placements: Map<string, number>
}

export function createBubbleVisualState(): BubbleVisualState {
  return {
    prevGrid: new Map(),
    pops: [],
    placements: new Map(),
  }
}

const FRAME_DT = 0.022

const COLOR_SHADES: Record<
  BubbleColor,
  { light: string; dark1: string; dark2: string; rgba20: string; rgba07: string }
> = buildColorShades()

function buildColorShades() {
  const out = {} as Record<
    BubbleColor,
    { light: string; dark1: string; dark2: string; rgba20: string; rgba07: string }
  >
  for (const [name, hex] of Object.entries(BUBBLE_RENDER_HEX) as [BubbleColor, string][]) {
    out[name] = {
      light: lighten(hex, 0.2),
      dark1: darken(hex, 0.08),
      dark2: darken(hex, 0.22),
      rgba20: hexToRgba(hex, 0.2),
      rgba07: hexToRgba(hex, 0.07),
    }
  }
  return out
}

const spriteCache = new Map<string, HTMLCanvasElement>()

export function syncBubbleVisuals(state: BubbleVisualState, lane: LaneState, w: number, h: number) {
  const grid = lane.grid

  for (const [key, color] of state.prevGrid) {
    if (!grid.has(key)) {
      const [row, col] = key.split(',').map(Number)
      const pos = bubblePos(row, col)
      state.pops.push({ x: pos.x * w, y: pos.y * h, color, age: 0 })
    }
  }

  for (const key of grid.keys()) {
    if (!state.prevGrid.has(key)) state.placements.set(key, 0)
  }

  for (const [key, age] of state.placements) {
    if (!grid.has(key)) {
      state.placements.delete(key)
      continue
    }
    const next = age + FRAME_DT
    if (next >= PLACE_DURATION) state.placements.delete(key)
    else state.placements.set(key, next)
  }

  state.pops = state.pops
    .map((p) => ({ ...p, age: p.age + FRAME_DT }))
    .filter((p) => p.age < POP_DURATION)
    .slice(-12)

  if (state.prevGrid.size > 0 && grid.size > 0) {
    let overlap = 0
    for (const key of grid.keys()) {
      if (state.prevGrid.has(key)) overlap += 1
    }
    if (overlap === 0) {
      state.pops = []
      state.placements.clear()
    }
  }

  state.prevGrid.clear()
  for (const [key, color] of grid) state.prevGrid.set(key, color)
}

export function placementScale(key: string, state: BubbleVisualState): number {
  const age = state.placements.get(key)
  if (age === undefined) return 1
  const t = age / PLACE_DURATION
  const overshoot = 1.14 - t * 0.14
  const ease = 1 - Math.pow(1 - t, 3)
  return 1 + (overshoot - 1) * (1 - ease)
}

export function canvasDpr(): number {
  return Math.min(window.devicePixelRatio || 1, 1.5)
}

export function prepareCanvasCtx(ctx: CanvasRenderingContext2D) {
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'low'
}

function hexBase(color: BubbleColor) {
  return BUBBLE_RENDER_HEX[color] ?? COLOR_HEX[color]
}

function hexToRgba(hex: string, alpha: number) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`
}

function lighten(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.min(255, ((n >> 16) & 255) + 255 * amount)
  const g = Math.min(255, ((n >> 8) & 255) + 255 * amount)
  const b = Math.min(255, (n & 255) + 255 * amount)
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`
}

function darken(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, ((n >> 16) & 255) * (1 - amount))
  const g = Math.max(0, ((n >> 8) & 255) * (1 - amount))
  const b = Math.max(0, (n & 255) * (1 - amount))
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`
}

function spriteKey(color: BubbleColor, radiusPx: number) {
  return `${color}-${radiusPx}`
}

function bakeBubbleSprite(color: BubbleColor, radiusPx: number): HTMLCanvasElement {
  const pad = Math.ceil(radiusPx * 0.14)
  const size = Math.ceil(radiusPx * 2 + pad * 2)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  paintBubbleBody(ctx, size / 2, size / 2, radiusPx, color, false, 'normal')
  return canvas
}

function getBubbleSprite(color: BubbleColor, radiusPx: number): HTMLCanvasElement {
  const rKey = Math.max(4, Math.round(radiusPx))
  const key = spriteKey(color, rKey)
  let sprite = spriteCache.get(key)
  if (!sprite) {
    sprite = bakeBubbleSprite(color, rKey)
    spriteCache.set(key, sprite)
    if (spriteCache.size > SPRITE_CACHE_MAX) {
      const oldest = spriteCache.keys().next().value
      if (oldest) spriteCache.delete(oldest)
    }
  }
  return sprite
}

/** Izgara topları — önbellekli blit */
export function drawBubbleCached(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: BubbleColor,
) {
  const sprite = getBubbleSprite(color, r)
  const d = r * 2.12
  ctx.drawImage(sprite, x - d / 2, y - d / 2, d, d)
}

/** Mermi / shooter — hafif canlı çizim (gölgesiz) */
export function drawBubbleLive(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: BubbleColor,
  kind: BubbleKind = 'normal',
) {
  paintBubbleBody(ctx, x, y, r, color, true, kind)
}

function paintBubbleBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: BubbleColor,
  live: boolean,
  kind: BubbleKind,
) {
  const hex = hexBase(color)
  const shades = COLOR_SHADES[color]
  const { hx, hy, bodyFx, bodyFy, specX, specY } = BUBBLE_LIGHT

  const halo = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 1.08)
  halo.addColorStop(0, shades.rgba20)
  halo.addColorStop(0.65, shades.rgba07)
  halo.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.arc(x, y, r * 1.05, 0, Math.PI * 2)
  ctx.fill()

  const bodyGrad = ctx.createRadialGradient(
    x + hx * r,
    y + hy * r,
    r * 0.04,
    x + bodyFx * r,
    y + bodyFy * r,
    r,
  )
  bodyGrad.addColorStop(0, live ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.9)')
  bodyGrad.addColorStop(0.15, shades.light)
  bodyGrad.addColorStop(0.45, hex)
  bodyGrad.addColorStop(0.75, shades.dark1)
  bodyGrad.addColorStop(1, shades.dark2)
  ctx.fillStyle = bodyGrad
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()

  const bottom = ctx.createLinearGradient(x, y - r * 0.15, x, y + r)
  bottom.addColorStop(0, 'rgba(0,0,0,0)')
  bottom.addColorStop(1, 'rgba(0,0,0,0.2)')
  ctx.fillStyle = bottom
  ctx.beginPath()
  ctx.arc(x, y, r * 0.98, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'rgba(255,255,255,0.42)'
  ctx.beginPath()
  ctx.arc(x + specX * r * 0.7, y + specY * r * 0.72, r * 0.28, 0, Math.PI * 2)
  ctx.fill()

  if (kind !== 'normal') drawSpecialKindOverlay(ctx, x, y, r, kind)
}

function drawSpecialKindOverlay(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  kind: Exclude<BubbleKind, 'normal'>,
) {
  const meta = SPECIAL_KIND_META[kind]
  const { specX, specY } = BUBBLE_LIGHT

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const glow = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 1.15)
  glow.addColorStop(0, meta.glow)
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(x, y, r * 1.12, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'

  if (kind === 'fire') {
    ctx.strokeStyle = meta.hex
    ctx.lineWidth = Math.max(1.6, r * 0.14)
    ctx.shadowColor = meta.glow
    ctx.shadowBlur = r * 0.35
    ctx.beginPath()
    ctx.arc(x, y, r * 0.9, 0, Math.PI * 2)
    ctx.stroke()
    ctx.shadowBlur = 0
    ctx.fillStyle = meta.hex
    ctx.beginPath()
    ctx.moveTo(x, y - r * 0.42)
    ctx.quadraticCurveTo(x + r * 0.28, y - r * 0.02, x, y + r * 0.18)
    ctx.quadraticCurveTo(x - r * 0.28, y - r * 0.02, x, y - r * 0.42)
    ctx.fill()
  } else if (kind === 'bomb') {
    ctx.strokeStyle = meta.hex
    ctx.lineWidth = Math.max(1.4, r * 0.12)
    ctx.beginPath()
    ctx.arc(x, y - r * 0.06, r * 0.34, 0, Math.PI * 2)
    ctx.stroke()
    ctx.strokeStyle = 'rgba(255,230,245,0.85)'
    ctx.lineWidth = Math.max(1.2, r * 0.08)
    ctx.beginPath()
    ctx.moveTo(x + r * 0.08, y - r * 0.4)
    ctx.lineTo(x + r * 0.18, y - r * 0.56)
    ctx.lineTo(x + r * 0.02, y - r * 0.48)
    ctx.stroke()
    ctx.fillStyle = 'rgba(255,120,180,0.35)'
    ctx.beginPath()
    ctx.arc(x, y, r * 0.5, 0, Math.PI * 2)
    ctx.fill()
  } else if (kind === 'rainbow') {
    ctx.strokeStyle = meta.hex
    ctx.lineWidth = Math.max(1.5, r * 0.12)
    ctx.beginPath()
    ctx.arc(x, y, r * 0.86, 0, Math.PI * 2)
    ctx.stroke()
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'
    ctx.lineWidth = Math.max(1, r * 0.06)
    ctx.beginPath()
    ctx.arc(x, y, r * 0.72, Math.PI * 0.15, Math.PI * 1.15)
    ctx.stroke()
    ctx.fillStyle = 'rgba(255,255,255,0.82)'
    ctx.beginPath()
    ctx.arc(x + specX * r * 0.35, y + specY * r * 0.35, r * 0.11, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.strokeStyle = meta.hex
    ctx.lineWidth = Math.max(1.3, r * 0.11)
    for (let i = 0; i < 6; i += 1) {
      const ang = (i / 6) * Math.PI * 2 - Math.PI / 2
      ctx.beginPath()
      ctx.moveTo(x + Math.cos(ang) * r * 0.2, y + Math.sin(ang) * r * 0.2)
      ctx.lineTo(x + Math.cos(ang) * r * 0.54, y + Math.sin(ang) * r * 0.54)
      ctx.stroke()
    }
    ctx.fillStyle = 'rgba(245,252,255,0.9)'
    ctx.beginPath()
    ctx.arc(x, y, r * 0.14, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

export function drawPopEffects(ctx: CanvasRenderingContext2D, pops: PopFx[], r: number, dpr: number) {
  for (const pop of pops) {
    const t = pop.age / POP_DURATION
    const hex = hexBase(pop.color)
    const expand = 1 + t * 0.5
    const alpha = (1 - t) * (1 - t)
    if (alpha <= 0.02) continue

    ctx.save()
    ctx.globalAlpha = alpha * 0.9
    ctx.strokeStyle = hexToRgba(hex, 0.85)
    ctx.lineWidth = Math.max(1, (2 - t * 1.1) * dpr)
    ctx.beginPath()
    ctx.arc(pop.x, pop.y, r * expand, 0, Math.PI * 2)
    ctx.stroke()

    ctx.globalAlpha = alpha * 0.35
    ctx.fillStyle = hexToRgba(hex, 0.35)
    ctx.beginPath()
    ctx.arc(pop.x, pop.y, r * expand * 0.65, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

export function drawSparkParticles(
  ctx: CanvasRenderingContext2D,
  particles: LaneState['particles'],
  w: number,
  h: number,
  dpr: number,
) {
  const max = Math.min(particles.length, 28)
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < max; i += 1) {
    const particle = particles[i]!
    const alpha = Math.min(1, particle.life * 2.4)
    if (alpha < 0.05) continue
    const px = particle.x * w
    const py = particle.y * h
    const speed = Math.hypot(particle.vx, particle.vy)
    const size = (2 + alpha * 2.8) * dpr

    ctx.globalAlpha = alpha
    if (speed > 0.18) {
      const nx = particle.vx / speed
      const ny = particle.vy / speed
      const len = size * (2.2 + alpha)
      const g = ctx.createLinearGradient(px, py, px - nx * len, py - ny * len)
      g.addColorStop(0, particle.color)
      g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.strokeStyle = g
      ctx.lineWidth = size * 0.85
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(px, py)
      ctx.lineTo(px - nx * len, py - ny * len)
      ctx.stroke()
    }
    ctx.fillStyle = particle.color
    ctx.beginPath()
    ctx.arc(px, py, size, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
  ctx.globalAlpha = 1
}

/** Eski API — yönlendirme */
export function drawBubbleSphere(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: BubbleColor,
  _dpr: number,
  active: boolean,
  kind: BubbleKind = 'normal',
) {
  if (!active && kind === 'normal') {
    drawBubbleCached(ctx, x, y, r, color)
    return
  }
  drawBubbleLive(ctx, x, y, r, color, kind)
}
