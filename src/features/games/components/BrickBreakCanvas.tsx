import { useEffect, useRef, type RefObject } from 'react'
import { canvasDprCap } from '../../../shared/canvasDpr'
import { releaseCanvas } from '../../../shared/releaseCanvas'
import {
  BALL_RADIUS,
  BRICK_COLORS,
  BRICK_COLS,
  BRICK_ROWS,
  BRICK_ZONE_HEIGHT,
  BRICK_ZONE_TOP,
  getBallHeat,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_Y,
  type BrickPower,
  type DropKind,
  type LaneState,
} from '../utils/brickBreakEngine'

type BrickBreakCanvasProps = {
  laneRef: RefObject<LaneState>
  accent: 'cyan' | 'pink'
  active?: boolean
}

const SIZE_CACHE = { w: 0, h: 0, dpr: 1 }

/** İki arena da pembe ekrandaki gibi parlak top */
const BALL_SKIN = {
  highlight: '#ffffff',
  shell: '#fff4fa',
  body: '#ff6eb5',
  deep: '#ff2d9a',
  rim: 'rgba(160, 20, 90, 0.45)',
  glow: 'rgba(255, 45, 154, 0.95)',
  trail: 'rgba(255, 130, 190, 0.55)',
} as const

function canvasDpr() {
  return canvasDprCap()
}

