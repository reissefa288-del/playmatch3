import { motion, useReducedMotion } from 'framer-motion'
import type { ProfileStat } from '../data'

type ProfileStatsProps = {
  stats: ProfileStat[]
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  const reduceMotion = useReducedMotion()

  return (
    <section className="pm-profile-stats" aria-label="İstatistikler">
      {stats.map((stat, index) => (
        <motion.article
          key={stat.id}
          className="pm-profile-stat"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + index * 0.07, duration: 0.4 }}
          whileHover={reduceMotion ? undefined : { y: -4, scale: 1.02 }}
        >
          <strong>{stat.value}</strong>
          <span>{stat.label}</span>
        </motion.article>
      ))}
    </section>
  )
}
