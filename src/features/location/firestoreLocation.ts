import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { getFirestoreDb, isFirebaseConfigured } from '../auth/firebaseApp'
import type { NearbyPlayer } from '../home/types'
import { fakePortraitForGender } from '../../shared/fakePortraits'
import type { FirestoreUserDocument } from '../profile/types'
import { patchFirestoreUserProfile } from '../profile/firestoreUserProfile'
import { inferUserGender } from '../profile/userGender'
import { fetchBlockedPartnerUids } from '../moderation/firestoreModeration'
import {
  encodeGeohash,
  formatDistanceKm,
  geohashPrefixForRadius,
  geohashRange,
  haversineKm,
} from './geohash'
import type { UserGeoPoint } from './locationTypes'

const USERS = 'users'

function mapToNearbyPlayer(
  doc: FirestoreUserDocument,
  distanceKm: number,
): NearbyPlayer {
  const gender = doc.gender ?? inferUserGender(doc.matchPreference)
  const portraitSrc =
    doc.photoUrl?.trim() ||
    doc.photoUrls?.find((url) => url.trim().length > 0) ||
    fakePortraitForGender(gender)

  return {
    id: doc.uid,
    name: doc.name.trim() || 'Oyuncu',
    age: doc.age,
    level: 1 + (doc.uid.charCodeAt(0) % 40),
    interests: doc.interests.slice(0, 3),
    distance: formatDistanceKm(distanceKm),
    gender,
    isOnline: true,
    portraitSrc,
    portraitPosition: '50% 20%',
    recentActivity: doc.interests[0] ? `Son: ${doc.interests[0]}` : undefined,
  }
}

export async function saveUserLocation(
  uid: string,
  coords: UserGeoPoint,
  city?: string,
): Promise<void> {
  const geohash = encodeGeohash(coords.latitude, coords.longitude, 6)
  await patchFirestoreUserProfile(uid, {
    city: city?.trim() || undefined,
    locationSharingEnabled: true,
    locationConsentAt: Date.now(),
    geo: coords,
    geohash,
    locationUpdatedAt: Date.now(),
  })
}

export async function disableUserLocationSharing(uid: string): Promise<void> {
  await patchFirestoreUserProfile(uid, {
    locationSharingEnabled: false,
    geo: null,
    geohash: null,
    locationUpdatedAt: Date.now(),
  })
}

/** ADIM 10.2 — geohash prefix sorgusu + mesafe filtresi */
export async function fetchNearbyFirestoreUsers(
  viewerUid: string,
  coords: UserGeoPoint,
  radiusKm: number,
  maxResults = 24,
): Promise<NearbyPlayer[]> {
  const db = getFirestoreDb()
  if (!db || !isFirebaseConfigured()) return []

  const prefix = encodeGeohash(coords.latitude, coords.longitude, geohashPrefixForRadius(radiusKm))
  const range = geohashRange(prefix)
  const blocked = await fetchBlockedPartnerUids(viewerUid)

  const snap = await getDocs(
    query(
      collection(db, USERS),
      where('onboardingCompleted', '==', true),
      where('locationSharingEnabled', '==', true),
      where('geohash', '>=', range.start),
      where('geohash', '<=', range.end),
      orderBy('geohash'),
      limit(60),
    ),
  )

  const players: Array<{ player: NearbyPlayer; km: number }> = []
  for (const entry of snap.docs) {
    const data = entry.data() as FirestoreUserDocument
    const uid = data.uid ?? entry.id
    if (uid === viewerUid || blocked.has(uid)) continue
    const geo = data.geo
    if (!geo?.latitude || !geo?.longitude) continue

    const distanceKm = haversineKm(coords.latitude, coords.longitude, geo.latitude, geo.longitude)
    if (distanceKm > radiusKm) continue

    players.push({
      player: mapToNearbyPlayer({ ...data, uid }, distanceKm),
      km: distanceKm,
    })
  }

  return players
    .sort((a, b) => a.km - b.km)
    .map((entry) => entry.player)
    .slice(0, maxResults)
}

export function requestDeviceLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Cihaz konum servisi desteklenmiyor.'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 12_000,
      maximumAge: 60_000,
    })
  })
}

export function portraitForNearby(player: NearbyPlayer): string {
  if (player.gender) return fakePortraitForGender(player.gender)
  return fakePortraitForGender('female')
}
