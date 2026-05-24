import { useEffect, useRef, type RefObject } from 'react'
import {
  BLOCK_COLS,
  BLOCK_ROWS,
  getPiecePreviewOffsets,
  PIECE_COLOR,
  type BlockColor,
  type BlockLaneView,
  type BlockParticle,
  type PieceKind,
} from '../utils/blockEngine'

const COLOR_HEX: Record<BlockColor, string> = {
  purple: '#9d6cff',
  red: '#ff4a6a',
  orange: '#ff8c3a',
  yellow: '#ffd54a',
  green: '#42f090',
  cyan: '#22d4ff',
  blue: '#4a8cff',
}

const COLOR_GLOW: Record<BlockColor, string> = {
  purple: 'rgba(157, 108, 255, 0.55)',
  red: 'rgba(255, 74, 106, 0.55)',
  orange: 'rgba(255, 140, 58, 0.55)',
  yellow: 'rgba(255, 213, 74, 0.5)',
  green: 'rgba(66, 240, 144, 0.5)',
  cyan: 'rgba(34, 212, 255, 0.55)',
  blue: 'rgba(74, 140, 255, 0.55)',
}

type BlockBoardCanvasProps = {
  laneRef: RefObject<BlockLaneView>
  accent: 'cyan' | 'pink'
}

