import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiChevronLeft, FiChevronRight, FiMapPin, FiX } from 'react-icons/fi'
import { MdVerified } from 'react-icons/md'
import { PiCrownSimpleFill } from 'react-icons/pi'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

type ProfilePreviewSheetProps = {
  open: boolean
  onClose: () => void
  photos: string[]
  name: string
  location: string
  isPremium?: boolean
  verified?: boolean
}

export function ProfilePreviewSheet({
  open,
  onClose,
  photos,
  name,
  location,
  isPremium = true,
  verified = true,
}: ProfilePreviewSheetProps) {
  const reduceMotion = useReducedMotion()
  const count = photos.length
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!open) return
    setIndex(0)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1))
      if (event.key === 'ArrowRight') setIndex((i) => Math.min(count - 1, i + 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, count, onClose])

  const go = useCallback(
    (delta: number) => {
      if (count < 2) return
      setIndex((i) => {
        const next = i + delta
        if (next < 0 || next >= count) return i
        return next
      })
    },
    [count],
  )

  const onTapZone = (side: 'prev' | 'next') => {
    if (side === 'prev') go(-1)
    else go(1)
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && count > 0 ? (
        <motion.div
          className="pm-profile-preview"
          role="dialog"
          aria-modal="true"
          aria-label="Profil önizlemesi"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="pm-profile-preview__backdrop"
            aria-label="Önizlemeyi kapat"
            onClick={onClose}
          />

          <motion.div
            className="pm-profile-preview__sheet"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
          >
            <div className="pm-profile-preview__photo">
              <img
                key={photos[index]}
                src={photos[index]}
                alt=""
                className="pm-profile-preview__img"
                draggable={false}
              />
              <div className="pm-profile-preview__shade" aria-hidden />

              <div className="pm-profile-preview__top">
                <div className="pm-profile-preview__dots" aria-hidden>
                  {photos.map((_, i) => (
                    <span key={i} className={i === index ? 'is-active' : ''} />
                  ))}
                </div>
                <button
                  type="button"
                  className="pm-profile-preview__close"
                  onClick={onClose}
                  aria-label="Kapat"
                >
                  <FiX aria-hidden />
                </button>
              </div>

              {count > 1 ? (
                <>
                  <button
                    type="button"
                    className="pm-profile-preview__tap pm-profile-preview__tap--prev"
                    aria-label="Önceki fotoğraf"
                    onClick={() => onTapZone('prev')}
                    disabled={index === 0}
                  />
                  <button
                    type="button"
                    className="pm-profile-preview__tap pm-profile-preview__tap--next"
                    aria-label="Sonraki fotoğraf"
                    onClick={() => onTapZone('next')}
                    disabled={index >= count - 1}
                  />
                  <button
                    type="button"
                    className="pm-profile-preview__nav pm-profile-preview__nav--prev"
                    onClick={() => go(-1)}
                    disabled={index === 0}
                    aria-label="Önceki"
                  >
                    <FiChevronLeft aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="pm-profile-preview__nav pm-profile-preview__nav--next"
                    onClick={() => go(1)}
                    disabled={index >= count - 1}
                    aria-label="Sonraki"
                  >
                    <FiChevronRight aria-hidden />
                  </button>
                </>
              ) : null}

              <div className="pm-profile-preview__meta">
                <p className="pm-profile-preview__hint">Başkaları böyle görüyor</p>
                <h2>
                  {name}
                  {verified ? <MdVerified aria-label="Doğrulanmış" /> : null}
                </h2>
                {isPremium ? (
                  <p className="pm-profile-premium-chip pm-profile-premium-chip--sheet">
                    <PiCrownSimpleFill aria-hidden />
                    Premium Üye
                  </p>
                ) : null}
                <p className="pm-profile-location">
                  <FiMapPin aria-hidden />
                  {location}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
