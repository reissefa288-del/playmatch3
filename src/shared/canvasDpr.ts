/** Faz J1 — cap canvas backing store scale (GPU / memory). */
export function canvasDprCap(max = 2): number {
  if (typeof window === 'undefined') return 1
  return Math.min(window.devicePixelRatio || 1, max)
}
