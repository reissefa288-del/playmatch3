import { useEffect, useRef } from 'react'
import { canvasDprCap } from '../../../shared/canvasDpr'
import { releaseCanvas } from '../../../shared/releaseCanvas'
import { useDocumentVisible } from '../../../shared/useDocumentVisible'
import { drawSnakeArena, type SnakeAccent } from '../utils/snakeDuelVisuals'
import { tickIntervalMs, type SnakeLaneState } from '../utils/snakeDuelEngine'

type Props = {
  lane: SnakeLaneState
  accent: SnakeAccent
  roundElapsedSec?: number
}

export function SnakeArenaCanvas({ lane, accent, roundElapsedSec = 0 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const documentVisible = useDocumentVisible()
  const laneRef = useRef(lane)
  const accentRef = useRef(accent)
  const elapsedRef = useRef(roundElapsedSec)
  laneRef.current = lane
  accentRef.current = accent
  elapsedRef.current = roundElapsedSec

  useEffect(() => {
    if (!documentVisible) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let raf = 0
    let size = { w: 0, h: 0 }
    const snap = { simTick: laneRef.current.simTick, body: [...laneRef.current.body] }
    let prevBody: number[] | null = null
    let tickAt = performance.now()

    const resize = () => {
      const dpr = canvasDprCap()
      const rect = canvas.getBoundingClientRect()
      const w = Math.max(1, Math.floor(rect.width * dpr))
      const h = Math.max(1, Math.floor(rect.height * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      size = { w, h }
    }

    const frame = (now: number) => {
      const cur = laneRef.current

      if (cur.simTick !== snap.simTick) {
        prevBody = snap.body
        snap.simTick = cur.simTick
        snap.body = [...cur.body]
        tickAt = now
      }

      const tickMs = tickIntervalMs(cur.length, cur.length, elapsedRef.current)
      const raw = Math.min(1, (now - tickAt) / tickMs)
      const blend = 1 - (1 - raw) ** 3

      const { w, h } = size
      if (w > 0 && h > 0) {
        drawSnakeArena(ctx, cur, accentRef.current, w, h, {
          blend,
          prevBody: cur.alive ? prevBody : null,
          nowMs: now,
        })
      }
      raf = requestAnimationFrame(frame)
    }

    resize()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null
    ro?.observe(canvas)
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro?.disconnect()
      releaseCanvas(canvas)
    }
  }, [documentVisible])

  return (
    <canvas
      className="pm-snake-arena-canvas"
      ref={canvasRef}
      aria-label="Yılan oyun alanı"
    />
  )
}
