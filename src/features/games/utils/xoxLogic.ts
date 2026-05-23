export type XoxCell = null | 'X' | 'O'
export type XoxBoard = XoxCell[]

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const

export function findWinLine(board: XoxBoard): readonly [number, number, number] | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line
    const symbol = board[a]
    if (symbol && symbol === board[b] && symbol === board[c]) {
      return line
    }
  }
  return null
}

export function cellCenterPercent(index: number) {
  const col = index % 3
  const row = Math.floor(index / 3)
  return {
    x: ((col + 0.5) / 3) * 100,
    y: ((row + 0.5) / 3) * 100,
  }
}
