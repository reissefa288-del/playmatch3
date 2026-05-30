import { COLS, goldLeft, tryDig, tryMove, type DigDir, type Dir, type LodeRunnerSideState } from './lodeRunnerDuelEngine'

export function tickLodeRunnerBot(side: LodeRunnerSideState, now: number): LodeRunnerSideState {
  if (side.lives <= 0) return side

  if (goldLeft(side) > 0 && Math.random() < 0.14) {
    const target = side.gold[0]!
    const tc = target % COLS
    const tr = Math.floor(target / COLS)
    if (tc < side.col) {
      const m = tryMove(side, 'left', now)
      if (m !== side) return m
    }
    if (tc > side.col) {
      const m = tryMove(side, 'right', now)
      if (m !== side) return m
    }
    if (tr < side.row) {
      const m = tryMove(side, 'up', now)
      if (m !== side) return m
    }
    if (tr > side.row) {
      const m = tryMove(side, 'down', now)
      if (m !== side) return m
    }
  }

  for (const e of side.enemies) {
    if (now < e.trappedUntil) continue
    if (Math.abs(e.col - side.col) <= 1 && e.row === side.row && Math.random() < 0.2) {
      const digDir: DigDir = e.col < side.col ? 'left' : 'right'
      const d = tryDig(side, digDir, now)
      if (d !== side) return d
    }
  }

  const dirs: Dir[] = ['left', 'right', 'up', 'down']
  if (Math.random() < 0.1) {
    const d = dirs[Math.floor(Math.random() * dirs.length)]!
    const m = tryMove(side, d, now)
    if (m !== side) return m
  }

  return side
}
