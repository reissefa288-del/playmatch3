import { canWalkCell, offset, TILE_ICE, tileIndex, tryMove, type Dir, type PengoSideState } from './pengoDuelEngine'

export function tickPengoBot(side: PengoSideState, now: number): PengoSideState {
  if (side.lives <= 0) return side

  const dirs: Dir[] = ['up', 'down', 'left', 'right']

  for (const dir of dirs) {
    const next = offset(side.col, side.row, dir)
    if (side.tiles[tileIndex(next.col, next.row)] !== TILE_ICE) continue
    const beyond = offset(next.col, next.row, dir)
    const crushed = side.enemies.some((e) => e.col === beyond.col && e.row === beyond.row)
    if (crushed && Math.random() < 0.65) {
      return tryMove(side, dir, now)
    }
  }

  const moves = dirs.filter((dir) => {
    const next = offset(side.col, side.row, dir)
    return canWalkCell(side.tiles, side.enemies, next.col, next.row)
  })

  if (moves.length > 0 && Math.random() < 0.12) {
    return tryMove(side, moves[Math.floor(Math.random() * moves.length)]!, now)
  }

  for (const dir of dirs) {
    const pushed = tryMove(side, dir, now)
    if (pushed !== side) return pushed
  }

  return side
}
