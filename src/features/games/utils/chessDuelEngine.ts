export const MATCH_ROUNDS = 3
export const WIN_ROUNDS = 2
export const LEG_BREAK_MS = 2800

export type Piece = '.' | 'P' | 'N' | 'B' | 'R' | 'Q' | 'K' | 'p' | 'n' | 'b' | 'r' | 'q' | 'k'
export type Color = 'w' | 'b'
export type Board = Piece[]

export type ChessMove = { from: number; to: number }

export type ChessLaneState = {
  matchPoints: number
}

export type ChessState = {
  board: Board
  turn: Color
  selected: number | null
  legalTargets: number[]
  lastMove: ChessMove | null
  inCheck: Color | null
  phase: 'playing' | 'ended'
  winner: Color | 'draw' | null
  endReason: 'checkmate' | 'stalemate' | null
  lane1: ChessLaneState
  lane2: ChessLaneState
  roundNumber: number
}

const START_BOARD: Board = [
  'r', 'n', 'b', 'q', 'k', 'b', 'n', 'r',
  'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p',
  '.', '.', '.', '.', '.', '.', '.', '.',
  '.', '.', '.', '.', '.', '.', '.', '.',
  '.', '.', '.', '.', '.', '.', '.', '.',
  '.', '.', '.', '.', '.', '.', '.', '.',
  'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P',
  'R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R',
]

export function createChessState(): ChessState {
  return {
    board: [...START_BOARD],
    turn: 'w',
    selected: null,
    legalTargets: [],
    lastMove: null,
    inCheck: null,
    phase: 'playing',
    winner: null,
    endReason: null,
    lane1: { matchPoints: 0 },
    lane2: { matchPoints: 0 },
    roundNumber: 1,
  }
}

export function pieceColor(p: Piece): Color | null {
  if (p === '.') return null
  return p === p.toUpperCase() ? 'w' : 'b'
}

export function rc(i: number) {
  return { r: Math.floor(i / 8), c: i % 8 }
}

export function idx(r: number, c: number) {
  return r * 8 + c
}

export function inBounds(r: number, c: number) {
  return r >= 0 && r < 8 && c >= 0 && c < 8
}

export function findKing(board: Board, color: Color): number {
  const k = color === 'w' ? 'K' : 'k'
  return board.indexOf(k)
}

export function isAttacked(board: Board, sq: number, by: Color): boolean {
  const { r, c } = rc(sq)
  const enemy = by === 'w'

  const pawn = enemy ? 'P' : 'p'
  const pawnDir = enemy ? 1 : -1
  for (const dc of [-1, 1]) {
    const pr = r + pawnDir
    const pc = c + dc
    if (inBounds(pr, pc) && board[idx(pr, pc)] === pawn) return true
  }

  const knight = enemy ? 'N' : 'n'
  for (const [dr, dc] of [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1],
  ]) {
    const nr = r + dr
    const nc = c + dc
    if (inBounds(nr, nc) && board[idx(nr, nc)] === knight) return true
  }

  const sliders = [
    { pieces: enemy ? ['R', 'Q'] : ['r', 'q'], dirs: [[0, 1], [0, -1], [1, 0], [-1, 0]] },
    { pieces: enemy ? ['B', 'Q'] : ['b', 'q'], dirs: [[1, 1], [1, -1], [-1, 1], [-1, -1]] },
  ]
  for (const { pieces, dirs } of sliders) {
    for (const [dr, dc] of dirs) {
      let nr = r + dr
      let nc = c + dc
      while (inBounds(nr, nc)) {
        const p = board[idx(nr, nc)]
        if (p !== '.') {
          if (pieces.includes(p)) return true
          break
        }
        nr += dr
        nc += dc
      }
    }
  }

  const king = enemy ? 'K' : 'k'
  for (const [dr, dc] of [
    [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1],
  ]) {
    const nr = r + dr
    const nc = c + dc
    if (inBounds(nr, nc) && board[idx(nr, nc)] === king) return true
  }

  return false
}

export function inCheck(board: Board, color: Color): boolean {
  const k = findKing(board, color)
  if (k < 0) return false
  const enemy: Color = color === 'w' ? 'b' : 'w'
  return isAttacked(board, k, enemy)
}

