import { useState, type MouseEvent } from 'react'
import { IoHeart } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import { useAuthSession } from '../../auth/useAuthSession'
import { useDailyLikesState, useDailyLikesActions } from '../../likes/useDailyLikes'
import { useHasLiked, useNearbyLikesActions } from '../../home/useNearbyLikes'
import { isFirestoreUserId } from '../../match/isFirestoreUserId'
import { sendLikeAndRefresh } from '../../match/matchConnectionsStore'
import { useMatchConnections } from '../../match/useMatchConnections'
import { isPremiumFeatureEnabled } from '../../premium/premiumAvailability'
import { GameLikeShader } from './GameLikeShader'

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
    <div
      className="pm-game-opponent-like__burst"
     
     
     
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
    </div>
  )
}

export function GameOpponentLikeButton({ playerId, playerName, className = '' }: GameOpponentLikeButtonProps) {
  const navigate = useNavigate()
  const { session } = useAuthSession()
  const { sendLike } = useNearbyLikesActions()
  const { hasLiked } = useMatchConnections()
  const nearbyLiked = useHasLiked(playerId)
  const alreadyLiked =
    (isFirestoreUserId(playerId) && hasLiked(playerId)) || nearbyLiked
  const { remaining, isUnlimited, canSendLike, limit } = useDailyLikesState()
  const { tryConsumeLike } = useDailyLikesActions()
  const [burst, setBurst] = useState(false)
  const [gone, setGone] = useState(false)
  const [toast, setToast] = useState<ToastKind>(null)

  const hasQuota = isUnlimited || canSendLike
  const hideButton = gone || alreadyLiked || (!hasQuota && !burst)

  const handleLike = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (burst) return

    if (alreadyLiked || !hasQuota) return

    void (async () => {
      if (!(await tryConsumeLike())) {
        setGone(true)
        return
      }

      if (isFirestoreUserId(playerId) && session?.uid) {
        try {
          await sendLikeAndRefresh(session.uid, playerId, 'game')
        } catch {
          setToast('limit')
          window.setTimeout(() => setToast(null), 3200)
          return
        }
      } else {
        sendLike(playerId)
      }

      setBurst(true)
      setToast('sent')
      window.setTimeout(() => {
        setBurst(false)
        setGone(true)
        setToast(null)
      }, BURST_MS)
    })()
  }

  if (hideButton && !burst && toast !== 'sent') return null

  return (
    <div className={`pm-game-opponent-like ${className}`.trim()}>
      {hideButton ? null : (
      <button
        type="button"
        className={['pm-game-opponent-like__btn', isUnlimited ? 'is-premium' : ''].filter(Boolean).join(' ')}
        aria-label={`${playerName} beğen · ${isUnlimited ? 'sınırsız' : `${remaining}/${limit} hak`}`}
        disabled={burst}
        onClick={handleLike}
      >
        <GameLikeShader />
        <span className="pm-game-opponent-like__icon-wrap" aria-hidden>
          <IoHeart className="pm-game-opponent-like__icon" />
        </span>
      </button>
      )}

      <>
        {burst ? (
          <GameLikeBurst
            playerName={playerName}
            remaining={remaining}
            limit={limit}
            isUnlimited={isUnlimited}
          />
        ) : null}
      </>

      <>
        {toast === 'limit' ? (
          <div
            className="pm-game-opponent-like__toast is-limit"
           
           
           
            role="status"
          >
            <strong>Günlük hak bitti</strong>
            <span>Bugün {limit} beğeni hakkını kullandın.</span>
            {isPremiumFeatureEnabled() ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate('/premium')
                }}
              >
                Premium · Sınırsız
              </button>
            ) : null}
          </div>
        ) : null}
        {toast === 'sent' && !burst ? (
          <span
            className="pm-game-opponent-like__toast is-sent"
           
           
           
            role="status"
          >
            Beğeni gönderildi ♥
            {!isUnlimited ? ` · ${remaining}/${limit} kaldı` : ''}
          </span>
        ) : null}
      </>
    </div>
  )
}
