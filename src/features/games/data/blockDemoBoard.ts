export type BlockColor = 'purple' | 'red' | 'orange' | 'yellow' | 'green' | 'cyan' | 'blue'

export const BLOCK_COLS = 10
export const BLOCK_ROWS = 20

export type BlockCell = BlockColor | null

export type BlockPiece = {
  cells: { col: number; row: number; color: BlockColor }[]
  /** Falling piece trail above active cells */
  trail?: boolean
}

export type BlockLaneDemo = {
  grid: BlockCell[][]
  activePiece?: BlockPiece
}

function emptyGrid(): BlockCell[][] {
  return Array.from({ length: BLOCK_ROWS }, () => Array.from({ length: BLOCK_COLS }, () => null))
}

function setCell(grid: BlockCell[][], row: number, col: number, color: BlockColor) {
  if (row < 0 || row >= BLOCK_ROWS || col < 0 || col >= BLOCK_COLS) return
  grid[row]![col] = color
}

/** Referans görseldeki sol tahta — demo yerleşim */
export function createPlayer1DemoBoard(): BlockLaneDemo {
  const grid = emptyGrid()

  const stack: { col: number; row: number; color: BlockColor }[] = [
    { col: 0, row: 18, color: 'purple' },
    { col: 1, row: 18, color: 'purple' },
    { col: 2, row: 18, color: 'red' },
    { col: 3, row: 18, color: 'red' },
    { col: 4, row: 18, color: 'orange' },
    { col: 5, row: 18, color: 'yellow' },
    { col: 6, row: 18, color: 'green' },
    { col: 7, row: 18, color: 'cyan' },
    { col: 8, row: 18, color: 'blue' },
    { col: 9, row: 18, color: 'purple' },
    { col: 0, row: 17, color: 'cyan' },
    { col: 1, row: 17, color: 'green' },
    { col: 2, row: 17, color: 'yellow' },
    { col: 3, row: 17, color: 'orange' },
    { col: 4, row: 17, color: 'red' },
    { col: 5, row: 17, color: 'purple' },
    { col: 6, row: 17, color: 'blue' },
    { col: 7, row: 17, color: 'cyan' },
    { col: 8, row: 17, color: 'green' },
    { col: 9, row: 17, color: 'yellow' },
    { col: 1, row: 16, color: 'orange' },
    { col: 2, row: 16, color: 'red' },
    { col: 3, row: 16, color: 'purple' },
    { col: 4, row: 16, color: 'cyan' },
    { col: 5, row: 16, color: 'blue' },
    { col: 6, row: 16, color: 'green' },
    { col: 7, row: 16, color: 'yellow' },
    { col: 2, row: 15, color: 'green' },
    { col: 3, row: 15, color: 'yellow' },
    { col: 4, row: 15, color: 'orange' },
    { col: 5, row: 15, color: 'red' },
    { col: 6, row: 15, color: 'purple' },
    { col: 3, row: 14, color: 'blue' },
    { col: 4, row: 14, color: 'cyan' },
    { col: 5, row: 14, color: 'green' },
  ]

  for (const cell of stack) setCell(grid, cell.row, cell.col, cell.color)

  return {
    grid,
    activePiece: {
      trail: true,
      cells: [
        { col: 4, row: 8, color: 'orange' },
        { col: 4, row: 9, color: 'orange' },
        { col: 4, row: 10, color: 'orange' },
        { col: 5, row: 10, color: 'orange' },
      ],
    },
  }
}

/** Referans görseldeki sağ tahta — demo yerleşim */
export function createPlayer2DemoBoard(): BlockLaneDemo {
  const grid = emptyGrid()

  const stack: { col: number; row: number; color: BlockColor }[] = [
    { col: 0, row: 18, color: 'blue' },
    { col: 1, row: 18, color: 'cyan' },
    { col: 2, row: 18, color: 'green' },
    { col: 3, row: 18, color: 'yellow' },
    { col: 4, row: 18, color: 'orange' },
    { col: 5, row: 18, color: 'red' },
    { col: 6, row: 18, color: 'purple' },
    { col: 7, row: 18, color: 'blue' },
    { col: 8, row: 18, color: 'cyan' },
    { col: 9, row: 18, color: 'green' },
    { col: 0, row: 17, color: 'yellow' },
    { col: 1, row: 17, color: 'orange' },
    { col: 2, row: 17, color: 'red' },
    { col: 3, row: 17, color: 'purple' },
    { col: 4, row: 17, color: 'blue' },
    { col: 5, row: 17, color: 'cyan' },
    { col: 6, row: 17, color: 'green' },
    { col: 7, row: 17, color: 'yellow' },
    { col: 8, row: 17, color: 'orange' },
    { col: 9, row: 17, color: 'red' },
    { col: 2, row: 16, color: 'purple' },
    { col: 3, row: 16, color: 'blue' },
    { col: 4, row: 16, color: 'cyan' },
    { col: 5, row: 16, color: 'green' },
    { col: 6, row: 16, color: 'yellow' },
    { col: 7, row: 16, color: 'orange' },
    { col: 4, row: 15, color: 'red' },
    { col: 5, row: 15, color: 'purple' },
    { col: 6, row: 15, color: 'blue' },
  ]

  for (const cell of stack) setCell(grid, cell.row, cell.col, cell.color)

  return {
    grid,
    activePiece: {
      trail: true,
      cells: [
        { col: 5, row: 7, color: 'cyan' },
        { col: 6, row: 7, color: 'cyan' },
        { col: 7, row: 7, color: 'cyan' },
        { col: 7, row: 8, color: 'cyan' },
      ],
    },
  }
}
