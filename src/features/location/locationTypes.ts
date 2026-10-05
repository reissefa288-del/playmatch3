export type UserGeoPoint = {
  latitude: number
  longitude: number
}

export type UserLocationFields = {
  city?: string
  locationSharingEnabled?: boolean
  locationConsentAt?: number | null
  geo?: UserGeoPoint | null
  geohash?: string | null
  locationUpdatedAt?: number | null
}
