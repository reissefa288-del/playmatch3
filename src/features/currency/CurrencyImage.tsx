import type { ImgHTMLAttributes } from 'react'

/** Currency UI-only img helper — tab-currency chunk stays off game-block critical path. */
export function CurrencyImage({
  alt = '',
  loading = 'lazy',
  decoding = 'async',
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return <img loading={loading} decoding={decoding} alt={alt} {...props} />
}
