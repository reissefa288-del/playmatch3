import type { IconType } from 'react-icons'
import { motion, useReducedMotion } from 'framer-motion'

type ProfileRankCardProps = {
  tier: string
  label: string
  current: number
  max: number
  progress: number
  Emblem: IconType
}

export function ProfileRankCard({
  tier,
  label,
  current,
  max,
  progress,
  Emblem,
}: ProfileRankCardProps) {
  const reduceMotion = useReducedMotion()
  const pct = Math.round(progress * 100)

  return (
    <motion.aside
      className="pm-profile-rank"
      aria-label="Siralama"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.12, duration: 0.5 }}
      whileHover={reduceMotion ? undefined : { y: -3, scale: 1.01 }}
    >
      <span className="pm-profile-rank__shine" aria-hidden />
      <motion.div className="pm-profile-rank__head">
        <motion.div>
          <strong>{tier}</strong>
          <span>{label}</span>
        </motion.div>
        <motion.div className="pm-profile-rank__emblem">
          <Emblem aria-hidden />
        </motion.div>
      </motion.div>
      <p className="pm-profile-rank__xp">
        {current.toLocaleString('tr-TR')} / {max.toLocaleString('tr-TR')}
      </p>
      <motion.div
        className="pm-profile-rank__bar"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        initial={reduceMotion ? undefined : { opacity: 0.6 }}
        animate={{ opacity: 1 }}
      >
        <motion.span
          className="pm-profile-rank__fill"
          initial={reduceMotion ? { width: `${pct}%` } : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: 0.35, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </motion.div>
    </motion.aside>
  )
}
