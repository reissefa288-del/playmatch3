import { useState, type MouseEvent } from 'react'
import { IoHeart } from 'react-icons/io5'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useDailyLikesState, useDailyLikesActions } from '../../likes/useDailyLikes'
import { useHasLiked, useNearbyLikesActions } from '../../home/useNearbyLikes'

type GameOpponentLikeButtonProps = {
  playerId: string
  playerName: string
  className?: string
}

type ToastKind = 'sent' | 'already' | 'limit' | null

const BURST_MS = 920

function GameLikeBurst({
  playerName,
  remaining,
  limit,
  isUnlimited,
}: {
  playerName: string
  remaining: number
  limit: number
  isUnlimited: boolean
}) {
  return (
    <motion.div
      className="pm-game-opponent-like__burst"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      role="status"
      aria-live="polite"
    >
      <span className="pm-game-opponent-like__burst-ring" aria-hidden />
      <span className="pm-game-opponent-like__burst-glow" aria-hidden />
      <span className="pm-game-opponent-like__burst-icon" aria-hidden>
        <IoHeart />
      </span>
      <strong>Beğenildi!</strong>
      <small>
        {playerName}
        {!isUnlimited ? ` · ${remaining}/${limit} kaldı` : ' · Premium sınırsız'}
      </small>
      <div className="pm-game-opponent-like__particles" aria-hidden>
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="pm-game-opponent-like__particle" style={{ '--i': i } as React.CSSProperties} />
        ))}
      </div>
    </motion.div>
  )
}

export function GameOpponentLikeButton({ playerId, playerName, className = '' }: GameOpponentLikeButtonProps) {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const { sendLike } = useNearbyLikesActions()
  const alreadyLiked = useHasLiked(playerId)
  const { remaining, isUnlimited, canSendLike, limit } = useDailyLikesState()
  const { tryConsumeLike } = useDailyLikesActions()
  const [burst, setBurst] = useState(false)
  const [toast, setToast] = useState<ToastKind>(null)

  const showLiked = alreadyLiked || burst
  const exhausted = !isUnlimited && !canSendLike && !alreadyLiked

  const handleLike = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (burst) return

    if (alreadyLiked) {
      setBurst(true)
      setToast('already')
      window.setTimeout(() => setBurst(false), BURST_MS)
      window.setTimeout(() => setToast(null), 2400)
      return
    }

    if (!tryConsumeLike()) {
      setToast('limit')
      window.setTimeout(() => setToast(null), 3200)
      return
    }

    sendLike(playerId)
    setBurst(true)
    setToast('sent')
    window.setTimeout(() => setBurst(false), BURST_MS)
    window.setTimeout(() => setToast(null), 2600)
  }

  const quotaLabel = isUnlimited ? '∞' : String(remaining)

  return (
    <div className={`pm-game-opponent-like ${className}`.trim()}>
      <motion.button
        type="button"
        className={[
          'pm-game-opponent-like__btn',
          showLiked ? 'is-liked' : '',
          isUnlimited ? 'is-premium' : '',
          exhausted ? 'is-exhausted' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label={
          alreadyLiked
            ? `${playerName} beğenildi`
            : exhausted
              ? 'Günlük beğeni hakkın bitti'
              : `${playerName} beğen · ${isUnlimited ? 'sınırsız' : `${remaining}/${limit} hak`}`
        }
        disabled={burst || exhausted}
        onClick={handleLike}
        whileTap={reduceMotion || burst || exhausted ? undefined : { scale: 0.9 }}
        animate={burst && !reduceMotion ? { scale: [1, 1.18, 1.02] } : { scale: 1 }}
        transition={{ duration: 0.36 }}
      >
        <span className="pm-game-opponent-like__btn-shine" aria-hidden />
        <span className="pm-game-opponent-like__icon-wrap" aria-hidden>
          <IoHeart className="pm-game-opponent-like__icon" />
        </span>
      </motion.button>
      {!alreadyLiked && !exhausted ? (
        <span className="pm-game-opponent-like__quota" aria-hidden>
          {quotaLabel}
        </span>
      ) : null}

      <AnimatePresence>
        {burst ? (
          <GameLikeBurst
            playerName={playerName}
            remaining={remaining}
            limit={limit}
            isUnlimited={isUnlimited}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {toast === 'limit' ? (
          <motion.div
            className="pm-game-opponent-like__toast is-limit"
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            role="status"
          >
            <strong>Günlük hak bitti</strong>
            <span>Bugün {limit} beğeni hakkını kullandın.</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                navigate('/premium')
              }}
            >
              Premium · Sınırsız
            </button>
          </motion.div>
        ) : null}
        {toast === 'sent' && !burst ? (
          <motion.span
            className="pm-game-opponent-like__toast is-sent"
            initial={{ opacity: 0, y: 6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            role="status"
          >
            Beğeni gönderildi ♥
            {!isUnlimited ? ` · ${remaining}/${limit} kaldı` : ''}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
