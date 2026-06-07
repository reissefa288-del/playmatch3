import '../../styles/google-auth.css'
import '../../styles/auth-aaa.css'
import '../../styles/auth.css'
import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import authReference from '../../reference/opt/full/giriş.webp'
import { privacyPolicy } from '../legal/content/privacyPolicy'
import { termsOfService } from '../legal/content/termsOfService'
import { LegalConsentSheet } from '../legal/LegalConsentSheet'
import type { GoogleAccount } from './components/GoogleSignInOverlay'
import { GoogleSignInOverlay } from './components/GoogleSignInOverlay'
import { AuthAmbient } from './components/AuthAmbient'
import { useAuthSession } from './useAuthSession'

const HIT = {
  google: { top: '63.29%', left: '10.79%', width: '78.19%', height: '6.45%' },
  terms: { top: '72.83%', left: '11.72%', width: '75.85%', height: '3.90%' },
  privacy: { top: '75.92%', left: '11.72%', width: '74.09%', height: '5.10%' },
  legalTerms: { top: '86.66%', left: '26.49%', width: '23.45%', height: '2.33%' },
  legalPrivacy: { top: '86.77%', left: '56.39%', width: '17.00%', height: '2.22%' },
} as const

type ConsentSheet = 'terms' | 'privacy' | null

export function AuthScreen() {
  const navigate = useNavigate()
  const { signInWithGoogle } = useAuthSession()
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
    (account: GoogleAccount) => {
      signInWithGoogle(account)
      setGoogleOpen(false)
      window.setTimeout(() => {
        navigate('/onboarding', { replace: true })
      }, 0)
    },
    [navigate, signInWithGoogle],
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

      <motion.div
        className="pm-auth-ref-stage"
        initial={{ opacity: 0, y: 36, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="pm-auth-ref-frame">
          <div className="pm-auth-ref-frame__shine" aria-hidden />
          <motion.img
            src={authReference}
            alt=""
            className="pm-auth-ref-frame__img"
            draggable={false}
            loading="eager"
            decoding="async"
            width={390}
            height={844}
            initial={{ scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />

          <span className="pm-auth-ref-google-glow" style={hitStyle(HIT.google)} aria-hidden />

          <motion.span
            className={`pm-auth-ref-check pm-auth-ref-check--terms${termsAccepted ? ' is-on' : ''}`}
            aria-hidden
            animate={termsAccepted ? { scale: [1, 1.25, 1] } : { scale: 1 }}
            transition={{ duration: 0.35 }}
          />
          <motion.span
            className={`pm-auth-ref-check pm-auth-ref-check--privacy${privacyAccepted ? ' is-on' : ''}`}
            aria-hidden
            animate={privacyAccepted ? { scale: [1, 1.25, 1] } : { scale: 1 }}
            transition={{ duration: 0.35 }}
          />

          <button
            type="button"
            className="pm-auth-hit pm-auth-hit--google"
            style={hitStyle(HIT.google)}
            aria-label="Google ile giriş yap"
            onClick={handleGoogleSignIn}
          />

          <button
            type="button"
            className="pm-auth-hit pm-auth-hit--check"
            style={hitStyle(HIT.terms)}
            aria-label="Kullanım koşullarını oku ve onayla"
            aria-pressed={termsAccepted}
            onClick={openTerms}
          />

          <button
            type="button"
            className="pm-auth-hit pm-auth-hit--check"
            style={hitStyle(HIT.privacy)}
            aria-label="Gizlilik politikasını oku ve onayla"
            aria-pressed={privacyAccepted}
            onClick={openPrivacy}
          />

          <button
            type="button"
            className="pm-auth-hit pm-auth-hit--link"
            style={hitStyle(HIT.legalTerms)}
            aria-label="Kullanım koşulları"
            onClick={openTerms}
          />

          <button
            type="button"
            className="pm-auth-hit pm-auth-hit--link"
            style={hitStyle(HIT.legalPrivacy)}
            aria-label="Gizlilik politikası"
            onClick={openPrivacy}
          />
        </div>
      </motion.div>

      <GoogleSignInOverlay
        open={googleOpen}
        onClose={() => setGoogleOpen(false)}
        onComplete={handleGoogleComplete}
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

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: toast ? 1 : 0, y: toast ? 0 : 12 }}
        transition={{ duration: 0.25 }}
        aria-live="polite"
      >
        {toast ? (
          <p className="pm-auth-ref-toast" role="alert">
            {toast}
          </p>
        ) : null}
      </motion.div>
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
