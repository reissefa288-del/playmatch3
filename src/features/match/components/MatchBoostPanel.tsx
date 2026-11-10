import { memo, useCallback } from 'react'
import boostBg from '../assets/boost-bg.webp'
import boostBolt from '../assets/boost-bolt.png'
import boostCta from '../assets/boost-cta.png'
import boostStreaks from '../assets/boost-streaks.png'
import elmasIcon from '../../../reference/opt/thumb/elmas.webp'
import { useGemBalanceActions, useGemBalanceState, formatBalance } from '../../currency/GemBalanceProvider'
import type { MatchToastPayload } from '../useMatchDiscover'
import { useMatchBoost } from '../useMatchBoost'

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
  const { isActive, remainingLabel, progress, activate, cost, durationLabel } =
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
      `${durationLabel} boyunca profilin daha fazla kişiye gösterilecek`,
    )
  }, [
    activate,
    balance,
    cost,
    durationLabel,
    isActive,
    onNotify,
    spend,
  ])

  return (
    <button
      type="button"
      className={`pm-match-boost${isActive ? ' is-active' : ''}`}
      disabled={isActive}
      aria-disabled={isActive}
      aria-label={
        isActive
          ? `Boost aktif, ${remainingLabel} kaldı`
          : `Eşleşme şansını artır, ${cost} elmas, ${durationLabel}`
      }
      onClick={handleBoost}
    >
      <img
        className="pm-match-boost__bg"
        src={boostBg}
        alt=""
        width={1080}
        height={270}
        draggable={false}
        aria-hidden
      />
      <img
        className="pm-match-boost__streaks"
        src={boostStreaks}
        alt=""
        width={1024}
        height={256}
        draggable={false}
        aria-hidden
      />
      <span className="pm-match-boost__bloom" aria-hidden />
      <span className="pm-match-boost__rim" aria-hidden />
      <span className="pm-match-boost__hairline" aria-hidden />
      <span className="pm-match-boost__sheen" aria-hidden />
      <span className="pm-match-boost__inner">
        <span className="pm-match-boost__icon-wrap" aria-hidden>
          <img
            className="pm-match-boost__icon"
            src={boostBolt}
            alt=""
            width={128}
            height={128}
            draggable={false}
          />
        </span>
        <span className="pm-match-boost__text">
          <span className="pm-match-boost__title">
            Eşleşme
            <span className="pm-match-boost__title-accent">Şansını Artır!</span>
          </span>
          <span className="pm-match-boost__note">
            Daha fazla kişi
            <br />
            seni görsün · {cost} elmas · {durationLabel}
          </span>
        </span>
        <span className="pm-match-boost__cta" aria-hidden>
          <img className="pm-match-boost__cta-art" src={boostCta} alt="" width={384} height={114} draggable={false} />
          <img className="pm-match-boost__gem" src={elmasIcon} alt="" width={16} height={16} draggable={false} />
          BOOST ET · {cost} ELMAS
        </span>
      </span>
      {isActive ? (
        <span className="pm-match-boost__live" aria-hidden>
          AKTİF · {remainingLabel}
        </span>
      ) : null}
      {isActive ? (
        <span
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
        </span>
      ) : null}
    </button>
  )
}

export const MatchBoostPanel = memo(MatchBoostPanelInner, boostPanelPropsEqual)
