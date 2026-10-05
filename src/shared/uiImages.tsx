import { useLayoutEffect, type ImgHTMLAttributes } from 'react'

type LazyImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  eager?: boolean
  priority?: boolean
}

/** loading=lazy + decoding=async — CLS için width/height prop'u geçirin */
export function LazyImage({
  eager = false,
  priority = false,
  loading,
  decoding,
  fetchPriority,
  alt = '',
  ...props
}: LazyImageProps) {
  const isEager = priority || eager

  return (
    <img
      loading={loading ?? (isEager ? 'eager' : 'lazy')}
      decoding={decoding ?? (priority ? 'sync' : 'async')}
      fetchPriority={fetchPriority ?? (priority ? 'high' : undefined)}
      alt={alt}
      {...props}
    />
  )
}

type PictureImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  webp: string
  avif?: string
  eager?: boolean
  priority?: boolean
}

/** AVIF + WebP fallback — `<picture>` ile tarayıcıya en iyi formatı seçtirir */
export function PictureImage({ webp, avif, eager, priority, alt = '', ...props }: PictureImageProps) {
  if (!avif) {
    return <LazyImage src={webp} eager={eager} priority={priority} alt={alt} {...props} />
  }

  return (
    <picture>
      <source srcSet={avif} type="image/avif" />
      <source srcSet={webp} type="image/webp" />
      <LazyImage src={webp} eager={eager} priority={priority} alt={alt} {...props} />
    </picture>
  )
}

type LcpImagePreloadProps = {
  webp: string
  avif?: string
}

function injectPreload(href: string, type?: string) {
  if (!href) return () => undefined

  const selector = type
    ? `link[rel="preload"][as="image"][type="${type}"][href="${CSS.escape(href)}"]`
    : `link[rel="preload"][as="image"][href="${CSS.escape(href)}"]`
  if (document.head.querySelector(selector)) return () => undefined

  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = href
  link.setAttribute('fetchpriority', 'high')
  if (type) link.type = type
  document.head.appendChild(link)

  return () => {
    link.remove()
  }
}

/** Route LCP görselleri — index.html preload yedek; layout effect ile paint öncesi */
export function LcpImagePreload({ webp, avif }: LcpImagePreloadProps) {
  useLayoutEffect(() => {
    const cleanups = [
      injectPreload(avif ?? webp, avif ? 'image/avif' : undefined),
      ...(avif ? [] : [injectPreload(webp, 'image/webp')]),
    ]
    return () => {
      cleanups.forEach((cleanup) => cleanup())
    }
  }, [avif, webp])

  return null
}
