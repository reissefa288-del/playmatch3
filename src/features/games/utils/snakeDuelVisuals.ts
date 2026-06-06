import {
  COLS,
  ROWS,
  DIAMOND_LIFETIME_TICKS,
  colOf,
  isInvincible,
  rowOf,
  type Direction,
  type PickupKind,
  type SnakeLaneState,
} from './snakeDuelEngine'

export type SnakeAccent = 'cyan' | 'pink'

export type ArenaDrawOpts = {
  blend?: number
  prevBody?: number[] | null
  nowMs?: number
}

type Pt = { cx: number; cy: number }

type SnakePalette = {
  bodyA: string
  bodyB: string
  headA: string
  headB: string
  glow: string
  rim: string
  eye: string
}

type ArenaPalette = {
  bg0: string
  bg1: string
  cellA: string
  cellB: string
  grid: string
  border: string
  glow: string
  portal: string
  scan: string
  bracket: string
}

const ARENA: Record<SnakeAccent, ArenaPalette> = {
  cyan: {
    bg0: '#030810',
    bg1: '#0a1424',
    cellA: 'rgba(10, 24, 48, 0.94)',
    cellB: 'rgba(6, 16, 34, 0.98)',
    grid: 'rgba(59, 130, 246, 0.11)',
    border: 'rgba(96, 165, 250, 0.42)',
    glow: 'rgba(37, 99, 235, 0.28)',
    portal: 'rgba(59, 130, 246, 0.62)',
    scan: 'rgba(147, 197, 253, 0.14)',
    bracket: 'rgba(96, 165, 250, 0.75)',
  },
  pink: {
    bg0: '#100510',
    bg1: '#1a0816',
    cellA: 'rgba(38, 10, 30, 0.94)',
    cellB: 'rgba(24, 6, 20, 0.98)',
    grid: 'rgba(244, 114, 182, 0.11)',
    border: 'rgba(244, 114, 182, 0.42)',
    glow: 'rgba(219, 39, 119, 0.28)',
    portal: 'rgba(244, 114, 182, 0.62)',
    scan: 'rgba(251, 207, 232, 0.12)',
    bracket: 'rgba(244, 114, 182, 0.75)',
  },
}

const SNAKE: Record<SnakeAccent, SnakePalette> = {
  cyan: {
    bodyA: '#7dd3fc',
    bodyB: '#2563eb',
    headA: '#bae6fd',
    headB: '#1d4ed8',
    glow: 'rgba(59, 130, 246, 0.65)',
    rim: 'rgba(219, 234, 254, 0.9)',
    eye: '#ffffff',
  },
  pink: {
    bodyA: '#f9a8d4',
    bodyB: '#ec4899',
    headA: '#fce7f3',
    headB: '#db2777',
    glow: 'rgba(244, 114, 182, 0.65)',
    rim: 'rgba(253, 242, 248, 0.9)',
    eye: '#ffffff',
  },
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rad = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rad, y)
  ctx.arcTo(x + w, y, x + w, y + h, rad)
  ctx.arcTo(x + w, y + h, x, y + h, rad)
  ctx.arcTo(x, y + h, x, y, rad)
  ctx.arcTo(x, y, x + w, y, rad)
  ctx.closePath()
}

function lerpCell(from: number, to: number, t: number, cellW: number, cellH: number): Pt {
  let fc = colOf(from)
  let fr = rowOf(from)
  let dc = colOf(to) - fc
  let dr = rowOf(to) - fr
  if (dc > COLS / 2) dc -= COLS
  if (dc < -COLS / 2) dc += COLS
  if (dr > ROWS / 2) dr -= ROWS
  if (dr < -ROWS / 2) dr += ROWS
  const c = fc + dc * t
  const r = fr + dr * t
  return { cx: (c + 0.5) * cellW, cy: (r + 0.5) * cellH }
}

function cellRectAt(cx: number, cy: number, cellW: number, cellH: number, pad: number) {
  const w = cellW - pad * 2
  const h = cellH - pad * 2
  return { x: cx - w / 2, y: cy - h / 2, w, h, cx, cy }
}

function lerpColor(a: string, b: string, t: number) {
  const parse = (hex: string) => {
    const h = hex.replace('#', '')
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }
  const [r1, g1, b1] = parse(a)
  const [r2, g2, b2] = parse(b)
  const m = (n1: number, n2: number) => Math.round(n1 + (n2 - n1) * t)
  return `rgb(${m(r1, r2)}, ${m(g1, g2)}, ${m(b1, b2)})`
}

function drawArenaBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pal: ArenaPalette,
  simTick: number,
  nowMs: number,
) {
  const cellW = w / COLS
  const cellH = h / ROWS
  const pulse = 0.5 + 0.5 * Math.sin(simTick * 0.04)

  const bg = ctx.createLinearGradient(0, 0, w * 0.2, h)
  bg.addColorStop(0, pal.bg0)
  bg.addColorStop(1, pal.bg1)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  const glow = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, w * 0.75)
  glow.addColorStop(0, pal.glow)
  glow.addColorStop(1, 'transparent')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      ctx.fillStyle = (row + col) % 2 === 0 ? pal.cellA : pal.cellB
      ctx.fillRect(col * cellW, row * cellH, cellW, cellH)
    }
  }

  ctx.strokeStyle = pal.grid
  ctx.lineWidth = 1
  for (let c = 1; c < COLS; c += 1) {
    const x = c * cellW
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
    ctx.stroke()
  }
  for (let r = 1; r < ROWS; r += 1) {
    const y = r * cellH
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }

  const edge = Math.max(2, Math.min(cellW, cellH) * 0.38)
  ctx.save()
  ctx.globalAlpha = 0.16 + pulse * 0.14
  for (const [x, y, rw, rh] of [
    [0, 0, w, edge],
    [0, h - edge, w, edge],
    [0, 0, edge, h],
    [w - edge, 0, edge, h],
  ] as const) {
    const g = ctx.createLinearGradient(x, y, x + rw, y + rh)
    g.addColorStop(0, pal.portal)
    g.addColorStop(1, 'transparent')
    ctx.fillStyle = g
    ctx.fillRect(x, y, rw, rh)
  }
  ctx.restore()

  const scanY = ((nowMs * 0.022) % (h + 60)) - 30
  const scan = ctx.createLinearGradient(0, scanY, 0, scanY + 18)
  scan.addColorStop(0, 'transparent')
  scan.addColorStop(0.5, pal.scan)
  scan.addColorStop(1, 'transparent')
  ctx.save()
  ctx.globalAlpha = 0.55
  ctx.fillStyle = scan
  ctx.fillRect(0, scanY, w, 18)
  ctx.restore()

  ctx.strokeStyle = pal.border
  ctx.lineWidth = 2
  ctx.strokeRect(1.5, 1.5, w - 3, h - 3)

  const bl = Math.min(w, h) * 0.07
  ctx.strokeStyle = pal.bracket
  ctx.lineWidth = 2
  ctx.lineCap = 'square'
  for (const [x1, y1, x2, y2, x3, y3] of [
    [4, 4, 4, 4 + bl, 4 + bl, 4],
    [w - 4, 4, w - 4 - bl, 4, w - 4, 4 + bl],
    [4, h - 4, 4, h - 4 - bl, 4 + bl, h - 4],
    [w - 4, h - 4, w - 4, h - 4 - bl, w - 4 - bl, h - 4],
  ] as const) {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(x3, y3)
    ctx.stroke()
  }

  ctx.save()
  ctx.globalAlpha = 0.035
  ctx.fillStyle = '#fff'
  for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1)
  ctx.restore()
}

function drawFood(
  ctx: CanvasRenderingContext2D,
  index: number,
  cellW: number,
  cellH: number,
  simTick: number,
) {
  const { cx, cy } = lerpCell(index, index, 1, cellW, cellH)
  const pad = Math.max(1, Math.min(cellW, cellH) * 0.14)
  const { x, y, w, h } = cellRectAt(cx, cy, cellW, cellH, pad)
  const pulse = 1 + Math.sin(simTick * 0.24) * 0.08

  ctx.save()
  ctx.shadowColor = 'rgba(250, 204, 21, 0.75)'
  ctx.shadowBlur = Math.min(w, h) * 0.9

  const glow = ctx.createLinearGradient(x, y, x + w, y + h * pulse)
  glow.addColorStop(0, '#fffef0')
  glow.addColorStop(0.45, '#fde047')
  glow.addColorStop(1, '#ca8a04')
  ctx.fillStyle = glow
  ctx.fillRect(x, y - (h * (pulse - 1)) / 2, w, h * pulse)

  ctx.shadowBlur = 0
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.fillRect(cx - w * 0.12, cy - h * 0.18, w * 0.22, h * 0.22)
  ctx.restore()
}

