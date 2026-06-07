import { useCallback, useState } from 'react'
import { FiRefreshCw, FiUsers } from 'react-icons/fi'
import { DAILY_LIKES_LIMIT } from '../../../shared/dailyLikes'
import { useManagedTimers } from '../../../shared/useManagedTimers'
import { useDailyLikesActions, useDailyLikesState } from '../../likes/useDailyLikes'
import { MatchLikesQuota } from '../../match/components/MatchLikesQuota'
import { usePremiumSubscriptionState } from '../../premium/usePremiumSubscription'
import { heroDiscoveryQueue } from '../data'
import { HeroPlayerCard } from './HeroPlayerCard'

type StackPhase = 'idle' | 'busy' | 'sent' | 'exiting'
type ExitMode = 'match' | 'pass'

const SENT_HOLD_MS = 1400
const EXIT_MS = 480
const PASS_EXIT_MS = 360

export function HeroDiscoveryStack() {
  const { active: isPremiumActive } = usePremiumSubscriptionState()
  const { remaining, isUnlimited } = useDailyLikesState()
  const { tryConsumeLike } = useDailyLikesActions()
  const timers = useManagedTimers()
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<StackPhase>('idle')
  const [exitMode, setExitMode] = useState<ExitMode>('match')
  const [sentVariant, setSentVariant] = useState<'match' | 'super'>('match')

  const current = heroDiscoveryQueue[index]
  const next = heroDiscoveryQueue[index + 1]
  const exhausted = index >= heroDiscoveryQueue.length
  const canLike = isUnlimited || remaining > 0

  const advanceCard = useCallback(() => {
    setIndex((i) => i + 1)
    setPhase('idle')
    setExitMode('match')
  }, [])

  const handleMatchRequest = useCallback(() => {
    if (!current || phase !== 'idle' || !canLike) return
    if (!tryConsumeLike()) return
    setSentVariant('match')
    setExitMode('match')
    setPhase('busy')
    timers.schedule(() => {
      setPhase('sent')
      timers.schedule(() => {
        setPhase('exiting')
        timers.schedule(advanceCard, EXIT_MS)
      }, SENT_HOLD_MS)
    }, 380)
  }, [advanceCard, canLike, current, phase, timers, tryConsumeLike])

  const handleSuperLike = useCallback(() => {
    if (!current || phase !== 'idle') return
    setSentVariant('super')
    setExitMode('match')
    setPhase('busy')
    timers.schedule(() => {
      setPhase('sent')
      timers.schedule(() => {
        setPhase('exiting')
        timers.schedule(advanceCard, EXIT_MS)
      }, SENT_HOLD_MS)
    }, 380)
  }, [advanceCard, current, phase, timers])

  const handlePass = useCallback(() => {
    if (!current || phase !== 'idle') return
    setExitMode('pass')
    setPhase('exiting')
    timers.schedule(advanceCard, PASS_EXIT_MS)
  }, [advanceCard, current, phase, timers])

  const resetQueue = () => {
    timers.clearAll()
    setIndex(0)
    setPhase('idle')
    setExitMode('match')
    setSentVariant('match')
  }

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
