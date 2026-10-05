import { fakePortraitForGender } from '../../shared/fakePortraits'
import type { FirestoreUserDocument } from '../profile/types'
import { inferUserGender } from '../profile/userGender'
import type { MatchProfile } from './data'

function compatibilityScore(uid: string): number {
  let hash = 0
  for (let i = 0; i < uid.length; i += 1) {
    hash = (hash * 31 + uid.charCodeAt(i)) % 97
  }
  return 72 + (hash % 23)
}

function styleTags(interests: string[]): MatchProfile['tags'] {
  const tags: MatchProfile['tags'] = []
  if (interests[0]) {
    tags.push({ id: 'i0', label: interests[0], icon: 'gamepad' })
  }
  if (interests[1]) {
    tags.push({ id: 'i1', label: interests[1], icon: 'target' })
  }
  tags.push({ id: 'rank', label: 'Seviye', icon: 'trophy' })
  return tags.slice(0, 3)
}

function gameChips(interests: string[]): MatchProfile['favoriteGames'] {
  const chips = interests.slice(0, 3).map((label, index) => ({
    id: `g-${index}`,
    label,
    emoji: '🎮',
  }))
  if (chips.length === 0) {
    chips.push({ id: 'play', label: 'PlayMeet', emoji: '🎮' })
  }
  return chips
}

export function mapFirestoreUserToMatchProfile(doc: FirestoreUserDocument): MatchProfile {
  const gender = doc.gender ?? inferUserGender(doc.matchPreference)
  const portrait =
    doc.photoUrl ||
    doc.photoUrls?.find((url) => url.trim().length > 0) ||
    fakePortraitForGender(gender)

  const photoUrls = doc.photoUrls?.filter((url) => url.trim().length > 0) ?? []
  const photos =
    photoUrls.length > 0
      ? photoUrls.map((src, index) => ({
          id: `${doc.uid}-${index + 1}`,
          src,
          objectPosition: '50% 20%',
        }))
      : [{ id: `${doc.uid}-1`, src: portrait, objectPosition: '50% 20%' }]

  const city = doc.city?.trim()
  const locationLabel = city ? `${city}, Türkiye` : 'Türkiye'

  return {
    id: doc.uid,
    name: doc.name.trim() || 'Oyuncu',
    age: doc.age,
    gender,
    portraitSrc: portrait,
    verified: false,
    online: true,
    compatibility: compatibilityScore(doc.uid),
    province: city ?? 'Türkiye',
    distance: doc.locationSharingEnabled ? 'Yakında' : '—',
    location: locationLabel,
    tags: styleTags(doc.interests),
    favoriteGames: gameChips(doc.interests),
    bio: doc.bio.trim() || 'Oyun oynayarak tanışmayı seviyorum.',
    photos,
  }
}
