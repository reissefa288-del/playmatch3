import { createDevGoogleSession, persistDevAuthSession, readDevAuthSession } from './authSession'
import { shouldDevAutoRegisteredHome, shouldGuestAutoHome } from './previewDevAuth'
import { adoptDevAuthSession } from './useAuthSession'
import { setGemBalance } from '../currency/gemBalanceStore'
import { seedDevPreviewCompleteProfile } from '../profile/userProfileStore'

/** @deprecated use shouldDevAutoRegisteredHome */
export function shouldDevPreviewJumpToHome(): boolean {
  return shouldDevAutoRegisteredHome()
}

/** Misafir / demo oturum + onboarding tamam → `/`. */
export function ensureDevAutoHomeSession(): void {
  if (!shouldDevAutoRegisteredHome()) return

  const guest = shouldGuestAutoHome()
  let session = readDevAuthSession()
  if (!session) {
    session = createDevGoogleSession({
      displayName: guest ? 'Oyuncu' : 'Dev Oyuncu',
      email: guest ? 'guest@playmeet.local' : 'dev@playmeet.local',
      avatarUrl: '',
    })
    persistDevAuthSession(session)
  }
  adoptDevAuthSession(session)
  seedDevPreviewCompleteProfile(session.uid, session.email, {
    name: guest ? 'Oyuncu' : 'Dev Önizleme',
    bio: guest ? '' : 'Cursor preview geliştirme oturumu',
  })
  setGemBalance(0)
}

export const ensureDevPreviewHomeReady = ensureDevAutoHomeSession
