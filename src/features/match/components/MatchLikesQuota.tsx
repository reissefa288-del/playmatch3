import likesHeart from '../assets/likes-heart.png'
import { DAILY_LIKES_LIMIT } from '../../../shared/dailyLikes'
import { LikesNeonShader } from './LikesNeonShader'

type MatchLikesQuotaProps = {
  remaining: number
  limit?: number
  isUnlimited?: boolean
}

export function MatchLikesQuota({
  remaining,
  limit = DAILY_LIKES_LIMIT,
  isUnlimited = false,
}: MatchLikesQuotaProps) {
  const used = limit - remaining
  const pct = isUnlimited ? 100 : limit > 0 ? (remaining / limit) * 100 : 0
  const isLow = !isUnlimited && remaining <= 3 && remaining > 0
  const isEmpty = !isUnlimited && remaining === 0

  return (
    <section
      className={`pm-match-likes-ribbon${isLow ? ' is-low' : ''}${isEmpty ? ' is-empty' : ''}${isUnlimited ? ' is-unlimited' : ''}`}
      aria-label={isUnlimited ? 'Premium: sınırsız beğeni' : `Günlük beğeni hakkı: ${remaining} / ${limit}`}
    >
      <LikesNeonShader />

      <div className="pm-match-likes-ribbon__row">
        <span className="pm-match-likes-ribbon__icon" aria-hidden>
          <img src={likesHeart} alt="" />
        </span>

        <div className="pm-match-likes-ribbon__copy">
          <p className="pm-match-likes-ribbon__title">Günlük beğeni hakkı</p>
          <p className="pm-match-likes-ribbon__hint">
            {isUnlimited
              ? 'Premium aktif — sınırsız beğeni'
              : isEmpty
                ? 'Yarın yenilenir'
                : remaining === limit
                  ? `Günde ${limit} beğeni gönderebilirsin`
                  : `${remaining} hak kaldı · ${used} kullandın`}
          </p>
        </div>

        <div className="pm-match-likes-ribbon__count">
          {isUnlimited ? (
            <span className="pm-match-likes-ribbon__num is-infinity">∞</span>
          ) : (
            <>
              <span className="pm-match-likes-ribbon__num">{remaining}</span>
              <span className="pm-match-likes-ribbon__sep">/</span>
              <span className="pm-match-likes-ribbon__max">{limit}</span>
            </>
          )}
        </div>
      </div>

      <div
        className="pm-match-likes-ribbon__track"
        role="progressbar"
        aria-valuenow={remaining}
        aria-valuemin={0}
        aria-valuemax={limit}
      >
        <div className="pm-match-likes-ribbon__fill" style={{ width: `${pct}%` }} />
      </div>
    </section>
  )
}
