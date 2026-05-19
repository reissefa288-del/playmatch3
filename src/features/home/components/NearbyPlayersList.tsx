import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import type { NearbyPlayer } from '../types'
import { NearbyPlayerListCard } from './NearbyPlayerListCard'

type NearbyPlayersListProps = {
  players: NearbyPlayer[]
  portraitImage: string
  layout?: 'grid' | 'list'
}

export function NearbyPlayersList({
  players,
  portraitImage,
  layout = 'list',
}: NearbyPlayersListProps) {
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const visible = players.filter((p) => !hidden.has(p.id))

  return (
    <ul className={`pm-nearby-players-list${layout === 'grid' ? ' is-grid' : ''}`}>
      <AnimatePresence mode="popLayout">
        {visible.map((player, index) => (
          <li key={player.id}>
            <NearbyPlayerListCard
              player={player}
              portraitImage={portraitImage}
              index={index}
              onDismissed={() => setHidden((prev) => new Set(prev).add(player.id))}
            />
          </li>
        ))}
      </AnimatePresence>
    </ul>
  )
}
