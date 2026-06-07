import { useEffect, useState, type HTMLAttributes } from 'react'
import { FiChevronRight } from 'react-icons/fi'
import { motion, useReducedMotion } from 'framer-motion'
import type { GamesMiniCard } from '../data'
import { GamesMiniCardTile } from './GamesMiniCardTile'

const CARDS_PER_PAGE = 2
const AUTO_ADVANCE_MS = 4800

type AllGamesRowProps = {
  games: GamesMiniCard[]
  onPlay?: (game: GamesMiniCard) => void
  onShowAll?: () => void
  getCardHandlers?: (game: GamesMiniCard) => HTMLAttributes<HTMLElement>
}

function chunkGames<T>(items: T[], size: number): T[][] {
  const pages: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size))
  }
  return pages
}

export function AllGamesRow({ games, onPlay, onShowAll, getCardHandlers }: AllGamesRowProps) {
  const reduceMotion = useReducedMotion()
  const pages = chunkGames(games, CARDS_PER_PAGE)
  const [pageIndex, setPageIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (reduceMotion || pages.length <= 1 || paused) return

    const timer = window.setInterval(() => {
      setPageIndex((current) => (current + 1) % pages.length)
    }, AUTO_ADVANCE_MS)

    return () => window.clearInterval(timer)
  }, [pages.length, paused, reduceMotion])

  return (
    <section className="pm-games-featured-list pm-games-all-games-list" aria-label="Tüm oyunlar">
      <header className="pm-games-section-head">
        <h3>Tüm Oyunlar</h3>
        {onShowAll ? (
          <button type="button" className="pm-games-all-games-list__more" onClick={onShowAll}>
            Tümünü Gör <FiChevronRight />
          </button>
        ) : null}
      </header>

      <div
        className="pm-games-featured-viewport"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setPaused(false)
          }
        }}
      >
        <motion.div
          className="pm-games-featured-track"
          animate={{ x: `-${pageIndex * 100}%` }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.52, ease: [0.22, 1, 0.36, 1] }
          }
        >
          {pages.map((page) => (
            <div key={page.map((game) => game.id).join('-')} className="pm-games-featured-page">
              {page.map((game) => (
                <GamesMiniCardTile
                  key={game.id}
                  game={game}
                  onPlay={onPlay}
                  cardHandlers={getCardHandlers?.(game)}
                />
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {pages.length > 1 ? (
        <div className="pm-games-carousel-dots" role="tablist" aria-label="Tüm oyunlar sayfaları">
          {pages.map((page, index) => (
            <button
              key={page.map((game) => game.id).join('-')}
              type="button"
              role="tab"
              aria-selected={index === pageIndex}
              aria-label={`Sayfa ${index + 1}`}
              className={index === pageIndex ? 'is-active' : ''}
              onClick={() => setPageIndex(index)}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
