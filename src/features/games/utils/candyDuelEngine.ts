export const BOARD_SIZE = 7
export const CANDY_TYPES = 6
export const MATCH_ROUNDS = 5
export const WIN_ROUNDS = 3
export const ROUND_SECONDS = 80
export const ROUND_BREAK_MS = 2200
export const TARGET_SCORE = 50_000

export type Cell = {
  row: number
  col: number
}

export type CandyLaneState = {
  laneId: number
  board: number[][]
  score: number
  best: number
  combo: number
  selected: Cell | null
  message: string | null
  matchPoints: number
}

type MoveResult = {
  board: number[][]
  scoreGain: number
  cleared: number
  cascades: number
}

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function cloneBoard(board: number[][]) {
  return board.map((row) => [...row])
}

function isInside(row: number, col: number) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
}

export function areAdjacent(a: Cell, b: Cell) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1
}

function findMatches(board: number[][]): Set<string> {
  const hit = new Set<string>()
  for (let r = 0; r < BOARD_SIZE; r += 1) {
    let c = 0
    while (c < BOARD_SIZE) {
      const v = board[r]![c]!
      let end = c + 1
      while (end < BOARD_SIZE && board[r]![end] === v) end += 1
      if (end - c >= 3) {
        for (let k = c; k < end; k += 1) hit.add(`${r},${k}`)
      }
      c = end
    }
  }
  for (let c = 0; c < BOARD_SIZE; c += 1) {
    let r = 0
    while (r < BOARD_SIZE) {
      const v = board[r]![c]!
      let end = r + 1
      while (end < BOARD_SIZE && board[end]![c] === v) end += 1
      if (end - r >= 3) {
        for (let k = r; k < end; k += 1) hit.add(`${k},${c}`)
      }
      r = end
    }
  }
  return hit
}

function clearAndDrop(board: number[][], matches: Set<string>, rand: () => number): number[][] {
  const next = cloneBoard(board)
  for (const key of matches) {
    const [r, c] = key.split(',').map(Number)
    next[r]![c] = -1
  }
  for (let c = 0; c < BOARD_SIZE; c += 1) {
    const values: number[] = []
    for (let r = BOARD_SIZE - 1; r >= 0; r -= 1) {
      const v = next[r]![c]!
      if (v >= 0) values.push(v)
    }
    let ptr = BOARD_SIZE - 1
    for (const v of values) {
      next[ptr]![c] = v
      ptr -= 1
    }
    while (ptr >= 0) {
      next[ptr]![c] = Math.floor(rand() * CANDY_TYPES)
      ptr -= 1
    }
  }
  return next
}

function resolveCascades(board: number[][], rand: () => number): MoveResult {
  let cur = cloneBoard(board)
  let totalCleared = 0
  let scoreGain = 0
  let cascades = 0
  while (true) {
    const matches = findMatches(cur)
    if (matches.size === 0) break
    cascades += 1
    totalCleared += matches.size
    scoreGain += matches.size * 120 * cascades
    cur = clearAndDrop(cur, matches, rand)
  }
  return { board: cur, scoreGain, cleared: totalCleared, cascades }
}

export function createBoard(seed: number): number[][] {
  const rand = mulberry32(seed)
  const board = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => Math.floor(rand() * CANDY_TYPES)),
  )
  let guard = 0
  while (findMatches(board).size > 0 && guard < 12) {
    for (let r = 0; r < BOARD_SIZE; r += 1) {
      for (let c = 0; c < BOARD_SIZE; c += 1) {
        board[r]![c] = Math.floor(rand() * CANDY_TYPES)
      }
    }
    guard += 1
  }
  return board
}

export function createLane(laneId: number, seed: number): CandyLaneState {
  return {
    laneId,
    board: createBoard(seed + laneId * 17),
    score: laneId === 1 ? 28_450 : 23_780,
    best: laneId === 1 ? 52_300 : 48_910,
    combo: 1,
    selected: null,
    message: null,
    matchPoints: 0,
  }
}

export function applyMove(lane: CandyLaneState, a: Cell, b: Cell, seed: number): CandyLaneState {
  if (!isInside(a.row, a.col) || !isInside(b.row, b.col)) return lane
  if (!areAdjacent(a, b)) return { ...lane, selected: b }

  const nextBoard = cloneBoard(lane.board)
  const tmp = nextBoard[a.row]![a.col]!
  nextBoard[a.row]![a.col] = nextBoard[b.row]![b.col]!
  nextBoard[b.row]![b.col] = tmp

  const rand = mulberry32(seed + lane.score + a.row * 31 + b.col * 13)
  const result = resolveCascades(nextBoard, rand)
  if (result.cleared === 0) {
    return { ...lane, selected: null, message: 'Eşleşme yok' }
  }

  const combo = Math.min(9, lane.combo + Math.max(1, result.cascades - 1))
  const score = lane.score + result.scoreGain
  return {
    ...lane,
    board: result.board,
    score,
    best: Math.max(lane.best, score),
    combo,
    selected: null,
    message: result.cascades > 1 ? `x${result.cascades} CASCADE!` : `+${result.scoreGain}`,
  }
}

export function clearLaneFx(lane: CandyLaneState): CandyLaneState {
  if (!lane.message) return lane
  return { ...lane, message: null }
}

export function findBestMove(board: number[][], seed: number): { from: Cell; to: Cell } | null {
  let best: { from: Cell; to: Cell; cleared: number; score: number } | null = null
  const dirs = [
    [0, 1],
    [1, 0],
  ] as const
  for (let r = 0; r < BOARD_SIZE; r += 1) {
    for (let c = 0; c < BOARD_SIZE; c += 1) {
      for (const [dr, dc] of dirs) {
        const nr = r + dr
        const nc = c + dc
        if (!isInside(nr, nc)) continue
        const boardCopy = cloneBoard(board)
        const t = boardCopy[r]![c]!
        boardCopy[r]![c] = boardCopy[nr]![nc]!
        boardCopy[nr]![nc] = t
        const res = resolveCascades(boardCopy, mulberry32(seed + r * 101 + c * 17 + nr * 7))
        if (res.cleared === 0) continue
        if (!best || res.cleared > best.cleared || res.scoreGain > best.score) {
          best = {
            from: { row: r, col: c },
            to: { row: nr, col: nc },
            cleared: res.cleared,
            score: res.scoreGain,
          }
        }
      }
    }
  }
  return best ? { from: best.from, to: best.to } : null
}

export function resolveRoundWinner(l1: CandyLaneState, l2: CandyLaneState): 'p1' | 'p2' | 'draw' {
  if (l1.score > l2.score) return 'p1'
  if (l2.score > l1.score) return 'p2'
  return 'draw'
}

export function restartRound(l1: CandyLaneState, l2: CandyLaneState, seed: number) {
  return {
    lane1: { ...createLane(1, seed), matchPoints: l1.matchPoints },
    lane2: { ...createLane(2, seed + 99), matchPoints: l2.matchPoints },
  }
}
