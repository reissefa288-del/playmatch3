import { getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  getAuth,
  initializeAuth,
  setPersistence,
  type Auth,
} from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'
import { initFirebaseAppCheck } from './firebaseAppCheck'

export { isAppCheckConfigured, getFirebaseAppCheck } from './firebaseAppCheck'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  )
}

let firebaseApp: FirebaseApp | null = null
let firebaseAuth: Auth | null = null
let persistenceReady: Promise<void> | null = null

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null
  if (!firebaseApp) {
    firebaseApp = getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig)
    initFirebaseAppCheck(firebaseApp)
  }
  return firebaseApp
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp()
  if (!app) return null
  if (!firebaseAuth) {
    try {
      firebaseAuth = initializeAuth(app, {
        persistence: browserLocalPersistence,
        popupRedirectResolver: browserPopupRedirectResolver,
      })
      persistenceReady = Promise.resolve()
    } catch {
      firebaseAuth = getAuth(app)
      persistenceReady = setPersistence(firebaseAuth, browserLocalPersistence).catch(() => undefined)
    }
  }
  return firebaseAuth
}

export function whenAuthPersistenceReady(): Promise<void> {
  void getFirebaseAuth()
  return persistenceReady ?? Promise.resolve()
}

let firestoreDb: Firestore | null = null
let firebaseStorage: FirebaseStorage | null = null

export function getFirestoreDb(): Firestore | null {
  const app = getFirebaseApp()
  if (!app) return null
  if (!firestoreDb) {
    firestoreDb = getFirestore(app)
  }
  return firestoreDb
}

export function getFirebaseStorage(): FirebaseStorage | null {
  const app = getFirebaseApp()
  if (!app) return null
  if (!firebaseStorage) {
    firebaseStorage = getStorage(app)
  }
  return firebaseStorage
}
