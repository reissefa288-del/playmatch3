import erkekPortraitAvif from '../../reference/opt/thumb/erkek.avif'
import erkekPortraitWebp from '../../reference/opt/thumb/erkek.webp'

/** P7 — tiny LCP payload for Profile hero (avoids fakePortraits graph on critical path) */
export const profileLcpPortrait = {
  avif: erkekPortraitAvif,
  webp: erkekPortraitWebp,
} as const
