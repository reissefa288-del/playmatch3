import { useCallback, useState } from 'react'
import { FiRefreshCw, FiUsers } from 'react-icons/fi'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { heroDiscoveryQueue } from '../data'
import { HeroPlayerCard } from './HeroPlayerCard'

type HeroDiscoveryStackProps = {
  portraitImage: string
}

type StackPhase = 'idle' | 'busy' | 'sent' | 'exiting'

const SENT_HOLD_MS = 1400
const EXIT_MS = 480

export function HeroDiscoveryStack({ portraitImage }: HeroDiscoveryStackProps) {
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<StackPhase>('idle')

  const current = heroDiscoveryQueue[index]
  const next = heroDiscoveryQueue[index + 1]
  const exhausted = index >= heroDiscoveryQueue.length

  const handleMatchRequest = useCallback(() => {
    if (!current || phase !== 'idle') return
    setPhase('busy')
    window.setTimeout(() => {
      setPhase('sent')
      window.setTimeout(() => {
        setPhase('exiting')
        window.setTimeout(() => {
          setIndex((i) => i + 1)
          setPhase('idle')
        }, EXIT_MS)
      }, SENT_HOLD_MS)
    }, 380)
  }, [current, phase])

  const resetQueue = () => {
    setIndex(0)
    setPhase('idle')
  }

  const showSent = phase === 'sent' || phase === 'exiting'
  const matchBusy = phase === 'busy'
  const showPeek = phase === 'idle' && Boolean(next)

  return (
    <div className="pm-hero-stack">
      <div className="pm-hero-stack__stage">
        {showPeek && next ? (
          <div className="pm-hero-stack__peek" aria-hidden>
            <HeroPlayerCard player={next} portraitImage={portraitImage} isPeek />
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
                  : { opacity: 0, y: -72, scale: 0.94, transition: { duration: EXIT_MS / 1000 } }
              }
              transition={{ type: 'spring', stiffness: 360, damping: 32 }}
            >
              <HeroPlayerCard
                player={current}
                portraitImage={portraitImage}
                showSentOverlay={showSent}
                matchBusy={matchBusy}
                onMatchRequest={handleMatchRequest}
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
              <p>Yarın yeni oyuncular seni bekliyor.</p>
              <button type="button" onClick={resetQueue}>
                <FiRefreshCw /> Baştan göster
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!exhausted && current ? (
        <p className="pm-hero-stack__hint">
          {index + 1} / {heroDiscoveryQueue.length} · Eşleşme isteği gönder, sıradaki profile geç
        </p>
      ) : null}
    </div>
  )
}
