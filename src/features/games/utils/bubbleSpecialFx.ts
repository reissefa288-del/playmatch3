import {
  SPECIAL_IMPACT_LIFE,
  type BubbleKind,
  type LaneState,
  type Projectile,
} from './bubbleShooterEngine'

export type SpecialKind = Exclude<BubbleKind, 'normal'>

export { SPECIAL_IMPACT_LIFE }

type FxPulse = NonNullable<LaneState['fxPulse']>

const TRAIL_COLORS: Record<SpecialKind, [string, string, string]> = {
  fire: ['rgba(255, 60, 0, 0)', 'rgba(255, 140, 50, 0.55)', 'rgba(255, 240, 180, 0.75)'],
  bomb: ['rgba(255, 40, 100, 0)', 'rgba(255, 90, 150, 0.5)', 'rgba(255, 220, 240, 0.65)'],
  rainbow: ['rgba(120, 180, 255, 0)', 'rgba(200, 230, 255, 0.45)', 'rgba(255, 255, 255, 0.7)'],
  ice: ['rgba(100, 200, 255, 0)', 'rgba(180, 235, 255, 0.5)', 'rgba(245, 252, 255, 0.8)'],
}

export function drawSpecialShotTrail(
  ctx: CanvasRenderingContext2D,
  projectile: Projectile,
  w: number,
  h: number,
  bubbleR: number,
  frame: number,
) {
  if (projectile.kind === 'normal') return

  const x = projectile.x * w
  const y = projectile.y * h
  const speed = Math.hypot(projectile.vx, projectile.vy)
  const nx = -projectile.vx / Math.max(0.01, speed)
  const ny = -projectile.vy / Math.max(0.01, speed)
  const len = bubbleR * (projectile.kind === 'bomb' ? 3.1 : 2.6)
  const x0 = x + nx * len
  const y0 = y + ny * len
  const t = frame * 0.1
  const kind = projectile.kind

  ctx.save()
  ctx.lineCap = 'round'
  ctx.globalCompositeOperation = 'lighter'

  const [c0, c1, c2] = TRAIL_COLORS[kind]
  const g = ctx.createLinearGradient(x0, y0, x, y)
  g.addColorStop(0, c0)
  g.addColorStop(0.45, c1)
  g.addColorStop(1, c2)

  ctx.strokeStyle = g
  ctx.lineWidth = bubbleR * (kind === 'bomb' ? 0.95 : 0.72)
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  ctx.lineTo(x, y)
  ctx.stroke()

  if (kind === 'fire') {
    ctx.globalAlpha = 0.35 + Math.sin(t * 4) * 0.12
    ctx.fillStyle = 'rgba(255, 100, 40, 0.35)'
    ctx.beginPath()
    ctx.arc(x + nx * bubbleR * 0.4, y + ny * bubbleR * 0.4, bubbleR * 1.2, 0, Math.PI * 2)
    ctx.fill()
    for (let i = 0; i < 3; i += 1) {
      const a = t * 2 + i * 2
      ctx.fillStyle = `rgba(255, ${140 + i * 30}, 60, 0.4)`
      ctx.beginPath()
      ctx.arc(
        x + Math.cos(a) * bubbleR * 0.5,
        y + Math.sin(a) * bubbleR * 0.5,
        bubbleR * 0.22,
        0,
        Math.PI * 2,
      )
      ctx.fill()
    }
  } else if (kind === 'bomb') {
    const pulse = 0.9 + Math.sin(t * 5) * 0.14
    ctx.strokeStyle = 'rgba(255, 80, 140, 0.35)'
    ctx.lineWidth = bubbleR * 0.2
    ctx.setLineDash([bubbleR * 0.15, bubbleR * 0.28])
    ctx.beginPath()
    ctx.arc(x, y, bubbleR * pulse * 1.15, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = 'rgba(255, 120, 180, 0.2)'
    ctx.beginPath()
    ctx.arc(x, y, bubbleR * 0.55, 0, Math.PI * 2)
    ctx.fill()
  } else if (kind === 'rainbow') {
    const hue = (t * 48) % 360
    ctx.strokeStyle = `hsla(${hue}, 92%, 68%, 0.55)`
    ctx.lineWidth = bubbleR * 0.42
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.strokeStyle = `hsla(${(hue + 120) % 360}, 88%, 72%, 0.4)`
    ctx.lineWidth = bubbleR * 0.22
    ctx.beginPath()
    ctx.moveTo(x0 + ny * bubbleR * 0.08, y0 - nx * bubbleR * 0.08)
    ctx.lineTo(x + ny * bubbleR * 0.08, y - nx * bubbleR * 0.08)
    ctx.stroke()
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
    ctx.beginPath()
    ctx.arc(x, y, bubbleR * 0.45, 0, Math.PI * 2)
    ctx.fill()
  } else if (kind === 'ice') {
    ctx.strokeStyle = 'rgba(220, 248, 255, 0.55)'
    ctx.lineWidth = bubbleR * 0.28
    for (let i = 0; i < 4; i += 1) {
      const a = t + i * (Math.PI / 2)
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + Math.cos(a) * bubbleR * 0.9, y + Math.sin(a) * bubbleR * 0.9)
      ctx.stroke()
    }
    for (let i = 0; i < 4; i += 1) {
      const a = t * 1.2 + i * 1.55
      const sx = x + Math.cos(a) * bubbleR * 0.65
      const sy = y + Math.sin(a) * bubbleR * 0.65
      const s = bubbleR * 0.14
      ctx.fillStyle = 'rgba(235, 250, 255, 0.7)'
      ctx.beginPath()
      ctx.moveTo(sx, sy - s)
      ctx.lineTo(sx + s * 0.75, sy)
      ctx.lineTo(sx, sy + s)
      ctx.lineTo(sx - s * 0.75, sy)
      ctx.closePath()
      ctx.fill()
    }
  }

  ctx.restore()
}

