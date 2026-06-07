import type { ImgHTMLAttributes } from 'react'

type LazyImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  /** Varsayılan: lazy — viewport dışındaki görseller ertelenir */
  eager?: boolean
}

/** loading=lazy + decoding=async — CLS için width/height prop'u geçirin */
export function LazyImage({ eager = false, loading, decoding = 'async', alt = '', ...props }: LazyImageProps) {
  return (
    <img
      loading={loading ?? (eager ? 'eager' : 'lazy')}
      decoding={decoding}
      alt={alt}
      {...props}
    />
  )
}
