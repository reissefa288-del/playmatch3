import { useEffect, useRef, type RefObject } from 'react'
import { useDocumentVisible } from '../../../shared/useDocumentVisible'
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
  pink: '#ff4ab8',
  orange: '#ff8c3a',
  yellow: '#ffd54a',
  green: '#42f090',
  cyan: '#22d4ff',
  blue: '#4a8cff',
}

const COLOR_GLOW: Record<BlockColor, string> = {
  purple: 'rgba(157, 108, 255, 0.55)',
  pink: 'rgba(255, 74, 184, 0.55)',
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
  const documentVisible = useDocumentVisible()

  useEffect(() => {
    if (!documentVisible) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let width = 0
    let height = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      width = Math.max(1, Math.floor(rect.width * dpr))
      height = Math.max(1, Math.floor(rect.height * dpr))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    const draw = () => {
      const lane = laneRef.current
      if (!lane) return

      const w = width
      const h = height
      if (w < 1 || h < 1) return

      const dpr = Math.min(window.devicePixelRatio || 1, 2)

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

      if (lane.fusionFlash && lane.fusionFlash > 0.02) {
        ctx.save()
        ctx.globalAlpha = lane.fusionFlash * 0.28
        const g = ctx.createRadialGradient(
          padX + innerW * 0.5,
          padY + innerH * 0.55,
          0,
          padX + innerW * 0.5,
          padY + innerH * 0.55,
          innerW * 0.55,
        )
        g.addColorStop(0, 'rgba(74, 140, 255, 0.9)')
        g.addColorStop(1, 'transparent')
        ctx.fillStyle = g
        ctx.fillRect(padX, padY, innerW, innerH)
        ctx.restore()
      }

      if (lane.fusionCharge != null && lane.fusionCharge > 0.04) {
        const barW = innerW * 0.42
        const barH = 3 * dpr
        const bx = padX + (innerW - barW) * 0.5
        const by = padY + innerH - barH - 4 * dpr
        ctx.save()
        ctx.fillStyle = 'rgba(8, 12, 28, 0.75)'
        roundRect(ctx, bx, by, barW, barH, barH)
        ctx.fill()
        ctx.fillStyle =
          accent === 'cyan'
            ? `rgba(34, 212, 255, ${0.45 + lane.fusionCharge * 0.55})`
            : `rgba(255, 58, 120, ${0.45 + lane.fusionCharge * 0.55})`
        roundRect(ctx, bx, by, barW * lane.fusionCharge, barH, barH)
        ctx.fill()
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

      if (lane.landBeam) {
        const { row, colMin, colMax } = lane.landBeam
        const y = padY + row * cellH + cellH * 0.92
        const x0 = padX + colMin * cellW + cellW * 0.08
        const x1 = padX + (colMax + 1) * cellW - cellW * 0.08
        ctx.save()
        ctx.strokeStyle =
          accent === 'cyan' ? 'rgba(34, 212, 255, 0.55)' : 'rgba(255, 58, 120, 0.55)'
        ctx.lineWidth = 1.6 * dpr
        ctx.setLineDash([5 * dpr, 4 * dpr])
        ctx.beginPath()
        ctx.moveTo(x0, y)
        ctx.lineTo(x1, y)
        ctx.stroke()
        ctx.restore()
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
              const cols = [...new Set(cells.map((c) => c.col))]
              for (const col of cols) {
                let surface = -1
                for (let row = 0; row < minRow; row += 1) {
                  if (lane.grid[row]?.[col]) surface = row
                }
                const start = surface + 1
                for (let row = start; row < minRow; row += 1) {
                  const span = Math.max(1, minRow - start)
                  const alpha = 0.08 + ((row - start) / span) * 0.22
                  drawTrail(
                    ctx,
                    padX + col * cellW + cellW * 0.5,
                    padY + row * cellH + cellH * 0.5,
                    Math.min(cellW, cellH) * 0.28,
                    cells.find((c) => c.col === col)?.color ?? 'cyan',
                    alpha,
                    dpr,
                  )
                }
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

      if (lane.nextQueue?.length) {
        drawNextPanel(ctx, w, h, lane.nextQueue, accent, dpr)
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [accent, documentVisible, laneRef])

  return <canvas ref={canvasRef} className="pm-block-arena__canvas" />
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
  const pr = Math.min(cellW, cellH) * 0.2 * particle.size
  roundRect(ctx, x - pr, y - pr, pr * 2, pr * 2, pr * 0.25)
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
  ctx.font = `600 ${Math.max(7, 7 * dpr)}px Inter, system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('SIRADAKİ', x + panelW * 0.5, y + 10 * dpr)

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

function drawTrail(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: BlockColor,
  alpha: number,
  dpr: number,
) {
  const fill = COLOR_HEX[color]
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = hexToRgba(fill, 0.65)
  roundRect(ctx, x - r, y - r, r * 2, r * 2, Math.max(1.5, 1.8 * dpr))
  ctx.fill()
  ctx.restore()
}

/** Tek hücre — birim küp (üst + yan + ön yüz), gem değil */
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
  const fill = isGarbage ? '#7a4ad4' : COLOR_HEX[color]
  const s = size * 0.9
  const depth = s * 0.2
  const half = s * 0.5
  const left = x - half
  const top = y - half + depth * 0.35

  ctx.save()

  if (active) {
    ctx.shadowColor = COLOR_GLOW[color]
    ctx.shadowBlur = 12 * dpr
  } else if (isGarbage) {
    ctx.shadowColor = 'rgba(122, 74, 212, 0.45)'
    ctx.shadowBlur = 5 * dpr
  }

  const faceW = s - depth
  const faceH = s - depth

  ctx.fillStyle = darken(fill, isGarbage ? 0.32 : 0.22)
  ctx.beginPath()
  ctx.moveTo(left + faceW, top)
  ctx.lineTo(left + faceW + depth, top - depth * 0.85)
  ctx.lineTo(left + faceW + depth, top + faceH - depth * 0.85)
  ctx.lineTo(left + faceW, top + faceH)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = lighten(fill, isGarbage ? 0.08 : 0.18)
  ctx.beginPath()
  ctx.moveTo(left, top)
  ctx.lineTo(left + faceW, top)
  ctx.lineTo(left + faceW + depth, top - depth * 0.85)
  ctx.lineTo(left + depth, top - depth * 0.85)
  ctx.closePath()
  ctx.fill()

  const front = ctx.createLinearGradient(left, top, left + faceW, top + faceH)
  front.addColorStop(0, lighten(fill, isGarbage ? 0.12 : 0.28))
  front.addColorStop(0.45, fill)
  front.addColorStop(1, darken(fill, isGarbage ? 0.28 : 0.14))
  ctx.fillStyle = front
  const corner = Math.max(2, 2.8 * dpr)
  roundRect(ctx, left, top, faceW, faceH, corner)
  ctx.fill()

  ctx.strokeStyle = isGarbage ? 'rgba(200, 170, 255, 0.4)' : 'rgba(255, 255, 255, 0.32)'
  ctx.lineWidth = 0.75 * dpr
  roundRect(ctx, left + 0.5 * dpr, top + 0.5 * dpr, faceW - dpr, faceH - dpr, corner * 0.85)
  ctx.stroke()

  if (!isGarbage) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
    roundRect(ctx, left + faceW * 0.12, top + faceH * 0.1, faceW * 0.28, faceH * 0.14, dpr)
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
