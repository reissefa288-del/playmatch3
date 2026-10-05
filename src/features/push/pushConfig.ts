/** ADIM 9.1 — FCM / Web Push yapılandırma */

export function isPushConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_FIREBASE_VAPID_KEY &&
      import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID &&
      import.meta.env.VITE_FIREBASE_API_KEY &&
      import.meta.env.VITE_FIREBASE_APP_ID,
  )
}

export const PUSH_SW_MESSAGE = {
  navigate: 'push-navigate',
} as const

export type PushNavigateMessage = {
  type: typeof PUSH_SW_MESSAGE.navigate
  url: string
}

export function chatPushUrl(partnerUid: string): string {
  return `/chat/${partnerUid}`
}

export function matchPushUrl(): string {
  return '/match'
}
