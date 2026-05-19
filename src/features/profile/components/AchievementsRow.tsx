import { motion, useReducedMotion } from 'framer-motion'
import type { ProfileAchievement } from '../data'

type AchievementsRowProps = {
  achievements: ProfileAchievement[]
  moreCount: number
}

export function AchievementsRow({ achievements, moreCount }: AchievementsRowProps) {
  const reduceMotion = useReducedMotion()

  return (
    <section className="pm-profile-section" aria-label="Başarımlar">
      <header className="pm-profile-section__head">
        <h2>Başarımlar</h2>
      </header>
      <div className="pm-profile-achievements">
        {achievements.map((badge, index) => (
          <motion.button
            key={badge.id}
            type="button"
            className={`pm-profile-badge is-${badge.accent}`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.05, duration: 0.35 }}
            whileHover={reduceMotion ? undefined : { scale: 1.1, y: -3 }}
            whileTap={reduceMotion ? undefined : { scale: 0.95 }}
            aria-label={badge.label}
          >
            <span className="pm-profile-badge__ring" aria-hidden />
            <badge.icon aria-hidden />
          </motion.button>
        ))}
        <motion.span
          className="pm-profile-badge-more"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          +{moreCount}
        </motion.span>
      </div>
    </section>
  )
}
