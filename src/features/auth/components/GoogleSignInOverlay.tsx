import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FAKE_PORTRAIT_MALE } from '../../../shared/fakePortraits'

export type GoogleAccount = {
  displayName: string
  email: string
  avatarUrl: string
}

const DEFAULT_ACCOUNT: GoogleAccount = {
  displayName: 'Emirhan',
  email: 'emirhan@gmail.com',
  avatarUrl: FAKE_PORTRAIT_MALE,
}

type Phase = 'accounts' | 'loading' | 'success'

type GoogleSignInOverlayProps = {
  open: boolean
  onClose: () => void
  onComplete: (account: GoogleAccount) => void
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

export function GoogleSignInOverlay({ open, onClose, onComplete }: GoogleSignInOverlayProps) {
  const [phase, setPhase] = useState<Phase>('accounts')
  const onCompleteRef = useRef(onComplete)
  const account = DEFAULT_ACCOUNT

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (!open) {
      setPhase('accounts')
      return
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (phase !== 'loading') return
    const signTimer = window.setTimeout(() => setPhase('success'), 1400)
    return () => window.clearTimeout(signTimer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'success') return
    const doneTimer = window.setTimeout(() => {
      onCompleteRef.current(DEFAULT_ACCOUNT)
    }, 2400)
    return () => window.clearTimeout(doneTimer)
  }, [phase])

  const handleContinue = () => setPhase('loading')

  if (typeof window === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="pm-google-auth__backdrop"
            aria-label="Kapat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={phase === 'accounts' ? onClose : undefined}
          />
          <div className="pm-google-auth__viewport">
            <motion.section
              className="pm-google-auth__card"
              role="dialog"
              aria-modal="true"
              aria-labelledby="pm-google-auth-title"
              initial={{ opacity: 0, y: 28, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
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
                    <img src={account.avatarUrl} alt="" className="pm-google-auth__avatar" />
                    <span className="pm-google-auth__account-text">
                      <strong>{account.displayName}</strong>
                      <small>{account.email}</small>
                    </span>
                    <span className="pm-google-auth__account-check" aria-hidden />
                  </button>

                  <button type="button" className="pm-google-auth__continue" onClick={handleContinue}>
                    Devam et
                  </button>
                  <button type="button" className="pm-google-auth__cancel" onClick={onClose}>
                    İptal
                  </button>
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
                <motion.div
                  className="pm-google-auth__status pm-google-auth__status--success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', damping: 18, stiffness: 280 }}
                >
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
                  <p className="pm-google-auth__status-title">Hoş geldin, {account.displayName}!</p>
                  <p className="pm-google-auth__status-sub">Profilini oluşturmaya başlıyoruz…</p>
                </motion.div>
              ) : null}
            </motion.section>
          </div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
