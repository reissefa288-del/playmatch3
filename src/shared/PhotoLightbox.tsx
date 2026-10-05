import { useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi'
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
    <>
      {open && current ? (
        <div
          className="pm-photo-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Fotoğraf büyütme"
         
         
         
        >
          <button
            type="button"
            className="pm-photo-lightbox__backdrop"
            aria-label="Kapat"
            onClick={onClose}
          />

          <div
            className="pm-photo-lightbox__frame"
           
           
           
           
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
              <img
                key={current.id}
                src={imageSrc}
                alt=""
                className="pm-photo-lightbox__img"
                style={{ objectPosition: current.objectPosition }}
                draggable={false}
               
               
               
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
          </div>
        </div>
      ) : null}
    </>,
    document.body,
  )
}
