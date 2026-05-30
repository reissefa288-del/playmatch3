import { canWalk, softBlocksLeft, TILE_SOFT, tileIndex, tryBomb, tryMove, type BombermanSideState, type Dir } from './bombermanDuelEngine'

export function tickBombermanBot(side: BombermanSideState, now: number): BombermanSideState {
  if (side.lives <= 0) return side

  let s = side
  const dirs: Dir[] = ['up', 'down', 'left', 'right']

  const nearSoft = dirs.find((dir) => {
    let col = s.col
    let row = s.row
    if (dir === 'up') row--
    if (dir === 'down') row++
    if (dir === 'left') col--
    if (dir === 'right') col++
    return s.tiles[tileIndex(col, row)] === TILE_SOFT
  })

  const inBlast = s.blasts.some((b) => now < b.until && b.cells.some((c) => c.col === s.col && c.row === s.row))
  if (inBlast) {
    const escape = dirs.find((dir) => {
      let col = s.col
      let row = s.row
      if (dir === 'up') row--
      if (dir === 'down') row++
      if (dir === 'left') col--
      if (dir === 'right') col++
      return canWalk(s.tiles, s.bombs, s.blasts, s.enemies, col, row, now)
    })
    if (escape) s = tryMove(s, escape, now)
    return s
  }

  if (nearSoft && s.bombs.length < 2 && Math.random() < 0.04) {
    s = tryBomb(s, now)
  }

  const move = dirs.filter((dir) => {
    let col = s.col
    let row = s.row
    if (dir === 'up') row--
    if (dir === 'down') row++
    if (dir === 'left') col--
    if (dir === 'right') col++
    return canWalk(s.tiles, s.bombs, s.blasts, s.enemies, col, row, now)
  })

  if (move.length > 0 && Math.random() < 0.08) {
    s = tryMove(s, move[Math.floor(Math.random() * move.length)]!, now)
  }

  if (softBlocksLeft(s.tiles) > 0 && Math.random() < 0.015) {
    s = tryBomb(s, now)
  }

  return s
}