function drawDiamond(
  ctx: CanvasRenderingContext2D,
  index: number,
  cellW: number,
  cellH: number,
  accent: SnakeAccent,
  ticksLeft: number,
  simTick: number,
) {
  const { cx, cy } = lerpCell(index, index, 1, cellW, cellH)
  const base = Math.min(cellW, cellH) * 0.38
  const urgent = ticksLeft <= 8
  const pulse = 1 + (urgent ? Math.sin(simTick * 0.58) * 0.14 : Math.sin(simTick * 0.2) * 0.06)
  const size = base * pulse
  const spin = simTick * 0.055 + (urgent ? Math.sin(simTick * 0.3) * 0.08 : 0)

  const gem =
    accent === 'cyan'
      ? { top: '#f0f9ff', side: '#38bdf8', deep: '#0369a1', glow: 'rgba(56, 189, 248, 0.85)' }
      : { top: '#fdf2f8', side: '#f472b6', deep: '#be185d', glow: 'rgba(244, 114, 182, 0.85)' }

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(spin)

  ctx.shadowColor = gem.glow
  ctx.shadowBlur = size * (urgent ? 2.2 : 1.6)
  const aura = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2)
  aura.addColorStop(0, gem.glow)
  aura.addColorStop(0.55, 'rgba(255,255,255,0.12)')
  aura.addColorStop(1, 'transparent')
  ctx.fillStyle = aura
  ctx.beginPath()
  ctx.arc(0, 0, size * 2, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(0, -size)
  ctx.lineTo(size * 0.84, -size * 0.1)
  ctx.lineTo(0, size * 0.94)
  ctx.lineTo(-size * 0.84, -size * 0.1)
  ctx.closePath()
  const body = ctx.createLinearGradient(-size, -size, size, size)
  body.addColorStop(0, gem.top)
  body.addColorStop(0.45, gem.side)
  body.addColorStop(1, gem.deep)
  ctx.fillStyle = body
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'
  ctx.lineWidth = Math.max(1, size * 0.09)
  ctx.stroke()

  ctx.shadowBlur = 0
  ctx.fillStyle = 'rgba(255,255,255,0.82)'
  ctx.beginPath()
  ctx.moveTo(0, -size * 0.58)
  ctx.lineTo(size * 0.34, -size * 0.2)
  ctx.lineTo(0, -size * 0.02)
  ctx.lineTo(-size * 0.34, -size * 0.2)
  ctx.closePath()
  ctx.fill()

  const ringPct = ticksLeft / DIAMOND_LIFETIME_TICKS
  ctx.strokeStyle = urgent ? '#fde047' : 'rgba(255,255,255,0.8)'
  ctx.lineWidth = Math.max(1.5, size * 0.11)
  ctx.beginPath()
  ctx.arc(0, 0, size * 1.25, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ringPct)
  ctx.stroke()

  ctx.restore()
}

function drawSegment(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  colorA: string,
  colorB: string,
  glow: string,
  rim: string,
  square: boolean,
  withGlow: boolean,
) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h)
  g.addColorStop(0, colorA)
  g.addColorStop(1, colorB)
  ctx.save()
  if (withGlow) {
    ctx.shadowColor = glow
    ctx.shadowBlur = square ? Math.max(4, w * 0.35) : Math.max(5, w * 0.22)
  }
  if (square) {
    ctx.fillStyle = g
    ctx.fillRect(x, y, w, h)
    ctx.shadowBlur = 0
    ctx.strokeStyle = rim
    ctx.lineWidth = Math.max(0.6, w * 0.06)
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1)
  } else {
    const radius = Math.max(2, Math.min(w, h) * 0.22)
    roundRect(ctx, x, y, w, h, radius)
    ctx.fillStyle = g
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.strokeStyle = rim
    ctx.lineWidth = Math.max(0.8, radius * 0.11)
    ctx.stroke()
  }
  ctx.restore()
}

function mouthOpenAmount(lane: SnakeLaneState): { amount: number; kind: PickupKind | null } {
  const fx = lane.pickupFx
  if (!fx || !lane.alive) return { amount: 0, kind: null }
  const age = lane.simTick - fx.tick
  if (age < 0 || age >= 14) return { amount: 0, kind: null }
  const p = age / 14
  let amount: number
  if (p < 0.18) amount = p / 0.18
  else if (p < 0.42) amount = 1
  else amount = 1 - (p - 0.42) / 0.58
  return { amount: amount ** 0.9, kind: fx.kind }
}

