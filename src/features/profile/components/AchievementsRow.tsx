import type { ProfileAchievement } from '../data'

type AchievementsRowProps = {
  achievements: ProfileAchievement[]
  moreCount: number
}

export function AchievementsRow({ achievements, moreCount }: AchievementsRowProps) {

  return (
    <section className="pm-profile-section" aria-label="Başarımlar">
      <header className="pm-profile-section__head">
        <h2>Başarımlar</h2>
      </header>
      <div className="pm-profile-achievements">
        {achievements.map((badge) => (
          <button
            key={badge.id}
            type="button"
            className={`pm-profile-badge is-${badge.accent}`}
           
           
           
           
           
            aria-label={badge.label}
          >
            <span className="pm-profile-badge__ring" aria-hidden />
            <badge.icon aria-hidden />
          </button>
        ))}
        <span
          className="pm-profile-badge-more"
         
         
         
        >
          +{moreCount}
        </span>
      </div>
    </section>
  )
}
