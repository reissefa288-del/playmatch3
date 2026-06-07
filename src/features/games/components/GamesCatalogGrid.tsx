import { useRef, type HTMLAttributes } from 'react'
import { useVirtualGrid } from '../../../shared/useVirtualGrid'
import type { GamesMiniCard } from '../data'
import { GamesMiniCardTile } from './GamesMiniCardTile'

const COLUMNS = 3
const ROW_HEIGHT = 172

type GamesCatalogGridProps = {
  games: GamesMiniCard[]
  onPlay?: (game: GamesMiniCard) => void
  getCardHandlers?: (game: GamesMiniCard) => HTMLAttributes<HTMLElement>
}

export function GamesCatalogGrid({ games, onPlay, getCardHandlers }: GamesCatalogGridProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const { totalHeight, visibleRows, columns } = useVirtualGrid({
    itemCount: games.length,
    columns: COLUMNS,
    rowHeight: ROW_HEIGHT,
    rootRef,
  })

  const rows: GamesMiniCard[][] = []
  for (let row = visibleRows.start; row < visibleRows.end; row += 1) {
    const start = row * columns
    rows.push(games.slice(start, start + columns))
  }

  return (
    <div
      ref={rootRef}
      className="pm-games-all__grid pm-games-all__grid--virtual"
      role="list"
      style={{ height: totalHeight, position: 'relative' }}
    >
      {rows.map((rowGames, index) => {
        const rowIndex = visibleRows.start + index
        return (
          <div
            key={rowIndex}
            className="pm-games-all__grid-row"
            style={{
              position: 'absolute',
              top: rowIndex * ROW_HEIGHT,
              left: 0,
              right: 0,
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              gap: 10,
            }}
          >
            {rowGames.map((game) => (
              <GamesMiniCardTile
                key={game.id}
                game={game}
                onPlay={onPlay}
                cardHandlers={getCardHandlers?.(game)}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}
