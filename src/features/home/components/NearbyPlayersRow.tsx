import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import type { NearbyPlayer } from '../types'
import { NearbyPlayerCard } from './NearbyPlayerCard'

type NearbyPlayersRowProps = {
  players: NearbyPlayer[]
}

export function NearbyPlayersRow({ players }: NearbyPlayersRowProps) {
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const visible = players.filter((p) => !hidden.has(p.id))

  return (
    <div className="pm-nearby-list__scroll">
      <AnimatePresence mode="popLayout">
        {visible.map((player) => (
          <NearbyPlayerCard
            key={player.id}
            player={player}
            onDismissed={() => setHidden((prev) => new Set(prev).add(player.id))}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
