import { useState } from 'react'
import { useRafIntervalWhenActive } from '../../../shared/useRafIntervalWhenActive'
import { useRuntimeActive } from '../../../shared/useRuntimeActive'
import { GamesHeroStats } from './GamesHeroStats'

/** P6 — live hero stats deferred to body (keeps games-shell parse/eval minimal) */
export function GamesHeroStatsLive() {
  const visible = useRuntimeActive('games')
  const [onlineCount, setOnlineCount] = useState(3842)
  const [activeMatches, setActiveMatches] = useState(42)

  useRafIntervalWhenActive(visible, () => {
    setOnlineCount((current) => clamp(current + randomInt(-38, 56), 3600, 4300))
    setActiveMatches((current) => clamp(current + randomInt(-2, 3), 34, 62))
  }, 2300)

  return (
    <div className="pm-games-hero-block">
      <GamesHeroStats onlineCount={onlineCount} activeMatches={activeMatches} />
    </div>
  )
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}
