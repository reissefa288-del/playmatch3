import { useEffect, useRef, type MutableRefObject, type RefObject } from 'react'
import {
  BUBBLE_RADIUS,
  DANGER_LINE_Y,
  getDangerProximity,
  GRID_H_MARGIN,
  GRID_TOP,
  SHOOTER_X,
  SHOOTER_Y,
  bubbleDrawRadiusPx,
  bubblePos,
  sampleAimGuideDots,
  setPlayfieldAspect,
  type BubbleColor,
  type BubbleKind,
  type LaneState,
} from '../utils/bubbleShooterEngine'
import {
  BUBBLE_RENDER_HEX,
  canvasDpr,
  createBubbleVisualState,
  drawBubbleCached,
  drawBubbleLive,
  drawPopEffects,
  drawSparkParticles,
  placementScale,
  prepareCanvasCtx,
  syncBubbleVisuals,
} from '../utils/bubbleCanvasVisuals'
import {
  drawSpecialImpactPulse,
  drawSpecialProjectileAura,
  drawSpecialShotTrail,
} from '../utils/bubbleSpecialFx'

type BubbleShooterCanvasProps = {
  laneRef: RefObject<LaneState>
  accent: 'cyan' | 'pink'
  showShooterExtras?: boolean
  active?: boolean
  showAimGuide?: boolean
  showRivalAim?: boolean
}

const ACCENT = {
  cyan: {
    dot: 'rgba(34, 200, 255, 0.95)',
    ring: 'rgba(34, 200, 255, 0.9)',
    trail: 'rgba(120, 220, 255, 0.38)',
    danger: 'rgba(255, 90, 120, 0.42)',
    shooter: ['#081828', '#1a5880', '#081828'] as const,
    floor: 'rgba(34, 200, 255, 0.1)',
  },
  pink: {
    dot: 'rgba(255, 58, 120, 0.95)',
    ring: 'rgba(255, 58, 120, 0.9)',
    trail: 'rgba(255, 130, 180, 0.38)',
    danger: 'rgba(255, 90, 120, 0.42)',
    shooter: ['#180818', '#602048', '#180818'] as const,
    floor: 'rgba(255, 58, 120, 0.1)',
  },
}

