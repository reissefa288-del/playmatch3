import { AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'
import type { NearbyPlayer } from '../types'
import { useNearbyLikes } from '../useNearbyLikes'
import { NearbyPlayerListCard } from './NearbyPlayerListCard'

type NearbyPlayersListProps = {
  players: NearbyPlayer[]
  layout?: 'grid' | 'list'
}

export function NearbyPlayersList({ players, layout = 'list' }: NearbyPlayersListProps) {
  const { hasLiked } = useNearbyLikes()

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      const aLiked = hasLiked(a.id) ? 1 : 0
      const bLiked = hasLiked(b.id) ? 1 : 0
      return bLiked - aLiked
    })
  }, [players, hasLiked])

  return (
    <ul className={`pm-nearby-players-list${layout === 'grid' ? ' is-grid' : ''}`}>
      <AnimatePresence mode="popLayout">
        {sortedPlayers.map((player, index) => (
          <li key={player.id}>
            <NearbyPlayerListCard player={player} index={index} />
          </li>
        ))}
      </AnimatePresence>
    </ul>
  )
}
