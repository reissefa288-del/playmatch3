import type { CSSProperties } from 'react'
import { FiChevronRight } from 'react-icons/fi'
import { useProfileLevelActions } from '../../profile/ProfileLevelProvider'
import { XP_GAME_POPULAR } from '../../profile/profileLevel'
import type { HubGame } from '../data'
import { GameCoverArt } from './GameCoverArt'

type PopularGamesGridProps = {
  games: HubGame[]
}

export function PopularGamesGrid({ games }: PopularGamesGridProps) {
  const { addXp } = useProfileLevelActions()

  return (
    <section className="pm-games-popular" aria-label="Popüler oyunlar">
      <header className="pm-games-section-head">
        <h3>Popüler Oyunlar</h3>
        <button type="button">
          Tümünü Gör <FiChevronRight />
        </button>
      </header>

      <div
        className="pm-games-grid"
       
       
       
      >
        {games.map((game) => (
          <article
            key={game.id}
            className={`pm-game-card ${game.accent === 'pink' ? 'is-pink' : 'is-blue'}`}
            style={{ '--pm-card-art-pos': game.artPosition } as CSSProperties}
           
           
           
            onClick={() => addXp(XP_GAME_POPULAR)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                addXp(XP_GAME_POPULAR)
              }
            }}
          >
            <span className="pm-game-card__glow" aria-hidden />
            <GameCoverArt gameId={game.id} className="pm-game-card__art">
              <span className="pm-game-card__art-gloss" aria-hidden />
              <game.icon />
            </GameCoverArt>
            <div className="pm-game-card__content">
              <h4>{game.title}</h4>
              <p className="pm-game-card__activity">{game.activity}</p>
              <div className="pm-game-card__badges">
                <span className="pm-games-online-dot" />
                <small>{game.playersShort}</small>
                <em>{game.badge}</em>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
