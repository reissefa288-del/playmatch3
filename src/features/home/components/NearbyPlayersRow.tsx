import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import type { NearbyPlayer } from '../types'
import { NearbyPlayerCard } from './NearbyPlayerCard'

type NearbyPlayersRowProps = {
  players: NearbyPlayer[]
  portraitImage: string
}

export function NearbyPlayersRow({ players, portraitImage }: NearbyPlayersRowProps) {
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const visible = players.filter((p) => !hidden.has(p.id))

  return (
    <div className="pm-nearby-list__scroll">
      <AnimatePresence mode="popLayout">
        {visible.map((player) => (
          <NearbyPlayerCard
            key={player.id}
            player={player}
            portraitImage={portraitImage}
            onDismissed={() => setHidden((prev) => new Set(prev).add(player.id))}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
