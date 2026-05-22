import { useCallback } from 'react'
import { FiZap } from 'react-icons/fi'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useGemBalance } from '../../currency/GemBalanceProvider'
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

export function MatchBoostPanel({ onNotify }: MatchBoostPanelProps) {
  const reduceMotion = useReducedMotion()
  const { spend, formatBalance, balance } = useGemBalance()
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
    formatBalance,
    isActive,
    onNotify,
    spend,
  ])

  return (
    <motion.section
      className={`pm-match-boost${isActive ? ' is-active' : ''}`}
      aria-label="Boost"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16, duration: 0.45 }}
      layout
    >
      <div className="pm-match-boost-shimmer" aria-hidden />
      <span className="pm-match-boost__rim" aria-hidden />

      <AnimatePresence>
        {isActive ? (
          <>
            <motion.span
              className="pm-match-boost__aura pm-match-boost__aura--a"
              aria-hidden
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.span
              className="pm-match-boost__aura pm-match-boost__aura--b"
              aria-hidden
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.span
              className="pm-match-boost__scan"
              aria-hidden
              initial={{ x: '-120%' }}
              animate={{ x: '220%' }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: 'linear',
                repeatDelay: 1.2,
              }}
            />
          </>
        ) : null}
      </AnimatePresence>

      <motion.div
        className="pm-match-boost__inner"
        animate={
          isActive && !reduceMotion
            ? { boxShadow: ['0 0 0 rgba(80,160,255,0)', '0 0 0 rgba(80,160,255,0)'] }
            : undefined
        }
      >
        <div className="pm-match-boost__icon-wrap">
          {isActive ? (
            <div className="pm-match-boost__sparks" aria-hidden>
              {SPARKS.map((i) => (
                <span key={i} className={`pm-match-boost__spark pm-match-boost__spark--${i}`} />
              ))}
            </div>
          ) : null}
          <motion.div
            className="pm-match-boost__icon"
            animate={
              isActive && !reduceMotion
                ? {
                    scale: [1, 1.1, 1],
                    rotate: [0, -6, 6, 0],
                  }
                : { scale: 1, rotate: 0 }
            }
            transition={
              isActive
                ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.3 }
            }
          >
            <motion.span
              animate={
                isActive && !reduceMotion
                  ? { opacity: [0.7, 1, 0.7], scale: [0.95, 1.12, 0.95] }
                  : { opacity: 1, scale: 1 }
              }
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <FiZap aria-hidden />
            </motion.span>
          </motion.div>
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

        <motion.button
          type="button"
          className="pm-match-boost__cta"
          disabled={isActive}
          aria-disabled={isActive}
          aria-label={
            isActive
              ? `Boost aktif, ${remainingLabel} kaldı`
              : `Boost et, ${cost} elmas`
          }
          whileHover={isActive ? undefined : { scale: 1.04 }}
          whileTap={isActive ? undefined : { scale: 0.94 }}
          onClick={handleBoost}
          animate={
            isActive && !reduceMotion
              ? {
                  boxShadow: [
                    '0 0 18px rgba(80, 160, 255, 0.45)',
                    '0 0 28px rgba(120, 200, 255, 0.65)',
                    '0 0 18px rgba(80, 160, 255, 0.45)',
                  ],
                }
              : undefined
          }
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {isActive ? `Aktif · ${remainingLabel}` : `Boost Et · ${cost} elmas`}
        </motion.button>
      </motion.div>

      {isActive ? (
        <div
          className="pm-match-boost__progress-track"
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Boost süresi"
        >
          <motion.span
            className="pm-match-boost__progress-fill"
            initial={{ scaleX: 1 }}
            animate={{ scaleX: progress }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      ) : null}
    </motion.section>
  )
}
