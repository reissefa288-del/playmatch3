/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string
  readonly VITE_FIREBASE_PROJECT_ID?: string
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string
  readonly VITE_FIREBASE_APP_ID?: string
  readonly VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY?: string
  readonly VITE_FIREBASE_APPCHECK_DEBUG_TOKEN?: string
  readonly VITE_PREMIUM_ENABLED?: string
  /** Dev: false = welcome/onboarding test on localhost */
  readonly VITE_DEV_AUTO_HOME?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
