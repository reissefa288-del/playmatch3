import { createDevGoogleSession, persistDevAuthSession, readDevAuthSession } from './authSession'
import { shouldDevAutoRegisteredHome } from './previewDevAuth'
import { adoptDevAuthSession } from './useAuthSession'
import { setGemBalance } from '../currency/gemBalanceStore'
import { seedDevPreviewCompleteProfile } from '../profile/userProfileStore'

/** @deprecated use shouldDevAutoRegisteredHome */
export function shouldDevPreviewJumpToHome(): boolean {
  return shouldDevAutoRegisteredHome()
}

/** Demo oturum + onboarding tamam → `/` (yalnızca DEV). */
export function ensureDevAutoHomeSession(): void {
  if (!shouldDevAutoRegisteredHome()) return

  let session = readDevAuthSession()
  if (!session) {
    session = createDevGoogleSession({
      displayName: 'Dev Oyuncu',
      email: 'dev@playmeet.local',
      avatarUrl: '',
    })
    persistDevAuthSession(session)
  }
  adoptDevAuthSession(session)
  seedDevPreviewCompleteProfile(session.uid, session.email)
  setGemBalance(0)
}

export const ensureDevPreviewHomeReady = ensureDevAutoHomeSession
