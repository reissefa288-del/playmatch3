import { getFirebaseAuth } from '../auth/firebaseApp'
import { isAppCheckConfigured } from '../auth/firebaseAppCheck'
import { preferLocalDevPersistence } from '../auth/previewDevAuth'
import { createEmptyProfile } from '../onboarding/onboardingProfile'
import { inferUserGender } from './userGender'
import {
  fetchFirestoreUserProfile,
  patchFirestoreUserProfile,
  saveFirestoreUserProfile,
} from './firestoreUserProfile'
import {
  normalizePhotoUrls,
  uploadProfilePhotoDataUrl,
  uploadProfilePhotoFile,
} from './profilePhotoStorage'
import type { UserProfile } from './types'

const DEV_SEED_STORAGE_KEY = 'pm-user-profile'

export type ProfileStoreSnapshot = {
  profile: UserProfile
  loading: boolean
  saving: boolean
  error: string | null
  uid: string | null
  source: 'firestore' | 'cache' | 'dev-seed' | 'empty'
}

let snapshot: ProfileStoreSnapshot = {
  profile: createEmptyProfile(),
  loading: false,
  saving: false,
  error: null,
  uid: null,
  source: 'empty',
}

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function setSnapshot(next: ProfileStoreSnapshot) {
  snapshot = next
  emit()
}

