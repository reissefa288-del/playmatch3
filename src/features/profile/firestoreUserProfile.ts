import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { getFirestoreDb, isFirebaseConfigured } from '../auth/firebaseApp'
import { createEmptyProfile } from '../onboarding/onboardingProfile'
import type { FirestoreUserDocument, UserProfile } from './types'
import { inferUserGender } from './userGender'
import { normalizePhotoUrls } from './profilePhotoStorage'

const USERS_COLLECTION = 'users'

export function toUserProfile(docData: FirestoreUserDocument): UserProfile {
  const photoUrls = normalizePhotoUrls(docData.photoUrl, docData.photoUrls)
  return {
    name: docData.name ?? '',
    age: docData.age ?? 18,
    gender: docData.gender ?? inferUserGender(docData.matchPreference ?? 'female'),
    matchPreference: docData.matchPreference ?? 'female',
    photoUrl: docData.photoUrl || photoUrls[0] || '',
    photoUrls,
    interests: docData.interests ?? [],
    bio: docData.bio ?? '',
    email: docData.email ?? '',
    onboardingCompleted: docData.onboardingCompleted === true,
    completedAt: docData.completedAt ?? null,
  }
}

export function toFirestoreDocument(uid: string, profile: UserProfile): FirestoreUserDocument {
  const now = Date.now()
  const photoUrls = normalizePhotoUrls(profile.photoUrl, profile.photoUrls)
  const primaryPhoto = photoUrls[0] || profile.photoUrl

  return {
    uid,
    email: profile.email,
    name: profile.name,
    age: profile.age,
    gender: profile.gender ?? inferUserGender(profile.matchPreference),
    matchPreference: profile.matchPreference,
    photoUrl: primaryPhoto,
    photoUrls,
    interests: profile.interests,
    bio: profile.bio,
    onboardingCompleted: profile.onboardingCompleted,
    completedAt: profile.completedAt,
    createdAt: now,
    updatedAt: now,
  }
}

export async function fetchFirestoreUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getFirestoreDb()
  if (!db || !isFirebaseConfigured()) return null

  const snap = await getDoc(doc(db, USERS_COLLECTION, uid))
  if (!snap.exists()) return null

  const data = snap.data() as FirestoreUserDocument
  return toUserProfile({ ...data, uid })
}

export async function saveFirestoreUserProfile(uid: string, profile: UserProfile): Promise<void> {
  const db = getFirestoreDb()
  if (!db || !isFirebaseConfigured()) {
    throw new Error('Firestore yapılandırması eksik.')
  }

  const ref = doc(db, USERS_COLLECTION, uid)
  const existing = await getDoc(ref)
  const now = Date.now()
  const next = toFirestoreDocument(uid, profile)

  if (existing.exists()) {
    const prev = existing.data() as FirestoreUserDocument
    await updateDoc(ref, {
      ...next,
      createdAt: prev.createdAt ?? now,
      updatedAt: now,
    })
    return
  }

  await setDoc(ref, next)
}

export async function patchFirestoreUserProfile(
  uid: string,
  patch: Partial<
    Pick<
      FirestoreUserDocument,
      | 'photoUrl'
      | 'photoUrls'
      | 'onboardingCompleted'
      | 'completedAt'
      | 'name'
      | 'bio'
      | 'interests'
      | 'age'
      | 'matchPreference'
      | 'city'
      | 'locationSharingEnabled'
      | 'locationConsentAt'
      | 'geo'
      | 'geohash'
      | 'locationUpdatedAt'
      | 'legalConsent'
      | 'premium'
    >
  >,
): Promise<void> {
  const db = getFirestoreDb()
  if (!db || !isFirebaseConfigured()) {
    throw new Error('Firestore yapılandırması eksik.')
  }

  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    ...patch,
    updatedAt: Date.now(),
  })
}

export function createProfileFromAuth(email: string, displayName: string, avatarUrl: string): UserProfile {
  return {
    ...createEmptyProfile(),
    email,
    name: displayName,
    photoUrl: avatarUrl,
    photoUrls: avatarUrl ? [avatarUrl, '', ''] : ['', '', ''],
  }
}
