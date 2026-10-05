import type { CSSProperties } from 'react'
import type { ProfileFavoriteGame } from '../data'

type FavoriteGamesRowProps = {
  games: ProfileFavoriteGame[]
}

export function FavoriteGamesRow({ games }: FavoriteGamesRowProps) {

  return (
    <section className="pm-profile-section" aria-label="Favori oyunlar">
      <header className="pm-profile-section__head">
        <h2>Favori Oyunlar</h2>
      </header>
      <div
        className="pm-profile-games"
       
       
       
      >
        {games.map((game) => (
          <button
            key={game.id}
            type="button"
            className={`pm-profile-game is-${game.accent}`}
            style={{ '--pm-profile-art-pos': game.artPosition } as CSSProperties}
           
           
           
            aria-label={game.title}
          >
            <span className="pm-profile-game__art" aria-hidden>
              <game.icon />
            </span>
            <span className="pm-profile-game__label">{game.title}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