function drawHeadMouth(
  ctx: CanvasRenderingContext2D,
  dir: Direction,
  cx: number,
  cy: number,
  w: number,
  h: number,
  amount: number,
  kind: PickupKind,
) {
  if (amount <= 0.03) return

  const s = Math.min(w, h)
  const gap = s * 0.42 * amount
  const mouthSpan = s * 0.56
  const inner = kind === 'diamond' ? '#38bdf8' : '#fbbf24'
  const deep = kind === 'diamond' ? '#082f49' : '#451a03'
  const tongue = kind === 'diamond' ? '#e0f2fe' : '#fef08a'

  let mx: number
  let my: number
  let mw: number
  let mh: number

  if (dir === 'up') {
    mw = mouthSpan
    mh = gap
    mx = cx - mw / 2
    my = cy - s / 2
  } else if (dir === 'down') {
    mw = mouthSpan
    mh = gap
    mx = cx - mw / 2
    my = cy + s / 2 - mh
  } else if (dir === 'left') {
    mw = gap
    mh = mouthSpan
    mx = cx - s / 2
    my = cy - mh / 2
  } else {
    mw = gap
    mh = mouthSpan
    mx = cx + s / 2 - mw
    my = cy - mh / 2
  }

  ctx.save()
  ctx.fillStyle = deep
  ctx.fillRect(mx, my, mw, mh)
  const inset = Math.max(1, s * 0.07 * amount)
  ctx.fillStyle = inner
  ctx.fillRect(mx + inset, my + inset, Math.max(0, mw - inset * 2), Math.max(0, mh - inset * 2))

  if (amount > 0.5) {
    ctx.fillStyle = tongue
    const tw = Math.max(2, mw * 0.32)
    const th = Math.max(2, mh * 0.32)
    const shift =
      dir === 'up' ? -s * 0.1 : dir === 'down' ? s * 0.1 : dir === 'left' ? -s * 0.08 : s * 0.08
    const tx = dir === 'left' || dir === 'right' ? cx + shift : cx - tw / 2
    const ty = dir === 'up' || dir === 'down' ? cy + shift : cy - th / 2
    ctx.fillRect(tx, ty, tw, th)
  }
  ctx.restore()
}

function drawHeadEyes(
  ctx: CanvasRenderingContext2D,
  dir: Direction,
  cx: number,
  cy: number,
  size: number,
  eyeColor: string,
  mouthOpen = 0,
) {
  const eyeS = size * 0.22
  const off = size * 0.22
  const pull = mouthOpen * size * 0.14
  const eyes: [number, number][] =
    dir === 'up'
      ? [
          [cx - off, cy - off * 0.55 + pull],
          [cx + off, cy - off * 0.55 + pull],
        ]
      : dir === 'down'
        ? [
            [cx - off, cy + off * 0.55 - pull],
            [cx + off, cy + off * 0.55 - pull],
          ]
        : dir === 'left'
          ? [
              [cx - off * 0.55 + pull, cy - off * 0.45],
              [cx - off * 0.55 + pull, cy + off * 0.45],
            ]
          : [
              [cx + off * 0.55 - pull, cy - off * 0.45],
              [cx + off * 0.55 - pull, cy + off * 0.45],
            ]

  for (const [ex, ey] of eyes) {
    ctx.fillStyle = '#0a1020'
    ctx.fillRect(ex - eyeS / 2, ey - eyeS / 2, eyeS, eyeS)
    ctx.fillStyle = eyeColor
    ctx.fillRect(ex - eyeS * 0.18, ey - eyeS * 0.28, eyeS * 0.42, eyeS * 0.42)
  }
}

function renderPoints(
  lane: SnakeLaneState,
  prevBody: number[] | null,
  blend: number,
  cellW: number,
  cellH: number,
): Pt[] {
  const t = Math.max(0, Math.min(1, blend))
  if (!prevBody || t >= 0.999 || !lane.alive) {
    return lane.body.map((i) => lerpCell(i, i, 1, cellW, cellH))
  }
  return lane.body.map((to, i) => {
    const from = prevBody[i] ?? to
    return lerpCell(from, to, t, cellW, cellH)
  })
}

