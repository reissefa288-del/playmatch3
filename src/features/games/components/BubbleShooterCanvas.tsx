import { useEffect, useRef, type RefObject } from 'react'
import {
  BUBBLE_RADIUS,
  COLLISION_DISTANCE,
  COLOR_HEX,
  DANGER_Y,
  GRID_TOP,
  SHOOTER_X,
  SHOOTER_Y,
  bubblePos,
  type BubbleColor,
  type LaneState,
} from '../utils/bubbleShooterEngine'

type BubbleShooterCanvasProps = {
  laneRef: RefObject<LaneState>
  accent: 'cyan' | 'pink'
  showShooterExtras?: boolean
  active?: boolean
}

const ACCENT = {
  cyan: {
    dot: 'rgba(34, 200, 255, 0.85)',
    dotDim: 'rgba(34, 200, 255, 0.25)',
    danger: 'rgba(255, 90, 120, 0.42)',
    shooter: ['#081828', '#1a5880', '#081828'] as const,
    ring: 'rgba(34, 200, 255, 0.72)',
    floor: 'rgba(34, 200, 255, 0.1)',
  },
  pink: {
    dot: 'rgba(255, 58, 120, 0.85)',
    dotDim: 'rgba(255, 58, 120, 0.25)',
    danger: 'rgba(255, 90, 120, 0.42)',
    shooter: ['#180818', '#602048', '#180818'] as const,
    ring: 'rgba(255, 58, 120, 0.72)',
    floor: 'rgba(255, 58, 120, 0.1)',
  },
}

