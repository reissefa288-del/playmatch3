import { FiHeart } from 'react-icons/fi'
import { DAILY_LIKES_LIMIT } from '../data'

type MatchLikesQuotaProps = {
  remaining: number
  limit?: number
}

export function MatchLikesQuota({
  remaining,
  limit = DAILY_LIKES_LIMIT,
}: MatchLikesQuotaProps) {
  const used = limit - remaining
  const pct = limit > 0 ? (remaining / limit) * 100 : 0
  const isLow = remaining <= 3 && remaining > 0
  const isEmpty = remaining === 0

  return (
    <section
      className={`pm-match-likes-ribbon${isLow ? ' is-low' : ''}${isEmpty ? ' is-empty' : ''}`}
      aria-label={`Günlük beğeni hakkı: ${remaining} / ${limit}`}
    >
      <div className="pm-match-likes-ribbon__glow" aria-hidden />
      <div className="pm-match-likes-ribbon__ring" aria-hidden />

      <div className="pm-match-likes-ribbon__row">
        <span className="pm-match-likes-ribbon__icon" aria-hidden>
          <FiHeart />
        </span>

        <div className="pm-match-likes-ribbon__copy">
          <p className="pm-match-likes-ribbon__title">Günlük beğeni hakkı</p>
          <p className="pm-match-likes-ribbon__hint">
            {isEmpty
              ? 'Yarın yenilenir'
              : remaining === limit
                ? `Günde ${limit} beğeni gönderebilirsin`
                : `${remaining} hak kaldı · ${used} kullandın`}
          </p>
        </div>

        <div className="pm-match-likes-ribbon__count">
          <span className="pm-match-likes-ribbon__num">{remaining}</span>
          <span className="pm-match-likes-ribbon__sep">/</span>
          <span className="pm-match-likes-ribbon__max">{limit}</span>
        </div>
      </div>

      <div
        className="pm-match-likes-ribbon__track"
        role="progressbar"
        aria-valuenow={remaining}
        aria-valuemin={0}
        aria-valuemax={limit}
      >
        <div
          className="pm-match-likes-ribbon__fill"
          style={{ width: `${pct}%` }}
        />
      </div>
    </section>
  )
}
