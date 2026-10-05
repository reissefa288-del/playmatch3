import type { Plugin, Rollup } from 'vite'

type LinkAttrs = Record<string, string | undefined>

function link(attrs: LinkAttrs) {
  const parts = Object.entries(attrs)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => (value === '' ? key : `${key}="${value}"`))
  return `<link ${parts.join(' ')} />`
}

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

function modulepreload(href: string): LinkAttrs {
  return { rel: 'modulepreload', crossorigin: '', href: `/${href}` }
}

function stylePreload(href: string): LinkAttrs {
  return { rel: 'preload', as: 'style', href: `/${href}` }
}

function imagePreload(href: string): LinkAttrs | null {
  const base = basename(href)
  const type = base.endsWith('.avif')
    ? 'image/avif'
    : base.endsWith('.webp')
      ? 'image/webp'
      : null
  if (!type) return null
  return {
    rel: 'preload',
    as: 'image',
    type,
    href: `/${href}`,
    fetchpriority: 'high',
  }
}

function buildRouteLinks(files: string[], specs: Array<{ js?: RegExp; css?: RegExp; images?: RegExp[] }>) {
  const links: LinkAttrs[] = []
  for (const spec of specs) {
    if (spec.js) {
      const js = findAsset(files, spec.js, '.js')
      if (js) links.push(modulepreload(js))
    }
    if (spec.css) {
      const css = findAsset(files, spec.css, '.css')
      if (css) links.push(stylePreload(css))
    }
    if (spec.images) {
      for (const pattern of spec.images) {
        const asset = files.find((fileName) => pattern.test(basename(fileName)))
        if (asset) {
          const preload = imagePreload(asset)
          if (preload) links.push(preload)
        }
      }
    }
  }
  return links
}

function appendLinkLines(links: LinkAttrs[]) {
  return links
    .map((attrs) => {
      const parts = Object.entries(attrs).map(([key, value]) =>
        value === '' ? `${key}:""` : `${key}:"${value}"`,
      )
      return `l({${parts.join(',')}});`
    })
    .join('')
}

function routeBootstrapScript(homeLinks: LinkAttrs[], routes: Array<{ test: string; links: LinkAttrs[] }>) {
  const branches = routes.map(({ test, links }) => `${test}{${appendLinkLines(links)}}`).join('else ')
  return `<script id="pm-route-preloads">(function(){var h=document.head;function l(s){var e=document.createElement("link"),k;for(k in s)s[k]===""?e.setAttribute(k,""):e.setAttribute(k,s[k]);h.appendChild(e)}var p=location.pathname.replace(/\\/$/,"")||"/";if(p==="/"||p==="/nearby"){${appendLinkLines(homeLinks)}}else ${branches}})();</script>`
}

