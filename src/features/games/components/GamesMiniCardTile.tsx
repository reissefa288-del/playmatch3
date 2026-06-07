import { memo, type HTMLAttributes } from 'react'
import { FiUsers } from 'react-icons/fi'
import type { GamesMiniCard } from '../data'
import { GameCoverArt } from './GameCoverArt'

export type GamesMiniCardTileProps = {
  game: GamesMiniCard
  onPlay?: (game: GamesMiniCard) => void
  cardHandlers?: HTMLAttributes<HTMLElement>
}

export const GamesMiniCardTile = memo(function GamesMiniCardTile({
  game,
  onPlay,
  cardHandlers,
}: GamesMiniCardTileProps) {
  function playGame() {
    if (game.isMore) return
    onPlay?.(game)
  }

  return (
    <article
      className={`pm-games-mini-card ${game.color}${game.isMore ? ' is-more' : ''}`}
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
      {!game.isMore ? (
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
      ) : null}
    </article>
  )
})
