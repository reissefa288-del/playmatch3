import { useEffect, useRef, useState, type CSSProperties, type ChangeEvent } from 'react'
import { motion } from 'framer-motion'
import { FiEye, FiMapPin, FiSettings } from 'react-icons/fi'
import { MdVerified } from 'react-icons/md'
import { PiCrownSimpleFill } from 'react-icons/pi'
import { AmbientParticles } from '../home/components/AmbientParticles'
import { Navbar } from '../home/components/Navbar'
import { ProfileInsightIcon } from './components/ProfileInsightIcon'
import { ProfileLevelCard } from './components/ProfileLevelCard'
import { ProfileTraitIcon, type ProfileTraitIconKind } from './components/ProfileTraitIcon'
import { ProfilePreviewSheet } from './components/ProfilePreviewSheet'
import {
  ProfileStatStripIcon,
  type ProfileStatIconKind,
} from './components/ProfileStatStripIcon'
import profileReference from '../../reference/profile-final.png'
import { FAKE_PORTRAIT_MALE } from '../../shared/fakePortraits'

const quickStats: {
  id: ProfileStatIconKind
  value: string
  label: string
}[] = [
  { id: 'friends', value: '245', label: 'Arkadaş' },
  { id: 'likes', value: '1.2K', label: 'Beğeni' },
  { id: 'visits', value: '312', label: 'Ziyaretçi' },
  { id: 'matches', value: '98', label: 'Ortak Match' },
]

const traits: { id: ProfileTraitIconKind; label: string; value: string }[] = [
  { id: 'role', label: 'Favori Rol', value: 'Rusher' },
  { id: 'style', label: 'Oyun Tarzı', value: 'Rekabetçi' },
  { id: 'time', label: 'Aktif Zaman', value: 'Gece Kuşu' },
  { id: 'duo', label: 'Duo Arıyor', value: 'Evet' },
]

const aboutTags = ['Gamer', 'Müzik', 'Seyahat', 'Film', 'Spor']
const PHOTO_SLOT_COUNT = 3
const MAX_PHOTO_SIDE = 2600
const MAX_PHOTO_PIXELS = 4_000_000

export function ProfileScreen() {
  const [photos, setPhotos] = useState<(string | null)[]>([FAKE_PORTRAIT_MALE, null, null])
  const [uploadedUrls, setUploadedUrls] = useState<(string | null)[]>([null, null, null])
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const portraitSrc = photos[0] ?? FAKE_PORTRAIT_MALE
  const previewPhotos = photos.filter((photo): photo is string => photo != null)

  useEffect(() => {
    return () => {
      uploadedUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url)
      })
    }
  }, [uploadedUrls])

  const togglePhotoEditor = () => {
    setIsEditorOpen((prev) => !prev)
    setPhotoError(null)
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

    const nextUrl = URL.createObjectURL(file)

    setUploadedUrls((prev) => {
      const next = [...prev]
      if (next[slot]) URL.revokeObjectURL(next[slot] as string)
      next[slot] = nextUrl
      return next
    })
    setPhotos((prev) => {
      const next = [...prev]
      next[slot] = nextUrl
      return next
    })
    setPhotoError(null)
    event.target.value = ''
  }

  const profileVars = {
    '--pm-profile-reference': `url(${profileReference})`,
  } as CSSProperties

  return (
    <motion.div
      className="pm-app-shell pm-app-shell--profile"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div className="pm-artboard">
        <AmbientParticles />
        <main className="pm-profile" style={profileVars}>
          <Navbar />
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
              <img
                src={portraitSrc}
                alt=""
                className="pm-profile-hero-card__portrait"
                draggable={false}
              />
              <div className="pm-profile-hero-card__shade" aria-hidden />
              <div className="pm-profile-hero-card__content">
                <div className="pm-profile-hero-card__meta">
                  <h1>
                    Emirhan <MdVerified aria-label="Doğrulanmış" />
                  </h1>
                  <p className="pm-profile-premium-chip">
                    <PiCrownSimpleFill aria-hidden />
                    Premium Üye
                  </p>
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
                    {photo ? <img src={photo} alt="" draggable={false} /> : <span>+ Fotoğraf Ekle</span>}
                    <i>{slot === 0 ? 'Ana Fotoğraf' : `${slot + 1}. Fotoğraf`}</i>
                  </button>
                ))}
              </div>
              {photoError ? <p className="pm-profile-photo-editor__error">{photoError}</p> : null}
            </section>
          ) : null}

          <section className="pm-profile-stat-strip" aria-label="Profil istatistikleri">
            {quickStats.map((item) => (
              <article key={item.id} className="pm-profile-stat-strip__item">
                <ProfileStatStripIcon kind={item.id} />
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </section>

          <ProfileLevelCard />

          <section className="pm-profile-traits" aria-label="Profil ozellikleri">
            {traits.map((trait) => (
              <article key={trait.id} className="pm-profile-traits__item" data-trait={trait.id}>
                <ProfileTraitIcon kind={trait.id} />
                <p>{trait.label}</p>
                <strong>{trait.value}</strong>
              </article>
            ))}
          </section>

          <section className="pm-profile-about" aria-label="Hakkımda">
            <h2>Hakkımda</h2>
            <p>
              <span aria-hidden>“</span> Oyun sadece bir hobi değil, bir yaşam tarzı. Gerçek bağlantılar, güzel anlar
              yaratır. <span aria-hidden>🎮✨</span>
            </p>
            <div className="pm-profile-about__tags">
              {aboutTags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </section>

          <section className="pm-profile-insights" aria-label="Beğeni ve ziyaret">
            <article className="pm-profile-insight-card is-likes">
              <p className="pm-profile-insight-card__title">
                <ProfileInsightIcon kind="likes" variant="title" />
                Beğenilerim
              </p>
              <strong>1.2K</strong>
              <span>Toplam beğeni</span>
              <ProfileInsightIcon kind="likes" variant="decor" />
            </article>
            <article className="pm-profile-insight-card is-visits">
              <p className="pm-profile-insight-card__title">
                <ProfileInsightIcon kind="visits" variant="title" />
                Ziyaretçilerim
              </p>
              <strong>312</strong>
              <span>Profil ziyareti</span>
              <ProfileInsightIcon kind="visits" variant="decor" />
            </article>
          </section>
        </main>
      </motion.div>

      <ProfilePreviewSheet
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        photos={previewPhotos}
        name="Emirhan"
        location="İstanbul, Türkiye"
        isPremium
        verified
      />
    </motion.div>
  )
}