export function BlockBoardCanvas({ laneRef, accent }: BlockBoardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0

    const draw = () => {
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

      const padX = w * 0.06
      const padY = h * 0.04
      const innerW = w - padX * 2
      const innerH = h - padY * 2
      const cellW = innerW / BLOCK_COLS
      const cellH = innerH / BLOCK_ROWS

      ctx.clearRect(0, 0, w, h)
      drawBoardBg(ctx, w, h, accent, dpr)

      if (lane.lineFlash && lane.lineFlash > 0.02) {
        ctx.save()
        ctx.globalAlpha = lane.lineFlash * 0.35
        ctx.fillStyle = accent === 'cyan' ? 'rgba(34, 212, 255, 0.9)' : 'rgba(255, 58, 120, 0.9)'
        ctx.fillRect(padX, padY, innerW, innerH)
        ctx.restore()
      }

      for (let row = 0; row < BLOCK_ROWS; row += 1) {
        for (let col = 0; col < BLOCK_COLS; col += 1) {
          const color = lane.grid[row]?.[col]
          if (!color) continue
          drawBlock(
            ctx,
            padX + col * cellW + cellW * 0.5,
            padY + row * cellH + cellH * 0.5,
            Math.min(cellW, cellH) * 0.88,
            color,
            dpr,
            false,
            color === 'purple',
          )
        }
      }

      if (lane.clearParticles?.length) {
        for (const particle of lane.clearParticles) {
          drawParticle(ctx, padX, padY, cellW, cellH, particle, dpr)
        }
      }

      if (lane.ghostPiece?.cells.length) {
        for (const cell of lane.ghostPiece.cells) {
          drawGhost(
            ctx,
            padX + cell.col * cellW + cellW * 0.5,
            padY + cell.row * cellH + cellH * 0.5,
            Math.min(cellW, cellH) * 0.88,
            cell.color,
            dpr,
          )
        }
      }

      if (lane.activePiece) {
        const { cells, trail, scale = 1 } = lane.activePiece
        if (cells.length > 0) {
          const centerCol = cells.reduce((s, c) => s + c.col, 0) / cells.length
          const centerRow = cells.reduce((s, c) => s + c.row, 0) / cells.length
          const cx = padX + centerCol * cellW + cellW * 0.5
          const cy = padY + centerRow * cellH + cellH * 0.5

          if (trail) {
            const minRow = Math.min(...cells.map((c) => c.row))
            if (Number.isFinite(minRow) && minRow > 0) {
              const trailCol = cells[0]?.col ?? 4
              for (let row = 0; row < minRow; row += 1) {
                const alpha = 0.06 + (row / minRow) * 0.2
                drawTrail(
                  ctx,
                  padX + trailCol * cellW + cellW * 0.5,
                  padY + row * cellH + cellH * 0.5,
                  Math.min(cellW, cellH) * 0.32,
                  cells[0]?.color ?? 'cyan',
                  alpha,
                  dpr,
                )
              }
            }
          }
          for (const cell of cells) {
            if (cell.row < 0 || cell.row >= BLOCK_ROWS) continue
            const bx = padX + cell.col * cellW + cellW * 0.5
            const by = padY + cell.row * cellH + cellH * 0.5
            const sx = cx + (bx - cx) * scale
            const sy = cy + (by - cy) * scale
            drawBlock(
              ctx,
              sx,
              sy,
              Math.min(cellW, cellH) * 0.9 * scale,
              cell.color,
              dpr,
              true,
              false,
            )
          }
        }
      }

      if (lane.holdKind !== undefined) {
        drawHoldPanel(ctx, w, h, lane.holdKind ?? null, accent, dpr)
      }

      if (lane.nextQueue?.length) {
        drawNextPanel(ctx, w, h, lane.nextQueue, accent, dpr)
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [accent, laneRef])

  return <canvas ref={canvasRef} className="pm-block-arena__canvas" />
}

function drawHoldPanel(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  kind: PieceKind | null,
  accent: 'cyan' | 'pink',
  dpr: number,
) {
  const panelW = w * 0.22
  const panelH = h * 0.16
  const x = w * 0.02
  const y = h * 0.03
  const border = accent === 'cyan' ? 'rgba(34, 212, 255, 0.5)' : 'rgba(255, 58, 120, 0.5)'

  ctx.save()
  ctx.fillStyle = 'rgba(6, 10, 28, 0.82)'
  roundRect(ctx, x, y, panelW, panelH, 6 * dpr)
  ctx.fill()
  ctx.strokeStyle = border
  ctx.lineWidth = 1.2 * dpr
  roundRect(ctx, x, y, panelW, panelH, 6 * dpr)
  ctx.stroke()

  ctx.fillStyle = 'rgba(200, 220, 255, 0.75)'
  ctx.font = `${Math.max(7, 7 * dpr)}px Orbitron, sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('HOLD', x + panelW * 0.5, y + 10 * dpr)

  if (!kind) {
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.setLineDash([4 * dpr, 4 * dpr])
    roundRect(ctx, x + panelW * 0.22, y + 16 * dpr, panelW * 0.56, panelH * 0.55, 4 * dpr)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()
    return
  }

  const cell = Math.min(panelW, panelH) * 0.16
  const offsets = getPiecePreviewOffsets(kind)
  const color = PIECE_COLOR[kind]
  const ox = x + panelW * 0.5 - cell * 1.5
  const oy = y + 18 * dpr
  for (const off of offsets) {
    drawBlock(
      ctx,
      ox + off.col * cell + cell * 0.5,
      oy + off.row * cell + cell * 0.5,
      cell * 0.85,
      color,
      dpr,
      false,
      false,
    )
  }
  ctx.restore()
}

function drawParticle(
  ctx: CanvasRenderingContext2D,
  padX: number,
  padY: number,
  cellW: number,
  cellH: number,
  particle: BlockParticle,
  dpr: number,
) {
  if (particle.row < -1 || particle.row > BLOCK_ROWS) return
  const x = padX + particle.col * cellW + cellW * 0.5
  const y = padY + particle.row * cellH + cellH * 0.5
  const hex = COLOR_HEX[particle.color]
  ctx.save()
  ctx.globalAlpha = Math.max(0, particle.life)
  ctx.fillStyle = hex
  ctx.shadowColor = COLOR_GLOW[particle.color]
  ctx.shadowBlur = 10 * dpr * particle.size
  ctx.beginPath()
  ctx.arc(x, y, Math.min(cellW, cellH) * 0.22 * particle.size, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawNextPanel(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  queue: PieceKind[],
  accent: 'cyan' | 'pink',
  dpr: number,
) {
  const panelW = w * 0.22
  const panelH = h * 0.2
  const x = w - panelW - w * 0.02
  const y = h * 0.03
  const border = accent === 'cyan' ? 'rgba(34, 212, 255, 0.5)' : 'rgba(255, 58, 120, 0.5)'

  ctx.save()
  ctx.fillStyle = 'rgba(6, 10, 28, 0.82)'
  roundRect(ctx, x, y, panelW, panelH, 6 * dpr)
  ctx.fill()
  ctx.strokeStyle = border
  ctx.lineWidth = 1.2 * dpr
  roundRect(ctx, x, y, panelW, panelH, 6 * dpr)
  ctx.stroke()

  ctx.fillStyle = 'rgba(200, 220, 255, 0.75)'
  ctx.font = `${Math.max(7, 7 * dpr)}px Orbitron, sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('NEXT', x + panelW * 0.5, y + 10 * dpr)

  const cell = Math.min(panelW, panelH) * 0.14
  const kinds = queue.slice(0, 3)
  kinds.forEach((kind, index) => {
    const offsets = getPiecePreviewOffsets(kind)
    const color = PIECE_COLOR[kind]
    const ox = x + panelW * 0.5 - cell * 1.5
    const oy = y + 16 * dpr + index * cell * 2.4
    const scale = index === 0 ? 1 : 0.72 - index * 0.08
    for (const off of offsets) {
      drawBlock(
        ctx,
        ox + off.col * cell * scale + cell * scale * 0.5,
        oy + off.row * cell * scale + cell * scale * 0.5,
        cell * scale * 0.85,
        color,
        dpr,
        index === 0,
        false,
      )
    }
  })
  ctx.restore()
}

function drawBoardBg(ctx: CanvasRenderingContext2D, w: number, h: number, accent: 'cyan' | 'pink', dpr: number) {
  const border = accent === 'cyan' ? 'rgba(34, 212, 255, 0.55)' : 'rgba(255, 58, 120, 0.55)'
  const glow = accent === 'cyan' ? 'rgba(34, 212, 255, 0.18)' : 'rgba(255, 58, 120, 0.18)'

  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, 'rgba(8, 12, 32, 0.95)')
  g.addColorStop(1, 'rgba(4, 6, 18, 0.98)')
  ctx.fillStyle = g
  roundRect(ctx, w * 0.03, h * 0.02, w * 0.94, h * 0.96, 10 * dpr)
  ctx.fill()

  ctx.strokeStyle = border
  ctx.lineWidth = 1.8 * dpr
  ctx.shadowColor = border
  ctx.shadowBlur = 12 * dpr
  roundRect(ctx, w * 0.03, h * 0.02, w * 0.94, h * 0.96, 10 * dpr)
  ctx.stroke()
  ctx.shadowBlur = 0

  const innerGlow = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.55)
  innerGlow.addColorStop(0, glow)
  innerGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = innerGlow
  ctx.fillRect(w * 0.05, h * 0.04, w * 0.9, h * 0.92)

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'
  ctx.lineWidth = 0.6 * dpr
  const padX = w * 0.06
  const padY = h * 0.04
  const innerW = w - padX * 2
  const innerH = h - padY * 2
  const cellW = innerW / BLOCK_COLS
  const cellH = innerH / BLOCK_ROWS
  for (let c = 1; c < BLOCK_COLS; c += 1) {
    const x = padX + c * cellW
    ctx.beginPath()
    ctx.moveTo(x, padY)
    ctx.lineTo(x, padY + innerH)
    ctx.stroke()
  }
  for (let r = 1; r < BLOCK_ROWS; r += 1) {
    const y = padY + r * cellH
    ctx.beginPath()
    ctx.moveTo(padX, y)
    ctx.lineTo(padX + innerW, y)
    ctx.stroke()
  }
}