/** Faz B + P4 — route-aware critical preloads from bundle output */
export function injectCriticalPreloads(): Plugin {
  return {
    name: 'inject-critical-preloads',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html

        const bundle = ctx.bundle
        const files = Object.keys(bundle)

        const portraitAvif = smallestAsset(bundle, files, /^k.z-.*\.avif$/i)
        const malePortraitAvif = smallestAsset(bundle, files, /^erkek-.*\.avif$/i)
        const oyunAvif = smallestAsset(bundle, files, /^oyun-.*\.avif$/i)
        const interFont = files.find(
          (fileName) =>
            fileName.endsWith('.woff2') && basename(fileName).includes('inter-latin-ext-400-normal'),
        )

        const gamesImages = [oyunAvif].filter(Boolean) as string[]
        const kasaWebp = files.find(
          (fileName) => fileName.endsWith('.webp') && basename(fileName).startsWith('kasa-'),
        )

        const portraitAvifPattern = portraitAvif
          ? [new RegExp(`^${basename(portraitAvif).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)]
          : []
        const malePortraitAvifPattern = malePortraitAvif
          ? [new RegExp(`^${basename(malePortraitAvif).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)]
          : []
        const gamesImagePatterns = gamesImages.map((fileName) =>
          new RegExp(`^${basename(fileName).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
        )

        const homeLinks = [
          ...buildRouteLinks(files, [{ images: portraitAvifPattern }]),
          ...buildRouteLinks(files, [{ js: /^home-shell-/, css: /^home-shell-/ }]),
        ]
        const matchLinks = [
          ...buildRouteLinks(files, [{ images: portraitAvifPattern }]),
          ...buildRouteLinks(files, [{ js: /^match-shell-/, css: /^match-shell-/ }]),
        ]
        const gamesLinks = [
          ...buildRouteLinks(files, [{ images: gamesImagePatterns }]),
          ...buildRouteLinks(files, [{ js: /^games-shell-/, css: /^games-shell-/ }]),
        ]
        const chatLinks = buildRouteLinks(files, [{ js: /^ChatScreen-/, css: /^ChatScreen-/ }])
        const profileLinks = [
          ...buildRouteLinks(files, [{ images: malePortraitAvifPattern }]),
          ...buildRouteLinks(files, [{ js: /^profile-shell-/, css: /^profile-shell-/ }]),
        ]
        const premiumLinks = buildRouteLinks(files, [
          { js: /^PremiumScreen-/, css: /^PremiumScreen-/ },
          ...(kasaWebp
            ? [{ images: [new RegExp(`^${basename(kasaWebp).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)] }]
            : []),
        ])

        const bootstrap = routeBootstrapScript(homeLinks, [
          { test: 'if(/^\\/games(\\/|$)/.test(p))', links: gamesLinks },
          { test: 'if(p==="/match")', links: matchLinks },
          { test: 'if(/^\\/chat(\\/|$)/.test(p))', links: chatLinks },
          { test: 'if(p==="/profile")', links: profileLinks },
          { test: 'if(p==="/premium")', links: premiumLinks },
        ])

        const fontTag = interFont
          ? link({
              rel: 'preload',
              as: 'font',
              type: 'font/woff2',
              href: `/${interFont}`,
              crossorigin: '',
            })
          : ''

        let output = html
        let moduleScript = ''

        output = output.replace(/\n?\s*<script type="module"[^>]*><\/script>\s*/i, (match) => {
          moduleScript = match.trim()
          return '\n'
        })

        // P0: game CSS/modules must not block index on every route.
        output = output.replace(
          /^\s*<link rel="(?:modulepreload|stylesheet)"[^>]*\/game-(?:1942|block|xox)-[^>]*>\s*\n/gm,
          '',
        )
        // P1/P7: tab-scoped CSS — preload via route bootstrap only.
        output = output.replace(/^\s*<link rel="stylesheet"[^>]*\/(?:games-shell|profile-shell|match-shell)-[^>]*>\s*\n/gm, '')

        // P4: tab chunks/images only via route bootstrap — strip global hoists.
        output = output.replace(
          /^\s*<link rel="modulepreload"[^>]*\/(?:games-shell|profile-shell|match-shell|GamesScreenBody|home-shell|HomeScreenBody|HomeScreen|MatchScreen|ChatScreen|ProfileScreen|PremiumScreen|QuickMatchScreen)-[^>]*>\s*\n/gm,
          '',
        )
        output = output.replace(
          /^\s*<link rel="preload" as="style"[^>]*\/(?:games-shell|profile-shell|match-shell|GamesScreen|home-shell|HomeScreenBody|HomeScreen|MatchScreen|ChatScreen|ProfileScreen|PremiumScreen|QuickMatchScreen)-[^>]*>\s*\n/gm,
          '',
        )
        output = output.replace(/^\s*<link rel="preload" as="image"[^>]*>\s*\n/gm, '')

        const earlyHead = [bootstrap, fontTag].filter(Boolean).join('\n    ')
        output = output.replace('</style>', `</style>\n    ${earlyHead}`)

        if (!moduleScript) return output
        return output.replace('</head>', `    ${moduleScript}\n  </head>`)
      },
    },
  }
}
