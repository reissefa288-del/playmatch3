import '../../styles/profile-bundle.css'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiEye, FiLogOut, FiMapPin, FiSettings, FiTrash2 } from 'react-icons/fi'
import { DeleteAccountFlow } from '../moderation/components/ModerationFlow'
import { useAuthSession } from '../auth/useAuthSession'
import { MdVerified } from 'react-icons/md'
import { PiCrownSimpleFill } from 'react-icons/pi'
import { Navbar } from '../home/components/Navbar'
import { AmbientParticles } from '../home/components/AmbientParticles'
import { LazyImage } from '../../shared/LazyImage'
import { PictureImage } from '../../shared/PictureImage'
import { FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'
import { ProfileInsightIcon } from './components/ProfileInsightIcon'
import { ProfileLevelCard } from './components/ProfileLevelCard'
import { ProfilePreviewSheet } from './components/ProfilePreviewSheet'
import { ProfileStatStripIcon } from './components/ProfileStatStripIcon'
import { useProfileStats } from './ProfileStatsProvider'
import { usePremiumSubscriptionState } from '../premium/usePremiumSubscription'
import { useUserProfile } from '../onboarding/useUserProfile'
import { normalizePhotoUrls } from './profilePhotoStorage'
import { INTEREST_EMOJI } from '../onboarding/onboardingSteps'
import { REQUIRED_INTEREST_COUNT } from '../onboarding/onboardingProfile'
import { profileLcpPortrait } from './profileLcpPortrait'

const aboutFallback =
  'Oyun sadece bir hobi değil, bir yaşam tarzı. Gerçek bağlantılar, güzel anlar yaratır. 🎮✨'

const PHOTO_SLOT_COUNT = 3
const MAX_PHOTO_SIDE = 2600
const MAX_PHOTO_PIXELS = 4_000_000

function isDefaultDemoPortrait(src: string) {
  return src === FAKE_PORTRAIT_MALE || src === profileLcpPortrait.webp
}

/** Full profile chrome */
export function ProfileScreenBody() {
  const { statStrip, likesFormatted, visitsFormatted } = useProfileStats()
  const navigate = useNavigate()
  const { signOut } = useAuthSession()
  const { profile, isProfileSaving, updatePhotoSlot } = useUserProfile()
  const { active: isPremiumActive } = usePremiumSubscriptionState()
  const [signingOut, setSigningOut] = useState(false)
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
  const profileInterests = profile.interests.slice(0, REQUIRED_INTEREST_COUNT)
  const interestSlots = Array.from({ length: REQUIRED_INTEREST_COUNT }, (_, index) => profileInterests[index] ?? null)
  const aboutText = profile.bio.trim() || aboutFallback
  const displayName = profile.name.trim() || 'Oyuncu'
  const profilePhotos = normalizePhotoUrls(profile.photoUrl, profile.photoUrls)
  const primaryPhoto = profilePhotos[0]?.trim() || null

  const [photos, setPhotos] = useState<(string | null)[]>(() =>
    profilePhotos.map((url, index) => url || (index === 0 ? FAKE_PORTRAIT_MALE : null)),
  )
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const portraitSrc = photos[0] ?? primaryPhoto ?? FAKE_PORTRAIT_MALE
  const previewPhotos = photos.filter((photo): photo is string => photo != null)
  const useLcpPortrait = isDefaultDemoPortrait(portraitSrc)

  useEffect(() => {
    const slots = normalizePhotoUrls(profile.photoUrl, profile.photoUrls)
    setPhotos(slots.map((url, index) => url || (index === 0 ? FAKE_PORTRAIT_MALE : null)))
  }, [profile.photoUrl, profile.photoUrls])

  const togglePhotoEditor = () => {
    setIsEditorOpen((prev) => !prev)
    setPhotoError(null)
  }

  const handleSignOut = async () => {
    if (signingOut) return
    setSigningOut(true)
    try {
      await signOut()
      navigate('/welcome', { replace: true })
    } finally {
      setSigningOut(false)
    }
  }

  const triggerSlotPicker = (slot: number) => {
    fileInputRefs.current[slot]?.click()
  }

  const readImageSize = (file: File) =>
    new Promise<{ width: number; height: number }>((resolve, reject) => {
      const tempUrl = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        const width = img.naturalWidth
        const height = img.naturalHeight
        URL.revokeObjectURL(tempUrl)
        resolve({ width, height })
      }
      img.onerror = () => {
        URL.revokeObjectURL(tempUrl)
        reject(new Error('invalid_image'))
      }
      img.src = tempUrl
    })

  const onPhotoSelected = async (slot: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const { width, height } = await readImageSize(file)
      if (width > MAX_PHOTO_SIDE || height > MAX_PHOTO_SIDE || width * height > MAX_PHOTO_PIXELS) {
        setPhotoError(
          `Fotoğraf çok büyük. En fazla ${MAX_PHOTO_SIDE}x${MAX_PHOTO_SIDE} ve 4MP kabul ediliyor.`,
        )
        event.target.value = ''
        return
      }
    } catch {
      setPhotoError('Fotoğraf okunamadı. Başka bir dosya deneyin.')
      event.target.value = ''
      return
    }

    try {
      const updated = await updatePhotoSlot(slot, file)
      const nextPhotos = normalizePhotoUrls(updated.photoUrl, updated.photoUrls)
      setPhotos(nextPhotos.map((url, index) => url || (index === 0 ? FAKE_PORTRAIT_MALE : null)))
      setPhotoError(null)
    } catch {
      setPhotoError('Fotoğraf yüklenemedi. Lütfen tekrar dene.')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <>
      <Navbar />
      <AmbientParticles />
      {Array.from({ length: PHOTO_SLOT_COUNT }, (_, slot) => (
          <input
            key={`profile-photo-input-${slot}`}
            ref={(node) => {
              fileInputRefs.current[slot] = node
            }}
            type="file"
            accept="image/*"
            className="pm-profile-file-input"
            onChange={(event) => {
              void onPhotoSelected(slot, event)
            }}
          />
        ))}

        <section className="pm-profile-hero-card" aria-label="Profil kartı">
          <div className="pm-profile-hero-card__stage">
            {useLcpPortrait ? (
              <PictureImage
                webp={profileLcpPortrait.webp}
                avif={profileLcpPortrait.avif}
                alt=""
                className="pm-profile-hero-card__portrait"
                draggable={false}
                width={390}
                height={520}
                priority
              />
            ) : (
              <LazyImage
                src={portraitSrc}
                alt=""
                className="pm-profile-hero-card__portrait"
                draggable={false}
                width={390}
                height={520}
                priority
              />
            )}
            <div className="pm-profile-hero-card__shade" aria-hidden />
            <div className="pm-profile-hero-card__content">
              <div className="pm-profile-hero-card__meta">
                <h1>
                  {displayName} <MdVerified aria-label="Doğrulanmış" />
                </h1>
                {isPremiumActive ? (
                  <p className="pm-profile-premium-chip">
                    <PiCrownSimpleFill aria-hidden />
                    Premium Üye
                  </p>
                ) : null}
                <p className="pm-profile-location">
                  <FiMapPin aria-hidden />
                  İstanbul, Türkiye
                </p>
              </div>

              <div className="pm-profile-hero-actions">
                <button
                  type="button"
                  className="pm-profile-hero-actions__preview"
                  onClick={() => setIsPreviewOpen(true)}
                  disabled={previewPhotos.length === 0}
                >
                  <FiEye aria-hidden />
                  Profili Gör
                </button>
                <button type="button" onClick={togglePhotoEditor}>
                  <FiSettings aria-hidden />
                  Düzenle
                </button>
              </div>
            </div>
          </div>
        </section>

        {isEditorOpen ? (
          <section className="pm-profile-photo-editor" aria-label="Profil fotoğraf alanları">
            <p className="pm-profile-photo-editor__title">Profil Fotoğrafları (3)</p>
            <div className="pm-profile-photo-editor__grid">
              {photos.map((photo, slot) => (
                <button
                  key={`profile-slot-${slot}`}
                  type="button"
                  className="pm-profile-photo-slot"
                  onClick={() => triggerSlotPicker(slot)}
                  aria-label={`${slot + 1}. fotoğrafı yükle`}
                >
                  {photo ? (
                    <LazyImage src={photo} alt="" draggable={false} width={120} height={120} />
                  ) : (
                    <span>+ Fotoğraf Ekle</span>
                  )}
                  <i>{slot === 0 ? 'Ana Fotoğraf' : `${slot + 1}. Fotoğraf`}</i>
                </button>
              ))}
            </div>
            {photoError ? <p className="pm-profile-photo-editor__error">{photoError}</p> : null}
            {isProfileSaving ? (
              <p className="pm-profile-photo-editor__error">Fotoğraf yükleniyor…</p>
            ) : null}
          </section>
        ) : null}

        <section className="pm-profile-stat-strip" aria-label="Profil istatistikleri">
          {statStrip.map((item) => (
            <article key={item.id} className="pm-profile-stat-strip__item">
              <ProfileStatStripIcon kind={item.id} />
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </section>

        <ProfileLevelCard />

        <section className="pm-profile-traits pm-profile-traits--interests" aria-label="İlgi alanları">
          {interestSlots.map((tag, index) => (
            <article
              key={tag ?? `empty-${index}`}
              className={`pm-profile-traits__item${tag ? '' : ' is-empty'}`}
            >
              <span className="pm-profile-interest-icon" aria-hidden>
                {tag ? INTEREST_EMOJI[tag] ?? '•' : '—'}
              </span>
              <strong>{tag ?? 'Seçilmedi'}</strong>
            </article>
          ))}
        </section>

        <section className="pm-profile-about" aria-label="Hakkımda">
          <h2>Hakkımda</h2>
          <p>
            <span aria-hidden>“</span> {aboutText} <span aria-hidden>”</span>
          </p>
        </section>

        <section className="pm-profile-insights" aria-label="Beğeni ve ziyaret">
          <article className="pm-profile-insight-card is-likes">
            <div className="pm-profile-insight-card__content">
              <p className="pm-profile-insight-card__title">Beğenilerim</p>
              <strong>{likesFormatted}</strong>
              <span className="pm-profile-insight-card__meta">Gönderilen beğeni</span>
            </div>
            <ProfileInsightIcon kind="likes" />
          </article>
          <article className="pm-profile-insight-card is-visits">
            <div className="pm-profile-insight-card__content">
              <p className="pm-profile-insight-card__title">Ziyaretçilerim</p>
              <strong>{visitsFormatted}</strong>
              <span className="pm-profile-insight-card__meta">Profil ziyareti</span>
            </div>
            <ProfileInsightIcon kind="visits" />
          </article>
        </section>

        <section className="pm-profile-account" aria-label="Hesap">
          <button
            type="button"
            className="pm-profile-account__signout"
            onClick={() => void handleSignOut()}
            disabled={signingOut}
          >
            <FiLogOut aria-hidden />
            {signingOut ? 'Çıkış yapılıyor…' : 'Çıkış Yap'}
          </button>
          <button
            type="button"
            className="pm-profile-account__delete"
            onClick={() => setDeleteAccountOpen(true)}
            disabled={signingOut}
          >
            <FiTrash2 aria-hidden />
            Hesabımı Sil
          </button>
        </section>

      <DeleteAccountFlow
        open={deleteAccountOpen}
        onClose={() => setDeleteAccountOpen(false)}
        onDeleted={() => {
          setDeleteAccountOpen(false)
          navigate('/welcome', { replace: true })
        }}
      />

      <ProfilePreviewSheet
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        photos={previewPhotos}
        name={displayName}
        location="İstanbul, Türkiye"
        isPremium={isPremiumActive}
        verified
      />
    </>
  )
}
