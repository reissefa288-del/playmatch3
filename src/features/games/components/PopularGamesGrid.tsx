import type { CSSProperties } from 'react'
import { FiChevronRight } from 'react-icons/fi'
import { motion, useReducedMotion } from 'framer-motion'
import type { HubGame } from '../data'

type PopularGamesGridProps = {
  games: HubGame[]
}

export function PopularGamesGrid({ games }: PopularGamesGridProps) {
  const reduceMotion = useReducedMotion()

  return (
    <section className="pm-games-popular" aria-label="Popüler oyunlar">
      <header className="pm-games-section-head">
        <h3>Popüler Oyunlar</h3>
        <button type="button">
          Tümünü Gör <FiChevronRight />
        </button>
      </header>

      <motion.div
        className="pm-games-grid"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.03 } },
        }}
      >
        {games.map((game) => (
          <motion.article
            key={game.id}
            className={`pm-game-card ${game.accent === 'pink' ? 'is-pink' : 'is-blue'}`}
            style={{ '--pm-card-art-pos': game.artPosition } as CSSProperties}
            variants={{
              hidden: { opacity: 0, y: 10, scale: 0.96 },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            whileHover={reduceMotion ? undefined : { y: -5, scale: 1.02 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
          >
            <span className="pm-game-card__glow" aria-hidden />
            <div className="pm-game-card__art">
              <span className="pm-game-card__art-gloss" aria-hidden />
              <game.icon />
            </div>
            <motion.div className="pm-game-card__content">
              <h4>{game.title}</h4>
              <p className="pm-game-card__activity">{game.activity}</p>
              <div className="pm-game-card__badges">
                <span className="pm-games-online-dot" />
                <small>{game.playersShort}</small>
                <em>{game.badge}</em>
              </div>
            </motion.div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  )
}
