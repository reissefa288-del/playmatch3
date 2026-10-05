import type { Rollup } from 'vite'

function basename(fileName: string) {
  return fileName.split('/').pop() ?? fileName
}

function assetBytes(bundle: Record<string, Rollup.OutputAsset | Rollup.OutputChunk>, fileName: string) {
  const item = bundle[fileName]
  if (!item || item.type !== 'asset') return Number.POSITIVE_INFINITY
  const source = item.source
  if (typeof source === 'string') return source.length
  return source.byteLength
}

function smallestAsset(
  bundle: Record<string, Rollup.OutputAsset | Rollup.OutputChunk>,
  files: string[],
  pattern: RegExp,
) {
  return files
    .filter((fileName) => pattern.test(basename(fileName)))
    .sort((a, b) => assetBytes(bundle, a) - assetBytes(bundle, b))[0]
}

function findAsset(files: string[], pattern: RegExp, ext: string) {
  return files.find((fileName) => fileName.endsWith(ext) && pattern.test(basename(fileName)))
}

function toUrl(fileName: string) {
  return fileName.startsWith('/') ? fileName : `/${fileName}`
}

/** P11 — shell + tab LCP assets for service-worker precache (second-visit warm start). */
export function buildPrecacheUrls(bundle: Record<string, Rollup.OutputAsset | Rollup.OutputChunk>) {
  const files = Object.keys(bundle)
  const urls = new Set<string>(['/index.html', '/manifest.webmanifest'])

  const chunkPatterns = [
    /^index-/,
    /^rolldown-runtime-/,
    /^app-providers-/,
    /^app-shell-/,
    /^shared-ui-/,
    /^vendor-react-/,
    /^home-shell-/,
    /^games-shell-/,
    /^match-shell-/,
    /^profile-shell-/,
    /^HomeTabEntry-/,
    /^GamesTabEntry-/,
    /^MatchScreen-/,
    /^ProfileScreen-/,
    /^latin-ext-400-/,
    /^latin-ext-700-/,
  ]

  for (const fileName of files) {
    const base = basename(fileName)
    if (base.endsWith('.js') || base.endsWith('.css')) {
      if (chunkPatterns.some((pattern) => pattern.test(base))) {
        urls.add(toUrl(fileName))
      }
    }
  }

  const indexCss = findAsset(files, /^index-/, '.css')
  if (indexCss) urls.add(toUrl(indexCss))

  const interFont = files.find(
    (fileName) =>
      fileName.endsWith('.woff2') && basename(fileName).includes('inter-latin-ext-400-normal'),
  )
  if (interFont) urls.add(toUrl(interFont))

  const portraitAvif = smallestAsset(bundle, files, /^k.z-.*\.avif$/i)
  const malePortraitAvif = smallestAsset(bundle, files, /^erkek-.*\.avif$/i)
  const oyunAvif = smallestAsset(bundle, files, /^oyun-.*\.avif$/i)

  for (const asset of [portraitAvif, malePortraitAvif, oyunAvif]) {
    if (asset) urls.add(toUrl(asset))
  }

  return [...urls].sort()
}

export function precacheBuildId(bundle: Record<string, Rollup.OutputAsset | Rollup.OutputChunk>) {
  const indexJs = Object.keys(bundle).find((fileName) => /^index-.*\.js$/.test(basename(fileName)))
  return indexJs?.match(/index-([^.]+)\.js$/)?.[1] ?? 'dev'
}
