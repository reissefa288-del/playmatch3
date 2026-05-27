import { useEffect, useRef, type RefObject } from 'react'
import {
  BALL_RADIUS,
  BRICK_COLORS,
  BRICK_COLS,
  BRICK_ROWS,
  BRICK_ZONE_HEIGHT,
  BRICK_ZONE_TOP,
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

export function BrickBreakCanvas({ laneRef, accent, active = true }: BrickBreakCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const accentRef = useRef(accent)
  const activeRef = useRef(active)
  accentRef.current = accent
  activeRef.current = active

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0

    const drawFrame = () => {
      const lane = laneRef.current
      if (!lane) return

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      const w = Math.max(1, Math.floor(rect.width * dpr))
      const h = Math.max(1, Math.floor(rect.height * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }

      ctx.clearRect(0, 0, w, h)

      const paddleColor = accentRef.current === 'cyan' ? '#00e8ff' : '#ff2d9a'
      const paddleGlow = accentRef.current === 'cyan' ? 'rgba(0, 232, 255, 0.9)' : 'rgba(255, 45, 154, 0.9)'
      const ballColor = accentRef.current === 'cyan' ? '#e8feff' : '#ffe8f7'
      const brickZoneTop = h * BRICK_ZONE_TOP
      const brickZoneH = h * BRICK_ZONE_HEIGHT
      const rowH = brickZoneH / BRICK_ROWS
      const colW = w / BRICK_COLS

      drawArenaDepth(ctx, w, h, accentRef.current)

      for (let row = 0; row < BRICK_ROWS; row += 1) {
        for (let col = 0; col < BRICK_COLS; col += 1) {
          const cell = lane.bricks[row][col]
          if (!cell.alive) continue
          const color = BRICK_COLORS[(row + col) % BRICK_COLORS.length]
          drawBrick(ctx, col, row, colW, rowH, brickZoneTop, color, cell.power, dpr)
        }
      }

      for (const drop of lane.drops) {
        drawPowerDrop(ctx, drop.x * w, drop.y * h, drop.kind, drop.wobble, accentRef.current, dpr)
      }

      for (const particle of lane.particles) {
        const px = particle.x * w
        const py = particle.y * h
        const alpha = Math.min(1, particle.life * 2.5)
        ctx.fillStyle = particle.color
        ctx.globalAlpha = alpha
        ctx.shadowColor = particle.color
        ctx.shadowBlur = 6 * dpr
        ctx.beginPath()
        ctx.rect(px - 1.2 * dpr, py - 1.2 * dpr, 2.4 * dpr, 2.4 * dpr)
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
      }

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
        accentRef.current,
        dpr,
      )

      if (lane.ball.active) {
        const bx = lane.ball.x * w
        const by = lane.ball.y * h
        const r = BALL_RADIUS * w * 2.35
        drawBallTrail(ctx, lane, w, h, accentRef.current, dpr)

        const ballGrad = ctx.createRadialGradient(bx - r * 0.25, by - r * 0.25, 0, bx, by, r * 1.15)
        ballGrad.addColorStop(0, '#ffffff')
        ballGrad.addColorStop(0.3, ballColor)
        ballGrad.addColorStop(0.75, paddleColor)
        ballGrad.addColorStop(
          1,
          accentRef.current === 'cyan' ? 'rgba(0, 120, 160, 0.35)' : 'rgba(160, 20, 90, 0.35)',
        )
        ctx.fillStyle = ballGrad
        ctx.shadowColor = lane.ball.power === 'fast' ? '#ffd76a' : paddleGlow
        ctx.shadowBlur = lane.ball.power !== 'none' ? 32 * dpr : 20 * dpr
        ctx.beginPath()
        ctx.arc(bx, by, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.85)'
        ctx.beginPath()
        ctx.arc(bx - r * 0.28, by - r * 0.28, r * 0.2, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      } else if (lane.lives > 0 && lane.serveCooldown > 0) {
        const bx = lane.paddleX * w
        const by = lane.ball.y * h
        const alpha = 0.35 + Math.sin(lane.serveCooldown * 12) * 0.2
        ctx.globalAlpha = alpha
        ctx.fillStyle = paddleColor
        ctx.shadowColor = paddleGlow
        ctx.shadowBlur = 14 * dpr
        ctx.beginPath()
        ctx.arc(bx, by, BALL_RADIUS * w * 1.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
      }
    }

    const loop = () => {
      drawFrame()
      raf = requestAnimationFrame(loop)
    }

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => drawFrame()) : null
    ro?.observe(canvas)

    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      ro?.disconnect()
    }
  }, [laneRef])

  return <canvas ref={canvasRef} className="pm-brick-arena__canvas" />
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
  if (power === 'charged') {
    ctx.shadowColor = '#ffffff'
    ctx.shadowBlur = 16 * dpr
  } else {
    ctx.shadowColor = baseColor
    ctx.shadowBlur = 12 * dpr
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
    life: { fill: '#ff5a8a', glow: 'rgba(255, 90, 138, 0.9)', label: '+' },
  }
  const style = colors[kind]
  const px = x + Math.sin(wobble * 1.4) * 3 * dpr

  ctx.save()
  ctx.translate(px, y + bob)
  ctx.shadowColor = style.glow
  ctx.shadowBlur = 14 * dpr

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
  accent: 'cyan' | 'pink',
  dpr: number,
) {
  const points = lane.trail
  if (points.length < 2) return

  const glow = accent === 'cyan' ? 'rgba(0, 232, 255, 0.45)' : 'rgba(255, 45, 154, 0.45)'
  const dotR = Math.max(1 * dpr, BALL_RADIUS * w * 0.35)

  for (let i = 1; i < points.length; i += 1) {
    const alpha = 0.12 + (i / points.length) * 0.28
    ctx.globalAlpha = alpha
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(points[i]!.x * w, points[i]!.y * h, dotR, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
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
  ctx.shadowBlur = 18 * dpr
  ctx.fillStyle = accent === 'cyan' ? 'rgba(0, 232, 255, 0.18)' : 'rgba(255, 45, 154, 0.18)'
  roundRect(ctx, left - 2 * dpr, py - dpr, pw + 4 * dpr, ph + 2 * dpr, radius + dpr)
  ctx.fill()

  ctx.shadowBlur = 14 * dpr
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
