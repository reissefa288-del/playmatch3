import {
  areAdjacent,
  findMatches,
  GRID_SIZE,
  type NeonBoard,
} from './neonCrushEngine'

function swapPreview(board: NeonBoard, a: number, b: number): NeonBoard {
  const next = [...board]
  const tmp = next[a]!
  next[a] = next[b]!
  next[b] = tmp
  return next
}

/** Geçerli bir hamle bulur; yoksa -1,-1 */
export function pickBotSwap(board: NeonBoard, seed: number): [number, number] {
  let bestA = -1
  let bestB = -1
  let bestSize = 0

  for (let a = 0; a < GRID_SIZE; a++) {
    for (let b = a + 1; b < GRID_SIZE; b++) {
      if (!areAdjacent(a, b)) continue
      const preview = swapPreview(board, a, b)
      const size = findMatches(preview).size
      if (size > bestSize) {
        bestSize = size
        bestA = a
        bestB = b
      }
    }
  }

  if (bestA >= 0) return [bestA, bestB]

  const offset = seed % GRID_SIZE
  for (let i = 0; i < GRID_SIZE; i++) {
    const a = (offset + i) % GRID_SIZE
    const neighbors = [a - 1, a + 1, a - 5, a + 5].filter(
      (b) => b >= 0 && b < GRID_SIZE && areAdjacent(a, b),
    )
    if (neighbors.length > 0) return [a, neighbors[0]!]
  }

  return [0, 1]
}

export function botThinkDelayMs(combo: number) {
  return Math.max(520, 1100 - combo * 80)
}
