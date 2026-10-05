import type { CSSProperties } from 'react'
import type { ProfileActivity } from '../data'

type RecentActivityListProps = {
  activities: ProfileActivity[]
}

export function RecentActivityList({ activities }: RecentActivityListProps) {

  return (
    <section className="pm-profile-section pm-profile-activity-section" aria-label="Son aktiviteler">
      <header className="pm-profile-section__head">
        <h2>Son Aktiviteler</h2>
      </header>
      <ul className="pm-profile-activity-list">
        {activities.map((item) => (
          <li
            key={item.id}
           
           
           
          >
            <button
              type="button"
              className="pm-profile-activity"
              style={{ '--pm-profile-art-pos': item.artPosition } as CSSProperties}
             
            >
              <span className="pm-profile-activity__icon" aria-hidden />
              <span className="pm-profile-activity__text">{item.text}</span>
              <time className="pm-profile-activity__time">{item.time}</time>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
