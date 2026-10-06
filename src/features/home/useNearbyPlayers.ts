import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuthSession } from '../auth/useAuthSession'
import { GAME_TEST_BOT_ID, GAME_TEST_BOT_NAME, resolveTestBotOpponentGender, shouldUseGameTestBot } from '../games/gameTestBot'
import { fetchNearbyFirestoreUsers } from '../location/firestoreLocation'
import { useLocationSharing } from '../location/useLocationSharing'
import { fakePortraitForGender } from '../../shared/fakePortraits'
import { filterNearbyPlayers } from './filterDiscovery'
import type { HomeFilters, NearbyPlayer } from './types'

/** Geçici — yakındaki oyuncular denemesi. Kaldırılacak. */
function nearbyTestBot(): NearbyPlayer {
  const gender = resolveTestBotOpponentGender()
  return {
    id: GAME_TEST_BOT_ID,
    name: GAME_TEST_BOT_NAME,
    age: 22,
    level: 3,
    interests: ['Oyun', 'Sohbet'],
    distance: '1 km',
    gender,
    isOnline: true,
    portraitSrc: fakePortraitForGender(gender),
    portraitPosition: '50% 12%',
    recentActivity: 'Test bot',
  }
}

export function useNearbyPlayers(filters: HomeFilters) {
  const { session } = useAuthSession()
  const uid = session?.uid ?? null
  const location = useLocationSharing()
  const [realPlayers, setRealPlayers] = useState<NearbyPlayer[]>([])
  const [loading, setLoading] = useState(false)

  const hasRealLocation = location.sharingEnabled && location.coords != null

  const reload = useCallback(async () => {
    if (!uid || !location.coords || !location.sharingEnabled) {
      setRealPlayers([])
      return
    }
    setLoading(true)
    try {
      const players = await fetchNearbyFirestoreUsers(
        uid,
        location.coords,
        filters.maxDistanceKm,
      )
      setRealPlayers(players)
    } finally {
      setLoading(false)
    }
  }, [filters.maxDistanceKm, location.coords, location.sharingEnabled, uid])

  useEffect(() => {
    void reload()
  }, [reload])

  const testBot = useMemo(() => nearbyTestBot(), [])

  const players = useMemo(() => {
    const filtered = filterNearbyPlayers(realPlayers, filters).filter((player) => player.id !== GAME_TEST_BOT_ID)
    return shouldUseGameTestBot() ? [testBot, ...filtered] : filtered
  }, [filters, realPlayers, testBot])

  return {
    players,
    needsLocation: !hasRealLocation,
    loading: loading || location.loading,
    location,
  }
}
