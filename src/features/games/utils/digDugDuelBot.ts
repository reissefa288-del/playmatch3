import { tryMove, tryPump, type DigDugSideState, type Dir } from './digDugDuelEngine'

const DIRS: Dir[] = ['up', 'down', 'left', 'right']

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function tickDigDugBot(side: DigDugSideState, now: number): DigDugSideState {
  if (side.lives <= 0) return side

  const rand = mulberry32(Math.floor(now / 200) + side.wave * 17)
  let s = side

  const live = s.enemies.filter((e) => e.alive)
  const nearest = live
    .map((e) => ({ e, d: Math.abs(e.col - s.col) + Math.abs(e.row - s.row) }))
    .sort((a, b) => a.d - b.d)[0]

  if (nearest && nearest.d <= 2 && rand() > 0.35) {
    s = tryPump(s, now)
  } else if (nearest) {
    const { e } = nearest
    let best: Dir | null = null
    let bestDist = 999
    for (const dir of DIRS) {
      const nc = s.col + (dir === 'left' ? -1 : dir === 'right' ? 1 : 0)
      const nr = s.row + (dir === 'up' ? -1 : dir === 'down' ? 1 : 0)
      const d = Math.abs(nc - e.col) + Math.abs(nr - e.row)
      if (d < bestDist) {
        bestDist = d
        best = dir
      }
    }
    if (best) s = tryMove(s, best, now)
    else if (rand() > 0.5) s = tryMove(s, DIRS[Math.floor(rand() * 4)]!, now)
  } else if (rand() > 0.55) {
    s = tryMove(s, DIRS[Math.floor(rand() * 4)]!, now)
  }

  if (rand() > 0.72) s = tryPump(s, now)

  return s
}
