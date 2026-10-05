import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion'
import { useIntervalWhenActive } from '../../../shared/useIntervalWhenActive'
import { useRuntimeActive } from '../../../shared/useRuntimeActive'
import { useState, type CSSProperties } from 'react'
import { FiUsers } from 'react-icons/fi'
import { useProfileLevelActions } from '../../profile/ProfileLevelProvider'
import { XP_GAME_FEATURED } from '../../profile/profileLevel'
import type { FeaturedGame } from '../data'
import { GameCoverArt } from './GameCoverArt'

const CARDS_PER_PAGE = 2
const AUTO_ADVANCE_MS = 4800

type FeaturedGamesRowProps = {
  games: FeaturedGame[]
  onPlay?: (game: FeaturedGame) => void
}

function chunkGames<T>(items: T[], size: number): T[][] {
  const pages: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size))
  }
  return pages
}

type FeaturedGameCardProps = {
  game: FeaturedGame
  onPlay?: (game: FeaturedGame) => void
  addXp: (amount: number) => void
}

function FeaturedGameCard({ game, onPlay, addXp }: FeaturedGameCardProps) {
  function playGame() {
    addXp(XP_GAME_FEATURED)
    onPlay?.(game)
  }

  return (
    <article
      className={`pm-featured-card ${game.accent === 'pink' ? 'is-pink' : 'is-blue'} is-${game.id}`}
      style={{ '--pm-card-art-pos': game.artPosition } as CSSProperties}
      role="button"
      tabIndex={0}
      onClick={playGame}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          playGame()
        }
      }}
    >
      <span className="pm-featured-card__edge" aria-hidden />
      <span className="pm-featured-card__glow" aria-hidden />
      <span className="pm-featured-card__badge">{game.badge}</span>

      <GameCoverArt gameId={game.id} artSize="thumb" className="pm-featured-card__art" lowPriority>
        <span className="pm-featured-card__art-gloss" aria-hidden />
        <game.icon />
      </GameCoverArt>

      <h4>{game.title}</h4>
      <p className="pm-featured-card__mode">{game.mode}</p>

      <div className="pm-featured-card__social">
        <div className="pm-featured-card__avatars">
          {game.friends.map((friend) => (
            <span key={`${game.id}-${friend}`}>{friend}</span>
          ))}
        </div>
        <small>
          <FiUsers /> {game.players}
        </small>
        <span className="pm-featured-card__friends">{game.friendsPlaying ?? '\u00A0'}</span>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          playGame()
        }}
      >
        <span className="pm-featured-card__btn-shine" aria-hidden />
        {game.cta}
      </button>
    </article>
  )
}

export function FeaturedGamesRow({ games, onPlay }: FeaturedGamesRowProps) {
  const reduceMotion = usePrefersReducedMotion()
  const tabActive = useRuntimeActive('games')
  const { addXp } = useProfileLevelActions()
  const pages = chunkGames(games, CARDS_PER_PAGE)
  const [pageIndex, setPageIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useIntervalWhenActive(
    tabActive && !reduceMotion && pages.length > 1 && !paused,
    () => setPageIndex((current) => (current + 1) % pages.length),
    AUTO_ADVANCE_MS,
  )

  return (
    <section className="pm-games-featured-list" aria-label="Haftanın en çok oynanan oyunları">
      <header className="pm-games-section-head">
        <h3>Haftanın En Çok Oynananları</h3>
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
        <div
          className="pm-games-featured-track"
          style={{
            transform: `translateX(-${pageIndex * 100}%)`,
            transition: reduceMotion ? 'none' : 'transform 0.52s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {pages.map((page) => (
            <div key={page.map((game) => game.id).join('-')} className="pm-games-featured-page">
              {page.map((game) => (
                <FeaturedGameCard
                  key={game.id}
                  game={game}
                  onPlay={onPlay}
                  addXp={addXp}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {pages.length > 1 ? (
        <div className="pm-games-carousel-dots" role="tablist" aria-label="Öne çıkan oyun sayfaları">
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
