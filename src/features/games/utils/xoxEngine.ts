import type { XoxBoard, XoxCell } from './xoxLogic'
import { findWinLine } from './xoxLogic'

export type XoxSymbol = 'X' | 'O'

export function getWinner(board: XoxBoard): XoxSymbol | 'draw' | null {
  const line = findWinLine(board)
  if (!line) {
    if (board.every((cell) => cell != null)) return 'draw'
    return null
  }
  return board[line[0]] as XoxSymbol
}

export function applyMove(board: XoxBoard, symbol: XoxSymbol, index: number): XoxBoard {
  const next = [...board] as XoxBoard
  next[index] = symbol
  return next
}

export function nextTurn(symbol: XoxSymbol): XoxSymbol {
  return symbol === 'X' ? 'O' : 'X'
}

export function pickBotMove(board: XoxBoard, botSymbol: XoxSymbol, humanSymbol: XoxSymbol): number | null {
  const winning = findBestMove(board, botSymbol)
  if (winning != null) return winning
  const block = findBestMove(board, humanSymbol)
  if (block != null) return block
  if (board[4] == null) return 4
  const corners = [0, 2, 6, 8].filter((index) => board[index] == null)
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)] ?? null
  }
  const open = board.map((cell, index) => (cell == null ? index : -1)).filter((index) => index >= 0)
  return open.length > 0 ? (open[Math.floor(Math.random() * open.length)] ?? null) : null
}

function findBestMove(board: XoxBoard, symbol: XoxSymbol) {
  for (let index = 0; index < 9; index += 1) {
    if (board[index] != null) continue
    const next = applyMove(board, symbol, index)
    if (getWinner(next) === symbol) return index
  }
  return null
}

export function emptyBoard(): XoxBoard {
  return Array(9).fill(null) as XoxCell[]
}
