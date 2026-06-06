import {
  areAdjacent,
  collectSwapActivations,
  findMatchSegments,
  findMatches,
  GRID_SIZE,
  segmentLineBonus,
  type NeonBoard,
} from './neonCrushEngine'

function swapPreview(board: NeonBoard, a: number, b: number): NeonBoard {
  const next = board.map((c) => ({ gem: c.gem, special: c.special }))
  const tmp = next[a]!
  next[a] = next[b]!
  next[b] = tmp
  return next
}

function scoreSwap(board: NeonBoard, a: number, b: number): number {
  const preview = swapPreview(board, a, b)
  const activation = collectSwapActivations(preview, a, b)
  const matches = findMatches(preview)
  const segments = findMatchSegments(preview)
  let score = matches.size * 12 + segmentLineBonus(segments)
  if (activation.size > 0) score += activation.size * 14 + 90
  if (preview[a]?.special || preview[b]?.special) score += 60
  return score
}

/** Geçerli bir hamle bulur; yoksa -1,-1 */
export function pickBotSwap(board: NeonBoard, seed: number): [number, number] {
  let bestA = -1
  let bestB = -1
  let bestScore = 0

  for (let a = 0; a < GRID_SIZE; a++) {
    for (let b = a + 1; b < GRID_SIZE; b++) {
      if (!areAdjacent(a, b)) continue
      const score = scoreSwap(board, a, b)
      if (score > bestScore) {
        bestScore = score
        bestA = a
        bestB = b
      }
    }
  }

  if (bestA >= 0 && bestScore > 0) return [bestA, bestB]

  const offset = seed % GRID_SIZE
  for (let i = 0; i < GRID_SIZE; i++) {
    const a = (offset + i) % GRID_SIZE
    for (let b = 0; b < GRID_SIZE; b++) {
      if (!areAdjacent(a, b)) continue
      if (scoreSwap(board, a, b) > 0) return [a, b]
    }
  }

  return [-1, -1]
}

export function botThinkDelayMs(combo: number) {
  return Math.max(520, 1100 - combo * 80)
}
