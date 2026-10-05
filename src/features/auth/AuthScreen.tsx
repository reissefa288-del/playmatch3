import '../../styles/google-auth.css'
import '../../styles/auth-aaa.css'
import '../../styles/auth.css'
import '../../styles/legal.css'
import { useCallback, useRef, useState } from 'react'
import { FiChevronRight, FiFileText, FiShield } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import authReference from '../../reference/opt/full/giriş.webp'
import { privacyPolicy } from '../legal/content/privacyPolicy'
import { termsOfService } from '../legal/content/termsOfService'
import { LegalConsentSheet } from '../legal/LegalConsentSheet'
import type { GoogleAccount } from './components/GoogleSignInOverlay'
import { GoogleSignInOverlay } from './components/GoogleSignInOverlay'
import { AuthAmbient } from './components/AuthAmbient'
import { isPreviewDevAuth } from './previewDevAuth'

const HIT = {
  google: { top: '63.29%', left: '10.79%', width: '78.19%', height: '6.45%' },
} as const

type ConsentSheet = 'terms' | 'privacy' | null

export function AuthScreen() {
  const navigate = useNavigate()
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [consentSheet, setConsentSheet] = useState<ConsentSheet>(null)
  const [googleOpen, setGoogleOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | null>(null)

  const canSignIn = termsAccepted && privacyAccepted

  const notify = useCallback((message: string) => {
    setToast(message)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3200)
  }, [])

  const handleGoogleSignIn = useCallback(() => {
    if (!canSignIn) {
      notify('Devam etmek için Kullanım Koşulları ve Gizlilik Politikasını okuyup onaylamalısın.')
      return
    }
    setGoogleOpen(true)
    setToast(null)
  }, [canSignIn, notify])

  const handleGoogleComplete = useCallback(
    (_account: GoogleAccount) => {
      setGoogleOpen(false)
      void (async () => {
        const { isFirebaseConfigured, whenAuthPersistenceReady, getFirebaseAuth } = await import(
          './firebaseApp'
        )
        let uid: string | undefined
        if (isFirebaseConfigured()) {
          await whenAuthPersistenceReady()
          uid = getFirebaseAuth()?.currentUser?.uid
        } else {
          const { readDevAuthSession } = await import('./authSession')
          uid = readDevAuthSession()?.uid
        }
        if (uid && canSignIn) {
          const { persistLegalConsent } = await import('../legal/legalConsent')
          await persistLegalConsent(uid).catch(() => undefined)
        }
        navigate('/onboarding', { replace: true })
      })()
    },
    [canSignIn, navigate],
  )

  const openTerms = useCallback(() => {
    setConsentSheet('terms')
    setToast(null)
  }, [])

  const openPrivacy = useCallback(() => {
    setConsentSheet('privacy')
    setToast(null)
  }, [])

  const closeSheet = useCallback(() => setConsentSheet(null), [])

  const acceptTerms = useCallback(() => {
    setTermsAccepted(true)
    setConsentSheet(null)
    setToast(null)
  }, [])

  const acceptPrivacy = useCallback(() => {
    setPrivacyAccepted(true)
    setConsentSheet(null)
    setToast(null)
  }, [])

  const revokeTerms = useCallback(() => {
    setTermsAccepted(false)
    setConsentSheet(null)
  }, [])

  const revokePrivacy = useCallback(() => {
    setPrivacyAccepted(false)
    setConsentSheet(null)
  }, [])

  return (
    <div className="pm-auth-shell pm-auth-shell--ref">
      <AuthAmbient />

      {isPreviewDevAuth() ? (
        <p className="pm-auth-preview-chip" role="status">
          Cursor önizleme — demo giriş (gerçek Google yok)
        </p>
      ) : null}

      <div className="pm-auth-ref-stage">
        <div className="pm-auth-ref-frame">
          <div className="pm-auth-ref-frame__inner">
            <div className="pm-auth-ref-frame__shine" aria-hidden />
            <img
              src={authReference}
              alt=""
              className="pm-auth-ref-frame__img"
              draggable={false}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              width={390}
              height={844}
            />

            <span className="pm-auth-ref-google-glow" style={hitStyle(HIT.google)} aria-hidden />

            <button
              type="button"
              className="pm-auth-hit pm-auth-hit--google"
              style={hitStyle(HIT.google)}
              aria-label="Google ile giriş yap"
              onClick={handleGoogleSignIn}
            />

            <div className="pm-auth-ref-frame__crop-fade" aria-hidden />
          </div>
        </div>

        <div className="pm-auth-ref-legal-panel">
          <div className="pm-auth-ref-legal-shell">
            <div className="pm-auth-ref-legal-shell__inner">
              <div className="pm-auth-ref-legal-progress" aria-hidden>
                <span className={termsAccepted ? 'is-on' : ''} />
                <span className={privacyAccepted ? 'is-on' : ''} />
              </div>
              <div className="pm-auth-ref-legal">
                <button
                  type="button"
                  className="pm-auth-ref-legal__row"
                  aria-pressed={termsAccepted}
                  aria-label={
                    termsAccepted
                      ? 'Kullanım Koşulları onaylandı, tekrar oku'
                      : 'Kullanım Koşullarını oku ve onayla'
                  }
                  onClick={openTerms}
                >
                  <span
                    className="pm-auth-ref-legal__icon pm-auth-ref-legal__icon--terms"
                    aria-hidden
                  >
                    <FiFileText />
                  </span>
                  <span
                    className={`pm-auth-ref-legal__check${termsAccepted ? ' is-on' : ''}`}
                    aria-hidden
                  />
                  <span className="pm-auth-ref-legal__text">
                    <strong>Kullanım Koşulları</strong>
                    <small>{termsAccepted ? 'Onaylandı' : 'Okumak için dokun'}</small>
                  </span>
                  <FiChevronRight className="pm-auth-ref-legal__chev-icon" aria-hidden />
                </button>
                <button
                  type="button"
                  className="pm-auth-ref-legal__row"
                  aria-pressed={privacyAccepted}
                  aria-label={
                    privacyAccepted
                      ? 'Gizlilik Politikası onaylandı, tekrar oku'
                      : 'Gizlilik Politikasını oku ve onayla'
                  }
                  onClick={openPrivacy}
                >
                  <span
                    className="pm-auth-ref-legal__icon pm-auth-ref-legal__icon--privacy"
                    aria-hidden
                  >
                    <FiShield />
                  </span>
                  <span
                    className={`pm-auth-ref-legal__check${privacyAccepted ? ' is-on' : ''}`}
                    aria-hidden
                  />
                  <span className="pm-auth-ref-legal__text">
                    <strong>Gizlilik Politikası</strong>
                    <small>{privacyAccepted ? 'Onaylandı' : 'Okumak için dokun'}</small>
                  </span>
                  <FiChevronRight className="pm-auth-ref-legal__chev-icon" aria-hidden />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GoogleSignInOverlay
        open={googleOpen}
        onClose={() => setGoogleOpen(false)}
        onComplete={handleGoogleComplete}
        onError={notify}
      />

      <LegalConsentSheet
        open={consentSheet === 'terms'}
        legalDocument={termsOfService}
        accepted={termsAccepted}
        onClose={closeSheet}
        onAccept={acceptTerms}
        onRevoke={revokeTerms}
      />

      <LegalConsentSheet
        open={consentSheet === 'privacy'}
        legalDocument={privacyPolicy}
        accepted={privacyAccepted}
        onClose={closeSheet}
        onAccept={acceptPrivacy}
        onRevoke={revokePrivacy}
      />

      {toast ? (
        <p className="pm-auth-ref-toast is-visible" role="alert">
          {toast}
        </p>
      ) : null}
    </div>
  )
}

function hitStyle(box: { top: string; left: string; width: string; height: string }) {
  return {
    top: box.top,
    left: box.left,
    width: box.width,
    height: box.height,
  } as const
}
