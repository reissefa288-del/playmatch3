import { useEffect, useRef } from 'react'
import { LuSparkles } from 'react-icons/lu'
import { motion, useReducedMotion } from 'framer-motion'
import levelBackdrop from '../../../reference/opt/thumb/arka.webp'
import { LazyImage } from '../../../shared/LazyImage'
import { formatXp } from '../profileLevel'
import { useProfileLevel } from '../ProfileLevelProvider'

export function ProfileLevelCard() {
  const reduceMotion = useReducedMotion()
  const { level, xpInLevel, xpToNext, percent, lastGain } = useProfileLevel()
  const prevLevelRef = useRef(level)
  const leveledUp = level > prevLevelRef.current

  useEffect(() => {
    prevLevelRef.current = level
  }, [level])

  return (
    <section className="pm-profile-level-card" aria-label="Seviye bilgisi">
      <div className="pm-profile-level-badge">
        <span className="pm-profile-level-badge__bg" aria-hidden>
          <LazyImage src={levelBackdrop} alt="" className="pm-profile-level-badge__img" width={56} height={56} />
        </span>
        <span className="pm-profile-level-badge__shine" aria-hidden />
        <motion.span
          className="pm-profile-level-badge__num"
          key={level}
          initial={leveledUp && !reduceMotion ? { scale: 0.7, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 22 }}
        >
          {level}
        </motion.span>
      </div>

      <div className="pm-profile-level-card__body">
        <div className="pm-profile-level-card__head">
          <p className="pm-profile-level-card__label">Seviye</p>
          <h3 className="pm-profile-level-card__level">{level}</h3>
          <strong className="pm-profile-level-card__xp-tag">XP</strong>
        </div>

        <div
          className="pm-profile-level-card__bar"
          role="progressbar"
          aria-valuenow={Math.round(percent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Seviye ilerlemesi ${Math.round(percent)} yüzde`}
        >
          <span className="pm-profile-level-card__bar-track" aria-hidden />
          <motion.span
            className="pm-profile-level-card__bar-fill"
            initial={false}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          />
          <span className="pm-profile-level-card__bar-glow" aria-hidden />
        </div>

        <div className="pm-profile-level-card__xp-row">
          <p className="pm-profile-level-card__xp">
            <span>{formatXp(xpInLevel)}</span>
            <small>/ {formatXp(xpToNext)} XP</small>
          </p>
          {lastGain ? (
            <motion.span
              className="pm-profile-level-card__gain"
              role="status"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <LuSparkles aria-hidden />+{formatXp(lastGain)} XP
            </motion.span>
          ) : (
            <span className="pm-profile-level-card__hint">Oyun oyna, XP kazan</span>
          )}
        </div>
      </div>
    </section>
  )
}