function pseudoMoves(board: Board, from: number, color: Color): number[] {
  const p = board[from]
  if (p === '.' || pieceColor(p) !== color) return []

  const { r, c } = rc(from)
  const targets: number[] = []
  const add = (to: number) => {
    if (to < 0 || to > 63) return
    const tp = board[to]
    if (tp === '.' || pieceColor(tp) !== color) targets.push(to)
  }

  const slide = (dirs: number[][]) => {
    for (const [dr, dc] of dirs) {
      let nr = r + dr
      let nc = c + dc
      while (inBounds(nr, nc)) {
        const to = idx(nr, nc)
        const tp = board[to]
        if (tp === '.') {
          targets.push(to)
        } else {
          if (pieceColor(tp) !== color) targets.push(to)
          break
        }
        nr += dr
        nc += dc
      }
    }
  }

  if (p === 'P' || p === 'p') {
    const dir = p === 'P' ? -1 : 1
    const startRow = p === 'P' ? 6 : 1
    const nr = r + dir
    if (inBounds(nr, c) && board[idx(nr, c)] === '.') {
      add(idx(nr, c))
      if (r === startRow) {
        const nr2 = r + dir * 2
        if (board[idx(nr2, c)] === '.') add(idx(nr2, c))
      }
    }
    for (const dc of [-1, 1]) {
      const nc = c + dc
      if (inBounds(nr, nc)) {
        const to = idx(nr, nc)
        const tp = board[to]
        if (tp !== '.' && pieceColor(tp) !== color) targets.push(to)
      }
    }
    return targets
  }

  if (p === 'N' || p === 'n') {
    for (const [dr, dc] of [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1],
    ]) {
      const nr = r + dr
      const nc = c + dc
      if (inBounds(nr, nc)) add(idx(nr, nc))
    }
    return targets
  }

  if (p === 'B' || p === 'b') slide([[1, 1], [1, -1], [-1, 1], [-1, -1]])
  else if (p === 'R' || p === 'r') slide([[0, 1], [0, -1], [1, 0], [-1, 0]])
  else if (p === 'Q' || p === 'q') slide([[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]])
  else if (p === 'K' || p === 'k') {
    for (const [dr, dc] of [
      [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1],
    ]) {
      const nr = r + dr
      const nc = c + dc
      if (inBounds(nr, nc)) add(idx(nr, nc))
    }
  }

  return targets
}

export function legalMovesFrom(board: Board, from: number, color: Color): number[] {
  return pseudoMoves(board, from, color).filter((to) => {
    const next = applyMoveBoard(board, from, to)
    return !inCheck(next, color)
  })
}

export function allLegalMoves(board: Board, color: Color): ChessMove[] {
  const moves: ChessMove[] = []
  for (let i = 0; i < 64; i++) {
    if (pieceColor(board[i]) !== color) continue
    for (const to of legalMovesFrom(board, i, color)) {
      moves.push({ from: i, to })
    }
  }
  return moves
}

export function applyMoveBoard(board: Board, from: number, to: number): Board {
  const next = [...board]
  let piece = next[from]!
  next[from] = '.'

  const { r } = rc(to)
  if (piece === 'P' && r === 0) piece = 'Q'
  if (piece === 'p' && r === 7) piece = 'q'

  next[to] = piece
  return next
}

export function evaluateBoard(board: Board): number {
  const val: Record<Piece, number> = {
    '.': 0, P: 100, p: -100, N: 320, n: -320, B: 330, b: -330, R: 500, r: -500, Q: 900, q: -900, K: 0, k: 0,
  }
  return board.reduce((s, p) => s + val[p], 0)
}

export function detectGameEnd(board: Board, turn: Color): Pick<ChessState, 'phase' | 'winner' | 'endReason' | 'inCheck'> {
  const check = inCheck(board, turn)
  const moves = allLegalMoves(board, turn)
  if (moves.length > 0) {
    return { phase: 'playing', winner: null, endReason: null, inCheck: check ? turn : null }
  }
  if (check) {
    const winner: Color = turn === 'w' ? 'b' : 'w'
    return { phase: 'ended', winner, endReason: 'checkmate', inCheck: turn }
  }
  return { phase: 'ended', winner: 'draw', endReason: 'stalemate', inCheck: null }
}

export function applyPlayerMove(state: ChessState, from: number, to: number): ChessState {
  if (state.phase !== 'playing') return state
  if (!legalMovesFrom(state.board, from, state.turn).includes(to)) return state

  const board = applyMoveBoard(state.board, from, to)
  const nextTurn: Color = state.turn === 'w' ? 'b' : 'w'
  const end = detectGameEnd(board, nextTurn)

  return {
    ...state,
    board,
    turn: nextTurn,
    selected: null,
    legalTargets: [],
    lastMove: { from, to },
    ...end,
  }
}

export function selectSquare(state: ChessState, sq: number): ChessState {
  if (state.phase !== 'playing' || state.turn !== 'w') return state

  const p = state.board[sq]
  if (state.selected != null && state.legalTargets.includes(sq)) {
    return applyPlayerMove(state, state.selected, sq)
  }

  if (p !== '.' && pieceColor(p) === 'w') {
    return { ...state, selected: sq, legalTargets: legalMovesFrom(state.board, sq, 'w') }
  }

  return { ...state, selected: null, legalTargets: [] }
}

export function resolveLegWinner(winner: Color | 'draw'): 'p1' | 'p2' | 'draw' {
  if (winner === 'w') return 'p1'
  if (winner === 'b') return 'p2'
  return 'draw'
}