export function BrickBreakCanvas({ laneRef, accent, active = true }: BrickBreakCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const accentRef = useRef(accent)
  const activeRef = useRef(active)
  accentRef.current = accent
  activeRef.current = active

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let raf = 0
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'low'

    const resize = () => {
      const dpr = canvasDpr()
      const rect = canvas.getBoundingClientRect()
      const w = Math.max(1, Math.floor(rect.width * dpr))
      const h = Math.max(1, Math.floor(rect.height * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      SIZE_CACHE.w = w
      SIZE_CACHE.h = h
      SIZE_CACHE.dpr = dpr
    }

    resize()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null
    ro?.observe(canvas)

    const drawFrame = () => {
      const lane = laneRef.current
      if (!lane) return

      const { w, h, dpr } = SIZE_CACHE
      if (w < 1 || h < 1) return

      ctx.clearRect(0, 0, w, h)

      const accentNow = accentRef.current
      const paddleColor = accentNow === 'cyan' ? '#00e8ff' : '#ff2d9a'
      const paddleGlow = accentNow === 'cyan' ? 'rgba(0, 232, 255, 0.9)' : 'rgba(255, 45, 154, 0.9)'
      const brickZoneTop = h * BRICK_ZONE_TOP
      const brickZoneH = h * BRICK_ZONE_HEIGHT
      const rowH = brickZoneH / BRICK_ROWS
      const colW = w / BRICK_COLS

      drawArenaDepth(ctx, w, h, accentNow)

      for (let row = 0; row < BRICK_ROWS; row += 1) {
        for (let col = 0; col < BRICK_COLS; col += 1) {
          const cell = lane.bricks[row][col]
          if (!cell.alive) continue
          const color = BRICK_COLORS[(row + col) % BRICK_COLORS.length]
          drawBrick(ctx, col, row, colW, rowH, brickZoneTop, color, cell.power, dpr)
        }
      }

      for (const drop of lane.drops) {
        drawPowerDrop(ctx, drop.x * w, drop.y * h, drop.kind, drop.wobble, accentNow, dpr)
      }

      const particleMax = Math.min(lane.particles.length, 22)
      for (let i = 0; i < particleMax; i += 1) {
        const particle = lane.particles[i]!
        const alpha = Math.min(1, particle.life * 2.5)
        if (alpha < 0.06) continue
        ctx.globalAlpha = alpha
        ctx.fillStyle = particle.color
        ctx.fillRect(
          particle.x * w - 1.2 * dpr,
          particle.y * h - 1.2 * dpr,
          2.4 * dpr,
          2.4 * dpr,
        )
      }
      ctx.globalAlpha = 1

      const paddleW =
        lane.ball.power === 'wide' && lane.ball.powerTimer > 0 ? PADDLE_WIDTH * 1.38 * w : PADDLE_WIDTH * w
      drawPaddle(
        ctx,
        lane.paddleX * w,
        PADDLE_Y * h,
        paddleW,
        h * PADDLE_HEIGHT,
        paddleColor,
        paddleGlow,
        accentNow,
        dpr,
      )

      if (lane.ball.active) {
        const heat = getBallHeat(lane.ball.vx, lane.ball.vy, lane.ball.power)
        const powerHeat = lane.ball.power === 'fast' && lane.ball.powerTimer > 0 ? 0.35 : 0
        const totalHeat = Math.min(1, heat + powerHeat)
        drawBallTrail(ctx, lane, w, h, dpr, totalHeat)
        drawBall(ctx, lane, w, h, dpr, totalHeat)
      } else if (lane.lives > 0 && lane.serveCooldown > 0) {
        const bx = lane.paddleX * w
        const by = lane.ball.y * h
        const alpha = 0.35 + Math.sin(lane.serveCooldown * 12) * 0.2
        ctx.globalAlpha = alpha
        ctx.fillStyle = paddleColor
        ctx.shadowColor = paddleGlow
        ctx.shadowBlur = 12 * dpr
        ctx.beginPath()
        ctx.arc(bx, by, BALL_RADIUS * w * 1.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
      }
    }

    const loop = () => {
      if (!activeRef.current) return
      drawFrame()
      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      ro?.disconnect()
      releaseCanvas(canvas)
    }
  }, [active, laneRef])

  return <canvas ref={canvasRef} className="pm-brick-arena__canvas" />
}

function drawBall(
  ctx: CanvasRenderingContext2D,
  lane: LaneState,
  w: number,
  h: number,
  dpr: number,
  heat: number,
) {
  const bx = lane.ball.x * w
  const by = lane.ball.y * h
  const r = BALL_RADIUS * w * 2.35
  const hotCore = heat > 0.2
  const blazing = heat > 0.55

  if (heat > 0.35) {
    const aura = ctx.createRadialGradient(bx, by, r * 0.25, bx, by, r * (1.8 + heat * 0.8))
    aura.addColorStop(0, `rgba(255, 220, 160, ${0.28 + heat * 0.35})`)
    aura.addColorStop(0.5, `rgba(255, 100, 30, ${0.15 + heat * 0.2})`)
    aura.addColorStop(1, 'rgba(255, 40, 0, 0)')
    ctx.fillStyle = aura
    ctx.beginPath()
    ctx.arc(bx, by, r * (1.8 + heat * 0.8), 0, Math.PI * 2)
    ctx.fill()
  }

  const ballGrad = ctx.createRadialGradient(bx - r * 0.28, by - r * 0.3, 0, bx, by, r * 1.12)
  if (hotCore) {
    ballGrad.addColorStop(0, '#fffef5')
    ballGrad.addColorStop(0.2, `rgba(255, ${210 + heat * 45}, ${140 - heat * 50}, 1)`)
    ballGrad.addColorStop(0.5, `rgba(255, ${110 + heat * 90}, 50, 0.98)`)
    ballGrad.addColorStop(0.82, BALL_SKIN.deep)
    ballGrad.addColorStop(1, 'rgba(255, 60, 20, 0.45)')
  } else {
    ballGrad.addColorStop(0, BALL_SKIN.highlight)
    ballGrad.addColorStop(0.28, BALL_SKIN.shell)
    ballGrad.addColorStop(0.58, BALL_SKIN.body)
    ballGrad.addColorStop(0.82, BALL_SKIN.deep)
    ballGrad.addColorStop(1, BALL_SKIN.rim)
  }

  ctx.fillStyle = ballGrad
  ctx.shadowColor = blazing ? '#ff5500' : lane.ball.power === 'fast' ? '#ffd76a' : BALL_SKIN.glow
  ctx.shadowBlur = (blazing ? 36 : hotCore ? 24 : 22) * dpr
  ctx.beginPath()
  ctx.arc(bx, by, r, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = `rgba(255,255,255,${0.82 + heat * 0.15})`
  ctx.beginPath()
  ctx.arc(bx - r * 0.3, by - r * 0.3, r * (0.2 + heat * 0.05), 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0
}

function drawBrick(
  ctx: CanvasRenderingContext2D,
  col: number,
  row: number,
  colW: number,
  rowH: number,
  zoneTop: number,
  color: string,
  power: BrickPower,
  dpr: number,
) {
  const brickW = colW * 0.9
  const brickH = rowH * 0.44
  const bx = col * colW + (colW - brickW) / 2
  const by = zoneTop + row * rowH + (rowH - brickH) / 2
  const radius = brickH * 0.28

  const baseColor = power === 'bonus' ? '#ffd76a' : power === 'armored' ? '#9aa8c8' : color

  ctx.save()
  const heavyGlow = power === 'charged' || power === 'bonus'
  if (heavyGlow) {
    ctx.shadowColor = '#ffffff'
    ctx.shadowBlur = 12 * dpr
  } else {
    ctx.shadowColor = baseColor
    ctx.shadowBlur = 6 * dpr
  }

  const grad = ctx.createLinearGradient(bx, by, bx, by + brickH)
  grad.addColorStop(0, lighten(baseColor, 0.4))
  grad.addColorStop(0.35, baseColor)
  grad.addColorStop(1, darken(baseColor, 0.22))
  ctx.fillStyle = grad
  roundRect(ctx, bx, by, brickW, brickH, radius)
  ctx.fill()

  ctx.shadowBlur = 0
  ctx.strokeStyle = 'rgba(255,255,255,0.42)'
  ctx.lineWidth = 1 * dpr
  roundRect(ctx, bx + dpr, by + dpr, brickW - dpr * 2, brickH * 0.38, radius * 0.5)
  ctx.stroke()

  if (power === 'charged') {
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'
    ctx.lineWidth = 1.5 * dpr
    roundRect(ctx, bx - dpr, by - dpr, brickW + dpr * 2, brickH + dpr * 2, radius + dpr)
    ctx.stroke()
  }

  if (power === 'bonus') {
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.font = `bold ${brickH * 0.42}px Orbitron, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('★', bx + brickW / 2, by + brickH / 2 + 1)
  }

  if (power === 'armored') {
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.fillRect(bx + brickW * 0.2, by + brickH * 0.62, brickW * 0.6, brickH * 0.12)
  }

  ctx.restore()
}

function drawPowerDrop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  kind: DropKind,
  wobble: number,
  accent: 'cyan' | 'pink',
  dpr: number,
) {
  const size = 11 * dpr
  const bob = Math.sin(wobble) * 2 * dpr
  const colors: Record<DropKind, { fill: string; glow: string; label: string }> = {
    wide: { fill: '#4cd964', glow: 'rgba(76, 217, 100, 0.9)', label: 'W' },
    fast: { fill: '#ffd76a', glow: 'rgba(255, 215, 106, 0.9)', label: '⚡' },
    pierce: { fill: '#7b61ff', glow: 'rgba(123, 97, 255, 0.9)', label: 'P' },
  }
  const style = colors[kind]
  const px = x + Math.sin(wobble * 1.4) * 3 * dpr

  ctx.save()
  ctx.translate(px, y + bob)
  ctx.shadowColor = style.glow
  ctx.shadowBlur = 10 * dpr

  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, size)
  grad.addColorStop(0, '#ffffff')
  grad.addColorStop(0.45, style.fill)
  grad.addColorStop(1, accent === 'cyan' ? '#0a2840' : '#280a28')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(0, 0, size, 0, Math.PI * 2)
  ctx.fill()

  ctx.shadowBlur = 0
  ctx.strokeStyle = 'rgba(255,255,255,0.75)'
  ctx.lineWidth = 1.2 * dpr
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${kind === 'fast' ? size * 0.95 : size * 0.72}px Orbitron, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(style.label, 0, 1)
  ctx.restore()
}

function drawBallTrail(
  ctx: CanvasRenderingContext2D,
  lane: LaneState,
  w: number,
  h: number,
  dpr: number,
  heat: number,
) {
  const { ball, trail } = lane
  const points = trail
  if (!ball.active) return

  const bx = ball.x * w
  const by = ball.y * h
  const speed = Math.hypot(ball.vx, ball.vy)
  const dotR = Math.max(1.2 * dpr, BALL_RADIUS * w * 0.34)

  if (heat > 0.08 && speed > 0.04) {
    drawFlameWake(ctx, ball, points, w, h, dpr, heat)
  }

  if (points.length < 2) return

  for (let i = 1; i < points.length; i += 1) {
    const t = i / points.length
    const alpha = 0.14 + t * 0.32
    const warm = heat * (1 - t * 0.35)
    ctx.globalAlpha = Math.min(1, alpha * (1 + heat * 0.4))
    if (warm > 0.12) {
      ctx.fillStyle = `rgba(255, ${150 + warm * 90}, ${70 - warm * 25}, ${0.45 + warm * 0.45})`
    } else {
      ctx.fillStyle = BALL_SKIN.trail
    }
    ctx.beginPath()
    ctx.arc(points[i]!.x * w, points[i]!.y * h, dotR * (0.9 + warm * 0.4), 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  if (heat > 0.15 && points.length >= 2) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(points[points.length - 1]!.x * w, points[points.length - 1]!.y * h)
    for (let i = points.length - 2; i >= 0; i -= 1) {
      ctx.lineTo(points[i]!.x * w, points[i]!.y * h)
    }
    ctx.lineTo(bx, by)
    const streak = ctx.createLinearGradient(
      points[points.length - 1]!.x * w,
      points[points.length - 1]!.y * h,
      bx,
      by,
    )
    streak.addColorStop(0, 'rgba(255, 80, 20, 0)')
    streak.addColorStop(0.55, `rgba(255, 120, 40, ${0.2 + heat * 0.25})`)
    streak.addColorStop(1, `rgba(255, 220, 160, ${0.35 + heat * 0.35})`)
    ctx.strokeStyle = streak
    ctx.lineWidth = dotR * (0.8 + heat * 1.4)
    ctx.stroke()
    ctx.restore()
  }
}

function drawFlameWake(
  ctx: CanvasRenderingContext2D,
  ball: LaneState['ball'],
  trail: LaneState['trail'],
  w: number,
  h: number,
  dpr: number,
  heat: number,
) {
  const speed = Math.hypot(ball.vx, ball.vy)
  if (speed < 0.04) return

  const bx = ball.x * w
  const by = ball.y * h
  const nx = -ball.vx / speed
  const ny = -ball.vy / speed
  const px = -ny
  const py = nx
  const flameLen = BALL_RADIUS * w * (2.2 + heat * 4.5)

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'

  const steps = 10
  for (let i = 0; i < steps; i += 1) {
    const u = i / steps
    const fade = (1 - u) * heat
    if (fade < 0.04) continue

    let sx = bx + nx * flameLen * u
    let sy = by + ny * flameLen * u
    if (trail.length > 0 && i < trail.length) {
      const tp = trail[Math.min(i, trail.length - 1)]!
      sx = tp.x * w
      sy = tp.y * h
    }

    const flick = Math.sin(i * 1.7 + ball.x * 40) * flameLen * 0.06 * heat
    sx += px * flick
    sy += py * flick

    const fr = BALL_RADIUS * w * (1.1 + (1 - u) * 1.4) * (0.35 + heat * 0.65)
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, fr)
    const hot = 1 - u * 0.7
    g.addColorStop(0, `rgba(255, ${220 - hot * 80}, ${160 - hot * 120}, ${0.35 * fade})`)
    g.addColorStop(0.4, `rgba(255, ${140 - hot * 60}, 40, ${0.22 * fade})`)
    g.addColorStop(1, 'rgba(255, 40, 0, 0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(sx, sy, fr, 0, Math.PI * 2)
    ctx.fill()
  }

  const coreLen = flameLen * 0.85
  const ex = bx + nx * coreLen
  const ey = by + ny * coreLen
  const coreGrad = ctx.createLinearGradient(bx, by, ex, ey)
  coreGrad.addColorStop(0, `rgba(255, 245, 210, ${0.55 * heat})`)
  coreGrad.addColorStop(0.25, `rgba(255, 180, 60, ${0.4 * heat})`)
  coreGrad.addColorStop(0.6, `rgba(255, 80, 20, ${0.22 * heat})`)
  coreGrad.addColorStop(1, 'rgba(255, 20, 0, 0)')

  ctx.strokeStyle = coreGrad
  ctx.lineWidth = BALL_RADIUS * w * (1.2 + heat * 2.2) * dpr
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(bx, by)
  ctx.lineTo(ex, ey)
  ctx.stroke()

  for (let tongue = 0; tongue < 3; tongue += 1) {
    const side = (tongue - 1) * 0.35
    const tx = bx + nx * coreLen * 0.55 + px * side * flameLen * 0.22
    const ty = by + ny * coreLen * 0.55 + py * side * flameLen * 0.22
    const tg = ctx.createRadialGradient(tx, ty, 0, tx, ty, BALL_RADIUS * w * (0.7 + heat))
    tg.addColorStop(0, `rgba(255, 200, 100, ${0.35 * heat})`)
    tg.addColorStop(1, 'rgba(255, 50, 0, 0)')
    ctx.fillStyle = tg
    ctx.beginPath()
    ctx.moveTo(tx, ty - BALL_RADIUS * w * 0.5)
    ctx.quadraticCurveTo(tx + px * flameLen * 0.08, ty, tx, ty + BALL_RADIUS * w * 0.35)
    ctx.quadraticCurveTo(tx - px * flameLen * 0.08, ty, tx, ty - BALL_RADIUS * w * 0.5)
    ctx.fill()
  }

  ctx.restore()
}

function drawPaddle(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  pw: number,
  ph: number,
  paddleColor: string,
  paddleGlow: string,
  accent: 'cyan' | 'pink',
  dpr: number,
) {
  const left = px - pw / 2
  const radius = ph * 0.48

  ctx.save()

  ctx.shadowColor = paddleGlow
  ctx.shadowBlur = 14 * dpr
  ctx.fillStyle = accent === 'cyan' ? 'rgba(0, 232, 255, 0.18)' : 'rgba(255, 45, 154, 0.18)'
  roundRect(ctx, left - 2 * dpr, py - dpr, pw + 4 * dpr, ph + 2 * dpr, radius + dpr)
  ctx.fill()

  ctx.shadowBlur = 10 * dpr
  const bodyGrad = ctx.createLinearGradient(left, py, left, py + ph)
  bodyGrad.addColorStop(0, accent === 'cyan' ? '#1a3a52' : '#3a1a38')
  bodyGrad.addColorStop(0.45, accent === 'cyan' ? '#0a1828' : '#180818')
  bodyGrad.addColorStop(1, accent === 'cyan' ? '#061018' : '#100610')
  ctx.fillStyle = bodyGrad
  roundRect(ctx, left, py, pw, ph, radius)
  ctx.fill()

  ctx.shadowBlur = 0
  ctx.strokeStyle = paddleColor
  ctx.lineWidth = 2 * dpr
  roundRect(ctx, left + dpr * 0.5, py + dpr * 0.5, pw - dpr, ph - dpr, radius)
  ctx.stroke()

  const shineGrad = ctx.createLinearGradient(left, py, left + pw, py)
  shineGrad.addColorStop(0, 'transparent')
  shineGrad.addColorStop(0.5, 'rgba(255,255,255,0.85)')
  shineGrad.addColorStop(1, 'transparent')
  ctx.strokeStyle = shineGrad
  ctx.lineWidth = 1.4 * dpr
  ctx.beginPath()
  ctx.moveTo(left + pw * 0.12, py + ph * 0.32)
  ctx.lineTo(left + pw * 0.88, py + ph * 0.32)
  ctx.stroke()

  ctx.fillStyle = accent === 'cyan' ? 'rgba(0, 232, 255, 0.55)' : 'rgba(255, 45, 154, 0.55)'
  ctx.fillRect(left + pw * 0.08, py + ph * 0.68, pw * 0.84, ph * 0.14)

  ctx.restore()
}

function drawArenaDepth(ctx: CanvasRenderingContext2D, w: number, h: number, accent: 'cyan' | 'pink') {
  const bottomGlow = accent === 'cyan' ? 'rgba(0, 232, 255, 0.12)' : 'rgba(255, 45, 154, 0.12)'
  const bottom = ctx.createRadialGradient(w * 0.5, h, 0, w * 0.5, h * 0.55, Math.max(w, h) * 0.65)
  bottom.addColorStop(0, bottomGlow)
  bottom.addColorStop(1, 'transparent')
  ctx.fillStyle = bottom
  ctx.fillRect(0, 0, w, h)
}

function lighten(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.min(255, ((n >> 16) & 255) + 255 * amount)
  const g = Math.min(255, ((n >> 8) & 255) + 255 * amount)
  const b = Math.min(255, (n & 255) + 255 * amount)
  return `rgb(${r},${g},${b})`
}

function darken(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, ((n >> 16) & 255) * (1 - amount))
  const g = Math.max(0, ((n >> 8) & 255) * (1 - amount))
  const b = Math.max(0, (n & 255) * (1 - amount))
  return `rgb(${r},${g},${b})`
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