export function subscribeUserProfile(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getUserProfileSnapshot(): ProfileStoreSnapshot {
  return snapshot
}

function readDevSeedProfile(): UserProfile | null {
  if (!preferLocalDevPersistence()) return null
  try {
    const raw = localStorage.getItem(DEV_SEED_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as UserProfile
    return {
      ...createEmptyProfile(),
      ...parsed,
      gender: parsed.gender ?? inferUserGender(parsed.matchPreference ?? 'female'),
      photoUrls: normalizePhotoUrls(parsed.photoUrl ?? '', parsed.photoUrls),
    }
  } catch {
    return null
  }
}

function clearDevSeedProfile(): void {
  try {
    localStorage.removeItem(DEV_SEED_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

function persistDevSeedProfile(profile: UserProfile): void {
  try {
    const forStorage =
      profile.photoUrl.startsWith('data:') || profile.photoUrls.some((u) => u.startsWith('data:'))
        ? {
            ...profile,
            photoUrl: profile.photoUrl.startsWith('data:') ? '' : profile.photoUrl,
            photoUrls: profile.photoUrls.map((u) => (u.startsWith('data:') ? '' : u)),
          }
        : profile
    localStorage.setItem(DEV_SEED_STORAGE_KEY, JSON.stringify(forStorage))
  } catch {
    /* ignore */
  }
}

function resolveAuthEmail(fallback: string): string {
  const authEmail = getFirebaseAuth()?.currentUser?.email?.trim()
  return authEmail || fallback.trim()
}

function describeProfileSaveError(error: unknown): string {
  const code =
    typeof error === 'object' && error != null && 'code' in error
      ? String((error as { code: string }).code)
      : ''
  if (code === 'permission-denied' || code === 'storage/unauthorized') {
    if (!isAppCheckConfigured()) {
      return 'Firebase App Check eksik. .env içine VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY ve (local için) VITE_FIREBASE_APPCHECK_DEBUG_TOKEN ekle — docs/release/ADIM_3_3_APPCHECK.md'
    }
    return 'Firestore/Storage izni reddedildi. App Check debug token veya Console ayarlarını kontrol et.'
  }
  if (code === 'storage/unauthenticated' || code === 'unauthenticated') {
    return 'Oturum süresi dolmuş olabilir. Çıkış yapıp tekrar Google ile giriş yap.'
  }
  if (code.startsWith('storage/')) {
    return 'Profil fotoğrafı yüklenemedi (Storage). Blaze plan ve storage rules gerekli; profil fotoğrafsız kaydedilebilir — tekrar dene.'
  }
  return 'Profil kaydedilemedi. İnternet bağlantını kontrol edip tekrar dene.'
}

let loadGeneration = 0

/** Cursor önizleme — onboarding atlanmış demo profil (yalnızca DEV + localStorage). */
export function seedDevPreviewCompleteProfile(uid: string, email: string): void {
  if (!preferLocalDevPersistence()) return

  const profile: UserProfile = {
    ...createEmptyProfile(),
    name: 'Dev Önizleme',
    age: 24,
    email,
    matchPreference: 'both',
    interests: ['Gamer', 'Müzik', 'Film', 'Sohbet'],
    bio: 'Cursor preview geliştirme oturumu',
    onboardingCompleted: true,
    completedAt: Date.now(),
  }
  persistDevSeedProfile(profile)
  setSnapshot({
    profile,
    loading: false,
    saving: false,
    error: null,
    uid,
    source: 'dev-seed',
  })
}

export async function bindProfileToUid(uid: string | null): Promise<void> {
  const generation = ++loadGeneration

  if (!uid) {
    setSnapshot({
      profile: createEmptyProfile(),
      loading: false,
      saving: false,
      error: null,
      uid: null,
      source: 'empty',
    })
    return
  }

  setSnapshot({
    ...snapshot,
    loading: true,
    error: null,
    uid,
  })

  if (preferLocalDevPersistence()) {
    const devProfile = readDevSeedProfile()
    if (generation !== loadGeneration) return
    setSnapshot({
      profile: devProfile ?? createEmptyProfile(),
      loading: false,
      saving: false,
      error: devProfile ? null : 'Firebase yapılandırması eksik.',
      uid,
      source: devProfile ? 'dev-seed' : 'empty',
    })
    return
  }

  try {
    const remote = await fetchFirestoreUserProfile(uid)
    if (generation !== loadGeneration) return

    setSnapshot({
      profile: remote ?? createEmptyProfile(),
      loading: false,
      saving: false,
      error: null,
      uid,
      source: remote ? 'firestore' : 'empty',
    })
  } catch {
    if (generation !== loadGeneration) return
    const fallback = snapshot.uid === uid ? snapshot.profile : createEmptyProfile()
    setSnapshot({
      profile: fallback,
      loading: false,
      saving: false,
      error: 'Profil yüklenemedi. Önbellekteki veri gösteriliyor.',
      uid,
      source: snapshot.uid === uid ? 'cache' : 'empty',
    })
  }
}

async function resolvePhotoUrl(uid: string, photoUrl: string): Promise<string> {
  if (!photoUrl || !photoUrl.startsWith('data:')) return photoUrl
  return uploadProfilePhotoDataUrl(uid, 0, photoUrl)
}

export async function completeUserOnboarding(uid: string, draft: UserProfile): Promise<UserProfile> {
  setSnapshot({ ...snapshot, saving: true, error: null })

  try {
    let photoUrl = draft.photoUrl
    if (!preferLocalDevPersistence() && photoUrl.startsWith('data:')) {
      try {
        photoUrl = await resolvePhotoUrl(uid, photoUrl)
      } catch (uploadError) {
        console.warn('[PlayMeet] Profil fotoğrafı yüklenemedi, fotoğrafsız devam ediliyor.', uploadError)
        photoUrl = ''
      }
    }

    const photoUrls = normalizePhotoUrls(photoUrl, [photoUrl, '', ''])
    const next: UserProfile = {
      ...draft,
      email: resolveAuthEmail(draft.email),
      gender: draft.gender ?? inferUserGender(draft.matchPreference),
      photoUrl,
      photoUrls,
      onboardingCompleted: true,
      completedAt: Date.now(),
    }

    if (!preferLocalDevPersistence()) {
      try {
        await saveFirestoreUserProfile(uid, next)
      } catch (remoteError) {
        if (import.meta.env.DEV) {
          console.warn('[PlayMeet] Firestore kaydı başarısız — DEV yerel profil kullanılıyor.', remoteError)
          persistDevSeedProfile(next)
          setSnapshot({
            profile: next,
            loading: false,
            saving: false,
            error: null,
            uid,
            source: 'dev-seed',
          })
          return next
        }
        throw remoteError
      }
    } else {
      persistDevSeedProfile(next)
    }

    setSnapshot({
      profile: next,
      loading: false,
      saving: false,
      error: null,
      uid,
      source: preferLocalDevPersistence() ? 'cache' : 'firestore',
    })
    return next
  } catch (error) {
    const message = describeProfileSaveError(error)
    setSnapshot({
      ...snapshot,
      saving: false,
      error: message,
    })
    throw new Error('profile_save_failed')
  }
}

export async function saveUserProfileRemote(uid: string, profile: UserProfile): Promise<void> {
  setSnapshot({ ...snapshot, saving: true, error: null })
  try {
    if (!preferLocalDevPersistence()) {
      await saveFirestoreUserProfile(uid, profile)
    }
    setSnapshot({
      profile,
      loading: false,
      saving: false,
      error: null,
      uid,
      source: preferLocalDevPersistence() ? 'cache' : 'firestore',
    })
  } catch {
    setSnapshot({
      ...snapshot,
      saving: false,
      error: 'Profil güncellenemedi.',
    })
    throw new Error('profile_update_failed')
  }
}

export async function updateUserPhotoSlot(uid: string, slot: number, file: File): Promise<UserProfile> {
  setSnapshot({ ...snapshot, saving: true, error: null })

  try {
    const current = snapshot.profile
    let nextUrl = ''

    if (!preferLocalDevPersistence()) {
      nextUrl = await uploadProfilePhotoFile(uid, slot, file)
    } else {
      nextUrl = URL.createObjectURL(file)
    }

    const photoUrls = normalizePhotoUrls(current.photoUrl, current.photoUrls)
    photoUrls[slot] = nextUrl
    const photoUrl = slot === 0 ? nextUrl : photoUrls[0] || current.photoUrl

    const next: UserProfile = {
      ...current,
      photoUrl,
      photoUrls,
    }

    if (!preferLocalDevPersistence()) {
      await patchFirestoreUserProfile(uid, { photoUrl, photoUrls })
    }

    setSnapshot({
      profile: next,
      loading: false,
      saving: false,
      error: null,
      uid,
      source: preferLocalDevPersistence() ? 'cache' : 'firestore',
    })
    return next
  } catch {
    setSnapshot({
      ...snapshot,
      saving: false,
      error: 'Fotoğraf yüklenemedi. Lütfen tekrar dene.',
    })
    throw new Error('photo_upload_failed')
  }
}

export async function resetUserOnboarding(uid: string): Promise<void> {
  const next: UserProfile = {
    ...createEmptyProfile(),
    email: snapshot.profile.email,
  }

  if (!preferLocalDevPersistence()) {
    try {
      await patchFirestoreUserProfile(uid, {
        onboardingCompleted: false,
        completedAt: null,
        name: '',
        bio: '',
        interests: [],
        photoUrl: '',
        photoUrls: ['', '', ''],
      })
    } catch {
      setSnapshot({ ...snapshot, error: 'Profil sıfırlanamadı.' })
      throw new Error('profile_reset_failed')
    }
  } else {
    clearDevSeedProfile()
  }

  setSnapshot({
    profile: next,
    loading: false,
    saving: false,
    error: null,
    uid,
    source: preferLocalDevPersistence() ? 'empty' : 'firestore',
  })
}

export function clearUserProfileStore(): void {
  loadGeneration += 1
  clearDevSeedProfile()
  setSnapshot({
    profile: createEmptyProfile(),
    loading: false,
    saving: false,
    error: null,
    uid: null,
    source: 'empty',
  })
}

export function readCachedUserProfile(): UserProfile {
  return snapshot.profile
}

export function readIsOnboardingComplete(): boolean {
  return snapshot.profile.onboardingCompleted === true
}
