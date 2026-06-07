import { useEffect, useState, type HTMLAttributes } from 'react'
import { FiChevronRight, FiUsers } from 'react-icons/fi'
import { motion, useReducedMotion } from 'framer-motion'
import type { GamesMiniCard } from '../data'
import { GameCoverArt } from './GameCoverArt'

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

type AllGameCardProps = {
  game: GamesMiniCard
  onPlay?: (game: GamesMiniCard) => void
  cardHandlers?: HTMLAttributes<HTMLElement>
}

function AllGameCard({ game, onPlay, cardHandlers }: AllGameCardProps) {
  function playGame() {
    onPlay?.(game)
  }

  return (
    <article
      className={`pm-games-mini-card ${game.color}`}
      role="button"
      tabIndex={0}
      {...cardHandlers}
      onClick={playGame}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          playGame()
        }
      }}
    >
      {game.badge ? <span className="pm-games-mini-card__badge">{game.badge}</span> : null}
      <GameCoverArt
        gameId={game.id}
        artKind={game.artKind}
        className={`pm-games-mini-card__art is-${game.artKind}`}
      >
        <game.icon className="pm-games-mini-card__icon" />
      </GameCoverArt>
      <strong>{game.title}</strong>
      <small>
        <FiUsers /> {game.players}
      </small>
      <button
        type="button"
        className="pm-games-mini-card__play"
        onClick={(event) => {
          event.stopPropagation()
          playGame()
        }}
      >
        Oyna
      </button>
    </article>
  )
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
                <AllGameCard
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
