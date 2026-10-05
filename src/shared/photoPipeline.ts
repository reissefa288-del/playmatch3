/** P12 — thumb/full/blur photo sets; CDN-ready for future API payloads. */

export type PhotoFormatSources = {
  webp: string
  avif?: string
}

export type PhotoSet = {
  thumb: PhotoFormatSources
  full: PhotoFormatSources
  /** Tiny LQIP — opt/blur/*.webp or API blurUrl */
  blur?: string
}

export type ApiPhotoPayload = {
  id: string
  thumbUrl: string
  fullUrl: string
  blurUrl?: string
  avifThumbUrl?: string
  avifFullUrl?: string
}

const DEFAULT_THUMB_WIDTH = 480
const DEFAULT_FULL_WIDTH = 960

/** Optional edge CDN — e.g. VITE_CDN_BASE_URL=https://cdn.playmeet.example */
export function cdnUrl(path: string): string {
  if (!path || path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path
  }
  const raw = import.meta.env.VITE_CDN_BASE_URL
  if (typeof raw !== 'string' || raw.length === 0) return path
  const base = raw.replace(/\/$/, '')
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

function formatSrcSetEntry(url: string, width: number) {
  return `${cdnUrl(url)} ${width}w`
}

/** Build responsive srcset strings for `<source srcSet>` (AVIF + WebP). */
export function photoSetSrcSets(
  photo: PhotoSet,
  thumbWidth = DEFAULT_THUMB_WIDTH,
  fullWidth = DEFAULT_FULL_WIDTH,
) {
  const webpSrcSet = [
    formatSrcSetEntry(photo.thumb.webp, thumbWidth),
    formatSrcSetEntry(photo.full.webp, fullWidth),
  ].join(', ')

  const avifThumb = photo.thumb.avif
  const avifFull = photo.full.avif
  const avifSrcSet =
    avifThumb && avifFull
      ? [formatSrcSetEntry(avifThumb, thumbWidth), formatSrcSetEntry(avifFull, fullWidth)].join(', ')
      : undefined

  return {
    webpSrcSet,
    avifSrcSet,
    defaultSrc: cdnUrl(photo.thumb.webp),
    blurSrc: photo.blur ? cdnUrl(photo.blur) : undefined,
  }
}

/** Map CDN/API JSON to local PhotoSet (demo → production swap). */
export function photoSetFromApi(payload: ApiPhotoPayload, cdnBase?: string): PhotoSet {
  const resolve = (value: string) => {
    if (cdnBase && !value.startsWith('http')) {
      const base = cdnBase.replace(/\/$/, '')
      return `${base}${value.startsWith('/') ? value : `/${value}`}`
    }
    return cdnUrl(value)
  }

  return {
    thumb: {
      webp: resolve(payload.thumbUrl),
      avif: payload.avifThumbUrl ? resolve(payload.avifThumbUrl) : undefined,
    },
    full: {
      webp: resolve(payload.fullUrl),
      avif: payload.avifFullUrl ? resolve(payload.avifFullUrl) : undefined,
    },
    blur: payload.blurUrl ? resolve(payload.blurUrl) : undefined,
  }
}

export function photoSetFromPair(
  thumb: PhotoFormatSources,
  full: PhotoFormatSources,
  blur?: string,
): PhotoSet {
  return { thumb, full, blur }
}
