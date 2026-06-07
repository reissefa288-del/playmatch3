import { motion } from 'framer-motion'
import { GameOpponentLikeButton } from './GameOpponentLikeButton'

type GamePlayerPortraitProps = {
  src: string
  variant: 'cyan' | 'pink'
  active?: boolean
  crown?: boolean
  label?: string
  /** Rakip portresinde beğeni butonu göster */
  enableLike?: boolean
  likePlayerId?: string
  likePlayerName?: string
}

export function GamePlayerPortrait({
  src,
  variant,
  active = false,
  crown = false,
  label,
  enableLike = false,
  likePlayerId,
  likePlayerName,
}: GamePlayerPortraitProps) {
  const showLike = enableLike && likePlayerId && likePlayerName

  return (
    <div className="pm-game-portrait-wrap">
      <motion.div
        className={`pm-game-portrait is-${variant} ${active ? 'is-active' : ''}`}
        layout
      >
        {crown ? <span className="pm-game-portrait__crown" aria-hidden>♛</span> : null}
        <img src={src} alt="" className="pm-game-portrait__photo" />
        {label ? <span className="pm-game-portrait__label">{label}</span> : null}
      </motion.div>
      {showLike ? (
        <GameOpponentLikeButton playerId={likePlayerId} playerName={likePlayerName} />
      ) : null}
    </div>
  )
}
