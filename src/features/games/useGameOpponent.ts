import { useMemo } from 'react'
import { FAKE_PORTRAIT_FEMALE } from '../../shared/fakePortraits'
import { readQuickMatchSession } from './quickMatch'

export type GameOpponent = {
  id: string
  name: string
  portrait: string
}

const DEFAULT_OPPONENT: GameOpponent = {
  id: 'zeynep',
  name: 'Zeynep',
  portrait: FAKE_PORTRAIT_FEMALE,
}

export function useGameOpponent(): GameOpponent {
  return useMemo(() => {
    const session = readQuickMatchSession()
    if (session) {
      return {
        id: session.opponent.id,
        name: session.opponent.name,
        portrait: session.opponent.portraitSrc,
      }
    }
    return DEFAULT_OPPONENT
  }, [])
}

export function useOpponentLikeProps() {
  const opponent = useGameOpponent()
  return {
    opponent,
    likeProps: {
      enableLike: true as const,
      likePlayerId: opponent.id,
      likePlayerName: opponent.name,
    },
  }
}
