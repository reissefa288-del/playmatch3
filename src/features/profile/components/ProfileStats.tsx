import type { ProfileStat } from '../data'

type ProfileStatsProps = {
  stats: ProfileStat[]
}

export function ProfileStats({ stats }: ProfileStatsProps) {

  return (
    <section className="pm-profile-stats" aria-label="İstatistikler">
      {stats.map((stat) => (
        <article
          key={stat.id}
          className="pm-profile-stat"
         
         
         
         
        >
          <strong>{stat.value}</strong>
          <span>{stat.label}</span>
        </article>
      ))}
    </section>
  )
}