export function BubbleShooterCanvas({
  laneRef,
  accent,
  showShooterExtras = false,
  active = true,
  showAimGuide = true,
  showRivalAim = false,
}: BubbleShooterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const accentRef = useRef(accent)
  const extrasRef = useRef(showShooterExtras)
  const aimGuideRef = useRef(showAimGuide)
  const rivalAimRef = useRef(showRivalAim)
  const visualRef = useRef(createBubbleVisualState())
  const sizeRef = useRef({ cssW: 0, cssH: 0, w: 0, h: 0, dpr: 1 })
  const frameRef = useRef(0)
  const aimTargetRef = useRef<{ row: number; col: number } | null>(null)
  accentRef.current = accent
  extrasRef.current = showShooterExtras
  aimGuideRef.current = showAimGuide
  rivalAimRef.current = showRivalAim

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let raf = 0

    const resize = () => {
      const dpr = canvasDpr()
      const rect = canvas.getBoundingClientRect()
      const cssW = Math.max(1, rect.width)
      const cssH = Math.max(1, rect.height)
      const w = Math.max(1, Math.floor(cssW * dpr))
      const h = Math.max(1, Math.floor(cssH * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      sizeRef.current = { cssW, cssH, w, h, dpr }
      setPlayfieldAspect(cssW, cssH)
    }

    resize()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null
    ro?.observe(canvas)

    const draw = () => {
      const lane = laneRef.current
      if (!lane) return

      const { w, h, dpr } = sizeRef.current
      if (w < 1 || h < 1) return

      frameRef.current += 1
      prepareCanvasCtx(ctx)
      syncBubbleVisuals(visualRef.current, lane, w, h)

      const bubbleR = bubbleDrawRadiusPx(w)
      const palette = ACCENT[accentRef.current]
      const hasFx =
        visualRef.current.pops.length > 0 ||
        visualRef.current.placements.size > 0 ||
        lane.particles.length > 0 ||
        lane.fxPulse != null ||
        lane.projectile?.active

      ctx.clearRect(0, 0, w, h)
      drawArenaDepth(ctx, w, h, palette.floor)
      const dangerNear = getDangerProximity(lane)
      drawDangerLine(ctx, w, h, palette.danger, dpr, dangerNear, frameRef.current)

      if (aimGuideRef.current && !lane.projectile?.active && lane.canShoot) {
        drawAimTrajectory(
          ctx,
          lane,
          w,
          h,
          palette.trail,
          palette.ring,
          dpr,
          bubbleR,
          aimTargetRef,
        )
      } else {
        aimTargetRef.current = null
      }

      if (rivalAimRef.current && !lane.projectile?.active && lane.canShoot) {
        drawRivalAimLine(ctx, lane, w, h, palette.trail, dpr, bubbleR)
      }

      ctx.save()
      ctx.beginPath()
      ctx.rect(
        GRID_H_MARGIN * w * 0.35,
        GRID_TOP * h * 0.35,
        w * (1 - GRID_H_MARGIN * 0.7),
        h * (1 - GRID_TOP * 0.2),
      )
      ctx.clip()

      for (const [key, color] of lane.grid) {
        const comma = key.indexOf(',')
        const row = Number(key.slice(0, comma))
        const col = Number(key.slice(comma + 1))
        const pos = bubblePos(row, col)
        const bx = pos.x * w
        const by = pos.y * h
        const br = bubbleR * placementScale(key, visualRef.current)
        drawBubbleCached(ctx, bx, by, br, color)
      }

      if (hasFx) {
        drawPopEffects(ctx, visualRef.current.pops, bubbleR, dpr)
        drawSparkParticles(ctx, lane.particles, w, h, dpr)
        if (lane.fxPulse) {
          drawSpecialImpactPulse(ctx, lane.fxPulse, w, h, dpr, frameRef.current)
        }
      }

      if (lane.projectile?.active) {
        const proj = lane.projectile
        if (proj.kind !== 'normal') {
          drawSpecialShotTrail(ctx, proj, w, h, bubbleR, frameRef.current)
          drawSpecialProjectileAura(ctx, proj, w, h, bubbleR, frameRef.current)
        }
        drawBubbleLive(ctx, proj.x * w, proj.y * h, bubbleR, proj.color, proj.kind)
      }

      drawShooter(
        ctx,
        SHOOTER_X * w,
        SHOOTER_Y * h,
        w,
        h,
        lane.currentColor,
        lane.nextColor,
        lane.currentKind,
        lane.nextKind,
        accentRef.current,
        dpr,
        extrasRef.current,
      )
      drawFloorReflection(ctx, SHOOTER_X * w, SHOOTER_Y * h, w, h, lane.currentColor, dpr)
      ctx.restore()
    }

    const loop = () => {
      draw()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      ro?.disconnect()
    }
  }, [active, laneRef, showAimGuide, showRivalAim])

  return <canvas ref={canvasRef} className="pm-bubble-arena__canvas" />
}

type AimTarget = { row: number; col: number }

function resolveStableAimTarget(
  raw: AimTarget | null,
  stableRef: MutableRefObject<AimTarget | null>,
): AimTarget | null {
  if (!raw) {
    stableRef.current = null
    return null
  }
  const prev = stableRef.current
  if (!prev) {
    stableRef.current = { row: raw.row, col: raw.col }
    return stableRef.current
  }
  if (prev.row === raw.row && prev.col === raw.col) {
    return prev
  }
  const prevPos = bubblePos(prev.row, prev.col)
  const nextPos = bubblePos(raw.row, raw.col)
  const dist = Math.hypot(nextPos.x - prevPos.x, nextPos.y - prevPos.y)
  if (dist > 0.055) {
    stableRef.current = { row: raw.row, col: raw.col }
    return stableRef.current
  }
  return prev
}

