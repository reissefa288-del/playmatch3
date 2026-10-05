import { useCallback, useSyncExternalStore } from 'react'
import { FiRefreshCw, FiUsers } from 'react-icons/fi'
import { DAILY_LIKES_LIMIT } from '../../../shared/dailyLikes'
import { useManagedTimers } from '../../../shared/useManagedTimers'
import { formatBalance, useGemBalanceActions, useGemBalanceState } from '../../currency/GemBalanceProvider'
import { useDailyLikesActions, useDailyLikesState } from '../../likes/useDailyLikes'
import { MatchLikesQuota } from '../../match/components/MatchLikesQuota'
import { usePremiumSubscriptionState } from '../../premium/usePremiumSubscription'
import { heroDiscoveryQueue, HERO_DISCOVERY_DEMO_LABEL } from '../data'
import {
  advanceHeroStackIndex,
  beginHeroMatchFlow,
  beginHeroPassFlow,
  beginHeroSuperLikeFlow,
  getHeroStackSnapshot,
  markHeroExitingPhase,
  markHeroSentPhase,
  resetHeroStack,
  subscribeHeroStack,
} from '../heroDiscoveryStackStore'
import { HeroPlayerCard } from './HeroPlayerCard'

const SENT_HOLD_MS = 1400
const EXIT_MS = 480
const PASS_EXIT_MS = 360

export function HeroDiscoveryStack() {
  const stack = useSyncExternalStore(subscribeHeroStack, getHeroStackSnapshot, getHeroStackSnapshot)
  const { active: isPremiumActive } = usePremiumSubscriptionState()
  const { remaining, isUnlimited } = useDailyLikesState()
  const { tryConsumeLike } = useDailyLikesActions()
  const { spend } = useGemBalanceActions()
  const { balance } = useGemBalanceState()
  const timers = useManagedTimers()

  const { index, phase, exitMode, sentVariant } = stack
  const current = heroDiscoveryQueue[index]
  const next = heroDiscoveryQueue[index + 1]
  const exhausted = index >= heroDiscoveryQueue.length
  const canLike = isUnlimited || remaining > 0

  const scheduleExit = useCallback(
    (delayMs: number) => {
      timers.schedule(() => {
        markHeroExitingPhase()
        timers.schedule(advanceHeroStackIndex, delayMs)
      }, SENT_HOLD_MS)
    },
    [timers],
  )

  const handleMatchRequest = useCallback(() => {
    if (!current || phase !== 'idle' || !canLike) return
    void (async () => {
      if (!(await tryConsumeLike())) return
      beginHeroMatchFlow()
      timers.schedule(() => {
        markHeroSentPhase()
        scheduleExit(EXIT_MS)
      }, 380)
    })()
  }, [canLike, current, phase, scheduleExit, timers, tryConsumeLike])

  const handleSuperLike = useCallback(() => {
    if (!current || phase !== 'idle') return
    beginHeroSuperLikeFlow()
    timers.schedule(() => {
      markHeroSentPhase()
      scheduleExit(EXIT_MS)
    }, 380)
  }, [current, phase, scheduleExit, timers])

  const handlePass = useCallback(() => {
    if (!current || phase !== 'idle') return
    beginHeroPassFlow()
    timers.schedule(advanceHeroStackIndex, PASS_EXIT_MS)
  }, [current, phase, timers])

  const resetQueue = useCallback(() => {
    timers.clearAll()
    resetHeroStack()
  }, [timers])

  const showSent = phase === 'sent' || (phase === 'exiting' && exitMode === 'match')
  const matchBusy = phase === 'busy'
  const showPeek = phase === 'idle' && Boolean(next)

  const cardMotionClass =
    phase === 'exiting'
      ? exitMode === 'pass'
        ? 'is-exit-pass'
        : 'is-exit-match'
      : phase === 'idle'
        ? 'is-enter'
        : ''

  return (
    <div className="pm-hero-stack">
      <p className="pm-hero-demo-label" role="status">
        {HERO_DISCOVERY_DEMO_LABEL}
      </p>
      {!exhausted ? (
        <MatchLikesQuota remaining={remaining} limit={DAILY_LIKES_LIMIT} isUnlimited={isUnlimited} />
      ) : null}

      <div className="pm-hero-stack__stage">
        {showPeek && next ? (
          <div className="pm-hero-stack__peek" aria-hidden>
            <HeroPlayerCard player={next} isPeek />
          </div>
        ) : null}

        {!exhausted && current ? (
          <div key={current.id} className={`pm-hero-stack__card ${cardMotionClass}`}>
            <HeroPlayerCard
              player={current}
              showSentOverlay={showSent}
              matchBusy={matchBusy}
              canLike={canLike}
              isPremium={isPremiumActive}
              sentOverlayVariant={sentVariant}
              gemBalance={balance}
              gemSpend={spend}
              gemBalanceLabel={formatBalance(balance)}
              onMatchRequest={handleMatchRequest}
              onPass={handlePass}
              onSuperLike={handleSuperLike}
            />
          </div>
        ) : (
          <div className="pm-hero-stack__empty pm-hero-stack__empty--enter">
            <div className="pm-hero-stack__empty-icon">
              <FiUsers />
            </div>
            <h3>Bugünlük öneriler tamamlandı</h3>
            <p>
              {canLike
                ? 'Yarın yeni oyuncular seni bekliyor.'
                : `Günlük ${DAILY_LIKES_LIMIT} beğeni hakkını kullandın. Yarın yenilenir.`}
            </p>
            <button type="button" onClick={resetQueue}>
              <FiRefreshCw /> Baştan göster
            </button>
          </div>
        )}
      </div>

      {!exhausted && current ? (
        <p className="pm-hero-stack__hint">
          {index + 1} / {heroDiscoveryQueue.length} ·{' '}
          {isUnlimited ? '∞ beğeni' : `${remaining}/${DAILY_LIKES_LIMIT} beğeni`} · Geç veya eşleşme
          isteği gönder
        </p>
      ) : null}
    </div>
  )
}
