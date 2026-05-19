import type { CSSProperties } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ProfileActivity } from '../data'

type RecentActivityListProps = {
  activities: ProfileActivity[]
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
  const reduceMotion = useReducedMotion()

  return (
    <section className="pm-profile-section pm-profile-activity-section" aria-label="Son aktiviteler">
      <header className="pm-profile-section__head">
        <h2>Son Aktiviteler</h2>
      </header>
      <ul className="pm-profile-activity-list">
        {activities.map((item, index) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.06, duration: 0.38 }}
          >
            <motion.button
              type="button"
              className="pm-profile-activity"
              style={{ '--pm-profile-art-pos': item.artPosition } as CSSProperties}
              whileHover={reduceMotion ? undefined : { x: 2 }}
            >
              <span className="pm-profile-activity__icon" aria-hidden />
              <span className="pm-profile-activity__text">{item.text}</span>
              <time className="pm-profile-activity__time">{item.time}</time>
            </motion.button>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
