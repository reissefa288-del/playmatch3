import { useCallback, useState } from 'react'
import { FiRefreshCw, FiUsers } from 'react-icons/fi'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { DAILY_LIKES_LIMIT } from '../../../shared/dailyLikes'
import { MatchLikesQuota } from '../../match/components/MatchLikesQuota'
import { useDailyLikes } from '../../likes/useDailyLikes'
import { usePremiumSubscription } from '../../premium/usePremiumSubscription'
import { heroDiscoveryQueue } from '../data'
import { HeroPlayerCard } from './HeroPlayerCard'

type StackPhase = 'idle' | 'busy' | 'sent' | 'exiting'
type ExitMode = 'match' | 'pass'

const SENT_HOLD_MS = 1400
const EXIT_MS = 480
const PASS_EXIT_MS = 360

export function HeroDiscoveryStack() {
  const reduceMotion = useReducedMotion()
  const { isPremiumActive } = usePremiumSubscription()
  const { remaining, isUnlimited, tryConsumeLike } = useDailyLikes()
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
    window.setTimeout(() => {
      setPhase('sent')
      window.setTimeout(() => {
        setPhase('exiting')
        window.setTimeout(advanceCard, EXIT_MS)
      }, SENT_HOLD_MS)
    }, 380)
  }, [advanceCard, canLike, current, phase, tryConsumeLike])

  const handleSuperLike = useCallback(() => {
    if (!current || phase !== 'idle') return
    setSentVariant('super')
    setExitMode('match')
    setPhase('busy')
    window.setTimeout(() => {
      setPhase('sent')
      window.setTimeout(() => {
        setPhase('exiting')
        window.setTimeout(advanceCard, EXIT_MS)
      }, SENT_HOLD_MS)
    }, 380)
  }, [advanceCard, current, phase])

  const handlePass = useCallback(() => {
    if (!current || phase !== 'idle') return
    setExitMode('pass')
    setPhase('exiting')
    window.setTimeout(advanceCard, PASS_EXIT_MS)
  }, [advanceCard, current, phase])

  const resetQueue = () => {
    setIndex(0)
    setPhase('idle')
    setExitMode('match')
    setSentVariant('match')
  }

  const showSent = phase === 'sent' || (phase === 'exiting' && exitMode === 'match')
  const matchBusy = phase === 'busy'
  const showPeek = phase === 'idle' && Boolean(next)

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

        <AnimatePresence mode="popLayout">
          {!exhausted && current ? (
            <motion.div
              key={current.id}
              className="pm-hero-stack__card"
              initial={reduceMotion ? false : { opacity: 0, y: 36, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : exitMode === 'pass'
                    ? {
                        opacity: 0,
                        x: -120,
                        rotate: -5,
                        scale: 0.94,
                        transition: { duration: PASS_EXIT_MS / 1000 },
                      }
                    : {
                        opacity: 0,
                        y: -72,
                        scale: 0.94,
                        transition: { duration: EXIT_MS / 1000 },
                      }
              }
              transition={{ type: 'spring', stiffness: 360, damping: 32 }}
            >
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
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="pm-hero-stack__empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
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
            </motion.div>
          )}
        </AnimatePresence>
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