function drawSnake(
  ctx: CanvasRenderingContext2D,
  lane: SnakeLaneState,
  colors: SnakePalette,
  cellW: number,
  cellH: number,
  points: Pt[],
) {
  if (points.length === 0) return

  const cell = Math.min(cellW, cellH)
  const pad = 0
  const mouth = mouthOpenAmount(lane)
  const inv = isInvincible(lane)
  const alpha = lane.alive ? (inv ? 0.5 + Math.sin(lane.simTick * 0.95) * 0.38 : 1) : 0.38

  ctx.save()
  ctx.globalAlpha = alpha
  if (!lane.alive) ctx.filter = 'grayscale(0.4) brightness(0.82)'

  if (lane.alive && points.length > 0) {
    const head = points[0]!
    ctx.save()
    ctx.globalAlpha = 0.18
    ctx.fillStyle = colors.glow
    const glowS = cell * 0.92
    ctx.fillRect(head.cx - glowS / 2, head.cy - glowS / 2, glowS, glowS)
    ctx.restore()
  }

  for (let i = points.length - 1; i >= 0; i -= 1) {
    const isHead = i === 0
    const segT = 1 - i / Math.max(points.length - 1, 1)
    const { cx, cy } = points[i]!
    let { x, y, w, h } = cellRectAt(cx, cy, cellW, cellH, pad)

    if (isHead && mouth.amount > 0.05) {
      const stretch = mouth.amount * cell * 0.1
      if (lane.direction === 'up') y -= stretch
      else if (lane.direction === 'down') h += stretch
      else if (lane.direction === 'left') x -= stretch
      else w += stretch
    }

    const bodyMix = segT * 0.35
    const colorA = isHead ? colors.headA : lerpColor(colors.bodyA, colors.bodyB, bodyMix)
    const colorB = isHead ? colors.headB : lerpColor(colors.bodyB, colors.headB, bodyMix * 0.5)

    drawSegment(
      ctx,
      x,
      y,
      w,
      h,
      colorA,
      colorB,
      colors.glow,
      colors.rim,
      true,
      isHead || i < 4,
    )

    if (isHead && lane.alive) {
      const faceSize = Math.min(w, h)
      if (mouth.amount > 0.03 && mouth.kind) {
        drawHeadMouth(ctx, lane.direction, cx, cy, w, h, mouth.amount, mouth.kind)
      }
      drawHeadEyes(ctx, lane.direction, cx, cy, faceSize, colors.eye, mouth.amount)
    }
  }

  ctx.restore()
}

function drawPickupBurst(
  ctx: CanvasRenderingContext2D,
  lane: SnakeLaneState,
  accent: SnakeAccent,
  cellW: number,
  cellH: number,
) {
  const fx = lane.pickupFx
  if (!fx || lane.simTick - fx.tick >= 14) return

  const age = lane.simTick - fx.tick + ((performance.now() % 120) / 120) * 0.4
  const alpha = Math.max(0, 1 - age / 14)
  const { cx, cy } = lerpCell(fx.cell, fx.cell, 1, cellW, cellH)
  const base = Math.min(cellW, cellH) * 0.45
  const pal = accent === 'cyan' ? '#60a5fa' : '#f472b6'
  const core = fx.kind === 'diamond' ? '#e0f2fe' : '#fde047'

  ctx.save()
  ctx.globalAlpha = alpha * 0.65
  ctx.strokeStyle = pal
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, base * (0.6 + age * 0.12), 0, Math.PI * 2)
  ctx.stroke()

  ctx.globalAlpha = alpha * 0.5
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2 + age * 0.5
    const len = base * (0.5 + age * 0.15)
    ctx.strokeStyle = fx.kind === 'diamond' ? pal : core
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len)
    ctx.stroke()
  }

  ctx.globalAlpha = alpha * 0.75
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, base * 0.55)
  g.addColorStop(0, '#fff')
  g.addColorStop(0.4, core)
  g.addColorStop(1, 'transparent')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(cx, cy, base * 0.55, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export function drawSnakeArena(
  ctx: CanvasRenderingContext2D,
  lane: SnakeLaneState,
  accent: SnakeAccent,
  width: number,
  height: number,
  opts: ArenaDrawOpts = {},
) {
  const blend = opts.blend ?? 1
  const prevBody = opts.prevBody ?? null
  const nowMs = opts.nowMs ?? performance.now()
  const cellW = width / COLS
  const cellH = height / ROWS
  const arena = ARENA[accent]
  const snake = SNAKE[accent]

  ctx.clearRect(0, 0, width, height)
  drawArenaBackground(ctx, width, height, arena, lane.simTick, nowMs)

  if (lane.food >= 0) {
    drawFood(ctx, lane.food, cellW, cellH, lane.simTick)
  }

  if (lane.diamond !== null) {
    drawDiamond(ctx, lane.diamond, cellW, cellH, accent, lane.diamondTicks, lane.simTick)
  }

  const points = renderPoints(lane, prevBody, blend, cellW, cellH)
  drawSnake(ctx, lane, snake, cellW, cellH, points)
  drawPickupBurst(ctx, lane, accent, cellW, cellH)
}
