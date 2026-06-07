import '../../styles/1942-duel.css'
import { Suspense } from 'react'
import { lazyNamed } from '../../shared/lazyNamed'
import { GameRouteFallback } from './components/GameRouteFallback'

const Game1942DuelPlay = lazyNamed(() => import('./Game1942DuelPlay'), 'Game1942DuelPlay')

export function Game1942DuelScreen() {
  return (
    <Suspense fallback={<GameRouteFallback />}>
      <Game1942DuelPlay />
    </Suspense>
  )
}