export function drawSpecialProjectileAura(
  ctx: CanvasRenderingContext2D,
  projectile: Projectile,
  w: number,
  h: number,
  bubbleR: number,
  frame: number,
) {
  if (projectile.kind === 'normal') return
  const x = projectile.x * w
  const y = projectile.y * h
  const pulse = 1 + Math.sin(frame * 0.14) * 0.1
  const kind = projectile.kind

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'

  const outerR = bubbleR * (kind === 'bomb' ? 1.65 : 1.5) * pulse
  const innerColors: Record<SpecialKind, [string, string, string]> = {
    fire: ['rgba(255, 180, 80, 0.45)', 'rgba(255, 80, 20, 0.22)', 'rgba(255, 40, 0, 0)'],
    bomb: ['rgba(255, 120, 180, 0.42)', 'rgba(255, 50, 100, 0.2)', 'rgba(255, 20, 60, 0)'],
    rainbow: ['rgba(255, 255, 255, 0.38)', 'rgba(160, 210, 255, 0.22)', 'rgba(80, 140, 255, 0)'],
    ice: ['rgba(220, 248, 255, 0.42)', 'rgba(140, 220, 255, 0.2)', 'rgba(60, 160, 255, 0)'],
  }

  const [a, b, c] = innerColors[kind]
  const g = ctx.createRadialGradient(x, y, 0, x, y, outerR)
  g.addColorStop(0, a)
  g.addColorStop(0.45, b)
  g.addColorStop(1, c)
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, outerR, 0, Math.PI * 2)
  ctx.fill()

  if (kind === 'rainbow') {
    const hue = (frame * 3.5) % 360
    ctx.strokeStyle = `hsla(${hue}, 90%, 75%, 0.55)`
    ctx.lineWidth = Math.max(1, bubbleR * 0.12)
    ctx.beginPath()
    ctx.arc(x, y, bubbleR * 1.05 * pulse, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.restore()
}

export function drawSpecialImpactPulse(
  ctx: CanvasRenderingContext2D,
  pulse: FxPulse,
  w: number,
  h: number,
  dpr: number,
  frame: number,
) {
  if (pulse.life <= 0) return

  const x = pulse.x * w
  const y = pulse.y * h
  const progress = 1 - pulse.life / SPECIAL_IMPACT_LIFE
  const alpha = Math.min(1, pulse.life * 2.8) * (1 - progress * 0.28)
  const baseR = Math.max(16 * dpr, w * 0.095) * (0.75 + progress * 0.85)
  const t = frame * 0.12

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'

  switch (pulse.kind) {
    case 'fire': {
      const bloom = ctx.createRadialGradient(x, y, 0, x, y, baseR * 1.45)
      bloom.addColorStop(0, `rgba(255, 245, 220, ${alpha * 0.7})`)
      bloom.addColorStop(0.25, `rgba(255, 160, 60, ${alpha * 0.5})`)
      bloom.addColorStop(0.55, `rgba(255, 80, 20, ${alpha * 0.28})`)
      bloom.addColorStop(1, 'rgba(255, 40, 0, 0)')
      ctx.fillStyle = bloom
      ctx.beginPath()
      ctx.arc(x, y, baseR * 1.45, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = `rgba(255, 200, 100, ${alpha * 0.55})`
      ctx.lineWidth = Math.max(1.5, 2.2 * dpr)
      for (let ray = 0; ray < 8; ray += 1) {
        const ang = (ray / 8) * Math.PI * 2 + progress * 0.5
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + Math.cos(ang) * baseR * (0.9 + progress * 0.4), y + Math.sin(ang) * baseR * (0.9 + progress * 0.4))
        ctx.stroke()
      }
      for (let i = 0; i < 5; i += 1) {
        const flick = Math.sin(t * 6 + i * 1.2) * 0.15
        ctx.globalAlpha = alpha * 0.5
        ctx.fillStyle = i % 2 === 0 ? '#ffc04a' : '#ff6a20'
        ctx.beginPath()
        ctx.moveTo(x, y - baseR * (0.5 + flick))
        ctx.quadraticCurveTo(x + baseR * 0.28, y, x, y + baseR * 0.2)
        ctx.quadraticCurveTo(x - baseR * 0.28, y, x, y - baseR * (0.5 + flick))
        ctx.fill()
      }
      break
    }
    case 'bomb': {
      for (let ring = 0; ring < 3; ring += 1) {
        const r = baseR * (0.4 + progress * (0.95 + ring * 0.22))
        ctx.strokeStyle = `rgba(255, ${120 + ring * 30}, ${180 - ring * 20}, ${alpha * (0.75 - ring * 0.18)})`
        ctx.lineWidth = Math.max(1.8, (2.6 - ring * 0.4) * dpr)
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.stroke()
      }
      const flash = ctx.createRadialGradient(x, y, 0, x, y, baseR * 0.65)
      flash.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.75})`)
      flash.addColorStop(0.35, `rgba(255, 140, 200, ${alpha * 0.45})`)
      flash.addColorStop(1, 'rgba(255, 40, 100, 0)')
      ctx.fillStyle = flash
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.arc(x, y, baseR * 0.65, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = `rgba(255, 90, 150, ${alpha * 0.25})`
      ctx.beginPath()
      ctx.arc(x, y, baseR * (1.1 + progress * 0.35), 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'rainbow': {
      const hue = (t * 55) % 360
      ctx.globalAlpha = alpha * 0.85
      ctx.strokeStyle = `hsla(${hue}, 95%, 72%, 0.9)`
      ctx.lineWidth = Math.max(1.4, 2.2 * dpr)
      for (let bolt = 0; bolt < 4; bolt += 1) {
        ctx.beginPath()
        let px = x + (bolt - 1.5) * baseR * 0.22
        let py = y - baseR * 0.5
        ctx.moveTo(px, py)
        for (let seg = 0; seg < 5; seg += 1) {
          px += Math.sin(t * 7 + bolt + seg * 1.4) * baseR * 0.2
          py += baseR * 0.22
          ctx.lineTo(px, py)
        }
        ctx.stroke()
      }
      const ringHue = (hue + 140) % 360
      ctx.strokeStyle = `hsla(${ringHue}, 90%, 78%, ${alpha * 0.65})`
      ctx.lineWidth = Math.max(1.2, 1.8 * dpr)
      ctx.beginPath()
      ctx.arc(x, y, baseR * (0.55 + progress * 0.55), 0, Math.PI * 2)
      ctx.stroke()
      const flash = ctx.createRadialGradient(x, y, 0, x, y, baseR)
      flash.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.6})`)
      flash.addColorStop(0.4, `rgba(180, 220, 255, ${alpha * 0.35})`)
      flash.addColorStop(1, 'rgba(100, 160, 255, 0)')
      ctx.fillStyle = flash
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.arc(x, y, baseR, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'ice': {
      const frost = ctx.createRadialGradient(x, y, 0, x, y, baseR * 1.35)
      frost.addColorStop(0, `rgba(250, 255, 255, ${alpha * 0.65})`)
      frost.addColorStop(0.35, `rgba(180, 235, 255, ${alpha * 0.4})`)
      frost.addColorStop(0.7, `rgba(100, 190, 255, ${alpha * 0.15})`)
      frost.addColorStop(1, 'rgba(60, 140, 220, 0)')
      ctx.fillStyle = frost
      ctx.beginPath()
      ctx.arc(x, y, baseR * 1.35, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = `rgba(210, 245, 255, ${alpha * 0.8})`
      ctx.lineWidth = Math.max(1.2, 1.6 * dpr)
      for (let ray = 0; ray < 8; ray += 1) {
        const ang = (ray / 8) * Math.PI * 2 + progress * 0.35
        const r0 = baseR * 0.15
        const r1 = baseR * (0.65 + progress * 0.55)
        ctx.beginPath()
        ctx.moveTo(x + Math.cos(ang) * r0, y + Math.sin(ang) * r0)
        ctx.lineTo(x + Math.cos(ang) * r1, y + Math.sin(ang) * r1)
        ctx.stroke()
      }
      ctx.globalAlpha = alpha * 0.65
      ctx.fillStyle = 'rgba(240, 252, 255, 0.9)'
      for (let c = 0; c < 7; c += 1) {
        const ang = c * 0.9 + t
        const cx = x + Math.cos(ang) * baseR * (0.35 + progress * 0.25)
        const cy = y + Math.sin(ang) * baseR * (0.35 + progress * 0.25)
        const s = baseR * (0.11 + (c % 2) * 0.03)
        ctx.beginPath()
        ctx.moveTo(cx, cy - s)
        ctx.lineTo(cx + s * 0.75, cy)
        ctx.lineTo(cx, cy + s)
        ctx.lineTo(cx - s * 0.75, cy)
        ctx.closePath()
        ctx.fill()
      }
      break
    }
  }

  ctx.restore()
}
