import { hopTarget, tryHop, type HopDir, type QbertSideState } from './qbertDuelEngine'

const DIRS: HopDir[] = ['ul', 'ur', 'dl', 'dr']

export function tickQbertBot(side: QbertSideState, now: number): QbertSideState {
  if (side.lives <= 0) return side

  const coilyNear =
    Math.abs(side.coilyRow - side.row) + Math.abs(side.coilyCol - side.col) <= 2

  if (coilyNear) {
    const flee = DIRS.map((d) => {
      const t = hopTarget(side.row, side.col, d)
      if (!t) return null
      const dist =
        Math.abs(t.row - side.coilyRow) + Math.abs(t.col - side.coilyCol)
      return { d, dist }
    })
      .filter((x): x is { d: HopDir; dist: number } => x != null)
      .sort((a, b) => b.dist - a.dist)[0]

    if (flee) return tryHop(side, flee.d, now)
  }

  const towardCube = DIRS.map((d) => {
    const t = hopTarget(side.row, side.col, d)
    if (!t) return null
    const idx = t.row * (t.row + 1) / 2 + t.col
    const need = (side.cubes[idx] ?? 0) < 2 ? 2 - (side.cubes[idx] ?? 0) : 0
    return { d, need, rand: Math.random() }
  })
    .filter((x): x is { d: HopDir; need: number; rand: number } => x != null && x.need > 0)
    .sort((a, b) => b.need - a.need || b.rand - a.rand)[0]

  if (towardCube) return tryHop(side, towardCube.d, now)

  const any = DIRS[Math.floor(Math.random() * DIRS.length)]!
  return tryHop(side, any, now)
}
