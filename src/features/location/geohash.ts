const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz'

/** ADIM 10.2 — geohash encode (base32) */
export function encodeGeohash(latitude: number, longitude: number, precision = 6): string {
  let latMin = -90
  let latMax = 90
  let lonMin = -180
  let lonMax = 180
  let hash = ''
  let bit = 0
  let ch = 0
  let isLon = true

  while (hash.length < precision) {
    if (isLon) {
      const mid = (lonMin + lonMax) / 2
      if (longitude >= mid) {
        ch = (ch << 1) + 1
        lonMin = mid
      } else {
        ch <<= 1
        lonMax = mid
      }
    } else {
      const mid = (latMin + latMax) / 2
      if (latitude >= mid) {
        ch = (ch << 1) + 1
        latMin = mid
      } else {
        ch <<= 1
        latMax = mid
      }
    }

    isLon = !isLon
    bit += 1
    if (bit === 5) {
      hash += BASE32[ch]!
      bit = 0
      ch = 0
    }
  }

  return hash
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function geohashPrefixForRadius(radiusKm: number): number {
  if (radiusKm <= 1.2) return 7
  if (radiusKm <= 5) return 6
  if (radiusKm <= 20) return 5
  return 4
}

export function geohashRange(prefix: string): { start: string; end: string } {
  return { start: prefix, end: `${prefix}\uf8ff` }
}

export function formatDistanceKm(km: number): string {
  if (km < 1) return `${Math.max(100, Math.round(km * 1000))} m`
  if (km < 10) return `${km.toFixed(1)} km`
  return `${Math.round(km)} km`
}
