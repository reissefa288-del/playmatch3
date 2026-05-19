import type { HomeFilters, NearbyPlayer } from './types'

function parseDistanceKm(distance: string): number {
  const match = distance.match(/([\d,.]+)\s*km/i)
  if (!match) return 999
  return Number.parseFloat(match[1].replace(',', '.'))
}

export function filterNearbyPlayers(players: NearbyPlayer[], filters: HomeFilters) {
  return players.filter((player) => {
    if (filters.onlineOnly && !player.isOnline) return false
    if (player.gender && filters.gender !== 'all' && player.gender !== filters.gender) return false
    if (parseDistanceKm(player.distance) > filters.maxDistanceKm) return false
    return true
  })
}
