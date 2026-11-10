import { useEffect, useRef } from 'react'
import type { NeonEvent, NeonLaneView } from './useNeonBrickMatch'

const ROW_COLORS = ['#7af0ff', '#8d7bff', '#ff5ad1', '#ffb020', '#4cd964']
const COLS = 8
const ROWS = 5

type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string }

type NeonBrickCanvasProps = {
  lane: NeonLaneView
  accent: string
  events: NeonEvent[]
  active?: boolean
}

export function NeonBrickCanvas({ lane, accent, events, active = true }: NeonBrickCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const laneRef = useRef(lane)
  laneRef.current = lane

  useEffect(() => {
    for (const event of events) {
      if (event.x == null || event.y == null) continue
      const color = event.row == null ? accent : ROW_COLORS[event.row % ROW_COLORS.length]
      const count = event.type === 'brick' ? 8 : 3
      for (let index = 0; index < count; index += 1) {
        particles.current.push({
          x: event.x,
          y: event.y,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.7) * 0.45,
          life: 0.45,
          color,
        })
      }
    }
    if (particles.current.length > 48) particles.current.splice(0, particles.current.length - 48)
  }, [accent, events])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !active) return
    let frame = 0
    let last = performance.now()

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const parent = canvas.parentElement
      if (!parent) {
        frame = requestAnimationFrame(draw)
        return
      }
      const width = parent.clientWidth
      const height = parent.clientHeight
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      if (canvas.width !== Math.floor(width * ratio) || canvas.height !== Math.floor(height * ratio)) {
        canvas.width = Math.floor(width * ratio)
        canvas.height = Math.floor(height * ratio)
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
      }
      const context = canvas.getContext('2d')
      if (context) {
        context.setTransform(ratio, 0, 0, ratio, 0, 0)
        context.clearRect(0, 0, width, height)
        paint(context, width, height, laneRef.current, accent, particles.current, dt)
      }
      frame = requestAnimationFrame(draw)
    }

    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [accent, active])

  return <canvas ref={canvasRef} className="pm-neon-canvas" />
}

function paint(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  lane: NeonLaneView,
  accent: string,
  particles: Particle[],
  dt: number,
) {
  for (let index = 0; index < lane.bricks.length; index += 1) {
    const hp = lane.bricks[index] ?? 0
    if (hp <= 0) continue
    const rect = brickRect(index)
    const row = Math.floor(index / COLS)
    const color = hp === 9 ? '#9aa4b8' : ROW_COLORS[row % ROW_COLORS.length]
    const x = rect.x * width
    const y = rect.y * height
    const w = rect.w * width
    const h = rect.h * height
    context.fillStyle = color
    context.globalAlpha = hp === 9 ? 0.55 : hp === 1 ? 1 : 0.72
    roundRect(context, x, y, w, h, 6)
    context.fill()
    context.globalAlpha = 1
    context.strokeStyle = 'rgba(255,255,255,0.45)'
    context.stroke()
  }

  const paddleW = 0.3 * width
  const paddleH = Math.max(8, 0.022 * height)
  const paddleX = lane.paddleX * width - paddleW / 2
  const paddleY = 0.9 * height
  context.shadowColor = accent
  context.shadowBlur = 16
  context.fillStyle = '#f7fbff'
  roundRect(context, paddleX, paddleY, paddleW, paddleH, 8)
  context.fill()

  if (lane.ball.active) {
    context.fillStyle = '#fff'
    context.beginPath()
    context.arc(lane.ball.x * width, lane.ball.y * height, Math.max(5, 0.018 * width), 0, Math.PI * 2)
    context.fill()
  }
  context.shadowBlur = 0

  for (const particle of particles) {
    particle.x += particle.vx * dt
    particle.y += particle.vy * dt
    particle.life -= dt
    if (particle.life <= 0) continue
    context.globalAlpha = Math.max(0, particle.life * 2)
    context.fillStyle = particle.color
    context.beginPath()
    context.arc(particle.x * width, particle.y * height, 3, 0, Math.PI * 2)
    context.fill()
  }
  context.globalAlpha = 1
  for (let index = particles.length - 1; index >= 0; index -= 1) {
    if (particles[index].life <= 0) particles.splice(index, 1)
  }
}

function brickRect(index: number) {
  const col = index % COLS
  const row = Math.floor(index / COLS)
  const gapX = 0.012
  const gapY = 0.01
  const zoneTop = 0.07
  const zoneH = 0.38
  const w = (1 - gapX * (COLS + 1)) / COLS
  const h = (zoneH - gapY * (ROWS + 1)) / ROWS
  return {
    x: gapX + col * (w + gapX),
    y: zoneTop + gapY + row * (h + gapY),
    w,
    h,
  }
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath()
  context.roundRect(x, y, width, height, radius)
}
