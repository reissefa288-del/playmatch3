import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthSession } from '../auth/useAuthSession'
import { isTwaOrStandalone } from '../auth/androidTwa'
import {
  getPushPermissionState,
  requestPushPermissionAndRegister,
  subscribeForegroundPush,
  syncPushToken,
  unregisterPushToken,
} from './fcmClient'
import { isPushConfigured, PUSH_SW_MESSAGE, type PushNavigateMessage } from './pushConfig'

/** ADIM 9.1 + 9.2 — FCM token sync, foreground push, SW deep-link bridge */
export function PushNotificationBridge() {
  const { session } = useAuthSession()
  const uid = session?.uid ?? null
  const navigate = useNavigate()
  const prompted = useRef(false)
  const lastUid = useRef<string | null>(null)

  useEffect(() => {
    const previousUid = lastUid.current
    if (previousUid && previousUid !== uid) {
      void unregisterPushToken(previousUid)
    }
    lastUid.current = uid

    if (!uid || !isPushConfigured()) return

    const permission = getPushPermissionState()
    if (permission === 'granted') {
      void syncPushToken(uid)
    } else if (permission === 'default' && !prompted.current) {
      prompted.current = true
      const delay = isTwaOrStandalone() ? 1500 : 4000
      const timer = window.setTimeout(() => {
        void requestPushPermissionAndRegister(uid)
      }, delay)
      return () => window.clearTimeout(timer)
    }
  }, [uid])

  useEffect(() => {
    if (!uid || !isPushConfigured()) return

    let unsubForeground: (() => void) | null = null
    void subscribeForegroundPush(({ title, body, url }) => {
      if (url) navigate(url)
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        void new Notification(title, { body, icon: '/icons/icon-192.png', data: { url } })
      }
    }).then((unsub) => {
      unsubForeground = unsub
    })

    return () => {
      unsubForeground?.()
    }
  }, [navigate, uid])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const handler = (event: MessageEvent<PushNavigateMessage>) => {
      if (event.data?.type !== PUSH_SW_MESSAGE.navigate) return
      if (event.data.url) navigate(event.data.url)
    }

    navigator.serviceWorker.addEventListener('message', handler)
    return () => navigator.serviceWorker.removeEventListener('message', handler)
  }, [navigate])

  return null
}