export function BubbleShooterCanvas({
  laneRef,
  accent,
  showShooterExtras = false,
  active = true,
}: BubbleShooterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const accentRef = useRef(accent)
  const extrasRef = useRef(showShooterExtras)
  accentRef.current = accent
  extrasRef.current = showShooterExtras

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0

    const draw = () => {
      if (!active) {
        raf = requestAnimationFrame(draw)
        return
      }

      const lane = laneRef.current
      if (!lane) {
        raf = requestAnimationFrame(draw)
        return
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      const w = Math.max(1, Math.floor(rect.width * dpr))
      const h = Math.max(1, Math.floor(rect.height * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }

      const palette = ACCENT[accentRef.current]
      ctx.clearRect(0, 0, w, h)
      drawArenaDepth(ctx, w, h, palette.floor)
      drawAimTrajectory(ctx, lane, w, h, palette.dot, palette.dotDim, dpr)

      ctx.save()
      ctx.strokeStyle = palette.danger
      ctx.lineWidth = 1 * dpr
      ctx.setLineDash([5 * dpr, 5 * dpr])
      ctx.beginPath()
      ctx.moveTo(0, DANGER_Y * h)
      ctx.lineTo(w, DANGER_Y * h)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()

      for (const [key, color] of lane.grid) {
        const [row, col] = key.split(',').map(Number)
        const pos = bubblePos(row, col)
        drawBubble(ctx, pos.x * w, pos.y * h, BUBBLE_RADIUS * w * 2.08, color, dpr, false)
      }

      for (const particle of lane.particles) {
        const alpha = Math.min(1, particle.life * 2.2)
        ctx.globalAlpha = alpha
        ctx.fillStyle = particle.color
        ctx.shadowColor = particle.color
        ctx.shadowBlur = 6 * dpr * alpha
        ctx.beginPath()
        ctx.arc(particle.x * w, particle.y * h, (1.8 + alpha * 2) * dpr, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1
      }

      if (lane.projectile?.active) {
        drawBubble(
          ctx,
          lane.projectile.x * w,
          lane.projectile.y * h,
          BUBBLE_RADIUS * w * 2.08,
          lane.projectile.color,
          dpr,
          true,
        )
      }

      drawShooter(
        ctx,
        SHOOTER_X * w,
        SHOOTER_Y * h,
        w,
        h,
        lane.currentColor,
        lane.nextColor,
        accentRef.current,
        dpr,
        extrasRef.current,
      )
      drawFloorReflection(ctx, SHOOTER_X * w, SHOOTER_Y * h, w, h, lane.currentColor, dpr)

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [active, laneRef])

  return <canvas ref={canvasRef} className="pm-bubble-arena__canvas" />
}

function drawAimTrajectory(
  ctx: CanvasRenderingContext2D,
  lane: LaneState,
  w: number,
  h: number,
  bright: string,
  dim: string,
  dpr: number,
) {
  const points = predictAimPath(lane)

  for (let i = 1; i < points.length; i += 4) {
    const point = points[i]!
    const t = i / points.length
    const fade = 1 - t * 0.58
    ctx.fillStyle = i % 8 === 0 ? bright : dim
    ctx.globalAlpha = fade
    ctx.beginPath()
    ctx.arc(point.x * w, point.y * h, (1.7 + fade * 0.9) * dpr, 0, Math.PI * 2)
    ctx.fill()
  }

  const impact = points.at(-1)
  if (impact) {
    ctx.globalAlpha = 0.7
    ctx.strokeStyle = bright
    ctx.lineWidth = 1.2 * dpr
    ctx.beginPath()
    ctx.arc(impact.x * w, impact.y * h, 5.6 * dpr, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.globalAlpha = 1
}

function predictAimPath(lane: LaneState) {
  const points: { x: number; y: number }[] = []
  let x = SHOOTER_X
  let y = SHOOTER_Y
  let vx = Math.cos(lane.aimAngle)
  const vy = Math.sin(lane.aimAngle)
  const step = 0.012

  for (let i = 0; i < 150; i += 1) {
    x += vx * step
    y += vy * step

    if (x <= BUBBLE_RADIUS) {
      x = BUBBLE_RADIUS
      vx = Math.abs(vx)
    } else if (x >= 1 - BUBBLE_RADIUS) {
      x = 1 - BUBBLE_RADIUS
      vx = -Math.abs(vx)
    }

    points.push({ x, y })
    if (y <= GRID_TOP + BUBBLE_RADIUS) break

    for (const [key] of lane.grid) {
      const [row, col] = key.split(',').map(Number)
      const pos = bubblePos(row, col)
      if (Math.hypot(x - pos.x, y - pos.y) < COLLISION_DISTANCE) return points
    }
  }

  return points
}

function drawBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: BubbleColor,
  dpr: number,
  active: boolean,
) {
  const hex = COLOR_HEX[color]

  ctx.save()

  // Neon halo — referans: yumuşak bloom, opak değil
  const halo = ctx.createRadialGradient(x, y, r * 0.55, x, y, r * 1.22)
  halo.addColorStop(0, hexToRgba(hex, 0.32))
  halo.addColorStop(0.65, hexToRgba(hex, 0.12))
  halo.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.arc(x, y, r * 1.18, 0, Math.PI * 2)
  ctx.fill()

  if (active) {
    ctx.shadowColor = hex
    ctx.shadowBlur = 10 * dpr
  }

  // Cam küre gövdesi — parlak, doygun, referans 3D
  const bodyGrad = ctx.createRadialGradient(x - r * 0.28, y - r * 0.32, r * 0.04, x + r * 0.05, y + r * 0.08, r)
  bodyGrad.addColorStop(0, 'rgba(255,255,255,0.98)')
  bodyGrad.addColorStop(0.14, lighten(hex, 0.28))
  bodyGrad.addColorStop(0.42, hex)
  bodyGrad.addColorStop(0.72, darken(hex, 0.12))
  bodyGrad.addColorStop(0.92, darken(hex, 0.22))
  bodyGrad.addColorStop(1, darken(hex, 0.32))

  ctx.fillStyle = bodyGrad
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0

  // Alt yarı iç gölge — hacim
  const innerShade = ctx.createRadialGradient(x, y + r * 0.15, r * 0.1, x, y, r)
  innerShade.addColorStop(0, 'rgba(0,0,0,0)')
  innerShade.addColorStop(0.7, 'rgba(0,0,0,0)')
  innerShade.addColorStop(1, 'rgba(0,0,0,0.28)')
  ctx.fillStyle = innerShade
  ctx.beginPath()
  ctx.arc(x, y, r * 0.96, 0, Math.PI * 2)
  ctx.fill()

  // Rim highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.32)'
  ctx.lineWidth = 0.9 * dpr
  ctx.beginPath()
  ctx.arc(x, y, r * 0.94, -Math.PI * 0.85, Math.PI * 0.15)
  ctx.stroke()

  // Ana specular — sol üst parlak nokta
  const specGrad = ctx.createRadialGradient(x - r * 0.34, y - r * 0.36, 0, x - r * 0.2, y - r * 0.22, r * 0.42)
  specGrad.addColorStop(0, 'rgba(255,255,255,0.95)')
  specGrad.addColorStop(0.35, 'rgba(255,255,255,0.35)')
  specGrad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = specGrad
  ctx.beginPath()
  ctx.arc(x - r * 0.24, y - r * 0.28, r * 0.3, 0, Math.PI * 2)
  ctx.fill()

  // İkincil küçük yansıma
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.beginPath()
  ctx.arc(x + r * 0.18, y + r * 0.12, r * 0.08, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function drawShooter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: BubbleColor,
  nextColor: BubbleColor,
  accent: 'cyan' | 'pink',
  dpr: number,
  showExtras: boolean,
) {
  const palette = ACCENT[accent]
  const ringR = w * 0.105
  const pw = w * 0.26
  const ph = h * 0.044
  const cy = y - ph * 0.12

  ctx.save()

  // Taban platform
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.beginPath()
  ctx.ellipse(x, y + ph * 0.35, pw * 0.55, ph * 0.55, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = palette.ring
  ctx.lineWidth = 1.6 * dpr
  ctx.shadowColor = palette.ring
  ctx.shadowBlur = 8 * dpr
  ctx.beginPath()
  ctx.arc(x, cy, ringR, 0, Math.PI * 2)
  ctx.stroke()
  ctx.shadowBlur = 0

  const bodyGrad = ctx.createLinearGradient(x - pw / 2, cy, x + pw / 2, cy)
  bodyGrad.addColorStop(0, palette.shooter[0])
  bodyGrad.addColorStop(0.5, palette.shooter[1])
  bodyGrad.addColorStop(1, palette.shooter[2])
  ctx.fillStyle = bodyGrad
  roundRect(ctx, x - pw / 2, cy - ph * 0.35, pw, ph, ph * 0.42)
  ctx.fill()

  ctx.fillStyle = 'rgba(255,255,255,0.1)'
  roundRect(ctx, x - pw / 2 + 3 * dpr, cy - ph * 0.28, pw - 6 * dpr, ph * 0.32, ph * 0.18)
  ctx.fill()

  drawBubble(ctx, x, cy - ph * 0.72, BUBBLE_RADIUS * w * 2, color, dpr, true)

  const nx = x + ringR * 1.08
  const ny = cy
  drawBubble(ctx, nx, ny, BUBBLE_RADIUS * w * 1.42, nextColor, dpr, false)

  if (showExtras) {
    drawSwapRing(ctx, nx, ny + ringR * 0.95, BUBBLE_RADIUS * w * 1.55, palette.ring, dpr)
  } else {
    drawSwapRing(ctx, nx, ny + ringR * 0.95, BUBBLE_RADIUS * w * 1.55, 'rgba(255,255,255,0.22)', dpr)
  }

  ctx.restore()
}

function drawSwapRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  stroke: string,
  dpr: number,
) {
  ctx.strokeStyle = stroke
  ctx.lineWidth = 1.2 * dpr
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = stroke
  ctx.lineWidth = 1.4 * dpr
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(x, y, r * 0.72, -Math.PI * 0.7, Math.PI * 0.1)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x + r * 0.55, y - r * 0.45)
  ctx.lineTo(x + r * 0.72, y - r * 0.62)
  ctx.lineTo(x + r * 0.88, y - r * 0.42)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(x, y, r * 0.72, Math.PI * 0.3, Math.PI * 1.1)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x - r * 0.55, y + r * 0.45)
  ctx.lineTo(x - r * 0.72, y + r * 0.62)
  ctx.lineTo(x - r * 0.88, y + r * 0.42)
  ctx.stroke()
}

function drawFloorReflection(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  _h: number,
  color: BubbleColor,
  dpr: number,
) {
  const hex = COLOR_HEX[color]
  const grad = ctx.createLinearGradient(0, y, 0, y + w * 0.12)
  grad.addColorStop(0, hexToRgba(hex, 0.12))
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.ellipse(x, y + 8 * dpr, w * 0.14, w * 0.04, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawArenaDepth(ctx: CanvasRenderingContext2D, w: number, h: number, floorGlow: string) {
  const g = ctx.createRadialGradient(w * 0.5, h * 0.95, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.75)
  g.addColorStop(0, floorGlow)
  g.addColorStop(1, 'transparent')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function hexToRgba(hex: string, alpha: number) {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r},${g},${b},${alpha})`
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

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, rw: number, rh: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + rw - r, y)
  ctx.quadraticCurveTo(x + rw, y, x + rw, y + r)
  ctx.lineTo(x + rw, y + rh - r)
  ctx.quadraticCurveTo(x + rw, y + rh, x + rw - r, y + rh)
  ctx.lineTo(x + r, y + rh)
  ctx.quadraticCurveTo(x, y + rh, x, y + rh - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
