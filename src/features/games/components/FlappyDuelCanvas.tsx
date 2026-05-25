import { useEffect, useRef, type RefObject } from 'react'
import {
  BIRD_R,
  BIRD_X,
  PIPE_GAP,
  PIPE_W,
  type FlappyLaneState,
} from '../utils/flappyDuelEngine'

type FlappyDuelCanvasProps = {
  laneRef: RefObject<FlappyLaneState>
  accent: 'cyan' | 'pink'
  active?: boolean
}

const PALETTE = {
  cyan: {
    bird: '#00e8ff',
    birdCore: '#b8ffff',
    pipe: '#1a6bff',
    pipeEdge: '#00e8ff',
    skyTop: '#0a1028',
    skyBot: '#121830',
    city: 'rgba(0, 232, 255, 0.15)',
    trail: 'rgba(0, 232, 255, 0.45)',
    glow: 'rgba(0, 232, 255, 0.3)',
  },
  pink: {
    bird: '#ff2d9a',
    birdCore: '#ffc0e8',
    pipe: '#c41a6e',
    pipeEdge: '#ff2d9a',
    skyTop: '#140a1c',
    skyBot: '#1e1028',
    city: 'rgba(255, 45, 154, 0.15)',
    trail: 'rgba(255, 45, 154, 0.45)',
    glow: 'rgba(255, 45, 154, 0.3)',
  },
}

export function FlappyDuelCanvas({ laneRef, accent, active = true }: FlappyDuelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const accentRef = useRef(accent)
  accentRef.current = accent

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0

    const draw = () => {
      const lane = laneRef.current
      const palette = PALETTE[accentRef.current]
      const now = performance.now() / 1000
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      const w = Math.max(1, Math.floor(rect.width * dpr))
      const h = Math.max(1, Math.floor(rect.height * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }

      ctx.clearRect(0, 0, w, h)

      const grad = ctx.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, palette.skyTop)
      grad.addColorStop(1, palette.skyBot)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      drawAtmosphere(ctx, w, h, palette, now)
      drawStars(ctx, w, h, palette, now, dpr)
      drawCity(ctx, w, h, palette.city, dpr)
      drawScanlines(ctx, w, h, dpr)

      if (lane) {
        for (const pipe of lane.pipes) {
          drawPipe(ctx, pipe, w, h, palette, dpr)
        }

        for (const t of lane.trail) {
          ctx.globalAlpha = t.life * 0.5
          ctx.fillStyle = palette.trail
          ctx.beginPath()
          ctx.arc(t.x * w, t.y * h, (3 + t.life * 4) * dpr, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1
        }

        drawBird(ctx, BIRD_X * w, lane.birdY * h, lane.birdRot, palette, dpr, lane.flapFlash, now, lane.alive)
      } else {
        drawIdleBird(ctx, w, h, palette, dpr, now)
      }

      if (!active) drawPausedTint(ctx, w, h)

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [active, laneRef])

  return <canvas ref={canvasRef} className="pm-flappy-arena__canvas" />
}

function drawAtmosphere(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  palette: (typeof PALETTE)['cyan'],
  now: number,
) {
  const pulse = 0.75 + Math.sin(now * 0.9) * 0.08
  const orbX = w * 0.7
  const orbY = h * 0.18
  const r = w * 0.26
  const grad = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, r)
  grad.addColorStop(0, palette.glow)
  grad.addColorStop(1, 'transparent')
  ctx.globalAlpha = pulse
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)
  ctx.globalAlpha = 1
}

