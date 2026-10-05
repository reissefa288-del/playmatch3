import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { LazyImage } from '../../../shared/LazyImage'
import { createDevGoogleSession, mapFirebaseUserToSession, persistDevAuthSession } from '../authSession'
import { isFirebaseConfigured } from '../firebaseApp'
import { isPreviewDevAuth, preferLocalDevPersistence } from '../previewDevAuth'
import { GoogleSignInError, signInWithGoogle, signInWithGooglePopupReliable } from '../firebaseAuth'
import { shouldUseGoogleRedirectSignIn } from '../androidTwa'
import { adoptDevAuthSession } from '../useAuthSession'

export type GoogleAccount = {
  displayName: string
  email: string
  avatarUrl: string
}

type Phase = 'accounts' | 'loading' | 'success'

type GoogleSignInOverlayProps = {
  open: boolean
  onClose: () => void
  onComplete: (account: GoogleAccount) => void
  onError?: (message: string) => void
}

function GoogleLogo() {
  return (
    <svg className="pm-google-auth__logo" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.56 2.95-2.26 5.48-4.78 7.18l7.73 6.01c4.51-4.18 7.09-10.36 7.09-17.66z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6.01c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

export function GoogleSignInOverlay({ open, onClose, onComplete, onError }: GoogleSignInOverlayProps) {
  const [phase, setPhase] = useState<Phase>('accounts')
  const [account, setAccount] = useState<GoogleAccount | null>(null)
  const onCompleteRef = useRef(onComplete)
  const onErrorRef = useRef(onError)
  const signingInRef = useRef(false)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    if (!open) {
      setPhase('accounts')
      setAccount(null)
      signingInRef.current = false
      return
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (phase !== 'success' || !account) return
    const doneTimer = window.setTimeout(() => {
      onCompleteRef.current(account)
    }, 2400)
    return () => window.clearTimeout(doneTimer)
  }, [phase, account])

  const handleContinue = async () => {
    if (signingInRef.current) return
    signingInRef.current = true
    setPhase('loading')

    try {
      if (preferLocalDevPersistence()) {
        if (!import.meta.env.DEV) {
          throw new GoogleSignInError(
            'not-configured',
            'Firebase yapılandırması eksik. npm run firebase:init-env ile .env oluştur.',
          )
        }

        await new Promise((resolve) => window.setTimeout(resolve, 650))
        const devSession = createDevGoogleSession({
          displayName: isPreviewDevAuth() ? 'Önizleme Oyuncu' : 'Google Oyuncu',
          email: isPreviewDevAuth() ? 'preview@playmeet.local' : 'dev@playmeet.local',
          avatarUrl: '',
        })
        persistDevAuthSession(devSession)
        adoptDevAuthSession(devSession)
        const nextAccount: GoogleAccount = {
          displayName: devSession.displayName,
          email: devSession.email,
          avatarUrl: devSession.avatarUrl,
        }
        setAccount(nextAccount)
        setPhase('success')
        return
      }

      const useRedirect = shouldUseGoogleRedirectSignIn()
      const result = useRedirect
        ? await signInWithGoogle()
        : { mode: 'popup' as const, user: await signInWithGooglePopupReliable() }
      if (result.mode === 'redirect') return

      const session = mapFirebaseUserToSession(result.user)
      const nextAccount: GoogleAccount = {
        displayName: session.displayName,
        email: session.email,
        avatarUrl: session.avatarUrl,
      }
      setAccount(nextAccount)
      setPhase('success')
    } catch (error) {
      signingInRef.current = false
      setPhase('accounts')

      if (error instanceof GoogleSignInError) {
        if (error.code === 'popup-closed' || error.code === 'redirect-cancelled') {
          onClose()
          return
        }
        onErrorRef.current?.(error.message)
        return
      }

      onErrorRef.current?.('Google ile giriş yapılamadı. Lütfen tekrar dene.')
    }
  }

  if (typeof window === 'undefined' || !open) return null

  const successName = account?.displayName ?? 'Oyuncu'

  return createPortal(
    <>
      <button
        type="button"
        className="pm-google-auth__backdrop pm-google-auth__backdrop--enter"
        aria-label="Kapat"
        onClick={phase === 'accounts' ? onClose : undefined}
      />
      <div className="pm-google-auth__viewport">
        <section
          className="pm-google-auth__card pm-google-auth__card--enter"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pm-google-auth-title"
        >
          <div className="pm-google-auth__card-glow" aria-hidden />

          {phase === 'accounts' ? (
            <>
              <header className="pm-google-auth__header">
                <GoogleLogo />
                <h2 id="pm-google-auth-title">Google ile oturum aç</h2>
                <p>
                  <strong>PlayMeet</strong> uygulamasına devam etmek için bir hesap seç
                </p>
              </header>

              <button type="button" className="pm-google-auth__account is-selected">
                <span className="pm-google-auth__avatar pm-google-auth__avatar--placeholder" aria-hidden>
                  <GoogleLogo />
                </span>
                <span className="pm-google-auth__account-text">
                  <strong>Google hesabın</strong>
                  <small>Devam et ile hesap seç</small>
                </span>
                <span className="pm-google-auth__account-check" aria-hidden />
              </button>

              <button type="button" className="pm-google-auth__continue" onClick={() => void handleContinue()}>
                Devam et
              </button>
              <button type="button" className="pm-google-auth__cancel" onClick={onClose}>
                İptal
              </button>
              <p className="pm-google-auth__hint">
                Popup takılırsa <strong>handler</strong> sekmesini kapat; gizli sekme kullanma; Chrome’da
                normal pencerede tekrar dene.
              </p>
            </>
          ) : null}

          {phase === 'loading' ? (
            <div className="pm-google-auth__status">
              <div className="pm-google-auth__spinner">
                <GoogleLogo />
                <span className="pm-google-auth__spinner-ring" />
              </div>
              <p className="pm-google-auth__status-title">Bağlanılıyor…</p>
              <p className="pm-google-auth__status-sub">Google hesabın doğrulanıyor</p>
            </div>
          ) : null}

          {phase === 'success' ? (
            <div className="pm-google-auth__status pm-google-auth__status--success pm-google-auth__status--success-enter">
              {account?.avatarUrl ? (
                <LazyImage
                  src={account.avatarUrl}
                  alt=""
                  className="pm-google-auth__success-avatar"
                  width={56}
                  height={56}
                  eager
                />
              ) : (
                <div className="pm-google-auth__success-icon" aria-hidden>
                  <svg viewBox="0 0 52 52">
                    <circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="3" />
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 27l8 8 16-18"
                    />
                  </svg>
                </div>
              )}
              <p className="pm-google-auth__status-title">Hoş geldin, {successName}!</p>
              <p className="pm-google-auth__status-sub">Profilini oluşturmaya başlıyoruz…</p>
            </div>
          ) : null}
        </section>
      </div>
    </>,
    document.body,
  )
}
