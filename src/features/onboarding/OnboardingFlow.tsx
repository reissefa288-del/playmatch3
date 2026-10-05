import '../../styles/onboarding.css'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ChangeEvent } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { FiArrowLeft, FiArrowRight, FiCamera, FiCheck } from 'react-icons/fi'
import { OnboardingAmbient } from './components/OnboardingAmbient'
import { OnboardingStepHero } from './components/OnboardingStepHero'
import { useAuthSession } from '../auth/useAuthSession'
import {
  createEmptyProfile,
  MATCH_PREFERENCE_OPTIONS,
  ONBOARDING_INTERESTS,
  REQUIRED_INTEREST_COUNT,
  syncMatchFiltersFromOnboarding,
  type MatchPreference,
  type UserProfile,
} from './onboardingProfile'
import { BIO_SUGGESTIONS, INTEREST_EMOJI, ONBOARDING_STEPS } from './onboardingSteps'
import { useUserProfile } from './useUserProfile'

const MAX_PHOTO_SIDE = 2600
const MAX_PHOTO_PIXELS = 4_000_000

export function OnboardingFlow() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const forceRestart = searchParams.get('restart') === '1'
  const { session, isAuthenticated } = useAuthSession()
  const {
    profile,
    isOnboardingComplete,
    isProfileLoading,
    isProfileSaving,
    profileError,
    completeOnboarding,
    resetProfile,
  } = useUserProfile()
  const [stepIndex, setStepIndex] = useState(0)
  const [draft, setDraft] = useState<UserProfile>(() => ({
    ...profile,
    name: profile.name || session?.displayName || '',
    photoUrl: profile.photoUrl || session?.avatarUrl || '',
  }))
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const restarted = useRef(false)

  const step = ONBOARDING_STEPS[stepIndex]
  const progress = ((stepIndex + 1) / ONBOARDING_STEPS.length) * 100

  useLayoutEffect(() => {
    if (!forceRestart || restarted.current) return
    restarted.current = true
    void resetProfile().then(() => {
      setStepIndex(0)
      setDraft({
        ...createEmptyProfile(),
        name: session?.displayName || '',
        photoUrl: session?.avatarUrl || '',
        photoUrls: session?.avatarUrl ? [session.avatarUrl, '', ''] : ['', '', ''],
      })
    })
  }, [forceRestart, resetProfile, session?.avatarUrl, session?.displayName])

  useEffect(() => {
    if (session?.displayName && !draft.name) {
      setDraft((d) => ({ ...d, name: session.displayName }))
    }
    if (session?.avatarUrl && !draft.photoUrl) {
      setDraft((d) => ({ ...d, photoUrl: session.avatarUrl }))
    }
  }, [session, draft.name, draft.photoUrl])

  const patch = useCallback((partial: Partial<UserProfile>) => {
    setDraft((d) => ({ ...d, ...partial }))
    setError(null)
  }, [])

  const validateStep = useCallback((): string | null => {
    switch (step.id) {
      case 'name':
        if (draft.name.trim().length < 2) return 'Lütfen en az 2 karakterlik bir ad gir.'
        return null
      case 'age':
        if (draft.age < 18 || draft.age > 99) return '18–99 arası bir yaş girmelisin.'
        return null
      case 'match':
        if (!draft.matchPreference) return 'Bir eşleşme tercihi seç.'
        return null
      case 'photo':
        if (!draft.photoUrl) return 'En az bir fotoğraf ekle veya Google fotoğrafını kullan.'
        return null
      case 'interests':
        if (draft.interests.length !== REQUIRED_INTEREST_COUNT) {
          return `Tam ${REQUIRED_INTEREST_COUNT} ilgi alanı seçmelisin.`
        }
        return null
      case 'bio':
        if (draft.bio.trim().length < 10) return 'Hakkında en az 10 karakter yaz.'
        if (draft.bio.length > 300) return 'Hakkında en fazla 300 karakter olabilir.'
        return null
      default:
        return null
    }
  }, [draft, step.id])

  const goNext = useCallback(async () => {
    const message = validateStep()
    if (message) {
      setError(message)
      return
    }
    if (stepIndex < ONBOARDING_STEPS.length - 1) {
      setStepIndex((i) => i + 1)
      setError(null)
      return
    }
    try {
      await completeOnboarding({
        ...draft,
        name: draft.name.trim(),
        bio: draft.bio.trim(),
        email: session?.email ?? draft.email,
      })
      syncMatchFiltersFromOnboarding(draft.matchPreference)
      navigate('/', { replace: true })
    } catch {
      setError(profileError ?? 'Profil kaydedilemedi. İnternet bağlantını kontrol edip tekrar dene.')
    }
  }, [completeOnboarding, draft, navigate, profileError, session?.email, stepIndex, validateStep])

  const goBack = useCallback(() => {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1)
      setError(null)
    }
  }, [stepIndex])

  const toggleInterest = useCallback((tag: string) => {
    setDraft((d) => {
      const has = d.interests.includes(tag)
      if (has) {
        return { ...d, interests: d.interests.filter((t) => t !== tag) }
      }
      if (d.interests.length >= REQUIRED_INTEREST_COUNT) {
        return d
      }
      return { ...d, interests: [...d.interests, tag] }
    })
    setError(null)
  }, [])

  const readImageSize = (file: File) =>
    new Promise<{ width: number; height: number }>((resolve, reject) => {
      const tempUrl = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        const { naturalWidth: width, naturalHeight: height } = img
        URL.revokeObjectURL(tempUrl)
        resolve({ width, height })
      }
      img.onerror = () => {
        URL.revokeObjectURL(tempUrl)
        reject(new Error('invalid'))
      }
      img.src = tempUrl
    })

  const onPhotoSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const { width, height } = await readImageSize(file)
      if (width > MAX_PHOTO_SIDE || height > MAX_PHOTO_SIDE || width * height > MAX_PHOTO_PIXELS) {
        setError(`Fotoğraf çok büyük. En fazla ${MAX_PHOTO_SIDE}px ve 4MP.`)
        event.target.value = ''
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        patch({ photoUrl: reader.result as string })
      }
      reader.readAsDataURL(file)
    } catch {
      setError('Fotoğraf okunamadı.')
    }
    event.target.value = ''
  }

  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />
  }

  if (isProfileLoading) {
    return null
  }

  if (isOnboardingComplete && !forceRestart) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="pm-onboard-shell">
      <OnboardingAmbient />

      <div className="pm-onboard-frame">
        <header className="pm-onboard-top">
          <div className="pm-onboard-brand">
            <span className="pm-onboard-brand__play">Play</span>
            <span className="pm-onboard-brand__meet">Meet</span>
          </div>
          <p className="pm-onboard-brand__tag">Profilini oluştur</p>
        </header>

        <header className="pm-onboard-header">
          {stepIndex > 0 ? (
            <button type="button" className="pm-onboard-back" aria-label="Geri" onClick={goBack}>
              <FiArrowLeft aria-hidden />
            </button>
          ) : (
            <span className="pm-onboard-back pm-onboard-back--ghost" aria-hidden />
          )}
          <div className="pm-onboard-progress" aria-hidden>
            <span className="pm-onboard-progress__fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="pm-onboard-step-count">
            {stepIndex + 1}/{ONBOARDING_STEPS.length}
          </span>
        </header>

        <div className="pm-onboard-dots" aria-hidden>
          {ONBOARDING_STEPS.map((s, i) => (
            <span key={s.id} className={`pm-onboard-dot${i <= stepIndex ? ' is-active' : ''}${i === stepIndex ? ' is-current' : ''}`} />
          ))}
        </div>

        <>
          <div
            key={step.id}
            className="pm-onboard-body"
           
           
           
           
          >
            <OnboardingStepHero step={step} />

            <h1>{step.title}</h1>
            <p className="pm-onboard-subtitle">{step.subtitle}</p>
            <p className="pm-onboard-tip">{step.tip}</p>

            {step.id === 'name' ? (
              <input
                className="pm-onboard-input"
                type="text"
                value={draft.name}
                placeholder="Adın"
                maxLength={32}
                autoFocus
                onChange={(e) => patch({ name: e.target.value })}
              />
            ) : null}

            {step.id === 'age' ? (
              <div className="pm-onboard-age">
                <input
                  className="pm-onboard-input pm-onboard-input--center"
                  type="number"
                  min={18}
                  max={99}
                  value={draft.age}
                  autoFocus
                  onChange={(e) => patch({ age: Number(e.target.value) || 18 })}
                />
                <input
                  className="pm-onboard-range"
                  type="range"
                  min={18}
                  max={60}
                  value={Math.min(draft.age, 60)}
                  onChange={(e) => patch({ age: Number(e.target.value) })}
                />
              </div>
            ) : null}

            {step.id === 'match' ? (
              <div className="pm-onboard-options">
                {MATCH_PREFERENCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`pm-onboard-option${draft.matchPreference === opt.id ? ' is-selected' : ''}`}
                    onClick={() => patch({ matchPreference: opt.id as MatchPreference })}
                  >
                    <strong>{opt.label}</strong>
                    <span>{opt.hint}</span>
                    {draft.matchPreference === opt.id ? <FiCheck className="pm-onboard-option__check" aria-hidden /> : null}
                  </button>
                ))}
              </div>
            ) : null}

            {step.id === 'photo' ? (
              <div className="pm-onboard-photo">
                <button
                  type="button"
                  className="pm-onboard-photo__preview"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {draft.photoUrl ? (
                    <img src={draft.photoUrl} alt="" />
                  ) : (
                    <FiCamera aria-hidden />
                  )}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onPhotoSelected} />
                <button type="button" className="pm-onboard-photo__btn" onClick={() => fileInputRef.current?.click()}>
                  Galeriden seç
                </button>
                {session?.avatarUrl ? (
                  <button
                    type="button"
                    className="pm-onboard-photo__link"
                    onClick={() => patch({ photoUrl: session.avatarUrl })}
                  >
                    Google fotoğrafını kullan
                  </button>
                ) : null}
              </div>
            ) : null}

            {step.id === 'interests' ? (
              <>
                <p className="pm-onboard-tag-count">
                  {draft.interests.length}/{REQUIRED_INTEREST_COUNT} seçildi · zorunlu
                </p>
                <div className="pm-onboard-tags">
                  {ONBOARDING_INTERESTS.map((tag) => {
                    const selected = draft.interests.includes(tag)
                    const limitReached =
                      !selected && draft.interests.length >= REQUIRED_INTEREST_COUNT
                    return (
                      <button
                        key={tag}
                        type="button"
                        className={`pm-onboard-tag${selected ? ' is-selected' : ''}${limitReached ? ' is-disabled' : ''}`}
                        onClick={() => toggleInterest(tag)}
                        disabled={limitReached}
                      >
                        {INTEREST_EMOJI[tag] ? `${INTEREST_EMOJI[tag]} ` : ''}
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </>
            ) : null}

            {step.id === 'bio' ? (
              <>
                <textarea
                  className="pm-onboard-textarea"
                  value={draft.bio}
                  placeholder="Oyun tarzın, hobilerin, ne aradığın…"
                  maxLength={300}
                  rows={4}
                  autoFocus
                  onChange={(e) => patch({ bio: e.target.value })}
                />
                <p className="pm-onboard-char-count">{draft.bio.length}/300</p>
                <div className="pm-onboard-bio-suggestions">
                  {BIO_SUGGESTIONS.map((text) => (
                    <button key={text} type="button" className="pm-onboard-bio-chip" onClick={() => patch({ bio: text })}>
                      {text}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {error ? (
              <p className="pm-onboard-error" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        </>

        <footer className="pm-onboard-footer">
          <button
            type="button"
            className="pm-onboard-next"
            onClick={() => void goNext()}
            disabled={isProfileSaving}
          >
            {isProfileSaving
              ? 'Kaydediliyor…'
              : stepIndex === ONBOARDING_STEPS.length - 1
                ? 'PlayMeet\'e Başla'
                : 'Devam et'}
            <FiArrowRight aria-hidden />
          </button>
        </footer>
      </div>
    </div>
  )
}
