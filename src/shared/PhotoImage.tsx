import { useMemo, useState, type ImgHTMLAttributes } from 'react'
import { LazyImage } from './LazyImage'
import { photoSetSrcSets, type PhotoSet } from './photoPipeline'
import './photo-image.css'

type PhotoImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  photo: PhotoSet
  eager?: boolean
  priority?: boolean
  /** Responsive pick — thumb for cards, full for hero/lightbox widths */
  sizes?: string
  wrapperClassName?: string
}

/** P12 — AVIF/WebP srcset + optional blur placeholder until full decode. */
export function PhotoImage({
  photo,
  eager,
  priority,
  sizes = '(max-width: 640px) 480px, 960px',
  wrapperClassName,
  className,
  alt = '',
  onLoad,
  ...props
}: PhotoImageProps) {
  const { webpSrcSet, avifSrcSet, defaultSrc, blurSrc } = useMemo(() => photoSetSrcSets(photo), [photo])
  const [loaded, setLoaded] = useState(false)

  const picture = (
    <picture>
      {avifSrcSet ? <source srcSet={avifSrcSet} sizes={sizes} type="image/avif" /> : null}
      <source srcSet={webpSrcSet} sizes={sizes} type="image/webp" />
      <LazyImage
        src={defaultSrc}
        eager={eager}
        priority={priority}
        alt={alt}
        className={[blurSrc ? 'pm-photo__img' : null, className].filter(Boolean).join(' ')}
        onLoad={(event) => {
          setLoaded(true)
          onLoad?.(event)
        }}
        {...props}
      />
    </picture>
  )

  if (!blurSrc) return picture

  return (
    <span
      className={['pm-photo', loaded ? 'is-loaded' : '', wrapperClassName].filter(Boolean).join(' ')}
      style={{ backgroundImage: `url(${blurSrc})` }}
    >
      {picture}
    </span>
  )
}
