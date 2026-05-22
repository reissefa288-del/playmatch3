import { useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

export type LightboxPhoto = {
  id: string
  objectPosition: string
}

type PhotoLightboxProps = {
  open: boolean
  onClose: () => void
  imageSrc: string
  photos: LightboxPhoto[]
  index: number
  onIndexChange: (index: number) => void
}

export function PhotoLightbox({
  open,
  onClose,
  imageSrc,
  photos,
  index,
  onIndexChange,
}: PhotoLightboxProps) {
  const reduceMotion = useReducedMotion()
  const count = photos.length
  const current = photos[index] ?? photos[0]

  const go = useCallback(
    (delta: number) => {
      if (count < 2) return
      onIndexChange(Math.max(0, Math.min(count - 1, index + delta)))
    },
    [count, index, onIndexChange],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') go(-1)
      if (event.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, go])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && current ? (
        <motion.div
          className="pm-photo-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Fotoğraf büyütme"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="pm-photo-lightbox__backdrop"
            aria-label="Kapat"
            onClick={onClose}
          />

          <motion.div
            className="pm-photo-lightbox__frame"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <div className="pm-photo-lightbox__top">
              <span>
                {index + 1} / {count}
              </span>
              <button type="button" className="pm-photo-lightbox__close" onClick={onClose} aria-label="Kapat">
                <FiX aria-hidden />
              </button>
            </div>

            <div className="pm-photo-lightbox__stage">
              <motion.img
                key={current.id}
                src={imageSrc}
                alt=""
                className="pm-photo-lightbox__img"
                style={{ objectPosition: current.objectPosition }}
                draggable={false}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
              />

              {count > 1 ? (
                <>
                  <button
                    type="button"
                    className="pm-photo-lightbox__tap pm-photo-lightbox__tap--prev"
                    aria-label="Önceki fotoğraf"
                    onClick={() => go(-1)}
                    disabled={index === 0}
                  />
                  <button
                    type="button"
                    className="pm-photo-lightbox__tap pm-photo-lightbox__tap--next"
                    aria-label="Sonraki fotoğraf"
                    onClick={() => go(1)}
                    disabled={index >= count - 1}
                  />
                  <button
                    type="button"
                    className="pm-photo-lightbox__nav pm-photo-lightbox__nav--prev"
                    onClick={() => go(-1)}
                    disabled={index === 0}
                    aria-label="Önceki"
                  >
                    <FiChevronLeft aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="pm-photo-lightbox__nav pm-photo-lightbox__nav--next"
                    onClick={() => go(1)}
                    disabled={index >= count - 1}
                    aria-label="Sonraki"
                  >
                    <FiChevronRight aria-hidden />
                  </button>
                </>
              ) : null}
            </div>

            <div className="pm-photo-lightbox__dots">
              {photos.map((photo, i) => (
                <button
                  key={photo.id}
                  type="button"
                  className={i === index ? 'is-active' : ''}
                  onClick={() => onIndexChange(i)}
                  aria-label={`${i + 1}. fotoğraf`}
                  aria-current={i === index ? 'true' : undefined}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
