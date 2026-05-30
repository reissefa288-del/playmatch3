import { cellAt, tryMove, type Dir, type MarbleMadnessSideState } from './marbleMadnessDuelEngine'

const DIRS: Dir[] = ['up', 'down', 'left', 'right']

function moveTarget(row: number, col: number, dir: Dir) {
  let nr = row
  let nc = col
  if (dir === 'up') nr--
  if (dir === 'down') nr++
  if (dir === 'left') nc--
  if (dir === 'right') nc++
  return { row: nr, col: nc, cell: cellAt(nr, nc) }
}

export function tickMarbleMadnessBot(side: MarbleMadnessSideState, now: number): MarbleMadnessSideState {
  if (side.lives <= 0) return side

  const hunterNear = side.hunters.some(
    (h) => Math.abs(h.row - side.row) + Math.abs(h.col - side.col) <= 2,
  )

  if (hunterNear) {
    const flee = DIRS.map((d) => {
      const t = moveTarget(side.row, side.col, d)
      if (t.cell === 0 || t.cell === 2) return null
      const dist = side.hunters.reduce(
        (m, h) => Math.min(m, Math.abs(t.row - h.row) + Math.abs(t.col - h.col)),
        99,
      )
      return { d, dist }
    })
      .filter((x): x is { d: Dir; dist: number } => x != null)
      .sort((a, b) => b.dist - a.dist)[0]

    if (flee) return tryMove(side, flee.d, now)
  }

  const towardGoal = DIRS.map((d) => {
    const t = moveTarget(side.row, side.col, d)
    if (t.cell === 0 || t.cell === 2) return null
    const gemBonus = t.cell === 3 && !side.gemsTaken.includes(`${t.row},${t.col}`) ? 3 : 0
    const upBonus = side.row - t.row
    return { d, score: upBonus * 2 + gemBonus + (t.cell === 9 ? 5 : 0) }
  })
    .filter((x): x is { d: Dir; score: number } => x != null)
    .sort((a, b) => b.score - a.score)[0]

  if (towardGoal) return tryMove(side, towardGoal.d, now)

  const any = DIRS[Math.floor(Math.random() * DIRS.length)]!
  return tryMove(side, any, now)
}
