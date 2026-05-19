import type { CSSProperties } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ProfileFavoriteGame } from '../data'

type FavoriteGamesRowProps = {
  games: ProfileFavoriteGame[]
}

export function FavoriteGamesRow({ games }: FavoriteGamesRowProps) {
  const reduceMotion = useReducedMotion()

  return (
    <section className="pm-profile-section" aria-label="Favori oyunlar">
      <header className="pm-profile-section__head">
        <h2>Favori Oyunlar</h2>
      </header>
      <motion.div
        className="pm-profile-games"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.06 } },
        }}
      >
        {games.map((game) => (
          <motion.button
            key={game.id}
            type="button"
            className={`pm-profile-game is-${game.accent}`}
            style={{ '--pm-profile-art-pos': game.artPosition } as CSSProperties}
            variants={{
              hidden: { opacity: 0, y: 10, scale: 0.92 },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            whileHover={reduceMotion ? undefined : { y: -5, scale: 1.06 }}
            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            aria-label={game.title}
          >
            <span className="pm-profile-game__art" aria-hidden>
              <game.icon />
            </span>
            <span className="pm-profile-game__label">{game.title}</span>
          </motion.button>
        ))}
      </motion.div>
    </section>
  )
}
