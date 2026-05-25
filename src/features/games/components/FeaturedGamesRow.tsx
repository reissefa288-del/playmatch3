import { useState, type CSSProperties, type UIEvent } from 'react'
import { FiUsers } from 'react-icons/fi'
import { motion, useReducedMotion } from 'framer-motion'
import { useProfileLevel } from '../../profile/ProfileLevelProvider'
import { XP_GAME_FEATURED } from '../../profile/profileLevel'
import type { FeaturedGame } from '../data'

const FEATURED_CARD_STEP = 262

type FeaturedGamesRowProps = {
  games: FeaturedGame[]
  onPlay?: (game: FeaturedGame) => void
}

export function FeaturedGamesRow({ games, onPlay }: FeaturedGamesRowProps) {
  const reduceMotion = useReducedMotion()
  const { addXp } = useProfileLevel()
  const [activeIndex, setActiveIndex] = useState(0)

  function onTrackScroll(e: UIEvent<HTMLDivElement>) {
    const idx = Math.round(e.currentTarget.scrollLeft / FEATURED_CARD_STEP)
    const clamped = Math.max(0, Math.min(games.length - 1, idx))
    if (clamped !== activeIndex) setActiveIndex(clamped)
  }

  return (
    <section className="pm-games-featured-list" aria-label="Öne çıkan oyunlar">
      <header className="pm-games-section-head">
        <h3>Öne Çıkan Oyunlar</h3>
        <span className="pm-games-section-head__live">
          <span className="pm-games-online-dot" />
          Canlı lobiler
        </span>
      </header>

      <motion.div
        className="pm-games-featured-scroll"
        onScroll={onTrackScroll}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {games.map((game, index) => (
          <motion.article
            key={game.id}
            className={`pm-featured-card ${game.accent === 'pink' ? 'is-pink' : 'is-blue'} is-${game.id}`}
            style={{ '--pm-card-art-pos': game.artPosition } as CSSProperties}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + index * 0.06, duration: 0.4 }}
            whileHover={reduceMotion ? undefined : { y: -8, scale: 1.01 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            role="button"
            tabIndex={0}
            onClick={() => {
              addXp(XP_GAME_FEATURED)
              onPlay?.(game)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                addXp(XP_GAME_FEATURED)
                onPlay?.(game)
              }
            }}
          >
            <span className="pm-featured-card__edge" aria-hidden />
            <span className="pm-featured-card__glow" aria-hidden />
            <span className="pm-featured-card__badge">{game.badge}</span>

            <div className="pm-featured-card__art">
              <span className="pm-featured-card__art-gloss" aria-hidden />
              <span className="pm-featured-card__art-live" aria-hidden>
                <span className="pm-games-online-dot" />
                CANLI
              </span>
              <game.icon />
            </div>

            <h4>{game.title}</h4>
            <p className="pm-featured-card__mode">{game.mode}</p>

            <motion.div className="pm-featured-card__social">
              <div className="pm-featured-card__avatars">
                {game.friends.map((friend) => (
                  <span key={`${game.id}-${friend}`}>{friend}</span>
                ))}
              </div>
              <small>
                <FiUsers /> {game.players}
              </small>
              {game.friendsPlaying ? (
                <span className="pm-featured-card__friends">{game.friendsPlaying}</span>
              ) : null}
            </motion.div>

            <motion.button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                addXp(XP_GAME_FEATURED)
                onPlay?.(game)
              }}
              whileHover={reduceMotion ? undefined : { scale: 1.03, y: -1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            >
              <span className="pm-featured-card__btn-shine" aria-hidden />
              {game.cta}
            </motion.button>
          </motion.article>
        ))}
      </motion.div>

      <div className="pm-games-carousel-dots" aria-hidden>
        {games.map((game, index) => (
          <span key={`${game.id}-dot`} className={index === activeIndex ? 'is-active' : ''} />
        ))}
      </div>
    </section>
  )
}