function drawGhost(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: BlockColor,
  dpr: number,
) {
  const hex = COLOR_HEX[color]
  const r = size * 0.45
  ctx.save()
  ctx.strokeStyle = hexToRgba(hex, 0.55)
  ctx.lineWidth = 1.4 * dpr
  ctx.setLineDash([3 * dpr, 3 * dpr])
  roundRect(ctx, x - r, y - r, r * 2, r * 2, r * 0.2)
  ctx.stroke()
  ctx.fillStyle = hexToRgba(hex, 0.12)
  roundRect(ctx, x - r, y - r, r * 2, r * 2, r * 0.2)
  ctx.fill()
  ctx.restore()
}

function drawTrail(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: BlockColor,
  alpha: number,
  dpr: number,
) {
  const hex = COLOR_HEX[color]
  ctx.globalAlpha = alpha
  ctx.fillStyle = hex
  ctx.shadowColor = COLOR_GLOW[color]
  ctx.shadowBlur = 8 * dpr
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.globalAlpha = 1
}

function drawBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: BlockColor,
  dpr: number,
  active: boolean,
  isGarbage: boolean,
) {
  const hex = isGarbage ? '#7a4ad4' : COLOR_HEX[color]
  const r = size * 0.5

  ctx.save()

  if (active) {
    ctx.shadowColor = COLOR_GLOW[color]
    ctx.shadowBlur = 14 * dpr
  }

  if (isGarbage) {
    ctx.shadowColor = 'rgba(122, 74, 212, 0.6)'
    ctx.shadowBlur = 6 * dpr
  }

  const halo = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 1.15)
  halo.addColorStop(0, hexToRgba(hex, isGarbage ? 0.28 : 0.4))
  halo.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.arc(x, y, r * 1.1, 0, Math.PI * 2)
  ctx.fill()

  const body = ctx.createLinearGradient(x - r, y - r, x + r, y + r)
  body.addColorStop(0, lighten(hex, isGarbage ? 0.15 : 0.35))
  body.addColorStop(0.35, hex)
  body.addColorStop(0.75, darken(hex, 0.12))
  body.addColorStop(1, darken(hex, isGarbage ? 0.35 : 0.28))
  ctx.fillStyle = body
  roundRect(ctx, x - r * 0.92, y - r * 0.92, r * 1.84, r * 1.84, r * 0.22)
  ctx.fill()

  ctx.strokeStyle = isGarbage ? 'rgba(180, 140, 255, 0.45)' : 'rgba(255,255,255,0.35)'
  ctx.lineWidth = 0.8 * dpr
  roundRect(ctx, x - r * 0.88, y - r * 0.88, r * 1.76, r * 1.76, r * 0.2)
  ctx.stroke()

  if (!isGarbage) {
    const spec = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, 0, x - r * 0.15, y - r * 0.2, r * 0.5)
    spec.addColorStop(0, 'rgba(255,255,255,0.9)')
    spec.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = spec
    ctx.beginPath()
    ctx.arc(x - r * 0.22, y - r * 0.28, r * 0.22, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
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
