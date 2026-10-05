import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuthSession } from '../auth/useAuthSession'
import { fetchNearbyFirestoreUsers } from '../location/firestoreLocation'
import { useLocationSharing } from '../location/useLocationSharing'
import { filterNearbyPlayers } from './filterDiscovery'
import type { HomeFilters } from './types'
import type { NearbyPlayer } from './types'

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

  const players = useMemo(
    () => filterNearbyPlayers(realPlayers, filters),
    [filters, realPlayers],
  )

  return {
    players,
    needsLocation: !hasRealLocation,
    loading: loading || location.loading,
    location,
  }
}
