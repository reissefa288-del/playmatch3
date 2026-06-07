import { useMemo } from 'react'
import type { NearbyPlayer } from '../types'
import { isNearbyPlayerLiked, useNearbyLikesRevision } from '../useNearbyLikes'
import { NearbyPlayerListCard } from './NearbyPlayerListCard'

type NearbyPlayersListProps = {
  players: NearbyPlayer[]
  layout?: 'grid' | 'list'
}

export function NearbyPlayersList({ players, layout = 'list' }: NearbyPlayersListProps) {
  const likesRevision = useNearbyLikesRevision()

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      const aLiked = isNearbyPlayerLiked(a.id) ? 1 : 0
      const bLiked = isNearbyPlayerLiked(b.id) ? 1 : 0
      return bLiked - aLiked
    })
  }, [players, likesRevision])

  return (
    <ul className={`pm-nearby-players-list${layout === 'grid' ? ' is-grid' : ''}`}>
      {sortedPlayers.map((player, index) => (
        <li key={player.id}>
          <NearbyPlayerListCard player={player} index={index} />
        </li>
      ))}
    </ul>
  )
}
