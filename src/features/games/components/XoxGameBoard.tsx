import { useEffect, useRef, useState } from 'react'
import type { XoxBoard, XoxCell } from '../utils/xoxLogic'
import { cellCenterPercent, findWinLine } from '../utils/xoxLogic'
import { XoxNeonMark } from './XoxNeonMark'
import { XoxPlacementFx } from './XoxPlacementFx'

type XoxGameBoardProps = {
  board: XoxBoard
  interactive: boolean
  hoverSymbol?: 'X' | 'O' | null
  onMove: (index: number) => void
  onSymbolPlaced?: (symbol: 'X' | 'O', index: number) => void
}

export function XoxGameBoard({
  board,
  interactive,
  hoverSymbol,
  onMove,
  onSymbolPlaced,
}: XoxGameBoardProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [fxIndex, setFxIndex] = useState<number | null>(null)
  const prevBoardRef = useRef(board)
  const winLine = findWinLine(board)

  useEffect(() => {
    const prev = prevBoardRef.current
    for (let i = 0; i < board.length; i += 1) {
      if (!prev[i] && board[i]) {
        setFxIndex(i)
        onSymbolPlaced?.(board[i]!, i)
        break
      }
    }
    prevBoardRef.current = board
  }, [board, onSymbolPlaced])

  useEffect(() => {
    if (fxIndex == null) return
    const timer = window.setTimeout(() => setFxIndex(null), 520)
    return () => window.clearTimeout(timer)
  }, [fxIndex])

  const winStroke =
    winLine != null
      ? (() => {
          const start = cellCenterPercent(winLine[0])
          const end = cellCenterPercent(winLine[2])
          return { x1: start.x, y1: start.y, x2: end.x, y2: end.y }
        })()
      : null

  return (
    <div
      className={`pm-xox-board-wrap ${interactive ? 'is-live' : ''} ${winLine ? 'has-win' : ''}`}
     
     
    >
      <div className="pm-xox-board-frame" aria-hidden>
        <span className="pm-xox-board-frame__corner pm-xox-board-frame__corner--tl" />
        <span className="pm-xox-board-frame__corner pm-xox-board-frame__corner--tr" />
        <span className="pm-xox-board-frame__corner pm-xox-board-frame__corner--bl" />
        <span className="pm-xox-board-frame__corner pm-xox-board-frame__corner--br" />
      </div>

      <div className="pm-xox-board" role="grid" aria-label="Tic tac toe tahtası">
        {board.map((cell, index) => (
          <XoxBoardCell
            key={index}
            index={index}
            cell={cell}
            interactive={interactive}
            hoverSymbol={hoverIndex === index ? hoverSymbol : null}
            isWinning={winLine?.includes(index) ?? false}
            isPlacing={fxIndex === index}
            onMove={onMove}
            onHoverStart={() => {
              if (interactive && !cell) setHoverIndex(index)
            }}
            onHoverEnd={() => setHoverIndex((current) => (current === index ? null : current))}
          />
        ))}

        <svg className="pm-xox-board__grid-lines" viewBox="0 0 300 300" preserveAspectRatio="none" aria-hidden>
          <line x1="100" y1="0" x2="100" y2="300" className="pm-xox-grid-line pm-xox-grid-line--v1" />
          <line x1="200" y1="0" x2="200" y2="300" className="pm-xox-grid-line pm-xox-grid-line--v2" />
          <line x1="0" y1="100" x2="300" y2="100" className="pm-xox-grid-line pm-xox-grid-line--h1" />
          <line x1="0" y1="200" x2="300" y2="200" className="pm-xox-grid-line pm-xox-grid-line--h2" />
        </svg>

        <>
          {fxIndex != null && board[fxIndex] ? (
            <XoxPlacementFx key={`fx-${fxIndex}`} index={fxIndex} symbol={board[fxIndex]!} />
          ) : null}
        </>

        <>
          {winStroke ? (
            <svg
              key="win-line"
              className="pm-xox-board__win-line"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
             
             
             
            >
              <line
                x1={winStroke.x1}
                y1={winStroke.y1}
                x2={winStroke.x2}
                y2={winStroke.y2}
                className="pm-xox-win-stroke"
               
               
               
              />
            </svg>
          ) : null}
        </>
      </div>

      <>
        {winLine ? (
          <div
            className="pm-xox-board__win-flash"
           
           
           
            aria-hidden
          />
        ) : null}
      </>
    </div>
  )
}

type XoxBoardCellProps = {
  index: number
  cell: XoxCell
  interactive: boolean
  hoverSymbol?: 'X' | 'O' | null
  isWinning: boolean
  isPlacing: boolean
  onMove: (index: number) => void
  onHoverStart: () => void
  onHoverEnd: () => void
}

function XoxBoardCell({
  cell,
  interactive,
  hoverSymbol,
  isWinning,
  isPlacing,
  onMove,
  onHoverStart,
  onHoverEnd,
  index,
}: XoxBoardCellProps) {
  const canPlace = interactive && !cell

  return (
    <button
      type="button"
      className={`pm-xox-board__cell ${cell ? `is-${cell.toLowerCase()}` : ''} ${isWinning ? 'is-winning' : ''} ${isPlacing ? 'is-placing' : ''}`}
      onClick={() => onMove(index)}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onFocus={onHoverStart}
      onBlur={onHoverEnd}
      disabled={!canPlace}
      aria-label={`Hücre ${index + 1}${cell ? `, ${cell}` : ''}`}
    >
      <>
        {cell ? (
          <div
            key={cell}
            className="pm-xox-board__mark"
           
           
           
           
          >
            <XoxNeonMark symbol={cell} />
          </div>
        ) : canPlace && hoverSymbol ? (
          <div
            key="ghost"
            className={`pm-xox-board__ghost is-${hoverSymbol.toLowerCase()}`}
           
           
           
          >
            <XoxNeonMark symbol={hoverSymbol} />
          </div>
        ) : null}
      </>
    </button>
  )
}
