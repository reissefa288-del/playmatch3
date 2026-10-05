import { memo, useCallback } from 'react'
import { FiZap } from 'react-icons/fi'
import { useGemBalanceActions, useGemBalanceState, formatBalance } from '../../currency/GemBalanceProvider'
import type { MatchToastPayload } from '../useMatchDiscover'
import { useMatchBoost } from '../useMatchBoost'

const SPARKS = [0, 1, 2, 3, 4, 5] as const

type MatchBoostPanelProps = {
  onNotify?: (
    title: string,
    variant: MatchToastPayload['variant'],
    subtitle?: string,
  ) => void
}

function boostPanelPropsEqual(prev: MatchBoostPanelProps, next: MatchBoostPanelProps) {
  return prev.onNotify === next.onNotify
}

function MatchBoostPanelInner({ onNotify }: MatchBoostPanelProps) {
  const { spend } = useGemBalanceActions()
  const { balance } = useGemBalanceState()
  const { isActive, remainingLabel, progress, activate, cost, durationMinutes } =
    useMatchBoost()

  const handleBoost = useCallback(() => {
    if (isActive) return

    if (balance < cost) {
      onNotify?.(
        'Yetersiz elmas',
        'warn',
        `Boost için ${cost} elmas gerekir · Bakiye: ${formatBalance(balance)}`,
      )
      return
    }

    if (!spend(cost)) {
      onNotify?.('Yetersiz elmas', 'warn', `Boost için ${cost} elmas gerekir`)
      return
    }

    activate()
    onNotify?.(
      'Boost aktif!',
      'success',
      `${durationMinutes} dk boyunca profilin daha fazla kişiye gösterilecek`,
    )
  }, [
    activate,
    balance,
    cost,
    durationMinutes,
    isActive,
    onNotify,
    spend,
  ])

  return (
    <section
      className={`pm-match-boost${isActive ? ' is-active' : ''}`}
      aria-label="Boost"
    >
      <div className="pm-match-boost-shimmer" aria-hidden />
      <span className="pm-match-boost__rim" aria-hidden />

      {isActive ? (
        <>
          <span className="pm-match-boost__aura pm-match-boost__aura--a" aria-hidden />
          <span className="pm-match-boost__aura pm-match-boost__aura--b" aria-hidden />
          <span className="pm-match-boost__scan" aria-hidden />
        </>
      ) : null}

      <div className="pm-match-boost__inner">
        <div className="pm-match-boost__icon-wrap">
          {isActive ? (
            <div className="pm-match-boost__sparks" aria-hidden>
              {SPARKS.map((i) => (
                <span key={i} className={`pm-match-boost__spark pm-match-boost__spark--${i}`} />
              ))}
            </div>
          ) : null}
          <div className="pm-match-boost__icon">
            <span>
              <FiZap aria-hidden />
            </span>
          </div>
        </div>

        <p className="pm-match-boost__text">
          {isActive ? (
            <>
              <strong>Boost aktif</strong>
              Profilin öne çıkıyor · {remainingLabel} kaldı
            </>
          ) : (
            <>
              <strong>Eşleşme Şansını Artır!</strong>
              Daha fazla kişi seni görsün · {cost} elmas · {durationMinutes} dk
            </>
          )}
        </p>

        <button
          type="button"
          className="pm-match-boost__cta"
          disabled={isActive}
          aria-disabled={isActive}
          aria-label={
            isActive
              ? `Boost aktif, ${remainingLabel} kaldı`
              : `Boost et, ${cost} elmas`
          }
          onClick={handleBoost}
        >
          {isActive ? `Aktif · ${remainingLabel}` : `Boost Et · ${cost} elmas`}
        </button>
      </div>

      {isActive ? (
        <div
          className="pm-match-boost__progress-track"
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Boost süresi"
        >
          <span
            className="pm-match-boost__progress-fill"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
      ) : null}
    </section>
  )
}

export const MatchBoostPanel = memo(MatchBoostPanelInner, boostPanelPropsEqual)
