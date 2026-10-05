/** Faz J4 — drop GPU bitmap on game screen unmount. */
export function releaseCanvas(canvas: HTMLCanvasElement | null | undefined) {
  if (!canvas) return
  canvas.width = 0
  canvas.height = 0
}
