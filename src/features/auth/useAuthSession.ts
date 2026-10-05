import { useCallback, useSyncExternalStore } from 'react'
import type { User } from 'firebase/auth'
import {
  clearDevAuthSession,
  mapFirebaseUserToSession,
  readDevAuthSession,
  type AuthSession,
} from './authSession'
import { isFirebaseConfigured } from './firebaseApp'
import { isPreviewDevAuth, preferLocalDevPersistence, shouldDevAutoRegisteredHome } from './previewDevAuth'
import { handleGoogleRedirectResult, signOutFromFirebase, subscribeFirebaseAuth } from './firebaseAuth'
import { hydrateDailyLikesCache, resetDailyLikesCache } from '../likes/dailyLikesCache'
import { notifyDailyLikesSyncChanged } from '../likes/dailyLikesSync'
import { refreshPremiumForUser } from '../premium/usePremiumSubscription'
import { refreshMatchConnections } from '../match/matchConnectionsStore'
import { refreshBlockedPartners } from '../moderation/blocksStore'
import { bindProfileToUid, clearUserProfileStore } from '../profile/userProfileStore'

type AuthStoreSnapshot = {
  session: AuthSession | null
  loading: boolean
}

let snapshot: AuthStoreSnapshot = {
  session: preferLocalDevPersistence() ? readDevAuthSession() : null,
  loading: isFirebaseConfigured() && !isPreviewDevAuth() && !shouldDevAutoRegisteredHome(),
}

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): AuthStoreSnapshot {
  return snapshot
}

function setSnapshot(next: AuthStoreSnapshot) {
  snapshot = next
  emit()
}

function applyAuthSession(session: AuthSession) {
  void bindProfileToUid(session.uid)
  void refreshBlockedPartners(session.uid)
  void refreshMatchConnections(session.uid)
  void hydrateDailyLikesCache(session.uid).then(() => notifyDailyLikesSyncChanged())
  void refreshPremiumForUser(session.uid)
  setSnapshot({ session, loading: false })
}

/** Firebase olmadan yerel dev — Google overlay sonrası oturumu bağla. */
export function adoptDevAuthSession(session: AuthSession) {
  if (!preferLocalDevPersistence()) return
  applyAuthSession(session)
}

function applyFirebaseUser(user: User | null) {
  if (user) {
    applyAuthSession(mapFirebaseUserToSession(user))
    return
  }

  clearUserProfileStore()
  resetDailyLikesCache()
  void refreshPremiumForUser(null)
  void refreshBlockedPartners(null)
  void refreshMatchConnections(null)
  const devSession = readDevAuthSession()
  setSnapshot({
    session: devSession,
    loading: false,
  })
  if (devSession) {
    void bindProfileToUid(devSession.uid)
  }
}

let unsubscribeFirebase: (() => void) | null = null

function ensureAuthSubscription() {
  if (unsubscribeFirebase) return

  if (preferLocalDevPersistence()) {
    const devSession = readDevAuthSession()
    setSnapshot({
      session: devSession,
      loading: false,
    })
    if (devSession) {
      void bindProfileToUid(devSession.uid)
    }
    return
  }

  unsubscribeFirebase = subscribeFirebaseAuth((user) => {
    applyFirebaseUser(user)
  })

  void handleGoogleRedirectResult()
    .then((user) => {
      if (user) applyFirebaseUser(user)
    })
    .catch(() => {
      /* onAuthStateChanged reflects signed-out state */
    })
}

ensureAuthSubscription()

export function useAuthSession() {
  const { session, loading } = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const signOut = useCallback(async () => {
    if (isFirebaseConfigured()) {
      await signOutFromFirebase()
    }
    clearDevAuthSession()
    clearUserProfileStore()
    resetDailyLikesCache()
    void refreshPremiumForUser(null)
    void refreshMatchConnections(null)
    notifyDailyLikesSyncChanged()
    if (preferLocalDevPersistence()) {
      setSnapshot({ session: null, loading: false })
    }
  }, [])

  return {
    session,
    isAuthenticated: session != null,
    isAuthLoading: loading,
    signOut,
  }
}