function drawStars(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  palette: (typeof PALETTE)['cyan'],
  now: number,
  dpr: number,
) {
  for (let i = 0; i < 18; i += 1) {
    const x = ((i * 59.7) % 100) / 100
    const y = ((i * 37.3) % 48) / 100 + 0.04
    const twinkle = 0.35 + ((Math.sin(now * 1.6 + i * 1.8) + 1) * 0.5) * 0.6
    ctx.globalAlpha = twinkle
    ctx.fillStyle = i % 3 === 0 ? '#fff' : palette.pipeEdge
    ctx.beginPath()
    ctx.arc(x * w, y * h, (i % 2 === 0 ? 1.2 : 0.85) * dpr, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

function drawCity(ctx: CanvasRenderingContext2D, w: number, h: number, color: string, dpr: number) {
  ctx.fillStyle = color
  const base = h * 0.78
  for (let i = 0; i < 8; i++) {
    const bw = w * (0.08 + (i % 3) * 0.02)
    const bx = (w / 8) * i + bw * 0.1
    const bh = h * (0.08 + (i % 4) * 0.04)
    ctx.fillRect(bx, base - bh, bw, bh + h * 0.25)
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fillRect(bx + bw * 0.15, base - bh + h * 0.02, dpr, bh * 0.7)
    ctx.fillStyle = color
  }
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
  ctx.fillRect(0, h * 0.9, w, h * 0.1)
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'
  ctx.lineWidth = 1 * dpr
  ctx.beginPath()
  ctx.moveTo(0, h * 0.9)
  ctx.lineTo(w, h * 0.9)
  ctx.stroke()
}

function drawScanlines(ctx: CanvasRenderingContext2D, w: number, h: number, dpr: number) {
  ctx.globalAlpha = 0.08
  ctx.fillStyle = '#fff'
  for (let y = 0; y < h; y += 4 * dpr) {
    ctx.fillRect(0, y, w, dpr * 0.5)
  }
  ctx.globalAlpha = 1
}

function drawPipe(
  ctx: CanvasRenderingContext2D,
  pipe: { x: number; gapY: number },
  w: number,
  h: number,
  palette: (typeof PALETTE)['cyan'],
  dpr: number,
) {
  const px = pipe.x * w
  const pw = PIPE_W * w
  const half = (PIPE_GAP / 2) * h
  const gy = pipe.gapY * h
  const topH = gy - half
  const botY = gy + half

  const drawSegment = (sy: number, sh: number) => {
    if (sh <= 0) return
    const capH = Math.min(16 * dpr, sh * 0.12)
    ctx.fillStyle = palette.pipe
    ctx.fillRect(px, sy, pw, sh)
    ctx.strokeStyle = palette.pipeEdge
    ctx.lineWidth = 2 * dpr
    ctx.strokeRect(px + dpr, sy + dpr, pw - 2 * dpr, sh - 2 * dpr)
    ctx.fillStyle = palette.pipeEdge
    ctx.globalAlpha = 0.35
    ctx.fillRect(px, sy, pw, capH)
    ctx.globalAlpha = 1
    ctx.fillStyle = 'rgba(255,255,255,0.07)'
    for (let i = 0; i < 3; i += 1) {
      const yy = sy + sh * (0.25 + i * 0.22)
      ctx.fillRect(px + dpr * 2, yy, pw - dpr * 4, dpr)
    }
    ctx.shadowColor = palette.pipeEdge
    ctx.shadowBlur = 8 * dpr
    ctx.strokeRect(px + dpr, sy + dpr, pw - 2 * dpr, sh - 2 * dpr)
    ctx.shadowBlur = 0
  }

  drawSegment(0, topH)
  drawSegment(botY, h - botY)
}

function drawBird(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rot: number,
  palette: (typeof PALETTE)['cyan'],
  dpr: number,
  flash: number,
  now: number,
  alive: boolean,
) {
  const r = BIRD_R * Math.min(ctx.canvas.width, ctx.canvas.height) * 0.95
  const wingLift = Math.sin(now * 22) * r * 0.15

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rot)
  ctx.globalAlpha = alive ? 1 : 0.55
  ctx.shadowColor = palette.bird
  ctx.shadowBlur = (14 + flash * 10) * dpr

  ctx.fillStyle = palette.bird
  ctx.beginPath()
  ctx.ellipse(0, 0, r * 1.1, r, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'rgba(255,255,255,0.26)'
  ctx.beginPath()
  ctx.ellipse(-r * 0.15, r * 0.04 - wingLift, r * 0.45, r * 0.28, -0.4, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = palette.birdCore
  ctx.beginPath()
  ctx.arc(r * 0.15, -r * 0.1, r * 0.45, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(r * 0.35, -r * 0.2, r * 0.18, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#111'
  ctx.beginPath()
  ctx.arc(r * 0.4, -r * 0.2, r * 0.08, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#ffd76a'
  ctx.beginPath()
  ctx.moveTo(r * 0.7, r * 0.05)
  ctx.lineTo(r * 1.15, r * 0.15)
  ctx.lineTo(r * 0.65, r * 0.25)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
  ctx.globalAlpha = 1
  ctx.shadowBlur = 0
}

function drawIdleBird(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  palette: (typeof PALETTE)['cyan'],
  dpr: number,
  now: number,
) {
  const y = h * (0.5 + Math.sin(now * 1.6) * 0.05)
  drawBird(ctx, BIRD_X * w, y, Math.sin(now * 1.4) * 0.07, palette, dpr, 0.4, now, true)
}

function drawPausedTint(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = 'rgba(8, 10, 18, 0.25)'
  ctx.fillRect(0, 0, w, h)
}
