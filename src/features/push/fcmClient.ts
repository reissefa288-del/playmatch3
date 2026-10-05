import { getFirebaseApp, isFirebaseConfigured } from '../auth/firebaseApp'
import { detectFcmPlatform, removeFcmToken, saveFcmToken } from './fcmTokenStore'
import { isPushConfigured } from './pushConfig'

let activeToken: string | null = null
let activeUid: string | null = null

async function waitForServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null
  try {
    const existing = await navigator.serviceWorker.getRegistration('/')
    if (existing?.active) return existing
    return await navigator.serviceWorker.ready
  } catch {
    return null
  }
}

async function getMessagingInstance() {
  const { isSupported, getMessaging } = await import('firebase/messaging')
  if (!(await isSupported())) return null

  const app = getFirebaseApp()
  if (!app) return null

  const registration = await waitForServiceWorker()
  if (!registration) return null

  return getMessaging(app)
}

export type PushPermissionState = NotificationPermission | 'unsupported'

export function getPushPermissionState(): PushPermissionState {
  if (typeof Notification === 'undefined') return 'unsupported'
  return Notification.permission
}

/** ADIM 9.1 — izin iste + FCM token al ve Firestore'a yaz */
export async function requestPushPermissionAndRegister(uid: string): Promise<boolean> {
  if (!isFirebaseConfigured() || !isPushConfigured()) return false
  if (typeof Notification === 'undefined') return false

  const permission = Notification.permission === 'default'
    ? await Notification.requestPermission()
    : Notification.permission

  if (permission !== 'granted') return false
  return syncPushToken(uid)
}

export async function syncPushToken(uid: string): Promise<boolean> {
  if (!isFirebaseConfigured() || !isPushConfigured()) return false
  if (getPushPermissionState() !== 'granted') return false

  const messaging = await getMessagingInstance()
  if (!messaging) return false

  const { getToken } = await import('firebase/messaging')
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string
  const token = await getToken(messaging, { vapidKey })
  if (!token) return false

  if (activeUid && activeUid !== uid && activeToken) {
    await removeFcmToken(activeUid, activeToken)
  }

  await saveFcmToken(uid, token, detectFcmPlatform())
  activeToken = token
  activeUid = uid
  return true
}

export async function unregisterPushToken(uid: string): Promise<void> {
  if (!activeToken) return

  try {
    const messaging = await getMessagingInstance()
    if (messaging) {
      const { deleteToken } = await import('firebase/messaging')
      await deleteToken(messaging)
    }
  } catch {
    /* token may already be invalid */
  }

  await removeFcmToken(uid, activeToken)
  activeToken = null
  activeUid = null
}

export async function subscribeForegroundPush(
  onPayload: (payload: { title: string; body: string; url?: string }) => void,
): Promise<(() => void) | null> {
  if (!isFirebaseConfigured() || !isPushConfigured()) return null

  const messaging = await getMessagingInstance()
  if (!messaging) return null

  const { onMessage } = await import('firebase/messaging')
  return onMessage(messaging, (payload) => {
    const title = payload.notification?.title ?? 'PlayMeet'
    const body = payload.notification?.body ?? ''
    const url = payload.data?.url
    onPayload({ title, body, url })
  })
}