function drawAimTrajectory(
  ctx: CanvasRenderingContext2D,
  lane: LaneState,
  w: number,
  h: number,
  trail: string,
  ring: string,
  dpr: number,
  bubbleR: number,
  stableTargetRef: MutableRefObject<AimTarget | null>,
) {
  const { dots, pathVertices, target: rawTarget } = sampleAimGuideDots(lane.grid, lane.aimAngle)
  const target = resolveStableAimTarget(rawTarget, stableTargetRef)
  const dotR = Math.max(1.1 * dpr, bubbleR * 0.1)
  const ringR = bubbleR * 0.92

  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = trail

  if (pathVertices.length >= 2) {
    ctx.setLineDash([5 * dpr, 9 * dpr])
    ctx.globalAlpha = 0.45
    ctx.lineWidth = 1.5 * dpr
    ctx.beginPath()
    ctx.moveTo(pathVertices[0]!.x * w, pathVertices[0]!.y * h)
    for (let i = 1; i < pathVertices.length; i += 1) {
      ctx.lineTo(pathVertices[i]!.x * w, pathVertices[i]!.y * h)
    }
    ctx.stroke()
    ctx.setLineDash([])
  }

  ctx.globalAlpha = 0.5
  ctx.fillStyle = trail
  for (let i = 0; i < dots.length; i += 1) {
    const px = dots[i]!.x * w
    const py = dots[i]!.y * h
    ctx.beginPath()
    ctx.arc(px, py, dotR, 0, Math.PI * 2)
    ctx.fill()
  }

  if (target) {
    const pos = bubblePos(target.row, target.col)
    const tx = pos.x * w
    const ty = pos.y * h

    ctx.globalAlpha = 0.72
    ctx.strokeStyle = ring
    ctx.lineWidth = 1.5 * dpr
    ctx.beginPath()
    ctx.arc(tx, ty, ringR, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.globalAlpha = 1
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
  currentKind: BubbleKind,
  nextKind: BubbleKind,
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

  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.beginPath()
  ctx.ellipse(x, y + ph * 0.35, pw * 0.55, ph * 0.55, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = palette.ring
  ctx.lineWidth = 1.6 * dpr
  ctx.beginPath()
  ctx.arc(x, cy, ringR, 0, Math.PI * 2)
  ctx.stroke()

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

  drawBubbleLive(ctx, x, cy - ph * 0.72, BUBBLE_RADIUS * w * 2, color, currentKind)

  const nx = x + ringR * 1.08
  const ny = cy
  drawBubbleLive(ctx, nx, ny, BUBBLE_RADIUS * w * 1.42, nextColor, nextKind)

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
  const hex = BUBBLE_RENDER_HEX[color]
  const grad = ctx.createLinearGradient(0, y, 0, y + w * 0.12)
  grad.addColorStop(0, hexToRgba(hex, 0.14))
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.ellipse(x, y + 8 * dpr, w * 0.14, w * 0.04, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawDangerLine(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  stroke: string,
  dpr: number,
  proximity: number,
  frame: number,
) {
  const y = DANGER_LINE_Y * h
  const pulse = proximity > 0 ? 0.55 + Math.sin(frame * 0.14) * 0.25 * proximity : 0
  const alpha = 0.42 + proximity * 0.48 + pulse * proximity
  const width = (1.2 + proximity * 1.4) * dpr

  ctx.save()
  if (proximity > 0.35) {
    const glow = ctx.createLinearGradient(0, y - 8 * dpr, 0, y + 10 * dpr)
    glow.addColorStop(0, 'rgba(255, 70, 100, 0)')
    glow.addColorStop(1, `rgba(255, 70, 100, ${(proximity * 0.22).toFixed(3)})`)
    ctx.fillStyle = glow
    ctx.fillRect(GRID_H_MARGIN * w * 0.5, y, w * (1 - GRID_H_MARGIN), h - y)
  }
  ctx.setLineDash(proximity > 0.2 ? [4 * dpr, 5 * dpr] : [5 * dpr, 7 * dpr])
  ctx.strokeStyle = stroke
  ctx.lineWidth = width
  ctx.globalAlpha = alpha
  ctx.beginPath()
  ctx.moveTo(GRID_H_MARGIN * w * 0.55, y)
  ctx.lineTo(w * (1 - GRID_H_MARGIN * 0.55), y)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()
}

function drawRivalAimLine(
  ctx: CanvasRenderingContext2D,
  lane: LaneState,
  w: number,
  h: number,
  trail: string,
  dpr: number,
  bubbleR: number,
) {
  const sx = SHOOTER_X * w
  const sy = SHOOTER_Y * h
  const len = Math.min(w, h) * 0.32
  const ex = sx + Math.cos(lane.aimAngle) * len
  const ey = sy + Math.sin(lane.aimAngle) * len

  ctx.save()
  ctx.strokeStyle = trail
  ctx.lineWidth = 2 * dpr
  ctx.globalAlpha = 0.55
  ctx.setLineDash([6 * dpr, 8 * dpr])
  ctx.beginPath()
  ctx.moveTo(sx, sy)
  ctx.lineTo(ex, ey)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.beginPath()
  ctx.arc(ex, ey, bubbleR * 0.35, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255, 120, 180, 0.75)'
  ctx.lineWidth = 1.5 * dpr
  ctx.globalAlpha = 0.7
  ctx.stroke()
  ctx.restore()
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
