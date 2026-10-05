import type { MatchPreference } from '../onboarding/onboardingProfile'
import type { UserGender } from './userGender'
import type { UserGeoPoint } from '../location/locationTypes'

export type LegalConsentRecord = {
  termsVersion: string
  privacyVersion: string
  acceptedAt: number
}

export type PremiumEntitlement = {
  active: boolean
  productId: string | null
  expiresAt: number | null
  source: 'play' | 'stub' | null
  updatedAt: number
}

/** Client-side profile shape (UI + onboarding). */
export type UserProfile = {
  name: string
  age: number
  gender: UserGender
  matchPreference: MatchPreference
  photoUrl: string
  photoUrls: string[]
  interests: string[]
  bio: string
  email: string
  onboardingCompleted: boolean
  completedAt: number | null
}

/** Firestore `users/{uid}` document. */
export type FirestoreUserDocument = {
  uid: string
  email: string
  name: string
  age: number
  gender: UserGender
  matchPreference: MatchPreference
  photoUrl: string
  photoUrls: string[]
  interests: string[]
  bio: string
  onboardingCompleted: boolean
  completedAt: number | null
  createdAt: number
  updatedAt: number
  city?: string
  locationSharingEnabled?: boolean
  locationConsentAt?: number | null
  geo?: UserGeoPoint | null
  geohash?: string | null
  locationUpdatedAt?: number | null
  legalConsent?: LegalConsentRecord
  premium?: PremiumEntitlement
}
