import { memo } from 'react'
import { gamesHeroStats } from '../gamesHeroStats'

type GamesHeroStatsProps = {
  onlineCount: number
  activeMatches: number
}

function formatTrNumber(value: number) {
  return value.toLocaleString('tr-TR')
}

export const GamesHeroStats = memo(function GamesHeroStats({
  onlineCount,
  activeMatches,
}: GamesHeroStatsProps) {
  return (
    <div className="pm-games-hero__stats pm-games-hero__stats--below">
      {gamesHeroStats.map((stat) => (
        <span key={stat.id} className={`pm-games-hero__stat-pill is-${stat.id}`}>
          <stat.icon aria-hidden />
          <span>
            {stat.id === 'online'
              ? `${formatTrNumber(onlineCount)} oyuncu çevrimiçi`
              : `${activeMatches} aktif maç`}
          </span>
        </span>
      ))}
    </div>
  )
})
